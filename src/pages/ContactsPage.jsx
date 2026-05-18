/**
 * ContactsPage — полный редизайн страницы Контакты
 *
 * УСТАНОВКА:
 *   1. Замените export function ContactsPage() в src/pages/Pages.jsx
 *      на: export { ContactsPage } from './ContactsPage';
 *   2. Создайте src/pages/ContactsPage.jsx с этим содержимым
 *   3. Добавьте CSS из комментария внизу в src/styles/index.css
 *
 * ПРОБЛЕМА ОРИГИНАЛА:
 *   contacts-grid имел align-items: center, что заставляло правую колонку
 *   «центрироваться» относительно высоты левой — при разной длине контента
 *   колонки выглядели несбалансированно и сдвинутыми.
 *
 * РЕШЕНИЕ:
 *   Полностью новая структура — hero-banner, stats-strip, затем 3 зоны:
 *   каналы связи | большой визуал | форма обратной связи
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/Logo';
import {
  Badge,
  Card,
  Checklist,
  MetricBox,
  Reveal,
  TagRow,
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

/* ─── Channel data with hrefs ─────────────────────── */
const CHANNELS = [
  {
    icon: '✉️',
    accent: 'pink',
    label: 'Email',
    handle: 'tochka.sborki21@vk.com',
    desc: 'Деловые запросы и партнёрства',
    href: 'mailto:tochka.sborki21@vk.com',
    cta: 'Написать',
  },
  {
    icon: '⚡',
    accent: 'cyan',
    label: 'MAX Messenger — канал',
    handle: 'Точка Сборки · Новости',
    desc: 'Анонсы проектов, вакансии команд, дайджест',
    href: 'https://max.ru/join/7jlWTUq574ffC3I-FwT3MuJk-Op4kaBJRw2D60o7uOI',
    cta: 'Подписаться',
  },
  {
    icon: '💬',
    accent: 'purple',
    label: 'MAX Messenger — чат',
    handle: 'Чат для студентов',
    desc: 'Вопросы о вступлении, нетворкинг, поддержка',
    href: 'https://web.max.ru/-74708826221932',
    cta: 'Вступить в чат',
  },
  {
    icon: '🔵',
    accent: 'cyan',
    label: 'ВКонтакте',
    handle: 'vk.com/tochkasborki21',
    desc: 'Кейсы выпускников, контент, сообщество',
    href: 'https://vk.com/tochkasborki21',
    cta: 'Подписаться',
  },
  {
    icon: '📱',
    accent: 'purple',
    label: 'Telegram',
    handle: '@tochka_sborki',
    desc: 'Новости проекта и важные обновления',
    href: 'https://t.me/+6re5Frc7sM0yNWIx',
    cta: 'Открыть',
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
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    setOk(''); setErr('');
    try {
      const res = await api('/api/subscribe', { email });
      setOk(res.message || '✅ Вы подписаны на новости Точки Сборки!');
      reset();
    } catch (e) {
      setErr(e.message || 'Не удалось подписаться. Попробуйте позже.');
    }
  };

  return (
    <form className="subscribe-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '⏳' : 'Подписаться'}
        </button>
      </div>
      {errors.email && <small className="form-error">{errors.email.message}</small>}
      {err && <small className="form-error">{err}</small>}
      {ok && <small className="form-success">{ok}</small>}
    </form>
  );
}

/* ─── Contact form ────────────────────────────────── */
function ContactForm() {
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    setOk(''); setErr('');
    try {
      const res = await api('/api/contact', values);
      setOk(res.message || '✅ Сообщение отправлено! Ответим в течение рабочего дня.');
      reset();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <Card accent="purple" className="ct-form-card">
      <div className="ct-form-header">
        <div className="ct-form-icon">✉️</div>
        <div>
          <h2>Написать напрямую</h2>
          <p>Ответим в течение рабочего дня</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="ct-form">
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

        <button className="primary-button" type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
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
                <Link to="/company-path" className="primary-button">📝 Отправить ТЗ</Link>
                <Link to="/student-path" className="ct-outline-btn">🎓 Студентам →</Link>
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
                  <Link to={block.cta.to} className={`ct-card-cta ct-cta-${block.accent}`}>
                    {block.cta.label}
                  </Link>
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
                <a
                  href={ch.href}
                  target={ch.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noreferrer"
                  className={`ct-channel ct-channel-${ch.accent}`}
                >
                  <div className={`ct-ch-icon ct-ch-icon-${ch.accent}`}>{ch.icon}</div>
                  <div className="ct-ch-body">
                    <small>{ch.label}</small>
                    <strong>{ch.handle}</strong>
                    <span>{ch.desc}</span>
                  </div>
                  <div className={`ct-ch-cta ct-ch-cta-${ch.accent}`}>{ch.cta} →</div>
                </a>
              </Reveal>
            ))}

            {/* Trust badges */}
            <Reveal>
              <div className="ct-trust">
                <span>🛡️ NDA через Контур.Диадок</span>
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
              <Link to="/company-path" className="primary-button">📝 Отправить ТЗ сейчас</Link>
              <Link to="/how-it-works" className="ct-outline-btn">Как это работает →</Link>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

