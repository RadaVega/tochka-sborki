import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ConsentCheckbox } from '../components/ConsentCheckbox';
import { TrackedButton, TrackedLink, TrackedExternalLink } from '../components/Tracked';
import { useAnalytics } from '../hooks/useAnalytics';
import {
  Badge,
  Card,
  Checklist,
  Reveal,
} from '../components/UI';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const api = async (url, payload) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false)
    throw new Error(data.error || data.message || 'Не удалось отправить форму');
  return data;
};

/* ─── Email link with goal tracking ─────────────── */
function EmailLink({ href, className, children }) {
  const { goal, GOALS } = useAnalytics();
  return (
    <a
      href={href}
      className={className}
      onClick={() => goal(GOALS.CONTACT_CHANNEL_CLICK, { channel: 'email' })}
    >
      {children}
    </a>
  );
}

/* ─── Channel data with hrefs ─────────────────────── */
const CHANNELS = [
  {
    icon: '✉',
    accent: 'pink',
    label: 'Email',
    handle: 'Tochka.Sborki21@yandex.ru',
    desc: 'Деловые запросы и партнёрства',
    href: 'mailto:Tochka.Sborki21@yandex.ru',
    cta: 'Написать',
    channel: 'email',
  },
  {
    icon: '⚡',
    accent: 'cyan',
    label: 'MAX Messenger — канал',
    handle: 'Точка Сборки · Новости',
    desc: 'Анонсы проектов, вакансии команд, дайджест',
    href: 'https://max.ru/join/7jlWTUq574ffC3I-FwT3MuJk-Op4kaBJRw2D60o7uOI',
    cta: 'Подписаться',
    channel: 'max',
  },
  {
    icon: '💬',
    accent: 'purple',
    label: 'MAX Messenger — чат',
    handle: 'Чат для студентов',
    desc: 'Вопросы о вступлении, нетворкинг, поддержка',
    href: 'https://web.max.ru/-74708826221932',
    cta: 'Вступить в чат',
    channel: 'max',
  },
  {
    icon: '🔵',
    accent: 'cyan',
    label: 'ВКонтакте',
    handle: 'vk.com/tochkasborki21',
    desc: 'Кейсы выпускников, контент, сообщество',
    href: 'https://vk.com/tochkasborki21',
    cta: 'Подписаться',
    channel: 'vk',
  },
  {
    icon: '📱',
    accent: 'purple',
    label: 'Telegram',
    handle: '@tochka_sborki',
    desc: 'Новости проекта и важные обновления',
    href: 'https://t.me/+6re5Frc7sM0yNWIx',
    cta: 'Открыть',
    channel: 'telegram',
  },
];

const STATS = [
  { value: '120', label: 'студентов', accent: 'purple' },
  { value: '20',  label: 'партнёров', accent: 'cyan'   },
  { value: '7 дн', label: 'сборка команды', accent: 'pink' },
  { value: 'No-Equity', label: 'фикс-прайс', accent: 'green' },
];

const VALUE_BLOCKS = [
  {
    title: '🎓 Студентам',
    accent: 'purple',
    items: [
      'Доход 40–90k ₽ во время учёбы',
      'Кейс с живым заказчиком в портфолио',
      'Полный Agile-цикл: Scrum, Git-flow, CI/CD',
      'Прямой путь к офферу от партнёра',
    ],
    cta: { label: 'Подать заявку →', to: '/student-path' },
  },
  {
    title: '🏢 Компаниям',
    accent: 'cyan',
    items: [
      'Готовая команда за 7 дней',
      'Фикс-прайс — платите за результат',
      'Стеки: Python · Go · JS/TS · Rust · C/C++',
      'Эскроу-защита + NDA через Диадок',
    ],
    cta: { label: 'Отправить ТЗ →', to: '/company-path' },
  },
];

