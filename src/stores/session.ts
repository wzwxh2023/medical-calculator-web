/**
 * 会话 Store - 管理当前计算流程的数据
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChemotherapyScheme } from '@/data/schemes'
import { calculateBSA, calculateCcr, calculateDoseByBSA, calculateCarboplatinDose, evaluateKidneyFunction } from '@/utils/calculator'
import { BSAFormula, Gender, CreatinineUnit } from '@/utils/calculator'

/**
 * 患者信息接口
 */
export interface PatientInfo {
  name?: string
  height?: number
  weight?: number
  age?: number
  gender?: Gender
  creatinine?: number
  creatinineUnit?: CreatinineUnit
}

/**
 * 不良反应记录接口
 */
export interface AdverseReactions {
  neutropenia?: number
  thrombocytopenia?: number
  anemia?: number
  nausea_vomiting?: number
  neurotoxicity?: number
  diarrhea?: number
  mucositis?: number
  allergic?: number
}

/**
 * 计算结果接口
 */
export interface CalculatedResult {
  bsa: number
  ccr: number
  kidneyFunction: {
    level: string
    text: string
    color: string
    adjustment: string
    recommend: boolean
  }
  drugs: {
    name: string
    abbreviation: string
    dosage: number | string
    dosageUnit: string
    calculatedDose: number
    administration: string
    day: string
  }[]
}

export const useSessionStore = defineStore('session', () => {
  // 状态
  const currentPatient = ref<PatientInfo>({})
  const currentScheme = ref<ChemotherapyScheme | null>(null)
  const adverseReactions = ref<AdverseReactions>({})
  const currentCycle = ref<number>(1)
  const cancerType = ref<string>('')
  const calculatedResult = ref<CalculatedResult | null>(null)

  // 计算属性
  const hasPatient = computed(() => {
    return !!(currentPatient.value.height &&
              currentPatient.value.weight &&
              currentPatient.value.age &&
              currentPatient.value.gender !== undefined)
  })

  const bsa = computed(() => {
    const { height, weight, gender } = currentPatient.value
    if (!height || !weight || gender === undefined) return 0
    return calculateBSA(height, weight, BSAFormula.MOSTELLER, gender)
  })

  const ccr = computed(() => {
    const { age, weight, creatinine, creatinineUnit, gender } = currentPatient.value
    if (!age || !weight || !creatinine || gender === undefined) return 0
    return calculateCcr(
      age,
      weight,
      creatinine,
      creatinineUnit || CreatinineUnit.UMOL,
      gender
    )
  })

  // Actions
  function setPatient(patient: PatientInfo) {
    currentPatient.value = { ...patient }
    // 清除之前的计算结果
    calculatedResult.value = null
  }

  function setScheme(scheme: ChemotherapyScheme) {
    console.log('[SessionStore] setScheme 被调用:', scheme)
    currentScheme.value = scheme
    cancerType.value = scheme.cancerType
    // 清除之前的计算结果
    calculatedResult.value = null
    console.log('[SessionStore] setScheme 完成，currentScheme.value:', currentScheme.value)
  }

  function setCycle(cycle: number) {
    currentCycle.value = cycle
  }

  function setAdverseReactions(reactions: AdverseReactions) {
    adverseReactions.value = { ...reactions }
  }

  function calculate(): CalculatedResult | null {
    if (!currentScheme.value) return null

    const bsaValue = bsa.value
    const ccrValue = ccr.value

    if (bsaValue === 0) return null

    const kidneyFunction = evaluateKidneyFunction(ccrValue)

    // 计算药物剂量
    const drugs = currentScheme.value.drugs.map(drug => {
      let calculatedDose = 0

      if (drug.useCalvert) {
        // 卡铂使用 Calvert 公式
        const auc = drug.defaultAUC || 5
        calculatedDose = calculateCarboplatinDose(auc, ccrValue || 0)
      } else if (typeof drug.dosage === 'number') {
        // 其他药物按 BSA 计算
        calculatedDose = calculateDoseByBSA(bsaValue, drug.dosage)
      }

      return {
        name: drug.name,
        abbreviation: drug.abbreviation,
        dosage: drug.dosage,
        dosageUnit: drug.dosageUnit,
        calculatedDose,
        administration: drug.administration,
        day: drug.day
      }
    })

    calculatedResult.value = {
      bsa: bsaValue,
      ccr: ccrValue,
      kidneyFunction,
      drugs
    }

    return calculatedResult.value
  }

  function clear() {
    currentPatient.value = {}
    currentScheme.value = null
    adverseReactions.value = {}
    currentCycle.value = 1
    cancerType.value = ''
    calculatedResult.value = null
  }

  function getPatientForSave() {
    return {
      ...currentPatient.value,
      bsa: bsa.value,
      ccr: ccr.value,
      lastCycle: currentCycle.value,
      lastScheme: currentScheme.value?.id
    }
  }

  return {
    // 状态
    currentPatient,
    currentScheme,
    adverseReactions,
    currentCycle,
    cancerType,
    calculatedResult,

    // 计算属性
    hasPatient,
    bsa,
    ccr,

    // Actions
    setPatient,
    setScheme,
    setCycle,
    setAdverseReactions,
    calculate,
    clear,
    getPatientForSave
  }
})
