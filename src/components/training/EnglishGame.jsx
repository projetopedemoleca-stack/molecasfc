import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Mic } from 'lucide-react';
import { ProgressBar } from './TrainingHelpers';
import { bgMusic, speak } from '@/lib/trainingMusic';
import { drawSticker, addSticker } from '@/lib/albumSystem.js';
import { useStickerToast } from '@/components/ui/StickerEarnedToast.jsx';

const LEVELS = [
  { id: 1, title: 'Positions', subtitle: 'Posições em campo', flag: '🇺🇸', theme: 'from-blue-500 to-blue-700', intro: 'Learn the names of football positions in English!',
    words: [{ en: 'goalkeeper', pt: 'goleira', ex: 'The goalkeeper saved the penalty.' }, { en: 'defender', pt: 'zagueira/lateral', ex: 'The defender blocked the shot.' }, { en: 'midfielder', pt: 'meia/volante', ex: 'The midfielder controls the game.' }, { en: 'striker', pt: 'atacante', ex: 'The striker scored two goals.' }, { en: 'forward', pt: 'ponta/avante', ex: 'The forward is very fast.' }, { en: 'winger', pt: 'ponta de lança', ex: 'The winger dribbled past three players.' }, { en: 'captain', pt: 'capitã', ex: 'The captain leads the team.' }, { en: 'substitute', pt: 'reserva/substituta', ex: 'She came on as a substitute.' }, { en: 'coach', pt: 'treinadora', ex: 'The coach motivates the players.' }, { en: 'referee', pt: 'árbitro/árbitra', ex: 'The referee blew the whistle.' }] },
  { id: 2, title: 'Actions', subtitle: 'Ações no jogo', flag: '⚽', theme: 'from-green-500 to-green-700', intro: 'Learn how to talk about what happens during a match!',
    words: [{ en: 'pass', pt: 'passe', ex: 'She made a great pass to her teammate.' }, { en: 'shoot', pt: 'chutar', ex: 'She decided to shoot from far away.' }, { en: 'dribble', pt: 'driblar', ex: 'She can dribble past anyone.' }, { en: 'tackle', pt: 'entrada/desarme', ex: 'The tackle was fair and clean.' }, { en: 'head', pt: 'cabecear', ex: 'She headed the ball into the net.' }, { en: 'score', pt: 'marcar (gol)', ex: 'She scored in the final minute.' }, { en: 'save', pt: 'defender (goleira)', ex: 'The goalkeeper made an incredible save.' }, { en: 'cross', pt: 'cruzar', ex: 'She crossed the ball into the box.' }, { en: 'sprint', pt: 'correr em velocidade', ex: 'She sprinted down the wing.' }, { en: 'celebrate', pt: 'comemorar', ex: 'The team celebrated the goal together.' }] },
  { id: 3, title: 'The Field', subtitle: 'O campo de jogo', flag: '🏟️', theme: 'from-emerald-500 to-teal-600', intro: 'Know every part of the pitch in English!',
    words: [{ en: 'pitch', pt: 'campo', ex: 'The pitch is in perfect condition.' }, { en: 'goal', pt: 'gol / baliza', ex: 'The ball hit the back of the goal.' }, { en: 'net', pt: 'rede', ex: 'The ball went into the net.' }, { en: 'post', pt: 'poste', ex: 'Her shot hit the post.' }, { en: 'penalty spot', pt: 'marca do pênalti', ex: 'She stepped up to the penalty spot.' }, { en: 'penalty area', pt: 'área', ex: 'She was fouled inside the penalty area.' }, { en: 'center circle', pt: 'círculo central', ex: 'The game starts at the center circle.' }, { en: 'touchline', pt: 'linha lateral', ex: 'The ball went out on the touchline.' }, { en: 'corner flag', pt: 'bandeirinha do escanteio', ex: 'She ran to the corner flag to celebrate.' }, { en: 'bench', pt: 'banco de reservas', ex: 'The substitutes wait on the bench.' }] },
  { id: 4, title: 'Match Time', subtitle: 'Hora do jogo', flag: '⏱️', theme: 'from-yellow-500 to-orange-500', intro: 'Talk about the match: time, score, and results!',
    words: [{ en: 'kickoff', pt: 'início do jogo', ex: 'Kickoff is at 3 PM.' }, { en: 'half-time', pt: 'intervalo', ex: 'The score was 1-0 at half-time.' }, { en: 'full-time', pt: 'fim do jogo', ex: 'At full-time, we won 2-1.' }, { en: 'extra time', pt: 'prorrogação', ex: 'The game went to extra time.' }, { en: 'penalty shootout', pt: 'disputa de pênaltis', ex: 'We won on penalty shootout.' }, { en: 'draw', pt: 'empate', ex: 'The match ended in a draw.' }, { en: 'victory', pt: 'vitória', ex: 'It was a hard-fought victory.' }, { en: 'defeat', pt: 'derrota', ex: 'We need to learn from our defeat.' }, { en: 'overtime', pt: 'tempo extra', ex: 'We scored in overtime.' }, { en: 'injury time', pt: 'acréscimos', ex: 'The goal came in injury time.' }] },
  { id: 5, title: 'On the Pitch', subtitle: 'Frases no campo', flag: '🗣️', theme: 'from-pink-500 to-rose-600', intro: 'Phrases you\'ll hear and use during training and matches!',
    words: [{ en: 'Man on', pt: 'Marcação!', ex: '"Man on!" means there is a defender behind you.' }, { en: 'Well done', pt: 'Muito bem!', ex: 'The coach said "Well done!" after the goal.' }, { en: 'Keep going', pt: 'Continue! / Vai!', ex: '"Keep going!" encourages the team.' }, { en: 'Switch it', pt: 'Muda o lado!', ex: '"Switch it!" means pass to the other side.' }, { en: 'Time', pt: 'Você tem espaço', ex: '"Time!" means you have space to play.' }, { en: 'Press', pt: 'Pressiona!', ex: '"Press!" means press the opponent now.' }, { en: 'Drop back', pt: 'Recua!', ex: '"Drop back!" means defend deeper.' }, { en: 'Hold it', pt: 'Segura a bola!', ex: '"Hold it!" means keep the ball.' }, { en: 'Shoot', pt: 'Chuta!', ex: '"Shoot!" means take the shot now.' }, { en: 'Great teamwork', pt: 'Ótimo trabalho em equipe!', ex: 'The coach praised the "great teamwork".' }] },
  { id: 6, title: 'Tactics & Strategy', subtitle: 'Táticas e estratégia', flag: '📋', theme: 'from-indigo-500 to-blue-600', intro: 'Tactical words and formations!',
    words: [{ en: 'formation', pt: 'formação', ex: 'Our formation is 4-3-3.' }, { en: 'counter-attack', pt: 'contra-ataque', ex: 'We scored on a brilliant counter-attack.' }, { en: 'offsides', pt: 'impedimento', ex: 'The goal was disallowed for offsides.' }, { en: 'marking', pt: 'marcação', ex: 'She marks her opponent closely.' }, { en: 'possession', pt: 'posse de bola', ex: 'We had 60% possession.' }, { en: 'pressing', pt: 'pressão', ex: 'High pressing is our strategy.' }, { en: 'substitution', pt: 'substituição', ex: 'The coach made three substitutions.' }, { en: 'injury', pt: 'lesão', ex: 'She suffered a serious injury.' }, { en: 'warm-up', pt: 'aquecimento', ex: 'The team did a 15-minute warm-up.' }, { en: 'momentum', pt: 'impulso/ritmo', ex: 'We have the momentum now.' }] },
  { id: 7, title: 'Emotions & Praise', subtitle: 'Emoções e elogios', flag: '😊', theme: 'from-red-500 to-pink-600', intro: 'Express feelings and give compliments!',
    words: [{ en: 'excited', pt: 'empolgada', ex: 'I was excited about the match.' }, { en: 'confident', pt: 'confiante', ex: 'She played with confidence.' }, { en: 'nervous', pt: 'nervosa', ex: 'I felt nervous before the game.' }, { en: 'proud', pt: 'orgulhosa', ex: 'I am proud of our team.' }, { en: 'disappointed', pt: 'decepcionada', ex: 'We were disappointed with the result.' }, { en: 'amazing', pt: 'incrível', ex: 'She played an amazing match.' }, { en: 'fantastic', pt: 'fantástico', ex: 'That was a fantastic goal!' }, { en: 'brilliant', pt: 'brilhante', ex: 'Her performance was brilliant.' }, { en: 'impressive', pt: 'impressionante', ex: 'The goalkeeper made an impressive save.' }, { en: 'determined', pt: 'determinada', ex: 'She was very determined to win.' }] },
  { id: 8, title: 'Equipment & Gear', subtitle: 'Equipamento e uniforme', flag: '👟', theme: 'from-green-600 to-emerald-700', intro: 'Know your football gear!',
    words: [{ en: 'jersey', pt: 'camisa/camiseta', ex: 'My jersey has my number on it.' }, { en: 'shorts', pt: 'shorts', ex: 'The shorts are part of the uniform.' }, { en: 'boots', pt: 'chuteiras', ex: 'Good boots help you play better.' }, { en: 'socks', pt: 'meias', ex: 'The socks are usually long.' }, { en: 'shin guards', pt: 'caneleiras', ex: 'Shin guards protect your legs.' }, { en: 'gloves', pt: 'luvas', ex: 'The goalkeeper wears special gloves.' }, { en: 'armband', pt: 'braçadeira', ex: 'The captain wears an armband.' }, { en: 'ball', pt: 'bola', ex: 'The official ball is made of leather.' }, { en: 'whistle', pt: 'apito', ex: 'The referee blew the whistle.' }, { en: 'flag', pt: 'bandeira', ex: 'The linesman carries a flag.' }] },
  { id: 9, title: 'Injuries & Health', subtitle: 'Lesões e saúde', flag: '⚕️', theme: 'from-purple-500 to-indigo-600', intro: 'Health, fitness, and injuries vocabulary!',
    words: [{ en: 'sprain', pt: 'entorse', ex: 'She got a sprain on her ankle.' }, { en: 'bruise', pt: 'hematoma', ex: 'The bruise will disappear soon.' }, { en: 'muscle', pt: 'músculo', ex: 'I have a sore muscle.' }, { en: 'stretch', pt: 'alongamento', ex: 'Do a good stretch after exercise.' }, { en: 'cramp', pt: 'câimbra', ex: 'I got a cramp in my leg.' }, { en: 'tired', pt: 'cansada', ex: 'I felt tired after the match.' }, { en: 'strong', pt: 'forte', ex: 'You need to be strong to play.' }, { en: 'stamina', pt: 'resistência', ex: 'Good stamina is important in football.' }, { en: 'fitness', pt: 'condicionamento físico', ex: 'Physical fitness improves your game.' }, { en: 'recovery', pt: 'recuperação', ex: 'Recovery time is important.' }] },
  { id: 10, title: 'Championship & Tournaments', subtitle: 'Campeonatos e torneios', flag: '🏆', theme: 'from-yellow-500 to-amber-600', intro: 'Compete and celebrate victories!',
    words: [{ en: 'champion', pt: 'campeã', ex: 'She is the champion of the league.' }, { en: 'tournament', pt: 'torneio', ex: 'We won the tournament!' }, { en: 'league', pt: 'campeonato/liga', ex: 'The league has 20 teams.' }, { en: 'cup', pt: 'taça', ex: 'We are playing for the cup.' }, { en: 'final', pt: 'final', ex: 'The final is next Sunday.' }, { en: 'semifinal', pt: 'semifinal', ex: 'We won the semifinal match.' }, { en: 'qualify', pt: 'se classificar', ex: 'We qualified for the next round.' }, { en: 'trophy', pt: 'troféu', ex: 'The trophy was beautiful.' }, { en: 'medal', pt: 'medalha', ex: 'We earned a gold medal.' }, { en: 'podium', pt: 'pódio', ex: 'The winners stand on the podium.' }] },
];

