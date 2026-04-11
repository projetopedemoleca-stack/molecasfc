/**
 * Sistema Unificado de Álbum de Figurinhas - Molecas FC
 * 
 * Combina:
 * - Figurinhas douradas (golden) de mini-games
 * - Figurinhas de cosméticos/itens
 * - Figurinhas de jogadoras reais (Brasil + Mundo)
 * - Sistema de troca com códigos únicos
 * - 4 níveis de raridade
 */

// Configuração de raridades
export const RARITY_CONFIG = {
  common: {
    label: 'Comum',
    color: '#9CA3AF',
    bgGradient: 'from-gray-400 to-gray-500',
    borderColor: 'border-gray-400',
    glowColor: 'shadow-gray-400/30',
    textColor: 'text-gray-700',
    probability: 0.50,
    xpBonus: 10,
  },
  rare: {
    label: 'Rara',
    color: '#3B82F6',
    bgGradient: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-500/40',
    textColor: 'text-blue-700',
    probability: 0.30,
    xpBonus: 25,
  },
  epic: {
    label: 'Épica',
    color: '#A855F7',
    bgGradient: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-500',
    glowColor: 'shadow-purple-500/50',
    textColor: 'text-purple-700',
    probability: 0.15,
    xpBonus: 50,
  },
  legendary: {
    label: 'Lendária',
    color: '#F59E0B',
    bgGradient: 'from-yellow-500 to-orange-500',
    borderColor: 'border-amber-500',
    glowColor: 'shadow-amber-500/60',
    textColor: 'text-yellow-700',
    probability: 0.05,
    xpBonus: 100,
  },
};

// === JOGADORAS DO BRASIL (Pioneiras + Atuais) ===
const BRAZIL_PLAYERS = [
  // PIONEIRAS (Lendárias)
  { id: 'bra_marta', name: 'Marta', emoji: '👑', rarity: 'legendary', category: 'player', country: 'BR', position: 'Atacante', isPioneer: true, description: 'A Rainha do Futebol - 6x Melhor do Mundo', unlockSource: ['career', 'code'], hasGlitter: true, hasAnimation: true },
  { id: 'bra_formiga', name: 'Formiga', emoji: '⚽', rarity: 'legendary', category: 'player', country: 'BR', position: 'Meio-campo', isPioneer: true, description: 'Recordista de Copas do Mundo (7 edições)', unlockSource: ['career', 'code'], hasGlitter: true, hasAnimation: true },
  { id: 'bra_sissi', name: 'Sissi', emoji: '🎩', rarity: 'legendary', category: 'player', country: 'BR', position: 'Meio-campo', isPioneer: true, description: 'A Maga - Rainha da Copa de 99', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'bra_pretinha', name: 'Pretinha', emoji: '🔥', rarity: 'legendary', category: 'player', country: 'BR', position: 'Atacante', isPioneer: true, description: 'Ícone do futebol feminino brasileiro', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'bra_kátia', name: 'Kátia Cilene', emoji: '⚡', rarity: 'epic', category: 'player', country: 'BR', position: 'Atacante', isPioneer: true, description: 'Artilheira histórica da Seleção', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'bra_roseli', name: 'Roseli', emoji: '🥅', rarity: 'epic', category: 'player', country: 'BR', position: 'Goleira', isPioneer: true, description: 'Pioneira na meta brasileira', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'bra_fanta', name: 'Fanta', emoji: '🛡️', rarity: 'epic', category: 'player', country: 'BR', position: 'Zagueira', isPioneer: true, description: 'Referência na defesa', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'bra_meg', name: 'Meg', emoji: '🦋', rarity: 'epic', category: 'player', country: 'BR', position: 'Atacante', isPioneer: true, description: 'Velocista e dribladora nat', unlockSource: ['career', 'minigame'], hasGlitter: true },
  
  // Geração de Ouro (Épicas)
  { id: 'bra_cristiane', name: 'Cristiane', emoji: '🎯', rarity: 'epic', category: 'player', country: 'BR', position: 'Atacante', description: 'Artilheira olímpica - 3x medalhista', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'bra_aline_pelegrino', name: 'Aline Pelegrino', emoji: '🛡️', rarity: 'epic', category: 'player', country: 'BR', position: 'Zagueira', description: 'Capitã e líder de geração', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'bra_rosana_augusto', name: 'Rosana Augusto', emoji: '⚡', rarity: 'epic', category: 'player', country: 'BR', position: 'Lateral', description: 'Lateral ofensiva e combativa', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'bra_estergiane', name: 'Ester', emoji: '🎭', rarity: 'epic', category: 'player', country: 'BR', position: 'Meio-campo', description: 'A estrategista do meio-campo', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'bra_dani', name: 'Dani', emoji: '🎪', rarity: 'epic', category: 'player', country: 'BR', position: 'Atacante', description: 'Dribles e alegria em campo', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'bra_bárbara', name: 'Bárbara', emoji: '🧤', rarity: 'epic', category: 'player', country: 'BR', position: 'Goleira', description: 'A goleira das defesas milagrosas', unlockSource: ['career', 'minigame'], hasGlitter: true },
  
  // Atuais (Raras e Épicas)
  { id: 'bra_debinha', name: 'Debinha', emoji: '🔮', rarity: 'epic', category: 'player', country: 'BR', position: 'Meio-campo', description: 'A mágica dos gols importantes', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'bra_gabi_nunes', name: 'Gabi Nunes', emoji: '🦁', rarity: 'rare', category: 'player', country: 'BR', position: 'Atacante', description: 'A nova artilheira da Seleção', unlockSource: ['career', 'minigame'] },
  { id: 'bra_ya_santos', name: 'Yasmim', emoji: '🛡️', rarity: 'rare', category: 'player', country: 'BR', position: 'Zagueira', description: 'A muralha defensiva', unlockSource: ['career', 'minigame'] },
  { id: 'bra_tamires', name: 'Tamires', emoji: '⚡', rarity: 'rare', category: 'player', country: 'BR', position: 'Lateral', description: 'A lateral experiente', unlockSource: ['career', 'minigame'] },
  { id: 'bra_angelina', name: 'Angelina', emoji: '🎼', rarity: 'rare', category: 'player', country: 'BR', position: 'Meio-campo', description: 'A maestra do meio', unlockSource: ['career', 'minigame'] },
  { id: 'bra_fernanda_palermo', name: 'Fernanda Palermo', emoji: '📋', rarity: 'rare', category: 'player', country: 'BR', position: 'Árbitra', description: 'A árbitra da final olímpica', unlockSource: ['career', 'code'] },
  { id: 'bra_letícia_izidoro', name: 'Letícia Izidoro', emoji: '🧤', rarity: 'rare', category: 'player', country: 'BR', position: 'Goleira', description: 'A nova guardiã da meta', unlockSource: ['career', 'minigame'] },
  { id: 'bra_lauren', name: 'Lauren', emoji: '🌟', rarity: 'rare', category: 'player', country: 'BR', position: 'Atacante', description: 'A promessa do ataque', unlockSource: ['career', 'minigame'] },
  { id: 'bra_vitória_yaiza', name: 'Vitória Yaya', emoji: '💫', rarity: 'rare', category: 'player', country: 'BR', position: 'Meio-campo', description: 'A joia do meio-campo', unlockSource: ['career', 'minigame'] },
  { id: 'bra_tarciane', name: 'Tarciane', emoji: '🏰', rarity: 'rare', category: 'player', country: 'BR', position: 'Zagueira', description: 'A jovem defensora', unlockSource: ['career', 'minigame'] },
  { id: 'bra_jheniffer', name: 'Jheniffer', emoji: '🎯', rarity: 'rare', category: 'player', country: 'BR', position: 'Atacante', description: 'A finalizadora nat', unlockSource: ['career', 'minigame'] },
  { id: 'bra_ana_vitória', name: 'Ana Vitória', emoji: '🎨', rarity: 'rare', category: 'player', country: 'BR', position: 'Meio-campo', description: 'A criadora de jogadas', unlockSource: ['career', 'minigame'] },
  { id: 'bra_ludmila', name: 'Ludmila', emoji: '🚀', rarity: 'rare', category: 'player', country: 'BR', position: 'Atacante', description: 'A velocista do ataque', unlockSource: ['career', 'minigame'] },
  { id: 'bra_gabi_portilho', name: 'Gabi Portilho', emoji: '⚡', rarity: 'rare', category: 'player', country: 'BR', position: 'Atacante', description: 'A ponta veloz', unlockSource: ['career', 'minigame'] },
  { id: 'bra_fernanda_lemos', name: 'Fernanda Lemos', emoji: '🎭', rarity: 'common', category: 'player', country: 'BR', position: 'Meio-campo', description: 'A armadora de jogadas', unlockSource: ['career', 'minigame'] },
  { id: 'bra_thais_maga', name: 'Thais Magalhães', emoji: '🛡️', rarity: 'common', category: 'player', country: 'BR', position: 'Zagueira', description: 'A defensora sólida', unlockSource: ['career', 'minigame'] },
  { id: 'bra_bruna_souza', name: 'Bruna Souza', emoji: '🎪', rarity: 'common', category: 'player', country: 'BR', position: 'Atacante', description: 'A dribladora habilidosa', unlockSource: ['career', 'minigame'] },
];

