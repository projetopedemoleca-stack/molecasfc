import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FUND_SECTIONS = [
  {
    id: 'futsal', title: 'Futsal ⚡', emoji: '⚡',
    items: [
      { title: 'O que é Futsal?', icon: '🏟️', text: 'Futebol de Salão! Jogado em quadra coberta com 5 jogadoras por time. É rápido, técnico e muito divertido!' },
      { title: 'A Quadra', icon: '⬜', text: 'Mede 40m x 20m. As linhas laterais são paredes! A bola pode bater e voltar pro jogo.' },
      { title: 'Goleira (Fixo)', icon: '🥅', text: 'Defende o gol e pode usar as mãos na área. No futsal, a goleira também é chamada de Fixo quando joga na linha.' },
      { title: 'Fixo', icon: '🛡️', text: 'Jogadora de defesa. Marca forte, desarma e inicia os ataques. É a "zagueira" do futsal!' },
      { title: 'Ala (Ponta)', icon: '⚡', text: 'Joga pelas laterais. Corre muito, apoia na defesa e ataca pelos lados. Fundamental no futsal!' },
      { title: 'Pivô', icon: '🎯', text: 'Joga de costas para o gol, próximo à área. Recebe passes, protege a bola e finaliza. É a artilheira!' },
      { title: 'Bola no Futsal', icon: '⚽', text: 'Mais pesada e menor que a de campo. Não quica muito, exige mais controle e técnica!' },
      { title: 'Substituição Livre', icon: '🔄', text: 'No futsal pode trocar quantas vezes quiser! O jogo não para para substituir.' },
    ],
    quiz: [
      { q: 'Quantas jogadoras tem no futsal?', options: ['5', '7', '9', '11'], answer: 0 },
      { q: 'Quem joga de costas para o gol?', options: ['Ala', 'Fixo', 'Pivô', 'Goleira'], answer: 2 },
      { q: 'O que acontece quando a bola bate na parede?', options: ['Sai', 'Continua', 'Falta', 'Escanteio'], answer: 1 },
      { q: 'Quantas substituições são permitidas?', options: ['3', '5', 'Ilimitadas', 'Nenhuma'], answer: 2 },
    ],
  },
  {
    id: 'rules', title: 'Regras Básicas', emoji: '📋',
    items: [
      { title: 'Objetivo do Jogo', icon: '🥅', text: 'Marcar mais gols que o adversário. Futsal: 2×20 min. Futebol campo: 2×45 min.' },
      { title: 'Número de Jogadoras', icon: '👥', text: 'Futsal: 5 por time (1 goleira + 4 de linha). Futebol campo: 11 por time.' },
      { title: 'Falta e Cartões', icon: '🟨', text: 'Amarelo = advertência. Vermelho = expulsão. Duas amarelas = vermelho.' },
      { title: 'Tiro Livre', icon: '🎯', text: 'Direto (chutar ao gol) ou indireto (toca antes numa companheira).' },
      { title: 'Pênalti', icon: '⚽', text: 'Falta na área. Cobrança a 6m (futsal) ou 11m (campo). Só a goleira defende.' },
      { title: 'Impedimento', icon: '🚩', text: 'No futebol campo: atacante na frente do último defensor. No futsal NÃO existe!' },
    ],
    quiz: [
      { q: 'Quantas jogadoras de linha tem um time de futsal?', options: ['3','4','5','6'], answer: 1 },
      { q: 'O que acontece com duas amarelas?', options: ['Nada','Advertência','Vermelho','Tiro livre'], answer: 2 },
      { q: 'No futsal existe impedimento?', options: ['Sim','Não','Às vezes','Depende'], answer: 1 },
    ],
  },
  {
    id: 'positions', title: 'Posições', emoji: '📍',
    items: [
      { title: 'Goleira', icon: '🧤', text: 'Última defesa. Única que usa as mãos (dentro da área). Precisa ser corajosa.' },
      { title: 'Zagueira', icon: '🛡️', text: 'Defensora central. Marca as atacantes e tira a bola do perigo.' },
      { title: 'Lateral', icon: '↕️', text: 'Joga nas laterais. Ataca e defende. Precisa ter muita resistência.' },
      { title: 'Volante / Meia Defensiva', icon: '⚙️', text: 'Protege a defesa e distribui o jogo.' },
      { title: 'Meia Atacante', icon: '🎨', text: 'Conecta defesa e ataque. Criativa, dá assistências.' },
      { title: 'Atacante / Centroavante', icon: '⚡', text: 'Artilheira. Rápida e boa finalizadora.' },
    ],
    quiz: [
      { q: 'Quem é a única que pode usar as mãos?', options: ['Zagueira','Atacante','Goleira','Lateral'], answer: 2 },
      { q: 'Qual posição conecta defesa e ataque?', options: ['Goleira','Meia','Lateral','Zagueira'], answer: 1 },
    ],
  },
  {
    id: 'techniques', title: 'Técnicas', emoji: '⚽',
    items: [
      { title: 'Drible', icon: '🌀', text: 'Mudar de direção e velocidade para enganar a adversária.' },
      { title: 'Passe', icon: '🎯', text: 'Enviar a bola para uma companheira. Precisão > força.' },
      { title: 'Chute', icon: '💥', text: 'Peito do pé = potência. Lateral do pé = precisão.' },
      { title: 'Embaixadinha', icon: '🤹', text: 'Malabarismo que melhora controle e coordenação. Treine todo dia!' },
      { title: 'Tabela (Toca-e-Vai)', icon: '🔄', text: 'Passe rápido entre duas jogadoras para superar a marcação. Essencial no futsal!' },
      { title: 'Marcação Pressão', icon: '🤺', text: 'Pressionar a adversária imediatamente ao perder a bola.' },
    ],
    quiz: [
      { q: 'Qual parte do pé dá mais precisão?', options: ['Bico','Peito do pé','Lateral do pé','Calcanhar'], answer: 2 },
      { q: 'O que é "tabela"?', options: ['Placar','Calendário','Passe rápido entre duas','Golpe proibido'], answer: 2 },
    ],
  },
  {
    id: 'referee', title: 'Arbitragem', emoji: '🏴',
    items: [
      { title: 'Árbitro Principal', icon: '👩‍⚖️', text: 'Dirige o jogo, aplica as regras e dá os cartões. Decisão final é dela.' },
      { title: 'Assistentes', icon: '🚩', text: 'Ficam nas laterais sinalizando impedimentos, laterais e escanteios.' },
      { title: 'VAR', icon: '📺', text: 'Assistente de vídeo. Revisa gols, pênaltis e cartões vermelhos duvidosos.' },
      { title: 'Tempo Extra', icon: '⏱️', text: 'Minutos adicionados ao fim de cada tempo para compensar paradas.' },
    ],
    quiz: [
      { q: 'Quem decide se houve falta?', options: ['Capitã','Árbitro principal','Torcida','Técnica'], answer: 1 },
      { q: 'VAR serve para...?', options: ['Vender ingressos','Revisar lances duvidosos','Substituições','Cronometragem'], answer: 1 },
    ],
  },
];