const STORAGE_KEY = 'english_progress';
const QUIZ_SIZE = 6;
const SPELLING_ROUNDS = 5;

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { unlockedLevel: 1, earnedStickers: [] }; }
  catch { return { unlockedLevel: 1, earnedStickers: [] }; }
}
function saveProgress(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// Embaralha uma lista sem modificar o original
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Spelling Challenge (componente isolado para evitar re-renders problemáticos)
function SpellingChallenge({ level, miniScore, setMiniScore, onDone, onBack }) {
  const TOTAL = SPELLING_ROUNDS;

  // Sorteia uma palavra e embaralha as letras UMA vez por rodada
  const [wordIndex, setWordIndex] = useState(() => Math.floor(Math.random() * level.words.length));
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [selected, setSelected] = useState([]); // índices clicados (da shuffledLetters)
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong' | 'listening'
  const [localScore, setLocalScore] = useState(miniScore);

  const target = level.words[wordIndex];

  // Sempre que a palavra muda, embaralha as letras
  useEffect(() => {
    setShuffledLetters(shuffle(target.en.replace(/\s/g, '').split('')));
    setSelected([]);
    setFeedback(null);
  }, [wordIndex, target.en]);

  // Palavra montada pelo usuário
  const assembled = selected.map(i => shuffledLetters[i]).join('');
  // Palavra alvo (sem espaços para comparar)
  const targetClean = target.en.replace(/\s/g, '');

  const handleLetter = (i) => {
    if (selected.includes(i) || feedback) return;
    const next = [...selected, i];
    setSelected(next);

    const word = next.map(idx => shuffledLetters[idx]).join('');

    if (word.length === targetClean.length) {
      if (word.toLowerCase() === targetClean.toLowerCase()) {
        setFeedback('correct');
        const newScore = localScore + 1;
        setLocalScore(newScore);
        setMiniScore(newScore);
        setTimeout(() => {
          if (newScore >= TOTAL) {
            onDone(newScore);
          } else {
            setWordIndex(Math.floor(Math.random() * level.words.length));
          }
        }, 900);
      } else {
        setFeedback('wrong');
        setTimeout(() => {
          setSelected([]);
          setFeedback(null);
        }, 900);
      }
    }
  };

  const handleClear = () => {
    if (feedback) return;
    setSelected([]);
  };

  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setFeedback('no-mic');
      setTimeout(() => setFeedback(null), 2000);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setFeedback('listening');
    try { recognition.start(); } catch (e) {}

    recognition.onresult = (event) => {
      const transcript = (event.results?.[0]?.[0]?.transcript || '').toLowerCase().trim();
      const targetLower = target.en.toLowerCase().trim();
      recognition.abort();
      if (transcript === targetLower || transcript.includes(targetLower) || targetLower.includes(transcript)) {
        setFeedback('correct');
        const newScore = localScore + 1;
        setLocalScore(newScore);
        setMiniScore(newScore);
        setTimeout(() => {
          if (newScore >= TOTAL) {
            onDone(newScore);
          } else {
            setWordIndex(Math.floor(Math.random() * level.words.length));
          }
        }, 900);
      } else {
        setFeedback(`heard:${transcript}`);
        setTimeout(() => setFeedback(null), 2000);
      }
    };
    recognition.onerror = () => { recognition.abort(); setFeedback('mic-error'); setTimeout(() => setFeedback(null), 2000); };
    recognition.onend = () => { if (feedback === 'listening') setFeedback(null); };
  };

  const feedbackText = () => {
    if (!feedback) return null;
    if (feedback === 'correct') return { text: '✓ Correto!', color: 'text-green-600' };
    if (feedback === 'wrong') return { text: '✗ Tente novamente!', color: 'text-red-500' };
    if (feedback === 'listening') return { text: '🎤 Ouvindo...', color: 'text-blue-500' };
    if (feedback === 'no-mic') return { text: '❌ Microfone não disponível', color: 'text-red-500' };
    if (feedback === 'mic-error') return { text: '❌ Tente novamente', color: 'text-red-500' };
    if (feedback?.startsWith('heard:')) return { text: `Ouvido: "${feedback.replace('heard:', '')}"`, color: 'text-orange-500' };
    return null;
  };

  const fb = feedbackText();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="font-bold">⌨️ Spelling Challenge</p>
        <span className="text-sm font-bold text-purple-600">{localScore}/{TOTAL}</span>
      </div>

      {/* Barra de progresso */}
      <ProgressBar value={localScore} max={TOTAL} color="bg-purple-500" />

      {/* Card da palavra */}
      <motion.div
        key={wordIndex}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-300/40 rounded-3xl p-5 text-center"
      >
        <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase">Monte a palavra em inglês:</p>
        <p className="font-heading font-black text-2xl text-primary mb-3">{target.pt}</p>

        {/* Espaços da resposta */}
        <div className="flex gap-1.5 justify-center flex-wrap mb-3 min-h-[44px] items-center">
          {targetClean.split('').map((_, i) => {
            const letter = selected[i] !== undefined ? shuffledLetters[selected[i]] : '';
            return (
              <motion.div
                key={i}
                animate={feedback === 'correct' ? { scale: [1, 1.2, 1] } : feedback === 'wrong' ? { x: [-4, 4, -4, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`w-8 h-10 rounded-lg border-b-2 flex items-center justify-center font-bold text-lg transition-colors ${
                  letter
                    ? feedback === 'correct' ? 'border-green-500 text-green-600' : feedback === 'wrong' ? 'border-red-400 text-red-500' : 'border-purple-500 text-purple-700'
                    : 'border-gray-300 text-transparent'
                }`}
              >
                {letter.toUpperCase() || '_'}
              </motion.div>
            );
          })}
        </div>

        {/* Botões de áudio */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => speak(target.en)}
            className="flex items-center gap-1.5 text-blue-500 font-bold text-sm hover:text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl"
          >
            <Volume2 className="w-4 h-4" /> Ouvir
          </button>
          <button
            onClick={handleMic}
            disabled={!!feedback}
            className="flex items-center gap-1.5 text-green-600 font-bold text-sm hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-xl disabled:opacity-50"
          >
            <Mic className="w-4 h-4" /> Falar
          </button>
        </div>
      </motion.div>

      {/* Letras embaralhadas */}
      <div className="flex flex-wrap gap-2 justify-center">
        {shuffledLetters.map((letter, i) => {
          const isUsed = selected.includes(i);
          return (
            <motion.button
              key={i}
              whileTap={!isUsed && !feedback ? { scale: 0.88 } : {}}
              onClick={() => handleLetter(i)}
              disabled={isUsed || !!feedback}
              className={`w-11 h-11 rounded-xl font-bold text-lg transition-all select-none ${
                isUsed
                  ? 'bg-gray-100 text-gray-300 border-2 border-gray-200 cursor-not-allowed'
                  : 'bg-purple-600 text-white shadow-md hover:bg-purple-700 active:scale-90 border-2 border-purple-700'
              }`}
            >
              {letter.toUpperCase()}
            </motion.button>
          );
        })}
      </div>

      {/* Limpar seleção */}
      {selected.length > 0 && !feedback && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={handleClear}
          className="w-full py-2 text-sm font-bold text-red-400 border border-red-200 rounded-xl hover:bg-red-50"
        >
          ✕ Limpar seleção
        </motion.button>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {fb && (
          <motion.p
            key={feedback}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`text-center font-bold text-lg ${fb.color}`}
          >
            {fb.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EnglishGame() {
  useEffect(() => { bgMusic.play('english'); return () => bgMusic.stop(); }, []);

  const { showToast, StickerToast } = useStickerToast();
  const [progress, setProgress] = useState(loadProgress);
  const [view, setView] = useState('menu');
  const [lvlIdx, setLvlIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wordPage, setWordPage] = useState(0);
  const [gamePool, setGamePool] = useState([]);
  const [gameIdx, setGameIdx] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [miniGame, setMiniGame] = useState(null);
  const [miniScore, setMiniScore] = useState(0);
  const [spokeFeedback, setSpokeFeedback] = useState({});
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [memoryPairs, setMemoryPairs] = useState([]);
  const [speakingWord, setSpeakingWord] = useState(null);

  const level = LEVELS[lvlIdx];
  const WORDS_PER_PAGE = 5;
  const totalPages = Math.ceil(level.words.length / WORDS_PER_PAGE);

  // Ganhar figurinha ao passar no quiz ou mini-game
  const earnStickerReward = (scoreVal, source = 'english') => {
    let rarity = null;
    if (scoreVal >= 6) rarity = 'epic';
    else if (scoreVal >= 5) rarity = 'rare';
    else if (scoreVal >= 4) rarity = 'uncommon';
    const def = drawSticker(source, rarity);
    const result = addSticker(def.id, source, true);
    if (result) showToast({ ...result, definition: def });
  };

  const startLesson = (idx) => { setLvlIdx(idx); setWordPage(0); setView('lesson'); };

  const startGame = () => {
    const pool = shuffle(level.words).slice(0, QUIZ_SIZE);
    setGamePool(pool);
    setGameIdx(0);
    setScore(0);
    setView('game');
    setMiniGame(null);
  };

  const handleGameNext = (currentScore) => {
    const s = currentScore ?? score;
    if (gameIdx + 1 >= gamePool.length) {
      setFinalScore(s);
      if (s >= 4) {
        const newProgress = { ...progress };
        const nextUnlock = lvlIdx + 2;
        if (nextUnlock > newProgress.unlockedLevel) newProgress.unlockedLevel = nextUnlock;
        setProgress(newProgress);
        saveProgress(newProgress);
        earnStickerReward(s, 'english');
      }
      setView('result');
    } else {
      setGameIdx(gameIdx + 1);
    }
  };

  const handleMicRecord = (word) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpokeFeedback(prev => ({ ...prev, [word]: '❌ Não disponível' }));
      setTimeout(() => setSpokeFeedback(prev => ({ ...prev, [word]: null })), 2000);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    setSpeakingWord(word);
    setSpokeFeedback(prev => ({ ...prev, [word]: '🎤 Ouvindo...' }));
    try { recognition.start(); } catch (e) {}

    recognition.onresult = (event) => {
      const result = event.results?.[0]?.[0];
      if (!result) return;
      const transcript = (result.transcript || '').toLowerCase().trim();
      const targetWord = word.toLowerCase().trim();
      const match = transcript.includes(targetWord) || targetWord.includes(transcript);
      setSpeakingWord(null);
      setSpokeFeedback(prev => ({ ...prev, [word]: match ? '✓ Perfeito!' : `Ouvido: "${transcript}"` }));
      recognition.abort();
      setTimeout(() => setSpokeFeedback(prev => ({ ...prev, [word]: null })), 3000);
    };
    recognition.onerror = () => {
      setSpeakingWord(null);
      setSpokeFeedback(prev => ({ ...prev, [word]: '❌ Tente novamente' }));
      recognition.abort();
      setTimeout(() => setSpokeFeedback(prev => ({ ...prev, [word]: null })), 2000);
    };
    recognition.onend = () => setSpeakingWord(null);
  };

  const startMiniGame = (type) => {
    setMiniGame(type);
    setMiniScore(0);
    setFlipped([]);
    setMatched([]);
    if (type === 'memory') {
      const wordList = level.words.slice(0, 4);
      setMemoryPairs(shuffle([...wordList, ...wordList]));
    }
  };

  // === MENU ===
  if (view === 'menu') return (
    <><StickerToast />
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
        <span className="text-5xl block mb-2">🇺🇸</span>
        <h2 className="font-heading font-bold text-3xl">Inglês do Futebol</h2>
        <p className="text-xs text-muted-foreground mt-2">10 níveis de vocabulário + jogos interativos</p>
      </motion.div>
      <ProgressBar value={progress.earnedStickers?.length || 0} max={50} color="bg-yellow-500" />
      <div className="space-y-2">
        {LEVELS.map((lvl, i) => {
          const locked = i + 1 > progress.unlockedLevel;
          return (
            <motion.button key={lvl.id} disabled={locked} whileTap={locked ? {} : { scale: 0.97 }}
              onClick={() => !locked && startLesson(i)}
              className={`w-full text-left rounded-2xl border-2 p-4 flex items-center gap-3 transition-all ${
                locked ? 'opacity-40 cursor-not-allowed bg-muted/20 border-muted/30' : 'bg-card hover:shadow-lg border-border/30 hover:border-primary/50'
              }`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lvl.theme} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                {locked ? '🔒' : lvl.flag}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-base">Level {lvl.id}: {lvl.title}</p>
                <p className="text-xs text-muted-foreground">{lvl.subtitle}</p>
              </div>
              {!locked && <span className="text-2xl text-muted-foreground">→</span>}
            </motion.button>
          );
        })}
      </div>
    </>;

  // === LESSON ===
  if (view === 'lesson') {
    const words = level.words.slice(wordPage * WORDS_PER_PAGE, (wordPage + 1) * WORDS_PER_PAGE);
    return (
      <><StickerToast /><div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('menu')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="font-heading font-bold">{level.flag} Level {level.id}: {level.title}</p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">{wordPage+1}/{totalPages}</span>
        </div>
        <div className={`bg-gradient-to-br ${level.theme} rounded-3xl p-4 text-white text-center shadow-lg`}>
          <p className="text-sm font-bold opacity-90">{level.intro}</p>
        </div>
        <div className="space-y-2">
          {words.map((w, i) => (
            <motion.div key={w.en} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }} className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-heading font-bold text-lg text-primary">{w.en}</p>
                  <p className="text-sm text-muted-foreground">{w.pt}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => speak(w.en)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-xl hover:bg-blue-500/20 transition-all">
                    <Volume2 className="w-5 h-5 text-blue-500"/>
                  </button>
                  <button onClick={() => handleMicRecord(w.en)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all">
                    <Mic className={`w-5 h-5 ${speakingWord === w.en ? 'text-red-500 animate-pulse' : 'text-green-500'}`}/>
                  </button>
                </div>
              </div>
              {spokeFeedback[w.en] && (
                <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 font-bold text-xs mt-2">
                  {spokeFeedback[w.en]}
                </motion.p>
              )}
              <p className="text-xs text-muted-foreground mt-2.5 italic border-t border-border/20 pt-2">"{w.ex}"</p>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2">
          {wordPage > 0 && (
            <button onClick={() => setWordPage(p => p - 1)}
              className="flex-1 py-3 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all">
              ← Anterior
            </button>
          )}
          {wordPage < totalPages - 1 ? (
            <button onClick={() => setWordPage(p => p + 1)}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold hover:shadow-lg transition-all">
              Próximo →
            </button>
          ) : (
            <button onClick={startGame}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-heading font-bold shadow-lg hover:shadow-xl transition-all">
              🎮 Começar Jogos!
            </button>
          )}
        </div>
      </div></>;
  }

  // === SPELLING MINI-GAME ===
  if (view === 'game' && miniGame === 'spelling') {
    return (
      <SpellingChallenge
        level={level}
        miniScore={miniScore}
        setMiniScore={setMiniScore}
        onDone={(finalMiniScore) => {
          setFinalScore(finalMiniScore);
          setMiniGame(null);
          earnStickerReward(finalMiniScore, 'english_spelling');
          setView('result');
        }}
        onBack={() => setMiniGame(null)}
      />
    );
  }

  // === MEMORY MINI-GAME ===
  if (view === 'game' && miniGame === 'memory' && memoryPairs.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setMiniGame(null)} className="text-muted-foreground"><ArrowLeft className="w-5 h-5" /></button>
          <p className="font-bold">🎮 Memory Match</p>
          <span className="text-sm font-bold text-primary">✓ {matched.length / 2}/4</span>
        </div>
        <ProgressBar value={matched.length / 2} max={4} color="bg-blue-500" />
        <div className="grid grid-cols-4 gap-2">
          {memoryPairs.map((word, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            const isDone = matched.includes(idx);
            return (
              <motion.button key={idx} whileTap={{ scale: 0.95 }} disabled={isDone || flipped.length === 2}
                onClick={() => {
                  if (isFlipped) return;
                  const newFlipped = [...flipped, idx];
                  setFlipped(newFlipped);
                  if (newFlipped.length === 2) {
                    if (memoryPairs[newFlipped[0]].en === memoryPairs[newFlipped[1]].en) {
                      setTimeout(() => { setMatched(m => [...m, ...newFlipped]); setFlipped([]); }, 600);
                    } else {
                      setTimeout(() => setFlipped([]), 900);
                    }
                  }
                }}
                className={`aspect-square rounded-xl font-bold text-xs flex items-center justify-center transition-all p-1 text-center leading-tight ${
                  isDone ? 'bg-green-500 text-white' : isFlipped ? 'bg-primary text-white' : 'bg-muted border-2 border-border/30 text-muted-foreground'
                }`}>
                {isFlipped ? word.en : '?'}
              </motion.button>
            );
          })}
        </div>
        {matched.length === 8 && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
            onClick={() => {
              const s = miniScore + 4;
              setFinalScore(s);
              earnStickerReward(s, 'english_memory');
              setMiniGame(null);
              setView('result');
            }}
            className="w-full py-3 bg-green-500 text-white rounded-2xl font-bold">
            🏆 Completado!
          </motion.button>
        )}
      </div>
    );
  }

  // === QUIZ PRINCIPAL ===
  if (view === 'game' && gamePool.length > 0 && !miniGame) {
    const current = gamePool[gameIdx];
    // Opções fixas para não embaralhar a cada render
    const options = useMemo(() => {
      const others = gamePool.filter(w => w.en !== current.en);
      return shuffle([...others.slice(0, 2), current]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameIdx, gamePool]);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-heading font-bold">🎮 Jogo - Level {level.id}</p>
          <span className="text-sm font-bold text-primary">{gameIdx+1}/{gamePool.length} · ✅ {score}</span>
        </div>
        <ProgressBar value={gameIdx} max={gamePool.length} color="bg-green-500" />

        <motion.div key={gameIdx} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-6 text-center shadow-lg">
          <p className="text-xs text-muted-foreground mb-2 font-bold uppercase">O que significa em inglês?</p>
          <p className="font-heading font-bold text-3xl text-primary mb-4">{current.pt}</p>
          <button onClick={() => speak(current.en)}
            className="mx-auto flex items-center gap-2 text-blue-500 font-bold text-sm hover:text-blue-600 transition-colors">
            <Volume2 className="w-4 h-4"/> Ouvir em inglês
          </button>
        </motion.div>

        <div className="grid grid-cols-1 gap-2.5">
          {options.map((opt, idx) => (
            <motion.button key={opt.en}
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                const correct = opt.en === current.en;
                const newScore = correct ? score + 1 : score;
                if (correct) setScore(newScore);
                setTimeout(() => handleGameNext(newScore), 400);
              }}
              className="py-4 px-4 rounded-2xl border-2 border-border/30 bg-card font-bold text-base hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95">
              {opt.en}
            </motion.button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-2">🎤 Bônus: Pronuncie a palavra!</p>
          <button onClick={() => handleMicRecord(current.en)}
            className="mx-auto flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition-all">
            <Mic className="w-4 h-4"/> Falar
          </button>
          {spokeFeedback[current.en] && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 font-bold mt-2">
              {spokeFeedback[current.en]}
            </motion.p>
          )}
        </motion.div>
      </div>
    );
  }

  // === RESULT ===
  if (view === 'result') {
    const passed = finalScore >= 4;
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-5 text-center">
        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-6xl block">{passed ? '🏆' : '💪'}</motion.span>
        <p className="font-heading font-bold text-3xl">{passed ? 'Passou!' : 'Quase lá!'}</p>
        <div className="bg-card border border-border/30 rounded-2xl p-4">
          <p className="text-5xl font-heading font-bold text-primary">{finalScore}</p>
          <p className="text-sm text-muted-foreground mt-1">pontos conquistados</p>
        </div>
        {!passed && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3 text-sm text-muted-foreground">
            Revise o vocabulário e tente novamente!
          </div>
        )}
        {passed && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 text-center">
            <p className="text-sm font-bold text-green-700 mb-3">🎮 Pratique mais com os mini-games!</p>
            <div className="flex gap-2">
              <button onClick={() => { setView('game'); startMiniGame('spelling'); }}
                className="flex-1 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm">
                ⌨️ Spelling
              </button>
              <button onClick={() => { setView('game'); startMiniGame('memory'); }}
                className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm">
                🎮 Memory
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 pt-2">
          {passed && lvlIdx < LEVELS.length - 1 && (
            <button onClick={() => startLesson(lvlIdx + 1)}
              className="w-full py-4 bg-gradient-to-r from-primary to-green-500 text-white rounded-2xl font-heading font-bold shadow-lg hover:shadow-xl transition-all">
              → Próximo Nível
            </button>
          )}
          <button onClick={() => { if (!passed) startGame(); else startLesson(lvlIdx); }}
            className="w-full py-3 bg-card border border-border/30 rounded-2xl font-heading font-bold hover:bg-muted/50 transition-all">
            🔄 {passed ? 'Rever Nível' : 'Tentar de Novo'}
          </button>
          <button onClick={() => setView('menu')}
            className="w-full py-2.5 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
            ← Voltar ao Menu
          </button>
        </div>
      </motion.div>
    );
  }

  return <><StickerToast /></>;
}
