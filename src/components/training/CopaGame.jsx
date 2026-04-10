import React, { useState } from 'react';
import { motion } from 'framer-motion';

const KEY_WORLDCUP = 'molecas_worldcup_v2';

const ALL_TEAMS = {
  fem: [
    { id: 'bra', name: 'Brasil', flag: '🇧🇷', group: 'A' }, { id: 'fra', name: 'França', flag: '🇫🇷', group: 'A' },
    { id: 'jpn', name: 'Japão', flag: '🇯🇵', group: 'A' }, { id: 'nga', name: 'Nigéria', flag: '🇳🇬', group: 'A' },
    { id: 'usa', name: 'EUA', flag: '🇺🇸', group: 'B' }, { id: 'ger', name: 'Alemanha', flag: '🇩🇪', group: 'B' },
    { id: 'aus', name: 'Austrália', flag: '🇦🇺', group: 'B' }, { id: 'col', name: 'Colômbia', flag: '🇨🇴', group: 'B' },
    { id: 'esp', name: 'Espanha', flag: '🇪🇸', group: 'C' }, { id: 'swe', name: 'Suécia', flag: '🇸🇪', group: 'C' },
    { id: 'ned', name: 'Holanda', flag: '🇳🇱', group: 'C' }, { id: 'kor', name: 'Coreia do Sul', flag: '🇰🇷', group: 'C' },
    { id: 'eng', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'D' }, { id: 'arg', name: 'Argentina', flag: '🇦🇷', group: 'D' },
    { id: 'chn', name: 'China', flag: '🇨🇳', group: 'D' }, { id: 'den', name: 'Dinamarca', flag: '🇩🇰', group: 'D' },
  ],
  masc: [
    { id: 'bra', name: 'Brasil', flag: '🇧🇷', group: 'A' }, { id: 'arg', name: 'Argentina', flag: '🇦🇷', group: 'A' },
    { id: 'fra', name: 'França', flag: '🇫🇷', group: 'A' }, { id: 'mar', name: 'Marrocos', flag: '🇲🇦', group: 'A' },
    { id: 'esp', name: 'Espanha', flag: '🇪🇸', group: 'B' }, { id: 'ger', name: 'Alemanha', flag: '🇩🇪', group: 'B' },
    { id: 'por', name: 'Portugal', flag: '🇵🇹', group: 'B' }, { id: 'uru', name: 'Uruguai', flag: '🇺🇾', group: 'B' },
    { id: 'eng', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'C' }, { id: 'ned', name: 'Holanda', flag: '🇳🇱', group: 'C' },
    { id: 'ita', name: 'Itália', flag: '🇮🇹', group: 'C' }, { id: 'cro', name: 'Croácia', flag: '🇭🇷', group: 'C' },
  ],
};

function generateGroupMatches(teams) {
  const matches = [];
  for (let i = 0; i < teams.length; i++)
    for (let j = i + 1; j < teams.length; j++)
      matches.push({ id: `${teams[i].id}-${teams[j].id}`, home: teams[i], away: teams[j], homeGoals: '', awayGoals: '', played: false });
  return matches;
}

function initData() {
  const data = { fem: {}, masc: {} };
  ['fem', 'masc'].forEach(gender => {
    const teams = ALL_TEAMS[gender];
    const groups = [...new Set(teams.map(t => t.group))];
    groups.forEach(group => {
      const gt = teams.filter(t => t.group === group);
      data[gender][group] = { teams: gt, matches: generateGroupMatches(gt) };
    });
    data[gender].knockout = {
      quarter: Array(4).fill(null).map(() => ({ home: null, away: null, result: null })),
      semi: Array(2).fill(null).map(() => ({ home: null, away: null, result: null })),
      final: { home: null, away: null, result: null, champion: null },
    };
    data[gender].completed = false;
  });
  return data;
}

function loadData() {
  try { const s = localStorage.getItem(KEY_WORLDCUP); if (s) return JSON.parse(s); } catch {}
  return initData();
}

