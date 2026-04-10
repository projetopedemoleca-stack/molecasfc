// Sistema de Avatares 2.0 - Com evolução e personalização

export const SKIN_TONES = [
  { id: 'light', emoji: '🏻', label: 'Clara', color: '#F5D0C5' },
  { id: 'medium-light', emoji: '🏼', label: 'Médio-clara', color: '#E8B89D' },
  { id: 'medium', emoji: '🏽', label: 'Média', color: '#C68642' },
  { id: 'medium-dark', emoji: '🏾', label: 'Médio-escura', color: '#8D5524' },
  { id: 'dark', emoji: '🏿', label: 'Escura', color: '#3D2314' },
];

export const HAIR_STYLES = [
  { id: 'curly-short', emoji: '🦱', label: 'Cacheado curto' },
  { id: 'curly-long', emoji: '👩‍🦱', label: 'Cacheado longo' },
  { id: 'straight-short', emoji: '💇‍♀️', label: 'Liso curto' },
  { id: 'straight-long', emoji: '👩', label: 'Liso longo' },
  { id: 'ponytail', emoji: '👱‍♀️', label: 'Rabo de cavalo' },
  { id: 'braids', emoji: '👩‍🦰', label: 'Tranças' },
  { id: 'afro', emoji: '🦱', label: 'Black Power' },
  { id: 'bun', emoji: '👩‍🦳', label: 'Coque' },
  { id: 'undercut', emoji: '💇', label: 'Undercut' },
  { id: 'dreadlocks', emoji: '🧑‍🦱', label: 'Dreadlocks' },
];

export const HAIR_COLORS = [
  { id: 'black', color: '#1a1a1a', label: 'Preto' },
  { id: 'brown', color: '#4a3728', label: 'Castanho' },
  { id: 'blonde', color: '#f4d03f', label: 'Loiro' },
  { id: 'red', color: '#c0392b', label: 'Ruivo' },
  { id: 'ginger', color: '#d35400', label: 'Avermelhado' },
  { id: 'white', color: '#ecf0f1', label: 'Branco' },
  { id: 'pink', color: '#ff69b4', label: 'Rosa' },
  { id: 'blue', color: '#3498db', label: 'Azul' },
  { id: 'purple', color: '#9b59b6', label: 'Roxo' },
  { id: 'green', color: '#2ecc71', label: 'Verde' },
];

