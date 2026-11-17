import { computed, ref } from 'vue'
import { darkTheme, useOsTheme, type GlobalThemeOverrides } from 'naive-ui'

type Mode = 'light' | 'dark' | 'auto'
const KEY = 'cm-theme'

function readMode(): Mode {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* 無法存取 localStorage 時跟隨系統 */
  }
  return 'auto'
}

const mode = ref<Mode>(readMode())

/**
 * 設計規範：參考 Apple Human Interface Guidelines 的系統色與 macOS／iOS 介面
 * （淺色／深色兩套）
 */
const PALETTES = {
  light: {
    bg: '#f2f2f7', // iOS systemGroupedBackground
    surface: '#ffffff',
    surface2: '#f5f5f7',
    border: '#e3e3e8',
    text: '#1d1d1f',
    muted: '#6e6e73',
    primary: '#007aff', // systemBlue
    primaryHover: '#1a88ff',
    primaryPressed: '#0062cc',
    primarySoft: 'rgba(0, 122, 255, 0.10)',
    danger: '#ff3b30', // systemRed
    dangerSoft: 'rgba(255, 59, 48, 0.10)',
    success: '#34c759', // systemGreen
    hover: 'rgba(0, 0, 0, 0.04)',
    fill: 'rgba(120, 120, 128, 0.12)', // iOS tertiarySystemFill
    shadow: '0 0.5px 1px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.06)',
    shadowLg: '0 1px 3px rgba(0, 0, 0, 0.08), 0 20px 50px rgba(0, 0, 0, 0.14)',
  },
  dark: {
    bg: '#000000',
    surface: '#1c1c1e', // iOS secondarySystemBackground (dark)
    surface2: '#2c2c2e',
    border: '#38383a',
    text: '#f5f5f7',
    muted: '#98989d',
    primary: '#0a84ff',
    primaryHover: '#409cff',
    primaryPressed: '#0071e3',
    primarySoft: 'rgba(10, 132, 255, 0.18)',
    danger: '#ff453a',
    dangerSoft: 'rgba(255, 69, 58, 0.16)',
    success: '#30d158',
    hover: 'rgba(255, 255, 255, 0.06)',
    fill: 'rgba(118, 118, 128, 0.24)',
    shadow: '0 0.5px 1px rgba(0, 0, 0, 0.5), 0 6px 20px rgba(0, 0, 0, 0.35)',
    shadowLg: '0 1px 3px rgba(0, 0, 0, 0.5), 0 24px 60px rgba(0, 0, 0, 0.6)',
  },
}

export const RADIUS = { sm: '6px', md: '8px', lg: '10px', xl: '14px' }

export const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', 'Hiragino Sans', 'Yu Gothic UI', system-ui, sans-serif"

export function useTheme() {
  const os = useOsTheme()
  const isDark = computed(() => (mode.value === 'auto' ? os.value === 'dark' : mode.value === 'dark'))
  const theme = computed(() => (isDark.value ? darkTheme : null))
  const palette = computed(() => (isDark.value ? PALETTES.dark : PALETTES.light))

  /** 提供給元件 CSS 使用的變數 */
  const cssVars = computed(() => {
    const p = palette.value
    return {
      '--cm-bg': p.bg,
      '--cm-surface': p.surface,
      '--cm-surface-2': p.surface2,
      '--cm-border': p.border,
      '--cm-text': p.text,
      '--cm-muted': p.muted,
      '--cm-primary': p.primary,
      '--cm-primary-soft': p.primarySoft,
      '--cm-danger': p.danger,
      '--cm-danger-soft': p.dangerSoft,
      '--cm-success': p.success,
      '--cm-hover': p.hover,
      '--cm-fill': p.fill,
      '--cm-shadow': p.shadow,
      '--cm-shadow-lg': p.shadowLg,
      '--cm-radius-sm': RADIUS.sm,
      '--cm-radius-md': RADIUS.md,
      '--cm-radius-lg': RADIUS.lg,
      '--cm-radius-xl': RADIUS.xl,
    }
  })

  /** Naive UI 元件的主題覆寫，讓內建元件與設計規範一致 */
  const overrides = computed<GlobalThemeOverrides>(() => {
    const p = palette.value
    return {
      common: {
        primaryColor: p.primary,
        primaryColorHover: p.primaryHover,
        primaryColorPressed: p.primaryPressed,
        primaryColorSuppl: p.primaryHover,
        errorColor: p.danger,
        errorColorHover: p.danger,
        errorColorPressed: p.danger,
        borderRadius: RADIUS.md,
        borderRadiusSmall: RADIUS.sm,
        bodyColor: p.bg,
        cardColor: p.surface,
        modalColor: p.surface,
        popoverColor: p.surface,
        tableColor: p.surface,
        textColorBase: p.text,
        borderColor: p.border,
        dividerColor: p.border,
        successColor: p.success,
        successColorHover: p.success,
        successColorPressed: p.success,
        fontFamily: FONT_FAMILY,
      },
      Card: { borderRadius: RADIUS.xl },
      Dialog: { borderRadius: RADIUS.xl },
      Drawer: { color: p.bg },
      Popover: { borderRadius: RADIUS.lg },
      Dropdown: { borderRadius: RADIUS.lg, optionHeightMedium: '36px' },
      // macOS 側邊欄：選中項目為強調色底、白色文字與圖示
      Menu: {
        borderRadius: RADIUS.md,
        itemHeight: '34px',
        itemColorActive: p.primary,
        itemColorActiveHover: p.primary,
        itemTextColorActive: '#ffffff',
        itemTextColorActiveHover: '#ffffff',
        itemIconColorActive: '#ffffff',
        itemIconColorActiveHover: '#ffffff',
        itemColorHover: p.hover,
      },
      // iOS 開關
      Switch: { railColorActive: p.success },
      DataTable: {
        borderRadius: RADIUS.lg,
        thColor: p.surface2,
        thColorHover: p.surface2,
        tdColor: p.surface,
        tdColorHover: p.surface2,
        borderColor: p.border,
        thFontWeight: '600',
      },
      Input: { borderRadius: RADIUS.md },
      Select: { peers: { InternalSelection: { borderRadius: RADIUS.md } } },
      Button: { borderRadiusMedium: RADIUS.md, borderRadiusSmall: RADIUS.md, borderRadiusTiny: RADIUS.sm },
      Tag: { borderRadius: RADIUS.sm },
      Message: { borderRadius: RADIUS.lg },
    }
  })

  function toggle() {
    mode.value = isDark.value ? 'light' : 'dark'
    try {
      localStorage.setItem(KEY, mode.value)
    } catch {
      /* 忽略 */
    }
  }

  return { isDark, theme, palette, cssVars, overrides, toggle }
}
