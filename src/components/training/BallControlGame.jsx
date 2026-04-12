import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { audio } from '@/lib/audioEngine';
import { bgMusic } from '@/lib/trainingMusic';
import { LevelBadge } from './TrainingHelpers';

const W = 300, H = 340;
const PLAYER_Y = H - 60;
const OBS_R = 20;
const PLAYER_R = 20;
const LANES = [50, 150, 250];

const getSpeed = (lvl) => 2.2 + lvl * 0.42;
const getSpawn = (lvl) => Math.max(1600 - lvl * 100, 550);

const DIFFICULTY_LEVELS = [
  { label: 'Nível 1 ⭐',    internalLvl: 0, desc: 'Poucas defensoras, bem lento — ideal pra começar!' },
  { label: 'Nível 2 ⭐⭐',   internalLvl: 2, desc: 'Ritmo moderado — bom desafio!' },
  { label: 'Nível 3 ⭐⭐⭐',  internalLvl: 4, desc: 'Defensoras mais rápidas e frequentes.' },
  { label: 'Nível 4 ⭐⭐⭐⭐', internalLvl: 6, desc: 'Difícil! Duas faixas bloqueadas às vezes.' },
  { label: 'Nível 5 🔥',    internalLvl: 9, desc: 'Modo pro — reflexos de elite!' },
];

// Cores dos obstáculos por tipo
const OBS_COLORS = ['#ef4444','#f97316','#ec4899','#8b5cf6'];
const OBS_EMOJIS = ['👟','⚡','🦵','💨'];

