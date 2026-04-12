import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Volume2, VolumeX, Users, User } from 'lucide-react';
import { audio } from '@/lib/audioEngine';
import { bgMusic } from '@/lib/trainingMusic';

// ═══════════════════════════════════════════════════════════════════════════
// BOBINHO - Passe a bola antes que te peguem!
// Fases: 2v1, 3v1, 4v1, 5v2 (jogadores vs bobinhos)
// Opção: ser jogador ou ser o bobinho
// ═══════════════════════════════════════════════════════════════════════════

const FIELD_W = 360;
const FIELD_H = 480;
const PLAYER_R = 20;
const BOBINHO_R = 22;
const BALL_R = 10;

const PHASES = [
  { id: 1, players: 2, bobinhos: 1, label: '2 vs 1', time: 60, bobSpeed: 0.6, aiSpeed: 0.8, desc: 'Dois jogadores — bem fácil!' },
  { id: 2, players: 3, bobinhos: 1, label: '3 vs 1', time: 70, bobSpeed: 0.9, aiSpeed: 1.0, desc: 'Três jogadores — tranquilo!' },
  { id: 3, players: 4, bobinhos: 1, label: '4 vs 1', time: 80, bobSpeed: 1.2, aiSpeed: 1.2, desc: 'Quatro — o bobinho tá mais rápido!' },
  { id: 4, players: 5, bobinhos: 2, label: '5 vs 2', time: 90, bobSpeed: 1.5, aiSpeed: 1.4, desc: 'Cinco jogadores, 2 bobinhos — caos!' },
];

const PLAYER_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];
const BOBINHO_COLOR = '#ef4444';

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

