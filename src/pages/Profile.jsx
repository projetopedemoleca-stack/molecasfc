import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ChevronDown, Pencil, Trophy, Lock } from 'lucide-react';
import { PLAYERS, FAVORITE_TEAMS_BY_REGION } from '@/lib/gameData';
import { getAbility } from '@/lib/playerAbilities';
import { loadProfile, saveProfile } from '@/lib/playerProfile';
import { audio } from '@/lib/audioEngine';
import PlayerAvatar from '@/components/game/PlayerAvatar';

const REGIONS = Object.entries(FAVORITE_TEAMS_BY_REGION).map(([key, val]) => ({ key, ...val }));

const MEDALS = [
  { id: 'first_win', name: 'Primeira Vitória', emoji: '🥇', desc: 'Vença sua primeira partida', condition: (s) => (s?.wins || 0) >= 1 },
  { id: '3_goals', name: 'Artilheira', emoji: '⚽', desc: 'Marque 3 gols em partidas', condition: (s) => (s?.goals || 0) >= 3 },
  { id: 'streak_3', name: 'Em Chamas', emoji: '🔥', desc: 'Vença 3 partidas seguidas', condition: (s) => (s?.bestStreak || 0) >= 3 },
  { id: '10_matches', name: 'Veterana', emoji: '🏆', desc: 'Jogue 10 partidas', condition: (s) => (s?.matches || 0) >= 10 },
  { id: '5_wins', name: 'Campeã', emoji: '👑', desc: 'Vença 5 partidas', condition: (s) => (s?.wins || 0) >= 5 },
];

const statLabels = [
  { key: 'tecnica',      emoji: '🎯', label: 'Técnica' },
  { key: 'velocidade',   emoji: '⚡', label: 'Velocidade' },
  { key: 'criatividade', emoji: '✨', label: 'Criatividade' },
  { key: 'coletivo',     emoji: '🤝', label: 'Coletivo' },
  { key: 'confianca',    emoji: '💪', label: 'Confiança' },
];

