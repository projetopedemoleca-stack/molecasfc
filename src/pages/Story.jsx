import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { TEAMS } from '@/lib/gameData';
import { audio } from '@/lib/audioEngine';
import ChapterQuiz from '@/components/story/ChapterQuiz';

// ────────────────────────────────────────────────────────────────
// Chapters
// ────────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    id: 1,
    title: 'Primeiro Dia na Escolinha',
    emoji: '📚',
    type: 'scene',
    unlocked: true,
    desc: 'Conheça suas novas amigas e descubra que cada uma tem um jeito único de jogar.',
    tip: '💡 Sabia? O Brasil tem uma das seleções femininas mais fortes do mundo, com jogadoras como Marta — 5x melhor do mundo!',
  },
  {
    id: 2,
    title: 'Juntas Somos Mais Fortes',
    emoji: '🤝',
    type: 'scene',
    unlocked: false,
    desc: 'A professora Ana ensina que cooperação é o segredo do bom futebol.',
    tip: '💡 Curiosidade: No futsal, a quadra menor exige mais comunicação e trabalho em equipe do que no futebol de campo!',
  },
  {
    id: 3,
    title: 'Primeiro Jogo',
    emoji: '⚽',
    type: 'match',
    opponent: 'turminha_fc',
    unlocked: false,
    desc: 'Chegou a hora! Mostre tudo que aprendeu contra a Turminha F.C.',
    tip: '💡 Dica: O passe preciso vale mais do que o chute forte. Confie no seu time!',
  },
  {
    id: 4,
    title: 'Superando Desafios',
    emoji: '💪',
    type: 'scene',
    unlocked: false,
    desc: 'Nem tudo é fácil. Aprender a lidar com a derrota é parte do crescimento.',
    tip: '💡 Marta já disse: "Chora não. A vida é assim. Você vai cair e terá que se levantar."',
  },
  {
    id: 5,
    title: 'Semifinal do Torneio',
    emoji: '🏆',
    type: 'match',
    opponent: 'soccergirls_fc',
    unlocked: false,
    desc: 'SoccerGirls F.C é um desafio e tanto. Use toda sua estratégia!',
    tip: '💡 Dica: Varie entre Passe, Drible e Chute para surpreender o adversário.',
  },
  {
    id: 6,
    title: 'A Grande Final',
    emoji: '🌟',
    type: 'match',
    opponent: 'estrelas_clube',
    unlocked: false,
    desc: 'Estrelas Clube na final. É o maior desafio — e você está pronta!',
    tip: '💡 Curiosidade: A Copa do Mundo Feminina de 2023 foi a maior da história, com 32 seleções participantes!',
  },
];

