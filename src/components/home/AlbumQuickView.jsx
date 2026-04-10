import React from 'react';
import { motion } from 'framer-motion';

export default function AlbumQuickView({ progress, newStickersCount, onOpen }) {
  if (progress.obtained === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mb-3"
    >
      <button
        onClick={onOpen}
        className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
                   rounded-2xl p-3 text-white shadow-lg flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
          💎
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold">Álbum de Figurinhas</span>
            {newStickersCount > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {newStickersCount} nova{newStickersCount > 1 ? 's' : ''}!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-300 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-sm font-bold">{progress.percentage}%</span>
          </div>
        </div>
        <span className="text-xl">›</span>
      </button>
    </motion.div>
  );
}