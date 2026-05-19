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

export function TransformationPage() {
  const page = pages.transformation;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="grid four">{page.movies.map((movie) => <Reveal key={movie.title}><MovieCard movie={movie} /></Reveal>)}</div>
      <blockquote className="quote">{page.quote}</blockquote>
    </PageShell>
  );
}
