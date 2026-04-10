import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clipboard, Sparkles, Gift, Share2, X, Check } from 'lucide-react';
import { useStickerAlbum } from '@/hooks/useStickerAlbum.js';
import { STICKERS_COLLECTION, RARITY_CONFIG } from '@/lib/unifiedStickers.js';

// Modal de Recompensa
function RewardModal({ reward, onClose }) {
  if (!reward) return null;
  
  const rarity = RARITY_CONFIG[reward.sticker.rarity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: Math.random() * 500, y: -50 }}
              animate={{ y: 800, rotate: 360 }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute text-2xl"
            >
              {['⭐', '✨', '🎉', '🎊', '💫', '🌟'][Math.floor(Math.random() * 6)]}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${rarity.bgGradient} p-1`}
        >
          <div className="bg-white rounded-[22px] p-6 text-center">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mb-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${rarity.bgGradient} text-white font-bold shadow-lg`}>
                <Gift className="w-5 h-5" />
                {reward.isNew ? 'Nova Figurinha!' : 'Figurinha Repetida'}
              </span>
            </motion.div>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className={`w-40 h-40 mx-auto rounded-2xl bg-gradient-to-br ${rarity.bgGradient} flex items-center justify-center shadow-xl mb-4 relative`}>
              {reward.sticker.hasGlitter && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12" />
                </div>
              )}
              <motion.span animate={reward.sticker.hasAnimation ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl relative z-10">
                {reward.sticker.emoji}
              </motion.span>
            </motion.div>

            <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="font-heading text-2xl font-bold text-gray-900 mb-1">
              {reward.sticker.name}
            </motion.h3>
            
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-600 mb-2">
              {reward.sticker.description}
            </motion.p>
            
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${rarity.bgGradient} text-white`}>
              {rarity.label}
            </motion.span>

            {!reward.isNew && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-3 text-sm text-gray-500">
                Você agora tem {reward.sticker.quantity}x desta figurinha
              </motion.p>
            )}

            <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="mt-6 w-full py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors">
              {reward.isNew ? 'Colar no Álbum!' : 'Continuar'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Card de Figurinha
function StickerCard({ sticker, userSticker, onClick }) {
  const rarity = RARITY_CONFIG[sticker.rarity];
  const isOwned = !!userSticker;
  const isPasted = userSticker?.isPasted;
  const quantity = userSticker?.quantity || 0;

  if (!isOwned) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} className="aspect-square rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-2 cursor-not-allowed opacity-60">
        <span className="text-2xl mb-1">❓</span>
        <span className="text-[10px] text-gray-500 text-center font-semibold">???</span>
      </motion.div>
    );
  }

  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className={`relative aspect-square rounded-xl border-2 overflow-hidden ${isPasted ? `bg-gradient-to-br ${rarity.bgGradient} ${rarity.borderColor} shadow-lg ${rarity.glowColor}` : 'bg-white border-gray-300'} ${userSticker?.isNew ? 'ring-2 ring-yellow-400 ring-offset-2 animate-pulse' : ''} transition-all duration-300`}>
      {sticker.hasGlitter && isPasted && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-tr from-white/40 via-transparent to-white/40" />
        </div>
      )}

      <div className="relative h-full flex flex-col items-center justify-center p-2">
        <motion.span animate={sticker.hasAnimation && isPasted ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl mb-1">
          {sticker.emoji}
        </motion.span>

        <p className={`font-heading font-bold text-xs text-center leading-tight ${isPasted ? 'text-white' : 'text-gray-900'}`}>
          {sticker.name}
        </p>

        {quantity > 1 && (
          <div className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {quantity}
          </div>
        )}

        {userSticker?.isNew && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
            NOVA!
          </motion.div>
        )}

        {!isPasted && (
          <div className="absolute bottom-1 left-1 right-1 bg-gray-100/90 rounded text-[8px] text-gray-600 text-center py-0.5 font-medium">
            Toque para colar
          </div>
        )}

        {isPasted && (
          <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>
    </motion.button>
  );
}

// Modal de Detalhes
function StickerDetailModal({ sticker, userSticker, onClose, onPaste, onTrade }) {
  const rarity = RARITY_CONFIG[sticker.rarity];
  const isPasted = userSticker?.isPasted;
  const canTrade = userSticker && (userSticker.quantity > 1 || (userSticker.quantity === 1 && userSticker.isPasted));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} onClick={(e) => e.stopPropagation()} className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ${isPasted ? `bg-gradient-to-br ${rarity.bgGradient}` : 'bg-white'}`}>
        <div className="relative p-6 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X className={`w-5 h-5 ${isPasted ? 'text-white' : 'text-gray-700'}`} />
          </button>

          <motion.div animate={sticker.hasAnimation ? { y: [0, -10, 0], rotate: [0, 5, -5, 0] } : {}} transition={{ repeat: Infinity, duration: 3 }} className="text-8xl mb-4 drop-shadow-lg">
            {sticker.emoji}
          </motion.div>

          <h3 className={`font-heading text-2xl font-bold mb-1 ${isPasted ? 'text-white' : 'text-gray-900'}`}>
            {sticker.name}
          </h3>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${isPasted ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {rarity.label}
            {sticker.hasGlitter && <Sparkles className="w-4 h-4" />}
          </span>
        </div>

        <div className={`p-6 pt-0 ${isPasted ? 'text-white' : 'text-gray-700'}`}>
          <p className="text-center mb-4 opacity-90">{sticker.description}</p>

          <div className={`rounded-xl p-4 mb-4 ${isPasted ? 'bg-white/10' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-70">Categoria</span>
              <span className="font-semibold capitalize">{sticker.category}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-70">XP Bônus</span>
              <span className="font-semibold">+{rarity.xpBonus} XP</span>
            </div>
            {userSticker && (
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">Quantidade</span>
                <span className="font-semibold">{userSticker.quantity}x</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!isPasted ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onPaste} className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                <Check className="w-5 h-5" />
                Colar no Álbum
              </motion.button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                <Check className="w-5 h-5" />
                Já colada no álbum
              </div>
            )}

            {canTrade && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onTrade} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${isPasted ? 'bg-white/10 text-white border border-white/30' : 'bg-white border-2 border-purple-500 text-purple-600'}`}>
                <Share2 className="w-5 h-5" />
                Gerar Código de Troca
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Modal de Código
function CodeModal({ isOpen, onClose, mode, onSubmit, tradeCode, tradeSticker }) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!inputCode.trim()) {
      setError('Digite um código!');
      return;
    }
    setError('');
    onSubmit(inputCode.trim().toUpperCase());
    setInputCode('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading text-xl font-bold">
            {mode === 'redeem' ? '🎁 Resgatar Código' : '💎 Código de Troca'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'redeem' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Digite um código válido para ganhar figurinhas:</p>
            <input type="text" value={inputCode} onChange={(e) => setInputCode(e.target.value.toUpperCase())} placeholder="Ex: COROA2024 ou TROCA-XXX" onKeyPress={(e) => e.key === 'Enter' && handleSubmit()} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none font-mono text-center uppercase tracking-wider" />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button onClick={handleSubmit} className="w-full py-3 rounded-xl font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors">Resgatar!</button>
          </div>
        ) : (
          <div className="space-y-4">
            {tradeSticker && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Você está trocando:</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${RARITY_CONFIG[tradeSticker.rarity].bgGradient} text-white`}>
                  <span className="text-2xl">{tradeSticker.emoji}</span>
                  <span className="font-bold">{tradeSticker.name}</span>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 text-center">Compartilhe este código com uma amiga:</p>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
              <div className="bg-white rounded-lg p-3 font-mono text-center text-purple-700 font-bold tracking-wider border-2 border-purple-200 text-lg break-all">
                {tradeCode || 'Gerando...'}
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">⚠️ Este código só pode ser usado uma vez!</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors">Fechar</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Página Principal
export default function StickerAlbum() {
  const {
    userStickers,
    progress,
    lastReward,
    showRewardAnimation,
    newStickersCount,
    tradableStickers,
    getUserSticker,
    pasteSticker,
    useCode,
    generateTrade,
    useTradeCode,
    closeRewardAnimation,
    allStickers,
  } = useStickerAlbum();

  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeCode, setTradeCode] = useState('');
  const [tradeSticker, setTradeSticker] = useState(null);
  const [codeError, setCodeError] = useState('');

  const filteredStickers = selectedTab === 'all' 
    ? allStickers 
    : allStickers.filter(s => s.rarity === selectedTab);

  const handlePaste = () => {
    if (selectedSticker) {
      const userSticker = getUserSticker(selectedSticker.id);
      if (userSticker) {
        pasteSticker(userSticker.uniqueId);
      }
      setSelectedSticker(null);
    }
  };

  const handleTrade = () => {
    if (selectedSticker) {
      const userSticker = getUserSticker(selectedSticker.id);
      if (userSticker) {
        const result = generateTrade(userSticker.uniqueId);
        if (result.success && result.code) {
          setTradeCode(result.code);
          setTradeSticker(selectedSticker);
          setShowTradeModal(true);
        }
      }
      setSelectedSticker(null);
    }
  };

  const handleRedeemCode = (code) => {
    const result = useCode(code);
    if (result.success) {
      setShowCodeModal(false);
      setCodeError('');
    } else {
      setCodeError(result.error || 'Erro ao resgatar');
    }
  };

  const handleTradeCodeInput = (code) => {
    const result = useTradeCode(code);
    if (result.success) {
      setShowCodeModal(false);
      setCodeError('');
    } else {
      setCodeError(result.error || 'Código inválido ou já usado!');
    }
  };

  const selectedUserSticker = selectedSticker ? getUserSticker(selectedSticker.id) : undefined;

  return (
    <div className="min-h-screen p-4 pb-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <Link to="/" className="p-2 rounded-xl bg-muted active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl">💎 Álbum de Figurinhas</h1>
            {newStickersCount > 0 && (
              <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {newStickersCount} nova{newStickersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Colecione itens fofos e mágicos</p>
        </div>
      </div>

      {/* Progresso */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-4 mb-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-sm">Progresso do Álbum</p>
          <div className="flex items-center gap-2">
            <p className="font-heading font-bold text-lg">{progress.obtained}/{progress.total}</p>
          </div>
        </div>
        
        <div className="h-3 bg-black/20 rounded-full overflow-hidden">
          <motion.div className="h-full bg-yellow-300 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress.percentage}%` }} transition={{ duration: 0.5 }} />
        </div>
        
        <p className="text-xs text-white/80 mt-2">{progress.percentage}% completo · {progress.pasted} coladas</p>
      </motion.div>

      {/* Botões de ação */}
      <div className="flex gap-3 mb-4">
        <button onClick={() => { setCodeError(''); setShowCodeModal(true); }} className="flex-1 py-3 rounded-xl font-bold bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Clipboard className="w-5 h-5" />
          Resgatar Código
        </button>
        <button onClick={() => { setCodeError(''); setShowCodeModal(true); }} className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg">
          <Gift className="w-5 h-5" />
          Usar Código
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { id: 'all', label: '✨ Todas', color: 'from-gray-500 to-gray-600' },
          { id: 'common', label: 'Comuns', color: 'from-gray-400 to-gray-500' },
          { id: 'rare', label: 'Raras', color: 'from-blue-400 to-blue-600' },
          { id: 'epic', label: 'Épicas', color: 'from-purple-400 to-purple-600' },
          { id: 'legendary', label: 'Lendárias', color: 'from-yellow-400 to-orange-500' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setSelectedTab(tab.id)} className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${selectedTab === tab.id ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid de figurinhas */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {filteredStickers.map((sticker, idx) => {
          const userSticker = getUserSticker(sticker.id);
          return (
            <motion.div key={sticker.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }}>
              <StickerCard sticker={sticker} userSticker={userSticker} onClick={() => setSelectedSticker(sticker)} />
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          💡 Complete mini-games, lições e desafios para ganhar mais figurinhas!
          {tradableStickers.length > 0 && (
            <><br /><span className="text-purple-600 font-semibold">Você tem {tradableStickers.length} figurinha{tradableStickers.length > 1 ? 's' : ''} para trocar!</span></>
          )}
        </p>
      </motion.div>

      {/* Modais */}
      <AnimatePresence>
        {selectedSticker && (
          <StickerDetailModal sticker={selectedSticker} userSticker={selectedUserSticker} onClose={() => setSelectedSticker(null)} onPaste={handlePaste} onTrade={handleTrade} />
        )}
      </AnimatePresence>

      <CodeModal isOpen={showCodeModal} onClose={() => { setShowCodeModal(false); setCodeError(''); }} mode="redeem" onSubmit={handleRedeemCode} />

      <CodeModal isOpen={showTradeModal} onClose={() => { setShowTradeModal(false); setTradeCode(''); setTradeSticker(null); }} mode="trade" onSubmit={() => {}} tradeCode={tradeCode} tradeSticker={tradeSticker} />

      <RewardModal reward={lastReward} onClose={closeRewardAnimation} />
    </div>
  );
}
