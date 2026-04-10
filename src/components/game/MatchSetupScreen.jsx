import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FIELDS = [
  {
    id: 'blue',
    label: 'Quadra Azul',
    emoji: '🏟️',
    desc: 'Futsal profissional',
    colors: { field: ['#1565C0', '#1976D2', '#1565C0'], lines: 'rgba(255,255,255,0.5)', zone: 'rgba(255,255,255,0.1)' },
  },
  {
    id: 'grass',
    label: 'Campo de Futebol',
    emoji: '⚽',
    desc: 'Gramado verde',
    colors: { field: ['#2E7D32', '#388E3C', '#2E7D32'], lines: 'rgba(255,255,255,0.55)', zone: 'rgba(255,255,255,0.08)' },
  },
  {
    id: 'street',
    label: 'Quadra de Rua',
    emoji: '🏙️',
    desc: 'Cimento cinza',
    colors: { field: ['#546E7A', '#607D8B', '#546E7A'], lines: 'rgba(255,255,255,0.35)', zone: 'rgba(255,255,255,0.07)' },
  },
  {
    id: 'dirt',
    label: 'Várzea de Terra',
    emoji: '🌱',
    desc: 'Campo batido de terra',
    colors: { field: ['#8B5E3C', '#A0714F', '#7A4F2A'], lines: 'rgba(255,255,255,0.3)', zone: 'rgba(255,200,100,0.12)' },
  },
];

const DURATIONS = [
  { id: 'bo3', label: 'Melhor de 3', emoji: '🏆', desc: '3 gols para vencer' },
  { id: '2min', label: '2 Minutos', emoji: '⏱️', desc: 'Quem fizer mais gols no tempo' },
  { id: '2goals', label: '2 Gols', emoji: '⚽', desc: 'Primeiro a marcar 2 gols' },
];

export default function MatchSetupScreen({ onConfirm, onBack }) {
  const [field, setField] = useState('blue');
  const [duration, setDuration] = useState('bo3');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col p-5 pb-10"
    >
      <div className="text-center mb-6 mt-2">
        <span className="text-4xl block mb-1">⚙️</span>
        <h2 className="font-heading font-bold text-2xl">Configurar Partida</h2>
        <p className="text-sm text-muted-foreground">Escolha o campo e o tipo de jogo</p>
      </div>

      {/* Campo */}
      <p className="font-heading font-bold text-sm mb-3 text-muted-foreground uppercase tracking-widest">🏟️ Campo</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {FIELDS.map(f => (
          <motion.button
            key={f.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => setField(f.id)}
            className={`rounded-2xl border-2 overflow-hidden transition-all ${
              field === f.id ? 'border-primary shadow-lg scale-105' : 'border-border/30'
            }`}
          >
            {/* Mini field preview */}
            <div
              className="h-14 w-full flex items-center justify-center"
              style={{ background: `linear-gradient(180deg, ${f.colors.field[0]}, ${f.colors.field[1]}, ${f.colors.field[2]})` }}
            >
              <span className="text-2xl">{f.emoji}</span>
            </div>
            <div className="bg-card px-1 py-1.5 text-center">
              <p className="font-heading font-bold text-[10px] leading-tight">{f.label}</p>
              <p className="text-[8px] text-muted-foreground">{f.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Duração */}
      <p className="font-heading font-bold text-sm mb-3 text-muted-foreground uppercase tracking-widest">⏱️ Duração</p>
      <div className="space-y-3 mb-8">
        {DURATIONS.map(d => (
          <motion.button
            key={d.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDuration(d.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all text-left ${
              duration === d.id ? 'border-primary bg-primary/10 shadow' : 'border-border/30 bg-card'
            }`}
          >
            <span className="text-3xl">{d.emoji}</span>
            <div>
              <p className="font-heading font-bold text-sm">{d.label}</p>
              <p className="text-xs text-muted-foreground">{d.desc}</p>
            </div>
            {duration === d.id && <span className="ml-auto text-primary font-bold">✓</span>}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3 mt-auto">
        <button onClick={onBack} className="flex-1 py-3 rounded-2xl font-heading font-bold text-sm bg-muted text-muted-foreground">
          ← Voltar
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onConfirm({ field, duration })}
          className="flex-2 flex-[2] py-3 rounded-2xl font-heading font-bold text-sm bg-primary text-primary-foreground shadow-lg"
        >
          Jogar! ▶
        </motion.button>
      </div>
    </motion.div>
  );
}

export { FIELDS };