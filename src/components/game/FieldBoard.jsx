import React from 'react';
import { motion } from 'framer-motion';
import { FIELD_ZONES } from '@/lib/gameData';

export default function FieldBoard({ playerPosition, opponentPosition }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative bg-green-700 rounded-2xl overflow-hidden border-4 border-green-800 shadow-xl">
        {/* Field markings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/20" />
        </div>

        {/* Opponent goal top */}
        <div className="relative z-10 bg-red-900/40 flex items-center justify-center py-1.5 border-b border-white/10">
          <span className="text-[10px] font-bold text-white/70">🥅 Gol do Bot</span>
        </div>

        {/* Zones - reversed so opponent goal is at top */}
        <div className="relative z-10 flex flex-col gap-1 p-2">
          {[...FIELD_ZONES].reverse().map((zone) => {
            const isPlayerHere = playerPosition === zone.id;
            const isOpponentHere = opponentPosition === zone.id;
            const isBoth = isPlayerHere && isOpponentHere;

            return (
              <div
                key={zone.id}
                className={`relative py-2 px-3 rounded-xl transition-all flex items-center justify-between ${
                  isPlayerHere && !isBoth
                    ? 'bg-primary/30 ring-2 ring-primary/60'
                    : isOpponentHere && !isBoth
                    ? 'bg-red-500/20 ring-2 ring-red-400/60'
                    : isBoth
                    ? 'bg-yellow-400/20 ring-2 ring-yellow-400/60'
                    : 'bg-white/5'
                }`}
              >
                <span className="text-[11px] text-white/80 font-semibold">
                  {zone.emoji} {zone.name}
                </span>
                <div className="flex items-center gap-1">
                  {isPlayerHere && (
                    <motion.span
                      key={`p-${zone.id}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-base"
                    >
                      ⚽
                    </motion.span>
                  )}
                  {isOpponentHere && (
                    <motion.span
                      key={`o-${zone.id}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-base"
                    >
                      🔴
                    </motion.span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Player goal bottom */}
        <div className="relative z-10 bg-primary/20 flex items-center justify-center py-1.5 border-t border-white/10">
          <span className="text-[10px] font-bold text-white/70">🥅 Seu Gol</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <span>⚽ Você</span>
        <span>🔴 Bot</span>
      </div>
    </div>
  );
}