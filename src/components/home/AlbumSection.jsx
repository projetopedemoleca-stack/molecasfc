import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import AlbumView from '@/components/training/AlbumView';

export default function AlbumSection({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
      >
        <ChevronDown className="w-4 h-4 rotate-90" />
        Voltar
      </button>
      <AlbumView onClose={onClose} />
    </motion.div>
  );
}