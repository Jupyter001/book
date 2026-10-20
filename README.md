# 夏子峻 · 个人主页

个人网站：**https://jupyter001.github.io/book/**

极简中文个人主页，介绍计算机专业背景、整车控制器电控软件研发经历，以及汽车电子、控制理论和 Simulink 的学习记录。

## 本地预览

需要 Node.js 20 或以上版本，无需安装任何依赖。

```sh
npm run dev
```

打开 http://127.0.0.1:4173/book/ 。也可以直接打开 `dist/index.html`；复制邮箱功能取决于浏览器是否支持剪贴板权限，不可用时会显示手动复制提示。

检查源码：

```sh
npm run check
```

## 目录结构

```text
dist/                         网站源码，同时也是发布目录
  index.html                  自我介绍、经历、笔记入口、联系方式
  404.html                    失效链接返回页
  assets/styles.css           响应式样式
  assets/main.js              手机导航、邮箱复制、章节状态
  assets/favicon.svg          网站图标
  sitemap.xml                 网站地图
scripts/serve.mjs             本地预览，支持 /book/ 子路径
scripts/check.mjs             资源、锚点、笔记链接、元数据检查
docs/                         保留的原始学习笔记
.github/workflows/PublishMySite.yml
```

页面直接使用 HTML、CSS 和 JavaScript，字体与图形由本地资源提供，没有外部字体、追踪脚本、前端框架或构建工具依赖。

## 部署到 GitHub Pages

本网站继续使用 GitHub 免费提供的 `jupyter001.github.io/book/` 地址，不需要购买或绑定独立域名，也不需要 CNAME 文件。

首次采用新工作流时，在本仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。此后推送至 `main` 会检查并发布 `dist/`，拉取请求只执行检查。也可在 Actions 中手动运行 **Publish personal website**。

旧的 MkDocs 配置、生成产物与发布命令已移除。原始 `docs/` 笔记保留在仓库中，页面上的笔记入口直接链接相应的 Markdown 文件。`Resume/` 中的旧材料不会被复制到发布目录。

## 更新个人内容

- 在 `dist/index.html` 修改简介、经历、笔记链接及联系方式。
- 如更改邮箱，同步修改 `mailto:` 和复制按钮上的 `data-email`。
- 页面配色与移动布局在 `dist/assets/styles.css`。
- 如未来更改仓库名称或绑定域名，同步更新 canonical、og:url、sitemap、404 返回链接和 `scripts/serve.mjs` 中的预览前缀。

## 资料来源

职业介绍采用本人提供的信息。教育时间与邮箱来自仓库的 `docs/me/info.md`、`docs/me/info2.md`。未添加未经确认的项目成果、技能熟练度或具体雇主。
