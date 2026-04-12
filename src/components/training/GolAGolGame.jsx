// ═══════════════════════════════════════════════════════════════════════════
// GolAGolGame — Jogador vs Bot, chutes e defesas alternadas
// Controles: joystick para mirar, barra para defender
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

// Progressão automática
function getLevelConfig(lvl) {
  return {
    label: `Nível ${lvl + 1}`,
    rounds: 3 + Math.floor(lvl / 2),
    keeperSpeed: 1.0 + lvl * 0.55,
    botAccuracy: Math.min(0.15 + lvl * 0.08, 0.85),
  };
}
const MAX_LEVEL = 9;

export default function GolAGolGame({ onStickerEarned }) {
  const [level, setLevel]           = useState(0);
  const [round, setRound]           = useState(1);
  const [turn, setTurn]             = useState('player');
  const [phase, setPhase]           = useState('idle'); // idle | playing | shooting | goal | save | result | victory
  const [score, setScore]           = useState({ player: 0, bot: 0 });
  const [aimAngle, setAimAngle]     = useState(-Math.PI / 2);
  const [aimPower, setAimPower]     = useState(55);
  const [ballPos, setBallPos]       = useState({ x: FIELD_W / 2, y: FIELD_H - 90 });
  const [ballTrail, setBallTrail]   = useState([]);
  const [keeperPos, setKeeperPos]   = useState({ x: FIELD_W / 2, y: 60 });
  const [playerPos, setPlayerPos]   = useState({ x: FIELD_W / 2, y: FIELD_H - 90 });
  const [joystick, setJoystick]     = useState({ x: 0, y: 0 });
  const [showGoal, setShowGoal]     = useState(false);
  const [showSave, setShowSave]     = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const keeperRef  = useRef({ x: FIELD_W / 2, y: 60 });
  const rafRef     = useRef(null);
  const joyRef     = useRef(null);
  const joyCtrRef  = useRef(null);
  const defending  = useRef(false);
  const defBarRef  = useRef(null);

  const config = getLevelConfig(level);

  const playSound = useCallback((name) => {
    if (!soundEnabled) return;
    try { audio[name]?.(); } catch {}
  }, [soundEnabled]);

  // ── Resetar posições ──────────────────────────────────────────────────────
  const resetPos = useCallback((t, lvl) => {
    if (t === 'player') {
      // Jogador chuta: bola em baixo, goleira em cima
      setBallPos({ x: FIELD_W / 2, y: FIELD_H - 90 });
      setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - 90 });
      const kp = { x: FIELD_W / 2, y: GOAL_H - 10 };
      setKeeperPos(kp);
      keeperRef.current = kp;
    } else {
      // Bot chuta: bola em cima, goleira em baixo
      setBallPos({ x: FIELD_W / 2, y: 90 });
      setPlayerPos({ x: FIELD_W / 2, y: FIELD_H - GOAL_H + 10 });
      const kp = { x: FIELD_W / 2, y: FIELD_H - GOAL_H + 10 };
      setKeeperPos(kp);
      keeperRef.current = kp;
    }
    setBallTrail([]);
    setAimAngle(t === 'player' ? -Math.PI / 2 : Math.PI / 2);
    setAimPower(55);
  }, []);

  // ── Iniciar nível ─────────────────────────────────────────────────────────
  const initLevel = useCallback((lvl = 0) => {
    setLevel(lvl);
    setScore({ player: 0, bot: 0 });
    setRound(1);
    setTurn('player');
    resetPos('player', lvl);
    setPhase('playing');
  }, [resetPos]);

  useEffect(() => { initLevel(0); }, []);

  // ── Joystick de mira ──────────────────────────────────────────────────────
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

  // ── Controle da goleira (barra de defesa) ─────────────────────────────────
  const handleDefend = useCallback((clientX) => {
    if (!defBarRef.current) return;
    const rect = defBarRef.current.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    const newX = clamp(GOAL_W / 2 + pct * (FIELD_W - GOAL_W), GOAL_W / 2, FIELD_W - GOAL_W / 2);
    const kp = { x: newX, y: keeperRef.current.y };
    keeperRef.current = kp;
    setKeeperPos(kp);
  }, []);

  // ── Chutar ────────────────────────────────────────────────────────────────
  const shoot = useCallback((who) => {
    if (phase === 'shooting') return;
    setPhase('shooting');

    const speed = aimPower / 5;
    let vx = Math.cos(aimAngle) * speed;
    let vy = Math.sin(aimAngle) * speed;
    let pos = { ...(who === 'player' ? ballPos : { x: FIELD_W / 2, y: 90 }) };
    const trail = [];
    let frame = 0;
    let finished = false;

    const animate = () => {
      if (finished) return;
      frame++;
      pos = { x: pos.x + vx, y: pos.y + vy };
      if (frame % 2 === 0) trail.push({ ...pos });
      setBallTrail([...trail.slice(-8)]);

      // Mover goleira sincronamente
      {
        const prev = keeperRef.current;
        const targetX = who === 'player' ? pos.x : FIELD_W / 2;
        const diff = targetX - prev.x;
        const next = {
          x: clamp(prev.x + Math.sign(diff) * Math.min(Math.abs(diff), config.keeperSpeed), GOAL_W / 2, FIELD_W - GOAL_W / 2),
          y: prev.y,
        };
        keeperRef.current = next;
        setKeeperPos(next);
      }

      // Verificar gol
      const inGoalY = who === 'player' ? pos.y < GOAL_H + 10 : pos.y > FIELD_H - GOAL_H - 10;
      const inGoalX = Math.abs(pos.x - FIELD_W / 2) < GOAL_W / 2;

      if (inGoalY && inGoalX) {
        finished = true;
        const kDist = dist(pos, keeperRef.current);
        if (kDist < PLAYER_R + BALL_R + 2) {
          // Defendido
          setShowSave(true);
          playSound('save');
          setTimeout(() => { setShowSave(false); nextTurn(who); }, 1400);
        } else {
          // GOL!
          setShowGoal(true);
          playSound('goal');
          setScore(prev => {
            const next = { ...prev };
            if (who === 'player') next.player++;
            else next.bot++;

            setTimeout(() => {
              setShowGoal(false);
              const cfg = getLevelConfig(level);
              const roundsToWin = Math.ceil(cfg.rounds / 2);
              if (next.player >= roundsToWin || next.bot >= roundsToWin || round >= cfg.rounds) {
                if (next.player > next.bot) {
                  const nextLvl = level + 1;
                  if (nextLvl >= MAX_LEVEL) { setPhase('victory'); playSound('victory'); }
                  else { initLevel(nextLvl); }
                } else {
                  setPhase('result'); playSound('gameover');
                }
              } else {
                setRound(r => r + 1);
                nextTurn(who);
              }
            }, 1500);
            return next;
          });
        }
        setBallPos(pos);
        return;
      }

      // Saiu pela lateral
      if (pos.y < -30 || pos.y > FIELD_H + 30 || pos.x < -20 || pos.x > FIELD_W + 20) {
        finished = true;
        setTimeout(() => nextTurn(who), 600);
        return;
      }

      setBallPos(pos);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [phase, aimAngle, aimPower, ballPos, config, level, round, playSound, initLevel]);

  // ── Próxima vez (vez do bot ou do jogador) ────────────────────────────────
  const nextTurn = useCallback((lastWho) => {
    const next = lastWho === 'player' ? 'bot' : 'player';
    setTurn(next);
    resetPos(next);
    if (next === 'bot') {
      // Bot chuta automaticamente após 1s
      setTimeout(() => {
        const cfg = getLevelConfig(level);
        const misses = Math.random() > cfg.botAccuracy;
        const randomOffset = misses ? (Math.random() - 0.5) * GOAL_W : (Math.random() - 0.5) * (GOAL_W * 0.4);
        const targetX = FIELD_W / 2 + randomOffset;
        const dy = FIELD_H - 10;
        const dx = targetX - FIELD_W / 2;
        const angle = Math.atan2(dy, dx);
        setAimAngle(angle);
        setAimPower(60);
        setTimeout(() => shoot('bot'), 400);
      }, 1000);
    } else {
      setPhase('playing');
    }
  }, [level, resetPos, shoot]);

  // ── UI: Resultado/Vitória ─────────────────────────────────────────────────
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
          <button onClick={() => initLevel(0)} className="px-6 py-3 bg-primary text-white font-bold rounded-2xl">Jogar de novo</button>
        </div>
      </motion.div>
    );
  }

  // ── UI: Jogo ──────────────────────────────────────────────────────────────
  const aimX = FIELD_W / 2 + Math.cos(aimAngle) * 50;
  const aimY = FIELD_H - 90 + Math.sin(aimAngle) * 50;

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-2">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">{turn === 'player' ? 'Sua vez' : 'Vez do bot'}</div>
          <div className="font-heading font-black text-2xl">{score.player} × {score.bot}</div>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-3 py-1 text-xs font-bold text-primary">
          {config.label} • Round {round}/{config.rounds}
        </div>
        <button onClick={() => setSoundEnabled(s => !s)} className="p-2 rounded-full bg-muted">
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Campo SVG */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: FIELD_W, height: FIELD_H, background: 'linear-gradient(180deg, #2d5a27 0%, #3a7a33 50%, #2d5a27 100%)' }}>

        {/* SVG do campo */}
        <svg width={FIELD_W} height={FIELD_H} className="absolute inset-0">
          {/* Linha central */}
          <line x1="0" y1={FIELD_H / 2} x2={FIELD_W} y2={FIELD_H / 2} stroke="white" strokeWidth="1.5" opacity="0.3" />
          <circle cx={FIELD_W / 2} cy={FIELD_H / 2} r="40" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />

          {/* Gol de cima (adversário) */}
          <rect x={(FIELD_W - GOAL_W) / 2} y="0" width={GOAL_W} height={GOAL_H}
            fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="3" rx="4" />
          {/* Rede do gol de cima */}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`vt${i}`} x1={(FIELD_W - GOAL_W) / 2 + (i + 1) * (GOAL_W / 9)} y1="0"
              x2={(FIELD_W - GOAL_W) / 2 + (i + 1) * (GOAL_W / 9)} y2={GOAL_H}
              stroke="white" strokeWidth="0.5" opacity="0.3" />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <line key={`ht${i}`} x1={(FIELD_W - GOAL_W) / 2} y1={(i + 1) * (GOAL_H / 4)}
              x2={(FIELD_W - GOAL_W) / 2 + GOAL_W} y2={(i + 1) * (GOAL_H / 4)}
              stroke="white" strokeWidth="0.5" opacity="0.3" />
          ))}

          {/* Gol de baixo (jogador) */}
          <rect x={(FIELD_W - GOAL_W) / 2} y={FIELD_H - GOAL_H} width={GOAL_W} height={GOAL_H}
            fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="3" rx="4" />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`vb${i}`} x1={(FIELD_W - GOAL_W) / 2 + (i + 1) * (GOAL_W / 9)} y1={FIELD_H - GOAL_H}
              x2={(FIELD_W - GOAL_W) / 2 + (i + 1) * (GOAL_W / 9)} y2={FIELD_H}
              stroke="white" strokeWidth="0.5" opacity="0.3" />
          ))}

          {/* Linha de mira */}
          {turn === 'player' && phase === 'playing' && (
            <line x1={FIELD_W / 2} y1={FIELD_H - 90} x2={aimX} y2={aimY}
              stroke="#FFD600" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
          )}

          {/* Trail da bola */}
          {ballTrail.map((t, i) => (
            <circle key={i} cx={t.x} cy={t.y} r={BALL_R * (i / ballTrail.length) * 0.7}
              fill="white" opacity={i / ballTrail.length * 0.4} />
          ))}

          {/* Goleira */}
          <text x={keeperPos.x} y={keeperPos.y + 6} textAnchor="middle" fontSize="28">👩</text>

          {/* Bola */}
          <circle cx={ballPos.x} cy={ballPos.y} r={BALL_R} fill="white" />
          <circle cx={ballPos.x - 3} cy={ballPos.y - 3} r={BALL_R * 0.45} fill="#333" opacity="0.5" />

          {/* Jogador */}
          <text x={playerPos.x} y={playerPos.y + 8} textAnchor="middle" fontSize="28">⚽</text>
        </svg>

        {/* Efeitos */}
        <AnimatePresence>
          {showGoal && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40">
              <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.4 }}
                className="text-6xl font-black text-white drop-shadow-lg">⚽ GOL!</motion.div>
            </motion.div>
          )}
          {showSave && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-blue-900/40">
              <div className="text-4xl font-black text-white drop-shadow-lg">🧤 Defendido!</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles */}
      {turn === 'player' && phase === 'playing' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground font-bold">Mire com o joystick e toque em CHUTAR</p>
          <div className="flex items-center gap-6">
            {/* Joystick de mira */}
            <div ref={joyRef}
              className="w-28 h-28 rounded-full bg-black/20 border-4 border-white/30 relative flex items-center justify-center touch-none"
              onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; handleJoyStart(t.clientX, t.clientY); }}
              onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; updateJoy(t.clientX, t.clientY, null); }}
              onTouchEnd={handleJoyEnd}
              onMouseDown={(e) => handleJoyStart(e.clientX, e.clientY)}
              onMouseMove={(e) => e.buttons === 1 && updateJoy(e.clientX, e.clientY, null)}
              onMouseUp={handleJoyEnd}>
              <motion.div
                animate={{ x: joystick.x * 28, y: joystick.y * 28 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-10 h-10 rounded-full bg-white/80 shadow-lg" />
            </div>
            {/* Botão chutar */}
            <motion.button whileTap={{ scale: 0.88 }}
              onClick={() => shoot('player')}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white font-heading font-black text-base shadow-xl border-4 border-white/40">
              ⚽<br/>CHUTAR
            </motion.button>
          </div>
        </div>
      )}

      {turn === 'bot' && phase === 'playing' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-3">
          <p className="text-xs font-bold text-muted-foreground">⬅️ Arraste para defender ➡️</p>
          <div ref={defBarRef}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-400/40 to-blue-600/40 border-2 border-blue-400 flex items-center justify-center cursor-ew-resize relative overflow-hidden touch-none"
            onTouchStart={(e) => { e.preventDefault(); handleDefend(e.touches[0].clientX); }}
            onTouchMove={(e) => { e.preventDefault(); handleDefend(e.touches[0].clientX); }}
            onMouseDown={(e) => { defending.current = true; handleDefend(e.clientX); }}
            onMouseMove={(e) => { if (defending.current) handleDefend(e.clientX); }}
            onMouseUp={() => { defending.current = false; }}>
            <motion.div animate={{ x: [0, 12, -12, 0] }} transition={{ duration: 0.6, repeat: Infinity }}
              className="text-4xl">👩</motion.div>
            <span className="ml-2 text-xs text-blue-800 font-bold">Deslize para defender!</span>
          </div>
        </div>
      )}

      {phase === 'shooting' && (
        <div className="text-center py-3 text-muted-foreground font-bold animate-pulse">
          {turn === 'player' ? '⚽ Chutando...' : '🤖 Bot chutando...'}
        </div>
      )}
    </div>
  );
}
