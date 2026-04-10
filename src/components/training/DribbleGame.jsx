import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap } from 'lucide-react';
import { audio } from '@/lib/audioEngine';
import { bgMusic } from '@/lib/trainingMusic';
import { LevelBadge } from './TrainingHelpers';
import { earnGoldenStickerLocal } from '@/lib/goldenStickers';

const getConeCount = (lvl) => Math.min(4 + Math.floor(lvl / 2), 10);
const getBotTime  = (lvl) => Math.max(9500 - lvl * 700, 2000);

// Campo SVG visual modernizado
function Field({ cones, playerCone, botCone, coneCount, trail }) {
  const W = 100, H = 100;
  const cp = cones;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Fundo grama */}
      <defs>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14532d"/>
          <stop offset="50%" stopColor="#166534"/>
          <stop offset="100%" stopColor="#15803d"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#grass)"/>
      {/* Listras */}
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={i*20} y={0} width={20} height={H}
          fill={i%2===0 ? 'rgba(0,0,0,0.08)' : 'transparent'}/>
      ))}
      {/* Borda */}
      <rect x="1.5" y="1.5" width={W-3} height={H-3} fill="none"
        stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" rx="1.5"/>

      {/* Linha de chegada */}
      <rect x="2" y="2" width={W-4} height="9" fill="rgba(255,255,255,0.15)" rx="1"/>
      <text x={W/2} y="8.5" textAnchor="middle" fontSize="4.5" fill="white" fontWeight="bold">🏁 CHEGADA</text>

      {/* Linha pontilhada do percurso */}
      <polyline
        points={cp.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeDasharray="2 2"/>

      {/* Trilha do jogador */}
      {trail.length > 1 && (
        <polyline
          points={trail.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke="rgba(250,204,21,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
      )}

      {/* Cones */}
      {cp.map((pos, i) => (
        <g key={i}>
          {i < playerCone && (
            <circle cx={pos.x} cy={pos.y} r="3.5" fill="rgba(74,222,128,0.3)" stroke="rgba(74,222,128,0.6)" strokeWidth="0.5"/>
          )}
          <text x={pos.x} y={pos.y + 2.5} textAnchor="middle"
            fontSize={i < playerCone ? "5" : "7"}
            opacity={i < playerCone ? 0.3 : 1}>🔶</text>
          {i === playerCone && (
            <circle cx={pos.x} cy={pos.y} r="5" fill="none"
              stroke="rgba(250,204,21,0.7)" strokeWidth="0.8"
              style={{ animation: 'ping 1s infinite' }}/>
          )}
        </g>
      ))}

      {/* Bot (adversária) */}
      {botCone < coneCount && (
        <motion.g
          animate={{ x: cp[Math.min(botCone, coneCount-1)].x, y: cp[Math.min(botCone, coneCount-1)].y }}
          transition={{ duration: 0.25, ease: 'easeOut' }}>
          <circle cx={0} cy={0} r="4" fill="rgba(239,68,68,0.4)" stroke="rgba(239,68,68,0.8)" strokeWidth="0.6"/>
          <text x={8} y={3} fontSize="8" textAnchor="middle">👟</text>
        </motion.g>
      )}

      {/* Jogadora (bola) */}
      {playerCone < coneCount && (
        <motion.g
          animate={{ x: cp[Math.min(playerCone, coneCount-1)].x - 8, y: cp[Math.min(playerCone, coneCount-1)].y }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <circle cx={0} cy={0} r="4.5" fill="rgba(250,204,21,0.3)" stroke="#fbbf24" strokeWidth="0.8"/>
          <text x={0} y={3} fontSize="9" textAnchor="middle">⚽</text>
        </motion.g>
      )}
    </svg>
  );
}

export default function DribbleGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);

  const [coneCount, setConeCount] = useState(5);
  const [playerCone, setPlayerCone] = useState(0);
  const [botCone, setBotCone] = useState(0);
  const [done, setDone] = useState(false);
  const [winner, setWinner] = useState(null);
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(0);
  const [goldenReward, setGoldenReward] = useState(null);
  const [trail, setTrail] = useState([]);
  const [tapEffect, setTapEffect] = useState(false);

  const botConeRef = useRef(0);
  const coneCountRef = useRef(5);
  const doneRef = useRef(false);
  const timerRef = useRef(null);

  // Calcula posições dos cones em zigue-zague
  const buildCones = (count) =>
    Array.from({ length: count }, (_, i) => ({
      x: i % 2 === 0 ? 32 : 68,
      y: 88 - i * (74 / (count - 1)),
    }));

  const [cones, setCones] = useState(buildCones(5));

  const scheduleBot = (totalMs, numCones) => {
    const step = totalMs / (numCones - 1);
    timerRef.current = setTimeout(() => {
      if (doneRef.current) return;
      const next = botConeRef.current + 1;
      botConeRef.current = next;
      setBotCone(next);
      if (next >= coneCountRef.current - 1) {
        if (!doneRef.current) { doneRef.current = true; setDone(true); setWinner('bot'); audio.playLose?.(); }
      } else { scheduleBot(totalMs, numCones); }
    }, step);
  };

  const start = (lvl = level) => {
    clearTimeout(timerRef.current);
    const count = getConeCount(lvl);
    const totalMs = getBotTime(lvl);
    const newCones = buildCones(count);
    botConeRef.current = 0; coneCountRef.current = count; doneRef.current = false;
    setConeCount(count); setCones(newCones);
    setPlayerCone(0); setBotCone(0); setDone(false); setWinner(null);
    setStarted(true); setTrail([newCones[0]]);
    scheduleBot(totalMs, count);
  };

  const advance = () => {
    if (!started || done) return;
    audio.playDribble?.();
    setTapEffect(true);
    setTimeout(() => setTapEffect(false), 200);
    const next = playerCone + 1;
    setTrail(t => [...t, cones[Math.min(next, coneCount - 1)]]);
    if (next >= coneCount) {
      clearTimeout(timerRef.current); doneRef.current = true;
      setDone(true); setWinner('player'); audio.playGoal?.();
      setLevel(l => {
        const newL = Math.min(l + 1, 10);
        if (newL === 10 && l === 9) { const gs = earnGoldenStickerLocal('Zig Zague'); setGoldenReward(gs); }
        return newL;
      });
    } else { setPlayerCone(next); }
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const playerPct = coneCount > 1 ? playerCone / (coneCount - 1) : 0;
  const botPct    = coneCount > 1 ? botCone    / (coneCount - 1) : 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-xl">⚡ Zig Zague nos Cones</p>
          <p className="text-xs text-muted-foreground">
            {level < 3 ? 'Passe pelos cones antes da adversária!' : level < 7 ? `${coneCount} cones — mais rápida!` : '🔥 Velocidade máxima!'}
          </p>
        </div>
        <LevelBadge level={level} />
      </div>

      {/* Barras de progresso */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden shadow-inner">
            <motion.div className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#22c55e,#86efac)' }}
              animate={{ width: `${playerPct * 100}%` }}
              transition={{ type: 'spring', damping: 18 }}/>
          </div>
          <span className="text-xs font-bold w-14 text-right">{playerCone+1}/{coneCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">👟</span>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden shadow-inner">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500"
              animate={{ width: `${botPct * 100}%` }}
              transition={{ duration: 0.28 }}/>
          </div>
          <span className="text-xs font-bold w-14 text-right text-red-400">{botCone+1}/{coneCount}</span>
        </div>
      </div>

      {/* Campo */}
      <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl select-none"
        style={{ width: '100%', maxWidth: 280, aspectRatio: '0.8' }}>
        <Field cones={cones} playerCone={playerCone} botCone={botCone} coneCount={coneCount} trail={trail}/>

        {/* Overlay resultado */}
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 ${
                winner === 'player' ? 'bg-green-900/80' : 'bg-red-900/80'
              }`}>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }} className="text-6xl">
                {winner === 'player' ? '🏆' : '😔'}
              </motion.span>
              <p className="font-heading font-bold text-white text-2xl text-center px-4">
                {winner === 'player' ? 'Você venceu!' : 'A adversária foi mais rápida!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Golden sticker */}
      <AnimatePresence>
        {goldenReward && winner === 'player' && (
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 border-2 border-yellow-400 rounded-2xl p-3 text-center">
            <p className="text-2xl">⭐</p>
            <p className="font-heading font-bold text-yellow-700 dark:text-yellow-400 text-sm">Figurinha Dourada!</p>
            <p className="font-mono font-bold text-yellow-600">{goldenReward.code}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botões */}
      {!started ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => start(level)}
          className="w-full py-4 rounded-2xl font-heading font-bold text-xl text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
          ▶ Começar!
        </motion.button>
      ) : !done ? (
        <motion.button
          onClick={advance}
          animate={tapEffect ? { scale: 0.88 } : { scale: 1 }}
          transition={{ duration: 0.1 }}
          className="w-full py-6 rounded-3xl font-heading font-bold text-2xl text-white shadow-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#16a34a,#4ade80)' }}>
          <motion.div className="absolute inset-0"
            animate={tapEffect ? { opacity: 0.4 } : { opacity: 0 }}
            style={{ background: 'white' }}/>
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Zap className="w-6 h-6"/> AVANÇAR!
          </span>
        </motion.button>
      ) : (
        <button onClick={() => start(level)}
          className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-heading font-bold shadow-lg">
          <RotateCcw className="w-4 h-4"/> Tentar de novo
        </button>
      )}
    </div>
  );
}