// === JOGADORAS DO MUNDO (Mais Famosas) ===
const WORLD_PLAYERS = [
  // LENDÁRIAS
  { id: 'world_megan_rapinoe', name: 'Megan Rapinoe', emoji: '🌈', rarity: 'legendary', category: 'player', country: 'US', position: 'Atacante', description: 'Ícone do futebol e ativismo', unlockSource: ['career', 'code'], hasGlitter: true, hasAnimation: true },
  { id: 'world_alex_morgan', name: 'Alex Morgan', emoji: '🦁', rarity: 'legendary', category: 'player', country: 'US', position: 'Atacante', description: 'Estrela americana multicampeã', unlockSource: ['career', 'code'], hasGlitter: true, hasAnimation: true },
  { id: 'world_birgit_prinz', name: 'Birgit Prinz', emoji: '👑', rarity: 'legendary', category: 'player', country: 'DE', position: 'Atacante', description: 'Lenda alemã - 5x Melhor do Mundo', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'world_mia_hamm', name: 'Mia Hamm', emoji: '⚽', rarity: 'legendary', category: 'player', country: 'US', position: 'Atacante', description: 'Pioneira do futebol feminino', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'world_abby_wambach', name: 'Abby Wambach', emoji: '🎯', rarity: 'legendary', category: 'player', country: 'US', position: 'Atacante', description: 'Recordista de gols da seleção americana', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'world_hope_solo', name: 'Hope Solo', emoji: '🧤', rarity: 'legendary', category: 'player', country: 'US', position: 'Goleira', description: 'A goleira imbatível', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'world_sun_wen', name: 'Sun Wen', emoji: '☀️', rarity: 'legendary', category: 'player', country: 'CN', position: 'Atacante', description: 'A rainha do futebol chinês', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'world_hege_riise', name: 'Hege Riise', emoji: '🇳🇴', rarity: 'legendary', category: 'player', country: 'NO', position: 'Meio-campo', description: 'A lenda norueguesa', unlockSource: ['career', 'code'], hasGlitter: true },
  
  // ÉPICAS
  { id: 'world_alexia_putellas', name: 'Alexia Putellas', emoji: '🔥', rarity: 'epic', category: 'player', country: 'ES', position: 'Meio-campo', description: '2x Melhor do Mundo - Rainha do Barça', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_aitana_bonmati', name: 'Aitana Bonmatí', emoji: '✨', rarity: 'epic', category: 'player', country: 'ES', position: 'Meio-campo', description: 'A joia espanhola - Bola de Ouro', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_sam_kerr', name: 'Sam Kerr', emoji: '🦘', rarity: 'epic', category: 'player', country: 'AU', position: 'Atacante', description: 'A artilheira australiana', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_vivianne_miedema', name: 'Vivianne Miedema', emoji: '🇳🇱', rarity: 'epic', category: 'player', country: 'NL', position: 'Atacante', description: 'A máquina de gols holandesa', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_lieke_martens', name: 'Lieke Martens', emoji: '🎩', rarity: 'epic', category: 'player', country: 'NL', position: 'Meio-campo', description: 'A maga holandesa', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_wendie_renard', name: 'Wendie Renard', emoji: '🏰', rarity: 'epic', category: 'player', country: 'FR', position: 'Zagueira', description: 'A capitã do Lyon', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_ada_hegerberg', name: 'Ada Hegerberg', emoji: '⚔️', rarity: 'epic', category: 'player', country: 'NO', position: 'Atacante', description: 'A guerreira norueguesa', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_amandine_henry', name: 'Amandine Henry', emoji: '🎼', rarity: 'epic', category: 'player', country: 'FR', position: 'Meio-campo', description: 'A maestra francesa', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_eugenie_le_sommer', name: 'Eugénie Le Sommer', emoji: '🇫🇷', rarity: 'epic', category: 'player', country: 'FR', position: 'Atacante', description: 'A artilheira francesa', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_saki_kumagai', name: 'Saki Kumagai', emoji: '🇯🇵', rarity: 'epic', category: 'player', country: 'JP', position: 'Zagueira', description: 'A líder japonesa', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_asako_takakura', name: 'Asako Takakura', emoji: '🗾', rarity: 'epic', category: 'player', country: 'JP', position: 'Meio-campo', description: 'A lenda japonesa', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'world_homare_sawa', name: 'Homare Sawa', emoji: '🇯🇵', rarity: 'epic', category: 'player', country: 'JP', position: 'Meio-campo', description: 'A eterna capitã do Japão', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'world_carli_lloyd', name: 'Carli Lloyd', emoji: '🇺🇸', rarity: 'epic', category: 'player', country: 'US', position: 'Meio-campo', description: 'A heroína de duas finais', unlockSource: ['career', 'code'], hasGlitter: true },
  { id: 'world_julie_ertz', name: 'Julie Ertz', emoji: '🛡️', rarity: 'epic', category: 'player', country: 'US', position: 'Zagueira', description: 'A muralha americana', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_tobin_heath', name: 'Tobin Heath', emoji: '🎨', rarity: 'epic', category: 'player', country: 'US', position: 'Atacante', description: 'A artista das dribladas', unlockSource: ['career', 'minigame'], hasGlitter: true },
  { id: 'world_christen_press', name: 'Christen Press', emoji: '⚡', rarity: 'epic', category: 'player', country: 'US', position: 'Atacante', description: 'A finalizadora precisa', unlockSource: ['career', 'minigame'], hasGlitter: true },
  
  // RARAS
  { id: 'world_lucy_bronze', name: 'Lucy Bronze', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rarity: 'rare', category: 'player', country: 'GB', position: 'Lateral', description: 'A melhor lateral do mundo', unlockSource: ['career', 'minigame'] },
  { id: 'world_fran_kirby', name: 'Fran Kirby', emoji: '🦁', rarity: 'rare', category: 'player', country: 'GB', position: 'Meio-campo', description: 'A joia inglesa', unlockSource: ['career', 'minigame'] },
  { id: 'world_beth_mead', name: 'Beth Mead', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rarity: 'rare', category: 'player', country: 'GB', position: 'Atacante', description: 'A artilheira da Euro', unlockSource: ['career', 'minigame'] },
  { id: 'world_lauren_james', name: 'Lauren James', emoji: '💎', rarity: 'rare', category: 'player', country: 'GB', position: 'Atacante', description: 'A jovem estrela inglesa', unlockSource: ['career', 'minigame'] },
  { id: 'world_jenni_hermoso', name: 'Jenni Hermoso', emoji: '🇪🇸', rarity: 'rare', category: 'player', country: 'ES', position: 'Meio-campo', description: 'A artilheira espanhola', unlockSource: ['career', 'minigame'] },
  { id: 'world_irene_paredes', name: 'Irene Paredes', emoji: '🛡️', rarity: 'rare', category: 'player', country: 'ES', position: 'Zagueira', description: 'A defensora espanhola', unlockSource: ['career', 'minigame'] },
  { id: 'world_lea_schuller', name: 'Lea Schüller', emoji: '🇩🇪', rarity: 'rare', category: 'player', country: 'DE', position: 'Atacante', description: 'A nova artilheira alemã', unlockSource: ['career', 'minigame'] },
  { id: 'world_lina_magull', name: 'Lina Magull', emoji: '🎭', rarity: 'rare', category: 'player', country: 'DE', position: 'Meio-campo', description: 'A criadora alemã', unlockSource: ['career', 'minigame'] },
  { id: 'world_kadidiatou_diani', name: 'Kadidiatou Diani', emoji: '🇫🇷', rarity: 'rare', category: 'player', country: 'FR', position: 'Atacante', description: 'A velocista francesa', unlockSource: ['career', 'minigame'] },
  { id: 'world_selma_bacha', name: 'Selma Bacha', emoji: '🇫🇷', rarity: 'rare', category: 'player', country: 'FR', position: 'Lateral', description: 'A lateral ofensiva', unlockSource: ['career', 'minigame'] },
  { id: 'world_barbara_bonanse', name: 'Bárbara Bonansea', emoji: '🇮🇹', rarity: 'rare', category: 'player', country: 'IT', position: 'Atacante', description: 'A estrela italiana', unlockSource: ['career', 'minigame'] },
  { id: 'world_cristiana_girelli', name: 'Cristiana Girelli', emoji: '🇮🇹', rarity: 'rare', category: 'player', country: 'IT', position: 'Atacante', description: 'A artilheira italiana', unlockSource: ['career', 'minigame'] },
  { id: 'world_mana_iwabuchi', name: 'Mana Iwabuchi', emoji: '🇯🇵', rarity: 'rare', category: 'player', country: 'JP', position: 'Atacante', description: 'A pequena gigante japonesa', unlockSource: ['career', 'minigame'] },
  { id: 'world_yui_hasegawa', name: 'Yui Hasegawa', emoji: '🇯🇵', rarity: 'rare', category: 'player', country: 'JP', position: 'Meio-campo', description: 'A armadora japonesa', unlockSource: ['career', 'minigame'] },
  { id: 'world_sam_mewis', name: 'Sam Mewis', emoji: '🇺🇸', rarity: 'rare', category: 'player', country: 'US', position: 'Meio-campo', description: 'A torre de poder americana', unlockSource: ['career', 'minigame'] },
  { id: 'world_rose_lavelle', name: 'Rose Lavelle', emoji: '🌹', rarity: 'rare', category: 'player', country: 'US', position: 'Meio-campo', description: 'A dribladora americana', unlockSource: ['career', 'minigame'] },
  { id: 'world_lindsey_horan', name: 'Lindsey Horan', emoji: '🇺🇸', rarity: 'rare', category: 'player', country: 'US', position: 'Meio-campo', description: 'A capitã americana', unlockSource: ['career', 'minigame'] },
  { id: 'world_sophia_smith', name: 'Sophia Smith', emoji: '⭐', rarity: 'rare', category: 'player', country: 'US', position: 'Atacante', description: 'A nova estrela americana', unlockSource: ['career', 'minigame'] },
  { id: 'world_trinity_rodman', name: 'Trinity Rodman', emoji: '⚡', rarity: 'rare', category: 'player', country: 'US', position: 'Atacante', description: 'A jovem promessa', unlockSource: ['career', 'minigame'] },
  { id: 'world_alyssa_naeher', name: 'Alyssa Naeher', emoji: '🧤', rarity: 'rare', category: 'player', country: 'US', position: 'Goleira', description: 'A goleira americana', unlockSource: ['career', 'minigame'] },
  { id: 'world_ashley_lawrence', name: 'Ashley Lawrence', emoji: '🇨🇦', rarity: 'rare', category: 'player', country: 'CA', position: 'Lateral', description: 'A canadense versátil', unlockSource: ['career', 'minigame'] },
  { id: 'world_jessie_fleming', name: 'Jessie Fleming', emoji: '🇨🇦', rarity: 'rare', category: 'player', country: 'CA', position: 'Meio-campo', description: 'A joia canadense', unlockSource: ['career', 'minigame'] },
  { id: 'world_janine_beckie', name: 'Janine Beckie', emoji: '🇨🇦', rarity: 'rare', category: 'player', country: 'CA', position: 'Atacante', description: 'A atacante canadense', unlockSource: ['career', 'minigame'] },
  { id: 'world_stina_blackstenius', name: 'Stina Blackstenius', emoji: '🇸🇪', rarity: 'rare', category: 'player', country: 'SE', position: 'Atacante', description: 'A artilheira sueca', unlockSource: ['career', 'minigame'] },
  { id: 'world_kosovare_asllani', name: 'Kosovare Asllani', emoji: '🇸🇪', rarity: 'rare', category: 'player', country: 'SE', position: 'Meio-campo', description: 'A sueca técnica', unlockSource: ['career', 'minigame'] },
  { id: 'world_friman_rolfo', name: 'Fridolina Rolfö', emoji: '🇸🇪', rarity: 'rare', category: 'player', country: 'SE', position: 'Atacante', description: 'A sueca versátil', unlockSource: ['career', 'minigame'] },
  { id: 'world_felicitas_rauch', name: 'Felicitas Rauch', emoji: '🇩🇪', rarity: 'rare', category: 'player', country: 'DE', position: 'Lateral', description: 'A lateral alemã', unlockSource: ['career', 'minigame'] },
  { id: 'world_sydney_lohmann', name: 'Sydney Lohmann', emoji: '🇩🇪', rarity: 'rare', category: 'player', country: 'DE', position: 'Meio-campo', description: 'A jovem alemã', unlockSource: ['career', 'minigame'] },
  { id: 'world_claire_emslie', name: 'Claire Emslie', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', rarity: 'rare', category: 'player', country: 'GB', position: 'Atacante', description: 'A escocesa rápida', unlockSource: ['career', 'minigame'] },
  { id: 'world_catarina_macario', name: 'Catarina Macario', emoji: '🇺🇸', rarity: 'rare', category: 'player', country: 'US', position: 'Meio-campo', description: 'A brasileira-americana', unlockSource: ['career', 'minigame'] },
];

// Coleção completa de figurinhas disponíveis
export const STICKERS_COLLECTION = [
  // === FIGURINHAS DOURADAS (Mini-games) ===
  { id: 'golden_bola_ouro', name: 'Bola de Ouro', emoji: '⚽', rarity: 'legendary', category: 'golden', description: 'A bola mais cobiçada do futebol', unlockSource: ['minigame'], hasGlitter: true, hasAnimation: true },
  { id: 'golden_trofeu_copa', name: 'Troféu da Copa', emoji: '🏆', rarity: 'legendary', category: 'golden', description: 'O troféu máximo do campeonato', unlockSource: ['minigame', 'career'], hasGlitter: true, hasAnimation: true },
  { id: 'golden_chuteira_ouro', name: 'Chuteira de Ouro', emoji: '👟', rarity: 'epic', category: 'golden', description: 'Para os artilheiros de plantão', unlockSource: ['minigame'], hasGlitter: true },
  { id: 'golden_luva_ouro', name: 'Luva de Ouro', emoji: '🧤', rarity: 'epic', category: 'golden', description: 'Defesas impecáveis merecem reconhecimento', unlockSource: ['minigame'], hasGlitter: true },
  { id: 'golden_camisa_10', name: 'Camisa 10', emoji: '🔟', rarity: 'rare', category: 'golden', description: 'O número dos craques', unlockSource: ['minigame', 'career'] },
  { id: 'golden_bandeira_br', name: 'Brasil Campeão', emoji: '🇧🇷', rarity: 'rare', category: 'golden', description: 'País do futebol', unlockSource: ['minigame', 'story'] },
  { id: 'golden_escudo_time', name: 'Escudo de Clube', emoji: '🛡️', rarity: 'rare', category: 'golden', description: 'Defenda suas cores', unlockSource: ['minigame', 'career'] },
  { id: 'golden_apito', name: 'Apito de Ouro', emoji: '📢', rarity: 'common', category: 'golden', description: 'O árbitro apitou, é gol!', unlockSource: ['minigame'] },
  { id: 'golden_rede_gol', name: 'Rede do Gol', emoji: '🥅', rarity: 'common', category: 'golden', description: 'Balançou a rede!', unlockSource: ['minigame'] },
  
  // === COSMÉTICOS ===
  { id: 'cos_coroa_real', name: 'Coroa Real', emoji: '👑', rarity: 'epic', category: 'cosmetic', description: 'Acessório dourado brilhante', unlockSource: ['lesson', 'code'], hasGlitter: true },
  { id: 'cos_olhos_brilhantes', name: 'Olhos Brilhantes', emoji: '✨', rarity: 'rare', category: 'cosmetic', description: 'Brilho mágico nos olhos', unlockSource: ['lesson', 'code'] },
  { id: 'cos_asas_douradas', name: 'Asas Douradas', emoji: '🪽', rarity: 'epic', category: 'cosmetic', description: 'Asas cintilantes', unlockSource: ['lesson', 'code'], hasGlitter: true },
  { id: 'cos_coracao_rosa', name: 'Coração Rosa', emoji: '💖', rarity: 'common', category: 'cosmetic', description: 'Acessório fofo', unlockSource: ['lesson', 'code'] },
  { id: 'cos_estrela', name: 'Estrela Cintilante', emoji: '⭐', rarity: 'rare', category: 'cosmetic', description: 'Brilha no escuro', unlockSource: ['lesson', 'code'] },
  { id: 'cos_aureola', name: 'Auréola Celestial', emoji: '🌙', rarity: 'epic', category: 'cosmetic', description: 'Halo misterioso', unlockSource: ['lesson', 'code'], hasGlitter: true },
  { id: 'cos_flores', name: 'Flores Mágicas', emoji: '🌸', rarity: 'common', category: 'cosmetic', description: 'Floresce na cabeça', unlockSource: ['lesson', 'code'] },
  { id: 'cos_gema_roxa', name: 'Gema Roxa', emoji: '💎', rarity: 'legendary', category: 'cosmetic', description: 'Joia rara e poderosa', unlockSource: ['lesson', 'code'], hasGlitter: true, hasAnimation: true },
  { id: 'cos_arcoiris', name: 'Arco-Íris', emoji: '🌈', rarity: 'rare', category: 'cosmetic', description: 'Arco mágico', unlockSource: ['lesson', 'code'] },
  { id: 'cos_coroa_rainha', name: 'Coroa de Rainha', emoji: '👸', rarity: 'legendary', category: 'cosmetic', description: 'Máxima raridade', unlockSource: ['lesson', 'code'], hasGlitter: true, hasAnimation: true },
  
  // === JOGADORAS FICTÍCIAS DO JOGO ===
  { id: 'player_luna', name: 'Luna', emoji: '🌙', rarity: 'common', category: 'player', description: 'A capitã corajosa', unlockSource: ['career', 'story'], unlockRequirements: { careerLevel: 1, storyChapter: 1 } },
  { id: 'player_maya', name: 'Maya', emoji: '🌺', rarity: 'common', category: 'player', description: 'Veloz como o vento', unlockSource: ['career', 'minigame'], unlockRequirements: { careerLevel: 2, minigameId: 'dribble', minScore: 50 } },
  { id: 'player_zoe', name: 'Zoe', emoji: '⭐', rarity: 'common', category: 'player', description: 'Goleira imbatível', unlockSource: ['career', 'minigame'], unlockRequirements: { careerLevel: 3, minigameId: 'penalty', minScore: 30 } },
  { id: 'player_ana', name: 'Ana', emoji: '🔥', rarity: 'rare', category: 'player', description: 'Artilheira nata', unlockSource: ['career', 'minigame'], unlockRequirements: { careerLevel: 5, minigameId: 'shooting', minScore: 100 }, hasGlitter: true },
  { id: 'player_bia', name: 'Bia', emoji: '🛡️', rarity: 'rare', category: 'player', description: 'Defensora feroz', unlockSource: ['career', 'story'], unlockRequirements: { careerLevel: 6, storyChapter: 3 }, hasGlitter: true },
  { id: 'player_duda', name: 'Duda', emoji: '⚡', rarity: 'epic', category: 'player', description: 'Lenda do cabeceio', unlockSource: ['career', 'minigame'], unlockRequirements: { careerLevel: 10, minigameId: 'headers', minScore: 150 }, hasGlitter: true, hasAnimation: true },
  
  // === MOMENTOS ===
  { id: 'moment_first_goal', name: 'Primeiro Gol', emoji: '🥅', rarity: 'common', category: 'moment', description: 'O gol que começou tudo', unlockSource: ['story'], unlockRequirements: { storyChapter: 1 } },
  { id: 'moment_team_huddle', name: 'Abraço em Grupo', emoji: '🤗', rarity: 'common', category: 'moment', description: 'União faz a força', unlockSource: ['story'], unlockRequirements: { storyChapter: 2 } },
  { id: 'moment_victory_dance', name: 'Dança da Vitória', emoji: '💃', rarity: 'rare', category: 'moment', description: 'Comemoração inesquecível', unlockSource: ['career'], unlockRequirements: { careerLevel: 7 }, hasGlitter: true },
  { id: 'moment_championship', name: 'Final do Campeonato', emoji: '🏟️', rarity: 'epic', category: 'moment', description: 'O dia mais esperado', unlockSource: ['career', 'story'], unlockRequirements: { careerLevel: 18, storyChapter: 8 }, hasGlitter: true, hasAnimation: true },
  
  // === TROFÉUS ===
  { id: 'trophy_striker', name: 'Artilheira', emoji: '🥇', rarity: 'rare', category: 'trophy', description: 'Marcou 50 gols', unlockSource: ['career'], unlockRequirements: { careerLevel: 10 }, hasGlitter: true },
  { id: 'trophy_mvp', name: 'Melhor do Mundo', emoji: '🌟', rarity: 'epic', category: 'trophy', description: 'Eleita a melhor', unlockSource: ['career'], unlockRequirements: { careerLevel: 20 }, hasGlitter: true, hasAnimation: true },
  { id: 'trophy_legend', name: 'Lenda do Futebol', emoji: '👑', rarity: 'legendary', category: 'trophy', description: 'Completou todos os desafios', unlockSource: ['career'], unlockRequirements: { careerLevel: 30 }, hasGlitter: true, hasAnimation: true },
];

// Códigos válidos pré-definidos
export const VALID_CODES = {
  'COROA2024': ['cos_coroa_real'],
  'BRILHO2024': ['cos_olhos_brilhantes', 'cos_estrela'],
  'ASAS2024': ['cos_asas_douradas'],
  'AMOR2024': ['cos_coracao_rosa'],
  'MAGICA2024': ['cos_aureola', 'cos_flores'],
  'GEMA2024': ['cos_gema_roxa'],
  'ARCOIRIS': ['cos_arcoiris'],
  'RAINHA2024': ['cos_coroa_rainha'],
  'TUDO': ['cos_coroa_real', 'cos_olhos_brilhantes', 'cos_asas_douradas', 'cos_coracao_rosa', 'cos_estrela', 'cos_aureola', 'cos_flores', 'cos_gema_roxa', 'cos_arcoiris', 'cos_coroa_rainha'],
  'BOLAOURO': ['golden_bola_ouro'],
  'TROFEU2024': ['golden_trofeu_copa'],
  'CHUTEIRA10': ['golden_chuteira_ouro'],
  'LUVA2024': ['golden_luva_ouro'],
  'CAMISA10': ['golden_camisa_10'],
  'BRASIL': ['golden_bandeira_br'],
  // Códigos para jogadoras do Brasil
  'MARTA': ['bra_marta'],
  'FORMIGA': ['bra_formiga'],
  'SISSI': ['bra_sissi'],
  'DEBINHA': ['bra_debinha'],
  'CRISTIANE': ['bra_cristiane'],
  'RAIOX': ['bra_gabi_nunes'],
  // Códigos para jogadoras do mundo
  'RAPINOE': ['world_megan_rapinoe'],
  'ALEXIA': ['world_alexia_putellas'],
  'ALEXMORGAN': ['world_alex_morgan'],
  'AITANA': ['world_aitana_bonmati'],
  'SAMKERR': ['world_sam_kerr'],
  'MIAHAMM': ['world_mia_hamm'],
};

// Chaves do localStorage
const STORAGE_KEY = 'molecas_unified_album_v2';
const USED_CODES_KEY = 'molecas_used_codes';
const DONATIONS_KEY = 'molecas_donations';
const GLOBAL_TRADES_KEY = 'molecas_global_trades';

// Gerar código único de troca baseado na figurinha
export function generateTradeCode(stickerId) {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).toUpperCase().slice(-4);
  const typeHash = stickerId.substring(0, 4).toUpperCase();
  return `${typeHash}-${timestamp}-${random}`;
}

// Gerar código de troca global
export function generateGlobalTradeCode(stickerId, uniqueId) {
  const stickerHash = stickerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(36).toUpperCase().slice(-3);
  const uniqueHash = uniqueId.slice(-4).toUpperCase();
  const random = Math.random().toString(36).toUpperCase().slice(-3);
  return `TROCA-${stickerHash}${uniqueHash}-${random}`;
}

// Carregar álbum do localStorage
export function loadUnifiedAlbum() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  
  return migrateOldData();
}

