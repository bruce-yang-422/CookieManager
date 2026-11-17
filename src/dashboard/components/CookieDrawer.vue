<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import {
  NButton,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NEllipsis,
  NInput,
  NPopconfirm,
  NSpace,
  NTag,
  NText,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { cookieKey, faviconUrl, formatExpiry, removeCookie, removeCookies, type Cookie } from '../../lib/cookies'
import { t } from '../../i18n'

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

const columns = computed<DataTableColumns<Cookie>>(() => [
  {
    title: t('drawer.colName'),
    key: 'name',
    width: 180,
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (c) => h(NEllipsis, { style: 'max-width:170px' }, () => c.name),
  },
  {
    title: t('drawer.colValue'),
    key: 'value',
    render: (c) =>
      h(NEllipsis, { style: 'max-width:220px', tooltip: { contentStyle: 'max-width:480px;word-break:break-all' } }, () =>
        c.value || h(NText, { depth: 3 }, () => t('drawer.empty')),
      ),
  },
  {
    title: t('drawer.colDomainPath'),
    key: 'domain',
    width: 200,
    render: (c) =>
      h('div', [h('div', c.domain), h(NText, { depth: 3, style: 'font-size:12px' }, () => c.path)]),
  },
  {
    title: t('drawer.colExpires'),
    key: 'expires',
    width: 170,
    sorter: (a, b) => (a.expirationDate ?? Infinity) - (b.expirationDate ?? Infinity),
    render: (c) => formatExpiry(c),
  },
  {
    title: t('drawer.colFlags'),
    key: 'flags',
    width: 170,
    render: (c) =>
      h(NSpace, { size: 4 }, () =>
        [
          c.secure && h(NTag, { size: 'small', type: 'success', bordered: false }, () => 'Secure'),
          c.httpOnly && h(NTag, { size: 'small', type: 'info', bordered: false }, () => 'HttpOnly'),
          c.sameSite !== 'unspecified' && h(NTag, { size: 'small', bordered: false }, () => c.sameSite),
        ].filter(Boolean),
      ),
  },
  {
    title: '',
    key: 'actions',
    width: 150,
    align: 'right',
    render: (c) =>
      h(NSpace, { size: 4, justify: 'end', wrap: false }, () => [
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => copy(c.value) }, () => t('common.copy')),
        h(
          NPopconfirm,
          { onPositiveClick: () => del(c), positiveText: t('common.delete'), negativeText: t('common.cancel') },
          {
            trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, () => t('common.delete')),
            default: () => t('common.confirmDeleteName', { name: c.name }),
          },
        ),
      ]),
  },
])
</script>

<template>
  <NDrawer :show="show" :width="'min(1000px, 92vw)'" @update:show="(v: boolean) => emit('update:show', v)">
    <NDrawerContent closable :native-scrollbar="false">
      <template #header>
        <div class="site-cell">
          <img :src="faviconUrl(site)" alt="" />
          <span>{{ site }}</span>
          <NText depth="3" style="font-size: 13px; font-weight: normal">
            · {{ t('common.cookieCount', { n: cookies.length }) }}
          </NText>
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
        :columns="columns"
        :data="filtered"
        :row-key="cookieKey"
        size="small"
        :bordered="false"
        :scroll-x="1000"
      />
    </NDrawerContent>
  </NDrawer>
</template>
