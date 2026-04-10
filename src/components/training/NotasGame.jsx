import React, { useState } from 'react';
import { motion } from 'framer-motion';

const KEY_NOTES = 'molecas_school_notes';
const KEY_FRIENDS = 'molecas_friends';
const FUNNY_TITLES_LIST = [
  'Campeã das Embaixadinhas', 'Melhor do Interclasse', 'A Atleta Fominha',
  'A que sempre chega atrasada no treino', 'A que só aparece no campeonato',
  'A goleira que não defende nada', 'A rainha do drama', 'MVP da Fila do Lanche',
  'Especialista em Cartão Amarelo', 'A que inventa lesão na hora de correr',
  'Capitã dos Alongamentos', 'A que faz gol contra',
];

function gradeTitle(avg) {
  if (avg >= 9) return { title: '🏆 Craque da Sala!', color: 'text-green-500', stars: 5 };
  if (avg >= 7) return { title: '📚 Meio-campo Inteligente', color: 'text-blue-500', stars: 4 };
  if (avg >= 5) return { title: '⚽ Na Faixa!', color: 'text-yellow-500', stars: 3 };
  return { title: '😅 Pediu Pênalti...', color: 'text-red-500', stars: 1 };
}

export default function NotasGame() {
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY_NOTES)) || []; } catch { return []; } });
  const [friends, setFriends] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY_FRIENDS)) || []; } catch { return []; } });
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [showAnim, setShowAnim] = useState(false);
  const [tab, setTab] = useState('notes');
  const [friendName, setFriendName] = useState('');
  const [friendTitle, setFriendTitle] = useState(FUNNY_TITLES_LIST[0]);

  const avg = notes.length ? notes.reduce((a, n) => a + n.grade, 0) / notes.length : null;
  const titleInfo = avg !== null ? gradeTitle(avg) : null;

  const addNote = () => {
    const g = parseFloat(grade.replace(',', '.'));
    if (!subject.trim() || isNaN(g) || g < 0 || g > 10) return;
    const newNotes = [...notes, { id: Date.now(), subject: subject.trim(), grade: g }];
    setNotes(newNotes); localStorage.setItem(KEY_NOTES, JSON.stringify(newNotes));
    setSubject(''); setGrade(''); setShowAnim(true); setTimeout(() => setShowAnim(false), 1800);
  };
  const removeNote = (id) => { const n = notes.filter(x => x.id !== id); setNotes(n); localStorage.setItem(KEY_NOTES, JSON.stringify(n)); };
  const addFriend = () => {
    if (!friendName.trim()) return;
    const f = [...friends, { id: Date.now(), name: friendName.trim(), title: friendTitle }];
    setFriends(f); localStorage.setItem(KEY_FRIENDS, JSON.stringify(f)); setFriendName('');
  };
  const removeFriend = (id) => { const f = friends.filter(x => x.id !== id); setFriends(f); localStorage.setItem(KEY_FRIENDS, JSON.stringify(f)); };

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <span className="text-4xl block mb-1">📚</span>
        <p className="font-heading font-bold text-xl">Notas Escolares</p>
        <p className="text-xs text-muted-foreground">Registre suas notas e celebre com suas amigas!</p>
      </div>
      <div className="flex bg-muted rounded-2xl p-1">
        {[['notes','📝 Notas'],['friends','👯 Amigas']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl font-heading font-bold text-sm transition-all ${tab === t ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>{l}</button>
        ))}
      </div>
      {tab === 'notes' && (
        <div className="space-y-4">
          {titleInfo && (
            <div className="bg-card border border-border/30 rounded-3xl p-5 text-center shadow-md relative overflow-hidden">
              {showAnim && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {Array.from({length:8}).map((_,i) => (
                    <motion.span key={i} className="absolute text-yellow-400 text-xl" initial={{ y: 0, opacity: 1 }} animate={{ y: -(40+i*10), x: (i%2===0?1:-1)*20*i, opacity: 0 }} transition={{ duration: 1.2, delay: i*0.08 }}>⭐</motion.span>
                  ))}
                </div>
              )}
              <p className="font-heading font-bold text-5xl">{avg.toFixed(1)}</p>
              <p className="text-muted-foreground text-xs mb-1">média geral</p>
              <p className={`font-heading font-bold text-xl ${titleInfo.color}`}>{titleInfo.title}</p>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({length:5},(_,i) => <span key={i} className={`text-xl ${i < titleInfo.stars ? 'text-yellow-400' : 'text-muted-foreground'}`}>★</span>)}
              </div>
            </div>
          )}
          <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
            <p className="font-heading font-bold text-sm mb-3">➕ Adicionar nota</p>
            <div className="flex gap-2 mb-2">
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Matéria (ex: Matemática)" className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm outline-none" />
              <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="Nota" type="text" inputMode="decimal" className="w-20 bg-muted rounded-xl px-3 py-2 text-sm text-center outline-none" />
            </div>
            <button onClick={addNote} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-sm">Salvar ✓</button>
          </div>
          {notes.length > 0 && (
            <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm space-y-2">
              {notes.map(n => (
                <div key={n.id} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                  <span className="text-sm font-medium">{n.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-heading font-bold text-base ${n.grade >= 7 ? 'text-green-500' : n.grade >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>{n.grade.toFixed(1)}</span>
                    <button onClick={() => removeNote(n.id)} className="text-muted-foreground"><span className="text-xs">✕</span></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {notes.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">Nenhuma nota ainda. Adicione a primeira! 📝</p>}
        </div>
      )}
      {tab === 'friends' && (
        <div className="space-y-4">
          <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
            <p className="font-heading font-bold text-sm mb-3">👯 Adicionar amiga</p>
            <input value={friendName} onChange={e => setFriendName(e.target.value)} placeholder="Nome da amiga" className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none mb-2" />
            <p className="text-xs text-muted-foreground mb-1.5">Título engraçado:</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {FUNNY_TITLES_LIST.map(t => (
                <button key={t} onClick={() => setFriendTitle(t)} className={`text-[10px] px-2 py-1 rounded-full border transition-all ${friendTitle === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border/30 text-muted-foreground'}`}>{t}</button>
              ))}
            </div>
            <button onClick={addFriend} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold text-sm">Adicionar ✓</button>
          </div>
          {friends.map((f, i) => (
            <motion.div key={f.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
              <div>
                <p className="font-heading font-bold text-base">{f.name}</p>
                <p className="text-xs text-primary font-medium">{f.title}</p>
              </div>
              <button onClick={() => removeFriend(f.id)} className="text-muted-foreground text-xs">✕</button>
            </motion.div>
          ))}
          {friends.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">Adicione suas melhores amigas! 👯‍♀️</p>}
        </div>
      )}
    </div>
  );
}