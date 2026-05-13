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

const projectSchema = z.object({
  companyName: requiredString('Название компании').min(2, 'Название компании должно быть не короче 2 символов').max(160, 'Название компании слишком длинное'),
  contactName: requiredString('Контактное лицо').min(2, 'Контактное лицо должно быть не короче 2 символов').max(160, 'Контактное лицо слишком длинное'),
  email,
  stack: requiredString('Стек').min(2, 'Опишите стек подробнее').max(300, 'Описание стека слишком длинное'),
  description: requiredString('Описание проекта').min(20, 'Описание проекта должно быть не короче 20 символов').max(8000, 'Описание проекта слишком длинное'),
  budget: requiredString('Бюджет').max(120, 'Бюджет слишком длинный'),
  deadline: requiredString('Дедлайн')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Введите корректный дедлайн')
    .transform((value) => new Date(value))
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
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : true,
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('tiny'));

  app.get('/api/health', (req, res) => {
    res.json({ success: true, service: 'tochka-sborki-api' });
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
      res.status(201).json({ success: true, message: 'Сообщение отправлено. Мы свяжемся с вами.', id: doc._id });
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
      res.status(201).json({ success: true, message: 'Подписка оформлена.', id: doc._id });
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
      res.status(201).json({ success: true, message: 'Техническое задание отправлено. Мы свяжемся с вами.', id: doc._id });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error(error);
    if (error.message === 'MONGO_URI не задан') {
      return res.status(400).json({ success: false, error: 'База данных не настроена' });
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Такая запись уже существует' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: 'Проверьте поля формы' });
    }
    if (error.name === 'MongooseServerSelectionError' || ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEOUT'].includes(error.code)) {
      return res.status(400).json({ success: false, error: 'Не удалось подключиться к базе данных' });
    }
    return res.status(400).json({ success: false, error: 'Внутренняя ошибка сервера' });
  });

  return app;
}
