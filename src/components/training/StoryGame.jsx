import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { loadProfile } from '@/lib/playerProfile';

const STORY_SCENES = [
  { id: 1, title: 'O Começo no Campo de Terra', emoji: '🌱', desc: 'Você começa jogando descalça no campo de terra do bairro.', opponent: 'turminha_fc', difficulty: 'easy', story: [{ icon: '⚽', text: 'Você descobre o futebol brincando com os meninos do bairro.' }, { icon: '🏃‍♀️', text: 'Mesmo sem chuteira, você mostra talento e velocidade!' }, { icon: '👀', text: 'A professora de educação física observa você jogando...' }] },
  { id: 2, title: 'Primeira Chuteira', emoji: '👟', desc: 'Sua mãe economiza para comprar sua primeira chuteira.', opponent: 'graja_fc', difficulty: 'easy', story: [{ icon: '🎁', text: 'Um dia especial: sua primeira chuteira de verdade!' }, { icon: '💪', text: 'Agora você pode treinar melhor e chutar mais forte.' }, { icon: '🎯', text: 'Você marca seu primeiro gol em um campeonato oficial.' }] },
  { id: 3, title: 'Convocação para a Escola', emoji: '🎒', desc: 'Você é selecionada para o time da escola.', opponent: 'estrelas_clube', difficulty: 'medium', story: [{ icon: '📝', text: 'A professora te convida para fazer um teste no time escolar.' }, { icon: '🏆', text: 'Você passa! Agora é uma jogadora oficial da escola.' }, { icon: '⚡', text: 'Seu primeiro jogo: nervosismo e emoção!' }] },
  { id: 4, title: 'Contra o Preconceito', emoji: '💪', desc: 'Alguns dizem que "futebol não é para meninas". Prove o contrário!', opponent: 'azul_fc', difficulty: 'medium', story: [{ icon: '😤', text: 'Ouvir que "menina não joga futebol" te machuca.' }, { icon: '🌟', text: 'Mas você decide mostrar seu talento em campo!' }, { icon: '🔥', text: 'Um gol espetacular cala todos os preconceituosos.' }] },
  { id: 5, title: 'Capitã do Time', emoji: '©️', desc: 'Seu time te elege como capitã pela liderança.', opponent: 'soccergirls_fc', difficulty: 'medium', story: [{ icon: '🗣️', text: 'Suas companheiras confiam em você para liderar.' }, { icon: '🤝', text: 'Você aprende a motivar o time nas horas difíceis.' }, { icon: '🏅', text: 'Liderança não é só falar, é dar exemplo em campo!' }] },
  { id: 6, title: 'Final do Intercolegial', emoji: '🏆', desc: 'A grande final contra a melhor escola da região.', opponent: 'chute_forte', difficulty: 'hard', story: [{ icon: '🏟️', text: 'O ginásio lotado para ver a final do campeonato.' }, { icon: '⏰', text: 'O jogo está empatado nos minutos finais...' }, { icon: '⚽', text: 'Você faz o gol do título no último lance!' }] },
  { id: 7, title: 'Observada por um Clube', emoji: '👁️', desc: 'Uma olheira de clube profissional te observa jogar.', opponent: 'pe_de_moleca', difficulty: 'hard', story: [{ icon: '👤', text: 'Alguém estranho está te observando na arquibancada...' }, { icon: '📋', text: 'É uma olheira do time profissional feminino!' }, { icon: '✍️', text: 'Você recebe um convite para fazer um teste no clube.' }] },
  { id: 8, title: 'Estreia Profissional', emoji: '🌟', desc: 'Seu primeiro jogo como jogadora profissional.', opponent: 'turminha_fc', difficulty: 'hard', story: [{ icon: '📺', text: 'O jogo vai passar na televisão! Milhões assistindo.' }, { icon: '😰', text: 'Nervosismo bate, mas você respira fundo.' }, { icon: '🎉', text: 'Uma assistência incrível na estreia!' }] },
  { id: 9, title: 'Convocação para a Seleção', emoji: '🇧🇷', desc: 'Você é chamada para defender a Seleção Brasileira!', opponent: 'graja_fc', difficulty: 'hard', story: [{ icon: '📞', text: 'Uma ligação que muda sua vida: a convocatória!' }, { icon: '😭', text: 'Lágrimas de alegria ao vestir a amarelinha.' }, { icon: '🌎', text: 'Representar o Brasil é um sonho realizado.' }] },
  { id: 10, title: 'Final da Copa do Mundo', emoji: '🥇', desc: 'A decisão pelo título mundial contra as melhores do planeta.', opponent: 'estrelas_clube', difficulty: 'hard', story: [{ icon: '🏟️', text: 'Estádio lotado em uma final histórica.' }, { icon: '⏱️', text: 'Prorrogação. Tudo decidido nos pênaltis...' }, { icon: '🏆', text: 'Você cobra o pênalti do título mundial!' }] },
];

