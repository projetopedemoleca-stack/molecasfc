import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';

// ── Configuração da grade: 5x5 quadrados visíveis + área do gol ──────────────
const COLS = 5;
const ROWS = 5;

const LEVELS = [
  { label: 'Nivel 1', speed: 900,  hCount: 1, vCount: 1, desc: '1 obstaculo horizontal e 1 vertical' },
  { label: 'Nivel 2', speed: 720,  hCount: 1, vCount: 2, desc: 'Mais obstaculos verticais!' },
  { label: 'Nivel 3', speed: 600,  hCount: 2, vCount: 2, desc: 'Dois horizontais e dois verticais' },
  { label: 'Nivel 4', speed: 480,  hCount: 2, vCount: 3, desc: 'Velocidade aumentada!' },
  { label: 'Nivel 5', speed: 380,  hCount: 3, vCount: 3, desc: 'Caos total na quadra!' },
];

const INIT_BALL = { col: 2, row: ROWS - 1 };

function genHObstacles(count, existing) {
  const arr = [];
  const usedRows = new Set(existing.map(o => o.row));
  const available = [];
  for (let r = 1; r < ROWS - 1; r++) {
    if (!usedRows.has(r)) available.push(r);
  }
  for (let i = 0; i < count && available.length; i++) {
    const idx = Math.floor(Math.random() * available.length);
    const row = available.splice(idx, 1)[0];
    arr.push({ id: `h${row}`, type: 'h', row, col: Math.random() < 0.5 ? 0 : COLS - 1, dir: Math.random() < 0.5 ? 1 : -1 });
  }
  return arr;
}

function genVObstacles(count, existing) {
  const arr = [];
  const usedCols = new Set(existing.map(o => o.col));
  const available = [];
  for (let c = 0; c < COLS; c++) {
    if (!usedCols.has(c)) available.push(c);
  }
  for (let i = 0; i < count && available.length; i++) {
    const idx = Math.floor(Math.random() * available.length);
    const col = available.splice(idx, 1)[0];
    arr.push({ id: `v${col}`, type: 'v', col, row: Math.random() < 0.5 ? 1 : ROWS - 2, dir: Math.random() < 0.5 ? 1 : -1 });
  }
  return arr;
}

function buildObstacles(level) {
  const cfg = LEVELS[level];
  const h = genHObstacles(cfg.hCount, []);
  const v = genVObstacles(cfg.vCount, h);
  return [...h, ...v];
}

