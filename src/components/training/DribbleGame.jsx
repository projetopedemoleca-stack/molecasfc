// ═══════════════════════════════════════════════════════════════════════════
// FUT DE RUA — 1v1, dois gols (chinelos), dois jogadores
// Você controla a bola com joystick. Bot defende.
// Se esbarrar em obstáculo perde a bola pro bot.
// Bot também erra se bater em obstáculo.
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { audio } from '@/lib/audioEngine';

const FIELD_W  = 360;
const FIELD_H  = 520;
const GOAL_W   = 100;
const GOAL_H   = 60;
const PLAYER_R = 24;
const BOT_R    = 24;
const BALL_R   = 10;

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

const BALL_TYPES = [
  { id: 'head',    name: 'Cabeça de Boneca',  emoji: '🧠', speed: 1.0,  desc: 'Leve e imprevisível' },
  { id: 'can',     name: 'Lata',               emoji: '🥫', speed: 0.8,  desc: 'Pesada e reta' },
  { id: 'stone',  name: 'Pedra',              emoji: '🪨', speed: 0.6,  desc: 'Muito pesada' },
  { id: 'paper',  name: 'Papel Amassado',     emoji: '📄', speed: 1.1,  desc: 'Leve e flutuante' },
  { id: 'bottle', name: 'Garrafinha',         emoji: '🍼', speed: 1.0,  desc: 'Equilibrada' },
  { id: 'lemon',  name: 'Limão',              emoji: '🍋', speed: 1.0,  desc: 'Irregular' },
  { id: 'cap',    name: 'Tampinha',           emoji: '🪙', speed: 1.05, desc: 'Muito leve' },
  { id: 'tennis', name: 'Bolinha de Tênis',   emoji: '🎾', speed: 1.15, desc: 'Rápida e quicante' },
  { id: 'deflated', name: 'Bola Murcha',      emoji: '🏀', speed: 0.7,  desc: 'Lenta e imprevisível' },
];

const OBSTACLE_TYPES = [
  { id: 'dog',    name: 'Cachorrinho',       emoji: '🐕', behavior: 'patrol', desc: 'Corre de um lado a outro' },
  { id: 'car',    name: 'Carro Estacionado', emoji: '🚗', behavior: 'static', desc: 'Bloqueia o caminho' },
  { id: 'cat',    name: 'Gato',              emoji: '🐱', behavior: 'patrol', desc: 'Passeia pela rua' },
  { id: 'bike',   name: 'Bicicleta',         emoji: '🚲', behavior: 'static', desc: 'Estacionada no canto' },
  { id: 'bin',    name: 'Lixeira',           emoji: '🗑️', behavior: 'static', desc: 'Obstáculo fixo' },
  { id: 'granny', name: 'Velhinha',         emoji: '👵', behavior: 'slow',   desc: 'Anda bem devagar' },
  { id: 'speaker', name: 'Caixinha de Som',  emoji: '📻', behavior: 'static', desc: 'Som de rua' },
];

const LEVELS = [
  { label: 'Nível 1', goals: 3, time: 60, botSpeed: 1.0, obstacles: 1, desc: 'Rua calma — aprenda!' },
  { label: 'Nível 2', goals: 4, time: 55, botSpeed: 1.4, obstacles: 2, desc: 'Mais obstáculos!' },
  { label: 'Nível 3', goals: 5, time: 50, botSpeed: 1.8, obstacles: 3, desc: 'Velocidade subindo!' },
  { label: 'Nível 4', goals: 5, time: 45, botSpeed: 2.2, obstacles: 3, desc: 'Quase lá!' },
  { label: 'Nível 5', goals: 6, time: 40, botSpeed: 2.6, obstacles: 4, desc: 'Rua lotada!' },
];

