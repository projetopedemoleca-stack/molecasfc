import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle, XCircle, Star } from 'lucide-react';
import { bgMusic } from '@/lib/trainingMusic';
import { audio } from '@/lib/audioEngine';

// ─── Situações de conduta ───────────────────────────────────────────────────
const SITUATIONS = [
  {
    id: 'diving',
    title: 'Simulação de Falta',
    description: 'Você está no ataque e cai na área fingindo ter sido derrubado. O juiz não viu, mas você sabe que não foi tocado.',
    options: [
      { text: 'Continuar fingindo para ganhar o pênalti', points: -20, feedback: '❌ Errado! Simulação é antiética e pode dar cartão amarelo.' },
      { text: 'Levantar e continuar jogando', points: 15, feedback: '✅ Correto! Honradez é fundamental no esporte.' },
      { text: 'Reclamar com o juiz', points: 5, feedback: '⚠️ Neutro. Melhor não reclamar sem motivo.' }
    ]
  },
  {
    id: 'injured_opponent',
    title: 'Adversário Machucado',
    description: 'Seu adversário se machucou e está no chão pedindo atendimento médico. Você tem uma chance clara de gol.',
    options: [
      { text: 'Chutar no gol mesmo assim', points: -25, feedback: '❌ Muito errado! Falta de respeito humano.' },
      { text: 'Parar o jogo e esperar o atendimento', points: 20, feedback: '✅ Excelente! Mostra respeito e fair play.' },
      { text: 'Chutar para longe e esperar', points: 10, feedback: '✅ Bom! Pelo menos não aproveitou a situação.' }
    ]
  },
  {
    id: 'referee_decision',
    title: 'Decisão do Árbitro',
    description: 'O juiz marca uma falta a seu favor que você sabe que não existiu. Seu time está perdendo por 1 gol.',
    options: [
      { text: 'Aceitar a decisão e continuar', points: 15, feedback: '✅ Correto! Árbitros são humanos e erram.' },
      { text: 'Protestar veementemente', points: -10, feedback: '❌ Errado! Pode levar cartão e prejudicar o time.' },
      { text: 'Fazer sinal de que não foi falta', points: 10, feedback: '✅ Bom! Mostra honestidade sem confrontar.' }
    ]
  },
  {
    id: 'teammate_foul',
    title: 'Falta do Companheiro',
    description: 'Seu companheiro de time comete uma falta dura e o juiz não viu. Você é o capitão.',
    options: [
      { text: 'Não dizer nada ao juiz', points: -15, feedback: '❌ Errado! Falta de liderança e honestidade.' },
      { text: 'Chamar o juiz e confessar a falta', points: 20, feedback: '✅ Heróico! Mostra integridade máxima.' },
      { text: 'Conversar com o companheiro no intervalo', points: 5, feedback: '⚠️ Neutro. Melhor resolver internamente.' }
    ]
  },
  {
    id: 'celebration',
    title: 'Comemoração',
    description: 'Você marca um gol importante e seus companheiros querem fazer uma comemoração provocativa contra o time adversário.',
    options: [
      { text: 'Fazer a comemoração provocativa', points: -10, feedback: '❌ Errado! Pode causar confusão no jogo.' },
      { text: 'Comemorar normalmente com o time', points: 10, feedback: '✅ Correto! Respeito acima de tudo.' },
      { text: 'Não comemorar para não provocar', points: 15, feedback: '✅ Excelente! Mostra maturidade.' }
    ]
  },
  {
    id: 'opponent_celebration',
    title: 'Comemoração do Adversário',
    description: 'O adversário marca um gol e faz uma comemoração ofensiva contra você pessoalmente.',
    options: [
      { text: 'Responder com agressão verbal', points: -20, feedback: '❌ Muito errado! Pode levar expulsão.' },
      { text: 'Ignorar e focar no jogo', points: 15, feedback: '✅ Correto! Profissionalismo acima de tudo.' },
      { text: 'Fazer sinal de fair play', points: 10, feedback: '✅ Bom! Mostra classe.' }
    ]
  },
  {
    id: 'coach_instructions',
    title: 'Instruções do Técnico',
    description: 'Seu técnico pede para você atrasar o reinício do jogo propositalmente quando o time adversário está machucado.',
    options: [
      { text: 'Seguir as instruções do técnico', points: -15, feedback: '❌ Errado! Antiético e contra as regras.' },
      { text: 'Ignorar e reiniciar normalmente', points: 20, feedback: '✅ Correto! Você é responsável por suas ações.' },
      { text: 'Perguntar se tem certeza', points: 5, feedback: '⚠️ Neutro. Melhor não participar.' }
    ]
  },
  {
    id: 'fan_behavior',
    title: 'Comportamento da Torcida',
    description: 'A torcida adversária está fazendo cânticos ofensivos contra você. Você está com a bola.',
    options: [
      { text: 'Fazer gestos para a torcida', points: -15, feedback: '❌ Errado! Pode piorar a situação.' },
      { text: 'Concentrar-se no jogo', points: 15, feedback: '✅ Correto! Profissionalismo é chave.' },
      { text: 'Pedir calma ao juiz', points: 10, feedback: '✅ Bom! Mostra liderança.' }
    ]
  }
];

