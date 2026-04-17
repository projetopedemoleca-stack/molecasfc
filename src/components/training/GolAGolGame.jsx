// ═══════════════════════════════════════════════════════════════════════════
// GolAGolGame — Jogador vs Bot, chutes e defesas alternadas
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { audio } from '@/lib/audioEngine';

const FIELD_W  = 360;
const FIELD_H  = 520;
const GOAL_W   = 220;
const GOAL_H   = 80;
const PLAYER_R = 28;
const BALL_R   = 12;

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

function getLevelConfig(lvl) {
  return {
    label:      `Nível ${lvl + 1}`,
    rounds:     3 + Math.floor(lvl / 2),
    keeperSpeed: 1.0 + lvl * 0.55,
    botAccuracy: Math.min(0.15 + lvl * 0.08, 0.85),
  };
}
const MAX_LEVEL = 9;

export default function GolAGolGame({ onStickerEarned }) {
  const [level,      setLevel]      = useState(0);
  const [round,     setRound]      = useState(1);
  const [turn,      setTurn]       = useState('player');
  const [phase,     setPhase]      = useState('menu');    // menu | ready | shooting | result | victory
  const [score,     setScore]      = useState({ player: 0, bot: 0 });
  const [aimAngle,  setAimAngle]  = useState(-Math.PI / 2);
  const [aimPower,  setAimPower]  = useState(55);
  const [ballPos,   setBallPos]   = useState({ x: FIELD_W / 2, y: FIELD_H - 90 });
  const [ballTrail, setBallTrail] = useState([]);
  const [keeperPos, setKeeperPos] = useState({ x: FIELD_W / 2, y: 60 });
  const [playerPos, setPlayerPos] = useState({ x: FIELD_W / 2, y: FIELD_H - 90 });
  const [joystick,  setJoystick]  = useState({ x: 0, y: 0 });
  const [showGoal,  setShowGoal]  = useState(false);
  const [showSave,  setShowSave]  = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [botThinking, setBotThinking] = useState(false);

  const keeperRef = useRef({ x: FIELD_W / 2, y: 60 });
  const rafRef    = useRef(null);
  const joyRef   = useRef(null);
  const joyCtrRef = useRef(null);

  const config = getLevelConfig(level);

  const playSound = useCallback((name) => {
    if (!soundEnabled) return;
    try { audio[name]?.(); } catch {}
  }, [soundEnabled]);

  // ── Resetar posições conforme quem vai chutar ─────────────────────────────
  const resetPositions = useCallback((t) => {
    if (t === 'player') {
      setBallPos({ x: FIELD_W / 2, y: FIELD_H - 90 });
      setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 90 });
      const kp = { x: FIELD_W / 2, y: GOAL_H - 10 };
      setKeeperPos(kp);
      keeperRef.current = kp;
      setAimAngle(-Math.PI / 2);
      setAimPower(55);
    } else {
      setBallPos({ x: FIELD_W / 2, y: 90 });
      setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - GOAL_H + 10 });
      const kp = { x: FIELD_W / 2, y: FIELD_H - GOAL_H + 10 };
      setKeeperPos(kp);
      keeperRef.current = kp;
    }
    setBallTrail([]);
  }, []);

  // ── Iniciar / reiniciar ───────────────────────────────────────────────────
  const startGame = useCallback((lvl = 0) => {
    cancelAnimationFrame(rafRef.current);
    setLevel(lvl);
    setScore({ player: 0, bot: 0 });
    setRound(1);
    setTurn('player');
    setPhase('ready');
    setShowGoal(false);
    setShowSave(false);
    setBotThinking(false);
    resetPositions('player');
  }, [resetPositions]);

  // ── Jogador chuta ─────────────────────────────────────────────────────────
  const playerShoot = useCallback(() => {
    if (phase !== 'ready' || turn !== 'player') return;
    cancelAnimationFrame(rafRef.current);
    setPhase('shooting');
    setShowGoal(false);
    setShowSave(false);

    const speed  = aimPower / 5;
    const vx     = Math.cos(aimAngle) * speed;
    const vy     = Math.sin(aimAngle) * speed;
    let pos      = { x: FIELD_W / 2, y: FIELD_H - 90 };
    const trail  = [];
    let frame    = 0;
    let done     = false;

    const animate = () => {
      if (done) return;
      frame++;
      pos = { x: pos.x + vx, y: pos.y + vy };
      if (frame % 2 === 0) trail.push({ ...pos });
      setBallTrail([...trail.slice(-8)]);

      // Goleira同步移动
      {
        const prev  = keeperRef.current;
        const tgt   = pos.x;
        const diff  = tgt - prev.x;
        const next  = {
          x: clamp(prev.x + Math.sign(diff) * Math.min(Math.abs(diff), config.keeperSpeed), GOAL_W / 2, FIELD_W - GOAL_W / 2),
          y: prev.y,
        };
        keeperRef.current = next;
        setKeeperPos(next);
      }

      // 检测进球
      const inGoalY = pos.y < GOAL_H + 10;
      const inGoalX = Math.abs(pos.x - FIELD_W / 2) < GOAL_W / 2;

      if (inGoalY && inGoalX) {
        done = true;
        const kd = dist(pos, keeperRef.current);
        if (kd < PLAYER_R + BALL_R + 2) {
          setShowSave(true);
          playSound('save');
          setTimeout(() => { setShowSave(false); startRound('player'); }, 1400);
        } else {
          setShowGoal(true);
          playSound('goal');
          setScore(prev => ({ ...prev, player: prev.player + 1 }));
          setTimeout(() => {
            setShowGoal(false);
            checkGameEnd('player');
          }, 1500);
        }
        setBallPos(pos);
        return;
      }

      // 球出界
      if (pos.y < -30 || pos.y > FIELD_H + 30 || pos.x < -20 || pos.x > FIELD_W + 20) {
        done = true;
        setTimeout(() => startRound('player'), 600);
        return;
      }

      setBallPos(pos);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [phase, turn, aimAngle, aimPower, config, playSound]);

  // ── Bot chuta (tomada de decisão + animação) ──────────────────────────────
  const botShoot = useCallback(() => {
    if (phase !== 'ready' || turn !== 'bot') return;
    cancelAnimationFrame(rafRef.current);
    setPhase('shooting');
    setShowGoal(false);
    setShowSave(false);
    setBotThinking(false);

    const cfg = getLevelConfig(level);
    const err = Math.random() > cfg.botAccuracy;
    // err=true → chute para fora | err=false → chute瞄准
    const offX = err ? (Math.random() - 0.5) * GOAL_W * 1.2 : (Math.random() - 0.5) * GOAL_W * 0.35;
    const tgtX = FIELD_W / 2 + offX;
    // 计算角度: 从顶部(y=90)射向底部
    const dy   = (FIELD_H - GOAL_H + 10) - 90;
    const dx   = tgtX - FIELD_W / 2;
    const ang  = Math.atan2(dy, dx);
    const pwr  = 55 + Math.random() * 20;

    const speed = pwr / 5;
    const vx    = Math.cos(ang) * speed;
    const vy    = Math.sin(ang) * speed;
    let pos     = { x: FIELD_W / 2, y: 90 };
    const trail = [];
    let frame   = 0;
    let done    = false;

    const animate = () => {
      if (done) return;
      frame++;
      pos = { x: pos.x + vx, y: pos.y + vy };
      if (frame % 2 === 0) trail.push({ ...pos });
      setBallTrail([...trail.slice(-8)]);

      // 防守球员移动
      {
        const prev  = keeperRef.current;
        const tgt   = pos.x;
        const diff  = tgt - prev.x;
        const next  = {
          x: clamp(prev.x + Math.sign(diff) * Math.min(Math.abs(diff), config.keeperSpeed), GOAL_W / 2, FIELD_W - GOAL_W / 2),
          y: prev.y,
        };
        keeperRef.current = next;
        setKeeperPos(next);
      }

      // 检测进球
      const inGoalY = pos.y > FIELD_H - GOAL_H - 10;
      const inGoalX = Math.abs(pos.x - FIELD_W / 2) < GOAL_W / 2;

      if (inGoalY && inGoalX) {
        done = true;
        const kd = dist(pos, keeperRef.current);
        if (kd < PLAYER_R + BALL_R + 2) {
          setShowSave(true);
          playSound('save');
          setTimeout(() => { setShowSave(false); startRound('bot'); }, 1400);
        } else {
          setShowGoal(true);
          playSound('goal');
          setScore(prev => ({ ...prev, bot: prev.bot + 1 }));
          setTimeout(() => {
            setShowGoal(false);
            checkGameEnd('bot');
          }, 1500);
        }
        setBallPos(pos);
        return;
      }

      // 出界
      if (pos.y < -30 || pos.y > FIELD_H + 30 || pos.x < -20 || pos.x > FIELD_W + 20) {
        done = true;
        setTimeout(() => startRound('bot'), 600);
        return;
      }

      setBallPos(pos);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [phase, turn, level, config, playSound]);

  // ── Jogar próxima vez ───────────────────────────────────────────────────────
  const startRound = useCallback((lastWho) => {
    const next = lastWho === 'player' ? 'bot' : 'player';
    setTurn(next);
    resetPositions(next);

    if (next === 'bot') {
      setPhase('ready');
      // Bot pensa por 1.8s antes de chutar
      setBotThinking(true);
      setTimeout(() => {
        botShoot();
      }, 1800);
    } else {
      setPhase('ready');
    }
  }, [resetPositions, botShoot]);

  // ── Verificar fim de jogo ─────────────────────────────────────────────────
  const checkGameEnd = useCallback((scorer) => {
    setScore(prev => {
      const cfg = getLevelConfig(level);
      const wins = Math.ceil(cfg.rounds / 2);
      if (prev.player >= wins || prev.bot >= wins || round >= cfg.rounds) {
        if (prev.player > prev.bot) {
          // Jogador venceu o nível
          const nextLvl = level + 1;
          if (nextLvl >= MAX_LEVEL) {
            setPhase('victory');
          } else {
            // Passa para próximo nível automaticamente
            setTimeout(() => startGame(nextLvl), 1600);
          }
        } else {
          setPhase('result');
        }
      } else {
        setRound(r => r + 1);
        startRound(scorer);
      }
      return prev;
    });
  }, [level, round, startGame, startRound]);

  // ── Botão Chutar (player) ─────────────────────────────────────────────────
  const handleShootClick = () => {
    if (turn === 'player' && phase === 'ready') {
      playerShoot();
    }
  };

  // ── Joystick handlers ────────────────────────────────────────────────────
  const handleJoyStart = (cx, cy) => {
    if (!joyRef.current) return;
    const rect = joyRef.current.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joyCtrRef.current = center;
    updateJoy(cx, cy, center);
  };
  const updateJoy = (cx, cy, center) => {
    const c = center || joyCtrRef.current;
    if (!c) return;
    const dx = cx - c.x, dy = cy - c.y;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const scale = Math.min(mag, 40) / 40;
    const angle = Math.atan2(dy, dx);
    setJoystick({ x: Math.cos(angle) * scale, y: Math.sin(angle) * scale });
    setAimAngle(angle);
    setAimPower(40 + scale * 30);
  };
  const handleJoyEnd = () => { joyCtrRef.current = null; };

  // ── Menu ──────────────────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-2">⚽</motion.div>
          <h1 className="font-heading font-black text-3xl text-primary mb-1">Gol a Gol</h1>
          <p className="text-gray-500 text-sm px-8 text-center">Use o joystick para mirar e chute no momento certo!</p>
        </motion.div>
        <div className="space-y-2 w-full max-w-xs">
          {Array.from({ length: MAX_LEVEL }, (_, i) => {
            const cfg = getLevelConfig(i);
            return (
              <motion.button key={i} whileTap={{ scale: 0.97 }}
                onClick={() => startGame(i)}
                className="w-full py-3 px-4 rounded-2xl bg-card border-2 border-border/30 hover:border-primary text-left flex justify-between items-center transition-all">
                <div>
                  <div className="font-bold text-sm">{cfg.label}</div>
                  <div className="text-[10px] text-muted-foreground">{cfg.rounds} rodadas · até {Math.ceil(cfg.rounds/2)} gols pra vencer</div>
                </div>
                <span className="text-xl">→</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Resultado / Vitória ──────────────────────────────────────────────────
  if (phase === 'result' || phase === 'victory') {
    const won = phase === 'victory' || score.player > score.bot;
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4">
        <motion.div animate={{ rotate: won ? [0, 10, -10, 0] : 0 }} transition={{ repeat: Infinity, duration: 1 }}
          className="text-7xl">{won ? '🏆' : '😢'}</motion.div>
        <div className="text-center">
          <h2 className="font-heading font-black text-2xl mb-1">{won ? 'Você venceu!' : 'Boa tentativa!'}</h2>
          <p className="text-muted-foreground">Você {score.player} × {score.bot} Bot</p>
          {won && <p className="text-primary font-bold mt-1">Nível {level + 1} concluído!</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPhase('menu')} className="px-6 py-3 bg-muted font-bold rounded-2xl">Menu</button>
          <button onClick={() => startGame(level)} className="px-6 py-3 bg-primary text-white font-bold rounded-2xl">Jogar de novo</button>
        </div>
      </motion.div>
    );
  }

  // ── Jogo ─────────────────────────────────────────────────────────────────
  const aimX = FIELD_W / 2 + Math.cos(aimAngle) * 50;
  const aimY = FIELD_H - 90 + Math.sin(aimAngle) * 50;

  return (
    <div className="flex flex-col items-center gap-2 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground">{turn === 'player' ? 'Sua vez' : 'Vez do bot'}</div>
          <div className="font-heading font-black text-2xl">{score.player} × {score.bot}</div>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-3 py-1 text-[10px] font-bold text-primary">
          {config.label} · {round}/{config.rounds}
        </div>
        <button onClick={() => setSoundEnabled(s => !s)} className="p-2 rounded-full bg-muted">
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Campo SVG */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: FIELD_W, height: FIELD_H, background: 'linear-gradient(180deg, #2d5a27 0%, #3a7a33 50%, #2d5a27 100%)' }}>

        <svg width={FIELD_W} height={FIELD_H} className="absolute inset-0">
          {/* Linha central */}
          <line x1="0" y1={FIELD_H/2} x2={FIELD_W} y2={FIELD_H/2} stroke="white" strokeWidth="1.5" opacity="0.3" />
          <circle cx={FIELD_W/2} cy={FIELD_H/2} r="40" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />

          {/* Gol de cima (bot ataca → goleira do jogador em baixo) */}
          <rect x={(FIELD_W-GOAL_W)/2} y="0" width={GOAL_W} height={GOAL_H}
            fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="3" rx="4" />
          {[...Array(8)].map((_, i) => (
            <line key={`vt${i}`} x1={(FIELD_W-GOAL_W)/2+(i+1)*GOAL_W/9} y1="0"
              x2={(FIELD_W-GOAL_W)/2+(i+1)*GOAL_W/9} y2={GOAL_H}
              stroke="white" strokeWidth="0.5" opacity="0.3" />
          ))}
          {[...Array(3)].map((_, i) => (
            <line key={`ht${i}`} x1={(FIELD_W-GOAL_W)/2} y1={(i+1)*GOAL_H/4}
              x2={(FIELD_W-GOAL_W)/2+GOAL_W} y2={(i+1)*GOAL_H/4}
              stroke="white" strokeWidth="0.5" opacity="0.3" />
          ))}

          {/* Gol de baixo (jogador defende → goleira em cima quando bot ataca) */}
          <rect x={(FIELD_W-GOAL_W)/2} y={FIELD_H-GOAL_H} width={GOAL_W} height={GOAL_H}
            fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="3" rx="4" />
          {[...Array(8)].map((_, i) => (
            <line key={`vb${i}`} x1={(FIELD_W-GOAL_W)/2+(i+1)*GOAL_W/9} y1={FIELD_H-GOAL_H}
              x2={(FIELD_W-GOAL_W)/2+(i+1)*GOAL_W/9} y2={FIELD_H}
              stroke="white" strokeWidth="0.5" opacity="0.3" />
          ))}
          {[...Array(3)].map((_, i) => (
            <line key={`hb${i}`} x1={(FIELD_W-GOAL_W)/2} y1={FIELD_H-GOAL_H+(i+1)*GOAL_H/4}
              x2={(FIELD_W-GOAL_W)/2+GOAL_W} y2={FIELD_H-GOAL_H+(i+1)*GOAL_H/4}
              stroke="white" strokeWidth="0.5" opacity="0.3" />
          ))}

          {/* Mira do jogador */}
          {turn === 'player' && phase === 'ready' && (
            <line x1={FIELD_W/2} y1={FIELD_H-90} x2={aimX} y2={aimY}
              stroke="#FFD600" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
          )}

          {/* Trail */}
          {ballTrail.map((t, i) => (
            <circle key={i} cx={t.x} cy={t.y}
              r={BALL_R * (i / (ballTrail.length || 1)) * 0.7}
              fill="white" opacity={i / (ballTrail.length || 1) * 0.4} />
          ))}

          {/* Goleira (sempre mostra a位置 correta) */}
          <text x={keeperPos.x} y={keeperPos.y + 6} textAnchor="middle" fontSize="28">👩</text>

          {/* Bola */}
          <circle cx={ballPos.x} cy={ballPos.y} r={BALL_R} fill="white" />
          <circle cx={ballPos.x - 3} cy={ballPos.y - 3} r={BALL_R * 0.45} fill="#333" opacity="0.5" />

          {/* Jogador / bot */}
          <text x={playerPos.x} y={playerPos.y + 8} textAnchor="middle" fontSize="28">
            {turn === 'player' ? '⚽' : '🤖'}
          </text>
        </svg>

        {/* Efeitos */}
        <AnimatePresence>
          {showGoal && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <motion.div animate={{ rotate: [0,5,-5,0], scale: [1,1.1,1] }} transition={{ repeat: Infinity, duration: 0.4 }}
                className="text-6xl font-black text-white drop-shadow-lg">⚽ GOL!</motion.div>
            </motion.div>
          )}
          {showSave && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-blue-900/40 z-10">
              <div className="text-4xl font-black text-white drop-shadow-lg">🧤 Defendido!</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pensando do bot */}
        <AnimatePresence>
          {botThinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute bottom-20 left-0 right-0 flex justify-center z-10 pointer-events-none">
              <div className="bg-black/60 text-white text-xs px-4 py-2 rounded-full font-bold">
                🤖 Bot está mirando...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles — vez do jogador */}
      {turn === 'player' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-3">
          <p className="text-[10px] text-muted-foreground font-bold">
            {phase === 'shooting' ? '⚽ chutando...' : 'Mire com o joystick e toque em CHUTAR'}
          </p>
          <div className="flex items-center gap-6">
            {/* Joystick */}
            <div ref={joyRef}
              className="w-28 h-28 rounded-full bg-black/20 border-4 border-white/30 relative flex items-center justify-center touch-none"
              onTouchStart={(e) => { e.preventDefault(); handleJoyStart(e.touches[0].clientX, e.touches[0].clientY); }}
              onTouchMove={(e)  => { e.preventDefault(); updateJoy(e.touches[0].clientX, e.touches[0].clientY, null); }}
              onTouchEnd={(e)   => { e.preventDefault(); handleJoyEnd(); }}
              onMouseDown={(e)  => handleJoyStart(e.clientX, e.clientY)}
              onMouseMove={(e) => e.buttons === 1 && updateJoy(e.clientX, e.clientY, null)}
              onMouseUp={handleJoyEnd}>
              <motion.div
                animate={{ x: joystick.x * 28, y: joystick.y * 28 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-10 h-10 rounded-full bg-white/80 shadow-lg" />
            </div>
            {/* Botão chutar */}
            <motion.button whileTap={{ scale: 0.88 }}
              onClick={handleShootClick}
              disabled={phase !== 'ready'}
              className={`w-24 h-24 rounded-full font-heading font-black text-base shadow-xl transition-all border-4 border-white/40 flex flex-col items-center justify-center ${
                phase === 'ready'
                  ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}>
              ⚽<span className="text-xs mt-1">CHUTAR</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Controles — vez do bot (defesa) */}
      {turn === 'bot' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-2">
          <p className="text-[10px] text-muted-foreground font-bold">
            {phase === 'shooting' ? '🤖 bot chutou! defendendo...' : '👩 Você é a goleira — segure o bot!'}
          </p>
          {/* Barra de defesa responsiva */}
          <div className="w-full h-16 rounded-2xl bg-gradient-to-r from-yellow-400/40 to-yellow-600/40 border-2 border-yellow-400 flex items-center justify-center relative overflow-hidden touch-none">
            <motion.div animate={{ x: [0, 10, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity }}
              className="text-3xl">👩</motion.div>
            <span className="ml-2 text-xs text-yellow-800 font-bold">Deslize para defender!</span>
          </div>
        </div>
      )}
    </div>
  );
}
