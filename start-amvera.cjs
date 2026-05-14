require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { createApp } = require('./server/app.js');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

prisma.$connect()
  .then(() => console.log('✅ Подключение к базе данных установлено'))
  .catch((error) => console.error('❌ Ошибка подключения к БД:', error.message));

const port = Number(process.env.PORT || 3001);
const app = createApp();
app.locals.prisma = prisma;

app.listen(port, () => {
  console.log(`API запущен на порту ${port}`);
});