import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { TEAMS } from '@/lib/gameData';
import { audio } from '@/lib/audioEngine';
import MatchReward from '@/components/results/MatchReward';
import { loadProfile, saveProfile, addMatchXP, getLevelInfo } from '@/lib/playerProfile';

const confettiItems = ['⭐', '🎉', '🏆', '⚽', '🌟', '💫', '🎊', '✨'];

export default function Results() {
  const urlParams = new URLSearchParams(window.location.search);
  const won = urlParams.get('won') === 'true';
  const ps = parseInt(urlParams.get('ps') || '0');
  const os = parseInt(urlParams.get('os') || '0');
  const turns = parseInt(urlParams.get('turns') || '20');
  const teamId = urlParams.get('team');
  const opponentId = urlParams.get('opponent');

  let actionCounts = { pass: 0, dribble: 0, shoot: 0 };
  try { actionCounts = JSON.parse(decodeURIComponent(urlParams.get('ac') || '{}')); } catch {}

  const playerTeam = TEAMS.find((t) => t.id === teamId) || TEAMS[0];
  const opponentTeam = TEAMS.find((t) => t.id === opponentId) || TEAMS[1] || TEAMS[0];

  const draw = ps === os;
  const [xpInfo, setXpInfo] = useState(null);

  useEffect(() => {
    if (won) audio.playGoal();
    else audio.playLose();

    // Persist stats to profile
    const profile = loadProfile();
    const prev = profile.stats || {};
    const passWinsBonus = (won && actionCounts.pass > actionCounts.dribble && actionCounts.pass > actionCounts.shoot) ? 1 : 0;
    const updated = {
      ...profile,
      stats: {
        ...prev,
        matches: (prev.matches || 0) + 1,
        wins: (prev.wins || 0) + (won ? 1 : 0),
        passUsed: (prev.passUsed || 0) + (actionCounts.pass || 0),
        dribbleUsed: (prev.dribbleUsed || 0) + (actionCounts.dribble || 0),
        shootUsed: (prev.shootUsed || 0) + (actionCounts.shoot || 0),
        passWins: (prev.passWins || 0) + (actionCounts.pass || 0) + passWinsBonus,
      },
    };
    saveProfile(updated);

    // Adiciona XP e verifica level up
    const playerId = urlParams.get('player') || profile.selectedPlayerId || 'luna';
    const info = addMatchXP({ playerId, teamId: teamId || 'pe_de_moleca', won, draw });
    setXpInfo(info);
  }, []);

  const messages = won
    ? ['Incrível! Você é demais! 🌟', 'Que partida fantástica! 🎊', 'Campeã! Assim se faz! 🏆']
    : ['Não desista! Você vai melhorar! 💪', 'Boa luta! Tente de novo! 🔄', 'Persistência é tudo! 🌱'];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background flex flex-col items-center justify-center px-4 py-8 font-body overflow-hidden">
      {/* Confetti */}
      {won && Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -30, x: (i % 9) * 45, opacity: 1, rotate: 0 }}
          animate={{ y: 900, rotate: 360 * (i % 2 === 0 ? 1 : -1), opacity: 0 }}
          transition={{ duration: 2.5 + (i % 3) * 0.5, delay: (i % 5) * 0.15, ease: 'easeIn' }}
          className="fixed top-0 text-2xl pointer-events-none z-10"
        >
          {confettiItems[i % confettiItems.length]}
        </motion.div>
      ))}

      {/* Result hero */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="text-center mb-4"
      >
        <motion.span
          animate={won ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-8xl block mb-3"
        >
          {won ? '🏆' : '💪'}
        </motion.span>
        <h1 className="font-heading text-4xl font-bold">{won ? 'VITÓRIA!' : 'Boa Luta!'}</h1>
        <p className="text-muted-foreground mt-2 text-base">{msg}</p>
      </motion.div>

      <div className="w-full max-w-xs">
        {/* Score card */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-3xl p-5 shadow-xl border border-border/50 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-4xl block mb-1">{playerTeam.emoji}</span>
              <p className="font-heading font-bold text-xs">{playerTeam.name}</p>
              <p className="text-[10px] text-muted-foreground">Você</p>
            </div>
            <div className="text-center px-3">
              <p className="font-heading font-bold text-5xl">
                <span className="text-primary">{ps}</span>
                <span className="text-muted-foreground mx-1 text-3xl">×</span>
                <span className="text-destructive">{os}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{turns} turnos</p>
            </div>
            <div className="text-center flex-1">
              <span className="text-4xl block mb-1">{opponentTeam.emoji}</span>
              <p className="font-heading font-bold text-xs">{opponentTeam.name}</p>
              <p className="text-[10px] text-muted-foreground">Bot</p>
            </div>
          </div>
        </motion.div>

        {/* XP earned panel */}
        {xpInfo && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-card rounded-2xl p-4 border border-border/30 shadow mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-bold text-sm">{won ? '⚡ XP Ganho!' : '✨ XP da Partida'}</span>
              <span className="font-heading font-bold text-primary text-lg">+{xpInfo.xpGain} XP</span>
            </div>
            {/* Global level bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                <span>⭐ Nível Global {xpInfo.globalLevel}</span>
                <span>{getLevelInfo(xpInfo.globalXP).xpInLevel}/100</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${getLevelInfo(xpInfo.globalXP).xpInLevel}%` }}
                  transition={{ duration: 0.8, delay: 0.8 }} className="h-full bg-primary rounded-full" />
              </div>
            </div>
            {/* Team level bar */}
            <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
              <span>🏅 Time — Nível {xpInfo.teamLevel}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${getLevelInfo((xpInfo.teamLevel - 1) * 100 + (xpInfo.xpGain % 100)).xpInLevel}%` }}
                transition={{ duration: 0.8, delay: 1 }} className="h-full bg-secondary rounded-full" />
            </div>
            {xpInfo.globalLevelUp && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring' }}
                className="mt-3 text-center bg-primary/10 rounded-xl py-2">
                <p className="font-heading font-bold text-primary text-sm">🎉 LEVEL UP! Nível Global {xpInfo.globalLevel}!</p>
                <p className="text-[10px] text-muted-foreground">Novas jogadoras/times podem ter sido desbloqueados!</p>
              </motion.div>
            )}
            {xpInfo.teamLevelUp && !xpInfo.globalLevelUp && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring' }}
                className="mt-3 text-center bg-secondary/10 rounded-xl py-2">
                <p className="font-heading font-bold text-secondary-foreground text-sm">📈 Time subiu para Nível {xpInfo.teamLevel}!</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Medal reward */}
        <MatchReward won={won} playerScore={ps} opponentScore={os} turns={turns} actionCounts={actionCounts} />

        {/* Actions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-2"
        >
          <Link to={`/match?team=${teamId}&opponent=${opponentId}&difficulty=medium`}>
            <button className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
              <RotateCcw className="w-5 h-5" />
              Jogar Novamente
            </button>
          </Link>
          <Link to="/team-select">
            <button className="w-full py-3 bg-card text-foreground rounded-2xl font-heading font-semibold border border-border/50 flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2">
              🔄 Trocar Time
            </button>
          </Link>
          <Link to="/">
            <button className="w-full py-3 text-muted-foreground font-semibold text-sm flex items-center justify-center gap-1 mt-1">
              <Home className="w-4 h-4" />
              Início
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}