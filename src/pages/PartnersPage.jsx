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

export function PartnersPage() {
  const page = pages.partners;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split">
        <Reveal><h2 className="section-label">{page.acceleratorsTitle}</h2>{page.accelerators.map((item) => <PartnerTile key={item.title} item={item} />)}</Reveal>
        <Reveal><h2 className="section-label">{page.corporatesTitle}</h2><div className="grid two">{page.corporates.map((item) => <PartnerTile key={item.title} item={item} />)}</div><Card accent="gold"><h2>💼 Стратегия входа в экосистему</h2><p>{page.strategy}</p><strong>{page.advantage}</strong></Card></Reveal>
      </div>
    </PageShell>
  );
}
