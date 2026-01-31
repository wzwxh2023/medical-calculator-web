<script setup lang="ts">
import { NCard, NButton, NSwitch, NList, NListItem, NDivider } from 'naive-ui'
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { BSAFormula } from '@/utils/calculator'
import BottomNavigation from '@/components/BottomNavigation.vue'

const settingsStore = useSettingsStore()

// 状态
const theme = ref<'light' | 'dark'>('light')
const bsaFormula = ref(BSAFormula.MOSTELLER)
const creatinineUnit = ref<'umol' | 'mg'>('umol')

// BSA 公式选项
const bsaFormulaOptions = [
  { label: 'Mosteller 公式', value: BSAFormula.MOSTELLER, desc: '最常用，计算简便' },
  { label: '许文生氏公式', value: BSAFormula.XU_WENSHENG, desc: '区分男女，国内常用' },
  { label: 'DuBois 公式', value: BSAFormula.DUBOIS, desc: '国际标准公式' }
]

// 初始化
onMounted(async () => {
  await settingsStore.loadSettings()
  theme.value = settingsStore.settings.theme
  bsaFormula.value = settingsStore.settings.bsaFormula
  creatinineUnit.value = settingsStore.settings.defaultCreatinineUnit
})

// 切换主题
function toggleTheme(value: boolean) {
  theme.value = value ? 'dark' : 'light'
  settingsStore.setTheme(theme.value)
}

// 切换 BSA 公式
function changeBsaFormula(value: BSAFormula) {
  bsaFormula.value = value
  settingsStore.setBsaFormula(value)
}

// 切换肌酐单位
function toggleCreatinineUnit(value: boolean) {
  creatinineUnit.value = value ? 'mg' : 'umol'
  settingsStore.saveSetting('defaultCreatinineUnit', creatinineUnit.value)
}

// 导出数据
function exportData() {
  // TODO: 实现数据导出功能
  // TODO: 显示提示信息
}

// 清除数据
function clearData() {
  // TODO: 实现数据清除功能
  // TODO: 显示提示信息
}
</script>

<template>
  <div class="profile-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1 class="page-title">我的</h1>
    </div>

    <!-- 设置卡片 -->
    <div class="section-title">通用设置</div>
    <NCard class="settings-card" :bordered="false">
      <NList>
        <NListItem>
          <template #prefix>
            <span class="setting-icon">🌙</span>
          </template>
          深色模式
          <template #suffix>
            <NSwitch :value="theme === 'dark'" @update:value="toggleTheme" />
          </template>
        </NListItem>
      </NList>
    </NCard>

    <div class="section-title">计算设置</div>
    <NCard class="settings-card" :bordered="false">
      <NList>
        <NListItem>
          <template #prefix>
            <span class="setting-icon">📐</span>
          </template>
          <div>
            <div>BSA 计算公式</div>
            <div class="setting-desc">当前：{{ bsaFormulaOptions.find(o => o.value === bsaFormula)?.label }}</div>
          </div>
        </NListItem>
      </NList>
      <div class="formula-options">
        <div
          v-for="option in bsaFormulaOptions"
          :key="option.value"
          class="formula-option"
          :class="{ active: bsaFormula === option.value }"
          @click="changeBsaFormula(option.value)"
        >
          <div class="formula-radio">
            <div v-if="bsaFormula === option.value" class="radio-dot"></div>
          </div>
          <div>
            <div class="formula-label">{{ option.label }}</div>
            <div class="formula-desc">{{ option.desc }}</div>
          </div>
        </div>
      </div>
      <NDivider style="margin: 12px 0;" />
      <NList>
        <NListItem>
          <template #prefix>
            <span class="setting-icon">🧪</span>
          </template>
          <div>
            <div>默认肌酐单位</div>
            <div class="setting-desc">当前：{{ creatinineUnit === 'umol' ? 'μmol/L' : 'mg/dL' }}</div>
          </div>
          <template #suffix>
            <NSwitch :value="creatinineUnit === 'mg'" @update:value="toggleCreatinineUnit">
              <template #checked>mg/dL</template>
              <template #unchecked>μmol/L</template>
            </NSwitch>
          </template>
        </NListItem>
      </NList>
    </NCard>

    <div class="section-title">数据管理</div>
    <NCard class="settings-card" :bordered="false">
      <NList>
        <NListItem>
          <template #prefix>
            <span class="setting-icon">📤</span>
          </template>
          导出数据
          <template #suffix>
            <NButton text @click="exportData">导出</NButton>
          </template>
        </NListItem>
        <NListItem>
          <template #prefix>
            <span class="setting-icon">🗑️</span>
          </template>
          清除数据
          <template #suffix>
            <NButton text type="error" @click="clearData">清除</NButton>
          </template>
        </NListItem>
      </NList>
    </NCard>

    <!-- 关于 -->
    <div class="section-title">关于</div>
    <NCard class="settings-card" :bordered="false">
      <NList>
        <NListItem>
          <template #prefix>
            <span class="setting-icon">💊</span>
          </template>
          化疗剂量计算助手
        </NListItem>
        <NListItem>
          <template #prefix>
            <span class="setting-icon">📖</span>
          </template>
          数据来源：CSCO 指南
        </NListItem>
        <NListItem>
          <template #prefix>
            <span class="setting-icon">🔄</span>
          </template>
          版本：1.0.0
        </NListItem>
      </NList>
    </NCard>

    <!-- 免责声明 -->
    <NCard class="disclaimer-card" :bordered="false">
      <div class="disclaimer-title">⚠️ 免责声明</div>
      <div class="disclaimer-text">
        本应用仅供参考，不能替代专业医疗建议。使用本应用计算的结果需要由专业医护人员审核。
        任何医疗决策应由医生根据患者具体情况做出。
        开发者不对使用本应用造成的任何后果负责。
      </div>
    </NCard>

    <!-- 底部占位 -->
    <div class="bottom-spacer"></div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.profile-page {
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

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #8c8c8c;
  margin-bottom: 8px;
  margin-top: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-card {
  margin-bottom: 12px;
  border-radius: 12px;
}

.setting-icon {
  font-size: 20px;
}

.setting-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.formula-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formula-option {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.formula-option:hover {
  background: #e6f0ff;
}

.formula-option.active {
  background: #e6f0ff;
  border-color: #1890ff;
}

.formula-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #d9d9d9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.formula-option.active .formula-radio {
  border-color: #1890ff;
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: #1890ff;
  border-radius: 50%;
}

.formula-label {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.formula-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.disclaimer-card {
  margin-top: 16px;
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.disclaimer-title {
  font-weight: 600;
  color: #d46b08;
  margin-bottom: 8px;
}

.disclaimer-text {
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.6;
}

.bottom-spacer {
  height: 16px;
}

@media (min-width: 768px) {
  .profile-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
