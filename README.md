# 麦麦团餐参谋（mcd-feast-planner）

> 报个数、报个人均预算，30 秒出一页麦当劳团餐方案 + 群发点单文本。
> 办公室团餐、下午茶、请客场景的 AI 参谋。只参谋，不下单。

基于 [麦当劳中国 MCP](https://open.mcd.cn/mcp) 开发的 WorkBuddy Skill。
参赛：麦当劳程序员创意开发大赛（1024 程序员节）。

## 解决什么问题

行政/团队负责人最熟悉的场景：

> "下午点麦当劳，5 个人，人均 35 左右，有人想喝奶茶……"

人工流程：打开 App → 翻菜单 → 凑人数 → 找券 → 按计算器 → 复制到群里催接龙。
全程 15 分钟起，还经常算错人均、漏用券。

这个 Skill 把整条链路交给 AI：**需求 → 门店 → 菜单 → 用券 → 算价 → 群发文本**，一次出全。

## 效果示例（真实数据）

输入：

> 5 个人点麦当劳，人均 35，到店自取，西安钟楼附近

输出（2026-10-25 11:15 实时查询）：

| 项 | 内容 |
|---|---|
| 门店 | 麦当劳（西安开元餐厅·到店自取，距查询位置约 51 米） |
| 套餐 | 麦辣鸡腿汉堡三件套 ×3、板烧鸡腿堡三件套 ×2 |
| 用券 | 本店当前无可用门店券；卡包中「11.9元麦辣鸡腿堡」已过使用期（calculate-price 返回 600012） |
| 价格 | 原价 ¥169.5 → 实付 ¥169.5 → **人均 ¥33.9** |
| 群发文本 | 「【今日团餐】麦当劳（西安开元餐厅），5 人，人均约 ¥33.9，想吃的扣 1，截止 17:00」 |

方案卡 HTML 见 [demo/plan.html](demo/plan.html)。

## 能力清单

- **门店定位**：query-nearby-stores 按城市/商圈查可点餐门店，按距离择优
- **菜单拉取**：query-meals 拉全店在售菜单（108 个餐品、15 个分类），优先套餐类
- **三重用券检查**：query-store-coupons（门店券）+ query-my-coupons（卡包券）+ available-coupons（麦麦省待领券）
- **券有效性验算**：卡包券不保证可用，一律经 calculate-price 实算验证（过期券会返回 600012）
- **精确算价**：calculate-price 出原价/优惠/实付/人均，超预算自动降档
- **群发点单文本**：直接复制粘贴到微信群的接龙格式
- **企业团餐（进阶）**：beType=6 团餐场景 + query-meal-assistance 助餐服务 + query-promotions 团餐满减规则
- **营养备注（可选）**：list-nutrition-foods 附热量信息

## 安装使用

### 1. 接入麦当劳 MCP

前往 [open.mcd.cn/mcp](https://open.mcd.cn/mcp)，手机号登录 → 控制台 → 激活，领取 MCP Token。

在 MCP Client（推荐 [WorkBuddy](https://www.workbuddy.cn)）中添加：

```json
{
  "mcpServers": {
    "mcd-mcp": {
      "type": "streamablehttp",
      "url": "https://mcp.mcd.cn",
      "headers": {
        "Authorization": "Bearer ${MCD_MCP_TOKEN}"
      }
    }
  }
}
```

### 2. 安装 Skill

将 `skill/` 目录放入 WorkBuddy 的 Skills 目录（或按平台技能规范加载 SKILL.md）。

### 3. 开聊

> "下午 5 个人点麦当劳，人均 35，想喝奶茶"

## 目录结构

```
├── skill/SKILL.md            # Skill 主文件（工作流 + 硬约束）
├── scripts/
│   ├── mcp_client.py         # 麦当劳 MCP 极简客户端（标准库，零依赖）
│   └── render_plan.py        # 方案 JSON → Markdown + HTML 分享卡渲染器
├── demo/
│   ├── plan.json             # 真实查询数据固化的方案
│   ├── plan.md               # 渲染结果（Markdown 版）
│   └── plan.html             # 渲染结果（分享卡版）
├── mcp-config.example.json   # 脱敏 MCP 配置示例（仅环境变量占位符）
├── MCP_INTEGRATION.md        # MCP 集成说明
├── CONTEST_DECLARATION.md    # 参赛声明
└── workbuddy.md              # WorkBuddy 开发对话上下文
```

## 安全与合规

- **只读 + 算价**：不调用 create-order / cancel-order / mall-create-order / party-order-create / auto-bind-coupons 等任何写操作，下单与付款由用户在麦当劳官方渠道完成
- **无凭证泄露**：Token 只走环境变量 `MCD_MCP_TOKEN`，仓库内无任何真实凭证
- **无编造数据**：菜单、价格、优惠券全部以 MCP 实时返回为准

## 目标用户

行政、团队负责人、HR、活动组织者——所有需要"带一群人吃麦当劳"并快速出方案的人。

---

麦当劳程序员创意开发大赛参赛作品 · 2026-10-25
