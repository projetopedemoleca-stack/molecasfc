import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

// ── Configuração de níveis ────────────────────────────────────────────────────
const LEVELS = [
  { label: 'Nível 1', defSpeed: 1.8, passWindow: 2200, mates: 2, desc: 'Marcador lento — passe com calma!' },
  { label: 'Nível 2', defSpeed: 2.4, passWindow: 1900, mates: 2, desc: 'Um pouco mais rápido...' },
  { label: 'Nível 3', defSpeed: 3.0, passWindow: 1600, mates: 3, desc: '3 companheiras! Escolha bem.' },
  { label: 'Nível 4', defSpeed: 3.7, passWindow: 1400, mates: 3, desc: 'Marcadora rápida — reaja rápido!' },
  { label: 'Nível 5', defSpeed: 4.4, passWindow: 1100, mates: 4, desc: 'Bobinho raiz — pressão máxima!' },
];

// Posições fixas das companheiras no campo (% do container)
const MATE_POSITIONS = [
  { x: 15, y: 20 },
  { x: 75, y: 15 },
  { x: 10, y: 65 },
  { x: 80, y: 70 },
];

// Posição inicial do jogador com bola
const PLAYER_START = { x: 45, y: 50 };

// Posição inicial do marcador
const DEF_START = { x: 50, y: 20 };

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Anima o marcador em direção ao portador da bola
function stepToward(from, to, speed) {
  const d = dist(from, to);
  if (d < speed) return { ...to };
  const ratio = speed / d;
  return { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio };
}

