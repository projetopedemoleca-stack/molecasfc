import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { bgMusic } from '@/lib/trainingMusic';
import { audio } from '@/lib/audioEngine';

// ─── Configuração de níveis ───────────────────────────────────────────────────
const LEVELS = [
  { label: 'Nível 1', emoji: '🌱', botFreq: 3, botRandom: false, botHidden: false, desc: 'Tênis se move a cada 3 jogadas suas' },
  { label: 'Nível 2', emoji: '⚡', botFreq: 2, botRandom: false, botHidden: false, desc: 'Tênis se move a cada 2 jogadas suas' },
  { label: 'Nível 3', emoji: '🎲', botFreq: 3, botRandom: true,  botHidden: false, desc: 'A cada 3 jogadas, aparece aleatório!' },
  { label: 'Nível 4', emoji: '🌀', botFreq: 2, botRandom: true,  botHidden: false, desc: 'A cada 2 jogadas, aparece aleatório!' },
  { label: 'Nível 5', emoji: '👻', botFreq: 3, botRandom: false, botHidden: true,  desc: 'A cada 3 jogadas — tênis invisível!' },
  { label: 'Nível 6', emoji: '💀', botFreq: 2, botRandom: false, botHidden: true,  desc: 'A cada 2 jogadas — tênis invisível!' },
];

const SIZE    = 6;
const MAX_ATT = 5;
const CONES_N = 6;

// ─── Gerar cones aleatórios ───────────────────────────────────────────────────
function genCones(bx, by) {
  const blocked = new Set();
  // linha do gol (row 0) e linha do jogador (row SIZE-1) bloqueadas
  for (let c = 0; c < SIZE; c++) {
    blocked.add(`${c},0`);
    blocked.add(`${c},${SIZE - 1}`);
  }
  blocked.add(`${bx},${by}`);
  blocked.add(`2,${SIZE - 1}`); // spawn jogador

  const cones = [];
  let tries = 0;
  while (cones.length < CONES_N && tries < 300) {
    tries++;
    const x = Math.floor(Math.random() * SIZE);
    const y = 1 + Math.floor(Math.random() * (SIZE - 2));
    const k = `${x},${y}`;
    if (!blocked.has(k)) { cones.push({ x, y }); blocked.add(k); }
  }
  return cones;
}

// ─── Mover bot ───────────────────────────────────────────────────────────────
function moveBot(px, py, bx, by, random) {
  if (random) {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
    return {
      x: Math.max(0, Math.min(SIZE - 1, bx + dx)),
      y: Math.max(0, Math.min(SIZE - 1, by + dy)),
    };
  }
  const dx = px - bx, dy = py - by;
  if (Math.abs(dx) >= Math.abs(dy)) return { x: bx + Math.sign(dx), y: by };
  return { x: bx, y: by + Math.sign(dy) };
}

// ─── Campo SVG ────────────────────────────────────────────────────────────────
const CELL = 50;
const W = SIZE * CELL;
const H = SIZE * CELL + 48; // +48 = área do gol (topo) + base

