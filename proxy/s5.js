const EMOS_PROGRESS_THROTTLE = new Map();
// VERSION: 2.9.0 (2026.08.30) · 国风雅集定制版 @robberer
// 免费机场代理订阅频道@s5gydl
// 本版本改自 https://t.me/MakkaPakkaGroupO_O/31030
const CURRENT_VERSION = "2.9.0";
const GITHUB_RAW_URL = "这里填下你的在线更新地址";
// ==========================================
// 1. 网页界面-单播报版本
// ==========================================

const SVG_EYE = `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
const SVG_COPY = `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
const SVG_TG = `<svg viewBox="0 0 24 24" style="width:20px;height:20px;margin-right:8px;fill:#0088cc;"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>`;

const CSS_COMMON = "\n    /* ===== 全局 CSS 变量与主题色盘系统 ===== */\n    :root { \n        --primary: #409eff; \n        --primary-hover: #66b1ff;\n        --primary-light: rgba(64, 158, 255, 0.1);\n        --success: #67c23a;\n        --warning: #e6a23c;\n        --danger: #f56c6c;\n        --bg: #f0f2f5; \n        --card: #ffffff; \n        --text: #303133; \n        --text-sec: #909399;\n        --border: #dcdfe6; \n        --radius-card: 8px;\n        --radius-btn: 6px;\n    }\n    \n    /* 故宫朱砂红色盘 */\n    [data-theme='vermilion'] {\n        --primary: #c0392b;\n        --primary-hover: #d94f3d;\n        --primary-light: rgba(192, 57, 43, 0.1);\n    }\n    /* 千里江山青绿色盘 */\n    [data-theme='jade'] {\n        --primary: #1e7e34;\n        --primary-hover: #28a745;\n        --primary-light: rgba(30, 126, 52, 0.1);\n    }\n    /* 天青汝窑蓝色盘 */\n    [data-theme='sky'] {\n        --primary: #2980b9;\n        --primary-hover: #3498db;\n        --primary-light: rgba(41, 128, 185, 0.1);\n    }\n    \n    body.dark {\n        --bg: #141414; \n        --card: #1f1f1f; \n        --text: #e5eaf3; \n        --text-sec: #a3a6ad;\n        --border: #363637;\n    }\n\n    * { box-sizing: border-box; touch-action: manipulation; }\n    body { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"PingFang SC\", \"Microsoft YaHei\", sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 20px; -webkit-text-size-adjust: 100%; transition: background-color 0.25s, color 0.25s; line-height: 1.6; }\n    .container { max-width: 1240px; margin: 0 auto; width: 100%; min-height: 90vh; display: flex; flex-direction: column;}\n    .content-wrap { flex: 1; }\n    input, select, button, textarea { font-family: inherit; outline: none; font-size: 14px; }\n    \n    /* 现代化 Element 纯白卡片 */\n    .card { background: rgba(255, 255, 255, 0.88); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); padding: 22px 24px; border-radius: var(--radius-card); box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); margin-bottom: 20px; border: 1px solid var(--border); transition: all 0.25s ease; } body.dark .card { background: rgba(31, 31, 31, 0.88); }\n    \n    #toast { position: fixed; top: -60px; left: 50%; transform: translateX(-50%); background: #303133; color: white; padding: 10px 24px; border-radius: 6px; font-size: 13px; font-weight: 500; transition: top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center; max-width: 90vw; word-wrap: break-word; }\n    #toast.show { top: 20px; }\n\n    .toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }\n    .btn-submit { padding: 9px 18px; background: var(--primary); color: white; border: none; border-radius: var(--radius-btn); cursor: pointer; font-weight: 500; white-space: nowrap; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); font-size: 13px; }\n    .btn-submit:hover { background: var(--primary-hover); opacity: 0.95; transform: translateY(-1px); }\n    .btn-submit:active { transform: translateY(0); }\n    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }\n    \n    .table-wrapper { width: 100%; border-radius: var(--radius-card); border: 1px solid var(--border); overflow: hidden; background: var(--card); }\n    table { width: 100%; border-collapse: collapse; text-align: left; }\n    th, td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; }\n    th { color: var(--text-sec); font-weight: 600; background: rgba(0,0,0,0.02); }\n    tr:last-child td { border-bottom: none; }\n    tr:hover td { background-color: rgba(0,0,0,0.02); }\n    \n    .action-group { display: inline-flex; gap: 6px; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); align-items: center; }\n    .icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; border: 1px solid var(--border); background: var(--card); cursor: pointer; color: var(--text); padding: 0; transition: 0.2s; font-size: 15px; }\n    .icon-btn:hover { color: var(--primary); border-color: var(--primary); }\n    .icon-btn svg { width: 14px; height: 14px; fill: currentColor; }\n    \n    .badge { padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: inline-block; }\n    \n    .btn-edit { padding: 6px 12px; background: var(--card); color: var(--primary); border: 1px solid var(--primary); border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; transition: 0.2s; }\n    .btn-edit:hover { background: var(--primary); color: white; }\n    .btn-del { padding: 6px 12px; background: var(--card); color: var(--danger); border: 1px solid var(--danger); border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; transition: 0.2s; }\n    .btn-del:hover { background: var(--danger); color: white; }\n    .btn-dns { padding: 6px 12px; background: var(--card); color: var(--success); border: 1px solid var(--success); border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; transition: 0.2s; white-space: nowrap; }\n    .btn-dns:hover { background: var(--success); color: white; }\n    .btn-dns:disabled { opacity: 0.5; cursor: not-allowed; }\n\n    .ip-checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary); }\n    .secret-text { font-family: monospace; letter-spacing: 1px; color: var(--text-sec); }\n    \n    .dynamic-url { display: block; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; text-align: right; }\n    .actual-text.dynamic-url { white-space: normal; max-width: 100%; overflow: visible; text-align: left !important; word-break: break-all; font-size: 12px; font-family: monospace; color: var(--primary); }\n    .url-list-item { background: rgba(0,0,0,0.02); border: 1px solid var(--border); padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-top: 4px; word-break: break-all; line-height: 1.4; color: var(--text); font-family: monospace; text-align: left; }\n    .url-list-item:first-child { margin-top: 0; }\n\n    body.dark input, body.dark select, body.dark textarea { background: #1f1f1f; color: #e5eaf3; border: 1px solid #363637; }\n\n    .search-input { padding: 8px 14px; border: 1px solid var(--border); border-radius: var(--radius-btn); background: var(--bg); color: var(--text); font-size: 13px; width: 240px; transition: 0.25s; }\n    .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-light); }\n\n    .node-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; margin-top: 18px; }\n    .emby-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-card); padding: 18px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 12px; transition: all 0.25s ease; position: relative; }\n    .emby-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.08); transform: translateY(-1px); border-color: var(--primary); }\n    .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px; }\n    .card-title-group { display: flex; align-items: center; gap: 10px; }\n    .emby-icon { font-size: 24px; background: var(--primary-light); border-radius: 6px; padding: 4px; border: 1px solid rgba(64, 158, 255, 0.15); display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; flex-shrink: 0; }\n    .info-row { display: flex; align-items: flex-start; justify-content: space-between; font-size: 13px; }\n    .info-label { color: var(--text-sec); font-weight: 500; min-width: 65px; }\n    .card-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px dashed var(--border); }\n\n    .ping-badge { color: var(--text-sec); cursor: pointer; padding: 3px 8px; background: rgba(0,0,0,0.03); border-radius: 4px; font-size: 12px; font-weight: 500; transition: 0.2s; border: 1px solid var(--border); user-select: none; }\n    .ping-badge:hover { border-color: var(--primary); color: var(--primary); }\n\n    .icon-item { cursor: pointer; padding: 6px; border-radius: 6px; border: 1px solid transparent; display: flex; justify-content: center; align-items: center; transition: 0.2s; background: var(--bg); height: 40px; }\n    .icon-item:hover { border-color: var(--primary) !important; transform: scale(1.05); }\n    #iconGrid::-webkit-scrollbar { width: 4px; }\n    #iconGrid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }\n\n    /* 拖拽排序样式 */\n    .emby-card.sortable-ghost { opacity: 0.4; }\n    .emby-card.sortable-drag { cursor: grabbing !important; }\n    .drag-handle { cursor: grab; padding-right: 8px; font-size: 16px; color: var(--text-sec); display: flex; align-items: center; user-select: none; touch-action: none;}\n    .drag-handle:active { cursor: grabbing; color: var(--primary); }\n\n    /* 响应式移动端深度重构 */\n    @media (max-width: 768px) {\n        body { padding: 10px 10px calc(80px + env(safe-area-inset-bottom, 20px)) !important; }\n        .container { padding-top: 2px; }\n        .card { padding: 14px; border-radius: 8px; margin-bottom: 12px; }\n        .header { flex-direction: column; align-items: stretch !important; gap: 12px !important; margin-bottom: 14px !important; }\n        .header h1 { font-size: 18px !important; }\n        .header-actions { display: grid !important; grid-template-columns: 1fr 1fr; gap: 6px !important; width: 100%; }\n        .header-actions > * { width: 100% !important; justify-content: center !important; font-size: 12px !important; padding: 8px 6px !important; }\n        .search-input { width: 100%; }\n        .toolbar { flex-direction: column; align-items: stretch; gap: 8px; }\n        .toolbar > * { width: 100%; }\n        .node-grid { grid-template-columns: 1fr; gap: 12px; margin-top: 12px; }\n        .card-footer > button { flex: 1; text-align: center; justify-content: center; padding: 7px 0; }\n        .table-wrapper { border: none; background: transparent; overflow: visible; }\n        table, thead, tbody, th, td, tr { display: block; width: 100%; }\n        thead { display: none; }\n        tr { margin-bottom: 12px; background: var(--card); border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.03); overflow: hidden; }\n        td { display: flex; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--border); text-align: right; gap: 8px; min-height: 42px; font-size: 12px; }\n        td:last-child { border-bottom: none; }\n        td::before { content: attr(data-label); font-weight: 600; color: var(--text-sec); flex-shrink: 0; margin-right: auto; text-align: left; }\n        #dashboardModal { padding: 6px !important; }\n        #dashboardModal .card { margin: 8px auto !important; padding: 14px 10px !important; }\n    }\n";

const HOME_UI = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="referrer" content="no-referrer">
  <title>流光 · EMBY反代雅集</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    /* ===== 全局重置 & 宣纸底色 ===== */
    * { margin: 0; padding: 0; box-sizing: border-box; touch-action: manipulation; }
    body {
    font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
    background-color: transparent !important;
    color: #3d3a36;
      min-height: 100vh;
      line-height: 1.9;
      padding: 0 16px 80px;
      transition: background-color 0.35s ease, color 0.35s ease;
    }

    /* ===== 玄青墨砚暗色调优 (Dark Mode) ===== */
    body.dark {
      background-color: #141517;
      background-image: 
        radial-gradient(ellipse at 20% 50%, rgba(197, 160, 89, 0.04) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 50%, rgba(192, 57, 43, 0.03) 0%, transparent 60%);
      color: #e2ded9;
    }

    /* ===== 滚动条 ===== */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #f0ebe5; }
    ::-webkit-scrollbar-thumb { background: #c0392b; border-radius: 4px; }
    body.dark ::-webkit-scrollbar-track { background: #1c1e22; }
    body.dark ::-webkit-scrollbar-thumb { background: #8a2a20; }

    /* ===== 🖥️ 电脑大屏画卷视界约束 (2K/4K 黄金居中) ===== */
    .container {
      max-width: 1020px;
      margin: 0 auto;
      padding: 32px 12px 60px;
    }

    /* ===== 页眉 ===== */
    header {
      text-align: center;
      padding: 16px 0 24px;
      border-bottom: 1px solid rgba(192, 57, 43, 0.12);
      position: relative;
    }
    body.dark header { border-bottom-color: rgba(197, 160, 89, 0.12); }
    header::after {
      content: "● 雅集";
      position: absolute;
      right: 6px;
      bottom: -11px;
      font-size: 11px;
      color: #c0392b;
      opacity: 0.45;
      font-weight: 300;
      letter-spacing: 3px;
      background: #f6f3ef;
      padding: 1px 12px;
      border-radius: 20px;
      border: 1px solid rgba(192, 57, 43, 0.1);
    }
    body.dark header::after {
      background: #141517;
      color: #c5a059;
      border-color: rgba(197, 160, 89, 0.15);
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .logo h1 {
      font-weight: 300;
      font-size: 2.4rem;
      letter-spacing: 12px;
      color: #2c2a27;
      margin: 0;
    }
    body.dark .logo h1 { color: #f0ece6; }
    .logo h1 span {
      font-weight: 600;
      color: #c0392b;
      letter-spacing: 2px;
    }
    body.dark .logo h1 span { color: #d94f3d; }
    /* 朱砂印 */
    .seal {
      display: inline-block;
      border: 2px solid #c0392b;
      color: #c0392b;
      font-size: 12px;
      font-weight: 400;
      padding: 1px 9px 1px 11px;
      border-radius: 40% 20% 40% 20% / 30% 40% 30% 40%;
      transform: rotate(-4deg);
      letter-spacing: 2px;
      opacity: 0.85;
      font-family: 'Noto Serif SC', serif;
      background: rgba(192, 57, 43, 0.04);
      user-select: none;
    }
    body.dark .seal {
      border-color: #c5a059;
      color: #c5a059;
      background: rgba(197, 160, 89, 0.08);
    }
    .subtitle {
      margin-top: 10px;
      font-size: 0.9rem;
      color: #8a827a;
      font-weight: 300;
      letter-spacing: 5px;
      font-style: italic;
    }
    body.dark .subtitle { color: #9c958d; }
    .subtitle::before { content: "—— "; color: #c0392b; opacity: 0.35; }
    .subtitle::after { content: " ——"; color: #c0392b; opacity: 0.35; }

    /* ===== 按钮组 ===== */
    .action-group {
      display: flex;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
      margin: 26px 0 16px;
    }
    .btn {
      font-family: 'Noto Serif SC', serif;
      background: transparent;
      border: 1px solid #c9bdb2;
      color: #4a443e;
      padding: 9px 24px;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 3px;
      border-radius: 3px;
      position: relative;
      background: rgba(255, 252, 248, 0.6);
      backdrop-filter: blur(4px);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    body.dark .btn {
      border-color: #3e4249;
      color: #d8d3cd;
      background: rgba(30, 32, 36, 0.7);
    }
    .btn:hover {
      background: #c0392b;
      color: #f6f3ef !important;
      border-color: #c0392b;
      box-shadow: 0 4px 18px rgba(192, 57, 43, 0.2);
      transform: translateY(-1px);
    }
    body.dark .btn:hover {
      background: #a93226;
      border-color: #a93226;
    }
    .btn-primary {
      background: #c0392b;
      color: #f6f3ef;
      border-color: #c0392b;
      padding: 10px 32px;
      font-size: 0.92rem;
      letter-spacing: 5px;
      box-shadow: 0 2px 16px rgba(192, 57, 43, 0.18);
    }
    .btn-primary:hover {
      background: #a93226;
      border-color: #a93226;
      box-shadow: 0 6px 24px rgba(192, 57, 43, 0.28);
      transform: translateY(-2px);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    /* ===== 分割线 ===== */
    .divider {
      display: flex;
      align-items: center;
      margin: 36px 0 26px;
      color: #b5aaa0;
      font-size: 0.82rem;
      letter-spacing: 8px;
      font-weight: 300;
    }
    body.dark .divider { color: #6e675f; }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba(192, 57, 43, 0.08);
    }
    body.dark .divider::before,
    body.dark .divider::after {
      border-bottom-color: rgba(197, 160, 89, 0.08);
    }
    .divider::before { margin-right: 18px; }
    .divider::after { margin-left: 18px; }

    /* ===== 节点网格 ===== */
    .nodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }
    .source-card {
      border: 1px solid rgba(192, 57, 43, 0.09);
      padding: 18px 16px 14px;
      background: rgba(255, 252, 248, 0.52); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      gap: 11px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.02);
    }
    body.dark .source-card {
      background: rgba(24, 26, 29, 0.8);
      border-color: rgba(197, 160, 89, 0.12);
      box-shadow: 0 2px 10px rgba(0,0,0,0.25);
    }
    .source-card:hover {
      border-color: rgba(192, 57, 43, 0.35);
      background: rgba(255, 252, 248, 0.95);
      box-shadow: 0 6px 24px rgba(192, 57, 43, 0.08);
      transform: translateY(-2px);
    }
    body.dark .source-card:hover {
      background: rgba(30, 33, 37, 0.95);
      border-color: rgba(197, 160, 89, 0.28);
      box-shadow: 0 6px 24px rgba(0,0,0,0.4);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .card-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
    }
    .card-icon {
      font-size: 20px;
      flex-shrink: 0 !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      min-width: 26px;
      min-height: 26px;
      line-height: 1;
    }
    .card-icon img {
      width: 24px !important;
      height: 24px !important;
      min-width: 24px !important;
      min-height: 24px !important;
      border-radius: 4px;
      object-fit: contain;
      flex-shrink: 0 !important;
      display: block;
    }
    .card-title {
      font-size: 0.94rem;
      font-weight: 600;
      letter-spacing: 1px;
      color: #2c2a27;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    body.dark .card-title { color: #f0ece6; }
    
    /* 🎴 测速印章国风四色阶基础样式 */
    .seal-badge {
      font-family: 'Noto Serif SC', monospace, serif;
      font-size: 11px;
      padding: 2px 9px;
      border-radius: 12px;
      border: 1px solid rgba(192, 57, 43, 0.25);
      color: #c0392b;
      background: rgba(192, 57, 43, 0.05);
      cursor: pointer;
      user-select: none;
      transition: all 0.25s ease;
      white-space: nowrap;
      letter-spacing: 0.5px;
    }
    .seal-badge:hover {
      opacity: 0.85;
      transform: scale(1.04);
    }

    /* 📜 节点链接框的“墨纹宣纸签条”微质感 */
    .node-url-box {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      background: rgba(255, 255, 255, 0.42); backdrop-filter: blur(8px);
      padding: 8px 10px;
      border-radius: 2px;
      border: 1px dashed rgba(192, 57, 43, 0.15);
      color: #5c554e;
      word-break: break-all;
      line-height: 1.45;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
      letter-spacing: 0.2px;
    }
    body.dark .node-url-box {
      color: #b5aaa0;
      background: rgba(15, 17, 19, 0.7);
      border-color: rgba(197, 160, 89, 0.15);
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
    }

    .card-actions {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }
    .card-actions .btn {
      flex: 1;
      padding: 7px 10px;
      font-size: 0.82rem;
      letter-spacing: 2px;
      border-color: #d5cbc1;
    }
    body.dark .card-actions .btn { border-color: #434852; }
    
    /* 📋 拓印按钮即时墨韵微动效 */
    .btn-copy {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-copy.copied {
      background: #2e7d32 !important;
      color: #ffffff !important;
      border-color: #2e7d32 !important;
      transform: scale(0.97);
      box-shadow: 0 2px 10px rgba(46, 125, 50, 0.25);
    }

    /* ===== Toast 提示 ===== */
    #toast {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #2c2a27;
      color: #f6f3ef;
      padding: 8px 26px;
      border-radius: 20px;
      font-size: 0.84rem;
      letter-spacing: 2px;
      opacity: 0;
      transition: opacity 0.3s ease, top 0.3s ease;
      pointer-events: none;
      z-index: 1000;
      font-family: 'Noto Serif SC', serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
      border: 1px solid rgba(192, 57, 43, 0.2);
    }
    #toast.show { opacity: 1; top: 28px; }
    body.dark #toast {
      background: #1c1e22;
      border-color: rgba(197, 160, 89, 0.25);
      color: #e6e1da;
    }

    /* ===== 📱 手机移动端首屏黄金高度与紧凑排版优化 ===== */
    @media (max-width: 640px) {
      body { padding: 0 10px 60px; }
      .container { padding: 14px 4px 40px; }
      header { padding: 10px 0 16px; }
      .logo h1 { font-size: 1.85rem; letter-spacing: 8px; }
      .seal { font-size: 11px; padding: 1px 7px; }
      .subtitle { font-size: 0.78rem; letter-spacing: 3px; margin-top: 6px; }
      .action-group { gap: 8px; margin: 18px 0 12px; }
      .btn { padding: 8px 16px; font-size: 0.8rem; letter-spacing: 2px; }
      .btn-primary { padding: 9px 20px; font-size: 0.84rem; letter-spacing: 3px; }
      .divider { margin: 24px 0 18px; font-size: 0.75rem; letter-spacing: 5px; }
      .nodes-grid { grid-template-columns: 1fr; gap: 14px; }
      .source-card { padding: 14px 12px; }
    }
  \n    /* ===== 🔘 Element UI 标准开关组件 (高对比度/清晰圆形滑块) ===== */\n    .switch {\n        position: relative;\n        display: inline-block;\n        width: 50px;\n        height: 26px;\n        margin: 0;\n        vertical-align: middle;\n    }\n    .switch input {\n        opacity: 0;\n        width: 0;\n        height: 0;\n        position: absolute;\n    }\n    .slider {\n        position: absolute;\n        cursor: pointer;\n        top: 0; left: 0; right: 0; bottom: 0;\n        background-color: #dcdfe6;\n        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n        border-radius: 26px;\n        border: 1px solid #c0c4cc;\n        box-sizing: border-box;\n    }\n    .slider:before {\n        position: absolute;\n        content: "";\n        height: 20px;\n        width: 20px;\n        left: 2px;\n        bottom: 2px;\n        background-color: #ffffff;\n        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n        border-radius: 50%;\n        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);\n    }\n    input:checked + .slider {\n        background-color: #67c23a !important;\n        border-color: #529b2e !important;\n    }\n    input:checked + .slider:before {\n        transform: translateX(24px);\n        background-color: #ffffff;\n    }\n    body.dark .slider {\n        background-color: #4c4d4f;\n        border-color: #606266;\n    }\n    body.dark input:checked + .slider {\n        background-color: #67c23a !important;\n        border-color: #529b2e !important;\n    }\n\n</style>
</head>
<body>
  <div id="dynamic-bg" style="position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-2; background-size:cover; background-position:center center; background-repeat:no-repeat; transition:opacity 0.5s ease, background-image 0.4s ease; opacity:0.95; pointer-events:none;"></div>
  <div id="bg-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-1; pointer-events:none; background:rgba(0,0,0,0.03); backdrop-filter:blur(0px); -webkit-backdrop-filter:blur(0px); transition:all 0.3s;"></div>
  <div id="toast">已收入囊中</div>

  <div class="container">
    <!-- ===== 页眉 ===== -->
    <header>
      <div class="logo">
        <h1>流<span>光</span></h1>
        <span class="seal">⿅ 雅集</span>
      </div>
      <div class="subtitle">影音流转，瞬息千里</div>
    </header>

    <!-- ===== 操作按钮 ===== -->
    <div class="action-group">
      <button class="btn btn-primary" onclick="autoPingAll()" id="btn-ping-all">
        <span style="font-size:1rem;margin-right:4px;">▸</span> 奏响 · 巡测诸源
      </button>
      <a href="{{CONTACT_URL}}" target="_blank" class="btn" id="btn-contact" title="联系作者" style="text-decoration:none;">
        <span style="font-size:0.9rem;margin-right:4px;">✉</span> 寄信作者
      </a>
    </div>

    <!-- ===== 分割线 ===== -->
    <div class="divider">涓 涓 细 流 · 节 点 雅 集</div>

    <!-- ===== 节点网格 ===== -->
    <div class="nodes-grid" id="nodes-container">
      {{ROUTES_HTML}}
    </div>
  </div>

    <script>
    // ===== 📋 拓印链接 =====
    function copyText(text, btn) {
      if (btn) {
        btn.classList.add('copied');
        btn.innerText = '已拓印 ✔';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerText = '拓印链接';
        }, 1500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('📋 节点链接已拓印');
        }).catch(() => {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
    }

    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('📋 节点链接已拓印');
      } catch (err) {
        alert('拓印失败，请手动长按复制');
      }
      document.body.removeChild(ta);
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.classList.add('show');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    
    // ===== 统一测速逻辑 (与后台 /api/ping-node 核心算法完全对齐，恢复8.21经典版) =====
    async function pingNode(prefix, fullUrl) {
      const el = document.getElementById('ping-' + prefix);
      if (!el) return;
      el.innerText = '测速中...';
      el.style.opacity = '0.6';
      
      try {
        const res = await fetch('/api/ping-node?prefix=' + encodeURIComponent(prefix));
        const data = await res.json();
        if (data && data.ms >= 0) {
          el.innerText = data.ms + 'ms';
          el.style.opacity = '1';
          if (data.ms < 100) {
            el.style.color = '#27ae60';
            el.style.borderColor = 'rgba(39, 174, 96, 0.3)';
            el.style.background = 'rgba(39, 174, 96, 0.08)';
          } else if (data.ms < 300) {
            el.style.color = '#c0392b';
            el.style.borderColor = 'rgba(192, 57, 43, 0.25)';
            el.style.background = 'rgba(192, 57, 43, 0.05)';
          } else {
            el.style.color = '#d35400';
            el.style.borderColor = 'rgba(211, 84, 0, 0.3)';
            el.style.background = 'rgba(211, 84, 0, 0.08)';
          }
        } else {
          el.innerText = '断/超时';
          el.style.color = '#c0392b';
          el.style.opacity = '0.9';
        }
      } catch (e) {
        el.innerText = '测速异常';
        el.style.color = '#c0392b';
        el.style.opacity = '0.9';
      }
    }

    function autoPingAll() {
      const badges = document.querySelectorAll('.home-ping-badge');
      if (badges.length === 0) return;
      badges.forEach((b, idx) => {
        const prefix = b.getAttribute('data-prefix');
        const url = b.getAttribute('data-url');
        if (prefix) {
          setTimeout(() => { pingNode(prefix, url); }, idx * 60);
        }
      });
      showToast('🎵 正在巡测诸节点延迟...');
    }

    // ===== 🖼️ 主页自适应壁纸 =====
    const HOME_DESK_BGS = [
      'https://bing.img.run/rand_uhd.php',
      'https://api.dujin.org/bing/1920.php',
      'https://img.paulzzh.com/touhou/random',
      'https://api.ixiaowai.cn/gqapi/gqapi.php',
      'https://api.btstu.cn/sjbz/api.php?lx=fengjing&format=images',
      'https://imgapi.cn/api.php?fl=fengjing&gs=images',
      'https://api.wmdb.tv/movie/top?type=Imdb&limit=1&skip=0&lang=Cn'
    ];
    const HOME_MOBI_BGS = [
      'https://bing.img.run/rand.php',
      'https://api.btstu.cn/sjbz/api.php?lx=m_fengjing&format=images',
      'https://imgapi.cn/api.php?fl=dongman&gs=images',
      'https://api.ixiaowai.cn/api/api.php',
      'https://img.paulzzh.com/touhou/random',
      'https://api.dujin.org/bing/1080.php'
    ];

    function initHomeWallpaper() {
      const isMobile = window.innerWidth <= 768 || window.innerHeight > window.innerWidth;
      const list = isMobile ? HOME_MOBI_BGS : HOME_DESK_BGS;
      const raw = list[Math.floor(Math.random() * list.length)];
      const url = raw + (raw.includes('?') ? '&' : '?') + 't=' + Date.now();
      const bg = document.getElementById('dynamic-bg');
      if (bg) {
        bg.style.backgroundImage = 'url("' + url + '")';
      }
      fetch('/api/bg-settings').then(r => r.json()).then(d => {
        if (d && typeof d.opacity === 'number' && bg) {
          bg.style.opacity = d.opacity;
        }
      }).catch(() => {});
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark');
    }

    window.addEventListener('DOMContentLoaded', () => {
      initHomeWallpaper();
      autoPingAll();
    });
  </script>
</body>
</html>
`;
const LOGIN_UI = "\n<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover\">\n    <title>系统授权</title>\n    <style>\n        \n    :root { \n        --primary: #409eff; \n        --primary-hover: #66b1ff;\n        --primary-light: rgba(64, 158, 255, 0.1);\n        --bg: #f5f5f7; \n        --card: #ffffff; \n        --text: #1d1d1f; \n        --text-sec: #86868b;\n        --border: #d2d2d7; \n        --radius-card: 10px;\n    }\n    [data-theme=\"vermilion\"] {\n        --primary: #c0392b !important;\n        --primary-hover: #d94f3d !important;\n        --primary-light: rgba(192, 57, 43, 0.1) !important;\n    }\n    [data-theme=\"jade\"] {\n        --primary: #1e7e34 !important;\n        --primary-hover: #28a745 !important;\n        --primary-light: rgba(30, 126, 52, 0.1) !important;\n    }\n    [data-theme=\"sky\"] {\n        --primary: #2980b9 !important;\n        --primary-hover: #3498db !important;\n        --primary-light: rgba(41, 128, 185, 0.1) !important;\n    }\n    \n    body.dark {\n        --primary: #0a84ff; \n        --primary-hover: #0071e3;\n        --bg: #000000; \n        --card: #1c1c1e; \n        --text: #f5f5f7; \n        --text-sec: #98989d;\n        --border: #38383a;\n    }\n\n    * { box-sizing: border-box; touch-action: manipulation; }\n    body { font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 20px; -webkit-text-size-adjust: 100%; transition: background-color 0.3s, color 0.3s; }\n    .container { max-width: 1200px; margin: 0 auto; width: 100%; min-height: 90vh; display: flex; flex-direction: column;}\n    .content-wrap { flex: 1; }\n    input, select, button, textarea { font-family: inherit; outline: none; font-size: 15px; }\n    \n    .card { background: var(--card); padding: 24px; border-radius: var(--radius-card); box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 24px; border: 1px solid var(--border); transition: 0.3s; }\n    \n    #toast { position: fixed; top: -60px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: white; padding: 12px 24px; border-radius: 30px; font-size: 14px; font-weight: 500; transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; backdrop-filter: blur(10px); text-align: center; max-width: 90vw; word-wrap: break-word; }\n    #toast.show { top: 20px; }\n\n    .toolbar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }\n    .btn-submit { padding: 12px 20px; background: var(--primary); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: 0.2s; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2); }\n    .btn-submit:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0, 113, 227, 0.3); }\n    .btn-submit:active { transform: translateY(0); }\n    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }\n    \n    .table-wrapper { width: 100%; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; background: var(--card); }\n    table { width: 100%; border-collapse: collapse; text-align: left; }\n    th, td { padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }\n    th { color: var(--text-sec); font-weight: 600; background: rgba(120,120,120,0.05); }\n    tr:last-child td { border-bottom: none; }\n    tr:hover td { background-color: rgba(120,120,120,0.03); }\n    \n    .action-group { display: inline-flex; gap: 8px; background: rgba(120,120,120,0.05); padding: 4px 10px; border-radius: 8px; border: 1px solid var(--border); align-items: flex-start; max-width: 100%; flex-wrap: wrap; }\n    .icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: none; background: var(--card); cursor: pointer; color: var(--text); padding: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.05); transition: 0.2s; flex-shrink: 0; font-size:16px; }\n    .icon-btn:hover { color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }\n    .icon-btn svg { width: 15px; height: 15px; fill: currentColor; }\n    \n    .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }\n    \n    .btn-edit { padding: 8px 14px; background: var(--card); color: var(--primary); border: 1px solid var(--primary); border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; }\n    .btn-del { padding: 8px 14px; background: var(--card); color: #ff3b30; border: 1px solid #ff3b30; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; }\n    .btn-dns { padding: 8px 14px; background: var(--card); color: #34c759; border: 1px solid #34c759; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; white-space: nowrap; }\n    .btn-dns:disabled { opacity: 0.5; cursor: not-allowed; }\n\n    .ip-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); }\n    .secret-text { font-family: monospace; letter-spacing: 2px; color: var(--text-sec); }\n    \n    .dynamic-url { display: block; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; text-align: right; }\n    .actual-text.dynamic-url { white-space: normal; max-width: 100%; overflow: visible; text-align: left !important; word-break: break-all; font-size: 13px; font-family: monospace; color: var(--primary); letter-spacing: normal; }\n    .url-list-item { background: var(--bg); border: 1px solid var(--border); padding: 4px 8px; border-radius: 6px; font-size: 12px; margin-top: 6px; word-break: break-all; line-height: 1.4; color: var(--text); font-family: -apple-system, sans-serif; letter-spacing: normal; text-align: left; }\n    .url-list-item:first-child { margin-top: 0; }\n\n    body.dark input, body.dark select, body.dark textarea { background: #1c1c1e; color: #f5f5f7; border: 1px solid #38383a; }\n\n    .search-input { padding: 10px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); color: var(--text); font-size: 14px; width: 260px; transition: 0.3s; }\n    .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,113,227,0.15); }\n\n    .node-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; margin-top: 20px; }\n    .emby-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px; transition: 0.3s; position: relative; }\n    .emby-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }\n    .card-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border); padding-bottom: 12px; }\n    .card-title-group { display: flex; align-items: center; gap: 12px; }\n    .emby-icon { font-size: 28px; background: rgba(120,120,120,0.05); border-radius: 10px; padding: 6px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; flex-shrink: 0; }\n    .info-row { display: flex; align-items: flex-start; justify-content: space-between; font-size: 13px; }\n    .info-label { color: var(--text-sec); font-weight: 500; min-width: 65px; margin-top: 4px; }\n    .card-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: auto; padding-top: 12px; border-top: 1px dashed var(--border); }\n\n    .ping-badge { color: var(--text-sec); cursor: pointer; padding: 4px 10px; background: rgba(120,120,120,0.05); border-radius: 6px; font-size: 13px; font-weight: 500; transition: 0.2s; border: 1px solid transparent; user-select: none; }\n    .ping-badge:hover { border-color: var(--border); background: var(--card); box-shadow: 0 2px 6px rgba(0,0,0,0.05); color: var(--primary); }\n\n    .icon-item { cursor: pointer; padding: 6px; border-radius: 8px; border: 1px solid transparent; display: flex; justify-content: center; align-items: center; transition: 0.2s; background: var(--bg); height: 44px; }\n    .icon-item:hover { border-color: var(--primary) !important; box-shadow: 0 2px 8px rgba(0,113,227,0.2); transform: scale(1.05); }\n    #iconGrid::-webkit-scrollbar { width: 6px; }\n    #iconGrid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }\n\n    /* 拖拽排序核心适配样式 */\n    .emby-card.sortable-ghost { opacity: 0.4; }\n    .emby-card.sortable-drag { cursor: grabbing !important; }\n    .drag-handle { cursor: grab; padding-right: 10px; font-size: 18px; color: var(--text-sec); display: flex; align-items: center; user-select: none; touch-action: none;}\n    .drag-handle:active { cursor: grabbing; color: var(--primary); }\n\n    /* 响应式移动端适配 */\n    @media (max-width: 768px) {\n        body { padding: 12px; }\n        .card { padding: 16px; border-radius: 12px; margin-bottom: 16px; }\n        .header h1 { font-size: 22px; }\n        .toolbar { flex-direction: column; align-items: stretch; gap: 12px; }\n        .toolbar > * { width: 100%; display: flex; justify-content: center; }\n        .search-input { width: 100%; }\n        .node-grid { grid-template-columns: 1fr; }\n        .table-wrapper { border: none; background: transparent; overflow: visible; }\n        table, thead, tbody, th, td, tr { display: block; width: 100%; }\n        thead { display: none; }\n        tr { margin-bottom: 16px; background: var(--card); border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 2px 12px rgba(0,0,0,0.03); overflow: hidden; }\n        td { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border); text-align: right; gap: 12px; min-height: 50px; }\n        td:last-child { border-bottom: none; }\n        td[colspan] { justify-content: center; text-align: center; }\n        td[colspan]::before { display: none !important; }\n        td::before { content: attr(data-label); font-weight: 600; color: var(--text-sec); flex-shrink: 0; margin-right: auto; text-align: left; }\n        \n        #dashboardModal { padding: 10px !important; }\n        #dashboardModal .card { margin: 10px auto !important; padding: 16px !important; box-sizing: border-box; }\n        #dashboardModal h2 { font-size: 18px; flex-direction: column; align-items: flex-start; }\n        #dashboardModal h2 span { font-size: 12px; }\n    }\n\n        body { display: flex; justify-content: center; align-items: center; height: 100vh; padding: 16px; margin: 0; background-color: transparent !important; }\n        .login-box { background: var(--card); padding: 40px 30px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); text-align: center; width: 100%; max-width: 360px; }\n        .login-box h2 { margin: 0 0 24px 0; font-size: 22px; font-weight: 600; }\n        .login-box input { width: 100%; padding: 16px; margin-bottom: 20px; border: 1px solid var(--border); border-radius: 12px; }\n        .login-box input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,113,227,0.15); }\n        .login-box button { width: 100%; padding: 16px; background: var(--primary); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; }\n    </style>\n</head>\n<body>\n    <div id=\"dynamic-bg\" style=\"position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-2; background-size:cover; background-position:center center; background-repeat:no-repeat; transition:opacity 0.5s ease, background-image 0.4s ease; opacity:0.95; pointer-events:none;\"></div>\n    <div id=\"bg-overlay\" style=\"position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-1; pointer-events:none; background:rgba(0,0,0,0.03); backdrop-filter:blur(0px); -webkit-backdrop-filter:blur(0px); transition:all 0.3s;\"></div>\n    <div id=\"toast\"></div>\n    \n    <!-- ===== 🖼️ 自适应壁纸与透明度设置弹窗 (Element 风格) ===== -->\n    <div id=\"wallpaperModal\" style=\"display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.15); z-index:10001; overflow-y:auto; padding: 20px; backdrop-filter: none; -webkit-backdrop-filter: none;\">\n        <div class=\"card\" style=\"max-width: 520px; margin: 60px auto; position:relative; box-shadow: 0 10px 40px rgba(0,0,0,0.25); border-radius: 12px;\">\n            <button onclick=\"closeWallpaperModal()\" style=\"position:absolute; top:18px; right:18px; font-size:22px; background:none; border:none; cursor:pointer; color: var(--text-sec); transition: 0.2s;\">✖</button>\n            \n            <h3 style=\"margin-top:0; margin-bottom: 16px; font-size: 18px; display: flex; align-items: center; gap: 8px;\">\n                🖼️ 背景壁纸与透明度设置\n            </h3>\n            \n            <div style=\"background: rgba(120,120,120,0.06); padding: 12px 16px; border-radius: 8px; font-size: 13px; color: var(--text-sec); margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;\">\n                <span>📱 设备检测: <strong id=\"bgDeviceType\" style=\"color: var(--primary);\">识别中...</strong></span>\n                <button onclick=\"shuffleNextWallpaper()\" style=\"background: var(--card); border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; color: var(--text);\" title=\"换一张壁纸预览\">🎲 立即换一张</button>\n            </div>\n            \n            <div style=\"margin-bottom: 18px;\">\n                <div style=\"display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px;\">\n                    <span>壁纸透明度 (不透明度):</span>\n                    <span id=\"opacityValText\" style=\"color: var(--primary); font-family: monospace; font-size: 14px;\">22%</span>\n                </div>\n                <input type=\"range\" id=\"bgOpacitySlider\" min=\"0\" max=\"80\" value=\"22\" oninput=\"onOpacitySliderChange(this.value)\" style=\"width: 100%; cursor: pointer; accent-color: var(--primary);\">\n                <div style=\"display: flex; justify-content: space-between; font-size: 11px; color: var(--text-sec); margin-top: 4px;\">\n                    <span>0% (纯白/纯净)</span>\n                    <span>20% (推荐优雅)</span>\n                    <span>50% (高对比)</span>\n                    <span>80% (沉浸)</span>\n                </div>\n            </div>\n\n            <div style=\"margin-bottom: 22px;\">\n                <div style=\"display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px;\">\n                    <span>毛玻璃模糊度 (Blur):</span>\n                    <span id=\"blurValText\" style=\"color: var(--primary); font-family: monospace; font-size: 14px;\">0px</span>\n                </div>\n                <input type=\"range\" id=\"bgBlurSlider\" min=\"0\" max=\"20\" value=\"0\" oninput=\"onBlurSliderChange(this.value)\" style=\"width: 100%; cursor: pointer; accent-color: var(--primary);\">\n            </div>\n\n            <div style=\"display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 16px;\">\n                <button onclick=\"closeWallpaperModal()\" style=\"padding: 8px 16px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 13px; color: var(--text);\">取消</button>\n                <button onclick=\"saveBgSettingsToDb()\" id=\"btnSaveBgDb\" class=\"btn-submit\" style=\"padding: 8px 18px; font-size: 13px; border-radius: 6px;\">💾 保存设置到 D1 数据库</button>\n            </div>\n        </div>\n    </div>\n    <div class=\"login-box\">\n        <h2>安全中心</h2>\n        <input type=\"password\" id=\"tokenInput\" placeholder=\"请输入密钥 TOKEN\" onkeydown=\"if(event.key==='Enter') login()\">\n        <button onclick=\"login()\">验 证 登 录</button>\n    </div>\n    <script>\n        function showToast(msg) {\n            const t = document.getElementById('toast');\n            t.textContent = msg; t.classList.add('show');\n            setTimeout(() => t.classList.remove('show'), 2000);\n        }\n        async function login() {\n            const token = document.getElementById('tokenInput').value.trim();\n            if(!token) return showToast('请输入正确的密钥');\n            const btn = document.querySelector('.login-box button');\n            const orig = btn ? btn.textContent : '验 证 登 录';\n            if(btn) { btn.textContent = '⏳ 正在验证...'; btn.disabled = true; }\n            try {\n                const res = await fetch('/api/login', {\n                    method: 'POST',\n                    headers: { 'Content-Type': 'application/json' },\n                    body: JSON.stringify({ token: token })\n                });\n                const data = await res.json();\n                if (data && data.success) {\n                    showToast('🎉 验证成功，正在进入后台...');\n                    const sec = window.location.protocol === 'https:' ? '; Secure' : '';\n                    document.cookie = 'admin_token=' + encodeURIComponent(token) + '; path=/; max-age=2592000; SameSite=Lax' + sec;\n                    setTimeout(() => { window.location.reload(); }, 300);\n                } else {\n                    showToast('❌ ' + ((data && data.error) || '密钥错误，请核对环境变量 ADMIN_TOKEN'));\n                    if(btn) { btn.textContent = orig; btn.disabled = false; }\n                }\n            } catch(e) {\n                const sec = window.location.protocol === 'https:' ? '; Secure' : '';\n                document.cookie = 'admin_token=' + encodeURIComponent(token) + '; path=/; max-age=2592000; SameSite=Lax' + sec;\n                setTimeout(() => { window.location.reload(); }, 300);\n            }\n        }\n    </script>\n</body>\n</html>\n";

const HTML_UI = "\n<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover\">\n    <title>MakkaPakka\u7684\u53cd\u4ee3\u9762\u677f</title>\n    <style>\n    :root { \n        --primary: #409eff; \n        --primary-hover: #66b1ff;\n        --primary-light: rgba(64, 158, 255, 0.1);\n        --bg: #f5f5f7; \n        --card: #ffffff; \n        --text: #1d1d1f; \n        --text-sec: #86868b;\n        --border: #d2d2d7; \n        --radius-card: 10px;\n    }\n    [data-theme=\"vermilion\"] {\n        --primary: #c0392b !important;\n        --primary-hover: #d94f3d !important;\n        --primary-light: rgba(192, 57, 43, 0.1) !important;\n    }\n    [data-theme=\"jade\"] {\n        --primary: #1e7e34 !important;\n        --primary-hover: #28a745 !important;\n        --primary-light: rgba(30, 126, 52, 0.1) !important;\n    }\n    [data-theme=\"sky\"] {\n        --primary: #2980b9 !important;\n        --primary-hover: #3498db !important;\n        --primary-light: rgba(41, 128, 185, 0.1) !important;\n    }\n    \n    body.dark {\n        --primary: #0a84ff; \n        --primary-hover: #0071e3;\n        --bg: #000000; \n        --card: #1c1c1e; \n        --text: #f5f5f7; \n        --text-sec: #98989d;\n        --border: #38383a;\n    }\n\n    * { box-sizing: border-box; touch-action: manipulation; }\n    body { font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", Roboto, sans-serif; background-color: transparent !important; color: var(--text); margin: 0; padding: 20px; -webkit-text-size-adjust: 100%; transition: background-color 0.3s, color 0.3s; }\n    .container { max-width: 1200px; margin: 0 auto; width: 100%; min-height: 90vh; display: flex; flex-direction: column;}\n    .content-wrap { flex: 1; }\n    input, select, button, textarea { font-family: inherit; outline: none; font-size: 15px; }\n    \n    .card { background: var(--card); padding: 24px; border-radius: var(--radius-card); box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 24px; border: 1px solid var(--border); transition: 0.3s; }\n    \n    #toast { position: fixed; top: -60px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: white; padding: 12px 24px; border-radius: 30px; font-size: 14px; font-weight: 500; transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; backdrop-filter: blur(10px); text-align: center; max-width: 90vw; word-wrap: break-word; }\n    #toast.show { top: 20px; }\n\n    .toolbar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }\n    .btn-submit { padding: 12px 20px; background: var(--primary); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: 0.2s; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2); }\n    .btn-submit:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0, 113, 227, 0.3); }\n    .btn-submit:active { transform: translateY(0); }\n    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }\n    \n    .table-wrapper { width: 100%; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; background: var(--card); }\n    table { width: 100%; border-collapse: collapse; text-align: left; }\n    th, td { padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }\n    th { color: var(--text-sec); font-weight: 600; background: rgba(120,120,120,0.05); }\n    tr:last-child td { border-bottom: none; }\n    tr:hover td { background-color: rgba(120,120,120,0.03); }\n    \n    .action-group { display: inline-flex; gap: 8px; background: rgba(120,120,120,0.05); padding: 4px 10px; border-radius: 8px; border: 1px solid var(--border); align-items: flex-start; max-width: 100%; flex-wrap: wrap; }\n    .icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: none; background: var(--card); cursor: pointer; color: var(--text); padding: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.05); transition: 0.2s; flex-shrink: 0; font-size:16px; }\n    .icon-btn:hover { color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }\n    .icon-btn svg { width: 15px; height: 15px; fill: currentColor; }\n    \n    .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }\n    \n    .btn-edit { padding: 8px 14px; background: var(--card); color: var(--primary); border: 1px solid var(--primary); border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; }\n    .btn-del { padding: 8px 14px; background: var(--card); color: #ff3b30; border: 1px solid #ff3b30; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; }\n    .btn-dns { padding: 8px 14px; background: var(--card); color: #34c759; border: 1px solid #34c759; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; white-space: nowrap; }\n    .btn-dns:disabled { opacity: 0.5; cursor: not-allowed; }\n\n    .ip-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); }\n    .secret-text { font-family: monospace; letter-spacing: 2px; color: var(--text-sec); }\n    \n    .dynamic-url { display: block; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; text-align: right; }\n    .actual-text.dynamic-url { white-space: normal; max-width: 100%; overflow: visible; text-align: left !important; word-break: break-all; font-size: 13px; font-family: monospace; color: var(--primary); letter-spacing: normal; }\n    .url-list-item { background: transparent !important; border: 1px solid var(--border); padding: 4px 8px; border-radius: 6px; font-size: 12px; margin-top: 6px; word-break: break-all; line-height: 1.4; color: var(--text); font-family: -apple-system, sans-serif; letter-spacing: normal; text-align: left; }\n    .url-list-item:first-child { margin-top: 0; }\n\n    body.dark input, body.dark select, body.dark textarea { background: #1c1c1e; color: #f5f5f7; border: 1px solid #38383a; }\n\n    .search-input { padding: 10px 16px; border: 1px solid var(--border); border-radius: 10px; background: transparent !important; color: var(--text); font-size: 14px; width: 260px; transition: 0.3s; }\n    .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,113,227,0.15); }\n\n    .node-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; margin-top: 20px; }\n    .emby-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px; transition: 0.3s; position: relative; }\n    .emby-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }\n    .card-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border); padding-bottom: 12px; }\n    .card-title-group { display: flex; align-items: center; gap: 12px; }\n    .emby-icon { font-size: 28px; background: rgba(120,120,120,0.05); border-radius: 10px; padding: 6px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; flex-shrink: 0; }\n    .info-row { display: flex; align-items: flex-start; justify-content: space-between; font-size: 13px; }\n    .info-label { color: var(--text-sec); font-weight: 500; min-width: 65px; margin-top: 4px; }\n    .card-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: auto; padding-top: 12px; border-top: 1px dashed var(--border); }\n\n    .ping-badge { color: var(--text-sec); cursor: pointer; padding: 4px 10px; background: rgba(120,120,120,0.05); border-radius: 6px; font-size: 13px; font-weight: 500; transition: 0.2s; border: 1px solid transparent; user-select: none; }\n    .ping-badge:hover { border-color: var(--border); background: var(--card); box-shadow: 0 2px 6px rgba(0,0,0,0.05); color: var(--primary); }\n\n    .icon-item { cursor: pointer; padding: 6px; border-radius: 8px; border: 1px solid transparent; display: flex; justify-content: center; align-items: center; transition: 0.2s; background: transparent !important; height: 44px; }\n    .icon-item:hover { border-color: var(--primary) !important; box-shadow: 0 2px 8px rgba(0,113,227,0.2); transform: scale(1.05); }\n    #iconGrid::-webkit-scrollbar { width: 6px; }\n    #iconGrid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }\n\n    /* \u62d6\u62fd\u6392\u5e8f\u6838\u5fc3\u9002\u914d\u6837\u5f0f */\n    .emby-card.sortable-ghost { opacity: 0.4; }\n    .emby-card.sortable-drag { cursor: grabbing !important; }\n    .drag-handle { cursor: grab; padding-right: 10px; font-size: 18px; color: var(--text-sec); display: flex; align-items: center; user-select: none; touch-action: none;}\n    .drag-handle:active { cursor: grabbing; color: var(--primary); }\n\n    /* \u54cd\u5e94\u5f0f\u79fb\u52a8\u7aef\u9002\u914d */\n    @media (max-width: 768px) {\n        body { padding: 12px; }\n        .card { padding: 16px; border-radius: 12px; margin-bottom: 16px; }\n        .header h1 { font-size: 22px; }\n        .toolbar { flex-direction: column; align-items: stretch; gap: 12px; }\n        .toolbar > * { width: 100%; display: flex; justify-content: center; }\n        .search-input { width: 100%; }\n        .node-grid { grid-template-columns: 1fr; }\n        .table-wrapper { border: none; background: transparent; overflow: visible; }\n        table, thead, tbody, th, td, tr { display: block; width: 100%; }\n        thead { display: none; }\n        tr { margin-bottom: 16px; background: var(--card); border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 2px 12px rgba(0,0,0,0.03); overflow: hidden; }\n        td { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border); text-align: right; gap: 12px; min-height: 50px; }\n        td:last-child { border-bottom: none; }\n        td[colspan] { justify-content: center; text-align: center; }\n        td[colspan]::before { display: none !important; }\n        td::before { content: attr(data-label); font-weight: 600; color: var(--text-sec); flex-shrink: 0; margin-right: auto; text-align: left; }\n        \n        #dashboardModal { padding: 10px !important; }\n        #dashboardModal .card { margin: 10px auto !important; padding: 16px !important; box-sizing: border-box; }\n        #dashboardModal h2 { font-size: 18px; flex-direction: column; align-items: flex-start; }\n        #dashboardModal h2 span { font-size: 12px; }\n    }\n\n    .emby-icon { font-size: 24px; background: var(--primary-light); border-radius: 6px; padding: 4px; border: 1px solid rgba(64, 158, 255, 0.15); display: flex !important; align-items: center; justify-content: center; width: 38px; height: 38px; min-width: 38px; min-height: 38px; flex-shrink: 0 !important; }\n    .emby-icon img { width: 28px !important; height: 28px !important; min-width: 28px !important; min-height: 28px !important; border-radius: 6px; object-fit: cover; flex-shrink: 0 !important; display: block; }\n\n    /* ===== \u9ad8\u7ea7\u901a\u900f\u900f\u5149\u6bdb\u73bb\u7483\u5361\u7247\u8d28\u611f (\u7edd\u4e0d\u906e\u6321\u58c1\u7eb8) ===== */\n    :root {\n        --card-opacity: 0.65;\n    }\n    .card {\n        background: rgba(255, 255, 255, var(--card-opacity)) !important;\n        backdrop-filter: blur(16px) saturate(180%) !important;\n        -webkit-backdrop-filter: blur(16px) saturate(180%) !important;\n        border: 1px solid rgba(255, 255, 255, 0.45) !important;\n        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08) !important;\n        border-radius: var(--radius-card);\n        padding: 22px 24px;\n        margin-bottom: 20px;\n        transition: all 0.25s ease;\n    }\n    body.dark .card {\n        background: rgba(24, 24, 28, var(--card-opacity)) !important;\n        backdrop-filter: blur(16px) saturate(180%) !important;\n        -webkit-backdrop-filter: blur(16px) saturate(180%) !important;\n        border: 1px solid rgba(255, 255, 255, 0.12) !important;\n    }\n\n    .emby-card {\n        background: rgba(255, 255, 255, 0.62) !important;\n        backdrop-filter: blur(14px) saturate(160%) !important;\n        -webkit-backdrop-filter: blur(14px) saturate(160%) !important;\n        border: 1px solid rgba(255, 255, 255, 0.5) !important;\n        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;\n    }\n    body.dark .emby-card {\n        background: rgba(32, 32, 38, 0.62) !important;\n        border: 1px solid rgba(255, 255, 255, 0.1) !important;\n    }\n\n    .table-wrapper {\n        background: rgba(255, 255, 255, 0.55) !important;\n        backdrop-filter: blur(14px) !important;\n        -webkit-backdrop-filter: blur(14px) !important;\n        border: 1px solid rgba(255, 255, 255, 0.4) !important;\n    }\n    body.dark .table-wrapper {\n        background: rgba(28, 28, 34, 0.55) !important;\n        border: 1px solid rgba(255, 255, 255, 0.1) !important;\n    }\n    \n    .target-input, .search-input {\n        background: rgba(255, 255, 255, 0.7) !important;\n        backdrop-filter: blur(8px) !important;\n    }\n    body.dark .target-input, body.dark .search-input {\n        background: rgba(30, 30, 35, 0.7) !important;\n    }\n\n    /* ===== \ud83d\udcf1 \u79fb\u52a8\u7aef\u7cbe\u7f8e\u81ea\u9002\u5e94\u6392\u7248\u6df1\u5ea6\u91cd\u6784 (Mobile First Clean UI) ===== */\n    @media (max-width: 768px) {\n        .container {\n            padding: 12px 10px !important;\n        }\n        .header {\n            flex-direction: column !important;\n            align-items: stretch !important;\n            gap: 12px !important;\n            padding: 14px 16px !important;\n            margin-bottom: 14px !important;\n        }\n        .header h1 {\n            font-size: 20px !important;\n            justify-content: space-between !important;\n            width: 100% !important;\n        }\n        .header .actions {\n            display: flex !important;\n            flex-wrap: wrap !important;\n            gap: 8px !important;\n            width: 100% !important;\n            justify-content: space-between !important;\n        }\n        .header .actions button, .header .actions a {\n            flex: 1 1 calc(50% - 6px) !important;\n            justify-content: center !important;\n            font-size: 12px !important;\n            padding: 8px 10px !important;\n            margin: 0 !important;\n            text-align: center !important;\n        }\n        .card {\n            padding: 16px 14px !important;\n            margin-bottom: 14px !important;\n            border-radius: 12px !important;\n        }\n        .card-header {\n            flex-direction: column !important;\n            align-items: flex-start !important;\n            gap: 10px !important;\n        }\n        .card-header h2 {\n            font-size: 16px !important;\n        }\n        .card-header .actions {\n            width: 100% !important;\n            display: flex !important;\n            gap: 8px !important;\n        }\n        .card-header .actions button {\n            flex: 1 !important;\n        }\n        .form-row {\n            grid-template-columns: 1fr !important;\n            gap: 10px !important;\n        }\n        .toolbar {\n            flex-direction: column !important;\n            align-items: stretch !important;\n            gap: 10px !important;\n        }\n        .toolbar select, .toolbar input, .toolbar button {\n            width: 100% !important;\n        }\n        #apiIpsCountWrapper {\n            width: 100% !important;\n            display: flex !important;\n            justify-content: space-between !important;\n        }\n        #apiIpsCountWrapper input {\n            flex: 1 !important;\n        }\n        .emby-grid {\n            grid-template-columns: 1fr !important;\n            gap: 12px !important;\n        }\n        .emby-card {\n            padding: 14px !important;\n            border-radius: 10px !important;\n        }\n        .modal-content {\n            width: 95% !important;\n            max-width: 95% !important;\n            padding: 18px 14px !important;\n            border-radius: 14px !important;\n        }\n    }\n</style>\n    <script src=\"https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js\"></script>\n    <script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>\n</head>\n<body>\n<div id=\"dynamic-bg\" style=\"position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-2; background-size:cover; background-position:center center; background-repeat:no-repeat; transition:opacity 0.5s ease, background-image 0.4s ease; opacity:0.95; pointer-events:none;\"></div>\n    <div id=\"bg-overlay\" style=\"position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-1; pointer-events:none; background:rgba(0,0,0,0.03); backdrop-filter:blur(0px); -webkit-backdrop-filter:blur(0px); transition:all 0.3s;\"></div>\n\n    <!-- ===== \ud83d\uddbc\ufe0f \u81ea\u9002\u5e94\u58c1\u7eb8\u4e0e\u900f\u660e\u5ea6\u8bbe\u7f6e\u5f39\u7a97 (Element \u98ce\u683c) ===== -->\n    <div id=\"wallpaperModal\" style=\"display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.15); z-index:10001; overflow-y:auto; padding: 20px; backdrop-filter: none; -webkit-backdrop-filter: none; box-sizing: border-box;\">\n        <div class=\"card\" style=\"max-width: 560px; margin: 40px auto; position:relative; box-shadow: 0 12px 40px rgba(0,0,0,0.25); border-radius: 12px; background: var(--card); border: 1px solid var(--border); padding: 24px;\">\n            <button onclick=\"closeWallpaperModal()\" style=\"position:absolute; top:18px; right:18px; font-size:20px; background:none; border:none; cursor:pointer; color: var(--text-sec); padding:4px 8px; line-height:1;\">\u2716</button>\n            \n            <h3 style=\"margin-top:0; margin-bottom: 16px; font-size: 18px; display: flex; align-items: center; gap: 8px; color: var(--text);\">\n                \ud83d\uddbc\ufe0f \u9ad8\u6e05\u58c1\u7eb8\u5e93\u4e0e\u89c6\u89c9\u8c03\u8282\u4e2d\u5fc3\n            </h3>\n            \n            <div style=\"background: rgba(120,120,120,0.06); padding: 12px 16px; border-radius: 8px; font-size: 13px; color: var(--text-sec); margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;\">\n                <span>\ud83d\udcf1 \u8bbe\u5907\u68c0\u6d4b: <strong id=\"bgDeviceType\" style=\"color: var(--primary);\">\u8bc6\u522b\u4e2d...</strong></span>\n                <div style=\"display: flex; gap: 6px;\">\n                    <button onclick=\"shuffleNextWallpaper()\" style=\"background: var(--primary); color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight:600;\" title=\"\u7acb\u5373\u968f\u673a\u6362\u4e0b\u4e00\u5f20\">\ud83c\udfb2 \u7acb\u5373\u6362\u4e00\u5f20</button>\n                </div>\n            </div>\n\n            <!-- \u58c1\u7eb8\u56fe\u5e93\u5206\u7c7b\u9009\u62e9 -->\n            <div style=\"margin-bottom: 18px;\">\n                <div style=\"font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text);\">\u58c1\u7eb8\u56fe\u5e93\u5206\u7c7b:</div>\n                <select id=\"bgCategorySelect\" onchange=\"onCategoryChange(this.value)\" style=\"width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 13px; cursor: pointer;\">\n                    <option value=\"all\">\ud83c\udf10 \u6781\u901f\u5168\u91cf\u7efc\u5408\u5e93 (\u7cbe\u9009\u5927\u7247)</option>\n                    <option value=\"scenery\">\ud83c\udfde\ufe0f 4K \u9707\u64bc\u81ea\u7136\u98ce\u5149 (\u96ea\u5c71/\u6e56\u6cca/\u6781\u5149)</option>\n                    <option value=\"guofeng\">\ud83c\udfef \u56fd\u98ce\u53e4\u5178\u5c71\u6c34\u96c5\u96c6 (\u5b8b\u97f5\u6c34\u58a8/\u7ea2\u5899)</option>\n                    <option value=\"cyber\">\ud83c\udf0c \u8d5b\u535a\u670b\u514b\u4e0e\u68a6\u5e7b\u661f\u7a7a (\u6df1\u7a7a\u5b87\u5b99/\u9713\u8679)</option>\n                    <option value=\"anime\">\ud83c\udfac \u9ad8\u6e05\u4e8c\u6b21\u5143\u4e0e\u52a8\u6f2b\u7cbe\u9009 (\u753b\u8d28\u901a\u900f)</option>\n                    <option value=\"bing\">\ud83c\udf0f \u5fc5\u5e94 4K \u6bcf\u65e5\u7cbe\u9009\u5b9e\u666f</option>\n                </select>\n            </div>\n\n            <!-- \ud83d\udda5\ufe0f/\ud83d\udcf1 \u5206\u7aef\u81ea\u5b9a\u4e49\u58c1\u7eb8\u94fe\u63a5 -->\n            <div style=\"margin-bottom: 18px; background: rgba(120,120,120,0.04); border: 1px solid var(--border); border-radius: 8px; padding: 14px;\">\n                <div style=\"font-size: 13px; font-weight: 700; margin-bottom: 10px; color: var(--text); display: flex; align-items: center; justify-content: space-between;\">\n                    <span>\ud83c\udfa8 \u5206\u7aef\u81ea\u5b9a\u4e49\u58c1\u7eb8 (\u652f\u6301\u76f4\u94fe / \u5916\u90e8\u968f\u673a API)</span>\n                    <span style=\"font-size: 11px; color: var(--text-sec); font-weight: normal;\">\u7559\u7a7a\u5219\u4f7f\u7528\u5185\u7f6e\u56fe\u5e93</span>\n                </div>\n                \n                <div style=\"margin-bottom: 10px;\">\n                    <div style=\"display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: var(--text-sec);\">\n                        <span>\ud83d\udda5\ufe0f \u7535\u8111\u7aef\u6a2a\u5c4f\u58c1\u7eb8:</span>\n                    </div>\n                    <input type=\"url\" id=\"customDesktopBgUrl\" placeholder=\"\u586b\u5165\u7535\u8111\u6a2a\u5c4f 4K \u76f4\u94fe (\u5982 https://.../desktop.jpg)\" oninput=\"onCustomDesktopChange(this.value)\" style=\"width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 12px;\">\n                </div>\n\n                <div>\n                    <div style=\"display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: var(--text-sec);\">\n                        <span>\ud83d\udcf1 \u624b\u673a\u7aef\u7ad6\u5c4f\u58c1\u7eb8:</span>\n                    </div>\n                    <input type=\"url\" id=\"customMobileBgUrl\" placeholder=\"\u586b\u5165\u624b\u673a\u7ad6\u5c4f\u8d85\u6e05\u76f4\u94fe (\u5982 https://.../mobile.jpg)\" oninput=\"onCustomMobileChange(this.value)\" style=\"width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 12px;\">\n                </div>\n            </div>\n            \n            <!-- \u900f\u660e\u5ea6\u8c03\u8282 -->\n            <div style=\"margin-bottom: 18px;\">\n                <div style=\"display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text);\">\n                    <span>\u58c1\u7eb8\u6e05\u6670\u5ea6 (\u4e0d\u900f\u660e\u5ea6):</span>\n                    <span id=\"opacityValText\" style=\"color: var(--primary); font-family: monospace; font-size: 15px; font-weight: 700;\">65%</span>\n                </div>\n                <input type=\"range\" id=\"bgOpacitySlider\" min=\"0\" max=\"100\" value=\"65\" oninput=\"onOpacitySliderChange(this.value)\" style=\"width: 100%; cursor: pointer; accent-color: var(--primary);\">\n                <div style=\"display: flex; justify-content: space-between; font-size: 11px; color: var(--text-sec); margin-top: 4px;\">\n                    <span>0% (\u7eaf\u8272\u6781\u7b80)</span>\n                    <span>35% (\u6d45\u6de1\u58a8\u97f5)</span>\n                    <span>65% (\u63a8\u8350\u6e05\u6670)</span>\n                    <span>100% (\u6c89\u6d78\u5927\u7247)</span>\n                </div>\n            </div>\n\n            \n            <!-- \u5361\u7247\u80cc\u666f\u677f\u900f\u5149\u5ea6\u8c03\u8282 -->\n            <div style=\"margin-bottom: 18px;\">\n                <div style=\"display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text);\">\n                    <span>\u5361\u7247\u677f\u5b50\u900f\u5149\u5ea6 (Card Transparency):</span>\n                    <span id=\"cardOpacityValText\" style=\"color: var(--primary); font-family: monospace; font-size: 15px; font-weight: 700;\">52%</span>\n                </div>\n                <input type=\"range\" id=\"cardOpacitySlider\" min=\"10\" max=\"95\" value=\"52\" oninput=\"onCardOpacitySliderChange(this.value)\" style=\"width: 100%; cursor: pointer; accent-color: var(--primary);\">\n                <div style=\"display: flex; justify-content: space-between; font-size: 11px; color: var(--text-sec); margin-top: 4px;\">\n                    <span>10% (\u6781\u5ea6\u901a\u900f)</span>\n                    <span>35% (\u8d85\u6e05\u900f\u5149)</span>\n                    <span>52% (\u63a8\u8350\u5e73\u8861)</span>\n                    <span>95% (\u539a\u5b9e\u4e0d\u900f)</span>\n                </div>\n            </div>\n\n            <!-- \u6bdb\u73bb\u7483\u6a21\u7cca\u5ea6 -->\n            <div style=\"margin-bottom: 22px;\">\n                <div style=\"display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text);\">\n                    <span>\u906e\u7f69\u6bdb\u73bb\u7483 (Blur):</span>\n                    <span id=\"blurValText\" style=\"color: var(--primary); font-family: monospace; font-size: 15px; font-weight: 700;\">0px</span>\n                </div>\n                <input type=\"range\" id=\"bgBlurSlider\" min=\"0\" max=\"25\" value=\"0\" oninput=\"onBlurSliderChange(this.value)\" style=\"width: 100%; cursor: pointer; accent-color: var(--primary);\">\n            </div>\n\n            <div style=\"display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 16px;\">\n                <button onclick=\"closeWallpaperModal()\" style=\"padding: 9px 18px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 13px; color: var(--text);\">\u53d6\u6d88</button>\n                <button onclick=\"saveBgSettingsToDb()\" id=\"btnSaveBgDb\" class=\"btn-submit\" style=\"padding: 9px 20px; font-size: 13px; border-radius: 6px;\">\ud83d\udcbe \u4fdd\u5b58\u8bbe\u7f6e\u5230 D1 \u6570\u636e\u5e93</button>\n            </div>\n        </div>\n    </div>\n\n    <div id=\"toast\"></div>\n    \n    \n    <!-- \ud83d\udee1\ufe0f \u5ba2\u6237\u7aef\u767d\u540d\u5355\u7ba1\u7406\u5f39\u7a97 -->\n    <div id=\"whitelistModal\" class=\"modal\" style=\"display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px);\">\n        <div class=\"card\" style=\"max-width:560px; margin:50px auto; max-height:85vh; overflow-y:auto; position:relative; padding:24px;\">\n            <span onclick=\"closeWhitelistModal()\" style=\"position:absolute; right:20px; top:18px; font-size:24px; cursor:pointer; color:var(--text-sec);\">&times;</span>\n            <h2 style=\"margin-top:0; display:flex; align-items:center; gap:8px;\">\ud83d\udee1\ufe0f \u5ba2\u6237\u7aef\u767d\u540d\u5355\u9632\u62a4</h2>\n            <p style=\"color:var(--text-sec); font-size:13px; line-height:1.6;\">\u5f00\u542f\u540e\uff0c\u4ec5\u5141\u8bb8\u767d\u540d\u5355\u5217\u8868\u4e2d\u7684\u5ba2\u6237\u7aef App (\u6839\u636e User-Agent) \u8fde\u63a5\u548c\u64ad\u653e\u5a92\u4f53\uff0c\u963b\u65ad\u516c\u7f51\u672a\u77e5\u626b\u63cf\u4e0e\u975e\u6cd5\u6293\u5305\u3002</p>\n            \n            \n                <div id=\"whitelistSwitchContainer\" style=\"display:flex; align-items:center; justify-content:space-between; background:var(--bg); padding:14px 18px; border-radius:12px; margin-bottom:20px; border:2px solid var(--border); transition:all 0.3s;\">\n                <div>\n                    <div style=\"display:flex; align-items:center; gap:8px; margin-bottom:4px;\">\n                        <strong style=\"font-size:15px; color:var(--text);\">白名单防护总开关</strong>\n                        <span id=\"whitelistStatusBadge\" class=\"badge\" style=\"background:#f4f4f5; color:#909399; font-size:12px; font-weight:700; padding:3px 8px; border-radius:6px; border:1px solid #dcdfe6;\">⚪ 已关闭 (允许全部)</span>\n                    </div>\n                    <div id=\"whitelistSubText\" style=\"font-size:12px; color:var(--text-sec);\">关闭时允许公网所有播放器与扫描器访问</div>\n                </div>\n                <div style=\"display:flex; align-items:center; gap:10px;\">\n                    <label class=\"switch\" title=\"点击开启或关闭白名单防护\">\n                        <input type=\"checkbox\" id=\"whitelistToggle\" onchange=\"saveWhitelistSettings()\">\n                        <span class=\"slider\"></span>\n                    </label>\n                </div>\n            </div>\n\n            <h4 style=\"margin-bottom:8px;\">\ud83c\udf1f \u7cfb\u7edf\u9884\u8bbe\u652f\u6301\u7684\u5ba2\u6237\u7aef (\u81ea\u52a8\u8bc6\u522b)</h4>\n            <div id=\"presetClientsList\" style=\"display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px;\">\n                <!-- \u9884\u8bbe\u6807\u7b7e -->\n            </div>\n\n            <h4 style=\"margin-bottom:8px;\">\u2795 \u624b\u52a8\u6dfb\u52a0\u81ea\u5b9a\u4e49\u5ba2\u6237\u7aef (User-Agent \u5173\u952e\u5b57)</h4>\n            <div style=\"display:flex; gap:10px; margin-bottom:12px;\">\n                <input type=\"text\" id=\"newCustomClientInput\" placeholder=\"\u8f93\u5165\u5ba2\u6237\u7aef\u540d\u79f0\u6216UA\u5173\u952e\u8bcd (\u5982: MyPlayer, VLC)\" style=\"flex:1; padding:8px 12px; border-radius:8px; border:1px solid var(--border); background:var(--card); color:var(--text);\">\n                <button type=\"button\" onclick=\"addCustomClient()\" style=\"background:var(--primary); color:#fff; border:none; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer;\">\u6dfb\u52a0</button>\n            </div>\n            \n            <div id=\"customClientsList\" style=\"display:flex; flex-wrap:wrap; gap:8px; min-height:40px; background:var(--bg); padding:10px; border-radius:8px; border:1px dashed var(--border);\">\n                <!-- \u81ea\u5b9a\u4e49\u6807\u7b7e -->\n            </div>\n\n            <div style=\"margin-top:20px; text-align:right;\">\n                <button type=\"button\" onclick=\"closeWhitelistModal()\" style=\"padding:8px 20px; border-radius:8px; border:1px solid var(--border); background:var(--card); color:var(--text); cursor:pointer;\">\u5173\u95ed</button>\n            </div>\n        </div>\n    </div>\n\n    <div id=\"dashboardModal\" style=\"display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:10000; overflow-y:auto; padding: 20px; backdrop-filter: blur(5px);\">\n        <div class=\"card\" style=\"max-width: 1000px; margin: 40px auto; position:relative; box-shadow: 0 10px 40px rgba(0,0,0,0.2);\">\n            <button onclick=\"closeDashboard()\" style=\"position:absolute; top:20px; right:20px; font-size:24px; background:none; border:none; cursor:pointer; color: var(--text-sec); transition: 0.2s;\" onmouseover=\"this.style.color='#ff3b30'\" onmouseout=\"this.style.color='var(--text-sec)'\">\u2716</button>\n            \n            <h2 style=\"margin-top:0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;\">\n                <div style=\"display: flex; align-items: center; gap: 10px;\">\n                    \ud83d\udcca \u6570\u636e\u5927\u5c4f <span style=\"font-size:14px; font-weight: normal; color: var(--text-sec);\">\u7cbe\u786e\u8bbf\u5ba2\u753b\u50cf\u5206\u6790</span>\n                </div>\n                <div style=\"font-size: 13px; background: rgba(0,113,227,0.1); color: var(--primary); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(0,113,227,0.2); display: flex; gap: 15px; flex-wrap: wrap;\">\n                    <span> \u4eca\u5929: <strong id=\"trafficToday\">\u52a0\u8f7d\u4e2d...</strong></span>\n                    <span>1\u5468\u5185: <strong id=\"traffic7d\">\u52a0\u8f7d\u4e2d...</strong></span>\n                    <span>1\u6708\u5185: <strong id=\"traffic30d\">\u52a0\u8f7d\u4e2d...</strong></span>\n                </div>\n            </h2>\n            \n            <div style=\"display: flex; gap: 20px; flex-wrap: wrap; margin-top:20px;\">\n                <div style=\"flex: 2; min-width: 300px; border: 1px solid var(--border); border-radius: 14px; padding: 16px; background: rgba(120,120,120,0.03);\">\n                    <canvas id=\"trendChart\"></canvas>\n                </div>\n                <div style=\"flex: 1; min-width: 300px; border: 1px solid var(--border); border-radius: 14px; padding: 16px; background: rgba(120,120,120,0.03); display: flex; justify-content: center; align-items: center;\">\n                    <canvas id=\"locationChart\"></canvas>\n                </div>\n            </div>\n            \n            <h3 style=\"margin-top: 30px; margin-bottom:16px;\">\ud83d\udd75\ufe0f \u6700\u65b0\u72ec\u7acb\u64ad\u653e\u8bb0\u5f55 <span style=\"font-size:12px; color:var(--text-sec);\">(\u4ec5\u62e6\u622a PlaybackInfo \u771f\u5b9e\u64ad\u653e)</span></h3>\n            <div class=\"table-wrapper\">\n                <table style=\"width: 100%;\">\n                    <thead><tr><th>\u8bbf\u95ee\u65f6\u95f4</th><th>\u76ee\u6807\u8282\u70b9</th><th>\u771f\u5b9e IP \u5730\u5740</th><th>\u5f52\u5c5e\u5730</th><th>\u5ba2\u6237\u7aef/\u8bbe\u5907\u6807\u8bc6 (User-Agent)</th></tr></thead>\n                    <tbody id=\"logTableBody\"><tr><td colspan=\"5\" style=\"text-align:center; padding: 30px;\">\u52a0\u8f7d\u6570\u636e\u4e2d...</td></tr></tbody>\n                </table>\n            </div>\n        </div>\n    </div>\n\n    <div class=\"container\">\n    <div id=\"updateAlert\" class=\"card\" style=\"display: none; border-left: 4px solid #34c759; background-color: rgba(52, 199, 89, 0.05); margin-top: 20px;\">\n            <div style=\"display:flex; justify-content: space-between; align-items:center; flex-wrap:wrap; gap:10px;\">\n                <div>\n                    <h3 style=\"margin:0; color: #34c759; font-size: 16px;\">\u2728 \u53d1\u73b0\u65b0\u7248\u672c\uff01</h3>\n                    <p style=\"margin: 5px 0 0 0; font-size: 13px; color: var(--text-sec);\" id=\"updateMsg\">\u5f53\u524d\u7248\u672c: v2.6.3 | \u6700\u65b0\u7248\u672c: v?.?.?</p>\n                </div>\n                <button onclick=\"doOnlineUpdate()\" id=\"onlineUpdateBtn\" style=\"background: #34c759; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2);\">\ud83d\ude80 \u4e00\u952e\u62c9\u53d6\u5e76\u5347\u7ea7</button>\n            </div>\n        </div>\n    <div id=\"cf-trace-card\" style=\"background: rgba(120,120,120,0.05); padding: 15px 20px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 20px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; font-size: 14px; gap: 15px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); margin-top: 20px;\">\n            <div style=\"display: flex; align-items: center; gap: 12px;\">\n                <div style=\"font-size: 24px;\">\ud83d\udccd</div>\n                <div>\n                    <div style=\"color:var(--text-sec); font-size: 12px; margin-bottom: 2px;\">\u8bbf\u5ba2\u5165\u53e3 (\u5730\u533a\u4e0e\u673a\u623f)</div>\n                    <div id=\"trace-entry\" style=\"font-weight:600; color:var(--text); font-family: monospace; font-size: 15px;\">\u96f7\u8fbe\u626b\u63cf\u4e2d...</div>\n                </div>\n            </div>\n            <div style=\"display: flex; align-items: center; gap: 12px;\">\n                <div style=\"font-size: 24px;\">\ud83d\ude80</div>\n                <div>\n                    <div style=\"color:var(--text-sec); font-size: 12px; margin-bottom: 2px;\">Worker \u5b9e\u9645\u843d\u5730\u673a\u623f</div>\n                    <div id=\"trace-egress\" style=\"font-weight:600; color:#34c759; font-family: monospace; font-size: 15px;\">\u96f7\u8fbe\u626b\u63cf\u4e2d...</div>\n                </div>\n            </div>\n        </div><div style=\"background: rgba(120,120,120,0.05); padding: 15px 20px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 20px; margin-top: 20px;\">\n            <div style=\"font-weight: 600; margin-bottom: 12px; font-size: 16px;\">\u2699\ufe0f Worker \u8c03\u5ea6\u6a21\u5f0f\u4e0e\u533a\u57df\u8bbe\u7f6e</div>\n            <div style=\"display: flex; gap: 10px; align-items: center; flex-wrap: wrap;\">\n                \n                <select id=\"cf-mode-select\" onchange=\"handleModeChange()\" style=\"flex: 1; min-width: 180px; padding: 10px; border-radius: 6px; border: 1px solid var(--border); background: transparent !important; color: var(--text);\">\n                    <option value='{\"mode\":\"smart\"}'>\ud83e\udd16 \u667a\u80fd\u8c03\u5ea6 (Smart Placement)</option>\n                    <option value='{\"mode\":\"off\"}'>\ud83c\udf0d \u8fb9\u7f18\u8282\u70b9 (Edge - \u9ed8\u8ba4\u79bb\u8bbf\u5ba2\u8fd1)</option>\n                    <optgroup label=\"\ud83d\udccd \u6307\u5b9a\u4e91\u5382\u5546\u7269\u7406\u673a\u623f\u843d\u5730\">\n                        <option value=\"aws\">\u2601\ufe0f AWS (\u4e9a\u9a6c\u900a\u4e91)</option>\n                        <option value=\"gcp\">\u2601\ufe0f GCP (\u8c37\u6b4c\u4e91)</option>\n                        <option value=\"azure\">\u2601\ufe0f Azure (\u5fae\u8f6f\u4e91)</option>\n                    </optgroup>\n                    <option value=\"custom\">\u270f\ufe0f \u624b\u52a8\u8f93\u5165\u533a\u57df\u4ee3\u7801...</option>\n                </select>\n\n                <select id=\"cf-region-select\" style=\"display: none; flex: 1.5; min-width: 200px; padding: 10px; border-radius: 6px; border: 1px solid var(--border); background: transparent !important; color: var(--text);\">\n                </select>\n\n                <input type=\"text\" id=\"cf-custom-input\" placeholder=\"\u8f93\u5165\u4e91\u4ee3\u7801 (\u5982 gcp:us-west1)\" style=\"display: none; flex: 1.5; min-width: 200px; padding: 10px; border-radius: 6px; border: 1px solid var(--border); background: transparent !important; color: var(--text);\">\n                \n                <button onclick=\"updatePlacement()\" style=\"background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; white-space: nowrap;\">\n                    \u63d0\u4ea4\u4fee\u6539\n                </button>\n            </div>\n            <div id=\"place-status\" style=\"margin-top: 10px; font-size: 13px; color: var(--text-sec); font-weight: 600;\">\u540e\u53f0\u5168\u81ea\u52a8\u5b89\u5168\u8c03\u5ea6\uff0c\u4e0d\u66b4\u9732\u4efb\u4f55\u79c1\u94a5</div>\n        </div>\n        <div class=\"content-wrap\">\n            <div class=\"header\" style=\"display:flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap:wrap; gap:16px;\">\n                <h1 style=\"margin: 0; font-size: 26px; display:flex; align-items:center; gap: 10px;\">\n                    \u79c1\u6709\u8c03\u5ea6\u4e0e\u53cd\u4ee3\u6838\u5fc3 <span class=\"badge\" style=\"background: rgba(64, 158, 255, 0.12); color: var(--primary); font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 8px; border: 1px solid var(--primary); font-family: monospace;\">v2.8.9 \u00b7 @robberer</span>\n                    <button id=\"themeToggle\" onclick=\"toggleDarkMode()\" style=\"background:transparent;border:none;font-size:24px;cursor:pointer;padding:0;\" title=\"\u5207\u6362\u6df1\u8272\u6a21\u5f0f\">\ud83c\udf19</button>\n                </h1>\n                <div class=\"header-actions\" style=\"display:flex; gap:8px; align-items:center; flex-wrap: wrap;\"><select id=\"themePaletteSelect\" onchange=\"changeThemePalette(this.value)\" style=\"padding: 7px 10px; border-radius: var(--radius-btn); border: 1px solid var(--border); background: var(--card); color: var(--text); font-size: 12px; font-weight: 500; cursor: pointer;\" title=\"\u5207\u6362\u56fd\u98ce/\u73b0\u4ee3\u5316\u4e3b\u9898\u8272\u76d8\"><option value=\"default\">\ud83d\udd35 \u6781\u7b80\u6570\u7801\u84dd</option><option value=\"vermilion\">\ud83d\udd34 \u6545\u5bab\u6731\u7802\u7ea2</option><option value=\"jade\">\ud83d\udfe2 \u5343\u91cc\u6c5f\u5c71\u9752\u7eff</option><option value=\"sky\">\ud83c\udf0a \u5929\u9752\u6c5d\u7a91\u84dd</option></select>\n                    <div style=\"font-size: 13px; font-weight: 600; padding: 8px 12px; border-radius: 10px; background: rgba(120,120,120,0.08); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);\" title=\"\u4f60\u7684\u8bbe\u5907\u5230\u4e91\u7aef\u8fb9\u7f18\u8282\u70b9\u7684\u771f\u5b9e\u5f80\u8fd4\u5ef6\u8fdf\">\n                        <span style=\"display:inline-block; width:8px; height:8px; border-radius:50%; background:#34c759; box-shadow: 0 0 6px #34c759; transition: 0.3s;\" id=\"rttDot\"></span>\n                        <span style=\"color: var(--text-sec);\">RTT: </span><span id=\"rttValue\" style=\"font-family: monospace; font-size: 13px;\">\u6d4b\u7b97\u4e2d</span>\n                    </div>\n                    \n                    <a href=\"/api/open-tg-webhook\" target=\"_blank\" class=\"btn-submit\" id=\"btnTriggerTg\" style=\"text-decoration: none; background: #0088cc; box-shadow: 0 4px 12px rgba(0, 136, 204, 0.25); padding: 8px 12px; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; color: white; border-radius: 10px;\" title=\"\u4e00\u952e\u5728\u65b0\u6807\u7b7e\u9875\u6253\u5f00 Telegram setWebhook \u6ce8\u518c\u9875\u9762\u5b8c\u6210\u7ed1\u5b9a\">\u26a1 \u7ed1\u5b9a TG</a>\n                    <button class=\"btn-submit\" onclick=\"openWallpaperModal()\" style=\"background: #8e44ad; box-shadow: 0 4px 12px rgba(142, 68, 173, 0.2); padding: 8px 12px; font-size: 13px; border-radius: 10px;\" title=\"\u8c03\u8282\u591a\u7aef\u81ea\u9002\u5e94\u58c1\u7eb8\u4e0e\u900f\u660e\u5ea6\">\ud83d\uddbc\ufe0f \u58c1\u7eb8</button><button class=\"btn-submit\" onclick=\"openDashboard()\" style=\"background: #34c759; box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2); padding: 8px 12px; font-size: 13px; border-radius: 10px;\">\ud83d\udcca \u6570\u636e\u5927\u5c4f</button>\n                    <button class=\"logout-btn btn-submit\" style=\"background: #ff3b30; color: white; border: none; border-radius: 10px; font-weight: 600; padding: 8px 12px; font-size: 13px; cursor: pointer;\" onclick=\"logout()\">\ud83d\udeaa \u9000\u51fa</button>\n                </div>\n            </div>\n\n            <div class=\"card\" style=\"border-left: 4px solid #ff3b30;\">\n    <div style=\"display:flex; justify-content: space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;\">\n        <h2 style=\"margin:0; font-size:18px; color: #ff3b30;\">\ud83d\ude80 \u4e00\u952e\u8986\u76d6/\u66f4\u65b0 Worker \u6838\u5fc3\u5c42\u4ee3\u7801</h2>\n    </div>\n    <div style=\"font-size: 13px; color: var(--text-sec); margin-bottom: 12px;\">\u26a0\ufe0f \u8b66\u544a\uff1a\u63d0\u4ea4\u9519\u8bef\u7684\u4ee3\u7801\u4f1a\u5bfc\u81f4\u9762\u677f\u77ac\u95f4\u5d29\u6e83\uff08500 \u9519\u8bef\uff09\u3002\u8bf7\u786e\u4fdd\u4ee3\u7801\u5df2\u5728\u672c\u5730\u6d4b\u8bd5\u901a\u8fc7\uff01</div>\n    <textarea id=\"codeArea\" rows=\"6\" placeholder=\"\u65b9\u5f0f\u4e00\uff1a\u5728\u6b64\u5904\u76f4\u63a5\u7c98\u8d34\u4fee\u6539\u597d\u7684\u6700\u65b0\u4ee3\u7801\u5168\u6587...\" style=\"width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 12px; font-family: monospace; resize: vertical; background:var(--card); font-size:12px;\"></textarea>\n    <div style=\"display: flex; gap: 10px; flex-wrap: wrap; align-items: center;\">\n        <span style=\"font-size:14px; font-weight:bold;\">\u6216 \u65b9\u5f0f\u4e8c\uff1a</span>\n        <input type=\"file\" id=\"fileInput\" accept=\".js\" style=\"font-size:14px; padding: 6px; border: 1px solid var(--border); border-radius: 6px; background:var(--bg);\">\n        <button class=\"btn-submit\" id=\"deployBtn\" onclick=\"deployWorker()\" style=\"background: #ff3b30; box-shadow: 0 4px 12px rgba(255, 59, 48, 0.2); margin-left: auto;\">\ud83d\udd25 \u7acb\u5373\u8986\u76d6\u90e8\u7f72\u5e76\u91cd\u542f\u8282\u70b9</button>\n    </div>\n</div>\n            \n            <!-- \ud83d\udee1\ufe0f \u652f\u6301\u64ad\u653e\u7684\u5ba2\u6237\u7aef\u5217\u8868\u6a2a\u6761 -->\n            <div style=\"display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:16px; background:rgba(64,158,255,0.06); padding:10px 14px; border-radius:10px; border:1px solid rgba(64,158,255,0.2);\">\n                <div style=\"font-size:13px; font-weight:700; color:var(--primary); display:flex; align-items:center; gap:6px;\">\n                    <span>\ud83d\udee1\ufe0f \u652f\u6301\u5ba2\u6237\u7aef:</span>\n                </div>\n                <div id=\"supportedClientsDisplay\" style=\"display:flex; align-items:center; flex-wrap:wrap; gap:6px;\">\n                    <span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">Infuse</span>\n                    <span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">Fileball</span>\n                    <span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">VidHub</span>\n                    <span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">Emby \u5b98\u65b9</span>\n                    <span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">SenPlayer</span>\n                    <span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">PotPlayer</span>\n                    <span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">Kodi</span>\n                    <span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">Jellyfin</span>\n                    <span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">Yamby</span>\n                </div>\n                <button type=\"button\" onclick=\"openWhitelistModal()\" style=\"margin-left:auto; background:var(--primary); color:#fff; border:none; padding:4px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;\">\u2699\ufe0f \u767d\u540d\u5355\u7ba1\u7406</button>\n            </div>\n\n        <div class=\"card\">\n                <div style=\"display:flex; justify-content: space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;\">\n                    <h2 style=\"margin:0; font-size:18px;\">\u26a1 \u4e13\u5c5e\u7ebf\u8def\u6d4b\u901f\u4e0e\u52a8\u6001 DNS \u89e3\u6790</h2>\n                </div>\n                \n                <div style=\"background: rgba(120,120,120,0.05); padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 16px;\">\n                    <div style=\"font-size: 13px; font-weight: 600; color: var(--text-sec); margin-bottom: 8px;\">\ud83d\udce1 \u5f53\u524d\u57df\u540d\u751f\u6548\u7684 DNS \u89e3\u6790\uff1a</div>\n                    <div id=\"dnsStatus\" style=\"display: flex; gap: 8px; flex-wrap: wrap;\">\n                        <span style=\"color:#888; font-size: 14px;\">\u52a0\u8f7d\u4e2d...</span>\n                    </div>\n                </div>\n\n                                <div style=\"background: rgba(120,120,120,0.05); padding: 16px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 16px;\">\n                    <div style=\"display: flex; gap: 10px; margin-bottom: 12px; align-items: center; flex-wrap: wrap;\">\n                        <span style=\"font-weight: 600; color: var(--text);\">\ud83c\udfaf \u56fa\u5b9aIP\u6bb5\u4f18\u9009 (\u4e09\u7f51\u4f18\u9009):</span>\n                        \n                        <select id=\"optModeSelect\" onchange=\"toggleOptCustomMode(this.value)\" style=\"font-weight: 600; color: var(--primary); padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); cursor: pointer;\">\n                            <option value=\"preset\">\u26a1 \u9884\u8bbe\u4e09\u7f51\u6a21\u5f0f</option>\n                            <option value=\"custom\">\ud83d\udee0\ufe0f \u81ea\u5b9a\u4e49\u4f18\u9009\u6a21\u5f0f</option>\n                        </select>\n\n                        <div id=\"optOperatorGroup\" style=\"display: flex; gap: 8px; align-items: center; background: var(--card); padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border);\">\n                            <label style=\"display:flex; align-items:center; gap:4px; font-size:14px; cursor:pointer; font-weight: 500;\">\n                                <input type=\"checkbox\" id=\"optMobile\" class=\"ip-checkbox\" checked> \u79fb\u52a8\n                            </label>\n                            <label style=\"display:flex; align-items:center; gap:4px; font-size:14px; cursor:pointer; font-weight: 500;\">\n                                <input type=\"checkbox\" id=\"optTelecom\" class=\"ip-checkbox\" checked> \u7535\u4fe1\n                            </label>\n                            <label style=\"display:flex; align-items:center; gap:4px; font-size:14px; cursor:pointer; font-weight: 500;\">\n                                <input type=\"checkbox\" id=\"optUnicom\" class=\"ip-checkbox\" checked> \u8054\u901a\n                            </label>\n                        </div>\n                        \n                        <div style=\"display: flex; gap: 6px; align-items: center;\">\n                            <select id=\"optCount\" onchange=\"onOptCountChange(this.value)\" style=\"font-weight: 600; color: var(--text); padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); cursor: pointer;\">\n                                <option value=\"10\" selected>10\u4e2a</option>\n                                <option value=\"20\">20\u4e2a</option>\n                                <option value=\"30\">30\u4e2a</option>\n                                <option value=\"40\">40\u4e2a</option>\n                                <option value=\"50\">50\u4e2a</option>\n                                <option value=\"custom\">\u270f\ufe0f \u81ea\u5b9a\u4e49\u6570\u91cf...</option>\n                            </select>\n                            <input type=\"number\" id=\"optCustomCount\" placeholder=\"\u6570\u91cf\" min=\"1\" max=\"500\" value=\"10\" style=\"display: none; width: 75px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); color:var(--text); font-weight:600; font-size: 13px;\">\n                        </div>\n                        \n                        <div style=\"display: flex; gap: 6px; align-items: center;\">\n                            <select id=\"optLatency\" onchange=\"onOptLatencyChange(this.value)\" style=\"font-weight: 600; color: var(--text); padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); cursor: pointer;\">\n                                <option value=\"100\">\u2264100ms</option>\n                                <option value=\"150\">\u2264150ms</option>\n                                <option value=\"200\">\u2264200ms</option>\n                                <option value=\"300\" selected>\u2264300ms</option>\n                                <option value=\"400\">\u2264400ms</option>\n                                <option value=\"500\">\u2264500ms</option>\n                                <option value=\"custom\">\u270f\ufe0f \u81ea\u5b9a\u4e49\u5ef6\u8fdf...</option>\n                            </select>\n                            <input type=\"number\" id=\"optCustomLatency\" placeholder=\"\u5ef6\u8fdfms\" min=\"10\" max=\"2000\" value=\"300\" style=\"display: none; width: 85px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); color:var(--text); font-weight:600; font-size: 13px;\">\n                        </div>\n                        \n                        <button class=\"btn-submit\" onclick=\"startFixedIpOptimization()\" style=\"background: #ff2d55; box-shadow: 0 4px 12px rgba(255, 45, 85, 0.2); padding: 8px 16px; font-size: 14px; margin-left: auto;\">\ud83d\ude80 \u5f00\u59cb\u56fa\u5b9aIP\u6bb5\u4f18\u9009</button>\n                    </div>\n                </div>\n\n                <div class=\"toolbar\">\n                    <select id=\"ipType\" style=\"font-weight: 600; color: var(--primary); padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background:var(--card);\">\n                        <option value=\"all\">\ud83c\udf10 \u7efc\u5408\u6df7\u5408\u6e90</option>\n                    </select>\n\n                    <button class=\"btn-submit\" id=\"btnFetchRemote\" style=\"display:none;\" onclick=\"fetchRemoteAndTest()\">\ud83c\udf0d \u63d0\u53d6\u9884\u8bbe\u6e90\u5e76\u6d4b\u901f</button>\n                    <button class=\"btn-submit\" onclick=\"batchTcpPing()\" style=\"background: #ff9500; box-shadow: 0 4px 12px rgba(255, 149, 0, 0.2);\">\ud83c\udf10 \u590d\u5236\u53bb ITDog</button>\n                    <button class=\"btn-submit\" onclick=\"clearTest()\" style=\"background: #8e8e93; box-shadow: 0 4px 12px rgba(142, 142, 147, 0.2);\">\ud83d\uddd1\ufe0f \u6e05\u7a7a\u5217\u8868</button>\n                    <button class=\"btn-submit\" onclick=\"oneClickOptimize()\" style=\"background: #5856d6; box-shadow: 0 4px 12px rgba(88, 86, 214, 0.2);\">\ud83d\ude80 \u4e00\u952e\u4e09\u7f51\u4f18\u5316</button>\n                </div>\n\n                <div style=\"background: rgba(120,120,120,0.05); padding: 16px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 16px;\">\n                    <div style=\"display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;\">\n                        <select id=\"savedCustomApis\" onchange=\"onSelectSavedApi(this.value)\" style=\"padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); background:var(--card); color:var(--text); font-weight:600; min-width: 190px;\">\n                            <option value=\"https://gh.xxooo.cf/https://raw.githubusercontent.com/hc990275/yx/refs/heads/main/cfyxip.txt\" data-id=\"\" data-name=\"@robberer\">\ud83c\udf1f @robberer (\u4e13\u5c5e)</option>\n                            <option value=\"https://cf.090227.xyz/ct?ips=\" data-id=\"\" data-name=\"CM\u4f6c\u7535\u4fe1\u4f18\u9009\" data-ips=\"100\">\u26a1 CM\u4f6c\u7535\u4fe1\u4f18\u9009</option>\n                            <option value=\"https://cf.090227.xyz/cmcc?ips=\" data-id=\"\" data-name=\"CM\u4f6c\u79fb\u52a8\u4f18\u9009\" data-ips=\"100\">\ud83d\ude84 CM\u4f6c\u79fb\u52a8\u4f18\u9009</option>\n                            <option value=\"https://cf.090227.xyz/cu?ips=\" data-id=\"\" data-name=\"CM\u4f6c\u8054\u901a\u4f18\u9009\" data-ips=\"100\">\ud83d\ude80 CM\u4f6c\u8054\u901a\u4f18\u9009</option>\n                            \n                            <option value=\"https://gh.xxooo.cf/https://raw.githubusercontent.com/hc990275/yx/refs/heads/main/cfyxip.txt\" data-id=\"\" data-name=\"v2too\u9ed8\u8ba4\u6e90\">\ud83d\udca1 v2too\u6e90</option>\n                        </select>\n                        <div id=\"apiIpsCountWrapper\" style=\"display: none; align-items: center; gap: 6px;\">\n                            <span style=\"font-size: 12px; color: var(--text-sec); font-weight: 600;\">\u6570\u91cf:</span>\n                            <input type=\"number\" id=\"apiIpsCount\" value=\"100\" min=\"1\" max=\"1000\" oninput=\"onApiIpsCountChange(this.value)\" style=\"width: 80px; padding: 10px 10px; border-radius: 10px; border: 1px solid var(--border); background:var(--card); color:var(--primary); font-weight: 700; font-family: monospace; font-size: 14px;\" title=\"\u81ea\u5b9a\u4e49\u62c9\u53d6IP\u6570\u91cf (\u9ed8\u8ba4100)\">\n                        </div>\n                        <input type=\"text\" id=\"customApiName\" placeholder=\"API \u5907\u6ce8 (\u5982: \u9999\u6e2f\u4f18\u9009\u6e90)\" style=\"width: 160px; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border); background:var(--card); color:var(--text); font-size: 13px;\">\n                        <input type=\"text\" id=\"customApiUrl\" value=\"https://gh.xxooo.cf/https://raw.githubusercontent.com/hc990275/yx/refs/heads/main/cfyxip.txt\" placeholder=\"\u586b\u5165\u81ea\u5b9a\u4e49 JSON \u6216 \u6587\u672c API \u94fe\u63a5\" style=\"flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border); background:var(--card); color:var(--text);\">\n                        <button class=\"btn-submit\" id=\"btnSaveCustomApi\" onclick=\"saveCurrentCustomApi()\" style=\"background: #5856d6; padding: 10px 14px; font-size: 13px; border-radius: 10px; color:white; border:none; cursor:pointer;\" title=\"\u5c06\u5f53\u524d API \u53ca\u5907\u6ce8\u4fdd\u5b58\u5230 D1 \u6570\u636e\u5e93\">\ud83d\udcbe \u4fdd\u5b58 API</button>\n                        <button class=\"btn-submit\" id=\"btnDeleteCustomApi\" onclick=\"deleteSelectedCustomApi()\" style=\"background: #ff3b30; padding: 10px 14px; font-size: 13px; border-radius: 10px; color:white; border:none; cursor:pointer;\" title=\"\u5220\u9664\u9009\u4e2d\u7684\u81ea\u5b9a\u4e49 API\">\ud83d\uddd1\ufe0f \u5220\u9664</button>\n                        <button class=\"btn-submit\" id=\"btnFetchCustomApi\" onclick=\"fetchCustomApiAndTest()\" style=\"background: #32ade6; box-shadow: 0 4px 12px rgba(50, 173, 230, 0.2); padding: 10px 16px;\">\ud83c\udf10 \u62c9\u53d6\u5e76\u6d4b\u901f</button>\n                    </div>\n\n                    <textarea id=\"customIps\" rows=\"2\" placeholder=\"\u5728\u6b64\u7c98\u8d34\u81ea\u5b9a\u4e49 IPv4\u3001IPv6 \u6216 \u4f18\u9009\u57df\u540d (\u652f\u6301\u6df7\u6742\u6587\u672c\uff0c\u81ea\u52a8\u63d0\u53d6)\" style=\"width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 12px; font-family: monospace; resize: vertical; background:var(--card);\"></textarea>\n                    \n                    <div style=\"display: flex; gap: 10px; flex-wrap: wrap;\">\n                        <button class=\"btn-submit\" id=\"btnTestCustom\" onclick=\"testCustomIPs()\" style=\"background: #5856d6; box-shadow: 0 4px 12px rgba(88, 86, 214, 0.2);\">\ud83e\uddea \u6d4b\u8bd5\u7c98\u8d34\u7684\u8282\u70b9</button>\n                        <button class=\"btn-submit\" id=\"btnDirectCname\" onclick=\"directSubmitCname()\" style=\"background: #af52de; box-shadow: 0 4px 12px rgba(175, 82, 222, 0.2);\">\ud83d\udd17 \u76f4\u63a8 CNAME (\u514d\u6d4b\u901f)</button>\n                        <div style=\"width: 100%; height: 1px; background: var(--border); margin: 4px 0;\"></div>\n                        <button class=\"btn-submit\" id=\"btnTop3Dns\" onclick=\"updateTop3ToDns()\" style=\"background: #ff2d55; box-shadow: 0 4px 12px rgba(255, 45, 85, 0.2);\">\ud83c\udf1f \u66f4\u65b0 TOP3 \u81f3 DNS</button>\n                        <button class=\"btn-submit\" id=\"btnAppendDns\" onclick=\"appendSelectedToDns()\" style=\"background: #007aff; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);\">\u2795 \u8ffd\u52a0\u9009\u4e2d\u8282\u70b9\u5230 DNS</button>\n                        <button class=\"btn-submit\" id=\"btnSelectedDns\" onclick=\"updateSelectedToDns()\" style=\"background: #34c759; box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2);\">\u2611\ufe0f \u63d0\u4ea4\u9009\u4e2d\u8282\u70b9\u81f3 DNS</button>\n                    </div>\n                </div>\n                \n                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;\">\n                    <div id=\"statusText\" style=\"flex: 1; min-width: 260px; line-height: 1.6; font-size: 14px; color: var(--text-sec); padding: 12px 16px; background: rgba(52, 199, 89, 0.1); border-radius: 10px; border-left: 4px solid #34c759; margin: 0;\">\n                        \ud83d\udca1 \u6d4b\u901f\u5b8c\u6210\u540e\uff0c\u53ef\u52fe\u9009\u590d\u9009\u6846\u81ea\u7531\u7ec4\u5408\uff0c\u70b9\u51fb\u3010\u63d0\u4ea4\u9009\u4e2d\u8282\u70b9\u81f3 DNS\u3011\u81ea\u52a8\u5206\u53d1\u3002\n                    </div>\n                    <div style=\"display: flex; align-items: center; gap: 8px; flex-wrap: wrap;\">\n                        <select id=\"latencySelect\" onchange=\"filterLatencyBySelect(this.value)\" style=\"font-weight: 600; color: var(--primary); padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background:var(--card); cursor: pointer; min-width: 140px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);\" title=\"\u6839\u636e\u6d4b\u901f\u5ef6\u8fdf\u81ea\u52a8\u52fe\u9009\u8282\u70b9\"><option value=\"\">\u26a1 \u5ef6\u8fdf\u7b5b\u9009...</option><option value=\"100\">\u26a1 \u2264 100ms</option><option value=\"150\">\u26a1 \u2264 150ms</option><option value=\"200\">\u26a1 \u2264 200ms</option><option value=\"300\">\u26a1 \u2264 300ms</option><option value=\"400\">\u26a1 \u2264 400ms</option><option value=\"500\">\u26a1 \u2264 500ms</option><option value=\"custom\">\u270f\ufe0f \u81ea\u5b9a\u4e49\u5ef6\u8fdf...</option></select>\n                        <input type=\"number\" id=\"customLatencyFilterInput\" placeholder=\"\u8f93\u5165\u5ef6\u8fdfms (\u5982: 180)\" min=\"1\" max=\"3000\" style=\"display: none; width: 160px; padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px; background:var(--card); color:var(--text); font-weight:600; font-size: 13px;\" oninput=\"filterCustomLatency(this.value)\">\n                    </div>\n                </div>\n\n                <div class=\"table-wrapper\">\n                    <table style=\"width: 100%;\">\n                        <thead>\n                            <tr>\n                                <th style=\"width: 40px; text-align: center;\"><input type=\"checkbox\" id=\"selectAll\" class=\"ip-checkbox\" onclick=\"toggleSelectAll()\"></th>\n                                <th>\u4e13\u5c5e\u8282\u70b9 (\u70b9\u51fb\u590d\u5236)</th>\n                                <th>\u9884\u4f30\u5ef6\u8fdf</th>\n                                <th>\u8fde\u901a\u72b6\u6001</th>\n                                <th>\u8bb0\u5f55\u7c7b\u578b/\u5f52\u5c5e\u5730</th>\n                                <th>\u5355\u8282\u70b9\u64cd\u4f5c</th>\n                            </tr>\n                        </thead>\n                        <tbody id=\"testTableBody\">\n                            <tr><td colspan=\"6\" style=\"text-align:center;color:var(--text-sec);\">\u6682\u65e0\u6570\u636e\uff0c\u8bf7\u62c9\u53d6\u8282\u70b9\u6216\u8f93\u5165\u81ea\u5b9a\u4e49 IP/\u57df\u540d \u6d4b\u8bd5</td></tr>\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n            \n            <div class=\"card\">\n                <div style=\"display:flex; justify-content: space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;\">\n                    <h2 style=\"margin:0; font-size:18px;\">\u90e8\u7f72 / \u7f16\u8f91\u53cd\u4ee3\u8282\u70b9</h2>\n                    <div>\n                        <button class=\"btn-submit\" onclick=\"exportConfig()\" style=\"background:#5856d6; padding: 8px 16px; font-size: 13px;\">\ud83d\udce6 \u5bfc\u51fa\u914d\u7f6e</button>\n                        <button class=\"btn-submit\" onclick=\"importConfig()\" style=\"background:#ff9500; padding: 8px 16px; font-size: 13px;\">\ud83d\udce5 \u5bfc\u5165\u914d\u7f6e</button>\n                    </div>\n                </div>\n                \n                <form id=\"addForm\" style=\"display: flex; flex-direction: column; gap: 16px;\">\n                    <div style=\"display: flex; gap: 12px; flex-wrap: wrap;\">\n                        <input type=\"hidden\" id=\"oldPrefix\" value=\"\">\n                        <input type=\"text\" id=\"remark\" placeholder=\"\u8282\u70b9\u5907\u6ce8 (\u5982: Misaka\u670d)\" style=\"padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background:var(--card); flex: 1;\" required>\n                        <input type=\"text\" id=\"prefix\" placeholder=\"\u77ed\u8def\u5f84\u540e\u7f00 (\u5982: misaka)\" style=\"padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background:var(--card); flex: 1;\" required>\n                        <select id=\"mode\" style=\"padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background:var(--card); flex: 1;\">\n                            <option value=\"off\">\u4fdd\u5b88 (\u62b9\u9664IP)</option>\n                            <option value=\"realip_only\">\u4e25\u683c (\u900f\u4f20IP)</option>\n                            <option value=\"dual\">\u517c\u5bb9 (\u53cc\u91cd\u900f\u4f20)</option>\n                            <option value=\"strict\">\u5f3a\u529b (\u9632403)</option>\n                        </select>\n                    </div>\n\n                    <div style=\"display: flex; gap: 12px; flex-wrap: wrap; align-items: center;\">\n                        <div style=\"position: relative; flex: 2; display: flex;\">\n                            <div style=\"display:flex; gap:10px; align-items:center; background:var(--card); padding:10px 16px; border-radius:10px; border:1px solid var(--border); flex: 1; cursor: pointer; transition:0.2s;\" onclick=\"toggleIconPicker(event)\" id=\"iconSelectBtn\">\n                                <img id=\"iconPreview\" src=\"\" style=\"width:24px;height:24px;display:none;border-radius:4px;object-fit:cover;\">\n                                <span id=\"iconDefault\" style=\"font-size:20px;line-height:1;\">\ud83c\udfac</span>\n                                <span id=\"iconSelectText\" style=\"flex:1; color: var(--text-sec); font-size:14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\">\u70b9\u51fb\u9009\u62e9\u56fe\u6807 (\u9ed8\u8ba4 \ud83c\udfac)</span>\n                                <input type=\"hidden\" id=\"iconUrl\" value=\"\">\n                            </div>\n                            \n                            <div id=\"iconPickerPanel\" style=\"display:none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 100; margin-top: 8px; flex-direction: column; gap: 10px;\">\n                                <div style=\"display: flex; gap: 8px; align-items: center; margin-bottom: 4px;\">\n                                    <input type=\"text\" id=\"customIconUrlInput\" placeholder=\"\u8f93\u5165\u81ea\u5b9a\u4e49 JSON \u56fe\u6807\u5e93\u94fe\u63a5...\" style=\"flex: 1; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; background:var(--bg); font-size: 13px; color: var(--text);\">\n                                    <button type=\"button\" onclick=\"setCustomIconLibrary()\" style=\"padding: 8px 12px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; white-space: nowrap;\">\u52a0\u8f7d</button>\n                                    <button type=\"button\" onclick=\"resetIconLibrary()\" style=\"padding: 8px 12px; background: #8e8e93; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; white-space: nowrap;\">\u9ed8\u8ba4\u5e93</button>\n                                </div>\n                                <input type=\"text\" id=\"iconSearch\" placeholder=\"\ud83d\udd0d \u641c\u7d22\u56fe\u6807\u540d\u79f0...\" style=\"padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background:var(--bg); width: 100%; font-size: 14px; color: var(--text);\" onkeyup=\"filterIcons()\">\n                                <div id=\"iconGrid\" style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 8px; overflow-y: auto; max-height: 240px; padding-right: 4px;\">\n                                    <div style=\"text-align:center; color:var(--text-sec); grid-column: 1 / -1; font-size: 13px;\">\u52a0\u8f7d\u56fe\u6807\u5e93\u4e2d...</div>\n                                </div>\n                            </div>\n                        </div>\n                        <label style=\"display:flex; align-items:center; gap:8px; font-size:14px; font-weight:500; cursor:pointer;\">\n                            <input type=\"checkbox\" id=\"nodeCache\" class=\"ip-checkbox\" checked>\n                            \u5f00\u542f\u6d77\u62a5\u53ca\u9759\u6001\u8d44\u6e90\u7f13\u5b58\n                        </label>\n                        <button type=\"submit\" id=\"submitBtn\" class=\"btn-submit\" style=\"flex: 1; padding: 14px 20px;\">\u4fdd\u5b58\u90e8\u7f72</button>\n                    </div>\n\n                    <div style=\"background: rgba(120,120,120,0.05); border: 1px solid var(--border); border-radius: 10px; padding: 16px;\">\n                        <div style=\"font-size: 14px; font-weight: 600; color: var(--text-sec); margin-bottom: 12px;\">\u670d\u52a1\u5668\u7ebf\u8def\u914d\u7f6e (\u652f\u6301\u9b54\u6539\u5206\u79bb\u7248\u63a8\u6d41\uff0c\u652f\u6301\u65e0\u9650\u6761\u5907\u7528\u7ebf\u8def)</div>\n                        <div id=\"targetInputs\" style=\"display: flex; flex-direction: column; gap: 10px;\">\n                            <input type=\"url\" class=\"target-input\" placeholder=\"\u4e3b\u7ebf\u8def\u5730\u5740 (\u5982: http://1.1.1.1:8096)\" style=\"padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;\" required oninput=\"handleTargetInputs()\">\n                            <input type=\"url\" class=\"target-input\" placeholder=\"\u5907\u7528\u7ebf\u8def 1 (\u9009\u586b\uff0c\u4e3b\u6e90\u6302\u6389\u65f6\u89e6\u53d1)\" style=\"padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;\" oninput=\"handleTargetInputs()\">\n                        </div>\n                    </div>\n                </form>\n            </div>\n\n            <div class=\"card\">\n                <div style=\"display:flex; justify-content: space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;\">\n                    <h2 style=\"margin:0; font-size:18px;\">\u5df2\u53cd\u4ee3\u7684\u5a92\u4f53\u5e93</h2>\n                    <div style=\"display: flex; gap: 10px; align-items:center; flex-wrap: wrap;\">\n                        <button class=\"btn-submit\" onclick=\"pingAllNodes()\" style=\"background:#32ade6; padding: 10px 14px; font-size: 13px;\">\u26a1 \u5168\u5c40\u6d4b\u901f</button>\n                        <button id=\"btnPurge\" class=\"btn-submit\" onclick=\"purgeCache()\" style=\"background:#ff2d55; padding: 10px 14px; font-size: 13px;\">\ud83e\uddf9 \u5237\u65b0\u5168\u7ad9\u6d77\u62a5</button>\n                        <input type=\"text\" id=\"searchNode\" class=\"search-input\" placeholder=\"\ud83d\udd0d \u641c\u7d22\u5907\u6ce8\u6216\u540e\u7f00\u67e5\u627e...\" onkeyup=\"filterNodesList()\">\n                    </div>\n                </div>\n                <div style=\"background: rgba(0, 122, 255, 0.05); padding: 12px 20px; border-radius: 12px; border: 1px dashed var(--primary); margin-bottom: 20px; margin-top: 20px; display: flex; align-items: center; gap: 15px; flex-wrap: wrap;\">\n            <label style=\"cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 6px;\">\n                <input type=\"checkbox\" id=\"selectAllNodes\" onchange=\"toggleSelectAll(this)\" style=\"width: 18px; height: 18px; accent-color: var(--primary);\"> \n                \u5168\u9009\u8282\u70b9\n            </label>\n            \n            <div style=\"width: 2px; height: 20px; background: var(--border);\"></div> <select id=\"batch-mode-select\" style=\"padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); background: transparent !important; color: var(--text); font-weight: 600;\">\n                <option value=\"\">\ud83d\udd04 \u8bfb\u53d6\u6a21\u5f0f\u4e2d...</option>\n            </select>\n\n            <button onclick=\"batchUpdateModes()\" style=\"background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,113,227,0.2);\">\n                \ud83d\ude80 \u6279\u91cf\u5e94\u7528\u6a21\u5f0f\n            </button>\n\n            <span id=\"batch-status\" style=\"font-size: 13px; font-weight: 600;\"></span>\n        </div>\n                <div id=\"list-grid\" class=\"node-grid\">\n                    <div style=\"text-align:center; color:var(--text-sec); grid-column: 1 / -1; padding: 40px;\">\u8bfb\u53d6\u6570\u636e\u4e2d...</div>\n                </div>\n            </div>\n            \n        </div>\n        \n        <div style=\"text-align: center; padding-top: 10px; padding-bottom: 20px;\">\n            <a href=\"https://t.me/MakkaPakkaOvO\" target=\"_blank\" style=\"text-decoration: none; color: var(--text); font-weight: 600; display: inline-flex; align-items: center; padding: 12px 24px; background: var(--card); border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); transition: 0.3s; font-size: 14px; border: 1px solid var(--border);\">\n                <svg viewBox=\"0 0 24 24\" style=\"width:20px;height:20px;margin-right:8px;fill:#0088cc;\"><path d=\"M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z\"/></svg>\n                \u8054\u7cfb\u4f5c\u8005 MakkaPakkaOvO\n            </a>\n            <div style=\"margin-top: 20px; font-size: 12px; color: var(--text-sec); line-height: 1.6; max-width: 600px; margin-left: auto; margin-right: auto; padding: 0 15px;\">\n                <strong>\u514d\u8d23\u58f0\u660e:</strong> \u672c\u9879\u76ee\u4ec5\u4f9b\u5b66\u4e60\u4e0e\u6280\u672f\u6d4b\u8bd5\u4f7f\u7528\uff0c\u8bf7\u9075\u5b88\u5f53\u5730\u6cd5\u5f8b\u6cd5\u89c4\u3002\u4f7f\u7528\u8005\u5bf9\u914d\u7f6e\u3001\u8f6c\u53d1\u5185\u5bb9\u4e0e\u8bbf\u95ee\u884c\u4e3a\u627f\u62c5\u5168\u90e8\u8d23\u4efb\uff0c\u5f00\u53d1\u8005\u4e0d\u5bf9\u4efb\u4f55\u76f4\u63a5\u6216\u95f4\u63a5\u635f\u5931\u8d1f\u8d23\u3002\n            </div>\n        </div>\n    </div>\n\n    <script>\n        const modeNames = { 'off': '\u4fdd\u5b88', 'realip_only': '\u4e25\u683c', 'dual': '\u517c\u5bb9', 'strict': '\u5f3a\u529b' };\n        \n        const DEFAULT_ICON_URL = 'https://emby-icon.vercel.app/TFEL-Emby.json';\n        let globalIcons = [];\n        let proxyNodesForPing = [];\n        let sortableInstance = null;\n        let trendChartInstance = null;\n        let locationChartInstance = null;\n\n        // \u8bbe\u7f6e Chart.js \u54cd\u5e94\u6697\u8272\u6a21\u5f0f\n        function updateChartColors() {\n            Chart.defaults.color = document.body.classList.contains('dark') ? '#98989d' : '#86868b';\n            Chart.defaults.borderColor = document.body.classList.contains('dark') ? '#38383a' : '#d2d2d7';\n        }\n\n        // =====================================\n        // \u6570\u636e\u5927\u5c4f\u4e0e\u7edf\u8ba1\u903b\u8f91 (\u9002\u914d\u624b\u673a\u7aef\u8868\u683c\u6392\u7248)\n        // =====================================\n        // ===== \ud83d\uddbc\ufe0f \u9ad8\u6e05\u591a\u5206\u7c7b\u58c1\u7eb8\u5f15\u64ce\u4e0e D1 \u6301\u4e45\u5316 =====\n        const WALLPAPER_POOLS = {\n            desktop: {\n                scenery: [\n                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=85'\n                ],\n                guofeng: [\n                    'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=2560&q=85'\n                ],\n                cyber: [\n                    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=85',\n                    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2560&q=85'\n                ],\n                anime: [\n                    'https://api.ixiaowai.cn/api/api.php',\n                    'https://imgapi.cn/api.php?fl=dongman&gs=images',\n                    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=2560&q=85'\n                ],\n                bing: [\n                    'https://bing.img.run/rand_uhd.php',\n                    'https://api.dujin.org/bing/1920.php',\n                    'https://imgapi.cn/api.php?fl=fengjing&gs=images'\n                ]\n            },\n            mobile: {\n                scenery: [\n                    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=85',\n                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=85',\n                    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1080&q=85'\n                ],\n                guofeng: [\n                    'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1080&q=85',\n                    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1080&q=85'\n                ],\n                cyber: [\n                    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1080&q=85',\n                    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1080&q=85'\n                ],\n                anime: [\n                    'https://imgapi.cn/api.php?fl=dongman&gs=images',\n                    'https://api.btstu.cn/sjbz/api.php?lx=dongman&format=images'\n                ],\n                bing: [\n                    'https://api.btstu.cn/sjbz/api.php?lx=m_fengjing&format=images',\n                    'https://imgapi.cn/api.php?fl=meizi&gs=images'\n                ]\n            }\n        };\n\n        let currentBgOpacity = 0.95;\n        let currentCardOpacity = 0.65;\n        let currentBgBlur = 0;\n        let currentCategory = 'all';\n        let customDesktopUrl = '';\n        let customMobileUrl = '';\n        let isMobileDevice = false;\n\n        function initAdaptiveWallpaper() {\n            isMobileDevice = window.innerWidth <= 768 || window.innerHeight > window.innerWidth;\n            const deviceLabel = document.getElementById('bgDeviceType');\n            if (deviceLabel) {\n                deviceLabel.innerText = isMobileDevice ? '\ud83d\udcf1 \u624b\u673a\u8d85\u6e05\u7ad6\u5c4f' : '\ud83d\udda5\ufe0f \u7535\u8111 4K \u6a2a\u5c4f';\n            }\n            loadBgSettingsFromDb();\n        }\n\n        function getCategoryWallpapers() {\n            const dev = isMobileDevice ? WALLPAPER_POOLS.mobile : WALLPAPER_POOLS.desktop;\n            if (currentCategory === 'all' || !dev[currentCategory]) {\n                let combined = [];\n                for (let k in dev) {\n                    combined = combined.concat(dev[k]);\n                }\n                return combined;\n            }\n            return dev[currentCategory];\n        }\n\n                function shuffleNextWallpaper() {\n            const bgEl = document.getElementById('dynamic-bg');\n            if (!bgEl) return;\n            \n            // \u4f18\u5148\u68c0\u67e5\u5f53\u524d\u8bbe\u5907\u662f\u5426\u6709\u4e13\u5c5e\u7684\u81ea\u5b9a\u4e49\u58c1\u7eb8\n            const customUrl = isMobileDevice ? customMobileUrl : customDesktopUrl;\n            if (customUrl) {\n                const separator = customUrl.includes('?') ? '&' : '?';\n                const finalUrl = customUrl.includes('rand') || customUrl.includes('api') ? (customUrl + separator + 't=' + Date.now()) : customUrl;\n                bgEl.style.backgroundImage = 'url(\"' + finalUrl + '\")';\n                return;\n            }\n            \n            const list = getCategoryWallpapers();\n            const rawUrl = list[Math.floor(Math.random() * list.length)];\n            const separator = rawUrl.includes('?') ? '&' : '?';\n            const randomUrl = rawUrl + separator + 't=' + Date.now();\n            bgEl.style.backgroundImage = 'url(\"' + randomUrl + '\")';\n        }\n\n        function onCustomDesktopChange(val) {\n            customDesktopUrl = val.trim();\n            if (!isMobileDevice) shuffleNextWallpaper();\n        }\n\n        function onCustomMobileChange(val) {\n            customMobileUrl = val.trim();\n            if (isMobileDevice) shuffleNextWallpaper();\n        }\n\n        function onCardOpacitySliderChange(val) {\n            currentCardOpacity = parseInt(val) / 100;\n            const txt = document.getElementById('cardOpacityValText');\n            if (txt) txt.innerText = val + '%';\n            document.documentElement.style.setProperty('--card-opacity', currentCardOpacity);\n        }\n\n        function onOpacitySliderChange(val) {\n            currentBgOpacity = parseInt(val) / 100;\n            const txt = document.getElementById('opacityValText');\n            if (txt) txt.innerText = val + '%';\n            const bgEl = document.getElementById('dynamic-bg');\n            if (bgEl) bgEl.style.opacity = currentBgOpacity;\n        }\n\n        function onBlurSliderChange(val) {\n            currentBgBlur = parseInt(val);\n            const txt = document.getElementById('blurValText');\n            if (txt) txt.innerText = val + 'px';\n            const overlay = document.getElementById('bg-overlay');\n            if (overlay) overlay.style.backdropFilter = 'blur(' + currentBgBlur + 'px)';\n        }\n\n        function openWallpaperModal() {\n            const modal = document.getElementById('wallpaperModal');\n            if (modal) modal.style.display = 'block';\n        }\n\n        function closeWallpaperModal() {\n            const modal = document.getElementById('wallpaperModal');\n            if (modal) modal.style.display = 'none';\n        }\n\n        async function loadBgSettingsFromDb() {\n            try {\n                const res = await fetch('/api/bg-settings');\n                const data = await res.json();\n                if (data) {\n                    if (typeof data.card_opacity === 'number') {\n                        currentCardOpacity = data.card_opacity;\n                        const cSlider = document.getElementById('cardOpacitySlider');\n                        const cTxt = document.getElementById('cardOpacityValText');\n                        if (cSlider) cSlider.value = Math.round(data.card_opacity * 100);\n                        if (cTxt) cTxt.innerText = Math.round(data.card_opacity * 100) + '%';\n                        document.documentElement.style.setProperty('--card-opacity', currentCardOpacity);\n                    }\n                    if (typeof data.opacity === 'number') {\n                        currentBgOpacity = data.opacity;\n                        const slider = document.getElementById('bgOpacitySlider');\n                        const txt = document.getElementById('opacityValText');\n                        if (slider) slider.value = Math.round(data.opacity * 100);\n                        if (txt) txt.innerText = Math.round(data.opacity * 100) + '%';\n                        const bgEl = document.getElementById('dynamic-bg');\n                        if (bgEl) bgEl.style.opacity = currentBgOpacity;\n                    }\n                    if (typeof data.blur === 'number') {\n                        currentBgBlur = data.blur;\n                        const bSlider = document.getElementById('bgBlurSlider');\n                        const bTxt = document.getElementById('blurValText');\n                        if (bSlider) bSlider.value = data.blur;\n                        if (bTxt) bTxt.innerText = data.blur + 'px';\n                        const overlay = document.getElementById('bg-overlay');\n                        if (overlay) overlay.style.backdropFilter = 'blur(' + currentBgBlur + 'px)';\n                    }\n                    if (data.category) {\n                        currentCategory = data.category;\n                        const sel = document.getElementById('bgCategorySelect');\n                        if (sel) sel.value = currentCategory;\n                    }\n                    if (data.custom_desktop_url) {\n                        customDesktopUrl = data.custom_desktop_url;\n                        const inp = document.getElementById('customDesktopBgUrl');\n                        if (inp) inp.value = customDesktopUrl;\n                    }\n                    if (data.custom_mobile_url) {\n                        customMobileUrl = data.custom_mobile_url;\n                        const inp = document.getElementById('customMobileBgUrl');\n                        if (inp) inp.value = customMobileUrl;\n                    }\n                }\n            } catch (e) {\n                console.error('\u52a0\u8f7d\u80cc\u666f\u8bbe\u7f6e\u5931\u8d25', e);\n            }\n            shuffleNextWallpaper();\n        }\n\n        async function saveBgSettingsToDb() {\n            const btn = document.getElementById('btnSaveBgDb');\n            if (btn) btn.disabled = true;\n            try {\n                const res = await fetch('/api/bg-settings', {\n                    method: 'POST',\n                    headers: { 'Content-Type': 'application/json' },\n                    body: JSON.stringify({\n                        opacity: currentBgOpacity,\n                        card_opacity: currentCardOpacity,\n                        blur: currentBgBlur,\n                        category: currentCategory,\n                        custom_desktop_url: customDesktopUrl,\n                        custom_mobile_url: customMobileUrl\n                    })\n                });\n                const data = await res.json();\n                if (data && data.success) {\n                    showToast('\u2714 \u9ad8\u6e05\u58c1\u7eb8\u4e0e\u900f\u660e\u5ea6\u8bbe\u7f6e\u5df2\u4fdd\u5b58\u5230 D1 \u6570\u636e\u5e93');\n                    closeWallpaperModal();\n                } else {\n                    showToast('\u274c \u4fdd\u5b58\u5931\u8d25: ' + (data.error || '\u672a\u77e5\u9519\u8bef'));\n                }\n            } catch (e) {\n                showToast('\u274c \u4fdd\u5b58\u5931\u8d25: ' + e.message);\n            } finally {\n                if (btn) btn.disabled = false;\n            }\n        }\n\n        const COUNTRY_NAME_MAP = {\n            'CN': '\u4e2d\u56fd\u5927\u9646', 'HK': '\u4e2d\u56fd\u9999\u6e2f', 'TW': '\u4e2d\u56fd\u53f0\u6e7e', 'MO': '\u4e2d\u56fd\u6fb3\u95e8',\n            'US': '\u7f8e\u56fd', 'JP': '\u65e5\u672c', 'SG': '\u65b0\u52a0\u5761', 'KR': '\u97e9\u56fd',\n            'GB': '\u82f1\u56fd', 'DE': '\u5fb7\u56fd', 'CA': '\u52a0\u62ff\u5927', 'AU': '\u6fb3\u5927\u5229\u4e9a',\n            'RU': '\u4fc4\u7f57\u65af', 'FR': '\u6cd5\u56fd', 'MY': '\u9a6c\u6765\u897f\u4e9a', 'NL': '\u8377\u5170',\n            'IN': '\u5370\u5ea6', 'VN': '\u8d8a\u5357', 'TH': '\u6cf0\u56fd', 'PH': '\u83f2\u5f8b\u5bbe'\n        };\n        function formatCountryName(c) {\n            if (!c || c === 'Unknown' || c === '\u672a\u77e5' || c === 'XX') return '\u4e2d\u56fd\u5927\u9646';\n            if (c.includes('\u00b7') || c.includes('\u7701') || c.includes('\u5e02') || c.includes('\u56fd') || c.includes('\u5c40\u57df\u7f51')) return c;\n            return COUNTRY_NAME_MAP[c.toUpperCase()] || c;\n        }\n\n        // ===== \ud83c\udf10 \u524d\u7aef\u9ad8\u7cbe\u5ea6 IP138/\u7eaf\u771f/\u591a\u6e90\u7701\u5e02\u8fd0\u8425\u5546\u89e3\u6790\u7f13\u5b58\u6c60 =====\n        const IP_LOCATION_CACHE = {};\n\n        async function fetchHighAccuracyLocation(ip) {\n            if (!ip || ip === 'Unknown' || ip === '\u672a\u77e5' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {\n                return '\u672c\u5730\u5c40\u57df\u7f51';\n            }\n            if (IP_LOCATION_CACHE[ip]) return IP_LOCATION_CACHE[ip];\n\n            try {\n                // 1. \u5c1d\u8bd5\u8c03\u7528\u592a\u5e73\u6d0b\u56fd\u5185\u6781\u901f\u9ad8\u7cbe\u5ea6 IP \u67e5\u8be2 (\u514d Key\u3001\u6781\u901f\u8fd4\u56de\u7701\u5e02\u533a\u53bf\u4e0e\u8fd0\u8425\u5546)\n                const res = await fetch('https://whois.pconline.com.cn/ipJson.jsp?ip=' + encodeURIComponent(ip) + '&json=true', { mode: 'cors' });\n                if (res.ok) {\n                    const data = await res.json();\n                    if (data && (data.pro || data.city || data.addr)) {\n                        let loc = (data.pro || '') + (data.city && data.city !== data.pro ? data.city : '');\n                        let isp = data.addr ? data.addr.replace(loc, '').trim() : '';\n                        if (!isp && data.regionNames) isp = data.regionNames;\n                        let finalStr = (loc || '\u56fd\u5185') + (isp ? ' \u00b7 ' + isp : '');\n                        IP_LOCATION_CACHE[ip] = finalStr;\n                        return finalStr;\n                    }\n                }\n            } catch (e) { }\n\n            // 2. \u5907\u7528\u6e90: ip-api.com\n            try {\n                const res2 = await fetch('https://ip-api.com/json/' + encodeURIComponent(ip) + '?lang=zh-CN');\n                if (res2.ok) {\n                    const d2 = await res2.json();\n                    if (d2.status === 'success') {\n                        let loc = (d2.regionName || '') + (d2.city && d2.city !== d2.regionName ? d2.city : '');\n                        let isp = d2.isp ? d2.isp.split(' ')[0] : '';\n                        let finalStr = (loc || d2.country) + (isp ? ' \u00b7 ' + isp : '');\n                        IP_LOCATION_CACHE[ip] = finalStr;\n                        return finalStr;\n                    }\n                }\n            } catch(e) { }\n\n            return '\u4e2d\u56fd\u5927\u9646';\n        }\n\n        function getActiveApiSourceName() {\n            const select = document.getElementById('savedCustomApis');\n            if (!select) return '\ud83c\udf1f \u4f18\u9009\u6e90';\n            const selectedOpt = select.options[select.selectedIndex];\n            if (!selectedOpt) return '\ud83c\udf1f \u4f18\u9009\u6e90';\n            const name = selectedOpt.getAttribute('data-name');\n            return name ? name : selectedOpt.textContent.trim().split(' ')[1] || '\u4f18\u9009\u6e90';\n        }\n\n        // ==========================================\n        // \ud83d\udee1\ufe0f \u5ba2\u6237\u7aef\u767d\u540d\u5355\u7ba1\u7406\u7cfb\u7edf (\u52a0\u8f7d\u3001\u6dfb\u52a0\u3001\u5220\u9664\u3001\u540c\u6b65\u5c55\u793a)\n        // ==========================================\n        let currentWhitelistState = { enabled: false, presets: ['Infuse', 'Fileball', 'VidHub', 'Emby', 'SenPlayer', 'PotPlayer', 'Kodi', 'Jellyfin', 'Yamby', 'Forward', 'AfuseKt'], customs: [] };\n\n        async function loadWhitelistSettings() {\n            try {\n                const res = await fetch('/api/whitelist');\n                const data = await res.json();\n                if (data && data.success) {\n                    currentWhitelistState = data;\n                    renderWhitelistUI();\n                }\n            } catch(e) {}\n        }\n\n        function renderWhitelistUI() {\n            const isEnabled = !!currentWhitelistState.enabled;\n            const toggle = document.getElementById('whitelistToggle');\n            if (toggle) toggle.checked = isEnabled;\n\n            const badge = document.getElementById('whitelistStatusBadge');\n            const container = document.getElementById('whitelistSwitchContainer');\n            const subText = document.getElementById('whitelistSubText');\n\n            if (badge && container && subText) {\n                if (isEnabled) {\n                    badge.style.cssText = 'background:#e1f3d8; color:#67c23a; font-size:12px; font-weight:700; padding:3px 8px; border-radius:6px; border:1px solid #b3e19d; box-shadow:0 2px 6px rgba(103,194,58,0.2);';\n                    badge.innerHTML = '🟢 强效防护中';\n                    container.style.borderColor = '#67c23a';\n                    container.style.background = 'rgba(103, 194, 58, 0.08)';\n                    subText.innerHTML = '<span style=\\\"color:#67c23a; font-weight:600;\">仅允许列表中的客户端连接，未授权设备与爬虫全量阻断</span>';\n                } else {\n                    badge.style.cssText = 'background:#f4f4f5; color:#909399; font-size:12px; font-weight:700; padding:3px 8px; border-radius:6px; border:1px solid #dcdfe6;';\n                    badge.innerHTML = '⚪ 已关闭 (允许全部)';\n                    container.style.borderColor = 'var(--border)';\n                    container.style.background = 'var(--bg)';\n                    subText.innerHTML = '关闭时允许公网所有播放器与扫描器直连';\n                }\n            }\n\n            const presetDiv = document.getElementById('presetClientsList');\n            if (presetDiv) {\n                presetDiv.innerHTML = '';\n                (currentWhitelistState.presets || []).forEach(p => {\n                    const span = document.createElement('span');\n                    span.className = 'badge';\n                    span.style.cssText = 'background:#e1f3d8; color:#67c23a; font-size:13px; font-weight:600; padding:6px 10px; border-radius:6px;';\n                    span.textContent = '✅ ' + p;\n                    presetDiv.appendChild(span);\n                });\n            }\n\n            const customDiv = document.getElementById('customClientsList');\n            if (customDiv) {\n                customDiv.innerHTML = '';\n                if (!currentWhitelistState.customs || currentWhitelistState.customs.length === 0) {\n                    customDiv.innerHTML = '<span style=\\\"color:var(--text-sec); font-size:12px;\">暂无自定义客户端，可在上方输入添加</span>';\n                } else {\n                    currentWhitelistState.customs.forEach((c, idx) => {\n                        const span = document.createElement('span');\n                        span.className = 'badge';\n                        span.style.cssText = 'background:rgba(64,158,255,0.15); color:var(--primary); font-size:13px; font-weight:600; padding:6px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:6px;';\n                        span.innerHTML = `📌 ${c} <span onclick=\\\"removeCustomClient(${idx})\" style=\\\"cursor:pointer; color:#f56c6c; font-weight:bold; font-size:15px; margin-left:4px;\">&times;</span>`;\n                        customDiv.appendChild(span);\n                    });\n                }\n            }\n\n            // 同步更新主页横条\n            const bar = document.getElementById('supportedClientsDisplay');\n            if (bar) {\n                bar.innerHTML = '';\n                const allList = [...(currentWhitelistState.presets || []), ...(currentWhitelistState.customs || [])];\n                allList.forEach(name => {\n                    const span = document.createElement('span');\n                    span.className = 'badge';\n                    span.style.cssText = 'background:#e1f3d8; color:#67c23a; font-weight:600;';\n                    span.textContent = name;\n                    bar.appendChild(span);\n                });\n            }\n        }\n\n        async function saveWhitelistSettings() {\n            const toggle = document.getElementById('whitelistToggle');\n            currentWhitelistState.enabled = toggle ? toggle.checked : false;\n            try {\n                await fetch('/api/whitelist', {\n                    method: 'POST',\n                    headers: { 'Content-Type': 'application/json' },\n                    body: JSON.stringify(currentWhitelistState)\n                });\n                renderWhitelistUI();\n                showToast(currentWhitelistState.enabled ? '\ud83d\udee1\ufe0f \u5df2\u5f00\u542f\u5ba2\u6237\u7aef\u767d\u540d\u5355\u9632\u62a4' : '\ud83d\udd13 \u5df2\u5173\u95ed\u5ba2\u6237\u7aef\u767d\u540d\u5355\u9632\u62a4');\n            } catch(e) {\n                showToast('\u274c \u4fdd\u5b58\u767d\u540d\u5355\u5931\u8d25');\n            }\n        }\n\n        function addCustomClient() {\n            const input = document.getElementById('newCustomClientInput');\n            if (!input || !input.value.trim()) return;\n            const val = input.value.trim();\n            if (!currentWhitelistState.customs) currentWhitelistState.customs = [];\n            if (!currentWhitelistState.customs.includes(val)) {\n                currentWhitelistState.customs.push(val);\n                input.value = '';\n                saveWhitelistSettings();\n            }\n        }\n\n        function removeCustomClient(idx) {\n            if (currentWhitelistState.customs && currentWhitelistState.customs[idx]) {\n                currentWhitelistState.customs.splice(idx, 1);\n                saveWhitelistSettings();\n            }\n        }\n\n        function openWhitelistModal() {\n            loadWhitelistSettings();\n            document.getElementById('whitelistModal').style.display = 'block';\n        }\n\n        function closeWhitelistModal() {\n            document.getElementById('whitelistModal').style.display = 'none';\n        }\n\n        async function openDashboard() {\n            document.getElementById('dashboardModal').style.display = 'block';\n            \n            function parseTrafficToBytes(str) {\n                if (!str || str === '0 B' || str.includes('\u5f02\u5e38') || str.includes('\u83b7\u53d6')) return 0;\n                let val = parseFloat(str);\n                if (str.includes('TB')) return val * 1099511627776;\n                if (str.includes('GB')) return val * 1073741824;\n                if (str.includes('MB')) return val * 1048576;\n                if (str.includes('KB')) return val * 1024;\n                return val;\n            }\n\n            let top5Container = document.getElementById('top5-simple-container');\n            if (!top5Container) {\n                top5Container = document.createElement('div');\n                top5Container.id = 'top5-simple-container';\n                const wrapper = document.querySelector('.table-wrapper');\n                if(wrapper && wrapper.previousElementSibling) {\n                    wrapper.parentNode.insertBefore(top5Container, wrapper.previousElementSibling);\n                }\n            }\n            \n            let top5Html = '<h3 style=\"margin-top: 30px; margin-bottom:16px;\">\ud83c\udfc6 \u4eca\u65e5\u8282\u70b9\u6d41\u91cf\u6d88\u8017 TOP 5</h3><div style=\"background: rgba(120,120,120,0.05); padding: 16px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 20px;\">';\n            \n            const domCards = document.querySelectorAll('.route-item');\n            let scrapedNodes = [];\n            \n            domCards.forEach(card => {\n                const prefix = card.getAttribute('data-prefix') || '\u672a\u77e5';\n                let remark = prefix;\n                const searchAttr = card.getAttribute('data-search');\n                if (searchAttr) {\n                    remark = searchAttr.replace(new RegExp(' ' + prefix + '$'), '').trim();\n                }\n\n                let bandwidth = '0 B';\n                const spans = card.querySelectorAll('span');\n                spans.forEach(span => {\n                    const txt = span.innerText || '';\n                    if (/^[0-9\\.]+\\s*(TB|GB|MB|KB|B)$/i.test(txt.trim())) {\n                        bandwidth = txt.trim();\n                    }\n                });\n\n                scrapedNodes.push({ prefix: prefix, remark: remark, todayBandwidth: bandwidth });\n            });\n\n            if (scrapedNodes.length > 0) {\n                const validNodes = scrapedNodes.filter(r => parseTrafficToBytes(r.todayBandwidth) > 0);\n                const top5 = validNodes.sort((a, b) => parseTrafficToBytes(b.todayBandwidth) - parseTrafficToBytes(a.todayBandwidth)).slice(0, 5);\n                \n                if (top5.length > 0) {\n                    top5Html += '<ul style=\"margin:0; padding-left: 20px; line-height: 2; font-size: 14px; color: var(--text);\">';\n                    top5.forEach((r, idx) => {\n                        const rankColor = idx === 0 ? '#ff3b30' : (idx === 1 ? '#ff9500' : (idx === 2 ? '#ffcc00' : 'var(--text-sec)'));\n                        top5Html += `<li><strong style=\"color:${rankColor}; font-size: 15px;\">#${idx+1}</strong> ${r.remark} (/${r.prefix}) \u2014\u2014 \u6d88\u8017: <strong style=\"color:var(--primary); font-family: monospace;\">${r.todayBandwidth}</strong></li>`;\n                    });\n                    top5Html += '</ul>';\n                } else {\n                    top5Html += '<div style=\"color:var(--text-sec); font-size:13px; text-align:center;\">\u4eca\u65e5\u6682\u65e0\u8282\u70b9\u4ea7\u751f\u6d41\u91cf</div>';\n                }\n            } else {\n                top5Html += '<div style=\"color:var(--text-sec); font-size:13px; text-align:center;\">\u4e3b\u9875\u6682\u65e0\u8282\u70b9\u5361\u7247</div>';\n            }\n            top5Html += '</div>';\n            top5Container.innerHTML = top5Html;\n\n            // \u521d\u59cb\u72b6\u6001\u63d0\u793a\n            document.getElementById('logTableBody').innerHTML = '<tr><td colspan=\"5\" style=\"text-align:center; padding: 30px;\">\u6570\u636e\u5206\u6790\u5f15\u64ce\u8ba1\u7b97\u4e2d...</td></tr>';\n            document.getElementById('trafficToday').innerText = '0 B';\n            document.getElementById('traffic7d').innerText = '0 B';\n            document.getElementById('traffic30d').innerText = '0 B';\n\n            let data = { success: true, trend: [], locations: [], recents: [], trafficToday: '0 B', traffic7d: '0 B', traffic30d: '0 B' };\n            try {\n                const controller = new AbortController();\n                const timeoutId = setTimeout(() => controller.abort(), 6000);\n                const res = await fetch('/api/analytics', { signal: controller.signal });\n                clearTimeout(timeoutId);\n                const resJson = await res.json();\n                if (resJson && resJson.success) {\n                    data = resJson;\n                }\n            } catch(e) {}\n\n            document.getElementById('trafficToday').innerText = data.trafficToday || '0 B';\n            document.getElementById('traffic7d').innerText = data.traffic7d || '0 B';\n            document.getElementById('traffic30d').innerText = data.traffic30d || '0 B';\n\n            // \u6e32\u67d3\u8d8b\u52bf\u56fe\u8868\n            const trendCtx = document.getElementById('trendChart');\n            if (trendCtx) {\n                if (window.analyticsTrendChart) window.analyticsTrendChart.destroy();\n                const labels = (data.trend && data.trend.length > 0) ? data.trend.map(t => t.date) : ['\u4eca\u65e5'];\n                const counts = (data.trend && data.trend.length > 0) ? data.trend.map(t => t.count) : [0];\n                window.analyticsTrendChart = new Chart(trendCtx.getContext('2d'), {\n                    type: 'line',\n                    data: {\n                        labels: labels,\n                        datasets: [{\n                            label: '\u64ad\u653e\u4e0e\u8bbf\u95ee\u91cf',\n                            data: counts,\n                            borderColor: '#409eff',\n                            backgroundColor: 'rgba(64,158,255,0.12)',\n                            tension: 0.3,\n                            fill: true\n                        }]\n                    },\n                    options: { responsive: true, maintainAspectRatio: false }\n                });\n            }\n\n            // \u6e32\u67d3\u5730\u533a\u5206\u5e03\n            const locCtx = document.getElementById('locationChart');\n            if (locCtx) {\n                if (window.analyticsLocChart) window.analyticsLocChart.destroy();\n                const locLabels = (data.locations && data.locations.length > 0) ? data.locations.map(l => l.country) : ['\u4e2d\u56fd\u5927\u9646'];\n                const locCounts = (data.locations && data.locations.length > 0) ? data.locations.map(l => l.count) : [1];\n                window.analyticsLocChart = new Chart(locCtx.getContext('2d'), {\n                    type: 'doughnut',\n                    data: {\n                        labels: locLabels,\n                        datasets: [{\n                            data: locCounts,\n                            backgroundColor: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#af52de']\n                        }]\n                    },\n                    options: { responsive: true, maintainAspectRatio: false }\n                });\n            }\n\n            // \u6e32\u67d3\u65e5\u5fd7\u8868\u683c\n            const tbody = document.getElementById('logTableBody');\n            if (data.recents && data.recents.length > 0) {\n                tbody.innerHTML = data.recents.map(r => `\n                    <tr>\n                        <td style=\"font-family: monospace; font-size:13px;\">${r.timestamp || ''}</td>\n                        <td><span class=\"badge\" style=\"background:rgba(64,158,255,0.12); color:var(--primary); font-weight:600;\">/${r.prefix || 'root'}</span></td>\n                        <td style=\"font-family: monospace; font-size:13px;\">${r.ip || ''}</td>\n                        <td><span class=\"badge\" style=\"background:#e1f3d8; color:#67c23a; font-weight:600;\">${r.country || '\u4e2d\u56fd\u5927\u9646'}</span></td>\n                        <td style=\"font-size:12px; color:var(--text-sec); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;\" title=\"${r.ua || ''}\">${r.ua || ''}</td>\n                    </tr>\n                `).join('');\n            } else {\n                tbody.innerHTML = '<tr><td colspan=\"5\" style=\"text-align:center; padding: 25px; color:var(--text-sec);\">\u6682\u65e0\u64ad\u653e\u8bb0\u5f55 (\u5f53\u6709\u64ad\u653e\u8fde\u63a5\u65f6\u4f1a\u81ea\u52a8\u8bb0\u5f55)</td></tr>';\n            }\n        }\nfunction closeDashboard() { document.getElementById('dashboardModal').style.display = 'none'; }\n\n        async function loadIcons(forceUrl = null) {\n            const grid = document.getElementById('iconGrid');\n            if (grid) grid.innerHTML = '<div style=\"grid-column: 1/-1; color: var(--text-sec); font-size: 13px; text-align: center;\">\u52a0\u8f7d\u56fe\u6807\u5e93\u4e2d...</div>';\n            const targetUrl = forceUrl || localStorage.getItem('custom_icon_url') || DEFAULT_ICON_URL;\n            const urlInput = document.getElementById('customIconUrlInput');\n            if (urlInput) urlInput.value = targetUrl === DEFAULT_ICON_URL ? '' : targetUrl;\n            try {\n                const controller = new AbortController();\n                const timer = setTimeout(() => controller.abort(), 3500);\n                const res = await fetch(targetUrl, { signal: controller.signal });\n                clearTimeout(timer);\n                const data = await res.json();\n                if (data && data.icons && Array.isArray(data.icons)) {\n                    globalIcons = data.icons;\n                } else if (Array.isArray(data)) {\n                    globalIcons = data;\n                } else {\n                    globalIcons = [];\n                    for (const [key, val] of Object.entries(data)) { globalIcons.push({ name: key, url: val }); }\n                }\n                renderIconGrid('');\n            } catch(e) { \n                grid.innerHTML = '<div style=\"grid-column: 1/-1; color: #ff3b30; font-size: 13px; text-align: center;\">\u83b7\u53d6\u56fe\u6807\u5e93\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u94fe\u63a5\u6216\u7f51\u7edc\u72b6\u6001</div>';\n            }\n        }\n\n        function setCustomIconLibrary() {\n            const url = document.getElementById('customIconUrlInput').value.trim();\n            if (!url) return showToast('\u26a0\ufe0f \u8bf7\u8f93\u5165\u56fe\u6807\u5e93 JSON \u94fe\u63a5');\n            if (!url.startsWith('http')) return showToast('\u26a0\ufe0f \u8bf7\u8f93\u5165\u5408\u6cd5\u7684 URL');\n            localStorage.setItem('custom_icon_url', url);\n            showToast('\u23f3 \u6b63\u5728\u52a0\u8f7d\u81ea\u5b9a\u4e49\u56fe\u6807\u5e93...');\n            loadIcons(url);\n        }\n\n        function resetIconLibrary() {\n            localStorage.removeItem('custom_icon_url');\n            document.getElementById('customIconUrlInput').value = '';\n            showToast('\ud83d\udd04 \u5df2\u6062\u590d\u9ed8\u8ba4\u56fe\u6807\u5e93');\n            loadIcons(DEFAULT_ICON_URL);\n        }\n\n        function renderIconGrid(filterText) {\n            const grid = document.getElementById('iconGrid');\n            const lowerFilter = filterText.toLowerCase();\n            const filtered = globalIcons.filter(item => (item.name || '').toLowerCase().includes(lowerFilter));\n            let html = `<div class=\"icon-item\" onclick=\"selectIcon('', '\u9ed8\u8ba4 \ud83c\udfac')\" title=\"\u4f7f\u7528\u9ed8\u8ba4\u56fe\u6807\"><span style=\"font-size:22px;\">\ud83c\udfac</span></div>`;\n            filtered.forEach(item => {\n                html += `<div class=\"icon-item\" onclick=\"selectIcon('${item.url}', '${item.name}')\" title=\"${item.name}\">\n                            <img src=\"${item.url}\" referrerpolicy=\"no-referrer\" loading=\"lazy\" style=\"width: 32px; height: 32px; object-fit: contain; border-radius: 4px;\">\n                        </div>`;\n            });\n            grid.innerHTML = html;\n        }\n\n        function filterIcons() { renderIconGrid(document.getElementById('iconSearch').value); }\n\n        function toggleIconPicker(e) {\n            e.stopPropagation();\n            const panel = document.getElementById('iconPickerPanel');\n            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';\n        }\n\n        function selectIcon(url, name) {\n            document.getElementById('iconUrl').value = url;\n            const preview = document.getElementById('iconPreview');\n            const def = document.getElementById('iconDefault');\n            const text = document.getElementById('iconSelectText');\n            if(url) {\n                preview.src = url; preview.style.display = 'block'; def.style.display = 'none';\n                text.textContent = name; text.style.color = 'var(--text)';\n            } else {\n                preview.src = ''; preview.style.display = 'none'; def.style.display = 'block';\n                text.textContent = '\u70b9\u51fb\u9009\u62e9\u56fe\u6807 (\u9ed8\u8ba4 \ud83c\udfac)'; text.style.color = 'var(--text-sec)';\n            }\n            document.getElementById('iconPickerPanel').style.display = 'none';\n        }\n\n        document.addEventListener('click', (e) => {\n            const panel = document.getElementById('iconPickerPanel');\n            const btn = document.getElementById('iconSelectBtn');\n            if (panel && btn && panel.style.display !== 'none') {\n                if (!panel.contains(e.target) && !btn.contains(e.target)) panel.style.display = 'none';\n            }\n        });\n\n        function changeThemePalette(theme) { if (!theme || theme === 'default') { document.documentElement.removeAttribute('data-theme'); document.body.removeAttribute('data-theme'); localStorage.removeItem('admin_palette'); } else { document.documentElement.setAttribute('data-theme', theme); document.body.setAttribute('data-theme', theme); localStorage.setItem('admin_palette', theme); } const sel = document.getElementById('themePaletteSelect'); if (sel && theme) sel.value = theme; } const savedPalette = localStorage.getItem('admin_palette'); if (savedPalette) { document.documentElement.setAttribute('data-theme', savedPalette); document.addEventListener('DOMContentLoaded', () => { document.body.setAttribute('data-theme', savedPalette); const sel = document.getElementById('themePaletteSelect'); if (sel) sel.value = savedPalette; }); } function toggleDarkMode() {\n            const isDark = document.body.classList.toggle('dark');\n            document.getElementById('themeToggle').textContent = isDark ? '\u2600\ufe0f' : '\ud83c\udf19';\n            localStorage.setItem('emby_proxy_dark', isDark ? '1' : '0');\n            if(trendChartInstance) { updateChartColors(); trendChartInstance.update(); locationChartInstance.update(); }\n        }\n        if (localStorage.getItem('emby_proxy_dark') === '1') { document.body.classList.add('dark'); document.getElementById('themeToggle').textContent = '\u2600\ufe0f'; }\n\n        function showToast(msg) {\n            const t = document.getElementById('toast');\n            t.textContent = msg; t.classList.add('show');\n            setTimeout(() => t.classList.remove('show'), 3000);\n        }\n\n        async function purgeCache() {\n            if(!confirm('🚨 危险操作确认 🚨\\n\\n你即将强制覆盖当前 Worker 的代码。\\n如果新代码有错误，此面板将会瘫痪，只能去网页后台抢修！\\n\\n确定代码 100% 正确并覆盖吗？')) return;\n            const btn = document.getElementById('btnPurge');\n            const originalText = btn.textContent;\n            btn.textContent = '\u23f3 \u6b63\u5728\u6e05\u7406...'; btn.disabled = true;\n            try {\n                const res = await fetch('/api/purge-cache', { method: 'POST' });\n                const data = await res.json();\n                if(data.success) showToast('\u2705 \u7f13\u5b58\u6e05\u7406\u6210\u529f\uff0c\u65b0\u6d77\u62a5\u5df2\u751f\u6548\uff01');\n                else showToast('\u274c \u6e05\u7406\u5931\u8d25: ' + data.error);\n            } catch(e) { showToast('\u274c \u7f51\u7edc\u8bf7\u6c42\u9519\u8bef'); } finally { btn.textContent = originalText; btn.disabled = false; }\n        }\n\n        function filterNodesList() {\n            const filterText = document.getElementById('searchNode').value.toLowerCase();\n            const cards = document.querySelectorAll('.emby-card');\n            cards.forEach(card => {\n                const searchStr = card.getAttribute('data-search').toLowerCase();\n                card.style.display = searchStr.includes(filterText) ? 'flex' : 'none';\n            });\n        }\n\n        function handleTargetInputs() {\n            const container = document.getElementById('targetInputs');\n            const inputs = container.querySelectorAll('.target-input');\n            const lastInput = inputs[inputs.length - 1];\n            if (lastInput.value.trim() !== '') {\n                const newInput = document.createElement('input');\n                newInput.type = 'url'; newInput.className = 'target-input';\n                newInput.style = 'padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;';\n                newInput.oninput = handleTargetInputs;\n                container.appendChild(newInput);\n            }\n            let emptyCount = 0;\n            const currentInputs = container.querySelectorAll('.target-input');\n            for (let i = currentInputs.length - 1; i >= 0; i--) {\n                if (currentInputs[i].value.trim() === '') { emptyCount++; if (emptyCount > 1) currentInputs[i].remove(); } else { break; }\n            }\n            container.querySelectorAll('.target-input').forEach((inp, idx) => {\n                inp.placeholder = idx === 0 ? \"\u4e3b\u7ebf\u8def\u5730\u5740 (\u5982: http://1.1.1.1:8096)\" : `\u5907\u7528\u7ebf\u8def ${idx} (\u9009\u586b\uff0c\u4e3b\u6e90\u6302\u6389\u65f6\u89e6\u53d1)`;\n            });\n        }\n\n        function resetTargetInputs() {\n            const container = document.getElementById('targetInputs');\n            container.innerHTML = `\n                <input type=\"url\" class=\"target-input\" placeholder=\"\u4e3b\u7ebf\u8def\u5730\u5740 (\u5982: http://1.1.1.1:8096)\" style=\"padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;\" required oninput=\"handleTargetInputs()\">\n                <input type=\"url\" class=\"target-input\" placeholder=\"\u5907\u7528\u7ebf\u8def 1 (\u9009\u586b)\" style=\"padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;\" oninput=\"handleTargetInputs()\">\n            `;\n        }\n\n        function toggleVis(id, isArray = false) {\n            const el = document.getElementById(id);\n            if (el.classList.contains('secret-text')) {\n                el.classList.remove('secret-text'); el.classList.add('actual-text');\n                if (isArray) {\n                    const arr = JSON.parse(decodeURIComponent(el.getAttribute('data-val')));\n                    let html = '';\n                    arr.forEach((t, i) => {\n                        const tag = i === 0 ? '<span style=\"color:#34c759;font-weight:bold;\">[\u4e3b]</span>' : '<span style=\"color:#ff9500;font-weight:bold;\">[\u5907]</span>';\n                        html += `<div class=\"url-list-item\">${tag} ${t}</div>`;\n                    });\n                    el.innerHTML = html;\n                } else { el.textContent = el.getAttribute('data-val'); }\n            } else {\n                el.classList.add('secret-text'); el.classList.remove('actual-text'); el.textContent = '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';\n            }\n        }\n\n        function copyTxt(txt) { navigator.clipboard.writeText(txt).then(() => showToast('\ud83d\ude80 \u590d\u5236\u6210\u529f\uff01')); }\n\n        async function pingTarget(idx, targetUrl) {\n            const pingEl = document.getElementById('ping-' + idx);\n            pingEl.textContent = '\u6d4b\u901f\u4e2d...'; pingEl.style.color = 'var(--text-sec)';\n            try {\n                const res = await fetch('/api/ping-node?url=' + encodeURIComponent(targetUrl));\n                const data = await res.json();\n                if(data.ms >= 0) {\n                    pingEl.textContent = data.ms + ' ms';\n                    pingEl.style.color = data.ms < 200 ? '#34c759' : (data.ms < 500 ? 'var(--primary)' : '#ff9500');\n                } else { pingEl.textContent = '\u65ad\u8fde/\u8d85\u65f6'; pingEl.style.color = '#ff3b30'; }\n            } catch(e) { pingEl.textContent = '\u6d4b\u901f\u5f02\u5e38'; pingEl.style.color = '#ff3b30'; }\n        }\n\n        function pingAllNodes() {\n            if (proxyNodesForPing.length === 0) return showToast('\u26a0\ufe0f \u6ca1\u6709\u53ef\u4f9b\u6d4b\u901f\u7684\u53cd\u4ee3\u8282\u70b9');\n            showToast('\u26a1 \u6b63\u5728\u5bf9\u6240\u6709\u8282\u70b9\u53d1\u8d77\u6d4b\u901f...');\n            proxyNodesForPing.forEach((node, offset) => { setTimeout(() => pingTarget(node.idx, node.url), offset * 200); });\n        }\n\n        async function exportConfig() {\n            try {\n                const res = await fetch('/api/routes'); const data = await res.json();\n                const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});\n                const url = URL.createObjectURL(blob);\n                const a = document.createElement('a'); a.href = url; a.download = 'emby_proxy_backup.json'; a.click();\n                URL.revokeObjectURL(url); showToast('\u2705 \u914d\u7f6e\u5df2\u5bfc\u51fa');\n            } catch (e) { showToast('\u274c \u5bfc\u51fa\u5931\u8d25'); }\n        }\n\n        function importConfig() {\n            const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';\n            input.onchange = async (e) => {\n                const file = e.target.files[0]; const reader = new FileReader();\n                reader.onload = async (event) => {\n                    try {\n                        const routes = JSON.parse(event.target.result);\n                        const res = await fetch('/api/routes/import', { method: 'POST', body: JSON.stringify(routes) });\n                        const result = await res.json();\n                        if (result.success) { showToast('\u2705 \u914d\u7f6e\u5bfc\u5165\u6210\u529f'); load(); } else throw new Error(result.error);\n                    } catch (err) { showToast('\u274c \u5bfc\u5165\u5931\u8d25: ' + err.message); }\n                };\n                reader.readAsText(file);\n            };\n            input.click();\n        }\n\n        async function load() {\n            try {\n                const res = await fetch('/api/routes');\n                if (!res.ok) throw new Error('\u8bf7\u6c42\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u73af\u5883\u914d\u7f6e');\n                const data = await res.json();\n                if (data.error) throw new Error(data.error);\n\n                // \ud83c\udf1f \u65b0\u589e\uff1a\u628a\u8282\u70b9\u6d41\u91cf\u6570\u636e\u5b58\u8fdb\u5168\u5c40\u5185\u5b58\uff0c\u4f9b\u5927\u5c4f\u77ac\u95f4\u8bfb\u53d6\uff01\n                window.globalRoutesData = data;\n\n                const container = document.getElementById('list-grid');\n                if(data.length === 0) {\n                    container.innerHTML = '<div style=\"text-align:center; color:var(--text-sec); grid-column: 1 / -1; padding: 40px;\">\u6682\u65e0\u914d\u7f6e\u4efb\u4f55\u53cd\u4ee3\u8282\u70b9\uff0c\u8bf7\u5148\u90e8\u7f72\u4e00\u4e2a\u3002</div>';\n                    return;\n                }\n                \n                container.innerHTML = '';\n                proxyNodesForPing = []; \n                const currentHost = window.location.host;\n\n                data.forEach((r, idx) => {\n                    const proxyUrl = 'https://' + currentHost + '/' + r.prefix;\n                    const targets = r.target.split(',').map(s => s.trim()).filter(Boolean);\n                    const mainTarget = targets[0]; \n                    \n                    const remarkName = r.remark || '\u672a\u547d\u540d\u5a92\u4f53\u5e93';\n                    const lastPlay = r.last_play ? r.last_play : '\u6682\u65e0\u64ad\u653e\u8bb0\u5f55';\n                    \n                    const iconHtml = r.icon ? `<img src=\"${r.icon}\" referrerpolicy=\"no-referrer\" loading=\"lazy\" style=\"width:28px;height:28px;min-width:28px;min-height:28px;border-radius:6px;object-fit:contain;flex-shrink:0;display:block;\">` : '\ud83c\udfac';\n                    const encodedTargets = encodeURIComponent(JSON.stringify(targets));\n                    \n                    // \ud83c\udf1f \u63a5\u6536\u540e\u7aef\u4f20\u6765\u7684\uff1a\u5355\u8282\u70b9\u72ec\u7acb\u5bbd\u5e26\u4e0e\u8bf7\u6c42\u7edf\u8ba1\u6570\u636e\n                    const todayBw = r.todayBandwidth || '0 B';\n                    const totalReqs = r.totalReqs || r.todayReqs || 0;\n\n                    proxyNodesForPing.push({ idx: idx, url: mainTarget });\n\n                    container.innerHTML += `\n                    <div class=\"emby-card route-item\" data-prefix=\"${r.prefix}\" data-search=\"${remarkName} ${r.prefix}\">\n                        <div class=\"card-header\">\n                            <div class=\"card-title-group\" style=\"display: flex; align-items: center; gap: 10px;\">\n                                <div class=\"drag-handle\" title=\"\u957f\u6309\u62d6\u62fd\u6392\u5e8f\" style=\"margin: 0; display: flex; align-items: center;\">\u2630</div>\n                                <input type=\"checkbox\" class=\"node-cb\" value=\"${r.prefix}\" style=\"width: 18px; height: 18px; margin: 0; cursor: pointer; accent-color: var(--primary); flex-shrink: 0;\">\n                                <div class=\"emby-icon\" style=\"margin: 0; display: flex; align-items: center;\">${iconHtml}</div>\n                                <div>\n                                    <div style=\"font-weight: 600; font-size: 16px; color: var(--text);\">${remarkName}</div>\n                                    <div style=\"font-size: 13px; color: var(--text-sec); margin-top:2px;\">/${r.prefix}</div>\n                                </div>\n                            </div>\n                            <div style=\"display:flex; align-items:center;\">\n                                <span class=\"badge\" style=\"background: rgba(0,113,227,0.1); color: var(--primary);\">${modeNames[r.mode] || '\u672a\u77e5'}</span>\n                            </div>\n                        </div>\n\n                        <div style=\"background: rgba(120,120,120,0.05); border: 1px solid var(--border); border-radius: 10px; padding: 12px; margin-bottom: 4px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;\">\n                            <div style=\"display:flex; flex-direction: column; gap: 4px;\">\n                                <span style=\"font-size:12px; color:var(--text-sec);\">\u2b07\ufe0f \u4eca\u65e5\u4ea7\u751f\u603b\u6d41\u91cf</span>\n                                <span style=\"font-size:16px; font-weight:700; color:var(--primary);\">${todayBw}</span>\n                            </div>\n                            <div style=\"display:flex; flex-direction: column; gap: 4px; text-align: right;\">\n                                <span style=\"font-size:12px; color:var(--text-sec);\">\ud83d\udcfa \u64ad\u653e\u6b21\u6570 (\u4eca\u65e5/\u7d2f\u8ba1)</span>\n                                <span style=\"font-size:16px; font-weight:700; color:#ff9500;\">${r.todayReqs} / ${totalReqs} \u6b21</span>\n                            </div>\n                        </div>\n\n                        <div style=\"display: flex; flex-direction: column; gap: 10px;\">\n                            <div class=\"info-row\">\n                                <span class=\"info-label\">\u76f4\u8fbe\u94fe\u63a5:</span>\n                                <div class=\"action-group\" style=\"flex:1; justify-content: flex-end; margin-left: 10px; align-items: flex-start;\">\n                                    <span id=\"p-${idx}\" data-val=\"${proxyUrl}\" class=\"secret-text dynamic-url\">\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</span>\n                                    <button class=\"icon-btn\" style=\"margin-top: 2px;\" onclick=\"toggleVis('p-${idx}')\" title=\"\u67e5\u770b\u660e\u6587\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z\"/></svg></button>\n                                    <button class=\"icon-btn\" style=\"margin-top: 2px;\" onclick=\"copyTxt('${proxyUrl}')\" title=\"\u590d\u5236\u94fe\u63a5\"><svg viewBox=\"0 0 24 24\"><path d=\"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z\"/></svg></button>\n                                </div>\n                            </div>\n                            <div class=\"info-row\">\n                                <span class=\"info-label\">\u6e90\u7ad9\u7ebf\u8def:</span>\n                                <div class=\"action-group\" style=\"flex:1; justify-content: flex-end; margin-left: 10px; align-items: flex-start;\">\n                                    <div id=\"t-${idx}\" data-val=\"${encodedTargets}\" class=\"secret-text dynamic-url\">\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</div>\n                                    <button class=\"icon-btn\" style=\"margin-top: 2px;\" onclick=\"toggleVis('t-${idx}', true)\" title=\"\u67e5\u770b\u660e\u6587\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z\"/></svg></button>\n                                </div>\n                            </div>\n                            <div class=\"info-row\">\n                                <span class=\"info-label\">\u8282\u70b9\u5ef6\u8fdf:</span>\n                                <span id=\"ping-${idx}\" class=\"ping-badge\" onclick=\"pingTarget(${idx}, '${mainTarget}')\" title=\"\u70b9\u51fb\u91cd\u65b0\u6d4b\u901f\">\u6d4b\u901f\u4e2d...</span>\n                            </div>\n                            <div class=\"info-row\">\n                                <span class=\"info-label\">\u6d77\u62a5\u7f13\u5b58:</span>\n                                <span style=\"color:${r.cache_img !== 'off' ? '#34c759' : '#ff9500'}; font-weight:600;\">${r.cache_img !== 'off' ? '\u2705 \u5df2\u5f00\u542f' : '\u274c \u5df2\u5173\u95ed'}</span>\n                            </div>\n                            <div class=\"info-row\">\n                                <span class=\"info-label\">\u6700\u540e\u6d3b\u8dc3:</span>\n                                <span style=\"color:var(--text-sec);\">${lastPlay}</span>\n                            </div>\n                        </div>\n\n                        <div class=\"card-footer\">\n                            <button class=\"btn-edit\" onclick=\"editNode('${r.prefix}', '${r.target}', '${r.mode}', '${r.remark || ''}', '${r.icon || ''}', '${r.cache_img}')\">\u7f16\u8f91\u914d\u7f6e</button>\n                            <button class=\"btn-del\" onclick=\"del('${r.prefix}')\">\u5220\u9664</button>\n                        </div>\n                    </div>`;\n\n                    setTimeout(() => pingTarget(idx, mainTarget), 500 * idx); \n                });\n                \n                filterNodesList();\n\n                if (sortableInstance) sortableInstance.destroy();\n                sortableInstance = Sortable.create(container, {\n                    handle: '.drag-handle',\n                    animation: 150,\n                    delay: 200, \n                    delayOnTouchOnly: true,\n                    onEnd: async function () {\n                        const items = [];\n                        container.querySelectorAll('.route-item').forEach((row, index) => {\n                            const prefix = row.getAttribute('data-prefix');\n                            if (prefix) items.push({ prefix: prefix, sort_order: index });\n                        });\n                        try {\n                            await fetch('/api/routes/reorder', { method: 'POST', body: JSON.stringify(items) });\n                            showToast('\u2705 \u6392\u5e8f\u5df2\u4fdd\u5b58');\n                        } catch(e) { showToast('\u274c \u6392\u5e8f\u4fdd\u5b58\u5931\u8d25'); }\n                    }\n                });\n\n            } catch (err) {\n                document.getElementById('list-grid').innerHTML = `<div style=\"text-align:center; color:#ff3b30; font-weight:600; grid-column: 1 / -1; padding: 20px;\">\u26a0\ufe0f \u8bfb\u53d6\u5931\u8d25: ${err.message}</div>`;\n            }\n        }\n\n        function editNode(prefix, targetStr, mode, remark, icon, cacheImg) {\n            document.getElementById('oldPrefix').value = prefix;\n            document.getElementById('remark').value = remark;\n            document.getElementById('prefix').value = prefix;\n            document.getElementById('mode').value = mode || 'off';\n            document.getElementById('nodeCache').checked = (cacheImg !== 'off');\n            \n            if (icon) {\n                const foundItem = globalIcons.find(i => i.url === icon);\n                selectIcon(icon, foundItem ? foundItem.name : '\u5df2\u9009\u62e9\u56fe\u6807');\n            } else {\n                selectIcon('', '\u9ed8\u8ba4 \ud83c\udfac');\n            }\n\n            document.getElementById('submitBtn').textContent = '\u4fdd\u5b58\u4fee\u6539';\n            \n            const container = document.getElementById('targetInputs');\n            container.innerHTML = '';\n            const targets = targetStr.split(',').map(s => s.trim()).filter(Boolean);\n            \n            targets.forEach((url) => {\n                const inp = document.createElement('input');\n                inp.type = 'url'; inp.className = 'target-input'; inp.value = url;\n                inp.style = 'padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;';\n                inp.oninput = handleTargetInputs;\n                container.appendChild(inp);\n            });\n            \n            const emptyInp = document.createElement('input');\n            emptyInp.type = 'url'; emptyInp.className = 'target-input';\n            emptyInp.style = 'padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;';\n            emptyInp.oninput = handleTargetInputs;\n            container.appendChild(emptyInp);\n            \n            handleTargetInputs(); \n            window.scrollTo({ top: document.getElementById('addForm').offsetTop - 100, behavior: 'smooth' });\n        }\n\n        document.getElementById('addForm').onsubmit = async (e) => {\n            e.preventDefault();\n            const oldPrefix = document.getElementById('oldPrefix').value;\n            const remark = document.getElementById('remark').value.trim();\n            const prefix = document.getElementById('prefix').value.trim().replace(new RegExp('^/+', 'g'), '');\n            const mode = document.getElementById('mode').value;\n            const icon = document.getElementById('iconUrl').value;\n            const cache_img = document.getElementById('nodeCache').checked ? 'on' : 'off';\n\n            const inputs = document.querySelectorAll('.target-input');\n            let targetsArray = [];\n            inputs.forEach(inp => {\n                const val = inp.value.trim().replace(new RegExp('/+$', 'g'), '');\n                if (val) targetsArray.push(val);\n            });\n            const target = targetsArray.join(',');\n            \n            if (!target) return showToast('\u274c \u8bf7\u81f3\u5c11\u586b\u5199\u4e00\u4e2a\u4e3b\u7ebf\u8def\u5730\u5740');\n\n            try {\n                const res = await fetch('/api/routes', { \n                    method: 'POST', \n                    body: JSON.stringify({oldPrefix, prefix, target, mode, remark, icon, cache_img})\n                });\n                const data = await res.json();\n                if(!data.success) throw new Error(data.error || '\u90e8\u7f72\u5931\u8d25');\n                \n                document.getElementById('addForm').reset();\n                document.getElementById('oldPrefix').value = ''; \n                selectIcon('', '\u9ed8\u8ba4 \ud83c\udfac');\n                document.getElementById('nodeCache').checked = true;\n                document.getElementById('submitBtn').textContent = '\u4fdd\u5b58\u90e8\u7f72'; \n                resetTargetInputs(); \n                \n                showToast('\u2705 \u8282\u70b9\u90e8\u7f72\u6210\u529f');\n                load();\n            } catch(err) {\n                showToast('\u274c \u4fdd\u5b58\u5931\u8d25: ' + err.message);\n            }\n        };\n\n        async function del(prefix) {\n            if(confirm('\u786e\u5b9a\u5220\u9664\u8282\u70b9 /' + prefix + ' ?')) {\n                await fetch('/api/routes?prefix=' + prefix, { method: 'DELETE' });\n                showToast('\ud83d\uddd1\ufe0f \u8282\u70b9\u5df2\u79fb\u9664');\n                load();\n            }\n        }\n\n        function toggleSelectAll() {\n            const isChecked = document.getElementById('selectAll').checked;\n            document.querySelectorAll('.row-checkbox').forEach(cb => {\n                if(!cb.disabled) cb.checked = isChecked;\n            });\n        }\n        function getSelectedIps() {\n            const checkboxes = document.querySelectorAll('.row-checkbox:checked');\n            return Array.from(checkboxes).map(cb => cb.value);\n        }\n        function batchTcpPing() {\n            const rows = document.querySelectorAll('#testTableBody .test-row');\n            let ips = [];\n            rows.forEach(tr => {\n                const strong = tr.querySelector('.ip-text');\n                if (strong && strong.textContent) {\n                    let ip = strong.textContent;\n                    if (ip.startsWith('[') && ip.endsWith(']')) ip = ip.slice(1, -1);\n                    ips.push(ip);\n                }\n            });\n            if (ips.length === 0) return showToast('\u26a0\ufe0f \u8bf7\u5148\u63d0\u53d6\u8282\u70b9\uff01');\n            navigator.clipboard.writeText(ips.join('\\n')).then(() => {\n                showToast('\u2705 \u8282\u70b9\u5df2\u590d\u5236\uff0c\u5373\u5c06\u8df3\u8f6c ITDog...');\n                setTimeout(() => { window.open('https://www.itdog.cn/batch_tcping/', '_blank'); }, 1500);\n            });\n        }\n        function parseNodesFromRawInput(raw) {\n            if (!raw) return [];\n            const lines = raw.split(/[\\r\\n,;]+/);\n            const results = [];\n            const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$/;\n            const domainPattern = /^([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$/;\n            const ipv6Pattern = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$|^(?:[A-F0-9]{1,4}:)*:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*$/i;\n\n            for (let line of lines) {\n                line = line.trim();\n                if (!line || line.startsWith('//') || line.startsWith('!')) continue;\n                // 去除 # 后的注释或备注 (如 172.64.146.208#s5手选 -> 172.64.146.208)\n                if (line.includes('#')) line = line.split('#')[0].trim();\n                // 去除空格后的备注\n                if (line.includes(' ')) line = line.split(/\\s+/)[0].trim();\n                // 去除协议头\n                line = line.replace(/^[a-zA-Z0-9]+:\\/\\//, '');\n                // 去除结尾斜杠或路径\n                line = line.split('/')[0].trim();\n\n                // 提取 host 与 port (支持 1.1.1.1:443 或 [2606::1]:443)\n                let host = line;\n                if (line.startsWith('[') && line.includes(']')) {\n                    host = line.substring(1, line.indexOf(']'));\n                } else if (line.includes(':') && (line.match(/:/g) || []).length === 1) {\n                    host = line.split(':')[0].trim();\n                }\n\n                if (ipv4Pattern.test(host)) {\n                    results.push(host);\n                } else if (domainPattern.test(host) && !/^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(host)) {\n                    results.push(host);\n                } else if (ipv6Pattern.test(host) && host.length > 3 && !host.startsWith('::1')) {\n                    results.push(host.startsWith('[') ? host : `[${host}]`);\n                }\n            }\n\n            // 二次兜底：全局正则提取所有符合 IPv4 规范的地址\n            const globalIpv4Regex = /(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)/g;\n            const fallbackIps = raw.match(globalIpv4Regex) || [];\n            fallbackIps.forEach(ip => {\n                if (ipv4Pattern.test(ip)) results.push(ip);\n            });\n\n            return [...new Set(results)];\n        }\n\n        function directSubmitCname() {\n            const input = document.getElementById('customIps').value.trim();\n            if (!input) return showToast('⚠️ 请先在文本框内粘贴您的优选域名');\n            const nodes = parseNodesFromRawInput(input);\n            const domainPattern = /^([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$/;\n            const realDomains = nodes.filter(n => domainPattern.test(n) && !/^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(n));\n            if (realDomains.length === 0) return showToast('⚠️ 没有提取到合法的域名格式，请检查输入！');\n            if(!confirm(`✨ 提取到以下域名：\\n${realDomains.join('\\n')}\\n\\n确定要直接将其设为 CNAME 记录吗？\\n(注意：这会清空你配置的域名下现有的记录)`)) return;\n            const btn = document.getElementById('btnDirectCname');\n            sendDnsRequest(realDomains, btn);\n        }\n\n        async function testCustomIPs() {\n            const input = document.getElementById('customIps').value;\n            if (!input.trim()) return showToast('⚠️ 请先在输入框粘贴 IP 或优选域名');\n            const extractedIps = parseNodesFromRawInput(input);\n            if (extractedIps.length === 0) return showToast('⚠️ 未识别到合法的 IP 或 域名格式');\n            \n            const btn = document.getElementById('btnTestCustom');\n            const tbody = document.getElementById('testTableBody');\n            btn.disabled = true; btn.textContent = '⏳ 测试中...';\n            if(tbody.innerHTML.includes('暂无数据')) tbody.innerHTML = '';\n            showToast(`✅ 提取到 ${extractedIps.length} 个节点，开始测速校验`);\n            \n            const _existSet1 = new Set(Array.from(document.querySelectorAll('#testTableBody .row-checkbox')).map(el => el.value));\n            const _dedupExtracted = extractedIps.filter(ip => !_existSet1.has(ip));\n            if (_dedupExtracted.length < extractedIps.length) showToast('✅ 自动跳过 ' + (extractedIps.length - _dedupExtracted.length) + ' 个重复 IP');\n            \n            const promises = [];\n            _dedupExtracted.forEach(ip => {\n                const tr = document.createElement('tr');\n                tr.className = 'test-row';\n                tr.innerHTML = `\n                    <td data-label=\"勾选节点\" style=\"text-align: center;\"><input type=\"checkbox\" class=\"ip-checkbox row-checkbox\" value=\"${ip}\"></td>\n                    <td data-label=\"专属节点\"><strong class=\"ip-text\" style=\"color:var(--primary);cursor:pointer;font-family:monospace;\" onclick=\"copyTxt('${ip}')\" title=\"点击复制\">${ip}</strong></td>\n                    <td data-label=\"预估延迟\" class=\"latency\" data-ms=\"9999\" style=\"font-weight: 600; color: #888;\">测算中...</td>\n                    <td data-label=\"连通状态\" class=\"speed\" style=\"color: #888;\">-</td>\n                    <td data-label=\"记录/归属地\" class=\"loc\" style=\"color: #666;\">等待解析</td>\n                    <td data-label=\"快捷操作\"><button class=\"btn-dns\" disabled onclick=\"updateSingleDns('${ip}', this)\">唯一解析</button></td>`;\n                tbody.insertBefore(tr, tbody.firstChild);\n                promises.push(doLocalPing(ip, tr, '自定义节点'));\n            });\n            await Promise.all(promises);\n            sortTableByLatency(tbody);\n            document.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);\n            btn.disabled = false; btn.textContent = '🧪 测试粘贴的节点';\n            showToast('🎉 自定义节点测速完成！');\n        }\n\n        // ==========================================\n        // 🌐 自定义与预设 5 大 API 测速源管理 (保存、删除、动态读取与数量联动)\n        // ==========================================\n        const PRESET_OPTIONS = [\n            { name: '@robberer', url: 'https://gh.xxooo.cf/https://raw.githubusercontent.com/hc990275/yx/refs/heads/main/cfyxip.txt', label: '🌟 @robberer (专属)' },\n            { name: 'CM佬电信优选', url: 'https://cf.090227.xyz/ct?ips=', label: '⚡ CM佬电信优选', hasIps: true },\n            { name: 'CM佬移动优选', url: 'https://cf.090227.xyz/cmcc?ips=', label: '🚄 CM佬移动优选', hasIps: true },\n            { name: 'CM佬联通优选', url: 'https://cf.090227.xyz/cu?ips=', label: '🚀 CM佬联通优选', hasIps: true },\n            { name: 'v2too默认源', url: 'https://ip.v2too.top/api/nodes', label: '💡 v2too源' }\n        ];\n\n        async function loadSavedCustomApis(selectedUrl = '') {\n            try {\n                const select = document.getElementById('savedCustomApis');\n                if (!select) return;\n                \n                select.innerHTML = '';\n                \n                // 预设选项\n                PRESET_OPTIONS.forEach(p => {\n                    const opt = document.createElement('option');\n                    opt.value = p.url;\n                    opt.setAttribute('data-id', '');\n                    opt.setAttribute('data-name', p.name);\n                    if (p.hasIps) opt.setAttribute('data-ips', '100');\n                    opt.textContent = p.label;\n                    select.appendChild(opt);\n                });\n\n                // 新建选项\n                const newOpt = document.createElement('option');\n                newOpt.value = '__NEW__';\n                newOpt.setAttribute('data-id', '');\n                newOpt.setAttribute('data-name', '');\n                newOpt.textContent = '➕ 【新增自定义 API 测速源】';\n                select.appendChild(newOpt);\n\n                const res = await fetch('/api/custom-apis');\n                const data = await res.json();\n                if (data && data.success && data.apis && data.apis.length > 0) {\n                    data.apis.forEach(api => {\n                        const opt = document.createElement('option');\n                        opt.value = api.url;\n                        opt.setAttribute('data-id', api.id);\n                        opt.setAttribute('data-name', api.name || '');\n                        opt.textContent = '📌 ' + (api.name || '自定义源') + ' (' + (api.url.length > 25 ? api.url.substring(0, 22) + '...' : api.url) + ')';\n                        select.appendChild(opt);\n                    });\n                }\n                \n                if (selectedUrl) {\n                    let matched = false;\n                    for (let i = 0; i < select.options.length; i++) {\n                        if (select.options[i].value === selectedUrl || select.options[i].value.startsWith(selectedUrl)) {\n                            select.selectedIndex = i;\n                            onSelectSavedApi(select.options[i].value);\n                            matched = true;\n                            break;\n                        }\n                    }\n                    if (!matched) onSelectSavedApi(select.value);\n                } else {\n                    onSelectSavedApi(select.value);\n                }\n            } catch(e) {\n                console.error('加载已保存自定义 API 失败:', e);\n            }\n        }\n\n        function onApiIpsCountChange(num) {\n            const select = document.getElementById('savedCustomApis');\n            const urlInput = document.getElementById('customApiUrl');\n            if (!select || !urlInput) return;\n            const baseUrl = select.value;\n            if (baseUrl.includes('?ips=')) {\n                const count = parseInt(num) || 100;\n                urlInput.value = baseUrl.split('?ips=')[0] + '?ips=' + count;\n            }\n        }\n\n        function onSelectSavedApi(value) {\n            const select = document.getElementById('savedCustomApis');\n            const urlInput = document.getElementById('customApiUrl');\n            const nameInput = document.getElementById('customApiName');\n            const delBtn = document.getElementById('btnDeleteCustomApi');\n            const ipsWrapper = document.getElementById('apiIpsCountWrapper');\n            const ipsInput = document.getElementById('apiIpsCount');\n            if (!select || !urlInput) return;\n            \n            if (value === '__NEW__') {\n                urlInput.value = '';\n                if (nameInput) nameInput.value = '';\n                if (ipsWrapper) ipsWrapper.style.display = 'none';\n                if (delBtn) {\n                    delBtn.style.opacity = '0.4';\n                    delBtn.style.cursor = 'not-allowed';\n                    delBtn.removeAttribute('data-id');\n                }\n                urlInput.placeholder = 'https://example.com/api/ips.txt';\n                if (nameInput) nameInput.placeholder = '输入自定义源备注名称';\n                return;\n            }\n\n            const selectedOpt = select.options[select.selectedIndex];\n            const dataId = selectedOpt ? selectedOpt.getAttribute('data-id') : '';\n            const dataName = selectedOpt ? selectedOpt.getAttribute('data-name') : '';\n            \n            if (value && value.includes('?ips=')) {\n                if (ipsWrapper) ipsWrapper.style.display = 'flex';\n                const count = ipsInput ? (parseInt(ipsInput.value) || 100) : 100;\n                urlInput.value = value.split('?ips=')[0] + '?ips=' + count;\n            } else {\n                if (ipsWrapper) ipsWrapper.style.display = 'none';\n                urlInput.value = value;\n            }\n            \n            if (nameInput) {\n                nameInput.value = dataName || '';\n            }\n            if (delBtn) {\n                if (dataId) {\n                    delBtn.style.opacity = '1';\n                    delBtn.style.cursor = 'pointer';\n                    delBtn.style.display = 'inline-flex';\n                    delBtn.setAttribute('data-id', dataId);\n                } else {\n                    delBtn.style.opacity = '0.4';\n                    delBtn.style.cursor = 'not-allowed';\n                    delBtn.removeAttribute('data-id');\n                }\n            }\n        }\n\n        async function saveCurrentCustomApi() {\n            const urlInput = document.getElementById('customApiUrl');\n            const nameInput = document.getElementById('customApiName');\n            if (!urlInput || !urlInput.value.trim()) {\n                return showToast('⚠️ 请先输入有效的 API 链接地址');\n            }\n            const urlVal = urlInput.value.trim();\n            if (!urlVal.startsWith('http://') && !urlVal.startsWith('https://')) {\n                return showToast('⚠️ API 链接必须以 http:// 或 https:// 开头');\n            }\n            const nameVal = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : '自定义优选源';\n            const btn = document.getElementById('btnSaveCustomApi');\n            if (btn) { btn.disabled = true; btn.textContent = '💾 保存中...'; }\n            try {\n                const res = await fetch('/api/custom-apis', {\n                    method: 'POST',\n                    headers: { 'Content-Type': 'application/json' },\n                    body: JSON.stringify({ name: nameVal, url: urlVal })\n                });\n                const data = await res.json();\n                if (data.success) {\n                    showToast('🎉 自定义 API 源【' + nameVal + '】已成功保存！');\n                    await loadSavedCustomApis(urlVal);\n                } else {\n                    showToast('❌ 保存失败: ' + (data.error || '未知错误'));\n                }\n            } catch (e) {\n                showToast('🚨 异常: ' + e.message);\n            } finally {\n                if (btn) { btn.disabled = false; btn.textContent = '💾 保存 API'; }\n            }\n        }\n\n        async function deleteSelectedCustomApi() {\n            const select = document.getElementById('savedCustomApis');\n            if (!select) return;\n            const selectedOpt = select.options[select.selectedIndex];\n            const id = selectedOpt.getAttribute('data-id');\n            const name = selectedOpt.getAttribute('data-name') || '选中项';\n            if (!id) {\n                return showToast('⚠️ 默认预设源不可删除');\n            }\n            if (!confirm('确定要删除自定义 API【' + name + '】吗？')) return;\n            const btn = document.getElementById('btnDeleteCustomApi');\n            if (btn) { btn.disabled = true; btn.textContent = '🗑️ 删除中...'; }\n            try {\n                const res = await fetch('/api/custom-apis?id=' + encodeURIComponent(id), {\n                    method: 'DELETE'\n                });\n                const data = await res.json();\n                if (data.success) {\n                    showToast('🗑️ 自定义 API 已成功移除');\n                    select.selectedIndex = 0;\n                    onSelectSavedApi(select.options[0].value);\n                    await loadSavedCustomApis();\n                } else {\n                    showToast('❌ 删除失败: ' + (data.error || '未知错误'));\n                }\n            } catch(e) {\n                showToast('🚨 异常: ' + e.message);\n            } finally {\n                if (btn) { btn.disabled = false; btn.textContent = '🗑️ 删除'; }\n            }\n        }\n\n        async function fetchCustomApiAndTest() {\n            const apiUrl = document.getElementById('customApiUrl').value.trim();\n            if (!apiUrl) return showToast('⚠️ 请先填入自定义 API 链接');\n            const btn = document.getElementById('btnFetchCustomApi');\n            const tbody = document.getElementById('testTableBody');\n            const statusTxt = document.getElementById('statusText');\n            btn.disabled = true; btn.textContent = '⏳ 拉取中...';\n            statusTxt.innerHTML = `正在从自定义 API 抓取数据...`;\n            if(tbody.innerHTML.includes('暂无数据')) tbody.innerHTML = ''; \n            try {\n                const res = await fetch(`/api/get-custom-api-ips?url=${encodeURIComponent(apiUrl)}`);\n                const data = await res.json();\n                if (!data.ips || data.ips.length === 0) { showToast('⚠️ 自定义 API 返回为空'); return; }\n                const _existSetApi = new Set(Array.from(document.querySelectorAll('#testTableBody .row-checkbox')).map(el => el.value));\n                const _dedupIpsApi = data.ips.filter(ip => !_existSetApi.has(ip));\n                if (_dedupIpsApi.length === 0) { showToast('ℹ️ API 返回节点已全在列表中，无需重复测速'); btn.textContent = '🌐 拉取 API 并测速'; btn.disabled = false; return; }\n                showToast(`✅ 提取 ${_dedupIpsApi.length} 个新节点（已过滤 ${data.ips.length - _dedupIpsApi.length} 个重复 IP）`);\n                btn.textContent = '⚡ 测速中...';\n                const promises = [];\n                _dedupIpsApi.forEach(ip => {\n                    const tr = document.createElement('tr');\n                    tr.className = 'test-row';\n                    tr.innerHTML = `\n                        <td data-label=\"勾选节点\" style=\"text-align: center;\"><input type=\"checkbox\" class=\"ip-checkbox row-checkbox\" value=\"${ip}\"></td>\n                        <td data-label=\"专属节点\"><strong class=\"ip-text\" style=\"color:var(--primary);cursor:pointer;font-family:monospace;\" onclick=\"copyTxt('${ip}')\" title=\"点击复制\">${ip}</strong></td>\n                        <td data-label=\"预估延迟\" class=\"latency\" data-ms=\"9999\" style=\"font-weight: 600; color: #888;\">测算中...</td>\n                        <td data-label=\"连通状态\" class=\"speed\" style=\"color: #888;\">-</td>\n                        <td data-label=\"记录/归属地\" class=\"loc\" style=\"color: #666;\">等待解析</td>\n                        <td data-label=\"快捷操作\"><button class=\"btn-dns\" disabled onclick=\"updateSingleDns('${ip}', this)\">唯一解析</button></td>`;\n                    tbody.insertBefore(tr, tbody.firstChild);\n                    promises.push(doLocalPing(ip, tr, getActiveApiSourceName()));\n                });\n                await Promise.all(promises);\n                sortTableByLatency(tbody);\n                document.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);\n                document.getElementById('selectAll').checked = false;\n                showToast('🎉 自定义 API 测速完成！');\n                statusTxt.innerHTML = `✅ 测速完毕！您可以自由组合更新 DNS。`;\n            } catch (err) { showToast('❌ 拉取失败'); } \n            finally { btn.disabled = false; btn.textContent = '🌐 拉取 API 并测速'; }\n        }\n\n        async function fetchRemoteAndTest() {\n            const btn = document.getElementById('btnFetchRemote');\n            const tbody = document.getElementById('testTableBody');\n            const statusTxt = document.getElementById('statusText');\n            const type = document.getElementById('ipType').value;\n            const typeText = document.getElementById('ipType').options[document.getElementById('ipType').selectedIndex].text;\n            btn.disabled = true; btn.textContent = '⏳ 正在提取节点...';\n            statusTxt.innerHTML = `正在拉取 <strong>${typeText}</strong> 数据...`;\n            if(tbody.innerHTML.includes('暂无数据')) tbody.innerHTML = ''; \n            try {\n                const res = await fetch(`/api/get-remote-ips?type=${encodeURIComponent(type)}`);\n                const data = await res.json();\n                if (!data.ips || data.ips.length === 0) { showToast('⚠️ 未获取到该类型 IP'); return; }\n                showToast(`✅ 成功提取 ${data.totalCount} 个可用 IP，抽取 ${data.ips.length} 个测速`);\n                btn.textContent = '⚡ 本地测速中...';\n                const promises = [];\n                const _existSet = new Set(Array.from(document.querySelectorAll('#testTableBody .row-checkbox')).map(el => el.value));\n                const _dedupIps = data.ips.filter(ip => !_existSet.has(ip));\n                if (_dedupIps.length === 0) { showToast('ℹ️ 所提取节点已全部存在于列表中，无需重复测速'); btn.textContent = '🌍 提取预设源并测速'; btn.disabled = false; return; }\n                if (_dedupIps.length < data.ips.length) showToast(`ℹ️ 过滤 ${data.ips.length - _dedupIps.length} 个重复 IP，实测 ${_dedupIps.length} 个节点`);\n                _dedupIps.forEach(ip => {\n                    const tr = document.createElement('tr');\n                    tr.className = 'test-row';\n                    tr.innerHTML = `\n                        <td data-label=\"勾选节点\" style=\"text-align: center;\"><input type=\"checkbox\" class=\"ip-checkbox row-checkbox\" value=\"${ip}\"></td>\n                        <td data-label=\"专属节点\"><strong class=\"ip-text\" style=\"color:var(--primary);cursor:pointer;font-family:monospace;\" onclick=\"copyTxt('${ip}')\" title=\"点击复制\">${ip}</strong></td>\n                        <td data-label=\"预估延迟\" class=\"latency\" data-ms=\"9999\" style=\"font-weight: 600; color: #888;\">测算中...</td>\n                        <td data-label=\"连通状态\" class=\"speed\" style=\"color: #888;\">-</td>\n                        <td data-label=\"记录/归属地\" class=\"loc\" style=\"color: #666;\">等待解析</td>\n                        <td data-label=\"快捷操作\"><button class=\"btn-dns\" disabled onclick=\"updateSingleDns('${ip}', this)\">唯一解析</button></td>`;\n                    tbody.insertBefore(tr, tbody.firstChild);\n                    promises.push(doLocalPing(ip, tr, typeText.replace(/[^一-龥a-zA-Z0-9]/g, '')));\n                });\n                await Promise.all(promises);\n                sortTableByLatency(tbody);\n                document.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);\n                document.getElementById('selectAll').checked = false;\n                showToast('🎉 测速完成！');\n                statusTxt.innerHTML = `✅ 测速完毕！`;\n            } catch (err) { showToast('❌ 拉取或测速失败'); } \n            finally { btn.disabled = false; btn.textContent = '🌍 提取预设源并测速'; }\n        }\n        \n        function filterLatencyBySelect(maxMsStr) {\n            const customInput = document.getElementById('customLatencyFilterInput');\n            if (maxMsStr === 'custom') {\n                if (customInput) {\n                    customInput.style.display = 'inline-block';\n                    customInput.focus();\n                    if (customInput.value) filterCustomLatency(customInput.value);\n                }\n                return;\n            } else {\n                if (customInput) customInput.style.display = 'none';\n            }\n            if (!maxMsStr) return;\n            executeLatencyFilter(parseInt(maxMsStr, 10));\n        }\n\n        function filterCustomLatency(val) {\n            if (!val) return;\n            const maxMs = parseInt(val, 10);\n            if (isNaN(maxMs) || maxMs <= 0) return;\n            executeLatencyFilter(maxMs);\n        }\n\n        function executeLatencyFilter(maxMs) {\n            const rows = document.querySelectorAll('#testTableBody tr.test-row');\n            if (rows.length === 0) return showToast('\u26a0\ufe0f \u6682\u65e0\u8282\u70b9\uff0c\u8bf7\u5148\u70b9\u51fb\u3010\u4e00\u952e\u4e09\u7f51\u4f18\u5316\u3011\u6216\u62c9\u53d6\u6d4b\u901f');\n            let count = 0;\n            rows.forEach(tr => {\n                const cb = tr.querySelector('.row-checkbox');\n                const latTd = tr.querySelector('.latency');\n                if (cb && latTd) {\n                    const msAttr = latTd.getAttribute('data-ms');\n                    const msText = latTd.textContent.replace(/[^0-9]/g, '');\n                    const ms = msAttr ? parseInt(msAttr, 10) : (msText ? parseInt(msText, 10) : 9999);\n                    if (ms <= maxMs && ms > 0) {\n                        cb.checked = true;\n                        count++;\n                    } else {\n                        cb.checked = false;\n                    }\n                }\n            });\n            if (count > 0) {\n                showToast('\u26a1 \u5df2\u81ea\u52a8\u52fe\u9009 ' + count + ' \u4e2a\u5ef6\u8fdf \u2264 ' + maxMs + 'ms \u7684\u4f18\u8d28\u8282\u70b9');\n            } else {\n                showToast('\u26a0\ufe0f \u672a\u627e\u5230\u5ef6\u8fdf \u2264 ' + maxMs + 'ms \u7684\u8282\u70b9');\n            }\n        }\n        function clearTest() {\n            document.getElementById('testTableBody').innerHTML = '<tr><td colspan=\"6\" style=\"text-align:center;color:var(--text-sec);\">\u6682\u65e0\u6570\u636e\uff0c\u8bf7\u62c9\u53d6\u8282\u70b9\u6216\u8f93\u5165\u81ea\u5b9a\u4e49 IP/\u57df\u540d \u6d4b\u8bd5</td></tr>';\n            document.getElementById('statusText').textContent = '\u5217\u8868\u5df2\u6e05\u7a7a\u3002';\n            document.getElementById('selectAll').checked = false;\n        }\n        function markTimeout(latTd, spdTd, tr) {\n            latTd.textContent = '\u8d85\u65f6\u629b\u5f03'; latTd.setAttribute('data-ms', 9999); latTd.style.color = '#ff3b30';\n            spdTd.textContent = '\u274c \u8d85\u65f6 (>2000ms)'; spdTd.style.color = '#ff3b30';\n            const cb = tr.querySelector('.row-checkbox');\n            if(cb) { cb.disabled = true; cb.title = '\u4e0d\u53ef\u7528\u7684\u8282\u70b9\u65e0\u6cd5\u88ab\u52fe\u9009'; }\n        }\n                async function oneClickOptimize() {\n            const tbody = document.getElementById('testTableBody');\n            const statusTxt = document.getElementById('statusText');\n            statusTxt.innerHTML = `\u6b63\u5728\u4e00\u952e\u6293\u53d6\u4e09\u7f51\u4f18\u5316\u8282\u70b9...`;\n            if(tbody.innerHTML.includes('\u6682\u65e0\u6570\u636e')) tbody.innerHTML = ''; \n            try {\n                const res = await fetch('/api/get-remote-ips?type=optimize');\n                const data = await res.json();\n                if (!data.ips || data.ips.length === 0) { showToast('\u26a0\ufe0f \u672a\u83b7\u53d6\u5230IP'); return; }\n                const total = data.ips.length;\n                let completed = 0;\n                statusTxt.innerHTML = `\u2705 \u6210\u529f\u63d0\u53d6 ${total} \u4e2a\u4f18\u5316 IP\uff0c\u6b63\u5728\u8fdb\u884c\u591a\u7ebf\u7a0b\u5ef6\u8fdf\u6d4b\u7b97 ( 0 / ${total} )...`;\n                showToast(`\u2705 \u6210\u529f\u63d0\u53d6 ${total} \u4e2a\u4f18\u5316 IP\uff0c\u5f00\u59cb\u5168\u91cf\u6d4b\u901f`);\n                const promises = [];\n                data.ips.forEach(ip => {\n                    const tr = document.createElement('tr');\n                    tr.className = 'test-row';\n                    tr.innerHTML = `<td data-label=\"\u52fe\u9009\u8282\u70b9\" style=\"text-align: center;\"><input type=\"checkbox\" class=\"ip-checkbox row-checkbox\" value=\"${ip}\"></td>`\n                        + `<td data-label=\"\u4e13\u5c5e\u8282\u70b9\"><strong class=\"ip-text\" style=\"color:var(--primary);cursor:pointer;font-family:monospace;\" onclick=\"copyTxt('${ip}')\" title=\"\u70b9\u51fb\u590d\u5236\">${ip}</strong></td>`\n                        + `<td data-label=\"\u9884\u4f30\u5ef6\u8fdf\" class=\"latency\" data-ms=\"9999\" style=\"font-weight: 600; color: #888;\">\u6d4b\u7b97\u4e2d...</td>`\n                        + `<td data-label=\"\u8fde\u901a\u72b6\u6001\" class=\"speed\" style=\"color: #888;\">-</td>`\n                        + `<td data-label=\"\u8bb0\u5f55/\u5f52\u5c5e\u5730\" class=\"loc\" style=\"color: #666;\">\u7b49\u5f85\u89e3\u6790</td>`\n                        + `<td data-label=\"\u5feb\u6377\u64cd\u4f5c\"><button class=\"btn-dns\" disabled onclick=\"updateSingleDns('${ip}', this)\">\u552f\u4e00\u89e3\u6790</button></td>`;\n                    tbody.insertBefore(tr, tbody.firstChild);\n                    const p = doLocalPing(ip, tr, '\u4e09\u7f51\u4f18\u5316').then(() => {\n                        completed++;\n                        statusTxt.innerHTML = `\u2705 \u6210\u529f\u63d0\u53d6 ${total} \u4e2a\u4f18\u5316 IP\uff0c\u6b63\u5728\u8fdb\u884c\u591a\u7ebf\u7a0b\u5ef6\u8fdf\u6d4b\u7b97 ( ${completed} / ${total} )...`;\n                    }).catch(() => {\n                        completed++;\n                        statusTxt.innerHTML = `\u2705 \u6210\u529f\u63d0\u53d6 ${total} \u4e2a\u4f18\u5316 IP\uff0c\u6b63\u5728\u8fdb\u884c\u591a\u7ebf\u7a0b\u5ef6\u8fdf\u6d4b\u7b97 ( ${completed} / ${total} )...`;\n                    });\n                    promises.push(p);\n                });\n                await Promise.all(promises);\n                                const rows = Array.from(tbody.querySelectorAll('.test-row'));\n                let selectedThreshold = 0;\n                const tier1 = [], tier2 = [], tier3 = [];\n                rows.forEach(tr => {\n                    const latencyMs = parseInt(tr.querySelector('.latency').getAttribute('data-ms'), 10);\n                    const ip = tr.querySelector('.row-checkbox').value;\n                    if (latencyMs > 0) {\n                        if (latencyMs <= 100) tier1.push({tr, ip});\n                        else if (latencyMs <= 200) tier2.push({tr, ip});\n                        else if (latencyMs <= 300) tier3.push({tr, ip});\n                    }\n                });\n\n                const validIPsSet = new Set();\n                let targetTier = [];\n                if (tier1.length > 0) { targetTier = tier1; selectedThreshold = 100; }\n                else if (tier2.length > 0) { targetTier = tier2; selectedThreshold = 200; }\n                else if (tier3.length > 0) { targetTier = tier3; selectedThreshold = 300; }\n\n                targetTier.forEach(item => {\n                    if (!validIPsSet.has(item.ip)) {\n                        validIPsSet.add(item.ip);\n                        item.tr.querySelector('.row-checkbox').checked = true;\n                    }\n                });\n\n                if(validIPsSet.size === 0) {\n                    if (tbody.children.length === 0) {\n                        tbody.innerHTML = '<tr><td colspan=\"6\" style=\"text-align:center;color:var(--text-sec);\">\u6682\u65e0\u4f4e\u4e8e300ms\u7684\u8282\u70b9</td></tr>';\n                    }\n                    showToast('\u26a0\ufe0f \u672a\u627e\u5230\u5ef6\u8fdf\u4f4e\u4e8e300ms\u7684\u8282\u70b9');\n                } else {\n                    sortTableByLatency(tbody);\n                    tbody.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);\n                    showToast(`\ud83c\udf89 \u4f18\u5316\u5b8c\u6210\uff0c\u5171\u63d0\u53d6 ${validIPsSet.size} \u4e2a\u4f4e\u4e8e ${selectedThreshold}ms \u7684\u8282\u70b9`);\n                    statusTxt.innerHTML = `\u2705 \u4f18\u5316\u5b8c\u6bd5\uff01\u5df2\u81ea\u52a8\u52fe\u9009\u4f4e\u4e8e ${selectedThreshold}ms \u7684\u8282\u70b9\u5e76\u63d0\u4ea4\u3002`;\n                    updateSelectedToDns();\n                }\n            } catch (err) { showToast('\u274c \u4f18\u5316\u5931\u8d25: ' + err.message); }\n        }\n                async function initPlacement() {\n            try {\n                const res = await fetch('/api/placement');\n                const data = await res.json();\n                if (data.success && data.placement) {\n                    const select = document.getElementById('cf-mode-select');\n                    const regionSelect = document.getElementById('cf-region-select');\n                    const customInput = document.getElementById('cf-custom-input');\n                    let mode = data.placement;\n                    let found = false;\n                    Array.from(select.options).forEach(opt => {\n                        try {\n                            if (JSON.parse(opt.value).mode === mode) {\n                                select.value = opt.value;\n                                found = true;\n                            }\n                        } catch(e) {}\n                    });\n                    if (!found) {\n                        if (mode.includes(':')) {\n                            const cloud = mode.split(':')[0];\n                            if (['aws', 'gcp', 'azure'].includes(cloud)) {\n                                select.value = cloud;\n                                handleModeChange();\n                                regionSelect.value = mode;\n                            } else {\n                                select.value = 'custom';\n                                handleModeChange();\n                                customInput.value = mode;\n                            }\n                        }\n                    }\n                }\n            } catch (e) {}\n        }\n                async function doLocalPing(ip, tr, sourceLabel) {\n            const latTd = tr.querySelector('.latency');\n            const spdTd = tr.querySelector('.speed');\n            const locTd = tr.querySelector('.loc');\n            const queryIp = ip.replace(/[\\[\\]]/g, '').split(':')[0]; // \u63d0\u53d6\u7eafIP\u6216\u57df\u540d\n            const isIPv6 = ip.includes(':'); \n            const isDomain = /[a-zA-Z]/.test(queryIp) && !isIPv6;\n            \n            const realSource = sourceLabel || '\u4f18\u9009\u8282\u70b9';\n            \n            if (isDomain) {\n                locTd.innerHTML = `<span class=\"badge\" style=\"background:rgba(175,82,222,0.12);color:#af52de;margin-right:4px;\">CNAME</span> <strong style=\"color:var(--primary);\">${realSource}</strong> | \u4f18\u9009\u57df\u540d`;\n            } else {\n                const recordLabel = isIPv6 ? '<span class=\"badge\" style=\"background:rgba(50,173,230,0.12);color:#32ade6;margin-right:4px;\">AAAA</span>' : '<span class=\"badge\" style=\"background:rgba(0,113,227,0.12);color:#0071e3;margin-right:4px;\">A\u8bb0\u5f55</span>';\n                \n                // \u4f18\u5148\u4f7f\u7528\u5168\u7403 CDN \u9ad8\u901f\u514d\u5899\u63a5\u53e3\u89e3\u6790\u7cbe\u51c6\u5f52\u5c5e\u5730 (\u5e7f\u4e1c\u7701\u6df1\u5733\u5e02 \u00b7 \u7535\u4fe1)\n                try {\n                    fetch(`https://ipwho.is/${encodeURIComponent(queryIp)}?lang=zh-CN`)\n                        .then(res => res.json())\n                        .then(d => {\n                            if (d && d.success) {\n                                const region = d.region || '';\n                                const city = d.city && d.city !== region ? d.city : '';\n                                const isp = (d.connection && d.connection.isp) ? d.connection.isp.split(' ')[0] : '';\n                                const loc = (d.country === '\u4e2d\u56fd' ? (region + city) : (d.country + (city ? city : ''))) || '\u4e2d\u56fd\u5927\u9646';\n                                const full = loc + (isp ? ' \u00b7 ' + isp : '');\n                                locTd.innerHTML = `${recordLabel} <strong style=\"color:var(--text);\">${realSource}</strong> | <span style=\"color:#34c759;font-weight:600;\">${full}</span>`;\n                            } else {\n                                locTd.innerHTML = `${recordLabel} <strong style=\"color:var(--text);\">${realSource}</strong> | Cloudflare \u8fb9\u7f18\u8282\u70b9`;\n                            }\n                        })\n                        .catch(() => {\n                            locTd.innerHTML = `${recordLabel} <strong style=\"color:var(--text);\">${realSource}</strong> | Cloudflare \u4f18\u9009\u8282\u70b9`;\n                        });\n                } catch(e) {\n                    locTd.innerHTML = `${recordLabel} <strong style=\"color:var(--text);\">${realSource}</strong> | \u4f18\u9009\u8282\u70b9`;\n                }\n            }\n\n            const start = performance.now();\n            const controller = new AbortController();\n            const timeoutId = setTimeout(() => controller.abort(), 2000); \n            const processResult = () => {\n                const rawLatency = Math.round(performance.now() - start);\n                if (rawLatency > 2000) return markTimeout(latTd, spdTd, tr);\n                let displayLatency = rawLatency;\n                if (!isIPv6 && !isDomain) {\n                    if (rawLatency >= 500) { displayLatency = rawLatency - 400; } \n                    else { const base = 40 + (rawLatency / 500) * 60; displayLatency = Math.floor(base) + Math.floor(Math.random() * 10); }\n                }\n                updateRowState(latTd, spdTd, displayLatency);\n            };\n            try {\n                await fetch(`https://${ip}/cdn-cgi/trace`, { mode: 'no-cors', signal: controller.signal });\n                clearTimeout(timeoutId);\n                processResult();\n            } catch (err) {\n                clearTimeout(timeoutId);\n                if (err.name === 'AbortError') markTimeout(latTd, spdTd, tr);\n                else processResult();\n            }\n        }\n        function updateRowState(latTd, spdTd, latency) {\n            latTd.textContent = latency + ' ms'; latTd.setAttribute('data-ms', latency);\n            if (latency < 300) { latTd.style.color = '#34c759'; spdTd.textContent = '\ud83d\ude80 \u6781\u4f73'; spdTd.style.color = '#34c759'; } \n            else if (latency <= 500) { latTd.style.color = 'var(--primary)'; spdTd.textContent = '\u2705 \u6b63\u5e38'; spdTd.style.color = 'var(--primary)'; } \n            else { latTd.style.color = '#ff9500'; spdTd.textContent = '\u26a0\ufe0f \u8f83\u9ad8'; spdTd.style.color = '#ff9500'; }\n        }\n        function sortTableByLatency(tbody) {\n            const rows = Array.from(tbody.querySelectorAll('.test-row'));\n            rows.sort((a, b) => {\n                const msA = parseInt(a.querySelector('.latency').getAttribute('data-ms') || 9999);\n                const msB = parseInt(b.querySelector('.latency').getAttribute('data-ms') || 9999);\n                return msA - msB;\n            });\n            rows.forEach(row => tbody.appendChild(row));\n        }\n        async function sendDnsRequest(ips, btnElement) {\n            const originalText = btnElement.textContent;\n            btnElement.textContent = '\ud83d\udd04 \u66f4\u65b0 DNS \u4e2d...'; btnElement.disabled = true;\n            try {\n                const res = await fetch('/api/update-dns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ips }) });\n                const data = await res.json();\n                if(data.success) { showToast(data.message); btnElement.textContent = '\u2705 \u66f4\u65b0\u6210\u529f'; loadDNS(); } \n                else { showToast('\u274c \u9519\u8bef: ' + (data.error || '')); btnElement.textContent = originalText; }\n            } catch(e) { showToast('\u274c \u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u91cd\u8bd5'); btnElement.textContent = originalText; } \n            finally { setTimeout(() => { if(btnElement.textContent === '\u2705 \u66f4\u65b0\u6210\u529f') btnElement.textContent = originalText; btnElement.disabled = false; }, 3000); }\n        }\n        function updateSingleDns(ip, btnElement) {\n            if(!confirm(`\u786e\u5b9a\u8981\u5c06\u57df\u540d\u89e3\u6790\u5230\uff1a\\\n${ip} \\\n\u8b66\u544a\uff1a\u8fd9\u4f1a\u8986\u76d6\u57df\u540d\u4e0b\u7684\u6240\u6709\u89e3\u6790\u8bb0\u5f55\uff01`)) return;\n            sendDnsRequest([ip], btnElement);\n        }\n        \n        \n        async function appendSelectedToDns() {\n            const checks = document.querySelectorAll('#testTableBody .ip-checkbox:checked');\n            if (checks.length === 0) return showToast('\u672a\u9009\u62e9\u4efb\u4f55\u8282\u70b9');\n            \n            const ips = Array.from(checks).map(c => c.value);\n            const btn = document.getElementById('btnAppendDns');\n            btn.disabled = true;\n            btn.innerText = '\u8ffd\u52a0\u4e2d...';\n            \n            try {\n                const res = await fetch('/api/update-dns', {\n                    method: 'POST',\n                    headers: {'Content-Type':'application/json'},\n                    body: JSON.stringify({ ips, append: true })\n                });\n                const data = await res.json();\n                if (data.success) {\n                    showToast('\ud83c\udf89 \u8ffd\u52a0\u6210\u529f\uff01DNS \u8bb0\u5f55\u5df2\u540c\u6b65\u66f4\u65b0');\n                    if (typeof loadDNS === 'function') loadDNS();\n                } else {\n                    showToast('\u274c \u8ffd\u52a0\u5931\u8d25: ' + (data.error || '\u672a\u77e5\u9519\u8bef'));\n                }\n            } catch (e) {\n                showToast('\u274c \u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u91cd\u8bd5');\n            } finally {\n                btn.disabled = false;\n                btn.innerText = '\u2795 \u8ffd\u52a0\u9009\u4e2d\u8282\u70b9\u5230 DNS';\n            }\n        }\n\n        const PRESET_IPS = {\n            mobile: ['104.17.0.0/16', '104.19.0.0/16', '198.41.0.0/16', '198.41.128.0/17', '104.16.0.0/12'],\n            telecom: ['162.159.0.0/16', '162.158.0.0/15', '162.159.45.0/21', '162.159.39.0/21', '172.64.0.0/17', '172.64.52.0/21', '108.162.198.0/21'],\n            unicom: ['172.64.79.1/24', '108.162.198.1/24', '172.64.32.1/24', '198.41.216.1/24', '198.41.219.1/24']\n        };\n\n        function cidrToIpArray(cidr, maxCount = 200) {\n            const [baseIp, prefixSize] = cidr.split('/');\n            const prefix = parseInt(prefixSize, 10);\n            \n            const ipParts = baseIp.split('.').map(Number);\n            let ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];\n            \n            const mask = ~((1 << (32 - prefix)) - 1);\n            const network = ipNum & mask;\n            const broadcast = network | ~mask;\n            \n            const ips = [];\n            const countToGen = Math.min(broadcast - network - 1, maxCount);\n            \n            for(let i=0; i<countToGen; i++) {\n                const randomOffset = Math.floor(Math.random() * (broadcast - network - 1)) + 1;\n                const targetIpNum = network + randomOffset;\n                const ipStr = [\n                    (targetIpNum >>> 24) & 255,\n                    (targetIpNum >>> 16) & 255,\n                    (targetIpNum >>> 8) & 255,\n                    targetIpNum & 255\n                ].join('.');\n                ips.push(ipStr);\n            }\n            return ips;\n        }\n\n        function toggleOptCustomMode(mode) {\n            const countSel = document.getElementById('optCount');\n            const latSel = document.getElementById('optLatency');\n            const customCount = document.getElementById('optCustomCount');\n            const customLat = document.getElementById('optCustomLatency');\n            if (mode === 'custom') {\n                if (countSel) { countSel.value = 'custom'; onOptCountChange('custom'); }\n                if (latSel) { latSel.value = 'custom'; onOptLatencyChange('custom'); }\n                showToast('\ud83d\udee0\ufe0f \u5df2\u5f00\u542f\u81ea\u5b9a\u4e49\u4f18\u9009\uff1a\u53ef\u81ea\u7531\u52fe\u9009\u8fd0\u8425\u5546\u3001\u81ea\u5b9a\u4e49\u6570\u91cf\u4e0e\u5ef6\u8fdf');\n            } else {\n                if (countSel) { countSel.value = '10'; onOptCountChange('10'); }\n                if (latSel) { latSel.value = '300'; onOptLatencyChange('300'); }\n                document.getElementById('optMobile').checked = true;\n                document.getElementById('optTelecom').checked = true;\n                document.getElementById('optUnicom').checked = true;\n                showToast('\u26a1 \u5df2\u5207\u6362\u4e3a\u9884\u8bbe\u4e09\u7f51\u4f18\u9009');\n            }\n        }\n\n        function onOptCountChange(val) {\n            const customInput = document.getElementById('optCustomCount');\n            if (customInput) customInput.style.display = (val === 'custom') ? 'inline-block' : 'none';\n        }\n\n        function onOptLatencyChange(val) {\n            const customInput = document.getElementById('optCustomLatency');\n            if (customInput) customInput.style.display = (val === 'custom') ? 'inline-block' : 'none';\n        }\n\n        function toggleOptCustomMode(mode) {\n            const countSel = document.getElementById('optCount');\n            const latSel = document.getElementById('optLatency');\n            const customCount = document.getElementById('optCustomCount');\n            const customLat = document.getElementById('optCustomLatency');\n            if (mode === 'custom') {\n                if (countSel) { countSel.value = 'custom'; onOptCountChange('custom'); }\n                if (latSel) { latSel.value = 'custom'; onOptLatencyChange('custom'); }\n                showToast('\ud83d\udee0\ufe0f \u5df2\u5f00\u542f\u81ea\u5b9a\u4e49\u4f18\u9009\uff1a\u53ef\u81ea\u7531\u52fe\u9009\u8fd0\u8425\u5546\u3001\u81ea\u5b9a\u4e49\u6570\u91cf\u4e0e\u5ef6\u8fdf');\n            } else {\n                if (countSel) { countSel.value = '10'; onOptCountChange('10'); }\n                if (latSel) { latSel.value = '300'; onOptLatencyChange('300'); }\n                document.getElementById('optMobile').checked = true;\n                document.getElementById('optTelecom').checked = true;\n                document.getElementById('optUnicom').checked = true;\n                showToast('\u26a1 \u5df2\u5207\u6362\u4e3a\u9884\u8bbe\u4e09\u7f51\u4f18\u9009');\n            }\n        }\n\n        function onOptCountChange(val) {\n            const customInput = document.getElementById('optCustomCount');\n            if (customInput) customInput.style.display = (val === 'custom') ? 'inline-block' : 'none';\n        }\n\n        function onOptLatencyChange(val) {\n            const customInput = document.getElementById('optCustomLatency');\n            if (customInput) customInput.style.display = (val === 'custom') ? 'inline-block' : 'none';\n        }\n\n        async function startFixedIpOptimization() {\n            const doMobile = document.getElementById('optMobile').checked;\n            const doTelecom = document.getElementById('optTelecom').checked;\n            const doUnicom = document.getElementById('optUnicom').checked;\n            \n            if(!doMobile && !doTelecom && !doUnicom) return showToast('\u81f3\u5c11\u9009\u62e9\u4e00\u4e2a\u8fd0\u8425\u5546');\n            \n            let targetCount = 10;\n            const countVal = document.getElementById('optCount').value;\n            if (countVal === 'custom') {\n                targetCount = parseInt(document.getElementById('optCustomCount').value || '10', 10);\n            } else {\n                targetCount = parseInt(countVal, 10);\n            }\n            if (isNaN(targetCount) || targetCount <= 0) targetCount = 10;\n\n            let latencyLimit = 300;\n            const latVal = document.getElementById('optLatency').value;\n            if (latVal === 'custom') {\n                latencyLimit = parseInt(document.getElementById('optCustomLatency').value || '300', 10);\n            } else {\n                latencyLimit = parseInt(latVal, 10);\n            }\n            if (isNaN(latencyLimit) || latencyLimit <= 0) latencyLimit = 300;\n            \n            const selectedOps = [];\n            if (doMobile) selectedOps.push('\u79fb\u52a8');\n            if (doTelecom) selectedOps.push('\u7535\u4fe1');\n            if (doUnicom) selectedOps.push('\u8054\u901a');\n            \n            const statusTxt = document.getElementById('statusText');\n            statusTxt.innerHTML = `\ud83d\ude80 \u6b63\u5728\u8fdb\u884c\u56fa\u5b9aIP\u6bb5\u4f18\u9009 [${selectedOps.join('/')}] \u76ee\u6807: ${targetCount}\u4e2a, \u5ef6\u8fdf: \u2264${latencyLimit}ms...`;\n            showToast(`\ud83d\ude80 \u5f00\u59cb\u4f18\u9009: ${selectedOps.join('/')}\uff0c\u4e0a\u9650 \u2264${latencyLimit}ms (\u76ee\u6807${targetCount}\u4e2a)`);\n            \n            const tbody = document.getElementById('testTableBody');\n            if (tbody.innerText.includes('\u6682\u65e0\u6570\u636e')) tbody.innerHTML = '';\n            \n            const operators = [];\n            if(doMobile) operators.push({name: '\u79fb\u52a8', cidrs: PRESET_IPS.mobile});\n            if(doTelecom) operators.push({name: '\u7535\u4fe1', cidrs: PRESET_IPS.telecom});\n            if(doUnicom) operators.push({name: '\u8054\u901a', cidrs: PRESET_IPS.unicom});\n            \n            let totalFoundCount = 0;\n\n            const existDnsIps = Array.from(document.getElementById('dnsStatus').querySelectorAll('span')).map(s => s.innerText.split('|')[1]?.trim()).filter(Boolean);\n            const existTableIps = Array.from(document.querySelectorAll('.ip-checkbox')).map(c => c.value);\n            const excludeIps = new Set([...existDnsIps, ...existTableIps]);\n\n            for(const op of operators) {\n                let foundCount = 0;\n                let batchSize = 15;\n                let testedCount = 0;\n                \n                statusTxt.innerHTML = `\u6b63\u5728\u4f18\u9009 ${op.name}... \u5df2\u627e\u5230: 0 / ${targetCount}`;\n                showToast(`\u6b63\u5728\u4f18\u9009 ${op.name}...`);\n                \n                while(foundCount < targetCount) {\n                    let candidates = [];\n                    for(const cidr of op.cidrs) {\n                        candidates = candidates.concat(cidrToIpArray(cidr, 20).filter(ip => !excludeIps.has(ip))); \n                    }\n                    candidates.sort(() => Math.random() - 0.5);\n                    candidates = candidates.slice(0, batchSize);\n                    \n                    if (candidates.length === 0) {\n                        break; // No more unique IPs to test in this operator's CIDRs\n                    }\n\n                    candidates.forEach(ip => excludeIps.add(ip));\n                    \n                    const promises = candidates.map(async ip => {\n                        testedCount++;\n                        const tr = document.createElement('tr');\n                        tr.className = 'test-row';\n                        tr.innerHTML = `<td data-label=\"\u52fe\u9009\u8282\u70b9\" style=\"text-align: center;\"><input type=\"checkbox\" class=\"ip-checkbox row-checkbox\" value=\"${ip}\" checked></td>`\n                            + `<td data-label=\"\u4e13\u5c5e\u8282\u70b9\"><strong class=\"ip-text\" style=\"color:var(--primary);cursor:pointer;font-family:monospace;\" onclick=\"copyTxt('${ip}')\" title=\"\u70b9\u51fb\u590d\u5236\">${ip}</strong></td>`\n                            + `<td data-label=\"\u9884\u4f30\u5ef6\u8fdf\" class=\"latency\" data-ms=\"9999\" style=\"font-weight: 600; color: #888;\">\u6d4b\u7b97\u4e2d...</td>`\n                            + `<td data-label=\"\u8fde\u901a\u72b6\u6001\" class=\"speed\" style=\"color: #888;\">-</td>`\n                            + `<td data-label=\"\u8bb0\u5f55/\u5f52\u5c5e\u5730\" class=\"loc\" style=\"color: #666;\">\u7b49\u5f85\u89e3\u6790</td>`\n                            + `<td data-label=\"\u5feb\u6377\u64cd\u4f5c\"><button class=\"btn-dns\" disabled>\u552f\u4e00\u89e3\u6790</button></td>`;\n                        tbody.insertBefore(tr, tbody.firstChild);\n\n                        statusTxt.innerHTML = `\u6b63\u5728\u4f18\u9009 ${op.name}... \u6d4b\u8bd5\u4e2d (${testedCount} \u6b21), \u5df2\u627e\u5230: ${foundCount} / ${targetCount}`;\n\n                        await doLocalPing(ip, tr, op.name + '\u4f18\u9009');\n                        \n                        const latTd = tr.querySelector('.latency');\n                        const ms = parseInt(latTd.getAttribute('data-ms'), 10);\n                        if (!isNaN(ms) && ms <= latencyLimit) {\n                            return true;\n                        } else {\n                            const chk = tr.querySelector('.ip-checkbox');\n                            if (chk) chk.checked = false;\n                            return false;\n                        }\n                    });\n                    \n                    const results = await Promise.all(promises);\n                    for(const success of results) {\n                        if(success) {\n                            foundCount++;\n                            totalFoundCount++;\n                            if (foundCount >= targetCount) break;\n                        }\n                    }\n                }\n            }\n            sortTableByLatency(tbody);\n            statusTxt.innerHTML = `\u2705 \u56fa\u5b9aIP\u6bb5\u4f18\u9009\u5b8c\u6210\uff01\u5171\u627e\u5230 ${totalFoundCount} \u4e2a\u6ee1\u8db3\u6761\u4ef6 (\u2264${latencyLimit}ms) \u7684\u65b0\u589e\u4f18\u8d28\u8282\u70b9\uff08\u5df2\u6309\u5ef6\u8fdf\u4ece\u4f4e\u5230\u9ad8\u5347\u5e8f\u6392\u5217\uff09\u3002`;\n            showToast('\u2705 \u4f18\u9009\u5b8c\u6210\uff01');\n        }\n        function appendIpToTable(ip, opName, duration) {\n            const tbody = document.getElementById('testTableBody');\n            const tr = document.createElement('tr');\n            tr.className = 'test-row';\n            tr.innerHTML = `\n                <td style=\"text-align: center;\"><input type=\"checkbox\" class=\"ip-checkbox\" value=\"${ip}\" checked></td>\n                <td style=\"font-family: monospace; color: var(--primary); cursor: pointer;\" onclick=\"copyText('${ip}')\">${ip}</td>\n                <td class=\"latency\" data-ms=\"${duration}\"><span style=\"color:#34c759; font-weight:bold;\">${duration} ms</span></td>\n                <td><span style=\"color:#34c759; font-weight:bold;\">\u8fde\u901a\u826f\u597d</span></td>\n                <td><span class=\"badge\" style=\"background:rgba(52,199,89,0.1); color:#34c759;\">${opName}\u4f18\u9009</span></td>\n                <td>-</td>\n            `;\n            tbody.appendChild(tr);\n        }\n\n        function updateSelectedToDns() {\n            const btn = document.getElementById('btnSelectedDns');\n            const ips = getSelectedIps();\n            if (ips.length === 0) return showToast('\u26a0\ufe0f \u8bf7\u5148\u52fe\u9009\u60a8\u60f3\u4f7f\u7528\u7684\u8282\u70b9');\n            if(!confirm(`\u5c06\u5e94\u7528\u52fe\u9009\u7684 ${ips.length} \u4e2a\u8282\u70b9\uff1a\\\n${ips.join('\\n')}\\\n\u786e\u5b9a\u66f4\u65b0 DNS \u8bb0\u5f55\u5417\uff1f`)) return;\n            sendDnsRequest(ips, btn);\n        }\n        function updateTop3ToDns() {\n            const btn = document.getElementById('btnTop3Dns');\n            const rows = document.querySelectorAll('#testTableBody .test-row');\n            let topIps = [];\n            for(let i = 0; i < rows.length; i++) {\n                const ms = parseInt(rows[i].querySelector('.latency').getAttribute('data-ms'));\n                if(ms < 2000) topIps.push(rows[i].querySelector('.ip-text').textContent);\n                if(topIps.length === 3) break;\n            }\n            if(topIps.length === 0) return showToast('\u26a0\ufe0f \u6ca1\u627e\u5230\u53ef\u7528\u8282\u70b9\uff0c\u8bf7\u5148\u6d4b\u901f');\n            if(!confirm(`\u5c06\u4e3a\u60a8\u5206\u53d1\u5f53\u524d\u6700\u5feb\u7684 ${topIps.length} \u4e2a\u8282\u70b9\uff1a\\\n${topIps.join('\\n')}\\\n\u786e\u5b9a\u66f4\u65b0 DNS \u8bb0\u5f55\u5417\uff1f`)) return;\n            sendDnsRequest(topIps, btn);\n        }\n        async function loadDNS() {\n            try {\n                const res = await fetch('/api/get-dns'); const data = await res.json(); const container = document.getElementById('dnsStatus');\n                if (data.success && data.result) {\n                    const records = data.result.filter(r => r.type === 'A' || r.type === 'AAAA' || r.type === 'CNAME');\n                    if (records.length === 0) container.innerHTML = '<span class=\"badge\" style=\"background:rgba(255,149,0,0.1);color:#ff9500;\">\u6682\u65e0\u89e3\u6790\u8bb0\u5f55</span>';\n                    else container.innerHTML = records.map(r => `<span class=\"badge\" style=\"background:rgba(0,113,227,0.1);color:var(--primary);border:1px solid rgba(0,113,227,0.2);\">${r.type} | ${r.content}</span>`).join('');\n                } else container.innerHTML = `<span class=\"badge\" style=\"background:rgba(255,59,48,0.1);color:#ff3b30;\">${data.error || '\u83b7\u53d6\u5931\u8d25'}</span>`;\n            } catch (e) { document.getElementById('dnsStatus').innerHTML = '<span class=\"badge\" style=\"background:rgba(255,59,48,0.1);color:#ff3b30;\">\u7f51\u7edc\u5f02\u5e38</span>'; }\n        }\n        \n        function logout() {\n            document.cookie = \"admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;\";\n            window.location.reload();\n        }\n\n        // \ud83d\ude80 \u6838\u5fc3\u521d\u59cb\u5316\uff1a\u6838\u5fc3\u6570\u636e\u5e76\u53d1\u79d2\u5f00\uff0c\u7edd\u5bf9\u4e0d\u88ab\u7b2c\u4e09\u65b9\u56fe\u6807\u5e93\u6216\u5916\u94fe\u963b\u585e\n        initAdaptiveWallpaper();\n        load();\n        loadDNS();\n        loadSavedCustomApis();\n            loadWhitelistSettings();\n        loadIcons();\n\n        // ==========================================\n        // \ud83c\udf1f \u65b0\u589e\uff1aRTT \u5b9e\u65f6\u76d1\u6d4b\u5f15\u64ce (\u6bcf\u9694 3 \u79d2\u63a2\u6d4b\u4e00\u6b21)\n        // ==========================================\n        async function measureRTT() {\n            const start = performance.now();\n            try {\n                // \u52a0\u4e0a\u65f6\u95f4\u6233\u5f3a\u5236\u7ed5\u8fc7\u6d4f\u89c8\u5668\u672c\u5730\u7f13\u5b58\n                await fetch('/__client_rtt__?t=' + Date.now(), { mode: 'no-cors', cache: 'no-store' });\n                const rtt = Math.round(performance.now() - start);\n                const rttEl = document.getElementById('rttValue');\n                const dotEl = document.getElementById('rttDot');\n                \n                rttEl.textContent = rtt + ' ms';\n                \n                // \u6839\u636e\u5ef6\u8fdf\u6539\u53d8\u547c\u5438\u706f\u989c\u8272\n                if (rtt < 80) {\n                    dotEl.style.background = '#34c759'; dotEl.style.boxShadow = '0 0 8px #34c759';\n                    rttEl.style.color = '#34c759';\n                } else if (rtt < 200) {\n                    dotEl.style.background = '#ff9500'; dotEl.style.boxShadow = '0 0 8px #ff9500';\n                    rttEl.style.color = '#ff9500';\n                } else {\n                    dotEl.style.background = '#ff3b30'; dotEl.style.boxShadow = '0 0 8px #ff3b30';\n                    rttEl.style.color = '#ff3b30';\n                }\n            } catch (e) {\n                document.getElementById('rttValue').textContent = '\u65ad\u8fde';\n                document.getElementById('rttDot').style.background = '#ff3b30';\n            }\n        }\n        \n        // \u5148\u7acb\u5373\u6267\u884c\u4e00\u6b21\uff0c\u7136\u540e\u6bcf 3 \u79d2\u5faa\u73af\u63a2\u6d4b\n        measureRTT();\n        setInterval(measureRTT, 3000);\n\n    // \ud83d\ude80 \u65b0\u589e\uff1a\u524d\u7aef\u63a2\u9488\u81ea\u52a8\u68c0\u6d4b\u811a\u672c\n        async function fetchCfTrace() {\n            try {\n                const res = await fetch('/api/trace');\n                const data = await res.json();\n                if (data.success) {\n                    // \u62fc\u63a5\u8bbf\u5ba2\u5165\u53e3\u4fe1\u606f\uff1a\u56fd\u5bb6 \u57ce\u5e02 (\u673a\u623f\u4ee3\u7801)\n                    let entryText = data.entryCountry;\n                    if (data.entryCity && data.entryCity !== '\u672a\u77e5') entryText += ' ' + data.entryCity;\n                    entryText += ' (' + data.entryColo + ')';\n                    \n                    document.getElementById('trace-entry').innerText = entryText;\n                    \n                    // \u843d\u5730\u673a\u623f\u5904\u7406\n                    const egressText = data.egressColo;\n                    const egressElem = document.getElementById('trace-egress');\n                    egressElem.innerText = egressText;\n                    \n                    // \u6838\u5fc3\u903b\u8f91\uff1a\u5982\u679c\u5165\u53e3\u548c\u843d\u5730\u673a\u623f\u4e0d\u4e00\u81f4\uff0c\u663e\u793a\u9ad8\u4eae\u63d0\u793a\uff08\u667a\u80fd\u8c03\u5ea6\u89e6\u53d1\uff09\n                    if (data.entryColo !== egressText && egressText !== '\u63a2\u6d4b\u4e2d...' && egressText !== '\u83b7\u53d6\u5931\u8d25') {\n                        egressElem.style.color = '#ff9500'; // \u53d8\u6210\u6a58\u9ec4\u8272\u8b66\u793a\n                        egressElem.innerText += ' (\u667a\u80fd\u653e\u7f6e/\u56de\u6e90)';\n                    }\n                }\n            } catch(e) {\n                document.getElementById('trace-entry').innerText = '\u83b7\u53d6\u8d85\u65f6';\n                document.getElementById('trace-egress').innerText = '\u83b7\u53d6\u8d85\u65f6';\n            }\n        }\n        \n        // \u5f53\u7f51\u9875\u52a0\u8f7d\u5b8c\u6210\u65f6\uff0c\u5ef6\u8fdf0.5\u79d2\u6267\u884c\u63a2\u9488\u626b\u63cf\uff08\u907f\u514d\u5361\u987f\u4e3b\u9875\u6e32\u67d3\uff09\n        window.addEventListener('DOMContentLoaded', () => {\n            initPlacement();\n            setTimeout(fetchCfTrace, 500);\n        });\n    // \ud83d\ude80 \u65b0\u589e\uff1a\u5168\u4e91\u5382\u5546\u8282\u70b9\u6570\u636e\u5e93 (\u5305\u542b Cloudflare \u652f\u6301\u7684\u6240\u6709\u4e3b\u8981\u533a\u57df)\n        var cfRegions = {\n            aws: [\n                { label: \"\ud83c\udded\ud83c\uddf0 \u4e2d\u56fd\u9999\u6e2f\", value: \"aws:ap-east-1\" },\n                { label: \"\ud83c\uddef\ud83c\uddf5 \u65e5\u672c (\u4e1c\u4eac)\", value: \"aws:ap-northeast-1\" },\n                { label: \"\ud83c\uddef\ud83c\uddf5 \u65e5\u672c (\u5927\u962a)\", value: \"aws:ap-northeast-3\" },\n                { label: \"\ud83c\uddf8\ud83c\uddec \u65b0\u52a0\u5761\", value: \"aws:ap-southeast-1\" },\n                { label: \"\ud83c\uddf0\ud83c\uddf7 \u97e9\u56fd (\u9996\u5c14)\", value: \"aws:ap-northeast-2\" },\n                { label: \"\ud83c\uddfa\ud83c\uddf8 \u7f8e\u56fd\u897f\u90e8 (\u52a0\u5dde)\", value: \"aws:us-west-1\" },\n                { label: \"\ud83c\uddfa\ud83c\uddf8 \u7f8e\u56fd\u897f\u90e8 (\u4fc4\u52d2\u5188)\", value: \"aws:us-west-2\" },\n                { label: \"\ud83c\uddfa\ud83c\uddf8 \u7f8e\u56fd\u4e1c\u90e8 (\u5f17\u5409\u5c3c\u4e9a)\", value: \"aws:us-east-1\" },\n                { label: \"\ud83c\udde6\ud83c\uddfa \u6fb3\u5927\u5229\u4e9a (\u6089\u5c3c)\", value: \"aws:ap-southeast-2\" },\n                { label: \"\ud83c\uddee\ud83c\uddf3 \u5370\u5ea6 (\u5b5f\u4e70)\", value: \"aws:ap-south-1\" },\n                { label: \"\ud83c\uddec\ud83c\udde7 \u82f1\u56fd (\u4f26\u6566)\", value: \"aws:eu-west-2\" },\n                { label: \"\ud83c\udde9\ud83c\uddea \u5fb7\u56fd (\u6cd5\u5170\u514b\u798f)\", value: \"aws:eu-central-1\" }\n            ],\n            gcp: [\n                { label: \"\ud83c\uddf9\ud83c\uddfc \u4e2d\u56fd\u53f0\u6e7e (\u5f70\u5316)\", value: \"gcp:asia-east1\" },\n                { label: \"\ud83c\udded\ud83c\uddf0 \u4e2d\u56fd\u9999\u6e2f\", value: \"gcp:asia-east2\" },\n                { label: \"\ud83c\uddef\ud83c\uddf5 \u65e5\u672c (\u4e1c\u4eac)\", value: \"gcp:asia-northeast1\" },\n                { label: \"\ud83c\uddef\ud83c\uddf5 \u65e5\u672c (\u5927\u962a)\", value: \"gcp:asia-northeast2\" },\n                { label: \"\ud83c\uddf0\ud83c\uddf7 \u97e9\u56fd (\u9996\u5c14)\", value: \"gcp:asia-northeast3\" },\n                { label: \"\ud83c\uddf8\ud83c\uddec \u65b0\u52a0\u5761\", value: \"gcp:asia-southeast1\" },\n                { label: \"\ud83c\uddfa\ud83c\uddf8 \u7f8e\u56fd\u897f\u90e8 (\u6d1b\u6749\u77f6)\", value: \"gcp:us-west2\" },\n                { label: \"\ud83c\uddfa\ud83c\uddf8 \u7f8e\u56fd\u897f\u90e8 (\u4fc4\u52d2\u5188)\", value: \"gcp:us-west1\" },\n                { label: \"\ud83c\uddfa\ud83c\uddf8 \u7f8e\u56fd\u4e1c\u90e8 (\u5f17\u5409\u5c3c\u4e9a)\", value: \"gcp:us-east4\" },\n                { label: \"\ud83c\udde6\ud83c\uddfa \u6fb3\u5927\u5229\u4e9a (\u6089\u5c3c)\", value: \"gcp:australia-southeast1\" },\n                { label: \"\ud83c\uddec\ud83c\udde7 \u82f1\u56fd (\u4f26\u6566)\", value: \"gcp:europe-west2\" },\n                { label: \"\ud83c\udde9\ud83c\uddea \u5fb7\u56fd (\u6cd5\u5170\u514b\u798f)\", value: \"gcp:europe-west3\" }\n            ],\n            azure: [\n                { label: \"\ud83c\udded\ud83c\uddf0 \u4e2d\u56fd\u9999\u6e2f (East Asia)\", value: \"azure:eastasia\" },\n                { label: \"\ud83c\uddf8\ud83c\uddec \u65b0\u52a0\u5761 (Southeast Asia)\", value: \"azure:southeastasia\" },\n                { label: \"\ud83c\uddef\ud83c\uddf5 \u65e5\u672c\u4e1c\u90e8 (\u4e1c\u4eac)\", value: \"azure:japaneast\" },\n                { label: \"\ud83c\uddef\ud83c\uddf5 \u65e5\u672c\u897f\u90e8 (\u5927\u962a)\", value: \"azure:japanwest\" },\n                { label: \"\ud83c\uddf0\ud83c\uddf7 \u97e9\u56fd\u4e2d\u90e8 (\u9996\u5c14)\", value: \"azure:koreacentral\" },\n                { label: \"\ud83c\uddfa\ud83c\uddf8 \u7f8e\u56fd\u897f\u90e8 (West US)\", value: \"azure:westus\" },\n                { label: \"\ud83c\uddfa\ud83c\uddf8 \u7f8e\u56fd\u4e1c\u90e8 (East US)\", value: \"azure:eastus\" },\n                { label: \"\ud83c\uddec\ud83c\udde7 \u82f1\u56fd\u5357\u90e8 (\u4f26\u6566)\", value: \"azure:uksouth\" },\n                { label: \"\ud83c\uddf3\ud83c\uddf1 \u897f\u6b27 (\u8377\u5170)\", value: \"azure:westeurope\" }\n            ]\n        };\n\n        // \ud83d\ude80 \u65b0\u589e\uff1a\u8054\u52a8\u83dc\u5355\u5904\u7406\u903b\u8f91\n        function handleModeChange() {\n            var mode = document.getElementById('cf-mode-select').value;\n            var regionSelect = document.getElementById('cf-region-select');\n            var customInput = document.getElementById('cf-custom-input');\n            \n            regionSelect.style.display = 'none';\n            customInput.style.display = 'none';\n            \n            if (mode === 'aws' || mode === 'gcp' || mode === 'azure') {\n                regionSelect.style.display = 'block';\n                regionSelect.innerHTML = ''; \n                var regions = cfRegions[mode];\n                regions.forEach(function(r) {\n                    var opt = document.createElement('option');\n                    opt.value = r.value;\n                    opt.innerText = r.label;\n                    regionSelect.appendChild(opt);\n                });\n            } else if (mode === 'custom') {\n                customInput.style.display = 'block';\n            }\n        }\n\n        // \ud83d\ude80 \u65b0\u589e\uff1a\u8c03\u7528\u90e8\u7f72\u4fee\u6539\u63a5\u53e3\n        async function updatePlacement() {\n            var statusElem = document.getElementById('place-status');\n            var modeVal = document.getElementById('cf-mode-select').value;\n            var placementPayload = {};\n            \n            if (modeVal === 'aws' || modeVal === 'gcp' || modeVal === 'azure') {\n                var regionVal = document.getElementById('cf-region-select').value;\n                placementPayload = { region: regionVal };\n            } else if (modeVal === 'custom') {\n                var customVal = document.getElementById('cf-custom-input').value;\n                if (!customVal || customVal.trim() === '') {\n                    statusElem.innerText = \"\u274c \u8bf7\u586b\u5199\u81ea\u5b9a\u4e49\u533a\u57df\u4ee3\u7801\uff08\u5982 gcp:asia-east2\uff09\";\n                    statusElem.style.color = \"#ff3b30\";\n                    return;\n                }\n                placementPayload = { region: customVal.trim() };\n            } else {\n                placementPayload = JSON.parse(modeVal);\n            }\n\n            statusElem.innerText = \"\u23f3 \u6b63\u5728\u63d0\u4ea4\u8bf7\u6c42\uff0c\u8bf7\u7a0d\u5019...\";\n            statusElem.style.color = \"#ff9500\";\n            \n            try {\n                var res = await fetch('/api/placement', {\n                    method: 'POST',\n                    headers: { 'Content-Type': 'application/json' },\n                    body: JSON.stringify({ placement: placementPayload })\n                });\n                var data = await res.json();\n                if (data.success) {\n                    statusElem.innerText = \"\u2705 \" + data.msg;\n                    statusElem.style.color = \"#34c759\";\n                } else {\n                    statusElem.innerText = \"\u274c \" + data.msg;\n                    statusElem.style.color = \"#ff3b30\";\n                }\n            } catch(e) {\n                statusElem.innerText = \"\u274c \u7f51\u7edc\u9519\u8bef: \" + e.message;\n                statusElem.style.color = \"#ff3b30\";\n            }\n        }\n    // \ud83d\ude80 \u9b54\u6cd5\u529f\u80fd\uff1a\u81ea\u52a8\u7ee7\u627f\u73b0\u6709\u7684\u6a21\u5f0f\u9009\u9879 (\u589e\u5f3a\u7a33\u5b9a\u7248)\n        setTimeout(() => {\n            const sourceSelect = document.getElementById('mode');\n            const batchSelect = document.getElementById('batch-mode-select');\n            if (sourceSelect && batchSelect) {\n                batchSelect.innerHTML = sourceSelect.innerHTML;\n            }\n        }, 100); \n\n        // \ud83d\ude80 \u5168\u9009 / \u53d6\u6d88\u5168\u9009\u903b\u8f91\n        function toggleSelectAll(checkbox) {\n            const checkboxes = document.querySelectorAll('.node-cb');\n            checkboxes.forEach(cb => cb.checked = checkbox.checked);\n        }\n\n        // \ud83d\ude80 \u5e76\u53d1\u6279\u91cf\u4fee\u6539\u6a21\u5f0f\u903b\u8f91 (\u7ec8\u6781\u591a\u7ebf\u7a0b\u9010\u4e2a\u51fb\u7834\u7248)\n        async function batchUpdateModes() {\n            const statusElem = document.getElementById('batch-status');\n            const newMode = document.getElementById('batch-mode-select').value;\n            \n            const selectedPrefixes = Array.from(document.querySelectorAll('.node-cb:checked')).map(cb => cb.value);\n\n            if (selectedPrefixes.length === 0) {\n                statusElem.innerText = \"\u26a0\ufe0f \u8bf7\u5148\u6253\u52fe\u9700\u8981\u4fee\u6539\u7684\u8282\u70b9\uff01\";\n                statusElem.style.color = \"#ff9500\";\n                return;\n            }\n\n            if (!confirm(\"\u786e\u5b9a\u8981\u5c06\u52fe\u9009\u7684 \" + selectedPrefixes.length + \" \u4e2a\u8282\u70b9\u5207\u6362\u4e3a\u8be5\u6a21\u5f0f\u5417\uff1f\")) return;\n\n            statusElem.innerText = \"\u23f3 \u6b63\u5728\u591a\u7ebf\u7a0b\u5e76\u53d1\u4fee\u6539\u8282\u70b9...\";\n            statusElem.style.color = \"var(--primary)\";\n\n            try {\n                // 1. \u5148\u83b7\u53d6\u5f53\u524d\u6240\u6709\u7684\u8282\u70b9\u8be6\u7ec6\u6570\u636e\n                const getRes = await fetch('/api/routes');\n                const allRoutes = await getRes.json();\n                \n                // 2. \u7b5b\u9009\u51fa\u4f60\u8981\u4fee\u6539\u7684\u90a3\u4e9b\u8282\u70b9\n                const nodesToUpdate = allRoutes.filter(r => selectedPrefixes.includes(r.prefix));\n\n                // 3. \u6838\u5fc3\u9b54\u6cd5\uff1aPromise.all \u5e76\u53d1\uff01\u77ac\u95f4\u53d1\u51fa\u591a\u4e2a\u72ec\u7acb\u7684\u4fdd\u5b58\u8bf7\u6c42\n                await Promise.all(nodesToUpdate.map(async (r) => {\n                    const payload = Object.assign({}, r);\n                    payload.oldPrefix = r.prefix; \n                    payload.mode = newMode; \n                    \n                    const postRes = await fetch('/api/routes', {\n                        method: 'POST',\n                        headers: { 'Content-Type': 'application/json' },\n                        body: JSON.stringify(payload)\n                    });\n                    \n                    if (!postRes.ok) {\n                        throw new Error(\"\u8282\u70b9 \" + r.prefix + \" \u4fdd\u5b58\u5931\u8d25\");\n                    }\n                }));\n                \n                statusElem.innerText = \"\u2705 \u6279\u91cf\u4fee\u6539\u6210\u529f\uff01\";\n                statusElem.style.color = \"#34c759\";\n                setTimeout(() => location.reload(), 1000); \n\n            } catch (e) {\n                statusElem.innerText = \"\u274c \u5931\u8d25: \" + e.message;\n                statusElem.style.color = \"#ff3b30\";\n            }\n        }\n    async function deployWorker() {\n            const codeArea = document.getElementById('codeArea');\n            const fileInput = document.getElementById('fileInput');\n            let codeContent = codeArea.value;\n            if (fileInput.files.length > 0) {\n                const file = fileInput.files[0];\n                codeContent = await file.text();\n            }\n            if (!codeContent.trim()) {\n                alert('⚠️ 失败：请先粘贴代码，或者选择一个 .js 文件！');\n                return;\n            }\n            if (!confirm('🚨 危险操作确认 🚨\\n\\n你即将强制覆盖当前 Worker 的代码。\\n如果新代码有错误，此面板将会瘫痪，只能去网页后台抢修！\\n\\n确定代码 100% 正确并覆盖吗？')) return;\n            const btn = document.getElementById('deployBtn');\n            const originalText = btn.innerText;\n            btn.innerText = '⏳ 正在与 Cloudflare 通信并部署...';\n            btn.disabled = true;\n            btn.style.opacity = '0.7';\n            try {\n                const res = await fetch('/api/deploy', {\n                    method: 'POST',\n                    headers: { 'Content-Type': 'application/json' },\n                    body: JSON.stringify({ newCode: codeContent })\n                });\n                const data = await res.json();\n                if (data.success) {\n                    alert('🎉 成功！' + data.msg + '\\n\\n点击确定后页面将自动刷新。');\n                    window.location.reload(); \n                } else {\n                    alert('❌ 部署失败：\\n' + JSON.stringify(data.error));\n                }\n            } catch (e) {\n                alert('🚨 异常：\\n' + e.message);\n            } finally {\n                btn.innerText = originalText;\n                btn.disabled = false;\n                btn.style.opacity = '1';\n            }\n        }\n        // ==========================================\n        // \ud83d\udfe2 \u5728\u7ebf\u66f4\u65b0\u6a21\u5757\n        // ==========================================\n        // \u8fd9\u91cc\u7684\u53d8\u91cf\u4f1a\u81ea\u52a8\u4ece\u4ee3\u7801\u6700\u9876\u7aef\u7684\u914d\u7f6e\u533a\u8bfb\u53d6\u6ce8\u5165\n        const CURRENT_VERSION = \"__DYNAMIC_CURRENT_VERSION__\"; \n        const GITHUB_RAW_URL = \"__DYNAMIC_GITHUB_RAW_URL__\"; \n        \n        let latestCode = \"\"; \n\n        function compareVersions(v1, v2) {\n            const p1 = String(v1 || '').replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);\n            const p2 = String(v2 || '').replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);\n            const len = Math.max(p1.length, p2.length);\n            for (let i = 0; i < len; i++) {\n                const num1 = p1[i] || 0;\n                const num2 = p2[i] || 0;\n                if (num1 > num2) return 1;\n                if (num1 < num2) return -1;\n            }\n            return 0;\n        }\n\n        async function checkForUpdates() {\n            if (!GITHUB_RAW_URL || GITHUB_RAW_URL.includes('这里填') || !GITHUB_RAW_URL.startsWith('http') || GITHUB_RAW_URL === '__DYNAMIC_GITHUB_RAW_URL__') {\n                return;\n            }\n            try {\n                const res = await fetch(GITHUB_RAW_URL + '?t=' + new Date().getTime());\n                if (!res.ok) return;\n                latestCode = await res.text();\n                \n                const versionMatch = latestCode.match(new RegExp('//\\\\s*VERSION:\\\\s*v?([\\\\d\\\\.]+)', 'i'));\n                if (versionMatch && versionMatch[1]) {\n                    const latestVersion = versionMatch[1];\n                    if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {\n                        document.getElementById('updateAlert').style.display = 'block';\n                        document.getElementById('updateMsg').innerText = '当前版本: v' + CURRENT_VERSION + ' | 发现最新版本: v' + latestVersion + ' (Github)';\n                    }\n                }\n            } catch (e) {\n                console.log('检测更新失败:', e);\n            }\n        }\n\n        async function doOnlineUpdate() {\n            if (!confirm('🚀 确定要从 GitHub 拉取最新版本并覆盖当前节点吗？\\n\\n（这将会保留你的所有环境变量和数据库绑定）')) return;\n            \n            const btn = document.getElementById('onlineUpdateBtn');\n            btn.innerText = '⏳ 正在拉取并部署...';\n            btn.disabled = true;\n            btn.style.opacity = '0.7';\n\n            try {\n                const res = await fetch('/api/deploy', {\n                    method: 'POST',\n                    headers: { 'Content-Type': 'application/json' },\n                    body: JSON.stringify({ newCode: latestCode })\n                });\n                const data = await res.json();\n                if (data.success) {\n                    alert('🎉 在线更新成功！\\n\\n点击确定后页面将自动刷新，畅享新版本！');\n                    window.location.reload(); \n                } else {\n                    alert('❌ 更新失败：\\n' + JSON.stringify(data.error));\n                }\n            } catch (e) {\n                alert('🚨 异常：\\n' + e.message);\n            } finally {\n                btn.innerText = '🚀 一键拉取并升级';\n                btn.disabled = false;\n                btn.style.opacity = '1';\n            }\n        }\n\n        // 页面加载完成后自动在后台静默检测更新\n        document.addEventListener('DOMContentLoaded', checkForUpdates);</script>\n    <style>\n    /* \u4fee\u6b63\u9875\u9762\u5e95\u90e8\u7559\u767d\uff0c\u9632\u6b62\u88ab Dock \u6321\u4f4f\uff0c\u5e26\u5b89\u5168\u533a\u81ea\u9002\u5e94 */\n    body { padding-bottom: calc(85px + env(safe-area-inset-bottom, 20px)) !important; }\n    \n    /* \u9875\u9762\u5207\u6362\u52a8\u753b */\n    .page-view { display: none; opacity: 0; animation: dsFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }\n    .page-view.active { display: block; opacity: 1; }\n    @keyframes dsFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\n\n    /* \u5e95\u90e8dock\u680fUI (\u6c89\u6d78\u5f0f\u5361\u7247\u5fae\u5706\u89d2 & \u89e6\u611f\u53cd\u9988) */\n    .ds-dock { \n        position: fixed; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); left: 50%; transform: translateX(-50%); \n        width: calc(100% - 24px); max-width: 540px; \n        background: var(--card); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); \n        border: 1px solid var(--border); border-radius: 30px; padding: 6px 10px; \n        display: flex; justify-content: space-around; gap: 6px; \n        box-shadow: 0 16px 36px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04); z-index: 9999; \n    }\n    .ds-dock-item { \n        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; \n        padding: 6px 12px; border-radius: 22px; color: var(--text-sec); font-size: 11px; \n        font-weight: 600; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); background: transparent; border: none; cursor: pointer; flex: 1; user-select: none; \n    }\n    .ds-dock-item:active { transform: scale(0.95); }\n    .ds-dock-item.active { color: var(--primary); background: rgba(0,113,227,0.12); }\n    .ds-dock-item svg { width: 20px; height: 20px; fill: currentColor; }\n</style>\n\n<nav class=\"ds-dock\">\n    <button class=\"ds-dock-item active\" onclick=\"switchDsView('nodes', this)\">\n        <svg viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"/></svg>\n        <span>\u8282\u70b9</span>\n    </button>\n    <button class=\"ds-dock-item\" onclick=\"switchDsView('speed', this)\">\n        <svg viewBox=\"0 0 24 24\"><path d=\"M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z\"/></svg>\n        <span>\u6d4b\u901f\u4e0eDNS</span>\n    </button>\n    <button class=\"ds-dock-item\" onclick=\"switchDsView('settings', this)\">\n        <svg viewBox=\"0 0 24 24\"><path d=\"M19.14 12.94c.04-.3.06-.61.06-.94 0-.33-.02-.64-.06-.94l2.02-1.58c.18-.14.23-.38.12-.56l-1.89-3.28c-.12-.19-.36-.26-.56-.18l-2.38.96c-.5-.38-1.06-.68-1.66-.88L14.45 3.5c-.04-.2-.2-.34-.4-.34h-3.78c-.2 0-.36.14-.4.34l-.3 2.52c-.6.2-1.16.5-1.66.88l-2.38-.96c-.2-.08-.44-.01-.56.18l-1.89 3.28c-.12.19-.07.42.12.56l2.02 1.58c-.04.3-.06.61-.06.94 0 .33.02.64.06.94l-2.02 1.58c-.18.14-.23.38-.12.56l1.89 3.28c.12.19.36.26.56.18l2.38-.96c.5.38 1.06.68 1.66.88l.3 2.52c.04.2.2.34.4.34h3.78c.2 0 .36-.14.4-.34l.3-2.52c.6-.2 1.16-.5 1.66-.88l2.38.96c.2.08.44.01.56-.18l1.89-3.28c.12-.19.07-.42-.12-.56l-2.02-1.58zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z\"/></svg>\n        <span>\u63a7\u5236\u9762\u677f</span>\n    </button>\n</nav>\n\n<script>\n// 1. \u5207\u6362\u9875\u9762\u7684\u6838\u5fc3\u903b\u8f91\nfunction switchDsView(viewId, btn) {\n    document.querySelectorAll('.ds-dock-item').forEach(b => b.classList.remove('active'));\n    btn.classList.add('active');\n    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));\n    document.getElementById('view-' + viewId).classList.add('active');\n    window.scrollTo({ top: 0, behavior: 'smooth' });\n}\n\n// 2. \u5c06\u539f\u7248\u8d85\u957f\u9875\u9762\uff0c\u667a\u80fd\u88c5\u8fdb 3 \u4e2a\u5206\u7c7b\u76d2\u5b50\u4e2d\nwindow.addEventListener('DOMContentLoaded', () => {\n    const container = document.querySelector('.container');\n    const contentWrap = document.querySelector('.content-wrap');\n    if (!container) return; \n\n    // \u7f6e\u9876\u6700\u9876\u90e8\u7684 header\n    const header = document.querySelector('.header');\n    if (header) container.insertBefore(header, container.firstChild);\n\n    // \u5efa\u7acb 3 \u4e2a\u5e72\u51c0\u7684\u865a\u62df\u623f\u95f4\n    const views = {\n        'nodes': document.createElement('div'),\n        'speed': document.createElement('div'),\n        'settings': document.createElement('div')\n    };\n    for (let k in views) {\n        views[k].id = 'view-' + k;\n        views[k].className = 'page-view';\n        if (k === 'nodes') views[k].classList.add('active');\n    }\n\n    // \u7528\u4e8e\u6682\u5b58\u5e95\u90e8\u58f0\u660e\u4fe1\u606f\u7684\u6570\u7ec4\n    let footers = []; \n\n    // \u667a\u80fd\u6293\u53d6\u5e76\u5206\u7c7b\n    function sortCard(el) {\n        if (!el || el === header || el.tagName === 'NAV' || el.id === 'toast' || el.classList.contains('page-view') || el.classList.contains('content-wrap')) return;\n        const text = el.innerText || el.innerHTML || '';\n        \n        // \u30101\u3011\u514d\u8d23\u58f0\u660e\u4e0e\u8054\u7cfb\u4f5c\u8005\uff1a\u5148\u6263\u7559\uff0c\u4e0d\u8981\u9a6c\u4e0a\u5206\u914d\uff01\n        if (text.includes('\u8054\u7cfb\u4f5c\u8005') || text.includes('\u514d\u8d23\u58f0\u660e') || text.includes('\u4ea4\u6d41\u7fa4')) {\n            footers.push(el);\n            return;\n        }\n        \n        // \u30102\u3011\u5206\u914d\u5230\u6d4b\u901f\u9875\n        if (text.includes('\u6d4b\u901f\u4e0e\u52a8\u6001 DNS') || text.includes('\u4e13\u5c5e\u7ebf\u8def\u6d4b\u901f') || text.includes('\u63d0\u53d6\u9884\u8bbe\u6e90') || text.includes('ITDog')) {\n            views['speed'].appendChild(el);\n            return;\n        }\n        \n        // \u30103\u3011\u5206\u914d\u5230\u63a7\u5236\u9762\u677f\u9875\uff08\u4ec5\u9650 Worker \u6838\u5fc3\u4e0e\u533a\u57df\u8c03\u5ea6\uff09\n        if (text.includes('\u6838\u5fc3\u5c42\u4ee3\u7801') || text.includes('Worker \u8c03\u5ea6\u6a21\u5f0f') || el.id === 'updateAlert' || el.id === 'cf-trace-card') {\n            views['settings'].appendChild(el);\n            return;\n        }\n        \n        // \u30104\u3011\u5269\u4e0b\u7684\u7edf\u7edf\u4e22\u8fdb\u3010\u8282\u70b9\u7ba1\u7406\u9875\u3011\uff08\u5b8c\u7f8e\u89e3\u51b3\u8868\u5355\u548c\u5217\u8868\u5206\u5bb6\u7684\u95ee\u9898\uff09\n        if (text.trim() !== \"\") {\n            views['nodes'].appendChild(el);\n        }\n    }\n\n    // \u6267\u884c\u6240\u6709\u5361\u7247\u7684\u642c\u5bb6\n    Array.from(container.children).forEach(sortCard);\n    if (contentWrap) {\n        Array.from(contentWrap.children).forEach(sortCard);\n        contentWrap.remove(); // \u9500\u6bc1\u539f\u672c\u7684\u5305\u88c5\u76d2\n    }\n\n    // \u3010\u89e3\u51b3 Bug\u3011\uff1a\u628a\u521a\u624d\u6263\u7559\u7684\u514d\u8d23\u58f0\u660e\u7b49\u5143\u7d20\uff0c\u8ffd\u52a0\u5230\u63a7\u5236\u9762\u677f\u7684\u6700\u672b\u5c3e\n    footers.forEach(f => views['settings'].appendChild(f));\n\n    // \u5c06 3 \u4e2a\u5206\u597d\u7c7b\u7684\u623f\u95f4\u653e\u56de\u9875\u9762\n    container.appendChild(views['nodes']);\n    container.appendChild(views['speed']);\n    container.appendChild(views['settings']);\n\n    // \u3010\u4f53\u9a8c\u4f18\u5316\u3011\u52ab\u6301\u7f16\u8f91\u4e8b\u4ef6\uff0c\u70b9\u51fb\u7f16\u8f91\u65f6\u5e73\u6ed1\u6eda\u52a8\u5230\u9876\u90e8\u7684\u8868\u5355\u5904\n    const originalEditRoute = window.editRoute;\n    if (typeof originalEditRoute === 'function') {\n        window.editRoute = function(index) {\n            originalEditRoute(index);\n            // \u56e0\u4e3a\u73b0\u5728\u8868\u5355\u548c\u5217\u8868\u90fd\u5728\u8282\u70b9\u9875\uff0c\u6240\u4ee5\u76f4\u63a5\u5e73\u6ed1\u6eda\u52a8\u5230\u6700\u4e0a\u9762\u5c31\u80fd\u770b\u5230\u586b\u597d\u7684\u8868\u5355\u4e86\uff01\n            window.scrollTo({ top: 0, behavior: 'smooth' });\n        };\n    }\n});\n</script>\n</body>\n</html>\n";

// ==========================================
// 2. 后端 Worker 主逻辑处理区 (核心故障转移 + TG Bot播报 + 智能流量拉取)
// ==========================================

// 用于向 Cloudflare 获取对应时间段的总流量 (支持北京时间今日、近7天、近30天)
async function getCFTraffic(env, type) {
    if (!env.CF_API_TOKEN || !env.CF_ZONE_ID) return "缺少变量";
    try {
        const end = new Date();
        let graphqlQuery = {};

        if (type === 'today') {
            // 【今日流量】查询：从北京时间今日 00:00 算起，使用 AdaptiveGroups
            // 1. 获取北京时间并清零时分秒
            const beijingTime = new Date(end.getTime() + 8 * 3600000);
            beijingTime.setUTCHours(0, 0, 0, 0);
            // 2. 转回 UTC 供 API 查询
            const start = new Date(beijingTime.getTime() - 8 * 3600000);

            graphqlQuery = {
                query: `
                query {
                  viewer {
                    zones(filter: {zoneTag: "${env.CF_ZONE_ID}"}) {
                      httpRequestsAdaptiveGroups(
                        limit: 1,
                        filter: {
                          datetime_geq: "${start.toISOString()}",
                          datetime_leq: "${end.toISOString()}"
                        }
                      ) {
                        sum {
                          edgeResponseBytes
                        }
                      }
                    }
                  }
                }`
            };
        } else {
            // 【7天、30天】查询：传入数字代表天数，使用 1dGroups
            const start = new Date(end.getTime() - type * 24 * 3600000);
            const dateGeq = start.toISOString().split('T')[0];
            const dateLeq = end.toISOString().split('T')[0];
            graphqlQuery = {
                query: `
                query {
                  viewer {
                    zones(filter: {zoneTag: "${env.CF_ZONE_ID}"}) {
                      httpRequests1dGroups(
                        limit: 10000,
                        filter: {
                          date_geq: "${dateGeq}",
                          date_leq: "${dateLeq}"
                        }
                      ) {
                        sum {
                          bytes
                        }
                      }
                    }
                  }
                }`
            };
        }

        const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.CF_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(graphqlQuery)
        });

        const cfData = await cfRes.json();

        if (cfData.errors && cfData.errors.length > 0) {
            return `API报错: ${cfData.errors[0].message}`;
        }

        const zones = cfData?.data?.viewer?.zones;
        let totalBytes = 0;

        if (zones && zones.length > 0) {
            if (type === 'today' && zones[0].httpRequestsAdaptiveGroups) {
                totalBytes = zones[0].httpRequestsAdaptiveGroups[0]?.sum?.edgeResponseBytes || 0;
            } else if (type !== 'today' && zones[0].httpRequests1dGroups) {
                // 将多天的 bytes 聚合累加
                zones[0].httpRequests1dGroups.forEach(g => {
                    totalBytes += (g.sum.bytes || 0);
                });
            }
        }

        if (totalBytes === 0) return "0 B";
        if (totalBytes >= 1099511627776) return (totalBytes / 1099511627776).toFixed(2) + " TB";
        if (totalBytes >= 1073741824) return (totalBytes / 1073741824).toFixed(2) + " GB";
        if (totalBytes >= 1048576) return (totalBytes / 1048576).toFixed(2) + " MB";
        if (totalBytes >= 1024) return (totalBytes / 1024).toFixed(2) + " KB";
        return totalBytes + " B";

    } catch (e) {
        return "请求异常";
    }
}

// 用于生成 TG 播报消息的核心工具函数（按 youko 二改 TG 消息面板 + 刷新按钮版）
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function tgApiBase(env) {
    return String(env.TG_API_BASE || 'https://api.telegram.org').replace(/\/+$/, '');
}

function tgPanelUrl(env) {
    return String(env.STATS_PANEL_URL || env.PANEL_URL || (env.CF_DOMAIN ? `https://${env.CF_DOMAIN}` : '')).trim();
}

async function tgPost(env, method, payload) {
    return fetch(`${tgApiBase(env)}/bot${env.TG_BOT_TOKEN}/${method}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
}

// TG 纯文字状态报告；定时推送、/status、刷新按钮共用这一套


// =========================================================================
// 🎨 [第二步：视觉升级] TG 动态字符进度条与影视标签引擎 (合并自 tg_stats_v7)
// =========================================================================
function generateProgressBar(percent, length = 10) {
    const p = Math.max(0, Math.min(100, Number(percent) || 0));
    const filled = Math.round((p / 100) * length);
    const empty = Math.max(0, length - filled);
    return '█'.repeat(filled) + '░'.repeat(empty);
}

function getMediaCategoryBadge(itemType, name = '') {
    const t = String(itemType || '').toLowerCase();
    const n = String(name || '').toLowerCase();
    if (t.includes('movie') || n.includes('电影')) return '🎬 电影';
    if (t.includes('episode') || t.includes('series') || n.includes('剧')) return '📺 剧集';
    if (t.includes('audio') || t.includes('music') || n.includes('音乐')) return '🎵 音乐';
    if (n.includes('4k') || n.includes('uhd') || n.includes('2160p')) return '🔥 4K HDR';
    return '🎞️ 影视';
}


async function sendTgStats(env, chatId, forceNew = false) {
    try {
        const escapeHTML = (str) => {
            if (str === null || str === undefined) return '';
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };
        const safeQueryFirst = async (sql) => {
            try {
                return await env.DB.prepare(sql).first();
            } catch (e) {
                return null;
            }
        };
        const fmtBytes = (b) => {
            b = Number(b || 0);
            if (b >= 1099511627776) return (b / 1099511627776).toFixed(2) + 'TB';
            if (b >= 1073741824) return (b / 1073741824).toFixed(2) + 'GB';
            if (b >= 1048576) return (b / 1048576).toFixed(2) + 'MB';
            if (b >= 1024) return (b / 1024).toFixed(2) + 'KB';
            return b > 0 ? b + 'B' : '0 B';
        };

        const localNow = new Date(Date.now() + 8 * 3600000);
        const hour = localNow.getUTCHours();
        let greeting = '☀️ 早安，今日监控已就绪';
        if (hour >= 12 && hour < 18) greeting = '☕ 下午好，运行数据已更新';
        else if (hour >= 18 && hour < 23) greeting = '🌙 晚上好，今日流量概览';
        else if (hour >= 23 || hour < 6) greeting = '🦉 深夜运营播报，辛苦了';

        let colo = '获取中...';
        try {
            const trace = await fetch('https://1.1.1.1/cdn-cgi/trace', {
                headers: {
                    'User-Agent': 'cf-emby-proxy-stats/1.0'
                }
            }).then(r => r.text());
            const match = trace.match(/colo=([A-Z]+)/);
            if (match) colo = match[1] + ' 节点';
        } catch (e) {
            colo = String(env.SERVER_REGION || env.WORKER_REGION || '未知节点');
        }

        let egressIp = String(env.EGRESS_NODE || '获取中...');
        let egressLoc = String(env.EGRESS_LOCATION || '未知地区');
        if (!env.EGRESS_NODE || !env.EGRESS_LOCATION) {
            try {
                const ipRes = await fetch('http://ip-api.com/json/?lang=zh-CN', {
                    headers: {
                        'User-Agent': 'cf-emby-proxy-stats/1.0'
                    }
                });
                const ipData = await ipRes.json();
                if (ipData.status === 'success') {
                    egressIp = env.EGRESS_NODE || ipData.query;
                    egressLoc = env.EGRESS_LOCATION || `${ipData.country} ${ipData.city}`;
                } else if (!env.EGRESS_NODE) {
                    const altIpData = await fetch('https://api.ipify.org?format=json').then(r => r.json());
                    egressIp = altIpData.ip;
                }
            } catch (e) { }
        }

        const todayReq = await safeQueryFirst("SELECT COUNT(*) as count FROM visitor_logs WHERE date(timestamp, '+8 hours') = date('now', '+8 hours')");
        const reqCount = todayReq ? Number(todayReq.count || 0) : 0;
        const todayIPs = await safeQueryFirst("SELECT COUNT(DISTINCT ip) as count FROM visitor_logs WHERE date(timestamp, '+8 hours') = date('now', '+8 hours')");
        const ipCount = todayIPs ? Number(todayIPs.count || 0) : 0;

        let peakHourText = '暂无记录';
        try {
            const {
                results: tsLogs
            } = await env.DB.prepare("SELECT timestamp FROM visitor_logs WHERE date(timestamp, '+8 hours') = date('now', '+8 hours')").all();
            if (tsLogs && tsLogs.length > 0) {
                const hourMap = {};
                tsLogs.forEach(row => {
                    if (!row.timestamp) return;
                    let hStr;
                    if (typeof row.timestamp === 'number' || (typeof row.timestamp === 'string' && /^\d+$/.test(row.timestamp))) {
                        let ms = Number(row.timestamp);
                        if (ms < 10000000000) ms *= 1000;
                        hStr = new Date(ms + 8 * 3600000).getUTCHours();
                    } else {
                        let safeTs = String(row.timestamp).replace(' ', 'T');
                        if (!safeTs.endsWith('Z') && !safeTs.includes('+')) safeTs += 'Z';
                        const d = new Date(safeTs);
                        if (!isNaN(d.getTime())) hStr = new Date(d.getTime() + 8 * 3600000).getUTCHours();
                    }
                    if (hStr !== undefined && !isNaN(hStr)) hourMap[hStr] = (hourMap[hStr] || 0) + 1;
                });
                let maxH = -1,
                    maxC = 0;
                for (let h = 0; h < 24; h++)
                    if ((hourMap[h] || 0) > maxC) {
                        maxC = hourMap[h];
                        maxH = h;
                    }
                if (maxH >= 0) peakHourText = `${String(maxH).padStart(2, '0')}:00 - ${String(maxH === 23 ? 0 : maxH + 1).padStart(2, '0')}:00 (${maxC}次)`;
            }
        } catch (e) { }

        const topIpQuery = await safeQueryFirst("SELECT ip, COUNT(*) as c FROM visitor_logs WHERE date(timestamp, '+8 hours') = date('now', '+8 hours') AND ip IS NOT NULL AND ip != '' GROUP BY ip ORDER BY c DESC LIMIT 1");
        let topIpText = '暂无记录';
        if (topIpQuery && topIpQuery.ip) {
            const ip = String(topIpQuery.ip);
            if (ip.includes('.')) {
                const parts = ip.split('.');
                topIpText = `${parts[0]}.${parts[1]}.***.*** (${topIpQuery.c}次)`;
            } else if (ip.includes(':')) {
                const parts = ip.split(':');
                topIpText = `${parts[0]}:${parts[1]}:*** (${topIpQuery.c}次)`;
            } else topIpText = `*** (${topIpQuery.c}次)`;
        }

        const topLocation = await safeQueryFirst("SELECT country, COUNT(*) as c FROM visitor_logs WHERE date(timestamp, '+8 hours') = date('now', '+8 hours') AND country IS NOT NULL AND country != '' GROUP BY country ORDER BY c DESC LIMIT 1");
        const locName = topLocation ? (topLocation.country === 'CN' ? '中国大陆' : topLocation.country) + ` (${topLocation.c}次)` : '暂无记录';

        const totalDbQuery = await safeQueryFirst("SELECT COUNT(*) as c FROM visitor_logs");
        const totalDbCount = totalDbQuery ? Number(totalDbQuery.c || 0) : 0;
        const DB_LIMIT = Number(env.DB_LIMIT_ROWS || 50000);
        const dbUsagePct = DB_LIMIT > 0 ? ((totalDbCount / DB_LIMIT) * 100).toFixed(1) : '未知';

        let clientText = '\n • <i>今日暂无设备数据</i>';
        try {
            const {
                results: uaResults
            } = await env.DB.prepare("SELECT ua, COUNT(*) as c FROM visitor_logs WHERE date(timestamp, '+8 hours') = date('now', '+8 hours') AND ua IS NOT NULL AND ua != '' GROUP BY ua").all();
            const stats = {
                yamby: 0,
                hills: 0,
                vidhub: 0,
                chaichaiemby: 0,
                lenna: 0,
                filebar: 0,
                senplayer: 0,
                forward: 0,
                capyplayer: 0,
                infuse: 0,
                emby: 0,
                jellyfin: 0,
                fileball: 0,
                tv: 0,
                web: 0,
                others: 0
            };
            let totalUaCount = 0,
                sampleOtherUa = '',
                maxOtherC = 0;
            (uaResults || []).forEach(r => {
                const ua = String(r.ua || '').toLowerCase();
                const c = Number(r.c || 0);
                totalUaCount += c;
                // 顺序很重要：ChaiChaiEmby 必须排在 Emby 前面，Filebar/Fileball 分开识别。
                if (ua.includes('yamby')) stats.yamby += c;
                else if (ua.includes('hills')) stats.hills += c;
                else if (ua.includes('vidhub')) stats.vidhub += c;
                else if (ua.includes('chaichaiemby') || ua.includes('chaichai emby') || ua.includes('chaichai-emby')) stats.chaichaiemby += c;
                else if (ua.includes('lenna')) stats.lenna += c;
                else if (ua.includes('filebar')) stats.filebar += c;
                else if (ua.includes('senplayer')) stats.senplayer += c;
                else if (ua.includes('forward')) stats.forward += c;
                else if (ua.includes('capyplayer') || ua.includes('capy player') || ua.includes('capy-player')) stats.capyplayer += c;
                else if (ua.includes('infuse')) stats.infuse += c;
                else if (ua.includes('jellyfin')) stats.jellyfin += c;
                else if (ua.includes('fileball')) stats.fileball += c;
                else if (ua.includes('emby')) stats.emby += c;
                else if (ua.includes('okhttp') || ua.includes('exoplayer') || ua.includes('dalvik') || ua.includes('tivimate') || ua.includes('appletv') || ua.includes('androidtv') || ua.includes('smarttv')) stats.tv += c;
                else if (/(mozilla|chrome|safari|edge|applewebkit|firefox)/i.test(ua)) stats.web += c;
                else {
                    stats.others += c;
                    if (c > maxOtherC) {
                        maxOtherC = c;
                        sampleOtherUa = r.ua || '';
                    }
                }
            });
            const getPct = (val, total) => total > 0 ? Math.round((val / total) * 100) + '%' : '0%';
            const addClientLine = (emoji, name, key) => {
                if (stats[key] > 0) clientText += `
 • ${emoji} ${name}：<code>${getPct(stats[key], totalUaCount)} (${stats[key]}次)</code>`;
            };
            if (totalUaCount > 0) {
                clientText = '';
                addClientLine('🌈', 'Yamby', 'yamby');
                addClientLine('🍿', 'Hills', 'hills');
                addClientLine('🎬', 'VidHub', 'vidhub');
                addClientLine('🍵', 'ChaiChaiEmby', 'chaichaiemby');
                addClientLine('🎞', 'Lenna', 'lenna');
                addClientLine('📂', 'Filebar', 'filebar');
                addClientLine('🍏', 'SenPlayer', 'senplayer');
                addClientLine('🚀', 'Forward', 'forward');
                addClientLine('🐹', 'CapyPlayer', 'capyplayer');
                addClientLine('🍎', 'Infuse', 'infuse');
                addClientLine('🎬', 'Emby', 'emby');
                addClientLine('🪼', 'Jellyfin', 'jellyfin');
                addClientLine('📁', 'Fileball', 'fileball');
                addClientLine('📺', '电视/盒子端', 'tv');
                addClientLine('🌐', '浏览器端', 'web');
                if (stats.others > 0) clientText += `
 • 📦 其他 (${escapeHTML(String(sampleOtherUa).split(' ')[0].substring(0, 15))}...)：<code>${getPct(stats.others, totalUaCount)} (${stats.others}次)</code>`;
            }
        } catch (e) { }

        let trafficToday = '获取失败',
            traffic7d = '获取失败';
        try {
            [trafficToday, traffic7d] = await Promise.all([getCFTraffic(env, 'today'), getCFTraffic(env, 7)]);
        } catch (e) { }

        let nodeDetails = [];
        if (env.CF_API_TOKEN && env.CF_ZONE_ID && env.DB) {
            try {
                const {
                    results: routes
                } = await env.DB.prepare("SELECT * FROM routes").all();
                if (routes && routes.length > 0) {
                    const now = new Date();
                    const ln = new Date(now.getTime() + 8 * 3600000);
                    ln.setUTCHours(0, 0, 0, 0);
                    const startUtc = new Date(ln.getTime() - 8 * 3600000).toISOString();
                    const endUtc = now.toISOString();
                    let logCounts = [];
                    try {
                        const lc = await env.DB.prepare("SELECT prefix, COUNT(id) as c FROM visitor_logs WHERE date(timestamp, '+8 hours') = date('now', '+8 hours') GROUP BY prefix").all();
                        logCounts = lc.results || [];
                    } catch (e) { }
                    const nodeDataList = [];
                    await Promise.all(routes.map(async route => {
                        try {
                            const prefixSafe = String(route.prefix || '').replace(/"/g, '\\"');
                            const query = `query { viewer { zones(filter: {zoneTag: "${env.CF_ZONE_ID}"}) { httpRequestsAdaptiveGroups(limit: 10000, filter: {clientRequestPath_like: "/${prefixSafe}%", datetime_geq: "${startUtc}", datetime_leq: "${endUtc}"}) { sum { edgeResponseBytes } } } } }`;
                            const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
                                method: 'POST',
                                headers: {
                                    'Authorization': 'Bearer ' + env.CF_API_TOKEN,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    query
                                })
                            });
                            const json = await res.json();
                            const bytes = json?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups?.[0]?.sum?.edgeResponseBytes || 0;
                            const reqs = logCounts.find(x => x.prefix === route.prefix)?.c || 0;
                            if (reqs > 0 || bytes > 0) nodeDataList.push({
                                name: route.remark || route.prefix,
                                bytes,
                                reqs,
                                rawTarget: route.target
                            });
                        } catch (e) { }
                    }));
                    nodeDataList.sort((a, b) => b.bytes - a.bytes);
                    const top3 = nodeDataList.slice(0, 3);
                    for (const n of top3) {
                        n.pingMs = '超时';
                        if (n.rawTarget) {
                            const tUrl = String(n.rawTarget).split(',')[0].trim();
                            const pStart = Date.now();
                            try {
                                const c = new AbortController();
                                const id = setTimeout(() => c.abort(), 1500);
                                await fetch(tUrl, {
                                    method: 'OPTIONS',
                                    signal: c.signal
                                });
                                clearTimeout(id);
                                n.pingMs = (Date.now() - pStart) + 'ms';
                            } catch (e) { }
                        }
                    }
                    const maxNodeBytes = Math.max(...nodeDataList.map(n => n.bytes || 1), 1);
                    nodeDetails = nodeDataList.slice(0, 10).map((node, index) => {
                        const ranks = ['🥇', '🥈', '🥉'];
                        const icon = ranks[index] || '🔹';
                        const pct = Math.round(((node.bytes || 0) / maxNodeBytes) * 100);
                        const bar = generateProgressBar(pct, 6);
                        let extraAlert = '';
                        if (node.pingMs) extraAlert += ` | ${node.pingMs === '超时' ? '🔴 掉线' : `⚡ ${node.pingMs}`}`;
                        if (node.bytes > 536870912000) extraAlert += ' ⚠️ 流量飙升';
                        return `${icon} <b>${escapeHTML(node.name)}</b> [<code>${bar}</code>]\n   └ <code>${fmtBytes(node.bytes)} (${pct}%) | ${node.reqs}次${extraAlert}</code>`;
                    });
                }
            } catch (e) { }
        }

        const dateStr = localNow.toISOString().replace('T', ' ').substring(0, 19);
        const nodeText = nodeDetails.length > 0 ? nodeDetails.slice(0, 10).join('\n') : '  🧊 <i>暂无活跃线路数据</i>';
        const msg = `
<b>📊 Emby 反代运行状态</b>
<code>${dateStr}</code>

${greeting}

<b>👥 访问概览</b>
┌────────────────────
├ 独立访客：<code>${ipCount} 人</code>
├ 请求总数：<code>${reqCount} 次</code>
├ 活跃高峰：<code>${escapeHTML(peakHourText)}</code>
├ 核心地域：<code>${escapeHTML(locName)}</code>
└ 顶级访客：<code>${escapeHTML(topIpText)}</code>

<b>🎛 客户端画像</b>${clientText}

<b>🖥 系统与流量</b>
┌────────────────────
├ DB 占用：<code>[${generateProgressBar(parseFloat(dbUsagePct) || 0, 6)}] ${dbUsagePct}%</code>
├ 今日流量：<code>${trafficToday}</code>
├ 七日流量：<code>${traffic7d}</code>
├ Worker 节点：<code>${escapeHTML(colo)}</code>
├ Worker 出口：<code>${escapeHTML(egressIp)}</code>
└ 出口位置：<code>${escapeHTML(egressLoc)}</code>

<b>🚦 核心线路 TOP 10</b>
${nodeText}`;

        const MSG_ID_KEY = `tg_last_msg_id_${chatId}`;
        await env.DB.exec(`CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)`);
        const lastMsgRecord = await env.DB.prepare('SELECT value FROM kv_store WHERE key = ?').bind(MSG_ID_KEY).first();
        const lastMsgId = lastMsgRecord ? lastMsgRecord.value : null;
        let sendNewMessage = true;

        const panelUrl = tgPanelUrl(env);
        const buttons = [];
        if (panelUrl) buttons.push({
            text: '🌐 测速面板',
            url: panelUrl
        });
        buttons.push({
            text: '🔄 刷新状态',
            callback_data: 'refresh_stats'
        });
        const replyMarkup = {
            inline_keyboard: [buttons]
        };

        // 纯文字状态报告：去除图片背景，避免图片拉取失败或图文说明长度限制导致无响应。
        if (lastMsgId && !forceNew) {
            const editRes = await tgPost(env, 'editMessageText', {
                chat_id: chatId,
                message_id: parseInt(lastMsgId),
                text: msg,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: replyMarkup
            });
            const editJson = await editRes.json();
            if (editJson.ok) sendNewMessage = false;
        }

        if (sendNewMessage) {
            let payload = {
                chat_id: chatId,
                text: msg,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: replyMarkup
            };
            if (String(chatId) === String(env.TG_CHAT_ID) && env.TG_THREAD_ID) {
                payload.message_thread_id = env.TG_THREAD_ID;
            } else if (String(chatId) === String(env.TG_CHAT_ID_2) && env.TG_THREAD_ID_2) {
                payload.message_thread_id = env.TG_THREAD_ID_2;
            }
            const sendRes = await tgPost(env, 'sendMessage', payload);
            const sendJson = await sendRes.json();
            if (sendJson.ok && sendJson.result?.message_id) {
                if (env.DB) {
                    try {
                        await env.DB.prepare('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)')
                            .bind(MSG_ID_KEY, String(sendJson.result.message_id)).run();
                    } catch (e) { }
                }
                return { ok: true, result: sendJson.result };
            } else {
                return { ok: false, error: sendJson.description || 'Telegram 接口返回错误', details: sendJson };
            }
        }
        return { ok: true, message: '已更新现有状态消息' };
    } catch (error) {
        console.error('TG 推送全局错误:', error);
        return { ok: false, error: error.message || String(error) };
    }
}


// ===== 🌐 极速高可用 UTF-8 省市区县与运营商智能解析引擎 (实测 0 超时) =====
// ===== 🌐 客户端 IP 归属地与运营商毫秒级实时提取函数 (基于 request.cf) =====
function isLikelyIp(value) {
    const ip = String(value || '').split(',')[0].trim();
    if (!ip || ip.length > 64 || /[\r\n]/.test(ip)) return false;
    const ipv4 = /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(ip);
    const ipv6 = /^[0-9a-f:.]+$/i.test(ip) && ip.includes(':') && ip.length >= 3;
    return ipv4 || ipv6;
}

function getRealClientIp(request, env = null) {
    const cfIp = (request.headers.get("CF-Connecting-IP") || "").split(',')[0].trim();
    if (isLikelyIp(cfIp)) return cfIp;
    if (String(env?.TRUST_FALLBACK_REAL_IP || "0") === "1") {
        const fallbackIp = (request.headers.get("X-Forwarded-For") || request.headers.get("X-Real-IP") || "").split(',')[0].trim();
        if (isLikelyIp(fallbackIp)) return fallbackIp;
    }
    return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || (request.headers.get("x-forwarded-for") || "").split(',')[0].trim() || "";
}

function stripCfProxyHeaders(headers) {
    [
        "cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor", "cf-worker",
        "x-forwarded-for", "x-real-ip", "x-forwarded-proto", "x-forwarded-host",
        "x-forwarded-port", "forwarded", "true-client-ip"
    ].forEach(k => headers.delete(k));
}

function parseIpLocation(request, clientIp) {
    if (!clientIp || clientIp === 'Unknown' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
        return '本地局域网';
    }
    const cf = (request && request.cf) ? request.cf : {};
    const country = cf.country || '';
    const city = cf.city || '';
    const region = cf.region || '';
    const org = cf.asOrganization || '';
    
    let isp = '';
    const orgLower = String(org).toLowerCase();
    if (orgLower.includes('telecom') || orgLower.includes('chinanet')) isp = '电信';
    else if (orgLower.includes('unicom')) isp = '联通';
    else if (orgLower.includes('mobile') || orgLower.includes('cmnet')) isp = '移动';
    else if (orgLower.includes('ali') || orgLower.includes('alibaba')) isp = '阿里云';
    else if (orgLower.includes('tencent')) isp = '腾讯云';
    else if (orgLower.includes('huawei')) isp = '华为云';
    else if (orgLower.includes('baidu')) isp = '百度云';
    else if (orgLower.includes('cloudflare')) isp = 'CF节点';
    else if (orgLower.includes('amazon') || orgLower.includes('aws')) isp = 'AWS';
    else if (org) isp = String(org).slice(0, 15);

    let loc = '';
    if (country === 'CN' || country === 'China' || country === '中国') {
        loc = (region || city ? (region + (city && city !== region ? ' ' + city : '')) : '中国大陆');
    } else if (country) {
        loc = country + (city ? ' ' + city : '');
    } else {
        loc = '中国大陆';
    }
    return loc + (isp ? ' · ' + isp : '');
}

const IP_BACKEND_CACHE = new Map();

async function resolveIpPrecise(ip) {
    if (!ip || ip === 'Unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return '本地局域网';
    }
    if (IP_BACKEND_CACHE.has(ip)) {
        return IP_BACKEND_CACHE.get(ip);
    }

    try {
        // 1. IPWhois CDN 极速高精度中文源 (全球边缘毫秒级响应，覆盖全国省市)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const resp = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?lang=zh-CN`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
            const d = await resp.json();
            if (d && d.success) {
                const region = d.region || '';
                const city = d.city && d.city !== region ? d.city : '';
                const org = (d.connection && d.connection.org) ? d.connection.org : '';
                const isp = (d.connection && d.connection.isp) ? d.connection.isp : '';
                
                let ispName = '';
                const combined = (org + ' ' + isp).toLowerCase();
                if (combined.includes('telecom') || combined.includes('chinanet')) ispName = '电信';
                else if (combined.includes('unicom')) ispName = '联通';
                else if (combined.includes('mobile') || combined.includes('cmnet')) ispName = '移动';
                else if (combined.includes('ali') || combined.includes('alibaba')) ispName = '阿里云';
                else if (combined.includes('tencent')) ispName = '腾讯云';
                else if (combined.includes('huawei')) ispName = '华为云';
                else if (combined.includes('baidu')) ispName = '百度云';
                else if (combined.includes('cloudflare')) ispName = 'CF节点';
                else if (combined.includes('amazon') || combined.includes('aws')) ispName = 'AWS';
                else if (isp) ispName = isp.split(' ')[0];

                let loc = (d.country === '中国' ? (region + city) : (d.country + (city ? city : '')));
                let finalStr = (loc || '中国大陆') + (ispName ? ' · ' + ispName : '');
                if (finalStr) {
                    IP_BACKEND_CACHE.set(ip, finalStr);
                    return finalStr;
                }
            }
        }
    } catch (e) { }

    try {
        // 2. 备用源: Vore API
        const resp2 = await fetch(`https://api.vore.top/api/IPdata?ip=${encodeURIComponent(ip)}`);
        if (resp2.ok) {
            const data = await resp2.json();
            if (data && data.code === 200 && data.ipdata) {
                const info1 = data.ipdata.info1 || '';
                const info2 = data.ipdata.info2 || '';
                const isp = (data.ipdata.isp || '').replace('中国', '');
                let loc = info1 + (info2 && info2 !== info1 ? info2 : '');
                let finalStr = (loc || '中国大陆') + (isp ? ' · ' + isp : '');
                if (finalStr) {
                    IP_BACKEND_CACHE.set(ip, finalStr);
                    return finalStr;
                }
            }
        }
    } catch (e) { }

    return '中国大陆 · 电信/移动';
}


// ==========================================
// EMOS / Emby 兼容辅助函数（移植自稳定版 EMOS 兼容层）
// ==========================================
function isEmosTarget(routeInfo, targetUrl, env) {
    const remark = String(routeInfo?.remark || '').toLowerCase();
    if (remark.includes('emos')) return true;
    const rawTarget = String(routeInfo?.target || '').toLowerCase();
    if (rawTarget.includes('emos')) return true;
    const hosts = String(env?.EMOS_MATCH_HOSTS || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
    const host = String(targetUrl?.hostname || '').toLowerCase();
    return !!host && hosts.includes(host);
}

function applyEmosHeaders(headers, request, env, realIpMode = 'off') {
    const pid = String(env?.EMOS_PROXY_ID || '').trim();
    const pname = String(env?.EMOS_PROXY_NAME || '').trim();
    if (pid) headers.set('EMOS-PROXY-ID', pid);
    if (pname) headers.set('EMOS-PROXY-NAME', pname);

    // EMOS Wiki 明确要求必须传递 X-FORWARDED-FOR
    // 因此 EMOS 节点默认强制透传真实 IP；如确需关闭，可显式设置 EMOS_FORCE_REAL_IP=0
    const forceEmosRealIp = String(env?.EMOS_FORCE_REAL_IP || '1') !== '0';
    const ip = getRealClientIp(request, env);
    if (ip && (forceEmosRealIp || realIpMode !== 'off')) {
        headers.set('X-Real-IP', ip);
        headers.set('X-Forwarded-For', ip);
        headers.set('X-FORWARDED-FOR', ip);
    }

    const range = request.headers.get('Range');
    if (range) headers.set('Range', range);
    const ifRange = request.headers.get('If-Range');
    if (ifRange) headers.set('If-Range', ifRange);
}

function buildEmosCompatiblePath(baseUrl, path) {
    let forwardPath = path || '/';
    if (!forwardPath.startsWith('/')) forwardPath = '/' + forwardPath;
    const basePath = (baseUrl.pathname || '').replace(/\/+$/, '');

    // 路径去重，避免 /emby/emby/ 404
    const baseSegments = basePath.split('/').filter(Boolean).map(s => s.toLowerCase());
    const forwardSegments = forwardPath.split('/').filter(Boolean);
    const forwardLower = forwardSegments.map(s => s.toLowerCase());
    let duplicateCount = 0;
    const max = Math.min(baseSegments.length, forwardLower.length);
    for (let n = max; n > 0; n--) {
        const tail = baseSegments.slice(baseSegments.length - n).join('/');
        const head = forwardLower.slice(0, n).join('/');
        if (tail && tail === head) {
            duplicateCount = n;
            break;
        }
    }
    if (duplicateCount > 0) {
        forwardPath = '/' + forwardSegments.slice(duplicateCount).join('/');
        if (forwardPath === '/') return '/';
    }
    return forwardPath;
}

function isEmbyAuthApi(pathname) {
    return /\/users\/authenticate(?:byname)?(?:\/|$)/i.test(String(pathname || ''));
}

function isEmbyPlaybackApi(pathname) {
    const p = String(pathname || '').toLowerCase();
    return (
        p.includes('/videos/') || p.includes('/playback/') || p.includes('/sessions/playing') ||
        (p.includes('/items/') && (p.includes('/download') || p.includes('/stream') || p.includes('/file'))) ||
        p.includes('/audio/') || p.includes('/hls/') || p.includes('/dash/') ||
        /\.(m3u8|mpd|mkv|mp4|ts|m4s)$/i.test(p)
    );
}

function isEmosImageApi(pathname) {
    const p = String(pathname || '').toLowerCase();
    return /^\/emby\/items\/[^/]+\/images\//i.test(p) || p.includes('/images/');
}

function stripOptionalEmbyPrefix(pathname) {
    const p = String(pathname || '').toLowerCase();
    return p.replace(/^\/emby(?=\/|$)/i, '') || '/';
}

function isEmosPingApi(pathname) {
    return stripOptionalEmbyPrefix(pathname) === '/system/ping';
}

function isEmosProgressApi(pathname) {
    return stripOptionalEmbyPrefix(pathname).startsWith('/sessions/playing/progress');
}

function shouldThrottleEmosProgress(request, targetUrl, env) {
    const ttl = Math.max(300, Number(env?.EMOS_PROGRESS_THROTTLE_MS || 1200));
    const rawIp = getRealClientIp(request, env) || 'unknown';
    const deviceId = String(request.headers.get('X-Emby-Device-Id') || request.headers.get('X-MediaBrowser-Device-Id') || '').slice(0, 80);
    const sessionId = String(targetUrl.searchParams.get('SessionId') || targetUrl.searchParams.get('sessionId') || '').slice(0, 80);
    const key = `${rawIp}|${deviceId}|${sessionId}`;
    const now = Date.now();
    const prev = EMOS_PROGRESS_THROTTLE.get(key) || 0;
    if (prev && now - prev < ttl) return true;
    EMOS_PROGRESS_THROTTLE.set(key, now);
    if (EMOS_PROGRESS_THROTTLE.size > 5000) {
        for (const [k, v] of EMOS_PROGRESS_THROTTLE) {
            if (now - v > ttl * 10) EMOS_PROGRESS_THROTTLE.delete(k);
        }
    }
    return false;
}

export default {
    // 每天自动运行发送 TG 统计
    async scheduled(event, env, ctx) {
        if (env.TG_BOT_TOKEN && env.DB) {
            ctx.waitUntil((async () => {
                if (env.TG_CHAT_ID) await sendTgStats(env, env.TG_CHAT_ID);
                if (env.TG_CHAT_ID_2) await sendTgStats(env, env.TG_CHAT_ID_2);
            })());
        }
    },

    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // ==========================================
        // 🚀 新增：全云厂商 Worker 放置区域接口
        // ==========================================
        if (url.pathname === '/api/placement' && request.method === 'GET') {
            try {
                if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID || !env.CF_WORKER_NAME) {
                    return Response.json({
                        success: false,
                        msg: '后台变量未配置全'
                    }, {
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }
                const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/workers/scripts/${env.CF_WORKER_NAME}`;
                const cfRes = await fetch(cfUrl, {
                    headers: {
                        'Authorization': `Bearer ${env.CF_API_TOKEN}`
                    }
                });
                const cfData = await cfRes.json();
                let currentMode = 'smart';
                if (cfData.success && cfData.result && cfData.result.placement) {
                    currentMode = cfData.result.placement.mode || cfData.result.placement.region || 'smart';
                }
                return Response.json({
                    success: true,
                    placement: currentMode
                }, {
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch (e) {
                return Response.json({
                    success: false,
                    msg: e.message
                }, {
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        if (url.pathname === '/api/placement' && request.method === 'POST') {
            try {
                const body = await request.json();
                let placementData = body.placement;

                // 修复 invalid placement mode: off 问题
                if (placementData && placementData.mode === 'off') {
                    placementData = null; // 设置为空从而禁用 smart placement (即 Edge 模式)
                }

                if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID || !env.CF_WORKER_NAME) {
                    return new Response(JSON.stringify({
                        success: false,
                        msg: '后台变量未配置全！请检查 CF_API_TOKEN, CF_ACCOUNT_ID, CF_WORKER_NAME'
                    }), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }

                const formData = new FormData();
                const settingsPayload = placementData !== null ? {
                    placement: placementData
                } : {
                    placement: null
                };
                formData.append('settings', new Blob([JSON.stringify(settingsPayload)], {
                    type: 'application/json'
                }));

                const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/workers/scripts/${env.CF_WORKER_NAME}/settings`;
                const cfRes = await fetch(cfUrl, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${env.CF_API_TOKEN}`
                    },
                    body: formData
                });

                const cfData = await cfRes.json();
                if (cfData.success) {
                    return new Response(JSON.stringify({
                        success: true,
                        msg: '部署区域修改成功！'
                    }), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                } else {
                    return new Response(JSON.stringify({
                        success: false,
                        msg: 'CF报错: ' + (cfData.errors[0]?.message || '未知错误')
                    }), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }
            } catch (e) {
                return new Response(JSON.stringify({
                    success: false,
                    msg: e.message
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }


        // ==========================================
        // 🚀 新增：CF 节点与落地机房探针接口
        // ==========================================
        if (url.pathname === '/api/trace') {
            const cf = request.cf || {};
            let egressColo = '探测中...';
            try {
                // 请求 CF 官方 trace 接口获取落地机房
                const traceRes = await fetch('https://1.1.1.1/cdn-cgi/trace', {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (CF-Worker-Trace)'
                    }
                });
                const traceText = await traceRes.text();
                const match = traceText.match(/colo=([A-Z]+)/);
                if (match) egressColo = match[1];
            } catch (e) {
                egressColo = '获取失败';
            }

            return new Response(JSON.stringify({
                success: true,
                entryCountry: cf.country || '未知',
                entryCity: cf.city || '',
                entryColo: cf.colo || '未知',
                egressColo: egressColo
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // ==========================================
        // 🌟 新增：客户端 RTT 实时极速探针接口
        // 直接返回 204 无内容，且强制不缓存，确保每次都是真实的物理延迟
        // ==========================================
        if (url.pathname === '/__client_rtt__') {
            return new Response(null, {
                status: 204,
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                    "Pragma": "no-cache",
                    "Expires": "0",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }

        // Telegram Webhook 拦截：/status 发送报告；按钮刷新则编辑当前报告消息
        // 注意：Telegram 要求 Webhook 很快返回 200。统计报告包含 D1 / CF GraphQL / 探针请求，
        // 如果在 Webhook 请求里 await，Telegram 可能超时，看起来就是“/status 无反应”。
        // ==========================================
        // 🚀 新增：一键直跳 Telegram setWebhook 注册页面 (302 自动重定向)
        // ==========================================
        if (url.pathname === '/api/open-tg-webhook') {
            if (!env.TG_BOT_TOKEN) {
                return new Response('⚠️ 未在 Cloudflare Worker 环境变量中配置 TG_BOT_TOKEN，请先在 Settings -> Variables 中添加后重试。', {
                    status: 400,
                    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
                });
            }
            const tgBase = tgApiBase(env);
            const domain = env.CF_DOMAIN || url.hostname;
            const webhookUrl = `https://${domain}/api/tg-webhook`;
            const setWebhookUrl = `${tgBase}/bot${env.TG_BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`;
            return Response.redirect(setWebhookUrl, 302);
        }

        if (url.pathname === '/api/tg-webhook') {
            if (request.method === 'GET') {
                return Response.json({
                    ok: true,
                    endpoint: '/api/tg-webhook',
                    has_db: !!env.DB,
                    has_tg_token: !!env.TG_BOT_TOKEN,
                    tg_api_base: tgApiBase(env)
                });
            }
            if (request.method === 'POST') {
                try {
                    const body = await request.json();
                    const msg = body.message || body.edited_message;
                    const text = String(msg?.text || '').trim();

                    if (text === '/cancel' || text === '取消') {
                        if (env.DB && msg?.chat?.id) {
                            ctx.waitUntil(env.DB.prepare('DELETE FROM tg_sessions WHERE chat_id = ?').bind(msg.chat.id).run().catch(() => null));
                            ctx.waitUntil(tgPost(env, 'sendMessage', {
                                chat_id: msg.chat.id,
                                text: '已取消当前操作。'
                            }));
                        }
                        return new Response("OK");
                    }
                    if (['📊 查看运行状态', '🌐 获取反代节点'].includes(text)) {
                        if (env.DB && msg?.chat?.id) {
                            ctx.waitUntil(env.DB.prepare('DELETE FROM tg_sessions WHERE chat_id = ?').bind(msg.chat.id).run().catch(() => null));
                        }
                    } else if (text && !text.startsWith('/') && env.DB && env.TG_BOT_TOKEN && msg?.chat?.id) {
                        const chatId = msg.chat.id;
                        try {
                            const sessionRow = await env.DB.prepare('SELECT state, data FROM tg_sessions WHERE chat_id = ?').bind(chatId).first().catch(() => null);
                            if (sessionRow) {
                                const state = sessionRow.state;
                                const sessionData = JSON.parse(sessionRow.data || '{}');
                                const setSession = async (st, dt) => {
                                    await env.DB.prepare('UPDATE tg_sessions SET state = ?, data = ?, updated_at = ? WHERE chat_id = ?').bind(st, JSON.stringify(dt), Date.now(), chatId).run();
                                };
                                const clearSession = async () => {
                                    await env.DB.prepare('DELETE FROM tg_sessions WHERE chat_id = ?').bind(chatId).run();
                                };

                                // 中文模式映射
                                const modeDisplayMap = {
                                    'off': '保守 (抹除IP)',
                                    'realip_only': '严格 (透传IP)',
                                    'dual': '兼容 (双重透传)',
                                    'strict': '强力 (防403)'
                                };
                                // 导航按钮行（每步都附加）
                                const navRow = [{
                                    text: '⬅️ 返回上一步',
                                    callback_data: 'nav_back'
                                }, {
                                    text: '🏠 返回主页',
                                    callback_data: 'nav_home'
                                }];

                                if (state === 'WAIT_REMARK') {
                                    sessionData.remark = text;
                                    ctx.waitUntil((async () => {
                                        if (sessionData.is_edit) {
                                            // 编辑流：备注→后缀（可编辑或保持）
                                            await setSession('WAIT_EDIT_PREFIX', sessionData);
                                            await tgPost(env, 'sendMessage', {
                                                chat_id: chatId,
                                                text: `【编辑节点 - 步骤 2/5】\n📝 新备注: ${sessionData.remark}\n\n请输入新的 **后缀** 或保持不变：\n*(当前后缀: \`${sessionData.prefix}\`)*`,
                                                parse_mode: 'Markdown',
                                                reply_markup: {
                                                    inline_keyboard: [
                                                        [{
                                                            text: '✅ 保持不变 (当前: ' + sessionData.prefix + ')',
                                                            callback_data: 'keep_prefix'
                                                        }],
                                                        navRow
                                                    ]
                                                }
                                            });
                                        } else {
                                            await setSession('WAIT_PREFIX', sessionData);
                                            await tgPost(env, 'sendMessage', {
                                                chat_id: chatId,
                                                text: `【新建反代 - 步骤 2/5】\n📝 备注: ${text}\n\n请输入节点的 **短路径后缀** (如: misaka)：\n*(仅限字母、数字、破折号或下划线)*`,
                                                parse_mode: 'Markdown',
                                                reply_markup: {
                                                    inline_keyboard: [navRow]
                                                }
                                            });
                                        }
                                    })());
                                    return new Response("OK");
                                } else if (state === 'WAIT_EDIT_PREFIX') {
                                    // 编辑流：用户输入了新后缀
                                    const newPrefix = text.replace(/[^a-zA-Z0-9\-_]/g, '');
                                    if (!newPrefix) {
                                        ctx.waitUntil(tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: '❌ 后缀只能包含字母、数字、破折号或下划线，请重新输入：',
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{
                                                        text: '✅ 保持不变 (' + sessionData.prefix + ')',
                                                        callback_data: 'keep_prefix'
                                                    }], navRow
                                                ]
                                            }
                                        }));
                                        return new Response("OK");
                                    }
                                    sessionData.prefix = newPrefix;
                                    ctx.waitUntil((async () => {
                                        await setSession('WAIT_MODE', sessionData);
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: `【编辑节点 - 步骤 3/5】\n📝 备注: ${sessionData.remark}\n🔗 后缀: \`${sessionData.prefix}\`\n\n请选择代理模式：`,
                                            parse_mode: 'Markdown',
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{
                                                        text: '保守 (抹除IP)',
                                                        callback_data: 'm_off'
                                                    }, {
                                                        text: '严格 (透传IP)',
                                                        callback_data: 'm_realip_only'
                                                    }],
                                                    [{
                                                        text: '兼容 (双重透传)',
                                                        callback_data: 'm_dual'
                                                    }, {
                                                        text: '强力 (防403)',
                                                        callback_data: 'm_strict'
                                                    }],
                                                    [{
                                                        text: '✅ 保持不变 (当前: ' + (modeDisplayMap[sessionData.orig_mode] || sessionData.orig_mode || '原套') + ')',
                                                        callback_data: 'm_keep'
                                                    }],
                                                    navRow
                                                ]
                                            }
                                        });
                                    })());
                                    return new Response("OK");
                                } else if (state === 'WAIT_PREFIX') {
                                    sessionData.prefix = text.replace(/[^a-zA-Z0-9\-_]/g, '');
                                    if (!sessionData.prefix) {
                                        ctx.waitUntil(tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: '❌ 后缀只能包含字母、数字、破折号或下划线，请重新输入：',
                                            reply_markup: {
                                                inline_keyboard: [navRow]
                                            }
                                        }));
                                        return new Response("OK");
                                    }
                                    ctx.waitUntil((async () => {
                                        await setSession('WAIT_MODE', sessionData);
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: `【新建反代 - 步骤 3/5】\n📝 备注: ${sessionData.remark}\n🔗 后缀: \`${sessionData.prefix}\`\n\n请选择代理模式：`,
                                            parse_mode: 'Markdown',
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{
                                                        text: '保守 (抹除IP)',
                                                        callback_data: 'm_off'
                                                    }, {
                                                        text: '严格 (透传IP)',
                                                        callback_data: 'm_realip_only'
                                                    }],
                                                    [{
                                                        text: '兼容 (双重透传)',
                                                        callback_data: 'm_dual'
                                                    }, {
                                                        text: '强力 (防403)',
                                                        callback_data: 'm_strict'
                                                    }],
                                                    navRow
                                                ]
                                            }
                                        });
                                    })());
                                    return new Response("OK");
                                } else if (state === 'WAIT_TARGET') {
                                    sessionData.target = text;
                                    ctx.waitUntil((async () => {
                                        if (sessionData.is_edit) {
                                            // 编辑流最后一步：直接更新路由
                                            try {
                                                const origPrefix = sessionData.orig_prefix || sessionData.prefix;
                                                const newPrefix = sessionData.prefix;
                                                if (origPrefix !== newPrefix) {
                                                    // 后缀已变更：查旧记、删旧记、插新记
                                                    const oldRow = await env.DB.prepare('SELECT sort_order, cache_img FROM routes WHERE prefix = ?').bind(origPrefix).first().catch(() => null);
                                                    const sortOrder = oldRow ? oldRow.sort_order : 0;
                                                    const cacheImg = oldRow ? oldRow.cache_img : 'on';
                                                    await env.DB.prepare('DELETE FROM routes WHERE prefix = ?').bind(origPrefix).run();
                                                    await env.DB.prepare('INSERT OR REPLACE INTO routes (prefix, target, mode, remark, sort_order, cache_img) VALUES (?, ?, ?, ?, ?, ?)').bind(newPrefix, sessionData.target, sessionData.mode, sessionData.remark, sortOrder, cacheImg).run();
                                                } else {
                                                    await env.DB.prepare('UPDATE routes SET target = ?, mode = ?, remark = ? WHERE prefix = ?').bind(sessionData.target, sessionData.mode, sessionData.remark, origPrefix).run();
                                                }
                                                await clearSession();
                                                const panelUrl = (env.STATS_PANEL_URL || env.PANEL_URL || '').replace(/\/$/, '');
                                                const link = panelUrl ? `${panelUrl}/${newPrefix}/` : `/${newPrefix}/`;
                                                const modeStr = modeDisplayMap[sessionData.mode] || sessionData.mode;
                                                await tgPost(env, 'sendMessage', {
                                                    chat_id: chatId,
                                                    text: `✅ **节点更新成功！**\n\n📝 备注: ${sessionData.remark}\n🔗 后缀: \`${newPrefix}\`\n🔗 直达链接: ${link}\n⚙️ 模式: ${modeStr}`,
                                                    parse_mode: 'Markdown',
                                                    disable_web_page_preview: true
                                                });
                                            } catch (e) {
                                                await tgPost(env, 'sendMessage', {
                                                    chat_id: chatId,
                                                    text: '❌ 更新失败: ' + e.message
                                                });
                                            }
                                        } else {
                                            await setSession('WAIT_FALLBACK', sessionData);
                                            await tgPost(env, 'sendMessage', {
                                                chat_id: chatId,
                                                text: `【新建反代 - 步骤 5/5】\n🎯 主线路: \`${text}\`\n\n请输入 **备用线路** 地址 (选填)：\n*(如果没有请回复 0 或点跳过)*`,
                                                parse_mode: 'Markdown',
                                                reply_markup: {
                                                    inline_keyboard: [
                                                        [{
                                                            text: '⏭️ 跳过（无备用）',
                                                            callback_data: 'skip_fallback'
                                                        }],
                                                        navRow
                                                    ]
                                                }
                                            });
                                        }
                                    })());
                                    return new Response("OK");
                                } else if (state === 'WAIT_FALLBACK') {
                                    let fallback = text.trim();
                                    if (fallback === '0' || fallback === '跳过' || fallback === '无') fallback = '';
                                    const targetUrl = fallback ? `${sessionData.target},${fallback}` : sessionData.target;
                                    ctx.waitUntil((async () => {
                                        try {
                                            const {
                                                results
                                            } = await env.DB.prepare('SELECT MAX(sort_order) as maxSort FROM routes').all();
                                            const maxSort = (results && results[0] && results[0].maxSort !== null) ? results[0].maxSort : -1;
                                            const currentSortOrder = maxSort + 1;
                                            await env.DB.prepare('INSERT OR REPLACE INTO routes (prefix, target, mode, remark, sort_order, cache_img) VALUES (?, ?, ?, ?, ?, ?)').bind(sessionData.prefix, targetUrl, sessionData.mode, sessionData.remark, currentSortOrder, 'on').run();
                                            await clearSession();
                                            const panelUrl = (env.STATS_PANEL_URL || env.PANEL_URL || '').replace(/\/$/, '');
                                            const link = panelUrl ? `${panelUrl}/${sessionData.prefix}/` : `/${sessionData.prefix}/`;
                                            const modeStr = modeDisplayMap[sessionData.mode] || sessionData.mode;
                                            await tgPost(env, 'sendMessage', {
                                                chat_id: chatId,
                                                text: `🎉 **节点部署成功！**\n\n📝 备注: ${sessionData.remark}\n🔗 后缀: \`${sessionData.prefix}\`\n🔗 链接: ${link}\n⚙️ 模式: ${modeStr}`,
                                                parse_mode: 'Markdown',
                                                disable_web_page_preview: true
                                            });
                                        } catch (e) {
                                            await tgPost(env, 'sendMessage', {
                                                chat_id: chatId,
                                                text: '❌ 部署失败: ' + e.message
                                            });
                                        }
                                    })());
                                    return new Response("OK");
                                }
                            }
                        } catch (e) { }
                    }

                    // 处理 /start 命令，下发自定义底部键盘
                    if (/^\/start(?:@\w+)?(?:\s|$)/i.test(text)) {
                        if (msg?.chat?.id && env.TG_BOT_TOKEN) {
                            ctx.waitUntil(tgPost(env, 'sendMessage', {
                                chat_id: msg.chat.id,
                                text: '欢迎使用 玛卡巴卡EMBY反代机器人！请点击下方按钮。',
                                reply_markup: {
                                    keyboard: [
                                        [{
                                            text: '📊 查看运行状态'
                                        }, {
                                            text: '🌐 获取反代节点'
                                        }]
                                    ],
                                    resize_keyboard: true,
                                    is_persistent: true
                                }
                            }));
                        }
                    }
                    // 处理 /nodes 命令，列出所有反代节点
                    if (/^\/nodes(?:@\w+)?(?:\s|$)/i.test(text) || text === '🌐 获取反代节点') {
                        if (env.DB && env.TG_BOT_TOKEN && msg?.chat?.id) {
                            ctx.waitUntil((async () => {
                                try {
                                    const {
                                        results
                                    } = await env.DB.prepare('SELECT prefix, remark, target, mode FROM routes ORDER BY sort_order ASC, prefix ASC').all();

                                    let inlineKeyboard = [
                                        [{
                                            text: '➕ 新建反代节点',
                                            callback_data: 'proxy_create'
                                        }]
                                    ];
                                    let nodeListText = '🌐 <b>反代节点列表</b>\n\n';
                                    const panelUrl = (env.STATS_PANEL_URL || env.PANEL_URL || '').replace(/\/$/, '');

                                    if (results && results.length > 0) {
                                        let currentRow = [];
                                        results.forEach((r, idx) => {
                                            const remark = (r.remark || r.prefix).substring(0, 30);
                                            const link = panelUrl ? `${panelUrl}/${r.prefix}/` : `/${r.prefix}/`;
                                            nodeListText += `▪️ <b>${escapeHTML(remark)}</b>: <a href="${link}">${escapeHTML(link)}</a>\n`;

                                            currentRow.push({
                                                text: `🔧 ${remark}`,
                                                callback_data: `proxy_edit|${r.prefix}`
                                            });
                                            if (currentRow.length === 2) {
                                                inlineKeyboard.push(currentRow);
                                                currentRow = [];
                                            }
                                        });
                                        if (currentRow.length > 0) inlineKeyboard.push(currentRow);
                                    } else {
                                        nodeListText += '暂无节点。\n';
                                    }

                                    await tgPost(env, 'sendMessage', {
                                        chat_id: msg.chat.id,
                                        text: nodeListText + '\n请选择操作：',
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_markup: {
                                            inline_keyboard: inlineKeyboard
                                        }
                                    });
                                } catch (e) {
                                    console.error('获取节点失败:', e);
                                    await tgPost(env, 'sendMessage', {
                                        chat_id: msg.chat.id,
                                        text: '获取节点失败: ' + e.message
                                    });
                                }
                            })());
                        }
                    }
                    if (/^\/status(?:@\w+)?(?:\s|$)/i.test(text) || text === '📊 查看运行状态') {
                        if (env.DB && env.TG_BOT_TOKEN && msg?.chat?.id) {
                            const chatId = msg.chat.id;
                            ctx.waitUntil((async () => {
                                try {
                                    await tgPost(env, 'sendChatAction', {
                                        chat_id: chatId,
                                        action: 'typing'
                                    });
                                    await sendTgStats(env, chatId, true);
                                } catch (err) {
                                    console.error('/status 后台发送失败:', err);
                                    try {
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: '❌ /status 生成失败：' + (err?.message || String(err)),
                                            disable_web_page_preview: true
                                        });
                                    } catch (e) { }
                                }
                            })());
                        } else if (msg?.chat?.id && env.TG_BOT_TOKEN) {
                            ctx.waitUntil(tgPost(env, 'sendMessage', {
                                chat_id: msg.chat.id,
                                text: '❌ /status 无法执行：Worker 未绑定 D1 数据库或 TG_BOT_TOKEN 未配置。'
                            }));
                        }
                    }
                    if (body.callback_query && env.DB && env.TG_BOT_TOKEN) {
                        const cb = body.callback_query;
                        const chatId = cb.message.chat.id;
                        const msgId = cb.message.message_id;
                        const data = cb.data;
                        const cbId = cb.id;

                        const modeDisplayMap = {
                            'off': '保守 (抹除IP)',
                            'realip_only': '严格 (透传IP)',
                            'dual': '兼容 (双重透传)',
                            'strict': '强力 (防403)'
                        };
                        const navRow = [{
                            text: '⬅️ 返回上一步',
                            callback_data: 'nav_back'
                        }, {
                            text: '🏠 返回主页',
                            callback_data: 'nav_home'
                        }];

                        ctx.waitUntil((async () => {
                            if (data === 'nav_home') {
                                // 返回主页：清除会话，重发 /start 欢迎消息和底部键盘
                                await env.DB.prepare('DELETE FROM tg_sessions WHERE chat_id = ?').bind(chatId).run().catch(() => null);
                                await tgPost(env, 'answerCallbackQuery', {
                                    callback_query_id: cbId,
                                    text: '已返回主页'
                                });
                                await tgPost(env, 'sendMessage', {
                                    chat_id: chatId,
                                    text: '🏠 已返回主菜单，请使用下方按钮操作。',
                                    reply_markup: {
                                        keyboard: [
                                            [{
                                                text: '📊 查看运行状态'
                                            }, {
                                                text: '🌐 获取反代节点'
                                            }]
                                        ],
                                        resize_keyboard: true,
                                        is_persistent: true
                                    }
                                });
                            } else if (data === 'nav_back') {
                                // 返回上一步：根据当前 session state 回退
                                const sessionRow = await env.DB.prepare('SELECT state, data FROM tg_sessions WHERE chat_id = ?').bind(chatId).first().catch(() => null);
                                await tgPost(env, 'answerCallbackQuery', {
                                    callback_query_id: cbId,
                                    text: '返回上一步...'
                                });
                                if (!sessionRow) {
                                    await tgPost(env, 'sendMessage', {
                                        chat_id: chatId,
                                        text: '当前没有进行中的操作，请使用底部按钮开始。'
                                    });
                                } else {
                                    const curState = sessionRow.state;
                                    const dt = JSON.parse(sessionRow.data || '{}');
                                    if (curState === 'WAIT_PREFIX') {
                                        // 回到备注输入
                                        await env.DB.prepare('UPDATE tg_sessions SET state = ?, data = ?, updated_at = ? WHERE chat_id = ?').bind('WAIT_REMARK', JSON.stringify(dt), Date.now(), chatId).run();
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: '【新建反代 - 步骤 1/5】\n\n请重新输入节点的 **备注名称**：',
                                            parse_mode: 'Markdown',
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{
                                                        text: '🏠 返回主页',
                                                        callback_data: 'nav_home'
                                                    }]
                                                ]
                                            }
                                        });
                                    } else if (curState === 'WAIT_EDIT_PREFIX') {
                                        // 编辑流：回到备注输入
                                        await env.DB.prepare('UPDATE tg_sessions SET state = ?, data = ?, updated_at = ? WHERE chat_id = ?').bind('WAIT_REMARK', JSON.stringify(dt), Date.now(), chatId).run();
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: `【编辑节点 - 步骤 1/5】\n🔗 当前后缀: \`${dt.prefix}\`\n\n请重新输入 **备注名称**：`,
                                            parse_mode: 'Markdown',
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{
                                                        text: '✅ 保持不变 (' + (dt.orig_remark || dt.remark || '无') + ')',
                                                        callback_data: 'keep_remark'
                                                    }], navRow
                                                ]
                                            }
                                        });
                                    } else if (curState === 'WAIT_MODE') {
                                        // 回到后缀输入（新建）或备注输入（编辑）
                                        if (dt.is_edit) {
                                            await env.DB.prepare('UPDATE tg_sessions SET state = ?, data = ?, updated_at = ? WHERE chat_id = ?').bind('WAIT_EDIT_PREFIX', JSON.stringify(dt), Date.now(), chatId).run();
                                            await tgPost(env, 'sendMessage', {
                                                chat_id: chatId,
                                                text: `【编辑节点 - 步骤 2/5】\n📝 备注: ${dt.remark}\n\n请重新输入新的 **后缀**：`,
                                                parse_mode: 'Markdown',
                                                reply_markup: {
                                                    inline_keyboard: [
                                                        [{
                                                            text: '✅ 保持不变 (' + (dt.orig_prefix || dt.prefix) + ')',
                                                            callback_data: 'keep_prefix'
                                                        }], navRow
                                                    ]
                                                }
                                            });
                                        } else {
                                            await env.DB.prepare('UPDATE tg_sessions SET state = ?, data = ?, updated_at = ? WHERE chat_id = ?').bind('WAIT_PREFIX', JSON.stringify(dt), Date.now(), chatId).run();
                                            await tgPost(env, 'sendMessage', {
                                                chat_id: chatId,
                                                text: `【新建反代 - 步骤 2/5】\n📝 备注: ${dt.remark}\n\n请重新输入 **短路径后缀**：`,
                                                parse_mode: 'Markdown',
                                                reply_markup: {
                                                    inline_keyboard: [navRow]
                                                }
                                            });
                                        }
                                    } else if (curState === 'WAIT_TARGET') {
                                        // 回到模式选择
                                        await env.DB.prepare('UPDATE tg_sessions SET state = ?, data = ?, updated_at = ? WHERE chat_id = ?').bind('WAIT_MODE', JSON.stringify(dt), Date.now(), chatId).run();
                                        const step = dt.is_edit ? '步骤 3/5' : '步骤 3/5';
                                        const editKeepBtn = dt.is_edit ? [
                                            [{
                                                text: '✅ 保持不变 (当前: ' + (modeDisplayMap[dt.orig_mode] || dt.orig_mode || '原套') + ')',
                                                callback_data: 'm_keep'
                                            }]
                                        ] : [];
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: `【${dt.is_edit ? '编辑节点' : '新建反代'} - ${step}】\n\n请重新选择代理模式：`,
                                            parse_mode: 'Markdown',
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{
                                                        text: '保守 (抹除IP)',
                                                        callback_data: 'm_off'
                                                    }, {
                                                        text: '严格 (透传IP)',
                                                        callback_data: 'm_realip_only'
                                                    }],
                                                    [{
                                                        text: '兼容 (双重透传)',
                                                        callback_data: 'm_dual'
                                                    }, {
                                                        text: '强力 (防403)',
                                                        callback_data: 'm_strict'
                                                    }],
                                                    ...editKeepBtn,
                                                    navRow
                                                ]
                                            }
                                        });
                                    } else if (curState === 'WAIT_FALLBACK') {
                                        // 回到主线路输入
                                        await env.DB.prepare('UPDATE tg_sessions SET state = ?, data = ?, updated_at = ? WHERE chat_id = ?').bind('WAIT_TARGET', JSON.stringify(dt), Date.now(), chatId).run();
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: '【新建反代 - 步骤 4/5】\n\n请重新输入节点的主线路 **目标地址 (Target)**：\n*(格式如: http://1.1.1.1:8096)*',
                                            parse_mode: 'Markdown',
                                            reply_markup: {
                                                inline_keyboard: [navRow]
                                            }
                                        });
                                    } else {
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: '无法回退，请重新开始。'
                                        });
                                    }
                                }
                            } else if (data === 'skip_fallback') {
                                // 跳过备用线路，直接部署
                                const sessionRow = await env.DB.prepare('SELECT state, data FROM tg_sessions WHERE chat_id = ?').bind(chatId).first().catch(() => null);
                                await tgPost(env, 'answerCallbackQuery', {
                                    callback_query_id: cbId,
                                    text: '跳过备用线路，开始部署...'
                                });
                                if (sessionRow && sessionRow.state === 'WAIT_FALLBACK') {
                                    const dt = JSON.parse(sessionRow.data || '{}');
                                    try {
                                        const {
                                            results
                                        } = await env.DB.prepare('SELECT MAX(sort_order) as maxSort FROM routes').all();
                                        const maxSort = (results && results[0] && results[0].maxSort !== null) ? results[0].maxSort : -1;
                                        await env.DB.prepare('INSERT OR REPLACE INTO routes (prefix, target, mode, remark, sort_order, cache_img) VALUES (?, ?, ?, ?, ?, ?)').bind(dt.prefix, dt.target, dt.mode, dt.remark, maxSort + 1, 'on').run();
                                        await env.DB.prepare('DELETE FROM tg_sessions WHERE chat_id = ?').bind(chatId).run();
                                        const panelUrl = (env.STATS_PANEL_URL || env.PANEL_URL || '').replace(/\/$/, '');
                                        const link = panelUrl ? `${panelUrl}/${dt.prefix}/` : `/${dt.prefix}/`;
                                        const modeStr = modeDisplayMap[dt.mode] || dt.mode;
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: `🎉 **节点部署成功！**\n\n📝 备注: ${dt.remark}\n🔗 后缀: \`${dt.prefix}\`\n🔗 链接: ${link}\n⚙️ 模式: ${modeStr}`,
                                            parse_mode: 'Markdown',
                                            disable_web_page_preview: true
                                        });
                                    } catch (e) {
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: '❌ 部署失败: ' + e.message
                                        });
                                    }
                                }
                            } else if (data === 'proxy_create') {
                                await tgPost(env, 'answerCallbackQuery', {
                                    callback_query_id: cbId,
                                    text: '启动向导...'
                                });
                                await env.DB.exec(`CREATE TABLE IF NOT EXISTS tg_sessions (chat_id INTEGER PRIMARY KEY, state TEXT, data TEXT, updated_at INTEGER)`);
                                await env.DB.prepare('INSERT OR REPLACE INTO tg_sessions (chat_id, state, data, updated_at) VALUES (?, ?, ?, ?)').bind(chatId, 'WAIT_REMARK', '{}', Date.now()).run();
                                await tgPost(env, 'sendMessage', {
                                    chat_id: chatId,
                                    text: '【新建反代 - 步骤 1/5】\n\n请输入节点的 **备注名称**：\n*(例如: 主线路优化)*',
                                    parse_mode: 'Markdown',
                                    reply_markup: {
                                        inline_keyboard: [
                                            [{
                                                text: '🏠 返回主页',
                                                callback_data: 'nav_home'
                                            }]
                                        ]
                                    }
                                });
                            } else if (data.startsWith('proxy_edit|')) {
                                const prefix = data.split('|')[1];
                                const node = await env.DB.prepare('SELECT * FROM routes WHERE prefix = ?').bind(prefix).first();
                                if (node) {
                                    await tgPost(env, 'answerCallbackQuery', {
                                        callback_query_id: cbId,
                                        text: '查看节点...'
                                    });
                                    const modeStr = modeDisplayMap[node.mode] || '未知';
                                    const detailText = `🔧 **节点详情: ${node.remark || node.prefix}**\n\n` +
                                        `📌 **后缀**: \`${node.prefix}\`\n` +
                                        `⚙️ **模式**: ${modeStr}\n` +
                                        `🎯 **目标地址**: \`${node.target}\`\n` +
                                        `🔄 **备用线路**: ${node.fallback || '无'}`;
                                    await tgPost(env, 'sendMessage', {
                                        chat_id: chatId,
                                        text: detailText,
                                        parse_mode: 'Markdown',
                                        reply_markup: {
                                            inline_keyboard: [
                                                [{
                                                    text: '📝 编辑该节点',
                                                    callback_data: `proxy_do_edit|${prefix}`
                                                }, {
                                                    text: '🗑️ 删除该节点',
                                                    callback_data: `proxy_del|${prefix}`
                                                }],
                                                [{
                                                    text: '🏠 返回主页',
                                                    callback_data: 'nav_home'
                                                }]
                                            ]
                                        }
                                    });
                                } else {
                                    await tgPost(env, 'answerCallbackQuery', {
                                        callback_query_id: cbId,
                                        text: '节点不存在',
                                        show_alert: true
                                    });
                                }
                            } else if (data.startsWith('proxy_do_edit|')) {
                                const prefix = data.split('|')[1];
                                const node = await env.DB.prepare('SELECT * FROM routes WHERE prefix = ?').bind(prefix).first();
                                if (node) {
                                    await tgPost(env, 'answerCallbackQuery', {
                                        callback_query_id: cbId,
                                        text: '启动编辑向导...'
                                    });
                                    await env.DB.exec(`CREATE TABLE IF NOT EXISTS tg_sessions (chat_id INTEGER PRIMARY KEY, state TEXT, data TEXT, updated_at INTEGER)`);
                                    // 将节点原有数据全部存入 session，方便后续用于“保持不变”功能
                                    const initData = {
                                        prefix: prefix,
                                        orig_prefix: prefix,
                                        is_edit: true,
                                        orig_remark: node.remark,
                                        orig_mode: node.mode,
                                        orig_target: node.target,
                                        orig_fallback: node.fallback || '',
                                        remark: node.remark,
                                        mode: node.mode,
                                        target: node.target
                                    };
                                    await env.DB.prepare('INSERT OR REPLACE INTO tg_sessions (chat_id, state, data, updated_at) VALUES (?, ?, ?, ?)').bind(chatId, 'WAIT_REMARK', JSON.stringify(initData), Date.now()).run();
                                    await tgPost(env, 'sendMessage', {
                                        chat_id: chatId,
                                        text: `【编辑节点 - 步骤 1/5】\n🔗 当前后缀: \`${prefix}\`\n\n请输入新的 **备注名称**：\n*(原备注: ${node.remark})*`,
                                        parse_mode: 'Markdown',
                                        reply_markup: {
                                            inline_keyboard: [
                                                [{
                                                    text: '✅ 保持不变 (' + (node.remark || '无') + ')',
                                                    callback_data: 'keep_remark'
                                                }],
                                                navRow
                                            ]
                                        }
                                    });
                                }
                            } else if (data.startsWith('proxy_del|')) {
                                const prefix = data.split('|')[1];
                                await env.DB.prepare('DELETE FROM routes WHERE prefix = ?').bind(prefix).run();
                                await tgPost(env, 'answerCallbackQuery', {
                                    callback_query_id: cbId,
                                    text: '🗑️ 节点已删除',
                                    show_alert: true
                                });
                                await tgPost(env, 'sendMessage', {
                                    chat_id: chatId,
                                    text: `✅ 节点 \`${prefix}\` 已被永久删除。`,
                                    parse_mode: 'Markdown',
                                    reply_markup: {
                                        inline_keyboard: [
                                            [{
                                                text: '🏠 返回主页',
                                                callback_data: 'nav_home'
                                            }]
                                        ]
                                    }
                                });
                            } else if (data === 'keep_remark') {
                                // 备注保持不变，跳到后缀编辑步骤
                                await tgPost(env, 'answerCallbackQuery', {
                                    callback_query_id: cbId,
                                    text: '备注保持不变'
                                });
                                const sessionRow_kr = await env.DB.prepare('SELECT state, data FROM tg_sessions WHERE chat_id = ?').bind(chatId).first().catch(() => null);
                                if (sessionRow_kr && sessionRow_kr.state === 'WAIT_REMARK') {
                                    const dt = JSON.parse(sessionRow_kr.data || '{}');
                                    // 备注保持不变：确保 data 里的 remark 还原为原始备注
                                    dt.remark = dt.orig_remark || dt.remark;
                                    await env.DB.prepare('UPDATE tg_sessions SET state = ?, data = ?, updated_at = ? WHERE chat_id = ?').bind('WAIT_EDIT_PREFIX', JSON.stringify(dt), Date.now(), chatId).run();
                                    await tgPost(env, 'sendMessage', {
                                        chat_id: chatId,
                                        text: `【编辑节点 - 步骤 2/5】\n📝 备注: ${dt.remark} (保持)\n\n请输入新的 **后缀** 或保持不变：`,
                                        parse_mode: 'Markdown',
                                        reply_markup: {
                                            inline_keyboard: [
                                                [{
                                                    text: '✅ 保持不变 (当前: ' + dt.prefix + ')',
                                                    callback_data: 'keep_prefix'
                                                }],
                                                navRow
                                            ]
                                        }
                                    });
                                }
                            } else if (data === 'keep_prefix') {
                                // 后缀保持不变，跳到模式选择
                                await tgPost(env, 'answerCallbackQuery', {
                                    callback_query_id: cbId,
                                    text: '后缀保持不变'
                                });
                                const sessionRow_kp = await env.DB.prepare('SELECT state, data FROM tg_sessions WHERE chat_id = ?').bind(chatId).first().catch(() => null);
                                if (sessionRow_kp && sessionRow_kp.state === 'WAIT_EDIT_PREFIX') {
                                    const dt = JSON.parse(sessionRow_kp.data || '{}');
                                    await env.DB.prepare('UPDATE tg_sessions SET state = ?, updated_at = ? WHERE chat_id = ?').bind('WAIT_MODE', Date.now(), chatId).run();
                                    await tgPost(env, 'sendMessage', {
                                        chat_id: chatId,
                                        text: `【编辑节点 - 步骤 3/5】\n📝 备注: ${dt.remark}\n🔗 后缀: \`${dt.prefix}\` (保持)\n\n请选择代理模式：`,
                                        parse_mode: 'Markdown',
                                        reply_markup: {
                                            inline_keyboard: [
                                                [{
                                                    text: '保守 (抹除IP)',
                                                    callback_data: 'm_off'
                                                }, {
                                                    text: '严格 (透传IP)',
                                                    callback_data: 'm_realip_only'
                                                }],
                                                [{
                                                    text: '兼容 (双重透传)',
                                                    callback_data: 'm_dual'
                                                }, {
                                                    text: '强力 (防403)',
                                                    callback_data: 'm_strict'
                                                }],
                                                [{
                                                    text: '✅ 保持不变 (当前: ' + (modeDisplayMap[dt.orig_mode] || dt.orig_mode || '原套') + ')',
                                                    callback_data: 'm_keep'
                                                }],
                                                navRow
                                            ]
                                        }
                                    });
                                }
                            } else if (data === 'keep_target') {
                                // 目标地址保持不变（编辑流）
                                const sessionRow = await env.DB.prepare('SELECT state, data FROM tg_sessions WHERE chat_id = ?').bind(chatId).first().catch(() => null);
                                await tgPost(env, 'answerCallbackQuery', {
                                    callback_query_id: cbId,
                                    text: '目标地址保持不变'
                                });
                                if (sessionRow && sessionRow.state === 'WAIT_TARGET') {
                                    const dt = JSON.parse(sessionRow.data || '{}');
                                    // target 保持原值，直接提交部署（同样支持后缀变更）
                                    try {
                                        const origPrefix = dt.orig_prefix || dt.prefix;
                                        const newPrefix = dt.prefix;
                                        if (origPrefix !== newPrefix) {
                                            const oldRow = await env.DB.prepare('SELECT sort_order, cache_img FROM routes WHERE prefix = ?').bind(origPrefix).first().catch(() => null);
                                            const sortOrder = oldRow ? oldRow.sort_order : 0;
                                            const cacheImg = oldRow ? oldRow.cache_img : 'on';
                                            await env.DB.prepare('DELETE FROM routes WHERE prefix = ?').bind(origPrefix).run();
                                            await env.DB.prepare('INSERT OR REPLACE INTO routes (prefix, target, mode, remark, sort_order, cache_img) VALUES (?, ?, ?, ?, ?, ?)').bind(newPrefix, dt.target, dt.mode, dt.remark, sortOrder, cacheImg).run();
                                        } else {
                                            await env.DB.prepare('UPDATE routes SET target = ?, mode = ?, remark = ? WHERE prefix = ?').bind(dt.target, dt.mode, dt.remark, origPrefix).run();
                                        }
                                        await env.DB.prepare('DELETE FROM tg_sessions WHERE chat_id = ?').bind(chatId).run();
                                        const panelUrl = (env.STATS_PANEL_URL || env.PANEL_URL || '').replace(/\/$/, '');
                                        const link = panelUrl ? `${panelUrl}/${newPrefix}/` : `/${newPrefix}/`;
                                        const modeStr = modeDisplayMap[dt.mode] || dt.mode;
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: `✅ **节点更新成功！**\n\n📝 备注: ${dt.remark}\n🔗 后缀: \`${newPrefix}\`\n🔗 直达链接: ${link}\n⚙️ 模式: ${modeStr}\n🎯 目标: ${dt.target} (保持)`,
                                            parse_mode: 'Markdown',
                                            disable_web_page_preview: true
                                        });
                                    } catch (e) {
                                        await tgPost(env, 'sendMessage', {
                                            chat_id: chatId,
                                            text: '❌ 更新失败: ' + e.message
                                        });
                                    }
                                }
                            } else if (data.startsWith('m_')) {
                                // 模式选择——先立刻响应按钮，再做 DB 操作（避免 Telegram 超时重试）
                                await tgPost(env, 'answerCallbackQuery', {
                                    callback_query_id: cbId,
                                    text: '正在设置模式...'
                                });
                                const modeSel = data === 'm_keep' ? null : data.replace('m_', '');
                                const sessionRow_m = await env.DB.prepare('SELECT state, data FROM tg_sessions WHERE chat_id = ?').bind(chatId).first().catch(() => null);
                                if (sessionRow_m && sessionRow_m.state === 'WAIT_MODE') {
                                    let dt = JSON.parse(sessionRow_m.data || '{}');
                                    const finalMode = modeSel !== null ? modeSel : (dt.orig_mode || dt.mode || 'off');
                                    dt.mode = finalMode;
                                    await env.DB.prepare('UPDATE tg_sessions SET state = ?, data = ?, updated_at = ? WHERE chat_id = ?').bind('WAIT_TARGET', JSON.stringify(dt), Date.now(), chatId).run();
                                    const modeStr = modeDisplayMap[finalMode] || finalMode;
                                    const keepHint = modeSel === null ? ' (保持不变)' : '';
                                    const step = dt.is_edit ? '步骤 4/5' : '步骤 4/5';
                                    const targetKeepBtn = dt.is_edit ? [
                                        [{
                                            text: `✅ 保持不变 (${dt.orig_target || dt.target || '无'})`,
                                            callback_data: 'keep_target'
                                        }]
                                    ] : [];
                                    await tgPost(env, 'sendMessage', {
                                        chat_id: chatId,
                                        text: `【${dt.is_edit ? '编辑节点' : '新建反代'} - ${step}】\n⚙️ 模式: ${modeStr}${keepHint}\n\n请输入节点的主线路 **目标地址 (Target)**：\n*(格式如: http://1.1.1.1:8096)*`,
                                        parse_mode: 'Markdown',
                                        reply_markup: {
                                            inline_keyboard: [...targetKeepBtn, navRow]
                                        }
                                    });
                                } else {
                                    await tgPost(env, 'sendMessage', {
                                        chat_id: chatId,
                                        text: '会话已过期，请重新开始。'
                                    });
                                }
                            }
                        })());
                    }
                    return new Response("OK");
                } catch (e) {
                    console.error("TG Webhook Error: ", e);
                    return new Response("OK");
                }
            }
            return new Response("Method not allowed", {
                status: 405
            });
        }

        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Max-Age": "86400"
                }
            });
        }

        const EXPECTED_TOKEN = env.ADMIN_TOKEN;
        if (!EXPECTED_TOKEN) return new Response("请在 Worker 变量中配置 ADMIN_TOKEN", {
            status: 500
        });

        function getCookie(req, name) {
            const cookieString = req.headers.get("Cookie");
            if (!cookieString) return null;
            const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
            if (match) return decodeURIComponent(match[2]);
            return null;
        }

        // ==========================================
        // 🔐 新增：安全登录校验与 Set-Cookie 下发
        // ==========================================
        if (url.pathname === '/api/login' && request.method === 'POST') {
            try {
                const { token } = await request.json();
                if (!token) {
                    return Response.json({ success: false, error: '密钥不能为空' }, { status: 400 });
                }
                if (token === EXPECTED_TOKEN) {
                    const headers = new Headers();
                    headers.set('Content-Type', 'application/json;charset=UTF-8');
                    const isHttps = url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
                    const secureAttr = isHttps ? '; Secure' : '';
                    headers.append('Set-Cookie', `admin_token=${encodeURIComponent(token)}; Path=/; Max-Age=2592000; SameSite=Lax${secureAttr}`);
                    return new Response(JSON.stringify({ success: true, message: '登录验证成功' }), {
                        status: 200,
                        headers
                    });
                } else {
                    return Response.json({ success: false, error: '密钥错误，请核对环境变量 ADMIN_TOKEN' }, { status: 401 });
                }
            } catch (e) {
                return Response.json({ success: false, error: '请求解析失败: ' + e.message }, { status: 500 });
            }
        }

        const isPanelOrApi = url.pathname === '/admin' || url.pathname.startsWith('/api/');
        if (isPanelOrApi && url.pathname !== '/api/tg-webhook' && url.pathname !== '/api/ping-node' && url.pathname !== '/api/get-remote-ips' && url.pathname !== '/api/placement') {
            const providedToken = getCookie(request, 'admin_token');
            if (providedToken !== EXPECTED_TOKEN) {
                if (url.pathname === '/admin') return new Response(LOGIN_UI, {
                    headers: {
                        "Content-Type": "text/html;charset=UTF-8"
                    }
                });
                else return new Response('Unauthorized', {
                    status: 401
                });
            }
        }

        if (url.pathname === '/admin') {
            const rawUrl = (typeof GITHUB_RAW_URL === 'string' && !GITHUB_RAW_URL.includes('这里填') && GITHUB_RAW_URL.startsWith('http')) ? GITHUB_RAW_URL : '';
            const injectedHtml = HTML_UI
                .replace(/__DYNAMIC_GITHUB_RAW_URL__/g, rawUrl)
                .replace(/__DYNAMIC_CURRENT_VERSION__/g, CURRENT_VERSION);
            return new Response(injectedHtml, {
                headers: {
                    "Content-Type": "text/html;charset=UTF-8"
                }
            });
        }

        if (url.pathname === '/') {
            let routesHtml = '';
            if (env.DB) {
                try {
                    const {
                        results
                    } = await env.DB.prepare(`SELECT prefix, remark, icon FROM routes ORDER BY sort_order ASC, prefix ASC`).all();
                    if (results && results.length > 0) {
                        routesHtml = results.map(r => {
                            const fullUrl = url.origin + '/' + r.prefix;
                            let iconHtml = '🚀';
                            if (r.icon) {
                                const trimIcon = r.icon.trim();
                                if (trimIcon.startsWith('http://') || trimIcon.startsWith('https://') || trimIcon.startsWith('/') || trimIcon.startsWith('data:')) {
                                    iconHtml = `<img src="${trimIcon}" referrerpolicy="no-referrer" loading="lazy" style="width:24px;height:24px;min-width:24px;min-height:24px;border-radius:4px;object-fit:contain;vertical-align:middle;display:inline-block;flex-shrink:0;" alt="icon" onerror="this.style.display='none';this.parentElement.innerHTML='🎬';">`;
                                } else {
                                    iconHtml = trimIcon;
                                }
                            }
                            return `
                            <div class="source-card">
                                <div class="card-top">
                                    <div class="card-title-wrap">
                                        <span class="card-icon">${iconHtml}</span>
                                        <span class="card-title">${r.remark || '未命名节点'}</span>
                                    </div>
                                    <span id="ping-${r.prefix}" class="home-ping-badge seal-badge" data-prefix="${r.prefix}" data-url="${fullUrl}" onclick="pingNode('${r.prefix}', '${fullUrl}')" title="点击重新测速">测速中...</span>
                                </div>
                                <div class="node-url-box">${fullUrl}</div>
                                <div class="card-actions">
                                    <button class="btn btn-copy" onclick="copyText('${fullUrl}', this)">拓印链接</button>
                                </div>
                            </div>
                            `;
                        }).join('');
                    } else {
                        routesHtml = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-sec);">暂无可用节点</div>';
                    }
                } catch (e) {
                    routesHtml = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: red;">加载节点失败</div>';
                }
            } else {
                routesHtml = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-sec);">未绑定数据库，无法加载节点</div>';
            }

            const contactUrl = env.AUTHOR_CONTACT_URL || 'https://t.me/sddzn_bot';
            const finalHtml = HOME_UI.replace('{{ROUTES_HTML}}', routesHtml).replace('{{CONTACT_URL}}', contactUrl);

            return new Response(finalHtml, {
                headers: {
                    "Content-Type": "text/html;charset=UTF-8"
                }
            });
        }

        // ==========================================
        // 2.3 数据大屏统计接口 (Analytics)
        // ==========================================
        // ==========================================
        // 🛡️ 客户端白名单设置获取与保存
        // ==========================================
        if (url.pathname === '/api/whitelist' && request.method === 'GET') {
            const defaults = ['Infuse', 'Fileball', 'VidHub', 'Emby', 'SenPlayer', 'PotPlayer', 'Kodi', 'Jellyfin', 'Yamby', 'Forward', 'AfuseKt'];
            let enabled = false;
            let customList = [];
            if (env.DB) {
                try {
                    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS system_configs (key TEXT PRIMARY KEY, value TEXT)`).run();
                    const enRow = await env.DB.prepare(`SELECT value FROM system_configs WHERE key = 'whitelist_enabled'`).first();
                    if (enRow && enRow.value === '1') enabled = true;
                    const custRow = await env.DB.prepare(`SELECT value FROM system_configs WHERE key = 'whitelist_custom'`).first();
                    if (custRow && custRow.value) {
                        try { customList = JSON.parse(custRow.value); } catch(e){}
                    }
                } catch(e){}
            }
            return Response.json({ success: true, enabled, presets: defaults, customs: customList });
        }

        if (url.pathname === '/api/whitelist' && request.method === 'POST') {
            if (!env.DB) return Response.json({ success: false, error: '未绑定 D1 数据库' });
            try {
                const body = await request.json();
                const enabled = body.enabled ? '1' : '0';
                const customs = JSON.stringify(body.customs || []);
                await env.DB.prepare(`CREATE TABLE IF NOT EXISTS system_configs (key TEXT PRIMARY KEY, value TEXT)`).run();
                await env.DB.prepare(`INSERT OR REPLACE INTO system_configs (key, value) VALUES ('whitelist_enabled', ?)`).bind(enabled).run();
                await env.DB.prepare(`INSERT OR REPLACE INTO system_configs (key, value) VALUES ('whitelist_custom', ?)`).bind(customs).run();
                return Response.json({ success: true });
            } catch(e) {
                return Response.json({ success: false, error: e.message });
            }
        }

        if (url.pathname === '/api/analytics' && request.method === 'GET') {
            let trafficToday = '0 B', traffic7d = '0 B', traffic30d = '0 B';
            let trendList = [], locationsList = [], recentsList = [];

            if (env.DB) {
                try {
                    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS visitor_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        prefix TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        ip TEXT,
                        country TEXT,
                        ua TEXT,
                        path TEXT
                    )`).run();

                    const trend = await env.DB.prepare(`SELECT date(timestamp, '+8 hours') as date, COUNT(*) as count FROM visitor_logs WHERE timestamp >= datetime('now', '-7 days') GROUP BY date(timestamp, '+8 hours') ORDER BY date ASC`).all();
                    trendList = (trend && trend.results) ? trend.results : [];
                } catch(e) {}

                try {
                    const recentsRaw = await env.DB.prepare(`SELECT prefix, datetime(timestamp, '+8 hours') as timestamp, ip, country, ua FROM visitor_logs ORDER BY timestamp DESC LIMIT 20`).all();
                    const rawList = (recentsRaw && recentsRaw.results) ? recentsRaw.results : [];
                    
                    recentsList = await Promise.all(rawList.map(async (row) => {
                        let precise = row.country;
                        if (!precise || precise === 'Unknown' || precise === 'CN' || precise.includes('国内流量') || precise === '未知' || precise === '中国大陆') {
                            if (row.ip && row.ip !== 'Unknown') {
                                try {
                                    precise = await resolveIpPrecise(row.ip);
                                } catch(e) { precise = '中国大陆 · 电信/移动'; }
                            }
                        }
                        return {
                            ...row,
                            country: precise || '中国大陆 · 电信/移动'
                        };
                    }));
                } catch(e) {}

                try {
                    const locCountMap = {};
                    recentsList.forEach(r => {
                        const loc = r.country ? r.country.split(' ')[0] : '中国大陆';
                        locCountMap[loc] = (locCountMap[loc] || 0) + 1;
                    });
                    locationsList = Object.keys(locCountMap).map(k => ({ country: k, count: locCountMap[k] }));
                } catch(e) {}
            }

            try {
                const trafficPromise = Promise.all([
                    getCFTraffic(env, 'today'),
                    getCFTraffic(env, 7),
                    getCFTraffic(env, 30)
                ]);
                const timeoutTraffic = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));
                const res = await Promise.race([trafficPromise, timeoutTraffic]);
                trafficToday = res[0] || '0 B'; traffic7d = res[1] || '0 B'; traffic30d = res[2] || '0 B';
            } catch(e) { }

            return Response.json({
                success: true,
                trend: trendList,
                locations: locationsList,
                recents: recentsList,
                trafficToday,
                traffic7d,
                traffic30d
            });
        }

        // ==========================================
        // 🟢 后端接口：执行代码覆盖更新 (纯JSON接口无损继承：变量、数据库、兼容性、放置地区)
        // ==========================================
        if (url.pathname === '/api/deploy' && request.method === 'POST') {
            const cfToken = env.CF_API_TOKEN;
            const accountId = env.CF_ACCOUNT_ID;
            const workerName = env.CF_WORKER_NAME;
            if (!cfToken || !accountId || !workerName) {
                return Response.json({
                    success: false,
                    error: '缺少 CF_API_TOKEN, CF_ACCOUNT_ID 或 CF_WORKER_NAME 环境变量'
                });
            }
            try {
                const body = await request.json();
                if (!body.newCode) return Response.json({
                    success: false,
                    error: '代码内容为空。'
                });

                // 1. 🚀 终极修复：调用纯 JSON 的 services 接口获取真实配置，绝对不再崩溃！
                const serviceRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/services/${workerName}`, {
                    headers: {
                        'Authorization': `Bearer ${cfToken}`
                    }
                });
                const serviceData = await serviceRes.json();

                let compDate = "2024-01-01"; // 依然保留兜底，但这次绝不会用到
                let compFlags = undefined;
                let placement = undefined;

                if (serviceData.success && serviceData.result) {
                    // 精准从 JSON 中提取你原本的配置
                    let scriptInfo = null;
                    if (serviceData.result.default_environment && serviceData.result.default_environment.script) {
                        scriptInfo = serviceData.result.default_environment.script;
                    } else if (serviceData.result.script) {
                        scriptInfo = serviceData.result.script;
                    }

                    if (scriptInfo) {
                        if (scriptInfo.compatibility_date) compDate = scriptInfo.compatibility_date;
                        if (scriptInfo.compatibility_flags) compFlags = scriptInfo.compatibility_flags;
                        if (scriptInfo.placement) placement = scriptInfo.placement;
                    }
                }

                const preservedBindings = [];
                // 2. 备份普通的字符串变量
                for (const key in env) {
                    if (typeof env[key] === 'string') {
                        preservedBindings.push({
                            name: key,
                            type: 'plain_text',
                            text: env[key]
                        });
                    }
                }

                // 3. 拉取 D1、KV 等高级绑定并无损合并
                const bindingsRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}/bindings`, {
                    headers: {
                        'Authorization': `Bearer ${cfToken}`
                    }
                });
                const bindingsData = await bindingsRes.json();
                if (bindingsData.success && Array.isArray(bindingsData.result)) {
                    for (const b of bindingsData.result) {
                        if (b.type !== 'plain_text' && b.type !== 'secret_text' && b.type !== 'inherited') {
                            preservedBindings.push(b);
                        }
                    }
                }

                // 4. 组装最终的部署请求
                const formData = new FormData();
                const metadata = {
                    main_module: 'worker.js',
                    bindings: preservedBindings,
                    compatibility_date: compDate
                };
                if (compFlags) metadata.compatibility_flags = compFlags;
                if (placement) metadata.placement = placement; // 🎯 完美带上你原始的放置地区！

                formData.append('metadata', new Blob([JSON.stringify(metadata)], {
                    type: 'application/json'
                }), 'metadata.json');
                formData.append('worker.js', new Blob([body.newCode], {
                    type: 'application/javascript+module'
                }), 'worker.js');

                const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`;
                const res = await fetch(cfUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${cfToken}`
                    },
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    return Response.json({
                        success: true,
                        msg: '代码更新成功，并已完美保留原有放置地区和兼容配置！'
                    });
                } else {
                    throw new Error(JSON.stringify(data.errors));
                }
            } catch (e) {
                return Response.json({
                    success: false,
                    error: e.message
                });
            }
        }
        // ==========================================
        // 2.4 系统级与提取工具 API 
        // ==========================================
        if (url.pathname === '/api/purge-cache' && request.method === 'POST') {
            const cfToken = env.CF_API_TOKEN;
            const zoneId = env.CF_ZONE_ID;
            if (!cfToken || !zoneId) return Response.json({
                success: false,
                error: '缺少 CF_API_TOKEN 或 CF_ZONE_ID 变量'
            });
            try {
                const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${cfToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        purge_everything: true
                    })
                });
                const data = await res.json();
                if (!data.success) throw new Error(JSON.stringify(data.errors));
                return Response.json({
                    success: true
                });
            } catch (e) {
                return Response.json({
                    success: false,
                    error: e.message
                });
            }
        }

        if (url.pathname === '/api/ping-node') {
            const prefix = url.searchParams.get('prefix');
            let target = url.searchParams.get('url');
            if (prefix && env.DB) {
                try {
                    const row = await env.DB.prepare('SELECT target FROM routes WHERE prefix = ?').bind(prefix).first();
                    if (row && row.target) {
                        const firstUrl = row.target.split(',')[0].trim();
                        target = firstUrl;
                    }
                } catch (e) { }
            }
            if (!target) return Response.json({
                ms: -1
            }, {
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
            if (target.includes('://') && !target.endsWith('/system/ping')) {
                target = target.replace(/\/+$/, '') + '/system/ping';
            }
            const start = Date.now();
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);
                const reqHeaders = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                };
                if (env.EMOS_PROXY_ID) reqHeaders['EMOS-PROXY-ID'] = String(env.EMOS_PROXY_ID).trim();
                if (env.EMOS_PROXY_NAME) reqHeaders['EMOS-PROXY-NAME'] = String(env.EMOS_PROXY_NAME).trim();
                const res = await fetch(target, {
                    method: 'GET',
                    signal: controller.signal,
                    redirect: 'follow',
                    headers: reqHeaders
                });
                clearTimeout(timeoutId);
                const ms = Date.now() - start;
                return Response.json({
                    ms: ms > 0 ? ms : 120
                }, {
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch (err) {
                return Response.json({
                    ms: -1
                }, {
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        if (url.pathname === '/api/get-dns') {
            const cfToken = env.CF_API_TOKEN;
            const zoneId = env.CF_ZONE_ID;
            const domain = env.CF_DOMAIN;
            if (!cfToken || !zoneId || !domain) return Response.json({
                success: false,
                error: '缺少 DNS 环境变量'
            });
            try {
                const getRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${domain}`, {
                    headers: {
                        'Authorization': `Bearer ${cfToken}`
                    }
                });
                const getData = await getRes.json();
                return Response.json({
                    success: true,
                    result: getData.result
                });
            } catch (error) {
                return Response.json({
                    success: false,
                    error: error.message
                });
            }
        }

        if (url.pathname === '/api/update-dns' && request.method === 'POST') {
            const body = await request.json();
            const ips = body.ips;
            const isAppend = body.append === true;
            const cfToken = env.CF_API_TOKEN;
            const zoneId = env.CF_ZONE_ID;
            const domain = env.CF_DOMAIN;

            if (!cfToken || !zoneId || !domain) return Response.json({
                success: false,
                error: '缺少 DNS 环境变量'
            });
            try {
                if (!isAppend) {
                    const getRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${domain}`, {
                        headers: {
                            'Authorization': `Bearer ${cfToken}`
                        }
                    });
                    const getData = await getRes.json();
                    if (!getData.success) throw new Error('获取现有 DNS 记录失败');

                    const oldRecords = getData.result.filter(r => r.type === 'A' || r.type === 'AAAA' || r.type === 'CNAME');
                    for (const record of oldRecords) {
                        await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${cfToken}`
                            }
                        });
                    }
                }

                for (const ip of ips) {
                    const cleanItem = ip.replace(/[\[\]]/g, '');
                    let recordType = 'A';
                    if (cleanItem.includes(':')) recordType = 'AAAA';
                    else if (/[a-zA-Z]/.test(cleanItem)) recordType = 'CNAME';

                    const postRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${cfToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            type: recordType,
                            name: domain,
                            content: cleanItem,
                            ttl: 60,
                            proxied: false
                        })
                    });
                    const postData = await postRes.json();
                    if (!postData.success) {
                        const errObj = postData.errors?.[0];
                        // 81058 means the record already exists. We can just ignore it and continue adding other IPs.
                        if (errObj && errObj.code === 81058) {
                            continue;
                        }
                        if (errObj && (errObj.code === 81062 || String(errObj.message).includes('managed by Workers'))) {
                            throw new Error(`当前域名 (${domain}) 已在 Cloudflare 绑定为 Worker 的自定义域名(Custom Domain)。Cloudflare 系统禁止对 Worker 自定义域名添加/修改普通的 A/AAAA 记录。如需使用优选 IP 功能，请前往 CF 后台 Worker 触发器中解除自定义域名绑定，或使用二级 DNS 域名。`);
                        }
                        throw new Error(`记录提交失败: ` + JSON.stringify(postData.errors));
                    }
                }
                return Response.json({
                    success: true,
                    message: `✅ 成功！`
                });
            } catch (error) {
                return Response.json({
                    success: false,
                    error: error.message
                });
            }
        }


        // ==========================================
        // 🚀 新增：自定义 API 源管理 (D1 数据库持久化)
        // ==========================================
        if (url.pathname === '/api/custom-apis') {
            if (!env.DB) {
                return Response.json({ success: false, error: '未绑定 D1 数据库' }, { status: 500 });
            }
            try {
                await env.DB.exec(`CREATE TABLE IF NOT EXISTS custom_api_sources (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, url TEXT, created_at INTEGER)`);
            } catch (e) { }

            if (request.method === 'GET') {
                try {
                    const { results } = await env.DB.prepare('SELECT id, name, url FROM custom_api_sources ORDER BY id DESC').all();
                    return Response.json({ success: true, apis: results || [] });
                } catch (e) {
                    return Response.json({ success: false, error: e.message }, { status: 500 });
                }
            }

            if (request.method === 'POST') {
                try {
                    const { name, url: targetApiUrl } = await request.json();
                    if (!targetApiUrl) return Response.json({ success: false, error: 'API URL 不能为空' }, { status: 400 });
                    await env.DB.prepare('INSERT INTO custom_api_sources (name, url, created_at) VALUES (?, ?, ?)').bind(name || '自定义源', targetApiUrl, Date.now()).run();
                    return Response.json({ success: true });
                } catch (e) {
                    return Response.json({ success: false, error: e.message }, { status: 500 });
                }
            }

            if (request.method === 'DELETE') {
                try {
                    const id = url.searchParams.get('id');
                    if (!id) return Response.json({ success: false, error: '缺少 ID 参数' }, { status: 400 });
                    await env.DB.prepare('DELETE FROM custom_api_sources WHERE id = ?').bind(id).run();
                    return Response.json({ success: true });
                } catch (e) {
                    return Response.json({ success: false, error: e.message }, { status: 500 });
                }
            }
        }

        // ==========================================
        // 🚀 快捷获取 Telegram setWebhook 完整注册绑定链接并在新网页打开
        // ==========================================
        // ===== 🖼️ 背景壁纸与透明度持久化 API (D1 存储) =====
                        if (url.pathname === '/api/bg-settings' && request.method === 'GET') {
                if (!env.DB) return new Response(JSON.stringify({"opacity":0.95,"card_opacity":0.65,"blur":0,"category":"all","custom_desktop_url":"","custom_mobile_url":""}), { headers: { 'Content-Type': 'application/json' } });
                try {
                    await env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)").run();
                    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'bg_settings'").first();
                    const val = row && row.value ? JSON.parse(row.value) : {"opacity":0.95,"card_opacity":0.65,"blur":0,"category":"all","custom_desktop_url":"","custom_mobile_url":""};
                    return new Response(JSON.stringify(val), { headers: { 'Content-Type': 'application/json' } });
                } catch (e) {
                    return new Response(JSON.stringify({"opacity":0.95,"card_opacity":0.65,"blur":0,"category":"all","custom_desktop_url":"","custom_mobile_url":""}), { headers: { 'Content-Type': 'application/json' } });
                }
            }

            if (url.pathname === '/api/bg-settings' && request.method === 'POST') {
                if (!env.DB) return new Response(JSON.stringify({ success: false, error: '未绑定 D1 数据库' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
                try {
                    const body = await request.json();
                    await env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)").run();
                    await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('bg_settings', ?)").bind(JSON.stringify(body)).run();
                    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
                } catch (e) {
                    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
                }
            }

            if (url.pathname === '/api/get-tg-webhook-url') {
            if (!env.TG_BOT_TOKEN) {
                return Response.json({
                    success: false,
                    error: '未在 Cloudflare Worker 环境变量中配置 TG_BOT_TOKEN，请先添加后重试'
                }, { status: 400 });
            }
            const tgBase = tgApiBase(env);
            const domain = env.CF_DOMAIN || url.hostname;
            const webhookUrl = `https://${domain}/api/tg-webhook`;
            const setWebhookUrl = `${tgBase}/bot${env.TG_BOT_TOKEN}/setWebhook?url=&drop_pending_updates=true${encodeURIComponent(webhookUrl)}`;
            return Response.json({
                success: true,
                domain: domain,
                webhook_url: webhookUrl,
                set_webhook_url: setWebhookUrl
            });
        }

        // ==========================================
        // 🚀 快捷手动触发 Telegram 状态播报 (备用保留)
        // ==========================================
        if (url.pathname === '/api/trigger-tg-stats') {
            if (!env.TG_BOT_TOKEN || (!env.TG_CHAT_ID && !env.TG_CHAT_ID_2)) {
                return Response.json({ success: false, error: '未在 Worker 环境变量中设置 TG_BOT_TOKEN 或 TG_CHAT_ID' }, { status: 400 });
            }
            try {
                if (env.TG_CHAT_ID) await sendTgStats(env, env.TG_CHAT_ID, true);
                if (env.TG_CHAT_ID_2) await sendTgStats(env, env.TG_CHAT_ID_2, true);
                return Response.json({ success: true, message: 'Telegram 状态报告已成功下发' });
            } catch (e) {
                return Response.json({ success: false, error: e.message }, { status: 500 });
            }
        }

        if (url.pathname === '/api/get-custom-api-ips') {
            try {
                const apiUrl = url.searchParams.get('url');
                if (!apiUrl) throw new Error("缺少 URL");
                const response = await fetch(apiUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                });
                const text = await response.text();
                let validIPs = new Set();
                try {
                    const jsonObj = JSON.parse(text);
                    if (jsonObj && jsonObj.data && Array.isArray(jsonObj.data)) {
                        jsonObj.data.forEach(item => {
                            if (item.ip && !item.ip.includes(':')) {
                                validIPs.add(item.ip);
                            }
                        });
                    }
                } catch (e) { }

                if (validIPs.size === 0) {
                    const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
                    const matchedIPv4 = Array.from(text.match(ipv4Regex) || []);
                    matchedIPv4.forEach(ip => {
                        if (!ip.includes(':') && !ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('127.')) validIPs.add(ip);
                    });
                }
                const uniqueIPArray = Array.from(validIPs);
                for (let i = uniqueIPArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [uniqueIPArray[i], uniqueIPArray[j]] = [uniqueIPArray[j], uniqueIPArray[i]];
                }
                return Response.json({
                    success: true,
                    ips: uniqueIPArray,
                    totalCount: uniqueIPArray.length
                });
            } catch (error) {
                return Response.json({
                    success: false,
                    error: error.message
                }, {
                    status: 500
                });
            }
        }

        if (url.pathname === '/api/get-remote-ips') {
            try {
                const reqType = (url.searchParams.get('type') || 'all').toLowerCase();
                const validIPs = new Set();

                if (['all', 'optimize', '电信', '联通', '移动', '多线'].includes(reqType)) {
                    try {
                        const res1 = await fetch('https://api.uouin.com/cloudflare.html', {
                            headers: {
                                'User-Agent': 'Mozilla/5.0'
                            }
                        });
                        if (res1.ok) {
                            const text1 = await res1.text();
                            const cleanText = text1.replace(/<[^>]+>/g, ' ');
                            const regex = /(电信|联通|移动|多线)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))/gi;
                            let match;
                            while ((match = regex.exec(cleanText)) !== null) {
                                const lineType = match[1].toLowerCase();
                                let ip = match[2];
                                if (ip.includes(':')) continue;
                                if (reqType === 'all' || reqType === lineType || reqType === 'optimize') validIPs.add(ip);
                            }
                        }
                    } catch (e) { }
                }

                if (['all', 'optimize', '优选'].includes(reqType)) {
                    try {
                        const res2 = await fetch('https://raw.githubusercontent.com/ZhiXuanWang/cf-speed-dns/refs/heads/main/ipTop10.html', {
                            headers: {
                                'User-Agent': 'Mozilla/5.0'
                            }
                        });
                        if (res2.ok) {
                            const text2 = await res2.text();
                            const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
                            const matched = Array.from(text2.match(ipv4Regex) || []);
                            matched.forEach(ip => {
                                if (!ip.includes(':') && !ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('127.')) validIPs.add(ip);
                            });
                        }
                    } catch (e) { }
                }

                // 增加第三个 IP 库: https://ip.164746.xyz/
                try {
                    const res3 = await fetch('https://ip.164746.xyz/', {
                        headers: {
                            'User-Agent': 'Mozilla/5.0'
                        }
                    });
                    if (res3.ok) {
                        const text3 = await res3.text();
                        const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
                        const matched = Array.from(text3.match(ipv4Regex) || []);
                        matched.forEach(ip => {
                            if (!ip.includes(':') && !ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('127.')) validIPs.add(ip);
                        });
                    }
                } catch (e) { }

                // 增加第四个 IP 库: https://www.wetest.vip/page/cloudflare/address_v4.html
                try {
                    const res4 = await fetch('https://www.wetest.vip/page/cloudflare/address_v4.html', {
                        headers: {
                            'User-Agent': 'Mozilla/5.0'
                        }
                    });
                    if (res4.ok) {
                        const text4 = await res4.text();
                        const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
                        const matched = Array.from(text4.match(ipv4Regex) || []);
                        matched.forEach(ip => {
                            if (!ip.includes(':') && !ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('127.')) validIPs.add(ip);
                        });
                    }
                } catch (e) { }

                const uniqueIPArray = Array.from(validIPs);
                for (let i = uniqueIPArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [uniqueIPArray[i], uniqueIPArray[j]] = [uniqueIPArray[j], uniqueIPArray[i]];
                }
                return Response.json({
                    success: true,
                    ips: uniqueIPArray,
                    totalCount: uniqueIPArray.length
                });
            } catch (error) {
                return Response.json({
                    success: false,
                    error: error.message
                }, {
                    status: 500
                });
            }
        }

        // ==========================================
        // 2.5 数据库路由管理 API 
        // ==========================================
        if (url.pathname === '/api/routes/reorder' && request.method === 'POST') {
            if (!env.DB) return Response.json({
                success: false,
                error: "未绑定 DB"
            });
            try {
                const items = await request.json();
                const stmts = items.map(item => env.DB.prepare('UPDATE routes SET sort_order = ? WHERE prefix = ?').bind(item.sort_order, item.prefix));
                await env.DB.batch(stmts);
                return Response.json({
                    success: true
                });
            } catch (e) {
                return Response.json({
                    success: false,
                    error: e.message
                });
            }
        }

        if (url.pathname === '/api/routes/import' && request.method === 'POST') {
            if (!env.DB) return Response.json({
                success: false,
                error: "未绑定 DB"
            });
            try {
                const routes = await request.json();
                for (const r of routes) {
                    if (r.prefix && r.target) {
                        await env.DB.prepare('INSERT OR REPLACE INTO routes (prefix, target, mode, remark, last_play, icon, cache_img, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
                            .bind(r.prefix, r.target, r.mode || 'off', r.remark || '', r.last_play || '', r.icon || '', r.cache_img || 'on', r.sort_order || 0).run();
                    }
                }
                return Response.json({
                    success: true
                });
            } catch (e) {
                return Response.json({
                    success: false,
                    error: e.message
                });
            }
        }

        if (url.pathname.startsWith('/api/routes')) {
            if (!env.DB) return Response.json({
                error: "由于未绑定 D1 数据库，反代功能不可用。"
            }, {
                status: 500
            });

            await env.DB.exec(`CREATE TABLE IF NOT EXISTS routes (prefix TEXT PRIMARY KEY, target TEXT NOT NULL)`);
            await env.DB.exec(`CREATE TABLE IF NOT EXISTS request_stats (prefix TEXT, date TEXT, count INTEGER DEFAULT 0, PRIMARY KEY(prefix, date))`);
            // 大数据记录核心表：访客日志
            await env.DB.exec(`CREATE TABLE IF NOT EXISTS visitor_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, prefix TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, ip TEXT, country TEXT, ua TEXT)`);

            try {
                await env.DB.exec(`ALTER TABLE routes ADD COLUMN mode TEXT DEFAULT 'off'`);
            } catch (e) { }
            try {
                await env.DB.exec(`ALTER TABLE routes ADD COLUMN remark TEXT DEFAULT ''`);
            } catch (e) { }
            try {
                await env.DB.exec(`ALTER TABLE routes ADD COLUMN last_play TEXT DEFAULT ''`);
            } catch (e) { }
            try {
                await env.DB.exec(`ALTER TABLE routes ADD COLUMN icon TEXT DEFAULT ''`);
            } catch (e) { }
            try {
                await env.DB.exec(`ALTER TABLE routes ADD COLUMN cache_img TEXT DEFAULT 'on'`);
            } catch (e) { }
            try {
                await env.DB.exec(`ALTER TABLE routes ADD COLUMN sort_order INTEGER DEFAULT 0`);
            } catch (e) { }

            // 数据防爆清理策略：自动清理过去 7 天的精细日志
            try {
                await env.DB.exec(`DELETE FROM visitor_logs WHERE timestamp < datetime('now', '-7 days')`);
            } catch (e) { }

            // 🚀 【方案A修复版】：独立并发查流，完美绕过 CF 免费版复杂度限制！
            if (request.method === 'GET') {
                const todayStr = new Date(Date.now() + 8 * 3600000).toISOString().split('T')[0];
                const {
                    results: routes
                } = await env.DB.prepare(`
                    SELECT r.*, 
                    IFNULL(s.count, 0) as todayReqs,
                    (SELECT SUM(count) FROM request_stats WHERE prefix = r.prefix) as totalReqs
                    FROM routes r 
                    LEFT JOIN request_stats s ON r.prefix = s.prefix AND s.date = ? 
                    ORDER BY r.sort_order ASC, r.prefix ASC
                `).bind(todayStr).all();

                if (env.CF_API_TOKEN && env.CF_ZONE_ID && routes && routes.length > 0) {
                    const end = new Date();
                    const beijingTime = new Date(end.getTime() + 8 * 3600000);
                    beijingTime.setUTCHours(0, 0, 0, 0);
                    const start = new Date(beijingTime.getTime() - 8 * 3600000);

                    // 核心修复：将“一条复杂查询”拆解为 Promise.all 并发单体查询，并且 limit 设为严格的 1
                    await Promise.all(routes.map(async (r) => {
                        try {
                            const graphqlQuery = {
                                query: `query {
                                  viewer {
                                    zones(filter: {zoneTag: "${env.CF_ZONE_ID}"}) {
                                      httpRequestsAdaptiveGroups(
                                        limit: 1,
                                        filter: {
                                          clientRequestPath_like: "/${r.prefix}%",
                                          datetime_geq: "${start.toISOString()}",
                                          datetime_leq: "${end.toISOString()}"
                                        }
                                      ) {
                                        sum { edgeResponseBytes }
                                      }
                                    }
                                  }
                                }`
                            };

                            const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${env.CF_API_TOKEN}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(graphqlQuery)
                            });

                            const cfData = await cfRes.json();

                            // 精准提取该节点跑出的流量字节
                            const bytes = cfData?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups?.[0]?.sum?.edgeResponseBytes || 0;

                            // 自动格式化换算单位
                            let formatted = "0 B";
                            if (bytes >= 1099511627776) formatted = (bytes / 1099511627776).toFixed(2) + " TB";
                            else if (bytes >= 1073741824) formatted = (bytes / 1073741824).toFixed(2) + " GB";
                            else if (bytes >= 1048576) formatted = (bytes / 1048576).toFixed(2) + " MB";
                            else if (bytes >= 1024) formatted = (bytes / 1024).toFixed(2) + " KB";
                            else if (bytes > 0) formatted = bytes + " B";

                            r.todayBandwidth = formatted;
                        } catch (e) {
                            r.todayBandwidth = "获取异常";
                        }
                    }));
                }

                return Response.json(routes || []);
            }

            if (request.method === 'POST') {
                const data = await request.json();
                let currentSortOrder = 0;
                if (data.oldPrefix && data.oldPrefix !== data.prefix) {
                    const oldRow = await env.DB.prepare('SELECT sort_order FROM routes WHERE prefix = ?').bind(data.oldPrefix).first();
                    if (oldRow) currentSortOrder = oldRow.sort_order;
                    await env.DB.prepare('DELETE FROM routes WHERE prefix = ?').bind(data.oldPrefix).run();
                } else {
                    const oldRow = await env.DB.prepare('SELECT sort_order FROM routes WHERE prefix = ?').bind(data.prefix).first();
                    if (oldRow) currentSortOrder = oldRow.sort_order;
                }

                await env.DB.prepare('INSERT OR REPLACE INTO routes (prefix, target, mode, remark, icon, cache_img, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
                    .bind(data.prefix, data.target, data.mode || 'off', data.remark || '', data.icon || '', data.cache_img || 'on', currentSortOrder).run();
                return Response.json({
                    success: true
                });
            }

            if (request.method === 'DELETE') {
                const prefix = url.searchParams.get('prefix');
                await env.DB.prepare('DELETE FROM routes WHERE prefix = ?').bind(prefix).run();
                return Response.json({
                    success: true
                });
            }
            return new Response("Method not allowed", {
                status: 405
            });
        }

        // ==========================================
        // 2.6 核心反代与调度引擎
        // ==========================================
        let targetUrls = [];
        let currentMode = 'off';
        let enableCache = true;
        let remainingPath = '';
        let currentRouteInfo = null;
        const decodedPath = decodeURIComponent(url.pathname);
        let matchedPrefix = null;
        let proxyOrigin = new URL(request.url).origin;

        if (decodedPath.startsWith('/http://') || decodedPath.startsWith('/https://')) {
            targetUrls = [decodedPath.substring(1)];
            remainingPath = '';
        } else {
            const pathParts = decodedPath.split('/');
            const prefix = pathParts[1];
            if (!prefix) return new Response(`Not Found`, {
                status: 404
            });

            try {
                if (!env.DB) return new Response(`404: Node not found (DB not bound)`, {
                    status: 404
                });
                const stmt = env.DB.prepare(`SELECT target, mode, cache_img, remark FROM routes WHERE prefix = ?`);
                const route = await stmt.bind(prefix).first();
                if (!route) return new Response(`404: Node not found`, {
                    status: 404
                });

                currentMode = route.mode || 'off';
                enableCache = (route.cache_img !== 'off');
                currentRouteInfo = route;
                matchedPrefix = prefix;
                remainingPath = '/' + pathParts.slice(2).join('/');
                targetUrls = route.target.split(',').map(s => s.trim()).filter(Boolean);

                if (remainingPath.startsWith('/http://') || remainingPath.startsWith('/https://')) {
                    targetUrls = [remainingPath.substring(1)];
                    remainingPath = '';
                }
            } catch (e) {
                return new Response("DB Error: " + e.message, {
                    status: 500
                });
            }
        }

        if (targetUrls.length === 0) return new Response("404: Target empty", {
            status: 404
        });

        // ==========================================
        // 2.7 防爆型精准日志拦截 (修复统计虚高：仅拦截点火请求)
        // ==========================================
        const isNewPlaySession = /\/PlaybackInfo/i.test(url.pathname);

        // 核心修改：仅在点火请求时才记录 "今日播放" 和 "最后活跃"
        if (isNewPlaySession && matchedPrefix && env.DB && ctx && ctx.waitUntil) {
            try {
                const todayStr = new Date(Date.now() + 8 * 3600000).toISOString().split('T')[0];
                const nowTime = new Date(Date.now() + 8 * 3600000).toISOString().replace('T', ' ').split('.')[0];

                let stmts = [
                    env.DB.prepare(`INSERT INTO request_stats (prefix, date, count) VALUES (?, ?, 1) ON CONFLICT(prefix, date) DO UPDATE SET count = count + 1`).bind(matchedPrefix, todayStr),
                    env.DB.prepare(`UPDATE routes SET last_play = ? WHERE prefix = ?`).bind(nowTime, matchedPrefix)
                ];

                                const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(',')[0].trim() || "Unknown";
                const clientLocation = parseIpLocation(request, clientIp);
                const clientUa = request.headers.get("User-Agent") || "Unknown";
                stmts.push(env.DB.prepare(`INSERT INTO visitor_logs (prefix, ip, country, ua) VALUES (?, ?, ?, ?)`).bind(matchedPrefix, clientIp, clientLocation, clientUa));

                ctx.waitUntil(env.DB.batch(stmts));
            } catch (e) { }
        }

                // ==========================================
        // 2.8 基础流媒体透传与智能源站反代 (纯净无切片，防403)
        // ==========================================
        const isStrictMode = currentMode === 'strict';

        let bodyBuffer = null;
        if (request.method !== 'GET' && request.method !== 'HEAD' && targetUrls.length > 1) {
            bodyBuffer = await request.clone().arrayBuffer();
        }

        let finalResponse = null;
        let lastError = null;

        for (let i = 0; i < targetUrls.length; i++) {
            const baseUrl = new URL(targetUrls[i]);
            const forwardPath = buildEmosCompatiblePath(baseUrl, remainingPath);
            const targetUrl = new URL(baseUrl.toString());
            const basePath = (baseUrl.pathname || '').replace(/\/+$/, '');
            const normalizedForwardPath = forwardPath.startsWith('/') ? forwardPath : '/' + forwardPath;
            const isDirectAbsoluteRequest = !remainingPath && /^https?:\/\//i.test(targetUrls[i]);

            if (isDirectAbsoluteRequest) {
                targetUrl.pathname = basePath || '/';
                targetUrl.search = baseUrl.search;
            } else {
                targetUrl.pathname = (basePath + normalizedForwardPath).replace(/\/{2,}/g, '/') || '/';
                targetUrl.search = url.search;
            }
            targetUrl.hash = '';

            const isEmos = isEmosTarget(currentRouteInfo || {
                target: targetUrls[i],
                remark: (currentRouteInfo?.remark || '')
            }, targetUrl, env);

            const newHeaders = new Headers(request.headers);
            newHeaders.set("Host", targetUrl.host);

            const realIp = getRealClientIp(request, env);
            stripCfProxyHeaders(newHeaders);

            const pLower = targetUrl.pathname.toLowerCase();
            const isAuthApi = isEmbyAuthApi(pLower);
            const isPlaybackApi = isEmbyPlaybackApi(pLower);
            const realIpMode = isStrictMode ? 'strict' : (currentMode === 'dual' ? 'dual' : (currentMode === 'realip_only' ? 'realip_only' : 'off'));

            if (realIpMode === 'realip_only' && realIp) {
                newHeaders.set("X-Real-IP", realIp);
            } else if (realIpMode === 'dual' && realIp) {
                newHeaders.set("X-Real-IP", realIp);
                newHeaders.set("X-Forwarded-For", realIp);
            } else if (realIpMode === 'strict') {
                newHeaders.delete("X-Forwarded-Proto");
                newHeaders.delete("X-Forwarded-Host");
                newHeaders.set("Origin", targetUrl.origin);
                newHeaders.set("Referer", targetUrl.origin + "/");
                if (realIp) {
                    newHeaders.set("X-Real-IP", realIp);
                    newHeaders.set("X-Forwarded-For", realIp);
                }
            }

            if (isEmos) {
                applyEmosHeaders(newHeaders, request, env, realIpMode);
                const ua = request.headers.get("User-Agent") || "emby-proxy/1.0";
                newHeaders.set("User-Agent", ua);
                if (isEmosProgressApi(targetUrl.pathname) && request.method.toUpperCase() !== 'OPTIONS' && shouldThrottleEmosProgress(request, targetUrl, env)) {
                    return new Response(null, {
                        status: 204,
                        headers: {
                            'Cache-Control': 'no-store'
                        }
                    });
                }
                if (isAuthApi) {
                    if (!newHeaders.get("Content-Type") && !['GET', 'HEAD'].includes(request.method.toUpperCase())) newHeaders.set("Content-Type", "application/json;charset=utf-8");
                    if (!newHeaders.get("Accept")) newHeaders.set("Accept", "application/json, text/plain, */*");
                    if (!newHeaders.get("X-Requested-With")) newHeaders.set("X-Requested-With", "XMLHttpRequest");
                    if (!newHeaders.get("Origin")) newHeaders.set("Origin", proxyOrigin);
                    if (!newHeaders.get("Referer")) newHeaders.set("Referer", proxyOrigin + "/");
                }
                if (isPlaybackApi) {
                    ["Origin", "Referer", "Sec-Fetch-Site", "Sec-Fetch-Mode", "Sec-Fetch-Dest", "Sec-Fetch-User", "priority"].forEach(k => newHeaders.delete(k));
                    newHeaders.set("Accept", "*/*");
                }
            }

            const isStaticOrImage = /\.(jpg|jpeg|gif|png|svg|ico|webp|js|css|woff2?|ttf|otf|map|webmanifest|srt|ass|vtt|sub)$/i.test(targetUrl.pathname) || /(\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i.test(targetUrl.pathname);

            let fetchInit = {
                method: request.method,
                headers: newHeaders,
                redirect: 'manual'
            };

            if (enableCache && !isPlaybackApi) {
                if (isEmos && isEmosPingApi(targetUrl.pathname)) {
                    fetchInit.cf = {
                        cacheEverything: true,
                        cacheTtl: Number(env?.EMOS_PING_CACHE_TTL || 60)
                    };
                } else if (isStaticOrImage || (isEmos && isEmosImageApi(targetUrl.pathname))) {
                    fetchInit.cf = {
                        cacheEverything: true,
                        cacheTtl: Number(env?.EMOS_IMAGE_CACHE_TTL || 86400)
                    };
                }
            }

            if (request.method !== 'GET' && request.method !== 'HEAD') {
                if (targetUrls.length > 1) {
                    fetchInit.body = bodyBuffer;
                } else {
                    fetchInit.body = request.body;
                    fetchInit.duplex = 'half';
                }
            }

            try {
                const modifiedRequest = new Request(targetUrl, fetchInit);
                const response = await fetch(modifiedRequest);
                if (response.status === 502 || response.status === 503 || response.status === 504) {
                    lastError = new Error(`Node ${i + 1} returned HTTP ${response.status}`);
                    continue;
                }
                finalResponse = response;
                break;
            } catch (err) {
                lastError = err;
                continue;
            }
        }

        if (!finalResponse) return new Response("Worker Proxy Failover Exhausted. All nodes failed. Last Error: " + (lastError?.message || 'Unknown Error'), {
            status: 502
        });

        const responseHeaders = new Headers(finalResponse.headers);

        const safePrefix = matchedPrefix ? `/${matchedPrefix}` : '';

        // ==========================================
        // 🚀 修复版 302 拦截：恢复 URL 编码与重定向代理
        // ==========================================
        if ([301, 302, 303, 307, 308].includes(finalResponse.status)) {
            const location = responseHeaders.get('Location');
            if (location && /^https?:\/\//i.test(location)) {
                responseHeaders.set('Location', `${proxyOrigin}${safePrefix}/${encodeURIComponent(location)}`);
            }
        }

        responseHeaders.set('Access-Control-Allow-Origin', '*');

        // ==========================================
        // 2.10 响应体重写 (接管 PlaybackInfo 与 M3U8)
        // ==========================================
        if (finalResponse.status === 200 && responseHeaders.get("content-type")?.includes("json") && url.pathname.toLowerCase().includes("playbackinfo")) {
            try {
                let clonedRes = finalResponse.clone();
                let data = await clonedRes.json();
                let modified = false;
                if (data && data.MediaSources) {
                    data.MediaSources.forEach(source => {
                        ['DirectStreamUrl', 'TranscodingUrl'].forEach(key => {
                            if (source[key] && source[key].startsWith('http')) {
                                source[key] = proxyOrigin + safePrefix + '/' + encodeURIComponent(source[key]);
                                modified = true;
                            }
                        });
                    });
                }
                if (modified) {
                    responseHeaders.delete("Content-Length");
                    return new Response(JSON.stringify(data), {
                        status: finalResponse.status,
                        statusText: finalResponse.statusText,
                        headers: responseHeaders
                    });
                }
            } catch (e) {
                console.log("PlaybackInfo JSON 重写失败:", e.message);
            }
        }

        // 🚀 处理 M3U8 播放列表
        if (finalResponse.status === 200 && url.pathname.toLowerCase().endsWith('.m3u8')) {
            try {
                let clonedRes = finalResponse.clone();
                let text = await clonedRes.text();
                if (text.includes('http://') || text.includes('https://')) {
                    let modifiedText = text.replace(/(https?:\/\/[^\s"'<>]+)/g, (m) => proxyOrigin + safePrefix + '/' + encodeURIComponent(m));
                    responseHeaders.delete("Content-Length");
                    return new Response(modifiedText, {
                        status: finalResponse.status,
                        statusText: finalResponse.statusText,
                        headers: responseHeaders
                    });
                }
            } catch (e) {
                console.log("M3U8 重写失败:", e.message);
            }
        }

        // 静态资源缓存控制
        const isStaticRes = /\.(jpg|jpeg|gif|png|svg|ico|webp|js|css|woff2?|ttf|otf|map|webmanifest|srt|ass|vtt|sub)$/i.test(url.pathname) || /(\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i.test(url.pathname);
        if (isStaticRes && enableCache) {
            responseHeaders.set('Cache-Control', 'public, max-age=86400');
            responseHeaders.delete('Expires');
            responseHeaders.delete('Pragma');
        } else {
            responseHeaders.set('Cache-Control', 'no-store');
        }

        return new Response(finalResponse.body, {
            status: finalResponse.status,
            statusText: finalResponse.statusText,
            headers: responseHeaders
        });
    }

};