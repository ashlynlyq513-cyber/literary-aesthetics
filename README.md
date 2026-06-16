# literary-aesthetics

当前根目录是你正在继续开发的主项目。

如果后续要吸收 `samiytaa/literary-aesthetics` 的改进版，不要直接覆盖根目录文件，先把对方代码放进 `upstream/` 下单独子目录，再逐个文件对比合并。

当前目录分工：

- 根目录：你正在维护的主项目
- `archive/`：历史快照、旧整包备份
- `upstream/`：上游改版导入缓冲区

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
- Vercel Functions：`api/` 目录中的后端代理

## 需要配置

- Vercel 环境变量：`MODEL_API_BASE`、`MODEL_API_KEY`、`MODEL_NAME`
- GitHub 仓库 Secret：`VITE_API_BASE_URL`
