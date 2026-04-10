import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { bgMusic } from '@/lib/trainingMusic';

// ─── Configuração por nível ───────────────────────────────────────────────────
const LEVELS = [
  { id: 0, label: 'Iniciante',     cones: 5,  speed: 1.6, goal: 3, timeLimit: 40 },
  { id: 1, label: 'Amadora',       cones: 6,  speed: 2.0, goal: 4, timeLimit: 36 },
  { id: 2, label: 'Juvenil',       cones: 7,  speed: 2.5, goal: 5, timeLimit: 32 },
  { id: 3, label: 'Sub-20',        cones: 8,  speed: 3.0, goal: 5, timeLimit: 28 },
  { id: 4, label: 'Profissional',  cones: 9,  speed: 3.5, goal: 6, timeLimit: 24 },
  { id: 5, label: 'Seleção',       cones: 10, speed: 4.2, goal: 6, timeLimit: 20 },
  { id: 6, label: 'Marta Mode',    cones: 12, speed: 5.0, goal: 7, timeLimit: 18 },
];

const FW = 300;
const FH = 460;
const PLAYER_Y  = FH - 60;  // posição fixa da jogadora
const PLAYER_R  = 13;
const CONE_R    = 12;
const SPACING   = 80;        // distância vertical entre cones
const HIT_ZONE  = 18;        // margem de detecção

// Cones começam ACIMA da tela (y negativo) e descem em direção à jogadora
function genCones(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    // cone 0 entra primeiro → posição y menos negativa
    y: -40 - i * SPACING,
    x: i % 2 === 0 ? FW * 0.27 : FW * 0.73,
    side: i % 2 === 0 ? 'left' : 'right',
  }));
}

// ─── Campo SVG ────────────────────────────────────────────────────────────────
function Field({ playerX, cones, scroll, passedIds, nextIdx, timeLeft, maxTime }) {
  const timerFrac  = Math.max(0, timeLeft / maxTime);
  const timerColor = timerFrac < 0.25 ? '#ef4444' : timerFrac < 0.5 ? '#f97316' : '#22c55e';

  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} width="100%" style={{ display: 'block', touchAction: 'none' }}>
      <defs>
        <linearGradient id="grass_dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <filter id="glow_dg">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Grama com listras */}
      <rect width={FW} height={FH} fill="url(#grass_dg)" />
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={i*(FW/5)} y={0} width={FW/5} height={FH}
          fill={i%2===0 ? 'rgba(0,0,0,0.07)' : 'transparent'} />
      ))}

      {/* Borda */}
      <rect x={3} y={3} width={FW-6} height={FH-6}
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} rx={3} />

      {/* Linha central */}
      <line x1={FW/2} y1={0} x2={FW/2} y2={FH}
        stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="10 6" />

      {/* Timer bar */}
      <rect x={3} y={3} width={FW-6} height={7} rx={3} fill="rgba(0,0,0,0.35)" />
      <rect x={3} y={3} width={Math.max(4,(FW-6)*timerFrac)} height={7} rx={3}
        fill={timerColor} opacity={0.9} />

      {/* Cones (vy = cone.y + scroll → desce conforme scroll aumenta) */}
      {cones.map(cone => {
        const vy = cone.y + scroll;
        if (vy < -30 || vy > FH + 30) return null;
        const isPassed = passedIds.includes(cone.id);
        const isNext   = cone.id === nextIdx;
        return (
          <g key={cone.id}>
            {isNext && !isPassed && (
              <circle cx={cone.x} cy={vy} r={CONE_R+10}
                fill="rgba(250,204,21,0.18)" stroke="rgba(250,204,21,0.55)"
                strokeWidth={1.5} />
            )}
            {isPassed
              ? <circle cx={cone.x} cy={vy} r={CONE_R+3} fill="rgba(74,222,128,0.25)" />
              : null}
            <text x={cone.x} y={vy+7} textAnchor="middle"
              fontSize={isPassed ? 14 : 22} opacity={isPassed ? 0.3 : 1}>
              🔶
            </text>
          </g>
        );
      })}

      {/* Linha da jogadora */}
      <line x1={4} y1={PLAYER_Y} x2={FW-4} y2={PLAYER_Y}
        stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="6 4" />

      {/* Jogadora */}
      <g filter="url(#glow_dg)">
        <circle cx={playerX} cy={PLAYER_Y} r={PLAYER_R}
          fill="#fde68a" stroke="#f59e0b" strokeWidth={1.5} />
        <text x={playerX} y={PLAYER_Y+6} textAnchor="middle" fontSize={16}>⚽</text>
      </g>

      {/* Contador no canto */}
      <rect x={FW/2-24} y={FH-24} width={48} height={20} rx={10} fill="rgba(0,0,0,0.5)" />
      <text x={FW/2} y={FH-9} textAnchor="middle"
        fontSize={11} fill="white" fontWeight="bold" fontFamily="sans-serif">
        {passedIds.length} / {cones.length}
      </text>
    </svg>
  );
}

