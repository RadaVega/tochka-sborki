import { Card, PageShell, ProcessNode, Reveal } from '../components/UI';
import { pages } from '../data/content';

export function StudentPathPage() {
  return <ProcessPage page={pages.studentPath} form={null} />;
}

function ProcessPage({ page, form }) {
  const leftSteps = form ? page.steps : page.steps.slice(0, 3);
  const rightSteps = form ? [] : page.steps.slice(3);
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className={form ? 'split wide-left' : 'grid two'}>
        <Reveal className="process-grid">{leftSteps.map((item, index) => <ProcessNode key={item.title} item={item} index={index} />)}</Reveal>
        {form ? <Reveal>{form}</Reveal> : <Reveal className="process-grid">{rightSteps.map((item, index) => <ProcessNode key={item.title} item={item} index={index + 3} />)}</Reveal>}
      </div>
      <Card className="insight"><strong>🛠 Стек:</strong><TagRow tags={page.stack} /></Card>
    </PageShell>
  );
}
