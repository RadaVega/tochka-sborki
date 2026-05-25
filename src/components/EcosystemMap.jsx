import { useMemo } from 'react';
import { Icon } from './Icon';

const CX = 200;
const CY = 200;

export function EcosystemMap({ nodes }) {
  const inner = useMemo(() => nodes.filter((n) => n.r <= 100), [nodes]);
  const outer = useMemo(() => nodes.filter((n) => n.r > 100), [nodes]);
  const allNodes = [...inner, ...outer];

  return (
    <div className="eco-map-container" aria-label="Карта экосистемы Точки Сборки">
      {/* SVG Background: glow, rings, spokes, HERMES */}
      <svg viewBox="0 0 400 400" className="eco-map-svg" role="img">
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
          <filter id="hermesBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={CX} cy={CY} r="190" fill="url(#ecoGlow)" className="eco-bg-glow" />

        {/* Decorative rings — slow, elegant, opposite directions */}
        <g className="orbit-ring orbit-outer">
          <circle cx={CX} cy={CY} r="172" fill="none" stroke="rgba(124,58,237,.14)" strokeWidth="1" />
        </g>
        <g className="orbit-ring orbit-mid">
          <circle cx={CX} cy={CY} r="122" fill="none" stroke="rgba(124,58,237,.22)" strokeWidth="1.5" strokeDasharray="8 12" />
        </g>
        <g className="orbit-ring orbit-inner">
          <circle cx={CX} cy={CY} r="72" fill="none" stroke="rgba(6,182,212,.28)" strokeWidth="1" strokeDasharray="4 8" />
        </g>

        {/* Spokes — static geometry, flowing data */}
        {allNodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const x2 = CX + Math.cos(rad) * (n.r - 28);
          const y2 = CY + Math.sin(rad) * (n.r - 28);
          return (
            <line
              key={`spoke-${n.id}`}
              x1={CX + Math.cos(rad) * 42}
              y1={CY + Math.sin(rad) * 42}
              x2={x2}
              y2={y2}
              stroke={n.accent}
              strokeWidth="1.5"
              strokeOpacity=".4"
              strokeDasharray="6 8"
              className="spoke-line"
            />
          );
        })}

        {/* HERMES CORE */}
        <g className="hermes-core" filter="url(#hermesBloom)">
          <circle cx={CX} cy={CY} r="48" fill="none" stroke="rgba(139,92,246,.35)" strokeWidth="1.5" className="hermes-pulse-ring" />
          <circle cx={CX} cy={CY} r="40" fill="none" stroke="rgba(139,92,246,.55)" strokeWidth="2" className="hermes-pulse-ring" style={{ animationDelay: '.7s' }} />
          <circle cx={CX} cy={CY} r="36" fill="url(#hermesGlow)" />
          <circle cx={CX} cy={CY} r="28" fill="rgba(124,58,237,.4)" stroke="#a78bfa" strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r="20" fill="#7c3aed" />
          <circle cx={CX} cy={CY} r="12" fill="white" fillOpacity=".95" />
          <text x={CX} y={CY + 60} textAnchor="middle" fontSize="10" fill="#c4b5fd" fontFamily="monospace" letterSpacing="4" fontWeight="800">HERMES AI</text>
          <text x={CX} y={CY + 74} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace" letterSpacing="2.5">ORCHESTRATOR</text>
        </g>
      </svg>

      {/* HTML Overlay Nodes — fixed constellation, gentle breathing */}
      {allNodes.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const x = CX + Math.cos(rad) * n.r;
        const y = CY + Math.sin(rad) * n.r;
        const isOuter = n.r > 100;
        return (
          <div
            key={n.id}
            className={`eco-node eco-node-${isOuter ? 'outer' : 'inner'} node-delay-${i}`}
            style={{
              left: `${(x / 400) * 100}%`,
              top: `${(y / 400) * 100}%`,
              '--node-accent': n.accent,
            }}
          >
            <div className="eco-node-ring">
              <Icon name={n.icon} size={isOuter ? 22 : 18} strokeWidth={2} className="eco-node-svg" />
            </div>
            <span className="eco-node-label">{n.label}</span>
          </div>
        );
      })}
    </div>
  );
}