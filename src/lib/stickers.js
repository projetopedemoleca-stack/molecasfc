// Configuração de raridades
export const RARITY_CONFIG = {
  common: {
    label: 'Comum',
    bgGradient: 'from-gray-400 to-gray-500',
    borderColor: 'border-gray-400',
    glowColor: 'shadow-gray-400/50',
    xpBonus: 10,
    probability: 0.6,
  },
  rare: {
    label: 'Rara',
    bgGradient: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-400',
    glowColor: 'shadow-blue-400/50',
    xpBonus: 25,
    probability: 0.25,
  },
  epic: {
    label: 'Épica',
    bgGradient: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-400',
    glowColor: 'shadow-purple-400/50',
    xpBonus: 50,
    probability: 0.12,
  },
  legendary: {
    label: 'Lendária',
    bgGradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-amber-400/50',
    xpBonus: 100,
    probability: 0.03,
  },
};

// Coleção de figurinhas
export const STICKERS_COLLECTION = [
  {
    id: 'luna_01',
    name: 'Luna - Goleira',
    emoji: '🧤',
    category: 'players',
    rarity: 'common',
    description: 'A melhor goleira da escolinha',
    hasAnimation: true,
    hasGlitter: false,
  },
  {
    id: 'ana_01',
    name: 'Ana - Defensora',
    emoji: '🛡️',
    category: 'players',
    rarity: 'common',
    description: 'Defesa impenetrável',
    hasAnimation: true,
    hasGlitter: false,
  },
  {
    id: 'maya_01',
    name: 'Maya - Atacante',
    emoji: '⚡',
    category: 'players',
    rarity: 'rare',
    description: 'Velocidade incomparável',
    hasAnimation: true,
    hasGlitter: true,
  },
  {
    id: 'ball_gold',
    name: 'Bola de Ouro',
    emoji: '⚽',
    category: 'items',
    rarity: 'epic',
    description: 'A bola mais valiosa',
    hasAnimation: true,
    hasGlitter: true,
  },
  {
    id: 'trophy_01',
    name: 'Troféu Campeão',
    emoji: '🏆',
    category: 'trophies',
    rarity: 'legendary',
    description: 'Vitória suprema',
    hasAnimation: true,
    hasGlitter: true,
  },
  {
    id: 'moment_goal',
    name: 'Gol Espetacular',
    emoji: '🎯',
    category: 'moments',
    rarity: 'epic',
    description: 'Um gol para a história',
    hasAnimation: true,
    hasGlitter: true,
  },
  {
    id: 'boot_pink',
    name: 'Chuteira Rosa',
    emoji: '👟',
    category: 'items',
    rarity: 'rare',
    description: 'Estilo e performance',
    hasAnimation: false,
    hasGlitter: false,
  },
  {
    id: 'medal_gold',
    name: 'Medalha de Ouro',
    emoji: '🥇',
    category: 'trophies',
    rarity: 'legendary',
    description: 'O maior prêmio',
    hasAnimation: true,
    hasGlitter: true,
  },
];

// Páginas do álbum
export const ALBUM_PAGES = [
  {
    id: 'players',
    name: 'Jogadoras',
    emoji: '👩‍🦰',
    stickers: STICKERS_COLLECTION.filter(s => s.category === 'players'),
  },
  {
    id: 'items',
    name: 'Itens',
    emoji: '🎁',
    stickers: STICKERS_COLLECTION.filter(s => s.category === 'items'),
  },
  {
    id: 'moments',
    name: 'Momentos',
    emoji: '📸',
    stickers: STICKERS_COLLECTION.filter(s => s.category === 'moments'),
  },
  {
    id: 'trophies',
    name: 'Troféus',
    emoji: '🏆',
    stickers: STICKERS_COLLECTION.filter(s => s.category === 'trophies'),
  },
];

// Armazenar códigos de troca usados
const TRADE_CODES_KEY = 'mfc_trade_codes_used';
function getUsedTradeCodes() {
  try {
    return JSON.parse(localStorage.getItem(TRADE_CODES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsedTradeCodes(codes) {
  localStorage.setItem(TRADE_CODES_KEY, JSON.stringify(codes));
}

// Gerar figurinha aleatória
export function drawSticker(preferredRarity) {
  let rarity = preferredRarity;
  
  if (!rarity) {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [rarityKey, config] of Object.entries(RARITY_CONFIG)) {
      cumulative += config.probability;
      if (rand <= cumulative) {
        rarity = rarityKey;
        break;
      }
    }
  }
  
  const stickersOfRarity = STICKERS_COLLECTION.filter(s => s.rarity === rarity);
  return stickersOfRarity[Math.floor(Math.random() * stickersOfRarity.length)];
}

// Calcular progresso do álbum
export function calculateAlbumProgress(userStickers) {
  const total = STICKERS_COLLECTION.length;
  const obtained = userStickers.length;
  const percentage = Math.round((obtained / total) * 100);
  
  const byRarity = {};
  for (const rarity of Object.keys(RARITY_CONFIG)) {
    const totalOfRarity = STICKERS_COLLECTION.filter(s => s.rarity === rarity).length;
    const obtainedOfRarity = userStickers.filter(s => s.rarity === rarity).length;
    byRarity[rarity] = {
      total: totalOfRarity,
      obtained: obtainedOfRarity,
    };
  }
  
  return {
    total,
    obtained,
    percentage,
    byRarity,
  };
}

// Gerar código de troca
export function generateTradeCode(stickerId) {
  const hash = stickerId + Date.now().toString();
  const code = hash
    .split('')
    .map(c => Math.random().toString(36).charAt(2))
    .join('')
    .toUpperCase()
    .slice(0, 12);
  
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

// Validar código de troca
export function validateTradeCode(code) {
  const usedCodes = getUsedTradeCodes();
  
  if (usedCodes.includes(code.toUpperCase())) {
    return { valid: false, message: 'Código já foi usado!' };
  }
  
  // Validar formato básico
  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code.toUpperCase())) {
    return { valid: false, message: 'Formato de código inválido!' };
  }
  
  // Extrair stickerId do código (simulado - em produção seria verificado contra um banco)
  const randomStickerId = STICKERS_COLLECTION[Math.floor(Math.random() * STICKERS_COLLECTION.length)].id;
  
  return { 
    valid: true, 
    stickerId: randomStickerId,
  };
}

// Marcar código como usado
export function markTradeCodeAsUsed(code) {
  const usedCodes = getUsedTradeCodes();
  usedCodes.push(code.toUpperCase());
  saveUsedTradeCodes(usedCodes);
}