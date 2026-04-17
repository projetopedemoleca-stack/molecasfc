// ═══════════════════════════════════════════════════════════════════════════
// FUT DE RUA — 1v1, dois gols, joystick + bot
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

const F_W = 360;
const F_H = 520;
const G_W = 110;
const G_H = 65;
const PR  = 22;
const BR  = 22;
const BALL_R = 9;

function clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }
function dist(a,b){ return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2); }

// Bolas com emojis reais (a garrafa tem tampa,etc)
const BALLS = [
  { id:'head',    name:'Cabeça de Boneca',  emoji:'🧠', spd:1.0 },
  { id:'can',     name:'Lata',              emoji:'🥫', spd:0.8 },
  { id:'stone',   name:'Pedra',             emoji:'🪨', spd:0.6 },
  { id:'paper',   name:'Papel Amassado',    emoji:'📄', spd:1.1 },
  { id:'bottle',  name:'Garrafinha',        emoji:'🍶', spd:1.0 },
  { id:'lemon',   name:'Limão',             emoji:'🍋', spd:1.0 },
  { id:'cap',     name:'Tampinha',           emoji:'🪙', spd:1.05 },
  { id:'tennis',  name:'Bolinha de Tênis',   emoji:'🎾', spd:1.15 },
  { id:'deflated',name:'Bola Murcha',        emoji:'⚽', spd:0.7 },
];

// Obstáculos com emojis coerentes
const OBSTACLES = [
  { id:'dog',    name:'Cachorrinho',     emoji:'🐕', beh:'patrol' },
  { id:'car',    name:'Carro Estacionado',emoji:'🚗', beh:'static' },
  { id:'cat',    name:'Gato',             emoji:'🐱', beh:'patrol' },
  { id:'bike',   name:'Bicicleta',        emoji:'🚲', beh:'static' },
  { id:'bin',    name:'Lixeira',          emoji:'🗑️', beh:'static' },
  { id:'granny', name:'Velhinha',          emoji:'👵', beh:'slow' },
  { id:'speaker',name:'Caixinha de Som',   emoji:'📻', beh:'static' },
];

const LVLS = [
  { label:'Nível 1', goals:3, t:60, botSpd:1.0, obs:1, desc:'Rua calma' },
  { label:'Nível 2', goals:4, t:55, botSpd:1.4, obs:2, desc:'Mais obstáculos' },
  { label:'Nível 3', goals:5, t:50, botSpd:1.8, obs:3, desc:'Mais rápido!' },
  { label:'Nível 4', goals:5, t:45, botSpd:2.2, obs:3, desc:'Quase lá' },
  { label:'Nível 5', goals:6, t:40, botSpd:2.6, obs:4, desc:'Rua lotada!' },
];

