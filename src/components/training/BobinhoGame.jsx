// ═══════════════════════════════════════════════════════════════════════════
// BobinhoGame — Jogo de passes com bobinho(s)
// Fases: 2v1 → 3v1 → 4v1 → 5v2
// Role: jogador (passa a bola, foge do bobinho) ou bobinho (pega a bola)
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FIELD_W = 340;
const FIELD_H = 480;
const PLAYER_R = 22;
const BOBINHO_R = 22;
const BALL_R = 12;

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

const PHASES = [
  { id: 1, players: 2, bobinhos: 1, label: '2 vs 1', time: 60, bobSpeed: 0.55, aiSpeed: 0.9, desc: 'Fácil — só dois jogadores' },
  { id: 2, players: 3, bobinhos: 1, label: '3 vs 1', time: 70, bobSpeed: 0.80, aiSpeed: 1.1, desc: 'Tranquilo — três jogadores' },
  { id: 3, players: 4, bobinhos: 1, label: '4 vs 1', time: 80, bobSpeed: 1.05, aiSpeed: 1.3, desc: 'Mais difícil — mais gente!' },
  { id: 4, players: 5, bobinhos: 2, label: '5 vs 2', time: 90, bobSpeed: 1.30, aiSpeed: 1.5, desc: 'Caos total — 2 bobinhos!' },
];

const COLORS = ['#E91E63','#2196F3','#4CAF50','#FF9800','#9C27B0'];

