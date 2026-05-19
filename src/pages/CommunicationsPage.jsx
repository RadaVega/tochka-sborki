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

export function CommunicationsPage() {
  const page = pages.communications;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split">
        {page.groups.map((group) => <Reveal key={group.title}><h2 className="section-label">{group.title}</h2>{group.channels.map((channel) => <ChannelCard key={channel.name} channel={channel} />)}</Reveal>)}
      </div>
      <Card accent="pink" className="insight">{page.demo}<TagRow tags={['Ежемесячно', 'Live', '+ Запись']} /></Card>
    </PageShell>
  );
}
