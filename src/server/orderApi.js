import { neon } from '@neondatabase/serverless';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = 'desktop_buddy_admin';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
let cachedSql;
let cachedDatabaseUrl;
let schemaPromise;

export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

const PRODUCTS = {
  'desktop-buddy-main': {
    title: 'YUYK / pre-order.',
    type: 'Tactile Desktop Pet',
    price: 750
  },
  'desktop-buddy-expressions': {
    title: 'YUYK / Expressive Edition.',
    type: 'Desktop Pet · 4 Animated Moods',
    price: 750
  }
};

const VARIANTS = new Set([
  'Cyber Orange',
  'Cosmonaut Blue',
  'Chunky Red',
  'Ivory Cream'
]);

const PROMO_CODES = new Set(['SPELLBUDDY', 'DESKTOPBUDDY']);

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }
  if (!cachedSql || cachedDatabaseUrl !== databaseUrl) {
    cachedSql = neon(databaseUrl);
    cachedDatabaseUrl = databaseUrl;
    schemaPromise = undefined;
  }
  return cachedSql;
}

export function ensureSchema(sql) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS desktop_buddy_orders (
          id UUID PRIMARY KEY,
          customer_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          address TEXT NOT NULL,
          city TEXT NOT NULL,
          pincode TEXT NOT NULL,
          customer_notes TEXT NOT NULL DEFAULT '',
          items JSONB NOT NULL,
          subtotal INTEGER NOT NULL,
          delivery_fee INTEGER NOT NULL,
          total INTEGER NOT NULL,
          promo_code TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'new'
            CHECK (status IN ('new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
          admin_note TEXT NOT NULL DEFAULT '',
          payment_method TEXT NOT NULL DEFAULT 'whatsapp',
          payment_status TEXT NOT NULL DEFAULT 'pending',
          razorpay_order_id TEXT,
          razorpay_payment_id TEXT,
          razorpay_signature TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        ALTER TABLE desktop_buddy_orders
        ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'whatsapp',
        ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
        ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
        ADD COLUMN IF NOT EXISTS razorpay_signature TEXT
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS desktop_buddy_orders_created_at_idx
        ON desktop_buddy_orders (created_at DESC)
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS desktop_buddy_admin_login_attempts (
          ip_hash TEXT NOT NULL,
          attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS desktop_buddy_login_attempts_idx
        ON desktop_buddy_admin_login_attempts (ip_hash, attempted_at DESC)
      `;
    })();
  }
  return schemaPromise.catch((error) => {
    schemaPromise = undefined;
    throw error;
  });
}

function requiredText(value, label, maxLength) {
  if (typeof value !== 'string') {
    throw new ApiError(400, `${label} is required.`);
  }
  const clean = value.trim();
  if (!clean || clean.length > maxLength) {
    throw new ApiError(400, `${label} must be between 1 and ${maxLength} characters.`);
  }
  return clean;
}

export function parseOrder(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Invalid order details.');
  }

  const customer = body.customer;
  if (!customer || typeof customer !== 'object' || Array.isArray(customer)) {
    throw new ApiError(400, 'Customer details are required.');
  }

  const name = requiredText(customer.name, 'Name', 100);
  const phone = requiredText(customer.phone, 'Phone number', 24);
  const address = requiredText(customer.address, 'Address', 300);
  const city = requiredText(customer.city, 'City', 100);
  const pincode = requiredText(customer.pincode, 'Pincode', 6);
  const notes = typeof customer.notes === 'string' ? customer.notes.trim().slice(0, 500) : '';

  if (!/^[+()\d\s-]{7,24}$/.test(phone)) {
    throw new ApiError(400, 'Enter a valid phone number.');
  }
  if (!/^\d{6}$/.test(pincode)) {
    throw new ApiError(400, 'Enter a valid 6-digit pincode.');
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) {
    throw new ApiError(400, 'An order must contain between 1 and 20 item types.');
  }

  const items = body.items.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new ApiError(400, 'Invalid order item.');
    }
    const product = PRODUCTS[item.id];
    if (!product || !VARIANTS.has(item.variant)) {
      throw new ApiError(400, 'The order contains an unavailable product or colour.');
    }
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 25) {
      throw new ApiError(400, 'Item quantities must be between 1 and 25.');
    }
    return {
      id: item.id,
      title: product.title,
      type: product.type,
      variant: item.variant,
      quantity,
      unitPrice: product.price
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const requestedPromo = typeof body.promoCode === 'string' ? body.promoCode.trim().toUpperCase() : '';
  const promoCode = PROMO_CODES.has(requestedPromo) ? requestedPromo : '';
  const deliveryFee = promoCode || subtotal >= 1000 ? 0 : 50;

  return {
    id: randomUUID(),
    customer: { name, phone, address, city, pincode, notes },
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    promoCode
  };
}

export function verifyAdminConfiguration() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_SESSION_SECRET || !process.env.DATABASE_URL) {
    throw new Error('Admin credentials, session secret, and database URL must be configured.');
  }
  if (ADMIN_SESSION_SECRET.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters long.');
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }
}

export function constantTimeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const leftDigest = createHash('sha256').update(left).digest();
  const rightDigest = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new ApiError(503, 'Razorpay payments are not configured yet. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  return { keyId, keySecret };
}

export async function createRazorpayOrder({ order, keyId, keySecret }) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`
    },
    body: JSON.stringify({
      amount: Math.round(order.total * 100), // paise
      currency: 'INR',
      receipt: String(order.id).slice(0, 40),
      notes: {
        orderId: String(order.id),
        customerName: order.customer.name,
        phone: order.customer.phone
      }
    })
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error('Razorpay API error:', data);
    const desc = data?.error?.description || 'Failed to initialize payment with Razorpay.';
    throw new ApiError(response.status >= 500 ? 503 : 400, desc);
  }
  return data;
}

export function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const { keySecret } = getRazorpayCredentials();
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = createHmac('sha256', keySecret).update(payload).digest('hex');
  return constantTimeEqual(generatedSignature, razorpaySignature);
}

