/**
 * server/app.js — updated with server-side analytics logging
 */

'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { z } from 'zod';
import { sendMail } from './mailer.js';
import { analyticsMiddleware, logEvent } from './analytics.js';

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['https://tochka-sborki-five.vercel.app'];

// Always allow local dev
allowedOrigins.push('http://localhost:5173');
allowedOrigins.push('http://localhost:3000');

const requiredString = (field) => z.string({ required_error: `${field} обязательно` }).trim().min(1, `${field} обязательно`);
const email = z.string({ required_error: 'Email обязателен' }).trim().email('Введите корректный email').toLowerCase();
const consent = z.boolean({ required_error: 'Необходимо согласие на обработку ПДн' })
  .refine((value) => value === true, 'Необходимо согласие на обработку ПДн');

const contactSchema = z.object({
  name: requiredString('Имя').min(2).max(120),
  email,
  message: requiredString('Сообщение').min(10).max(4000),
  consent
});

const subscribeSchema = z.object({ email, consent });

const stackField = z.union([
  z.array(z.string().trim().min(1)),
  requiredString('Стек')
]).transform((value) => Array.isArray(value)
  ? value
  : value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)
).refine((value) => value.length > 0);

const projectSchema = z.object({
  companyName: requiredString('Название компании').min(2).max(160),
  contactName: requiredString('Контактное лицо').min(2).max(160),
  email,
  phone: z.string().trim().max(80).optional().or(z.literal('')),
  stack: stackField,
  description: requiredString('Описание проекта').min(20).max(8000),
  budget: requiredString('Бюджет').max(120),
  deadline: requiredString('Дедлайн')
    .refine((value) => !Number.isNaN(Date.parse(value)))
    .transform((value) => new Date(value).toISOString().slice(0, 10)),
  fileUrl: z.string().trim().url().optional().or(z.literal('')),
  consent
});

const NON_CRITICAL_TIMEOUT_MS = Number(process.env.NON_CRITICAL_TIMEOUT_MS || 4000);

