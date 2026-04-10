// =======================================
// GAME DATA - VERSÃO COMPLETA COM AVATARES ESTILIZADOS
// =======================================

export const ACTIONS = [
  { id: 'pass',    label: 'Passe',  emoji: '🅿️' },
  { id: 'dribble', label: 'Drible', emoji: '🌀' },
  { id: 'shoot',   label: 'Chute',  emoji: '🥅' },
];

// ─── AVATARES ESTILIZADOS ─────────────────────────────────────
// Cada jogadora tem um avatar completo com uniforme e acessórios

export const PLAYER_STYLES = {
  luna:  { skinTone: '🏿', hair: '✨',  uniform: '👕', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['©️', '🎀'],          color: '#4ECDC4', emoji: '👩🏿‍🦱' },
  bela:  { skinTone: '🏻', hair: '💇‍♀️', uniform: '👕', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['⚡', '🌟'],          color: '#FFE66D', emoji: '👱🏻‍♀️' },
  clara: { skinTone: '🏻', hair: '🧢',  uniform: '🦺', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['🧤', '🥅'],          color: '#FF6B9D', emoji: '👧🏻', isKeeper: true },
  sol:   { skinTone: '🏽', hair: '🌺',  uniform: '👕', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['☀️', '🤝'],          color: '#95E1D3', emoji: '👩🏽' },
  bia:   { skinTone: '🏾', hair: '💪',  uniform: '👕', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['🛡️', '🎯'],         color: '#F38181', emoji: '👩🏾‍🦱' },
  ana:   { skinTone: '🏾', hair: '♿',  uniform: '👕', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['💜', '♿'],           color: '#AA96DA', emoji: '👩🏾‍🦽' },
  iris:  { skinTone: '🏻', hair: '👓',  uniform: '👕', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['👓', '🔍'],          color: '#FCBAD3', emoji: '👩🏻‍🦰' },
  maya:  { skinTone: '🏼', hair: '🧩',  uniform: '👕', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['🧩', '🧠'],          color: '#A8D8EA', emoji: '👩🏼' },
  duda:  { skinTone: '🏽', hair: '🏳️‍🌈', uniform: '👕', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['🏳️‍🌈', '🔥', '🦻'], color: '#FFD93D', emoji: '🧑🏽' },
  lara:  { skinTone: '🏻', hair: '💪',  uniform: '👕', shorts: '🩳', socks: '🧦', boots: '👟', accessories: ['🦾', '💪'],          color: '#6BCB77', emoji: '👩🏻‍🦾' },
};

