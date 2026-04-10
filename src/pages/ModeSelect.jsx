import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, BookOpen, Wifi } from 'lucide-react';

const modes = [
  {
    path: '/team-select',
    icon: '⚡',
    label: 'Jogo Rápido',
    desc: 'Partida rápida contra o Bot. Escolha seu time e vamos jogar!',
    color: 'from-primary to-green-400',
    available: true,
  },
  {
    path: '/story',
    icon: '📖',
    label: 'Modo História',
    desc: 'Viva a aventura da escolinha de futebol capítulo por capítulo.',
    color: 'from-accent to-pink-400',
    available: true,
  },
  {
    path: '#',
    icon: '🌐',
    label: 'Multiplayer Online',
    desc: 'Desafie amigas online em tempo real. (Em breve!)',
    color: 'from-blue-400 to-cyan-400',
    available: false,
  },
];

export default function ModeSelect() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background px-4 py-6 font-body">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-heading font-semibold">Voltar</span>
      </Link>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="font-heading text-3xl font-bold">Escolha o Modo</h1>
        <p className="text-muted-foreground text-sm mt-1">Como você quer jogar hoje?</p>
      </motion.div>

      <div className="max-w-sm mx-auto space-y-4">
        {modes.map((mode, i) => (
          <motion.div
            key={mode.label}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.15 }}
          >
            <Link to={mode.available ? mode.path : '#'}>
              <div className={`rounded-3xl overflow-hidden shadow-lg border border-border/30 ${!mode.available ? 'opacity-60' : 'active:scale-95 transition-transform'}`}>
                <div className={`bg-gradient-to-r ${mode.color} p-5 flex items-center gap-4`}>
                  <span className="text-5xl">{mode.icon}</span>
                  <div>
                    <p className="font-heading font-bold text-white text-xl">{mode.label}</p>
                    {!mode.available && (
                      <span className="text-xs bg-white/30 text-white px-2 py-0.5 rounded-full font-semibold">Em breve</span>
                    )}
                  </div>
                </div>
                <div className="bg-card px-5 py-3">
                  <p className="text-sm text-muted-foreground">{mode.desc}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}