export default function Profile() {
  const [profile, setProfile] = useState(loadProfile());
  const [openRegion, setOpenRegion] = useState(null);
  const [saved, setSaved] = useState(false);

  const player = PLAYERS.find((p) => p.id === profile.selectedPlayerId) || PLAYERS[0];
  const ability = getAbility(player.id);
  const uniformColor = profile.uniformColor || '#E91E63';
  const shortsColor = profile.shortsColor || '#000000';
  const bootsColor = profile.bootsColor || '#FFD600';

  const handleSelectTeam = (regionKey, teamName) => {
    audio.playSelect();
    const updated = { ...profile, favoriteTeam: teamName, favoriteTeamRegion: regionKey };
    setProfile(updated);
    saveProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    setOpenRegion(null);
  };

  const winRate = profile.stats?.matches
    ? Math.round(((profile.stats?.wins || 0) / profile.stats.matches) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background px-4 py-6 font-body">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-heading font-semibold">Voltar</span>
      </Link>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-5">
        <h1 className="font-heading text-3xl font-bold">Meu Perfil</h1>
      </motion.div>

      {/* ── Player Hero Card ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-sm mx-auto mb-4 rounded-3xl overflow-hidden shadow-xl border border-border/30"
      >
        {/* Banner colorido */}
        <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${uniformColor}, ${bootsColor})` }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }} />
          <Link to="/character-select"
            className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white rounded-full p-1.5 flex items-center gap-1 text-xs font-bold">
            <Pencil className="w-3 h-3" /> Editar
          </Link>
        </div>

        <div className="bg-card px-5 pb-5">
          {/* Avatar flutuando sobre o banner */}
          <div className="flex items-end gap-4 -mt-10 mb-3">
            <div className="rounded-2xl p-1.5 shadow-lg border-4"
              style={{ backgroundColor: uniformColor + '22', borderColor: uniformColor }}>
              <PlayerAvatar
                player={player}
                uniformColor={uniformColor}
                shortsColor={shortsColor}
                bootsColor={bootsColor}
                size="lg"
              />
            </div>
            <div className="pb-1">
              <h2 className="font-heading font-bold text-xl leading-tight">{player.name}</h2>
              <p className="text-xs text-muted-foreground">{player.position}</p>
              {player.inclusion && (
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-semibold text-muted-foreground mt-0.5 inline-block">
                  {player.inclusion.icon} {player.inclusion.label}
                </span>
              )}
            </div>
          </div>

          {/* Cores do uniforme */}
          <div className="flex items-center gap-3 mb-4 bg-muted/50 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg border border-border shadow-sm" style={{ backgroundColor: uniformColor }} />
              <span className="text-[10px] text-muted-foreground">Camisa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg border border-border shadow-sm" style={{ backgroundColor: shortsColor }} />
              <span className="text-[10px] text-muted-foreground">Shorts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg border border-border shadow-sm" style={{ backgroundColor: bootsColor }} />
              <span className="text-[10px] text-muted-foreground">Chuteira</span>
            </div>
          </div>

          {/* Habilidade especial */}
          {ability?.desc && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
              <span className="text-xl">{ability.emoji}</span>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wide">Habilidade Especial</p>
                <p className="text-xs text-foreground/80">{ability.desc}</p>
              </div>
            </div>
          )}

          {/* Barras de atributos */}
          <div className="space-y-2 mb-4">
            {statLabels.map(({ key, emoji, label }) => {
              const val = player.stats?.[key] ?? 0;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{emoji}</span>
                  <span className="text-[11px] text-muted-foreground w-20">{label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val * 20}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-2 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${uniformColor}, ${bootsColor})` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-foreground w-4 text-right">{val}</span>
                </div>
              );
            })}
          </div>

          {/* Stats da partida */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Partidas', value: profile.stats?.matches || 0, emoji: '⚽' },
              { label: 'Vitórias', value: profile.stats?.wins || 0, emoji: '🏆' },
              { label: 'Win%', value: profile.stats?.matches ? winRate + '%' : '—', emoji: '📊' },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="bg-muted rounded-xl p-2 text-center">
                <span className="text-base block">{emoji}</span>
                <span className="font-heading font-bold text-base block">{value}</span>
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Time do Coração ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm mx-auto mb-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-secondary" />
          <h2 className="font-heading font-bold text-lg">Time do Coração</h2>
        </div>

        {profile.favoriteTeam ? (
          <div className="bg-card rounded-2xl p-4 border border-border/30 shadow flex items-center justify-between mb-3">
            <div>
              <p className="font-heading font-bold">{profile.favoriteTeam}</p>
              <p className="text-xs text-muted-foreground">
                {REGIONS.find(r => r.key === profile.favoriteTeamRegion)?.label}
              </p>
            </div>
            <button
              onClick={() => setProfile(p => ({ ...p, favoriteTeam: null }))}
              className="text-xs text-muted-foreground"
            >
              Trocar
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">Selecione seu time favorito abaixo 👇</p>
        )}

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-primary font-semibold mb-2"
            >
              ✓ Salvo!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {REGIONS.map(({ key, label, teams }) => (
            <div key={key} className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenRegion(openRegion === key ? null : key)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <span className="font-heading font-bold text-sm">{label}</span>
                <motion.div animate={{ rotate: openRegion === key ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openRegion === key && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1 max-h-52 overflow-y-auto">
                      {teams.map((team) => (
                        <button
                          key={team.name}
                          onClick={() => handleSelectTeam(key, team.name)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                            profile.favoriteTeam === team.name
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {team.feminine ? '⭐ ' : ''}{team.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Conquistas ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-sm mx-auto mb-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="font-heading font-bold text-lg">Conquistas</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {MEDALS.filter(m => m.condition(profile.stats)).length}/{MEDALS.length}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MEDALS.map((medal, idx) => {
            const unlocked = medal.condition(profile.stats);
            return (
              <motion.div
                key={medal.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className={`relative rounded-2xl p-3 text-center border-2 transition-all ${
                  unlocked 
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300' 
                    : 'bg-muted/30 border-muted grayscale'
                }`}
              >
                <div className="text-3xl mb-1">{medal.emoji}</div>
                <div className="text-[10px] font-bold leading-tight">{medal.name}</div>
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-2xl">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
