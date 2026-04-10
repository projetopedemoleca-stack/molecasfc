import React from 'react';

const HAIR_COLORS = {
  luna:  '#3d1c02', bela:  '#d4a017', clara: '#1a1200', sol:   '#2d1600',
  bia:   '#2c1600', ana:   '#2c1600', iris:  '#c0392b', maya:  '#1a0800',
  duda:  '#2d1600', lara:  '#d4a017',
};

const SKIN = {
  light:         '#FDDBB4',
  medium:        '#C68642',
  'medium-dark': '#8D5524',
  dark:          '#4a2600',
};

function Hair({ playerId, cx, top }) {
  const h = HAIR_COLORS[playerId] || '#3d1c02';
  switch (playerId) {
    case 'luna': return (
      <g>
        <ellipse cx={cx} cy={top+10} rx="20" ry="19" fill={h} />
        <ellipse cx={cx-11} cy={top+6} rx="9" ry="9" fill={h} />
        <ellipse cx={cx+11} cy={top+6} rx="9" ry="9" fill={h} />
        <ellipse cx={cx-17} cy={top+14} rx="6" ry="7" fill={h} />
        <ellipse cx={cx+17} cy={top+14} rx="6" ry="7" fill={h} />
        <ellipse cx={cx} cy={top+1} rx="8" ry="7" fill={h} />
      </g>
    );
    case 'bela': return (
      <g>
        <ellipse cx={cx} cy={top+8} rx="18" ry="17" fill={h} />
        <rect x={cx-19} y={top+12} width="7" height="26" fill={h} rx="3.5" />
        <rect x={cx+12} y={top+12} width="7" height="26" fill={h} rx="3.5" />
        <ellipse cx={cx} cy={top+3} rx="13" ry="7" fill="#e8b824" />
      </g>
    );
    case 'clara': return (
      <g>
        <ellipse cx={cx} cy={top+7} rx="18" ry="14" fill={h} />
        <ellipse cx={cx} cy={top+16} rx="14" ry="5" fill={h} />
      </g>
    );
    case 'sol': return (
      <g>
        <ellipse cx={cx} cy={top+8} rx="17" ry="16" fill={h} />
        {[-12,-6,0,6,12,18].map((dx, i) => (
          <rect key={i} x={cx+dx-2} y={top+18} width="3.5" height={16+(i%3)*5} fill={h} rx="1.8" />
        ))}
        {[-12,-6,0,6,12,18].map((dx, i) => (
          <circle key={i} cx={cx+dx} cy={top+36+(i%3)*5} r="2.5" fill={i%2===0?'#FFD600':'#E91E63'} />
        ))}
      </g>
    );
    case 'bia': return (
      <g>
        <ellipse cx={cx} cy={top+10} rx="20" ry="18" fill={h} />
        <ellipse cx={cx-11} cy={top+4} rx="8" ry="8" fill="#3d2000" />
        <ellipse cx={cx+11} cy={top+4} rx="8" ry="8" fill="#3d2000" />
        <ellipse cx={cx-17} cy={top+12} rx="5" ry="6" fill={h} />
        <ellipse cx={cx+17} cy={top+12} rx="5" ry="6" fill={h} />
        <ellipse cx={cx} cy={top+1} rx="7" ry="6" fill={h} />
      </g>
    );
    case 'ana': return (
      <g>
        <ellipse cx={cx} cy={top+8} rx="19" ry="16" fill={h} />
        <ellipse cx={cx-9} cy={top+4} rx="7" ry="7" fill="#3d2000" />
        <ellipse cx={cx+9} cy={top+4} rx="7" ry="7" fill="#3d2000" />
        <ellipse cx={cx-15} cy={top+12} rx="4" ry="5" fill={h} />
        <ellipse cx={cx+15} cy={top+12} rx="4" ry="5" fill={h} />
      </g>
    );
    case 'iris': return (
      <g>
        <ellipse cx={cx} cy={top+9} rx="19" ry="19" fill={h} />
        <ellipse cx={cx-12} cy={top+5} rx="8" ry="8" fill="#e74c3c" />
        <ellipse cx={cx+12} cy={top+5} rx="8" ry="8" fill="#e74c3c" />
        <ellipse cx={cx} cy={top+1} rx="9" ry="8" fill={h} />
      </g>
    );
    case 'maya': return (
      <g>
        <ellipse cx={cx} cy={top+8} rx="18" ry="17" fill={h} />
        <rect x={cx-20} y={top+18} width="5" height="30" fill={h} rx="2.5" />
        <rect x={cx+15} y={top+18} width="5" height="30" fill={h} rx="2.5" />
        <circle cx={cx-18} cy={top+36} r="3" fill="#FFD600" />
        <circle cx={cx+18} cy={top+40} r="3" fill="#E91E63" />
      </g>
    );
    case 'duda': return (
      <g>
        <ellipse cx={cx} cy={top+6} rx="18" ry="13" fill={h} />
        {[-8,-2,4,10].map((dx, i) => (
          <rect key={i} x={cx+dx-1.5} y={top+16} width="3" height={10+(i%2)*4} fill={h} rx="1.5" />
        ))}
        <ellipse cx={cx+17} cy={top+18} rx="3" ry="4" fill="#c0c0c0" opacity="0.9" />
      </g>
    );
    case 'lara': return (
      <g>
        <ellipse cx={cx} cy={top+10} rx="20" ry="19" fill={h} />
        <ellipse cx={cx-11} cy={top+4} rx="9" ry="9" fill="#e8b824" />
        <ellipse cx={cx+11} cy={top+4} rx="9" ry="9" fill="#e8b824" />
        <ellipse cx={cx-17} cy={top+14} rx="6" ry="7" fill={h} />
        <ellipse cx={cx+17} cy={top+14} rx="6" ry="7" fill={h} />
        <ellipse cx={cx} cy={top+1} rx="8" ry="7" fill="#e8c030" />
      </g>
    );
    default: return <ellipse cx={cx} cy={top+8} rx="17" ry="15" fill={h} />;
  }
}

