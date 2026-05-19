import { Badge, Card, Checklist, PageShell, Reveal, TagRow } from '../components/UI';
import { pages } from '../data/content';

export function IndustriesPage() {
  const page = pages.industries;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="center-title"><Badge accent="gold">{page.kicker}</Badge><p>{page.subtitle}</p></div>
      <div className="industry-grid">{page.items.map((item) => <Reveal key={item.title}><Card accent={item.accent} className="industry-card"><span className="industry-icon">{item.icon}</span><h2>{item.title}</h2><small>{item.meta}</small><Checklist items={item.points} /><TagRow tags={item.companies} /></Card></Reveal>)}</div>
      <Card className="insight">{page.cta}<TagRow tags={['Коммерческий опыт', 'Стратегические отрасли', 'Реальный оффер']} /></Card>
    </PageShell>
  );
}
