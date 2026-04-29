// ═══════════════════════════════════════════════════════════════
// ThemedUI.jsx — VocabMaster 雪境学院 公共 UI 组件
// Phase 2: AppShell + FrostCard + FrostButton + FrostProgress + AppBottomNav
// 严格按照 vocabmaster-yuki-ui-guide.md 第 7-9, 15 节实现
// ═══════════════════════════════════════════════════════════════

import { useTheme } from './ThemeContext.jsx';

// ─────────────────────────────────────────
// AppShell — 手机 App 容器
// Guide §7: max-width 430px, 桌面端居中, 移动端满宽
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
        // CSS variables for child components
        '--vm-primary': colors.primary,
        '--vm-primary-light': colors.primaryLight,
        '--vm-bg': colors.bg,
        '--vm-card': colors.cardGlass,
        '--vm-border': colors.cardBorder,
        '--vm-text': colors.text,
        '--vm-text-secondary': colors.textSecondary,
        '--vm-gold': colors.gold,
      }}>
        {children}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// FrostCard — 冰晶卡片
// Guide §8: 半透明白 + 蓝色细边框 + 柔和阴影 + 冰晶角花 + 轻微内发光
// variant: "default" | "hero" | "compact"
// ─────────────────────────────────────────
export function FrostCard({ children, variant = 'default', style = {}, showCorners = false }) {
  const { colors, assets } = useTheme();

  const baseStyle = {
    position: 'relative',
    background: colors.cardGlass,
    border: `1px solid ${colors.cardBorder}`,
    boxShadow: `${colors.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.5)`,
    overflow: 'hidden',
  };

  const variants = {
    default: { borderRadius: 22, padding: '18px 20px' },
    hero: { borderRadius: 26, padding: '22px 24px 24px' },
    compact: { borderRadius: 16, padding: '14px 12px' },
  };

  const cornerSize = variant === 'hero' ? 32 : 24;
  const cornerStyle = (pos) => ({
    position: 'absolute',
    width: cornerSize,
    height: cornerSize,
    objectFit: 'contain',
    pointerEvents: 'none',
    opacity: 0.6,
    ...(pos === 'tl' ? { top: 0, left: 0 } :
      pos === 'tr' ? { top: 0, right: 0, transform: 'scaleX(-1)' } :
      pos === 'bl' ? { bottom: 0, left: 0, transform: 'scaleY(-1)' } :
      { bottom: 0, right: 0, transform: 'scale(-1,-1)' }),
  });

  return (
    <div style={{ ...baseStyle, ...variants[variant], ...style }}>
      {showCorners && (
        <>
          <img src={assets.cardCornerTL} alt="" style={cornerStyle('tl')} onError={e => { e.target.style.display = 'none'; }} />
          <img src={assets.cardCornerTL} alt="" style={cornerStyle('tr')} onError={e => { e.target.style.display = 'none'; }} />
          <img src={assets.cardCornerTL} alt="" style={cornerStyle('bl')} onError={e => { e.target.style.display = 'none'; }} />
          <img src={assets.cardCornerTL} alt="" style={cornerStyle('br')} onError={e => { e.target.style.display = 'none'; }} />
        </>
      )}
      {children}
    </div>
  );
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
// Guide §6/10: 游戏进度条风格, 发光, 圆角, 不是普通 web progress
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
// Guide §15: 半透明玻璃白, 中间雪花按钮突出64px, 不是纯蓝横条
// ─────────────────────────────────────────
export function AppBottomNav({ activeTab, onTabChange, onCenterPress }) {
  const { colors, assets, themeId } = useTheme();

  const tabs = [
    { id: 'today', icon: assets.navIcons?.home, fallback: '🏠', label: '首页' },
    { id: 'words', icon: assets.navIcons?.study, fallback: '📖', label: '学习' },
    { id: '_center', center: true },
    { id: 'drills', icon: assets.navIcons?.wordbank, fallback: '📚', label: '词库' },
    { id: 'settings', icon: assets.navIcons?.profile, fallback: '👤', label: '我的' },
  ];

  const NavIcon = ({ src, fallback, active, size = 22 }) => {
    if (!src) return <span style={{ fontSize: size, filter: active ? 'none' : 'grayscale(0.4) opacity(0.5)' }}>{fallback}</span>;
    return (
      <img
        src={src}
        alt=""
        style={{
          width: size, height: size, objectFit: 'contain',
          filter: active ? 'none' : 'grayscale(0.4) opacity(0.45)',
        }}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'inline'); }}
      />
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
      height: 76,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      borderTop: `1px solid ${colors.cardBorder}`,
      borderRadius: '22px 22px 0 0',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      padding: '0 8px 8px',
      zIndex: 100,
      boxShadow: `0 -4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)`,
    }}>
      {tabs.map(t => {
        if (t.center) {
          return (
            <button key="_center" onClick={onCenterPress} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              marginTop: -22,
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: 30,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 24px ${colors.primary}45`,
                border: '3.5px solid rgba(255,255,255,0.85)',
              }}>
                <img
                  src={assets.navIcons?.practice}
                  alt=""
                  style={{ width: 28, height: 28, objectFit: 'contain' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }}
                />
                <span style={{ display: 'none', fontSize: 26, color: '#fff' }}>
                  {themeId === 'yuki' ? '❄️' : '✦'}
                </span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.primary, marginTop: 2 }}>练习</span>
            </button>
          );
        }

        const active = activeTab === t.id;
        return (
          <button key={t.id} onClick={() => onTabChange(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 0',
            flex: 1,
          }}>
            <NavIcon src={t.icon} fallback={t.fallback} active={active} />
            <span style={{ display: 'none' }}>{t.fallback}</span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: active ? colors.primary : colors.textMuted,
            }}>{t.label}</span>
            {active && <div style={{
              width: 5, height: 5, borderRadius: 3,
              background: colors.primary, marginTop: 1,
            }} />}
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────
// StatCard — 统计小卡
// Guide §10.4: 三列等宽, 数字大, 单位小, 冰晶边框
// ─────────────────────────────────────────
export function StatCard({ label, value, unit, icon }) {
  const { colors } = useTheme();
  return (
    <FrostCard variant="compact" style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 600, marginBottom: 4 }}>
        {icon && <span style={{ fontSize: 10, marginRight: 4, opacity: 0.5 }}>{icon}</span>}
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: colors.text, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
        {value}
        <span style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted, marginLeft: 2 }}>{unit}</span>
      </div>
    </FrostCard>
  );
}

// ─────────────────────────────────────────
// AssetImg — 安全图片加载（onError 隐藏）
// ─────────────────────────────────────────
export function AssetImg({ src, alt = '', style = {}, fallback = null }) {
  if (!src) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      style={{ ...style, objectFit: 'contain' }}
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
}
