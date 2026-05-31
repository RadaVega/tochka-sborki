import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Badge, Card, Checklist, PageShell, Reveal, TagRow } from '../components/UI';
import { Logo } from '../components/Logo';
import { ConsentCheckbox } from '../components/ConsentCheckbox';
import { TrackedButton, TrackedExternalLink } from '../components/Tracked';
import { GOALS, useAnalytics } from '../hooks/useAnalytics';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const api = async (url, payload) => {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || 'Не удалось отправить техническое задание');
  }
  return data;
};

const pageShell = (theme) => ({ theme });

const STEPS = [
  {
    num: '1',
    phase: 'День 1',
    title: 'Подача технического задания',
    text: 'Заполняете Project Brief: цель, стек, объём, бюджет, дедлайн. AI-агент Intake на YandexGPT оценивает выполнимость и предлагает уточнения — scope согласован за 2–4 часа.',
    tags: ['Яндекс Forms', 'YandexGPT API', 'AI-оценка за 2–4ч']
  },
  {
    num: '2',
    color: 'cyan',
    phase: 'День 1–2',
    title: 'Юридическое оформление',
    text: 'Цифровое подписание договора и NDA через Контур.Диадок с КЭП. Эскроу-схема: 50% аванс замораживается до финальной сдачи. Срок — 1–2 рабочих дня.',
    tags: ['Контур.Диадок', 'КриптоПро ЭЦП', 'Эскроу 50/50']
  },
  {
    num: '3',
    color: 'green',
    phase: 'Дни 2–7',
    title: 'AI-подбор команды',
    text: 'Оркестратор Hermes через DataSphere ML скорирует студентов и формирует 3 варианта состава. Вы утверждаете — 3–5 человек + ментор-техлид назначены.',
    tags: ['Hermes Orchestrator', 'DataSphere ML', '48ч на подбор']
  },
  {
    num: '4',
    color: 'pink',
    phase: 'Неделя 1 · Kick-off',
    title: 'Старт: знакомство с командой',
    text: 'Видеозвонок в Яндекс Телемост: представление команды и ментора. Согласование DoD и формата работы. Вы получаете read-only доступ в GitVerse.',
    tags: ['Яндекс Телемост', 'Kaiten Board', 'GitVerse read-only']
  },
  {
    num: '5',
    color: 'pink',
    phase: 'Недели 1–4 · Спринты',
    title: 'Рабочий процесс — live-трекинг',
    text: 'Agile-спринты по 1–2 недели. Live-доступ в Kaiten в реальном времени. Демо каждую пятницу. AI-отчёт еженедельно. Эскалация блокеров за 4 часа.',
    tags: ['Kaiten Live', 'Weekly Demo', 'AI Progress Report', '4ч эскалация']
  },
  {
    num: '6',
    color: 'gold',
    phase: 'Финал',
    title: 'Сдача, оплата и офферы',
    text: 'Финальное демо и peer-review кода. Акт через Контур.Диадок. Разблокировка эскроу — выплата через Мой налог за 24 часа. Лучших участников можете пригласить на оффер.',
    tags: ['Контур.Диадок', 'Мой налог 24ч', 'Оффер для лучших']
  }
];

const DELIVERABLES = [
  { icon: '🛠️', title: 'Рабочий продукт', text: 'Production-ready код в вашем GitVerse-репозитории. Юнит-тесты от Quality Agent, документация API и архитектуры.', tags: ['GitVerse', 'Тесты', 'Документация'] },
  { icon: '📊', title: 'Полная прозрачность процесса', text: 'История всех задач в Kaiten, Git-история с коммитами, еженедельные AI-отчёты и записи демо-сессий.', tags: ['Kaiten Export', 'Git History', 'AI-отчёты'] },
  { icon: '⚖️', title: 'Юридическая чистота', text: 'Подписанный акт сдачи через Диадок, оригиналы договора и NDA с КЭП, чеки самозанятых участников.', tags: ['Акт Диадок', 'NDA + договор'] },
  { icon: '💼', title: 'Путь к найму лучших', text: 'Вы уже знаете команду по совместной работе. Лучшие участники могут получить оффер напрямую без дополнительных интервью.', tags: ['Прямой оффер', 'Без комиссий HR'] },
  { icon: '🤖', title: 'AI-сопровождение 24/7', text: 'Hermes мониторит репозиторий и задачи. Следующий проект можно подключить с той же командой.', tags: ['Hermes 24/7', 'Повторный проект'] },
  { icon: '🧩', title: 'Поддержка после сдачи', text: '14 дней поддержки: исправление критических багов, ответы по архитектуре и помощь с деплоем.', tags: ['14 дней поддержки'] }
];

