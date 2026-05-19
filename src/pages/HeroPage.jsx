import { pages } from '../data/content';
import { Logo } from '../components/Logo';
import { HermesDiagram, MoneyFlowDiagram, OrbitalDiagram } from '../components/Diagrams';
import {
  Badge,
  Card,
  ChannelCard,
  Checklist,
  ContactBlock,
  MetricBox,
  MovieCard,
  PageShell,
  PartnerTile,
  ProcessNode,
  ProgressBar,
  Reveal,
  SlideHeader,
  StepCard,
  TagRow,
  TechItem
} from '../components/UI';

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
