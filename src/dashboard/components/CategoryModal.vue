<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NInput, NModal, NPopover, useMessage } from 'naive-ui'
import { PRESET_COLORS, newId, type Category } from '../../storage'
import { t } from '../../i18n'
import Icon from '../../lib/Icon.vue'

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
  // 新分類自動挑一個還沒用過的顏色
  const used = new Set(draft.value.map((c) => c.color.toLowerCase()))
  const color = PRESET_COLORS.find((c) => !used.has(c)) ?? PRESET_COLORS[draft.value.length % PRESET_COLORS.length]
  draft.value.push({ id: newId(), name: '', color })
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

function isPreset(color: string) {
  return PRESET_COLORS.includes(color.toLowerCase())
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
    <p class="note">{{ t('cat.note') }}</p>

    <div class="group">
      <div v-for="(c, i) in draft" :key="c.id" class="row">
        <NPopover trigger="click" placement="bottom-start" :show-arrow="false" raw>
          <template #trigger>
            <button type="button" class="swatch lg" :style="{ background: c.color }" :title="t('cat.pickColor')" />
          </template>
          <div class="palette">
            <button
              v-for="color in PRESET_COLORS"
              :key="color"
              type="button"
              class="swatch"
              :class="{ active: color === c.color.toLowerCase() }"
              :style="{ background: color, color }"
              @click="c.color = color"
            />
            <!-- 自訂顏色（如同 macOS 的「其他顏色」） -->
            <label
              class="swatch custom"
              :class="{ active: !isPreset(c.color) }"
              :style="!isPreset(c.color) ? { color: c.color } : undefined"
              :title="t('cat.customColor')"
            >
              <input v-model="c.color" type="color" />
            </label>
          </div>
        </NPopover>
        <NInput v-model:value="c.name" :placeholder="t('cat.namePlaceholder')" />
        <div class="row-actions">
          <button type="button" class="icon-btn" :disabled="i === 0" :title="'↑'" @click="move(i, -1)">
            <Icon name="chevron" style="transform: rotate(180deg)" />
          </button>
          <button type="button" class="icon-btn" :disabled="i === draft.length - 1" :title="'↓'" @click="move(i, 1)">
            <Icon name="chevron" />
          </button>
          <button type="button" class="icon-btn danger" :title="t('common.delete')" @click="remove(i)">
            <Icon name="trash" />
          </button>
        </div>
      </div>

      <button type="button" class="add-row" @click="add">
        <span class="add-icon"><Icon name="plus" /></span>
        {{ t('cat.add') }}
      </button>
    </div>

    <template #footer>
      <div class="footer">
        <NButton @click="emit('update:show', false)">{{ t('common.cancel') }}</NButton>
        <NButton type="primary" @click="save">{{ t('common.save') }}</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped>
.note {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--cm-muted);
}

/* iOS 分組清單 */
.group {
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius-lg);
  overflow: hidden;
  background: var(--cm-surface);
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px 8px 12px;
  border-bottom: 1px solid var(--cm-border);
}

.row-actions {
  display: flex;
  gap: 0;
}

.icon-btn:disabled {
  opacity: 0.3;
  cursor: default;
  background: transparent;
}

.add-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: var(--cm-primary);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.add-row:hover {
  background: var(--cm-hover);
}

.add-icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--cm-primary);
  color: #fff;
}

.add-icon svg {
  width: 14px;
  height: 14px;
}

/* 顏色選擇 */
.palette {
  display: grid;
  grid-template-columns: repeat(7, 26px);
  gap: 10px;
  padding: 14px;
  background: var(--cm-surface);
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius-xl);
  box-shadow: var(--cm-shadow-lg);
}

.swatch {
  position: relative;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 0;
  padding: 0;
  cursor: pointer;
  flex: none;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  transition: transform 0.12s;
}

.swatch:hover {
  transform: scale(1.1);
}

.swatch.lg {
  width: 28px;
  height: 28px;
}

/* 選中：macOS 樣式的白色內圈＋同色外圈 */
.swatch.active {
  box-shadow:
    0 0 0 2px var(--cm-surface),
    0 0 0 4px currentColor;
}

.swatch.custom {
  background: conic-gradient(#ff3b30, #ffcc00, #34c759, #32ade6, #5856d6, #af52de, #ff2d55, #ff3b30);
  overflow: hidden;
}

.swatch.custom input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
