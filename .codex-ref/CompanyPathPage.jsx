/**
 * CompanyPathPage — полная страница для компаний-заказчиков
 *
 * ИНТЕГРАЦИЯ:
 *   1. Скопируйте этот файл в src/pages/CompanyPathPage.jsx
 *   2. В src/pages/Pages.jsx замените:
 *        export function CompanyPathPage() {
 *          return <ProcessPage page={pages.companyPath} form={<InlineForm type="project" />} />;
 *        }
 *      на:
 *        export { CompanyPathPage } from './CompanyPathPage';
 *   3. CSS-переменные и классы используют существующий src/styles/index.css
 *   4. API endpoint /api/submit-project уже существует в server/app.js
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PageShell, Badge, Card, Checklist, Reveal, TagRow } from '../components/UI';
import { Logo } from '../components/Logo';

/* ─── tiny helper ─── */
const api = async (url, payload) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || data.message || 'Ошибка сервера');
  return data;
};

/* ═══════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════ */

function TrustStrip() {
  return (
    <div className="trust-strip">
      <span>🏦 <strong>Школа Цифровых Технологий Сбера</strong></span>
      <div className="trust-divider" />
      <span>🛡️ <strong>NDA + Эскроу-оплата</strong></span>
      <div className="trust-divider" />
      <span>⚡ <strong>No-Equity</strong></span>
    </div>
  );
}

