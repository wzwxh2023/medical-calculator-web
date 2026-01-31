/**
 * 历史记录 Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dbHelper, type HistoryRecord } from '@/utils/db'
import { useSessionStore } from './session'

export const useHistoryStore = defineStore('history', () => {
  // 状态
  const records = ref<HistoryRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 加载历史记录
  async function loadHistory(limit?: number) {
    loading.value = true
    error.value = null
    try {
      records.value = await dbHelper.getHistory(limit)
    } catch (e) {
      error.value = '加载历史记录失败'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // 添加记录
  async function addRecord(patientName?: string) {
    const sessionStore = useSessionStore()
    const { currentPatient, currentScheme, currentCycle, cancerType, calculatedResult, adverseReactions } = sessionStore

    if (!currentScheme || !calculatedResult) {
      throw new Error('请先完成计算')
    }

    loading.value = true
    error.value = null
    try {
      const record: HistoryRecord = {
        patientName: patientName || currentPatient.name || '未命名',
        schemeId: currentScheme.id,
        schemeName: currentScheme.name,
        cancerType: cancerType || currentScheme.cancerType,
        cycle: currentCycle,
        bsa: calculatedResult.bsa,
        ccr: calculatedResult.ccr,
        calculatedDoses: calculatedResult.drugs.map(d => ({
          drugName: d.name,
          calculatedDose: d.calculatedDose,
          dosageUnit: d.dosageUnit
        })),
        reactions: adverseReactions,
        createdAt: new Date().toISOString()
      }

      const id = await dbHelper.addHistory(record)
      await loadHistory()
      return id
    } catch (e) {
      error.value = '保存历史记录失败'
      console.error(e)
      return null
    } finally {
      loading.value = false
    }
  }

  // 删除记录
  async function deleteRecord(id: number) {
    loading.value = true
    error.value = null
    try {
      await dbHelper.deleteHistory(id)
      await loadHistory()
      return true
    } catch (e) {
      error.value = '删除记录失败'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  // 清空所有记录
  async function clearHistory() {
    loading.value = true
    error.value = null
    try {
      await dbHelper.clearHistory()
      records.value = []
      return true
    } catch (e) {
      error.value = '清空记录失败'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取患者的历史记录
  async function getHistoryByPatientId(patientId: number) {
    return await dbHelper.getHistoryByPatientId(patientId)
  }

  // 获取最近的患者记录
  function getRecentPatients(limit: number = 5): string[] {
    const uniquePatients = new Map<string, HistoryRecord>()
    for (const record of records.value) {
      if (!uniquePatients.has(record.patientName)) {
        uniquePatients.set(record.patientName, record)
      }
    }
    return Array.from(uniquePatients.values())
      .slice(0, limit)
      .map(r => r.patientName)
  }

  return {
    // 状态
    records,
    loading,
    error,

    // Actions
    loadHistory,
    addRecord,
    deleteRecord,
    clearHistory,
    getHistoryByPatientId,
    getRecentPatients
  }
})
