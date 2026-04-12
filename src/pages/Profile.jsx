import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Pencil, Trophy, Lock,
  ChevronRight, Check, Heart, User, Shirt,
  Zap, Award
} from 'lucide-react';
import { loadProfile, saveProfile } from '@/lib/playerProfile';
import { audio } from '@/lib/audioEngine';

// ═══════════════════════════════════════════════════
// DADOS DE CUSTOMIZAÇÃO
// ═══════════════════════════════════════════════════

const SKIN_TONES = [
  { id: 's1', color: '#FDDBB4', label: 'Clara' },
  { id: 's2', color: '#F0C27F', label: 'Média Clara' },
  { id: 's3', color: '#D4915A', label: 'Média' },
  { id: 's4', color: '#A0522D', label: 'Média Escura' },
  { id: 's5', color: '#5C3317', label: 'Escura' },
  { id: 's6', color: '#3B1F0A', label: 'Bem Escura' },
];

const HAIR_COLORS = [
  { id: 'h1', color: '#1A1A1A', label: 'Preto' },
  { id: 'h2', color: '#4A3728', label: 'Castanho Escuro' },
  { id: 'h3', color: '#8B5E3C', label: 'Castanho' },
  { id: 'h4', color: '#D4A017', label: 'Loiro' },
  { id: 'h5', color: '#E8C45A', label: 'Loiro Claro' },
  { id: 'h6', color: '#C0392B', label: 'Ruivo' },
  { id: 'h7', color: '#9B59B6', label: 'Roxo' },
  { id: 'h8', color: '#2980B9', label: 'Azul' },
];

const HAIR_STYLES = [
  { id: 'hs1', label: 'Curto liso',   emoji: '👧' },
  { id: 'hs2', label: 'Médio liso',   emoji: '👱‍♀️' },
  { id: 'hs3', label: 'Longo liso',   emoji: '👩' },
  { id: 'hs4', label: 'Cacheado',     emoji: '🧑‍🦱' },
  { id: 'hs5', label: 'Rabo ponei',   emoji: '🎀' },
  { id: 'hs6', label: 'Tranças',      emoji: '🧑‍🦲' },
  { id: 'hs7', label: 'Afro',         emoji: '👸🏾' },
  { id: 'hs8', label: 'Joãozinho',    emoji: '✂️' },
];

const UNIFORM_COLORS = [
  '#E91E63', '#9C27B0', '#3F51B5', '#2196F3',
  '#00BCD4', '#4CAF50', '#FF9800', '#F44336',
  '#FFFFFF', '#212121', '#FFD600', '#795548',
];

const SHORTS_COLORS = [
  '#212121', '#FFFFFF', '#1A237E', '#B71C1C',
  '#1B5E20', '#4A148C', '#E65100', '#880E4F',
  '#37474F', '#006064', '#33691E', '#BF360C',
];

const BOOT_COLORS = [
  '#FFD600', '#FFFFFF', '#212121', '#F44336',
  '#2196F3', '#4CAF50', '#FF9800', '#9C27B0',
  '#FF69B4', '#00CED1', '#FF4500', '#32CD32',
];

const JERSEY_NUMBERS = Array.from({ length: 23 }, (_, i) => i + 1);

const XP_PER_LEVEL = 100;

const MEDALS = [
  { id: 'first_win',  name: 'Primeira Vitória', emoji: '🥇', desc: 'Vença sua primeira partida',  condition: (s) => (s?.wins   || 0) >= 1  },
  { id: '3_goals',   name: 'Artilheira',        emoji: '⚽', desc: 'Marque 3 gols em partidas',   condition: (s) => (s?.goals  || 0) >= 3  },
  { id: 'streak_3',  name: 'Em Chamas',         emoji: '🔥', desc: 'Vença 3 partidas seguidas',   condition: (s) => (s?.bestStreak || 0) >= 3 },
  { id: '10_matches', name: 'Veterana',         emoji: '🏆', desc: 'Jogue 10 partidas',           condition: (s) => (s?.matches || 0) >= 10 },
  { id: '5_wins',    name: 'Campeã',            emoji: '👑', desc: 'Vença 5 partidas',            condition: (s) => (s?.wins   || 0) >= 5  },
];

