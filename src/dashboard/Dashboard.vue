<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  NButton,
  NDataTable,
  NDropdown,
  NInput,
  NMenu,
  NPopconfirm,
  NSelect,
  useDialog,
  useMessage,
  type DataTableColumns,
  type DropdownOption,
  type MenuOption,
} from 'naive-ui'
import { faviconUrl, getAllCookies, groupBySite, removeCookies, type Cookie, type SiteGroup } from '../lib/cookies'
import {
  NONE,
  PRESET_COLORS,
  newId,
  loadData,
  onDataChanged,
  resolveCategory,
  saveData,
  type AppData,
  type Category,
} from '../storage'
import { useTheme } from '../lib/theme'
import { exportData, mergeData, parseBackup, replaceData } from '../lib/backup'
import { t } from '../i18n'
import Icon from '../lib/Icon.vue'
import LanguageSelect from '../lib/LanguageSelect.vue'
import CategoryPill from '../lib/CategoryPill.vue'
import CookieDrawer from './components/CookieDrawer.vue'
import CategoryModal from './components/CategoryModal.vue'
import ExportModal from './components/ExportModal.vue'
import SiteListModal from './components/SiteListModal.vue'
import type { SiteRow } from '../lib/siteListExport'
import { parseSiteList, readTextFile } from '../lib/siteListImport'

const UNCATEGORIZED = NONE
const ALL = '__all__'

const message = useMessage()
const dialog = useDialog()
const { isDark, palette, toggle: toggleTheme } = useTheme()

const cookies = ref<Cookie[]>([])
const data = ref<AppData>({ categories: [], assignments: {} })
const loading = ref(true)
const activeCat = ref<string>(ALL)
const keyword = ref('')
const checkedSites = ref<string[]>([])
const drawerSite = ref<string | null>(null)
const showCategoryModal = ref(false)
const exportTargets = ref<string[]>([])
const showExportModal = ref(false)

// ---------- 分頁（受控狀態，每頁筆數會記住） ----------
const PAGE_SIZE_KEY = 'cm-page-size'
const PAGE_SIZES = [20, 50, 100, 200]

function readPageSize(): number {
  try {
    const v = Number(localStorage.getItem(PAGE_SIZE_KEY))
    if (PAGE_SIZES.includes(v)) return v
  } catch {
    /* 忽略 */
  }
  return 50
}

const pagination = reactive({
  page: 1,
  pageSize: readPageSize(),
  showSizePicker: true,
  pageSizes: PAGE_SIZES,
  onUpdatePage: (p: number) => {
    pagination.page = p
  },
  onUpdatePageSize: (size: number) => {
    pagination.pageSize = size
    pagination.page = 1
    try {
      localStorage.setItem(PAGE_SIZE_KEY, String(size))
    } catch {
      /* 忽略 */
    }
  },
})

// 搜尋框：淺灰填色、無邊框的現代風格
const searchOverrides = computed(() => ({
  color: palette.value.fill,
  colorFocus: palette.value.surface,
  border: '1px solid transparent',
  borderHover: '1px solid transparent',
  heightMedium: '34px',
}))

// ---------- 資料 ----------
async function reloadCookies() {
  cookies.value = await getAllCookies()
  loading.value = false
}

async function persist() {
  await saveData(data.value)
}

let reloadTimer: number | undefined
function scheduleReload() {
  clearTimeout(reloadTimer)
  reloadTimer = window.setTimeout(reloadCookies, 300)
}

let stopDataWatch: (() => void) | undefined
onMounted(async () => {
  data.value = await loadData()
  await reloadCookies()
  chrome.cookies.onChanged.addListener(scheduleReload)
  stopDataWatch = onDataChanged((d) => (data.value = d))
})
onBeforeUnmount(() => {
  chrome.cookies.onChanged.removeListener(scheduleReload)
  stopDataWatch?.()
})

// ---------- 計算 ----------
const sites = computed(() => groupBySite(cookies.value))
const categoryMap = computed(() => new Map(data.value.categories.map((c) => [c.id, c])))

/** 每個網站實際的分類（手動優先，其次自動） */
const resolved = computed(() => new Map(sites.value.map((s) => [s.site, resolveCategory(data.value, s.site)])))

