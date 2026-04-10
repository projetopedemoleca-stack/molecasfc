import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { loadProfile } from '@/lib/playerProfile';

// ── MEDALHAS (condições simples, baseadas nas stats salvas) ──────
const MEDALS = [
  {
    id: 'first_win',
    name: 'Primeira Vitória',
    emoji: '🥇',
    desc: 'Vença sua primeira partida',
    condition: (s) => (s.wins || 0) >= 1,
  },
  {
    id: '3_goals',
    name: 'Artilheira',
    emoji: '⚽',
    desc: 'Marque 3 gols em partidas',
    condition: (s) => (s.goals || 0) >= 3,
  },
  {
    id: 'streak_3',
    name: 'Em Chamas',
    emoji: '🔥',
    desc: 'Vença 3 partidas seguidas',
    condition: (s) => (s.bestStreak || 0) >= 3,
  },
  {
    id: 'pass_master',
    name: 'Mestra do Passe',
    emoji: '🎯',
    desc: 'Use o Passe 10 vezes',
    condition: (s) => (s.passUsed || 0) >= 10,
  },
  {
    id: 'dribble_5',
    name: 'Dribladora',
    emoji: '🌀',
    desc: 'Use o Drible 10 vezes',
    condition: (s) => (s.dribbleUsed || 0) >= 10,
  },
  {
    id: 'shoot_5',
    name: 'Chutadora',
    emoji: '💥',
    desc: 'Use o Chute 10 vezes',
    condition: (s) => (s.shootUsed || 0) >= 10,
  },
];

// ── TROFÉUS (condições mais difíceis) ───────────────────────────
const TROPHIES = [
  {
    id: 'story',
    name: 'Campeã do Torneio',
    emoji: '🏆',
    desc: 'Complete o Modo História',
    condition: (s) => !!s.storyCompleted,
  },
  {
    id: 'veteran',
    name: 'Veterana',
    emoji: '🌟',
    desc: 'Jogue 20 partidas',
    condition: (s) => (s.matches || 0) >= 20,
  },
  {
    id: 'sniper',
    name: 'Sniper',
    emoji: '🎖️',
    desc: 'Marque 20 gols no total',
    condition: (s) => (s.goals || 0) >= 20,
  },
  {
    id: 'queen_dribble',
    name: 'Rainha do Drible',
    emoji: '⚡',
    desc: 'Use o Drible 30 vezes',
    condition: (s) => (s.dribbleUsed || 0) >= 30,
  },
  {
    id: 'streak_5',
    name: 'Invencível',
    emoji: '🛡️',
    desc: 'Sequência de 5 vitórias',
    condition: (s) => (s.bestStreak || 0) >= 5,
  },
  {
    id: 'all_medals',
    name: 'Completa',
    emoji: '💎',
    desc: 'Desbloqueie todas as medalhas',
    condition: (s) => MEDALS.every(m => m.condition(s)),
  },
];

// ── CARD DE CONQUISTA ────────────────────────────────────────────
function AchCard({ emoji, name, desc, isUnlocked, isTrophy, delay }) {
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
      className={`p-4 rounded-2xl border text-center transition-all ${
        isUnlocked
          ? isTrophy
            ? 'bg-gradient-to-b from-yellow-500/20 to-card border-yellow-400/50 shadow-lg'
            : 'bg-card border-primary/40 shadow-md'
          : 'bg-muted/30 border-border/20 opacity-50'
      }`}
    >
      <span className={`text-3xl block mb-1.5 ${!isUnlocked ? 'grayscale opacity-40' : ''}`}>{emoji}</span>
      <p className="font-heading font-bold text-sm leading-tight">{name}</p>
      <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{desc}</p>
      {isUnlocked ? (
        <span className="inline-block mt-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
          ✓ {isTrophy ? 'Desbloqueado!' : 'Conquistada!'}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
          <Lock className="w-2.5 h-2.5" /> Bloqueado
        </span>
      )}
    </motion.div>
  );
}

// ── PÁGINA PRINCIPAL ─────────────────────────────────────────────
export default function Achievements() {
  const profile = loadProfile();
  const stats = profile?.stats || {};

  const unlockedMedals   = MEDALS.filter(m => m.condition(stats)).length;
  const unlockedTrophies = TROPHIES.filter(t => t.condition(stats)).length;
  const total            = MEDALS.length + TROPHIES.length;
  const totalUnlocked    = unlockedMedals + unlockedTrophies;
  const pct              = total > 0 ? Math.round((totalUnlocked / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-500/10 to-background px-4 py-6 font-body">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-heading font-semibold">Voltar</span>
      </Link>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-3">
        <span className="text-5xl block mb-2">🏅</span>
        <h1 className="font-heading text-3xl font-bold">Conquistas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {totalUnlocked} de {total} desbloqueadas
        </p>
      </motion.div>

      {/* Barra de progresso */}
      <div className="max-w-sm mx-auto mb-6 mt-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progresso geral</span>
          <span className="font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="h-full bg-gradient-to-r from-primary to-yellow-400 rounded-full"
          />
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: 'Partidas', v: stats.matches || 0, emoji: '🎮' },
            { label: 'Vitórias', v: stats.wins || 0, emoji: '🏆' },
            { label: 'Gols', v: stats.goals || 0, emoji: '⚽' },
            { label: 'Sequência', v: stats.bestStreak || 0, emoji: '🔥' },
          ].map(({ label, v, emoji }) => (
            <div key={label} className="bg-card rounded-xl p-2 text-center border border-border/30">
              <span className="text-base">{emoji}</span>
              <p className="font-heading font-bold text-base">{v}</p>
              <p className="text-[9px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6 pb-8">
        {/* Medalhas */}
        <div>
          <h2 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            🏅 Medalhas
            <span className="text-sm font-normal text-muted-foreground">({unlockedMedals}/{MEDALS.length})</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MEDALS.map((m, i) => (
              <AchCard
                key={m.id}
                emoji={m.emoji}
                name={m.name}
                desc={m.desc}
                isUnlocked={m.condition(stats)}
                isTrophy={false}
                delay={i * 0.06}
              />
            ))}
          </div>
        </div>

        {/* Troféus */}
        <div>
          <h2 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            🏆 Troféus
            <span className="text-sm font-normal text-muted-foreground">({unlockedTrophies}/{TROPHIES.length})</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {TROPHIES.map((t, i) => (
              <AchCard
                key={t.id}
                emoji={t.emoji}
                name={t.name}
                desc={t.desc}
                isUnlocked={t.condition(stats)}
                isTrophy={true}
                delay={0.4 + i * 0.07}
              />
            ))}
          </div>
        </div>

        {/* Dica motivacional */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="bg-card border border-border/30 rounded-2xl p-4 text-center shadow-sm"
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            💪 <span className="font-semibold text-foreground">
              Jogue mais partidas, use os treinos e explore o Modo História
            </span>{' '}
            para desbloquear todas as conquistas!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
