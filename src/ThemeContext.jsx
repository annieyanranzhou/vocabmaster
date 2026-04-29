// ═══════════════════════════════════════════════════════════════
// ThemeContext.jsx — VocabMaster 多主题皮肤系统 (Skin System)
// 版本: 2.0
// 说明: 不只是颜色切换，而是完整的"皮肤"级别主题系统
//       每个主题包含: colors + assets + ornaments + componentStyles + copy
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 资产路径
const ASSET_BASE = '/theme-assets';
function assetPath(themeId, filename) {
  return `${ASSET_BASE}/${themeId}/${filename}`;
}

// ═══════════════════════════════════════════════════════════════
// Yuki 雪境学院
// ═══════════════════════════════════════════════════════════════
const YUKI = {
  id: 'yuki', name: 'Yuki', label: '雪境学院', subtitle: 'Snow Scholar',
  mascotName: 'Yuki', petName: '雪球',
  font: "'Nunito', 'Noto Sans SC', system-ui, sans-serif",

  copy: {
    greeting: (name) => `Hello, ${name}!`,
    greetingSub: '今日也是如沐学习哦！',
    encourageCorrect: '太棒了！你真是雪境小博士！',
    encourageWrong: '💪 再想想哦，冰雪之路需要耐心～',
    successTitle: '通关成功！', successSub: '太棒了！你真是雪境小博士！',
    perfectTitle: '完美通关！', tipLabel: '小贴士', hintLabel: 'Yuki 小提示',
    startReview: '开始复习', nextLevel: '下一关', continueChallenge: '继续挑战',
    returnMap: '返回地图', studyMotivation: '坚持学习，点亮冰雪之星！',
  },

  colors: {
    primary:'#4A6CDE', primaryLight:'#7BA7FF', primaryDark:'#3A56B8',
    secondary:'#F6D58C', accent:'#7BA7FF',
    bg:'#E9F1FF', bgSoft:'#D7E0F5', bgGlass:'rgba(233,241,255,0.85)',
    bgOverlay:'rgba(30,50,120,0.6)',
    nav:'#4A6CDE', navDark:'#3A56B8', navActive:'#F6D58C',
    navInactive:'rgba(255,255,255,0.5)', navText:'rgba(255,255,255,0.6)', navTextActive:'#FFFFFF',
    card:'#FFFFFF', cardGlass:'rgba(255,255,255,0.78)',
    cardBorder:'rgba(74,108,222,0.18)', cardShadow:'0 4px 20px rgba(74,108,222,0.12)',
    text:'#1A1A2E', textSecondary:'#5A6B8A', textMuted:'#A8B7E6', textOnPrimary:'#FFFFFF',
    success:'#34C759', successBg:'#E8F9EE', error:'#FF3B30', errorBg:'#FFEDED',
    warning:'#FF9500', warningBg:'#FFF4E0', gold:'#F6D58C',
    progressBar:'linear-gradient(90deg,#4A6CDE 0%,#7BA7FF 100%)',
    progressTrack:'rgba(74,108,222,0.12)', progressGlow:'0 0 8px rgba(74,108,222,0.4)',
    btnPrimary:'linear-gradient(135deg,#4A6CDE 0%,#5B7FEE 50%,#7BA7FF 100%)',
    btnPrimaryText:'#FFFFFF', btnPrimaryShadow:'0 4px 16px rgba(74,108,222,0.35)',
    btnSecondary:'rgba(74,108,222,0.08)', btnSecondaryBorder:'rgba(74,108,222,0.3)',
    btnSecondaryText:'#4A6CDE',
    optionBg:'#FFFFFF', optionBorder:'rgba(74,108,222,0.15)',
    optionSelected:'#4A6CDE', optionSelectedBg:'rgba(74,108,222,0.08)',
    optionSelectedBorder:'#4A6CDE', optionSelectedText:'#4A6CDE',
    optionCorrectBg:'#E8F9EE', optionCorrectBorder:'#34C759',
    optionWrongBg:'#FFEDED', optionWrongBorder:'#FF3B30',
    decorStar:'#F6D58C', decorParticle:'rgba(255,255,255,0.8)', decorGlow:'rgba(123,167,255,0.3)',
  },

  assets: {
    heroCharacter: assetPath('yuki','hero-character.png'),
    heroCharacterFull: assetPath('yuki','hero-character-full.png'),
    heroAvatar: assetPath('yuki','hero-avatar.png'),
    petCharacter: assetPath('yuki','pet-bear.png'),
    petCharacterSmall: assetPath('yuki','pet-bear-small.png'),
    appIcon: assetPath('yuki','app-icon.png'),
    themeBadge: assetPath('yuki','theme-badge.png'),
    bgPattern: assetPath('yuki','bg-pattern.png'),
    bgHero: assetPath('yuki','bg-hero.png'),
    bgResult: assetPath('yuki','bg-result.png'),
    bgMap: assetPath('yuki','bg-map.png'),
    cardCornerTL: assetPath('yuki','card-corner-tl.png'),
    cardCornerTR: assetPath('yuki','card-corner-tr.png'),
    cardCornerBL: assetPath('yuki','card-corner-bl.png'),
    cardCornerBR: assetPath('yuki','card-corner-br.png'),
    cardHeaderDecor: assetPath('yuki','card-header-decor.png'),
    modalFrame: assetPath('yuki','modal-frame.png'),
    modalCharacter: assetPath('yuki','modal-character.png'),
    navIcons: {
      home: assetPath('yuki','nav-home.png'),
      study: assetPath('yuki','nav-study.png'),
      practice: assetPath('yuki','nav-practice.png'),
      wordbank: assetPath('yuki','nav-wordbank.png'),
      profile: assetPath('yuki','nav-profile.png'),
    },
    achievementBadge: assetPath('yuki','achievement-badge.png'),
    wordCardIllust: assetPath('yuki','word-card-illust.png'),
    tipPet: assetPath('yuki','tip-pet.png'),
    successModalBg: assetPath('yuki','success-modal-bg.png'),
  },

  ornaments: {
    particleType:'snowflake', particleCount:20, particleColor:'rgba(255,255,255,0.6)',
    headerDecorType:'icicle', cardBorderStyle:'frost',
    progressDecor:'snowflake', progressEndCap:'❄️',
    navCenterHighlight:true, dividerStyle:'frost-line',
  },

  componentStyles: {
    page: {
      background:'#E9F1FF',
      backgroundImage:`url(${assetPath('yuki','bg-pattern.png')})`,
      backgroundSize:'cover', backgroundAttachment:'fixed',
    },
    homeHero: {
      background:'linear-gradient(180deg,#7BA7FF 0%,#4A6CDE 60%,#3A56B8 100%)',
      borderRadius:'0 0 32px 32px', padding:'20px 20px 30px',
      position:'relative', overflow:'hidden',
      characterPosition:{position:'absolute',left:0,top:10,width:120,height:160},
      bgIllustPosition:{position:'absolute',right:0,top:0,width:180,opacity:0.3},
    },
    statCard: {
      background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)',
      borderRadius:20, border:'1.5px solid rgba(74,108,222,0.15)',
      boxShadow:'0 4px 20px rgba(74,108,222,0.08)', padding:'16px',
    },
    wordCard: {
      background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)',
      borderRadius:24, border:'2px solid rgba(74,108,222,0.12)',
      boxShadow:'0 8px 32px rgba(74,108,222,0.10)', padding:'24px',
      position:'relative', overflow:'hidden',
      hasIllustration:true,
      illustrationPosition:{position:'absolute',right:8,bottom:8,width:120,opacity:0.9},
    },
    optionButton: {
      background:'#FFFFFF', borderRadius:16,
      border:'1.5px solid rgba(74,108,222,0.15)', padding:'14px 18px',
      marginBottom:10, boxShadow:'0 2px 8px rgba(74,108,222,0.06)',
      transition:'all 0.25s ease',
      letterCircle:{
        width:36,height:36,borderRadius:18,
        background:'rgba(74,108,222,0.08)',border:'2px solid rgba(74,108,222,0.2)',
        color:'#4A6CDE',fontWeight:700,fontSize:14,
      },
      selected:{background:'rgba(74,108,222,0.06)',border:'2px solid #4A6CDE',boxShadow:'0 0 0 3px rgba(74,108,222,0.12)'},
      correct:{background:'#E8F9EE',border:'2px solid #34C759'},
      wrong:{background:'#FFEDED',border:'2px solid #FF3B30'},
    },
    primaryButton: {
      background:'linear-gradient(135deg,#4A6CDE 0%,#5B7FEE 50%,#7BA7FF 100%)',
      borderRadius:20, border:'2px solid rgba(123,167,255,0.4)', padding:'16px 32px',
      color:'#FFFFFF', fontWeight:800, fontSize:16,
      boxShadow:'0 4px 20px rgba(74,108,222,0.35),inset 0 1px 0 rgba(255,255,255,0.2)',
      backgroundOverlay:'radial-gradient(circle at 30% 40%,rgba(255,255,255,0.15) 0%,transparent 50%)',
    },
    secondaryButton: {
      background:'rgba(255,255,255,0.8)', borderRadius:20,
      border:'2px solid rgba(74,108,222,0.25)', padding:'14px 28px',
      color:'#4A6CDE', fontWeight:700, fontSize:15,
      boxShadow:'0 2px 8px rgba(74,108,222,0.08)',
    },
    progressBar: {
      trackHeight:10, trackBorderRadius:5,
      trackBackground:'rgba(74,108,222,0.1)',
      fillBackground:'linear-gradient(90deg,#4A6CDE 0%,#7BA7FF 100%)',
      fillBorderRadius:5, fillBoxShadow:'0 0 10px rgba(74,108,222,0.3)',
      hasMarkers:true, markerSymbol:'✦', markerColor:'#FFFFFF',
    },
    tipCard: {
      background:'linear-gradient(135deg,rgba(74,108,222,0.08) 0%,rgba(123,167,255,0.12) 100%)',
      borderRadius:20, border:'1.5px solid rgba(74,108,222,0.15)', padding:'16px',
      position:'relative',
      petPosition:{position:'absolute',right:8,bottom:-4,width:90},
    },
    resultModal: {
      overlay:'rgba(30,50,120,0.65)',
      container:{
        background:'linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(233,241,255,0.98) 100%)',
        borderRadius:32, border:'3px solid rgba(246,213,140,0.6)',
        boxShadow:'0 0 40px rgba(74,108,222,0.25),0 0 80px rgba(246,213,140,0.15)',
        padding:'0 24px 28px', position:'relative', overflow:'visible', maxWidth:340,
      },
      characterPosition:{position:'absolute',top:-80,left:'50%',transform:'translateX(-50%)',width:200,zIndex:10},
      starsPosition:{paddingTop:130,textAlign:'center'},
      starColor:'#F6D58C', starSize:40,
      continueButton:{
        background:'linear-gradient(135deg,#4A6CDE 0%,#7BA7FF 100%)',
        borderRadius:20,border:'2px solid rgba(123,167,255,0.4)',padding:'14px',
        color:'#FFFFFF',fontWeight:800,boxShadow:'0 4px 20px rgba(74,108,222,0.3)',width:'100%',
      },
      hasCornerDecor:true, cornerDecorType:'ice-crystal',
    },
    bottomNav: {
      background:'linear-gradient(180deg,#4A6CDE 0%,#3A56B8 100%)',
      height:68, borderRadius:'20px 20px 0 0', padding:'6px 0 10px',
      boxShadow:'0 -4px 20px rgba(74,108,222,0.2)',
      activeIconColor:'#F6D58C', inactiveIconColor:'rgba(255,255,255,0.5)',
      activeTextColor:'#F6D58C', inactiveTextColor:'rgba(255,255,255,0.5)',
      centerTab:{
        transform:'translateY(-12px)',
        background:'linear-gradient(135deg,#4A6CDE,#7BA7FF)',
        borderRadius:'50%',width:52,height:52,
        border:'3px solid rgba(255,255,255,0.3)',
        boxShadow:'0 4px 16px rgba(74,108,222,0.3)',
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// Luna 魔法学院
// ═══════════════════════════════════════════════════════════════
const LUNA = {
  id:'luna', name:'Luna', label:'魔法学院', subtitle:'Magic Scholar',
  mascotName:'Luna', petName:'小夜猫',
  font:"'Nunito','Noto Sans SC',system-ui,sans-serif",

  copy: {
    greeting:(name)=>`Hello, ${name}!`,
    greetingSub:'与露娜一起探索魔法词汇！',
    encourageCorrect:'太棒了！又学会一个新魔法词汇！',
    encourageWrong:'💪 再想想哦，魔法需要反复练习～',
    successTitle:'通关成功！', successSub:'太棒了！你真是词汇小魔法师！',
    perfectTitle:'魔法学习完成！', tipLabel:'Luna 记忆法', hintLabel:'Luna 小提示',
    startReview:'开始复习', nextLevel:'下一关', continueChallenge:'继续挑战',
    returnMap:'返回地图', studyMotivation:'坚持就是魔法的力量！',
  },

  colors: {
    primary:'#6B4FD6', primaryLight:'#B79CF6', primaryDark:'#5438B0',
    secondary:'#FFD48A', accent:'#B79CF6',
    bg:'#F3EEFF', bgSoft:'#E9D9FF', bgGlass:'rgba(243,238,255,0.85)',
    bgOverlay:'rgba(50,30,100,0.6)',
    nav:'#6B4FD6', navDark:'#5438B0', navActive:'#FFD48A',
    navInactive:'rgba(255,255,255,0.5)', navText:'rgba(255,255,255,0.6)', navTextActive:'#FFFFFF',
    card:'#FFFFFF', cardGlass:'rgba(255,255,255,0.75)',
    cardBorder:'rgba(107,79,214,0.18)', cardShadow:'0 4px 20px rgba(107,79,214,0.12)',
    text:'#1A1A2E', textSecondary:'#6B5E8A', textMuted:'#B5A8D0', textOnPrimary:'#FFFFFF',
    success:'#34C759', successBg:'#E8F9EE', error:'#FF3B30', errorBg:'#FFEDED',
    warning:'#FF9500', warningBg:'#FFF4E0', gold:'#FFD48A',
    progressBar:'linear-gradient(90deg,#6B4FD6 0%,#B79CF6 100%)',
    progressTrack:'rgba(107,79,214,0.12)', progressGlow:'0 0 8px rgba(107,79,214,0.4)',
    btnPrimary:'linear-gradient(135deg,#6B4FD6 0%,#8B6FE6 50%,#B79CF6 100%)',
    btnPrimaryText:'#FFFFFF', btnPrimaryShadow:'0 4px 16px rgba(107,79,214,0.35)',
    btnSecondary:'rgba(107,79,214,0.08)', btnSecondaryBorder:'rgba(107,79,214,0.3)',
    btnSecondaryText:'#6B4FD6',
    optionBg:'#FFFFFF', optionBorder:'rgba(107,79,214,0.15)',
    optionSelected:'#6B4FD6', optionSelectedBg:'rgba(107,79,214,0.08)',
    optionSelectedBorder:'#6B4FD6', optionSelectedText:'#6B4FD6',
    optionCorrectBg:'#E8F9EE', optionCorrectBorder:'#34C759',
    optionWrongBg:'#FFEDED', optionWrongBorder:'#FF3B30',
    decorStar:'#FFD48A', decorParticle:'rgba(183,156,246,0.4)', decorGlow:'rgba(183,156,246,0.3)',
  },

  assets: {
    heroCharacter: assetPath('luna','hero-character.png'),
    heroCharacterFull: assetPath('luna','hero-character-full.png'),
    heroAvatar: assetPath('luna','hero-avatar.png'),
    petCharacter: assetPath('luna','pet-cat.png'),
    petCharacterSmall: assetPath('luna','pet-cat-small.png'),
    appIcon: assetPath('luna','app-icon.png'),
    themeBadge: assetPath('luna','theme-badge.png'),
    bgPattern: assetPath('luna','bg-pattern.png'),
    bgHero: assetPath('luna','bg-hero.png'),
    bgResult: assetPath('luna','bg-result.png'),
    bgMap: assetPath('luna','bg-map.png'),
    cardCornerTL: assetPath('luna','card-corner-tl.png'),
    cardCornerTR: assetPath('luna','card-corner-tr.png'),
    cardCornerBL: assetPath('luna','card-corner-bl.png'),
    cardCornerBR: assetPath('luna','card-corner-br.png'),
    cardHeaderDecor: assetPath('luna','card-header-decor.png'),
    modalFrame: assetPath('luna','modal-frame.png'),
    modalCharacter: assetPath('luna','modal-character.png'),
    navIcons: {
      home: assetPath('luna','nav-home.png'),
      study: assetPath('luna','nav-study.png'),
      practice: assetPath('luna','nav-practice.png'),
      wordbank: assetPath('luna','nav-wordbank.png'),
      profile: assetPath('luna','nav-profile.png'),
    },
    achievementBadge: assetPath('luna','achievement-badge.png'),
    wordCardIllust: assetPath('luna','word-card-illust.png'),
    tipPet: assetPath('luna','tip-pet.png'),
    successModalBg: assetPath('luna','success-modal-bg.png'),
  },

  ornaments: {
    particleType:'star', particleCount:15, particleColor:'rgba(183,156,246,0.5)',
    headerDecorType:'starTrail', cardBorderStyle:'magic',
    progressDecor:'star', progressEndCap:'✦',
    navCenterHighlight:true, dividerStyle:'star-dots',
  },

  componentStyles: {
    page: {
      background:'#F3EEFF',
      backgroundImage:`url(${assetPath('luna','bg-pattern.png')})`,
      backgroundSize:'cover', backgroundAttachment:'fixed',
    },
    homeHero: {
      background:'linear-gradient(180deg,#B79CF6 0%,#6B4FD6 60%,#5438B0 100%)',
      borderRadius:'0 0 32px 32px', padding:'20px 20px 30px',
      position:'relative', overflow:'hidden',
      characterPosition:{position:'absolute',left:0,top:10,width:120,height:160},
      bgIllustPosition:{position:'absolute',right:0,top:0,width:180,opacity:0.3},
    },
    statCard: {
      background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)',
      borderRadius:20, border:'1.5px solid rgba(107,79,214,0.15)',
      boxShadow:'0 4px 20px rgba(107,79,214,0.08)', padding:'16px',
    },
    wordCard: {
      background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)',
      borderRadius:24, border:'2px solid rgba(107,79,214,0.12)',
      boxShadow:'0 8px 32px rgba(107,79,214,0.10)', padding:'24px',
      position:'relative', overflow:'hidden',
      hasIllustration:true,
      illustrationPosition:{position:'absolute',right:8,bottom:8,width:120,opacity:0.9},
    },
    optionButton: {
      background:'#FFFFFF', borderRadius:16,
      border:'1.5px solid rgba(107,79,214,0.15)', padding:'14px 18px',
      marginBottom:10, boxShadow:'0 2px 8px rgba(107,79,214,0.06)',
      transition:'all 0.25s ease',
      letterCircle:{
        width:36,height:36,borderRadius:18,
        background:'rgba(107,79,214,0.08)',border:'2px solid rgba(107,79,214,0.2)',
        color:'#6B4FD6',fontWeight:700,fontSize:14,
      },
      selected:{background:'rgba(107,79,214,0.06)',border:'2px solid #6B4FD6',boxShadow:'0 0 0 3px rgba(107,79,214,0.12)'},
      correct:{background:'#E8F9EE',border:'2px solid #34C759'},
      wrong:{background:'#FFEDED',border:'2px solid #FF3B30'},
    },
    primaryButton: {
      background:'linear-gradient(135deg,#6B4FD6 0%,#8B6FE6 50%,#B79CF6 100%)',
      borderRadius:20, border:'2px solid rgba(183,156,246,0.4)', padding:'16px 32px',
      color:'#FFFFFF', fontWeight:800, fontSize:16,
      boxShadow:'0 4px 20px rgba(107,79,214,0.35),inset 0 1px 0 rgba(255,255,255,0.2)',
      backgroundOverlay:'radial-gradient(circle at 30% 40%,rgba(255,255,255,0.15) 0%,transparent 50%)',
    },
    secondaryButton: {
      background:'rgba(255,255,255,0.8)', borderRadius:20,
      border:'2px solid rgba(107,79,214,0.25)', padding:'14px 28px',
      color:'#6B4FD6', fontWeight:700, fontSize:15,
      boxShadow:'0 2px 8px rgba(107,79,214,0.08)',
    },
    progressBar: {
      trackHeight:10, trackBorderRadius:5,
      trackBackground:'rgba(107,79,214,0.1)',
      fillBackground:'linear-gradient(90deg,#6B4FD6 0%,#B79CF6 100%)',
      fillBorderRadius:5, fillBoxShadow:'0 0 10px rgba(107,79,214,0.3)',
      hasMarkers:true, markerSymbol:'✦', markerColor:'#FFFFFF',
    },
    tipCard: {
      background:'linear-gradient(135deg,rgba(107,79,214,0.08) 0%,rgba(183,156,246,0.12) 100%)',
      borderRadius:20, border:'1.5px solid rgba(107,79,214,0.15)', padding:'16px',
      position:'relative',
      petPosition:{position:'absolute',right:8,bottom:-4,width:90},
    },
    resultModal: {
      overlay:'rgba(50,30,100,0.65)',
      container:{
        background:'linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(243,238,255,0.98) 100%)',
        borderRadius:32, border:'3px solid rgba(255,212,138,0.6)',
        boxShadow:'0 0 40px rgba(107,79,214,0.25),0 0 80px rgba(255,212,138,0.15)',
        padding:'0 24px 28px', position:'relative', overflow:'visible', maxWidth:340,
      },
      characterPosition:{position:'absolute',top:-80,left:'50%',transform:'translateX(-50%)',width:200,zIndex:10},
      starsPosition:{paddingTop:130,textAlign:'center'},
      starColor:'#FFD48A', starSize:40,
      continueButton:{
        background:'linear-gradient(135deg,#6B4FD6 0%,#B79CF6 100%)',
        borderRadius:20,border:'2px solid rgba(183,156,246,0.4)',padding:'14px',
        color:'#FFFFFF',fontWeight:800,boxShadow:'0 4px 20px rgba(107,79,214,0.3)',width:'100%',
      },
      hasCornerDecor:true, cornerDecorType:'magic-sparkle',
    },
    bottomNav: {
      background:'linear-gradient(180deg,#6B4FD6 0%,#5438B0 100%)',
      height:68, borderRadius:'20px 20px 0 0', padding:'6px 0 10px',
      boxShadow:'0 -4px 20px rgba(107,79,214,0.2)',
      activeIconColor:'#FFD48A', inactiveIconColor:'rgba(255,255,255,0.5)',
      activeTextColor:'#FFD48A', inactiveTextColor:'rgba(255,255,255,0.5)',
      centerTab:{
        transform:'translateY(-12px)',
        background:'linear-gradient(135deg,#6B4FD6,#B79CF6)',
        borderRadius:'50%',width:52,height:52,
        border:'3px solid rgba(255,255,255,0.3)',
        boxShadow:'0 4px 16px rgba(107,79,214,0.3)',
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
export const THEMES = { yuki: YUKI, luna: LUNA };
export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME_ID = 'yuki';
const STORAGE_KEY = 'vm_theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s && THEMES[s]) return s; } catch(e){}
    return DEFAULT_THEME_ID;
  });
  useEffect(() => { try{localStorage.setItem(STORAGE_KEY,themeId)}catch(e){} }, [themeId]);

  const switchTheme = useCallback((id) => { if(THEMES[id]) setThemeId(id); }, []);
  const toggleTheme = useCallback(() => {
    setThemeId(p => { const ids=THEME_IDS; return ids[(ids.indexOf(p)+1)%ids.length]; });
  }, []);

  const skin = THEMES[themeId];
  const C = {
    bg:skin.colors.bg, card:skin.colors.card, primary:skin.colors.primary,
    secondary:skin.colors.secondary, accent:skin.colors.accent, success:skin.colors.success,
    error:skin.colors.error, gold:skin.colors.gold, text:skin.colors.text,
    tl:skin.colors.textMuted, tm:skin.colors.textSecondary, nav:skin.colors.nav,
    mint:skin.colors.successBg, lav:skin.colors.warningBg, peach:skin.colors.bgSoft,
    sky:skin.colors.primaryLight, pink:skin.colors.errorBg,
  };

  return (
    <ThemeContext.Provider value={{
      skin, colors:skin.colors, assets:skin.assets, styles:skin.componentStyles,
      ornaments:skin.ornaments, copy:skin.copy, C, themeId, switchTheme, toggleTheme, allThemes:THEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if(!ctx) throw new Error('useTheme() must be used inside <ThemeProvider>');
  return ctx;
}

export default ThemeContext;
