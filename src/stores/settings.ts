/**
 * 设置 Store
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { dbHelper } from '@/utils/db'
import { BSAFormula } from '@/utils/calculator'

/**
 * 设置接口
 */
interface AppSettings {
  bsaFormula: BSAFormula
  theme: 'light' | 'dark'
  language: 'zh-CN'
  defaultCreatinineUnit: 'umol' | 'mg'
}

const DEFAULT_SETTINGS: AppSettings = {
  bsaFormula: BSAFormula.MOSTELLER,
  theme: 'light',
  language: 'zh-CN',
  defaultCreatinineUnit: 'umol'
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })
  const loading = ref(false)
  const initialized = ref(false)

  // 加载设置
  async function loadSettings() {
    if (initialized.value) return

    loading.value = true
    try {
      const savedSettings = await dbHelper.getAllSettings()
      settings.value = { ...DEFAULT_SETTINGS, ...savedSettings }
      initialized.value = true

      // 应用主题
      applyTheme()
    } catch (e) {
      console.error('加载设置失败:', e)
    } finally {
      loading.value = false
    }
  }

  // 保存设置
  async function saveSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    settings.value[key] = value
    try {
      await dbHelper.setSetting(key, value)

      // 特殊处理主题
      if (key === 'theme') {
        applyTheme()
      }
    } catch (e) {
      console.error('保存设置失败:', e)
    }
  }

  // 批量保存设置
  async function saveSettings(newSettings: Partial<AppSettings>) {
    Object.assign(settings.value, newSettings)
    try {
      for (const [key, value] of Object.entries(newSettings)) {
        await dbHelper.setSetting(key, value)
      }
      applyTheme()
    } catch (e) {
      console.error('保存设置失败:', e)
    }
  }

  // 应用主题
  function applyTheme() {
    if (settings.value.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 重置设置
  async function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
    try {
      // 清空数据库中的设置
      const db = await import('@/utils/db').then(m => m.db)
      await db.settings.clear()
      applyTheme()
    } catch (e) {
      console.error('重置设置失败:', e)
    }
  }

  // 监听设置变化，自动保存到本地存储（作为备份）
  watch(
    () => settings.value,
    (newSettings) => {
      try {
        localStorage.setItem('medical-calculator-settings', JSON.stringify(newSettings))
      } catch (e) {
        console.error('保存到 localStorage 失败:', e)
      }
    },
    { deep: true }
  )

  // 快捷方法
  function setBsaFormula(formula: BSAFormula) {
    saveSetting('bsaFormula', formula)
  }

  function setTheme(theme: 'light' | 'dark') {
    saveSetting('theme', theme)
  }

  function toggleTheme() {
    const newTheme = settings.value.theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return {
    // 状态
    settings,
    loading,
    initialized,

    // Actions
    loadSettings,
    saveSetting,
    saveSettings,
    resetSettings,
    setBsaFormula,
    setTheme,
    toggleTheme
  }
})