const PLANS = [
  { tier: 'Мини-проект', price: '50–80k', unit: '₽ · 2 недели · команда 3 чел.', accent: 'purple', items: ['Прототип, MVP-фича, парсер', 'REST API, Telegram-бот, скрипт', 'Небольшой дашборд или утилита', 'Стек: Python / JS / Go'] },
  { tier: 'Стандарт', price: '100–150k', unit: '₽ · 3–4 недели · команда 4 чел.', accent: 'cyan', featured: true, items: ['Полноценный модуль или сервис', 'Web-приложение + backend API', 'Интеграция с внешними сервисами', 'Любой стек по вашим требованиям', 'Демо каждую пятницу'] },
  { tier: 'Сложный проект', price: '150–200k+', unit: '₽ · 4+ недели · команда 5 чел.', accent: 'green', items: ['Microservices-архитектура', 'ML-пайплайн, аналитика', 'High-load backend, DevOps', 'Полный Agile с ретро', 'Опция: продолжение командой'] }
];

const GUARANTEES = [
  { icon: '⏱️', title: 'Риск срыва сроков', text: 'Чёткий scope согласован на Kick-off. 20% временной резерв в каждом спринте. Ментор-эскалация при блокере за 4 часа. AI-мониторинг 24/7.' },
  { icon: '🧭', title: 'Риск размытого ТЗ', text: 'Обязательный Project Brief до подписания. AI-агент Intake уточняет требования. Без согласованного scope — не стартуем. Change Request через Kaiten.' },
  { icon: '🔁', title: 'Риск потери участника', text: 'Ротационный пул 120+ студентов. Замена за 48 часов без доп. оплаты. Все задачи в Kaiten — передача без потерь.' },
  { icon: '🛡️', title: 'Риск не получить результат', text: 'Эскроу: 50% до подписания акта. Еженедельные демо для корректировки курса. Не соответствует DoD — доработка за наш счёт.' }
];

const STACK_GROUPS = [
  { title: '⌨️ Разработка и IDE', tools: ['GitVerse', 'Giga IDE', 'Giga Code', 'Docker / K8s'] },
  { title: 'Трекинг проекта', tools: ['Kaiten', 'Яндекс Трекер', 'Яндекс 360'] },
  { title: '☁️ Облако и AI', tools: ['Яндекс Cloud', 'VK Cloud', 'GigaChat Pro', 'YandexGPT 4'] },
  { title: 'Коммуникации', tools: ['MAX Messenger', 'Яндекс Телемост'] },
  { title: '⚖️ Юридика', tools: ['Контур.Диадок', 'Мой налог', 'КриптоПро ЭЦП'] }
];

