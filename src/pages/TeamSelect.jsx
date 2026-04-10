import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import { TEAMS } from '@/lib/gameData';
import { loadProfile, isTeamUnlocked, getGlobalLevel, getLevelInfo, getTeamUnlockLevel } from '@/lib/playerProfile';

const DIFFICULTIES = [
  { id: 'easy', label: 'Iniciante', emoji: '😊', desc: 'Boa para começar!' },
  { id: 'medium', label: 'Médio', emoji: '😤', desc: 'Um desafio justo' },
  { id: 'hard', label: 'Avançado', emoji: '🔥', desc: 'Para quem manda!' },
];

const statLabels = {
  tecnica: { label: 'Técnica', emoji: '🎯' },
  velocidade: { label: 'Velocidade', emoji: '⚡' },
  criatividade: { label: 'Criatividade', emoji: '✨' },
  coletivo: { label: 'Coletivo', emoji: '🤝' },
  confianca: { label: 'Confiança', emoji: '💪' },
};

function StatRow({ label, emoji, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span>{emoji}</span>
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex gap-0.5 flex-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${i < value ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
      <span className="font-bold text-xs w-4">{value}</span>
    </div>
  );
}

export default function TeamSelect() {
  const navigate = useNavigate();
  const profile = loadProfile();
  const globalLevelInfo = getGlobalLevel(profile);
  const globalLevel = globalLevelInfo.level;
  const [selectedTeam, setSelectedTeam] = useState(TEAMS[0]);
  const [difficulty, setDifficulty] = useState('medium');

  const handleStart = () => {
    if (!isTeamUnlocked(selectedTeam.id, profile)) return;
    const opponents = TEAMS.filter((t) => t.id !== selectedTeam.id);
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    navigate(`/match?team=${selectedTeam.id}&opponent=${opponent.id}&difficulty=${difficulty}&player=${profile.selectedPlayerId || 'luna'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/20 to-background px-4 py-6 font-body">
      <Link to="/character-select" className="inline-flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-heading font-semibold">Voltar</span>
      </Link>

      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-heading text-3xl font-bold text-center mb-1"
      >
        Escolha seu Time
      </motion.h1>
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
          <span className="text-xs font-heading font-bold text-primary">⭐ Nível Global {globalLevel}</span>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${globalLevelInfo.xpInLevel}%` }} />
          </div>
        </div>
      </div>
      <p className="text-center text-muted-foreground text-sm mb-4">Toque para selecionar</p>

      {/* Team grid */}
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto mb-6">
        {TEAMS.map((team, i) => {
          const unlocked = isTeamUnlocked(team.id, profile);
          return (
            <motion.button
              key={team.id}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => unlocked && setSelectedTeam(team)}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all relative ${
                !unlocked ? 'opacity-40 cursor-not-allowed border-border/20 bg-muted/20' :
                selectedTeam.id === team.id
                  ? 'border-primary bg-primary/10 shadow-lg scale-105'
                  : 'border-border/30 bg-card'
              }`}
            >
              <span className="text-3xl">{team.emoji}</span>
              <span className="text-[9px] font-bold text-center leading-tight line-clamp-2">{team.name}</span>
              {unlocked && profile.teamLevels?.[team.id] && (
                <span className="text-[7px] text-primary font-bold">Lv.{profile.teamLevels[team.id].level}</span>
              )}
              {!unlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 rounded-2xl bg-background/40">
                  <span className="text-[8px] text-muted-foreground font-bold">🔒 Nv.{getTeamUnlockLevel(team.id)}</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected team detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTeam.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-card rounded-3xl p-5 shadow-lg border border-border/30 max-w-sm mx-auto mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{selectedTeam.emoji}</span>
            <div className="flex-1">
              <h2 className="font-heading font-bold text-xl leading-tight">{selectedTeam.name}</h2>
              {(() => {
                const td = profile.teamLevels?.[selectedTeam.id];
                const li = getLevelInfo(td?.xp || 0);
                return (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Lv.{li.level}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${li.xpInLevel}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{td?.xp || 0} XP</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(statLabels).map(([key, { label, emoji }]) => (
              <StatRow key={key} label={label} emoji={emoji} value={selectedTeam.stats[key]} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Difficulty */}
      <div className="max-w-sm mx-auto mb-6">
        <p className="font-heading font-bold text-sm mb-2 text-center">Dificuldade</p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all text-xs font-bold ${
                difficulty === d.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border/30 bg-card'
              }`}
            >
              <span className="text-xl">{d.emoji}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <div className="max-w-sm mx-auto">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-xl flex items-center justify-center gap-2 shadow-xl"
        >
          <Play className="w-6 h-6" />
          Jogar!
        </motion.button>
      </div>
    </div>
  );
}