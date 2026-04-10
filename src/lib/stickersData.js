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
    label: 'Epica', 
    color: '#A855F7', 
    bg: 'from-purple-500 to-purple-600',
    probability: 0.10,
    xpBonus: 60
  },
  legendary: { 
    id: 'legendary', 
    label: 'Lendaria', 
    color: '#F59E0B', 
    bg: 'from-yellow-400 to-orange-500',
    probability: 0.04,
    xpBonus: 100
  },
  mythic: { 
    id: 'mythic', 
    label: 'Mitica', 
    color: '#EC4899', 
    bg: 'from-pink-500 to-rose-500',
    probability: 0.01,
    xpBonus: 200
  }
};

// Categorias de figurinhas
export const CATEGORIES = {
  brazil: { id: 'brazil', label: 'Brasil', emoji: '\u26BD', color: '#22C55E' },
  world: { id: 'world', label: 'Mundo', emoji: '\uD83C\uDF0D', color: '#3B82F6' },
  icons: { id: 'icons', label: 'Futebol', emoji: '\u2B50', color: '#F59E0B' },
  national: { id: 'national', label: 'Bandeiras', emoji: '\uD83C\uDFC6', color: '#A855F7' },
  skills: { id: 'skills', label: 'Tecnicas', emoji: '\uD83C\uDFAF', color: '#EC4899' }
};

// Fontes de obtencao
export const SOURCES = {
  english: { id: 'english', label: 'Licoes de Ingles', emoji: '\uD83D\uDCDA' },
  minigame: { id: 'minigame', label: 'Mini-games', emoji: '\uD83C\uDFAE' },
  story: { id: 'story', label: 'Modo Historia', emoji: '\uD83D\uDCD6' },
  career: { id: 'career', label: 'Modo Carreira', emoji: '\uD83D\uDC51' },
  health: { id: 'health', label: 'Saude da Atleta', emoji: '\uD83D\uDC9C' },
  match: { id: 'match', label: 'Jogos', emoji: '\u26BD' },
  code: { id: 'code', label: 'Codigo de Troca', emoji: '\uD83C\uDF81' },
  trade: { id: 'trade', label: 'Troca', emoji: '\uD83D\uDD04' }
};

