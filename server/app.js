/**
 * server/routes/students.js — ES Module version
 * Routes: student profiles, team matching, Hermes AI matcher
 */

'use strict';

import express from 'express';
import { z } from 'zod';

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
// ROUTER FACTORY
// ════════════════════════════════════════════════════
export default function studentRoutes(prisma, rateLimit, logEvent) {
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
        where.stack = { hasSome: req.query.stack.split(',').map((s) => s.trim()) };
      }

      const [students, total] = await Promise.all([
        prisma.studentProfile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { skillScore: 'desc' },
          select: {
            id: true,
            name: true,
            stack: true,
            experience: true,
            skillScore: true,
            completedProjects: true,
            availability: true,
            hourlyRate: true,
            bio: true,
            portfolioUrl: true,
            githubUrl: true,
            telegram: true,
            createdAt: true,
          },
        }),
        prisma.studentProfile.count({ where }),
      ]);

      res.json({
        success: true,
        data: students,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/students/:id — single profile
  router.get('/students/:id', async (req, res, next) => {
    try {
      const student = await prisma.studentProfile.findUnique({
        where: { id: req.params.id },
        include: {
          teamMatches: {
            include: {
              project: { select: { companyName: true, stack: true, budget: true, status: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!student) return res.status(404).json({ success: false, error: 'Профиль не найден' });

      res.json({ success: true, data: student });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/students/:id — update profile
  router.patch('/students/:id', validate(studentUpdateSchema), async (req, res, next) => {
    try {
      const updateData = { ...req.validated };
      if (updateData.stack) updateData.stack = parseStack(updateData.stack);

      const student = await prisma.studentProfile.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.json({ success: true, data: student });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Профиль не найден' });
      next(err);
    }
  });

  // DELETE /api/students/:id — remove profile
  router.delete('/students/:id', async (req, res, next) => {
    try {
      await prisma.studentProfile.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Профиль удалён' });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Профиль не найден' });
      next(err);
    }
  });

  // ═══════════════════════════════════════════════════
  // TEAM MATCH ROUTES
  // ═══════════════════════════════════════════════════

  // GET /api/matches — list all matches (admin view)
  router.get('/matches', async (req, res, next) => {
    try {
      const matches = await prisma.teamMatch.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          student: { select: { id: true, name: true, email: true, stack: true, experience: true } },
          project: { select: { id: true, companyName: true, stack: true, budget: true, deadline: true } },
        },
      });
      res.json({ success: true, data: matches });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/matches/:id
  router.get('/matches/:id', async (req, res, next) => {
    try {
      const match = await prisma.teamMatch.findUnique({
        where: { id: req.params.id },
        include: {
          student: true,
          project: true,
        },
      });
      if (!match) return res.status(404).json({ success: false, error: 'Матч не найден' });
      res.json({ success: true, data: match });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/matches/:id — update match status
  router.patch('/matches/:id', validate(matchDecisionSchema), async (req, res, next) => {
    try {
      const match = await prisma.teamMatch.update({
        where: { id: req.params.id },
        data: {
          status: req.validated.status,
          metadata: {
            note: req.validated.note,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      // If accepted, mark student as busy
      if (req.validated.status === 'ACCEPTED' || req.validated.status === 'ACTIVE') {
        await prisma.studentProfile.update({
          where: { id: match.studentId },
          data: { status: 'BUSY' },
        });
      }

      res.json({ success: true, data: match });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Матч не найден' });
      next(err);
    }
  });

  // POST /api/projects/:id/match — trigger Hermes for a specific project
  router.post('/projects/:id/match', rateLimit(60 * 1000, 5), async (req, res, next) => {
    try {
      const matches = await hermesMatchProject(prisma, req.params.id, req.query.top ? parseInt(req.query.top, 10) : 5);
      res.json({
        success: true,
        matched: matches.length,
        data: matches.map((m) => ({
          matchId: m.id,
          studentId: m.studentId,
          studentName: m.student?.name,
          matchScore: m.matchScore,
          status: m.status,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  // ═══════════════════════════════════════════════════
  // ANALYTICS / HEALTH
  // ═══════════════════════════════════════════════════

  // GET /api/students/leaderboard — top students by skillScore
  router.get('/students/leaderboard', async (req, res, next) => {
    try {
      const top = await prisma.studentProfile.findMany({
        where: { status: 'ACTIVE', skillScore: { not: null } },
        orderBy: { skillScore: 'desc' },
        take: Math.min(50, parseInt(req.query.limit, 10) || 10),
        select: {
          id: true,
          name: true,
          stack: true,
          skillScore: true,
          experience: true,
          completedProjects: true,
        },
      });
      res.json({ success: true, data: top });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export { hermesMatchProject };