export default function DribbleGame() {
  const [phase, setPhase]         = useState('menu');
  const [level, setLevel]         = useState(0);
  const [score, setScore]         = useState(0);
  const [playerGoals, setPlayerGoals] = useState(0);
  const [botGoals, setBotGoals]   = useState(0);
  const [timeLeft, setTimeLeft]   = useState(60);
  const [lives, setLives]         = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ballOwner, setBallOwner] = useState('player');
  const [selectedBall, setSelectedBall] = useState(BALL_TYPES[0]);
  const [selectedObstacles, setSelectedObstacles] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: FIELD_W / 2, y: FIELD_H - 100 });
  const [botPos, setBotPos]       = useState({ x: FIELD_W / 2, y: 100 });
  const [ballPos, setBallPos]     = useState({ x: FIELD_W / 2, y: FIELD_H - 100 });
  const [obstaclePositions, setObstaclePositions] = useState([]);
  const [joystick, setJoystick]   = useState({ x: 0, y: 0, active: false });
  const [showGoalEffect, setShowGoalEffect] = useState(false);
  const [goalSide, setGoalSide]   = useState(null); // 'player' | 'bot' | null
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [winner, setWinner]       = useState(null);

  const config = LEVELS[level] || LEVELS[0];
  const rafRef    = useRef(null);
  const joyRef    = useRef(null);
  const joyCtrRef = useRef(null);
  const posRef    = useRef({ player: { x: FIELD_W / 2, y: FIELD_H - 100 }, bot: { x: FIELD_W / 2, y: 100 }, ball: { x: FIELD_W / 2, y: FIELD_H - 100 } });

  const playSound = useCallback((name) => {
    if (!soundEnabled) return;
    try { audio[name]?.(); } catch {}
  }, [soundEnabled]);

  // ── Iniciar nível ────────────────────────────────────────────────────────
  const initLevel = useCallback((lvl = 0) => {
    const cfg = LEVELS[lvl] || LEVELS[0];
    const pPos = { x: FIELD_W / 2, y: FIELD_H - 100 };
    const bPos = { x: FIELD_W / 2, y: 100 };
    setLevel(lvl);
    setPlayerGoals(0);
    setBotGoals(0);
    setLives(3);
    setTimeLeft(cfg.time);
    setBallOwner('player');
    setPlayerPos(pPos);
    setBotPos(bPos);
    setBallPos({ ...pPos });
    setObstaclePositions([]);
    setShowGoalEffect(false);
    setShowHitEffect(false);
    setWinner(null);
    posRef.current = { player: { ...pPos }, bot: { ...bPos }, ball: { ...pPos } };

    // Posicionar obstáculos
    const obs = (selectedObstacles.length > 0 ? selectedObstacles : OBSTACLE_TYPES.slice(0, cfg.obstacles)).map((o, i) => ({
      ...o,
      x: 40 + (i * (FIELD_W - 80)) / (cfg.obstacles || 1),
      y: FIELD_H / 2 + (i % 2 === 0 ? -60 : 60),
      dir: i % 2 === 0 ? 1 : -1,
      speed: 1.5 + i * 0.3,
    }));
    setObstaclePositions(obs);
    setPhase('playing');
  }, [selectedObstacles]);

  // ── Game loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') { cancelAnimationFrame(rafRef.current); return; }

    const loop = () => {
      const spd = selectedBall.speed;
      const p = posRef.current;

      // Mover jogador com joystick
      const newPlayer = {
        x: clamp(p.player.x + joystick.x * 3.5 * spd, PLAYER_R, FIELD_W - PLAYER_R),
        y: clamp(p.player.y + joystick.y * 3.5 * spd, PLAYER_R, FIELD_H - PLAYER_R),
      };
      posRef.current = { ...p, player: newPlayer };
      setPlayerPos(newPlayer);

      // Bola segue o dono
      const newBall = ballOwner === 'player' ? { ...newPlayer } : { ...p.ball };
      if (ballOwner === 'player') {
        posRef.current = { ...posRef.current, ball: newBall };
        setBallPos(newBall);
      }

      // Bot: defender gol do jogador (y = 0) ou atacar gol do bot (y = FIELD_H)
      const botTargetY = 40; // gol do bot é embaixo (FIELD_H - GOAL_H)
      const botShouldAttack = ballOwner === 'bot';
      const botTarget = botShouldAttack
        ? { x: FIELD_W / 2, y: FIELD_H - 50 }
        : { x: p.ball.x, y: 40 };

      const bDx = botTarget.x - p.bot.x;
      const bDy = botTarget.y - p.bot.y;
      const bD  = Math.sqrt(bDx * bDx + bDy * bDy) || 1;
      const newBot = {
        x: clamp(p.bot.x + (bDx / bD) * config.botSpeed * spd, BOT_R, FIELD_W - BOT_R),
        y: clamp(p.bot.y + (bDy / bD) * config.botSpeed * spd, BOT_R, FIELD_H - BOT_R),
      };
      posRef.current = { ...posRef.current, bot: newBot };
      setBotPos(newBot);

      // Mover obstáculos
      setObstaclePositions(prev => prev.map(obs => {
        if (obs.behavior === 'patrol') {
          const nx = obs.x + obs.dir * obs.speed;
          if (nx < 30 || nx > FIELD_W - 30) return { ...obs, dir: -obs.dir };
          return { ...obs, x: nx };
        }
        if (obs.behavior === 'slow') {
          const nx = obs.x + obs.dir * obs.speed * 0.3;
          if (nx < 30 || nx > FIELD_W - 30) return { ...obs, dir: -obs.dir };
          return { ...obs, x: nx };
        }
        return obs;
      }));

      // ── Colisão bot-jogador (disputa de bola) ──
      if (dist(newPlayer, newBot) < PLAYER_R + BOT_R - 4) {
        if (ballOwner === 'player') {
          setBallOwner('bot');
          setShowHitEffect(true);
          playSound('lose');
          setTimeout(() => setShowHitEffect(false), 500);
        } else {
          setBallOwner('player');
          playSound('pass');
        }
      }

      // ── Jogador esbarrou em obstáculo → perde bola ──
      for (const obs of obstaclePositions) {
        if (dist(newPlayer, { x: obs.x, y: obs.y }) < PLAYER_R + 16) {
          if (ballOwner === 'player') {
            setBallOwner('bot');
            setShowHitEffect(true);
            playSound('lose');
            setTimeout(() => setShowHitEffect(false), 500);
          }
          break;
        }
      }

      // ── Bot esbarrou em obstáculo → perde bola ──
      for (const obs of obstaclePositions) {
        if (dist(newBot, { x: obs.x, y: obs.y }) < BOT_R + 16) {
          if (ballOwner === 'bot') {
            setBallOwner('player');
            playSound('pass');
          }
          break;
        }
      }

      // ── Gol do BOT (bola na parte de cima) ──
      const ballY = ballOwner === 'bot' ? newBot.y : p.ball.y;
      const ballX  = ballOwner === 'bot' ? newBot.x : p.ball.x;
      if (ballY < GOAL_H + 15 && Math.abs(ballX - FIELD_W / 2) < GOAL_W / 2 + 10) {
        // Bot marcou!
        setBallOwner('player');
        setBotGoals(g => g + 1);
        setScore(s => s + 10);
        setShowGoalEffect(true);
        setGoalSide('bot');
        playSound('goal');
        setTimeout(() => {
          setShowGoalEffect(false);
          setGoalSide(null);
          const newBGoals = botGoals + 1;
          if (newBGoals >= config.goals) {
            setWinner('bot');
            setPhase('result');
          } else {
            const rp = { x: FIELD_W / 2, y: FIELD_H - 100 };
            const rb = { x: FIELD_W / 2, y: 100 };
            setPlayerPos(rp);
            setBotPos(rb);
            setBallPos({ ...rp });
            posRef.current = { player: rp, bot: rb, ball: rp };
          }
        }, 1200);
        cancelAnimationFrame(rafRef.current);
        return;
      }

      // ── Gol do JOGADOR (bola na parte de baixo) ──
      if (ballOwner === 'bot' && newBot.y > FIELD_H - GOAL_H - 15 && Math.abs(newBot.x - FIELD_W / 2) < GOAL_W / 2 + 10) {
        // Jogador marcou!
        setBallOwner('player');
        setPlayerGoals(g => g + 1);
        const pts = (level + 1) * 20;
        setScore(s => s + pts);
        setShowGoalEffect(true);
        setGoalSide('player');
        playSound('win');
        setTimeout(() => {
          setShowGoalEffect(false);
          setGoalSide(null);
          const newPGoals = playerGoals + 1;
          if (newPGoals >= config.goals) {
            setWinner('player');
            setPhase('result');
          } else {
            const rp = { x: FIELD_W / 2, y: FIELD_H - 100 };
            const rb = { x: FIELD_W / 2, y: 100 };
            setPlayerPos(rp);
            setBotPos(rb);
            setBallPos({ ...rp });
            posRef.current = { player: rp, bot: rb, ball: rp };
          }
        }, 1200);
        cancelAnimationFrame(rafRef.current);
        return;
      }

      // Sincronizar bola com bot quando bot tem a bola
      if (ballOwner === 'bot') {
        const syncedBall = { x: newBot.x, y: newBot.y + 20 };
        posRef.current = { ...posRef.current, ball: syncedBall };
        setBallPos(syncedBall);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, joystick, obstaclePositions, ballOwner, selectedBall, config, level, botGoals, playerGoals, playSound]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setPhase('result'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // ── Joystick handlers ───────────────────────────────────────────────────
  const handleJoyStart = (cx, cy) => {
    if (!joyRef.current) return;
    const rect = joyRef.current.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joyCtrRef.current = center;
    updateJoy(cx, cy, center);
  };
  const updateJoy = (cx, cy, center) => {
    const c = center || joyCtrRef.current;
    if (!c) return;
    const dx = cx - c.x, dy = cy - c.y;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const scale = Math.min(mag, 40) / 40;
    const angle = Math.atan2(dy, dx);
    setJoystick({ x: Math.cos(angle) * scale, y: Math.sin(angle) * scale, active: true });
  };
  const handleJoyEnd = () => {
    joyCtrRef.current = null;
    setJoystick({ x: 0, y: 0, active: false });
  };

  // ── Chute ───────────────────────────────────────────────────────────────
  const handleShoot = () => {
    if (ballOwner !== 'player') return;
    // Chuta em direção ao gol do bot (topo)
    setBallOwner('bot');
    setShowGoalEffect(true);
    playSound('shoot');
    setTimeout(() => setShowGoalEffect(false), 1000);
  };

  // ── Menu principal ────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center gap-5 py-4 px-4 min-h-[80vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="text-5xl mb-2">⚽</motion.div>
          <h1 className="font-heading font-black text-2xl text-primary">Fut de Rua</h1>
          <p className="text-xs text-muted-foreground">Drible, passes e muitos gols!</p>
        </motion.div>

        {/* Seleção de fase */}
        <div className="w-full max-w-xs space-y-1.5">
          <p className="text-xs font-bold text-gray-500 uppercase text-center">Escolha o nível</p>
          {LEVELS.map((lv, i) => (
            <motion.button key={i} whileTap={{ scale: 0.97 }}
              onClick={() => setLevel(i)}
              className={`w-full py-2.5 px-4 rounded-xl border-2 text-left flex justify-between items-center transition-all ${level === i ? 'border-primary bg-primary/10' : 'border-border/30 bg-card'}`}>
              <div>
                <div className="font-bold text-sm">{lv.label}</div>
                <div className="text-[9px] text-muted-foreground">{lv.desc}</div>
              </div>
              {level === i && <span className="text-primary font-bold">✓</span>}
            </motion.button>
          ))}
        </div>

        {/* Seleção de bola */}
        <div className="w-full max-w-xs">
          <p className="text-xs font-bold text-gray-500 uppercase text-center mb-2">Escolha a bola</p>
          <div className="grid grid-cols-3 gap-1.5">
            {BALL_TYPES.map((b) => (
              <motion.button key={b.id} whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedBall(b)}
                className={`p-2 rounded-xl border-2 text-center transition-all ${selectedBall.id === b.id ? 'border-primary bg-primary/10' : 'border-border/30 bg-card'}`}>
                <div className="text-xl">{b.emoji}</div>
                <div className="text-[8px] font-bold leading-tight">{b.name}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Seleção de obstáculos */}
        <div className="w-full max-w-xs">
          <p className="text-xs font-bold text-gray-500 uppercase text-center mb-2">Elementos da rua (opcional)</p>
          <div className="grid grid-cols-4 gap-1.5">
            {OBSTACLE_TYPES.map((o) => (
              <motion.button key={o.id} whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedObstacles(prev => {
                  const ex = prev.find(p => p.id === o.id);
                  if (ex) return prev.filter(p => p.id !== o.id);
                  return [...prev, o];
                })}
                className={`p-2 rounded-xl border-2 text-center transition-all ${selectedObstacles.find(p => p.id === o.id) ? 'border-primary bg-primary/10' : 'border-border/30 bg-card'}`}>
                <div className="text-xl">{o.emoji}</div>
                <div className="text-[8px] font-bold leading-tight">{o.name}</div>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => initLevel(level)}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-pink-500 text-white font-heading font-black text-lg rounded-2xl shadow-lg">
          Jogar! ⚽
        </motion.button>
      </div>
    );
  }

  // ── Resultado ──────────────────────────────────────────────────────────
  if (phase === 'result') {
    const userWon = winner === 'player';
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4">
        <motion.div animate={{ rotate: userWon ? [0, 10, -10, 0] : 0 }} transition={{ repeat: Infinity, duration: 1 }}
          className="text-7xl">{userWon ? '🏆' : '😢'}</motion.div>
        <div className="text-center">
          <h2 className="font-heading font-black text-2xl mb-1">{userWon ? 'Você venceu!' : 'O bot venceu!'}</h2>
          <p className="text-muted-foreground">{playerGoals} × {botGoals}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPhase('menu')} className="px-6 py-3 bg-muted font-bold rounded-2xl">Menu</button>
          <button onClick={() => initLevel(level)} className="px-6 py-3 bg-primary text-white font-bold rounded-2xl">Jogar de novo</button>
        </div>
      </motion.div>
    );
  }

  // ── Jogo ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-2 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="bg-card rounded-xl px-3 py-1.5 text-xs font-bold">
          <span className="text-primary">{playerGoals}</span> × <span className="text-red-500">{botGoals}</span>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-3 py-1 text-xs font-bold text-primary">
          {config.label}
        </div>
        <div className={`rounded-xl px-3 py-1.5 text-xs font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}>
          ⏱ {timeLeft}s
        </div>
      </div>

      {/* Campo SVG */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: FIELD_W, height: FIELD_H, background: 'linear-gradient(180deg, #4a4a4a 0%, #5c5c5c 50%, #4a4a4a 100%)' }}>

        {/* Asfalto */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-600 via-gray-500 to-gray-600" />

        {/* Linhas do campo */}
        <svg width={FIELD_W} height={FIELD_H} className="absolute inset-0 opacity-30">
          <line x1="0" y1={FIELD_H/2} x2={FIELD_W} y2={FIELD_H/2} stroke="white" strokeWidth="1.5" strokeDasharray="8 6" />
          <circle cx={FIELD_W/2} cy={FIELD_H/2} r="35" stroke="white" strokeWidth="1.5" fill="none" />
          <line x1={FIELD_W/2} y1="0" x2={FIELD_W/2} y2={FIELD_H} stroke="white" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* Gol de cima (DO BOT — bot ataca para cá) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <div className="relative" style={{ width: GOAL_W, height: GOAL_H }}>
            {/* Rede */}
            <div className="absolute inset-0 bg-white/10 rounded-b-xl border-4 border-white/60 border-t-0"
              style={{ borderWidth: '0 4px 4px 4px' }} />
            {/* Linhas da rede */}
            {[...Array(6)].map((_, i) => (
              <div key={`v${i}`} className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${(i+1)*(100/7)}%` }} />
            ))}
            {[...Array(3)].map((_, i) => (
              <div key={`h${i}`} className="absolute left-0 right-0 h-px bg-white/20" style={{ top: `${(i+1)*(100/4)}%` }} />
            ))}
            {/* Trave */}
            <div className="absolute -top-1 left-0 right-0 h-1.5 bg-white/80 rounded-full" />
            <div className="absolute top-0 left-0 w-1 h-full bg-white/60 rounded-l" />
            <div className="absolute top-0 right-0 w-1 h-full bg-white/60 rounded-r" />
            {/* Chinelos (emoji) */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}>🩴</div>
          </div>
        </div>

        {/* Gol de baixo (DO JOGADOR — bot ataca aqui) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <div className="relative" style={{ width: GOAL_W, height: GOAL_H }}>
            <div className="absolute inset-0 bg-white/10 rounded-t-xl border-4 border-white/60 border-b-0"
              style={{ borderWidth: '4px 4px 0 4px' }} />
            {[...Array(6)].map((_, i) => (
              <div key={`bv${i}`} className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${(i+1)*(100/7)}%` }} />
            ))}
            {[...Array(3)].map((_, i) => (
              <div key={`bh${i}`} className="absolute left-0 right-0 h-px bg-white/20" style={{ top: `${(i+1)*(100/4)}%` }} />
            ))}
            <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-white/80 rounded-full" />
            <div className="absolute bottom-0 left-0 w-1 h-full bg-white/60 rounded-l" />
            <div className="absolute bottom-0 right-0 w-1 h-full bg-white/60 rounded-r" />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-2xl" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}>🩴</div>
          </div>
        </div>

        {/* Obstáculos */}
        {obstaclePositions.map((obs, i) => (
          <motion.div key={i}
            animate={obs.behavior === 'patrol' || obs.behavior === 'slow' ? { x: [obs.x - 20, obs.x + 20, obs.x - 20] } : {}}
            transition={{ duration: obs.behavior === 'slow' ? 6 : 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute text-3xl"
            style={{ left: obs.x - 16, top: obs.y - 16, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
            {obs.emoji}
          </motion.div>
        ))}

        {/* Jogador */}
        <motion.div animate={{ x: playerPos.x - PLAYER_R, y: playerPos.y - PLAYER_R }}
          className="absolute w-12 h-12 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">
          ⚽
        </motion.div>

        {/* Bot (goleiro defensivo) */}
        <motion.div animate={{ x: botPos.x - BOT_R, y: botPos.y - BOT_R }}
          className="absolute w-12 h-12 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">
          🤖
        </motion.div>

        {/* Bola */}
        {ballOwner === 'player' && (
          <motion.div animate={{ x: ballPos.x - BALL_R, y: ballPos.y - BALL_R }}
            className="absolute">
            <div className="text-2xl drop-shadow-md">{selectedBall.emoji}</div>
          </motion.div>
        )}
        {ballOwner === 'bot' && (
          <motion.div animate={{ x: ballPos.x - BALL_R, y: ballPos.y - BALL_R }}
            className="absolute">
            <div className="text-2xl drop-shadow-md">{selectedBall.emoji}</div>
          </motion.div>
        )}

        {/* Efeito gol */}
        <AnimatePresence>
          {showGoalEffect && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <motion.div animate={{ scale: [0.5, 1.2, 1], rotate: [-10, 10, 0] }} transition={{ duration: 0.4 }}
                className="text-5xl font-black text-white drop-shadow-lg">
                ⚽ GOL!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Efeito hit */}
        <AnimatePresence>
          {showHitEffect && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-4xl">💥</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indicador de posse */}
      <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${ballOwner === 'player' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
        {ballOwner === 'player' ? '⚽ Você tem a bola' : '🤖 Bot tem a bola'}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4 py-2">
        {/* Joystick */}
        <div ref={joyRef}
          className="w-28 h-28 rounded-full bg-black/20 border-4 border-white/30 relative flex items-center justify-center touch-none"
          onTouchStart={(e) => { e.preventDefault(); handleJoyStart(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={(e)  => { e.preventDefault(); updateJoy(e.touches[0].clientX, e.touches[0].clientY, null); }}
          onTouchEnd={(e)   => { e.preventDefault(); handleJoyEnd(); }}
          onMouseDown={(e)  => handleJoyStart(e.clientX, e.clientY)}
          onMouseMove={(e)  => e.buttons === 1 && updateJoy(e.clientX, e.clientY, null)}
          onMouseUp={handleJoyEnd}>
          <motion.div
            animate={{ x: joystick.x * 28, y: joystick.y * 28 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-10 h-10 rounded-full bg-white/80 shadow-lg" />
        </div>

        {/* Botão chutar — SEMPRE visível quando é a vez do jogador */}
        <motion.button whileTap={{ scale: 0.88 }}
          onClick={handleShoot}
          disabled={ballOwner !== 'player'}
          className={`px-6 py-4 rounded-2xl font-heading font-black text-base shadow-xl transition-all ${ballOwner === 'player'
            ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
          ⚽ CHUTAR!
        </motion.button>

        {/* Som / Voltar */}
        <div className="flex flex-col gap-2">
          <button onClick={() => setSoundEnabled(s => !s)}
            className="p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors">
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={() => { cancelAnimationFrame(rafRef.current); setPhase('menu'); }}
            className="p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
