import { useMemo } from 'react';

const CX = 160;
const CY = 160;

export function EcosystemMap({ nodes }) {
  const innerNodes = useMemo(() => nodes.filter((n) => n.r === 92), [nodes]);

  return (
    <div className="eco-map" aria-label="Карта экосистемы Точки Сборки">
      <svg viewBox="0 0 320 320" role="img">
        <defs>
          <radialGradient id="ecoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124,58,237,.35)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
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
        <circle cx={CX} cy={CY} r="148" fill="url(#ecoGlow)" />

        {/* Orbital rings */}
        <circle cx={CX} cy={CY} r="132" fill="none" stroke="rgba(124,58,237,.1)" strokeWidth="1" />
        <circle
          cx={CX}
          cy={CY}
          r="92"
          fill="none"
          stroke="rgba(124,58,237,.15)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle cx={CX} cy={CY} r="52" fill="none" stroke="rgba(8,145,178,.18)" strokeWidth="1" />

        {/* Spokes */}
        {nodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          return (
            <line
              key={`spoke-${n.id}`}
              x1={CX + Math.cos(rad) * 30}
              y1={CY + Math.sin(rad) * 30}
              x2={CX + Math.cos(rad) * (n.r - 14)}
              y2={CY + Math.sin(rad) * (n.r - 14)}
              stroke={n.accent}
              strokeWidth="1"
              strokeOpacity=".4"
              strokeDasharray="3 5"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = CX + Math.cos(rad) * n.r;
          const y = CY + Math.sin(rad) * n.r;
          return (
            <g key={`node-${n.id}`} filter="url(#nodeGlow)">
              <circle
                cx={x}
                cy={y}
                r="16"
                fill={`${n.accent}22`}
                stroke={n.accent}
                strokeWidth="1.2"
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize="13"
                role="img"
                aria-label={n.label}
              >
                {n.icon}
              </text>
            </g>
          );
        })}

        {/* Center: HERMES */}
        <circle cx={CX} cy={CY} r="28" fill="rgba(124,58,237,.22)" stroke="#7c3aed" strokeWidth="1.8" />
        <circle cx={CX} cy={CY} r="18" fill="#7c3aed" />
        <circle cx={CX} cy={CY} r="9" fill="white" fillOpacity=".95" />
        <text
          x={CX}
          y={CY + 42}
          textAnchor="middle"
          fontSize="8"
          fill="#a78bfa"
          fontFamily="'DejaVu Sans Mono','Liberation Mono',monospace"
          letterSpacing="2"
        >
          HERMES AI
        </text>
      </svg>
    </div>
  );
}