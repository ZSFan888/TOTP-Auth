
const COMMIT_MSG = "修 Buging，歪瑞 Tired · 完整TOTP-Auth KV存储+后台管理";

// ====== HTML 模板 ======
const HOME_HTML = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TOTP-Auth</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #fafafa;
    --bg-card: #ffffff;
    --bg-sidebar: #f4f4f5;
    --border: #e4e4e7;
    --border-light: #f0f0f1;
    --text-primary: #18181b;
    --text-secondary: #52525b;
    --text-muted: #a1a1aa;
    --accent: #2563eb;
    --accent-bg: #eff6ff;
    --accent-hover: #1d4ed8;
    --success: #16a34a;
    --success-bg: #f0fdf4;
    --error: #dc2626;
    --radius: 6px;
    --radius-lg: 10px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow: 0 4px 12px rgba(0,0,0,.07);
    --font: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    --transition: .15s ease;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b;
      --bg-card: #18181b;
      --bg-sidebar: #111113;
      --border: #27272a;
      --border-light: #1f1f22;
      --text-primary: #fafafa;
      --text-secondary: #a1a1aa;
      --text-muted: #52525b;
      --accent: #3b82f6;
      --accent-bg: #1e3a5f;
      --accent-hover: #60a5fa;
      --success: #22c55e;
      --success-bg: #052e16;
      --error: #f87171;
      --shadow-sm: 0 1px 3px rgba(0,0,0,.3);
      --shadow: 0 4px 12px rgba(0,0,0,.4);
    }
  }
  html, body { height: 100%; background: var(--bg); color: var(--text-primary); font-family: var(--font); font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased; }

  /* ===== LAYOUT ===== */
  .layout { display: grid; grid-template-rows: 48px 1fr; grid-template-columns: 220px 1fr; height: 100vh; }
  .topbar { grid-column: 1 / -1; background: var(--bg-card); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 12px; z-index: 10; }
  .sidebar { background: var(--bg-sidebar); border-right: 1px solid var(--border); padding: 16px 0; overflow-y: auto; }
  .main { overflow-y: auto; padding: 28px 32px; }

  /* ===== TOPBAR ===== */
  .topbar-brand { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; color: var(--text-primary); letter-spacing: -.01em; }
  .topbar-brand .icon { width: 20px; height: 20px; background: var(--accent); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; }
  .topbar-divider { width: 1px; height: 18px; background: var(--border); margin: 0 4px; }
  .topbar-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-left: auto; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); }
  .topbar-btn { padding: 5px 12px; border-radius: var(--radius); font-size: 12px; font-weight: 500; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 6px; }
  .topbar-btn:hover { background: var(--bg); color: var(--text-primary); border-color: var(--text-muted); }

  /* ===== SIDEBAR ===== */
  .sidebar-section { padding: 0 12px 16px; }
  .sidebar-label { font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: .06em; text-transform: uppercase; padding: 0 8px; margin-bottom: 4px; }
  .sidebar-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: var(--radius); font-size: 13px; color: var(--text-secondary); cursor: pointer; transition: var(--transition); user-select: none; }
  .sidebar-item:hover { background: var(--border-light); color: var(--text-primary); }
  .sidebar-item.active { background: var(--accent-bg); color: var(--accent); font-weight: 500; }
  .sidebar-item .ico { width: 15px; opacity: .6; font-size: 13px; }
  .sidebar-item.active .ico { opacity: 1; }

  /* ===== MAIN CONTENT ===== */
  .page-header { margin-bottom: 24px; }
  .page-title { font-size: 18px; font-weight: 600; color: var(--text-primary); letter-spacing: -.02em; }
  .page-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
  .section-row { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }

  /* ===== CARDS ===== */
  .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .card-header { padding: 14px 16px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: .02em; text-transform: uppercase; }
  .card-body { padding: 16px; }

  /* ===== TOKEN CARD ===== */
  .token-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; cursor: pointer; transition: var(--transition); position: relative; }
  .token-card:hover { border-color: var(--accent); box-shadow: var(--shadow-sm); }
  .token-issuer { font-size: 10px; font-weight: 600; color: var(--accent); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 2px; }
  .token-name { font-size: 13px; color: var(--text-primary); font-weight: 500; margin-bottom: 2px; }
  .token-note { font-size: 11px; color: var(--text-muted); margin-bottom: 12px; min-height: 15px; }
  .token-code { font-family: var(--font-mono); font-size: 26px; font-weight: 700; color: var(--text-primary); letter-spacing: 6px; margin-bottom: 10px; }
  .token-code:hover { color: var(--accent); }
  .progress-wrap { height: 2px; background: var(--border); border-radius: 1px; overflow: hidden; }
  .progress-bar { height: 100%; background: var(--accent); border-radius: 1px; transition: width 1s linear; }
  .token-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
  .token-timer { font-size: 11px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
  .copy-hint { font-size: 11px; color: var(--text-muted); }
  .copied-badge { font-size: 11px; color: var(--success); display: none; }

  /* ===== PIN SCREEN ===== */
  .pin-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 48px); padding: 24px; }
  .pin-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; width: 100%; max-width: 360px; box-shadow: var(--shadow); }
  .pin-icon { width: 36px; height: 36px; background: var(--accent-bg); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 16px; margin-bottom: 16px; }
  .pin-title { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
  .pin-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
  .field-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); letter-spacing: .04em; text-transform: uppercase; margin-bottom: 6px; }
  input[type=password], input[type=text] { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg); color: var(--text-primary); font-size: 14px; outline: none; transition: var(--transition); font-family: var(--font); }
  input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-bg); }
  .btn { padding: 8px 16px; border-radius: var(--radius); font-size: 13px; font-weight: 500; border: none; cursor: pointer; transition: var(--transition); display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-full { width: 100%; justify-content: center; margin-top: 12px; padding: 10px; }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
  .btn-ghost:hover { border-color: var(--text-muted); color: var(--text-primary); }
  .err-text { font-size: 12px; color: var(--error); margin-top: 8px; }

  /* ===== EMPTY STATE ===== */
  .empty { text-align: center; padding: 48px 24px; color: var(--text-muted); }
  .empty-icon { font-size: 28px; margin-bottom: 12px; opacity: .4; }
  .empty-title { font-size: 14px; color: var(--text-secondary); margin-bottom: 4px; }
  .empty-desc { font-size: 12px; }


  /* ===== SEARCH ===== */
  .search-wrap { margin-bottom: 18px; position: relative; }
  .search-wrap input { padding-left: 34px; background: var(--bg-card); }
  .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; pointer-events: none; }

  /* ===== TOKEN CARD DRAG ===== */
  .token-card { user-select: none; touch-action: none; }
  .token-card.dragging { opacity: .5; border: 1px dashed var(--accent); box-shadow: var(--shadow); }
  .token-card.drag-over { border-color: var(--accent); background: var(--accent-bg); }

  /* ===== WARNING STATE ===== */
  .token-card.expiring .token-code { color: var(--error) !important; }
  .token-card.expiring .progress-bar { background: var(--error) !important; }
  .token-card.expiring .token-timer { color: var(--error); font-weight: 600; }

  /* ===== FAVICON AVATAR ===== */
  .token-avatar { width: 20px; height: 20px; border-radius: 4px; object-fit: contain; margin-right: 6px; vertical-align: middle; display: inline-block; }
  .token-avatar-letter { width: 20px; height: 20px; border-radius: 4px; background: var(--accent-bg); color: var(--accent); font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; vertical-align: middle; flex-shrink: 0; }

  /* ===== CODE FLIP ANIMATION ===== */
  @keyframes flipIn { 0%{transform:translateY(-6px);opacity:0} 100%{transform:translateY(0);opacity:1} }
  .token-code.flip { animation: flipIn .25s ease forwards; }

  /* ===== SECTION ROW UPDATE ===== */
  .section-row { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 640px) {
    .layout { grid-template-columns: 1fr; grid-template-rows: 48px auto 1fr; }
    .sidebar { display: none; }
    .main { padding: 20px 16px; }
    .token-code { font-size: 22px; }
  }
