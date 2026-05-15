require('dotenv/config');

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

  prisma.$connect()
    .then(() => console.log('✅ Подключение к базе данных установлено'))
    .catch((error) => console.error('❌ Ошибка подключения к БД:', error.message));

  const port = Number(process.env.PORT || 3001);
  const app = createApp();
  app.locals.prisma = prisma;
  app.locals.pgPool = pool;

  app.listen(port, () => {
    console.log(`API запущен на порту ${port}`);
  });
}

main().catch((error) => {
  console.error('❌ Не удалось запустить Amvera API:', error);
  process.exit(1);
});
