import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DATA = {
  brasil: {
    title: 'Futebol no Brasil 🇧🇷', emoji: '🇧🇷', color: 'from-green-500 to-yellow-500',
    content: [
      { icon: '⚽', title: 'A Chegada (1894)', text: 'Charles Miller trouxe as primeiras bolas e regras do futebol da Inglaterra para o Brasil!' },
      { icon: '🏆', title: 'Primeiro Campeonato (1902)', text: 'O primeiro campeonato paulista foi disputado por clubes ingleses e alemães.' },
      { icon: '🥇', title: 'Pentacampeonato (1958-2002)', text: 'O Brasil é o único país pentacampeão mundial! Pelé, Garrincha, Ronaldo, Ronaldinho... lendas!' },
      { icon: '👩', title: 'Futebol Feminino', text: 'As mulheres jogavam escondidas até 1979, quando o decreto-lei permitiu oficialmente.' },
      { icon: '🌟', title: 'Marta e Formiga', text: 'Marta é a maior artilheira da história das Copas. Formiga jogou 7 Copas do Mundo!' },
      { icon: '🏟️', title: 'Maracanã', text: 'O maior estádio do Brasil já recebeu quase 200 mil pessoas numa final de Copa!' },
    ],
    quiz: [
      { q: 'Quem trouxe o futebol para o Brasil?', options: ['Pelé','Charles Miller','Garrincha','Zico'], answer: 1 },
      { q: 'Quantas Copas o Brasil ganhou?', options: ['3','4','5','6'], answer: 2 },
      { q: 'Quando o futebol feminino foi liberado?', options: ['1950','1979','1990','2000'], answer: 1 },
    ],
  },
  mundo: {
    title: 'Futebol no Mundo 🌍', emoji: '🌍', color: 'from-blue-500 to-purple-500',
    content: [
      { icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', title: 'Origem na Inglaterra (1863)', text: 'As primeiras regras foram criadas na Inglaterra. O futebol moderno nasceu ali!' },
      { icon: '🏆', title: 'Primeira Copa (1930)', text: 'Uruguai sediou e venceu a primeira Copa do Mundo da história!' },
      { icon: '⚽', title: 'A Bola', text: 'A bola de futebol tem 32 gomos (20 hexágonos e 12 pentágonos).' },
      { icon: '🥅', title: 'Gol mais rápido', text: '2,8 segundos! Foi marcado por Nawaf Al-Abed em 2009.' },
      { icon: '🌎', title: 'Copa Feminina', text: 'A primeira Copa do Mundo Feminina foi em 1991, vencida pelos EUA.' },
    ],
    quiz: [
      { q: 'Onde nasceu o futebol?', options: ['Brasil','Alemanha','Inglaterra','Itália'], answer: 2 },
      { q: 'Quando foi a primeira Copa?', options: ['1920','1930','1940','1950'], answer: 1 },
      { q: 'Quantos gomos tem uma bola?', options: ['30','32','34','36'], answer: 1 },
    ],
  },
  futsal: {
    title: 'Futsal ⚡', emoji: '⚡', color: 'from-orange-500 to-red-500',
    content: [
      { icon: '🇺🇾', title: 'Origem no Uruguai (1930)', text: 'Juan Carlos Ceriani criou o futsal para jogar em quadras cobertas!' },
      { icon: '🇧🇷', title: 'Falcão e o Brasil', text: 'O Brasil domina o futsal mundial! Falcão é considerado o melhor de todos os tempos.' },
      { icon: '🥅', title: 'Goleira', text: 'Defende a meta. Pode usar as mãos na área. É a última defesa!' },
      { icon: '🛡️', title: 'Fixo', text: 'Joga na defesa. Marca forte e organiza o time. É o "zagueiro" do futsal!' },
      { icon: '⚡', title: 'Ala', text: 'Joga pelas laterais. Corre muito e liga defesa e ataque!' },
      { icon: '🎯', title: 'Pivô', text: 'Joga de costas para o gol. Recebe a bola e finaliza ou assiste!' },
    ],
    quiz: [
      { q: 'Quem criou o futsal?', options: ['Pelé','Juan Carlos Ceriani','Falcão','Zico'], answer: 1 },
      { q: 'Qual posição marca na defesa?', options: ['Pivô','Ala','Fixo','Goleira'], answer: 2 },
      { q: 'Quem joga de costas para o gol?', options: ['Ala','Fixo','Pivô','Goleira'], answer: 2 },
    ],
  },
};

function Quiz({ data, onComplete, onBack }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = data.quiz[idx];

  const answer = (i) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === q.answer;
    const ns = correct ? score + 1 : score;
    setTimeout(() => {
      if (idx + 1 >= data.quiz.length) { if (ns >= 2) { setScore(ns); setDone(true); } else { setIdx(0); setSelected(null); setScore(0); } }
      else { setScore(ns); setIdx(n => n + 1); setSelected(null); }
    }, 900);
  };

  if (done) return (
    <div className="bg-card border border-border/30 rounded-2xl p-6 text-center space-y-4">
      <span className="text-6xl block">🎉</span>
      <p className="font-heading font-bold text-xl">Quiz Aprovado!</p>
      <p className="text-muted-foreground">{score}/{data.quiz.length} corretas</p>
      <button onClick={onComplete} className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold">Continuar 🎮</button>
      <button onClick={onBack} className="w-full py-2 text-muted-foreground text-sm">Voltar ao conteúdo</button>
    </div>
  );

  return (
    <div className="bg-card border border-border/30 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-muted-foreground text-sm">← Voltar</button>
        <span className="text-xs text-muted-foreground">{idx+1}/{data.quiz.length}</span>
      </div>
      <p className="font-heading font-bold text-center mb-4">{q.q}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => (
          <motion.button key={i} whileTap={{ scale: selected === null ? 0.95 : 1 }} onClick={() => answer(i)} disabled={selected !== null}
            className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${selected === null ? 'bg-muted hover:bg-primary/20' : i === q.answer ? 'bg-green-500 text-white' : selected === i ? 'bg-red-500 text-white' : 'bg-muted'}`}>
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function HistoriaFutebolGame() {
  const [activeTab, setActiveTab] = useState('brasil');
  const [showQuiz, setShowQuiz] = useState(false);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('historia_futebol_completed') || '[]'); } catch { return []; }
  });

  const data = DATA[activeTab];

  const completeSection = () => {
    if (!completed.includes(activeTab)) {
      const nc = [...completed, activeTab];
      setCompleted(nc); localStorage.setItem('historia_futebol_completed', JSON.stringify(nc));
    }
    setShowQuiz(false);
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2"><span className="text-5xl block mb-2">🏛️</span><p className="font-heading font-bold text-xl">História do Futebol</p><p className="text-xs text-muted-foreground">Brasil, Mundo e Futsal!</p></div>
      <div className="flex bg-muted rounded-2xl p-1">
        {[['brasil','🇧🇷 Brasil'],['mundo','🌍 Mundo'],['futsal','⚡ Futsal']].map(([k,l]) => (
          <button key={k} onClick={() => { setActiveTab(k); setShowQuiz(false); }} className={`flex-1 py-2 rounded-xl font-heading font-bold text-xs transition-all ${activeTab === k ? 'bg-card shadow' : 'text-muted-foreground'}`}>{l}</button>
        ))}
      </div>
      {!showQuiz ? (
        <div className="space-y-3">
          <div className={`bg-gradient-to-r ${data.color} rounded-3xl p-5 text-white text-center`}>
            <span className="text-4xl block mb-2">{data.emoji}</span>
            <p className="font-heading font-bold text-lg">{data.title}</p>
          </div>
          {data.content.map((item, i) => (
            <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border/30 rounded-2xl p-4 flex gap-3">
              <span className="text-3xl">{item.icon}</span>
              <div><p className="font-heading font-bold text-sm">{item.title}</p><p className="text-xs text-muted-foreground mt-1">{item.text}</p></div>
            </motion.div>
          ))}
          <button onClick={() => setShowQuiz(true)} className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold">🧠 Fazer Quiz</button>
        </div>
      ) : (
        <Quiz data={data} onComplete={completeSection} onBack={() => setShowQuiz(false)} />
      )}
      <div className="bg-card border border-border/30 rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">Progresso: <span className="font-bold text-foreground">{completed.length}</span> / 3 seções</p>
        <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${(completed.length / 3) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}