"""render_plan.py — 把团餐方案 JSON 渲染成一页 Markdown + HTML 分享卡片。

用法：
    python render_plan.py plan.json [--out-dir .]

plan.json 结构：
{
  "store": "麦乐送（XX 店）",
  "people": 5,
  "budget_per_person": 35,
  "items": [{"name": "麦辣鸡腿堡套餐", "qty": 3, "price": 39.0}],
  "coupon": "满79减15门店券 x1",
  "original_total": 213.0,
  "final_total": 198.0,
  "queried_at": "2026-10-25 11:30"
}
"""

import argparse
import html
import json
import sys
from pathlib import Path


def fmt_money(v):
    return f"¥{v:,.1f}"


def render_markdown(p):
    lines = []
    per = p["final_total"] / p["people"] if p["people"] else 0
    lines.append(f"# 麦麦团餐方案｜{p['store']}")
    lines.append("")
    lines.append(f"**{p['people']} 人 · 人均预算 {fmt_money(p['budget_per_person'])}**")
    lines.append("")
    lines.append("## 套餐清单")
    lines.append("")
    lines.append("| 品名 | 数量 | 小计 |")
    lines.append("|---|---:|---:|")
    for it in p["items"]:
        lines.append(
            f"| {it['name']} | {it['qty']} | {fmt_money(it['price'] * it['qty'])} |"
        )
    lines.append("")
    lines.append(f"- 用券策略：{p['coupon']}")
    lines.append(
        f"- 原价 {fmt_money(p['original_total'])} → 实付 {fmt_money(p['final_total'])} → 人均 {fmt_money(per)}"
    )
    lines.append("")
    lines.append("## 群发点单文本")
    lines.append("")
    lines.append("```")
    lines.append(f"【今日团餐】{p['store']}，{p['people']} 人，人均约 {fmt_money(per)}")
    for it in p["items"]:
        lines.append(f"{it['name']} x{it['qty']}")
    lines.append(f"用券：{p['coupon']}")
    lines.append("想吃的扣 1，截止 17:00")
    lines.append("```")
    lines.append("")
    lines.append(
        f"> 口径标注：以上取自麦当劳 MCP 实时查询（{p['queried_at']}），"
        "最终价格以麦当劳 App 下单页为准。"
    )
    return "\n".join(lines)


def render_html(p):
    per = p["final_total"] / p["people"] if p["people"] else 0
    rows = "".join(
        f"<tr><td>{html.escape(it['name'])}</td><td>{it['qty']}</td>"
        f"<td>{fmt_money(it['price'] * it['qty'])}</td></tr>"
        for it in p["items"]
    )
    return f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>麦麦团餐方案</title>
<style>
body {{ font-family: -apple-system, "PingFang SC", sans-serif; background: #FFF8EE;
  color: #292929; max-width: 640px; margin: 24px auto; padding: 0 16px; }}
.card {{ background: #fff; border-radius: 16px; padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,.08); border-top: 6px solid #FFBC0D; }}
h1 {{ font-size: 20px; margin: 0 0 4px; }}
.meta {{ color: #888; font-size: 13px; margin-bottom: 16px; }}
table {{ width: 100%; border-collapse: collapse; font-size: 14px; }}
td, th {{ padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: left; }}
td:nth-child(2), td:nth-child(3), th:nth-child(2), th:nth-child(3) {{ text-align: right; }}
.total {{ font-size: 15px; margin-top: 12px; }}
.total b {{ color: #D52300; font-size: 20px; }}
.group-text {{ background: #FFF3D6; border-radius: 8px; padding: 12px;
  font-size: 13px; white-space: pre-wrap; margin-top: 16px; }}
.note {{ color: #999; font-size: 12px; margin-top: 12px; }}
</style></head><body><div class="card">
<h1>🍔 麦麦团餐方案｜{html.escape(p['store'])}</h1>
<div class="meta">{p['people']} 人 · 人均预算 {fmt_money(p['budget_per_person'])}</div>
<table><tr><th>品名</th><th>数量</th><th>小计</th></tr>{rows}</table>
<div class="total">原价 {fmt_money(p['original_total'])} → 实付 <b>{fmt_money(p['final_total'])}</b>
→ 人均 <b>{fmt_money(per)}</b><br>用券：{html.escape(p['coupon'])}</div>
<div class="group-text">【今日团餐】{html.escape(p['store'])}，{p['people']} 人，人均约 {fmt_money(per)}
想吃的扣 1，截止 17:00</div>
<div class="note">口径标注：以上取自麦当劳 MCP 实时查询（{p['queried_at']}），
最终价格以麦当劳 App 下单页为准。</div>
</div></body></html>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan", help="方案 JSON 文件")
    ap.add_argument("--out-dir", default=".")
    args = ap.parse_args()

    p = json.loads(Path(args.plan).read_text(encoding="utf-8"))
    out = Path(args.out_dir)
    (out / "plan.md").write_text(render_markdown(p), encoding="utf-8")
    (out / "plan.html").write_text(render_html(p), encoding="utf-8")
    print(f"OK -> {out / 'plan.md'}, {out / 'plan.html'}")


if __name__ == "__main__":
    sys.exit(main())
