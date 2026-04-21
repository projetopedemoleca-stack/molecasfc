import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Palette } from 'lucide-react';
import { PLAYERS, TEAMS } from '@/lib/gameData';
import CustomAvatar, { SKIN_TONES, HAIR_COLORS, HAIR_STYLES } from '@/components/game/CustomAvatar';
import PlayerAvatar from '@/components/game/PlayerAvatar';
import { getAbility } from '@/lib/playerAbilities';
import { loadProfile, saveProfile, isPlayerUnlocked, isTeamUnlocked, getGlobalLevel, getLevelInfo, getPlayerUnlockLevel } from '@/lib/playerProfile';
import { audio } from '@/lib/audioEngine';

// ─── Color palettes ──────────────────────────────────────────────
const UNIFORM_COLORS = [
  '#E91E63','#9C27B0','#3F51B5','#2196F3',
  '#009688','#4CAF50','#FF9800','#FF5722',
  '#795548','#607D8B','#000000','#FFFFFF',
];
const SHORTS_COLORS = [
  '#000000','#FFFFFF','#1a237e','#004d40',
  '#b71c1c','#f57f17','#4a148c','#37474f',
];
const BOOTS_COLORS = [
  '#FFD600','#FFFFFF','#000000','#FF5722',
  '#9C27B0','#00BCD4','#4CAF50','#E91E63',
  '#FF9800','#795548',
];

// Team badge symbols
const TEAM_SYMBOLS = {
  pe_de_moleca: '🍬',
  graja_fc: '🔥',
  estrelas_clube: '⭐',
  azul_fc: '💙',
  soccergirls_fc: '💜',
  chute_forte: '💪',
  turminha_fc: '🌈',
};

const statLabels = { tecnica:'🎯', velocidade:'⚡', criatividade:'✨', coletivo:'🤝', confianca:'💪' };

