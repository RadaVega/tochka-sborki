import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';
import { connectDb } from './db.js';
import { sendMail } from './mailer.js';
import { Contact } from './models/Contact.js';
import { Subscriber } from './models/Subscriber.js';
import { ProjectSubmission } from './models/ProjectSubmission.js';

const email = z.string().email('Некорректный email').trim().toLowerCase();

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  message: z.string().trim().min(10).max(4000)
});

const subscribeSchema = z.object({
  email
});

const projectSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(160),
  email,
  stack: z.string().trim().min(2).max(300),
  description: z.string().trim().min(20).max(8000),
  budget: z.string().trim().min(1).max(120),
  deadline: z.coerce.date()
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Проверьте поля формы',
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
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : true,
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('tiny'));

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'tochka-sborki-api' });
  });

  app.post('/api/contact', validate(contactSchema), async (req, res, next) => {
    try {
      await connectDb();
      const doc = await Contact.create(req.validated);
      await sendMail({
        subject: 'Новая заявка с сайта Точка Сборки',
        replyTo: req.validated.email,
        text: `Имя: ${req.validated.name}\nEmail: ${req.validated.email}\n\n${req.validated.message}`
      });
      res.status(201).json({ ok: true, id: doc._id });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/subscribe', validate(subscribeSchema), async (req, res, next) => {
    try {
      await connectDb();
      const doc = await Subscriber.findOneAndUpdate(
        { email: req.validated.email },
        { $setOnInsert: req.validated },
        { new: true, upsert: true }
      );
      await sendMail({
        subject: 'Новая подписка на новости Точка Сборки',
        replyTo: req.validated.email,
        text: `Email: ${req.validated.email}`
      });
      res.status(201).json({ ok: true, id: doc._id });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/submit-project', validate(projectSchema), async (req, res, next) => {
    try {
      await connectDb();
      const doc = await ProjectSubmission.create(req.validated);
      await sendMail({
        subject: 'Новое ТЗ от компании для Точки Сборки',
        replyTo: req.validated.email,
        text: [
          `Компания: ${req.validated.companyName}`,
          `Контакт: ${req.validated.contactName}`,
          `Email: ${req.validated.email}`,
          `Стек: ${req.validated.stack}`,
          `Бюджет: ${req.validated.budget}`,
          `Дедлайн: ${req.validated.deadline.toISOString().slice(0, 10)}`,
          '',
          req.validated.description
        ].join('\n')
      });
      res.status(201).json({ ok: true, id: doc._id });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error(error);
    if (error.message === 'MONGO_URI не задан') {
      return res.status(503).json({ message: 'База данных не настроена' });
    }
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  });

  return app;
}
