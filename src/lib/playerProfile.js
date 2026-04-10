// Simple localStorage-based player profile persistence

const KEY = 'molecas_profile';

export const DEFAULT_PROFILE = {
  selectedPlayerId: 'luna',
  uniformColor: '#E91E63',
  shortsColor: '#000000',
  bootsColor: '#FFD600',
  teamBadge: 'pe_de_moleca',
  favoriteTeam: null,
  favoriteTeamRegion: null,
  globalXP: 0,            // XP global (soma de todas as partidas)
  playerLevels: {},        // { [playerId]: { xp, level } }
  teamLevels: {},          // { [teamId]: { xp, level } }
  stats: {
    wins: 0,
    losses: 0,
    draws: 0,
    matches: 0,
    goals: 0,
    goalsAgainst: 0,
    currentStreak: 0,
    bestStreak: 0,
    passUsed: 0,
    dribbleUsed: 0,
    shootUsed: 0,
    passWins: 0,
    specialMoves: 0,
    storyCompleted: false,
  },
  matchHistory: [],
  storyProgress: { currentScene: 0, unlockedScenes: [] },
  goldenStickers: [],
  redeemedCodes: [],
};

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      globalXP: parsed.globalXP || 0,
      stats: { ...DEFAULT_PROFILE.stats, ...(parsed.stats || {}) },
      matchHistory: parsed.matchHistory || [],
      storyProgress: { ...DEFAULT_PROFILE.storyProgress, ...(parsed.storyProgress || {}) },
      goldenStickers: parsed.goldenStickers || [],
      redeemedCodes: parsed.redeemedCodes || [],
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {}
}

export function updateProfile(updates) {
  const current = loadProfile();
  const updated = { ...current, ...updates };
  saveProfile(updated);
  return updated;
}

// ── Nível a partir de XP ────────────────────────────────────────
// Cada nível requer 100 XP. Nível 1 = 0-99 XP, Nível 2 = 100-199 XP, etc.
export function getLevelInfo(xp = 0) {
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const xpToNext = 100;
  return { level, xpInLevel, xpToNext };
}

// Nível global = XP total de todas as partidas
export function getGlobalLevel(profile) {
  return getLevelInfo(profile?.globalXP || 0);
}

// ── Salva resultado de partida ──────────────────────────────────
export function saveMatchResult({ won, draw, playerGoals, opponentGoals, mode = 'vs_bot', passUsed = 0, dribbleUsed = 0, shootUsed = 0 }) {
  const profile = loadProfile();
  const oldStats = { ...profile.stats };
  const stats = { ...oldStats };

  stats.matches = (stats.matches || 0) + 1;
  stats.goals = (stats.goals || 0) + playerGoals;
  stats.goalsAgainst = (stats.goalsAgainst || 0) + opponentGoals;
  stats.passUsed = (stats.passUsed || 0) + passUsed;
  stats.dribbleUsed = (stats.dribbleUsed || 0) + dribbleUsed;
  stats.shootUsed = (stats.shootUsed || 0) + shootUsed;

  if (draw) {
    stats.draws = (stats.draws || 0) + 1;
    stats.currentStreak = 0;
  } else if (won) {
    stats.wins = (stats.wins || 0) + 1;
    stats.currentStreak = (stats.currentStreak || 0) + 1;
    stats.bestStreak = Math.max(stats.bestStreak || 0, stats.currentStreak);
  } else {
    stats.losses = (stats.losses || 0) + 1;
    stats.currentStreak = 0;
  }

  const entry = { won, draw, playerGoals, opponentGoals, mode, passUsed, dribbleUsed, shootUsed, date: new Date().toLocaleDateString('pt-BR') };
  const matchHistory = [entry, ...(profile.matchHistory || [])].slice(0, 20);
  const newProfile = updateProfile({ stats, matchHistory });

  const newAchs = checkNewAchievements(oldStats, stats);
  return { profile: newProfile, newAchievements: newAchs };
}

