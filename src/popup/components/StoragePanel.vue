<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NCollapse,
  NCollapseItem,
  NInput,
  NPopconfirm,
  NSpin,
  useMessage,
} from 'naive-ui'
import { getSiteCookies, hostOf } from '../../lib/cookies'
import {
  DATA_TYPES,
  RISKY_TYPES,
  clearOrigins,
  expandOrigins,
  formatBytes,
  inspectTab,
  loadSiteDataSettings,
  openTabHosts,
  runTabAction,
  saveSiteDataSettings,
  type DataType,
  type StorageArea,
  type StorageSnapshot,
  type TabAction,
} from '../../lib/siteData'
import Icon from '../../lib/Icon.vue'
import { t, type MessageKey } from '../../i18n'

const props = defineProps<{ tabId: number; origin: string; site: string; scope: 'page' | 'site' }>()
const emit = defineEmits<{ changed: [] }>()

const RELOAD_KEY = 'cm-reload-after-clear'
const message = useMessage()

const types = ref<DataType[]>([])
const reloadAfter = ref(readReloadAfter())
const siteOrigins = ref<string[]>([])
const snapshot = ref<StorageSnapshot | null>(null)
const inspectError = ref('')
const inspecting = ref(false)
const busy = ref(false)
const editing = ref<string | null>(null)
const draft = ref('')

function readReloadAfter(): boolean {
  try {
    return localStorage.getItem(RELOAD_KEY) === '1'
  } catch {
    return false
  }
}

watch(reloadAfter, (v) => {
  try {
    localStorage.setItem(RELOAD_KEY, v ? '1' : '0')
  } catch {
    /* 忽略 */
  }
})

watch(types, (v) => saveSiteDataSettings({ types: v }))

const typeLabel = (type: DataType | 'sessionStorage') => t(`data.type.${type}` as MessageKey)
const hasRisky = computed(() => types.value.some((x) => RISKY_TYPES.has(x)))

const targetOrigins = computed(() => (props.scope === 'page' ? [props.origin] : siteOrigins.value))
const targetLabel = computed(() =>
  props.scope === 'page'
    ? t('data.targetPage', { origin: props.origin })
    : t('data.targetSite', { site: props.site, n: siteOrigins.value.length }),
)

async function loadSiteOrigins() {
  const cookies = await getSiteCookies(props.site)
  const hosts = [new URL(props.origin).host, ...cookies.map((c) => hostOf(c.domain)), ...(await openTabHosts())]
  siteOrigins.value = expandOrigins([props.site], hosts)
}

async function inspect() {
  inspecting.value = true
  try {
    snapshot.value = await inspectTab(props.tabId)
    inspectError.value = ''
  } catch (err) {
    snapshot.value = null
    inspectError.value = (err as Error).message
  } finally {
    inspecting.value = false
  }
}

// 重新載入頁面後，等載入完成再讀取一次儲存空間
function onTabUpdated(tabId: number, info: { status?: string }) {
  if (tabId === props.tabId && info.status === 'complete') inspect()
}

onMounted(async () => {
  types.value = (await loadSiteDataSettings()).types
  chrome.tabs.onUpdated.addListener(onTabUpdated)
  await Promise.all([inspect(), loadSiteOrigins()])
})
onBeforeUnmount(() => chrome.tabs.onUpdated.removeListener(onTabUpdated))

// ---------- 清除 ----------
async function clearSelected() {
  if (!types.value.length) {
    message.warning(t('data.noTypes'))
    return
  }
  busy.value = true
  const origins = targetOrigins.value
  const selected = [...types.value]
  try {
    if (reloadAfter.value) {
      // 清除 HTTP 快取要掃描整個快取，可能需要好幾秒。
      // 先清除會影響頁面行為的資料（Service Worker、Storage、Cookie…），完成後立刻以略過快取的方式重新載入；
      // HTTP 快取在背景繼續清除。瀏覽器依序處理清除工作，所以要先送出其他類型，避免排在快取後面。
      const rest = clearOrigins(origins, selected.filter((x) => x !== 'cache'))
      const httpCache = selected.includes('cache') ? clearOrigins(origins, ['cache']) : Promise.resolve()
      await rest
      if (selected.includes('cookies')) emit('changed')
      await chrome.tabs.reload(props.tabId, { bypassCache: true })
      await httpCache
      message.success(t('data.cleared'))
    } else {
      await clearOrigins(origins, selected)
      message.success(t('data.cleared'))
      if (selected.includes('cookies')) emit('changed')
      await inspect()
    }
  } catch (err) {
    message.error((err as Error).message || t('data.failed'))
  } finally {
    busy.value = false
  }
}

function reloadPage() {
  chrome.tabs.reload(props.tabId)
}

// ---------- 個別項目 ----------
async function act(action: TabAction, name: string, ok = t('data.deleted', { name })) {
  busy.value = true
  try {
    const result = await runTabAction(props.tabId, action)
    if (result === 'ok') message.success(ok)
    else if (result === 'blocked') message.warning(t('data.dbBlocked', { name }))
    else message.error(t('data.failed'))
    editing.value = null
    await inspect()
  } catch (err) {
    message.error((err as Error).message || t('data.failed'))
  } finally {
    busy.value = false
  }
}

