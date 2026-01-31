/**
 * 患者管理 Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dbHelper, type Patient } from '@/utils/db'
import { useSessionStore } from './session'

export const usePatientsStore = defineStore('patients', () => {
  // 状态
  const patients = ref<Patient[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 加载患者列表
  async function loadPatients() {
    loading.value = true
    error.value = null
    try {
      patients.value = await dbHelper.getPatients()
    } catch (e) {
      error.value = '加载患者列表失败'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // 添加患者
  async function addPatient(patient: Patient) {
    loading.value = true
    error.value = null
    try {
      const id = await dbHelper.addPatient(patient)
      await loadPatients()
      return id
    } catch (e) {
      error.value = '添加患者失败'
      console.error(e)
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新患者
  async function updatePatient(patient: Patient) {
    loading.value = true
    error.value = null
    try {
      await dbHelper.updatePatient(patient)
      await loadPatients()
      return true
    } catch (e) {
      error.value = '更新患者失败'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除患者
  async function deletePatient(id: number) {
    loading.value = true
    error.value = null
    try {
      await dbHelper.deletePatient(id)
      await loadPatients()
      return true
    } catch (e) {
      error.value = '删除患者失败'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  // 根据ID获取患者
  async function getPatientById(id: number) {
    return await dbHelper.getPatientById(id)
  }

  // 从会话创建患者并保存
  async function saveFromSession(name?: string) {
    const sessionStore = useSessionStore()
    const patientData = sessionStore.getPatientForSave()

    if (!patientData.name && !name) {
      throw new Error('患者姓名不能为空')
    }

    const now = new Date().toISOString()
    const patient: Patient = {
      name: name || patientData.name || '未命名',
      height: patientData.height || 0,
      weight: patientData.weight || 0,
      age: patientData.age || 0,
      gender: patientData.gender || 1,
      creatinine: patientData.creatinine,
      creatinineUnit: patientData.creatinineUnit || 'umol',
      bsa: patientData.bsa,
      ccr: patientData.ccr,
      lastCycle: patientData.lastCycle,
      lastScheme: patientData.lastScheme,
      createdAt: now,
      updatedAt: now
    }

    return await addPatient(patient)
  }

  // 加载患者到会话
  function loadToSession(patient: Patient) {
    const sessionStore = useSessionStore()
    sessionStore.setPatient({
      name: patient.name,
      height: patient.height,
      weight: patient.weight,
      age: patient.age,
      gender: patient.gender as any,
      creatinine: patient.creatinine,
      creatinineUnit: patient.creatinineUnit as any
    })
    if (patient.lastCycle) {
      sessionStore.setCycle(patient.lastCycle)
    }
  }

  return {
    // 状态
    patients,
    loading,
    error,

    // Actions
    loadPatients,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    saveFromSession,
    loadToSession
  }
})
