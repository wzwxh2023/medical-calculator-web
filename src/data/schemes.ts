/**
 * 化疗方案数据 - 基于 CSCO 指南
 * 数据来源：CSCO (中国临床肿瘤学会) 诊疗指南
 */

// ==================== 类型定义 ====================

/**
 * 不良反应类型
 */
export interface AdverseReactionType {
  id: string
  name: string
  category: 'hematologic' | 'non_hematologic' | 'special'
  description: string
}

/**
 * 反应分级
 */
export interface ReactionGrade {
  value: number
  label: string
  color: string
  description?: string
}

/**
 * 癌种类型
 */
export interface CancerType {
  id: string
  name: string
  icon: string
}

/**
 * 治疗场景
 */
export interface TreatmentScenario {
  id: string
  name: string
  order: number
}

/**
 * 药物信息
 */
export interface Drug {
  name: string
  abbreviation: string
  dosage: number | string  // number 或 'AUC 5' 这种格式
  dosageUnit: string
  administration: string
  dosageMethod: string
  day: string
  maxDose?: number | null   // 最大剂量（可选）
  note?: string
  useCalvert?: boolean      // 是否使用 Calvert 公式（卡铂）
  defaultAUC?: number       // 默认 AUC 值
}

/**
 * 警告信息
 */
export interface SchemeWarning {
  type: 'warning' | 'danger' | 'info'
  icon: string
  title: string
  content: string
}

/**
 * 化疗方案
 */
export interface ChemotherapyScheme {
  id: string
  name: string
  cancerType: string
  scenario: string
  scenarioLabel: string
  description: string
  period: number
  periodDays: number
  recommendedCycles?: number
  source: string
  level: string
  drugs: Drug[]
  warnings?: SchemeWarning[]
  contraindications?: string[]
  recommended: boolean
}

/**
 * 居家护理指南
 */
export interface HomeCareItem {
  emoji: string
  title: string
  description: string
}

/**
 * 红旗征
 */
export interface RedFlag {
  icon: string
  text: string
  description: string
}

// ==================== 数据定义 ====================

/**
 * 不良反应类型
 */
export const AdverseReactionTypes: AdverseReactionType[] = [
  {
    id: 'neutropenia',
    name: '中性粒细胞减少',
    category: 'hematologic',
    description: '白细胞计数降低'
  },
  {
    id: 'thrombocytopenia',
    name: '血小板减少',
    category: 'hematologic',
    description: '血小板计数降低'
  },
  {
    id: 'anemia',
    name: '贫血',
    category: 'hematologic',
    description: '血红蛋白降低'
  },
  {
    id: 'nausea_vomiting',
    name: '恶心/呕吐',
    category: 'non_hematologic',
    description: '化疗常见消化道反应'
  },
  {
    id: 'neurotoxicity',
    name: '神经毒性',
    category: 'non_hematologic',
    description: '周围神经感觉异常'
  },
  {
    id: 'diarrhea',
    name: '腹泻',
    category: 'non_hematologic',
    description: '大便次数增多'
  },
  {
    id: 'mucositis',
    name: '口腔黏膜炎',
    category: 'non_hematologic',
    description: '口腔溃疡/疼痛'
  },
  {
    id: 'allergic',
    name: '过敏反应',
    category: 'special',
    description: '皮疹、呼吸困难等'
  }
]

/**
 * 不良反应分级 (NCI CTCAE 5.0)
 */
export const ReactionGrades: ReactionGrade[] = [
  { value: 0, label: '无', color: 'success' },
  { value: 1, label: '1级', color: 'success', description: '轻度，无症状' },
  { value: 2, label: '2级', color: 'warning', description: '中度，需要干预' },
  { value: 3, label: '3级', color: 'warning', description: '严重，医学干预' },
  { value: 4, label: '4级', color: 'danger', description: '危及生命' },
  { value: 5, label: '5级', color: 'danger', description: '死亡' }
]

/**
 * 癌种分类
 */
