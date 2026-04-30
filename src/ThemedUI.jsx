// ═══════════════════════════════════════════════════════════════
// ThemedUI.jsx — VocabMaster 雪境学院 公共 UI 组件
// Phase 2: AppShell + FrostCard + FrostButton + FrostProgress + AppBottomNav
// 严格按照 vocabmaster-yuki-ui-guide.md 第 7-9, 15 节实现
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useTheme } from './ThemeContext.jsx';

// ─────────────────────────────────────────
// 主题色板常量(局部 token,与 ThemeContext 不冲突)
// ─────────────────────────────────────────
const IVORY = '#FDFBF7';            // 象牙白卡底
const IVORY_GLASS = 'rgba(253,251,247,0.78)';
const GOLD_BORDER = 'rgba(232,220,192,0.85)';   // 金色细边
const GOLD_BORDER_SOFT = 'rgba(232,220,192,0.55)';

// ─────────────────────────────────────────
// 角花 SVG(替代缺失的 PNG,效果稳定)
// ─────────────────────────────────────────
const CornerOrnament = ({ size = 28, color = '#7BA7FF', goldColor = '#E8DCC0', position = 'tl', opacity = 0.7 }) => {
  const transforms = {
    tl: 'none',
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1,-1)',
  };
  const pos = {
    tl: { top: 6, left: 6 },
    tr: { top: 6, right: 6 },
    bl: { bottom: 6, left: 6 },
    br: { bottom: 6, right: 6 },
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{
        position: 'absolute',
        ...pos[position],
        transform: transforms[position],
        pointerEvents: 'none',
        opacity,
      }}
      aria-hidden="true"
    >
      <path d="M 4 14 L 4 6 Q 4 4 6 4 L 14 4" fill="none" stroke={goldColor} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 7 12 L 7 8 Q 7 7 8 7 L 12 7" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <circle cx="6" cy="6" r="1.4" fill={goldColor} />
      <path d="M 14 4 L 16 2 M 14 4 L 12 2 M 14 4 L 16 6" stroke={goldColor} strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
};

// ─────────────────────────────────────────
// 散落雪花层(背景纹理增强)
// ─────────────────────────────────────────
const SnowflakeLayer = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 430 900"
    preserveAspectRatio="xMidYMid slice"
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      opacity: 0.55,
    }}
    aria-hidden="true"
  >
    <defs>
      <g id="sf">
        <path d="M0,-6 L0,6 M-6,0 L6,0 M-4.2,-4.2 L4.2,4.2 M-4.2,4.2 L4.2,-4.2"
              stroke="#7BA7FF" strokeWidth="0.9" strokeLinecap="round" />
      </g>
      <g id="sf2">
        <circle r="2" fill="#B7CDFF" />
      </g>
    </defs>
    <use href="#sf" x="30" y="60" opacity="0.5" />
    <use href="#sf" x="380" y="120" opacity="0.4" transform="translate(380 120) scale(1.4) translate(-380 -120)" />
    <use href="#sf" x="60" y="240" opacity="0.35" />
    <use href="#sf" x="350" y="320" opacity="0.5" transform="translate(350 320) scale(0.8) translate(-350 -320)" />
    <use href="#sf" x="20" y="440" opacity="0.3" transform="translate(20 440) scale(1.3) translate(-20 -440)" />
    <use href="#sf" x="400" y="520" opacity="0.45" />
    <use href="#sf" x="40" y="640" opacity="0.4" />
    <use href="#sf" x="370" y="720" opacity="0.5" transform="translate(370 720) scale(1.2) translate(-370 -720)" />
    <use href="#sf" x="80" y="820" opacity="0.35" />
    <use href="#sf2" x="200" y="100" opacity="0.5" />
    <use href="#sf2" x="120" y="180" opacity="0.4" />
    <use href="#sf2" x="320" y="260" opacity="0.5" />
    <use href="#sf2" x="180" y="380" opacity="0.4" />
    <use href="#sf2" x="280" y="460" opacity="0.5" />
    <use href="#sf2" x="100" y="560" opacity="0.4" />
    <use href="#sf2" x="340" y="660" opacity="0.5" />
    <use href="#sf2" x="220" y="760" opacity="0.4" />
  </svg>
);