export default function BobinhoGame({ onStickerEarned }) {
  const [phase, setPhase]       = useState('menu'); // menu | playing | passed | caught | levelup | win
  const [level, setLevel]       = useState(0);
  const [score, setScore]       = useState(0);
  const [passes, setPasses]     = useState(0);     // passes bem-sucedidos no nível
  const [lives, setLives]       = useState(3);
  const [ballOwner, setBallOwner] = useState('player'); // 'player' | índice da mate
  const [playerPos, setPlayerPos] = useState(PLAYER_START);
  const [defPos, setDefPos]     = useState(DEF_START);
  const [matePositions, setMatePositions] = useState([]);
  const [passAnim, setPassAnim] = useState(null); // { from, to } para a animação da bola viajando
  const [dangerLevel, setDangerLevel] = useState(0); // 0-1 quão perto o marcador está
  const [hint, setHint]         = useState('');
  const [flash, setFlash]       = useState(null); // 'caught' | 'pass'
  const [receiverIdx, setReceiverIdx] = useState(null); // índice da mate que vai receber

  const rafRef    = useRef(null);
  const stateRef  = useRef({});
  const passTimerRef = useRef(null); // depois de receber, mate fica com a bola por um tempo

  const cfg = LEVELS[level] || LEVELS[0];
  const PASS_GOAL = 8; // passes por nível para avançar
  const CATCH_DIST = 8; // % de distância para ser pego

  // ── Inicializar nível ─────────────────────────────────────────────────────────
  const initLevel = useCallback((lvl) => {
    const c = LEVELS[lvl] || LEVELS[0];
    const mates = MATE_POSITIONS.slice(0, c.mates).map((p, i) => ({ ...p, id: i }));
    setLevel(lvl);
    setPlayerPos(PLAYER_START);
    setDefPos(DEF_START);
    setMatePositions(mates);
    setBallOwner('player');
    setPassAnim(null);
    setReceiverIdx(null);
    setDangerLevel(0);
    setHint('Toque numa companheira para passar!');
    setPhase('playing');
  }, []);

  // ── Loop do marcador ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') { cancelAnimationFrame(rafRef.current); return; }

    let last = performance.now();

    const loop = (now) => {
      const dt = (now - last) / 16; // ~1 a 60fps normalizado
      last = now;

      // Quem tem a bola?
      const owner = stateRef.current.ballOwner;
      const mates = stateRef.current.matePositions || [];
      let target;
      if (owner === 'player') {
        target = stateRef.current.playerPos;
      } else {
        target = mates[owner] || PLAYER_START;
      }

      setDefPos(prev => {
        const c = LEVELS[stateRef.current.level] || LEVELS[0];
        const next = stepToward(prev, target, c.defSpeed * dt * 0.055);
        const d = dist(next, target);
        setDangerLevel(Math.max(0, 1 - d / 45));

        // Pegou!
        if (d < CATCH_DIST) {
          cancelAnimationFrame(rafRef.current);
          setFlash('caught');
          setTimeout(() => setFlash(null), 700);
          const newLives = stateRef.current.lives - 1;
          setLives(newLives);
          if (newLives <= 0) {
            setPhase('gameover');
          } else {
            // Recomeça o nível
            initLevel(stateRef.current.level);
          }
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, initLevel]);

  // Sincroniza stateRef
  useEffect(() => {
    stateRef.current = { ballOwner, playerPos, defPos, matePositions, level, lives };
  }, [ballOwner, playerPos, defPos, matePositions, level, lives]);

  // ── Passe para uma companheira ────────────────────────────────────────────────
  const passTo = useCallback((idx) => {
    if (phase !== 'playing') return;
    if (ballOwner !== 'player') return; // só pode passar quando tem a bola

    const mate = matePositions[idx];
    if (!mate) return;

    cancelAnimationFrame(rafRef.current);

    // Anima o passe
    setPassAnim({ from: { ...playerPos }, to: { ...mate } });
    setReceiverIdx(idx);

    setTimeout(() => {
      setPassAnim(null);
      setBallOwner(idx);
      setFlash('pass');
      setTimeout(() => setFlash(null), 500);

      const newPasses = stateRef.current.passes + 1;
      setPasses(newPasses);
      const newScore = stateRef.current.score + (level + 1) * 5;
      setScore(newScore);

      // Depois de um tempo, a companheira devolve a bola para o jogador
      const c = LEVELS[stateRef.current.level] || LEVELS[0];
      passTimerRef.current = setTimeout(() => {
        // Devolve: anima bola voltando
        setPassAnim({ from: { ...mate }, to: { ...PLAYER_START } });
        setTimeout(() => {
          setPassAnim(null);
          setBallOwner('player');
          setReceiverIdx(null);

          // Verifica se completou o nível
          if (newPasses >= PASS_GOAL) {
            const nextLvl = stateRef.current.level + 1;
            if (nextLvl >= LEVELS.length) {
              setPhase('win');
            } else {
              setPhase('levelup');
              setTimeout(() => initLevel(nextLvl), 1800);
            }
          }
          // Reinicia o loop
        }, 400);
      }, c.passWindow);
    }, 350);
  }, [phase, ballOwner, playerPos, matePositions, level, initLevel]);

  // Sincroniza passes e score no ref
  useEffect(() => { stateRef.current.passes = passes; }, [passes]);
  useEffect(() => { stateRef.current.score = score; }, [score]);

  // ── Danger color ──────────────────────────────────────────────────────────────
  const dangerColor = `rgba(239,68,68,${(dangerLevel * 0.35).toFixed(2)})`;

  // ── MENU ─────────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
      {/* Animação preview */}
      <div style={{ position: 'relative', width: 220, height: 160,
        borderRadius: 16, overflow: 'hidden',
        background: 'linear-gradient(160deg,#14532d,#166534,#15803d)',
        boxShadow: '0 8px 32px rgba(21,128,61,0.4)' }}>
        {/* Grade */}
        <svg style={{ position: 'absolute', inset: 0 }} width="220" height="160">
          <circle cx="110" cy="80" r="35" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
          <line x1="0" y1="80" x2="220" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <line x1="110" y1="0" x2="110" y2="160" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        </svg>
        {/* Bonequinhos decorativos */}
        <motion.div animate={{ x: [0, 30, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: 80, top: 60, fontSize: 28 }}>⚽</motion.div>
        <div style={{ position: 'absolute', left: 30, top: 30, fontSize: 24 }}>👧</div>
        <div style={{ position: 'absolute', right: 30, top: 25, fontSize: 24 }}>👧</div>
        <motion.div animate={{ x: [0, 18, 36, 18, 0], y: [0, 10, 0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', left: 85, top: 35, fontSize: 20 }}>😤</motion.div>
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
          <div className="flex gap-2"><span>🏆</span><span>8 passes por nível para avançar — 5 níveis!</span></div>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
        onClick={() => { setPasses(0); setScore(0); setLives(3); initLevel(0); }}
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
          onClick={() => { setPasses(0); setScore(0); setLives(3); initLevel(0); }}
          className="flex-1 py-3 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-bold rounded-xl shadow"
        >
          Jogar de Novo
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { setPasses(0); setScore(0); setLives(3); setPhase('menu'); }}
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
        transition={{ duration: 0.6, repeat: 2 }} className="text-6xl"
      >🏆</motion.div>
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
        onClick={() => { setPasses(0); setScore(0); setLives(3); initLevel(0); }}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-black text-xl rounded-2xl shadow-lg"
      >
        Jogar de Novo
      </motion.button>
    </motion.div>
  );

  // ── PLAYING / LEVELUP ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 pt-2 pb-6 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <motion.span key={i} animate={i >= lives ? { scale: [1,0.5], opacity: [1,0.2] } : {}}
              className="text-xl"
            >{i < lives ? '❤️' : '🖤'}</motion.span>
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

      {/* Barra de progresso de passes */}
      <div className="w-full max-w-sm h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full"
          animate={{ width: `${(passes / PASS_GOAL) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120 }}
        />
      </div>

      {/* Campo */}
      <div
        style={{
          position: 'relative',
          width: '100%', maxWidth: 360,
          aspectRatio: '1 / 1.1',
          borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(160deg,#14532d 0%,#166534 50%,#15803d 100%)',
          boxShadow: '0 8px 32px rgba(21,128,61,0.35)',
          border: '2px solid rgba(255,255,255,0.15)',
        }}
      >
        {/* Flash de perigo/passe */}
        <AnimatePresence>
          {flash === 'caught' && (
            <motion.div key="caught"
              initial={{ opacity: 0.85 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ position: 'absolute', inset: 0, background: '#ef4444', zIndex: 50, pointerEvents: 'none' }}
            />
          )}
          {flash === 'pass' && (
            <motion.div key="pass"
              initial={{ opacity: 0.7 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ position: 'absolute', inset: 0, background: '#22c55e', zIndex: 50, pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>

        {/* Overlay de perigo gradual */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: dangerColor,
          transition: 'background 0.2s',
        }} />

        {/* Linhas do campo SVG */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <ellipse cx="50%" cy="50%" rx="28%" ry="28%" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          {/* Linhas verticais das zonas */}
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
        </svg>

        {/* Companheiras */}
        {matePositions.map((mate, idx) => {
          const hasBall = ballOwner === idx;
          const isReceiving = receiverIdx === idx;
          return (
            <motion.div
              key={idx}
              onClick={() => passTo(idx)}
              animate={hasBall ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, repeat: hasBall ? Infinity : 0 }}
              style={{
                position: 'absolute',
                left: `${mate.x}%`, top: `${mate.y}%`,
                transform: 'translate(-50%,-50%)',
                cursor: 'pointer',
                zIndex: 20,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              {/* Bola na companheira */}
              {hasBall && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ fontSize: 14, marginBottom: -4 }}
                >⚽</motion.div>
              )}
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: hasBall
                  ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                  : 'linear-gradient(135deg,#4ade80,#22c55e)',
                border: hasBall ? '3px solid #fbbf24' : '2px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                boxShadow: hasBall
                  ? '0 0 18px rgba(251,191,36,0.7)'
                  : ballOwner === 'player' ? '0 0 12px rgba(74,222,128,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                {['👧', '👧🏾', '👧🏿', '👧🏻'][idx % 4]}
              </div>
              {/* Label "PASSAR" pulsando quando tem a bola o jogador */}
              {ballOwner === 'player' && (
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6], y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{
                    background: 'rgba(0,0,0,0.55)', borderRadius: 8,
                    padding: '1px 6px', fontSize: 9, color: 'white',
                    fontWeight: 700, letterSpacing: 0.5, marginTop: 2,
                  }}
                >
                  PASSAR
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Jogador (com bola) */}
        <div style={{
          position: 'absolute',
          left: `${playerPos.x}%`, top: `${playerPos.y}%`,
          transform: 'translate(-50%,-50%)',
          zIndex: 25,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
          {ballOwner === 'player' && (
            <motion.div
              animate={{ y: [-3, 0, -3] }} transition={{ duration: 0.7, repeat: Infinity }}
              style={{ fontSize: 16, marginBottom: -2 }}
            >⚽</motion.div>
          )}
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            background: ballOwner === 'player'
              ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)'
              : 'linear-gradient(135deg,#64748b,#475569)',
            border: ballOwner === 'player' ? '3px solid #60a5fa' : '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            boxShadow: ballOwner === 'player'
              ? '0 0 20px rgba(59,130,246,0.7)'
              : '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            🧑‍🦱
          </div>
          <div style={{
            background: 'rgba(59,130,246,0.8)', borderRadius: 8,
            padding: '1px 6px', fontSize: 9, color: 'white', fontWeight: 700,
          }}>
            VOCÊ
          </div>
        </div>

        {/* Marcador */}
        <motion.div
          style={{
            position: 'absolute',
            left: `${defPos.x}%`, top: `${defPos.y}%`,
            transform: 'translate(-50%,-50%)',
            zIndex: 30,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: 'linear-gradient(135deg,#dc2626,#ef4444)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            boxShadow: `0 0 ${12 + dangerLevel * 20}px rgba(239,68,68,${0.4 + dangerLevel * 0.5})`,
          }}>
            😤
          </div>
          <div style={{
            background: 'rgba(220,38,38,0.85)', borderRadius: 8,
            padding: '1px 6px', fontSize: 9, color: 'white', fontWeight: 700,
          }}>
            MARCADOR
          </div>
        </motion.div>

        {/* Animação da bola voando */}
        <AnimatePresence>
          {passAnim && (
            <motion.div
              key="ball-anim"
              initial={{ left: `${passAnim.from.x}%`, top: `${passAnim.from.y}%`, scale: 1.2 }}
              animate={{ left: `${passAnim.to.x}%`, top: `${passAnim.to.y}%`, scale: 0.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                transform: 'translate(-50%,-50%)',
                fontSize: 20, zIndex: 40, pointerEvents: 'none',
              }}
            >
              ⚽
            </motion.div>
          )}
        </AnimatePresence>

        {/* Levelup overlay */}
        <AnimatePresence>
          {phase === 'levelup' && (
            <motion.div
              key="levelup"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(21,128,61,0.92)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 60, borderRadius: 18,
              }}
            >
              <div style={{ fontSize: 52 }}>🎉</div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 26, fontFamily: 'system-ui' }}>Nível {level + 1} completo!</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 6 }}>
                {LEVELS[level + 1]?.label || ''}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dica */}
      <motion.p
        key={dangerLevel > 0.7 ? 'danger' : 'normal'}
        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        className={`text-sm font-semibold text-center ${dangerLevel > 0.7 ? 'text-red-500' : 'text-gray-500'}`}
      >
        {dangerLevel > 0.7 ? '⚠️ PASSA LOGO!' : ballOwner === 'player' ? 'Toque numa companheira para passar' : 'Companheira com a bola — marcador veio atrás!'}
      </motion.p>

      {/* Info do nível */}
      <div className="text-xs text-gray-400 text-center">{cfg.desc}</div>

      {/* Restart */}
      <motion.button whileTap={{ scale: 0.9 }}
        onClick={() => { setPasses(0); setScore(0); setLives(3); initLevel(0); }}
        className="flex items-center gap-2 text-gray-400 text-sm mt-1"
      >
        <RotateCcw className="w-4 h-4" /> Recomeçar
      </motion.button>
    </div>
  );
}
