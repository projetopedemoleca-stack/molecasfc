import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import EnglishGame from '@/components/training/EnglishGame';

export default function English() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600/10 to-background px-4 py-6 font-body">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-heading font-semibold">Início</span>
        </Link>
        <span className="font-heading font-bold text-base">🇺🇸 Inglês</span>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm mx-auto"
      >
        <EnglishGame />
      </motion.div>
    </div>
  );
}