export function verifyAdminCredentials(username, password) {
  verifyAdminConfiguration();
  const usernameMatches = constantTimeEqual(username, process.env.ADMIN_USERNAME);
  const passwordMatches = constantTimeEqual(password, process.env.ADMIN_PASSWORD);
  return usernameMatches && passwordMatches;
}

function sessionSecret() {
  verifyAdminConfiguration();
  return process.env.ADMIN_SESSION_SECRET;
}

export function createAdminSession(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function getAdminSession(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;

  const token = cookie.slice(SESSION_COOKIE.length + 1);
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = createHmac('sha256', sessionSecret()).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof session.username !== 'string' || session.expiresAt <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setAdminCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${SESSION_TTL_SECONDS}${secure}`
  );
}

export function clearAdminCookie(res) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0${secure}`
  );
}

export function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;

  const forwardedHost = req.headers['x-forwarded-host'];
  const host = (forwardedHost || req.headers.host || '').split(',')[0].trim().toLowerCase();
  try {
    return new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

export function getClientIpHash(req) {
  const secret = sessionSecret();
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (forwarded || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  return createHmac('sha256', secret).update(ip).digest('hex');
}

export function toClientOrder(row) {
  return {
    id: row.id,
    customer: {
      name: row.customer_name,
      phone: row.phone,
      address: row.address,
      city: row.city,
      pincode: row.pincode,
      notes: row.customer_notes
    },
    items: row.items,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    promoCode: row.promo_code,
    status: row.status,
    adminNote: row.admin_note,
    paymentMethod: row.payment_method || 'whatsapp',
    paymentStatus: row.payment_status || 'pending',
    razorpayOrderId: row.razorpay_order_id || null,
    razorpayPaymentId: row.razorpay_payment_id || null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}
