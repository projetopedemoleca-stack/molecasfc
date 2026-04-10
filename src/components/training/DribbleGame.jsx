import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { bgMusic } from '@/lib/trainingMusic';
import { drawSticker, addSticker } from '@/lib/albumSystem.js';
import { useStickerToast } from '@/components/ui/StickerEarnedToast.jsx';

// ─── Configuração por nível ────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, label: 'Iniciante',   cones: 3, botSpeed: 0.012, playerSpeed: 0.022, timeLimit: 30, goal: 3 },
  { id: 2, label: 'Amadora',    cones: 4, botSpeed: 0.016, playerSpeed: 0.022, timeLimit: 28, goal: 4 },
  { id: 3, label: 'Juvenil',    cones: 5, botSpeed: 0.020, playerSpeed: 0.024, timeLimit: 26, goal: 5 },
  { id: 4, label: 'Sub-20',     cones: 5, botSpeed: 0.024, playerSpeed: 0.024, timeLimit: 24, goal: 6 },
  { id: 5, label: 'Profissional', cones: 6, botSpeed: 0.028, playerSpeed: 0.026, timeLimit: 22, goal: 7 },
  { id: 6, label: 'Seleção',    cones: 7, botSpeed: 0.032, playerSpeed: 0.026, timeLimit: 20, goal: 8 },
  { id: 7, label: 'Marta Mode', cones: 8, botSpeed: 0.038, playerSpeed: 0.028, timeLimit: 18, goal: 9 },
];

const FIELD_W = 320;
const FIELD_H = 480;
const PLAYER_R = 14;
const BOT_R = 14;
const CONE_R = 9;
const GOAL_Y = 40; // Y da linha de chegada
const START_Y = FIELD_H - 60;

// ─── Gera posições aleatórias dos cones (sem sobreposição) ───────────────────
function generateCones(count) {
  const cones = [];
  const margin = 40;
  let attempts = 0;
  while (cones.length < count && attempts < 200) {
    attempts++;
    const x = margin + Math.random() * (FIELD_W - margin * 2);
    const y = GOAL_Y + 60 + Math.random() * (START_Y - GOAL_Y - 120);
    const tooClose = cones.some(c => Math.hypot(c.x - x, c.y - y) < 60);
    if (!tooClose) cones.push({ x, y, id: cones.length });
  }
  return cones;
}

