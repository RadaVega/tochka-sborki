import { useMemo } from 'react';
import { Icon } from './Icon';

const CX = 200;
const CY = 200;

export function EcosystemMap({ nodes }) {
  const inner = useMemo(() => nodes.filter((n) => n.r <= 100), [nodes]);
  const outer = useMemo(() => nodes.filter((n) => n.r > 100), [nodes]);

  return (
    <div className="eco-map-container" aria-label="Карта экосистемы Точки Сборки">
      <svg viewBox="0 0 400 400" className="eco-map-svg" role="img">
        <defs>
          <radialGradient id="ecoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124,58,237,.6)" />
            <stop offset="50%" stopColor="rgba(124,58,237,.2)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </radialGradient>
          <radialGradient id="hermesGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,.8)" />
            <stop offset="40%" stopColor="rgba(139,92,246,.3)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0)" />
          </radialGradient>
          <filter id="hermesBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={CX} cy={CY} r="195" fill="url(#ecoGlow)" className="eco-bg-glow" />

        <g className="orbit-ring orbit-outer">
          <circle cx={CX} cy={CY} r="175" fill="none" stroke="rgba(124,58,237,.12)" strokeWidth="1" />
        </g>
        <g className="orbit-ring orbit-mid">
          <circle cx={CX} cy={CY} r="125" fill="none" stroke="rgba(124,58,237,.2)" strokeWidth="1.5" strokeDasharray="10 14" />
        </g>
        <g className="orbit-ring orbit-inner">
          <circle cx={CX} cy={CY} r="75" fill="none" stroke="rgba(6,182,212,.3)" strokeWidth="1" strokeDasharray="5 10" />
        </g>

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
                  strokeOpacity=".35"
                  strokeDasharray="8 10"
                  className="spoke-line"
                />
                <g transform={`translate(${x}, ${y})`}>
                  <g className="node-counter node-outer-counter">
                    <circle r="28" fill={`${n.accent}15`} stroke={n.accent} strokeWidth="2" filter="url(#nodeGlow)" />
                    <foreignObject x="-14" y="-14" width="28" height="28">
                      <div className="node-icon-wrap">
                        <Icon name={n.icon} size={20} weight="duotone" />
                      </div>
                    </foreignObject>
                  </g>
                </g>
              </g>
            );
          })}
        </g>

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
                  strokeOpacity=".45"
                  strokeDasharray="6 8"
                  className="spoke-line"
                />
                <g transform={`translate(${x}, ${y})`}>
                  <g className="node-counter node-inner-counter">
                    <circle r="24" fill={`${n.accent}18`} stroke={n.accent} strokeWidth="1.8" filter="url(#nodeGlow)" />
                    <foreignObject x="-12" y="-12" width="24" height="24">
                      <div className="node-icon-wrap">
                        <Icon name={n.icon} size={18} weight="duotone" />
                      </div>
                    </foreignObject>
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        <g className="hermes-core" filter="url(#hermesBloom)">
          <circle cx={CX} cy={CY} r="65" fill="none" stroke="rgba(139,92,246,.25)" strokeWidth="1" className="hermes-pulse-ring" />
          <circle cx={CX} cy={CY} r="55" fill="none" stroke="rgba(139,92,246,.45)" strokeWidth="2" className="hermes-pulse-ring" style={{ animationDelay: '.8s' }} />
          <circle cx={CX} cy={CY} r="48" fill="none" stroke="rgba(139,92,246,.65)" strokeWidth="2.5" className="hermes-pulse-ring" style={{ animationDelay: '1.6s' }} />
          <circle cx={CX} cy={CY} r="45" fill="url(#hermesGlow)" />
          <circle cx={CX} cy={CY} r="36" fill="rgba(124,58,237,.5)" stroke="#a78bfa" strokeWidth="3" />
          <circle cx={CX} cy={CY} r="26" fill="#7c3aed" />
          <circle cx={CX} cy={CY} r="16" fill="white" fillOpacity=".95" />
          <foreignObject x="-18" y="-18" width="36" height="36">
            <div className="hermes-icon-wrap">
              <Icon name="Brain" size={32} weight="fill" />
            </div>
          </foreignObject>
          <text x={CX} y={CY + 72} textAnchor="middle" fontSize="11" fill="#c4b5fd" fontFamily="monospace" letterSpacing="5" fontWeight="800">HERMES AI</text>
          <text x={CX} y={CY + 88} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace" letterSpacing="3">ORCHESTRATOR</text>
        </g>
      </svg>
    </div>
  );
}