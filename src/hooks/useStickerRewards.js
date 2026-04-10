/**
 * Hook para gerenciar recompensas de figurinhas em diferentes contextos
 * - Mini games
 * - Lições de inglês
 * - Modo Carreira
 * - Modo História
 */

import { useCallback } from 'react';
import { useStickerAlbum } from './useStickerAlbum';
import { STICKERS_COLLECTION } from '@/lib/stickers';

export function useStickerRewards() {
  const { earnSticker, earnSpecificSticker, hasSticker } = useStickerAlbum();

  /**
   * Verifica e concede recompensas ao completar um mini game
   */
  const checkMinigameRewards = useCallback((
    minigameId,
    score,
    isHighScore = false
  ) => {
    const rewards = [];

    // Encontrar figurinhas desbloqueáveis por este minigame
    const unlockable = STICKERS_COLLECTION.filter(s => 
      s.unlockSource.includes('minigame') &&
      s.unlockRequirements?.minigameId === minigameId &&
      s.unlockRequirements?.minScore &&
      score >= s.unlockRequirements.minScore
    );

    // Tentar ganhar figurinha aleatória baseada na pontuação
    let preferredRarity;
    if (score >= 200) preferredRarity = 'legendary';
    else if (score >= 150) preferredRarity = 'epic';
    else if (score >= 100) preferredRarity = 'rare';
    
    const randomReward = earnSticker(`minigame_${minigameId}`, preferredRarity);
    
    // Verificar figurinhas específicas desbloqueadas
    unlockable.forEach(sticker => {
      if (!hasSticker(sticker.id)) {
        const result = earnSpecificSticker(sticker.id);
        if (result) {
          rewards.push({ stickerId: sticker.id, isNew: result.isNew });
        }
      }
    });

    return {
      randomReward,
      specificRewards: rewards,
      totalXp: randomReward.sticker ? 
        (randomReward.isNew ? 50 : 10) + (isHighScore ? 25 : 0) : 0
    };
  }, [earnSticker, earnSpecificSticker, hasSticker]);

  /**
   * Verifica e concede recompensas ao completar uma lição de inglês
   */
  const checkLessonRewards = useCallback((
    lessonId,
    accuracy,
    completedExercises
  ) => {
    const rewards = [];

    // Encontrar figurinhas desbloqueáveis por esta lição
    const unlockable = STICKERS_COLLECTION.filter(s => 
      s.unlockSource.includes('lesson') &&
      (s.unlockRequirements?.lessonId === lessonId || s.unlockRequirements?.lessonId === 'any')
    );

    // Ganhar figurinha baseada na precisão
    let preferredRarity;
    if (accuracy >= 95) preferredRarity = 'epic';
    else if (accuracy >= 80) preferredRarity = 'rare';
    
    const randomReward = earnSticker(`lesson_${lessonId}`, preferredRarity);

    // Verificar figurinhas específicas
    unlockable.forEach(sticker => {
      if (!hasSticker(sticker.id)) {
        const result = earnSpecificSticker(sticker.id);
        if (result) {
          rewards.push({ stickerId: sticker.id, isNew: result.isNew });
        }
      }
    });

    return {
      randomReward,
      specificRewards: rewards,
      totalXp: randomReward.sticker ? 
        (randomReward.isNew ? 50 : 10) + Math.floor(accuracy / 10) : 0
    };
  }, [earnSticker, earnSpecificSticker, hasSticker]);

  /**
   * Verifica e concede recompensas ao avançar no modo carreira
   */
  const checkCareerRewards = useCallback((
    level,
    matchesWon,
    totalGoals
  ) => {
    const rewards = [];

    // Encontrar figurinhas desbloqueáveis neste nível
    const unlockable = STICKERS_COLLECTION.filter(s => 
      s.unlockSource.includes('career') &&
      s.unlockRequirements?.careerLevel &&
      level >= s.unlockRequirements.careerLevel
    );

    // Ganhar figurinha baseada no nível
    let preferredRarity;
    if (level >= 25) preferredRarity = 'legendary';
    else if (level >= 15) preferredRarity = 'epic';
    else if (level >= 8) preferredRarity = 'rare';
    
    const randomReward = earnSticker(`career_level_${level}`, preferredRarity);

    // Verificar figurinhas específicas
    unlockable.forEach(sticker => {
      if (!hasSticker(sticker.id)) {
        const result = earnSpecificSticker(sticker.id);
        if (result) {
          rewards.push({ stickerId: sticker.id, isNew: result.isNew });
        }
      }
    });

    // Bônus por marcos
    let bonusXp = 0;
    if (matchesWon === 10) bonusXp += 50;
    if (matchesWon === 25) bonusXp += 100;
    if (totalGoals === 50) bonusXp += 100;
    if (totalGoals === 100) bonusXp += 200;

    return {
      randomReward,
      specificRewards: rewards,
      totalXp: (randomReward.sticker ? (randomReward.isNew ? 50 : 10) : 0) + bonusXp
    };
  }, [earnSticker, earnSpecificSticker, hasSticker]);

  /**
   * Verifica e concede recompensas ao completar capítulos da história
   */
  const checkStoryRewards = useCallback((
    chapter,
    choices,
    completedSideQuests
  ) => {
    const rewards = [];

    // Encontrar figurinhas desbloqueáveis neste capítulo
    const unlockable = STICKERS_COLLECTION.filter(s => 
      s.unlockSource.includes('story') &&
      s.unlockRequirements?.storyChapter &&
      chapter >= s.unlockRequirements.storyChapter
    );

    // Ganhar figurinha baseada no capítulo
    let preferredRarity;
    if (chapter >= 10) preferredRarity = 'legendary';
    else if (chapter >= 7) preferredRarity = 'epic';
    else if (chapter >= 4) preferredRarity = 'rare';
    
    const randomReward = earnSticker(`story_chapter_${chapter}`, preferredRarity);

    // Verificar figurinhas específicas
    unlockable.forEach(sticker => {
      if (!hasSticker(sticker.id)) {
        const result = earnSpecificSticker(sticker.id);
        if (result) {
          rewards.push({ stickerId: sticker.id, isNew: result.isNew });
        }
      }
    });

    // Bônus por side quests
    const sideQuestBonus = completedSideQuests * 15;

    return {
      randomReward,
      specificRewards: rewards,
      totalXp: (randomReward.sticker ? (randomReward.isNew ? 50 : 10) : 0) + sideQuestBonus
    };
  }, [earnSticker, earnSpecificSticker, hasSticker]);

  /**
   * Concede recompensa diária
   */
  const claimDailyReward = useCallback(() => {
    const dayOfWeek = new Date().getDay();
    // Domingo = chance maior de raridade
    const preferredRarity = dayOfWeek === 0 ? 'epic' : undefined;
    
    return earnSticker('daily_reward', preferredRarity);
  }, [earnSticker]);

  /**
   * Concede recompensa por conquista
   */
  const claimAchievementReward = useCallback((
    achievementId,
    tier
  ) => {
    const rarityMap = {
      bronze: 'common',
      silver: 'rare',
      gold: 'epic',
      platinum: 'legendary'
    };
    
    return earnSticker(`achievement_${achievementId}`, rarityMap[tier]);
  }, [earnSticker]);

  return {
    checkMinigameRewards,
    checkLessonRewards,
    checkCareerRewards,
    checkStoryRewards,
    claimDailyReward,
    claimAchievementReward,
  };
}