// ═══════════════════════════════════════════════════
// AVATAR SVG — moderno, divertido, animado
// ═══════════════════════════════════════════════════
function CustomAvatar({ skin, hairColor, hairStyle, uniformColor, shortsColor, bootsColor, number, size = 120 }) {
  const sColor  = skin?.color        || '#F0C27F';
  const hColor  = hairColor?.color   || '#1A1A1A';
  const uColor  = uniformColor       || '#E91E63';
  const srtColor = shortsColor       || '#212121';
  const bColor  = bootsColor         || '#FFD600';

  // Caminhos de cabelo por estilo
  const hairTop = {
    hs1: <rect x="38" y="14" width="44" height="14" rx="7" fill={hColor} />,
    hs2: <><rect x="34" y="12" width="52" height="18" rx="9" fill={hColor} /><rect x="34" y="26" width="8" height="16" rx="4" fill={hColor} /><rect x="78" y="26" width="8" height="16" rx="4" fill={hColor} /></>,
    hs3: <><rect x="33" y="12" width="54" height="18" rx="9" fill={hColor} /><rect x="33" y="26" width="8" height="28" rx="4" fill={hColor} /><rect x="79" y="26" width="8" height="28" rx="4" fill={hColor} /></>,
    hs4: <><ellipse cx="60" cy="20" rx="28" ry="13" fill={hColor} /><circle cx="38" cy="30" r="7" fill={hColor} /><circle cx="82" cy="30" r="7" fill={hColor} /><circle cx="45" cy="38" r="5" fill={hColor} /><circle cx="75" cy="38" r="5" fill={hColor} /></>,
    hs5: <><rect x="36" y="13" width="48" height="14" rx="7" fill={hColor} /><rect x="55" y="24" width="10" height="24" rx="5" fill={hColor} /></>,
    hs6: <><rect x="35" y="13" width="50" height="14" rx="7" fill={hColor} /><rect x="35" y="24" width="7" height="24" rx="3.5" fill={hColor} /><rect x="78" y="24" width="7" height="24" rx="3.5" fill={hColor} /></>,
    hs7: <ellipse cx="60" cy="18" rx="28" ry="17" fill={hColor} />,
    hs8: <rect x="38" y="14" width="44" height="8" rx="4" fill={hColor} />,
  };

  return (
    <motion.svg
      width={size} height={size * 1.4}
      viewBox="0 0 120 168"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Sombra */}
      <ellipse cx="60" cy="164" rx="24" ry="4" fill="rgba(0,0,0,0.12)" />

      {/* Chuteiras */}
      <rect x="36" y="147" width="20" height="13" rx="4" fill={bColor} />
      <rect x="64" y="147" width="20" height="13" rx="4" fill={bColor} />
      <rect x="36" y="152" width="20" height="3" rx="1.5" fill="white" opacity="0.4" />
      <rect x="64" y="152" width="20" height="3" rx="1.5" fill="white" opacity="0.4" />

      {/* Pernas (meias) */}
      <rect x="40" y="128" width="14" height="20" rx="5" fill={uColor} opacity="0.8"/>
      <rect x="66" y="128" width="14" height="20" rx="5" fill={uColor} opacity="0.8"/>

      {/* Short */}
      <rect x="34" y="110" width="52" height="22" rx="8" fill={srtColor} />
      <line x1="60" y1="110" x2="60" y2="132" stroke="white" strokeWidth="1" opacity="0.2"/>

      {/* Corpo / Camisa */}
      <rect x="30" y="72" width="60" height="42" rx="14" fill={uColor} />
      <rect x="30" y="85" width="60" height="3" rx="1.5" fill="white" opacity="0.18" />
      <text x="60" y="102" textAnchor="middle" fontSize="15" fontWeight="bold" fill="white" fontFamily="Arial">{number || '10'}</text>

      {/* Gola */}
      <path d="M48 72 Q60 80 72 72" fill={uColor} stroke="white" strokeWidth="1.5" />

      {/* Braços */}
      <rect x="12" y="74" width="19" height="34" rx="9" fill={sColor} />
      <rect x="89" y="74" width="19" height="34" rx="9" fill={sColor} />
      {/* Manga */}
      <rect x="12" y="74" width="19" height="14" rx="9" fill={uColor} />
      <rect x="89" y="74" width="19" height="14" rx="9" fill={uColor} />

      {/* Mãos */}
      <circle cx="21"  cy="110" r="7" fill={sColor} />
      <circle cx="99"  cy="110" r="7" fill={sColor} />

      {/* Pescoço */}
      <rect x="53" y="60" width="14" height="16" rx="6" fill={sColor} />

      {/* Rosto */}
      <circle cx="60" cy="42" r="27" fill={sColor} />

      {/* Bochecha corada */}
      <circle cx="45" cy="49" r="5.5" fill="#FF9999" opacity="0.45" />
      <circle cx="75" cy="49" r="5.5" fill="#FF9999" opacity="0.45" />

      {/* Olhos com piscar */}
      <motion.g
        animate={{ scaleY: [1, 0.05, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5 }}
        style={{ transformOrigin: '60px 42px' }}
      >
        <ellipse cx="50" cy="42" rx="6"  ry="7" fill="white" />
        <circle  cx="51" cy="42" r="4"   fill="#222" />
        <circle  cx="53" cy="40" r="1.5" fill="white" />
        <ellipse cx="70" cy="42" rx="6"  ry="7" fill="white" />
        <circle  cx="71" cy="42" r="4"   fill="#222" />
        <circle  cx="73" cy="40" r="1.5" fill="white" />
      </motion.g>

      {/* Sobrancelhas */}
      <path d="M44 33 Q50 29 56 33" stroke={hColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M64 33 Q70 29 76 33" stroke={hColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* Nariz */}
      <path d="M58 45 Q60 50 62 45" stroke={sColor} strokeWidth="1.5" fill="none" opacity="0.6"/>

      {/* Boca animada */}
      <motion.path
        d="M50 54 Q60 63 70 54"
        stroke="#C0392B" strokeWidth="2.5" fill="none" strokeLinecap="round"
        animate={{ d: ['M50 54 Q60 63 70 54', 'M50 56 Q60 65 70 56', 'M50 54 Q60 63 70 54'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Cabelo */}
      {hairTop[hairStyle?.id] || hairTop.hs1}
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════
// BARRA XP
// ═══════════════════════════════════════════════════
function XPBar({ xp }) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentXP = xp % XP_PER_LEVEL;
  const pct = (currentXP / XP_PER_LEVEL) * 100;
  const skillBonus = Math.min(level * 2, 30); // bônus de habilidade por nível
  return (
    <div className="bg-card border border-border/30 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-primary flex items-center gap-1"><Zap className="w-3 h-3" /> Nível {level}</span>
        <span className="text-[10px] text-muted-foreground">{currentXP}/{XP_PER_LEVEL} XP</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-3 rounded-full bg-gradient-to-r from-primary to-yellow-400"
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <p className="text-[10px] text-muted-foreground">Jogue para ganhar XP 🚀</p>
        <p className="text-[10px] font-bold text-emerald-600">+{skillBonus}% habilidade</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// EDITOR DE JOGADORA
// ═══════════════════════════════════════════════════
function PlayerEditor({ profile, onSave, onClose }) {
  const [step, setStep] = useState(0); // 0:nome 1:pele 2:cabelo 3:uniforme 4:detalhes

  const [playerName,   setPlayerName]  = useState(profile.customPlayer?.playerName || '');
  const [skinTone,     setSkinTone]    = useState(() => SKIN_TONES.find(s => s.id === profile.customPlayer?.skinTone)     || SKIN_TONES[1]);
  const [hairColor,    setHairColor]   = useState(() => HAIR_COLORS.find(h => h.id === profile.customPlayer?.hairColor)  || HAIR_COLORS[0]);
  const [hairStyle,    setHairStyle]   = useState(() => HAIR_STYLES.find(h => h.id === profile.customPlayer?.hairStyle)  || HAIR_STYLES[2]);
  const [uniformColor, setUniformColor]= useState(profile.customPlayer?.uniformColor || '#E91E63');
  const [shortsColor,  setShortsColor] = useState(profile.customPlayer?.shortsColor  || '#212121');
  const [bootsColor,   setBootsColor]  = useState(profile.customPlayer?.bootsColor   || '#FFD600');
  const [jerseyNum,    setJerseyNum]   = useState(profile.customPlayer?.jerseyNumber || 10);
  const [teamName,     setTeamName]    = useState(profile.customPlayer?.teamName || '');

  const steps = [
    { label: 'Nome',     icon: '✏️' },
    { label: 'Pele',     icon: '🎨' },
    { label: 'Cabelo',   icon: '💇‍♀️' },
    { label: 'Uniforme', icon: '👕' },
    { label: 'Detalhes', icon: '⚙️' },
  ];

  const handleSave = () => {
    onSave({ playerName, skinTone: skinTone.id, hairColor: hairColor.id, hairStyle: hairStyle.id, uniformColor, shortsColor, bootsColor, jerseyNumber: jerseyNum, teamName });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/95 z-50 overflow-y-auto">
      <div className="max-w-sm mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="text-muted-foreground"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="font-heading font-bold text-xl">Minha Jogadora</h2>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center mb-4">
          <CustomAvatar skin={skinTone} hairColor={hairColor} hairStyle={hairStyle} uniformColor={uniformColor} shortsColor={shortsColor} bootsColor={bootsColor} number={jerseyNum} size={90} />
          {playerName && <p className="font-heading font-bold text-lg mt-1">{playerName}</p>}
        </div>

        {/* Step pills */}
        <div className="flex gap-1 mb-5 overflow-x-auto">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${step === i ? 'bg-primary text-white shadow-md' : 'bg-muted text-muted-foreground'}`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* ── Step 0: Nome ── */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="font-bold">Nome da jogadora</h3>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ex: Ana, Babi, Camila..."
              className="w-full border-2 border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary"
              maxLength={20}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Esse nome aparece no seu perfil e no jogo</p>
            <button onClick={() => setStep(1)} className="w-full py-3 bg-primary text-white font-bold rounded-2xl">Próximo →</button>
          </motion.div>
        )}

        {/* ── Step 1: Tom de pele ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="font-bold">Tom de pele</h3>
            <div className="grid grid-cols-3 gap-3">
              {SKIN_TONES.map((s) => (
                <button key={s.id} onClick={() => setSkinTone(s)}
                  className={`rounded-2xl p-4 border-4 flex flex-col items-center gap-2 transition-all ${skinTone.id === s.id ? 'border-primary scale-105 shadow-lg' : 'border-transparent'}`}
                  style={{ backgroundColor: s.color + '33' }}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] font-bold">{s.label}</span>
                  {skinTone.id === s.id && <Check className="w-3 h-3 text-primary" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="flex-1 py-3 bg-muted font-bold rounded-2xl">←</button>
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl">Próximo →</button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Cabelo ── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="font-bold">Cor do cabelo</h3>
            <div className="grid grid-cols-4 gap-2">
              {HAIR_COLORS.map((h) => (
                <button key={h.id} onClick={() => setHairColor(h)}
                  className={`rounded-xl p-2 border-4 flex flex-col items-center gap-1 transition-all ${hairColor.id === h.id ? 'border-primary shadow-lg' : 'border-transparent bg-muted/30'}`}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: h.color }} />
                  <span className="text-[9px]">{h.label}</span>
                </button>
              ))}
            </div>
            <h3 className="font-bold">Tipo de cabelo</h3>
            <div className="grid grid-cols-4 gap-2">
              {HAIR_STYLES.map((h) => (
                <button key={h.id} onClick={() => setHairStyle(h)}
                  className={`rounded-xl p-2 border-2 flex flex-col items-center gap-1 transition-all ${hairStyle.id === h.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border/30 bg-card'}`}
                >
                  <span className="text-xl">{h.emoji}</span>
                  <span className="text-[9px] font-bold text-center leading-tight">{h.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-muted font-bold rounded-2xl">←</button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl">Próximo →</button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Uniforme, Short, Chuteira ── */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="font-bold">Cor da camisa</h3>
            <div className="flex flex-wrap gap-2">
              {UNIFORM_COLORS.map((c) => (
                <button key={c} onClick={() => setUniformColor(c)}
                  className={`w-9 h-9 rounded-xl border-4 transition-all ${uniformColor === c ? 'border-primary scale-110 shadow-lg' : 'border-white shadow'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <h3 className="font-bold">Cor do short</h3>
            <div className="flex flex-wrap gap-2">
              {SHORTS_COLORS.map((c) => (
                <button key={c} onClick={() => setShortsColor(c)}
                  className={`w-9 h-9 rounded-xl border-4 transition-all ${shortsColor === c ? 'border-primary scale-110 shadow-lg' : 'border-white shadow'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <h3 className="font-bold">Cor da chuteira</h3>
            <div className="flex flex-wrap gap-2">
              {BOOT_COLORS.map((c) => (
                <button key={c} onClick={() => setBootsColor(c)}
                  className={`w-9 h-9 rounded-xl border-4 transition-all ${bootsColor === c ? 'border-primary scale-110 shadow-lg' : 'border-white shadow'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-muted font-bold rounded-2xl">←</button>
              <button onClick={() => setStep(4)} className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl">Próximo →</button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Número & Equipe ── */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="font-bold">Número da camisa</h3>
            <div className="flex flex-wrap gap-2">
              {JERSEY_NUMBERS.map((n) => (
                <button key={n} onClick={() => setJerseyNum(n)}
                  className={`w-11 h-11 rounded-xl font-black text-base transition-all ${jerseyNum === n ? 'bg-primary text-white shadow-lg scale-110' : 'bg-muted hover:bg-muted/70'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <h3 className="font-bold">Nome da equipe</h3>
            <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
              placeholder="Ex: FC Meninas, Garotas do Gol..."
              className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
              maxLength={30}
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-muted font-bold rounded-2xl">←</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-primary to-pink-500 text-white font-bold rounded-2xl shadow-lg">Salvar ✓</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════
export default function Profile() {
  const [profile, setProfile] = useState(loadProfile);
  const [saved, setSaved] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTeam, setEditingTeam] = useState(false);
  const [teamInput, setTeamInput] = useState(profile.favoriteTeam || '');
  const [heartAnimation, setHeartAnimation] = useState(false);

  const cp = profile.customPlayer || {};
  const skinTone    = SKIN_TONES.find(s => s.id === cp.skinTone)    || SKIN_TONES[1];
  const hairColor   = HAIR_COLORS.find(h => h.id === cp.hairColor)  || HAIR_COLORS[0];
  const hairStyle   = HAIR_STYLES.find(h => h.id === cp.hairStyle)  || HAIR_STYLES[2];
  const uniformColor = cp.uniformColor || '#E91E63';
  const shortsColor  = cp.shortsColor  || '#212121';
  const bootsColor   = cp.bootsColor   || '#FFD600';
  const jerseyNum    = cp.jerseyNumber  || 10;
  const playerName   = cp.playerName   || 'Minha Jogadora';
  const teamName     = cp.teamName     || '';

  const xp    = profile.globalXP || 0;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;

  const persist = (updated) => {
    setProfile(updated);
    saveProfile(updated);
  };

  const handleSaveCustomPlayer = (data) => {
    const updated = { ...profile, customPlayer: data };
    persist(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleSaveTeam = () => {
    if (!teamInput.trim()) return;
    const updated = { ...profile, favoriteTeam: teamInput.trim() };
    persist(updated);
    setEditingTeam(false);
    setHeartAnimation(true);
    setTimeout(() => setHeartAnimation(false), 3000);
  };

  const winRate = profile.stats?.matches
    ? Math.round(((profile.stats?.wins || 0) / profile.stats.matches) * 100)
    : 0;

  return (
    <>
      {showEditor && (
        <PlayerEditor
          profile={profile}
          onSave={handleSaveCustomPlayer}
          onClose={() => setShowEditor(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background px-4 py-6 font-body">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-heading font-semibold">Voltar</span>
        </Link>

        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-5">
          <h1 className="font-heading text-3xl font-bold">Meu Perfil</h1>
        </motion.div>

        {/* ── Card da Jogadora ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="max-w-sm mx-auto mb-4 bg-card rounded-3xl overflow-hidden shadow-xl border border-border/30"
        >
          {/* Banner */}
          <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${uniformColor}, ${bootsColor})` }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }} />
            <button
              onClick={() => setShowEditor(true)}
              className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white rounded-full px-3 py-1.5 flex items-center gap-1 text-xs font-bold"
            >
              <Pencil className="w-3 h-3" /> Editar
            </button>
            {/* Nível badge */}
            <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm text-white rounded-full px-2 py-1 flex items-center gap-1 text-xs font-bold">
              <Zap className="w-3 h-3 text-yellow-400" /> Nv. {level}
            </div>
          </div>

          <div className="px-5 pb-5">
            {/* Avatar + nome */}
            <div className="flex items-end gap-4 -mt-10 mb-3">
              <div
                className="rounded-2xl p-1.5 shadow-lg border-4"
                style={{ backgroundColor: uniformColor + '22', borderColor: uniformColor }}
              >
                <CustomAvatar
                  skin={skinTone} hairColor={hairColor} hairStyle={hairStyle}
                  uniformColor={uniformColor} shortsColor={shortsColor}
                  bootsColor={bootsColor} number={jerseyNum} size={72}
                />
              </div>
              <div className="pb-1">
                <h2 className="font-heading font-bold text-xl leading-tight">
                  {playerName}
                </h2>
                <p className="text-xs text-muted-foreground">Camisa #{jerseyNum}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(Math.min(level, 5))].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <XPBar xp={xp} />

            {/* Stats de partida */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: 'Partidas', value: profile.stats?.matches || 0, emoji: '⚽' },
                { label: 'Vitórias',  value: profile.stats?.wins    || 0, emoji: '🏆' },
                { label: 'Win%',      value: profile.stats?.matches ? winRate + '%' : '—', emoji: '📊' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="bg-muted rounded-xl p-2 text-center">
                  <span className="text-base block">{emoji}</span>
                  <span className="font-heading font-bold text-base block">{value}</span>
                  <span className="text-[9px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Aparência rápida */}
            <div className="flex items-center gap-2 mt-3 bg-muted/40 rounded-xl p-2.5">
              <div className="w-5 h-5 rounded-full border border-white shadow" style={{ backgroundColor: skinTone.color }} title="Tom de pele" />
              <div className="w-5 h-5 rounded-full border border-white shadow" style={{ backgroundColor: hairColor.color }} title="Cabelo" />
              <div className="w-5 h-5 rounded-xl border border-white shadow" style={{ backgroundColor: uniformColor }} title="Camisa" />
              <div className="w-5 h-5 rounded-xl border border-white shadow" style={{ backgroundColor: shortsColor }} title="Short" />
              <div className="w-5 h-5 rounded-xl border border-white shadow" style={{ backgroundColor: bootsColor }} title="Chuteira" />
              <span className="text-xs text-muted-foreground ml-auto">Toque em Editar para personalizar</span>
            </div>
          </div>
        </motion.div>

        {/* ── Time do Coração ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="max-w-sm mx-auto mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="font-heading font-bold text-lg">Time do Coração</h2>
          </div>

          {/* Animação de coração após salvar */}
          <AnimatePresence>
            {heartAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 2 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1, 1.3, 1], rotate: [-5, 5, -5, 5, 0] }}
                    transition={{ duration: 1.2 }}
                    className="text-8xl"
                  >
                    ❤️
                  </motion.div>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="font-heading font-black text-2xl text-red-500 mt-3 drop-shadow-lg bg-white/90 px-4 py-2 rounded-full"
                  >
                    {profile.favoriteTeam}! ❤️
                  </motion.p>
                  <motion.div
                    className="mt-2 text-4xl"
                    animate={{ y: [0, -20, 0, -15, 0] }}
                    transition={{ duration: 2, delay: 0.5 }}
                  >
                    🎉🎊🎉
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-card rounded-2xl border border-border/30 shadow p-4">
            {profile.favoriteTeam && !editingTeam ? (
              <div className="flex items-center gap-3">
                <div className="text-4xl">❤️</div>
                <div className="flex-1">
                  <p className="font-heading font-bold text-lg">{profile.favoriteTeam}</p>
                  <p className="text-xs text-muted-foreground">Meu time do coração</p>
                </div>
                <button
                  onClick={() => { setTeamInput(profile.favoriteTeam); setEditingTeam(true); }}
                  className="text-xs text-muted-foreground underline"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Qual é o seu time do coração? ❤️</p>
                <input
                  type="text"
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  placeholder="Digite o nome do seu time..."
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  maxLength={40}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTeam()}
                />
                <div className="flex gap-2">
                  {editingTeam && (
                    <button onClick={() => setEditingTeam(false)} className="flex-1 py-2.5 bg-muted text-foreground font-bold rounded-xl text-sm">Cancelar</button>
                  )}
                  <button
                    onClick={handleSaveTeam}
                    disabled={!teamInput.trim()}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl text-sm shadow disabled:opacity-40"
                  >
                    ❤️ Salvar meu time!
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Conquistas ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="max-w-sm mx-auto mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="font-heading font-bold text-lg">Conquistas</h2>
            <span className="ml-auto text-xs text-muted-foreground">
              {MEDALS.filter(m => m.condition(profile.stats)).length}/{MEDALS.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MEDALS.map((medal, idx) => {
              const unlocked = medal.condition(profile.stats);
              return (
                <motion.div
                  key={medal.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.06 }}
                  className={`relative rounded-2xl p-3 text-center border-2 transition-all ${
                    unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                      : 'bg-muted/30 border-muted'
                  }`}
                >
                  <motion.div
                    className="text-3xl mb-1"
                    animate={unlocked ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {medal.emoji}
                  </motion.div>
                  <div className="text-[10px] font-bold leading-tight">{medal.name}</div>
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-2xl">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </>
  );
}
