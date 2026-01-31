<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NInputNumber, NRadioGroup, NRadio, NButton, NSpace, NAlert } from 'naive-ui'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useSettingsStore } from '@/stores/settings'
import { calculateBSA, calculateCcr, evaluateKidneyFunction, BSAFormula, Gender, CreatinineUnit } from '@/utils/calculator'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const settingsStore = useSettingsStore()

// 表单数据
const formData = ref({
  name: '',
  height: undefined as number | undefined,
  weight: undefined as number | undefined,
  age: undefined as number | undefined,
  gender: Gender.MALE,
  creatinine: undefined as number | undefined,
  creatinineUnit: CreatinineUnit.UMOL
})

// 计算结果
const bsa = ref(0)
const ccr = ref(0)
const kidneyEvaluation = ref<any>(null)

// 加载会话数据
onMounted(() => {
  if (sessionStore.currentPatient.name) {
    formData.value = {
      name: sessionStore.currentPatient.name || '',
      height: sessionStore.currentPatient.height,
      weight: sessionStore.currentPatient.weight,
      age: sessionStore.currentPatient.age,
      gender: sessionStore.currentPatient.gender || Gender.MALE,
      creatinine: sessionStore.currentPatient.creatinine,
      creatinineUnit: sessionStore.currentPatient.creatinineUnit || CreatinineUnit.UMOL
    }
  }
  // 加载设置中的默认单位
  formData.value.creatinineUnit = (settingsStore.settings.defaultCreatinineUnit === 'mg' ? CreatinineUnit.MG : CreatinineUnit.UMOL)
  // 触发计算
  calculate()
})

// 计算函数
function calculate() {
  const { height, weight, age, gender, creatinine, creatinineUnit } = formData.value

  if (height && weight) {
    bsa.value = calculateBSA(height, weight, BSAFormula.MOSTELLER, gender)
  } else {
    bsa.value = 0
  }

  if (age && weight && creatinine && gender !== undefined) {
    ccr.value = calculateCcr(age, weight, creatinine, creatinineUnit, gender)
    kidneyEvaluation.value = evaluateKidneyFunction(ccr.value)
  } else {
    ccr.value = 0
    kidneyEvaluation.value = null
  }
}

// 表单验证
const isValid = computed(() => {
  const { height, weight, age } = formData.value
  return !!(height && weight && age)
})

// 保存并继续
function saveAndContinue() {
  if (!isValid.value) {
    return
  }

  const patientData = {
    name: formData.value.name,
    height: formData.value.height,
    weight: formData.value.weight,
    age: formData.value.age,
    gender: formData.value.gender,
    creatinine: formData.value.creatinine,
    creatinineUnit: formData.value.creatinineUnit
  }
  console.log('[PatientInfo] 保存患者信息:', patientData)
  sessionStore.setPatient(patientData)
  console.log('[PatientInfo] 保存后检查 sessionStore.currentPatient:', sessionStore.currentPatient)
  console.log('[PatientInfo] 保存后检查 sessionStore.bsa:', sessionStore.bsa)
  console.log('[PatientInfo] 保存后检查 sessionStore.ccr:', sessionStore.ccr)

  // 跳转到方案选择
  router.push('/scheme-select')
}

// 返回首页
function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="patient-info-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1 class="page-title">患者信息</h1>
      <p class="page-subtitle">请输入患者基本信息用于计算</p>
    </div>

    <!-- 实时计算结果 -->
    <NCard v-if="bsa > 0" class="result-card" :bordered="false">
      <NSpace vertical :size="16">
        <div class="result-item">
          <div class="result-label">体表面积 (BSA)</div>
          <div class="result-value">{{ bsa }} <span class="result-unit">m²</span></div>
        </div>
        <div v-if="ccr > 0" class="result-item">
          <div class="result-label">肌酐清除率 (Ccr)</div>
          <div class="result-value">{{ ccr }} <span class="result-unit">mL/min</span></div>
        </div>
        <NAlert
          v-if="kidneyEvaluation"
          :type="kidneyEvaluation.level === 'normal' ? 'success' : 'warning'"
          :bordered="false"
        >
          {{ kidneyEvaluation.text }} - {{ kidneyEvaluation.adjustment }}
        </NAlert>
      </NSpace>
    </NCard>

    <!-- 表单 -->
    <NCard class="form-card" :bordered="false">
      <NForm label-placement="top" :show-feedback="false">
        <NFormItem label="患者姓名（可选）">
          <NInput
            v-model:value="formData.name"
            placeholder="请输入患者姓名"
            clearable
          />
        </NFormItem>

        <NFormItem label="性别" required>
          <NRadioGroup v-model:value="formData.gender" @update:value="calculate">
            <NRadio :value="Gender.MALE">男</NRadio>
            <NRadio :value="Gender.FEMALE">女</NRadio>
          </NRadioGroup>
        </NFormItem>

        <NFormItem label="年龄" required>
          <NInputNumber
            v-model:value="formData.age"
            :min="1"
            :max="150"
            placeholder="请输入年龄"
            style="width: 100%"
            @update:value="calculate"
          />
        </NFormItem>

        <NFormItem label="身高 (cm)" required>
          <NInputNumber
            v-model:value="formData.height"
            :min="30"
            :max="250"
            placeholder="请输入身高"
            style="width: 100%"
            @update:value="calculate"
          />
        </NFormItem>

        <NFormItem label="体重 (kg)" required>
          <NInputNumber
            v-model:value="formData.weight"
            :min="2"
            :max="300"
            placeholder="请输入体重"
            style="width: 100%"
            @update:value="calculate"
          />
        </NFormItem>

        <NFormItem label="血清肌酐">
          <NSpace vertical :size="8" style="width: 100%">
            <NRadioGroup v-model:value="formData.creatinineUnit" @update:value="calculate">
              <NRadio :value="CreatinineUnit.UMOL">μmol/L</NRadio>
              <NRadio :value="CreatinineUnit.MG">mg/dL</NRadio>
            </NRadioGroup>
            <NInputNumber
              v-model:value="formData.creatinine"
              :min="10"
              :max="formData.creatinineUnit === CreatinineUnit.UMOL ? 2000 : 200"
              :placeholder="`请输入肌酐值 (${formData.creatinineUnit === CreatinineUnit.UMOL ? 'μmol/L' : 'mg/dL'})`"
              style="width: 100%"
              @update:value="calculate"
            />
          </NSpace>
        </NFormItem>
      </NForm>
    </NCard>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <NButton size="large" @click="goBack">返回</NButton>
      <NButton type="primary" size="large" :disabled="!isValid" @click="saveAndContinue">
        下一步：选择方案
      </NButton>
    </div>

    <!-- 底部占位 -->
    <div class="bottom-spacer"></div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.patient-info-page {
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

.result-card {
  margin-bottom: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0050b3 0%, #003a8c 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.result-card :deep(.n-card__content) {
  padding: 24px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.result-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.result-value {
  font-size: 42px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.result-unit {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 6px;
}

.result-card :deep(.n-alert) {
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.result-card :deep(.n-alert__header) {
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
}

.result-card :deep(.n-alert__body) {
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
}

.form-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons :deep(.n-button) {
  flex: 1;
}

.bottom-spacer {
  height: 16px;
}

@media (min-width: 768px) {
  .patient-info-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
