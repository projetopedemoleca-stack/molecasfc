import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const EMOTIONS = [
  { emoji: '😊', name: 'Alegria', desc: 'Sentir-se feliz, leve e satisfeita com o que está acontecendo.' },
  { emoji: '😢', name: 'Tristeza', desc: 'Ficar triste é normal. Chore se precisar – as lágrimas limpam a alma.' },
  { emoji: '😡', name: 'Raiva', desc: 'Energia intensa que precisa de saída saudável: esporte, conversa ou arte.' },
  { emoji: '😨', name: 'Medo', desc: 'Avisa sobre perigos reais ou imaginários. Falar sobre ele diminui seu poder.' },
  { emoji: '😰', name: 'Ansiedade', desc: 'Preocupação com o futuro. Respirar fundo e focar no presente ajuda muito.' },
  { emoji: '😤', name: 'Frustração', desc: 'Quando algo não sai como esperado. Faz parte do crescimento!' },
  { emoji: '🥰', name: 'Amor', desc: 'Sentir carinho por pessoas, animais, esportes ou atividades que te preenchem.' },
  { emoji: '😳', name: 'Vergonha', desc: 'Todos sentem vergonha às vezes. Ela mostra que você se importa com os outros.' },
  { emoji: '😏', name: 'Orgulho', desc: 'Reconhecer suas conquistas. Se orgulhar de si mesma é saudável e importante!' },
  { emoji: '😔', name: 'Decepção', desc: 'Quando a expectativa não se realiza. Aprender com isso é a chave.' },
  { emoji: '🤩', name: 'Empolgação', desc: 'Energia positiva antes de algo especial. Use essa força no jogo!' },
  { emoji: '😴', name: 'Tédio', desc: 'Sinal de que você precisa de estímulo novo. Que tal aprender algo diferente?' },
  { emoji: '🥺', name: 'Carência', desc: 'Querer atenção e afeto é humano. Peça abraços quando precisar!' },
  { emoji: '😑', name: 'Indiferença', desc: 'Às vezes o corpo desliga as emoções para se proteger. Tudo bem.' },
  { emoji: '😮', name: 'Surpresa', desc: 'O inesperado pode ser bom ou ruim. Respirar antes de reagir ajuda.' },
  { emoji: '🤗', name: 'Gratidão', desc: 'Reconhecer o bem ao redor aumenta a felicidade. Agradeça 3 coisas por dia!' },
  { emoji: '😒', name: 'Irritação', desc: 'Sinal de que algo incomoda. Identifique a causa e converse sobre ela.' },
  { emoji: '🫠', name: 'Sobrecarga', desc: 'Quando tem muita coisa ao mesmo tempo. Pause, respire e priorize.' },
  { emoji: '💪', name: 'Confiança', desc: 'Acreditar na sua capacidade. Treino e prática constroem essa emoção.' },
  { emoji: '🥳', name: 'Celebração', desc: 'Celebrar vitórias, grandes ou pequenas, alimenta a motivação!' },
  { emoji: '😶', name: 'Solidão', desc: 'Sentir-se sozinha mesmo rodeada de pessoas. Converse com quem confia.' },
  { emoji: '🫶', name: 'Empatia', desc: 'Sentir o que o outro sente. Essa emoção torna o time mais unido.' },
  { emoji: '😬', name: 'Nervosismo', desc: 'Borboletas no estômago antes de jogar? Normal! Indica que você se importa.' },
  { emoji: '🧘‍♀️', name: 'Calma', desc: 'Estado de paz interior. Alcançada com respiração, natureza e descanso.' },
  { emoji: '😞', name: 'Arrependimento', desc: 'Reconhecer um erro é o primeiro passo para corrigi-lo. Perdoe-se!' },
  { emoji: '🤔', name: 'Confusão', desc: 'Não entender algo é normal. Peça ajuda sem medo – todo mundo aprende.' },
  { emoji: '🫢', name: 'Insegurança', desc: 'Duvidar de si mesma às vezes. Lembre das suas conquistas passadas!' },
  { emoji: '🥹', name: 'Emoção Intensa', desc: 'Quando as emoções transbordam de alegria, orgulho ou beleza.' },
  { emoji: '😌', name: 'Alívio', desc: 'A sensação depois que uma preocupação passa. Aproveite esse momento!' },
  { emoji: '🤝', name: 'Pertencimento', desc: 'Sentir que faz parte de um grupo. O time é sua família no esporte!' },
];