function categoryOf(site: string): Category | undefined {
  const id = (resolved.value.get(site) ?? resolveCategory(data.value, site)).id
  return id ? categoryMap.value.get(id) : undefined
}

function isAuto(site: string): boolean {
  return resolved.value.get(site)?.auto ?? false
}

const countByCat = computed(() => {
  const counts = new Map<string, number>()
  for (const s of sites.value) {
    const key = categoryOf(s.site)?.id ?? UNCATEGORIZED
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
})

const filteredSites = computed<SiteGroup[]>(() => {
  const kw = keyword.value.trim().toLowerCase()
  return sites.value.filter((s) => {
    const cat = categoryOf(s.site)?.id ?? UNCATEGORIZED
    if (activeCat.value !== ALL && cat !== activeCat.value) return false
    if (!kw) return true
    if (s.site.includes(kw)) return true
    return s.cookies.some((c) => c.name.toLowerCase().includes(kw) || c.domain.toLowerCase().includes(kw))
  })
})

// 切換分類或搜尋時回到第一頁，並清除勾選，避免對看不到的網站做批次操作
watch([activeCat, keyword], () => {
  pagination.page = 1
  checkedSites.value = []
})

const totalCookies = computed(() => filteredSites.value.reduce((n, s) => n + s.cookies.length, 0))

const drawerCookies = computed(() => sites.value.find((s) => s.site === drawerSite.value)?.cookies ?? [])

const categoryOptions = computed(() =>
  data.value.categories.map((c) => ({ label: c.name, value: c.id, color: c.color })),
)

/** 目前檢視的標題（全部／未分類／某分類） */
const viewTitle = computed(() => {
  if (activeCat.value === ALL) return { name: t('dash.allSites'), color: undefined }
  if (activeCat.value === UNCATEGORIZED) return { name: t('common.uncategorized'), color: undefined }
  const c = categoryMap.value.get(activeCat.value)
  return { name: c?.name ?? '', color: c?.color }
})

// ---------- 側邊選單 ----------
function menuLabel(name: string, count: number, color?: string) {
  return () =>
    h('div', { class: 'menu-item' }, [
      color ? h('span', { class: 'color-dot', style: { background: color } }) : null,
      h('span', { class: 'menu-name' }, name),
      h('span', { class: 'menu-count' }, String(count)),
    ])
}

const menuOptions = computed<MenuOption[]>(() => [
  { key: ALL, label: menuLabel(t('dash.allSites'), sites.value.length), icon: () => h(Icon, { name: 'dashboard' }) },
  {
    key: UNCATEGORIZED,
    label: menuLabel(t('common.uncategorized'), countByCat.value.get(UNCATEGORIZED) ?? 0),
    icon: () => h(Icon, { name: 'tag' }),
  },
  {
    key: 'group-categories',
    type: 'group',
    label: t('dash.colCategory'),
    children: data.value.categories.map((c) => ({
      key: c.id,
      label: menuLabel(c.name, countByCat.value.get(c.id) ?? 0, c.color),
    })),
  },
])

// ---------- 動作 ----------
/** 手動指定分類；選「未分類」時寫入 NONE，避免之後又被自動分類 */
async function assign(sitesToAssign: string[], categoryId: string | null) {
  for (const site of sitesToAssign) data.value.assignments[site] = categoryId ?? NONE
  await persist()
}

async function toggleAutoCategorize() {
  data.value.autoCategorize = data.value.autoCategorize === false
  await persist()
  message.success(data.value.autoCategorize ? t('dash.autoOn') : t('dash.autoOff'))
}

async function deleteSites(siteNames: string[]) {
  const set = new Set(siteNames)
  const list = sites.value.filter((s) => set.has(s.site)).flatMap((s) => s.cookies)
  await removeCookies(list)
  checkedSites.value = checkedSites.value.filter((s) => !set.has(s))
  await reloadCookies()
  message.success(t('common.deletedCount', { n: list.length }))
}

function confirmBatchDelete() {
  dialog.warning({
    title: t('dash.batchDelete'),
    content: t('dash.batchDeleteContent', { n: checkedSites.value.length }),
    positiveText: t('common.delete'),
    negativeText: t('common.cancel'),
    onPositiveClick: () => deleteSites([...checkedSites.value]),
  })
}

async function onSaveCategories(categories: Category[]) {
  const ids = new Set(categories.map((c) => c.id))
  data.value.categories = categories
  for (const [site, id] of Object.entries(data.value.assignments)) {
    if (id !== NONE && !ids.has(id)) delete data.value.assignments[site]
  }
  if (activeCat.value !== ALL && activeCat.value !== UNCATEGORIZED && !ids.has(activeCat.value)) {
    activeCat.value = ALL
  }
  await persist()
  message.success(t('dash.categoriesUpdated'))
}

// ---------- 匯出 Cookie ----------
const exportSites = computed(() => {
  const set = new Set(exportTargets.value)
  return sites.value.filter((s) => set.has(s.site))
})

function openExport(siteNames: string[]) {
  exportTargets.value = siteNames
  showExportModal.value = true
}

// ---------- 匯出網站清單（不含 Cookie 內容） ----------
const showSiteListModal = ref(false)

function toRow(s: SiteGroup): SiteRow {
  const r = resolved.value.get(s.site) ?? resolveCategory(data.value, s.site)
  const cat = r.id ? categoryMap.value.get(r.id) : undefined
  return {
    site: s.site,
    category: cat?.name ?? '',
    source: cat ? (r.auto ? 'auto' : 'manual') : '',
    cookies: s.cookies.length,
  }
}

const siteRowsView = computed(() => filteredSites.value.map(toRow))
const siteRowsAll = computed(() => sites.value.map(toRow))
const siteRowsSelected = computed(() => {
  const set = new Set(checkedSites.value)
  return sites.value.filter((s) => set.has(s.site)).map(toRow)
})

const categoryNames = computed(() => data.value.categories.map((c) => c.name))

// ---------- 匯入網站分類（CSV／JSON） ----------
const siteImportInput = ref<HTMLInputElement | null>(null)

async function onSiteImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  let rows
  try {
    rows = parseSiteList(await readTextFile(file))
  } catch (err) {
    message.error((err as Error).message)
    return
  }

  // 依名稱（不分大小寫）或 id 找分類；找不到的名稱會新建
  const byName = new Map(data.value.categories.map((c) => [c.name.trim().toLowerCase(), c.id]))
  const ids = new Set(data.value.categories.map((c) => c.id))
  const used = new Set(data.value.categories.map((c) => c.color.toLowerCase()))
  const newCategories: Category[] = []
  const changes: [string, string | null][] = []

  for (const row of rows) {
    let target: string | null = null
    if (row.category) {
      const key = row.category.toLowerCase()
      target = byName.get(key) ?? (ids.has(row.category) ? row.category : null)
      if (!target) {
        const color = PRESET_COLORS.find((c) => !used.has(c)) ?? PRESET_COLORS[newCategories.length % PRESET_COLORS.length]
        used.add(color)
        const created = { id: newId(), name: row.category, color }
        newCategories.push(created)
        byName.set(key, created.id)
        target = created.id
      }
    }
    // 只套用和目前分類不同的列；沒改的網站維持原狀（自動分類仍是自動）
    if (resolveCategory(data.value, row.site).id !== target) changes.push([row.site, target])
  }

  if (!changes.length) {
    message.info(t('siteImport.none'))
    return
  }

  const lines = [t('siteImport.summary', { n: changes.length, c: newCategories.length })]
  if (newCategories.length) lines.push(t('siteImport.newCats', { names: newCategories.map((c) => c.name).join('、') }))

  dialog.info({
    title: t('siteImport.title'),
    content: lines.join('\n'),
    style: 'white-space: pre-line',
    positiveText: t('siteImport.apply'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      data.value.categories.push(...newCategories)
      for (const [site, id] of changes) data.value.assignments[site] = id ?? NONE
      await persist()
      message.success(t('siteImport.done', { n: changes.length }))
    },
  })
}

