import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TEAMS, PLAYERS, resolveAction, botAction } from '@/lib/gameData';
import { getAbility } from '@/lib/playerAbilities';
import ScoreBoard from '@/components/game/ScoreBoard';
import FutsalField from '@/components/game/FutsalField';
import { audio } from '@/lib/audioEngine';
import { loadProfile, saveMatchResult, unlockScene, addWinXP } from '@/lib/playerProfile';
import MatchSetupScreen from '@/components/game/MatchSetupScreen';
import DailyChallengeCard, { getDailyChallengeStatus, getTodayChallenge, markChallengeCompleted } from '@/components/match/DailyChallengeCard';
import { earnFromMatch, drawSticker, addSticker } from '@/lib/albumSystem.js';
import { useStickerToast } from '@/components/ui/StickerEarnedToast.jsx';

// --- Toast de conquista ----------------------------------------
function AchievementToast({ achievements, onDone }) {
  const [idx, setIdx] = useState(0);
  const current = achievements[idx];
  useEffect(() => {
    if (!current) { onDone?.(); return; }
    const t = setTimeout(() => setIdx(i => i + 1), 2800);
    return () => clearTimeout(t);
  }, [idx, current]);
  if (!current) return null;
  return (
    <motion.div
      key={current.id}
      initial={{ y: -80, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -80, opacity: 0 }}
      className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none"
    >
      <div className="bg-yellow-400 text-yellow-900 font-heading font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-yellow-600">
        <motion.span className="text-3xl" animate={{ rotate: [0, -15, 15, -10, 0], scale: [1, 1.3, 1] }} transition={{ duration: 0.6 }}>
          {current.emoji}
        </motion.span>
        <div>
          <p className="text-[10px] uppercase tracking-widest opacity-70">Conquista desbloqueada!</p>
          <p className="text-base">{current.name}</p>
        </div>
      </div>
    </motion.div>
  );
}

const MAX_ZONE = 4;
const CENTER_ZONE = 2;
const SUSPENSE_MS = 1500;
const CONTINUE_DELAY_MS = 2000; // botão aparece após animação de resultado