function MetricPills() {
  const pills = [
    { val: '7 дней',   lbl: 'от заявки до старта',  cls: 'pink'   },
    { val: '50–200k',  lbl: '₽ за проект',           cls: 'cyan'   },
    { val: '2–4 нед.', lbl: 'длительность',          cls: 'purple' },
    { val: '15%',      lbl: 'комиссия платформы',    cls: 'green'  },
  ];
  return (
    <div className="metric-row">
      {pills.map(p => (
        <div key={p.val} className={`metric-pill metric-pill-${p.cls}`}>
          <span className="val">{p.val}</span>
          <span className="lbl">{p.lbl}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 6-Step Process ── */
const STEPS = [
  {
    num: '1', color: '', phase: 'День 1', title: '📝 Подача технического задания',
    text: 'Заполняете Project Brief: цель, стек, объём, бюджет, дедлайн. AI-агент Intake на YandexGPT оценивает выполнимость и предлагает уточнения — scope согласован за 2–4 часа.',
    tags: ['Яндекс Forms', 'YandexGPT API', 'AI-оценка за 2–4ч'],
    tagAccents: ['cyan', 'purple', 'green'],
  },
  {
    num: '2', color: 'cyan', phase: 'День 1–2', title: '✍️ Юридическое оформление',
    text: 'Цифровое подписание договора и NDA через Контур.Диадок с КЭП. Эскроу-схема: 50% аванс замораживается до финальной сдачи. Срок — 1–2 рабочих дня.',
    tags: ['Контур.Диадок', 'КриптоПро ЭЦП', 'Эскроу 50/50'],
    tagAccents: ['green', 'purple', 'cyan'],
  },
  {
    num: '3', color: 'green', phase: 'Дни 2–7', title: '🔗 AI-подбор команды',
    text: 'Оркестратор Hermes через DataSphere ML скорирует студентов и формирует 3 варианта состава. Вы утверждаете — 3–5 человек + ментор-техлид назначены.',
    tags: ['Hermes Orchestrator', 'DataSphere ML', '48ч на подбор'],
    tagAccents: ['green', 'cyan', 'purple'],
  },
  {
    num: '4', color: 'pink', phase: 'Неделя 1 · Kick-off', title: '👋 Старт: знакомство с командой',
    text: 'Видеозвонок в Яндекс Телемост: представление команды и ментора. Согласование DoD и формата работы. Вы получаете read-only доступ в GitVerse.',
    tags: ['Яндекс Телемост', 'Kaiten Board', 'GitVerse read-only'],
    tagAccents: ['purple', 'cyan', 'green'],
  },
  {
    num: '5', color: 'pink', phase: 'Недели 1–4 · Спринты', title: '⚡ Рабочий процесс — live-трекинг',
    text: 'Agile-спринты по 1–2 недели. Live-доступ в Kaiten в реальном времени. Демо каждую пятницу. AI-отчёт еженедельно. Эскалация блокеров за 4 часа.',
    tags: ['Kaiten Live', 'Weekly Demo', 'AI Progress Report', '4ч эскалация'],
    tagAccents: ['cyan', 'green', 'purple', 'pink'],
  },
  {
    num: '6', color: 'gold', phase: 'Финал', title: '🏆 Сдача, оплата и офферы',
    text: 'Финальное демо и peer-review. Акт через Контур.Диадок. Разблокировка эскроу — выплата через Мой налог за 24 часа. Лучших участников можете пригласить на оффер.',
    tags: ['Контур.Диадок', 'Мой налог 24ч', 'Оффер для лучших'],
    tagAccents: ['gold', 'green', 'purple'],
  },
];

function ProcessTimeline() {
  return (
    <div className="company-timeline">
      {STEPS.map((step, i) => (
        <Reveal key={step.num}>
          <div className="company-step">
            <div className={`company-step-num step-color-${step.color || 'purple'}`}>{step.num}</div>
            <div className="company-step-body">
              <div className="company-step-phase">{step.phase}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <TagRow tags={step.tags} />
            </div>
          </div>
        </Reveal>
      ))}
      <Card accent="cyan" className="company-step-note">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '1.8rem' }}>⚙️</span>
          <div><strong>80% процесса автоматизировано</strong> через оркестратор Hermes. Ментор фокусируется только на стратегических решениях — рутина уходит AI-агентам.</div>
        </div>
      </Card>
    </div>
  );
}

/* ── VS Comparison ── */
function ComparisonBlock() {
  return (
    <div className="company-vs">
      <div className="vs-bad">
        <div className="vs-label bad">❌ Альтернативы</div>
        <h3>Фриланс / Аутстаф / Джун-наём</h3>
        <ul className="vs-list bad">
          {['Онбординг 3–6 месяцев = деньги вникуда', 'Нет слаженности — незнакомые люди', 'Нет гарантии по срокам и качеству', 'HR-расходы + налоги + оборудование', 'Риск «взяли, обучили, ушли»'].map(t => <li key={t}>{t}</li>)}
        </ul>
      </div>
      <div className="vs-divider" aria-hidden="true">VS</div>
      <div className="vs-good">
        <div className="vs-label good">✅ Точка Сборки</div>
        <h3>Team-as-a-Service из ШЦТ Сбера</h3>
        <ul className="vs-list good">
          {['Команда стартует через 7 дней без онбординга', 'Сработанная группа под ваш стек', 'Фикс-прайс — гарантия результата', 'Самозанятые — ноль кадровых расходов', 'Готовый оффер лучшим участникам'].map(t => <li key={t}>{t}</li>)}
        </ul>
      </div>
    </div>
  );
}

/* ── Guarantees ── */
const GUARANTEES = [
  { icon: '⏱️', title: 'Риск срыва сроков', text: 'Чёткий scope согласован на Kick-off. 20% временной резерв в каждом спринте. Ментор-эскалация при блокере за 4 часа. AI-мониторинг 24/7.' },
  { icon: '📝', title: 'Риск размытого ТЗ', text: 'Обязательный Project Brief до подписания. AI-агент Intake уточняет требования. Без согласованного scope — не стартуем. Change Request через Kaiten.' },
  { icon: '👥', title: 'Риск потери участника', text: 'Ротационный пул 120+ студентов. Замена за 48 часов без доп. оплаты. Все задачи в Kaiten — передача без потерь.' },
  { icon: '💰', title: 'Риск не получить результат', text: 'Эскроу: 50% до подписания акта. Еженедельные демо для корректировки курса. Не соответствует DoD — доработка за наш счёт.' },
];

/* ── Pricing ── */
const PLANS = [
  {
    tier: 'Мини-проект', price: '50–80k', unit: '₽ · 2 недели · 3 чел.', accent: 'purple', featured: false,
    items: ['Прототип, MVP-фича, парсер', 'REST API, Telegram-бот, скрипт', 'Небольшой дашборд или утилита', 'Стек: Python / JS / Go'],
    cta: 'Оставить заявку →',
  },
  {
    tier: 'Стандарт', price: '100–150k', unit: '₽ · 3–4 недели · 4 чел.', accent: 'cyan', featured: true,
    items: ['Полноценный модуль или сервис', 'Web-приложение + backend API', 'Интеграция с внешними сервисами', 'Любой стек по вашим требованиям', 'Демо каждую пятницу'],
    cta: 'Оставить заявку →',
  },
  {
    tier: 'Сложный проект', price: '150–200k+', unit: '₽ · 4+ недели · 5 чел.', accent: 'green', featured: false,
    items: ['Microservices-архитектура', 'ML-пайплайн, аналитика', 'High-load backend, DevOps', 'Полный Agile с ретро', 'Опция: продолжение командой'],
    cta: 'Обсудить проект →',
  },
];

/* ── FAQ ── */
const FAQS = [
  { q: 'Как оформляются отношения — трудовой договор или ГПХ?', a: 'Все участники — самозанятые. С вашей компанией заключается договор оказания услуг через Контур.Диадок с КЭП. Никаких трудовых договоров, никаких НДФЛ-вопросов с вашей стороны — только счёт и акт.' },
  { q: 'Что если команда не справится или сорвёт сроки?', a: 'AI-мониторинг 24/7 с алертами при отставании. Ментор-эскалация при любом блокере за 4 часа. 20% временной резерв в каждом спринте. Если результат не соответствует DoD — доработка за наш счёт. Эскроу — вы не платите до подписания акта.' },
  { q: 'Могу ли я нанять лучших участников после проекта?', a: 'Да, это прямо прописано в договоре. После завершения вы можете сделать оффер любому участнику напрямую — без комиссий. Вы уже знаете человека по 4 неделям работы, видели его код и командный стиль.' },
  { q: 'Каков минимальный/максимальный размер проекта?', a: 'Минимум — 50 000 ₽, 2 недели, команда 3 человека. Максимум на текущем этапе — 200 000+ ₽, 4–6 недель, 5 человек. Для крупных проектов рекомендуем разбить на модули.' },
  { q: 'Можно ли продолжить с той же командой?', a: 'Да. Команда уже знает вашу кодовую базу и стандарты. Второй и последующие проекты стартуют быстрее — без Kick-off-недели. Многие компании переходят в режим постоянного сотрудничества.' },
  { q: 'Как я буду видеть прогресс?', a: 'Read-only доступ в Kaiten в любое время. Демо каждую пятницу 30 минут. AI-отчёт от Hermes на email еженедельно. При блокерах — уведомление от ментора за 4 часа. Ваше участие — минимальное.' },
  { q: 'Каков уровень студентов Школы Цифровых Технологий Сбера?', a: 'Школа 21 — российский аналог École 42. Peer-to-peer обучение без лекций: студенты решают реальные задачи с первого дня. Программа 3–4 года включает системное программирование, алгоритмы, сети, DevOps. Перед подбором каждый проходит AI-скоринг и тестовое задание.' },
];

function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <div className="company-faq">
      {FAQS.map((item, i) => (
        <div key={i} className={`faq-item ${open === i ? 'is-open' : ''}`}>
          <button className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span>{item.q}</span>
            <span className="faq-icon" aria-hidden="true">{open === i ? '×' : '+'}</span>
          </button>
          {open === i && (
            <motion.div className="faq-a" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
              <p>{item.a}</p>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Project Submission Form ── */
function ProjectForm() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // Set min date: 14 days from now
  const minDate = (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; })();

  const onSubmit = async (values) => {
    setServerError(''); setSuccess('');
    try {
      const result = await api('/api/submit-project', values);
      setSuccess(result.message || '✅ Заявка отправлена! AI-агент ответит за 2–4 часа.');
      reset();
    } catch (e) {
      setServerError(e.message || 'Не удалось отправить. Напишите нам напрямую: tochka.sborki21@vk.com');
    }
  };

  return (
    <Card accent="cyan" className="company-form-card">
      <h2>📝 Подать техническое задание</h2>
      <p className="form-sub">AI-агент проверит ТЗ и ответит за 2–4 часа.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-row-2">
          <label>
            Компания <span className="req">*</span>
            <input {...register('companyName', { required: 'Укажите компанию', minLength: { value: 2, message: 'Минимум 2 символа' } })} placeholder="ООО Пример" />
            {errors.companyName && <small className="form-error">{errors.companyName.message}</small>}
          </label>
          <label>
            Контактное лицо <span className="req">*</span>
            <input {...register('contactName', { required: 'Укажите контактное лицо', minLength: { value: 2, message: 'Минимум 2 символа' } })} placeholder="Иван Петров" />
            {errors.contactName && <small className="form-error">{errors.contactName.message}</small>}
          </label>
        </div>

        <label>
          Email <span className="req">*</span>
          <input type="email" {...register('email', { required: 'Укажите email', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Введите корректный email' } })} placeholder="ivan@company.ru" />
          {errors.email && <small className="form-error">{errors.email.message}</small>}
        </label>

        <div className="form-row-2">
          <label>
            Технологический стек <span className="req">*</span>
            <input {...register('stack', { required: 'Укажите стек' })} placeholder="Python, FastAPI, PostgreSQL" />
            {errors.stack && <small className="form-error">{errors.stack.message}</small>}
          </label>
          <label>
            Бюджет <span className="req">*</span>
            <select {...register('budget', { required: 'Выберите бюджет' })}>
              <option value="">Выберите диапазон</option>
              <option value="50–80k ₽">50–80k ₽ (мини-проект)</option>
              <option value="80–120k ₽">80–120k ₽ (стандарт)</option>
              <option value="120–200k ₽">120–200k ₽ (сложный)</option>
              <option value="200k+ ₽">200k+ ₽ (обсудим)</option>
            </select>
            {errors.budget && <small className="form-error">{errors.budget.message}</small>}
          </label>
        </div>

        <label>
          Желаемый срок завершения <span className="req">*</span>
          <input type="date" min={minDate} {...register('deadline', { required: 'Укажите дедлайн' })} />
          {errors.deadline && <small className="form-error">{errors.deadline.message}</small>}
        </label>

        <label>
          Описание проекта <span className="req">*</span>
          <textarea rows={5}
            placeholder="Опишите задачу: что нужно сделать, для кого, какой результат ожидается."
            {...register('description', { required: 'Опишите проект', minLength: { value: 30, message: 'Минимум 30 символов' } })}
          />
          {errors.description && <small className="form-error">{errors.description.message}</small>}
        </label>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '⏳ Отправляем...' : '🚀 Отправить техническое задание'}
        </button>

        {success && <p className="form-success">{success}</p>}
        {serverError && <p className="form-error form-message">{serverError}</p>}
      </form>

      <p className="form-note">🔒 Данные защищены. NDA до начала работ через Контур.Диадок.</p>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════ */
export function CompanyPathPage() {
  return (
    <div className="company-page">

      {/* ── HERO ── */}
      <section className="page page-purple company-hero">
        <div className="glow glow-a" />
        <div className="glow glow-b" />
        <div className="page-inner">
          <Reveal><TrustStrip /></Reveal>

          <div className="company-hero-grid">
            <div>
              <Reveal>
                <Badge accent="purple">Для компаний-заказчиков</Badge>
                <h1 className="company-hero-title">
                  Решим ваши IT-задачи<br />
                  за <em>1 Спринт</em>.<br />
                  <span>Фикс-прайс.</span>
                </h1>
                <p className="company-hero-sub">
                  <strong>Готовая IT-команда</strong> из Школы Цифровых Технологий Сбера — собранная под ваш стек, без онбординга, с AI-сопровождением каждого шага.
                </p>
              </Reveal>
              <Reveal><MetricPills /></Reveal>
              <Reveal>
                <div className="company-hero-ctas">
                  <a href="#submit" className="primary-button">📝 Отправить техзадание</a>
                  <a href="#process" className="outline-button">Как это работает ↓</a>
                </div>
                <div className="company-social-proof">
                  <span>✅ <strong>Юридически чисто:</strong> самозанятые, Диадок, ЭЦП</span>
                  <span>🤖 <strong>AI-оркестрация</strong> Hermes 24/7</span>
                  <span>📊 <strong>Live-трекинг</strong> в Kaiten</span>
                </div>
              </Reveal>
            </div>

            <Reveal>
              <Card accent="cyan" className="hero-benefits-card">
                <div className="section-label">⚡ Что получает компания</div>
                <Checklist items={[
                  'Сборка команды под ваш стек за 7 дней',
                  'Фикс-прайс — платите только за результат',
                  'Стеки: Python · Go · JS/TS · Rust · C/C++',
                  'Live-прогресс в Kaiten — прозрачность 24/7',
                  'Демо каждую пятницу — без сюрпризов',
                  'Лучших участников — сразу в оффер',
                ]} />
              </Card>
              <Card className="hero-escrow-card" style={{ background: 'rgba(5,150,105,.08)', borderColor: 'rgba(5,150,105,.3)', marginTop: '14px' }}>
                <div className="section-label" style={{ color: 'var(--gm)' }}>🛡️ Защита интересов</div>
                <Checklist items={[
                  'Эскроу: 50% аванс заморожен до сдачи',
                  'NDA и договор через Контур.Диадок',
                  'Замена участника за 48 часов',
                  'Ментор-эскалация при любом блокере',
                ]} />
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="page page-dark">
        <div className="glow glow-a" />
        <div className="page-inner">
          <Reveal>
            <Badge>Почему Точка Сборки</Badge>
            <h2>Не фриланс. Не аутстаф. Не джун-лотерея.</h2>
            <p className="subtitle">Мы даём то, чего нет на рынке: слаженную команду под ваш стек, готовую стартовать через неделю.</p>
          </Reveal>
          <Reveal><ComparisonBlock /></Reveal>

          <div className="grid three" style={{ marginTop: '28px' }}>
            {[
              { icon: '🤖', title: 'AI-подбор за 48 часов', text: 'Оркестратор Hermes на YandexGPT анализирует ваш стек и формирует оптимальный состав из 120+ студентов.' },
              { icon: '👁️', title: 'Полная прозрачность', text: 'Live-доступ в Kaiten: задачи, статусы и burndown в реальном времени. Еженедельное демо каждую пятницу.' },
              { icon: '🔒', title: 'Юридическая чистота', text: 'Договор и NDA через Контур.Диадок с КЭП. Эскроу-схема. Мой налог для выплат. Всё по закону РФ.' },
            ].map(item => (
              <Reveal key={item.title}>
                <Card className="why-card">
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="page page-purple" id="process">
        <div className="glow glow-a" />
        <div className="glow glow-b" />
        <div className="page-inner">
          <Reveal>
            <Badge accent="purple">Прозрачный процесс</Badge>
            <h2>От заявки до <span style={{ color: 'var(--pl)' }}>рабочего продукта</span> — 6 шагов</h2>
            <p className="subtitle">Каждый шаг задокументирован. Ментор + AI на каждом этапе. Никаких сюрпризов.</p>
          </Reveal>
          <ProcessTimeline />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="page page-cyan">
        <div className="glow glow-a" style={{ background: 'radial-gradient(circle,rgba(8,145,178,.18),transparent 70%)' }} />
        <div className="page-inner">
          <Reveal className="text-center">
            <Badge accent="cyan">Прозрачное ценообразование</Badge>
            <h2>Фикс-прайс. Без скрытых платежей.</h2>
            <p className="subtitle">Цена зависит от объёма, не от часов. Итоговая сумма известна до старта.</p>
          </Reveal>
          <div className="grid three" style={{ marginTop: '36px' }}>
            {PLANS.map(plan => (
              <Reveal key={plan.tier}>
                <Card accent={plan.accent} className={`pricing-card ${plan.featured ? 'pricing-featured' : ''}`}>
                  {plan.featured && <div className="pricing-badge">Популярный</div>}
                  <div className="pricing-tier">{plan.tier}</div>
                  <div className={`pricing-price accent-${plan.accent}`}>{plan.price}</div>
                  <div className="pricing-range">{plan.unit}</div>
                  <Checklist items={plan.items} />
                  <a href="#submit" className="primary-button" style={{ marginTop: '16px', display: 'block', textAlign: 'center' }}>{plan.cta}</a>
                </Card>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="escrow-highlight">
              <span>🔐</span>
              <div><strong>Эскроу-схема защищает вас:</strong> 50% аванс замораживается при подписании и разблокируется только после вашего подписания акта сдачи. Оставшиеся 50% — после финального демо.</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── GUARANTEES ── */}
      <section className="page page-green">
        <div className="glow glow-a" style={{ background: 'radial-gradient(circle,rgba(5,150,105,.18),transparent 70%)' }} />
        <div className="page-inner">
          <Reveal>
            <Badge accent="green">Гарантии</Badge>
            <h2>Ваши риски <span style={{ color: 'var(--gm)' }}>минимальны</span></h2>
            <p className="subtitle">Мы системно закрываем каждый сценарий провала — ещё до старта.</p>
          </Reveal>
          <div className="grid two" style={{ marginTop: '36px' }}>
            {GUARANTEES.map(g => (
              <Reveal key={g.title}>
                <div className="guarantee-item">
                  <span className="guarantee-icon">{g.icon}</span>
                  <div><h3>{g.title}</h3><p>{g.text}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="page page-purple">
        <div className="glow glow-a" />
        <div className="page-inner" style={{ maxWidth: '820px' }}>
          <Reveal>
            <Badge accent="purple">FAQ</Badge>
            <h2>Отвечаем на главные вопросы</h2>
          </Reveal>
          <FAQSection />
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="page page-cyan" id="submit">
        <div className="glow glow-a" style={{ background: 'radial-gradient(circle,rgba(8,145,178,.2),transparent 70%)' }} />
        <div className="glow glow-b" />
        <div className="page-inner">
          <div className="company-form-grid">
            <Reveal>
              <Badge accent="cyan">Начать проект</Badge>
              <h2>Отправьте ТЗ — <span style={{ color: 'var(--cl)' }}>ответим за 4 часа</span></h2>
              <p className="subtitle text-big">AI-агент Intake сам извлечёт требования к стеку, оценит сложность и предложит уточнения.</p>

              <div className="form-process-mini">
                {[
                  { n: '1', t: 'Заполните форму', d: 'AI-агент проверит ТЗ за 2–4 часа' },
                  { n: '2', t: 'Подпишите договор', d: 'Цифровой документооборот — 1–2 дня' },
                  { n: '3', t: 'Kick-off встреча', d: '60 мин · согласование DoD и формата' },
                  { n: '4', t: 'Спринты и демо', d: 'Prогресс в Kaiten + AI-отчёт еженедельно' },
                  { n: '5', t: 'Сдача и оплата', d: 'Акт через Диадок → эскроу → результат' },
                ].map(item => (
                  <div key={item.n} className="mini-process-row">
                    <div className="mini-process-num">{item.n}</div>
                    <div><strong>{item.t}</strong><p>{item.d}</p></div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <ProjectForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CONTACTS + FINAL CTA ── */}
      <section className="page page-dark">
        <div className="page-inner">
          <Reveal className="text-center">
            <h2>Предпочитаете написать напрямую?</h2>
            <p className="subtitle">Выберите удобный канал — ответим в течение часа в рабочее время.</p>
          </Reveal>

          <Reveal>
            <div className="company-contacts">
              {[
                { icon: '✉️', label: 'Email', val: 'tochka.sborki21@vk.com', href: 'mailto:tochka.sborki21@vk.com' },
                { icon: '🔵', label: 'ВКонтакте', val: 'vk.com/tochkasborki21', href: 'https://vk.com/tochkasborki21' },
                { icon: '💬', label: 'MAX Messenger', val: '⚡ Точка Сборки', href: 'https://max.ru/join/7jlWTUq574ffC3I-FwT3MuJk-Op4kaBJRw2D60o7uOI' },
                { icon: '📱', label: 'Telegram', val: '@tochka_sborki', href: 'https://t.me/tochka_sborki' },
              ].map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="company-contact-card">
                  <span className="company-contact-icon">{c.icon}</span>
                  <div><small>{c.label}</small><strong>{c.val}</strong></div>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="final-cta-block">
              <div className="section-label" style={{ justifyContent: 'center' }}>Готовы начать?</div>
              <h2>Соберём команду за <em>7 дней.</em><br />Результат за <span style={{ color: 'var(--pl)' }}>1 спринт.</span></h2>
              <p>Team-as-a-Service из Школы Цифровых Технологий Сбера — фикс-прайс, без онбординга, с полной прозрачностью.</p>
              <div className="final-cta-buttons">
                <a href="#submit" className="primary-button btn-lg">📝 Отправить ТЗ сейчас</a>
                <Link to="/how-it-works" className="outline-button">Подробнее о процессе →</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

/* ─── CSS additions — append to src/styles/index.css ─────────────────────

.trust-strip {
  display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
  margin-bottom: 22px; padding: 10px 16px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(124,58,237,.2);
  border-radius: 8px; width: fit-content;
}
.trust-strip span { display: flex; align-items: center; gap: 6px; font-size: .84rem; color: var(--li); }
.trust-divider { width: 1px; height: 18px; background: rgba(124,58,237,.3); }

.company-hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; align-items: start; padding: 36px 0; }
.company-hero-title { font-size: clamp(2.4rem,5vw,4.2rem); font-weight: 800; line-height: 1.03; letter-spacing: -.04em; margin: 12px 0 16px; }
.company-hero-title em { color: var(--kl); font-style: normal; }
.company-hero-title span { color: var(--pl); }
.company-hero-sub { font-size: 1.1rem; color: var(--li); max-width: 560px; margin-bottom: 24px; }
.company-hero-ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 24px; }
.company-social-proof { display: flex; flex-wrap: wrap; gap: 16px; padding-top: 20px; border-top: 1px solid rgba(124,58,237,.14); font-size: .88rem; color: var(--li); }

.metric-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
.metric-pill { padding: 13px 18px; border-radius: 10px; text-align: center; background: rgba(255,255,255,.05); border: 1px solid rgba(124,58,237,.28); min-width: 130px; }
.metric-pill .val { display: block; font-size: 1.8rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
.metric-pill .lbl { display: block; font-size: .78rem; color: var(--li); }
.metric-pill-pink .val { color: var(--km); }
.metric-pill-cyan .val { color: var(--cm); }
.metric-pill-purple .val { color: var(--pm); }
.metric-pill-green .val { color: var(--gm); }

.company-vs { display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; margin-top: 36px; align-items: start; }
.vs-bad, .vs-good { padding: 22px; border-radius: 12px; }
.vs-bad { background: rgba(219,39,119,.06); border: 1px solid rgba(219,39,119,.25); }
.vs-good { background: rgba(5,150,105,.06); border: 1px solid rgba(5,150,105,.35); }
.vs-bad h3 { color: var(--kl); } .vs-good h3 { color: var(--gm); }
.vs-label { font-size: .72rem; font-weight: 800; text-transform: uppercase; letter-spacing: .09em; margin-bottom: 8px; }
.vs-label.bad { color: var(--kl); } .vs-label.good { color: var(--gm); }
.vs-list { list-style: none; padding: 0; margin: 12px 0 0; }
.vs-list li { padding: 5px 0 5px 22px; position: relative; font-size: .93rem; }
.vs-list.bad li::before { content: '✕'; position: absolute; left: 0; color: var(--kl); font-weight: 700; }
.vs-list.good li::before { content: '✓'; position: absolute; left: 0; color: var(--gm); font-weight: 700; }
.vs-divider { text-align: center; padding-top: 80px; font-size: 2.5rem; color: var(--p); font-weight: 800; opacity: .5; }

.company-timeline { position: relative; }
.company-timeline::before { content: ''; position: absolute; left: 27px; top: 36px; bottom: 36px; width: 2px; background: linear-gradient(180deg,var(--p),var(--c),var(--k)); border-radius: 2px; opacity: .35; }
.company-step { display: grid; grid-template-columns: 56px 1fr; gap: 20px; margin-bottom: 16px; }
.company-step-num { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg,var(--p),var(--c)); color: white; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 22px rgba(124,58,237,.35); }
.company-step-num.step-color-cyan { background: linear-gradient(135deg,var(--c),var(--p)); }
.company-step-num.step-color-green { background: linear-gradient(135deg,var(--g),var(--c)); }
.company-step-num.step-color-pink { background: linear-gradient(135deg,var(--k),var(--p)); }
.company-step-num.step-color-gold { background: linear-gradient(135deg,var(--o),var(--g)); }
.company-step-body { padding: 18px; background: rgba(255,255,255,.04); border: 1px solid rgba(124,58,237,.18); border-radius: 12px; }
.company-step-phase { font-family: monospace; font-size: .72rem; text-transform: uppercase; letter-spacing: .1em; color: var(--cl); font-weight: 700; margin-bottom: 5px; }
.company-step-body h3 { margin-bottom: 8px; font-size: 1.08rem; }
.company-step-body p { margin-bottom: 10px; font-size: .93rem; }
.company-step-note { margin-top: 16px; }

.guarantee-item { display: flex; align-items: flex-start; gap: 16px; padding: 20px; border-radius: 12px; border: 1px solid rgba(5,150,105,.25); background: rgba(5,150,105,.05); }
.guarantee-icon { font-size: 2rem; flex-shrink: 0; margin-top: 2px; }
.guarantee-item h3 { margin-bottom: 6px; }

.pricing-card { display: flex; flex-direction: column; position: relative; }
.pricing-featured { border-width: 2px; border-color: rgba(8,145,178,.5); }
.pricing-badge { position: absolute; top: 0; right: 0; padding: 5px 14px; background: linear-gradient(90deg,var(--c),var(--p)); color: white; font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; border-radius: 0 12px 0 8px; }
.pricing-tier { font-size: .72rem; font-weight: 800; text-transform: uppercase; letter-spacing: .09em; color: var(--li); margin-bottom: 6px; }
.pricing-price { font-size: 2.2rem; font-weight: 800; line-height: 1; color: var(--pm); margin-bottom: 3px; }
.pricing-price.accent-cyan { color: var(--cm); } .pricing-price.accent-green { color: var(--gm); }
.pricing-range { font-size: .85rem; color: var(--li); margin-bottom: 14px; }
.escrow-highlight { margin-top: 24px; padding: 16px 20px; border-radius: 8px; background: rgba(5,150,105,.08); border: 1px solid rgba(5,150,105,.25); display: flex; align-items: center; gap: 14px; font-size: .95rem; }
.escrow-highlight span { font-size: 1.8rem; flex-shrink: 0; }

.company-faq { margin-top: 36px; }
.faq-item { border: 1px solid rgba(124,58,237,.18); border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
.faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; cursor: pointer; gap: 16px; font-weight: 700; font-size: 1rem; color: var(--wr); background: rgba(255,255,255,.04); border: none; text-align: left; }
.faq-q:hover { background: rgba(124,58,237,.08); }
.faq-icon { color: var(--pl); font-size: 1.4rem; flex-shrink: 0; }
.faq-a { padding: 14px 22px 18px; color: var(--li); font-size: .97rem; line-height: 1.6; background: rgba(124,58,237,.04); border-top: 1px solid rgba(124,58,237,.12); }

.company-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
.company-form-card h2 { margin-bottom: 6px; }
.form-sub { color: var(--li); font-size: .9rem; margin-bottom: 20px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.req { color: var(--kl); }
.form-note { margin-top: 12px; font-size: .8rem; color: #475569; text-align: center; }
.form-process-mini { margin-top: 28px; border: 1px solid rgba(124,58,237,.18); border-radius: 12px; overflow: hidden; }
.mini-process-row { display: flex; align-items: flex-start; gap: 14px; padding: 14px 18px; border-bottom: 1px solid rgba(124,58,237,.1); }
.mini-process-row:last-child { border-bottom: none; }
.mini-process-num { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg,var(--p),var(--c)); color: white; font-weight: 800; font-size: .82rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mini-process-row strong { display: block; color: var(--wr); margin-bottom: 2px; }
.mini-process-row p { margin: 0; color: var(--li); font-size: .85rem; }

.company-contacts { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; margin-top: 36px; }
.company-contact-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(255,255,255,.04); border: 1px solid rgba(124,58,237,.2); border-radius: 8px; text-decoration: none; transition: all .2s; }
.company-contact-card:hover { border-color: rgba(124,58,237,.5); background: rgba(124,58,237,.08); }
.company-contact-icon { width: 40px; height: 40px; border-radius: 8px; background: rgba(124,58,237,.15); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
.company-contact-card small { display: block; font-size: .72rem; color: #64748b; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
.company-contact-card strong { display: block; color: var(--wr); font-size: .92rem; }

.final-cta-block { margin-top: 56px; padding: 40px; border-radius: 16px; background: linear-gradient(135deg,rgba(124,58,237,.14),rgba(8,145,178,.1)); border: 1px solid rgba(124,58,237,.25); text-align: center; }
.final-cta-block h2 { font-size: clamp(1.8rem,3.5vw,2.8rem); margin-bottom: 14px; }
.final-cta-block p { font-size: 1.05rem; max-width: 520px; margin: 0 auto 28px; color: var(--li); }
.final-cta-buttons { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }

.outline-button { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; border-radius: 8px; font-weight: 700; font-size: .97rem; cursor: pointer; background: transparent; color: var(--pl); border: 1.5px solid rgba(124,58,237,.5); transition: all .2s; text-decoration: none; }
.outline-button:hover { background: rgba(124,58,237,.12); border-color: var(--pl); }
.btn-lg { padding: 17px 36px; font-size: 1.1rem; }

@media(max-width:900px){
  .company-hero-grid, .company-vs, .company-form-grid { grid-template-columns: 1fr; }
  .vs-divider { display: none; }
  .company-contacts { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .form-row-2 { grid-template-columns: 1fr; }
  .company-timeline::before { left: 23px; }
}
@media(max-width:640px){
  .company-contacts { grid-template-columns: 1fr; }
  .metric-row { gap: 8px; }
  .metric-pill { min-width: 110px; }
}

─── */
