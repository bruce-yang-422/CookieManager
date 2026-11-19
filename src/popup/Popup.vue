<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { NButton, NEmpty, NInput, NPopconfirm, NScrollbar, NSpin, useMessage } from 'naive-ui'
import {
  cookieKey,
  draftFromCookie,
  faviconUrl,
  getSiteCookies,
  getUrlCookies,
  removeCookie,
  removeCookies,
  replaceCookie,
  setCookie,
  siteOf,
  type Cookie,
  type CookieDraft,
} from '../lib/cookies'
import { NONE, loadData, localizeCategories, resolveCategory, saveData, type AppData } from '../storage'
import { useTheme } from '../lib/theme'
import { formatBytes, inspectTab, type StorageSnapshot } from '../lib/siteData'
import Icon from '../lib/Icon.vue'
import LanguageSelect from '../lib/LanguageSelect.vue'
import CategoryPill from '../lib/CategoryPill.vue'
import { t } from '../i18n'
import CookieEditor from './components/CookieEditor.vue'
import ImportPanel from './components/ImportPanel.vue'
import ExportPanel from './components/ExportPanel.vue'
import StoragePanel from './components/StoragePanel.vue'

type View = 'list' | 'new' | 'import' | 'export' | 'storage'
type Scope = 'page' | 'site'

const SCOPE_KEY = 'cm-popup-scope'
const message = useMessage()
const { palette } = useTheme()

const loading = ref(true)
const busy = ref(false)
const tabId = ref<number | null>(null)
const tabUrl = ref('')
const origin = ref('')
const host = ref('')
const site = ref<string | null>(null)
const isHttps = ref(false)
const cookies = ref<Cookie[]>([])
const data = ref<AppData>({ categories: [], assignments: {} })
const keyword = ref('')
const view = ref<View>('list')
const expanded = ref<string | null>(null)
const scope = ref<Scope>(readScope())

const searchOverrides = computed(() => ({
  color: palette.value.surface,
  colorFocus: palette.value.surface,
  border: `1px solid ${palette.value.border}`,
  heightSmall: '32px',
}))

function readScope(): Scope {
  try {
    return localStorage.getItem(SCOPE_KEY) === 'site' ? 'site' : 'page'
  } catch {
    return 'page'
  }
}

watch(scope, async (v) => {
  try {
    localStorage.setItem(SCOPE_KEY, v)
  } catch {
    /* 忽略 */
  }
  expanded.value = null
  await load()
})

// ---------- 資料 ----------
async function load() {
  if (!site.value) return
  const list = scope.value === 'page' ? await getUrlCookies(tabUrl.value) : await getSiteCookies(site.value)
  cookies.value = list.sort((a, b) => a.name.localeCompare(b.name))
}

onMounted(async () => {
  data.value = await loadData()
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  try {
    const url = new URL(tab?.url ?? '')
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      tabId.value = tab?.id ?? null
      tabUrl.value = url.href
      origin.value = url.origin
      host.value = url.hostname
      isHttps.value = url.protocol === 'https:'
      site.value = siteOf(url.hostname)
    }
  } catch {
    /* 非一般網頁 */
  }
  await load()
  loading.value = false
  await loadStorage()
})

// ---------- 網站資料摘要（快取與儲存空間） ----------
const storage = ref<StorageSnapshot | null>(null)
const storageError = ref(false)

async function loadStorage() {
  if (tabId.value === null) return
  try {
    storage.value = await inspectTab(tabId.value)
    storageError.value = false
  } catch {
    storage.value = null
    storageError.value = true
  }
}

/** 數量不為 0 的儲存類型 */
const storageChips = computed(() => {
  const s = storage.value
  if (!s) return []
  return [
    { label: 'Local Storage', n: s.local.length },
    { label: 'Session', n: s.session.length },
    { label: 'IndexedDB', n: s.databases.length },
    { label: 'Cache Storage', n: s.caches.length },
    { label: 'Service Worker', n: s.workers.length },
  ].filter((c) => c.n > 0)
})

const storageUsage = computed(() => (storage.value?.usage != null ? formatBytes(storage.value.usage) : ''))

// 從網站資料頁返回列表時更新摘要
watch(view, (v, old) => {
  if (old === 'storage' && v === 'list') loadStorage()
})

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return cookies.value
  return cookies.value.filter((c) => c.name.toLowerCase().includes(kw) || c.value.toLowerCase().includes(kw))
})

// ---------- 分類 ----------
const category = computed(() =>
  site.value ? resolveCategory(data.value, site.value) : { id: null, auto: false },
)