const SHIRT_NUMBERS = {
  luna:'10', bela:'9', clara:'1', sol:'7', bia:'8',
  ana:'6', iris:'4', maya:'11', duda:'5', lara:'2',
};

export default function PlayerAvatar({
  player,
  uniformColor = '#E91E63',
  shortsColor  = '#1a1a2e',
  bootsColor   = '#FFD600',
  size = 'md',
  showName = false,
}) {
  if (!player) return null;

  const dim = { sm: 56, md: 88, lg: 120, xl: 160 }[size] || 88;
  const skin = SKIN[player.skinTone] || SKIN.medium;
  const num  = SHIRT_NUMBERS[player.id] || '10';
  const shirtDark = uniformColor + 'bb';

  // proportional coords for this viewBox: 0 0 100 160
  const CX = 50;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg viewBox="0 0 100 160" width={dim} height={dim * 1.6} className="block drop-shadow-lg">

        {/* ── SOMBRA CHÃO ── */}
        <ellipse cx="50" cy="156" rx="24" ry="4" fill="rgba(0,0,0,0.12)" />

        {/* ── CABELO ATRÁS ── */}
        <Hair playerId={player.id} cx={CX} top={6} />

        {/* ── CABEÇA ── */}
        <ellipse cx={CX} cy="26" rx="16" ry="18" fill={skin} />

        {/* Orelhas */}
        <ellipse cx="34" cy="27" rx="3.2" ry="4.5" fill={skin} />
        <ellipse cx="66" cy="27" rx="3.2" ry="4.5" fill={skin} />

        {/* Olhos */}
        <ellipse cx="43.5" cy="24" rx="2.8" ry="3.2" fill="white" />
        <ellipse cx="56.5" cy="24" rx="2.8" ry="3.2" fill="white" />
        <ellipse cx="44"   cy="24.5" rx="1.7" ry="2" fill="#1a1200" />
        <ellipse cx="57"   cy="24.5" rx="1.7" ry="2" fill="#1a1200" />
        <circle  cx="44.8" cy="23.5" r="0.7" fill="white" opacity="0.9" />
        <circle  cx="57.8" cy="23.5" r="0.7" fill="white" opacity="0.9" />

        {/* Óculos (iris) */}
        {player.id === 'iris' && (
          <g>
            <rect x="39.5" y="21" width="9" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.2" />
            <rect x="50.5" y="21" width="9" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.2" />
            <line x1="48.5" y1="24.5" x2="50.5" y2="24.5" stroke="#333" strokeWidth="1" />
          </g>
        )}

        {/* Sobrancelhas */}
        <path d="M41,20 Q43.5,18.5 46,20" stroke="#3d2000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M54,20 Q56.5,18.5 59,20" stroke="#3d2000" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Nariz */}
        <path d="M49,30 Q50,32 51,30" stroke={skin === '#FDDBB4' ? '#c8956a' : 'rgba(0,0,0,0.2)'} strokeWidth="1.1" fill="none" strokeLinecap="round" />

        {/* Sorriso */}
        <path d="M45,35 Q50,39 55,35" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Bochechas */}
        <ellipse cx="40" cy="31" rx="4.5" ry="2.5" fill="#ff9a9a" opacity="0.22" />
        <ellipse cx="60" cy="31" rx="4.5" ry="2.5" fill="#ff9a9a" opacity="0.22" />

        {/* ── PESCOÇO ── */}
        <rect x="43" y="42" width="14" height="12" rx="5" fill={skin} />

        {/* ── BRAÇO ESQUERDO ── */}
        {/* manga */}
        <rect x="12" y="54" width="16" height="28" rx="7" fill={uniformColor} />
        {/* mão */}
        <ellipse cx="20" cy="84" rx="6.5" ry="6" fill={skin} />

        {/* ── BRAÇO DIREITO ── */}
        <rect x="72" y="54" width="16" height="28" rx="7" fill={uniformColor} />
        {/* mão - prótese para lara */}
        {player.id === 'lara'
          ? <ellipse cx="80" cy="84" rx="6.5" ry="6" fill="#b0b0b0" stroke="#888" strokeWidth="0.8" />
          : <ellipse cx="80" cy="84" rx="6.5" ry="6" fill={skin} />
        }

        {/* ── CORPO (camisa) ── */}
        <rect x="24" y="50" width="52" height="46" rx="10" fill={uniformColor} />

        {/* Listras laterais */}
        <rect x="24" y="50" width="8" height="46" rx="6" fill="rgba(255,255,255,0.13)" />
        <rect x="68" y="50" width="8" height="46" rx="6" fill="rgba(255,255,255,0.13)" />

        {/* Brilho camisa */}
        <path d="M34,56 Q36,72 35,90" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="4" strokeLinecap="round" />

        {/* Gola V */}
        <path d="M43,52 L50,60 L57,52" fill={uniformColor} />
        <path d="M43,52 L50,60 L57,52" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Número */}
        <text x="50" y="78" textAnchor="middle" fontSize="14" fill="rgba(255,255,255,0.95)"
          fontWeight="bold" fontFamily="'Arial Black',Arial,sans-serif">{num}</text>

        {/* ── CALÇÃO ── */}
        <rect x="24" y="94" width="52" height="20" rx="8" fill={shortsColor} />
        {/* faixa elástico */}
        <rect x="24" y="93" width="52" height="5" rx="4" fill="rgba(255,255,255,0.12)" />
        {/* costura central */}
        <line x1="50" y1="98" x2="50" y2="114" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" />
        {/* faixas laterais */}
        <rect x="24" y="94" width="6" height="20" fill={uniformColor} opacity="0.4" rx="1" />
        <rect x="70" y="94" width="6" height="20" fill={uniformColor} opacity="0.4" rx="1" />

        {/* ── PERNAS ── */}
        <rect x="27" y="112" width="18" height="24" rx="8" fill={skin} />
        <rect x="55" y="112" width="18" height="24" rx="8" fill={skin} />

        {/* ── MEIAS ── */}
        <rect x="27" y="126" width="18" height="12" rx="4" fill="white" />
        <rect x="55" y="126" width="18" height="12" rx="4" fill="white" />
        {/* faixa */}
        <rect x="27" y="126" width="18" height="4" rx="3" fill={uniformColor} opacity="0.55" />
        <rect x="55" y="126" width="18" height="4" rx="3" fill={uniformColor} opacity="0.55" />

        {/* ── CHUTEIRAS ── */}
        {/* esquerda */}
        <path d="M25,136 Q25,146 40,146 Q47,146 47,140 L47,134 L27,134 Z"
          fill={bootsColor} stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />
        <line x1="30" y1="138" x2="43" y2="138" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" />
        <line x1="30" y1="141" x2="43" y2="141" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

        {/* direita */}
        <path d="M75,136 Q75,146 60,146 Q53,146 53,140 L53,134 L73,134 Z"
          fill={bootsColor} stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />
        <line x1="57" y1="138" x2="70" y2="138" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" />
        <line x1="57" y1="141" x2="70" y2="141" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

        {/* Badge inclusão */}
        {player.inclusion && (
          <text x="90" y="52" textAnchor="middle" fontSize="10">{player.inclusion.icon}</text>
        )}
      </svg>

      {showName && (
        <span className="text-xs font-heading font-bold text-foreground">{player.name}</span>
      )}
    </div>
  );
}