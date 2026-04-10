import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { bgMusic } from '@/lib/trainingMusic';
import { audio } from '@/lib/audioEngine';
import { drawSticker, addSticker } from '@/lib/albumSystem.js';
import { useStickerToast } from '@/components/ui/StickerEarnedToast.jsx';

// ─── Configuração de níveis ────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, label: 'Iniciante',    botSpeed: 0.011, playerSpeed: 0.022, cones: 3, timeLimit: 35, goal: 3,  emoji: '🌱' },
  { id: 2, label: 'Amadora',      botSpeed: 0.015, playerSpeed: 0.022, cones: 4, timeLimit: 32, goal: 4,  emoji: '⚽' },
  { id: 3, label: 'Juvenil',      botSpeed: 0.019, playerSpeed: 0.024, cones: 5, timeLimit: 28, goal: 5,  emoji: '🔥' },
  { id: 4, label: 'Sub-20',       botSpeed: 0.023, playerSpeed: 0.024, cones: 5, timeLimit: 25, goal: 6,  emoji: '⚡' },
  { id: 5, label: 'Profissional', botSpeed: 0.027, playerSpeed: 0.026, cones: 6, timeLimit: 22, goal: 7,  emoji: '🏆' },
  { id: 6, label: 'Seleção',      botSpeed: 0.032, playerSpeed: 0.026, cones: 7, timeLimit: 20, goal: 8,  emoji: '👑' },
  { id: 7, label: 'Marta Mode',   botSpeed: 0.038, playerSpeed: 0.028, cones: 8, timeLimit: 18, goal: 9,  emoji: '🌟' },
];

const FW = 300; // field width
const FH = 460; // field height
const PR = 13;  // player radius
const BR = 13;  // bot radius
const CR = 8;   // cone radius
const GOAL_Y = 38;
const START_Y = FH - 55;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function genCones(count) {
  const cones = [];
  let tries = 0;
  while (cones.length < count && tries < 300) {
    tries++;
    const x = 30 + Math.random() * (FW - 60);
    const y = GOAL_Y + 55 + Math.random() * (START_Y - GOAL_Y - 110);
    if (!cones.some(c => Math.hypot(c.x - x, c.y - y) < 55))
      cones.push({ x, y, id: cones.length });
  }
  return cones;
}

