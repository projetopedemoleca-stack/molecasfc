// ═══════════════════════════════════════════════════════════════════════════
// GolAGolGame — chuteira vs goleira
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { audio } from '@/lib/audioEngine';

const F_W = 360, F_H = 520;
const G_W = 220, G_H = 80;
const BR = 12, PR = 26;
const MAX_LVL = 9;

function clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }
function dist(a,b){ return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2); }

function lvlCfg(l){
  return{
    label:`Nível ${l+1}`,
    rounds:3+Math.floor(l/2),
    kSpeed:1.0+l*0.55,
    bAcc:Math.min(0.10+l*0.10,0.90),
  };
}

// ── Menu standalone component ──────────────────────────────────────────────
function Menu({onStart}){
  const [sel,setSel]=useState(0);
  return(
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-4">
      <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} className="text-center">
        <motion.div animate={{y:[0,-10,0]}} transition={{duration:2,repeat:Infinity}} className="text-6xl mb-2">⚽</motion.div>
        <h1 className="font-heading font-black text-3xl text-primary">Gol a Gol</h1>
      </motion.div>
      <div className="space-y-2 w-full max-w-xs">
        {Array.from({length:MAX_LVL},(_,i)=>(
          <button key={i} onClick={()=>setSel(i)}
            className={`w-full py-3 px-4 rounded-2xl border-2 text-left flex justify-between items-center transition-all ${sel===i?'border-primary bg-primary/10':'border-border/30 bg-card'}`}>
            <div>
              <div className="font-bold text-sm">{lvlCfg(i).label}</div>
              <div className="text-[10px] text-muted-foreground">{lvlCfg(i).rounds} rodadas</div>
            </div>
            {sel===i&&<span className="text-xl">→</span>}
          </button>
        ))}
      </div>
      <button onClick={()=>onStart(sel)}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-pink-500 text-white font-heading font-black text-lg rounded-2xl shadow-lg">
        Jogar! ⚽
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function GolAGolGame(){
  const [lvl,setLvl]       = useState(0);
  const [rnd,setRnd]       = useState(1);
  const [trn,setTrn]       = useState('player');
  const [phs,setPhs]       = useState('playing'); // playing | shooting | done
  const [scr,setScr]       = useState({p:0,b:0});
  const [ang,setAng]       = useState(-Math.PI/2);
  const [pwr,setPwr]       = useState(55);
  const [bp,setBp]         = useState({x:F_W/2,y:F_H-90});
  const [kp,setKp]         = useState({x:F_W/2,y:G_H-10});
  const [tr,setTr]         = useState([]);
  const [goal,setGoal]     = useState(null);
  const [svd,setSvd]       = useState(false);
  const [snd,setSnd]       = useState(true);
  const [goLabel,setGoLabel]= useState('');

  // refs para closures estáveis
  const lvlR  = useRef(0);
  const rndR  = useRef(1);
  const trnR  = useRef('player');
  const scrR  = useRef({p:0,b:0});
  const phsR  = useRef('playing');
  const kpR   = useRef({x:F_W/2,y:G_H-10});
  const bpR   = useRef({x:F_W/2,y:F_H-90});
  const rafR  = useRef(null);
  const joyRef= useRef(null);
  const jcR   = useRef(null);
  const joyVR = useRef({x:0,y:0});

  const c = lvlCfg(lvl);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const play=(name)=>{ if(snd) try{audio[name]();}catch{} };

  const reset=(t)=>{
    if(t==='player'){
      const nb={x:F_W/2,y:F_H-90};
      const nk={x:F_W/2,y:G_H-10};
      bpR.current=nb; kpR.current=nk;
      setBp(nb); setKp(nk); setAng(-Math.PI/2); setPwr(55);
    }else{
      const nb={x:F_W/2,y:90};
      const nk={x:F_W/2,y:F_H-G_H+10};
      bpR.current=nb; kpR.current=nk;
      setBp(nb); setKp(nk);
    }
    setTr([]);
  };

  // ── Fim de gol / defesa ────────────────────────────────────────────────
  const onScore=(who)=>{
    phsR.current='done';
    setPhs('done');
    setGoal(who);
    const ns={...scrR.current};
    if(who==='player') ns.p++; else ns.b++;
    scrR.current=ns; setScr(ns);
    play(who==='player'?'goal':'gameover');
    setTimeout(()=>checkEnd(),1500);
  };

  const onMiss=()=>{
    phsR.current='done';
    setPhs('done');
    setTimeout(()=>nextTurn(),600);
  };

  const checkEnd=useCallback(()=>{
    const cfg=lvlCfg(lvlR.current);
    const wins=Math.ceil(cfg.rounds/2);
    if(scrR.current.p>=wins||scrR.current.b>=wins||rndR.current>=cfg.rounds){
      setGoal(null); // triggers end screen via goal=null
    }else{
      nextTurn();
    }
  },[]);

  const nextTurn=useCallback(()=>{
    const cfg=lvlCfg(lvlR.current);
    const next=trnR.current==='player'?'bot':'player';
    trnR.current=next; setTrn(next);
    const nr=rndR.current;
    reset(next);
    phsR.current='playing'; setPhs('playing');
    if(next==='bot') setTimeout(()=>doBotKick(),1600);
    else setRnd(nr+1); rndR.current=nr+1;
  },[checkEnd]);

  // ── Chute do bot ────────────────────────────────────────────────────────
  const doBotKick=useCallback(()=>{
    if(phsR.current!=='playing'||trnR.current!=='bot') return;
    const cfg=lvlCfg(lvlR.current);
    const misses=Math.random()>cfg.bAcc;
    const offX=misses?(Math.random()-0.5)*G_W*1.3:(Math.random()-0.5)*G_W*0.35;
    const tgtX=F_W/2+offX;
    const dy=(F_H-G_H+10)-90;
    const dx=tgtX-F_W/2;
    const ang=Math.atan2(dy,dx);
    const spd=(55+Math.random()*20)/5;
    let vx=Math.cos(ang)*spd;
    let vy=Math.sin(ang)*spd;
    let pos={x:F_W/2,y:90};
    const trail=[];
    let fr=0;
    phsR.current='shooting'; setPhs('shooting');

    const step=()=>{
      fr++; pos={x:pos.x+vx,y:pos.y+vy};
      if(fr%2===0) trail.push({...pos});
      bpR.current=pos; setBp({...pos}); setTr([...trail]);

      // goleira
      const tgt=tgtX;
      const prev=kpR.current;
      const nx=clamp(prev.x+Math.sign(tgt-prev.x)*Math.min(Math.abs(tgt-prev.x),cfg.kSpeed),G_W/2,F_W-G_W/2);
      kpR.current={...prev,x:nx}; setKp({...prev,x:nx});

      // gol?
      if(pos.y>F_H-G_H-10&&Math.abs(pos.x-F_W/2)<G_W/2){
        const kd=dist(pos,kpR.current);
        if(kd<PR+BR+2){ play('save'); setSvd(true); setTimeout(()=>{setSvd(false);onMiss();},1400); }
        else onScore('bot');
        return;
      }
      // fora
      if(pos.y<-30||pos.y>F_H+30||pos.x<-20||pos.x>F_W+20){ onMiss(); return; }

      rafR.current=requestAnimationFrame(step);
    };
    rafR.current=requestAnimationFrame(step);
  },[]);

  // ── Chute do jogador ───────────────────────────────────────────────────
  const doPlayerKick=useCallback(()=>{
    if(phsR.current!=='playing'||trnR.current!=='player') return;
    cancelAnimationFrame(rafR.current);
    const spd=pwr/5;
    let vx=Math.cos(ang)*spd;
    let vy=Math.sin(ang)*spd;
    let pos={x:F_W/2,y:F_H-90};
    const trail=[];
    let fr=0;
    phsR.current='shooting'; setPhs('shooting');

    const step=()=>{
      fr++; pos={x:pos.x+vx,y:pos.y+vy};
      if(fr%2===0) trail.push({...pos});
      bpR.current=pos; setBp({...pos}); setTr([...trail]);

      const tgt=pos.x;
      const prev=kpR.current;
      const nx=clamp(prev.x+Math.sign(tgt-prev.x)*Math.min(Math.abs(tgt-prev.x),c.kSpeed),G_W/2,F_W-G_W/2);
      kpR.current={...prev,x:nx}; setKp({...prev,x:nx});

      if(pos.y<G_H+10&&Math.abs(pos.x-F_W/2)<G_W/2){
        const kd=dist(pos,kpR.current);
        if(kd<PR+BR+2){ play('save'); setSvd(true); setTimeout(()=>{setSvd(false);onMiss();},1400); }
        else onScore('player');
        return;
      }
      if(pos.y<-30||pos.y>F_H+30||pos.x<-20||pos.x>F_W+20){ onMiss(); return; }

      rafR.current=requestAnimationFrame(step);
    };
    rafR.current=requestAnimationFrame(step);
  },[ang,pwr,c]);

  // ── Iniciar ───────────────────────────────────────────────────────────────
  const startGame=(l)=>{
    cancelAnimationFrame(rafR.current);
    lvlR.current=l; setLvl(l);
    scrR.current={p:0,b:0}; setScr({p:0,b:0});
    rndR.current=1; setRnd(1);
    trnR.current='player'; setTrn('player');
    phsR.current='playing'; setPhs('playing');
    setGoal(null); setSvd(false);
    reset('player');
  };

  // ── Joystick ───────────────────────────────────────────────────────────
  const joyStart=(cx,cy)=>{
    if(!joyRef.current)return;
    const r=joyRef.current.getBoundingClientRect();
    const c={x:r.left+r.width/2,y:r.top+r.height/2};
    jcR.current=c; joyMove(cx,cy,c);
  };
  const joyMove=(cx,cy,c)=>{
    const cc=c||jcR.current; if(!cc)return;
    const dx=cx-cc.x,dy=cy-cc.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    const sc=Math.min(d,40)/40;
    const a=Math.atan2(dy,dx);
    joyVR.current={x:Math.cos(a)*sc,y:Math.sin(a)*sc};
    setAng(a); setPwr(40+sc*30);
  };
  const joyEnd=()=>{ jcR.current=null; joyVR.current={x:0,y:0}; };

  // ── Resultado ────────────────────────────────────────────────────────────
  const cfg=lvlCfg(lvl);
  const winsNeed=Math.ceil(cfg.rounds/2);
  const isDone=scr.p>=winsNeed||scr.b>=winsNeed||rnd>cfg.rounds;
  const showEnd=isDone&&(scr.p>0||scr.b>0||rnd>1);

  if(showEnd){
    const won=scr.p>scr.b;
    return(
      <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4">
        <div className="text-7xl">{won?'🏆':'😢'}</div>
        <div className="text-center">
          <h2 className="font-heading font-black text-2xl">{won?'Você venceu!':'Boa tentativa!'}</h2>
          <p className="text-muted-foreground">{scr.p} × {scr.b}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>startGame(lvl)} className="px-6 py-3 bg-primary text-white font-bold rounded-2xl">Jogar de novo</button>
          <button onClick={()=>{setPhs('menu');setGoal('menu');}} className="px-6 py-3 bg-muted font-bold rounded-2xl">Menu</button>
        </div>
      </motion.div>
    );
  }

  if(phs==='menu'||goal==='menu') return <Menu onStart={startGame}/>;

  // ── Render ───────────────────────────────────────────────────────────────
  const aimX=F_W/2+Math.cos(ang)*50;
  const aimY=F_H-90+Math.sin(ang)*50;

  return(
    <div className="flex flex-col items-center gap-2 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground">{trn==='player'?'Sua vez':'Vez do bot'}</div>
          <div className="font-heading font-black text-2xl">{scr.p} × {scr.b}</div>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-3 py-1 text-[10px] font-bold text-primary">{c.label} · {rnd}/{c.rounds}</div>
        <button onClick={()=>setSnd(s=>!s)} className="p-2 rounded-full bg-muted">{snd?<Volume2 className="w-4 h-4"/>:<VolumeX className="w-4 h-4"/>}</button>
      </div>

      {/* Campo */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{width:F_W,height:F_H,background:'linear-gradient(180deg,#2d5a27 0%,#3a7a33 50%,#2d5a27 100%)'}}>

        <svg width={F_W} height={F_H} className="absolute inset-0">
          <line x1="0" y1={F_H/2} x2={F_W} y2={F_H/2} stroke="white" strokeWidth="1.5" opacity="0.3"/>
          <circle cx={F_W/2} cy={F_H/2} r="40" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3"/>

          {/* gol topo */}
          <rect x={(F_W-G_W)/2} y="0" width={G_W} height={G_H} fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="3" rx="4"/>
          {[...Array(8)].map((_,i)=><line key={`vt${i}`} x1={(F_W-G_W)/2+(i+1)*G_W/9} y1="0" x2={(F_W-G_W)/2+(i+1)*G_W/9} y2={G_H} stroke="white" strokeWidth="0.5" opacity="0.3"/>)}
          {[...Array(3)].map((_,i)=><line key={`ht${i}`} x1={(F_W-G_W)/2} y1={(i+1)*G_H/4} x2={(F_W-G_W)/2+G_W} y2={(i+1)*G_H/4} stroke="white" strokeWidth="0.5" opacity="0.3"/>)}

          {/* gol baixo */}
          <rect x={(F_W-G_W)/2} y={F_H-G_H} width={G_W} height={G_H} fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="3" rx="4"/>
          {[...Array(8)].map((_,i)=><line key={`vb${i}`} x1={(F_W-G_W)/2+(i+1)*G_W/9} y1={F_H-G_H} x2={(F_W-G_W)/2+(i+1)*G_W/9} y2={F_H} stroke="white" strokeWidth="0.5" opacity="0.3"/>)}
          {[...Array(3)].map((_,i)=><line key={`hb${i}`} x1={(F_W-G_W)/2} y1={F_H-G_H+(i+1)*G_H/4} x2={(F_W-G_W)/2+G_W} y2={F_H-G_H+(i+1)*G_H/4} stroke="white" strokeWidth="0.5" opacity="0.3"/>)}

          {/* mira */}
          {trn==='player'&&phs==='playing'&&<line x1={F_W/2} y1={F_H-90} x2={aimX} y2={aimY} stroke="#FFD600" strokeWidth="2" strokeDasharray="6 4" opacity="0.8"/>}

          {/* trail */}
          {tr.map((t,i)=><circle key={i} cx={t.x} cy={t.y} r={BR*(i/((tr.length)||1))*0.7} fill="white" opacity={i/((tr.length)||1)*0.4}/>)}

          {/* goleira */}
          <text x={kp.x} y={kp.y+6} textAnchor="middle" fontSize="28">👩</text>

          {/* jogador/bot */}
          <text x={trn==='player'?F_W/2:F_W/2} y={trn==='player'?F_H-90+8:90+8} textAnchor="middle" fontSize="26">{trn==='player'?'⚽':'🤖'}</text>

          {/* bola */}
          <circle cx={bp.x} cy={bp.y} r={BR} fill="white"/>
          <circle cx={bp.x-3} cy={bp.y-3} r={BR*0.45} fill="#333" opacity="0.5"/>
        </svg>

        <AnimatePresence>
          {goal&&goal!=='menu'&&(
            <motion.div initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}} className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <motion.div animate={{rotate:[0,5,-5,0],scale:[1,1.1,1]}} transition={{repeat:Infinity,duration:.4}} className="text-6xl font-black text-white">⚽ GOL!</motion.div>
            </motion.div>
          )}
          {svd&&(
            <motion.div initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}} className="absolute inset-0 flex items-center justify-center bg-blue-900/40 z-10">
              <div className="text-4xl font-black text-white">🧤 Defendido!</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* vez do jogador */}
      {trn==='player'&&phs==='playing'&&(
        <div className="w-full max-w-sm flex flex-col items-center gap-3">
          <p className="text-[10px] text-muted-foreground font-bold">Mire com joystick e toque CHUTAR</p>
          <div className="flex items-center gap-6">
            <div ref={joyRef}
              className="w-28 h-28 rounded-full bg-black/20 border-4 border-white/30 relative flex items-center justify-center touch-none"
              onTouchStart={e=>{e.preventDefault();joyStart(e.touches[0].clientX,e.touches[0].clientY);}}
              onTouchMove={e=>{e.preventDefault();joyMove(e.touches[0].clientX,e.touches[0].clientY);}}
              onTouchEnd={e=>{e.preventDefault();joyEnd();}}
              onMouseDown={e=>joyStart(e.clientX,e.clientY)}
              onMouseMove={e=>e.buttons===1&&joyMove(e.clientX,e.clientY)}
              onMouseUp={joyEnd}>
              <motion.div animate={{x:joyVR.current.x*28,y:joyVR.current.y*28}} transition={{type:'spring',stiffness:400,damping:30}} className="w-10 h-10 rounded-full bg-white/80 shadow-lg"/>
            </div>
            <motion.button whileTap={{scale:.88}} onClick={doPlayerKick}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white font-heading font-black text-base shadow-xl border-4 border-white/40 flex flex-col items-center justify-center">
              ⚽<span className="text-xs mt-1">CHUTAR</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* vez do bot */}
      {trn==='bot'&&phs==='playing'&&(
        <div className="w-full max-w-sm flex flex-col items-center gap-2">
          <p className="text-[10px] text-muted-foreground font-bold">🤖 Bot está mirando...</p>
        </div>
      )}

      {phs==='shooting'&&<p className="text-xs text-muted-foreground animate-pulse">{trn==='player'?'⚽ chutando...':'🤖 bot chutou!'}</p>}
    </div>
  );
}
