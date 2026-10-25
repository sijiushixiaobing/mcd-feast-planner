# MCP 集成说明（MCP_INTEGRATION）

本项目「麦麦团餐参谋」基于麦当劳中国官方 MCP Server 开发。

- 服务地址：`https://mcp.mcd.cn`
- 传输协议：Streamable HTTP
- 鉴权方式：`Authorization: Bearer <MCP_MCP_TOKEN>`
- Token 申请：<https://open.mcd.cn/mcp>（手机号登录 → 控制台 → 激活）
- 限流：600 次/分钟/Token（客户端已做串行调用 + 失败重试控制）

## 使用的 Tool 清单

| Tool | 用途 | 读/写 |
|---|---|---|
| query-nearby-stores | 按城市/商圈查可点餐门店，拿 storeCode 与距离 | 读 |
| query-meals | 拉门店在售菜单（分类 + 餐品编码 + 价格） | 读 |
| query-store-coupons | 查指定门店当前可用优惠券 | 读 |
| query-my-coupons | 查用户卡包全部优惠券资产 | 读 |
| available-coupons | 查麦麦省当前可领取的优惠券 | 读 |
| query-my-account | 查积分账户（余额/即将过期） | 读 |
| list-nutrition-foods | 查餐品营养成分（可选备注） | 读 |
| calculate-price | 按商品清单（可挂券）计算原价/优惠/实付 | 算价 |
| query-meal-assistance | 企业团餐场景查门店助餐服务 | 读 |
| query-promotions | 企业团餐场景查满减/满折规则 | 读 |

**未使用任何写操作 Tool**（create-order / cancel-order / mall-create-order /
party-order-create / auto-bind-coupons / draw-lottery 等一律不调用）。

## 典型调用流程（到店自取场景）

```
1. query-nearby-stores   {beType:1, searchType:2, city:"西安市", keyword:"麦当劳"}
   → 门店列表（storeCode 1960622 / distance 51m）

2. query-meals           {storeCode:"1960622", orderType:1, beType:1}
   → 108 个餐品 / 15 个分类

3. query-store-coupons   {storeCode:"1960622", orderType:1, beType:1}
   → 当前门店可用券（可能为空）

4. query-my-coupons      {}
   → 卡包券资产（含可能已过期的券）

5. calculate-price       {storeCode:"1960622", orderType:1, beType:1,
                          items:[{productCode:"9900005456", quantity:3},
                                 {productCode:"9900005462", quantity:2}]}
   → originalPrice 169.5 / price 169.5 / 人均 33.9

6. （如卡包券拟用）将 couponId+couponCode 挂到对应 items[] 项上重算，
   以返回码为准判断券是否可用（600012 = 不在使用日期内）
```

## 业务价值

团餐决策的完整数据链路原本散落在 App 多个页面：门店要翻、菜单要翻、
券要逐张试、价格要心算。本项目把六个 MCP 工具串成"需求→方案"一条流水线，
输出直接可执行的一页方案 + 群发文本，把 15 分钟的人工流程压缩到 30 秒。

企业团餐场景（beType=6）下进一步接入 query-meal-assistance 与 query-promotions，
可命中助餐服务与团餐满减规则，是普通点餐 App 不具备的差异化信息。

## 踩坑记录（集成经验）

1. `query-nearby-stores` 的 `city` 与 `keyword` 必须同时传，只传 city 返回 600058。
2. 到店自取场景（beType=1）不要传 `beCode`，传了 query-meals / query-meal-detail 会报错。
3. `query-my-coupons` 返回的券含已过期的，不能直接当可用券用，必须过 calculate-price 验证。
4. `calculate-price` 的券要挂在具体商品项（couponId + couponCode），不支持整单挂券。