const TOPICS = [
  {
    id: 'mental',
    title: 'Saúde Mental & Emoções',
    emoji: '🧠',
    color: 'from-indigo-400 to-purple-500',
    type: 'emotions',
    quiz: [
      { q: 'O que fazer quando estiver nervosa?', options: ['Gritar com todos', 'Respirar fundo 3 vezes', 'Ficar quieta', 'Sair correndo'], answer: 1 },
      { q: 'Falar sobre sentimentos é:', options: ['Sinal de fraqueza', 'Importante e saudável', 'Só para crianças', 'Desnecessário'], answer: 1 },
      { q: 'O que é empatia?', options: ['Ser egoísta', 'Sentir o que o outro sente', 'Ignorar os outros', 'Competir sempre'], answer: 1 },
    ],
  },
  {
    id: 'cuidados',
    title: 'Cuidados Básicos',
    emoji: '🛁',
    color: 'from-cyan-400 to-blue-500',
    content: [
      { icon: '🧼', title: 'Lave as mãos!', text: 'Antes das refeições e após o banheiro. Use sabão e água por 20 segundos.' },
      { icon: '🚿', title: 'Banho pós-treino', text: 'Sempre tome banho após treinar ou jogar. Suor + bactérias = odor e irritações.' },
      { icon: '🦷', title: 'Escove os dentes', text: '3x ao dia, por 2 minutos: manhã, após almoço e antes de dormir. Fio dental é seu amigo!' },
      { icon: '💅', title: 'Unhas curtas', text: 'Unhas limpas e cortadas evitam acidentes e acúmulo de sujeira.' },
      { icon: '🧴', title: 'Hidrate a pele', text: 'Após o banho aplique hidratante. A pele da atleta resiste ao sol e ao esforço.' },
    ],
    quiz: [
      { q: 'Quanto tempo devemos lavar as mãos?', options: ['5 segundos', '10 segundos', '20 segundos', '1 minuto'], answer: 2 },
      { q: 'Quando tomar banho após treino?', options: ['Só no dia seguinte', 'Imediatamente', 'Não precisa', 'De 2 em 2 dias'], answer: 1 },
    ],
  },
  {
    id: 'alimentacao',
    title: 'Alimentação Saudável',
    emoji: '🥗',
    color: 'from-green-400 to-emerald-500',
    content: [
      { icon: '🌈', title: 'Prato colorido', text: 'Quanto mais cores no prato, melhor! Cada cor = nutrientes diferentes.' },
      { icon: '🍎', title: 'Frutas são doces naturais', text: 'Substitua doces industrializados por frutas. Banana dá muita energia!' },
      { icon: '💪', title: 'Proteínas = músculos', text: 'Frango, peixe, ovos, feijão. Ajuda a construir músculos fortes!' },
      { icon: '🍞', title: 'Carboidratos = energia', text: 'Arroz, pão, massa, batata. Combustível para correr 90 minutos!' },
      { icon: '🚫', title: 'Evite antes do jogo', text: 'Refrigerante, frituras e doces pesados. Deixam você lenta e com sono.' },
    ],
    quiz: [
      { q: 'O que dá energia para jogar?', options: ['Refrigerante', 'Frutas e carboidratos', 'Só água', 'Doces'], answer: 1 },
      { q: 'Para que servem proteínas?', options: ['Dormir melhor', 'Construir músculos', 'Ficar alta', 'Nada'], answer: 1 },
    ],
  },
  {
    id: 'hidratacao',
    title: 'Hidratação 💧',
    emoji: '💧',
    color: 'from-blue-400 to-cyan-500',
    content: [
      { icon: '🥤', title: 'Beba água!', text: 'Mínimo 6-8 copos por dia. No treino: a cada 15-20 minutos.' },
      { icon: '💦', title: 'Sinais de sede', text: 'Boca seca, cansaço, dor de cabeça = beba água AGORA!' },
      { icon: '🚫', title: 'Evite refrigerantes', text: 'Açúcar demais e não hidratam bem. Água é a melhor amiga da atleta!' },
    ],
    quiz: [
      { q: 'Quantos copos de água por dia?', options: ['2 copos', '4 copos', '6-8 copos', '1 litro de uma vez'], answer: 2 },
      { q: 'O que fazer se perder peso no treino?', options: ['Comer mais', 'Beber água', 'Dormir', 'Nada'], answer: 1 },
    ],
  },
  {
    id: 'menstruacao',
    title: 'Primeira Menstruação',
    emoji: '🌸',
    color: 'from-pink-400 to-rose-500',
    content: [
      { icon: '🩷', title: 'É normal!', text: 'A menstruação é natural e acontece entre 9-15 anos. Cada corpo tem seu tempo.' },
      { icon: '🎒', title: 'Kit de emergência', text: 'Sempre leve absorventes na mochila. Tenha um "kit secreto" com: absorvente, calcinha extra e lenços umedecidos.' },
      { icon: '💧', title: 'Higiene íntima', text: 'Troque o absorvente a cada 4-6 horas. Lave a região com água e sabão neutro.' },
      { icon: '🏃‍♀️', title: 'Pode treinar!', text: 'Exercício durante a menstruação é liberado! Ajuda até a aliviar cólicas.' },
    ],
    quiz: [
      { q: 'A cada quantas horas trocar o absorvente?', options: ['12 horas', '4-6 horas', '1 hora', '24 horas'], answer: 1 },
      { q: 'Posso treinar na menstruação?', options: ['Sim!', 'Não, é proibido', 'Só se for campeã', 'Depende da lua'], answer: 0 },
    ],
  },
];

