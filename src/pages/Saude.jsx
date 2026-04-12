import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Calendar, BookOpen } from 'lucide-react';
import SaudeGame from '@/components/training/SaudeGame';
import DiarioMenstrual from '@/components/training/DiarioMenstrual';

export default function Saude() {
  const [activeTab, setActiveTab] = useState('saude'); // 'saude' | 'diario'

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-400/10 to-background px-4 py-6 font-body">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-heading font-semibold">Início</span>
        </Link>
        <span className="font-heading font-bold text-base">💜 Saúde da Atleta</span>
      </div>

      {/* Abas */}
      <div className="max-w-sm mx-auto mb-4">
        <div className="flex gap-2 bg-muted rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('saude')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'saude' 
                ? 'bg-white shadow-md text-pink-500' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="w-4 h-4" />
            Saúde
          </button>
          <button
            onClick={() => setActiveTab('diario')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'diario' 
                ? 'bg-white shadow-md text-pink-500' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Diário Menstrual
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="max-w-sm mx-auto"
        >
          {activeTab === 'saude' ? <SaudeGame /> : <DiarioMenstrual />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
