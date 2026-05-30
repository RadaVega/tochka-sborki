/**
 * src/pages/MentorsPage.jsx — Full redesign
 *
 * New narrative: Mentors are the human intelligence layer
 * of the AI-native engineering ecosystem.
 * No School 21 references. National, open, infrastructure-level.
 *
 * INSTALL: Replace src/pages/MentorsPage.jsx
 * CSS: Append <style block at bottom> to src/styles/index.css
 * ROUTE: already at /mentors in App.jsx
 */

import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { Reveal }   from '../components/UI';

/* ═══════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════ */

const WHO_MENTORS = [
  { icon: '⚡', title: 'Действующие инженеры',    text: 'Senior и Lead-разработчики из ведущих российских IT-компаний с опытом production-разработки от 3 лет.', color: '#22d3ee' },
  { icon: '🔬', title: 'Исследователи и учёные',  text: 'Специалисты из НИИ, университетов и R&D-лабораторий, готовые передавать прикладные знания.', color: '#a78bfa' },
  { icon: '🚀', title: 'Технические фаундеры',    text: 'Основатели стартапов, прошедшие путь от идеи до продукта. Знают цену скорости и правильных решений.', color: '#6ee7b7' },
  { icon: '🏛️', title: 'Архитекторы систем',      text: 'Специалисты по высоконагруженным и распределённым системам. Принимают решения, которые работают в продакшне.', color: '#f9a8d4' },
];

const MENTOR_DOES = [
  { icon: '🧠', text: 'Архитектурные решения при нестандартных сценариях' },
  { icon: '💬', text: 'Эмпатия, мотивация и разрешение командных конфликтов' },
  { icon: '🔍', text: 'Финальная приёмка качества — суждение, а не алгоритм' },
  { icon: '🤝', text: 'Коммуникация с заказчиком в критических ситуациях' },
  { icon: '📐', text: 'Определение Definition of Done на Kick-off' },
  { icon: '🌱', text: 'Передача инженерной культуры следующему поколению' },
];

const AI_DOES = [
  { icon: '📊', agent: 'Progress Monitor', model: 'Kaiten API',    text: 'Автосбор статусов задач, формирование weekly AI-отчёта без участия ментора' },
  { icon: '🔍', agent: 'Quality Agent',   model: 'GigaChat Pro',  text: 'Первичный code review PR-запросов, маркировка критических багов, генерация тестов' },
  { icon: '📣', agent: 'Comms Bot',       model: 'VK Teams API',  text: 'Напоминания о дедлайнах, уведомления о блокерах, статус-апдейты команде 24/7' },
  { icon: '📥', agent: 'Intake Agent',    model: 'YandexGPT 4',   text: 'Структурирование ТЗ от заказчика — ментор получает готовый разобранный бриф' },
];

