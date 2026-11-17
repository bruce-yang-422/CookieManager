<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  NButton,
  NCollapse,
  NCollapseItem,
  NEmpty,
  NInput,
  NPopconfirm,
  NRadioButton,
  NRadioGroup,
  NScrollbar,
  NSelect,
  NSpin,
  NText,
  useMessage,
} from 'naive-ui'
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
import { loadData, saveData, type AppData } from '../storage'
import Icon from '../lib/Icon.vue'
import LanguageSelect from '../lib/LanguageSelect.vue'
import { t } from '../i18n'
import CookieEditor from './components/CookieEditor.vue'
import ImportPanel from './components/ImportPanel.vue'
import ExportPanel from './components/ExportPanel.vue'

type View = 'list' | 'new' | 'import' | 'export'
type Scope = 'page' | 'site'

const SCOPE_KEY = 'cm-popup-scope'
const message = useMessage()

const loading = ref(true)
const busy = ref(false)
const tabUrl = ref('')
const host = ref('')
const site = ref<string | null>(null)
const isHttps = ref(false)
const cookies = ref<Cookie[]>([])
const data = ref<AppData>({ categories: [], assignments: {} })
const keyword = ref('')
const view = ref<View>('list')
const expanded = ref<string[]>([])
const scope = ref<Scope>(readScope())

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
  expanded.value = []
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
      tabUrl.value = url.href
      host.value = url.hostname
      isHttps.value = url.protocol === 'https:'
      site.value = siteOf(url.hostname)
    }
  } catch {
    /* 非一般網頁 */
  }
  await load()
  loading.value = false
})

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return cookies.value
  return cookies.value.filter((c) => c.name.toLowerCase().includes(kw) || c.value.toLowerCase().includes(kw))
})

// ---------- 分類 ----------
const categoryId = computed(() => {
  if (!site.value) return null
  const id = data.value.assignments[site.value]
  return data.value.categories.some((c) => c.id === id) ? id : null
})
const categoryOptions = computed(() => data.value.categories.map((c) => ({ label: c.name, value: c.id })))

async function setCategory(v: string | null) {
  if (!site.value) return
  if (v) data.value.assignments[site.value] = v
  else delete data.value.assignments[site.value]
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
  if (await run(() => replaceCookie(old, d), t('pop.saved', { name: d.name }))) expanded.value = []
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
  return v === 'new' ? t('pop.newTitle') : v === 'import' ? t('pop.importTitle') : t('pop.exportTitle')
}

function toggleView(v: View) {
  view.value = view.value === v ? 'list' : v
}

function openDashboard() {
  chrome.runtime.openOptionsPage()
  window.close()
}
</script>