// ─────────────────────────────────────────
// AppShell — 手机 App 容器
// Guide §7: max-width 430px, 桌面端居中, 移动端满宽
// 增强: 加可见雪花散落层
// ─────────────────────────────────────────
export function AppShell({ children }) {
  const { colors, assets } = useTheme();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      background: `radial-gradient(circle at top, rgba(255,255,255,.8), transparent 45%), url('${assets.bgPattern}'), linear-gradient(180deg, #eef5ff 0%, #f8fbff 100%)`,
      backgroundSize: 'cover',
    }}>
      <main style={{
        position: 'relative',
        width: '100%',
        maxWidth: 430,
        minHeight: '100vh',
        overflow: 'hidden',
        background: `linear-gradient(180deg, rgba(255,255,255,.55), rgba(233,241,255,.78)), url('${assets.bgPattern}')`,
        backgroundSize: 'cover',
        fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
        color: colors.text,
        '--vm-primary': colors.primary,
        '--vm-primary-light': colors.primaryLight,
        '--vm-bg': colors.bg,
        '--vm-card': IVORY,
        '--vm-card-glass': IVORY_GLASS,
        '--vm-border': colors.cardBorder,
        '--vm-gold-border': GOLD_BORDER,
        '--vm-text': colors.text,
        '--vm-text-secondary': colors.textSecondary,
        '--vm-gold': colors.gold,
      }}>
        <SnowflakeLayer />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// FrostCard — 冰晶卡片
// Guide §8: 半透明象牙白 + 金色细外边 + 蓝色内边 + 柔和阴影 + 冰晶角花
// variant: "default" | "hero" | "compact"
// 角花优先使用 ThemeContext 中的 PNG 资产 (cardCornerTL/TR/BL/BR), 失败 fallback 到 SVG CornerOrnament
// 透传所有未知 props (className / role / aria-label / onMouseEnter 等)
// ─────────────────────────────────────────
export function FrostCard({
  children,
  variant = 'default',
  style = {},
  showCorners = false,
  className = '',
  ...props
}) {
  const { colors, assets } = useTheme();

  const baseStyle = {
    position: 'relative',
    background: IVORY_GLASS,
    border: `1px solid ${GOLD_BORDER}`,
    boxShadow: `${colors.cardShadow}, inset 0 0 0 1px ${colors.cardBorder}, inset 0 1px 0 rgba(255,255,255,0.6)`,
    overflow: 'hidden',
    backdropFilter: 'blur(8px)',
    cursor: props.onClick ? 'pointer' : undefined,
  };

  const variants = {
    default: { borderRadius: 22, padding: '18px 20px' },
    hero: { borderRadius: 26, padding: '22px 24px 24px' },
    compact: { borderRadius: 18, padding: '14px 12px' },
  };

  const cornerSize = variant === 'hero' ? 36 : variant === 'compact' ? 22 : 28;

  // 单个角花: 优先用 PNG 资产, 失败时切换到 SVG fallback
  const Corner = ({ position }) => {
    const pngSrc = {
      tl: assets.cardCornerTL,
      tr: assets.cardCornerTR,
      bl: assets.cardCornerBL,
      br: assets.cardCornerBR,
    }[position];

    const pos = {
      tl: { top: 4, left: 4 },
      tr: { top: 4, right: 4 },
      bl: { bottom: 4, left: 4 },
      br: { bottom: 4, right: 4 },
    }[position];

    // 用 ref 跟踪 PNG 加载是否失败,失败时切到 SVG
    return (
      <CornerSlot pngSrc={pngSrc} position={position} pos={pos} size={cornerSize} primaryColor={colors.primary} />
    );
  };

  return (
    <div
      className={className}
      style={{ ...baseStyle, ...variants[variant], ...style }}
      {...props}
    >
      {showCorners && (
        <>
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />
        </>
      )}
      {children}
    </div>
  );
}

// 角花槽位: PNG 优先, 失败回退 SVG
function CornerSlot({ pngSrc, position, pos, size, primaryColor }) {
  const [pngFailed, setPngFailed] = useState(false);

  if (pngSrc && !pngFailed) {
    return (
      <img
        src={pngSrc}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: size,
          height: size,
          objectFit: 'contain',
          pointerEvents: 'none',
          opacity: 0.85,
          background: 'transparent',
          ...pos,
        }}
        onError={(e) => {
          if (typeof console !== 'undefined') {
            console.warn('[FrostCard corner missing, fallback to SVG]', pngSrc);
          }
          setPngFailed(true);
        }}
      />
    );
  }
  // SVG fallback
  return <CornerOrnament size={size} color={primaryColor} position={position} />;
}

