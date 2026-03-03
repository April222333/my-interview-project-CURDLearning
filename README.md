# React + TS 企业级基础应用模板
基于 React 18 + TypeScript 构建的轻量级企业级应用模板，集成路由权限控制、双状态管理方案、表单处理、接口封装等核心能力，适配 pnpm monorepo 工程化架构。

## 📸 功能截图（新增：核心页面截图）
| 页面         | 效果展示                                                                 |
|--------------|--------------------------------------------------------------------------|
| 登录页       | ![登录页](https://github.com/April222333/my-interview-project-CURDLearning/raw/8d89dd132ec1ba2d09b245253fd4aa4083039aee/docs/screenshots/%E7%99%BB%E5%BD%95%E9%A1%B5%E9%9D%A2.png)|
| 待办列表页 1  | ![待办列表页](https://github.com/April222333/my-interview-project-CURDLearning/raw/a2e5f5db78cb764ff6c340b39e4d74d190902ea3/docs/screenshots/%E5%BE%85%E5%8A%9E%E5%88%97%E8%A1%A81.png)|
| 待办列表页 2  | ![待办列表页](https://github.com/April222333/my-interview-project-CURDLearning/raw/a2e5f5db78cb764ff6c340b39e4d74d190902ea3/docs/screenshots/%E5%BE%85%E5%8A%9E%E5%88%97%E8%A1%A82.png)|
| 表单提交页 1  | ![表单页](https://github.com/April222333/my-interview-project-CURDLearning/raw/c5f777f99328b203ee11f36e0992db3c55b879bb/docs/screenshots/%E8%A1%A8%E5%8D%95%E9%A1%B5%E9%9D%A21.png)|
| 表单提交页 2  | ![表单页](https://github.com/April222333/my-interview-project-CURDLearning/raw/578154051a243ea3f476f9444564dfe335ba152f/docs/screenshots/%E8%A1%A8%E5%8D%95%E9%A1%B5%E9%9D%A22.png)|

## 🔧 技术栈清单
| 分类         | 技术/库                          | 核心作用                     |
|--------------|----------------------------------|------------------------------|
| 核心框架     | React 18、TypeScript             | 类型安全的前端开发核心       |
| UI 组件库    | Ant Design                       | 企业级UI组件快速搭建界面     |
| 状态管理     | Zustand、Redux Toolkit           | 轻量/主流双状态管理方案适配  |
| 路由管理     | react-router-dom v6              | 路由懒加载、私有路由权限控制 |
| 网络请求     | Axios                            | 二次封装（Token、拦截器、统一错误） |
| 持久化存储   | redux-persist、Zustand persist   | 状态本地持久化（刷新不丢失） |
| 工程化       | pnpm monorepo                    | 多包管理、依赖复用           |

## 📋 核心功能
### 1. 待办事项（TodoList）模块
- 基础 CURD：新增/编辑/删除待办、切换完成状态、清空已完成待办；
- 双状态管理：同时支持 Zustand/Redux Toolkit 两种状态管理方案切换；
- 数据持久化：本地存储待办数据，刷新页面不丢失。
-  AI 赋能规划：通过 AI 智能分类功能，自动分析待办事项内容，推荐优先级和标签，提升任务管理效率。

### 2. 表单（FormPage）模块
- 表单校验：基于 Ant Design 实现表单字段校验；
- 草稿持久化：填写中的表单内容自动保存，切页/刷新不丢失；
- 提交控制：loading 状态防重复提交，提交历史记录管理；
- AI 赋能规划：通过 AI 自动填充表单功能，基于用户历史填写数据/业务规则，智能填充常用字段，减少手动输入成本，提升表单填写效率。

### 3. 权限与路由
- 私有路由：未登录状态禁止访问核心页面，自动跳转登录页；
- 登录鉴权：Token 管理、401 未授权自动清空状态并跳转登录；
- 路由优化：懒加载减少首屏加载体积，提升页面加载速度。

### 4. 网络请求封装
- 请求拦截：自动携带 Token 实现身份认证；
- 响应拦截：统一错误提示、401 状态统一处理；
- 简化调用：统一返回后端业务数据，减少冗余代码。

## 🚀 在线可交互 Demo（可直接操作）
> 注：首次加载需等待依赖安装，右侧预览区可操作
mailto:https://stackblitz.com/~/github.com/April222333/my-interview-project-CURDLearning?embed=1

### 3. 本地快速运行（适配 pnpm monorepo）
#### 前提
已安装 pnpm：`npm install -g pnpm`

#### 步骤
```bash
# 克隆仓库
git clone https://github.com/April222333/my-interview-project-CURDLearning

# 进入项目根目录
cd apps/my-curd

# 安装所有子项目依赖（monorepo 特性）
pnpm install

# 启动 my-curd 子项目（适配 monorepo 结构）
pnpm --filter my-curd dev
