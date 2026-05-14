import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

// ── Prisma для serverless ──
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

// ── Транспорт для писем ──
let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

// ── Валидация ──
const requiredString = (field) => z.string({ required_error: `${field} обязательно` }).trim().min(1, `${field} обязательно`);
const email = z.string({ required_error: 'Email обязателен' }).trim().email('Введите корректный email').toLowerCase();

const contactSchema = z.object({
  name: requiredString('Имя').min(2).max(120),
  email,
  message: requiredString('Сообщение').min(10).max(4000)
});
const subscribeSchema = z.object({ email });
const projectSchema = z.object({
  companyName: requiredString('Название компании').min(2).max(160),
  contactName: requiredString('Контактное лицо').min(2).max(160),
  email,
  phone: z.string().trim().max(80).optional().or(z.literal('')),
  stack: z.union([z.array(z.string().trim().min(1)), requiredString('Стек')])
    .transform(v => Array.isArray(v) ? v : v.split(/[,;\n]/).map(s => s.trim()).filter(Boolean))
    .refine(v => v.length > 0, 'Укажите хотя бы одну технологию'),
  description: requiredString('Описание проекта').min(20).max(8000),
  budget: requiredString('Бюджет').max(120),
  deadline: requiredString('Дедлайн')
    .refine(v => !isNaN(Date.parse(v)), 'Введите корректный дедлайн')
    .transform(v => new Date(v).toISOString().slice(0, 10)),
  fileUrl: z.string().trim().url().optional().or(z.literal(''))
});

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
    next();
  };
}

// ── Приложение ──
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

app.get('/api/health', (req, res) => res.json({ success: true, service: 'tochka-sborki-api' }));

app.post('/api/contact', validate(contactSchema), async (req, res, next) => {
  try {
    const doc = await prisma.contact.create({ data: req.validated });
    try {
      await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        replyTo: req.validated.email,
        subject: 'Новая заявка с сайта Точка Сборки',
        text: `Имя: ${req.validated.name}\nEmail: ${req.validated.email}\n\n${req.validated.message}`
      });
    } catch (e) { console.error('Ошибка отправки письма:', e.message); }
    res.status(201).json({ success: true, message: 'Сообщение отправлено. Мы свяжемся с вами.', id: doc.id });
  } catch (error) { next(error); }
});

app.post('/api/subscribe', validate(subscribeSchema), async (req, res, next) => {
  try {
    const doc = await prisma.subscriber.upsert({ where: { email: req.validated.email }, update: {}, create: req.validated });
    try {
      await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        replyTo: req.validated.email,
        subject: 'Новая подписка на новости Точка Сборки',
        text: `Email: ${req.validated.email}`
      });
    } catch (e) { console.error('Ошибка отправки письма:', e.message); }
    res.status(201).json({ success: true, message: 'Подписка оформлена.', id: doc.id });
  } catch (error) { next(error); }
});

app.post('/api/submit-project', validate(projectSchema), async (req, res, next) => {
  try {
    const doc = await prisma.projectSubmission.create({ data: req.validated });
    try {
      await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        replyTo: req.validated.email,
        subject: 'Новое ТЗ от компании для Точки Сборки',
        text: [
          `Компания: ${req.validated.companyName}`,
          `Контакт: ${req.validated.contactName}`,
          `Email: ${req.validated.email}`,
          `Телефон: ${req.validated.phone || 'не указан'}`,
          `Стек: ${req.validated.stack.join(', ')}`,
          `Бюджет: ${req.validated.budget}`,
          `Дедлайн: ${req.validated.deadline}`,
          `Файл ТЗ: ${req.validated.fileUrl || 'не указан'}`,
          '',
          req.validated.description
        ].join('\n')
      });
    } catch (e) { console.error('Ошибка отправки письма:', e.message); }
    res.status(201).json({ success: true, message: 'Техническое задание отправлено. Мы свяжемся с вами.', id: doc.id });
  } catch (error) { next(error); }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(error);
  if (error.code === 'P2002') return res.status(400).json({ success: false, error: 'Такая запись уже существует' });
  res.status(400).json({ success: false, error: 'Внутренняя ошибка сервера' });
});

export default app;