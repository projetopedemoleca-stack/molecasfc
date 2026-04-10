import { useState, useEffect, useCallback } from 'react';
import {
  loadAlbum,
  saveAlbum,
  addSticker,
  pasteSticker as pasteStickerLib,
  generateTradeCode,
  redeemTradeCode,
  redeemPromoCode,
  drawSticker,
  calculateProgress,
  markAllAsSeen,
  getTradableStickers,
} from '@/lib/albumSystem.js';
import { ALL_STICKERS, RARITY } from '@/lib/stickersData.js';

export function useStickerAlbum() {
  const [album, setAlbum] = useState(() => loadAlbum());
  const [lastReward, setLastReward] = useState(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  const refresh = useCallback(() => {
    setAlbum(loadAlbum());
  }, []);

  const earnSticker = useCallback((source = 'unknown', preferredRarity = null) => {
    const stickerDef = drawSticker(source, preferredRarity);
    const result = addSticker(stickerDef.id, source, true);
    if (result) {
      refresh();
      setLastReward({ sticker: result, definition: stickerDef });
      setShowRewardAnimation(true);
      return result;
    }
    return null;
  }, [refresh]);

  const pasteSticker = useCallback((uniqueId) => {
    const result = pasteStickerLib(uniqueId);
    if (result.success) refresh();
    return result;
  }, [refresh]);

  const useCode = useCallback((code) => {
    let result = redeemTradeCode(code);
    if (!result.success) result = redeemPromoCode(code);
    if (result.success) {
      refresh();
      const sticker = result.sticker || result.stickers?.[0];
      if (sticker) {
        setLastReward({ sticker });
        setShowRewardAnimation(true);
      }
    }
    return result;
  }, [refresh]);

  const generateTrade = useCallback((uniqueId) => {
    const result = generateTradeCode(uniqueId);
    if (result.success) refresh();
    return result;
  }, [refresh]);

  const markAllStickersAsSeen = useCallback(() => {
    markAllAsSeen();
    refresh();
  }, [refresh]);

  const closeRewardAnimation = useCallback(() => {
    setShowRewardAnimation(false);
  }, []);

  const progress = calculateProgress();
  const newStickersCount = Object.values(album.stickers).filter(s => s.isNew).length;
  const tradableStickers = getTradableStickers();

  return {
    album,
    userStickers: Object.values(album.stickers),
    progress,
    lastReward,
    showRewardAnimation,
    newStickersCount,
    tradableStickers,
    earnSticker,
    pasteSticker,
    useCode,
    generateTrade,
    markAllStickersAsSeen,
    closeRewardAnimation,
    allStickers: ALL_STICKERS,
    rarityConfig: RARITY,
  };
}
