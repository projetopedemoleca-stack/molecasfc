import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KEY_MENSTRUAL_DIARY = 'molecas_menstrual_diary_v2';

const COMMON_SYMPTOMS = [
  { id: 'cramps', emoji: '💊', label: 'Cólicas' },
  { id: 'headache', emoji: '🤕', label: 'Dor de cabeça' },
  { id: 'tender', emoji: '😣', label: 'Seios sensíveis' },
  { id: 'bloating', emoji: '😤', label: 'Inchaço' },
  { id: 'acne', emoji: '😶', label: 'Acne' },
  { id: 'tired', emoji: '😴', label: 'Cansaço' },
  { id: 'moody', emoji: '😢', label: 'Mudanças de humor' },
  { id: 'cravings', emoji: '🍫', label: 'Vontade de doces' },
];

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Feliz' },
  { id: 'calm', emoji: '😌', label: 'Calma' },
  { id: 'tired_mood', emoji: '😴', label: 'Cansada' },
  { id: 'irritable', emoji: '😤', label: 'Irritada' },
  { id: 'sad', emoji: '😢', label: 'Triste' },
  { id: 'energetic', emoji: '⚡', label: 'Energética' },
];

const CYCLE_TIPS = [
  { phase: 'Menstruação', days: '1-5', tip: '🩸 Seus dias especiais! Beba muita água, coma algo gostoso e alongue-se se tiver cólicinhas. Está tudo bem descansar mais nestes dias!', color: 'from-red-400 to-rose-500' },
  { phase: 'Fase Folicular', days: '6-14', tip: '⚡ Semana Poderosa! Você tem MUITA energia agora! Ótimo momento para treinar forte, correr, fazer aquele treino que você adora!', color: 'from-green-400 to-emerald-500' },
  { phase: 'Ovulação', days: '14-16', tip: '🌟 Super Semana! Seu corpo está no AUGE! Você está mais forte, rápida e confiante. Aproveite para bater aquele recorde!', color: 'from-yellow-400 to-amber-500' },
  { phase: 'Fase Lútea', days: '17-28', tip: '💛 Semana de Cuidar de Si! Você pode sentir um pouco mais de cansaço e vontade de doces. Está tudo bem ir mais devagar e descansar mais!', color: 'from-orange-400 to-amber-500' },
];

