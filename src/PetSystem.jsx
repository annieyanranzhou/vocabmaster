import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   PetSystem.jsx — VocabMaster 宠物系统
   
   接入方式：
   1. import PetSystem, { addPetFood } from "./PetSystem";
   2. 在今日页加 <PetSystem />
   3. 专项练习完成时调用 addPetFood(3)
   4. 闯关通关时调用 addPetFood(2)
   5. 每日登录时调用 addPetFood(1)
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "vm_pet_v2";
const STORAGE_KEY_V1 = "vm_pet_v1"; // for migration

// ── 全局食物添加接口（供外部调用）──
export function addPetFood(n = 1) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const state = raw ? JSON.parse(raw) : null;
    if (!state) return;
    const newFood = Math.min((state.food || 0) + n, 99);
    const updated = { ...state, food: newFood };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("pet-food-added", { detail: { food: newFood } }));
  } catch {}
}

// ── 颜色主题（浅色）──
const C = {
  bg:    "#f4f6ff",
  nav:   "#ffffff",
  card:  "#ffffff",
  border:"#e0e6ff",
  text:  "#1a1a2e",
  sub:   "#7a8ab0",
  cyan:  "#4DB6FF",
  gold:  "#f0b400",
  dim:   "#c5cce8",
};

// ══════════════════════════════════════════════
// 像素宠物 SVG 定义（4只 × 5等级）
// ══════════════════════════════════════════════
function PetPixel({ type, level, mood, size = 80 }) {
  const scale = size / 24;
  const anim = mood === "happy" ? "hop" : mood === "sad" ? "droop" : "idle";

  const pets = {
    fox: {
      1: <FoxLv1 />,
      2: <FoxLv2 />,
      3: <FoxLv3 />,
      4: <FoxLv4 />,
      5: <FoxLv5 />,
    },
    cat: {
      1: <CatLv1 />,
      2: <CatLv2 />,
      3: <CatLv3 />,
      4: <CatLv4 />,
      5: <CatLv5 />,
    },
    penguin: {
      1: <PenguinLv1 />,
      2: <PenguinLv2 />,
      3: <PenguinLv3 />,
      4: <PenguinLv4 />,
      5: <PenguinLv5 />,
    },
    dragon: {
      1: <DragonLv1 />,
      2: <DragonLv2 />,
      3: <DragonLv3 />,
      4: <DragonLv4 />,
      5: <DragonLv5 />,
    },
    shiba: {
      1: <ShibaLv1 />,
      2: <ShibaLv2 />,
      3: <ShibaLv3 />,
      4: <ShibaLv4 />,
      5: <ShibaLv5 />,
    },
    bunny: {
      1: <BunnyLv1 />,
      2: <BunnyLv2 />,
      3: <BunnyLv3 />,
      4: <BunnyLv4 />,
      5: <BunnyLv5 />,
    },
  };

  const animStyle = {
    hop:   "petHop 0.9s ease-in-out infinite",
    idle:  "petIdle 2s ease-in-out infinite",
    droop: "petDroop 3s ease-in-out infinite",
  }[anim];

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      style={{ imageRendering: "pixelated", display: "block", animation: animStyle }}
    >
      {pets[type]?.[level] || pets.fox[1]}
    </svg>
  );
}

// ── FOX ──
function FoxLv1() { return (<>
  <rect x="6" y="2" width="2" height="3" fill="#e55"/><rect x="16" y="2" width="2" height="3" fill="#e55"/>
  <rect x="6" y="2" width="1" height="2" fill="#faa"/><rect x="17" y="2" width="1" height="2" fill="#faa"/>
  <rect x="5" y="4" width="14" height="9" fill="#e55"/><rect x="4" y="5" width="16" height="7" fill="#e55"/>
  <rect x="7" y="7" width="10" height="6" fill="#fdd"/>
  <rect x="7" y="5" width="3" height="3" fill="#111"/><rect x="14" y="5" width="3" height="3" fill="#111"/>
  <rect x="7" y="5" width="1" height="1" fill="#fff"/><rect x="14" y="5" width="1" height="1" fill="#fff"/>
  <rect x="11" y="9" width="2" height="1" fill="#933"/>
  <rect x="5" y="13" width="14" height="8" fill="#e55"/><rect x="7" y="14" width="10" height="7" fill="#fcc"/>
  <rect x="2" y="14" width="4" height="5" fill="#e55"/><rect x="2" y="17" width="3" height="2" fill="#fff"/>
  <rect x="6" y="21" width="4" height="1" fill="#c33"/><rect x="14" y="21" width="4" height="1" fill="#c33"/>
</>); }

function FoxLv2() { return (<>
  <rect x="4" y="1" width="3" height="4" fill="#f64"/><rect x="17" y="1" width="3" height="4" fill="#f64"/>
  <rect x="5" y="2" width="2" height="3" fill="#fba"/><rect x="17" y="2" width="2" height="3" fill="#fba"/>
  <rect x="4" y="4" width="16" height="11" fill="#f64"/><rect x="3" y="5" width="18" height="9" fill="#f64"/>
  <rect x="7" y="8" width="10" height="7" fill="#fdd"/>
  <rect x="6" y="5" width="4" height="4" fill="#111"/><rect x="14" y="5" width="4" height="4" fill="#111"/>
  <rect x="6" y="5" width="2" height="2" fill="#fff"/><rect x="14" y="5" width="2" height="2" fill="#fff"/>
  <rect x="3" y="9" width="3" height="2" fill="#f99" opacity="0.7"/><rect x="18" y="9" width="3" height="2" fill="#f99" opacity="0.7"/>
  <rect x="11" y="11" width="2" height="1" fill="#a33"/>
  <rect x="9" y="12" width="2" height="1" fill="#a33"/><rect x="13" y="12" width="2" height="1" fill="#a33"/>
  <rect x="4" y="15" width="16" height="8" fill="#f64"/><rect x="7" y="16" width="10" height="7" fill="#fcc"/>
  <rect x="1" y="15" width="5" height="6" fill="#f64"/><rect x="1" y="19" width="4" height="2" fill="#fff"/>
  <rect x="5" y="23" width="5" height="1" fill="#c33"/><rect x="14" y="23" width="5" height="1" fill="#c33"/>
</>); }

function FoxLv3() { return (<>
  <rect x="3" y="0" width="4" height="5" fill="#ff5500"/><rect x="17" y="0" width="4" height="5" fill="#ff5500"/>
  <rect x="4" y="1" width="2" height="4" fill="#ffaa77"/><rect x="18" y="1" width="2" height="4" fill="#ffaa77"/>
  <rect x="3" y="4" width="18" height="12" fill="#ff5500"/><rect x="2" y="5" width="20" height="10" fill="#ff5500"/>
  <rect x="6" y="8" width="12" height="8" fill="#ffe0d0"/>
  <rect x="5" y="5" width="5" height="5" fill="#111"/><rect x="14" y="5" width="5" height="5" fill="#111"/>
  <rect x="5" y="5" width="2" height="2" fill="#fff"/><rect x="14" y="5" width="2" height="2" fill="#fff"/>
  <rect x="8" y="8" width="1" height="1" fill="#fff" opacity="0.5"/><rect x="17" y="8" width="1" height="1" fill="#fff" opacity="0.5"/>
  <rect x="2" y="10" width="3" height="2" fill="#ff9988" opacity="0.7"/><rect x="19" y="10" width="3" height="2" fill="#ff9988" opacity="0.7"/>
  <rect x="11" y="13" width="2" height="1" fill="#aa2200"/>
  <rect x="8" y="14" width="3" height="1" fill="#aa2200"/><rect x="13" y="14" width="3" height="1" fill="#aa2200"/>
  <rect x="4" y="16" width="16" height="7" fill="#ff5500"/><rect x="6" y="17" width="12" height="6" fill="#ffccaa"/>
  <rect x="5" y="16" width="14" height="2" fill="#ffd700"/>
  <rect x="0" y="15" width="5" height="7" fill="#ff5500"/><rect x="0" y="20" width="4" height="2" fill="#fff"/>
  <rect x="5" y="23" width="6" height="1" fill="#cc3300"/><rect x="13" y="23" width="6" height="1" fill="#cc3300"/>
</>); }

function FoxLv4() { return (<>
  <rect x="3" y="0" width="4" height="5" fill="#ff3300"/><rect x="17" y="0" width="4" height="5" fill="#ff3300"/>
  <rect x="3" y="1" width="2" height="4" fill="#ff9966"/><rect x="19" y="1" width="2" height="4" fill="#ff9966"/>
  <rect x="9" y="0" width="6" height="2" fill="#ffd700"/>
  <rect x="2" y="4" width="20" height="13" fill="#ff3300"/><rect x="1" y="5" width="22" height="11" fill="#ff3300"/>
  <rect x="5" y="8" width="14" height="9" fill="#ffe8d0"/>
  <rect x="4" y="5" width="5" height="5" fill="#0a0005"/><rect x="15" y="5" width="5" height="5" fill="#0a0005"/>
  <rect x="4" y="5" width="2" height="2" fill="#fff"/><rect x="15" y="5" width="2" height="2" fill="#fff"/>
  <rect x="6" y="7" width="1" height="3" fill="#ff2200" opacity="0.4"/><rect x="17" y="7" width="1" height="3" fill="#ff2200" opacity="0.4"/>
  <rect x="1" y="10" width="3" height="3" fill="#ff8877" opacity="0.7"/><rect x="20" y="10" width="3" height="3" fill="#ff8877" opacity="0.7"/>
  <rect x="10" y="14" width="4" height="1" fill="#880000"/>
  <rect x="7" y="15" width="4" height="1" fill="#880000"/><rect x="13" y="15" width="4" height="1" fill="#880000"/>
  <rect x="3" y="17" width="18" height="6" fill="#ff3300"/><rect x="5" y="18" width="14" height="5" fill="#ffbb99"/>
  <rect x="4" y="17" width="16" height="2" fill="#ffd700"/>
  <rect x="11" y="17" width="2" height="2" fill="#ff4400"/>
  <rect x="0" y="16" width="5" height="7" fill="#ff3300"/><rect x="0" y="21" width="4" height="2" fill="#ffd700"/>
  <rect x="22" y="16" width="2" height="5" fill="#ff3300"/>
  <rect x="4" y="23" width="6" height="1" fill="#aa1100"/><rect x="14" y="23" width="6" height="1" fill="#aa1100"/>
  <rect x="0" y="2" width="2" height="2" fill="#ffd700" opacity="0.8"/>
  <rect x="22" y="2" width="2" height="2" fill="#ffd700" opacity="0.8"/>
</>); }

