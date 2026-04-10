import React from 'react';
import { motion } from 'framer-motion';

const GOALS_TO_WIN = 3;

function GoalDots({ score, align = 'left' }) {
  return (
    <div className={`flex gap-1 ${align === 'right' ? 'flex-row-reverse justify-end' : ''}`}>
      {Array.from({ length: GOALS_TO_WIN }).map((_, i) => (
        <motion.div
          key={i}
          animate={i < score ? { scale: [1.3, 1] } : {}}
          className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
            i < score
              ? align === 'left' ? 'bg-primary border-primary' : 'bg-destructive border-destructive'
              : 'bg-transparent border-border/50'
          }`}
        />
      ))}
    </div>
  );
}

export default function ScoreBoard({ playerTeam, opponentTeam, playerScore, opponentScore, turn }) {
  return (
    <div className="bg-card rounded-2xl px-3 py-2.5 shadow-lg border border-border/40 mb-3">
      <div className="flex items-center">
        {/* Player team */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl shrink-0">{playerTeam.emoji}</span>
            <p className="font-heading font-bold text-xs truncate">{playerTeam.name}</p>
          </div>
          <GoalDots score={playerScore} align="left"/>
        </div>

        {/* Score center */}
        <div className="flex items-center gap-1.5 px-3 shrink-0">
          <motion.span
            key={playerScore}
            initial={{ scale: 1.4, color: '#22c55e' }}
            animate={{ scale: 1, color: 'hsl(var(--primary))' }}
            className="font-heading font-bold text-4xl text-primary"
          >
            {playerScore}
          </motion.span>
          <span className="font-heading text-xl text-muted-foreground/60">–</span>
          <motion.span
            key={opponentScore}
            initial={{ scale: 1.4, color: '#ef4444' }}
            animate={{ scale: 1, color: 'hsl(var(--destructive))' }}
            className="font-heading font-bold text-4xl text-destructive"
          >
            {opponentScore}
          </motion.span>
        </div>

        {/* Opponent team */}
        <div className="flex flex-col gap-1 flex-1 items-end min-w-0">
          <div className="flex items-center gap-1.5 justify-end">
            <p className="font-heading font-bold text-xs truncate">{opponentTeam.name}</p>
            <span className="text-2xl shrink-0">{opponentTeam.emoji}</span>
          </div>
          <GoalDots score={opponentScore} align="right"/>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="flex items-center gap-2 mt-2">
        <div className="h-px flex-1 bg-border/40"/>
        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full whitespace-nowrap">
          ⏱ Turno {turn} · Melhor de 3
        </span>
        <div className="h-px flex-1 bg-border/40"/>
      </div>
    </div>
  );
}