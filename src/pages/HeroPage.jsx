import { Logo } from '../components/Logo';
import { OrbitalDiagram } from '../components/Diagrams';
import { Badge, MetricBox, PageShell, Reveal } from '../components/UI';
import { pages } from '../data/content';

export function HeroPage() {
  const page = pages.hero;
  return (
    <PageShell page={page} className="hero-page">
      <div className="hero-grid">
        <Reveal className="hero-copy">
          <Logo />
          <Badge>{page.tag}</Badge>
          <h1>{page.title[0]}<br /><span>{page.title[1]}</span><br /><em>{page.title[2]}</em></h1>
          <div className="hero-line" />
          <div className="metric-grid three">
            {page.metrics.map((metric) => <MetricBox key={metric.value} {...metric} />)}
          </div>
          <p>{page.subtitle}</p>
          <div className="audience-row">
            {page.audience.map((item) => <span key={item}>{item}</span>)}
          </div>
        </Reveal>
        <Reveal>
          <OrbitalDiagram labels={page.forWhom} />
        </Reveal>
      </div>
    </PageShell>
  );
}