// ─── Jogo de Memória das Emoções ─────────────────────────────────────────
function EmotionMemoryGame({ onClose }) {
  const PAIRS_COUNT = 8;
  const pool = EMOTIONS.slice(0, 16);
  
  const makeDeck = () => {
    const picked = pool.sort(() => Math.random() - 0.5).slice(0, PAIRS_COUNT);
    return [...picked, ...picked]
      .sort(() => Math.random() - 0.5)
      .map((em, i) => ({ ...em, uid: i, flipped: false, matched: false }));
  };

  const [cards, setCards] = useState(makeDeck);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [botMoves, setBotMoves] = useState(0);
  const [phase, setPhase] = useState('player'); // player | bot | done
  const [botMemory, setBotMemory] = useState({}); // uid → emoji
  const [winner, setWinner] = useState(null);
  const timerRef = useRef(null);

  const playerScore = cards.filter(c => c.matched && c.matchedBy === 'player').length / 2;
  const botScore    = cards.filter(c => c.matched && c.matchedBy === 'bot').length / 2;
  const totalPairs  = PAIRS_COUNT;

  // Verifica fim do jogo
  useEffect(() => {
    const matched = cards.filter(c => c.matched).length;
    if (matched === totalPairs * 2 && phase !== 'done') {
      setPhase('done');
      setWinner(playerScore > botScore ? 'player' : playerScore < botScore ? 'bot' : 'draw');
    }
  }, [cards, phase, playerScore, botScore]);

  const flip = (uid) => {
    if (phase !== 'player') return;
    if (selected.length === 2) return;
    const card = cards.find(c => c.uid === uid);
    if (!card || card.flipped || card.matched) return;

    // Adicionar à memória do bot
    setBotMemory(m => ({ ...m, [uid]: card.emoji }));

    const newCards = cards.map(c => c.uid === uid ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSel = [...selected, uid];
    setSelected(newSel);

    if (newSel.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSel.map(id => newCards.find(c => c.uid === id));
      if (a.emoji === b.emoji) {
        // Par do jogador
        setTimeout(() => {
          setCards(prev => prev.map(c => newSel.includes(c.uid) ? { ...c, matched: true, matchedBy: 'player' } : c));
          setSelected([]);
          // Bot joga depois
          setTimeout(() => setPhase('bot'), 400);
        }, 600);
      } else {
        // Errou — vira de volta
        setTimeout(() => {
          setCards(prev => prev.map(c => newSel.includes(c.uid) ? { ...c, flipped: false } : c));
          setSelected([]);
          setTimeout(() => setPhase('bot'), 400);
        }, 800);
      }
    }
  };

  // Turno do bot
  useEffect(() => {
    if (phase !== 'bot') return;
    const unmatched = cards.filter(c => !c.matched);
    if (unmatched.length === 0) return;

    timerRef.current = setTimeout(() => {
      setBotMoves(m => m + 1);
      // Bot tenta usar memória (70% acerto)
      let pair = null;
      const botKnows = Object.entries(botMemory).filter(([uid]) => {
        const c = cards.find(c => c.uid === Number(uid));
        return c && !c.matched && !c.flipped;
      });

      // Agrupar por emoji
      const byEmoji = {};
      botKnows.forEach(([uid, em]) => {
        if (!byEmoji[em]) byEmoji[em] = [];
        byEmoji[em].push(Number(uid));
      });
      const knownPair = Object.values(byEmoji).find(ids => ids.length >= 2);

      if (knownPair && Math.random() < 0.7) {
        pair = [knownPair[0], knownPair[1]];
      } else {
        // Chute aleatório
        const shuffled = [...unmatched].sort(() => Math.random() - 0.5);
        pair = [shuffled[0].uid, shuffled[1]?.uid];
      }

      if (!pair || pair[1] == null) { setPhase('player'); return; }

      const [fid, sid] = pair;

      // Revelar primeira carta
      setCards(prev => prev.map(c => c.uid === fid ? { ...c, flipped: true } : c));
      setBotMemory(m => {
        const first = cards.find(c => c.uid === fid);
        return first ? { ...m, [fid]: first.emoji } : m;
      });

      setTimeout(() => {
        // Revelar segunda carta
        setCards(prev => prev.map(c => c.uid === sid ? { ...c, flipped: true } : c));
        const cFirst = cards.find(c => c.uid === fid);
        const cSec   = cards.find(c => c.uid === sid);
        setBotMemory(m => cSec ? { ...m, [sid]: cSec.emoji } : m);

        setTimeout(() => {
          if (cFirst && cSec && cFirst.emoji === cSec.emoji) {
            setCards(prev => prev.map(c => [fid, sid].includes(c.uid) ? { ...c, matched: true, matchedBy: 'bot' } : c));
            setTimeout(() => setPhase('player'), 400);
          } else {
            setCards(prev => prev.map(c => [fid, sid].includes(c.uid) ? { ...c, flipped: false } : c));
            setTimeout(() => setPhase('player'), 600);
          }
        }, 700);
      }, 700);
    }, 900);

    return () => clearTimeout(timerRef.current);
  }, [phase]);

  const restart = () => {
    setCards(makeDeck());
    setSelected([]);
    setMoves(0);
    setBotMoves(0);
    setPhase('player');
    setBotMemory({});
    setWinner(null);
  };

  if (phase === 'done') {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="text-7xl">{winner === 'player' ? '🏆' : winner === 'draw' ? '🤝' : '🤖'}</div>
        <h3 className="font-heading font-black text-2xl">
          {winner === 'player' ? 'Você ganhou!' : winner === 'draw' ? 'Empate!' : 'Bot ganhou!'}
        </h3>
        <div className="flex justify-center gap-8 text-lg font-bold">
          <div><span className="text-primary">{playerScore}</span> <span className="text-xs text-muted-foreground block">Você</span></div>
          <div><span className="text-red-500">{botScore}</span> <span className="text-xs text-muted-foreground block">Bot</span></div>
        </div>
        <div className="flex gap-2">
          <button onClick={restart} className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl">Jogar de novo</button>
          <button onClick={onClose} className="flex-1 py-3 bg-muted font-bold rounded-2xl">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Placar */}
      <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-2">
        <div className="text-center">
          <div className="font-black text-xl text-primary">{playerScore}</div>
          <div className="text-[10px] text-muted-foreground">Você</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold">{phase === 'player' ? '🟢 Sua vez' : '🔴 Bot jogando...'}</div>
          <div className="text-[10px] text-muted-foreground">{totalPairs - playerScore - botScore} pares restantes</div>
        </div>
        <div className="text-center">
          <div className="font-black text-xl text-red-500">{botScore}</div>
          <div className="text-[10px] text-muted-foreground">Bot</div>
        </div>
      </div>

      {/* Grid de cartas */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <motion.button
            key={card.uid}
            whileTap={{ scale: 0.93 }}
            onClick={() => flip(card.uid)}
            disabled={card.matched || card.flipped || phase !== 'player'}
            className={`aspect-square rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${
              card.matched
                ? card.matchedBy === 'player'
                  ? 'bg-primary/20 border-primary'
                  : 'bg-red-100 border-red-300'
                : card.flipped
                  ? 'bg-white border-primary shadow-lg'
                  : 'bg-gradient-to-br from-purple-400 to-indigo-500 border-transparent cursor-pointer'
            }`}
          >
            {card.flipped || card.matched ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {card.emoji}
              </motion.span>
            ) : (
              <span className="text-white font-bold text-lg">?</span>
            )}
          </motion.button>
        ))}
      </div>

      <button onClick={restart} className="w-full py-2 bg-muted rounded-xl text-sm font-bold">🔄 Reiniciar</button>
    </div>
  );
}