/** 手動指定分類；選「未分類」時寫入 NONE，避免又被自動分類 */
async function setCategory(v: string | null) {
  if (!site.value) return
  data.value.assignments[site.value] = v ?? NONE
  await saveData(data.value)
}

// ---------- 編輯 ----------
const newDraft = computed<CookieDraft>(() => ({
  name: '',
  value: '',
  domain: host.value,
  hostOnly: true,
  path: '/',
  secure: isHttps.value,
  httpOnly: false,
  sameSite: 'lax',
  session: false,
  expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 3600,
}))

async function run(task: () => Promise<void>, ok: string) {
  busy.value = true
  try {
    await task()
    await load()
    message.success(ok)
    return true
  } catch (err) {
    message.error((err as Error).message)
    return false
  } finally {
    busy.value = false
  }
}

async function saveCookie(old: Cookie, d: CookieDraft) {
  if (await run(() => replaceCookie(old, d), t('pop.saved', { name: d.name }))) expanded.value = null
}

async function addCookie(d: CookieDraft) {
  if (await run(() => setCookie(d), t('pop.added', { name: d.name }))) view.value = 'list'
}

async function deleteCookie(c: Cookie) {
  await run(() => removeCookie(c), t('common.deletedName', { name: c.name }))
}

async function deleteAll() {
  const n = cookies.value.length
  await run(() => removeCookies(cookies.value), t('pop.deletedAll', { n }))
}

async function importCookies(drafts: CookieDraft[]) {
  busy.value = true
  let ok = 0
  const errors: string[] = []
  for (const d of drafts) {
    try {
      await setCookie(d)
      ok++
    } catch (err) {
      errors.push(`${d.name}: ${(err as Error).message}`)
    }
  }
  busy.value = false
  await load()
  if (errors.length) {
    message.warning(
      t('imp.partial', { ok, fail: errors.length, first: errors[0] + (errors.length > 1 ? '…' : '') }),
    )
  } else message.success(t('imp.done', { n: ok }))
  if (ok) view.value = 'list'
}

// ---------- 畫面 ----------
function viewTitle(v: View): string {
  if (v === 'storage') return t('data.title')
  return v === 'new' ? t('pop.newTitle') : v === 'import' ? t('pop.importTitle') : t('pop.exportTitle')
}

function toggleView(v: View) {
  view.value = view.value === v ? 'list' : v
}

function toggleItem(key: string) {
  expanded.value = expanded.value === key ? null : key
}

function openDashboard() {
  chrome.runtime.openOptionsPage()
  window.close()
}
</script>

