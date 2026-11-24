import { locale, t } from '../i18n'
import { siteOf } from './cookies'

/** 匯入檔中的一列：網站與目標分類名稱（null＝未分類） */
export interface ImportedRow {
  site: string
  category: string | null
}

/** 各語言的「未分類」寫法，匯入時都視為未分類 */
const UNCATEGORIZED_NAMES = new Set(['未分類', 'uncategorized', '(uncategorized)', '（未分類）', 'none', 'null'])

/**
 * 讀取檔案文字：先用 UTF-8，失敗時改用介面語言常見的舊編碼
 * （Excel 直接存「CSV」時，繁中 Windows 為 Big5、日文為 Shift_JIS）
 */
export async function readTextFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    const legacy = locale.value === 'ja' ? 'shift_jis' : locale.value === 'zh-TW' ? 'big5' : locale.value === 'zh-CN' ? 'gb18030' : 'windows-1252'
    text = new TextDecoder(legacy).decode(buf)
  }
  return text.replace(/^﻿/, '')
}

/** 簡易 CSV 解析（支援引號、引號內的逗號與換行） */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',' || ch === ';' || ch === '\t') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim()))
}

/** 看起來像網域或 IP（用來判斷第一列是不是表頭） */
function looksLikeSite(s: string): boolean {
  return /^[a-z0-9.-]+\.[a-z0-9-]+$/i.test(s) || /^\d{1,3}(\.\d{1,3}){3}$/.test(s) || s === 'localhost'
}

function normalizeCategory(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  if (!s || UNCATEGORIZED_NAMES.has(s.toLowerCase())) return null
  return s
}

/** 轉成管理後台使用的主網站名稱，例如 https://www.example.com/a → example.com */
function normalizeSite(v: unknown): string {
  const host = String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^\./, '')
  return host ? siteOf(host) : ''
}

/** 解析匯出的網站清單（CSV 或 JSON），格式不對時丟出錯誤 */
export function parseSiteList(text: string): ImportedRow[] {
  const s = text.trim()
  let rows: ImportedRow[] = []

  if (s.startsWith('{') || s.startsWith('[')) {
    let json: unknown
    try {
      json = JSON.parse(s)
    } catch {
      throw new Error(t('siteImport.errFormat'))
    }
    const list = Array.isArray(json) ? json : (json as { sites?: unknown })?.sites
    if (!Array.isArray(list)) throw new Error(t('siteImport.errFormat'))
    rows = list
      .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object' && 'site' in x)
      .map((x) => ({ site: normalizeSite(x.site), category: normalizeCategory(x.category) }))
  } else {
    const table = parseCsv(s)
    // 第一列不像網站名稱時視為表頭
    const body = table.length && !looksLikeSite(normalizeSite(table[0][0])) ? table.slice(1) : table
    rows = body.map((r) => ({ site: normalizeSite(r[0]), category: normalizeCategory(r[1]) }))
  }

  rows = rows.filter((r) => looksLikeSite(r.site))
  if (!rows.length) throw new Error(t('siteImport.errFormat'))
  return rows
}
