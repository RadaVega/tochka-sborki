import { useMemo } from 'react';

const CX = 200;
const CY = 200;

/* ─── Animated Ecosystem Map v3 ────────────────────────────────
   Nodes orbit in rigid rings (outer clockwise, inner counter).
   Spokes pivot from the HERMES center like radar arms.
   Each node counter-rotates so its icon stays upright.
   Pure CSS — zero dependencies.
────────────────────────────────────────────────────────────── */

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
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hermesBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx={CX} cy={CY} r="190" fill="url(#ecoGlow)" className="eco-bg-glow" />

        {/* Decorative orbital rings (visual only) */}
        <g className="orbit-ring orbit-outer">
          <circle cx={CX} cy={CY} r="172" fill="none" stroke="rgba(124,58,237,.14)" strokeWidth="1" />
        </g>
        <g className="orbit-ring orbit-mid">
          <circle cx={CX} cy={CY} r="122" fill="none" stroke="rgba(124,58,237,.22)" strokeWidth="1.5" strokeDasharray="8 12" />
        </g>
        <g className="orbit-ring orbit-inner">
          <circle cx={CX} cy={CY} r="72" fill="none" stroke="rgba(6,182,212,.28)" strokeWidth="1" strokeDasharray="4 8" />
        </g>

        {/* OUTER RING — rotates clockwise, 50s */}
        <g className="ring-group ring-outer">
          {outer.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const x = CX + Math.cos(rad) * n.r;
            const y = CY + Math.sin(rad) * n.r;
            return (
              <g key={n.id}>
                <line
                  x1={CX}
                  y1={CY}
                  x2={x}
                  y2={y}
                  stroke={n.accent}
                  strokeWidth="1.5"
                  strokeOpacity=".5"
                  strokeDasharray="6 8"
                  className="spoke-line"
                />
                <g transform={`translate(${x}, ${y})`}>
                  <g className="node-counter node-outer-counter">
                    <circle r="26" fill={`${n.accent}15`} stroke={n.accent} strokeWidth="2" filter="url(#nodeGlow)" />
                    <text
                      y="7"
                      textAnchor="middle"
                      fontSize="22"
                      fontWeight="800"
                      fill={n.accent}
                      style={{ filter: `drop-shadow(0 0 8px ${n.accent})` }}
                    >
                      {n.icon}
                    </text>
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* INNER RING — rotates counter-clockwise, 35s */}
        <g className="ring-group ring-inner">
          {inner.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const x = CX + Math.cos(rad) * n.r;
            const y = CY + Math.sin(rad) * n.r;
            return (
              <g key={n.id}>
                <line
                  x1={CX}
                  y1={CY}
                  x2={x}
                  y2={y}
                  stroke={n.accent}
                  strokeWidth="1.4"
                  strokeOpacity=".6"
                  strokeDasharray="4 6"
                  className="spoke-line"
                />
                <g transform={`translate(${x}, ${y})`}>
                  <g className="node-counter node-inner-counter">
                    <circle r="22" fill={`${n.accent}18`} stroke={n.accent} strokeWidth="1.8" filter="url(#nodeGlow)" />
                    <text
                      y="6"
                      textAnchor="middle"
                      fontSize="20"
                      fontWeight="800"
                      fill={n.accent}
                      style={{ filter: `drop-shadow(0 0 6px ${n.accent})` }}
                    >
                      {n.icon}
                    </text>
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* HERMES CENTER — drawn last to cover spoke origins */}
        <g className="hermes-core" filter="url(#hermesBloom)">
          <circle cx={CX} cy={CY} r="48" fill="none" stroke="rgba(139,92,246,.35)" strokeWidth="1.5" className="hermes-pulse-ring" />
          <circle cx={CX} cy={CY} r="40" fill="none" stroke="rgba(139,92,246,.55)" strokeWidth="2" className="hermes-pulse-ring" style={{ animationDelay: '.7s' }} />
          <circle cx={CX} cy={CY} r="36" fill="url(#hermesGlow)" />
          <circle cx={CX} cy={CY} r="28" fill="rgba(124,58,237,.4)" stroke="#a78bfa" strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r="20" fill="#7c3aed" />
          <circle cx={CX} cy={CY} r="12" fill="white" fillOpacity=".95" />
          <text
            x={CX}
            y={CY + 58}
            textAnchor="middle"
            fontSize="10"
            fill="#c4b5fd"
            fontFamily="'DejaVu Sans Mono','Liberation Mono',monospace"
            letterSpacing="4"
            fontWeight="800"
          >
            HERMES AI
          </text>
          <text
            x={CX}
            y={CY + 72}
            textAnchor="middle"
            fontSize="8"
            fill="#64748b"
            fontFamily="'DejaVu Sans Mono','Liberation Mono',monospace"
            letterSpacing="2.5"
          >
            ORCHESTRATOR
          </text>
        </g>
      </svg>
    </div>
  );
}