<template>
  <div class="popup">
    <!-- 標題列 -->
    <header class="top">
      <div v-if="site" class="fav">
        <img :src="faviconUrl(site, 32, cookies)" alt="" />
      </div>
      <img v-else class="logo" src="/assets/icons/icon48.png" alt="" />
      <div class="title">
        <div class="host">{{ site ? (scope === 'page' ? host : site) : 'Cookie Manager' }}</div>
        <div v-if="site" class="sub">
          {{ t('common.cookieCount', { n: cookies.length }) }}
          <template v-if="storageUsage"> · {{ t('data.title') }} {{ storageUsage }}</template>
        </div>
      </div>
      <LanguageSelect size="small" />
      <NButton quaternary size="small" :title="t('common.openDashboard')" @click="openDashboard">
        <template #icon><Icon name="dashboard" /></template>
      </NButton>
    </header>

    <NSpin :show="loading" class="spin">
      <template v-if="site">
        <div class="controls">
          <div class="seg" role="tablist">
            <button
              type="button"
              :class="{ on: scope === 'page' }"
              :title="t('pop.scopePageTip')"
              @click="scope = 'page'"
            >
              {{ t('pop.scopePage') }}
            </button>
            <button
              type="button"
              :class="{ on: scope === 'site' }"
              :title="t('pop.scopeSiteTip', { site })"
              @click="scope = 'site'"
            >
              {{ t('pop.scopeSite') }}
            </button>
          </div>
          <CategoryPill
            :categories="localizeCategories(data.categories)"
            :value="category.id"
            :auto="category.auto"
            @change="setCategory"
          />
        </div>

        <!-- 列表 -->
        <template v-if="view === 'list'">
          <div class="search">
            <NInput
              v-model:value="keyword"
              size="small"
              :placeholder="t('pop.search')"
              clearable
              :theme-overrides="searchOverrides"
            >
              <template #prefix><Icon name="search" /></template>
            </NInput>
          </div>
          <!-- 網站資料摘要：點選進入管理 -->
          <button
            v-if="tabId !== null"
            type="button"
            class="storage-bar"
            :title="t('data.inspectNote', { origin })"
            @click="view = 'storage'"
          >
            <Icon name="database" size="16" class="storage-icon" />
            <span class="storage-main">
              <span class="storage-title">
                {{ t('data.title') }}
                <span v-if="storageUsage" class="storage-usage">{{ storageUsage }}</span>
              </span>
              <span class="storage-chips">
                <template v-if="storageError">{{ t('data.unreadable') }}</template>
                <template v-else-if="!storage">…</template>
                <template v-else-if="!storageChips.length">{{ t('data.empty') }}</template>
                <span v-for="c in storageChips" v-else :key="c.label" class="chip">
                  {{ c.label }} <b>{{ c.n }}</b>
                </span>
              </span>
            </span>
            <span class="storage-chev"><Icon name="chevron" /></span>
          </button>
          <NScrollbar class="content">
            <NEmpty
              v-if="!filtered.length"
              :description="keyword ? t('pop.noMatch') : t('pop.noCookies')"
              class="empty"
            />
            <div v-else class="list">
              <div
                v-for="c in filtered"
                :key="cookieKey(c)"
                class="item"
                :class="{ open: expanded === cookieKey(c) }"
              >
                <button type="button" class="item-head" @click="toggleItem(cookieKey(c))">
                  <span class="chev"><Icon name="chevron" /></span>
                  <span class="name">{{ c.name || t('pop.noName') }}</span>
                  <span class="domain">{{ c.domain }}</span>
                </button>
                <div v-if="expanded === cookieKey(c)" class="item-body">
                  <CookieEditor
                    :initial="draftFromCookie(c)"
                    :saving="busy"
                    @save="(d) => saveCookie(c, d)"
                    @delete="deleteCookie(c)"
                  />
                </div>
              </div>
            </div>
          </NScrollbar>
        </template>

        <!-- 新增／匯入／匯出 -->
        <NScrollbar v-else class="content">
          <div class="panel cm-card">
            <div class="panel-head">
              <button type="button" class="icon-btn" :title="t('common.back')" @click="view = 'list'">
                <Icon name="back" />
              </button>
              <span>{{ viewTitle(view) }}</span>
            </div>
            <CookieEditor
              v-if="view === 'new'"
              :initial="newDraft"
              is-new
              :saving="busy"
              @save="addCookie"
              @cancel="view = 'list'"
            />
            <ImportPanel
              v-else-if="view === 'import'"
              :host="host"
              :secure="isHttps"
              :importing="busy"
              @import="importCookies"
            />
            <StoragePanel
              v-else-if="view === 'storage' && tabId !== null"
              :tab-id="tabId"
              :origin="origin"
              :site="site"
              :scope="scope"
              @changed="load"
            />
            <ExportPanel v-else :cookies="cookies" :name="scope === 'page' ? host : site" />
          </div>
        </NScrollbar>

        <!-- 底部工具列 -->
        <footer class="dock cm-card">
          <button class="dock-btn" :class="{ active: view === 'new' }" @click="toggleView('new')">
            <Icon name="plus" size="18" /><span>{{ t('common.add') }}</span>
          </button>
          <NPopconfirm
            :positive-text="t('common.deleteAll')"
            :negative-text="t('common.cancel')"
            @positive-click="deleteAll"
          >
            <template #trigger>
              <button class="dock-btn danger" :disabled="!cookies.length">
                <Icon name="trash" size="18" /><span>{{ t('common.deleteAll') }}</span>
              </button>
            </template>
            {{
              scope === 'page'
                ? t('pop.confirmDeleteAllPage', { n: cookies.length })
                : t('pop.confirmDeleteAllSite', { n: cookies.length })
            }}
          </NPopconfirm>
          <button
            class="dock-btn"
            :class="{ active: view === 'storage' }"
            :disabled="tabId === null"
            @click="toggleView('storage')"
          >
            <Icon name="database" size="18" /><span>{{ t('data.title') }}</span>
          </button>
          <button class="dock-btn" :class="{ active: view === 'import' }" @click="toggleView('import')">
            <Icon name="import" size="18" /><span>{{ t('common.import') }}</span>
          </button>
          <button
            class="dock-btn"
            :class="{ active: view === 'export' }"
            :disabled="!cookies.length"
            @click="toggleView('export')"
          >
            <Icon name="export" size="18" /><span>{{ t('common.export') }}</span>
          </button>
        </footer>
      </template>

      <div v-else-if="!loading" class="pad">
        <div class="panel cm-card">
          <NEmpty :description="t('pop.notWebsite')" class="empty" />
          <NButton block type="primary" secondary @click="openDashboard">{{ t('common.openDashboard') }}</NButton>
        </div>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.popup {
  width: 400px;
  height: 580px;
  display: flex;
  flex-direction: column;
  background: var(--cm-bg);
  color: var(--cm-text);
}

