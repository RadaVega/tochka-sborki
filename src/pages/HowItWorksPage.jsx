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

export function HowItWorksPage() {
  const page = pages.howItWorks;
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className="step-grid">
        {page.steps.map((step, index) => <Reveal key={step.title}><StepCard step={step} index={index} /></Reveal>)}
      </div>
      <Card className="insight">{page.footer}<TagRow tags={['Agile', 'AI-powered', 'Fully tracked']} /></Card>
    </PageShell>
  );
}
