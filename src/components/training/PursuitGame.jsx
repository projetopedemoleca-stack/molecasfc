import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';

// ── Tipos de bola ──────────────────────────────────────────────────────────────
const BALL_TYPES = [
  { id: 'ball',       name: 'Bola',        emoji: '⚽', speed: 1.0, bounce: 0.8 },
  { id: 'can',        name: 'Lata',        emoji: '🥫', speed: 0.95, bounce: 0.6 },
  { id: 'bottle',     name: 'Garrafinha',  emoji: '🍾', speed: 0.9, bounce: 0.5 },
  { id: 'cap',        name: 'Tampinha',    emoji: '🎯', speed: 1.1, bounce: 0.9 },
  { id: 'paper',      name: 'Papel',       emoji: '📄', speed: 0.85, bounce: 0.3 },
  { id: 'stone',      name: 'Pedra',       emoji: '🪨', speed: 0.7, bounce: 0.2 },
  { id: 'lemon',      name: 'Limão',       emoji: '🍋', speed: 0.92, bounce: 0.7 },
  { id: 'head',       name: 'Cabeça',      emoji: '🧠', speed: 0.88, bounce: 0.55 },
];

// ── Obstáculos de rua ──────────────────────────────────────────────────────────
const OBSTACLE_TYPES = [
  { id: 'dog',    name: 'Cachorro',   emoji: '🐕', behavior: 'patrol' },
  { id: 'car',    name: 'Carro',      emoji: '🚗', behavior: 'parked' },
  { id: 'cat',    name: 'Gato',       emoji: '🐱', behavior: 'sleep' },
  { id: 'bike',   name: 'Bicicleta',  emoji: '🚲', behavior: 'parked' },
  { id: 'cone',   name: 'Cone',       emoji: '🚧', behavior: 'static' },
];

// ── Níveis ─────────────────────────────────────────────────────────────────────
const LEVELS = [
  { label: 'Rua Calma',      time: 60, goals: 3,  obstacles: 1, botSpeed: 0.8,  desc: 'Poucos obstáculos — calma!' },
  { label: 'Beco Movimentado', time: 55, goals: 4,  obstacles: 2, botSpeed: 1.0,  desc: 'Cuidado com o cachorro!' },
  { label: 'Praça Cheia',    time: 50, goals: 5,  obstacles: 3, botSpeed: 1.15, desc: 'Mais obstáculos na rua!' },
  { label: 'Ruazinha Apertada', time: 45, goals: 5,  obstacles: 3, botSpeed: 1.3,  desc: 'Espaço apertado!' },
  { label: 'Fim de Semana',  time: 40, goals: 6,  obstacles: 4, botSpeed: 1.5,  desc: 'Todo mundo na rua!' },
];

