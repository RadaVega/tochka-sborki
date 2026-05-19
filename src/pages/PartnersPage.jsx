import { Card, PageShell, PartnerTile, Reveal } from '../components/UI';
import { pages } from '../data/content';

export function PartnersPage() {
  const page = pages.partners;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="split">
        <Reveal><h2 className="section-label">{page.acceleratorsTitle}</h2>{page.accelerators.map((item) => <PartnerTile key={item.title} item={item} />)}</Reveal>
        <Reveal><h2 className="section-label">{page.corporatesTitle}</h2><div className="grid two">{page.corporates.map((item) => <PartnerTile key={item.title} item={item} />)}</div><Card accent="gold"><h2>💼 Стратегия входа в экосистему</h2><p>{page.strategy}</p><strong>{page.advantage}</strong></Card></Reveal>
      </div>
    </PageShell>
  );
}