function calcStandings(gd) {
  const s = gd.teams.map(t => ({ ...t, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 }));
  gd.matches.forEach(m => {
    if (!m.played) return;
    const home = s.find(t => t.id === m.home.id), away = s.find(t => t.id === m.away.id);
    const hg = parseInt(m.homeGoals)||0, ag = parseInt(m.awayGoals)||0;
    home.j++; away.j++; home.gp += hg; home.gc += ag; away.gp += ag; away.gc += hg;
    if (hg > ag) { home.p += 3; home.v++; away.d++; } else if (hg < ag) { away.p += 3; away.v++; home.d++; } else { home.p++; home.e++; away.p++; away.e++; }
  });
  s.forEach(t => { t.sg = t.gp - t.gc; });
  return s.sort((a,b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);
}

export default function CopaGame() {
  const [gender, setGender] = useState('fem');
  const [data, setData] = useState(loadData);
  const [view, setView] = useState('groups');
  const cd = data[gender];

  const save = (next) => { localStorage.setItem(KEY_WORLDCUP, JSON.stringify(next)); setData(next); };

  const updateMatch = (group, matchId, field, value) => {
    const next = JSON.parse(JSON.stringify(data));
    const m = next[gender][group].matches.find(m => m.id === matchId);
    if (m) { m[field] = value; m.played = m.homeGoals !== '' && m.awayGoals !== ''; }
    save(next);
  };

  const allPlayed = () => Object.entries(cd).every(([k,g]) => k === 'knockout' || k === 'completed' || (typeof g === 'object' && g.matches?.every(m => m.played)));

  const advanceToKnockout = () => {
    const next = JSON.parse(JSON.stringify(data));
    const qualifiers = [];
    Object.entries(next[gender]).forEach(([k, gd]) => {
      if (k === 'knockout' || k === 'completed') return;
      calcStandings(gd).slice(0, 2).forEach(t => qualifiers.push(t));
    });
    next[gender].knockout.quarter = [
      { home: qualifiers[0], away: qualifiers[3], result: null }, { home: qualifiers[2], away: qualifiers[1], result: null },
      { home: qualifiers[4], away: qualifiers[7]||qualifiers[4], result: null }, { home: qualifiers[6]||qualifiers[5], away: qualifiers[5], result: null },
    ];
    save(next); setView('knockout');
  };

  const setKnockoutResult = (round, idx, winner) => {
    const next = JSON.parse(JSON.stringify(data));
    next[gender].knockout[round][idx].result = winner;
    if (round === 'quarter') {
      const si = idx < 2 ? 0 : 1; const isHome = idx % 2 === 0;
      if (!next[gender].knockout.semi[si]) next[gender].knockout.semi[si] = { home: null, away: null, result: null };
      next[gender].knockout.semi[si][isHome ? 'home' : 'away'] = winner;
    } else if (round === 'semi') {
      next[gender].knockout.final[idx === 0 ? 'home' : 'away'] = winner;
    } else if (round === 'final') {
      next[gender].knockout.final.champion = winner;
      next[gender].completed = true;
    }
    save(next);
  };

  if (cd.completed && cd.knockout.final?.champion && view === 'trophy') {
    const champ = cd.knockout.final.champion;
    return (
      <div className="space-y-4 pb-4 text-center">
        <motion.div animate={{ rotate: [0,10,-10,0], y: [0,-10,0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-8xl mb-4">🏆</motion.div>
        <h2 className="font-heading font-bold text-2xl text-yellow-600">CAMPEÃ DA COPA!</h2>
        <div className="text-6xl">{champ.flag}</div>
        <p className="font-heading font-bold text-3xl">{champ.name}</p>
        <button onClick={() => setView('knockout')} className="w-full max-w-xs mx-auto py-3 bg-primary text-white rounded-2xl font-bold block">Ver Chaveamento</button>
        <button onClick={() => { save(initData()); setView('groups'); }} className="w-full max-w-xs mx-auto py-3 bg-muted text-foreground rounded-2xl font-bold block">🔄 Novo Torneio</button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="text-center mb-2"><span className="text-4xl block mb-1">🏆</span><p className="font-heading font-bold text-xl">Copa do Mundo</p></div>
      <div className="flex bg-muted rounded-2xl p-1">
        {[['fem','⚽ Feminino'],['masc','⚽ Masculino']].map(([g,l]) => (
          <button key={g} onClick={() => setGender(g)} className={`flex-1 py-2 rounded-xl font-heading font-bold text-sm transition-all ${gender === g ? 'bg-card shadow' : 'text-muted-foreground'}`}>{l}</button>
        ))}
      </div>
      <div className="flex gap-2">
        {[['groups','Fase de Grupos'],['knockout','Eliminatórias']].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)} className={`flex-1 py-2 rounded-xl font-bold text-sm ${view === v ? 'bg-primary text-white' : 'bg-muted'}`}>{l}</button>
        ))}
        {cd.completed && <button onClick={() => setView('trophy')} className="flex-1 py-2 rounded-xl font-bold text-sm bg-yellow-500 text-white">🏆</button>}
      </div>

      {view === 'groups' && (
        <>
          {Object.entries(cd).map(([groupName, gd]) => {
            if (groupName === 'knockout' || groupName === 'completed') return null;
            const standings = calcStandings(gd);
            return (
              <div key={groupName} className="bg-card border border-border/30 rounded-2xl p-4">
                <h3 className="font-heading font-bold mb-3">Grupo {groupName}</h3>
                {standings.map((t, i) => (
                  <div key={t.id} className={`grid grid-cols-8 gap-1 py-1 text-sm ${i < 2 ? 'bg-green-500/10' : ''} rounded`}>
                    <span className="col-span-3 flex items-center gap-1"><span>{t.flag}</span><span className="truncate">{t.name}</span></span>
                    <span className="text-center font-bold">{t.p}</span><span className="text-center">{t.j}</span>
                    <span className="text-center">{t.v}</span><span className="text-center">{t.sg > 0 ? '+':''}{t.sg}</span>
                  </div>
                ))}
                <div className="mt-3 space-y-2">
                  {gd.matches.map(match => (
                    <div key={match.id} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                      <span className="text-xs flex-1 text-right">{match.home.flag} {match.home.name}</span>
                      <input type="number" min="0" max="20" value={match.homeGoals} onChange={e => updateMatch(groupName, match.id, 'homeGoals', e.target.value)} className="w-10 text-center bg-background rounded border-2 border-border/30 py-1 text-sm font-bold" />
                      <span className="text-muted-foreground">x</span>
                      <input type="number" min="0" max="20" value={match.awayGoals} onChange={e => updateMatch(groupName, match.id, 'awayGoals', e.target.value)} className="w-10 text-center bg-background rounded border-2 border-border/30 py-1 text-sm font-bold" />
                      <span className="text-xs flex-1">{match.away.name} {match.away.flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {allPlayed() && <button onClick={advanceToKnockout} className="w-full py-4 bg-primary text-white rounded-2xl font-heading font-bold text-lg">🏆 Avançar para Eliminatórias</button>}
        </>
      )}

      {view === 'knockout' && (
        <div className="space-y-4">
          {['quarter','semi'].map(round => (
            <div key={round} className="bg-card border border-border/30 rounded-2xl p-4">
              <h3 className="font-heading font-bold mb-3 text-center">{round === 'quarter' ? 'Quartas de Final' : 'Semifinais'}</h3>
              <div className="grid grid-cols-2 gap-2">
                {cd.knockout[round]?.map((match, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3">
                    {match.home && match.away ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <button onClick={() => !match.result && setKnockoutResult(round, i, match.home)} className={`flex items-center gap-1 text-xs ${match.result?.id === match.home.id ? 'font-bold text-green-600' : ''}`}><span>{match.home.flag}</span><span>{match.home.name}</span></button>
                          <span className="text-xs text-muted-foreground">VS</span>
                          <button onClick={() => !match.result && setKnockoutResult(round, i, match.away)} className={`flex items-center gap-1 text-xs ${match.result?.id === match.away.id ? 'font-bold text-green-600' : ''}`}><span>{match.away.name}</span><span>{match.away.flag}</span></button>
                        </div>
                        {match.result && <p className="text-xs text-center text-green-600 font-bold">✓ {match.result.name}</p>}
                      </>
                    ) : <p className="text-xs text-center text-muted-foreground py-2">Aguardando...</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border-2 border-yellow-400 rounded-2xl p-4">
            <h3 className="font-heading font-bold mb-3 text-center text-lg">🏆 GRANDE FINAL 🏆</h3>
            {cd.knockout.final?.home && cd.knockout.final?.away ? (
              <div className="flex items-center justify-center gap-4 mb-4">
                <button onClick={() => !cd.knockout.final.champion && setKnockoutResult('final', 0, cd.knockout.final.home)} className="text-center">
                  <span className="text-4xl">{cd.knockout.final.home.flag}</span>
                  <p className={`font-bold text-sm ${cd.knockout.final.champion?.id === cd.knockout.final.home.id ? 'text-green-600' : ''}`}>{cd.knockout.final.home.name}</p>
                </button>
                <span className="text-xl font-bold text-muted-foreground">VS</span>
                <button onClick={() => !cd.knockout.final.champion && setKnockoutResult('final', 0, cd.knockout.final.away)} className="text-center">
                  <span className="text-4xl">{cd.knockout.final.away.flag}</span>
                  <p className={`font-bold text-sm ${cd.knockout.final.champion?.id === cd.knockout.final.away.id ? 'text-green-600' : ''}`}>{cd.knockout.final.away.name}</p>
                </button>
              </div>
            ) : <p className="text-center text-muted-foreground py-4">Aguardando semifinais</p>}
            {cd.knockout.final?.champion && (
              <div className="text-center">
                <p className="text-xl font-bold text-yellow-600">🎉 {cd.knockout.final.champion.name} CAMPEÃ! 🎉</p>
                <button onClick={() => setView('trophy')} className="mt-3 px-6 py-2 bg-yellow-500 text-white rounded-xl font-bold">Ver Troféu 🏆</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}