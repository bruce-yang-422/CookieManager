import { hostOf, siteOf } from './cookies'

/**
 * 網站資料（快取與儲存空間）管理
 * - 清除：使用 chrome.browsingData，可依來源清除，或清除全部並排除來源
 * - 檢視／個別刪除：用 chrome.scripting 在分頁中執行，讀取該來源的 Local Storage、IndexedDB 等
 */

export type DataType =
  | 'cache'
  | 'cacheStorage'
  | 'localStorage'
  | 'indexedDB'
  | 'serviceWorkers'
  | 'fileSystems'
  | 'cookies'

export const DATA_TYPES: DataType[] = [
  'cache',
  'cacheStorage',
  'serviceWorkers',
  'localStorage',
  'indexedDB',
  'fileSystems',
  'cookies',
]

/** 清除後可能讓網站登出或遺失離線資料的類型 */
export const RISKY_TYPES = new Set<DataType>(['cookies', 'localStorage', 'indexedDB'])

export type SinceRange = 'hour' | 'day' | 'week' | 'month' | 'all'
export const SINCE_RANGES: SinceRange[] = ['hour', 'day', 'week', 'month', 'all']

const HOUR = 3600 * 1000
const SINCE_MS: Record<SinceRange, number> = {
  hour: HOUR,
  day: 24 * HOUR,
  week: 7 * 24 * HOUR,
  month: 28 * 24 * HOUR,
  all: 0,
}

function sinceTime(range: SinceRange): number {
  return range === 'all' ? 0 : Date.now() - SINCE_MS[range]
}

function toDataTypeSet(types: DataType[]): chrome.browsingData.DataTypeSet {
  const set: chrome.browsingData.DataTypeSet = {}
  for (const type of types) {
    if (type === 'fileSystems') {
      set.fileSystems = true
      set.webSQL = true
    } else set[type] = true
  }
  return set
}

// ---------- 設定（要清除的類型、排除清單） ----------
export interface SiteDataSettings {
  types: DataType[]
  /** 清除所有網站時要排除的網域或來源（使用者輸入的原文） */
  exclude: string[]
  since: SinceRange
}

const KEY = 'siteDataSettings'

/** 預設只清快取類資料，不會讓網站登出 */
const DEFAULT_SETTINGS: SiteDataSettings = {
  types: ['cache', 'cacheStorage', 'serviceWorkers'],
  exclude: [],
  since: 'all',
}

export async function loadSiteDataSettings(): Promise<SiteDataSettings> {
  const result = await chrome.storage.local.get(KEY)
  const stored = result[KEY] as Partial<SiteDataSettings> | undefined
  return {
    types: (stored?.types ?? DEFAULT_SETTINGS.types).filter((x) => DATA_TYPES.includes(x)),
    exclude: stored?.exclude ?? [],
    since: stored?.since && SINCE_RANGES.includes(stored.since) ? stored.since : DEFAULT_SETTINGS.since,
  }
}

export async function saveSiteDataSettings(patch: Partial<SiteDataSettings>): Promise<void> {
  const next = { ...(await loadSiteDataSettings()), ...patch }
  await chrome.storage.local.set({ [KEY]: JSON.parse(JSON.stringify(next)) })
}

// ---------- 來源 ----------
export interface ParsedOrigins {
  /** 網域（例如 example.com、localhost:3000）或完整來源（例如 https://a.example.com） */
  entries: string[]
  invalid: string[]
}

const DOMAIN_RE = /^(?:[a-z0-9-]+\.)*[a-z0-9-]+(?::\d{1,5})?$/

/** 解析使用者輸入的清單（每行或以逗號、空白分隔），接受網域或網址 */
export function parseOriginInput(text: string): ParsedOrigins {
  const entries = new Set<string>()
  const invalid: string[] = []
  for (const raw of text.split(/[\s,，;；]+/)) {
    const item = raw.trim().toLowerCase().replace(/^\*\./, '')
    if (!item) continue
    if (item.includes('://')) {
      try {
        const url = new URL(item)
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          entries.add(url.origin)
          continue
        }
      } catch {
        /* 下方視為無效 */
      }
      invalid.push(raw.trim())
    } else {
      const domain = item.replace(/^\.+/, '').replace(/\/.*$/, '')
      if (DOMAIN_RE.test(domain)) entries.add(domain)
      else invalid.push(raw.trim())
    }
  }
  return { entries: [...entries], invalid }
}

/**
 * 把網域展開成實際的來源清單（http 與 https 各一）：
 * 網域本身、主網域的 www、以及已知主機中屬於這個網域的子網域。
 * 完整來源（含 ://）則原樣保留，只清除該來源。
 */
export function expandOrigins(entries: string[], knownHosts: Iterable<string> = []): string[] {
  const hosts = [...knownHosts]
  const out = new Set<string>()
  const add = (host: string) => {
    out.add(`https://${host}`)
    out.add(`http://${host}`)
  }
  for (const entry of entries) {
    if (entry.includes('://')) {
      out.add(entry)
      continue
    }
    add(entry)
    // 有指定埠號（例如 localhost:3000）時只清除該主機與埠號
    if (entry.includes(':')) continue
    if (siteOf(entry) === entry && entry.includes('.')) add(`www.${entry}`)
    for (const h of hosts) {
      const name = h.replace(/:\d+$/, '')
      if (name === entry || name.endsWith(`.${entry}`)) add(h)
    }
  }
  return [...out]
}