// ─── Uniform SVG Preview ────────────────────────────────────────
function UniformPreview({ player, shirtColor, shortsColor, bootsColor, teamId, size = 100 }) {
  const s = size;
  const team = TEAMS.find(t => t.id === teamId);
  const badge = TEAM_SYMBOLS[teamId] || '⚽';

  return (
    <svg viewBox="0 0 100 130" width={s} height={s * 1.3} className="block">
      {/* Head */}
      <circle cx="50" cy="18" r="14" fill="#FDBCB4"/>
      <text x="50" y="23" textAnchor="middle" fontSize="20">{player?.avatar || '👧🏽'}</text>

      {/* Shirt body */}
      <path d="M30,35 L20,50 L30,52 L30,80 L70,80 L70,52 L80,50 L70,35 Q60,30 50,32 Q40,30 30,35Z"
        fill={shirtColor} stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
      {/* Shirt sleeves */}
      <path d="M30,35 Q20,32 18,45 L28,48 Q26,38 30,35Z" fill={shirtColor} stroke="rgba(0,0,0,0.15)" strokeWidth="0.8"/>
      <path d="M70,35 Q80,32 82,45 L72,48 Q74,38 70,35Z" fill={shirtColor} stroke="rgba(0,0,0,0.15)" strokeWidth="0.8"/>
      {/* Shirt collar */}
      <path d="M43,33 Q50,36 57,33" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      {/* Team badge on shirt */}
      <text x="50" y="60" textAnchor="middle" fontSize="14">{badge}</text>
      {/* Shirt number */}
      <text x="50" y="75" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.85)" fontWeight="bold">10</text>

      {/* Shorts */}
      <rect x="33" y="80" width="34" height="20" fill={shortsColor} stroke="rgba(0,0,0,0.2)" strokeWidth="1" rx="2"/>
      {/* Shorts stripe */}
      <rect x="33" y="80" width="4" height="20" fill="rgba(255,255,255,0.2)" rx="1"/>
      <rect x="63" y="80" width="4" height="20" fill="rgba(255,255,255,0.2)" rx="1"/>

      {/* Socks */}
      <rect x="36" y="100" width="10" height="14" fill={bootsColor} opacity="0.5" rx="2"/>
      <rect x="54" y="100" width="10" height="14" fill={bootsColor} opacity="0.5" rx="2"/>

      {/* Boots */}
      <ellipse cx="41" cy="118" rx="10" ry="6" fill={bootsColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.8"/>
      <ellipse cx="59" cy="118" rx="10" ry="6" fill={bootsColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.8"/>
      {/* Boot sole */}
      <ellipse cx="41" cy="121" rx="10" ry="3" fill="rgba(0,0,0,0.3)"/>
      <ellipse cx="59" cy="121" rx="10" ry="3" fill="rgba(0,0,0,0.3)"/>
    </svg>
  );
}

// ─── Color Picker Row ────────────────────────────────────────────
function ColorRow({ colors, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {colors.map(c => (
        <button key={c} onClick={() => onChange(c)}
          className="w-9 h-9 rounded-full border-2 transition-all flex-shrink-0 shadow-sm"
          style={{ backgroundColor: c, borderColor: value === c ? '#333' : 'rgba(0,0,0,0.1)',
            transform: value === c ? 'scale(1.25)' : 'scale(1)', outline: value === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
        />
      ))}
      <label className="w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
        <Palette className="w-4 h-4 text-muted-foreground"/>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="sr-only"/>
      </label>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function CharacterSelect() {
  const navigate = useNavigate();
  let profile = {};
  try { profile = loadProfile() || {}; } catch { profile = {}; }
  const customPlayer = profile?.customPlayer;
  const hasCustomPlayer = customPlayer?.playerName;

  const skinObj  = customPlayer?.skinTone  ? (SKIN_TONES.find(s  => s.id  === customPlayer.skinTone)  || SKIN_TONES[1])  : SKIN_TONES[1];
  const hairObj  = customPlayer?.hairColor ? (HAIR_COLORS.find(h => h.id === customPlayer.hairColor) || HAIR_COLORS[0]) : HAIR_COLORS[0];
  const styleObj = customPlayer?.hairStyle ? (HAIR_STYLES.find(h => h.id === customPlayer.hairStyle) || HAIR_STYLES[2]) : HAIR_STYLES[2];

  const [selectedId, setSelectedId] = useState(profile.selectedPlayerId || 'luna');
  const [shirtColor, setShirtColor] = useState(profile.uniformColor || '#E91E63');
  const [shortsColor, setShortsColor] = useState(profile.shortsColor || '#000000');
  const [bootsColor, setBootsColor] = useState(profile.bootsColor || '#FFD600');
  const [teamBadge, setTeamBadge] = useState(profile.teamBadge || 'pe_de_moleca');
  const [tab, setTab] = useState('player'); // 'player' | 'customize'

  const globalLevelInfo = getGlobalLevel(profile);
  const globalLevel = globalLevelInfo.level;
  const globalXP = profile?.globalXP || 0;

  const selected = selectedId === 'custom'
    ? { id: 'custom', name: customPlayer?.playerName || 'Minha Jogadora', avatar: customPlayer?.skinTone || '👧', position: 'Personalizada', hair: '', trait: 'Jogadora única!', favoriteAction: 'dribble', stats: { tecnica: 3, velocidade: 3, criatividade: 3, coletivo: 3, confianca: 3 }, inclusion: null }
    : PLAYERS.find(p => p.id === selectedId) || PLAYERS[0];

  const handleConfirm = () => {
    audio.playSelect();
    saveProfile({ ...profile, selectedPlayerId: selectedId, uniformColor: shirtColor, shortsColor, bootsColor, teamBadge });
    if (selectedId === 'custom') {
      navigate('/match');
    } else {
      navigate('/team-select');
    }
  };

  const handleSelectPlayer = (id) => {
    audio.playSelect();
    setSelectedId(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background px-4 py-6 font-body">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5"/>
        <span className="font-heading font-semibold">Voltar</span>
      </Link>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-5">
        <h1 className="font-heading text-3xl font-bold">Escolha sua Jogadora</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize o uniforme do seu time!</p>
        {/* Global level badge */}
        <div className="inline-flex items-center gap-2 mt-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
          <span className="text-xs font-heading font-bold text-primary">⭐ Nível {globalLevel}</span>
          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${globalLevelInfo.xpInLevel}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground">{globalLevelInfo.xpInLevel}/100 XP</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex max-w-sm mx-auto bg-muted rounded-2xl p-1 mb-5">
        {[['player', '👧 Jogadora'], ['customize', '🎨 Uniforme']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl font-heading font-bold text-sm transition-all ${tab === t ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'player' && (
          <motion.div key="player" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {/* Player grid */}
            <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto mb-4">
              {hasCustomPlayer && (() => {
                const cp = customPlayer;
                const skinObj  = SKIN_TONES.find(s => s.id === cp.skinTone)    || SKIN_TONES[1];
                const hairObj  = HAIR_COLORS.find(h => h.id === cp.hairColor)  || HAIR_COLORS[0];
                const styleObj = HAIR_STYLES.find(h => h.id === cp.hairStyle)  || HAIR_STYLES[2];
                return (
                  <motion.div
                    key="custom"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedId('custom')}
                    className={`relative p-2 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center ${
                      selectedId === 'custom'
                        ? 'border-primary bg-primary/10'
                        : 'border-border/30 bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="overflow-hidden" style={{ height: 56, width: 44 }}>
                      <CustomAvatar
                        skin={skinObj} hairColor={hairObj} hairStyle={styleObj}
                        uniformColor={cp.uniformColor} shortsColor={cp.shortsColor}
                        bootsColor={cp.bootsColor} number={cp.jerseyNumber}
                        size={44}
                      />
                    </div>
                    <p className="font-bold text-[8px] truncate w-full text-center mt-0.5">{cp.playerName}</p>
                    {selectedId === 'custom' && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <div className="absolute -top-1 -left-1">
                      <span className="text-[9px] bg-yellow-400 text-yellow-900 font-bold px-1 rounded-full">✨</span>
                    </div>
                  </motion.div>
                );
              })()}
              {PLAYERS.map(p => {
                const unlocked = isPlayerUnlocked(p.id, profile);
                return (
                  <motion.button key={p.id} whileTap={unlocked ? { scale: 0.9 } : {}} onClick={() => unlocked && handleSelectPlayer(p.id)}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-2xl border-2 transition-all relative ${
                      !unlocked ? 'opacity-40 cursor-not-allowed border-border/20 bg-muted/20' :
                      selectedId === p.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border/30 bg-card'
                    }`}>
                    <PlayerAvatar player={p} uniformColor={shirtColor} shortsColor={shortsColor} bootsColor={bootsColor} size="sm"/>
                    <span className="text-[8px] font-bold leading-tight text-center">{p.name}</span>
                    {unlocked && profile.playerLevels?.[p.id] && (
                      <span className="text-[7px] text-primary font-bold">Lv.{profile.playerLevels[p.id].level}</span>
                    )}
                    {!unlocked && <span className="absolute top-0 right-0 text-[9px] bg-black/70 text-white rounded-full w-4 h-4 flex items-center justify-center">🔒</span>}
                  </motion.button>
                );
              })}
            </div>

            {/* Selected player detail */}
            <AnimatePresence mode="wait">
              <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-card rounded-3xl p-5 shadow-lg border border-border/30 max-w-sm mx-auto mb-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 bg-gradient-to-b from-primary/10 to-accent/10 rounded-2xl p-1">
                    {selectedId === 'custom' ? (
                      <div className="overflow-hidden rounded-xl" style={{ width: 60, height: 72 }}>
                        <CustomAvatar
                          skin={skinObj} hairColor={hairObj} hairStyle={styleObj}
                          uniformColor={customPlayer?.uniformColor || '#E91E63'}
                          shortsColor={customPlayer?.shortsColor || '#212121'}
                          bootsColor={customPlayer?.bootsColor || '#FFD600'}
                          number={customPlayer?.jerseyNumber || 10}
                          size={60}
                        />
                      </div>
                    ) : (
                      <PlayerAvatar player={selected} uniformColor={shirtColor} shortsColor={shortsColor} bootsColor={bootsColor} size="md"/>
                    )}
                  </div>
                  <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-heading font-bold text-xl">{selected.name}</h2>
                        {selected.inclusion && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-semibold text-muted-foreground">
                            {selected.inclusion.icon} {selected.inclusion.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedId === 'custom' ? 'Jogadora Personalizada' : selected.position + ' · ' + selected.hair}</p>
                      <p className="text-xs text-foreground/80 italic mt-0.5">"{selected.trait}"</p>
                      {/* Level/XP info */}
                      {(() => {
                        const lvlData = selectedId === 'custom' ? profile?.customPlayerLevel : profile.playerLevels?.[selected.id];
                        const lvlInfo = getLevelInfo(lvlData?.xp || 0);
                        return (
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Lv.{lvlInfo.level}</span>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${lvlInfo.xpInLevel}%` }} />
                            </div>
                            <span className="text-[9px] text-muted-foreground">{lvlData?.xp || 0} XP</span>
                          </div>
                        );
                      })()}
                  </div>
                </div>

                {(() => {
                  if (selectedId === 'custom') {
                    const bonus = customPlayer?.skillBonus || 0;
                    return (
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 mb-2">
                        <p className="text-xs font-bold text-primary flex items-center gap-1">
                          <Sparkles className="w-3 h-3"/> ✨ Habilidade da Jogadora
                        </p>
                        <p className="text-xs text-foreground/80 mt-0.5">
                          Bônus de {bonus}% em todas as ações por ser jogadora personalizada!
                        </p>
                      </div>
                    );
                  }
                  const ab = getAbility(selected.id);
                  return ab ? (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 mb-2">
                      <p className="text-xs font-bold text-primary flex items-center gap-1">
                        <Sparkles className="w-3 h-3"/> {ab.emoji} Habilidade em Jogo
                      </p>
                      <p className="text-xs text-foreground/80 mt-0.5">{ab.desc}</p>
                    </div>
                  ) : null;
                })()}

                <div className="bg-muted/60 rounded-xl px-2.5 py-1.5 mb-3 flex items-center gap-2">
                  <span className="text-sm">{selectedId === 'custom' ? '⭐' : (selected.favoriteAction === 'pass' ? '🎯' : selected.favoriteAction === 'dribble' ? '⚡' : '🔥')}</span>
                  <p className="text-xs text-muted-foreground">Ação favorita: <span className="font-bold text-foreground">{selectedId === 'custom' ? 'Personalizada' : (selected.favoriteAction === 'pass' ? 'Passe' : selected.favoriteAction === 'dribble' ? 'Drible' : 'Chute')}</span></p>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(statLabels).map(([key, em]) => (
                    <div key={key} className="text-center">
                      <span className="text-base block">{em}</span>
                      <div className="h-1 w-full bg-muted rounded-full mt-0.5">
                        <div className="h-1 bg-primary rounded-full" style={{ width: `${(selected.stats?.[key] || 0) * 20}%` }}/>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{selected.stats?.[key] || 0}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {tab === 'customize' && (
          <motion.div key="customize" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="max-w-sm mx-auto space-y-5 mb-5">
              {/* Full kit preview */}
              <div className="bg-card rounded-3xl p-5 shadow-lg border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-heading font-bold text-lg">Kit Completo</p>
                    <p className="text-xs text-muted-foreground">{selected.name} — {TEAMS.find(t => t.id === teamBadge)?.name || '—'}</p>
                  </div>
                  <div className="bg-gradient-to-b from-primary/10 to-accent/10 rounded-2xl p-1">
                    <PlayerAvatar player={selected} uniformColor={shirtColor} shortsColor={shortsColor} bootsColor={bootsColor} size="md"/>
                  </div>
                </div>

                {/* Color swatches preview */}
                <div className="flex gap-3 mt-2">
                  <div className="flex-1 text-center">
                    <div className="w-8 h-8 rounded-lg mx-auto border border-border shadow-sm" style={{ background: shirtColor }}/>
                    <p className="text-[9px] text-muted-foreground mt-1">Camisa</p>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="w-8 h-8 rounded-lg mx-auto border border-border shadow-sm" style={{ background: shortsColor }}/>
                    <p className="text-[9px] text-muted-foreground mt-1">Shorts</p>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="w-8 h-8 rounded-lg mx-auto border border-border shadow-sm" style={{ background: bootsColor }}/>
                    <p className="text-[9px] text-muted-foreground mt-1">Chuteira</p>
                  </div>
                </div>
              </div>

              {/* Shirt color */}
              <div className="bg-card rounded-2xl p-4 border border-border/30 shadow-sm">
                <p className="font-heading font-bold text-sm mb-3">👕 Cor da Camisa</p>
                <ColorRow colors={UNIFORM_COLORS} value={shirtColor} onChange={setShirtColor}/>
              </div>

              {/* Shorts color */}
              <div className="bg-card rounded-2xl p-4 border border-border/30 shadow-sm">
                <p className="font-heading font-bold text-sm mb-3">🩳 Cor do Shorts</p>
                <ColorRow colors={SHORTS_COLORS} value={shortsColor} onChange={setShortsColor}/>
              </div>

              {/* Boots color */}
              <div className="bg-card rounded-2xl p-4 border border-border/30 shadow-sm">
                <p className="font-heading font-bold text-sm mb-3">👟 Cor da Chuteira</p>
                <ColorRow colors={BOOTS_COLORS} value={bootsColor} onChange={setBootsColor}/>
              </div>

              {/* Team badge selector */}
              <div className="bg-card rounded-2xl p-4 border border-border/30 shadow-sm">
                <p className="font-heading font-bold text-sm mb-3">🏅 Escudo do Time (na camisa)</p>
                <div className="grid grid-cols-4 gap-2">
                  {TEAMS.map(t => (
                    <button key={t.id} onClick={() => setTeamBadge(t.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                        teamBadge === t.id ? 'border-primary bg-primary/10 shadow' : 'border-border/30 bg-muted/30'
                      }`}>
                      <span className="text-2xl">{t.emoji}</span>
                      <span className="text-[8px] font-bold text-center leading-tight">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm */}
      <div className="max-w-sm mx-auto sticky bottom-4">
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleConfirm}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-xl flex items-center justify-center gap-2 shadow-xl">
          <Check className="w-6 h-6"/>
          Confirmar e Escolher Time
        </motion.button>
      </div>
    </div>
  );
}