// ---------- 備份／還原分類資料 ----------
const fileInput = ref<HTMLInputElement | null>(null)

function onBackup() {
  exportData(data.value)
  message.success(t('dash.backupDone'))
}

async function onRestoreFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  let incoming: AppData
  try {
    incoming = await parseBackup(file)
  } catch (err) {
    message.error((err as Error).message)
    return
  }
  const summary = t('dash.restoreSummary', {
    c: incoming.categories.length,
    a: Object.keys(incoming.assignments).length,
  })
  const apply = async (next: AppData) => {
    data.value = next
    activeCat.value = ALL
    await persist()
    message.success(t('dash.restoreDone'))
  }
  dialog.info({
    title: t('dash.restoreTitle'),
    content: `${summary}\n${t('dash.restoreHow')}`,
    style: 'white-space: pre-line',
    positiveText: t('dash.merge'),
    negativeText: t('dash.replace'),
    onPositiveClick: () => apply(mergeData(data.value, incoming)),
    onNegativeClick: () => apply(replaceData(data.value, incoming)),
  })
}

const moreOptions = computed<DropdownOption[]>(() => [
  { key: 'sites', label: t('sites.title') },
  { key: 'siteImport', label: t('siteImport.menu') },
  { type: 'divider', key: 'd0' },
  {
    key: 'auto',
    label: t('dash.autoCategorize'),
    icon: () =>
      h('span', { style: 'width:1em;display:inline-block;text-align:center;color:var(--cm-primary)' },
        data.value.autoCategorize !== false ? '✓' : ''),
  },
  { type: 'divider', key: 'd1' },
  { key: 'backup', label: t('dash.backup'), props: { title: t('dash.backupTip') } },
  { key: 'restore', label: t('dash.restore'), props: { title: t('dash.restoreTip') } },
])