function EmotionsGrid({ onBack, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [learned, setLearned] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const quiz = TOPICS[0].quiz;

  const markLearned = (idx) => {
    if (!learned.includes(idx)) setLearned(l => [...l, idx]);
  };

  if (showMemory) {
    return (
      <div className="space-y-3">
        <button onClick={() => setShowMemory(false)} className="flex items-center gap-2 text-muted-foreground text-sm">← Voltar</button>
        <h3 className="font-heading font-bold text-lg text-center">🎴 Memória das Emoções</h3>
        <EmotionMemoryGame onClose={() => setShowMemory(false)} />
      </div>
    );
  }

  if (showQuiz) {
    if (quizDone) {
      return (
        <div className="text-center space-y-4">
          <span className="text-6xl block">{quizScore >= quiz.length - 1 ? '🎉' : '💪'}</span>
          <p className="font-heading font-bold text-xl">{quizScore}/{quiz.length} acertos!</p>
          {quizScore >= quiz.length - 1 ? (
            <button onClick={onComplete} className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold">Concluir ✓</button>
          ) : (
            <button onClick={() => { setQuizIdx(0); setQuizScore(0); setQuizDone(false); }} className="w-full py-3 bg-amber-500 text-white rounded-2xl font-heading font-bold">Tentar Novamente</button>
          )}
          <button onClick={onBack} className="w-full py-2 text-muted-foreground text-sm">Voltar ao menu</button>
        </div>
      );
    }
    const q = quiz[quizIdx];
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{quizIdx + 1}/{quiz.length}</p>
        <p className="font-heading font-bold">{q.q}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => {
              const correct = i === q.answer;
              const ns = correct ? quizScore + 1 : quizScore;
              if (quizIdx + 1 >= quiz.length) { setQuizScore(ns); setQuizDone(true); }
              else { setQuizScore(ns); setQuizIdx(n => n + 1); }
            }} className="w-full text-left px-4 py-3 rounded-xl border-2 border-border/30 bg-muted/30 hover:border-primary transition-all">{opt}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl p-5 text-white text-center">
        <span className="text-5xl block mb-2">🧠</span>
        <p className="font-heading font-bold text-xl">Saúde Mental & Emoções</p>
        <p className="text-white/80 text-sm mt-1">Conheça as 30 emoções humanas</p>
      </div>

      <div className="bg-muted/40 rounded-xl p-3 text-center">
        <span className="text-sm font-bold text-primary">{learned.length}/30</span>
        <span className="text-sm text-muted-foreground"> emoções conhecidas</span>
        <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all" style={{ width: `${(learned.length / 30) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {EMOTIONS.map((em, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.92 }}
            onClick={() => { setSelected(idx); markLearned(idx); }}
            className={`rounded-2xl p-3 text-center border-2 transition-all ${
              learned.includes(idx) 
                ? 'border-purple-300 bg-purple-50' 
                : 'border-border/30 bg-card'
            }`}
          >
            <div className="text-3xl mb-1">{em.emoji}</div>
            <div className="text-[10px] font-bold leading-tight">{em.name}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-x-4 bottom-6 bg-card rounded-3xl p-5 shadow-2xl border border-border/30 z-50"
          >
            <div className="flex items-start gap-4">
              <span className="text-5xl">{EMOTIONS[selected].emoji}</span>
              <div className="flex-1">
                <p className="font-heading font-bold text-lg">{EMOTIONS[selected].name}</p>
                <p className="text-sm text-muted-foreground mt-1">{EMOTIONS[selected].desc}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 w-full py-2 bg-muted rounded-xl text-sm font-bold">Fechar</button>
          </motion.div>
        )}
      </AnimatePresence>

      {learned.length >= 10 && (
        <div className="flex gap-2">
          <button onClick={() => setShowMemory(true)} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl">🎴 Jogo de Memória</button>
          <button onClick={() => setShowQuiz(true)} className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl font-bold">🧠 Quiz</button>
        </div>
      )}
      {learned.length < 10 && (
        <p className="text-center text-xs text-muted-foreground">Conheça {10 - learned.length} emoções ainda para desbloquear o quiz</p>
      )}
    </div>
  );
}

