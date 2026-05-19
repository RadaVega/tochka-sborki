# Яндекс Метрика + Server Analytics Integration Guide
## Точка Сборки — tochka-sborki

---

## Files to copy from this package

| File in this package       | Copy to in your repo                          |
|----------------------------|-----------------------------------------------|
| `index.html`               | `index.html` (root — replace existing)        |
| `useAnalytics.js`          | `src/hooks/useAnalytics.js`                   |
| `PageTracker.jsx`          | `src/components/PageTracker.jsx`              |
| `App.jsx`                  | `src/App.jsx` (replace existing)              |
| `ErrorBoundary.jsx`        | `src/components/ErrorBoundary.jsx`            |
| `Tracked.jsx`              | `src/components/Tracked.jsx`                  |
| `analytics.js`             | `server/analytics.js`                         |
| `app.js`                   | `server/app.js` (replace existing)            |
| `schema.prisma`            | `prisma/schema.prisma` (merge models)         |

---

## Step 1 — Create your Яндекс Метрика counter (10 min)

1. Go to **https://metrika.yandex.ru**
2. Sign in with your Яндекс account (or create one — it's free)
3. Click **Добавить счётчик**
4. Fill in:
   - **Название**: Точка Сборки
   - **Адрес сайта**: `tochka-sborki-five.vercel.app`
   - **Часовой пояс**: Moscow (UTC+3)
5. Enable:
   - ✅ **Вебвизор** (session recordings — essential)
   - ✅ **Карта кликов** (click heatmaps)
   - ✅ **Отслеживание форм** (form analytics)
6. Click **Создать счётчик**
7. Copy your **counter number** (8–9 digit number shown in the dashboard)

---

## Step 2 — Add counter number to index.html

Replace **both** occurrences of `XXXXXXXX` in `index.html` with your real number:

```html
<!-- Find these lines: -->
ym(XXXXXXXX, 'init', {
<img src="https://mc.yandex.ru/watch/XXXXXXXX"
```

Example (if your number is `98765432`):
```html
ym(98765432, 'init', {
<img src="https://mc.yandex.ru/watch/98765432"
```

---

## Step 3 — Add counter number to useAnalytics.js

```js
// In src/hooks/useAnalytics.js, line 22:
const METRIKA_ID = window.__YM_COUNTER_ID__ || 'XXXXXXXX';
//                                              ^^^^^^^^^ replace this
```

**Better approach — use an env variable** (no hardcoding in code):

In `.env` (and Vercel environment settings):
```
VITE_YM_COUNTER_ID=98765432
```

Then in `index.html` add before the Metrika script:
```html
<script>window.__YM_COUNTER_ID__ = '%VITE_YM_COUNTER_ID%';</script>
```

And Vite will substitute it at build time.

---

## Step 4 — Run Prisma migration

```bash
# From your repo root:
npx prisma migrate dev --name add_analytics_event
npx prisma generate
```

This creates the `AnalyticsEvent` table in your Supabase/Postgres database.

Verify it worked:
```bash
npx prisma studio
# Opens a GUI at localhost:5555 — you should see AnalyticsEvent in the sidebar
```

---

## Step 5 — Set environment variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

| Variable        | Value                          | Notes                        |
|-----------------|--------------------------------|------------------------------|
| `ADMIN_KEY`     | any long random string         | Protects /api/analytics/summary |
| `VITE_YM_COUNTER_ID` | your 8-digit counter number | Used by frontend analytics hook |
| `CLIENT_ORIGIN` | `https://tochka-sborki-five.vercel.app` | CORS allowed origin |

---

## Step 6 — Create Goals in Яндекс Метрика UI

After deploying, create these goals at **Metrika → Цели → Добавить цель → JavaScript-событие**:

| Goal identifier             | Display name                    | Priority |
|-----------------------------|---------------------------------|----------|
| `COMPANY_FORM_SUCCESS`      | Заявка компании — успех         | 🔴 High  |
| `STUDENT_FORM_SUCCESS`      | Заявка студента — успех         | 🔴 High  |
| `HERO_CTA_COMPANY`          | Hero CTA — компании             | 🟠 Med   |
| `HERO_CTA_STUDENT`          | Hero CTA — студенты             | 🟠 Med   |
| `CONTACT_FORM_SUCCESS`      | Контакт форма — успех           | 🟠 Med   |
| `SUBSCRIBE_SUCCESS`         | Подписка на дайджест            | 🟡 Low   |
| `CONTACT_CHANNEL_CLICK`     | Клик по каналу связи            | 🟡 Low   |
| `OPEN_MAX_CHANNEL`          | Переход в MAX Messenger         | 🟡 Low   |
| `OPEN_VK_GROUP`             | Переход в VК группу             | 🟡 Low   |
| `FAQ_OPEN`                  | Раскрытие FAQ-вопроса           | 🟡 Low   |

Each goal identifier must match exactly what you pass to `goal('GOAL_IDENTIFIER')` in code.

---

## Step 7 — Add tracking to existing CTA buttons

Replace key buttons with tracked versions. Example — in `Pages.jsx` hero section:

```jsx
// Before:
import { Link } from 'react-router-dom';
<Link to="/company-path" className="primary-button">Для компаний →</Link>

// After:
import { TrackedLink } from '../components/Tracked';
<TrackedLink to="/company-path" goal="HERO_CTA_COMPANY" className="primary-button">
  Для компаний →
</TrackedLink>
```

For form submit buttons — add goal firing on success in your existing form handlers:

```jsx
// In your form onSubmit success handler:
const { goal } = useAnalytics();

try {
  await submitForm(data);
  goal('COMPANY_FORM_SUCCESS', { budget: data.budget });  // ← add this
  setSuccess('✅ Заявка отправлена!');
} catch (err) {
  goal('COMPANY_FORM_ERROR', { reason: err.message });   // ← and this
  setError(err.message);
}
```

---

## Step 8 — Test locally

```bash
# Start dev server
npm run dev

# Open browser DevTools Console
# You should see logs like:
[Analytics] goal: HERO_CTA_COMPANY {}
[Analytics] track: page_view { page: '/company-path', name: 'Для компаний' }
[Analytics] scroll depth: 50% on Для компаний
```

All `[Analytics]` logs only appear in development (`import.meta.env.DEV`).
In production, calls go silently to Metrika.

---

## Step 9 — Verify in Metrika dashboard

After deploying to Vercel:

1. Go to **metrika.yandex.ru → Your counter → Сводка**
2. Open your site in an incognito browser window
3. Navigate through a few pages, click some buttons
4. Metrika shows data with ~30-second delay in real-time mode
5. Go to **Отчёты → Стандартные → Источники → Прямые заходы** to see your test visit

---

## Step 10 — Check server-side analytics

```bash
# View the summary dashboard (replace YOUR_KEY):
curl "https://tochka-sborki-five.vercel.app/api/analytics/summary?key=YOUR_ADMIN_KEY"

# Expected response:
{
  "totals": {
    "contacts": 3,
    "subscribers": 12,
    "projects": 1,
    "events": 47
  },
  "eventsByType": [
    { "type": "form_submit",  "count": 8 },
    { "type": "form_success", "count": 6 },
    { "type": "form_error",   "count": 2 }
  ],
  "eventsByName": [
    { "name": "contact",            "count": 6 },
    { "name": "project_submission", "count": 4 },
    { "name": "subscribe",          "count": 10 }
  ],
  ...
}
```

---

## What you can now measure

### In Яндекс Метрика:
- 📊 **Which pages users visit** and in what order (funnel)
- 🖱️ **Where users click** (click heatmap)  
- 📽️ **Session recordings** — watch real users navigate (Вебвизор)
- 📉 **Scroll depth** — how far users read each page
- 🎯 **Goal conversions** — form submits, CTA clicks, channel opens
- 📱 **Device breakdown** — mobile vs desktop
- 🗺️ **Geography** — where visitors are from

### In your database (Prisma):
- ✅ Every form submission with timestamp and IP
- ✅ Success vs error rates per form
- ✅ Which pages submissions come from
- ✅ Daily/weekly submission counts
- ✅ Server-verified data (can't be blocked by ad blockers)

---

## Estimated time to complete all steps
| Step | Time |
|------|------|
| Create Metrika counter | 5 min |
| Copy files + replace IDs | 15 min |
| Prisma migration | 5 min |
| Set Vercel env vars | 5 min |
| Create Metrika goals | 10 min |
| Add tracking to 5 key CTAs | 20 min |
| Test + verify | 15 min |
| **Total** | **~75 minutes** |