function onMore(key: string) {
  if (key === 'sites') showSiteListModal.value = true
  else if (key === 'siteImport') siteImportInput.value?.click()
  else if (key === 'auto') toggleAutoCategorize()
  else if (key === 'backup') onBackup()
  else if (key === 'restore') fileInput.value?.click()
}

async function refresh() {
  loading.value = true
  await reloadCookies()
  message.success(t('dash.refreshed'))
}

// ---------- 表格 ----------
function iconButton(icon: string, title: string, onClick?: () => void, danger = false) {
  return h(
    'button',
    { class: ['icon-btn', danger && 'danger'], title, type: 'button', onClick },
    h(Icon, { name: icon as never }),
  )
}

const columns = computed<DataTableColumns<SiteGroup>>(() => [
  { type: 'selection' },
  {
    title: t('dash.colSite'),
    key: 'site',
    sorter: (a, b) => a.site.localeCompare(b.site),
    render: (row) =>
      h('div', { class: 'site-cell' }, [
        h('div', { class: 'fav' }, h('img', { src: faviconUrl(row.site), alt: '' })),
        h('span', { class: 'site-name', onClick: () => (drawerSite.value = row.site) }, row.site),
      ]),
  },
  {
    title: t('dash.colCategory'),
    key: 'category',
    width: 190,
    render: (row) =>
      h(CategoryPill, {
        categories: data.value.categories,
        value: categoryOf(row.site)?.id ?? null,
        auto: isAuto(row.site),
        onChange: (v: string | null) => assign([row.site], v),
      }),
  },
  {
    title: t('dash.colCount'),
    key: 'count',
    width: 120,
    align: 'center',
    sorter: (a, b) => a.cookies.length - b.cookies.length,
    render: (row) => h('span', { class: 'count-pill' }, row.cookies.length),
  },
  {
    title: t('dash.colActions'),
    key: 'actions',
    width: 130,
    align: 'center',
    render: (row) =>
      h('div', { class: 'row-actions' }, [
        iconButton('eye', t('dash.details'), () => (drawerSite.value = row.site)),
        iconButton('export', t('common.export'), () => openExport([row.site])),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => deleteSites([row.site]),
            positiveText: t('common.delete'),
            negativeText: t('common.cancel'),
          },
          {
            trigger: () => iconButton('trash', t('common.delete'), undefined, true),
            default: () => t('dash.confirmDeleteSite', { site: row.site, n: row.cookies.length }),
          },
        ),
      ]),
  },
])

const batchCategory = ref<string | null>(null)
async function applyBatchCategory(v: string | null) {
  const n = checkedSites.value.length
  await assign([...checkedSites.value], v)
  message.success(v ? t('dash.movedTo', { n }) : t('dash.setUncategorizedDone', { n }))
  batchCategory.value = null
}
</script>

