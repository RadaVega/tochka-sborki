import 'dotenv/config';
import { createApp } from './server/app.js';
import { ensureDbConnection } from './server/db-check.js';

const port = Number(process.env.PORT || 3001);
const app = createApp();

ensureDbConnection().then((ok) => {
  if (!ok) console.warn('⚠️ Сервер запущен без БД — проверьте DATABASE_URL');
});

app.listen(port, () => {
  console.log(`API запущен на порту ${port}`);
});