export default function BobinhoGame({ onStickerEarned }) {
  const [phase, setPhase]           = useState('menu');
  const [phaseIdx, setPhaseIdx]     = useState(0);
  const [role, setRole]             = useState('player');
  const [players, setPlayers]       = useState([]);
  const [bobinhos, setBobinhos]     = useState([]);
  const [ballHolder, setBallHolder] = useState(0);
  const [passes, setPasses]         = useState(0);
  const [timeLeft, setTimeLeft]     = useState(60);
  const [result, setResult]         = useState(null); // 'win' | 'lose'
  const [joystick, setJoystick]     = useState({ x: 0, y: 0, active: false });

  const joyRef    = useRef(null);
  const joyCtrRef = useRef(null);
  const rafRef    = useRef(null);
  const stateRef  = useRef({});

  // Sempre sincroniza o ref com o state mais recente
  useEffect(() => {
    stateRef.current = { players, bobinhos, ballHolder, joystick, phase, role };
  });

  const config = PHASES[phaseIdx];

  // ── Inicializar posições ──────────────────────────────────────────────────
  const initGame = useCallback((pIdx, r) => {
    const cfg = PHASES[pIdx];
    const ps = Array.from({ length: cfg.players }, (_, i) => ({
      x: 60 + (i % 3) * 110,
      y: 120 + Math.floor(i / 3) * 160,
      color: COLORS[i % COLORS.length],
      id: i,
    }));
    const bs = Array.from({ length: cfg.bobinhos }, (_, i) => ({
      x: FIELD_W / 2 + (i - 0.5) * 80,
      y: FIELD_H / 2,
      id: i,
    }));
    setPlayers(ps);
    setBobinhos(bs);
    setBallHolder(0);
    setPasses(0);
    setTimeLeft(cfg.time);
    setResult(null);
    setPhase('playing');
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setPhase('result');
          setResult('win');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // ── Game loop (RAF) ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = () => {
      const { players: ps, bobinhos: bs, ballHolder: bh, joystick: joy, phase: ph, role: rl } = stateRef.current;
      if (ph !== 'playing') return;

      const cfg = PHASES[phaseIdx];

      // ── Mover personagem controlado pelo joystick ──
      if (joy.active) {
        if (rl === 'player') {
          // Joystick move o jogador[0]
          setPlayers(prev => {
            const upd = [...prev];
            if (!upd[0]) return prev;
            upd[0] = {
              ...upd[0],
              x: clamp(upd[0].x + joy.x * 3.5, PLAYER_R, FIELD_W - PLAYER_R),
              y: clamp(upd[0].y + joy.y * 3.5, PLAYER_R, FIELD_H - PLAYER_R),
            };
            return upd;
          });
        } else {
          // Joystick move o bobinho[0]
          setBobinhos(prev => {
            const upd = [...prev];
            if (!upd[0]) return prev;
            upd[0] = {
              ...upd[0],
              x: clamp(upd[0].x + joy.x * 3.5, BOBINHO_R, FIELD_W - BOBINHO_R),
              y: clamp(upd[0].y + joy.y * 3.5, BOBINHO_R, FIELD_H - BOBINHO_R),
            };
            return upd;
          });
        }
      }

      // ── IA dos outros jogadores (fogem dos bobinhos) ──
      setPlayers(prev => {
        const upd = prev.map((p, i) => {
          if (i === 0 && rl === 'player') return p; // jogador[0] é controlado manualmente
          const nearestBob = bs.reduce((n, b) => dist(p, b) < dist(p, n) ? b : n, bs[0] || { x: -999, y: -999 });
          const d = dist(p, nearestBob);
          if (d > 130) return p;
          const dx = p.x - nearestBob.x;
          const dy = p.y - nearestBob.y;
          const mag = Math.sqrt(dx * dx + dy * dy) || 1;
          return {
            ...p,
            x: clamp(p.x + (dx / mag) * cfg.aiSpeed, PLAYER_R, FIELD_W - PLAYER_R),
            y: clamp(p.y + (dy / mag) * cfg.aiSpeed, PLAYER_R, FIELD_H - PLAYER_R),
          };
        });
        return upd;
      });

      // ── IA dos bobinhos (perseguem quem tem a bola) ──
      setBobinhos(prev => prev.map((b, i) => {
        if (i === 0 && rl === 'bobinho') return b; // bobinho[0] é controlado manualmente
        const target = ps[bh] || ps[0];
        if (!target) return b;
        const dx = target.x - b.x;
        const dy = target.y - b.y;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;
        return {
          ...b,
          x: clamp(b.x + (dx / mag) * cfg.bobSpeed, BOBINHO_R, FIELD_W - BOBINHO_R),
          y: clamp(b.y + (dy / mag) * cfg.bobSpeed, BOBINHO_R, FIELD_H - BOBINHO_R),
        };
      }));

      // ── Verificar colisão bobinho com ball holder ──
      const holder = ps[bh];
      if (holder) {
        const caught = bs.some(b => dist(holder, b) < PLAYER_R + BOBINHO_R - 4);
        if (caught) {
          setPhase('result');
          setResult('lose');
          return;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, phaseIdx]);

  // ── Auto-passe dos jogadores IA (que não são o jogador humano) ──
  useEffect(() => {
    if (phase !== 'playing') return;
    // O jogador humano (role='player', idx 0) passa manualmente
    if (role === 'player' && ballHolder === 0) return;

    const delay = 1200 + Math.random() * 600;
    const t = setTimeout(() => {
      setPlayers(currPs => {
        setBobinhos(currBs => {
          // Encontrar jogador mais seguro (mais longe de todos os bobinhos)
          let best = -1, bestScore = -1;
          currPs.forEach((p, i) => {
            if (i === ballHolder) return;
            const minBob = currBs.reduce((m, b) => Math.min(m, dist(p, b)), Infinity);
            if (minBob > bestScore) { bestScore = minBob; best = i; }
          });
          if (best >= 0) {
            setBallHolder(best);
            setPasses(prev => prev + 1);
          }
          return currBs;
        });
        return currPs;
      });
    }, delay);
    return () => clearTimeout(t);
  }, [ballHolder, phase, role]);

  // ── Passe manual (toque num jogador) ──
  const passBall = (targetIdx) => {
    if (role !== 'player' || ballHolder !== 0) return;
    setBallHolder(targetIdx);
    setPasses(prev => prev + 1);
  };

  // ── Joystick handlers ──
  const handleJoyStart = (clientX, clientY) => {
    if (!joyRef.current) return;
    const rect = joyRef.current.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joyCtrRef.current = center;
    updateJoystick(clientX, clientY, center);
  };
  const updateJoystick = (clientX, clientY, center) => {
    const c = center || joyCtrRef.current;
    if (!c) return;
    const maxDist = 40;
    const dx = clientX - c.x;
    const dy = clientY - c.y;
    const dist2 = Math.sqrt(dx * dx + dy * dy);
    const scale = Math.min(dist2, maxDist) / maxDist;
    const angle = Math.atan2(dy, dx);
    setJoystick({ x: Math.cos(angle) * scale, y: Math.sin(angle) * scale, active: true });
  };
  const handleJoyEnd = () => {
    joyCtrRef.current = null;
    setJoystick({ x: 0, y: 0, active: false });
  };

  // ── Render: Menu ─────────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center gap-5 py-4 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-2">⚽</motion.div>
          <h1 className="font-heading font-black text-2xl text-primary">Bobinho</h1>
          <p className="text-xs text-muted-foreground">Passe a bola sem deixar o bobinho pegar!</p>
        </motion.div>

        {/* Escolha de papel */}
        <div className="w-full max-w-xs">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase text-center">Você quer ser…</p>
          <div className="grid grid-cols-2 gap-3">
            {[{ id: 'player', label: 'Jogador', desc: 'Passe a bola e fuja!', emoji: '🏃‍♀️' },
              { id: 'bobinho', label: 'Bobinho', desc: 'Pegue a bola!', emoji: '😈' }].map(r => (
              <motion.button key={r.id} whileTap={{ scale: 0.95 }}
                onClick={() => setRole(r.id)}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${role === r.id ? 'border-primary bg-primary/10' : 'border-border/30 bg-card'}`}>
                <div className="text-3xl mb-1">{r.emoji}</div>
                <div className="font-bold text-sm">{r.label}</div>
                <div className="text-[9px] text-muted-foreground">{r.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Escolha de fase */}
        <div className="w-full max-w-xs space-y-2">
          <p className="text-xs font-bold text-gray-500 mb-1 uppercase text-center">Fase</p>
          {PHASES.map((ph, i) => (
            <motion.button key={ph.id} whileTap={{ scale: 0.97 }}
              onClick={() => setPhaseIdx(i)}
              className={`w-full py-3 px-4 rounded-2xl border-2 text-left flex justify-between items-center transition-all ${phaseIdx === i ? 'border-primary bg-primary/10' : 'border-border/30 bg-card'}`}>
              <div>
                <div className="font-bold text-sm">{ph.label}</div>
                <div className="text-[9px] text-muted-foreground">{ph.desc}</div>
              </div>
              {phaseIdx === i && <span className="text-primary font-bold text-lg">✓</span>}
            </motion.button>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => initGame(phaseIdx, role)}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-pink-500 text-white font-heading font-black text-lg rounded-2xl shadow-lg">
          Jogar! ⚽
        </motion.button>
      </div>
    );
  }

  // ── Render: Result ────────────────────────────────────────────────────────
  if (phase === 'result') {
    const won = result === 'win';
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-7xl">{won ? '🏆' : '😅'}</motion.div>
        <div className="text-center">
          <h2 className="font-heading font-black text-2xl mb-1">{won ? 'Boa! Conseguiu!' : 'O bobinho pegou!'}</h2>
          <p className="text-muted-foreground">{passes} passes realizados</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => initGame(phaseIdx, role)}
            className="px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg">
            Jogar de novo
          </button>
          <button onClick={() => setPhase('menu')}
            className="px-6 py-3 bg-muted font-bold rounded-2xl">
            Menu
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Render: Playing ───────────────────────────────────────────────────────
  const holderPos = players[ballHolder] || { x: 0, y: 0 };

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-2">
        <div className="bg-card rounded-2xl px-4 py-2 font-bold text-sm shadow-sm">
          ⚽ {passes} passes
        </div>
        <div className={`bg-card rounded-2xl px-4 py-2 font-bold shadow-sm ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
          ⏱ {timeLeft}s
        </div>
        <div className="bg-card rounded-2xl px-3 py-2 text-xs font-bold shadow-sm">
          {config.label}
        </div>
      </div>

      {/* Campo */}
      <div className="relative bg-gradient-to-b from-green-600 to-green-700 rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: FIELD_W, height: FIELD_H }}>
        {/* Linhas do campo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white" />
        </div>

        {/* Jogadores */}
        {players.map((p, i) => (
          <motion.div key={p.id}
            animate={{ x: p.x - PLAYER_R, y: p.y - PLAYER_R }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute"
            onClick={() => passBall(i)}
            style={{ width: PLAYER_R * 2, height: PLAYER_R * 2 }}>
            <div className="w-full h-full rounded-full flex items-center justify-center font-black text-white text-xs shadow-lg border-3 border-white"
              style={{ background: p.color, boxShadow: ballHolder === i ? `0 0 0 4px white, 0 0 0 6px ${p.color}` : undefined }}>
              {i === 0 && role === 'player' ? '⭐' : `P${i + 1}`}
            </div>
            {ballHolder === i && (
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs">⚽</motion.div>
            )}
          </motion.div>
        ))}

        {/* Bobinhos */}
        {bobinhos.map((b, i) => (
          <motion.div key={b.id}
            animate={{ x: b.x - BOBINHO_R, y: b.y - BOBINHO_R }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute"
            style={{ width: BOBINHO_R * 2, height: BOBINHO_R * 2 }}>
            <div className="w-full h-full rounded-full bg-red-500 flex items-center justify-center text-white font-black text-sm shadow-lg border-2 border-red-300">
              {i === 0 && role === 'bobinho' ? '⭐' : '😈'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-6 py-2">
        {/* Joystick */}
        <div ref={joyRef}
          className="w-32 h-32 rounded-full bg-black/20 border-4 border-white/30 relative flex items-center justify-center touch-none"
          onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; handleJoyStart(t.clientX, t.clientY); }}
          onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; updateJoystick(t.clientX, t.clientY, null); }}
          onTouchEnd={handleJoyEnd}
          onMouseDown={(e) => handleJoyStart(e.clientX, e.clientY)}
          onMouseMove={(e) => e.buttons === 1 && updateJoystick(e.clientX, e.clientY, null)}
          onMouseUp={handleJoyEnd}>
          <motion.div
            animate={{ x: joystick.x * 30, y: joystick.y * 30 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-12 h-12 rounded-full bg-white/80 shadow-lg" />
        </div>

        {/* Botões de passe (só quando jogador tem a bola) */}
        {role === 'player' && ballHolder === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-center text-muted-foreground">Passar para:</p>
            <div className="flex flex-wrap gap-2 max-w-[120px]">
              {players.map((p, i) => i !== 0 && (
                <motion.button key={i} whileTap={{ scale: 0.85 }}
                  onClick={() => passBall(i)}
                  className="w-10 h-10 rounded-full font-black text-white text-xs shadow-lg"
                  style={{ background: p.color }}>
                  P{i + 1}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        {role === 'bobinho' && (
          <div className="text-center">
            <p className="text-xs font-bold text-muted-foreground">Você é o</p>
            <p className="text-3xl">😈</p>
            <p className="text-xs text-red-500 font-bold">Pega a bola!</p>
          </div>
        )}
      </div>

      <button onClick={() => { cancelAnimationFrame(rafRef.current); setPhase('menu'); }}
        className="text-xs text-muted-foreground underline">
        Sair
      </button>
    </div>
  );
}