export default function BallControlGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);

  const [level, setLevel] = useState(0);
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('menu'); // menu | idle | running | crashed
  const [lastScore, setLastScore] = useState(0);
  const [goldenReward, setGoldenReward] = useState(null);
  const [crashPos, setCrashPos] = useState(null);
  const [passedObs, setPassedObs] = useState(new Set());

  const laneRef   = useRef(1);
  const obsRef    = useRef([]);
  const scoreRef  = useRef(0);
  const idRef     = useRef(0);
  const runRef    = useRef(false);
  const loopRef   = useRef(null);
  const spawnRef  = useRef(null);

  const stopAll = () => {
    clearInterval(loopRef.current);
    clearInterval(spawnRef.current);
    runRef.current = false;
  };

  const startGame = useCallback(() => {
    stopAll();
    laneRef.current = 1; obsRef.current = []; scoreRef.current = 0; idRef.current = 0;
    setLane(1); setObstacles([]); setScore(0); setPhase('running');
    setCrashPos(null); setPassedObs(new Set()); runRef.current = true;

    const spd = getSpeed(level);
    const spawnMs = getSpawn(level);
    let lastLane = -1;

    spawnRef.current = setInterval(() => {
      if (!runRef.current) return;
      const blockCount = level >= 7 ? 2 : 1;
      const blocked = new Set();
      while (blocked.size < blockCount) {
        const l = Math.floor(Math.random() * 3);
        if (blocked.size === 0 && l === lastLane) continue;
        blocked.add(l);
      }
      if (blocked.size >= 3) blocked.delete([...blocked][0]);
      lastLane = [...blocked][0];
      const colorIdx = idRef.current % OBS_COLORS.length;
      blocked.forEach(bl => {
        obsRef.current = [...obsRef.current, { lane: bl, y: -OBS_R, id: idRef.current++, colorIdx }];
      });
    }, spawnMs);

    loopRef.current = setInterval(() => {
      if (!runRef.current) return;
      const next = [];
      for (const o of obsRef.current) {
        const ny = o.y + spd;
        const px = LANES[laneRef.current];
        const ox = LANES[o.lane];
        const dist = Math.sqrt((px - ox) ** 2 + (PLAYER_Y - ny) ** 2);
        const passed = passedObs.has(o.id);
        
        // Obs passou para baixo
        if (ny > H + OBS_R) {
          if (!passed) {
            scoreRef.current++;
            setScore(scoreRef.current);
            setPassedObs(s => new Set([...s, o.id]));
            audio.playPass?.();
          }
          continue;
        }
        
        // Colisão (só conta se não passou ainda)
        if (!passed && dist < OBS_R + PLAYER_R - 5) {
          stopAll();
          setLastScore(scoreRef.current);
          setPhase('crashed');
          setCrashPos({ x: px, y: PLAYER_Y });
          audio.playLose?.();
          return;
        }
        next.push({ ...o, y: ny });
      }
      obsRef.current = next;
      setObstacles([...next]);
    }, 33);
  }, [level]);

  useEffect(() => () => stopAll(), []);

  const moveLane = useCallback((dir) => {
    if (phase !== 'running') return;
    const nl = Math.max(0, Math.min(2, laneRef.current + dir));
    laneRef.current = nl;
    setLane(nl);
    audio.playDribble?.();
  }, [phase]);

  const handleRestart = () => {
    if (lastScore >= 8) {
      setLevel(l => {
        const newL = Math.min(l + 1, 10);
        if (newL === 10 && l === 9) { const gs = earnGoldenStickerLocal('Condução'); setGoldenReward(gs); }
        return newL;
      });
    }
    startGame();
  };

  return (
    <div className="space-y-3">

      {/* Menu de seleção de nível */}
      {phase === 'menu' && (
        <div className="flex flex-col items-center gap-5 py-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 1.8, repeat: Infinity }} className="text-5xl mb-2">⚽</motion.div>
            <h1 className="font-heading font-black text-2xl text-primary mb-1">Condução de Bola</h1>
            <p className="text-xs text-muted-foreground px-6">Desvie das defensoras mudando de faixa!</p>
          </motion.div>
          <div className="w-full max-w-xs space-y-2">
            <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Escolha a dificuldade</p>
            {DIFFICULTY_LEVELS.map((dl, i) => (
              <motion.button key={i} whileTap={{ scale: 0.97 }}
                onClick={() => { setLevel(dl.internalLvl); setPhase('idle'); }}
                className="w-full py-3 px-4 rounded-2xl bg-card border-2 border-border/30 hover:border-primary text-left flex justify-between items-center transition-all">
                <div>
                  <div className="font-bold text-sm">{dl.label}</div>
                  <div className="text-[10px] text-muted-foreground">{dl.desc}</div>
                </div>
                <span className="text-xl">→</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Campo + controles (visível fora do menu) */}
      {phase !== 'menu' && (
        <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-bold text-xl">🏃‍♀️ Condução de Bola</p>
            <p className="text-xs text-muted-foreground">
              {level < 4 ? 'Mude de faixa para desviar!' : level < 7 ? 'Mais defensoras!' : '🔥 Duas faixas bloqueadas!'}
            </p>
          </div>
          <LevelBadge level={level} />
        </div>

      {/* Placar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
          <span className="text-base">⚽</span>
          <span className="font-heading font-bold text-xl text-primary">{score}</span>
          <span className="text-xs text-muted-foreground">desviadas</span>
        </div>
        {phase === 'running' && (
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
            className="flex items-center gap-1 text-xs font-bold text-green-500">
            <div className="w-2 h-2 rounded-full bg-green-500"/> EM JOGO
          </motion.div>
        )}
      </div>

      {/* Campo */}
      <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl select-none"
        style={{ width: '100%', maxWidth: W, height: H, touchAction: 'none' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a5f"/>
              <stop offset="100%" stopColor="#1e40af"/>
            </linearGradient>
            <filter id="glow2">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <rect width={W} height={H} fill="url(#field)"/>
          {/* Listras campo */}
          {[0,1,2,3,4,5,6,7].map(i => (
            <rect key={i} x={i*(W/7)} y={0} width={W/7} height={H}
              fill={i%2===0 ? 'rgba(255,255,255,0.04)' : 'transparent'}/>
          ))}
          {/* Linhas de faixa */}
          <line x1={W/3} y1={20} x2={W/3} y2={H-20} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="12 8"/>
          <line x1={W*2/3} y1={20} x2={W*2/3} y2={H-20} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="12 8"/>
          {/* Borda */}
          <rect x="2" y="2" width={W-4} height={H-4} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" rx="12"/>
          {/* Header */}
          <rect x={W*0.1} y={6} width={W*0.8} height={22} fill="rgba(255,255,255,0.12)" rx="6"/>
          <text x={W/2} y={21} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">⚽ DESVIE DAS DEFENSORAS!</text>

          {/* Linhas de marcação na pista */}
          {[60,120,180,240,300].map(y => (
            <line key={y} x1={16} y1={y} x2={W-16} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          ))}

          {/* Obstáculos */}
          {obstacles.map(o => (
            <g key={o.id}>
              <circle cx={LANES[o.lane]} cy={o.y} r={OBS_R+2}
                fill={`${OBS_COLORS[o.colorIdx % OBS_COLORS.length]}30`}
                stroke={OBS_COLORS[o.colorIdx % OBS_COLORS.length]}
                strokeWidth="1.5"/>
              <text x={LANES[o.lane]} y={o.y+7} textAnchor="middle" fontSize="18">
                {OBS_EMOJIS[o.colorIdx % OBS_EMOJIS.length]}
              </text>
            </g>
          ))}

          {/* Rastro do jogador */}
          {[8,5,3].map((r, i) => (
            <circle key={i} cx={LANES[lane]} cy={PLAYER_Y + (i+1)*12}
              r={r} fill={`rgba(250,204,21,${0.15 - i*0.04})`}/>
          ))}

          {/* Jogadora (bola) */}
          <circle cx={LANES[lane]} cy={PLAYER_Y} r={PLAYER_R+3}
            fill="rgba(250,204,21,0.2)" stroke="#fbbf24" strokeWidth="1.5"/>
          <text x={LANES[lane]} y={PLAYER_Y+8} textAnchor="middle" fontSize="24">⚽</text>
        </svg>

        {/* Crash overlay */}
        <AnimatePresence>
          {phase === 'crashed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-red-900/85 flex flex-col items-center justify-center rounded-3xl gap-3">
              <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }}
                transition={{ type: 'spring', stiffness: 300 }} className="text-6xl">💥</motion.span>
              <p className="font-heading font-bold text-white text-2xl">Marcada!</p>
              <div className="bg-white/20 rounded-2xl px-6 py-2">
                <p className="text-white font-bold text-center">
                  <span className="text-3xl font-heading">{lastScore}</span>
                  <span className="text-sm block opacity-80">defensoras desviadas</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botões de movimento */}
      {phase === 'running' && (
        <div className="flex gap-4 justify-center">
          {[
            { dir: -1, icon: ChevronLeft, label: 'Esquerda', color: 'from-blue-500 to-blue-600' },
            { dir: 1,  icon: ChevronRight, label: 'Direita',  color: 'from-orange-500 to-orange-600' },
          ].map(({ dir, icon: Icon, label, color }) => (
            <motion.button key={dir}
              whileTap={{ scale: 0.85 }}
              onClick={() => moveLane(dir)}
              className={`flex-1 h-20 bg-gradient-to-b ${color} rounded-3xl font-bold text-white shadow-xl flex items-center justify-center gap-2 text-xl select-none`}>
              <Icon className="w-8 h-8" strokeWidth={3}/>
              <span className="text-sm font-heading">{label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* CTA inicial */}
      {phase === 'idle' && (
        <motion.button whileTap={{ scale: 0.95 }} onClick={startGame}
          className="w-full py-4 rounded-2xl font-heading font-bold text-xl text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>
          ▶ Começar!
        </motion.button>
      )}

      {/* Tela de resultado */}
      {phase === 'crashed' && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="space-y-3 text-center">
          <p className="font-heading font-bold text-xl">
            {lastScore >= 12 ? '🌟 Fantástico!' : lastScore >= 6 ? '👍 Bom treino!' : '💪 Tente de novo!'}
          </p>
          {lastScore >= 8 && (
            <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }}
              className="text-sm text-primary font-bold bg-primary/10 rounded-xl py-1">
              🎉 Subindo de nível!
            </motion.p>
          )}
          {goldenReward && (
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 border-2 border-yellow-400 rounded-2xl p-3">
              <p className="text-2xl">⭐</p>
              <p className="font-heading font-bold text-yellow-700 dark:text-yellow-400 text-sm">Figurinha Dourada!</p>
              <p className="font-mono font-bold text-yellow-600">{goldenReward.code}</p>
            </motion.div>
          )}
          <button onClick={handleRestart}
            className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-heading font-bold shadow-lg">
            <RotateCcw className="w-4 h-4"/> Tentar Novamente
          </button>
        </motion.div>
      )}
        </div>
      )}
    </div>
  );
}