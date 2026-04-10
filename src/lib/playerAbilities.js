const DEFAULT_ABILITY = {
  tecnica: 1, velocidade: 1, defesa: 1,
  effect: null, emoji: '⚽',
  desc: 'Jogadora equilibrada, sem habilidade especial.',
};

const ABILITIES = {
  // ── SEM DEFICIÊNCIA ─────────────────────────────────────────
  luna: {
    emoji: '🤟', effect: 'advance_after_2draws',
    desc: 'Ginga: após 2 empates seguidos, avança uma zona automaticamente!',
  },
  bela: {
    emoji: '💥', effect: 'double_advance_once',
    desc: 'Explosão: uma vez por jogo, uma vitória avança 2 zonas de uma vez!',
  },
  clara: {
    emoji: '🛡️', effect: 'no_retreat_once',
    desc: 'Muralha: uma vez por jogo, impede que a bola recue ao perder!',
  },
  sol: {
    emoji: '🤝', effect: 'draw_to_advance_once',
    desc: 'União: uma vez por jogo, transforma um empate em avanço!',
  },
  bia: {
    emoji: '🧠', effect: 'lose_to_draw_once',
    desc: 'Leitura: uma vez por jogo, transforma uma derrota em empate!',
  },
  // ── COM DEFICIÊNCIA ─────────────────────────────────────────
  ana: {
    emoji: '💥', effect: 'forced_win_once',
    desc: 'Vontade de Ferro: uma vez por jogo, garante uma vitória independente da jogada!',
  },
  iris: {
    emoji: '🔍', effect: 'reveal_bot_once',
    desc: 'Foco Total: uma vez por jogo, veja a jogada do bot antes de decidir!',
  },
  maya: {
    emoji: '🧩', effect: 'advance_after_2draws',
    desc: 'Padrão: reconhece repetições — após 2 empates, avança automaticamente!',
  },
  duda: {
    emoji: '🦻', effect: 'double_advance_once',
    desc: 'Intuição: uma vez por jogo, uma vitória avança 2 zonas de uma vez!',
  },
  lara: {
    emoji: '🦾', effect: 'no_retreat_once',
    desc: 'Resistência: uma vez por jogo, impede que a bola recue ao perder!',
  },
};

export function getAbility(playerId) {
  if (!playerId) return DEFAULT_ABILITY;
  const ability = ABILITIES[playerId];
  if (!ability) return DEFAULT_ABILITY;
  return {
    tecnica: 1, velocidade: 1, defesa: 1,
    effect: ability.effect || null,
    emoji:  ability.emoji  || '⚽',
    desc:   ability.desc   || 'Habilidade especial.',
  };
}