// ── Conquistas ──────────────────────────────────────────────────
export const ALL_ACHIEVEMENTS = [
  { id: 'first_win',     name: 'Primeira Vitória',    emoji: '🥇', condition: s => s.wins >= 1 },
  { id: 'wins_5',        name: '5 Vitórias',           emoji: '🏅', condition: s => s.wins >= 5 },
  { id: 'wins_20',       name: 'Veterana',             emoji: '🌟', condition: s => s.wins >= 20 },
  { id: 'goals_3',       name: 'Artilheira',           emoji: '⚽', condition: s => s.goals >= 3 },
  { id: 'goals_20',      name: 'Sniper',               emoji: '🎖️', condition: s => s.goals >= 20 },
  { id: 'streak_3',      name: 'Em Chamas',            emoji: '🔥', condition: s => s.bestStreak >= 3 },
  { id: 'streak_5',      name: 'Invencível',           emoji: '🛡️', condition: s => s.bestStreak >= 5 },
  { id: 'pass_10',       name: 'Mestra do Passe',      emoji: '🎯', condition: s => s.passUsed >= 10 },
  { id: 'dribble_10',    name: 'Dribladora',           emoji: '🌀', condition: s => s.dribbleUsed >= 10 },
  { id: 'dribble_30',    name: 'Rainha do Drible',     emoji: '⚡', condition: s => s.dribbleUsed >= 30 },
  { id: 'shoot_10',      name: 'Chutadora',            emoji: '💥', condition: s => s.shootUsed >= 10 },
  { id: 'matches_20',    name: 'Maratonista',          emoji: '🏃', condition: s => s.matches >= 20 },
  { id: 'story',         name: 'Campeã do Torneio',    emoji: '🏆', condition: s => !!s.storyCompleted },
];

export function checkNewAchievements(oldStats, newStats) {
  return ALL_ACHIEVEMENTS.filter(a => !a.condition(oldStats) && a.condition(newStats));
}

// ── Modo história ───────────────────────────────────────────────
export function unlockScene(sceneId) {
  const profile = loadProfile();
  const sp = profile.storyProgress || { currentScene: 0, unlockedScenes: [] };
  if (sp.unlockedScenes.includes(sceneId)) return profile;
  const updated = {
    storyProgress: {
      currentScene: Math.max(sp.currentScene, sceneId),
      unlockedScenes: [...sp.unlockedScenes, sceneId],
    },
  };
  if (sceneId === 10) {
    updated.stats = { ...profile.stats, storyCompleted: true };
  }
  return updateProfile(updated);
}

// ── XP por partida ──────────────────────────────────────────────
// XP global: desbloqueio de jogadoras
// XP do time: nível de experiência individual do time
// XP da jogadora: nível de experiência individual da jogadora
export function addMatchXP({ playerId, teamId, won, draw }) {
  const profile = loadProfile();
  const playerLevels = { ...profile.playerLevels };
  const teamLevels = { ...profile.teamLevels };

  // XP ganho por resultado
  const xpGain = won ? 50 : draw ? 25 : 10;

  // XP global (para desbloquear jogadoras)
  const newGlobalXP = (profile.globalXP || 0) + xpGain;

  // XP individual da jogadora
  const pPrev = playerLevels[playerId] || { xp: 0 };
  const newPXP = (pPrev.xp || 0) + xpGain;
  playerLevels[playerId] = { xp: newPXP, level: getLevelInfo(newPXP).level };

  // XP individual do time
  const tPrev = teamLevels[teamId] || { xp: 0 };
  const newTXP = (tPrev.xp || 0) + xpGain;
  teamLevels[teamId] = { xp: newTXP, level: getLevelInfo(newTXP).level };

  const oldGlobalLevel = getLevelInfo(profile.globalXP || 0).level;
  const newGlobalLevel = getLevelInfo(newGlobalXP).level;
  const oldPlayerLevel = getLevelInfo(pPrev.xp || 0).level;
  const newPlayerLevel = getLevelInfo(newPXP).level;
  const oldTeamLevel = getLevelInfo(tPrev.xp || 0).level;
  const newTeamLevel = getLevelInfo(newTXP).level;

  updateProfile({ globalXP: newGlobalXP, playerLevels, teamLevels });

  return {
    xpGain,
    globalLevelUp: newGlobalLevel > oldGlobalLevel,
    globalLevel: newGlobalLevel,
    globalXP: newGlobalXP,
    playerLevelUp: newPlayerLevel > oldPlayerLevel,
    playerLevel: newPlayerLevel,
    teamLevelUp: newTeamLevel > oldTeamLevel,
    teamLevel: newTeamLevel,
  };
}