// ─── JOGADORAS ────────────────────────────────────────────────
export const PLAYERS = [
  {
    id: 'luna', name: 'Luna', avatar: '👩🏿‍🦱',
    styledAvatar: {
      base: '👩🏿‍🦱',
      fullBody: '👩🏿‍🦱👕🩳🧦👟',
      withAccessories: '👩🏿‍🦱👕🩳🧦👟©️🎀',
      accessories: ['©️', '🎀', '👟']
    },
    position: 'Meia', hair: 'Black Power', trait: 'Criativa e ousada',
    favoriteAction: 'dribble', skinTone: 'dark',
    stats: { tecnica: 4, velocidade: 4, criatividade: 5, coletivo: 3, confianca: 4 },
    style: PLAYER_STYLES.luna
  },
  {
    id: 'bela', name: 'Bela', avatar: '👱🏻‍♀️',
    styledAvatar: {
      base: '👱🏻‍♀️',
      fullBody: '👱🏻‍♀️👕🩳🧦👟',
      withAccessories: '👱🏻‍♀️👕🩳🧦👟⚡🌟',
      accessories: ['⚡', '🌟', '👟']
    },
    position: 'Atacante', hair: 'Liso loiro', trait: 'Veloz e determinada',
    favoriteAction: 'shoot', skinTone: 'light',
    stats: { tecnica: 3, velocidade: 5, criatividade: 3, coletivo: 3, confianca: 5 },
    style: PLAYER_STYLES.bela
  },
  {
    id: 'clara', name: 'Clara', avatar: '👧🏻',
    styledAvatar: {
      base: '👧🏻',
      fullBody: '👧🏻🦺🩳🧦👟',
      withAccessories: '👧🏻🦺🩳🧦👟🧤🥅',
      accessories: ['🧤', '🥅', '🧢', '👟'],
      isKeeper: true
    },
    position: 'Goleira', hair: 'Liso preto', trait: 'Calma e estratégica',
    favoriteAction: 'pass', skinTone: 'light',
    note: 'Descendente de japoneses',
    stats: { tecnica: 4, velocidade: 2, criatividade: 3, coletivo: 5, confianca: 5 },
    style: PLAYER_STYLES.clara
  },
  {
    id: 'sol', name: 'Sol', avatar: '👩🏽',
    styledAvatar: {
      base: '👩🏽',
      fullBody: '👩🏽👕🩳🧦👟',
      withAccessories: '👩🏽👕🩳🧦👟☀️🤝',
      accessories: ['☀️', '🤝', '👟']
    },
    position: 'Meia', hair: 'Liso escuro', trait: 'Alegre e coletiva',
    favoriteAction: 'pass', skinTone: 'medium',
    note: 'Descendente de povo Guarani',
    stats: { tecnica: 4, velocidade: 3, criatividade: 5, coletivo: 5, confianca: 3 },
    style: PLAYER_STYLES.sol
  },
  {
    id: 'bia', name: 'Bia', avatar: '👩🏾‍🦱',
    styledAvatar: {
      base: '👩🏾‍🦱',
      fullBody: '👩🏾‍🦱👕🩳🧦👟',
      withAccessories: '👩🏾‍🦱👕🩳🧦👟🛡️🎯',
      accessories: ['🛡️', '🎯', '👟']
    },
    position: 'Zagueira', hair: 'Cacheado médio', trait: 'Inteligente e firme',
    favoriteAction: 'pass', skinTone: 'medium-dark',
    stats: { tecnica: 5, velocidade: 3, criatividade: 3, coletivo: 4, confianca: 4 },
    style: PLAYER_STYLES.bia
  },
  {
    id: 'ana', name: 'Ana', avatar: '👩🏾‍🦽',
    styledAvatar: {
      base: '👩🏾‍🦽',
      fullBody: '👩🏾‍🦽👕🩳🧦👟',
      withAccessories: '👩🏾‍🦽👕🩳🧦👟💜♿',
      accessories: ['💜', '♿', '👟']
    },
    position: 'Meia', hair: 'Cacheado curto', trait: 'Determinada e resiliente',
    favoriteAction: 'dribble', skinTone: 'medium-dark',
    stats: { tecnica: 4, velocidade: 3, criatividade: 4, coletivo: 5, confianca: 5 },
    inclusion: { icon: '♿', label: 'Cadeirante', visible: true, desc: 'Joga em cadeira de rodas adaptada' },
    style: PLAYER_STYLES.ana
  },
  {
    id: 'iris', name: 'Íris', avatar: '👩🏻‍🦰',
    styledAvatar: {
      base: '👩🏻‍🦰',
      fullBody: '👩🏻‍🦰👕🩳🧦👟',
      withAccessories: '👩🏻‍🦰👕🩳🧦👟👓🔍',
      accessories: ['👓', '🔍', '👟']
    },
    position: 'Atacante', hair: 'Ondulado ruivo', trait: 'Focada e observadora',
    favoriteAction: 'shoot', skinTone: 'light',
    stats: { tecnica: 4, velocidade: 4, criatividade: 4, coletivo: 3, confianca: 4 },
    inclusion: { icon: '👓', label: 'Baixa visão', visible: true, desc: 'Usa óculos de grau alto' },
    style: PLAYER_STYLES.iris
  },
  {
    id: 'maya', name: 'Maya', avatar: '👩🏼',
    styledAvatar: {
      base: '👩🏼',
      fullBody: '👩🏼👕🩳🧦👟',
      withAccessories: '👩🏼👕🩳🧦👟🧩🧠',
      accessories: ['🧩', '🧠', '👟']
    },
    position: 'Meia', hair: 'Liso castanho', trait: 'Silenciosa e genial',
    favoriteAction: 'pass', skinTone: 'light',
    stats: { tecnica: 5, velocidade: 3, criatividade: 5, coletivo: 3, confianca: 3 },
    inclusion: { icon: '🧩', label: 'Autismo', visible: false, desc: 'Autista — reconhece padrões como ninguém' },
    style: PLAYER_STYLES.maya
  },
  {
    id: 'duda', name: 'Duda', avatar: '🧑🏽',
    styledAvatar: {
      base: '🧑🏽',
      fullBody: '🧑🏽👕🩳🧦👟',
      withAccessories: '🧑🏽👕🩳🧦👟🏳️‍🌈🔥🦻',
      accessories: ['🏳️‍🌈', '🔥', '🦻', '👟']
    },
    position: 'Atacante', hair: 'Trançado curto', trait: 'Intuitiva e explosiva',
    favoriteAction: 'shoot', skinTone: 'medium',
    pronouns: 'elu/delu', nonBinary: true,
    stats: { tecnica: 3, velocidade: 5, criatividade: 4, coletivo: 4, confianca: 5 },
    inclusion: { icon: '🏳️‍🌈', label: 'Não-binarie / Surde', visible: true, desc: 'Não-binarie e surde — usa aparelho auditivo' },
    style: PLAYER_STYLES.duda
  },
  {
    id: 'lara', name: 'Lara', avatar: '👩🏻‍🦾',
    styledAvatar: {
      base: '👩🏻‍🦾',
      fullBody: '👩🏻‍🦾👕🩳🧦👟',
      withAccessories: '👩🏻‍🦾👕🩳🧦👟🦾💪',
      accessories: ['🦾', '💪', '👟']
    },
    position: 'Zagueira', hair: 'Cacheado loiro', trait: 'Persistente e corajosa',
    favoriteAction: 'dribble', skinTone: 'light',
    stats: { tecnica: 4, velocidade: 4, criatividade: 3, coletivo: 5, confianca: 5 },
    inclusion: { icon: '🦾', label: 'Amputação', visible: true, desc: 'Usa prótese no braço direito' },
    style: PLAYER_STYLES.lara
  },
];

