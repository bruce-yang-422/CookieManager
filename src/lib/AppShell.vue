<script setup lang="ts">
import { NConfigProvider, NDialogProvider, NGlobalStyle, NMessageProvider } from 'naive-ui'
import { useTheme } from './theme'
import { naiveLocale } from '../i18n'

const { theme } = useTheme()
</script>

<template>
  <NConfigProvider :theme="theme" :locale="naiveLocale.locale" :date-locale="naiveLocale.dateLocale">
    <NGlobalStyle />
    <NMessageProvider>
      <NDialogProvider>
        <slot />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
