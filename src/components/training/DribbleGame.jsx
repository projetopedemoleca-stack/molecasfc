// Fut de Rua — simple and working
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

const FW=360, FH=520, GW=110, GH=65;
const PR=22, BR=22, BALLR=9, PS=4;
const clamp=(v,m,M)=>Math.max(m,Math.min(M,v));
const dist=(a,b)=>Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);

const BALLS=[
  {id:'head',   name:'Cabeça de Boneca',  emoji:'🧠', spd:1.0},
  {id:'can',    name:'Lata',              emoji:'🥫', spd:0.8},
  {id:'stone',  name:'Pedra',             emoji:'🪨', spd:0.6},
  {id:'paper',  name:'Papel Amassado',     emoji:'📄', spd:1.1},
  {id:'bottle', name:'Garrafinha',         emoji:'🍶', spd:1.0},
  {id:'lemon',  name:'Limão',             emoji:'🍋', spd:1.0},
  {id:'cap',    name:'Tampinha',           emoji:'🪙', spd:1.05},
  {id:'tennis',  name:'Bolinha de Tênis',  emoji:'🎾', spd:1.15},
  {id:'deflated',name:'Bola Murcha',      emoji:'⚽', spd:0.7},
];
const OBS=[
  {id:'dog',   name:'Cachorrinho', emoji:'🐕',beh:'patrolY',spd:1.5},
  {id:'car',   name:'Carro',       emoji:'🚗',beh:'static'},
  {id:'cat',   name:'Gato',        emoji:'🐱',beh:'patrolY',spd:0.9},
  {id:'bike',  name:'Bicicleta',   emoji:'🚲',beh:'static'},
  {id:'moto',  name:'Moto',        emoji:'🏍️',beh:'patrolX',spd:2.2},
  {id:'bin',   name:'Lixeira',     emoji:'🗑️',beh:'static'},
  {id:'granny',name:'Velhinha',   emoji:'👵',beh:'slow',spd:0.3},
  {id:'speaker',name:'Caixinha',   emoji:'📻',beh:'bounce',spd:1.2},
];
const LVLS=[
  {label:'Nível 1',goals:3,t:60,botSpd:1.0,obs:2},
  {label:'Nível 2',goals:4,t:55,botSpd:1.4,obs:3},
  {label:'Nível 3',goals:5,t:50,botSpd:1.8,obs:4},
  {label:'Nível 4',goals:5,t:45,botSpd:2.2,obs:4},
  {label:'Nível 5',goals:6,t:40,botSpd:2.6,obs:5},
];