</style>
</head>
<body>

<!-- PIN Screen -->
<div id="pin-screen" class="pin-screen">
  <div class="pin-box">
    <div class="pin-icon">🔐</div>
    <div class="pin-title">TOTP-Auth</div>
    <div class="pin-desc">输入 PIN 码继续</div>
    <div class="field-label">PIN 码</div>
    <input id="pin" type="password" placeholder="••••••" maxlength="6" inputmode="numeric" autocomplete="current-password" onkeydown="if(event.key==='Enter')login()">
    <p class="err-text" id="pin-err"></p>
    <button class="btn btn-primary btn-full" onclick="login()">进入</button>
  </div>
</div>

<!-- App Layout -->
<div class="layout" id="app" style="display:none">
  <!-- Topbar -->
  <header class="topbar">
    <div class="topbar-brand">
      <div class="icon">🔐</div>
      TOTP-Auth
    </div>
    <div class="topbar-divider"></div>
    <span style="font-size:12px;color:var(--text-muted)">验证码管理器</span>
    <div class="topbar-status">
      <div class="status-dot"></div>
      <span>KV 已连接</span>
    </div>
    <button class="topbar-btn" onclick="location.href='/admin'">⚙ 管理账户</button>
  </header>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-label">工作台</div>
      <div class="sidebar-item active">
        <span class="ico">▤</span> 验证码
      </div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-label">账户</div>
      <div class="sidebar-item" onclick="location.href='/admin'">
        <span class="ico">+</span> 添加账户
      </div>
      <div class="sidebar-item" onclick="location.href='/admin'">
        <span class="ico">✎</span> 管理账户
      </div>
    </div>
    <div class="sidebar-section" style="margin-top:auto">
      <div class="sidebar-label">系统</div>
      <div class="sidebar-item" onclick="logout()">
        <span class="ico">←</span> 退出登录
      </div>
    </div>
  </aside>

  <!-- Main -->
  <main class="main">
    <div class="page-header">
      <div class="page-title">验证码</div>
      <div class="page-desc">点击验证码自动复制 · 每 30 秒自动刷新 · 长按拖动排序</div>
    </div>
    <div class="search-wrap">
      <span class="search-icon">⌕</span>
      <input type="text" id="search-input" placeholder="搜索账户名、备注…" oninput="filterTokens(this.value)">
    </div>
    <div class="section-row" id="tokens"></div>
  </main>
</div>

