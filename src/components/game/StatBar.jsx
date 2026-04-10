import React from 'react';

export default function StatBar({ label, value, color = 'bg-primary', max = 5 }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground w-20">{label}</span>
      <div className="flex-1 flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-all ${
              i < value ? color : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}