export default function DribbleGame() {
  const [ph,setPh]       = useState('menu');
  const [lv,setLv]       = useState(0);
  const [pg,setPg]       = useState(0);
  const [bg,setBg]       = useState(0);
  const [tl,setTl]       = useState(60);
  const [own,setOwn]     = useState('player');
  const [ballIdx,setBallIdx]=useState(0);
  const [selObs,setSelObs]=useState([]);
  const [pp,setPp]       = useState({x:FW/2,y:FH-100});
  const [bp,setBp]       = useState({x:FW/2,y:FH-100});
  const [botPos,setBotPos]=useState({x:FW/2,y:80});
  const [obp,setObp]     = useState([]);
  const [goEff,setGoEff] = useState(false);
  const [hitEff,setHitEff]=useState(false);
  const [dizzy,setDizzy]=useState(false);
  const [winner,setWinner]=useState(null);
  const [aimAngle,setAimAngle]=useState(-Math.PI/2);
  const [snd,setSnd]     =useState(true);
  const [jv,setJv]       =useState({x:0,y:0});

  // refs for game loop
  const S = useRef({
    ph:'menu',lv:0,pg:0,bg:0,tl:60,own:'player',ballIdx:0,dizzy:false,
    jv:{x:0,y:0},aimAngle:-Math.PI/2,
    pp:{x:FW/2,y:FH-100},bp:{x:FW/2,y:FH-100},bot:{x:FW/2,y:80},obp:[],
    raf:null,tInt:null,
  });
  const joyRef=useRef(null);
  const jcRef=useRef(null);

  // Sync state→ref
  useEffect(()=>{S.current.ph=ph;},[ph]);
  useEffect(()=>{S.current.lv=lv;},[lv]);
  useEffect(()=>{S.current.tl=tl;},[tl]);
  useEffect(()=>{S.current.pg=pg;},[pg]);
  useEffect(()=>{S.current.bg=bg;},[bg]);
  useEffect(()=>{S.current.own=own;},[own]);
  useEffect(()=>{S.current.dizzy=dizzy;},[dizzy]);
  useEffect(()=>{S.current.jv=jv;},[jv]);
  useEffect(()=>{S.current.ballIdx=ballIdx;},[ballIdx]);
  useEffect(()=>{S.current.aimAngle=aimAngle;},[aimAngle]);
  useEffect(()=>{S.current.pp=pp;},[pp]);
  useEffect(()=>{S.current.bp=bp;},[bp]);
  useEffect(()=>{S.current.bot=botPos;},[botPos]);
  useEffect(()=>{S.current.obp=obp;},[obp]);

  const buildObs=(lvlIdx)=>{
    const cfg=LVLS[lvlIdx];
    const list=selObs.length>0?selObs:OBS.slice(0,cfg.obs);
    const o=list.map((o,i)=>({...o,
      x:30+i*((FW-60)/Math.max(cfg.obs-1,1)),
      y:FH/2+(i%2===0?-80:80),
      dir:Math.random()>0.5?1:-1,
    }));
    S.current.obp=o; setObp(o); return o;
  };

  const resetRound=()=>{
    const rp={x:FW/2,y:FH-100};
    const rb={x:FW/2,y:80};
    S.current.pp=rp; S.current.bp=rp; S.current.bot=rb;
    S.current.own='player'; S.current.dizzy=false;
    S.current.aimAngle=-Math.PI/2;
    setPp({...rp}); setBp({...rp}); setBotPos({...rb});
    setOwn('player'); setDizzy(false); setAimAngle(-Math.PI/2);
  };

  const startGame=(l)=>{
    if(S.current.raf) cancelAnimationFrame(S.current.raf);
    if(S.current.tInt) clearInterval(S.current.tInt);
    S.current.ph='play'; setPh('play');
    S.current.lv=l; setLv(l);
    S.current.pg=0; S.current.bg=0; setPg(0); setBg(0);
    S.current.tl=LVLS[l].t; setTl(LVLS[l].t);
    S.current.own='player'; setOwn('player');
    S.current.dizzy=false; setDizzy(false);
    setGoEff(false); setHitEff(false); setWinner(null);
    resetRound();
    buildObs(l);
    S.current.tInt=setInterval(()=>{
      S.current.tl--; setTl(S.current.tl);
      if(S.current.tl<=0){clearInterval(S.current.tInt);S.current.ph='end';setPh('end');}
    },1000);
    S.current.raf=requestAnimationFrame(loop);
  };

  // Game loop
  useEffect(()=>{
    if(ph!=='play') return;
    const loop=()=>{
      if(S.current.ph!=='play') return;
      const cfg=LVLS[S.current.lv];
      const spd=BALLS[S.current.ballIdx].spd;
      const jv=S.current.jv;

      // Player move
      if(!S.current.dizzy){
        const np={
          x:clamp(S.current.pp.x+jv.x*PS*spd,PR,FW-PR),
          y:clamp(S.current.pp.y+jv.y*PS*spd,PR,FH-PR),
        };
        S.current.pp=np; setPp({...np});
        if(S.current.own==='player'){S.current.bp={...np}; setBp({...np});}
      }

      // Bot: always chase ball/player
      const botTarget=S.current.own==='bot' ? {x:FW/2,y:FH-60} : {...S.current.pp};
      const bDx=botTarget.x-S.current.bot.x;
      const bDy=botTarget.y-S.current.bot.y;
      const bD=Math.sqrt(bDx*bDx+bDy*bDy)||1;
      const nb={
        x:clamp(S.current.bot.x+(bDx/bD)*cfg.botSpd*spd,BR,FW-BR),
        y:clamp(S.current.bot.y+(bDy/bD)*cfg.botSpd*spd,BR,FH-BR),
      };
      S.current.bot=nb; setBotPos({...nb});
      if(S.current.own==='bot'){S.current.bp={x:nb.x,y:nb.y+18}; setBp({x:nb.x,y:nb.y+18});}

      // Move obs
      const movedObs=S.current.obp.map(o=>{
        if(o.beh==='patrolY'){const ny=o.y+o.dir*(o.spd||1.5);if(ny<35||ny>FH-35)return{...o,dir:-o.dir};return{...o,y:ny};}
        if(o.beh==='patrolX'){const nx=o.x+o.dir*(o.spd||1.5);if(nx<20||nx>FW-20)return{...o,dir:-o.dir};return{...o,x:nx};}
        if(o.beh==='slow'){const ny=o.y+o.dir*(o.spd||0.3)*0.5;if(ny<35||ny>FH-35)return{...o,dir:-o.dir};return{...o,y:ny};}
        if(o.beh==='bounce'){const ny=o.y-o.dir*(o.spd||1.2);if(ny<30||ny>FH-30)return{...o,dir:-o.dir};return{...o,y:ny};}
        return o;
      });
      S.current.obp=movedObs; setObp([...movedObs]);

      // Player hits obs
      if(!S.current.dizzy&&S.current.own==='player'){
        for(const o of movedObs){
          if(dist(S.current.pp,{x:o.x,y:o.y})<PR+16){
            S.current.dizzy=true; setDizzy(true);
            S.current.own='bot'; setOwn('bot');
            setHitEff(true);
            setTimeout(()=>{S.current.dizzy=false;setDizzy(false);},1400);
            setTimeout(()=>setHitEff(false),600);
            break;
          }
        }
      }

      // Bot hits obs
      for(const o of movedObs){
        if(dist(nb,{x:o.x,y:o.y})<BR+16&&S.current.own==='bot'){
          S.current.own='player'; setOwn('player');
          setHitEff(true); setTimeout(()=>setHitEff(false),600);
          break;
        }
      }

      // Body check
      if(dist(S.current.pp,nb)<PR+BR-4){
        if(S.current.own==='player'){S.current.own='bot';setOwn('bot');}
        else{S.current.own='player';setOwn('player');}
        setHitEff(true); setTimeout(()=>setHitEff(false),600);
      }

      // Bot GOAL (ball in player goal = top)
      if(S.current.own==='bot'&&nb.y<GH+22&&Math.abs(nb.x-FW/2)<GW/2+5){
        S.current.own='player'; setOwn('player');
        S.current.bg++; setBg(g=>g+1);
        setGoEff(true);
        cancelAnimationFrame(S.current.raf);
        setTimeout(()=>{
          setGoEff(false);
          if(S.current.bg>=LVLS[S.current.lv].goals){S.current.ph='end';setPh('end');setWinner('bot');}
          else resetRound();
          S.current.raf=requestAnimationFrame(loop);
        },1200);
        return;
      }

      // Player GOAL (ball in bot goal = bottom)
      if(S.current.own==='player'&&S.current.pp.y>FH-GH-22&&Math.abs(S.current.pp.x-FW/2)<GW/2+5){
        S.current.own='bot'; setOwn('bot');
        S.current.pg++; setPg(g=>g+1);
        setGoEff(true);
        cancelAnimationFrame(S.current.raf);
        setTimeout(()=>{
          setGoEff(false);
          if(S.current.pg>=LVLS[S.current.lv].goals){S.current.ph='end';setPh('end');setWinner('player');}
          else resetRound();
          S.current.raf=requestAnimationFrame(loop);
        },1200);
        return;
      }

      S.current.raf=requestAnimationFrame(loop);
    };
    S.current.raf=requestAnimationFrame(loop);
    return()=>{if(S.current.raf)cancelAnimationFrame(S.current.raf);};
  },[ph]);

  // Joystick
  const joyStart=(cx,cy)=>{
    if(!joyRef.current) return;
    const r=joyRef.current.getBoundingClientRect();
    jcRef.current={x:r.left+r.width/2,y:r.top+r.height/2};
    joyMv(cx,cy);
  };
  const joyMv=(cx,cy)=>{
    const c=jcRef.current; if(!c) return;
    const dx=cx-c.x,dy=cy-c.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    const sc=Math.min(d,40)/40;
    const a=Math.atan2(dy,dx);
    S.current.jv={x:Math.cos(a)*sc,y:Math.sin(a)*sc};
    S.current.aimAngle=a;
    setJv({...S.current.jv});
    setAimAngle(a);
  };
  const joyEnd=()=>{jcRef.current=null;S.current.jv={x:0,y:0};setJv({x:0,y:0});};

  const shoot=()=>{
    if(S.current.own!=='player'||S.current.dizzy) return;
    S.current.own='bot'; setOwn('bot');
    setGoEff(true);
    setTimeout(()=>setGoEff(false),600);
  };

  // Menu
  if(ph==='menu'){
    return (
      <div className="flex flex-col items-center gap-5 py-4 px-4 min-h-[80vh]">
        <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} className="text-center">
          <motion.div animate={{y:[0,-8,0]}} transition={{duration:1.8,repeat:Infinity}} className="text-5xl mb-2">⚽</motion.div>
          <h1 className="font-heading font-black text-2xl text-primary">Fut de Rua</h1>
          <p className="text-xs text-muted-foreground">Drible, chute e marque muchos goles!</p>
        </motion.div>
        <div className="w-full max-w-xs space-y-1.5">
          <p className="text-xs font-bold text-gray-500 uppercase text-center">Nível</p>
          {LVLS.map((l,i)=>(
            <button key={i} onClick={()=>setLv(i)}
              className={`w-full py-2.5 px-4 rounded-xl border-2 text-left flex justify-between items-center ${lv===i?'border-primary bg-primary/10':'border-border/30 bg-card'}`}>
              <div><div className="font-bold text-sm">{l.label}</div><div className="text-[9px] text-muted-foreground">{l.goals} goles pra vencer · {l.t}s</div></div>
              {lv===i&&<span className="text-primary font-bold">✓</span>}
            </button>
          ))}
        </div>
        <div className="w-full max-w-xs">
          <p className="text-xs font-bold text-gray-500 uppercase text-center mb-2">Bola</p>
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
        <div className="w-full max-w-xs">
          <p className="text-xs font-bold text-gray-500 uppercase text-center mb-2">Elementos da rua</p>
          <div className="grid grid-cols-4 gap-1.5">
            {OBS.map((o)=>(
              <button key={o.id} onClick={()=>setSelObs(prev=>prev.find(p=>p.id===o.id)?prev.filter(p=>p.id!==o.id):[...prev,o])}
                className={`p-2 rounded-xl border-2 text-center ${selObs.find(p=>p.id===o.id)?'border-primary bg-primary/10':'border-border/30 bg-card'}`}>
                <div className="text-xl">{o.emoji}</div>
                <div className="text-[7px] font-bold leading-tight">{o.name}</div>
              </button>
            ))}
          </div>
        </div>
        <motion.button whileTap={{scale:.95}} onClick={()=>startGame(lv)}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-pink-500 text-white font-heading font-black text-lg rounded-2xl shadow-lg">
          Jogar! ⚽
        </motion.button>
      </div>
    );
  }

  // End
  if(ph==='end'){
    const won=winner==='player';
    return (
      <motion.div initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}}
        className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4">
        <motion.div animate={{rotate:won?[0,10,-10,0]:[0,5,-5,0]}} transition={{repeat:Infinity,duration:1}} className="text-7xl">{won?'🏆':'😢'}</motion.div>
        <div className="text-center">
          <h2 className="font-heading font-black text-2xl">{won?'Você venceu!':'O bot venceu!'}</h2>
          <p className="text-muted-foreground">{pg} × {bg}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>setPh('menu')} className="px-6 py-3 bg-muted font-bold rounded-2xl">Menu</button>
          <button onClick={()=>startGame(lv)} className="px-6 py-3 bg-primary text-white font-bold rounded-2xl">Jogar de novo</button>
        </div>
      </motion.div>
    );
  }

  // Game
  const ax=bp.x+Math.cos(aimAngle)*50;
  const ay=bp.y+Math.sin(aimAngle)*50;

  return (
    <div className="flex flex-col items-center gap-2 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="bg-card rounded-xl px-3 py-1.5 text-xs font-bold">
          <span className="text-primary">{pg}</span> × <span className="text-red-500">{bg}</span>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-3 py-1 text-xs font-bold text-primary">{LVLS[lv].label}</div>
        <div className={`rounded-xl px-3 py-1.5 text-xs font-bold ${tl<=10?'text-red-500 animate-pulse':'text-muted-foreground'}`}>⏱ {tl}s</div>
      </div>

      {/* Field */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{width:FW,height:FH,background:'linear-gradient(180deg,#4a4a4a 0%,#5c5c5c 50%,#4a4a4a 100%)'}}>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-600 via-gray-500 to-gray-600"/>

        <svg width={FW} height={FH} className="absolute inset-0 opacity-20">
          <line x1="0" y1={FH/2} x2={FW} y2={FH/2} stroke="white" strokeWidth="1.5" strokeDasharray="8 6"/>
          <circle cx={FW/2} cy={FH/2} r="35" stroke="white" strokeWidth="1.5" fill="none"/>
        </svg>

        {/* Top goal (player defends) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{width:GW,height:GH}}>
          <div className="absolute inset-0 bg-white/10 rounded-b-xl border-4 border-white/60 border-t-0" style={{borderWidth:'0 4px 4px 4px'}}/>
          {[...Array(6)].map((_,i)=><div key={`vt${i}`} className="absolute top-0 bottom-0 w-px bg-white/20" style={{left:`${(i+1)*(100/7)}%`}}/>)}
          <div className="absolute -top-1 left-0 right-0 h-1.5 bg-white/80 rounded-full"/>
          <div className="absolute top-0 left-0 w-1 bg-white/60"/>
          <div className="absolute top-0 right-0 w-1 bg-white/60"/>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl" style={{filter:'drop-shadow(0 2px 3px rgba(0,0,0,.5)'}}>🩴</div>
        </div>

        {/* Bottom goal (bot defends) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{width:GW,height:GH}}>
          <div className="absolute inset-0 bg-white/10 rounded-t-xl border-4 border-white/60 border-b-0" style={{borderWidth:'4px 4px 0 4px'}}/>
          {[...Array(6)].map((_,i)=><div key={`bv${i}`} className="absolute top-0 bottom-0 w-px bg-white/20" style={{left:`${(i+1)*(100/7)}%`}}/>)}
          <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-white/80 rounded-full"/>
          <div className="absolute bottom-0 left-0 w-1 bg-white/60"/>
          <div className="absolute bottom-0 right-0 w-1 bg-white/60"/>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-2xl" style={{filter:'drop-shadow(0 2px 3px rgba(0,0,0,.5)'}}>🩴</div>
        </div>

        {/* Obstacles */}
        {obp.map((o,i)=>(
          <motion.div key={i}
            animate={{
              x:[o.x-18, o.x+18, o.x-18],
              y: o.beh==='patrolY'||o.beh==='slow'||o.beh==='bounce' ? [o.y-18, o.y+18, o.y-18] : o.y,
            }}
            transition={{ duration:o.beh==='slow'?5:o.beh==='bounce'?2:3.5, repeat:Infinity, ease:'easeInOut' }}
            className="absolute text-3xl"
            style={{left:o.x-16, top:o.y-16, filter:'drop-shadow(0 2px 4px rgba(0,0,0,.4)'}}>
            {o.emoji}
          </motion.div>
        ))}

        {/* Player */}
        <motion.div
          animate={{x:pp.x-PR,y:pp.y-PR,rotate:dizzy?[0,20,-20,0]:0}}
          transition={dizzy?{repeat:Infinity,duration:0.2}:{type:'spring',stiffness:300,damping:30}}
          className={`absolute w-11 h-11 rounded-full border-2 shadow-lg flex items-center justify-center text-white font-black text-xs ${dizzy?'bg-yellow-400 border-orange-400':own==='player'?'bg-blue-500 border-white':'bg-blue-300 border-white/50'}`}>
          {dizzy?'💫':'⚽'}
        </motion.div>

        {/* Bot */}
        <motion.div animate={{x:botPos.x-BR,y:botPos.y-BR}}
          className="absolute w-11 h-11 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">
          🤖
        </motion.div>

        {/* Ball */}
        <motion.div animate={{x:bp.x-BALLR,y:bp.y-BALLR}} className="absolute">
          <div className="text-2xl drop-shadow-md">{BALLS[ballIdx].emoji}</div>
        </motion.div>

        {/* Aim direction */}
        {own==='player'&&!dizzy&&(
          <svg width={FW} height={FH} className="absolute inset-0 pointer-events-none" style={{zIndex:5}}>
            <line x1={bp.x} y1={bp.y} x2={ax} y2={ay} stroke="#FFD600" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.85"/>
            <polygon
              points={`${ax},${ay} ${ax+Math.cos(aimAngle+2.5)*11},${ay+Math.sin(aimAngle+2.5)*11} ${ax+Math.cos(aimAngle-2.5)*11},${ay+Math.sin(aimAngle-2.5)*11}`}
              fill="#FFD600" opacity="0.9"/>
          </svg>
        )}

        {/* Dizzy */}
        <AnimatePresence>
          {dizzy&&(
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-400/90 text-black px-4 py-2 rounded-full font-bold text-xs z-20 shadow-lg">
              💫 Tonto!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal effect */}
        <AnimatePresence>
          {goEff&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <motion.div animate={{scale:[.5,1.2,1],rotate:[-10,10,0]}} transition={{duration:.4}}
                className="text-5xl font-black text-white drop-shadow-lg">⚽ GOL!</motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hit */}
        <AnimatePresence>
          {hitEff&&!goEff&&(
            <motion.div initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-4xl">💥</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Possession */}
      <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${own==='player'?'bg-blue-100 text-blue-600':'bg-red-100 text-red-600'}`}>
        {own==='player'?(dizzy?'💫 Tonto — perdeu!':'⚽ Você tem a bola'):'🤖 Bot tem a bola'}
      </div>

      {/* Controls */}
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

        <motion.button whileTap={{scale:.88}} onClick={shoot}
          disabled={own!=='player'||dizzy}
          className={`px-6 py-4 rounded-2xl font-heading font-black text-base shadow-xl border-4 border-white/40 transition-all ${own==='player'&&!dizzy?'bg-gradient-to-br from-green-400 to-emerald-600 text-white':'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
          ⚽ CHUTAR!
        </motion.button>

        <div className="flex flex-col gap-2">
          <button onClick={()=>setSnd(s=>!s)} className="p-2 rounded-full bg-muted">
            {snd?<Volume2 className="w-4 h-4"/>:<VolumeX className="w-4 h-4"/>}
          </button>
          <button onClick={()=>{if(S.current.raf)cancelAnimationFrame(S.current.raf);if(S.current.tInt)clearInterval(S.current.tInt);setPh('menu');}} className="p-2 rounded-full bg-muted">
            <RotateCcw className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );
}