function FoxLv5() { return (<>
  <rect x="2" y="0" width="5" height="6" fill="#ff2200"/><rect x="17" y="0" width="5" height="6" fill="#ff2200"/>
  <rect x="3" y="1" width="3" height="5" fill="#ff8855"/><rect x="18" y="1" width="3" height="5" fill="#ff8855"/>
  <rect x="9" y="0" width="6" height="3" fill="#ffd700"/>
  <rect x="10" y="0" width="4" height="1" fill="#fff" opacity="0.5"/>
  <rect x="1" y="4" width="22" height="14" fill="#ff2200"/><rect x="0" y="5" width="24" height="12" fill="#ff2200"/>
  <rect x="4" y="8" width="16" height="10" fill="#ffddcc"/>
  <rect x="3" y="5" width="6" height="6" fill="#060003"/><rect x="15" y="5" width="6" height="6" fill="#060003"/>
  <rect x="3" y="5" width="3" height="3" fill="#fff"/><rect x="15" y="5" width="3" height="3" fill="#fff"/>
  <rect x="5" y="7" width="2" height="4" fill="#ff0000" opacity="0.35"/><rect x="17" y="7" width="2" height="4" fill="#ff0000" opacity="0.35"/>
  <rect x="9" y="8" width="1" height="2" fill="#fff" opacity="0.7"/><rect x="19" y="8" width="1" height="2" fill="#fff" opacity="0.7"/>
  <rect x="0" y="10" width="3" height="4" fill="#ff7766" opacity="0.7"/><rect x="21" y="10" width="3" height="4" fill="#ff7766" opacity="0.7"/>
  <rect x="3" y="16" width="18" height="7" fill="#ff2200"/><rect x="5" y="17" width="14" height="6" fill="#ffaa88"/>
  <rect x="3" y="16" width="18" height="2" fill="#ffd700"/>
  <rect x="10" y="16" width="4" height="2" fill="#ff3300"/>
  <rect x="0" y="15" width="5" height="9" fill="#ff2200"/>
  <rect x="0" y="22" width="5" height="2" fill="#ffd700"/>
  <rect x="21" y="15" width="3" height="7" fill="#ff2200"/>
  <rect x="21" y="22" width="3" height="2" fill="#ffd700"/>
  <rect x="3" y="23" width="7" height="1" fill="#880000"/><rect x="14" y="23" width="7" height="1" fill="#880000"/>
  <rect x="0" y="1" width="2" height="2" fill="#ffd700"/><rect x="22" y="1" width="2" height="2" fill="#ffd700"/>
  <rect x="0" y="18" width="2" height="2" fill="#ffd700" opacity="0.7"/><rect x="22" y="18" width="2" height="2" fill="#ffd700" opacity="0.7"/>
</>); }

// ── CAT ──
function CatLv1() { return (<>
  <rect x="6" y="2" width="2" height="3" fill="#aa77dd"/><rect x="16" y="2" width="2" height="3" fill="#aa77dd"/>
  <rect x="7" y="3" width="1" height="2" fill="#ffaacc"/><rect x="16" y="3" width="1" height="2" fill="#ffaacc"/>
  <rect x="5" y="4" width="14" height="9" fill="#cc99ee"/><rect x="4" y="5" width="16" height="7" fill="#cc99ee"/>
  <rect x="7" y="7" width="10" height="6" fill="#eeddff"/>
  <rect x="7" y="5" width="3" height="3" fill="#221133"/><rect x="14" y="5" width="3" height="3" fill="#221133"/>
  <rect x="7" y="5" width="1" height="1" fill="#fff"/><rect x="14" y="5" width="1" height="1" fill="#fff"/>
  <rect x="11" y="9" width="2" height="1" fill="#ff66aa"/>
  <rect x="5" y="13" width="14" height="8" fill="#cc99ee"/><rect x="7" y="14" width="10" height="7" fill="#eeddff"/>
  <rect x="18" y="12" width="4" height="5" fill="#cc99ee"/>
  <rect x="6" y="21" width="4" height="1" fill="#9966cc"/><rect x="14" y="21" width="4" height="1" fill="#9966cc"/>
</>); }

function CatLv2() { return (<>
  <rect x="4" y="1" width="3" height="5" fill="#9955cc"/><rect x="17" y="1" width="3" height="5" fill="#9955cc"/>
  <rect x="5" y="2" width="2" height="3" fill="#ffbbdd"/><rect x="17" y="2" width="2" height="3" fill="#ffbbdd"/>
  <rect x="4" y="4" width="16" height="11" fill="#bb88ee"/><rect x="3" y="5" width="18" height="9" fill="#bb88ee"/>
  <rect x="7" y="8" width="10" height="7" fill="#eeddff"/>
  <rect x="6" y="5" width="4" height="4" fill="#110022"/><rect x="14" y="5" width="4" height="4" fill="#110022"/>
  <rect x="6" y="5" width="2" height="2" fill="#fff"/><rect x="14" y="5" width="2" height="2" fill="#fff"/>
  <rect x="7" y="5" width="2" height="4" fill="#441188" opacity="0.5"/><rect x="15" y="5" width="2" height="4" fill="#441188" opacity="0.5"/>
  <rect x="3" y="9" width="3" height="2" fill="#ffaacc" opacity="0.8"/><rect x="18" y="9" width="3" height="2" fill="#ffaacc" opacity="0.8"/>
  <rect x="0" y="9" width="4" height="1" fill="#ddd" opacity="0.5"/><rect x="20" y="9" width="4" height="1" fill="#ddd" opacity="0.5"/>
  <rect x="0" y="11" width="4" height="1" fill="#ddd" opacity="0.5"/><rect x="20" y="11" width="4" height="1" fill="#ddd" opacity="0.5"/>
  <rect x="11" y="11" width="2" height="2" fill="#dd3377"/>
  <rect x="4" y="15" width="16" height="8" fill="#bb88ee"/><rect x="6" y="16" width="12" height="7" fill="#eeddff"/>
  <rect x="19" y="14" width="4" height="8" fill="#bb88ee"/>
  <rect x="5" y="23" width="5" height="1" fill="#9955cc"/><rect x="14" y="23" width="5" height="1" fill="#9955cc"/>
</>); }

function CatLv3() { return (<>
  <rect x="7" y="0" width="2" height="4" fill="#ffd700"/><rect x="11" y="0" width="2" height="5" fill="#ffd700"/><rect x="15" y="0" width="2" height="4" fill="#ffd700"/>
  <rect x="3" y="1" width="4" height="6" fill="#7722bb"/><rect x="17" y="1" width="4" height="6" fill="#7722bb"/>
  <rect x="4" y="2" width="2" height="4" fill="#ff99cc"/><rect x="18" y="2" width="2" height="4" fill="#ff99cc"/>
  <rect x="3" y="6" width="18" height="12" fill="#9944cc"/><rect x="2" y="7" width="20" height="10" fill="#9944cc"/>
  <rect x="6" y="9" width="12" height="9" fill="#ddbeff"/>
  <rect x="5" y="7" width="5" height="6" fill="#0a0018"/><rect x="14" y="7" width="5" height="6" fill="#0a0018"/>
  <rect x="5" y="7" width="3" height="3" fill="#fff"/><rect x="14" y="7" width="3" height="3" fill="#fff"/>
  <rect x="7" y="7" width="2" height="6" fill="#330055" opacity="0.5"/><rect x="16" y="7" width="2" height="6" fill="#330055" opacity="0.5"/>
  <rect x="8" y="9" width="1" height="1" fill="#bb66ff"/><rect x="17" y="9" width="1" height="1" fill="#bb66ff"/>
  <rect x="2" y="11" width="3" height="3" fill="#ff99cc" opacity="0.7"/><rect x="19" y="11" width="3" height="3" fill="#ff99cc" opacity="0.7"/>
  <rect x="0" y="11" width="5" height="1" fill="#cc88ff" opacity="0.6"/><rect x="0" y="13" width="5" height="1" fill="#cc88ff" opacity="0.6"/>
  <rect x="19" y="11" width="5" height="1" fill="#cc88ff" opacity="0.6"/><rect x="19" y="13" width="5" height="1" fill="#cc88ff" opacity="0.6"/>
  <rect x="11" y="15" width="2" height="2" fill="#cc2277"/>
  <rect x="8" y="17" width="8" height="1" fill="#cc2277"/>
  <rect x="4" y="18" width="16" height="5" fill="#9944cc"/><rect x="6" y="19" width="12" height="4" fill="#ddbeff"/>
  <rect x="5" y="18" width="14" height="2" fill="#ffd700"/>
  <rect x="20" y="16" width="4" height="7" fill="#9944cc"/><rect x="21" y="22" width="3" height="1" fill="#ffd700"/>
  <rect x="5" y="23" width="6" height="1" fill="#7722bb"/><rect x="13" y="23" width="6" height="1" fill="#7722bb"/>
</>); }

function CatLv4() { return (<>
  <rect x="6" y="0" width="3" height="4" fill="#ffd700"/><rect x="10" y="0" width="4" height="5" fill="#ffd700"/><rect x="15" y="0" width="3" height="4" fill="#ffd700"/>
  <rect x="2" y="1" width="5" height="7" fill="#5511aa"/><rect x="17" y="1" width="5" height="7" fill="#5511aa"/>
  <rect x="3" y="2" width="3" height="5" fill="#ff77bb"/><rect x="18" y="2" width="3" height="5" fill="#ff77bb"/>
  <rect x="2" y="6" width="20" height="14" fill="#7733bb"/><rect x="1" y="7" width="22" height="12" fill="#7733bb"/>
  <rect x="5" y="10" width="14" height="10" fill="#ccaaff"/>
  <rect x="4" y="7" width="6" height="7" fill="#080014"/><rect x="14" y="7" width="6" height="7" fill="#080014"/>
  <rect x="4" y="7" width="3" height="3" fill="#fff"/><rect x="14" y="7" width="3" height="3" fill="#fff"/>
  <rect x="6" y="8" width="2" height="6" fill="#220044" opacity="0.55"/><rect x="16" y="8" width="2" height="6" fill="#220044" opacity="0.55"/>
  <rect x="7" y="9" width="1" height="1" fill="#ff99ff"/><rect x="17" y="9" width="1" height="1" fill="#ff99ff"/>
  <rect x="1" y="12" width="3" height="3" fill="#ff88cc" opacity="0.75"/><rect x="20" y="12" width="3" height="3" fill="#ff88cc" opacity="0.75"/>
  <rect x="0" y="12" width="5" height="1" fill="#ddaaff" opacity="0.7"/><rect x="0" y="14" width="5" height="1" fill="#ddaaff" opacity="0.7"/>
  <rect x="19" y="12" width="5" height="1" fill="#ddaaff" opacity="0.7"/><rect x="19" y="14" width="5" height="1" fill="#ddaaff" opacity="0.7"/>
  <rect x="11" y="17" width="2" height="2" fill="#cc1166"/>
  <rect x="5" y="20" width="14" height="3" fill="#7733bb"/><rect x="6" y="21" width="12" height="2" fill="#ccaaff"/>
  <rect x="4" y="20" width="16" height="2" fill="#ffd700"/>
  <rect x="10" y="20" width="4" height="2" fill="#ff44aa"/>
  <rect x="21" y="18" width="3" height="5" fill="#7733bb"/>
  <rect x="5" y="23" width="6" height="1" fill="#5511aa"/><rect x="13" y="23" width="6" height="1" fill="#5511aa"/>
  <rect x="0" y="2" width="2" height="2" fill="#ffd700" opacity="0.9"/><rect x="22" y="2" width="2" height="2" fill="#ffd700" opacity="0.9"/>
  <rect x="22" y="20" width="2" height="2" fill="#ffd700" opacity="0.7"/>
</>); }