async function runNonCritical(taskName, task) {
  try {
    await Promise.race([
      task(),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${taskName} timeout`)), NON_CRITICAL_TIMEOUT_MS))
    ]);
  } catch (error) {
    console.error(`[non-critical] ${taskName} failed:`, error?.message || error);
  }
}

function requireConsent(req, res, next) {
  if (req.body?.consent !== true) {
    return res.status(400).json({ message: 'Требуется согласие на обработку персональных данных' });
  }
  return next();
}

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Проверьте поля формы',
        errors: result.error.flatten().fieldErrors
      });
    }
    req.validated = result.data;
    return next();
  };
}

export function createApp(prisma) {
  const app = express();

  // ── Security headers with CSP for Yandex Metrika ──
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://mc.yandex.ru", "https://yandex.ru", "https://metrika.yandex.ru"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://mc.yandex.ru", "https://yandex.ru"],
        connectSrc: ["'self'", "https://mc.yandex.ru", "https://yandex.ru"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
  }));

  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('tiny'));
  app.use(analyticsMiddleware);

  // Helper to get prisma — uses injected instance or falls back to req.app.locals
  const getPrisma = (req) => req.app?.locals?.prisma || prisma;

  app.get('/api/health', (req, res) => res.json({ success: true, service: 'tochka-sborki-api' }));

  // ════════════════════════════════════════════════════
  // POST /api/contact
  // ════════════════════════════════════════════════════
  app.post('/api/contact', requireConsent, validate(contactSchema), async (req, res, next) => {
    try {
      const doc = await getPrisma(req).contact.create({
        data: { ...req.validated, consent: Boolean(req.validated.consent) }
      });
      await logEvent(getPrisma(req), {
        req,
        eventType: 'form_success',
        eventName: 'contact',
        entityId: doc.id,
        entityType: 'Contact'
      });
      try {
        await sendMail({
          subject: 'Новая заявка с сайта Точка Сборки',
          replyTo: req.validated.email,
          text: `Имя: ${req.validated.name}\nEmail: ${req.validated.email}\n\n${req.validated.message}`
        });
      } catch {}
      res.status(201).json({
        success: true,
        message: 'Сообщение отправлено. Мы свяжемся с вами.',
        id: doc.id
      });
    } catch (error) {
      await logEvent(getPrisma(req), {
        req,
        eventType: 'form_error',
        eventName: 'contact',
        success: false,
        error: error?.message
      });
      next(error);
    }
  });

  // ════════════════════════════════════════════════════
  // POST /api/subscribe
  // ════════════════════════════════════════════════════
  app.post('/api/subscribe', requireConsent, validate(subscribeSchema), async (req, res, next) => {
    try {
      const doc = await getPrisma(req).subscriber.upsert({
        where: { email: req.validated.email },
        update: { consent: Boolean(req.validated.consent) },
        create: { ...req.validated, consent: Boolean(req.validated.consent) }
      });
      await logEvent(getPrisma(req), {
        req,
        eventType: 'form_success',
        eventName: 'subscribe',
        entityId: doc.id,
        entityType: 'Subscriber'
      });
      try {
        await sendMail({
          subject: 'Новая подписка на новости Точка Сборки',
          replyTo: req.validated.email,
          text: `Email: ${req.validated.email}`
        });
      } catch {}
      res.status(201).json({
        success: true,
        message: 'Подписка оформлена.',
        id: doc.id
      });
    } catch (error) {
      await logEvent(getPrisma(req), {
        req,
        eventType: 'form_error',
        eventName: 'subscribe',
        success: false,
        error: error?.message
      });
      next(error);
    }
  });

  // ════════════════════════════════════════════════════
  // POST /api/submit-project
  // ════════════════════════════════════════════════════
  app.post('/api/submit-project', requireConsent, validate(projectSchema), async (req, res, next) => {
    try {
      const doc = await getPrisma(req).projectSubmission.create({
        data: { ...req.validated, consent: Boolean(req.validated.consent) }
      });

      res.status(200).json({
        success: true,
        message: 'Техническое задание отправлено. Мы свяжемся с вами.',
        id: doc.id
      });

      // Non-critical side effects must never block or fail the API response
      void runNonCritical('project_submission.analytics_success', () => logEvent(getPrisma(req), {
        req,
        eventType: 'form_success',
        eventName: 'project_submission',
        entityId: doc.id,
        entityType: 'ProjectSubmission'
      }));

      void runNonCritical('project_submission.send_mail', () => sendMail({
        subject: 'Новое техническое задание — Точка Сборки',
        replyTo: req.validated.email,
        text:
          `Компания: ${req.validated.companyName}\n` +
          `Контакт: ${req.validated.contactName}\n` +
          `Email: ${req.validated.email}\n` +
          `Телефон: ${req.validated.phone || 'не указан'}\n` +
          `Стек: ${req.validated.stack.join(', ')}\n` +
          `Бюджет: ${req.validated.budget}\n` +
          `Дедлайн: ${req.validated.deadline}\n` +
          `Файл ТЗ: ${req.validated.fileUrl || 'не указан'}\n\n` +
          `${req.validated.description}`
      }));
    } catch (error) {
      void runNonCritical('project_submission.analytics_error', () => logEvent(getPrisma(req), {
        req,
        eventType: 'form_error',
        eventName: 'project_submission',
        success: false,
        error: error?.message
      }));
      next(error);
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
        getPrisma(req).contact.count(),
        getPrisma(req).subscriber.count(),
        getPrisma(req).projectSubmission.count(),
        getPrisma(req).analyticsEvent.count(),

        getPrisma(req).analyticsEvent.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, eventType: true, eventName: true, success: true, page: true, createdAt: true, meta: true },
        }),

        getPrisma(req).analyticsEvent.groupBy({
          by: ['eventType'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),

        getPrisma(req).analyticsEvent.groupBy({
          by: ['eventName'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),

        getPrisma(req).$queryRaw`
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

  // ── Static files in production ──────────────────────
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile('index.html', { root: distPath }));
  }

  // ── Global error handler ────────────────────────────
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Такая запись уже существует' });
    }
    if (['P1000', 'P1001', 'P1002', 'P1003'].includes(error.code)) {
      return res.status(400).json({ success: false, error: 'Не удалось подключиться к базе данных' });
    }
    console.error('[server error]', error);
    return res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  });

  return app;
}
