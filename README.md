# 化疗剂量计算助手 (Web版)

基于 CSCO 指南的化疗药物剂量计算工具 - PWA Web 应用

## 项目简介

这是一个从微信小程序迁移而来的 Web 应用，用于帮助医护人员快速、准确地计算肿瘤化疗药物剂量。支持体表面积(BSA)计算、肌酐清除率(Ccr)计算、多种化疗方案的剂量计算。

### 主要功能

- **患者信息管理**：录入患者基本数据，自动计算 BSA 和 Ccr
- **化疗方案库**：基于 CSCO 指南的常用化疗方案
- **剂量计算**：按 BSA 或 Calvert 公式计算药物剂量
- **肾功能评估**：自动评估肾功能状态并提供剂量调整建议
- **历史记录**：保存计算历史，方便查阅
- **PWA 支持**：可安装到桌面，支持离线使用

## 技术栈

- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite 6
- **UI 组件**：Naive UI
- **路由**：Vue Router 4
- **状态管理**：Pinia
- **本地存储**：IndexedDB (Dexie.js)
- **PWA**：vite-plugin-pwa
- **语言**：TypeScript

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. Vercel 会自动检测并构建

### 其他静态托管

构建后将 `dist` 目录部署到任何静态托管服务（GitHub Pages、Netlify 等）

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
│   └── BottomNavigation.vue
├── composables/     # 组合式函数
├── data/            # 数据文件
│   └── schemes.ts   # 化疗方案数据
├── router/          # 路由配置
│   └── index.ts
├── stores/          # Pinia stores
│   ├── session.ts
│   ├── patients.ts
│   ├── history.ts
│   └── settings.ts
├── utils/           # 工具函数
│   ├── calculator.ts  # 计算函数
│   ├── db.ts          # IndexedDB 封装
│   └── format.ts      # 格式化函数
├── views/           # 页面组件
│   ├── HomeView.vue
│   ├── PatientInfoView.vue
│   ├── SchemeSelectView.vue
│   ├── SchemeLibraryView.vue
│   ├── AdverseReactionsView.vue
│   ├── ResultView.vue
│   ├── HistoryView.vue
│   ├── PatientsView.vue
│   └── ProfileView.vue
├── App.vue
└── main.ts
```

## 计算公式

### BSA 计算

- **Mosteller 公式**：`sqrt(身高(cm) × 体重(kg) / 3600)`
- **许文生氏公式**：区分男女
- **DuBois 公式**：国际标准

### Ccr 计算 (Cockcroft-Gault)

```
男性: Ccr = (140 - 年龄) × 体重(kg) / (72 × 肌酐)
女性: Ccr = 男性结果 × 0.85
```

### 卡铂剂量 (Calvert 公式)

```
剂量(mg) = AUC × (Ccr + 25)
```

## 免责声明

本应用仅供参考，不能替代专业医疗建议。使用本应用计算的结果需要由专业医护人员审核。任何医疗决策应由医生根据患者具体情况做出。

## 许可证

MIT License

## 数据来源

CSCO (中国临床肿瘤学会) 诊疗指南
