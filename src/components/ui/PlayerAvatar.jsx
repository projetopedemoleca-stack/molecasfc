import React from 'react';

// ─── Hash determinístico (mesma seed = mesma aparência) ───────────────────────
function hashCode(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── Paletas ─────────────────────────────────────────────────────────────────
const SKIN_TONES  = ['#FDDBB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'];
const HAIR_COLORS = ['#1a1a1a', '#2d1a0e', '#7a3b1e', '#c9882e', '#d4b483', '#1c3a1c'];

// ─── Jersey por categoria / país ─────────────────────────────────────────────
function getJersey(sticker) {
  if (sticker.category === 'brazil') {
    return { primary: '#15803d', accent: '#fbbf24', num: '#ffffff' };
  }
  const byCountry = {
    US: { primary: '#1d4ed8', accent: '#ef4444',  num: '#fff' },
    DE: { primary: '#1a1a1a', accent: '#ef4444',  num: '#fff' },
    ES: { primary: '#c0392b', accent: '#fbbf24',  num: '#fff' },
    FR: { primary: '#1e3a8a', accent: '#ef4444',  num: '#fff' },
    GB: { primary: '#dc2626', accent: '#ffffff',  num: '#fff' },
    NL: { primary: '#ea6b0b', accent: '#1d4ed8',  num: '#fff' },
    SE: { primary: '#1d4ed8', accent: '#fbbf24',  num: '#fff' },
    JP: { primary: '#1d4ed8', accent: '#ef4444',  num: '#fff' },
    AU: { primary: '#16a34a', accent: '#fbbf24',  num: '#1a1a1a' },
    NO: { primary: '#dc2626', accent: '#003087',  num: '#fff' },
    IT: { primary: '#1d4ed8', accent: '#16a34a',  num: '#fff' },
    CN: { primary: '#dc2626', accent: '#fbbf24',  num: '#fff' },
    PT: { primary: '#15803d', accent: '#dc2626',  num: '#fff' },
    AR: { primary: '#60a5fa', accent: '#ffffff',  num: '#1a1a1a' },
    CO: { primary: '#fbbf24', accent: '#dc2626',  num: '#1a1a1a' },
  };
  return byCountry[sticker.country] || { primary: '#7c3aed', accent: '#ec4899', num: '#fff' };
}

// ─── Número por posição ───────────────────────────────────────────────────────
const POS_NUM = {
  'Goleira':    '1',
  'Zagueira':   '4',
  'Lateral':    '2',
  'Meio-campo': '8',
  'Atacante':   '9',
  'Árbitra':    'R',
};

// ─── Estilos de cabelo (4 variações) ─────────────────────────────────────────
function Hair({ style, color, cx, hy }) {
  switch (style) {
    case 0: // coque alto
      return (
        <g>
          <rect x={cx-12} y={hy-10} width={24} height={9} rx={5} fill={color} />
          <ellipse cx={cx} cy={hy-17} rx={8} ry={6} fill={color} />
          <circle cx={cx} cy={hy-21} r={5} fill={color} />
        </g>
      );
    case 1: // cabelo comprido
      return (
        <g>
          <rect x={cx-13} y={hy-10} width={26} height={9} rx={6} fill={color} />
          <rect x={cx-14} y={hy+1} width={6} height={20} rx={3} fill={color} />
          <rect x={cx+8}  y={hy+1} width={6} height={20} rx={3} fill={color} />
        </g>
      );
    case 2: // cabelo curto
      return (
        <rect x={cx-13} y={hy-10} width={26} height={11} rx={7} fill={color} />
      );
    case 3: // rabo de cavalo lateral
      return (
        <g>
          <rect x={cx-13} y={hy-10} width={26} height={9} rx={5} fill={color} />
          <rect x={cx+9}  y={hy-8}  width={5}  height={22} rx={3} fill={color} />
          <ellipse cx={cx+14} cy={hy+14} rx={4} ry={3} fill={color} />
        </g>
      );
    default:
      return null;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function PlayerAvatar({ sticker, size = 56 }) {
  const h       = hashCode(sticker.id || sticker.name || 'x');
  const skin    = SKIN_TONES[h % SKIN_TONES.length];
  const hair    = HAIR_COLORS[(h >> 4) % HAIR_COLORS.length];
  const hairSt  = (h >> 9) % 4;
  const jersey  = getJersey(sticker);
  const posNum  = POS_NUM[sticker.position] || '10';

  const cx  = 30;  // center x
  const hy  = 24;  // head center y
  const by  = 44;  // body top y

  const isMythic    = sticker.rarity === 'mythic';
  const isLegendary = sticker.rarity === 'legendary';
  const isEpic      = sticker.rarity === 'epic';

  return (
    <svg
      viewBox="0 0 60 82"
      width={size}
      height={Math.round(size * 1.37)}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Aura de raridade */}
      {isMythic && (
        <circle cx={cx} cy={41} r={30} fill="rgba(236,72,153,0.18)" />
      )}
      {isLegendary && (
        <circle cx={cx} cy={41} r={28} fill="rgba(251,191,36,0.16)" />
      )}
      {isEpic && (
        <circle cx={cx} cy={41} r={26} fill="rgba(168,85,247,0.13)" />
      )}

      {/* Cabelo (atrás da cabeça) */}
      <Hair style={hairSt} color={hair} cx={cx} hy={hy} />

      {/* Cabeça */}
      <ellipse cx={cx} cy={hy} rx={13} ry={14} fill={skin} />

      {/* Sobrancelhas */}
      <path d={`M ${cx-7} ${hy-6} Q ${cx-4} ${hy-8} ${cx-1} ${hy-6}`}
        stroke={hair} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <path d={`M ${cx+1} ${hy-6} Q ${cx+4} ${hy-8} ${cx+7} ${hy-6}`}
        stroke={hair} strokeWidth={1.2} fill="none" strokeLinecap="round" />

      {/* Olhos */}
      <ellipse cx={cx-4.5} cy={hy-2} rx={2.2} ry={2.5} fill="#1a1a1a" />
      <ellipse cx={cx+4.5} cy={hy-2} rx={2.2} ry={2.5} fill="#1a1a1a" />
      {/* Brilho dos olhos */}
      <circle cx={cx-3.6} cy={hy-3}  r={0.8} fill="white" />
      <circle cx={cx+5.4} cy={hy-3}  r={0.8} fill="white" />

      {/* Sorriso */}
      <path d={`M ${cx-3.5} ${hy+5} Q ${cx} ${hy+8.5} ${cx+3.5} ${hy+5}`}
        stroke="#c97b5a" strokeWidth={1.3} fill="none" strokeLinecap="round" />

      {/* Pescoço */}
      <rect x={cx-4} y={hy+12} width={8} height={6} rx={2} fill={skin} />

      {/* Corpo / Camisa */}
      <path
        d={`M ${cx-14} ${by}
           C ${cx-14} ${by-7} ${cx-6} ${by-9} ${cx} ${by-9}
           C ${cx+6}  ${by-9} ${cx+14} ${by-7} ${cx+14} ${by}
           L ${cx+15} ${by+25} Q ${cx+13} ${by+28} ${cx+9} ${by+28}
           L ${cx-9}  ${by+28} Q ${cx-13} ${by+28} ${cx-15} ${by+25} Z`}
        fill={jersey.primary}
      />

      {/* Faixa vertical da camisa */}
      <path
        d={`M ${cx-4} ${by-9} L ${cx-3} ${by+28} L ${cx+3} ${by+28} L ${cx+4} ${by-9} Z`}
        fill={jersey.accent} opacity={0.55}
      />

      {/* Número da camisa */}
      <text
        x={cx} y={by+19}
        textAnchor="middle"
        fontSize={10}
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill={jersey.num}
      >
        {posNum}
      </text>

      {/* Braços */}
      <rect x={cx-21} y={by+1}  width={8} height={15} rx={4} fill={jersey.primary} />
      <rect x={cx+13} y={by+1}  width={8} height={15} rx={4} fill={jersey.primary} />

      {/* Mãos */}
      <circle cx={cx-17} cy={by+18} r={3.5} fill={skin} />
      <circle cx={cx+17} cy={by+18} r={3.5} fill={skin} />

      {/* Pernas */}
      <rect x={cx-12} y={by+26} width={9} height={15} rx={4} fill="#1f2937" />
      <rect x={cx+3}  y={by+26} width={9} height={15} rx={4} fill="#1f2937" />

      {/* Chuteiras */}
      <ellipse cx={cx-7.5} cy={by+41} rx={7} ry={3.2} fill="#111827" />
      <ellipse cx={cx+7.5} cy={by+41} rx={7} ry={3.2} fill="#111827" />

      {/* Coroa mítica */}
      {isMythic && (
        <g>
          <path
            d={`M ${cx-8} ${hy-13} L ${cx-5} ${hy-19} L ${cx} ${hy-23} L ${cx+5} ${hy-19} L ${cx+8} ${hy-13}`}
            fill="#fbbf24" stroke="#f59e0b" strokeWidth={0.7}
          />
          <circle cx={cx}    cy={hy-23} r={2.2} fill="#ef4444" />
          <circle cx={cx-5}  cy={hy-19} r={1.5} fill="#dc2626" />
          <circle cx={cx+5}  cy={hy-19} r={1.5} fill="#dc2626" />
        </g>
      )}

      {/* Estrela lendária */}
      {isLegendary && !isMythic && (
        <text x={cx} y={hy-13} textAnchor="middle" fontSize={11}>⭐</text>
      )}

      {/* Losango épico */}
      {isEpic && !isLegendary && (
        <text x={cx} y={hy-13} textAnchor="middle" fontSize={9}>💜</text>
      )}
    </svg>
  );
}

// ─── Bandeira oficial via flagcdn.com ─────────────────────────────────────────
const FLAG_MAP = {
  BR: 'br', AR: 'ar', CO: 'co', CL: 'cl', UY: 'uy',
  PY: 'py', EC: 'ec', VE: 've', PE: 'pe', BO: 'bo',
  DE: 'de', US: 'us', GB: 'gb-eng', FR: 'fr', ES: 'es',
  NL: 'nl', SE: 'se', JP: 'jp', AU: 'au', NO: 'no',
  IT: 'it', CN: 'cn', KR: 'kr', PT: 'pt', CH: 'ch',
  CA: 'ca', MX: 'mx', NZ: 'nz', ZA: 'za', NG: 'ng',
  CM: 'cm', GH: 'gh', KE: 'ke', SN: 'sn', EG: 'eg',
  UK: 'gb',
};

export function FlagBadge({ country, size = 48 }) {
  const code = FLAG_MAP[country] || (country ? country.toLowerCase() : null);

  if (!code) {
    return <span style={{ fontSize: size * 0.6 }}>🏳️</span>;
  }

  return (
    <div
      style={{
        width: size,
        height: Math.round(size * 0.67),
        borderRadius: 5,
        overflow: 'hidden',
        border: '1.5px solid rgba(0,0,0,0.15)',
        display: 'inline-block',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
      }}
    >
      <img
        src={`https://flagcdn.com/w${size * 2}/${code}.png`}
        alt={country}
        width={size}
        height={Math.round(size * 0.67)}
        style={{ display: 'block', objectFit: 'cover' }}
        onError={e => {
          e.target.parentElement.innerHTML = `<span style="font-size:${Math.round(size * 0.55)}px;display:flex;align-items:center;justify-content:center;height:100%">🏳️</span>`;
        }}
      />
    </div>
  );
}
