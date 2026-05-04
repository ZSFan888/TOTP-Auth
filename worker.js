// 重写版：TOTP-Auth — 无嵌套反引号，纯字符串拼接，完全兼容 wrangler / Pages

const COMMIT_MSG = "修 Buging，歪瑞 Tired · 彻底重写，所有功能整合一版";

// ====== UI HTML 模块 ======
// 为了避免模板字符串嵌套问题，全部用常量拼接，不出现 `content` 嵌套 `content`

/**
 * 完整主页 HTML（带搜索 / 拖拽排序 / 数字动画 / 图标 / 警告色）
 */
const HOME_HTML = `
<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TOTP-Auth</title>
<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
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
    --error-bg: #fef2f2;
    --radius: 6px;
    --radius-lg: 10px;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06),
      0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
    --font: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    --transition: 0.15s ease;
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
      --error-bg: #450a0a;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
      --shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }
  html,
  body {
    height: 100%;
    background: var(--bg);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* ===== LAYOUT ===== */
  .layout {
    display: grid;
    grid-template-rows: 48px 1fr;
    grid-template-columns: 220px 1fr;
    height: 100vh;
  }
  .topbar {
    grid-column: 1 / -1;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 12px;
    z-index: 10;
  }
  .sidebar {
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    padding: 16px 0;
    overflow-y: auto;
  }
  .main {
    overflow-y: auto;
    padding: 28px 32px;
  }

  /* ===== TOPBAR ===== */
  .topbar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 13px;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }
  .topbar-brand .icon {
    width: 20px;
    height: 20px;
    background: var(--accent);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 11px;
  }
  .topbar-divider {
    width: 1px;
    height: 18px;
    background: var(--border);
    margin: 0 4px;
  }
  .topbar-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
    margin-left: auto;
  }
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
  }
  .topbar-btn {
    padding: 5px 12px;
    border-radius: var(--radius);
    font-size: 12px;
    font-weight: 500;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .topbar-btn:hover {
    background: var(--bg);
    color: var(--text-primary);
    border-color: var(--text-muted);
  }

  /* ===== SIDEBAR ===== */
  .sidebar-section {
    padding: 0 12px 16px;
  }
  .sidebar-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0 8px;
    margin-bottom: 4px;
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
    user-select: none;
  }
  .sidebar-item:hover {
    background: var(--border-light);
    color: var(--text-primary);
  }
  .sidebar-item.active {
    background: var(--accent-bg);
    color: var(--accent);
    font-weight: 500;
  }
  .sidebar-item .ico {
    width: 15px;
    opacity: 0.6;
    font-size: 13px;
  }
  .sidebar-item.active .ico {
    opacity: 1;
  }

  /* ===== MAIN CONTENT ===== */
  .page-header {
    margin-bottom: 24px;
  }
  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }
  .page-desc {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 4px;
  }
  .search-wrap {
    margin-bottom: 18px;
    position: relative;
  }
  .search-wrap input {
    padding-left: 34px;
    background: var(--bg-card);
  }
  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 14px;
    pointer-events: none;
  }

  /* ===== TOKEN CARD ===== */
  .token-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px;
    cursor: pointer;
    transition: var(--transition);
    position: relative;
    user-select: none;
    touch-action: none;
  }
  .token-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
  }
  .token-card.dragging {
    opacity: 0.5;
    border: 1px dashed var(--accent);
    box-shadow: var(--shadow);
  }
  .token-card.drag-over {
    border-color: var(--accent);
    background: var(--accent-bg);
  }
  .token-card.expiring .token-code {
    color: var(--error) !important;
  }
  .token-card.expiring .progress-bar {
    background: var(--error) !important;
  }
  .token-card.expiring .token-timer {
    color: var(--error);
    font-weight: 600;
  }
  .token-issuer {
    font-size: 10px;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
  }
  .token-name {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;
    margin-bottom: 2px;
  }
  .token-note {
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 12px;
    min-height: 15px;
  }
  .token-code {
    font-family: var(--font-mono);
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 6px;
    margin-bottom: 10px;
  }
  .token-code:hover {
    color: var(--accent);
  }
  .progress-wrap {
    height: 2px;
    background: var(--border);
    border-radius: 1px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: var(--accent);
    border-radius: 1px;
    transition: width 1s linear;
  }
  .token-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
  }
  .token-timer {
    font-size: 11px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .copy-hint {
    font-size: 11px;
    color: var(--text-muted);
  }
  .copied-badge {
    font-size: 11px;
    color: var(--success);
    display: none;
  }

  .section-row {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  /* ===== AVATAR ICONS ===== */
  .token-avatar {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    object-fit: contain;
    margin-right: 6px;
    vertical-align: middle;
    display: inline-block;
  }
  .token-avatar-letter {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: var(--accent-bg);
    color: var(--accent);
    font-size: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
    vertical-align: middle;
    flex-shrink: 0;
  }

  /* 数字翻转动画 */
  @keyframes flipIn {
    0% {
      transform: translateY(-6px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .token-code.flip {
    animation: flipIn 0.25s ease forwards;
  }

  /* ===== PIN SCREEN ===== */
  .pin-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 48px);
    padding: 24px;
  }
  .pin-box {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 32px;
    width: 100%;
    max-width: 360px;
    box-shadow: var(--shadow);
  }
  .pin-icon {
    width: 36px;
    height: 36px;
    background: var(--accent-bg);
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    margin-bottom: 16px;
  }
  .pin-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .pin-desc {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 20px;
  }
  .field-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  input[type='password'],
  input[type='text'] {
    width: 100%;
    padding: 9px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    transition: var(--transition);
    font-family: var(--font);
  }
  input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-bg);
  }
  .btn {
    padding: 8px 16px;
    border-radius: var(--radius);
    font-size: 13px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .btn-primary:hover {
    background: var(--accent-hover);
  }
  .btn-full {
    width: 100%;
    justify-content: center;
    margin-top: 12px;
    padding: 10px;
  }
  .btn-ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }
  .btn-ghost:hover {
    border-color: var(--text-muted);
    color: var(--text-primary);
  }
  .err-text {
    font-size: 12px;
    color: var(--error);
    margin-top: 8px;
  }

  /* ===== EMPTY STATE ===== */
  .empty {
    text-align: center;
    padding: 48px 24px;
    color: var(--text-muted);
  }
  .empty-icon {
    font-size: 28px;
    margin-bottom: 12px;
    opacity: 0.4;
  }
  .empty-title {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }
  .empty-desc {
    font-size: 12px;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 640px) {
    .layout {
      grid-template-columns: 1fr;
      grid-template-rows: 48px auto 1fr;
    }
    .sidebar {
      display: none;
    }
    .main {
      padding: 20px 16px;
    }
    .token-code {
      font-size: 22px;
    }
  }
</style>
</head>
<body>

  <!-- PIN Screen -->
  <div id="pin-screen" class="pin-screen">
    <div class
