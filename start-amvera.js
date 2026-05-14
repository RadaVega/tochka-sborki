import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Загружаем PrismaClient через require (CommonJS-совместимый способ)
const { PrismaClient } = require('@prisma/client');

// Всё остальное — как обычно
import 'dotenv/config';
import { createApp } from './server/app.js';
import { ensureDbConnection } from './server/db-check.js';

const port = Number(process.env.PORT || 3001);
const app = createApp();

ensureDbConnection().then((ok) => {
  if (!ok) {
    console.warn('⚠️ Сервер запущен без БД — проверьте DATABASE_URL');
  }
});

app.listen(port, () => {
  console.log(`API запущен на порту ${port}`);
});