function SectionQuiz({ questions, onDone }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[idx];
  const pick = (i) => {
    if (selected !== null) return;
    setSelected(i);
    const newScore = i === q.answer ? score + 1 : score;
    setTimeout(() => {
      if (idx + 1 >= questions.length) { setScore(newScore); setDone(true); }
      else { setIdx(n => n + 1); setSelected(null); }
    }, 900);
  };
  if (done) return (
    <div className="text-center py-4 space-y-2">
      <span className="text-4xl">{score === questions.length ? '🏆' : '👍'}</span>
      <p className="font-heading font-bold text-lg">{score}/{questions.length} acertos!</p>
      <button onClick={onDone} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold">Fechar quiz</button>
    </div>
  );
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{idx + 1}/{questions.length}</p>
      <p className="font-heading font-bold text-sm">{q.q}</p>
      {q.options.map((opt, i) => (
        <button key={i} onClick={() => pick(i)}
          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border-2 transition-all ${selected === null ? 'border-border/30 bg-muted/30' : i === q.answer ? 'border-green-500 bg-green-500/15 text-green-700 font-bold' : i === selected ? 'border-red-500 bg-red-500/15 text-red-600' : 'border-border/20 opacity-50'}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function FundamentosGame() {
  const [openSection, setOpenSection] = useState(null);
  const [quizSection, setQuizSection] = useState(null);

  return (
    <div className="space-y-3 pb-4">
      <div className="text-center mb-4">
        <span className="text-4xl block mb-1">🏟️</span>
        <p className="font-heading font-bold text-xl">Fundamentos do Futebol & Futsal</p>
        <p className="text-xs text-muted-foreground">Aprenda, jogue e teste seus conhecimentos!</p>
      </div>
      {FUND_SECTIONS.map((sec) => (
        <div key={sec.id} className="bg-card border border-border/30 rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => { setOpenSection(openSection === sec.id ? null : sec.id); setQuizSection(null); }}
            className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sec.emoji}</span>
              <span className="font-heading font-bold text-base">{sec.title}</span>
            </div>
            <span className="text-muted-foreground text-xs">{openSection === sec.id ? '▲' : '▼'}</span>
          </button>
          {openSection === sec.id && (
            <div className="border-t border-border/20 p-4 space-y-3">
              {quizSection === sec.id ? (
                <SectionQuiz questions={sec.quiz} onDone={() => setQuizSection(null)} />
              ) : (
                <>
                  {sec.items.map((item, i) => (
                    <div key={i} className="flex gap-3 bg-muted/40 rounded-xl p-3">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="font-heading font-bold text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setQuizSection(sec.id)} className="w-full mt-2 py-2.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-sm">🧠 Fazer Quiz</button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}