function TopicContent({ topic, onComplete, onBack }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  if (topic.type === 'emotions') {
    return <EmotionsGrid onBack={onBack} onComplete={onComplete} />;
  }

  const answer = (i) => {
    const correct = i === topic.quiz[quizIdx].answer;
    const ns = correct ? quizScore + 1 : quizScore;
    if (quizIdx + 1 >= topic.quiz.length) { setQuizScore(ns); setQuizDone(true); }
    else { setQuizScore(ns); setQuizIdx(n => n + 1); }
  };

  if (showQuiz && quizDone) {
    return (
      <div className="text-center space-y-4">
        <span className="text-6xl block">{quizScore >= topic.quiz.length - 1 ? '🎉' : '💪'}</span>
        <p className="font-heading font-bold text-xl">{quizScore}/{topic.quiz.length} acertos!</p>
        {quizScore >= topic.quiz.length - 1 ? (
          <button onClick={onComplete} className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold">Concluir ✓</button>
        ) : (
          <button onClick={() => { setQuizIdx(0); setQuizScore(0); setQuizDone(false); }} className="w-full py-3 bg-amber-500 text-white rounded-2xl font-heading font-bold">Tentar Novamente</button>
        )}
        <button onClick={onBack} className="w-full py-2 text-muted-foreground text-sm">Voltar ao menu</button>
      </div>
    );
  }
  if (showQuiz) {
    const q = topic.quiz[quizIdx];
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{quizIdx + 1}/{topic.quiz.length}</p>
        <p className="font-heading font-bold">{q.q}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => answer(i)} className="w-full text-left px-4 py-3 rounded-xl border-2 border-border/30 bg-muted/30 hover:border-primary transition-all">{opt}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`bg-gradient-to-r ${topic.color} rounded-3xl p-5 text-white text-center`}>
        <span className="text-5xl block mb-2">{topic.emoji}</span>
        <p className="font-heading font-bold text-xl">{topic.title}</p>
      </div>
      {topic.content.map((item, i) => (
        <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border/30 rounded-2xl p-4 flex gap-3">
          <span className="text-3xl">{item.icon}</span>
          <div><p className="font-heading font-bold text-sm">{item.title}</p><p className="text-xs text-muted-foreground mt-1">{item.text}</p></div>
        </motion.div>
      ))}
      <button onClick={() => setShowQuiz(true)} className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold">🧠 Testar conhecimento</button>
    </div>
  );
}

