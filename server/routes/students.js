/**
 * server/routes/students.js — ES Modules, aligned with your Prisma schema
 */

'use strict';

import express from 'express';
import { z } from 'zod';

// ── YandexGPT client (Hermes matcher) ───────────────
const YANDEX_GPT_API_KEY = process.env.YANDEX_GPT_API_KEY;
const YANDEX_FOLDER_ID   = process.env.YANDEX_FOLDER_ID;

async function yandexGPTComplete(systemPrompt, userPrompt, temperature = 0.2) {
  if (!YANDEX_GPT_API_KEY || !YANDEX_FOLDER_ID) {
    throw new Error('YandexGPT credentials not configured');
  }

  const res = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YandexGPT ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.result?.alternatives?.[0]?.message?.text || '';
}

// ── Helpers ─────────────────────────────────────────
function parseStack(stack) {
  if (Array.isArray(stack)) return stack;
  if (typeof stack === 'string') return stack.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  return [];
}

function stackOverlap(projectStack, studentStack) {
  const p = parseStack(projectStack).map(s => s.toLowerCase());
  const s = parseStack(studentStack).map(s => s.toLowerCase());
  const common = p.filter(item => s.some(sk => sk.includes(item) || item.includes(sk)));
  return { common, score: common.length / Math.max(p.length, 1) };
}

function cleanUpdate(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// ── Zod schemas ─────────────────────────────────────
const requiredString = (field) => z.string({ required_error: `${field} обязательно` }).trim().min(1);

const studentCreateSchema = z.object({
  name: requiredString('Имя').min(2).max(120),
  email: z.string().trim().email('Введите корректный email').toLowerCase(),
  telegram: z.string().trim().max(80).optional().or(z.literal('')),
  phone: z.string().trim().max(80).optional().or(z.literal('')),
  stack: z.union([
    z.array(z.string().trim().min(1)),
    requiredString('Стек'),
  ]).transform(v => Array.isArray(v) ? v : v.split(/[,;\n]/).map(s => s.trim()).filter(Boolean))
   .refine(v => v.length > 0, 'Укажите хотя бы один навык'),
  preferredStack: z.string().trim().max(200).optional().or(z.literal('')),
  experience: requiredString('Опыт работы'),
  about: requiredString('О себе').min(20).max(4000),
  portfolio: z.string().trim().url().optional().or(z.literal('')),
  linkedIn: z.string().trim().url().optional().or(z.literal('')),
  resumeUrl: z.string().trim().url().optional().or(z.literal('')),
  availableFrom: z.string().datetime().optional().or(z.literal('')),
  maxHoursPerWeek: z.coerce.number().int().min(1).max(168).optional(),
  consent: z.boolean().refine(v => v === true, 'Необходимо согласие'),
  selfEmployed: z.boolean().optional(),
  ndaSigned: z.boolean().optional(),
});

const studentUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  telegram: z.string().trim().max(80).optional().or(z.literal('')),
  phone: z.string().trim().max(80).optional().or(z.literal('')),
  stack: z.union([
    z.array(z.string().trim().min(1)),
    z.string().trim().min(1),
  ]).transform(v => Array.isArray(v) ? v : v.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)).optional(),
  preferredStack: z.string().trim().max(200).optional().or(z.literal('')),
  experience: z.string().trim().min(1).optional(),
  about: z.string().trim().min(20).max(4000).optional(),
  portfolio: z.string().trim().url().optional().or(z.literal('')),
  linkedIn: z.string().trim().url().optional().or(z.literal('')),
  resumeUrl: z.string().trim().url().optional().or(z.literal('')),
  availableFrom: z.string().datetime().optional().or(z.literal('')),
  maxHoursPerWeek: z.coerce.number().int().min(1).max(168).optional(),
  completedProjects: z.coerce.number().int().min(0).optional(),
  totalEarned: z.coerce.number().min(0).optional(),
  skillScore: z.coerce.number().min(0).max(100).optional(),
  codeQuality: z.coerce.number().min(0).max(100).optional(),
  docScore: z.coerce.number().min(0).max(100).optional(),
  speedScore: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(['PENDING','SCORING','ACTIVE','MATCHED','SUSPENDED','REJECTED']).optional(),
  selfEmployed: z.boolean().optional(),
  ndaSigned: z.boolean().optional(),
});