const FAQS = [
  { q: 'Как оформляются отношения — трудовой договор или ГПХ?', a: 'Все участники — самозанятые. С вашей компанией заключается договор оказания услуг через Контур.Диадок с КЭП. Никаких трудовых договоров и НДФЛ-вопросов с вашей стороны — только счёт и акт.' },
  { q: 'Что если команда не справится или сорвёт сроки?', a: 'AI-мониторинг 24/7, ментор-эскалация за 4 часа и 20% временной резерв в каждом спринте. Если результат не соответствует DoD — доработка за наш счёт. Эскроу защищает оплату.' },
  { q: 'Могу ли я нанять лучших участников после проекта?', a: 'Да. После завершения проекта вы можете сделать оффер любому участнику напрямую — без комиссий. Вы уже видели код, стиль работы и командную динамику.' },
  { q: 'Какой минимальный/максимальный размер проекта?', a: 'Минимум — 50 000 ₽, 2 недели, команда 3 человека. Максимум на текущем этапе — 200 000+ ₽, 4–6 недель, команда 5 человек. Крупные проекты лучше разбивать на модули.' },
  { q: 'Можно ли продолжить с той же командой?', a: 'Да. Команда уже знает вашу кодовую базу и стандарты, поэтому второй и последующие проекты стартуют быстрее — без Kick-off-недели.' },
  { q: 'Как я буду видеть прогресс?', a: 'Read-only доступ в Kaiten в любое время, демо каждую пятницу, еженедельный AI-отчёт Hermes на email и уведомления ментора по критическим блокерам.' },
  { q: 'Каков уровень студентов Школы Цифровых Технологий Сбера?', a: 'Школа 21 — российский аналог École 42. Студенты решают реальные задачи, проходят технический скоринг AI-системой и тестовое задание перед попаданием в команду.' }
];

function TrustStrip() {
  return (
    <div className="trust-strip">
      <span>Школа Цифровых Технологий Сбера</span>
      <span className="trust-divider" aria-hidden="true" />
      <span>NDA + Эскроу-оплата</span>
      <span className="trust-divider" aria-hidden="true" />
      <span>⚡ No-Equity</span>
    </div>
  );
}

