<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  {
    key: 'home',
    label: '首页',
    icon: '🏠',
    path: '/'
  },
  {
    key: 'patients',
    label: '患者',
    icon: '👤',
    path: '/patients'
  },
  {
    key: 'library',
    label: '方案库',
    icon: '📚',
    path: '/scheme-library'
  },
  {
    key: 'profile',
    label: '我的',
    icon: '⚙️',
    path: '/profile'
  }
]

function handleMenuClick(key: string) {
  const item = menuItems.find(m => m.key === key)
  if (item) {
    router.push(item.path)
  }
}

const activeKey = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.includes('patient')) return 'patients'
  if (path.includes('scheme')) return 'library'
  if (path === '/profile') return 'profile'
  return ''
})
</script>

<template>
  <div class="bottom-nav">
    <div class="nav-container">
      <div
        v-for="item in menuItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeKey === item.key }"
        @click="handleMenuClick(item.key)"
      >
        <div class="nav-icon">{{ item.icon }}</div>
        <div class="nav-label">{{ item.label }}</div>
      </div>
    </div>
    <div class="safe-area-bottom"></div>
  </div>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 768px;
  margin: 0 auto;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #8c8c8c;
}

.nav-item:hover {
  background-color: #f5f7fa;
}

.nav-item.active {
  color: #1890ff;
}

.nav-icon {
  font-size: 24px;
  line-height: 1;
  margin-bottom: 2px;
}

.nav-label {
  font-size: 12px;
  line-height: 1;
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0);
}
</style>
