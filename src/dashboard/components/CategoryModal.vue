<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NInput, NModal, NPopover, NSpace, NText, useMessage } from 'naive-ui'
import { PRESET_COLORS, newId, type Category } from '../../storage'
import { t } from '../../i18n'

const props = defineProps<{ show: boolean; categories: Category[] }>()
const emit = defineEmits<{ 'update:show': [boolean]; save: [Category[]] }>()

const message = useMessage()
const draft = ref<Category[]>([])

watch(
  () => props.show,
  (v) => {
    if (v) draft.value = props.categories.map((c) => ({ ...c }))
  },
)

function add() {
  draft.value.push({ id: newId(), name: '', color: PRESET_COLORS[draft.value.length % PRESET_COLORS.length] })
}

function remove(i: number) {
  draft.value.splice(i, 1)
}

function move(i: number, d: -1 | 1) {
  const j = i + d
  if (j < 0 || j >= draft.value.length) return
  const arr = draft.value
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}

function save() {
  const list = draft.value.map((c) => ({ ...c, name: c.name.trim() }))
  if (list.some((c) => !c.name)) {
    message.warning(t('cat.errEmpty'))
    return
  }
  emit('save', list)
  emit('update:show', false)
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="t('dash.manageCategories')"
    style="width: min(540px, 92vw)"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <NText depth="3" style="display: block; margin-bottom: 12px; font-size: 13px">
      {{ t('cat.note') }}
    </NText>

    <div v-for="(c, i) in draft" :key="c.id" class="row">
      <NPopover trigger="click" placement="bottom-start">
        <template #trigger>
          <button class="swatch" :style="{ background: c.color }" :title="t('cat.pickColor')" />
        </template>
        <div class="palette">
          <button
            v-for="color in PRESET_COLORS"
            :key="color"
            class="swatch"
            :class="{ active: color === c.color }"
            :style="{ background: color }"
            @click="c.color = color"
          />
        </div>
      </NPopover>
      <NInput v-model:value="c.name" :placeholder="t('cat.namePlaceholder')" size="small" />
      <NButton size="small" quaternary :disabled="i === 0" @click="move(i, -1)">↑</NButton>
      <NButton size="small" quaternary :disabled="i === draft.length - 1" @click="move(i, 1)">↓</NButton>
      <NButton size="small" quaternary type="error" @click="remove(i)">{{ t('common.delete') }}</NButton>
    </div>

    <NButton dashed block style="margin-top: 8px" @click="add">{{ t('cat.add') }}</NButton>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="emit('update:show', false)">{{ t('common.cancel') }}</NButton>
        <NButton type="primary" @click="save">{{ t('common.save') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  flex: none;
  padding: 0;
}

.swatch.active {
  border-color: rgba(128, 128, 128, 0.8);
}

.palette {
  display: grid;
  grid-template-columns: repeat(4, 22px);
  gap: 8px;
}
</style>
