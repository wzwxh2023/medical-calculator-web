import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页', keepAlive: true }
  },
  {
    path: '/patient-info',
    name: 'patient-info',
    component: () => import('@/views/PatientInfoView.vue'),
    meta: { title: '患者信息' }
  },
  {
    path: '/scheme-select',
    name: 'scheme-select',
    component: () => import('@/views/SchemeSelectView.vue'),
    meta: { title: '选择方案' }
  },
  {
    path: '/scheme-library',
    name: 'scheme-library',
    component: () => import('@/views/SchemeLibraryView.vue'),
    meta: { title: '方案库', keepAlive: true }
  },
  {
    path: '/adverse-reactions',
    name: 'adverse-reactions',
    component: () => import('@/views/AdverseReactionsView.vue'),
    meta: { title: '不良反应' }
  },
  {
    path: '/result',
    name: 'result',
    component: () => import('@/views/ResultView.vue'),
    meta: { title: '计算结果' }
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: '历史记录' }
  },
  {
    path: '/patients',
    name: 'patients',
    component: () => import('@/views/PatientsView.vue'),
    meta: { title: '患者管理', keepAlive: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: '我的' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - 化疗剂量计算助手`
  }
  next()
})

export default router
