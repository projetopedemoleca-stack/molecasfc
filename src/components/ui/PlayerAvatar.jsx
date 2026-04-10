import React from 'react';

// ─── Hash determinístico ──────────────────────────────────────────────────────
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── Paletas ──────────────────────────────────────────────────────────────────
const SKIN   = ['#FDDBB4','#F1C27D','#E0AC69','#C68642','#8D5524'];
const HAIR   = ['#1a1a1a','#2d1a0e','#7a3b1e','#c9882e','#d4b483','#1c3a1c'];
const LIPS   = ['#c97b5a','#d4756b','#b5604e','#e08070','#a0504a'];

// ─── Cor de fundo por categoria / país ───────────────────────────────────────
function getBg(sticker) {
  if (sticker.category === 'brazil') return { a: '#15803d', b: '#fbbf24' };
  if (sticker.category === 'skills') return { a: '#7c3aed', b: '#a855f7' };
  if (sticker.category === 'icons')  return { a: '#0f172a', b: '#334155' };
  const MAP = {
    US:{ a:'#1d4ed8', b:'#ef4444' }, DE:{ a:'#1a1a1a', b:'#ef4444' },
    ES:{ a:'#c0392b', b:'#fbbf24' }, FR:{ a:'#1e3a8a', b:'#ef4444' },
    GB:{ a:'#dc2626', b:'#ffffff' }, NL:{ a:'#ea6b0b', b:'#1d4ed8' },
    SE:{ a:'#1d4ed8', b:'#fbbf24' }, JP:{ a:'#1d4ed8', b:'#ef4444' },
    AU:{ a:'#16a34a', b:'#fbbf24' }, NO:{ a:'#dc2626', b:'#003087' },
    IT:{ a:'#1d4ed8', b:'#16a34a' }, CN:{ a:'#dc2626', b:'#fbbf24' },
    PT:{ a:'#15803d', b:'#dc2626' }, AR:{ a:'#60a5fa', b:'#ffffff' },
    CO:{ a:'#fbbf24', b:'#dc2626' },
  };
  return MAP[sticker.country] || { a: '#6d28d9', b: '#ec4899' };
}

// ─── Estilos de cabelo ────────────────────────────────────────────────────────
// cx=32, hy=28 (centro do rosto)
function Hair({ style, color }) {
  const cx = 32, hy = 28;
  switch (style) {
    case 0: // coque alto
      return (
        <g>
          <ellipse cx={cx} cy={hy - 17} rx={11} ry={7} fill={color} />
          <circle  cx={cx} cy={hy - 22} r={7}          fill={color} />
          <rect    x={cx-14} y={hy-12} width={28} height={9} rx={6} fill={color} />
        </g>
      );
    case 1: // comprido
      return (
        <g>
          <rect x={cx-14} y={hy-12} width={28} height={10} rx={7} fill={color} />
          <rect x={cx-15} y={hy+2}  width={7}  height={22} rx={4} fill={color} />
          <rect x={cx+8}  y={hy+2}  width={7}  height={22} rx={4} fill={color} />
        </g>
      );
    case 2: // curto
      return (
        <rect x={cx-14} y={hy-12} width={28} height={12} rx={8} fill={color} />
      );
    case 3: // rabo de cavalo
      return (
        <g>
          <rect x={cx-14} y={hy-12} width={28} height={10} rx={7} fill={color} />
          <rect x={cx+10} y={hy-8}  width={6}  height={24} rx={3} fill={color} />
          <ellipse cx={cx+15} cy={hy+16} rx={5} ry={4} fill={color} />
        </g>
      );
    case 4: // franja longa
      return (
        <g>
          <rect x={cx-14} y={hy-12} width={28} height={13} rx={7} fill={color} />
          <rect x={cx-14} y={hy+3}  width={6}  height={20} rx={3} fill={color} />
          <rect x={cx+8}  y={hy+3}  width={6}  height={20} rx={3} fill={color} />
          {/* franja */}
          <rect x={cx-10} y={hy-10} width={10} height={8} rx={4} fill={color} />
        </g>
      );
    default:
      return null;
  }
}

