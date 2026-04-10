import { useState, useEffect, useCallback } from 'react';
import {
  loadUnifiedAlbum,
  saveUnifiedAlbum,
  addStickerToAlbum,
  pasteSticker as pasteStickerLib,
  redeemCode,
  donateSticker,
  redeemDonatedSticker,
  drawRandomSticker,
  earnMinigameSticker,
  calculateProgress,
  getNewStickers,
  markAllAsSeen,
  getTradableStickers,
  STICKERS_COLLECTION,
  RARITY_CONFIG,
} from '@/lib/unifiedStickers.js';

export function useStickerAlbum() {
  const [album, setAlbum] = useState(loadUnifiedAlbum());
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastReward, setLastReward] = useState(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  useEffect(() => {
    setAlbum(loadUnifiedAlbum());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveUnifiedAlbum(album);
    }
  }, [album, isLoaded]);

  const hasSticker = useCallback((stickerId) => {
    return Object.values(album.stickers).some(s => s.id === stickerId);
  }, [album.stickers]);

  const isStickerPasted = useCallback((stickerId) => {
    return Object.values(album.stickers).some(s => s.id === stickerId && s.isPasted);
  }, [album.stickers]);

  const getStickerQuantity = useCallback((stickerId) => {
    return Object.values(album.stickers)
      .filter(s => s.id === stickerId)
      .reduce((sum, s) => sum + s.quantity, 0);
  }, [album.stickers]);

  const getUserSticker = useCallback((stickerId) => {
    return Object.values(album.stickers).find(s => s.id === stickerId);
  }, [album.stickers]);

  const earnSticker = useCallback((source, preferredRarity) => {
    const drawn = drawRandomSticker(preferredRarity);
    const result = addStickerToAlbum(drawn.id, source, true);
    
    if (result) {
      setAlbum(loadUnifiedAlbum());
      const reward = { sticker: result, isNew: result.quantity === 1 };
      setLastReward(reward);
      setShowRewardAnimation(true);
      return reward;
    }
    return null;
  }, []);

  const earnSpecificSticker = useCallback((stickerId, source = 'reward') => {
    const result = addStickerToAlbum(stickerId, source, true);
    
    if (result) {
      setAlbum(loadUnifiedAlbum());
      const reward = { sticker: result, isNew: result.quantity === 1 };
      setLastReward(reward);
      setShowRewardAnimation(true);
      return reward;
    }
    return null;
  }, []);

  const earnFromMinigame = useCallback((gameName, score) => {
    const result = earnMinigameSticker(gameName, score);
    
    if (result) {
      setAlbum(loadUnifiedAlbum());
      const reward = { sticker: result, isNew: result.quantity === 1 };
      setLastReward(reward);
      setShowRewardAnimation(true);
      return reward;
    }
    return null;
  }, []);

  const pasteSticker = useCallback((uniqueId) => {
    const success = pasteStickerLib(uniqueId);
    if (success) {
      setAlbum(loadUnifiedAlbum());
    }
    return success;
  }, []);

  const useCode = useCallback((code) => {
    const result = redeemCode(code);
    if (result.success && result.stickers) {
      setAlbum(loadUnifiedAlbum());
      if (result.stickers.length > 0) {
        setLastReward({ sticker: result.stickers[0], isNew: true });
        setShowRewardAnimation(true);
      }
    }
    return result;
  }, []);

  const generateTrade = useCallback((uniqueId) => {
    const result = donateSticker(uniqueId);
    if (result.success) {
      setAlbum(loadUnifiedAlbum());
    }
    return result;
  }, []);

  const useTradeCode = useCallback((code) => {
    const result = redeemDonatedSticker(code);
    if (result.success && result.sticker) {
      setAlbum(loadUnifiedAlbum());
      const reward = { sticker: result.sticker, isNew: true };
      setLastReward(reward);
      setShowRewardAnimation(true);
    }
    return result;
  }, []);

  const markAsSeen = useCallback((uniqueId) => {
    const sticker = album.stickers[uniqueId];
    if (sticker) {
      sticker.isNew = false;
      setAlbum({ ...album });
    }
  }, [album]);

  const markAllStickersAsSeen = useCallback(() => {
    markAllAsSeen();
    setAlbum(loadUnifiedAlbum());
  }, []);

  const closeRewardAnimation = useCallback(() => {
    setShowRewardAnimation(false);
  }, []);

  const progress = calculateProgress();
  const newStickersCount = getNewStickers().length;
  const tradableStickers = getTradableStickers();
  const userStickersList = Object.values(album.stickers);

  return {
    album,
    userStickers: userStickersList,
    isLoaded,
    progress,
    lastReward,
    showRewardAnimation,
    newStickersCount,
    tradableStickers,
    hasSticker,
    isStickerPasted,
    getStickerQuantity,
    getUserSticker,
    earnSticker,
    earnSpecificSticker,
    earnFromMinigame,
    pasteSticker,
    useCode,
    generateTrade,
    useTradeCode,
    markAsSeen,
    markAllStickersAsSeen,
    closeRewardAnimation,
    allStickers: STICKERS_COLLECTION,
    rarityConfig: RARITY_CONFIG,
  };
}
