import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PLAYERS_WITH_EVOLUTION,
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  UNIFORM_STYLES,
  BOOTS_STYLES,
  ACCESSORIES,
  LEVEL_SYSTEM,
  getUnlockedItems,
  createCustomAvatar,
  getFieldAvatar,
} from '@/lib/avatarSystem';
import { loadProfile, saveProfile } from '@/lib/playerProfile';
import { ChevronLeft, Star, Lock, Check, Sparkles, Zap, Award } from 'lucide-react';

function AvatarPreview({ player, customization, state = {} }) {
  const fieldAvatar = getFieldAvatar(player.id, customization, state);
  const { isRunning, isKicking, isCelebrating } = state;

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="relative w-48 h-48 bg-gradient-to-b from-sky-200 to-green-200 rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
        animate={isCelebrating ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: isCelebrating ? Infinity : 0, duration: 0.5 }}
      >
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-green-500 to-green-400" />
        {fieldAvatar?.effects?.map((effect, i) => (
          <motion.span key={i} className="absolute text-2xl"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-20, -60], x: (i - 1) * 30 }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            style={{ bottom: '40%', left: '50%' }}
          >
            {effect}
          </motion.span>
        ))}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-7xl"
          animate={isRunning ? { x: [-10, 10, -10] } : isKicking ? { rotate: [0, -15, 0] } : {}}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 0.3 }}
        >
          {fieldAvatar?.string || player.baseAvatar}
        </motion.div>
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Star className="w-3 h-3" /> Lv.{player.evolution.level}
        </div>
        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded-full text-xs font-bold capitalize">
          {player.evolution.stage}
        </div>
      </motion.div>
      <div className="mt-4 text-center">
        <h3 className="font-heading font-bold text-xl">{player.name}</h3>
        <p className="text-sm text-muted-foreground">{player.position}</p>
        <p className="text-xs text-primary italic">"{player.trait}"</p>
      </div>
    </div>
  );
}

function XPBar({ currentXP, level }) {
  const requiredXP = LEVEL_SYSTEM.getRequiredXP(level);
  const progress = (currentXP / requiredXP) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-bold">XP</span>
        <span>{currentXP} / {requiredXP}</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
          initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>
    </div>
  );
}

