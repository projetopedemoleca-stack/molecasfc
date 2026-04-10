import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const TOPICS = [
  { id: 'mental', title: 'Saúde Mental & Emoções', emoji: '🧠', color: 'from-indigo-400 to-purple-500',
    content: [
      { icon: '😊', title: 'Todas as emoções são válidas', text: 'Ficar triste, nervosa ou ansiosa é normal. O importante é reconhecer e expressar o que sente.' },
      { icon: '💬', title: 'Falar ajuda muito', text: 'Conversar com amigas, família ou professores sobre seus sentimentos alivia o peso.' },
      { icon: '😤', title: 'Frustração no esporte', text: 'Perder jogos ou errar gols faz parte. O que importa é levantar e tentar de novo. Resiliência!' },
      { icon: '🧘‍♀️', title: 'Respire fundo', text: 'Quando estiver nervosa, respire lentamente 3 vezes. Isso acalma o corpo e a mente.' },
      { icon: '💪', title: 'Autoestima da atleta', text: 'Seu valor não é só vitória ou derrota. Você é especial pelas suas qualidades, esforço e bondade.' },
    ],
    quiz: [
      { q: 'O que fazer quando estiver nervosa?', options: ['Gritar com todos','Respirar fundo 3 vezes','Ficar quieta','Sair correndo'], answer: 1 },
      { q: 'Falar sobre sentimentos é:', options: ['Sinal de fraqueza','Importante e saudável','Só para crianças','Desnecessário'], answer: 1 },
    ],
  },
  { id: 'higiene', title: 'Higiene Básica', emoji: '🛁', color: 'from-cyan-400 to-blue-500',
    content: [
      { icon: '🧼', title: 'Lave as mãos!', text: 'Antes das refeições e após o banheiro. Use sabão e água por 20 segundos.' },
      { icon: '🚿', title: 'Banho pós-treino', text: 'Sempre tome banho após treinar ou jogar. Suor + bactérias = odor e irritações.' },
      { icon: '🦷', title: 'Escove os dentes', text: '2x ao dia, por 2 minutos. Fio dental é seu amigo!' },
      { icon: '💅', title: 'Unhas curtas', text: 'Unhas limpas e cortadas evitam acidentes e acúmulo de sujeira.' },
    ],
    quiz: [
      { q: 'Quanto tempo devemos lavar as mãos?', options: ['5 segundos','10 segundos','20 segundos','1 minuto'], answer: 2 },
      { q: 'Quando tomar banho após treino?', options: ['Só no dia seguinte','Imediatamente','Não precisa','De 2 em 2 dias'], answer: 1 },
    ],
  },
  { id: 'alimentacao', title: 'Alimentação Saudável', emoji: '🥗', color: 'from-green-400 to-emerald-500',
    content: [
      { icon: '🌈', title: 'Prato colorido', text: 'Quanto mais cores no prato, melhor! Cada cor = nutrientes diferentes.' },
      { icon: '🍎', title: 'Frutas são doces naturais', text: 'Substitua doces industrializados por frutas. Banana dá muita energia!' },
      { icon: '💪', title: 'Proteínas = músculos', text: 'Frango, peixe, ovos, feijão. Ajuda a construir músculos fortes!' },
      { icon: '🍞', title: 'Carboidratos = energia', text: 'Arroz, pão, massa, batata. Combustível para correr 90 minutos!' },
      { icon: '🚫', title: 'Evite antes do jogo', text: 'Refrigerante, frituras e doces pesados. Deixam você lenta e com sono.' },
    ],
    quiz: [
      { q: 'O que dá energia para jogar?', options: ['Refrigerante','Frutas e carboidratos','Só água','Doces'], answer: 1 },
      { q: 'Para que servem proteínas?', options: ['Dormir melhor','Construir músculos','Ficar alta','Nada'], answer: 1 },
    ],
  },
  { id: 'hidratacao', title: 'Hidratação 💧', emoji: '💧', color: 'from-blue-400 to-cyan-500',
    content: [
      { icon: '🥤', title: 'Beba água!', text: 'Mínimo 6-8 copos por dia. No treino: a cada 15-20 minutos.' },
      { icon: '💦', title: 'Sinais de sede', text: 'Boca seca, cansaço, dor de cabeça = beba água AGORA!' },
      { icon: '🚫', title: 'Evite refrigerantes', text: 'Açúcar demais e não hidratam bem. Água é a melhor amiga da atleta!' },
    ],
    quiz: [
      { q: 'Quantos copos de água por dia?', options: ['2 copos','4 copos','6-8 copos','1 litro de uma vez'], answer: 2 },
      { q: 'O que fazer se perder peso no treino?', options: ['Comer mais','Beber água','Dormir','Nada'], answer: 1 },
    ],
  },
  { id: 'menstruacao', title: 'Primeira Menstruação', emoji: '🌸', color: 'from-pink-400 to-rose-500',
    content: [
      { icon: '🩷', title: 'É normal!', text: 'A menstruação é natural e acontece entre 9-15 anos. Cada corpo tem seu tempo.' },
      { icon: '🎒', title: 'Kit de emergência', text: 'Sempre leve absorventes na mochila. Tenha um "kit secreto" com: absorvente, calcinha extra e lenços umedecidos.' },
      { icon: '💧', title: 'Higiene íntima', text: 'Troque o absorvente a cada 4-6 horas. Lave a região com água e sabão neutro.' },
      { icon: '🏃‍♀️', title: 'Pode treinar!', text: 'Exercício durante a menstruação é liberado! Ajuda até a aliviar cólicas.' },
    ],
    quiz: [
      { q: 'A cada quantas horas trocar o absorvente?', options: ['12 horas','4-6 horas','1 hora','24 horas'], answer: 1 },
      { q: 'Posso treinar na menstruação?', options: ['Sim!','Não, é proibido','Só se for campeã','Depende da lua'], answer: 0 },
    ],
  },
];

function TopicContent({ topic, onComplete, onBack }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

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
      setCompleted(nc); localStorage.setItem('saude_completed', JSON.stringify(nc));
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
      <div className="text-center mb-4"><span className="text-5xl block mb-2">💜</span><p className="font-heading font-bold text-xl">Saúde da Atleta</p><p className="text-xs text-muted-foreground">Cuide do seu corpo para jogar melhor!</p></div>
      <div className="grid gap-3">
        {TOPICS.map((t) => (
          <motion.button key={t.id} whileTap={{ scale: 0.98 }} onClick={() => setActiveTopic(t.id)}
            className={`text-left rounded-2xl p-4 border-2 transition-all ${completed.includes(t.id) ? 'bg-green-500/10 border-green-500/40' : 'bg-card border-border/30 hover:border-primary/50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{t.emoji}</span>
              <div className="flex-1">
                <p className="font-heading font-bold text-base">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.content.length} dicas • Quiz</p>
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