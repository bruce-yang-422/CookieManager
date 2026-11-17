<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NAlert, NButton, NInput, NModal, NRadioButton, NRadioGroup, NSpace, NText, useMessage } from 'naive-ui'
import type { SiteGroup } from '../../lib/cookies'
import {
  EXPORT_FORMATS,
  FORMAT_LIST,
  formatHint,
  formatLabel,
  isExportFormat,
  serializeCookies,
  type ExportFormat,
} from '../../lib/cookieExport'
import { downloadText, today } from '../../lib/download'
import { t } from '../../i18n'

const props = defineProps<{ show: boolean; sites: SiteGroup[] }>()
const emit = defineEmits<{ 'update:show': [boolean] }>()

const FORMAT_KEY = 'cm-export-format'
const message = useMessage()

function readFormat(): ExportFormat {
  try {
    const v = localStorage.getItem(FORMAT_KEY)
    if (isExportFormat(v)) return v
  } catch {
    /* 忽略 */
  }
  return 'json'
}

const format = ref<ExportFormat>(readFormat())
const filename = ref('')

const cookies = computed(() => props.sites.flatMap((s) => s.cookies))
const meta = computed(() => EXPORT_FORMATS[format.value])
const title = computed(() =>
  props.sites.length === 1
    ? t('export.titleOne', { site: props.sites[0].site })
    : t('export.titleMany', { n: props.sites.length }),
)

function defaultName(): string {
  const base = props.sites.length === 1 ? props.sites[0].site : `${props.sites.length}-sites`
  return `cookies-${base}-${today()}`
}

watch(
  () => props.show,
  (v) => {
    if (v) filename.value = defaultName()
  },
)

watch(format, (v) => {
  try {
    localStorage.setItem(FORMAT_KEY, v)
  } catch {
    /* 忽略 */
  }
})

function close() {
  emit('update:show', false)
}

function download() {
  const name = (filename.value.trim() || defaultName()).replace(/[\\/:*?"<>|]/g, '_')
  downloadText(`${name}.${meta.value.ext}`, serializeCookies(cookies.value, format.value), meta.value.mime)
  message.success(t('export.exported', { n: cookies.value.length }))
  close()
}

async function copy() {
  try {
    await navigator.clipboard.writeText(serializeCookies(cookies.value, format.value))
    message.success(t('export.copiedCount', { n: cookies.value.length }))
  } catch {
    message.error(t('common.copyFailed'))
  }
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="title"
    style="width: min(560px, 92vw)"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <NSpace vertical :size="16">
      <NText depth="3">{{ t('export.summary', { sites: sites.length, cookies: cookies.length }) }}</NText>

      <div>
        <div class="label">{{ t('export.format') }}</div>
        <NRadioGroup v-model:value="format">
          <NRadioButton v-for="f in FORMAT_LIST" :key="f" :value="f">{{ formatLabel(f) }}</NRadioButton>
        </NRadioGroup>
        <NText depth="3" class="hint">{{ formatHint(format) }}</NText>
      </div>

      <div>
        <div class="label">{{ t('export.filename') }}</div>
        <NInput v-model:value="filename">
          <template #suffix>.{{ meta.ext }}</template>
        </NInput>
      </div>

      <NAlert type="warning" :show-icon="true">{{ t('common.credentialWarning') }}</NAlert>
    </NSpace>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="close">{{ t('common.cancel') }}</NButton>
        <NButton :disabled="!cookies.length" @click="copy">{{ t('export.copyToClipboard') }}</NButton>
        <NButton type="primary" :disabled="!cookies.length" @click="download">{{ t('common.download') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.label {
  font-weight: 500;
  margin-bottom: 6px;
}

.hint {
  display: block;
  margin-top: 6px;
  font-size: 13px;
}
</style>