const FIELD_W = 340;
const FIELD_H = 480;
const PLAYER_R = 18;
const BALL_R = 12;
const GOAL_W = 70;
const GOAL_DEPTH = 25;

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ── Componente principal ──────────────────────────────────────────────────────
export default function PursuitGame({ onStickerEarned }) {
  const [phase, setPhase] = useState('menu'); // menu | select | playing | goal | complete
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [goals, setGoals] = useState(0);
  const [time, setTime] = useState(60);
  const [lives, setLives] = useState(3);

  // Posição do jogador (bola)
  const [player, setPlayer] = useState({ x: FIELD_W / 2, y: FIELD_H - 50 });
  // Posição do marcador adversário
  const [bot, setBot] = useState({ x: FIELD_W / 2, y: 50 });
  // Obstáculos dinâmicos
  const [obstacles, setObstacles] = useState([]);

  // Seleção de bola
  const [selectedBall, setSelectedBall] = useState(BALL_TYPES[0]);
  // Direção do movimento (joystick)
  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 });

  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const gameRef = useRef({ phase: 'menu', player, bot, obstacles, time });

  const cfg = LEVELS[level] || LEVELS[0];

  // ── Inicializar nível ────────────────────────────────────────────────────────
  const initLevel = useCallback((lvl) => {
    const c = LEVELS[lvl] || LEVELS[0];
    setLevel(lvl);
    setPlayer({ x: FIELD_W / 2, y: FIELD_H - 50 });
    setBot({ x: FIELD_W / 2, y: 50 });
    setGoals(0);
    setTime(c.time);

    // Gerar obstáculos
    const obs = [];
    const types = OBSTACLE_TYPES.slice(0, c.obstacles + 1);
    for (let i = 0; i < c.obstacles; i++) {
      const type = types[i % types.length];
      const yZone = 80 + (i + 1) * ((FIELD_H - 160) / (c.obstacles + 1));
      obs.push({
        id: i,
        type: type.id,
        emoji: type.emoji,
        behavior: type.behavior,
        x: 40 + Math.random() * (FIELD_W - 80),
        y: yZone,
        dir: Math.random() > 0.5 ? 1 : -1,
        speed: 0.4 + Math.random() * 0.3,
      });
    }
    setObstacles(obs);
    gameRef.current = { phase: 'playing', player: { x: FIELD_W / 2, y: FIELD_H - 50 }, bot: { x: FIELD_W / 2, y: 50 }, obstacles: obs, time: c.time };
    setPhase('playing');
  }, []);

  // ── Game loop ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') { cancelAnimationFrame(rafRef.current); return; }

    const loop = (now) => {
      const dt = lastTimeRef.current ? Math.min((now - lastTimeRef.current) / 16, 2.5) : 1;
      lastTimeRef.current = now;

      // Move jogador (bola) com joystick/direção
      const speed = 3.5 * selectedBall.speed;
      gameRef.current.player.x = clamp(
        gameRef.current.player.x + moveDir.x * speed * dt,
        PLAYER_R + 5, FIELD_W - PLAYER_R - 5
      );
      gameRef.current.player.y = clamp(
        gameRef.current.player.y + moveDir.y * speed * dt,
        PLAYER_R + 5, FIELD_H - PLAYER_R - 5
      );

      // Bot persegue a bola
      const dx = gameRef.current.player.x - gameRef.current.bot.x;
      const dy = gameRef.current.player.y - gameRef.current.bot.y;
      const d = Math.hypot(dx, dy) || 1;
      const botSpeed = cfg.botSpeed * dt;
      gameRef.current.bot.x = clamp(gameRef.current.bot.x + (dx / d) * botSpeed, PLAYER_R, FIELD_W - PLAYER_R);
      gameRef.current.bot.y = clamp(gameRef.current.bot.y + (dy / d) * botSpeed, PLAYER_R, FIELD_H - PLAYER_R);

      // Move obstáculos
      gameRef.current.obstacles = gameRef.current.obstacles.map(o => {
        if (o.behavior === 'patrol') {
          let nx = o.x + o.dir * o.speed * dt * 2;
          if (nx < 30 || nx > FIELD_W - 30) o.dir *= -1;
          return { ...o, x: clamp(nx, 30, FIELD_W - 30) };
        }
        return o;
      });

      // Colisão com bot = perde vida
      if (dist(gameRef.current.player, gameRef.current.bot) < PLAYER_R + PLAYER_R - 4) {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          gameRef.current.phase = 'complete';
          setPhase('complete');
        } else {
          // Respawn
          gameRef.current.player = { x: FIELD_W / 2, y: FIELD_H - 50 };
          gameRef.current.bot = { x: FIELD_W / 2, y: 50 };
          setPlayer({ x: FIELD_W / 2, y: FIELD_H - 50 });
          setBot({ x: FIELD_W / 2, y: 50 });
        }
        return;
      }

      // Gol! Chegou no gol do adversário (topo)
      if (gameRef.current.player.y < GOAL_DEPTH + PLAYER_R) {
        const inGoal = Math.abs(gameRef.current.player.x - FIELD_W / 2) < GOAL_W / 2;
        if (inGoal) {
          const newGoals = goals + 1;
          const newScore = score + (level + 1) * 10;
          setGoals(newGoals);
          setScore(newScore);
          if (newGoals >= cfg.goals) {
            // Avança nível
            const nextLvl = level + 1;
            if (nextLvl >= LEVELS.length) {
              gameRef.current.phase = 'complete';
              setPhase('complete');
            } else {
              initLevel(nextLvl);
            }
          } else {
            // Respawn para continuar
            gameRef.current.player = { x: FIELD_W / 2, y: FIELD_H - 50 };
            gameRef.current.bot = { x: FIELD_W / 2, y: 50 };
          }
          return;
        }
      }

      // Colisão com obstáculos = empurra
      gameRef.current.obstacles.forEach(o => {
        const d = dist(gameRef.current.player, o);
        if (d < PLAYER_R + 15) {
          const angle = Math.atan2(gameRef.current.player.y - o.y, gameRef.current.player.x - o.x);
          gameRef.current.player.x += Math.cos(angle) * 2;
          gameRef.current.player.y += Math.sin(angle) * 2;
        }
      });

      setPlayer({ ...gameRef.current.player });
      setBot({ ...gameRef.current.bot });
      setObstacles([...gameRef.current.obstacles]);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, moveDir, selectedBall, cfg, goals, level, lives, score, initLevel]);

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          setPhase('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // ── Controles ────────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (phase !== 'playing') return;
    const dirs = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
    };
    const d = dirs[e.key];
    if (d) setMoveDir({ x: d[0], y: d[1] });
  }, [phase]);

  const handleKeyUp = useCallback((e) => {
    const stopKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'];
    if (stopKeys.includes(e.key)) setMoveDir({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // D-pad touch
  const setMove = (dx, dy) => {
    if (phase === 'playing') setMoveDir({ x: dx, y: dy });
  };

  // ── MENU ─────────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-4">
      <div style={{
        width: 200, height: 150, borderRadius: 16, overflow: 'hidden',
        background: 'linear-gradient(180deg,#78350f 0%,#92400e 50%,#a16207 100%)',
        boxShadow: '0 8px 32px rgba(120,53,15,0.5)',
        position: 'relative',
      }}>
        {/* Linhas da rua */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: '#fde047', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ position: 'absolute', right: 20, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.2)' }} />
        </div>
        {/* Gol em cima */}
        <div style={{ position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)', width: 60, height: 20, border: '2px solid white', borderBottom: 'none', borderRadius: '4px 4px 0 0' }} />
        {/* Gol em baixo */}
        <div style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', width: 60, height: 20, border: '2px solid white', borderTop: 'none', borderRadius: '0 0 4px 4px' }} />
        {/* Bonecos */}
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ position: 'absolute', left: '50%', bottom: 30, transform: 'translateX(-50%)', fontSize: 22 }}>{selectedBall.emoji}</motion.div>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
          style={{ position: 'absolute', left: '30%', top: 25, fontSize: 18 }}>🧑</motion.div>
        <motion.div animate={{ x: [0, 30, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 70, left: 20, fontSize: 16 }}>🐕</motion.div>
        <div style={{ position: 'absolute', right: 15, top: 55, fontSize: 20 }}>🚗</div>
      </div>

      <div className="text-center">
        <h1 className="font-heading font-black text-3xl text-primary mb-1">Fut de Rua!</h1>
        <p className="text-gray-500 text-sm">1v1 no beco — escolha sua bola e desvie dos obstáculos!</p>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
        onClick={() => setPhase('select')}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-heading font-black text-xl rounded-2xl shadow-lg"
      >
        Escolher Bola ⚽
      </motion.button>
    </div>
  );

  // ── SELEÇÃO DE BOLA ──────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-4">
      <h2 className="font-heading font-black text-2xl text-primary">Escolha sua Bola</h2>
      <div className="grid grid-cols-4 gap-3 w-full max-w-xs">
        {BALL_TYPES.map(b => (
          <motion.button key={b.id} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}
            onClick={() => setSelectedBall(b)}
            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-2xl
              ${selectedBall.id === b.id ? 'bg-primary text-white ring-2 ring-primary' : 'bg-white text-gray-700'}`}
          >
            {b.emoji}
            <span className="text-[9px] font-bold mt-1">{b.name}</span>
          </motion.button>
        ))}
      </div>
      <div className="bg-amber-50 rounded-xl p-3 w-full max-w-xs text-center">
        <p className="text-xs text-amber-700">
          <strong>{selectedBall.name}</strong> — Velocidade: {Math.round(selectedBall.speed * 100)}%
        </p>
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPhase('menu')}
          className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Voltar</motion.button>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { setScore(0); setLives(3); initLevel(0); }}
          className="flex-1 py-3 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-bold rounded-xl shadow"
        >
          Jogar!
        </motion.button>
      </div>
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
          {lives <= 0 ? 'Fim de Jogo!' : time <= 0 ? 'Tempo Esgotado!' : 'Jogo da Rua!'}
        </h1>
        <p className="text-gray-500">{lives <= 0 ? 'O marcador te pegou!' : 'Bom jogo!'}</p>
      </div>
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6 w-full max-w-xs">
        <div className="text-5xl font-black text-amber-600">{score}</div>
        <div className="text-gray-500 text-sm mt-1">pontos</div>
        <div className="flex justify-around mt-4 text-sm">
          <div><div className="font-bold text-primary">{goals}</div><div className="text-gray-400">Gols</div></div>
          <div><div className="font-bold text-amber-500">{level + 1}</div><div className="text-gray-400">Nível</div></div>
        </div>
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { setScore(0); setLives(3); initLevel(0); }}
          className="flex-1 py-3 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-bold rounded-xl shadow"
        >
          Jogar de Novo
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => setPhase('menu')}
          className="py-3 px-4 bg-gray-100 text-gray-600 font-bold rounded-xl"
        >
          Menu
        </motion.button>
      </div>
    </motion.div>
  );

  // ── PLAYING ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 pt-2 pb-4 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-2">
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <span key={i} className="text-xl">{i < lives ? '❤️' : '🖤'}</span>
          ))}
        </div>
        <div className="text-center">
          <div className="font-heading font-black text-primary">{cfg.label}</div>
          <div className="text-xs text-gray-500">{goals}/{cfg.goals} gols</div>
        </div>
        <div className="text-right">
          <div className="font-heading font-black text-xl text-primary">{score}</div>
          <div className="text-xs text-gray-400">{time}s</div>
        </div>
      </div>

      {/* Campo de rua */}
      <div style={{
        position: 'relative',
        width: FIELD_W, height: FIELD_H,
        borderRadius: 12, overflow: 'hidden',
        background: 'linear-gradient(180deg,#78350f 0%,#92400e 50%,#a16207 100%)',
        boxShadow: '0 8px 32px rgba(120,53,15,0.5)',
      }}>
        {/* Linhas da rua */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: '#fde047', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ position: 'absolute', right: 15, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.15)' }} />

        {/* Gol do adversário (topo) */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: GOAL_W, height: GOAL_DEPTH,
          background: 'rgba(255,255,255,0.15)',
          border: '3px solid white', borderBottom: 'none',
          borderRadius: '6px 6px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 16 }}>🥅</span>
        </div>

        {/* Seu gol (base) */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: GOAL_W, height: GOAL_DEPTH,
          background: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.4)', borderTop: 'none',
          borderRadius: '0 0 6px 6px',
        }} />

        {/* Obstáculos */}
        {obstacles.map(o => (
          <motion.div key={o.id}
            animate={o.behavior === 'patrol' ? { x: [o.x - 20, o.x + 20, o.x - 20] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              left: o.x, top: o.y,
              transform: 'translate(-50%,-50%)',
              fontSize: 24,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
            }}
          >
            {o.emoji}
          </motion.div>
        ))}

        {/* Marcador adversário */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{
            position: 'absolute',
            left: bot.x, top: bot.y,
            transform: 'translate(-50%,-50%)',
            width: PLAYER_R * 2, height: PLAYER_R * 2,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#dc2626,#ef4444)',
            border: '3px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 0 15px rgba(239,68,68,0.6)',
          }}
        >
          🧑
        </motion.div>

        {/* Jogador (bola escolhida) */}
        <motion.div
          style={{
            position: 'absolute',
            left: player.x, top: player.y,
            transform: 'translate(-50%,-50%)',
            fontSize: 28,
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
          }}
        >
          {selectedBall.emoji}
        </motion.div>
      </div>

      <div className="text-xs text-gray-400">{cfg.desc}</div>

      {/* D-pad */}
      <div className="flex flex-col items-center gap-1">
        <motion.button whileTap={{ scale: 0.85 }}
          onTouchStart={() => setMove(0, -1)} onTouchEnd={() => setMove(0, 0)}
          onMouseDown={() => setMove(0, -1)} onMouseUp={() => setMove(0, 0)}
          className="w-14 h-14 bg-amber-100 rounded-xl shadow flex items-center justify-center text-2xl"
        >⬆️</motion.button>
        <div className="flex gap-1">
          <motion.button whileTap={{ scale: 0.85 }}
            onTouchStart={() => setMove(-1, 0)} onTouchEnd={() => setMove(0, 0)}
            onMouseDown={() => setMove(-1, 0)} onMouseUp={() => setMove(0, 0)}
            className="w-14 h-14 bg-amber-100 rounded-xl shadow flex items-center justify-center text-2xl"
          >⬅️</motion.button>
          <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center opacity-50">
            <div className="w-3 h-3 bg-amber-300 rounded-full" />
          </div>
          <motion.button whileTap={{ scale: 0.85 }}
            onTouchStart={() => setMove(1, 0)} onTouchEnd={() => setMove(0, 0)}
            onMouseDown={() => setMove(1, 0)} onMouseUp={() => setMove(0, 0)}
            className="w-14 h-14 bg-amber-100 rounded-xl shadow flex items-center justify-center text-2xl"
          >➡️</motion.button>
        </div>
        <motion.button whileTap={{ scale: 0.85 }}
          onTouchStart={() => setMove(0, 1)} onTouchEnd={() => setMove(0, 0)}
          onMouseDown={() => setMove(0, 1)} onMouseUp={() => setMove(0, 0)}
          className="w-14 h-14 bg-amber-100 rounded-xl shadow flex items-center justify-center text-2xl"
        >⬇️</motion.button>
      </div>

      <motion.button whileTap={{ scale: 0.9 }}
        onClick={() => { setScore(0); setLives(3); initLevel(0); }}
        className="flex items-center gap-2 text-gray-400 text-sm"
      >
        <RotateCcw className="w-4 h-4" /> Recomeçar
      </motion.button>
    </div>
  );
}
