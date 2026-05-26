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

// ── Hermes endpoint ──
app.post('/api/orchestrate', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { name = 'AI SaaS', stack = 'Python', budget = 500000, timeline_weeks = 14 } = req.body || {};
  
  const db = [
    {name:"Алексей К.",role:"Lead Engineer",skills:["Python","Architecture"],rating:4.9,projects:23,rate:150000},
    {name:"Мария С.",role:"Backend",skills:["Python","FastAPI","PostgreSQL"],rating:4.8,projects:18,rate:120000},
    {name:"Дмитрий В.",role:"Frontend",skills:["React","TypeScript"],rating:4.7,projects:15,rate:100000},
    {name:"Елена П.",role:"ML Engineer",skills:["LLM","PyTorch","RAG"],rating:4.9,projects:12,rate:140000},
    {name:"Игорь М.",role:"DevOps",skills:["Docker","K8s"],rating:4.6,projects:20,rate:110000},
  ];

  const match = (eng) => {
    let s = 70;
    eng.skills.forEach(sk => { if (stack.toLowerCase().includes(sk.toLowerCase())) s += 8; });
    return Math.min(98, s + Math.floor((eng.rating-4.5)*10));
  };

  const needs = {
    ml: /llm|ai|ml|pytorch/i.test(stack),
    front: /react|vue|front/i.test(stack),
    back: /python|node|back|api/i.test(stack),
    devops: budget > 400000
  };

  let team = db.map(e => ({...e, match_score: match(e)}))
    .sort((a,b) => b.match_score - a.match_score)
    .filter(e => 
      e.role === 'Lead Engineer' ||
      (needs.ml && e.role === 'ML Engineer') ||
      (needs.front && e.role === 'Frontend') ||
      (needs.back && e.role === 'Backend') ||
      (needs.devops && e.role === 'DevOps')
    ).slice(0, 5);

  if (team.length < 3) team = db.slice(0,3).map(e => ({...e, match_score: match(e)}));

  const now = new Date().toISOString();
  const logs = [
    {message:"🧠 Hermes AI v2.0", timestamp: now},
    {message:`📋 ${name}`, timestamp: now},
    {message:`📊 ${stack} • ${budget.toLocaleString('ru-RU')}₽`, timestamp: now},
    {message:`🔍 Поиск в базе (${db.length} инженеров)`, timestamp: now},
    {message:"🎯 Векторный матчинг", timestamp: now},
    ...team.map(t => ({message:`✓ ${t.name} — ${t.match_score}%`, timestamp: now})),
    {message:"✅ Команда готова", timestamp: now},
  ];

  await new Promise(r => setTimeout(r, 600));

  res.json({
    project_id: `hms-${Date.now()}`,
    logs,
    team: {
      members: team,
      confidence_score: Math.round(team.reduce((s,t) => s+t.match_score,0)/team.length),
      eta_weeks: timeline_weeks,
      total_cost: team.reduce((s,t) => s + t.rate * timeline_weeks, 0)
    }
  });
});

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