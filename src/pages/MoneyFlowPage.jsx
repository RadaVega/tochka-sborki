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

export function MoneyFlowPage() {
  const page = pages.moneyFlow;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split wide-left">
        <Reveal>
          <MoneyFlowDiagram flow={page.flow} />
          <div className="grid three">{page.paymentStages.map((item) => <Card key={item} accent="cyan"><p>{item}</p></Card>)}</div>
          <Card accent="gold"><h2>📲 Как студент видит деньги</h2><Checklist items={page.studentMoney} /></Card>
        </Reveal>
        <Reveal>
          {page.model.map((item) => <Card key={item.title}><h2>{item.title}</h2><p>{item.text}</p>{item.tags && <TagRow tags={item.tags} />}</Card>)}
          <Card accent="green"><h2>📊 Распределение бюджета проекта</h2>{page.split.map((item) => <ProgressBar key={item.label} item={{ label: item.label, value: `${item.value}%`, width: item.value }} />)}</Card>
        </Reveal>
      </div>
    </PageShell>
  );
}
