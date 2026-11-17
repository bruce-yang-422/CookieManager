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

/** 設計規範：顏色、圓角、陰影（淺色／深色兩套） */
const PALETTES = {
  light: {
    bg: '#f3f5f9',
    surface: '#ffffff',
    surface2: '#f5f7fa',
    border: '#e5e8ef',
    text: '#1d2433',
    muted: '#6b7385',
    primary: '#2563eb',
    primaryHover: '#3b74f0',
    primaryPressed: '#1d4fd0',
    primarySoft: 'rgba(37, 99, 235, 0.09)',
    danger: '#e5484d',
    dangerSoft: 'rgba(229, 72, 77, 0.09)',
    hover: 'rgba(15, 23, 42, 0.045)',
    shadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 6px 20px rgba(16, 24, 40, 0.06)',
    shadowLg: '0 2px 6px rgba(16, 24, 40, 0.06), 0 16px 40px rgba(16, 24, 40, 0.10)',
  },
  dark: {
    bg: '#0e1015',
    surface: '#171a21',
    surface2: '#1e222b',
    border: '#2a2f3a',
    text: '#e7e9ee',
    muted: '#9199a8',
    primary: '#5b8cff',
    primaryHover: '#7aa2ff',
    primaryPressed: '#4a78e6',
    primarySoft: 'rgba(91, 140, 255, 0.15)',
    danger: '#ff6b70',
    dangerSoft: 'rgba(255, 107, 112, 0.14)',
    hover: 'rgba(255, 255, 255, 0.05)',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)',
    shadowLg: '0 2px 8px rgba(0, 0, 0, 0.45), 0 18px 48px rgba(0, 0, 0, 0.45)',
  },
}

export const RADIUS = { sm: '6px', md: '8px', lg: '10px', xl: '14px' }

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
      '--cm-hover': p.hover,
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
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', 'Microsoft JhengHei', 'PingFang TC', 'Hiragino Sans', 'Yu Gothic UI', sans-serif",
      },
      Card: { borderRadius: RADIUS.xl },
      Dialog: { borderRadius: RADIUS.xl },
      Drawer: { color: p.bg },
      Popover: { borderRadius: RADIUS.lg },
      Dropdown: { borderRadius: RADIUS.lg, optionHeightMedium: '36px' },
      Menu: {
        borderRadius: RADIUS.md,
        itemHeight: '38px',
        itemColorActive: p.primarySoft,
        itemColorActiveHover: p.primarySoft,
        itemTextColorActive: p.primary,
        itemTextColorActiveHover: p.primary,
        itemColorHover: p.hover,
      },
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
