/**
 * src/pages/SolutionPage.jsx — Full redesign
 *
 * Narrative: Точка Сборки = AI-native operating system
 * for engineering production at national scale.
 * Hermes AI is the central character.
 *
 * INSTALL: Replace src/pages/SolutionPage.jsx
 * CSS: Append <style block at bottom> to src/styles/index.css
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/UI';

/* ════════════════════════════════════════════════════
   SECTION A — ECOSYSTEM MAP (animated orbital)
════════════════════════════════════════════════════ */
const ECO_NODES = [
  { id: 'students',    label: 'IT-таланты',  icon: '🎓', angle: 270, r: 100, color: '#a78bfa' },
  { id: 'companies',  label: 'Компании',    icon: '🏢', angle: 342, r: 100, color: '#22d3ee' },
  { id: 'startups',   label: 'Стартапы',   icon: '🚀', angle: 54,  r: 100, color: '#22d3ee' },
  { id: 'mentors',    label: 'Менторы',    icon: '🧑‍🏫', angle: 126, r: 100, color: '#6ee7b7' },
  { id: 'research',   label: 'Research',   icon: '🔬', angle: 198, r: 100, color: '#f9a8d4' },
  { id: 'accel',      label: 'Акселераторы',icon: '⚡', angle: 305, r: 148, color: '#fcd34d' },
  { id: 'opensource', label: 'Open Source', icon: '🌐', angle: 17,  r: 148, color: '#67e8f9' },
  { id: 'investors',  label: 'Инвесторы',  icon: '💡', angle: 89,  r: 148, color: '#4ade80' },
  { id: 'gov',        label: 'Госпрограммы',icon: '🏛️',angle: 161, r: 148, color: '#fb923c' },
  { id: 'bootcamps',  label: 'Буткемпы',   icon: '📚', angle: 233, r: 148, color: '#c4b5fd' },
];

function nxy(n, cx = 190, cy = 190) {
  const r = (n.angle * Math.PI) / 180;
  return { x: cx + Math.cos(r) * n.r, y: cy + Math.sin(r) * n.r };
}

