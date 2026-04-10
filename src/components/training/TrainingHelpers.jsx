import React from 'react';
import { motion } from 'framer-motion';

export function ProgressBar({ value, max, color = 'bg-primary' }) {
  return (
    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
      <motion.div className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        transition={{ duration: 0.4 }} />
    </div>
  );
}

export function LevelBadge({ level }) {
  const stars = Math.min(Math.floor(level / 2) + 1, 5);
  return (
    <div className="flex items-center gap-1.5 bg-card border border-border/40 rounded-full px-3 py-1 shadow-sm">
      <span className="text-xs font-bold text-muted-foreground">Nível</span>
      <span className="font-heading font-bold text-primary text-sm">{level}</span>
      <span className="text-xs">{'⭐'.repeat(stars)}</span>
    </div>
  );
}