// ─── Avatar: só rosto ─────────────────────────────────────────────────────────
export function PlayerAvatar({ sticker, size = 56 }) {
  const h      = hash(sticker.id || sticker.name || 'x');
  const skin   = SKIN[h % SKIN.length];
  const hair   = HAIR[(h >> 4) % HAIR.length];
  const lip    = LIPS[(h >> 8) % LIPS.length];
  const hStyle = (h >> 12) % 5;
  const bg     = getBg(sticker);

  const isMythic    = sticker.rarity === 'mythic';
  const isLegendary = sticker.rarity === 'legendary';
  const isEpic      = sticker.rarity === 'epic';
  const isRare      = sticker.rarity === 'rare';

  // Pequeno detalhe: brinco ou fita
  const hasEarring = (h >> 16) % 3 === 0;
  const hasBand    = (h >> 20) % 4 === 0;

  const cx = 32, hy = 28;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ display: 'block', borderRadius: '50%', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`bg_${sticker.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor={bg.a} />
          <stop offset="100%" stopColor={bg.b} />
        </radialGradient>
        <clipPath id={`clip_${sticker.id}`}>
          <circle cx={32} cy={32} r={31} />
        </clipPath>
      </defs>

      {/* Fundo circular */}
      <circle cx={32} cy={32} r={32} fill={`url(#bg_${sticker.id})`} />

      {/* Anel de raridade */}
      {isMythic    && <circle cx={32} cy={32} r={31} fill="none" stroke="#f9a8d4" strokeWidth={2.5} />}
      {isLegendary && <circle cx={32} cy={32} r={31} fill="none" stroke="#fbbf24" strokeWidth={2}   />}
      {isEpic      && <circle cx={32} cy={32} r={31} fill="none" stroke="#a78bfa" strokeWidth={2}   />}
      {isRare      && <circle cx={32} cy={32} r={31} fill="none" stroke="#60a5fa" strokeWidth={1.5} />}

      <g clipPath={`url(#clip_${sticker.id})`}>
        {/* Ombros / pescoço (base) */}
        <ellipse cx={cx} cy={74} rx={26} ry={18} fill={bg.a} opacity={0.85} />
        <rect    x={cx-7} y={56} width={14} height={18} rx={5} fill={skin} />

        {/* Cabelo (atrás) */}
        <Hair style={hStyle} color={hair} />

        {/* Rosto */}
        <ellipse cx={cx} cy={hy} rx={15} ry={17} fill={skin} />

        {/* Fita de cabeça */}
        {hasBand && (
          <rect x={cx-15} y={hy-13} width={30} height={5} rx={2.5}
            fill={bg.b} opacity={0.75} />
        )}

        {/* Sobrancelhas */}
        <path d={`M ${cx-9} ${hy-8} Q ${cx-5} ${hy-11} ${cx-1} ${hy-8}`}
          stroke={hair} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <path d={`M ${cx+1} ${hy-8} Q ${cx+5} ${hy-11} ${cx+9} ${hy-8}`}
          stroke={hair} strokeWidth={1.4} fill="none" strokeLinecap="round" />

        {/* Olhos */}
        <ellipse cx={cx-5.5} cy={hy-3} rx={3}   ry={3.5} fill="#1a1a1a" />
        <ellipse cx={cx+5.5} cy={hy-3} rx={3}   ry={3.5} fill="#1a1a1a" />
        {/* íris colorida */}
        <circle  cx={cx-5.5} cy={hy-3} r={1.5}  fill="#5b9bd5" opacity={0.6} />
        <circle  cx={cx+5.5} cy={hy-3} r={1.5}  fill="#5b9bd5" opacity={0.6} />
        {/* brilho */}
        <circle  cx={cx-4.3} cy={hy-4.5} r={0.9} fill="white" />
        <circle  cx={cx+6.7} cy={hy-4.5} r={0.9} fill="white" />
        {/* cílios */}
        <path d={`M ${cx-8.5} ${hy-5} Q ${cx-7} ${hy-7} ${cx-5.5} ${hy-6.5}`}
          stroke="#1a1a1a" strokeWidth={1} fill="none" strokeLinecap="round" />
        <path d={`M ${cx+2.5} ${hy-5} Q ${cx+4} ${hy-7} ${cx+5.5} ${hy-6.5}`}
          stroke="#1a1a1a" strokeWidth={1} fill="none" strokeLinecap="round" />

        {/* Nariz */}
        <path d={`M ${cx} ${hy+2} Q ${cx+2} ${hy+6} ${cx} ${hy+8}`}
          stroke={lip} strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.6} />

        {/* Boca / sorriso */}
        <path d={`M ${cx-5} ${hy+11} Q ${cx} ${hy+16} ${cx+5} ${hy+11}`}
          stroke={lip} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {/* lábio superior leve */}
        <path d={`M ${cx-4} ${hy+11} Q ${cx-1} ${hy+9} ${cx} ${hy+10} Q ${cx+1} ${hy+9} ${cx+4} ${hy+11}`}
          stroke={lip} strokeWidth={0.8} fill="none" opacity={0.5} />

        {/* Bochecha blush */}
        <ellipse cx={cx-10} cy={hy+7} rx={4} ry={2.5} fill="#f9a8a8" opacity={0.35} />
        <ellipse cx={cx+10} cy={hy+7} rx={4} ry={2.5} fill="#f9a8a8" opacity={0.35} />

        {/* Brinco */}
        {hasEarring && (
          <g>
            <circle cx={cx-15} cy={hy+4} r={2} fill={bg.b} stroke="white" strokeWidth={0.7} />
            <circle cx={cx+15} cy={hy+4} r={2} fill={bg.b} stroke="white" strokeWidth={0.7} />
          </g>
        )}
      </g>

      {/* Coroa mítica (sobre o clip) */}
      {isMythic && (
        <g>
          <path d={`M ${cx-9} ${2} L ${cx-6} ${-4} L ${cx} ${-8} L ${cx+6} ${-4} L ${cx+9} ${2}`}
            fill="#fbbf24" stroke="#f59e0b" strokeWidth={0.8} />
          <circle cx={cx}    cy={-8} r={2.5} fill="#ef4444" />
          <circle cx={cx-6}  cy={-4} r={1.8} fill="#ef4444" />
          <circle cx={cx+6}  cy={-4} r={1.8} fill="#ef4444" />
        </g>
      )}

      {/* Estrela lendária */}
      {isLegendary && !isMythic && (
        <text x={cx+18} y={12} textAnchor="middle" fontSize={13}>⭐</text>
      )}
    </svg>
  );
}

