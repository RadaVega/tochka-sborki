/**
 * src/pages/StudentPathPage.jsx
 *
 * Complete redesign of the student path page.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Badge, Card, Checklist, PageShell, Reveal, TagRow } from '../components/UI';
import { ConsentCheckbox } from '../components/ConsentCheckbox';
import { TrackedButton, TrackedExternalLink } from '../components/Tracked';
import { useAnalytics } from '../hooks/useAnalytics';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const api = async (url, payload) => {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || 'Не удалось отправить заявку');
  }
  return data;
};

// ─── Static data ──────────────────────────────────

const JOURNEY_STEPS = [
  {
    num: '1', color: '', phase: 'День 1',
    title: 'Заполнение профиля',
    text: 'Указываете стек, опыт, ссылку на GitVerse/GitHub и предпочтения по проектам. AI-агент Intake анализирует профиль и формирует вектор навыков для матчинга.',
    tags: ['Яндекс Forms', 'YandexGPT', 'Автоскоринг'],
  },
  {
    num: '2', color: 'cyan', phase: 'Дни 1–3',
    title: 'Техническая проверка',
    text: 'Тестовое задание на GitVerse: PR + code review. Оцениваем: чистоту кода, документацию, скорость. Итог — скор 0–100 по каждому стеку. Без стресса.',
    tags: ['GitVerse', 'Giga Code', 'Скор 0–100'],
  },
  {
    num: '3', color: 'green', phase: 'Дни 2–7',
    title: 'AI-матчинг Hermes',
    text: 'YandexGPT 4 сопоставляет ваш профиль с открытыми проектами: стек, soft skills, совместимость с командой. Получаете 1–3 предложения проектов с обоснованием.',
    tags: ['Hermes Orchestrator', 'DataSphere ML', '48ч матчинг'],
  },
  {
    num: '4', color: 'pink', phase: 'День 7',
    title: 'Оффер проекта',
    text: 'Получаете уведомление в MAX Messenger с деталями: описание проекта, состав команды, сроки и доход. Принимаете или отклоняете — никаких обязательств до подписания.',
    tags: ['MAX Messenger', 'VK Teams', 'Без обязательств'],
  },
  {
    num: '5', color: 'pink', phase: 'Неделя 1',
    title: 'Онбординг и Kick-off',
    text: 'Ментор проводит 30-минутный онбординг: Kaiten-доска, GitVerse-репозиторий, воркспейс Яндекс 360. Затем 60-минутный Kick-off с заказчиком — согласование DoD.',
    tags: ['Kaiten Board', 'Яндекс Телемост', 'GitVerse'],
  },
  {
    num: '6', color: 'gold', phase: 'Недели 1–4',
    title: 'Спринты и результат',
    text: 'Agile-спринты по 1–2 недели. Daily sync в MAX. Демо заказчику каждую пятницу. После финального демо — выплата до 90k ₽ через Мой налог за 24 часа.',
    tags: ['Kaiten Live', 'Weekly Demo', 'Мой налог 24ч'],
  },
];

const EARNINGS = [
  { icon: '💰', title: '40–90k ₽ за проект', text: 'Полная выплата за 2–4 недели работы. Без задержек — через «Мой налог» в течение 24 часов после подписания акта.', accent: 'gold' },
  { icon: '📋', title: 'Кейс в портфолио', text: 'Реальный проект с живым заказчиком. Production-ready код, документация, Agile-процесс — всё, что нужно для убедительного портфолио.', accent: 'purple' },
  { icon: '⚙️', title: 'Agile на практике', text: 'Полный цикл: Scrum, Git-flow, CI/CD, code review. Не теория — реальная разработка в команде по тем же стандартам, что в крупных компаниях.', accent: 'cyan' },
  { icon: '🎯', title: 'Прямой путь к офферу', text: 'Лучшие участники получают предложение о работе от компании-заказчика напрямую — без комиссий и дополнительных интервью.', accent: 'green' },
  { icon: '👥', title: 'Командный опыт', text: 'Работаете в сработанной группе 3–5 человек. Учитесь координации, code review и ответственности — опыт, который не даёт ни один учебный проект.', accent: 'purple' },
  { icon: '🤖', title: 'Менторство + AI', text: 'Ментор-техлид с опытом 2+ лет доступен в течение рабочего дня. AI-агент Quality ревьюит ваш код автоматически — растёте быстрее.', accent: 'cyan' },
];

const STACK_ITEMS = [
  { title: '⌨️ Разработка', tools: ['GitVerse 🇷🇺', 'Giga IDE 🇷🇺', 'Giga Code 🇷🇺', 'Docker / K8s'] },
  { title: '📋 Задачи и процессы', tools: ['Kaiten 🇷🇺', 'Яндекс Трекер 🇷🇺', 'Яндекс 360 🇷🇺'] },
  { title: '💬 Коммуникации', tools: ['MAX Messenger 🇷🇺', 'VK Teams 🇷🇺', 'Яндекс Телемост 🇷🇺'] },
  { title: '💰 Выплаты', tools: ['Мой налог 🇷🇺', 'Контур.Диадок 🇷🇺', 'КриптоПро ЭЦП'] },
];

const FAQS = [
  {
    q: 'Нужно ли быть студентом Школы 21?',
    a: 'Да. Точка Сборки работает со студентами Школы 21 (Школа Цифровых Технологий Сбера). Если вы ещё не в Школе — подайте заявку на поступление на официальном сайте school21.ru.',
  },
  {
    q: 'Обязательно ли принимать первый предложенный проект?',
    a: 'Нет. После AI-матчинга вы получаете описание проекта и можете изучить его перед ответом. Никаких обязательств до подписания договора нет. Если проект не подходит — ждёте следующего предложения.',
  },
  {
    q: 'Как оформляется участие? Нужен ли ИП?',
    a: 'Только статус самозанятого через приложение «Мой налог» (бесплатно, регистрация 10 минут). Договор подписывается через Контур.Диадок с электронной подписью. ИП не нужен.',
  },
  {
    q: 'Сколько времени занимает проект? Совмещается с учёбой?',
    a: 'Проекты длятся 2–4 недели. Ожидаемая нагрузка — 20–30 часов в неделю, что совмещается с учёбой. Расписание обсуждается с командой на Kick-off.',
  },
  {
    q: 'Что если я не успею выполнить задачи в срок?',
    a: 'Ментор отслеживает прогресс в Kaiten и помогает при блокерах. В каждом спринте есть временной резерв 20%. При форс-мажоре — ротационный пул: другой студент подключается за 48 часов.',
  },
  {
    q: 'Когда и как получаю деньги?',
    a: 'После финального демо и подписания акта через Диадок. Выплата идёт через «Мой налог» в течение 24 часов на любую карту. Вы получаете чек самозанятого автоматически.',
  },
  {
    q: 'Можно ли участвовать в нескольких проектах одновременно?',
    a: 'Рекомендуем начинать с одного проекта. После успешного завершения первого — можно брать параллельные, с согласования ментора.',
  },
];

// ─── Sub-components ───────────────────────────────

function StudentTrustStrip() {
  return (
    <div className="trust-strip">
      <span>Школа Цифровых Технологий Сбера</span>
      <span className="trust-divider" aria-hidden="true" />
      <span>💰 Доход во время учёбы</span>
      <span className="trust-divider" aria-hidden="true" />
      <span>🎯 Production-ready опыт</span>
    </div>
  );
}

function StudentMetricPills() {
  const pills = [
    { val: '40–90k', lbl: '₽ за проект', cls: 'gold' },
    { val: '48 часов', lbl: 'AI-матчинг', cls: 'purple' },
    { val: '2–4 нед.', lbl: 'длительность', cls: 'cyan' },
    { val: '120+', lbl: 'студентов в базе', cls: 'green' },
  ];
  return (
    <div className="metric-row">
      {pills.map((pill) => (
        <div className={`metric-pill metric-pill-${pill.cls}`} key={pill.val}>
          <span className="val">{pill.val}</span>
          <span className="lbl">{pill.lbl}</span>
        </div>
      ))}
    </div>
  );
}

function StudentComparisonBlock() {
  const bad = [
    'Учебные проекты не считаются в резюме',
    'Нет дохода 2–4 года обучения',
    'Никогда не работал в команде',
    'Онбординг в компании: 3–6 месяцев',
    'Нет понимания Agile и CI/CD на практике',
    '«Знаю код, но нет оффера»',
  ];
  const good = [
    'Реальный кейс с живым заказчиком',
    '40–90k ₽ уже во время учёбы',
    'Полноценная работа в команде 3–5 чел.',
    'Сразу в проект — без онбординга',
    'Scrum, Git-flow, code review в деле',
    'Прямой путь к офферу от партнёра',
  ];
  return (
    <div className="company-vs">
      <div className="vs-bad">
        <div className="vs-label bad">❌ Без Точки Сборки</div>
        <h3>Учёба в вакууме</h3>
        <ul className="vs-list bad">{bad.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className="vs-divider">VS</div>
      <div className="vs-good">
        <div className="vs-label good">✅ С Точкой Сборки</div>
        <h3>Коммерческий опыт с первого дня</h3>
        <ul className="vs-list good">{good.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </div>
  );
}

function StudentJourneyTimeline() {
  return (
    <div className="company-timeline">
      {JOURNEY_STEPS.map((step) => (
        <Reveal key={step.num} className="company-step">
          <div className={`company-step-num ${step.color ? `step-color-${step.color}` : ''}`}>
            {step.num}
          </div>
          <div className="company-step-body">
            <div className="company-step-phase">{step.phase}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            <TagRow tags={step.tags} />
          </div>
        </Reveal>
      ))}
      <Card accent="purple" className="company-step-note">
        <strong>🤖 80% рутины — на AI-агентах Hermes.</strong>
        <p>Вы фокусируетесь на коде и росте — скоринг, матчинг и мониторинг работают автоматически.</p>
      </Card>
    </div>
  );
}

function EarningsSplit() {
  const bars = [
    { label: 'Студенты', pct: 65, color: 'var(--gl)', textColor: 'var(--gm)' },
    { label: 'Ментор', pct: 15, color: 'var(--p)', textColor: 'var(--pm)' },
    { label: 'Платформа', pct: 20, color: 'var(--ol)', textColor: 'var(--om)' },
  ];
  return (
    <div className="earnings-split">
      {bars.map((b) => (
        <div key={b.label} className="earnings-bar-row">
          <span className="earnings-bar-label" style={{ color: b.textColor }}>{b.label}</span>
          <div className="earnings-bar-track">
            <div className="earnings-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} />
          </div>
          <span className="earnings-bar-pct" style={{ color: b.textColor }}>{b.pct}%</span>
        </div>
      ))}
      <p className="earnings-note">
        На проекте стоимостью 100k ₽ каждый из 4 студентов получает ~16k ₽. 
        На 150k ₽ проекте — ~24k ₽ каждый. Выплата в течение 24 часов после сдачи.
      </p>
    </div>
  );
}

function StudentFAQ() {
  const [open, setOpen] = useState(0);

  const handleToggle = (index) => {
    setOpen(open === index ? null : index);
  };

  return (
    <div className="company-faq">
      {FAQS.map((item, index) => (
        <div className="faq-item" key={item.q}>
          <button
            className="faq-q"
            type="button"
            onClick={() => handleToggle(index)}
            aria-expanded={open === index}
          >
            <span>{item.q}</span>
            <span className="faq-icon">{open === index ? '×' : '+'}</span>
          </button>
          {open === index && <div className="faq-a">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Application Form ─────────────────────────────

function StudentApplicationForm() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { goal } = useAnalytics();

  const onSubmit = async (values) => {
    setServerError('');
    setSuccess('');
    setConsentError('');

    if (!consent) {
      setConsentError('Необходимо согласие на обработку персональных данных');
      return;
    }

    try {
      const result = await api('/api/student-apply', {
        ...values,
        telegram: values.telegram || '',
        phone:    values.phone    || '',
        portfolio: values.portfolio || '',
        experience: values.experience || '',
        preferredStack: values.preferredStack || '',
        consent,
      });

      setSuccess(result.message || '✅ Заявка принята! AI-скоринг подберёт проект за 48 часов — ответим на email.');
      goal('STUDENT_FORM_SUCCESS', { stack: values.stack, experience: values.experience });
      reset();
      setConsent(false);
    } catch (error) {
      setServerError(error.message || 'Не удалось отправить. Напишите напрямую: tochka.sborki21@vk.com');
    }
  };

  return (
    <Card accent="purple" className="company-form-card">
      <h2>Подать заявку в Точку Сборки</h2>
      <p className="form-sub">
        Заполните профиль — AI-агент Hermes подберёт подходящий проект за 48 часов
        и пришлёт предложение на email.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        <div className="form-row-2">
          <label>
            <span>Имя <b className="req">*</b></span>
            <input
              placeholder="Иван Петров"
              {...register('name', { required: 'Укажите имя', minLength: { value: 2, message: 'Минимум 2 символа' } })}
            />
            {errors.name && <small className="form-error">{errors.name.message}</small>}
          </label>
          <label>
            <span>Email <b className="req">*</b></span>
            <input
              type="email"
              placeholder="ivan@student.ru"
              {...register('email', {
                required: 'Укажите email',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Введите корректный email' },
              })}
            />
            {errors.email && <small className="form-error">{errors.email.message}</small>}
          </label>
        </div>

        <div className="form-row-2">
          <label>
            <span>Telegram / MAX</span>
            <input
              placeholder="@username"
              {...register('telegram', { maxLength: { value: 80, message: 'Слишком длинный ник' } })}
            />
            {errors.telegram && <small className="form-error">{errors.telegram.message}</small>}
          </label>
          <label>
            <span>Телефон</span>
            <input
              type="tel"
              placeholder="+7 (999) 000-00-00"
              {...register('phone', { maxLength: { value: 30, message: 'Телефон слишком длинный' } })}
            />
            {errors.phone && <small className="form-error">{errors.phone.message}</small>}
          </label>
        </div>

        <label>
          <span>Основной стек <b className="req">*</b></span>
          <input
            placeholder="Python, Go, React, C/C++ — через запятую"
            {...register('stack', { required: 'Укажите ваш основной стек' })}
          />
          {errors.stack && <small className="form-error">{errors.stack.message}</small>}
        </label>

        <div className="form-row-2">
          <label>
            <span>Уровень опыта <b className="req">*</b></span>
            <select
              {...register('experience', { required: 'Укажите уровень' })}
              defaultValue=""
            >
              <option value="" disabled>Выберите уровень</option>
              <option value="beginner">Начинающий (до 6 месяцев)</option>
              <option value="intermediate">Средний (6–18 месяцев)</option>
              <option value="advanced">Продвинутый (18+ месяцев)</option>
            </select>
            {errors.experience && <small className="form-error">{errors.experience.message}</small>}
          </label>
          <label>
            <span>Предпочтения по проектам</span>
            <select {...register('preferredStack')} defaultValue="">
              <option value="">Любой проект</option>
              <option value="backend">Backend / API</option>
              <option value="frontend">Frontend / UI</option>
              <option value="fullstack">Full-stack</option>
              <option value="ml">ML / Data Science</option>
              <option value="devops">DevOps / Infra</option>
              <option value="mobile">Mobile</option>
            </select>
          </label>
        </div>

        <label>
          <span>Ссылка на портфолио <b className="req">*</b></span>
          <input
            type="url"
            placeholder="https://gitverse.ru/username или github.com/username"
            {...register('portfolio', {
              required: 'Укажите ссылку на GitVerse или GitHub',
              pattern: { value: /^https?:\/\/.+/i, message: 'Введите ссылку с https://' },
            })}
          />
          {errors.portfolio && <small className="form-error">{errors.portfolio.message}</small>}
        </label>

        <label>
          <span>О себе и мотивация <b className="req">*</b></span>
          <textarea
            rows={4}
            placeholder="Расскажите: что умеете, какие проекты делали, почему хотите в Точку Сборки и что планируете получить от участия..."
            {...register('about', {
              required: 'Расскажите о себе',
              minLength: { value: 30, message: 'Минимум 30 символов' },
            })}
          />
          {errors.about && <small className="form-error">{errors.about.message}</small>}
        </label>

        <ConsentCheckbox
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setConsentError('');
          }}
          error={consentError}
        />

        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting || !consent}
          style={{ width: '100%' }}
        >
          {isSubmitting ? '⏳ Отправляем...' : '🚀 Подать заявку'}
        </button>

        {success    && <p className="form-success">{success}</p>}
        {serverError && <p className="form-error form-message">{serverError}</p>}
      </form>

      <p className="form-note">
        После заявки AI-скоринг подберёт проекты за 48 часов.
        Оффер придёт на email — принять или отказать без обязательств.
      </p>
    </Card>
  );
}

// ─── PAGE ─────────────────────────────────────────

export function StudentPathPage() {
  return (
    <div className="company-page">

      {/* ── HERO ── */}
      <PageShell page={{ theme: 'purple' }} className="company-hero">
        <Reveal><StudentTrustStrip /></Reveal>
        <div className="company-hero-grid">
          <div>
            <Reveal>
              <Badge accent="purple">Для студентов Школы 21</Badge>
              <h1 className="company-hero-title">
                Реальный опыт.<br />
                <em>Реальные деньги.</em><br />
                <span>Во время учёбы.</span>
              </h1>
              <p className="company-hero-sub">
                <strong>Коммерческие IT-проекты</strong> из Школы Цифровых Технологий Сбера —
                кейс в портфолио, 40–90k ₽ за 2–4 недели и прямой путь к офферу от лучших компаний.
              </p>
            </Reveal>
            <Reveal><StudentMetricPills /></Reveal>
            <Reveal>
              <div className="company-hero-ctas">
                <TrackedButton
                  as="a"
                  href="#apply"
                  className="primary-button"
                >
                  🎓 Подать заявку
                </TrackedButton>
                <a href="#journey" className="outline-button">Как это работает ↓</a>
              </div>
              <div className="company-social-proof">
                <span>🤖 <strong>AI-матчинг</strong> под ваш стек за 48 часов</span>
                <span>💰 <strong>40–90k ₽</strong> выплата в 24 часа</span>
                <span>🎯 <strong>Прямой оффер</strong> без комиссий HR</span>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <Card accent="purple" className="hero-benefits-card">
              <div className="section-label">🚀 Что даёт Точка Сборки</div>
              <Checklist items={[
                'Доход 40–90k ₽ за проект прямо сейчас',
                'Production-ready кейс в портфолио',
                'Agile-цикл: Scrum, Git-flow, CI/CD',
                'Code review от ментора + AI',
                'Командный опыт в группе 3–5 человек',
                'Прямой путь к офферу от партнёра',
              ]} />
            </Card>
            <Card accent="cyan" className="hero-escrow-card">
              <div className="section-label">🛡️ Гарантии участника</div>
              <Checklist items={[
                'Выплата через «Мой налог» — 24 часа',
                'Самозанятость: налог 4–6%, не больше',
                'Ментор доступен на каждом шаге',
                'Отказ от проекта — без штрафов',
              ]} />
            </Card>
          </Reveal>
        </div>
      </PageShell>

      {/* ── WHY US ── */}
      <PageShell page={{ theme: 'dark' }}>
        <Reveal>
          <Badge>Зачем это нужно</Badge>
          <h2>Учёба без опыта — это тупик.<br />Мы его открываем.</h2>
          <p className="subtitle">
            Компании хотят 2 года опыта, но никто не даёт первый шанс.
            Точка Сборки — это первый шанс, за который ещё и платят.
          </p>
        </Reveal>
        <Reveal><StudentComparisonBlock /></Reveal>

        <div className="grid three company-why-grid">
          {[
            { icon: '💼', title: 'Живое портфолио', text: 'Один коммерческий проект весит больше десяти учебных. Заказчик, договор, деньги — это то, что ценит рекрутер.' },
            { icon: '⚡', title: 'Старт за 48 часов', text: 'AI-матчинг Hermes подбирает проект под ваш стек и отправляет предложение. Не ждёте месяцами отклика на резюме.' },
            { icon: '🧑‍🏫', title: 'Ментор-техлид', text: 'Опытный разработчик из Сбера, VK или Яндекса рядом на каждом шаге. Учитесь у реального инженера, а не из YouTube.' },
          ].map((item) => (
            <Reveal key={item.title}>
              <Card className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </PageShell>

      {/* ── 6-STEP JOURNEY ── */}
      <PageShell page={{ theme: 'purple' }}>
        <section id="journey" className="anchor-section">
          <Reveal>
            <Badge accent="purple">Путь студента</Badge>
            <h2>От заявки до <span className="accent-purple-text">первых денег</span> — 6 шагов</h2>
            <p className="subtitle">Весь путь занимает 1–7 дней до старта, затем 2–4 недели проекта.</p>
          </Reveal>
          <StudentJourneyTimeline />
        </section>
      </PageShell>

      {/* ── EARNINGS ── */}
      <PageShell page={{ theme: 'dark' }}>
        <Reveal>
          <Badge accent="gold">Доход и рост</Badge>
          <h2>Что вы получаете <span className="accent-gold-text">конкретно</span></h2>
          <p className="subtitle">Деньги, опыт и карьерные возможности — всё одновременно.</p>
        </Reveal>

        <div className="grid three company-deliverables">
          {EARNINGS.map((item) => (
            <Reveal key={item.title}>
              <Card accent={item.accent}>
                <div className="deliverable-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="student-earnings-block">
            <h3>💰 Как делится бюджет проекта</h3>
            <EarningsSplit />
          </div>
        </Reveal>
      </PageShell>

      {/* ── TECH STACK ── */}
      <PageShell page={{ theme: 'purple' }}>
        <Reveal>
          <Badge accent="purple">Инструменты</Badge>
          <h2>🇷🇺 Российский стек — <span className="accent-purple-text">без санкционных рисков</span></h2>
          <p className="subtitle">Весь процесс — на отечественном ПО. Навыки, которые востребованы на российском рынке прямо сейчас.</p>
        </Reveal>
        <div className="company-stack-grid">
          {STACK_ITEMS.map((group) => (
            <Reveal key={group.title}>
              <Card accent="purple" className="stack-card">
                <h3>{group.title}</h3>
                <TagRow tags={group.tools} />
              </Card>
            </Reveal>
          ))}
          <Reveal>
            <Card accent="cyan" className="hermes-card">
              <h3>🤖 HERMES — ваш AI-матчер</h3>
              <p>Анализирует профиль, скорирует совместимость с проектами и подбирает оптимальную команду автоматически.</p>
              <TagRow tags={['YandexGPT 4', 'DataSphere ML', 'Скор 0–100', '48ч матчинг']} />
              <div className="hermes-metrics">
                <strong>120+<span>студентов в базе</span></strong>
                <strong>48ч<span>подбор проекта</span></strong>
                <strong>80%<span>матчинг → AI</span></strong>
              </div>
            </Card>
          </Reveal>
        </div>
      </PageShell>

      {/* ── FAQ ── */}
      <PageShell page={{ theme: 'dark' }}>
        <div className="company-faq-shell">
          <Reveal>
            <Badge accent="purple">FAQ</Badge>
            <h2>Вопросы студентов</h2>
          </Reveal>
          <StudentFAQ />
        </div>
      </PageShell>

      {/* ── APPLICATION FORM ── */}
      <PageShell page={{ theme: 'cyan' }}>
        <section id="apply" className="anchor-section">
          <div className="company-form-grid">
            <Reveal>
              <Badge accent="cyan">Начать участие</Badge>
              <h2>Подайте заявку — <span className="accent-cyan-text">ответим за 48 часов</span></h2>
              <p className="subtitle text-big">
                AI-скоринг Hermes проанализирует ваш профиль и подберёт проекты под ваш стек.
                Вы получите предложение — и сами решите, брать его или нет.
              </p>
              <div className="form-process-mini">
                {[
                  { n: '1', t: 'Заполните профиль', d: 'Стек, опыт, портфолио, о себе' },
                  { n: '2', t: 'AI-скоринг за 48ч', d: 'Hermes подберёт подходящие проекты' },
                  { n: '3', t: 'Получите оффер', d: 'Описание проекта и состав команды' },
                  { n: '4', t: 'Онбординг и Kick-off', d: 'Kaiten + GitVerse + встреча с заказчиком' },
                  { n: '5', t: 'Проект и выплата', d: 'Код, демо → 40–90k ₽ в течение 24ч' },
                ].map((item) => (
                  <div key={item.n} className="mini-process-row">
                    <div className="mini-process-num">{item.n}</div>
                    <div><strong>{item.t}</strong><p>{item.d}</p></div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal><StudentApplicationForm /></Reveal>
          </div>
        </section>
      </PageShell>

      {/* ── CONTACTS ── */}
      <PageShell page={{ theme: 'dark' }}>
        <Reveal className="text-center">
          <h2>Есть вопросы? Пишите напрямую.</h2>
          <p className="subtitle">Ответим в течение часа в рабочее время.</p>
        </Reveal>
        <Reveal>
          <div className="company-contacts">
            {[
              { icon: '✉️', label: 'Email', val: 'tochka.sborki21@vk.com', href: 'mailto:tochka.sborki21@vk.com' },
              { icon: 'VK', label: 'ВКонтакте', val: 'vk.com/tochkasborki21', href: 'https://vk.com/tochkasborki21', channel: 'vk' },
              { icon: 'MAX', label: 'MAX Messenger', val: '⚡ Точка Сборки', href: 'https://max.ru/join/7jlWTUq574ffC3I-FwT3MuJk-Op4kaBJRw2D60o7uOI', channel: 'max' },
              { icon: 'TG', label: 'Telegram', val: '@tochka_sborki_21', href: 'https://t.me/tochka_sborki_21', channel: 'telegram' },
            ].map((c) => c.channel ? (
              <TrackedExternalLink key={c.label} href={c.href} channel={c.channel} className="company-contact-card">
                <span className="company-contact-icon">{c.icon}</span>
                <div><small>{c.label}</small><strong>{c.val}</strong></div>
              </TrackedExternalLink>
            ) : (
              <a key={c.label} href={c.href} className="company-contact-card">
                <span className="company-contact-icon">{c.icon}</span>
                <div><small>{c.label}</small><strong>{c.val}</strong></div>
              </a>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div className="final-cta-block">
            <div className="section-label final-label">Готов начать?</div>
            <h2>Твой первый коммерческий проект — <em>в 48 часов.</em></h2>
            <p>Школа Цифровых Технологий Сбера × Точка Сборки — реальный опыт, реальные деньги, реальный оффер.</p>
            <div className="final-cta-buttons">
              <TrackedButton as="a" href="#apply" className="primary-button btn-lg">
                🎓 Подать заявку сейчас
              </TrackedButton>
              <Link to="/how-it-works" className="outline-button">Как это работает →</Link>
            </div>
          </div>
        </Reveal>
      </PageShell>

    </div>
  );
}