// ─── Campo SVG ─────────────────────────────────────────────────────────────────
function Field({ player, bot, cones, trail, particles, dodgedCones, combo, levelCfg }) {
  return (
    <svg
      viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
      width="100%"
      style={{ display: 'block', touchAction: 'none' }}
    >
      <defs>
        <linearGradient id="grass2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="50%" stopColor="#166534" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="botGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="playerGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id="botGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#ef4444" />
        </radialGradient>
      </defs>

      {/* Fundo */}
      <rect width={FIELD_W} height={FIELD_H} fill="url(#grass2)" />

      {/* Listras */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={i * (FIELD_W / 6)} y={0} width={FIELD_W / 6} height={FIELD_H}
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.07)' : 'transparent'} />
      ))}

      {/* Borda */}
      <rect x={4} y={4} width={FIELD_W - 8} height={FIELD_H - 8} fill="none"
        stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} rx={4} />

      {/* Linha de chegada */}
      <rect x={4} y={GOAL_Y - 20} width={FIELD_W - 8} height={28} fill="rgba(255,255,255,0.15)" rx={4} />
      {[...Array(16)].map((_, i) => (
        <rect key={i} x={4 + i * ((FIELD_W - 8) / 16)} y={GOAL_Y - 20}
          width={(FIELD_W - 8) / 32} height={28}
          fill={i % 2 === 0 ? 'rgba(255,255,255,0.25)' : 'transparent'} />
      ))}
      <text x={FIELD_W / 2} y={GOAL_Y - 2} textAnchor="middle"
        fontSize={13} fill="white" fontWeight="bold" fontFamily="sans-serif">
        🏁 CHEGADA
      </text>

      {/* Linha de largada */}
      <line x1={4} y1={START_Y + 20} x2={FIELD_W - 4} y2={START_Y + 20}
        stroke="rgba(255,255,255,0.25)" strokeWidth={1} strokeDasharray="8 4" />

      {/* Trilha da jogadora */}
      {trail.length > 1 && (
        <polyline
          points={trail.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="rgba(250,204,21,0.5)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Cones */}
      {cones.map(cone => {
        const dodged = dodgedCones.includes(cone.id);
        return (
          <g key={cone.id}>
            {dodged && (
              <circle cx={cone.x} cy={cone.y} r={CONE_R + 4}
                fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.5)" strokeWidth={1} />
            )}
            <text x={cone.x} y={cone.y + 5} textAnchor="middle" fontSize={dodged ? 14 : 18}
              opacity={dodged ? 0.35 : 1}>🔶</text>
          </g>
        );
      })}

      {/* Partículas de drible */}
      {particles.map(p => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} opacity={p.opacity} />
        </g>
      ))}

      {/* Bola (jogadora) */}
      <g filter="url(#glow2)">
        <circle cx={player.x} cy={player.y} r={PLAYER_R}
          fill="url(#playerGrad)" stroke="#fbbf24" strokeWidth={1.5} />
        <text x={player.x} y={player.y + 5} textAnchor="middle" fontSize={16}>⚽</text>
      </g>

      {/* Bot (marcadora) */}
      <g filter="url(#botGlow)">
        <circle cx={bot.x} cy={bot.y} r={BOT_R}
          fill="url(#botGrad)" stroke="#ef4444" strokeWidth={1.5} />
        <text x={bot.x} y={bot.y + 5} textAnchor="middle" fontSize={14}>👊</text>
      </g>

      {/* Linha de captura (distância bot-player) */}
      {(() => {
        const dist = Math.hypot(player.x - bot.x, player.y - bot.y);
        if (dist < 60) {
          const opacity = Math.max(0, (60 - dist) / 60) * 0.6;
          return (
            <line x1={player.x} y1={player.y} x2={bot.x} y2={bot.y}
              stroke={`rgba(239,68,68,${opacity})`} strokeWidth={2} strokeDasharray="4 3" />
          );
        }
        return null;
      })()}

      {/* Combo badge */}
      {combo >= 2 && (
        <g>
          <circle cx={player.x + 18} cy={player.y - 18} r={11}
            fill="#7c3aed" stroke="white" strokeWidth={1.5} />
          <text x={player.x + 18} y={player.y - 14} textAnchor="middle"
            fontSize={9} fill="white" fontWeight="bold" fontFamily="sans-serif">
            x{combo}
          </text>
        </g>
      )}
    </svg>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function DribbleGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);

  const { showToast, StickerToast } = useStickerToast();

  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro | playing | caught | win | lose
  const [score, setScore] = useState(0);       // dribles bem feitos neste nível
  const [totalScore, setTotalScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [cones, setCones] = useState([]);
  const [dodgedCones, setDodgedCones] = useState([]);
  const [trail, setTrail] = useState([]);
  const [particles, setParticles] = useState([]);
  const [wins, setWins] = useState(0);

  // Posições como refs (loop de animação)
  const playerRef = useRef({ x: FIELD_W / 2, y: START_Y });
  const botRef = useRef({ x: FIELD_W / 2 - 50, y: START_Y + 10 });
  const [playerPos, setPlayerPos] = useState({ x: FIELD_W / 2, y: START_Y });
  const [botPos, setBotPos] = useState({ x: FIELD_W / 2 - 50, y: START_Y + 10 });

  const rafRef = useRef(null);
  const phaseRef = useRef('intro');
  const scoreRef = useRef(0);
  const comboRef = useRef(0);

  const levelCfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

  // ─── Gerar partículas de drible ─────────────────────────────────────────────
  const spawnParticles = useCallback((x, y, color = '#fbbf24') => {
    const newP = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      r: 3 + Math.random() * 4,
      color,
      opacity: 0.8,
    }));
    setParticles(p => [...p, ...newP]);
    setTimeout(() => setParticles(p => p.filter(pp => !newP.find(np => np.id === pp.id))), 400);
  }, []);

  // ─── Iniciar rodada ──────────────────────────────────────────────────────────
  const startRound = useCallback(() => {
    const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
    playerRef.current = { x: FIELD_W / 2, y: START_Y };
    botRef.current = { x: FIELD_W / 2 - 50, y: START_Y + 30 };
    setPlayerPos({ x: FIELD_W / 2, y: START_Y });
    setBotPos({ x: FIELD_W / 2 - 50, y: START_Y + 30 });
    setCones(generateCones(cfg.cones));
    setDodgedCones([]);
    setTrail([{ x: FIELD_W / 2, y: START_Y }]);
    setParticles([]);
    setScore(0);
    setCombo(0);
    scoreRef.current = 0;
    comboRef.current = 0;
    setTimeLeft(cfg.timeLimit);
    phaseRef.current = 'playing';
    setPhase('playing');
  }, [levelIdx]);

  // ─── Loop de jogo ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
    let lastTime = null;
    let elapsed = 0;

    const loop = (timestamp) => {
      if (phaseRef.current !== 'playing') return;
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min(timestamp - lastTime, 50);
      lastTime = timestamp;
      elapsed += dt;

      const p = playerRef.current;
      const b = botRef.current;

      // Bot persegue jogadora
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 1) {
        const speed = cfg.botSpeed * dt * FIELD_W;
        const nx = b.x + (dx / dist) * speed;
        const ny = b.y + (dy / dist) * speed;
        botRef.current = { x: nx, y: ny };
        setBotPos({ x: nx, y: ny });
      }

      // Verificar colisão bot ↔ player
      if (dist < PLAYER_R + BOT_R - 2) {
        phaseRef.current = 'caught';
        setPhase('caught');
        cancelAnimationFrame(rafRef.current);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          if (phaseRef.current === 'playing') {
            phaseRef.current = 'lose';
            setPhase('lose');
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timer);
    };
  }, [phase, levelIdx]);

  // ─── Mover jogadora ──────────────────────────────────────────────────────────
  const movePlayer = useCallback((dir) => {
    if (phaseRef.current !== 'playing') return;

    const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
    const step = cfg.playerSpeed * FIELD_W * 16; // ~16ms de movimento
    const p = playerRef.current;

    let nx = p.x;
    let ny = p.y;

    if (dir === 'left')  nx = Math.max(PLAYER_R + 4, p.x - step * 1.4);
    if (dir === 'right') nx = Math.min(FIELD_W - PLAYER_R - 4, p.x + step * 1.4);
    if (dir === 'up')    ny = Math.max(PLAYER_R + 4, p.y - step * 1.6);

    playerRef.current = { x: nx, y: ny };
    setPlayerPos({ x: nx, y: ny });
    setTrail(t => [...t.slice(-18), { x: nx, y: ny }]);

    // Verificar cones driblados
    setCones(prev => {
      const newDodged = [];
      prev.forEach(cone => {
        const d = Math.hypot(cone.x - nx, cone.y - ny);
        if (d < CONE_R + PLAYER_R + 6) {
          // Passou perto do cone = dribble!
          setDodgedCones(dd => {
            if (!dd.includes(cone.id)) {
              newDodged.push(cone.id);
              const newCombo = comboRef.current + 1;
              comboRef.current = newCombo;
              setCombo(newCombo);
              const newScore = scoreRef.current + 1;
              scoreRef.current = newScore;
              setScore(newScore);
              setTotalScore(ts => ts + 1 + (newCombo > 1 ? 1 : 0));
              spawnParticles(cone.x, cone.y, newCombo >= 3 ? '#a855f7' : '#fbbf24');
            }
            return [...dd, ...newDodged.filter(id => !dd.includes(id))];
          });
        }
      });
      return prev;
    });

    // Verificar chegada
    if (ny <= GOAL_Y + 10) {
      phaseRef.current = 'win';
      setPhase('win');
      setWins(w => w + 1);

      // Figurinha ao vencer
      const rarity = scoreRef.current >= 6 ? 'epic' : scoreRef.current >= 4 ? 'rare' : comboRef.current >= 3 ? 'uncommon' : null;
      const def = drawSticker('minigame_dribble', rarity);
      const result = addSticker(def.id, 'minigame_dribble', true);
      if (result) showToast({ ...result, definition: def });
    }
  }, [levelIdx, spawnParticles, showToast]);

  // ─── Suporte a teclado ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  movePlayer('left');
      if (e.key === 'ArrowRight') movePlayer('right');
      if (e.key === 'ArrowUp' || e.key === ' ') movePlayer('up');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [movePlayer]);

  // ─── Suporte a swipe ─────────────────────────────────────────────────────────
  const touchStart = useRef(null);
  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 10) movePlayer(dx < 0 ? 'left' : 'right');
    } else {
      if (dy < -10) movePlayer('up');
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────────
  const timerColor = timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-orange-500' : 'text-green-600';

  // Tela de intro
  if (phase === 'intro') return (
    <div className="space-y-5">
      <div className="text-center">
        <motion.div className="text-6xl mb-2"
          animate={{ rotate: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          ⚽
        </motion.div>
        <h2 className="font-heading font-black text-2xl">Drible com Marcador</h2>
        <p className="text-muted-foreground text-sm mt-1">Avance com a bola e desvie da marcadora!</p>
      </div>

      {/* Instruções */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: '👈👉', label: 'Botões ← →\nou swipe' },
          { icon: '⬆️', label: 'Botão ↑\nou swipe up' },
          { icon: '🔶', label: 'Passe perto\ndos cones' },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border/30 rounded-2xl p-3 space-y-1">
            <div className="text-2xl">{item.icon}</div>
            <p className="text-xs text-muted-foreground leading-tight whitespace-pre-line">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Níveis */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase">Selecionar nível</p>
        <div className="grid grid-cols-4 gap-1.5">
          {LEVELS.map((lvl, i) => {
            const unlocked = i <= wins;
            return (
              <button key={i} disabled={!unlocked}
                onClick={() => { setLevelIdx(i); }}
                className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  levelIdx === i
                    ? 'bg-primary text-primary-foreground border-primary'
                    : unlocked
                    ? 'bg-card border-border/30 hover:border-primary/50'
                    : 'opacity-30 cursor-not-allowed border-border/20 bg-muted/20'
                }`}>
                {unlocked ? `Nv.${lvl.id}` : '🔒'}
              </button>
            );
          })}
        </div>
        <p className="text-center text-sm font-bold text-primary">{levelCfg.label}</p>
      </div>

      <div className="bg-muted/30 rounded-2xl p-3 text-center text-xs text-muted-foreground space-y-0.5">
        <p>⏱ {levelCfg.timeLimit}s · 🔶 {levelCfg.cones} cones · 🏆 Meta: {levelCfg.goal} dribles</p>
        <p>Não deixe a marcadora 👊 te pegar!</p>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={startRound}
        className="w-full py-5 rounded-3xl font-heading font-black text-xl text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
        ▶ Começar!
      </motion.button>

      {totalScore > 0 && (
        <p className="text-center text-sm text-muted-foreground">Total de dribles: <strong>{totalScore}</strong></p>
      )}

      {StickerToast}
    </div>
  );

  // Tela de jogo
  return (
    <div className="space-y-3 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => { phaseRef.current = 'intro'; setPhase('intro'); cancelAnimationFrame(rafRef.current); }}
            className="text-muted-foreground hover:text-foreground">
            ← Sair
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Combo */}
          <AnimatePresence>
            {combo >= 2 && (
              <motion.div key={combo}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-purple-600 text-white text-xs font-black px-2 py-1 rounded-lg">
                🔥 COMBO x{combo}!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Score */}
          <div className="text-center">
            <span className="font-black text-lg text-primary">{score}</span>
            <span className="text-xs text-muted-foreground">/{levelCfg.goal}</span>
          </div>

          {/* Timer */}
          <div className={`font-black text-xl tabular-nums ${timerColor}`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Barra de progresso de dribles */}
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
          animate={{ width: `${Math.min((score / levelCfg.goal) * 100, 100)}%` }}
          transition={{ type: 'spring', damping: 18 }} />
      </div>

      {/* Campo */}
      <div
        className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10"
        style={{ width: '100%', maxWidth: 360, touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Field
          player={playerPos}
          bot={botPos}
          cones={cones}
          trail={trail}
          particles={particles}
          dodgedCones={dodgedCones}
          combo={combo}
          levelCfg={levelCfg}
        />

        {/* Overlay de resultado */}
        <AnimatePresence>
          {(phase === 'win' || phase === 'caught' || phase === 'lose') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-4 ${
                phase === 'win' ? 'bg-green-900/85' : 'bg-red-900/85'
              }`}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-7xl"
              >
                {phase === 'win' ? '🏆' : phase === 'caught' ? '🛑' : '⏰'}
              </motion.div>

              <div className="text-center px-4">
                <p className="font-heading font-black text-white text-2xl">
                  {phase === 'win' ? 'Chegou!' : phase === 'caught' ? 'Te pegaram!' : 'Tempo esgotado!'}
                </p>
                <p className="text-white/70 text-sm mt-1">
                  {phase === 'win'
                    ? `${score} dribles · combo máx x${combo}`
                    : `${score} dribles antes de parar`}
                </p>
              </div>

              {/* Pontuação de dribles */}
              <div className="flex gap-3">
                {Array.from({ length: levelCfg.goal }).map((_, i) => (
                  <motion.div key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      i < score ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white/40'
                    }`}>
                    {i < score ? '⭐' : '○'}
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2 px-4 w-full">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRound}
                  className="flex-1 py-3 bg-white text-gray-900 rounded-2xl font-heading font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Tentar de novo
                </motion.button>

                {phase === 'win' && levelIdx < LEVELS.length - 1 && (
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setLevelIdx(l => l + 1); setPhase('intro'); }}
                    className="flex-1 py-3 bg-yellow-400 text-yellow-900 rounded-2xl font-heading font-bold"
                  >
                    Próximo nível →
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles direcionais */}
      {phase === 'playing' && (
        <div className="space-y-2">
          {/* Botão cima */}
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.88, y: -4 }}
              onPointerDown={() => movePlayer('up')}
              className="w-20 h-14 rounded-2xl bg-purple-600 text-white font-black text-2xl shadow-lg flex items-center justify-center active:bg-purple-700"
            >
              <ArrowUp className="w-7 h-7" />
            </motion.button>
          </div>

          {/* Botões esquerda e direita */}
          <div className="flex gap-3 justify-center">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onPointerDown={() => movePlayer('left')}
              className="flex-1 max-w-[120px] h-16 rounded-2xl bg-green-600 text-white font-black text-3xl shadow-lg flex items-center justify-center active:bg-green-700"
            >
              <ChevronLeft className="w-8 h-8" />
            </motion.button>

            <div className="flex flex-col items-center justify-center text-xs text-muted-foreground">
              <span>⚽</span>
              <span>Mover</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.88 }}
              onPointerDown={() => movePlayer('right')}
              className="flex-1 max-w-[120px] h-16 rounded-2xl bg-green-600 text-white font-black text-3xl shadow-lg flex items-center justify-center active:bg-green-700"
            >
              <ChevronRight className="w-8 h-8" />
            </motion.button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Passe <strong>perto dos cones 🔶</strong> para driblar · Chegue à linha 🏁 para ganhar
          </p>
        </div>
      )}

      {StickerToast}
    </div>
  );
}
