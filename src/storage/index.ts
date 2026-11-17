import { t } from '../i18n'

export interface Category {
  id: string
  name: string
  color: string
}

export interface AppData {
  categories: Category[]
  /** 網站 → 分類 id */
  assignments: Record<string, string>
}

const KEY = 'appData'

export const PRESET_COLORS = ['#2080f0', '#18a058', '#f0a020', '#d03050', '#8a5cf6', '#13c2c2', '#eb2f96', '#7c7c7c']

/** 第一次使用時的預設分類，名稱用當下的介面語言 */
function defaultData(): AppData {
  return {
    categories: [
      { id: 'work', name: t('category.work'), color: '#2080f0' },
      { id: 'shopping', name: t('category.shopping'), color: '#f0a020' },
      { id: 'social', name: t('category.social'), color: '#d03050' },
    ],
    assignments: {},
  }
}

export async function loadData(): Promise<AppData> {
  const result = await chrome.storage.local.get(KEY)
  const data = result[KEY] as AppData | undefined
  return data ?? defaultData()
}

export async function saveData(data: AppData): Promise<void> {
  // 先轉成純物件，去掉 Vue 的 reactive proxy
  await chrome.storage.local.set({ [KEY]: JSON.parse(JSON.stringify(data)) })
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
