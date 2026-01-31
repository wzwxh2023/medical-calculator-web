<script setup lang="ts">
import { NCard, NButton, NAlert, NModal, NInput } from 'naive-ui'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import { usePatientsStore } from '@/stores/patients'
import { useHistoryStore } from '@/stores/history'
import { HomeCareGuide, RedFlags } from '@/data/schemes'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const patientsStore = usePatientsStore()
const historyStore = useHistoryStore()

// 状态
const calculated = ref(false)
const showSaveModal = ref(false)
const patientNameInput = ref('')

// 计算结果
const result = computed(() => sessionStore.calculatedResult)
const scheme = computed(() => sessionStore.currentScheme)
const cycle = computed(() => sessionStore.currentCycle)
const patient = computed(() => sessionStore.currentPatient)

// 是否有剂量调整建议
const hasDoseAdjustment = computed(() => {
  return result.value?.kidneyFunction?.recommend === true
})

// 肾功能状态颜色
const kidneyColor = computed(() => {
  const level = result.value?.kidneyFunction?.level
  if (!level) return '#8c8c8c'
  if (level === 'normal') return '#52c41a'
  if (level === 'mild' || level === 'moderate') return '#faad14'
  return '#ff4d4f'
})

// 计算并保存
onMounted(() => {
  // 调试日志
  console.log('[ResultView] 开始检查计算结果')
  console.log('[ResultView] sessionStore.currentScheme:', sessionStore.currentScheme)
  console.log('[ResultView] sessionStore.currentPatient:', sessionStore.currentPatient)
  console.log('[ResultView] sessionStore.bsa:', sessionStore.bsa)
  console.log('[ResultView] sessionStore.ccr:', sessionStore.ccr)
  console.log('[ResultView] result.value:', result.value)

  // 如果没有计算结果，执行计算
  if (!result.value) {
    console.log('[ResultView] 没有计算结果，开始计算...')
    const res = sessionStore.calculate()
    console.log('[ResultView] 计算结果:', res)
    if (res) {
      calculated.value = true
      console.log('[ResultView] 计算成功，设置 calculated = true')
    } else {
      // 无法计算，显示提示而不是直接返回
      console.log('[ResultView] 计算失败，可能缺少患者信息或方案')
    }
  } else {
    calculated.value = true
    console.log('[ResultView] 已有计算结果，设置 calculated = true')
  }

  // 预填患者姓名
  if (patient.value.name) {
    patientNameInput.value = patient.value.name
  }
})

// 保存患者
async function savePatient() {
  if (!patientNameInput.value.trim()) {
    return
  }

  try {
    await patientsStore.saveFromSession(patientNameInput.value.trim())
    showSaveModal.value = false
    // 同时保存历史记录
    await historyStore.addRecord(patientNameInput.value.trim())
  } catch (e) {
    console.error('[ResultView] 保存失败:', e)
  }
}

// 仅保存历史记录
async function saveHistoryOnly() {
  try {
    await historyStore.addRecord(patientNameInput.value.trim() || undefined)
  } catch (e) {
    console.error('[ResultView] 保存失败:', e)
  }
}

// 新建计算
function newCalculation() {
  sessionStore.clear()
  router.push('/patient-info')
}

// 返回首页
function goHome() {
  router.push('/')
}

// 返回上一步
function goBack() {
  router.back()
}
</script>

