import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const BALL_TYPES = [
  { id: 'head',   name: 'Cabeça de Boneca', emoji: '🧠', speed: 0.95, desc: 'Leve e imprevisível' },
  { id: 'can',    name: 'Lata',         emoji: '🥫', speed: 0.80, desc: 'Pesada e reta' },
  { id: 'stone',  name: 'Pedra',        emoji: '🪨', speed: 0.60, desc: 'Muito pesada' },
  { id: 'paper',  name: 'Papel Amassado', emoji: '📄', speed: 1.10, desc: 'Leve e flutuante' },
  { id: 'bottle', name: 'Garrafinha',   emoji: '🍼', speed: 1.00, desc: 'Equilibrada' },
  { id: 'lemon',  name: 'Limão',        emoji: '🍋', speed: 1.00, desc: 'Irregular' },
  { id: 'cap',    name: 'Tampinha',    emoji: '🪙', speed: 1.05, desc: 'Muito leve' },
];

const OBSTACLE_TYPES = [
  { id: 'dog',  name: 'Cachorrinho',      emoji: '🐕', behavior: 'patrol', desc: 'Corre de um lado pro outro' },
  { id: 'car',  name: 'Carro Estacionado', emoji: '🚗', behavior: 'static', desc: 'Bloqueia o caminho' },
  { id: 'cat',  name: 'Gato',            emoji: '🐱', behavior: 'patrol', desc: 'Passeia pelo local' },
  { id: 'bike', name: 'Bicicleta',       emoji: '🚲', behavior: 'parked', desc: 'Estacionada no canto' },
  { id: 'bin',  name: 'Lixeira',         emoji: '🗑️', behavior: 'static', desc: 'Obstáculo fixo' },
];

const LEVELS = [
  { label: 'Nível 1', time: 60, goals: 3, obstacles: 1, botSpeed: 0.7, desc: 'Rua calma, poucos obstáculos' },
  { label: 'Nível 2', time: 55, goals: 4, obstacles: 2, botSpeed: 0.9, desc: 'Cuidado com os cachorros!' },
  { label: 'Nível 3', time: 50, goals: 5, obstacles: 3, botSpeed: 1.1, desc: 'Mais obstáculos na rua!' },
  { label: 'Nível 4', time: 45, goals: 5, obstacles: 3, botSpeed: 1.3, desc: 'Velocidade aumentando!' },
  { label: 'Nível 5', time: 40, goals: 6, obstacles: 4, botSpeed: 1.6, desc: 'Fim de semana na rua!' },
];

