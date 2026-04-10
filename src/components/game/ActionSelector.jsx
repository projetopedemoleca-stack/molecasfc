import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTIONS } from '@/lib/gameData';

export default function ActionSelector({ onSelect, disabled, streak, suspense }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Streak indicator */}
      <AnimatePresence>
        {streak >= 3 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center mb-3 bg-gradient-to-r from-accent/30 to-secondary/30 border border-accent/40 rounded-2xl py-2 px-3"
          >
            <span className="text-sm font-bold text-accent">🔥 {streak} em sequência! Jogada especial!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {streak > 0 && streak < 3 && (
        <div className="flex justify-center items-center gap-1.5 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`w-7 h-1.5 rounded-full ${i < streak ? 'bg-accent' : 'bg-muted'}`} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">{streak}/3</span>
        </div>
      )}

      {/* Suspense overlay */}
      <AnimatePresence>
        {suspense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-4 flex items-center justify-center"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.15 }}
                  className="w-3 h-3 bg-primary rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center font-heading font-bold text-base mb-2 text-muted-foreground">Escolha sua jogada</p>

      {/* Triangle hint */}
      <div className="flex justify-center gap-2 mb-3 text-[10px] text-muted-foreground">
        <span>🎯 Passe &gt; Chute</span>
        <span>·</span>
        <span>⚡ Drible &gt; Passe</span>
        <span>·</span>
        <span>🔥 Chute &gt; Drible</span>
      </div>

      <div className="flex gap-2">
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.88 }}
            disabled={disabled}
            onClick={() => onSelect(action.id)}
            className={`flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-gradient-to-b ${action.color} shadow-lg transition-all ${
              disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span className="text-4xl">{action.emoji}</span>
            <span className="font-heading font-bold text-white text-xs">{action.name}</span>
            <span className="text-[9px] text-white/80 leading-tight text-center">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}