function CatLv5() { return (<>
  <rect x="5" y="0" width="4" height="5" fill="#ffd700"/><rect x="10" y="0" width="4" height="6" fill="#ffd700"/><rect x="15" y="0" width="4" height="5" fill="#ffd700"/>
  <rect x="6" y="1" width="2" height="3" fill="#fff" opacity="0.5"/><rect x="11" y="1" width="2" height="4" fill="#fff" opacity="0.5"/><rect x="16" y="1" width="2" height="3" fill="#fff" opacity="0.5"/>
  <rect x="1" y="1" width="5" height="8" fill="#440099"/><rect x="18" y="1" width="5" height="8" fill="#440099"/>
  <rect x="2" y="2" width="3" height="6" fill="#ff55aa"/><rect x="19" y="2" width="3" height="6" fill="#ff55aa"/>
  <rect x="1" y="7" width="22" height="15" fill="#6600cc"/><rect x="0" y="8" width="24" height="13" fill="#6600cc"/>
  <rect x="4" y="10" width="16" height="12" fill="#cc99ff"/>
  <rect x="3" y="8" width="7" height="8" fill="#040010"/><rect x="14" y="8" width="7" height="8" fill="#040010"/>
  <rect x="3" y="8" width="4" height="4" fill="#fff"/><rect x="14" y="8" width="4" height="4" fill="#fff"/>
  <rect x="5" y="9" width="3" height="7" fill="#1a0033" opacity="0.5"/><rect x="16" y="9" width="3" height="7" fill="#1a0033" opacity="0.5"/>
  <rect x="4" y="10" width="2" height="2" fill="#ee99ff"/><rect x="15" y="10" width="2" height="2" fill="#ee99ff"/>
  <rect x="0" y="13" width="4" height="4" fill="#ff77cc" opacity="0.75"/><rect x="20" y="13" width="4" height="4" fill="#ff77cc" opacity="0.75"/>
  <rect x="0" y="13" width="5" height="1" fill="#ffaaff" opacity="0.7"/><rect x="0" y="15" width="5" height="1" fill="#ffaaff" opacity="0.7"/>
  <rect x="19" y="13" width="5" height="1" fill="#ffaaff" opacity="0.7"/><rect x="19" y="15" width="5" height="1" fill="#ffaaff" opacity="0.7"/>
  <rect x="11" y="18" width="2" height="2" fill="#ff0066"/>
  <rect x="4" y="21" width="16" height="2" fill="#6600cc"/><rect x="5" y="22" width="14" height="1" fill="#cc99ff"/>
  <rect x="3" y="21" width="18" height="2" fill="#ffd700"/>
  <rect x="10" y="21" width="4" height="2" fill="#ff00aa"/>
  <rect x="20" y="19" width="4" height="4" fill="#6600cc"/><rect x="21" y="23" width="3" height="1" fill="#ffd700"/>
  <rect x="4" y="23" width="7" height="1" fill="#440099"/><rect x="13" y="23" width="7" height="1" fill="#440099"/>
  <rect x="0" y="2" width="2" height="2" fill="#ffd700"/><rect x="22" y="2" width="2" height="2" fill="#ffd700"/>
  <rect x="0" y="20" width="2" height="2" fill="#ffd700" opacity="0.8"/><rect x="22" y="20" width="2" height="2" fill="#ffd700" opacity="0.8"/>
  <rect x="22" y="10" width="2" height="2" fill="#ffd700" opacity="0.6"/>
</>); }

// ── PENGUIN ──
function PenguinLv1() { return (<>
  <rect x="6" y="3" width="12" height="8" fill="#1a2535"/><rect x="5" y="4" width="14" height="6" fill="#1a2535"/>
  <rect x="8" y="5" width="8" height="6" fill="#eef"/>
  <rect x="7" y="3" width="10" height="6" fill="#1a2535"/><rect x="6" y="4" width="12" height="4" fill="#1a2535"/>
  <rect x="8" y="5" width="8" height="4" fill="#eef"/>
  <rect x="8" y="5" width="3" height="2" fill="#0a1020"/><rect x="13" y="5" width="3" height="2" fill="#0a1020"/>
  <rect x="8" y="5" width="1" height="1" fill="#fff"/><rect x="13" y="5" width="1" height="1" fill="#fff"/>
  <rect x="11" y="7" width="2" height="2" fill="#fa0"/>
  <rect x="5" y="9" width="14" height="10" fill="#1a2535"/><rect x="4" y="10" width="16" height="8" fill="#1a2535"/>
  <rect x="8" y="10" width="8" height="8" fill="#eef"/>
  <rect x="6" y="19" width="5" height="3" fill="#fa0"/><rect x="13" y="19" width="5" height="3" fill="#fa0"/>
</>); }

function PenguinLv2() { return (<>
  <rect x="5" y="2" width="14" height="9" fill="#1a2535"/><rect x="4" y="3" width="16" height="7" fill="#1a2535"/>
  <rect x="7" y="4" width="10" height="7" fill="#ddeeff"/>
  <rect x="6" y="4" width="4" height="4" fill="#050d18"/><rect x="14" y="4" width="4" height="4" fill="#050d18"/>
  <rect x="6" y="4" width="2" height="2" fill="#fff"/><rect x="14" y="4" width="2" height="2" fill="#fff"/>
  <rect x="3" y="7" width="4" height="2" fill="#88ddff" opacity="0.7"/><rect x="17" y="7" width="4" height="2" fill="#88ddff" opacity="0.7"/>
  <rect x="10" y="8" width="4" height="2" fill="#ffaa00"/>
  <rect x="4" y="11" width="16" height="12" fill="#1a2535"/><rect x="3" y="12" width="18" height="10" fill="#1a2535"/>
  <rect x="7" y="12" width="10" height="10" fill="#ddeeff"/>
  <rect x="2" y="13" width="4" height="7" fill="#1a2535"/>
  <rect x="18" y="13" width="4" height="7" fill="#1a2535"/>
  <rect x="5" y="18" width="14" height="2" fill="#ee3333"/>
  <rect x="5" y="19" width="14" height="1" fill="#cc1111"/>
  <rect x="6" y="21" width="5" height="3" fill="#ffaa00"/><rect x="13" y="21" width="5" height="3" fill="#ffaa00"/>
</>); }

function PenguinLv3() { return (<>
  <rect x="8" y="0" width="2" height="4" fill="#aaeeff"/><rect x="11" y="0" width="2" height="5" fill="#aaeeff"/><rect x="14" y="0" width="2" height="4" fill="#aaeeff"/>
  <rect x="4" y="2" width="16" height="10" fill="#0f1c2e"/><rect x="3" y="3" width="18" height="8" fill="#0f1c2e"/>
  <rect x="7" y="4" width="10" height="8" fill="#ddeeff"/>
  <rect x="5" y="4" width="5" height="5" fill="#050d18"/><rect x="14" y="4" width="5" height="5" fill="#050d18"/>
  <rect x="5" y="4" width="3" height="3" fill="#fff"/><rect x="14" y="4" width="3" height="3" fill="#fff"/>
  <rect x="7" y="6" width="1" height="1" fill="#88eeff" opacity="0.8"/><rect x="16" y="6" width="1" height="1" fill="#88eeff" opacity="0.8"/>
  <rect x="3" y="7" width="4" height="3" fill="#88ddff" opacity="0.6"/><rect x="17" y="7" width="4" height="3" fill="#88ddff" opacity="0.6"/>
  <rect x="10" y="9" width="4" height="2" fill="#ffaa00"/>
  <rect x="3" y="12" width="18" height="11" fill="#0f1c2e"/><rect x="2" y="13" width="20" height="9" fill="#0f1c2e"/>
  <rect x="6" y="13" width="12" height="9" fill="#ddeeff"/>
  <rect x="8" y="14" width="8" height="7" fill="#eef6ff"/>
  <rect x="10" y="15" width="4" height="1" fill="#aaddff" opacity="0.5"/>
  <rect x="1" y="13" width="4" height="8" fill="#0f1c2e"/><rect x="1" y="20" width="4" height="2" fill="#aaeeff"/>
  <rect x="19" y="13" width="4" height="8" fill="#0f1c2e"/><rect x="19" y="20" width="4" height="2" fill="#aaeeff"/>
  <rect x="3" y="18" width="20" height="3" fill="#0088cc"/>
  <rect x="3" y="18" width="20" height="1" fill="#00ccff"/>
  <rect x="5" y="22" width="7" height="2" fill="#aaeeff"/><rect x="12" y="22" width="7" height="2" fill="#aaeeff"/>
  <rect x="5" y="21" width="7" height="1" fill="#ffaa00"/><rect x="12" y="21" width="7" height="1" fill="#ffaa00"/>
</>); }

function PenguinLv4() { return (<>
  <rect x="7" y="0" width="3" height="4" fill="#aaeeff"/><rect x="10" y="0" width="4" height="5" fill="#ffffff"/><rect x="14" y="0" width="3" height="4" fill="#aaeeff"/>
  <rect x="3" y="2" width="18" height="11" fill="#081420"/><rect x="2" y="3" width="20" height="9" fill="#081420"/>
  <rect x="6" y="4" width="12" height="9" fill="#cceeff"/>
  <rect x="4" y="4" width="6" height="6" fill="#030a10"/><rect x="14" y="4" width="6" height="6" fill="#030a10"/>
  <rect x="4" y="4" width="3" height="3" fill="#fff"/><rect x="14" y="4" width="3" height="3" fill="#fff"/>
  <rect x="6" y="6" width="2" height="4" fill="#002244" opacity="0.6"/><rect x="16" y="6" width="2" height="4" fill="#002244" opacity="0.6"/>
  <rect x="5" y="7" width="1" height="1" fill="#00ddff"/><rect x="15" y="7" width="1" height="1" fill="#00ddff"/>
  <rect x="2" y="8" width="4" height="4" fill="#66ccff" opacity="0.65"/><rect x="18" y="8" width="4" height="4" fill="#66ccff" opacity="0.65"/>
  <rect x="10" y="10" width="4" height="2" fill="#ffcc00"/>
  <rect x="2" y="13" width="20" height="10" fill="#081420"/><rect x="1" y="14" width="22" height="8" fill="#081420"/>
  <rect x="5" y="14" width="14" height="8" fill="#cceeff"/>
  <rect x="7" y="15" width="10" height="6" fill="#e8f8ff"/>
  <rect x="0" y="14" width="4" height="8" fill="#081420"/><rect x="0" y="21" width="4" height="2" fill="#66ddff"/>
  <rect x="20" y="14" width="4" height="8" fill="#081420"/><rect x="20" y="21" width="4" height="2" fill="#66ddff"/>
  <rect x="2" y="19" width="20" height="3" fill="#0066bb"/>
  <rect x="2" y="19" width="20" height="1" fill="#00aaff"/>
  <rect x="2" y="21" width="20" height="1" fill="#004488"/>
  <rect x="4" y="22" width="7" height="2" fill="#66ddff"/><rect x="13" y="22" width="7" height="2" fill="#66ddff"/>
  <rect x="4" y="21" width="7" height="1" fill="#ffcc00"/><rect x="13" y="21" width="7" height="1" fill="#ffcc00"/>
  <rect x="0" y="1" width="2" height="2" fill="#aaeeff" opacity="0.8"/><rect x="22" y="1" width="2" height="2" fill="#aaeeff" opacity="0.8"/>
</>); }

