# Mock API 使用说明

本项目使用 `vite-plugin-mock` 提供 Mock API 功能，方便前端开发时无需依赖后端服务。

## 📦 已安装的包

- `vite-plugin-mock` - Vite Mock 插件
- `mockjs` - 生成随机数据
- `@types/mockjs` - TypeScript 类型定义

## 🗂️ Mock 文件结构

```
mock/
├── auth.ts        # 认证相关接口
├── dataset.ts     # 数据集接口
├── evaluation.ts  # 评测任务接口
├── metric.ts      # 指标接口
└── file.ts        # 文件上传接口
```

## 🔑 测试账号

### 管理员账号
- 用户名: `admin`
- 密码: `admin123`
- 角色: admin

### 普通用户账号
- 用户名: `user`
- 密码: `user123`
- 角色: user

## 📝 已 Mock 的接口

### 认证接口 (auth.ts)
- `POST /api/v1/auth/login` - 登录
- `POST /api/v1/auth/register` - 注册
- `GET /api/v1/auth/me` - 获取当前用户信息

### 数据集接口 (dataset.ts)
- `GET /api/v1/datasets` - 获取数据集列表（支持分页、搜索）
- `GET /api/v1/datasets/:id` - 获取单个数据集
- `POST /api/v1/datasets` - 创建数据集
- `DELETE /api/v1/datasets/:id` - 删除数据集

### 评测接口 (evaluation.ts)
- `GET /api/v1/evaluations` - 获取评测列表（支持分页、状态筛选）
- `GET /api/v1/evaluations/:id` - 获取评测详情
- `POST /api/v1/evaluations` - 创建评测任务
- `DELETE /api/v1/evaluations/:id` - 删除评测任务

### 指标接口 (metric.ts)
- `GET /api/v1/metrics/comparison` - 获取模型对比数据
- `GET /api/v1/metrics/trend` - 获取指标趋势数据
- `GET /api/v1/metrics/:evaluationId` - 获取详细指标

### 文件接口 (file.ts)
- `POST /api/v1/files/upload` - 单文件上传
- `POST /api/v1/files/batch-upload` - 批量上传
- `GET /api/v1/files/:fileId` - 获取文件信息
- `DELETE /api/v1/files/:fileId` - 删除文件

## 🎯 如何使用

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **Mock 自动生效**
   - 所有 `/api/v1/*` 的请求会被 Mock 拦截
   - 无需修改现有代码
   - 使用测试账号登录即可体验完整功能

3. **查看 Mock 数据**
   - Mock 数据使用 `mockjs` 随机生成
   - 每次刷新页面会生成新的随机数据
   - 数据集、评测任务等都有 20-30 条模拟数据

## ⚙️ 配置说明

在 `vite.config.ts` 中已配置：

```typescript
viteMockServe({
  mockPath: 'mock',  // mock 文件目录
  enable: true,      // 启用 mock
})
```

## 🔧 自定义 Mock 数据

如需修改 Mock 数据，编辑对应的 `mock/*.ts` 文件：

```typescript
// 示例：修改 mock/auth.ts 中的登录逻辑
{
  url: '/api/v1/auth/login',
  method: 'post',
  response: ({ body }) => {
    // 自定义响应逻辑
    return { ... }
  }
}
```

## 🚀 切换到真实 API

如需连接真实后端，修改 `vite.config.ts`：

```typescript
viteMockServe({
  mockPath: 'mock',
  enable: false,  // 关闭 mock
})
```

或者设置环境变量 `VITE_API_BASE_URL` 指向真实 API 地址。