const FIELD_W = 320;
const FIELD_H = 480;
const GOAL_WIDTH = 60;
const GOAL_HEIGHT = 50;
const PLAYER_SIZE = 18;
const OBSTACLE_SIZE = 20;

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export default function DribbleGame({ onStickerEarned }) {
  // Estados
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [goals, setGoals] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  // Seleção
  const [selectedBall, setSelectedBall] = useState(BALL_TYPES[0]);
  const [selectedObstacles, setSelectedObstacles] = useState([]);

  // Posições
  const [playerPos, setPlayerPos] = useState({ x: FIELD_W / 2, y: FIELD_H - 50 });
  const [botPos, setBotPos] = useState({ x: FIELD_W / 2, y: 50 });
  const [obstaclePositions, setObstaclePositions] = useState([]);

  // Controle
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);

  // Refs
  const velocityRef = useRef({ x: 0, y: 0 });
  const loopRef = useRef(null);
  const playerStartRef = useRef({ x: FIELD_W / 2, y: FIELD_H - 50 });

  const config = LEVELS[level] || LEVELS[0];

  // ═══════════════════════════════════════════════════════════════════════════
  // GERAÇÃO DE OBSTÁCULOS
  // ═══════════════════════════════════════════════════════════════════════════

  const generateObstacles = useCallback(() => {
    const newObstacles = [];
    const count = config.obstacles + 1;
    
    for (let i = 0; i < count; i++) {
      const type = OBSTACLE_TYPES[i % OBSTACLE_TYPES.length];
      const isTop = i < 2;
      const x = 30 + Math.random() * (FIELD_W - 60);
      const y = isTop ? 50 + Math.random() * 100 : 280 + Math.random() * (FIELD_H - 280);
      
      newObstacles.push({
        id: i,
        type,
        x,
        y,
        dir: 1,
        speed: 0.5 + Math.random() * 0.5
      });
    }
    
    setObstaclePositions(newObstacles);
  }, [config.obstacles]);

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO DO JOGO
  // ═══════════════════════════════════════════════════════════════════════════

  const startGame = useCallback(() => {
    setPhase('playing');
    setLevel(0);
    setScore(0);
    setLives(3);
    setGoals(0);
    setTimeLeft(LEVELS[0].time);
    setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 50 });
    setBotPos({ x: FIELD_W / 2, y: 50 });
    playerStartRef.current = { x: FIELD_W / 2, y: FIELD_H - 50 };
    velocityRef.current = { x: 0, y: 0 };
    setVelocity({ x: 0, y: 0 });
    generateObstacles();
    setGameOver(false);
  }, [generateObstacles]);

  // ═══════════════════════════════════════════════════════════════════════════
  // GAME LOOP
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (phase !== 'playing') {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      return;
    }

    const gameLoop = () => {
      const vx = velocityRef.current.x;
      const vy = velocityRef.current.y;
      const speed = 3.5 * selectedBall.speed;

      // Atualizar posição do jogador
      setPlayerPos(prev => {
        const newX = Math.max(PLAYER_SIZE, Math.min(FIELD_W - PLAYER_SIZE, prev.x + vx * speed));
        const newY = Math.max(PLAYER_SIZE, Math.min(FIELD_H - PLAYER_SIZE, prev.y + vy * speed));
        return { x: newX, y: newY };
      });

      // Atualizar posição do bot (persegue o jogador)
      setBotPos(prev => {
        const dx = playerPos.x - prev.x;
        const dy = playerPos.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const botSpeed = config.botSpeed;
        return {
          x: Math.max(PLAYER_SIZE, Math.min(FIELD_W - PLAYER_SIZE, prev.x + (dx / dist) * botSpeed)),
          y: Math.max(PLAYER_SIZE, Math.min(FIELD_H - PLAYER_SIZE, prev.y + (dy / dist) * botSpeed))
        };
      });

      // Atualizar obstáculos móveis
      setObstaclePositions(prev => prev.map(obs => {
        if (obs.type.behavior === 'patrol') {
          let newX = obs.x + obs.dir * obs.speed;
          if (newX < 20 || newX > FIELD_W - 20) {
            return { ...obs, dir: -obs.dir };
          }
          return { ...obs, x: newX };
        }
        return obs;
      }));

      loopRef.current = requestAnimationFrame(gameLoop);
    };

    loopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [phase, playerPos, botPos, config, selectedBall]);

  // Verificar colisões e gols
  useEffect(() => {
    if (phase !== 'playing') return;

    // Colisão com o bot
    const dist = distance(playerPos, botPos);
    if (dist < PLAYER_SIZE + PLAYER_SIZE) {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setGameOver(true);
        setPhase('result');
      } else {
        setPlayerPos(playerStartRef.current);
        setBotPos({ x: FIELD_W / 2, y: 50 });
      }
      return;
    }

    // Colisão com obstáculos
    obstaclePositions.forEach(obs => {
      const d = distance(playerPos, { x: obs.x, y: obs.y });
      if (d < PLAYER_SIZE + OBSTACLE_SIZE) {
        const angle = Math.atan2(playerPos.y - obs.y, playerPos.x - obs.x);
        setPlayerPos(prev => ({
          x: Math.max(PLAYER_SIZE, Math.min(FIELD_W - PLAYER_SIZE, prev.x + Math.cos(angle) * 3)),
          y: Math.max(PLAYER_SIZE, Math.min(FIELD_H - PLAYER_SIZE, prev.y + Math.sin(angle) * 3))
        }));
      }
    });

    // Verificar gol
    const inGoalX = Math.abs(playerPos.x - FIELD_W / 2) < GOAL_WIDTH / 2;
    const inGoalY = playerPos.y < GOAL_HEIGHT + PLAYER_SIZE;
    if (inGoalX && inGoalY) {
      const newGoals = goals + 1;
      const newScore = score + (level + 1) * 10;
      setGoals(newGoals);
      setScore(newScore);

      if (newGoals >= config.goals) {
        if (level < LEVELS.length - 1) {
          setLevel(l => l + 1);
          setGoals(0);
          generateObstacles();
          setPlayerPos(playerStartRef.current);
          setBotPos({ x: FIELD_W / 2, y: 50 });
        } else {
          setPhase('result');
        }
      } else {
        setPlayerPos(playerStartRef.current);
        setBotPos({ x: FIELD_W / 2, y: 50 });
      }
    }
  }, [phase, playerPos, botPos, obstaclePositions, lives, level, goals, config, score, generateObstacles]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMER
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROLES DE TECLADO
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const handleKeyDown = (e) => {
      const speed = 1;
      const moves = {
        ArrowUp: { x: 0, y: -speed },
        ArrowDown: { x: 0, y: speed },
        ArrowLeft: { x: -speed, y: 0 },
        ArrowRight: { x: speed, y: 0 },
        w: { x: 0, y: -speed },
        s: { x: 0, y: speed },
        a: { x: -speed, y: 0 },
        d: { x: speed, y: 0 }
      };
      const move = moves[e.key];
      if (move) {
        e.preventDefault();
        velocityRef.current = move;
        setVelocity(move);
      }
    };

    const handleKeyUp = () => {
      velocityRef.current = { x: 0, y: 0 };
      setVelocity({ x: 0, y: 0 });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROLES TOUCH
  // ═══════════════════════════════════════════════════════════════════════════

  const handleTouchMove = (e) => {
    if (phase !== 'playing') return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > 0) {
      const normalizedX = dx / magnitude;
      const normalizedY = dy / magnitude;
      velocityRef.current = { x: normalizedX, y: normalizedY };
      setVelocity({ x: normalizedX, y: normalizedY });
    }
  };

  const handleTouchEnd = () => {
    velocityRef.current = { x: 0, y: 0 };
    setVelocity({ x: 0, y: 0 });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS DE SELEÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSelectBall = (ball) => {
    setSelectedBall(ball);
    setPhase('obstacle-select');
  };

  const handleToggleObstacle = (obs) => {
    setSelectedObstacles(prev => {
      if (prev.find(o => o.id === obs.id)) {
        return prev.filter(o => o.id !== obs.id);
      }
      return [...prev, obs];
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO - MENU
  // ═══════════════════════════════════════════════════════════════════════════

  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="font-heading font-black text-3xl text-primary mb-1">
            Futebol de Rua
          </h1>
          <p className="text-gray-500 text-sm px-8 text-center">
            Fuja do marcador e marque gols em um 1x1 de rua!
          </p>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setPhase('ball-select')}
          className="w-full max-w-xs py-3 bg-gradient-to-r from-primary to-green-500 text-white font-bold rounded-xl shadow-lg"
        >
          Começar
        </motion.button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO - SELEÇÃO DE BOLA
  // ═══════════════════════════════════════════════════════════════════════════

  if (phase === 'ball-select') {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-6">
        <div className="text-center mb-2">
          <h2 className="font-heading font-bold text-xl text-primary">Escolha sua Bola</h2>
          <p className="text-gray-500 text-sm">Cada bola tem características diferentes</p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
          {BALL_TYPES.map(ball => (
            <motion.button
              key={ball.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectBall(ball)}
              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${
                selectedBall.id === ball.id ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'
              }`}
            >
              <span className="text-2xl">{ball.emoji}</span>
              <span className="font-bold text-xs">{ball.name}</span>
              <span className="text-[10px] text-gray-500">{ball.desc}</span>
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => setPhase('obstacle-select')}
          className="w-full max-w-xs py-2 bg-gray-100 text-gray-700 font-bold rounded-lg"
        >
          Próximo
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO - SELEÇÃO DE OBSTÁCULOS
  // ═══════════════════════════════════════════════════════════════════════════

  if (phase === 'obstacle-select') {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-6">
        <div className="text-center mb-2">
          <p className="text-xs text-gray-500">
            Bola: {selectedBall.emoji} {selectedBall.name}
          </p>
          <h2 className="font-heading font-bold text-xl text-primary">Ambiente da Rua</h2>
          <p className="text-gray-500 text-sm">Adicione elementos da rua (opcional)</p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
          {OBSTACLE_TYPES.map(obs => (
            <motion.button
              key={obs.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggleObstacle(obs)}
              className={`p-2 rounded-xl border-2 flex items-center gap-2 ${
                selectedObstacles.find(o => o.id === obs.id) ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'
              }`}
            >
              <span className="text-lg">{obs.emoji}</span>
              <span className="font-bold text-xs">{obs.name}</span>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="w-full max-w-xs py-3 bg-gradient-to-r from-primary to-green-500 text-white font-bold rounded-xl shadow-lg"
        >
          Jogar! ⚽
        </motion.button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO - JOGO
  // ═══════════════════════════════════════════════════════════════════════════

  if (phase === 'playing') {
    return (
      <div className="flex flex-col gap-3 p-2">
        {/* HUD */}
        <div className="flex justify-between items-center px-2">
          <div className="flex gap-1">
            {Array.from({ length: lives }).map((_, i) => (
              <span key={i} className="text-lg">❤️</span>
            ))}
          </div>
          <div className="text-center">
            <p className="font-bold text-primary">{config.label}</p>
            <p className="text-xs text-gray-500">{goals}/{config.goals}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-primary">{score}</p>
            <p className="text-xs text-gray-500">pts</p>
          </div>
        </div>

        {/* Campo */}
        <div
          className="relative w-full aspect-[3/4] max-h-[320px] overflow-hidden rounded-xl"
          style={{
            background: 'linear-gradient(180deg, #78350f 0%, #92400e 50%, #78350f 100%)',
            border: '2px solid #92400e'
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Linhas da rua */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-300" />
            <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gray-300" />
          </div>

          {/* Gol do jogador (baixo) */}
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            style={{
              width: GOAL_WIDTH,
              height: GOAL_HEIGHT,
              background: 'rgba(34, 197, 94, 0.7)',
              border: '2px solid rgba(34, 197, 94, 0.8)',
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            <span className="absolute top-1 left-1/2 transform -translate-x-1/2 text-lg">🥅</span>
          </div>

          {/* Gol do adversário (topo) */}
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
            style={{
              width: GOAL_WIDTH,
              height: GOAL_HEIGHT,
              background: 'rgba(239, 68, 68, 0.7)',
              border: '2px solid rgba(239, 68, 68, 0.8)',
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
          >
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-lg">⚽</span>
          </div>

          {/* Obstáculos */}
          {obstaclePositions.map(obs => (
            <div
              key={obs.id}
              className="absolute"
              style={{
                left: obs.x,
                top: obs.y,
                transform: 'translate(-50%, -50%)',
                fontSize: 28
              }}
            >
              {obs.type.emoji}
            </div>
          ))}

          {/* Jogador */}
          <div
            className="absolute"
            style={{
              left: playerPos.x,
              top: playerPos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: PLAYER_SIZE * 2,
                height: PLAYER_SIZE * 2,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20
              }}
            >
              {selectedBall.emoji}
            </div>
          </div>

          {/* Marcador/Bot */}
          <div
            className="absolute"
            style={{
              left: botPos.x,
              top: botPos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: PLAYER_SIZE * 2,
                height: PLAYER_SIZE * 2,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20
              }}
            >
              😤
            </div>
          </div>
        </div>

        {/* D-pad Mobile */}
        <div className="grid grid-cols-3 gap-1 w-full max-w-xs mx-auto">
          <div></div>
          <button
            onTouchStart={() => { velocityRef.current = { x: 0, y: -1 }; setVelocity({ x: 0, y: -1 }); }}
            onTouchEnd={() => { velocityRef.current = { x: 0, y: 0 }; setVelocity({ x: 0, y: 0 }); }}
            className="p-2 rounded-lg bg-amber-100 text-xl"
          >
            ⬆️
          </button>
          <div></div>
          <button
            onTouchStart={() => { velocityRef.current = { x: -1, y: 0 }; setVelocity({ x: -1, y: 0 }); }}
            onTouchEnd={() => { velocityRef.current = { x: 0, y: 0 }; setVelocity({ x: 0, y: 0 }); }}
            className="p-2 rounded-lg bg-amber-100 text-xl"
          >
            ⬅️
          </button>
          <div className="p-2 rounded-lg bg-amber-50 flex items-center justify-center">
            <div className="w-3 h-3 bg-amber-300 rounded-full" />
          </div>
          <button
            onTouchStart={() => { velocityRef.current = { x: 1, y: 0 }; setVelocity({ x: 1, y: 0 }); }}
            onTouchEnd={() => { velocityRef.current = { x: 0, y: 0 }; setVelocity({ x: 0, y: 0 }); }}
            className="p-2 rounded-lg bg-amber-100 text-xl"
          >
            ➡️
          </button>
          <div></div>
          <button
            onTouchStart={() => { velocityRef.current = { x: 0, y: 1 }; setVelocity({ x: 0, y: 1 }); }}
            onTouchEnd={() => { velocityRef.current = { x: 0, y: 0 }; setVelocity({ x: 0, y: 0 }); }}
            className="p-2 rounded-lg bg-amber-100 text-xl"
          >
            ⬇️
          </button>
          <div></div>
        </div>

        <p className="text-xs text-gray-400 text-center">{config.desc}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO - RESULTADO
  // ═══════════════════════════════════════════════════════════════════════════

  if (phase === 'result') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-2">{gameOver ? '😢' : '🏆'}</div>
          <h2 className="font-heading font-black text-2xl text-primary mb-1">
            {gameOver ? 'Fim de Jogo!' : 'Parabéns!'}
          </h2>
          <p className="text-gray-500">
            {gameOver ? 'O marcador te pegou!' : `Nível ${level + 1} completo!`}
          </p>
        </motion.div>

        <div className="bg-white rounded-xl p-4 w-full max-w-xs shadow-lg">
          <div className="text-4xl font-bold text-primary text-center">{score}</div>
          <div className="text-sm text-gray-500 text-center mb-2">pontos</div>
          <div className="flex justify-around text-sm">
            <div className="text-center">
              <div className="font-bold">{level + 1}</div>
              <div className="text-xs text-gray-400">Nível</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{goals}</div>
              <div className="text-xs text-gray-400">Gols</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full max-w-xs">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setPhase('menu')}
            className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg"
          >
            Menu
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="flex-1 py-2 bg-gradient-to-r from-primary to-green-500 text-white font-bold rounded-lg"
          >
            Jogar Novamente
          </motion.button>
        </div>
      </div>
    );
  }

  return null;
}