function PenguinLv5() { return (<>
  <rect x="6" y="0" width="4" height="5" fill="#ffffff"/><rect x="10" y="0" width="4" height="6" fill="#aaeeff"/><rect x="14" y="0" width="4" height="5" fill="#ffffff"/>
  <rect x="7" y="1" width="2" height="3" fill="#aaeeff"/><rect x="15" y="1" width="2" height="3" fill="#aaeeff"/>
  <rect x="2" y="2" width="20" height="12" fill="#040e18"/><rect x="1" y="3" width="22" height="10" fill="#040e18"/>
  <rect x="5" y="4" width="14" height="10" fill="#bbddff"/>
  <rect x="3" y="4" width="7" height="7" fill="#020810"/><rect x="14" y="4" width="7" height="7" fill="#020810"/>
  <rect x="3" y="4" width="4" height="4" fill="#fff"/><rect x="14" y="4" width="4" height="4" fill="#fff"/>
  <rect x="5" y="6" width="3" height="5" fill="#001133" opacity="0.6"/><rect x="16" y="6" width="3" height="5" fill="#001133" opacity="0.6"/>
  <rect x="4" y="7" width="2" height="2" fill="#00eeff"/><rect x="15" y="7" width="2" height="2" fill="#00eeff"/>
  <rect x="1" y="9" width="4" height="4" fill="#44bbff" opacity="0.7"/><rect x="19" y="9" width="4" height="4" fill="#44bbff" opacity="0.7"/>
  <rect x="10" y="11" width="4" height="2" fill="#ffdd00"/>
  <rect x="1" y="14" width="22" height="9" fill="#040e18"/><rect x="0" y="15" width="24" height="7" fill="#040e18"/>
  <rect x="4" y="15" width="16" height="7" fill="#bbddff"/>
  <rect x="6" y="16" width="12" height="5" fill="#ddeeff"/>
  <rect x="9" y="17" width="6" height="1" fill="#88ccff" opacity="0.5"/>
  <rect x="0" y="15" width="4" height="8" fill="#040e18"/><rect x="0" y="22" width="4" height="2" fill="#00eeff"/>
  <rect x="20" y="15" width="4" height="8" fill="#040e18"/><rect x="20" y="22" width="4" height="2" fill="#00eeff"/>
  <rect x="1" y="20" width="22" height="3" fill="#004488"/>
  <rect x="1" y="20" width="22" height="1" fill="#0088ff"/>
  <rect x="10" y="20" width="4" height="3" fill="#00ddff"/>
  <rect x="3" y="23" width="8" height="1" fill="#00eeff"/><rect x="13" y="23" width="8" height="1" fill="#00eeff"/>
  <rect x="3" y="22" width="8" height="1" fill="#ffdd00"/><rect x="13" y="22" width="8" height="1" fill="#ffdd00"/>
  <rect x="0" y="1" width="2" height="2" fill="#aaeeff"/><rect x="22" y="1" width="2" height="2" fill="#aaeeff"/>
  <rect x="22" y="14" width="2" height="2" fill="#aaeeff" opacity="0.7"/>
  <rect x="0" y="20" width="1" height="1" fill="#00eeff" opacity="0.8"/>
</>); }

// ── DRAGON ──
function DragonLv1() { return (<>
  <rect x="7" y="1" width="2" height="3" fill="#ffd700"/>
  <rect x="6" y="3" width="12" height="10" fill="#33bb99"/><rect x="5" y="4" width="14" height="8" fill="#33bb99"/>
  <rect x="8" y="5" width="8" height="1" fill="#2a9" opacity="0.6"/>
  <rect x="7" y="7" width="2" height="1" fill="#0a1020"/><rect x="13" y="7" width="2" height="1" fill="#0a1020"/>
  <rect x="7" y="7" width="1" height="1" fill="#fff"/><rect x="13" y="7" width="1" height="1" fill="#fff"/>
  <rect x="10" y="9" width="4" height="1" fill="#aaeedd"/>
  <rect x="6" y="13" width="12" height="7" fill="#33bb99"/><rect x="5" y="14" width="14" height="5" fill="#33bb99"/>
  <rect x="8" y="14" width="8" height="5" fill="#aaeedd"/>
  <rect x="7" y="20" width="4" height="2" fill="#2a9"/><rect x="13" y="20" width="4" height="2" fill="#2a9"/>
</>); }

function DragonLv2() { return (<>
  <rect x="5" y="0" width="3" height="5" fill="#ffd700"/><rect x="16" y="0" width="3" height="5" fill="#ffd700"/>
  <rect x="6" y="1" width="2" height="3" fill="#ffaa00"/><rect x="16" y="1" width="2" height="3" fill="#ffaa00"/>
  <rect x="1" y="4" width="4" height="7" fill="#2a9a80"/><rect x="19" y="4" width="4" height="7" fill="#2a9a80"/>
  <rect x="2" y="5" width="3" height="5" fill="#5dcaa5" opacity="0.7"/><rect x="19" y="5" width="3" height="5" fill="#5dcaa5" opacity="0.7"/>
  <rect x="4" y="3" width="16" height="12" fill="#33bb99"/><rect x="3" y="4" width="18" height="10" fill="#33bb99"/>
  <rect x="7" y="7" width="10" height="8" fill="#aaeedd"/>
  <rect x="6" y="4" width="4" height="5" fill="#0a1a10"/><rect x="14" y="4" width="4" height="5" fill="#0a1a10"/>
  <rect x="6" y="4" width="2" height="2" fill="#fff"/><rect x="14" y="4" width="2" height="2" fill="#fff"/>
  <rect x="7" y="4" width="1" height="5" fill="#001a08" opacity="0.6"/><rect x="15" y="4" width="1" height="5" fill="#001a08" opacity="0.6"/>
  <rect x="4" y="7" width="2" height="2" fill="#5dcaa5" opacity="0.8"/><rect x="18" y="7" width="2" height="2" fill="#5dcaa5" opacity="0.8"/>
  <rect x="10" y="8" width="4" height="1" fill="#117755"/>
  <rect x="9" y="10" width="6" height="1" fill="#117755"/>
  <rect x="4" y="15" width="16" height="8" fill="#33bb99"/><rect x="3" y="16" width="18" height="6" fill="#33bb99"/>
  <rect x="7" y="16" width="10" height="6" fill="#aaeedd"/>
  <rect x="17" y="14" width="6" height="5" fill="#33bb99"/>
  <rect x="20" y="12" width="4" height="4" fill="#ffd700"/>
  <rect x="6" y="23" width="5" height="1" fill="#2a9a80"/><rect x="13" y="23" width="5" height="1" fill="#2a9a80"/>
</>); }

function DragonLv3() { return (<>
  <rect x="4" y="0" width="5" height="6" fill="#ffd700"/><rect x="15" y="0" width="5" height="6" fill="#ffd700"/>
  <rect x="5" y="1" width="3" height="4" fill="#ffaa00"/><rect x="16" y="1" width="3" height="4" fill="#ffaa00"/>
  <rect x="10" y="0" width="4" height="3" fill="#ffd700"/>
  <rect x="0" y="4" width="5" height="9" fill="#1a8866"/><rect x="19" y="4" width="5" height="9" fill="#1a8866"/>
  <rect x="1" y="5" width="3" height="7" fill="#33bb99" opacity="0.8"/><rect x="20" y="5" width="3" height="7" fill="#33bb99" opacity="0.8"/>
  <rect x="0" y="12" width="5" height="2" fill="#ffd700"/><rect x="19" y="12" width="5" height="2" fill="#ffd700"/>
  <rect x="3" y="4" width="18" height="13" fill="#1a9977"/><rect x="2" y="5" width="20" height="11" fill="#1a9977"/>
  <rect x="6" y="8" width="12" height="9" fill="#99eedd"/>
  <rect x="7" y="9" width="10" height="7" fill="#bbf5ee"/>
  <rect x="10" y="10" width="4" height="1" fill="#55ccaa" opacity="0.6"/>
  <rect x="9" y="12" width="6" height="1" fill="#55ccaa" opacity="0.6"/>
  <rect x="10" y="14" width="4" height="1" fill="#55ccaa" opacity="0.6"/>
  <rect x="4" y="5" width="6" height="7" fill="#030f08"/><rect x="14" y="5" width="6" height="7" fill="#030f08"/>
  <rect x="4" y="5" width="3" height="3" fill="#fff"/><rect x="14" y="5" width="3" height="3" fill="#fff"/>
  <rect x="6" y="7" width="2" height="5" fill="#00ff88" opacity="0.4"/><rect x="16" y="7" width="2" height="5" fill="#00ff88" opacity="0.4"/>
  <rect x="5" y="6" width="2" height="2" fill="#aaffcc" opacity="0.8"/><rect x="15" y="6" width="2" height="2" fill="#aaffcc" opacity="0.8"/>
  <rect x="3" y="9" width="3" height="3" fill="#55ddbb" opacity="0.6"/><rect x="18" y="9" width="3" height="3" fill="#55ddbb" opacity="0.6"/>
  <rect x="10" y="10" width="4" height="2" fill="#0a5533"/>
  <rect x="9" y="12" width="6" height="1" fill="#0a5533"/>
  <rect x="4" y="17" width="16" height="6" fill="#1a9977"/><rect x="5" y="18" width="14" height="5" fill="#99eedd"/>
  <rect x="4" y="17" width="16" height="2" fill="#ffd700"/>
  <rect x="11" y="17" width="2" height="2" fill="#00ff88"/>
  <rect x="17" y="17" width="7" height="5" fill="#1a9977"/>
  <rect x="20" y="14" width="4" height="4" fill="#1a9977"/>
  <rect x="21" y="12" width="3" height="3" fill="#ffd700"/>
  <rect x="5" y="23" width="6" height="1" fill="#1a9977"/><rect x="13" y="23" width="6" height="1" fill="#1a9977"/>
  <rect x="5" y="23" width="1" height="1" fill="#ffd700"/><rect x="9" y="23" width="1" height="1" fill="#ffd700"/>
  <rect x="13" y="23" width="1" height="1" fill="#ffd700"/><rect x="17" y="23" width="1" height="1" fill="#ffd700"/>
</>); }

