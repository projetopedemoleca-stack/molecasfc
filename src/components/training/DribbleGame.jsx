import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { bgMusic } from '@/lib/trainingMusic';
import { audio } from '@/lib/audioEngine';

// ─── Configuração de bolas ───────────────────────────────────────────────────
const BALLS = [
  { id: 'boneca', name: 'Cabeça de Boneca', emoji: '👧', desc: 'Leve e imprevisível' },
  { id: 'lata', name: 'Lata', emoji: '🥫', desc: 'Pesada e reta' },
  { id: 'pedra', name: 'Pedra', emoji: '🪨', desc: 'Muito pesada' },
  { id: 'papel', name: 'Papel Amassado', emoji: '📄', desc: 'Leve e flutuante' },
  { id: 'garrafinha', name: 'Garrafinha', emoji: '🍼', desc: 'Equilibrada' },
  { id: 'limao', name: 'Limão', emoji: '🍋', desc: 'Irregular' },
  { id: 'tampinha', name: 'Tampinha', emoji: '🪙', desc: 'Muito leve' },
];

// ─── Configuração de obstáculos ──────────────────────────────────────────────
const OBSTACLES = [
  { id: 'cachorro', name: 'Cachorrinho Correndo', emoji: '🐕', desc: 'Corre de um lado pro outro' },
  { id: 'carro', name: 'Carro Estacionado', emoji: '🚗', desc: 'Bloqueia o caminho' },
];

// ─── Configuração de níveis ───────────────────────────────────────────────────
const LEVELS = [
  { label: 'Nível 1', emoji: '🌱', speed: 1, obstacles: 1, desc: 'Obstáculo lento' },
  { label: 'Nível 2', emoji: '⚡', speed: 1.5, obstacles: 2, desc: 'Obstáculo mais rápido' },
  { label: 'Nível 3', emoji: '🎲', speed: 2, obstacles: 2, desc: 'Muito rápido!' },
  { label: 'Nível 4', emoji: '🌀', speed: 2.5, obstacles: 3, desc: 'Múltiplos obstáculos' },
  { label: 'Nível 5', emoji: '👻', speed: 3, obstacles: 3, desc: 'Velocidade máxima!' },
];

const SIZE = 8;
const MAX_ATTEMPTS = 3;

// ─── Campo SVG ────────────────────────────────────────────────────────────────
const CELL = 45;
const W = SIZE * CELL;
const H = SIZE * CELL + 60; // +60 = área dos gols

