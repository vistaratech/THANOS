import { getAdminSession } from '../../src/server/orderApi.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const session = getAdminSession(req);
    return res.status(200).json({
      authenticated: Boolean(session),
      ...(session ? { username: session.username } : {})
    });
  } catch (error) {
    console.error('Admin session verification failed.', error);
    return res.status(503).json({ error: 'The admin service is not configured or available.' });
  }
}
