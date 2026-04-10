import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, BookOpen, User, Star, ChevronDown, Sparkles, Gift } from 'lucide-react';
import PlayerAvatar from '@/components/game/PlayerAvatar';
import AlbumView from '@/components/training/AlbumView';
import { PLAYERS } from '@/lib/gameData';
import { loadProfile } from '@/lib/playerProfile';
import { useStickerAlbum } from '@/hooks/useStickerAlbum.js';

const menuItems = [
  {
    to: '/character-select',
    icon: Play,
    label: 'Jogar Agora',
    desc: 'Escolha sua jogadora e jogue!',
    color: 'from-primary to-green-400',
    emoji: '⚽',
  },
  {
    to: '/story',
    icon: BookOpen,
    label: 'Modo História',
    desc: 'A aventura da escolinha',
    color: 'from-accent to-pink-400',
    emoji: '📖',
  },
  {
    to: '/training',
    icon: Star,
    label: 'Treinos',
    desc: 'Pênalti, passe, dribles e mais!',
    color: 'from-secondary to-yellow-300',
    emoji: '🏋️',
  },
  {
    to: '/profile',
    icon: User,
    label: 'Meu Perfil',
    desc: 'Time favorito e customização',
    color: 'from-blue-500 to-cyan-400',
    emoji: '⭐',
  },
  {
    to: '/achievements',
    icon: Trophy,
    label: 'Conquistas',
    desc: 'Medalhas e troféus desbloqueados',
    color: 'from-purple-500 to-violet-500',
    emoji: '🏅',
  },
  {
    id: 'album',
    icon: Sparkles,
    label: 'Álbum de Figurinhas',
    desc: 'Colecione itens fofos e mágicos',
    color: 'from-pink-500 to-rose-400',
    emoji: '💎',
    isAlbum: true,
  },
  {
    to: '/about',
    icon: Star,
    label: 'Sobre Nós',
    desc: 'Autoras, versão e o projeto',
    color: 'from-teal-500 to-cyan-400',
    emoji: '💚',
  },
];

