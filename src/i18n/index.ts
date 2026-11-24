import { computed, ref, watchEffect } from 'vue'
import {
  dateDeDE, dateEnUS, dateEsES, dateFrFR, dateJaJP, dateKoKR, dateRuRU, dateZhCN, dateZhTW,
  deDE, enUS, esES, frFR, jaJP, koKR, ruRU, zhCN as naiveZhCN, zhTW as naiveZhTW,
} from 'naive-ui'
import zhTW from './locales/zh-TW'
import en from './locales/en'
import ja from './locales/ja'
import zhCN from './locales/zh-CN'
import de from './locales/de'
import ko from './locales/ko'
import fr from './locales/fr'
import ru from './locales/ru'
import es from './locales/es'
import type { Dictionary, MessageKey } from './types'

export type { MessageKey }
export type Locale = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'de' | 'ko' | 'fr' | 'ru' | 'es'
export type LocaleMode = Locale | 'auto'

/** 語言選單，名稱一律用該語言本身的寫法 */
export const LOCALES: { value: Locale; label: string }[] = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ko', label: '한국어' },
  { value: 'fr', label: 'Français' },
  { value: 'ru', label: 'Русский' },
  { value: 'es', label: 'Español' },
]

const DICTIONARIES: Record<Locale, Dictionary> = { 'zh-TW': zhTW, 'zh-CN': zhCN, en, ja, de, ko, fr, ru, es }

const NAIVE_LOCALES = {
  'zh-TW': { locale: naiveZhTW, dateLocale: dateZhTW },
  'zh-CN': { locale: naiveZhCN, dateLocale: dateZhCN },
  en: { locale: enUS, dateLocale: dateEnUS },
  ja: { locale: jaJP, dateLocale: dateJaJP },
  de: { locale: deDE, dateLocale: dateDeDE },
  ko: { locale: koKR, dateLocale: dateKoKR },
  fr: { locale: frFR, dateLocale: dateFrFR },
  ru: { locale: ruRU, dateLocale: dateRuRU },
  es: { locale: esES, dateLocale: dateEsES },
} as const

const KEY = 'cm-locale'

function readMode(): LocaleMode {
  try {
    const v = localStorage.getItem(KEY)
    if (LOCALES.some((item) => item.value === v)) return v as Locale
  } catch {
    /* 無法存取時跟隨瀏覽器 */
  }
  return 'auto'
}

/** 依瀏覽器語言判斷；未支援的語言回退英文。 */
function detect(): Locale {
  const lang = (chrome.i18n?.getUILanguage?.() ?? navigator.language).toLowerCase()
  if (lang.startsWith('zh-cn') || lang.startsWith('zh-sg') || lang.startsWith('zh-hans')) return 'zh-CN'
  if (lang.startsWith('zh')) return 'zh-TW'
  if (lang.startsWith('ja')) return 'ja'
  if (lang.startsWith('de')) return 'de'
  if (lang.startsWith('ko')) return 'ko'
  if (lang.startsWith('fr')) return 'fr'
  if (lang.startsWith('ru')) return 'ru'
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

const mode = ref<LocaleMode>(readMode())

export const localeMode = computed(() => mode.value)
export const locale = computed<Locale>(() => (mode.value === 'auto' ? detect() : mode.value))
export const naiveLocale = computed(() => NAIVE_LOCALES[locale.value])

export function setLocaleMode(m: LocaleMode): void {
  mode.value = m
  try {
    if (m === 'auto') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, m)
  } catch {
    /* 忽略 */
  }
}

// 其他已開啟的頁面（小視窗／管理後台）切換語言時同步更新
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY || e.key === null) mode.value = readMode()
  })
  watchEffect(() => {
    document.documentElement.lang = locale.value
  })
}

/** 某個 key 在所有語言的文字（用來判斷使用者是否改過內建名稱） */
export function allTranslations(key: MessageKey): string[] {
  return Object.values(DICTIONARIES).map((d) => d[key])
}

/**
 * 取得翻譯文字。
 * - 參數：t('key', { name: 'x' }) 會取代 {name}
 * - 單複數：訊息寫成 "單數 | 複數"，依參數 n 是否為 1 選擇
 */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  let msg: string = DICTIONARIES[locale.value][key] ?? zhTW[key] ?? key
  if (msg.includes(' | ')) {
    const [one, other] = msg.split(' | ')
    msg = params?.n === 1 ? one : other
  }
  if (!params) return msg
  return msg.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m))
}
