import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RPS_CHOICES } from '@/lib/gameData';

const resultConfig = {
  win: { text: 'Você Venceu!', emoji: '🎉', color: 'text-primary', bg: 'from-primary/20 to-green-400/10', msg: '⚽ Avança no campo!' },
  lose: { text: 'Você Perdeu!', emoji: '😔', color: 'text-destructive', bg: 'from-destructive/20 to-red-400/10', msg: '🔙 Recua uma posição...' },
  draw: { text: 'Empate!', emoji: '🤝', color: 'text-secondary-foreground', bg: 'from-secondary/20 to-yellow-400/10', msg: '📍 Permanece na posição' },
};

export default function RPSResult({ playerChoice, opponentChoice, result, onContinue }) {
  if (!result) return null;

  const player = RPS_CHOICES.find((c) => c.id === playerChoice);
  const opponent = RPS_CHOICES.find((c) => c.id === opponentChoice);
  const r = resultConfig[result];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`bg-gradient-to-b ${r.bg} bg-card rounded-3xl p-6 shadow-2xl w-full max-w-xs text-center border border-border/30`}
      >
        {/* VS display */}
        <div className="flex items-center justify-center gap-6 mb-5">
          <div className="text-center">
            <motion.span
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="text-5xl block mb-1"
            >
              {player?.emoji}
            </motion.span>
            <span className="text-xs font-bold text-muted-foreground">Você</span>
            <p className="text-[10px] text-muted-foreground">{player?.name}</p>
          </div>

          <span className="font-heading font-bold text-2xl text-muted-foreground">VS</span>

          <div className="text-center">
            <motion.span
              initial={{ rotate: 30, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-5xl block mb-1"
            >
              {opponent?.emoji}
            </motion.span>
            <span className="text-xs font-bold text-muted-foreground">Bot</span>
            <p className="text-[10px] text-muted-foreground">{opponent?.name}</p>
          </div>
        </div>

        {/* Result */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.35, type: 'spring' }}
          className="mb-5"
        >
          <span className="text-5xl block mb-2">{r.emoji}</span>
          <p className={`font-heading font-bold text-2xl ${r.color}`}>{r.text}</p>
          <p className="text-sm text-muted-foreground mt-1">{r.msg}</p>
        </motion.div>

        <button
          onClick={onContinue}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-lg active:scale-95 transition-transform shadow-lg"
        >
          Continuar ▶
        </button>
      </motion.div>
    </motion.div>
  );
}