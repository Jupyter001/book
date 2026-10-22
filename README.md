# 大象宇宙 · AI 短剧项目资料库

网站地址：**https://jupyter001.github.io/book/**

AI 短剧项目的中央资料库：照片素材（每张带标题、描述、标签）与小说改编的分集短剧剧本，支持分类筛选与关键词搜索。

## 本地预览

需要 Node.js 20 或以上版本，无需安装任何依赖。

```sh
npm run dev
```

打开 http://127.0.0.1:4173/book/ 。预览前会自动生成静态页面。

单独生成页面并检查：

```sh
npm run build
npm run check
```

## 目录结构

```text
content/photos.json            图片库数据源：标题、描述、分类、标签、日期
content/stories.json           剧情库索引：作品、状态、分集大纲
content/stories/<作品id>.md    每部作品的小说原文 / 改编剧本全文
content/characters/             主角团人物画像与可核实来源
content/milestones/             关键事件与剧情里程碑
content/collaboration/          协作说明与 MiniMax Code 写稿提示
src/index.html                 页面模板
src/assets/styles.css          暗夜片场主题样式
src/assets/main.js             分类筛选、关键词搜索、照片查看器、手机导航
src/photos/                    照片素材，按用途建子目录
dist/                          构建后的静态页面，GitHub Pages 发布目录
scripts/build.mjs              无第三方依赖的页面生成脚本
scripts/serve.mjs              本地预览，支持 /book/ 子路径
scripts/check.mjs              结构、锚点、资源、数据一致性检查
.github/workflows/PublishMySite.yml
```

页面直接使用 HTML、CSS 和 JavaScript，无第三方运行时或构建依赖。关闭 JavaScript 后仍能浏览全部素材与剧情。

## 部署到 GitHub Pages

GitHub Pages 发布来源为 **GitHub Actions**。推送至 `main` 后，工作流自动生成页面、运行检查并发布 `dist/`。拉取请求只执行生成和检查，不发布网站。也可在 Actions 中手动运行 **Publish drama library site**。

原仓库的 `docs/`、`Resume/` 仅作为历史资料保留，不在页面中展示，也不会复制到发布目录。此前的旅行手记内容已从页面下线，仍保留在 git 历史中。

## 添加照片素材

把照片放到 `src/photos/` 下，按用途建子目录，例如 `src/photos/characters/`。在 `content/photos.json` 的 `photos` 数组中加入：

```json
{
  "id": "heroine-red-dress",
  "src": "./photos/characters/heroine-red-dress.jpg",
  "title": "女主·红衣造型",
  "description": "对这张照片的完整描述：人物、服装、神态、可用于哪场戏",
  "category": "人物",
  "tags": ["女主", "红衣", "定妆"],
  "date": "2026-10-22"
}
```

- `category` 必须属于 `categories` 清单（人物 / 场景 / 服装造型 / 道具 / 氛围参考），可按需扩充。
- `description` 是检索的关键，写清楚画面内容与用途。
- 运行 `npm run build` 后照片自动出现在图片库，支持点击放大、方向键切换。

也可以在对话中直接把照片发给助手并说明用途，由助手整理描述并入库。

## 添加剧情作品

在 `content/stories/` 下新建 `<作品id>.md` 存放小说原文或剧本全文，然后在 `content/stories.json` 的 `works` 数组中加入索引：

```json
{
  "id": "my-first-drama",
  "title": "作品名",
  "genre": "题材，如：都市 / 逆袭",
  "logline": "一句话剧情简介",
  "status": "改编中",
  "updated": "2026-10-22",
  "file": "content/stories/my-first-drama.md",
  "episodes": [
    { "n": 1, "title": "集标题", "summary": "本集剧情梗概" }
  ]
}
```

- `status` 必须属于 `statuses` 清单：小说原文 → 改编中 → 剧本完成。
- 分集大纲会折叠展示在作品卡片里；「阅读全文」链接到仓库中的完整文档。

## 合作者素材与 MiniMax Code 写稿

合作者通过 GitHub 分支和拉取请求补充资料：人物画像放在 `content/characters/`，关键事件放在 `content/milestones/`，公开授权的图片素材按上面的流程放入 `src/photos/` 并登记到 `content/photos.json`。可复制各目录中的 `_template.md` 开始填写；提交前请阅读 [`content/collaboration/README.md`](content/collaboration/README.md)。

本仓库会公开在 GitHub 和 GitHub Pages 上。不要提交未经同意的群聊原图、完整聊天导出、个人隐私或账号信息；优先提交经参与者同意并脱敏的摘要、必要的短摘录和来源说明。原始私密材料应留在获授权的私有位置，PR 只包含创作所需的公开安全信息。

使用 MiniMax Code Desktop 时，在仓库目录打开项目，选择 **M3.1-Flash**，再使用 [`content/collaboration/mcode-script-prompt.md`](content/collaboration/mcode-script-prompt.md) 中的提示词。模型只负责起草；人物事实、事件来源和剧本改动由协作者审阅后通过 PR 合并。视频生成尚未纳入仓库工作流。

## 资料来源

所有照片与剧情均由项目作者本人提供，助手只负责整理、描述、改编与归档，不编造素材内容。