export default function StoryGame() {
  const navigate = useNavigate();
  const [activeScene, setActiveScene] = useState(null);
  const [storyStep, setStoryStep] = useState(0);
  const [unlocked, setUnlocked] = useState([]);
  const [completed, setCompleted] = useState([]);

  const refresh = () => {
    try {
      const STORY_KEY = 'molecas_story';
      const storyProgress = JSON.parse(localStorage.getItem(STORY_KEY) || '{}');
      const unlockedIds = [1];
      const completedIds = [];
      Object.entries(storyProgress).forEach(([id, data]) => {
        const numId = parseInt(id, 10);
        if (data.unlocked && !unlockedIds.includes(numId)) unlockedIds.push(numId);
        if (data.completed) completedIds.push(numId);
      });
      setUnlocked(unlockedIds);
      setCompleted(completedIds);
    } catch {
      setUnlocked([1]); setCompleted([]);
    }
  };

  useEffect(() => {
    refresh();
    const handleFocus = () => refresh();
    const handleStorage = (e) => { if (e.key === 'molecas_story') refresh(); };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => { if (!activeScene) refresh(); }, 1000);
    return () => { window.removeEventListener('focus', handleFocus); window.removeEventListener('storage', handleStorage); clearInterval(interval); };
  }, [activeScene]);

  const isUnlocked = (id) => id === 1 || unlocked.includes(id);
  const isDone = (id) => completed.includes(id);

  const startScene = (scene) => {
    if (!isUnlocked(scene.id)) return;
    setActiveScene(scene); setStoryStep(0);
  };

  const nextStep = () => {
    if (!activeScene) return;
    if (storyStep < activeScene.story.length - 1) { setStoryStep(s => s + 1); }
    else { navigate(`/match?team=pe_de_moleca&opponent=${activeScene.opponent}&difficulty=${activeScene.difficulty}&story=${activeScene.id}`); }
  };

  if (activeScene) {
    const step = activeScene.story[storyStep];
    const isLastStep = storyStep === activeScene.story.length - 1;
    return (
      <div className="space-y-4 pb-4">
        <button onClick={() => { setActiveScene(null); refresh(); }} className="flex items-center gap-2 text-muted-foreground text-sm"><ArrowLeft className="w-4 h-4" /> Voltar</button>
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl p-5 text-white text-center">
          <span className="text-5xl block mb-2">{activeScene.emoji}</span>
          <p className="font-heading font-bold text-lg">{activeScene.title}</p>
          <p className="text-xs opacity-90 mt-1">{activeScene.desc}</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/30 rounded-2xl p-6 text-center space-y-4">
          <div className="text-6xl">{step.icon}</div>
          <p className="font-heading font-bold">{step.text}</p>
          <div className="flex justify-center gap-1">
            {activeScene.story.map((_, i) => <span key={i} className={`w-2 h-2 rounded-full ${i === storyStep ? 'bg-primary' : 'bg-muted'}`} />)}
          </div>
          <button onClick={nextStep} className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold">
            {isLastStep ? '⚽ Jogar Partida!' : 'Continuar ➡️'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <span className="text-5xl block mb-2">👑</span>
        <p className="font-heading font-bold text-xl">Modo Carreira</p>
        <p className="text-xs text-muted-foreground">A jornada de uma jogadora</p>
        <button onClick={refresh} className="mt-2 text-xs text-primary underline">🔄 Atualizar</button>
      </div>
      <div className="grid gap-3">
        {STORY_SCENES.map((scene) => {
          const locked = !isUnlocked(scene.id);
          const done = isDone(scene.id);
          return (
            <motion.button key={scene.id} whileTap={!locked ? { scale: 0.98 } : undefined} onClick={() => startScene(scene)}
              className={`text-left rounded-2xl p-4 border-2 transition-all ${done ? 'bg-green-500/10 border-green-500/40' : !locked ? 'bg-card border-border/30 hover:border-rose-400' : 'bg-muted/30 border-border/10 opacity-50'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{done ? '✅' : !locked ? '▶️' : '🔒'}</span>
                <div className="flex-1">
                  <p className="font-heading font-bold text-sm">{scene.id}. {scene.title}</p>
                  <p className="text-xs text-muted-foreground">{scene.desc}</p>
                  {done && <span className="text-[10px] text-green-600 font-bold">Completada!</span>}
                  {!locked && !done && <span className="text-[10px] text-rose-500 font-bold">Disponível</span>}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="bg-card border border-border/30 rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">Progresso: <span className="font-bold text-foreground">{completed.length}</span> / {STORY_SCENES.length} completadas</p>
        <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all" style={{ width: `${(completed.length / STORY_SCENES.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}