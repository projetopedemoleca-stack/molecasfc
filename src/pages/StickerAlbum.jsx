import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  loadAlbum, saveAlbum, pasteSticker, calculateProgress,
  getTradableStickers, generateTradeCode, redeemTradeCode,
  redeemPromoCode, markAllAsSeen, drawSticker, addSticker
} from '@/lib/albumSystem.js';
import { ALL_STICKERS, RARITY, CATEGORIES, ALBUM_PAGES } from '@/lib/stickersData.js';
import { PlayerAvatar, FlagBadge } from '@/components/ui/PlayerAvatar.jsx';

// ── Ícones de futebol SVG simples ────────────────────────────────────────────
function FootballIcon({ icon, size = 52 }) {
  const s = size;
  const icons = {
    BALL_GOLD:    <svg viewBox="0 0 64 64" width={s} height={s}><circle cx="32" cy="32" r="28" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/><polygon points="32,10 38,22 50,22 41,30 44,43 32,36 20,43 23,30 14,22 26,22" fill="#7c3aed"/></svg>,
    TROPHY:       <svg viewBox="0 0 64 64" width={s} height={s}><path d="M16 8h32v20c0 11-8 18-16 18s-16-7-16-18z" fill="#fbbf24" stroke="#d97706" strokeWidth="2"/><rect x="28" y="46" width="8" height="10" fill="#d97706"/><rect x="20" y="56" width="24" height="4" rx="2" fill="#fbbf24"/></svg>,
    BOOT_GOLD:    <svg viewBox="0 0 64 64" width={s} height={s}><path d="M12 40 Q14 20 28 18 L48 22 L50 30 L32 30 L26 46 L14 46z" fill="#fbbf24" stroke="#d97706" strokeWidth="2"/><circle cx="42" cy="42" r="8" fill="#d97706"/></svg>,
    GLOVE_GOLD:   <svg viewBox="0 0 64 64" width={s} height={s}><path d="M20 48 L18 24 Q18 14 26 14 L30 14 L30 22 L34 14 Q38 10 42 14 L40 22 L44 18 Q48 16 50 20 L46 28 L50 26 Q54 28 52 34 L46 48z" fill="#fbbf24" stroke="#d97706" strokeWidth="2"/></svg>,
    TROPHY_GOAL:  <svg viewBox="0 0 64 64" width={s} height={s}><path d="M18 8h28v18c0 9-6 15-14 15s-14-6-14-15z" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/><rect x="29" y="41" width="6" height="8" fill="#dc2626"/><rect x="22" y="49" width="20" height="4" rx="2" fill="#ef4444"/><circle cx="32" cy="22" r="6" fill="#fff" opacity="0.5"/></svg>,
    MEDAL_GOLD:   <svg viewBox="0 0 64 64" width={s} height={s}><rect x="26" y="4" width="12" height="18" rx="3" fill="#fbbf24"/><circle cx="32" cy="42" r="18" fill="#fbbf24" stroke="#d97706" strokeWidth="2"/><text x="32" y="48" textAnchor="middle" fontSize="16" fill="#7c3aed" fontWeight="bold">1</text></svg>,
    MEDAL_SILVER: <svg viewBox="0 0 64 64" width={s} height={s}><rect x="26" y="4" width="12" height="18" rx="3" fill="#9ca3af"/><circle cx="32" cy="42" r="18" fill="#9ca3af" stroke="#6b7280" strokeWidth="2"/><text x="32" y="48" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">2</text></svg>,
    MEDAL_BRONZE: <svg viewBox="0 0 64 64" width={s} height={s}><rect x="26" y="4" width="12" height="18" rx="3" fill="#b45309"/><circle cx="32" cy="42" r="18" fill="#b45309" stroke="#92400e" strokeWidth="2"/><text x="32" y="48" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">3</text></svg>,
    WHISTLE:      <svg viewBox="0 0 64 64" width={s} height={s}><path d="M8 24 Q8 16 16 16 L40 20 L48 28 L40 36 L16 36 Q8 36 8 24z" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/><rect x="40" y="22" width="16" height="12" rx="4" fill="#ef4444"/></svg>,
    NET:          <svg viewBox="0 0 64 64" width={s} height={s}><rect x="8" y="8" width="48" height="36" rx="4" fill="none" stroke="#3b82f6" strokeWidth="2"/>{[0,1,2,3].map(i=><line key={i} x1={8+i*16} y1="8" x2={8+i*16} y2="44" stroke="#3b82f6" strokeWidth="1.5"/>)}{[0,1,2,3].map(i=><line key={i} x1="8" y1={8+i*12} x2="56" y2={8+i*12} stroke="#3b82f6" strokeWidth="1.5"/>)}<path d="M8 44 Q32 56 56 44" fill="#3b82f6" opacity="0.3"/></svg>,
    JERSEY_10:    <svg viewBox="0 0 64 64" width={s} height={s}><path d="M14 16 L8 24 L18 28 L18 56 L46 56 L46 28 L56 24 L50 16 L38 22 Q32 18 26 22z" fill="#22c55e" stroke="#15803d" strokeWidth="2"/><text x="32" y="46" textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">10</text></svg>,
    ARMBAND:      <svg viewBox="0 0 64 64" width={s} height={s}><ellipse cx="32" cy="32" rx="22" ry="12" fill="#fbbf24" stroke="#d97706" strokeWidth="2"/><text x="32" y="37" textAnchor="middle" fontSize="11" fill="#7c3aed" fontWeight="bold">CAP</text></svg>,
    CORNER_FLAG:  <svg viewBox="0 0 64 64" width={s} height={s}><line x1="16" y1="56" x2="16" y2="8" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/><polygon points="16,8 48,16 16,28" fill="#ef4444"/></svg>,
    VAR_SCREEN:   <svg viewBox="0 0 64 64" width={s} height={s}><rect x="8" y="12" width="48" height="32" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="2"/><text x="32" y="33" textAnchor="middle" fontSize="14" fill="#60a5fa" fontWeight="bold">VAR</text><rect x="24" y="44" width="16" height="8" rx="2" fill="#1e293b"/></svg>,
    SHIELD:       <svg viewBox="0 0 64 64" width={s} height={s}><path d="M32 6 L54 16 L54 32 Q54 50 32 58 Q10 50 10 32 L10 16z" fill="#7c3aed" stroke="#5b21b6" strokeWidth="2"/><path d="M32 14 L46 22 L46 32 Q46 44 32 50 Q18 44 18 32 L18 22z" fill="#a855f7" opacity="0.5"/></svg>,
    CARD_RED:     <svg viewBox="0 0 64 64" width={s} height={s}><rect x="14" y="8" width="36" height="48" rx="4" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/></svg>,
    CARD_YELLOW:  <svg viewBox="0 0 64 64" width={s} height={s}><rect x="14" y="8" width="36" height="48" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="2"/></svg>,
    SUBSTITUTION: <svg viewBox="0 0 64 64" width={s} height={s}><circle cx="32" cy="32" r="26" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2"/><path d="M20 24 L32 16 L44 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/><path d="M44 40 L32 48 L20 40" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/><line x1="32" y1="16" x2="32" y2="48" stroke="#374151" strokeWidth="1.5"/></svg>,
    BOOT_CLEAT:   <svg viewBox="0 0 64 64" width={s} height={s}><path d="M14 44 Q16 20 30 18 L50 22 L52 32 L34 32 L28 50 L16 50z" fill="#1e293b" stroke="#374151" strokeWidth="2"/>{[0,1,2,3].map(i=><rect key={i} x={26+i*7} y="50" width="4" height="6" rx="2" fill="#64748b"/>)}</svg>,
    SHIN_GUARD:   <svg viewBox="0 0 64 64" width={s} height={s}><rect x="20" y="8" width="24" height="44" rx="10" fill="#3b82f6" stroke="#2563eb" strokeWidth="2"/><rect x="24" y="14" width="16" height="6" rx="3" fill="#93c5fd"/><rect x="24" y="24" width="16" height="4" rx="2" fill="#93c5fd" opacity="0.6"/></svg>,
  };
  return icons[icon] || <svg viewBox="0 0 64 64" width={s} height={s}><circle cx="32" cy="32" r="28" fill="#6d28d9"/><text x="32" y="40" textAnchor="middle" fontSize="24" fill="white">?</text></svg>;
}

