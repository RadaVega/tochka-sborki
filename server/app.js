import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { z } from 'zod';
import { prisma as localPrisma } from './db.js';
import { sendMail } from './mailer.js';

const getPrisma = (req) => req.app?.locals?.prisma || localPrisma;
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : true;

const requiredString = (field) => z.string({ required_error: `${field} обязательно` }).trim().min(1, `${field} обязательно`);
const email = z.string({ required_error: 'Email обязателен' }).trim().email('Введите корректный email').toLowerCase();

const contactSchema = z.object({
  name: requiredString('Имя').min(2, 'Имя должно быть не короче 2 символов').max(120, 'Имя слишком длинное'),
  email,
  message: requiredString('Сообщение').min(10, 'Сообщение должно быть не короче 10 символов').max(4000, 'Сообщение слишком длинное')
});

const subscribeSchema = z.object({
  email
});

const stackField = z.union([
  z.array(z.string().trim().min(1, 'Название технологии не должно быть пустым')),
  requiredString('Стек')
]).transform((value) => {
  if (Array.isArray(value)) return value;
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}).refine((value) => value.length > 0, 'Укажите хотя бы одну технологию');

const projectSchema = z.object({
  companyName: requiredString('Название компании').min(2, 'Название компании должно быть не короче 2 символов').max(160, 'Название компании слишком длинное'),
  contactName: requiredString('Контактное лицо').min(2, 'Контактное лицо должно быть не короче 2 символов').max(160, 'Контактное лицо слишком длинное'),
  email,
  phone: z.string().trim().max(80, 'Телефон слишком длинный').optional().or(z.literal('')),
  stack: stackField,
  description: requiredString('Описание проекта').min(20, 'Описание проекта должно быть не короче 20 символов').max(8000, 'Описание проекта слишком длинное'),
  budget: requiredString('Бюджет').max(120, 'Бюджет слишком длинный'),
  deadline: requiredString('Дедлайн')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Введите корректный дедлайн')
    .transform((value) => new Date(value).toISOString().slice(0, 10)),
  fileUrl: z.string().trim().url('Введите корректную ссылку на файл').optional().or(z.literal(''))
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
    return next();
  };
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('tiny'));

  app.get('/api/health', (req, res) => {
    res.json({ success: true, service: 'tochka-sborki-api' });
  });

  app.post('/api/contact', validate(contactSchema), async (req, res, next) => {
    try {
      const doc = await getPrisma(req).contact.create({ data: req.validated });

      try {
        await sendMail({
          subject: 'Новая заявка с сайта Точка Сборки',
          replyTo: req.validated.email,
          text: `Имя: ${req.validated.name}\nEmail: ${req.validated.email}\n\n${req.validated.message}`
        });
      } catch (mailError) {
        console.error('Ошибка отправки письма:', mailError.message);
      }

      res.status(201).json({ success: true, message: 'Сообщение отправлено. Мы свяжемся с вами.', id: doc.id });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/subscribe', validate(subscribeSchema), async (req, res, next) => {
    try {
      const doc = await getPrisma(req).subscriber.upsert({
        where: { email: req.validated.email },
        update: {},
        create: req.validated
      });

      try {
        await sendMail({
          subject: 'Новая подписка на новости Точка Сборки',
          replyTo: req.validated.email,
          text: `Email: ${req.validated.email}`
        });
      } catch (mailError) {
        console.error('Ошибка отправки письма:', mailError.message);
      }

      res.status(201).json({ success: true, message: 'Подписка оформлена.', id: doc.id });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/submit-project', validate(projectSchema), async (req, res, next) => {
    try {
      const doc = await getPrisma(req).projectSubmission.create({ data: req.validated });

      try {
        await sendMail({
          subject: 'Новое ТЗ от компании для Точки Сборки',
          replyTo: req.validated.email,
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
      } catch (mailError) {
        console.error('Ошибка отправки письма:', mailError.message);
      }

      res.status(201).json({ success: true, message: 'Техническое задание отправлено. Мы свяжемся с вами.', id: doc.id });
    } catch (error) {
      next(error);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: distPath });
    });
  }

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Такая запись уже существует' });
    }
    if (['P1000', 'P1001', 'P1002', 'P1003'].includes(error.code)) {
      return res.status(400).json({ success: false, error: 'Не удалось подключиться к базе данных' });
    }
    return res.status(400).json({ success: false, error: 'Внутренняя ошибка сервера' });
  });

  return app;
}