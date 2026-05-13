# Переменные окружения Vercel

Добавьте переменные в Vercel: **Project → Settings → Environment Variables**. Для production, preview и development лучше использовать одинаковый набор ключей, но разные значения при необходимости.

## Обязательные переменные

| Переменная | Где взять значение |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas → Database → Connect → Drivers. Формат: `mongodb+srv://USER:PASSWORD@HOST/tochka-sborki`. |
| `CLIENT_URL` | URL фронтенда. Для production: `https://tochka-sborki-five.vercel.app`. Для локальной разработки: `http://localhost:5173`. |
| `EMAIL_HOST` | SMTP-хост. Для Яндекса: `smtp.yandex.ru`. |
| `EMAIL_PORT` | SMTP-порт. Для Яндекса с STARTTLS: `587`. |
| `EMAIL_USER` | Почта отправителя: `tochka.sborki21@vk.com`. |
| `EMAIL_PASS` | Пароль приложения SMTP. Создаётся в настройках почтового аккаунта/провайдера. |
| `EMAIL_FROM` | Строка отправителя: `"Точка Сборки <tochka.sborki21@vk.com>"`. |
| `EMAIL_TO` | Адрес получателя уведомлений: `tochka.sborki21@vk.com`. |
| `ADMIN_PASSWORD` | Пароль администратора. Для production замените `admin123` на длинный случайный пароль. |

## Как добавить

1. Откройте Vercel project `tochka-sborki`.
2. Перейдите в **Settings → Environment Variables**.
3. Добавьте каждую переменную из таблицы.
4. Выберите окружения: Production, Preview, Development.
5. Нажмите **Save**.
6. Перезапустите деплой через **Deployments → Redeploy** или сделайте новый push в `main`.

## Проверка

После деплоя проверьте:

```bash
curl https://tochka-sborki-five.vercel.app/api/health
```

Для POST-проверок используйте `test-api.sh`:

```bash
BASE_URL=https://tochka-sborki-five.vercel.app ./test-api.sh
```
