/**
 * Sistema de Álbum de Figurinhas - Molecas FC
 * 200 figurinhas totais organizadas em categorias
 */

// Configuração de raridades
export const RARITY = {
  common: { 
    id: 'common', 
    label: 'Comum', 
    color: '#9CA3AF', 
    bg: 'from-gray-400 to-gray-500',
    probability: 0.45,
    xpBonus: 10
  },
  uncommon: { 
    id: 'uncommon', 
    label: 'Incomum', 
    color: '#22C55E', 
    bg: 'from-green-400 to-green-600',
    probability: 0.25,
    xpBonus: 20
  },
  rare: { 
    id: 'rare', 
    label: 'Rara', 
    color: '#3B82F6', 
    bg: 'from-blue-400 to-blue-600',
    probability: 0.15,
    xpBonus: 35
  },
  epic: { 
    id: 'epic', 
    label: 'Épica', 
    color: '#A855F7', 
    bg: 'from-purple-500 to-purple-600',
    probability: 0.10,
    xpBonus: 60
  },
  legendary: { 
    id: 'legendary', 
    label: 'Lendária', 
    color: '#F59E0B', 
    bg: 'from-yellow-400 to-orange-500',
    probability: 0.04,
    xpBonus: 100
  },
  mythic: { 
    id: 'mythic', 
    label: 'Mítica', 
    color: '#EC4899', 
    bg: 'from-pink-500 to-rose-500',
    probability: 0.01,
    xpBonus: 200
  }
};

// Categorias de figurinhas
export const CATEGORIES = {
  brazil: { id: 'brazil', label: 'Brasil', emoji: '🇧🇷', color: '#22C55E' },
  world: { id: 'world', label: 'Mundo', emoji: '🌍', color: '#3B82F6' },
  icons: { id: 'icons', label: 'Ícones', emoji: '⭐', color: '#F59E0B' },
  national: { id: 'national', label: 'Seleções', emoji: '🏆', color: '#A855F7' },
  skills: { id: 'skills', label: 'Técnicas', emoji: '⚽', color: '#EC4899' }
};

// Fontes de obtenção
export const SOURCES = {
  english: { id: 'english', label: 'Lições de Inglês', emoji: '🇺🇸' },
  minigame: { id: 'minigame', label: 'Mini-games', emoji: '🎮' },
  story: { id: 'story', label: 'Modo História', emoji: '📖' },
  career: { id: 'career', label: 'Modo Carreira', emoji: '👑' },
  health: { id: 'health', label: 'Saúde da Atleta', emoji: '💜' },
  match: { id: 'match', label: 'Jogos', emoji: '⚽' },
  code: { id: 'code', label: 'Código de Troca', emoji: '🎁' },
  trade: { id: 'trade', label: 'Troca', emoji: '🔄' }
};

