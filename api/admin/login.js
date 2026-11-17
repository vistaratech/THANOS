import {
  ensureSchema,
  getClientIpHash,
  getDatabase,
  isSameOrigin,
  createAdminSession,
  setAdminCookie,
  verifyAdminConfiguration,
  verifyAdminCredentials
} from '../../src/server/orderApi.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Cross-origin login is not allowed.' });
  }

  const { username, password } = req.body || {};
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.length > 100 ||
    password.length > 256
  ) {
    return res.status(400).json({ error: 'Enter a valid admin ID and password.' });
  }

  try {
    verifyAdminConfiguration();
    const sql = getDatabase();
    await ensureSchema(sql);

    const ipHash = getClientIpHash(req);
    const [attemptCount] = await sql`
      SELECT COUNT(*)::integer AS count
      FROM desktop_buddy_admin_login_attempts
      WHERE ip_hash = ${ipHash}
        AND attempted_at > NOW() - INTERVAL '15 minutes'
    `;
    if (Number(attemptCount.count) >= 8) {
      return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
    }

    if (!verifyAdminCredentials(username, password)) {
      await sql`
        INSERT INTO desktop_buddy_admin_login_attempts (ip_hash)
        VALUES (${ipHash})
      `;
      await sql`
        DELETE FROM desktop_buddy_admin_login_attempts
        WHERE attempted_at < NOW() - INTERVAL '1 day'
      `;
      return res.status(401).json({ error: 'The admin ID or password is incorrect.' });
    }

    await sql`
      DELETE FROM desktop_buddy_admin_login_attempts
      WHERE ip_hash = ${ipHash}
    `;
    setAdminCookie(res, createAdminSession(process.env.ADMIN_USERNAME));
    return res.status(200).json({ authenticated: true });
  } catch (error) {
    console.error('Admin login failed.', error);
    return res.status(503).json({ error: 'The admin service is not configured or available.' });
  }
}