<template>
  <div class="result-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1 class="page-title">计算结果</h1>
      <p class="page-subtitle">
        {{ scheme?.name }} - 第 {{ cycle }} 周期
      </p>
    </div>

    <template v-if="calculated && result">
      <!-- 患者信息摘要 -->
      <NCard class="summary-card" :bordered="false">
        <div class="summary-row">
          <span class="summary-label">患者</span>
          <span class="summary-value">{{ patient.name || '未命名' }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">体表面积</span>
          <span class="summary-value highlight">{{ result.bsa }} m²</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">肌酐清除率</span>
          <span class="summary-value highlight">{{ result.ccr }} mL/min</span>
        </div>
      </NCard>

      <!-- 肾功能状态 -->
      <NCard v-if="result.kidneyFunction" class="kidney-card" :bordered="false">
        <div class="kidney-status" :style="{ color: kidneyColor }">
          <span class="kidney-dot" :style="{ backgroundColor: kidneyColor }"></span>
          <span class="kidney-text">{{ result.kidneyFunction.text }}</span>
        </div>
        <div class="kidney-adjustment">{{ result.kidneyFunction.adjustment }}</div>
      </NCard>

      <!-- 剂量调整警告 -->
      <NAlert
        v-if="hasDoseAdjustment"
        type="warning"
        :bordered="false"
        class="warning-alert"
      >
        <template #header>
          注意：剂量调整建议
        </template>
        根据患者肾功能状态，部分药物可能需要调整剂量。请参考药物说明书或咨询临床药师。
      </NAlert>

      <!-- 方案警告信息 -->
      <NCard v-if="scheme?.warnings && scheme.warnings.length > 0" class="warnings-card" :bordered="false">
        <div v-for="(warning, index) in scheme.warnings" :key="index" class="warning-item">
          <div class="warning-icon" :class="warning.type">
            {{ warning.icon === 'snowflake' ? '❄️' : warning.icon === 'sun' ? '☀️' : warning.icon === 'tint' ? '💧' : warning.icon === 'bolt' ? '⚡' : warning.icon === 'exclamation-triangle' ? '⚠️' : 'ℹ️' }}
          </div>
          <div>
            <div class="warning-title">{{ warning.title }}</div>
            <div class="warning-content">{{ warning.content }}</div>
          </div>
        </div>
      </NCard>

      <!-- 药物剂量结果 -->
      <div class="section-title">药物剂量</div>
      <NCard class="doses-card" :bordered="false">
        <div
          v-for="(drug, index) in result.drugs"
          :key="index"
          class="drug-item"
        >
          <div class="drug-header">
            <span class="drug-name">{{ drug.name }}</span>
            <span class="drug-abbr">{{ drug.abbreviation }}</span>
          </div>
          <div class="drug-dose">
            <span class="dose-value">{{ drug.calculatedDose }}</span>
            <span class="dose-unit">{{ drug.dosageUnit === 'Calvert公式' ? 'mg' : drug.dosageUnit }}</span>
          </div>
          <div class="drug-info">
            <span class="drug-admin">{{ drug.administration }}</span>
            <span class="drug-day">{{ drug.day }}</span>
          </div>
          <div v-if="typeof drug.dosage === 'string'" class="drug-reference">
            参考剂量：{{ drug.dosage }}
          </div>
          <div v-else class="drug-reference">
            参考剂量：{{ drug.dosage }} {{ drug.dosageUnit }}
          </div>
        </div>
      </NCard>

      <!-- 居家护理 -->
      <div class="section-title">居家护理指南</div>
      <NCard class="care-card" :bordered="false">
        <div class="care-grid">
          <div v-for="(item, index) in HomeCareGuide" :key="index" class="care-item">
            <span class="care-emoji">{{ item.emoji }}</span>
            <div>
              <div class="care-title">{{ item.title }}</div>
              <div class="care-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </NCard>

      <!-- 红旗征 -->
      <div class="section-title">红旗征（需立即就医）</div>
      <NCard class="redflags-card" :bordered="false">
        <div class="redflags-grid">
          <div v-for="(flag, index) in RedFlags" :key="index" class="redflag-item">
            <div class="redflag-icon">🚨</div>
            <div class="redflag-text">{{ flag.text }}</div>
            <div class="redflag-desc">{{ flag.description }}</div>
          </div>
        </div>
      </NCard>

      <!-- 禁忌症 -->
      <NCard v-if="scheme?.contraindications && scheme.contraindications.length > 0" class="contraindications-card" :bordered="false">
        <template #header>
          <span style="color: #ff4d4f;">⚠️ 禁忌症</span>
        </template>
        <ul class="contraindications-list">
          <li v-for="(item, index) in scheme.contraindications" :key="index">
            {{ item }}
          </li>
        </ul>
      </NCard>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <NButton size="large" @click="goHome">返回首页</NButton>
        <NButton size="large" @click="newCalculation">新建计算</NButton>
        <NButton size="large" @click="saveHistoryOnly">保存记录</NButton>
        <NButton type="primary" size="large" @click="showSaveModal = true">
          保存患者
        </NButton>
      </div>
    </template>

    <!-- 错误状态 -->
    <template v-else>
      <NCard class="error-card" :bordered="false">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <div class="error-title">无法计算</div>
          <div class="error-desc">
            可能的原因：
          </div>
          <ul class="error-list">
            <li>未选择化疗方案</li>
            <li>患者信息不完整（需要身高、体重、年龄、性别）</li>
          </ul>
          <NButton type="primary" @click="goBack">
            返回上一步
          </NButton>
        </div>
      </NCard>
    </template>

    <!-- 底部占位 -->
    <div class="bottom-spacer"></div>

    <!-- 底部导航 -->
    <BottomNavigation />

    <!-- 保存患者弹窗 -->
    <NModal
      v-model:show="showSaveModal"
      preset="dialog"
      title="保存患者信息"
      positive-text="保存"
      negative-text="取消"
      @positive-click="savePatient"
    >
      <div class="save-form">
        <label>患者姓名</label>
        <NInput
          v-model:value="patientNameInput"
          placeholder="请输入患者姓名"
          autofocus
        />
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.result-page {
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

.summary-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 14px;
  color: #8c8c8c;
}

.summary-value {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.summary-value.highlight {
  color: #1890ff;
  font-weight: 600;
}

.kidney-card {
  margin-bottom: 16px;
  border-radius: 12px;
  padding: 16px;
}

.kidney-status {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.kidney-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.kidney-text {
  font-size: 16px;
  font-weight: 600;
}

.kidney-adjustment {
  font-size: 14px;
  color: #8c8c8c;
  padding-left: 16px;
}

.warning-alert {
  margin-bottom: 16px;
  border-radius: 12px;
}

.warnings-card {
  margin-bottom: 16px;
  border-radius: 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.warning-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.warning-item:last-child {
  padding-bottom: 0;
}

.warning-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.warning-title {
  font-weight: 600;
  color: #d46b08;
  margin-bottom: 2px;
}

.warning-content {
  font-size: 14px;
  color: #8c8c8c;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
  margin-top: 8px;
}

.doses-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.drug-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.drug-item:last-child {
  margin-bottom: 0;
}

.drug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.drug-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.drug-abbr {
  font-size: 12px;
  color: #8c8c8c;
  background: #e6e6e6;
  padding: 2px 6px;
  border-radius: 4px;
}

.drug-dose {
  margin-bottom: 8px;
}

.dose-value {
  font-size: 28px;
  font-weight: 700;
  color: #1890ff;
}

.dose-unit {
  font-size: 14px;
  color: #8c8c8c;
  margin-left: 4px;
}

.drug-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #595959;
  margin-bottom: 4px;
}

.drug-reference {
  font-size: 12px;
  color: #8c8c8c;
}

.care-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.care-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.care-item {
  display: flex;
  gap: 8px;
}

.care-emoji {
  font-size: 20px;
  flex-shrink: 0;
}

.care-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.care-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.redflags-card {
  margin-bottom: 16px;
  border-radius: 12px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.redflags-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.redflag-item {
  text-align: center;
}

.redflag-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.redflag-text {
  font-size: 13px;
  font-weight: 500;
  color: #262626;
}

.redflag-desc {
  font-size: 11px;
  color: #8c8c8c;
}

.contraindications-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.contraindications-list {
  margin: 0;
  padding-left: 20px;
}

.contraindications-list li {
  color: #ff4d4f;
  margin-bottom: 4px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.action-buttons :deep(.n-button) {
  height: 48px;
}

.save-form {
  padding: 16px 0;
}

.save-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #595959;
}

.bottom-spacer {
  height: 16px;
}

.error-card {
  margin-top: 20px;
  border-radius: 12px;
}

.error-content {
  text-align: center;
  padding: 20px 0;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.error-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 16px;
}

.error-list {
  text-align: left;
  display: inline-block;
  margin: 0 auto;
  padding: 0;
  color: #8c8c8c;
}

.error-list li {
  margin-bottom: 4px;
}

@media (min-width: 768px) {
  .result-page {
    max-width: 768px;
    margin: 0 auto;
  }

  .care-grid,
  .redflags-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media print {
  .bottom-nav,
  .action-buttons {
    display: none !important;
  }
}
</style>