export const CancerTypes: CancerType[] = [
  { id: 'colorectal', name: '结直肠癌', icon: '⚪' },
  { id: 'nsclc', name: '非小细胞肺癌', icon: '🫁' },
  { id: 'sclc', name: '小细胞肺癌', icon: '🫁' },
  { id: 'gastric', name: '胃癌', icon: '🟤' },
  { id: 'btc', name: '胆道肿瘤', icon: '🟡' },
  { id: 'breast', name: '乳腺癌', icon: '🎀' },
  { id: 'ovarian', name: '卵巢癌', icon: '♀️' }
]

/**
 * 治疗场景分类
 */
export const TreatmentScenarios: Record<string, TreatmentScenario> = {
  adjuvant: { id: 'adjuvant', name: '术后辅助化疗', order: 1 },
  neoadjuvant: { id: 'neoadjuvant', name: '新辅助化疗', order: 2 },
  firstline: { id: 'firstline', name: '晚期一线治疗', order: 3 },
  limited: { id: 'limited', name: '局限期', order: 1 },
  extensive: { id: 'extensive', name: '广泛期', order: 2 }
}

/**
 * 化疗方案数据 - 基于 CSCO 指南
 */
export const ChemotherapySchemes: ChemotherapyScheme[] = [
  // ==================== 结直肠癌方案 ====================

  // ----- 术后辅助化疗 -----
  {
    id: 'mfolfox6_adjuvant',
    name: 'mFOLFOX6',
    cancerType: 'colorectal',
    scenario: 'adjuvant',
    scenarioLabel: '术后辅助化疗',
    description: '奥沙利铂 + 亚叶酸钙 + 氟尿嘧啶',
    period: 2,
    periodDays: 14,
    recommendedCycles: 12,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '奥沙利铂',
        abbreviation: 'OXA',
        dosage: 85,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '亚叶酸钙',
        abbreviation: 'LV',
        dosage: 400,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '氟尿嘧啶',
        abbreviation: '5-FU',
        dosage: 400,
        dosageUnit: 'mg/m²',
        administration: '静脉推注',
        dosageMethod: '推注剂量，第1天',
        day: '第1天',
        maxDose: null,
        note: '静脉推注'
      },
      {
        name: '氟尿嘧啶',
        abbreviation: '5-FU',
        dosage: 2400,
        dosageUnit: 'mg/m²',
        administration: '静脉持续泵入46-48小时',
        dosageMethod: '持续泵入46-48小时',
        day: '第1-2天',
        maxDose: null,
        note: '1200mg/m²/日 × 2日'
      }
    ],
    warnings: [
      { type: 'warning', icon: 'snowflake', title: '奥沙利铂神经毒性', content: '避免接触冷饮、冷水，注意保暖' },
      { type: 'info', icon: 'sun', title: '光照防护', content: '氟尿嘧啶可能引起光敏反应' }
    ],
    contraindications: [
      '对奥沙利铂或铂类衍生物过敏者',
      '骨髓功能严重抑制者',
      '严重肾功能不全者'
    ],
    recommended: true
  },
  {
    id: 'xelox_adjuvant',
    name: 'XELOX',
    cancerType: 'colorectal',
    scenario: 'adjuvant',
    scenarioLabel: '术后辅助化疗',
    description: '奥沙利铂 + 卡培他滨',
    period: 3,
    periodDays: 21,
    recommendedCycles: 8,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '奥沙利铂',
        abbreviation: 'OXA',
        dosage: 130,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '卡培他滨',
        abbreviation: 'CAP',
        dosage: 1000,
        dosageUnit: 'mg/m²',
        administration: '口服，每日2次（早晚各1次）',
        dosageMethod: '单次剂量 × 2次/日 × 14日',
        day: '第1-14天',
        maxDose: null
      }
    ],
    warnings: [
      { type: 'warning', icon: 'snowflake', title: '奥沙利铂神经毒性', content: '避免接触冷饮、冷水，注意保暖' },
      { type: 'info', icon: 'pill', title: '卡培他滨', content: '餐后30分钟内服用，不可与食物同服' }
    ],
    contraindications: [
      '严重肾功能损害者',
      '对氟嘧啶类药物过敏者'
    ],
    recommended: true
  },
  {
    id: 'folfoxiri_adjuvant',
    name: 'FOLFOXIRI',
    cancerType: 'colorectal',
    scenario: 'adjuvant',
    scenarioLabel: '术后辅助化疗',
    description: '伊立替康 + 奥沙利铂 + 亚叶酸钙 + 氟尿嘧啶',
    period: 2,
    periodDays: 14,
    source: 'CSCO指南',
    level: '2B',
    drugs: [
      {
        name: '伊立替康',
        abbreviation: 'IRI',
        dosage: 165,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '奥沙利铂',
        abbreviation: 'OXA',
        dosage: 85,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '亚叶酸钙',
        abbreviation: 'LV',
        dosage: 400,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '氟尿嘧啶',
        abbreviation: '5-FU',
        dosage: 2400,
        dosageUnit: 'mg/m²',
        administration: '静脉持续泵入48小时',
        dosageMethod: '持续泵入48小时',
        day: '第1-2天',
        maxDose: null,
        note: '可调整至3200mg/m²'
      }
    ],
    warnings: [
      { type: 'danger', icon: 'exclamation-triangle', title: '强效方案', content: '毒性较大，需密切监测血象' },
      { type: 'warning', icon: 'snowflake', title: '奥沙利铂神经毒性', content: '避免接触冷饮、冷水' },
      { type: 'warning', icon: 'bolt', title: '伊立替康', content: '注意延迟性腹泻和胆碱能综合征' }
    ],
    contraindications: [
      '严重骨髓功能抑制',
      '严重肝肾功能不全',
      'UCG1A1*28基因缺陷者慎用伊立替康'
    ],
    recommended: false
  },

  // ----- 晚期一线治疗 -----
  {
    id: 'mfolfox6_firstline',
    name: 'mFOLFOX6',
    cancerType: 'colorectal',
    scenario: 'firstline',
    scenarioLabel: '晚期一线治疗',
    description: '奥沙利铂 + 亚叶酸钙 + 氟尿嘧啶',
    period: 2,
    periodDays: 14,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '奥沙利铂',
        abbreviation: 'OXA',
        dosage: 85,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '亚叶酸钙',
        abbreviation: 'LV',
        dosage: 400,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '氟尿嘧啶',
        abbreviation: '5-FU',
        dosage: 400,
        dosageUnit: 'mg/m²',
        administration: '静脉推注',
        dosageMethod: '推注剂量，第1天',
        day: '第1天',
        maxDose: null,
        note: '静脉推注'
      },
      {
        name: '氟尿嘧啶',
        abbreviation: '5-FU',
        dosage: 2400,
        dosageUnit: 'mg/m²',
        administration: '静脉持续泵入46-48小时',
        dosageMethod: '持续泵入46-48小时',
        day: '第1-2天',
        maxDose: null
      }
    ],
    warnings: [
      { type: 'warning', icon: 'snowflake', title: '奥沙利铂神经毒性', content: '避免接触冷饮、冷水，注意保暖' }
    ],
    recommended: true
  },
  {
    id: 'xelox_firstline',
    name: 'XELOX(CAPEOX)',
    cancerType: 'colorectal',
    scenario: 'firstline',
    scenarioLabel: '晚期一线治疗',
    description: '奥沙利铂 + 卡培他滨',
    period: 3,
    periodDays: 21,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '奥沙利铂',
        abbreviation: 'OXA',
        dosage: 130,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注>2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '卡培他滨',
        abbreviation: 'CAP',
        dosage: 1000,
        dosageUnit: 'mg/m²',
        administration: '口服，每日2次（早晚各1次）',
        dosageMethod: '单次剂量 × 2次/日 × 14日',
        day: '第1-14天',
        maxDose: null
      }
    ],
    warnings: [
      { type: 'warning', icon: 'snowflake', title: '奥沙利铂神经毒性', content: '避免接触冷饮、冷水，注意保暖' }
    ],
    recommended: true
  },
  {
    id: 'folfiri',
    name: 'FOLFIRI',
    cancerType: 'colorectal',
    scenario: 'firstline',
    scenarioLabel: '晚期一线治疗',
    description: '伊立替康 + 亚叶酸钙 + 氟尿嘧啶',
    period: 2,
    periodDays: 14,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '伊立替康',
        abbreviation: 'IRI',
        dosage: 180,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注30-90分钟',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '亚叶酸钙',
        abbreviation: 'LV',
        dosage: 400,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '氟尿嘧啶',
        abbreviation: '5-FU',
        dosage: 400,
        dosageUnit: 'mg/m²',
        administration: '静脉推注',
        dosageMethod: '推注剂量，第1天',
        day: '第1天',
        maxDose: null,
        note: '静脉推注'
      },
      {
        name: '氟尿嘧啶',
        abbreviation: '5-FU',
        dosage: 2400,
        dosageUnit: 'mg/m²',
        administration: '静脉持续泵入46-48小时',
        dosageMethod: '持续泵入46-48小时',
        day: '第1-2天',
        maxDose: null,
        note: '1200mg/m²/日 × 2日'
      }
    ],
    warnings: [
      { type: 'warning', icon: 'bolt', title: '延迟性腹泻', content: '伊立替康可能导致严重腹泻，需及时处理' }
    ],
    contraindications: [
      '慢性肠炎或肠梗阻',
      '对伊立替康过敏'
    ],
    recommended: true
  },

  // ==================== 非小细胞肺癌方案 ====================

  // ----- PP方案 -----
  {
    id: 'pp_carboplatin',
    name: 'PP方案(卡铂)',
    cancerType: 'nsclc',
    scenario: 'firstline',
    scenarioLabel: '晚期一线治疗',
    description: '培美曲塞 + 卡铂',
    period: 3,
    periodDays: 21,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '培美曲塞',
        abbreviation: 'PEM',
        dosage: 500,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注10分钟以上',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '卡铂',
        abbreviation: 'CBP',
        dosage: 'AUC 5',
        dosageUnit: 'Calvert公式',
        administration: '静脉滴注30-60分钟',
        dosageMethod: 'AUC 5-6，第1天',
        day: '第1天',
        useCalvert: true,
        defaultAUC: 5
      }
    ],
    warnings: [
      { type: 'info', icon: 'pills', title: '预处理', content: '需服用皮质激素和叶酸预防不良反应' },
      { type: 'info', icon: 'kidney', title: '卡铂', content: '按Calvert公式计算：剂量=AUC×(Ccr+25)' }
    ],
    contraindications: [
      '对培美曲塞或卡铂过敏者',
      '严重肾功能不全者(Ccr<45mL/min)'
    ],
    recommended: true
  },

  // ==================== 小细胞肺癌方案 ====================

  // ----- 局限期 SCLC -----
  {
    id: 'ep_limited_sclc',
    name: 'EP方案',
    cancerType: 'sclc',
    scenario: 'limited',
    scenarioLabel: '局限期',
    description: '顺铂 + 依托泊苷',
    period: 3,
    periodDays: 21,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '顺铂',
        abbreviation: 'DDP',
        dosage: 75,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '依托泊苷',
        abbreviation: 'VP-16',
        dosage: 100,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1-3天',
        day: '第1-3天',
        maxDose: null
      }
    ],
    warnings: [
      { type: 'warning', icon: 'tint', title: '水化', content: '顺铂需要充分水化' },
      { type: 'info', icon: 'radio', title: '同步放疗', content: '局限期建议同步胸部放疗' }
    ],
    recommended: true
  },
  {
    id: 'ec_limited_sclc',
    name: 'EC方案',
    cancerType: 'sclc',
    scenario: 'limited',
    scenarioLabel: '局限期',
    description: '卡铂 + 依托泊苷',
    period: 3,
    periodDays: 21,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '卡铂',
        abbreviation: 'CBP',
        dosage: 'AUC 5',
        dosageUnit: 'Calvert公式',
        administration: '静脉滴注',
        dosageMethod: 'AUC 5-6，第1天',
        day: '第1天',
        useCalvert: true,
        defaultAUC: 5
      },
      {
        name: '依托泊苷',
        abbreviation: 'VP-16',
        dosage: 100,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1-3天',
        day: '第1-3天',
        maxDose: null
      }
    ],
    warnings: [
      { type: 'info', icon: 'radio', title: '同步放疗', content: '局限期建议同步胸部放疗' }
    ],
    recommended: false
  },

  // ----- 广泛期 SCLC -----
  {
    id: 'ep_extensive_sclc',
    name: 'EP方案',
    cancerType: 'sclc',
    scenario: 'extensive',
    scenarioLabel: '广泛期',
    description: '顺铂 + 依托泊苷',
    period: 3,
    periodDays: 21,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '顺铂',
        abbreviation: 'DDP',
        dosage: 75,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '依托泊苷',
        abbreviation: 'VP-16',
        dosage: 100,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1-3天',
        day: '第1-3天',
        maxDose: null
      }
    ],
    warnings: [
      { type: 'warning', icon: 'tint', title: '水化', content: '顺铂需要充分水化' }
    ],
    recommended: true
  },
  {
    id: 'ec_extensive_sclc',
    name: 'EC方案',
    cancerType: 'sclc',
    scenario: 'extensive',
    scenarioLabel: '广泛期',
    description: '卡铂 + 依托泊苷',
    period: 3,
    periodDays: 21,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '卡铂',
        abbreviation: 'CBP',
        dosage: 'AUC 5',
        dosageUnit: 'Calvert公式',
        administration: '静脉滴注',
        dosageMethod: 'AUC 5-6，第1天',
        day: '第1天',
        useCalvert: true,
        defaultAUC: 5
      },
      {
        name: '依托泊苷',
        abbreviation: 'VP-16',
        dosage: 100,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1-3天',
        day: '第1-3天',
        maxDose: null
      }
    ],
    recommended: true
  },

  // ==================== 胃癌方案 ====================

  // ----- 术后辅助化疗 -----
  {
    id: 'xelox_adjuvant_gastric',
    name: 'XELOX',
    cancerType: 'gastric',
    scenario: 'adjuvant',
    scenarioLabel: '术后辅助化疗',
    description: '奥沙利铂 + 卡培他滨',
    period: 3,
    periodDays: 21,
    recommendedCycles: 8,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '奥沙利铂',
        abbreviation: 'OXA',
        dosage: 130,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '卡培他滨',
        abbreviation: 'CAP',
        dosage: 1000,
        dosageUnit: 'mg/m²',
        administration: '口服，每日2次（早晚各1次）',
        dosageMethod: '单次剂量 × 2次/日 × 14日',
        day: '第1-14天',
        maxDose: null
      }
    ],
    warnings: [
      { type: 'warning', icon: 'snowflake', title: '神经毒性', content: '避免冷刺激' }
    ],
    contraindications: [
      '严重肾功能损害',
      '对氟嘧啶过敏'
    ],
    recommended: true
  },
  {
    id: 'sox_adjuvant_gastric',
    name: 'SOX',
    cancerType: 'gastric',
    scenario: 'adjuvant',
    scenarioLabel: '术后辅助化疗',
    description: '奥沙利铂 + 替吉奥',
    period: 3,
    periodDays: 21,
    recommendedCycles: 8,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '奥沙利铂',
        abbreviation: 'OXA',
        dosage: 130,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      },
      {
        name: '替吉奥',
        abbreviation: 'S-1',
        dosage: 40,
        dosageUnit: 'mg/m²',
        administration: '口服，每日2次（早晚各1次）',
        dosageMethod: '单次剂量 × 2次/日 × 14日',
        day: '第1-14天',
        maxDose: null
      }
    ],
    warnings: [
      { type: 'warning', icon: 'snowflake', title: '神经毒性', content: '避免冷刺激' }
    ],
    contraindications: [
      '严重肾功能损害'
    ],
    recommended: true
  },

  // ==================== 胆道肿瘤方案 ====================

  {
    id: 'gp_btc',
    name: 'GP方案',
    cancerType: 'btc',
    scenario: 'firstline',
    scenarioLabel: '晚期一线治疗',
    description: '吉西他滨 + 顺铂',
    period: 3,
    periodDays: 21,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '吉西他滨',
        abbreviation: 'GEM',
        dosage: 1000,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注30分钟',
        dosageMethod: '单次剂量，第1、8天',
        day: '第1、8天',
        maxDose: null
      },
      {
        name: '顺铂',
        abbreviation: 'DDP',
        dosage: 25,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注',
        dosageMethod: '单次剂量，第1、8天',
        day: '第1、8天',
        maxDose: null
      }
    ],
    warnings: [
      { type: 'warning', icon: 'tint', title: '水化', content: '顺铂需要充分水化' }
    ],
    recommended: true
  },
  {
    id: 'gs_btc',
    name: 'GS方案',
    cancerType: 'btc',
    scenario: 'firstline',
    scenarioLabel: '晚期一线治疗',
    description: '吉西他滨 + 替吉奥',
    period: 3,
    periodDays: 21,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '吉西他滨',
        abbreviation: 'GEM',
        dosage: 1000,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注30分钟',
        dosageMethod: '单次剂量，第1、8天',
        day: '第1、8天',
        maxDose: null
      },
      {
        name: '替吉奥',
        abbreviation: 'S-1',
        dosage: 40,
        dosageUnit: 'mg/m²',
        administration: '口服，每日2次',
        dosageMethod: '单次剂量 × 2次/日 × 14日',
        day: '第1-14天',
        maxDose: null,
        note: '根据BSA调整: <1.25m²:60mg/d, 1.25-1.5m²:80mg/d, >1.5m²:100mg/d'
      }
    ],
    recommended: true
  },
  {
    id: 'gemox_btc',
    name: 'GEMOX方案',
    cancerType: 'btc',
    scenario: 'firstline',
    scenarioLabel: '晚期一线治疗',
    description: '吉西他滨 + 奥沙利铂',
    period: 3,
    periodDays: 21,
    source: 'CSCO指南',
    level: '1A',
    drugs: [
      {
        name: '吉西他滨',
        abbreviation: 'GEM',
        dosage: 1000,
        dosageUnit: 'mg/m²',
        administration: '静脉滴注30分钟',
        dosageMethod: '单次剂量，第1、8天',
        day: '第1、8天',
        maxDose: null
      },
      {
        name: '奥沙利铂',
        abbreviation: 'OXA',
        dosage: 100,
        dosageUnit: 'mg/m²',
        administration: '静脉输注2小时',
        dosageMethod: '单次剂量，第1天',
        day: '第1天',
        maxDose: null
      }
    ],
    recommended: true
  }
]

