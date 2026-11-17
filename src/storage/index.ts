import { t } from '../i18n'
import { BUILTIN_CATEGORIES, autoCategoryOf } from '../lib/autoCategory'

export interface Category {
  id: string
  name: string
  color: string
}

export interface AppData {
  categories: Category[]
  /** 網站 → 分類 id（使用者手動指定；值為 NONE 代表手動設為未分類） */
  assignments: Record<string, string>
  /** 是否依網域自動分類（預設開啟） */
  autoCategorize?: boolean
  /** 資料格式版本，用於升級舊資料 */
  version?: number
}

const KEY = 'appData'
const DATA_VERSION = 2

/** 手動設為「未分類」的標記，避免被自動分類覆蓋 */
export const NONE = '__none__'

/** Apple 系統色（iOS／macOS），依色相排列 */
export const PRESET_COLORS = [
  '#ff3b30', // Red
  '#ff9500', // Orange
  '#ffcc00', // Yellow
  '#34c759', // Green
  '#00c7be', // Mint
  '#30b0c7', // Teal
  '#32ade6', // Cyan
  '#007aff', // Blue
  '#5856d6', // Indigo
  '#af52de', // Purple
  '#ff2d55', // Pink
  '#a2845e', // Brown
  '#8e8e93', // Gray
]

function builtinCategories(): Category[] {
  return BUILTIN_CATEGORIES.map((b) => ({ id: b.id, name: t(b.nameKey), color: b.color }))
}

/** 第一次使用時的預設資料：內建基本分類，名稱用當下的介面語言 */
function defaultData(): AppData {
  return { categories: builtinCategories(), assignments: {}, autoCategorize: true, version: DATA_VERSION }
}

/** 舊版資料升級：補上缺少的內建分類，保留使用者原有的分類與設定 */
function migrate(data: AppData): AppData {
  if ((data.version ?? 1) >= DATA_VERSION) return data
  const existing = new Set(data.categories.map((c) => c.id))
  const missing = builtinCategories().filter((c) => !existing.has(c.id))
  return {
    ...data,
    categories: [...data.categories, ...missing],
    autoCategorize: data.autoCategorize ?? true,
    version: DATA_VERSION,
  }
}

export async function loadData(): Promise<AppData> {
  const result = await chrome.storage.local.get(KEY)
  const stored = result[KEY] as AppData | undefined
  if (!stored) return defaultData()
  const data = migrate(stored)
  if (data !== stored) await saveData(data)
  return data
}

export async function saveData(data: AppData): Promise<void> {
  // 先轉成純物件，去掉 Vue 的 reactive proxy
  await chrome.storage.local.set({ [KEY]: JSON.parse(JSON.stringify(data)) })
}

/**
 * 取得網站實際的分類：手動指定優先，其次是自動分類。
 * auto 為 true 代表這是自動判斷的結果。
 */
export function resolveCategory(data: AppData, site: string): { id: string | null; auto: boolean } {
  const ids = new Set(data.categories.map((c) => c.id))
  const manual = data.assignments[site]
  if (manual === NONE) return { id: null, auto: false }
  if (manual && ids.has(manual)) return { id: manual, auto: false }
  if (data.autoCategorize !== false) {
    const auto = autoCategoryOf(site)
    if (auto && ids.has(auto)) return { id: auto, auto: true }
  }
  return { id: null, auto: false }
}

/** 其他頁面（popup／後台）改了資料時通知 */
export function onDataChanged(cb: (data: AppData) => void): () => void {
  const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area === 'local' && changes[KEY]?.newValue) cb(changes[KEY].newValue as AppData)
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}

export function newId(): string {
  return crypto.randomUUID()
}
