import React from 'react';
import { motion } from 'framer-motion';
import PlayerAvatar from '@/components/game/PlayerAvatar';

export default function PlayerCard({ player, uniformColor, shortsColor, bootsColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center my-4"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ background: uniformColor }} />
        <div className="relative bg-gradient-to-b from-primary/15 to-accent/15 rounded-3xl p-3 shadow-xl border border-white/20 flex items-center justify-center">
          <PlayerAvatar player={player} uniformColor={uniformColor} shortsColor={shortsColor} bootsColor={bootsColor} size="lg" />
        </div>
      </motion.div>
      <p className="text-xs text-muted-foreground mt-1 font-semibold">{player.name} · {player.position}</p>
    </motion.div>
  );
}