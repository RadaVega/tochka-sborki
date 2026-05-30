/**
 * src/pages/ProblemPage.jsx — Full redesign
 *
 * Narrative: Russia has engineering talent everywhere,
 * but no infrastructure to activate it.
 * Macro-level, cinematic, no School 21 references.
 *
 * INSTALL: Replace src/pages/ProblemPage.jsx
 * CSS: Append <style block at bottom> to src/styles/index.css
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/UI';

/* ── Animated counter ─────────────────────────────── */
function Counter({ target, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(ease * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val.toLocaleString('ru-RU')}{suffix}</span>;
}

/* ── Disconnected nodes diagram ───────────────────── */
function DisconnectedNodes() {
  const groups = [
    { label: 'Компании',  color: '#22d3ee', nodes: ['Стартапы', 'Enterprise', 'МСБ',   'Госсектор'] },
    { label: 'Таланты',   color: '#a78bfa', nodes: ['Студенты', 'Джуны',    'Буткемпы','Самоучки'  ] },
    { label: 'Знания',    color: '#6ee7b7', nodes: ['Универы',  'Research',  'OpenSource','Менторы' ] },
  ];
  return (
    <div className="pb-nodes-wrap" aria-label="Disconnected ecosystem diagram">
      {groups.map(g => (
        <div key={g.label} className="pb-node-group">
          <div className="pb-node-group-title" style={{ color: g.color }}>{g.label}</div>
          <div className="pb-node-cluster">
            {g.nodes.map((n, i) => (
              <div
                key={n}
                className="pb-node"
                style={{
                  borderColor: `${g.color}55`,
                  color: g.color,
                  animationDelay: `${i * 0.18}s`,
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Broken connection hint */}
      <div className="pb-broken-center" aria-hidden="true">
        <div className="pb-broken-ring" />
        <div className="pb-broken-label">нет<br/>связи</div>
      </div>
    </div>
  );
}

/* ── Timeline comparison ──────────────────────────── */
function TimelineComparison() {
  const old = ['HR-менеджер', 'Поиск 2–8 нед.', 'Интервью × 5', 'Оффер', 'Онбординг 3–6 мес.', '💸 Неопределённость'];
  const neo = ['Задача', 'Hermes AI', 'Команда за 48ч', 'Спринт', 'Продукт', '✓ Результат'];

  return (
    <div className="pb-timeline-compare">
      <div className="pb-tl-col pb-tl-old">
        <div className="pb-tl-label">Как сейчас</div>
        {old.map((s, i) => (
          <div key={i} className="pb-tl-step pb-tl-step-old" style={{ animationDelay: `${i * 0.1}s` }}>
            {s}
          </div>
        ))}
        <div className="pb-tl-result bad">~6 месяцев · риск · бюджет неизвестен</div>
      </div>

      <div className="pb-tl-vs" aria-hidden="true">VS</div>

      <div className="pb-tl-col pb-tl-new">
        <div className="pb-tl-label" style={{ color: '#a78bfa' }}>С Точкой Сборки</div>
        {neo.map((s, i) => (
          <div key={i} className="pb-tl-step pb-tl-step-new" style={{ animationDelay: `${i * 0.1}s` }}>
            {s}
          </div>
        ))}
        <div className="pb-tl-result good">7 дней старт · фикс-прайс · гарантия результата</div>
      </div>
    </div>
  );
}

/* ── Talent sources → no orchestration layer ─────── */
function TalentGapDiagram() {
  const sources = [
    { icon: '🎓', label: 'Университеты',  sub: '350k+ выпускников/год' },
    { icon: '⚡', label: 'Буткемпы',       sub: '50k+ ежегодно'         },
    { icon: '🔬', label: 'Исследователи', sub: 'НИИ, лаборатории'       },
    { icon: '🌐', label: 'Open Source',   sub: 'Тысячи контрибьюторов'  },
    { icon: '💡', label: 'Самоучки',      sub: 'Нет пути на рынок'      },
  ];
  return (
    <div className="pb-gap-diagram">
      {/* Talent sources */}
      <div className="pb-gap-sources">
        {sources.map(s => (
          <div key={s.label} className="pb-gap-source">
            <span className="pb-gap-icon">{s.icon}</span>
            <span className="pb-gap-slabel">{s.label}</span>
            <span className="pb-gap-ssub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Arrow down + gap */}
      <div className="pb-gap-middle" aria-label="Gap: no orchestration layer">
        <div className="pb-gap-arrows" aria-hidden="true">
          {sources.map((_, i) => (
            <div key={i} className="pb-gap-arrow" style={{ animationDelay: `${i * 0.15}s` }}>↓</div>
          ))}
        </div>
        <div className="pb-gap-block">
          <div className="pb-gap-block-text">? Нет слоя оркестрации</div>
          <div className="pb-gap-block-sub">Таланты не активированы</div>
        </div>
      </div>

      {/* Hermes reveal */}
      <div className="pb-gap-hermes">
        <div className="pb-gap-hermes-badge">
          <span className="pb-gap-hermes-dot" aria-hidden="true" />
          HERMES AI
        </div>
        <div className="pb-gap-hermes-sub">Orchestration Layer</div>
      </div>
    </div>
  );
}

/* ── Three systemic problems ──────────────────────── */
const PAINS = [
  {
    icon: '🏢',
    title: 'Компании и стартапы',
    color: '#22d3ee',
    lead: 'Медленно. Дорого. Непредсказуемо.',
    items: [
      { icon: '💸', text: 'Онбординг стоит 3–6 месяцев зарплаты' },
      { icon: '🔄', text: 'Найм занимает 2–8 недель — пока конкурент движется' },
      { icon: '📋', text: 'Внутренний беклог растёт — команда перегружена' },
      { icon: '🧊', text: 'Пилот-паралич: идея есть, ресурсов нет' },
    ],
    quote: '«Хотим MVP — но не можем собрать команду»',
  },
  {
    icon: '👨‍💻',
    title: 'IT-таланты России',
    color: '#a78bfa',
    lead: 'Потенциал есть. Применения нет.',
    items: [
      { icon: '🔒', text: 'Учебные проекты не дают реального опыта' },
      { icon: '🌑', text: 'Нет пути от обучения к production-разработке' },
      { icon: '🧩', text: 'Нет инженерной среды — работают поодиночке' },
      { icon: '📭', text: 'Портфолио пустое — оффер не приходит' },
    ],
    quote: '«Умею программировать. Но нет кейса — нет шанса»',
  },
  {
    icon: '🚀',
    title: 'Стартапы',
    color: '#6ee7b7',
    lead: 'Техническая узость тормозит рост.',
    items: [
      { icon: '⏱️', text: 'MVP задерживается на месяцы из-за нехватки команды' },
      { icon: '🔧', text: 'Технический фаундер — единственный инженер' },
      { icon: '💰', text: 'Нет доступного инженерного ресурса под задачу' },
      { icon: '📉', text: 'Инвесторы уходят — продукт не готов к дедлайну' },
    ],
    quote: '«Идея хорошая. Но нет команды — нет продукта»',
  },
];

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */
export function ProblemPage() {
  return (
    <div className="pb-page">

      {/* ── HERO STATEMENT ── */}
      <section className="pb-hero">
        <div className="pb-hero-glow" aria-hidden="true" />
        <div className="pb-inner">
          <Reveal>
            <div className="pb-eyebrow">СИСТЕМНАЯ ПРОБЛЕМА</div>
            <h1 className="pb-hero-title">
              <Counter target={350000} suffix="+" duration={2200} />{' '}
              IT-специалистов каждый год.<br />
              <em>Но команды всё ещё собираются вручную.</em>
            </h1>
            <p className="pb-hero-sub">
              Проблема не в людях. Проблема — в отсутствии инфраструктуры.
            </p>
          </Reveal>

          {/* Macro stats */}
          <Reveal>
            <div className="pb-macro-stats">
              {[
                { val: '76%',      lbl: 'стартапов откладывают MVP из-за кадровой проблемы' },
                { val: '4–6 мес.', lbl: 'в среднем занимает найм инженерной команды'        },
                { val: '60%',      lbl: 'выпускников не имеют production-опыта на старте'   },
                { val: '₽ трлн',   lbl: 'теряет экономика на задержке IT-продуктов ежегодно' },
              ].map(s => (
                <div key={s.lbl} className="pb-macro-stat">
                  <strong>{s.val}</strong>
                  <span>{s.lbl}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── THREE SYSTEMIC PAINS ── */}
      <section className="pb-pains">
        <div className="pb-inner">
          <Reveal>
            <div className="pb-section-eyebrow">ТРИ РАЗРЫВА</div>
            <h2 className="pb-section-title">
              Одна экосистема. Три точки боли.
            </h2>
            <p className="pb-section-sub">
              Таланты, компании и стартапы существуют в одном пространстве —
              но не соединены между собой.
            </p>
          </Reveal>

          <Reveal>
            <div className="pb-pains-grid">
              {PAINS.map(pain => (
                <div key={pain.title} className="pb-pain-card" style={{ '--pc': pain.color }}>
                  <div className="pb-pain-icon">{pain.icon}</div>
                  <h3 className="pb-pain-title">{pain.title}</h3>
                  <div className="pb-pain-lead">{pain.lead}</div>
                  <ul className="pb-pain-list">
                    {pain.items.map(item => (
                      <li key={item.text}>
                        <span>{item.icon}</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <blockquote className="pb-pain-quote">{pain.quote}</blockquote>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Disconnected nodes visual */}
          <Reveal>
            <div className="pb-section-divider" />
            <DisconnectedNodes />
          </Reveal>
        </div>
      </section>

      {/* ── INFRASTRUCTURE GAP ── */}
      <section className="pb-gap">
        <div className="pb-inner">
          <Reveal>
            <div className="pb-section-eyebrow">ИНФРАСТРУКТУРНЫЙ РАЗРЫВ</div>
            <h2 className="pb-section-title">
              Россия производит таланты.<br />
              <span>Их некому активировать.</span>
            </h2>
            <p className="pb-section-sub">
              Университеты, буткемпы, исследователи, open-source сообщества
              — все производят инженеров. Но нет слоя, который превращает
              потенциал в рабочие продукты.
            </p>
          </Reveal>

          <Reveal>
            <TalentGapDiagram />
          </Reveal>
        </div>
      </section>

      {/* ── TIMELINE COMPARISON ── */}
      <section className="pb-compare">
        <div className="pb-inner">
          <Reveal>
            <div className="pb-section-eyebrow">КАК РАБОТАЕТ НАЙМ СЕЙЧАС</div>
            <h2 className="pb-section-title">
              Месяцы задержки — до первой строчки кода.
            </h2>
            <p className="pb-section-sub">
              Традиционный найм — это HR-воронка, интервью, онбординг и
              неопределённость. Скорость разработки теряется ещё до старта.
            </p>
          </Reveal>
          <Reveal>
            <TimelineComparison />
          </Reveal>
        </div>
      </section>

      {/* ── CINEMATIC CLOSING STATEMENT ── */}
      <section className="pb-closing">
        <div className="pb-closing-glow" aria-hidden="true" />
        <div className="pb-inner pb-closing-inner">
          <Reveal>
            <p className="pb-closing-line1">Россия производит инженеров.</p>
            <h2 className="pb-closing-title">
              Точка Сборки превращает их<br />в <em>capability.</em>
            </h2>
            <p className="pb-closing-desc">
              AI-native инфраструктура, которая соединяет таланты, компании
              и стартапы — и запускает команды за 7 дней.
            </p>
            <div className="pb-closing-ctas">
              <Link to="/solution" className="pb-btn-primary">
                Посмотреть как это работает →
              </Link>
              <Link to="/hermes" className="pb-btn-ghost">
                📡 Hermes AI
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