function moveObstacles(obs) {
  return obs.map(o => {
    if (o.type === 'h') {
      let nc = o.col + o.dir;
      let nd = o.dir;
      if (nc < 0)       { nc = 0;        nd = 1;  }
      if (nc >= COLS)   { nc = COLS - 1; nd = -1; }
      return { ...o, col: nc, dir: nd };
    } else {
      let nr = o.row + o.dir;
      let nd = o.dir;
      if (nr < 1)         { nr = 1;        nd = 1;  }
      if (nr >= ROWS - 1) { nr = ROWS - 2; nd = -1; }
      return { ...o, row: nr, dir: nd };
    }
  });
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ConductGame({ onStickerEarned }) {
  const [phase, setPhase]         = useState('menu');
  const [level, setLevel]         = useState(0);
  const [ball, setBall]           = useState(INIT_BALL);
  const [obs, setObs]             = useState([]);
  const [score, setScore]         = useState(0);
  const [lives, setLives]         = useState(3);
  const [trail, setTrail]         = useState([]);
  const [flash, setFlash]         = useState(null);
  const [goalsLevel, setGoalsLevel] = useState(0);

  const timerRef = useRef(null);

  const startLevel = useCallback((lvl) => {
    setLevel(lvl);
    setBall(INIT_BALL);
    setTrail([]);
    setObs(buildObstacles(lvl));
    setGoalsLevel(0);
    setPhase('playing');
  }, []);

  // Loop de obstaculos
  useEffect(() => {
    if (phase !== 'playing') { clearInterval(timerRef.current); return; }
    const cfg = LEVELS[level];
    timerRef.current = setInterval(() => {
      setObs(prev => moveObstacles(prev));
    }, cfg.speed);
    return () => clearInterval(timerRef.current);
  }, [phase, level]);

  // Detectar colisao e gol
  useEffect(() => {
    if (phase !== 'playing') return;

    const hit = obs.some(o => o.col === ball.col && o.row === ball.row);
    if (hit) {
      clearInterval(timerRef.current);
      setFlash('hit');
      setTimeout(() => setFlash(null), 600);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setPhase('complete');
      } else {
        setBall(INIT_BALL);
        setTrail([]);
      }
      return;
    }

    if (ball.row === 0) {
      clearInterval(timerRef.current);
      setFlash('goal');
      const newScore = score + (level + 1) * 10;
      setScore(newScore);
      const newGoalsLevel = goalsLevel + 1;
      setGoalsLevel(newGoalsLevel);
      setPhase('goal');
      setTimeout(() => {
        setFlash(null);
        if (newGoalsLevel >= 3) {
          const nextLevel = level + 1;
          if (nextLevel >= LEVELS.length) {
            setPhase('complete');
          } else {
            startLevel(nextLevel);
          }
        } else {
          setBall(INIT_BALL);
          setTrail([]);
          setPhase('playing');
        }
      }, 900);
    }
  }, [ball, obs]);

  // Teclado
  useEffect(() => {
    if (phase !== 'playing') return;
    const handle = (e) => {
      const dirs = {
        ArrowUp: [0, -1], ArrowDown: [0, 1],
        ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
      };
      const d = dirs[e.key];
      if (!d) return;
      e.preventDefault();
      setBall(prev => {
        const nc = Math.max(0, Math.min(COLS - 1, prev.col + d[0]));
        const nr = Math.max(0, Math.min(ROWS - 1, prev.row + d[1]));
        setTrail(t => [...t.slice(-6), { col: prev.col, row: prev.row }]);
        return { col: nc, row: nr };
      });
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [phase]);

  // Swipe / touch
  const touchStart = useRef(null);
  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStart.current || phase !== 'playing') return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    const d = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? [1, 0] : [-1, 0])
      : (dy > 0 ? [0, 1] : [0, -1]);
    setBall(prev => {
      const nc = Math.max(0, Math.min(COLS - 1, prev.col + d[0]));
      const nr = Math.max(0, Math.min(ROWS - 1, prev.row + d[1]));
      setTrail(t => [...t.slice(-6), { col: prev.col, row: prev.row }]);
      return { col: nc, row: nr };
    });
    touchStart.current = null;
  };

  const moveDir = (dx, dy) => {
    if (phase !== 'playing') return;
    setBall(prev => {
      const nc = Math.max(0, Math.min(COLS - 1, prev.col + dx));
      const nr = Math.max(0, Math.min(ROWS - 1, prev.row + dy));
      setTrail(t => [...t.slice(-6), { col: prev.col, row: prev.row }]);
      return { col: nc, row: nr };
    });
  };

  const CELL = 58;
  const levelCfg = LEVELS[level] || LEVELS[0];
  const isObstacle = (c, r) => obs.some(o => o.col === c && o.row === r);

  // ── MENU ─────────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
      <div className="relative">
        <div style={{
          width: 180, height: 180, borderRadius: 16,
          background: 'linear-gradient(135deg,#14532d,#166534,#15803d)',
          boxShadow: '0 8px 32px rgba(21,128,61,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
            {[36, 72, 108, 144].map(x => <line key={`x${x}`} x1={x} y1="0" x2={x} y2="180" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>)}
            {[36, 72, 108, 144].map(y => <line key={`y${y}`} x1="0" y1={y} x2="180" y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>)}
            <rect x="54" y="4" width="72" height="28" rx="4" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="90" cy="90" r="28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <circle cx="90" cy="138" r="10" fill="white"/>
          </svg>
        </div>
        <motion.div animate={{ x: [0, 80, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 60, left: 10, width: 20, height: 20, borderRadius: 4, background: '#ef4444', opacity: 0.85 }} />
        <motion.div animate={{ y: [0, 80, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 10, left: 120, width: 20, height: 20, borderRadius: 4, background: '#f97316', opacity: 0.85 }} />
      </div>

      <div className="text-center">
        <h1 className="font-heading font-black text-3xl text-primary mb-1">Leva pro Gol!</h1>
        <p className="text-gray-500 text-sm">Conduza a bola desviando dos obstaculos</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-md w-full max-w-xs">
        <h3 className="font-bold text-gray-700 mb-3 text-sm">Como jogar</h3>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex gap-2 items-start"><span className="text-base">D-pad</span><span>Use as setas ou D-pad para mover a bola</span></div>
          <div className="flex gap-2 items-start"><span>⚽</span><span>Chegue ao gol (area verde) 3 vezes por nivel</span></div>
          <div className="flex gap-2 items-start"><span>🟥</span><span>Evite os obstaculos — voce tem 3 vidas</span></div>
          <div className="flex gap-2 items-start"><span>⚡</span><span>A cada nivel mais rapido e mais obstaculos!</span></div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
        onClick={() => startLevel(0)}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-black text-xl rounded-2xl shadow-lg"
      >
        Jogar Agora
      </motion.button>
    </div>
  );

  // ── COMPLETE ─────────────────────────────────────────────────────────────────
  if (phase === 'complete') return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4 text-center"
    >
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
      </motion.div>
      <div>
        <h1 className="font-heading font-black text-3xl text-primary mb-1">
          {lives <= 0 ? 'Fim de Jogo!' : 'CAMPEA!'}
        </h1>
        <p className="text-gray-500">{lives <= 0 ? 'Suas vidas acabaram...' : 'Voce completou todos os niveis!'}</p>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-green-100 rounded-2xl p-6 w-full max-w-xs">
        <div className="text-5xl font-black text-primary">{score}</div>
        <div className="text-gray-500 text-sm mt-1">pontos conquistados</div>
        <div className="flex justify-around mt-4 text-sm">
          <div><div className="font-bold text-primary">{level + 1}</div><div className="text-gray-400">Nivel</div></div>
          <div><div className="font-bold text-red-500">{lives}</div><div className="text-gray-400">Vidas</div></div>
        </div>
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { setScore(0); setLives(3); startLevel(0); }}
          className="flex-1 py-3 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-bold rounded-xl shadow-md"
        >
          Jogar de Novo
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { setScore(0); setLives(3); setPhase('menu'); }}
          className="py-3 px-4 bg-gray-100 text-gray-600 font-heading font-bold rounded-xl"
        >
          Menu
        </motion.button>
      </div>
    </motion.div>
  );

  // ── PLAYING / GOAL ────────────────────────────────────────────────────────────
  const gridW = COLS * CELL;
  const gridH = ROWS * CELL;

  return (
    <div
      className="flex flex-col items-center gap-4 pt-2 pb-6 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-xs px-1">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className={`text-xl transition-all ${i < lives ? 'opacity-100' : 'opacity-20'}`}>
              {i < lives ? '\u2764\uFE0F' : '\uD83D\uDDA4'}
            </span>
          ))}
        </div>
        <div className="text-center">
          <div className="font-heading font-black text-primary text-lg leading-none">{levelCfg.label}</div>
          <div className="flex gap-1 justify-center mt-0.5">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < goalsLevel ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="font-heading font-black text-xl text-primary">{score}</div>
          <div className="text-xs text-gray-400">pts</div>
        </div>
      </div>

      {/* Campo */}
      <div style={{ position: 'relative', width: gridW, height: gridH }}>
        <AnimatePresence>
          {flash === 'hit' && (
            <motion.div key="hit" initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', inset: 0, background: '#ef4444', borderRadius: 12, zIndex: 50, pointerEvents: 'none' }}
            />
          )}
          {flash === 'goal' && (
            <motion.div key="goal" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{ position: 'absolute', inset: 0, background: '#22c55e', borderRadius: 12, zIndex: 50, pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>

        {/* Grade */}
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const isGoalArea = r === 0;
            const isTrailCell = trail.some(t => t.col === c && t.row === r);
            const isBall = ball.col === c && ball.row === r;
            return (
              <div key={`${c}-${r}`} style={{
                position: 'absolute',
                left: c * CELL, top: r * CELL,
                width: CELL, height: CELL,
                boxSizing: 'border-box',
                border: '1px solid rgba(21,128,61,0.15)',
                background: isGoalArea
                  ? 'linear-gradient(180deg,#064e3b,#065f46)'
                  : (c + r) % 2 === 0 ? '#f0fdf4' : '#dcfce7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isGoalArea && c === Math.floor(COLS / 2) && (
                  <span style={{ fontSize: 22, opacity: 0.9 }}>
                    {'\uD83E\uDD45'}
                  </span>
                )}
                {isTrailCell && !isBall && (
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(21,128,61,0.4)' }} />
                )}
              </div>
            );
          })
        )}

        {/* Obstaculos */}
        {obs.map(o => (
          <motion.div key={o.id} layout transition={{ duration: 0.12, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: o.col * CELL + 4, top: o.row * CELL + 4,
              width: CELL - 8, height: CELL - 8,
              borderRadius: o.type === 'h' ? '8px' : '6px',
              background: o.type === 'h'
                ? 'linear-gradient(135deg,#dc2626,#ef4444)'
                : 'linear-gradient(135deg,#ea580c,#f97316)',
              boxShadow: `0 2px 12px ${o.type === 'h' ? 'rgba(220,38,38,0.5)' : 'rgba(234,88,12,0.5)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, zIndex: 10,
            }}
          >
            {o.type === 'h' ? '\uD83E\uDDBA' : '\uD83D\uDD35'}
          </motion.div>
        ))}

        {/* Bola */}
        <motion.div
          key={`ball-${ball.col}-${ball.row}`}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            position: 'absolute',
            left: ball.col * CELL + 6, top: ball.row * CELL + 6,
            width: CELL - 12, height: CELL - 12,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, white 0%, #e5e7eb 60%, #9ca3af 100%)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, zIndex: 20,
          }}
        >
          {'\u26BD'}
        </motion.div>

        {/* Mensagem de gol */}
        <AnimatePresence>
          {flash === 'goal' && (
            <motion.div key="goalMsg"
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1.2, opacity: 1, y: -10 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 60, pointerEvents: 'none',
              }}
            >
              <div style={{
                background: 'white', borderRadius: 16,
                padding: '12px 28px', fontWeight: 900, fontSize: 28,
                fontFamily: 'system-ui', color: '#15803d',
                boxShadow: '0 8px 32px rgba(21,128,61,0.4)',
              }}>
                GOOOOL!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center text-xs text-gray-400 px-4">{levelCfg.desc}</div>

      {/* D-pad */}
      <div className="flex flex-col items-center gap-1 mt-1">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => moveDir(0, -1)}
          className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl"
        >
          {'\u2B06\uFE0F'}
        </motion.button>
        <div className="flex gap-1">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => moveDir(-1, 0)}
            className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl"
          >
            {'\u2B05\uFE0F'}
          </motion.button>
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center opacity-40">
            <div className="w-4 h-4 bg-gray-300 rounded-full" />
          </div>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => moveDir(1, 0)}
            className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl"
          >
            {'\u27A1\uFE0F'}
          </motion.button>
        </div>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => moveDir(0, 1)}
          className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl"
        >
          {'\u2B07\uFE0F'}
        </motion.button>
      </div>

      <motion.button whileTap={{ scale: 0.9 }}
        onClick={() => { setScore(0); setLives(3); startLevel(0); }}
        className="flex items-center gap-2 text-gray-400 text-sm"
      >
        <RotateCcw className="w-4 h-4" /> Recomecar
      </motion.button>
    </div>
  );
}
