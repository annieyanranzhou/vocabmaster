import { useState, useEffect, useRef, useCallback } from "react";

/*
 * 🍉 WordSlice — 切水果学单词
 * 
 * 水果从屏幕下方抛上来，每个水果上写着一个英文单词。
 * 屏幕顶部显示中文提示，玩家滑动手指切开正确单词的水果。
 * 切错炸弹💣扣命，漏掉正确水果也扣命。
 */

const W = 380, H = 560;
const FRUIT_R = 38;
const GRAVITY = 0.12;

const DIFF = {
  basic:        { label:"🌱 基础", sub:"Basic",  color:"#48a838", interval:100, speed:5.5, count:12, lives:4, opts:3 },
  intermediate: { label:"🔥 中级", sub:"Intermediate", color:"#e09040", interval:85,  speed:6.0, count:15, lives:3, opts:3 },
  advanced:     { label:"💀 高级", sub:"Advanced", color:"#e44040", interval:70,  speed:6.5, count:15, lives:3, opts:4 },
};

const FRUITS = [
  { emoji:"🍎", color:"#ff4444", sliceColor:"#ffcccc" },
  { emoji:"🍊", color:"#ff8c00", sliceColor:"#ffe0b2" },
  { emoji:"🍋", color:"#ffd700", sliceColor:"#fff9c4" },
  { emoji:"🍇", color:"#9c27b0", sliceColor:"#e1bee7" },
  { emoji:"🍉", color:"#4caf50", sliceColor:"#c8e6c9" },
  { emoji:"🍑", color:"#ff7043", sliceColor:"#ffccbc" },
  { emoji:"🥝", color:"#689f38", sliceColor:"#dcedc8" },
  { emoji:"🫐", color:"#5c6bc0", sliceColor:"#c5cae9" },
];

const BOMB = { emoji:"💣", color:"#333", sliceColor:"#ff0000" };

// Sound effects
const _sfx = {
  _ctx: null,
  _getCtx() { if(!this._ctx) try{this._ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){} return this._ctx; },
  _tone(f,t,v,s,d) {
    const ctx=this._getCtx();if(!ctx)return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);o.type=t;o.frequency.value=f;
    g.gain.setValueAtTime(v,ctx.currentTime+s);g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+s+d);
    o.start(ctx.currentTime+s);o.stop(ctx.currentTime+s+d);
  },
  slice(combo) {
    try {
      const base = 600 + Math.min(combo, 8) * 80;
      this._tone(base, "sine", 0.15, 0, 0.08);
      this._tone(base * 1.5, "sine", 0.1, 0.03, 0.1);
      if (combo >= 3) this._tone(base * 2, "sine", 0.08, 0.06, 0.12);
      if (combo >= 5) { this._tone(base * 2.5, "sine", 0.06, 0.09, 0.15); this._tone(base * 0.5, "triangle", 0.08, 0, 0.2); }
      if (combo >= 7) { [1,1.25,1.5,1.75,2].forEach((m,i) => this._tone(base*m,"sine",0.05,i*0.03,0.1)); }
    } catch(e){}
  },
  bomb() {
    try {
      const ctx=this._getCtx();if(!ctx)return;
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);o.type="sawtooth";
      o.frequency.setValueAtTime(150,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(40,ctx.currentTime+0.4);
      g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.4);
      o.start();o.stop(ctx.currentTime+0.4);
      // Noise burst
      const buf=ctx.createBuffer(1,ctx.sampleRate*0.15,ctx.sampleRate);
      const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*0.3;
      const n=ctx.createBufferSource(),ng=ctx.createGain();
      n.buffer=buf;n.connect(ng);ng.connect(ctx.destination);
      ng.gain.setValueAtTime(0.15,ctx.currentTime);ng.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.15);
      n.start();n.stop(ctx.currentTime+0.15);
    } catch(e){}
  },
  miss() {
    try { this._tone(200,"square",0.1,0,0.15); this._tone(150,"square",0.08,0.1,0.15); } catch(e){}
  },
  gameOver() {
    try { [392,330,262,196].forEach((f,i) => this._tone(f,"square",0.12,i*0.2,0.3)); } catch(e){}
  },
};

function shuffle(arr) { const a=[...arr];for(let i=a.length-1;i>0;i--){const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]];}return a; }

