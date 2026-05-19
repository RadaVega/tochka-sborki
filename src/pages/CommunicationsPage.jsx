import { Card, ChannelCard, PageShell, Reveal } from '../components/UI';
import { pages } from '../data/content';

export function CommunicationsPage() {
  const page = pages.communications;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="split">
        {page.groups.map((group) => <Reveal key={group.title}><h2 className="section-label">{group.title}</h2>{group.channels.map((channel) => <ChannelCard key={channel.name} channel={channel} />)}</Reveal>)}
      </div>
      <Card accent="pink" className="insight">{page.demo}<TagRow tags={['Ежемесячно', 'Live', '+ Запись']} /></Card>
    </PageShell>
  );
}