// === 70 FIGURINHAS DO BRASIL ===
// 20 Pioneiras + 30 Atuais + 20 Lendas históricas
export const BRAZIL_PLAYERS = [
  // PIONEIRAS - LENDÁRIAS (20)
  { id: 'bra_marta', name: 'Marta', emoji: '👑', rarity: 'mythic', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'A Rainha do Futebol - 6x Melhor do Mundo', sources: ['career', 'story'] },
  { id: 'bra_formiga', name: 'Formiga', emoji: '🐜', rarity: 'legendary', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'Recordista de Copas do Mundo (7 edições)', sources: ['career', 'story'] },
  { id: 'bra_sissi', name: 'Sissi', emoji: '🎩', rarity: 'legendary', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A Maga - Rainha da Copa de 99', sources: ['career', 'story'] },
  { id: 'bra_pretinha', name: 'Pretinha', emoji: '🔥', rarity: 'legendary', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Ícone do futebol feminino brasileiro', sources: ['career', 'minigame'] },
  { id: 'bra_katia', name: 'Kátia Cilene', emoji: '⚡', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Artilheira histórica da Seleção', sources: ['career', 'minigame'] },
  { id: 'bra_roseli', name: 'Roseli', emoji: '🥅', rarity: 'epic', category: 'brazil', position: 'Goleira', era: 'pioneer', description: 'Pioneira na meta brasileira', sources: ['career', 'minigame'] },
  { id: 'bra_fanta', name: 'Fanta', emoji: '🛡️', rarity: 'epic', category: 'brazil', position: 'Zagueira', era: 'pioneer', description: 'Referência na defesa', sources: ['career', 'minigame'] },
  { id: 'bra_meg', name: 'Meg', emoji: '🦋', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Velocista e dribladora nat', sources: ['career', 'minigame'] },
  { id: 'bra_cristiane', name: 'Cristiane', emoji: '🎯', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Artilheira olímpica - 3x medalhista', sources: ['career', 'minigame'] },
  { id: 'bra_aline', name: 'Aline Pelegrino', emoji: '🛡️', rarity: 'epic', category: 'brazil', position: 'Zagueira', era: 'pioneer', description: 'Capitã e líder de geração', sources: ['career', 'minigame'] },
  { id: 'bra_rosana', name: 'Rosana Augusto', emoji: '⚡', rarity: 'rare', category: 'brazil', position: 'Lateral', era: 'pioneer', description: 'Lateral ofensiva e combativa', sources: ['career', 'minigame'] },
  { id: 'bra_ester', name: 'Ester', emoji: '🎭', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A estrategista do meio-campo', sources: ['career', 'minigame'] },
  { id: 'bra_dani', name: 'Dani', emoji: '🎪', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Dribles e alegria em campo', sources: ['career', 'minigame'] },
  { id: 'bra_barbara', name: 'Bárbara', emoji: '🧤', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'pioneer', description: 'A goleira das defesas milagrosas', sources: ['career', 'minigame'] },
  { id: 'bra_elaine', name: 'Elaine', emoji: '💨', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'A velocista do ataque', sources: ['career', 'minigame'] },
  { id: 'bra_maycon', name: 'Maycon', emoji: '⚙️', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A motorzinho do time', sources: ['career', 'minigame'] },
  { id: 'bra_grazielle', name: 'Grazielle', emoji: '🌟', rarity: 'uncommon', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'A artilheira silenciosa', sources: ['minigame', 'match'] },
  { id: 'bra_andressa', name: 'Andressa Alves', emoji: '🎯', rarity: 'uncommon', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Finalizadora de geração', sources: ['minigame', 'match'] },
  { id: 'bra_rafinha', name: 'Rafinha', emoji: '⚡', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A armadora craque', sources: ['minigame', 'match'] },
  { id: 'bra_maurine', name: 'Maurine', emoji: '🎼', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A maestra em campo', sources: ['minigame', 'match'] },

  // JOGADORAS ATUAIS (30)
  { id: 'bra_debinha', name: 'Debinha', emoji: '🔮', rarity: 'epic', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A mágica dos gols importantes', sources: ['career', 'minigame'] },
  { id: 'bra_gabi_nunes', name: 'Gabi Nunes', emoji: '🦁', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A nova artilheira da Seleção', sources: ['career', 'minigame'] },
  { id: 'bra_yasmim', name: 'Yasmim', emoji: '🛡️', rarity: 'rare', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A muralha defensiva', sources: ['career', 'minigame'] },
  { id: 'bra_tamires', name: 'Tamires', emoji: '⚡', rarity: 'rare', category: 'brazil', position: 'Lateral', era: 'current', description: 'A lateral experiente', sources: ['career', 'minigame'] },
  { id: 'bra_angelina', name: 'Angelina', emoji: '🎼', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A maestra do meio', sources: ['career', 'minigame'] },
  { id: 'bra_leticia', name: 'Letícia Izidoro', emoji: '🧤', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'current', description: 'A nova guardiã da meta', sources: ['career', 'minigame'] },
  { id: 'bra_lauren', name: 'Lauren', emoji: '🌟', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A promessa do ataque', sources: ['career', 'minigame'] },
  { id: 'bra_vitoria_yaya', name: 'Vitória Yaya', emoji: '💫', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A joia do meio-campo', sources: ['career', 'minigame'] },
  { id: 'bra_tarciane', name: 'Tarciane', emoji: '🏰', rarity: 'rare', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A jovem defensora', sources: ['career', 'minigame'] },
  { id: 'bra_jheniffer', name: 'Jheniffer', emoji: '🎯', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A finalizadora nat', sources: ['career', 'minigame'] },
  { id: 'bra_ana_vitoria', name: 'Ana Vitória', emoji: '🎨', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A criadora de jogadas', sources: ['career', 'minigame'] },
  { id: 'bra_ludmila', name: 'Ludmila', emoji: '🚀', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A velocista do ataque', sources: ['career', 'minigame'] },
  { id: 'bra_gabi_portilho', name: 'Gabi Portilho', emoji: '⚡', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A ponta veloz', sources: ['career', 'minigame'] },
  { id: 'bra_fernanda_lemos', name: 'Fernanda Lemos', emoji: '🎭', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A armadora de jogadas', sources: ['minigame', 'match'] },
  { id: 'bra_thais_maga', name: 'Thais Magalhães', emoji: '🛡️', rarity: 'uncommon', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A defensora sólida', sources: ['minigame', 'match'] },
  { id: 'bra_bruna_souza', name: 'Bruna Souza', emoji: '🎪', rarity: 'uncommon', category: 'brazil', position: 'Atacante', era: 'current', description: 'A dribladora habilidosa', sources: ['minigame', 'match'] },
  { id: 'bra_luana', name: 'Luana', emoji: '⚙️', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A combativa do meio', sources: ['minigame', 'match'] },
  { id: 'bra_fernanda_palermo', name: 'Fernanda Palermo', emoji: '📋', rarity: 'uncommon', category: 'brazil', position: 'Árbitra', era: 'current', description: 'A árbitra da final olímpica', sources: ['career', 'code'] },
  { id: 'bra_kathellen', name: 'Kathellen', emoji: '🛡️', rarity: 'uncommon', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A defensora de ferro', sources: ['minigame', 'match'] },
  { id: 'bra_bia_zaneratto', name: 'Bia Zaneratto', emoji: '🦁', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A capitã artilheira', sources: ['career', 'minigame'] },
  { id: 'bra_ana_paula', name: 'Ana Paula', emoji: '🧤', rarity: 'uncommon', category: 'brazil', position: 'Goleira', era: 'current', description: 'A goleira de penalidades', sources: ['minigame', 'match'] },
  { id: 'bra_duda_sampaio', name: 'Duda Sampaio', emoji: '⚡', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A jovem promessa', sources: ['minigame', 'match'] },
  { id: 'bra_jujuba', name: 'Jujuba', emoji: '🍬', rarity: 'uncommon', category: 'brazil', position: 'Atacante', era: 'current', description: 'A artilheira sub-20', sources: ['minigame', 'match'] },
  { id: 'bra_carol_nogueira', name: 'Carol Nogueira', emoji: '🛡️', rarity: 'common', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A defensora técnica', sources: ['minigame', 'match'] },
  { id: 'bra_mayara', name: 'Mayara', emoji: '⚙️', rarity: 'common', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A volante de marcação', sources: ['minigame', 'match'] },
  { id: 'bra_gabi_camargo', name: 'Gabi Camargo', emoji: '⚡', rarity: 'common', category: 'brazil', position: 'Lateral', era: 'current', description: 'A lateral ofensiva', sources: ['minigame', 'match'] },
  { id: 'bra_mileninha', name: 'Mileninha', emoji: '🌟', rarity: 'common', category: 'brazil', position: 'Atacante', era: 'current', description: 'A jovem revelação', sources: ['minigame', 'match'] },
  { id: 'bra_nycole', name: 'Nycole', emoji: '💨', rarity: 'common', category: 'brazil', position: 'Atacante', era: 'current', description: 'A velocista das pontas', sources: ['minigame', 'match'] },
  { id: 'bra_rilany', name: 'Rilany', emoji: '🛡️', rarity: 'common', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A zagueira aérea', sources: ['minigame', 'match'] },
  { id: 'bra_patricia', name: 'Patrícia', emoji: '🧤', rarity: 'common', category: 'brazil', position: 'Goleira', era: 'current', description: 'A goleira segura', sources: ['minigame', 'match'] },

  // LENDAS HISTÓRICAS DO BRASIL (20)
  { id: 'bra_nalvinha', name: 'Nalvinha', emoji: '👑', rarity: 'legendary', category: 'brazil', position: 'Atacante', era: 'legend', description: 'A primeira estrela do futebol feminino brasileiro', sources: ['career', 'story'] },
  { id: 'bra_marta_2015', name: 'Marta 2015', emoji: '🏆', rarity: 'mythic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Marta na Copa do Mundo 2015', sources: ['career', 'story'] },
  { id: 'bra_marta_2007', name: 'Marta 2007', emoji: '🥈', rarity: 'mythic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Marta vice-campeã mundial', sources: ['career', 'story'] },
  { id: 'bra_formiga_2019', name: 'Formiga 2019', emoji: '🐜', rarity: 'legendary', category: 'brazil', position: 'Meio-campo', era: 'legend', description: 'Formiga na Copa de 2019', sources: ['career', 'story'] },
  { id: 'bra_cristiane_olimpiadas', name: 'Cristiane Olimpíadas', emoji: '🥇', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Cristiane medalhista olímpica', sources: ['career', 'story'] },
  { id: 'bra_sissi_1999', name: 'Sissi 1999', emoji: '🎩', rarity: 'legendary', category: 'brazil', position: 'Meio-campo', era: 'legend', description: 'Sissi artilheira da Copa de 99', sources: ['career', 'story'] },
  { id: 'bra_pretinha_2004', name: 'Pretinha 2004', emoji: '🔥', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Pretinha medalha de prata', sources: ['career', 'story'] },
  { id: 'bra_mirandinha', name: 'Mirandinha', emoji: '⚡', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'A pioneira do futebol feminino', sources: ['career', 'story'] },
  { id: 'bra_selma', name: 'Selma', emoji: '🛡️', rarity: 'rare', category: 'brazil', position: 'Zagueira', era: 'legend', description: 'A capitã de 99', sources: ['career', 'minigame'] },
  { id: 'bra_marisa', name: 'Marisa', emoji: '🥅', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'legend', description: 'A goleira de 99', sources: ['career', 'minigame'] },
  { id: 'bra_cidinha', name: 'Cidinha', emoji: '⚡', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'legend', description: 'A velocista de 99', sources: ['career', 'minigame'] },
  { id: 'bra_katia_2004', name: 'Kátia 2004', emoji: '🥈', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Kátia medalha de prata', sources: ['career', 'story'] },
  { id: 'bra_andreia_suntaque', name: 'Andreia Suntaque', emoji: '🧤', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'legend', description: 'A goleira da geração de ouro', sources: ['career', 'minigame'] },
  { id: 'bra_tania_marquezine', name: 'Tânia Marquezine', emoji: '🛡️', rarity: 'rare', category: 'brazil', position: 'Zagueira', era: 'legend', description: 'A zagueira da geração de ouro', sources: ['career', 'minigame'] },
  { id: 'bra_simone_gomes', name: 'Simone Gomes', emoji: '⚙️', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'legend', description: 'A volante de 2004', sources: ['minigame', 'match'] },
  { id: 'bra_preta', name: 'Preta', emoji: '🎪', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'legend', description: 'A meia de 2007', sources: ['minigame', 'match'] },
  { id: 'bra_danielle', name: 'Danielle', emoji: '⚡', rarity: 'uncommon', category: 'brazil', position: 'Lateral', era: 'legend', description: 'A lateral de 2007', sources: ['minigame', 'match'] },
  { id: 'bra_andreia_rosa', name: 'Andreia Rosa', emoji: '🛡️', rarity: 'uncommon', category: 'brazil', position: 'Zagueira', era: 'legend', description: 'A zagueira de 2007', sources: ['minigame', 'match'] },
  { id: 'bra_bárbara_2011', name: 'Bárbara 2011', emoji: '🧤', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'legend', description: 'Bárbara na Copa de 2011', sources: ['career', 'minigame'] }
];

// === 50 FIGURINHAS DO MUNDO ===
export const WORLD_PLAYERS = [
  // LENDÁRIAS MUNDIAIS (15)
  { id: 'world_rapinoe', name: 'Megan Rapinoe', emoji: '🌈', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Ícone do futebol e ativismo', sources: ['career', 'story'] },
  { id: 'world_alex_morgan', name: 'Alex Morgan', emoji: '🦁', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Estrela americana multicampeã', sources: ['career', 'story'] },
  { id: 'world_birgit_prinz', name: 'Birgit Prinz', emoji: '👑', rarity: 'legendary', category: 'world', country: 'DE', position: 'Atacante', description: 'Lenda alemã - 5x Melhor do Mundo', sources: ['career', 'story'] },
  { id: 'world_mia_hamm', name: 'Mia Hamm', emoji: '⚽', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Pioneira do futebol feminino', sources: ['career', 'story'] },
  { id: 'world_abby_wambach', name: 'Abby Wambach', emoji: '🎯', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Recordista de gols da seleção americana', sources: ['career', 'story'] },
  { id: 'world_hope_solo', name: 'Hope Solo', emoji: '🧤', rarity: 'legendary', category: 'world', country: 'US', position: 'Goleira', description: 'A goleira imbatível', sources: ['career', 'story'] },
  { id: 'world_sun_wen', name: 'Sun Wen', emoji: '☀️', rarity: 'legendary', category: 'world', country: 'CN', position: 'Atacante', description: 'A rainha do futebol chinês', sources: ['career', 'story'] },
  { id: 'world_hege_riise', name: 'Hege Riise', emoji: '🇳🇴', rarity: 'legendary', category: 'world', country: 'NO', position: 'Meio-campo', description: 'A lenda norueguesa', sources: ['career', 'story'] },
  { id: 'world_lily_parr', name: 'Lily Parr', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rarity: 'mythic', category: 'world', country: 'GB', position: 'Atacante', description: 'A primeira estrela do futebol feminino', sources: ['career', 'story'] },
  { id: 'world_michelle_akers', name: 'Michelle Akers', emoji: '🇺🇸', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Lenda americana dos anos 90', sources: ['career', 'story'] },
  { id: 'world_nadine_angerer', name: 'Nadine Angerer', emoji: '🇩🇪', rarity: 'legendary', category: 'world', country: 'DE', position: 'Goleira', description: 'A goleira alemã campeã', sources: ['career', 'story'] },
  { id: 'world_renate_lingor', name: 'Renate Lingor', emoji: '🇩🇪', rarity: 'epic', category: 'world', country: 'DE', position: 'Meio-campo', description: 'A meia alemã campeã mundial', sources: ['career', 'minigame'] },
  { id: 'world_bettina_wiegmann', name: 'Bettina Wiegmann', emoji: '🇩🇪', rarity: 'epic', category: 'world', country: 'DE', position: 'Meio-campo', description: 'A capitã alemã campeã', sources: ['career', 'minigame'] },
  { id: 'world_carolina_morace', name: 'Carolina Morace', emoji: '🇮🇹', rarity: 'epic', category: 'world', country: 'IT', position: 'Atacante', description: 'A italiana artilheira', sources: ['career', 'minigame'] },
  { id: 'world_linda_medalen', name: 'Linda Medalen', emoji: '🇳🇴', rarity: 'epic', category: 'world', country: 'NO', position: 'Atacante', description: 'A norueguesa campeã mundial', sources: ['career', 'minigame'] },

  // ESTRELAS ATUAIS (35)
  { id: 'world_alexia_putellas', name: 'Alexia Putellas', emoji: '🔥', rarity: 'epic', category: 'world', country: 'ES', position: 'Meio-campo', description: '2x Melhor do Mundo - Rainha do Barça', sources: ['career', 'minigame'] },
  { id: 'world_aitana_bonmati', name: 'Aitana Bonmatí', emoji: '✨', rarity: 'epic', category: 'world', country: 'ES', position: 'Meio-campo', description: 'A joia espanhola - Bola de Ouro', sources: ['career', 'minigame'] },
  { id: 'world_sam_kerr', name: 'Sam Kerr', emoji: '🦘', rarity: 'epic', category: 'world', country: 'AU', position: 'Atacante', description: 'A artilheira australiana', sources: ['career', 'minigame'] },
  { id: 'world_vivianne_miedema', name: 'Vivianne Miedema', emoji: '🇳🇱', rarity: 'epic', category: 'world', country: 'NL', position: 'Atacante', description: 'A máquina de gols holandesa', sources: ['career', 'minigame'] },
  { id: 'world_lieke_martens', name: 'Lieke Martens', emoji: '🎩', rarity: 'epic', category: 'world', country: 'NL', position: 'Meio-campo', description: 'A maga holandesa', sources: ['career', 'minigame'] },
  { id: 'world_wendie_renard', name: 'Wendie Renard', emoji: '🏰', rarity: 'epic', category: 'world', country: 'FR', position: 'Zagueira', description: 'A capitã do Lyon', sources: ['career', 'minigame'] },
  { id: 'world_ada_hegerberg', name: 'Ada Hegerberg', emoji: '⚔️', rarity: 'epic', category: 'world', country: 'NO', position: 'Atacante', description: 'A guerreira norueguesa', sources: ['career', 'minigame'] },
  { id: 'world_amandine_henry', name: 'Amandine Henry', emoji: '🎼', rarity: 'epic', category: 'world', country: 'FR', position: 'Meio-campo', description: 'A maestra francesa', sources: ['career', 'minigame'] },
  { id: 'world_eugenie_le_sommer', name: 'Eugénie Le Sommer', emoji: '🇫🇷', rarity: 'epic', category: 'world', country: 'FR', position: 'Atacante', description: 'A artilheira francesa', sources: ['career', 'minigame'] },
  { id: 'world_saki_kumagai', name: 'Saki Kumagai', emoji: '🇯🇵', rarity: 'epic', category: 'world', country: 'JP', position: 'Zagueira', description: 'A líder japonesa', sources: ['career', 'minigame'] },
  { id: 'world_asako_takakura', name: 'Asako Takakura', emoji: '🗾', rarity: 'epic', category: 'world', country: 'JP', position: 'Meio-campo', description: 'A lenda japonesa', sources: ['career', 'code'] },
  { id: 'world_homare_sawa', name: 'Homare Sawa', emoji: '🇯🇵', rarity: 'epic', category: 'world', country: 'JP', position: 'Meio-campo', description: 'A eterna capitã do Japão', sources: ['career', 'code'] },
  { id: 'world_carli_lloyd', name: 'Carli Lloyd', emoji: '🇺🇸', rarity: 'epic', category: 'world', country: 'US', position: 'Meio-campo', description: 'A heroína de duas finais', sources: ['career', 'code'] },
  { id: 'world_julie_ertz', name: 'Julie Ertz', emoji: '🛡️', rarity: 'epic', category: 'world', country: 'US', position: 'Zagueira', description: 'A muralha americana', sources: ['career', 'minigame'] },
  { id: 'world_tobin_heath', name: 'Tobin Heath', emoji: '🎨', rarity: 'epic', category: 'world', country: 'US', position: 'Atacante', description: 'A artista das dribladas', sources: ['career', 'minigame'] },
  { id: 'world_christen_press', name: 'Christen Press', emoji: '⚡', rarity: 'epic', category: 'world', country: 'US', position: 'Atacante', description: 'A finalizadora precisa', sources: ['career', 'minigame'] },
  { id: 'world_lucy_bronze', name: 'Lucy Bronze', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rarity: 'rare', category: 'world', country: 'GB', position: 'Lateral', description: 'A melhor lateral do mundo', sources: ['career', 'minigame'] },
  { id: 'world_fran_kirby', name: 'Fran Kirby', emoji: '🦁', rarity: 'rare', category: 'world', country: 'GB', position: 'Meio-campo', description: 'A joia inglesa', sources: ['career', 'minigame'] },
  { id: 'world_beth_mead', name: 'Beth Mead', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rarity: 'rare', category: 'world', country: 'GB', position: 'Atacante', description: 'A artilheira da Euro', sources: ['career', 'minigame'] },
  { id: 'world_lauren_james', name: 'Lauren James', emoji: '💎', rarity: 'rare', category: 'world', country: 'GB', position: 'Atacante', description: 'A jovem estrela inglesa', sources: ['career', 'minigame'] },
  { id: 'world_jenni_hermoso', name: 'Jenni Hermoso', emoji: '🇪🇸', rarity: 'rare', category: 'world', country: 'ES', position: 'Meio-campo', description: 'A artilheira espanhola', sources: ['career', 'minigame'] },
  { id: 'world_irene_paredes', name: 'Irene Paredes', emoji: '🛡️', rarity: 'rare', category: 'world', country: 'ES', position: 'Zagueira', description: 'A defensora espanhola', sources: ['career', 'minigame'] },
  { id: 'world_lea_schuller', name: 'Lea Schüller', emoji: '🇩🇪', rarity: 'rare', category: 'world', country: 'DE', position: 'Atacante', description: 'A nova artilheira alemã', sources: ['career', 'minigame'] },
  { id: 'world_lina_magull', name: 'Lina Magull', emoji: '🎭', rarity: 'rare', category: 'world', country: 'DE', position: 'Meio-campo', description: 'A criadora alemã', sources: ['career', 'minigame'] },
  { id: 'world_kadidiatou_diani', name: 'Kadidiatou Diani', emoji: '🇫🇷', rarity: 'rare', category: 'world', country: 'FR', position: 'Atacante', description: 'A velocista francesa', sources: ['career', 'minigame'] },
  { id: 'world_selma_bacha', name: 'Selma Bacha', emoji: '🇫🇷', rarity: 'rare', category: 'world', country: 'FR', position: 'Lateral', description: 'A lateral ofensiva', sources: ['career', 'minigame'] },
  { id: 'world_barbara_bonanse', name: 'Bárbara Bonansea', emoji: '🇮🇹', rarity: 'rare', category: 'world', country: 'IT', position: 'Atacante', description: 'A estrela italiana', sources: ['career', 'minigame'] },
  { id: 'world_cristiana_girelli', name: 'Cristiana Girelli', emoji: '🇮🇹', rarity: 'rare', category: 'world', country: 'IT', position: 'Atacante', description: 'A artilheira italiana', sources: ['career', 'minigame'] },
  { id: 'world_mana_iwabuchi', name: 'Mana Iwabuchi', emoji: '🇯🇵', rarity: 'rare', category: 'world', country: 'JP', position: 'Atacante', description: 'A pequena gigante japonesa', sources: ['career', 'minigame'] },
  { id: 'world_yui_hasegawa', name: 'Yui Hasegawa', emoji: '🇯🇵', rarity: 'rare', category: 'world', country: 'JP', position: 'Meio-campo', description: 'A armadora japonesa', sources: ['career', 'minigame'] },
  { id: 'world_sam_mewis', name: 'Sam Mewis', emoji: '🇺🇸', rarity: 'rare', category: 'world', country: 'US', position: 'Meio-campo', description: 'A torre de poder americana', sources: ['career', 'minigame'] },
  { id: 'world_rose_lavelle', name: 'Rose Lavelle', emoji: '🌹', rarity: 'rare', category: 'world', country: 'US', position: 'Meio-campo', description: 'A dribladora americana', sources: ['career', 'minigame'] },
  { id: 'world_lindsey_horan', name: 'Lindsey Horan', emoji: '🇺🇸', rarity: 'rare', category: 'world', country: 'US', position: 'Meio-campo', description: 'A capitã americana', sources: ['career', 'minigame'] },
  { id: 'world_sophia_smith', name: 'Sophia Smith', emoji: '⭐', rarity: 'rare', category: 'world', country: 'US', position: 'Atacante', description: 'A nova estrela americana', sources: ['career', 'minigame'] },
  { id: 'world_trinity_rodman', name: 'Trinity Rodman', emoji: '⚡', rarity: 'rare', category: 'world', country: 'US', position: 'Atacante', description: 'A jovem promessa', sources: ['career', 'minigame'] }
];

// === 20 FIGURINHAS DE ÍCONES DO FUTEBOL ===
export const ICONS = [
  { id: 'icon_bola_ouro', name: 'Bola de Ouro', emoji: '⚽', rarity: 'legendary', category: 'icons', description: 'O troféu máximo do futebol feminino', sources: ['career', 'story'] },
  { id: 'icon_trofeu_copa', name: 'Troféu da Copa', emoji: '🏆', rarity: 'legendary', category: 'icons', description: 'O sonho de toda jogadora', sources: ['career', 'story'] },
  { id: 'icon_chuteira_ouro', name: 'Chuteira de Ouro', emoji: '👟', rarity: 'epic', category: 'icons', description: 'Para as maiores artilheiras', sources: ['minigame', 'career'] },
  { id: 'icon_luva_ouro', name: 'Luva de Ouro', emoji: '🧤', rarity: 'epic', category: 'icons', description: 'Defesas impecáveis merecem', sources: ['minigame', 'career'] },
  { id: 'icon_apito', name: 'Apito de Ouro', emoji: '📢', rarity: 'rare', category: 'icons', description: 'O árbitro apitou, é gol!', sources: ['minigame', 'match'] },
  { id: 'icon_rede_gol', name: 'Rede do Gol', emoji: '🥅', rarity: 'rare', category: 'icons', description: 'Balançou a rede!', sources: ['minigame', 'match'] },
  { id: 'icon_camisa_10', name: 'Camisa 10', emoji: '🔟', rarity: 'rare', category: 'icons', description: 'O número dos craques', sources: ['career', 'minigame'] },
  { id: 'icon_bandeira_corner', name: 'Bandeira de Corner', emoji: '🚩', rarity: 'uncommon', category: 'icons', description: 'Cobrança de canto', sources: ['minigame', 'match'] },
  { id: 'icon_cartao_vermelho', name: 'Cartão Vermelho', emoji: '🟥', rarity: 'uncommon', category: 'icons', description: 'Expulsão!', sources: ['minigame', 'match'] },
  { id: 'icon_cartao_amarelo', name: 'Cartão Amarelo', emoji: '🟨', rarity: 'common', category: 'icons', description: 'Advertência!', sources: ['minigame', 'match'] },
  { id: 'icon_substituicao', name: 'Substituição', emoji: '🔄', rarity: 'common', category: 'icons', description: 'Entra sangue novo', sources: ['minigame', 'match'] },
  { id: 'icon_var', name: 'VAR', emoji: '📺', rarity: 'uncommon', category: 'icons', description: 'Revisão de jogada', sources: ['minigame', 'match'] },
  { id: 'icon_escudo_time', name: 'Escudo de Clube', emoji: '🛡️', rarity: 'rare', category: 'icons', description: 'Defenda suas cores', sources: ['career', 'minigame'] },
  { id: 'icon_chuteira_trava', name: 'Chuteira de Trava', emoji: '👢', rarity: 'common', category: 'icons', description: 'Equipamento de jogo', sources: ['minigame', 'match'] },
  { id: 'icon_caneleira', name: 'Caneleira', emoji: '🦵', rarity: 'common', category: 'icons', description: 'Proteção necessária', sources: ['minigame', 'match'] },
  { id: 'icon_faixa_capitao', name: 'Faixa de Capitã', emoji: '©️', rarity: 'uncommon', category: 'icons', description: 'A líder do time', sources: ['career', 'match'] },
  { id: 'icon_trofeu_artilheira', name: 'Troféu Artilheira', emoji: '🎯', rarity: 'epic', category: 'icons', description: 'A maior goleadora', sources: ['career', 'minigame'] },
  { id: 'icon_medalha_ouro', name: 'Medalha de Ouro', emoji: '🥇', rarity: 'legendary', category: 'icons', description: 'Campeã olímpica!', sources: ['career', 'story'] },
  { id: 'icon_medalha_prata', name: 'Medalha de Prata', emoji: '🥈', rarity: 'epic', category: 'icons', description: 'Vice-campeã!', sources: ['career', 'story'] },
  { id: 'icon_medalha_bronze', name: 'Medalha de Bronze', emoji: '🥉', rarity: 'rare', category: 'icons', description: 'No pódio!', sources: ['career', 'story'] }
];

// === 50 FIGURINHAS DE SELEÇÕES ===
export const NATIONAL_TEAMS = [
  // AMÉRICA DO SUL (10)
  { id: 'nat_brasil', name: 'Seleção Brasileira', emoji: '🇧🇷', rarity: 'epic', category: 'national', country: 'BR', description: 'As Guerreiras', sources: ['career', 'story'] },
  { id: 'nat_argentina', name: 'Seleção Argentina', emoji: '🇦🇷', rarity: 'rare', category: 'national', country: 'AR', description: 'As Albicelestes', sources: ['career', 'minigame'] },
  { id: 'nat_colombia', name: 'Seleção Colombiana', emoji: '🇨🇴', rarity: 'rare', category: 'national', country: 'CO', description: 'As Cafeteras', sources: ['career', 'minigame'] },
  { id: 'nat_chile', name: 'Seleção Chilena', emoji: '🇨🇱', rarity: 'uncommon', category: 'national', country: 'CL', description: 'La Roja', sources: ['career', 'minigame'] },
  { id: 'nat_uruguai', name: 'Seleção Uruguaia', emoji: '🇺🇾', rarity: 'uncommon', category: 'national', country: 'UY', description: 'As Celestes', sources: ['career', 'minigame'] },
  { id: 'nat_paraguai', name: 'Seleção Paraguaia', emoji: '🇵🇾', rarity: 'uncommon', category: 'national', country: 'PY', description: 'As Guaranis', sources: ['career', 'minigame'] },
  { id: 'nat_equador', name: 'Seleção Equatoriana', emoji: '🇪🇨', rarity: 'common', category: 'national', country: 'EC', description: 'As Tricolores', sources: ['career', 'minigame'] },
  { id: 'nat_venezuela', name: 'Seleção Venezuelana', emoji: '🇻🇪', rarity: 'common', category: 'national', country: 'VE', description: 'As Vinotintos', sources: ['career', 'minigame'] },
  { id: 'nat_peru', name: 'Seleção Peruana', emoji: '🇵🇪', rarity: 'common', category: 'national', country: 'PE', description: 'As Incas', sources: ['career', 'minigame'] },
  { id: 'nat_bolivia', name: 'Seleção Boliviana', emoji: '🇧🇴', rarity: 'common', category: 'national', country: 'BO', description: 'As Altiplánicas', sources: ['career', 'minigame'] },

  // EUROPA (20)
  { id: 'nat_alemanha', name: 'Seleção Alemã', emoji: '🇩🇪', rarity: 'epic', category: 'national', country: 'DE', description: 'Die Mannschaft', sources: ['career', 'story'] },
  { id: 'nat_estados_unidos', name: 'Seleção Americana', emoji: '🇺🇸', rarity: 'epic', category: 'national', country: 'US', description: 'USWNT', sources: ['career', 'story'] },
  { id: 'nat_inglaterra', name: 'Seleção Inglesa', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rarity: 'epic', category: 'national', country: 'GB', description: 'The Lionesses', sources: ['career', 'story'] },
  { id: 'nat_franca', name: 'Seleção Francesa', emoji: '🇫🇷', rarity: 'epic', category: 'national', country: 'FR', description: 'Les Bleues', sources: ['career', 'story'] },
  { id: 'nat_espanha', name: 'Seleção Espanhola', emoji: '🇪🇸', rarity: 'epic', category: 'national', country: 'ES', description: 'La Roja', sources: ['career', 'story'] },
  { id: 'nat_holanda', name: 'Seleção Holandesa', emoji: '🇳🇱', rarity: 'rare', category: 'national', country: 'NL', description: 'Oranje Leeuwinnen', sources: ['career', 'minigame'] },
  { id: 'nat_suecia', name: 'Seleção Sueca', emoji: '🇸🇪', rarity: 'rare', category: 'national', country: 'SE', description: 'Blågult', sources: ['career', 'minigame'] },
  { id: 'nat_noruega', name: 'Seleção Norueguesa', emoji: '🇳🇴', rarity: 'rare', category: 'national', country: 'NO', description: 'Gresshoppene', sources: ['career', 'minigame'] },
  { id: 'nat_italia', name: 'Seleção Italiana', emoji: '🇮🇹', rarity: 'rare', category: 'national', country: 'IT', description: 'Le Azzurre', sources: ['career', 'minigame'] },
  { id: 'nat_dinamarca', name: 'Seleção Dinamarquesa', emoji: '🇩🇰', rarity: 'uncommon', category: 'national', country: 'DK', description: 'De Rød-Hvide', sources: ['career', 'minigame'] },
  { id: 'nat_suica', name: 'Seleção Suíça', emoji: '🇨🇭', rarity: 'uncommon', category: 'national', country: 'CH', description: 'La Nati', sources: ['career', 'minigame'] },
  { id: 'nat_austria', name: 'Seleção Austríaca', emoji: '🇦🇹', rarity: 'uncommon', category: 'national', country: 'AT', description: 'Das Nationalteam', sources: ['career', 'minigame'] },
  { id: 'nat_belgica', name: 'Seleção Belga', emoji: '🇧🇪', rarity: 'uncommon', category: 'national', country: 'BE', description: 'The Red Flames', sources: ['career', 'minigame'] },
  { id: 'nat_portugal', name: 'Seleção Portuguesa', emoji: '🇵🇹', rarity: 'uncommon', category: 'national', country: 'PT', description: 'As Navegadoras', sources: ['career', 'minigame'] },
  { id: 'nat_escocia', name: 'Seleção Escocesa', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', rarity: 'uncommon', category: 'national', country: 'GB', description: 'The Tartan Terriers', sources: ['career', 'minigame'] },
  { id: 'nat_pais_de_gales', name: 'Seleção do País de Gales', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', rarity: 'common', category: 'national', country: 'GB', description: 'The Dragons', sources: ['career', 'minigame'] },
  { id: 'nat_irlanda', name: 'Seleção Irlandesa', emoji: '🇮🇪', rarity: 'common', category: 'national', country: 'IE', description: 'The Girls in Green', sources: ['career', 'minigame'] },
  { id: 'nat_russia', name: 'Seleção Russa', emoji: '🇷🇺', rarity: 'uncommon', category: 'national', country: 'RU', description: 'The Russian Bears', sources: ['career', 'minigame'] },
  { id: 'nat_polonia', name: 'Seleção Polonesa', emoji: '🇵🇱', rarity: 'common', category: 'national', country: 'PL', description: 'The Polish Eagles', sources: ['career', 'minigame'] },

  // ÁSIA E OCEANIA (10)
  { id: 'nat_japao', name: 'Seleção Japonesa', emoji: '🇯🇵', rarity: 'epic', category: 'national', country: 'JP', description: 'Nadeshiko Japan', sources: ['career', 'story'] },
  { id: 'nat_australia', name: 'Seleção Australiana', emoji: '🇦🇺', rarity: 'rare', category: 'national', country: 'AU', description: 'The Matildas', sources: ['career', 'minigame'] },
  { id: 'nat_china', name: 'Seleção Chinesa', emoji: '🇨🇳', rarity: 'rare', category: 'national', country: 'CN', description: 'The Steel Roses', sources: ['career', 'minigame'] },
  { id: 'nat_coreia_sul', name: 'Seleção Sul-Coreana', emoji: '🇰🇷', rarity: 'uncommon', category: 'national', country: 'KR', description: 'The Taegeuk Ladies', sources: ['career', 'minigame'] },
  { id: 'nat_nova_zelandia', name: 'Seleção Neozelandesa', emoji: '🇳🇿', rarity: 'uncommon', category: 'national', country: 'NZ', description: 'The Football Ferns', sources: ['career', 'minigame'] },
  { id: 'nat_filipinas', name: 'Seleção Filipina', emoji: '🇵🇭', rarity: 'common', category: 'national', country: 'PH', description: 'The Filipinas', sources: ['career', 'minigame'] },
  { id: 'nat_tailandia', name: 'Seleção Tailandesa', emoji: '🇹🇭', rarity: 'common', category: 'national', country: 'TH', description: 'The Chaba Kaew', sources: ['career', 'minigame'] },
  { id: 'nat_vietna', name: 'Seleção Vietnamita', emoji: '🇻🇳', rarity: 'common', category: 'national', country: 'VN', description: 'The Golden Star Warriors', sources: ['career', 'minigame'] },
  { id: 'nat_india', name: 'Seleção Indiana', emoji: '🇮🇳', rarity: 'common', category: 'national', country: 'IN', description: 'The Blue Tigresses', sources: ['career', 'minigame'] },
  { id: 'nat_chinese_taipei', name: 'Seleção de Taipei', emoji: '🇹🇼', rarity: 'common', category: 'national', country: 'TW', description: 'The Mulan', sources: ['career', 'minigame'] },

  // ÁFRICA (10)
  { id: 'nat_nigeria', name: 'Seleção Nigeriana', emoji: '🇳🇬', rarity: 'rare', category: 'national', country: 'NG', description: 'The Super Falcons', sources: ['career', 'minigame'] },
  { id: 'nat_africa_sul', name: 'Seleção Sul-Africana', emoji: '🇿🇦', rarity: 'uncommon', category: 'national', country: 'ZA', description: 'Banyana Banyana', sources: ['career', 'minigame'] },
  { id: 'nat_camaroes', name: 'Seleção Camaronesa', emoji: '🇨🇲', rarity: 'uncommon', category: 'national', country: 'CM', description: 'The Indomitable Lionesses', sources: ['career', 'minigame'] },
  { id: 'nat_egito', name: 'Seleção Egípcia', emoji: '🇪🇬', rarity: 'uncommon', category: 'national', country: 'EG', description: 'The Pharaohs', sources: ['career', 'minigame'] },
  { id: 'nat_marrocos', name: 'Seleção Marroquina', emoji: '🇲🇦', rarity: 'uncommon', category: 'national', country: 'MA', description: 'The Atlas Lionesses', sources: ['career', 'minigame'] },
  { id: 'nat_ghana', name: 'Seleção Ganesa', emoji: '🇬🇭', rarity: 'common', category: 'national', country: 'GH', description: 'The Black Queens', sources: ['career', 'minigame'] },
  { id: 'nat_zambia', name: 'Seleção Zambiana', emoji: '🇿🇲', rarity: 'common', category: 'national', country: 'ZM', description: 'The She-polopolo', sources: ['career', 'minigame'] },
  { id: 'nat_costa_do_marfim', name: 'Seleção da Costa do Marfim', emoji: '🇨🇮', rarity: 'common', category: 'national', country: 'CI', description: 'The Elephants', sources: ['career', 'minigame'] },
  { id: 'nat_tunisia', name: 'Seleção Tunisiana', emoji: '🇹🇳', rarity: 'common', category: 'national', country: 'TN', description: 'The Eagles of Carthage', sources: ['career', 'minigame'] },
  { id: 'nat_argelia', name: 'Seleção Argelina', emoji: '🇩🇿', rarity: 'common', category: 'national', country: 'DZ', description: 'The Fennecs', sources: ['career', 'minigame'] }
];

// === 10 FIGURINHAS DE TÉCNICAS FAMOSAS ===
export const SKILLS = [
  // TÉCNICAS BRASILEIRAS (5)
  { id: 'skill_elastico', name: 'Elástico', emoji: '🌀', rarity: 'epic', category: 'skills', origin: 'BR', description: 'O drible mais brasileiro de todos', sources: ['minigame', 'career'] },
  { id: 'skill_chapeu', name: 'Chapéu', emoji: '🎩', rarity: 'rare', category: 'skills', origin: 'BR', description: 'Levantar a bola por cima do adversário', sources: ['minigame', 'match'] },
  { id: 'skill_janelinha', name: 'Janelinha', emoji: '🪟', rarity: 'rare', category: 'skills', origin: 'BR', description: 'Passar entre as pernas do adversário', sources: ['minigame', 'match'] },
  { id: 'skill_pedalada', name: 'Pedalada', emoji: '🚲', rarity: 'uncommon', category: 'skills', origin: 'BR', description: 'A famosa bike do futebol', sources: ['minigame', 'match'] },
  { id: 'skill_nutmeg', name: 'Nutmeg', emoji: '🌰', rarity: 'uncommon', category: 'skills', origin: 'BR', description: 'Tocar a bola entre as pernas', sources: ['minigame', 'match'] },

  // TÉCNICAS GRINGAS (5)
  { id: 'skill_rabona', name: 'Rabona', emoji: '🦵', rarity: 'rare', category: 'skills', origin: 'AR', description: 'Chutar com a perna cruzada', sources: ['minigame', 'career'] },
  { id: 'skill_scissors', name: 'Scissors', emoji: '✂️', rarity: 'rare', category: 'skills', origin: 'IT', description: 'O corte rápido italiano', sources: ['minigame', 'career'] },
  { id: 'skill_stepover', name: 'Step Over', emoji: '👣', rarity: 'uncommon', category: 'skills', origin: 'NL', description: 'Passo por cima da bola', sources: ['minigame', 'match'] },
  { id: 'skill_cruyff_turn', name: 'Cruyff Turn', emoji: '🇳🇱', rarity: 'epic', category: 'skills', origin: 'NL', description: 'O giro lendário de Cruyff', sources: ['minigame', 'career'] },
  { id: 'skill_maradona', name: 'Giro Maradona', emoji: '🇦🇷', rarity: 'legendary', category: 'skills', origin: 'AR', description: 'O giro mágico de Maradona', sources: ['minigame', 'career'] }
];

// Coleção completa
export const ALL_STICKERS = [
  ...BRAZIL_PLAYERS,
  ...WORLD_PLAYERS,
  ...ICONS,
  ...NATIONAL_TEAMS,
  ...SKILLS
];

// Verificar total
console.log(`Total de figurinhas: ${ALL_STICKERS.length}`);
console.log(`Brasil: ${BRAZIL_PLAYERS.length}`);
console.log(`Mundo: ${WORLD_PLAYERS.length}`);
console.log(`Ícones: ${ICONS.length}`);
console.log(`Seleções: ${NATIONAL_TEAMS.length}`);
console.log(`Técnicas: ${SKILLS.length}`);

// Configurações do álbum
export const ALBUM_CONFIG = {
  stickersPerPage: 6,
  totalPages: Math.ceil(ALL_STICKERS.length / 6),
  maxDuplicates: 5, // máximo de repetidas que se pode ter
  tradeCodeLength: 8
};

// Páginas do álbum
export const ALBUM_PAGES = [
  { id: 1, title: 'Brasil - Pioneiras', category: 'brazil', filter: s => s.category === 'brazil' && s.era === 'pioneer' },
  { id: 2, title: 'Brasil - Atuais', category: 'brazil', filter: s => s.category === 'brazil' && s.era === 'current' },
  { id: 3, title: 'Brasil - Lendas', category: 'brazil', filter: s => s.category === 'brazil' && s.era === 'legend' },
  { id: 4, title: 'Brasil - Continuação', category: 'brazil', filter: s => s.category === 'brazil' },
  { id: 5, title: 'Mundo - Lendárias', category: 'world', filter: s => s.category === 'world' && s.rarity === 'legendary' },
  { id: 6, title: 'Mundo - Estrelas', category: 'world', filter: s => s.category === 'world' && ['epic', 'rare'].includes(s.rarity) },
  { id: 7, title: 'Mundo - Continuação', category: 'world', filter: s => s.category === 'world' },
  { id: 8, title: 'Ícones do Futebol', category: 'icons', filter: s => s.category === 'icons' },
  { id: 9, title: 'Seleções - América', category: 'national', filter: s => s.category === 'national' && ['BR', 'AR', 'CO', 'CL', 'UY', 'PY', 'EC', 'VE', 'PE', 'BO'].includes(s.country) },
  { id: 10, title: 'Seleções - Europa', category: 'national', filter: s => s.category === 'national' && ['DE', 'US', 'GB', 'FR', 'ES', 'NL', 'SE', 'NO', 'IT', 'DK', 'CH', 'AT', 'BE', 'PT', 'RU', 'PL'].includes(s.country) },
  { id: 11, title: 'Seleções - Ásia/Oceania', category: 'national', filter: s => s.category === 'national' && ['JP', 'AU', 'CN', 'KR', 'NZ', 'PH', 'TH', 'VN', 'IN', 'TW'].includes(s.country) },
  { id: 12, title: 'Seleções - África', category: 'national', filter: s => s.category === 'national' && ['NG', 'ZA', 'CM', 'EG', 'MA', 'GH', 'ZM', 'CI', 'TN', 'DZ'].includes(s.country) },
  { id: 13, title: 'Técnicas Brasileiras', category: 'skills', filter: s => s.category === 'skills' && s.origin === 'BR' },
  { id: 14, title: 'Técnicas do Mundo', category: 'skills', filter: s => s.category === 'skills' && s.origin !== 'BR' }
];