export default function WordSlice({ vocab = [], onClose, onScore }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const frameRef = useRef(null);
  const trailRef = useRef([]);
  const touchRef = useRef({ active: false, x: 0, y: 0 });
  const [screen, setScreen] = useState("menu");
  const [difficulty, setDifficulty] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalQ, setTotalQ] = useState(0);

  const getPool = useCallback((diff) => {
    const filtered = vocab.filter(w => w.lv === diff);
    if (filtered.length < 20) return shuffle([...filtered, ...shuffle(vocab.filter(w=>w.lv!==diff)).slice(0,20-filtered.length)]);
    return filtered;
  }, [vocab]);

  const buildQuestions = useCallback((diff) => {
    const cfg = DIFF[diff]; const pool = getPool(diff);
    if (!pool.length) return [];
    return shuffle(pool).slice(0, cfg.count).map(w => {
      const others = shuffle(pool.filter(v=>v.word!==w.word));
      const seen = new Set([w.word]);
      const distractors = [];
      for (const o of others) { if(!seen.has(o.word)){seen.add(o.word);distractors.push(o.word);} if(distractors.length>=cfg.opts-1)break; }
      const options = shuffle([w.word, ...distractors]);
      if (!options.includes(w.word)) options[0] = w.word;
      return { answer: w.word, cn: w.cn, options };
    });
  }, [getPool]);

  const startGame = useCallback((diff) => {
    const cfg = DIFF[diff];
    const questions = buildQuestions(diff);
    if (!questions.length) return;
    gameRef.current = {
      questions, currentQ: 0, score: 0, combo: 0, maxCombo: 0,
      lives: cfg.lives, difficulty: diff,
      fruits: [], slicedParts: [], particles: [],
      state: "waiting", // waiting -> thrown -> answered -> next -> done
      throwTimer: 15,
      answerTimer: 0,
      answerResult: null,
      frameCount: 0,
      cfg,
    };
    trailRef.current = [];
    setDifficulty(diff);
    setScreen("playing");
  }, [buildQuestions]);

  // Throw fruits for current question
  const throwFruits = useCallback((g) => {
    const q = g.questions[g.currentQ];
    if (!q) return;
    const fruitTypes = shuffle([...FRUITS]);
    const count = q.options.length;
    const spacing = W / (count + 1);
    
    g.fruits = q.options.map((word, i) => {
      const isAnswer = word === q.answer;
      const isBomb = !isAnswer && Math.random() < 0.25;
      const ft = isBomb ? BOMB : fruitTypes[i % fruitTypes.length];
      const baseX = spacing * (i + 1) + (Math.random() - 0.5) * 30;
      const delay = i * 5; // stagger launch by 5 frames each
      return {
        word, x: baseX, y: H + 20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(10 + Math.random() * 2), // strong upward - reaches top half
        rotation: 0,
        rotSpeed: 0,
        fruit: ft, isBomb, isAnswer,
        sliced: false, missed: false,
        delay,
        active: false,
      };
    });
    g.state = "thrown";
  }, []);

  // Check if swipe intersects a fruit
  const checkSlice = useCallback((x, y) => {
    const g = gameRef.current;
    if (!g || g.state !== "thrown") return;
    
    for (const f of g.fruits) {
      if (f.sliced || !f.active) continue;
      const dx = x - f.x, dy = y - f.y;
      if (dx * dx + dy * dy < (FRUIT_R + 10) * (FRUIT_R + 10)) {
        f.sliced = true;
        
        if (f.isBomb) {
          // Hit a bomb!
          _sfx.bomb();
          g.combo = 0;
          g.lives--;
          g.answerResult = { type: "bomb", timer: 50 };
          g.state = "answered";
          g.answerTimer = 50;
          // Explosion particles
          for (let i = 0; i < 20; i++) {
            g.particles.push({
              x: f.x, y: f.y,
              vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12,
              life: 30, color: "#ff4400", size: 4 + Math.random() * 4,
            });
          }
        } else if (f.isAnswer) {
          // Correct!
          g.combo++;
          g.score += 10 + (g.combo - 1) * 5;
          if (g.combo > g.maxCombo) g.maxCombo = g.combo;
          _sfx.slice(g.combo);
          g.answerResult = { type: "correct", timer: 45 };
          // Juice particles
          const color = f.fruit.sliceColor;
          for (let i = 0; i < 12 + g.combo * 2; i++) {
            g.particles.push({
              x: f.x, y: f.y,
              vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8 - 2,
              life: 20 + Math.random() * 15,
              color: g.combo >= 5 ? `hsl(${Math.random()*360},100%,60%)` : color,
              size: 3 + Math.random() * 4,
            });
          }
          // Slice halves
          g.slicedParts.push(
            { x: f.x-15, y: f.y, vx: -3, vy: -2, rot: -0.1, emoji: f.fruit.emoji, life: 40 },
            { x: f.x+15, y: f.y, vx: 3, vy: -2, rot: 0.1, emoji: f.fruit.emoji, life: 40 },
          );
          // Move to next question after short delay
          g.state = "answered";
          g.answerTimer = 45;
        } else {
          // Wrong fruit (not bomb, not answer)
          _sfx.miss();
          g.combo = 0;
          g.lives--;
          g.answerResult = { type: "wrong", word: f.word, answer: g.questions[g.currentQ]?.answer, timer: 50 };
          g.state = "answered";
          g.answerTimer = 50;
          for (let i = 0; i < 8; i++) {
            g.particles.push({
              x: f.x, y: f.y, vx: (Math.random()-0.5)*6, vy: (Math.random()-0.5)*6,
              life: 20, color: "#ff0000", size: 3,
            });
          }
        }
        break; // Only slice one fruit per swipe check
      }
    }
  }, []);

  // Touch/mouse handlers
  useEffect(() => {
    if (screen !== "playing") return;
    const cv = canvasRef.current; if (!cv) return;
    const getPos = (e) => {
      const r = cv.getBoundingClientRect();
      const scaleX = W / r.width, scaleY = H / r.height;
      if (e.touches) return { x: (e.touches[0].clientX - r.left) * scaleX, y: (e.touches[0].clientY - r.top) * scaleY };
      return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
    };
    const onStart = (e) => {
      e.preventDefault();
      const p = getPos(e);
      touchRef.current = { active: true, x: p.x, y: p.y };
      trailRef.current = [{ x: p.x, y: p.y, life: 12 }];
      checkSlice(p.x, p.y);
    };
    const onMove = (e) => {
      e.preventDefault();
      if (!touchRef.current.active) return;
      const p = getPos(e);
      touchRef.current.x = p.x; touchRef.current.y = p.y;
      trailRef.current.push({ x: p.x, y: p.y, life: 12 });
      if (trailRef.current.length > 30) trailRef.current.shift();
      checkSlice(p.x, p.y);
    };
    const onEnd = (e) => { e.preventDefault(); touchRef.current.active = false; };
    
    cv.addEventListener("touchstart", onStart, { passive: false });
    cv.addEventListener("touchmove", onMove, { passive: false });
    cv.addEventListener("touchend", onEnd, { passive: false });
    cv.addEventListener("mousedown", onStart);
    cv.addEventListener("mousemove", onMove);
    cv.addEventListener("mouseup", onEnd);
    return () => {
      cv.removeEventListener("touchstart", onStart);
      cv.removeEventListener("touchmove", onMove);
      cv.removeEventListener("touchend", onEnd);
      cv.removeEventListener("mousedown", onStart);
      cv.removeEventListener("mousemove", onMove);
      cv.removeEventListener("mouseup", onEnd);
    };
  }, [screen, checkSlice]);

  // Game loop
  useEffect(() => {
    if (screen !== "playing") return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const loop = () => {
      try {
      const g = gameRef.current; if (!g) return;
      g.frameCount++;

      // === UPDATE ===
      if (g.state === "waiting") {
        g.throwTimer--;
        if (g.throwTimer <= 0) throwFruits(g);
      }

      if (g.state === "thrown") {
        let allDone = true;
        for (const f of g.fruits) {
          if (f.delay > 0) { f.delay--; continue; }
          f.active = true;
          if (f.sliced) continue;
          f.x += f.vx; f.y += f.vy; f.vy += GRAVITY;
          if (f.y > H + FRUIT_R * 2 && !f.missed) {
            f.missed = true;
            if (f.isAnswer) {
              // Missed the correct answer
              g.combo = 0; g.lives--;
              _sfx.miss();
              g.answerResult = { type: "missed", answer: f.word, timer: 50 };
              g.state = "answered"; g.answerTimer = 50;
            }
          }
          if (f.y < H + FRUIT_R * 3) allDone = false;
        }
        // All fruits fell off without answering
        if (allDone && g.state === "thrown") {
          g.state = "answered"; g.answerTimer = 10;
        }
      }

      if (g.state === "answered") {
        g.answerTimer--;
        if (g.answerTimer <= 0) {
          g.currentQ++;
          if (g.currentQ >= g.questions.length || g.lives <= 0) {
            g.state = "done";
            _sfx.gameOver();
            setFinalScore(g.score); setTotalQ(g.questions.length); setMaxCombo(g.maxCombo);
            setScreen("result"); if (onScore) onScore(g.score);
            return;
          }
          g.fruits = []; g.slicedParts = [];
          g.state = "waiting"; g.throwTimer = 25;
          g.answerResult = null;
        }
      }

      // Update particles
      g.particles = g.particles.filter(p => p.life > 0);
      for (const p of g.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.vx *= 0.98; p.life--; }

      // Update sliced parts
      g.slicedParts = g.slicedParts.filter(s => s.life > 0);
      for (const s of g.slicedParts) { s.x += s.vx; s.y += s.vy; s.vy += 0.2; s.rot += s.vx * 0.02; s.life--; }

      // Update trail
      trailRef.current = trailRef.current.filter(t => t.life > 0);
      for (const t of trailRef.current) t.life--;

      // === DRAW ===
      // Background - dark gradient like fruit ninja
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#1a0a2e"); bg.addColorStop(0.5, "#16213e"); bg.addColorStop(1, "#0f3460");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Subtle wood texture at bottom
      ctx.fillStyle = "rgba(139,90,43,0.15)";
      ctx.fillRect(0, H - 40, W, 40);

      // Draw swipe trail
      if (trailRef.current.length >= 2) {
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath();
        const t0 = trailRef.current[0];
        ctx.moveTo(t0.x, t0.y);
        for (let i = 1; i < trailRef.current.length; i++) {
          const t = trailRef.current[i];
          ctx.lineTo(t.x, t.y);
        }
        ctx.stroke();
        // Glow
        ctx.strokeStyle = "rgba(255,255,100,0.3)";
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      // Draw fruits
      for (const f of g.fruits) {
        if (f.sliced || !f.active) continue;
        ctx.save();
        ctx.translate(f.x, f.y);
        // Outer glow
        ctx.shadowColor = f.fruit.color;
        ctx.shadowBlur = 15;
        // Solid bright circle
        ctx.beginPath();
        ctx.arc(0, 0, FRUIT_R, 0, Math.PI * 2);
        ctx.fillStyle = f.fruit.color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Emoji - big and centered
        ctx.font = `${FRUIT_R}px sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(f.fruit.emoji, 0, 0);
        // Word label - dark pill below fruit
        const wordFontSize = f.word.length > 10 ? 10 : f.word.length > 7 ? 12 : 14;
        ctx.font = `bold ${wordFontSize}px 'Nunito',sans-serif`;
        const tw = ctx.measureText(f.word).width;
        const pillW = tw + 16, pillH = wordFontSize + 10, pillY = FRUIT_R + 12;
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        const px = -pillW/2, py2 = pillY - pillH/2, pr = 6;
        ctx.beginPath();
        ctx.moveTo(px+pr, py2); ctx.lineTo(px+pillW-pr, py2); ctx.arcTo(px+pillW, py2, px+pillW, py2+pr, pr);
        ctx.lineTo(px+pillW, py2+pillH-pr); ctx.arcTo(px+pillW, py2+pillH, px+pillW-pr, py2+pillH, pr);
        ctx.lineTo(px+pr, py2+pillH); ctx.arcTo(px, py2+pillH, px, py2+pillH-pr, pr);
        ctx.lineTo(px, py2+pr); ctx.arcTo(px, py2, px+pr, py2, pr);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText(f.word, 0, pillY + 1);
        ctx.restore();
      }

      // Draw sliced halves
      for (const s of g.slicedParts) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.globalAlpha = Math.min(1, s.life / 15);
        ctx.font = `${FRUIT_R * 0.8}px sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, 0, 0);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // Draw particles
      for (const p of g.particles) {
        ctx.globalAlpha = Math.min(1, p.life / 10);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / 30), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // === HUD ===
      // Question prompt at bottom
      const q = g.questions[g.currentQ];
      if (q) {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, H - 50, W, 50);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px 'Nunito',sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(q.cn, W / 2, H - 25);
      }

      // Score - left
      ctx.fillStyle = "#f8d830";
      ctx.font = "bold 15px 'Nunito',sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText(`⭐ ${g.score}`, 12, 10);

      // Lives - right
      ctx.textAlign = "right";
      const cfg = DIFF[g.difficulty];
      ctx.fillText("❤️".repeat(g.lives) + "🖤".repeat(Math.max(0, cfg.lives - g.lives)), W - 12, 10);

      // Difficulty badge
      ctx.fillStyle = cfg.color; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(cfg.label, W / 2, 14);

      // Progress bar
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(12, 30, W - 24, 3);
      ctx.fillStyle = "#f8d830";
      ctx.fillRect(12, 30, (W - 24) * (g.questions.length > 0 ? g.currentQ / g.questions.length : 0), 3);

      // Combo
      if (g.combo >= 2) {
        const cc = ["#f8d830","#ff8c00","#ff4444","#ff00ff","#00ffff","#fff"];
        ctx.fillStyle = cc[Math.min(g.combo - 2, cc.length - 1)];
        const fs = Math.min(28, 18 + g.combo);
        ctx.font = `bold ${fs}px 'Nunito',sans-serif`;
        ctx.textAlign = "center";
        const label = g.combo >= 6 ? `🌟 ${g.combo}x COMBO!!!` : g.combo >= 4 ? `⚡ ${g.combo}x COMBO!!` : `🔥 ${g.combo}x COMBO!`;
        ctx.fillText(label, W / 2, 52);
      }

      // Answer result overlay
      if (g.answerResult) {
        const ar = g.answerResult;
        if (ar.type === "correct") {
          ctx.fillStyle = "rgba(56,200,56,0.15)";
          ctx.fillRect(0, 0, W, H);
          ctx.font = "bold 32px 'Nunito',sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = "#4cff4c"; ctx.strokeStyle = "#1a8c1a"; ctx.lineWidth = 3;
          ctx.strokeText("✅ 正确!", W/2, H/2 - 30);
          ctx.fillText("✅ 正确!", W/2, H/2 - 30);
          if (g.combo >= 2) {
            ctx.font = "bold 18px 'Nunito',sans-serif"; ctx.fillStyle = "#f8d830";
            ctx.fillText(`+${10 + (g.combo-1)*5}`, W/2, H/2 + 5);
          }
        } else if (ar.type === "bomb") {
          ctx.fillStyle = "rgba(255,50,0,0.25)"; ctx.fillRect(0, 0, W, H);
          ctx.font = "bold 32px 'Nunito',sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = "#ff4444"; ctx.strokeStyle = "#8c0000"; ctx.lineWidth = 3;
          ctx.strokeText("💣 炸弹!", W/2, H/2 - 30);
          ctx.fillText("💣 炸弹!", W/2, H/2 - 30);
        } else if (ar.type === "wrong") {
          ctx.fillStyle = "rgba(255,50,0,0.2)"; ctx.fillRect(0, 0, W, H);
          ctx.font = "bold 26px 'Nunito',sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = "#ff6666"; ctx.strokeStyle = "#8c0000"; ctx.lineWidth = 2;
          const msg = `❌ 答案: ${ar.answer}`;
          ctx.strokeText(msg, W/2, H/2 - 30); ctx.fillText(msg, W/2, H/2 - 30);
        } else if (ar.type === "missed") {
          ctx.fillStyle = "rgba(255,150,0,0.2)"; ctx.fillRect(0, 0, W, H);
          ctx.font = "bold 26px 'Nunito',sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffaa44"; ctx.strokeStyle = "#8c4400"; ctx.lineWidth = 2;
          ctx.strokeText(`😢 漏掉了: ${ar.answer}`, W/2, H/2 - 30);
          ctx.fillText(`😢 漏掉了: ${ar.answer}`, W/2, H/2 - 30);
        }
      }

      // Hint
      ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("滑动手指切开正确单词的水果", W/2, H - 8);

      } catch(err) { console.error("WordSlice loop error:", err); }
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [screen, throwFruits, onScore]);

  // ===== MENU =====
  if (screen === "menu") {
    return (
      <div style={{position:"fixed",inset:0,zIndex:9999,background:"linear-gradient(180deg,#1a0a2e 0%,#16213e 50%,#0f3460 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito','Comic Sans MS',sans-serif"}}>
        <div style={{fontSize:42,marginBottom:4}}>🍉🍎🍊</div>
        <div style={{fontSize:34,fontWeight:900,color:"#fff",textShadow:"2px 2px 0 #ff4444,4px 4px 0 rgba(0,0,0,0.3)",marginBottom:4}}>切水果学单词</div>
        <div style={{fontSize:14,color:"rgba(255,255,255,0.7)",marginBottom:22}}>WORD SLICE · 选择难度</div>
        
        <div style={{display:"flex",flexDirection:"column",gap:10,width:280,marginBottom:16}}>
          {["basic","intermediate","advanced"].map(dk => {
            const d = DIFF[dk]; const count = vocab.filter(w=>w.lv===dk).length;
            return (
              <button key={dk} onClick={()=>startGame(dk)} style={{
                padding:"14px 16px",fontSize:17,fontWeight:900,
                background:`linear-gradient(135deg,${d.color}cc,${d.color})`,
                color:"#fff",border:"none",borderRadius:12,cursor:"pointer",
                textShadow:"1px 1px 0 rgba(0,0,0,0.3)",
                boxShadow:`0 4px 16px ${d.color}66`,
                display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"transform 0.1s",
              }} onMouseDown={e=>e.currentTarget.style.transform="scale(0.96)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
                <span>{d.label}</span>
                <span style={{fontSize:11,fontWeight:600,opacity:0.85}}>{d.sub} · {count}词 · {d.lives}条命</span>
              </button>
            );
          })}
        </div>

        <div style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 20px",color:"rgba(255,255,255,0.7)",fontSize:12,lineHeight:1.7,maxWidth:280,textAlign:"center"}}>
          📱 看中文提示，滑动切开正确单词<br/>💣 别切炸弹！切错扣命<br/>🔥 连续答对 → 音效升级 + 连击加分！
        </div>

        {onClose&&<button onClick={onClose} style={{marginTop:14,padding:"8px 24px",fontSize:13,background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,cursor:"pointer"}}>← 返回</button>}
      </div>
    );
  }

  // ===== RESULT =====
  if (screen === "result") {
    const stars = finalScore>=120?3:finalScore>=70?2:finalScore>=30?1:0;
    const cfg = DIFF[difficulty];
    return (
      <div style={{position:"fixed",inset:0,zIndex:9999,background:"linear-gradient(180deg,#1a0a2e 0%,#16213e 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito','Comic Sans MS',sans-serif",color:"#fff"}}>
        <div style={{fontSize:36,marginBottom:8}}>{"⭐".repeat(stars)}{"☆".repeat(3-stars)}</div>
        <div style={{fontSize:28,fontWeight:900,marginBottom:6}}>游戏结束！</div>
        <div style={{fontSize:14,color:cfg.color,fontWeight:700,marginBottom:16}}>{cfg.label}</div>
        <div style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"20px 36px",textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,fontWeight:900,color:"#f8d830"}}>{finalScore}</div>
          <div style={{fontSize:14,opacity:0.7}}>总得分</div>
          <div style={{fontSize:14,marginTop:8}}>共 {totalQ} 题 · 最高 {maxCombo} 连击</div>
          {maxCombo>=5&&<div style={{fontSize:13,color:"#ff00ff",marginTop:4}}>🌟 切割大师！</div>}
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          <button onClick={()=>startGame(difficulty)} style={{padding:"12px 28px",fontSize:15,fontWeight:800,background:cfg.color,color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>🔄 再来一次</button>
          <button onClick={()=>setScreen("menu")} style={{padding:"12px 28px",fontSize:15,fontWeight:800,background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,cursor:"pointer"}}>🎯 换难度</button>
          {onClose&&<button onClick={onClose} style={{padding:"12px 28px",fontSize:15,fontWeight:800,background:"rgba(255,255,255,0.05)",color:"#fff",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,cursor:"pointer"}}>← 返回</button>}
        </div>
      </div>
    );
  }

  // ===== PLAYING =====
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"#0a0a1a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <canvas ref={canvasRef} width={W} height={H} style={{maxWidth:"100vw",maxHeight:"100vh",width:"auto",height:"100vh",touchAction:"none",cursor:"crosshair"}}/>
    </div>
  );
}
