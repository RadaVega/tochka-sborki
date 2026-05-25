import { useEffect, useState } from 'react';
import { TrackedLink } from '../components/Tracked';
import { Badge, PageShell, Reveal } from '../components/UI';
import { EcosystemMap } from '../components/EcosystemMap';
import { Icon } from '../components/Icon';
import { pages } from '../data/content';

function LiveStrip({ projects }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % projects.length);
        setVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(id);
  }, [projects.length]);

  const p = projects[idx];
  return (
    <div className="live-strip" aria-live="polite" aria-atomic="true">
      <span className="live-dot" aria-hidden="true" />
      <span className="live-label">Hermes сейчас:</span>
      <span
        className="live-item"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity .32s ease' }}
      >
        <Icon name={p.icon} size={16} weight="fill" className="live-icon-svg" />
        <strong>{p.label}</strong>
        <span className="live-stack">{p.stack}</span>
      </span>
    </div>
  );
}

function MiniFlow({ steps }) {
  return (
    <div className="mini-flow">
      {steps.map((s, i) => (
        <div key={s.label} className="mini-flow-step">
          <span className="mini-flow-num">0{i + 1}</span>
          <Icon name={s.icon} size={26} weight="duotone" className="mini-flow-icon-svg" />
          <span className="mini-flow-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function StoryCard({ story }) {
  return (
    <div className="story-card">
      <div className="story-card-avatar">
        <Icon name={story.icon} size={22} weight="duotone" />
      </div>
      <div className="story-card-body">
        <div className="story-card-meta">
          <strong className="story-card-age">{story.age}</strong>
          <span className="story-card-tag">{story.tag}</span>
        </div>
        <p className="story-card-path">{story.path}</p>
        <div className="story-card-outcome">
          <span className="story-card-arrow">→</span>
          <span className="story-card-result">{story.result}</span>
        </div>
      </div>
    </div>
  );
}

function NationalMission() {
  return (
    <div className="national-mission">
      <div className="mission-header">
        <Icon name="Compass" size={32} weight="duotone" className="mission-icon" />
        <h3>Национальная инженерная миссия</h3>
      </div>
      <p className="mission-lead">
        Россия выпускает <strong>350 000+ IT-специалистов ежегодно</strong> — один из крупнейших инженерных резервов мира. Но потенциал реализуется лишь на часть. Точка Сборки создаёт инфраструктуру, где каждый выпускник становится продуктовым инженером, а каждая компания — инноватором.
      </p>
      <div className="mission-flow">
        <div className="mission-step">
          <Icon name="Student" size={28} weight="duotone" />
          <strong>350k+ выпускников</strong>
          <span>Ежегодный поток талантов</span>
        </div>
        <Icon name="ArrowRight" size={20} weight="bold" className="mission-arrow" />
        <div className="mission-step">
          <Icon name="Brain" size={28} weight="duotone" />
          <strong>Hermes AI Scoring</strong>
          <span>Оценка навыков и потенциала</span>
        </div>
        <Icon name="ArrowRight" size={20} weight="bold" className="mission-arrow" />
        <div className="mission-step">
          <Icon name="Users" size={28} weight="duotone" />
          <strong>Product-команды</strong>
          <span>Собраны за 7 дней</span>
        </div>
        <Icon name="ArrowRight" size={20} weight="bold" className="mission-arrow" />
        <div className="mission-step">
          <Icon name="RocketLaunch" size={28} weight="duotone" />
          <strong>Национальные продукты</strong>
          <span>Технологический суверенитет</span>
        </div>
      </div>
    </div>
  );
}

function AIVision() {
  return (
    <div className="ai-vision">
      <div className="vision-quote">
        <Icon name="Sparkle" size={24} weight="fill" />
        <blockquote>
          Мы стоим на пороге перехода от эпохи ручного управления к эпохе AI-оркестрации. Hermes не заменяет инженера — он удаляет барьеры между талантом и результатом, освобождая человека для творчества и сложных задач.
        </blockquote>
      </div>
      <div className="vision-pillars">
        <div className="vision-pillar">
          <Icon name="Lightning" size={24} weight="duotone" />
          <strong>80% рутины автоматизировано</strong>
          <span>Подбор, контракты, менторство, отчётность</span>
        </div>
        <div className="vision-pillar">
          <Icon name="Handshake" size={24} weight="duotone" />
          <strong>Человек фокусируется на творчестве</strong>
          <span>Архитектура, инновации, решение нетривиальных проблем</span>
        </div>
        <div className="vision-pillar">
          <Icon name="Globe" size={24} weight="duotone" />
          <strong>Масштаб страны</strong>
          <span>Единая инженерная сеть от Калининграда до Владивостока</span>
        </div>
      </div>
    </div>
  );
}

export function HeroPage() {
  const page = pages.hero;

  return (
    <PageShell page={page} className="hero-page eco-hero-page">
      <LiveStrip projects={page.liveProjects} />

      <div className="eco-hero-grid">
        <Reveal className="eco-hero-copy">
          <div className="eco-badge-row">
            <Badge accent="purple">{page.tag}</Badge>
            <Badge accent="cyan">{page.poweredBy}</Badge>
          </div>

          <h1 className="eco-hero-title">
            {page.title[0]}<br />
            <span>{page.title[1]}</span><br />
            <em>{page.title[2]}</em>
          </h1>

          <div className="eco-hero-line" />

          <p className="eco-hero-sub">{page.subtitle}</p>

          <div className="eco-metrics">
            {page.metrics.map((m) => (
              <div key={m.value} className={`eco-metric eco-metric-${m.accent}`}>
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>

          <MiniFlow steps={page.miniFlow} />

          <div className="eco-cta-row">
            {page.audience.map((cta) => {
              const className =
                cta.style === 'primary'
                  ? 'primary-button eco-cta-primary'
                  : cta.style === 'outline'
                    ? 'outline-button'
                    : 'ghost-button';
              return (
                <TrackedLink
                  key={cta.goal}
                  to={cta.path}
                  goal={cta.goal}
                  className={className}
                >
                  <Icon name={cta.icon} size={18} weight="duotone" />
                  <span>{cta.label}</span>
                </TrackedLink>
              );
            })}
          </div>

          <div className="eco-tags">
            {page.ecosystemTags.map((tag) => (
              <span key={tag} className="eco-tag">{tag}</span>
            ))}
          </div>
        </Reveal>

        <Reveal className="eco-hero-right">
          <EcosystemMap nodes={page.ecosystemNodes} />
        </Reveal>
      </div>

      <Reveal>
        <div className="eco-story-section">
          <div className="eco-story-header">
            <Icon name="RocketLaunch" size={32} weight="duotone" className="eco-story-icon" />
            <div>
              <h3 className="eco-story-title">Трансформация в экосистеме</h3>
              <p className="eco-story-subtitle">
                Реальные пути студентов и команд через Точку Сборки
              </p>
            </div>
          </div>
          <div className="eco-story-grid">
            {page.storyStrip.map((story) => (
              <StoryCard key={story.age} story={story} />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <NationalMission />
      </Reveal>

      <Reveal>
        <AIVision />
      </Reveal>
    </PageShell>
  );
}