function editKey(area: StorageArea, key: string) {
  return `${area}|${key}`
}

function toggleEdit(area: StorageArea, key: string, value: string) {
  const id = editKey(area, key)
  editing.value = editing.value === id ? null : id
  draft.value = value
}

function preview(value: string): string {
  return value.length > 120 ? `${value.slice(0, 120)}…` : value
}

const areas = computed(() =>
  snapshot.value
    ? ([
        { area: 'local', name: typeLabel('localStorage'), items: snapshot.value.local },
        { area: 'session', name: typeLabel('sessionStorage'), items: snapshot.value.session },
      ] as const)
    : [],
)

const usage = computed(() => (snapshot.value?.usage != null ? formatBytes(snapshot.value.usage) : ''))
</script>

<template>
  <div class="storage">
    <!-- 快速清除 -->
    <section class="block">
      <div class="label">{{ t('data.types') }}</div>
      <NCheckboxGroup v-model:value="types">
        <div class="types">
          <NCheckbox v-for="type in DATA_TYPES" :key="type" :value="type" size="small" :label="typeLabel(type)" />
        </div>
      </NCheckboxGroup>
      <NAlert v-if="hasRisky" type="warning" :show-icon="false" class="warn">{{ t('data.riskWarning') }}</NAlert>
      <div class="target" :title="targetOrigins.join('\n')">{{ targetLabel }}</div>
      <div class="clear-row">
        <NCheckbox v-model:checked="reloadAfter" size="small">{{ t('data.reloadAfter') }}</NCheckbox>
        <NPopconfirm
          :positive-text="t('clear.run')"
          :negative-text="t('common.cancel')"
          @positive-click="clearSelected"
        >
          <template #trigger>
            <NButton size="small" type="error" secondary :loading="busy" :disabled="!types.length">
              <template #icon><Icon name="broom" /></template>
              {{ t('data.clearBtn') }}
            </NButton>
          </template>
          {{ t('data.confirmClear', { target: scope === 'page' ? origin : site }) }}
        </NPopconfirm>
      </div>
    </section>

    <!-- 目前頁面的儲存空間 -->
    <section class="block">
      <div class="inspect-head">
        <div class="label">
          {{ t('data.inspect') }}
          <span v-if="usage" class="usage">{{ t('data.usage', { size: usage }) }}</span>
        </div>
        <button type="button" class="icon-btn" :title="t('data.refresh')" @click="inspect">
          <Icon name="refresh" />
        </button>
        <NButton size="tiny" quaternary @click="reloadPage">{{ t('data.reloadPage') }}</NButton>
      </div>
      <div class="note">{{ t('data.inspectNote', { origin }) }}</div>

      <NSpin :show="inspecting && !snapshot" size="small">
        <div v-if="inspectError" class="error">{{ t('data.inspectFailed', { msg: inspectError }) }}</div>
        <NCollapse v-else-if="snapshot" class="sections" :default-expanded-names="[]">
          <!-- Local／Session Storage -->
          <NCollapseItem v-for="a in areas" :key="a.area" :name="a.area">
            <template #header>
              <span class="sec-name">{{ a.name }}</span>
            </template>
            <template #header-extra>
              <span class="count-pill">{{ a.items.length }}</span>
            </template>
            <div v-if="!a.items.length" class="empty">{{ t('data.empty') }}</div>
            <template v-else>
              <div v-for="it in a.items" :key="it.key" class="row" :class="{ open: editing === editKey(a.area, it.key) }">
                <button type="button" class="row-main" @click="toggleEdit(a.area, it.key, it.value)">
                  <span class="key">{{ it.key || t('data.noKey') }}</span>
                  <span class="val">{{ preview(it.value) }}</span>
                </button>
                <button
                  type="button"
                  class="icon-btn danger"
                  :title="t('common.delete')"
                  :disabled="busy"
                  @click="act({ kind: 'removeItem', area: a.area, key: it.key }, it.key)"
                >
                  <Icon name="trash" />
                </button>
                <div v-if="editing === editKey(a.area, it.key)" class="editor">
                  <NInput v-model:value="draft" type="textarea" size="small" :autosize="{ minRows: 2, maxRows: 8 }" />
                  <div class="editor-actions">
                    <NButton size="tiny" @click="editing = null">{{ t('common.cancel') }}</NButton>
                    <NButton
                      size="tiny"
                      type="primary"
                      :loading="busy"
                      @click="
                        act(
                          { kind: 'setItem', area: a.area, key: it.key, value: draft },
                          it.key,
                          t('data.saved', { name: it.key }),
                        )
                      "
                    >
                      {{ t('common.save') }}
                    </NButton>
                  </div>
                </div>
              </div>
              <NPopconfirm
                :positive-text="t('data.clearSection')"
                :negative-text="t('common.cancel')"
                @positive-click="act({ kind: 'clearArea', area: a.area }, a.name)"
              >
                <template #trigger>
                  <button type="button" class="link danger">{{ t('data.clearSection') }}</button>
                </template>
                {{ t('data.confirmClearSection', { name: a.name, n: a.items.length }) }}
              </NPopconfirm>
            </template>
          </NCollapseItem>

          <!-- IndexedDB -->
          <NCollapseItem name="idb">
            <template #header><span class="sec-name">{{ typeLabel('indexedDB') }}</span></template>
            <template #header-extra><span class="count-pill">{{ snapshot.databases.length }}</span></template>
            <div v-if="!snapshot.databases.length" class="empty">{{ t('data.empty') }}</div>
            <div v-for="db in snapshot.databases" :key="db.name" class="row">
              <div class="row-main static">
                <span class="key">{{ db.name }}</span>
                <span class="val">{{ t('data.version', { v: db.version }) }}</span>
              </div>
              <NPopconfirm
                :positive-text="t('common.delete')"
                :negative-text="t('common.cancel')"
                @positive-click="act({ kind: 'deleteDb', name: db.name }, db.name)"
              >
                <template #trigger>
                  <button type="button" class="icon-btn danger" :title="t('common.delete')" :disabled="busy">
                    <Icon name="trash" />
                  </button>
                </template>
                {{ t('common.confirmDeleteName', { name: db.name }) }}
              </NPopconfirm>
            </div>
          </NCollapseItem>

          <!-- Cache Storage -->
          <NCollapseItem name="caches">
            <template #header><span class="sec-name">{{ typeLabel('cacheStorage') }}</span></template>
            <template #header-extra><span class="count-pill">{{ snapshot.caches.length }}</span></template>
            <div v-if="!snapshot.caches.length" class="empty">{{ t('data.empty') }}</div>
            <div v-for="c in snapshot.caches" :key="c.name" class="row">
              <div class="row-main static">
                <span class="key">{{ c.name }}</span>
                <span class="val">{{ t('data.entries', { n: c.entries }) }}</span>
              </div>
              <button
                type="button"
                class="icon-btn danger"
                :title="t('common.delete')"
                :disabled="busy"
                @click="act({ kind: 'deleteCache', name: c.name }, c.name)"
              >
                <Icon name="trash" />
              </button>
            </div>
          </NCollapseItem>

          <!-- Service Worker -->
          <NCollapseItem name="workers">
            <template #header><span class="sec-name">{{ typeLabel('serviceWorkers') }}</span></template>
            <template #header-extra><span class="count-pill">{{ snapshot.workers.length }}</span></template>
            <div v-if="!snapshot.workers.length" class="empty">{{ t('data.empty') }}</div>
            <div v-for="scope in snapshot.workers" :key="scope" class="row">
              <div class="row-main static">
                <span class="key">{{ scope }}</span>
              </div>
              <button
                type="button"
                class="icon-btn danger"
                :title="t('data.unregister')"
                :disabled="busy"
                @click="act({ kind: 'unregister', scope }, scope)"
              >
                <Icon name="trash" />
              </button>
            </div>
          </NCollapseItem>
        </NCollapse>
      </NSpin>
    </section>
  </div>
