import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTIONS } from '@/lib/gameData';

const resultConfig = {
  win:  { text: 'Jogada Vencedora!', emoji: '⚽', color: 'text-primary',     bg: 'bg-primary/10',     border: 'border-primary/30',     msg: 'Avançando no campo! 🏃‍♀️' },
  lose: { text: 'Adversária Venceu', emoji: '🛡️', color: 'text-destructive',  bg: 'bg-destructive/10', border: 'border-destructive/20', msg: 'Recuando posição...'       },
  draw: { text: 'Empate!',           emoji: '🤝', color: 'text-yellow-600',   bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-300/40', msg: 'Nenhuma posição muda' },
};

function ActionCard({ action, label, delay }) {
  if (!action) return null;
  return (
    <motion.div
      initial={{ rotate: label === 'Você' ? -15 : 15, scale: 0, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 18 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg bg-gradient-to-b ${action.color}`}>
        {action.emoji}
      </div>
      <p className="text-xs font-bold text-foreground">{action.name}</p>
      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
    </motion.div>
  );
}

export default function ActionResult({ playerChoice, opponentChoice, result, onContinue }) {
  if (!result) return null;

  const player   = ACTIONS.find((a) => a.id === playerChoice);
  const opponent = ACTIONS.find((a) => a.id === opponentChoice);
  const r = resultConfig[result];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/55 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 140, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className={`${r.bg} border ${r.border} rounded-3xl p-6 shadow-2xl w-full max-w-xs text-center`}
      >
        {/* Action VS display */}
        <div className="flex items-center justify-center gap-5 mb-5">
          <ActionCard action={player} label="Você" delay={0.08}/>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="font-heading font-bold text-xl text-muted-foreground/70"
          >VS</motion.span>
          <ActionCard action={opponent} label="Adversária" delay={0.14}/>
        </div>

        {/* Result */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.32, type: 'spring' }}
          className="mb-5"
        >
          <span className="text-5xl block mb-2">{r.emoji}</span>
          <p className={`font-heading font-bold text-2xl ${r.color}`}>{r.text}</p>
          <p className="text-sm text-muted-foreground mt-1">{r.msg}</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          onClick={onContinue}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-lg active:scale-95 transition-transform shadow-lg"
        >
          Continuar ▶
        </motion.button>
      </motion.div>
    </motion.div>
  );
}