function StreetField({ px, py, ball, obstacles, done, won, goalSide }) {
  const isLeftGoal = goalSide === 'left';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxHeight: 400 }}>
      <defs>
        <linearGradient id="street" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748b"/>
          <stop offset="100%" stopColor="#475569"/>
        </linearGradient>
        <pattern id="asphalt" width={CELL/2} height={CELL/2} patternUnits="userSpaceOnUse">
          <rect width={CELL/2} height={CELL/2} fill="rgba(0,0,0,0.1)"/>
          <rect x={CELL/4} width={CELL/4} height={CELL/4} fill="rgba(0,0,0,0.05)"/>
        </pattern>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Asfalto */}  
      <rect width={W} height={H} fill="url(#street)"/>
      <rect width={W} height={H} fill="url(#asphalt)"/>

      {/* Gols pequenos */}
      <rect x={0} y={0} width={CELL*2} height={CELL*1.5} fill="rgba(255,255,255,0.9)" stroke="#000" strokeWidth={2}/>
      <text x={CELL} y={CELL*0.8} textAnchor="middle" fontSize={12} fill="#000" fontWeight="bold">🏁</text>
      <text x={CELL} y={CELL*1.2} textAnchor="middle" fontSize={8} fill="#000">GOL</text>

      <rect x={W-CELL*2} y={H-CELL*1.5} width={CELL*2} height={CELL*1.5} fill="rgba(255,255,255,0.9)" stroke="#000" strokeWidth={2}/>
      <text x={W-CELL} y={H-CELL*0.2} textAnchor="middle" fontSize={12} fill="#000" fontWeight="bold">🏁</text>
      <text x={W-CELL} y={H-CELL*0.6} textAnchor="middle" fontSize={8} fill="#000">GOL</text>

      {/* Grade */}
      {Array.from({length: SIZE + 1}, (_, i) => (
        <React.Fragment key={i}>
          <line x1={i*CELL} y1={0} x2={i*CELL} y2={H} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5}/>
          <line x1={0} y1={i*CELL} x2={W} y2={i*CELL} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5}/>
        </React.Fragment>
      ))}

      {/* Obstáculos */}
      {obstacles.map((obs, i) => {
        if (obs.type === 'carro') {
          return (
            <g key={i}>
              <rect x={obs.x*CELL + 5} y={obs.y*CELL + 5} width={CELL-10} height={CELL-10} 
                fill="#374151" stroke="#1f2937" strokeWidth={1} rx={3}/>
              <text x={obs.x*CELL + CELL/2} y={obs.y*CELL + CELL/2 + 5} 
                textAnchor="middle" fontSize={16}>🚗</text>
            </g>
          );
        } else if (obs.type === 'cachorro') {
          return (
            <motion.g key={i}
              animate={{ x: [obs.x*CELL + CELL/2 - 10, obs.x*CELL + CELL/2 + 10, obs.x*CELL + CELL/2 - 10] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
              <circle cx={obs.x*CELL + CELL/2} cy={obs.y*CELL + CELL/2} r={CELL*0.3} 
                fill="#fbbf24" stroke="#f59e0b" strokeWidth={2}/>
              <text x={obs.x*CELL + CELL/2} y={obs.y*CELL + CELL/2 + 5} 
                textAnchor="middle" fontSize={16}>🐕</text>
            </motion.g>
          );
        }
        return null;
      })}

      {/* Jogadora */}
      <motion.g filter="url(#glow)"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}>
        <circle cx={px*CELL + CELL/2} cy={py*CELL + CELL/2} r={CELL*0.35}
          fill={done && won ? '#86efac' : done ? '#fca5a5' : '#fde68a'}
          stroke={done && won ? '#22c55e' : done ? '#ef4444' : '#f59e0b'}
          strokeWidth={2}/>
        <text x={px*CELL + CELL/2} y={py*CELL + CELL/2 + 6}
          textAnchor="middle" fontSize={18}>{ball.emoji}</text>
      </motion.g>

      {/* Meta atingida */}
      {done && won && (
        <motion.text
          x={isLeftGoal ? CELL : W - CELL}
          y={isLeftGoal ? CELL * 0.8 : H - CELL * 0.2}
          textAnchor="middle"
          fontSize={24}
          fill="#22c55e"
          fontWeight="bold"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ duration: 0.5 }}>
          ⚽
        </motion.text>
      )}
    </svg>
  );
}

