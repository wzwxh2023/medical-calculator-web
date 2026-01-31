<script setup lang="ts">
import { NCard, NButton, NStatistic, NGrid, NGridItem, NSpace, useDialog } from 'naive-ui'
import { useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import { usePatientsStore } from '@/stores/patients'
import { useHistoryStore } from '@/stores/history'
import { useSessionStore } from '@/stores/session'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const dialog = useDialog()
const patientsStore = usePatientsStore()
const historyStore = useHistoryStore()
const sessionStore = useSessionStore()

// 数据统计
const stats = computed(() => ({
  patientCount: patientsStore.patients.length,
  historyCount: historyStore.records.length
}))

// 快速操作
const quickActions = [
  {
    title: '新建计算',
    icon: '➕',
    description: '开始新的剂量计算',
    action: () => startNewCalculation()
  },
  {
    title: '患者管理',
    icon: '👥',
    description: '查看和管理患者',
    action: () => router.push('/patients')
  },
  {
    title: '历史记录',
    icon: '📋',
    description: '查看计算历史',
    action: () => router.push('/history')
  },
  {
    title: '方案库',
    icon: '📚',
    description: '浏览化疗方案',
    action: () => router.push('/scheme-library')
  }
]

function startNewCalculation() {
  sessionStore.clear()
  router.push('/patient-info')
}

// 格式化日期
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 最近记录
const recentRecords = computed(() => {
  return historyStore.records.slice(0, 3)
})

function loadRecord(record: any) {
  dialog.info({
    title: '查看历史记录',
    content: `患者：${record.patientName}\n方案：${record.schemeName}\n周期：${record.cycle}`,
    positiveText: '基于此记录计算',
    negativeText: '关闭',
    onPositiveClick: () => {
      router.push('/patient-info')
    }
  })
}

onMounted(async () => {
  await patientsStore.loadPatients()
  await historyStore.loadHistory(10)
})
</script>

<template>
  <div class="home-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1 class="page-title">化疗剂量计算助手</h1>
      <p class="page-subtitle">基于 CSCO 指南的精准剂量计算</p>
    </div>

    <!-- 统计卡片 -->
    <NCard class="stats-card" :bordered="false">
      <NGrid :cols="2" :x-gap="16">
        <NGridItem>
          <NStatistic label="患者数" :value="stats.patientCount">
            <template #prefix>👤</template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic label="计算次数" :value="stats.historyCount">
            <template #prefix>📊</template>
          </NStatistic>
        </NGridItem>
      </NGrid>
    </NCard>

    <!-- 快速操作 -->
    <div class="section-title">快速开始</div>
    <div class="quick-actions">
      <div
        v-for="action in quickActions"
        :key="action.title"
        class="action-card"
        @click="action.action"
      >
        <div class="action-icon">{{ action.icon }}</div>
        <div class="action-title">{{ action.title }}</div>
        <div class="action-desc">{{ action.description }}</div>
      </div>
    </div>

    <!-- 最近记录 -->
    <div v-if="recentRecords.length > 0" class="section-title">最近计算</div>
    <NCard v-if="recentRecords.length > 0" class="recent-card" :bordered="false">
      <NSpace vertical :size="12">
        <div
          v-for="record in recentRecords"
          :key="record.id"
          class="record-item"
          @click="loadRecord(record)"
        >
          <div class="record-header">
            <span class="record-name">{{ record.patientName }}</span>
            <span class="record-scheme">{{ record.schemeName }}</span>
          </div>
          <div class="record-meta">
            <span>第 {{ record.cycle }} 周期</span>
            <span class="record-date">{{ formatDate(record.createdAt) }}</span>
          </div>
        </div>
      </NSpace>
      <template #footer>
        <NButton text block @click="router.push('/history')">
          查看全部记录 →
        </NButton>
      </template>
    </NCard>

    <!-- 底部占位 -->
    <div class="bottom-spacer"></div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 16px;
  padding-bottom: 80px;
}

.page-header {
  margin-bottom: 24px;
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

.stats-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.action-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-card:active {
  transform: translateY(0);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.recent-card {
  border-radius: 12px;
}

.record-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.record-item:hover {
  background: #e6f0ff;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.record-name {
  font-weight: 500;
  color: #262626;
}

.record-scheme {
  font-size: 12px;
  color: #1890ff;
  background: #e6f0ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.record-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8c8c8c;
}

.bottom-spacer {
  height: 16px;
}

@media (min-width: 768px) {
  .home-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
