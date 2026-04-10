import { useCallback } from 'react';
import { useStickerAlbum } from './useStickerAlbum.js';

export function useStickerRewards() {
  const { earnSticker } = useStickerAlbum();

  const checkMinigameRewards = useCallback((minigameId, score) => {
    let preferredRarity;
    if (score >= 200) preferredRarity = 'legendary';
    else if (score >= 150) preferredRarity = 'epic';
    else if (score >= 100) preferredRarity = 'rare';
    return earnSticker(`minigame_${minigameId}`, preferredRarity);
  }, [earnSticker]);

  const checkLessonRewards = useCallback((lessonId, accuracy) => {
    let preferredRarity;
    if (accuracy >= 95) preferredRarity = 'epic';
    else if (accuracy >= 80) preferredRarity = 'rare';
    return earnSticker(`lesson_${lessonId}`, preferredRarity);
  }, [earnSticker]);

  const checkCareerRewards = useCallback((level) => {
    let preferredRarity;
    if (level >= 25) preferredRarity = 'legendary';
    else if (level >= 15) preferredRarity = 'epic';
    else if (level >= 8) preferredRarity = 'rare';
    return earnSticker(`career_level_${level}`, preferredRarity);
  }, [earnSticker]);

  const checkStoryRewards = useCallback((chapter) => {
    let preferredRarity;
    if (chapter >= 10) preferredRarity = 'legendary';
    else if (chapter >= 7) preferredRarity = 'epic';
    else if (chapter >= 4) preferredRarity = 'rare';
    return earnSticker(`story_chapter_${chapter}`, preferredRarity);
  }, [earnSticker]);

  const claimDailyReward = useCallback(() => {
    const dayOfWeek = new Date().getDay();
    return earnSticker('daily_reward', dayOfWeek === 0 ? 'epic' : undefined);
  }, [earnSticker]);

  const claimAchievementReward = useCallback((achievementId, tier) => {
    const rarityMap = { bronze: 'common', silver: 'rare', gold: 'epic', platinum: 'legendary' };
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
