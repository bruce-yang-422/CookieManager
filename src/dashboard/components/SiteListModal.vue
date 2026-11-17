<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NAlert, NButton, NInput, NModal, NRadio, NRadioButton, NRadioGroup, useMessage } from 'naive-ui'
import {
  SITE_LIST_FORMATS,
  isSiteListFormat,
  serializeSiteList,
  type SiteListFormat,
  type SiteRow,
} from '../../lib/siteListExport'
import { downloadText, today } from '../../lib/download'
import { t } from '../../i18n'

type Scope = 'view' | 'all' | 'selected'

const props = defineProps<{
  show: boolean
  view: SiteRow[]
  all: SiteRow[]
  selected: SiteRow[]
  categoryNames: string[]
}>()
const emit = defineEmits<{ 'update:show': [boolean] }>()

const FORMAT_KEY = 'cm-site-list-format'
const message = useMessage()

function readFormat(): SiteListFormat {
  try {
    const v = localStorage.getItem(FORMAT_KEY)
    if (isSiteListFormat(v)) return v
  } catch {
    /* 忽略 */
  }
  return 'csv'
}

const format = ref<SiteListFormat>(readFormat())
const scope = ref<Scope>('view')
const filename = ref('')

watch(format, (v) => {
  try {
    localStorage.setItem(FORMAT_KEY, v)
  } catch {
    /* 忽略 */
  }
})

watch(
  () => props.show,
  (v) => {
    if (!v) return
    scope.value = props.selected.length ? 'selected' : 'view'
    filename.value = `sites-${today()}`
  },
)

const rows = computed(() => (scope.value === 'all' ? props.all : scope.value === 'selected' ? props.selected : props.view))
const meta = computed(() => SITE_LIST_FORMATS.find((f) => f.value === format.value)!)
const hint = computed(() =>
  format.value === 'csv' ? t('sites.csvHint') : format.value === 'json' ? t('sites.jsonHint') : t('sites.txtHint'),
)

function close() {
  emit('update:show', false)
}

function download() {
  const name = (filename.value.trim() || `sites-${today()}`).replace(/[\\/:*?"<>|]/g, '_')
  downloadText(
    `${name}.${meta.value.ext}`,
    serializeSiteList(rows.value, format.value, props.categoryNames),
    meta.value.mime,
  )
  message.success(t('sites.exported', { n: rows.value.length }))
  close()
}

async function copy() {
  try {
    // 複製時不需要 Excel 用的 BOM
    await navigator.clipboard.writeText(
      serializeSiteList(rows.value, format.value, props.categoryNames).replace(/^﻿/, ''),
    )
    message.success(t('sites.copied', { n: rows.value.length }))
  } catch {
    message.error(t('common.copyFailed'))
  }
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="t('sites.title')"
    style="width: min(520px, 92vw)"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <div class="body">
      <div>
        <div class="label">{{ t('sites.scope') }}</div>
        <NRadioGroup v-model:value="scope" class="scopes">
          <NRadio value="view">{{ t('sites.scopeView', { n: view.length }) }}</NRadio>
          <NRadio value="all">{{ t('sites.scopeAll', { n: all.length }) }}</NRadio>
          <NRadio value="selected" :disabled="!selected.length">
            {{ t('sites.scopeSelected', { n: selected.length }) }}
          </NRadio>
        </NRadioGroup>
      </div>

      <div>
        <div class="label">{{ t('export.format') }}</div>
        <NRadioGroup v-model:value="format">
          <NRadioButton v-for="f in SITE_LIST_FORMATS" :key="f.value" :value="f.value">{{ f.label }}</NRadioButton>
        </NRadioGroup>
        <p class="hint">{{ hint }}</p>
      </div>

      <div>
        <div class="label">{{ t('export.filename') }}</div>
        <NInput v-model:value="filename">
          <template #suffix>.{{ meta.ext }}</template>
        </NInput>
      </div>

      <NAlert type="info" :show-icon="true">{{ t('sites.note') }}</NAlert>
    </div>

    <template #footer>
      <div class="footer">
        <NButton @click="close">{{ t('common.cancel') }}</NButton>
        <NButton :disabled="!rows.length" @click="copy">{{ t('export.copyToClipboard') }}</NButton>
        <NButton type="primary" :disabled="!rows.length" @click="download">{{ t('common.download') }}</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped>
.body {
  display: grid;
  gap: 18px;
}

.label {
  font-weight: 600;
  margin-bottom: 8px;
}

.scopes {
  display: grid;
  gap: 6px;
}

.hint {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--cm-muted);
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
