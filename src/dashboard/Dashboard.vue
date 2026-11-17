<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import {
  NButton,
  NDataTable,
  NDropdown,
  NInput,
  NMenu,
  NPopconfirm,
  NSelect,
  NSpace,
  NText,
  useDialog,
  useMessage,
  type DataTableColumns,
  type DropdownOption,
  type MenuOption,
} from 'naive-ui'
import { faviconUrl, getAllCookies, groupBySite, removeCookies, type Cookie, type SiteGroup } from '../lib/cookies'
import { loadData, onDataChanged, saveData, type AppData, type Category } from '../storage'
import { useTheme } from '../lib/theme'
import { exportData, mergeData, parseBackup } from '../lib/backup'
import { t } from '../i18n'
import Icon from '../lib/Icon.vue'
import LanguageSelect from '../lib/LanguageSelect.vue'
import CookieDrawer from './components/CookieDrawer.vue'
import CategoryModal from './components/CategoryModal.vue'
import ExportModal from './components/ExportModal.vue'

const UNCATEGORIZED = '__none__'
const ALL = '__all__'

const message = useMessage()
const dialog = useDialog()
const { isDark, toggle: toggleTheme } = useTheme()

// 外側底色與中間主體區分開來：外側灰底，主體為卡片色並加陰影
const pageStyle = computed(() =>
  isDark.value
    ? { background: '#18181c', boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.55)' }
    : { background: '#ffffff', boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 8px 32px rgba(15,23,42,0.10)' },
)
watchEffect(() => {
  document.body.style.backgroundColor = isDark.value ? '#101014' : '#eef0f3'
})

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

function categoryOf(site: string): Category | undefined {
  const id = data.value.assignments[site]
  return id ? categoryMap.value.get(id) : undefined
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

const totalCookies = computed(() => filteredSites.value.reduce((n, s) => n + s.cookies.length, 0))

const drawerCookies = computed(() => sites.value.find((s) => s.site === drawerSite.value)?.cookies ?? [])

const categoryOptions = computed(() =>
  data.value.categories.map((c) => ({ label: c.name, value: c.id, color: c.color })),
)

// ---------- 側邊選單 ----------
function menuLabel(name: string, count: number, color?: string) {
  return () =>
    h('div', { style: 'display:flex;align-items:center;gap:8px;width:100%' }, [
      color ? h('span', { class: 'color-dot', style: { background: color } }) : null,
      h('span', { style: 'flex:1;overflow:hidden;text-overflow:ellipsis' }, name),
      h(NText, { depth: 3, style: 'font-size:12px' }, () => String(count)),
    ])
}

const menuOptions = computed<MenuOption[]>(() => [
  { key: ALL, label: menuLabel(t('dash.allSites'), sites.value.length) },
  { key: UNCATEGORIZED, label: menuLabel(t('common.uncategorized'), countByCat.value.get(UNCATEGORIZED) ?? 0) },
  { key: 'divider', type: 'divider' },
  ...data.value.categories.map((c) => ({
    key: c.id,
    label: menuLabel(c.name, countByCat.value.get(c.id) ?? 0, c.color),
  })),
])

// ---------- 動作 ----------
async function assign(sitesToAssign: string[], categoryId: string | null) {
  for (const site of sitesToAssign) {
    if (categoryId) data.value.assignments[site] = categoryId
    else delete data.value.assignments[site]
  }
  await persist()
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
    if (!ids.has(id)) delete data.value.assignments[site]
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
    onNegativeClick: () => apply(incoming),
  })
}

const moreOptions = computed<DropdownOption[]>(() => [
  { key: 'backup', label: t('dash.backup'), props: { title: t('dash.backupTip') } },
  { key: 'restore', label: t('dash.restore'), props: { title: t('dash.restoreTip') } },
])

function onMore(key: string) {
  if (key === 'backup') onBackup()
  else if (key === 'restore') fileInput.value?.click()
}

async function refresh() {
  loading.value = true
  await reloadCookies()
  message.success(t('dash.refreshed'))
}

