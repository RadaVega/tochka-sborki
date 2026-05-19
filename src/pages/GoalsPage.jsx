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

export function GoalsPage() {
  const page = pages.goals;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split">
        <Reveal><h2 className="section-label">🗓 Дорожная карта — 3 фазы</h2>{page.phases.map((phase, index) => <Card key={phase.title} accent={phase.accent}><h2>{index + 1}. {phase.title}</h2><strong>{phase.meta}</strong><Checklist items={phase.items} /></Card>)}</Reveal>
        <Reveal><h2 className="section-label">📊 Ключевые метрики успеха</h2><div className="metric-grid two">{page.metrics.map((metric) => <MetricBox key={metric.value} {...metric} />)}</div><Card>{page.progress.map((item) => <ProgressBar key={item.label} item={item} />)}</Card></Reveal>
      </div>
    </PageShell>
  );
}