/**
 * 居家护理指南
 */
export const HomeCareGuide: HomeCareItem[] = [
  { emoji: '🥤', title: '多饮水', description: '每天饮水2000-2500ml，促进药物代谢' },
  { emoji: '🍎', title: '清淡饮食', description: '少食多餐，选择易消化食物' },
  { emoji: '😴', title: '充足休息', description: '保证睡眠，适度活动' },
  { emoji: '🌡️', title: '监测体温', description: '每天监测体温，发热及时就医' },
  { emoji: '🧴', title: '皮肤护理', description: '保持皮肤清洁，避免干燥' },
  { emoji: '🍯', title: '口腔护理', description: '淡盐水漱口，预防口腔炎' }
]

/**
 * 红旗征（需立即就医）
 */
export const RedFlags: RedFlag[] = [
  { icon: 'thermometer', text: '发热超过38℃', description: '可能提示感染' },
  { icon: 'tint', text: '严重腹泻', description: '>6次/日或伴有血便' },
  { icon: 'vomit', text: '严重呕吐', description: '无法进食进水' },
  { icon: 'bandage', text: '出血倾向', description: '牙龈出血、皮下瘀斑等' },
  { icon: 'lung', text: '呼吸困难', description: '胸闷、气促' },
  { icon: 'brain', text: '意识改变', description: 'confusion、嗜睡' }
]

// ==================== 工具函数 ====================

/**
 * 根据癌种获取方案列表
 */
export function getSchemesByCancer(cancerType: string): ChemotherapyScheme[] {
  return ChemotherapySchemes.filter(s => s.cancerType === cancerType)
}

/**
 * 根据ID获取方案
 */
export function getSchemeById(id: string): ChemotherapyScheme | null {
  return ChemotherapySchemes.find(s => s.id === id) || null
}

/**
 * 获取所有方案（按癌种分组）
 */
export function getSchemesGrouped(): Record<string, ChemotherapyScheme[]> {
  const grouped: Record<string, ChemotherapyScheme[]> = {}
  CancerTypes.forEach(type => {
    grouped[type.id] = getSchemesByCancer(type.id)
  })
  return grouped
}

/**
 * 获取指定癌种和场景的方案
 */
export function getSchemesByCancerAndScenario(
  cancerType: string,
  scenario: string
): ChemotherapyScheme[] {
  return ChemotherapySchemes.filter(
    s => s.cancerType === cancerType && s.scenario === scenario
  )
}
