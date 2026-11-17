import { t } from '../i18n'

/** 網站清單的一列（不含任何 Cookie 內容） */
export interface SiteRow {
  site: string
  /** 分類名稱；未分類為空字串 */
  category: string
  /** 分類方式：自動、手動；未分類為空字串 */
  source: 'auto' | 'manual' | ''
  cookies: number
}

export type SiteListFormat = 'csv' | 'json' | 'txt'

export const SITE_LIST_FORMATS: { value: SiteListFormat; label: string; ext: string; mime: string }[] = [
  { value: 'csv', label: 'CSV', ext: 'csv', mime: 'text/csv' },
  { value: 'json', label: 'JSON', ext: 'json', mime: 'application/json' },
  { value: 'txt', label: 'TXT', ext: 'txt', mime: 'text/plain' },
]

export function isSiteListFormat(v: unknown): v is SiteListFormat {
  return v === 'csv' || v === 'json' || v === 'txt'
}

function csvCell(v: string | number): string {
  const s = String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function sourceLabel(source: SiteRow['source']): string {
  return source === 'auto' ? t('sites.auto') : source === 'manual' ? t('sites.manual') : ''
}

/**
 * @param categoryNames 目前所有分類名稱（JSON 會附上，方便使用者或 AI 修改後匯入）
 */
export function serializeSiteList(rows: SiteRow[], format: SiteListFormat, categoryNames: string[] = []): string {
  if (format === 'txt') return rows.map((r) => r.site).join('\n') + '\n'

  if (format === 'json') {
    return JSON.stringify(
      {
        _readme: t('sites.jsonReadme'),
        categories: categoryNames,
        sites: rows.map((r) => ({
          site: r.site,
          category: r.category || null,
          assignedBy: r.source || null,
          cookies: r.cookies,
        })),
      },
      null,
      2,
    )
  }

  // CSV：表頭用目前的介面語言，開頭加 BOM 讓 Excel 正確顯示中日文
  const header = [t('dash.colSite'), t('dash.colCategory'), t('sites.colSource'), t('dash.colCount')]
  const lines = [header, ...rows.map((r) => [r.site, r.category, sourceLabel(r.source), r.cookies])]
  return '﻿' + lines.map((cols) => cols.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