// ─── Bandeira oficial via flagcdn.com ─────────────────────────────────────────
const FLAG_MAP = {
  BR:'br', AR:'ar', CO:'co', CL:'cl', UY:'uy', PY:'py', EC:'ec',
  VE:'ve', PE:'pe', BO:'bo', DE:'de', US:'us', GB:'gb-eng', FR:'fr',
  ES:'es', NL:'nl', SE:'se', JP:'jp', AU:'au', NO:'no', IT:'it',
  CN:'cn', KR:'kr', PT:'pt', CH:'ch', CA:'ca', MX:'mx', NZ:'nz',
  ZA:'za', NG:'ng', CM:'cm', GH:'gh', KE:'ke', SN:'sn', EG:'eg',
  DK:'dk', AT:'at', BE:'be', IE:'ie', RU:'ru', PL:'pl', PH:'ph',
  TH:'th', VN:'vn', IN:'in', TW:'tw', ZM:'zm', CI:'ci', TN:'tn',
  DZ:'dz', MA:'ma', UK:'gb',
};

export function FlagBadge({ country, size = 48 }) {
  const code = FLAG_MAP[country] || (country ? country.toLowerCase() : null);
  if (!code) return <span style={{ fontSize: size * 0.6 }}>🏳️</span>;

  return (
    <div style={{
      width: size, height: Math.round(size * 0.67),
      borderRadius: 5, overflow: 'hidden',
      border: '1.5px solid rgba(0,0,0,0.15)',
      display: 'inline-block',
      boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
    }}>
      <img
        src={`https://flagcdn.com/w${size * 2}/${code}.png`}
        alt={country}
        width={size}
        height={Math.round(size * 0.67)}
        style={{ display: 'block', objectFit: 'cover' }}
        onError={e => {
          e.target.parentElement.innerHTML =
            `<span style="font-size:${Math.round(size*0.55)}px;display:flex;align-items:center;justify-content:center;height:100%">🏳️</span>`;
        }}
      />
    </div>
  );
}
