import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { bgMusic } from '@/lib/trainingMusic';

// Mini-game components
import PenaltyGame from '@/components/training/PenaltyGame';
import PassGame from '@/components/training/PassGame';
import DribbleGame from '@/components/training/DribbleGame';
import BallControlGame from '@/components/training/BallControlGame';
import PursuitGame from '@/components/training/PursuitGame';

// Larger modules (kept as lazy inline imports from the old Training file until extracted)
import EnglishGame from '@/components/training/EnglishGame';
import StoryGame from '@/components/training/StoryGame';
import FundamentosGame from '@/components/training/FundamentosGame';
import NotasGame from '@/components/training/NotasGame';
import CopaGame from '@/components/training/CopaGame';
import HistoriaFutebolGame from '@/components/training/HistoriaFutebolGame';
import AlbumView from '@/components/training/AlbumView';
import SaudeGame from '@/components/training/SaudeGame';
import DiarioMenstrual from '@/components/training/DiarioMenstrual';

const TRAINING_MODULES = [
  { id: 'penalty', label: 'Penalti', emoji: '⚽', desc: 'Chute nos 9 quadrantes - engane a goleira!', color: 'from-primary to-green-500', component: PenaltyGame },
  { id: 'pass', label: 'Passe', emoji: '🎯', desc: 'Reação e timing perfeito', color: 'from-blue-500 to-blue-600', component: PassGame },
  { id: 'dribble', label: 'Zig Zague', emoji: '⚡', desc: 'Zigue-zague pelos cones - bata a adversaria!', color: 'from-yellow-500 to-orange-500', component: DribbleGame },
  { id: 'control', label: 'Condução', emoji: '🏃‍♀️', desc: 'Desvie das defensoras e avance!', color: 'from-teal-500 to-cyan-500', component: BallControlGame },
  { id: 'pursuit', label: 'Drible c/ Marcador', emoji: '🔥', desc: 'Fuja da marcadora e chegue ao gol!', color: 'from-accent to-pink-500', component: PursuitGame },
  { id: 'english', label: 'Inglês do Futebol', emoji: '🇺🇸', desc: '10 níveis · vocabulário · 50 figurinhas', color: 'from-blue-600 to-indigo-700', component: EnglishGame },
  { id: 'story', label: 'Modo Carreira', emoji: '👑', desc: 'A jornada de uma jogadora!', color: 'from-rose-500 to-pink-600', component: StoryGame },
  { id: 'fundamentos', label: 'Fundamentos', emoji: '📚', desc: 'Regras, posições e técnicas do futsal', color: 'from-green-600 to-emerald-700', component: FundamentosGame },
  { id: 'notas', label: 'Notas Escolares', emoji: '📝', desc: 'Suas notas + melhores amigas', color: 'from-purple-500 to-violet-600', component: NotasGame },
  { id: 'copa', label: 'Copa do Mundo', emoji: '🌍', desc: 'Tabela feminino e masculino', color: 'from-yellow-500 to-amber-600', component: CopaGame },
  { id: 'futebolhistoria', label: 'História do Futebol', emoji: '🏛️', desc: 'Brasil, mundo e Futsal!', color: 'from-amber-600 to-orange-700', component: HistoriaFutebolGame },
  { id: 'album', label: 'Álbum de Figurinhas', emoji: '📒', desc: 'Cole e troque figurinhas!', color: 'from-yellow-400 to-amber-500', component: AlbumView },
  { id: 'saude', label: 'Saúde da Atleta', emoji: '💜', desc: 'Higiene, alimentação e bem-estar', color: 'from-pink-400 to-rose-500', component: SaudeGame },
  { id: 'diario', label: 'Diário Menstrual', emoji: '🌸', desc: 'Registre seu ciclo e sintomas', color: 'from-rose-400 to-pink-600', component: DiarioMenstrual },
];

export default function Training() {
  const [active, setActive] = useState(null);
  const [muted, setMuted] = useState(false);
  const mod = active ? TRAINING_MODULES.find(m => m.id === active) : null;
  const ActiveComponent = mod?.component || null;

  const handleBack = () => { bgMusic.stop(); setActive(null); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background px-4 py-6 font-body">
      <div className="flex items-center gap-3 mb-5">
        {active ? (
          <button onClick={handleBack} className="inline-flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-heading font-semibold">Treinos</span>
          </button>
        ) : (
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-heading font-semibold">Início</span>
          </Link>
        )}
        {active && mod && <span className="font-heading font-bold text-base">{mod.emoji} {mod.label}</span>}
        <button onClick={() => { const m = bgMusic.toggleMute(); setMuted(m); }} className="ml-auto text-xl" title={muted ? 'Ativar som' : 'Silenciar'}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="text-center mb-7">
              <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.5 }} className="text-5xl block mb-2">🏋️</motion.span>
              <h1 className="font-heading text-3xl font-bold">Treinos</h1>
              <p className="text-muted-foreground text-sm mt-1">5 mini-games + inglês do futebol</p>
            </div>
            <div className="max-w-sm mx-auto grid grid-cols-2 gap-3">
              {TRAINING_MODULES.map((m, i) => (
                <motion.button key={m.id}
                  initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.93 }} onClick={() => setActive(m.id)}
                  className={`rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br ${m.color} p-0.5 ${i === 0 || i === 5 ? 'col-span-2' : ''}`}>
                  <div className="bg-card rounded-[calc(1.5rem-2px)] p-4 text-left h-full">
                    <span className="text-4xl block mb-2">{m.emoji}</span>
                    <p className="font-heading font-bold text-sm">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{m.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="mt-8 max-w-sm mx-auto space-y-3">
              <div className="bg-card rounded-2xl p-4 border border-border/30 shadow">
                <p className="text-xs font-bold text-primary mb-1">💡 Dica da Professora</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No futsal, a inteligência e o trabalho em equipe valem mais do que a força sozinha. Treine cada fundamento e aprenda inglês para jogar no mundo inteiro!
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key={active} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-sm mx-auto">
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}