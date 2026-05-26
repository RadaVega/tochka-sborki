import { Icon } from './Icon';

const NODES = [
  { id: 'students',   label: 'Студенты',    icon: 'Student',     angle: 270, r: 92,  accent: '#a78bfa' },
  { id: 'startups',   label: 'Стартапы',    icon: 'RocketLaunch',angle: 330, r: 92,  accent: '#22d3ee' },
  { id: 'companies',  label: 'Компании',    icon: 'Building2',   angle: 30,  r: 92,  accent: '#22d3ee' },
  { id: 'mentors',    label: 'Менторы',     icon: 'Users',       angle: 90,  r: 92,  accent: '#6ee7b7' },
  { id: 'research',   label: 'Research',    icon: 'Brain',       angle: 150, r: 92,  accent: '#f9a8d4' },
  { id: 'opensource', label: 'Open Source', icon: 'GitBranch',   angle: 210, r: 92,  accent: '#fcd34d' },
  { id: 'ai',         label: 'AI Agents',   icon: 'Cpu',         angle: 300, r: 132, accent: '#c4b5fd' },
  { id: 'ecosystem',  label: 'Экосистема',  icon: 'Globe',       angle: 180, r: 132, accent: '#67e8f9' },
];

export function EcosystemMap() {
  const cx = 160;
  const cy = 160;

  const toRad = (deg) => (deg * Math.PI) / 180;

  return (
    <div className="eco-map-container" aria-label="Карта экосистемы Точки Сборки">
      {/* ── SVG canvas: glow, rings, spokes, centre hub ── */}
      <svg className="eco-map-svg" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" role="img">
        <defs>
          <radialGradient id="ecoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(124,58,237,.35)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)"   />
          </radialGradient>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx={cx} cy={cy} r="148" fill="url(#ecoGlow)" />

        {/* Orbital rings */}
        <circle cx={cx} cy={cy} r="132" fill="none" stroke="rgba(124,58,237,.10)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="92"  fill="none" stroke="rgba(124,58,237,.15)" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx={cx} cy={cy} r="52"  fill="none" stroke="rgba(8,145,178,.18)"  strokeWidth="1" />

        {/* Spoke lines */}
        {NODES.map(n => {
          const rad = toRad(n.angle);
          return (
            <line
              key={`spoke-${n.id}`}
              x1={cx + Math.cos(rad) * 30}
              y1={cy + Math.sin(rad) * 30}
              x2={cx + Math.cos(rad) * (n.r - 16)}
              y2={cy + Math.sin(rad) * (n.r - 16)}
              stroke={n.accent}
              strokeWidth="1"
              strokeOpacity=".35"
              strokeDasharray="3 5"
            />
          );
        })}

        {/* Centre hub — HERMES */}
        <circle cx={cx} cy={cy} r="28" fill="rgba(124,58,237,.22)" stroke="#7c3aed" strokeWidth="1.8" />
        <circle cx={cx} cy={cy} r="18" fill="#7c3aed" />
        <circle cx={cx} cy={cy} r="9"  fill="white" fillOpacity=".95" />
        <text
          x={cx} y={cy + 42}
          textAnchor="middle"
          fontSize="8"
          fill="#a78bfa"
          fontFamily="'DejaVu Sans Mono','Liberation Mono',monospace"
          letterSpacing="2"
        >
          HERMES AI
        </text>
      </svg>

      {/* ── Lucide icon overlays ── */}
      {NODES.map(n => {
        const rad = toRad(n.angle);
        const xPct = ((cx + Math.cos(rad) * n.r) / 320) * 100;
        const yPct = ((cy + Math.sin(rad) * n.r) / 320) * 100;
        return (
          <div
            key={n.id}
            className="eco-map-node"
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              borderColor: n.accent,
              boxShadow: `0 0 16px ${n.accent}26`,
            }}
          >
            <Icon name={n.icon} size={14} color={n.accent} strokeWidth={1.8} />
          </div>
        );
      })}

      {/* ── Pill labels below map ── */}
      <div className="eco-map-labels">
        {NODES.map(n => (
          <span
            key={n.id}
            className="eco-map-pill"
            style={{
              color: n.accent,
              background: `${n.accent}18`,
              borderColor: `${n.accent}60`,
            }}
          >
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}