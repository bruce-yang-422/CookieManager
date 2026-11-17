<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NInput, NSpace, NText } from 'naive-ui'
import { parseCookies } from '../../lib/cookieImport'
import { formatLabel } from '../../lib/cookieExport'
import type { CookieDraft } from '../../lib/cookies'
import { t } from '../../i18n'

const props = defineProps<{ host: string; secure: boolean; importing?: boolean }>()
const emit = defineEmits<{ import: [CookieDraft[]] }>()

const text = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const parsed = computed(() => {
  if (!text.value.trim()) return null
  try {
    return { ok: true as const, ...parseCookies(text.value, props.host, props.secure) }
  } catch (err) {
    return { ok: false as const, error: (err as Error).message }
  }
})

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) text.value = await file.text()
}
</script>

<template>
  <div class="panel">
    <NText depth="3" class="hint">{{ t('imp.hint', { host }) }}</NText>
    <NInput
      v-model:value="text"
      type="textarea"
      class="mono"
      :autosize="{ minRows: 8, maxRows: 14 }"
      placeholder='[{"name":"...","value":"...","domain":"..."}]'
    />
    <NText v-if="parsed && parsed.ok" type="success" class="status">
      {{ t('imp.detected', { format: formatLabel(parsed.format), n: parsed.cookies.length }) }}
    </NText>
    <NText v-else-if="parsed" type="error" class="status">{{ parsed.error }}</NText>

    <NSpace justify="space-between">
      <NButton size="small" @click="fileInput?.click()">{{ t('imp.chooseFile') }}</NButton>
      <NButton
        size="small"
        type="primary"
        :disabled="!parsed?.ok"
        :loading="importing"
        @click="parsed?.ok && emit('import', parsed.cookies)"
      >
        {{ t('common.import') }}
      </NButton>
    </NSpace>
    <input ref="fileInput" type="file" accept=".json,.txt,application/json,text/plain" hidden @change="onFile" />
  </div>
</template>

<style scoped>
.panel {
  display: grid;
  gap: 10px;
}

.hint,
.status {
  font-size: 12px;
}

.mono :deep(textarea) {
  font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
  font-size: 12px;
}
</style>
