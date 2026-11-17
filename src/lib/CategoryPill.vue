<script setup lang="ts">
import { computed, h } from 'vue'
import { NDropdown, type DropdownOption } from 'naive-ui'
import type { Category } from '../storage'
import { t } from '../i18n'

const NONE = '__none__'

const props = defineProps<{ categories: Category[]; value: string | null }>()
const emit = defineEmits<{ change: [string | null] }>()

const current = computed(() => props.categories.find((c) => c.id === props.value))

const options = computed<DropdownOption[]>(() => [
  ...props.categories.map((c) => ({
    key: c.id,
    label: c.name,
    icon: () => h('span', { class: 'color-dot', style: { background: c.color } }),
  })),
  { type: 'divider', key: 'd' },
  { key: NONE, label: t('common.uncategorized'), disabled: !props.value },
])

/** 以分類顏色產生淡色底與文字色 */
const pillStyle = computed(() => {
  const c = current.value?.color
  if (!c) return undefined
  return {
    color: c,
    background: `color-mix(in srgb, ${c} 12%, transparent)`,
    borderColor: `color-mix(in srgb, ${c} 22%, transparent)`,
  }
})
</script>

<template>
  <NDropdown
    :options="options"
    trigger="click"
    placement="bottom-start"
    @select="(k: string) => emit('change', k === NONE ? null : k)"
  >
    <button class="cat-pill" :class="{ empty: !current }" :style="pillStyle" type="button">
      <span v-if="current" class="color-dot" :style="{ background: current.color }" />
      <span>{{ current?.name ?? t('common.uncategorized') }}</span>
      <span class="chev">▾</span>
    </button>
  </NDropdown>
</template>