<template>
  <div class="popup">
    <!-- 標題列 -->
    <header class="header">
      <div class="site-cell title">
        <img v-if="site" :src="faviconUrl(site)" alt="" />
        <span>{{ site ? (scope === 'page' ? host : site) : 'Cookie Manager' }}</span>
      </div>
      <NText v-if="site" depth="3" class="count">{{ cookies.length }}</NText>
      <LanguageSelect size="small" />
      <NButton quaternary size="small" :title="t('common.openDashboard')" @click="openDashboard">
        <template #icon><Icon name="dashboard" /></template>
      </NButton>
    </header>

    <NSpin :show="loading" class="spin">
      <template v-if="site">
        <div class="toolbar">
          <NRadioGroup v-model:value="scope" size="small">
            <NRadioButton value="page" :title="t('pop.scopePageTip')">{{ t('pop.scopePage') }}</NRadioButton>
            <NRadioButton value="site" :title="t('pop.scopeSiteTip', { site })">{{ t('pop.scopeSite') }}</NRadioButton>
          </NRadioGroup>
          <NSelect
            :value="categoryId"
            :options="categoryOptions"
            :placeholder="t('common.uncategorized')"
            clearable
            size="small"
            class="category"
            @update:value="setCategory"
          />
        </div>

        <!-- 子畫面標題 -->
        <div v-if="view !== 'list'" class="subhead">
          <NButton quaternary size="small" @click="view = 'list'">
            <template #icon><Icon name="back" /></template>
            {{ t('common.back') }}
          </NButton>
          <span>{{ viewTitle(view) }}</span>
        </div>

        <!-- 列表 -->
        <template v-if="view === 'list'">
          <div class="search">
            <NInput v-model:value="keyword" size="small" :placeholder="t('pop.search')" clearable>
              <template #prefix><Icon name="search" /></template>
            </NInput>
          </div>
          <NScrollbar class="content">
            <NEmpty
              v-if="!filtered.length"
              :description="keyword ? t('pop.noMatch') : t('pop.noCookies')"
              class="empty"
            />
            <NCollapse v-else v-model:expanded-names="expanded" accordion class="list" arrow-placement="left">
              <NCollapseItem v-for="c in filtered" :key="cookieKey(c)" :name="cookieKey(c)">
                <template #header>
                  <span class="name">{{ c.name || t('pop.noName') }}</span>
                </template>
                <template #header-extra>
                  <NText depth="3" class="domain">{{ c.domain }}</NText>
                </template>
                <CookieEditor
                  :initial="draftFromCookie(c)"
                  :saving="busy"
                  @save="(d) => saveCookie(c, d)"
                  @delete="deleteCookie(c)"
                />
              </NCollapseItem>
            </NCollapse>
          </NScrollbar>
        </template>

        <NScrollbar v-else class="content">
          <div class="pad">
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
            <ExportPanel v-else :cookies="cookies" :name="scope === 'page' ? host : site" />
          </div>
        </NScrollbar>

        <!-- 底部工具列 -->
        <footer class="bar">
          <button class="bar-btn" :class="{ active: view === 'new' }" @click="toggleView('new')">
            <Icon name="plus" size="18" /><span>{{ t('common.add') }}</span>
          </button>
          <NPopconfirm
            :positive-text="t('common.deleteAll')"
            :negative-text="t('common.cancel')"
            @positive-click="deleteAll"
          >
            <template #trigger>
              <button class="bar-btn danger" :disabled="!cookies.length">
                <Icon name="trash" size="18" /><span>{{ t('common.deleteAll') }}</span>
              </button>
            </template>
            {{
              scope === 'page'
                ? t('pop.confirmDeleteAllPage', { n: cookies.length })
                : t('pop.confirmDeleteAllSite', { n: cookies.length })
            }}
          </NPopconfirm>
          <button class="bar-btn" :class="{ active: view === 'import' }" @click="toggleView('import')">
            <Icon name="import" size="18" /><span>{{ t('common.import') }}</span>
          </button>
          <button
            class="bar-btn"
            :class="{ active: view === 'export' }"
            :disabled="!cookies.length"
            @click="toggleView('export')"
          >
            <Icon name="export" size="18" /><span>{{ t('common.export') }}</span>
          </button>
        </footer>
      </template>

      <div v-else-if="!loading" class="pad">
        <NEmpty :description="t('pop.notWebsite')" class="empty" />
        <NButton block @click="openDashboard">{{ t('common.openDashboard') }}</NButton>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.popup {
  width: 400px;
  height: 560px;
  display: flex;
  flex-direction: column;
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

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.18);
}

.title {
  flex: 1;
  font-weight: 600;
  font-size: 15px;
}

.count {
  font-size: 12px;
  padding: 0 8px;
  border-radius: 10px;
  background: rgba(128, 128, 128, 0.15);
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 12px 0;
}

.category {
  flex: 1;
  min-width: 0;
}

.subhead {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 0;
  font-weight: 600;
}

.search {
  padding: 10px 12px 6px;
}

.content {
  flex: 1;
  min-height: 0;
}

.list {
  padding: 0 12px 8px;
}

.list :deep(.n-collapse-item) {
  margin: 0 !important;
  padding: 8px 0;
  border-top: 1px solid rgba(128, 128, 128, 0.15);
}

.list :deep(.n-collapse-item:first-child) {
  border-top: 0;
}

.list :deep(.n-collapse-item__header-main) {
  min-width: 0;
}

.name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.domain {
  font-size: 12px;
  max-width: 140px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pad {
  padding: 12px;
}

.empty {
  padding: 32px 0;
}

.bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(128, 128, 128, 0.18);
}

.bar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0 6px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  opacity: 0.85;
}

.bar-btn + .bar-btn,
.bar :deep(* + .bar-btn) {
  border-left: 1px solid rgba(128, 128, 128, 0.15);
}

.bar-btn:hover:not(:disabled),
.bar-btn.active {
  background: rgba(128, 128, 128, 0.12);
  opacity: 1;
}

.bar-btn.active {
  color: #18a058;
}

.bar-btn.danger:hover:not(:disabled) {
  color: #d03050;
}

.bar-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
