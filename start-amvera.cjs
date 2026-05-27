require('dotenv/config');
const fs = require('fs');
const path = require('path');

// Defensive check: verify dist/ exists before starting
const distPath = path.join(__dirname, 'dist');
const distIndexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(distPath)) {
  console.error('❌ CRITICAL: dist/ folder not found. Frontend build output is missing.');
  console.error('   This usually means dist/ was excluded from deployment (check .amveraignore)');
  console.error('   or the build step (vite build) failed to produce output.');
  process.exit(1);
}

if (!fs.existsSync(distIndexPath)) {
  console.error('❌ CRITICAL: dist/index.html not found. Frontend build is incomplete.');
  process.exit(1);
}

console.log('✅ Frontend build verified:', distIndexPath);

async function main() {
  const [{ PrismaClient }, { PrismaPg }, pgModule, appModule] = await Promise.all([
    import('@prisma/client'),
    import('@prisma/adapter-pg'),
    import('pg'),
    import('./server/app.js')
  ]);

  const { Pool } = pgModule.default || pgModule;
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ CRITICAL: DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
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
    console.log(`🚀 API + Frontend запущены на порту ${port}`);
    console.log(`   Health check: http://0.0.0.0:${port}/api/health`);
  });
}

main().catch((error) => {
  console.error('❌ Не удалось запустить Amvera API:', error);
  process.exit(1);
});