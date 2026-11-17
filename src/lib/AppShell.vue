<script setup lang="ts">
import { watchEffect } from 'vue'
import { NConfigProvider, NDialogProvider, NGlobalStyle, NMessageProvider } from 'naive-ui'
import { useTheme } from './theme'
import { naiveLocale } from '../i18n'

const { theme, overrides, cssVars } = useTheme()

// 設計變數放在 <html>，彈出視窗與抽屜（掛在 body 底下）也能使用
watchEffect(() => {
  const style = document.documentElement.style
  for (const [k, v] of Object.entries(cssVars.value)) style.setProperty(k, v)
})
</script>

<template>
  <NConfigProvider
    :theme="theme"
    :theme-overrides="overrides"
    :locale="naiveLocale.locale"
    :date-locale="naiveLocale.dateLocale"
  >
    <NGlobalStyle />
    <NMessageProvider>
      <NDialogProvider>
        <slot />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
