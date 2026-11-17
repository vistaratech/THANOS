import { clearAdminCookie, isSameOrigin } from '../../src/server/orderApi.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Cross-origin logout is not allowed.' });
  }

  clearAdminCookie(res);
  return res.status(200).json({ authenticated: false });
}