</template>

<style scoped>
.storage {
  display: grid;
  gap: 14px;
}

.block + .block {
  padding-top: 12px;
  border-top: 1px solid var(--cm-border);
}

.label {
  font-weight: 600;
  font-size: 12.5px;
  margin-bottom: 6px;
}

.types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
}

.warn {
  margin-top: 8px;
  font-size: 12px;
}

.target {
  margin-top: 8px;
  font-size: 12px;
  color: var(--cm-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.inspect-head {
  display: flex;
  align-items: center;
  gap: 2px;
}

.inspect-head .label {
  flex: 1;
  margin: 0;
}

.usage {
  margin-left: 6px;
  font-weight: 400;
  color: var(--cm-muted);
}

.note {
  font-size: 11.5px;
  color: var(--cm-muted);
  margin: 2px 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error {
  font-size: 12.5px;
  color: var(--cm-danger);
  padding: 8px 0;
}

.sections :deep(.n-collapse-item__header-main) {
  font-size: 13px;
}

.sec-name {
  font-weight: 500;
}

.empty {
  font-size: 12px;
  color: var(--cm-muted);
  padding: 2px 0 4px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  border-radius: var(--cm-radius-md);
}

.row + .row {
  border-top: 1px solid var(--cm-border);
}

.row-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 1px;
  padding: 5px 4px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.row-main.static {
  cursor: default;
}

.row-main:not(.static):hover .key {
  color: var(--cm-primary);
}

.key {
  font-size: 12.5px;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.val {
  font-size: 11.5px;
  color: var(--cm-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor {
  flex-basis: 100%;
  padding: 0 4px 8px;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 6px;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.link {
  margin-top: 6px;
  padding: 2px 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.link.danger {
  color: var(--cm-danger);
}
</style>