// Manter retrocompatibilidade
export function addWinXP({ playerId, teamId, xpAmount = 50 }) {
  return addMatchXP({ playerId, teamId, won: true });
}

// ── Desbloqueio por nível global ────────────────────────────────
// Jogadoras desbloqueiam quando o nível global atinge o threshold
const PLAYER_UNLOCK_LEVEL = {
  luna: 1, bela: 1, clara: 1,   // starter trio - sempre disponível
  sol: 2, bia: 3, ana: 5,
  iris: 7, maya: 9, duda: 12, lara: 15,
};

// Times desbloqueiam quando o nível global atinge o threshold
const TEAM_UNLOCK_LEVEL = {
  pe_de_moleca: 1,    // sempre disponível
  turminha_fc: 2,
  estrelas_clube: 3,
  graja_fc: 5,
  azul_fc: 8,
  soccergirls_fc: 11,
  chute_forte: 14,
  raio_fc: 18,
};

export function isPlayerUnlocked(playerId, profile) {
  const globalLevel = getLevelInfo(profile?.globalXP || 0).level;
  return globalLevel >= (PLAYER_UNLOCK_LEVEL[playerId] ?? 1);
}

export function isTeamUnlocked(teamId, profile) {
  const globalLevel = getLevelInfo(profile?.globalXP || 0).level;
  return globalLevel >= (TEAM_UNLOCK_LEVEL[teamId] ?? 99);
}

export function getPlayerUnlockLevel(playerId) {
  return PLAYER_UNLOCK_LEVEL[playerId] ?? 1;
}

export function getTeamUnlockLevel(teamId) {
  return TEAM_UNLOCK_LEVEL[teamId] ?? 99;
}

// ── Figurinhas douradas ─────────────────────────────────────────
function genCode(id) {
  const hash = Math.abs(id.split('').reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0) + Date.now() % 9999);
  return 'FD-' + String(hash % 9000 + 1000);
}

export function earnGoldenSticker(sticker) {
  const profile = loadProfile();
  const already = (profile.goldenStickers || []).find(g => g.id === sticker.id);
  if (already) return { profile, code: already.code, isNew: false };
  const code = genCode(sticker.id + Date.now());
  const gs = { id: sticker.id, code, name: sticker.name, category: sticker.category, earnedAt: new Date().toLocaleDateString('pt-BR') };
  const goldenStickers = [...(profile.goldenStickers || []), gs];
  const newProfile = updateProfile({ goldenStickers });
  return { profile: newProfile, code, isNew: true };
}

export function redeemGoldenCode(code) {
  const profile = loadProfile();
  const trimmed = code.trim().toUpperCase();
  if (!/^FD-\d{4}$/.test(trimmed)) return { ok: false, msg: 'Código inválido. Use o formato FD-XXXX.' };
  if ((profile.redeemedCodes || []).includes(trimmed)) return { ok: false, msg: 'Esse código já foi usado!' };
  if ((profile.goldenStickers || []).find(g => g.code === trimmed)) return { ok: false, msg: 'Você já tem essa figurinha!' };
  const gs = { id: 'trade_' + trimmed, code: trimmed, name: 'Figurinha de Troca', emoji: '✨', earnedAt: new Date().toLocaleDateString('pt-BR'), fromTrade: true };
  const goldenStickers = [...(profile.goldenStickers || []), gs];
  const redeemedCodes = [...(profile.redeemedCodes || []), trimmed];
  updateProfile({ goldenStickers, redeemedCodes });
  return { ok: true, msg: '✨ Figurinha dourada adicionada ao seu álbum!' };
}