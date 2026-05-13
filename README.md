# Точка Сборки | Assembly Point

Многостраничный React/Node.js сайт проекта «Точка Сборки» по презентации `tochka_FINAL_v8.html`.

## Стек

- Frontend: React 18, Vite, React Router v6, Tailwind CSS, Framer Motion, react-hook-form.
- Backend: Node.js, Express, Mongoose/MongoDB, Nodemailer, Helmet, CORS, Morgan, Zod.
- Deploy: Vercel, SPA rewrites, `/api/*` как serverless API.

## Локальный запуск

```bash
npm install
cp .env.example .env
npm run dev
```

`npm run dev` запускает Express API и Vite dev server одновременно.

- Фронтенд: `http://localhost:5173`
- API healthcheck: `http://localhost:3001/api/health`

Если нужно запустить части отдельно:

```bash
npm run dev:client
npm run dev:api
```

Vite проксирует `/api` на `http://localhost:3001`.

## Переменные окружения

```bash
MONGO_URI=mongodb+srv://aok:27043@cluster0.xxxxx.mongodb.net/tochka-sborki
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.yandex.ru
EMAIL_PORT=587
EMAIL_USER=tochka.sborki21@vk.com
EMAIL_PASS=ТВОЙ_ПАРОЛЬ_ПРИЛОЖЕНИЯ_ЯНДЕКС
EMAIL_FROM="Точка Сборки <tochka.sborki21@vk.com>"
EMAIL_TO=tochka.sborki21@vk.com
ADMIN_PASSWORD=admin123
```

Если SMTP-переменные не заданы, API сохранит заявки в MongoDB, но пропустит email-уведомления.

## API

- `POST /api/contact`: `name`, `email`, `message`.
- `POST /api/subscribe`: `email`.
- `POST /api/submit-project`: `companyName`, `contactName`, `email`, `stack`, `description`, `budget`, `deadline`.

Успешный ответ:

```json
{ "success": true, "message": "Сообщение отправлено. Мы свяжемся с вами." }
```

Ошибка валидации:

```json
{ "success": false, "error": "Проверьте поля формы", "errors": { "email": ["Введите корректный email"] } }
```

Все endpoints валидируют входные данные через Zod и сохраняют записи в MongoDB.

Повторяемая проверка API:

```bash
chmod +x test-api.sh
./test-api.sh
BASE_URL=https://tochka-sborki-five.vercel.app ./test-api.sh
```

## Каналы сообщества

- Email: `tochka.sborki21@vk.com`
- ВКонтакте: `https://vk.com/tochkasborki21`
- MAX Messenger: канал `⚡ Точка Сборки | Сигнал`; пригласительная ссылка будет размещена позже.
- Telegram: `https://t.me/tochka_sborki`

## Контент

Основные тексты сайта вынесены в `src/data/content.js`. Чтобы изменить заголовки, описания, метрики, контакты или списки, правьте этот файл без изменения React-компонентов.

## Маршруты сайта

`/`, `/problem`, `/solution`, `/how-it-works`, `/partners`, `/ai-architecture`, `/tech-stack`, `/communications`, `/student-path`, `/company-path`, `/money-flow`, `/industries`, `/mentors`, `/transformation`, `/goals`, `/contacts`.

## Деплой на Vercel

1. Создать MongoDB Atlas database и добавить `MONGO_URI`.
2. Добавить SMTP-переменные, если нужны уведомления.
3. Подключить GitHub repository к Vercel.
4. Убедиться, что Build Command: `npm run build`, Output Directory: `dist`.
5. Добавить env vars в Vercel Project Settings.

`vercel.json` уже настроен:

- `/api/(.*)` → `api/index.js`
- остальные маршруты → React SPA.

## GitHub + Vercel CLI

```bash
git init
git add .
git commit -m "Initial Assembly Point site"
gh repo create tochka-sborki --private --source=. --remote=origin --push
vercel --prod
```

Перед `vercel --prod` убедитесь, что в проекте Vercel заданы переменные из `docs/VERCEL_ENV.md`.
