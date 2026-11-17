<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import {
  NButton,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NDropdown,
  NEllipsis,
  NInput,
  NPopconfirm,
  NSpace,
  NTag,
  NText,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import {
  cookieKey,
  faviconUrl,
  formatExpiry,
  removeCookie,
  removeCookies,
  siteHomeUrl,
  type Cookie,
} from '../../lib/cookies'
import { t } from '../../i18n'
import Icon from '../../lib/Icon.vue'
import { copyText, type CopyFormat } from '../../lib/cookieExport'

const props = defineProps<{ show: boolean; site: string; cookies: Cookie[] }>()
const emit = defineEmits<{ 'update:show': [boolean]; changed: []; export: [] }>()

const message = useMessage()
const keyword = ref('')

watch(
  () => props.site,
  () => (keyword.value = ''),
)

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return props.cookies
  return props.cookies.filter(
    (c) => c.name.toLowerCase().includes(kw) || c.domain.toLowerCase().includes(kw) || c.value.toLowerCase().includes(kw),
  )
})

async function del(c: Cookie) {
  await removeCookie(c)
  message.success(t('common.deletedName', { name: c.name }))
  emit('changed')
}

async function delAll() {
  const n = props.cookies.length
  await removeCookies(props.cookies)
  message.success(t('common.deletedCount', { n }))
  emit('changed')
  emit('update:show', false)
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    message.success(t('common.copied'))
  } catch {
    message.error(t('common.copyFailed'))
  }
}

/** 複製選單：值、名稱、name=value、curl 標頭、JSON、Netscape */
const copyOptions = computed(() => [
  { key: 'value', label: t('copy.value') },
  { key: 'name', label: t('copy.name') },
  { key: 'pair', label: t('copy.pair') },
  { key: 'curl', label: t('copy.curl') },
  { type: 'divider', key: 'd' },
  { key: 'json', label: t('copy.json') },
  { key: 'netscape', label: t('copy.netscape') },
])

/** SameSite 顯示成 HTTP 標準寫法 */
const SAME_SITE_LABEL: Record<string, string> = { no_restriction: 'None', lax: 'Lax', strict: 'Strict' }

function iconButton(icon: 'copy' | 'trash', title: string, onClick?: () => void) {
  return h(
    'button',
    { class: ['icon-btn', icon === 'trash' && 'danger'], title, type: 'button', onClick },
    h(Icon, { name: icon }),
  )
}

// 每一列固定單行：過長的內容以「…」截斷，滑鼠停留可看完整內容
const columns = computed<DataTableColumns<Cookie>>(() => [
  {
    title: t('drawer.colName'),
    key: 'name',
    width: 170,
    ellipsis: { tooltip: true },
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (c) => h('span', { class: 'name' }, c.name || t('pop.noName')),
  },
  {
    title: t('drawer.colValue'),
    key: 'value',
    minWidth: 200,
    render: (c) =>
      h(
        NEllipsis,
        { style: 'max-width:100%', tooltip: { contentStyle: 'max-width:480px;word-break:break-all' } },
        () => c.value || h(NText, { depth: 3 }, () => t('drawer.empty')),
      ),
  },
  { title: t('ed.domain'), key: 'domain', width: 170, ellipsis: { tooltip: true } },
  { title: t('ed.path'), key: 'path', width: 80, ellipsis: { tooltip: true } },
  {
    title: t('drawer.colExpires'),
    key: 'expires',
    width: 165,
    sorter: (a, b) => (a.expirationDate ?? Infinity) - (b.expirationDate ?? Infinity),
    render: (c) => h('span', { class: 'nowrap' }, formatExpiry(c)),
  },
  {
    title: t('drawer.colFlags'),
    key: 'flags',
    width: 205,
    render: (c) =>
      h(
        'div',
        { class: 'flags' },
        [
          c.secure && h(NTag, { size: 'small', type: 'success', bordered: false }, () => 'Secure'),
          c.httpOnly && h(NTag, { size: 'small', type: 'info', bordered: false }, () => 'HttpOnly'),
          c.sameSite !== 'unspecified' &&
            h(NTag, { size: 'small', bordered: false }, () => SAME_SITE_LABEL[c.sameSite] ?? c.sameSite),
        ].filter(Boolean),
      ),
  },
  {
    title: '',
    key: 'actions',
    width: 80,
    align: 'center',
    render: (c) =>
      h('div', { class: 'actions' }, [
        h(
          NDropdown,
          {
            options: copyOptions.value,
            trigger: 'click',
            placement: 'bottom-end',
            onSelect: (key: CopyFormat) => copy(copyText(c, key)),
          },
          { default: () => iconButton('copy', t('common.copy')) },
        ),
        h(
          NPopconfirm,
          { onPositiveClick: () => del(c), positiveText: t('common.delete'), negativeText: t('common.cancel') },
          {
            trigger: () => iconButton('trash', t('common.delete')),
            default: () => t('common.confirmDeleteName', { name: c.name }),
          },
        ),
      ]),
  },
])
</script>

<template>
  <NDrawer :show="show" :width="'min(1100px, 94vw)'" @update:show="(v: boolean) => emit('update:show', v)">
    <NDrawerContent closable :native-scrollbar="false">
      <template #header>
        <div class="site-cell">
          <div class="fav"><img :src="faviconUrl(site, 32, cookies)" alt="" /></div>
          <span>{{ site }}</span>
          <span class="count-pill">{{ cookies.length }}</span>
          <a
            class="icon-btn"
            :href="siteHomeUrl(site, cookies)"
            target="_blank"
            rel="noopener noreferrer"
            :title="t('dash.openSite')"
          >
            <Icon name="external" />
          </a>
        </div>
      </template>

      <NSpace justify="space-between" style="margin-bottom: 12px">
        <NInput v-model:value="keyword" :placeholder="t('drawer.search')" clearable size="small" style="width: 280px" />
        <NSpace :size="8">
          <NButton size="small" secondary :disabled="!cookies.length" @click="emit('export')">
            {{ t('common.export') }}
          </NButton>
          <NPopconfirm :positive-text="t('common.deleteAll')" :negative-text="t('common.cancel')" @positive-click="delAll">
            <template #trigger>
              <NButton size="small" type="error" secondary :disabled="!cookies.length">
                {{ t('drawer.deleteAll') }}
              </NButton>
            </template>
            {{ t('drawer.confirmDeleteAll', { site, n: cookies.length }) }}
          </NPopconfirm>
        </NSpace>
      </NSpace>

      <NDataTable
        class="cookie-table"
        :columns="columns"
        :data="filtered"
        :row-key="cookieKey"
        size="small"
        :bordered="false"
        :scroll-x="1070"
        :single-line="true"
      />
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.cookie-table :deep(.n-data-table-wrapper) {
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius-lg);
  overflow: hidden;
  background: var(--cm-surface);
}

/* 固定單行，不換行 */
.cookie-table :deep(.n-data-table-td) {
  white-space: nowrap;
}

.cookie-table :deep(.name) {
  font-weight: 500;
}

.cookie-table :deep(.flags) {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
}

.cookie-table :deep(.actions) {
  display: inline-flex;
  gap: 2px;
}
</style>
