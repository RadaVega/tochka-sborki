/**
 * server/app.js — updated with server-side analytics logging
 */

'use strict';

import express from 'express';
import cors from 'cors';
import { analyticsMiddleware, logEvent } from './analytics.js';

export function createApp(prisma) {
  const app = express();

  // ── CORS ────────────────────────────────────────────
  const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  allowedOrigins.push('http://localhost:5173');
  allowedOrigins.push('http://localhost:3000');

  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  }));

  // ── Body parsing ────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Analytics timing middleware ─────────────────────
  app.use(analyticsMiddleware);

  // ── Simple in-memory rate limiter ──
  const rateLimitStore = new Map();
  function rateLimit(windowMs = 60_000, max = 5) {
    return (req, res, next) => {
      const key = req.ip || 'unknown';
      const now = Date.now();
      const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };

      if (now > entry.resetAt) {
        entry.count = 0;
        entry.resetAt = now + windowMs;
      }
      entry.count++;
      rateLimitStore.set(key, entry);

      if (entry.count > max) {
        return res.status(429).json({
          success: false,
          error: 'Слишком много запросов. Подождите немного и попробуйте снова.',
        });
      }
      next();
    };
  }

  // ════════════════════════════════════════════════════
  // POST /api/contact
  // ════════════════════════════════════════════════════
  app.post('/api/contact', rateLimit(60_000, 5), async (req, res) => {
    const { name, email, message, role } = req.body;

    await logEvent(prisma, {
      req,
      eventType: 'form_submit',
      eventName: 'contact',
      meta: { role, hasMessage: !!message },
    });

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      await logEvent(prisma, {
        req,
        eventType: 'form_error',
        eventName: 'contact',
        success: false,
        error: 'validation_failed',
        meta: { missing: { name: !name, email: !email, message: !message } },
      });
      return res.status(400).json({ success: false, error: 'Заполните все обязательные поля.' });
    }

    try {
      const contact = await prisma.contact.create({
        data: {
          name:    name.trim(),
          email:   email.trim().toLowerCase(),
          message: message.trim(),
        },
      });

      await logEvent(prisma, {
        req,
        eventType:  'form_success',
        eventName:  'contact',
        entityId:   contact.id,
        entityType: 'Contact',
        meta: { role },
      });

      return res.json({ success: true, message: 'Ваше сообщение получено! Ответим в течение рабочего дня.' });
    } catch (err) {
      await logEvent(prisma, {
        req,
        eventType: 'form_error',
        eventName: 'contact',
        success:   false,
        error:     err.message,
      });
      return res.status(500).json({ success: false, error: 'Не удалось сохранить сообщение. Напишите нам напрямую.' });
    }
  });

  // ════════════════════════════════════════════════════
  // POST /api/subscribe
  // ════════════════════════════════════════════════════
  app.post('/api/subscribe', rateLimit(60_000, 3), async (req, res) => {
    const { email } = req.body;

    await logEvent(prisma, { req, eventType: 'form_submit', eventName: 'subscribe' });

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      await logEvent(prisma, {
        req, eventType: 'form_error', eventName: 'subscribe',
        success: false, error: 'invalid_email',
      });
      return res.status(400).json({ success: false, error: 'Введите корректный email.' });
    }

    try {
      const subscriber = await prisma.subscriber.create({
        data: { email: email.trim().toLowerCase() },
      });

      await logEvent(prisma, {
        req,
        eventType:  'form_success',
        eventName:  'subscribe',
        entityId:   subscriber.id,
        entityType: 'Subscriber',
      });

      return res.json({ success: true, message: '✅ Вы подписаны на дайджест Точки Сборки!' });
    } catch (err) {
      if (err.code === 'P2002') {
        await logEvent(prisma, {
          req, eventType: 'form_error', eventName: 'subscribe',
          success: false, error: 'already_subscribed',
        });
        return res.json({ success: true, message: '✅ Этот email уже подписан. Спасибо!' });
      }
      await logEvent(prisma, {
        req, eventType: 'form_error', eventName: 'subscribe',
        success: false, error: err.message,
      });
      return res.status(500).json({ success: false, error: 'Не удалось подписаться. Попробуйте позже.' });
    }
  });

  // ════════════════════════════════════════════════════
  // POST /api/submit-project
  // ════════════════════════════════════════════════════
  app.post('/api/submit-project', rateLimit(300_000, 3), async (req, res) => {
    const { companyName, contactName, email, stack, budget, deadline, description } = req.body;

    await logEvent(prisma, {
      req,
      eventType: 'form_submit',
      eventName: 'project_submission',
      meta: { budget, hasDeadline: !!deadline, stackLength: stack?.length },
    });

    const missing = [];
    if (!companyName?.trim())   missing.push('companyName');
    if (!contactName?.trim())   missing.push('contactName');
    if (!email?.trim())         missing.push('email');
    if (!stack?.trim())         missing.push('stack');
    if (!budget)                missing.push('budget');
    if (!deadline)              missing.push('deadline');
    if (!description?.trim() || description.trim().length < 30) missing.push('description');

    if (missing.length > 0) {
      await logEvent(prisma, {
        req, eventType: 'form_error', eventName: 'project_submission',
        success: false, error: 'validation_failed', meta: { missing },
      });
      return res.status(400).json({
        success: false,
        error: `Заполните обязательные поля: ${missing.join(', ')}`,
      });
    }

    try {
      const submission = await prisma.projectSubmission.create({
        data: {
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          email:       email.trim().toLowerCase(),
          stack:       stack.trim(),
          budget,
          deadline,
          description: description.trim(),
        },
      });

      await logEvent(prisma, {
        req,
        eventType:  'form_success',
        eventName:  'project_submission',
        entityId:   submission.id,
        entityType: 'ProjectSubmission',
        meta: { budget, companyName: companyName.trim() },
      });

      return res.json({
        success: true,
        message: '✅ Заявка получена! AI-агент Intake проверит ТЗ и ответит за 2–4 часа.',
      });
    } catch (err) {
      await logEvent(prisma, {
        req, eventType: 'form_error', eventName: 'project_submission',
        success: false, error: err.message,
      });
      return res.status(500).json({
        success: false,
        error: 'Не удалось сохранить заявку. Напишите нам: tochka.sborki21@vk.com',
      });
    }
  });

  // ════════════════════════════════════════════════════
  // GET /api/analytics/summary
  // ════════════════════════════════════════════════════
  app.get('/api/analytics/summary', async (req, res) => {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey || req.query.key !== adminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const [
        totalContacts,
        totalSubscribers,
        totalProjects,
        totalEvents,
        recentEvents,
        eventsByType,
        eventsByName,
        dailySubmissions,
      ] = await Promise.all([
        prisma.contact.count(),
        prisma.subscriber.count(),
        prisma.projectSubmission.count(),
        prisma.analyticsEvent.count(),

        prisma.analyticsEvent.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, eventType: true, eventName: true, success: true, page: true, createdAt: true, meta: true },
        }),

        prisma.analyticsEvent.groupBy({
          by: ['eventType'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),

        prisma.analyticsEvent.groupBy({
          by: ['eventName'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),

        prisma.$queryRaw`
          SELECT
            DATE("createdAt") as date,
            "eventName",
            COUNT(*) as count
          FROM "AnalyticsEvent"
          WHERE
            "createdAt" > NOW() - INTERVAL '14 days'
            AND "eventType" = 'form_success'
          GROUP BY DATE("createdAt"), "eventName"
          ORDER BY date DESC
        `,
      ]);

      return res.json({
        totals: {
          contacts:    totalContacts,
          subscribers: totalSubscribers,
          projects:    totalProjects,
          events:      totalEvents,
        },
        eventsByType: eventsByType.map(e => ({ type: e.eventType, count: e._count.id })),
        eventsByName: eventsByName.map(e => ({ name: e.eventName, count: e._count.id })),
        dailySubmissions,
        recentEvents,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Health check ────────────────────────────────────
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
  });

  // ── 404 catch-all ───────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // ── Global error handler ────────────────────────────
  app.use((err, req, res, _next) => {
    console.error('[server error]', err);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера.' });
  });

  return app;
}