// ---------- 表格 ----------
const columns = computed<DataTableColumns<SiteGroup>>(() => [
  { type: 'selection' },
  {
    title: t('dash.colSite'),
    key: 'site',
    sorter: (a, b) => a.site.localeCompare(b.site),
    render: (row) =>
      h('div', { class: 'site-cell' }, [
        h('img', { src: faviconUrl(row.site), alt: '' }),
        h(NButton, { text: true, onClick: () => (drawerSite.value = row.site) }, { default: () => row.site }),
      ]),
  },
  {
    title: t('dash.colCategory'),
    key: 'category',
    width: 180,
    render: (row) =>
      h(NSelect, {
        size: 'small',
        value: categoryOf(row.site)?.id ?? null,
        options: categoryOptions.value,
        placeholder: t('common.uncategorized'),
        clearable: true,
        renderLabel: (opt: { label: string; color: string }) =>
          h('div', { style: 'display:flex;align-items:center;gap:6px' }, [
            h('span', { class: 'color-dot', style: { background: opt.color } }),
            opt.label,
          ]),
        onUpdateValue: (v: string | null) => assign([row.site], v),
      }),
  },
  {
    title: t('dash.colCount'),
    key: 'count',
    width: 110,
    align: 'right',
    sorter: (a, b) => a.cookies.length - b.cookies.length,
    render: (row) => row.cookies.length,
  },
  {
    title: t('dash.colActions'),
    key: 'actions',
    width: 240,
    align: 'center',
    render: (row) =>
      h(NSpace, { size: 4, justify: 'center', wrap: false }, () => [
        h(NButton, { size: 'small', quaternary: true, onClick: () => (drawerSite.value = row.site) }, () =>
          t('dash.details'),
        ),
        h(NButton, { size: 'small', quaternary: true, onClick: () => openExport([row.site]) }, () =>
          t('common.export'),
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => deleteSites([row.site]),
            positiveText: t('common.delete'),
            negativeText: t('common.cancel'),
          },
          {
            trigger: () => h(NButton, { size: 'small', quaternary: true, type: 'error' }, () => t('common.delete')),
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
  <div class="page" :style="pageStyle">
    <header class="header">
      <div class="brand">
        <img src="/assets/icons/icon48.png" alt="" />
        <span>Cookie Manager</span>
      </div>
      <NInput v-model:value="keyword" class="search" :placeholder="t('dash.search')" clearable round>
        <template #prefix><Icon name="search" /></template>
      </NInput>
      <NSpace :size="4" :wrap="false">
        <NButton quaternary :title="t('dash.refresh')" @click="refresh">
          <template #icon><Icon name="refresh" /></template>
        </NButton>
        <NDropdown :options="moreOptions" trigger="click" @select="onMore">
          <NButton quaternary>
            <template #icon><Icon name="more" /></template>
          </NButton>
        </NDropdown>
        <LanguageSelect />
        <NButton quaternary :title="isDark ? t('theme.toLight') : t('theme.toDark')" @click="toggleTheme">
          <template #icon><Icon :name="isDark ? 'sun' : 'moon'" /></template>
        </NButton>
      </NSpace>
      <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onRestoreFile" />
    </header>

    <div class="body">
      <aside class="aside">
        <NMenu v-model:value="activeCat" :options="menuOptions" />
        <div class="aside-footer">
          <NButton block dashed @click="showCategoryModal = true">{{ t('dash.manageCategories') }}</NButton>
        </div>
      </aside>

      <main class="main">
        <div class="toolbar">
          <template v-if="checkedSites.length">
            <NText>{{ t('dash.selected', { n: checkedSites.length }) }}</NText>
            <NSelect
              v-model:value="batchCategory"
              :options="[{ label: t('dash.setUncategorized'), value: UNCATEGORIZED }, ...categoryOptions]"
              :placeholder="t('dash.moveTo')"
              size="small"
              style="width: 180px"
              @update:value="(v: string) => applyBatchCategory(v === UNCATEGORIZED ? null : v)"
            />
            <NButton size="small" secondary @click="openExport([...checkedSites])">{{ t('dash.exportCookies') }}</NButton>
            <NButton size="small" type="error" secondary @click="confirmBatchDelete">{{ t('dash.batchDelete') }}</NButton>
            <NButton size="small" quaternary @click="checkedSites = []">{{ t('dash.clearSelection') }}</NButton>
          </template>
          <NText v-else depth="3">
            {{ t('dash.summary', { sites: filteredSites.length, cookies: totalCookies }) }}
          </NText>
        </div>

        <NDataTable
          v-model:checked-row-keys="checkedSites"
          class="table"
          :columns="columns"
          :data="filteredSites"
          :row-key="(row: SiteGroup) => row.site"
          :loading="loading"
          :pagination="{ pageSize: 50, showSizePicker: true, pageSizes: [20, 50, 100] }"
          flex-height
          :bordered="false"
        />
      </main>
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
    <CategoryModal v-model:show="showCategoryModal" :categories="data.categories" @save="onSaveCategories" />
  </div>
</template>

<style scoped>
/* 限制最大寬度，超寬螢幕時置中，不會被拉得太開 */
.page {
  max-width: 1440px;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
}

.brand img {
  width: 24px;
  height: 24px;
}

.search {
  flex: 1;
  max-width: 520px;
  margin-right: auto;
}

.body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.aside {
  width: 220px;
  flex: none;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(128, 128, 128, 0.15);
  overflow-y: auto;
}

.aside-footer {
  margin-top: auto;
  padding: 12px;
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 36px;
  margin-bottom: 8px;
}

.table {
  flex: 1;
  min-height: 0;
}

@media (max-width: 720px) {
  .aside {
    display: none;
  }
  .brand span {
    display: none;
  }
}
</style>
