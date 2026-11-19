import {
  ApiError,
  ensureSchema,
  getDatabase,
  isSameOrigin,
  verifyRazorpaySignature
} from '../../src/server/orderApi.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification details.' });
  }

  let isValid = false;
  try {
    isValid = verifyRazorpaySignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });
  } catch (error) {
    console.error('Razorpay signature verification configuration error:', error);
    if (error instanceof ApiError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Payment verification failed due to server configuration.' });
  }

  if (!isValid) {
    console.warn(`Payment signature verification failed for order ${orderId}`);
    return res.status(400).json({
      error: 'Payment signature could not be verified. If your money was deducted, please contact us on WhatsApp with payment ID: ' + razorpay_payment_id
    });
  }

  try {
    const sql = getDatabase();
    await ensureSchema(sql);

    const rows = await sql`
      UPDATE desktop_buddy_orders
      SET payment_status = 'paid',
          status = 'confirmed',
          razorpay_payment_id = ${razorpay_payment_id},
          razorpay_signature = ${razorpay_signature},
          updated_at = NOW()
      WHERE id = ${orderId}::uuid
      RETURNING id, customer_name, phone, total
    `;

    if (!rows.length) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      orderId: rows[0].id,
      paymentId: razorpay_payment_id,
      customerName: rows[0].customer_name,
      total: Number(rows[0].total)
    });
  } catch (error) {
    console.error('Failed to update paid order status in database.', error);
    return res.status(500).json({
      error: 'Payment was received but saving confirmation failed. Please contact us on WhatsApp with payment ID: ' + razorpay_payment_id
    });
  }
}
