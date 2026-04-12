import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const VERSION = '1.0.0';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col px-4 pt-6 pb-10 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-xl bg-muted active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-heading font-bold text-2xl">Sobre Nós</h1>
          <p className="text-xs text-muted-foreground">Molecas Futebol Clube</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {/* App info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 rounded-3xl p-5 text-center">
          <span className="text-5xl block mb-2">⚽</span>
          <h2 className="font-heading font-bold text-2xl text-foreground">Molecas FC</h2>
          <p className="text-xs text-muted-foreground mt-1">Inclusão · Diversão · Saúde · Educação</p>
          <div className="mt-3 inline-block bg-primary/15 text-primary text-xs font-bold px-3 py-1 rounded-full">
            Versão {VERSION}
          </div>
        </motion.div>

        {/* Missão */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border/30 rounded-2xl p-4">
          <p className="font-heading font-bold text-sm mb-1 text-primary">🌟 Missão</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Usar o futebol como ferramenta de educação, saúde e inclusão para meninas e jovens de todas as origens — dentro e fora do campo. ✊
          </p>
        </motion.div>

        {/* Autora */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card border border-border/30 rounded-2xl p-4">
          <p className="font-heading font-bold text-sm mb-3 text-primary">✍️ Autora</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center shadow overflow-hidden">
              <svg viewBox="0 0 48 48" width="44" height="44">
                {/* cabelo cacheado tipo 🧑‍🦱 - cachos volumosos */}
                <ellipse cx="24" cy="18" rx="14" ry="12" fill="#3d1c02"/>
                {/* cachos individuais bem definidos */}
                <circle cx="12" cy="16" r="6.5" fill="#3d1c02"/>
                <circle cx="36" cy="16" r="6.5" fill="#3d1c02"/>
                <circle cx="18" cy="10" r="6" fill="#3d1c02"/>
                <circle cx="30" cy="10" r="6" fill="#3d1c02"/>
                <circle cx="24" cy="8" r="6" fill="#3d1c02"/>
                <circle cx="11" cy="22" r="5" fill="#3d1c02"/>
                <circle cx="37" cy="22" r="5" fill="#3d1c02"/>
                {/* pele morena clara */}
                <ellipse cx="24" cy="27" rx="11" ry="13" fill="#DBA878"/>
                {/* olhos */}
                <ellipse cx="20" cy="25" rx="1.5" ry="1.8" fill="#3d1c02"/>
                <ellipse cx="28" cy="25" rx="1.5" ry="1.8" fill="#3d1c02"/>
                {/* sorriso */}
                <path d="M20,31 Q24,35 28,31" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-heading font-bold text-base">Leidi Souza</p>
              <p className="text-xs text-muted-foreground">Profissional de Educação Física</p>
              <p className="text-xs text-muted-foreground">CREF 168334-G/SP</p>
            </div>
          </div>
        </motion.div>

        {/* Colaboração */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border/30 rounded-2xl p-4">
          <p className="font-heading font-bold text-sm mb-3 text-primary">🤝 Colaboração</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-pink-400 flex items-center justify-center text-2xl shadow">
              👩🏾‍🦱
            </div>
            <div>
              <p className="font-heading font-bold text-base">Elânia Francisca</p>
              <p className="text-xs text-muted-foreground">Psicóloga CRP 06/114296</p>
            </div>
          </div>
        </motion.div>

        {/* Valores */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border/30 rounded-2xl p-4">
          <p className="font-heading font-bold text-sm mb-3 text-primary">💜 Nossos Valores</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🤝', label: 'Inclusão' },
              { icon: '💪', label: 'Cooperação' },
              { icon: '🌈', label: 'Diversidade' },
              { icon: '💜', label: 'Saúde' },
              { icon: '📚', label: 'Educação' },
              { icon: '🌟', label: 'Diversão' },
            ].map(v => (
              <div key={v.label} className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
                <span className="text-lg">{v.icon}</span>
                <span className="text-xs font-semibold">{v.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Rodapé */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="mt-8 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-sm font-heading font-bold text-muted-foreground">
          <span>👟 Pé de Moleca</span>
          <span className="text-border">·</span>
          <span>🌸 Espaço Puberê</span>
        </div>
        <p className="text-[10px] text-muted-foreground/50">
          Futebol como ferramenta de educação e saúde · v{VERSION}
        </p>
      </motion.div>
    </div>
  );
}