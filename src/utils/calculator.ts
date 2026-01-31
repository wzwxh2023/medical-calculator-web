/**
 * 计算工具函数
 * 包含 BSA (体表面积) 和 Ccr (肌酐清除率) 计算
 */

/**
 * BSA 计算公式枚举
 * Mosteller: sqrt(身高(cm) × 体重(kg) / 3600)
 * 许文生氏公式 (男): 0.0057 × 身高 + 0.0121 × 体重 + 0.0882
 * 许文生氏公式 (女): 0.0073 × 身高 + 0.0127 × 体重 - 0.2106
 * DuBois: 体重(kg)^0.425 × 身高(cm)^0.725 × 0.007184
 */
export enum BSAFormula {
  MOSTELLER = 'mosteller',
  XU_WENSHENG = 'xu_wensheng',
  DUBOIS = 'dubois'
}

/**
 * 性别枚举
 */
export enum Gender {
  MALE = 1,
  FEMALE = 2
}

/**
 * 肌酐单位枚举
 */
export enum CreatinineUnit {
  UMOL = 'umol',   // μmol/L
  MG = 'mg'        // mg/dL
}

/**
 * 肾功能状态级别
 */
export type KidneyFunctionLevel = 'normal' | 'mild' | 'moderate' | 'severe'

/**
 * 肾功能评估结果
 */
export interface KidneyFunctionEvaluation {
  level: KidneyFunctionLevel
  text: string
  color: string
  adjustment: string
  recommend: boolean
}

/**
 * 计算体表面积 (BSA)
 * @param height - 身高 (cm)
 * @param weight - 体重 (kg)
 * @param formula - 计算公式，默认 mosteller
 * @param gender - 性别 1=男, 2=女（许文生公式需要）
 * @returns BSA值 (m²)，保留两位小数
 */
export function calculateBSA(
  height: number,
  weight: number,
  formula: BSAFormula = BSAFormula.MOSTELLER,
  gender: Gender = Gender.MALE
): number {
  if (!height || !weight || height <= 0 || weight <= 0) {
    return 0
  }

  let bsa = 0

  switch (formula) {
    case BSAFormula.MOSTELLER:
      // Mosteller 公式: sqrt(身高 × 体重 / 3600)
      bsa = Math.sqrt((height * weight) / 3600)
      break

    case BSAFormula.XU_WENSHENG:
      // 许文生氏公式（分男女）
      if (gender === Gender.FEMALE) {
        // 女性: 0.0073 × 身高 + 0.0127 × 体重 - 0.2106
        bsa = 0.0073 * height + 0.0127 * weight - 0.2106
      } else {
        // 男性: 0.0057 × 身高 + 0.0121 × 体重 + 0.0882
        bsa = 0.0057 * height + 0.0121 * weight + 0.0882
      }
      break

    case BSAFormula.DUBOIS:
      // DuBois 公式
      bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725)
      break

    default:
      bsa = Math.sqrt((height * weight) / 3600)
  }

  // 确保结果在合理范围内
  if (bsa < 0.5) bsa = 0.5
  if (bsa > 3.0) bsa = 3.0

  return Math.round(bsa * 100) / 100
}

/**
 * 计算肌酐清除率 (Ccr)
 * 使用 Cockcroft-Gault 公式
 * 男性: (140 - 年龄) × 体重(kg) / (72 × 血清肌酐(mg/dL))
 * 女性: 男性结果 × 0.85
 *
 * @param age - 年龄
 * @param weight - 体重
 * @param creatinine - 血清肌酐值
 * @param unit - 单位 'umol' (μmol/L) 或 'mg' (mg/dL)
 * @param gender - 性别 1=男, 2=女
 * @returns Ccr值 (mL/min)，保留一位小数
 */
export function calculateCcr(
  age: number,
  weight: number,
  creatinine: number,
  unit: CreatinineUnit = CreatinineUnit.UMOL,
  gender: Gender = Gender.MALE
): number {
  if (!age || !weight || !creatinine || age <= 0 || weight <= 0 || creatinine <= 0) {
    return 0
  }

  // 将肌酐值转换为 mg/dL
  let creatinineMg = creatinine
  if (unit === CreatinineUnit.UMOL) {
    creatinineMg = creatinine / 88.4
  }

  // Cockcroft-Gault 公式
  let ccr = (140 - age) * weight / (72 * creatinineMg)

  // 女性需要乘以 0.85
  if (gender === Gender.FEMALE) {
    ccr = ccr * 0.85
  }

  // 确保结果在合理范围内
  if (ccr < 0) ccr = 0
  if (ccr > 200) ccr = 200

  return Math.round(ccr * 10) / 10
}

/**
 * 根据 BSA 计算药物剂量
 * @param bsa - 体表面积 (m²)
 * @param dosage - 剂量 (mg/m²)
 * @returns 计算后的剂量 (mg)，四舍五入到整数
 */
export function calculateDoseByBSA(bsa: number, dosage: number): number {
  if (!bsa || !dosage) return 0
  return Math.round(bsa * dosage)
}

/**
 * 根据 Calvert 公式计算卡铂剂量
 * 剂量(mg) = AUC × (Ccr + 25)
 * @param auc - 目标 AUC 值
 * @param ccr - 肌酐清除率 (mL/min)
 * @returns 卡铂剂量，四舍五入到整数
 */
export function calculateCarboplatinDose(auc: number, ccr: number): number {
  if (!auc || !ccr) return 0
  return Math.round(auc * (ccr + 25))
}

/**
 * 评估肾功能状态
 * @param ccr - 肌酐清除率 (mL/min)
 * @returns 肾功能评估结果
 */
export function evaluateKidneyFunction(ccr: number): KidneyFunctionEvaluation {
  if (ccr >= 90) {
    return {
      level: 'normal',
      text: '肾功能正常',
      color: 'success',
      adjustment: '无需调整剂量',
      recommend: false
    }
  } else if (ccr >= 60) {
    return {
      level: 'mild',
      text: '轻度肾功能不全',
      color: 'warning',
      adjustment: '部分药物需减量',
      recommend: true
    }
  } else if (ccr >= 30) {
    return {
      level: 'moderate',
      text: '中度肾功能不全',
      color: 'warning',
      adjustment: '需要调整剂量',
      recommend: true
    }
  } else {
    return {
      level: 'severe',
      text: '重度肾功能不全',
      color: 'danger',
      adjustment: '建议避免使用肾毒性药物',
      recommend: true
    }
  }
}

/**
 * 格式化数字显示
 * @param num - 数字
 * @param decimals - 小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (isNaN(num)) return '0'
  return Number(num).toFixed(decimals)
}

/**
 * 数值范围类型
 */
export type ValueType = 'height' | 'weight' | 'age' | 'creatinine'

/**
 * 数值范围配置
 */
interface ValueRange {
  min: number
  max: number
}

/**
 * 判断数值是否在正常范围
 * @param type - 类型
 * @param value - 值
 * @returns 是否在有效范围内
 */
export function isValueValid(type: ValueType, value: number): boolean {
  const ranges: Record<ValueType, ValueRange> = {
    height: { min: 30, max: 250 },
    weight: { min: 2, max: 300 },
    age: { min: 1, max: 150 },
    creatinine: { min: 10, max: 2000 }
  }

  const range = ranges[type]
  if (!range) return true

  return value >= range.min && value <= range.max
}
