import { useState, useEffect, useRef, useCallback } from "react";

/*
 * 🍄 WordJump — 超级玛丽单词跳跳
 * 难度分级：基础 / 中级 / 高级（对应 VOCAB 的 lv 字段）
 * 连击音效随连击数递进变化
 */

const GAME_W = 380;
const GAME_H = 520;
const GROUND_Y = GAME_H - 60;
const CHAR_W = 36;
const CHAR_H = 44;
const BLOCK_W = 100;
const BLOCK_H = 36;
const GRAVITY = 0.48;
const JUMP_VEL = -14;
const MOVE_SPEED = 4.5;

const DIFF = {
  basic:        { label:"\u{1F331} 基础", sub:"Basic · 简单词汇",  color:"#48a838", blockSpeed:0.9,  questions:12, distractors:2, lives:4 },
  intermediate: { label:"\u{1F525} 中级", sub:"Intermediate · 核心词汇", color:"#e09040", blockSpeed:1.2,  questions:15, distractors:2, lives:3 },
  advanced:     { label:"\u{1F480} 高级", sub:"Advanced · 进阶词汇", color:"#e44040", blockSpeed:1.5,  questions:15, distractors:3, lives:3 },
};

// ===== Sound Effects =====
const _sfx = {
  _ctx: null,
  _getCtx() {
    if (!this._ctx) try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    return this._ctx;
  },
  _tone(freq, type, vol, start, dur) {
    const ctx = this._getCtx(); if(!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur);
  },
  jump() {
    const ctx = this._getCtx(); if(!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch(e){}
  },
  bump() {
    try { this._tone(180, "square", 0.18, 0, 0.06); this._tone(160, "square", 0.14, 0.04, 0.06); } catch(e){}
  },
  comboSound(n) {
    try {
      if (n <= 1) {
        [988, 1319].forEach((f,i) => this._tone(f, "square", 0.15, i*0.07, 0.15));
      } else if (n === 2) {
        [784, 988, 1319].forEach((f,i) => this._tone(f, "square", 0.14, i*0.06, 0.13));
      } else if (n === 3) {
        [784, 988, 1175, 1568].forEach((f,i) => this._tone(f, "square", 0.15, i*0.055, 0.14));
      } else if (n === 4) {
        [660, 880, 1047, 1319, 1760].forEach((f,i) => this._tone(f, "square", 0.13, i*0.05, 0.15));
      } else if (n === 5) {
        [523, 659, 784, 988, 1319, 1568].forEach((f,i) => this._tone(f, "square", 0.12, i*0.045, 0.16));
        this._tone(262, "triangle", 0.1, 0, 0.35);
      } else {
        [523, 659, 784, 1047, 1319, 1568, 2093].slice(0, Math.min(7, 5 + n - 5)).forEach((f,i) => this._tone(f, "square", 0.11, i*0.04, 0.18));
        this._tone(262, "triangle", 0.12, 0, 0.4);
        this._tone(330, "triangle", 0.08, 0.05, 0.35);
        this._tone(2637, "sine", 0.06, 0.25, 0.2);
      }
    } catch(e){}
  },
  wrong() {
    try {
      const ctx = this._getCtx(); if(!ctx) return;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch(e){}
  },
  gameOver() {
    try { [392, 330, 262, 196].forEach((f,i) => this._tone(f, "square", 0.12, i*0.2, 0.3)); } catch(e){}
  },
};

const C = {
  blockFace: "#e09040", blockShadow: "#a05000", blockLight: "#f8d878", blockQuestion: "#f8f8f8",
  charBody: "#e44040", charSkin: "#fcb870", charPants: "#2838ec", charShoe: "#5c3c18",
  ground: "#c84c0c", groundTop: "#68b838",
  star: "#f8d830", coin: "#f8d830", correct: "#38c838", wrong: "#e44040",
  cloud: "rgba(255,255,255,0.85)",
};

function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

function pickDistractors(correctWord, pool, count) {
  // Filter out any word that matches the answer (by word string, not object reference)
  const others = pool.filter(w => w.word !== correctWord);
  // Also deduplicate by word string
  const seen = new Set();
  const unique = [];
  for (const w of shuffle(others)) {
    if (!seen.has(w.word)) { seen.add(w.word); unique.push(w); }
    if (unique.length >= count) break;
  }
  return unique;
}

export default function WordJump({ vocab = [], onClose, onScore }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const keysRef = useRef({ left: false, right: false });
  const frameRef = useRef(null);
  const [screen, setScreen] = useState("menu");
  const [difficulty, setDifficulty] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [totalQ, setTotalQ] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [combo, setCombo] = useState(0);

  const getPool = useCallback((diff) => {
    const filtered = vocab.filter(w => w.lv === diff);
    if (filtered.length < 20) return shuffle([...filtered, ...shuffle(vocab.filter(w=>w.lv!==diff)).slice(0, 20-filtered.length)]);
    return filtered;
  }, [vocab]);

  const buildQuestions = useCallback((diff) => {
    const cfg = DIFF[diff]; const pool = getPool(diff);
    if (!pool.length) return [];
    return shuffle(pool).slice(0, cfg.questions).map(w => {
      const distractors = pickDistractors(w.word, pool, cfg.distractors);
      const optionWords = shuffle([w.word, ...distractors.map(d => d.word)]);
      // Safety: ensure answer is definitely in options
      if (!optionWords.includes(w.word)) optionWords[0] = w.word;
      return { answer: w.word, cn: w.cn, options: optionWords };
    });
  }, [getPool]);

  const initGame = useCallback((diff) => {
    const cfg = DIFF[diff]; const questions = buildQuestions(diff);
    return {
      char: { x: GAME_W/2-CHAR_W/2, y: GROUND_Y-CHAR_H, vy:0, onGround:true, facing:1, frame:0 },
      blocks:[], currentQ:0, questions, score:0, combo:0, maxCombo:0,
      lives: cfg.lives, difficulty: diff, blockSpeed: cfg.blockSpeed,
      state:"active", hitResult:null, particles:[],
      clouds:[{x:50,y:60,w:70},{x:200,y:40,w:90},{x:320,y:80,w:60}], frameCount:0,
      spawnBlocks(q) {
        if(!q) return [];
        // Spread blocks vertically with guaranteed minimum gap (BLOCK_H + 16px)
        const count = q.options.length;
        const minGap = BLOCK_H + 18; // 36 + 18 = 54px minimum between block tops
        const topY = 200; // highest block position (reachable by jump)
        const bottomY = GROUND_Y - CHAR_H - 30; // lowest, still above character standing
        const range = bottomY - topY; // available vertical space
        // Evenly distribute then add small random jitter
        const positions = [];
        for (let i = 0; i < count; i++) {
          const baseY = topY + (range / (count + 1)) * (i + 1);
          const jitter = (Math.random() - 0.5) * 20;
          positions.push(Math.round(Math.max(topY, Math.min(bottomY - BLOCK_H, baseY + jitter))));
        }
        // Sort and enforce minimum gap
        positions.sort((a, b) => a - b);
        for (let i = 1; i < positions.length; i++) {
          if (positions[i] - positions[i-1] < minGap) positions[i] = positions[i-1] + minGap;
        }
        const shuffledPositions = shuffle(positions);
        return q.options.map((word,i) => ({ word, x:-BLOCK_W-i*200-Math.random()*40, y:shuffledPositions[i], hit:false, speed:cfg.blockSpeed+Math.random()*0.2 }));
      },
    };
  }, [buildQuestions]);

  const startGame = useCallback((diff) => {
    const g = initGame(diff); if(!g.questions.length) return;
    g.blocks = g.spawnBlocks(g.questions[0]);
    gameRef.current = g; setDifficulty(diff); setScreen("playing"); setCombo(0); setMaxCombo(0);
  }, [initGame]);

  const doJump = useCallback(() => {
    const g = gameRef.current; if(!g||g.state==="done") return;
    if(g.char.onGround){ g.char.vy=JUMP_VEL; g.char.onGround=false; _sfx.jump(); }
  }, []);

  useEffect(() => {
    if(screen!=="playing") return;
    const kd=(e)=>{ if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();doJump();} if(e.code==="ArrowLeft"||e.code==="KeyA")keysRef.current.left=true; if(e.code==="ArrowRight"||e.code==="KeyD")keysRef.current.right=true; };
    const ku=(e)=>{ if(e.code==="ArrowLeft"||e.code==="KeyA")keysRef.current.left=false; if(e.code==="ArrowRight"||e.code==="KeyD")keysRef.current.right=false; };
    window.addEventListener("keydown",kd); window.addEventListener("keyup",ku);
    return()=>{window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};
  }, [screen, doJump]);

  useEffect(() => {
    if(screen!=="playing") return;
    const cv=canvasRef.current; if(!cv) return;
    const ts=(e)=>{ e.preventDefault(); doJump(); const r=cv.getBoundingClientRect(); const x=e.touches[0].clientX-r.left;
      if(x<r.width/2){keysRef.current.left=true;keysRef.current.right=false;}else{keysRef.current.right=true;keysRef.current.left=false;} };
    const tm=(e)=>{ e.preventDefault(); const r=cv.getBoundingClientRect(); const x=e.touches[0].clientX-r.left;
      if(x<r.width/2){keysRef.current.left=true;keysRef.current.right=false;}else{keysRef.current.right=true;keysRef.current.left=false;} };
    const te=(e)=>{ e.preventDefault(); keysRef.current.left=false; keysRef.current.right=false; };
    cv.addEventListener("touchstart",ts,{passive:false}); cv.addEventListener("touchmove",tm,{passive:false}); cv.addEventListener("touchend",te,{passive:false});
    return()=>{cv.removeEventListener("touchstart",ts);cv.removeEventListener("touchmove",tm);cv.removeEventListener("touchend",te);};
  }, [screen, doJump]);

  useEffect(() => {
    if(screen!=="playing") return;
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");

    const update=()=>{
      const g=gameRef.current; if(!g) return; g.frameCount++;
      if(keysRef.current.left){g.char.x-=MOVE_SPEED;g.char.facing=-1;}
      if(keysRef.current.right){g.char.x+=MOVE_SPEED;g.char.facing=1;}
      g.char.x=Math.max(0,Math.min(GAME_W-CHAR_W,g.char.x));
      g.char.vy+=GRAVITY; g.char.y+=g.char.vy;
      if(g.char.y>=GROUND_Y-CHAR_H){g.char.y=GROUND_Y-CHAR_H;g.char.vy=0;g.char.onGround=true;}
      g.char.frame=g.frameCount%20<10?0:1;

      if(g.state==="active"){
        for(const b of g.blocks) if(!b.hit) b.x+=b.speed;
        const q=g.questions[g.currentQ];
        if(q&&g.char.vy<0){
          for(const b of g.blocks){
            if(b.hit) continue;
            const cTop=g.char.y, cCX=g.char.x+CHAR_W/2, bBot=b.y+BLOCK_H;
            if(cTop<=bBot&&cTop>=b.y&&cCX>=b.x&&cCX<=b.x+BLOCK_W){
              b.hit=true; g.char.vy=2; _sfx.bump();
              const ok=b.word===q.answer;
              if(ok){
                g.combo++; g.score+=10+(g.combo-1)*5; if(g.combo>g.maxCombo)g.maxCombo=g.combo;
                _sfx.comboSound(g.combo);
                const pc=Math.min(15,6+g.combo*2);
                for(let i=0;i<pc;i++) g.particles.push({x:b.x+BLOCK_W/2,y:b.y,vx:(Math.random()-0.5)*(4+g.combo),vy:-Math.random()*(4+g.combo)-2,life:25+g.combo*3,type:g.combo>=5?"star":"coin"});
              } else {
                g.combo=0; g.lives--; _sfx.wrong();
                for(let i=0;i<5;i++) g.particles.push({x:b.x+BLOCK_W/2,y:b.y,vx:(Math.random()-0.5)*4,vy:-Math.random()*3-1,life:20,type:"wrong"});
              }
              g.hitResult={correct:ok,word:b.word,answer:q.answer,timer:55};
              g.state="hit"; setCombo(g.combo); setMaxCombo(g.maxCombo);
              break;
            }
          }
        }
        if(g.blocks.every(b=>b.x>GAME_W+50)&&g.state==="active"){
          g.combo=0; g.lives--; _sfx.wrong();
          g.hitResult={correct:false,word:"???",answer:g.questions[g.currentQ]?.answer||"",timer:55};
          g.state="hit"; setCombo(0);
        }
      }

      if(g.state==="hit"&&g.hitResult){
        g.hitResult.timer--;
        if(g.hitResult.timer<=0){
          g.currentQ++;
          if(g.currentQ>=g.questions.length||g.lives<=0){
            g.state="done"; _sfx.gameOver();
            setFinalScore(g.score); setTotalQ(g.questions.length); setMaxCombo(g.maxCombo);
            setScreen("result"); if(onScore)onScore(g.score); return;
          }
          g.blocks=g.spawnBlocks(g.questions[g.currentQ]); g.state="active"; g.hitResult=null;
        }
      }
      g.particles=g.particles.filter(p=>p.life>0);
      for(const p of g.particles){p.x+=p.vx;p.y+=p.vy;p.vy+=0.3;p.life--;}
      for(const c of g.clouds){c.x+=0.3;if(c.x>GAME_W+100)c.x=-c.w;}
    };

    const drawCloud=(x,y,w)=>{
      ctx.fillStyle=C.cloud; const h=w*0.45;
      ctx.beginPath();ctx.ellipse(x+w*0.3,y+h*0.6,w*0.3,h*0.4,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(x+w*0.55,y+h*0.35,w*0.28,h*0.45,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(x+w*0.7,y+h*0.6,w*0.25,h*0.35,0,0,Math.PI*2);ctx.fill();
      ctx.fillRect(x+w*0.1,y+h*0.5,w*0.75,h*0.3);
    };
    const drawBlock=(b,isAns)=>{
      ctx.fillStyle=C.blockShadow;ctx.fillRect(b.x+2,b.y+2,BLOCK_W,BLOCK_H);
      ctx.fillStyle=b.hit?(isAns?C.correct:C.wrong):C.blockFace;ctx.fillRect(b.x,b.y,BLOCK_W,BLOCK_H);
      ctx.fillStyle=b.hit?(isAns?C.correct:C.wrong):C.blockLight;ctx.fillRect(b.x+2,b.y+2,BLOCK_W-4,4);
      if(!b.hit){ctx.strokeStyle=C.blockShadow;ctx.lineWidth=1;ctx.strokeRect(b.x,b.y,BLOCK_W,BLOCK_H);ctx.beginPath();ctx.moveTo(b.x+BLOCK_W/2,b.y);ctx.lineTo(b.x+BLOCK_W/2,b.y+BLOCK_H);ctx.stroke();}
      ctx.fillStyle=b.hit?"#fff":C.blockQuestion;ctx.font="bold 14px 'Nunito','Comic Sans MS',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(b.word,b.x+BLOCK_W/2,b.y+BLOCK_H/2);
    };
    const drawChar=(ch)=>{
      const x=ch.x,y=ch.y,f=ch.facing;
      ctx.fillStyle=C.charBody;ctx.fillRect(x+6,y+14,24,14);
      ctx.fillStyle=C.charSkin;ctx.fillRect(x+10,y+2,16,14);
      ctx.fillStyle=C.charBody;ctx.fillRect(x+8,y,20,6);ctx.fillRect(x+(f>0?14:6),y-2,16,5);
      ctx.fillStyle="#000";ctx.fillRect(x+(f>0?20:14),y+8,3,3);
      ctx.fillStyle=C.charPants;ctx.fillRect(x+8,y+28,20,8);
      ctx.fillStyle=C.charShoe;
      if(ch.onGround&&(keysRef.current.left||keysRef.current.right)){
        if(ch.frame===0){ctx.fillRect(x+6,y+36,10,8);ctx.fillRect(x+20,y+36,10,8);}
        else{ctx.fillRect(x+4,y+36,10,8);ctx.fillRect(x+22,y+36,10,8);}
      }else if(!ch.onGround){
        ctx.fillRect(x+4,y+36,10,8);ctx.fillRect(x+22,y+36,10,8);
        ctx.fillStyle=C.charSkin;ctx.fillRect(x+(f>0?26:-2),y+10,8,4);
      }else{ctx.fillRect(x+8,y+36,10,8);ctx.fillRect(x+18,y+36,10,8);}
    };

    const draw=()=>{
      const g=gameRef.current; if(!g) return;
      const sky=ctx.createLinearGradient(0,0,0,GROUND_Y);sky.addColorStop(0,"#6cb5ff");sky.addColorStop(1,"#9ad4ff");
      ctx.fillStyle=sky;ctx.fillRect(0,0,GAME_W,GAME_H);
      for(const c of g.clouds)drawCloud(c.x,c.y,c.w);
      ctx.fillStyle="#48a838";ctx.beginPath();ctx.moveTo(0,GROUND_Y);
      for(let x=0;x<=GAME_W;x+=5)ctx.lineTo(x,GROUND_Y-Math.sin(x*0.015)*25-Math.sin(x*0.03)*15-40);
      ctx.lineTo(GAME_W,GROUND_Y);ctx.fill();
      ctx.fillStyle=C.groundTop;ctx.fillRect(0,GROUND_Y,GAME_W,6);
      ctx.fillStyle=C.ground;ctx.fillRect(0,GROUND_Y+6,GAME_W,GAME_H-GROUND_Y-6);
      ctx.fillStyle="#a04000";
      for(let x=0;x<GAME_W;x+=32){ctx.fillRect(x,GROUND_Y+14,32,1);ctx.fillRect(x+(Math.floor(x/32)%2)*16,GROUND_Y+6,1,54);}

      const q=g.questions[g.currentQ];
      for(const b of g.blocks) if(b.x>-BLOCK_W&&b.x<GAME_W+BLOCK_W) drawBlock(b,q&&b.word===q.answer);
      drawChar(g.char);

      for(const p of g.particles){
        if(p.type==="star"){ctx.fillStyle=`hsl(${(p.life*12)%360},100%,60%)`;const s=3+(p.life/40)*5;ctx.fillRect(p.x-s/2,p.y-s/2,s,s);}
        else if(p.type==="coin"){ctx.fillStyle=C.coin;const s=3+(p.life/30)*4;ctx.fillRect(p.x-s/2,p.y-s/2,s,s);}
        else{ctx.fillStyle=C.wrong;ctx.fillRect(p.x-2,p.y-2,4,4);}
      }

      if(q&&g.state!=="done"){
        ctx.fillStyle="rgba(0,0,0,0.7)";const py=GROUND_Y+12;ctx.fillRect(10,py,GAME_W-20,40);
        ctx.fillStyle="#fff";ctx.font="bold 16px 'Nunito',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText(`找到: ${q.cn}`,GAME_W/2,py+20);
      }

      ctx.fillStyle="#fff";ctx.font="bold 14px 'Nunito',sans-serif";ctx.textAlign="left";ctx.textBaseline="top";
      ctx.fillText(`⭐ ${g.score}`,10,10);
      const cfg=DIFF[g.difficulty];
      ctx.fillStyle=cfg.color;ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(cfg.label,GAME_W/2,42);
      ctx.textAlign="right";ctx.fillStyle="#fff";ctx.fillText("❤️".repeat(g.lives)+"🖤".repeat(Math.max(0,cfg.lives-g.lives)),GAME_W-10,10);

      if(g.combo>=2){
        const cc=["#f8d830","#ff8c00","#ff4444","#ff00ff","#00ffff","#fff"];
        ctx.fillStyle=cc[Math.min(g.combo-2,cc.length-1)];
        ctx.font=`bold ${Math.min(24,16+g.combo)}px 'Nunito',sans-serif`;ctx.textAlign="center";
        ctx.fillText(g.combo>=6?`🌟 ${g.combo}连击!!!`:g.combo>=4?`⚡ ${g.combo}连击!!`:`🔥 ${g.combo}连击!`,GAME_W/2,10);
      }
      ctx.fillStyle="rgba(255,255,255,0.3)";ctx.fillRect(10,28,GAME_W-20,4);
      ctx.fillStyle=C.star;ctx.fillRect(10,28,(GAME_W-20)*(g.questions.length>0?g.currentQ/g.questions.length:0),4);

      if(g.hitResult&&g.state==="hit"){
        const hr=g.hitResult;
        ctx.fillStyle=hr.correct?"rgba(56,200,56,0.3)":"rgba(228,64,64,0.3)";ctx.fillRect(0,0,GAME_W,GAME_H);
        ctx.font="bold 28px 'Nunito',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="#fff";
        ctx.strokeStyle=hr.correct?"#1a8c1a":"#8c1a1a";ctx.lineWidth=3;
        const msg=hr.correct?"✅ 正确!":`❌ 答案: ${hr.answer}`;
        ctx.strokeText(msg,GAME_W/2,GAME_H/2-20);ctx.fillText(msg,GAME_W/2,GAME_H/2-20);
        if(hr.correct&&g.combo>=2){ctx.font="bold 18px 'Nunito',sans-serif";ctx.fillStyle=C.star;ctx.fillText(`+${10+(g.combo-1)*5} 连击奖励!`,GAME_W/2,GAME_H/2+15);}
      }
      ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="11px sans-serif";ctx.textAlign="center";
      ctx.fillText("← 点左移 | 点击跳跃 | 点右移 →",GAME_W/2,GAME_H-6);
    };

    const loop=()=>{update();draw();frameRef.current=requestAnimationFrame(loop);};
    frameRef.current=requestAnimationFrame(loop);
    return()=>{if(frameRef.current)cancelAnimationFrame(frameRef.current);};
  }, [screen, onScore]);

  // ===== MENU =====
  if (screen === "menu") {
    return (
      <div style={{position:"fixed",inset:0,zIndex:9999,background:"linear-gradient(180deg,#6cb5ff 0%,#9ad4ff 60%,#48a838 60%,#48a838 75%,#c84c0c 75%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito','Comic Sans MS',sans-serif"}}>
        <div style={{position:"absolute",top:40,left:"10%",width:80,height:35,background:C.cloud,borderRadius:20}}/>
        <div style={{position:"absolute",top:70,right:"15%",width:60,height:28,background:C.cloud,borderRadius:15}}/>
        <div style={{fontSize:38,fontWeight:900,color:"#fff",textShadow:"3px 3px 0 #c84c0c,5px 5px 0 rgba(0,0,0,0.2)",marginBottom:6}}>🍄 单词跳跳</div>
        <div style={{fontSize:14,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,0.3)",marginBottom:20,opacity:0.9}}>WORD JUMP · 选择难度</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,width:280,marginBottom:16}}>
          {["basic","intermediate","advanced"].map(dk=>{
            const d=DIFF[dk]; const count=vocab.filter(w=>w.lv===dk).length;
            return (
              <button key={dk} onClick={()=>startGame(dk)} style={{
                padding:"14px 16px",fontSize:17,fontWeight:900,
                background:`linear-gradient(135deg,${d.color},${d.color}cc)`,
                color:"#fff",border:`3px solid ${d.color}88`,borderRadius:12,
                cursor:"pointer",textShadow:"1px 1px 0 rgba(0,0,0,0.3)",
                boxShadow:`0 4px 0 ${d.color}88,0 6px 12px rgba(0,0,0,0.2)`,
                display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"transform 0.1s",
              }} onMouseDown={e=>e.currentTarget.style.transform="translateY(3px)"} onMouseUp={e=>e.currentTarget.style.transform="translateY(0)"}>
                <span>{d.label}</span>
                <span style={{fontSize:11,fontWeight:600,opacity:0.85}}>{d.sub} · {count}词 · {d.lives}条命</span>
              </button>
            );
          })}
        </div>
        <div style={{background:"rgba(0,0,0,0.4)",borderRadius:10,padding:"12px 20px",color:"#fff",fontSize:12,lineHeight:1.7,maxWidth:280,textAlign:"center"}}>
          📱 点屏幕左/右移动 · 点击跳跃<br/>⌨️ 方向键移动 · 空格跳跃<br/>🔥 连续答对 → 音效升级 + 连击加分！
        </div>
        {onClose&&<button onClick={onClose} style={{marginTop:14,padding:"8px 24px",fontSize:13,background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.4)",borderRadius:6,cursor:"pointer"}}>← 返回</button>}
      </div>
    );
  }

  // ===== RESULT =====
  if (screen === "result") {
    const stars=finalScore>=120?3:finalScore>=70?2:finalScore>=30?1:0;
    const cfg=DIFF[difficulty];
    return (
      <div style={{position:"fixed",inset:0,zIndex:9999,background:"linear-gradient(180deg,#1a1a3e 0%,#2a2a5e 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito','Comic Sans MS',sans-serif",color:"#fff"}}>
        <div style={{fontSize:36,marginBottom:8}}>{"⭐".repeat(stars)}{"☆".repeat(3-stars)}</div>
        <div style={{fontSize:28,fontWeight:900,marginBottom:6}}>游戏结束！</div>
        <div style={{fontSize:14,color:cfg.color,fontWeight:700,marginBottom:16}}>{cfg.label}</div>
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"20px 36px",textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,fontWeight:900,color:"#f8d830"}}>{finalScore}</div>
          <div style={{fontSize:14,opacity:0.7}}>总得分</div>
          <div style={{fontSize:14,marginTop:8}}>共 {totalQ} 题 · 最高 {maxCombo} 连击</div>
          {maxCombo>=5&&<div style={{fontSize:13,color:"#ff00ff",marginTop:4}}>🌟 连击大师！</div>}
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          <button onClick={()=>startGame(difficulty)} style={{padding:"12px 28px",fontSize:15,fontWeight:800,background:cfg.color,color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>🔄 再来一次</button>
          <button onClick={()=>setScreen("menu")} style={{padding:"12px 28px",fontSize:15,fontWeight:800,background:"rgba(255,255,255,0.15)",color:"#fff",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,cursor:"pointer"}}>🎯 换难度</button>
          {onClose&&<button onClick={onClose} style={{padding:"12px 28px",fontSize:15,fontWeight:800,background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,cursor:"pointer"}}>← 返回</button>}
        </div>
      </div>
    );
  }

  // ===== PLAYING =====
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <canvas ref={canvasRef} width={GAME_W} height={GAME_H} style={{maxWidth:"100vw",maxHeight:"100vh",imageRendering:"pixelated",touchAction:"none"}}/>
    </div>
  );
}