// Salvar álbum
export function saveUnifiedAlbum(album) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(album));
  } catch {}
}

// Migrar dados antigos
function migrateOldData() {
  const newAlbum = { stickers: {}, totalPasted: 0, lastUpdated: new Date().toISOString() };
  
  try {
    const oldCollection = JSON.parse(localStorage.getItem('sticker_collection') || '[]');
    const oldToNew = {
      1: 'cos_coroa_real',
      2: 'cos_olhos_brilhantes',
      3: 'cos_asas_douradas',
      4: 'cos_coracao_rosa',
      5: 'cos_estrela',
      6: 'cos_aureola',
      7: 'cos_flores',
      8: 'cos_gema_roxa',
      9: 'cos_arcoiris',
      10: 'cos_coroa_rainha',
    };
    
    oldCollection.forEach((oldId) => {
      const stickerDef = STICKERS_COLLECTION.find(s => s.id === oldToNew[oldId]);
      if (stickerDef) {
        const uniqueId = `${stickerDef.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        newAlbum.stickers[uniqueId] = {
          ...stickerDef,
          uniqueId,
          code: generateTradeCode(stickerDef.id),
          obtainedAt: new Date().toISOString(),
          isNew: false,
          isPasted: true,
          pastedAt: new Date().toISOString(),
          quantity: 1,
          source: 'migrated',
        };
        newAlbum.totalPasted++;
      }
    });
    
    const oldGolden = JSON.parse(localStorage.getItem('molecas_unified_album') || '{}');
    if (oldGolden.stickers) {
      Object.values(oldGolden.stickers).forEach((oldSticker) => {
        if (oldSticker.type === 'golden') {
          const stickerDef = STICKERS_COLLECTION.find(s => s.id === `golden_${oldSticker.id}`);
          if (stickerDef && !Object.values(newAlbum.stickers).some((s) => s.id === stickerDef.id)) {
            const uniqueId = `${stickerDef.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            newAlbum.stickers[uniqueId] = {
              ...stickerDef,
              uniqueId,
              code: oldSticker.code || generateTradeCode(stickerDef.id),
              obtainedAt: oldSticker.earnedAt || new Date().toISOString(),
              isNew: false,
              isPasted: oldSticker.pasted || false,
              pastedAt: oldSticker.pastedAt,
              quantity: 1,
              source: oldSticker.source || 'migrated',
            };
            if (oldSticker.pasted) newAlbum.totalPasted++;
          }
        }
      });
    }
    
    saveUnifiedAlbum(newAlbum);
  } catch {}
  
  return newAlbum;
}

