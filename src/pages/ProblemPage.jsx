import { Card, PageShell, Reveal } from '../components/UI';
import { pages } from '../data/content';

export function ProblemPage() {
  const page = pages.problem;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
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
