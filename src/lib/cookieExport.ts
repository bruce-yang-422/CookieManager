import type { Cookie } from './cookies'
import { t } from '../i18n'

export type ExportFormat = 'json' | 'netscape' | 'header'

export const EXPORT_FORMATS: Record<ExportFormat, { ext: string; mime: string }> = {
  json: { ext: 'json', mime: 'application/json' },
  netscape: { ext: 'txt', mime: 'text/plain' },
  header: { ext: 'txt', mime: 'text/plain' },
}

export const FORMAT_LIST: ExportFormat[] = ['json', 'netscape', 'header']

export function formatLabel(f: ExportFormat): string {
  return f === 'json' ? 'JSON' : f === 'netscape' ? 'Netscape' : t('fmt.header')
}

export function formatHint(f: ExportFormat): string {
  return t(f === 'json' ? 'fmt.jsonHint' : f === 'netscape' ? 'fmt.netscapeHint' : 'fmt.headerHint')
}

export function isExportFormat(v: unknown): v is ExportFormat {
  return v === 'json' || v === 'netscape' || v === 'header'
}

function toPlain(c: Cookie) {
  return {
    domain: c.domain,
    expirationDate: c.expirationDate,
    hostOnly: c.hostOnly,
    httpOnly: c.httpOnly,
    name: c.name,
    path: c.path,
    sameSite: c.sameSite,
    secure: c.secure,
    session: c.session,
    storeId: c.storeId,
    value: c.value,
  }
}

function toNetscape(cookies: Cookie[]): string {
  const lines = ['# Netscape HTTP Cookie File', '# Exported by Cookie Manager', '']
  for (const c of cookies) {
    const host = c.hostOnly ? c.domain.replace(/^\./, '') : c.domain.startsWith('.') ? c.domain : `.${c.domain}`
    lines.push(
      [
        (c.httpOnly ? '#HttpOnly_' : '') + host,
        c.hostOnly ? 'FALSE' : 'TRUE',
        c.path,
        c.secure ? 'TRUE' : 'FALSE',
        c.session || !c.expirationDate ? '0' : String(Math.floor(c.expirationDate)),
        c.name,
        c.value,
      ].join('\t'),
    )
  }
  return lines.join('\n') + '\n'
}

function toHeader(cookies: Cookie[]): string {
  return cookies.map((c) => (c.name ? `${c.name}=${c.value}` : c.value)).join('; ')
}

export function serializeCookies(cookies: Cookie[], format: ExportFormat): string {
  if (format === 'json') return JSON.stringify(cookies.map(toPlain), null, 2)
  if (format === 'netscape') return toNetscape(cookies)
  return toHeader(cookies)
}
