import { Card, Checklist, MetricBox, PageShell, ProgressBar, Reveal } from '../components/UI';
import { pages } from '../data/content';

export function GoalsPage() {
  const page = pages.goals;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="split">
        <Reveal><h2 className="section-label">🗓 Дорожная карта — 3 фазы</h2>{page.phases.map((phase, index) => <Card key={phase.title} accent={phase.accent}><h2>{index + 1}. {phase.title}</h2><strong>{phase.meta}</strong><Checklist items={phase.items} /></Card>)}</Reveal>
        <Reveal><h2 className="section-label">📊 Ключевые метрики успеха</h2><div className="metric-grid two">{page.metrics.map((metric) => <MetricBox key={metric.value} {...metric} />)}</div><Card>{page.progress.map((item) => <ProgressBar key={item.label} item={item} />)}</Card></Reveal>
      </div>
    </PageShell>
  );
}
