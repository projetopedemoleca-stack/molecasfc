import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Volume2, VolumeX, Target, Shield } from 'lucide-react';
import { audio } from '@/lib/audioEngine';

// ═══════════════════════════════════════════════════════════════════════════
// GOL A GOL - 1v1 Alternado (Melhorado)
// Estilo: Jogador vs Bot, alternam chutes e defesas
// Controles melhorados: joystick para mirar + botão de chute
// ═══════════════════════════════════════════════════════════════════════════

const FIELD_W = 360;
const FIELD_H = 480;
const GOAL_W  = 220; // gol maior
const GOAL_H  = 100;
const PLAYER_R = 28;
const BALL_R   = 12;

// Progressão automática de nível
function getLevelConfig(lvl) {
  return {
    label: `Nível ${lvl + 1}`,
    rounds: 3 + Math.floor(lvl / 2),
    keeperSpeed: 1.2 + lvl * 0.5,
    botAccuracy: 0.2 + lvl * 0.08,
  };
}
const MAX_LEVEL = 8;

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

export default function GolAGolGame() {
  const [phase, setPhase] = useState('starting');
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState({ player: 0, bot: 0 });
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState('player');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [ballPos, setBallPos] = useState({ x: FIELD_W / 2, y: FIELD_H - 100 });
  const [keeperPos, setKeeperPos] = useState({ x: FIELD_W / 2, y: 60 });
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2); // Mirando para cima
  const [aimPower, setAimPower] = useState(50); // 0-100
  const [isAiming, setIsAiming] = useState(false);
  const [showGoalEffect, setShowGoalEffect] = useState(false);
  const [showSaveEffect, setShowSaveEffect] = useState(false);
  const [ballTrail, setBallTrail] = useState([]);
  const [defenderTouch, setDefenderTouch] = useState({ x: null, y: null });

  const config = getLevelConfig(level);
  const rafRef = useRef(null);
  const aimRef = useRef(null);
  const keeperPosRef = useRef({ x: FIELD_W / 2, y: 60 });

  const playSound = (sound) => {
    if (soundEnabled) audio.play?.(sound);
  };

  const initLevel = useCallback((lvl = 0) => {
    setLevel(lvl);
    setScore({ player: 0, bot: 0 });
    setRound(1);
    setTurn('player');
    resetPositions('player');
    setPhase('playing');
    setAimAngle(-Math.PI / 2);
    setAimPower(50);
  }, []);

  useEffect(() => { initLevel(0); }, []);

  const resetPositions = (who) => {
    setBallPos({ x: FIELD_W / 2, y: who === 'player' ? FIELD_H - 100 : 100 });
    setKeeperPos({ x: FIELD_W / 2, y: who === 'player' ? 60 : FIELD_H - 60 });
    keeperPosRef.current = { x: FIELD_W / 2, y: who === 'player' ? 60 : FIELD_H - 60 };
    setAimAngle(who === 'player' ? -Math.PI / 2 : Math.PI / 2);
    setAimPower(50);
    setBallTrail([]);
    setDefenderTouch({ x: null, y: null });
  };

  // Bot joga
  useEffect(() => {
    if (phase !== 'playing' || turn !== 'bot') return;

    const timeout = setTimeout(() => {
      const targetX = 50 + Math.random() * (FIELD_W - 100);
      const targetY = FIELD_H - 80;
      const dx = targetX - ballPos.x;
      const dy = targetY - ballPos.y;
      const power = 8 + Math.random() * 4;
      shootBall(dx, dy, power, 'bot');
    }, 1000 + Math.random() * 1000);

    return () => clearTimeout(timeout);
  }, [phase, turn, ballPos]);

  const shootBall = (dx, dy, power, who) => {
    setPhase('shooting');
    playSound('kick');

    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * power;
    const vy = Math.sin(angle) * power;

    let pos = { ...ballPos };
    let trail = [pos];
    let frame = 0;

    const animate = () => {
      frame++;
      pos = { x: pos.x + vx, y: pos.y + vy };

      if (frame % 2 === 0) trail.push({ ...pos });
      setBallTrail([...trail]);

      // Goleira se move para defender
      setKeeperPos(prev => {
        const targetX = who === 'player' ? pos.x : FIELD_W / 2;
        const speed = config.keeperSpeed;
        const diff = targetX - prev.x;
        const next = {
          x: clamp(prev.x + Math.sign(diff) * Math.min(Math.abs(diff), speed), GOAL_W / 2, FIELD_W - GOAL_W / 2),
          y: prev.y,
        };
        keeperPosRef.current = next;
        return next;
      });

      const inGoalY = who === 'player' ? pos.y < GOAL_H + 20 : pos.y > FIELD_H - GOAL_H - 20;
      const inGoalX = Math.abs(pos.x - FIELD_W / 2) < GOAL_W / 2;

      if (inGoalY && inGoalX) {
        const keeperDist = dist(pos, keeperPosRef.current);
        if (keeperDist < PLAYER_R + BALL_R - 5) {
          setShowSaveEffect(true);
          playSound('save');
          setTimeout(() => {
            setShowSaveEffect(false);
            nextTurn();
          }, 1500);
          return;
        }

        setShowGoalEffect(true);
        playSound('goal');

        const newScore = { ...score };
        if (who === 'player') newScore.player++;
        else newScore.bot++;
        setScore(newScore);

        setTimeout(() => {
          setShowGoalEffect(false);

          if (newScore.player >= Math.ceil(config.rounds / 2) ||
              newScore.bot >= Math.ceil(config.rounds / 2) ||
              round >= config.rounds) {
            if (newScore.player > newScore.bot) {
              const nextLvl = level + 1;
              if (nextLvl >= MAX_LEVEL) {
                setPhase('victory');
                playSound('victory');
              } else {
                initLevel(nextLvl);
              }
            } else {
              setPhase('result');
              playSound('gameover');
            }
          } else {
            setRound(r => r + 1);
            nextTurn();
          }
        }, 1500);
        return;
      }

      if (pos.y < 0 || pos.y > FIELD_H || pos.x < 0 || pos.x > FIELD_W) {
        setTimeout(() => nextTurn(), 500);
        return;
      }

      setBallPos(pos);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  const nextTurn = () => {
    const next = turn === 'player' ? 'bot' : 'player';
    setTurn(next);
    resetPositions(next);
    setPhase('playing');
  };

  // Controles de mira com joystick
  const handleAimStart = (clientX, clientY) => {
    if (phase !== 'playing' || turn !== 'player') return;
    setIsAiming(true);
    updateAim(clientX, clientY);
  };

  const handleAimMove = (clientX, clientY) => {
    if (!isAiming || phase !== 'playing' || turn !== 'player') return;
    updateAim(clientX, clientY);
  };

  const updateAim = (clientX, clientY) => {
    if (!aimRef.current) return;
    const rect = aimRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 50);
    const power = (distance / 50) * 100;
    
    setAimAngle(angle);
    setAimPower(power);
  };

  const handleAimEnd = () => {
    setIsAiming(false);
  };

  const doShoot = () => {
    if (phase !== 'playing' || turn !== 'player') return;
    const power = 6 + (aimPower / 100) * 8; // 6-14
    shootBall(Math.cos(aimAngle) * power, Math.sin(aimAngle) * power, power, 'player');
  };

  // Defesa - mover goleiro
  const handleDefendMove = (clientX) => {
    if (phase !== 'shooting' || turn !== 'bot') return;
    const rect = document.getElementById('game-field')?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    setKeeperPos(prev => ({
      ...prev,
      x: clamp(x, GOAL_W / 2, FIELD_W - GOAL_W / 2),
    }));
  };

  // Touch handlers para defesa
  const handleTouchDefend = (e) => {
    const t = e.touches[0];
    handleDefendMove(t.clientX);
  };

  if (phase === 'starting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1 }} className="text-6xl">⚽</motion.div>
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    );
  }

  if (phase === 'result' || phase === 'victory') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="text-center">
          <div className="text-7xl mb-4">{phase === 'victory' ? '🏆' : score.player > score.bot ? '🥈' : '😢'}</div>
          <h2 className="font-heading font-black text-3xl text-primary mb-2">{phase === 'victory' ? 'Campeão!' : score.player > score.bot ? 'Vitória!' : 'Derrota'}</h2>
          <div className="text-4xl font-bold text-gray-700">{score.player} x {score.bot}</div>
        </motion.div>
        <div className="flex gap-3 w-full max-w-xs">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => initLevel(0)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">Recomeçar</motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => initLevel(0)} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg">Novamente</motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      {/* Placar */}
      <div className="flex items-center justify-between w-full max-w-sm px-2">
        <div className="text-center">
          <div className="text-xs text-gray-500">Você</div>
          <motion.div key={score.player} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-3xl font-black text-primary">{score.player}</motion.div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">{config.label}</div>
          <div className="text-sm font-bold">Rodada {round}/{config.rounds}</div>
          <div className={`text-xs font-bold ${turn === 'player' ? 'text-primary' : 'text-red-500'}`}>{turn === 'player' ? '⚽ Sua vez!' : '🧤 Defenda!'}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Bot</div>
          <motion.div key={score.bot} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-3xl font-black text-red-500">{score.bot}</motion.div>
        </div>
      </div>

      {/* Campo */}
      <div id="game-field" className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ width: FIELD_W, height: FIELD_H, background: 'linear-gradient(180deg, #2d2d2d 0%, #3d3d3d 50%, #2d2d2d 100%)' }} onTouchMove={handleTouchDefend} onMouseMove={(e) => turn === 'bot' && handleDefendMove(e.clientX)}>
        <AnimatePresence>
          {showGoalEffect && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-green-500/50 z-50 flex items-center justify-center">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="text-6xl font-black text-white drop-shadow-lg">GOOOOL! ⚽</motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showSaveEffect && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-yellow-500/40 z-50 flex items-center justify-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl font-black text-white drop-shadow-lg">DEFENDEU! 🧤</motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textura de asfalto */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => <div key={i} className="absolute left-0 right-0 h-px bg-gray-400" style={{ top: `${i * 10}%` }} />)}
          {[0.2, 0.4, 0.6, 0.8].map(p => <div key={p} className="absolute top-0 bottom-0 w-px bg-gray-400" style={{ left: `${p * 100}%` }} />)}
        </div>

        {/* Gol de cima */}
        <motion.div className="absolute top-2 left-1/2 transform -translate-x-1/2" style={{ width: GOAL_W, height: GOAL_H, background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)', border: '3px solid rgba(255,255,255,0.5)', borderRadius: '0 0 10px 10px', borderTop: 'none' }}>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 flex items-center justify-center text-4xl">🥅</motion.div>
        </motion.div>

        {/* Gol de baixo */}
        <motion.div className="absolute bottom-2 left-1/2 transform -translate-x-1/2" style={{ width: GOAL_W, height: GOAL_H, background: 'linear-gradient(0deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)', border: '3px solid rgba(255,255,255,0.5)', borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 flex items-center justify-center text-4xl">🥅</motion.div>
        </motion.div>

        {/* Linha do meio */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white/20" />

        {/* Indicador de mira (quando jogador) */}
        {turn === 'player' && phase === 'playing' && (
          <div className="absolute pointer-events-none" style={{ left: ballPos.x, top: ballPos.y }}>
            {/* Linha de mira */}
            <div className="absolute origin-left" style={{ 
              width: 80, 
              height: 3, 
              background: 'linear-gradient(90deg, rgba(59,130,246,0.8), rgba(59,130,246,0))',
              transform: `rotate(${aimAngle}rad)`,
              borderRadius: '2px'
            }} />
            {/* Arco de força */}
            <svg className="absolute" style={{ left: -40, top: -40, width: 80, height: 80, transform: `rotate(${aimAngle}rad)` }}>
              <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="3" 
                strokeDasharray={`${aimPower * 2.2} 220`} 
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Goleira */}
        <motion.div className="absolute z-10" style={{ left: keeperPos.x - PLAYER_R, top: keeperPos.y - PLAYER_R }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white" style={{ background: turn === 'player' ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>{turn === 'player' ? '👩' : '👧'}</div>
        </motion.div>

        {/* Bola */}
        <motion.div className="absolute z-20" style={{ left: ballPos.x - BALL_R, top: ballPos.y - BALL_R }} animate={{ scale: 1 }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-lg" style={{ background: 'white', border: '2px solid #e5e7eb' }}>⚽</div>
        </motion.div>

        {/* Rastro da bola */}
        {ballTrail.map((pos, i) => <div key={i} className="absolute w-2 h-2 rounded-full bg-white/30" style={{ left: pos.x - 4, top: pos.y - 4, opacity: i / ballTrail.length }} />)}

        {/* Indicadores de lado */}
        <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }} className={`text-2xl ${turn === 'player' ? 'opacity-100' : 'opacity-30'}`}>▶️</motion.div>
        </div>
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
          <motion.div animate={{ x: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity }} className={`text-2xl ${turn === 'bot' ? 'opacity-100' : 'opacity-30'}`}>◀️</motion.div>
        </div>
      </div>

      {/* Controles */}
      {turn === 'player' && phase === 'playing' ? (
        <div className="flex items-center gap-4 w-full max-w-sm">
          {/* Joystick de mira */}
          <div
            ref={aimRef}
            className="relative w-24 h-24 rounded-full bg-gray-200/60 border-2 border-gray-300 shadow-inner"
            onTouchStart={(e) => { e.preventDefault(); handleAimStart(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchMove={(e) => { e.preventDefault(); handleAimMove(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchEnd={(e) => { e.preventDefault(); handleAimEnd(); }}
            onMouseDown={(e) => handleAimStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleAimMove(e.clientX, e.clientY)}
            onMouseUp={handleAimEnd}
            onMouseLeave={handleAimEnd}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400" />
            </div>
            <motion.div
              className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-2 border-white"
              style={{ left: '50%', top: '50%' }}
              animate={{
                x: Math.cos(aimAngle) * (aimPower / 100 * 25) - 20,
                y: Math.sin(aimAngle) * (aimPower / 100 * 25) - 20,
                scale: isAiming ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Target className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 mb-2">Arraste para mirar</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${aimPower}%` }} />
            </div>
          </div>

          {/* Botão de chute */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={doShoot}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg border-4 border-white flex flex-col items-center justify-center"
          >
            <span className="text-2xl">⚽</span>
            <span className="text-[10px] font-bold text-white">CHUTAR</span>
          </motion.button>
        </div>
      ) : turn === 'bot' && phase === 'shooting' ? (
        <div className="flex flex-col items-center gap-2 w-full max-w-sm">
          <p className="text-xs text-gray-500 font-bold">⬅️ Arraste para defender ➡️</p>
          <div
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-yellow-400/30 to-yellow-600/30 border-2 border-yellow-400 flex items-center justify-center cursor-ew-resize select-none relative overflow-hidden"
            onTouchStart={(e) => { e.preventDefault(); handleDefendMove(e.touches[0].clientX); }}
            onTouchMove={(e) => { e.preventDefault(); handleDefendMove(e.touches[0].clientX); }}
            onMouseDown={(e) => handleDefendMove(e.clientX)}
            onMouseMove={(e) => e.buttons === 1 && handleDefendMove(e.clientX)}
          >
            <motion.div animate={{ x: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-3xl">🧤</motion.div>
            <span className="text-xs text-yellow-700 font-bold ml-2">Deslize para defender!</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-500 text-center flex-1">Aguarde o bot jogar...</p>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
