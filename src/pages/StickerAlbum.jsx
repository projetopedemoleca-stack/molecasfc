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

// ── Helper: decide que visual usar no card ────────────────────────────────────
function StickerVisual({ sticker, size = 52, blur = false }) {
  const wrap = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: size + 10 };
  if (blur) {
    return <div style={wrap}><span style={{ fontSize: size * 0.65, filter: 'blur(4px)', opacity: 0.4 }}>❓</span></div>;
  }
  if (sticker.category === 'national') {
    return <div style={wrap}><FlagBadge country={sticker.country} size={size} /></div>;
  }
  if (sticker.category === 'brazil' || sticker.category === 'world') {
    return <div style={wrap}><PlayerAvatar sticker={sticker} size={size} /></div>;
  }
  // icons / skills — mantém emoji
  return <div style={wrap}><span style={{ fontSize: size * 0.7 }}>{sticker.emoji}</span></div>;
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
        {sticker.country && <p className="text-gray-500 text-xs">{sticker.country}</p>}
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
          Envie este código para a sua amiga trocar {sticker.emoji} {sticker.name}
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
              {result.sticker?.definition?.emoji || result.stickers?.[0]?.definition?.emoji || '🎉'}
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