function MetricPills() {
  const pills = [
    { val: '7 дней', lbl: 'от заявки до старта', cls: 'pink' },
    { val: '50–200k', lbl: '₽ за проект', cls: 'cyan' },
    { val: '2–4 нед.', lbl: 'длительность', cls: 'purple' },
    { val: '15%', lbl: 'комиссия платформы', cls: 'green' }
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

function ComparisonBlock() {
  const bad = ['Онбординг 3–6 месяцев = деньги вникуда', 'Нет слаженности — незнакомые люди', 'Нет гарантии по срокам и качеству', 'HR-расходы + налоги + оборудование', 'Риск «взяли, обучили, ушли»', 'Непонятно как оценить кандидата'];
  const good = ['Команда стартует через 7 дней без онбординга', 'Сработанная группа под ваш стек', 'Фикс-прайс — гарантия результата', 'Самозанятые — ноль кадровых расходов', 'Проект завершён, отношения без обязательств', 'Скоринг навыков AI-системой Hermes'];
  return (
    <div className="company-vs">
      <div className="vs-bad">
        <div className="vs-label bad">❌ Альтернативы</div>
        <h3>Фриланс / Аутстаф / Джун-наём</h3>
        <ul className="vs-list bad">{bad.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className="vs-divider">VS</div>
      <div className="vs-good">
        <div className="vs-label good">✅ Точка Сборки</div>
        <h3>Team-as-a-Service из ШЦТ Сбера</h3>
        <ul className="vs-list good">{good.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </div>
  );
}

function ProcessTimeline() {
  return (
    <div className="company-timeline">
      {STEPS.map((step) => (
        <Reveal key={step.num} className="company-step">
          <div className={`company-step-num ${step.color ? `step-color-${step.color}` : ''}`}>{step.num}</div>
          <div className="company-step-body">
            <div className="company-step-phase">{step.phase}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            <TagRow tags={step.tags} />
          </div>
        </Reveal>
      ))}
      <Card accent="cyan" className="company-step-note">
        <strong>⚙️ 80% процесса автоматизировано через оркестратор Hermes.</strong>
        <p>Ментор фокусируется на стратегических решениях — рутина уходит AI-агентам.</p>
      </Card>
    </div>
  );
}

function FAQSection() {
  const [open, setOpen] = useState(0);

  const handleToggle = (index) => {
    setOpen(open === index ? null : index);
  };

  return (
    <div className="company-faq">
      {FAQS.map((item, index) => (
        <div className="faq-item" key={item.q}>
          <button className="faq-q" type="button" onClick={() => handleToggle(index)} aria-expanded={open === index}>
            <span>{item.q}</span>
            <span className="faq-icon">{open === index ? '×' : '+'}</span>
          </button>
          {open === index && <div className="faq-a">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

function ProjectForm() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [formState, setFormState] = useState({ consent: false });
  const [consentError, setConsentError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { goal } = useAnalytics();

  const minDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 10);
  })();

  const onSubmit = async (values) => {
    setServerError('');
    setSuccess('');
    setConsentError('');

    if (formState.consent !== true) {
      setConsentError('Необходимо согласие на обработку персональных данных');
      return;
    }

    try {
      const payload = {
        ...values,
        phone: values.phone || '',
        fileUrl: values.fileUrl || '',
        consent: formState.consent
      };
      const result = await api('/api/submit-project', payload);
      setSuccess(result.message || '✅ Заявка отправлена! AI-агент ответит за 2–4 часа.');
      goal(GOALS.COMPANY_FORM_SUCCESS, { budget: values.budget, stack: values.stack });
      reset();
      setFormState({ consent: false });
    } catch (error) {
      setServerError(error.message || 'Не удалось отправить. Напишите нам напрямую: tochka.sborki21@yandex.ru');
    }
  };

  return (
    <Card accent="cyan" className="company-form-card">
      <h2>Подать техническое задание</h2>
      <p className="form-sub">Все поля со звёздочкой обязательны. AI-агент проверит ТЗ и ответит за 2–4 часа.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate data-ym-goal="project_submit">
        <div className="form-row-2">
          <label>
            <span>Компания <b className="req">*</b></span>
            <input {...register('companyName', { required: 'Укажите компанию', minLength: { value: 2, message: 'Минимум 2 символа' } })} />
            {errors.companyName && <small className="form-error">{errors.companyName.message}</small>}
          </label>
          <label>
            <span>Контактное лицо <b className="req">*</b></span>
            <input {...register('contactName', { required: 'Укажите контактное лицо', minLength: { value: 2, message: 'Минимум 2 символа' } })} />
            {errors.contactName && <small className="form-error">{errors.contactName.message}</small>}
          </label>
        </div>
        <div className="form-row-2">
          <label>
            <span>Email <b className="req">*</b></span>
            <input type="email" {...register('email', { required: 'Укажите email', pattern: { value: /.+@.+\..+/, message: 'Введите корректный email' } })} />
            {errors.email && <small className="form-error">{errors.email.message}</small>}
          </label>
          <label>
            <span>Телефон</span>
            <input type="tel" {...register('phone', { maxLength: { value: 80, message: 'Телефон слишком длинный' } })} />
            {errors.phone && <small className="form-error">{errors.phone.message}</small>}
          </label>
        </div>
        <label>
          <span>Технологический стек <b className="req">*</b></span>
          <input placeholder="Python, Go, React, PostgreSQL" {...register('stack', { required: 'Укажите стек' })} />
          {errors.stack && <small className="form-error">{errors.stack.message}</small>}
        </label>
        <div className="form-row-2">
          <label>
            <span>Бюджет <b className="req">*</b></span>
            <select {...register('budget', { required: 'Выберите бюджет' })} defaultValue="">
              <option value="" disabled>Выберите диапазон</option>
              <option value="50–80k ₽">50–80k ₽ (мини-проект)</option>
              <option value="80–120k ₽">80–120k ₽ (стандарт)</option>
              <option value="120–200k ₽">120–200k ₽ (сложный)</option>
              <option value="200k+ ₽">200k+ ₽ (обсудим)</option>
            </select>
            {errors.budget && <small className="form-error">{errors.budget.message}</small>}
          </label>
          <label>
            <span>Желаемый срок завершения <b className="req">*</b></span>
            <input type="date" min={minDate} {...register('deadline', { required: 'Укажите дедлайн' })} />
            {errors.deadline && <small className="form-error">{errors.deadline.message}</small>}
          </label>
        </div>
        <label>
          <span>Ссылка на файл ТЗ</span>
          <input type="url" placeholder="https://..." {...register('fileUrl', { pattern: { value: /^https?:\/\/.+/i, message: 'Введите ссылку с http:// или https://' } })} />
          {errors.fileUrl && <small className="form-error">{errors.fileUrl.message}</small>}
        </label>
        <label>
          <span>Описание проекта <b className="req">*</b></span>
          <textarea rows="5" placeholder="Цель, пользователи, интеграции, ограничения, критерии готовности" {...register('description', { required: 'Опишите проект', minLength: { value: 20, message: 'Минимум 20 символов' } })} />
          {errors.description && <small className="form-error">{errors.description.message}</small>}
        </label>
        <ConsentCheckbox
          checked={formState.consent}
          onChange={(event) => {
            const consent = event.target.checked;
            setFormState({ consent });
            if (consent) setConsentError('');
          }}
          error={consentError}
        />
        <button className="primary-button" type="submit" disabled={isSubmitting || formState.consent !== true}>{isSubmitting ? '⏳ Отправляем...' : 'Отправить техническое задание'}</button>
        {success && <p className="form-success">{success}</p>}
        {serverError && <p className="form-error form-message">{serverError}</p>}
      </form>
      <p className="form-note">Данные защищены. NDA до начала работ через Контур.Диадок.</p>
    </Card>
  );
}

export function CompanyPathPage() {
  return (
    <div className="company-page">
      <PageShell page={pageShell('purple')} className="company-hero">
        <Reveal><TrustStrip /></Reveal>
        <div className="company-hero-grid">
          <div>
            <Reveal>
              <Logo />
              <Badge accent="purple">Для компаний-заказчиков</Badge>
              <h1 className="company-hero-title">Решим ваши IT-задачи<br />за <em>1 спринт</em>.<br /><span>Фикс-прайс.</span></h1>
              <p className="company-hero-sub"><strong>Готовая IT-команда</strong> из Школы Цифровых Технологий Сбера — собранная под ваш стек, без онбординга, с AI-сопровождением каждого шага. Вы платите только за результат.</p>
            </Reveal>
            <Reveal><MetricPills /></Reveal>
            <Reveal>
              <div className="company-hero-ctas">
                <TrackedButton as="a" href="#submit" className="primary-button">Отправить техзадание</TrackedButton>
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
              <Checklist items={['Сборка команды под ваш стек за 7 дней', 'Фикс-прайс — платите только за результат', 'Стеки: Python · Go · JS/TS · Rust · C/C++', 'Live-прогресс в Kaiten — прозрачность 24/7', 'Демо каждую пятницу — без сюрпризов', 'Лучших участников — сразу в оффер']} />
            </Card>
            <Card accent="green" className="hero-escrow-card">
              <div className="section-label">🛡️ Защита интересов</div>
              <Checklist items={['Эскроу: 50% аванс заморожен до сдачи', 'NDA и договор через Контур.Диадок', 'Замена участника за 48 часов', 'Ментор-эскалация при любом блокере']} />
            </Card>
          </Reveal>
        </div>
      </PageShell>

      <PageShell page={pageShell('dark')}>
        <Reveal>
          <Badge>Почему Точка Сборки</Badge>
          <h2>Не фриланс. Не аутстаф. Не джун-лотерея.</h2>
          <p className="subtitle">Мы даём то, чего нет на рынке: слаженную команду под ваш стек, готовую стартовать через неделю.</p>
        </Reveal>
        <Reveal><ComparisonBlock /></Reveal>
        <div className="grid three company-why-grid">
          {[
            { icon: '🤖', title: 'AI-подбор за 48 часов', text: 'Оркестратор Hermes на YandexGPT анализирует ваш стек и формирует оптимальный состав из 120+ студентов.' },
            { icon: '👁️', title: 'Полная прозрачность', text: 'Live-доступ в Kaiten: задачи, статусы и burndown в реальном времени. Еженедельное демо каждую пятницу.' },
            { icon: '⚖️', title: 'Юридическая чистота', text: 'Договор и NDA через Контур.Диадок с КЭП. Эскроу-схема. Мой налог для выплат. Всё по закону РФ.' }
          ].map((item) => <Reveal key={item.title}><Card className="why-card"><div className="why-icon">{item.icon}</div><h3>{item.title}</h3><p>{item.text}</p></Card></Reveal>)}
        </div>
      </PageShell>

      <PageShell page={pageShell('purple')}>
        <section id="process" className="anchor-section">
          <Reveal>
            <Badge accent="purple">Прозрачный процесс</Badge>
            <h2>От заявки до <span className="accent-purple-text">рабочего продукта</span> — 6 шагов</h2>
            <p className="subtitle">Каждый шаг задокументирован. Ментор + AI на каждом этапе. Никаких сюрпризов.</p>
          </Reveal>
          <ProcessTimeline />
        </section>
      </PageShell>

      <PageShell page={pageShell('dark')}>
        <Reveal>
          <Badge accent="green">Результат проекта</Badge>
          <h2>Что конкретно вы получаете</h2>
        </Reveal>
        <div className="grid three company-deliverables">
          {DELIVERABLES.map((item) => <Reveal key={item.title}><Card accent="green"><div className="deliverable-icon">{item.icon}</div><h3>{item.title}</h3><p>{item.text}</p><TagRow tags={item.tags} /></Card></Reveal>)}
        </div>
      </PageShell>

      <PageShell page={pageShell('cyan')}>
        <Reveal className="text-center">
          <Badge accent="cyan">Прозрачное ценообразование</Badge>
          <h2>Фикс-прайс. Без скрытых платежей.</h2>
          <p className="subtitle">Цена зависит от объёма, не от часов. Итоговая сумма известна до старта.</p>
        </Reveal>
        <div className="grid three company-pricing-grid">
          {PLANS.map((plan) => <Reveal key={plan.tier}><Card accent={plan.accent} className={`pricing-card ${plan.featured ? 'pricing-featured' : ''}`}>{plan.featured && <div className="pricing-badge">Популярный</div>}<div className="pricing-tier">{plan.tier}</div><div className={`pricing-price accent-${plan.accent}`}>{plan.price}</div><div className="pricing-range">{plan.unit}</div><Checklist items={plan.items} /><TrackedButton as="a" href="#submit" className="primary-button pricing-cta">Оставить заявку →</TrackedButton></Card></Reveal>)}
        </div>
        <Reveal><div className="escrow-highlight"><span>🛡️</span><div><strong>Эскроу-схема защищает вас:</strong> 50% аванс замораживается при подписании и разблокируется только после вашего подписания акта сдачи. Оставшиеся 50% — после финального демо.</div></div></Reveal>
      </PageShell>

      <PageShell page={pageShell('green')}>
        <Reveal>
          <Badge accent="green">Гарантии</Badge>
          <h2>Ваши риски <span className="accent-green-text">минимальны</span></h2>
          <p className="subtitle">Мы системно закрываем каждый сценарий провала — ещё до старта.</p>
        </Reveal>
        <div className="grid two company-guarantees-grid">
          {GUARANTEES.map((guarantee) => <Reveal key={guarantee.title}><div className="guarantee-item"><span className="guarantee-icon">{guarantee.icon}</span><div><h3>{guarantee.title}</h3><p>{guarantee.text}</p></div></div></Reveal>)}
        </div>
      </PageShell>

      <PageShell page={pageShell('purple')}>
        <Reveal>
          <Badge accent="purple">Инструменты и стек</Badge>
          <h2>Суверенный стек — без санкционных рисков</h2>
          <p className="subtitle">Весь процесс — на российском и open-source ПО. Никаких иностранных облаков, никакого vendor lock-in.</p>
        </Reveal>
        <div className="company-stack-grid">
          {STACK_GROUPS.map((group) => <Reveal key={group.title}><Card accent="purple" className="stack-card"><h3>{group.title}</h3><TagRow tags={group.tools} /></Card></Reveal>)}
          <Reveal><Card accent="cyan" className="hermes-card"><h3>HERMES ORCHESTRATOR</h3><p>LangChain · Apache Airflow · Яндекс DataSphere</p><TagRow tags={['INTAKE: YandexGPT', 'MATCHING: DataSphere', 'MONITOR: Kaiten API', 'QUALITY: GigaChat Pro']} /><div className="hermes-metrics"><strong>14→2<span>дня подбора</span></strong><strong>-60%<span>OPEX</span></strong><strong>80%<span>рутины → AI</span></strong></div></Card></Reveal>
        </div>
      </PageShell>

      <PageShell page={pageShell('dark')}>
        <div className="company-faq-shell">
          <Reveal>
            <Badge accent="purple">FAQ</Badge>
            <h2>Отвечаем на главные вопросы</h2>
          </Reveal>
          <FAQSection />
        </div>
      </PageShell>

      <PageShell page={pageShell('cyan')}>
        <section id="submit" className="anchor-section">
          <div className="company-form-grid">
            <Reveal>
              <Badge accent="cyan">Начать проект</Badge>
              <h2>Отправьте ТЗ — <span className="accent-cyan-text">ответим за 4 часа</span></h2>
              <p className="subtitle text-big">AI-агент Intake сам извлечёт требования к стеку, оценит сложность и предложит уточнения.</p>
              <div className="form-process-mini">
                {[
                  { n: '1', t: 'Заполните форму', d: 'AI-агент проверит ТЗ за 2–4 часа' },
                  { n: '2', t: 'Подпишите договор', d: 'Цифровой документооборот — 1–2 дня' },
                  { n: '3', t: 'Kick-off встреча', d: '60 мин · согласование DoD и формата' },
                  { n: '4', t: 'Спринты и демо', d: 'Прогресс в Kaiten + AI-отчёт еженедельно' },
                  { n: '5', t: 'Сдача и оплата', d: 'Акт через Диадок → эскроу → результат' }
                ].map((item) => <div key={item.n} className="mini-process-row"><div className="mini-process-num">{item.n}</div><div><strong>{item.t}</strong><p>{item.d}</p></div></div>)}
              </div>
            </Reveal>
            <Reveal><ProjectForm /></Reveal>
          </div>
        </section>
      </PageShell>

      <PageShell page={pageShell('dark')}>
        <Reveal className="text-center">
          <h2>Предпочитаете написать напрямую?</h2>
          <p className="subtitle">Выберите удобный канал — ответим в течение часа в рабочее время.</p>
        </Reveal>
        <Reveal>
          <div className="company-contacts">
            {[
              { icon: '✉️', label: 'Email', val: 'tochka.sborki21@yandex.ru', href: 'mailto:tochka.sborki21@yandex.ru' },
              { icon: 'VK', label: 'ВКонтакте', val: 'vk.com/tochkasborki21', href: 'https://vk.com/tochkasborki21', channel: 'vk' },
              { icon: 'MAX', label: 'MAX Messenger', val: '⚡ Точка Сборки', href: 'https://max.ru/join/7jlWTUq574ffC3I-FwT3MuJk-Op4kaBJRw2D60o7uOI', channel: 'max' },
              { icon: 'TG', label: 'Telegram', val: '@tochka_sborki_21', href: 'https://t.me/+6re5Frc7sM0yNWIx', channel: 'telegram' }
            ].map((contact) => contact.channel ? (
              <TrackedExternalLink
                key={contact.label}
                href={contact.href}
                channel={contact.channel}
                className="company-contact-card"
              >
                <span className="company-contact-icon">{contact.icon}</span>
                <div><small>{contact.label}</small><strong>{contact.val}</strong></div>
              </TrackedExternalLink>
            ) : (
              <a key={contact.label} href={contact.href} className="company-contact-card">
                <span className="company-contact-icon">{contact.icon}</span>
                <div><small>{contact.label}</small><strong>{contact.val}</strong></div>
              </a>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div className="final-cta-block">
            <div className="section-label final-label">Готовы начать?</div>
            <h2>Соберём команду за <em>7 дней.</em><br />Результат за <span>1 спринт.</span></h2>
            <p>Team-as-a-Service из Школы Цифровых Технологий Сбера — фикс-прайс, без онбординга, с полной прозрачностью.</p>
            <div className="final-cta-buttons">
              <TrackedButton as="a" href="#submit" className="primary-button btn-lg">Отправить ТЗ сейчас</TrackedButton>
              <Link to="/how-it-works" className="outline-button">Подробнее о процессе →</Link>
            </div>
          </div>
        </Reveal>
      </PageShell>
    </div>
  );
}
