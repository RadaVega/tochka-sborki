import 'dotenv/config';
import { createApp } from './app.js';
import { ensureDbConnection } from './db-check.js';

const port = Number(process.env.PORT || 3001);
const app = createApp();

// Проверяем БД, но не блокируем запуск
ensureDbConnection().then((ok) => {
  if (!ok) {
    console.warn('⚠️ Сервер запущен без БД — проверьте DATABASE_URL');
  }
});

// 🔧 FIX: Слушаем 0.0.0.0 вместо localhost для работы в Docker/Amvera
app.listen(port, '0.0.0.0', () => {
  console.log(`API запущен: http://0.0.0.0:${port}`);
});