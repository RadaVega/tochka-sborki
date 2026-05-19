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

export function TechStackPage() {
  const page = pages.techStack;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="grid two">{page.groups.map((item) => <Reveal key={item.title}><TechItem item={item} /></Reveal>)}</div>
      <Card accent="green" className="insight">🛡️ {page.shield}</Card>
    </PageShell>
  );
}
