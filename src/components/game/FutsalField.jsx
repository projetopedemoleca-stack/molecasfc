import React from 'react';
import { motion } from 'framer-motion';

const FIELD_THEMES = {
  blue:   { bg: 'linear-gradient(180deg,#1565C0 0%,#1976D2 50%,#1565C0 100%)', lineColor: 'rgba(255,255,255,0.45)', zoneColor: 'rgba(255,255,255,0.10)', isDirt: false, border: 'white' },
  grass:  { bg: 'linear-gradient(180deg,#2E7D32 0%,#388E3C 50%,#2E7D32 100%)', lineColor: 'rgba(255,255,255,0.50)', zoneColor: 'rgba(255,255,255,0.08)', isDirt: false, border: 'white' },
  street: { bg: 'linear-gradient(180deg,#546E7A 0%,#607D8B 50%,#546E7A 100%)', lineColor: 'rgba(255,255,255,0.28)', zoneColor: 'rgba(255,255,255,0.07)', isDirt: false, border: 'white' },
  dirt:   { bg: 'linear-gradient(180deg,#8B5E3C 0%,#A0714F 40%,#7A4F2A 70%,#8B5E3C 100%)', lineColor: 'rgba(255,220,150,0.40)', zoneColor: 'rgba(255,200,100,0.14)', isDirt: true, border: '#5C3A1E' },
};

export default function FutsalField({ ballPos, goalAnimation, uniformColor, fieldType = 'blue' }) {
  const theme = FIELD_THEMES[fieldType] || FIELD_THEMES.blue;
  const ballLeftPercent = ballPos * 20 + 10;

  return (
    <div className="relative w-full my-3" style={{ height: 180 }}>
      {/* Campo principal */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden border-4 shadow-xl"
        style={{ background: theme.bg, borderColor: theme.border }}>

        {/* Textura de terra (só no campo de várzea) */}
        {theme.isDirt && (
          <>
            {/* Listras horizontais de solo */}
            {[8,20,34,48,62,76,90].map((top, i) => (
              <div key={i} className="absolute w-full" style={{ top: `${top}%`, height: 1.5, background: 'rgba(80,40,10,0.18)' }}/>
            ))}
            {/* Manchas irregulares de terra */}
            {[[12,40,28,12],[68,55,22,8],[38,72,34,10],[82,28,20,7],[55,82,26,9],[25,18,18,6]].map(([x,y,w,h], i) => (
              <div key={`s${i}`} className="absolute rounded-full"
                style={{ left: `${x}%`, top: `${y}%`, width: w, height: h, background: 'rgba(60,30,5,0.20)', transform: `rotate(${i*25}deg)` }}/>
            ))}
            {/* Pedrinhas */}
            {[[20,60],[75,35],[42,20],[88,70],[15,85]].map(([x,y], i) => (
              <div key={`p${i}`} className="absolute rounded-full"
                style={{ left: `${x}%`, top: `${y}%`, width: 4, height: 4, background: 'rgba(100,60,20,0.35)' }}/>
            ))}
          </>
        )}

        {/* Gramado listrado (só nos campos não-terra) */}
        {!theme.isDirt && [0,1,2,3,4].map(i => (
          <div key={i} className="absolute top-0 bottom-0"
            style={{ left: `${i*20}%`, width: '20%',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent' }} />
        ))}

        {/* Linhas verticais das zonas */}
        {[1,2,3,4].map(i => (
          <div key={i} className="absolute top-0 bottom-0 w-px"
            style={{ left: `${i * 20}%`, backgroundColor: theme.lineColor }} />
        ))}

        {/* Linha central (tracejada) */}
        <div className="absolute top-0 bottom-0 flex flex-col justify-between py-1"
          style={{ left: '50%', transform: 'translateX(-50%)' }}>
          {Array.from({length: 10}).map((_,i) => (
            <div key={i} className="w-0.5 h-2" style={{ background: theme.isDirt ? 'rgba(255,220,150,0.6)' : 'rgba(255,255,255,0.7)' }} />
          ))}
        </div>

        {/* Círculo central */}
        <div className="absolute rounded-full border-2"
          style={{ width: 56, height: 56, top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', borderColor: theme.isDirt ? 'rgba(255,220,150,0.5)' : 'rgba(255,255,255,0.5)' }} />

        {/* Área do gol esquerdo */}
        <div className="absolute border-2 rounded-r-lg"
          style={{ left: 0, top: '25%', width: '12%', height: '50%', borderColor: theme.isDirt ? 'rgba(255,220,150,0.55)' : 'rgba(255,255,255,0.6)' }} />

        {/* Área do gol direito */}
        <div className="absolute border-2 rounded-l-lg"
          style={{ right: 0, top: '25%', width: '12%', height: '50%', borderColor: theme.isDirt ? 'rgba(255,220,150,0.55)' : 'rgba(255,255,255,0.6)' }} />

        {/* GOL esquerdo (trave) */}
        <div className="absolute flex flex-col justify-between"
          style={{ left: -4, top: '30%', height: '40%' }}>
          <div className="w-4 h-1.5 rounded-r shadow" style={{ background: theme.isDirt ? '#c8a060' : 'white' }} />
          <div className="rounded"
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: theme.isDirt ? 'rgba(200,160,96,0.85)' : 'rgba(255,255,255,0.85)' }} />
          <div className="w-4 h-1.5 rounded-r shadow" style={{ background: theme.isDirt ? '#c8a060' : 'white' }} />
        </div>

        {/* GOL direito (trave) */}
        <div className="absolute flex flex-col justify-between"
          style={{ right: -4, top: '30%', height: '40%' }}>
          <div className="w-4 h-1.5 rounded-l shadow" style={{ background: theme.isDirt ? '#c8a060' : 'white' }} />
          <div className="rounded"
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, background: theme.isDirt ? 'rgba(200,160,96,0.85)' : 'rgba(255,255,255,0.85)' }} />
          <div className="w-4 h-1.5 rounded-l shadow" style={{ background: theme.isDirt ? '#c8a060' : 'white' }} />
        </div>

        {/* Labels das zonas */}
        <div className="absolute top-1.5 left-0 right-0 flex">
          {['DEF','','MEIO','','ATK'].map((label, i) => (
            <div key={i} className="flex-1 text-center">
              {label && <span className="text-[9px] font-bold tracking-widest" style={{ color: theme.isDirt ? 'rgba(255,220,150,0.8)' : 'rgba(255,255,255,0.7)' }}>{label}</span>}
            </div>
          ))}
        </div>

        {/* Zona destacada */}
        <motion.div
          animate={{ left: `${ballPos * 20}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="absolute top-0 bottom-0 border-x"
          style={{ width: '20%', background: theme.zoneColor, borderColor: theme.lineColor }}
        />

        {/* Bola */}
        <motion.div
          animate={{ left: `${ballLeftPercent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="absolute top-1/2 z-10 text-xl"
          style={{ translateX: '-50%', translateY: '-50%', marginTop: -14 }}
        >
          ⚽
        </motion.div>

        {/* Animação de gol */}
        {goalAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <span className="text-4xl font-bold text-white drop-shadow-lg">
              {goalAnimation === 'player' ? '⚽ GOL!' : '😬 Gol delas'}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}