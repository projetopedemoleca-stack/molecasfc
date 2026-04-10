import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PLAYERS_WITH_EVOLUTION,
  LEVEL_SYSTEM,
  LEVEL_REWARDS,
  calculateXP,
  levelUp,
  getUnlockedItems,
} from '@/lib/avatarSystem';
import { loadProfile, saveProfile } from '@/lib/playerProfile';
import { Star, Trophy, Lock, Unlock, Sparkles, ChevronRight, Gift, Zap } from 'lucide-react';

function RewardCard({ level, reward, isUnlocked, isCurrent }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className={`relative p-4 rounded-2xl border-2 ${
        isUnlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400'
          : isCurrent ? 'bg-primary/10 border-primary'
          : 'bg-muted/30 border-muted'
      }`}
    >
      <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        isUnlocked ? 'bg-yellow-400 text-yellow-900'
          : isCurrent ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      }`}>{level}</div>

      <div className="text-4xl mb-2">
        {reward.type === 'uniform' && '👕'}
        {reward.type === 'boots' && '👟'}
        {reward.type === 'accessory' && '✨'}
        {reward.type === 'title' && '🏆'}
        {reward.type === 'effect' && '🌟'}
      </div>

      <p className={`font-bold text-sm ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
        {reward.message}
      </p>

      <div className="mt-2 flex items-center gap-1">
        {isUnlocked ? (
          <><Unlock className="w-4 h-4 text-green-500" /><span className="text-xs text-green-600 font-bold">Desbloqueado!</span></>
        ) : isCurrent ? (
          <><Sparkles className="w-4 h-4 text-primary" /><span className="text-xs text-primary font-bold">Próximo!</span></>
        ) : (
          <><Lock className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Bloqueado</span></>
        )}
      </div>
    </motion.div>
  );
}

