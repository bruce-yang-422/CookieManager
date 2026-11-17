import { NONE, type AppData, type Category } from '../storage'
import { downloadText, today } from './download'
import { t } from '../i18n'

const APP_ID = 'cookie-manager'
const FORMAT_VERSION = 1

interface BackupFile {
  app: typeof APP_ID
  version: number
  exportedAt: string
  categories: Category[]
  assignments: Record<string, string>
}

/** 下載分類資料（只含分類與網站對應，不含 Cookie 內容） */
export function exportData(data: AppData): void {
  const file: BackupFile = {
    app: APP_ID,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    categories: data.categories,
    assignments: data.assignments,
  }
  downloadText(`cookie-manager-backup-${today()}.json`, JSON.stringify(file, null, 2), 'application/json')
}

/** 讀取並驗證備份檔，格式不對時丟出錯誤訊息 */
export async function parseBackup(file: File): Promise<AppData> {
  let json: unknown
  try {
    json = JSON.parse(await file.text())
  } catch {
    throw new Error(t('backup.errJson'))
  }
  const f = json as Partial<BackupFile>
  if (f?.app !== APP_ID) throw new Error(t('backup.errApp'))
  if (!Array.isArray(f.categories) || typeof f.assignments !== 'object' || f.assignments === null) {
    throw new Error(t('backup.errIncomplete'))
  }
  const categories = f.categories.filter(
    (c): c is Category =>
      !!c && typeof c.id === 'string' && typeof c.name === 'string' && typeof c.color === 'string',
  )
  const ids = new Set(categories.map((c) => c.id))
  const assignments: Record<string, string> = {}
  for (const [site, id] of Object.entries(f.assignments)) {
    if (typeof id === 'string' && (ids.has(id) || id === NONE)) assignments[site] = id
  }
  return { categories, assignments }
}

/** 合併：同 id 的分類以匯入的為準，其餘保留；網站對應以匯入的為準；保留目前的設定 */
export function mergeData(current: AppData, incoming: AppData): AppData {
  const byId = new Map(current.categories.map((c) => [c.id, c]))
  for (const c of incoming.categories) byId.set(c.id, c)
  return {
    ...current,
    categories: [...byId.values()],
    assignments: { ...current.assignments, ...incoming.assignments },
  }
}

/** 取代：使用備份的分類與網站對應，保留目前的設定（自動分類開關、資料版本） */
export function replaceData(current: AppData, incoming: AppData): AppData {
  return { ...current, categories: incoming.categories, assignments: incoming.assignments }
}
