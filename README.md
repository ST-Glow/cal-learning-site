# 《分支判断：让选择变简单》CAL 学习网站

这是一个面向小学五年级“分支判断”自主学习的网站。页面资源可本地运行，DeepSeek 对话需要通过 `server.mjs` 启动。

## 运行

在当前目录运行：

```powershell
node server.mjs
```

然后访问 `http://127.0.0.1:4173`。也可以直接双击 `index.html` 使用核心功能。

## 已实现

- 六关“轨道闸机解谜”游戏，覆盖双分支、边界值、嵌套与创意规则
- SVG 小车路径动画、条件判定气泡、代码同步高亮、暂停、单步与错误回放
- 每关三星评价、18 星累计和三级可打印奖状
- 电子任务单、学习测验、自评和反馈问卷
- `localStorage` 本地进度恢复和 JSON 学习记录导出
- 原型课件 PDF 网页内嵌
- 数字人视频资源插槽与文字替代
- Live2D“小柿老师”教学助手与人物气泡对话
- DeepSeek 教学对话代理，并保留离线本地提示
- 规则驱动的七类错误诊断、三级支架提示和个性化补学推荐
- 第4、5关“问题—预测—实验—证据—解释—迁移”探究记录
- 学习记录v3导出、旧版记录兼容和教师端本地班级数据仪表盘
- 响应式布局、键盘焦点和文字化正误反馈
- 静音与减少动画模式

核心游戏逻辑位于 `ticket-game.js`，原创票站背景位于
`assets/images/game/smart-ticket-station.png`。

## 后续资源接入

### 数字人视频

在项目中创建 `assets/videos/`，放入四段视频：

- `intro.mp4`
- `branch.mp4`
- `nested.mp4`
- `summary.mp4`

然后在 `config.js` 的 `videos` 中填写相对路径，页面会自动切换为原生视频播放器；未配置时继续显示文字字幕摘要。

### DeepSeek 教学助手

API Key 只配置在运行网站的服务器环境变量中，不要写入 `config.js` 或提交到版本库。

可以复制 `.env.example` 为 `.env`，填入密钥后使用：

```powershell
node --env-file=.env server.mjs
```

也可以直接设置当前终端环境变量：

```powershell
$env:DEEPSEEK_API_KEY="你的 API Key"
$env:DEEPSEEK_MODEL="deepseek-v4-flash"
node server.mjs
```

可选环境变量：

- `DEEPSEEK_API_URL`：默认为 `https://api.deepseek.com/chat/completions`
- `DEEPSEEK_MODEL`：默认为 `deepseek-v4-flash`

“小柿老师”的人设、课程规则、资源说明和儿童教学策略写在 `server.mjs`。网页只向模型发送当前页面、关卡、尝试次数、星级和知识检查状态，不发送学生姓名、班级或小组。未配置密钥、请求超时或网络失败时，会自动使用本地教学提示。

### Live2D

模型与参考实现来自项目中的《系统源代码》，运行文件位于 `assets/live2d/`。右下角人物本身就是助手入口，点击后会在人物上方展开对话气泡。

### 集中提交

当前任务单、问卷和学习记录保存在浏览器本地。在 `config.js` 的 `submissionEndpoint` 填入学校允许的轻量 API 后，最终任务和反馈问卷会尝试以 JSON 提交；失败时仍保留本地数据。

### 教师数据仪表盘

点击网页右上角“教师视角”，可一次导入多名学生从电子任务单导出的 JSON 学习记录。网页会在当前浏览器本地统计完成率、平均尝试次数、知识掌握度、高频错误、信心差异和推荐任务，并支持导出 CSV。

教师端不需要账号或数据库，不会自动上传学生数据。相同学生的更新记录按导出时间覆盖，更旧或重复的记录会被忽略。
