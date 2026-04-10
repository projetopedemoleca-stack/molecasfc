import React from 'react';
import { motion } from 'framer-motion';

// Compute medal based on performance metrics
export function computeMedal({ won, playerScore, opponentScore, turns, actionCounts }) {
  if (!won) {
    // Even in loss, can get bronze for effort
    if (playerScore >= 2) return 'bronze';
    return null;
  }
  const total = (actionCounts.pass || 0) + (actionCounts.dribble || 0) + (actionCounts.shoot || 0);
  const diversity = Object.values(actionCounts).filter((v) => v >= 2).length;
  const goalsRatio = playerScore / Math.max(1, opponentScore + playerScore);

  if (goalsRatio >= 0.6 && diversity >= 2 && turns <= 25) return 'gold';
  if (goalsRatio >= 0.5 || diversity >= 2) return 'silver';
  return 'bronze';
}

const MEDAL_CONFIG = {
  gold: { emoji: '🥇', label: 'Medalha de Ouro', color: 'from-yellow-400 to-amber-500', desc: 'Incrível! Você jogou com estratégia, variando suas jogadas. Craque!' },
  silver: { emoji: '🥈', label: 'Medalha de Prata', color: 'from-slate-300 to-slate-400', desc: 'Ótimo jogo! Continue desenvolvendo sua estratégia.' },
  bronze: { emoji: '🥉', label: 'Medalha de Bronze', color: 'from-amber-600 to-orange-700', desc: 'Boa luta! Cada partida é um aprendizado.' },
};

export default function MatchReward({ won, playerScore, opponentScore, turns, actionCounts }) {
  const medal = computeMedal({ won, playerScore, opponentScore, turns, actionCounts });
  if (!medal) return null;

  const cfg = MEDAL_CONFIG[medal];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring' }}
      className={`bg-gradient-to-r ${cfg.color} rounded-2xl p-4 text-white shadow-lg mb-4`}
    >
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-4xl shrink-0"
        >
          {cfg.emoji}
        </motion.span>
        <div>
          <p className="font-heading font-bold text-base">{cfg.label}</p>
          <p className="text-xs text-white/85 mt-0.5">{cfg.desc}</p>
        </div>
      </div>

      {/* Action breakdown */}
      <div className="flex gap-3 mt-3 pt-3 border-t border-white/20">
        {[
          { id: 'pass', emoji: '🎯', label: 'Passes' },
          { id: 'dribble', emoji: '⚡', label: 'Dribles' },
          { id: 'shoot', emoji: '🔥', label: 'Chutes' },
        ].map(({ id, emoji, label }) => (
          <div key={id} className="flex-1 text-center">
            <span className="text-lg block">{emoji}</span>
            <span className="font-bold text-sm block">{actionCounts[id] || 0}</span>
            <span className="text-[9px] text-white/70">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}