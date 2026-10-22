# 协作素材与提交流程

本仓库及 GitHub Pages 网站均为公开内容。所有进入 PR 的内容都可能被任何人查看、复制和索引。

## 资料放置位置

- `content/characters/<character-id>.md`：人物画像，使用 `content/characters/_template.md`。
- `content/milestones/<date>-<event-id>.md`：事件与里程碑，使用 `content/milestones/_template.md`。
- `content/photos.json` 与 `src/photos/`：已获公开使用许可的照片及描述。
- `content/stories/<work-id>.md` 与 `content/stories.json`：原文、剧本和分集索引。

## 隐私与来源

- 不要提交未经明确同意公开的群聊截图、完整聊天导出、真实姓名/账号、联系方式、私密对话或其他个人信息。
- 需要引用聊天或截图时，先取得相关参与者同意，再只写创作必要的脱敏摘要或短摘录；原始私密材料保留在获授权的私有位置，不放进仓库。
- 经所有可识别参与者同意、完成脱敏且确有创作需要的单张截图，可以作为图片素材放入 `src/photos/` 并登记到 `content/photos.json`；不得提交完整聊天导出或包含无关个人信息的原图。
- 涉及可识别真人的照片，确认所有相关人员同意公开使用；隐去无关人员、账号和通知等信息。
- 对人物设定和事件记录注明来源 ID、日期、同意状态和脱敏情况。未经证实的回忆、推测和创作建议要明确标注，不能当作事实。
- 如果授权状态不确定，先不要提交；在 PR 中说明缺少的授权或待核实事项。

## GitHub PR 流程

1. 从最新 `main` 创建分支，只提交获准公开的资料及其必要来源说明。
2. 为人物或事件复制相应 `_template.md`，填写来源、授权、脱敏和待确认信息。
3. 照片素材同时更新文件、`content/photos.json` 和描述/标签。
4. 提交 PR；由作者审阅事实、授权和剧本影响后再合并。自动检查通过不代表内容授权或事实已获确认。

## 使用 MiniMax Code Desktop

在 MiniMax Code Desktop 中打开本仓库，选择 **M3.1-Flash**，并将 `mcode-script-prompt.md` 作为本次写稿指令。检查模型生成的每处事实、人物设定和剧情改编，再把人工确认后的改动提交 PR。不要将未授权的原始群聊或截图粘贴到模型提示中。