// === 70 FIGURINHAS DO BRASIL ===
// 20 Pioneiras + 30 Atuais + 20 Lendas historicas
export const BRAZIL_PLAYERS = [
  // PIONEIRAS - LENDARIAS (20)
  { id: 'bra_marta', name: 'Marta', avatar: 'marta', rarity: 'mythic', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'A Rainha do Futebol - 6x Melhor do Mundo', sources: ['career', 'story'] },
  { id: 'bra_formiga', name: 'Formiga', avatar: 'formiga', rarity: 'legendary', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'Recordista de Copas do Mundo (7 edicoes)', sources: ['career', 'story'] },
  { id: 'bra_sissi', name: 'Sissi', avatar: 'sissi', rarity: 'legendary', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A Maga - Rainha da Copa de 99', sources: ['career', 'story'] },
  { id: 'bra_pretinha', name: 'Pretinha', avatar: 'pretinha', rarity: 'legendary', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Icone do futebol feminino brasileiro', sources: ['career', 'minigame'] },
  { id: 'bra_katia', name: 'Katia Cilene', avatar: 'katia', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Artilheira historica da Selecao', sources: ['career', 'minigame'] },
  { id: 'bra_roseli', name: 'Roseli', avatar: 'roseli', rarity: 'epic', category: 'brazil', position: 'Goleira', era: 'pioneer', description: 'Pioneira na meta brasileira', sources: ['career', 'minigame'] },
  { id: 'bra_fanta', name: 'Fanta', avatar: 'fanta', rarity: 'epic', category: 'brazil', position: 'Zagueira', era: 'pioneer', description: 'Referencia na defesa', sources: ['career', 'minigame'] },
  { id: 'bra_meg', name: 'Meg', avatar: 'meg', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Velocista e dribladora natural', sources: ['career', 'minigame'] },
  { id: 'bra_cristiane', name: 'Cristiane', avatar: 'cristiane', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Artilheira olimpica - 3x medalhista', sources: ['career', 'minigame'] },
  { id: 'bra_aline', name: 'Aline Pelegrino', avatar: 'aline', rarity: 'epic', category: 'brazil', position: 'Zagueira', era: 'pioneer', description: 'Capita e lider de geracao', sources: ['career', 'minigame'] },
  { id: 'bra_rosana', name: 'Rosana Augusto', avatar: 'rosana', rarity: 'rare', category: 'brazil', position: 'Lateral', era: 'pioneer', description: 'Lateral ofensiva e combativa', sources: ['career', 'minigame'] },
  { id: 'bra_ester', name: 'Ester', avatar: 'ester', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A estrategista do meio-campo', sources: ['career', 'minigame'] },
  { id: 'bra_dani', name: 'Dani', avatar: 'dani', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Dribles e alegria em campo', sources: ['career', 'minigame'] },
  { id: 'bra_barbara', name: 'Barbara', avatar: 'barbara', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'pioneer', description: 'A goleira das defesas milagrosas', sources: ['career', 'minigame'] },
  { id: 'bra_elaine', name: 'Elaine', avatar: 'elaine', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'A velocista do ataque', sources: ['career', 'minigame'] },
  { id: 'bra_maycon', name: 'Maycon', avatar: 'maycon', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A motorzinho do time', sources: ['career', 'minigame'] },
  { id: 'bra_grazielle', name: 'Grazielle', avatar: 'grazielle', rarity: 'uncommon', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'A artilheira silenciosa', sources: ['minigame', 'match'] },
  { id: 'bra_andressa', name: 'Andressa Alves', avatar: 'andressa', rarity: 'uncommon', category: 'brazil', position: 'Atacante', era: 'pioneer', description: 'Finalizadora de geracao', sources: ['minigame', 'match'] },
  { id: 'bra_rafinha', name: 'Rafinha', avatar: 'rafinha', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A armadora craque', sources: ['minigame', 'match'] },
  { id: 'bra_maurine', name: 'Maurine', avatar: 'maurine', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'pioneer', description: 'A maestra em campo', sources: ['minigame', 'match'] },

  // JOGADORAS ATUAIS (30)
  { id: 'bra_debinha', name: 'Debinha', avatar: 'debinha', rarity: 'epic', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A magica dos gols importantes', sources: ['career', 'minigame'] },
  { id: 'bra_gabi_nunes', name: 'Gabi Nunes', avatar: 'gabi_nunes', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A nova artilheira da Selecao', sources: ['career', 'minigame'] },
  { id: 'bra_yasmim', name: 'Yasmim', avatar: 'yasmim', rarity: 'rare', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A muralha defensiva', sources: ['career', 'minigame'] },
  { id: 'bra_tamires', name: 'Tamires', avatar: 'tamires', rarity: 'rare', category: 'brazil', position: 'Lateral', era: 'current', description: 'A lateral experiente', sources: ['career', 'minigame'] },
  { id: 'bra_angelina', name: 'Angelina', avatar: 'angelina', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A maestra do meio', sources: ['career', 'minigame'] },
  { id: 'bra_leticia', name: 'Leticia Izidoro', avatar: 'leticia', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'current', description: 'A nova guardia da meta', sources: ['career', 'minigame'] },
  { id: 'bra_lauren', name: 'Lauren', avatar: 'lauren', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A promessa do ataque', sources: ['career', 'minigame'] },
  { id: 'bra_vitoria_yaya', name: 'Vitoria Yaya', avatar: 'vitoria_yaya', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A joia do meio-campo', sources: ['career', 'minigame'] },
  { id: 'bra_tarciane', name: 'Tarciane', avatar: 'tarciane', rarity: 'rare', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A jovem defensora', sources: ['career', 'minigame'] },
  { id: 'bra_jheniffer', name: 'Jheniffer', avatar: 'jheniffer', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A finalizadora natural', sources: ['career', 'minigame'] },
  { id: 'bra_ana_vitoria', name: 'Ana Vitoria', avatar: 'ana_vitoria', rarity: 'rare', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A criadora de jogadas', sources: ['career', 'minigame'] },
  { id: 'bra_ludmila', name: 'Ludmila', avatar: 'ludmila', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A velocista do ataque', sources: ['career', 'minigame'] },
  { id: 'bra_gabi_portilho', name: 'Gabi Portilho', avatar: 'gabi_portilho', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A ponta veloz', sources: ['career', 'minigame'] },
  { id: 'bra_fernanda_lemos', name: 'Fernanda Lemos', avatar: 'fernanda_lemos', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A armadora de jogadas', sources: ['minigame', 'match'] },
  { id: 'bra_thais_maga', name: 'Thais Magalhaes', avatar: 'thais', rarity: 'uncommon', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A defensora solida', sources: ['minigame', 'match'] },
  { id: 'bra_bruna_souza', name: 'Bruna Souza', avatar: 'bruna_souza', rarity: 'uncommon', category: 'brazil', position: 'Atacante', era: 'current', description: 'A dribladora habilidosa', sources: ['minigame', 'match'] },
  { id: 'bra_luana', name: 'Luana', avatar: 'luana', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A combativa do meio', sources: ['minigame', 'match'] },
  { id: 'bra_fernanda_palermo', name: 'Fernanda Palermo', avatar: 'fernanda_palermo', rarity: 'uncommon', category: 'brazil', position: 'Arbitra', era: 'current', description: 'A arbitra da final olimpica', sources: ['career', 'code'] },
  { id: 'bra_kathellen', name: 'Kathellen', avatar: 'kathellen', rarity: 'uncommon', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A defensora de ferro', sources: ['minigame', 'match'] },
  { id: 'bra_bia_zaneratto', name: 'Bia Zaneratto', avatar: 'bia_zaneratto', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'current', description: 'A capita artilheira', sources: ['career', 'minigame'] },
  { id: 'bra_ana_paula', name: 'Ana Paula', avatar: 'ana_paula', rarity: 'uncommon', category: 'brazil', position: 'Goleira', era: 'current', description: 'A goleira de penalidades', sources: ['minigame', 'match'] },
  { id: 'bra_duda_sampaio', name: 'Duda Sampaio', avatar: 'duda_sampaio', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A jovem promessa', sources: ['minigame', 'match'] },
  { id: 'bra_jujuba', name: 'Jujuba', avatar: 'jujuba', rarity: 'uncommon', category: 'brazil', position: 'Atacante', era: 'current', description: 'A artilheira sub-20', sources: ['minigame', 'match'] },
  { id: 'bra_carol_nogueira', name: 'Carol Nogueira', avatar: 'carol_nogueira', rarity: 'common', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A defensora tecnica', sources: ['minigame', 'match'] },
  { id: 'bra_mayara', name: 'Mayara', avatar: 'mayara', rarity: 'common', category: 'brazil', position: 'Meio-campo', era: 'current', description: 'A volante de marcacao', sources: ['minigame', 'match'] },
  { id: 'bra_gabi_camargo', name: 'Gabi Camargo', avatar: 'gabi_camargo', rarity: 'common', category: 'brazil', position: 'Lateral', era: 'current', description: 'A lateral ofensiva', sources: ['minigame', 'match'] },
  { id: 'bra_mileninha', name: 'Mileninha', avatar: 'mileninha', rarity: 'common', category: 'brazil', position: 'Atacante', era: 'current', description: 'A jovem revelacao', sources: ['minigame', 'match'] },
  { id: 'bra_nycole', name: 'Nycole', avatar: 'nycole', rarity: 'common', category: 'brazil', position: 'Atacante', era: 'current', description: 'A velocista das pontas', sources: ['minigame', 'match'] },
  { id: 'bra_rilany', name: 'Rilany', avatar: 'rilany', rarity: 'common', category: 'brazil', position: 'Zagueira', era: 'current', description: 'A zagueira aerea', sources: ['minigame', 'match'] },
  { id: 'bra_patricia', name: 'Patricia', avatar: 'patricia', rarity: 'common', category: 'brazil', position: 'Goleira', era: 'current', description: 'A goleira segura', sources: ['minigame', 'match'] },

  // LENDAS HISTORICAS DO BRASIL (20)
  { id: 'bra_nalvinha', name: 'Nalvinha', avatar: 'nalvinha', rarity: 'legendary', category: 'brazil', position: 'Atacante', era: 'legend', description: 'A primeira estrela do futebol feminino brasileiro', sources: ['career', 'story'] },
  { id: 'bra_marta_2015', name: 'Marta 2015', avatar: 'marta_2015', rarity: 'mythic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Marta na Copa do Mundo 2015', sources: ['career', 'story'] },
  { id: 'bra_marta_2007', name: 'Marta 2007', avatar: 'marta_2007', rarity: 'mythic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Marta vice-campea mundial', sources: ['career', 'story'] },
  { id: 'bra_formiga_2019', name: 'Formiga 2019', avatar: 'formiga_2019', rarity: 'legendary', category: 'brazil', position: 'Meio-campo', era: 'legend', description: 'Formiga na Copa de 2019', sources: ['career', 'story'] },
  { id: 'bra_cristiane_olimpiadas', name: 'Cristiane Olimpiadas', avatar: 'cristiane_olimpiadas', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Cristiane medalhista olimpica', sources: ['career', 'story'] },
  { id: 'bra_sissi_1999', name: 'Sissi 1999', avatar: 'sissi_1999', rarity: 'legendary', category: 'brazil', position: 'Meio-campo', era: 'legend', description: 'Sissi artilheira da Copa de 99', sources: ['career', 'story'] },
  { id: 'bra_pretinha_2004', name: 'Pretinha 2004', avatar: 'pretinha_2004', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Pretinha medalha de prata', sources: ['career', 'story'] },
  { id: 'bra_mirandinha', name: 'Mirandinha', avatar: 'mirandinha', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'A pioneira do futebol feminino', sources: ['career', 'story'] },
  { id: 'bra_selma', name: 'Selma', avatar: 'selma', rarity: 'rare', category: 'brazil', position: 'Zagueira', era: 'legend', description: 'A capita de 99', sources: ['career', 'minigame'] },
  { id: 'bra_marisa', name: 'Marisa', avatar: 'marisa', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'legend', description: 'A goleira de 99', sources: ['career', 'minigame'] },
  { id: 'bra_cidinha', name: 'Cidinha', avatar: 'cidinha', rarity: 'rare', category: 'brazil', position: 'Atacante', era: 'legend', description: 'A velocista de 99', sources: ['career', 'minigame'] },
  { id: 'bra_katia_2004', name: 'Katia 2004', avatar: 'katia_2004', rarity: 'epic', category: 'brazil', position: 'Atacante', era: 'legend', description: 'Katia medalha de prata', sources: ['career', 'story'] },
  { id: 'bra_andreia_suntaque', name: 'Andreia Suntaque', avatar: 'andreia_suntaque', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'legend', description: 'A goleira da geracao de ouro', sources: ['career', 'minigame'] },
  { id: 'bra_tania_marquezine', name: 'Tania Marquezine', avatar: 'tania_marquezine', rarity: 'rare', category: 'brazil', position: 'Zagueira', era: 'legend', description: 'A zagueira da geracao de ouro', sources: ['career', 'minigame'] },
  { id: 'bra_simone_gomes', name: 'Simone Gomes', avatar: 'simone_gomes', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'legend', description: 'A volante de 2004', sources: ['minigame', 'match'] },
  { id: 'bra_preta', name: 'Preta', avatar: 'preta', rarity: 'uncommon', category: 'brazil', position: 'Meio-campo', era: 'legend', description: 'A meia de 2007', sources: ['minigame', 'match'] },
  { id: 'bra_danielle', name: 'Danielle', avatar: 'danielle', rarity: 'uncommon', category: 'brazil', position: 'Lateral', era: 'legend', description: 'A lateral de 2007', sources: ['minigame', 'match'] },
  { id: 'bra_andreia_rosa', name: 'Andreia Rosa', avatar: 'andreia_rosa', rarity: 'uncommon', category: 'brazil', position: 'Zagueira', era: 'legend', description: 'A zagueira de 2007', sources: ['minigame', 'match'] },
  { id: 'bra_barbara_2011', name: 'Barbara 2011', avatar: 'barbara_2011', rarity: 'rare', category: 'brazil', position: 'Goleira', era: 'legend', description: 'Barbara na Copa de 2011', sources: ['career', 'minigame'] },
  { id: 'bra_rosana_2008', name: 'Rosana 2008', avatar: 'rosana_2008', rarity: 'uncommon', category: 'brazil', position: 'Lateral', era: 'legend', description: 'Rosana nos Jogos Olimpicos de 2008', sources: ['minigame', 'match'] }
];

// === 50 FIGURINHAS DO MUNDO ===
export const WORLD_PLAYERS = [
  // LENDARIAS MUNDIAIS (15)
  { id: 'world_rapinoe', name: 'Megan Rapinoe', avatar: 'rapinoe', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Icone do futebol e ativismo', sources: ['career', 'story'] },
  { id: 'world_alex_morgan', name: 'Alex Morgan', avatar: 'alex_morgan', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Estrela americana multicampea', sources: ['career', 'story'] },
  { id: 'world_birgit_prinz', name: 'Birgit Prinz', avatar: 'birgit_prinz', rarity: 'legendary', category: 'world', country: 'DE', position: 'Atacante', description: 'Lenda alema - 5x Melhor do Mundo', sources: ['career', 'story'] },
  { id: 'world_mia_hamm', name: 'Mia Hamm', avatar: 'mia_hamm', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Pioneira do futebol feminino', sources: ['career', 'story'] },
  { id: 'world_abby_wambach', name: 'Abby Wambach', avatar: 'abby_wambach', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Recordista de gols da selecao americana', sources: ['career', 'story'] },
  { id: 'world_hope_solo', name: 'Hope Solo', avatar: 'hope_solo', rarity: 'legendary', category: 'world', country: 'US', position: 'Goleira', description: 'A goleira imbativel', sources: ['career', 'story'] },
  { id: 'world_sun_wen', name: 'Sun Wen', avatar: 'sun_wen', rarity: 'legendary', category: 'world', country: 'CN', position: 'Atacante', description: 'A rainha do futebol chines', sources: ['career', 'story'] },
  { id: 'world_hege_riise', name: 'Hege Riise', avatar: 'hege_riise', rarity: 'legendary', category: 'world', country: 'NO', position: 'Meio-campo', description: 'A lenda norueguesa', sources: ['career', 'story'] },
  { id: 'world_lily_parr', name: 'Lily Parr', avatar: 'lily_parr', rarity: 'mythic', category: 'world', country: 'GB', position: 'Atacante', description: 'A primeira estrela do futebol feminino', sources: ['career', 'story'] },
  { id: 'world_michelle_akers', name: 'Michelle Akers', avatar: 'michelle_akers', rarity: 'legendary', category: 'world', country: 'US', position: 'Atacante', description: 'Lenda americana dos anos 90', sources: ['career', 'story'] },
  { id: 'world_nadine_angerer', name: 'Nadine Angerer', avatar: 'nadine_angerer', rarity: 'legendary', category: 'world', country: 'DE', position: 'Goleira', description: 'A goleira alema campea', sources: ['career', 'story'] },
  { id: 'world_renate_lingor', name: 'Renate Lingor', avatar: 'renate_lingor', rarity: 'epic', category: 'world', country: 'DE', position: 'Meio-campo', description: 'A meia alema campea mundial', sources: ['career', 'minigame'] },
  { id: 'world_bettina_wiegmann', name: 'Bettina Wiegmann', avatar: 'bettina_wiegmann', rarity: 'epic', category: 'world', country: 'DE', position: 'Meio-campo', description: 'A capita alema campea', sources: ['career', 'minigame'] },
  { id: 'world_carolina_morace', name: 'Carolina Morace', avatar: 'carolina_morace', rarity: 'epic', category: 'world', country: 'IT', position: 'Atacante', description: 'A italiana artilheira', sources: ['career', 'minigame'] },
  { id: 'world_linda_medalen', name: 'Linda Medalen', avatar: 'linda_medalen', rarity: 'epic', category: 'world', country: 'NO', position: 'Atacante', description: 'A norueguesa campea mundial', sources: ['career', 'minigame'] },

  // ESTRELAS ATUAIS (35)
  { id: 'world_alexia_putellas', name: 'Alexia Putellas', avatar: 'alexia_putellas', rarity: 'epic', category: 'world', country: 'ES', position: 'Meio-campo', description: '2x Melhor do Mundo - Rainha do Barca', sources: ['career', 'minigame'] },
  { id: 'world_aitana_bonmati', name: 'Aitana Bonmati', avatar: 'aitana_bonmati', rarity: 'epic', category: 'world', country: 'ES', position: 'Meio-campo', description: 'A joia espanhola - Bola de Ouro', sources: ['career', 'minigame'] },
  { id: 'world_sam_kerr', name: 'Sam Kerr', avatar: 'sam_kerr', rarity: 'epic', category: 'world', country: 'AU', position: 'Atacante', description: 'A artilheira australiana', sources: ['career', 'minigame'] },
  { id: 'world_vivianne_miedema', name: 'Vivianne Miedema', avatar: 'vivianne_miedema', rarity: 'epic', category: 'world', country: 'NL', position: 'Atacante', description: 'A maquina de gols holandesa', sources: ['career', 'minigame'] },
  { id: 'world_lieke_martens', name: 'Lieke Martens', avatar: 'lieke_martens', rarity: 'epic', category: 'world', country: 'NL', position: 'Meio-campo', description: 'A maga holandesa', sources: ['career', 'minigame'] },
  { id: 'world_wendie_renard', name: 'Wendie Renard', avatar: 'wendie_renard', rarity: 'epic', category: 'world', country: 'FR', position: 'Zagueira', description: 'A capita do Lyon', sources: ['career', 'minigame'] },
  { id: 'world_ada_hegerberg', name: 'Ada Hegerberg', avatar: 'ada_hegerberg', rarity: 'epic', category: 'world', country: 'NO', position: 'Atacante', description: 'A guerreira norueguesa', sources: ['career', 'minigame'] },
  { id: 'world_amandine_henry', name: 'Amandine Henry', avatar: 'amandine_henry', rarity: 'epic', category: 'world', country: 'FR', position: 'Meio-campo', description: 'A maestra francesa', sources: ['career', 'minigame'] },
  { id: 'world_eugenie_le_sommer', name: 'Eugenie Le Sommer', avatar: 'eugenie_le_sommer', rarity: 'epic', category: 'world', country: 'FR', position: 'Atacante', description: 'A artilheira francesa', sources: ['career', 'minigame'] },
  { id: 'world_saki_kumagai', name: 'Saki Kumagai', avatar: 'saki_kumagai', rarity: 'epic', category: 'world', country: 'JP', position: 'Zagueira', description: 'A lider japonesa', sources: ['career', 'minigame'] },
  { id: 'world_homare_sawa', name: 'Homare Sawa', avatar: 'homare_sawa', rarity: 'epic', category: 'world', country: 'JP', position: 'Meio-campo', description: 'A eterna capita do Japao', sources: ['career', 'code'] },
  { id: 'world_carli_lloyd', name: 'Carli Lloyd', avatar: 'carli_lloyd', rarity: 'epic', category: 'world', country: 'US', position: 'Meio-campo', description: 'A heroina de duas finais', sources: ['career', 'code'] },
  { id: 'world_julie_ertz', name: 'Julie Ertz', avatar: 'julie_ertz', rarity: 'epic', category: 'world', country: 'US', position: 'Zagueira', description: 'A muralha americana', sources: ['career', 'minigame'] },
  { id: 'world_tobin_heath', name: 'Tobin Heath', avatar: 'tobin_heath', rarity: 'epic', category: 'world', country: 'US', position: 'Atacante', description: 'A artista das dribladas', sources: ['career', 'minigame'] },
  { id: 'world_christen_press', name: 'Christen Press', avatar: 'christen_press', rarity: 'epic', category: 'world', country: 'US', position: 'Atacante', description: 'A finalizadora precisa', sources: ['career', 'minigame'] },
  { id: 'world_lucy_bronze', name: 'Lucy Bronze', avatar: 'lucy_bronze', rarity: 'rare', category: 'world', country: 'GB', position: 'Lateral', description: 'A melhor lateral do mundo', sources: ['career', 'minigame'] },
  { id: 'world_fran_kirby', name: 'Fran Kirby', avatar: 'fran_kirby', rarity: 'rare', category: 'world', country: 'GB', position: 'Meio-campo', description: 'A joia inglesa', sources: ['career', 'minigame'] },
  { id: 'world_beth_mead', name: 'Beth Mead', avatar: 'beth_mead', rarity: 'rare', category: 'world', country: 'GB', position: 'Atacante', description: 'A artilheira da Euro', sources: ['career', 'minigame'] },
  { id: 'world_lauren_james', name: 'Lauren James', avatar: 'lauren_james', rarity: 'rare', category: 'world', country: 'GB', position: 'Atacante', description: 'A jovem estrela inglesa', sources: ['career', 'minigame'] },
  { id: 'world_jenni_hermoso', name: 'Jenni Hermoso', avatar: 'jenni_hermoso', rarity: 'rare', category: 'world', country: 'ES', position: 'Meio-campo', description: 'A artilheira espanhola', sources: ['career', 'minigame'] },
  { id: 'world_irene_paredes', name: 'Irene Paredes', avatar: 'irene_paredes', rarity: 'rare', category: 'world', country: 'ES', position: 'Zagueira', description: 'A defensora espanhola', sources: ['career', 'minigame'] },
  { id: 'world_lea_schuller', name: 'Lea Schuller', avatar: 'lea_schuller', rarity: 'rare', category: 'world', country: 'DE', position: 'Atacante', description: 'A nova artilheira alema', sources: ['career', 'minigame'] },
  { id: 'world_lina_magull', name: 'Lina Magull', avatar: 'lina_magull', rarity: 'rare', category: 'world', country: 'DE', position: 'Meio-campo', description: 'A criadora alema', sources: ['career', 'minigame'] },
  { id: 'world_kadidiatou_diani', name: 'Kadidiatou Diani', avatar: 'kadidiatou_diani', rarity: 'rare', category: 'world', country: 'FR', position: 'Atacante', description: 'A velocista francesa', sources: ['career', 'minigame'] },
  { id: 'world_barbara_bonansea', name: 'Barbara Bonansea', avatar: 'barbara_bonansea', rarity: 'rare', category: 'world', country: 'IT', position: 'Atacante', description: 'A estrela italiana', sources: ['career', 'minigame'] },
  { id: 'world_mana_iwabuchi', name: 'Mana Iwabuchi', avatar: 'mana_iwabuchi', rarity: 'rare', category: 'world', country: 'JP', position: 'Atacante', description: 'A pequena gigante japonesa', sources: ['career', 'minigame'] },
  { id: 'world_rose_lavelle', name: 'Rose Lavelle', avatar: 'rose_lavelle', rarity: 'rare', category: 'world', country: 'US', position: 'Meio-campo', description: 'A dribladora americana', sources: ['career', 'minigame'] },
  { id: 'world_lindsey_horan', name: 'Lindsey Horan', avatar: 'lindsey_horan', rarity: 'rare', category: 'world', country: 'US', position: 'Meio-campo', description: 'A capita americana', sources: ['career', 'minigame'] },
  { id: 'world_sophia_smith', name: 'Sophia Smith', avatar: 'sophia_smith', rarity: 'rare', category: 'world', country: 'US', position: 'Atacante', description: 'A nova estrela americana', sources: ['career', 'minigame'] },
  { id: 'world_trinity_rodman', name: 'Trinity Rodman', avatar: 'trinity_rodman', rarity: 'rare', category: 'world', country: 'US', position: 'Atacante', description: 'A jovem promessa americana', sources: ['career', 'minigame'] },
  { id: 'world_hard', name: 'Lindsey Hard', avatar: 'lindsey_hard', rarity: 'uncommon', category: 'world', country: 'US', position: 'Lateral', description: 'A lateral tecnica americana', sources: ['career', 'minigame'] }
];

// === 20 ITENS DE FUTEBOL ===
export const ICONS = [
  { id: 'icon_bola_ouro', name: 'Bola de Ouro', icon: 'BALL_GOLD', rarity: 'legendary', category: 'icons', description: 'O trofeu maximo do futebol feminino', sources: ['career', 'story'] },
  { id: 'icon_trofeu_copa', name: 'Trofeu da Copa', icon: 'TROPHY', rarity: 'legendary', category: 'icons', description: 'O sonho de toda jogadora', sources: ['career', 'story'] },
  { id: 'icon_chuteira_ouro', name: 'Chuteira de Ouro', icon: 'BOOT_GOLD', rarity: 'epic', category: 'icons', description: 'Para as maiores artilheiras', sources: ['minigame', 'career'] },
  { id: 'icon_luva_ouro', name: 'Luva de Ouro', icon: 'GLOVE_GOLD', rarity: 'epic', category: 'icons', description: 'Defesas impecaveis merecem', sources: ['minigame', 'career'] },
  { id: 'icon_trofeu_artilheira', name: 'Trofeu Artilheira', icon: 'TROPHY_GOAL', rarity: 'epic', category: 'icons', description: 'A maior goleadora', sources: ['career', 'minigame'] },
  { id: 'icon_medalha_ouro', name: 'Medalha de Ouro', icon: 'MEDAL_GOLD', rarity: 'legendary', category: 'icons', description: 'Campea olimpica!', sources: ['career', 'story'] },
  { id: 'icon_medalha_prata', name: 'Medalha de Prata', icon: 'MEDAL_SILVER', rarity: 'epic', category: 'icons', description: 'Vice-campea!', sources: ['career', 'story'] },
  { id: 'icon_medalha_bronze', name: 'Medalha de Bronze', icon: 'MEDAL_BRONZE', rarity: 'rare', category: 'icons', description: 'No podio!', sources: ['career', 'story'] },
  { id: 'icon_apito', name: 'Apito de Ouro', icon: 'WHISTLE', rarity: 'rare', category: 'icons', description: 'O arbitro apitou, e gol!', sources: ['minigame', 'match'] },
  { id: 'icon_rede_gol', name: 'Rede do Gol', icon: 'NET', rarity: 'rare', category: 'icons', description: 'Balancou a rede!', sources: ['minigame', 'match'] },
  { id: 'icon_camisa_10', name: 'Camisa 10', icon: 'JERSEY_10', rarity: 'rare', category: 'icons', description: 'O numero dos craques', sources: ['career', 'minigame'] },
  { id: 'icon_faixa_capitao', name: 'Faixa de Capita', icon: 'ARMBAND', rarity: 'uncommon', category: 'icons', description: 'A lider do time', sources: ['career', 'match'] },
  { id: 'icon_bandeira_corner', name: 'Bandeira de Corner', icon: 'CORNER_FLAG', rarity: 'uncommon', category: 'icons', description: 'Cobranca de canto', sources: ['minigame', 'match'] },
  { id: 'icon_var', name: 'VAR', icon: 'VAR_SCREEN', rarity: 'uncommon', category: 'icons', description: 'Revisao de jogada', sources: ['minigame', 'match'] },
  { id: 'icon_escudo_time', name: 'Escudo de Clube', icon: 'SHIELD', rarity: 'rare', category: 'icons', description: 'Defenda suas cores', sources: ['career', 'minigame'] },
  { id: 'icon_cartao_vermelho', name: 'Cartao Vermelho', icon: 'CARD_RED', rarity: 'uncommon', category: 'icons', description: 'Expulsao!', sources: ['minigame', 'match'] },
  { id: 'icon_cartao_amarelo', name: 'Cartao Amarelo', icon: 'CARD_YELLOW', rarity: 'common', category: 'icons', description: 'Advertencia!', sources: ['minigame', 'match'] },
  { id: 'icon_substituicao', name: 'Substituicao', icon: 'SUBSTITUTION', rarity: 'common', category: 'icons', description: 'Entra sangue novo', sources: ['minigame', 'match'] },
  { id: 'icon_chuteira_trava', name: 'Chuteira de Trava', icon: 'BOOT_CLEAT', rarity: 'common', category: 'icons', description: 'Equipamento de jogo', sources: ['minigame', 'match'] },
  { id: 'icon_caneleira', name: 'Caneleira', icon: 'SHIN_GUARD', rarity: 'common', category: 'icons', description: 'Protecao necessaria', sources: ['minigame', 'match'] }
];

// === 50 BANDEIRAS DO MUNDO ===
export const NATIONAL_TEAMS = [
  // AMERICAS DO SUL (10)
  { id: 'flag_brasil', name: 'Brasil', flag: 'BR', rarity: 'epic', category: 'national', continent: 'SA', description: 'As Guerreiras Verdeamarelas', sources: ['career', 'story'] },
  { id: 'flag_argentina', name: 'Argentina', flag: 'AR', rarity: 'rare', category: 'national', continent: 'SA', description: 'Las Albicelestes', sources: ['career', 'minigame'] },
  { id: 'flag_colombia', name: 'Colombia', flag: 'CO', rarity: 'rare', category: 'national', continent: 'SA', description: 'Las Cafeteras', sources: ['career', 'minigame'] },
  { id: 'flag_chile', name: 'Chile', flag: 'CL', rarity: 'uncommon', category: 'national', continent: 'SA', description: 'La Roja', sources: ['career', 'minigame'] },
  { id: 'flag_uruguai', name: 'Uruguai', flag: 'UY', rarity: 'uncommon', category: 'national', continent: 'SA', description: 'Las Celestes', sources: ['career', 'minigame'] },
  { id: 'flag_paraguai', name: 'Paraguai', flag: 'PY', rarity: 'uncommon', category: 'national', continent: 'SA', description: 'Las Guaranis', sources: ['career', 'minigame'] },
  { id: 'flag_equador', name: 'Equador', flag: 'EC', rarity: 'common', category: 'national', continent: 'SA', description: 'Las Tricolores', sources: ['career', 'minigame'] },
  { id: 'flag_venezuela', name: 'Venezuela', flag: 'VE', rarity: 'common', category: 'national', continent: 'SA', description: 'Las Vinotintos', sources: ['career', 'minigame'] },
  { id: 'flag_peru', name: 'Peru', flag: 'PE', rarity: 'common', category: 'national', continent: 'SA', description: 'Las Incas', sources: ['career', 'minigame'] },
  { id: 'flag_bolivia', name: 'Bolivia', flag: 'BO', rarity: 'common', category: 'national', continent: 'SA', description: 'Las Altiplanicas', sources: ['career', 'minigame'] },

  // EUROPA (20)
  { id: 'flag_alemanha', name: 'Alemanha', flag: 'DE', rarity: 'epic', category: 'national', continent: 'EU', description: 'Die Mannschaft', sources: ['career', 'story'] },
  { id: 'flag_estados_unidos', name: 'Estados Unidos', flag: 'US', rarity: 'epic', category: 'national', continent: 'NA', description: 'USWNT', sources: ['career', 'story'] },
  { id: 'flag_inglaterra', name: 'Inglaterra', flag: 'GB-ENG', rarity: 'epic', category: 'national', continent: 'EU', description: 'The Lionesses', sources: ['career', 'story'] },
  { id: 'flag_franca', name: 'Franca', flag: 'FR', rarity: 'epic', category: 'national', continent: 'EU', description: 'Les Bleues', sources: ['career', 'story'] },
  { id: 'flag_espanha', name: 'Espanha', flag: 'ES', rarity: 'epic', category: 'national', continent: 'EU', description: 'La Roja Campea', sources: ['career', 'story'] },
  { id: 'flag_holanda', name: 'Holanda', flag: 'NL', rarity: 'rare', category: 'national', continent: 'EU', description: 'Oranje Leeuwinnen', sources: ['career', 'minigame'] },
  { id: 'flag_suecia', name: 'Suecia', flag: 'SE', rarity: 'rare', category: 'national', continent: 'EU', description: 'Blagult', sources: ['career', 'minigame'] },
  { id: 'flag_noruega', name: 'Noruega', flag: 'NO', rarity: 'rare', category: 'national', continent: 'EU', description: 'Gresshoppene', sources: ['career', 'minigame'] },
  { id: 'flag_italia', name: 'Italia', flag: 'IT', rarity: 'rare', category: 'national', continent: 'EU', description: 'Le Azzurre', sources: ['career', 'minigame'] },
  { id: 'flag_dinamarca', name: 'Dinamarca', flag: 'DK', rarity: 'uncommon', category: 'national', continent: 'EU', description: 'De Rod-Hvide', sources: ['career', 'minigame'] },
  { id: 'flag_suica', name: 'Suica', flag: 'CH', rarity: 'uncommon', category: 'national', continent: 'EU', description: 'La Nati', sources: ['career', 'minigame'] },
  { id: 'flag_austria', name: 'Austria', flag: 'AT', rarity: 'uncommon', category: 'national', continent: 'EU', description: 'Das Nationalteam', sources: ['career', 'minigame'] },
  { id: 'flag_belgica', name: 'Belgica', flag: 'BE', rarity: 'uncommon', category: 'national', continent: 'EU', description: 'The Red Flames', sources: ['career', 'minigame'] },
  { id: 'flag_portugal', name: 'Portugal', flag: 'PT', rarity: 'uncommon', category: 'national', continent: 'EU', description: 'As Navegadoras', sources: ['career', 'minigame'] },
  { id: 'flag_escocia', name: 'Escocia', flag: 'GB-SCT', rarity: 'uncommon', category: 'national', continent: 'EU', description: 'The Tartan Terriers', sources: ['career', 'minigame'] },
  { id: 'flag_pais_de_gales', name: 'Pais de Gales', flag: 'GB-WLS', rarity: 'common', category: 'national', continent: 'EU', description: 'The Dragons', sources: ['career', 'minigame'] },
  { id: 'flag_irlanda', name: 'Irlanda', flag: 'IE', rarity: 'common', category: 'national', continent: 'EU', description: 'The Girls in Green', sources: ['career', 'minigame'] },
  { id: 'flag_russia', name: 'Russia', flag: 'RU', rarity: 'uncommon', category: 'national', continent: 'EU', description: 'The Russian Bears', sources: ['career', 'minigame'] },
  { id: 'flag_polonia', name: 'Polonia', flag: 'PL', rarity: 'common', category: 'national', continent: 'EU', description: 'The Polish Eagles', sources: ['career', 'minigame'] },
  { id: 'flag_islandia', name: 'Islandia', flag: 'IS', rarity: 'uncommon', category: 'national', continent: 'EU', description: 'The Stripes', sources: ['career', 'minigame'] },

  // ASIA E OCEANIA (10)
  { id: 'flag_japao', name: 'Japao', flag: 'JP', rarity: 'epic', category: 'national', continent: 'AS', description: 'Nadeshiko Japan', sources: ['career', 'story'] },
  { id: 'flag_australia', name: 'Australia', flag: 'AU', rarity: 'rare', category: 'national', continent: 'OC', description: 'The Matildas', sources: ['career', 'minigame'] },
  { id: 'flag_china', name: 'China', flag: 'CN', rarity: 'rare', category: 'national', continent: 'AS', description: 'The Steel Roses', sources: ['career', 'minigame'] },
  { id: 'flag_coreia_sul', name: 'Coreia do Sul', flag: 'KR', rarity: 'uncommon', category: 'national', continent: 'AS', description: 'The Taegeuk Ladies', sources: ['career', 'minigame'] },
  { id: 'flag_nova_zelandia', name: 'Nova Zelandia', flag: 'NZ', rarity: 'uncommon', category: 'national', continent: 'OC', description: 'The Football Ferns', sources: ['career', 'minigame'] },
  { id: 'flag_filipinas', name: 'Filipinas', flag: 'PH', rarity: 'common', category: 'national', continent: 'AS', description: 'The Filipinas', sources: ['career', 'minigame'] },
  { id: 'flag_tailandia', name: 'Tailandia', flag: 'TH', rarity: 'common', category: 'national', continent: 'AS', description: 'The Chaba Kaew', sources: ['career', 'minigame'] },
  { id: 'flag_vietna', name: 'Vietna', flag: 'VN', rarity: 'common', category: 'national', continent: 'AS', description: 'The Golden Star Warriors', sources: ['career', 'minigame'] },
  { id: 'flag_india', name: 'India', flag: 'IN', rarity: 'common', category: 'national', continent: 'AS', description: 'The Blue Tigresses', sources: ['career', 'minigame'] },
  { id: 'flag_canada', name: 'Canada', flag: 'CA', rarity: 'rare', category: 'national', continent: 'NA', description: 'Les Rouges', sources: ['career', 'minigame'] },

  // AFRICA (10)
  { id: 'flag_nigeria', name: 'Nigeria', flag: 'NG', rarity: 'rare', category: 'national', continent: 'AF', description: 'The Super Falcons', sources: ['career', 'minigame'] },
  { id: 'flag_africa_sul', name: 'Africa do Sul', flag: 'ZA', rarity: 'uncommon', category: 'national', continent: 'AF', description: 'Banyana Banyana', sources: ['career', 'minigame'] },
  { id: 'flag_camaroes', name: 'Camaroes', flag: 'CM', rarity: 'uncommon', category: 'national', continent: 'AF', description: 'The Indomitable Lionesses', sources: ['career', 'minigame'] },
  { id: 'flag_egito', name: 'Egito', flag: 'EG', rarity: 'uncommon', category: 'national', continent: 'AF', description: 'The Pharaohs', sources: ['career', 'minigame'] },
  { id: 'flag_marrocos', name: 'Marrocos', flag: 'MA', rarity: 'uncommon', category: 'national', continent: 'AF', description: 'The Atlas Lionesses', sources: ['career', 'minigame'] },
  { id: 'flag_ghana', name: 'Ghana', flag: 'GH', rarity: 'common', category: 'national', continent: 'AF', description: 'The Black Queens', sources: ['career', 'minigame'] },
  { id: 'flag_zambia', name: 'Zambia', flag: 'ZM', rarity: 'common', category: 'national', continent: 'AF', description: 'The She-polopolo', sources: ['career', 'minigame'] },
  { id: 'flag_costa_do_marfim', name: 'Costa do Marfim', flag: 'CI', rarity: 'common', category: 'national', continent: 'AF', description: 'The Elephants', sources: ['career', 'minigame'] },
  { id: 'flag_tunisia', name: 'Tunisia', flag: 'TN', rarity: 'common', category: 'national', continent: 'AF', description: 'The Eagles of Carthage', sources: ['career', 'minigame'] },
  { id: 'flag_kenya', name: 'Kenya', flag: 'KE', rarity: 'common', category: 'national', continent: 'AF', description: 'The Harambee Starlets', sources: ['career', 'minigame'] }
];

// === 10 FIGURINHAS DE TECNICAS / TREINADORES(AS) ===
export const SKILLS = [
  // BRASILEIRAS (6)
  { id: 'skill_emilia_lima',      name: 'Emilia Lima',      avatar: 'emilia_lima',      rarity: 'legendary', category: 'skills', country: 'BR', position: 'Treinadora', description: 'Primeira treinadora campea da Serie A feminina', sources: ['story', 'career'] },
  { id: 'skill_bia_vaz',          name: 'Bia Vaz',          avatar: 'bia_vaz',          rarity: 'epic',      category: 'skills', country: 'BR', position: 'Atacante',   description: 'Atacante tecnica e versatil do futebol brasileiro', sources: ['minigame', 'career'] },
  { id: 'skill_tatiele_silveira', name: 'Tatiele Silveira', avatar: 'tatiele_silveira', rarity: 'rare',      category: 'skills', country: 'BR', position: 'Goleira',    description: 'Uma das maiores goleiras da historia do Brasil', sources: ['minigame', 'match'] },
  { id: 'skill_julia_passero',    name: 'Julia Passero',    avatar: 'julia_passero',    rarity: 'rare',      category: 'skills', country: 'BR', position: 'Meio-campo', description: 'Criatividade e precisao no meio-campo', sources: ['minigame', 'english'] },
  { id: 'skill_arthur_elias',     name: 'Arthur Elias',     avatar: 'arthur_elias',     rarity: 'epic',      category: 'skills', country: 'BR', position: 'Treinador',  description: 'Treinador da Selecao Brasileira feminina', sources: ['career', 'story'] },
  { id: 'skill_borges',           name: 'Jorge Barcellos',  avatar: 'jorge_barcellos',  rarity: 'uncommon',  category: 'skills', country: 'BR', position: 'Treinador',  description: 'Icone da comissao tecnica do futebol feminino', sources: ['career'] },

  // INTERNACIONAIS (4)
  { id: 'skill_pia_sundhage',     name: 'Pia Sundhage',     avatar: 'pia_sundhage',     rarity: 'mythic',    category: 'skills', country: 'SE', position: 'Treinadora', description: 'Lendaria treinadora sueca que comandou o Brasil', sources: ['story', 'career'] },
  { id: 'skill_jill_ellis',       name: 'Jill Ellis',       avatar: 'jill_ellis',       rarity: 'legendary', category: 'skills', country: 'US', position: 'Treinadora', description: 'Bicampea mundial com os EUA', sources: ['career', 'story'] },
  { id: 'skill_sarina_wiegman',   name: 'Sarina Wiegman',   avatar: 'sarina_wiegman',   rarity: 'epic',      category: 'skills', country: 'NL', position: 'Treinadora', description: 'Campea mundial com Holanda e Inglaterra', sources: ['career'] },
  { id: 'skill_bev_yanez',        name: 'Bev Yanez',        avatar: 'bev_yanez',        rarity: 'rare',      category: 'skills', country: 'US', position: 'Treinadora', description: 'Referencia tecnica no futebol feminino mundial', sources: ['minigame', 'career'] }
];

// Colecao completa
export const ALL_STICKERS = [
  ...BRAZIL_PLAYERS,
  ...WORLD_PLAYERS,
  ...ICONS,
  ...NATIONAL_TEAMS,
  ...SKILLS
];

// Configuracoes do album
export const ALBUM_CONFIG = {
  stickersPerPage: 6,
  totalPages: Math.ceil(ALL_STICKERS.length / 6),
  maxDuplicates: 5,
  tradeCodeLength: 8
};

// Paginas do album
export const ALBUM_PAGES = [
  { id: 1,  title: 'Brasil - Pioneiras',     category: 'brazil',   filter: s => s.category === 'brazil' && s.era === 'pioneer' },
  { id: 2,  title: 'Brasil - Atuais',        category: 'brazil',   filter: s => s.category === 'brazil' && s.era === 'current' },
  { id: 3,  title: 'Brasil - Lendas',        category: 'brazil',   filter: s => s.category === 'brazil' && s.era === 'legend' },
  { id: 4,  title: 'Mundo - Lendarias',      category: 'world',    filter: s => s.category === 'world' && ['legendary','mythic'].includes(s.rarity) },
  { id: 5,  title: 'Mundo - Estrelas',       category: 'world',    filter: s => s.category === 'world' && ['epic','rare'].includes(s.rarity) },
  { id: 6,  title: 'Mundo - Cont.',          category: 'world',    filter: s => s.category === 'world' && ['uncommon','common'].includes(s.rarity) },
  { id: 7,  title: 'Itens de Futebol',       category: 'icons',    filter: s => s.category === 'icons' },
  { id: 8,  title: 'Bandeiras - Americas',   category: 'national', filter: s => s.category === 'national' && ['SA','NA'].includes(s.continent) },
  { id: 9,  title: 'Bandeiras - Europa 1',   category: 'national', filter: s => s.category === 'national' && s.continent === 'EU' && ['epic','rare'].includes(s.rarity) },
  { id: 10, title: 'Bandeiras - Europa 2',   category: 'national', filter: s => s.category === 'national' && s.continent === 'EU' && ['uncommon','common'].includes(s.rarity) },
  { id: 11, title: 'Bandeiras - Asia/Oceania', category: 'national', filter: s => s.category === 'national' && ['AS','OC'].includes(s.continent) },
  { id: 12, title: 'Bandeiras - Africa',     category: 'national', filter: s => s.category === 'national' && s.continent === 'AF' },
  { id: 13, title: 'Tecnicas Brasileiras',   category: 'skills',   filter: s => s.category === 'skills' && s.country === 'BR' },
  { id: 14, title: 'Tecnicas do Mundo',      category: 'skills',   filter: s => s.category === 'skills' && s.country !== 'BR' }
];
