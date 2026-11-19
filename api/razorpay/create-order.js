import {
  ApiError,
  createRazorpayOrder,
  ensureSchema,
  getDatabase,
  getRazorpayCredentials,
  isSameOrigin,
  parseOrder
} from '../../src/server/orderApi.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Cross-origin order requests are not allowed.' });
  }

  let order;
  try {
    order = parseOrder(req.body);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Failed to validate an order request for Razorpay.', error);
    return res.status(500).json({ error: 'The order request could not be validated.' });
  }

  let credentials;
  try {
    credentials = getRazorpayCredentials();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Razorpay configuration error.' });
  }

  try {
    const sql = getDatabase();
    await ensureSchema(sql);

    // 1. Create order on Razorpay API
    const rzpOrder = await createRazorpayOrder({
      order,
      keyId: credentials.keyId,
      keySecret: credentials.keySecret
    });

    // 2. Persist order in database with pending payment status
    await sql`
      INSERT INTO desktop_buddy_orders (
        id, customer_name, phone, address, city, pincode, customer_notes,
        items, subtotal, delivery_fee, total, promo_code,
        payment_method, payment_status, razorpay_order_id, status
      ) VALUES (
        ${order.id}::uuid,
        ${order.customer.name},
        ${order.customer.phone},
        ${order.customer.address},
        ${order.customer.city},
        ${order.customer.pincode},
        ${order.customer.notes},
        ${JSON.stringify(order.items)}::jsonb,
        ${order.subtotal},
        ${order.deliveryFee},
        ${order.total},
        ${order.promoCode},
        'razorpay',
        'pending',
        ${rzpOrder.id},
        'new'
      )
    `;

    return res.status(200).json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: credentials.keyId,
      customer: order.customer,
      total: order.total
    });
  } catch (error) {
    console.error('Failed to create Razorpay order.', error);
    if (error instanceof ApiError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(503).json({
      error: 'We could not start your payment session. Please try again or place your order via WhatsApp.'
    });
  }
}
