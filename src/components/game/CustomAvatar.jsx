import React from 'react';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════
// DADOS DE CUSTOMIZAÇÃO — compartilhados entre Profile e CharacterSelect
// ═══════════════════════════════════════════════════

export const SKIN_TONES = [
  { id: 's1', color: '#FDDBB4', label: 'Clara' },
  { id: 's2', color: '#F0C27F', label: 'Média Clara' },
  { id: 's3', color: '#D4915A', label: 'Média' },
  { id: 's4', color: '#A0522D', label: 'Média Escura' },
  { id: 's5', color: '#5C3317', label: 'Escura' },
  { id: 's6', color: '#3B1F0A', label: 'Bem Escura' },
];

export const HAIR_COLORS = [
  { id: 'h1', color: '#1A1A1A', label: 'Preto' },
  { id: 'h2', color: '#4A3728', label: 'Castanho Escuro' },
  { id: 'h3', color: '#8B5E3C', label: 'Castanho' },
  { id: 'h4', color: '#D4A017', label: 'Loiro' },
  { id: 'h5', color: '#E8C45A', label: 'Loiro Claro' },
  { id: 'h6', color: '#C0392B', label: 'Ruivo' },
  { id: 'h7', color: '#9B59B6', label: 'Roxo' },
  { id: 'h8', color: '#2980B9', label: 'Azul' },
];

export const HAIR_STYLES = [
  { id: 'hs1', label: 'Curto com franja', emoji: '✂️' },
  { id: 'hs2', label: 'Bob curto',        emoji: '💇‍♀️' },
  { id: 'hs3', label: 'Longo liso',       emoji: '👩' },
  { id: 'hs4', label: 'Cachos',           emoji: '🌀' },
  { id: 'hs5', label: 'Rabo alto',        emoji: '🎀' },
  { id: 'hs6', label: 'Tranças',          emoji: '🪢' },
  { id: 'hs7', label: 'Afro',             emoji: '☁️' },
  { id: 'hs8', label: 'Pixie curto',      emoji: '⚡' },
];

