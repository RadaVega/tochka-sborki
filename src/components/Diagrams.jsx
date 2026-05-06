import { Badge } from './UI';

export function OrbitalDiagram({ labels = [] }) {
  return (
    <div className="orbital" aria-label="Орбитальная схема Точки Сборки">
      <svg viewBox="0 0 220 220" role="img" aria-label="Team-as-a-Service orbital diagram">
        <title>Team-as-a-Service</title>
        <circle cx="110" cy="110" r="98" />
        <circle cx="110" cy="110" r="72" />
        <circle cx="110" cy="110" r="42" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 110 + Math.cos(rad) * 30;
          const y1 = 110 + Math.sin(rad) * 30;
          const x2 = 110 + Math.cos(rad) * 98;
          const y2 = 110 + Math.sin(rad) * 98;
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
        <circle className="core" cx="110" cy="110" r="22" />
        <circle className="dot" cx="110" cy="110" r="8" />
      </svg>
      <strong>Team-as-a-Service</strong>
      <small>Школа Цифровых Технологий Сбера • 2026</small>
      <div className="tag-row center">
        {labels.map((label) => (
          <Badge key={label}>{label}</Badge>
        ))}
      </div>
    </div>
  );
}

export function HermesDiagram({ page }) {
  return (
    <div className="hermes-diagram">
      <div className="diagram-row four">
        {page.inputs.map((input) => (
          <span key={input}>{input}</span>
        ))}
      </div>
      <div className="diagram-connector" />
      <div className="hermes-hub">
        <strong>🧠 {page.hub[0]}</strong>
        <small>{page.hub[1]}</small>
        <div>
          <Badge accent="green">Приоритизация</Badge>
          <Badge accent="green">Маршрутизация</Badge>
          <Badge accent="green">Мониторинг</Badge>
        </div>
      </div>
      <div className="diagram-connector fan" />
      <div className="diagram-row five">
        {['INTAKE', 'MATCHING', 'MONITOR', 'QUALITY', 'COMMS'].map((agent) => (
          <span key={agent}>{agent}</span>
        ))}
      </div>
      <p><strong>Выходы:</strong> {page.outputs}</p>
    </div>
  );
}

export function MoneyFlowDiagram({ flow }) {
  return (
    <div className="money-flow" aria-label="Денежный поток">
      {flow.map((item, index) => (
        <div className="money-flow-item" key={item.title}>
          <div className="flow-box">
            <span>{item.icon}</span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <strong>{item.value}</strong>
          </div>
          {index < flow.length - 1 && <span className="flow-arrow">→</span>}
        </div>
      ))}
    </div>
  );
}