<script>
// ===== 常见服务图标映射 =====
const FAVICON_MAP = {
  google: 'https://www.google.com/favicon.ico',
  gmail: 'https://www.google.com/favicon.ico',
  github: 'https://github.com/favicon.ico',
  gitlab: 'https://gitlab.com/favicon.ico',
  apple: 'https://www.apple.com/favicon.ico',
  microsoft: 'https://www.microsoft.com/favicon.ico',
  twitter: 'https://twitter.com/favicon.ico',
  x: 'https://x.com/favicon.ico',
  facebook: 'https://www.facebook.com/favicon.ico',
  amazon: 'https://www.amazon.com/favicon.ico',
  aws: 'https://aws.amazon.com/favicon.ico',
  cloudflare: 'https://www.cloudflare.com/favicon.ico',
  dropbox: 'https://www.dropbox.com/favicon.ico',
  discord: 'https://discord.com/favicon.ico',
  slack: 'https://slack.com/favicon.ico',
  notion: 'https://www.notion.so/favicon.ico',
  binance: 'https://www.binance.com/favicon.ico',
  okx: 'https://www.okx.com/favicon.ico',
  paypal: 'https://www.paypal.com/favicon.ico',
  stripe: 'https://stripe.com/favicon.ico',
  vercel: 'https://vercel.com/favicon.ico',
  netlify: 'https://www.netlify.com/favicon.ico',
  digitalocean: 'https://www.digitalocean.com/favicon.ico',
  twilio: 'https://www.twilio.com/favicon.ico',
  npm: 'https://www.npmjs.com/favicon.ico',
  docker: 'https://www.docker.com/favicon.ico',
  figma: 'https://www.figma.com/favicon.ico',
  linear: 'https://linear.app/favicon.ico',
};

function getFaviconUrl(name, issuer) {
  const key = (issuer || name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [k, v] of Object.entries(FAVICON_MAP)) {
    if (key.includes(k)) return v;
  }
  return null;
}

function avatarHtml(name, issuer) {
  const url = getFaviconUrl(name, issuer);
  const letter = (name || '?')[0].toUpperCase();
  if (url) return '<img class=\"token-avatar\" src=\"' + url + '\" onerror=\"this.style.display=\\'none\\';this.nextSibling.style.display=\\'inline-flex\\'\"' + ' alt=\"\"><span class=\"token-avatar-letter\" style=\"display:none\">' + letter + '</span>';
  return '<span class=\"token-avatar-letter\">' + letter + '</span>';
}

let pinHash = localStorage.getItem('ph'), data = [], filteredData = [], dragSrcIdx = null;
if (pinHash) tryAutoLogin();

async function login() {
  const pin = document.getElementById('pin').value;
  if (pin.length !== 6) { document.getElementById('pin-err').textContent = '请输入 6 位数字 PIN'; return; }
  pinHash = await hashPin(pin);
  const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
  const d = await res.json();
  if (d.success) { localStorage.setItem('ph', pinHash); showApp(); }
  else document.getElementById('pin-err').textContent = 'PIN 错误，请重试';
}

async function tryAutoLogin() {
  const res = await fetch('/api/accounts', { headers: { 'x-pin-hash': pinHash } });
  if (res.ok) { data = await res.json(); filteredData = [...data]; showApp(); }
  else { localStorage.removeItem('ph'); pinHash = null; }
}

function showApp() {
  document.getElementById('pin-screen').style.display = 'none';
  document.getElementById('app').style.display = 'grid';
  renderTokens(); startTimer();
}

function logout() { localStorage.removeItem('ph'); location.reload(); }

// ===== 搜索/筛选 =====
function filterTokens(q) {
  const kw = q.trim().toLowerCase();
  filteredData = kw ? data.filter(a => (a.name + a.note + a.issuer).toLowerCase().includes(kw)) : [...data];
  renderTokens();
}

// ===== 渲染 =====
function renderTokens() {
  const el = document.getElementById('tokens');
  if (!filteredData.length) {
    el.innerHTML = data.length
      ? `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🔍</div><div class="empty-title">无匹配结果</div></div>`
      : `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🔐</div><div class="empty-title">暂无账户</div><div class="empty-desc">前往管理页面添加 2FA 账户</div><button class="btn btn-ghost" style="margin-top:12px" onclick="location.href='/admin'">前往管理</button></div>`;
    return;
  }
  const rem = 30 - (Math.floor(Date.now() / 1000) % 30);
  el.innerHTML = filteredData.map((a, i) => `
    <div class="token-card${rem <= 8 ? ' expiring' : ''}" data-idx="${i}" draggable="true"
      ondragstart="dragStart(event,${i})" ondragover="dragOver(event,${i})" ondragend="dragEnd(event)"
      ondrop="drop(event,${i})" onclick="copyCode('${a.id}','${a.token}')">
      <div class="token-issuer" style="display:flex;align-items:center">
        ${avatarHtml(a.name, a.issuer)}
        ${esc(a.issuer)}
      </div>
      <div class="token-name">${esc(a.name)}</div>
      <div class="token-note">${esc(a.note || '')}</div>
      <div class="token-code" id="code-${a.id}">${fmt(a.token)}</div>
      <div class="progress-wrap"><div class="progress-bar" id="bar-${a.id}" style="width:${rem/30*100}%"></div></div>
      <div class="token-meta">
        <span class="token-timer" id="sec-${a.id}">${rem}s</span>
        <span class="copy-hint" id="hint-${a.id}">点击复制</span>
        <span class="copied-badge" id="copied-${a.id}">已复制 ✓</span>
      </div>
    </div>`).join('');
}

