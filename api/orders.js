import {
  ApiError,
  ensureSchema,
  getDatabase,
  isSameOrigin,
  parseOrder
} from '../src/server/orderApi.js';

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
    console.error('Failed to validate an order request.', error);
    return res.status(500).json({ error: 'The order request could not be validated.' });
  }

  try {
    const sql = getDatabase();
    await ensureSchema(sql);
    await sql`
      INSERT INTO desktop_buddy_orders (
        id, customer_name, phone, address, city, pincode, customer_notes,
        items, subtotal, delivery_fee, total, promo_code, payment_method, payment_status
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
        'whatsapp',
        'pending'
      )
    `;
    return res.status(201).json({ orderId: order.id });
  } catch (error) {
    console.error('Failed to save an order request.', error);
    return res.status(503).json({
      error: 'We could not save your order request. Please try again; your cart has not been cleared.'
    });
  }
}
