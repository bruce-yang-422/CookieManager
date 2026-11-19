<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NInput,
  NModal,
  NPopconfirm,
  NRadioButton,
  NRadioGroup,
  NSelect,
  NSpace,
  NText,
  useMessage,
} from 'naive-ui'
import {
  DATA_TYPES,
  RISKY_TYPES,
  SINCE_RANGES,
  clearAllSites,
  clearOrigins,
  expandOrigins,
  loadSiteDataSettings,
  openTabHosts,
  parseOriginInput,
  saveSiteDataSettings,
  type DataType,
  type SinceRange,
} from '../../lib/siteData'
import { t, type MessageKey } from '../../i18n'

type Mode = 'origins' | 'all'

const props = defineProps<{
  show: boolean
  /** 預先填入的網站（從表格或批次選取開啟時）；空陣列代表清除所有網站 */
  sites: string[]
  /** 已知主機（來自 Cookie），用來展開子網域 */
  knownHosts: string[]
}>()
const emit = defineEmits<{ 'update:show': [boolean]; cleared: [types: DataType[]] }>()

const message = useMessage()

const mode = ref<Mode>('all')
const originText = ref('')
const excludeText = ref('')
const types = ref<DataType[]>([])
const since = ref<SinceRange>('all')
const tabHosts = ref<string[]>([])
const busy = ref(false)
const showList = ref(false)

watch(
  () => props.show,
  async (v) => {
    if (!v) return
    const settings = await loadSiteDataSettings()
    types.value = settings.types
    since.value = settings.since
    excludeText.value = settings.exclude.join('\n')
    mode.value = props.sites.length ? 'origins' : 'all'
    originText.value = props.sites.join('\n')
    showList.value = false
    tabHosts.value = await openTabHosts()
  },
)

// 設定變更時自動儲存
watch(types, (v) => props.show && saveSiteDataSettings({ types: v }))
watch(since, (v) => props.show && saveSiteDataSettings({ since: v }))
watch(excludeText, (v) => props.show && saveSiteDataSettings({ exclude: parseOriginInput(v).entries }))

const hosts = computed(() => [...props.knownHosts, ...tabHosts.value])
const parsedTargets = computed(() => parseOriginInput(originText.value))
const parsedExclude = computed(() => parseOriginInput(excludeText.value))
const targetOrigins = computed(() => expandOrigins(parsedTargets.value.entries, hosts.value))
const excludeOrigins = computed(() => expandOrigins(parsedExclude.value.entries, hosts.value))
const invalid = computed(() => (mode.value === 'origins' ? parsedTargets : parsedExclude).value.invalid)

const typeLabel = (type: DataType) => t(`data.type.${type}` as MessageKey)
const sinceOptions = computed(() =>
  SINCE_RANGES.map((r) => ({ value: r, label: t(`clear.since.${r}` as MessageKey) })),
)
const hasRisky = computed(() => types.value.some((x) => RISKY_TYPES.has(x)))
const canRun = computed(
  () => types.value.length > 0 && (mode.value === 'all' || targetOrigins.value.length > 0) && !busy.value,
)

function close() {
  emit('update:show', false)
}

async function run() {
  if (!types.value.length) {
    message.warning(t('data.noTypes'))
    return
  }
  busy.value = true
  try {
    if (mode.value === 'origins') {
      await clearOrigins(targetOrigins.value, types.value)
      message.success(t('clear.doneOrigins', { n: targetOrigins.value.length }))
    } else {
      await clearAllSites(types.value, excludeOrigins.value, since.value)
      message.success(t('clear.doneAll'))
    }
    emit('cleared', [...types.value])
    close()
  } catch (err) {
    message.error((err as Error).message || t('data.failed'))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="t('clear.title')"
    style="width: min(600px, 92vw)"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <NSpace vertical :size="16">
      <NRadioGroup v-model:value="mode">
        <NRadioButton value="origins">{{ t('clear.modeOrigins') }}</NRadioButton>
        <NRadioButton value="all">{{ t('clear.modeAll') }}</NRadioButton>
      </NRadioGroup>

      <!-- 指定網站 -->
      <div v-if="mode === 'origins'">
        <div class="label">{{ t('clear.origins') }}</div>
        <NInput
          v-model:value="originText"
          type="textarea"
          :placeholder="t('clear.originsPh')"
          :autosize="{ minRows: 3, maxRows: 8 }"
        />
        <NText depth="3" class="hint">{{ t('clear.originsHint') }}</NText>
        <div class="meta">
          <span>{{ t('clear.preview', { n: targetOrigins.length }) }}</span>
          <button v-if="targetOrigins.length" type="button" class="link" @click="showList = !showList">
            {{ t('clear.showOrigins') }}
          </button>
        </div>
        <pre v-if="showList" class="origin-list">{{ targetOrigins.join('\n') }}</pre>
      </div>

      <!-- 所有網站 -->
      <template v-else>
        <div>
          <div class="label">{{ t('clear.since') }}</div>
          <NSelect v-model:value="since" :options="sinceOptions" style="width: 200px" />
        </div>
        <div>
          <div class="label">{{ t('clear.exclude') }}</div>
          <NInput
            v-model:value="excludeText"
            type="textarea"
            :placeholder="t('clear.excludePh')"
            :autosize="{ minRows: 3, maxRows: 8 }"
          />
          <NText depth="3" class="hint">{{ t('clear.excludeHint') }}</NText>
          <div class="meta">
            <span>{{ t('clear.excludeCount', { n: excludeOrigins.length }) }}</span>
            <button v-if="excludeOrigins.length" type="button" class="link" @click="showList = !showList">
              {{ t('clear.showOrigins') }}
            </button>
          </div>
          <pre v-if="showList" class="origin-list">{{ excludeOrigins.join('\n') }}</pre>
        </div>
      </template>

      <NText v-if="invalid.length" type="error" class="hint">
        {{ t('clear.invalid', { list: invalid.join(', ') }) }}
      </NText>

      <div>
        <div class="label">{{ t('data.types') }}</div>
        <NCheckboxGroup v-model:value="types">
          <div class="types">
            <NCheckbox v-for="type in DATA_TYPES" :key="type" :value="type" :label="typeLabel(type)" />
          </div>
        </NCheckboxGroup>
      </div>

      <NAlert v-if="hasRisky" type="warning">{{ t('data.riskWarning') }}</NAlert>
    </NSpace>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="close">{{ t('common.cancel') }}</NButton>
        <NPopconfirm
          v-if="mode === 'all'"
          :positive-text="t('clear.run')"
          :negative-text="t('common.cancel')"
          @positive-click="run"
        >
          <template #trigger>
            <NButton type="error" :disabled="!canRun" :loading="busy">{{ t('clear.run') }}</NButton>
          </template>
          {{ t('clear.confirmAll') }}
        </NPopconfirm>
        <NButton v-else type="error" :disabled="!canRun" :loading="busy" @click="run">
          {{ t('clear.run') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.label {
  font-weight: 500;
  margin-bottom: 6px;
}

.hint {
  display: block;
  margin-top: 6px;
  font-size: 13px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  font-size: 13px;
  color: var(--cm-muted);
}

.link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--cm-primary);
  font: inherit;
  cursor: pointer;
}

.origin-list {
  max-height: 160px;
  overflow: auto;
  margin: 6px 0 0;
  padding: 8px 10px;
  border-radius: var(--cm-radius-md);
  background: var(--cm-surface-2);
  border: 1px solid var(--cm-border);
  font-size: 12px;
}

.types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 6px 12px;
}
</style>