.spin {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.spin :deep(.n-spin-content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 標題列 */
.top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px 12px 14px;
}

.top .fav {
  width: 34px;
  height: 34px;
  border-radius: var(--cm-radius-lg);
  background: var(--cm-surface);
  box-shadow: var(--cm-shadow);
}

.logo {
  width: 32px;
  height: 32px;
}

.title {
  flex: 1;
  min-width: 0;
}

.host {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub {
  font-size: 12px;
  color: var(--cm-muted);
}

/* 範圍切換＋分類 */
.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 14px;
}

.seg {
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  border-radius: var(--cm-radius-lg);
  background: color-mix(in srgb, var(--cm-text) 7%, transparent);
}

.seg button {
  border: 0;
  background: transparent;
  color: var(--cm-muted);
  font: inherit;
  font-size: 12.5px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: var(--cm-radius-md);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
}

.seg button.on {
  background: var(--cm-surface);
  color: var(--cm-text);
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.12);
}

.search {
  padding: 12px 14px 10px;
}

.content {
  flex: 1;
  min-height: 0;
}

/* 網站資料摘要列 */
.storage-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 14px 10px;
  padding: 8px 10px 8px 12px;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius-lg);
  background: var(--cm-surface);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.storage-bar:hover {
  border-color: color-mix(in srgb, var(--cm-primary) 40%, var(--cm-border));
  box-shadow: var(--cm-shadow);
}

.storage-icon {
  flex: none;
  color: var(--cm-primary);
}

.storage-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 3px;
}

.storage-title {
  font-weight: 600;
  font-size: 13px;
}

.storage-usage {
  margin-left: 6px;
  font-weight: 400;
  font-size: 12px;
  color: var(--cm-muted);
}

.storage-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 11.5px;
  color: var(--cm-muted);
}

.chip {
  padding: 0 7px;
  border-radius: 999px;
  background: var(--cm-surface-2);
  border: 1px solid var(--cm-border);
}

.chip b {
  color: var(--cm-text);
  font-weight: 600;
}

.storage-chev {
  display: grid;
  color: var(--cm-muted);
  transform: rotate(-90deg);
}

/* Cookie 清單：每筆都是圓角卡片 */
.list {
  display: grid;
  gap: 6px;
  padding: 0 14px 12px;
}

.item {
  background: var(--cm-surface);
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius-lg);
  transition: box-shadow 0.15s, border-color 0.15s;
}

.item:hover {
  border-color: color-mix(in srgb, var(--cm-primary) 30%, var(--cm-border));
}

.item.open {
  box-shadow: var(--cm-shadow);
  border-color: color-mix(in srgb, var(--cm-primary) 40%, var(--cm-border));
}

.item-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px 9px 10px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.chev {
  display: grid;
  color: var(--cm-muted);
  transform: rotate(-90deg);
  transition: transform 0.15s;
}

.item.open .chev {
  transform: rotate(0deg);
  color: var(--cm-primary);
}

.name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.domain {
  max-width: 140px;
  font-size: 11.5px;
  color: var(--cm-muted);
  background: var(--cm-surface-2);
  border-radius: 999px;
  padding: 1px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-body {
  padding: 4px 12px 12px;
  border-top: 1px solid var(--cm-border);
  padding-top: 12px;
}

/* 新增／匯入／匯出面板 */
.panel {
  margin: 4px 14px 12px;
  padding: 12px 14px 14px;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: -4px 0 10px -6px;
  font-weight: 700;
}

.pad {
  padding: 4px 0;
}

.empty {
  padding: 36px 0;
}

/* 底部浮動工具列 */
.dock {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin: 0 14px 14px;
  padding: 5px;
}

.dock-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 0 7px;
  border: 0;
  border-radius: var(--cm-radius-lg);
  background: transparent;
  color: var(--cm-muted);
  font: inherit;
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.dock-btn:hover:not(:disabled) {
  background: var(--cm-hover);
  color: var(--cm-text);
}

.dock-btn.active {
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
}

.dock-btn.danger:hover:not(:disabled) {
  background: var(--cm-danger-soft);
  color: var(--cm-danger);
}

.dock-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
