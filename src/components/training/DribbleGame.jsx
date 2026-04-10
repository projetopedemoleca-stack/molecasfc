import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { bgMusic } from '@/lib/trainingMusic';

// ─── Velocidade por nível ─────────────────────────────────────────────────────
const LEVELS = [
  { label: 'Iniciante',    timeMs: 2200, goal: 8  },
  { label: 'Amadora',      timeMs: 1900, goal: 10 },
  { label: 'Juvenil',      timeMs: 1600, goal: 12 },
  { label: 'Sub-20',       timeMs: 1350, goal: 14 },
  { label: 'Profissional', timeMs: 1100, goal: 16 },
  { label: 'Seleção',      timeMs: 900,  goal: 18 },
  { label: 'Marta Mode',   timeMs: 700,  goal: 20 },
];

function nextSide(prev) {
  // evita repetir o mesmo lado mais de 2x seguidos
  return Math.random() > 0.5 ? 'left' : 'right';
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function DribbleGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);

  const [levelIdx, setLevelIdx]   = useState(0);
  const [phase, setPhase]         = useState('menu'); // menu | playing | feedback | gameover
  const [score, setScore]         = useState(0);
  const [lives, setLives]         = useState(3);
  const [coneSide, setConeSide]   = useState('left');
  const [progress, setProgress]   = useState(1);     // 1 = cheio → 0 = perdeu
  const [feedback, setFeedback]   = useState(null);  // 'good' | 'miss' | 'wrong'
  const [totalWins, setTotalWins] = useState(0);
  const [combo, setCombo]         = useState(0);

  const phaseRef    = useRef('menu');
  const progressRef = useRef(1);
  const rafRef      = useRef(null);
  const lastTsRef   = useRef(null);
  const livesRef    = useRef(3);
  const scoreRef    = useRef(0);
  const comboRef    = useRef(0);

  const cfg = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

  // ─── Novo cone ──────────────────────────────────────────────────────────────
  const spawnCone = useCallback(() => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    setConeSide(side);
    setProgress(1);
    progressRef.current = 1;
    lastTsRef.current = null;
    phaseRef.current = 'playing';
    setPhase('playing');
  }, []);

  // ─── Iniciar jogo ───────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    setScore(0);    scoreRef.current = 0;
    setLives(3);    livesRef.current = 3;
    setCombo(0);    comboRef.current = 0;
    spawnCone();
  }, [spawnCone]);

  // ─── Loop de progresso ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const c = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

    const loop = (ts) => {
      if (phaseRef.current !== 'playing') return;
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      const newProg = Math.max(0, progressRef.current - dt / c.timeMs);
      progressRef.current = newProg;
      setProgress(newProg);

      if (newProg <= 0) {
        // Tempo esgotado = perdeu vida
        phaseRef.current = 'feedback';
        setPhase('feedback');
        comboRef.current = 0;
        setCombo(0);
        setFeedback('miss');
        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);
        setTimeout(() => {
          if (newLives <= 0) {
            phaseRef.current = 'gameover';
            setPhase('gameover');
          } else {
            spawnCone();
          }
        }, 700);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, levelIdx, spawnCone]);

  // ─── Jogadora pressiona botão ────────────────────────────────────────────────
  const dodge = useCallback((dir) => {
    if (phaseRef.current !== 'playing') return;
    cancelAnimationFrame(rafRef.current);
    phaseRef.current = 'feedback';
    setPhase('feedback');

    // Cone à esquerda → deve ir para DIREITA (e vice-versa)
    const correct = (coneSide === 'left' && dir === 'right') ||
                    (coneSide === 'right' && dir === 'left');

    if (correct) {
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      setCombo(newCombo);
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
      setFeedback('good');

      const c = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
      const won = newScore >= c.goal;
      if (won) {
        setTotalWins(w => w + 1);
        setTimeout(() => {
          phaseRef.current = 'gameover';
          setPhase('gameover');
        }, 600);
      } else {
        setTimeout(spawnCone, 500);
      }
    } else {
      comboRef.current = 0;
      setCombo(0);
      setFeedback('wrong');
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      setTimeout(() => {
        if (newLives <= 0) {
          phaseRef.current = 'gameover';
          setPhase('gameover');
        } else {
          spawnCone();
        }
      }, 700);
    }
  }, [coneSide, levelIdx, spawnCone]);

  // ─── Teclado ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft')  dodge('left');
      if (e.key === 'ArrowRight') dodge('right');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [dodge]);

  const won   = phase === 'gameover' && scoreRef.current >= cfg.goal;
  const pct   = Math.round(progress * 100);
  const timerColor = progress > 0.5 ? '#22c55e' : progress > 0.25 ? '#f97316' : '#ef4444';

  // ─── MENU ───────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="space-y-5">
      <div className="text-center">
        <motion.div className="text-5xl mb-2"
          animate={{ x: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 0.9 }}>
          ⚡
        </motion.div>
        <h2 className="font-heading font-black text-2xl">Zig Zague</h2>
        <p className="text-muted-foreground text-sm mt-1">
          O cone vem de um lado — desvie para o outro!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: '🔶', text: 'Cone à esquerda\n→ pressione ←' },
          { icon: '⚡', text: 'Reaja rápido\navant de o tempo!' },
          { icon: '❤️', text: '3 vidas\npara começar' },
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
            ⏱ {(cfg.timeMs/1000).toFixed(1)}s por cone · Meta: {cfg.goal} dribles
          </p>
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={startGame}
        className="w-full py-5 rounded-3xl font-heading font-black text-xl text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
        ▶ Começar!
      </motion.button>
    </div>
  );

  // ─── GAME OVER ───────────────────────────────────────────────────────────────
  if (phase === 'gameover') return (
    <div className="space-y-5 text-center">
      <motion.div className="text-7xl"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260 }}>
        {won ? '🏆' : '😅'}
      </motion.div>

      <div>
        <h2 className="font-heading font-black text-2xl">
          {won ? 'Incrível! Passou!' : 'Fim de jogo!'}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {score} / {cfg.goal} dribles · {won ? '🌟 Meta atingida!' : '💪 Tente de novo!'}
        </p>
        {combo >= 3 && (
          <p className="text-purple-600 font-bold text-sm mt-1">🔥 Maior combo: x{combo}</p>
        )}
      </div>

      <div className="flex gap-2 justify-center">
        <motion.button whileTap={{ scale: 0.95 }} onClick={startGame}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-heading font-bold">
          <RotateCcw className="w-4 h-4" /> De novo
        </motion.button>
        {won && levelIdx < LEVELS.length - 1 && (
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { setLevelIdx(l => l + 1); setPhase('menu'); }}
            className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-2xl font-heading font-bold">
            Próximo →
          </motion.button>
        )}
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => setPhase('menu')}
          className="bg-muted text-muted-foreground px-4 py-3 rounded-2xl font-bold text-sm">
          Menu
        </motion.button>
      </div>
    </div>
  );

  // ─── JOGO ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => { cancelAnimationFrame(rafRef.current); setPhase('menu'); }}
          className="text-sm text-muted-foreground font-semibold">
          ← Sair
        </button>
        <div className="flex items-center gap-3">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
          ))}
          <span className="font-black text-lg text-primary">{score}<span className="text-muted-foreground font-normal text-sm">/{cfg.goal}</span></span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden mx-1">
        <motion.div
          className="h-full rounded-full transition-none"
          style={{ width: `${pct}%`, background: timerColor }}
        />
      </div>

      {/* Arena */}
      <div className="relative mx-auto rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl"
        style={{ background: 'linear-gradient(180deg,#14532d,#166534)', height: 280, maxWidth: 340 }}>

        {/* Listras do campo */}
        {[0,1,2,3,4].map(i => (
          <div key={i} className="absolute top-0 bottom-0"
            style={{ left: `${i*20}%`, width: '20%',
              background: i%2===0 ? 'rgba(0,0,0,0.07)' : 'transparent' }} />
        ))}

        {/* Linha central */}
        <div className="absolute left-0 right-0" style={{ top: '50%', height:1, background:'rgba(255,255,255,0.15)' }} />

        {/* Cone */}
        <AnimatePresence mode="wait">
          {(phase === 'playing' || phase === 'feedback') && (
            <motion.div
              key={`${coneSide}-${score}`}
              initial={{ x: coneSide === 'left' ? -80 : 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="absolute"
              style={{
                left: coneSide === 'left' ? '18%' : '62%',
                top: '30%',
                fontSize: 52,
                filter: feedback === 'miss' || feedback === 'wrong' ? 'grayscale(1)' : 'none',
              }}
            >
              🔶
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jogadora */}
        <AnimatePresence>
          <motion.div
            key={feedback}
            className="absolute text-5xl"
            style={{ left: '50%', bottom: '10%', transform: 'translateX(-50%)' }}
            animate={
              feedback === 'good'  ? { x: coneSide === 'left' ? 40 : -40, scale: 1.2 } :
              feedback === 'wrong' ? { rotate: [0, -15, 15, 0] } :
              feedback === 'miss'  ? { opacity: [1, 0.3, 1] } :
              { x: 0, scale: 1, rotate: 0, opacity: 1 }
            }
            transition={{ duration: 0.35 }}
          >
            ⚽
          </motion.div>
        </AnimatePresence>

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="font-heading font-black text-4xl drop-shadow-lg">
                {feedback === 'good'  ? (combo >= 3 ? `🔥 x${combo}` : '✅') :
                 feedback === 'wrong' ? '❌' : '⏰'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador lado */}
        {phase === 'playing' && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <span className="text-white/60 text-xs font-bold">
              {coneSide === 'left' ? '← cone à esquerda' : 'cone à direita →'}
            </span>
          </div>
        )}

        {/* Combo badge */}
        {combo >= 3 && phase === 'playing' && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-3 right-3 bg-purple-600 text-white rounded-full px-2 py-1 text-xs font-black"
          >
            🔥 x{combo}
          </motion.div>
        )}
      </div>

      {/* Botões de desvio */}
      <div className="flex gap-3 px-2">
        <motion.button
          whileTap={{ scale: 0.88, x: -8 }}
          onPointerDown={() => dodge('left')}
          disabled={phase !== 'playing'}
          className="flex-1 py-6 rounded-3xl font-heading font-black text-white text-2xl shadow-xl disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
        >
          ←
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.88, x: 8 }}
          onPointerDown={() => dodge('right')}
          disabled={phase !== 'playing'}
          className="flex-1 py-6 rounded-3xl font-heading font-black text-white text-2xl shadow-xl disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
        >
          →
        </motion.button>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-1">
        Cone <strong>esquerda 🔶</strong> → aperte <strong>←</strong> · Também funciona no teclado
      </p>
    </div>
  );
}