// ----------------------------------------------------------------
// SELETOR DE ACAO - botoes grandes, estilosos e divertidos
// ----------------------------------------------------------------
function ActionButtons({ onSelect, disabled, hidden }) {
  if (hidden) return null;
  const actions = [
    {
      key: 'pass',
      emoji: '👟',
      label: 'Passe',
      sub: 'Inteligência!',
      gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 60%, #60a5fa 100%)',
      glow: 'rgba(59,130,246,0.5)',
      border: '#3b82f6',
      shine: 'rgba(255,255,255,0.18)',
    },
    {
      key: 'dribble',
      emoji: '🌀',
      label: 'Drible',
      sub: 'Agilidade!',
      gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 60%, #fcd34d 100%)',
      glow: 'rgba(245,158,11,0.5)',
      border: '#f59e0b',
      shine: 'rgba(255,255,255,0.18)',
    },
    {
      key: 'shoot',
      emoji: '💥',
      label: 'Chute',
      sub: 'Potência!',
      gradient: 'linear-gradient(135deg, #be123c 0%, #ec4899 60%, #f9a8d4 100%)',
      glow: 'rgba(236,72,153,0.5)',
      border: '#ec4899',
      shine: 'rgba(255,255,255,0.18)',
    },
  ];

  return (
    <div className="max-w-sm mx-auto my-3 px-1">
      <p className="text-center text-[11px] font-bold text-muted-foreground mb-3 uppercase tracking-widest">
        ⚡ Escolha sua jogada
      </p>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((cfg) => (
          <motion.button
            key={cfg.key}
            whileTap={{ scale: 0.88, rotate: -2 }}
            whileHover={{ scale: 1.06, y: -3 }}
            onClick={() => !disabled && onSelect(cfg.key)}
            disabled={disabled}
            className={`relative flex flex-col items-center gap-2 py-5 px-2 rounded-3xl overflow-hidden transition-all ${
              disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
            style={{
              background: cfg.gradient,
              boxShadow: disabled ? 'none' : `0 6px 24px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.2)`,
              border: `2px solid ${cfg.border}`,
            }}
          >
            {/* Brilho interno */}
            <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-3xl"
              style={{ background: cfg.shine }} />
            {/* Emoji grande */}
            <motion.span
              className="text-4xl relative z-10 drop-shadow-lg"
              animate={disabled ? {} : { y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 + Math.random() * 0.6, ease: 'easeInOut' }}
            >
              {cfg.emoji}
            </motion.span>
            {/* Texto */}
            <div className="relative z-10 text-center">
              <p className="font-heading font-bold text-white text-sm leading-tight drop-shadow">{cfg.label}</p>
              <p className="text-white/70 text-[9px] font-semibold">{cfg.sub}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// MUSICA DO MATCH - Chiptune engine
// ----------------------------------------------------------------
const matchMusic = (() => {
  let actx = null, masterGain = null, timerId = null, step = 0, muted = false;

  const ctx = () => {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = actx.createGain();
      masterGain.gain.value = 0.11;
      masterGain.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  };

  const osc = (freq, type, dur, vol) => {
    if (muted) return;
    const c = ctx(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.88);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + dur);
  };

  const kick = () => {
    if (muted) return;
    const c = ctx(), t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(170, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.11);
    g.gain.setValueAtTime(0.75, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    o.connect(g); g.connect(masterGain); o.start(t); o.stop(t + 0.14);
  };

  const snare = () => {
    if (muted) return;
    const c = ctx();
    const size = Math.floor(c.sampleRate * 0.07);
    const buf = c.createBuffer(1, size, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < size; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / size);
    const src = c.createBufferSource(); src.buffer = buf;
    const flt = c.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = 3200;
    const g = c.createGain(); const t = c.currentTime;
    g.gain.setValueAtTime(0.38, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    src.connect(flt); flt.connect(g); g.connect(masterGain); src.start(t);
  };

  const N = {
    C3:130.81, F3:174.61, G3:196, A3:220,
    C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392, A4:440,
    C5:523.25, D5:587.33, E5:659.25, G5:783.99, A5:880,
  };

  const pat = (s) => {
    if (s % 4 === 0) kick();
    if (s % 4 === 2) snare();
    if (s % 2 === 1) osc(N.A5 * 1.4, 'square', 0.025, 0.05);
    const mel = [N.C5,0,N.E5,0,N.G5,N.E5,N.C5,0,N.D5,0,N.A4,N.D5,N.E5,0,N.G5,N.E5,
                 N.C5,N.E5,N.G5,0,N.A5,0,N.G5,N.E5,N.D5,N.C5,N.D5,0,N.E5,0,N.C5,0][s];
    if (mel) osc(mel, 'square', 0.11, 0.18);
    const bas = [N.C4,0,0,N.C4,N.G3,0,0,0,N.A3,0,0,N.A3,N.G3,0,N.C4,0,
                 N.C4,0,N.G3,0,N.A3,0,N.F3,0,N.G3,0,0,N.G3,N.C4,0,0,0][s];
    if (bas) osc(bas, 'sawtooth', 0.14, 0.25);
  };

  return {
    play() {
      if (timerId) return;
      step = 0;
      timerId = setInterval(() => { pat(step); step = (step + 1) % 32; }, (60000 / 160) / 2);
    },
    stop() { clearInterval(timerId); timerId = null; step = 0; },
    toggleMute() {
      muted = !muted;
      if (masterGain && actx) masterGain.gain.setTargetAtTime(muted ? 0 : 0.11, actx.currentTime, 0.1);
      return muted;
    },
    isMuted: () => muted,
  };
})();

// ----------------------------------------------------------------
// PARTICULAS DE GOL
// ----------------------------------------------------------------
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.4,
  size: 8 + Math.random() * 14,
  color: ['#22c55e','#facc15','#f97316','#e879f9','#38bdf8','#f43f5e','#a3e635'][i % 7],
  rotate: Math.random() * 360,
}));

// ----------------------------------------------------------------
// FLASH DE RESULTADO
// ----------------------------------------------------------------
function ResultFlash({ result, isGoal }) {
  if (!result) return null;

  const cfg = {
    win: isGoal ? {
      bg: 'rgba(34,197,94,0.22)',
      border: '#22c55e',
      icon: '⚽',
      label: 'GOL!',
      sub: 'Você marcou!',
      color: '#16a34a',
      showParticles: true,
    } : {
      bg: 'rgba(59,130,246,0.15)',
      border: '#3b82f6',
      icon: '➡️',
      label: 'Avançou!',
      sub: 'Continue pressionando!',
      color: '#1d4ed8',
      showParticles: false,
    },
    lose: isGoal ? {
      bg: 'rgba(239,68,68,0.18)',
      border: '#ef4444',
      icon: '😓',
      label: 'GOL DELAS!',
      sub: 'A adversária marcou.',
      color: '#dc2626',
      showParticles: false,
    } : {
      bg: 'rgba(239,68,68,0.12)',
      border: '#ef4444',
      icon: '🧤',
      label: 'Recuou!',
      sub: 'Defensora bloqueou.',
      color: '#dc2626',
      showParticles: false,
    },
    draw: {
      bg: 'rgba(234,179,8,0.15)',
      border: '#eab308',
      icon: '🤝',
      label: 'Empate!',
      sub: 'Mesma jogada - ninguem avanca.',
      color: '#ca8a04',
      showParticles: false,
    },
  }[result];

  return (
    <motion.div
      key={result}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
    >
      <motion.div className="absolute inset-0" style={{ background: cfg.bg }}
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.6] }} transition={{ duration: 0.5 }}/>

      {cfg.showParticles && PARTICLES.map(p => (
        <motion.div key={p.id} className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: '-5%', width: p.size, height: p.size * 0.55,
            background: p.color, rotate: p.rotate }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: p.rotate + 360 }}
          transition={{ duration: 1.4 + Math.random() * 0.6, delay: p.delay, ease: 'easeIn' }}/>
      ))}

      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 20 }}
        animate={{ scale: [0.3, 1.18, 1], opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        className="relative flex flex-col items-center gap-2 px-10 py-7 rounded-3xl shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.97)', border: `3px solid ${cfg.border}`,
          backdropFilter: 'blur(8px)' }}
      >
        <motion.span className="text-7xl"
          animate={result === 'win'
            ? { scale: [1, 1.3, 0.9, 1.15, 1], rotate: [0, -15, 15, -8, 0] }
            : result === 'lose' ? { x: [0, -10, 10, -8, 8, 0] }
            : { scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, delay: 0.15 }}>
          {cfg.icon}
        </motion.span>

        <motion.p className="font-heading font-bold text-4xl" style={{ color: cfg.color }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {cfg.label}
        </motion.p>
        <motion.p className="text-sm font-medium" style={{ color: cfg.color, opacity: 0.75 }}
          initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} transition={{ delay: 0.4 }}>
          {cfg.sub}
        </motion.p>

        {result === 'win' && (
          <motion.div className="absolute -inset-1 rounded-3xl"
            style={{ border: `2px solid ${cfg.border}`, opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [1, 1.06, 1.12] }}
            transition={{ duration: 0.8, delay: 0.1 }}/>
        )}
      </motion.div>
    </motion.div>
  );
}

// ----------------------------------------------------------------
// CINEMA DA ACAO - animacao durante o suspense
// ----------------------------------------------------------------
function ActionCinema({ playerPick, suspense }) {
  if (!suspense || !playerPick) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-sm mx-auto bg-card border border-border/30 rounded-2xl p-4 my-3 overflow-hidden">

      {playerPick === 'shoot' && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-20 w-full">
            <motion.span className="absolute text-4xl" style={{ left: '12%', bottom: 4 }}
              animate={{ rotate: [0, -20, 40, 20, 0] }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}>🦵</motion.span>
            <motion.span className="absolute text-4xl"
              initial={{ left: '28%', bottom: '10%' }}
              animate={{ left: '78%', bottom: '55%', rotate: 360 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}>⚽</motion.span>
            <span className="absolute text-4xl" style={{ right: '4%', top: 2 }}>🥅</span>
            <motion.span className="absolute text-3xl" style={{ right: '10%', bottom: 2 }}
              animate={{ x: [0, -12, 12, 0] }} transition={{ duration: 0.8, delay: 0.3 }}>🧤</motion.span>
          </div>
          <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
            className="font-heading font-bold text-primary text-lg">⚽ CHUTANDO...</motion.p>
        </div>
      )}

      {playerPick === 'pass' && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-20 w-full">
            <span className="absolute text-4xl" style={{ left: '5%', bottom: 4 }}>👧🏽</span>
            <motion.span className="absolute text-3xl"
              initial={{ left: '18%', bottom: '30%' }}
              animate={{ left: ['18%', '50%', '78%'], bottom: ['30%', '55%', '30%'] }}
              transition={{ duration: 1.0, ease: 'easeInOut' }}>⚽</motion.span>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 80">
              <motion.path d="M55 55 Q150 15 240 55" fill="none" stroke="rgba(59,130,246,0.45)"
                strokeWidth="2" strokeDasharray="6 4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }}/>
            </svg>
            <motion.span className="absolute text-4xl" style={{ right: '5%', bottom: 4 }}
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.4, delay: 0.8 }}>👧🏿</motion.span>
          </div>
          <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
            className="font-heading font-bold text-blue-500 text-lg">🅿️ PASSANDO...</motion.p>
        </div>
      )}

      {playerPick === 'dribble' && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-20 w-full overflow-hidden">
            <span className="absolute text-3xl" style={{ left: '32%', bottom: 4 }}>👟</span>
            <span className="absolute text-3xl" style={{ left: '58%', bottom: 4 }}>👟</span>
            <motion.span className="absolute text-4xl" style={{ bottom: 4 }}
              animate={{ left: ['8%', '25%', '15%', '48%', '38%', '72%', '80%'] }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}>⚽</motion.span>
            {[0.15, 0.3, 0.45].map((op, i) => (
              <motion.div key={i} className="absolute bottom-3 rounded-full bg-yellow-400"
                style={{ width: 6, height: 6, opacity: op, left: `${15 + i * 18}%` }}
                initial={{ opacity: 0 }} animate={{ opacity: [0, op, 0] }}
                transition={{ delay: i * 0.2, duration: 0.6, repeat: Infinity }}/>
            ))}
          </div>
          <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
            className="font-heading font-bold text-yellow-500 text-lg">🌀 DRIBLANDO...</motion.p>
        </div>
      )}
    </motion.div>
  );
}

// ----------------------------------------------------------------
// ICONES DAS ACOES
// ----------------------------------------------------------------
const ACTION_ICONS = {
  pass: {
    label: 'Passe',
    color: '#3b82f6',
    svg: <span style={{ fontSize: 32 }}>👟</span>,
  },
  dribble: {
    label: 'Drible',
    color: '#f59e0b',
    svg: <span style={{ fontSize: 32 }}>🌀</span>,
  },
  shoot: {
    label: 'Chute',
    color: '#ec4899',
    svg: <span style={{ fontSize: 32 }}>💥</span>,
  },
};

// ----------------------------------------------------------------
// VISUALIZADOR DE RESULTADO
// ----------------------------------------------------------------
function ActionVisualizer({ playerPick, opponentPick, result, isGoal = false, p1Name = 'Voce', p2Name = 'Adversaria' }) {
  if (!result || !playerPick || !opponentPick) return null;

  const icons = ACTION_ICONS;
  const cfg = {
    win:  isGoal
      ? { border: 'border-green-500', bg: 'bg-green-500/10', icon: '⚽', label: 'GOL! Você marcou!', txt: 'text-green-600 dark:text-green-400' }
      : { border: 'border-blue-500',  bg: 'bg-blue-500/10',  icon: '➡️', label: 'Avançou! Continue!', txt: 'text-blue-600 dark:text-blue-400' },
    lose: isGoal
      ? { border: 'border-red-500', bg: 'bg-red-500/10', icon: '😓', label: 'GOL DELAS! A adversária marcou.', txt: 'text-red-500' }
      : { border: 'border-red-500', bg: 'bg-red-500/10', icon: '🧤', label: 'Recuou! Defensora bloqueou.', txt: 'text-red-500' },
    draw: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', icon: '🤝', label: 'Empate! Mesma jogada.', txt: 'text-yellow-600 dark:text-yellow-400' },
  }[result];

  const winner = result === 'win' ? playerPick : result === 'lose' ? opponentPick : null;
  const loser  = result === 'win' ? opponentPick : result === 'lose' ? playerPick : null;

  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`max-w-sm mx-auto rounded-2xl border-2 p-4 my-3 ${cfg.bg} ${cfg.border}`}>

      <div className="flex items-center justify-around mb-3">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            className="w-16 h-16 rounded-2xl border-2 mx-auto flex items-center justify-center mb-1"
            style={{ borderColor: icons[playerPick]?.color, background: `${icons[playerPick]?.color}18` }}>
            {icons[playerPick]?.svg}
          </motion.div>
          <p className="text-xs font-bold" style={{ color: icons[playerPick]?.color }}>{icons[playerPick]?.label}</p>
          <p className="text-[10px] text-muted-foreground">{p1Name}</p>
        </div>

        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring' }}
          className="flex flex-col items-center gap-1">
          <span className="text-3xl">{cfg.icon}</span>
          <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.txt}`}>
            {result === 'win' ? 'venceu' : result === 'lose' ? 'perdeu' : 'empate'}
          </span>
        </motion.div>

        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
            className="w-16 h-16 rounded-2xl border-2 mx-auto flex items-center justify-center mb-1"
            style={{ borderColor: icons[opponentPick]?.color, background: `${icons[opponentPick]?.color}18` }}>
            {icons[opponentPick]?.svg}
          </motion.div>
          <p className="text-xs font-bold" style={{ color: icons[opponentPick]?.color }}>{icons[opponentPick]?.label}</p>
          <p className="text-[10px] text-muted-foreground">{p2Name}</p>
        </div>
      </div>

      <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
        className={`text-center font-heading font-bold text-lg ${cfg.txt}`}>
        {cfg.label}
      </motion.p>

      {winner && loser && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-[11px] text-muted-foreground mt-1">
          {icons[winner]?.label} vence {icons[loser]?.label}
          {winner === 'pass'    ? ' - A goleira le o chute' :
           winner === 'shoot'   ? ' - A forca do chute desequilibra o drible' :
           winner === 'dribble' ? ' - O drible supera o passe' : ''}
        </motion.p>
      )}
      {result === 'draw' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-[11px] text-muted-foreground mt-1">
          Mesma jogada = ninguém avança
        </motion.p>
      )}
    </motion.div>
  );
}