export default function SaudeGame() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saude_completed') || '[]'); } catch { return []; }
  });

  const topic = TOPICS.find(t => t.id === activeTopic);

  const completeTopic = () => {
    if (!completed.includes(activeTopic)) {
      const nc = [...completed, activeTopic];
      setCompleted(nc);
      localStorage.setItem('saude_completed', JSON.stringify(nc));
    }
    setActiveTopic(null);
  };

  if (activeTopic && topic) {
    return (
      <div className="space-y-4 pb-4">
        <button onClick={() => setActiveTopic(null)} className="flex items-center gap-2 text-muted-foreground"><ArrowLeft className="w-4 h-4" /> Voltar</button>
        <TopicContent topic={topic} onComplete={completeTopic} onBack={() => setActiveTopic(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-4">
        <span className="text-5xl block mb-2">💜</span>
        <p className="font-heading font-bold text-xl">Saúde da Atleta</p>
        <p className="text-xs text-muted-foreground">Cuide do seu corpo para jogar melhor!</p>
      </div>
      <div className="grid gap-3">
        {TOPICS.map((t) => (
          <motion.button key={t.id} whileTap={{ scale: 0.98 }} onClick={() => setActiveTopic(t.id)}
            className={`text-left rounded-2xl p-4 border-2 transition-all ${completed.includes(t.id) ? 'bg-green-500/10 border-green-500/40' : 'bg-card border-border/30 hover:border-primary/50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{t.emoji}</span>
              <div className="flex-1">
                <p className="font-heading font-bold text-base">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t.type === 'emotions' ? '30 emoções • Quiz' : `${t.content?.length || 0} dicas • Quiz`}
                </p>
              </div>
              {completed.includes(t.id) && <span className="text-green-500 text-xl">✅</span>}
            </div>
          </motion.button>
        ))}
      </div>
      <div className="bg-card border border-border/30 rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">Progresso: <span className="font-heading font-bold text-foreground">{completed.length}</span> / {TOPICS.length} tópicos</p>
        <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all" style={{ width: `${(completed.length / TOPICS.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
