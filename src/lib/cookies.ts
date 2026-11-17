import { locale, t } from '../i18n'

export type Cookie = chrome.cookies.Cookie

export interface SiteGroup {
  site: string
  cookies: Cookie[]
}

// 常見的二級網域（例如 com.tw、co.uk），用來判斷主網域要取幾段
const SECOND_LEVEL = new Set(['com', 'net', 'org', 'edu', 'gov', 'co', 'ac', 'or', 'ne', 'go', 'mil', 'idv', 'gob'])

export function hostOf(domain: string): string {
  return domain.replace(/^\./, '').toLowerCase()
}

/** 把 Cookie 網域歸到主網站，例如 .mail.google.com → google.com、www.shopee.tw → shopee.tw */
export function siteOf(domain: string): string {
  const host = hostOf(domain)
  if (!host.includes('.') || /^\d+(\.\d+){3}$/.test(host) || host.includes(':')) return host
  const parts = host.split('.')
  if (parts.length <= 2) return host
  const tld = parts[parts.length - 1]
  const sld = parts[parts.length - 2]
  const take = tld.length === 2 && SECOND_LEVEL.has(sld) ? 3 : 2
  return parts.slice(-take).join('.')
}

export function cookieKey(c: Cookie): string {
  const pk = (c as { partitionKey?: { topLevelSite?: string } }).partitionKey?.topLevelSite ?? ''
  return `${c.storeId}|${c.domain}|${c.path}|${c.name}|${pk}`
}

function cookieUrl(c: Cookie): string {
  return `http${c.secure ? 's' : ''}://${hostOf(c.domain)}${c.path}`
}

export function getAllCookies(): Promise<Cookie[]> {
  return chrome.cookies.getAll({})
}

export async function getSiteCookies(site: string): Promise<Cookie[]> {
  const list = await chrome.cookies.getAll({ domain: site })
  return list.filter((c) => siteOf(c.domain) === site)
}

/** 取得某個網址實際會送出的 Cookie（等同目前分頁使用的 Cookie） */
export function getUrlCookies(url: string): Promise<Cookie[]> {
  return chrome.cookies.getAll({ url })
}

export type SameSite = Cookie['sameSite']

/** 可編輯的 Cookie 欄位，用於新增、編輯與匯入 */
export interface CookieDraft {
  name: string
  value: string
  domain: string
  hostOnly: boolean
  path: string
  secure: boolean
  httpOnly: boolean
  sameSite: SameSite
  session: boolean
  /** 秒（Unix time） */
  expirationDate?: number
  storeId?: string
}

export function draftFromCookie(c: Cookie): CookieDraft {
  return {
    name: c.name,
    value: c.value,
    domain: hostOf(c.domain),
    hostOnly: c.hostOnly,
    path: c.path,
    secure: c.secure,
    httpOnly: c.httpOnly,
    sameSite: c.sameSite,
    session: c.session,
    expirationDate: c.expirationDate,
    storeId: c.storeId,
  }
}

/** 寫入（新增或覆蓋）一個 Cookie，失敗時丟出錯誤 */
export async function setCookie(d: CookieDraft): Promise<void> {
  const host = hostOf(d.domain)
  const path = d.path || '/'
  if (!d.name && !d.value) throw new Error(t('err.nameValueEmpty'))
  if (!host) throw new Error(t('err.domainEmpty'))
  if (d.sameSite === 'no_restriction' && !d.secure) throw new Error(t('err.sameSiteNone'))

  const details: chrome.cookies.SetDetails = {
    url: `http${d.secure ? 's' : ''}://${host}${path.startsWith('/') ? path : `/${path}`}`,
    name: d.name,
    value: d.value,
    path,
    secure: d.secure,
    httpOnly: d.httpOnly,
    sameSite: d.sameSite,
  }
  if (!d.hostOnly) details.domain = host
  if (!d.session && d.expirationDate) details.expirationDate = d.expirationDate
  if (d.storeId) details.storeId = d.storeId

  let result: Cookie | null | undefined
  try {
    result = await chrome.cookies.set(details)
  } catch (err) {
    throw new Error((err as Error).message || t('err.rejected'))
  }
  if (!result) throw new Error(chrome.runtime.lastError?.message ?? t('err.rejected'))
}

/** 以新內容取代舊 Cookie；名稱、網域或路徑改變時會先刪除舊的 */
export async function replaceCookie(old: Cookie, next: CookieDraft): Promise<void> {
  const keyChanged =
    old.name !== next.name || hostOf(old.domain) !== hostOf(next.domain) || old.path !== next.path || old.hostOnly !== next.hostOnly
  if (keyChanged) await removeCookie(old)
  await setCookie(next)
}

export async function removeCookie(c: Cookie): Promise<void> {
  const details: chrome.cookies.CookieDetails = { url: cookieUrl(c), name: c.name, storeId: c.storeId }
  const pk = (c as { partitionKey?: unknown }).partitionKey
  if (pk) (details as { partitionKey?: unknown }).partitionKey = pk
  await chrome.cookies.remove(details)
}

export async function removeCookies(list: Cookie[]): Promise<void> {
  await Promise.all(list.map(removeCookie))
}

export function groupBySite(cookies: Cookie[]): SiteGroup[] {
  const map = new Map<string, Cookie[]>()
  for (const c of cookies) {
    const site = siteOf(c.domain)
    const arr = map.get(site)
    if (arr) arr.push(c)
    else map.set(site, [c])
  }
  return [...map.entries()]
    .map(([site, list]) => ({ site, cookies: list }))
    .sort((a, b) => a.site.localeCompare(b.site))
}

function isLocalHost(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || !host.includes('.') || /\.(local|lan|internal|home)$/.test(host)
}

/**
 * 推測使用者實際造訪的主機名稱，用於網站圖示與開啟網站：
 * 優先用「僅限此主機」的 Cookie 網域（通常就是瀏覽過的網址，例如 www.facebook.com），
 * 其次是 www. 開頭的網域，最後才用主網站本身。
 */
export function primaryHost(site: string, cookies: Cookie[] = []): string {
  const hosts = cookies.filter((c) => c.hostOnly).map((c) => hostOf(c.domain))
  const all = new Set([...hosts, ...cookies.map((c) => hostOf(c.domain))])
  return (
    hosts.find((h) => h === `www.${site}`) ??
    hosts.find((h) => h === site) ??
    (all.has(`www.${site}`) ? `www.${site}` : undefined) ??
    hosts.sort((a, b) => a.length - b.length)[0] ??
    (isLocalHost(site) ? site : `www.${site}`)
  )
}

/** 網站首頁網址：IP 與本機網址用 http，其他用 https */
export function siteHomeUrl(site: string, cookies: Cookie[] = []): string {
  const host = primaryHost(site, cookies)
  return `${isLocalHost(host) ? 'http' : 'https'}://${host}/`
}

/** 從瀏覽器的網站圖示快取取得圖示（傳入 cookies 可對到實際造訪過的主機） */
export function faviconUrl(site: string, size = 32, cookies: Cookie[] = []): string {
  const url = new URL(chrome.runtime.getURL('/_favicon/'))
  url.searchParams.set('pageUrl', siteHomeUrl(site, cookies))
  url.searchParams.set('size', String(size))
  return url.toString()
}

export function formatExpiry(c: Cookie): string {
  if (c.session || !c.expirationDate) return t('common.session')
  return new Date(c.expirationDate * 1000).toLocaleString(locale.value, { hour12: false })
}
