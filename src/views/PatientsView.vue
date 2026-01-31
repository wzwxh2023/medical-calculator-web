<script setup lang="ts">
import { NCard, NButton, NEmpty, NPopconfirm, NInput } from 'naive-ui'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientsStore } from '@/stores/patients'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const patientsStore = usePatientsStore()

// 状态
const searchText = ref('')

// 过滤后的患者列表
const filteredPatients = computed(() => {
  if (!searchText.value) {
    return patientsStore.patients
  }
  const query = searchText.value.toLowerCase()
  return patientsStore.patients.filter(p =>
    p.name?.toLowerCase().includes(query)
  )
})

// 加载患者列表
onMounted(async () => {
  await patientsStore.loadPatients()
})

// 选择患者开始计算
function selectPatient(patient: any) {
  patientsStore.loadToSession(patient)
  router.push('/scheme-select')
}

// 添加新患者
function addNewPatient() {
  router.push('/patient-info')
}

// 删除患者
async function deletePatient(id: number) {
  await patientsStore.deletePatient(id)
}
</script>

<template>
  <div class="patients-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1 class="page-title">患者管理</h1>
      <p class="page-subtitle">管理患者档案</p>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <NInput
        v-model:value="searchText"
        placeholder="搜索患者姓名"
        clearable
      >
        <template #prefix>
          <span style="font-size: 16px;">🔍</span>
        </template>
      </NInput>
    </div>

    <!-- 添加按钮 -->
    <div class="add-button">
      <NButton type="primary" block size="large" @click="addNewPatient">
        + 添加患者
      </NButton>
    </div>

    <!-- 患者列表 -->
    <div v-if="filteredPatients.length > 0" class="patients-list">
      <NCard
        v-for="patient in filteredPatients"
        :key="patient.id"
        class="patient-card"
        :bordered="false"
        @click="selectPatient(patient)"
      >
        <div class="patient-header">
          <div class="patient-name">{{ patient.name }}</div>
          <NPopconfirm @positive-click="deletePatient(patient.id!)">
            <template #trigger>
              <NButton size="tiny" text type="error" @click.stop>删除</NButton>
            </template>
            确定删除患者档案？相关历史记录也将被删除。
          </NPopconfirm>
        </div>
        <div class="patient-info">
          <span>{{ patient.gender === 2 ? '女' : '男' }}</span>
          <span>{{ patient.age }}岁</span>
          <span>{{ patient.height }}cm</span>
          <span>{{ patient.weight }}kg</span>
        </div>
        <div v-if="patient.lastCycle" class="patient-last">
          上次：第{{ patient.lastCycle }}周期
        </div>
      </NCard>
    </div>

    <!-- 空状态 -->
    <NEmpty
      v-if="filteredPatients.length === 0"
      :description="searchText ? '未找到匹配的患者' : '暂无患者档案'"
      style="margin-top: 60px;"
    >
      <template #extra>
        <NButton v-if="!searchText" type="primary" @click="addNewPatient">
          添加患者
        </NButton>
      </template>
    </NEmpty>

    <!-- 底部占位 -->
    <div class="bottom-spacer"></div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.patients-page {
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

.search-box {
  margin-bottom: 12px;
}

.add-button {
  margin-bottom: 20px;
}

.patients-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.patient-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.patient-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.patient-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.patient-info {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #595959;
  margin-bottom: 4px;
}

.patient-last {
  font-size: 12px;
  color: #8c8c8c;
}

.bottom-spacer {
  height: 16px;
}

@media (min-width: 768px) {
  .patients-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
