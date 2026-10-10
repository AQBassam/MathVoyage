import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { apiApp } = await import('./src/server/api.ts');
const { guestIdentity, assertIdentityConfig } = await import('./src/server/identity.ts');
const { createPool } = await import('./src/db/index.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

assertIdentityConfig();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
// Exactly one reverse proxy (nginx) sits in front of the app.
app.set('trust proxy', 1);

app.use(apiApp);

// Hashed build assets are immutable; cache them for a year.
app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false })
);
app.use(express.static(distDir, { index: false, maxAge: '1h' }));

// SPA fallback. Issuing the guest cookie with the HTML avoids a race between the first parallel API calls.
app.get('*', guestIdentity, (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(distDir, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  server.close(() => {
    createPool()
      .end()
      .finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
