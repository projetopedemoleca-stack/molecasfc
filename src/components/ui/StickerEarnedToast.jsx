import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RARITY_CONFIG as RARITY } from '@/lib/unifiedStickers.js';

const rarityStyle = {
  common:    { border: 'border-gray-400',   bg: 'from-gray-100 to-gray-200',     badge: 'bg-gray-400'   },
  uncommon:  { border: 'border-green-400',  bg: 'from-green-50 to-green-100',    badge: 'bg-green-500'  },
  rare:      { border: 'border-blue-400',   bg: 'from-blue-50 to-blue-100',      badge: 'bg-blue-500'   },
  epic:      { border: 'border-purple-500', bg: 'from-purple-50 to-purple-100',  badge: 'bg-purple-600' },
  legendary: { border: 'border-yellow-500', bg: 'from-yellow-50 to-amber-100',   badge: 'bg-yellow-500' },
  mythic:    { border: 'border-pink-500',   bg: 'from-pink-50 to-rose-100',      badge: 'bg-pink-600'   },
};

/**
 * Notificação flutuante de figurinha ganha.
 * Props:
 *   sticker  – objeto retornado pelo albumSystem (com .definition e .isDuplicate)
 *   onDone   – callback chamado quando a animação termina
 *   autoClose – ms para fechar automaticamente (default 2800)
 */
export function StickerEarnedToast({ sticker, onDone, autoClose = 2800 }) {
  const def    = sticker?.definition || sticker;
  const rarity = def?.rarity || 'common';
  const style  = rarityStyle[rarity] || rarityStyle.common;
  const isDupe = sticker?.isDuplicate;

  useEffect(() => {
    const t = setTimeout(onDone, autoClose);
    return () => clearTimeout(t);
  }, [autoClose, onDone]);

  if (!def) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.8 }}
      animate={{ y: 0,  opacity: 1, scale: 1    }}
      exit={   { y: 80, opacity: 0, scale: 0.8  }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border-2
        bg-gradient-to-r ${style.bg} ${style.border}
        max-w-xs w-[calc(100%-2rem)]
      `}
      onClick={onDone}
    >
      {/* Partículas */}
      {!isDupe && ['✨','⭐','🌟'].map((p, i) => (
        <motion.span key={i} className="absolute text-sm pointer-events-none"
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: (i - 1) * 40, y: -30, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
        >{p}</motion.span>
      ))}

      <motion.div
        className="text-4xl flex-shrink-0"
        animate={isDupe ? {} : { rotate: [0, -10, 10, -5, 0], scale: [1, 1.2, 1] }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {def.emoji}
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-xs text-gray-500 leading-none mb-0.5">
          {isDupe ? '🔄 Figurinha repetida!' : '✨ Nova figurinha!'}
        </p>
        <p className="font-heading font-black text-sm leading-tight truncate">{def.name}</p>
        <span className={`inline-block text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full mt-0.5 ${style.badge}`}>
          {RARITY[rarity]?.label}
        </span>
      </div>

      <span className="text-gray-300 text-xs">✕</span>
    </motion.div>
  );
}

/**
 * Hook simples para mostrar o toast.
 * Uso:
 *   const { showToast, StickerToast } = useStickerToast();
 *   showToast(result);  // result = retorno do earnSticker / addSticker
 *   return <>{StickerToast}</>;
 */
export function useStickerToast() {
  const [pending, setPending] = React.useState(null);

  const showToast = React.useCallback((result) => {
    if (!result) return;
    setPending(result);
  }, []);

  const StickerToast = (
    <AnimatePresence>
      {pending && (
        <StickerEarnedToast
          key={pending.uniqueId || pending.id || Math.random()}
          sticker={pending}
          onDone={() => setPending(null)}
        />
      )}
    </AnimatePresence>
  );

  return { showToast, StickerToast };
}
