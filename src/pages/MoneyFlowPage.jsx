import { Card, Checklist, MetricBox, PageShell, ProgressBar, Reveal } from '../components/UI';
import { MoneyFlowDiagram } from '../components/Diagrams';
import { pages } from '../data/content';

export function MoneyFlowPage() {
  const page = pages.moneyFlow;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="split wide-left">
        <Reveal>
          <MoneyFlowDiagram flow={page.flow} />
          <div className="grid three">{page.paymentStages.map((item) => <Card key={item} accent="cyan"><p>{item}</p></Card>)}</div>
          <Card accent="gold"><h2>📲 Как студент видит деньги</h2><Checklist items={page.studentMoney} /></Card>
        </Reveal>
        <Reveal>
          {page.model.map((item) => <Card key={item.title}><h2>{item.title}</h2><p>{item.text}</p>{item.tags && <TagRow tags={item.tags} />}</Card>)}
          <Card accent="green"><h2>📊 Распределение бюджета проекта</h2>{page.split.map((item) => <ProgressBar key={item.label} item={{ label: item.label, value: `${item.value}%`, width: item.value }} />)}</Card>
        </Reveal>
      </div>
    </PageShell>
  );
}
