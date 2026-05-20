import { Card, PageShell, Reveal, TechItem } from '../components/UI';
import { pages } from '../data/content';

export function TechStackPage() {
  const page = pages.techStack;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="grid two">{page.groups.map((item) => <Reveal key={item.title}><TechItem item={item} /></Reveal>)}</div>
      <Card accent="green" className="insight">🛡️ {page.shield}</Card>
    </PageShell>
  );
}