export default function DiarioMenstrual() {
  const [cycles, setCycles] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY_MENSTRUAL_DIARY)) || []; } catch { return []; }
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState([]);
  const [mood, setMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState('calendar');
  const [saved, setSaved] = useState(false);

  const saveCycles = (newCycles) => {
    localStorage.setItem(KEY_MENSTRUAL_DIARY, JSON.stringify(newCycles));
    setCycles(newCycles);
  };

  const addCycle = () => {
    const existing = cycles.find(c => c.date === selectedDate);
    let newCycles;
    if (existing) {
      // Atualiza a entrada existente
      newCycles = cycles.map(c =>
        c.date === selectedDate
          ? { ...c, symptoms: symptoms.length > 0 ? symptoms : c.symptoms, mood: mood || c.mood, notes: notes || c.notes }
          : c
      );
    } else {
      newCycles = [...cycles, { date: selectedDate, symptoms, mood, notes, id: Date.now() }];
    }
    newCycles.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveCycles(newCycles);
    setSymptoms([]);
    setMood(null);
    setNotes('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const lastCycle = cycles[cycles.length - 1];
  const cycleDay = lastCycle ? Math.floor((new Date() - new Date(lastCycle.date + 'T12:00:00')) / (1000 * 60 * 60 * 24)) : null;
  const nextPeriod = lastCycle ? new Date(new Date(lastCycle.date + 'T12:00:00').getTime() + 28 * 24 * 60 * 60 * 1000) : null;
  const daysUntilNext = nextPeriod ? Math.ceil((nextPeriod - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const getCurrentPhase = () => {
    if (!cycleDay) return null;
    if (cycleDay <= 5) return CYCLE_TIPS[0];
    if (cycleDay <= 14) return CYCLE_TIPS[1];
    if (cycleDay <= 16) return CYCLE_TIPS[2];
    return CYCLE_TIPS[3];
  };

  const currentPhase = getCurrentPhase();

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <span className="text-4xl block mb-1">📅</span>
        <p className="font-heading font-bold text-xl">Meu Diário Menstrual</p>
        <p className="text-xs text-muted-foreground">Acompanhe seu ciclo e otimize seus treinos</p>
      </div>

      <div className="flex bg-muted rounded-2xl p-1">
        {[
          ['calendar', '📅 Calendário'],
          ['symptoms', '😊 Sintomas'],
          ['tips', '💡 Dicas'],
        ].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl font-heading font-bold text-xs transition-all ${tab === t ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 rounded-2xl p-5 text-white text-center">
            {lastCycle ? (
              <>
                <p className="text-sm opacity-90 mb-1">Dia do seu ciclo</p>
                <p className="font-heading font-bold text-5xl">{cycleDay || 1}</p>
                <p className="text-sm mt-2">
                  {daysUntilNext > 0 ? `Próxima menstruação em ~${daysUntilNext} dias` : daysUntilNext === 0 ? 'Menstruação prevista para hoje!' : 'Atrasada? Não se preocupe!'}
                </p>
                {currentPhase && (
                  <div className="mt-3 bg-white/20 rounded-xl p-2 text-xs backdrop-blur-sm">
                    <strong>{currentPhase.phase} (Dias {currentPhase.days}):</strong> {currentPhase.tip}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-lg mb-2">Bem-vinda ao seu diário! 🌸</p>
                <p className="text-sm opacity-90">Marque o primeiro dia da sua última menstruação para começar.</p>
              </>
            )}
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-4">
            <p className="font-bold text-sm mb-2">🩸 Marcar menstruação:</p>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-muted rounded-xl px-3 py-2 text-sm mb-3" />
            <button onClick={addCycle} className="w-full py-2 bg-rose-500 text-white rounded-xl font-bold">Salvar Data</button>
          </div>

          {cycles.length > 0 && (
            <div className="bg-card border border-border/30 rounded-2xl p-4">
              <p className="font-bold text-sm mb-2">📊 Histórico:</p>
              <div className="space-y-2">
                {[...cycles].reverse().slice(0, 5).map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between text-sm py-2 px-2 bg-muted/30 rounded-lg border-b border-border/20 last:border-0">
                    <div>
                      <span className="font-semibold">Ciclo {cycles.length - i}</span>
                      <span className="text-muted-foreground ml-2">{new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    <button onClick={() => saveCycles(cycles.filter(item => item.id !== c.id))}
                      className="px-2 py-1 text-xs bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded-lg font-bold transition-all">
                      🗑️ Deletar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'symptoms' && (
        <div className="space-y-4">
          <div className="bg-card border border-border/30 rounded-2xl p-3 flex items-center gap-3">
            <span className="text-sm font-bold">📅 Data:</span>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 bg-muted rounded-xl px-3 py-1.5 text-sm" />
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-4">
            <p className="font-bold text-sm mb-3">😊 Como você está hoje?</p>
            <div className="grid grid-cols-3 gap-2">
              {MOODS.map((m) => (
                <button key={m.id} onClick={() => setMood(m.id)} className={`p-3 rounded-xl text-center transition-all ${mood === m.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <span className="text-2xl block">{m.emoji}</span>
                  <span className="text-[10px] font-bold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-4">
            <p className="font-bold text-sm mb-3">📝 Sintomas (toque para marcar):</p>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_SYMPTOMS.map((s) => (
                <button key={s.id} onClick={() => setSymptoms(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} className={`p-3 rounded-xl text-left flex items-center gap-2 transition-all ${symptoms.includes(s.id) ? 'bg-rose-100 border-2 border-rose-400' : 'bg-muted'}`}>
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-xs font-bold">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-4">
            <p className="font-bold text-sm mb-2">📝 Anotações:</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Como foi seu treino hoje?" className="w-full bg-muted rounded-xl px-3 py-2 text-sm h-20 resize-none" />
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-sm text-rose-700 text-center">
            📅 Registrando para: <strong>{new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>
          </div>
          <button onClick={addCycle} className="w-full py-3 bg-rose-500 text-white rounded-xl font-heading font-bold">
            💾 Salvar Registro
          </button>

          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="w-full py-3 bg-green-100 border-2 border-green-400 text-green-700 rounded-xl font-bold text-center text-sm"
              >
                ✅ Registro salvo com sucesso!
              </motion.div>
            )}
          </AnimatePresence>

          {cycles.length > 0 && (
            <div className="bg-card border border-border/30 rounded-2xl p-4">
              <p className="font-bold text-sm mb-3">📊 Meus Registros Salvos</p>
              <div className="space-y-2">
                {[...cycles].reverse().slice(0, 3).map((c, i) => {
                  const moodObj = MOODS.find(m => m.id === c.mood);
                  const symsLabels = (c.symptoms || []).map(sid => COMMON_SYMPTOMS.find(s => s.id === sid)?.label).filter(Boolean);
                  return (
                    <div key={c.id || i} className="bg-muted/40 rounded-xl p-3 border border-border/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">📅 {new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        {moodObj && <span className="text-lg">{moodObj.emoji}</span>}
                      </div>
                      {symsLabels.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">{symsLabels.join(' · ')}</p>
                      )}
                      {c.notes && <p className="text-[10px] text-muted-foreground mt-1 italic">"{c.notes}"</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'tips' && (
        <div className="space-y-3">
          <p className="font-bold text-center">💡 Dicas por Fase do Ciclo</p>
          {CYCLE_TIPS.map((tip, i) => (
            <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className={`bg-gradient-to-r ${tip.color} rounded-2xl p-4 text-white`}>
              <p className="font-bold text-sm mb-1">{tip.phase} (Dias {tip.days})</p>
              <p className="text-xs">{tip.tip}</p>
            </motion.div>
          ))}
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-2">🏃‍♀️</p>
            <p className="text-sm text-rose-800 font-bold">"Muitas atletas de elite competem na menstruação. Escute seu corpo, mas não deixe que isso te pare!"</p>
          </div>
        </div>
      )}
    </div>
  );
}