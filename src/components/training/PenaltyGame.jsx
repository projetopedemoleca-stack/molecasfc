import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { PLAYERS } from '@/lib/gameData';
import { loadProfile } from '@/lib/playerProfile';
import { bgMusic } from '@/lib/trainingMusic';
import { LevelBadge } from './TrainingHelpers';
import { drawSticker, addSticker } from '@/lib/albumSystem.js';
import { useStickerToast } from '@/components/ui/StickerEarnedToast.jsx';

// 9 quadrantes do gol: linha 0=topo, 1=meio, 2=baixo | col 0=esq, 1=centro, 2=dir
const QUADS = [
  { id: 0, row: 0, col: 0 }, { id: 1, row: 0, col: 1 }, { id: 2, row: 0, col: 2 },
  { id: 3, row: 1, col: 0 }, { id: 4, row: 1, col: 1 }, { id: 5, row: 1, col: 2 },
  { id: 6, row: 2, col: 0 }, { id: 7, row: 2, col: 1 }, { id: 8, row: 2, col: 2 },
];

const ARROWS = [
  '↖', '↑', '↗',
  '←', '·', '→',
  '↙', '↓', '↘',
];

function quadPos(quadId) {
  const q = QUADS[quadId];
  // centra no meio de cada célula da grade 3x3 dentro do gol
  const goalLeft = 20, goalWidth = 60;
  const goalTop = 8, goalHeight = 55;
  const cellW = goalWidth / 3;
  const cellH = goalHeight / 3;
  const x = goalLeft + (q.col + 0.5) * cellW;
  const y = goalTop + (q.row + 0.5) * cellH;
  return { x, y };
}

const MAX = 5;

