import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAdminSession,
  createAdminSession,
  parseOrder
} from '../src/server/orderApi.js';

const customer = {
  name: 'Test Customer',
  phone: '+91 98420 12345',
  address: '12 Test Street',
  city: 'Erode',
  pincode: '638056',
  notes: ''
};

test('order totals and product details are derived from the server catalogue', () => {
  const order = parseOrder({
    customer,
    items: [{
      id: 'desktop-buddy-main',
      title: 'Forged title',
      variant: 'Cyber Orange',
      quantity: 2,
      unitPrice: 1
    }]
  });

  assert.equal(order.subtotal, 1500);
  assert.equal(order.deliveryFee, 0);
  assert.equal(order.total, 1500);
  assert.equal(order.items[0].title, 'Desktop Buddy / pre-order.');
  assert.equal(order.items[0].unitPrice, 750);
});

test('order validation rejects unknown products and invalid pincodes', () => {
  assert.throws(
    () => parseOrder({
      customer,
      items: [{ id: 'unknown-product', variant: 'Cyber Orange', quantity: 1 }]
    }),
    { status: 400 }
  );

  assert.throws(
    () => parseOrder({
      customer: { ...customer, pincode: '123' },
      items: [{ id: 'desktop-buddy-main', variant: 'Cyber Orange', quantity: 1 }]
    }),
    { status: 400 }
  );
});

test('admin session signatures reject tampering', (t) => {
  const previous = {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    DATABASE_URL: process.env.DATABASE_URL
  };
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  process.env.ADMIN_USERNAME = 'test-admin';
  process.env.ADMIN_PASSWORD = 'test-password-not-used';
  process.env.ADMIN_SESSION_SECRET = 'test-session-secret-with-more-than-32-characters';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';

  const token = createAdminSession('test-admin');
  assert.equal(
    getAdminSession({ headers: { cookie: `desktop_buddy_admin=${token}` } }).username,
    'test-admin'
  );
  assert.equal(
    getAdminSession({ headers: { cookie: `desktop_buddy_admin=${token}x` } }),
    null
  );
});