export const UNIFORM_STYLES = {
  basic: {
    id: 'basic', name: 'Básico', emoji: '👕', minLevel: 1,
    parts: { shirt: '👕', shorts: '🩳', socks: '🧦' },
    colors: ['#E91E63', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548'],
  },
  sporty: {
    id: 'sporty', name: 'Esportivo', emoji: '🎽', minLevel: 3,
    parts: { shirt: '🎽', shorts: '🩳', socks: '🧦' },
    colors: ['#FF5722', '#3F51B5', '#009688', '#FFC107', '#E91E63', '#673AB7'],
  },
  pro: {
    id: 'pro', name: 'Profissional', emoji: '🥋', minLevel: 5,
    parts: { shirt: '🥋', shorts: '🩳', socks: '🧦' },
    colors: ['#1A237E', '#B71C1C', '#1B5E20', '#E65100', '#4A148C', '#006064'],
  },
  premium: {
    id: 'premium', name: 'Premium', emoji: '👔', minLevel: 8,
    parts: { shirt: '👔', shorts: '🩳', socks: '🧦' },
    colors: ['#FFD700', '#C0C0C0', '#CD7F32', '#000000', '#FFFFFF', '#FF1493'],
  },
  legendary: {
    id: 'legendary', name: 'Lendário', emoji: '🦸‍♀️', minLevel: 12,
    parts: { shirt: '🦸‍♀️', shorts: '🩳', socks: '🧦' },
    colors: ['#FF006E', '#8338EC', '#3A86FF', '#06FFB4', '#FFBE0B', '#FB5607'],
  },
  special: {
    id: 'special', name: 'Especial', emoji: '✨', minLevel: 15,
    parts: { shirt: '✨', shorts: '🌟', socks: '💫' },
    colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00', '#0000FF'],
  },
};

export const BOOTS_STYLES = [
  { id: 'basic', emoji: '👟', name: 'Básica', minLevel: 1, speedBonus: 0 },
  { id: 'speed', emoji: '👟', name: 'Velocidade', minLevel: 3, speedBonus: 5, color: '#FF5722' },
  { id: 'control', emoji: '👟', name: 'Controle', minLevel: 5, speedBonus: 3, color: '#2196F3' },
  { id: 'power', emoji: '👟', name: 'Potência', minLevel: 7, speedBonus: 2, color: '#F44336' },
  { id: 'pro', emoji: '👟', name: 'Profissional', minLevel: 10, speedBonus: 8, color: '#FFD700' },
  { id: 'legendary', emoji: '👟', name: 'Lendária', minLevel: 15, speedBonus: 12, color: '#9C27B0' },
];

export const ACCESSORIES = {
  basic: [
    { id: 'wristband', emoji: '⌚', name: 'Munhequeira', minLevel: 1, slot: 'wrist' },
    { id: 'headband', emoji: '🎀', name: 'Faixa', minLevel: 1, slot: 'head' },
  ],
  intermediate: [
    { id: 'sunglasses', emoji: '🕶️', name: 'Óculos de sol', minLevel: 4, slot: 'face' },
    { id: 'cap', emoji: '🧢', name: 'Boné', minLevel: 4, slot: 'head' },
    { id: 'gloves', emoji: '🧤', name: 'Luvas', minLevel: 4, slot: 'hands' },
  ],
  advanced: [
    { id: 'glasses', emoji: '👓', name: 'Óculos', minLevel: 7, slot: 'face' },
    { id: 'earrings', emoji: '💎', name: 'Brincos', minLevel: 7, slot: 'ears' },
    { id: 'necklace', emoji: '📿', name: 'Colar', minLevel: 7, slot: 'neck' },
  ],
  special: [
    { id: 'crown', emoji: '👑', name: 'Coroa', minLevel: 10, slot: 'head' },
    { id: 'medal', emoji: '🏅', name: 'Medalha', minLevel: 10, slot: 'chest' },
    { id: 'scarf', emoji: '🧣', name: 'Cachecol', minLevel: 10, slot: 'neck' },
  ],
  legendary: [
    { id: 'halo', emoji: '😇', name: 'Auréola', minLevel: 15, slot: 'head' },
    { id: 'cape', emoji: '🦸‍♀️', name: 'Capa', minLevel: 15, slot: 'back' },
    { id: 'crystal', emoji: '💎', name: 'Cristal', minLevel: 15, slot: 'hands' },
  ],
};

export const LEVEL_SYSTEM = {
  maxLevel: 20,
  getRequiredXP: (level) => level * 100,
  getTotalXP: (level) => (level * (level + 1) / 2) * 100,
};

export const LEVEL_REWARDS = {
  1: { type: 'uniform', item: 'basic', message: 'Uniforme básico desbloqueado!' },
  2: { type: 'boots', item: 'basic', message: 'Chuteira básica desbloqueada!' },
  3: { type: 'uniform', item: 'sporty', message: 'Uniforme esportivo desbloqueado!' },
  4: { type: 'accessory', item: 'intermediate', message: 'Acessórios intermediários desbloqueados!' },
  5: { type: 'uniform', item: 'pro', message: 'Uniforme profissional desbloqueado!' },
  6: { type: 'boots', item: 'control', message: 'Chuteira de controle desbloqueada!' },
  7: { type: 'accessory', item: 'advanced', message: 'Acessórios avançados desbloqueados!' },
  8: { type: 'uniform', item: 'premium', message: 'Uniforme premium desbloqueado!' },
  9: { type: 'boots', item: 'power', message: 'Chuteira de potência desbloqueada!' },
  10: { type: 'accessory', item: 'special', message: 'Acessórios especiais desbloqueados!' },
  11: { type: 'boots', item: 'pro', message: 'Chuteira profissional desbloqueada!' },
  12: { type: 'uniform', item: 'legendary', message: 'Uniforme lendário desbloqueado!' },
  13: { type: 'title', item: 'Expert', message: 'Título "Expert" desbloqueado!' },
  14: { type: 'boots', item: 'legendary', message: 'Chuteira lendária desbloqueada!' },
  15: { type: 'accessory', item: 'legendary', message: 'Acessórios lendários desbloqueados!' },
  16: { type: 'uniform', item: 'special', message: 'Uniforme especial desbloqueado!' },
  17: { type: 'title', item: 'Mestre', message: 'Título "Mestre" desbloqueado!' },
  18: { type: 'effect', item: 'aura', message: 'Efeito de aura desbloqueado!' },
  19: { type: 'title', item: 'Lenda', message: 'Título "Lenda" desbloqueado!' },
  20: { type: 'effect', item: 'rainbow', message: 'Efeito arco-íris desbloqueado!' },
};

export const PLAYERS_WITH_EVOLUTION = [
  {
    id: 'luna', name: 'Luna', baseAvatar: '👩🏿‍🦱',
    description: 'Meia criativa e ousada', position: 'Meia', trait: 'Criativa e ousada',
    favoriteAction: 'dribble', skinTone: 'dark', hairStyle: 'curly-long', hairColor: 'black',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    stats: { tecnica: 4, velocidade: 4, criatividade: 5, coletivo: 3, confianca: 4 }, color: '#4ECDC4',
  },
  {
    id: 'bela', name: 'Bela', baseAvatar: '👱🏻‍♀️',
    description: 'Atacante veloz e determinada', position: 'Atacante', trait: 'Veloz e determinada',
    favoriteAction: 'shoot', skinTone: 'light', hairStyle: 'straight-long', hairColor: 'blonde',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    stats: { tecnica: 3, velocidade: 5, criatividade: 3, coletivo: 3, confianca: 5 }, color: '#FFE66D',
  },
  {
    id: 'clara', name: 'Clara', baseAvatar: '👧🏻',
    description: 'Goleira calma e estratégica', position: 'Goleira', trait: 'Calma e estratégica',
    favoriteAction: 'pass', skinTone: 'light', hairStyle: 'ponytail', hairColor: 'black',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    isKeeper: true,
    stats: { tecnica: 4, velocidade: 2, criatividade: 3, coletivo: 5, confianca: 5 }, color: '#FF6B9D',
  },
  {
    id: 'sol', name: 'Sol', baseAvatar: '👩🏽',
    description: 'Meia alegre e coletiva', position: 'Meia', trait: 'Alegre e coletiva',
    favoriteAction: 'pass', skinTone: 'medium', hairStyle: 'braids', hairColor: 'brown',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    note: 'Descendente de povo Guarani',
    stats: { tecnica: 4, velocidade: 3, criatividade: 5, coletivo: 5, confianca: 3 }, color: '#95E1D3',
  },
  {
    id: 'bia', name: 'Bia', baseAvatar: '👩🏾‍🦱',
    description: 'Zagueira inteligente e firme', position: 'Zagueira', trait: 'Inteligente e firme',
    favoriteAction: 'pass', skinTone: 'medium-dark', hairStyle: 'afro', hairColor: 'black',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    stats: { tecnica: 5, velocidade: 3, criatividade: 3, coletivo: 4, confianca: 4 }, color: '#F38181',
  },
  {
    id: 'ana', name: 'Ana', baseAvatar: '👩🏾‍🦽',
    description: 'Meia determinada e resiliente', position: 'Meia', trait: 'Determinada e resiliente',
    favoriteAction: 'dribble', skinTone: 'medium-dark', hairStyle: 'curly-short', hairColor: 'brown',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    inclusion: { icon: '♿', label: 'Cadeirante', visible: true, desc: 'Joga em cadeira de rodas adaptada' },
    stats: { tecnica: 4, velocidade: 3, criatividade: 4, coletivo: 5, confianca: 5 }, color: '#AA96DA',
  },
  {
    id: 'iris', name: 'Íris', baseAvatar: '👩🏻‍🦰',
    description: 'Atacante focada e observadora', position: 'Atacante', trait: 'Focada e observadora',
    favoriteAction: 'shoot', skinTone: 'light', hairStyle: 'straight-long', hairColor: 'red',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    inclusion: { icon: '👓', label: 'Baixa visão', visible: true, desc: 'Usa óculos de grau alto' },
    stats: { tecnica: 4, velocidade: 4, criatividade: 4, coletivo: 3, confianca: 4 }, color: '#FCBAD3',
  },
  {
    id: 'maya', name: 'Maya', baseAvatar: '👩🏼',
    description: 'Meia silenciosa e genial', position: 'Meia', trait: 'Silenciosa e genial',
    favoriteAction: 'pass', skinTone: 'medium-light', hairStyle: 'bun', hairColor: 'brown',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    inclusion: { icon: '🧩', label: 'Autismo', visible: false, desc: 'Autista — reconhece padrões como ninguém' },
    stats: { tecnica: 5, velocidade: 3, criatividade: 5, coletivo: 3, confianca: 3 }, color: '#A8D8EA',
  },
  {
    id: 'duda', name: 'Duda', baseAvatar: '🧑🏽',
    description: 'Atacante intuitiva e explosiva', position: 'Atacante', trait: 'Intuitiva e explosiva',
    favoriteAction: 'shoot', skinTone: 'medium', hairStyle: 'undercut', hairColor: 'black',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    pronouns: 'elu/delu', nonBinary: true,
    inclusion: { icon: '🏳️‍🌈', label: 'Não-binarie / Surde', visible: true, desc: 'Não-binarie e surde — usa aparelho auditivo' },
    stats: { tecnica: 3, velocidade: 5, criatividade: 4, coletivo: 4, confianca: 5 }, color: '#FFD93D',
  },
  {
    id: 'lara', name: 'Lara', baseAvatar: '👩🏻‍🦾',
    description: 'Zagueira persistente e corajosa', position: 'Zagueira', trait: 'Persistente e corajosa',
    favoriteAction: 'dribble', skinTone: 'light', hairStyle: 'ponytail', hairColor: 'blonde',
    evolution: { level: 1, xp: 0, stage: 'iniciante', unlockedItems: ['basic'] },
    inclusion: { icon: '🦾', label: 'Amputação', visible: true, desc: 'Usa prótese no braço direito' },
    stats: { tecnica: 4, velocidade: 4, criatividade: 3, coletivo: 5, confianca: 5 }, color: '#6BCB77',
  },
];

export function createCustomAvatar(playerId, customization = {}) {
  const player = PLAYERS_WITH_EVOLUTION.find(p => p.id === playerId);
  if (!player) return null;

  const {
    skinTone = player.skinTone,
    hairStyle = player.hairStyle,
    hairColor = player.hairColor,
    uniformStyle = 'basic',
    uniformColor = '#E91E63',
    bootsStyle = 'basic',
    accessories = [],
  } = customization;

  const skinToneData = SKIN_TONES.find(st => st.id === skinTone) || SKIN_TONES[0];
  const hairStyleData = HAIR_STYLES.find(hs => hs.id === hairStyle) || HAIR_STYLES[0];
  const uniformData = UNIFORM_STYLES[uniformStyle] || UNIFORM_STYLES.basic;
  const bootsData = BOOTS_STYLES.find(bs => bs.id === bootsStyle) || BOOTS_STYLES[0];

  const avatarString = [
    skinToneData.emoji,
    hairStyleData.emoji,
    uniformData.parts.shirt,
    uniformData.parts.shorts,
    uniformData.parts.socks,
    bootsData.emoji,
    ...accessories.slice(0, 3).map(acc => acc.emoji),
  ].join('');

  return {
    string: avatarString,
    player,
    customization: { skinTone, hairStyle, hairColor, uniformStyle, uniformColor, bootsStyle, accessories },
    stats: { ...player.stats, speedBonus: bootsData.speedBonus || 0 },
  };
}

export function getFieldAvatar(playerId, customization = {}, state = {}) {
  const { isRunning = false, isKicking = false, isCelebrating = false } = state;
  const customAvatar = createCustomAvatar(playerId, customization);
  if (!customAvatar) return null;

  const effects = [];
  if (isRunning) effects.push('💨', '💨');
  if (isKicking) effects.push('⚡', '🔥');
  if (isCelebrating) effects.push('🎉', '✨', '🌟', '💫');

  return {
    ...customAvatar,
    effects,
    animation: isRunning ? 'running' : isKicking ? 'kicking' : isCelebrating ? 'celebrating' : 'idle',
  };
}

export function calculateXP(matchResult) {
  const { won, goals, assists, passes, dribbles, saves } = matchResult;
  let xp = 10;
  if (won) xp += 50;
  xp += (goals || 0) * 20;
  xp += (assists || 0) * 15;
  xp += Math.floor((passes || 0) / 10) * 5;
  xp += (dribbles || 0) * 3;
  xp += (saves || 0) * 10;
  return xp;
}

export function levelUp(playerId, currentXP) {
  const player = PLAYERS_WITH_EVOLUTION.find(p => p.id === playerId);
  if (!player) return null;

  const currentLevel = player.evolution.level;
  const requiredXP = LEVEL_SYSTEM.getRequiredXP(currentLevel);

  if (currentXP < requiredXP) {
    return { leveledUp: false, remainingXP: requiredXP - currentXP };
  }

  const newLevel = currentLevel + 1;
  const newStage = newLevel >= 15 ? 'lenda' : newLevel >= 10 ? 'estrela' : newLevel >= 5 ? 'promissora' : 'iniciante';
  const reward = LEVEL_REWARDS[newLevel];

  return { leveledUp: true, newLevel, newStage, reward, remainingXP: currentXP - requiredXP };
}

export function getUnlockedItems(level) {
  const unlocked = { uniforms: [], boots: [], accessories: [], titles: [], effects: [] };

  Object.values(UNIFORM_STYLES).forEach(style => {
    if (style.minLevel <= level) unlocked.uniforms.push(style);
  });

  BOOTS_STYLES.forEach(boot => {
    if (boot.minLevel <= level) unlocked.boots.push(boot);
  });

  Object.values(ACCESSORIES).forEach(items => {
    items.forEach(item => {
      if (item.minLevel <= level) unlocked.accessories.push(item);
    });
  });

  return unlocked;
}

// Compatibilidade com código existente
export const PLAYERS = PLAYERS_WITH_EVOLUTION;