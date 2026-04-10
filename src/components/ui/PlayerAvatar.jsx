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

// ─── Bandeiras SVG com cores reais ───────────────────────────────────────────
function FlagSVG({ country, width, height }) {
  const r = height / 3; // altura de cada faixa horizontal
  const flags = {
    BR: ( // Verde, amarelo losango, azul círculo
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#009C3B"/>
        <polygon points="1.5,0.15 2.85,1 1.5,1.85 0.15,1" fill="#FFDF00"/>
        <circle cx="1.5" cy="1" r="0.55" fill="#002776"/>
        <line x1="0.97" y1="0.72" x2="2.03" y2="1.28" stroke="white" strokeWidth="0.07"/>
      </svg>
    ),
    AR: ( // Azul celeste, branco, azul celeste + sol
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#74ACDF"/>
        <rect y="0.67" width="3" height="0.66" fill="white"/>
        <circle cx="1.5" cy="1" r="0.22" fill="#F6B40E"/>
      </svg>
    ),
    US: ( // Barras vermelhas e brancas + azul com estrelas
      <svg width={width} height={height} viewBox="0 0 3 2">
        {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
          <rect key={i} x="0" y={i*2/13} width="3" height={2/13} fill={i%2===0 ? '#B22234' : 'white'}/>
        ))}
        <rect width="1.2" height={7*2/13} fill="#3C3B6E"/>
      </svg>
    ),
    DE: ( // Preto, vermelho, dourado
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#FFCE00"/>
        <rect width="3" height={r*2} fill="#000000"/>
        <rect y={r} width="3" height={r} fill="#DD0000"/>
      </svg>
    ),
    ES: ( // Vermelho, amarelo, vermelho
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#AA151B"/>
        <rect y="0.5" width="3" height="1" fill="#F1BF00"/>
      </svg>
    ),
    FR: ( // Azul, branco, vermelho vertical
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#EF4135"/>
        <rect width="2" height="2" fill="white"/>
        <rect width="1" height="2" fill="#002395"/>
      </svg>
    ),
    GB: ( // Vermelho e branco (Cruz de Santo André + Cruz de São Jorge)
      <svg width={width} height={height} viewBox="0 0 6 3">
        <rect width="6" height="3" fill="#012169"/>
        <path d="M0,0 L6,3 M6,0 L0,3" stroke="white" strokeWidth="0.6"/>
        <path d="M0,0 L6,3 M6,0 L0,3" stroke="#C8102E" strokeWidth="0.4"/>
        <rect x="2.5" width="1" height="3" fill="white"/>
        <rect y="1" width="6" height="1" fill="white"/>
        <rect x="2.67" width="0.67" height="3" fill="#C8102E"/>
        <rect y="1.17" width="6" height="0.67" fill="#C8102E"/>
      </svg>
    ),
    NL: ( // Vermelho, branco, azul
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#21468B"/>
        <rect width="3" height={r*2} fill="#AE1C28"/>
        <rect y={r} width="3" height={r} fill="white"/>
      </svg>
    ),
    SE: ( // Azul com cruz amarela
      <svg width={width} height={height} viewBox="0 0 8 5">
        <rect width="8" height="5" fill="#006AA7"/>
        <rect x="2" width="1.5" height="5" fill="#FECC02"/>
        <rect y="2" width="8" height="1.5" fill="#FECC02"/>
      </svg>
    ),
    JP: ( // Branco com círculo vermelho
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="white"/>
        <circle cx="1.5" cy="1" r="0.6" fill="#BC002D"/>
      </svg>
    ),
    AU: ( // Azul com Union Jack + estrelas
      <svg width={width} height={height} viewBox="0 0 6 3">
        <rect width="6" height="3" fill="#00008B"/>
        <rect x="0" width="3" height="1.5" fill="#012169"/>
        <path d="M0,0 L3,1.5 M3,0 L0,1.5" stroke="white" strokeWidth="0.4"/>
        <path d="M0,0 L3,1.5 M3,0 L0,1.5" stroke="#C8102E" strokeWidth="0.25"/>
        <rect x="1.25" width="0.5" height="1.5" fill="white"/>
        <rect y="0.5" x="0" width="3" height="0.5" fill="white"/>
        <rect x="1.33" width="0.33" height="1.5" fill="#C8102E"/>
        <rect y="0.58" width="3" height="0.33" fill="#C8102E"/>
        <polygon points="4.5,0.3 4.65,0.75 5.1,0.75 4.72,1 4.88,1.45 4.5,1.2 4.12,1.45 4.28,1 3.9,0.75 4.35,0.75" fill="white" transform="scale(0.5) translate(4,0)"/>
      </svg>
    ),
    IT: ( // Verde, branco, vermelho vertical
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#CE2B37"/>
        <rect width="2" height="2" fill="white"/>
        <rect width="1" height="2" fill="#009246"/>
      </svg>
    ),
    PT: ( // Verde e vermelho + escudo
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#FF0000"/>
        <rect width="1.2" height="2" fill="#006600"/>
        <circle cx="1.2" cy="1" r="0.32" fill="#FFFF00"/>
      </svg>
    ),
    NO: ( // Vermelho, cruz branca e azul
      <svg width={width} height={height} viewBox="0 0 22 16">
        <rect width="22" height="16" fill="#EF2B2D"/>
        <rect x="6" width="4" height="16" fill="white"/>
        <rect y="6" width="22" height="4" fill="white"/>
        <rect x="7" width="2" height="16" fill="#002868"/>
        <rect y="7" width="22" height="2" fill="#002868"/>
      </svg>
    ),
    CN: ( // Vermelho com estrelas amarelas
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#DE2910"/>
        <polygon points="0.4,0.2 0.5,0.5 0.2,0.3 0.6,0.3 0.3,0.5" fill="#FFDE00"/>
        <polygon points="0.8,0.1 0.85,0.25 0.7,0.15 0.9,0.15 0.75,0.25" fill="#FFDE00"/>
        <polygon points="0.95,0.28 1,0.43 0.85,0.33 1.05,0.33 0.9,0.43" fill="#FFDE00"/>
        <polygon points="0.95,0.55 1,0.7 0.85,0.6 1.05,0.6 0.9,0.7" fill="#FFDE00"/>
        <polygon points="0.8,0.75 0.85,0.9 0.7,0.8 0.9,0.8 0.75,0.9" fill="#FFDE00"/>
      </svg>
    ),
    KR: ( // Branco com taeguk e trigramas
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="white"/>
        <circle cx="1.5" cy="1" r="0.45" fill="#CD2E3A"/>
        <path d="M1.5,0.55 A0.45,0.45 0 0,1 1.5,1.45" fill="#003478"/>
        <circle cx="1.5" cy="0.775" r="0.225" fill="#CD2E3A"/>
        <circle cx="1.5" cy="1.225" r="0.225" fill="#003478"/>
      </svg>
    ),
    CO: ( // Amarelo, azul, vermelho horizontal
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#CE1126"/>
        <rect width="3" height={r*2} fill="#FCD116"/>
        <rect y={r} width="3" height={r/2} fill="#003087"/>
      </svg>
    ),
    CL: ( // Vermelho, branco com estrela e azul
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#D52B1E"/>
        <rect width="3" height="1" fill="white"/>
        <rect width="1" height="1" fill="#0039A6"/>
        <polygon points="0.5,0.15 0.6,0.45 0.85,0.3 0.6,0.5 0.85,0.7 0.6,0.55 0.5,0.85 0.4,0.55 0.15,0.7 0.4,0.5 0.15,0.3 0.4,0.45" fill="white"/>
      </svg>
    ),
    UY: ( // Branco e azul com sol
      <svg width={width} height={height} viewBox="0 0 3 2">
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <rect key={i} x="0" y={i*2/9} width="3" height={2/9} fill={i%2===0 ? 'white' : '#5EB6E4'}/>
        ))}
        <circle cx="0.6" cy="0.6" r="0.35" fill="#F9B32F"/>
      </svg>
    ),
    MX: ( // Verde, branco, vermelho + águia
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#CE1126"/>
        <rect width="2" height="2" fill="white"/>
        <rect width="1" height="2" fill="#006847"/>
        <circle cx="1.5" cy="1" r="0.25" fill="#006847" opacity="0.5"/>
      </svg>
    ),
    NG: ( // Verde, branco, verde
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="white"/>
        <rect width="1" height="2" fill="#008751"/>
        <rect x="2" width="1" height="2" fill="#008751"/>
      </svg>
    ),
    ZA: ( // 6 cores + Y horizontal
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#007A4D"/>
        <polygon points="0,0 1.2,1 0,2" fill="black"/>
        <polygon points="0,0 1.05,1 0,2 0,0.2 0.9,1 0,1.8" fill="#FFB612"/>
        <rect y="0" width="3" height="0.5" fill="#DE3831"/>
        <rect y="1.5" width="3" height="0.5" fill="#002395"/>
        <rect y="0.5" width="3" height="0.2" fill="white"/>
        <rect y="1.3" width="3" height="0.2" fill="white"/>
      </svg>
    ),
    DK: ( // Vermelho com cruz branca
      <svg width={width} height={height} viewBox="0 0 37 28">
        <rect width="37" height="28" fill="#C60C30"/>
        <rect x="12" width="5" height="28" fill="white"/>
        <rect y="11.5" width="37" height="5" fill="white"/>
      </svg>
    ),
    AT: ( // Vermelho, branco, vermelho
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#ED2939"/>
        <rect y="0.67" width="3" height="0.66" fill="white"/>
      </svg>
    ),
    BE: ( // Preto, amarelo, vermelho vertical
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#EF3340"/>
        <rect width="2" height="2" fill="#FAE042"/>
        <rect width="1" height="2" fill="#000000"/>
      </svg>
    ),
    PH: ( // Azul, vermelho, branco triângulo + sol
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#CE1126"/>
        <rect width="3" height="1" fill="#0038A8"/>
        <polygon points="0,0 0,2 1.2,1" fill="white"/>
        <circle cx="0.5" cy="1" r="0.2" fill="#FCD116"/>
      </svg>
    ),
    IE: ( // Verde, branco, laranja
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#FF883E"/>
        <rect width="2" height="2" fill="white"/>
        <rect width="1" height="2" fill="#169B62"/>
      </svg>
    ),
    PL: ( // Branco e vermelho
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#DC143C"/>
        <rect width="3" height="1" fill="white"/>
      </svg>
    ),
    GH: ( // Vermelho, ouro, verde com estrela preta
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#006B3F"/>
        <rect width="3" height={r*2} fill="#CF0921"/>
        <rect y={r} width="3" height={r} fill="#FCD116"/>
        <polygon points="1.5,0.55 1.6,0.85 1.9,0.85 1.65,1.05 1.75,1.35 1.5,1.15 1.25,1.35 1.35,1.05 1.1,0.85 1.4,0.85" fill="black"/>
      </svg>
    ),
    MA: ( // Vermelho com estrela verde
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#C1272D"/>
        <polygon points="1.5,0.4 1.62,0.8 2.0,0.8 1.69,1.0 1.81,1.4 1.5,1.18 1.19,1.4 1.31,1.0 1.0,0.8 1.38,0.8" fill="none" stroke="#006233" strokeWidth="0.07"/>
      </svg>
    ),
    EG: ( // Vermelho, branco, preto + águia
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#000000"/>
        <rect width="3" height={r*2} fill="#CE1126"/>
        <rect y={r} width="3" height={r} fill="white"/>
        <circle cx="1.5" cy="1" r="0.2" fill="#C09300" opacity="0.6"/>
      </svg>
    ),
  };

  const flag = flags[country];
  if (!flag) {
    // Fallback: duas cores do mapa de jerseys
    return (
      <svg width={width} height={height} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#6d28d9"/>
        <rect y="0.67" width="3" height="0.66" fill="#ec4899"/>
      </svg>
    );
  }
  return flag;
}