// Botão de teste para ganhar figurinhas (remover em produção)
function TestStickerButton({ onEarn }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowOptions(!showOptions)}
        className="w-full py-2 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500
                   text-white shadow-lg flex items-center justify-center gap-2"
      >
        <Gift className="w-5 h-5" />
        🎁 Ganhar Figurinha (Teste)
      </motion.button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl 
                       p-2 space-y-1 z-10"
          >
            {[
              { id: undefined, label: 'Aleatória', color: 'bg-gray-500' },
              { id: 'common', label: 'Comum', color: 'bg-gray-400' },
              { id: 'rare', label: 'Rara', color: 'bg-blue-500' },
              { id: 'epic', label: 'Épica', color: 'bg-purple-500' },
              { id: 'legendary', label: 'Lendária', color: 'bg-amber-500' },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  onEarn(option.id);
                  setShowOptions(false);
                }}
                className={`w-full py-2 rounded-lg text-white font-semibold ${option.color}
                           hover:opacity-90 transition-opacity`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [showAlbum, setShowAlbum] = useState(false);
  const profile = loadProfile();
  const selectedPlayer = PLAYERS.find(p => p.id === (profile.selectedPlayerId || 'luna')) || PLAYERS[0];
  const uniformColor = profile.uniformColor || '#E91E63';
  const shortsColor = profile.shortsColor || '#000000';
  const bootsColor = profile.bootsColor || '#FFD600';

  const {
    progress,
    newStickersCount,
    earnSticker,
  } = useStickerAlbum();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/30 via-background to-accent/10 flex flex-col items-center px-4 pt-10 pb-8 font-body overflow-x-hidden">

      {/* Header logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-center mb-2"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
          className="mb-2 inline-block text-6xl"
        >
          ⚽
        </motion.div>
        <h1 className="font-heading text-5xl font-bold text-foreground leading-none tracking-tight">
          Molecas
        </h1>
        <h2 className="font-heading text-2xl font-semibold text-primary tracking-wide">
          Futebol Clube
        </h2>
        <p className="text-muted-foreground mt-2 text-xs max-w-[220px] mx-auto leading-relaxed">
          Futebol · Estratégia · Cooperação · Diversão 🌈
        </p>
      </motion.div>

      {/* Featured player avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="flex flex-col items-center my-4"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ background: uniformColor }}/>
          <div className="relative bg-gradient-to-b from-primary/15 to-accent/15 rounded-3xl p-3 shadow-xl border border-white/20 flex items-center justify-center">
            <PlayerAvatar player={selectedPlayer} uniformColor={uniformColor} shortsColor={shortsColor} bootsColor={bootsColor} size="lg" />
          </div>
        </motion.div>
        <p className="text-xs text-muted-foreground mt-1 font-semibold">{selectedPlayer.name} · {selectedPlayer.position}</p>
      </motion.div>

      {/* Progresso do Álbum (quick view) */}
      {progress.obtained > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mb-3"
        >
          <button
            onClick={() => setShowAlbum(true)}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
                       rounded-2xl p-3 text-white shadow-lg flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
              💎
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold">Álbum de Figurinhas</span>
                {newStickersCount > 0 && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {newStickersCount} nova{newStickersCount > 1 ? 's' : ''}!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-300 rounded-full transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{progress.percentage}%</span>
              </div>
            </div>
            <span className="text-xl">›</span>
          </button>
        </motion.div>
      )}

      {/* Menu cards / Album view */}
      <div className="w-full max-w-sm space-y-3">
        {!showAlbum ? (
          <>
            {menuItems.map((item, i) => (
              <motion.div
                key={item.to || item.id}
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                {item.isAlbum ? (
                  <button
                    onClick={() => setShowAlbum(true)}
                    className="w-full"
                  >
                    <div className="bg-card rounded-2xl shadow-lg border border-border/30 flex items-center gap-4 overflow-hidden active:scale-95 transition-transform relative">
                      <div className={`bg-gradient-to-b ${item.color} w-16 h-16 flex-shrink-0 flex items-center justify-center text-3xl`}>
                        {item.emoji}
                      </div>
                      <div className="flex-1 py-3 pr-3 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-heading font-bold text-base text-foreground leading-tight">{item.label}</p>
                          {newStickersCount > 0 && (
                            <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {newStickersCount}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">{item.desc}</p>
                        {progress.obtained > 0 && (
                          <p className="text-xs text-pink-500 font-semibold mt-0.5">
                            {progress.obtained}/{progress.total} figurinhas
                          </p>
                        )}
                      </div>
                      <span className="pr-4 text-muted-foreground text-xl">›</span>
                    </div>
                  </button>
                ) : (
                  <Link to={item.to}>
                    <div className="bg-card rounded-2xl shadow-lg border border-border/30 flex items-center gap-4 overflow-hidden active:scale-95 transition-transform">
                      <div className={`bg-gradient-to-b ${item.color} w-16 h-16 flex-shrink-0 flex items-center justify-center text-3xl`}>
                        {item.emoji}
                      </div>
                      <div className="flex-1 py-3 pr-3">
                        <p className="font-heading font-bold text-base text-foreground leading-tight">{item.label}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{item.desc}</p>
                      </div>
                      <span className="pr-4 text-muted-foreground text-xl">›</span>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}

            {/* Botão de teste - remover em produção */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + menuItems.length * 0.1 }}
            >
              <TestStickerButton onEarn={(rarity) => earnSticker('test', rarity)} />
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <button
              onClick={() => setShowAlbum(false)}
              className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Voltar
            </button>
            <AlbumView onClose={() => setShowAlbum(false)} />
          </motion.div>
        )}
      </div>

      {/* Values strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 flex gap-3 flex-wrap justify-center"
      >
        {['🤝 Inclusão', '💪 Cooperação', '🧠 Estratégia', '🌟 Diversão'].map((v) => (
          <span key={v} className="text-[11px] font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {v}
          </span>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 text-[10px] text-muted-foreground/60 text-center"
      >
        Futebol como ferramenta de educação e saúde ✊
      </motion.p>
    </div>
  );
}