function EcosystemMap({ activeId, onNodeHover }) {
  const cx = 190, cy = 190;
  const [packets, setPackets]   = useState([]);
  const [tick,    setTick]      = useState(0);
  const pidRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const n = ECO_NODES[Math.floor(Math.random() * ECO_NODES.length)];
      const rev = Math.random() > 0.45;
      setPackets(prev => [
        ...prev.slice(-12),
        { id: ++pidRef.current, nid: n.id, rev, t: 0, color: n.color },
      ]);
    }, 600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setPackets(prev => prev.map(p => ({ ...p, t: p.t + 0.032 })).filter(p => p.t <= 1));
  }, [tick]);

  return (
    <div className="sl-eco-map" aria-label="Ecosystem map — Hermes AI at center">
      <svg viewBox="0 0 380 380" className="sl-eco-svg" role="img">
        <defs>
          <radialGradient id="slBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(124,58,237,.3)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)"  />
          </radialGradient>
          <filter id="slNodeGlow">
            <feGaussianBlur stdDeviation="3.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="slCoreGlow">
            <feGaussianBlur stdDeviation="10" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r="188" fill="url(#slBg)" />
        <circle cx={cx} cy={cy} r="148" fill="none" stroke="rgba(124,58,237,.08)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="100" fill="none" stroke="rgba(124,58,237,.12)" strokeWidth="1"
                strokeDasharray="4 9"
                style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'slSpin 50s linear infinite' }} />
        <circle cx={cx} cy={cy} r="55"  fill="none" stroke="rgba(8,145,178,.15)"  strokeWidth="1" />

        {/* Spokes */}
        {ECO_NODES.map(n => {
          const { x, y } = nxy(n, cx, cy);
          const rad = (n.angle * Math.PI) / 180;
          const sx = cx + Math.cos(rad) * 36;
          const sy = cy + Math.sin(rad) * 36;
          const active = activeId === n.id;
          return (
            <line key={`sp-${n.id}`} x1={sx} y1={sy} x2={x} y2={y}
              stroke={n.color}
              strokeWidth={active ? 1.8 : 0.7}
              strokeOpacity={active ? 0.95 : 0.28}
              strokeDasharray={active ? 'none' : '3 7'}
              style={{ transition: 'all .3s' }} />
          );
        })}

        {/* Packets */}
        {packets.map(pkt => {
          const n = ECO_NODES.find(x => x.id === pkt.nid);
          if (!n) return null;
          const { x: tx, y: ty } = nxy(n, cx, cy);
          const rad = (n.angle * Math.PI) / 180;
          const sx = cx + Math.cos(rad) * 36;
          const sy = cy + Math.sin(rad) * 36;
          const t = pkt.rev ? 1 - pkt.t : pkt.t;
          return (
            <circle key={pkt.id}
              cx={sx + (tx - sx) * t} cy={sy + (ty - sy) * t}
              r="3.5" fill={pkt.color}
              opacity={0.9 - Math.abs(pkt.t - 0.5) * 0.8} />
          );
        })}

        {/* Nodes */}
        {ECO_NODES.map(n => {
          const { x, y } = nxy(n, cx, cy);
          const active = activeId === n.id;
          return (
            <g key={n.id}
               filter={active ? 'url(#slNodeGlow)' : undefined}
               style={{ cursor: 'pointer' }}
               onMouseEnter={() => onNodeHover(n.id)}
               onMouseLeave={() => onNodeHover(null)}>
              <circle cx={x} cy={y} r={active ? 20 : 16}
                fill={`${n.color}1e`} stroke={n.color}
                strokeWidth={active ? 2 : 1.2}
                style={{ transition: 'all .3s' }} />
              {active && (
                <circle cx={x} cy={y} r="27" fill="none" stroke={n.color}
                  strokeWidth="1" opacity=".35"
                  style={{ animation: 'slRipple 1.2s ease-out' }} />
              )}
              <text x={x} y={y + 5} textAnchor="middle" fontSize="12">{n.icon}</text>
              {active && (
                <text x={x} y={n.angle > 0 && n.angle < 180 ? y + 34 : y - 24}
                  textAnchor="middle" fontSize="9" fill={n.color} fontWeight="700">
                  {n.label}
                </text>
              )}
            </g>
          );
        })}

        {/* HERMES core */}
        {[52, 36].map((r, i) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill="none"
            stroke="#7c3aed" strokeWidth="1"
            strokeOpacity={[0.18, 0.35][i]}
            style={{ transformOrigin: `${cx}px ${cy}px`, animation: `slCoreRing ${3 + i}s ease-in-out infinite` }} />
        ))}
        <circle cx={cx} cy={cy} r="26" fill="#7c3aed" filter="url(#slCoreGlow)" />
        <circle cx={cx} cy={cy} r="14" fill="white" fillOpacity=".95" />
        <text x={cx} y={cy + 50} textAnchor="middle" fontSize="9" fill="#a78bfa"
              fontFamily="monospace" letterSpacing="1.5">HERMES AI</text>
      </svg>

      {/* Node legend pills */}
      <div className="sl-eco-pills">
        {ECO_NODES.map(n => (
          <button key={n.id}
            className={`sl-eco-pill${activeId === n.id ? ' active' : ''}`}
            style={{ '--nc': n.color }}
            onMouseEnter={() => onNodeHover(n.id)}
            onMouseLeave={() => onNodeHover(null)}
            type="button" aria-label={n.label}
          >
            {n.icon} {n.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION B — 6-STEP PIPELINE
════════════════════════════════════════════════════ */
const PIPELINE_STEPS = [
  { n: '01', label: 'Задача поступает',    desc: 'Компания описывает проект — стек, бюджет, дедлайн. AI-агент Intake анализирует требования за минуты.', color: '#22d3ee', icon: '📋' },
  { n: '02', label: 'Hermes анализирует', desc: 'YandexGPT + DataSphere ML разбирают стек, оценивают сложность, строят capability graph проекта.', color: '#a78bfa', icon: '🧠' },
  { n: '03', label: 'Команда собирается', desc: 'Из общероссийского пула инженеров — студентов, джунов, менторов — формируется оптимальный состав за 48 часов.', color: '#6ee7b7', icon: '👥' },
  { n: '04', label: 'Спринт стартует',   desc: 'Kick-off звонок, Kaiten-доска, GitVerse репозиторий. Ментор-техлид координирует. Заказчик — в live-трекинге.', color: '#f9a8d4', icon: '⚡' },
  { n: '05', label: 'Продукт готов',     desc: 'Финальное демо, code review, документация. Акт подписан через Диадок. Оплата — за 24 часа.', color: '#fcd34d', icon: '🚀' },
  { n: '06', label: 'Команда масштабируется', desc: 'Лучшие получают оффер. Экосистема растёт. Hermes обучается на каждом проекте — матчинг становится точнее.', color: '#4ade80', icon: '🌐' },
];

function PipelineSection() {
  const [active, setActive] = useState(null);
  return (
    <div className="sl-pipeline">
      {PIPELINE_STEPS.map((step, i) => (
        <div
          key={step.n}
          className={`sl-pipe-step${active === i ? ' active' : ''}`}
          style={{ '--sc': step.color }}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(null)}
        >
          {/* Connector line */}
          {i < PIPELINE_STEPS.length - 1 && (
            <div className="sl-pipe-connector" aria-hidden="true" />
          )}
          <div className="sl-pipe-num">{step.n}</div>
          <div className="sl-pipe-icon">{step.icon}</div>
          <div className="sl-pipe-label">{step.label}</div>
          <div className="sl-pipe-desc">{step.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION C — TERMINAL SIMULATION (fake Hermes logs)
════════════════════════════════════════════════════ */
const LOG_SEQUENCE = [
  { t: 0,    text: 'hermes v2.4.1 — starting orchestration engine',            type: 'sys'  },
  { t: 400,  text: '> Receiving project brief...',                              type: 'info' },
  { t: 900,  text: '> Stack detected: Python · FastAPI · PostgreSQL · LLM',    type: 'data' },
  { t: 1300, text: '> Complexity: HIGH | Timeline: 3w | Budget: 120k₽',        type: 'data' },
  { t: 1700, text: '> [INTAKE] Requirements parsed ✓',                         type: 'ok'   },
  { t: 2000, text: '> [MATCH] Scanning 247 engineers in pool...',               type: 'info' },
  { t: 2400, text: '  → Filtering by stack match (Jaccard ≥ 0.65): 41 found', type: 'detail'},
  { t: 2800, text: '  → Filtering by availability: 18 candidates',             type: 'detail'},
  { t: 3200, text: '  → Running team compatibility graph...',                  type: 'info' },
  { t: 3700, text: '> [TEAM] Optimal composition generated:',                  type: 'ok'   },
  { t: 4000, text: '  → Lead Engineer  (score: 94) ✓',                         type: 'member'},
  { t: 4200, text: '  → Backend Dev    (score: 88) ✓',                         type: 'member'},
  { t: 4400, text: '  → Frontend Dev   (score: 91) ✓',                         type: 'member'},
  { t: 4600, text: '  → ML Engineer    (score: 86) ✓',                         type: 'member'},
  { t: 4800, text: '  → Mentor-TL      (score: 97) ✓',                         type: 'member'},
  { t: 5100, text: '> [ROADMAP] Sprint topology generated: 3 sprints',         type: 'ok'   },
  { t: 5400, text: '> [SCORE] Confidence: 91% | Risk: LOW',                   type: 'score'},
  { t: 5800, text: '> Project TS-7FA2C1 — STATUS: READY TO LAUNCH 🚀',         type: 'launch'},
];

function TerminalSection() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  async function run() {
    if (running) return;
    setRunning(true); setDone(false); setLogs([]);
    for (const entry of LOG_SEQUENCE) {
      await new Promise(r => setTimeout(r, entry.t === 0 ? 0 : 300 + Math.random() * 150));
      setLogs(prev => [...prev, entry]);
    }
    setDone(true); setRunning(false);
  }

  // Auto-start on first mount
  useEffect(() => { const id = setTimeout(run, 800); return () => clearTimeout(id); }, []);

  return (
    <div className="sl-terminal">
      <div className="sl-term-titlebar">
        <span className="sl-term-dot" style={{ background: '#ff5f57' }} />
        <span className="sl-term-dot" style={{ background: '#ffbd2e' }} />
        <span className="sl-term-dot" style={{ background: '#28c840' }} />
        <span className="sl-term-title">hermes — orchestration engine</span>
        <button
          className="sl-term-rerun"
          onClick={run}
          disabled={running}
        >
          {running ? '⟳ running' : '▶ re-run'}
        </button>
      </div>
      <div className="sl-term-body" ref={logRef} aria-live="polite" aria-label="Hermes execution log">
        {logs.map((l, i) => (
          <div key={i} className={`sl-term-line sl-term-${l.type}`}>
            <span className="sl-term-prompt">$</span>
            <span>{l.text}</span>
            {i === logs.length - 1 && !done && <span className="sl-term-cursor" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SECTION D — WHAT PARTICIPANTS GAIN
════════════════════════════════════════════════════ */
const GAINS = [
  {
    title: 'IT-таланты',
    icon: '👨‍💻',
    color: '#a78bfa',
    items: [
      '→ Коммерческий опыт с первого дня',
      '→ Доход 40–90k ₽ за проект',
      '→ Production-ready портфолио',
      '→ Agile, Git-flow, CI/CD на практике',
      '→ Прямой путь к офферу',
    ],
  },
  {
    title: 'Компании и стартапы',
    icon: '🏢',
    color: '#22d3ee',
    items: [
      '→ Команда за 7 дней без онбординга',
      '→ Фикс-прайс — платите за результат',
      '→ Нулевые кадровые расходы',
      '→ Live-трекинг прогресса 24/7',
      '→ Лучших участников — в оффер',
    ],
  },
  {
    title: 'Экосистема',
    icon: '🌐',
    color: '#6ee7b7',
    items: [
      '→ Передача знаний между поколениями',
      '→ Рост инженерной плотности страны',
      '→ Ускорение стартап-цикла',
      '→ AI-слой, который учится на каждом проекте',
      '→ Национальная инженерная инфраструктура',
    ],
  },
];

/* ════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════ */
export function SolutionPage() {
  const [activeNode, setActiveNode] = useState(null);
  const handleHover = useCallback(id => setActiveNode(id), []);

  return (
    <div className="sl-page">

      {/* ── SECTION A: ECOSYSTEM MAP ── */}
      <section className="sl-section sl-section-dark">
        <div className="sl-glow sl-glow-a" aria-hidden="true" />
        <div className="sl-inner">
          <Reveal>
            <div className="sl-eyebrow">ЭКОСИСТЕМА</div>
            <h2 className="sl-section-title">
              Hermes AI оркестрирует<br />
              <span>живую инженерную сеть</span>
            </h2>
            <p className="sl-section-sub">
              Не платформа объявлений. Не биржа фриланса.<br />
              Операционная система для сборки инженерных команд —
              в масштабе всей страны.
            </p>
          </Reveal>
          <Reveal>
            <EcosystemMap activeId={activeNode} onNodeHover={handleHover} />
          </Reveal>
        </div>
      </section>

      {/* ── SECTION B: PIPELINE ── */}
      <section className="sl-section sl-section-purple">
        <div className="sl-glow sl-glow-b" aria-hidden="true" />
        <div className="sl-inner">
          <Reveal>
            <div className="sl-eyebrow">ОПЕРАЦИОННЫЙ ПОТОК</div>
            <h2 className="sl-section-title">
              От задачи — до рабочего продукта.<br />
              <span>6 шагов. 7 дней.</span>
            </h2>
            <p className="sl-section-sub">
              Каждый шаг автоматизирован Hermes.
              Ментор фокусируется на стратегии — рутина уходит AI-агентам.
            </p>
          </Reveal>
          <Reveal>
            <PipelineSection />
          </Reveal>
        </div>
      </section>

      {/* ── SECTION C: TERMINAL ── */}
      <section className="sl-section sl-section-dark">
        <div className="sl-inner">
          <Reveal>
            <div className="sl-eyebrow">INSIDE HERMES</div>
            <h2 className="sl-section-title">
              Смотрите как AI собирает команду<br />
              <span>в реальном времени</span>
            </h2>
            <p className="sl-section-sub">
              Hermes не подбирает резюме. Он строит capability graph,
              рассчитывает совместимость и генерирует план спринта — автоматически.
            </p>
          </Reveal>
          <Reveal>
            <TerminalSection />
          </Reveal>

          {/* Agent grid */}
          <Reveal>
            <div className="sl-agents">
              {[
                { icon: '📥', name: 'Intake',   model: 'YandexGPT 4',  task: 'Парсинг ТЗ'             },
                { icon: '🔗', name: 'Matching', model: 'DataSphere ML', task: 'Скоринг инженеров'     },
                { icon: '📊', name: 'Monitor',  model: 'Kaiten API',    task: 'Трекинг спринтов'      },
                { icon: '🔍', name: 'Quality',  model: 'GigaChat Pro',  task: 'Code review / тесты'   },
                { icon: '📣', name: 'Comms',    model: 'VK Teams API',  task: 'Уведомления 24/7'      },
              ].map(a => (
                <div key={a.name} className="sl-agent">
                  <span className="sl-agent-icon">{a.icon}</span>
                  <span className="sl-agent-name">{a.name}</span>
                  <span className="sl-agent-model">{a.model}</span>
                  <span className="sl-agent-task">{a.task}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION D: GAINS ── */}
      <section className="sl-section sl-section-purple">
        <div className="sl-inner">
          <Reveal>
            <div className="sl-eyebrow">ЧТО ПОЛУЧАЮТ УЧАСТНИКИ</div>
            <h2 className="sl-section-title">
              Каждый узел экосистемы<br />
              <span>выигрывает по-своему</span>
            </h2>
          </Reveal>
          <Reveal>
            <div className="sl-gains-grid">
              {GAINS.map(g => (
                <div key={g.title} className="sl-gain-card" style={{ '--gc': g.color }}>
                  <div className="sl-gain-icon">{g.icon}</div>
                  <h3 className="sl-gain-title">{g.title}</h3>
                  <ul className="sl-gain-list">
                    {g.items.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION E: FINAL VISION ── */}
      <section className="sl-closing">
        <div className="sl-closing-glow" aria-hidden="true" />
        <div className="sl-inner sl-closing-inner">
          <Reveal>
            <div className="sl-eyebrow">МИССИЯ</div>
            <h2 className="sl-vision-title">
              Новая инженерная<br />
              <em>инфраструктура России.</em>
            </h2>
            <p className="sl-vision-desc">
              AI-native платформа, которая превращает разрозненный
              инженерный потенциал страны в скорость, продукты и экономический рост.
            </p>
            <div className="sl-vision-ctas">
              <Link to="/company-path" className="sl-btn-primary">
                🛰 Запустить проект
              </Link>
              <Link to="/student-path" className="sl-btn-outline">
                🎓 Войти в экосистему
              </Link>
              <Link to="/hermes" className="sl-btn-ghost">
                📡 Исследовать Hermes AI
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
