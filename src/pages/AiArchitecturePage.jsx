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

export function AiArchitecturePage() {
  const page = pages.aiArchitecture;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split wide-left">
        <Reveal><HermesDiagram page={page} /></Reveal>
        <Reveal>
          <h2 className="section-label">⚡ Эффект автоматизации — конкретные цифры</h2>
          <div className="metric-grid">{page.metrics.map((metric) => <MetricBox key={metric.value} {...metric} />)}</div>
          {page.agents.map((agent) => <Card key={agent.title} className="agent-card" accent="green"><span>{agent.icon}</span><div><h2>{agent.title}</h2><p>{agent.text}</p></div></Card>)}
        </Reveal>
      </div>
    </PageShell>
  );
}
