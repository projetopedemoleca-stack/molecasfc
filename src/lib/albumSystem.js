/**
 * Sistema de Álbum de Figurinhas - Molecas FC
 * Gerenciamento de coleção, códigos de troca e recompensas
 */

import { 
  ALL_STICKERS, 
  RARITY,
  CATEGORIES,
  ALBUM_CONFIG,
  ALBUM_PAGES 
} from './stickersData.js';

const STORAGE_KEY = 'molecas_album_v3';
const TRADES_KEY = 'molecas_trades_v3';
const USED_CODES_KEY = 'molecas_used_codes_v3';

// ============ FUNÇÕES DE ARMAZENAMENTO ============

export function loadAlbum() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erro ao carregar álbum:', e);
  }
  return createEmptyAlbum();
}

export function saveAlbum(album) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(album));
  } catch (e) {
    console.error('Erro ao salvar álbum:', e);
  }
}

function createEmptyAlbum() {
  return {
    stickers: {}, // { uniqueId: { id, obtainedAt, isNew, isPasted, pastedAt, source, quantity } }
    totalPasted: 0,
    pagesCompleted: [],
    lastUpdated: new Date().toISOString(),
    stats: {
      totalOpened: 0,
      bySource: {},
      byRarity: {}
    }
  };
}

// ============ SISTEMA DE SORTEIO ============

export function drawSticker(source = 'unknown', preferredRarity = null) {
  // Calcular probabilidades
  let probabilities = { ...RARITY };
  
  // Se tiver preferência de raridade, aumentar chance
  if (preferredRarity && probabilities[preferredRarity]) {
    const boost = probabilities[preferredRarity].probability * 0.3;
    probabilities[preferredRarity].probability += boost;
    
    // Reduzir proporcionalmente dos outros
    const others = Object.keys(probabilities).filter(r => r !== preferredRarity);
    others.forEach(r => {
      probabilities[r].probability -= boost / others.length;
    });
  }

  // Sortear raridade
  const rand = Math.random();
  let cumulative = 0;
  let selectedRarity = 'common';
  
  for (const [rarity, config] of Object.entries(probabilities)) {
    cumulative += config.probability;
    if (rand <= cumulative) {
      selectedRarity = rarity;
      break;
    }
  }

  // Filtrar figurinhas da raridade sorteada
  const available = ALL_STICKERS.filter(s => s.rarity === selectedRarity);
  
  if (available.length === 0) {
    return ALL_STICKERS[0];
  }

  return available[Math.floor(Math.random() * available.length)];
}

// ============ ADICIONAR FIGURINHA ============

