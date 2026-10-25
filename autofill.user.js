// ==UserScript==
// @name         1024 造物挑战 · 麦麦团餐参谋自动填表
// @namespace    sijiushi
// @version      1.0
// @description  在 WorkBuddy 1024 造物挑战活动页自动填写「麦麦团餐参谋」参赛表单。打开活动页 → 点「发布作品」→ 表单自动填好 → 手动上传截图 → 点「提交投稿」。
// @match        https://www.workbuddy.link/p/*
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ═══ 填写内容（按需修改后保存刷新生效）═══
  var DATA = {
    declaration: '用 AI 把 15 分钟的团餐组织压缩到 30 秒',
    name: '麦麦团餐参谋 mcd-feast-planner',
    author: '老秦',
    raw: '办公室团餐/下午茶场景的 AI 参谋。输入人数、人均预算和口味偏好，Skill 通过麦当劳 MCP 自动完成门店定位、菜单拉取、三重用券检查、券有效性验算和精确算价，输出一页团餐方案和可直接粘贴到微信群的接龙文本。适合行政、团队负责人和组织者使用，只读+算价，不下单不支付。',
    url: 'https://mcd-feast-planner.app.workbuddy.host/?sharecode=Y2ME3ARDNF',
    conversation: '', // ← 分享本对话后把链接粘贴到这里
    share: '',        // ← 社媒帖子链接（选填，+30 分必填项，发帖后回填）
    uid: '',          // ← 登录后若页面自动带出可留空
    phone: ''         // ← 大陆手机号
  };

  var TYPE_TEXT = '网页应用'; // 作品形态：网页应用 / 小程序应用

  function fill() {
    var ids = ['fDeclaration', 'fName', 'fAuthor', 'fRaw', 'fUrl', 'fConversation', 'fShare', 'fUid', 'fPhone'];
    var keys = ['declaration', 'name', 'author', 'raw', 'url', 'conversation', 'share', 'uid', 'phone'];
    var filled = [];
    ids.forEach(function (id, i) {
      var el = document.getElementById(id);
      var v = DATA[keys[i]];
      if (el && v) {
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        filled.push(id);
      }
    });

    // 作品形态（按钮组，按文案点击）
    var btns = document.querySelectorAll('[data-choice="type"] .rdo');
    btns.forEach(function (b) {
      if ((b.dataset.v || b.textContent || '').trim() === TYPE_TEXT) b.click();
    });

    // 授权勾选
    var ok = document.getElementById('fOk');
    if (ok && !ok.checked) ok.click();

    // 触发草稿保存（如有）
    var d = document.querySelector('.sbd');
    if (d) d.dispatchEvent(new Event('input', { bubbles: true }));

    console.log('[麦麦团餐参谋] 已填字段:', filled.join(', '), '| 形态:', TYPE_TEXT);
    if (!DATA.conversation) console.warn('[麦麦团餐参谋] conversation 为空：请填写 WorkBuddy 创作对话记录链接');
    if (!DATA.phone) console.warn('[麦麦团餐参谋] phone 为空：请填写手机号');

    // 视觉提示
    var tip = document.createElement('div');
    tip.textContent = '✅ 表单已自动填好：请上传截图 → 检查对话记录链接/手机号 → 点「提交投稿」';
    tip.style.cssText = 'position:fixed;left:0;right:0;bottom:90px;margin:auto;width:max-content;max-width:90%;background:#D52300;color:#fff;padding:12px 20px;border-radius:12px;font-size:15px;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,.3)';
    document.body.appendChild(tip);
    setTimeout(function () { tip.remove(); }, 15000);
  }

  // 表单是异步渲染的底部弹层：轮询等待 #fName 出现，只填一次
  var tried = false;
  var timer = setInterval(function () {
    if (!tried && document.getElementById('fName')) {
      tried = true;
      setTimeout(fill, 400); // 等渲染稳定
      clearInterval(timer);
    }
  }, 500);
  setTimeout(function () { clearInterval(timer); }, 120000);
})();
