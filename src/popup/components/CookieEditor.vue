<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { NButton, NCheckbox, NDatePicker, NInput, NPopconfirm, NSelect, NSpace } from 'naive-ui'
import type { CookieDraft, SameSite } from '../../lib/cookies'
import { t } from '../../i18n'

const props = defineProps<{ initial: CookieDraft; isNew?: boolean; saving?: boolean }>()
const emit = defineEmits<{ save: [CookieDraft]; delete: []; cancel: [] }>()

const d = reactive<CookieDraft>({ ...props.initial })
watch(
  () => props.initial,
  (v) => Object.assign(d, v),
)

const sameSiteOptions = computed<{ label: string; value: SameSite }[]>(() => [
  { label: t('ed.sameSiteUnspecified'), value: 'unspecified' },
  { label: 'Lax', value: 'lax' },
  { label: 'Strict', value: 'strict' },
  { label: 'None', value: 'no_restriction' },
])

const expiresMs = computed<number | null>({
  get: () => (d.expirationDate ? Math.round(d.expirationDate * 1000) : null),
  set: (v) => (d.expirationDate = v ? Math.floor(v / 1000) : undefined),
})

function save() {
  emit('save', { ...d, name: d.name.trim(), domain: d.domain.trim(), path: d.path.trim() || '/' })
}

function toggleSession(v: boolean) {
  d.session = v
  if (!v && !d.expirationDate) d.expirationDate = Math.floor(Date.now() / 1000) + 365 * 24 * 3600
}
</script>

<template>
  <div class="editor">
    <label class="field">
      <span>{{ t('ed.name') }}</span>
      <NInput v-model:value="d.name" size="small" :placeholder="t('ed.namePh')" />
    </label>
    <label class="field">
      <span>{{ t('ed.value') }}</span>
      <NInput
        v-model:value="d.value"
        type="textarea"
        size="small"
        :autosize="{ minRows: 2, maxRows: 6 }"
        :placeholder="t('ed.valuePh')"
        class="mono"
      />
    </label>
    <div class="row">
      <label class="field grow">
        <span>{{ t('ed.domain') }}</span>
        <NInput v-model:value="d.domain" size="small" />
      </label>
      <label class="field path">
        <span>{{ t('ed.path') }}</span>
        <NInput v-model:value="d.path" size="small" />
      </label>
    </div>
    <div class="row">
      <label class="field grow">
        <span>{{ t('ed.expires') }}</span>
        <NDatePicker
          v-model:value="expiresMs"
          type="datetime"
          size="small"
          :disabled="d.session"
          :placeholder="d.session ? t('ed.expiresSessionPh') : t('ed.expiresPh')"
          style="width: 100%"
        />
      </label>
      <label class="field samesite">
        <span>SameSite</span>
        <NSelect v-model:value="d.sameSite" :options="sameSiteOptions" size="small" />
      </label>
    </div>
    <div class="flags">
      <NCheckbox :checked="d.session" @update:checked="toggleSession">{{ t('common.session') }}</NCheckbox>
      <NCheckbox v-model:checked="d.hostOnly">{{ t('ed.hostOnly') }}</NCheckbox>
      <NCheckbox v-model:checked="d.secure">Secure</NCheckbox>
      <NCheckbox v-model:checked="d.httpOnly">HttpOnly</NCheckbox>
    </div>

    <NSpace justify="end" :size="8">
      <NButton v-if="isNew" size="small" @click="emit('cancel')">{{ t('common.cancel') }}</NButton>
      <NPopconfirm
        v-else
        :positive-text="t('common.delete')"
        :negative-text="t('common.cancel')"
        @positive-click="emit('delete')"
      >
        <template #trigger>
          <NButton size="small" type="error" quaternary>{{ t('common.delete') }}</NButton>
        </template>
        {{ t('common.confirmDeleteName', { name: initial.name }) }}
      </NPopconfirm>
      <NButton size="small" type="primary" :loading="saving" @click="save">
        {{ isNew ? t('common.add') : t('common.save') }}
      </NButton>
    </NSpace>
  </div>
</template>

<style scoped>
.editor {
  display: grid;
  gap: 8px;
}

.field {
  display: grid;
  gap: 2px;
  font-size: 12px;
}

.field > span {
  opacity: 0.7;
}

.row {
  display: flex;
  gap: 8px;
}

.grow {
  flex: 1;
  min-width: 0;
}

.path {
  width: 110px;
}

.samesite {
  width: 120px;
}

.flags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
}

.mono :deep(textarea) {
  font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
  font-size: 12px;
  word-break: break-all;
}
</style>