// ─── Campo SVG ─────────────────────────────────────────────────────────────────
function Field({ player, bot, cones, dodged, trail, particles, combo }) {
  const dist = Math.hypot(player.x - bot.x, player.y - bot.y);
  const danger = Math.max(0, (70 - dist) / 70);

  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} width="100%" style={{ display: 'block', touchAction: 'none' }}>
      <defs>
        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <radialGradient id="dangerGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`rgba(239,68,68,${danger * 0.25})`} />
          <stop offset="100%" stopColor="rgba(239,68,68,0)" />
        </radialGradient>
        <filter id="gp"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="gb"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Grama */}
      <rect width={FW} height={FH} fill="url(#pg)" />
      {[0,1,2,3].map(i => (
        <rect key={i} x={i*(FW/4)} y={0} width={FW/4} height={FH}
          fill={i%2===0 ? 'rgba(0,0,0,0.06)' : 'transparent'} />
      ))}

      {/* Borda */}
      <rect x={3} y={3} width={FW-6} height={FH-6} fill="none"
        stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} rx={3} />

      {/* Zona de perigo (marcadora perto) */}
      {danger > 0 && (
        <ellipse cx={player.x} cy={player.y} rx={60} ry={60} fill="url(#dangerGrad)" />
      )}

      {/* Linha de chegada */}
      <rect x={3} y={GOAL_Y - 22} width={FW - 6} height={30}
        fill="rgba(255,255,255,0.12)" rx={3} />
      {[...Array(14)].map((_, i) => (
        <rect key={i}
          x={3 + i*((FW-6)/28)} y={GOAL_Y-22}
          width={(FW-6)/28} height={30}
          fill={i%2===0 ? 'rgba(255,255,255,0.2)' : 'transparent'} />
      ))}
      <text x={FW/2} y={GOAL_Y-4} textAnchor="middle"
        fontSize={11} fill="white" fontWeight="bold" fontFamily="sans-serif">
        🏁 CHEGADA
      </text>

      {/* Trilha */}
      {trail.length > 1 && (
        <polyline
          points={trail.map(p=>`${p.x},${p.y}`).join(' ')}
          fill="none" stroke="rgba(250,204,21,0.45)"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        />
      )}

      {/* Cones */}
      {cones.map(c => {
        const ok = dodged.includes(c.id);
        return (
          <g key={c.id}>
            {ok && <circle cx={c.x} cy={c.y} r={CR+5} fill="rgba(74,222,128,0.18)" stroke="rgba(74,222,128,0.4)" strokeWidth={1}/>}
            <text x={c.x} y={c.y+6} textAnchor="middle" fontSize={ok?13:17} opacity={ok?0.3:1}>🔶</text>
          </g>
        );
      })}

      {/* Partículas */}
      {particles.map(p => (
        <circle key={p.id} cx={p.x} cy={p.y} r={p.r} fill={p.color} opacity={p.opacity} />
      ))}

      {/* Linha de perigo bot→player */}
      {danger > 0.3 && (
        <line x1={player.x} y1={player.y} x2={bot.x} y2={bot.y}
          stroke={`rgba(239,68,68,${danger*0.5})`} strokeWidth={1.5} strokeDasharray="5 3" />
      )}

      {/* Bola (jogadora) */}
      <g filter="url(#gp)">
        <circle cx={player.x} cy={player.y} r={PR}
          fill="#fde68a" stroke="#f59e0b" strokeWidth={1.5} />
        <text x={player.x} y={player.y+5} textAnchor="middle" fontSize={15}>⚽</text>
      </g>

      {/* Bot (marcadora) */}
      <g filter="url(#gb)">
        <circle cx={bot.x} cy={bot.y} r={BR}
          fill="#fca5a5" stroke="#ef4444" strokeWidth={2} />
        <text x={bot.x} y={bot.y+5} textAnchor="middle" fontSize={13}>👊</text>
      </g>

      {/* Combo badge */}
      {combo >= 2 && (
        <g>
          <circle cx={player.x+17} cy={player.y-17} r={10}
            fill="#7c3aed" stroke="white" strokeWidth={1.5} />
          <text x={player.x+17} y={player.y-13} textAnchor="middle"
            fontSize={8} fill="white" fontWeight="bold" fontFamily="sans-serif">
            x{combo}
          </text>
        </g>
      )}
    </svg>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function PursuitGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);
  const { showToast, StickerToast } = useStickerToast();

  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase] = useState('menu'); // menu | playing | caught | win | lose
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(35);
  const [cones, setCones] = useState([]);
  const [dodged, setDodged] = useState([]);
  const [trail, setTrail] = useState([]);
  const [particles, setParticles] = useState([]);
  const [totalWins, setTotalWins] = useState(0);

  const playerRef = useRef({ x: FW/2, y: START_Y });
  const botRef    = useRef({ x: FW/2-40, y: START_Y+15 });
  const [playerPos, setPlayerPos] = useState({ x: FW/2, y: START_Y });
  const [botPos,    setBotPos]    = useState({ x: FW/2-40, y: START_Y+15 });

  const rafRef    = useRef(null);
  const phaseRef  = useRef('menu');
  const scoreRef  = useRef(0);
  const comboRef  = useRef(0);
  const timerRef  = useRef(null);

  const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

  // ─── Partículas ─────────────────────────────────────────────────────────────
  const spawnParticles = useCallback((x, y, isCombo) => {
    const color = isCombo ? '#a855f7' : '#fbbf24';
    const ps = Array.from({length: 7}, (_, i) => ({
      id: Date.now()+i,
      x: x + (Math.random()-.5)*18,
      y: y + (Math.random()-.5)*18,
      r: 2 + Math.random()*4,
      color, opacity: 0.85,
    }));
    setParticles(p => [...p, ...ps]);
    setTimeout(() => setParticles(p => p.filter(pp => !ps.find(np => np.id===pp.id))), 450);
  }, []);

  // ─── Iniciar rodada ──────────────────────────────────────────────────────────
  const startRound = useCallback(() => {
    const c = LEVELS[Math.min(levelIdx, LEVELS.length-1)];
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);

    const px = FW/2, py = START_Y;
    const bx = FW/2 + (Math.random()>.5 ? -50 : 50);
    const by = START_Y + 20;

    playerRef.current = { x: px, y: py };
    botRef.current    = { x: bx, y: by };
    setPlayerPos({ x: px, y: py });
    setBotPos({ x: bx, y: by });
    setCones(genCones(c.cones));
    setDodged([]);
    setTrail([{ x: px, y: py }]);
    setParticles([]);
    setScore(0); scoreRef.current = 0;
    setCombo(0); comboRef.current = 0;
    setTimeLeft(c.timeLimit);
    phaseRef.current = 'playing';
    setPhase('playing');
  }, [levelIdx]);

  // ─── Loop principal ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    const c = LEVELS[Math.min(levelIdx, LEVELS.length-1)];
    let last = null;

    const loop = (ts) => {
      if (phaseRef.current !== 'playing') return;
      if (!last) last = ts;
      const dt = Math.min(ts - last, 50);
      last = ts;

      const p = playerRef.current;
      const b = botRef.current;
      const dx = p.x - b.x, dy = p.y - b.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.5) {
        const spd = c.botSpeed * dt * FW;
        const nx = b.x + (dx/dist)*spd;
        const ny = b.y + (dy/dist)*spd;
        botRef.current = { x: nx, y: ny };
        setBotPos({ x: nx, y: ny });
      }

      // Captura
      if (dist < PR + BR - 3) {
        phaseRef.current = 'caught';
        setPhase('caught');
        try { audio.playLose?.(); } catch {}
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    // Timer regressivo
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
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
      clearInterval(timerRef.current);
    };
  }, [phase, levelIdx]);

  // ─── Mover jogadora ──────────────────────────────────────────────────────────
  const move = useCallback((dir) => {
    if (phaseRef.current !== 'playing') return;

    const c = LEVELS[Math.min(levelIdx, LEVELS.length-1)];
    const step = c.playerSpeed * FW * 16;
    const p = playerRef.current;

    let nx = p.x, ny = p.y;
    if (dir === 'left')  nx = Math.max(PR+3,    p.x - step*1.4);
    if (dir === 'right') nx = Math.min(FW-PR-3,  p.x + step*1.4);
    if (dir === 'up')    ny = Math.max(PR+3,    p.y - step*1.6);

    playerRef.current = { x: nx, y: ny };
    setPlayerPos({ x: nx, y: ny });
    setTrail(t => [...t.slice(-20), { x: nx, y: ny }]);

    // Verificar cones
    setCones(prev => {
      prev.forEach(cone => {
        const d = Math.hypot(cone.x - nx, cone.y - ny);
        if (d < CR + PR + 8) {
          setDodged(dd => {
            if (dd.includes(cone.id)) return dd;
            const nc = comboRef.current + 1;
            comboRef.current = nc;
            setCombo(nc);
            const ns = scoreRef.current + 1;
            scoreRef.current = ns;
            setScore(ns);
            spawnParticles(cone.x, cone.y, nc >= 3);
            try { audio.playDribble?.(); } catch {}
            return [...dd, cone.id];
          });
        }
      });
      return prev;
    });

    // Chegada
    if (ny <= GOAL_Y + 12) {
      phaseRef.current = 'win';
      setPhase('win');
      setTotalWins(w => w+1);
      try { audio.playGoal?.(); } catch {}

      const rarity = scoreRef.current >= 7 ? 'epic'
        : scoreRef.current >= 5 ? 'rare'
        : comboRef.current >= 3 ? 'uncommon'
        : null;
      const def = drawSticker('minigame_dribble', rarity);
      const result = addSticker(def.id, 'minigame_dribble', true);
      if (result) showToast({ ...result, definition: def });
    }
  }, [levelIdx, spawnParticles, showToast]);

  // ─── Teclado ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key==='ArrowLeft')               move('left');
      if (e.key==='ArrowRight')              move('right');
      if (e.key==='ArrowUp'||e.key===' ')   { e.preventDefault(); move('up'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  // ─── Swipe ───────────────────────────────────────────────────────────────────
  const ts = useRef(null);
  const onTouchStart = (e) => { ts.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    if (!ts.current) return;
    const dx = e.changedTouches[0].clientX - ts.current.x;
    const dy = e.changedTouches[0].clientY - ts.current.y;
    ts.current = null;
    if (Math.abs(dy) > Math.abs(dx) && dy < -12) { move('up'); return; }
    if (Math.abs(dx) > 12) move(dx < 0 ? 'left' : 'right');
  };

  const timerColor = timeLeft <= 5 ? 'text-red-500 animate-pulse' : timeLeft <= 10 ? 'text-orange-500' : 'text-green-600';

  // ─── MENU ────────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="space-y-5">
      <div className="text-center">
        <motion.div className="text-6xl mb-2"
          animate={{ y: [-4,4,-4] }} transition={{ repeat: Infinity, duration: 1.3 }}>
          🔥
        </motion.div>
        <h2 className="font-heading font-black text-2xl">Drible com Marcador</h2>
        <p className="text-muted-foreground text-sm mt-1">Avance pelo campo, desvie dos cones e fuja da marcadora!</p>
      </div>

      {/* Como jogar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon:'⬆️', text:'Avançar\npara a meta' },
          { icon:'↔️', text:'Desviar\ndos cones' },
          { icon:'👊', text:'Não deixe\na marcadora\nte pegar!' },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border/30 rounded-2xl p-3 text-center space-y-1">
            <div className="text-2xl">{item.icon}</div>
            <p className="text-xs text-muted-foreground leading-tight whitespace-pre-line">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Seleção de nível */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase">Nível</p>
        <div className="grid grid-cols-4 gap-1.5">
          {LEVELS.map((lvl, i) => {
            const unlocked = i <= totalWins;
            return (
              <button key={i} disabled={!unlocked}
                onClick={() => setLevelIdx(i)}
                className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  levelIdx === i
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : unlocked
                    ? 'bg-card border-border/30 hover:border-primary/40'
                    : 'opacity-25 cursor-not-allowed border-border/20'
                }`}>
                {unlocked ? lvl.emoji : '🔒'}
              </button>
            );
          })}
        </div>
        <div className="bg-muted/30 rounded-xl p-2.5 text-center">
          <p className="font-bold text-sm">{cfg.emoji} {cfg.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            ⏱ {cfg.timeLimit}s · 🔶 {cfg.cones} cones · Meta: {cfg.goal} dribles
          </p>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={startRound}
        className="w-full py-5 rounded-3xl font-heading font-black text-xl text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
        ▶ Começar!
      </motion.button>
      {StickerToast}
    </div>
  );

  // ─── JOGO ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          onClick={() => { phaseRef.current='menu'; cancelAnimationFrame(rafRef.current); clearInterval(timerRef.current); setPhase('menu'); }}
          className="text-sm text-muted-foreground font-semibold"
        >
          ← Sair
        </button>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {combo >= 2 && (
              <motion.span key={combo}
                initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0, opacity:0 }}
                className="bg-purple-600 text-white text-xs font-black px-2 py-1 rounded-lg">
                🔥 x{combo}
              </motion.span>
            )}
          </AnimatePresence>

          <div className="text-center">
            <span className="font-black text-lg text-primary">{score}</span>
            <span className="text-xs text-muted-foreground">/{cfg.goal}</span>
          </div>

          <span className={`font-black text-xl tabular-nums ${timerColor}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-2.5 bg-muted rounded-full overflow-hidden mx-1">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          animate={{ width: `${Math.min((score/cfg.goal)*100, 100)}%` }}
          transition={{ type:'spring', damping:20 }}
        />
      </div>

      {/* Campo */}
      <div
        className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10"
        style={{ width:'100%', maxWidth:340, touchAction:'none' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Field
          player={playerPos} bot={botPos}
          cones={cones} dodged={dodged}
          trail={trail} particles={particles}
          combo={combo}
        />

        {/* Overlay resultado */}
        <AnimatePresence>
          {(phase==='win'||phase==='caught'||phase==='lose') && (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-4 ${
                phase==='win' ? 'bg-green-900/88' : 'bg-red-900/88'
              }`}
            >
              <motion.div
                initial={{ scale:0, rotate:-20 }} animate={{ scale:1, rotate:0 }}
                transition={{ type:'spring', stiffness:280 }}
                className="text-7xl"
              >
                {phase==='win' ? '🏆' : phase==='caught' ? '🛑' : '⏰'}
              </motion.div>

              <div className="text-center px-4">
                <p className="font-heading font-black text-white text-2xl">
                  {phase==='win' ? 'Chegou!' : phase==='caught' ? 'Te pegaram!' : 'Acabou o tempo!'}
                </p>
                <p className="text-white/70 text-sm mt-1">
                  {phase==='win'
                    ? `${score} dribles · combo x${combo}`
                    : `${score} drible${score!==1?'s':''} antes de parar`}
                </p>
              </div>

              {/* Estrelas */}
              <div className="flex gap-2">
                {Array.from({ length: cfg.goal }).map((_, i) => (
                  <motion.div key={i}
                    initial={{ scale:0 }} animate={{ scale:1 }}
                    transition={{ delay: i*0.07 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      i < score ? 'bg-yellow-400' : 'bg-white/20'
                    }`}
                  >
                    {i < score ? '⭐' : '○'}
                  </motion.div>
                ))}
              </div>

              {/* Botões */}
              <div className="flex gap-2 px-6 w-full">
                <motion.button
                  initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.4 }}
                  whileTap={{ scale:0.95 }} onClick={startRound}
                  className="flex-1 py-3 bg-white text-gray-900 rounded-2xl font-heading font-bold flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Tentar de novo
                </motion.button>

                {phase==='win' && levelIdx < LEVELS.length-1 && (
                  <motion.button
                    initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.5 }}
                    whileTap={{ scale:0.95 }}
                    onClick={() => { setLevelIdx(l=>l+1); setPhase('menu'); }}
                    className="flex-1 py-3 bg-yellow-400 text-yellow-900 rounded-2xl font-heading font-bold"
                  >
                    Próximo →
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles */}
      {phase === 'playing' && (
        <div className="space-y-2 px-2">
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale:0.86, y:-3 }}
              onPointerDown={() => move('up')}
              className="w-20 h-14 rounded-2xl font-black text-white text-2xl shadow-lg flex items-center justify-center active:brightness-110"
              style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)' }}
            >
              <ArrowUp className="w-7 h-7" />
            </motion.button>
          </div>
          <div className="flex gap-3 justify-center">
            <motion.button
              whileTap={{ scale:0.86 }}
              onPointerDown={() => move('left')}
              className="flex-1 max-w-[110px] h-16 rounded-2xl font-black text-white shadow-lg flex items-center justify-center active:brightness-110"
              style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)' }}
            >
              <ChevronLeft className="w-8 h-8" />
            </motion.button>

            <div className="flex flex-col items-center justify-center text-xs text-muted-foreground w-14 gap-0.5">
              <span className="text-xl">⚽</span>
              <span className="leading-tight text-center">mover</span>
            </div>

            <motion.button
              whileTap={{ scale:0.86 }}
              onPointerDown={() => move('right')}
              className="flex-1 max-w-[110px] h-16 rounded-2xl font-black text-white shadow-lg flex items-center justify-center active:brightness-110"
              style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)' }}
            >
              <ChevronRight className="w-8 h-8" />
            </motion.button>
          </div>
          <p className="text-center text-xs text-muted-foreground pb-1">
            Passe perto dos <strong>cones 🔶</strong> · Chegue à <strong>linha 🏁</strong> · Swipe também funciona
          </p>
        </div>
      )}

      {StickerToast}
    </div>
  );
}