// ── Helper: decide que visual usar no card ────────────────────────────────────
function StickerVisual({ sticker, size = 52, blur = false }) {
  const wrap = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: size + 10 };
  if (blur) {
    return <div style={wrap}><span style={{ fontSize: size * 0.65, filter: 'blur(4px)', opacity: 0.4 }}>?</span></div>;
  }
  if (sticker.category === 'national') {
    return <div style={wrap}><FlagBadge flag={sticker.flag} size={size} /></div>;
  }
  if (sticker.category === 'brazil' || sticker.category === 'world' || sticker.category === 'skills') {
    return <div style={wrap}><PlayerAvatar sticker={sticker} size={size} /></div>;
  }
  if (sticker.category === 'icons') {
    return <div style={wrap}><FootballIcon icon={sticker.icon} size={size} /></div>;
  }
  return <div style={wrap}><span style={{ fontSize: size * 0.7 }}>?</span></div>;
}

// ── Cor por raridade ──────────────────────────────────────────────────────────
const rarityStyle = {
  common:    { border: 'border-gray-400',    bg: 'bg-gray-100',    text: 'text-gray-600',    badge: 'bg-gray-400',    glow: '' },
  uncommon:  { border: 'border-green-400',   bg: 'bg-green-50',    text: 'text-green-700',   badge: 'bg-green-500',   glow: 'shadow-green-300' },
  rare:      { border: 'border-blue-400',    bg: 'bg-blue-50',     text: 'text-blue-700',    badge: 'bg-blue-500',    glow: 'shadow-blue-300' },
  epic:      { border: 'border-purple-500',  bg: 'bg-purple-50',   text: 'text-purple-700',  badge: 'bg-purple-600',  glow: 'shadow-purple-400' },
  legendary: { border: 'border-yellow-500',  bg: 'bg-yellow-50',   text: 'text-amber-700',   badge: 'bg-yellow-500',  glow: 'shadow-yellow-400' },
  mythic:    { border: 'border-pink-500',    bg: 'bg-pink-50',     text: 'text-pink-700',    badge: 'bg-pink-600',    glow: 'shadow-pink-400' },
};

