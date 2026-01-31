<script setup lang="ts">
import { NCard, NButton, NEmpty, NPopconfirm } from 'naive-ui'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryStore } from '@/stores/history'
import { formatDate } from '@/utils/format'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const historyStore = useHistoryStore()

// 状态
const loading = ref(false)

// 加载历史记录
onMounted(async () => {
  await loadRecords()
})

async function loadRecords() {
  loading.value = true
  await historyStore.loadHistory()
  loading.value = false
}

// 删除记录
async function deleteRecord(id: number) {
  await historyStore.deleteRecord(id)
}

// 清空所有记录
async function clearAll() {
  await historyStore.clearHistory()
}

// 基于记录新建计算
function newCalcFromRecord() {
  // TODO: 加载记录数据到会话
  router.push('/patient-info')
}

// 返回首页
function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="history-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1 class="page-title">历史记录</h1>
      <p class="page-subtitle">查看过往计算记录</p>
    </div>

    <!-- 清空按钮 -->
    <div v-if="historyStore.records.length > 0" class="header-actions">
      <NPopconfirm @positive-click="clearAll">
        <template #trigger>
          <NButton size="small" type="error" text>清空全部</NButton>
        </template>
        确定要清空所有历史记录吗？
      </NPopconfirm>
    </div>

    <!-- 记录列表 -->
    <div v-if="!loading && historyStore.records.length > 0" class="records-list">
      <NCard
        v-for="record in historyStore.records"
        :key="record.id"
        class="record-card"
        :bordered="false"
      >
        <div class="record-header">
          <div class="record-patient">{{ record.patientName }}</div>
          <NPopconfirm @positive-click="deleteRecord(record.id!)">
            <template #trigger>
              <NButton size="tiny" text type="error">删除</NButton>
            </template>
            确定删除这条记录？
          </NPopconfirm>
        </div>
        <div class="record-scheme">{{ record.schemeName }} - 第 {{ record.cycle }} 周期</div>
        <div class="record-details">
          <span>BSA: {{ record.bsa }} m²</span>
          <span>Ccr: {{ record.ccr }} mL/min</span>
        </div>
        <div class="record-doses">
          <span
            v-for="(dose, index) in record.calculatedDoses"
            :key="index"
            class="dose-tag"
          >
            {{ dose.drugName }}: {{ dose.calculatedDose }}{{ dose.dosageUnit === 'Calvert公式' ? 'mg' : dose.dosageUnit }}
          </span>
        </div>
        <div class="record-footer">
          <span class="record-date">{{ formatDate(record.createdAt) }}</span>
          <NButton size="small" @click="newCalcFromRecord(record)">
            基于此记录计算
          </NButton>
        </div>
      </NCard>
    </div>

    <!-- 空状态 -->
    <NEmpty
      v-if="!loading && historyStore.records.length === 0"
      description="暂无历史记录"
      style="margin-top: 60px;"
    >
      <template #extra>
        <NButton type="primary" @click="goHome">开始计算</NButton>
      </template>
    </NEmpty>

    <!-- 底部占位 -->
    <div class="bottom-spacer"></div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.history-page {
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

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  border-radius: 12px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-patient {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.record-scheme {
  font-size: 14px;
  color: #595959;
  margin-bottom: 8px;
}

.record-details {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.record-doses {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.dose-tag {
  padding: 4px 8px;
  background: #e6f0ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-date {
  font-size: 12px;
  color: #8c8c8c;
}

.bottom-spacer {
  height: 16px;
}

@media (min-width: 768px) {
  .history-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