/* ═══════════════════════════════════════════════════
   TIME COMPARISON VISUAL
═══════════════════════════════════════════════════ */
function TimeComparison() {
  const bars = [
    { label: 'Без AI',  hours: 12, color: '#f472b6', tasks: ['Code review', 'Отчёты', 'Напоминания', 'Сбор статусов', 'Документация'] },
    { label: 'С Hermes', hours: 3,  color: '#4ade80', tasks: ['Архитектура', 'Ключевые решения', 'Коммуникация'] },
  ];
  return (
    <div className="mn-time-compare">
      {bars.map(b => (
        <div key={b.label} className="mn-time-col">
          <div className="mn-time-label" style={{ color: b.color }}>{b.label}</div>
          <div className="mn-time-bar-wrap">
            <div className="mn-time-bar"
              style={{ height: `${b.hours * 14}px`, background: `${b.color}25`, borderColor: `${b.color}55` }}>
              {b.tasks.map(t => (
                <div key={t} className="mn-time-task" style={{ borderColor: `${b.color}40`, color: b.color }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="mn-time-hours" style={{ color: b.color }}>
            {b.hours}ч <span>/неделю</span>
          </div>
        </div>
      ))}
      <div className="mn-time-arrow" aria-hidden="true">
        <div className="mn-time-arrow-line" />
        <div className="mn-time-arrow-label">-75%<br/>времени</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HUMAN vs AI DIVISION DIAGRAM
═══════════════════════════════════════════════════ */
function DivisionDiagram() {
  const [hovSide, setHovSide] = useState(null);
  return (
    <div className="mn-division">
      {/* Human side */}
      <div
        className={`mn-div-side mn-div-human${hovSide === 'human' ? ' hov' : ''}`}
        onMouseEnter={() => setHovSide('human')}
        onMouseLeave={() => setHovSide(null)}
      >
        <div className="mn-div-side-header">
          <span className="mn-div-icon">🧑‍💻</span>
          <div>
            <div className="mn-div-title">Ментор</div>
            <div className="mn-div-sub">Интеллект · Эмпатия · Суждение</div>
          </div>
        </div>
        <ul className="mn-div-list">
          {MENTOR_DOES.map(item => (
            <li key={item.text}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
        <div className="mn-div-quote">
          «AI не заменяет ментора — он освобождает ментора для того, что действительно важно»
        </div>
      </div>

      {/* Center connector */}
      <div className="mn-div-center" aria-hidden="true">
        <div className="mn-div-center-line" />
        <div className="mn-div-center-node">
          <div className="mn-div-hermes-ring" />
          <span>H</span>
        </div>
        <div className="mn-div-center-line" />
        <div className="mn-div-center-label">HERMES</div>
      </div>

      {/* AI side */}
      <div
        className={`mn-div-side mn-div-ai${hovSide === 'ai' ? ' hov' : ''}`}
        onMouseEnter={() => setHovSide('ai')}
        onMouseLeave={() => setHovSide(null)}
      >
        <div className="mn-div-side-header">
          <span className="mn-div-icon">🤖</span>
          <div>
            <div className="mn-div-title">AI-агенты</div>
            <div className="mn-div-sub">Рутина · Скорость · Масштаб</div>
          </div>
        </div>
        <ul className="mn-div-list mn-div-list-ai">
          {AI_DOES.map(item => (
            <li key={item.agent}>
              <span>{item.icon}</span>
              <div>
                <strong>{item.agent}</strong>
                <span className="mn-div-model">{item.model}</span>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MENTOR JOURNEY STEPS
═══════════════════════════════════════════════════ */
const JOURNEY = [
  { n: '01', title: 'Заявка и верификация',     desc: 'Подаёте заявку, проходите техническое интервью. Команда Точки Сборки верифицирует экспертизу.', color: '#22d3ee' },
  { n: '02', title: 'Онбординг в экосистему',   desc: 'Получаете доступ к Kaiten, GitVerse, инструментам Hermes и обучаетесь стандартам платформы.', color: '#a78bfa' },
  { n: '03', title: 'Назначение на проект',      desc: 'Hermes подбирает проекты под вашу экспертизу. Вы выбираете из предложений — без давления.', color: '#6ee7b7' },
  { n: '04', title: 'Ведение команды',           desc: 'AI берёт рутину. Вы фокусируетесь на архитектуре, code review ключевых решений и росте команды.', color: '#f9a8d4' },
  { n: '05', title: 'Доход и репутация',         desc: '15–25k ₽ за проект. Рейтинг в экосистеме. Одновременно можно вести до 3 команд.', color: '#fcd34d' },
];

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */
export function MentorsPage() {
  return (
    <div className="mn-page">

      {/* ── HERO ── */}
      <section className="mn-hero">
        <div className="mn-hero-glow-a" aria-hidden="true" />
        <div className="mn-hero-glow-b" aria-hidden="true" />
        <div className="mn-inner">
          <Reveal>
            <div className="mn-eyebrow">МЕНТОРЫ ЭКОСИСТЕМЫ</div>
            <h1 className="mn-hero-title">
              Человеческий интеллект<br />
              <span>в сердце</span> AI-системы.
            </h1>
            <p className="mn-hero-sub">
              Менторы Точки Сборки — это не преподаватели и не HR-менеджеры.
              Это действующие инженеры, которые передают реальный опыт
              и принимают решения, которые не может принять алгоритм.
            </p>
          </Reveal>

          <Reveal>
            <div className="mn-hero-stats">
              {[
                { val: '1 ментор',   lbl: 'ведёт до 3 команд одновременно', color: '#a78bfa' },
                { val: '12 → 3ч',    lbl: 'рутины в неделю — с Hermes AI',   color: '#22d3ee' },
                { val: '15–25k ₽',   lbl: 'доход за проект',                 color: '#6ee7b7' },
                { val: '75%',        lbl: 'времени освобождает AI',           color: '#fcd34d' },
              ].map(s => (
                <div key={s.val} className="mn-hero-stat" style={{ '--sc': s.color }}>
                  <strong>{s.val}</strong>
                  <span>{s.lbl}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="mn-hero-ctas">
              <Link to="/contacts" className="mn-btn-primary">
                🧑‍💻 Стать ментором экосистемы
              </Link>
              <Link to="/hermes" className="mn-btn-outline">
                📡 Как работает Hermes →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHO MENTORS ARE ── */}
      <section className="mn-section mn-section-dark">
        <div className="mn-inner">
          <Reveal>
            <div className="mn-eyebrow">КТО СТАНОВИТСЯ МЕНТОРОМ</div>
            <h2 className="mn-section-title">
              Опыт из реального производства.<br />
              <span>Не из учебников.</span>
            </h2>
            <p className="mn-section-sub">
              Менторский пул Точки Сборки открыт для действующих инженеров
              со всей России — независимо от места работы и alma mater.
            </p>
          </Reveal>

          <Reveal>
            <div className="mn-who-grid">
              {WHO_MENTORS.map(m => (
                <div key={m.title} className="mn-who-card" style={{ '--wc': m.color }}>
                  <div className="mn-who-icon">{m.icon}</div>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── DIVISION OF LABOR ── */}
      <section className="mn-section mn-section-purple">
        <div className="mn-inner">
          <Reveal>
            <div className="mn-eyebrow">РАЗДЕЛЕНИЕ ТРУДА</div>
            <h2 className="mn-section-title">
              Ментор + AI = <span>сила без перегрузки</span>
            </h2>
            <p className="mn-section-sub">
              Hermes берёт 80% операционной рутины. Ментор получает время
              на то, что реально имеет значение — стратегию, архитектуру и людей.
            </p>
          </Reveal>
          <Reveal>
            <DivisionDiagram />
          </Reveal>
        </div>
      </section>

      {/* ── TIME SAVED ── */}
      <section className="mn-section mn-section-dark">
        <div className="mn-inner mn-time-section">
          <Reveal>
            <div className="mn-eyebrow">ВЫСВОБОЖДЕНИЕ ВРЕМЕНИ</div>
            <h2 className="mn-section-title">
              С 12 часов в неделю —<br />
              <span>до 3 часов стратегической работы.</span>
            </h2>
            <p className="mn-section-sub">
              Один ментор ведёт до 3 команд одновременно — не потому что
              работает больше, а потому что AI-агенты берут всё остальное.
            </p>
            <TimeComparison />
          </Reveal>

          <Reveal>
            <div className="mn-scale-fact">
              <div className="mn-scale-fact-icon">✕3</div>
              <div>
                <strong>Масштаб без выгорания</strong>
                <p>1 ментор × 3 команды = 3 проекта в параллель без потери качества.
                AI-агенты мониторят прогресс, код и коммуникации автоматически.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── MENTOR JOURNEY ── */}
      <section className="mn-section mn-section-purple">
        <div className="mn-inner">
          <Reveal>
            <div className="mn-eyebrow">ПУТЬ МЕНТОРА</div>
            <h2 className="mn-section-title">
              От заявки до <span>первого проекта — 7 дней.</span>
            </h2>
          </Reveal>

          <Reveal>
            <div className="mn-journey">
              {JOURNEY.map((step, i) => (
                <div key={step.n} className="mn-journey-step" style={{ '--jc': step.color }}>
                  {i < JOURNEY.length - 1 && (
                    <div className="mn-journey-connector" aria-hidden="true" />
                  )}
                  <div className="mn-journey-num">{step.n}</div>
                  <div className="mn-journey-body">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── AI AGENTS DETAIL ── */}
      <section className="mn-section mn-section-dark">
        <div className="mn-inner">
          <Reveal>
            <div className="mn-eyebrow">AI-АГЕНТЫ HERMES</div>
            <h2 className="mn-section-title">
              Ваша цифровая операционная команда.
            </h2>
            <p className="mn-section-sub">
              Пока вы фокусируетесь на главном — 4 специализированных агента
              работают за вас круглосуточно.
            </p>
          </Reveal>

          <Reveal>
            <div className="mn-agents-grid">
              {AI_DOES.map(a => (
                <div key={a.agent} className="mn-agent-card">
                  <div className="mn-agent-icon">{a.icon}</div>
                  <div className="mn-agent-name">{a.agent}</div>
                  <div className="mn-agent-model">{a.model}</div>
                  <div className="mn-agent-text">{a.text}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <blockquote className="mn-quote">
              «AI не заменяет ментора — эмпатия, креативные решения и стратегия
              остаются за человеком. Рутина → нуль.»
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ── INCOME & IMPACT ── */}
      <section className="mn-section mn-section-purple">
        <div className="mn-inner">
          <Reveal>
            <div className="mn-eyebrow">ДОХОД И ВЛИЯНИЕ</div>
            <h2 className="mn-section-title">
              Передавайте опыт.<br />
              <span>Зарабатывайте. Растите экосистему.</span>
            </h2>
          </Reveal>
          <Reveal>
            <div className="mn-income-grid">
              <div className="mn-income-card mn-income-money">
                <div className="mn-income-val">15–25k ₽</div>
                <div className="mn-income-lbl">за проект</div>
                <p>2–4 недели работы · самозанятость · выплата за 24 часа через «Мой налог»</p>
              </div>
              <div className="mn-income-card">
                <div className="mn-income-val" style={{ color: '#a78bfa' }}>×3</div>
                <div className="mn-income-lbl">проекта параллельно</div>
                <p>1 ментор × 3 команды при поддержке Hermes = до 75k ₽/месяц дополнительного дохода</p>
              </div>
              <div className="mn-income-card">
                <div className="mn-income-val" style={{ color: '#6ee7b7' }}>∞</div>
                <div className="mn-income-lbl">рост репутации</div>
                <p>Рейтинг в экосистеме · нетворкинг с лучшими инженерами России · передача legacy следующему поколению</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mn-closing">
        <div className="mn-closing-glow" aria-hidden="true" />
        <div className="mn-inner mn-closing-inner">
          <Reveal>
            <div className="mn-eyebrow">ПРИСОЕДИНИТЬСЯ</div>
            <h2 className="mn-closing-title">
              Станьте частью<br />
              <em>новой инженерной инфраструктуры России.</em>
            </h2>
            <p className="mn-closing-desc">
              Передавайте опыт. Зарабатывайте. Помогайте следующему поколению инженеров
              строить продукты, которые меняют страну.
            </p>
            <div className="mn-closing-ctas">
              <Link to="/contacts" className="mn-btn-primary">
                🧑‍💻 Стать ментором
              </Link>
              <Link to="/solution" className="mn-btn-outline">
                Как устроена экосистема →
              </Link>
              <Link to="/student-path" className="mn-btn-ghost">
                🎓 Для студентов
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