export default function PenaltyGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);

  const { showToast, StickerToast } = useStickerToast();
  const profile = loadProfile?.() || {};
  const playerId = profile?.selectedPlayerId || 'luna';
  const playerData = PLAYERS.find(p => p.id === playerId) || PLAYERS[0];
  const keeper = PLAYERS.find(p => p.id === 'clara') || PLAYERS[2];

  const [phase, setPhase] = useState('aiming'); // aiming | kicking | result | done
  const [selected, setSelected] = useState(null); // quadrante escolhido
  const [keeperQuad, setKeeperQuad] = useState(4); // onde a goleira vai (ao chutar)
  const [result, setResult] = useState(null); // 'goal' | 'save'
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [level, setLevel] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [idleQuad, setIdleQuad] = useState(4);
  const [kickEmoji, setKickEmoji] = useState('👟'); // quadrante atual no idle

  // goleira circula pelos quadrantes internos do gol; velocidade aumenta com nível
  const idleRef = useRef(null);
  const idleSeqRef = useRef([0,1,2,5,8,7,6,3,4]); // percurso dentro do gol
  const idleStepRef = useRef(0);

  useEffect(() => {
    if (phase !== 'aiming') { clearInterval(idleRef.current); return; }
    const interval = Math.max(220, 900 - level * 80);
    idleRef.current = setInterval(() => {
      idleStepRef.current = (idleStepRef.current + 1) % idleSeqRef.current.length;
      setIdleQuad(idleSeqRef.current[idleStepRef.current]);
    }, interval);
    return () => clearInterval(idleRef.current);
  }, [phase, level]);

  const shoot = () => {
    if (phase !== 'aiming' || selected === null) return;
    clearInterval(idleRef.current);

    // chance de acertar o quadrante cresce com nível
    const hitChance = 0.18 + level * 0.04;
    const chosenKeeper = Math.random() < hitChance ? selected : Math.floor(Math.random() * 9);
    setKeeperQuad(chosenKeeper);
    setPhase('kicking');

    setTimeout(() => {
      const saved = chosenKeeper === selected;
      setResult(saved ? 'save' : 'goal');
      if (!saved) setScore(s => s + 1);
      setPhase('result');
    }, 700);
  };

  const next = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= MAX) { setPhase('done'); return; }
    setSelected(null);
    setIdleQuad(4);
    setResult(null);
    setPhase('aiming');
  };

  const reset = () => {
    setLevel(l => Math.min(l + (score >= 4 ? 1 : 0), 10));
    setScore(0); setAttempts(0);
    setSelected(null); setIdleQuad(4); setResult(null);
    setPhase('aiming');
  };

  // posição da goleira: quadrante idle ou quadrante do chute
  const keeperPos = (phase === 'kicking' || phase === 'result')
    ? quadPos(keeperQuad)
    : quadPos(idleQuad);
  const ballPos = selected !== null ? quadPos(selected) : { x: 50, y: 85 };
  const keeperSpeed = Math.max(0.18, 0.55 - level * 0.04);

  // toggle do emoji chutador
  const toggleKickEmoji = () => setKickEmoji(e => e === '👟' ? '🦶🏽' : '👟');

  if (showTutorial) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white text-center">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-6xl mb-4">⚽</motion.div>
          <h2 className="font-heading font-bold text-2xl mb-2">Desafio de Pênaltis!</h2>
          <p className="text-sm opacity-90 mb-4">Toque em um dos 9 cantos do gol para mirar e chute! A goleira vai se mexer — tente enganá-la!</p>
          <div className="grid grid-cols-3 gap-2 text-xs mb-5">
            <div className="bg-white/20 rounded-xl p-2"><span className="text-2xl">🎯</span><p>Escolha o canto</p></div>
            <div className="bg-white/20 rounded-xl p-2"><span className="text-2xl">👀</span><p>Observe a goleira</p></div>
            <div className="bg-white/20 rounded-xl p-2"><span className="text-2xl">⚽</span><p>Engane e marque!</p></div>
          </div>
          <button onClick={() => setShowTutorial(false)} className="w-full py-3 bg-white text-green-600 rounded-2xl font-heading font-bold text-lg">
            Começar! ▶
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-xl">⚽ Pênalti</p>
          <p className="text-xs text-muted-foreground">Nível {level + 1} • {attempts}/{MAX} cobranças</p>
        </div>
        <LevelBadge level={level} />
      </div>

      {/* Campo */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl select-none" style={{ height: 320, background: 'linear-gradient(180deg, #87CEEB 0%, #b0d8f0 35%, #4caf50 35%, #388e3c 100%)' }}>
        {/* Nuvem */}
        <motion.div animate={{ x: [0, 25, 0] }} transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute top-3 left-6 text-3xl opacity-70 pointer-events-none">☁️</motion.div>

        {/* GOL — grade 3x3 clicável */}
        <div className="absolute" style={{ left: '20%', top: '8%', width: '60%', height: '55%' }}>
          {/* Trave */}
          <div className="absolute inset-0 border-4 border-white rounded-t-xl pointer-events-none z-10" />
          {/* Rede */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-25"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 10px,white 10px,white 11px),repeating-linear-gradient(90deg,transparent,transparent 10px,white 10px,white 11px)' }} />

          {/* Quadrantes clicáveis */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 z-20">
            {QUADS.map(q => (
              <button key={q.id} disabled={phase !== 'aiming'}
                onClick={() => setSelected(q.id)}
                className={`flex items-center justify-center text-lg font-bold transition-all border border-white/20 ${
                  selected === q.id
                    ? 'bg-yellow-400/60 border-yellow-300 border-2 scale-95'
                    : phase === 'aiming' ? 'hover:bg-white/25 active:bg-white/40 bg-white/5' : 'bg-transparent'
                }`}>
                {phase === 'aiming' && (
                  <span className={`text-base drop-shadow ${selected === q.id ? 'text-yellow-200' : 'text-white/60'}`}>
                    {ARROWS[q.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Goleira — luvas circulando nos quadrantes */}
        <motion.div
          className="absolute z-30 pointer-events-none flex items-center justify-center"
          style={{ width: 48, height: 48, marginLeft: -24, marginTop: -24 }}
          animate={{
            left: `${keeperPos.x}%`,
            top: `${keeperPos.y}%`,
          }}
          transition={phase === 'kicking'
            ? { duration: 0.28, ease: 'easeOut' }
            : { duration: keeperSpeed, ease: 'easeInOut' }
          }
        >
          <motion.span
            className="text-4xl drop-shadow-xl block"
            animate={{ rotate: phase === 'aiming' ? [0, -12, 12, -8, 8, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >🧤</motion.span>
        </motion.div>

        {/* Bola */}
        <motion.div className="absolute z-40 pointer-events-none"
          style={{ width: 32, height: 32, translateX: '-50%', translateY: '-50%' }}
          animate={{
            left: phase === 'kicking' || phase === 'result' ? `${ballPos.x}%` : '50%',
            top: phase === 'kicking' || phase === 'result' ? `${ballPos.y}%` : '88%',
            scale: phase === 'kicking' ? [1, 0.85, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <motion.span className="text-3xl block drop-shadow-lg"
            animate={phase === 'kicking' ? { rotate: 540 } : { rotate: 0 }}
            transition={{ duration: 0.55 }}>⚽</motion.span>
        </motion.div>

        {/* Emoji chutador — clique para trocar */}
        <div className="absolute z-20" style={{ bottom: 8, left: '50%', transform: 'translateX(-50%)' }}>
          <motion.span
            className="text-5xl drop-shadow-lg block cursor-pointer select-none"
            onClick={toggleKickEmoji}
            title="Toque para trocar"
            animate={phase === 'kicking' ? { rotate: [-10, 35], y: [0, -10] } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}>
            {kickEmoji}
          </motion.span>
        </div>

        {/* Overlay resultado */}
        <AnimatePresence>
          {phase === 'result' && result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
              <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className={`px-8 py-5 rounded-3xl text-center shadow-2xl ${result === 'goal' ? 'bg-green-500' : 'bg-red-500'}`}>
                <motion.div className="text-6xl mb-1"
                  animate={result === 'goal' ? { scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] } : { x: [0, -10, 10, -8, 8, 0] }}
                  transition={{ duration: 0.5 }}>
                  {result === 'goal' ? '⚽' : '🧤'}
                </motion.div>
                <p className="font-heading font-bold text-3xl text-white">
                  {result === 'goal' ? 'GOOOOOL!' : 'DEFENDEU!'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instrução de mira */}
      {phase === 'aiming' && (
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground font-medium">
            {selected === null ? '👆 Toque em um quadrante do gol para mirar' : `🎯 Mirando ${ARROWS[selected]} — pronta para chutar!`}
          </p>
          <p className="text-xs text-muted-foreground/70">
            👟🦶 Toque no pé/tênis no campo para trocar como chuta!
          </p>
        </div>
      )}

      {/* Botão chutar */}
      {phase === 'aiming' && (
        <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          whileTap={{ scale: 0.96 }} onClick={shoot} disabled={selected === null}
          className={`w-full py-4 rounded-2xl font-heading font-bold text-lg shadow-lg transition-all ${
            selected !== null
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}>
          ⚽ CHUTAR!
        </motion.button>
      )}

      {/* Próxima tentativa */}
      {phase === 'result' && (
        <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          whileTap={{ scale: 0.96 }} onClick={next}
          className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold">
          {attempts + 1 >= MAX ? 'Ver Resultado 🏁' : 'Próxima Cobrança ▶'}
        </motion.button>
      )}

      {/* Placar */}
      <div className="bg-card rounded-2xl border border-border/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-muted-foreground">Gols marcados</span>
          <span className="font-heading font-bold text-3xl text-primary">{score}</span>
          <span className="text-xs text-muted-foreground">de {MAX}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            animate={{ width: `${(score / MAX) * 100}%` }} transition={{ type: 'spring', stiffness: 80 }} />
        </div>
        <div className="flex gap-1 mt-2 justify-center">
          {Array.from({ length: MAX }).map((_, i) => (
            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < attempts ? (i < score ? 'bg-green-500 text-white' : 'bg-red-400 text-white') : 'bg-muted'}`}>
              {i < attempts ? (i < score ? '⚽' : '🧤') : '·'}
            </div>
          ))}
        </div>
      </div>

      {/* Tela final */}
      {phase === 'done' && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-3 pt-2"
          onAnimationComplete={() => {
            if (score >= 2) {
              const rarity = score >= 5 ? 'epic' : score >= 4 ? 'rare' : 'uncommon';
              const def = drawSticker('minigame_penalty', rarity);
              const result = addSticker(def.id, 'minigame_penalty', true);
              if (result) showToast({ ...result, definition: def });
            }
          }}
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-5xl">
            {score >= 4 ? '🏆' : score >= 2 ? '👍' : '💪'}
          </motion.div>
          <p className="font-heading font-bold text-2xl">
            {score >= 4 ? 'Craque dos Pênaltis!' : score >= 2 ? 'Bom jogo!' : 'Continue treinando!'}
          </p>
          <p className="text-sm text-muted-foreground">{score}/{MAX} gols • {score >= 4 ? 'Subiu de nível! 🌟' : 'Tente de novo!'}</p>
          <button onClick={reset} className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-heading font-bold">
            <RotateCcw className="w-4 h-4" /> Jogar Novamente
          </button>
        </motion.div>
      )}
      <StickerToast />
    </div>
  );
}