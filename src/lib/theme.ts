import { computed, ref } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'

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

export function useTheme() {
  const os = useOsTheme()
  const isDark = computed(() => (mode.value === 'auto' ? os.value === 'dark' : mode.value === 'dark'))
  const theme = computed(() => (isDark.value ? darkTheme : null))

  function toggle() {
    mode.value = isDark.value ? 'light' : 'dark'
    try {
      localStorage.setItem(KEY, mode.value)
    } catch {
      /* 忽略 */
    }
  }

  return { isDark, theme, toggle }
}