// ────────────────────────────────────────────────────────────────
// Scene dialog data
// ────────────────────────────────────────────────────────────────
const SCENES = {
  1: {
    bg: '🌤️',
    lines: [
      { speaker: 'Narração', avatar: '📖', text: 'É o primeiro dia na Escolinha de Futsal. O sol brilha lá fora, a quadra coberta está cheia de energia e você sente aquela mistura de nervoso e animado.' },
      { speaker: 'Professora Ana', avatar: '👩🏽‍🏫', text: 'Bem-vindas, meninas! Aqui, não importa se você nunca tocou em uma bola. Todas aprendem juntas. 💚' },
      { speaker: 'Luna', avatar: '👧🏽', text: 'Que lugar incrível! Eu já estava morrendo de vontade de jogar!' },
      { speaker: 'Íris', avatar: '👧🏻', text: '...Prefiro observar primeiro. Mas estou aqui, e isso já é um começo.' },
      { speaker: 'Clara', avatar: '🧑🏼‍🦽', text: 'Eu precisei de coragem pra vir. Mas a professora disse que tem lugar pra mim nesse time!' },
      { speaker: 'Professora Ana', avatar: '👩🏽‍🏫', text: 'Cada uma tem seu ritmo, seu jeito e seu superpoder. O futebol é de todas! Vamos começar? 🌈' },
    ],
  },
  2: {
    bg: '☀️',
    lines: [
      { speaker: 'Narração', avatar: '📖', text: 'Na segunda aula, a professora Ana traz uma novidade: hoje vai ter treino de cooperação.' },
      { speaker: 'Professora Ana', avatar: '👩🏽‍🏫', text: 'Quem consegue marcar gol sozinha o tempo todo? Ninguém! O segredo do futsal é trabalhar em equipe.' },
      { speaker: 'Maya', avatar: '👧🏿', text: 'Mas eu corro muito rápido! Posso ir sozinha pra frente?' },
      { speaker: 'Professora Ana', avatar: '👩🏽‍🏫', text: 'Maya, velocidade é incrível! Mas imagine você + um passe certeiro da Sakura. Impossível parar!' },
      { speaker: 'Sakura', avatar: '👧🏻', text: 'Eu passo, você chuta! Vamos tentar?' },
      { speaker: 'Maya', avatar: '👧🏿', text: '...Ok. Juntas, então! 🤝' },
      { speaker: 'Professora Ana', avatar: '👩🏽‍🏫', text: 'Isso é cooperação! No futsal, cada ação — passe, drible ou chute — tem a hora certa. Lembrem disso!' },
    ],
  },
  4: {
    bg: '🌧️',
    lines: [
      { speaker: 'Narração', avatar: '📖', text: 'A partida foi difícil. Algumas delas sentiram o peso da derrota pela primeira vez. Na saída da quadra coberta, o silêncio pesava.' },
      { speaker: 'Bia', avatar: '👧🏾', text: 'Eu errei tanto... Será que sou boa o suficiente pra isso?' },
      { speaker: 'Professora Ana', avatar: '👩🏽‍🏫', text: 'Bia, toda craque já perdeu muito antes de ganhar. O erro é parte do aprendizado — sem ele, não existe evolução.' },
      { speaker: 'Luna', avatar: '👧🏽', text: 'Eu também errei! Mas já sei onde melhorar. Próxima vez vai ser diferente!' },
      { speaker: 'Ana', avatar: '👧🏽', text: '🤟 (Juntas, mais fortes!)', subtext: '[Língua de sinais]' },
      { speaker: 'Professora Ana', avatar: '👩🏽‍🏫', text: 'Marta já disse: "Chora não. A vida é assim. Você cai e tem que se levantar." Resiliência é um superpoder real!' },
      { speaker: 'Narração', avatar: '📖', text: 'As meninas voltaram pra quadra com mais garra do que nunca. A derrota virou combustível. 🔥' },
    ],
  },
};

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────
// Persist story progress in localStorage
const STORY_KEY = 'molecas_story';
function loadStoryProgress() {
  try { return JSON.parse(localStorage.getItem(STORY_KEY) || '{}'); } catch { return {}; }
}
function saveStoryProgress(progress) {
  try { localStorage.setItem(STORY_KEY, JSON.stringify(progress)); } catch {}
}

