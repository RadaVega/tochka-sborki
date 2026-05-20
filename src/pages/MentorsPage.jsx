import { Card, Checklist, PageShell, Reveal } from '../components/UI';
import { pages } from '../data/content';

export function MentorsPage() {
  const page = pages.mentors;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="split">
        <Reveal>
          {page.cards.map((card) => <Card key={card.title}><h2>{card.title}</h2><Checklist items={card.items} /></Card>)}
          <Card accent="purple" className="time-card"><h2>⏱ Время ментора в неделю</h2><div><strong>{page.time.before}</strong><span>→</span><strong>{page.time.after}</strong></div><p>{page.time.result}</p></Card>
        </Reveal>
        <Reveal>
          <h2 className="section-label">🤖 Как AI помогает ментору</h2>
          {page.agents.map((agent) => <Card key={agent.title} className="agent-card" accent="green"><span>{agent.icon}</span><div><h2>{agent.title}</h2><p>{agent.text}</p></div></Card>)}
          <blockquote className="quote">{page.quote}</blockquote>
        </Reveal>
      </div>
    </PageShell>
  );
}