<template>
  <div class="stage">
    <!-- macOS 風格的單一視窗：左側邊欄＋右側內容 -->
    <div class="window">
      <aside class="sidebar">
        <div class="brand">
          <img src="/assets/icons/icon48.png" alt="" />
          <span>Cookie Manager</span>
        </div>
        <NMenu v-model:value="activeCat" :options="menuOptions" :indent="10" class="menu" />
        <div class="sidebar-footer">
          <button type="button" class="side-action" @click="showCategoryModal = true">
            <Icon name="tag" />
            <span>{{ t('dash.manageCategories') }}</span>
          </button>
        </div>
      </aside>

      <section class="content">
        <!-- 工具列：標題在左，搜尋與操作在右 -->
        <header class="toolbar">
          <div class="heading">
            <h1>
              <span v-if="viewTitle.color" class="color-dot big" :style="{ background: viewTitle.color }" />
              <span class="title-text">{{ viewTitle.name }}</span>
            </h1>
            <span class="summary">{{ t('dash.summary', { sites: filteredSites.length, cookies: totalCookies }) }}</span>
          </div>
          <NInput
            v-model:value="keyword"
            class="search"
            :placeholder="t('dash.search')"
            clearable
            round
            :theme-overrides="searchOverrides"
          >
            <template #prefix><Icon name="search" /></template>
          </NInput>
          <div class="actions">
            <NButton quaternary :title="t('dash.refresh')" @click="refresh">
              <template #icon><Icon name="refresh" /></template>
            </NButton>
            <NDropdown :options="moreOptions" trigger="click" placement="bottom-end" @select="onMore">
              <NButton quaternary>
                <template #icon><Icon name="more" /></template>
              </NButton>
            </NDropdown>
            <LanguageSelect />
            <NButton quaternary :title="isDark ? t('theme.toLight') : t('theme.toDark')" @click="toggleTheme">
              <template #icon><Icon :name="isDark ? 'sun' : 'moon'" /></template>
            </NButton>
          </div>
          <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onRestoreFile" />
          <input
            ref="siteImportInput"
            type="file"
            accept=".csv,.json,text/csv,application/json"
            hidden
            @change="onSiteImportFile"
          />
        </header>

        <!-- 批次操作列 -->
        <Transition name="fade">
          <div v-if="checkedSites.length" class="selection-bar">
            <span class="selection-count">{{ t('dash.selected', { n: checkedSites.length }) }}</span>
            <NSelect
              v-model:value="batchCategory"
              :options="[{ label: t('dash.setUncategorized'), value: UNCATEGORIZED }, ...categoryOptions]"
              :placeholder="t('dash.moveTo')"
              size="small"
              style="width: 180px"
              @update:value="(v: string) => applyBatchCategory(v === UNCATEGORIZED ? null : v)"
            />
            <NButton size="small" secondary @click="openExport([...checkedSites])">
              <template #icon><Icon name="export" /></template>
              {{ t('dash.exportCookies') }}
            </NButton>
            <NButton size="small" type="error" secondary @click="confirmBatchDelete">
              <template #icon><Icon name="trash" /></template>
              {{ t('dash.batchDelete') }}
            </NButton>
            <NButton size="small" quaternary class="clear" @click="checkedSites = []">
              {{ t('dash.clearSelection') }}
            </NButton>
          </div>
        </Transition>

        <NDataTable
          v-model:checked-row-keys="checkedSites"
          class="table"
          :columns="columns"
          :data="filteredSites"
          :row-key="(row: SiteGroup) => row.site"
          :loading="loading"
          :pagination="pagination"
          flex-height
          :bordered="false"
        />
      </section>
    </div>

    <CookieDrawer
      :show="drawerSite !== null"
      :site="drawerSite ?? ''"
      :cookies="drawerCookies"
      @update:show="(v: boolean) => !v && (drawerSite = null)"
      @changed="reloadCookies"
      @export="drawerSite && openExport([drawerSite])"
    />
    <ExportModal v-model:show="showExportModal" :sites="exportSites" />
    <SiteListModal
      v-model:show="showSiteListModal"
      :view="siteRowsView"
      :all="siteRowsAll"
      :selected="siteRowsSelected"
      :category-names="categoryNames"
    />
    <CategoryModal v-model:show="showCategoryModal" :categories="data.categories" @save="onSaveCategories" />
  </div>
</template>

<style scoped>
/* 整個應用是一個置中的圓角視窗；最大寬度 1440px，超寬螢幕置中 */
.stage {
  height: 100vh;
  padding: 16px 20px;
}