// Função para renderizar avatar estilizado
export function getStyledAvatar(playerId, options = {}) {
  const player = PLAYERS.find(p => p.id === playerId) || PLAYERS[0];
  const { withAccessories = true, size = 'medium' } = options;
  
  const sizeMap = { small: 'text-xl', medium: 'text-3xl', large: 'text-5xl' };
  
  const avatarString = withAccessories
    ? (player.styledAvatar?.withAccessories || player.avatar)
    : player.avatar;
  
  return {
    string: avatarString,
    style: player.style,
    sizeClass: sizeMap[size],
    accessories: player.styledAvatar?.accessories || [],
    color: player.style?.color || '#4ECDC4',
  };
}

// Função para avatar em campo (com animação)
export function getFieldAvatar(playerId, isRunning = false, isKicking = false) {
  const player = PLAYERS.find(p => p.id === playerId) || PLAYERS[0];
  
  return {
    avatar: player.avatar,
    accessories: player.styledAvatar?.accessories || [],
    effects: {
      running: isRunning ? ['💨', '💨'] : [],
      kicking: isKicking ? ['⚡'] : [],
      celebrating: ['🎉', '✨', '🌟']
    },
    color: player.style?.color || '#4ECDC4'
  };
}

// ─── TIMES DO JOGO ────────────────────────────────────────────
// unlockWins: número de vitórias necessárias para desbloquear
export const TEAMS = [
  // ── Liberado por padrão ──
  {
    id: 'pe_de_moleca', name: 'Pé de Moleca', emoji: '👟', locked: false, unlockWins: 0,
    stats: { tecnica: 3, velocidade: 3, criatividade: 4, coletivo: 5, confianca: 4 },
  },
  {
    id: 'turminha_fc', name: 'Turminha FC', emoji: '🌈', locked: true, unlockWins: 3,
    unlockRequirement: 'Vença 3 partidas',
    stats: { tecnica: 2, velocidade: 4, criatividade: 3, coletivo: 3, confianca: 3 },
  },
  {
    id: 'estrelas_clube', name: 'Estrelas Clube', emoji: '⭐', locked: true, unlockWins: 5,
    unlockRequirement: 'Vença 5 partidas',
    stats: { tecnica: 4, velocidade: 3, criatividade: 3, coletivo: 4, confianca: 4 },
  },
  // ── Bloqueados — desbloqueados por conquistas ──
  {
    id: 'graja_fc', name: 'Graja FC', emoji: '🔥', locked: true, unlockWins: 10,
    unlockRequirement: 'Vença 10 partidas',
    stats: { tecnica: 4, velocidade: 5, criatividade: 3, coletivo: 3, confianca: 4 },
  },
  {
    id: 'azul_fc', name: 'Azul FC', emoji: '💙', locked: true, unlockWins: 15,
    unlockRequirement: 'Vença 15 partidas',
    stats: { tecnica: 5, velocidade: 3, criatividade: 4, coletivo: 4, confianca: 3 },
  },
  {
    id: 'soccergirls_fc', name: 'SoccerGirls FC', emoji: '💜', locked: true, unlockWins: 20,
    unlockRequirement: 'Vença 20 partidas',
    stats: { tecnica: 4, velocidade: 4, criatividade: 5, coletivo: 3, confianca: 4 },
  },
  {
    id: 'chute_forte', name: 'Chute Forte', emoji: '💪', locked: true, unlockWins: 25,
    unlockRequirement: 'Vença 25 partidas',
    stats: { tecnica: 3, velocidade: 5, criatividade: 3, coletivo: 5, confianca: 5 },
  },
  {
    id: 'raio_fc', name: 'Raio FC', emoji: '⚡', locked: true, unlockWins: 30,
    unlockRequirement: 'Vença 30 partidas',
    stats: { tecnica: 5, velocidade: 5, criatividade: 5, coletivo: 5, confianca: 5 },
  },
];

// Vitórias necessárias para desbloquear cada jogadora
export const PLAYER_UNLOCK_WINS = {
  luna: 0, bela: 0, clara: 0,
  sol: 3, bia: 5, ana: 8,
  iris: 10, maya: 15, duda: 20, lara: 25,
};

