# literary-aesthetics

Vite 前端与 Vercel Functions 后端一体部署。

## 本地开发

```bash
npm install
npm run dev
```

局域网预览：

```bash
npm run dev:lan
```

## Vercel 部署

在 Vercel 项目中配置以下环境变量：

- `MODEL_API_BASE`
- `MODEL_API_KEY`
- `MODEL_NAME`

前端默认请求同域 `/api/analyze` 与 `/api/chat`，无需把密钥暴露到 `VITE_*` 变量。
