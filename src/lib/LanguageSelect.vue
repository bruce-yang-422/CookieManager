<script setup lang="ts">
import { computed, h } from 'vue'
import { NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { LOCALES, localeMode, setLocaleMode, t, type LocaleMode } from '../i18n'
import Icon from './Icon.vue'

defineProps<{ size?: 'tiny' | 'small' | 'medium' }>()

const options = computed<DropdownOption[]>(() =>
  [{ value: 'auto' as LocaleMode, label: t('common.languageAuto') }, ...LOCALES].map((o) => ({
    key: o.value,
    label: o.label,
    icon: () => h('span', { style: 'width:1em;display:inline-block;text-align:center' }, localeMode.value === o.value ? '✓' : ''),
  })),
)
</script>

<template>
  <NDropdown :options="options" trigger="click" @select="(k: LocaleMode) => setLocaleMode(k)">
    <NButton quaternary :size="size ?? 'medium'" :title="t('common.language')">
      <template #icon><Icon name="globe" /></template>
    </NButton>
  </NDropdown>
</template>
