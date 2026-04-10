import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

// Quiz por capítulo — emoções + futebol feminino
export const CHAPTER_QUIZZES = {
  1: {
    question: 'Quando você sente nervoso antes de um jogo, o que pode ajudar?',
    emoji: '💛',
    options: [
      { text: 'Respirar fundo e lembrar que errar faz parte do aprendizado', correct: true },
      { text: 'Desistir de jogar para não se machucar', correct: false },
      { text: 'Gritar com as colegas para liberar a tensão', correct: false },
      { text: 'Fingir que não está nervosa e ignorar o sentimento', correct: false },
    ],
  },
  2: {
    question: 'O que o trabalho em equipe tem a ver com emoções?',
    emoji: '🤝',
    options: [
      { text: 'Nada, cada uma joga por si mesma', correct: false },
      { text: 'Entender os sentimentos das colegas ajuda a jogar melhor juntas', correct: true },
      { text: 'Sentimentos não importam no esporte', correct: false },
      { text: 'Só a mais forte do time precisa de apoio emocional', correct: false },
    ],
  },
  3: {
    question: 'Marta é conhecida mundialmente no futebol feminino. Quantas vezes ela foi eleita melhor jogadora do mundo?',
    emoji: '⚽',
    options: [
      { text: '3 vezes', correct: false },
      { text: '4 vezes', correct: false },
      { text: '5 vezes', correct: false },
      { text: '6 vezes', correct: true },
    ],
  },
  4: {
    question: 'Quando uma colega erra e fica triste, a melhor reação é:',
    emoji: '💪',
    options: [
      { text: 'Criticar para ela aprender a não errar de novo', correct: false },
      { text: 'Ignorar, pois não é problema seu', correct: false },
      { text: 'Encorajá-la — o erro faz parte do crescimento', correct: true },
      { text: 'Pedir pra professora tirar ela do jogo', correct: false },
    ],
  },
  5: {
    question: 'Numa semifinal tensa, você erra um passe importante. O que fazer?',
    emoji: '🏆',
    options: [
      { text: 'Parar de tentar para não errar mais', correct: false },
      { text: 'Respirar, sacudir a cabeça e seguir em frente com foco', correct: true },
      { text: 'Reclamar da colega que pediu o passe', correct: false },
      { text: 'Chorar e pedir para sair de campo', correct: false },
    ],
  },
  6: {
    question: 'A Copinha de Futsal Feminino foi criada para:',
    emoji: '🌟',
    options: [
      { text: 'Substituir o futebol masculino', correct: false },
      { text: 'Mostrar que meninas não precisam de competições', correct: false },
      { text: 'Dar espaço, visibilidade e celebrar o futebol praticado por meninas', correct: true },
      { text: 'Arrecadar dinheiro somente para times profissionais', correct: false },
    ],
  },
};

export default function ChapterQuiz({ chapterId, onPass, onFail }) {
  const quiz = CHAPTER_QUIZZES[chapterId];
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  if (!quiz) { onPass(); return null; }

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (quiz.options[idx].correct) {
      setTimeout(onPass, 1400);
    } else {
      setTimeout(onFail, 1400);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 120, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
        className="bg-card rounded-3xl p-6 shadow-2xl w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-5">
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
            className="text-5xl block mb-2">{quiz.emoji}</motion.span>
          <span className="text-xs font-bold bg-accent/10 text-accent px-3 py-1 rounded-full">🧠 Quiz do Capítulo</span>
          <p className="font-heading font-bold text-base mt-3 leading-snug">{quiz.question}</p>
          <p className="text-xs text-muted-foreground mt-1">Acerte para ganhar o selo do capítulo!</p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {quiz.options.map((opt, idx) => {
            let style = 'bg-muted/60 border-border/40 text-foreground';
            if (answered && idx === selected) {
              style = opt.correct
                ? 'bg-primary/15 border-primary text-primary'
                : 'bg-destructive/15 border-destructive text-destructive';
            } else if (answered && opt.correct) {
              style = 'bg-primary/10 border-primary/50 text-primary';
            }
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-2xl border-2 transition-all font-body text-sm font-semibold ${style} ${!answered ? 'active:scale-95 cursor-pointer' : 'cursor-default'}`}>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                  {answered && idx === selected
                    ? (opt.correct ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />)
                    : ['A', 'B', 'C', 'D'][idx]
                  }
                </span>
                {opt.text}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {answered && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-4 text-center rounded-2xl py-3 px-4 ${quiz.options[selected]?.correct ? 'bg-primary/10 border border-primary/30' : 'bg-destructive/10 border border-destructive/20'}`}>
              <p className={`font-heading font-bold text-lg ${quiz.options[selected]?.correct ? 'text-primary' : 'text-destructive'}`}>
                {quiz.options[selected]?.correct ? '⭐ Correto! Selo conquistado!' : '❌ Quase! Tente de novo.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}