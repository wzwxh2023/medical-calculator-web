# 化疗剂量计算器 - 部署文档

## 项目概述

| 项目 | 内容 |
|------|------|
| **名称** | 医疗化疗剂量计算助手 |
| **类型** | PWA（渐进式 Web 应用） |
| **技术栈** | Vue 3 + Vite + TypeScript + Naive UI |
| **功能** | 基于 CSCO 指南的化疗药物剂量计算工具 |

---

## 目录

- [一、本地开发环境搭建](#一本地开发环境搭建)
- [二、项目构建](#二项目构建)
- [三、Vercel 部署](#三vercel-部署)
- [四、常见问题排查](#四常见问题排查)
- [五、项目维护](#五项目维护)

---

## 一、本地开发环境搭建

### 1.1 前置要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: 最新版本

### 1.2 克隆项目

```bash
git clone https://github.com/wzwxh2023/medical-calculator-web.git
cd medical-calculator-web
```

### 1.3 安装依赖

```bash
npm install
```

### 1.4 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

---

## 二、项目构建

### 2.1 构建命令

```bash
npm run build
```

构建成功后，`dist` 目录将包含所有静态文件。

### 2.2 构建配置

构建相关配置位于以下文件：

| 文件 | 作用 |
|------|------|
| `vite.config.ts` | Vite 构建配置 |
| `vercel.json` | Vercel 部署配置 |
| `package.json` | 项目脚本和依赖 |

### 2.3 预览构建结果

```bash
npm run preview
```

---

## 三、Vercel 部署

### 3.1 准备工作

1. 注册 [Vercel 账号](https://vercel.com/signup)
2. 连接你的 GitHub 账号

### 3.2 通过 Vercel 控制台部署

#### 步骤 1：创建新项目

1. 访问 https://vercel.com/dashboard
2. 点击 **Add New** → **Project**
3. 选择 **medical-calculator-web** 仓库（或导入你的 GitHub 仓库）

#### 步骤 2：配置项目

Vercel 会自动检测配置，无需手动修改。

| 配置项 | 值 |
|--------|-----|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

#### 步骤 3：部署

点击 **Deploy** 按钮，等待约 1-2 分钟。

部署成功后，你会获得一个 URL：
```
https://medical-calculator-web.vercel.app
```

### 3.3 自动部署

连接 GitHub 后，每次推送代码到 `main` 分支，Vercel 会自动部署新版本。

### 3.4 vercel.json 配置说明

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    {
      "source": "/sw.js",
      "destination": "/sw.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

**配置说明：**
- `rewrites`: SPA 路由重写，所有请求指向 index.html
- `headers`: Service Worker 缓存控制

---

## 四、常见问题排查

### 4.1 构建失败

#### 问题：`Command "npm run build" exited with 2`

**原因：** TypeScript 类型检查错误

**解决方案：** 确保 `package.json` 中 build 命令为：
```json
"build": "vite build"
```

### 4.2 路由 404 错误

**原因：** SPA 路由需要服务器重写配置

**解决方案：** 检查 `vercel.json` 中 `rewrites` 配置正确

### 4.3 PWA 缓存问题

**解决方案：** 清除浏览器缓存
1. 打开开发者工具（F12）
2. Application → Clear site data
3. 刷新页面

### 4.4 Vercel 配置冲突

#### 问题：`If 'rewrites', 'redirects', 'headers', 'cleanUrls' or 'trailingSlash' are used, then 'routes' cannot be present`

**解决方案：** 使用 `rewrites` 替代 `routes`

### 4.5 部署后代码未更新

**解决方案：**
1. 检查 Vercel Deployments 页面，确认最新部署状态
2. 清除浏览器缓存（Ctrl+Shift+R）
3. 使用无痕模式访问

---

## 五、项目维护

### 5.1 更新依赖

```bash
npm update
npm audit fix
```

### 5.2 本地测试

```bash
# 运行测试
npm run test

# 运行测试 UI
npm run test:ui
```

### 5.3 发布新版本

1. 修改代码
2. 本地测试：`npm run build && npm run preview`
3. 提交代码：`git add . && git commit -m "描述" && git push`
4. Vercel 自动部署

### 5.4 查看部署日志

1. 访问 Vercel 控制台
2. 选择项目 → Deployments
3. 点击具体部署查看日志

### 5.5 回滚版本

1. 访问 Deployments 页面
2. 找到要回滚的版本
3. 点击 **...** → **Promote to Production**

---

## 六、环境变量（如需要）

如需添加环境变量：

1. Vercel 控制台 → 项目 → Settings → **Environment Variables**
2. 添加变量名和值
3. 重新部署

---

## 七、自定义域名（可选）

### 7.1 绑定域名

1. Vercel 控制台 → 项目 → Settings → **Domains**
2. 添加你的域名
3. 按提示配置 DNS

### 7.2 DNS 配置

| 类型 | 名称 | 值 |
|------|------|-----|
| CNAME | www | cname.vercel-dns.com |

---

## 八、联系方式

- **GitHub**: https://github.com/wzwxh2023/medical-calculator-web
- **Vercel 控制台**: https://vercel.com/dashboard

---

*最后更新时间：2025年1月31日*
