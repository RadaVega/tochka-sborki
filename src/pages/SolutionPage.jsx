import { Card, Checklist, PageShell, Reveal, TagRow } from '../components/UI';
import { OrbitalDiagram } from '../components/Diagrams';
import { pages } from '../data/content';

export function SolutionPage() {
  const page = pages.solution;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
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
