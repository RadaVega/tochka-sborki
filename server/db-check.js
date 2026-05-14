import { prisma } from './db.js';

export async function ensureDbConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Подключение к базе данных установлено');
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
    // Не прерываем запуск — сервер всё равно запустится, но без БД
    return false;
  }
}