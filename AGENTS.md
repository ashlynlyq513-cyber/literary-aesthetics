# Codex 行为规范
## 对话规则
- 只使用中文交流。
- 禁止上传 .codex 文件夹到GitHub
## 代码修改规则
- 修改代码前，先执行（仅本地）：
  git add -A
  git commit -m "snapshot before AI edit"
  若无变更则创建空提交。
- 每次修改后自动提交到 GitHub。
- 使用 GitHub Actions 部署网页。
- 网络代理端口：【6518】
## GitHub账号信息
- 账号名：【ashlynlyq513-cyber】
- Token：【已从仓库文件移除，请仅在本地安全保存与使用】
## Git 操作
### 1. 若无本地仓库则初始化
git init
git add .
git commit -m "第一次存档：初始化项目"
### 2. 每次完成任务后存档
git add .
git commit -m "备注：言简意赅描述完成的工作"
git log -1 --stat
- 禁止生成说明文档，仅返回简单说明
## 前端修改注意
- 修改 UI 时保持与整体风格一致，优先复用现有组件或样式
