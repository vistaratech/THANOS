import {
  ensureSchema,
  getAdminSession,
  getDatabase,
  toClientOrder
} from '../../src/server/orderApi.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    if (!getAdminSession(req)) {
      return res.status(401).json({ error: 'Please sign in to view orders.' });
    }

    const sql = getDatabase();
    await ensureSchema(sql);
    const rows = await sql`
      SELECT *
      FROM desktop_buddy_orders
      ORDER BY created_at DESC
      LIMIT 500
    `;
    return res.status(200).json({ orders: rows.map(toClientOrder) });
  } catch (error) {
    console.error('Failed to load admin orders.', error);
    return res.status(503).json({ error: 'Orders are temporarily unavailable.' });
  }
}
