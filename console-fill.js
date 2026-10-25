/* 1024 造物挑战 · 麦麦团餐参谋 — 控制台一键填充版
 * 用法：活动页发布作品表单打开时 → F12 → Console → 粘贴本文件全文 → 回车
 * 自动填：宣言/名称/作者/介绍/体验链接/对话记录链接/作品形态/授权勾选/UserID
 * 手动补：手机号框 + 上传 2 张截图 → 点「提交投稿」
 */
(async function () {
  var DATA = {
    fDeclaration: '用 AI 把 15 分钟的团餐组织压缩到 30 秒',
    fName: '麦麦团餐参谋 mcd-feast-planner',
    fAuthor: '老秦',
    fRaw: '办公室团餐/下午茶场景的 AI 参谋。输入人数、人均预算和口味偏好，Skill 通过麦当劳 MCP 自动完成门店定位、菜单拉取、三重用券检查、券有效性验算和精确算价，输出一页团餐方案和可直接粘贴到微信群的接龙文本。适合行政、团队负责人和组织者使用，只读+算价，不下单不支付。',
    fUrl: 'https://mcd-feast-planner.app.workbuddy.host/?sharecode=Y2ME3ARDNF',
    fConversation: 'https://www.workbuddy.link/p/8QYARuAmZ9RgQty3FSzNUs',
    fShare: '',
    fUid: '',
    fPhone: ''
  };

  function setV(id, v) {
    var el = document.getElementById(id);
    if (!el || !v) return false;
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  // 1. 文字字段
  var filled = [];
  for (var id in DATA) if (setV(id, DATA[id])) filled.push(id);

  // 2. 作品形态：网页应用
  var btns = document.querySelectorAll('[data-choice="type"] .rdo');
  for (var i = 0; i < btns.length; i++) {
    if ((btns[i].dataset.v || btns[i].textContent || '').trim() === '网页应用') btns[i].click();
  }

  // 3. 授权勾选
  var ok = document.getElementById('fOk');
  if (ok && !ok.checked) ok.click();

  // 4. UserID 自动取（登录态）
  var uidNote = '';
  try {
    var sp = window.__SMART_PAGE__;
    if (sp && sp.database && sp.database.getUserInfo) {
      var r = await sp.database.getUserInfo();
      var gid = r && r.userInfo && r.userInfo.id ? String(r.userInfo.id) : '';
      if (gid && setV('fUid', gid)) uidNote = 'UserID 已自动填入';
    }
  } catch (e) { uidNote = 'UserID 自动获取失败，请手填'; }

  // 5. 结果提示
  var tip = document.createElement('div');
  tip.innerHTML = '✅ 已填 ' + filled.length + ' 项（' + uidNote + '）<br>还需你：① 填手机号框 ② 上传 2 张截图 ③ 点「提交投稿」';
  tip.style.cssText = 'position:fixed;left:0;right:0;bottom:90px;margin:auto;width:max-content;max-width:92%;background:#D52300;color:#fff;padding:14px 22px;border-radius:12px;font-size:15px;line-height:1.6;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,.3)';
  document.body.appendChild(tip);
  setTimeout(function () { tip.remove(); }, 30000);
  console.log('%c[麦麦团餐参谋] 填充完成：' + filled.join(', '), 'color:#D52300;font-weight:bold');
})();
