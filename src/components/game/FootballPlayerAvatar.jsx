import React from 'react';
import { PLAYER_STYLES } from '@/lib/gameData';

function Hair({ style, hair, cx = 50, top = 8 }) {
  if (style === 'afro') return (
    <g>
      <ellipse cx={cx} cy={top + 10} rx="21" ry="20" fill={hair} />
      <ellipse cx={cx - 12} cy={top + 14} rx="9" ry="10" fill={hair} />
      <ellipse cx={cx + 12} cy={top + 14} rx="9" ry="10" fill={hair} />
    </g>
  );
  if (style === 'curly') return (
    <g>
      <ellipse cx={cx} cy={top + 9} rx="18" ry="16" fill={hair} />
      <ellipse cx={cx - 14} cy={top + 14} rx="7" ry="8" fill={hair} />
      <ellipse cx={cx + 14} cy={top + 14} rx="7" ry="8" fill={hair} />
      <ellipse cx={cx} cy={top + 2} rx="13" ry="7" fill={hair} />
    </g>
  );
  if (style === 'braid') return (
    <g>
      <ellipse cx={cx} cy={top + 8} rx="16" ry="13" fill={hair} />
      <rect x={cx - 5} y={top + 18} width="4" height="26" rx="2" fill={hair} />
      <rect x={cx + 1} y={top + 18} width="4" height="26" rx="2" fill={hair} />
    </g>
  );
  if (style === 'short') return <ellipse cx={cx} cy={top + 8} rx="16" ry="12" fill={hair} />;
  if (style === 'long') return (
    <g>
      <ellipse cx={cx} cy={top + 9} rx="16" ry="14" fill={hair} />
      <rect x={cx - 19} y={top + 16} width="7" height="30" rx="3.5" fill={hair} />
      <rect x={cx + 12} y={top + 16} width="7" height="30" rx="3.5" fill={hair} />
    </g>
  );
  // ponytail (default)
  return (
    <g>
      <ellipse cx={cx} cy={top + 8} rx="16" ry="13" fill={hair} />
      <ellipse cx={cx + 16} cy={top + 12} rx="5" ry="3.5" fill={hair} />
      <rect x={cx + 14} y={top + 12} width="4" height="20" rx="2" fill={hair} />
    </g>
  );
}

export default function FootballPlayerAvatar({ playerId = 'luna', uniformColor, shortsColor, bootsColor, size = 120 }) {
  const pStyle = PLAYER_STYLES[playerId] || PLAYER_STYLES.luna;
  const skin   = pStyle.skin || '#FDBCB4';
  const hair   = pStyle.hair || '#1a0800';
  const hairStyle = pStyle.hairStyle || 'ponytail';
  const shirt  = uniformColor || pStyle.uniformColor || '#E91E63';
  const shorts = shortsColor  || '#1a1a2e';
  const boots  = bootsColor   || '#FFD600';
  const shirtDark = shirt + 'cc';

  return (
    <svg viewBox="0 0 100 170" width={size} height={size * 1.7} xmlns="http://www.w3.org/2000/svg">

      {/* ── CABELO ATRÁS ── */}
      <Hair style={hairStyle} hair={hair} cx={50} top={6} />

      {/* ── CABEÇA ── */}
      <ellipse cx="50" cy="24" rx="15" ry="17" fill={skin} />

      {/* Orelhas */}
      <ellipse cx="35.5" cy="25" rx="3" ry="4" fill={skin} />
      <ellipse cx="64.5" cy="25" rx="3" ry="4" fill={skin} />

      {/* Olhos */}
      <ellipse cx="44" cy="22" rx="2.8" ry="3" fill="white" />
      <ellipse cx="56" cy="22" rx="2.8" ry="3" fill="white" />
      <ellipse cx="44.5" cy="22.5" rx="1.6" ry="1.8" fill="#2c1810" />
      <ellipse cx="56.5" cy="22.5" rx="1.6" ry="1.8" fill="#2c1810" />
      <circle  cx="45" cy="21.8" r="0.6" fill="white" />
      <circle  cx="57" cy="21.8" r="0.6" fill="white" />

      {/* Sobrancelhas */}
      <path d="M41 18 Q44 16.5 47 18" stroke={hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M53 18 Q56 16.5 59 18" stroke={hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Nariz */}
      <ellipse cx="50" cy="27" rx="2" ry="1.4" fill="rgba(0,0,0,0.1)" />

      {/* Boca */}
      <path d="M45.5 31.5 Q50 35.5 54.5 31.5" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* ── PESCOÇO ── */}
      <rect x="43" y="39" width="14" height="12" rx="5" fill={skin} />

      {/* ── BRAÇO ESQUERDO (desenhado antes do corpo) ── */}
      {/* Manga */}
      <rect x="13" y="54" width="16" height="26" rx="7" fill={shirt} />
      {/* Mão */}
      <ellipse cx="21" cy="82" rx="6.5" ry="6" fill={skin} />

      {/* ── BRAÇO DIREITO ── */}
      <rect x="71" y="54" width="16" height="26" rx="7" fill={shirt} />
      <ellipse cx="79" cy="82" rx="6.5" ry="6" fill={skin} />

      {/* ── CORPO (CAMISA) ── */}
      <rect x="25" y="50" width="50" height="44" rx="10" fill={shirt} />

      {/* Listra lateral esquerda */}
      <rect x="25" y="50" width="8" height="44" rx="6" fill="rgba(255,255,255,0.14)" />
      {/* Listra lateral direita */}
      <rect x="67" y="50" width="8" height="44" rx="6" fill="rgba(255,255,255,0.14)" />

      {/* Gola */}
      <ellipse cx="50" cy="52" rx="10" ry="5.5" fill={shirtDark} />

      {/* Número */}
      <text x="50" y="78" textAnchor="middle" fontSize="15" fontWeight="bold"
        fill="rgba(255,255,255,0.92)" fontFamily="Arial,sans-serif">10</text>

      {/* ── CALÇÃO ── */}
      <rect x="26" y="92" width="48" height="18" rx="7" fill={shorts} />
      {/* Faixa lateral */}
      <rect x="26" y="92" width="7" height="18" rx="4" fill={shirt} opacity="0.4" />
      <rect x="67" y="92" width="7" height="18" rx="4" fill={shirt} opacity="0.4" />

      {/* ── PERNAS ── */}
      <rect x="28" y="108" width="18" height="26" rx="7" fill={skin} />
      <rect x="54" y="108" width="18" height="26" rx="7" fill={skin} />

      {/* ── MEIAS ── */}
      <rect x="28" y="126" width="18" height="10" rx="4" fill="white" />
      <rect x="54" y="126" width="18" height="10" rx="4" fill="white" />
      {/* faixa da meia */}
      <rect x="28" y="126" width="18" height="4" rx="3" fill={shirt} opacity="0.6" />
      <rect x="54" y="126" width="18" height="4" rx="3" fill={shirt} opacity="0.6" />

      {/* ── CHUTEIRAS ── */}
      {/* Esquerda */}
      <path d="M26,134 Q26,144 40,144 Q48,144 48,138 L48,132 L28,132 Z"
        fill={boots} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      <line x1="30" y1="136" x2="44" y2="136" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
      <line x1="30" y1="139" x2="44" y2="139" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

      {/* Direita */}
      <path d="M74,134 Q74,144 60,144 Q52,144 52,138 L52,132 L72,132 Z"
        fill={boots} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      <line x1="58" y1="136" x2="70" y2="136" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
      <line x1="58" y1="139" x2="70" y2="139" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

    </svg>
  );
}