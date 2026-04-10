const ALBUM_KEY = 'molecas_unified_album';
const GOLDEN_STICKER_TYPES = [
  { id: 'bola_ouro', name: 'Bola de Ouro', emoji: '⚽', rarity: 'legendary' },
  { id: 'trofeu_copa', name: 'Troféu da Copa', emoji: '🏆', rarity: 'legendary' },
  { id: 'chuteira_ouro', name: 'Chuteira de Ouro', emoji: '👟', rarity: 'epic' },
  { id: 'luva_ouro', name: 'Luva de Ouro', emoji: '🧤', rarity: 'epic' },
  { id: 'camisa_10', name: 'Camisa 10', emoji: '🔟', rarity: 'rare' },
  { id: 'bandeira_br', name: 'Brasil Campeão', emoji: '🇧🇷', rarity: 'rare' },
  { id: 'escudo_time', name: 'Escudo de Clube', emoji: '🛡️', rarity: 'rare' },
  { id: 'apito', name: 'Apito de Ouro', emoji: '📢', rarity: 'common' },
  { id: 'rede_gol', name: 'Rede do Gol', emoji: '🥅', rarity: 'common' },
];

function loadUnifiedAlbum() {
  try { return JSON.parse(localStorage.getItem(ALBUM_KEY) || JSON.stringify({ stickers: {}, currentPage: 1, totalPasted: 0 })); }
  catch { return { stickers: {}, currentPage: 1, totalPasted: 0 }; }
}

function saveUnifiedAlbum(album) {
  try { localStorage.setItem(ALBUM_KEY, JSON.stringify(album)); } catch {}
}

function generateUniqueCode(stickerType) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  const typeHash = stickerType.id.substring(0, 2).toUpperCase();
  return `FD-${typeHash}${random}${timestamp.slice(-2)}`;
}

function createGoldenSticker(stickerType, source = 'mini-game') {
  const code = generateUniqueCode(stickerType);
  return { code, id: stickerType.id, name: stickerType.name, emoji: stickerType.emoji, rarity: stickerType.rarity, type: 'golden', source, earnedAt: new Date().toISOString() };
}

export function addStickerToAlbum(stickerId, type = 'english', data = {}) {
  const album = loadUnifiedAlbum();
  if (!album.stickers[stickerId]) {
    album.stickers[stickerId] = { id: stickerId, type, pasted: false, earnedAt: new Date().toISOString(), ...data };
    saveUnifiedAlbum(album);
  }
  return album;
}

export function pasteSticker(stickerId) {
  const album = loadUnifiedAlbum();
  if (album.stickers[stickerId] && !album.stickers[stickerId].pasted) {
    album.stickers[stickerId].pasted = true;
    album.stickers[stickerId].pastedAt = new Date().toISOString();
    album.totalPasted = (album.totalPasted || 0) + 1;
    saveUnifiedAlbum(album);
    return true;
  }
  return false;
}

export function earnGoldenStickerLocal(gameName) {
  try {
    const lastWinKey = `golden_lastwin_${gameName}`;
    const lastWin = localStorage.getItem(lastWinKey);
    const now = Date.now();
    if (lastWin && (now - parseInt(lastWin)) < 24 * 60 * 60 * 1000) return null;
    if (Math.random() > 0.30) return null;
    const stickerType = GOLDEN_STICKER_TYPES[Math.floor(Math.random() * GOLDEN_STICKER_TYPES.length)];
    const sticker = createGoldenSticker(stickerType, gameName);
    addStickerToAlbum(`golden_${sticker.id}`, 'golden', sticker);
    localStorage.setItem(lastWinKey, now.toString());
    return sticker;
  } catch { return null; }
}

export function loadUnifiedAlbumPublic() { return loadUnifiedAlbum(); }
export function saveUnifiedAlbumPublic(album) { saveUnifiedAlbum(album); }

export function donateSticker(stickerCode) {
  const album = loadUnifiedAlbum();
  const sticker = album.stickers[`golden_${stickerCode}`] || Object.values(album.stickers).find(s => s.code === stickerCode);
  if (!sticker) return { success: false, error: 'Figurinha não encontrada' };
  const transferCode = generateUniqueCode({ id: 'TF' });
  try {
    const donations = JSON.parse(localStorage.getItem('molecas_donations') || '{}');
    donations[transferCode] = { ...sticker, transferCode, donatedAt: new Date().toISOString() };
    localStorage.setItem('molecas_donations', JSON.stringify(donations));
    delete album.stickers[`golden_${sticker.id}`];
    saveUnifiedAlbum(album);
    return { success: true, transferCode };
  } catch { return { success: false, error: 'Erro ao processar doação' }; }
}

export function redeemDonatedSticker(code) {
  try {
    const donations = JSON.parse(localStorage.getItem('molecas_donations') || '{}');
    const sticker = donations[code];
    if (!sticker) return { success: false, error: 'Código inválido ou já resgatado' };
    addStickerToAlbum(`golden_${sticker.id}_${Date.now()}`, 'golden', sticker);
    delete donations[code];
    localStorage.setItem('molecas_donations', JSON.stringify(donations));
    return { success: true, sticker };
  } catch { return { success: false, error: 'Erro ao resgatar figurinha' }; }
}

export function loadAlbum() {
  try {
    const album = loadUnifiedAlbum();
    const goldenStickers = Object.values(album.stickers).filter(s => s.type === 'golden');
    return { stickers: goldenStickers, pasted: goldenStickers.filter(s => s.pasted).map(s => s.code) };
  } catch { return { stickers: [], pasted: [] }; }
}