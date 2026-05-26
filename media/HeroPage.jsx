/**
 * src/pages/HeroPage.jsx  —  Ecosystem redesign
 *
 * HOW TO INTEGRATE:
 *   1. Copy this file to src/pages/HeroPage.jsx  (replace existing)
 *   2. Copy EcosystemMap to src/components/EcosystemMap.jsx
 *   3. Add CSS block at the bottom to src/styles/index.css
 *   4. Update content.js hero entry (new fields shown at very bottom)
 *   5. No new npm deps — uses existing framer-motion + react-router-dom
 */

import { useEffect, useRef, useState } from 'react';
import { TrackedLink } from '../components/Tracked';
import { Logo }        from '../components/Logo';
import { Badge, PageShell, Reveal } from '../components/UI';

// ─── Live ecosystem counter (fake-live, randomised seed) ──────────────────────
// Replace with a real /api/live-stats fetch once you have the data.
const LIVE_PROJECTS = [
  { type: '🛠️', label: 'AI-команда собирается', stack: 'Python · LLM · FastAPI' },
  { type: '🚀', label: 'MVP в разработке',       stack: 'Go · React · PostgreSQL' },
  { type: '🔬', label: 'Research-проект',         stack: 'Rust · DataSphere · ML' },
  { type: '⚙️', label: 'DevOps-пайплайн',        stack: 'K8s · GitVerse · CI/CD' },
  { type: '💡', label: 'Fintech-прототип',        stack: 'TypeScript · Node · Redis' },
];

function LiveStrip() {
  const [idx, setIdx]    = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % LIVE_PROJECTS.length); setVisible(true); }, 300);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const p = LIVE_PROJECTS[idx];
  return (
    <div className="live-strip" aria-live="polite" aria-atomic="true">
      <span className="live-dot" aria-hidden="true" />
      <span className="live-label">Hermes сейчас:</span>
      <span className="live-item" style={{ opacity: visible ? 1 : 0, transition: 'opacity .28s' }}>
        <strong>{p.type} {p.label}</strong>
        <span className="live-stack">{p.stack}</span>
      </span>
    </div>
  );
}

// ─── Ecosystem Map (replaces OrbitalDiagram) ─────────────────────────────────
const NODES = [
  { id: 'students',   label: 'Студенты',   icon: '🎓', angle: 270, r: 92,  accent: '#a78bfa' },
  { id: 'startups',  label: 'Стартапы',   icon: '🚀', angle: 330, r: 92,  accent: '#22d3ee' },
  { id: 'companies', label: 'Компании',   icon: '🏢', angle: 30,  r: 92,  accent: '#22d3ee' },
  { id: 'mentors',   label: 'Менторы',    icon: '🧑‍🏫', angle: 90,  r: 92,  accent: '#6ee7b7' },
  { id: 'research',  label: 'Research',   icon: '🔬', angle: 150, r: 92,  accent: '#f9a8d4' },
  { id: 'opensource',label: 'Open Source',icon: '⚡', angle: 210, r: 92,  accent: '#fcd34d' },
  // outer ring
  { id: 'ai',        label: 'AI Agents',  icon: '🤖', angle: 300, r: 132, accent: '#c4b5fd' },
  { id: 'sber',      label: 'ШЦТ Сбера', icon: '🏦', angle: 60,  r: 132, accent: '#4ade80' },
  { id: 'ecosystem', label: 'Экосистема', icon: '🌐', angle: 180, r: 132, accent: '#67e8f9' },
];