// Adicionar figurinha ao álbum
export function addStickerToAlbum(stickerId, source = 'unknown', isNew = true) {
  const stickerDef = STICKERS_COLLECTION.find(s => s.id === stickerId);
  if (!stickerDef) return null;
  
  const album = loadUnifiedAlbum();
  const existing = Object.values(album.stickers).find(s => s.id === stickerId);
  
  if (existing) {
    existing.quantity++;
    saveUnifiedAlbum(album);
    return existing;
  }
  
  const uniqueId = `${stickerId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newSticker = {
    ...stickerDef,
    uniqueId,
    code: generateTradeCode(stickerId),
    obtainedAt: new Date().toISOString(),
    isNew,
    isPasted: false,
    quantity: 1,
    source,
    tradeUsed: false,
  };
  
  album.stickers[uniqueId] = newSticker;
  album.lastUpdated = new Date().toISOString();
  saveUnifiedAlbum(album);
  
  return newSticker;
}

// Colar figurinha no álbum
export function pasteSticker(uniqueId) {
  const album = loadUnifiedAlbum();
  const sticker = album.stickers[uniqueId];
  
  if (!sticker || sticker.isPasted) return false;
  
  sticker.isPasted = true;
  sticker.pastedAt = new Date().toISOString();
  sticker.isNew = false;
  album.totalPasted++;
  album.lastUpdated = new Date().toISOString();
  
  saveUnifiedAlbum(album);
  return true;
}

// Usar código pré-definido
export function redeemCode(code) {
  const upperCode = code.trim().toUpperCase();
  
  const usedCodes = JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]');
  if (usedCodes.includes(upperCode)) {
    return { success: false, error: 'Código já utilizado!' };
  }
  
  const stickerIds = VALID_CODES[upperCode];
  if (!stickerIds) {
    return { success: false, error: 'Código inválido!' };
  }
  
  const added = [];
  stickerIds.forEach(id => {
    const sticker = addStickerToAlbum(id, 'code', true);
    if (sticker) added.push(sticker);
  });
  
  usedCodes.push(upperCode);
  localStorage.setItem(USED_CODES_KEY, JSON.stringify(usedCodes));
  
  return { success: true, stickers: added };
}

// Gerar código de doação/troca
export function donateSticker(uniqueId) {
  const album = loadUnifiedAlbum();
  const sticker = album.stickers[uniqueId];
  
  if (!sticker) {
    return { success: false, error: 'Figurinha não encontrada' };
  }
  
  if (sticker.quantity <= 1 && !sticker.isPasted) {
    return { success: false, error: 'Você precisa ter uma repetida para trocar' };
  }
  
  if (sticker.quantity > 1) {
    sticker.quantity--;
  } else {
    delete album.stickers[uniqueId];
    if (sticker.isPasted) album.totalPasted--;
  }
  
  const transferCode = generateGlobalTradeCode(sticker.id, uniqueId);
  
  const globalTrades = JSON.parse(localStorage.getItem(GLOBAL_TRADES_KEY) || '{}');
  globalTrades[transferCode] = {
    stickerId: sticker.id,
    stickerName: sticker.name,
    stickerAvatar: sticker.avatar || sticker.flag || sticker.icon || '',
    stickerRarity: sticker.rarity,
    stickerCategory: sticker.category,
    stickerDescription: sticker.description,
    donatedAt: new Date().toISOString(),
    redeemed: false,
  };
  localStorage.setItem(GLOBAL_TRADES_KEY, JSON.stringify(globalTrades));
  
  saveUnifiedAlbum(album);
  
  return { success: true, code: transferCode };
}

// Resgatar figurinha doada
export function redeemDonatedSticker(code) {
  const upperCode = code.trim().toUpperCase();
  
  if (!upperCode.startsWith('TROCA-')) {
    return { success: false, error: 'Código inválido. Use um código de troca válido.' };
  }
  
  const usedCodes = JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]');
  if (usedCodes.includes(upperCode)) {
    return { success: false, error: 'Você já usou este código!' };
  }
  
  const globalTrades = JSON.parse(localStorage.getItem(GLOBAL_TRADES_KEY) || '{}');
  const trade = globalTrades[upperCode];
  
  if (!trade) {
    return tryRedeemFromCodePattern(upperCode);
  }
  
  if (trade.redeemed) {
    return { success: false, error: 'Este código já foi resgatado por outra pessoa' };
  }
  
  const sticker = addStickerToAlbum(trade.stickerId, 'trade', true);
  
  if (!sticker) {
    return { success: false, error: 'Erro ao adicionar figurinha' };
  }
  
  trade.redeemed = true;
  trade.redeemedAt = new Date().toISOString();
  globalTrades[upperCode] = trade;
  localStorage.setItem(GLOBAL_TRADES_KEY, JSON.stringify(globalTrades));
  
  usedCodes.push(upperCode);
  localStorage.setItem(USED_CODES_KEY, JSON.stringify(usedCodes));
  
  return { success: true, sticker };
}

// Tentar resgatar baseado no padrão do código
function tryRedeemFromCodePattern(code) {
  const parts = code.split('-');
  if (parts.length !== 3) {
    return { success: false, error: 'Formato de código inválido' };
  }
  
  const stickerHash = parts[1].slice(0, 3);
  
  const possibleStickers = STICKERS_COLLECTION.filter(s => {
    const computedHash = s.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(36).toUpperCase().slice(-3);
    return computedHash === stickerHash;
  });
  
  if (possibleStickers.length === 0) {
    return { success: false, error: 'Código não reconhecido. A figurinha pode não estar disponível.' };
  }
  
  const stickerDef = possibleStickers[0];
  
  const usedCodes = JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]');
  if (usedCodes.includes(code)) {
    return { success: false, error: 'Você já usou este código!' };
  }
  
  const sticker = addStickerToAlbum(stickerDef.id, 'trade', true);
  
  if (!sticker) {
    return { success: false, error: 'Erro ao adicionar figurinha' };
  }
  
  usedCodes.push(code);
  localStorage.setItem(USED_CODES_KEY, JSON.stringify(usedCodes));
  
  return { success: true, sticker };
}

// Sortear figurinha aleatória
export function drawRandomSticker(preferredRarity) {
  const rand = Math.random();
  let cumulative = 0;
  
  const weights = { ...RARITY_CONFIG };
  if (preferredRarity) {
    const boost = weights[preferredRarity].probability * 0.5;
    weights[preferredRarity].probability += boost;
    const others = Object.keys(weights).filter(r => r !== preferredRarity);
    others.forEach(r => {
      weights[r].probability -= boost / others.length;
    });
  }
  
  for (const [rarity, config] of Object.entries(weights)) {
    cumulative += config.probability;
    if (rand <= cumulative) {
      const available = STICKERS_COLLECTION.filter(s => s.rarity === rarity);
      return available[Math.floor(Math.random() * available.length)];
    }
  }
  
  return STICKERS_COLLECTION[0];
}

// Ganhar figurinha de mini-game
export function earnMinigameSticker(gameName, score) {
  const lastWinKey = `molecas_lastwin_${gameName}`;
  const lastWin = localStorage.getItem(lastWinKey);
  const now = Date.now();
  
  if (lastWin && (now - parseInt(lastWin)) < 24 * 60 * 60 * 1000) {
    return null;
  }
  
  let chance = 0.30;
  if (score >= 200) chance = 0.60;
  else if (score >= 150) chance = 0.50;
  else if (score >= 100) chance = 0.40;
  
  if (Math.random() > chance) return null;
  
  let preferredRarity;
  if (score >= 250) preferredRarity = 'legendary';
  else if (score >= 180) preferredRarity = 'epic';
  else if (score >= 100) preferredRarity = 'rare';
  
  const drawn = drawRandomSticker(preferredRarity);
  const sticker = addStickerToAlbum(drawn.id, gameName, true);
  
  if (sticker) {
    localStorage.setItem(lastWinKey, now.toString());
  }
  
  return sticker;
}

// Calcular progresso
export function calculateProgress() {
  const album = loadUnifiedAlbum();
  const userStickers = Object.values(album.stickers);
  const total = STICKERS_COLLECTION.length;
  const obtained = new Set(userStickers.map(s => s.id)).size;
  const pasted = album.totalPasted;
  
  const byRarity = {};
  const byCategory = {};
  
  Object.keys(RARITY_CONFIG).forEach(rarity => {
    const totalRarity = STICKERS_COLLECTION.filter(s => s.rarity === rarity).length;
    const obtainedIds = new Set(userStickers.filter(s => s.rarity === rarity).map(s => s.id));
    const pastedRarity = userStickers.filter(s => s.rarity === rarity && s.isPasted).length;
    byRarity[rarity] = { total: totalRarity, obtained: obtainedIds.size, pasted: pastedRarity };
  });
  
  const categories = [...new Set(STICKERS_COLLECTION.map(s => s.category))];
  categories.forEach(cat => {
    const totalCat = STICKERS_COLLECTION.filter(s => s.category === cat).length;
    const obtainedCat = new Set(userStickers.filter(s => s.category === cat).map(s => s.id)).size;
    byCategory[cat] = { total: totalCat, obtained: obtainedCat };
  });
  
  return {
    total,
    obtained,
    pasted,
    percentage: Math.round((obtained / total) * 100),
    byRarity,
    byCategory,
  };
}

// Obter figurinhas novas
export function getNewStickers() {
  const album = loadUnifiedAlbum();
  return Object.values(album.stickers).filter(s => s.isNew);
}

// Marcar todas como vistas
export function markAllAsSeen() {
  const album = loadUnifiedAlbum();
  Object.values(album.stickers).forEach(s => s.isNew = false);
  saveUnifiedAlbum(album);
}

// Obter repetidas disponíveis para troca
export function getTradableStickers() {
  const album = loadUnifiedAlbum();
  return Object.values(album.stickers).filter(s => s.quantity > 1 || (s.quantity === 1 && s.isPasted));
}
