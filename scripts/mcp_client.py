"""mcp_client.py — 麦当劳 MCP 极简客户端（Streamable HTTP）。

用法：
    export MCD_MCP_TOKEN="your-token"
    python mcp_client.py tools                     # 列出全部工具
    python mcp_client.py call <tool_name> '<json>' # 调用工具

依赖：仅标准库。Token 只从环境变量 MCD_MCP_TOKEN 读取，禁止硬编码。
"""

import json
import os
import sys
import urllib.request

BASE_URL = "https://mcp.mcd.cn"


def _post(payload, session_id=None):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Authorization": f"Bearer {os.environ['MCD_MCP_TOKEN']}",
    }
    if session_id:
        headers["mcp-session-id"] = session_id
    req = urllib.request.Request(
        BASE_URL, data=json.dumps(payload).encode(), headers=headers, method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        sid = resp.headers.get("mcp-session-id")
        raw = resp.read().decode()
    return raw, sid


def _parse_sse(raw):
    """Streamable HTTP 可能返回 text/event-stream，提取 data: 行的 JSON。"""
    out = []
    for line in raw.splitlines():
        if line.startswith("data:"):
            out.append(line[5:].strip())
    return [json.loads(x) for x in out if x]


def _rpc(method, params=None, session_id=None, msg_id=1):
    payload = {"jsonrpc": "2.0", "id": msg_id, "method": method}
    if params is not None:
        payload["params"] = params
    raw, sid = _post(payload, session_id)
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        msgs = _parse_sse(raw)
        data = msgs[-1] if msgs else {"error": {"message": raw[:500]}}
    return data, sid


def ensure_session():
    data, sid = _rpc(
        "initialize",
        {
            "protocolVersion": "2025-03-26",
            "capabilities": {},
            "clientInfo": {"name": "mcd-feast-planner", "version": "0.1.0"},
        },
    )
    if "error" in data:
        print("initialize 失败:", json.dumps(data["error"], ensure_ascii=False))
        sys.exit(1)
    _rpc("notifications/initialized", {}, sid, msg_id=2)
    return sid


def list_tools(sid):
    data, _ = _rpc("tools/list", {}, sid, msg_id=3)
    tools = data.get("result", {}).get("tools", [])
    for t in tools:
        print(f"- {t['name']}: {t.get('description', '').split(chr(10))[0][:80]}")
    print(f"\n共 {len(tools)} 个工具")


def call_tool(sid, name, args):
    data, _ = _rpc(
        "tools/call", {"name": name, "arguments": args}, sid, msg_id=int(__import__("time").time())
    )
    if "error" in data:
        print(json.dumps(data["error"], ensure_ascii=False, indent=2))
        sys.exit(1)
    content = data.get("result", {}).get("content", [])
    for c in content:
        if c.get("type") == "text":
            try:
                print(json.dumps(json.loads(c["text"]), ensure_ascii=False, indent=2))
            except (json.JSONDecodeError, TypeError):
                print(c["text"])
        else:
            print(json.dumps(c, ensure_ascii=False))


def main():
    if not os.environ.get("MCD_MCP_TOKEN"):
        print("错误：未设置 MCD_MCP_TOKEN 环境变量")
        sys.exit(1)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "tools"
    sid = ensure_session()
    if cmd == "tools":
        list_tools(sid)
    elif cmd == "call":
        name = sys.argv[2]
        args = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
        call_tool(sid, name, args)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