export default function Story() {
  const navigate = useNavigate();

  // Merge saved progress into chapters
  const initChapters = () => {
    const progress = loadStoryProgress();
    return CHAPTERS.map(c => ({
      ...c,
      completed: !!progress[c.id]?.completed,
      unlocked: c.id === 1 || !!progress[c.id]?.unlocked,
    }));
  };

  const [chapters, setChapters] = useState(initChapters);
  const [showDialog, setShowDialog] = useState(null);
  const [showScene, setShowScene] = useState(null);
  const [sceneLine, setSceneLine] = useState(0);
  const [showSeal, setShowSeal] = useState(null);
  const [showQuiz, setShowQuiz] = useState(null); // chapterId waiting for quiz
  const [pendingMatch, setPendingMatch] = useState(null); // match chapter waiting after quiz

  const persistProgress = (updatedChapters) => {
    const progress = {};
    updatedChapters.forEach(c => {
      progress[c.id] = { completed: !!c.completed, unlocked: !!c.unlocked };
    });
    saveStoryProgress(progress);
  };

  const unlockNext = (id) => {
    setChapters(prev => {
      const updated = prev.map(c => c.id === id + 1 ? { ...c, unlocked: true } : c);
      persistProgress(updated);
      return updated;
    });
  };

  const markCompleted = (id) => {
    setChapters(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, completed: true } : c);
      persistProgress(updated);
      return updated;
    });
  };

  const handleChapterClick = (ch) => {
    if (!ch.unlocked) return;
    audio.playSelect();
    if (ch.type === 'match') setShowDialog(ch);
    else { setShowScene(ch); setSceneLine(0); }
  };

  const nextLine = () => {
    const lines = SCENES[showScene?.id]?.lines || [];
    if (sceneLine < lines.length - 1) {
      setSceneLine(s => s + 1);
    } else {
      // Scene finished → open quiz before awarding seal
      const id = showScene.id;
      setShowScene(null);
      setShowQuiz(id);
    }
  };

  const handleQuizPass = () => {
    const id = showQuiz;
    setShowQuiz(null);
    if (pendingMatch) {
      // It's a match chapter — navigate to match after quiz pass
      const ch = pendingMatch;
      setPendingMatch(null);
      unlockNext(ch.id);
      markCompleted(ch.id);
      navigate(`/match?team=pe_de_moleca&opponent=${ch.opponent}&difficulty=medium&story=${ch.id}`);
    } else {
      markCompleted(id);
      unlockNext(id);
      setShowSeal(id);
      setTimeout(() => setShowSeal(null), 2500);
    }
  };

  const handleQuizFail = () => {
    const id = showQuiz;
    setShowQuiz(null);
    setPendingMatch(null); // cancel pending match on fail
    setTimeout(() => setShowQuiz(id), 900);
  };

  const startMatch = (ch) => {
    setShowDialog(null);
    // For match chapters: show quiz first, then navigate on pass
    setShowQuiz(ch.id);
    // Store pending match so we can navigate after quiz
    setPendingMatch(ch);
  };

  const typeColor = (type) => type === 'match' ? 'from-primary to-green-500' : 'from-accent to-pink-400';

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background px-4 py-6 font-body">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground mb-4">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-heading font-semibold">Voltar</span>
      </Link>

      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-7">
        <span className="text-5xl block mb-2">📖</span>
        <h1 className="font-heading text-3xl font-bold">Modo História</h1>
        <p className="text-muted-foreground text-sm mt-1">A aventura da Escolinha de Futsal ⚽</p>
      </motion.div>

      {/* Timeline */}
      <div className="max-w-sm mx-auto relative">
        <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-border/60 rounded-full" />

        <div className="space-y-3">
          {chapters.map((ch, i) => {
            const isUnlocked = ch.unlocked;
            const opponent = ch.opponent ? TEAMS.find(t => t.id === ch.opponent) : null;

            return (
              <motion.div
                key={ch.id}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  onClick={() => handleChapterClick(ch)}
                  disabled={!isUnlocked}
                  className={`relative w-full text-left pl-14 pr-4 py-4 rounded-2xl border transition-all ${
                    isUnlocked
                      ? ch.completed
                        ? 'bg-primary/5 border-primary/30 shadow'
                        : 'bg-card border-border/50 shadow-md active:scale-[0.98]'
                      : 'bg-muted/30 border-border/20 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Circle on timeline */}
                  <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    ch.completed
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isUnlocked
                      ? 'bg-card border-primary text-primary'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}>
                    {ch.completed ? <CheckCircle2 className="w-4 h-4" /> : isUnlocked ? <span className="text-sm">{ch.emoji}</span> : <Lock className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-heading font-bold text-sm">Cap. {ch.id}: {ch.title}</p>
                        {ch.completed && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">✓ Concluído</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{ch.desc}</p>
                      {opponent && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                          {opponent.emoji} vs {opponent.name}
                        </span>
                      )}
                    </div>
                    <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${typeColor(ch.type)}`}>
                      {ch.type === 'match' ? 'Jogo' : 'Cena'}
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Seal animation */}
      <AnimatePresence>
        {showSeal && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-primary text-primary-foreground rounded-full w-44 h-44 flex flex-col items-center justify-center shadow-2xl border-4 border-primary-foreground/30">
              <span className="text-5xl">⭐</span>
              <p className="font-heading font-bold text-base mt-1">Concluído!</p>
              <p className="text-xs opacity-80">Cap. {showSeal}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match start modal */}
      <AnimatePresence>
        {showDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDialog(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-3xl p-6 shadow-2xl w-full max-w-sm">
              <div className="text-center mb-4">
                <span className="text-5xl block mb-2">{showDialog.emoji}</span>
                <h2 className="font-heading font-bold text-xl">{showDialog.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{showDialog.desc}</p>
                <div className="mt-3 bg-secondary/10 border border-secondary/20 rounded-xl p-2.5">
                  <p className="text-xs text-foreground/80">{showDialog.tip}</p>
                </div>
              </div>
              <button onClick={() => startMatch(showDialog)}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-lg active:scale-95 transition-transform shadow-lg">
                ⚽ Jogar agora!
              </button>
              <button onClick={() => setShowDialog(null)} className="w-full py-2 text-muted-foreground font-semibold text-sm mt-2">
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter Quiz */}
      <AnimatePresence>
        {showQuiz && (
          <ChapterQuiz
            chapterId={showQuiz}
            onPass={handleQuizPass}
            onFail={handleQuizFail}
          />
        )}
      </AnimatePresence>

      {/* Scene dialog */}
      <AnimatePresence>
        {showScene && SCENES[showScene.id] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              className="w-full max-w-sm bg-card rounded-t-3xl p-5 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-semibold bg-muted rounded-full px-3 py-1">
                  {SCENES[showScene.id].bg} Cap. {showScene.id}: {showScene.title}
                </span>
                <span className="text-xs text-muted-foreground">{sceneLine + 1}/{SCENES[showScene.id].lines.length}</span>
              </div>

              {/* Tip box for chapters with it */}
              {sceneLine === SCENES[showScene.id].lines.length - 1 && showScene.tip && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-3 bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2">
                  <p className="text-[11px] text-foreground/80">{showScene.tip}</p>
                </motion.div>
              )}

              {/* Dialog bubble */}
              {(() => {
                const lines = SCENES[showScene.id].lines;
                const line = lines[sceneLine];
                return (
                  <div>
                    <AnimatePresence mode="wait">
                      <motion.div key={sceneLine} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="flex items-end gap-3 mb-4">
                        <span className="text-5xl shrink-0">{line.avatar}</span>
                        <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex-1">
                          <p className="text-xs font-bold text-primary mb-0.5">{line.speaker}</p>
                          <p className="text-sm leading-relaxed">{line.text}</p>
                          {line.subtext && <p className="text-[10px] text-muted-foreground italic mt-0.5">{line.subtext}</p>}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-1.5 mb-4">
                      {lines.map((_, idx) => (
                        <div key={idx} className={`rounded-full transition-all ${idx === sceneLine ? 'w-4 h-1.5 bg-primary' : idx < sceneLine ? 'w-1.5 h-1.5 bg-primary/50' : 'w-1.5 h-1.5 bg-muted'}`} />
                      ))}
                    </div>

                    <button onClick={nextLine}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold text-base active:scale-95 transition-transform">
                      {sceneLine < lines.length - 1 ? 'Continuar ▶' : '⭐ Concluir Capítulo'}
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}