export default function DribbleGame(){
  const [ph,setPh]     = useState('menu');
  const [lv,setLv]     = useState(0);
  const [scr,setScr]   = useState(0);
  const [pg,setPg]     = useState(0);
  const [bg,setBg]     = useState(0);
  const [tl,setTl]     = useState(60);
  const [lv2,setLv2]   = useState(3);
  const [own,setOwn]   = useState('player'); // 'player' | 'bot'
  const [ballIdx,setBallIdx] = useState(0);
  const [selObs,setSelObs]   = useState([]);
  const [pp,setPp]   = useState({x:F_W/2,y:F_H-100});
  const [bp,setBp]   = useState({x:F_W/2,y:F_H-100});
  const [obp,setObp] = useState([]);
  const [jv,setJv]   = useState({x:0,y:0,on:false});
  const [goEff,setGoEff] = useState(false);
  const [goSide,setGoSide] = useState(null);
  const [hitEff,setHitEff] = useState(false);
  const [winner,setWinner] = useState(null);
  const [snd,setSnd] = useState(true);

  const rafRef = useRef(null);
  const joyRef = useRef(null);
  const jcRef  = useRef(null);
  const pRef   = useRef({x:F_W/2,y:F_H-100});
  const bRef   = useRef({x:F_W/2,y:F_H-100});

  const c = LVLS[lv];

  // ── Iniciar ─────────────────────────────────────────────────────────
  const start=(l)=>{
    cancelAnimationFrame(rafRef.current);
    setPh('play'); setLv(l);
    setPg(0); setBg(0); setLv2(LVLS[l].goals);
    setTl(LVLS[l].t); setOwn('player');
    const pp2={x:F_W/2,y:F_H-100};
    const bp2={x:F_W/2,y:F_H-100};
    pRef.current=pp2; bRef.current=bp2;
    setPp(pp2); setBp(bp2);
    setSelObs(prev=>{
      const obs=(prev.length>0?prev:OBSTACLES.slice(0,LVLS[l].obs)).map((o,i)=>({
        ...o,
        x:40+i*(F_W-80)/(LVLS[l].obs||1),
        y:F_H/2+(i%2===0?-70:70),
        dir:i%2===0?1:-1,
        spd:1.5+i*0.3,
      }));
      setObp(obs);
      return obs;
    });
    setGoEff(false); setHitEff(false); setWinner(null);
  };

  // ── Game loop ────────────────────────────────────────────────────────
  useEffect(()=>{
    if(ph!=='play'){ cancelAnimationFrame(rafRef.current); return; }

    const loop=()=>{
      const sp=BALLS[ballIdx].spd;
      const p={x:clamp(pRef.current.x+jv.x*3.5*sp,PR,F_W-PR),y:clamp(pRef.current.y+jv.y*3.5*sp,PR,F_H-PR)};
      pRef.current=p; setPp(p);

      // Bola segue o dono
      const b=own==='player'?{...p}:{...bRef.current};
      bRef.current=b; setBp(b);

      // Bot vai para a bola (se tem) ou defende gol
      const bTarget=own==='bot'
        ?{x:F_W/2,y:55}
        :{x:F_W/2,y:F_H-70};
      const bDx=bTarget.x-bRef.current.x;
      const bDy=bTarget.y-bRef.current.y;
      const bD=Math.sqrt(bDx*bDx+bDy*bDy)||1;
      const nb={x:clamp(bRef.current.x+(bDx/bD)*c.botSpd*sp,BR,F_W-BR),y:clamp(bRef.current.y+(bDy/bD)*c.botSpd*sp,BR,F_H-BR)};
      bRef.current=nb;

      // Mover obstáculos
      setObp(prev=>prev.map(o=>{
        if(o.beh==='patrol'){
          const nx=o.x+o.dir*o.spd;
          if(nx<25||nx>F_W-25) return{...o,dir:-o.dir};
          return{...o,x:nx};
        }
        if(o.beh==='slow'){
          const nx=o.x+o.dir*o.spd*0.3;
          if(nx<25||nx>F_W-25) return{...o,dir:-o.dir};
          return{...o,x:nx};
        }
        return o;
      }));

      // Colisão player-obstáculo → perde bola
      for(const o of obp){
        if(dist(p,{x:o.x,y:o.y})<PR+14){
          if(own==='player'){
            setOwn('bot');
            setHitEff(true);
            setTimeout(()=>setHitEff(false),500);
          }
          break;
        }
      }

      // Colisão bot-obstáculo → perde bola
      for(const o of obp){
        if(dist(nb,{x:o.x,y:o.y})<BR+14){
          if(own==='bot'){
            setOwn('player');
          }
          break;
        }
      }

      // Gol do BOT (bola no gol de cima)
      if(own==='bot'&&nb.y<G_H+20&&Math.abs(nb.x-F_W/2)<G_W/2+5){
        setOwn('player');
        setBg(g=>g+1);
        setScr(s=>s+10);
        setGoEff(true); setGoSide('bot');
        setTimeout(()=>{
          setGoEff(false); setGoSide(null);
          if(bg+1>=c.goals){ setWinner('bot'); setPh('end'); }
          else{
            const rp={x:F_W/2,y:F_H-100};
            pRef.current=rp; bRef.current={x:F_W/2,y:F_H-100};
            setPp(rp); setBp({...rp});
          }
        },1200);
        cancelAnimationFrame(rafRef.current); return;
      }

      // Gol do PLAYER (bola no gol de baixo)
      if(own==='player'&&p.y>F_H-G_H-20&&Math.abs(p.x-F_W/2)<G_W/2+5){
        const pts=(lv+1)*20;
        setScr(s=>s+pts);
        setPg(g=>g+1);
        setGoEff(true); setGoSide('player');
        setOwn('bot');
        setTimeout(()=>{
          setGoEff(false); setGoSide(null);
          if(pg+1>=c.goals){ setWinner('player'); setPh('end'); }
          else{
            const rp={x:F_W/2,y:F_H-100};
            pRef.current=rp; bRef.current={x:F_W/2,y:F_H-100};
            setPp(rp); setBp({...rp});
          }
        },1200);
        cancelAnimationFrame(rafRef.current); return;
      }

      rafRef.current=requestAnimationFrame(loop);
    };

    rafRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(rafRef.current);
  },[ph,jv,obp,own,ballIdx,c,pg,bg,lv]);

  // Timer
  useEffect(()=>{
    if(ph!=='play') return;
    const t=setInterval(()=>{
      setTl(p=>{ if(p<=1){setPh('end'); return 0;} return p-1; });
    },1000);
    return()=>clearInterval(t);
  },[ph]);

  // ── Joystick ────────────────────────────────────────────────────────
  const joyStart=(cx,cy)=>{
    if(!joyRef.current)return;
    const r=joyRef.current.getBoundingClientRect();
    const c={x:r.left+r.width/2,y:r.top+r.height/2};
    jcRef.current=c; joyMv(cx,cy,c);
  };
  const joyMv=(cx,cy,c)=>{
    const cc=c||jcRef.current; if(!cc)return;
    const dx=cx-cc.x,dy=cy-cc.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    const sc=Math.min(d,40)/40;
    const a=Math.atan2(dy,dx);
    setJv({x:Math.cos(a)*sc,y:Math.sin(a)*sc,on:true});
  };
  const joyEnd=()=>{ jcRef.current=null; setJv({x:0,y:0,on:false}); };

  // ── Chute ──────────────────────────────────────────────────────────
  const shoot=()=>{
    if(own!=='player') return;
    setOwn('bot');
    setGoEff(true);
    setTimeout(()=>setGoEff(false),1000);
  };

  // ── Menu ───────────────────────────────────────────────────────────
  if(ph==='menu'){
    return(
      <div className="flex flex-col items-center gap-5 py-4 px-4 min-h-[80vh]">
        <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} className="text-center">
          <motion.div animate={{y:[0,-8,0]}} transition={{duration:1.8,repeat:Infinity}} className="text-5xl mb-2">⚽</motion.div>
          <h1 className="font-heading font-black text-2xl text-primary">Fut de Rua</h1>
          <p className="text-xs text-muted-foreground">Drible e faça muchos goles!</p>
        </motion.div>

        {/* níveis */}
        <div className="w-full max-w-xs space-y-1.5">
          <p className="text-xs font-bold text-gray-500 uppercase text-center">Nível</p>
          {LVLS.map((l,i)=>(
            <button key={i} onClick={()=>setLv(i)}
              className={`w-full py-2.5 px-4 rounded-xl border-2 text-left flex justify-between items-center ${lv===i?'border-primary bg-primary/10':'border-border/30 bg-card'}`}>
              <div><div className="font-bold text-sm">{l.label}</div><div className="text-[9px] text-muted-foreground">{l.desc}</div></div>
              {lv===i&&<span className="text-primary font-bold">✓</span>}
            </button>
          ))}
        </div>

        {/* bolas */}
        <div className="w-full max-w-xs">
          <p className="text-xs font-bold text-gray-500 uppercase text-center mb-2">Escolha a bola</p>
          <div className="grid grid-cols-3 gap-1.5">
            {BALLS.map((b,i)=>(
              <button key={b.id} onClick={()=>setBallIdx(i)}
                className={`p-2 rounded-xl border-2 text-center ${ballIdx===i?'border-primary bg-primary/10':'border-border/30 bg-card'}`}>
                <div className="text-xl">{b.emoji}</div>
                <div className="text-[8px] font-bold leading-tight">{b.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* obstáculos */}
        <div className="w-full max-w-xs">
          <p className="text-xs font-bold text-gray-500 uppercase text-center mb-2">Elementos da rua</p>
          <div className="grid grid-cols-4 gap-1.5">
            {OBSTACLES.map((o)=>(
              <button key={o.id} onClick={()=>setSelObs(prev=>{
                const ex=prev.find(p=>p.id===o.id);
                if(ex) return prev.filter(p=>p.id!==o.id);
                return[...prev,o];
              })}
                className={`p-2 rounded-xl border-2 text-center ${selObs.find(p=>p.id===o.id)?'border-primary bg-primary/10':'border-border/30 bg-card'}`}>
                <div className="text-xl">{o.emoji}</div>
                <div className="text-[7px] font-bold leading-tight">{o.name}</div>
              </button>
            ))}
          </div>
        </div>

        <motion.button whileTap={{scale:.95}} onClick={()=>start(lv)}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-pink-500 text-white font-heading font-black text-lg rounded-2xl shadow-lg">
          Jogar! ⚽
        </motion.button>
      </div>
    );
  }

  // ── Fim ────────────────────────────────────────────────────────────
  if(ph==='end'){
    const won=winner==='player';
    return(
      <motion.div initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}}
        className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4">
        <motion.div animate={{rotate:won?[0,10,-10,0]:[0,5,-5,0]}} transition={{repeat:Infinity,duration:1}}
          className="text-7xl">{won?'🏆':'😢'}</motion.div>
        <div className="text-center">
          <h2 className="font-heading font-black text-2xl">{won?'Você venceu!':'O bot venceu!'}</h2>
          <p className="text-muted-foreground">{pg} × {bg}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>setPh('menu')} className="px-6 py-3 bg-muted font-bold rounded-2xl">Menu</button>
          <button onClick={()=>start(lv)} className="px-6 py-3 bg-primary text-white font-bold rounded-2xl">Jogar de novo</button>
        </div>
      </motion.div>
    );
  }

  // ── Jogo ───────────────────────────────────────────────────────────
  return(
    <div className="flex flex-col items-center gap-2 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="bg-card rounded-xl px-3 py-1.5 text-xs font-bold">
          <span className="text-primary">{pg}</span> × <span className="text-red-500">{bg}</span>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-3 py-1 text-xs font-bold text-primary">{c.label}</div>
        <div className={`rounded-xl px-3 py-1.5 text-xs font-bold ${tl<=10?'text-red-500 animate-pulse':'text-muted-foreground'}`}>⏱ {tl}s</div>
      </div>

      {/* Campo */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{width:F_W,height:F_H,background:'linear-gradient(180deg,#4a4a4a 0%,#5c5c5c 50%,#4a4a4a 100%)'}}>

        {/* asfalto */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-600 via-gray-500 to-gray-600"/>

        {/* linhas */}
        <svg width={F_W} height={F_H} className="absolute inset-0 opacity-25">
          <line x1="0" y1={F_H/2} x2={F_W} y2={F_H/2} stroke="white" strokeWidth="1.5" strokeDasharray="8 6"/>
          <circle cx={F_W/2} cy={F_H/2} r="35" stroke="white" strokeWidth="1.5" fill="none"/>
        </svg>

        {/* gol topo (bot) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{width:G_W,height:G_H}}>
          <div className="absolute inset-0 bg-white/10 rounded-b-xl border-4 border-white/60 border-t-0"
            style={{borderWidth:'0 4px 4px 4px'}}/>
          {[...Array(6)].map((_,i)=><div key={`vt${i}`} className="absolute top-0 bottom-0 w-px bg-white/20" style={{left:`${(i+1)*(100/7)}%`}}/>)}
          {[...Array(3)].map((_,i)=><div key={`ht${i}`} className="absolute left-0 right-0 h-px bg-white/20" style={{top:`${(i+1)*(100/4)}%`}}/>)}
          <div className="absolute -top-1 left-0 right-0 h-1.5 bg-white/80 rounded-full"/>
          <div className="absolute top-0 left-0 w-1 bg-white/60"/>
          <div className="absolute top-0 right-0 w-1 bg-white/60"/>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl" style={{filter:'drop-shadow(0 2px 3px rgba(0,0,0,.5))'}}>🩴</div>
        </div>

        {/* gol baixo (player) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{width:G_W,height:G_H}}>
          <div className="absolute inset-0 bg-white/10 rounded-t-xl border-4 border-white/60 border-b-0"
            style={{borderWidth:'4px 4px 0 4px'}}/>
          {[...Array(6)].map((_,i)=><div key={`bv${i}`} className="absolute top-0 bottom-0 w-px bg-white/20" style={{left:`${(i+1)*(100/7)}%`}}/>)}
          {[...Array(3)].map((_,i)=><div key={`bh${i}`} className="absolute left-0 right-0 h-px bg-white/20" style={{top:`${(i+1)*(100/4)}%`}}/>)}
          <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-white/80 rounded-full"/>
          <div className="absolute bottom-0 left-0 w-1 bg-white/60"/>
          <div className="absolute bottom-0 right-0 w-1 bg-white/60"/>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-2xl" style={{filter:'drop-shadow(0 2px 3px rgba(0,0,0,.5))'}}>🩴</div>
        </div>

        {/* obstáculos */}
        {obp.map((o,i)=>(
          <motion.div key={i}
            animate={o.beh==='patrol'||o.beh==='slow'?{x:[o.x-20,o.x+20,o.x-20]}:{}}
            transition={{duration:o.beh==='slow'?6:3,repeat:Infinity,ease:'easeInOut'}}
            className="absolute text-3xl" style={{left:o.x-16,top:o.y-16,filter:'drop-shadow(0 2px 4px rgba(0,0,0,.4))'}}>
            {o.emoji}
          </motion.div>
        ))}

        {/* player */}
        <motion.div animate={{x:pp.x-PR,y:pp.y-PR}}
          className="absolute w-11 h-11 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">
          ⚽
        </motion.div>

        {/* bot (goleiro) */}
        <motion.div animate={{x:F_W/2-BR,y:55-BR}}
          className="absolute w-11 h-11 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">
          🤖
        </motion.div>

        {/* bola */}
        {own&&(
          <motion.div animate={{x:bp.x-BALL_R,y:bp.y-BALL_R}}
            className="absolute" style={{top:bp.y-BALL_R,left:bp.x-BALL_R}}>
            <div className="text-2xl drop-shadow-md">{BALLS[ballIdx].emoji}</div>
          </motion.div>
        )}

        {/* gol */}
        <AnimatePresence>
          {goEff&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <motion.div animate={{scale:[.5,1.2,1],rotate:[-10,10,0]}} transition={{duration:.4}}
                className="text-5xl font-black text-white drop-shadow-lg">⚽ GOL!</motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* hit */}
        <AnimatePresence>
          {hitEff&&(
            <motion.div initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-4xl">💥</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* posse */}
      <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${own==='player'?'bg-blue-100 text-blue-600':'bg-red-100 text-red-600'}`}>
        {own==='player'?'⚽ Você tem a bola':'🤖 Bot tem a bola'}
      </div>

      {/* controles */}
      <div className="flex items-center gap-4 py-2">
        <div ref={joyRef}
          className="w-28 h-28 rounded-full bg-black/20 border-4 border-white/30 relative flex items-center justify-center touch-none"
          onTouchStart={e=>{e.preventDefault();joyStart(e.touches[0].clientX,e.touches[0].clientY);}}
          onTouchMove={e=>{e.preventDefault();joyMv(e.touches[0].clientX,e.touches[0].clientY);}}
          onTouchEnd={e=>{e.preventDefault();joyEnd();}}
          onMouseDown={e=>joyStart(e.clientX,e.clientY)}
          onMouseMove={e=>e.buttons===1&&joyMv(e.clientX,e.clientY)}
          onMouseUp={joyEnd}>
          <motion.div animate={{x:jv.x*28,y:jv.y*28}} transition={{type:'spring',stiffness:400,damping:30}}
            className="w-10 h-10 rounded-full bg-white/80 shadow-lg"/>
        </div>

        <motion.button whileTap={{scale:.88}}
          onClick={shoot}
          disabled={own!=='player'}
          className={`px-6 py-4 rounded-2xl font-heading font-black text-base shadow-xl border-4 border-white/40 transition-all ${own==='player'?'bg-gradient-to-br from-green-400 to-emerald-600 text-white':'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
          ⚽ CHUTAR!
        </motion.button>

        <div className="flex flex-col gap-2">
          <button onClick={()=>setSnd(s=>!s)} className="p-2 rounded-full bg-muted hover:bg-muted/70">{snd?<Volume2 className="w-4 h-4"/>:<VolumeX className="w-4 h-4"/>}</button>
          <button onClick={()=>{cancelAnimationFrame(rafRef.current);setPh('menu');}} className="p-2 rounded-full bg-muted hover:bg-muted/70"><RotateCcw className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
}