.window {
  max-width: 1440px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  overflow: hidden;
  color: var(--cm-text);
  background: var(--cm-surface);
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius-xl);
  box-shadow: var(--cm-shadow-lg);
}

/* ---------- 側邊欄 ---------- */
.sidebar {
  width: 236px;
  flex: none;
  display: flex;
  flex-direction: column;
  padding: 16px 10px 10px;
  background: var(--cm-surface-2);
  border-right: 1px solid var(--cm-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 16px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.brand img {
  width: 28px;
  height: 28px;
}

.menu {
  flex: 1;
  overflow-y: auto;
}

.menu :deep(.n-menu-item) {
  margin-top: 2px;
}

.menu :deep(.n-menu-item-content) {
  border-radius: var(--cm-radius-md);
}

.menu :deep(.n-menu-item-content::before) {
  left: 0 !important;
  right: 0 !important;
  border-radius: var(--cm-radius-md) !important;
}

/* 分組標題（macOS 側邊欄的小標題） */
.menu :deep(.n-menu-item-group-title) {
  padding-left: 10px !important;
  margin-top: 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cm-muted);
}

.menu :deep(.menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.menu :deep(.menu-name) {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu :deep(.menu-count) {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--cm-muted);
}

/* 選中列為藍底白字（macOS 側邊欄），數量與圓點改為白色系才看得清楚 */
.menu :deep(.n-menu-item-content--selected .menu-count) {
  color: rgba(255, 255, 255, 0.85);
}

.menu :deep(.n-menu-item-content--selected .color-dot) {
  box-shadow: 0 0 0 1.5px #fff;
}

.sidebar-footer {
  padding-top: 8px;
  border-top: 1px solid var(--cm-border);
}

.side-action {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 0;
  border-radius: var(--cm-radius-md);
  background: transparent;
  color: var(--cm-muted);
  font: inherit;
  font-size: 13.5px;
  cursor: pointer;
}

.side-action:hover {
  background: var(--cm-hover);
  color: var(--cm-text);
}

.side-action svg {
  width: 16px;
  height: 16px;
}

/* ---------- 內容 ---------- */
.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 14px 14px 24px;
  border-bottom: 1px solid var(--cm-border);
}

.heading {
  flex: 1;
  min-width: 0;
}

.heading h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 9px;
}

.title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.color-dot.big {
  width: 11px;
  height: 11px;
}

.summary {
  display: block;
  margin-top: 1px;
  font-size: 12.5px;
  color: var(--cm-muted);
}

.search {
  width: 300px;
  flex: none;
}

.actions {
  display: flex;
  gap: 2px;
}

/* 批次操作列 */
.selection-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 16px 4px;
  padding: 7px 10px 7px 14px;
  border-radius: var(--cm-radius-lg);
  background: var(--cm-primary-soft);
}

.selection-count {
  font-weight: 600;
  color: var(--cm-primary);
  margin-right: 4px;
}

.selection-bar .clear {
  margin-left: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 表格：撐滿內容區，不加外框，列之間用細線分隔 */
.table {
  flex: 1;
  min-height: 0;
}

.table :deep(.n-data-table-th) {
  font-size: 12.5px;
  color: var(--cm-muted);
}

.table :deep(.n-data-table-td) {
  padding-top: 9px;
  padding-bottom: 9px;
}

.table :deep(.n-data-table-th:first-child),
.table :deep(.n-data-table-td:first-child) {
  padding-left: 22px;
}

.table :deep(.n-data-table-th:last-child),
.table :deep(.n-data-table-td:last-child) {
  padding-right: 16px;
}

.table :deep(.n-data-table__pagination) {
  margin: 0;
  padding: 10px 16px;
  border-top: 1px solid var(--cm-border);
}

.table :deep(.site-name) {
  font-weight: 500;
  cursor: pointer;
}

.table :deep(.site-name:hover) {
  color: var(--cm-primary);
}

.table :deep(.row-actions) {
  display: inline-flex;
  gap: 2px;
}

@media (max-width: 900px) {
  .search {
    width: 200px;
  }
}

@media (max-width: 760px) {
  .stage {
    padding: 0;
  }
  .window {
    border-radius: 0;
    border: 0;
  }
  .sidebar {
    display: none;
  }
}
</style>
