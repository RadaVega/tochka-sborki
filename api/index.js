/**
 * api/index.js — Vercel/serverless entry point (CSP fix for consistency)
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { createApp } from '../server/app.js';
import { prisma } from '../server/db.js';

const app = express();
const port = process.env.PORT || 3001;

// ── Security headers: disable CSP, controlled via <meta> in index.html ──
// 🔧 FIX: Prevent default Helmet CSP from blocking Yandex Metrika
app.use(helmet({
  contentSecurityPolicy: false,  // 🔧 Let index.html <meta> handle CSP
  crossOriginEmbedderPolicy: false, // 🔧 Needed for Yandex blob workers
  // All other Helmet protections remain active
}));

app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

// Reuse the main app logic from server/app.js
const mainApp = createApp(prisma);

// Mount API routes
app.use('/api', mainApp._router);

// Serve static files in production (Vercel)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve('dist');
  
  // Hashed assets can be cached forever
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
  
  // SPA fallback with no-cache headers
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile('index.html', { root: distPath });
  });
}

// Global error handler
app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('[api error]', error);
  return res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server (for local dev / non-Vercel environments)
if (process.env.VERCEL !== '1') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`API server running on port ${port}`);
  });
}

export default app;