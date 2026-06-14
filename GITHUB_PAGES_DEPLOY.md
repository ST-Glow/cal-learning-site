# GitHub Pages 部署

本项目已配置 `.github/workflows/deploy-pages.yml`。推送到 GitHub 的 `main`
分支后，工作流会自动发布网站运行文件、Live2D、图片、课件和三段 MP4。

## 首次发布

1. 在 GitHub 新建一个公开仓库，例如 `cal-learning-site`。
2. 使用 Git 命令行把本项目提交并推送到仓库的 `main` 分支。
3. 打开仓库的 `Settings > Pages`。
4. 在 `Build and deployment` 中将 `Source` 设为 `GitHub Actions`。
5. 打开仓库的 `Actions` 页面，等待 `Deploy CAL site to GitHub Pages` 完成。

发布链接通常为：

`https://你的GitHub用户名.github.io/仓库名/`

## 功能说明

- Live2D、图片、课件和视频均为相对路径，可在项目站点子目录正常加载。
- GitHub Pages 只提供静态托管，因此线上版智能助手使用内置教学提示。
- 本地运行 `node server.mjs` 时仍可通过服务器环境变量使用 DeepSeek。
- 三个视频文件均小于 GitHub 普通仓库的 100 MiB 单文件限制。
- 视频超过浏览器上传的 25 MiB 限制，请使用 Git 命令行或 GitHub Desktop 推送。
