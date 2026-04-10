import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

// ── Configuração de níveis ────────────────────────────────────────────────────
const LEVELS = [
  { label: 'Nível 1', defSpeed: 0.12, passWindow: 2200, mates: 2, desc: 'Marcador lento — passe com calma!' },
  { label: 'Nível 2', defSpeed: 0.17, passWindow: 1900, mates: 2, desc: 'Um pouco mais rápido...' },
  { label: 'Nível 3', defSpeed: 0.22, passWindow: 1600, mates: 3, desc: '3 companheiras! Escolha bem.' },
  { label: 'Nível 4', defSpeed: 0.28, passWindow: 1400, mates: 3, desc: 'Marcadora rápida — reaja rápido!' },
  { label: 'Nível 5', defSpeed: 0.36, passWindow: 1100, mates: 4, desc: 'Bobinho raiz — pressão máxima!' },
];

const MATE_POSITIONS = [
  { x: 15, y: 20 },
  { x: 75, y: 15 },
  { x: 10, y: 65 },
  { x: 80, y: 70 },
];

const PLAYER_POS  = { x: 45, y: 50 };
const DEF_START   = { x: 50, y: 10 };
const CATCH_DIST  = 7;   // % de distância para ser pego
const PASS_GOAL   = 8;   // passes por nível

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function stepToward(from, to, speed) {
  const d = dist(from, to);
  if (d <= speed) return { x: to.x, y: to.y };
  return {
    x: from.x + ((to.x - from.x) / d) * speed,
    y: from.y + ((to.y - from.y) / d) * speed,
  };
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function BobinhoGame({ onStickerEarned }) {
  // ── UI state (só para re-render) ─────────────────────────────────────────────
  const [phase, setPhase]           = useState('menu');
  const [score, setScore]           = useState(0);
  const [passes, setPasses]         = useState(0);
  const [lives, setLives]           = useState(3);
  const [level, setLevel]           = useState(0);
  const [defXY, setDefXY]           = useState(DEF_START);
  const [dangerLevel, setDangerLevel] = useState(0);
  const [ballOwner, setBallOwner]   = useState('player'); // 'player' | índice mate
  const [passAnim, setPassAnim]     = useState(null);
  const [receiverIdx, setReceiverIdx] = useState(null);
  const [matePositions, setMatePositions] = useState([]);
  const [flash, setFlash]           = useState(null);
  const [levelupMsg, setLevelupMsg] = useState(false);

  // ── Game state em refs (sem stale closure) ───────────────────────────────────
  const g = useRef({
    phase: 'menu',
    level: 0,
    score: 0,
    passes: 0,
    lives: 3,
    defX: DEF_START.x,
    defY: DEF_START.y,
    ballOwner: 'player',   // 'player' | índice numérico da mate
    mates: [],             // [{x,y}]
    passing: false,        // bloqueio durante animação de passe
    returnTimer: null,
    flashTimer: null,
    lastTime: 0,
  });
  const rafRef    = useRef(null);
  const phaseRef  = useRef('menu');

  // ── Inicia ou reinicia um nível ───────────────────────────────────────────────
  const initLevel = useCallback((lvl, currentLives, currentScore, currentPasses) => {
    const cfg = LEVELS[lvl] || LEVELS[0];
    const mates = MATE_POSITIONS.slice(0, cfg.mates);

    // Zera ref de jogo
    g.current = {
      ...g.current,
      phase: 'playing',
      level: lvl,
      defX: DEF_START.x,
      defY: DEF_START.y,
      ballOwner: 'player',
      mates,
      passing: false,
      lives: currentLives ?? 3,
      score: currentScore ?? 0,
      passes: currentPasses ?? 0,
    };

    // Sincroniza UI state
    setLevel(lvl);
    setLives(g.current.lives);
    setScore(g.current.score);
    setPasses(g.current.passes);
    setDefXY(DEF_START);
    setMatePositions(mates);
    setBallOwner('player');
    setPassAnim(null);
    setReceiverIdx(null);
    setDangerLevel(0);
    setFlash(null);
    phaseRef.current = 'playing';
    setPhase('playing');
  }, []);

  // ── RAF loop principal ────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);

      if (phaseRef.current !== 'playing') return;

      const dt = g.current.lastTime ? Math.min((now - g.current.lastTime) / 16, 3) : 1;
      g.current.lastTime = now;

      if (g.current.passing) return; // pausa movimento durante animação de passe

      const cfg = LEVELS[g.current.level] || LEVELS[0];

      // Alvo: quem tem a bola
      let tx, ty;
      if (g.current.ballOwner === 'player') {
        tx = PLAYER_POS.x;
        ty = PLAYER_POS.y;
      } else {
        const m = g.current.mates[g.current.ballOwner];
        if (!m) { tx = PLAYER_POS.x; ty = PLAYER_POS.y; }
        else { tx = m.x; ty = m.y; }
      }

      // Move marcador em direção ao alvo
      const from = { x: g.current.defX, y: g.current.defY };
      const to   = { x: tx, y: ty };
      const next = stepToward(from, to, cfg.defSpeed * dt);
      g.current.defX = next.x;
      g.current.defY = next.y;

      // Atualiza UI do marcador
      setDefXY({ x: next.x, y: next.y });

      // Perigo
      const d = dist(next, { x: tx, y: ty });
      const danger = Math.max(0, Math.min(1, 1 - d / 45));
      setDangerLevel(danger);

      // Pegou?
      if (d < CATCH_DIST) {
        g.current.passing = true; // trava loop
        phaseRef.current = 'catching';

        setFlash('caught');
        setTimeout(() => setFlash(null), 700);

        const newLives = g.current.lives - 1;
        g.current.lives = newLives;
        setLives(newLives);

        if (newLives <= 0) {
          phaseRef.current = 'gameover';
          setPhase('gameover');
        } else {
          // Recomeça o nível após delay
          setTimeout(() => {
            initLevel(g.current.level, newLives, g.current.score, g.current.passes);
          }, 900);
        }
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [initLevel]); // RAF roda para sempre — phase controlada por phaseRef

  // ── Passe para companheira ────────────────────────────────────────────────────
  const passTo = useCallback((idx) => {
    if (phaseRef.current !== 'playing') return;
    if (g.current.ballOwner !== 'player') return;
    if (g.current.passing) return;

    const mate = g.current.mates[idx];
    if (!mate) return;

    // Bloqueia novos passes durante a animação
    g.current.passing = true;

    // Atualiza posse → companheira (ref imediata)
    g.current.ballOwner = idx;
    setBallOwner(idx);
    setReceiverIdx(idx);

    // Anima bola voando
    setPassAnim({ from: { ...PLAYER_POS }, to: { ...mate } });

    setTimeout(() => {
      setPassAnim(null);
      setFlash('pass');
      setTimeout(() => setFlash(null), 400);

      // Atualiza pontuação
      const newPasses = g.current.passes + 1;
      const newScore  = g.current.score + (g.current.level + 1) * 5;
      g.current.passes = newPasses;
      g.current.score  = newScore;
      setPasses(newPasses);
      setScore(newScore);

      // Desbloqueia o loop enquanto companheira tem a bola
      g.current.passing = false;

      const cfg = LEVELS[g.current.level] || LEVELS[0];

      // Após passWindow, companheira devolve
      g.current.returnTimer = setTimeout(() => {
        if (phaseRef.current !== 'playing') return;

        // Bloqueia brevemente para animar retorno
        g.current.passing = true;
        g.current.ballOwner = 'player';
        setBallOwner('player');
        setReceiverIdx(null);
        setPassAnim({ from: { ...mate }, to: { ...PLAYER_POS } });

        setTimeout(() => {
          setPassAnim(null);
          g.current.passing = false;

          // Verifica avanço de nível
          if (g.current.passes >= PASS_GOAL) {
            const nextLvl = g.current.level + 1;
            if (nextLvl >= LEVELS.length) {
              phaseRef.current = 'win';
              setPhase('win');
            } else {
              setLevelupMsg(true);
              setTimeout(() => {
                setLevelupMsg(false);
                initLevel(nextLvl, g.current.lives, g.current.score, 0);
              }, 1600);
            }
          }
        }, 380);
      }, cfg.passWindow);
    }, 340);
  }, [initLevel]);

  const cfg = LEVELS[level] || LEVELS[0];
  const dangerColor = `rgba(239,68,68,${(dangerLevel * 0.38).toFixed(2)})`;

  // ── MENU ─────────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
      <div style={{
        position: 'relative', width: 220, height: 160, borderRadius: 16,
        overflow: 'hidden',
        background: 'linear-gradient(160deg,#14532d,#166534,#15803d)',
        boxShadow: '0 8px 32px rgba(21,128,61,0.4)',
      }}>
        <svg style={{ position: 'absolute', inset: 0 }} width="220" height="160">
          <circle cx="110" cy="80" r="35" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
          <line x1="0" y1="80" x2="220" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        </svg>
        <div style={{ position: 'absolute', left: 30,  top: 30,  fontSize: 28 }}>👧</div>
        <div style={{ position: 'absolute', right: 30, top: 25,  fontSize: 28 }}>👧</div>
        <motion.div style={{ position: 'absolute', left: 88, top: 64, fontSize: 26 }}
          animate={{ x: [0, 28, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>⚽</motion.div>
        <motion.div style={{ position: 'absolute', left: 84, top: 32, fontSize: 22 }}
          animate={{ x: [0, 14, 28, 14, 0], y: [0, 8, 0, -8, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}>😤</motion.div>
      </div>

      <div className="text-center">
        <h1 className="font-heading font-black text-3xl text-primary mb-1">Bobinho!</h1>
        <p className="text-gray-500 text-sm">Passe a bola antes que o marcador te pegue</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-md w-full max-w-xs">
        <h3 className="font-bold text-gray-700 mb-3 text-sm">Como jogar</h3>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex gap-2"><span>👧</span><span>Toque numa companheira para passar a bola</span></div>
          <div className="flex gap-2"><span>😤</span><span>O marcador persegue quem está com a bola</span></div>
          <div className="flex gap-2"><span>⚽</span><span>A companheira devolve depois de um tempo</span></div>
          <div className="flex gap-2"><span>🏆</span><span>{PASS_GOAL} passes por nível — 5 níveis no total!</span></div>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
        onClick={() => { g.current.passes = 0; initLevel(0, 3, 0, 0); }}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-black text-xl rounded-2xl shadow-lg"
      >
        Jogar Bobinho ⚽
      </motion.button>
    </div>
  );

  // ── GAME OVER ─────────────────────────────────────────────────────────────────
  if (phase === 'gameover') return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4 text-center"
    >
      <div className="text-6xl">😤</div>
      <div>
        <h1 className="font-heading font-black text-3xl text-red-500 mb-1">Peguei você!</h1>
        <p className="text-gray-500">O marcador foi mais rápido desta vez...</p>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 w-full max-w-xs">
        <div className="text-4xl font-black text-red-500">{score}</div>
        <div className="text-gray-500 text-sm mt-1">pontos</div>
        <div className="text-gray-400 text-xs mt-2">{passes} passes no total</div>
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { initLevel(0, 3, 0, 0); }}
          className="flex-1 py-3 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-bold rounded-xl shadow"
        >
          Jogar de Novo
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { phaseRef.current = 'menu'; setPhase('menu'); }}
          className="py-3 px-4 bg-gray-100 text-gray-600 font-bold rounded-xl"
        >
          Menu
        </motion.button>
      </div>
    </motion.div>
  );

  // ── WIN ───────────────────────────────────────────────────────────────────────
  if (phase === 'win') return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4 text-center"
    >
      <motion.div animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: 2 }} className="text-6xl">🏆</motion.div>
      <div>
        <h1 className="font-heading font-black text-3xl text-primary mb-1">Rainha do Bobinho!</h1>
        <p className="text-gray-500">Você completou todos os níveis!</p>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-green-100 rounded-2xl p-6 w-full max-w-xs">
        <div className="text-5xl font-black text-primary">{score}</div>
        <div className="text-gray-500 text-sm mt-1">pontos finais</div>
        <div className="text-gray-400 text-xs mt-2">{passes} passes no total</div>
      </div>
      <motion.button whileTap={{ scale: 0.95 }}
        onClick={() => { initLevel(0, 3, 0, 0); }}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-black text-xl rounded-2xl shadow-lg"
      >
        Jogar de Novo
      </motion.button>
    </motion.div>
  );

  // ── CAMPO (playing) ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 pt-2 pb-6 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <span key={i} className="text-xl">{i < lives ? '❤️' : '🖤'}</span>
          ))}
        </div>
        <div className="text-center">
          <div className="font-heading font-black text-primary leading-none">{cfg.label}</div>
          <div className="text-xs text-gray-400">{passes}/{PASS_GOAL} passes</div>
        </div>
        <div className="text-right">
          <div className="font-heading font-black text-xl text-primary">{score}</div>
          <div className="text-xs text-gray-400">pts</div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full max-w-sm h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full"
          animate={{ width: `${Math.min((passes / PASS_GOAL) * 100, 100)}%` }}
          transition={{ type: 'spring', stiffness: 120 }}
        />
      </div>

      {/* Campo */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 360,
        aspectRatio: '1 / 1.05', borderRadius: 20, overflow: 'hidden',
        background: 'linear-gradient(160deg,#14532d 0%,#166534 50%,#15803d 100%)',
        boxShadow: '0 8px 32px rgba(21,128,61,0.35)',
        border: '2px solid rgba(255,255,255,0.15)',
      }}>
        {/* Flash de perigo/passe */}
        <AnimatePresence>
          {flash === 'caught' && (
            <motion.div key="caught" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ position: 'absolute', inset: 0, background: '#ef4444', zIndex: 50, pointerEvents: 'none' }}
            />
          )}
          {flash === 'pass' && (
            <motion.div key="pass" initial={{ opacity: 0.65 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ position: 'absolute', inset: 0, background: '#22c55e', zIndex: 50, pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>

        {/* Overlay de perigo */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: dangerColor, transition: 'background 0.15s',
        }} />

        {/* Linhas do campo */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <ellipse cx="50%" cy="50%" rx="28%" ry="26%" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          <circle cx="50%" cy="50%" r="3" fill="rgba(255,255,255,0.2)"/>
        </svg>

        {/* Companheiras */}
        {matePositions.map((mate, idx) => {
          const hasBall = ballOwner === idx;
          return (
            <motion.div key={idx}
              onClick={() => passTo(idx)}
              animate={hasBall ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, repeat: hasBall ? Infinity : 0 }}
              style={{
                position: 'absolute',
                left: `${mate.x}%`, top: `${mate.y}%`,
                transform: 'translate(-50%,-50%)',
                cursor: 'pointer', zIndex: 20,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              {hasBall && (
                <motion.div animate={{ y: [-3, 0, -3] }} transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ fontSize: 14, marginBottom: -4 }}>⚽</motion.div>
              )}
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: hasBall
                  ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                  : 'linear-gradient(135deg,#4ade80,#22c55e)',
                border: hasBall ? '3px solid #fef3c7' : '2px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                boxShadow: hasBall
                  ? '0 0 20px rgba(251,191,36,0.8)'
                  : ballOwner === 'player'
                    ? '0 0 14px rgba(74,222,128,0.6)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                {['👧', '👧🏾', '👧🏿', '👧🏻'][idx % 4]}
              </div>
              {ballOwner === 'player' && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5], y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{
                    background: 'rgba(0,0,0,0.6)', borderRadius: 8,
                    padding: '1px 7px', fontSize: 9, color: 'white',
                    fontWeight: 800, letterSpacing: 0.5,
                  }}
                >
                  PASSAR
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Jogador */}
        <div style={{
          position: 'absolute',
          left: `${PLAYER_POS.x}%`, top: `${PLAYER_POS.y}%`,
          transform: 'translate(-50%,-50%)',
          zIndex: 25,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
          {ballOwner === 'player' && (
            <motion.div animate={{ y: [-3, 0, -3] }} transition={{ duration: 0.7, repeat: Infinity }}
              style={{ fontSize: 16, marginBottom: -2 }}>⚽</motion.div>
          )}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: ballOwner === 'player'
              ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)'
              : 'linear-gradient(135deg,#64748b,#475569)',
            border: ballOwner === 'player' ? '3px solid #93c5fd' : '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
            boxShadow: ballOwner === 'player'
              ? '0 0 22px rgba(59,130,246,0.7)'
              : '0 2px 8px rgba(0,0,0,0.3)',
          }}>🧑‍🦱</div>
          <div style={{
            background: 'rgba(59,130,246,0.85)', borderRadius: 8,
            padding: '1px 7px', fontSize: 9, color: 'white', fontWeight: 800,
          }}>VOCÊ</div>
        </div>

        {/* Marcador */}
        <div style={{
          position: 'absolute',
          left: `${defXY.x}%`, top: `${defXY.y}%`,
          transform: 'translate(-50%,-50%)',
          zIndex: 30,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg,#dc2626,#ef4444)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            boxShadow: `0 0 ${10 + dangerLevel * 22}px rgba(239,68,68,${0.4 + dangerLevel * 0.5})`,
          }}>😤</div>
          <div style={{
            background: 'rgba(220,38,38,0.85)', borderRadius: 8,
            padding: '1px 7px', fontSize: 9, color: 'white', fontWeight: 800,
          }}>MARCADOR</div>
        </div>

        {/* Bola voando no passe */}
        <AnimatePresence>
          {passAnim && (
            <motion.div key="ball"
              initial={{ left: `${passAnim.from.x}%`, top: `${passAnim.from.y}%`, scale: 1.3, opacity: 1 }}
              animate={{ left: `${passAnim.to.x}%`,   top: `${passAnim.to.y}%`,   scale: 0.9, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              style={{
                position: 'absolute', transform: 'translate(-50%,-50%)',
                fontSize: 22, zIndex: 40, pointerEvents: 'none',
              }}
            >⚽</motion.div>
          )}
        </AnimatePresence>

        {/* Level up overlay */}
        <AnimatePresence>
          {levelupMsg && (
            <motion.div key="lvlup"
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, background: 'rgba(21,128,61,0.93)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 60, borderRadius: 18,
              }}
            >
              <div style={{ fontSize: 52 }}>🎉</div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 26 }}>Nível {level + 1} completo!</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 6 }}>
                {LEVELS[level + 1]?.label || ''}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dica dinâmica */}
      <p className={`text-sm font-semibold text-center transition-colors ${dangerLevel > 0.7 ? 'text-red-500' : 'text-gray-500'}`}>
        {dangerLevel > 0.7
          ? '⚠️ PASSA LOGO!'
          : ballOwner === 'player'
            ? 'Toque numa companheira para passar'
            : 'Companheira segura — marcador foi buscar!'}
      </p>

      <div className="text-xs text-gray-400 text-center">{cfg.desc}</div>

      <motion.button whileTap={{ scale: 0.9 }}
        onClick={() => { initLevel(0, 3, 0, 0); }}
        className="flex items-center gap-2 text-gray-400 text-sm mt-1"
      >
        <RotateCcw className="w-4 h-4" /> Recomeçar
      </motion.button>
    </div>
  );
}