// ─── Principal ────────────────────────────────────────────────────────────────
export default function DribbleGame() {
  useEffect(() => { bgMusic.play('street'); return () => bgMusic.stop(); }, []);

  const [phase, setPhase] = useState('menu'); // menu | ball-select | obstacle-select | playing | result
  const [selectedBall, setSelectedBall] = useState(BALLS[0]);
  const [selectedObstacle, setSelectedObstacle] = useState(OBSTACLES[0]);
  const [levelIdx, setLevelIdx] = useState(0);
  const [px, setPx] = useState(SIZE - 2);
  const [py, setPy] = useState(SIZE - 1);
  const [obstacles, setObstacles] = useState([]);
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [goalSide, setGoalSide] = useState('left'); // 'left' or 'right'
  const [unlocked, setUnlocked] = useState(0);

  const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

  // ─── Gerar obstáculos ───────────────────────────────────────────────────────
  const generateObstacles = useCallback(() => {
    const obs = [];
    const blocked = new Set();

    // Bloquear áreas dos gols
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        blocked.add(`${x},${y}`);
        blocked.add(`${SIZE-2+x},${SIZE-2+y}`);
      }
    }

    // Jogadora inicial
    blocked.add(`${SIZE-2},${SIZE-1}`);

    for (let i = 0; i < cfg.obstacles; i++) {
      let tries = 0;
      let placed = false;

      while (!placed && tries < 50) {
        tries++;
        const x = Math.floor(Math.random() * SIZE);
        const y = Math.floor(Math.random() * SIZE);
        const key = `${x},${y}`;

        if (!blocked.has(key)) {
          obs.push({
            x, y,
            type: selectedObstacle.id,
            id: i
          });
          blocked.add(key);
          placed = true;
        }
      }
    }

    return obs;
  }, [cfg.obstacles, selectedObstacle.id]);

  // ─── Iniciar rodada ─────────────────────────────────────────────────────────
  const startRound = useCallback((att = 0, sc = 0) => {
    const newObstacles = generateObstacles();
    const newGoalSide = Math.random() < 0.5 ? 'left' : 'right';

    setPx(SIZE - 2);
    setPy(SIZE - 1);
    setObstacles(newObstacles);
    setGoalSide(newGoalSide);
    setDone(false);
    setWon(false);
    setAttempts(att);
    setScore(sc);
    setPhase('playing');
  }, [generateObstacles]);

  // ─── Mover jogadora ─────────────────────────────────────────────────────────
  const move = useCallback((dx, dy) => {
    if (done || phase !== 'playing') return;

    const nx = Math.max(0, Math.min(SIZE - 1, px + dx));
    const ny = Math.max(0, Math.min(SIZE - 1, py + dy));

    // Verificar obstáculos
    const hitObstacle = obstacles.some(obs => obs.x === nx && obs.y === ny);
    if (hitObstacle) {
      try { audio.playLose?.(); } catch {}
      setDone(true);
      setWon(false);
      const newAtt = attempts + 1;
      setAttempts(newAtt);
      if (newAtt >= MAX_ATTEMPTS) {
        setTimeout(() => setPhase('result'), 800);
      } else {
        setTimeout(() => startRound(newAtt, score), 800);
      }
      return;
    }

    setPx(nx);
    setPy(ny);
    try { audio.playDribble?.(); } catch {}

    // Verificar gol
    const reachedGoal = (goalSide === 'left' && nx < 2 && ny < 2) || 
                       (goalSide === 'right' && nx >= SIZE - 2 && ny >= SIZE - 2);

    if (reachedGoal) {
      const newScore = score + 1;
      setScore(newScore);
      setWon(true);
      setDone(true);
      try { audio.playGoal?.(); } catch {}

      const newAtt = attempts + 1;
      setAttempts(newAtt);
      if (newAtt >= MAX_ATTEMPTS) {
        setTimeout(() => {
          if (newScore >= 2) setUnlocked(u => Math.max(u, levelIdx + 1));
          setPhase('result');
        }, 900);
      } else {
        setTimeout(() => startRound(newAtt, newScore), 900);
      }
    }
  }, [px, py, obstacles, done, phase, goalSide, attempts, score, levelIdx, startRound]);

  // ─── Teclado ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowUp')    { e.preventDefault(); move(0, -1); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); move(0,  1); }
      if (e.key === 'ArrowLeft')  move(-1, 0);
      if (e.key === 'ArrowRight') move( 1, 0);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [move]);

  // ─── Swipe ──────────────────────────────────────────────────────────────────
  const touch = useRef(null);
  const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dy) > Math.abs(dx)) { move(0, dy < 0 ? -1 : 1); return; }
    if (Math.abs(dx) > 8) move(dx < 0 ? -1 : 1, 0);
  };

  // ─── MENU INICIAL ───────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="space-y-5">
      <div className="text-center">
        <motion.div className="text-5xl mb-2"
          animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>
          ⚽
        </motion.div>
        <h2 className="font-heading font-black text-2xl">Fut de Rua 1x1</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha sua bola e chegue no gol do outro lado da rua!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon:'⚽', text:'Chegue no gol\ndo outro lado' },
          { icon:'🚗', text:'Evite carros\ne cachorros' },
          { icon:'🏃', text:'Fuja e desviei\npela rua!' },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border/30 rounded-2xl p-3 space-y-1">
            <div className="text-2xl">{item.icon}</div>
            <p className="text-xs text-muted-foreground leading-tight whitespace-pre-line">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Seleção de nível */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase">Nível</p>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((lvl, i) => {
            const ok = i <= unlocked;
            return (
              <button key={i} disabled={!ok} onClick={() => setLevelIdx(i)}
                className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all ${
                  levelIdx === i
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : ok
                    ? 'bg-card border-border/30 hover:border-primary/50'
                    : 'opacity-25 cursor-not-allowed border-border/20'
                }`}>
                {ok ? lvl.emoji : '🔒'} {lvl.label}
              </button>
            );
          })}
        </div>
        <div className="bg-muted/30 rounded-xl p-3 text-center">
          <p className="font-bold text-sm">{cfg.emoji} {cfg.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{cfg.desc}</p>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }}
        onClick={() => setPhase('ball-select')}
        className="w-full py-5 rounded-3xl font-heading font-black text-xl text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
        ▶ Escolher Bola!
      </motion.button>
    </div>
  );

  // ─── SELEÇÃO DE BOLA ────────────────────────────────────────────────────────
  if (phase === 'ball-select') return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="font-heading font-black text-2xl">Escolha sua Bola</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Cada bola tem características diferentes!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {BALLS.map((ball) => (
          <motion.button
            key={ball.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedBall(ball); setPhase('obstacle-select'); }}
            className={`p-4 rounded-2xl border-2 transition-all text-center ${
              selectedBall.id === ball.id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border/30 bg-card hover:border-primary/50'
            }`}
          >
            <div className="text-3xl mb-2">{ball.emoji}</div>
            <p className="font-bold text-sm">{ball.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{ball.desc}</p>
          </motion.button>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.95 }}
        onClick={() => setPhase('menu')}
        className="w-full py-3 rounded-xl font-bold bg-muted text-muted-foreground">
        ← Voltar
      </motion.button>
    </div>
  );

  // ─── SELEÇÃO DE OBSTÁCULO ───────────────────────────────────────────────────
  if (phase === 'obstacle-select') return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="font-heading font-black text-2xl">Ambiente da Rua</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha o que vai te atrapalhar!
        </p>
      </div>

      <div className="space-y-3">
        {OBSTACLES.map((obs) => (
          <motion.button
            key={obs.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedObstacle(obs); startRound(0, 0); }}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
              selectedObstacle.id === obs.id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border/30 bg-card hover:border-primary/50'
            }`}
          >
            <div className="text-3xl">{obs.emoji}</div>
            <div>
              <p className="font-bold">{obs.name}</p>
              <p className="text-xs text-muted-foreground">{obs.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.95 }}
        onClick={() => setPhase('ball-select')}
        className="w-full py-3 rounded-xl font-bold bg-muted text-muted-foreground">
        ← Voltar
      </motion.button>
    </div>
  );

  // ─── RESULTADO ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const passed = score >= 2;
    return (
      <div className="space-y-5 text-center">
        <motion.div className="text-7xl"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260 }}>
          {passed ? '🏆' : '💪'}
        </motion.div>
        <div>
          <h2 className="font-heading font-black text-2xl">
            {passed ? 'Gol de placa!' : 'Continue treinando!'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {score} / {MAX_ATTEMPTS} gols · {passed ? '🌟 Próximo nível desbloqueado!' : ''}
          </p>
        </div>

        {/* Mini scoreboard */}
        <div className="flex justify-center gap-2">
          {Array.from({length: MAX_ATTEMPTS}, (_, i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              i < score ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {i < score ? '⚽' : '○'}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => startRound(0, 0)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-2xl font-heading font-bold">
            <RotateCcw className="w-4 h-4"/> De novo
          </motion.button>
          {passed && levelIdx < LEVELS.length - 1 && (
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { setLevelIdx(i => i + 1); setPhase('menu'); }}
              className="bg-yellow-400 text-yellow-900 px-5 py-3 rounded-2xl font-heading font-bold">
              Próximo →
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setPhase('menu')}
            className="bg-muted text-muted-foreground px-4 py-3 rounded-2xl font-bold text-sm">
            Menu
          </motion.button>
        </div>
      </div>
    );
  }

  // ─── JOGO ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => { setPhase('menu'); }}
          className="text-sm text-muted-foreground font-semibold">← Sair</button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-bold">{cfg.emoji} {cfg.label}</span>
          <div className="flex gap-1">
            {Array.from({length: MAX_ATTEMPTS}, (_, i) => (
              <div key={i} className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                i < score ? 'bg-green-500 text-white' : i < attempts ? 'bg-red-400 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {i < score ? '⚽' : i < attempts ? '✕' : '·'}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{attempts}/{MAX_ATTEMPTS}</span>
        </div>
      </div>

      {/* Info */}
      <div className="mx-1 px-3 py-1.5 rounded-xl bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground">
          {selectedBall.emoji} {selectedBall.name} · {selectedObstacle.emoji} {selectedObstacle.name}
          {' · '}Gol: {goalSide === 'left' ? 'Esquerda' : 'Direita'}
        </p>
      </div>

      {/* Campo */}
      <div
        className="mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10"
        style={{ maxWidth: 360, touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <StreetField 
          px={px} py={py} 
          ball={selectedBall} 
          obstacles={obstacles}
          done={done} won={won} 
          goalSide={goalSide} 
        />
      </div>

      {/* Overlay resultado parcial */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mx-1 py-2 rounded-2xl text-center font-heading font-black text-lg ${
              won ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'
            }`}
          >
            {won ? '⚽ GOL! Chegou no gol!' : `💥 Bateu no ${selectedObstacle.name.toLowerCase()}!`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
      try { audio.playLose?.(); } catch {}
      return; // bloqueia movimento em cone
    }

    const newMoveCount = moveCount + 1;
    setMoveCount(newMoveCount);
    setPx(nx); setPy(ny);
    try { audio.playDribble?.(); } catch {}

    // META atingida
    if (ny === 0) {
      const newScore = score + 1;
      setScore(newScore);
      setWon(true); setDone(true);
      try { audio.playGoal?.(); } catch {}
      const newAtt = attempts + 1;
      setAttempts(newAtt);
      if (newAtt >= MAX_ATT) {
        setTimeout(() => {
          if (newScore >= 3) setUnlocked(u => Math.max(u, levelIdx + 1));
          setPhase('result');
        }, 900);
      } else {
        setTimeout(() => startRound(newAtt, newScore), 900);
      }
      return;
    }

    // Mover bot
    if (newMoveCount % cfg.botFreq === 0) {
      const nb = moveBot(nx, ny, bx, by, cfg.botRandom);
      setBx(nb.x); setBy(nb.y);

      // Bot alcançou jogadora
      if (nb.x === nx && nb.y === ny) {
        setDone(true); setWon(false);
        try { audio.playLose?.(); } catch {}
        const newAtt = attempts + 1;
        setAttempts(newAtt);
        if (newAtt >= MAX_ATT) {
          setTimeout(() => setPhase('result'), 800);
        } else {
          setTimeout(() => startRound(newAtt, score), 800);
        }
      }
    }
  }, [phase, cfg, levelIdx, startRound]);

  // ─── Teclado ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowUp')    { e.preventDefault(); move(0, -1); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); move(0,  1); }
      if (e.key === 'ArrowLeft')  move(-1, 0);
      if (e.key === 'ArrowRight') move( 1, 0);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [move]);

  // ─── Swipe ──────────────────────────────────────────────────────────────────
  const touch = useRef(null);
  const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd   = (e) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dy) > Math.abs(dx)) { move(0, dy < 0 ? -1 : 1); return; }
    if (Math.abs(dx) > 8) move(dx < 0 ? -1 : 1, 0);
  };

  // ─── MENU ───────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="space-y-5">
      <div className="text-center">
        <motion.div className="text-5xl mb-2"
          animate={{ x: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 0.85 }}>
          ⚡
        </motion.div>
        <h2 className="font-heading font-black text-2xl">Zig Zague</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Leve a bola até a meta — sem ser pego pelo tênis!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon:'⚽', text:'Mova a bola\naté a META 🏁' },
          { icon:'🔶', text:'Cones bloqueiam\no caminho' },
          { icon:'👟', text:'Fuja do tênis\nque te persegue!' },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border/30 rounded-2xl p-3 space-y-1">
            <div className="text-2xl">{item.icon}</div>
            <p className="text-xs text-muted-foreground leading-tight whitespace-pre-line">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Seleção de nível */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase">Nível</p>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((lvl, i) => {
            const ok = i <= unlocked;
            return (
              <button key={i} disabled={!ok} onClick={() => setLevelIdx(i)}
                className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all ${
                  levelIdx === i
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : ok
                    ? 'bg-card border-border/30 hover:border-primary/50'
                    : 'opacity-25 cursor-not-allowed border-border/20'
                }`}>
                {ok ? lvl.emoji : '🔒'} {lvl.label}
              </button>
            );
          })}
        </div>
        <div className="bg-muted/30 rounded-xl p-3 text-center">
          <p className="font-bold text-sm">{cfg.emoji} {cfg.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{cfg.desc}</p>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }}
        onClick={() => startRound(0, 0)}
        className="w-full py-5 rounded-3xl font-heading font-black text-xl text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
        ▶ Jogar!
      </motion.button>
    </div>
  );

  // ─── RESULTADO ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const passed = score >= 3;
    return (
      <div className="space-y-5 text-center">
        <motion.div className="text-7xl"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260 }}>
          {passed ? '🏆' : '💪'}
        </motion.div>
        <div>
          <h2 className="font-heading font-black text-2xl">
            {passed ? 'Incrível!' : 'Continue treinando!'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {score} / {MAX_ATT} metas · {passed ? '🌟 Próximo nível desbloqueado!' : ''}
          </p>
        </div>

        {/* Mini scoreboard */}
        <div className="flex justify-center gap-2">
          {Array.from({length: MAX_ATT}, (_, i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              i < score ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {i < score ? '⚽' : '○'}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => startRound(0, 0)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-2xl font-heading font-bold">
            <RotateCcw className="w-4 h-4"/> De novo
          </motion.button>
          {passed && levelIdx < LEVELS.length - 1 && (
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => { setLevelIdx(i => i + 1); setPhase('menu'); }}
              className="bg-yellow-400 text-yellow-900 px-5 py-3 rounded-2xl font-heading font-bold">
              Próximo →
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setPhase('menu')}
            className="bg-muted text-muted-foreground px-4 py-3 rounded-2xl font-bold text-sm">
            Menu
          </motion.button>
        </div>
      </div>
    );
  }

  // ─── JOGO ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => { setPhase('menu'); }}
          className="text-sm text-muted-foreground font-semibold">← Sair</button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-bold">{cfg.emoji} {cfg.label}</span>
          <div className="flex gap-1">
            {Array.from({length: MAX_ATT}, (_, i) => (
              <div key={i} className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                i < score ? 'bg-green-500 text-white' : i < attempts ? 'bg-red-400 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {i < score ? '⚽' : i < attempts ? '✕' : '·'}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{attempts}/{MAX_ATT}</span>
        </div>
      </div>

      {/* Info do bot */}
      <div className="mx-1 px-3 py-1.5 rounded-xl bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground">
          {cfg.botHidden ? '👻 Tênis invisível!' : cfg.botRandom ? '🎲 Tênis imprevisível!' : `👟 Tênis a cada ${cfg.botFreq} jogada${cfg.botFreq > 1 ? 's' : ''}`}
          {' · '}Movimento: <strong>{moveCount}</strong>
        </p>
      </div>

      {/* Campo */}
      <div
        className="mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10"
        style={{ maxWidth: 340, touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Field px={px} py={py} bx={bx} by={by} cones={cones}
          botHidden={cfg.botHidden} done={done} won={won} />
      </div>

      {/* Overlay resultado parcial */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mx-1 py-2 rounded-2xl text-center font-heading font-black text-lg ${
              won ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'
            }`}
          >
            {won ? '⚽ GOL! Meta atingida!' : cfg.botHidden ? '👻 O tênis invisível te pegou!' : '👟 O tênis te alcançou!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles */}
      {!done && (
        <div className="flex flex-col items-center gap-1.5 px-2">
          <motion.button whileTap={{ scale: 0.86, y: -3 }}
            onPointerDown={() => move(0, -1)}
            className="w-16 h-12 rounded-2xl font-black text-white text-xl shadow-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#15803d,#22c55e)' }}>
            ↑
          </motion.button>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.86 }}
              onPointerDown={() => move(-1, 0)}
              className="w-16 h-12 rounded-2xl font-black text-white text-xl shadow-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              ←
            </motion.button>
            <div className="w-16 h-12 rounded-2xl bg-muted/30 flex items-center justify-center text-2xl">⚽</div>
            <motion.button whileTap={{ scale: 0.86 }}
              onPointerDown={() => move(1, 0)}
              className="w-16 h-12 rounded-2xl font-black text-white text-xl shadow-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              →
            </motion.button>
          </div>
          <motion.button whileTap={{ scale: 0.86, y: 3 }}
            onPointerDown={() => move(0, 1)}
            className="w-16 h-12 rounded-2xl font-black text-white text-xl shadow-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            ↓
          </motion.button>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pb-1">
        Chegue à <strong>🏁 META</strong> · Desvie dos 🔶 · Setas e swipe funcionam
      </p>
    </div>
  );
}