// ── Mini-card de figurinha ────────────────────────────────────────────────────
function StickerCard({ sticker, userSticker, onPaste, onTrade, selected, onSelect, compact }) {
  const style = rarityStyle[sticker.rarity] || rarityStyle.common;
  const owned   = !!userSticker;
  const pasted  = userSticker?.isPasted;
  const isNew   = userSticker?.isNew;
  const qty     = userSticker?.quantity || 0;

  const handleClick = () => {
    if (owned && !pasted) onSelect(sticker);
  };

  return (
    <motion.div
      layout
      whileHover={owned ? { scale: 1.05, y: -4 } : {}}
      whileTap={owned ? { scale: 0.96 } : {}}
      onClick={handleClick}
      className={`
        relative rounded-2xl border-2 p-2 text-center cursor-pointer transition-all select-none
        ${owned ? style.border + ' ' + style.bg : 'border-dashed border-gray-300 bg-gray-50 opacity-50'}
        ${pasted ? 'opacity-90' : ''}
        ${selected ? 'ring-4 ring-offset-1 ring-purple-400' : ''}
        ${owned && !pasted ? 'shadow-md ' + style.glow : ''}
      `}
    >
      {/* Badge raridade */}
      {owned && (
        <span className={`absolute top-1 left-1 text-[9px] font-bold text-white px-1 rounded-full ${style.badge}`}>
          {RARITY[sticker.rarity]?.label}
        </span>
      )}

      {/* Badge NOVA */}
      {isNew && !pasted && (
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10"
        >
          NOVA!
        </motion.span>
      )}

      {/* Badge repetida */}
      {owned && qty > 1 && (
        <span className="absolute top-1 right-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 rounded-full">
          x{qty}
        </span>
      )}

      {/* Avatar / Bandeira / Emoji */}
      <div className={`my-0.5 ${pasted ? 'opacity-80' : ''}`}>
        <StickerVisual sticker={sticker} size={44} blur={!owned} />
      </div>

      {/* Nome */}
      {!compact && (
        <p className={`text-[10px] font-bold leading-tight ${owned ? style.text : 'text-gray-400'} line-clamp-2`}>
          {owned ? sticker.name : '???'}
        </p>
      )}

      {/* Ícone colada */}
      {pasted && (
        <div className="absolute inset-0 flex items-end justify-center pb-1 pointer-events-none">
          <span className="text-[10px] bg-green-500 text-white px-1 rounded">✓ Colada</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Animação de colar figurinha ──────────────────────────────────────────────
function PasteAnimation({ sticker, onDone }) {
  const style = rarityStyle[sticker.rarity] || rarityStyle.common;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Fundo brilhante */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Partículas */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{ background: RARITY[sticker.rarity]?.color || '#9CA3AF' }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: (Math.cos((i / 12) * Math.PI * 2) * 160),
            y: (Math.sin((i / 12) * Math.PI * 2) * 160),
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        />
      ))}

      {/* Card principal */}
      <motion.div
        className={`relative z-10 rounded-3xl border-4 ${style.border} ${style.bg} p-8 text-center shadow-2xl w-56`}
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: [0, 1.3, 1], rotate: [- 15, 5, 0] }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        onAnimationComplete={() => setTimeout(onDone, 1200)}
      >
        <motion.div
          className="flex items-center justify-center mb-2"
          animate={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <StickerVisual sticker={sticker} size={72} />
        </motion.div>

        <p className={`font-bold text-lg ${style.text}`}>{sticker.name}</p>

        <motion.span
          className={`inline-block mt-2 text-xs font-bold text-white px-3 py-1 rounded-full ${style.badge}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {RARITY[sticker.rarity]?.label}
        </motion.span>

        <motion.p
          className="text-green-600 font-bold text-lg mt-3"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          ✨ Colada no álbum!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ── Animação de página completa ───────────────────────────────────────────────
function PageCompleteAnimation({ page, onDone }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80" />

      {/* Fogos */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ x: '50vw', y: '50vh', opacity: 1 }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            opacity: 0
          }}
          transition={{ duration: 1.5, delay: i * 0.05 }}
        >
          {['🎉', '⭐', '🌟', '✨', '🎊', '🏆'][i % 6]}
        </motion.div>
      ))}

      <motion.div
        className="relative z-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-center shadow-2xl max-w-xs mx-4"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        onAnimationComplete={() => setTimeout(onDone, 2500)}
      >
        <motion.div
          className="text-6xl mb-3"
          animate={{ rotate: [0, -15, 15, -10, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          🏆
        </motion.div>
        <p className="font-heading font-black text-white text-2xl">Página Completa!</p>
        <p className="text-yellow-100 mt-1 font-bold">{page.title}</p>
        <p className="text-white/80 text-sm mt-2">Você completou todas as figurinhas desta página!</p>
      </motion.div>
    </motion.div>
  );
}

// ── Modal de detalhes / colar / trocar ───────────────────────────────────────
function StickerDetailModal({ sticker, userSticker, onClose, onPaste, onGenerateTrade }) {
  const style = rarityStyle[sticker.rarity] || rarityStyle.common;
  const pasted = userSticker?.isPasted;
  const qty = userSticker?.quantity || 1;
  const hasDuplicate = qty > 1;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />

      <motion.div
        className={`relative z-10 rounded-3xl border-4 ${style.border} ${style.bg} p-6 text-center max-w-xs w-full shadow-2xl`}
        initial={{ scale: 0.7, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 60 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Raridade */}
        <span className={`inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-3 ${style.badge}`}>
          {RARITY[sticker.rarity]?.label}
        </span>

        {/* Emoji */}
        <div className="my-2 flex items-center justify-center">
          <StickerVisual sticker={sticker} size={76} />
        </div>

        {/* Nome e info */}
        <h3 className={`font-heading font-black text-xl ${style.text}`}>{sticker.name}</h3>
        {sticker.position && <p className="text-gray-500 text-sm">{sticker.position}</p>}
        {(sticker.country || sticker.flag) && <p className="text-gray-500 text-xs">{sticker.flag || sticker.country}</p>}
        <p className="text-gray-600 text-sm mt-2 italic">{sticker.description}</p>

        {/* Categoria */}
        <p className="text-xs text-gray-400 mt-1">
          {CATEGORIES[sticker.category]?.emoji} {CATEGORIES[sticker.category]?.label}
        </p>

        {/* Quantidade */}
        {qty > 1 && (
          <p className="mt-2 text-orange-500 font-bold text-sm">Você tem {qty} cópias</p>
        )}

        {/* Status */}
        {pasted
          ? <p className="mt-3 text-green-600 font-bold">✓ Já está no seu álbum</p>
          : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onPaste}
              className="mt-4 w-full py-3 bg-purple-600 text-white font-bold rounded-xl"
            >
              📌 Colar no Álbum
            </motion.button>
          )
        }

        {/* Trocar (se tiver repetida) */}
        {hasDuplicate && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onGenerateTrade}
            className="mt-2 w-full py-3 bg-orange-500 text-white font-bold rounded-xl"
          >
            🔄 Gerar Código de Troca
          </motion.button>
        )}

        <button onClick={onClose} className="mt-3 w-full py-2 text-gray-500 font-semibold text-sm">
          Fechar
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Modal de código gerado ───────────────────────────────────────────────────
function TradeCodeModal({ code, sticker, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />
      <motion.div
        className="relative z-10 bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center"
        initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl mb-2">🎁</div>
        <h3 className="font-heading font-black text-xl mb-1">Código de Troca!</h3>
        <p className="text-gray-500 text-sm mb-4">
          Envie este código para a sua amiga trocar {sticker.name}
        </p>

        <div className="bg-gray-100 rounded-xl p-3 mb-4 font-mono font-bold text-lg tracking-widest text-gray-800">
          {code}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={copy}
          className={`w-full py-3 rounded-xl font-bold text-white mb-2 ${copied ? 'bg-green-500' : 'bg-blue-500'}`}
        >
          {copied ? '✓ Copiado!' : '📋 Copiar Código'}
        </motion.button>

        <button onClick={onClose} className="w-full py-2 text-gray-400 text-sm font-semibold">Fechar</button>
      </motion.div>
    </motion.div>
  );
}

// ── Modal para inserir código de troca ───────────────────────────────────────
function RedeemModal({ onClose }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = () => {
    if (!code.trim()) return;
    setLoading(true);
    setTimeout(() => {
      // Tentar código de troca normal
      let res = redeemTradeCode(code);
      // Se não funcionar, tentar código promocional
      if (!res.success) res = redeemPromoCode(code);
      setResult(res);
      setLoading(false);
    }, 600);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />
      <motion.div
        className="relative z-10 bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl"
        initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🔑</div>
          <h3 className="font-heading font-black text-xl">Inserir Código</h3>
          <p className="text-gray-500 text-sm">Cole aqui o código de troca da sua amiga</p>
        </div>

        {!result ? (
          <>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: TROCA-ABC123"
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-center font-mono font-bold text-lg tracking-wider focus:border-purple-400 outline-none mb-3"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRedeem}
              disabled={!code.trim() || loading}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {loading ? '...' : '✨ Resgatar'}
            </motion.button>
          </>
        ) : result.success ? (
          <div className="text-center">
            <div className="text-6xl mb-2">
              {'\uD83C\uDF89'}
            </div>
            <p className="text-green-600 font-bold text-lg">{result.message || 'Figurinhas resgatadas!'}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-4 w-full py-3 bg-green-500 text-white font-bold rounded-xl"
            >
              Ver no Álbum
            </motion.button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-2">😔</div>
            <p className="text-red-500 font-bold">{result.error}</p>
            <button
              onClick={() => { setResult(null); setCode(''); }}
              className="mt-4 w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <button onClick={onClose} className="mt-3 w-full py-2 text-gray-400 text-sm">Fechar</button>
      </motion.div>
    </motion.div>
  );
}

// ── Página de categoria (grid de figurinhas) ──────────────────────────────────
function CategoryPage({ categoryId, album, onSelectSticker }) {
  const stickers = ALL_STICKERS.filter(s => s.category === categoryId);
  const pastedIds = Object.values(album.stickers).filter(s => s.isPasted).map(s => s.id);
  const totalPasted = stickers.filter(s => pastedIds.includes(s.id)).length;
  const cat = CATEGORIES[categoryId];

  const getUserSticker = (id) => Object.values(album.stickers).find(s => s.id === id) || null;

  return (
    <div className="p-4 space-y-4">
      {/* Header da categoria */}
      <div className="text-center">
        <div className="text-4xl">{cat.emoji}</div>
        <h2 className="font-heading font-black text-lg">{cat.label}</h2>
        <p className="text-sm text-gray-500">{totalPasted} / {stickers.length} coladas</p>
        <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: cat.color }}
            initial={{ width: 0 }}
            animate={{ width: `${(totalPasted / stickers.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {stickers.map(sticker => (
          <StickerCard
            key={sticker.id}
            sticker={sticker}
            userSticker={getUserSticker(sticker.id)}
            onSelect={onSelectSticker}
            selected={false}
          />
        ))}
      </div>
    </div>
  );
}

// ── Painel de progresso geral ─────────────────────────────────────────────────
function ProgressPanel({ progress }) {
  return (
    <div className="p-4 space-y-4">
      {/* Total */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-5 text-white text-center">
        <p className="text-5xl font-black">{progress.percentage}%</p>
        <p className="text-purple-200 text-sm">{progress.pasted} / {progress.total} figurinhas coladas</p>
        <div className="mt-3 h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Por categoria */}
      <div className="space-y-2">
        <h3 className="font-heading font-bold text-sm text-gray-500 uppercase">Por Categoria</h3>
        {Object.entries(CATEGORIES).map(([catId, cat]) => {
          const p = progress.byCategory[catId] || { obtained: 0, total: 0, percentage: 0 };
          return (
            <div key={catId} className="flex items-center gap-3">
              <span className="text-xl">{cat.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-semibold">{cat.label}</span>
                  <span className="text-gray-400">{p.obtained}/{p.total}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.percentage}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Por raridade */}
      <div className="space-y-2">
        <h3 className="font-heading font-bold text-sm text-gray-500 uppercase">Por Raridade</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(RARITY).map(([rarId, rar]) => {
            const p = progress.byRarity[rarId] || { obtained: 0, total: 0 };
            const style = rarityStyle[rarId];
            return (
              <div key={rarId} className={`rounded-xl p-2 border-2 ${style.border} ${style.bg}`}>
                <p className={`text-xs font-bold ${style.text}`}>{rar.label}</p>
                <p className="text-gray-500 text-xs">{p.obtained}/{p.total}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Páginas completas */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-3 text-center">
        <p className="text-2xl font-black text-yellow-600">{progress.pagesCompleted} / {progress.totalPages}</p>
        <p className="text-yellow-500 text-xs font-semibold">Páginas completas</p>
      </div>
    </div>
  );
}

// ── Página Principal do Álbum ─────────────────────────────────────────────────
export default function StickerAlbum({ onClose } = {}) {
  const navigate = useNavigate();
  const [album, setAlbum] = useState(() => loadAlbum());
  const [progress, setProgress] = useState(() => calculateProgress());
  const [activeTab, setActiveTab] = useState('brazil');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [pasteAnim, setPasteAnim] = useState(null);
  const [pageCompleteAnim, setPageCompleteAnim] = useState(null);
  const [tradeCode, setTradeCode] = useState(null);
  const [showRedeem, setShowRedeem] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [filterOwned, setFilterOwned] = useState(false);

  const refresh = () => {
    const a = loadAlbum();
    setAlbum(a);
    setProgress(calculateProgress());
  };

  // Marcar todas como vistas ao abrir
  useEffect(() => {
    markAllAsSeen();
  }, []);

  // Colar figurinha
  const handlePaste = () => {
    if (!selectedSticker) return;
    const userSticker = Object.values(album.stickers).find(s => s.id === selectedSticker.id);
    if (!userSticker) return;

    const result = pasteSticker(userSticker.uniqueId);
    if (result.success) {
      setPasteAnim(selectedSticker);
      setSelectedSticker(null);

      if (result.completedPages?.length > 0) {
        setTimeout(() => {
          setPasteAnim(null);
          setPageCompleteAnim(result.completedPages[0]);
        }, 2000);
      }

      refresh();
    }
  };

  // Gerar código de troca
  const handleGenerateTrade = () => {
    if (!selectedSticker) return;
    const userSticker = Object.values(album.stickers).find(s => s.id === selectedSticker.id);
    if (!userSticker) return;

    const result = generateTradeCode(userSticker.uniqueId);
    if (result.success) {
      setTradeCode({ code: result.code, sticker: selectedSticker });
      setSelectedSticker(null);
      refresh();
    }
  };

  const getUserSticker = (id) => Object.values(album.stickers).find(s => s.id === id) || null;

  const tabs = Object.values(CATEGORIES);

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-white" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 pt-10 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={() => onClose ? onClose() : navigate(-1)} className="text-white/80 font-bold text-sm px-2 py-1">← Voltar</button>
          <div className="text-center">
            <h1 className="font-heading font-black text-lg leading-tight">Álbum de Figurinhas</h1>
            <p className="text-purple-200 text-xs">{progress.pasted} / {progress.total} coladas · {progress.percentage}%</p>
          </div>
          <button
            onClick={() => setShowProgress(v => !v)}
            className="text-white/80 font-bold text-sm px-2 py-1"
          >
            📊
          </button>
        </div>

        {/* Barra geral */}
        <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowRedeem(true)}
            className="flex-1 bg-white/20 text-white text-xs font-bold py-2 rounded-xl"
          >
            🔑 Inserir Código
          </button>
          <button
            onClick={() => setFilterOwned(v => !v)}
            className={`flex-1 text-xs font-bold py-2 rounded-xl ${filterOwned ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}
          >
            {filterOwned ? '✓ Só minhas' : '👀 Só minhas'}
          </button>
        </div>
      </div>

      {/* Tabs de categoria */}
      <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-auto flex-shrink-0 scrollbar-hide">
        {tabs.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex-shrink-0 px-4 py-2.5 text-xs font-bold flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === cat.id
                ? 'text-purple-700 border-b-2 border-purple-600 bg-white'
                : 'text-gray-500'
            }`}
          >
            <span className="text-lg">{cat.emoji}</span>
            <span className="leading-none">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {showProgress ? (
            <motion.div key="progress"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            >
              <ProgressPanel progress={progress} />
            </motion.div>
          ) : (
            <motion.div key={activeTab}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            >
              <CategoryPage
                categoryId={activeTab}
                album={album}
                onSelectSticker={setSelectedSticker}
                filterOwned={filterOwned}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modais */}
      <AnimatePresence>
        {selectedSticker && (
          <StickerDetailModal
            key="detail"
            sticker={selectedSticker}
            userSticker={getUserSticker(selectedSticker.id)}
            onClose={() => setSelectedSticker(null)}
            onPaste={handlePaste}
            onGenerateTrade={handleGenerateTrade}
          />
        )}
        {pasteAnim && (
          <PasteAnimation
            key="paste"
            sticker={pasteAnim}
            onDone={() => setPasteAnim(null)}
          />
        )}
        {pageCompleteAnim && (
          <PageCompleteAnimation
            key="page-complete"
            page={pageCompleteAnim}
            onDone={() => setPageCompleteAnim(null)}
          />
        )}
        {tradeCode && (
          <TradeCodeModal
            key="trade"
            code={tradeCode.code}
            sticker={tradeCode.sticker}
            onClose={() => setTradeCode(null)}
          />
        )}
        {showRedeem && (
          <RedeemModal key="redeem" onClose={() => { setShowRedeem(false); refresh(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
