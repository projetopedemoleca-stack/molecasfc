import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// FUT DE RUA - VERSÃO 2: JOYSTICK DIRECIONAL
// Estilo: Controle com joystick na tela, movimento contínuo
// ═══════════════════════════════════════════════════════════════════════════

const FIELD_W = 360;
const FIELD_H = 520;
const GOAL_W = 100;
const GOAL_H = 60;
const PLAYER_R = 22;
const BALL_R = 10;
const BOT_R = 20;

const LEVELS = [
  { label: 'Nível 1', goals: 3, time: 60, botSpeed: 1.2, desc: 'Marcador lento' },
  { label: 'Nível 2', goals: 4, time: 55, botSpeed: 1.6, desc: 'Mais rápido' },
  { label: 'Nível 3', goals: 5, time: 50, botSpeed: 2.0, desc: 'Veloz!' },
  { label: 'Nível 4', goals: 5, time: 45, botSpeed: 2.4, desc: 'Difícil!' },
  { label: 'Nível 5', goals: 6, time: 40, botSpeed: 2.8, desc: 'Impossível!' },
];

const OBSTACLES = [
  { id: 'dog', emoji: '🐕', x: 100, y: 200 },
  { id: 'car', emoji: '🚗', x: 250, y: 150 },
  { id: 'cone', emoji: '🚧', x: 180, y: 300 },
];

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

