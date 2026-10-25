// ==UserScript==
// @name         1024 造物挑战 · 麦麦团餐参谋自动填表
// @namespace    sijiushi
// @version      2.0
// @description  在 WorkBuddy 1024 造物挑战活动页自动填写「麦麦团餐参谋」参赛表单
// @match        https://www.workbuddy.link/p/*
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ═══ 只需修改 phone（你的手机号）；其余已备好 ═══
  var DATA = {
    declaration: '用 AI 把 15 分钟的团餐组织压缩到 30 秒',
    name: '麦麦团餐参谋 mcd-feast-planner',
    author: '老秦',
    raw: '办公室团餐/下午茶场景的 AI 参谋。输入人数、人均预算和口味偏好，Skill 通过麦当劳 MCP 自动完成门店定位、菜单拉取、三重用券检查、券有效性验算和精确算价，输出一页团餐方案和可直接粘贴到微信群的接龙文本。适合行政、团队负责人和组织者使用，只读+算价，不下单不支付。',
    url: 'https://mcd-feast-planner.app.workbuddy.host/?sharecode=Y2ME3ARDNF',
    conversation: 'https://www.workbuddy.link/p/8QYARuAmZ9RgQty3FSzNUs',
    share: '',
    uid: '',
    phone: '' // ← 只改这里：填你的大陆手机号
  };

  var TYPE_TEXT = '网页应用';

  function fill() {
    var map = { fDeclaration: 'declaration', fName: 'name', fAuthor: 'author', fRaw: 'raw', fUrl: 'url', fConversation: 'conversation', fShare: 'share', fUid: 'uid', fPhone: 'phone' };
    var filled = [];
    for (var id in map) {
      var el = document.getElementById(id);
      if (el && DATA[map[id]]) {
        el.value = DATA[map[id]];
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        filled.push(id);
      }
    }
    var btns = document.querySelectorAll('[data-choice="type"] .rdo');
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].dataset.v || btns[i].textContent || '').trim() === TYPE_TEXT) btns[i].click();
    }
    var ok = document.getElementById('fOk');
    if (ok && !ok.checked) ok.click();

    var tip = document.createElement('div');
    var missing = [];
    if (!DATA.phone) missing.push('手机号');
    if (!DATA.conversation) missing.push('创作对话记录链接');
    tip.textContent = missing.length
      ? '⚠️ 还差：' + missing.join('、') + ' — 请回脚本里补 DATA 后刷新重来；或直接手填这两个框'
      : '✅ 已填好！请上传截图 → 检查一遍 → 点「提交投稿」';
    tip.style.cssText = 'position:fixed;left:0;right:0;bottom:90px;margin:auto;width:max-content;max-width:92%;background:' + (missing.length ? '#B45309' : '#D52300') + ';color:#fff;padding:12px 20px;border-radius:12px;font-size:15px;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,.3)';
    document.body.appendChild(tip);
    setTimeout(function () { tip.remove(); }, 20000);
  }

  var tried = false;
  var timer = setInterval(function () {
    if (!tried && document.getElementById('fName')) {
      tried = true;
      setTimeout(fill, 400);
      clearInterval(timer);
    }
  }, 500);
  setTimeout(function () { clearInterval(timer); }, 120000);
})();