/** 目前所有分頁中的主機（用來補足只靠 Cookie 找不到的子網域） */
export async function openTabHosts(): Promise<string[]> {
  const tabs = await chrome.tabs.query({})
  const hosts = new Set<string>()
  for (const tab of tabs) {
    try {
      const url = new URL(tab.url ?? '')
      if (url.protocol === 'http:' || url.protocol === 'https:') hosts.add(url.host)
    } catch {
      /* 略過 */
    }
  }
  return [...hosts]
}

/** 從 Cookie 網域取得主機名稱清單 */
export function hostsFromDomains(domains: Iterable<string>): string[] {
  return [...new Set([...domains].map(hostOf))]
}

// ---------- 清除 ----------
/** 清除指定來源的資料。Cookie 會清除整個主網域（瀏覽器限制） */
export async function clearOrigins(origins: string[], types: DataType[]): Promise<void> {
  if (!origins.length || !types.length) return
  await chrome.browsingData.remove({ origins: origins as [string, ...string[]] }, toDataTypeSet(types))
}

/** 清除所有網站的資料，可排除部分來源與限定時間範圍 */
export async function clearAllSites(types: DataType[], excludeOrigins: string[], since: SinceRange): Promise<void> {
  if (!types.length) return
  const options: chrome.browsingData.RemovalOptions = { since: sinceTime(since) }
  if (excludeOrigins.length) options.excludeOrigins = excludeOrigins as [string, ...string[]]
  await chrome.browsingData.remove(options, toDataTypeSet(types))
}

// ---------- 分頁內檢視 ----------
export type StorageArea = 'local' | 'session'

export interface StorageItem {
  key: string
  value: string
}

export interface StorageSnapshot {
  origin: string
  local: StorageItem[]
  session: StorageItem[]
  databases: { name: string; version: number }[]
  caches: { name: string; entries: number }[]
  workers: string[]
  usage: number | null
  quota: number | null
}

/** 在頁面中執行：收集此來源的儲存空間資訊（必須自成一體，不能引用外部變數） */
async function collectSnapshot(): Promise<StorageSnapshot> {
  const read = (s: Storage) => {
    const items: { key: string; value: string }[] = []
    for (let i = 0; i < s.length; i++) {
      const key = s.key(i)
      if (key !== null) items.push({ key, value: s.getItem(key) ?? '' })
    }
    return items.sort((a, b) => a.key.localeCompare(b.key))
  }
  const safe = async <T,>(fn: () => Promise<T> | T, fallback: T): Promise<T> => {
    try {
      return await fn()
    } catch {
      return fallback
    }
  }
  const databases = await safe(
    async () =>
      (await indexedDB.databases())
        .filter((d) => d.name)
        .map((d) => ({ name: d.name as string, version: d.version ?? 0 })),
    [] as { name: string; version: number }[],
  )
  const cacheList = await safe(async () => {
    const names = await caches.keys()
    return Promise.all(
      names.map(async (name) => ({ name, entries: (await (await caches.open(name)).keys()).length })),
    )
  }, [] as { name: string; entries: number }[])
  const workers = await safe(
    async () => (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope),
    [] as string[],
  )
  const estimate = await safe(() => navigator.storage.estimate(), {} as StorageEstimate)
  const empty: { key: string; value: string }[] = []
  return {
    origin: location.origin,
    local: await safe(() => read(localStorage), empty),
    session: await safe(() => read(sessionStorage), empty),
    databases,
    caches: cacheList,
    workers,
    usage: estimate.usage ?? null,
    quota: estimate.quota ?? null,
  }
}

export type TabAction =
  | { kind: 'setItem'; area: StorageArea; key: string; value: string }
  | { kind: 'removeItem'; area: StorageArea; key: string }
  | { kind: 'clearArea'; area: StorageArea }
  | { kind: 'deleteDb'; name: string }
  | { kind: 'deleteCache'; name: string }
  | { kind: 'unregister'; scope: string }

/** 在頁面中執行單一動作；回傳 'ok'、'blocked'（資料庫使用中，稍後才會刪除）或 'error' */
async function performAction(action: TabAction): Promise<'ok' | 'blocked' | 'error'> {
  try {
    const store = (area: StorageArea) => (area === 'local' ? localStorage : sessionStorage)
    switch (action.kind) {
      case 'setItem':
        store(action.area).setItem(action.key, action.value)
        return 'ok'
      case 'removeItem':
        store(action.area).removeItem(action.key)
        return 'ok'
      case 'clearArea':
        store(action.area).clear()
        return 'ok'
      case 'deleteDb':
        return await new Promise((resolve) => {
          const req = indexedDB.deleteDatabase(action.name)
          req.onsuccess = () => resolve('ok')
          req.onerror = () => resolve('error')
          req.onblocked = () => resolve('blocked')
        })
      case 'deleteCache':
        return (await caches.delete(action.name)) ? 'ok' : 'error'
      case 'unregister': {
        const regs = await navigator.serviceWorker.getRegistrations()
        const reg = regs.find((r) => r.scope === action.scope)
        return reg && (await reg.unregister()) ? 'ok' : 'error'
      }
    }
  } catch {
    return 'error'
  }
}

/** 讀取分頁目前來源的儲存空間 */
export async function inspectTab(tabId: number): Promise<StorageSnapshot> {
  const [res] = await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: collectSnapshot })
  if (!res?.result) throw new Error('no result')
  return res.result as StorageSnapshot
}

export async function runTabAction(tabId: number, action: TabAction): Promise<'ok' | 'blocked' | 'error'> {
  const [res] = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: performAction,
    args: [action],
  })
  return (res?.result as 'ok' | 'blocked' | 'error' | undefined) ?? 'error'
}

/** 1536 → "1.5 KB" */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let v = n / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`
}
