import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// FUT DE RUA - VERSÃO 1: DRAG & SHOOT (Arrastar e Chutar)
// Estilo: O jogador arrasta o dedo/mouse para mirar e solta para chutar
// ═══════════════════════════════════════════════════════════════════════════

const FIELD_W = 360;
const FIELD_H = 520;
const GOAL_W = 100;
const GOAL_H = 60;
const PLAYER_R = 22;
const BALL_R = 10;

const LEVELS = [
  { label: 'Nível 1', goals: 3, time: 60, keeperSpeed: 1.5, desc: 'Goleira lenta' },
  { label: 'Nível 2', goals: 4, time: 55, keeperSpeed: 2.0, desc: 'Goleira mais rápida' },
  { label: 'Nível 3', goals: 5, time: 50, keeperSpeed: 2.5, desc: 'Reflexos rápidos!' },
  { label: 'Nível 4', goals: 5, time: 45, keeperSpeed: 3.0, desc: 'Difícil!' },
  { label: 'Nível 5', goals: 6, time: 40, keeperSpeed: 3.5, desc: 'Modo pro!' },
];

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

export default function DribbleGameV1() {
  const [phase, setPhase] = useState('menu'); // menu | playing | goal | miss | result
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [goals, setGoals] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);

  // Posições
  const [playerPos, setPlayerPos] = useState({ x: FIELD_W / 2, y: FIELD_H - 80 });
  const [ballPos, setBallPos] = useState({ x: FIELD_W / 2, y: FIELD_H - 60 });
  const [keeperPos, setKeeperPos] = useState({ x: FIELD_W / 2, y: 50 });
  const [ballVel, setBallVel] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [aimLine, setAimLine] = useState(null);

  const config = LEVELS[level] || LEVELS[0];
  const rafRef = useRef(null);

  // Iniciar nível
  const initLevel = useCallback((lvl) => {
    setLevel(lvl);
    setGoals(0);
    setTimeLeft(LEVELS[lvl].time);
    setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 80 });
    setBallPos({ x: FIELD_W / 2, y: FIELD_H - 60 });
    setKeeperPos({ x: FIELD_W / 2, y: 50 });
    setBallVel({ x: 0, y: 0 });
    setPhase('playing');
  }, []);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') { cancelAnimationFrame(rafRef.current); return; }

    const loop = () => {
      // Mover bola
      setBallPos(prev => {
        const next = { x: prev.x + ballVel.x, y: prev.y + ballVel.y };
        // Colisão com paredes
        if (next.x < BALL_R || next.x > FIELD_W - BALL_R) {
          setBallVel(v => ({ ...v, x: -v.x * 0.8 }));
        }
        if (next.y < BALL_R) {
          setBallVel(v => ({ ...v, y: -v.y * 0.8 }));
        }
        if (next.y > FIELD_H - BALL_R) {
          setBallVel({ x: 0, y: 0 });
          return { x: playerPos.x, y: FIELD_H - 60 };
        }
        return { x: clamp(next.x, BALL_R, FIELD_W - BALL_R), y: clamp(next.y, BALL_R, FIELD_H - BALL_R) };
      });

      // Atrito
      setBallVel(prev => ({ x: prev.x * 0.98, y: prev.y * 0.98 }));

      // Goleira persegue a bola
      setKeeperPos(prev => {
        const dx = ballPos.x - prev.x;
        const dy = ballPos.y - prev.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = config.keeperSpeed;
        const moveX = (dx / d) * speed;
        // Limitar movimento horizontal do goleiro
        const nextX = clamp(prev.x + moveX, GOAL_W / 2 + 20, FIELD_W - GOAL_W / 2 - 20);
        return { x: nextX, y: 50 };
      });

      // Verificar gol
      if (ballPos.y < GOAL_H + 20 && Math.abs(ballPos.x - FIELD_W / 2) < GOAL_W / 2) {
        // Verificar se goleira pegou
        if (dist(ballPos, keeperPos) < PLAYER_R + BALL_R + 10) {
          setPhase('miss');
          setTimeout(() => {
            setBallVel({ x: 0, y: 0 });
            setBallPos({ x: FIELD_W / 2, y: FIELD_H - 60 });
            setPhase('playing');
          }, 1500);
        } else {
          // GOL!
          const newGoals = goals + 1;
          const newScore = score + (level + 1) * 10;
          setGoals(newGoals);
          setScore(newScore);
          setPhase('goal');
          setTimeout(() => {
            if (newGoals >= config.goals) {
              const nextLvl = level + 1;
              if (nextLvl >= LEVELS.length) {
                setPhase('result');
              } else {
                initLevel(nextLvl);
              }
            } else {
              setBallVel({ x: 0, y: 0 });
              setBallPos({ x: FIELD_W / 2, y: FIELD_H - 60 });
              setPhase('playing');
            }
          }, 1500);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, ballVel, ballPos, keeperPos, goals, level, score, config, playerPos, initLevel]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setPhase('result'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Controles - arrastar para mirar
  const handleStart = (x, y) => {
    if (phase !== 'playing') return;
    const d = dist({ x, y }, ballPos);
    if (d < 40) {
      setIsDragging(true);
      setDragStart({ x, y });
    }
  };

  const handleMove = (x, y) => {
    if (!isDragging || !dragStart) return;
    const dx = dragStart.x - x;
    const dy = dragStart.y - y;
    setAimLine({ x: dx, y: dy });
  };

  const handleEnd = () => {
    if (!isDragging || !aimLine) { setIsDragging(false); setAimLine(null); return; }
    // Chutar!
    const power = Math.min(Math.sqrt(aimLine.x ** 2 + aimLine.y ** 2), 100);
    const angle = Math.atan2(aimLine.y, aimLine.x);
    const speed = power / 8;
    setBallVel({ x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
    setIsDragging(false);
    setAimLine(null);
  };

  // Touch handlers
  const onTouchStart = (e) => {
    const t = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    handleStart(t.clientX - rect.left, t.clientY - rect.top);
  };
  const onTouchMove = (e) => {
    const t = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(t.clientX - rect.left, t.clientY - rect.top);
  };

  // Mouse handlers
  const onMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleStart(e.clientX - rect.left, e.clientY - rect.top);
  };
  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX - rect.left, e.clientY - rect.top);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  // Menu
  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="font-heading font-black text-3xl text-primary mb-1">Fut de Rua V1</h1>
          <p className="text-gray-500 text-sm">Arraste para mirar e solte para chutar!</p>
        </motion.div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => initLevel(0)}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-green-500 text-white font-bold rounded-2xl shadow-lg"
        >Jogar</motion.button>
      </div>
    );
  }

  // Resultado
  if (phase === 'result') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-4">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
          <div className="text-5xl mb-2">{goals >= config.goals ? '🏆' : '⏰'}</div>
          <h2 className="font-heading font-black text-2xl text-primary">{goals >= config.goals ? 'Vitória!' : 'Tempo Esgotado'}</h2>
          <p className="text-gray-500">Pontuação: {score}</p>
        </motion.div>
        <div className="flex gap-2 w-full max-w-xs">
          <button onClick={() => setPhase('menu')} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Menu</button>
          <button onClick={() => initLevel(0)} className="flex-1 py-3 bg-gradient-to-r from-primary to-green-500 text-white rounded-xl font-bold">Novamente</button>
        </div>
      </div>
    );
  }

  // Jogo
  return (
    <div className="flex flex-col items-center gap-3 p-2">
      {/* HUD */}
      <div className="flex justify-between w-full max-w-sm px-2">
        <div className="flex gap-1">{[...Array(lives)].map((_, i) => <span key={i}>❤️</span>)}</div>
        <div className="text-center">
          <div className="font-bold text-primary">{config.label}</div>
          <div className="text-xs text-gray-500">{goals}/{config.goals}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg text-primary">{score}</div>
          <div className="text-xs text-gray-500">{timeLeft}s</div>
        </div>
      </div>

      {/* Campo */}
      <div
        className="relative rounded-xl overflow-hidden cursor-crosshair"
        style={{ width: FIELD_W, height: FIELD_H, background: 'linear-gradient(180deg, #5D4037 0%, #795548 50%, #5D4037 100%)' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {/* Linhas da rua */}
        <div className="absolute inset-0 opacity-20">
          {[0.25, 0.5, 0.75].map(p => (
            <div key={p} className="absolute top-0 bottom-0 bg-white" style={{ left: `${p * 100}%`, width: 2 }} />
          ))}
        </div>

        {/* Gol */}
        <div
          className="absolute top-2 left-1/2 transform -translate-x-1/2 border-2 border-white/50 bg-white/10 rounded-lg"
          style={{ width: GOAL_W, height: GOAL_H }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🥅</div>
        </div>

        {/* Goleira */}
        <div
          className="absolute transition-all duration-75"
          style={{
            left: keeperPos.x - PLAYER_R,
            top: keeperPos.y - PLAYER_R,
            width: PLAYER_R * 2,
            height: PLAYER_R * 2,
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white flex items-center justify-center text-xl shadow-lg">🧤</div>
        </div>

        {/* Jogador */}
        <div
          className="absolute"
          style={{ left: playerPos.x - PLAYER_R, top: playerPos.y - PLAYER_R }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white flex items-center justify-center text-xl shadow-lg"
            style={{ width: PLAYER_R * 2, height: PLAYER_R * 2 }}
          >👧</div>
        </div>

        {/* Bola */}
        <div
          className="absolute rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-md"
          style={{
            left: ballPos.x - BALL_R,
            top: ballPos.y - BALL_R,
            width: BALL_R * 2,
            height: BALL_R * 2,
          }}
        >
          <span className="text-sm">⚽</span>
        </div>

        {/* Linha de mira */}
        {isDragging && aimLine && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: ballPos.x,
              top: ballPos.y,
              width: Math.sqrt(aimLine.x ** 2 + aimLine.y ** 2),
              height: 4,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0))',
              transform: `rotate(${Math.atan2(aimLine.y, aimLine.x)}rad)`,
              transformOrigin: '0 50%',
            }}
          />
        )}

        {/* Mensagem de gol */}
        {phase === 'goal' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-green-500/30"
          >
            <div className="text-4xl font-black text-white drop-shadow-lg">GOOOOL! ⚽</div>
          </motion.div>
        )}

        {/* Mensagem de defesa */}
        {phase === 'miss' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-red-500/30"
          >
            <div className="text-4xl font-black text-white drop-shadow-lg">DEFENDEU! 🧤</div>
          </motion.div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">Arraste para trás da bola para mirar e solte para chutar!</p>
    </div>
  );
}
