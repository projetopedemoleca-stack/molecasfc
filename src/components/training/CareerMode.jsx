import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Star } from 'lucide-react';

const CAREER_STORAGE_KEY = 'career_progress';

function loadCareerProgress() {
  try {
    return JSON.parse(localStorage.getItem(CAREER_STORAGE_KEY)) || { level: 1, totalXp: 0, completedChallenges: [] };
  } catch {
    return { level: 1, totalXp: 0, completedChallenges: [] };
  }
}

function saveCareerProgress(data) {
  localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(data));
}

const CHALLENGES = [
  { id: 1, name: 'Primeiro Gol', xp: 100, emoji: '⚽' },
  { id: 2, name: 'Mestre do Passe', xp: 150, emoji: '🎯' },
  { id: 3, name: 'Dribladora Elite', xp: 150, emoji: '⚡' },
  { id: 4, name: 'Poliglota', xp: 200, emoji: '🇺🇸' },
  { id: 5, name: 'Conhecedora de Regras', xp: 200, emoji: '📚' },
  { id: 6, name: 'Lenda do Futsal', xp: 300, emoji: '👑' },
];

export default function CareerMode() {
  const [progress, setProgress] = useState(loadCareerProgress);

  const handleCompleteChallenge = (challengeId, xp) => {
    if (!progress.completedChallenges.includes(challengeId)) {
      const newProgress = {
        ...progress,
        totalXp: progress.totalXp + xp,
        completedChallenges: [...progress.completedChallenges, challengeId],
      };
      newProgress.level = Math.floor(newProgress.totalXp / 500) + 1;
      setProgress(newProgress);
      saveCareerProgress(newProgress);
    }
  };

  const nextLevelXp = progress.level * 500;
  const xpProgress = (progress.totalXp % nextLevelXp) / nextLevelXp;

  return (
    <div className="space-y-5">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <span className="text-5xl block mb-2">👑</span>
        <h2 className="font-heading font-bold text-3xl">Modo Carreira</h2>
        <p className="text-xs text-muted-foreground mt-1">Complete desafios e suba de nível!</p>
      </motion.div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl p-5 border border-primary/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground font-bold">Nível</p>
            <p className="font-heading font-bold text-4xl text-primary">{progress.level}</p>
          </div>
          <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-bold">XP até próximo nível</span>
            <span className="text-muted-foreground">{Math.floor(progress.totalXp % nextLevelXp)}/{nextLevelXp}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-accent" initial={{ width: 0 }} animate={{ width: `${xpProgress * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
      </motion.div>

      <div className="space-y-3">
        {CHALLENGES.map((challenge, idx) => {
          const isCompleted = progress.completedChallenges.includes(challenge.id);
          return (
            <motion.div
              key={challenge.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-2xl border-2 transition-all ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border/30'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{challenge.emoji}</span>
                    <div>
                      <p className="font-heading font-bold text-base">{challenge.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-bold text-yellow-600">+{challenge.xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!isCompleted && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCompleteChallenge(challenge.id, challenge.xp)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-xs hover:shadow-lg transition-all"
                  >
                    Completo
                  </motion.button>
                )}
                {isCompleted && <span className="text-green-600 font-bold text-sm">✓</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-card border border-border/30 rounded-2xl p-4 text-center text-xs text-muted-foreground">
        <p>📊 {progress.completedChallenges.length}/{CHALLENGES.length} desafios completados</p>
      </div>
    </div>
  );
}