import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap } from 'lucide-react';
import { audio } from '@/lib/audioEngine';
import { bgMusic } from '@/lib/trainingMusic';
import { LevelBadge } from './TrainingHelpers';

const POSITIONS = [
  { x: 20, y: 20 }, { x: 50, y: 12 }, { x: 80, y: 20 },
  { x: 14, y: 50 }, { x: 50, y: 50 }, { x: 86, y: 50 },
  { x: 20, y: 80 }, { x: 50, y: 88 }, { x: 80, y: 80 },
];

const PLAYER_EMOJIS = ['👧🏽', '👧🏾', '👧🏿', '👧🏼', '👧', '👧🏽', '👧🏾', '👧🏿', '👧🏼'];

function PassTrail({ from, to }) {
  if (from === null || to === null || from === to) return null;
  const p1 = POSITIONS[from];
  const p2 = POSITIONS[to];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.line
        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
        stroke="rgba(255,220,0,0.85)" strokeWidth="0.8" strokeDasharray="3 2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 0.6] }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </svg>
  );
}

function PlayerDot({ active, emoji, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="absolute -translate-x-1/2 -translate-y-1/2 z-20 focus:outline-none">
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div key="active"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="relative flex items-center justify-center"
          >
            <motion.div className="absolute rounded-full"
              style={{ background: 'rgba(250,204,21,0.35)', width: 52, height: 52, marginLeft: -4, marginTop: -4 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.2, 0.7] }}
              transition={{ repeat: Infinity, duration: 0.7 }} />
            <motion.div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg,#fde68a,#f59e0b)', boxShadow: '0 0 20px rgba(250,204,21,0.8)' }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}>
              {emoji}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
            <span className="text-base opacity-60">{emoji}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function PassGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);

  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [round, setRound] = useState(0);
  const [activePos, setActivePos] = useState(null);
  const [prevPos, setPrevPos] = useState(null);
  const [level, setLevel] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [running, setRunning] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [goldenReward, setGoldenReward] = useState(null);
  const [timerPct, setTimerPct] = useState(1);

  const timerRef = useRef(null);
  const animRef = useRef(null);
  const roundRef = useRef(0);
  const comboRef = useRef(0);
  const speedRef = useRef(2200);
  const startTimeRef = useRef(null);

  const MAX_ROUNDS = 10 + level * 2;
  const baseSpeed = Math.max(2200 - level * 150, 650);
  const R = 18;
  const circ = 2 * Math.PI * R;

  const animateTimer = useCallback((duration) => {
    cancelAnimationFrame(animRef.current);
    startTimeRef.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const pct = Math.max(0, 1 - elapsed / duration);
      setTimerPct(pct);
      if (pct > 0) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const spawnNext = useCallback(() => {
    if (roundRef.current >= MAX_ROUNDS) { setRunning(false); return; }
    const idx = Math.floor(Math.random() * POSITIONS.length);
    setActivePos(idx);
    setFeedback(null);
    animateTimer(speedRef.current);
    timerRef.current = setTimeout(() => {
      setMissed(m => m + 1);
      setFeedback('miss');
      setActivePos(null);
      comboRef.current = 0;
      setCombo(0);
      roundRef.current += 1;
      setRound(roundRef.current);
      setTimeout(spawnNext, 500);
    }, speedRef.current);
  }, [MAX_ROUNDS, animateTimer]);

  const start = useCallback(() => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(animRef.current);
    speedRef.current = baseSpeed;
    roundRef.current = 0;
    comboRef.current = 0;
    setScore(0); setMissed(0); setRound(0); setRunning(true);
    setFeedback(null); setActivePos(null); setPrevPos(null);
    setCombo(0); setMaxCombo(0); setTimerPct(1);
    setTimeout(spawnNext, 400);
  }, [baseSpeed, spawnNext]);

  const handleClick = useCallback((idx) => {
    if (idx !== activePos || !running) return;
    clearTimeout(timerRef.current);
    cancelAnimationFrame(animRef.current);
    audio.playPass?.();
    comboRef.current += 1;
    setCombo(comboRef.current);
    setMaxCombo(m => Math.max(m, comboRef.current));
    setScore(s => s + 1);
    setFeedback('hit');
    setPrevPos(idx);
    setActivePos(null);
    roundRef.current += 1;
    setRound(roundRef.current);
    if (roundRef.current % 4 === 0) speedRef.current = Math.max(speedRef.current - 120, 600);
    setTimeout(spawnNext, 280);
  }, [activePos, running, spawnNext]);

  useEffect(() => () => { clearTimeout(timerRef.current); cancelAnimationFrame(animRef.current); }, []);

  const done = round >= MAX_ROUNDS && !running;
  const accuracy = MAX_ROUNDS > 0 ? Math.round((score / MAX_ROUNDS) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-xl">⚽ Treino de Passe</p>
          <p className="text-xs text-muted-foreground">
            {level < 3 ? 'Toque na jogadora iluminada!' : level < 7 ? '⚡ Elas se movem mais rápido!' : '🔥 Velocidade máxima!'}
          </p>
        </div>
        <LevelBadge level={level} />
      </div>

      {/* Placar */}
      <div className="flex gap-2">
        <div className="flex-1 bg-green-500/15 border border-green-500/30 rounded-2xl p-2 text-center">
          <p className="font-heading font-bold text-2xl text-green-600">{score}</p>
          <p className="text-[10px] text-muted-foreground">Passes</p>
        </div>
        <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-2xl p-2 text-center">
          <p className="font-heading font-bold text-2xl text-red-500">{missed}</p>
          <p className="text-[10px] text-muted-foreground">Erros</p>
        </div>
        <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-2 text-center">
          <p className="font-heading font-bold text-2xl text-yellow-600">{combo}</p>
          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
            <Zap className="w-3 h-3" />Combo
          </p>
        </div>
      </div>

      {/* Campo */}
      <div className="relative mx-auto rounded-3xl overflow-hidden select-none shadow-2xl"
        style={{ width: '100%', maxWidth: 340, height: 260, background: 'linear-gradient(180deg,#166534 0%,#15803d 50%,#166534 100%)' }}>

        {/* Listras */}
        <div className="absolute inset-0 pointer-events-none">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="absolute top-0 bottom-0"
              style={{ left: `${i*20}%`, width: '20%', background: i%2===0?'rgba(0,0,0,0.07)':'transparent' }} />
          ))}
        </div>

        {/* Linhas SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" rx="2"/>
          <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
          <rect x="35" y="2" width="30" height="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5"/>
          <rect x="35" y="86" width="30" height="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5"/>
        </svg>

        {/* Trilha de passe */}
        <PassTrail from={prevPos} to={activePos} />

        {/* Jogadoras */}
        {POSITIONS.map((pos, i) => (
          <div key={i} className="absolute" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
            <PlayerDot
              active={activePos === i}
              emoji={PLAYER_EMOJIS[i]}
              onClick={() => handleClick(i)}
              disabled={!running}
            />
          </div>
        ))}

        {/* Timer ring */}
        {running && activePos !== null && (
          <div className="absolute top-2 right-2 z-30">
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r={R} fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5"/>
              <circle cx="22" cy="22" r={R} fill="none"
                stroke={timerPct > 0.4 ? '#22c55e' : timerPct > 0.2 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - timerPct)}
                style={{ transformOrigin: '22px 22px', transform: 'rotate(-90deg)' }}
              />
              <text x="22" y="27" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
                {Math.ceil(timerPct * (speedRef.current / 1000))}s
              </text>
            </svg>
          </div>
        )}

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback === 'miss' && (
            <motion.div key="miss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none z-40">
              <motion.p initial={{ scale: 0.4 }} animate={{ scale: 1 }}
                className="font-heading font-bold text-3xl text-white drop-shadow-lg">❌ Errou!</motion.p>
            </motion.div>
          )}
          {feedback === 'hit' && combo >= 3 && (
            <motion.div key="combo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-3 left-3 z-40 pointer-events-none">
              <div className="bg-yellow-400 text-yellow-900 font-heading font-bold text-sm px-3 py-1 rounded-full shadow-lg">
                🔥 Combo x{combo}!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de progresso */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30 z-30">
          <motion.div className="h-full rounded-b-3xl"
            style={{ background: 'linear-gradient(90deg,#22c55e,#86efac)' }}
            animate={{ width: `${(round / MAX_ROUNDS) * 100}%` }}
            transition={{ type: 'spring', stiffness: 60 }} />
        </div>
      </div>

      {/* Botão iniciar */}
      {!running && !done && (
        <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          whileTap={{ scale: 0.95 }} onClick={start}
          className="w-full py-4 rounded-2xl font-heading font-bold text-xl text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
          ▶ Começar Treino!
        </motion.button>
      )}

      {/* Tela final */}
      {done && (
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border/30 rounded-3xl p-5 text-center space-y-3 shadow-xl">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="text-5xl">
            {score >= Math.ceil(MAX_ROUNDS / 2) + level ? '🏆' : score >= Math.ceil(MAX_ROUNDS / 2) ? '⭐' : '💪'}
          </motion.div>
          <p className="font-heading font-bold text-2xl">
            {score >= Math.ceil(MAX_ROUNDS / 2) + level ? 'Subiu de nível! 🌟' : score >= Math.ceil(MAX_ROUNDS / 2) ? 'Bom treino!' : 'Continue treinando!'}
          </p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-green-500/10 rounded-xl p-2">
              <p className="font-bold text-green-600 text-xl">{score}</p>
              <p className="text-[10px] text-muted-foreground">Acertos</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-2">
              <p className="font-bold text-primary text-xl">{accuracy}%</p>
              <p className="text-[10px] text-muted-foreground">Precisão</p>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-2">
              <p className="font-bold text-yellow-600 text-xl">{maxCombo}</p>
              <p className="text-[10px] text-muted-foreground">Combo máx</p>
            </div>
          </div>
          {goldenReward && (
            <div className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 border-2 border-yellow-400 rounded-2xl p-3">
              <p className="text-2xl">⭐</p>
              <p className="font-heading font-bold text-yellow-700 dark:text-yellow-400 text-sm">Figurinha Dourada!</p>
              <p className="font-mono font-bold text-yellow-600">{goldenReward.code}</p>
            </div>
          )}
          <button onClick={() => {
            const threshold = Math.ceil(MAX_ROUNDS / 2) + level;
            const nextLvl = score >= threshold ? Math.min(level + 1, 10) : level;
            setLevel(nextLvl); setTimeout(start, 50);
          }} className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-heading font-bold shadow-lg">
            <RotateCcw className="w-4 h-4" /> Treinar Novamente
          </button>
        </motion.div>
      )}
    </div>
  );
}