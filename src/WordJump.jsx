import { useState, useEffect, useRef, useCallback } from "react";

/*
 * 🍄 WordJump — 超级玛丽单词跳跳
 * 
 * 玩法：屏幕上方飘过带单词的砖块，下方显示中文提示。
 * 玩家控制角色跳起来撞击正确单词的砖块。
 * 
 * 操控：
 *   - 手机：点击屏幕任意位置跳跃，左右滑动移动
 *   - 电脑：空格键跳跃，A/D 或左右箭头移动
 * 
 * Props:
 *   vocab: 词库数组 [{word, cn, ...}]
 *   onClose: 关闭回调
 *   onScore: 得分回调 (score) => {}
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
const BLOCK_SPEED = 1.1;

// Pixel art character colors
const C = {
  bg: "#5c94fc",
  ground: "#c84c0c",
  groundTop: "#68b838",
  sky1: "#5c94fc",
  sky2: "#3c7adc",
  blockFace: "#e09040",
  blockShadow: "#a05000",
  blockLight: "#f8d878",
  blockQuestion: "#f8f8f8",
  charBody: "#e44040",
  charSkin: "#fcb870",
  charPants: "#2838ec",
  charShoe: "#5c3c18",
  star: "#f8d830",
  coin: "#f8d830",
  textShadow: "#2c1800",
  correct: "#38c838",
  wrong: "#e44040",
  cloud: "rgba(255,255,255,0.85)",
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(correct, allWords, count = 2) {
  const others = allWords.filter(w => w.word !== correct.word);
  return shuffle(others).slice(0, count);
}

export default function WordJump({ vocab = [], onClose, onScore }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const keysRef = useRef({ left: false, right: false });
  const frameRef = useRef(null);
  const [screen, setScreen] = useState("menu"); // menu | playing | result
  const [finalScore, setFinalScore] = useState(0);
  const [totalQ, setTotalQ] = useState(0);
  const [combo, setCombo] = useState(0);
  const touchStartRef = useRef(null);

  // Build questions
  const buildQuestions = useCallback(() => {
    if (!vocab.length) return [];
    const pool = shuffle(vocab).slice(0, 15);
    return pool.map(w => {
      const distractors = pickDistractors(w, vocab, 2);
      const options = shuffle([w, ...distractors]);
      return {
        answer: w.word,
        cn: w.cn,
        options: options.map(o => o.word),
      };
    });
  }, [vocab]);

  // Initialize game state
  const initGame = useCallback(() => {
    const questions = buildQuestions();
    return {
      char: {
        x: GAME_W / 2 - CHAR_W / 2,
        y: GROUND_Y - CHAR_H,
        vy: 0,
        onGround: true,
        facing: 1, // 1=right, -1=left
        frame: 0,
      },
      blocks: [],
      currentQ: 0,
      questions,
      score: 0,
      combo: 0,
      lives: 3,
      state: "intro", // intro -> active -> hit -> next -> done
      timer: 120, // frames for intro
      hitResult: null, // {correct, word, x, y, timer}
      particles: [],
      clouds: [
        { x: 50, y: 60, w: 70 },
        { x: 200, y: 40, w: 90 },
        { x: 320, y: 80, w: 60 },
      ],
      frameCount: 0,
      spawnBlocks: function(q) {
        if (!q) return [];
        const y_positions = [230, 290, 350];
        const shuffledY = shuffle(y_positions);
        return q.options.map((word, i) => ({
          word,
          x: -BLOCK_W - i * 200,
          y: shuffledY[i],
          hit: false,
          speed: BLOCK_SPEED + Math.random() * 0.3,
        }));
      },
    };
  }, [buildQuestions]);

  // Start game
  const startGame = useCallback(() => {
    const g = initGame();
    if (!g.questions.length) return;
    g.state = "active";
    g.blocks = g.spawnBlocks(g.questions[0]);
    gameRef.current = g;
    setScreen("playing");
    setCombo(0);
  }, [initGame]);

  // Jump
  const doJump = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.state === "done") return;
    if (g.char.onGround) {
      g.char.vy = JUMP_VEL;
      g.char.onGround = false;
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (screen !== "playing") return;
    const onKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        doJump();
      }
      if (e.code === "ArrowLeft" || e.code === "KeyA") keysRef.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keysRef.current.right = true;
    };
    const onKeyUp = (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keysRef.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") keysRef.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [screen, doJump]);

  // Touch controls
  useEffect(() => {
    if (screen !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      touchStartRef.current = { x, time: Date.now() };
      
      // Tap = jump
      doJump();
      
      // Left half = move left, right half = move right
      if (x < rect.width / 2) {
        keysRef.current.left = true;
        keysRef.current.right = false;
      } else {
        keysRef.current.right = true;
        keysRef.current.left = false;
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      if (x < rect.width / 2) {
        keysRef.current.left = true;
        keysRef.current.right = false;
      } else {
        keysRef.current.right = true;
        keysRef.current.left = false;
      }
    };

    const onTouchEnd = (e) => {
      e.preventDefault();
      keysRef.current.left = false;
      keysRef.current.right = false;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [screen, doJump]);

  // Game loop
  useEffect(() => {
    if (screen !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const update = () => {
      const g = gameRef.current;
      if (!g) return;
      g.frameCount++;

      // Move character
      if (keysRef.current.left) {
        g.char.x -= MOVE_SPEED;
        g.char.facing = -1;
      }
      if (keysRef.current.right) {
        g.char.x += MOVE_SPEED;
        g.char.facing = 1;
      }
      g.char.x = Math.max(0, Math.min(GAME_W - CHAR_W, g.char.x));

      // Gravity
      g.char.vy += GRAVITY;
      g.char.y += g.char.vy;
      if (g.char.y >= GROUND_Y - CHAR_H) {
        g.char.y = GROUND_Y - CHAR_H;
        g.char.vy = 0;
        g.char.onGround = true;
      }
      g.char.frame = g.frameCount % 20 < 10 ? 0 : 1;

      // Move blocks
      if (g.state === "active") {
        for (const b of g.blocks) {
          if (!b.hit) {
            b.x += b.speed;
          }
        }

        // Check collision (head bump into block bottom)
        const q = g.questions[g.currentQ];
        if (q && g.char.vy < 0) { // going up
          for (const b of g.blocks) {
            if (b.hit) continue;
            const charTop = g.char.y;
            const charCX = g.char.x + CHAR_W / 2;
            const blockBottom = b.y + BLOCK_H;
            if (
              charTop <= blockBottom &&
              charTop >= b.y &&
              charCX >= b.x &&
              charCX <= b.x + BLOCK_W
            ) {
              b.hit = true;
              g.char.vy = 2; // bounce down
              const isCorrect = b.word === q.answer;
              if (isCorrect) {
                g.score += 10 + g.combo * 5;
                g.combo++;
                // Coin particles
                for (let i = 0; i < 8; i++) {
                  g.particles.push({
                    x: b.x + BLOCK_W / 2,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: -Math.random() * 5 - 2,
                    life: 30,
                    type: "coin",
                  });
                }
              } else {
                g.combo = 0;
                g.lives--;
                // Wrong particles
                for (let i = 0; i < 5; i++) {
                  g.particles.push({
                    x: b.x + BLOCK_W / 2,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -Math.random() * 3 - 1,
                    life: 20,
                    type: "wrong",
                  });
                }
              }
              g.hitResult = {
                correct: isCorrect,
                word: b.word,
                answer: q.answer,
                x: b.x,
                y: b.y,
                timer: 60,
              };
              g.state = "hit";
              setCombo(g.combo);
              break;
            }
          }
        }

        // Blocks flew off screen = miss (move to next question)
        const allGone = g.blocks.every(b => b.x > GAME_W + 50);
        if (allGone && g.state === "active") {
          g.combo = 0;
          g.lives--;
          g.state = "hit";
          g.hitResult = {
            correct: false,
            word: "???",
            answer: q?.answer || "",
            x: GAME_W / 2,
            y: GAME_H / 2,
            timer: 60,
          };
          setCombo(0);
        }
      }

      // Hit result timer
      if (g.state === "hit" && g.hitResult) {
        g.hitResult.timer--;
        if (g.hitResult.timer <= 0) {
          g.currentQ++;
          if (g.currentQ >= g.questions.length || g.lives <= 0) {
            g.state = "done";
            setFinalScore(g.score);
            setTotalQ(g.questions.length);
            setScreen("result");
            if (onScore) onScore(g.score);
            return;
          }
          g.blocks = g.spawnBlocks(g.questions[g.currentQ]);
          g.state = "active";
          g.hitResult = null;
        }
      }

      // Update particles
      g.particles = g.particles.filter(p => p.life > 0);
      for (const p of g.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life--;
      }

      // Move clouds
      for (const c of g.clouds) {
        c.x += 0.3;
        if (c.x > GAME_W + 100) c.x = -c.w;
      }
    };

    const drawCloud = (x, y, w) => {
      ctx.fillStyle = C.cloud;
      const h = w * 0.45;
      ctx.beginPath();
      ctx.ellipse(x + w * 0.3, y + h * 0.6, w * 0.3, h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + w * 0.55, y + h * 0.35, w * 0.28, h * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + w * 0.7, y + h * 0.6, w * 0.25, h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillRect(x + w * 0.1, y + h * 0.5, w * 0.75, h * 0.3);
    };

    const drawBlock = (b, isAnswer) => {
      // Shadow
      ctx.fillStyle = C.blockShadow;
      ctx.fillRect(b.x + 2, b.y + 2, BLOCK_W, BLOCK_H);
      // Face
      const baseColor = b.hit ? (isAnswer ? C.correct : C.wrong) : C.blockFace;
      ctx.fillStyle = baseColor;
      ctx.fillRect(b.x, b.y, BLOCK_W, BLOCK_H);
      // Top highlight
      ctx.fillStyle = b.hit ? baseColor : C.blockLight;
      ctx.fillRect(b.x + 2, b.y + 2, BLOCK_W - 4, 4);
      // Grid lines (brick look)
      if (!b.hit) {
        ctx.strokeStyle = C.blockShadow;
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, BLOCK_W, BLOCK_H);
        ctx.beginPath();
        ctx.moveTo(b.x + BLOCK_W / 2, b.y);
        ctx.lineTo(b.x + BLOCK_W / 2, b.y + BLOCK_H);
        ctx.stroke();
      }
      // Word text
      ctx.fillStyle = b.hit ? "#fff" : C.blockQuestion;
      ctx.font = "bold 14px 'Nunito', 'Comic Sans MS', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b.word, b.x + BLOCK_W / 2, b.y + BLOCK_H / 2);
    };

    const drawChar = (char) => {
      const x = char.x;
      const y = char.y;
      const f = char.facing;
      
      // Body (red shirt)
      ctx.fillStyle = C.charBody;
      ctx.fillRect(x + 6, y + 14, 24, 14);
      
      // Head / face
      ctx.fillStyle = C.charSkin;
      ctx.fillRect(x + 10, y + 2, 16, 14);
      
      // Hat
      ctx.fillStyle = C.charBody;
      ctx.fillRect(x + 8, y, 20, 6);
      ctx.fillRect(x + (f > 0 ? 14 : 6), y - 2, 16, 5);
      
      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(x + (f > 0 ? 20 : 14), y + 8, 3, 3);
      
      // Pants (blue)
      ctx.fillStyle = C.charPants;
      ctx.fillRect(x + 8, y + 28, 20, 8);
      
      // Legs/shoes
      ctx.fillStyle = C.charShoe;
      if (char.onGround && (keysRef.current.left || keysRef.current.right)) {
        // Walking animation
        if (char.frame === 0) {
          ctx.fillRect(x + 6, y + 36, 10, 8);
          ctx.fillRect(x + 20, y + 36, 10, 8);
        } else {
          ctx.fillRect(x + 4, y + 36, 10, 8);
          ctx.fillRect(x + 22, y + 36, 10, 8);
        }
      } else if (!char.onGround) {
        // Jumping pose
        ctx.fillRect(x + 4, y + 36, 10, 8);
        ctx.fillRect(x + 22, y + 36, 10, 8);
        // Arms up
        ctx.fillStyle = C.charSkin;
        ctx.fillRect(x + (f > 0 ? 26 : -2), y + 10, 8, 4);
      } else {
        // Standing
        ctx.fillRect(x + 8, y + 36, 10, 8);
        ctx.fillRect(x + 18, y + 36, 10, 8);
      }
    };

    const draw = () => {
      const g = gameRef.current;
      if (!g) return;

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, "#6cb5ff");
      skyGrad.addColorStop(1, "#9ad4ff");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // Clouds
      for (const c of g.clouds) drawCloud(c.x, c.y, c.w);

      // Hills (background)
      ctx.fillStyle = "#48a838";
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      for (let x = 0; x <= GAME_W; x += 5) {
        const h = Math.sin(x * 0.015) * 25 + Math.sin(x * 0.03) * 15 + 40;
        ctx.lineTo(x, GROUND_Y - h);
      }
      ctx.lineTo(GAME_W, GROUND_Y);
      ctx.fill();

      // Ground
      ctx.fillStyle = C.groundTop;
      ctx.fillRect(0, GROUND_Y, GAME_W, 6);
      ctx.fillStyle = C.ground;
      ctx.fillRect(0, GROUND_Y + 6, GAME_W, GAME_H - GROUND_Y - 6);
      // Ground brick pattern
      ctx.fillStyle = "#a04000";
      for (let x = 0; x < GAME_W; x += 32) {
        const offset = (Math.floor(x / 32) % 2) * 16;
        ctx.fillRect(x, GROUND_Y + 14, 32, 1);
        ctx.fillRect(x + offset, GROUND_Y + 6, 1, 54);
      }

      // Blocks
      const q = g.questions[g.currentQ];
      for (const b of g.blocks) {
        if (b.x > -BLOCK_W && b.x < GAME_W + BLOCK_W) {
          drawBlock(b, q && b.word === q.answer);
        }
      }

      // Character
      drawChar(g.char);

      // Particles
      for (const p of g.particles) {
        if (p.type === "coin") {
          ctx.fillStyle = C.coin;
          const s = 3 + (p.life / 30) * 4;
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        } else {
          ctx.fillStyle = C.wrong;
          ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        }
      }

      // HUD - Question prompt
      if (q && g.state !== "done") {
        // Chinese prompt at bottom
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        const promptY = GROUND_Y + 12;
        ctx.fillRect(10, promptY, GAME_W - 20, 40);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px 'Nunito', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`找到: ${q.cn}`, GAME_W / 2, promptY + 20);
      }

      // HUD - Score, lives, combo, progress
      // Score
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px 'Nunito', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`⭐ ${g.score}`, 10, 10);

      // Lives
      ctx.textAlign = "right";
      let livesStr = "";
      for (let i = 0; i < g.lives; i++) livesStr += "❤️";
      for (let i = g.lives; i < 3; i++) livesStr += "🖤";
      ctx.fillText(livesStr, GAME_W - 10, 10);

      // Combo
      if (g.combo >= 2) {
        ctx.fillStyle = C.star;
        ctx.font = "bold 16px 'Nunito', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`🔥 ${g.combo}连击!`, GAME_W / 2, 10);
      }

      // Progress
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(10, 32, GAME_W - 20, 4);
      ctx.fillStyle = C.star;
      const prog = g.questions.length > 0 ? g.currentQ / g.questions.length : 0;
      ctx.fillRect(10, 32, (GAME_W - 20) * prog, 4);

      // Hit result overlay
      if (g.hitResult && g.state === "hit") {
        const hr = g.hitResult;
        ctx.fillStyle = hr.correct ? "rgba(56,200,56,0.3)" : "rgba(228,64,64,0.3)";
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        
        ctx.font = "bold 28px 'Nunito', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = hr.correct ? "#1a8c1a" : "#8c1a1a";
        ctx.lineWidth = 3;
        const msg = hr.correct ? "✅ 正确!" : `❌ 答案: ${hr.answer}`;
        ctx.strokeText(msg, GAME_W / 2, GAME_H / 2 - 20);
        ctx.fillText(msg, GAME_W / 2, GAME_H / 2 - 20);

        if (hr.correct && g.combo >= 2) {
          ctx.font = "bold 18px 'Nunito', sans-serif";
          ctx.fillStyle = C.star;
          ctx.fillText(`+${10 + (g.combo - 1) * 5} 连击奖励!`, GAME_W / 2, GAME_H / 2 + 15);
        }
      }

      // Mobile controls hint
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("← 点左移 | 点击跳跃 | 点右移 →", GAME_W / 2, GAME_H - 6);
    };

    const loop = () => {
      update();
      draw();
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [screen, onScore]);

  // ===== MENU SCREEN =====
  if (screen === "menu") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "linear-gradient(180deg, #6cb5ff 0%, #9ad4ff 60%, #48a838 60%, #48a838 75%, #c84c0c 75%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
      }}>
        {/* Clouds */}
        <div style={{ position: "absolute", top: 40, left: "10%", width: 80, height: 35, background: C.cloud, borderRadius: 20 }} />
        <div style={{ position: "absolute", top: 70, right: "15%", width: 60, height: 28, background: C.cloud, borderRadius: 15 }} />
        
        <div style={{
          fontSize: 42, fontWeight: 900, color: "#fff",
          textShadow: "3px 3px 0 #c84c0c, -1px -1px 0 #c84c0c, 5px 5px 0 rgba(0,0,0,0.2)",
          marginBottom: 8,
        }}>
          🍄 单词跳跳
        </div>
        <div style={{ fontSize: 16, color: "#fff", textShadow: "1px 1px 0 rgba(0,0,0,0.3)", marginBottom: 30 }}>
          WORD JUMP
        </div>
        
        <div style={{
          background: "rgba(0,0,0,0.5)", borderRadius: 12, padding: "16px 24px",
          color: "#fff", fontSize: 13, lineHeight: 1.8, maxWidth: 300, marginBottom: 24,
        }}>
          📖 屏幕上方飘过单词砖块<br/>
          🎯 看中文提示，跳起撞击正确单词<br/>
          📱 点屏幕左/右 = 移动，点击 = 跳跃<br/>
          ⌨️ 方向键移动，空格跳跃<br/>
          🔥 连续答对获得连击加分！
        </div>

        <button
          onClick={startGame}
          style={{
            padding: "14px 48px", fontSize: 20, fontWeight: 900,
            background: "linear-gradient(180deg, #e44040 0%, #c03030 100%)",
            color: "#fff", border: "3px solid #8c1818", borderRadius: 8,
            cursor: "pointer", textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
            boxShadow: "0 4px 0 #8c1818, 0 6px 12px rgba(0,0,0,0.3)",
            transform: "translateY(0)",
            transition: "transform 0.1s",
          }}
          onMouseDown={e => e.currentTarget.style.transform = "translateY(3px)"}
          onMouseUp={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          ▶ 开始游戏
        </button>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              marginTop: 16, padding: "8px 24px", fontSize: 14,
              background: "rgba(255,255,255,0.2)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6,
              cursor: "pointer",
            }}
          >
            ← 返回
          </button>
        )}
      </div>
    );
  }

  // ===== RESULT SCREEN =====
  if (screen === "result") {
    const stars = finalScore >= 120 ? 3 : finalScore >= 70 ? 2 : finalScore >= 30 ? 1 : 0;
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "linear-gradient(180deg, #1a1a3e 0%, #2a2a5e 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Nunito', 'Comic Sans MS', sans-serif", color: "#fff",
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>
          {"⭐".repeat(stars)}{"☆".repeat(3 - stars)}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>
          游戏结束！
        </div>
        <div style={{
          background: "rgba(255,255,255,0.1)", borderRadius: 12,
          padding: "20px 36px", textAlign: "center", marginBottom: 24,
        }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#f8d830" }}>
            {finalScore}
          </div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>总得分</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>
            共 {totalQ} 题 | 最高连击 {combo}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={startGame}
            style={{
              padding: "12px 32px", fontSize: 16, fontWeight: 800,
              background: "#e44040", color: "#fff", border: "none",
              borderRadius: 8, cursor: "pointer",
            }}
          >
            🔄 再来一次
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: "12px 32px", fontSize: 16, fontWeight: 800,
                background: "rgba(255,255,255,0.2)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8,
                cursor: "pointer",
              }}
            >
              ← 返回
            </button>
          )}
        </div>
      </div>
    );
  }

  // ===== PLAYING SCREEN =====
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <canvas
        ref={canvasRef}
        width={GAME_W}
        height={GAME_H}
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
          imageRendering: "pixelated",
          touchAction: "none",
        }}
      />
    </div>
  );
}