/* ─── Subscribe form ──────────────────────────────── */
function SubscribeForm() {
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [formState, setFormState] = useState({ consent: false });
  const [consentError, setConsentError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { goal, GOALS } = useAnalytics();

  const onSubmit = async ({ email }) => {
    setOk(''); setErr(''); setConsentError('');

    if (formState.consent !== true) {
      setConsentError('Необходимо согласие на обработку персональных данных');
      return;
    }

    try {
      const res = await api('/api/subscribe', { email, consent: formState.consent });
      setOk(res.message || '✅ Вы подписаны на новости Точки Сборки!');
      goal(GOALS.SUBSCRIBE_SUCCESS, { email });
      reset();
      setFormState({ consent: false });
    } catch (e) {
      setErr(e.message || 'Не удалось подписаться. Попробуйте позже.');
    }
  };

  return (
    <form className="subscribe-form" onSubmit={handleSubmit(onSubmit)} noValidate data-ym-goal="subscribe">
      <div className="subscribe-row">
        <input
          type="email"
          placeholder="ваш@email.ru"
          aria-label="Email для подписки"
          {...register('email', {
            required: 'Укажите email',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Введите корректный email' },
          })}
        />
        <button className="primary-button" type="submit" disabled={isSubmitting || formState.consent !== true}>
          {isSubmitting ? '⏳' : 'Подписаться'}
        </button>
      </div>
      {errors.email && <small className="form-error">{errors.email.message}</small>}
      {err && <small className="form-error">{err}</small>}
      {ok && <small className="form-success">{ok}</small>}

      <ConsentCheckbox
        checked={formState.consent}
        onChange={(event) => {
          const consent = event.target.checked;
          setFormState({ consent });
          if (consent) setConsentError('');
        }}
        error={consentError}
      />
    </form>
  );
}

/* ─── Contact form ────────────────────────────────── */
function ContactForm() {
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [formState, setFormState] = useState({ consent: false });
  const [consentError, setConsentError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { goal, GOALS } = useAnalytics();

  const onSubmit = async (values) => {
    setOk(''); setErr(''); setConsentError('');

    if (formState.consent !== true) {
      setConsentError('Необходимо согласие на обработку персональных данных');
      return;
    }

    try {
      const res = await api('/api/contact', { ...values, consent: formState.consent });
      setOk(res.message || '✅ Сообщение отправлено! Ответим в течение рабочего дня.');
      goal(GOALS.CONTACT_FORM_SUCCESS, { role: values.role });
      reset();
      setFormState({ consent: false });
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <Card accent="purple" className="ct-form-card">
      <div className="ct-form-header">
        <div className="ct-form-icon">✉</div>
        <div>
          <h2>Написать напрямую</h2>
          <p>Ответим в течение рабочего дня</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="ct-form" data-ym-goal="contact_send">
        <label>
          <span>Имя <span className="req">*</span></span>
          <input
            type="text"
            placeholder="Иван Петров"
            {...register('name', { required: 'Укажите имя', minLength: { value: 2, message: 'Минимум 2 символа' } })}
          />
          {errors.name && <small className="form-error">{errors.name.message}</small>}
        </label>

        <label>
          <span>Email <span className="req">*</span></span>
          <input
            type="email"
            placeholder="ivan@company.ru"
            {...register('email', {
              required: 'Укажите email',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Введите корректный email' },
            })}
          />
          {errors.email && <small className="form-error">{errors.email.message}</small>}
        </label>

        <label>
          <span>Кто вы?</span>
          <select {...register('role')}>
            <option value="">Выберите роль</option>
            <option value="student">Студент Школы 21</option>
            <option value="company">Компания-заказчик</option>
            <option value="partner">Потенциальный партнёр</option>
            <option value="mentor">Хочу стать ментором</option>
            <option value="media">СМИ / исследователь</option>
            <option value="other">Другое</option>
          </select>
        </label>

        <label>
          <span>Сообщение <span className="req">*</span></span>
          <textarea
            rows={4}
            placeholder="Расскажите о вашем запросе..."
            {...register('message', { required: 'Напишите сообщение', minLength: { value: 10, message: 'Минимум 10 символов' } })}
          />
          {errors.message && <small className="form-error">{errors.message.message}</small>}
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

        <button className="primary-button" type="submit" disabled={isSubmitting || formState.consent !== true} style={{ width: '100%' }}>
          {isSubmitting ? '⏳ Отправляем...' : '📨 Отправить сообщение'}
        </button>

        {err && <p className="form-error form-message">{err}</p>}
        {ok && <p className="form-success">{ok}</p>}
      </form>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   CONTACTS PAGE
═══════════════════════════════════════════════════ */
export function ContactsPage() {
  return (
    <section className="page page-purple contacts-page">
      <div className="glow glow-a" />
      <div className="glow glow-b" />

      <div className="page-inner">

        {/* ── HERO BANNER ─────────────────────────────── */}
        <Reveal>
          <div className="ct-hero">
            <div className="ct-hero-left">
              <Logo />
              <Badge accent="pink" style={{ marginTop: '18px' }}>Готовы начать?</Badge>
              <h1 className="ct-hero-title">
                Собираем Команды.<br />
                <em>Совершаем Подвиги!</em>
              </h1>
              <p className="ct-hero-sub">
                <strong>Team-as-a-Service</strong> из Школы Цифровых Технологий Сбера —
                готовая IT-команда за 7 дней, фикс-прайс, без онбординга.
              </p>
              <div className="ct-hero-ctas">
                <TrackedLink to="/company-path" goal="HERO_CTA_COMPANY" className="primary-button">
                  📝 Отправить ТЗ
                </TrackedLink>
                <TrackedLink to="/student-path" goal="HERO_CTA_STUDENT" className="ct-outline-btn">
                  🎓 Студентам →
                </TrackedLink>
              </div>
            </div>

            {/* Right: orbital node visual */}
            <div className="ct-orbital" aria-hidden="true">
              <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
                <defs>
                  <radialGradient id="ctRg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(124,58,237,.3)" />
                    <stop offset="100%" stopColor="rgba(124,58,237,0)" />
                  </radialGradient>
                </defs>
                <circle cx="110" cy="110" r="100" fill="url(#ctRg)" />
                <circle cx="110" cy="110" r="95" stroke="rgba(124,58,237,.12)" strokeWidth="1" />
                <circle cx="110" cy="110" r="70" stroke="rgba(124,58,237,.09)" strokeWidth="1" strokeDasharray="3 8" />
                <circle cx="110" cy="110" r="46" stroke="rgba(8,145,178,.14)" strokeWidth="1" />
                <line x1="110" y1="15" x2="110" y2="60" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="205" y1="110" x2="160" y2="110" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="110" y1="205" x2="110" y2="160" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="15" y1="110" x2="60" y2="110" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="178" y1="42" x2="154" y2="66" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" opacity=".85" />
                <line x1="178" y1="178" x2="154" y2="154" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" opacity=".85" />
                <line x1="42" y1="178" x2="66" y2="154" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" opacity=".85" />
                <line x1="42" y1="42" x2="66" y2="66" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" opacity=".85" />
                <circle cx="110" cy="15" r="5.5" fill="#7c3aed" />
                <circle cx="205" cy="110" r="5.5" fill="#7c3aed" />
                <circle cx="110" cy="205" r="5.5" fill="#7c3aed" />
                <circle cx="15" cy="110" r="5.5" fill="#7c3aed" />
                <circle cx="178" cy="42" r="4" fill="#f472b6" opacity=".9" />
                <circle cx="178" cy="178" r="4" fill="#f472b6" opacity=".9" />
                <circle cx="42" cy="178" r="4" fill="#22d3ee" opacity=".9" />
                <circle cx="42" cy="42" r="4" fill="#22d3ee" opacity=".9" />
                <circle cx="110" cy="110" r="24" fill="rgba(124,58,237,.22)" stroke="#7c3aed" strokeWidth="2" />
                <circle cx="110" cy="110" r="13" fill="#7c3aed" />
                <circle cx="110" cy="110" r="6.5" fill="white" opacity=".95" />
              </svg>
              <div className="ct-orbital-label">
                <strong>Team-as-a-Service</strong>
                <span>Школа Цифровых Технологий Сбера · 2026</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── STATS STRIP ─────────────────────────────── */}
        <Reveal>
          <div className="ct-stats">
            {STATS.map((s) => (
              <div key={s.label} className={`ct-stat ct-stat-${s.accent}`}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── MAIN 3-COLUMN GRID ─────────────────────── */}
        <div className="ct-main">

          {/* COL 1: Value props + channels */}
          <div className="ct-col-left">

            {/* Value props */}
            <Reveal>
              {VALUE_BLOCKS.map((block) => (
                <Card key={block.title} accent={block.accent} className="ct-value-card">
                  <h3>{block.title}</h3>
                  <Checklist items={block.items} />
                  <TrackedLink
                    to={block.cta.to}
                    goal={block.accent === 'cyan' ? 'HERO_CTA_COMPANY' : 'HERO_CTA_STUDENT'}
                    className={`ct-card-cta ct-cta-${block.accent}`}
                  >
                    {block.cta.label}
                  </TrackedLink>
                </Card>
              ))}
            </Reveal>

            {/* Newsletter subscribe */}
            <Reveal>
              <div className="ct-subscribe-block">
                <div className="ct-subscribe-header">
                  <span>📬</span>
                  <div>
                    <h3>Дайджест Точки Сборки</h3>
                    <p>Новые проекты, кейсы команд, советы по карьере — раз в неделю</p>
                  </div>
                </div>
                <SubscribeForm />
              </div>
            </Reveal>
          </div>

          {/* COL 2: Direct channels */}
          <div className="ct-col-mid">
            <Reveal>
              <h2 className="ct-col-heading">Свяжитесь напрямую</h2>
              <p className="ct-col-sub">Выберите удобный канал — ответим в течение часа в рабочее время</p>
            </Reveal>

            {CHANNELS.map((ch) => (
              <Reveal key={ch.label}>
                {ch.channel === 'email' ? (
                  <EmailLink
                    href={ch.href}
                    className={`ct-channel ct-channel-${ch.accent}`}
                  >
                    <div className={`ct-ch-icon ct-ch-icon-${ch.accent}`}>{ch.icon}</div>
                    <div className="ct-ch-body">
                      <small>{ch.label}</small>
                      <strong>{ch.handle}</strong>
                      <span>{ch.desc}</span>
                    </div>
                    <div className={`ct-ch-cta ct-ch-cta-${ch.accent}`}>{ch.cta} →</div>
                  </EmailLink>
                ) : (
                  <TrackedExternalLink
                    href={ch.href}
                    channel={ch.channel}
                    goalName={ch.channel === 'vk' ? 'OPEN_VK_GROUP' : ch.channel === 'telegram' ? 'OPEN_TELEGRAM' : undefined}
                    className={`ct-channel ct-channel-${ch.accent}`}
                  >
                    <div className={`ct-ch-icon ct-ch-icon-${ch.accent}`}>{ch.icon}</div>
                    <div className="ct-ch-body">
                      <small>{ch.label}</small>
                      <strong>{ch.handle}</strong>
                      <span>{ch.desc}</span>
                    </div>
                    <div className={`ct-ch-cta ct-ch-cta-${ch.accent}`}>{ch.cta} →</div>
                  </TrackedExternalLink>
                )}
              </Reveal>
            ))}

            {/* Trust badges */}
            <Reveal>
              <div className="ct-trust">
                <span>🛡 NDA через Контур.Диадок</span>
                <span>🔒 Данные защищены</span>
                <span>⚡ Ответ за 1 час</span>
              </div>
            </Reveal>
          </div>

          {/* COL 3: Contact form */}
          <div className="ct-col-right">
            <Reveal>
              <ContactForm />
            </Reveal>

            {/* Quick links */}
            <Reveal>
              <div className="ct-quick-links">
                <h3>Быстрые ссылки</h3>
                <nav className="ct-quick-nav">
                  <Link to="/company-path">Для компаний →</Link>
                  <Link to="/student-path">Для студентов →</Link>
                  <Link to="/how-it-works">Как это работает →</Link>
                  <Link to="/ai-architecture">Hermes AI →</Link>
                  <Link to="/partners">Партнёры →</Link>
                  <Link to="/goals">Цели и метрики →</Link>
                </nav>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── FINAL CTA BAND ──────────────────────────── */}
        <Reveal>
          <div className="ct-final">
            <div className="ct-final-text">
              <h2>Готовы собрать команду за <em>7 дней?</em></h2>
              <p>Фикс-прайс · No-Equity · Полная прозрачность · Российский стек</p>
            </div>
            <div className="ct-final-actions">
              <TrackedLink to="/company-path" goal="HERO_CTA_COMPANY" className="primary-button">
                📝 Отправить ТЗ сейчас
              </TrackedLink>
              <TrackedLink to="/how-it-works" className="ct-outline-btn">
                Как это работает →
              </TrackedLink>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}