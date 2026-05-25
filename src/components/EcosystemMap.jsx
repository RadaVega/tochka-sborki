import { useMemo } from 'react';

const CX = 200;
const CY = 200;

/* ─── Animated Ecosystem Map ───────────────────────────────────
   Pure CSS animations — no JS animation libraries needed.
   Nodes orbit via CSS rotate on parent <g> groups.
   HERMES center pulses with CSS keyframes.
   Spoke dasharray animates for "data flow" feel.
─────────────────────────────────────────────────────────────── */

export function EcosystemMap({ nodes }) {
  const inner = useMemo(() => nodes.filter((n) => n.r <= 100), [nodes]);
  const outer = useMemo(() => nodes.filter((n) => n.r > 100), [nodes]);

  return (
    <div className="eco-map-wrap" aria-label="Карта экосистемы Точки Сборки">
      <svg viewBox="0 0 400 400" role="img" className="eco-map-svg">
        <defs>
          <radialGradient id="ecoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124,58,237,.45)" />
            <stop offset="60%" stopColor="rgba(124,58,237,.12)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </radialGradient>
          <radialGradient id="hermesGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,.6)" />
            <stop offset="50%" stopColor="rgba(139,92,246,.15)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0)" />
          </radialGradient>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hermesBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx={CX} cy={CY} r="185" fill="url(#ecoGlow)" className="eco-bg-glow" />

        {/* Orbital rings — dashed, animated */}
        <g className="orbit-ring orbit-outer">
          <circle cx={CX} cy={CY} r="168" fill="none" stroke="rgba(124,58,237,.12)" strokeWidth="1" />
        </g>
        <g className="orbit-ring orbit-mid">
          <circle cx={CX} cy={CY} r="118" fill="none" stroke="rgba(124,58,237,.18)" strokeWidth="1.5" strokeDasharray="6 10" />
        </g>
        <g className="orbit-ring orbit-inner">
          <circle cx={CX} cy={CY} r="68" fill="none" stroke="rgba(8,145,178,.22)" strokeWidth="1" strokeDasharray="3 6" />
        </g>

        {/* Animated spoke lines from center */}
        {nodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const x2 = CX + Math.cos(rad) * (n.r - 22);
          const y2 = CY + Math.sin(rad) * (n.r - 22);
          return (
            <line
              key={`spoke-${n.id}`}
              x1={CX + Math.cos(rad) * 38}
              y1={CY + Math.sin(rad) * 38}
              x2={x2}
              y2={y2}
              stroke={n.accent}
              strokeWidth="1.2"
              strokeOpacity=".5"
              strokeDasharray="4 6"
              className="spoke-line"
            />
          );
        })}

        {/* Outer ring nodes — animated orbital groups */}
        {outer.map((n, i) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = CX + Math.cos(rad) * n.r;
          const y = CY + Math.sin(rad) * n.r;
          return (
            <g key={`outer-${n.id}`} className={`orbit-node orbit-outer-node node-delay-${i}`}>
              <circle cx={x} cy={y} r="22" fill={`${n.accent}18`} stroke={n.accent} strokeWidth="1.5" filter="url(#nodeGlow)" />
              <text x={x} y={y + 6} textAnchor="middle" fontSize="16" role="img" aria-label={n.label}>{n.icon}</text>
            </g>
          );
        })}

        {/* Inner ring nodes */}
        {inner.map((n, i) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = CX + Math.cos(rad) * n.r;
          const y = CY + Math.sin(rad) * n.r;
          return (
            <g key={`inner-${n.id}`} className={`orbit-node orbit-inner-node node-delay-${i}`}>
              <circle cx={x} cy={y} r="20" fill={`${n.accent}20`} stroke={n.accent} strokeWidth="1.4" filter="url(#nodeGlow)" />
              <text x={x} y={y + 5} textAnchor="middle" fontSize="14" role="img" aria-label={n.label}>{n.icon}</text>
            </g>
          );
        })}

        {/* HERMES CENTER — The Brain */}
        <g className="hermes-core" filter="url(#hermesBloom)">
          {/* Outer pulse rings */}
          <circle cx={CX} cy={CY} r="42" fill="none" stroke="rgba(139,92,246,.3)" strokeWidth="1" className="hermes-pulse-ring" />
          <circle cx={CX} cy={CY} r="36" fill="none" stroke="rgba(139,92,246,.5)" strokeWidth="1.5" className="hermes-pulse-ring" style={{ animationDelay: '.6s' }} />
          
          {/* Core body */}
          <circle cx={CX} cy={CY} r="32" fill="url(#hermesGlow)" />
          <circle cx={CX} cy={CY} r="26" fill="rgba(124,58,237,.35)" stroke="#8b5cf6" strokeWidth="2" />
          <circle cx={CX} cy={CY} r="18" fill="#7c3aed" />
          <circle cx={CX} cy={CY} r="10" fill="white" fillOpacity=".95" />
          
          {/* Label */}
          <text
            x={CX}
            y={CY + 52}
            textAnchor="middle"
            fontSize="9"
            fill="#c4b5fd"
            fontFamily="'DejaVu Sans Mono','Liberation Mono',monospace"
            letterSpacing="3"
            fontWeight="700"
          >
            HERMES AI
          </text>
          <text
            x={CX}
            y={CY + 64}
            textAnchor="middle"
            fontSize="7"
            fill="#64748b"
            fontFamily="'DejaVu Sans Mono','Liberation Mono',monospace"
            letterSpacing="2"
          >
            ORCHESTRATOR
          </text>
        </g>
      </svg>
    </div>
  );
}