function DragonLv4() { return (<>
  <rect x="3" y="0" width="6" height="7" fill="#ffd700"/><rect x="15" y="0" width="6" height="7" fill="#ffd700"/>
  <rect x="4" y="1" width="4" height="5" fill="#ffaa00"/><rect x="16" y="1" width="4" height="5" fill="#ffaa00"/>
  <rect x="9" y="0" width="6" height="4" fill="#ffd700"/>
  <rect x="10" y="0" width="4" height="2" fill="#fff" opacity="0.5"/>
  <rect x="0" y="3" width="5" height="12" fill="#117755"/><rect x="19" y="3" width="5" height="12" fill="#117755"/>
  <rect x="1" y="4" width="3" height="10" fill="#33aa88" opacity="0.8"/><rect x="20" y="4" width="3" height="10" fill="#33aa88" opacity="0.8"/>
  <rect x="0" y="14" width="5" height="3" fill="#ffd700"/><rect x="19" y="14" width="5" height="3" fill="#ffd700"/>
  <rect x="2" y="4" width="20" height="14" fill="#0f7755"/><rect x="1" y="5" width="22" height="12" fill="#0f7755"/>
  <rect x="5" y="8" width="14" height="10" fill="#77ddbb"/>
  <rect x="6" y="9" width="12" height="8" fill="#99ffdd"/>
  <rect x="10" y="10" width="4" height="2" fill="#44aa88" opacity="0.6"/>
  <rect x="9" y="13" width="6" height="2" fill="#44aa88" opacity="0.6"/>
  <rect x="3" y="5" width="8" height="8" fill="#020c06"/><rect x="13" y="5" width="8" height="8" fill="#020c06"/>
  <rect x="3" y="5" width="4" height="4" fill="#fff"/><rect x="13" y="5" width="4" height="4" fill="#fff"/>
  <rect x="5" y="7" width="3" height="6" fill="#00cc66" opacity="0.4"/><rect x="15" y="7" width="3" height="6" fill="#00cc66" opacity="0.4"/>
  <rect x="4" y="6" width="3" height="2" fill="#aaffcc" opacity="0.9"/><rect x="14" y="6" width="3" height="2" fill="#aaffcc" opacity="0.9"/>
  <rect x="2" y="10" width="3" height="4" fill="#44ccaa" opacity="0.7"/><rect x="19" y="10" width="3" height="4" fill="#44ccaa" opacity="0.7"/>
  <rect x="10" y="11" width="4" height="2" fill="#074433"/>
  <rect x="8" y="13" width="8" height="1" fill="#074433"/>
  <rect x="3" y="18" width="18" height="5" fill="#0f7755"/><rect x="4" y="19" width="16" height="4" fill="#77ddbb"/>
  <rect x="3" y="18" width="18" height="2" fill="#ffd700"/>
  <rect x="10" y="18" width="4" height="2" fill="#00ff99"/>
  <rect x="19" y="16" width="5" height="7" fill="#0f7755"/>
  <rect x="21" y="13" width="3" height="4" fill="#0f7755"/>
  <rect x="22" y="11" width="2" height="3" fill="#ffd700"/>
  <rect x="4" y="23" width="7" height="1" fill="#0f7755"/><rect x="13" y="23" width="7" height="1" fill="#0f7755"/>
  <rect x="4" y="23" width="2" height="1" fill="#ffd700"/><rect x="10" y="23" width="2" height="1" fill="#ffd700"/>
  <rect x="13" y="23" width="2" height="1" fill="#ffd700"/><rect x="19" y="23" width="2" height="1" fill="#ffd700"/>
  <rect x="22" y="4" width="2" height="2" fill="#ffd700"/><rect x="0" y="4" width="2" height="2" fill="#ffd700"/>
</>); }

function DragonLv5() { return (<>
  <rect x="2" y="0" width="7" height="8" fill="#ffd700"/><rect x="15" y="0" width="7" height="8" fill="#ffd700"/>
  <rect x="3" y="1" width="5" height="6" fill="#ffcc00"/><rect x="16" y="1" width="5" height="6" fill="#ffcc00"/>
  <rect x="4" y="2" width="3" height="4" fill="#fff" opacity="0.4"/><rect x="17" y="2" width="3" height="4" fill="#fff" opacity="0.4"/>
  <rect x="8" y="0" width="8" height="5" fill="#ffd700"/>
  <rect x="9" y="0" width="6" height="3" fill="#fff" opacity="0.4"/>
  <rect x="0" y="3" width="5" height="14" fill="#0a5544"/><rect x="19" y="3" width="5" height="14" fill="#0a5544"/>
  <rect x="1" y="4" width="4" height="12" fill="#22997766"/><rect x="19" y="4" width="4" height="12" fill="#22997766"/>
  <rect x="0" y="16" width="5" height="4" fill="#ffd700"/><rect x="19" y="16" width="5" height="4" fill="#ffd700"/>
  <rect x="1" y="5" width="22" height="15" fill="#0a6644"/><rect x="0" y="6" width="24" height="13" fill="#0a6644"/>
  <rect x="4" y="9" width="16" height="10" fill="#55ccaa"/>
  <rect x="5" y="10" width="14" height="8" fill="#77ffdd"/>
  <rect x="10" y="11" width="4" height="3" fill="#33aa88" opacity="0.6"/>
  <rect x="8" y="14" width="8" height="2" fill="#33aa88" opacity="0.6"/>
  <rect x="2" y="6" width="9" height="9" fill="#010804"/><rect x="13" y="6" width="9" height="9" fill="#010804"/>
  <rect x="2" y="6" width="5" height="5" fill="#fff"/><rect x="13" y="6" width="5" height="5" fill="#fff"/>
  <rect x="5" y="8" width="4" height="7" fill="#00aa44" opacity="0.4"/><rect x="15" y="8" width="4" height="7" fill="#00aa44" opacity="0.4"/>
  <rect x="3" y="7" width="4" height="3" fill="#aaffcc" opacity="0.95"/><rect x="13" y="7" width="4" height="3" fill="#aaffcc" opacity="0.95"/>
  <rect x="7" y="9" width="2" height="1" fill="#00ffaa"/><rect x="17" y="9" width="2" height="1" fill="#00ffaa"/>
  <rect x="1" y="11" width="3" height="5" fill="#33bb99" opacity="0.7"/><rect x="20" y="11" width="3" height="5" fill="#33bb99" opacity="0.7"/>
  <rect x="10" y="12" width="4" height="2" fill="#043322"/>
  <rect x="8" y="15" width="8" height="1" fill="#043322"/>
  <rect x="3" y="19" width="18" height="4" fill="#0a6644"/><rect x="4" y="20" width="16" height="3" fill="#55ccaa"/>
  <rect x="3" y="19" width="18" height="2" fill="#ffd700"/>
  <rect x="10" y="19" width="4" height="2" fill="#00ffaa"/>
  <rect x="19" y="17" width="5" height="6" fill="#0a6644"/>
  <rect x="21" y="14" width="3" height="4" fill="#0a6644"/>
  <rect x="22" y="12" width="2" height="3" fill="#ffd700"/>
  <rect x="23" y="11" width="1" height="2" fill="#ffdd00"/>
  <rect x="3" y="23" width="8" height="1" fill="#0a6644"/><rect x="13" y="23" width="8" height="1" fill="#0a6644"/>
  <rect x="3" y="23" width="2" height="1" fill="#ffd700"/><rect x="9" y="23" width="2" height="1" fill="#ffd700"/>
  <rect x="13" y="23" width="2" height="1" fill="#ffd700"/><rect x="19" y="23" width="2" height="1" fill="#ffd700"/>
  <rect x="22" y="5" width="2" height="3" fill="#ffd700"/><rect x="0" y="5" width="2" height="3" fill="#ffd700"/>
  <rect x="22" y="18" width="2" height="2" fill="#ffd700" opacity="0.8"/>
  <rect x="0" y="18" width="2" height="2" fill="#ffd700" opacity="0.8"/>
</>); }

// ── SHIBA 柴犬系 ──
function ShibaLv1() { return (<>
  <rect x="5" y="2" width="3" height="4" fill="#d98"/><rect x="16" y="2" width="3" height="4" fill="#d98"/>
  <rect x="6" y="3" width="1" height="2" fill="#fca"/><rect x="17" y="3" width="1" height="2" fill="#fca"/>
  <rect x="5" y="5" width="14" height="10" fill="#d98"/><rect x="4" y="6" width="16" height="8" fill="#d98"/>
  <rect x="7" y="7" width="10" height="7" fill="#fea"/>
  <rect x="7" y="6" width="3" height="3" fill="#111"/><rect x="14" y="6" width="3" height="3" fill="#111"/>
  <rect x="7" y="6" width="1" height="1" fill="#fff"/><rect x="14" y="6" width="1" height="1" fill="#fff"/>
  <rect x="10" y="10" width="4" height="2" fill="#111"/><rect x="11" y="11" width="2" height="1" fill="#f55"/>
  <rect x="5" y="15" width="14" height="7" fill="#d98"/><rect x="7" y="16" width="10" height="6" fill="#fea"/>
  <rect x="7" y="22" width="4" height="1" fill="#a75"/><rect x="13" y="22" width="4" height="1" fill="#a75"/>
</>); }
function ShibaLv2() { return (<>
  <rect x="4" y="1" width="4" height="5" fill="#c87"/><rect x="16" y="1" width="4" height="5" fill="#c87"/>
  <rect x="5" y="2" width="2" height="3" fill="#eb9"/><rect x="17" y="2" width="2" height="3" fill="#eb9"/>
  <rect x="4" y="5" width="16" height="11" fill="#c87"/><rect x="3" y="6" width="18" height="9" fill="#c87"/>
  <rect x="6" y="7" width="12" height="8" fill="#fea"/>
  <rect x="6" y="6" width="4" height="4" fill="#111"/><rect x="14" y="6" width="4" height="4" fill="#111"/>
  <rect x="6" y="6" width="2" height="2" fill="#fff"/><rect x="14" y="6" width="2" height="2" fill="#fff"/>
  <rect x="9" y="11" width="6" height="2" fill="#111"/><rect x="10" y="12" width="4" height="1" fill="#f55"/>
  <rect x="4" y="16" width="16" height="7" fill="#c87"/><rect x="6" y="17" width="12" height="6" fill="#fea"/>
  <rect x="2" y="11" width="3" height="3" fill="#f88" opacity="0.5"/><rect x="19" y="11" width="3" height="3" fill="#f88" opacity="0.5"/>
  <rect x="6" y="23" width="5" height="1" fill="#a75"/><rect x="13" y="23" width="5" height="1" fill="#a75"/>
</>); }
function ShibaLv3() { return (<>
  <rect x="3" y="0" width="5" height="6" fill="#b76"/><rect x="16" y="0" width="5" height="6" fill="#b76"/>
  <rect x="4" y="1" width="3" height="4" fill="#da8"/><rect x="17" y="1" width="3" height="4" fill="#da8"/>
  <rect x="3" y="5" width="18" height="12" fill="#b76"/><rect x="2" y="6" width="20" height="10" fill="#b76"/>
  <rect x="5" y="7" width="14" height="10" fill="#fea"/>
  <rect x="5" y="6" width="5" height="5" fill="#111"/><rect x="14" y="6" width="5" height="5" fill="#111"/>
  <rect x="5" y="6" width="2" height="2" fill="#fff"/><rect x="14" y="6" width="2" height="2" fill="#fff"/>
  <rect x="8" y="12" width="8" height="3" fill="#111"/><rect x="9" y="13" width="6" height="2" fill="#f55"/>
  <rect x="3" y="17" width="18" height="6" fill="#b76"/><rect x="5" y="18" width="14" height="5" fill="#fda"/>
  <rect x="1" y="11" width="3" height="3" fill="#f88" opacity="0.6"/><rect x="20" y="11" width="3" height="3" fill="#f88" opacity="0.6"/>
  <rect x="5" y="23" width="6" height="1" fill="#864"/><rect x="13" y="23" width="6" height="1" fill="#864"/>
</>); }
function ShibaLv4() { return (<>
  <rect x="2" y="0" width="5" height="7" fill="#a65"/><rect x="17" y="0" width="5" height="7" fill="#a65"/>
  <rect x="3" y="1" width="3" height="5" fill="#c97"/><rect x="18" y="1" width="3" height="5" fill="#c97"/>
  <rect x="2" y="5" width="20" height="13" fill="#a65"/><rect x="1" y="6" width="22" height="11" fill="#a65"/>
  <rect x="4" y="7" width="16" height="11" fill="#fea"/>
  <rect x="4" y="6" width="6" height="6" fill="#111"/><rect x="14" y="6" width="6" height="6" fill="#111"/>
  <rect x="4" y="6" width="3" height="3" fill="#fa0"/><rect x="14" y="6" width="3" height="3" fill="#fa0"/>
  <rect x="7" y="13" width="10" height="3" fill="#111"/><rect x="8" y="14" width="8" height="2" fill="#f44"/>
  <rect x="2" y="18" width="20" height="5" fill="#a65"/><rect x="4" y="19" width="16" height="4" fill="#fda"/>
  <rect x="0" y="10" width="3" height="4" fill="#f88" opacity="0.6"/><rect x="21" y="10" width="3" height="4" fill="#f88" opacity="0.6"/>
  <rect x="4" y="23" width="7" height="1" fill="#753"/><rect x="13" y="23" width="7" height="1" fill="#753"/>
  <rect x="9" y="0" width="6" height="2" fill="#fa0"/>
</>); }
function ShibaLv5() { return (<>
  <rect x="1" y="0" width="6" height="8" fill="#964"/><rect x="17" y="0" width="6" height="8" fill="#964"/>
  <rect x="2" y="1" width="4" height="6" fill="#b86"/><rect x="18" y="1" width="4" height="6" fill="#b86"/>
  <rect x="1" y="5" width="22" height="14" fill="#964"/><rect x="0" y="6" width="24" height="12" fill="#964"/>
  <rect x="3" y="7" width="18" height="12" fill="#fea"/>
  <rect x="3" y="6" width="7" height="7" fill="#111"/><rect x="14" y="6" width="7" height="7" fill="#111"/>
  <rect x="3" y="6" width="3" height="3" fill="#ff0"/><rect x="14" y="6" width="3" height="3" fill="#ff0"/>
  <rect x="6" y="14" width="12" height="3" fill="#111"/><rect x="7" y="15" width="10" height="2" fill="#f33"/>
  <rect x="1" y="19" width="22" height="5" fill="#964"/><rect x="3" y="20" width="18" height="4" fill="#fda"/>
  <rect x="0" y="9" width="2" height="5" fill="#f88" opacity="0.7"/><rect x="22" y="9" width="2" height="5" fill="#f88" opacity="0.7"/>
  <rect x="3" y="23" width="8" height="1" fill="#642"/><rect x="13" y="23" width="8" height="1" fill="#642"/>
  <rect x="8" y="0" width="8" height="2" fill="#ff0"/><rect x="10" y="2" width="4" height="1" fill="#ff0"/>
</>); }