// ===== 复制 =====
async function copyCode(id, token) {
  await navigator.clipboard.writeText(token).catch(() => {});
  if (navigator.vibrate) navigator.vibrate(30);
  document.getElementById('hint-' + id).style.display = 'none';
  document.getElementById('copied-' + id).style.display = 'inline';
  setTimeout(() => {
    if (document.getElementById('hint-' + id)) {
      document.getElementById('hint-' + id).style.display = 'inline';
      document.getElementById('copied-' + id).style.display = 'none';
    }
  }, 2000);
}

// ===== 拖拽排序 =====
function dragStart(e, idx) { dragSrcIdx = idx; e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
function dragOver(e, idx) {
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.token-card').forEach(c => c.classList.remove('drag-over'));
  if (dragSrcIdx !== idx) e.currentTarget.classList.add('drag-over');
}
function dragEnd(e) { e.currentTarget.classList.remove('dragging'); document.querySelectorAll('.token-card').forEach(c => c.classList.remove('drag-over')); }
async function drop(e, toIdx) {
  e.preventDefault();
  if (dragSrcIdx === null || dragSrcIdx === toIdx) return;
  // 在原始 data 里找到对应元素并重排
  const srcId = filteredData[dragSrcIdx].id;
  const toId = filteredData[toIdx].id;
  const srcRealIdx = data.findIndex(a => a.id === srcId);
  const toRealIdx = data.findIndex(a => a.id === toId);
  const [moved] = data.splice(srcRealIdx, 1);
  data.splice(toRealIdx, 0, moved);
  filteredData = [...data];
  dragSrcIdx = null;
  renderTokens();
  // 同步到 KV
  await fetch('/api/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-pin-hash': pinHash }, body: JSON.stringify({ order: data.map(a => a.id) }) });
}

// ===== 定时刷新 =====
let prevRem = -1;
function startTimer() {
  setInterval(async () => {
    const rem = 30 - (Math.floor(Date.now() / 1000) % 30);
    const expiring = rem <= 8;
    filteredData.forEach(a => {
      const bar = document.getElementById('bar-' + a.id);
      const sec = document.getElementById('sec-' + a.id);
      const card = bar?.closest('.token-card');
      if (bar) bar.style.width = (rem / 30 * 100) + '%';
      if (sec) sec.textContent = rem + 's';
      if (card) { if (expiring) card.classList.add('expiring'); else card.classList.remove('expiring'); }
    });
    if (rem === 30 && prevRem !== 30) {
      const res = await fetch('/api/accounts', { headers: { 'x-pin-hash': pinHash } });
      if (res.ok) {
        const newData = await res.json();
        // 数字翻转动画
        newData.forEach(a => {
          const el = document.getElementById('code-' + a.id);
          if (el && el.textContent !== fmt(a.token)) {
            el.textContent = fmt(a.token);
            el.classList.remove('flip');
            void el.offsetWidth;
            el.classList.add('flip');
          }
        });
        data = newData; filteredData = data.filter(a => { const q = document.getElementById('search-input')?.value.trim().toLowerCase(); return !q || (a.name+a.note+a.issuer).toLowerCase().includes(q); });
        renderTokens();
      }
    }
    prevRem = rem;
  }, 1000);
}

function fmt(t) { return t.slice(0, 3) + ' ' + t.slice(3); }
function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

