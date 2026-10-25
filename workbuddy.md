# workbuddy.md — WorkBuddy 开发对话上下文

> 本文件记录「麦麦团餐参谋」（mcd-feast-planner）使用 **腾讯 WorkBuddy** 完成
> 参赛作品开发的全过程，用于麦当劳程序员创意开发大赛 WorkBuddy 专项奖励核验。
>
> 开发时间：2026-10-25 10:38 – 12:00（北京时间）
> 开发环境：WorkBuddy Agent 模式，模型 Step-5-Preview
> 脱敏说明：本文中 MCP Token 已打码；无任何真实手机号、地址、Cookie。

---

## 阶段 0：领任务与活动研判（10:38 – 10:45）

**指令**：「做个应用参加下这个活动 拿一个保底收入」+ 活动页链接。

**执行**：
1. 抓取活动页，确认为「麦当劳程序员创意开发大赛」（1024 程序员节）：
   基于麦当劳 MCP 开发 Skill → 开源发 GitHub → 按 Star 排名。
2. 拉取 GitHub 官方仓库 `M-China/mcd-developer-innovation-challenge` 的
   activityGuidelines.md 与 RANKING.md 原文，核验规则细节：
   - 报名截止 2026-10-25 23:59，榜单数据截止 2026-10-26 00:00
   - 保底档条件：进前 100 名 + 真实使用 WorkBuddy + 提交 workbuddy.md
     → 3000 WorkBuddy 积分 + 汉堡回车键玩具 + 程序员节徽章
   - 当日 09:00 榜单第 99 名为 60 stars → 判定需冲 60+ stars
3. 拉取 MCP Server 文档，确认 35 个工具的能力面。

**结论**：活动 = 冲榜拿积分；唯一硬阻塞是 MCP Token（需用户本人手机号领取）；
选题须差异化 + 13 小时内可交付。

## 阶段 1：选题决策（10:45 – 10:50）

**指令**：无（副官主动决策，等 Token 期间并行推进）。

**执行**：
- 分析榜单 99 个项目分布：省钱策略类、营养卡路里类已高度同质化；
  party-planner 为线下派对活动预约，未占据"办公室团餐参谋"生态位。
- 结合用户真实身份（5 人团队业务总监，团餐请客为高频真实场景）定题：
  **麦麦团餐参谋**——报人数 + 人均预算 → 查门店/菜单/券/算价 → 出方案 + 群发文本。
- 搭建项目骨架 `D:/AI_Work/WorkBuddy/workspace/mcd-feast-planner/`，
  产出 PLAN.md、skill/SKILL.md 初版、scripts/render_plan.py、CONTEST_DECLARATION.md、
  mcp-config.example.json。

## 阶段 2：MCP 接入与真实验证（11:09 – 11:20）

**指令**：用户提供 MCP Token（本文打码为 `25LAc***Yz`）。

**执行**（全部为真实 MCP 调用，返回码 200 为准）：
1. 编写 `scripts/mcp_client.py`（Streamable HTTP + JSON-RPC，零第三方依赖），
   `tools/list` 确认 35 个工具在线。
2. `delivery-query-addresses` → 该账号无配送地址（addresses 为空），
   决策转**到店自取场景**（外送链路改进阶能力，不阻塞主链路）。
3. `query-nearby-stores` 首次报 600058「城市名或者关键词不能为空」——
   实测确认 **city 与 keyword 必须同时传**，修正后返回西安 5 家门店，
   选定最近门店：麦当劳西安开元餐厅（storeCode 1960622，distance 51）。
4. `query-meals` → 108 个餐品 / 15 个分类（含"小食拼盘/多人餐"，与团餐场景吻合）。
5. `query-store-coupons` → 该店当前无可用门店券（空列表，真实结果）。
6. `query-my-coupons` → 卡包有「11.9元麦辣鸡腿堡」（couponId B34E***F119）；
   `available-coupons` → 麦麦省有「免费脆薯饼」等可领；
   `query-my-account` → 可用积分 86.7。
7. `calculate-price` 两轮实测：
   - 方案 A（无券）：麦辣鸡腿汉堡三件套×3 + 板烧鸡腿堡三件套×2
     → 原价 169.50 / 实付 169.50 / 人均 33.90 ✅
   - 方案 B（挂卡包券）：返回 600012「此卡券不在使用日期内」——
     证实"卡包券不保证可用"，该校验逻辑写入 SKILL.md 工作流。
8. `list-nutrition-foods` → 160 个餐品营养数据在线，作为可选备注能力。

## 阶段 3：Skill 定稿与参赛文件（11:20 – 11:50）

**指令**：无（副官自主完成）。

**执行**：
- 将阶段 2 全部实测经验回写 `skill/SKILL.md`：参数组合要求、beCode 传参禁忌、
  券挂载方式、券有效性验算、企业团餐 beType=6 进阶场景。
- 用真实算价数据固化 `demo/plan.json`，`render_plan.py` 渲染出
  `demo/plan.md` + `demo/plan.html`（分享卡）。
- 补齐参赛五件套：README.md（含真实效果示例）、MCP_INTEGRATION.md
  （工具清单 + 调用流程 + 踩坑记录）、CONTEST_DECLARATION.md、
  mcp-config.example.json（仅环境变量占位符）、workbuddy.md（本文件）。

## 阶段 4：发布与参赛（11:50 – 12:10）

**执行**：
1. `gh` CLI（账号 sijiushixiaobing）创建公开仓库 `mcd-feast-planner` 并推送。
2. 在 `M-China/mcd-developer-innovation-challenge` 按官方 Issue 模板
   提交参赛申请（截止 2026-10-25 23:59 前）。
3. 冲星阶段：发动真实社交传播，目标进前 100 名锁保底奖励。

## 真实使用 WorkBuddy 的证明

- 本项目从需求分析、规则核验、选题决策、MCP 客户端开发、接口调试、
  文档撰写到仓库发布，全部在 WorkBuddy 会话内完成，无任何外部 IDE 参与。
- 本文件即上述过程的对话上下文固化物，与仓库提交记录、Issue 时间戳可交叉核验。
