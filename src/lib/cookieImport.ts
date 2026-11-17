import type { CookieDraft, SameSite } from './cookies'
import type { ExportFormat } from './cookieExport'
import { t } from '../i18n'

export interface ParseResult {
  format: ExportFormat
  cookies: CookieDraft[]
}

const ONE_YEAR = 365 * 24 * 60 * 60

function normalizeSameSite(v: unknown): SameSite {
  const s = String(v ?? '').toLowerCase()
  if (s === 'lax') return 'lax'
  if (s === 'strict') return 'strict'
  if (s === 'none' || s === 'no_restriction') return 'no_restriction'
  return 'unspecified'
}

function parseJson(text: string, defaultHost: string): CookieDraft[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(t('imp.errJson'))
  }
  const list = Array.isArray(data) ? data : [data]
  return list
    .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object' && 'name' in x)
    .map((x) => {
      const rawDomain = typeof x.domain === 'string' && x.domain ? x.domain : defaultHost
      const expires = Number(x.expirationDate ?? x.expires ?? x.expiry)
      const session = x.session === true || !Number.isFinite(expires) || expires <= 0
      return {
        name: String(x.name ?? ''),
        value: String(x.value ?? ''),
        domain: rawDomain.replace(/^\./, ''),
        hostOnly: typeof x.hostOnly === 'boolean' ? x.hostOnly : !rawDomain.startsWith('.'),
        path: typeof x.path === 'string' && x.path ? x.path : '/',
        secure: x.secure === true,
        httpOnly: x.httpOnly === true,
        sameSite: normalizeSameSite(x.sameSite),
        session,
        expirationDate: session ? undefined : expires,
      }
    })
}

function parseNetscape(text: string): CookieDraft[] {
  const result: CookieDraft[] = []
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim()
    let httpOnly = false
    if (line.startsWith('#HttpOnly_')) {
      httpOnly = true
      line = line.slice('#HttpOnly_'.length)
    } else if (!line || line.startsWith('#')) continue
    const parts = line.split('\t')
    if (parts.length < 7) continue
    const [domain, includeSub, path, secure, expires, name, ...valueParts] = parts
    const exp = Number(expires)
    const session = !Number.isFinite(exp) || exp <= 0
    result.push({
      name,
      value: valueParts.join('\t'),
      domain: domain.replace(/^\./, ''),
      hostOnly: includeSub.toUpperCase() !== 'TRUE',
      path: path || '/',
      secure: secure.toUpperCase() === 'TRUE',
      httpOnly,
      sameSite: 'unspecified',
      session,
      expirationDate: session ? undefined : exp,
    })
  }
  return result
}

function parseHeader(text: string, defaultHost: string, secure: boolean): CookieDraft[] {
  const body = text.trim().replace(/^cookie\s*:\s*/i, '')
  const expirationDate = Math.floor(Date.now() / 1000) + ONE_YEAR
  return body
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const i = pair.indexOf('=')
      return {
        name: i === -1 ? '' : pair.slice(0, i).trim(),
        value: i === -1 ? pair : pair.slice(i + 1).trim(),
        domain: defaultHost,
        hostOnly: true,
        path: '/',
        secure,
        httpOnly: false,
        sameSite: 'lax' as SameSite,
        session: false,
        expirationDate,
      }
    })
}

/**
 * 自動判斷格式並解析。
 * @param defaultHost 沒有指定網域時使用（Header 字串一律使用）
 * @param secure Header 字串匯入時是否設為 Secure（目前頁面為 https 時建議 true）
 */
export function parseCookies(text: string, defaultHost: string, secure: boolean): ParseResult {
  const s = text.trim()
  if (!s) throw new Error(t('imp.errEmpty'))
  let result: ParseResult
  if (s.startsWith('[') || s.startsWith('{')) result = { format: 'json', cookies: parseJson(s, defaultHost) }
  else if (s.includes('\t') || s.startsWith('# Netscape')) result = { format: 'netscape', cookies: parseNetscape(s) }
  else result = { format: 'header', cookies: parseHeader(s, defaultHost, secure) }
  if (!result.cookies.length) throw new Error(t('imp.errNone'))
  return result
}
