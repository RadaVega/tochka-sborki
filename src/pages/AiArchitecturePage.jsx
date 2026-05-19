import { Card, MetricBox, PageShell, Reveal } from '../components/UI';
import { HermesDiagram } from '../components/Diagrams';
import { pages } from '../data/content';

export function AiArchitecturePage() {
  const page = pages.aiArchitecture;
  return (
    <PageShell page={page}>
      <div className="slide-header">
        <span className="slide-number">{page.number}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <div className="split wide-left">
        <Reveal><HermesDiagram page={page} /></Reveal>
        <Reveal>
          <h2 className="section-label">⚡ Эффект автоматизации — конкретные цифры</h2>
          <div className="metric-grid">{page.metrics.map((metric) => <MetricBox key={metric.value} {...metric} />)}</div>
          {page.agents.map((agent) => <Card key={agent.title} className="agent-card" accent="green"><span>{agent.icon}</span><div><h2>{agent.title}</h2><p>{agent.text}</p></div></Card>)}
        </Reveal>
      </div>
    </PageShell>
  );
}