// ─── Principal ────────────────────────────────────────────────────────────────
export default function DribbleGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);

  const [levelIdx, setLevelIdx]   = useState(0);
  const [phase, setPhase]         = useState('menu');
  const [cones, setCones]         = useState([]);
  const [passedIds, setPassedIds] = useState([]);
  const [nextIdx, setNextIdx]     = useState(0);
  const [scroll, setScroll]       = useState(0);
  const [playerX, setPlayerX]     = useState(FW / 2);
  const [timeLeft, setTimeLeft]   = useState(40);
  const [totalWins, setTotalWins] = useState(0);
  const [resultMsg, setResultMsg] = useState({ ok: true, text: '' });

  const scrollRef   = useRef(0);
  const playerXRef  = useRef(FW / 2);
  const passedRef   = useRef([]);
  const nextIdxRef  = useRef(0);
  const conesRef    = useRef([]);
  const phaseRef    = useRef('menu');
  const rafRef      = useRef(null);
  const timerRef    = useRef(null);
  const lastTsRef   = useRef(null);

  const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

  // ─── Iniciar ──────────────────────────────────────────────────────────────
  const startRound = useCallback(() => {
    const c = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
    const nc = genCones(c.cones);

    conesRef.current   = nc;
    scrollRef.current  = 0;
    playerXRef.current = FW / 2;
    passedRef.current  = [];
    nextIdxRef.current = 0;
    lastTsRef.current  = null;

    setCones(nc);
    setScroll(0);
    setPlayerX(FW / 2);
    setPassedIds([]);
    setNextIdx(0);
    setTimeLeft(c.timeLimit);
    phaseRef.current = 'playing';
    setPhase('playing');
  }, [levelIdx]);

  // ─── Encerrar rodada ──────────────────────────────────────────────────────
  const endRound = useCallback((reason) => {
    if (phaseRef.current !== 'playing') return;
    phaseRef.current = 'result';
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);

    const passed = passedRef.current.length;
    const c = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
    const won = passed >= c.goal;

    if (won) {
      setTotalWins(w => w + 1);
      setResultMsg({ ok: true,  text: reason === 'time' ? `⏱ ${passed} cones no tempo!` : `🏆 Perfeito! ${passed}/${c.cones} cones!` });
    } else {
      setResultMsg({ ok: false, text: reason === 'time' ? `⏰ Tempo! ${passed}/${c.goal} cones` : `💥 Bateu! ${passed}/${c.goal} cones` });
    }

    setPhase('result');
  }, [levelIdx]);

  // ─── Loop de jogo ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const c = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

    const loop = (ts) => {
      if (phaseRef.current !== 'playing') return;
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(ts - lastTsRef.current, 50);
      lastTsRef.current = ts;

      // Avança o scroll (cones descem)
      const newScroll = scrollRef.current + c.speed * (dt / 16);
      scrollRef.current = newScroll;
      setScroll(newScroll);

      // Verificar se próximo cone chegou à zona da jogadora
      const ni = nextIdxRef.current;
      const allCones = conesRef.current;

      if (ni < allCones.length) {
        const cone = allCones[ni];
        const vy = cone.y + newScroll;

        // Cone chegou à altura da jogadora
        if (vy >= PLAYER_Y - HIT_ZONE) {
          const px = playerXRef.current;
          // Cone à esquerda (x=0.27*FW ≈ 81) → jogadora deve estar à direita (px > FW*0.45)
          // Cone à direita (x=0.73*FW ≈ 219) → jogadora deve estar à esquerda (px < FW*0.55)
          const safe =
            (cone.side === 'left'  && px > FW * 0.42) ||
            (cone.side === 'right' && px < FW * 0.58);

          if (safe) {
            const newPassed = [...passedRef.current, cone.id];
            passedRef.current  = newPassed;
            nextIdxRef.current = ni + 1;
            setPassedIds([...newPassed]);
            setNextIdx(ni + 1);

            // Todos os cones passados
            if (ni + 1 >= allCones.length) {
              endRound('complete');
              return;
            }
          } else {
            // Bateu no cone
            endRound('hit');
            return;
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    // Timer regressivo
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endRound('time');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerRef.current);
    };
  }, [phase, levelIdx, endRound]);

  // ─── Mover ────────────────────────────────────────────────────────────────
  const move = useCallback((dir) => {
    if (phaseRef.current !== 'playing') return;
    const step = FW * 0.13;
    const nx = dir === 'left'
      ? Math.max(PLAYER_R + 4, playerXRef.current - step)
      : Math.min(FW - PLAYER_R - 4, playerXRef.current + step);
    playerXRef.current = nx;
    setPlayerX(nx);
  }, []);

  // Teclado
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft')  move('left');
      if (e.key === 'ArrowRight') move('right');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [move]);

  // Swipe
  const swipeRef = useRef(null);
  const onTouchStart = (e) => { swipeRef.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (swipeRef.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeRef.current;
    swipeRef.current = null;
    if (Math.abs(dx) > 10) move(dx < 0 ? 'left' : 'right');
  };

  const timerColor = timeLeft <= 5 ? 'text-red-500 animate-pulse' : timeLeft <= 10 ? 'text-orange-400' : 'text-green-600';
  const won = resultMsg.ok;

  // ─── MENU ──────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="space-y-5">
      <div className="text-center">
        <motion.div className="text-5xl mb-2"
          animate={{ x: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 0.85 }}>
          ⚡
        </motion.div>
        <h2 className="font-heading font-black text-2xl">Zig Zague</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Desvie dos cones — passe pelo lado certo de cada um!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: '🔶', text: 'Cone à esquerda\n→ fique à direita' },
          { icon: '↔️', text: 'Botões ← →\nou swipe' },
          { icon: '🏆', text: 'Passe o mínimo\nde cones' },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border/30 rounded-2xl p-3 space-y-1">
            <div className="text-2xl">{item.icon}</div>
            <p className="text-xs text-muted-foreground leading-tight whitespace-pre-line">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase">Nível</p>
        <div className="grid grid-cols-4 gap-1.5">
          {LEVELS.map((lvl, i) => {
            const unlocked = i <= totalWins;
            return (
              <button key={i} disabled={!unlocked} onClick={() => setLevelIdx(i)}
                className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  levelIdx === i
                    ? 'bg-primary text-primary-foreground border-primary'
                    : unlocked
                    ? 'bg-card border-border/30 hover:border-primary/40'
                    : 'opacity-25 cursor-not-allowed border-border/20'
                }`}>
                {unlocked ? `Nv.${i+1}` : '🔒'}
              </button>
            );
          })}
        </div>
        <div className="bg-muted/30 rounded-xl p-2.5 text-center">
          <p className="font-bold text-sm">{cfg.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            ⏱ {cfg.timeLimit}s · 🔶 {cfg.cones} cones · Meta: {cfg.goal}+
          </p>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={startRound}
        className="w-full py-5 rounded-3xl font-heading font-black text-xl text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
        ▶ Começar!
      </motion.button>
    </div>
  );

  // ─── JOGO ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => {
          phaseRef.current = 'menu';
          cancelAnimationFrame(rafRef.current);
          clearInterval(timerRef.current);
          setPhase('menu');
        }} className="text-sm text-muted-foreground font-semibold">
          ← Sair
        </button>
        <div className="flex items-center gap-3">
          <span className={`font-black text-xl tabular-nums ${timerColor}`}>{timeLeft}s</span>
          <span className="text-sm font-bold text-primary">{passedIds.length}/{cfg.cones}</span>
        </div>
      </div>

      {/* Progresso */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mx-1">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
          animate={{ width: `${cfg.cones > 0 ? (passedIds.length/cfg.cones)*100 : 0}%` }}
          transition={{ type: 'spring', damping: 20 }}
        />
      </div>

      {/* Campo */}
      <div
        className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10"
        style={{ width: '100%', maxWidth: 340, touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Field
          playerX={playerX}
          cones={cones}
          scroll={scroll}
          passedIds={passedIds}
          nextIdx={nextIdx}
          timeLeft={timeLeft}
          maxTime={cfg.timeLimit}
        />

        <AnimatePresence>
          {phase === 'result' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-4 ${
                won ? 'bg-green-900/88' : 'bg-red-900/88'
              }`}
            >
              <motion.div
                initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260 }}
                className="text-7xl"
              >
                {won ? '🏆' : '😅'}
              </motion.div>

              <p className="font-heading font-black text-white text-xl text-center px-4">
                {resultMsg.text}
              </p>

              <div className="flex gap-2 px-6 w-full">
                <motion.button
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.95 }} onClick={startRound}
                  className="flex-1 py-3 bg-white text-gray-900 rounded-2xl font-heading font-bold flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> De novo
                </motion.button>

                {won && levelIdx < LEVELS.length - 1 && (
                  <motion.button
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setLevelIdx(l => l + 1); setPhase('menu'); }}
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
        <div className="flex gap-3 justify-center px-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onPointerDown={() => move('left')}
            className="flex-1 max-w-[130px] h-16 rounded-2xl font-black text-white shadow-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
          >
            <ChevronLeft className="w-9 h-9" />
          </motion.button>

          <div className="flex flex-col items-center justify-center text-xs text-muted-foreground w-16 gap-0.5">
            <span className="text-xl">⚡</span>
            <span>zig-zag</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onPointerDown={() => move('right')}
            className="flex-1 max-w-[130px] h-16 rounded-2xl font-black text-white shadow-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
          >
            <ChevronRight className="w-9 h-9" />
          </motion.button>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pb-1">
        Cone 🔶 à <strong>esquerda</strong> → fique à <strong>direita</strong> · Swipe também funciona
      </p>
    </div>
  );
}
