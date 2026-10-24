import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/server/routes.ts';
import { initializeDatabase } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize the database with persistent storage and seed data
  initializeDatabase();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Request parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic request logger for API routes
  app.use('/api', (req, _res, next) => {
    // Keep internal logging minimal
    next();
  });

  // API router
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  if (!isProduction) {
    // In development mode: Mount Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode: Serve static frontend build from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Exam-Pulse Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Exam-Pulse Server] Fatal startup error:', err);
  process.exit(1);
});
