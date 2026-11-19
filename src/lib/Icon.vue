<script setup lang="ts">
// 線條風格的小圖示（24×24 格線），顏色跟隨文字顏色
const PATHS = {
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  import: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  export: 'M12 15V3M7 8l5-5 5 5M5 21h14',
  search: 'M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0M21 21l-4.3-4.3',
  dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  back: 'M19 12H5M12 19l-7-7 7-7',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  file: 'M14 3H6v18h12V7zM14 3v4h4',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
  refresh: 'M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  chevron: 'M6 9l6 6 6-6',
  tag: 'M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9zM7.5 7.5h.01',
  database: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  broom: 'M12 2v8M7 10h10v3H7zM7 13l-2 8h14l-2-8M10 16l-.5 5M14 16l.5 5M12 16v5',
  more:'M6 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0M20 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
} as const

defineProps<{ name: keyof typeof PATHS; size?: number | string }>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :width="size ?? '1em'"
    :height="size ?? '1em'"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="PATHS[name]" />
  </svg>
</template>
