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

export function SolutionPage() {
  const page = pages.solution;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="three-col">
        <Reveal>
          <Card accent="green"><h2>{page.intro.title}</h2><p>{page.intro.text}</p></Card>
          <Card accent="purple"><h2>Как это работает</h2><p>{page.mechanics}</p><TagRow tags={page.badges} /></Card>
          <blockquote className="quote"><strong>{page.quoteTitle}</strong>{page.quote}</blockquote>
        </Reveal>
        <OrbitalDiagram labels={['IT-разработчики', 'AI-агенты', 'Ментор + ТЗ']} />
        <Reveal>
          {page.value.map((item) => <Card key={item.title} accent={item.title.includes('Компаниям') ? 'cyan' : 'purple'}><h2>{item.title}</h2><strong>{item.subtitle}</strong><Checklist items={item.points} /></Card>)}
        </Reveal>
      </div>
    </PageShell>
  );
}