/*
 * ════════════════════════════════════════════════════
 * CSS — добавьте в конец src/styles/index.css
 * ════════════════════════════════════════════════════

.contacts-page { padding-top: 68px; }

// ── HERO ──────────────────────────────────────────
.ct-hero {
  display: grid;
  grid-template-columns: 1.2fr auto;
  gap: 48px;
  align-items: center;
  padding: 24px 0 40px;
  border-bottom: 1px solid rgba(124,58,237,.14);
  margin-bottom: 28px;
}
.ct-hero-title {
  font-size: clamp(2.2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -.04em;
  margin: 14px 0 14px;
  color: var(--wr);
}
.ct-hero-title em { color: var(--kl); font-style: normal; }
.ct-hero-sub { font-size: 1.05rem; color: var(--li); max-width: 540px; margin: 0 0 22px; line-height: 1.6; }
.ct-hero-ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ct-outline-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: .95rem;
  color: var(--pl); border: 1.5px solid rgba(124,58,237,.45);
  background: transparent; text-decoration: none;
  transition: all .2s;
}
.ct-outline-btn:hover { background: rgba(124,58,237,.12); border-color: var(--pl); }

.ct-orbital { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.ct-orbital-label { text-align: center; line-height: 1.3; }
.ct-orbital-label strong { display: block; font-size: .85rem; color: var(--pl); font-weight: 700; }
.ct-orbital-label span { font-size: .72rem; color: #475569; font-family: monospace; }

// ── STATS STRIP ──────────────────────────────────
.ct-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 36px;
}
.ct-stat {
  padding: 16px 18px;
  border-radius: 10px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(124,58,237,.2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ct-stat strong { font-size: 2rem; font-weight: 800; line-height: 1; }
.ct-stat span { font-size: .82rem; color: var(--li); }
.ct-stat-purple strong { color: var(--pm); }
.ct-stat-cyan strong { color: var(--cm); }
.ct-stat-pink strong { color: var(--km); }
.ct-stat-green strong { color: var(--gm); }

// ── MAIN 3-COL ───────────────────────────────────
.ct-main {
  display: grid;
  grid-template-columns: 1fr 1.1fr 1fr;
  gap: 24px;
  align-items: start;  // ← KEY FIX: start, not center
  margin-bottom: 36px;
}

// ── LEFT COL ─────────────────────────────────────
.ct-value-card { margin-bottom: 12px; }
.ct-value-card h3 { margin: 0 0 10px; font-size: 1.02rem; }
.ct-card-cta {
  display: inline-flex; margin-top: 12px;
  padding: 8px 16px; border-radius: 7px; font-size: .85rem; font-weight: 700;
  text-decoration: none; transition: opacity .18s;
}
.ct-card-cta:hover { opacity: .82; }
.ct-cta-purple { background: rgba(124,58,237,.2); color: var(--pm); border: 1px solid rgba(124,58,237,.4); }
.ct-cta-cyan { background: rgba(8,145,178,.2); color: var(--cm); border: 1px solid rgba(8,145,178,.4); }

.ct-subscribe-block {
  padding: 18px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(124,58,237,.2);
  border-radius: 10px;
  margin-top: 0;
}
.ct-subscribe-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.ct-subscribe-header span { font-size: 1.6rem; flex-shrink: 0; }
.ct-subscribe-header h3 { margin: 0 0 3px; font-size: .98rem; }
.ct-subscribe-header p { margin: 0; font-size: .85rem; color: var(--li); }
.subscribe-form { display: flex; flex-direction: column; gap: 6px; }
.subscribe-row { display: flex; gap: 8px; }
.subscribe-row input {
  flex: 1; padding: 10px 12px;
  background: rgba(6,8,15,.72); border: 1px solid rgba(124,58,237,.28);
  color: var(--wr); border-radius: 8px; outline: none; font-size: .9rem;
}
.subscribe-row input:focus { border-color: var(--cl); box-shadow: 0 0 0 3px rgba(8,145,178,.14); }
.subscribe-row .primary-button { white-space: nowrap; padding: 10px 16px; font-size: .85rem; }

// ── MID COL (CHANNELS) ───────────────────────────
.ct-col-heading { font-size: 1.25rem; font-weight: 800; color: var(--wr); margin: 0 0 4px; }
.ct-col-sub { font-size: .9rem; color: var(--li); margin: 0 0 18px; }

.ct-channel {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(124,58,237,.18);
  border-radius: 10px;
  margin-bottom: 8px;
  text-decoration: none;
  transition: all .2s;
}
.ct-channel:hover { transform: translateX(4px); }
.ct-channel-purple:hover { border-color: rgba(124,58,237,.5); background: rgba(124,58,237,.08); }
.ct-channel-cyan:hover   { border-color: rgba(8,145,178,.5);  background: rgba(8,145,178,.08); }
.ct-channel-pink:hover   { border-color: rgba(219,39,119,.5); background: rgba(219,39,119,.06); }

.ct-ch-icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex-shrink: 0;
}
.ct-ch-icon-purple { background: rgba(124,58,237,.15); }
.ct-ch-icon-cyan   { background: rgba(8,145,178,.15); }
.ct-ch-icon-pink   { background: rgba(219,39,119,.12); }

.ct-ch-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ct-ch-body small { font-size: .68rem; color: #64748b; text-transform: uppercase; letter-spacing: .07em; }
.ct-ch-body strong { font-size: .97rem; color: var(--wr); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ct-ch-body span { font-size: .8rem; color: var(--li); }

.ct-ch-cta { font-size: .8rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.ct-ch-cta-purple { color: var(--pl); }
.ct-ch-cta-cyan   { color: var(--cl); }
.ct-ch-cta-pink   { color: var(--kl); }

.ct-trust {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-top: 14px; padding: 12px 14px;
  background: rgba(5,150,105,.06); border: 1px solid rgba(5,150,105,.2); border-radius: 8px;
}
.ct-trust span { font-size: .82rem; color: var(--gm); font-weight: 600; }

// ── RIGHT COL (FORM) ─────────────────────────────
.ct-form-card .ct-form-header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
}
.ct-form-icon {
  width: 46px; height: 46px; border-radius: 10px;
  background: rgba(124,58,237,.16); display: flex;
  align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;
}
.ct-form-header h2 { margin: 0 0 3px; font-size: 1.12rem; }
.ct-form-header p { margin: 0; font-size: .85rem; color: var(--li); }

.ct-form { display: grid; gap: 12px; }
.ct-form label { display: grid; gap: 5px; color: var(--wh); font-weight: 700; font-size: .9rem; }
.req { color: var(--kl); }
.ct-form input,
.ct-form textarea,
.ct-form select {
  width: 100%; padding: 10px 12px;
  background: rgba(6,8,15,.72); border: 1px solid rgba(124,58,237,.28);
  color: var(--wr); border-radius: 8px; outline: none; font-size: .95rem;
}
.ct-form select option { background: #0d1226; color: var(--wr); }
.ct-form input:focus,
.ct-form textarea:focus,
.ct-form select:focus { border-color: var(--cl); box-shadow: 0 0 0 3px rgba(8,145,178,.14); }
.ct-form textarea { resize: vertical; }

.ct-quick-links {
  margin-top: 12px; padding: 16px 18px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(124,58,237,.16); border-radius: 10px;
}
.ct-quick-links h3 { margin: 0 0 12px; font-size: .95rem; font-weight: 700; }
.ct-quick-nav { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
.ct-quick-nav a {
  font-size: .85rem; color: var(--li); text-decoration: none; padding: 5px 0;
  transition: color .18s; font-weight: 600;
}
.ct-quick-nav a:hover { color: var(--pl); }

// ── FINAL BAND ───────────────────────────────────
.ct-final {
  display: flex; align-items: center; justify-content: space-between;
  gap: 28px; flex-wrap: wrap;
  padding: 32px 40px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(124,58,237,.14), rgba(8,145,178,.1));
  border: 1px solid rgba(124,58,237,.25);
}
.ct-final-text h2 { margin: 0 0 6px; font-size: clamp(1.5rem, 3vw, 2.2rem); }
.ct-final-text h2 em { color: var(--kl); font-style: normal; }
.ct-final-text p { margin: 0; color: var(--li); font-size: .95rem; }
.ct-final-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; flex-shrink: 0; }

// ── RESPONSIVE ───────────────────────────────────
@media (max-width: 1000px) {
  .ct-main { grid-template-columns: 1fr 1fr; }
  .ct-col-right { grid-column: span 2; }
  .ct-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ct-hero { grid-template-columns: 1fr; }
  .ct-orbital { display: none; }
}
@media (max-width: 680px) {
  .ct-main { grid-template-columns: 1fr; }
  .ct-col-right { grid-column: auto; }
  .ct-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ct-channel { grid-template-columns: 40px 1fr; }
  .ct-ch-cta { display: none; }
  .ct-final { flex-direction: column; align-items: flex-start; padding: 24px; }
  .ct-hero-ctas { flex-direction: column; align-items: flex-start; }
  .subscribe-row { flex-direction: column; }
  .ct-quick-nav { grid-template-columns: 1fr; }
}

 * ════════════════════════════════════════════════════
*/
