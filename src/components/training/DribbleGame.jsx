import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { audio } from '@/lib/audioEngine';
import { bgMusic } from '@/lib/trainingMusic';

// ═══════════════════════════════════════════════════════════════════════════
// FUT DE RUA MELHORADO (Original + V2)
// ═══════════════════════════════════════════════════════════════════════════

const FIELD_W = 360;
const FIELD_H = 520;
const GOAL_W = 120;
const GOAL_H = 70;
const PLAYER_R = 24;
const BOT_R = 22;

const BALL_TYPES = [
  { id: 'head',   name: 'Cabeça de Boneca', emoji: '🧠', speed: 0.95, desc: 'Leve e imprevisível' },
  { id: 'can',    name: 'Lata',         emoji: '🥫', speed: 0.80, desc: 'Pesada e reta' },
  { id: 'stone',  name: 'Pedra',        emoji: '🪨', speed: 0.60, desc: 'Muito pesada' },
  { id: 'paper',  name: 'Papel Amassado', emoji: '📄', speed: 1.10, desc: 'Leve e flutuante' },
  { id: 'bottle', name: 'Garrafinha',   emoji: '🍼', speed: 1.00, desc: 'Equilibrada' },
  { id: 'lemon',  name: 'Limão',        emoji: '🍋', speed: 1.00, desc: 'Irregular' },
  { id: 'cap',    name: 'Tampinha',    emoji: '🪙', speed: 1.05, desc: 'Muito leve' },
  { id: 'tennis', name: 'Bolinha de Tênis', emoji: '🎾', speed: 1.15, desc: 'Muito rápida e quicante' },
  { id: 'deflated', name: 'Bola Murcha', emoji: '🏀', speed: 0.70, desc: 'Lenta e imprevisível' },
];

const OBSTACLE_TYPES = [
  { id: 'dog',  name: 'Cachorrinho',      emoji: '🐕', behavior: 'patrol', desc: 'Corre de um lado pro outro' },
  { id: 'car',  name: 'Carro Estacionado', emoji: '🚗', behavior: 'static', desc: 'Bloqueia o caminho' },
  { id: 'cat',  name: 'Gato',            emoji: '🐱', behavior: 'patrol', desc: 'Passeia pelo local' },
  { id: 'bike', name: 'Bicicleta',       emoji: '🚲', behavior: 'parked', desc: 'Estacionada no canto' },
  { id: 'bin',  name: 'Lixeira',         emoji: '🗑️', behavior: 'static', desc: 'Obstáculo fixo' },
  { id: 'granny', name: 'Velhinha',      emoji: '👵', behavior: 'slow', desc: 'Anda devagar pela rua' },
];

const LEVELS = [
  { label: 'Nível 1', goals: 3, time: 60, botSpeed: 1.2, obstacles: 1, desc: 'Rua calma - aprenda os controles' },
  { label: 'Nível 2', goals: 4, time: 55, botSpeed: 1.6, obstacles: 2, desc: 'Cuidado com os cachorros!' },
  { label: 'Nível 3', goals: 5, time: 50, botSpeed: 2.0, obstacles: 3, desc: 'Mais obstáculos na rua!' },
  { label: 'Nível 4', goals: 5, time: 45, botSpeed: 2.5, obstacles: 3, desc: 'Velocidade aumentando!' },
  { label: 'Nível 5', goals: 6, time: 40, botSpeed: 3.0, obstacles: 4, desc: 'Fim de semana na rua!' },
];

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

