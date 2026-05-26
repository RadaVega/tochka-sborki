import { Icon } from './Icon';

export function EcosystemMap({ nodes = [] }) {
  const centerX = 200;
  const centerY = 200;

  // 6 static positions around the hub
  const positions = [
    { angle: -90,  dist: 130 },
    { angle: -30,  dist: 130 },
    { angle: 30,   dist: 130 },
    { angle: 90,   dist: 130 },
    { angle: 150,  dist: 130 },
    { angle: -150, dist: 130 },
  ];

  const toRad = (deg) => (deg * Math.PI) / 180;

  const getPos = (angle, dist) => ({
    x: centerX + dist * Math.cos(toRad(angle)),
    y: centerY + dist * Math.sin(toRad(angle)),
  });

  return (
    <div className="eco-map-container">
      <svg className="eco-map-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124,58,237,0.35)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </radialGradient>
        </defs>

        {/* Soft background glow */}
        <circle cx={centerX} cy={centerY} r="170" fill="url(#hubGlow)" opacity="0.5" />

        {/* Static orbital rings */}
        <circle cx={centerX} cy={centerY} r="130" fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="1" strokeDasharray="3 6" />
        <circle cx={centerX} cy={centerY} r="80" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="1" />

        {/* Connection lines */}
        {positions.map((pos, i) => {
          const p = getPos(pos.angle, pos.dist);
          return (
            <line
              key={`line-${i}`}
              x1={centerX} y1={centerY}
              x2={p.x} y2={p.y}
              stroke="rgba(124,58,237,0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Node backplates */}
        {positions.map((pos, i) => {
          const p = getPos(pos.angle, pos.dist);
          return (
            <circle
              key={`plate-${i}`}
              cx={p.x} cy={p.y} r="26"
              fill="rgba(6,8,15,0.85)"
              stroke="rgba(124,58,237,0.35)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Center hub */}
        <circle
          cx={centerX} cy={centerY} r="42"
          fill="rgba(6,8,15,0.95)"
          stroke="rgba(124,58,237,0.5)"
          strokeWidth="2"
        />
        <circle
          cx={centerX} cy={centerY} r="52"
          fill="none"
          stroke="rgba(124,58,237,0.15)"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="hub-ring"
        />
      </svg>

      {/* Icon overlays — positioned absolutely so Lucide renders as HTML, not SVG foreignObject */}
      {positions.map((pos, i) => {
        const p = getPos(pos.angle, pos.dist);
        const node = nodes[i];
        return (
          <div
            key={`node-${i}`}
            className="eco-map-node"
            style={{
              left: `${(p.x / 400) * 100}%`,
              top: `${(p.y / 400) * 100}%`,
            }}
          >
            <Icon name={node?.icon || 'Circle'} size={16} color="#a78bfa" strokeWidth={1.5} />
          </div>
        );
      })}

      <div className="eco-map-center">
        <Icon name="Target" size={22} color="#c4b5fd" strokeWidth={1.5} />
        <span>HERMES</span>
      </div>
    </div>
  );
}