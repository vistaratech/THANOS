import {
  ORDER_STATUSES,
  ensureSchema,
  getAdminSession,
  getDatabase,
  isSameOrigin,
  toClientOrder
} from '../../../src/server/orderApi.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Cross-origin order updates are not allowed.' });
  }

  try {
    if (!getAdminSession(req)) {
      return res.status(401).json({ error: 'Please sign in to update orders.' });
    }

    const id = req.params?.id || req.query?.id;
    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
      return res.status(400).json({ error: 'Invalid order ID.' });
    }

    const { status, adminNote } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Choose a valid order status.' });
    }
    if (typeof adminNote !== 'string' || adminNote.length > 1000) {
      return res.status(400).json({ error: 'Admin notes must be 1,000 characters or fewer.' });
    }

    const sql = getDatabase();
    await ensureSchema(sql);
    const rows = await sql`
      UPDATE desktop_buddy_orders
      SET status = ${status},
          admin_note = ${adminNote.trim()},
          updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;
    if (!rows.length) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.status(200).json({ order: toClientOrder(rows[0]) });
  } catch (error) {
    console.error('Failed to update an admin order.', error);
    return res.status(503).json({ error: 'The order could not be updated.' });
  }
}