// ─── TIMES FAVORITOS POR REGIÃO ───────────────────────────────
export const FAVORITE_TEAMS_BY_REGION = {
  brasil: {
    label: '🇧🇷 Brasil',
    teams: [
      { name: 'Corinthians' }, { name: 'Palmeiras' }, { name: 'São Paulo' },
      { name: 'Santos' }, { name: 'Flamengo' }, { name: 'Vasco' },
      { name: 'Grêmio' }, { name: 'Internacional' }, { name: 'Cruzeiro' },
      { name: 'Atlético Mineiro' }, { name: 'Bahia' }, { name: 'Fortaleza' },
      { name: 'Botafogo' }, { name: 'Fluminense' }, { name: 'Athletico-PR' },
      { name: 'Red Bull Bragantino' }, { name: 'Ceará' }, { name: 'Sport' },
      { name: 'Santos FC Feminino', feminine: true },
      { name: 'Corinthians Feminino', feminine: true },
      { name: 'São Paulo Feminino', feminine: true },
    ],
  },
  eua: {
    label: '🇺🇸 EUA',
    teams: [
      { name: 'Angel City FC', feminine: true }, { name: 'OL Reign', feminine: true },
      { name: 'Portland Thorns', feminine: true }, { name: 'Gotham FC', feminine: true },
      { name: 'San Diego Wave', feminine: true }, { name: 'Houston Dash', feminine: true },
      { name: 'Orlando Pride', feminine: true }, { name: 'Chicago Red Stars', feminine: true },
      { name: 'North Carolina Courage', feminine: true }, { name: 'Washington Spirit', feminine: true },
      { name: 'LA Galaxy' }, { name: 'Inter Miami' }, { name: 'New York City FC' },
      { name: 'Seattle Sounders' }, { name: 'Atlanta United' },
    ],
  },
  europa: {
    label: '🌍 Europa',
    teams: [
      { name: 'Barcelona' }, { name: 'Real Madrid' }, { name: 'Arsenal' },
      { name: 'Chelsea' }, { name: 'Manchester City' }, { name: 'Manchester United' },
      { name: 'PSG' }, { name: 'Lyon' }, { name: 'Bayern Munich' },
      { name: 'Juventus' }, { name: 'Milan' }, { name: 'Inter de Milão' },
      { name: 'Benfica' }, { name: 'Porto' }, { name: 'Ajax' },
      { name: 'Barcelona Feminino', feminine: true }, { name: 'Lyon Feminino', feminine: true },
    ],
  },
  americaSul: {
    label: '🌎 América do Sul',
    teams: [
      { name: 'Boca Juniors' }, { name: 'River Plate' }, { name: 'Independiente' },
      { name: 'Racing' }, { name: 'Peñarol' }, { name: 'Nacional' },
      { name: 'Colo-Colo' }, { name: 'Universidad de Chile' },
      { name: 'Olimpia' }, { name: 'Cerro Porteño' },
    ],
  },
};

// ─── CONQUISTAS ───────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'first_win',       name: 'Primeira Vitória',     emoji: '🏆', desc: 'Vença sua primeira partida' },
  { id: 'wins_3',          name: 'Hat-trick de Vitórias', emoji: '🎯', desc: 'Vença 3 partidas' },
  { id: 'goals_10',        name: 'Artilheira',            emoji: '⚽', desc: 'Faça 10 gols no total' },
  { id: 'win_hard',        name: 'Desafio Difícil',       emoji: '🔥', desc: 'Vença no modo difícil' },
  { id: 'training_5',      name: 'Dedicação',             emoji: '💪', desc: 'Complete 5 treinos' },
  { id: 'streak_3',        name: 'Em Chamas',             emoji: '🌟', desc: '3 vitórias seguidas' },
  { id: 'all_achievements',name: 'Lenda',                 emoji: '👑', desc: 'Desbloqueie tudo' },
];

// ─── BOT ──────────────────────────────────────────────────────
export function botAction(difficulty = 'medium') {
  const actions = ['pass', 'dribble', 'shoot'];
  if (difficulty === 'easy') return actions[Math.floor(Math.random() * actions.length)];
  if (difficulty === 'hard') return Math.random() < 0.5 ? 'shoot' : actions[Math.floor(Math.random() * actions.length)];
  return actions[Math.floor(Math.random() * actions.length)];
}

// ─── RESOLUÇÃO ────────────────────────────────────────────────
export function resolveAction(player, bot) {
  if (!player || !bot) return 'draw';
  if (player === bot) return 'draw';
  const winsAgainst = { pass: 'shoot', shoot: 'dribble', dribble: 'pass' };
  return winsAgainst[player] === bot ? 'win' : 'lose';
}