import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RPS_CHOICES } from '@/lib/gameData';

const choiceColors = {
  rock: 'from-blue-500 to-blue-600',
  paper: 'from-green-500 to-green-600',
  scissors: 'from-pink-500 to-rose-600',
};

export default function RPSSelector({ onSelect, disabled, streak }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence>
        {streak >= 3 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center mb-3 bg-gradient-to-r from-accent/30 to-secondary/30 border border-accent/40 rounded-2xl py-2 px-3"
          >
            <span className="text-sm font-bold text-accent">
              🔥 {streak} em sequência! Jogada especial chegando!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak bar */}
      {streak > 0 && streak < 3 && (
        <div className="flex justify-center gap-1.5 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`w-6 h-1.5 rounded-full ${i < streak ? 'bg-accent' : 'bg-muted'}`} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1 self-center">{streak}/3 para especial</span>
        </div>
      )}

      <p className="text-center font-heading font-bold text-base mb-2 text-muted-foreground">Escolha sua jogada</p>

      <div className="flex gap-2">
        {RPS_CHOICES.map((choice, i) => (
          <motion.button
            key={choice.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.88 }}
            disabled={disabled}
            onClick={() => onSelect(choice.id)}
            className={`flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-gradient-to-b ${choiceColors[choice.id]} shadow-lg active:shadow-md transition-all ${
              disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span className="text-4xl">{choice.emoji}</span>
            <span className="font-heading font-bold text-white text-xs">{choice.name}</span>
            <span className="text-[9px] text-white/80 leading-tight text-center">{choice.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}