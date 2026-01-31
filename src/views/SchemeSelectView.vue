<script setup lang="ts">
import { NCard, NButton, NSpace, NTag, NEmpty } from 'naive-ui'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import { CancerTypes, TreatmentScenarios, getSchemesByCancerAndScenario, type ChemotherapyScheme } from '@/data/schemes'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const sessionStore = useSessionStore()

// 状态
const selectedCancer = ref('')
const selectedScenario = ref('')
const currentCycle = ref(1)

// 可用的治疗场景
const availableScenarios = computed(() => {
  if (!selectedCancer.value) return []

  // 根据癌种返回可用场景
  const scenarioMap: Record<string, string[]> = {
    'colorectal': ['adjuvant', 'firstline'],
    'nsclc': ['firstline'],
    'sclc': ['limited', 'extensive'],
    'gastric': ['adjuvant', 'neoadjuvant', 'firstline'],
    'btc': ['firstline'],
    'breast': ['adjuvant', 'firstline'],
    'ovarian': ['adjuvant', 'firstline']
  }

  return scenarioMap[selectedCancer.value] || []
})

// 可用方案
const availableSchemes = computed(() => {
  if (!selectedCancer.value || !selectedScenario.value) {
    return []
  }
  return getSchemesByCancerAndScenario(selectedCancer.value, selectedScenario.value)
})

// 推荐方案
const recommendedSchemes = computed(() => {
  return availableSchemes.value.filter(s => s.recommended)
})

// 其他方案
const otherSchemes = computed(() => {
  return availableSchemes.value.filter(s => !s.recommended)
})

// 选择癌种
function selectCancer(cancerId: string) {
  selectedCancer.value = cancerId
  selectedScenario.value = '' // 重置场景
}

// 选择场景
function selectScenario(scenarioId: string) {
  selectedScenario.value = scenarioId
}

// 选择方案
function selectScheme(scheme: ChemotherapyScheme) {
  console.log('[SchemeSelect] 选择方案:', scheme)
  console.log('[SchemeSelect] 调用 setScheme 前 sessionStore.currentScheme:', sessionStore.currentScheme)
  sessionStore.setScheme(scheme)
  console.log('[SchemeSelect] 调用 setScheme 后 sessionStore.currentScheme:', sessionStore.currentScheme)
  sessionStore.setCycle(currentCycle.value)
  console.log('[SchemeSelect] 即将跳转到不良反应页面')
  router.push('/adverse-reactions')
}

// 返回上一步
function goBack() {
  router.push('/patient-info')
}

// 返回首页
function goHome() {
  router.push('/')
}

onMounted(() => {
  // 如果会话中有癌种，自动选中
  if (sessionStore.cancerType) {
    selectedCancer.value = sessionStore.cancerType
  }
})
</script>

