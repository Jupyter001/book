# 夏子峻 · 旅行手记

个人网站：**https://jupyter001.github.io/book/**

一个关于旅行的个人网站：已经走过的 20 座城市、一个环游世界的梦想，以及慢慢补充的旅行相册。

目前记录：北京、上海、天津、哈尔滨、漠河、吐鲁番、乌鲁木齐、武汉、宜昌、洛阳、长沙、广州、深圳、香港、澳门、大连、烟台、丽江、大理、昆明。城市排列不表示旅行时间或行程顺序。

## 本地预览

需要 Node.js 20 或以上版本，无需安装任何依赖。

```sh
npm run dev
```

打开 http://127.0.0.1:4173/book/ 。预览前会自动生成静态页面。复制邮箱功能不可用时会显示手动复制提示。

单独生成页面并检查：

```sh
npm run build
npm run check
```

## 目录结构

```text
content/travels.json           城市与照片的唯一数据来源
src/index.html                旅行主页模板
src/assets/styles.css         响应式样式
src/assets/main.js            地区筛选、城市搜索、照片查看、手机导航
src/photos/                   后续上传的真实旅行照片
dist/                         构建后的静态页面，GitHub Pages 发布目录
scripts/build.mjs             无第三方依赖的页面生成脚本
scripts/serve.mjs             本地预览，支持 /book/ 子路径
scripts/check.mjs             城市清单、资源、锚点、元数据检查
.github/workflows/PublishMySite.yml
```

页面直接使用 HTML、CSS 和 JavaScript，无第三方运行时或构建依赖。关闭 JavaScript 后仍能阅读完整城市清单。地区筛选与城市搜索在浏览器内完成。

## 部署到 GitHub Pages

本网站继续使用 GitHub 免费提供的 `jupyter001.github.io/book/` 地址，不需要购买或绑定独立域名，也不需要 CNAME 文件。

GitHub Pages 发布来源已设置为 **GitHub Actions**。推送至 `main` 后，工作流自动生成页面、运行检查并发布 `dist/`。拉取请求执行生成和检查，不发布网站。也可在 Actions 中手动运行 **Publish personal website**。

原仓库的 `docs/`、`Resume/` 仅作为历史资料保留，不在旅行主页中展示，也不会复制到发布目录。

## 后续添加旅行照片

把真实照片放到 `src/photos/` 下，推荐按城市建目录，例如 `src/photos/beijing/`。在 `content/travels.json` 对应城市的 `photos` 数组中加入：

```json
{
  "src": "./photos/beijing/my-photo.jpg",
  "alt": "对这张真实照片的简短描述",
  "caption": "可选的照片说明"
}
```

运行 `npm run build` 后，相册会从留白页自动切换成真实照片列表，支持点击放大、上一张/下一张、方向键切换和 Escape 关闭。目前尚未添加照片，不使用图库图片冒充个人旅行记录。

也可以在后续对话中提供照片，并说明所属城市，再由助手整理进相册。页面本身没有账号或上传后端。

## 修改其他内容

- 城市和地区：`content/travels.json`。增加已到访城市时，同步更新检查脚本中的预期清单。
- 介绍、梦想和联系方式：`src/index.html`。
- 样式与移动布局：`src/assets/styles.css`。
- 修改模板后运行 `npm run build`。`dist/index.html` 是生成文件，不应单独编辑。

## 资料来源

姓名、梦想和已到访城市由本人提供；邮箱沿用原个人主页。未编造旅行日期、路线、具体经历或照片。