export default function BobinhoGame() {
  const [phase, setPhase] = useState('menu'); // menu | playing | caught | win
  const [currentPhase, setCurrentPhase] = useState(0);
  const [role, setRole] = useState('player'); // 'player' | 'bobinho'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [passes, setPasses] = useState(0);
  const [passTarget, setPassTarget] = useState(null);
  
  // Posições
  const [players, setPlayers] = useState([]);
  const [bobinhos, setBobinhos] = useState([]);
  const [ballHolder, setBallHolder] = useState(0); // índice do jogador com a bola
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  
  // Controles
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [joystick, setJoystick] = useState({ x: 0, y: 0, active: false });
  const joyRef = useRef(null);
  const rafRef = useRef(null);

  const config = PHASES[currentPhase];

  const playSound = (sound) => {
    if (soundEnabled) audio.play?.(sound);
  };

  // Inicializar posições
  const initPositions = useCallback(() => {
    const newPlayers = [];
    const centerX = FIELD_W / 2;
    const centerY = FIELD_H / 2;
    
    // Jogadores em formação circular
    for (let i = 0; i < config.players; i++) {
      const angle = (i / config.players) * Math.PI * 2 - Math.PI / 2;
      newPlayers.push({
        id: i,
        x: centerX + Math.cos(angle) * 80,
        y: centerY + Math.sin(angle) * 80,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      });
    }
    
    // Bobinhos fora do círculo
    const newBobinhos = [];
    for (let i = 0; i < config.bobinhos; i++) {
      const angle = (i / config.bobinhos) * Math.PI * 2;
      newBobinhos.push({
        id: i,
        x: centerX + Math.cos(angle) * 150,
        y: centerY + Math.sin(angle) * 150,
        vx: 0,
        vy: 0,
      });
    }
    
    setPlayers(newPlayers);
    setBobinhos(newBobinhos);
    setBallHolder(0);
    setBallPos({ x: newPlayers[0].x, y: newPlayers[0].y });
    setSelectedPlayer(0); // sempre controla o índice 0 (jogador ou bobinho)
    setPasses(0);
    setTimeLeft(config.time);
  }, [config, role]);

  // Iniciar fase
  const startPhase = useCallback((phaseIdx) => {
    setCurrentPhase(phaseIdx);
    initPositions();
    setPhase('playing');
    playSound('start');
    try { bgMusic.play('sport'); } catch {}
  }, [initPositions]);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') { cancelAnimationFrame(rafRef.current); return; }

    const loop = () => {
      // Mover jogador selecionado
      if (role === 'player' && joystick.active) {
        setPlayers(prev => {
          const updated = [...prev];
          const p = updated[selectedPlayer];
          const speed = 3;
          p.x = clamp(p.x + joystick.x * speed, PLAYER_R, FIELD_W - PLAYER_R);
          p.y = clamp(p.y + joystick.y * speed, PLAYER_R, FIELD_H - PLAYER_R);
          
          // Se tem a bola, move ela também
          if (ballHolder === selectedPlayer) {
            setBallPos({ x: p.x, y: p.y });
          }
          return updated;
        });
      }

      // Mover bobinho selecionado (quando role é bobinho)
      if (role === 'bobinho' && joystick.active) {
        setBobinhos(prev => {
          const updated = [...prev];
          const b = { ...updated[0] };
          const speed = 3;
          b.x = clamp(b.x + joystick.x * speed, BOBINHO_R, FIELD_W - BOBINHO_R);
          b.y = clamp(b.y + joystick.y * speed, BOBINHO_R, FIELD_H - BOBINHO_R);
          updated[0] = b;
          return updated;
        });
      }

      // IA dos outros jogadores (se você é um jogador)
      if (role === 'player') {
        setPlayers(prev => {
          const updated = [...prev];
          updated.forEach((p, i) => {
            if (i !== selectedPlayer && i !== ballHolder) {
              const nearestBobinho = bobinhos.reduce((closest, b) => {
                const d = dist(p, b);
                return d < dist(p, closest) ? b : closest;
              }, bobinhos[0]);
              const dx = p.x - nearestBobinho.x;
              const dy = p.y - nearestBobinho.y;
              const d = Math.sqrt(dx * dx + dy * dy) || 1;
              const speed = config.aiSpeed;
              if (dist(p, nearestBobinho) < 120) {
                p.x = clamp(p.x + (dx / d) * speed, PLAYER_R, FIELD_W - PLAYER_R);
                p.y = clamp(p.y + (dy / d) * speed, PLAYER_R, FIELD_H - PLAYER_R);
              }
            }
          });
          return updated;
        });
      }

      // IA do bobinho
      setBobinhos(prev => {
        return prev.map((b, idx) => {
          // Quando role é bobinho, o índice 0 é controlado pelo jogador (joystick)
          if (role === 'bobinho' && idx === 0) return b;
          const target = players[ballHolder];
          const dx = target.x - b.x;
          const dy = target.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const speed = config.bobSpeed;
          return {
            ...b,
            x: clamp(b.x + (dx / d) * speed, BOBINHO_R, FIELD_W - BOBINHO_R),
            y: clamp(b.y + (dy / d) * speed, BOBINHO_R, FIELD_H - BOBINHO_R),
          };
        });
      });

      // Verificar se bobinho pegou a bola
      const ballHolderPos = players[ballHolder];
      bobinhos.forEach(b => {
        if (dist(ballHolderPos, b) < PLAYER_R + BOBINHO_R) {
          setPhase('caught');
          playSound('lose');
        }
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, joystick, players, bobinhos, ballHolder, selectedPlayer, role]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase('win');
          playSound('win');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Auto-passe inteligente dos bots
  useEffect(() => {
    if (phase !== 'playing') return;
    // O jogador humano passa manualmente; bots passam automaticamente
    if (role === 'player' && ballHolder === selectedPlayer) return;

    // Bot com a bola: passar para o jogador mais seguro após 1.5s
    const t = setTimeout(() => {
      if (phase !== 'playing') return;
      if (players.length === 0 || bobinhos.length === 0) return;

      // Encontrar jogador mais seguro (mais longe de todos os bobinhos)
      let bestTarget = -1;
      let bestDist = -1;
      players.forEach((p, i) => {
        if (i === ballHolder) return;
        const minBobDist = bobinhos.reduce((minD, b) => Math.min(minD, dist(p, b)), Infinity);
        if (minBobDist > bestDist) {
          bestDist = minBobDist;
          bestTarget = i;
        }
      });

      if (bestTarget >= 0) {
        setBallHolder(bestTarget);
        setBallPos({ x: players[bestTarget].x, y: players[bestTarget].y });
        setPasses(prev => prev + 1);
      }
    }, 1500 + Math.random() * 500);

    return () => clearTimeout(t);
  }, [ballHolder, phase]);

  // Passar a bola
  const passBall = (targetIdx) => {
    if (ballHolder !== selectedPlayer || targetIdx === ballHolder) return;
    
    setBallHolder(targetIdx);
    setBallPos({ x: players[targetIdx].x, y: players[targetIdx].y });
    setPasses(p => p + 1);
    playSound('pass');
    
    // Verificar vitória por passes
    if (passes + 1 >= config.players * 2) {
      setPhase('win');
      playSound('win');
    }
  };

  // Joystick handlers
  const handleJoyStart = (clientX, clientY) => {
    if (!joyRef.current) return;
    const rect = joyRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setJoystick({ x: 0, y: 0, active: true, centerX, centerY });
  };

  const handleJoyMove = (clientX, clientY) => {
    if (!joystick.active) return;
    const maxDist = 35;
    const dx = clientX - joystick.centerX;
    const dy = clientY - joystick.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const scale = Math.min(distance, maxDist) / maxDist;
    const angle = Math.atan2(dy, dx);
    setJoystick(prev => ({
      ...prev,
      x: Math.cos(angle) * scale,
      y: Math.sin(angle) * scale,
    }));
  };

  const handleJoyEnd = () => {
    setJoystick({ x: 0, y: 0, active: false, centerX: 0, centerY: 0 });
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
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: [0, 15, -15, 0] }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="text-6xl mb-2"
          >🏃‍♀️</motion.div>
          <h1 className="font-heading font-black text-3xl text-primary mb-1">Bobinho</h1>
          <p className="text-gray-500 text-sm px-8 text-center">
            Passe a bola entre os jogadores antes que o bobinho te pegue!
          </p>
        </motion.div>

        {/* Seleção de papel */}
        <div className="w-full max-w-xs">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Escolha seu papel</p>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole('player')}
              className={`flex-1 py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                role === 'player' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Users className="w-8 h-8 text-blue-500" />
              <span className="font-bold text-sm">Jogador</span>
              <span className="text-[10px] text-gray-500">Passe a bola</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole('bobinho')}
              className={`flex-1 py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                role === 'bobinho' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <User className="w-8 h-8 text-red-500" />
              <span className="font-bold text-sm">Bobinho</span>
              <span className="text-[10px] text-gray-500">Pegue a bola</span>
            </motion.button>
          </div>
        </div>

        {/* Fases */}
        <div className="w-full max-w-xs">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Fase</p>
          <div className="grid grid-cols-2 gap-2">
            {PHASES.map((p, i) => (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => startPhase(i)}
                className="p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-primary transition-all text-left"
              >
                <span className="font-bold text-sm block">{p.label}</span>
                <span className="text-[10px] text-gray-500">{p.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Resultado
  if (phase === 'caught' || phase === 'win') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-center"
        >
          <div className="text-7xl mb-4">{phase === 'win' ? '🏆' : '😅'}</div>
          <h2 className="font-heading font-black text-3xl text-primary mb-2">
            {phase === 'win' ? 'Vitória!' : 'Pegaram!'}
          </h2>
          <p className="text-gray-500">
            {phase === 'win' 
              ? `Você completou ${config.label}!` 
              : 'O bobinho pegou a bola!'}
          </p>
          <div className="mt-4 text-4xl font-bold text-primary">{passes} passes</div>
        </motion.div>

        <div className="flex gap-3 w-full max-w-xs">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setPhase('menu')}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
          >
            Menu
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => startPhase(currentPhase)}
            className="flex-1 py-3 bg-gradient-to-r from-primary to-green-500 text-white font-bold rounded-xl shadow-lg"
          >
            Jogar Novamente
          </motion.button>
          {phase === 'win' && currentPhase < PHASES.length - 1 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => startPhase(currentPhase + 1)}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-xl shadow-lg"
            >
              Próxima →
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // Jogo
  return (
    <div className="flex flex-col items-center gap-3 p-2">
      {/* HUD */}
      <div className="flex justify-between items-center w-full max-w-sm px-2">
        <div className="text-center">
          <div className="text-xs text-gray-500">Fase</div>
          <div className="font-bold text-primary">{config.label}</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500">Passes</div>
          <motion.div 
            key={passes}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black text-primary"
          >
            {passes}
          </motion.div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500">Tempo</div>
          <div className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-500' : 'text-primary'}`}>
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
          background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 100%)'
        }}
      >
        {/* Linhas do campo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white" />
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white" />
        </div>

        {/* Jogadores */}
        {players.map((p, i) => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{ 
              left: p.x - PLAYER_R, 
              top: p.y - PLAYER_R,
              zIndex: ballHolder === i ? 20 : 10
            }}
            animate={{ scale: selectedPlayer === i && role === 'player' ? 1.15 : 1 }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-lg border-2 border-white"
              style={{ background: p.color }}
              onClick={() => role === 'player' && ballHolder === selectedPlayer && passBall(i)}
            >
              {ballHolder === i ? '⚽' : i + 1}
            </div>
            {ballHolder === i && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"
              />
            )}
          </motion.div>
        ))}

        {/* Bobinhos */}
        {bobinhos.map((b, i) => (
          <motion.div
            key={b.id}
            className="absolute z-15"
            style={{ left: b.x - BOBINHO_R, top: b.y - BOBINHO_R }}
            animate={{ 
              scale: dist(b, players[ballHolder]) < 60 ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white"
              style={{ 
                background: BOBINHO_COLOR,
                boxShadow: dist(b, players[ballHolder]) < 60 
                  ? '0 0 20px rgba(239, 68, 68, 0.8)' 
                  : '0 4px 10px rgba(0,0,0,0.3)',
              }}
            >
              😤
            </div>
          </motion.div>
        ))}

        {/* Botões de passe (visíveis quando tem a bola) */}
        {role === 'player' && ballHolder === selectedPlayer && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
            {players.map((p, i) => (
              i !== selectedPlayer && (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => passBall(i)}
                  className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center font-bold text-sm"
                  style={{ color: p.color }}
                >
                  {i + 1}
                </motion.button>
              )
            ))}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        {(role === 'player' || role === 'bobinho') ? (
          <>
            <div
              ref={joyRef}
              className="relative w-24 h-24 rounded-full bg-gray-200/60 border-2 border-gray-300 shadow-inner"
              onTouchStart={(e) => { e.preventDefault(); handleJoyStart(e.touches[0].clientX, e.touches[0].clientY); }}
              onTouchMove={(e) => { e.preventDefault(); handleJoyMove(e.touches[0].clientX, e.touches[0].clientY); }}
              onTouchEnd={(e) => { e.preventDefault(); handleJoyEnd(); }}
              onMouseDown={(e) => handleJoyStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleJoyMove(e.clientX, e.clientY)}
              onMouseUp={handleJoyEnd}
              onMouseLeave={handleJoyEnd}
            >
              <motion.div
                className={`absolute w-10 h-10 rounded-full shadow-lg border-2 border-white ${role === 'bobinho' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-primary to-green-600'}`}
                style={{ left: '50%', top: '50%' }}
                animate={{
                  x: joystick.x * 25 - 20,
                  y: joystick.y * 25 - 20,
                  scale: joystick.active ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </div>
            <div className="flex-1 text-center">
              {role === 'player' ? (
                <p className="text-xs text-gray-500">
                  {ballHolder === selectedPlayer 
                    ? 'Você tem a bola! Toque nos números para passar' 
                    : 'Mova-se com o joystick'}
                </p>
              ) : (
                <div>
                  <p className="text-sm font-bold text-red-500">Você é o Bobinho!</p>
                  <p className="text-xs text-gray-500">Use o joystick para pegar a bola!</p>
                </div>
              )}
            </div>
          </>
        ) : null}
        
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

      {role === 'player' && phase === 'playing' && ballHolder === selectedPlayer && (
        <div className="flex gap-2 flex-wrap justify-center w-full max-w-sm">
          {players.map((p, i) => i !== selectedPlayer && (
            <motion.button key={i} whileTap={{ scale: 0.9 }}
              onClick={() => passBall(i)}
              className="px-4 py-2 rounded-xl font-bold text-xs text-white shadow-lg"
              style={{ background: p.color }}>
              Passar →{i + 1}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
