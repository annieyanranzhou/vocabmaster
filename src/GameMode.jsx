import { useState, useEffect, useCallback, useRef } from "react";
import { addPetFood } from "./PetSystem.jsx";

/* ══════════════════════════════════════════════
   GAMEMODE.JSX — 闯关模式
   独立组件，挂载在 VocabMaster 的 tab="game" 下
   共享同一个 Supabase client（从父组件传入）
   数据来源：/data/game_questions.json
   ══════════════════════════════════════════════ */

// ── 颜色主题（和主应用保持一致） ──
const C = {
  bg: "#F7F9FF",
  nav: "#1A1A2E",
  card: "#FFFFFF",
  text: "#1A1A2E",
  sub: "#5A7A9A",
  blue: "#4DB6FF",
  purple: "#9B6FFF",
  green: "#4CAF7D",
  amber: "#F8C740",
  coral: "#FF8C5A",
  red: "#FF5A5A",
  gold: "#FFD700",
};

// ── 区域配置 ──
const ZONES = {
  zone_inner:   { name: "内心世界", nameEn: "Inner World",     emoji: "💫", color: "#9B6FFF", light: "#F3F0FF" },
  zone_society: { name: "人与社会", nameEn: "People & Society",emoji: "🌍", color: "#4DB6FF", light: "#EBF7FF" },
  zone_learning:{ name: "学习成长", nameEn: "Learning & Growth",emoji: "📚", color: "#F8C740", light: "#FFFAEB" },
  zone_nature:  { name: "自然环境", nameEn: "Nature & Earth",  emoji: "🌿", color: "#4CAF7D", light: "#EDFAF3" },
  zone_tech:    { name: "科技未来", nameEn: "Tech & Future",   emoji: "🚀", color: "#FF8C5A", light: "#FFF4EF" },
};

// ── 连击反馈词 ──
const COMBO_WORDS = [
  { min: 1,  max: 2,  word: "Good!",        color: "#4CAF7D", size: 22 },
  { min: 2,  max: 3,  word: "Nice!",        color: "#4CAF7D", size: 22 },
  { min: 3,  max: 4,  word: "Great!",       color: "#4DB6FF", size: 26 },
  { min: 4,  max: 5,  word: "Excellent!",   color: "#9B6FFF", size: 28 },
  { min: 5,  max: 8,  word: "Amazing!",     color: "#F8C740", size: 30 },
  { min: 8,  max: 12, word: "Incredible!",  color: "#FF8C5A", size: 32 },
  { min: 12, max: 999,word: "Unbelievable!",color: "#FF5A5A", size: 34 },
];

function getComboWord(streak) {
  return COMBO_WORDS.find(c => streak >= c.min && streak < c.max) || COMBO_WORDS[0];
}

