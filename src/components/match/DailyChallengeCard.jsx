import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock } from 'lucide-react';

const CHALLENGES = [
  { id: 1, title: 'Vitória Relâmpago', desc: 'Ganhe a partida em menos de 3 minutos', emoji: '⚡', color: 'from-yellow-500 to-orange-500' },
  { id: 2, title: 'Sem Erros', desc: 'Vença com 0 derrotas', emoji: '🛡️', color: 'from-blue-500 to-cyan-500' },
  { id: 3, title: 'Dominadora', desc: 'Marque 3+ gols', emoji: '⚽', color: 'from-green-500 to-emerald-500' },
  { id: 4, title: 'Goleira Invencível', desc: 'Vença sem levar gol', emoji: '🧤', color: 'from-red-500 to-pink-500' },
  { id: 5, title: 'Sorte do Iniciante', desc: 'Vença qualquer partida no nível fácil', emoji: '🌟', color: 'from-purple-500 to-violet-500' },
];

function getTodayChallenge() {
  const today = new Date().toDateString();
  const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return CHALLENGES[seed % CHALLENGES.length];
}

function getDailyChallengeStatus() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('daily_challenge_date');
  const status = localStorage.getItem('daily_challenge_completed');
  if (stored === today && status === 'true') return 'completed';
  if (stored === today) return 'active';
  return 'available';
}

function markChallengeCompleted() {
  localStorage.setItem('daily_challenge_date', new Date().toDateString());
  localStorage.setItem('daily_challenge_completed', 'true');
}

export { getTodayChallenge, getDailyChallengeStatus, markChallengeCompleted };

export default function DailyChallengeCard({ onAccept }) {
  const status = getDailyChallengeStatus();
  const challenge = getTodayChallenge();

  if (status === 'completed') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/30 rounded-3xl p-5 text-center">
        <p className="text-4xl mb-2">✅</p>
        <p className="font-heading font-bold text-green-700 dark:text-green-400">Desafio Completado!</p>
        <p className="text-xs text-muted-foreground mt-1">Você já ganhou a recompensa hoje</p>
        <p className="text-sm mt-3 font-bold text-green-600">📦 +3 Figurinhas desbloqueadas!</p>
        <p className="text-xs text-muted-foreground mt-1">Volte amanhã para novo desafio</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${challenge.color} border-2 border-current/30 rounded-3xl p-5 text-center`}
      style={{ opacity: 0.9 }}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-3xl">{challenge.emoji}</span>
        <Sparkles className="w-5 h-5 text-yellow-500" />
      </div>
      <p className="font-heading font-bold text-xl mb-1">{challenge.title}</p>
      <p className="text-sm text-muted-foreground mb-3">{challenge.desc}</p>
      <div className="bg-white/10 rounded-xl px-3 py-2 mb-4">
        <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400">🎁 Recompensa: +3 Figurinhas Fofas</p>
      </div>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onAccept}
        className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-2xl font-heading font-bold shadow-lg hover:shadow-xl transition-all">
        ⭐ Aceitar Desafio!
      </motion.button>
    </motion.div>
  );
}