function EcosystemMap() {
  const cx = 160, cy = 160;

  return (
    <div className="eco-map" aria-label="Карта экосистемы Точки Сборки">
      <svg viewBox="0 0 320 320" role="img">
        <defs>
          <radialGradient id="ecoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(124,58,237,.35)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)"   />
          </radialGradient>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx={cx} cy={cy} r="148" fill="url(#ecoGlow)" />

        {/* Orbital rings */}
        <circle cx={cx} cy={cy} r="132" fill="none" stroke="rgba(124,58,237,.1)"  strokeWidth="1" />
        <circle cx={cx} cy={cy} r="92"  fill="none" stroke="rgba(124,58,237,.15)" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx={cx} cy={cy} r="52"  fill="none" stroke="rgba(8,145,178,.18)"  strokeWidth="1" />

        {/* Spoke lines from center to each node */}
        {NODES.map(n => {
          const rad = (n.angle * Math.PI) / 180;
          return (
            <line
              key={n.id}
              x1={cx + Math.cos(rad) * 30}
              y1={cy + Math.sin(rad) * 30}
              x2={cx + Math.cos(rad) * (n.r - 14)}
              y2={cy + Math.sin(rad) * (n.r - 14)}
              stroke={n.accent}
              strokeWidth="1"
              strokeOpacity=".4"
              strokeDasharray="3 5"
            />
          );
        })}

        {/* Node circles + icons */}
        {NODES.map(n => {
          const rad = (n.angle * Math.PI) / 180;
          const x   = cx + Math.cos(rad) * n.r;
          const y   = cy + Math.sin(rad) * n.r;
          return (
            <g key={n.id} filter="url(#nodeGlow)">
              <circle cx={x} cy={y} r="16" fill={`${n.accent}22`} stroke={n.accent} strokeWidth="1.2" />
              <text x={x} y={y + 5} textAnchor="middle" fontSize="13" role="img" aria-label={n.label}>{n.icon}</text>
            </g>
          );
        })}

        {/* Centre: HERMES */}
        <circle cx={cx} cy={cy} r="28" fill="rgba(124,58,237,.22)" stroke="#7c3aed" strokeWidth="1.8" />
        <circle cx={cx} cy={cy} r="18" fill="#7c3aed" />
        <circle cx={cx} cy={cy} r="9"  fill="white" fillOpacity=".95" />
        <text x={cx} y={cy + 42} textAnchor="middle" fontSize="8" fill="#a78bfa"
              fontFamily="'DejaVu Sans Mono','Liberation Mono',monospace" letterSpacing="2">
          HERMES AI
        </text>
      </svg>

      {/* Node labels ring (positioned via CSS grid trick) */}
      <div className="eco-labels" aria-hidden="true">
        {NODES.filter(n => n.r === 92).map(n => (
          <span key={n.id} className="eco-label">{n.label}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Mini flow: Задача → Hermes → Команда → Продукт ─────────────────────────
function MiniFlow() {
  const steps = [
    { icon: '📝', label: 'Задача' },
    { icon: '🧠', label: 'Hermes AI' },
    { icon: '👥', label: 'Команда' },
    { icon: '🚀', label: 'Продукт' },
  ];
  return (
    <div className="mini-flow">
      {steps.map((s, i) => (
        <span key={s.label} className="mini-flow-step">
          <span className="mini-flow-icon">{s.icon}</span>
          <span className="mini-flow-label">{s.label}</span>
          {i < steps.length - 1 && <span className="mini-flow-arrow" aria-hidden="true">→</span>}
        </span>
      ))}
    </div>
  );
}

// ─── Ecosystem metrics (macro-level) ─────────────────────────────────────────
const METRICS = [
  { value: '350k+', label: 'IT-специалистов выпускает Россия ежегодно', accent: 'cyan' },
  { value: '7 дней', label: 'Hermes собирает engineering-команду', accent: 'purple' },
  { value: 'AI-Orchestrated', label: 'team assembly — 80% рутины автоматизировано', accent: 'pink' },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function HeroPage() {
  return (
    <PageShell page={{ theme: 'purple' }} className="hero-page eco-hero-page">

      {/* Live ecosystem strip — full width above the fold */}
      <LiveStrip />

      <div className="eco-hero-grid">

        {/* ── LEFT: copy ── */}
        <Reveal className="eco-hero-copy">
          <Logo />

          <div className="eco-badge-row">
            <Badge accent="purple">⚡ AI-native Engineering Ecosystem</Badge>
            <Badge accent="cyan">Powered by Hermes AI</Badge>
          </div>

          <h1 className="eco-hero-title">
            Новая Инженерная<br />
            <span>Инфраструктура</span><br />
            <em>России</em>
          </h1>

          <div className="eco-hero-line" />

          <p className="eco-hero-sub">
            <strong>Точка Сборки</strong> — AI-native экосистема, которая соединяет
            студентов, стартапы и компании в единый механизм создания продуктов.
            <br /><br />
            <strong>Hermes AI</strong> собирает engineering-команды за 7 дней.
            Фикс-прайс. Без онбординга. Без equity.
          </p>

          {/* Macro metrics */}
          <div className="eco-metrics">
            {METRICS.map(m => (
              <div key={m.value} className={`eco-metric eco-metric-${m.accent}`}>
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>

          {/* Mini how-it-works flow */}
          <MiniFlow />

          {/* 3-door CTA */}
          <div className="eco-cta-row">
            <TrackedLink to="/company-path" goal="HERO_CTA_COMPANY" className="primary-button eco-cta-primary">
              🛰 Запустить проект
            </TrackedLink>
            <TrackedLink to="/student-path" goal="HERO_CTA_STUDENT" className="outline-button">
              🎓 Войти в экосистему
            </TrackedLink>
            <TrackedLink to="/how-it-works" goal="HERO_CTA_EXPLORE" className="ghost-button">
              📡 Как это работает
            </TrackedLink>
          </div>

          {/* Ecosystem tags */}
          <div className="eco-tags">
            {['AI', 'Engineering', 'Startups', 'Students', 'Infrastructure', 'Research', 'Open Ecosystem'].map(tag => (
              <span key={tag} className="eco-tag">{tag}</span>
            ))}
          </div>
        </Reveal>

        {/* ── RIGHT: ecosystem map ── */}
        <Reveal className="eco-hero-right">
          <EcosystemMap />
          <div className="eco-node-labels">
            {NODES.map(n => (
              <span key={n.id} className="eco-node-pill" style={{ '--node-color': n.accent }}>
                {n.icon} {n.label}
              </span>
            ))}
          </div>
        </Reveal>

      </div>

      {/* ── BOTTOM: human story strip ── */}
      <Reveal>
        <div className="eco-story-strip">
          <div className="eco-story-item">
            <span className="eco-story-age">19 лет</span>
            <span className="eco-story-text">→ первый коммерческий проект → оффер от Росатома</span>
          </div>
          <div className="eco-story-divider" aria-hidden="true" />
          <div className="eco-story-item">
            <span className="eco-story-age">Стартап за 3 нед.</span>
            <span className="eco-story-text">→ MVP → демо-день Сколково → seed-раунд</span>
          </div>
          <div className="eco-story-divider" aria-hidden="true" />
          <div className="eco-story-item">
            <span className="eco-story-age">Команда 4 инженера</span>
            <span className="eco-story-text">→ Python + ML → 140k ₽ за 3 недели</span>
          </div>
        </div>
      </Reveal>

    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADD TO: src/styles/index.css
═══════════════════════════════════════════════════════════════ */
/*

.eco-hero-page { padding-top: 0; }

// ── Live strip ──────────────────────────────────────────────
.live-strip {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 10px 40px;
  background: rgba(124,58,237,.07);
  border-bottom: 1px solid rgba(124,58,237,.16);
  font-size: .84rem;
}
.live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
.live-label { color: var(--li); font-weight: 700; white-space: nowrap; }
.live-item { display: flex; align-items: center; gap: 10px; }
.live-item strong { color: var(--wr); font-weight: 700; }
.live-stack {
  font-family: 'DejaVu Sans Mono','Liberation Mono',monospace;
  font-size: .76rem; color: #64748b;
  background: rgba(255,255,255,.04);
  padding: 2px 8px; border-radius: 5px;
}

// ── Hero grid ───────────────────────────────────────────────
.eco-hero-grid {
  display: grid;
  grid-template-columns: 1.15fr .85fr;
  gap: 48px;
  align-items: center;
  min-height: calc(100vh - 108px);
  padding: 40px 0;
}

// ── Copy ────────────────────────────────────────────────────
.eco-badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 14px; }

.eco-hero-title {
  font-size: clamp(2.8rem,5.5vw,4.8rem);
  font-weight: 800; line-height: 1.03; letter-spacing: -.05em;
  margin: 0 0 18px; color: var(--wr);
}
.eco-hero-title span { color: var(--pl); }
.eco-hero-title em   { color: var(--kl); font-style: normal; }

.eco-hero-line {
  width: 240px; height: 2px; border-radius: 2px;
  background: linear-gradient(90deg,var(--p),var(--c),transparent);
  margin: 0 0 20px;
}

.eco-hero-sub {
  font-size: 1.06rem; color: var(--li); max-width: 560px;
  line-height: 1.65; margin: 0 0 26px;
}

// ── Ecosystem metrics ───────────────────────────────────────
.eco-metrics {
  display: grid; grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 10px; margin: 0 0 24px;
}
.eco-metric {
  padding: 12px 14px; border-radius: 10px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(124,58,237,.22);
  display: flex; flex-direction: column; gap: 4px;
}
.eco-metric strong { font-size: 1.25rem; font-weight: 800; line-height: 1; }
.eco-metric span   { font-size: .79rem; color: var(--li); line-height: 1.35; }
.eco-metric-cyan   strong { color: var(--cm); }
.eco-metric-purple strong { color: var(--pm); }
.eco-metric-pink   strong { color: var(--km); }

// ── Mini flow ────────────────────────────────────────────────
.mini-flow {
  display: flex; align-items: center; gap: 0;
  flex-wrap: wrap;
  padding: 10px 16px;
  background: rgba(124,58,237,.07);
  border: 1px solid rgba(124,58,237,.2);
  border-radius: 10px;
  margin: 0 0 24px;
  font-size: .85rem;
}
.mini-flow-step { display: flex; align-items: center; gap: 5px; }
.mini-flow-icon  { font-size: 1.1rem; }
.mini-flow-label { font-weight: 700; color: var(--wr); }
.mini-flow-arrow { color: var(--p); font-size: 1rem; margin: 0 8px; opacity: .5; }

// ── 3-door CTA ───────────────────────────────────────────────
.eco-cta-row {
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap; margin: 0 0 20px;
}
.eco-cta-primary { font-size: 1rem; padding: 14px 26px; }

.ghost-button {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 12px 20px; border-radius: 8px;
  font-weight: 700; font-size: .9rem;
  color: var(--li); background: transparent;
  border: 1px solid rgba(255,255,255,.1);
  text-decoration: none; transition: all .18s;
}
.ghost-button:hover { color: var(--wr); border-color: rgba(255,255,255,.25); background: rgba(255,255,255,.05); }

// ── Ecosystem tags ───────────────────────────────────────────
.eco-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.eco-tag {
  font-size: .75rem; font-weight: 700;
  padding: 4px 10px; border-radius: 20px;
  color: #64748b; background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  letter-spacing: .03em;
}

// ── Right: ecosystem map ─────────────────────────────────────
.eco-hero-right {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding-left: 20px; border-left: 1px solid rgba(124,58,237,.1);
}
.eco-map { display: flex; flex-direction: column; align-items: center; }
.eco-map svg {
  width: min(300px,80vw); overflow: visible;
  filter: drop-shadow(0 0 32px rgba(124,58,237,.3));
}
.eco-node-labels {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 5px;
  max-width: 280px;
}
.eco-node-pill {
  font-size: .72rem; font-weight: 700; padding: 3px 9px; border-radius: 18px;
  color: var(--node-color, var(--pl));
  background: color-mix(in srgb, var(--node-color, var(--p)) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--node-color, var(--p)) 40%, transparent);
}

// ── Story strip ──────────────────────────────────────────────
.eco-story-strip {
  display: flex; align-items: center; gap: 0; flex-wrap: wrap;
  padding: 16px 0 4px;
  border-top: 1px solid rgba(124,58,237,.14);
  margin-top: 24px;
}
.eco-story-item  { display: flex; align-items: center; gap: 10px; padding: 8px 20px; }
.eco-story-age   { font-size: .88rem; font-weight: 800; color: var(--pl); white-space: nowrap; }
.eco-story-text  { font-size: .88rem; color: var(--li); }
.eco-story-divider {
  width: 1px; height: 28px;
  background: rgba(124,58,237,.25);
  flex-shrink: 0;
}

// ── Responsive ───────────────────────────────────────────────
@media (max-width: 960px) {
  .eco-hero-grid { grid-template-columns: 1fr; min-height: auto; padding: 32px 0; }
  .eco-hero-right { border-left: none; border-top: 1px solid rgba(124,58,237,.1); padding: 24px 0 0; }
  .eco-metrics { grid-template-columns: 1fr 1fr; }
  .eco-hero-title { font-size: clamp(2.4rem,8vw,3.6rem); }
  .eco-story-strip { justify-content: flex-start; }
  .eco-story-divider { display: none; }
}
@media (max-width: 560px) {
  .live-strip { padding: 10px 16px; }
  .eco-metrics { grid-template-columns: 1fr; }
  .eco-cta-row { flex-direction: column; align-items: flex-start; }
  .eco-node-labels { display: none; }
}

*/

/* ═══════════════════════════════════════════════════════════════
   UPDATE content.js hero entry — replace existing hero: { ... }
   with this (add the new forWhom field):
═══════════════════════════════════════════════════════════════ */
/*
  hero: {
    theme: 'purple',
    tag:   '⚡ AI-native Engineering Ecosystem · Powered by Hermes AI',
    title: ['Новая Инженерная', 'Инфраструктура', 'России'],
    subtitle:
      'Точка Сборки — AI-native экосистема, соединяющая студентов, стартапы и компании в единый механизм создания продуктов. Hermes AI собирает engineering-команды за 7 дней.',
    metrics: [
      { value: '350k+',          label: 'IT-специалистов выпускает РФ ежегодно', accent: 'cyan'   },
      { value: '7 дней',         label: 'Hermes собирает engineering-команду',    accent: 'purple' },
      { value: 'AI-Orchestrated',label: 'team assembly — 80% рутины автоматизировано', accent: 'pink' },
    ],
    audience: [
      '🛰 Запустить проект — компаниям',
      '🎓 Войти в экосистему — студентам',
      '📡 Исследовать систему',
    ],
    forWhom: ['Студенты', 'Стартапы', 'Компании', 'Менторы', 'Research', 'Open Source'],
  },
*/
