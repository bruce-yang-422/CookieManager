<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NInput, NRadioButton, NRadioGroup, NSpace, NText, useMessage } from 'naive-ui'
import type { Cookie } from '../../lib/cookies'
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

const props = defineProps<{ cookies: Cookie[]; name: string }>()
const message = useMessage()

const FORMAT_KEY = 'cm-popup-export-format'
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
watch(format, (v) => {
  try {
    localStorage.setItem(FORMAT_KEY, v)
  } catch {
    /* 忽略 */
  }
})

const meta = computed(() => EXPORT_FORMATS[format.value])
const output = computed(() => serializeCookies(props.cookies, format.value))

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    message.success(t('export.copiedCount', { n: props.cookies.length }))
  } catch {
    message.error(t('common.copyFailed'))
  }
}

function download() {
  downloadText(`cookies-${props.name}-${today()}.${meta.value.ext}`, output.value, meta.value.mime)
  message.success(t('export.downloaded'))
}
</script>

<template>
  <div class="panel">
    <NRadioGroup v-model:value="format" size="small">
      <NRadioButton v-for="f in FORMAT_LIST" :key="f" :value="f">{{ formatLabel(f) }}</NRadioButton>
    </NRadioGroup>
    <NText depth="3" class="hint">{{ formatHint(format) }}</NText>
    <NInput :value="output" type="textarea" readonly class="mono" :autosize="{ minRows: 8, maxRows: 14 }" />
    <NText depth="3" class="hint">⚠ {{ t('common.credentialWarningShort') }}</NText>
    <NSpace justify="end">
      <NButton size="small" :disabled="!cookies.length" @click="copy">{{ t('common.copy') }}</NButton>
      <NButton size="small" type="primary" :disabled="!cookies.length" @click="download">
        {{ t('common.download') }}
      </NButton>
    </NSpace>
  </div>
</template>

<style scoped>
.panel {
  display: grid;
  gap: 10px;
}

.hint {
  font-size: 12px;
}

.mono :deep(textarea) {
  font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
  font-size: 12px;
  word-break: break-all;
}
</style>
