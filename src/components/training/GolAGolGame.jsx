// ═══════════════════════════════════════════════════════════════════════════
// GolAGolGame — chuteira vs goleira (simples e funcional)
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

const F_W = 360;
const F_H = 520;
const G_W = 220;
const G_H = 80;
const BR  = 12;
const PR  = 26;

function clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }
function dist(a,b){ return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2); }

function cfg(lvl){
  return {
    label: `Nível ${lvl+1}`,
    rounds: 3 + Math.floor(lvl/2),
    kSpeed: 1.0 + lvl*0.55,
    bAcc:   Math.min(0.12 + lvl*0.09, 0.88),
  };
}
const MAX=9;

export default function GolAGolGame(){
  const [lvl,setLvl]       = useState(0);
  const [rnd,setRnd]       = useState(1);
  const [trn,setTrn]       = useState('player');
  const [phs,setPhs]       = useState('menu');
  const [scr,setScr]       = useState({p:0,b:0});
  const [ang,setAng]       = useState(-Math.PI/2);
  const [pwr,setPwr]       = useState(55);
  const [bp,setBp]         = useState({x:F_W/2,y:F_H-90});
  const [kp,setKp]         = useState({x:F_W/2,y:G_H-10});
  const [tr,setTr]         = useState([]);
  const [goal,setGoal]     = useState(null);
  const [svd,setSvd]       = useState(false);
  const [snd,setSnd]       = useState(true);

  const rafRef  = useRef(null);
  const joyRef  = useRef(null);
  const jcRef   = useRef(null);
  const joyV    = useRef({x:0,y:0});

  const c = cfg(lvl);

  const play=(name)=>{ try{ if(snd)audio[name](); }catch{} };

  // ── Resetar posições ─────────────────────────────────────────────────
  const reset=(t)=>{
    if(t==='player'){
      setBp({x:F_W/2,y:F_H-90});
      setKp({x:F_W/2,y:G_H-10});
      setAng(-Math.PI/2);
    }else{
      setBp({x:F_W/2,y:90});
      setKp({x:F_W/2,y:F_H-G_H+10});
    }
    setTr([]);
  };

  // ── Menu ──────────────────────────────────────────────────────────────
  if(phs==='menu'){
    return(
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-4">
        <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} className="text-center">
          <motion.div animate={{y:[0,-10,0]}} transition={{duration:2,repeat:Infinity}} className="text-6xl mb-2">⚽</motion.div>
          <h1 className="font-heading font-black text-3xl text-primary">Gol a Gol</h1>
        </motion.div>
        <div className="space-y-2 w-full max-w-xs">
          {Array.from({length:MAX},(_,i)=>(
            <button key={i} onClick={()=>{setLvl(i);setScr({p:0,b:0});setRnd(1);setTrn('player');reset('player');setPhs('ready');}}
              className="w-full py-3 px-4 rounded-2xl bg-card border-2 border-border/30 hover:border-primary text-left flex justify-between items-center">
              <div><div className="font-bold text-sm">{cfg(i).label}</div><div className="text-[10px] text-muted-foreground">{cfg(i).rounds} rodadas</div></div>
              <span className="text-xl">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Fim ────────────────────────────────────────────────────────────────
  if(phs==='end'){
    const won=scr.p>scr.b;
    return(
      <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}}
        className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4">
        <div className="text-7xl">{won?'🏆':'😢'}</div>
        <div className="text-center">
          <h2 className="font-heading font-black text-2xl">{won?'Você venceu!':'Boa tentativa!'}</h2>
          <p className="text-muted-foreground">{scr.p} × {scr.b}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>setPhs('menu')} className="px-6 py-3 bg-muted font-bold rounded-2xl">Menu</button>
          <button onClick={()=>{setScr({p:0,b:0});setRnd(1);setTrn('player');reset('player');setPhs('ready');}} className="px-6 py-3 bg-primary text-white font-bold rounded-2xl">Jogar de novo</button>
        </div>
      </motion.div>
    );
  }

  // ── Animação de gol / defesa ──────────────────────────────────────────
  const handleGoal=(who)=>{
    setGoal(who);
    if(who==='player') setScr(s=>({...s,p:s.p+1}));
    else               setScr(s=>({...s,b:s.b+1}));
    setTimeout(()=>{
      setGoal(null);
      // Verificar vitória
      const wins=Math.ceil(c.rounds/2);
      if(scr.p>=wins || scr.b>=wins || rnd>=c.rounds){
        setPhs('end');
      }else{
        setRnd(r=>r+1);
        const nxt=who==='player'?'bot':'player';
        setTrn(nxt);
        reset(nxt);
        if(nxt==='bot') setTimeout(botKick,1800);
      }
    },1500);
  };

  const handleMiss=()=>{
    setTimeout(()=>{
      const nxt=trn==='player'?'bot':'player';
      setTrn(nxt);
      reset(nxt);
      if(nxt==='bot') setTimeout(botKick,1800);
    },500);
  };

  // ── Chute do bot ──────────────────────────────────────────────────────
  const botKick=()=>{
    if(phs!=='ready'||trn!=='bot') return;
    setPhs('shoot');

    const misses=Math.random()>c.bAcc;
    const offX=misses
      ? (Math.random()-0.5)*G_W*1.3
      : (Math.random()-0.5)*G_W*0.35;
    const tgtX=F_W/2+offX;
    const dy=(F_H-G_H+10)-90;
    const dx=tgtX-F_W/2;
    const ang2=Math.atan2(dy,dx);
    const spd=(55+Math.random()*20)/5;
    let vx=Math.cos(ang2)*spd;
    let vy=Math.sin(ang2)*spd;
    let pos={x:F_W/2,y:90};
    const trail=[];
    let fr=0;

    const step=()=>{
      fr++;
      pos={x:pos.x+vx,y:pos.y+vy};
      if(fr%2===0) trail.push({...pos});
      setTr([...trail.slice(-8)]);
      setBp({...pos});

      // goleira se move
      const kp2={...kp};
      const diff=tgtX-kp2.x;
      const nx=clamp(kp2.x+Math.sign(diff)*Math.min(Math.abs(diff),c.kSpeed),G_W/2,F_W-G_W/2);
      kp2.x=nx;
      setKp(kp2);

      // gol?
      if(pos.y>F_H-G_H-10&&Math.abs(pos.x-F_W/2)<G_W/2){
        const kd=dist(pos,kp2);
        if(kd<PR+BR+2){ setSvd(true); setTimeout(()=>{setSvd(false);handleMiss();},1400); }
        else handleGoal('bot');
        return;
      }
      // fora
      if(pos.y<-30||pos.y>F_H+30||pos.x<-20||pos.x>F_W+20){ handleMiss(); return; }

      rafRef.current=requestAnimationFrame(step);
    };
    rafRef.current=requestAnimationFrame(step);
  };

  // ── Chute do jogador ──────────────────────────────────────────────────
  const playerKick=()=>{
    if(phs!=='ready'||trn!=='player') return;
    cancelAnimationFrame(rafRef.current);
    setPhs('shoot');
    const spd=pwr/5;
    let vx=Math.cos(ang)*spd;
    let vy=Math.sin(ang)*spd;
    let pos={x:F_W/2,y:F_H-90};
    const trail=[];
    let fr=0;

    const step=()=>{
      fr++;
      pos={x:pos.x+vx,y:pos.y+vy};
      if(fr%2===0) trail.push({...pos});
      setTr([...trail.slice(-8)]);
      setBp({...pos});

      // goleira se move
      const kp2={...kp};
      const diff=pos.x-kp2.x;
      kp2.x=clamp(kp2.x+Math.sign(diff)*Math.min(Math.abs(diff),c.kSpeed),G_W/2,F_W-G_W/2);
      setKp(kp2);

      // gol?
      if(pos.y<G_H+10&&Math.abs(pos.x-F_W/2)<G_W/2){
        const kd=dist(pos,kp2);
        if(kd<PR+BR+2){ setSvd(true); setTimeout(()=>{setSvd(false);handleMiss();},1400); }
        else handleGoal('player');
        return;
      }
      // fora
      if(pos.y<-30||pos.y>F_H+30||pos.x<-20||pos.x>F_W+20){ handleMiss(); return; }

      rafRef.current=requestAnimationFrame(step);
    };
    rafRef.current=requestAnimationFrame(step);
  };

  // ── Joystick ──────────────────────────────────────────────────────────
  const joyStart=(cx,cy)=>{
    if(!joyRef.current)return;
    const r=joyRef.current.getBoundingClientRect();
    const c2={x:r.left+r.width/2,y:r.top+r.height/2};
    jcRef.current=c2; joyMv(cx,cy,c2);
  };
  const joyMv=(cx,cy,c2)=>{
    const c=c2||jcRef.current; if(!c)return;
    const dx=cx-c.x,dy=cy-c.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    const sc=Math.min(d,40)/40;
    const a=Math.atan2(dy,dx);
    joyV.current={x:Math.cos(a)*sc,y:Math.sin(a)*sc};
    setAng(a); setPwr(40+sc*30);
  };
  const joyEnd=()=>{ jcRef.current=null; joyV.current={x:0,y:0}; };

  // ── UI ────────────────────────────────────────────────────────────────
  const aimX=F_W/2+Math.cos(ang)*50;
  const aimY=F_H-90+Math.sin(ang)*50;

  return(
    <div className="flex flex-col items-center gap-2 select-none">

      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-sm px-1">
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground">{trn==='player'?'Sua vez':'Vez do bot 🤖'}</div>
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
          {trn==='player'&&phs==='ready'&&<line x1={F_W/2} y1={F_H-90} x2={aimX} y2={aimY} stroke="#FFD600" strokeWidth="2" strokeDasharray="6 4" opacity="0.8"/>}

          {/* trail */}
          {tr.map((t,i)=><circle key={i} cx={t.x} cy={t.y} r={BR*(i/(tr.length||1))*0.7} fill="white" opacity={i/(tr.length||1)*0.4}/>)}

          {/* goleira */}
          <text x={kp.x} y={kp.y+6} textAnchor="middle" fontSize="28">👩</text>

          {/* bola */}
          <circle cx={bp.x} cy={bp.y} r={BR} fill="white"/>
          <circle cx={bp.x-3} cy={bp.y-3} r={BR*0.45} fill="#333" opacity="0.5"/>

          {/* quem está */}
          <text x={trn==='player'?F_W/2:F_W/2} y={trn==='player'?F_H-90+8:90+8} textAnchor="middle" fontSize="26">{trn==='player'?'⚽':'🤖'}</text>
        </svg>

        {/* efeitos */}
        <AnimatePresence>
          {goal&&(
            <motion.div initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}
              className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <motion.div animate={{rotate:[0,5,-5,0],scale:[1,1.1,1]}} transition={{repeat:Infinity,duration:.4}}
                className="text-6xl font-black text-white">⚽ GOL!</motion.div>
            </motion.div>
          )}
          {svd&&(
            <motion.div initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}
              className="absolute inset-0 flex items-center justify-center bg-blue-900/40 z-10">
              <div className="text-4xl font-black text-white">🧤 Defendido!</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* vez do jogador */}
      {trn==='player'&&(
        <div className="w-full max-w-sm flex flex-col items-center gap-3">
          <p className="text-[10px] text-muted-foreground font-bold">{phs==='shoot'?'⚽ chutando...':'Mire e chute!'}</p>
          <div className="flex items-center gap-6">
            <div ref={joyRef}
              className="w-28 h-28 rounded-full bg-black/20 border-4 border-white/30 relative flex items-center justify-center touch-none"
              onTouchStart={e=>{e.preventDefault();joyStart(e.touches[0].clientX,e.touches[0].clientY);}}
              onTouchMove={e=>{e.preventDefault();joyMv(e.touches[0].clientX,e.touches[0].clientY);}}
              onTouchEnd={e=>{e.preventDefault();joyEnd();}}
              onMouseDown={e=>joyStart(e.clientX,e.clientY)}
              onMouseMove={e=>e.buttons===1&&joyMv(e.clientX,e.clientY)}
              onMouseUp={joyEnd}>
              <motion.div animate={{x:joyV.current.x*28,y:joyV.current.y*28}} transition={{type:'spring',stiffness:400,damping:30}}
                className="w-10 h-10 rounded-full bg-white/80 shadow-lg"/>
            </div>
            <motion.button whileTap={{scale:.88}}
              onClick={playerKick}
              disabled={phs!=='ready'}
              className={`w-24 h-24 rounded-full font-heading font-black text-base shadow-xl border-4 border-white/40 flex flex-col items-center justify-center ${phs==='ready'?'bg-gradient-to-br from-green-400 to-emerald-600 text-white':'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              ⚽<span className="text-xs mt-1">CHUTAR</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* vez do bot */}
      {trn==='bot'&&(
        <div className="w-full max-w-sm flex flex-col items-center gap-2">
          <p className="text-[10px] text-muted-foreground font-bold">
            {phs==='shoot'?'🤖 bot chutou!':'👩 Segure o bot! (defesa manual)'}          </p>
          {phs==='shoot'&&<p className="text-xs animate-pulse text-muted-foreground">...</p>}
        </div>
      )}
    </div>
  );
}