function Field({ px, py, bx, by, cones, botHidden, done, won }) {
  const dist = Math.hypot(px - bx, py - by);
  const danger = !botHidden && dist <= 1.5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxHeight: 380 }}>
      <defs>
        <linearGradient id="fg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14532d"/>
          <stop offset="100%" stopColor="#15803d"/>
        </linearGradient>
        <pattern id="checker" width={CELL/2} height={CELL/2} patternUnits="userSpaceOnUse">
          <rect width={CELL/2} height={CELL/2} fill="rgba(255,255,255,0.18)"/>
          <rect x={CELL/4} width={CELL/4} height={CELL/4} fill="rgba(255,255,255,0.08)"/>
          <rect y={CELL/4} width={CELL/4} height={CELL/4} fill="rgba(255,255,255,0.08)"/>
        </pattern>
        <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Grama base */}
      <rect width={W} height={H} fill="url(#fg1)"/>

      {/* Listras alternadas */}
      {Array.from({length: SIZE}, (_, i) => (
        <rect key={i} x={i * CELL} y={24} width={CELL} height={SIZE * CELL}
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.07)' : 'transparent'}/>
      ))}

      {/* Área do gol (topo) */}
      <rect x={0} y={0} width={W} height={28} fill="url(#checker)"/>
      <rect x={0} y={0} width={W} height={28} fill="rgba(255,255,255,0.06)"/>
      <text x={W/2} y={19} textAnchor="middle" fontSize={11}
        fill="white" fontWeight="bold" fontFamily="sans-serif">🏁 META</text>
      <rect x={0} y={27} width={W} height={2} fill="rgba(255,255,255,0.4)"/>

      {/* Grade */}
      {Array.from({length: SIZE + 1}, (_, i) => (
        <React.Fragment key={i}>
          <line x1={i*CELL} y1={28} x2={i*CELL} y2={28+SIZE*CELL}
            stroke="rgba(255,255,255,0.1)" strokeWidth={0.5}/>
          <line x1={0} y1={28+i*CELL} x2={W} y2={28+i*CELL}
            stroke="rgba(255,255,255,0.1)" strokeWidth={0.5}/>
        </React.Fragment>
      ))}

      {/* Base */}
      <rect x={0} y={28+SIZE*CELL} width={W} height={20} fill="rgba(0,0,0,0.25)"/>
      <text x={W/2} y={28+SIZE*CELL+14} textAnchor="middle" fontSize={9}
        fill="rgba(255,255,255,0.5)" fontFamily="sans-serif">▲ INÍCIO</text>

      {/* Cones */}
      {cones.map((c, i) => (
        <text key={i} x={c.x*CELL + CELL/2} y={28+c.y*CELL + CELL/2 + 8}
          textAnchor="middle" fontSize={22}>🔶</text>
      ))}

      {/* Zona de perigo */}
      {danger && (
        <circle cx={px*CELL+CELL/2} cy={28+py*CELL+CELL/2} r={CELL*0.9}
          fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.3)" strokeWidth={1}/>
      )}

      {/* Bot (tênis) */}
      {!botHidden && (
        <motion.g filter="url(#glow)"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 0.9 }}>
          <circle cx={bx*CELL+CELL/2} cy={28+by*CELL+CELL/2} r={CELL*0.38}
            fill="#fca5a5" stroke="#ef4444" strokeWidth={2}/>
          <text x={bx*CELL+CELL/2} y={28+by*CELL+CELL/2+8}
            textAnchor="middle" fontSize={20}>👟</text>
        </motion.g>
      )}

      {/* Jogadora (bola) */}
      <motion.g filter="url(#glow)"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}>
        <circle cx={px*CELL+CELL/2} cy={28+py*CELL+CELL/2} r={CELL*0.38}
          fill={done && won ? '#86efac' : done ? '#fca5a5' : '#fde68a'}
          stroke={done && won ? '#22c55e' : done ? '#ef4444' : '#f59e0b'}
          strokeWidth={2}/>
        <text x={px*CELL+CELL/2} y={28+py*CELL+CELL/2+8}
          textAnchor="middle" fontSize={20}>⚽</text>
      </motion.g>

      {/* Colisão */}
      {!botHidden && px===bx && py===by && (
        <text x={px*CELL+CELL/2} y={28+py*CELL+CELL/2+8} textAnchor="middle" fontSize={26}>💥</text>
      )}
    </svg>
  );
}

// ─── Principal ────────────────────────────────────────────────────────────────
export default function DribbleGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);

  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase]       = useState('menu'); // menu | playing | result
  const [px, setPx]             = useState(2);
  const [py, setPy]             = useState(SIZE - 1);
  const [bx, setBx]             = useState(2);
  const [by, setBy]             = useState(1);
  const [cones, setCones]       = useState([]);
  const [done, setDone]         = useState(false);
  const [won, setWon]           = useState(false);
  const [score, setScore]       = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [unlocked, setUnlocked] = useState(0); // máximo nível desbloqueado

  // refs para closure
  const stateRef = useRef({});
  stateRef.current = { px, py, bx, by, cones, done, moveCount, score, attempts };

  const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

  // ─── Iniciar rodada ─────────────────────────────────────────────────────────
  const startRound = useCallback((att = 0, sc = 0) => {
    const botStartX = Math.floor(Math.random() * SIZE);
    const botStartY = 1;
    const newCones  = genCones(botStartX, botStartY);
    setPx(2); setPy(SIZE - 1);
    setBx(botStartX); setBy(botStartY);
    setCones(newCones);
    setDone(false); setWon(false);
    setMoveCount(0);
    setAttempts(att);
    setScore(sc);
    setPhase('playing');
  }, []);

  // ─── Mover jogadora ─────────────────────────────────────────────────────────
  const move = useCallback((dx, dy) => {
    const { px, py, bx, by, cones, done, moveCount, score, attempts } = stateRef.current;
    if (done || phase !== 'playing') return;

    const nx = Math.max(0, Math.min(SIZE - 1, px + dx));
    const ny = Math.max(0, Math.min(SIZE - 1, py + dy));

    // Verificar cone
    if (cones.some(c => c.x === nx && c.y === ny)) {
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
