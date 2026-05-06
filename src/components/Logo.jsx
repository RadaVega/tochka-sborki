import { brand } from '../data/content';

export function Logo({ compact = false }) {
  return (
    <div className="logo-mark" aria-label="Логотип Точка Сборки">
      <svg width={compact ? 30 : 40} height={compact ? 30 : 40} viewBox="0 0 100 100" fill="none" role="img" aria-label="Точка Сборки">
        <title>Точка Сборки</title>
        <circle cx="50" cy="50" r="46" stroke="rgba(124,58,237,.3)" strokeWidth="2" />
        <circle cx="50" cy="50" r="30" stroke="rgba(124,58,237,.12)" strokeWidth="1" strokeDasharray="3 7" />
        <line x1="50" y1="8" x2="50" y2="34" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
        <line x1="92" y1="50" x2="66" y2="50" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="92" x2="50" y2="66" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
        <line x1="8" y1="50" x2="34" y2="50" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
        <line x1="79" y1="21" x2="62" y2="38" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" opacity=".9" />
        <line x1="79" y1="79" x2="62" y2="62" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" opacity=".9" />
        <line x1="21" y1="79" x2="38" y2="62" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity=".9" />
        <line x1="21" y1="21" x2="38" y2="38" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity=".9" />
        <circle cx="50" cy="50" r="13" fill="rgba(124,58,237,.22)" stroke="#7c3aed" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="7" fill="#7c3aed" />
        <circle cx="50" cy="50" r="3.5" fill="white" opacity=".95" />
      </svg>
      <div className="logo-copy">
        <span className="logo-name">{compact ? brand.name : brand.fullName}</span>
        <span className="logo-sub">{brand.english} • {brand.slogan}</span>
      </div>
    </div>
  );
}
