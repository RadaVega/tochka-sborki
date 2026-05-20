import { Card, PageShell, Reveal, StepCard, TagRow } from '../components/UI';
import { pages } from '../data/content';

export function HowItWorksPage() {
  const page = pages.howItWorks;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="step-grid">
        {page.steps.map((step, index) => <Reveal key={step.title}><StepCard step={step} index={index} /></Reveal>)}
      </div>
      <Card className="insight">{page.footer}<TagRow tags={['Agile', 'AI-powered', 'Fully tracked']} /></Card>
    </PageShell>
  );
}