<template>
  <div class="scheme-select-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1 class="page-title">选择化疗方案</h1>
      <p class="page-subtitle">请选择癌种和治疗场景</p>
    </div>

    <!-- 周期输入 -->
    <NCard class="cycle-card" :bordered="false">
      <div class="cycle-input">
        <label>当前周期</label>
        <input
          v-model.number="currentCycle"
          type="number"
          min="1"
          max="20"
          class="cycle-field"
        />
        <span class="cycle-unit">周期</span>
      </div>
    </NCard>

    <!-- 癌种选择 -->
    <div class="section-title">选择癌种</div>
    <div class="cancer-grid">
      <div
        v-for="cancer in CancerTypes"
        :key="cancer.id"
        class="cancer-item"
        :class="{ active: selectedCancer === cancer.id }"
        @click="selectCancer(cancer.id)"
      >
        <div class="cancer-icon">{{ cancer.icon }}</div>
        <div class="cancer-name">{{ cancer.name }}</div>
      </div>
    </div>

    <!-- 治疗场景选择 -->
    <div v-if="availableScenarios.length > 0" class="section-title">治疗场景</div>
    <div v-if="availableScenarios.length > 0" class="scenario-list">
      <div
        v-for="scenarioId in availableScenarios"
        :key="scenarioId"
        class="scenario-item"
        :class="{ active: selectedScenario === scenarioId }"
        @click="selectScenario(scenarioId)"
      >
        {{ TreatmentScenarios[scenarioId]?.name }}
      </div>
    </div>

    <!-- 方案列表 -->
    <div v-if="availableSchemes.length > 0" class="section-title">选择方案</div>

    <!-- 推荐方案 -->
    <div v-if="recommendedSchemes.length > 0">
      <div class="scheme-section-title">
        <NTag type="success" size="small">推荐</NTag>
      </div>
      <NSpace vertical :size="12">
        <NCard
          v-for="scheme in recommendedSchemes"
          :key="scheme.id"
          class="scheme-card recommended"
          :bordered="false"
          @click="selectScheme(scheme)"
        >
          <div class="scheme-header">
            <span class="scheme-name">{{ scheme.name }}</span>
            <NTag type="success" size="tiny">{{ scheme.level }}</NTag>
          </div>
          <div class="scheme-desc">{{ scheme.description }}</div>
          <div class="scheme-meta">
            <span>周期：{{ scheme.periodDays }}天</span>
            <span v-if="scheme.recommendedCycles">
              推荐 {{ scheme.recommendedCycles }} 周期
            </span>
          </div>
        </NCard>
      </NSpace>
    </div>

    <!-- 其他方案 -->
    <div v-if="otherSchemes.length > 0">
      <div class="scheme-section-title">其他方案</div>
      <NSpace vertical :size="12">
        <NCard
          v-for="scheme in otherSchemes"
          :key="scheme.id"
          class="scheme-card"
          :bordered="false"
          @click="selectScheme(scheme)"
        >
          <div class="scheme-header">
            <span class="scheme-name">{{ scheme.name }}</span>
            <NTag size="tiny">{{ scheme.level }}</NTag>
          </div>
          <div class="scheme-desc">{{ scheme.description }}</div>
          <div class="scheme-meta">
            <span>周期：{{ scheme.periodDays }}天</span>
          </div>
        </NCard>
      </NSpace>
    </div>

    <!-- 空状态 -->
    <NEmpty v-if="selectedCancer && availableScenarios.length === 0" description="该癌种暂无可用方案" />

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <NButton size="large" @click="goBack">上一步</NButton>
      <NButton size="large" @click="goHome">返回首页</NButton>
    </div>

    <!-- 底部占位 -->
    <div class="bottom-spacer"></div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.scheme-select-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 16px;
  padding-bottom: 80px;
}

.page-header {
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 4px;
}

.cycle-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.cycle-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cycle-input label {
  font-size: 14px;
  color: #595959;
  white-space: nowrap;
}

.cycle-field {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 16px;
  text-align: center;
}

.cycle-unit {
  font-size: 14px;
  color: #8c8c8c;
  white-space: nowrap;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
  margin-top: 8px;
}

.cancer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.cancer-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.cancer-item:hover {
  border-color: #1890ff;
  background: #e6f0ff;
}

.cancer-item.active {
  border-color: #1890ff;
  background: #e6f0ff;
}

.cancer-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.cancer-name {
  font-size: 12px;
  color: #595959;
}

.scenario-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.scenario-item {
  padding: 8px 16px;
  background: #ffffff;
  border-radius: 20px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #d9d9d9;
}

.scenario-item:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.scenario-item.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.scheme-section-title {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.scheme-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.scheme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.scheme-card.recommended {
  border: 1px solid #52c41a;
  background: linear-gradient(to right, #f6ffed 0%, #ffffff 100%);
}

.scheme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.scheme-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.scheme-desc {
  font-size: 14px;
  color: #595959;
  margin-bottom: 8px;
}

.scheme-meta {
  font-size: 12px;
  color: #8c8c8c;
  display: flex;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-buttons :deep(.n-button) {
  flex: 1;
}

.bottom-spacer {
  height: 16px;
}

@media (min-width: 768px) {
  .scheme-select-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
