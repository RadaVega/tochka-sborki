import { pages } from '../data/content';
import { PageShell, Card, ProcessNode, Reveal, SlideHeader, TagRow } from '../components/UI';

function ProcessPage({ page, form }) {
  const leftSteps = form ? page.steps : page.steps.slice(0, 3);
  const rightSteps = form ? [] : page.steps.slice(3);
  return (
    <PageShell page={page}>
      <SlideHeader page={page} />
      <div className={form ? 'split wide-left' : 'grid two'}>
        <Reveal className="process-grid">{leftSteps.map((item, index) => <ProcessNode key={item.title} item={item} index={index} />)}</Reveal>
        {form ? <Reveal>{form}</Reveal> : <Reveal className="process-grid">{rightSteps.map((item, index) => <ProcessNode key={item.title} item={item} index={index + 3} />)}</Reveal>}
      </div>
      <Card className="insight"><strong>🛠 Стек:</strong><TagRow tags={page.stack} /></Card>
    </PageShell>
  );
}

export function StudentPathPage() {
  return <ProcessPage page={pages.studentPath} form={null} />;
}
