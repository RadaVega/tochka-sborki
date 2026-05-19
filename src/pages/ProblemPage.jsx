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

export function ProblemPage() {
  const page = pages.problem;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="split problem-split">
        {page.columns.map((column) => (
          <Reveal key={column.title}>
            <Card accent={column.title.includes('Студенты') ? 'purple' : 'cyan'} className="pain-card">
              <div className="pain-head"><span>{column.icon}</span><div><h2>{column.title}</h2><strong>{column.lead}</strong></div></div>
              {column.items.map((item) => (
                <div className="pain-item" key={item.title}><span>{item.icon}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></div>
              ))}
              <blockquote><small>{column.quoteLabel}</small>{column.quote}</blockquote>
            </Card>
          </Reveal>
        ))}
      </div>
      <Card accent="pink" className="insight">{page.insight}</Card>
    </PageShell>
  );
}
