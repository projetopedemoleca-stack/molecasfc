import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Trophy, BookOpen, User, Star } from 'lucide-react';
import PlayerAvatar from '@/components/game/PlayerAvatar';
import { PLAYERS } from '@/lib/gameData';
import { loadProfile } from '@/lib/playerProfile';

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
    to: '/training',
    icon: Star,
    label: 'Treino',
    desc: 'Pênalti, passe, dribles e mais!',
    color: 'from-secondary to-yellow-300',
    emoji: '🏋️',
  },
  {
    to: '/story',
    icon: BookOpen,
    label: 'Modo Carreira',
    desc: 'A jornada de uma jogadora!',
    color: 'from-rose-500 to-pink-600',
    emoji: '👑',
  },
  {
    to: '/english',
    icon: Star,
    label: 'Inglês',
    desc: 'Aprenda inglês do futebol!',
    color: 'from-blue-600 to-indigo-700',
    emoji: '🇺🇸',
  },
  {
    to: '/saude',
    icon: Star,
    label: 'Saúde da Atleta',
    desc: 'Higiene, alimentação e diário menstrual',
    color: 'from-pink-400 to-rose-500',
    emoji: '💜',
  },
  {
    to: '/profile',
    icon: User,
    label: 'Meu Perfil',
    desc: 'Time favorito, conquistas e customização',
    color: 'from-blue-500 to-cyan-400',
    emoji: '⭐',
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

export default function Home() {
  const profile = loadProfile();
  const selectedPlayer = PLAYERS.find(p => p.id === (profile.selectedPlayerId || 'luna')) || PLAYERS[0];
  const uniformColor = profile.uniformColor || '#E91E63';
  const shortsColor  = profile.shortsColor  || '#000000';
  const bootsColor   = profile.bootsColor   || '#FFD600';

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
            <PlayerAvatar
              player={selectedPlayer}
              uniformColor={uniformColor}
              shortsColor={shortsColor}
              bootsColor={bootsColor}
              size="lg"
            />
          </div>
        </motion.div>
        <p className="text-xs text-muted-foreground mt-1 font-semibold">
          {selectedPlayer.name} · {selectedPlayer.position}
        </p>
      </motion.div>

      {/* Menu cards */}
      <div className="w-full max-w-sm space-y-3">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
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
          </motion.div>
        ))}
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