// ----------------------------------------------------------------
// CARD DE REGRAS
// ----------------------------------------------------------------
function RulesCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="max-w-sm mx-auto mb-2">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 rounded-xl text-xs font-bold text-muted-foreground">
        <span>📋 Como funciona?</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-card border border-border/30 rounded-b-xl p-3 space-y-2">
              {[
                { a: 'Passe', b: 'Chute', why: 'A goleira lê o chute', aColor: '#3b82f6', bColor: '#ec4899' },
                { a: 'Chute', b: 'Drible', why: 'A força do chute desequilibra', aColor: '#ec4899', bColor: '#f59e0b' },
                { a: 'Drible', b: 'Passe', why: 'O drible supera o passe', aColor: '#f59e0b', bColor: '#3b82f6' },
              ].map(r => (
                <div key={r.a} className="flex items-center gap-2 text-xs">
                  <span className="font-bold" style={{ color: r.aColor }}>{r.a}</span>
                  <span className="text-green-500 font-bold">vence</span>
                  <span className="font-bold" style={{ color: r.bColor }}>{r.b}</span>
                  <span className="text-muted-foreground ml-auto italic">({r.why})</span>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/20 leading-relaxed">
                Avance a bola até a área adversária e marque <b>3 gols</b> para vencer!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------
// CORES RAPIDAS DE UNIFORME
// ----------------------------------------------------------------
const QUICK_COLORS = [
  '#E91E63', '#9C27B0', '#3F51B5', '#2196F3',
  '#009688', '#4CAF50', '#FF9800', '#FF5722',
  '#795548', '#607D8B', '#000000', '#FFFFFF',
];

// ----------------------------------------------------------------
// MATCH PRINCIPAL
// ----------------------------------------------------------------

function PlayerSetupScreen({ numero, initial, onConfirm }) {
  const [selectedId, setSelectedId]   = useState(initial.playerId);
  const [color, setColor]             = useState(initial.uniformColor);
  const [teamId, setTeamId]           = useState(initial.teamId);

  const selected = PLAYERS.find(p => p.id === selectedId) || PLAYERS[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: numero === 1 ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-4 pb-8"
    >
      {/* cabeçalho */}
      <div className="text-center mb-5 mt-2">
        <span className="text-4xl block mb-1">{numero === 1 ? '🏆' : '⚡'}</span>
        <h2 className="font-heading font-bold text-2xl">Jogadora {numero}</h2>
        <p className="text-sm text-muted-foreground">Escolha sua jogadora, cor e time</p>
      </div>

      {/* seleção de personagem */}
      <div className="bg-card border border-border/30 rounded-2xl p-4 mb-3 shadow-sm">
        <p className="font-heading font-bold text-sm mb-3">👧 Personagem</p>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {PLAYERS.map(p => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedId(p.id)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl border-2 transition-all ${
                selectedId === p.id
                  ? 'border-primary bg-primary/10 shadow'
                  : 'border-border/30 bg-muted/30'
              }`}
            >
              <span className="text-2xl">{p.avatar || '👧'}</span>
              <span className="text-[8px] font-bold leading-tight text-center">{p.name}</span>
              {p.inclusion && <span className="text-[9px]">{p.inclusion.icon}</span>}
            </motion.button>
          ))}
        </div>
        {/* nome + trait da selecionada */}
        <div className="bg-muted/40 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-xl">{selected.avatar || '👧'}</span>
          <div>
            <p className="font-bold text-sm">{selected.name}</p>
            {selected.trait && <p className="text-[10px] text-muted-foreground italic">"{selected.trait}"</p>}
          </div>
        </div>
      </div>

      {/* cor do uniforme */}
      <div className="bg-card border border-border/30 rounded-2xl p-4 mb-3 shadow-sm">
        <p className="font-heading font-bold text-sm mb-3">👕 Cor do Uniforme</p>
        <div className="flex gap-2 flex-wrap">
          {QUICK_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-9 h-9 rounded-full border-2 transition-all flex-shrink-0 shadow-sm"
              style={{
                backgroundColor: c,
                borderColor: color === c ? '#333' : 'rgba(0,0,0,0.1)',
                transform: color === c ? 'scale(1.25)' : 'scale(1)',
                outline: color === c ? `2px solid ${c}` : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
          <label className="w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer">
            <span className="text-xs text-muted-foreground">🎨</span>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="sr-only" />
          </label>
        </div>
        {/* prévia de cor */}
        <div className="mt-2 h-3 rounded-full" style={{ background: color }} />
      </div>

      {/* seleção de time */}
      <div className="bg-card border border-border/30 rounded-2xl p-4 mb-5 shadow-sm">
        <p className="font-heading font-bold text-sm mb-3">🏅 Time</p>
        <div className="grid grid-cols-2 gap-2">
          {TEAMS.map(t => (
            <button
              key={t.id}
              onClick={() => setTeamId(t.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                teamId === t.id
                  ? 'border-primary bg-primary/10 shadow'
                  : 'border-border/30 bg-muted/30'
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-xs font-bold leading-tight">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* confirmar */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onConfirm({ playerId: selectedId, uniformColor: color, teamId })}
        className="w-full py-4 rounded-2xl font-heading font-bold text-xl shadow-xl text-white"
        style={{ background: color }}
      >
        ✓ Pronto, Jogadora {numero}!
      </motion.button>
    </motion.div>
  );
}

// ----------------------------------------------------------------
// TELA DE FIM DE PARTIDA (inline - sem rota /results)
// ----------------------------------------------------------------
function GameOverScreen({ data, onPlayAgain, onHome }) {
  const { won, draw, ps, os, turns, pass, dribble, shoot } = data;
  const emoji = draw ? '🤝' : won ? '🏆' : '😅';
  const label = draw ? 'Empate!' : won ? 'Vitória!' : 'Derrota...';
  const color = draw ? 'text-yellow-500' : won ? 'text-primary' : 'text-destructive';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-5 pb-8 gap-5">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
        className="text-7xl">{emoji}</motion.div>

      <div className="text-center">
        <p className={`font-heading font-bold text-4xl ${color}`}>{label}</p>
        <p className="text-muted-foreground text-sm mt-1">{turns} rodadas jogadas</p>
      </div>

      {/* Placar */}
      <div className="bg-card border border-border/30 rounded-3xl px-8 py-4 shadow-md">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Você</p>
            <p className="font-heading font-bold text-5xl text-primary">{ps}</p>
          </div>
          <span className="text-2xl text-muted-foreground font-bold">×</span>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Adversária</p>
            <p className="font-heading font-bold text-5xl text-destructive">{os}</p>
          </div>
        </div>
      </div>

      {/* Stats da partida */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[
          { label: 'Passes', value: pass, emoji: '🎯' },
          { label: 'Dribles', value: dribble, emoji: '🌀' },
          { label: 'Chutes', value: shoot, emoji: '💥' },
        ].map(({ label, value, emoji: ic }) => (
          <motion.div key={label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border/30 rounded-2xl p-3 text-center shadow-sm">
            <span className="text-2xl">{ic}</span>
            <p className="font-heading font-bold text-xl mt-0.5">{value ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.95 }} onClick={onPlayAgain}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-lg shadow-lg">
          🔄 Jogar de Novo
        </motion.button>
        <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.95 }} onClick={onHome}
          className="w-full py-3 text-muted-foreground font-heading font-semibold text-base">
          🏠 Início
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Match() {
  const navigate = useNavigate();
  const { showToast, StickerToast } = useStickerToast();
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('team') || 'pe_de_moleca';
  const opponentId = urlParams.get('opponent') || 'turminha_fc';
  const difficulty = urlParams.get('difficulty') || 'medium';
  // mode=2p → dois jogadores no mesmo celular
  const twoPlayerMode = urlParams.get('mode') === '2p';
  // story=N → modo história, cena N
  const storySceneId = urlParams.get('story');

  const playerTeam = TEAMS.find((t) => t.id === teamId) || TEAMS[0];
  const opponentTeam = TEAMS.find((t) => t.id === opponentId) || TEAMS[1] || TEAMS[0];

  const profile = loadProfile() || {};
  const uniformColor = profile.uniformColor || '#E91E63';
  const playerId = profile.selectedPlayerId || 'luna';

  // --- SETUP 2P -------------------------------------------------
  // 'p1' | 'cover' | 'p2' | 'done'
  const [setupPhase, setSetupPhase] = useState('p1');
  const [p1Config, setP1Config] = useState({
    playerId: profile.selectedPlayerId || 'luna',
    uniformColor: profile.uniformColor || '#E91E63',
    teamId,
  });
  const [p2Config, setP2Config] = useState({
    playerId: 'bela',
    uniformColor: '#3F51B5',
    teamId: opponentId,
  });

  // configs efetivas (1P usa perfil, 2P usa configs do setup)
  const activeP1 = twoPlayerMode ? p1Config : { playerId, uniformColor, teamId };
  const ability = getAbility(activeP1.playerId) || {};
  
  // Avatar estilizado do jogador
  const activePlayerData = PLAYERS.find(p => p.id === activeP1.playerId);
  const playerAvatar = activePlayerData?.styledAvatar?.withAccessories || activePlayerData?.avatar || '👧🏽';

  const p1Team = twoPlayerMode
    ? (TEAMS.find(t => t.id === p1Config.teamId) || TEAMS[0])
    : playerTeam;
  const p2Team = twoPlayerMode
    ? (TEAMS.find(t => t.id === p2Config.teamId) || TEAMS[1] || TEAMS[0])
    : opponentTeam;
  const activeUniformColor = twoPlayerMode ? p1Config.uniformColor : uniformColor;
  // --- SELECAO DE MODO ------------------------------------------
  // Se vier ?mode=2p na URL ja pula a tela; caso contrario mostra selecao
  const [modeSelected, setModeSelected] = useState(urlParams.get('mode') !== null);
  const [twoPlayerActive, setTwoPlayerActive] = useState(twoPlayerMode);

  // --- CONFIG de partida ---
  const [matchConfig, setMatchConfig] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  // --- STATE ----------------------------------------------------
  const [ballPos, setBallPos] = useState(CENTER_ZONE);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [turn, setTurn] = useState(1);
  const [streak, setStreak] = useState(0);
  const [drawStreak, setDrawStreak] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [playerPick, setPlayerPick] = useState(null);
  const [opponentPick, setOpponentPick] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [suspense, setSuspense] = useState(false);
  const [goalAnimation, setGoalAnimation] = useState(null);
  const [abilityMsg, setAbilityMsg] = useState(null);
  const [showQuit, setShowQuit] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [flashResult, setFlashResult] = useState(null);
  const [flashIsGoal, setFlashIsGoal] = useState(false);
  const ballPosRef = useRef(CENTER_ZONE);

  // contadores de acoes da partida atual
  const [matchPass, setMatchPass]     = useState(0);
  const [matchDribble, setMatchDribble] = useState(0);
  const [matchShoot, setMatchShoot]   = useState(0);
  const [levelUpInfo, setLevelUpInfo] = useState(null);

  // conquistas recem-desbloqueadas
  const [newAchievements, setNewAchievements] = useState([]);
  const [gameOver, setGameOver] = useState(null);
  const [showContinueBtn, setShowContinueBtn] = useState(false);
  const [dailyChallengeActive, setDailyChallengeActive] = useState(false);
  const [challengeReward, setChallengeReward] = useState(null);

  // Modo 2 jogadoras: 'p1' = aguardando P1, 'p1done' = P1 escolheu (cobrir), 'p2' = aguardando P2
  const [p2Phase, setP2Phase] = useState(twoPlayerActive ? 'p1' : null);
  const [p1Choice, setP1Choice] = useState(null);
  const [showP1Cover, setShowP1Cover] = useState(false); // cobre a tela entre P1 e P2

  // --- USOS DE HABILIDADE ---------------------------------------
  const [abilityUses, setAbilityUses] = useState(1);
  const [nextForcedWin, setNextForcedWin] = useState(false);
  const [drawToAdvanceUses, setDrawToAdvanceUses] = useState(1);
  const [doubleAdvanceUses, setDoubleAdvanceUses] = useState(1);
  const [revealUses, setRevealUses] = useState(1);
  const [revealedBotPick, setRevealedBotPick] = useState(null);

  const nextBotPick = useRef(null);

  useEffect(() => {
    if (!matchConfig) return;
    matchMusic.play();
    audio.startCrowd?.();
    if (matchConfig.duration === '2min') {
      setTimeLeft(120);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); return 0; } return prev - 1; });
      }, 1000);
    }
    return () => { matchMusic.stop(); audio.stopCrowd?.(); clearInterval(timerRef.current); };
  }, [matchConfig]);

  useEffect(() => {
    if (timeLeft !== 0 || !matchConfig || gameOver) return;
    matchMusic.stop();
    const won = playerScore > opponentScore;
    const draw = playerScore === opponentScore;
    finishGame({ won, draw, ps: playerScore, os: opponentScore });
  }, [timeLeft]);

  // Auto-continuar apos CONTINUE_DELAY_MS (sem necessidade de botao)
  useEffect(() => {
    if (!showResult) { setShowContinueBtn(false); return; }
    const t = setTimeout(() => { setShowContinueBtn(true); handleContinue(); }, CONTINUE_DELAY_MS);
    return () => clearTimeout(t);
  }, [showResult, turn]);

  const showAbilityMsgFn = (msg) => {
    setAbilityMsg(msg);
    setTimeout(() => setAbilityMsg(null), 2500);
  };

  // --- REVELAR JOGADA DO BOT (Iris) -----------------------------
  const handleReveal = () => {
    if (revealUses <= 0 || isResolving || revealedBotPick || twoPlayerMode) return;
    const pick = botAction(difficulty);
    nextBotPick.current = pick;
    setRevealedBotPick(pick);
    setRevealUses(0);
    showAbilityMsgFn('Foco Total! Voce viu a jogada do bot!');
  };

  // --- RESOLVER RODADA ------------------------------------------
  const resolveRound = useCallback((choice, botPick) => {
    setPlayerPick(choice);
    setOpponentPick(botPick);
    setSuspense(true);
    setIsResolving(true);
    setRevealedBotPick(null);

    setTimeout(() => {
      setSuspense(false);

      let result = resolveAction(choice, botPick);
      let newStreak = streak;
      let newDrawStreak = drawStreak;
      let newAbilityUses = abilityUses;
      let move = 0;

      // habilidades (apenas modo 1 jogadora vs bot)
      if (!twoPlayerActive) {
        if (result === 'lose' && ability?.effect === 'lose_to_draw_once' && newAbilityUses > 0) {
          result = 'draw'; newAbilityUses = 0; setAbilityUses(0);
          showAbilityMsgFn('Leitura! Derrota virou empate!');
        }
        if (result === 'lose' && ability?.effect === 'no_retreat_once' && newAbilityUses > 0) {
          newAbilityUses--; setAbilityUses(newAbilityUses);
          showAbilityMsgFn('Muro! Sem recuar!');
          setShowResult(result); setFlashResult(result);
          setTimeout(() => setFlashResult(null), 1800);
          setStreak(0); setDrawStreak(0);
          return;
        }
        if (ability?.effect === 'forced_win_once' && nextForcedWin && result !== 'win') {
          result = 'win'; setNextForcedWin(false);
          showAbilityMsgFn('Vontade de Ferro! Vitoria garantida!');
        }
        if (result === 'draw' && ability?.effect === 'draw_to_advance_once' && drawToAdvanceUses > 0) {
          setDrawToAdvanceUses(0);
          showAbilityMsgFn('Uniao! Empate virou avanco!');
          setBallPos(prev => Math.min(prev + 1, MAX_ZONE));
          setShowResult(result); setFlashResult(result);
          setTimeout(() => setFlashResult(null), 1800);
          setStreak(0); setDrawStreak(0);
          return;
        }
      }

      if (result === 'win') {
        newStreak++; newDrawStreak = 0; move = 1;
        if (!twoPlayerActive && ability?.effect === 'double_advance_once' && doubleAdvanceUses > 0) {
          move = 2; setDoubleAdvanceUses(0);
          showAbilityMsgFn('Explosao! Avancou 2 zonas de uma vez!');
        }
      } else if (result === 'lose') {
        move = -1; newStreak = 0; newDrawStreak = 0;
      } else {
        newDrawStreak++; newStreak = 0;
        if (!twoPlayerActive && ability?.effect === 'advance_after_2draws' && newDrawStreak >= 2) {
          move = 1; newDrawStreak = 0;
          showAbilityMsgFn('Ginga! Avancou apos 2 empates seguidos!');
        }
      }

      const newPos = Math.max(0, Math.min(MAX_ZONE, ballPosRef.current + move));
      ballPosRef.current = newPos;
      setBallPos(newPos);
      const isGoal = (result === 'win' && newPos >= MAX_ZONE) || (result === 'lose' && newPos <= 0);
      setShowResult(result);
      setFlashResult(result);
      setFlashIsGoal(isGoal);
      setTimeout(() => setFlashResult(null), 1900);
      setStreak(newStreak);
      setDrawStreak(newDrawStreak);
      setAbilityUses(newAbilityUses);
    }, SUSPENSE_MS);
  }, [isResolving, difficulty, ability, nextForcedWin, streak, drawStreak, abilityUses, drawToAdvanceUses, doubleAdvanceUses, twoPlayerActive]);

  // --- SELECAO DE ACAO ------------------------------------------
  const handleSelect = useCallback((choice) => {
    if (isResolving) return;

    if (twoPlayerActive) {
      if (p2Phase === 'p1') {
        // P1 escolheu - cobrir tela e pedir P2
        setP1Choice(choice);
        setShowP1Cover(true);
        setP2Phase('p1done');
        setTimeout(() => {
          setShowP1Cover(false);
          setP2Phase('p2');
        }, 1200);
      } else if (p2Phase === 'p2') {
        // P2 escolheu - resolver
        setP2Phase(null);
        resolveRound(p1Choice, choice);
      }
      return;
    }

    // Modo vs bot
    if (choice === 'pass') setMatchPass(p => p + 1);
    else if (choice === 'dribble') setMatchDribble(p => p + 1);
    else if (choice === 'shoot') setMatchShoot(p => p + 1);
    const botPick = nextBotPick.current || botAction(difficulty);
    nextBotPick.current = null;
    resolveRound(choice, botPick);
  }, [isResolving, twoPlayerActive, p2Phase, p1Choice, difficulty, resolveRound]);

  // --- CONTINUAR ------------------------------------------------
  const handleContinue = () => {
    // Impede continuar se jogo ja acabou
    if (playerScore >= GOALS_TO_WIN || opponentScore >= GOALS_TO_WIN) {
      return;
    }
    
    let ps = playerScore;
    let os = opponentScore;

    if (ballPos >= MAX_ZONE && showResult === 'win') {
      ps = Number(playerScore) + 1;
      setPlayerScore(ps);
      setGoalAnimation('player');
      ballPosRef.current = CENTER_ZONE;
      setBallPos(CENTER_ZONE);
    } else if (ballPos <= 0 && showResult === 'lose') {
      os = Number(opponentScore) + 1;
      setOpponentScore(os);
      setGoalAnimation('opponent');
      ballPosRef.current = CENTER_ZONE;
      setBallPos(CENTER_ZONE);
    }

    if (ps >= GOALS_TO_WIN || os >= GOALS_TO_WIN) {
      const won = ps >= GOALS_TO_WIN;
      matchMusic.stop();
      if (won && storySceneId) {
        const sceneId = parseInt(storySceneId, 10);
        try { unlockScene?.(sceneId); } catch {}
        try {
          const STORY_KEY = 'molecas_story';
          const sp = JSON.parse(localStorage.getItem(STORY_KEY) || '{}');
          sp[sceneId] = { completed: true, unlocked: true };
          sp[sceneId + 1] = { ...sp[sceneId + 1], unlocked: true };
          localStorage.setItem(STORY_KEY, JSON.stringify(sp));
          window.dispatchEvent(new StorageEvent('storage', { key: STORY_KEY, newValue: JSON.stringify(sp) }));
        } catch {}
      }
      finishGame({ won, draw: ps === os, ps, os });
      return;
    }

    setTimeout(() => {
      setGoalAnimation(null);
      setShowResult(null);
      setPlayerPick(null);
      setOpponentPick(null);
      setIsResolving(false);
      setShowContinueBtn(false);
      setTurn(t => t + 1);
      if (twoPlayerActive) setP2Phase('p1');
    }, 800);
  };

  const GOALS_TO_WIN = !matchConfig ? 3 : matchConfig.duration === '2goals' ? 2 : matchConfig.duration === '2min' ? 99 : 3;

  const finishGame = ({ won, draw, ps, os }) => {
    const tid = (p1Team || playerTeam).id;
    const pid = activeP1.playerId;
    clearInterval(timerRef.current);
    
    // Verificar se completou desafio diário
    if (dailyChallengeActive && won) {
      const challenge = getTodayChallenge();
      let challengeMet = false;
      if (challenge.id === 1 && turn < 3) challengeMet = true; // Relâmpago
      if (challenge.id === 2 && opponentScore === 0) challengeMet = true; // Sem erros
      if (challenge.id === 3 && ps >= 3) challengeMet = true; // Dominadora
      if (challenge.id === 4 && ps >= 1 && os === 0) challengeMet = true; // Invencível
      if (challenge.id === 5) challengeMet = true; // Sorte do iniciante
      
      if (challengeMet) {
        markChallengeCompleted();
        const reward = [];
        for (let i = 0; i < 3; i++) {
          const earned = earnFromMatch(true, ps);
          if (earned) reward.push(earned.definition || earned);
        }
        setChallengeReward(reward);
      }
    }
    if (won) {
      const lvRes = addWinXP({ playerId: pid, teamId: tid, xpAmount: 40 });
      if (lvRes.playerLevelUp || lvRes.teamLevelUp) setLevelUpInfo(lvRes);
      // Ganhar figurinha por vencer
      const def = drawSticker('match', ps >= 5 ? 'epic' : ps >= 3 ? 'rare' : undefined);
      const stickerResult = addSticker(def.id, 'match', true);
      if (stickerResult) showToast({ ...stickerResult, definition: def });
    }
    try {
      const res = saveMatchResult?.({ won, draw, playerGoals: ps, opponentGoals: os,
        mode: twoPlayerActive ? 'vs_player' : 'vs_bot',
        passUsed: matchPass, dribbleUsed: matchDribble, shootUsed: matchShoot });
      if (res?.newAchievements?.length) setNewAchievements(res.newAchievements);
    } catch {}
    setTimeout(() => setGameOver({ won, draw: ps === os, ps, os, turns: turn, teamId, opponentId, pass: matchPass, dribble: matchDribble, shoot: matchShoot }), 1200);
  };

  const getUsesLeft = () => {
    if (!ability?.effect) return null;
    if (ability.effect === 'lose_to_draw_once')   return abilityUses;
    if (ability.effect === 'no_retreat_once')      return abilityUses;
    if (ability.effect === 'draw_to_advance_once') return drawToAdvanceUses;
    if (ability.effect === 'double_advance_once')  return doubleAdvanceUses;
    if (ability.effect === 'reveal_bot_once')      return revealUses;
    return null;
  };
  const usesLeft = getUsesLeft();

  // --- ROTULO DO TURNO 2P ---------------------------------------
  const p2PhaseLabel = () => {
    if (!twoPlayerActive || showResult) return null;
    if (p2Phase === 'p1') return { label: 'Jogadora 1, escolha!', color: 'text-primary' };
    if (p2Phase === 'p2') return { label: 'Jogadora 2, escolha!', color: 'text-orange-500' };
    return null;
  };
  const phaseInfo = p2PhaseLabel();

  // --- TELA SELECAO DE MODO -------------------------------------
  if (twoPlayerActive && modeSelected && setupPhase !== 'done') {
    if (setupPhase === 'p1') {
      return (
        <PlayerSetupScreen
          numero={1}
          initial={p1Config}
          onConfirm={(cfg) => {
            setP1Config(cfg);
            setSetupPhase('cover');
            setTimeout(() => setSetupPhase('p2'), 2000);
          }}
        />
      );
    }
    if (setupPhase === 'cover') {
      return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
          <motion.span className="text-6xl" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            ⚽
          </motion.span>
          <p className="font-heading font-bold text-white text-2xl text-center px-8">Jogadora 1 configurada!</p>
          <p className="text-white/60 text-sm text-center px-8">Passe o celular para a Jogadora 2...</p>
          <motion.div className="mt-4 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div className="h-full bg-orange-500 rounded-full"
              initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, ease: 'linear' }} />
          </motion.div>
        </div>
      );
    }
    if (setupPhase === 'p2') {
      return (
        <PlayerSetupScreen
          numero={2}
          initial={p2Config}
          onConfirm={(cfg) => {
            setP2Config(cfg);
            setSetupPhase('done');
          }}
        />
      );
    }
  }

  // --- CONFIG DE PARTIDA (antes de escolher modo) ---------------
  if (!matchConfig) {
    return <MatchSetupScreen onConfirm={cfg => setMatchConfig(cfg)} onBack={() => navigate(-1)} />;
  }

  // --- TELA DE RESULTADO INLINE ---------------------------------
  if (gameOver) {
    return (
      <GameOverScreen
        data={gameOver}
        onPlayAgain={() => navigate(-1)}
        onHome={() => navigate('/')}
      />
    );
  }

  if (dailyChallengeActive && !matchConfig && !modeSelected) {
    return (
      <div className="min-h-screen p-4 pb-8 flex flex-col items-center justify-center">
        <DailyChallengeCard onAccept={() => { setMatchConfig({ field: 'blue', duration: 'goals' }); setModeSelected(true); }} />
        <button onClick={() => setDailyChallengeActive(false)}
          className="mt-4 text-muted-foreground text-sm font-medium">
          ← Jogar sem desafio
        </button>
      </div>
    );
  }

  if (!modeSelected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
          <span className="text-6xl block mb-3">⚽</span>
          <h1 className="font-heading font-bold text-3xl">Como quer jogar?</h1>
          <p className="text-muted-foreground text-sm mt-1">{playerTeam.name} vs {opponentTeam.name}</p>
        </motion.div>

        <div className="w-full max-w-sm space-y-3">
          <motion.button
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setTwoPlayerActive(false); setP2Phase(null); setModeSelected(true); }}
            className="w-full py-5 bg-primary text-primary-foreground rounded-3xl font-heading font-bold text-xl shadow-xl flex flex-col items-center gap-1"
          >
            <span className="text-3xl">🤖</span>
            <span>1 Jogadora vs Bot</span>
            <span className="text-xs font-normal opacity-75">Jogue sozinha contra o computador</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setTwoPlayerActive(true); setP2Phase('p1'); setModeSelected(true); }}
            className="w-full py-5 bg-orange-500 text-white rounded-3xl font-heading font-bold text-xl shadow-xl flex flex-col items-center gap-1"
          >
            <span className="text-3xl">👥</span>
            <span>2 Jogadoras</span>
            <span className="text-xs font-normal opacity-75">Passem o celular entre si - sem internet!</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            onClick={() => navigate(-1)}
            className="w-full py-3 text-muted-foreground text-sm font-medium"
          >
            ← Voltar
          </motion.button>
        </div>
      </div>
    );
  }

  // --- RENDER ---------------------------------------------------
  return (
    <div className="min-h-screen p-4 pb-8">

      {/* --- TOAST DE CONQUISTA --- */}
      <AnimatePresence>
        {newAchievements.length > 0 && (
          <AchievementToast achievements={newAchievements} onDone={() => setNewAchievements([])} />
        )}
      </AnimatePresence>

      {/* --- TOAST LEVEL UP --- */}
      <AnimatePresence>
        {levelUpInfo && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-20 left-0 right-0 z-[100] flex justify-center pointer-events-none"
          >
            <div className="bg-purple-500 text-white font-heading font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-purple-300">
              <span className="text-3xl">🌟</span>
              <div>
                {levelUpInfo.playerLevelUp && <p className="text-sm">👨‍💻 Jogadora → Nível {levelUpInfo.playerLevel}!</p>}
                {levelUpInfo.teamLevelUp && <p className="text-sm">🏆 Time → Nível {levelUpInfo.teamLevel}!</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BARRA SUPERIOR --- */}
      <div className="flex items-center justify-between max-w-sm mx-auto mb-2">
        <button onClick={() => setShowQuit(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl active:scale-95 transition-transform">
          Desistir
        </button>
        {twoPlayerActive && (
          <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl">
            2 Jogadoras
          </span>
        )}
        <button onClick={() => { const m = matchMusic.toggleMute(); setMusicMuted(m); }}
          className="text-xl px-2" title={musicMuted ? 'Ativar musica' : 'Silenciar'}>
          {musicMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <ScoreBoard
        playerTeam={p1Team}
        opponentTeam={p2Team}
        playerScore={playerScore}
        opponentScore={opponentScore}
        turn={turn}
      />

      {matchConfig?.duration === '2min' && timeLeft !== null && (
        <div className="max-w-sm mx-auto flex justify-center mb-1">
          <span className={`font-heading font-bold text-2xl px-4 py-1 rounded-xl ${
            timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-muted text-foreground'
          }`}>⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
        </div>
      )}

      <FutsalField
        ballPos={ballPos}
        goalAnimation={goalAnimation}
        uniformColor={activeUniformColor}
        fieldType={matchConfig?.field || 'blue'}
      />

      {/* --- NOTIFICACAO DE HABILIDADE --- */}
      <AnimatePresence>
        {abilityMsg && (
          <motion.div initial={{ scale: 0.5, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: -10 }}
            className="fixed top-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="bg-primary text-primary-foreground font-heading font-bold text-lg px-6 py-3 rounded-2xl shadow-2xl border-2 border-white/30">
              {abilityMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CARD DE HABILIDADE (so modo 1P vs bot) --- */}
      {!twoPlayerActive && ability?.desc && (
        <div className="max-w-sm mx-auto my-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-lg">{ability.emoji}</span>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wide">Habilidade</p>
            <p className="text-xs text-foreground/80">{ability.desc}</p>
          </div>
          {usesLeft !== null && (
            <span className={`text-[10px] rounded-full px-2 py-0.5 font-bold flex-shrink-0 ${
              usesLeft > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground line-through'
            }`}>x{usesLeft}</span>
          )}
          {ability.effect === 'reveal_bot_once' && revealUses > 0 && !isResolving && !showResult && (
            <button onClick={handleReveal}
              className="text-[10px] bg-yellow-400 text-yellow-900 font-bold px-2 py-1 rounded-lg active:scale-95 transition-transform flex-shrink-0">
              Ver
            </button>
          )}
        </div>
      )}

      {/* --- JOGADA REVELADA DO BOT --- */}
      {revealedBotPick && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-sm mx-auto mb-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 rounded-xl px-3 py-2 text-center">
          <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300">
            Bot vai jogar: <span className="text-base font-bold">{ACTION_ICONS[revealedBotPick]?.label}</span>
          </p>
        </motion.div>
      )}

      {/* --- FLASH DE RESULTADO (z-index alto, pointer-events-none) --- */}
      <AnimatePresence>
        {flashResult && <ResultFlash key={`flash-${turn}`} result={flashResult} isGoal={flashIsGoal} />}
      </AnimatePresence>

      {/* --- ANIMACAO DO CINEMA (durante suspense) --- */}
      <AnimatePresence>
        {suspense && <ActionCinema key="cinema" playerPick={playerPick} suspense={suspense} />}
      </AnimatePresence>

      {/* --- VISUALIZADOR DE RESULTADO --- */}
      <AnimatePresence>
        {showResult && !suspense && (
          <ActionVisualizer key="visualizer"
            playerPick={playerPick} opponentPick={opponentPick} result={showResult} isGoal={flashIsGoal}
            p1Name={twoPlayerActive ? 'Jogadora 1' : 'Voce'}
            p2Name={twoPlayerActive ? 'Jogadora 2' : 'Adversaria'}/>
        )}
      </AnimatePresence>

      {/* --- AUTO-CONTINUAR apos animacao (sem botao) --- */}

      {/* --- ROTULO TURNO 2P --- */}
      {phaseInfo && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-sm mx-auto my-2 text-center">
          <p className={`font-heading font-bold text-lg ${phaseInfo.color}`}>{phaseInfo.label}</p>
        </motion.div>
      )}

      {/* --- BOTOES DE ACAO --- */}
      <ActionButtons
        onSelect={handleSelect}
        disabled={isResolving || !!showResult || !!showP1Cover}
        hidden={!!showResult}
      />

      {/* --- REGRAS (quando nao esta resolvendo) --- */}
      {!isResolving && !showResult && <RulesCard />}

      {/* --- TELA DE COBERTURA (modo 2P entre P1 e P2) --- */}
      <AnimatePresence>
        {showP1Cover && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(0,0,0,0.92)' }}>
            <span className="text-6xl">🎮</span>
            <p className="font-heading font-bold text-white text-2xl text-center px-8">
              Jogadora 1 escolheu!
            </p>
            <p className="text-white/70 text-sm text-center px-8">
              Passe o celular para a Jogadora 2...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL DESISTIR --- */}
      <AnimatePresence>
        {showQuit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuit(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }} onClick={e => e.stopPropagation()}
              className="bg-card rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl border border-border/40">
              <span className="text-5xl block">⚠️</span>
              <p className="font-heading font-bold text-xl">Desistir da partida?</p>
              <p className="text-sm text-muted-foreground">O placar nao sera salvo e voce voltara ao inicio.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowQuit(false)}
                  className="flex-1 py-3 bg-muted rounded-2xl font-heading font-bold text-sm">
                  Continuar
                </button>
                <button onClick={() => { matchMusic.stop(); navigate('/'); }}
                  className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-2xl font-heading font-bold text-sm">
                  Sair
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <StickerToast />
    </div>
  );
}