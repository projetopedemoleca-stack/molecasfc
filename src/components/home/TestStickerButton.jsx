import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';

export default function TestStickerButton({ onEarn }) {
  const [showOptions, setShowOptions] = useState(false);

  const options = [
    { id: undefined, label: 'Aleatória', color: 'bg-gray-500' },
    { id: 'common', label: 'Comum', color: 'bg-gray-400' },
    { id: 'rare', label: 'Rara', color: 'bg-blue-500' },
    { id: 'epic', label: 'Épica', color: 'bg-purple-500' },
    { id: 'legendary', label: 'Lendária', color: 'bg-amber-500' },
  ];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowOptions(!showOptions)}
        className="w-full py-2 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500
                   text-white shadow-lg flex items-center justify-center gap-2"
      >
        <Gift className="w-5 h-5" />
        🎁 Ganhar Figurinha (Teste)
      </motion.button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl 
                       p-2 space-y-1 z-10"
          >
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  onEarn(option.id);
                  setShowOptions(false);
                }}
                className={`w-full py-2 rounded-lg text-white font-semibold ${option.color}
                           hover:opacity-90 transition-opacity`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}