async function hashPin(pin) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode('totp-auth-salt-2026'), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
</script>
</body>
</html>`;

// ====== 后台 HTML ======
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>管理 — TOTP-Auth</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #fafafa; --bg-card: #ffffff; --bg-sidebar: #f4f4f5;
    --border: #e4e4e7; --border-light: #f0f0f1;
    --text-primary: #18181b; --text-secondary: #52525b; --text-muted: #a1a1aa;
    --accent: #2563eb; --accent-bg: #eff6ff; --accent-hover: #1d4ed8;
    --success: #16a34a; --success-bg: #f0fdf4;
    --error: #dc2626; --error-bg: #fef2f2;
    --radius: 6px; --radius-lg: 10px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.06);
    --shadow: 0 4px 12px rgba(0,0,0,.07);
    --font: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    --transition: .15s ease;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b; --bg-card: #18181b; --bg-sidebar: #111113;
      --border: #27272a; --border-light: #1f1f22;
      --text-primary: #fafafa; --text-secondary: #a1a1aa; --text-muted: #52525b;
      --accent: #3b82f6; --accent-bg: #1e3a5f; --accent-hover: #60a5fa;
      --success: #22c55e; --success-bg: #052e16;
      --error: #f87171; --error-bg: #450a0a;
      --shadow-sm: 0 1px 3px rgba(0,0,0,.3); --shadow: 0 4px 12px rgba(0,0,0,.4);
    }
  }
  html, body { height: 100%; background: var(--bg); color: var(--text-primary); font-family: var(--font); font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased; }
  .layout { display: grid; grid-template-rows: 48px 1fr; grid-template-columns: 220px 1fr; height: 100vh; }
  .topbar { grid-column: 1/-1; background: var(--bg-card); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 12px; z-index: 10; }
  .topbar-brand { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; }
  .topbar-brand .icon { width: 20px; height: 20px; background: var(--accent); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; }
  .topbar-divider { width: 1px; height: 18px; background: var(--border); margin: 0 4px; }
  .topbar-badge { font-size: 11px; color: var(--text-muted); background: var(--bg); border: 1px solid var(--border); padding: 2px 8px; border-radius: 100px; }
  .topbar-actions { margin-left: auto; display: flex; gap: 8px; }
  .btn { padding: 8px 14px; border-radius: var(--radius); font-size: 12px; font-weight: 500; border: none; cursor: pointer; transition: var(--transition); display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
  .btn-ghost:hover { border-color: var(--text-muted); color: var(--text-primary); background: var(--bg); }
  .btn-danger-ghost { background: transparent; border: 1px solid transparent; color: var(--error); }
  .btn-danger-ghost:hover { background: var(--error-bg); border-color: var(--error); }
  .btn-sm { padding: 5px 10px; font-size: 11px; }
  .sidebar { background: var(--bg-sidebar); border-right: 1px solid var(--border); padding: 16px 0; overflow-y: auto; }
  .sidebar-section { padding: 0 12px 16px; }
  .sidebar-label { font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: .06em; text-transform: uppercase; padding: 0 8px; margin-bottom: 4px; }
  .sidebar-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: var(--radius); font-size: 13px; color: var(--text-secondary); cursor: pointer; transition: var(--transition); }
  .sidebar-item:hover { background: var(--border-light); color: var(--text-primary); }
  .sidebar-item.active { background: var(--accent-bg); color: var(--accent); font-weight: 500; }
  .sidebar-item .ico { width: 15px; opacity: .6; font-size: 13px; }
  .sidebar-item.active .ico { opacity: 1; }
  .main { overflow-y: auto; padding: 28px 32px; }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; }
  .page-title { font-size: 18px; font-weight: 600; letter-spacing: -.02em; }
  .page-desc { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
  .content-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
  .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .card-header { padding: 14px 16px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: .02em; text-transform: uppercase; }
  .card-body { padding: 16px; }
  .field-group { margin-bottom: 14px; }
  .field-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); letter-spacing: .04em; text-transform: uppercase; margin-bottom: 5px; display: block; }
  .field-hint { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
  input[type=text], input[type=password] { width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg); color: var(--text-primary); font-size: 13px; outline: none; transition: var(--transition); font-family: inherit; }
  input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-bg); }
  .input-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; letter-spacing: 1px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .alert { padding: 10px 12px; border-radius: var(--radius); font-size: 12px; margin-bottom: 14px; display: none; border: 1px solid; }
  .alert.ok { background: var(--success-bg); color: var(--success); border-color: var(--success); }
  .alert.err { background: var(--error-bg); color: var(--error); border-color: var(--error); }
  /* Account List */
  .account-row { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-light); gap: 12px; transition: var(--transition); }
  .account-row:last-child { border-bottom: none; }
  .account-row:hover { background: var(--bg); }
  .account-avatar { width: 30px; height: 30px; border-radius: var(--radius); background: var(--accent-bg); color: var(--accent); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .account-info { flex: 1; min-width: 0; }
  .account-name { font-size: 13px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .account-meta { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
  .account-actions { display: flex; gap: 4px; flex-shrink: 0; }
  .empty { text-align: center; padding: 40px 24px; color: var(--text-muted); }
  .empty-icon { font-size: 24px; margin-bottom: 8px; opacity: .4; }
  /* Modal */
  .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 100; align-items: center; justify-content: center; padding: 24px; }
  .modal-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 380px; box-shadow: var(--shadow); }
  .modal-header { padding: 16px 18px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-size: 14px; font-weight: 600; }
  .modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px; padding: 2px; line-height: 1; }
  .modal-close:hover { color: var(--text-primary); }
  .modal-body { padding: 16px 18px; }
  .modal-footer { padding: 12px 18px; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 8px; }
  /* QR Modal */
  .qr-video-wrap { position: relative; border-radius: var(--radius); overflow: hidden; background: #000; aspect-ratio: 1; }
  video { width: 100%; height: 100%; object-fit: cover; }
  .qr-frame { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 60%; height: 60%; border: 1.5px solid rgba(255,255,255,.9); border-radius: 8px; box-shadow: 0 0 0 9999px rgba(0,0,0,.45); }
  .qr-hint { position: absolute; bottom: 10px; left: 0; right: 0; text-align: center; font-size: 11px; color: rgba(255,255,255,.8); }
  .divider { display: flex; align-items: center; gap: 10px; margin: 12px 0; color: var(--text-muted); font-size: 11px; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .upload-label { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border: 1px dashed var(--border); border-radius: var(--radius); cursor: pointer; font-size: 12px; color: var(--text-secondary); transition: var(--transition); }
  .upload-label:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-bg); }
  /* PIN screen */
  .pin-screen { display: flex; align-items: center; justify-content: center; height: 100vh; padding: 24px; }
  .pin-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 340px; box-shadow: var(--shadow); }
  .pin-icon { font-size: 20px; margin-bottom: 14px; }
  .pin-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .pin-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 18px; }
  .err-text { font-size: 11px; color: var(--error); margin-top: 6px; }
  @media (max-width: 768px) {
    .layout { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .main { padding: 20px 16px; }
    .content-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<!-- PIN Screen -->
<div id="pin-screen" class="pin-screen">
  <div class="pin-box">
    <div class="pin-icon">🔐</div>
    <div class="pin-title">管理员验证</div>
    <div class="pin-desc">输入 PIN 码进入管理后台</div>
    <label class="field-label">PIN 码</label>
    <input id="admin-pin" type="password" placeholder="••••••" maxlength="6" inputmode="numeric" onkeydown="if(event.key==='Enter')adminLogin()">
    <p class="err-text" id="admin-err"></p>
    <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px;padding:9px" onclick="adminLogin()">验证</button>
  </div>
</div>

<!-- App -->
<div class="layout" id="app" style="display:none">
  <header class="topbar">
    <div class="topbar-brand">
      <div class="icon">🔐</div>
      TOTP-Auth
    </div>
    <div class="topbar-divider"></div>
    <span class="topbar-badge">管理后台</span>
    <div class="topbar-actions">
      <button class="btn btn-ghost" onclick="location.href='/'">← 返回主页</button>
    </div>
  </header>

  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-label">管理</div>
      <div class="sidebar-item active"><span class="ico">▤</span> 账户列表</div>
      <div class="sidebar-item" onclick="document.getElementById('new-name').focus()"><span class="ico">+</span> 添加账户</div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-label">操作</div>
      <div class="sidebar-item" onclick="openQR()"><span class="ico">◉</span> 扫码导入</div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-label">系统</div>
      <div class="sidebar-item" onclick="logout()"><span class="ico">←</span> 退出登录</div>
    </div>
  </aside>

  <main class="main">
    <div class="page-header">
      <div>
        <div class="page-title">账户管理</div>
        <div class="page-desc">添加、编辑或删除 2FA 账户，密钥加密存储于 KV</div>
      </div>
      <button class="btn btn-ghost" onclick="openQR()">◉ 扫码导入</button>
    </div>

    <div class="content-grid">
      <!-- 账户列表 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">已有账户</span>
          <span id="account-count" style="font-size:11px;color:var(--text-muted)">0 个</span>
        </div>
        <div id="account-list">
          <div class="empty"><div class="empty-icon">🔐</div>暂无账户</div>
        </div>
      </div>

      <!-- 添加表单 -->
      <div class="card">
        <div class="card-header"><span class="card-title">添加账户</span></div>
        <div class="card-body">
          <div id="add-alert" class="alert"></div>
          <div class="field-group">
            <label class="field-label">账户名 *</label>
            <input type="text" id="new-name" placeholder="如：GitHub、Google">
          </div>
          <div class="field-group">
            <label class="field-label">密钥 (Base32) *</label>
            <input type="text" id="new-secret" class="input-mono" placeholder="JBSWY3DPEHPK3PXP">
            <div class="field-hint">通常在服务商"设置 2FA"时以文字形式提供</div>
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">发行者</label>
              <input type="text" id="new-issuer" placeholder="Google">
            </div>
            <div class="field-group">
              <label class="field-label">备注</label>
              <input type="text" id="new-note" placeholder="工作账号">
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;padding:9px" onclick="addAccount()">添加账户</button>
          <div class="divider">或</div>
          <button class="btn btn-ghost" style="width:100%;justify-content:center" onclick="openQR()">◉ 扫描二维码导入</button>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- 编辑 Modal -->
<div id="edit-modal" class="modal-overlay">
  <div class="modal-box">
    <div class="modal-header">
      <span class="modal-title">编辑账户</span>
      <button class="modal-close" onclick="closeEdit()">×</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="edit-id">
      <div class="field-group">
        <label class="field-label">账户名</label>
        <input type="text" id="edit-name">
      </div>
      <div class="field-group">
        <label class="field-label">备注</label>
        <input type="text" id="edit-note">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeEdit()">取消</button>
      <button class="btn btn-primary" onclick="saveEdit()">保存</button>
    </div>
  </div>
</div>

<!-- QR Modal -->
<div id="qr-modal" class="modal-overlay">
  <div class="modal-box">
    <div class="modal-header">
      <span class="modal-title">◉ 扫描二维码导入</span>
      <button class="modal-close" onclick="closeQR()">×</button>
    </div>
    <div class="modal-body">
      <div class="qr-video-wrap">
        <video id="qr-video" autoplay playsinline></video>
        <canvas id="qr-canvas" style="display:none"></canvas>
        <div class="qr-frame"></div>
        <div class="qr-hint" id="qr-status">对准 2FA 二维码自动识别</div>
      </div>
      <div class="divider">或上传图片</div>
      <label class="upload-label">
        🖼 选择图片文件
        <input type="file" accept="image/*" id="qr-file" style="display:none" onchange="scanFile(this)">
      </label>
      <div id="qr-alert" class="alert" style="margin-top:10px;margin-bottom:0"></div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>
<script>
let pinHash = '', qrStream = null, qrTimer = null;
const saved = localStorage.getItem('ph');
if (saved) { pinHash = saved; document.getElementById('pin-screen').style.display = 'none'; document.getElementById('app').style.display = 'grid'; loadAccounts(); }

async function adminLogin() {
  const pin = document.getElementById('admin-pin').value;
  if (pin.length !== 6) { document.getElementById('admin-err').textContent = '请输入 6 位数字 PIN'; return; }
  pinHash = await hashPin(pin);
  const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
  const d = await res.json();
  if (d.success) { localStorage.setItem('ph', pinHash); document.getElementById('pin-screen').style.display = 'none'; document.getElementById('app').style.display = 'grid'; loadAccounts(); }
  else document.getElementById('admin-err').textContent = 'PIN 错误';
}

function logout() { localStorage.removeItem('ph'); location.reload(); }

async function loadAccounts() {
  const res = await fetch('/api/accounts-admin', { headers: { 'x-pin-hash': pinHash } });
  if (!res.ok) return;
  const list = await res.json();
  document.getElementById('account-count').textContent = list.length + ' 个';
  const el = document.getElementById('account-list');
  if (!list.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">🔐</div>暂无账户，从右侧添加</div>'; return; }
  el.innerHTML = list.map(a => `
    <div class="account-row">
      <div class="account-avatar">${esc(a.name[0] || '?').toUpperCase()}</div>
      <div class="account-info">
        <div class="account-name">${esc(a.name)}</div>
        <div class="account-meta">${esc(a.issuer || a.name)}${a.note ? ' · ' + esc(a.note) : ''}</div>
      </div>
      <div class="account-actions">
        <button class="btn btn-ghost btn-sm" onclick="openEdit('${a.id}','${esc(a.name)}','${esc(a.note||'')}')">编辑</button>
        <button class="btn btn-danger-ghost btn-sm" onclick="deleteAccount('${a.id}')">删除</button>
      </div>
    </div>`).join('');
}

async function addAccount() {
  const name = document.getElementById('new-name').value.trim();
  const secret = document.getElementById('new-secret').value.trim().toUpperCase().replace(/[^A-Z2-7]/g, '');
  const issuer = document.getElementById('new-issuer').value.trim();
  const note = document.getElementById('new-note').value.trim();
  if (!name || !secret) { showAlert('add-alert', '账户名和密钥不能为空', 'err'); return; }
  const res = await fetch('/api/add', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-pin-hash': pinHash }, body: JSON.stringify({ name, secret, issuer, note }) });
  const d = await res.json();
  if (d.success) {
    showAlert('add-alert', '✓ 账户已添加', 'ok');
    ['new-name','new-secret','new-issuer','new-note'].forEach(id => document.getElementById(id).value = '');
    loadAccounts();
  } else showAlert('add-alert', d.error || '添加失败', 'err');
}

function openEdit(id, name, note) {
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-name').value = name;
  document.getElementById('edit-note').value = note;
  document.getElementById('edit-modal').style.display = 'flex';
}
function closeEdit() { document.getElementById('edit-modal').style.display = 'none'; }
async function saveEdit() {
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('edit-name').value.trim();
  const note = document.getElementById('edit-note').value.trim();
  await fetch('/api/edit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-pin-hash': pinHash }, body: JSON.stringify({ id, name, note }) });
  closeEdit(); loadAccounts();
}
async function deleteAccount(id) {
  if (!confirm('确认删除？此操作不可撤销')) return;
  await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-pin-hash': pinHash }, body: JSON.stringify({ id }) });
  loadAccounts();
}

function showAlert(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text; el.className = 'alert ' + type; el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function openQR() { document.getElementById('qr-modal').style.display = 'flex'; startCamera(); }
function closeQR() { stopCamera(); document.getElementById('qr-modal').style.display = 'none'; document.getElementById('qr-alert').style.display = 'none'; document.getElementById('qr-file').value = ''; }
async function startCamera() {
  try {
    qrStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    document.getElementById('qr-video').srcObject = qrStream;
    qrTimer = setInterval(scanFrame, 300);
  } catch { document.getElementById('qr-status').textContent = '无法访问摄像头，请上传图片'; }
}
function stopCamera() {
  clearInterval(qrTimer);
  if (qrStream) { qrStream.getTracks().forEach(t => t.stop()); qrStream = null; }
}
function scanFrame() {
  const v = document.getElementById('qr-video');
  if (v.readyState !== v.HAVE_ENOUGH_DATA) return;
  const c = document.getElementById('qr-canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height);
  const code = jsQR(d.data, c.width, c.height);
  if (code) handleQR(code.data);
}
function scanFile(input) {
  const file = input.files[0]; if (!file) return;
  const img = new Image();
  img.onload = () => {
    const c = document.getElementById('qr-canvas');
    c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    const d = c.getContext('2d').getImageData(0, 0, img.width, img.height);
    const code = jsQR(d.data, img.width, img.height);
    if (code) handleQR(code.data);
    else showAlert('qr-alert', '未识别到二维码，请尝试更清晰的图片', 'err');
  };
  img.src = URL.createObjectURL(file);
}
async function handleQR(data) {
  stopCamera();
  document.getElementById('qr-status').textContent = '✓ 已识别，正在导入…';
  if (!data.startsWith('otpauth://')) { showAlert('qr-alert', '不是有效的 2FA 二维码', 'err'); return; }
  const res = await fetch('/api/qr-import', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-pin-hash': pinHash }, body: JSON.stringify({ uri: data }) });
  const d = await res.json();
  if (d.success) { showAlert('qr-alert', '✓ 导入成功', 'ok'); setTimeout(() => { closeQR(); loadAccounts(); }, 1200); }
  else showAlert('qr-alert', d.error || '导入失败', 'err');
}

function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
async function hashPin(pin) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode('totp-auth-salt-2026'), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
</script>
</body>
</html>`;