export default function DribbleGame() {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [goals, setGoals] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Seleção
  const [selectedBall, setSelectedBall] = useState(BALL_TYPES[0]);
  const [selectedObstacles, setSelectedObstacles] = useState([]);

  // Posições
  const [playerPos, setPlayerPos] = useState({ x: FIELD_W / 2, y: FIELD_H - 80 });
  const [botPos, setBotPos] = useState({ x: FIELD_W / 2, y: 120 });
  const [obstaclePositions, setObstaclePositions] = useState([]);

  // Controle
  const [joystick, setJoystick] = useState({ x: 0, y: 0, active: false });
  const [joystickCenter, setJoystickCenter] = useState(null);
  const [showGoalEffect, setShowGoalEffect] = useState(false);
  const [showHitEffect, setShowHitEffect] = useState(false);

  const config = LEVELS[level] || LEVELS[0];
  const rafRef = useRef(null);
  const joyRef = useRef(null);
  const joyCenterRef = useRef(null);

  const playSound = (sound) => {
    if (soundEnabled) audio.play?.(sound);
  };

  // Gerar obstáculos
  const generateObstacles = useCallback(() => {
    const obsList = selectedObstacles.length > 0 
      ? selectedObstacles 
      : OBSTACLE_TYPES.slice(0, config.obstacles);
    
    const newObstacles = obsList.map((type, i) => ({
      id: i,
      type,
      x: 40 + Math.random() * (FIELD_W - 80),
      y: 100 + Math.random() * (FIELD_H - 250),
      dir: Math.random() > 0.5 ? 1 : -1,
      speed: 0.5 + Math.random() * 0.5,
    }));
    setObstaclePositions(newObstacles);
  }, [selectedObstacles, config.obstacles]);

  // Iniciar nível
  const initLevel = useCallback((lvl) => {
    setLevel(lvl);
    setGoals(0);
    setTimeLeft(LEVELS[lvl].time);
    setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 80 });
    setBotPos({ x: FIELD_W / 2, y: 120 });
    generateObstacles();
    setPhase('playing');
    playSound('start');
  }, [generateObstacles]);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') { cancelAnimationFrame(rafRef.current); return; }

    const speed = 3.5 * selectedBall.speed;

    const loop = () => {
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
        const botSpeed = config.botSpeed;
        return {
          x: clamp(prev.x + (dx / d) * botSpeed, BOT_R, FIELD_W - BOT_R),
          y: clamp(prev.y + (dy / d) * botSpeed, BOT_R, FIELD_H - BOT_R),
        };
      });

      // Atualizar obstáculos móveis
      setObstaclePositions(prev => prev.map(obs => {
        if (obs.type.behavior === 'patrol') {
          let newX = obs.x + obs.dir * obs.speed;
          if (newX < 30 || newX > FIELD_W - 30) {
            return { ...obs, dir: -obs.dir };
          }
          return { ...obs, x: newX };
        }
        if (obs.type.behavior === 'slow') {
          // Velhinha anda devagar
          let newX = obs.x + obs.dir * (obs.speed * 0.3);
          if (newX < 30 || newX > FIELD_W - 30) {
            return { ...obs, dir: -obs.dir };
          }
          return { ...obs, x: newX };
        }
        return obs;
      }));

      // Colisão com bot
      if (dist(playerPos, botPos) < PLAYER_R + BOT_R - 5) {
        const newLives = lives - 1;
        setLives(newLives);
        setShowHitEffect(true);
        playSound('lose');
        setTimeout(() => setShowHitEffect(false), 500);
        
        if (newLives <= 0) {
          setPhase('result');
          playSound('gameover');
        } else {
          setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 80 });
          setBotPos({ x: FIELD_W / 2, y: 120 });
        }
      }

      // Colisão com obstáculos
      obstaclePositions.forEach(obs => {
        if (dist(playerPos, { x: obs.x, y: obs.y }) < PLAYER_R + 18) {
          const angle = Math.atan2(playerPos.y - obs.y, playerPos.x - obs.x);
          setPlayerPos(prev => ({
            x: clamp(prev.x + Math.cos(angle) * 5, PLAYER_R, FIELD_W - PLAYER_R),
            y: clamp(prev.y + Math.sin(angle) * 5, PLAYER_R, FIELD_H - PLAYER_R),
          }));
        }
      });

      // Verificar gol
      if (playerPos.y < GOAL_H + 30 && Math.abs(playerPos.x - FIELD_W / 2) < GOAL_W / 2) {
        const newGoals = goals + 1;
        const newScore = score + (level + 1) * 15;
        setGoals(newGoals);
        setScore(newScore);
        setShowGoalEffect(true);
        playSound('win');
        
        setTimeout(() => {
          setShowGoalEffect(false);
          if (newGoals >= config.goals) {
            const nextLvl = level + 1;
            if (nextLvl >= LEVELS.length) {
              setPhase('result');
              playSound('victory');
            } else {
              initLevel(nextLvl);
            }
          } else {
            setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 80 });
            setBotPos({ x: FIELD_W / 2, y: 120 });
          }
        }, 1500);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, joystick, playerPos, botPos, obstaclePositions, goals, level, score, config, lives, selectedBall, initLevel]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setPhase('result'); playSound('gameover'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Joystick handlers melhorados
  const handleJoyStart = (clientX, clientY) => {
    if (!joyRef.current) return;
    const rect = joyRef.current.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joyCenterRef.current = center;
    setJoystickCenter(center);
    const maxDist = 40;
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const scale = Math.min(distance, maxDist) / maxDist;
    const angle = Math.atan2(dy, dx);
    setJoystick({ x: Math.cos(angle) * scale, y: Math.sin(angle) * scale, active: true });
  };

  const updateJoystick = (clientX, clientY) => {
    const center = joyCenterRef.current;
    if (!center) return;
    const maxDist = 40;
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const scale = Math.min(distance, maxDist) / maxDist;
    const angle = Math.atan2(dy, dx);
    setJoystick({
      x: Math.cos(angle) * scale,
      y: Math.sin(angle) * scale,
      active: true,
    });
  };

  const handleJoyMove = (clientX, clientY) => {
    if (!joystick.active) return;
    updateJoystick(clientX, clientY);
  };

  const handleJoyEnd = () => {
    joyCenterRef.current = null;
    setJoystick({ x: 0, y: 0, active: false });
    setJoystickCenter(null);
  };

  // Handlers de seleção
  const handleSelectBall = (ball) => {
    setSelectedBall(ball);
    playSound('select');
    setPhase('obstacle-select');
  };

  const handleToggleObstacle = (obs) => {
    setSelectedObstacles(prev => {
      const exists = prev.find(o => o.id === obs.id);
      if (exists) return prev.filter(o => o.id !== obs.id);
      return [...prev, obs];
    });
    playSound('select');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  // Menu
  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-2"
          >⚽</motion.div>
          <h1 className="font-heading font-black text-3xl text-primary mb-1">Fut de Rua</h1>
          <p className="text-gray-500 text-sm px-8 text-center">Escolha sua bola, adicione elementos da rua e fuja do marcador!</p>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { playSound('start'); setPhase('ball-select'); }}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-lg text-lg"
        >
          Jogar Agora 🎮
        </motion.button>
      </div>
    );
  }

  // Seleção de bola
  if (phase === 'ball-select') {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-2"
        >
          <h2 className="font-heading font-bold text-xl text-primary">Escolha sua Bola</h2>
          <p className="text-gray-500 text-sm">Cada bola tem velocidade diferente</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {BALL_TYPES.map((ball, idx) => (
            <motion.button
              key={ball.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectBall(ball)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                selectedBall.id === ball.id 
                  ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-amber-300'
              }`}
            >
              <motion.span 
                className="text-3xl"
                animate={{ rotate: selectedBall.id === ball.id ? [0, 15, -15, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >{ball.emoji}</motion.span>
              <span className="font-bold text-sm">{ball.name}</span>
              <span className="text-[10px] text-gray-500">{ball.desc}</span>
              <div className="flex gap-0.5 mt-1">
                {[...Array(Math.round(ball.speed * 5))].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-amber-400" />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Seleção de obstáculos
  if (phase === 'obstacle-select') {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-2"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{selectedBall.emoji}</span>
            <span className="text-sm text-gray-500">{selectedBall.name}</span>
          </div>
          <h2 className="font-heading font-bold text-xl text-primary">Elementos da Rua</h2>
          <p className="text-gray-500 text-sm">Adicione obstáculos (opcional)</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {OBSTACLE_TYPES.map((obs, idx) => (
            <motion.button
              key={obs.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggleObstacle(obs)}
              className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                selectedObstacles.find(o => o.id === obs.id) 
                  ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/5' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span className="text-2xl">{obs.emoji}</span>
              <div className="text-left">
                <span className="font-bold text-sm block">{obs.name}</span>
                <span className="text-[10px] text-gray-500">{obs.desc}</span>
              </div>
              {selectedObstacles.find(o => o.id === obs.id) && (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }}
                  className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs"
                >✓</motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playSound('start'); initLevel(0); }}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-lg text-lg mt-4"
        >
          Começar! ⚽
        </motion.button>
      </div>
    );
  }

  // Jogo
  if (phase === 'playing' || phase === 'goal') {
    return (
      <div className="flex flex-col items-center gap-3 p-2">
        {/* HUD */}
        <div className="flex justify-between items-center w-full max-w-sm px-2">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.span 
                key={i}
                animate={i >= lives ? { opacity: 0.2 } : { scale: [1, 1.2, 1] }}
                className="text-lg"
              >{i < lives ? '❤️' : '🖤'}</motion.span>
            ))}
          </div>
          
          <div className="text-center">
            <div className="font-bold text-primary">{config.label}</div>
            <div className="flex gap-1 justify-center mt-1">
              {[...Array(config.goals)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={false}
                  animate={{ 
                    scale: i < goals ? 1.2 : 1,
                    backgroundColor: i < goals ? '#22c55e' : '#e5e7eb'
                  }}
                  className="w-2.5 h-2.5 rounded-full"
                />
              ))}
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg text-primary">{score}</div>
            <div className={`text-xs ${timeLeft <= 10 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Campo */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          style={{ 
            width: FIELD_W, 
            height: FIELD_H, 
            background: 'linear-gradient(180deg, #4a4a4a 0%, #5c5c5c 50%, #4a4a4a 100%)'
          }}
        >
          {/* Efeito de gol */}
          <AnimatePresence>
            {showGoalEffect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-green-500/40 z-50 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-6xl"
                >⚽🎉</motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Efeito de colisão */}
          <AnimatePresence>
            {showHitEffect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-500/30 z-50"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.5, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-4xl">💥</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Linhas do asfalto */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="absolute left-0 right-0 h-px bg-white"
                style={{ top: `${(i + 1) * 12}%` }}
              />
            ))}
            {[0.25, 0.5, 0.75].map(p => (
              <div key={p} className="absolute top-0 bottom-0 w-px bg-white" style={{ left: `${p * 100}%` }} />
            ))}
          </div>

          {/* Gol */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="absolute top-3 left-1/2 transform -translate-x-1/2"
            style={{
              width: GOAL_W,
              height: GOAL_H,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
              border: '3px solid rgba(255,255,255,0.6)',
              borderRadius: '8px 8px 0 0',
              borderBottom: 'none',
            }}
          >
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center text-3xl"
            >🥅</motion.div>
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
          </motion.div>

          {/* Obstáculos */}
          {obstaclePositions.map((obs, idx) => (
            <motion.div
              key={obs.id}
              initial={{ scale: 0, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
              className="absolute"
              style={{
                left: obs.x - 15,
                top: obs.y - 15,
                fontSize: 30,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            >
              <motion.div
                animate={obs.type.behavior === 'patrol' ? { x: [0, 10, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {obs.type.emoji}
              </motion.div>
            </motion.div>
          ))}

          {/* Marcador/Bot */}
          <motion.div
            className="absolute z-10"
            style={{ left: botPos.x - BOT_R, top: botPos.y - BOT_R }}
            animate={{ 
              scale: dist(playerPos, botPos) < 60 ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: dist(playerPos, botPos) < 60 
                  ? '0 0 20px rgba(239, 68, 68, 0.8)' 
                  : '0 4px 10px rgba(0,0,0,0.3)',
              }}
            >
              😤
            </div>
            {dist(playerPos, botPos) < 80 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-400 whitespace-nowrap"
              >
                ⚠️ Perigo!
              </motion.div>
            )}
          </motion.div>

          {/* Jogador */}
          <motion.div
            className="absolute z-20"
            style={{ left: playerPos.x - PLAYER_R, top: playerPos.y - PLAYER_R }}
            animate={{ 
              rotate: joystick.x * 10,
              scale: joystick.active ? 1.1 : 1,
            }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white relative"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.5)',
              }}
            >
              👧
              {/* Bola com o jogador */}
              <motion.div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md border border-gray-300"
                style={{ background: 'white' }}
                animate={{ rotate: joystick.active ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {selectedBall.emoji}
              </motion.div>
            </div>
          </motion.div>

          {/* Indicador de direção */}
          {joystick.active && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: playerPos.x,
                top: playerPos.y,
                width: 40,
                height: 4,
                background: 'rgba(59, 130, 246, 0.5)',
                transform: `rotate(${Math.atan2(joystick.y, joystick.x)}rad)`,
                transformOrigin: '0 50%',
                borderRadius: '2px',
              }}
            />
          )}
        </div>

        {/* Joystick */}
        <div className="flex items-center gap-4"
        >
          <div
            ref={joyRef}
            className="relative w-32 h-32 rounded-full bg-gray-200/60 border-2 border-gray-300 shadow-inner"
            onTouchStart={(e) => { e.preventDefault(); handleJoyStart(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchMove={(e) => { e.preventDefault(); handleJoyMove(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchEnd={(e) => { e.preventDefault(); handleJoyEnd(); }}
            onMouseDown={(e) => handleJoyStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleJoyMove(e.clientX, e.clientY)}
            onMouseUp={handleJoyEnd}
            onMouseLeave={handleJoyEnd}
          >
            <motion.div
              className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-primary to-green-600 shadow-lg border-2 border-white"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: joystick.x * 30 - 24,
                y: joystick.y * 30 - 24,
                scale: joystick.active ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-400 text-xs">{joystick.active ? '' : 'Arraste'}</span>
            </div>
          </div>

          <div className="text-center"
        >
            <p className="text-xs text-gray-500 font-medium">{config.desc}</p>
            <div className="flex items-center gap-2 mt-2"
        >
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setPhase('menu')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resultado
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center"
      >
        <motion.div 
          className="text-7xl mb-4"
          animate={goals >= config.goals ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, repeat: goals >= config.goals ? Infinity : 0 }}
        >
          {goals >= config.goals ? '🏆' : '⏰'}
        </motion.div>
        <h2 className="font-heading font-black text-3xl text-primary mb-2"
        >
          {goals >= config.goals ? 'Vitória!' : 'Tempo Esgotado'}
        </h2>
        <p className="text-gray-500"
        >
          {goals >= config.goals ? 'Você dominou a rua!' : 'Tente novamente!'}
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl"
      >
        <div className="text-5xl font-black text-primary text-center mb-2">{score}</div>
        <div className="text-sm text-gray-500 text-center mb-4">pontos</div>
        
        <div className="flex justify-around text-sm"
        >
          <div className="text-center"
          >
            <div className="font-bold text-lg">{level + 1}</div>
            <div className="text-xs text-gray-400">Nível</div>
          </div>
          <div className="text-center"
          >
            <div className="font-bold text-lg">{goals}</div>
            <div className="text-xs text-gray-400">Gols</div>
          </div>
          <div className="text-center"
          >
            <div className="font-bold text-lg">{3 - lives}</div>
            <div className="text-xs text-gray-400">Erros</div>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3 w-full max-w-xs"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPhase('menu')}
          className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Menu
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => initLevel(0)}
          className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg"
        >
          Jogar Novamente
        </motion.button>
      </div>
    </div>
  );
}