function LevelUpAnimation({ level, stage, reward, onComplete }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onComplete}
      >
        <motion.div initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, y: -100 }}
          className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-3xl p-8 max-w-sm w-full text-center text-white relative overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i} className="absolute text-2xl"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300 - 100, opacity: 0 }}
              transition={{ duration: 1.5, delay: i * 0.05 }}
            >
              {['✨', '🎉', '🌟', '💫', '⭐'][i % 5]}
            </motion.div>
          ))}

          <motion.div animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} transition={{ duration: 1 }} className="text-6xl mb-4">
            🎊
          </motion.div>
          <h2 className="font-heading font-bold text-3xl mb-2">LEVEL UP!</h2>
          <div className="text-5xl font-bold mb-4">Nível {level}</div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="text-xl font-bold mb-4 capitalize">{stage}</motion.div>

          {reward && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6">
              <Gift className="w-8 h-8 mx-auto mb-2" />
              <p className="font-bold">{reward.message}</p>
            </motion.div>
          )}

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onComplete}
            className="bg-white text-orange-500 font-bold px-8 py-3 rounded-2xl shadow-lg">
            Continuar 🎉
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AvatarEvolution({ playerId, matchResult, onComplete }) {
  const basePlayer = PLAYERS_WITH_EVOLUTION.find(p => p.id === playerId) || PLAYERS_WITH_EVOLUTION[0];
  const profile = loadProfile();
  const savedEvolution = profile?.playerEvolution?.[playerId] || basePlayer.evolution;

  const [currentXP, setCurrentXP] = useState(savedEvolution.xp || 0);
  const [currentLevel, setCurrentLevel] = useState(savedEvolution.level || 1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const earnedXP = matchResult ? calculateXP(matchResult) : 0;

  useEffect(() => {
    if (!matchResult || earnedXP === 0) return;

    setIsProcessing(true);
    let accumulatedXP = (savedEvolution.xp || 0) + earnedXP;
    let newLevel = savedEvolution.level || 1;

    const timer = setTimeout(() => {
      const playerForLevelUp = { ...basePlayer, evolution: { ...savedEvolution, level: newLevel, xp: accumulatedXP } };
      const requiredXP = LEVEL_SYSTEM.getRequiredXP(newLevel);

      if (accumulatedXP >= requiredXP) {
        const newLvl = newLevel + 1;
        const newStage = newLvl >= 15 ? 'lenda' : newLvl >= 10 ? 'estrela' : newLvl >= 5 ? 'promissora' : 'iniciante';
        const reward = LEVEL_REWARDS[newLvl];
        const remaining = accumulatedXP - requiredXP;

        setLevelUpData({ level: newLvl, stage: newStage, reward });
        setShowLevelUp(true);
        setCurrentLevel(newLvl);
        setCurrentXP(remaining);

        const p = loadProfile();
        saveProfile({ ...p, playerEvolution: { ...(p.playerEvolution || {}), [playerId]: { level: newLvl, stage: newStage, xp: remaining, unlockedItems: savedEvolution.unlockedItems } } });
      } else {
        setCurrentXP(accumulatedXP);
        setIsProcessing(false);
        const p = loadProfile();
        saveProfile({ ...p, playerEvolution: { ...(p.playerEvolution || {}), [playerId]: { ...savedEvolution, xp: accumulatedXP, level: newLevel } } });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [matchResult]);

  const handleLevelUpComplete = () => {
    setShowLevelUp(false);
    setIsProcessing(false);
    onComplete?.();
  };

  const unlockedItems = getUnlockedItems(currentLevel);
  const nextRewardLevel = Object.keys(LEVEL_REWARDS).map(Number).find(l => l > currentLevel);
  const nextReward = nextRewardLevel ? LEVEL_REWARDS[nextRewardLevel] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="text-center mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block text-6xl mb-2">
          {basePlayer.baseAvatar}
        </motion.div>
        <h1 className="font-heading font-bold text-2xl">{basePlayer.name}</h1>
        <p className="text-muted-foreground">{basePlayer.position}</p>
      </div>

      {earnedXP > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border border-green-300 rounded-2xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <Zap className="w-5 h-5" />
            <span className="font-bold">+{earnedXP} XP ganho!</span>
          </div>
        </motion.div>
      )}

      <div className="bg-card border border-border/30 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">Nível {currentLevel}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentXP} / {LEVEL_SYSTEM.getRequiredXP(currentLevel)} XP
          </span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentXP / LEVEL_SYSTEM.getRequiredXP(currentLevel)) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{currentLevel}</span>
          <span>{currentLevel + 1}</span>
        </div>
      </div>

      {nextReward && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-primary" />
            <span className="font-bold">Próxima recompensa (Nv. {nextRewardLevel})</span>
          </div>
          <p className="text-sm text-muted-foreground">{nextReward.message}</p>
        </motion.div>
      )}

      <div className="space-y-4">
        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Recompensas por Nível
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(LEVEL_REWARDS).slice(0, 10).map(([level, reward]) => (
            <RewardCard key={level} level={Number(level)} reward={reward}
              isUnlocked={Number(level) <= currentLevel}
              isCurrent={Number(level) === currentLevel + 1}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
          <Unlock className="w-5 h-5 text-green-500" /> Itens Desbloqueados
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {[...unlockedItems.uniforms, ...unlockedItems.boots].map(item => (
            <div key={item.id} className="bg-card border border-border/30 rounded-xl p-3 text-center">
              <span className="text-2xl">{item.emoji}</span>
              <p className="text-xs font-bold mt-1">{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <motion.button whileTap={{ scale: 0.95 }} onClick={onComplete} disabled={isProcessing}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-lg shadow-lg disabled:opacity-50">
          {isProcessing ? 'Processando...' : 'Continuar'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showLevelUp && levelUpData && (
          <LevelUpAnimation level={levelUpData.level} stage={levelUpData.stage}
            reward={levelUpData.reward} onComplete={handleLevelUpComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}