// ── 播放音效 ──
function playAudio(filename) {
  try {
    const audio = new Audio(`/audio/${filename}.mp3`);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch {}
}

// ── 洗牌 ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Unsplash 图片缓存 ──
const UNSPLASH_KEY = "XSwLRejfuccusuV02R234-Hp-Z4K_xYT5iH02n47KVc";
const _imgCache = {};
async function fetchWordImage(word) {
  if (_imgCache[word]) return _imgCache[word];
  try {
    const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_KEY}`);
    const d = await r.json();
    const url = d?.results?.[0]?.urls?.small || null;
    _imgCache[word] = url;
    return url;
  } catch { return null; }
}

// ══════════════════════════════════════════════
// 主组件
// ══════════════════════════════════════════════
export default function GameMode({ supabase, authUser, onClose, onProgress }) {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("map");        // map | zone | level | play | result | popup
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);     // {correct, word}[]
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(null);       // {word, color, size, key}
  const [stars, setStars] = useState({});         // {level_id: 1|2|3}
  const [popup, setPopup] = useState(null);       // {type, title, sub, emoji}
  const [firstClears, setFirstClears] = useState(new Set());
  const [levelStreak, setLevelStreak] = useState(0); // consecutive level wins
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentImage, setCurrentImage] = useState(null); // 当前题目图片URL
  const comboTimer = useRef(null);

  // ── 加载题目数据 ──
  useEffect(() => {
    fetch("/data/game_questions.json")
      .then(r => r.json())
      .then(data => {
        setGameData(data);
        setLoading(false);
      })
      .catch(() => {
        // 加载失败时用空数据，不崩溃
        setGameData({ zones: {}, words: [] });
        setLoading(false);
      });

    // 从 localStorage 加载本地进度
    try {
      const saved = localStorage.getItem("vm_game_stars");
      if (saved) setStars(JSON.parse(saved));
      const savedClears = localStorage.getItem("vm_first_clears");
      if (savedClears) setFirstClears(new Set(JSON.parse(savedClears)));
    } catch {}
  }, []);

  // ── 保存进度到 localStorage ──
  const saveProgress = useCallback((newStars, newClears) => {
    try {
      localStorage.setItem("vm_game_stars", JSON.stringify(newStars));
      localStorage.setItem("vm_first_clears", JSON.stringify([...newClears]));
    } catch {}
  }, []);

  // ── 连击显示 ──
  const showCombo = useCallback((newStreak) => {
    if (comboTimer.current) clearTimeout(comboTimer.current);
    const c = getComboWord(newStreak);
    setCombo({ ...c, key: Date.now() });
    comboTimer.current = setTimeout(() => setCombo(null), 1200);
    // 播放对应音效
    const audioMap = {
      "Good!": "good", "Nice!": "nice", "Great!": "great",
      "Awesome!": "awesome", "Well done!": "well_done",
      "Excellent!": "excellent", "Amazing!": "amazing",
      "Incredible!": "incredible", "Unbelievable!": "unbelievable",
      "On fire!": "on_fire",
    };
    const file = audioMap[c.word];
    if (file) playAudio(file);
  }, []);

  // ── 生成关卡题目 ──
  const buildLevelQuestions = useCallback((level, allWords) => {
    const wordMap = {};
    allWords.forEach(w => { wordMap[w.word] = w; });

    const qs = [];
    level.words.forEach(wName => {
      const w = wordMap[wName];
      if (!w) return;

      // 随机选题型（优先有数据的）
      const types = ["match", "collocation", "fill_blank", "synonym", "image_pick"];
      const available = types.filter(t => {
        if (t === "match") return true;
        if (t === "image_pick") return w.pos === "n" && !["abstract","emotion","psychology","academic","time","competition"].some(tag => w.tags?.includes(tag));
        if (t === "collocation") return w.collocation?.correct?.length > 0;
        if (t === "fill_blank") return w.fill_blank?.sentence;
        if (t === "synonym") return w.synonym_match?.synonyms?.length > 0;
        return false;
      });

      const type = available[Math.floor(Math.random() * available.length)];

      if (type === "match") {
        // 配对题：选正确中文释义
        const distractors = shuffle(allWords.filter(x => x.word !== wName))
          .slice(0, 3)
          .map(x => x.cn);
        const opts = shuffle([w.cn, ...distractors]);
        qs.push({ type: "match", word: w.word, ph: w.ph, en: w.en, cn: w.cn, options: opts, answer: w.cn });

      } else if (type === "collocation") {
        // 搭配题：找出正确搭配
        const correct = w.collocation.correct[0];
        const distractors = w.collocation.distractors?.length > 0
          ? w.collocation.distractors
          : shuffle(allWords.filter(x => x.word !== wName && x.collocation?.correct?.length))
              .slice(0, 2).map(x => x.collocation.correct[0]);
        const opts = shuffle([correct, ...distractors.slice(0, 3)]);
        qs.push({ type: "collocation", word: w.word, cn: w.cn, options: opts, answer: correct,
                  hint: `核心词：${w.word}`, example: w.collocation.example_sent });

      } else if (type === "fill_blank") {
        // 填空题
        const fb = w.fill_blank;
        const opts = fb.options?.length >= 4
          ? fb.options
          : shuffle([w.word, ...shuffle(allWords.filter(x=>x.word!==wName)).slice(0,3).map(x=>x.word)]);
        qs.push({ type: "fill_blank", word: w.word, cn: w.cn,
                  sentence: fb.sentence, sentence_cn: fb.sentence_cn,
                  options: shuffle(opts.slice(0,4)), answer: w.word });

      } else if (type === "synonym") {
        // 同义词题
        const syn = w.synonym_match.synonyms[0];
        const distractors = shuffle(allWords.filter(x => x.word !== wName && x.synonym_match?.synonyms?.length))
          .slice(0, 3).map(x => x.synonym_match.synonyms[0]);
        const opts = shuffle([syn, ...distractors.slice(0,3)]);
        qs.push({ type: "synonym", word: w.word, cn: w.cn, options: opts, answer: syn,
                  prompt: `"${w.word}" 的近义词是？` });

      } else if (type === "image_pick") {
        // 看图选词题：显示图片，选出对应单词
        const distractors = shuffle(allWords.filter(x => x.word !== wName))
          .slice(0, 3).map(x => x.word);
        const opts = shuffle([w.word, ...distractors]);
        qs.push({ type: "image_pick", word: w.word, cn: w.cn, en: w.en,
                  options: opts, answer: w.word });
      }
    });

    return shuffle(qs);
  }, []);

  // ── 切题时加载图片 ──
  useEffect(() => {
    if (view !== "play" || !questions[qIdx]) return;
    const q = questions[qIdx];
    if (q.type === "image_pick") {
      setCurrentImage(null);
      fetchWordImage(q.word).then(url => setCurrentImage(url));
    }
  }, [qIdx, view, questions]);

  // ── 开始关卡 ──
  const startLevel = useCallback((zone, level) => {
    if (!gameData) return;
    const qs = buildLevelQuestions(level, gameData.words);
    setSelectedZone(zone);
    setSelectedLevel(level);
    setQuestions(qs);
    setQIdx(0);
    setAnswers([]);
    setStreak(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setView("play");
  }, [gameData, buildLevelQuestions]);

  // ── 回答问题 ──
  const handleAnswer = useCallback((option) => {
    if (showFeedback) return;
    const q = questions[qIdx];
    const correct = option === q.answer;
    setSelectedAnswer(option);
    setShowFeedback(true);

    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (correct) showCombo(newStreak);

    // 今日答题计数
    try {
      const _k = "vm_daily_answered_" + new Date().toDateString();
      localStorage.setItem(_k, parseInt(localStorage.getItem(_k)||"0") + 1);
    } catch(e){}

    setTimeout(() => {
      const newAnswers = [...answers, { correct, word: q.word, chosen: option, answer: q.answer }];
      setAnswers(newAnswers);
      setSelectedAnswer(null);
      setShowFeedback(false);

      if (qIdx + 1 >= questions.length) {
        // 关卡结束
        finishLevel(newAnswers);
      } else {
        setQIdx(qIdx + 1);
      }
    }, 900);
  }, [showFeedback, questions, qIdx, streak, answers, showCombo]);

  // ── 完成关卡 ──
  const finishLevel = useCallback((finalAnswers) => {
    const total = finalAnswers.length;
    const correct = finalAnswers.filter(a => a.correct).length;
    const rate = correct / total;

    // 三星评分
    let starCount = 1;
    if (rate >= 0.8) starCount = 2;
    if (rate === 1) starCount = 3;

    const levelId = selectedLevel.level_id;
    const isFirstClear = !firstClears.has(levelId);
    const prevStars = stars[levelId] || 0;
    const newStarCount = Math.max(prevStars, starCount);

    const newStars = { ...stars, [levelId]: newStarCount };
    const newClears = new Set([...firstClears, levelId]);
    setStars(newStars);
    setFirstClears(newClears);
    saveProgress(newStars, newClears);

    const newLevelStreak = rate >= 0.6 ? levelStreak + 1 : 0;
    setLevelStreak(newLevelStreak);

    // 决定弹窗类型
    let popupData = null;
    if (isFirstClear) {
      popupData = { type: "first_clear", title: "首闯成功！", sub: "First Clear · 你和这一关的第一次相遇", emoji: "🌟", stars: starCount };
    } else if (starCount === 3) {
      popupData = { type: "perfect", title: "完美通关！", sub: "Perfect · 满分无误，无懈可击", emoji: "🏆", stars: 3 };
    } else if (rate < 0.4 && !isFirstClear) {
      popupData = { type: "finally", title: "你真的做到了！", sub: "Finally · 坚持就是胜利", emoji: "🐣", stars: starCount };
    } else if (newLevelStreak >= 3) {
      popupData = { type: "streak", title: `${newLevelStreak}连胜！`, sub: "Streak · 势不可挡，继续！", emoji: "⚡", stars: starCount };
    }

    setView("result");
    addPetFood(2);
    // Notify parent to update total/best progress
    if (onProgress) onProgress({ answered: total, correct });
    if (popupData) {
      setTimeout(() => setPopup(popupData), 400);
    }
  }, [selectedLevel, firstClears, stars, levelStreak, saveProgress, onProgress]);

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════

  if (loading) {
    return (
      <div style={{ position:"fixed",top:0,left:0,right:0,bottom:64,zIndex:99,display:"flex",alignItems:"center",justifyContent:"center",background:C.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12, animation: "spin 1s linear infinite" }}>🌟</div>
          <div style={{ color: C.sub, fontSize: 14 }}>加载词宇宙...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── 地图页 ──
  if (view === "map") {
    const zones = gameData?.zones || {};
    const zoneKeys = Object.keys(zones);

    return (
      <div style={{ position:"fixed",top:0,left:0,right:0,bottom:64,zIndex:99,background:C.bg,overflowY:"auto",fontFamily:"system-ui,sans-serif" }}>
        <style>{`
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        `}</style>

        {/* 顶部 */}
        <div style={{ background: C.nav, padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>←</button>
          <div>
            <div style={{ color: C.blue, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", fontWeight: 800 }}>词语闯关</div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>选择区域</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ color: C.gold, fontSize: 20, fontWeight: 900 }}>⭐ {Object.values(stars).reduce((a,b)=>a+b,0)}</div>
            <div style={{ color: C.sub, fontSize: 11 }}>总星星</div>
          </div>
        </div>

        {/* 区域卡片 */}
        <div style={{ padding: "20px 16px 20px" }}>
          {zoneKeys.map((zk, i) => {
            const z = zones[zk];
            const cfg = ZONES[zk] || { name: z.name, emoji: "📖", color: C.blue, light: "#EBF7FF" };
            const totalLevels = z.total_levels || 0;
            const clearedLevels = z.levels?.filter(lv => stars[lv.level_id] > 0).length || 0;
            const totalStars = z.levels?.reduce((sum, lv) => sum + (stars[lv.level_id] || 0), 0) || 0;
            const maxStars = totalLevels * 3;
            const progress = totalLevels > 0 ? clearedLevels / totalLevels : 0;

            return (
              <div key={zk}
                onClick={() => { setSelectedZone({ key: zk, ...z }); setView("zone"); }}
                style={{
                  background: cfg.light,
                  border: `2px solid ${cfg.color}22`,
                  borderRadius: 20,
                  padding: "18px 20px",
                  marginBottom: 14,
                  cursor: "pointer",
                  animation: `slideUp ${0.3 + i * 0.1}s ease`,
                  transition: "transform 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ fontSize: 44, animation: "float 3s ease-in-out infinite", flexShrink: 0 }}>{cfg.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 17, color: C.text }}>{cfg.name}</div>
                  <div style={{ fontSize: 12, color: C.sub, marginBottom: 8 }}>{z.total_words}个词 · {totalLevels}关</div>
                  {/* 进度条 */}
                  <div style={{ background: "#0001", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${progress * 100}%`, background: cfg.color, height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>{clearedLevels}/{totalLevels} 关 · ⭐{totalStars}/{maxStars}</div>
                </div>
                <div style={{ fontSize: 20, color: cfg.color }}>›</div>
              </div>
            );
          })}

          {zoneKeys.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: C.sub }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div>题目数据加载中...</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>请确认 public/data/game_questions.json 已放置</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 区域关卡列表 ──
  if (view === "zone" && selectedZone) {
    const cfg = ZONES[selectedZone.key] || { name: selectedZone.name, emoji: "📖", color: C.blue, light: "#EBF7FF" };
    const levels = selectedZone.levels || [];

    return (
      <div style={{ position:"fixed",top:0,left:0,right:0,bottom:64,zIndex:99,background:C.bg,overflowY:"auto" }}>
        <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>

        {/* 顶部 */}
        <div style={{ background: cfg.color, padding: "20px 20px 24px" }}>
          <button onClick={() => setView("map")} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", marginBottom: 8 }}>← 返回地图</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 48, animation: "float 3s ease-in-out infinite" }}>{cfg.emoji}</span>
            <div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>区域</div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 900 }}>{cfg.name}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{selectedZone.total_words}个词 · {levels.length}关</div>
            </div>
          </div>
        </div>

        {/* 关卡列表 */}
        <div style={{ padding: "16px 16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {levels.map((lv, i) => {
            const s = stars[lv.level_id] || 0;
            const cleared = s > 0;
            const isBoss = lv.boss;
            const isLocked = i > 0 && !stars[levels[i-1]?.level_id];

            return (
              <div key={lv.level_id}
                onClick={() => !isLocked && startLevel({ key: selectedZone.key, ...selectedZone }, lv)}
                style={{
                  background: isLocked ? "#f0f0f0" : cleared ? cfg.light : "#fff",
                  border: `2px solid ${isLocked ? "#ddd" : cleared ? cfg.color : "#e0e0e0"}`,
                  borderRadius: 16,
                  padding: "14px 10px",
                  textAlign: "center",
                  cursor: isLocked ? "default" : "pointer",
                  opacity: isLocked ? 0.5 : 1,
                  transition: "transform 0.15s",
                  position: "relative",
                }}
              >
                {isBoss && <div style={{ position: "absolute", top: -6, right: -6, background: "#FF5A5A", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 8 }}>BOSS</div>}
                <div style={{ fontSize: 24, marginBottom: 4 }}>{isLocked ? "🔒" : isBoss ? "🔥" : cleared ? cfg.emoji : "⭕"}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: isLocked ? "#aaa" : C.text }}>第{lv.level_num}关</div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{lv.words.length}词</div>
                {/* 星星 */}
                <div style={{ marginTop: 6, display: "flex", justifyContent: "center", gap: 2 }}>
                  {[1,2,3].map(n => (
                    <span key={n} style={{ fontSize: 12, color: n <= s ? C.gold : "#ddd" }}>★</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 游戏页 ──
  if (view === "play" && questions.length > 0) {
    const q = questions[qIdx];
    const cfg = selectedZone ? (ZONES[selectedZone.key] || { color: C.blue }) : { color: C.blue };
    const progress = (qIdx + 1) / questions.length;

    return (
      <div style={{ position:"fixed",top:0,left:0,right:0,bottom:64,zIndex:99,background:C.bg,overflowY:"auto",fontFamily:"system-ui,sans-serif",userSelect:"none" }}>
        <style>{`
          @keyframes comboIn { from{opacity:0;transform:translateY(-20px) scale(0.8)} to{opacity:1;transform:translateY(0) scale(1)} }
          @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
          @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

        {/* 顶部栏 */}
        <div style={{ background: cfg.color, padding: "16px 20px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <button onClick={() => setView("zone")} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, padding: "6px 12px", borderRadius: 20, cursor: "pointer" }}>✕ 退出</button>
            <div style={{ flex: 1, textAlign: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              {qIdx + 1} / {questions.length}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {streak > 0 && <div style={{ background: "rgba(255,255,255,0.25)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>🔥×{streak}</div>}
            </div>
          </div>
          {/* 进度条 */}
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 4, height: 6 }}>
            <div style={{ width: `${progress * 100}%`, background: "#fff", height: "100%", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>

        {/* 连击弹出 */}
        {combo && (
          <div style={{ position: "fixed", top: "18%", left: 0, right: 0, textAlign: "center", zIndex: 200, pointerEvents: "none" }}>
            <div key={combo.key} style={{ display: "inline-block", fontSize: combo.size, fontWeight: 900, color: combo.color, animation: "comboIn 0.3s ease", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              {combo.word}
            </div>
          </div>
        )}

        {/* 题目区 */}
        <div style={{ padding: "24px 20px 20px", maxWidth: 460, margin: "0 auto" }}>

          {/* 题型标签 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
            <div style={{ background: cfg.color + "22", color: cfg.color, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 10, letterSpacing: 1, textTransform: "uppercase" }}>
              {q.type === "match" ? "词义配对" : q.type === "collocation" ? "词组搭配" : q.type === "fill_blank" ? "例句填空" : q.type === "image_pick" ? "看图选词" : "同义词"}
            </div>
          </div>

          {/* 题目内容 */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", marginBottom: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", minHeight: 120 }}>
            {q.type === "match" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.text, marginBottom: 6 }}>{q.word}</div>
                {q.ph && <div style={{ fontSize: 14, color: C.sub, marginBottom: 8 }}>{q.ph}</div>}
                <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{q.en}</div>
                <div style={{ marginTop: 16, fontSize: 14, color: C.blue, fontWeight: 700 }}>这个词的中文意思是？</div>
              </div>
            )}
            {q.type === "collocation" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, color: C.sub, marginBottom: 8 }}>选出正确搭配</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: C.text, marginBottom: 6 }}>{q.word}</div>
                <div style={{ fontSize: 13, color: C.sub }}>（{q.cn}）</div>
              </div>
            )}
            {q.type === "fill_blank" && (
              <div>
                <div style={{ fontSize: 13, color: C.sub, marginBottom: 10 }}>选择最合适的词填入空白处</div>
                <div style={{ fontSize: 16, lineHeight: 1.8, color: C.text, fontWeight: 500 }}>
                  {q.sentence.split("___").map((part, i) => (
                    <span key={i}>{part}{i === 0 && <span style={{ background: C.blue + "22", color: C.blue, fontWeight: 900, padding: "2px 12px", borderRadius: 8, border: `1px dashed ${C.blue}` }}>___</span>}</span>
                  ))}
                </div>
                {q.sentence_cn && <div style={{ fontSize: 12, color: C.sub, marginTop: 10, fontStyle: "italic" }}>{q.sentence_cn}</div>}
              </div>
            )}
            {q.type === "synonym" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, color: C.sub, marginBottom: 8 }}>找出近义词</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: C.text, marginBottom: 6 }}>{q.word}</div>
                <div style={{ fontSize: 13, color: C.sub }}>（{q.cn}）</div>
                <div style={{ marginTop: 12, fontSize: 14, color: C.purple, fontWeight: 700 }}>它的近义词是？</div>
              </div>
            )}
            {q.type === "image_pick" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: C.sub, marginBottom: 10 }}>这张图对应哪个单词？</div>
                {currentImage ? (
                  <img src={currentImage} alt="guess the word"
                    style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 14, marginBottom: 8 }} />
                ) : (
                  <div style={{ height: 140, background: "#f0f4ff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>🔄</div>
                  </div>
                )}
                <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>📷 Unsplash</div>
              </div>
            )}
          </div>

          {/* 选项 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {q.options?.map((opt, i) => {
              const isCorrect = opt === q.answer;
              const isSelected = opt === selectedAnswer;
              let bg = "#fff", border = "#e0e8f0", textColor = C.text;

              if (showFeedback) {
                if (isCorrect) { bg = "#EDFAF3"; border = C.green; textColor = C.green; }
                else if (isSelected && !isCorrect) { bg = "#FFF0F0"; border = C.red; textColor = C.red; }
              }

              return (
                <button key={i} onClick={() => handleAnswer(opt)}
                  style={{
                    background: bg, border: `2px solid ${border}`, borderRadius: 14,
                    padding: "14px 12px", fontSize: 14, fontWeight: 700, color: textColor,
                    cursor: showFeedback ? "default" : "pointer",
                    transition: "all 0.15s",
                    animation: showFeedback && isSelected && !isCorrect ? "shake 0.3s ease" : "none",
                    minHeight: 52,
                  }}
                >
                  {showFeedback && isCorrect && "✓ "}{showFeedback && isSelected && !isCorrect && "✗ "}{opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── 结果页 ──
  if (view === "result") {
    const total = answers.length;
    const correct = answers.filter(a => a.correct).length;
    const rate = total > 0 ? correct / total : 0;
    const starCount = stars[selectedLevel?.level_id] || 0;
    const cfg = selectedZone ? (ZONES[selectedZone.key] || { color: C.blue, emoji: "📖" }) : { color: C.blue, emoji: "📖" };

    return (
      <div style={{ position:"fixed",top:0,left:0,right:0,bottom:64,zIndex:99,background:C.bg,overflowY:"auto",fontFamily:"system-ui,sans-serif" }}>
        <style>{`
          @keyframes starPop { 0%{transform:scale(0) rotate(-180deg)} 60%{transform:scale(1.3) rotate(10deg)} 100%{transform:scale(1) rotate(0)} }
          @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
          @keyframes confetti { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(60vh) rotate(720deg);opacity:0} }
        `}</style>

        {/* 成就弹窗 */}
        {popup && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setPopup(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: "#fff", borderRadius: 28, padding: "40px 32px", textAlign: "center",
              maxWidth: 320, width: "90%", animation: "slideUp 0.4s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
            }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>{popup.emoji}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 8 }}>{popup.title}</div>
              <div style={{ fontSize: 13, color: C.sub, marginBottom: 20, lineHeight: 1.5 }}>{popup.sub}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
                {[1,2,3].map(n => (
                  <span key={n} style={{ fontSize: 32, animation: n <= popup.stars ? `starPop 0.5s ${n*0.15}s ease both` : "none", display: "inline-block", color: n <= popup.stars ? C.gold : "#ddd" }}>★</span>
                ))}
              </div>
              <button onClick={() => setPopup(null)} style={{ background: cfg.color, color: "#fff", border: "none", borderRadius: 16, padding: "14px 32px", fontSize: 16, fontWeight: 900, cursor: "pointer", width: "100%" }}>
                继续 →
              </button>
            </div>
          </div>
        )}

        {/* 内容 */}
        <div style={{ padding: "40px 20px", maxWidth: 460, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32, animation: "slideUp 0.5s ease" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              {rate === 1 ? "🏆" : rate >= 0.8 ? "🌟" : rate >= 0.6 ? "😊" : "💪"}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 4 }}>
              {rate === 1 ? "完美通关！" : rate >= 0.8 ? "太棒了！" : rate >= 0.6 ? "通关成功！" : "继续加油！"}
            </div>

            {/* 星星 */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
              {[1,2,3].map(n => (
                <span key={n} style={{
                  fontSize: 40,
                  color: n <= starCount ? C.gold : "#ddd",
                  animation: n <= starCount ? `starPop 0.5s ${n * 0.2}s ease both` : "none",
                  display: "inline-block",
                }}>★</span>
              ))}
            </div>
          </div>

          {/* 得分卡 */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: cfg.color }}>{correct}/{total}</div>
                <div style={{ fontSize: 12, color: C.sub }}>答对题目</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: cfg.color }}>{Math.round(rate * 100)}%</div>
                <div style={{ fontSize: 12, color: C.sub }}>正确率</div>
              </div>
            </div>
          </div>

          {/* 答题回顾 */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, marginBottom: 12 }}>答题详情</div>
            {answers.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < answers.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                <span style={{ fontSize: 16 }}>{a.correct ? "✅" : "❌"}</span>
                <span style={{ fontWeight: 700, color: C.text, flex: 1 }}>{a.word}</span>
                {!a.correct && <span style={{ fontSize: 12, color: C.sub }}>→ {a.answer}</span>}
              </div>
            ))}
          </div>

          {/* 按钮 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button onClick={() => startLevel(selectedZone, selectedLevel)}
              style={{ background: "#f0f4ff", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: cfg.color, cursor: "pointer" }}>
              🔄 再来一次
            </button>
            <button onClick={() => setView("zone")}
              style={{ background: cfg.color, border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 800, color: "#fff", cursor: "pointer" }}>
              下一关 →
            </button>
          </div>

          <button onClick={() => setView("map")}
            style={{ width: "100%", background: "none", border: "none", color: C.sub, fontSize: 14, padding: "16px", cursor: "pointer", marginTop: 4 }}>
            返回地图
          </button>
        </div>
      </div>
    );
  }

  // 兜底
  return null;
}