// ─── Componente Principal ───────────────────────────────────────────────────
export default function ConductGame({ onComplete, onBack }) {
  const [currentSituation, setCurrentSituation] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  // Timer
  useEffect(() => {
    if (!isPlaying || showFeedback || gameComplete) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, showFeedback, gameComplete]);

  // Música de fundo
  useEffect(() => {
    if (isPlaying) {
      bgMusic.play('training');
    } else {
      bgMusic.stop();
    }
    return () => bgMusic.stop();
  }, [isPlaying]);

  const startGame = () => {
    setIsPlaying(true);
    setCurrentSituation(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(30);
    setShowFeedback(false);
    setSelectedOption(null);
    setGameComplete(false);
  };

  const handleTimeout = () => {
    setSelectedOption({ points: -5, feedback: '⏰ Tempo esgotado! Pense mais rápido da próxima vez.' });
    setShowFeedback(true);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowFeedback(true);

    // Atualizar score e streak
    const newScore = score + option.points;
    setScore(newScore);

    if (option.points > 0) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));
    } else {
      setStreak(0);
    }
  };

  const nextSituation = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    setTimeLeft(30);

    if (currentSituation < SITUATIONS.length - 1) {
      setCurrentSituation(currentSituation + 1);
    } else {
      setGameComplete(true);
      setIsPlaying(false);
    }
  };

  const getScoreGrade = () => {
    const percentage = (score / (SITUATIONS.length * 20)) * 100;
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', emoji: '🏆' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-600', emoji: '⭐' };
    if (percentage >= 40) return { grade: 'C', color: 'text-yellow-600', emoji: '⚠️' };
    return { grade: 'D', color: 'text-red-600', emoji: '❌' };
  };

  const getReward = () => {
    const grade = getScoreGrade();
    if (grade.grade === 'A') return 3;
    if (grade.grade === 'B') return 2;
    if (grade.grade === 'C') return 1;
    return 0;
  };

  if (gameComplete) {
    const grade = getScoreGrade();
    const stickers = getReward();

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-6xl mb-4"
          >
            {grade.emoji}
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Treino Concluído!</h2>
          <p className="text-gray-600 mb-4">Jogo de Conduta e Ética</p>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span>Pontos:</span>
              <span className="font-bold text-lg">{score} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Maior Sequência:</span>
              <span className="font-bold">{maxStreak}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Nota:</span>
              <span className={`font-bold text-xl ${grade.color}`}>{grade.grade}</span>
            </div>
            {stickers > 0 && (
              <div className="flex justify-between items-center">
                <span>Figurinhas Ganhas:</span>
                <span className="font-bold text-purple-600">{stickers} 💎</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onComplete?.({ score, grade: grade.grade, stickers, game: 'conduct' })}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-3 rounded-xl"
            >
              Continuar
            </motion.button>
            <button
              onClick={startGame}
              className="w-full bg-gray-200 text-gray-700 font-bold py-2 rounded-xl"
            >
              Jogar Novamente
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <div className="text-6xl mb-4">🤝</div>
          <h1 className="text-3xl font-bold mb-2">Conduta e Ética</h1>
          <p className="text-gray-600 mb-6">
            Tome decisões éticas em situações difíceis do futebol.
            Mostre que você é uma jogadora justa e respeitosa!
          </p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold mb-2">Como Jogar:</h3>
            <ul className="text-sm text-left space-y-1">
              <li>• Leia cada situação com atenção</li>
              <li>• Escolha a opção mais ética</li>
              <li>• Você tem 30 segundos por decisão</li>
              <li>• Mantenha a sequência para bônus!</li>
            </ul>
          </div>

          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-4 rounded-xl text-lg"
            >
              🎮 Começar Treino
            </motion.button>
            <button
              onClick={onBack}
              className="w-full bg-gray-200 text-gray-700 font-bold py-2 rounded-xl"
            >
              ← Voltar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const situation = SITUATIONS[currentSituation];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 p-4">
      {/* Header */}
      <div className="max-w-md mx-auto mb-4">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={onBack}
            className="bg-white/20 text-white px-3 py-1 rounded-lg font-bold"
          >
            ← Voltar
          </button>
          <div className="text-white text-sm font-bold">
            {currentSituation + 1} / {SITUATIONS.length}
          </div>
        </div>

        <div className="flex justify-between items-center text-white text-sm mb-2">
          <span>Pontos: {score}</span>
          <span>Sequência: {streak}</span>
        </div>

        {/* Timer */}
        <div className="bg-white/20 rounded-full h-2 mb-4">
          <motion.div
            className="bg-white h-full rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 30) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Situação */}
      <motion.div
        key={currentSituation}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        className="max-w-md mx-auto bg-white rounded-3xl p-6 shadow-2xl mb-4"
      >
        <h2 className="text-xl font-bold mb-3 text-center">{situation.title}</h2>
        <p className="text-gray-700 mb-6 text-center">{situation.description}</p>

        <div className="space-y-3">
          {situation.options.map((option, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionSelect(option)}
              disabled={showFeedback}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 p-4 rounded-xl text-left transition-colors"
            >
              {option.text}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && selectedOption && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="max-w-md mx-auto bg-white rounded-3xl p-6 shadow-2xl"
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">
                {selectedOption.points > 0 ? '✅' : selectedOption.points < 0 ? '❌' : '⚠️'}
              </div>
              <p className="font-bold text-lg mb-2">
                {selectedOption.points > 0 ? 'Boa decisão!' : selectedOption.points < 0 ? 'Decisão questionável' : 'Decisão neutra'}
              </p>
              <p className="text-gray-600">{selectedOption.feedback}</p>
              {selectedOption.points !== 0 && (
                <p className={`font-bold text-lg mt-2 ${selectedOption.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedOption.points > 0 ? '+' : ''}{selectedOption.points} pontos
                </p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={nextSituation}
              className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl"
            >
              {currentSituation < SITUATIONS.length - 1 ? 'Próxima Situação' : 'Ver Resultado'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function buildObstacles(level) {
  const cfg = LEVELS[level];
  const h = genHObstacles(cfg.hCount, []);
  const v = genVObstacles(cfg.vCount, h);
  return [...h, ...v];
}

function moveObstacles(obs) {
  return obs.map(o => {
    if (o.type === 'h') {
      let nc = o.col + o.dir;
      let nd = o.dir;
      if (nc < 0)       { nc = 0;       nd = 1;  }
      if (nc >= COLS)   { nc = COLS - 1; nd = -1; }
      return { ...o, col: nc, dir: nd };
    } else {
      // vertical: fica entre row 1 e row ROWS-2 (não vai ao gol nem início)
      let nr = o.row + o.dir;
      let nd = o.dir;
      if (nr < 1)         { nr = 1;       nd = 1;  }
      if (nr >= ROWS - 1) { nr = ROWS - 2; nd = -1; }
      return { ...o, row: nr, dir: nd };
    }
  });
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ConductGame({ onStickerEarned }) {
  const [phase, setPhase]   = useState('menu'); // menu | playing | goal | hit | complete
  const [level, setLevel]   = useState(0);
  const [ball, setBall]     = useState(INIT_BALL);
  const [obs, setObs]       = useState([]);
  const [score, setScore]   = useState(0);
  const [lives, setLives]   = useState(3);
  const [trail, setTrail]   = useState([]);
  const [flash, setFlash]   = useState(null); // 'hit' | 'goal'
  const [goalsLevel, setGoalsLevel] = useState(0); // gols no nível atual (precisa 3 p/ avançar)

  const timerRef = useRef(null);

  // ── Iniciar nível ────────────────────────────────────────────────────────────
  const startLevel = useCallback((lvl) => {
    setLevel(lvl);
    setBall(INIT_BALL);
    setTrail([]);
    setObs(buildObstacles(lvl));
    setGoalsLevel(0);
    setPhase('playing');
  }, []);

  // ── Loop de obstáculos ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') { clearInterval(timerRef.current); return; }
    const cfg = LEVELS[level];
    timerRef.current = setInterval(() => {
      setObs(prev => moveObstacles(prev));
    }, cfg.speed);
    return () => clearInterval(timerRef.current);
  }, [phase, level]);

  // ── Detectar colisão com obstáculos ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const hit = obs.some(o => o.col === ball.col && o.row === ball.row);
    if (hit) {
      clearInterval(timerRef.current);
      setFlash('hit');
      setTimeout(() => setFlash(null), 600);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setPhase('complete');
      } else {
        setBall(INIT_BALL);
        setTrail([]);
        setPhase('playing');
      }
    }
    // Detectar gol: chegou na linha 0
    if (ball.row === 0) {
      clearInterval(timerRef.current);
      setFlash('goal');
      const newScore = score + (level + 1) * 10;
      setScore(newScore);
      const newGoalsLevel = goalsLevel + 1;
      setGoalsLevel(newGoalsLevel);
      setTimeout(() => {
        setFlash(null);
        if (newGoalsLevel >= 3) {
          // Avança de nível após 3 gols
          const nextLevel = level + 1;
          if (nextLevel >= LEVELS.length) {
            setPhase('complete');
          } else {
            startLevel(nextLevel);
          }
        } else {
          // Reinicia posição, mantém obstáculos
          setBall(INIT_BALL);
          setTrail([]);
          setPhase('playing');
        }
      }, 900);
      setPhase('goal');
    }
  }, [ball, obs, phase]);

  // ── Mover bola via teclado ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const handle = (e) => {
      const dirs = {
        ArrowUp: [0, -1], ArrowDown: [0, 1],
        ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
      };
      const d = dirs[e.key];
      if (!d) return;
      e.preventDefault();
      setBall(prev => {
        const nc = Math.max(0, Math.min(COLS - 1, prev.col + d[0]));
        const nr = Math.max(0, Math.min(ROWS - 1, prev.row + d[1]));
        setTrail(t => [...t.slice(-6), { col: prev.col, row: prev.row }]);
        return { col: nc, row: nr };
      });
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [phase]);

  // ── Mover bola via swipe/tap ──────────────────────────────────────────────────
  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e) => {
    if (!touchStart.current || phase !== 'playing') return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    let d;
    if (Math.abs(dx) > Math.abs(dy)) d = dx > 0 ? [1, 0] : [-1, 0];
    else d = dy > 0 ? [0, 1] : [0, -1];
    setBall(prev => {
      const nc = Math.max(0, Math.min(COLS - 1, prev.col + d[0]));
      const nr = Math.max(0, Math.min(ROWS - 1, prev.row + d[1]));
      setTrail(t => [...t.slice(-6), { col: prev.col, row: prev.row }]);
      return { col: nc, row: nr };
    });
    touchStart.current = null;
  };

  // ── D-pad para mobile ─────────────────────────────────────────────────────────
  const moveDir = (dx, dy) => {
    if (phase !== 'playing') return;
    setBall(prev => {
      const nc = Math.max(0, Math.min(COLS - 1, prev.col + dx));
      const nr = Math.max(0, Math.min(ROWS - 1, prev.row + dy));
      setTrail(t => [...t.slice(-6), { col: prev.col, row: prev.row }]);
      return { col: nc, row: nr };
    });
  };

  const CELL = 58; // px por célula
  const levelCfg = LEVELS[level] || LEVELS[0];

  // ── Cores das células ─────────────────────────────────────────────────────────
  function cellBg(c, r) {
    const isTrail = trail.some(t => t.col === c && t.row === r);
    const isObs   = obs.some(o => o.col === c && o.row === r);
    if (r === 0) return '#065f46'; // zona do gol
    if (isTrail) return '#bbf7d0';
    if ((c + r) % 2 === 0) return '#f0fdf4';
    return '#dcfce7';
  }

  const isObs = (c, r) => obs.some(o => o.col === c && o.row === r);

  // ── MENU ─────────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
      {/* Campo decorativo mini */}
      <div className="relative">
        <div style={{
          width: 180, height: 180, borderRadius: 16,
          background: 'linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%)',
          boxShadow: '0 8px 32px rgba(21,128,61,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
            {/* Grade */}
            {[36, 72, 108, 144].map(x => <line key={x} x1={x} y1="0" x2={x} y2="180" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>)}
            {[36, 72, 108, 144].map(y => <line key={y} x1="0" y1={y} x2="180" y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>)}
            {/* Gol */}
            <rect x="54" y="4" width="72" height="28" rx="4" fill="none" stroke="white" strokeWidth="2"/>
            {/* Círculo central */}
            <circle cx="90" cy="90" r="28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            {/* Bola */}
            <circle cx="90" cy="138" r="10" fill="white"/>
            <path d="M 83 133 L 90 128 L 97 133 L 94 141 L 86 141 Z" fill="#1a1a1a" opacity="0.7"/>
          </svg>
        </div>
        {/* Obstáculos animados decorativos */}
        <motion.div animate={{ x: [0, 80, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 60, left: 10, width: 20, height: 20, borderRadius: 4, background: '#ef4444', opacity: 0.85 }} />
        <motion.div animate={{ y: [0, 80, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 10, left: 120, width: 20, height: 20, borderRadius: 4, background: '#f97316', opacity: 0.85 }} />
      </div>

      <div className="text-center">
        <h1 className="font-heading font-black text-3xl text-primary mb-1">Condução</h1>
        <p className="text-gray-500 text-sm">Conduza a bola até o gol desviando dos obstáculos</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-md w-full max-w-xs">
        <h3 className="font-bold text-gray-700 mb-3 text-sm">Como jogar</h3>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex gap-2 items-start"><span className="text-lg">⬆️</span><span>Use as setas ou D-pad para mover a bola</span></div>
          <div className="flex gap-2 items-start"><span className="text-lg">⚽</span><span>Chegue ao gol (área verde escura) 3 vezes por nível</span></div>
          <div className="flex gap-2 items-start"><span className="text-lg">🟧</span><span>Evite os obstáculos — você tem 3 vidas</span></div>
          <div className="flex gap-2 items-start"><span className="text-lg">⚡</span><span>A cada nível mais rápido e mais obstáculos!</span></div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
        onClick={() => startLevel(0)}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-black text-xl rounded-2xl shadow-lg"
      >
        Jogar Agora ⚽
      </motion.button>
    </div>
  );

  // ── COMPLETE ─────────────────────────────────────────────────────────────────
  if (phase === 'complete') return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4 text-center"
    >
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
      </motion.div>
      <div>
        <h1 className="font-heading font-black text-3xl text-primary mb-1">
          {lives <= 0 ? 'Fim de Jogo!' : 'CAMPEÃ!'}
        </h1>
        <p className="text-gray-500">{lives <= 0 ? 'Suas vidas acabaram...' : 'Você completou todos os níveis!'}</p>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-green-100 rounded-2xl p-6 w-full max-w-xs">
        <div className="text-5xl font-black text-primary">{score}</div>
        <div className="text-gray-500 text-sm mt-1">pontos conquistados</div>
        <div className="flex justify-around mt-4 text-sm">
          <div><div className="font-bold text-primary">{level + 1}</div><div className="text-gray-400">Nível</div></div>
          <div><div className="font-bold text-red-500">{lives}</div><div className="text-gray-400">Vidas</div></div>
        </div>
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setScore(0); setLives(3); startLevel(0); }}
          className="flex-1 py-3 bg-gradient-to-r from-primary to-green-500 text-white font-heading font-bold rounded-xl shadow-md"
        >
          Jogar de Novo
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setScore(0); setLives(3); setPhase('menu'); }}
          className="py-3 px-4 bg-gray-100 text-gray-600 font-heading font-bold rounded-xl"
        >
          Menu
        </motion.button>
      </div>
    </motion.div>
  );

  // ── PLAYING / GOAL / HIT ──────────────────────────────────────────────────────
  const gridW = COLS * CELL;
  const gridH = ROWS * CELL;

  return (
    <div
      className="flex flex-col items-center gap-4 pt-2 pb-6 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-xs px-1">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className={`text-xl transition-all ${i < lives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
          ))}
        </div>
        <div className="text-center">
          <div className="font-heading font-black text-primary text-lg leading-none">{levelCfg.label}</div>
          <div className="flex gap-1 justify-center mt-0.5">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < goalsLevel ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="font-heading font-black text-xl text-primary">{score}</div>
          <div className="text-xs text-gray-400">pts</div>
        </div>
      </div>

      {/* Campo */}
      <div style={{ position: 'relative', width: gridW, height: gridH }}>
        {/* Flash de colisão ou gol */}
        <AnimatePresence>
          {flash === 'hit' && (
            <motion.div key="hit" initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', inset: 0, background: '#ef4444', borderRadius: 12, zIndex: 50, pointerEvents: 'none' }}
            />
          )}
          {flash === 'goal' && (
            <motion.div key="goal" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{ position: 'absolute', inset: 0, background: '#22c55e', borderRadius: 12, zIndex: 50, pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>

        {/* Grade de células */}
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const isGoalArea = r === 0;
            const obs = isObs(c, r);
            const isTrailCell = trail.some(t => t.col === c && t.row === r);
            const isBall = ball.col === c && ball.row === r;

            return (
              <div
                key={`${c}-${r}`}
                style={{
                  position: 'absolute',
                  left: c * CELL, top: r * CELL,
                  width: CELL, height: CELL,
                  boxSizing: 'border-box',
                  border: '1px solid rgba(21,128,61,0.15)',
                  background: isGoalArea
                    ? 'linear-gradient(180deg,#064e3b 0%,#065f46 100%)'
                    : (c + r) % 2 === 0 ? '#f0fdf4' : '#dcfce7',
                  borderRadius: isGoalArea && r === 0 ? (c === 0 ? '12px 0 0 0' : c === COLS - 1 ? '0 12px 0 0' : 0) : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.1s',
                }}
              >
                {/* Linha do gol */}
                {isGoalArea && c === Math.floor(COLS / 2) && (
                  <span style={{ fontSize: 22, opacity: 0.9, filter: 'drop-shadow(0 0 4px white)' }}>🥅</span>
                )}
                {/* Rastro */}
                {isTrailCell && !isBall && (
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: 'rgba(21,128,61,0.4)',
                    boxShadow: '0 0 6px rgba(21,128,61,0.3)',
                  }} />
                )}
              </div>
            );
          })
        )}

        {/* Obstáculos (renderizados sobre a grade) */}
        <AnimatePresence>
          {obs.map(o => (
            <motion.div
              key={o.id}
              layout
              transition={{ duration: 0.12, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                left: o.col * CELL + 4,
                top: o.row * CELL + 4,
                width: CELL - 8, height: CELL - 8,
                borderRadius: o.type === 'h' ? '8px' : '6px',
                background: o.type === 'h'
                  ? 'linear-gradient(135deg,#dc2626,#ef4444)'
                  : 'linear-gradient(135deg,#ea580c,#f97316)',
                boxShadow: `0 2px 12px ${o.type === 'h' ? 'rgba(220,38,38,0.5)' : 'rgba(234,88,12,0.5)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, zIndex: 10,
              }}
            >
              {o.type === 'h' ? '🦺' : '🔵'}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bola */}
        <motion.div
          key={`ball-${ball.col}-${ball.row}`}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            position: 'absolute',
            left: ball.col * CELL + 6,
            top: ball.row * CELL + 6,
            width: CELL - 12, height: CELL - 12,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, white 0%, #e5e7eb 60%, #9ca3af 100%)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, zIndex: 20,
          }}
        >
          ⚽
        </motion.div>

        {/* Mensagem de gol */}
        <AnimatePresence>
          {flash === 'goal' && (
            <motion.div
              key="goalMsg"
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1.2, opacity: 1, y: -10 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 60, pointerEvents: 'none',
              }}
            >
              <div style={{
                background: 'white', borderRadius: 16,
                padding: '12px 28px', fontWeight: 900, fontSize: 28,
                fontFamily: 'system-ui', color: '#15803d',
                boxShadow: '0 8px 32px rgba(21,128,61,0.4)',
              }}>
                GOOOOL! ⚽
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info do nível */}
      <div className="text-center text-xs text-gray-400 px-4">{levelCfg.desc}</div>

      {/* D-pad */}
      <div className="flex flex-col items-center gap-1 mt-1">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => moveDir(0, -1)}
          className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl active:bg-green-50"
        >
          ⬆️
        </motion.button>
        <div className="flex gap-1">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => moveDir(-1, 0)}
            className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl active:bg-green-50"
          >
            ⬅️
          </motion.button>
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center opacity-40">
            <div className="w-4 h-4 bg-gray-300 rounded-full" />
          </div>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => moveDir(1, 0)}
            className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl active:bg-green-50"
          >
            ➡️
          </motion.button>
        </div>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => moveDir(0, 1)}
          className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl active:bg-green-50"
        >
          ⬇️
        </motion.button>
      </div>

      {/* Restart */}
      <motion.button whileTap={{ scale: 0.9 }}
        onClick={() => { setScore(0); setLives(3); startLevel(0); }}
        className="flex items-center gap-2 text-gray-400 text-sm"
      >
        <RotateCcw className="w-4 h-4" /> Recomeçar
      </motion.button>
    </div>
  );
}