export function addSticker(stickerId, source = 'unknown', isNew = true) {
  const album = loadAlbum();
  const stickerDef = ALL_STICKERS.find(s => s.id === stickerId);
  
  if (!stickerDef) {
    console.error('Figurinha não encontrada:', stickerId);
    return null;
  }

  // Gerar ID único
  const uniqueId = `${stickerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Verificar se já tem essa figurinha
  const existing = Object.values(album.stickers).find(s => s.id === stickerId);
  
  if (existing) {
    // Aumentar quantidade
    existing.quantity = (existing.quantity || 1) + 1;
    existing.isNew = isNew;
    saveAlbum(album);
    return { ...existing, isDuplicate: true, definition: stickerDef };
  }

  // Criar nova entrada
  const newSticker = {
    id: stickerId,
    uniqueId,
    obtainedAt: new Date().toISOString(),
    isNew,
    isPasted: false,
    quantity: 1,
    source,
    rarity: stickerDef.rarity
  };

  album.stickers[uniqueId] = newSticker;
  album.lastUpdated = new Date().toISOString();
  album.stats.totalOpened++;
  album.stats.bySource[source] = (album.stats.bySource[source] || 0) + 1;
  album.stats.byRarity[stickerDef.rarity] = (album.stats.byRarity[stickerDef.rarity] || 0) + 1;

  saveAlbum(album);
  return { ...newSticker, isDuplicate: false, definition: stickerDef };
}

// ============ COLAR FIGURINHA ============

export function pasteSticker(uniqueId) {
  const album = loadAlbum();
  const sticker = album.stickers[uniqueId];
  
  if (!sticker) {
    return { success: false, error: 'Figurinha não encontrada' };
  }
  
  if (sticker.isPasted) {
    return { success: false, error: 'Figurinha já está colada' };
  }

  sticker.isPasted = true;
  sticker.pastedAt = new Date().toISOString();
  sticker.isNew = false;
  album.totalPasted++;
  album.lastUpdated = new Date().toISOString();

  // Verificar se completou alguma página
  const completedPages = checkCompletedPages(album);
  
  saveAlbum(album);
  
  return { 
    success: true, 
    sticker,
    completedPages,
    totalPasted: album.totalPasted,
    totalStickers: ALL_STICKERS.length
  };
}

// ============ VERIFICAR PÁGINAS COMPLETAS ============

function checkCompletedPages(album) {
  const pastedIds = Object.values(album.stickers)
    .filter(s => s.isPasted)
    .map(s => s.id);
  
  const completedPages = [];
  
  ALBUM_PAGES.forEach(page => {
    const pageStickers = ALL_STICKERS.filter(page.filter);
    const isComplete = pageStickers.every(s => pastedIds.includes(s.id));
    
    if (isComplete && !album.pagesCompleted.includes(page.id)) {
      album.pagesCompleted.push(page.id);
      completedPages.push(page);
    }
  });
  
  return completedPages;
}

// ============ SISTEMA DE CÓDIGOS DE TROCA ============

export function generateTradeCode(uniqueId) {
  const album = loadAlbum();
  const sticker = album.stickers[uniqueId];
  
  if (!sticker) {
    return { success: false, error: 'Figurinha não encontrada' };
  }
  
  // Verificar se tem repetida
  if (sticker.quantity <= 1 && !sticker.isPasted) {
    return { success: false, error: 'Você precisa ter uma repetida para trocar' };
  }

  // Gerar código único
  const prefix = sticker.id.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).substring(-2).toUpperCase();
  const code = `TROCA-${prefix}${random}${timestamp}`;

  // Salvar na lista de trocas disponíveis
  const trades = JSON.parse(localStorage.getItem(TRADES_KEY) || '{}');
  trades[code] = {
    stickerId: sticker.id,
    uniqueId: uniqueId,
    stickerName: ALL_STICKERS.find(s => s.id === sticker.id)?.name,
    stickerCategory: ALL_STICKERS.find(s => s.id === sticker.id)?.category,
    stickerRarity: sticker.rarity,
    createdAt: new Date().toISOString(),
    redeemed: false
  };
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));

  // Diminuir quantidade
  if (sticker.quantity > 1) {
    sticker.quantity--;
  } else {
    delete album.stickers[uniqueId];
    if (sticker.isPasted) album.totalPasted--;
  }
  
  saveAlbum(album);
  
  return { success: true, code, sticker };
}

export function redeemTradeCode(code) {
  const upperCode = code.trim().toUpperCase();
  
  // Verificar formato
  if (!upperCode.startsWith('TROCA-')) {
    return { success: false, error: 'Código inválido. Use um código de troca válido.' };
  }

  // Verificar se já usou este código
  const usedCodes = JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]');
  if (usedCodes.includes(upperCode)) {
    return { success: false, error: 'Você já usou este código!' };
  }

  // Buscar na lista de trocas
  const trades = JSON.parse(localStorage.getItem(TRADES_KEY) || '{}');
  const trade = trades[upperCode];
  
  if (!trade) {
    return { success: false, error: 'Código não encontrado ou expirado.' };
  }
  
  if (trade.redeemed) {
    return { success: false, error: 'Este código já foi resgatado.' };
  }

  // Adicionar figurinha ao álbum
  const result = addSticker(trade.stickerId, 'trade', true);
  
  if (!result) {
    return { success: false, error: 'Erro ao adicionar figurinha.' };
  }

  // Marcar como resgatado
  trade.redeemed = true;
  trade.redeemedAt = new Date().toISOString();
  trades[upperCode] = trade;
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));

  // Marcar código como usado
  usedCodes.push(upperCode);
  localStorage.setItem(USED_CODES_KEY, JSON.stringify(usedCodes));

  return { 
    success: true, 
    sticker: result,
    message: `Você recebeu: ${trade.stickerName}!`
  };
}

// ============ CÁLCULO DE PROGRESSO ============

export function calculateProgress() {
  const album = loadAlbum();
  const pastedIds = Object.values(album.stickers)
    .filter(s => s.isPasted)
    .map(s => s.id);
  
  const uniquePasted = [...new Set(pastedIds)];
  
  const byCategory = {};
  const byRarity = {};
  
  // Contar por categoria
  Object.values(CATEGORIES).forEach(cat => {
    const total = ALL_STICKERS.filter(s => s.category === cat.id).length;
    const obtained = uniquePasted.filter(id => {
      const s = ALL_STICKERS.find(st => st.id === id);
      return s && s.category === cat.id;
    }).length;
    byCategory[cat.id] = { total, obtained, percentage: Math.round((obtained / total) * 100) };
  });
  
  // Contar por raridade
  Object.keys(RARITY).forEach(rarity => {
    const total = ALL_STICKERS.filter(s => s.rarity === rarity).length;
    const obtained = uniquePasted.filter(id => {
      const s = ALL_STICKERS.find(st => st.id === id);
      return s && s.rarity === rarity;
    }).length;
    byRarity[rarity] = { total, obtained, percentage: Math.round((obtained / total) * 100) };
  });

  return {
    total: ALL_STICKERS.length,
    obtained: uniquePasted.length,
    percentage: Math.round((uniquePasted.length / ALL_STICKERS.length) * 100),
    pasted: album.totalPasted,
    pagesCompleted: album.pagesCompleted.length,
    totalPages: ALBUM_PAGES.length,
    byCategory,
    byRarity,
    newStickers: Object.values(album.stickers).filter(s => s.isNew).length,
    duplicates: Object.values(album.stickers).filter(s => s.quantity > 1).length
  };
}

// ============ OBTENÇÃO EM DIFERENTES MODOS ============

export function earnFromEnglish(lessonScore) {
  // Baseado na pontuação da lição de inglês
  let rarity = null;
  if (lessonScore >= 90) rarity = 'epic';
  else if (lessonScore >= 70) rarity = 'rare';
  else if (lessonScore >= 50) rarity = 'uncommon';
  
  const sticker = drawSticker('english', rarity);
  return addSticker(sticker.id, 'english', true);
}

export function earnFromMinigame(gameName, score) {
  // Baseado na pontuação do minigame
  let rarity = null;
  if (score >= 200) rarity = 'legendary';
  else if (score >= 150) rarity = 'epic';
  else if (score >= 100) rarity = 'rare';
  else if (score >= 50) rarity = 'uncommon';
  
  const sticker = drawSticker('minigame', rarity);
  return addSticker(sticker.id, 'minigame', true);
}

export function earnFromStory(chapterId, completed) {
  if (!completed) return null;
  
  // Capítulos especiais dão figurinhas melhores
  let rarity = null;
  if (chapterId % 5 === 0) rarity = 'epic';
  else if (chapterId % 3 === 0) rarity = 'rare';
  
  const sticker = drawSticker('story', rarity);
  return addSticker(sticker.id, 'story', true);
}

export function earnFromCareer(level, achievement) {
  // Baseado em conquistas no modo carreira
  let rarity = null;
  if (achievement === 'championship') rarity = 'legendary';
  else if (achievement === 'mvp') rarity = 'epic';
  else if (level % 10 === 0) rarity = 'rare';
  
  const sticker = drawSticker('career', rarity);
  return addSticker(sticker.id, 'career', true);
}

export function earnFromHealth(completedLesson) {
  if (!completedLesson) return null;
  
  const sticker = drawSticker('health');
  return addSticker(sticker.id, 'health', true);
}

export function earnFromMatch(won, goalsScored) {
  if (!won) return null;
  
  // Baseado na performance da partida
  let rarity = null;
  if (goalsScored >= 5) rarity = 'epic';
  else if (goalsScored >= 3) rarity = 'rare';
  
  const sticker = drawSticker('match', rarity);
  return addSticker(sticker.id, 'match', true);
}

// ============ UTILITÁRIOS ============

export function getStickerById(id) {
  return ALL_STICKERS.find(s => s.id === id);
}

export function getUserSticker(uniqueId) {
  const album = loadAlbum();
  return album.stickers[uniqueId];
}

export function getTradableStickers() {
  const album = loadAlbum();
  return Object.values(album.stickers).filter(s => s.quantity > 1 || (s.quantity === 1 && s.isPasted));
}

export function markAllAsSeen() {
  const album = loadAlbum();
  Object.values(album.stickers).forEach(s => s.isNew = false);
  saveAlbum(album);
}

export function resetAlbum() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TRADES_KEY);
  localStorage.removeItem(USED_CODES_KEY);
  return createEmptyAlbum();
}

// ============ CÓDIGOS PROMOCIONAIS ============

const PROMO_CODES = {
  'MARTA2024': ['bra_marta'],
  'FORMIGA': ['bra_formiga'],
  'ALEXIA': ['world_alexia_putellas'],
  'RAPINOE': ['world_rapinoe'],
  'BOLAOURO': ['icon_bola_ouro'],
  'BRASIL': ['nat_brasil'],
  'ELASTICO': ['skill_elastico'],
  'TROCA10': () => {
    // Dá 10 figurinhas aleatórias
    const results = [];
    for (let i = 0; i < 10; i++) {
      const sticker = drawSticker('code');
      results.push(addSticker(sticker.id, 'code', true));
    }
    return results;
  }
};

export function redeemPromoCode(code) {
  const upperCode = code.trim().toUpperCase();
  const usedCodes = JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]');
  
  if (usedCodes.includes(upperCode)) {
    return { success: false, error: 'Código já utilizado!' };
  }
  
  const reward = PROMO_CODES[upperCode];
  
  if (!reward) {
    return { success: false, error: 'Código inválido!' };
  }
  
  let results;
  if (typeof reward === 'function') {
    results = reward();
  } else {
    results = reward.map(id => addSticker(id, 'code', true));
  }
  
  usedCodes.push(upperCode);
  localStorage.setItem(USED_CODES_KEY, JSON.stringify(usedCodes));
  
  return { success: true, stickers: results };
}
