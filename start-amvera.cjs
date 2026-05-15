// start-amvera.cjs — точка входа для Amvera (CommonJS)
require('dotenv/config');

// Ловим фатальные ошибки, чтобы процесс не падал молча
process.on('uncaughtException', (err) => {
  console.error('💥 Неперехваченное исключение:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 Необработанный reject:', reason);
});

async function main() {
  const [{ PrismaClient }, { PrismaPg }, pgModule, { createApp }] = await Promise.all([
    import('@prisma/client'),
    import('@prisma/adapter-pg'),
    import('pg'),
    import('./server/app.js')
  ]);

  const { Pool } = pgModule.default || pgModule;
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.$connect();
  console.log('✅ Подключение к базе данных установлено');

  const port = Number(process.env.PORT || 3001);
  const app = createApp();
  app.locals.prisma = prisma;
  app.locals.pgPool = pool;

  const server = app.listen(port, () => {
    console.log(`API запущен на порту ${port}`);
    // Явно сообщаем Amvera, что приложение готово
    if (process.send) {
      process.send('ready');
    }
  });

  // Корректное завершение по сигналам от платформы
  const shutdown = (signal) => {
    console.log(`Получен сигнал ${signal}, завершаю работу...`);
    server.close(() => {
      console.log('Сервер остановлен');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  console.error('❌ Не удалось запустить Amvera API:', error);
  process.exit(1);
});