// ═══════════════════════════════════════════════════
// AVATAR SVG — moderno, divertido, animado
// skin    → objeto {id, color, label} ou id string
// hairColor → objeto {id, color, label} ou id string
// hairStyle → objeto {id, label, emoji} ou id string
// ═══════════════════════════════════════════════════
export default function CustomAvatar({
  skin, hairColor, hairStyle,
  uniformColor, shortsColor, bootsColor,
  number, size = 120,
}) {
  // Aceita tanto objeto completo quanto apenas o id
  const skinObj  = typeof skin      === 'object' ? skin      : SKIN_TONES.find(s => s.id === skin)      || SKIN_TONES[1];
  const hairObj  = typeof hairColor === 'object' ? hairColor : HAIR_COLORS.find(h => h.id === hairColor) || HAIR_COLORS[0];
  const styleObj = typeof hairStyle === 'object' ? hairStyle : HAIR_STYLES.find(h => h.id === hairStyle) || HAIR_STYLES[2];

  const sColor   = skinObj.color;
  const hColor   = hairObj.color;
  const uColor   = uniformColor  || '#E91E63';
  const srtColor = shortsColor   || '#212121';
  const bColor   = bootsColor    || '#FFD600';

  const hairTop = {
    // 1 — Curto com Franja (bangs frisado)
    hs1: (
      <>
        <rect x="34" y="11" width="52" height="18" rx="9" fill={hColor} />
        <rect x="30" y="20" width="12" height="14" rx="6" fill={hColor} />
        <rect x="78" y="20" width="12" height="14" rx="6" fill={hColor} />
        {/* Franja reta na testa */}
        <rect x="38" y="18" width="44" height="8" rx="4" fill={hColor} opacity="0.85" />
        <rect x="40" y="20" width="40" height="5" rx="2" fill={hColor} opacity="0.5" />
      </>
    ),
    // 2 — Bob Curto (semelhante ao longo liso mas no ombro)
    hs2: (
      <>
        <rect x="30" y="10" width="60" height="22" rx="11" fill={hColor} />
        <rect x="28" y="20" width="12" height="30" rx="6" fill={hColor} />
        <rect x="80" y="20" width="12" height="30" rx="6" fill={hColor} />
        <rect x="34" y="26" width="52" height="8" rx="4" fill={hColor} opacity="0.55" />
      </>
    ),
    // 3 — Longo Liso (liso passando os ombros)
    hs3: (
      <>
        <rect x="29" y="9"  width="62" height="22" rx="11" fill={hColor} />
        <rect x="25" y="20" width="14" height="44" rx="7" fill={hColor} />
        <rect x="81" y="20" width="14" height="44" rx="7" fill={hColor} />
        <rect x="37" y="26" width="46" height="7" rx="3" fill={hColor} opacity="0.45" />
        {/* Peso do cabelo liso caindo */}
        <ellipse cx="32" cy="64" rx="8" ry="4" fill={hColor} opacity="0.3" />
        <ellipse cx="88" cy="64" rx="8" ry="4" fill={hColor} opacity="0.3" />
      </>
    ),
    // 4 — Cachos (cachos definidos e volumosos)
    hs4: (
      <>
        {/* Volume principal */}
        <ellipse cx="60" cy="15" rx="30" ry="15" fill={hColor} />
        {/* Cachos esquerda — formato de mola */}
        <ellipse cx="33" cy="22" rx="11" ry="9"  fill={hColor} />
        <ellipse cx="29" cy="33" rx="10" ry="8"  fill={hColor} />
        <ellipse cx="32" cy="44" rx="9"  ry="7"  fill={hColor} />
        <ellipse cx="36" cy="53" rx="7"  ry="6"  fill={hColor} />
        {/* Cachos direita */}
        <ellipse cx="87" cy="22" rx="11" ry="9"  fill={hColor} />
        <ellipse cx="91" cy="33" rx="10" ry="8"  fill={hColor} />
        <ellipse cx="88" cy="44" rx="9"  ry="7"  fill={hColor} />
        <ellipse cx="84" cy="53" rx="7"  ry="6"  fill={hColor} />
        {/* Cachos topo */}
        <ellipse cx="48" cy="12" rx="8" ry="7" fill={hColor} />
        <ellipse cx="60" cy="10" rx="9" ry="7" fill={hColor} />
        <ellipse cx="72" cy="12" rx="8" ry="7" fill={hColor} />
        <ellipse cx="60" cy="18" rx="7" ry="6" fill={hColor} opacity="0.7" />
      </>
    ),
    // 5 — Rabo de Cavalo Alto (arco elegante)
    hs5: (
      <>
        {/* Base no topo */}
        <ellipse cx="60" cy="13" rx="26" ry="13" fill={hColor} />
        {/* Laterais */}
        <rect x="30" y="18" width="12" height="16" rx="6" fill={hColor} />
        <rect x="78" y="18" width="12" height="16" rx="6" fill={hColor} />
        {/* Arco do rabo */}
        <path d="M50 8 Q60 -2 70 8" stroke={hColor} strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* Rabo caindo com curva suave */}
        <path d="M54 10 Q48 22 46 38" stroke={hColor} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M66 10 Q72 22 74 38" stroke={hColor} strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* Ponta do rabo */}
        <ellipse cx="46" cy="42" rx="8" ry="5" fill={hColor} opacity="0.8" />
        <ellipse cx="74" cy="42" rx="8" ry="5" fill={hColor} opacity="0.8" />
        {/* Elástico */}
        <rect x="54" y="6"  width="12" height="5" rx="2.5" fill={hColor} opacity="0.6" />
      </>
    ),
    // 6 — Tranças (两个 tranças laterais estilo box braids)
    hs6: (
      <>
        <rect x="30" y="9"  width="60" height="20" rx="10" fill={hColor} />
        {/* Trança esquerda */}
        <rect x="28" y="20" width="12" height="40" rx="6" fill={hColor} />
        <rect x="30" y="24" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
        <rect x="30" y="31" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
        <rect x="30" y="38" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
        <rect x="30" y="45" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
        <rect x="30" y="52" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
        {/* Trança direita */}
        <rect x="80" y="20" width="12" height="40" rx="6" fill={hColor} />
        <rect x="82" y="24" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
        <rect x="82" y="31" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
        <rect x="82" y="38" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
        <rect x="82" y="45" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
        <rect x="82" y="52" width="8"  height="3"  rx="1.5" fill="rgba(255,255,255,0.22)" />
      </>
    ),
    // 7 — Afro (volumoso e definido)
    hs7: (
      <>
        <ellipse cx="60" cy="15" rx="35" ry="19" fill={hColor} />
        <ellipse cx="60" cy="21" rx="28" ry="13" fill={hColor} opacity="0.35" />
        <circle  cx="38" cy="26" r="12" fill={hColor} />
        <circle  cx="82" cy="26" r="12" fill={hColor} />
        <circle  cx="60" cy="9"  r="10" fill={hColor} />
        <circle  cx="48" cy="10" r="8"  fill={hColor} />
        <circle  cx="72" cy="10" r="8"  fill={hColor} />
        {/* Detalhe de textura */}
        <circle cx="60" cy="13" r="6" fill={hColor} opacity="0.5" />
      </>
    ),
    // 8 — Pixie Curto (despojado e moderno)
    hs8: (
      <>
        <ellipse cx="60" cy="13" rx="28" ry="14" fill={hColor} />
        <rect x="28" y="18" width="12" height="12" rx="6" fill={hColor} />
        <rect x="80" y="18" width="12" height="12" rx="6" fill={hColor} />
        {/* Franja lateral estilo pixie */}
        <path d="M44 16 Q40 22 44 28" stroke={hColor} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M76 16 Q80 22 76 28" stroke={hColor} strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="60" cy="11" rx="16" ry="8" fill={hColor} opacity="0.7" />
      </>
    ),
  };

  return (
    <motion.svg
      width={size} height={size * 1.4}
      viewBox="0 0 120 168"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Sombra */}
      <ellipse cx="60" cy="164" rx="24" ry="4" fill="rgba(0,0,0,0.12)" />

      {/* Chuteiras */}
      <rect x="36" y="147" width="20" height="13" rx="4" fill={bColor} />
      <rect x="64" y="147" width="20" height="13" rx="4" fill={bColor} />
      <rect x="36" y="152" width="20" height="3" rx="1.5" fill="white" opacity="0.4" />
      <rect x="64" y="152" width="20" height="3" rx="1.5" fill="white" opacity="0.4" />

      {/* Pernas (meias) */}
      <rect x="40" y="128" width="14" height="20" rx="5" fill={uColor} opacity="0.8" />
      <rect x="66" y="128" width="14" height="20" rx="5" fill={uColor} opacity="0.8" />

      {/* Short */}
      <rect x="34" y="110" width="52" height="22" rx="8" fill={srtColor} />
      <line x1="60" y1="110" x2="60" y2="132" stroke="white" strokeWidth="1" opacity="0.2" />

      {/* Corpo / Camisa */}
      <rect x="30" y="72" width="60" height="42" rx="14" fill={uColor} />
      <rect x="30" y="85" width="60" height="3" rx="1.5" fill="white" opacity="0.18" />
      <text x="60" y="102" textAnchor="middle" fontSize="15" fontWeight="bold" fill="white" fontFamily="Arial">{number || '10'}</text>

      {/* Gola */}
      <path d="M48 72 Q60 80 72 72" fill={uColor} stroke="white" strokeWidth="1.5" />

      {/* Braços */}
      <rect x="12" y="74" width="19" height="34" rx="9" fill={sColor} />
      <rect x="89" y="74" width="19" height="34" rx="9" fill={sColor} />
      {/* Mangas */}
      <rect x="12" y="74" width="19" height="14" rx="9" fill={uColor} />
      <rect x="89" y="74" width="19" height="14" rx="9" fill={uColor} />

      {/* Mãos */}
      <circle cx="21"  cy="110" r="7" fill={sColor} />
      <circle cx="99"  cy="110" r="7" fill={sColor} />

      {/* Pescoço */}
      <rect x="53" y="60" width="14" height="16" rx="6" fill={sColor} />

      {/* Rosto */}
      <circle cx="60" cy="42" r="27" fill={sColor} />

      {/* Bochechas coradas */}
      <circle cx="45" cy="49" r="5.5" fill="#FF9999" opacity="0.45" />
      <circle cx="75" cy="49" r="5.5" fill="#FF9999" opacity="0.45" />

      {/* Olhos com piscar */}
      <motion.g
        animate={{ scaleY: [1, 0.05, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5 }}
        style={{ transformOrigin: '60px 42px' }}
      >
        <ellipse cx="50" cy="42" rx="6"  ry="7" fill="white" />
        <circle  cx="51" cy="42" r="4"   fill="#222" />
        <circle  cx="53" cy="40" r="1.5" fill="white" />
        <ellipse cx="70" cy="42" rx="6"  ry="7" fill="white" />
        <circle  cx="71" cy="42" r="4"   fill="#222" />
        <circle  cx="73" cy="40" r="1.5" fill="white" />
      </motion.g>

      {/* Sobrancelhas */}
      <path d="M44 33 Q50 29 56 33" stroke={hColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M64 33 Q70 29 76 33" stroke={hColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Nariz */}
      <path d="M58 45 Q60 50 62 45" stroke={sColor} strokeWidth="1.5" fill="none" opacity="0.6" />

      {/* Boca animada */}
      <motion.path
        d="M50 54 Q60 63 70 54"
        stroke="#C0392B" strokeWidth="2.5" fill="none" strokeLinecap="round"
        animate={{ d: ['M50 54 Q60 63 70 54', 'M50 56 Q60 65 70 56', 'M50 54 Q60 63 70 54'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Cabelo */}
      {hairTop[styleObj?.id] || hairTop.hs3}
    </motion.svg>
  );
}
