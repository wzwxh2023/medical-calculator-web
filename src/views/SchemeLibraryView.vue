<script setup lang="ts">
import { NCard, NInput, NTag, NSpace } from 'naive-ui'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CancerTypes, getSchemesByCancer, type ChemotherapyScheme } from '@/data/schemes'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()

// 状态
const searchText = ref('')
const selectedCancer = ref<string | null>(null)

// 所有方案（按癌种分组）
const allSchemes = computed(() => {
  if (!selectedCancer.value) {
    // 显示所有癌种的方案
    const schemes: { cancer: string; schemes: ChemotherapyScheme[] }[] = []
    CancerTypes.forEach(cancer => {
      const cancerSchemes = getSchemesByCancer(cancer.id)
      if (cancerSchemes.length > 0) {
        schemes.push({ cancer: cancer.name, schemes: cancerSchemes })
      }
    })
    return schemes
  } else {
    // 显示选定癌种的方案
    const schemes = getSchemesByCancer(selectedCancer.value)
    const cancer = CancerTypes.find(c => c.id === selectedCancer.value)
    return cancer ? [{ cancer: cancer.name, schemes }] : []
  }
})

// 过滤后的方案
const filteredSchemes = computed(() => {
  if (!searchText.value) {
    return allSchemes.value
  }

  const query = searchText.value.toLowerCase()
  return allSchemes.value.map(group => ({
    cancer: group.cancer,
    schemes: group.schemes.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    )
  })).filter(group => group.schemes.length > 0)
})

// 选择方案详情
function selectScheme() {
  // 跳转到方案详情页（暂时跳转到患者信息页）
  router.push('/patient-info')
}

// 筛选癌种
function filterByCancer(cancerId: string | null) {
  selectedCancer.value = cancerId
}
</script>

<template>
  <div class="library-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1 class="page-title">方案库</h1>
      <p class="page-subtitle">浏览所有 CSCO 指南化疗方案</p>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <NInput
        v-model:value="searchText"
        placeholder="搜索方案名称或描述"
        clearable
        size="large"
      >
        <template #prefix>
          <span style="font-size: 18px;">🔍</span>
        </template>
      </NInput>
    </div>

    <!-- 癌种筛选 -->
    <div class="filter-scroll">
      <div class="filter-chips">
        <div
          class="filter-chip"
          :class="{ active: selectedCancer === null }"
          @click="filterByCancer(null)"
        >
          全部
        </div>
        <div
          v-for="cancer in CancerTypes"
          :key="cancer.id"
          class="filter-chip"
          :class="{ active: selectedCancer === cancer.id }"
          @click="filterByCancer(cancer.id)"
        >
          {{ cancer.icon }} {{ cancer.name }}
        </div>
      </div>
    </div>

    <!-- 方案列表 -->
    <div v-for="group in filteredSchemes" :key="group.cancer" class="scheme-group">
      <div class="group-title">{{ group.cancer }}</div>
      <NSpace vertical :size="12">
        <NCard
          v-for="scheme in group.schemes"
          :key="scheme.id"
          class="scheme-card"
          :bordered="false"
          @click="selectScheme(scheme)"
        >
          <div class="scheme-header">
            <span class="scheme-name">{{ scheme.name }}</span>
            <NTag
              v-if="scheme.recommended"
              type="success"
              size="small"
            >
              推荐
            </NTag>
          </div>
          <div class="scheme-scenario">{{ scheme.scenarioLabel }}</div>
          <div class="scheme-desc">{{ scheme.description }}</div>
          <div class="scheme-meta">
            <span>周期：{{ scheme.periodDays }}天</span>
            <NTag size="tiny">{{ scheme.level }}</NTag>
          </div>
        </NCard>
      </NSpace>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredSchemes.length === 0" class="empty-state">
      <p>未找到匹配的方案</p>
    </div>

    <!-- 底部占位 -->
    <div class="bottom-spacer"></div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.library-page {
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
  margin-bottom: 16px;
}

.filter-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 16px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
}

.filter-chip {
  padding: 6px 14px;
  background: #ffffff;
  border-radius: 20px;
  font-size: 13px;
  color: #595959;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #d9d9d9;
  flex-shrink: 0;
}

.filter-chip:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.filter-chip.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.scheme-group {
  margin-bottom: 24px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #8c8c8c;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.scheme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.scheme-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.scheme-scenario {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 4px;
}

.scheme-desc {
  font-size: 14px;
  color: #595959;
  margin-bottom: 8px;
}

.scheme-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.bottom-spacer {
  height: 16px;
}

@media (min-width: 768px) {
  .library-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
