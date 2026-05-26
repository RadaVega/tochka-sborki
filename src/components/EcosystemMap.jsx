import { Icon } from './Icon';

const NODES = [
  { id: 'students',   label: 'Студенты',    icon: 'Student',      angle: 280, r: 92,  accent: '#a78bfa' },
  { id: 'startups',   label: 'Стартапы',    icon: 'RocketLaunch', angle: 320, r: 92,  accent: '#22d3ee' },
  { id: 'companies',  label: 'Компании',    icon: 'Building2',    angle: 0,   r: 92,  accent: '#22d3ee' },
  { id: 'mentors',    label: 'Менторы',     icon: 'Users',        angle: 40,  r: 92,  accent: '#6ee7b7' },
  { id: 'research',   label: 'Research',    icon: 'Brain',        angle: 80,  r: 92,  accent: '#f9a8d4' },
  { id: 'opensource', label: 'Open Source', icon: 'GitBranch',    angle: 120, r: 92,  accent: '#fcd34d' },
  { id: 'ai',         label: 'AI Agents',   icon: 'Cpu',          angle: 200, r: 132, accent: '#c4b5fd' },
  { id: 'ecosystem',  label: 'Экосистема',  icon: 'Globe',        angle: 240, r: 132, accent: '#67e8f9' },
  { id: 'industry',   label: 'Индустрия',   icon: 'Layers',       angle: 160, r: 132, accent: '#f472b6' },
];

export function EcosystemMap() {
  const cx = 160;
  const cy = 160;
  const toRad = (deg) => (deg * Math.PI) / 180;

  return (
    <div className="eco-map-wrap">
      {/* ── SVG: massive HERMES sun, animated spokes, orbital rings ── */}
      <div className="eco-map-container" aria-label="Карта экосистемы Точки Сборки">
        <svg className="eco-map-svg" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" role="img">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(124,58,237,.55)" />
              <stop offset="40%"  stopColor="rgba(124,58,237,.25)" />
              <stop offset="100%" stopColor="rgba(124,58,237,0)"   />
            </radialGradient>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(167,139,250,.9)" />
              <stop offset="50%"  stopColor="rgba(124,58,237,.6)" />
              <stop offset="100%" stopColor="rgba(124,58,237,.1)" />
            </radialGradient>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Massive background sun glow */}
          <circle cx={cx} cy={cy} r="155" fill="url(#sunGlow)" className="sun-pulse" />

          {/* Orbital rings — animated */}
          <circle cx={cx} cy={cy} r="140" fill="none" stroke="rgba(124,58,237,.12)" strokeWidth="1" className="orbit-outer" />
          <circle cx={cx} cy={cy} r="105" fill="none" stroke="rgba(124,58,237,.18)" strokeWidth="1.5" strokeDasharray="6 10" className="orbit-mid" />
          <circle cx={cx} cy={cy} r="68"  fill="none" stroke="rgba(8,145,178,.22)"  strokeWidth="1" strokeDasharray="3 6" className="orbit-inner" />

          {/* Animated spoke lines */}
          {NODES.map(n => {
            const rad = toRad(n.angle);
            return (
              <line
                key={`spoke-${n.id}`}
                x1={cx + Math.cos(rad) * 38}
                y1={cy + Math.sin(rad) * 38}
                x2={cx + Math.cos(rad) * (n.r - 20)}
                y2={cy + Math.sin(rad) * (n.r - 20)}
                stroke={n.accent}
                strokeWidth="1.2"
                strokeOpacity=".5"
                strokeDasharray="4 6"
                className="spoke-line"
              />
            );
          })}

          {/* Node backplates */}
          {NODES.map(n => {
            const rad = toRad(n.angle);
            const x = cx + Math.cos(rad) * n.r;
            const y = cy + Math.sin(rad) * n.r;
            return (
              <circle
                key={`plate-${n.id}`}
                cx={x} cy={y} r="22"
                fill={`${n.accent}15`}
                stroke={n.accent}
                strokeWidth="1.5"
                strokeOpacity=".7"
                filter="url(#nodeGlow)"
              />
            );
          })}

          {/* ═══ HERMES SUN — dominates like a star ═══ */}
          {/* Outer corona */}
          <circle cx={cx} cy={cy} r="42" fill="none" stroke="rgba(124,58,237,.3)" strokeWidth="2" className="hermes-corona" />
          <circle cx={cx} cy={cy} r="42" fill="none" stroke="rgba(167,139,250,.15)" strokeWidth="8" className="hermes-pulse-ring" />

          {/* Main body */}
          <circle cx={cx} cy={cy} r="34" fill="url(#coreGlow)" stroke="#a78bfa" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="24" fill="#7c3aed" stroke="rgba(196,181,253,.5)" strokeWidth="1" />

          {/* Inner core — bright white */}
          <circle cx={cx} cy={cy} r="14" fill="white" fillOpacity=".98" className="hermes-core" />
          <circle cx={cx} cy={cy} r="8"  fill="#c4b5fd" fillOpacity=".9" />

          {/* HERMES AI label */}
          <text
            x={cx} y={cy + 54}
            textAnchor="middle"
            fontSize="9"
            fill="#c4b5fd"
            fontFamily="'DejaVu Sans Mono','Liberation Mono',monospace"
            letterSpacing="3"
            fontWeight="800"
          >
            HERMES AI
          </text>
          <text
            x={cx} y={cy + 66}
            textAnchor="middle"
            fontSize="7"
            fill="#7c3aed"
            fontFamily="'DejaVu Sans Mono','Liberation Mono',monospace"
            letterSpacing="4"
          >
            ORCHESTRATOR
          </text>
        </svg>

        {/* Lucide icons — larger, positioned over node backplates */}
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
                boxShadow: `0 0 20px ${n.accent}40`,
              }}
            >
              <Icon name={n.icon} size={18} color={n.accent} strokeWidth={1.8} />
            </div>
          );
        })}
      </div>

      {/* ── Pill labels ── */}
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