function ColorSelector({ colors, selected, onSelect, label }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <motion.button key={color.id || color} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(color.id || color)}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              selected === (color.id || color) ? 'border-primary scale-110 ring-2 ring-primary/30' : 'border-transparent'
            }`}
            style={{ backgroundColor: color.color || color }}
            title={color.label || color}
          />
        ))}
      </div>
    </div>
  );
}

function StyleSelector({ items, selected, onSelect, playerLevel = 1 }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => {
        const isLocked = item.minLevel && item.minLevel > playerLevel;
        return (
          <motion.button key={item.id}
            whileHover={!isLocked ? { scale: 1.05 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
            onClick={() => !isLocked && onSelect(item.id)}
            disabled={isLocked}
            className={`relative p-3 rounded-xl border-2 transition-all ${
              selected === item.id ? 'border-primary bg-primary/10'
                : isLocked ? 'border-muted bg-muted/30 opacity-50'
                : 'border-border/30 bg-card hover:border-primary/50'
            }`}
          >
            <span className="text-2xl block mb-1">{item.emoji}</span>
            <span className="text-[10px] font-bold block truncate">{item.name || item.label}</span>
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            {item.minLevel && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] px-1 py-0.5 rounded-full font-bold">
                Lv.{item.minLevel}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function AvatarCustomizer({ playerId, onClose, onSave }) {
  const profile = loadProfile();
  const savedEvolution = profile?.playerEvolution?.[playerId];
  const basePlayer = PLAYERS_WITH_EVOLUTION.find(p => p.id === playerId) || PLAYERS_WITH_EVOLUTION[0];
  const player = {
    ...basePlayer,
    evolution: savedEvolution || basePlayer.evolution,
  };

  const [activeTab, setActiveTab] = useState('appearance');
  const [previewState, setPreviewState] = useState({ isRunning: false, isKicking: false, isCelebrating: false });
  const [customization, setCustomization] = useState({
    skinTone: player.skinTone,
    hairStyle: player.hairStyle,
    hairColor: player.hairColor,
    uniformStyle: 'basic',
    uniformColor: '#E91E63',
    bootsStyle: 'basic',
    accessories: [],
    ...(profile?.avatarCustomization?.[playerId] || {}),
  });

  const updateCustomization = (key, value) => setCustomization(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const p = loadProfile();
    saveProfile({ ...p, avatarCustomization: { ...(p.avatarCustomization || {}), [playerId]: customization } });
    onSave?.(customization);
    onClose?.();
  };

  const triggerAnimation = (type) => {
    setPreviewState({ isRunning: false, isKicking: false, isCelebrating: false });
    setTimeout(() => setPreviewState({ [type]: true }), 50);
    setTimeout(() => setPreviewState({ [type]: false }), 2000);
  };

  const playerLevel = player.evolution.level;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="flex items-center gap-2 text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Voltar</span>
        </button>
        <h1 className="font-heading font-bold text-xl">Personalizar Avatar</h1>
        <button onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold">
          <Check className="w-4 h-4" /> Salvar
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <AvatarPreview player={player} customization={customization} state={previewState} />
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {[['isRunning', '🏃 Correr', 'bg-blue-500'], ['isKicking', '⚽ Chutar', 'bg-red-500'], ['isCelebrating', '🎉 Comemorar', 'bg-green-500']].map(([type, label, cls]) => (
          <motion.button key={type} whileTap={{ scale: 0.95 }} onClick={() => triggerAnimation(type)}
            className={`px-4 py-2 ${cls} text-white rounded-xl text-sm font-bold`}>
            {label}
          </motion.button>
        ))}
      </div>

      <div className="mb-6">
        <XPBar currentXP={player.evolution.xp} level={player.evolution.level} />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[['appearance', '👤', 'Aparência'], ['uniform', '👕', 'Uniforme'], ['boots', '👟', 'Chuteiras'], ['accessories', '✨', 'Acessórios']].map(([id, icon, label]) => (
          <motion.button key={id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap ${
              activeTab === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
            <span>{icon}</span>
            <span className="text-sm">{label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'appearance' && (
          <motion.div key="appearance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <ColorSelector label="Tom de pele" colors={SKIN_TONES} selected={customization.skinTone} onSelect={(id) => updateCustomization('skinTone', id)} />
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Estilo de cabelo</label>
              <StyleSelector items={HAIR_STYLES} selected={customization.hairStyle} onSelect={(id) => updateCustomization('hairStyle', id)} playerLevel={playerLevel} />
            </div>
            <ColorSelector label="Cor do cabelo" colors={HAIR_COLORS} selected={customization.hairColor} onSelect={(id) => updateCustomization('hairColor', id)} />
          </motion.div>
        )}

        {activeTab === 'uniform' && (
          <motion.div key="uniform" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Estilo do uniforme</label>
              <StyleSelector items={Object.values(UNIFORM_STYLES)} selected={customization.uniformStyle} onSelect={(id) => updateCustomization('uniformStyle', id)} playerLevel={playerLevel} />
            </div>
            <ColorSelector label="Cor do uniforme"
              colors={(UNIFORM_STYLES[customization.uniformStyle]?.colors || UNIFORM_STYLES.basic.colors).map(c => ({ id: c, color: c }))}
              selected={customization.uniformColor} onSelect={(c) => updateCustomization('uniformColor', c)} />
          </motion.div>
        )}

        {activeTab === 'boots' && (
          <motion.div key="boots" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Chuteiras</label>
              <StyleSelector items={BOOTS_STYLES} selected={customization.bootsStyle} onSelect={(id) => updateCustomization('bootsStyle', id)} playerLevel={playerLevel} />
            </div>
            {(() => {
              const boot = BOOTS_STYLES.find(b => b.id === customization.bootsStyle);
              return boot?.speedBonus > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Zap className="w-4 h-4" />
                    <span className="font-bold text-sm">Bônus de velocidade: +{boot.speedBonus}</span>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {activeTab === 'accessories' && (
          <motion.div key="accessories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            {Object.entries(ACCESSORIES).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">{category.charAt(0).toUpperCase() + category.slice(1)}</label>
                <StyleSelector items={items}
                  selected={customization.accessories.find(a => items.find(i => i.id === a.id))?.id}
                  onSelect={(id) => {
                    const item = items.find(i => i.id === id);
                    const exists = customization.accessories.find(a => a.id === id);
                    if (exists) updateCustomization('accessories', customization.accessories.filter(a => a.id !== id));
                    else if (customization.accessories.length < 3) updateCustomization('accessories', [...customization.accessories, item]);
                  }}
                  playerLevel={playerLevel}
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center">Máximo de 3 acessórios. Toque para adicionar/remover.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 bg-card border border-border/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-yellow-500" />
          <span className="font-bold">Próximo desbloqueio</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {player.evolution.level < 20
            ? `Suba para o nível ${player.evolution.level + 1} para desbloquear novos itens!`
            : 'Você atingiu o nível máximo! 🎉'}
        </p>
      </div>
    </div>
  );
}