// ====== Worker 核心逻辑 ======
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 自动初始化 KV（首次访问时 pin_hash 不存在即为首次）
    // KV 无需建表，直接使用

    if (url.pathname === '/') return html(HOME_HTML);
    if (url.pathname === '/admin') return html(ADMIN_HTML);

    // ---- API ----
    if (url.pathname === '/api/login' && request.method === 'POST') {
      const { pin } = await request.json();
      const incoming = await hashPin(pin);
      const stored = await env.KV.get("pin_hash");
      if (!stored) {
        // 首次设置 PIN
        await env.KV.put("pin_hash", incoming);
        return Response.json({ success: true, setup: true });
      }
      return Response.json({ success: stored === incoming });
    }

    // 主页获取账户（含 TOTP 码，不返回 secret）
    if (url.pathname === '/api/accounts' && request.method === 'GET') {
      if (!await verifyPin(request, env)) return unauth();
      const accounts = JSON.parse(await env.KV.get("accounts") || "[]");
      const result = await Promise.all(accounts.map(async a => ({
        id: a.id, name: a.name, issuer: a.issuer || a.name, note: a.note || '',
        token: await generateTOTP(a.secret),
        remaining: 30 - (Math.floor(Date.now() / 1000) % 30)
      })));
      return Response.json(result);
    }

    // 后台获取账户（返回 name/issuer/note，不返回 secret）
    if (url.pathname === '/api/accounts-admin' && request.method === 'GET') {
      if (!await verifyPin(request, env)) return unauth();
      const accounts = JSON.parse(await env.KV.get("accounts") || "[]");
      return Response.json(accounts.map(({ id, name, issuer, note }) => ({ id, name, issuer, note })));
    }


    if (url.pathname === '/api/qr-import' && request.method === 'POST') {
      if (!await verifyPin(request, env)) return unauth();
      const { uri } = await request.json();
      const parsed = parseOtpauth(uri || '');
      if (!parsed) return Response.json({ error: '无效的 otpauth URI' }, { status: 400 });
      const accounts = JSON.parse(await env.KV.get("accounts") || "[]");
      accounts.push({
        id: crypto.randomUUID(),
        name: parsed.name || parsed.issuer || '未命名',
        secret: parsed.secret,
        issuer: parsed.issuer || parsed.name || '未知',
        note: parsed.note || ''
      });
      await env.KV.put("accounts", JSON.stringify(accounts));
      return Response.json({ success: true });
    }


    if (url.pathname === '/api/reorder' && request.method === 'POST') {
      if (!await verifyPin(request, env)) return unauth();
      const { order } = await request.json();
      const accounts = JSON.parse(await env.KV.get("accounts") || "[]");
      const map = Object.fromEntries(accounts.map(a => [a.id, a]));
      const reordered = order.filter(id => map[id]).map(id => map[id]);
      await env.KV.put("accounts", JSON.stringify(reordered));
      return Response.json({ success: true });
    }

    if (url.pathname === '/api/add' && request.method === 'POST') {
      if (!await verifyPin(request, env)) return unauth();
      const { name, secret, issuer, note } = await request.json();
      if (!name || !secret) return Response.json({ error: '缺少必填字段' }, { status: 400 });
      const accounts = JSON.parse(await env.KV.get("accounts") || "[]");
      accounts.push({ id: crypto.randomUUID(), name, secret: secret.toUpperCase().replace(/[^A-Z2-7]/g,''), issuer: issuer || name, note: note || '' });
      await env.KV.put("accounts", JSON.stringify(accounts));
      return Response.json({ success: true });
    }

    if (url.pathname === '/api/edit' && request.method === 'POST') {
      if (!await verifyPin(request, env)) return unauth();
      const { id, name, note } = await request.json();
      const accounts = JSON.parse(await env.KV.get("accounts") || "[]");
      await env.KV.put("accounts", JSON.stringify(accounts.map(a => a.id === id ? { ...a, name, note } : a)));
      return Response.json({ success: true });
    }

    if (url.pathname === '/api/delete' && request.method === 'POST') {
      if (!await verifyPin(request, env)) return unauth();
      const { id } = await request.json();
      const accounts = JSON.parse(await env.KV.get("accounts") || "[]");
      await env.KV.put("accounts", JSON.stringify(accounts.filter(a => a.id !== id)));
      return Response.json({ success: true });
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function verifyPin(request, env) {
  const hash = request.headers.get('x-pin-hash');
  if (!hash) return false;
  const stored = await env.KV.get("pin_hash");
  if (!stored) return false;
  return stored === hash;
}
function unauth() { return Response.json({ error: '未授权' }, { status: 401 }); }

function parseOtpauth(uri) {
  try {
    const u = new URL(uri);
    if (u.protocol !== 'otpauth:') return null;
    const type = u.hostname;
    const label = decodeURIComponent(u.pathname.replace(/^\//, ''));
    const params = Object.fromEntries(u.searchParams.entries());
    const secret = (params.secret || '').replace(/\s/g, '').toUpperCase();
    if (!secret) return null;
    const [issuerFromLabel, accountFromLabel] = label.includes(':') ? label.split(':', 2) : ['', label];
    const issuer = params.issuer || issuerFromLabel || '';
    const name = accountFromLabel || issuer || '未命名';
    return { type, issuer, name, secret, note: params.note || '' };
  } catch (e) {
    return null;
  }
}

function html(content) { return new Response(content, { headers: { 'Content-Type': 'text/html;charset=utf-8' } }); }

async function hashPin(pin) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode('totp-auth-salt-2026'), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateTOTP(secret) {
  const epoch = Math.floor(Date.now() / 1000 / 30);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of secret.replace(/[^A-Z2-7]/gi, '').toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, '0');
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  const key = new Uint8Array(bytes);
  const buf = new ArrayBuffer(8);
  new DataView(buf).setUint32(4, epoch, false);
  const hmac = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']), buf);
  const view = new DataView(hmac);
  const offset = view.getUint8(19) & 0xf;
  return ((view.getUint32(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
}
