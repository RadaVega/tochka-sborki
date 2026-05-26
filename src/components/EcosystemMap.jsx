import { useMemo } from 'react';
import { Icon } from './Icon';

const CX = 200;
const CY = 200;

export function EcosystemMap({ nodes }) {
  const inner = useMemo(() => nodes.filter((n) => n.r <= 100), [nodes]);
  const outer = useMemo(() => nodes.filter((n) => n.r > 100), [nodes]);

  return (
    <div className="eco-map-wrap" aria-label="Карта экосистемы Точки Сборки">
      <svg viewBox="0 0 400 400" role="img" className="eco-map-svg">
        <defs>
          <radialGradient id="ecoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124,58,237,.5)" />
            <stop offset="60%" stopColor="rgba(124,58,237,.15)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </radialGradient>
          <radialGradient id="hermesGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,.7)" />
            <stop offset="50%" stopColor="rgba(139,92,246,.2)" />
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

        {/* Decorative orbital rings */}
        <g className="orbit-ring orbit-outer">
          <circle cx={CX} cy={CY} r="170" fill="none" stroke="rgba(124,58,237,.12)" strokeWidth="1" />
        </g>
        <g className="orbit-ring orbit-mid">
          <circle cx={CX} cy={CY} r="120" fill="none" stroke="rgba(124,58,237,.2)" strokeWidth="1.5" strokeDasharray="8 12" />
        </g>
        <g className="orbit-ring orbit-inner">
          <circle cx={CX} cy={CY} r="70" fill="none" stroke="rgba(6,182,212,.25)" strokeWidth="1" strokeDasharray="4 8" />
        </g>

        {/* OUTER RING — rotates clockwise, 60s */}
        <g className="ring-group ring-outer">
          {outer.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const x = CX + Math.cos(rad) * n.r;
            const y = CY + Math.sin(rad) * n.r;
            return (
              <g key={n.id}>
                <line
                  x1={CX + Math.cos(rad) * 45}
                  y1={CY + Math.sin(rad) * 45}
                  x2={x - Math.cos(rad) * 24}
                  y2={y - Math.sin(rad) * 24}
                  stroke={n.accent}
                  strokeWidth="1.2"
                  strokeOpacity=".4"
                  strokeDasharray="6 8"
                  className="spoke-line"
                />
                <g transform={`translate(${x}, ${y})`}>
                  <g className="node-counter node-outer-counter">
                    <circle r="24" fill={`${n.accent}15`} stroke={n.accent} strokeWidth="2" filter="url(#nodeGlow)" />
                    <Icon name={n.icon} size={18} color={n.accent} />
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* INNER RING — rotates counter-clockwise, 40s */}
        <g className="ring-group ring-inner">
          {inner.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const x = CX + Math.cos(rad) * n.r;
            const y = CY + Math.sin(rad) * n.r;
            return (
              <g key={n.id}>
                <line
                  x1={CX + Math.cos(rad) * 45}
                  y1={CY + Math.sin(rad) * 45}
                  x2={x - Math.cos(rad) * 20}
                  y2={y - Math.sin(rad) * 20}
                  stroke={n.accent}
                  strokeWidth="1.2"
                  strokeOpacity=".5"
                  strokeDasharray="4 6"
                  className="spoke-line"
                />
                <g transform={`translate(${x}, ${y})`}>
                  <g className="node-counter node-inner-counter">
                    <circle r="20" fill={`${n.accent}18`} stroke={n.accent} strokeWidth="1.8" filter="url(#nodeGlow)" />
                    <Icon name={n.icon} size={16} color={n.accent} />
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* HERMES CENTER */}
        <g className="hermes-core" filter="url(#hermesBloom)">
          <circle cx={CX} cy={CY} r="55" fill="none" stroke="rgba(139,92,246,.3)" strokeWidth="1" className="hermes-pulse-ring" />
          <circle cx={CX} cy={CY} r="48" fill="none" stroke="rgba(139,92,246,.5)" strokeWidth="1.5" className="hermes-pulse-ring" style={{ animationDelay: '.6s' }} />
          <circle cx={CX} cy={CY} r="42" fill="url(#hermesGlow)" />
          <circle cx={CX} cy={CY} r="34" fill="rgba(124,58,237,.4)" stroke="#8b5cf6" strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r="24" fill="#7c3aed" />
          <circle cx={CX} cy={CY} r="14" fill="white" fillOpacity=".95" />
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