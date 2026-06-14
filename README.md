# literary-aesthetics

前端使用 GitHub Pages 部署，后端使用 Render 部署。

## 本地开发

```bash
npm install
npm run dev
```

局域网预览：

```bash
npm run dev:lan
```

## 部署结构

- GitHub Pages：静态前端
- Render Web Service：`server.ts` API 代理

## 需要配置

- Render 环境变量：
  - `MODEL_API_BASE`
  - `MODEL_API_KEY`
  - `MODEL_NAME`
- GitHub 仓库 Secret：
  - `VITE_API_BASE_URL`，值为你的 Render 服务地址，例如 `https://xxx.onrender.com`
