import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { audio } from '@/lib/audioEngine';
import { bgMusic } from '@/lib/trainingMusic';
import { LevelBadge } from './TrainingHelpers';
import { earnGoldenStickerLocal } from '@/lib/goldenStickers';

export default function PursuitGame() {
  useEffect(() => { bgMusic.play('sport'); return () => bgMusic.stop(); }, []);
  const SIZE = 6;
  const [playerY, setPlayerY] = useState(SIZE - 1);
  const [playerX, setPlayerX] = useState(2);
  const [botX, setBotX] = useState(2);
  const [botY, setBotY] = useState(1);
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [goldenReward, setGoldenReward] = useState(null);
  const MAX = 5;

  const botFrequency = level <= 1 ? 2 : level <= 3 ? 1 : level <= 5 ? 2 : level <= 7 ? 1 : 2;
  const botRandom = level >= 4 && level <= 7;
  const botHidden = level >= 8;
  const botDiagonal = level >= 5;

  const moveBot = useCallback((px, py, bx, by) => {
    if (botRandom) {
      const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
      if (botDiagonal) dirs.push({ dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 });
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      return { nbx: bx + d.dx, nby: by + d.dy };
    }
    const dx = px - bx; const dy = py - by;
    if (botDiagonal) return { nbx: bx + Math.sign(dx), nby: by + Math.sign(dy) };
    if (Math.abs(dx) >= Math.abs(dy)) return { nbx: bx + Math.sign(dx), nby: by };
    return { nbx: bx, nby: by + Math.sign(dy) };
  }, [botDiagonal, botRandom]);

  const move = (dx, dy) => {
    if (done) return;
    const nx = Math.max(0, Math.min(SIZE - 1, playerX + dx));
    const ny = Math.max(0, Math.min(SIZE - 1, playerY + dy));
    if (ny === 0) { audio.playGoal(); setDone(true); setWon(true); setScore(s => s + 1); return; }
    const newMoveCount = moveCount + 1;
    setPlayerX(nx); setPlayerY(ny); setMoveCount(newMoveCount); audio.playDribble();
    if (newMoveCount % botFrequency === 0) {
      const { nbx, nby } = moveBot(nx, ny, botX, botY);
      const clampedX = Math.max(0, Math.min(SIZE - 1, nbx));
      const clampedY = Math.max(0, Math.min(SIZE - 1, nby));
      if (clampedX === nx && clampedY === ny) { setDone(true); setWon(false); audio.playLose(); }
      else { setBotX(clampedX); setBotY(clampedY); }
    }
  };

  const reset = () => {
    setAttempts(a => a + 1); setPlayerX(2); setPlayerY(SIZE - 1);
    setBotX(Math.floor(Math.random() * SIZE)); setBotY(1);
    setDone(false); setWon(false); setMoveCount(0);
  };

  const restart = () => {
    const newLevel = score >= 3 ? Math.min(level + 1, 10) : level;
    if (newLevel === 10 && level === 9 && score >= 3) { const gs = earnGoldenStickerLocal('Marcação'); setGoldenReward(gs); }
    setLevel(newLevel); setAttempts(0); setScore(0);
    setPlayerX(2); setPlayerY(SIZE - 1); setBotX(2); setBotY(1);
    setDone(false); setWon(false); setMoveCount(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-xl">🔥 Drible com Marcador</p>
          <p className="text-xs text-muted-foreground">{botHidden ? '👻 Marcadora invisível!' : botRandom ? `🎲 Imprevisível! A cada ${botFrequency} passo(s)` : 'Avance sem ser alcançada!'}</p>
        </div>
        <LevelBadge level={level} />
      </div>
      <div className="flex justify-center gap-4">
        <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">⚽ {score} gols</span>
        <span className="text-xs font-bold bg-muted text-muted-foreground px-3 py-1 rounded-full">🔄 {attempts}/{MAX}</span>
      </div>
      <div className="mx-auto rounded-2xl overflow-hidden border-2 border-green-900/40 shadow-xl" style={{ width: SIZE * 46 }}>
        <div className="h-9 flex items-center justify-center border-b-2 border-white/30" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
          <span className="text-sm font-bold text-white">🥅 ÁREA DO GOL</span>
        </div>
        <div style={{ background: '#22963a' }}>
          {Array.from({ length: SIZE }).map((_, row) => (
            <div key={row} className="flex">
              {Array.from({ length: SIZE }).map((_, col) => {
                const isPlayer = col === playerX && row === playerY;
                const isBot = col === botX && row === botY;
                return (
                  <motion.div key={col} className="flex items-center justify-center border border-white/8 text-2xl" style={{ width: 46, height: 46 }}
                    animate={isPlayer ? { scale: [1, 1.15, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2 }}>
                    {isPlayer && isBot ? '💥' : isPlayer ? '⚽' : isBot && !botHidden ? '👟' : ''}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="h-6 flex items-center justify-center border-t border-white/20" style={{ background: '#1a7a2e' }}>
          <span className="text-[10px] text-white/50 font-bold">▲ INÍCIO</span>
        </div>
      </div>
      {!done ? (
        <div className="flex flex-col items-center gap-2">
          <button onClick={() => move(0, -1)} className="w-16 h-14 bg-card border-2 border-border rounded-2xl font-bold text-2xl active:scale-90 transition-transform shadow-md select-none">↑</button>
          <div className="flex gap-2">
            <button onClick={() => move(-1, 0)} className="w-16 h-14 bg-card border-2 border-border rounded-2xl font-bold text-2xl active:scale-90 transition-transform shadow-md select-none">←</button>
            <div className="w-16 h-14 rounded-2xl bg-muted/30 flex items-center justify-center text-2xl">⚽</div>
            <button onClick={() => move(1, 0)} className="w-16 h-14 bg-card border-2 border-border rounded-2xl font-bold text-2xl active:scale-90 transition-transform shadow-md select-none">→</button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center space-y-3">
          <p className={`font-heading font-bold text-2xl ${won ? 'text-primary' : 'text-destructive'}`}>
            {won ? '⚽ GOL! Drible perfeito!' : '🔴 A marcadora te alcançou!'}
          </p>
          {attempts + 1 < MAX ? (
            <button onClick={reset} className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-heading font-bold">
              <RotateCcw className="w-4 h-4" /> Tentar ({attempts + 1}/{MAX})
            </button>
          ) : (
            <div className="space-y-2">
              <p className="font-heading font-bold text-xl">{score}/{MAX} gols! {score >= 3 ? '🌟 Incrível!' : '💪 Continue!'}</p>
              {goldenReward && score >= 3 && (
                <div className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 border-2 border-yellow-400 rounded-2xl p-3 text-center">
                  <p className="text-2xl">⭐</p>
                  <p className="font-heading font-bold text-yellow-700 dark:text-yellow-400 text-sm">Figurinha Dourada!</p>
                  <p className="font-mono font-bold text-yellow-600">{goldenReward.code}</p>
                </div>
              )}
              <button onClick={restart} className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-heading font-bold">
                <RotateCcw className="w-4 h-4" /> Novo Treino
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}