// ── BUNNY 蹦蹦兔系 ──
function BunnyLv1() { return (<>
  <rect x="7" y="0" width="3" height="6" fill="#faa"/><rect x="14" y="0" width="3" height="6" fill="#faa"/>
  <rect x="8" y="1" width="1" height="4" fill="#fcc"/><rect x="15" y="1" width="1" height="4" fill="#fcc"/>
  <rect x="5" y="5" width="14" height="10" fill="#faa"/>
  <rect x="7" y="8" width="10" height="7" fill="#fee"/>
  <rect x="7" y="7" width="3" height="3" fill="#111"/><rect x="14" y="7" width="3" height="3" fill="#111"/>
  <rect x="7" y="7" width="1" height="1" fill="#fff"/><rect x="14" y="7" width="1" height="1" fill="#fff"/>
  <rect x="10" y="11" width="4" height="2" fill="#111"/><rect x="11" y="12" width="2" height="1" fill="#f88"/>
  <rect x="5" y="15" width="14" height="7" fill="#faa"/><rect x="7" y="16" width="10" height="6" fill="#fdd"/>
  <rect x="7" y="22" width="4" height="1" fill="#c88"/><rect x="13" y="22" width="4" height="1" fill="#c88"/>
</>); }
function BunnyLv2() { return (<>
  <rect x="6" y="0" width="4" height="7" fill="#f88"/><rect x="14" y="0" width="4" height="7" fill="#f88"/>
  <rect x="7" y="1" width="2" height="5" fill="#fbb"/><rect x="15" y="1" width="2" height="5" fill="#fbb"/>
  <rect x="4" y="5" width="16" height="11" fill="#f88"/><rect x="3" y="6" width="18" height="9" fill="#f88"/>
  <rect x="6" y="8" width="12" height="7" fill="#fee"/>
  <rect x="6" y="7" width="4" height="4" fill="#111"/><rect x="14" y="7" width="4" height="4" fill="#111"/>
  <rect x="6" y="7" width="2" height="2" fill="#f9f"/><rect x="14" y="7" width="2" height="2" fill="#f9f"/>
  <rect x="9" y="12" width="6" height="2" fill="#111"/><rect x="10" y="13" width="4" height="1" fill="#f77"/>
  <rect x="4" y="16" width="16" height="7" fill="#f88"/><rect x="6" y="17" width="12" height="6" fill="#fdd"/>
  <rect x="6" y="23" width="5" height="1" fill="#a66"/><rect x="13" y="23" width="5" height="1" fill="#a66"/>
</>); }
function BunnyLv3() { return (<>
  <rect x="5" y="0" width="5" height="8" fill="#e66"/><rect x="14" y="0" width="5" height="8" fill="#e66"/>
  <rect x="6" y="1" width="3" height="6" fill="#faa"/><rect x="15" y="1" width="3" height="6" fill="#faa"/>
  <rect x="3" y="5" width="18" height="12" fill="#e66"/><rect x="2" y="6" width="20" height="10" fill="#e66"/>
  <rect x="5" y="8" width="14" height="8" fill="#fee"/>
  <rect x="5" y="7" width="5" height="5" fill="#111"/><rect x="14" y="7" width="5" height="5" fill="#111"/>
  <rect x="5" y="7" width="2" height="2" fill="#f0f"/><rect x="14" y="7" width="2" height="2" fill="#f0f"/>
  <rect x="8" y="13" width="8" height="2" fill="#111"/><rect x="9" y="14" width="6" height="1" fill="#f55"/>
  <rect x="3" y="17" width="18" height="6" fill="#e66"/><rect x="5" y="18" width="14" height="5" fill="#fdd"/>
  <rect x="5" y="23" width="6" height="1" fill="#844"/><rect x="13" y="23" width="6" height="1" fill="#844"/>
  <rect x="1" y="10" width="3" height="3" fill="#f88" opacity="0.5"/><rect x="20" y="10" width="3" height="3" fill="#f88" opacity="0.5"/>
</>); }
function BunnyLv4() { return (<>
  <rect x="4" y="0" width="5" height="9" fill="#d44"/><rect x="15" y="0" width="5" height="9" fill="#d44"/>
  <rect x="5" y="1" width="3" height="7" fill="#f88"/><rect x="16" y="1" width="3" height="7" fill="#f88"/>
  <rect x="2" y="5" width="20" height="13" fill="#d44"/><rect x="1" y="6" width="22" height="11" fill="#d44"/>
  <rect x="4" y="8" width="16" height="9" fill="#fee"/>
  <rect x="4" y="7" width="6" height="6" fill="#111"/><rect x="14" y="7" width="6" height="6" fill="#111"/>
  <rect x="4" y="7" width="3" height="3" fill="#f0f"/><rect x="14" y="7" width="3" height="3" fill="#f0f"/>
  <rect x="7" y="14" width="10" height="2" fill="#111"/><rect x="8" y="15" width="8" height="1" fill="#f44"/>
  <rect x="2" y="18" width="20" height="5" fill="#d44"/><rect x="4" y="19" width="16" height="4" fill="#fdd"/>
  <rect x="4" y="23" width="7" height="1" fill="#622"/><rect x="13" y="23" width="7" height="1" fill="#622"/>
  <rect x="9" y="0" width="2" height="2" fill="#f0f"/><rect x="13" y="0" width="2" height="2" fill="#f0f"/>
</>); }
function BunnyLv5() { return (<>
  <rect x="3" y="0" width="6" height="10" fill="#c22"/><rect x="15" y="0" width="6" height="10" fill="#c22"/>
  <rect x="4" y="1" width="4" height="8" fill="#f66"/><rect x="16" y="1" width="4" height="8" fill="#f66"/>
  <rect x="1" y="5" width="22" height="14" fill="#c22"/><rect x="0" y="6" width="24" height="12" fill="#c22"/>
  <rect x="3" y="8" width="18" height="10" fill="#fee"/>
  <rect x="3" y="7" width="7" height="7" fill="#111"/><rect x="14" y="7" width="7" height="7" fill="#111"/>
  <rect x="3" y="7" width="3" height="3" fill="#ff0"/><rect x="14" y="7" width="3" height="3" fill="#ff0"/>
  <rect x="6" y="15" width="12" height="2" fill="#111"/><rect x="7" y="16" width="10" height="1" fill="#f33"/>
  <rect x="1" y="19" width="22" height="5" fill="#c22"/><rect x="3" y="20" width="18" height="4" fill="#fdd"/>
  <rect x="3" y="23" width="8" height="1" fill="#611"/><rect x="13" y="23" width="8" height="1" fill="#611"/>
  <rect x="8" y="0" width="3" height="2" fill="#ff0"/><rect x="13" y="0" width="3" height="2" fill="#ff0"/>
  <rect x="0" y="8" width="2" height="6" fill="#c22"/><rect x="22" y="8" width="2" height="6" fill="#c22"/>
</>); }

// ══════════════════════════════════════════════
// 进化数据
// ══════════════════════════════════════════════
const EVO_DATA = {
  fox:     { 1:"Foxlet",   2:"Foxen",    3:"Foxfire",   4:"Emberfox",   5:"Infernix"   },
  cat:     { 1:"Kitten",   2:"Lunara",   3:"Lunaris",   4:"Eclipso",    5:"Stellarcat" },
  penguin: { 1:"Pebble",   2:"Pingu",    3:"Glacius",   4:"Frostking",  5:"Blizzarius" },
  dragon:  { 1:"Draglet",  2:"Drago",    3:"Dragoking", 4:"Jadewing",   5:"Eterndrake" },
  shiba:   { 1:"Puppy",    2:"Shibes",   3:"Dogenaut",  4:"WowLord",    5:"MuchKing"   },
  bunny:   { 1:"Bunnito",  2:"Hoppie",   3:"Fluffnova", 4:"Moonbun",    5:"Cosmobun"   },
};

const EVO_REQ = { 1:0, 2:20, 3:60, 4:140, 5:280 }; // 累计喂食次数
const TYPE_COLOR = {
  fox:"#ff5500", cat:"#9944cc", penguin:"#0088cc", dragon:"#00aa77", shiba:"#cc8844", bunny:"#ee6688"
};
const TYPE_BG = {
  fox:"#fff5f0", cat:"#f5efff", penguin:"#f0f8ff", dragon:"#edfaf3", shiba:"#fef5ea", bunny:"#fff0f5"
};
const TYPE_NAME = {
  fox:"火狐系", cat:"月猫系", penguin:"冰雪系", dragon:"龙焰系", shiba:"柴犬系", bunny:"蹦蹦兔系"
};
const TYPE_NUM = { fox:"001", cat:"002", penguin:"003", dragon:"004", shiba:"005", bunny:"006" };

