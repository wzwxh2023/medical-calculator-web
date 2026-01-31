/**
 * IndexedDB 封装 - 使用 Dexie.js
 * 用于本地持久化存储患者数据、历史记录和设置
 */

import Dexie, { type Table } from 'dexie'

/**
 * 患者数据接口
 */
export interface Patient {
  id?: number
  name: string
  height: number
  weight: number
  age: number
  gender: number
  creatinine?: number
  creatinineUnit?: 'umol' | 'mg'
  bsa?: number
  ccr?: number
  createdAt: string
  updatedAt: string
  lastCycle?: number
  lastScheme?: string
  notes?: string
}

/**
 * 历史记录接口
 */
export interface HistoryRecord {
  id?: number
  patientId?: number
  patientName: string
  schemeId: string
  schemeName: string
  cancerType: string
  cycle: number
  bsa: number
  ccr: number
  calculatedDoses: {
    drugName: string
    calculatedDose: number
    dosageUnit: string
  }[]
  reactions?: Record<string, number>
  createdAt: string
}

/**
 * 设置数据接口
 */
export interface Settings {
  key: string
  value: any
}

/**
 * 数据库类
 */
class MedicalCalculatorDB extends Dexie {
  patients!: Table<Patient>
  history!: Table<HistoryRecord>
  settings!: Table<Settings>

  constructor() {
    super('MedicalCalculatorDB')

    // 定义数据库表结构
    this.version(1).stores({
      patients: '++id, name, createdAt',
      history: '++id, patientId, schemeId, createdAt',
      settings: 'key, value'
    })
  }
}

/**
 * 导出数据库实例
 */
export const db = new MedicalCalculatorDB()

/**
 * 数据库操作辅助函数
 */
export const dbHelper = {
  // 患者数据操作
  async getPatients(): Promise<Patient[]> {
    return await db.patients.orderBy('createdAt').reverse().toArray()
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    return await db.patients.get(id)
  },

  async addPatient(patient: Patient): Promise<number> {
    const now = new Date().toISOString()
    patient.createdAt = now
    patient.updatedAt = now
    return await db.patients.add(patient)
  },

  async updatePatient(patient: Patient): Promise<number> {
    if (!patient.id) throw new Error('Patient ID is required')
    patient.updatedAt = new Date().toISOString()
    return await db.patients.update(patient.id, patient)
  },

  async deletePatient(id: number): Promise<void> {
    await db.patients.delete(id)
    // 同时删除相关历史记录
    await db.history.where('patientId').equals(id).delete()
  },

  // 历史记录操作
  async getHistory(limit?: number): Promise<HistoryRecord[]> {
    let query = db.history.orderBy('createdAt').reverse()
    if (limit) {
      query = query.limit(limit)
    }
    return await query.toArray()
  },

  async getHistoryByPatientId(patientId: number): Promise<HistoryRecord[]> {
    return await db.history
      .where('patientId')
      .equals(patientId)
      .reverse()
      .sortBy('createdAt')
  },

  async addHistory(record: HistoryRecord): Promise<number> {
    record.createdAt = new Date().toISOString()
    return await db.history.add(record)
  },

  async deleteHistory(id: number): Promise<void> {
    await db.history.delete(id)
  },

  async clearHistory(): Promise<void> {
    await db.history.clear()
  },

  // 设置操作
  async getSetting(key: string): Promise<any> {
    const setting = await db.settings.get(key)
    return setting?.value
  },

  async setSetting(key: string, value: any): Promise<void> {
    await db.settings.put({ key, value })
  },

  async getAllSettings(): Promise<Record<string, any>> {
    const settings = await db.settings.toArray()
    return settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {} as Record<string, any>)
  }
}

export default db
