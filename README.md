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

Фронтенд откроется на `http://localhost:5173`.

Для отдельного API-сервера:

```bash
npm run dev:api
```

API будет доступен на `http://localhost:3001/api/health`; Vite проксирует `/api` на этот порт.

## Переменные окружения

```bash
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/tochka-sborki
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=mailer@example.com
EMAIL_PASS=change-me
EMAIL_FROM="Точка Сборки <mailer@example.com>"
EMAIL_TO=team@tochka-sborki.ru
```

Если SMTP-переменные не заданы, API сохранит заявки в MongoDB, но пропустит email-уведомления.

## API

- `POST /api/contact`: `name`, `email`, `message`.
- `POST /api/subscribe`: `email`.
- `POST /api/submit-project`: `companyName`, `contactName`, `email`, `stack`, `description`, `budget`, `deadline`.

Все endpoints валидируют входные данные через Zod и сохраняют записи в MongoDB.

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

Перед `vercel --prod` убедитесь, что в проекте Vercel заданы `MONGO_URI` и email-переменные.