const matchDecisionSchema = z.object({
  status: z.enum(['PROPOSED','ACCEPTED','DECLINED','ACTIVE','COMPLETED','DROPPED']),
  role: z.string().max(120).optional(),
  isMentor: z.boolean().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

// ════════════════════════════════════════════════════
// HERMES: AI project↔student matching
// ════════════════════════════════════════════════════
export async function hermesMatchProject(prisma, projectId, topN = 5) {
  const project = await prisma.projectSubmission.findUnique({
    where: { id: projectId },
    include: { teamMatches: true },
  });
  if (!project) throw new Error('Project not found');

  const excludedIds = project.teamMatches.map(m => m.studentId);

  const students = await prisma.studentProfile.findMany({
    where: {
      status: 'ACTIVE',
      id: excludedIds.length ? { notIn: excludedIds } : undefined,
    },
    orderBy: { skillScore: 'desc' },
    take: 50,
  });
  if (!students.length) return [];

  const systemPrompt = `Ты — HR-технолог "Точка Сборки". Оцени совместимость студентов с ТЗ проекта.
Ответь СТРОГО JSON-массивом без markdown:
[
  {"studentId":"...","matchScore":85,"reason":"Краткая причина","recommendedRole":"Frontend / Backend / DevOps / QA / PM / Fullstack"},
  ...
]
Оценивай: стек (40%), опыт (30%), доступность (20%), портфолио (10%). matchScore — целое 0–100. Только ${topN} лучших.`;

  const userPrompt = `ПРОЕКТ:
Компания: ${project.companyName}
Стек: ${parseStack(project.stack).join(', ')}
Описание: ${project.description.slice(0, 1500)}
Бюджет: ${project.budget}
Дедлайн: ${project.deadline}

СТУДЕНТЫ:
${students.map(s => `ID: ${s.id}
Имя: ${s.name}
Стек: ${parseStack(s.stack).join(', ')}
Preferred: ${s.preferredStack || '—'}
Опыт: ${s.experience}
О себе: ${(s.about || '').slice(0, 300)}
SkillScore: ${s.skillScore ?? 'N/A'}
CodeQuality: ${s.codeQuality ?? 'N/A'}
DocScore: ${s.docScore ?? 'N/A'}
SpeedScore: ${s.speedScore ?? 'N/A'}
Проектов завершено: ${s.completedProjects}
Заработано: ${s.totalEarned}
Макс часов/нед: ${s.maxHoursPerWeek}
Доступен с: ${s.availableFrom ? new Date(s.availableFrom).toISOString().split('T')[0] : 'сразу'}
---`).join('\n')}`;

  const raw = await yandexGPTComplete(systemPrompt, userPrompt, 0.1);

  let rankings = [];
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    rankings = JSON.parse(cleaned);
    if (!Array.isArray(rankings)) rankings = [];
  } catch {
    // Fallback heuristic if AI JSON fails
    rankings = students.map(s => {
      const overlap = stackOverlap(project.stack, s.stack);
      const score = Math.min(100, Math.round(
        (overlap.score * 40) +
        ((s.skillScore || 0) * 0.4) +
        (Math.min(s.completedProjects, 10) * 2)
      ));
      return {
        studentId: s.id,
        matchScore: score,
        reason: `Пересечение стека: ${overlap.common.join(', ') || 'нет'}`,
        recommendedRole: s.preferredStack || 'Developer',
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, topN);
  }

  // Normalize types
  rankings = rankings.map(r => ({
    ...r,
    studentId: parseInt(r.studentId, 10),
    matchScore: parseFloat(r.matchScore) || 0,
  })).filter(r => !isNaN(r.studentId));

  const results = [];
  for (const r of rankings.slice(0, topN)) {
    const student = students.find(s => s.id === r.studentId);
    if (!student) continue;

    const match = await prisma.teamMatch.upsert({
      where: {
        studentId_projectId: {
          studentId: student.id,
          projectId: project.id,
        },
      },
      update: {
        matchScore: r.matchScore,
        status: 'PROPOSED',
        proposedAt: new Date(),
        role: r.recommendedRole || null,
        notes: r.reason,        // ← PERSISTED: AI reasoning saved to DB
      },
      create: {
        studentId: student.id,
        projectId: project.id,
        matchScore: r.matchScore,
        status: 'PROPOSED',
        proposedAt: new Date(),
        role: r.recommendedRole || null,
        notes: r.reason,        // ← PERSISTED: AI reasoning saved to DB
      },
    });

    results.push({
      ...match,
      student: { name: student.name, email: student.email },
      hermesReason: r.reason,
    });
  }

  return results;
}

// ════════════════════════════════════════════════════
// ROUTER FACTORY
// ════════════════════════════════════════════════════
export default function studentRoutes(prisma, rateLimit, logEvent) {
  const router = express.Router();

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
    const MS = Number(process.env.NON_CRITICAL_TIMEOUT_MS || 4000);
    Promise.race([
      task(),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${taskName} timeout`)), MS)),
    ]).catch(err => console.error(`[non-critical] ${taskName} failed:`, err?.message || err));
  }

  // ═══════════════════════════════════════════════════
  // STUDENT PROFILES
  // ═══════════════════════════════════════════════════

  router.post('/students', rateLimit(60 * 60 * 1000, 3), validate(studentCreateSchema), async (req, res, next) => {
    try {
      const data = {
        ...req.validated,
        stack: parseStack(req.validated.stack),
        consent: Boolean(req.validated.consent),
        selfEmployed: Boolean(req.validated.selfEmployed),
        ndaSigned: Boolean(req.validated.ndaSigned),
        availableFrom: req.validated.availableFrom || null,
        maxHoursPerWeek: req.validated.maxHoursPerWeek ?? 20,
      };

      const student = await prisma.studentProfile.create({ data });

      res.status(201).json({ success: true, message: 'Профиль создан', id: student.id });

      runNonCritical('student.analytics', () => logEvent(prisma, {
        req,
        eventType: 'form_success',
        eventName: 'student_register',
        entityId: String(student.id),
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

  router.get('/students', async (req, res, next) => {
    try {
      const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const skip  = (page - 1) * limit;

      const where = { status: 'ACTIVE' };
      if (req.query.experience) where.experience = req.query.experience;
      if (req.query.stack) {
        where.stack = { hasSome: req.query.stack.split(',').map(s => s.trim()) };
      }

      const [students, total] = await Promise.all([
        prisma.studentProfile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { skillScore: 'desc' },
          select: {
            id: true, name: true, stack: true, preferredStack: true,
            experience: true, skillScore: true, codeQuality: true,
            docScore: true, speedScore: true, completedProjects: true,
            maxHoursPerWeek: true, availableFrom: true, about: true,
            portfolio: true, linkedIn: true, resumeUrl: true,
            telegram: true, createdAt: true,
          },
        }),
        prisma.studentProfile.count({ where }),
      ]);

      res.json({ success: true, data: students, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  });

  router.get('/students/leaderboard', async (req, res, next) => {
    try {
      const top = await prisma.studentProfile.findMany({
        where: { status: 'ACTIVE', skillScore: { not: null } },
        orderBy: { skillScore: 'desc' },
        take: Math.min(50, parseInt(req.query.limit, 10) || 10),
        select: {
          id: true, name: true, stack: true, preferredStack: true,
          skillScore: true, codeQuality: true, docScore: true,
          speedScore: true, experience: true, completedProjects: true,
        },
      });
      res.json({ success: true, data: top });
    } catch (err) { next(err); }
  });

  router.get('/students/:id', async (req, res, next) => {
    try {
      const student = await prisma.studentProfile.findUnique({
        where: { id: parseInt(req.params.id, 10) },
        include: {
          teamMatches: {
            include: {
              project: { select: { id: true, companyName: true, stack: true, budget: true, deadline: true } },
            },
            orderBy: { proposedAt: 'desc' },
            take: 10,
          },
        },
      });
      if (!student) return res.status(404).json({ success: false, error: 'Профиль не найден' });
      res.json({ success: true, data: student });
    } catch (err) { next(err); }
  });

  router.patch('/students/:id', validate(studentUpdateSchema), async (req, res, next) => {
    try {
      let data = { ...req.validated };
      if (data.stack) data.stack = parseStack(data.stack);
      if (data.availableFrom === '') data.availableFrom = null;
      data = cleanUpdate(data);

      const student = await prisma.studentProfile.update({
        where: { id: parseInt(req.params.id, 10) },
        data,
      });
      res.json({ success: true, data: student });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Профиль не найден' });
      next(err);
    }
  });

  router.delete('/students/:id', async (req, res, next) => {
    try {
      await prisma.studentProfile.delete({ where: { id: parseInt(req.params.id, 10) } });
      res.json({ success: true, message: 'Профиль удалён' });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Профиль не найден' });
      next(err);
    }
  });

  // ═══════════════════════════════════════════════════
  // TEAM MATCHES
  // ═══════════════════════════════════════════════════

  router.get('/matches', async (req, res, next) => {
    try {
      const matches = await prisma.teamMatch.findMany({
        orderBy: { proposedAt: 'desc' },
        take: 100,
        include: {
          student: { select: { id: true, name: true, email: true, stack: true, experience: true, skillScore: true } },
          project: { select: { id: true, companyName: true, stack: true, budget: true, deadline: true } },
        },
      });
      res.json({ success: true, data: matches });
    } catch (err) { next(err); }
  });

  router.get('/matches/:id', async (req, res, next) => {
    try {
      const match = await prisma.teamMatch.findUnique({
        where: { id: parseInt(req.params.id, 10) },
        include: { student: true, project: true },
      });
      if (!match) return res.status(404).json({ success: false, error: 'Матч не найден' });
      res.json({ success: true, data: match });
    } catch (err) { next(err); }
  });

  router.patch('/matches/:id', validate(matchDecisionSchema), async (req, res, next) => {
    try {
      const data = {};
      if (req.validated.status !== undefined) data.status = req.validated.status;
      if (req.validated.role !== undefined) data.role = req.validated.role;
      if (req.validated.isMentor !== undefined) data.isMentor = req.validated.isMentor;
      if (req.validated.rating !== undefined) data.rating = req.validated.rating;

      if (req.validated.status === 'ACCEPTED') data.acceptedAt = new Date();
      if (req.validated.status === 'COMPLETED') data.completedAt = new Date();

      const match = await prisma.teamMatch.update({
        where: { id: parseInt(req.params.id, 10) },
        data,
        include: { student: true },
      });

      if (['ACCEPTED', 'ACTIVE'].includes(req.validated.status)) {
        await prisma.studentProfile.update({
          where: { id: match.studentId },
          data: { status: 'MATCHED' },
        });
      } else if (['DECLINED', 'DROPPED'].includes(req.validated.status)) {
        const active = await prisma.teamMatch.count({
          where: {
            studentId: match.studentId,
            status: { in: ['ACCEPTED', 'ACTIVE'] },
          },
        });
        if (active === 0) {
          await prisma.studentProfile.update({
            where: { id: match.studentId },
            data: { status: 'ACTIVE' },
          });
        }
      }

      res.json({ success: true, data: match });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Матч не найден' });
      next(err);
    }
  });

  // ═══════════════════════════════════════════════════
  // HERMES TRIGGER (per-project)
  // ═══════════════════════════════════════════════════

  router.post('/projects/:id/match', rateLimit(60 * 1000, 5), async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.id, 10);
      if (isNaN(projectId)) return res.status(400).json({ success: false, error: 'Invalid project ID' });

      const topN = req.query.top ? parseInt(req.query.top, 10) : 5;
      const matches = await hermesMatchProject(prisma, projectId, topN);

      res.json({
        success: true,
        matched: matches.length,
        data: matches.map(m => ({
          matchId: m.id,
          studentId: m.studentId,
          studentName: m.student?.name,
          matchScore: m.matchScore,
          status: m.status,
          role: m.role,
          hermesReason: m.hermesReason,
        })),
      });
    } catch (err) { next(err); }
  });

  return router;
}
