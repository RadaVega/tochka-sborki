// start-amvera.js — точка входа для Amvera
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Загружаем dotenv/config через require (гарантированно CommonJS‑совместимо)
require('dotenv/config');

// Express-приложение (ESM‑импорт работает нормально)
import { createApp } from './server/app.js';

// PrismaClient — только через require, иначе ошибка Named export not found
const { PrismaClient } = require('@prisma/client');

// Создаём Prisma-клиент
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Проверка подключения к базе данных
prisma.$connect()
  .then(() => {
    console.log('✅ Подключение к базе данных установлено');
  })
  .catch((error) => {
    console.error('❌ Ошибка подключения к БД:', error.message);
  });

const port = Number(process.env.PORT || 3001);
const app = createApp();

// Передаём prisma-клиент в приложение (чтобы не зависеть от server/db.js)
app.locals.prisma = prisma;

app.listen(port, () => {
  console.log(`API запущен на порту ${port}`);
});