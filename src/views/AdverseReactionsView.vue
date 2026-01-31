<script setup lang="ts">
import { NCard, NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import { AdverseReactionTypes, ReactionGrades, type AdverseReactionType } from '@/data/schemes'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const sessionStore = useSessionStore()

// 不良反应数据
const reactions = ref<Record<string, number>>({})

// 按类别分组
const hematologicReactions = ref<AdverseReactionType[]>([])
const nonHematologicReactions = ref<AdverseReactionType[]>([])
const specialReactions = ref<AdverseReactionType[]>([])

// 初始化
onMounted(() => {
  hematologicReactions.value = AdverseReactionTypes.filter(r => r.category === 'hematologic')
  nonHematologicReactions.value = AdverseReactionTypes.filter(r => r.category === 'non_hematologic')
  specialReactions.value = AdverseReactionTypes.filter(r => r.category === 'special')

  // 加载已保存的反应
  reactions.value = { ...sessionStore.adverseReactions }
})

// 设置反应级别
function setReactionGrade(reactionId: string, grade: number) {
  reactions.value[reactionId] = grade
}

// 检查是否选中
function isSelected(reactionId: string, grade: number): boolean {
  return reactions.value[reactionId] === grade
}

// 跳过不良反应
function skipReactions() {
  sessionStore.setAdverseReactions({})
  goToResult()
}

// 保存并继续
function saveAndContinue() {
  sessionStore.setAdverseReactions(reactions.value)
  goToResult()
}

// 跳转到结果页
function goToResult() {
  router.push('/result')
}

// 返回上一步
function goBack() {
  console.log('[AdverseReactions] 点击返回上一步')
  console.log('[AdverseReactions] 当前 sessionStore.currentScheme:', sessionStore.currentScheme)
  router.push('/scheme-select')
}
</script>

<template>
  <div class="adverse-reactions-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1 class="page-title">既往不良反应</h1>
      <p class="page-subtitle">记录患者既往化疗不良反应（可选）</p>
    </div>

    <!-- 提示卡片 -->
    <NCard class="info-card" :bordered="false">
      <p>根据 NCI CTCAE 5.0 分级标准记录患者既往不良反应，将用于剂量调整建议。</p>
    </NCard>

    <!-- 血液学毒性 -->
    <div class="section-title">血液学毒性</div>
    <NCard class="reactions-card" :bordered="false">
      <div
        v-for="reaction in hematologicReactions"
        :key="reaction.id"
        class="reaction-item"
      >
        <div class="reaction-header">
          <span class="reaction-name">{{ reaction.name }}</span>
          <span class="reaction-desc">{{ reaction.description }}</span>
        </div>
        <div class="grade-options">
          <div
            v-for="grade in ReactionGrades"
            :key="grade.value"
            class="grade-option"
            :class="{ selected: isSelected(reaction.id, grade.value) }"
            @click="setReactionGrade(reaction.id, grade.value)"
          >
            <span class="grade-label">{{ grade.label }}</span>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 非血液学毒性 -->
    <div class="section-title">非血液学毒性</div>
    <NCard class="reactions-card" :bordered="false">
      <div
        v-for="reaction in nonHematologicReactions"
        :key="reaction.id"
        class="reaction-item"
      >
        <div class="reaction-header">
          <span class="reaction-name">{{ reaction.name }}</span>
          <span class="reaction-desc">{{ reaction.description }}</span>
        </div>
        <div class="grade-options">
          <div
            v-for="grade in ReactionGrades"
            :key="grade.value"
            class="grade-option"
            :class="{ selected: isSelected(reaction.id, grade.value) }"
            @click="setReactionGrade(reaction.id, grade.value)"
          >
            <span class="grade-label">{{ grade.label }}</span>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 特殊反应 -->
    <div v-if="specialReactions.length > 0" class="section-title">其他</div>
    <NCard v-if="specialReactions.length > 0" class="reactions-card" :bordered="false">
      <div
        v-for="reaction in specialReactions"
        :key="reaction.id"
        class="reaction-item"
      >
        <div class="reaction-header">
          <span class="reaction-name">{{ reaction.name }}</span>
          <span class="reaction-desc">{{ reaction.description }}</span>
        </div>
        <div class="grade-options">
          <div
            v-for="grade in ReactionGrades"
            :key="grade.value"
            class="grade-option"
            :class="{ selected: isSelected(reaction.id, grade.value) }"
            @click="setReactionGrade(reaction.id, grade.value)"
          >
            <span class="grade-label">{{ grade.label }}</span>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <NButton size="large" @click="goBack">上一步</NButton>
      <NButton size="large" @click="skipReactions">跳过</NButton>
      <NButton type="primary" size="large" @click="saveAndContinue">
        计算
      </NButton>
    </div>

    <!-- 底部占位 -->
    <div class="bottom-spacer"></div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
.adverse-reactions-page {
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

.info-card {
  margin-bottom: 20px;
  border-radius: 12px;
  background: #e6f0ff;
  border: 1px solid #91caff;
}

.info-card p {
  margin: 0;
  font-size: 14px;
  color: #1890ff;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
  margin-top: 8px;
}

.reactions-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.reaction-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.reaction-item:last-child {
  border-bottom: none;
}

.reaction-header {
  margin-bottom: 8px;
}

.reaction-name {
  font-size: 15px;
  font-weight: 500;
  color: #262626;
  display: block;
  margin-bottom: 2px;
}

.reaction-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.grade-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.grade-option {
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.grade-option:hover {
  background: #e6f0ff;
  border-color: #91caff;
}

.grade-option.selected {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
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
  .adverse-reactions-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