// ══════════════════════════════════════════════
// 心情系统
// ══════════════════════════════════════════════
function getMood(happiness) {
  if (happiness >= 80) return { key:"happy",  label:"开心",  emoji:"(*^▽^*)", color:"#00ffcc" };
  if (happiness >= 50) return { key:"normal", label:"普通",  emoji:"( ´ ▽ ` )", color:"#aaaaff" };
  if (happiness >= 20) return { key:"hungry", label:"有点饿", emoji:"(´-ω-`)",  color:"#ffaa00" };
  return                      { key:"sad",    label:"很难过", emoji:"(T▽T)",    color:"#ff5555" };
}

function getSpeech(type, mood, level) {
  const map = {
    fox: {
      happy:  ["吃饱了好开心！我要帮你背100个单词！", "今天状态绝佳，一起冲高考！", "主人最棒了~"],
      normal: ["嗯...还好", "要不要一起学一会儿？", "我在这里陪着你~"],
      hungry: ["肚子饿了呜呜...", "能给我一点吃的吗？", "饿着肚子好难学习..."],
      sad:    ["主人好久没来看我了...呜", "我好孤独...", "我要饿晕了..."],
    },
    cat: {
      happy:  ["哼，才不是因为你喂我才开心的", "（其实很高兴）", "...谢谢你（小声）"],
      normal: ["随便", "本猫不在乎", "…（盯着你）"],
      hungry: ["才不是想让你喂我！只是...饿了而已", "哼", "……（肚子叫）"],
      sad:    ["你有多久没来了...（小声）", "不理你了", "……（眼泪汪汪）"],
    },
    penguin: {
      happy:  ["咕咕咕！！！（最开心的企鹅）", "吃饱了要去学英语！", "今天要背多少单词？！"],
      normal: ["咕...", "还行吧", "（摇摇摆摆地走来走去）"],
      hungry: ["咕咕...（肚子叫）", "我想吃鱼...还有单词", "饿了..."],
      sad:    ["咕...（蔫了）", "好久没鱼吃了呜呜", "围巾都不够暖了..."],
    },
    dragon: {
      happy:  ["吾已进化！随时可为汝焚烧错题！", "力量在恢复！一起征服高考！", "嗷！（喷出一个小火球）"],
      normal: ["嗯。", "可以。", "（盯着你）"],
      hungry: ["吾需补充能量...", "饥饿影响战斗力", "...给点食物"],
      sad:    ["力量在流逝...", "主人...你在哪里...", "吾快撑不住了..."],
    },
    shiba: {
      happy:  ["汪汪汪！！！好开心好开心！！", "摇尾巴！转圈圈！再转一圈！", "主人最好了！舔舔！"],
      normal: ["汪~", "（歪头看你）", "...要出去玩吗？"],
      hungry: ["呜...肚子在叫了汪...", "（用爪子扒拉碗）", "看看碗...空的...汪"],
      sad:    ["呜呜...主人不要我了吗...", "（趴在角落）", "尾巴都摇不动了..."],
    },
    bunny: {
      happy:  ["蹦！蹦！蹦蹦蹦！！！", "耳朵竖起来了！超开心！", "（疯狂蹦跳中）咕咕！"],
      normal: ["（抖抖耳朵）", "...咕？", "（蹲着啃胡萝卜）"],
      hungry: ["耳朵...耷拉下来了...", "咕咕...（摸肚子）", "想吃胡萝卜..."],
      sad:    ["（缩成一团）...咕...", "耳朵都不想动了...", "好久没人摸我了..."],
    },
  };
  const lines = map[type]?.[mood] || ["..."];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ══════════════════════════════════════════════
// 默认状态
// ══════════════════════════════════════════════
function defaultState() {
  return {
    food: 5,            // shared food pool
    pets: [],           // array of active pets: [{type, totalFed, level, happiness, lastFed}]
    chosen: null,       // kept for legacy compat
  };
}
function defaultPet(type) {
  return { type, totalFed: 0, level: 1, happiness: 70, lastFed: Date.now() };
}

function loadState() {
  try {
    // Try v2 first
    const raw2 = localStorage.getItem(STORAGE_KEY);
    if (raw2) {
      const parsed = JSON.parse(raw2);
      if (parsed.pets) return { ...defaultState(), ...parsed };
    }
    // Migrate from v1
    const raw1 = localStorage.getItem(STORAGE_KEY_V1);
    if (raw1) {
      const v1 = JSON.parse(raw1);
      if (v1.chosen) {
        const migratedPet = { type: v1.chosen, totalFed: v1.totalFed||0, level: v1.level||1, happiness: v1.happiness||70, lastFed: v1.lastFed||Date.now() };
        return { food: v1.food||0, pets: [migratedPet], chosen: v1.chosen };
      }
    }
    return defaultState();
  } catch { return defaultState(); }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

// ══════════════════════════════════════════════
// 主组件
// ══════════════════════════════════════════════
export default function PetSystem() {
  const [state, setState] = useState(loadState);
  const [activePet, setActivePet] = useState(0); // index of focused pet
  const [feedAnim, setFeedAnim] = useState(-1);   // index being fed
  const [evoAnim, setEvoAnim] = useState(false);
  const [speech, setSpeech] = useState({});       // {petIdx: "text"}
  const [view, setView] = useState(() => {
    const s = loadState();
    return s.pets && s.pets.length > 0 ? "home" : "choose";
  });
  const speechTimers = useRef({});

  useEffect(() => { saveState(state); }, [state]);

  // External food events
  useEffect(() => {
    const handler = (e) => setState(s => ({ ...s, food: e.detail.food }));
    window.addEventListener("pet-food-added", handler);
    return () => window.removeEventListener("pet-food-added", handler);
  }, []);

  // Happiness decay every 24h
  useEffect(() => {
    const iv = setInterval(() => {
      setState(s => {
        const now = Date.now();
        const newPets = (s.pets||[]).map(p => {
          const hours = (now - (p.lastFed||now)) / 3600000;
          if (hours >= 24) {
            const decay = Math.floor(hours/24) * 20;
            return {...p, happiness: Math.max(0, p.happiness - decay), lastFed: now};
          }
          return p;
        });
        return {...s, pets: newPets};
      });
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  const showSpeech = useCallback((idx, text) => {
    setSpeech(s => ({...s, [idx]: text}));
    if (speechTimers.current[idx]) clearTimeout(speechTimers.current[idx]);
    speechTimers.current[idx] = setTimeout(() => setSpeech(s => {const ns={...s}; delete ns[idx]; return ns;}), 3000);
  }, []);

  const calcLevel = useCallback((totalFed) => {
    let lv = 1;
    for (let l = 5; l >= 1; l--) { if (totalFed >= EVO_REQ[l]) { lv = l; break; } }
    return lv;
  }, []);

  // Feed sound — each pet type has a unique tone
  const FEED_SOUNDS = {
    fox:     { notes:[[880,0],[1100,0.1],[1320,0.2],[1760,0.32]],    wave:"sine"    }, // warm ascending
    cat:     { notes:[[523,0],[659,0.12],[784,0.24],[1047,0.36]],    wave:"triangle"}, // soft bell chimes
    penguin: { notes:[[660,0],[880,0.08],[660,0.16],[1320,0.28]],    wave:"sine"    }, // bubbly bounce
    dragon:  { notes:[[220,0],[330,0.15],[440,0.3],[880,0.45]],      wave:"sawtooth"}, // deep power hum
    shiba:   { notes:[[740,0],[880,0.08],[1175,0.16],[1480,0.26]],   wave:"square"  }, // excited bark chirps
    bunny:   { notes:[[1047,0],[1319,0.07],[1568,0.14],[2093,0.22]], wave:"sine"    }, // sparkly twinkle
  };
  const playFeedSound = useCallback((petType) => {
    try {
      const cfg = FEED_SOUNDS[petType] || FEED_SOUNDS.fox;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      cfg.notes.forEach(([freq,t]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = cfg.wave; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime+t);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime+t+0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+t+0.22);
        osc.start(ctx.currentTime+t); osc.stop(ctx.currentTime+t+0.3);
      });
    } catch(e) {}
  }, []);

  const feed = useCallback((petIdx) => {
    setState(s => {
      if (s.food <= 0) return s;
      const pets = [...(s.pets||[])];
      if (!pets[petIdx]) return s;
      const p = pets[petIdx];
      const newTotalFed = p.totalFed + 1;
      const newHappiness = Math.min(100, p.happiness + 25);
      const newLevel = calcLevel(newTotalFed);
      const didEvo = newLevel > p.level;
      pets[petIdx] = {...p, totalFed: newTotalFed, happiness: newHappiness, level: newLevel, lastFed: Date.now()};
      playFeedSound(p.type);
      setFeedAnim(petIdx); setTimeout(() => setFeedAnim(-1), 600);
      if (didEvo) {
        setTimeout(() => {
          setEvoAnim(true); setTimeout(() => setEvoAnim(false), 2000);
          showSpeech(petIdx, `✨ 进化！${EVO_DATA[p.type][newLevel]} 诞生！`);
        }, 300);
      } else {
        showSpeech(petIdx, getSpeech(p.type, getMood(newHappiness).key, newLevel));
      }
      return {...s, food: s.food - 1, pets};
    });
  }, [calcLevel, playFeedSound, showSpeech]);

  const addPet = useCallback((type) => {
    setState(s => {
      if ((s.pets||[]).length >= 6) return s;
      if ((s.pets||[]).some(p => p.type === type)) return s;
      const newPets = [...(s.pets||[]), defaultPet(type)];
      return {...s, pets: newPets};
    });
    setView("home");
    setTimeout(() => showSpeech((state.pets||[]).length, getSpeech(type, "happy", 1)), 500);
  }, [showSpeech, state.pets]);

  const css = `
    @keyframes petHop  { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-10px)} }
    @keyframes petIdle { 0%,100%{transform:translateY(0) scaleY(1)} 50%{transform:translateY(-3px) scaleY(1.03)} }
    @keyframes petDroop{ 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(2px) rotate(-3deg)} }
    @keyframes feedPop { 0%{transform:scale(1)} 30%{transform:scale(1.35)} 100%{transform:scale(1)} }
    @keyframes evoGlow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(2) saturate(2)} }
    @keyframes floatUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-40px)} }
    @keyframes fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes evoFlash{ 0%{opacity:0} 20%,80%{opacity:1} 100%{opacity:0} }
    @keyframes starSpin{ 0%{transform:rotate(0) scale(0)} 50%{transform:rotate(180deg) scale(1)} 100%{transform:rotate(360deg) scale(0)} }
    @keyframes scanline{ 0%{transform:translateY(-100%)} 100%{transform:translateY(1200%)} }
  `;

  const pets = state.pets || [];

  // ── Choose / Add pet screen ──
  if (view === "choose") {
    const owned = pets.map(p => p.type);
    const allOwned = owned.length >= 6;
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",padding:"24px 16px"}}>
        <style>{css}</style>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:19,fontWeight:900,color:C.text,letterSpacing:2}}>✦ UGLY PETS ✦</div>
          <div style={{fontSize:11,color:C.sub,letterSpacing:3,marginTop:4}}>
            {pets.length === 0 ? "选择你的第一只伙伴" : `已有 ${pets.length}/6 只 · 再选一只`}
          </div>
        </div>
        {pets.length > 0 && (
          <button onClick={() => setView("home")}
            style={{display:"block",margin:"0 auto 16px",background:"none",border:"1px solid #ccc",color:C.sub,padding:"6px 16px",borderRadius:8,cursor:"pointer",fontSize:12}}>
            ← 返回
          </button>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,maxWidth:480,margin:"0 auto 24px"}}>
          {["fox","cat","penguin","dragon","shiba","bunny"].map(type => {
            const color = TYPE_COLOR[type];
            const alreadyOwned = owned.includes(type);
            return (
              <div key={type} onClick={() => !alreadyOwned && !allOwned && addPet(type)}
                style={{background:TYPE_BG[type],border:`2px solid ${alreadyOwned?"#ccc":color+"55"}`,borderRadius:16,padding:"20px 12px 16px",cursor:alreadyOwned||allOwned?"default":"pointer",textAlign:"center",opacity:alreadyOwned||allOwned?0.5:1,transition:"all 0.2s",position:"relative"}}
                onMouseEnter={e => { if(!alreadyOwned&&!allOwned){e.currentTarget.style.borderColor=color;e.currentTarget.style.transform="translateY(-4px)";} }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=alreadyOwned?"#ccc":color+"55";e.currentTarget.style.transform="translateY(0)"; }}>
                {alreadyOwned && <div style={{position:"absolute",top:8,right:8,fontSize:10,color:"#888",fontWeight:700}}>已拥有</div>}
                <div style={{fontSize:9,color,letterSpacing:2,marginBottom:8}}>No.{TYPE_NUM[type]}</div>
                <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                  <PetPixel type={type} level={1} mood="happy" size={72}/>
                </div>
                <div style={{fontSize:13,fontWeight:900,color:C.text,marginBottom:2}}>{EVO_DATA[type][3]}</div>
                <div style={{fontSize:10,color,fontWeight:700,letterSpacing:1}}>{TYPE_NAME[type]}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Dex screen ──
  if (view === "dex") {
    const p = pets[activePet] || pets[0];
    if (!p) { setView("choose"); return null; }
    const color = TYPE_COLOR[p.type];
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",padding:"16px"}}>
        <style>{css}</style>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={() => setView("home")} style={{background:"none",border:`1px solid ${color}44`,color,padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:12}}>← 返回</button>
          <div style={{fontSize:13,color:C.text,fontWeight:900}}>进化图鉴 · {EVO_DATA[p.type][p.level]}</div>
        </div>
        {[1,2,3,4,5].map(lv => {
          const unlocked = p.totalFed >= EVO_REQ[lv];
          const current = p.level === lv;
          return (
            <div key={lv} style={{background:current?`${color}11`:"#f4f6ff",border:`1.5px solid ${current?color:unlocked?color+"44":"#e0e6ff"}`,borderRadius:12,padding:"14px",marginBottom:10,display:"flex",alignItems:"center",gap:14,opacity:unlocked?1:0.5}}>
              <div style={{position:"relative"}}>
                {unlocked ? <PetPixel type={p.type} level={lv} mood="normal" size={52}/>
                  : <div style={{width:52,height:52,background:"#e8eeff",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#ccc"}}>?</div>}
                {current && <div style={{position:"absolute",top:-4,right:-4,width:10,height:10,background:color,borderRadius:"50%",animation:"pulse 1s ease-in-out infinite"}}/>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:900,color:unlocked?C.text:C.sub,marginBottom:2}}>Lv{lv} · {unlocked?EVO_DATA[p.type][lv]:"???"}</div>
                <div style={{fontSize:10,color:unlocked?color:C.sub}}>{lv===1?"初始形态":lv===5?"终极觉醒":`进化形态 ${lv}`}</div>
                {lv > 1 && <div style={{fontSize:10,color:C.sub,marginTop:4}}>需喂食 {EVO_REQ[lv]} 次 {unlocked?"✓":`(还需 ${EVO_REQ[lv]-p.totalFed} 次)`}</div>}
              </div>
              <div style={{fontSize:14,color:current?color:C.sub}}>{current?"◀ 当前":unlocked?"✓":"🔒"}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Home: 4-pet grid ──
  return (
    <div style={{background:C.bg,fontFamily:"system-ui,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{css}</style>

      {evoAnim && (
        <div style={{position:"absolute",inset:0,background:"rgba(255,215,0,0.15)",animation:"evoFlash 2s ease forwards",zIndex:50,pointerEvents:"none"}}/>
      )}

      {/* Header */}
      <div style={{background:C.nav,borderBottom:`1px solid #e0e6ff`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:14,fontWeight:900,color:C.text,letterSpacing:2}}>✦ UGLY PETS ✦</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={() => setView("dex")} style={{background:"none",border:"1px solid #ccc",color:C.sub,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:10}}>图鉴</button>
          {pets.length < 6 && (
            <button onClick={() => setView("choose")} style={{background:"none",border:"1px solid #7B61FF55",color:"#7B61FF",padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700}}>+ 领养</button>
          )}
        </div>
      </div>

      {/* Food counter */}
      <div style={{background:C.nav,padding:"10px 16px",borderBottom:"1px solid #e0e6ff",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <span style={{fontSize:11,color:C.sub}}>库存粮食  </span>
          <span style={{fontSize:20,fontWeight:900,color:C.text}}>{state.food}</span>
          <span style={{fontSize:12,color:C.sub}}> 个</span>
        </div>
        <div style={{fontSize:11,color:C.sub}}>学习赚取，喂食进化</div>
      </div>

      {/* Pet grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:"12px"}}>
        {pets.map((p, idx) => {
          const color = TYPE_COLOR[p.type];
          const bg = TYPE_BG[p.type];
          const mood = getMood(p.happiness);
          const nextLvReq = EVO_REQ[p.level + 1];
          const prevLvReq = EVO_REQ[p.level];
          const evoProgress = nextLvReq ? Math.min(100, Math.round(((p.totalFed-prevLvReq)/(nextLvReq-prevLvReq))*100)) : 100;
          const isFeedAnim = feedAnim === idx;
          return (
            <div key={p.type} style={{background:bg,borderRadius:20,padding:"14px 12px",border:`2px solid ${color}33`,position:"relative",overflow:"hidden"}}>
              {/* Speech bubble */}
              {speech[idx] && (
                <div style={{position:"absolute",top:6,left:8,right:8,background:"#fff",border:`1px solid ${color}44`,borderRadius:8,padding:"4px 8px",fontSize:10,color:C.text,zIndex:10,animation:"floatUp 3s ease forwards",textAlign:"center",lineHeight:1.4}}>
                  {speech[idx]}
                </div>
              )}
              {/* Pet name */}
              <div style={{fontSize:9,color,fontWeight:700,letterSpacing:1,marginBottom:4}}>{TYPE_NAME[p.type]} · Lv.{p.level}</div>
              <div style={{fontSize:11,fontWeight:900,color:C.text,marginBottom:8}}>{EVO_DATA[p.type][p.level]}</div>
              {/* Pet sprite */}
              <div style={{textAlign:"center",marginBottom:8}}>
                <div style={{display:"inline-block",animation:isFeedAnim?"feedPop 0.6s ease":"none",cursor:"pointer"}}
                  onClick={() => showSpeech(idx, getSpeech(p.type, mood.key, p.level))}>
                  <PetPixel type={p.type} level={p.level} mood={mood.key} size={72}/>
                </div>
              </div>
              {/* Mood */}
              <div style={{textAlign:"center",fontSize:11,color:mood.color,fontWeight:700,marginBottom:6}}>{mood.emoji} {mood.label}</div>
              {/* HP bar */}
              <div style={{marginBottom:4}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{fontSize:9,color:C.sub}}>HP</span>
                  <span style={{fontSize:9,color:mood.color,fontWeight:700}}>{p.happiness}/100</span>
                </div>
                <div style={{height:4,background:"#e0e6ff",borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${p.happiness}%`,height:"100%",background:mood.color,borderRadius:3,transition:"width 0.4s"}}/>
                </div>
              </div>
              {/* Evo progress */}
              {p.level < 5 && (
                <div style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:9,color:C.sub}}>→ Lv{p.level+1}</span>
                    <span style={{fontSize:9,color}}>{evoProgress}%</span>
                  </div>
                  <div style={{height:4,background:"#e0e6ff",borderRadius:3,overflow:"hidden"}}>
                    <div style={{width:`${evoProgress}%`,height:"100%",background:`linear-gradient(90deg,${color},#ffd700)`,borderRadius:3,transition:"width 0.4s"}}/>
                  </div>
                  <div style={{fontSize:9,color:C.sub,marginTop:2,textAlign:"center"}}>还需喂食 {Math.max(0,nextLvReq-p.totalFed)} 次</div>
                </div>
              )}
              {p.level === 5 && <div style={{textAlign:"center",fontSize:10,color:"#ffd700",marginBottom:8,letterSpacing:2}}>✦ MAX ✦</div>}
              {/* Feed button */}
              <button onClick={() => feed(idx)} disabled={state.food <= 0}
                style={{width:"100%",background:state.food>0?color:C.dim,border:"none",borderRadius:10,padding:"9px",color:"#fff",fontSize:12,fontWeight:900,cursor:state.food>0?"pointer":"not-allowed",transition:"all 0.2s",boxShadow:state.food>0?`0 0 10px ${color}55`:"none"}}>
                ▶ 喂食
              </button>
            </div>
          );
        })}

        {/* Empty slots */}
        {pets.length < 6 && Array(6 - pets.length).fill(0).map((_,i) => (
          <div key={`empty-${i}`} onClick={() => setView("choose")}
            style={{background:"#f0f2ff",borderRadius:20,padding:"14px 12px",border:"2px dashed #d0d4ff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",minHeight:260,gap:8,opacity:0.7}}>
            <div style={{fontSize:32,color:"#c0c4e0"}}>+</div>
            <div style={{fontSize:11,color:"#a0a4c0",fontWeight:700}}>领养伙伴</div>
          </div>
        ))}
      </div>

      {/* How to earn food */}
      <div style={{padding:"14px 16px",background:C.bg}}>
        <div style={{fontSize:11,color:C.sub,letterSpacing:1,marginBottom:10,fontWeight:700}}>如何获得粮食</div>
        {[{icon:"✏️",text:"每答对5题",reward:"+1"},{icon:"📝",text:"完成专项练习",reward:"+3~10"},{icon:"🎙️",text:"完成口语专项",reward:"+3~10"},{icon:"🎮",text:"闯关通过一关",reward:"+2"},{icon:"🏆",text:"完成挑战赛",reward:"+5"}].map((item,i) => (
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:14}}>{item.icon}</span>
              <span style={{fontSize:12,color:C.sub}}>{item.text}</span>
            </div>
            <span style={{fontSize:12,color:"#7B61FF",fontWeight:900}}>{item.reward}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
