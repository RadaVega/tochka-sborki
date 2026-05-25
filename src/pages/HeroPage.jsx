import { useEffect, useState } from 'react';
import { TrackedLink } from '../components/Tracked';
import { Logo } from '../components/Logo';
import { Badge, PageShell, Reveal } from '../components/UI';
import { EcosystemMap } from '../components/EcosystemMap';
import { pages } from '../data/content';

/* ─── Live ecosystem strip ───────────────────────────────────── */
function LiveStrip({ projects }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % projects.length);
        setVisible(true);
      }, 300);
    }, 3200);
    return () => clearInterval(id);
  }, [projects.length]);

  const p = projects[idx];
  return (
    <div className="live-strip" aria-live="polite" aria-atomic="true">
      <span className="live-dot" aria-hidden="true" />
      <span className="live-label">Hermes сейчас:</span>
      <span
        className="live-item"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity .28s' }}
      >
        <strong>
          {p.type} {p.label}
        </strong>
        <span className="live-stack">{p.stack}</span>
      </span>
    </div>
  );
}

/* ─── Mini flow ──────────────────────────────────────────────── */
function MiniFlow({ steps }) {
  return (
    <div className="mini-flow">
      {steps.map((s, i) => (
        <span key={s.label} className="mini-flow-step">
          <span className="mini-flow-icon">{s.icon}</span>
          <span className="mini-flow-label">{s.label}</span>
          {i < steps.length - 1 && (
            <span className="mini-flow-arrow" aria-hidden="true">
              →
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/* ─── Hero Page ──────────────────────────────────────────────── */
export function HeroPage() {
  const page = pages.hero;

  return (
    <PageShell page={page} className="hero-page eco-hero-page">
      <LiveStrip projects={page.liveProjects} />

      <div className="eco-hero-grid">
        {/* LEFT: copy */}
        <Reveal className="eco-hero-copy">
          <Logo />

          <div className="eco-badge-row">
            <Badge accent="purple">{page.tag}</Badge>
            <Badge accent="cyan">{page.poweredBy}</Badge>
          </div>

          <h1 className="eco-hero-title">
            {page.title[0]}
            <br />
            <span>{page.title[1]}</span>
            <br />
            <em>{page.title[2]}</em>
          </h1>

          <div className="eco-hero-line" />

          <p className="eco-hero-sub">{page.subtitle}</p>

          {/* Metrics */}
          <div className="eco-metrics">
            {page.metrics.map((m) => (
              <div key={m.value} className={`eco-metric eco-metric-${m.accent}`}>
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>

          {/* Mini flow */}
          <MiniFlow steps={page.miniFlow} />

          {/* 3-door CTA */}
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
                  {cta.label}
                </TrackedLink>
              );
            })}
          </div>

          {/* Tags */}
          <div className="eco-tags">
            {page.ecosystemTags.map((tag) => (
              <span key={tag} className="eco-tag">
                {tag}
              </span>
            ))}
          </div>
        </Reveal>

        {/* RIGHT: ecosystem map */}
        <Reveal className="eco-hero-right">
          <EcosystemMap nodes={page.ecosystemNodes} />
          <div className="eco-node-labels">
            {page.ecosystemNodes.map((n) => (
              <span
                key={n.id}
                className="eco-node-pill"
                style={{ '--node-color': n.accent }}
              >
                {n.icon} {n.label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* BOTTOM: story strip */}
      <Reveal>
        <div className="eco-story-strip">
          {page.storyStrip.map((story, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div className="eco-story-item">
                <span className="eco-story-age">{story.age}</span>
                <span className="eco-story-text">{story.text}</span>
              </div>
              {i < page.storyStrip.length - 1 && (
                <div className="eco-story-divider" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </PageShell>
  );
}