export default function DribbleGameV2() {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [goals, setGoals] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);

  // Posições
  const [playerPos, setPlayerPos] = useState({ x: FIELD_W / 2, y: FIELD_H - 80 });
  const [botPos, setBotPos] = useState({ x: FIELD_W / 2, y: 120 });

  // Controle
  const [joystick, setJoystick] = useState({ x: 0, y: 0, active: false });
  const [joystickCenter, setJoystickCenter] = useState(null);

  const config = LEVELS[level] || LEVELS[0];
  const rafRef = useRef(null);
  const joyRef = useRef(null);

  // Iniciar nível
  const initLevel = useCallback((lvl) => {
    setLevel(lvl);
    setGoals(0);
    setTimeLeft(LEVELS[lvl].time);
    setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 80 });
    setBotPos({ x: FIELD_W / 2, y: 120 });
    setPhase('playing');
  }, []);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') { cancelAnimationFrame(rafRef.current); return; }

    const loop = () => {
      const speed = 3;

      // Mover jogador com joystick
      setPlayerPos(prev => ({
        x: clamp(prev.x + joystick.x * speed, PLAYER_R, FIELD_W - PLAYER_R),
        y: clamp(prev.y + joystick.y * speed, PLAYER_R, FIELD_H - PLAYER_R),
      }));

      // Bot persegue o jogador
      setBotPos(prev => {
        const dx = playerPos.x - prev.x;
        const dy = playerPos.y - prev.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = config.botSpeed;
        return {
          x: clamp(prev.x + (dx / d) * speed, BOT_R, FIELD_W - BOT_R),
          y: clamp(prev.y + (dy / d) * speed, BOT_R, FIELD_H - BOT_R),
        };
      });

      // Verificar colisão com bot
      if (dist(playerPos, botPos) < PLAYER_R + BOT_R) {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setPhase('result');
        } else {
          setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 80 });
          setBotPos({ x: FIELD_W / 2, y: 120 });
        }
      }

      // Verificar gol
      if (playerPos.y < GOAL_H + 30 && Math.abs(playerPos.x - FIELD_W / 2) < GOAL_W / 2) {
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
            setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 80 });
            setBotPos({ x: FIELD_W / 2, y: 120 });
            setPhase('playing');
          }
        }, 1500);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, joystick, playerPos, botPos, goals, level, score, config, lives, initLevel]);

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

  // Joystick handlers
  const handleJoyStart = (clientX, clientY) => {
    if (!joyRef.current) return;
    const rect = joyRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setJoystickCenter({ x: centerX, y: centerY });
    setJoystick({ x: 0, y: 0, active: true });
  };

  const handleJoyMove = (clientX, clientY) => {
    if (!joystick.active || !joystickCenter) return;
    const maxDist = 40;
    const dx = clientX - joystickCenter.x;
    const dy = clientY - joystickCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const scale = Math.min(dist, maxDist) / maxDist;
    const angle = Math.atan2(dy, dx);
    setJoystick({
      x: Math.cos(angle) * scale,
      y: Math.sin(angle) * scale,
      active: true,
    });
  };

  const handleJoyEnd = () => {
    setJoystick({ x: 0, y: 0, active: false });
    setJoystickCenter(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="font-heading font-black text-3xl text-primary mb-1">Fut de Rua V2</h1>
          <p className="text-gray-500 text-sm">Use o joystick para fugir do marcador!</p>
        </motion.div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => initLevel(0)}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg"
        >Jogar</motion.button>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-4">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
          <div className="text-5xl mb-2">{goals >= config.goals ? '🏆' : '⏰'}</div>
          <h2 className="font-heading font-black text-2xl text-primary">{goals >= config.goals ? 'Vitória!' : 'Fim de Jogo'}</h2>
          <p className="text-gray-500">Pontuação: {score}</p>
        </motion.div>
        <div className="flex gap-2 w-full max-w-xs">
          <button onClick={() => setPhase('menu')} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Menu</button>
          <button onClick={() => initLevel(0)} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold">Novamente</button>
        </div>
      </div>
    );
  }

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
        className="relative rounded-xl overflow-hidden"
        style={{ width: FIELD_W, height: FIELD_H, background: 'linear-gradient(180deg, #5D4037 0%, #795548 50%, #5D4037 100%)' }}
      >
        {/* Linhas */}
        <div className="absolute inset-0 opacity-20">
          {[0.25, 0.5, 0.75].map(p => (
            <div key={p} className="absolute top-0 bottom-0 bg-white" style={{ left: `${p * 100}%`, width: 2 }} />
          ))}
        </div>

        {/* Gol */}
        <div
          className="absolute top-2 left-1/2 transform -translate-x-1/2 border-2 border-white/50 bg-white/10 rounded-lg flex items-center justify-center text-2xl"
          style={{ width: GOAL_W, height: GOAL_H }}
        >🥅</div>

        {/* Obstáculos */}
        {OBSTACLES.map(obs => (
          <div key={obs.id} className="absolute text-2xl" style={{ left: obs.x, top: obs.y }}>{obs.emoji}</div>
        ))}

        {/* Marcador/Bot */}
        <div
          className="absolute transition-all duration-75"
          style={{ left: botPos.x - BOT_R, top: botPos.y - BOT_R }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-2 border-white flex items-center justify-center text-xl shadow-lg">😤</div>
        </div>

        {/* Jogador */}
        <div
          className="absolute"
          style={{ left: playerPos.x - PLAYER_R, top: playerPos.y - PLAYER_R }}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white flex items-center justify-center text-xl shadow-lg"
          >👧</div>
          {/* Bola com o jogador */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs">⚽</div>
        </div>

        {/* Mensagem de gol */}
        {phase === 'goal' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-green-500/30"
          >
            <div className="text-4xl font-black text-white drop-shadow-lg">GOOOOL! ⚽</div>
          </motion.div>
        )}
      </div>

      {/* Joystick */}
      <div
        ref={joyRef}
        className="relative w-32 h-32 rounded-full bg-gray-200/50 border-2 border-gray-300"
        onTouchStart={(e) => { e.preventDefault(); handleJoyStart(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchMove={(e) => { e.preventDefault(); handleJoyMove(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={(e) => { e.preventDefault(); handleJoyEnd(); }}
        onMouseDown={(e) => handleJoyStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleJoyMove(e.clientX, e.clientY)}
        onMouseUp={handleJoyEnd}
        onMouseLeave={handleJoyEnd}
      >
        <div
          className="absolute w-12 h-12 rounded-full bg-primary shadow-lg transition-transform"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${joystick.x * 30}px), calc(-50% + ${joystick.y * 30}px))`,
          }}
        />
      </div>

      <p className="text-xs text-gray-400">Use o joystick para mover. Fuja do 😤 e marque no 🥅!</p>
    </div>
  );
}
