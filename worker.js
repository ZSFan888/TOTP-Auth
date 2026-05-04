
const COMMIT_MSG = "修 Buging，歪瑞 Tired · 完整TOTP-Auth KV存储+后台管理";

// ====== HTML 模板 ======
const HOME_HTML = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TOTP-Auth</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f2f5;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:20px}
  .logo{font-size:2em;margin:40px 0 8px}
  h1{font-size:1.4em;color:#1a1a2e;margin-bottom:4px}
  .sub{color:#888;font-size:.9em;margin-bottom:32px}
  .card{background:#fff;border-radius:16px;padding:24px;width:100%;max-width:420px;box-shadow:0 2px 12px rgba(0,0,0,.08);margin-bottom:12px}
  input{width:100%;padding:14px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:1em;outline:none;transition:.2s;letter-spacing:4px;text-align:center}
  input:focus{border-color:#4f46e5}
  button{width:100%;padding:14px;background:#4f46e5;color:#fff;border:none;border-radius:10px;font-size:1em;font-weight:600;cursor:pointer;margin-top:12px;transition:.15s}
  button:hover{background:#4338ca}
  .err{color:#ef4444;font-size:.85em;margin-top:8px;text-align:center}
  .tokens{width:100%;max-width:420px}
  .token-card{background:#fff;border-radius:16px;padding:20px;margin-bottom:12px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .issuer{font-size:.78em;color:#6366f1;font-weight:600;letter-spacing:.5px;text-transform:uppercase}
  .name{font-size:1em;color:#374151;font-weight:500;margin:2px 0 4px}
  .note{color:#9ca3af;font-size:.82em}
  .code{font-size:2.4em;font-weight:700;color:#1a1a2e;letter-spacing:8px;margin:8px 0;cursor:pointer;user-select:none}
  .code:hover{color:#4f46e5}
  .timer-wrap{height:4px;background:#f3f4f6;border-radius:2px;overflow:hidden}
  .timer-bar{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:2px;transition:width 1s linear}
  .timer-text{font-size:.75em;color:#9ca3af;margin-top:4px}
  .nav{width:100%;max-width:420px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
  .nav-title{font-size:1.1em;font-weight:700;color:#1a1a2e}
  .admin-btn{background:none;border:1.5px solid #e5e7eb;color:#374151;padding:8px 16px;border-radius:8px;font-size:.85em;cursor:pointer;width:auto;margin:0}
  .admin-btn:hover{border-color:#4f46e5;color:#4f46e5;background:#f5f3ff}
  .copied{animation:flash .3s}
  @keyframes flash{0%,100%{opacity:1}50%{opacity:.3}}
  @media(prefers-color-scheme:dark){body{background:#0f0f1a}h1,.nav-title,.name,.code{color:#f1f1f1}.card,.token-card{background:#1e1e2e;box-shadow:0 2px 12px rgba(0,0,0,.3)}.admin-btn{border-color:#374151;color:#9ca3af}.timer-wrap{background:#2d2d3d}input{background:#1e1e2e;border-color:#374151;color:#f1f1f1}}
</style>
</head>
<body>

<div id="login-view">
  <div class="logo">🔐</div>
  <h1>TOTP-Auth</h1>
  <p class="sub">输入 PIN 码查看验证码</p>
  <div class="card">
    <input id="pin" type="password" placeholder="6 位 PIN" maxlength="6" inputmode="numeric" onkeydown="if(event.key==='Enter')login()">
    <button onclick="login()">进入</button>
    <p class="err" id="err"></p>
  </div>
</div>

<div id="main-view" style="display:none">
  <div class="nav">
    <span class="nav-title">🔐 TOTP-Auth</span>
    <button class="admin-btn" onclick="location.href='/admin'">⚙️ 管理</button>
  </div>
  <div class="tokens" id="tokens"></div>
</div>

<script>
let pinHash = localStorage.getItem('ph');
let remaining = 30 - (Math.floor(Date.now()/1000) % 30);
let data = [];

if(pinHash) tryAutoLogin();

async function login(){
  const pin = document.getElementById('pin').value;
  if(pin.length !== 6){document.getElementById('err').textContent='请输入6位PIN';return;}
  pinHash = await hashPin(pin);
  const res = await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})});
  const d = await res.json();
  if(d.success){localStorage.setItem('ph',pinHash);showMain();}
  else{document.getElementById('err').textContent='PIN 错误，请重试';}
}

async function tryAutoLogin(){
  const res = await fetch('/api/accounts',{headers:{'x-pin-hash':pinHash}});
  if(res.ok){data=await res.json();showMain();}
  else{localStorage.removeItem('ph');}
}

function showMain(){
  document.getElementById('login-view').style.display='none';
  document.getElementById('main-view').style.display='flex';
  document.getElementById('main-view').style.flexDirection='column';
  document.getElementById('main-view').style.alignItems='center';
  document.getElementById('main-view').style.width='100%';
  renderTokens();
  startTimer();
}

function renderTokens(){
  const el = document.getElementById('tokens');
  if(!data.length){el.innerHTML='<div class="token-card" style="text-align:center;color:#9ca3af;padding:40px">暂无账户<br><small>点右上角⚙️ 管理添加</small></div>';return;}
  el.innerHTML = data.map(a=>\`
    <div class="token-card">
      <div class="issuer">\${esc(a.issuer||a.name)}</div>
      <div class="name">\${esc(a.name)}\${a.note?\` <span class="note">· \${esc(a.note)}</span>\`:''}</div>
      <div class="code" id="code-\${a.id}" onclick="copyCode('\${a.id}','\${a.token}')">\${fmt(a.token)}</div>
      <div class="timer-wrap"><div class="timer-bar" id="bar-\${a.id}" style="width:\${remaining/30*100}%"></div></div>
      <div class="timer-text" id="sec-\${a.id}">\${remaining}s 后刷新</div>
    </div>
  \`).join('');
}

function fmt(t){return t.slice(0,3)+' '+t.slice(3);}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

async function copyCode(id,token){
  await navigator.clipboard.writeText(token).catch(()=>{});
  const el=document.getElementById('code-'+id);
  el.classList.add('copied');setTimeout(()=>el.classList.remove('copied'),300);
}

function startTimer(){
  setInterval(async()=>{
    remaining = 30 - (Math.floor(Date.now()/1000) % 30);
    data.forEach(a=>{
      const bar=document.getElementById('bar-'+a.id);
      const sec=document.getElementById('sec-'+a.id);
      if(bar) bar.style.width=(remaining/30*100)+'%';
      if(sec) sec.textContent=remaining+'s 后刷新';
    });
    if(remaining===30){
      const res=await fetch('/api/accounts',{headers:{'x-pin-hash':pinHash}});
      if(res.ok){data=await res.json();renderTokens();}
    }
  },1000);
}

async function hashPin(pin){
  const enc=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);
  const hash=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode('totp-auth-salt-2026'),iterations:100000,hash:'SHA-256'},key,256);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
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
<title>管理 - TOTP-Auth</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f2f5;min-height:100vh;padding:20px;display:flex;flex-direction:column;align-items:center}
  h1{font-size:1.3em;color:#1a1a2e;margin-bottom:20px;margin-top:10px}
  .card{background:#fff;border-radius:16px;padding:20px;width:100%;max-width:480px;box-shadow:0 2px 12px rgba(0,0,0,.08);margin-bottom:12px}
  .card h2{font-size:1em;color:#374151;margin-bottom:14px}
  input,textarea{width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.95em;outline:none;transition:.2s;margin-bottom:10px}
  input:focus,textarea:focus{border-color:#4f46e5}
  textarea{resize:vertical;min-height:70px;font-family:monospace;font-size:.88em}
  .btn{padding:12px 20px;border:none;border-radius:10px;font-size:.95em;font-weight:600;cursor:pointer;transition:.15s}
  .btn-primary{background:#4f46e5;color:#fff;width:100%}
  .btn-primary:hover{background:#4338ca}
  .btn-sm{padding:7px 14px;font-size:.82em;border-radius:8px}
  .btn-danger{background:#fee2e2;color:#ef4444}
  .btn-danger:hover{background:#fca5a5}
  .btn-edit{background:#eff6ff;color:#3b82f6}
  .btn-edit:hover{background:#bfdbfe}
  .account-item{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #f3f4f6}
  .account-item:last-child{border-bottom:none}
  .account-info .name{font-weight:600;color:#1a1a2e;font-size:.95em}
  .account-info .issuer{font-size:.78em;color:#6366f1;margin-top:1px}
  .account-info .note{font-size:.82em;color:#9ca3af;margin-top:2px}
  .actions{display:flex;gap:8px;flex-shrink:0}
  .back-btn{background:none;border:1.5px solid #e5e7eb;color:#374151;padding:8px 16px;border-radius:8px;font-size:.85em;cursor:pointer;margin-bottom:16px}
  .back-btn:hover{border-color:#4f46e5;color:#4f46e5}
  .tip{font-size:.78em;color:#9ca3af;margin-bottom:8px}
  .msg{padding:10px 14px;border-radius:8px;font-size:.88em;margin-bottom:10px;display:none}
  .msg.ok{background:#dcfce7;color:#16a34a;display:block}
  .msg.err{background:#fee2e2;color:#ef4444;display:block}
  @media(prefers-color-scheme:dark){body{background:#0f0f1a}.card{background:#1e1e2e;box-shadow:0 2px 12px rgba(0,0,0,.3)}.card h2,.account-info .name,h1{color:#f1f1f1}input,textarea{background:#1e1e2e;border-color:#374151;color:#f1f1f1}.account-item{border-bottom-color:#2d2d3d}.back-btn{border-color:#374151;color:#9ca3af}}
</style>
</head>
<body>

<div style="width:100%;max-width:480px">
  <button class="back-btn" onclick="location.href='/'">← 返回主页</button>
</div>
<h1>⚙️ 账户管理</h1>

<div id="login-view-admin" class="card">
  <h2>验证 PIN 码</h2>
  <input id="admin-pin" type="password" placeholder="6 位 PIN" maxlength="6" inputmode="numeric" onkeydown="if(event.key==='Enter')adminLogin()">
  <button class="btn btn-primary" onclick="adminLogin()">验证</button>
  <p class="err" id="admin-err" style="color:#ef4444;font-size:.85em;margin-top:8px"></p>
</div>

<div id="admin-main" style="display:none;width:100%;max-width:480px">
  <div class="card">
    <h2>➕ 添加账户</h2>
    <div id="add-msg" class="msg"></div>
    <p class="tip">账户名</p>
    <input id="new-name" placeholder="如：GitHub / Google" maxlength="50">
    <p class="tip">密钥（Base32，扫码后显示的字母数字串）</p>
    <input id="new-secret" placeholder="JBSWY3DPEHPK3PXP" style="font-family:monospace;letter-spacing:2px">
    <p class="tip">发行者（可选，默认同账户名）</p>
    <input id="new-issuer" placeholder="Google / GitHub / 自定义" maxlength="50">
    <p class="tip">备注（可选）</p>
    <input id="new-note" placeholder="如：工作邮箱、个人账号…" maxlength="100">
    <button class="btn btn-primary" onclick="addAccount()">添加</button>
  </div>

  <div class="card">
    <h2>📋 已有账户</h2>
    <div id="account-list"><div style="text-align:center;color:#9ca3af;padding:20px">暂无账户</div></div>
  </div>
</div>

<!-- 编辑模态 -->
<div id="edit-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:100;align-items:center;justify-content:center">
  <div class="card" style="max-width:380px;margin:0 20px">
    <h2>编辑账户</h2>
    <input type="hidden" id="edit-id">
    <p class="tip">账户名</p>
    <input id="edit-name" maxlength="50">
    <p class="tip">备注</p>
    <input id="edit-note" maxlength="100">
    <div style="display:flex;gap:10px;margin-top:4px">
      <button class="btn btn-primary" style="flex:1" onclick="saveEdit()">保存</button>
      <button class="btn" style="flex:1;background:#f3f4f6;color:#374151" onclick="closeEdit()">取消</button>
    </div>
  </div>
</div>

<script>
let pinHash='';

async function adminLogin(){
  const pin=document.getElementById('admin-pin').value;
  if(pin.length!==6){document.getElementById('admin-err').textContent='请输入6位PIN';return;}
  pinHash=await hashPin(pin);
  const res=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})});
  const d=await res.json();
  if(d.success){
    localStorage.setItem('ph',pinHash);
    document.getElementById('login-view-admin').style.display='none';
    document.getElementById('admin-main').style.display='block';
    loadAccounts();
  } else {document.getElementById('admin-err').textContent='PIN 错误';}
}

async function loadAccounts(){
  const res=await fetch('/api/accounts-admin',{headers:{'x-pin-hash':pinHash}});
  if(!res.ok) return;
  const accounts=await res.json();
  const el=document.getElementById('account-list');
  if(!accounts.length){el.innerHTML='<div style="text-align:center;color:#9ca3af;padding:20px">暂无账户</div>';return;}
  el.innerHTML=accounts.map(a=>\`
    <div class="account-item">
      <div class="account-info">
        <div class="name">\${esc(a.name)}</div>
        <div class="issuer">\${esc(a.issuer||a.name)}</div>
        \${a.note?\`<div class="note">· \${esc(a.note)}</div>\`:''}
      </div>
      <div class="actions">
        <button class="btn btn-sm btn-edit" onclick="openEdit('\${a.id}',\`\${esc(a.name)}\`,\`\${esc(a.note||'')}\`)">编辑</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAccount('\${a.id}')">删除</button>
      </div>
    </div>
  \`).join('');
}

async function addAccount(){
  const name=document.getElementById('new-name').value.trim();
  const secret=document.getElementById('new-secret').value.trim().toUpperCase().replace(/\\s/g,'');
  const issuer=document.getElementById('new-issuer').value.trim();
  const note=document.getElementById('new-note').value.trim();
  if(!name||!secret){showMsg('add-msg','账户名和密钥不能为空','err');return;}
  const res=await fetch('/api/add',{method:'POST',headers:{'Content-Type':'application/json','x-pin-hash':pinHash},body:JSON.stringify({name,secret,issuer,note})});
  const d=await res.json();
  if(d.success){
    showMsg('add-msg','添加成功 ✓','ok');
    document.getElementById('new-name').value='';
    document.getElementById('new-secret').value='';
    document.getElementById('new-issuer').value='';
    document.getElementById('new-note').value='';
    loadAccounts();
  } else showMsg('add-msg',d.error||'添加失败','err');
}

function openEdit(id,name,note){
  document.getElementById('edit-id').value=id;
  document.getElementById('edit-name').value=name;
  document.getElementById('edit-note').value=note;
  document.getElementById('edit-modal').style.display='flex';
}
function closeEdit(){document.getElementById('edit-modal').style.display='none';}
async function saveEdit(){
  const id=document.getElementById('edit-id').value;
  const name=document.getElementById('edit-name').value.trim();
  const note=document.getElementById('edit-note').value.trim();
  await fetch('/api/edit',{method:'POST',headers:{'Content-Type':'application/json','x-pin-hash':pinHash},body:JSON.stringify({id,name,note})});
  closeEdit(); loadAccounts();
}
async function deleteAccount(id){
  if(!confirm('确认删除这个账户？')) return;
  await fetch('/api/delete',{method:'POST',headers:{'Content-Type':'application/json','x-pin-hash':pinHash},body:JSON.stringify({id})});
  loadAccounts();
}

function showMsg(id,text,type){
  const el=document.getElementById(id);
  el.textContent=text; el.className='msg '+type;
  setTimeout(()=>el.className='msg',3000);
}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

async function hashPin(pin){
  const enc=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);
  const hash=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode('totp-auth-salt-2026'),iterations:100000,hash:'SHA-256'},key,256);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// 自动登录
const saved=localStorage.getItem('ph');
if(saved){pinHash=saved;document.getElementById('login-view-admin').style.display='none';document.getElementById('admin-main').style.display='block';loadAccounts();}
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
