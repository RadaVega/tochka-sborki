require('dotenv/config');

async function main() {
  const [{ PrismaClient }, { PrismaPg }, pgModule, appModule] = await Promise.all([
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

  prisma.$connect()
    .then(() => console.log('✅ Подключение к базе данных установлено'))
    .catch((error) => console.error('❌ Ошибка подключения к БД:', error.message));

  const port = Number(process.env.PORT || 80);
  
  const createApp = appModule.default || appModule.createApp;
  if (!createApp) {
    throw new Error('createApp not found in server/app.js export');
  }
  
  const app = createApp(prisma);
  app.locals.prisma = prisma;
  app.locals.pgPool = pool;

  app.listen(port, '0.0.0.0', () => {
    console.log(`API запущен на порту ${port}`);
  });
}

main().catch((error) => {
  console.error('❌ Не удалось запустить Amvera API:', error);
  process.exit(1);
});