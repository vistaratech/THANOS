import express from 'express';
import { createServer } from 'node:http';
import { createServer as createViteServer, loadEnv } from 'vite';
import orderHandler from '../api/orders.js';
import adminLoginHandler from '../api/admin/login.js';
import adminLogoutHandler from '../api/admin/logout.js';
import adminOrdersHandler from '../api/admin/orders.js';
import adminOrderHandler from '../api/admin/orders/[id].js';
import adminSessionHandler from '../api/admin/session.js';

const app = express();
const server = createServer(app);
const localEnv = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
for (const [key, value] of Object.entries(localEnv)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

app.use(express.json({ limit: '32kb' }));
app.post('/api/orders', orderHandler);
app.post('/api/admin/login', adminLoginHandler);
app.post('/api/admin/logout', adminLogoutHandler);
app.get('/api/admin/session', adminSessionHandler);
app.get('/api/admin/orders', adminOrdersHandler);
app.patch('/api/admin/orders/:id', adminOrderHandler);
app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('Failed to parse a local API request.', error);
  const status = error.status === 413 ? 413 : 400;
  return res.status(status).json({
    error: status === 413 ? 'Request body is too large.' : 'Invalid request body.'
  });
});

const vite = await createViteServer({
  server: {
    middlewareMode: true,
    hmr: { server }
  },
  appType: 'spa'
});
app.use(vite.middlewares);

const port = Number(process.env.PORT || 3000);
server.listen(port, '0.0.0.0', () => {
  console.log(`THANOS development server running at http://localhost:${port}`);
});

const shutdown = async () => {
  await vite.close();
  server.close(() => process.exit(0));
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
