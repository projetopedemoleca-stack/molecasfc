const fs = require('fs');
let c = fs.readFileSync('Profile.jsx', 'utf8');
const start = c.indexOf('const MEDALS = [');
const end = c.indexOf('];', start) + 2;
const before = c.substring(0, start);
const after = c.substring(end);
const fixed = before + `const MEDALS = [
  { id: 'first_win',  name: 'Primeira Vitória', emoji: '🥇', desc: 'Vença sua primeira partida',  condition: (s) => (s?.wins   || 0) >= 1  },
  { id: '3_goals',   name: 'Artilheira',        emoji: '⚽', desc: 'Marque 3 gols em partidas',   condition: (s) => (s?.goals  || 0) >= 3  },
  { id: 'streak_3',  name: 'Em Chamas',         emoji: '🔥', desc: 'Vença 3 partidas seguidas',   condition: (s) => (s?.bestStreak || 0) >= 3 },
  { id: '10_matches', name: 'Veterana',         emoji: '🏆', desc: 'Jogue 10 partidas',           condition: (s) => (s?.matches || 0) >= 10 },
  { id: '5_wins',    name: 'Campeã',            emoji: '👑', desc: 'Vença 5 partidas',            condition: (s) => (s?.wins   || 0) >= 5  },
];` + after;
fs.writeFileSync('Profile.jsx', fixed, 'utf8');
console.log('Done');