// ─────────────────────────────────────────
// FrostButton — 冰晶按钮
// Guide §9: primary = 蓝色渐变+白字+金边+发光, secondary = 白半透明+蓝边+蓝字
// ─────────────────────────────────────────
export function FrostButton({ children, variant = 'primary', onClick, icon, style = {}, disabled = false }) {
  const { colors, styles: themeStyles } = useTheme();

  const base = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    cursor: disabled ? 'default' : 'pointer',
    border: 'none',
    fontWeight: 800,
    fontSize: 16,
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    width: '100%',
  };

  const variants = {
    primary: {
      background: themeStyles.primaryButton.background,
      color: '#FFFFFF',
      borderRadius: 22,
      padding: '16px 24px',
      border: `1.5px solid rgba(246,213,140,.5)`,
      boxShadow: themeStyles.primaryButton.boxShadow,
    },
    secondary: {
      background: 'rgba(255,255,255,0.75)',
      color: colors.primary,
      borderRadius: 22,
      padding: '14px 24px',
      border: `2px solid ${colors.cardBorder}`,
      boxShadow: `0 2px 8px ${colors.primary}08`,
    },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// ─────────────────────────────────────────
// FrostProgress — 冰晶进度条
// Guide §6/10: 游戏进度条风格, 发光, 圆角
// ─────────────────────────────────────────
export function FrostProgress({ value = 0, max = 100, height = 8, showLabel = false, label = '' }) {
  const { colors } = useTheme();
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div style={{ flex: 1 }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 12, color: colors.primary, fontWeight: 700 }}>{value}/{max}</span>
        </div>
      )}
      <div style={{
        height,
        borderRadius: height / 2,
        background: colors.progressTrack,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: height / 2,
          background: colors.progressBar,
          boxShadow: pct > 0 ? colors.progressGlow : 'none',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// AppBottomNav — 底部导航
// Guide §15: 半透明象牙白, 中间雪花按钮突出 ~68px
// ─────────────────────────────────────────
export function AppBottomNav({ activeTab, onTabChange, onCenterPress }) {
  const { colors, assets, themeId } = useTheme();

  const tabs = [
    { id: 'today',    icon: assets.navIcons?.home,     iconId: 'home',     label: '首页' },
    { id: 'drills',   icon: assets.navIcons?.study,    iconId: 'study',    label: '学习' },
    { id: '_center',  center: true,                                                       label: '练习' },
    { id: 'words',    icon: assets.navIcons?.wordbank, iconId: 'wordbank', label: '词库' },
    { id: 'settings', icon: assets.navIcons?.profile,  iconId: 'profile',  label: '我的' },
  ];

  // 内联 SVG 图标库 — fallback 永远可见
  const InlineIcon = ({ id, color, size = 24 }) => {
    const stroke = color;
    const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (id === 'home') return (<svg {...common}><path d="M3 11 L12 3 L21 11 V20 a1 1 0 0 1 -1 1 H15 V14 H9 V21 H4 a1 1 0 0 1 -1 -1 Z" /></svg>);
    if (id === 'study') return (<svg {...common}><path d="M4 5 a2 2 0 0 1 2 -2 H11 V20 H6 a2 2 0 0 1 -2 -2 Z" /><path d="M13 3 H18 a2 2 0 0 1 2 2 V18 a2 2 0 0 1 -2 2 H13 Z" /></svg>);
    if (id === 'wordbank') return (<svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></svg>);
    if (id === 'profile') return (<svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21 a8 8 0 0 1 16 0" /></svg>);
    return null;
  };

  const NavIcon = ({ src, iconId, active, size = 24 }) => {
    const inactiveColor = colors.textMuted;
    const activeColor = colors.primary;
    const color = active ? activeColor : inactiveColor;
    // 优先 PNG, 失败回退 SVG (始终可见)
    return (
      <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
        {src && (
          <img
            src={src}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: size, height: size, objectFit: 'contain',
              filter: active ? 'none' : 'grayscale(0.5) opacity(0.55)',
            }}
            onError={e => {
              if (typeof console !== 'undefined') {
                console.warn('[NavIcon missing]', src);
              }
              e.target.style.display = 'none';
              const sibling = e.target.nextSibling;
              if (sibling) sibling.style.display = 'inline-flex';
            }}
          />
        )}
        <span style={{
          position: 'absolute', inset: 0,
          display: src ? 'none' : 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <InlineIcon id={iconId} color={color} size={size} />
        </span>
      </span>
    );
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      height: 80,
      background: 'rgba(253,251,247,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${GOLD_BORDER_SOFT}`,
      borderRadius: '24px 24px 0 0',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      padding: '0 8px 10px',
      zIndex: 100,
      boxShadow: `0 -6px 28px rgba(74,108,222,0.08), inset 0 1px 0 rgba(255,255,255,0.7)`,
    }}>
      {tabs.map(t => {
        if (t.center) {
          return (
            <button key="_center" onClick={onCenterPress} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              marginTop: -28,
            }}>
              <div style={{
                width: 68, height: 68, borderRadius: 34,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 28px ${colors.primary}55, inset 0 2px 0 rgba(255,255,255,0.25)`,
                border: '4px solid rgba(255,255,255,0.95)',
              }}>
                {/* 内联雪花 SVG — 不依赖外部 PNG, 永远显示 */}
                {themeId === 'yuki' ? (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
                    <path d="M 12 5 L 10 7 M 12 5 L 14 7 M 12 19 L 10 17 M 12 19 L 14 17" />
                    <path d="M 5 12 L 7 10 M 5 12 L 7 14 M 19 12 L 17 10 M 19 12 L 17 14" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
                    <path d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z" />
                    <circle cx="12" cy="11" r="1.5" />
                  </svg>
                )}
              </div>
            </button>
          );
        }

        const active = activeTab === t.id;
        return (
          <button key={t.id} onClick={() => onTabChange(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 0',
            flex: 1,
          }}>
            <NavIcon src={t.icon} iconId={t.iconId} active={active} />
            <span style={{
              fontSize: 11, fontWeight: active ? 800 : 600,
              color: active ? colors.primary : colors.textMuted,
              letterSpacing: '0.02em',
            }}>{t.label}</span>
            <div style={{
              width: 5, height: 5, borderRadius: 3,
              background: active ? colors.primary : 'transparent',
              marginTop: 1,
              transition: 'background 0.2s ease',
            }} />
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────
// StatCard — 统计小卡
// Guide §10.4: 三列等宽, 数字大, 单位小, 象牙白底 + 金边
// ─────────────────────────────────────────
export function StatCard({ label, value, unit, icon }) {
  const { colors } = useTheme();
  return (
    <div style={{
      flex: 1,
      position: 'relative',
      background: IVORY,
      border: `1px solid ${GOLD_BORDER}`,
      borderRadius: 18,
      padding: '12px 8px 14px',
      textAlign: 'center',
      boxShadow: `0 2px 10px rgba(74,108,222,0.06), inset 0 0 0 1px ${colors.cardBorder}, inset 0 1px 0 rgba(255,255,255,0.6)`,
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 600, marginBottom: 4, letterSpacing: '0.02em' }}>
        {icon && <span style={{ fontSize: 10, marginRight: 3, color: colors.primaryLight }}>{icon}</span>}
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: colors.primary, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {value}
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// AssetImg — 安全图片加载
// background: transparent 防 PNG 透明区域显示棋盘格
// 失败时 console.warn 输出实际 src,便于诊断 404
// 同时透传 className / onClick 等 props,onError 可被覆盖
// ─────────────────────────────────────────
export function AssetImg({ src, alt = '', style = {}, fallback = null, onError, className = '', ...props }) {
  if (!src) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ background: 'transparent', ...style, objectFit: style.objectFit || 'contain' }}
      onError={(e) => {
        if (typeof console !== 'undefined') {
          console.warn('[AssetImg missing]', src);
        }
        e.currentTarget.style.display = 'none';
        if (typeof onError === 'function') onError(e);
      }}
      {...props}
    />
  );
}
