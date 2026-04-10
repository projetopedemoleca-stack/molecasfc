import React from 'react';
import { Check } from 'lucide-react';

export default function TeamCard({ team, selected, onSelect }) {

  // 🛡️ PROTEÇÃO TOTAL CONTRA UNDEFINED
  const stats = team?.stats || {};

  const tecnica = stats.tecnica ?? 1;
  const velocidade = stats.velocidade ?? 1;
  const criatividade = stats.criatividade ?? 1;
  const coletivo = stats.coletivo ?? 1;
  const confianca = stats.confianca ?? 1;

  const media = Math.round(
    (tecnica + velocidade + criatividade + coletivo + confianca) / 5
  );

  return (
    <button
      onClick={onSelect}
      className={`relative w-full p-4 rounded-2xl border-2 transition-all text-left active:scale-95 ${
        selected
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border/50 bg-card shadow-sm'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      <span className="text-3xl block mb-1">
        {team?.emoji ?? '⚽'}
      </span>

      <p className="font-heading font-bold text-sm leading-tight">
        {team?.name ?? 'Time'}
      </p>

      <div className="flex gap-0.5 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < media ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </button>
  );
}