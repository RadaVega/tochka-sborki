// start-amvera.cjs — точка входа для Amvera (полностью CommonJS)

// 1. Сначала загружаем переменные окружения
require('dotenv/config');

// 2. Загружаем PrismaClient через require (гарантированно работает с CJS)
const { PrismaClient } = require('@prisma/client');

// 3. Создаём Express-приложение
const { createApp } = require('./server/app.js');

// 4. Инициализируем Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// 5. Проверяем подключение к БД
prisma.$connect()
  .then(() => {
    console.log('✅ Подключение к базе данных установлено');
  })
  .catch((error) => {
    console.error('❌ Ошибка подключения к БД:', error.message);
  });

// 6. Запускаем сервер
const port = Number(process.env.PORT || 3001);
const app = createApp();

// Передаём prisma в приложение, чтобы маршруты могли его использовать
app.locals.prisma = prisma;

app.listen(port, () => {
  console.log(`API запущен на порту ${port}`);
});