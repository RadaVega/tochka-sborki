/**
 * server/app.js — ES Module version
 * Express app factory with student routes, project submission, rate limiting, analytics, and SPA fallback
 */

'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── YandexGPT client (for Hermes matching) ──────────
const YANDEX_GPT_API_KEY = process.env.YANDEX_GPT_API_KEY;
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID;

async function yandexGPTComplete(systemPrompt, userPrompt, temperature = 0.2) {
  if (!YANDEX_GPT_API_KEY || !YANDEX_FOLDER_ID) {
    throw new Error('YandexGPT credentials not configured');
  }

  const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
    method: 'POST',
    headers: {
      'Authorization': `Api-Key ${YANDEX_GPT_API_KEY}`,
      'Content-Type': 'application/json',
      'x-folder-id': YANDEX_FOLDER_ID,
    },
    body: JSON.stringify({
      modelUri: `gpt://${YANDEX_FOLDER_ID}/yandexgpt-lite`,
      completionOptions: {
        stream: false,
        temperature,
        maxTokens: 2000,
      },
      messages: [
        { role: 'system', text: systemPrompt },
        { role: 'user', text: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`YandexGPT error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.result?.alternatives?.[0]?.message?.text || '';
}

// ── Schemas ─────────────────────────────────────────
const requiredString = (field) => z.string({ required_error: `${field} обязательно` }).trim().min(1);
const email = z.string().trim().email('Введите корректный email').toLowerCase();

const studentCreateSchema = z.object({
  name: requiredString('Имя').min(2).max(120),
  email,
  phone: z.string().trim().max(80).optional().or(z.literal('')),
  stack: z.union([
    z.array(z.string().trim().min(1)),
    requiredString('Стек'),
  ]).transform((value) => Array.isArray(value)
    ? value
    : value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)
  ).refine((value) => value.length > 0, 'Укажите хотя бы один навык'),
  experience: z.enum(['JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD']),
  bio: z.string().trim().max(4000).optional().or(z.literal('')),
  portfolioUrl: z.string().trim().url().optional().or(z.literal('')),
  githubUrl: z.string().trim().url().optional().or(z.literal('')),
  telegram: z.string().trim().max(80).optional().or(z.literal('')),
  availability: z.enum(['FULL_TIME', 'PART_TIME', 'PROJECT', 'UNAVAILABLE']).default('FULL_TIME'),
  hourlyRate: z.coerce.number().int().min(0).max(10000).optional(),
  consent: z.boolean().refine((v) => v === true, 'Необходимо согласие'),
});

const studentUpdateSchema = studentCreateSchema.partial().extend({
  status: z.enum(['ACTIVE', 'BUSY', 'INACTIVE']).optional(),
  skillScore: z.coerce.number().min(0).max(100).optional(),
  completedProjects: z.coerce.number().int().min(0).optional(),
});

const matchDecisionSchema = z.object({
  status: z.enum(['PROPOSED', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED']),
  note: z.string().max(2000).optional(),
});

// ── Helpers ─────────────────────────────────────────
function parseStack(stack) {
  if (Array.isArray(stack)) return stack;
  if (typeof stack === 'string') return stack.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function stackOverlap(projectStack, studentStack) {
  const p = parseStack(projectStack).map((s) => s.toLowerCase());
  const s = parseStack(studentStack).map((s) => s.toLowerCase());
  const intersection = p.filter((item) => s.some((sk) => sk.includes(item) || item.includes(sk)));
  return {
    common: intersection,
    score: intersection.length / Math.max(p.length, 1),
  };
}

function parseRussianDate(dateStr) {
  if (!dateStr) return '';
  // dd.mm.yyyy → yyyy-mm-dd
  const parts = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (parts) {
    return `${parts[3]}-${parts[2]}-${parts[1]}`;
  }
  return String(dateStr).trim();
}

// ════════════════════════════════════════════════════
// HERMES: AI-powered project↔student matching
// ════════════════════════════════════════════════════
async function hermesMatchProject(prisma, projectId, topN = 5) {
  const project = await prisma.projectSubmission.findUnique({
    where: { id: projectId },
    include: { teamMatches: { include: { student: true } } },
  });

  if (!project) throw new Error('Project not found');

  // Exclude already matched students
  const excludedIds = project.teamMatches.map((m) => m.studentId);

  const students = await prisma.studentProfile.findMany({
    where: {
      status: 'ACTIVE',
      id: { notIn: excludedIds.length ? excludedIds : undefined },
    },
    orderBy: { skillScore: 'desc' },
    take: 50,
  });

  if (!students.length) return [];

  const systemPrompt = `Ты — HR-технолог платформы "Точка Сборки". Оцени совместимость студентов с техническим заданием проекта.
Ответь СТРОГО в формате JSON-массива без markdown:
[
  {"studentId":"...","matchScore":85,"reason":"Краткая причина на русском","recommendedRole":"Frontend / Backend / DevOps / QA / PM / Fullstack"},
  ...
]
Оценивай по: стеку (вес 40%), опыту (вес 30%), доступности (вес 20%), портфолио (вес 10%).
matchScore — целое число 0–100. Верни ТОЛЬКО ${topN} лучших.`;

  const userPrompt = `ПРОЕКТ:
Компания: ${project.companyName}
Стек: ${parseStack(project.stack).join(', ')}
Описание: ${project.description.slice(0, 1500)}
Бюджет: ${project.budget}
Дедлайн: ${project.deadline}

СТУДЕНТЫ:
${students.map((s) => `ID: ${s.id}
Имя: ${s.name}
Стек: ${parseStack(s.stack).join(', ')}
Опыт: ${s.experience}
Bio: ${(s.bio || '').slice(0, 300)}
SkillScore: ${s.skillScore || 'N/A'}
Проектов завершено: ${s.completedProjects || 0}
Ставка: ${s.hourlyRate || 'не указана'}
Доступность: ${s.availability}
---`).join('\n')}`;

  const raw = await yandexGPTComplete(systemPrompt, userPrompt, 0.1);

  let rankings = [];
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    rankings = JSON.parse(cleaned);
    if (!Array.isArray(rankings)) rankings = [];
  } catch {
    // Fallback to heuristic if AI fails
    rankings = students
      .map((s) => {
        const overlap = stackOverlap(project.stack, s.stack);
        const expBonus = { JUNIOR: 10, MIDDLE: 25, SENIOR: 40, LEAD: 50 }[s.experience] || 0;
        const score = Math.min(100, Math.round(overlap.score * 40 + expBonus + (s.skillScore || 0) * 0.3));
        return {
          studentId: s.id,
          matchScore: score,
          reason: `Пересечение стека: ${overlap.common.join(', ') || 'нет'}`,
          recommendedRole: 'Fullstack',
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, topN);
  }

  const results = [];
  for (const r of rankings.slice(0, topN)) {
    const student = students.find((s) => s.id === r.studentId);
    if (!student) continue;

    const match = await prisma.teamMatch.upsert({
      where: {
        projectSubmissionId_studentId: {
          projectSubmissionId: projectId,
          studentId: r.studentId,
        },
      },
      update: {
        matchScore: r.matchScore,
        status: 'PROPOSED',
        metadata: {
          ...(typeof match?.metadata === 'object' ? match.metadata : {}),
          hermesReason: r.reason,
          hermesRole: r.recommendedRole,
          matchedAt: new Date().toISOString(),
        },
      },
      create: {
        projectSubmissionId: projectId,
        studentId: r.studentId,
        matchScore: r.matchScore,
        status: 'PROPOSED',
        metadata: {
          hermesReason: r.reason,
          hermesRole: r.recommendedRole,
          matchedAt: new Date().toISOString(),
        },
      },
    });

    results.push({ ...match, student: { name: student.name, email: student.email } });
  }

  return results;
}

// ════════════════════════════════════════════════════
// APP FACTORY
// ════════════════════════════════════════════════════
export function createApp(prisma) {
  const app = express();

  // ── Middleware ────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://mc.yandex.ru", "https://mc.yandex.com", "https://yastatic.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://llm.api.cloud.yandex.net", "https://mc.yandex.ru", "https://mc.yandex.com"],
      },
    },
  }));
  app.use(cors());
  app.use(express.json());

  // ── rateLimit factory (defined BEFORE use) ─────────
  function rateLimit(windowMs, max) {
    const requests = new Map();
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();

      if (!requests.has(ip)) {
        requests.set(ip, { count: 1, startTime: now });
        return next();
      }

      const record = requests.get(ip);
      if (now - record.startTime > windowMs) {
        record.count = 1;
        record.startTime = now;
        return next();
      }

      if (record.count >= max) {
        return res.status(429).json({ error: 'Too many requests' });
      }

      record.count++;
      next();
    };
  }

  // ── logEvent helper ───────────────────────────────
  async function logEvent(prisma, { req, eventType, eventName, entityId, entityType, meta }) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          event: `${eventType}:${eventName}`,
          entityId: entityId ? String(entityId) : null,
          entityType: entityType || null,
          meta: meta || {},
          ip: req?.ip,
          userAgent: req?.headers?.['user-agent'],
        },
      });
    } catch (e) {
      console.error('[logEvent] failed:', e.message);
    }
  }

  // ═══════════════════════════════════════════════════
  // ROUTER
  // ═══════════════════════════════════════════════════
  const router = express.Router();

  // ── Validation helper ─────────────────────────────
  function validate(schema) {
    return (req, res, next) => {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Проверьте поля формы',
          errors: result.error.flatten().fieldErrors,
        });
      }
      req.validated = result.data;
      next();
    };
  }

  function runNonCritical(taskName, task) {
    const NON_CRITICAL_TIMEOUT_MS = Number(process.env.NON_CRITICAL_TIMEOUT_MS || 4000);
    try {
      Promise.race([
        task(),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`${taskName} timeout`)), NON_CRITICAL_TIMEOUT_MS)),
      ]).catch((err) => console.error(`[non-critical] ${taskName} failed:`, err?.message || err));
    } catch (e) {
      console.error(`[non-critical] ${taskName} failed:`, e?.message || e);
    }
  }

  // ═══════════════════════════════════════════════════
  // HEALTH / STATUS
  // ═══════════════════════════════════════════════════

  // GET /api/health — health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ═══════════════════════════════════════════════════
  // STUDENT PROFILE ROUTES
  // ═══════════════════════════════════════════════════

  // POST /api/students — register student
  router.post('/students', rateLimit(60 * 60 * 1000, 3), validate(studentCreateSchema), async (req, res, next) => {
    try {
      const data = {
        ...req.validated,
        stack: parseStack(req.validated.stack),
        consent: Boolean(req.validated.consent),
      };

      const student = await prisma.studentProfile.create({ data });

      res.status(201).json({
        success: true,
        message: 'Профиль студента создан.',
        id: student.id,
      });

      runNonCritical('student.analytics', () => logEvent(prisma, {
        req,
        eventType: 'form_success',
        eventName: 'student_register',
        entityId: student.id,
        entityType: 'StudentProfile',
        meta: { experience: student.experience, stack: student.stack },
      }));
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(400).json({ success: false, error: 'Студент с таким email уже зарегистрирован' });
      }
      next(err);
    }
  });

  // GET /api/students — list students (public, paginated)
  router.get('/students', async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const skip = (page - 1) * limit;

      const where = { status: 'ACTIVE' };
      if (req.query.experience) where.experience = req.query.experience;
      if (req.query.stack) {
        where.stack = { hasSome: req.query.stack.split(',').map((s) => s.trim()).filter(Boolean) };
      }
      if (req.query.availability) where.availability = req.query.availability;

      const [students, total] = await Promise.all([
        prisma.studentProfile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.studentProfile.count({ where }),
      ]);

      res.json({
        success: true,
        data: students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/students/:id — get single student
  router.get('/students/:id', async (req, res, next) => {
    try {
      const student = await prisma.studentProfile.findUnique({
        where: { id: req.params.id },
      });
      if (!student) {
        return res.status(404).json({ success: false, error: 'Студент не найден' });
      }
      res.json({ success: true, data: student });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/students/:id — update student
  router.patch('/students/:id', validate(studentUpdateSchema), async (req, res, next) => {
    try {
      const data = { ...req.validated };
      if (data.stack) data.stack = parseStack(data.stack);

      const student = await prisma.studentProfile.update({
        where: { id: req.params.id },
        data,
      });

      res.json({ success: true, message: 'Профиль обновлён.', data: student });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Студент не найден' });
      }
      next(err);
    }
  });

  // ═══════════════════════════════════════════════════
  // PROJECT SUBMISSION ROUTES
  // ═══════════════════════════════════════════════════

  // POST /api/submit-project — submit new project (FIXED: deadline as String)
  router.post('/submit-project', rateLimit(60 * 60 * 1000, 5), async (req, res, next) => {
    try {
      const {
        companyName,
        contactName,
        email,
        phone,
        stack,
        description,
        budget,
        deadline,
        fileUrl,
        nda,
      } = req.body;

      if (!companyName || !email || !description) {
        return res.status(400).json({
          success: false,
          error: 'companyName, email и description обязательны',
        });
      }

      const project = await prisma.projectSubmission.create({
        data: {
          companyName: String(companyName).trim(),
          contactName: contactName ? String(contactName).trim() : '',
          email: String(email).toLowerCase().trim(),
          phone: phone ? String(phone).trim() : '',
          stack: parseStack(stack || ''),
          description: String(description).trim(),
          budget: budget ? String(budget).trim() : '',
          deadline: deadline ? parseRussianDate(deadline) : '', // ← String, не Date
          fileUrl: fileUrl ? String(fileUrl).trim() : '',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Проект успешно отправлен.',
        id: project.id,
      });

      runNonCritical('project.analytics', () => logEvent(prisma, {
        req,
        eventType: 'form_success',
        eventName: 'project_submit',
        entityId: project.id,
        entityType: 'ProjectSubmission',
        meta: { companyName: project.companyName, budget: project.budget },
      }));
    } catch (err) {
      next(err);
    }
  });

  // GET /api/projects — list projects (admin/internal)
  router.get('/projects', async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const skip = (page - 1) * limit;

      const where = {};
      if (req.query.status) where.status = req.query.status;

      const [projects, total] = await Promise.all([
        prisma.projectSubmission.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { teamMatches: true } },
          },
        }),
        prisma.projectSubmission.count({ where }),
      ]);

      res.json({
        success: true,
        data: projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/projects/:id — get single project with matches
  router.get('/projects/:id', async (req, res, next) => {
    try {
      const project = await prisma.projectSubmission.findUnique({
        where: { id: req.params.id },
        include: {
          teamMatches: {
            include: { student: true },
            orderBy: { matchScore: 'desc' },
          },
        },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Проект не найден' });
      }

      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/projects/:id/match — run Hermes matching
  router.post('/projects/:id/match', async (req, res, next) => {
    try {
      const topN = Math.min(20, Math.max(1, parseInt(req.query.top, 10) || 5));
      const results = await hermesMatchProject(prisma, req.params.id, topN);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/matches/:id — update match decision
  router.patch('/matches/:id', validate(matchDecisionSchema), async (req, res, next) => {
    try {
      const match = await prisma.teamMatch.update({
        where: { id: req.params.id },
        data: {
          status: req.validated.status,
          note: req.validated.note || '',
        },
      });
      res.json({ success: true, data: match });
    } catch (err) {
      if (err.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Матч не найден' });
      }
      next(err);
    }
  });

  // ═══════════════════════════════════════════════════
  // ANALYTICS ROUTES
  // ═══════════════════════════════════════════════════

  // POST /api/analytics/event — track client event
  router.post('/analytics/event', async (req, res, next) => {
    try {
      const { eventType, eventName, entityId, entityType, meta } = req.body;
      await logEvent(prisma, {
        req,
        eventType: String(eventType).slice(0, 64),
        eventName: String(eventName).slice(0, 128),
        entityId: entityId ? String(entityId).slice(0, 64) : null,
        entityType: entityType ? String(entityType).slice(0, 64) : null,
        meta: meta || {},
      });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/analytics/dashboard — simple stats
  router.get('/analytics/dashboard', async (req, res, next) => {
    try {
      const [students, projects, matches, events] = await Promise.all([
        prisma.studentProfile.count(),
        prisma.projectSubmission.count(),
        prisma.teamMatch.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        prisma.analyticsEvent.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        }),
      ]);

      res.json({
        success: true,
        data: {
          students,
          projects,
          matches: matches.reduce((acc, m) => {
            acc[m.status] = m._count.status;
            return acc;
          }, {}),
          eventsLast7Days: events,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // ═══════════════════════════════════════════════════
  // MOUNT & FALLBACK
  // ═══════════════════════════════════════════════════
  app.use('/api', router);

  // ── Static & SPA fallback ─────────────────────────
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  // ── Global error handler ──────────────────────────
  app.use((err, req, res, next) => {
    console.error('[error]', err);
    if (res.headersSent) return next(err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  });

  return app;
}