// Bandeiras adicionais
function ExtraFlagSVG({ country, width, height }) {
  const flags = {
    // Americas
    PY: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#D52B1E"/><rect y="0.5" width="3" height="1" fill="white"/><rect y="1.5" width="3" height="0.5" fill="#0038A8"/></svg>,
    EC: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#0038A8"/><rect width="3" height="0.67" fill="#FFD100"/><rect y="0.67" width="3" height="0.67" fill="#D52B1E"/></svg>,
    VE: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#CF142B"/><rect width="3" height="0.67" fill="#002FA7"/><rect y="1.33" width="3" height="0.67" fill="#FCB424"/></svg>,
    PE: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="white"/><rect width="1" height="2" fill="#D91023"/><rect x="2" width="1" height="2" fill="#D91023"/></svg>,
    BO: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#007934"/><rect width="3" height="0.67" fill="#D52B1E"/><rect y="0.67" width="3" height="0.67" fill="#F7D117"/></svg>,
    CA: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="white"/><rect width="0.75" height="2" fill="#FF0000"/><rect x="2.25" width="0.75" height="2" fill="#FF0000"/><polygon points="1.5,0.4 1.6,0.75 1.95,0.75 1.68,0.95 1.78,1.3 1.5,1.1 1.22,1.3 1.32,0.95 1.05,0.75 1.4,0.75" fill="#FF0000"/></svg>,
    MX: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#CE1126"/><rect width="2" height="2" fill="white"/><rect width="1" height="2" fill="#006847"/><circle cx="1.5" cy="1" r="0.22" fill="#006847" opacity="0.6"/></svg>,
    // Europa extra
    'GB-ENG': <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="white"/><rect x="1.3" width="0.4" height="2" fill="#CF091B"/><rect y="0.8" width="3" height="0.4" fill="#CF091B"/></svg>,
    'GB-SCT': <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#003087"/><line x1="0" y1="0" x2="3" y2="2" stroke="white" strokeWidth="0.4"/><line x1="3" y1="0" x2="0" y2="2" stroke="white" strokeWidth="0.4"/></svg>,
    'GB-WLS': <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="white"/><rect y="1" width="3" height="1" fill="#00AB39"/><ellipse cx="1.5" cy="1" rx="0.6" ry="0.85" fill="#CF091B"/></svg>,
    CH: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#FF0000"/><rect x="1.25" y="0.4" width="0.5" height="1.2" fill="white"/><rect x="0.9" y="0.75" width="1.2" height="0.5" fill="white"/></svg>,
    RU: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#D52B1E"/><rect width="3" height="0.67" fill="white"/><rect y="0.67" width="3" height="0.67" fill="#003087"/></svg>,
    IS: <svg width={width} height={height} viewBox="0 0 25 18"><rect width="25" height="18" fill="#003897"/><rect x="7" width="4" height="18" fill="white"/><rect y="7" width="25" height="4" fill="white"/><rect x="8" width="2" height="18" fill="#D72828"/><rect y="8" width="25" height="2" fill="#D72828"/></svg>,
    // Asia/Oceania extra
    NZ: <svg width={width} height={height} viewBox="0 0 6 3"><rect width="6" height="3" fill="#00247D"/><path d="M0,0 L3,1.5 M3,0 L0,1.5" stroke="white" strokeWidth="0.4"/><path d="M0,0 L3,1.5 M3,0 L0,1.5" stroke="#C8102E" strokeWidth="0.25"/><rect x="1.25" width="0.5" height="1.5" fill="white"/><rect y="0.5" x="0" width="3" height="0.5" fill="white"/><rect x="1.33" width="0.33" height="1.5" fill="#C8102E"/><rect y="0.58" width="3" height="0.33" fill="#C8102E"/><polygon points="4.4,0.3 4.5,0.6 4.8,0.6 4.55,0.78 4.65,1.08 4.4,0.9 4.15,1.08 4.25,0.78 4,0.6 4.3,0.6" fill="red"/></svg>,
    TH: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="white"/><rect y="0.33" width="3" height="0.45" fill="#A51931"/><rect y="1.22" width="3" height="0.45" fill="#A51931"/><rect y="0.78" width="3" height="0.44" fill="#2D2A4A"/></svg>,
    VN: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#DA251D"/><polygon points="1.5,0.4 1.63,0.78 2.02,0.78 1.7,1.0 1.83,1.38 1.5,1.16 1.17,1.38 1.3,1.0 0.98,0.78 1.37,0.78" fill="#FFFF00"/></svg>,
    IN: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#138808"/><rect width="3" height="0.67" fill="#FF9933"/><rect y="0.67" width="3" height="0.66" fill="white"/><circle cx="1.5" cy="1" r="0.25" fill="none" stroke="#000080" strokeWidth="0.05"/></svg>,
    // Africa extra
    CM: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#CE1126"/><rect width="2" height="2" fill="#007A5E"/><rect width="1" height="2" fill="#007A5E"/><polygon points="1.5,0.5 1.62,0.87 2.0,0.87 1.69,1.1 1.81,1.47 1.5,1.25 1.19,1.47 1.31,1.1 1.0,0.87 1.38,0.87" fill="#CE1126"/><rect x="1" width="1" height="2" fill="white"/></svg>,
    ZM: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#198A00"/><rect x="2.1" width="0.3" height="2" fill="#000"/><rect x="2.4" width="0.3" height="2" fill="#EF7D00"/><rect x="2.7" width="0.3" height="2" fill="#EF0000"/></svg>,
    CI: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#009A00"/><rect width="2" height="2" fill="white"/><rect width="1" height="2" fill="#FF8200"/></svg>,
    TN: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#E70013"/><circle cx="1.4" cy="1" r="0.5" fill="white"/><circle cx="1.45" cy="1" r="0.38" fill="#E70013"/><path d="M 1.45 0.72 A 0.28 0.28 0 1 1 1.44 0.72" fill="none" stroke="white" strokeWidth="0.05"/><polygon points="1.75,1 1.82,1.2 1.6,1.08 1.6,0.92 1.82,0.8" fill="white"/></svg>,
    KE: <svg width={width} height={height} viewBox="0 0 3 2"><rect width="3" height="2" fill="#006600"/><rect y="0.6" width="3" height="0.8" fill="black"/><rect y="0.7" width="3" height="0.2" fill="white"/><rect y="1.1" width="3" height="0.2" fill="white"/><polygon points="1.5,0.3 1.7,1 1.5,1.7 1.3,1 " fill="#BB0000"/></svg>,
  };
  return flags[country] || null;
}

function AnyFlagSVG({ code, width, height }) {
  // Extra flags dictionary takes priority
  const extraResult = ExtraFlagSVG({ country: code, width, height });
  if (extraResult) return extraResult;
  // Fall back to original FlagSVG dictionary
  return <FlagSVG country={code} width={width} height={height} />;
}

export function FlagBadge({ flag, country, size = 48 }) {
  const code = flag || country || 'BR';
  const h = Math.round(size * 0.67);
  return (
    <div style={{
      width: size, height: h,
      borderRadius: 5, overflow: 'hidden',
      border: '1.5px solid rgba(0,0,0,0.18)',
      display: 'inline-block',
      boxShadow: '0 1px 5px rgba(0,0,0,0.22)',
    }}>
      <AnyFlagSVG code={code} width={size} height={h} />
    </div>
  );
}
