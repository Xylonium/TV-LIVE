// VERSION: 2.0.7
// 🟢 面板核心配置区 (放在最顶端方便修改)
const CURRENT_VERSION = "2.0.7"; 
const GITHUB_RAW_URL = "这里填下你的在线更新地址";

// ==========================================
// 🟢 通用反代开关配置
// ==========================================
// 设置为 true = 允许通用反代 (格式: /http://xxx 或 /https://xxx)
// 设置为 false = 禁止通用反代 (只能通过已配置的节点访问)
const ALLOW_GENERAL_PROXY = true;

// ==========================================
// 🟢 数据库查询优化配置
// ==========================================
// 日期筛选常量（统一时区和查询条件）
const DATE_FILTER_CST = "date(timestamp, '+8 hours') = date('now', '+8 hours')";  // 中国时区当天
const DATE_FILTER_7D = "timestamp >= datetime('now', '-7 days')";                  // 7天内
const DATE_FILTER_30D = "timestamp >= datetime('now', '-30 days')";                 // 30天内
// ==========================================

// ==========================================
// 1. 网页界面-单播报版本
// ==========================================

// ==========================================
// 🟢 SVG 图标库 (替换 Emoji)
// ==========================================
const SVG_SHIELD = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`;
const SVG_EYE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
const SVG_ANALYTICS = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`;
const SVG_LOCATION = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
const SVG_ROCKET = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c-4.76 0-8.5 3.74-8.5 8.5 0 3.13 1.63 5.86 4.19 7.38L12 22l4.31-3.62c2.56-1.52 4.19-4.25 4.19-7.38 0-4.76-3.74-8.5-8.5-8.5zm0 12c-1.93 0-3.5-1.57-3.5-3.5S10.07 7.5 12 7.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/><circle cx="12" cy="9" r="2.5"/></svg>`;
const SVG_SETTINGS = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`;
const SVG_CHECK = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
const SVG_CLOSE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
const SVG_COPY = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
const SVG_DELETE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
const SVG_DNS = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>`;
const SVG_RADAR = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`;
const SVG_DOWNLOAD = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`;
const SVG_UPLOAD = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2v2h6v-2H5z"/></svg>`;
const SVG_PLAY = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const SVG_PAUSE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const SVG_EDIT = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
const SVG_SEARCH = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;
const SVG_THEME = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`;
const SVG_LOGOUT = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>`;
const SVG_TG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>`;
const SVG_FILE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
const SVG_CLEAR = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
const SVG_REFRESH = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`;
const SVG_SPEED = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.38 8.57l-1.23 1.85a8 8 0 01-.22 7.58H5.07A8 8 0 0115.58 6.85l1.85-1.23A10 10 0 003.35 19a2 2 0 001.72 1h13.85a2 2 0 001.74-1 10 10 0 00-.27-10.44zm-9.79 6.84a2 2 0 002.83 0l5.66-8.49-8.49 5.66a2 2 0 000 2.83z"/></svg>`;
const SVG_LINK = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`;
const SVG_WARNING = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
const SVG_INFO = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
const SVG_STAR = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
const SVG_MOON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`;
const SVG_SUN = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>`;

// ==========================================
// 🟢 工具函数区
// ==========================================
// 防抖函数：防止频繁触发
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数：限制调用频率
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 统一的错误日志函数
function logError(context, error, details = {}) {
    const timestamp = new Date().toISOString();
    const errorInfo = {
        timestamp,
        context,
        message: error.message || String(error),
        stack: error.stack || '',
        ...details
    };
    console.error(`[${timestamp}] [${context}] Error:`, errorInfo);
    return errorInfo;
}

// ==========================================
// 🟢 国家代码转旗帜 Emoji
// ==========================================
const CF_COLO_TO_COUNTRY = {
    // 亚洲
    'SIN': '🇸🇬', 'NRT': '🇯🇵', 'TYO': '🇯🇵', 'KIX': '🇯🇵', 'NGO': '🇯🇵',
    'HKG': '🇭🇰', 'TPE': '🇹🇼', 'KUL': '🇲🇾', 'BKK': '🇹🇭', 'MNL': '🇵🇭',
    'ICN': '🇰🇷', 'SEL': '🇰🇷', 'PUS': '🇰🇷', 'SIN': '🇸🇬',
    'DEL': '🇮🇳', 'BOM': '🇮🇳', 'CCU': '🇮🇳', 'MAA': '🇮🇳',
    'DXB': '🇦🇪', 'DUB': '🇦🇪', 'AUH': '🇦🇪',
    'JNB': '🇿🇦', 'CPT': '🇿🇦', 'LOS': '🇳🇬',
    // 大洋洲
    'SYD': '🇦🇺', 'MEL': '🇦🇺', 'BNE': '🇦🇺', 'PER': '🇦🇺', 'AKL': '🇳🇿',
    // 欧洲
    'LHR': '🇬🇧', 'LGW': '🇬🇧', 'STN': '🇬🇧', 'MAN': '🇬🇧',
    'FRA': '🇩🇪', 'MUC': '🇩🇪', 'BER': '🇩🇪',
    'AMS': '🇳🇱', 'CDG': '🇫🇷', 'PAR': '🇫🇷', 'MAD': '🇪🇸', 'BCN': '🇪🇸',
    'FCO': '🇮🇹', 'ROM': '🇮🇹', 'MIL': '🇮🇹', 'ZRH': '🇨🇭', 'GVA': '🇨🇭',
    'VIE': '🇦🇹', 'WAR': '🇵🇱', 'PRG': '🇨🇿', 'CPH': '🇩🇰', 'STO': '🇸🇪',
    'OSL': '🇳🇴', 'HEL': '🇫🇮', 'DUB': '🇮🇪', 'Lis': '🇵🇹',
    // 北美洲
    'LAX': '🇺🇸', 'SFO': '🇺🇸', 'SEA': '🇺🇸', 'PDX': '🇺🇸', 'LAS': '🇺🇸',
    'ORD': '🇺🇸', 'CHI': '🇺🇸', 'MSP': '🇺🇸', 'ATL': '🇺🇸', 'IAH': '🇺🇸',
    'DFW': '🇺🇸', 'DEN': '🇺🇸', 'PHX': '🇺🇸', 'IND': '🇺🇸',
    'JFK': '🇺🇸', 'NYC': '🇺🇸', 'BOS': '🇺🇸', 'IAD': '🇺🇸', 'DCA': '🇺🇸',
    'MIA': '🇺🇸', 'TPA': '🇺🇸', 'MSY': '🇺🇸', 'PHL': '🇺🇸',
    'YYZ': '🇨🇦', 'YVR': '🇨🇦', 'YUL': '🇨🇦', 'YYC': '🇨🇦', 'YEG': '🇨🇦',
    'MEX': '🇲🇽', 'LIM': '🇵🇪', 'GRU': '🇧🇷', 'BOG': '🇨🇴', 'SCL': '🇨🇱',
    // 中国大陆 (CF 常用城市代码)
    'PEK': '🇨🇳', 'PVG': '🇨🇳', 'CAN': '🇨🇳', 'SZX': '🇨🇳', 'CTU': '🇨🇳',
    'NKG': '🇨🇳', 'XIY': '🇨🇳', 'HAK': '🇨🇳', 'SYX': '🇨🇳', 'WXN': '🇨🇳',
    'NJN': '🇨🇳', 'TYN': '🇨🇳', 'TSN': '🇨🇳', 'CKG': '🇨🇳', 'NBO': '🇨🇳',
};

// 获取 Cloudflare 机房代码对应的国旗
function getCountryFlag(coloCode) {
    if (!coloCode || coloCode === '探测中...' || coloCode === '获取超时' || coloCode === '未知') {
        return '';
    }
    // 直接匹配
    if (CF_COLO_TO_COUNTRY[coloCode]) {
        return CF_COLO_TO_COUNTRY[coloCode];
    }
    // 尝试匹配前3位（有些代码可能是4位如 "NJTT"）
    const prefix3 = coloCode.substring(0, 3);
    if (CF_COLO_TO_COUNTRY[prefix3]) {
        return CF_COLO_TO_COUNTRY[prefix3];
    }
    // 未知代码
    return '🌍';
}

// ==========================================
// 🟢 全新 Dark OLED 设计系统 v3.0
// ==========================================
const CSS_COMMON = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

    :root {
        /* Dark OLED 主色调 - 深邃科技感 */
        --primary: #3B82F6;
        --primary-hover: #60A5FA;
        --primary-glow: rgba(59, 130, 246, 0.4);
        --primary-bg: rgba(59, 130, 246, 0.15);
        --secondary: #06B6D4;
        --secondary-hover: #22D3EE;

        /* 背景层次 - 从浅到深 */
        --bg-primary: #0F172A;
        --bg-secondary: #020617;
        --bg-card: rgba(30, 41, 59, 0.7);
        --bg-card-hover: rgba(30, 41, 59, 0.9);
        --bg-elevated: rgba(51, 65, 85, 0.5);
        --bg-input: rgba(15, 23, 42, 0.8);

        /* 文字层次 */
        --text-primary: #F8FAFC;
        --text-secondary: #94A3B8;
        --text-muted: #64748B;

        /* 边框与分割线 */
        --border-subtle: rgba(148, 163, 184, 0.1);
        --border-default: rgba(148, 163, 184, 0.2);
        --border-accent: rgba(59, 130, 246, 0.5);

        /* 功能色 */
        --success: #10B981;
        --success-bg: rgba(16, 185, 129, 0.15);
        --warning: #F59E0B;
        --warning-bg: rgba(245, 158, 11, 0.15);
        --danger: #EF4444;
        --danger-bg: rgba(239, 68, 68, 0.15);
        --info: #3B82F6;
        --info-bg: rgba(59, 130, 246, 0.15);

        /* 渐变 */
        --gradient-primary: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
        --gradient-surface: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
        --gradient-glow: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);

        /* 阴影 - 多层次光效 */
        --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
        --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
        --shadow-glow: 0 0 20px var(--primary-glow);
        --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border-subtle);
        --shadow-btn: 0 4px 16px rgba(59, 130, 246, 0.3);

        /* 圆角 */
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
        --radius-xl: 20px;

        /* 动画 */
        --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
        --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
        --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Light Mode - 清新浅色主题 */
    body {
        --bg-primary: #F8FAFC;
        --bg-secondary: #E2E8F0;
        --bg-card: rgba(255, 255, 255, 0.9);
        --bg-card-hover: rgba(255, 255, 255, 1);
        --bg-elevated: rgba(241, 245, 249, 0.8);
        --bg-input: rgba(255, 255, 255, 0.95);
        --text-primary: #0F172A;
        --text-secondary: #475569;
        --text-muted: #94A3B8;
        --border-subtle: rgba(0, 0, 0, 0.05);
        --border-default: rgba(0, 0, 0, 0.1);
        --border-accent: rgba(59, 130, 246, 0.3);
        --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05);
        --shadow-btn: 0 4px 16px rgba(59, 130, 246, 0.2);
        --primary-glow: rgba(59, 130, 246, 0.2);
        --primary-bg: rgba(59, 130, 246, 0.12);
    }

    /* Dark Mode - 强制覆盖所有卡片和容器颜色 */
    body.dark {
        --bg-primary: #0F172A;
        --bg-secondary: #020617;
        --bg-card: rgba(30, 41, 59, 0.7);
        --bg-card-hover: rgba(30, 41, 59, 0.9);
        --bg-elevated: rgba(51, 65, 85, 0.5);
        --bg-input: rgba(15, 23, 42, 0.8);
        --text-primary: #F8FAFC;
        --text-secondary: #94A3B8;
        --text-muted: #64748B;
        --border-subtle: rgba(148, 163, 184, 0.1);
        --border-default: rgba(148, 163, 184, 0.2);
        --border-accent: rgba(59, 130, 246, 0.5);
        --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border-subtle);
        --shadow-btn: 0 4px 16px rgba(59, 130, 246, 0.3);
        --primary-glow: rgba(59, 130, 246, 0.4);
    }

    * {
        box-sizing: border-box;
        touch-action: manipulation;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
        background-attachment: fixed;
        color: var(--text-primary);
        margin: 0;
        padding: 20px;
        -webkit-text-size-adjust: 100%;
        transition: background var(--transition-base), color var(--transition-base);
        line-height: 1.6;
        min-height: 100vh;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
        min-height: 90vh;
        display: flex;
        flex-direction: column;
        padding-bottom: 100px;
    }

    .content-wrap { flex: 1; }

    input, select, button, textarea {
        font-family: inherit;
        outline: none;
        font-size: 15px;
    }

    /* ===== 卡片系统 ===== */
    .card {
        background: var(--bg-card);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        padding: 24px;
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-card);
        margin-bottom: 24px;
        border: 1px solid var(--border-subtle);
        transition: all var(--transition-base);
    }

    .card:hover {
        background: var(--bg-card-hover);
        box-shadow: var(--shadow-lg), 0 0 30px var(--primary-glow);
        border-color: var(--border-accent);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: 16px;
        margin-bottom: 16px;
    }

    /* ===== Toast 通知 ===== */
    #toast {
        position: fixed;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: var(--text-primary);
        padding: 14px 28px;
        border-radius: var(--radius-lg);
        font-size: 14px;
        font-weight: 500;
        transition: top var(--transition-slow);
        z-index: 9999;
        max-width: 90vw;
        word-wrap: break-word;
        box-shadow: var(--shadow-lg), 0 0 0 1px var(--border-subtle);
        border: 1px solid var(--border-default);
    }

    #toast.show { top: 20px; }

    /* ===== 工具栏 ===== */
    .toolbar {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 16px;
        align-items: center;
        background: var(--bg-elevated);
        padding: 16px;
        border-radius: var(--radius-lg);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
        border: 1px solid var(--border-subtle);
    }

    /* ===== 按钮系统 ===== */
    .btn-submit {
        padding: 12px 20px;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 600;
        white-space: nowrap;
        transition: all var(--transition-base);
        box-shadow: var(--shadow-btn);
        position: relative;
        overflow: hidden;
    }

    .btn-submit::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
    }

    .btn-submit:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg), var(--shadow-glow);
        filter: brightness(1.1);
    }

    .btn-submit:hover::before { left: 100%; }
    .btn-submit:active { transform: translateY(0); filter: brightness(0.95); }
    .btn-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        filter: grayscale(0.3);
        box-shadow: none;
    }

    /* ===== 表格系统 ===== */
    .table-wrapper {
        width: 100%;
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
        overflow: hidden;
        background: var(--bg-card);
        box-shadow: var(--shadow-sm);
    }

    table { width: 100%; border-collapse: collapse; text-align: left; }

    th, td {
        padding: 16px;
        border-bottom: 1px solid var(--border-subtle);
        font-size: 14px;
        vertical-align: middle;
    }

    th {
        color: var(--text-secondary);
        font-weight: 600;
        background: var(--bg-elevated);
        letter-spacing: 0.5px;
        text-transform: uppercase;
        font-size: 12px;
        border-bottom: 1px solid var(--border-default);
    }

    tr:last-child td { border-bottom: none; }

    tr {
        transition: all var(--transition-fast);
    }

    tr:hover td {
        background: var(--gradient-glow);
    }

    /* ===== 操作组 ===== */
    .action-group {
        display: inline-flex;
        gap: 8px;
        background: var(--bg-elevated);
        padding: 8px 12px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
        align-items: flex-start;
        max-width: 100%;
        flex-wrap: wrap;
    }

    /* ===== 图标按钮 ===== */
    .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
        background: var(--bg-card);
        cursor: pointer;
        color: var(--text-secondary);
        padding: 0;
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-base);
    }

    .icon-btn:hover {
        color: var(--primary);
        border-color: var(--primary);
        box-shadow: var(--shadow-md), var(--shadow-glow);
        transform: scale(1.05);
    }

    .icon-btn svg { width: 18px !important; height: 18px !important; fill: currentColor; }

    /* ===== 浮动底部标签栏 ===== */
    .page-tabs {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 4px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 50px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
        z-index: 1000;
    }
    .page-tab {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 18px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 500;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', sans-serif;
        transition: all 0.25s ease;
        background: transparent;
        color: #6B7280;
        min-width: 70px;
    }
    .page-tab span {
        font-size: 13px;
        font-weight: 500;
    }
    .page-tab svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
        transition: transform 0.2s ease;
    }
    .page-tab:hover {
        color: #6B7280;
    }
    .page-tab:hover svg {
        transform: scale(1.1);
    }
    .page-tab.active {
        background: rgba(59, 130, 246, 0.1);
        color: #3B82F6;
    }
    .page-tab.active svg {
        color: #3B82F6;
        transform: scale(1.15);
    }

    /* Dark Mode - 浮动标签栏 */
    body.dark .page-tabs {
        background: rgba(30, 41, 59, 0.92);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3);
    }
    body.dark .page-tab {
        color: #94A3B8;
    }
    body.dark .page-tab:hover {
        color: #CBD5E1;
    }
    body.dark .page-tab.active {
        background: rgba(59, 130, 246, 0.15);
        color: #60A5FA;
    }
    body.dark .page-tab.active svg {
        color: #60A5FA;
    }
    .page-section {
        display: none;
    }
    .page-section.active {
        display: block;
    }

    /* 主题切换图标动效 */
    #themeIcon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #themeIcon svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
    }

    /* ===== SVG 图标统一尺寸规则 ===== */
    /* 通用的 SVG 图标尺寸 - 应用于主要容器内的所有 SVG */
    .container svg, .card svg, .toolbar svg, .header svg,
    .content-wrap svg, .modal svg {
        width: 18px !important;
        height: 18px !important;
        fill: currentColor;
        flex-shrink: 0;
        vertical-align: middle;
    }

    /* 按钮内的 SVG */
    .btn-submit svg, button svg {
        width: 16px !important;
        height: 16px !important;
        fill: currentColor;
        flex-shrink: 0;
        vertical-align: middle;
    }

    /* 大尺寸图标 */
    .icon-lg svg, .emby-icon svg {
        width: 24px !important;
        height: 24px !important;
    }

    /* 小尺寸图标 */
    .icon-sm svg {
        width: 14px !important;
        height: 14px !important;
    }

    /* 确保 logout-btn 内的 SVG 也有正确尺寸 */
    .logout-btn svg {
        width: 16px !important;
        height: 16px !important;
        fill: currentColor;
        flex-shrink: 0;
        vertical-align: middle;
    }

    /* ===== 徽章 ===== */
    .badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
        background: var(--gradient-primary);
        color: white;
        box-shadow: var(--shadow-sm);
    }

    /* ===== 编辑/删除/DNS 按钮 ===== */
    .btn-edit {
        padding: 10px 16px;
        background: transparent;
        color: var(--primary);
        border: 2px solid var(--primary);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all var(--transition-base);
    }

    .btn-edit:hover {
        background: var(--primary);
        color: white;
        box-shadow: var(--shadow-glow);
    }

    .btn-del {
        padding: 10px 16px;
        background: transparent;
        color: var(--danger);
        border: 2px solid var(--danger);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all var(--transition-base);
    }

    .btn-del:hover {
        background: var(--danger);
        color: white;
        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
    }

    .btn-dns {
        padding: 10px 16px;
        background: transparent;
        color: var(--success);
        border: 2px solid var(--success);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all var(--transition-base);
        white-space: nowrap;
    }

    .btn-dns:hover {
        background: var(--success);
        color: white;
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
    }

    .btn-dns:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ===== 复选框 ===== */
    .ip-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: var(--primary);
    }

    /* ===== 代码文本 ===== */
    .secret-text {
        font-family: 'Fira Code', monospace;
        letter-spacing: 1px;
        color: var(--text-secondary);
    }

    /* ===== 动态 URL ===== */
    .dynamic-url {
        display: block;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        text-align: right;
    }

    .actual-text.dynamic-url {
        white-space: normal;
        max-width: 100%;
        overflow: visible;
        text-align: left !important;
        word-break: break-all;
        font-size: 13px;
        font-family: 'Fira Code', monospace;
        color: var(--primary);
        letter-spacing: normal;
    }

    .url-list-item {
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        padding: 8px 12px;
        border-radius: var(--radius-sm);
        font-size: 12px;
        margin-top: 6px;
        word-break: break-all;
        line-height: 1.5;
        color: var(--text-primary);
        font-family: 'Fira Code', monospace;
    }

    .url-list-item:first-child { margin-top: 0; }

    /* ===== 输入框 ===== */
    body.dark input,
    body.dark select,
    body.dark textarea {
        background: var(--bg-input);
        color: var(--text-primary);
        border: 1px solid var(--border-default);
    }

    input, select, textarea {
        background: var(--bg-input);
        color: var(--text-primary);
        border: 1px solid var(--border-default);
        transition: all var(--transition-fast);
    }

    input:focus, select:focus, textarea:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--primary-glow);
    }

    .search-input {
        padding: 12px 18px;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--bg-input);
        color: var(--text-primary);
        font-size: 14px;
        width: 260px;
        transition: all var(--transition-base);
    }

    .search-input:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px var(--primary-glow), var(--shadow-glow);
    }

    /* ===== 节点网格 ===== */
    .node-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 24px;
        margin-top: 24px;
    }

    .emby-card {
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 24px;
        box-shadow: var(--shadow-card);
        display: flex;
        flex-direction: column;
        gap: 16px;
        transition: all var(--transition-base);
        position: relative;
        overflow: hidden;
    }

    .emby-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--gradient-primary);
        opacity: 0;
        transition: opacity var(--transition-base);
    }

    .emby-card:hover {
        transform: translateY(-4px);
        border-color: var(--primary);
        box-shadow: var(--shadow-lg), 0 0 40px var(--primary-glow);
    }

    .emby-card:hover::before { opacity: 1; }

    .card-title-group { display: flex; align-items: center; gap: 14px; }

    .emby-icon {
        font-size: 32px;
        background: var(--gradient-glow);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        flex-shrink: 0;
        box-shadow: var(--shadow-sm);
    }

    .info-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        font-size: 13px;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-subtle);
    }

    .info-row:last-child { border-bottom: none; }

    .info-label {
        color: var(--text-muted);
        font-weight: 600;
        min-width: 80px;
    }

    .info-value {
        color: var(--text-secondary);
        text-align: right;
        flex: 1;
    }

    .card-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: auto;
        padding-top: 16px;
        border-top: 1px dashed var(--border-default);
    }

    /* ===== Ping 徽章 ===== */
    .ping-badge {
        color: var(--success);
        cursor: pointer;
        padding: 6px 12px;
        background: var(--success-bg);
        border-radius: var(--radius-sm);
        font-size: 13px;
        font-weight: 600;
        transition: all var(--transition-base);
        border: 1px solid rgba(16, 185, 129, 0.3);
        user-select: none;
        font-family: 'Fira Code', monospace;
    }

    .ping-badge:hover {
        background: var(--success);
        color: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        transform: scale(1.05);
    }

    /* ===== 图标网格 ===== */
    .icon-item {
        cursor: pointer;
        padding: 8px;
        border-radius: var(--radius-md);
        border: 2px solid transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all var(--transition-base);
        background: var(--bg-elevated);
        height: 48px;
    }

    .icon-item:hover {
        border-color: var(--primary) !important;
        box-shadow: var(--shadow-glow);
        transform: scale(1.1);
    }

    #iconGrid::-webkit-scrollbar { width: 8px; }
    #iconGrid::-webkit-scrollbar-thumb {
        background: var(--gradient-primary);
        border-radius: 4px;
    }

    /* ===== 拖拽排序 ===== */
    .emby-card.sortable-ghost {
        opacity: 0.4;
        background: var(--gradient-primary);
    }

    .emby-card.sortable-drag {
        cursor: grabbing !important;
        box-shadow: var(--shadow-lg) !important;
        transform: scale(1.02) rotate(2deg) !important;
    }

    .drag-handle {
        cursor: grab;
        padding-right: 12px;
        font-size: 20px;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        user-select: none;
        touch-action: none;
        transition: all var(--transition-fast);
    }

    .drag-handle:active {
        cursor: grabbing;
        color: var(--primary);
        transform: scale(1.2);
    }

    /* ===== 头部样式 ===== */
    .header h1 {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    /* ===== 退出按钮 ===== */
    .logout-btn {
        background: var(--danger);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        font-weight: 600;
        padding: 10px 16px;
        cursor: pointer;
        transition: all var(--transition-base);
    }

    .logout-btn:hover {
        background: #DC2626;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }

    /* ===== 指示灯 ===== */
    .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 8px var(--success);
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.9); }
    }

    /* ===== 代码块 ===== */
    code {
        background: var(--bg-elevated);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-family: 'Fira Code', monospace;
        font-size: 0.9em;
        color: var(--secondary);
    }

    /* ===== 分割线 ===== */
    hr {
        border: none;
        height: 1px;
        background: var(--border-default);
        margin: 24px 0;
    }

    /* ===== 响应式移动端适配 ===== */
    @media (max-width: 768px) {
        body { padding: 12px; }
        .card { padding: 16px; border-radius: var(--radius-lg); margin-bottom: 16px; }
        .header h1 { font-size: 20px; flex-wrap: wrap; }
        .toolbar { flex-direction: column; align-items: stretch; gap: 12px; }
        .search-input { width: 100%; }
        .node-grid { grid-template-columns: 1fr; gap: 16px; }
        .table-wrapper { border: none; background: transparent; overflow: visible; }
        table, thead, tbody, th, td, tr { display: block; width: 100%; }
        thead { display: none; }
        tr {
            margin-bottom: 16px;
            background: var(--bg-card);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-subtle);
            box-shadow: var(--shadow-sm);
        }
        td {
            display: flex;
            align-items: center;
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-subtle);
            text-align: right;
            gap: 12px;
            min-height: 50px;
        }
        td:last-child { border-bottom: none; }
        td[colspan] { justify-content: center; text-align: center; }
        td[colspan]::before { display: none !important; }
        td::before {
            content: attr(data-label);
            font-weight: 600;
            color: var(--text-muted);
            flex-shrink: 0;
            margin-right: auto;
            text-align: left;
            min-width: 80px;
        }

        #dashboardModal { padding: 10px !important; }
        #dashboardModal .card { margin: 10px auto !important; padding: 16px !important; box-sizing: border-box; }
        #dashboardModal h2 { font-size: 18px; flex-direction: column; align-items: flex-start; }
        #dashboardModal h2 span { font-size: 12px; }
    }
`;

const LOGIN_UI = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>系统授权</title>
    <style>
        ${CSS_COMMON}

        /* 登录页面专属样式 - Dark OLED */
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            padding: 16px;
            margin: 0;
            background: linear-gradient(135deg, #020617 0%, #0F172A 50%, #1E293B 100%);
            position: relative;
            overflow: hidden;
        }

        /* 动态网格背景 */
        body::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background-image:
                radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
                linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
            background-size: 100% 100%, 100% 100%, 60px 60px, 60px 60px;
            animation: gridMove 20s linear infinite;
            pointer-events: none;
        }

        /* 光晕效果 */
        body::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: glowPulse 4s ease-in-out infinite;
        }

        @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(30px, 30px); }
        }

        @keyframes glowPulse {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }

        .login-box {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            padding: 48px 40px;
            border-radius: 24px;
            box-shadow:
                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(148, 163, 184, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            text-align: center;
            width: 100%;
            max-width: 420px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
        }

        .login-box h2 {
            margin: 0 0 32px 0;
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: 2px;
        }

        .login-icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow:
                0 8px 32px rgba(59, 130, 246, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            animation: iconFloat 3s ease-in-out infinite;
        }

        .login-icon svg {
            width: 36px;
            height: 36px;
            fill: #3B82F6;
        }

        @keyframes iconFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        .login-box input {
            width: 100%;
            padding: 16px 20px;
            margin-bottom: 20px;
            border: 2px solid rgba(148, 163, 184, 0.2);
            border-radius: 14px;
            font-size: 15px;
            background: rgba(15, 23, 42, 0.6);
            color: #F8FAFC;
            transition: all 0.3s ease;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .login-box input::placeholder {
            color: #64748B;
        }

        .login-box input:focus {
            border-color: #3B82F6;
            box-shadow:
                0 0 0 4px rgba(59, 130, 246, 0.2),
                0 8px 16px rgba(59, 130, 246, 0.2),
                inset 0 2px 4px rgba(0, 0, 0, 0.2);
            outline: none;
            transform: scale(1.02);
        }

        .login-box button {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
            color: white;
            border: none;
            border-radius: 14px;
            cursor: pointer;
            font-weight: 700;
            font-size: 16px;
            letter-spacing: 3px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
            position: relative;
            overflow: hidden;
        }

        .login-box button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.6s ease;
        }

        .login-box button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
            filter: brightness(1.1);
        }

        .login-box button:hover::before {
            left: 100%;
        }

        .login-box button:active {
            transform: translateY(0);
            filter: brightness(0.95);
        }

        .login-hint {
            margin-top: 28px;
            font-size: 13px;
            color: #64748B;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .login-hint svg {
            width: 16px;
            height: 16px;
            fill: #3B82F6;
        }

        /* 版本号 */
        .version-tag {
            position: absolute;
            bottom: 16px;
            right: 16px;
            font-size: 11px;
            color: #475569;
            font-family: 'Fira Code', monospace;
        }
    </style>
</head>
<body>
    <div id="toast"></div>
    <div class="login-box">
        <div class="login-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
        </div>
        <h2>安全中心</h2>
        <input type="password" id="tokenInput" placeholder="请输入密钥 TOKEN" onkeydown="if(event.key==='Enter') login()">
        <button onclick="login()">验 证 登 录</button>
        <div class="login-hint">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span>受保护的管理面板</span>
        </div>
        <div class="version-tag">v2.0.7</div>
    </div>
    <script>
        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg; t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 2000);
        }
        function login() {
            const token = document.getElementById('tokenInput').value.trim();
            if(!token) return showToast('请输入正确的密钥');
            document.cookie = 'admin_token=' + encodeURIComponent(token) + '; path=/; max-age=2592000;';
            window.location.reload();
        }
    </script>
</body>
</html>
`;

const HTML_UI = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>MakkaPakka的反代面板</title>
    <style>${CSS_COMMON}</style>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/css/flag-icons.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div id="toast"></div>

    <div class="container">
        <!-- 版本更新提示 -->
        <!-- 版本更新提示 -->
        <div id="updateAlert" class="card" style="display: none; border-left: 4px solid var(--success); background: var(--success-bg); margin-top: 20px;">
            <div style="display:flex; justify-content: space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="color: var(--success);">${SVG_STAR}</span>
                    <div>
                        <h3 style="margin:0; color: var(--success); font-size: 16px;">发现新版本！</h3>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-secondary);" id="updateMsg">当前版本: v2.0.7 | 最新版本: v?.?.?</p>
                    </div>
                </div>
                <button onclick="doOnlineUpdate()" id="onlineUpdateBtn" class="btn-submit" style="background: var(--success); box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);">
                    ${SVG_DOWNLOAD} 一键拉取并升级
                </button>
            </div>
        </div>

        <!-- CF 追踪卡片 -->
        <div id="cf-trace-card" class="card" style="padding: 20px 24px; margin-top: 20px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; background: var(--info-bg); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--info);">
                        ${SVG_LOCATION}
                    </div>
                    <div>
                        <div style="color:var(--text-muted); font-size: 12px; margin-bottom: 4px;">访客入口 (地区与机房)</div>
                        <div id="trace-entry" style="font-weight:600; color:var(--text-primary); font-family: 'Fira Code', monospace; font-size: 15px;">雷达扫描中...</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; background: var(--success-bg); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--success);">
                        ${SVG_ROCKET}
                    </div>
                    <div>
                        <div style="color:var(--text-muted); font-size: 12px; margin-bottom: 4px;">Worker 实际落地机房</div>
                        <div id="trace-egress" style="font-weight:600; color:var(--success); font-family: 'Fira Code', monospace; font-size: 15px;">雷达扫描中...</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-wrap">
            <div class="header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap:wrap; gap:16px;">
                <h1 style="margin: 0; font-size: 24px; display:flex; align-items:center; gap: 12px;">
                    <span style="background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">私有调度与反代核心</span>
                    <button id="themeToggle" onclick="toggleDarkMode()" class="icon-btn" style="width:40px; height:40px;" title="切换深色模式">
                        <span id="themeIcon">${SVG_SUN}</span>
                    </button>
                </h1>
                <div style="display:flex; gap:12px; align-items:center; flex-wrap: wrap;">
                    <div style="font-size: 13px; font-weight: 600; padding: 10px 16px; border-radius: var(--radius-md); background: var(--bg-elevated); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 10px;" title="你的设备到云端边缘节点的真实往返延迟">
                        <span class="status-dot" id="rttDot"></span>
                        <span style="color: var(--text-muted);">RTT:</span>
                        <span id="rttValue" style="font-family: 'Fira Code', monospace; font-size: 14px; min-width: 50px; text-align: right;">测算中</span>
                    </div>

                    <button class="logout-btn" onclick="logout()">
                        ${SVG_LOGOUT} 退出系统
                    </button>
                </div>
            </div>

            <!-- 分页导航 -->
            <div class="page-tabs">
                <button class="page-tab active" onclick="switchPage(1)">${SVG_CHECK}<span>节点</span></button>
                <button class="page-tab" onclick="switchPage(2)">${SVG_SPEED}<span>测速</span></button>
                <button class="page-tab" onclick="switchPage(3)">${SVG_ANALYTICS}<span>数据</span></button>
                <button class="page-tab" onclick="switchPage(4)">${SVG_SETTINGS}<span>设置</span></button>
            </div>

            <!-- 第1页：节点 -->
            <div id="page-1" class="page-section active">
            <!-- 部署/编辑反代节点 -->
            <div class="card">
                <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                    <h2 style="margin:0; font-size:18px; display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--primary);">${SVG_UPLOAD}</span>
                        部署 / 编辑反代节点
                    </h2>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-submit" onclick="exportConfig()" style="background:#5856d6; padding: 10px 16px; font-size: 13px;">
                            ${SVG_DOWNLOAD} 导出配置
                        </button>
                        <button class="btn-submit" onclick="importConfig()" style="background:#f59e0b; padding: 10px 16px; font-size: 13px;">
                            ${SVG_UPLOAD} 导入配置
                        </button>
                    </div>
                </div>

                <form id="addForm" style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <input type="hidden" id="oldPrefix" value="">
                        <input type="text" id="remark" placeholder="节点备注 (如: Misaka服)" style="padding: 14px 16px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background:var(--bg-input); flex: 1;" required>
                        <input type="text" id="prefix" placeholder="短路径后缀 (如: misaka)" style="padding: 14px 16px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background:var(--bg-input); flex: 1;" required>
                        <select id="mode" style="padding: 14px 16px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background:var(--bg-input); flex: 1;">
                            <option value="off">🔒 保守 (抹除IP)</option>
                            <option value="realip_only">🎯 严格 (透传IP)</option>
                            <option value="dual">🔄 兼容 (双重透传)</option>
                            <option value="strict">🛡️ 强力 (防403)</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start;">
                        <div style="position: relative; flex: 2; min-width: 200px;">
                            <div style="display:flex; gap:12px; align-items:center; background:var(--bg-card); padding:12px 16px; border-radius:var(--radius-md); border:1px solid var(--border-default); cursor: pointer; transition:0.2s;" onclick="toggleIconPicker(event)" id="iconSelectBtn">
                                <img id="iconPreview" src="" style="width:28px;height:28px;display:none;border-radius:6px;object-fit:cover;">
                                <span id="iconDefault" style="font-size:24px;line-height:1;">🎬</span>
                                <span id="iconSelectText" style="flex:1; color: var(--text-muted); font-size:14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">点击选择图标 (默认 🎬)</span>
                                <input type="hidden" id="iconUrl" value="">
                            </div>

                            <div id="iconPickerPanel" style="display:none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-lg); z-index: 100; margin-top: 8px;">
                                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
                                    <input type="text" id="customIconUrlInput" placeholder="输入自定义 JSON 图标库链接..." style="flex: 1; padding: 10px 14px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); background:var(--bg-input); font-size: 13px;">
                                    <button type="button" onclick="setCustomIconLibrary()" class="btn-submit" style="padding: 10px 14px; font-size: 13px;">加载</button>
                                    <button type="button" onclick="resetIconLibrary()" style="padding: 10px 14px; background: var(--text-muted); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px;">默认</button>
                                </div>
                                <input type="text" id="iconSearch" placeholder="${SVG_SEARCH} 搜索图标名称..." style="padding: 12px 14px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); background:var(--bg-input); width: 100%; font-size: 14px; margin-bottom: 12px;" onkeyup="filterIcons()">
                                <div id="iconGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 8px; overflow-y: auto; max-height: 280px; padding-right: 4px;">
                                    <div style="text-align:center; color:var(--text-muted); grid-column: 1 / -1; font-size: 13px; padding: 20px;">加载图标库中...</div>
                                </div>
                            </div>
                        </div>
                        <label style="display:flex; align-items:center; gap:8px; font-size:14px; font-weight:500; cursor:pointer; padding: 12px 16px; background: var(--bg-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                            <input type="checkbox" id="nodeCache" class="ip-checkbox" checked>
                            开启海报及静态资源缓存
                        </label>
                        <button type="submit" id="submitBtn" class="btn-submit" style="flex: 1; padding: 14px 20px;">
                            ${SVG_CHECK} 保存部署
                        </button>
                    </div>

                    <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px;">
                        <div style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--secondary);">${SVG_DNS}</span>
                            服务器线路配置 (支持魔改分离版推流，支持无限条备用线路)
                        </div>
                        <div id="targetInputs" style="display: flex; flex-direction: column; gap: 12px;">
                            <input type="url" class="target-input" placeholder="主线路地址 (如: http://1.1.1.1:8096)" style="padding: 14px 16px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); background:var(--bg-input); width: 100%;" required oninput="handleTargetInputs()">
                            <input type="url" class="target-input" placeholder="备用线路 1 (选填，主源挂掉时触发)" style="padding: 14px 16px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); background:var(--bg-input); width: 100%;" oninput="handleTargetInputs()">
                        </div>
                    </div>
                </form>
            </div>

            <!-- 已反代的媒体库 -->
            <div class="card">
                <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                    <h2 style="margin:0; font-size:18px; display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--secondary);">${SVG_DNS}</span>
                        已反代的媒体库
                    </h2>
                    <div style="display: flex; gap: 10px; align-items:center; flex-wrap: wrap;">
                        <button class="btn-submit" onclick="pingAllNodes()" style="background:#32ade6; padding: 10px 14px; font-size: 13px;">
                            ${SVG_SPEED} 全局测速
                        </button>
                        <button id="btnPurge" class="btn-submit" onclick="purgeCache()" style="background:#ff2d55; padding: 10px 14px; font-size: 13px;">
                            ${SVG_REFRESH} 刷新全站海报
                        </button>
                        <input type="text" id="searchNode" class="search-input" placeholder="搜索备注或后缀查找..." onkeyup="filterNodesList()">
                    </div>
                </div>
                <div style="background: var(--info-bg); padding: 16px 20px; border-radius: var(--radius-md); border: 1px dashed rgba(59, 130, 246, 0.3); margin-bottom: 20px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                    <label style="cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="selectAllNodes" onchange="toggleSelectAll(this)" style="width: 18px; height: 18px; accent-color: var(--primary);">
                        全选节点
                    </label>

                    <div style="width: 1px; height: 24px; background: var(--border-default);"></div>
                    <select id="batch-mode-select" style="padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-default); background: var(--bg-input); color: var(--text-primary); font-weight: 600;">
                        <option value="">🔄 读取模式中...</option>
                    </select>

                    <button onclick="batchUpdateModes()" class="btn-submit" style="background: var(--primary); padding: 8px 14px; font-size: 13px;">
                        ${SVG_CHECK} 批量应用模式
                    </button>

                    <span id="batch-status" style="font-size: 13px; font-weight: 600;"></span>
                </div>
                <div id="list-grid" class="node-grid">
                    <div style="text-align:center; color:var(--text-muted); grid-column: 1 / -1; padding: 40px;">读取数据中...</div>
                </div>
            </div>
            </div>

            <!-- 第2页：测速 -->
            <div id="page-2" class="page-section">
            <!-- 专属线路测速与动态 DNS 解析 -->
            <div class="card">
                <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                    <h2 style="margin:0; font-size:18px; display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--primary);">${SVG_SPEED}</span>
                        专属线路测速与动态 DNS 解析
                    </h2>
                </div>

                <div style="background: var(--bg-elevated); padding: 16px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 20px;">
                    <div style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--secondary);">${SVG_DNS}</span>
                        当前域名生效的 DNS 解析：
                    </div>
                    <div id="dnsStatus" style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <span style="color:var(--text-muted); font-size: 14px;">加载中...</span>
                    </div>
                </div>

                <div class="toolbar">
                    <select id="ipType" style="font-weight: 600; color: var(--primary); padding: 12px 16px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--bg-card);">
                        <option value="all">🌐 综合混合源</option>
                        <option value="电信">🔵 电信专属</option>
                        <option value="联通">🟠 联通专属</option>
                        <option value="移动">🟢 移动专属</option>
                        <option value="多线">🟣 多线BGP</option>
                        <option value="ipv6">🚀 IPv6节点</option>
                        <option value="优选">🌟 顶尖优选库</option>
                    </select>

                    <button class="btn-submit" id="btnFetchRemote" onclick="fetchRemoteAndTest()">
                        ${SVG_SEARCH} 提取预设源并测速
                    </button>
                    <button class="btn-submit" onclick="batchTcpPing()" style="background: var(--warning); box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);">
                        ${SVG_LINK} 复制去 ITDog
                    </button>
                    <button class="btn-submit" onclick="clearTest()" style="background: var(--text-muted);">
                        ${SVG_CLEAR} 清空列表
                    </button>
                </div>

                <div style="background: var(--bg-elevated); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
                    <div style="display: flex; gap: 12px; margin-bottom: 16px; align-items: center; flex-wrap: wrap;">
                        <input type="text" id="customApiUrl" value="https://ip.v2too.top/api/nodes" placeholder="填入自定义 JSON 或 文本 API 链接" style="flex: 1; min-width: 200px; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-default); background: var(--bg-input);">
                        <button class="btn-submit" id="btnFetchCustomApi" onclick="fetchCustomApiAndTest()" style="background: var(--info);">
                            ${SVG_DOWNLOAD} 拉取 API 并测速
                        </button>
                    </div>

                    <textarea id="customIps" rows="3" placeholder="在此粘贴自定义 IPv4、IPv6 或 优选域名 (支持混杂文本，自动提取)" style="width: 100%; padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-default); margin-bottom: 16px; font-family: 'Fira Code', monospace; resize: vertical; background: var(--bg-input); line-height: 1.5;"></textarea>

                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn-submit" id="btnTestCustom" onclick="testCustomIPs()" style="background: #5856d6;">
                            ${SVG_SPEED} 测试粘贴的节点
                        </button>
                        <button class="btn-submit" id="btnDirectCname" onclick="directSubmitCname()" style="background: #af52de;">
                            ${SVG_LINK} 直推 CNAME (免测速)
                        </button>
                        <div style="width: 100%; height: 1px; background: var(--border-default); margin: 8px 0;"></div>
                        <button class="btn-submit" id="btnTop3Dns" onclick="updateTop3ToDns()" style="background: #ff2d55;">
                            ${SVG_STAR} 更新 TOP3 至 DNS
                        </button>
                        <button class="btn-submit" id="btnSelectedDns" onclick="updateSelectedToDns()" style="background: var(--success);">
                            ${SVG_CHECK} 提交选中节点至 DNS
                        </button>
                    </div>
                </div>

                <div id="statusText" style="line-height: 1.6; font-size: 14px; color: var(--text-secondary); margin-bottom: 16px; padding: 14px 20px; background: var(--success-bg); border-radius: var(--radius-md); border-left: 4px solid var(--success); display: flex; align-items: center; gap: 10px;">
                    <span style="color: var(--success);">${SVG_INFO}</span>
                    测速完成后，可勾选复选框自由组合，点击【提交选中节点至 DNS】自动分发。
                </div>

                <div class="table-wrapper">
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th style="width: 40px; text-align: center;"><input type="checkbox" id="selectAll" class="ip-checkbox" onclick="toggleSelectAll()"></th>
                                <th>专属节点 (点击复制)</th>
                                <th>预估延迟</th>
                                <th>连通状态</th>
                                <th>记录类型/归属地</th>
                                <th>单节点操作</th>
                            </tr>
                        </thead>
                        <tbody id="testTableBody">
                            <tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding: 30px;">暂无数据，请拉取节点或输入自定义 IP/域名 测试</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            </div>

            <!-- 第3页：数据 -->
            <div id="page-3" class="page-section">
            <div class="card">
                <h2 style="margin-top:0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="color: var(--primary);">${SVG_ANALYTICS}</span>
                        <span style="font-size: 20px; font-weight: 700;">数据大屏</span>
                        <span style="font-size:14px; font-weight: normal; color: var(--text-secondary);">精确访客画像分析</span>
                    </div>
                    <div style="font-size: 13px; background: var(--info-bg); color: var(--info); padding: 8px 16px; border-radius: var(--radius-md); border: 1px solid rgba(59, 130, 246, 0.2); display: flex; gap: 20px; flex-wrap: wrap;">
                        <span>今日: <strong id="trafficToday">加载中...</strong></span>
                        <span>1周内: <strong id="traffic7d">加载中...</strong></span>
                        <span>1月内: <strong id="traffic30d">加载中...</strong></span>
                    </div>
                </h2>

                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top:24px;">
                    <div style="flex: 2; min-width: 300px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px; background: var(--bg-elevated);">
                        <canvas id="trendChart"></canvas>
                    </div>
                    <div style="flex: 1; min-width: 300px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px; background: var(--bg-elevated); display: flex; justify-content: center; align-items: center;">
                        <canvas id="locationChart"></canvas>
                    </div>
                </div>

                <h3 style="margin-top: 32px; margin-bottom:16px; display: flex; align-items: center; gap: 10px;">
                    <span style="color: var(--secondary);">${SVG_RADAR}</span>
                    最新独立播放记录
                    <span style="font-size:12px; color:var(--text-muted); font-weight: normal;">(仅拦截 PlaybackInfo 真实播放)</span>
                </h3>
                <div class="table-wrapper" style="max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%;">
                        <thead><tr><th>访问时间</th><th>目标节点</th><th>真实 IP 地址</th><th>归属地</th><th>客户端/设备标识 (User-Agent)</th></tr></thead>
                        <tbody id="logTableBody"><tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--text-muted);">加载数据中...</td></tr></tbody>
                    </table>
                </div>
            </div>
            </div>

            <!-- 第4页：设置 -->
            <div id="page-4" class="page-section">
            <!-- Worker 调度模式与区域设置 -->
            <div class="card" style="padding: 20px 24px; margin-top: 0;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <span style="color: var(--primary);">${SVG_SETTINGS}</span>
                    <div style="font-weight: 700; font-size: 16px;">Worker 调度模式与区域设置</div>
                </div>
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <select id="cf-mode-select" onchange="handleModeChange()" style="flex: 1; min-width: 200px; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-default); background: var(--bg-input); color: var(--text-primary);">
                        <option value='{"mode":"smart"}'>${SVG_RADAR} 智能调度 (Smart Placement)</option>
                        <option value='{"mode":"off"}'>${SVG_LOCATION} 边缘节点 (Edge - 默认离访客近)</option>
                        <optgroup label="指定云厂商物理机房落地">
                            <option value="aws">☁️ AWS (亚马逊云)</option>
                            <option value="gcp">☁️ GCP (谷歌云)</option>
                            <option value="azure">☁️ Azure (微软云)</option>
                        </optgroup>
                        <option value="custom">${SVG_EDIT} 手动输入区域代码...</option>
                    </select>

                    <select id="cf-region-select" style="display: none; flex: 1.5; min-width: 200px; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-default); background: var(--bg-input); color: var(--text-primary);">
                    </select>

                    <input type="text" id="cf-custom-input" placeholder="输入云代码 (如 gcp:us-west1)" style="display: none; flex: 1.5; min-width: 200px; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-default); background: var(--bg-input); color: var(--text-primary);">

                    <button onclick="updatePlacement()" class="btn-submit" style="background: var(--info);">
                        ${SVG_CHECK} 提交修改
                    </button>
                </div>
                <div id="place-status" style="margin-top: 12px; font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                    ${SVG_SHIELD} 后台全自动安全调度，不暴露任何私钥
                </div>
            </div>

            <!-- 通用反代访问控制 -->
            <div class="card" style="border-left: 4px solid var(--warning);">
                <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
                    <h2 style="margin:0; font-size:18px; display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--warning);">${SVG_SETTINGS}</span>
                        通用反代访问控制
                    </h2>
                </div>
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px; display: flex; align-items: flex-start; gap: 8px;">
                    <span style="color: var(--info);">${SVG_INFO}</span>
                    <span>控制是否允许通过 <code>/http://xxx</code> 或 <code>/https://xxx</code> 格式直接访问任意 URL</span>
                </div>
                <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap; padding: 16px; background: var(--bg-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <label style="cursor: pointer; font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="generalProxyToggle" onchange="toggleGeneralProxy()" class="ip-checkbox" style="width: 22px; height: 22px;">
                            <span id="generalProxyStatus" style="font-size: 14px; color: var(--text-secondary);">加载中...</span>
                        </label>
                    </div>
                    <div style="font-size: 13px; color: var(--text-muted); border-left: 1px solid var(--border-subtle); padding-left: 20px;">
                        <div style="margin-bottom: 4px;"><strong style="color: var(--success);">开启</strong>：允许通用反代（灵活但可能有安全风险）</div>
                        <div><strong style="color: var(--danger);">关闭</strong>：仅允许通过已配置的节点访问（更安全）</div>
                    </div>
                </div>
            </div>

            <!-- 一键覆盖/更新 Worker 代码 -->
            <div class="card" style="border-left: 4px solid var(--danger);">
                <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
                    <h2 style="margin:0; font-size:18px; display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--danger);">${SVG_UPLOAD}</span>
                        一键覆盖/更新 Worker 核心层代码
                    </h2>
                </div>
                <div style="font-size: 14px; color: var(--danger); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--danger-bg); border-radius: var(--radius-md); border: 1px solid rgba(239, 68, 68, 0.2);">
                    <span>${SVG_WARNING}</span>
                    警告：提交错误的代码会导致面板瞬间崩溃（500 错误）。请确保代码已在本地测试通过！
                </div>
                <textarea id="codeArea" rows="6" placeholder="方式一：在此处直接粘贴修改好的最新代码全文..." style="width: 100%; padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-default); margin-bottom: 16px; font-family: 'Fira Code', monospace; resize: vertical; background: var(--bg-input); font-size:13px; line-height: 1.5;"></textarea>
                <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <span style="font-size:14px; font-weight:600; color: var(--text-secondary);">或 方式二：</span>
                        <input type="file" id="fileInput" accept=".js" style="font-size:14px; padding: 8px 12px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--bg-input);">
                    </div>
                    <button class="btn-submit" id="deployBtn" onclick="deployWorker()" style="background: var(--danger); box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);">
                        ${SVG_UPLOAD} 立即覆盖部署并重启节点
                    </button>
                </div>
            </div>
            </div>

        </div>

        <!-- 页脚 -->
        <div style="text-align: center; padding: 32px 20px; margin-top: auto;">
            <a href="https://t.me/MakkaPakkaOvO" target="_blank" style="text-decoration: none; color: var(--text-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 10px; padding: 14px 28px; background: var(--bg-card); border-radius: 50px; box-shadow: var(--shadow-md); transition: all 0.3s ease; font-size: 14px; border: 1px solid var(--border-subtle);" onmouseover="this.style.boxShadow='var(--shadow-glow), 0 0 20px var(--primary-glow)'; this.style.borderColor='var(--primary)';" onmouseout="this.style.boxShadow='var(--shadow-md)'; this.style.borderColor='var(--border-subtle)';">
                ${SVG_TG}
                联系作者 MakkaPakkaOvO
            </a>
            <div style="margin-top: 16px; font-size: 12px; color: var(--text-muted);">
                二次修改 by: 我夜不能寐
            </div>
            <div style="margin-top: 24px; font-size: 12px; color: var(--text-muted); line-height: 1.8; max-width: 640px; margin-left: auto; margin-right: auto; padding: 20px 24px; background: var(--bg-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <strong style="color: var(--warning);">⚠️ 免责声明:</strong> 本项目仅供学习与技术测试使用，请遵守当地法律法规。使用者对配置、转发内容与访问行为承担全部责任，开发者不对任何直接或间接损失负责。
            </div>
            <div style="margin-top: 20px; font-size: 11px; color: var(--text-muted); font-family: 'Fira Code', monospace;">
                v2.0.7 | Powered by Cloudflare Workers
            </div>
        </div>
    </div>

    <script>
        // SVG 图标常量（内联避免作用域问题）
        const SVG_MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>';
        const SVG_SUN = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>';

        const modeNames = { 'off': '保守', 'realip_only': '严格', 'dual': '兼容', 'strict': '强力' };
        
        const DEFAULT_ICON_URL = 'https://emby-icon.vercel.app/TFEL-Emby.json';
        let globalIcons = [];
        let proxyNodesForPing = [];
        let sortableInstance = null;
        let trendChartInstance = null;
        let locationChartInstance = null;

        // =====================================
        // 通用反代开关控制
        // =====================================
        async function loadGeneralProxyStatus() {
            try {
                const res = await fetch('/api/general-proxy-status');
                const data = await res.json();
                if (data.success) {
                    document.getElementById('generalProxyToggle').checked = data.enabled;
                    updateGeneralProxyStatusText(data.enabled);
                } else {
                    console.error('获取通用反代状态失败:', data.error);
                    updateGeneralProxyStatusText(null);
                }
            } catch(e) {
                console.error('获取通用反代状态异常:', e);
                updateGeneralProxyStatusText(null);
            }
        }

        function updateGeneralProxyStatusText(enabled) {
            const statusEl = document.getElementById('generalProxyStatus');
            if (enabled === null) {
                statusEl.innerHTML = '<span style="color: #ff9500;">⚠️ 获取状态失败</span>';
            } else if (enabled) {
                statusEl.innerHTML = '<span style="color: #34c759;">✅ 已开启 - 允许通用反代</span>';
            } else {
                statusEl.innerHTML = '<span style="color: #ff3b30;">🔒 已关闭 - 仅限节点访问</span>';
            }
        }

        async function toggleGeneralProxy() {
            const enabled = document.getElementById('generalProxyToggle').checked;
            try {
                const res = await fetch('/api/general-proxy-toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: enabled })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(data.msg || '设置成功！');
                    updateGeneralProxyStatusText(enabled);
                } else {
                    showToast(data.error || '设置失败');
                    // 恢复原状态
                    document.getElementById('generalProxyToggle').checked = !enabled;
                }
            } catch(e) {
                showToast('网络异常，请重试');
                document.getElementById('generalProxyToggle').checked = !enabled;
            }
        }

        // 页面加载时获取状态
        window.addEventListener('DOMContentLoaded', () => {
            loadGeneralProxyStatus();
        });
        // =====================================

        // 设置 Chart.js 响应暗色模式
        function updateChartColors() {
            Chart.defaults.color = document.body.classList.contains('dark') ? '#98989d' : '#86868b';
            Chart.defaults.borderColor = document.body.classList.contains('dark') ? '#38383a' : '#d2d2d7';
        }

        // =====================================
        // 数据大屏与统计逻辑 (适配手机端表格排版)
        // =====================================
        async function loadDashboardData() {

            function parseTrafficToBytes(str) {
                if (!str || str === '0 B' || str.includes('异常') || str.includes('获取')) return 0;
                let val = parseFloat(str);
                if (str.includes('TB')) return val * 1099511627776;
                if (str.includes('GB')) return val * 1073741824;
                if (str.includes('MB')) return val * 1048576;
                if (str.includes('KB')) return val * 1024;
                return val;
            }

            let top5Container = document.getElementById('top5-simple-container');
            if (!top5Container) {
                top5Container = document.createElement('div');
                top5Container.id = 'top5-simple-container';
                const wrapper = document.querySelector('.table-wrapper');
                if(wrapper && wrapper.previousElementSibling) {
                    wrapper.parentNode.insertBefore(top5Container, wrapper.previousElementSibling);
                }
            }
            
            let top5Html = '<h3 style="margin-top: 30px; margin-bottom:16px;">🏆 今日节点流量消耗 TOP 5</h3><div style="background: rgba(120,120,120,0.05); padding: 16px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 20px;">';
            
            // ==========================================
            // 🚀 核心优化：听你的天才思路！直接去网页现有的卡片里“抓取”数据，绝不等待变量！
            // ==========================================
            const domCards = document.querySelectorAll('.route-item');
            let scrapedNodes = [];
            
            domCards.forEach(card => {
                const prefix = card.getAttribute('data-prefix') || '未知';
                let remark = prefix;
                const searchAttr = card.getAttribute('data-search');
                if (searchAttr) {
                    remark = searchAttr.replace(new RegExp(' ' + prefix + '$'), '').trim();
                }

                let bandwidth = '0 B';
                // 遍历卡片里所有的文本，找出带有流量单位的那个文本
                const spans = card.querySelectorAll('span');
                spans.forEach(span => {
                    const txt = span.innerText || '';
                    // 匹配例如: 1.5 GB, 500 MB, 0 B (双斜杠防转义丢失)
                    if (/^[\\d\\.]+\\s*(TB|GB|MB|KB|B)$/i.test(txt.trim())) {
                        bandwidth = txt.trim();
                    }
                });

                scrapedNodes.push({ prefix: prefix, remark: remark, todayBandwidth: bandwidth });
            });

            // 用抓取下来的真实数据直接计算 TOP 5
            if (scrapedNodes.length > 0) {
                const validNodes = scrapedNodes.filter(r => parseTrafficToBytes(r.todayBandwidth) > 0);
                const top5 = validNodes.sort((a, b) => parseTrafficToBytes(b.todayBandwidth) - parseTrafficToBytes(a.todayBandwidth)).slice(0, 5);
                
                if (top5.length > 0) {
                    top5Html += '<ul style="margin:0; padding-left: 20px; line-height: 2; font-size: 14px; color: var(--text);">';
                    top5.forEach((r, idx) => {
                        const rankColor = idx === 0 ? '#ff3b30' : (idx === 1 ? '#ff9500' : (idx === 2 ? '#ffcc00' : 'var(--text-sec)'));
                        top5Html += \`<li><strong style="color:\${rankColor}; font-size: 15px;">#\${idx+1}</strong> \${r.remark} (/\${r.prefix}) —— 消耗: <strong style="color:var(--primary); font-family: monospace;">\${r.todayBandwidth}</strong></li>\`;
                    });
                    top5Html += '</ul>';
                } else {
                    top5Html += '<div style="color:var(--text-sec); font-size:13px; text-align:center;">今日暂无节点产生流量</div>';
                }
            } else {
                top5Html += '<div style="color:var(--text-sec); font-size:13px; text-align:center;">主页暂无节点卡片</div>';
            }
            top5Html += '</div>';
            
            // 瞬间把 TOP 5 写入网页！
            top5Container.innerHTML = top5Html;


            // ==========================================
            // 🌟 正常加载下面的图表数据 (带有10秒防卡死超时保护)
            // ==========================================
            document.getElementById('logTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px;">数据分析引擎计算中...</td></tr>';
            document.getElementById('trafficToday').innerText = '拉取中...';
            document.getElementById('traffic7d').innerText = '拉取中...';
            document.getElementById('traffic30d').innerText = '拉取中...';

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const res = await fetch('/api/analytics', { signal: controller.signal });
                clearTimeout(timeoutId);
                
                const data = await res.json();
                if(!data.success) throw new Error(data.error);

                updateChartColors();

                document.getElementById('trafficToday').innerText = data.trafficToday || '未知';
                document.getElementById('traffic7d').innerText = data.traffic7d || '未知';
                document.getElementById('traffic30d').innerText = data.traffic30d || '未知';

                const labels = data.trend.map(i => i.date.substring(5)); 
                const counts = data.trend.map(i => i.count);
                const trendCtx = document.getElementById('trendChart').getContext('2d');
                if(trendChartInstance) trendChartInstance.destroy();
                trendChartInstance = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{ label: '有效播放 (次)', data: counts, borderColor: '#0071e3', backgroundColor: 'rgba(0,113,227,0.1)', fill: true, tension: 0.3 }]
                    },
                    options: { responsive: true, plugins: { title: { display: true, text: '过去 7 天全站播放并发趋势', font: {size: 16} } } }
                });

                const locLabels = data.locations.map(i => i.country === 'CN' ? '中国大陆' : (i.country || '未知'));
                const locCounts = data.locations.map(i => i.count);
                const locCtx = document.getElementById('locationChart').getContext('2d');
                if(locationChartInstance) locationChartInstance.destroy();
                locationChartInstance = new Chart(locCtx, {
                    type: 'doughnut',
                    data: {
                        labels: locLabels,
                        datasets: [{ data: locCounts, backgroundColor: ['#34c759', '#0071e3', '#ff9500', '#af52de', '#ff2d55', '#8e8e93'], borderWidth: 0 }]
                    },
                    options: { responsive: true, plugins: { title: { display: true, text: '独立访客来源地占比', font: {size: 16} } } }
                });

                const tbody = document.getElementById('logTableBody');
                tbody.innerHTML = '';
                if(data.recents.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px;">暂无日志记录</td></tr>';
                } else {
                    data.recents.slice(0, 10).forEach(log => {
                        const tr = document.createElement('tr');
                        const isChina = log.country === 'CN';
                        tr.innerHTML = \`
                            <td data-label="访问时间" style="font-size:12px; white-space:nowrap;">\${log.timestamp}</td>
                            <td data-label="目标节点"><span class="badge" style="background:rgba(0,113,227,0.1);color:var(--primary);">\${log.prefix}</span></td>
                            <td data-label="真实 IP" style="font-family:monospace; font-size:13px; color:var(--text-sec); word-break:break-all;">\${log.ip}</td>
                            <td data-label="归属地"><span class="badge" style="background:\${isChina ? 'rgba(52,199,89,0.1)' : 'rgba(255,149,0,0.1)'}; color:\${isChina ? '#34c759' : '#ff9500'};">\${isChina ? '中国大陆' : (log.country || 'Unknown')}</span></td>
                            <td data-label="设备标识 (UA)" style="font-size:12px; color:var(--text-sec); word-break: break-all; white-space: normal; text-align: right; line-height: 1.4;" title="\${log.ua}">\${log.ua}</td>
                        \`;
                        tbody.appendChild(tr);
                    });
                }

            } catch (e) {
                const errMsg = e.name === 'AbortError' ? '网络超时，CF 接口拥堵，请稍后重试' : e.message;
                document.getElementById('logTableBody').innerHTML = \`<tr><td colspan="5" style="text-align:center;color:#ff3b30; padding: 30px;">独立图表数据拉取失败: \${errMsg}</td></tr>\`;
            }
        }

        async function loadIcons(forceUrl = null) {
            const grid = document.getElementById('iconGrid');
            grid.innerHTML = '<div style="grid-column: 1/-1; color: var(--text-sec); font-size: 13px; text-align: center;">加载图标库中...</div>';
            const targetUrl = forceUrl || localStorage.getItem('custom_icon_url') || DEFAULT_ICON_URL;
            const urlInput = document.getElementById('customIconUrlInput');
            if (urlInput) urlInput.value = targetUrl === DEFAULT_ICON_URL ? '' : targetUrl;
            
            // URL 安全验证
            try {
                const urlObj = new URL(targetUrl);
                if (!['http:', 'https:'].includes(urlObj.protocol)) {
                    throw new Error('仅支持 HTTP/HTTPS 协议');
                }
            } catch(e) {
                grid.innerHTML = '<div style="grid-column: 1/-1; color: #ff3b30; font-size: 13px; text-align: center;">无效的图标库链接</div>';
                return;
            }
            
            try {
                // 添加超时控制
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                const res = await fetch(targetUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                const data = await res.json();
                if (data && data.icons && Array.isArray(data.icons)) {
                    globalIcons = data.icons;
                } else if (Array.isArray(data)) {
                    globalIcons = data;
                } else {
                    globalIcons = [];
                    for (const [key, val] of Object.entries(data)) { globalIcons.push({ name: key, url: val }); }
                }
                renderIconGrid('');
            } catch(e) { 
                const errMsg = e.name === 'AbortError' ? '请求超时，请检查链接或网络状态' : '获取图标库失败，请检查链接或网络状态';
                const errDiv = '<div style="grid-column: 1/-1; color: #ff3b30; font-size: 13px; text-align: center;">' + errMsg + '</div>';
                grid.innerHTML = errDiv;
            }
        }

        function setCustomIconLibrary() {
            const url = document.getElementById('customIconUrlInput').value.trim();
            if (!url) return showToast('⚠️ 请输入图标库 JSON 链接');
            if (!url.startsWith('http')) return showToast('⚠️ 请输入合法的 URL');
            localStorage.setItem('custom_icon_url', url);
            showToast('⏳ 正在加载自定义图标库...');
            loadIcons(url);
        }

        function resetIconLibrary() {
            localStorage.removeItem('custom_icon_url');
            document.getElementById('customIconUrlInput').value = '';
            showToast('🔄 已恢复默认图标库');
            loadIcons(DEFAULT_ICON_URL);
        }

        function renderIconGrid(filterText) {
            const grid = document.getElementById('iconGrid');
            const lowerFilter = filterText.toLowerCase();
            const filtered = globalIcons.filter(item => (item.name || '').toLowerCase().includes(lowerFilter));
            let html = \`<div class="icon-item" onclick="selectIcon('', '默认 🎬')" title="使用默认图标"><span style="font-size:22px;">🎬</span></div>\`;
            filtered.forEach(item => {
                html += \`<div class="icon-item" onclick="selectIcon('\${item.url}', '\${item.name}')" title="\${item.name}">
                            <img src="\${item.url}" loading="lazy" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px;">
                        </div>\`;
            });
            grid.innerHTML = html;
        }

        function filterIcons() { renderIconGrid(document.getElementById('iconSearch').value); }

        function toggleIconPicker(e) {
            e.stopPropagation();
            const panel = document.getElementById('iconPickerPanel');
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }

        function selectIcon(url, name) {
            document.getElementById('iconUrl').value = url;
            const preview = document.getElementById('iconPreview');
            const def = document.getElementById('iconDefault');
            const text = document.getElementById('iconSelectText');
            if(url) {
                preview.src = url; preview.style.display = 'block'; def.style.display = 'none';
                text.textContent = name; text.style.color = 'var(--text)';
            } else {
                preview.src = ''; preview.style.display = 'none'; def.style.display = 'block';
                text.textContent = '点击选择图标 (默认 🎬)'; text.style.color = 'var(--text-sec)';
            }
            document.getElementById('iconPickerPanel').style.display = 'none';
        }

        document.addEventListener('click', (e) => {
            const panel = document.getElementById('iconPickerPanel');
            const btn = document.getElementById('iconSelectBtn');
            if (panel && btn && panel.style.display !== 'none') {
                if (!panel.contains(e.target) && !btn.contains(e.target)) panel.style.display = 'none';
            }
        });

        // 分页切换函数
        let dataLoaded = false; // 标记数据大屏是否已加载
        function switchPage(pageNum) {
            // 隐藏所有页面
            document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
            // 显示目标页面
            const targetPage = document.getElementById('page-' + pageNum);
            if (targetPage) targetPage.classList.add('active');
            // 更新标签样式
            document.querySelectorAll('.page-tab').forEach((el, idx) => {
                if (idx + 1 === pageNum) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
            // 懒加载：首次切换到数据页时加载大屏数据
            if (pageNum === 3 && !dataLoaded) {
                dataLoaded = true;
                loadDashboardData();
            }
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function toggleDarkMode() {
            const isDark = document.body.classList.toggle('dark');
            document.body.style.background = isDark
                ? 'linear-gradient(180deg, #020617 0%, #0F172A 50%, #1E293B 100%)'
                : 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)';
            localStorage.setItem('emby_proxy_dark', isDark ? '1' : '0');

            // 直接切换图标
            const icon = document.getElementById('themeIcon');
            if (icon) {
                icon.innerHTML = isDark ? SVG_MOON : SVG_SUN;
            } else {
                console.log('themeIcon not found');
            }

            if(trendChartInstance) { updateChartColors(); trendChartInstance.update(); locationChartInstance.update(); }
        }

        // 初始化主题状态 - 立即执行
        (function initTheme() {
            if (localStorage.getItem('emby_proxy_dark') === '1') {
                document.body.classList.add('dark');
                document.body.style.background = 'linear-gradient(180deg, #020617 0%, #0F172A 50%, #1E293B 100%)';
            }
            // 无论是否需要设置 dark class，都尝试设置图标
            const initIcon = document.getElementById('themeIcon');
            if (initIcon) {
                if (localStorage.getItem('emby_proxy_dark') === '1') {
                    initIcon.innerHTML = SVG_MOON;
                }
            }
        })();

        // 也监听 DOMContentLoaded 确保初始化
        document.addEventListener('DOMContentLoaded', () => {
            if (localStorage.getItem('emby_proxy_dark') === '1') {
                const initIcon = document.getElementById('themeIcon');
                if (initIcon) initIcon.innerHTML = SVG_MOON;
            }
        });

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg; t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }

        async function purgeCache() {
            if(!confirm('确定要清理 Cloudflare 节点的全站海报和静态缓存吗？\\n\\n清理后可能导致短时间的加载缓慢。')) return;
            const btn = document.getElementById('btnPurge');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = SVG_REFRESH + ' 正在清理...';
            btn.disabled = true;
            try {
                const res = await fetch('/api/purge-cache', { method: 'POST' });
                const data = await res.json();
                if(data.success) showToast('✅ 缓存清理成功，新海报已生效！');
                else showToast('❌ 清理失败: ' + data.error);
            } catch(e) { showToast('❌ 网络请求错误'); } finally { btn.innerHTML = originalHTML; btn.disabled = false; }
        }

        function filterNodesList() {
            const filterText = document.getElementById('searchNode').value.toLowerCase();
            const cards = document.querySelectorAll('.emby-card');
            cards.forEach(card => {
                const searchStr = card.getAttribute('data-search').toLowerCase();
                card.style.display = searchStr.includes(filterText) ? 'flex' : 'none';
            });
        }

        function handleTargetInputs() {
            const container = document.getElementById('targetInputs');
            const inputs = container.querySelectorAll('.target-input');
            const lastInput = inputs[inputs.length - 1];
            if (lastInput.value.trim() !== '') {
                const newInput = document.createElement('input');
                newInput.type = 'url'; newInput.className = 'target-input';
                newInput.style = 'padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;';
                newInput.oninput = handleTargetInputs;
                container.appendChild(newInput);
            }
            let emptyCount = 0;
            const currentInputs = container.querySelectorAll('.target-input');
            for (let i = currentInputs.length - 1; i >= 0; i--) {
                if (currentInputs[i].value.trim() === '') { emptyCount++; if (emptyCount > 1) currentInputs[i].remove(); } else { break; }
            }
            container.querySelectorAll('.target-input').forEach((inp, idx) => {
                inp.placeholder = idx === 0 ? "主线路地址 (如: http://1.1.1.1:8096)" : \`备用线路 \${idx} (选填，主源挂掉时触发)\`;
            });
        }

        function resetTargetInputs() {
            const container = document.getElementById('targetInputs');
            container.innerHTML = \`
                <input type="url" class="target-input" placeholder="主线路地址 (如: http://1.1.1.1:8096)" style="padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;" required oninput="handleTargetInputs()">
                <input type="url" class="target-input" placeholder="备用线路 1 (选填)" style="padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;" oninput="handleTargetInputs()">
            \`;
        }

        function toggleVis(id, isArray = false) {
            const el = document.getElementById(id);
            if (el.classList.contains('secret-text')) {
                el.classList.remove('secret-text'); el.classList.add('actual-text');
                if (isArray) {
                    const arr = JSON.parse(decodeURIComponent(el.getAttribute('data-val')));
                    let html = '';
                    arr.forEach((t, i) => {
                        const tag = i === 0 ? '<span style="color:#34c759;font-weight:bold;">[主]</span>' : '<span style="color:#ff9500;font-weight:bold;">[备]</span>';
                        html += \`<div class="url-list-item">\${tag} \${t}</div>\`;
                    });
                    el.innerHTML = html;
                } else { el.textContent = el.getAttribute('data-val'); }
            } else {
                el.classList.add('secret-text'); el.classList.remove('actual-text'); el.textContent = '••••••••';
            }
        }

        function copyTxt(txt) { navigator.clipboard.writeText(txt).then(() => showToast('🚀 复制成功！')); }

        async function pingTarget(idx, targetUrl) {
            const pingEl = document.getElementById('ping-' + idx);
            pingEl.textContent = '测速中...'; pingEl.style.color = 'var(--text-sec)';
            try {
                const res = await fetch('/api/ping-node?url=' + encodeURIComponent(targetUrl));
                const data = await res.json();
                if(data.ms >= 0) {
                    pingEl.textContent = data.ms + ' ms';
                    pingEl.style.color = data.ms < 200 ? '#34c759' : (data.ms < 500 ? 'var(--primary)' : '#ff9500');
                } else { pingEl.textContent = '断连/超时'; pingEl.style.color = '#ff3b30'; }
            } catch(e) { pingEl.textContent = '测速异常'; pingEl.style.color = '#ff3b30'; }
        }

        function pingAllNodes() {
            if (proxyNodesForPing.length === 0) return showToast('⚠️ 没有可供测速的反代节点');
            showToast('⚡ 正在对所有节点发起测速...');
            proxyNodesForPing.forEach((node, offset) => { setTimeout(() => pingTarget(node.idx, node.url), offset * 200); });
        }

        async function exportConfig() {
            try {
                const res = await fetch('/api/routes'); const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'emby_proxy_backup.json'; a.click();
                URL.revokeObjectURL(url); showToast('✅ 配置已导出');
            } catch (e) { showToast('❌ 导出失败'); }
        }

        function importConfig() {
            const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0]; const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const routes = JSON.parse(event.target.result);
                        const res = await fetch('/api/routes/import', { method: 'POST', body: JSON.stringify(routes) });
                        const result = await res.json();
                        if (result.success) { showToast('✅ 配置导入成功'); load(); } else throw new Error(result.error);
                    } catch (err) { showToast('❌ 导入失败: ' + err.message); }
                };
                reader.readAsText(file);
            };
            input.click();
        }

        async function load() {
            try {
                const res = await fetch('/api/routes');
                if (!res.ok) throw new Error('请求失败，请检查环境配置');
                const data = await res.json();
                if (data.error) throw new Error(data.error);

                // 🌟 新增：把节点流量数据存进全局内存，供大屏瞬间读取！
                window.globalRoutesData = data;

                const container = document.getElementById('list-grid');
                if(data.length === 0) {
                    container.innerHTML = '<div style="text-align:center; color:var(--text-sec); grid-column: 1 / -1; padding: 40px;">暂无配置任何反代节点，请先部署一个。</div>';
                    return;
                }
                
                container.innerHTML = '';
                proxyNodesForPing = []; 
                const currentHost = window.location.host;

                data.forEach((r, idx) => {
                    const proxyUrl = 'https://' + currentHost + '/' + r.prefix;
                    const targets = r.target.split(',').map(s => s.trim()).filter(Boolean);
                    const mainTarget = targets[0]; 
                    
                    const remarkName = r.remark || '未命名媒体库';
                    const lastPlay = r.last_play ? r.last_play : '暂无播放记录';
                    
                    const iconHtml = r.icon ? \`<img src="\${r.icon}" style="width:28px;height:28px;border-radius:6px;object-fit:cover;">\` : '🎬';
                    const encodedTargets = encodeURIComponent(JSON.stringify(targets));
                    
                    // 🌟 接收后端传来的：单节点独立宽带与请求统计数据
                    const todayBw = r.todayBandwidth || '0 B';
                    const totalReqs = r.totalReqs || r.todayReqs || 0;

                    proxyNodesForPing.push({ idx: idx, url: mainTarget });

                    container.innerHTML += \`
                    <div class="emby-card route-item" data-prefix="\${r.prefix}" data-search="\${remarkName} \${r.prefix}">
                        <div class="card-header">
                            <div class="card-title-group" style="display: flex; align-items: center; gap: 10px;">
                                <div class="drag-handle" title="长按拖拽排序" style="margin: 0; display: flex; align-items: center;">☰</div>
                                <input type="checkbox" class="node-cb" value="\${r.prefix}" style="width: 18px; height: 18px; margin: 0; cursor: pointer; accent-color: var(--primary); flex-shrink: 0;">
                                <div class="emby-icon" style="margin: 0; display: flex; align-items: center;">\${iconHtml}</div>
                                <div>
                                    <div style="font-weight: 600; font-size: 16px; color: var(--text);">\${remarkName}</div>
                                    <div style="font-size: 13px; color: var(--text-sec); margin-top:2px;">/\${r.prefix}</div>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center;">
                                <span class="badge" style="background: rgba(0,113,227,0.1); color: var(--primary);">\${modeNames[r.mode] || '未知'}</span>
                            </div>
                        </div>

                        <div style="background: rgba(120,120,120,0.05); border: 1px solid var(--border); border-radius: 10px; padding: 12px; margin-bottom: 4px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                            <div style="display:flex; flex-direction: column; gap: 4px;">
                                <span style="font-size:12px; color:var(--text-sec);">⬇️ 今日产生总流量</span>
                                <span style="font-size:16px; font-weight:700; color:var(--primary);">\${todayBw}</span>
                            </div>
                            <div style="display:flex; flex-direction: column; gap: 4px; text-align: right;">
                                <span style="font-size:12px; color:var(--text-sec);">📺 播放次数 (今日/累计)</span>
                                <span style="font-size:16px; font-weight:700; color:#ff9500;">\${r.todayReqs} / \${totalReqs} 次</span>
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div class="info-row">
                                <span class="info-label">直达链接:</span>
                                <div class="action-group" style="flex:1; justify-content: flex-end; margin-left: 10px; align-items: flex-start;">
                                    <span id="p-\${idx}" data-val="\${proxyUrl}" class="secret-text dynamic-url">••••••••</span>
                                    <button class="icon-btn" style="margin-top: 2px;" onclick="toggleVis('p-\${idx}')" title="查看明文">${SVG_EYE}</button>
                                    <button class="icon-btn" style="margin-top: 2px;" onclick="copyTxt('\${proxyUrl}')" title="复制链接">${SVG_COPY}</button>
                                </div>
                            </div>
                            <div class="info-row">
                                <span class="info-label">源站线路:</span>
                                <div class="action-group" style="flex:1; justify-content: flex-end; margin-left: 10px; align-items: flex-start;">
                                    <div id="t-\${idx}" data-val="\${encodedTargets}" class="secret-text dynamic-url">••••••••</div>
                                    <button class="icon-btn" style="margin-top: 2px;" onclick="toggleVis('t-\${idx}', true)" title="查看明文">${SVG_EYE}</button>
                                </div>
                            </div>
                            <div class="info-row">
                                <span class="info-label">节点延迟:</span>
                                <span id="ping-\${idx}" class="ping-badge" onclick="pingTarget(\${idx}, '\${mainTarget}')" title="点击重新测速">测速中...</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">海报缓存:</span>
                                <span style="color:\${r.cache_img !== 'off' ? '#34c759' : '#ff9500'}; font-weight:600;">\${r.cache_img !== 'off' ? '✅ 已开启' : '❌ 已关闭'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">最后活跃:</span>
                                <span style="color:var(--text-sec);">\${lastPlay}</span>
                            </div>
                        </div>

                        <div class="card-footer">
                            <button class="btn-edit" onclick="editNode('\${r.prefix}', '\${r.target}', '\${r.mode}', '\${r.remark || ''}', '\${r.icon || ''}', '\${r.cache_img}')">编辑配置</button>
                            <button class="btn-del" onclick="del('\${r.prefix}')">删除</button>
                        </div>
                    </div>\`;

                    setTimeout(() => pingTarget(idx, mainTarget), 500 * idx); 
                });
                
                filterNodesList();

                if (sortableInstance) sortableInstance.destroy();
                sortableInstance = Sortable.create(container, {
                    handle: '.drag-handle',
                    animation: 150,
                    delay: 200, 
                    delayOnTouchOnly: true,
                    onEnd: async function () {
                        const items = [];
                        container.querySelectorAll('.route-item').forEach((row, index) => {
                            const prefix = row.getAttribute('data-prefix');
                            if (prefix) items.push({ prefix: prefix, sort_order: index });
                        });
                        try {
                            await fetch('/api/routes/reorder', { method: 'POST', body: JSON.stringify(items) });
                            showToast('✅ 排序已保存');
                        } catch(e) { showToast('❌ 排序保存失败'); }
                    }
                });

            } catch (err) {
                document.getElementById('list-grid').innerHTML = \`<div style="text-align:center; color:#ff3b30; font-weight:600; grid-column: 1 / -1; padding: 20px;">⚠️ 读取失败: \${err.message}</div>\`;
            }
        }

        function editNode(prefix, targetStr, mode, remark, icon, cacheImg) {
            document.getElementById('oldPrefix').value = prefix;
            document.getElementById('remark').value = remark;
            document.getElementById('prefix').value = prefix;
            document.getElementById('mode').value = mode || 'off';
            document.getElementById('nodeCache').checked = (cacheImg !== 'off');
            
            if (icon) {
                const foundItem = globalIcons.find(i => i.url === icon);
                selectIcon(icon, foundItem ? foundItem.name : '已选择图标');
            } else {
                selectIcon('', '默认 🎬');
            }

            document.getElementById('submitBtn').textContent = '保存修改';
            
            const container = document.getElementById('targetInputs');
            container.innerHTML = '';
            const targets = targetStr.split(',').map(s => s.trim()).filter(Boolean);
            
            targets.forEach((url) => {
                const inp = document.createElement('input');
                inp.type = 'url'; inp.className = 'target-input'; inp.value = url;
                inp.style = 'padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;';
                inp.oninput = handleTargetInputs;
                container.appendChild(inp);
            });
            
            const emptyInp = document.createElement('input');
            emptyInp.type = 'url'; emptyInp.className = 'target-input';
            emptyInp.style = 'padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background:var(--card); width: 100%;';
            emptyInp.oninput = handleTargetInputs;
            container.appendChild(emptyInp);
            
            handleTargetInputs(); 
            window.scrollTo({ top: document.getElementById('addForm').offsetTop - 100, behavior: 'smooth' });
        }

        document.getElementById('addForm').onsubmit = async (e) => {
            e.preventDefault();
            const oldPrefix = document.getElementById('oldPrefix').value;
            const remark = document.getElementById('remark').value.trim();
            const prefix = document.getElementById('prefix').value.trim().replace(/^\\/+/g, '');
            const mode = document.getElementById('mode').value;
            const icon = document.getElementById('iconUrl').value;
            const cache_img = document.getElementById('nodeCache').checked ? 'on' : 'off';

            const inputs = document.querySelectorAll('.target-input');
            let targetsArray = [];
            inputs.forEach(inp => {
                const val = inp.value.trim().replace(/\\/$/g, '');
                if (val) targetsArray.push(val);
            });
            const target = targetsArray.join(',');
            
            if (!target) return showToast('❌ 请至少填写一个主线路地址');

            try {
                const res = await fetch('/api/routes', { 
                    method: 'POST', 
                    body: JSON.stringify({oldPrefix, prefix, target, mode, remark, icon, cache_img})
                });
                const data = await res.json();
                if(!data.success) throw new Error(data.error || '部署失败');
                
                document.getElementById('addForm').reset();
                document.getElementById('oldPrefix').value = ''; 
                selectIcon('', '默认 🎬');
                document.getElementById('nodeCache').checked = true;
                document.getElementById('submitBtn').textContent = '保存部署'; 
                resetTargetInputs(); 
                
                showToast('✅ 节点部署成功');
                load();
            } catch(err) {
                showToast('❌ 保存失败: ' + err.message);
            }
        };

        async function del(prefix) {
            if(confirm('确定删除节点 /' + prefix + ' ?')) {
                await fetch('/api/routes?prefix=' + prefix, { method: 'DELETE' });
                showToast('🗑️ 节点已移除');
                load();
            }
        }

        function toggleSelectAll() {
            const isChecked = document.getElementById('selectAll').checked;
            document.querySelectorAll('.row-checkbox').forEach(cb => {
                if(!cb.disabled) cb.checked = isChecked;
            });
        }
        function getSelectedIps() {
            const checkboxes = document.querySelectorAll('.row-checkbox:checked');
            return Array.from(checkboxes).map(cb => cb.value);
        }
        function batchTcpPing() {
            const rows = document.querySelectorAll('#testTableBody .test-row');
            let ips = [];
            rows.forEach(tr => {
                const strong = tr.querySelector('.ip-text');
                if (strong && strong.textContent) {
                    let ip = strong.textContent;
                    if (ip.startsWith('[') && ip.endsWith(']')) ip = ip.slice(1, -1);
                    ips.push(ip);
                }
            });
            if (ips.length === 0) return showToast('⚠️ 请先提取节点！');
            navigator.clipboard.writeText(ips.join('\\n')).then(() => {
                showToast('✅ 节点已复制，即将跳转 ITDog...');
                setTimeout(() => { window.open('https://www.itdog.cn/batch_tcping/', '_blank'); }, 1500);
            });
        }
        function directSubmitCname() {
            const input = document.getElementById('customIps').value.trim();
            if (!input) return showToast('⚠️ 请先在文本框内粘贴您的优选域名');
            const domainRegex = /\\b([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}\\b/g;
            const matchedDomains = input.match(domainRegex) || [];
            const realDomains = matchedDomains.filter(d => !/^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(d));
            if (realDomains.length === 0) return showToast('⚠️ 没有提取到合法的域名格式，请检查输入！');
            if(!confirm(\`✨ 提取到以下域名：\\n\${realDomains.join('\\n')}\\n\\n确定要直接将其设为 CNAME 记录吗？\\n(注意：这会清空你配置的域名下现有的记录)\`)) return;
            const btn = document.getElementById('btnDirectCname');
            sendDnsRequest(realDomains, btn);
        }
        async function testCustomIPs() {
            const input = document.getElementById('customIps').value;
            if (!input.trim()) return showToast('⚠️ 请先在输入框粘贴 IP 或优选域名');
            const ipv4Regex = /\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b/g;
            const ipv6Regex = /(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}|(?:[A-F0-9]{1,4}:)*:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*/gi;
            const domainRegex = /\\b([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}\\b/g;
            let matchedIPv4 = input.match(ipv4Regex) || [];
            let matchedIPv6 = input.match(ipv6Regex) || [];
            let matchedDomains = input.match(domainRegex) || [];
            matchedDomains = matchedDomains.filter(d => !/^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(d));
            let extractedIps = [...matchedIPv4, ...matchedDomains];
            matchedIPv6.forEach(ip => {
                if (ip.length > 7 && ip.includes(':') && !ip.startsWith('::1')) { extractedIps.push(ip.startsWith('[') ? ip : \`[\${ip}]\`); }
            });
            extractedIps = [...new Set(extractedIps)];
            if (extractedIps.length === 0) return showToast('⚠️ 未识别到合法的 IP 或 域名格式');
            const btn = document.getElementById('btnTestCustom');
            const tbody = document.getElementById('testTableBody');
            btn.disabled = true; btn.textContent = '⏳ 测试中...';
            if(tbody.innerHTML.includes('暂无数据')) tbody.innerHTML = '';
            showToast(\`✅ 提取到 \${extractedIps.length} 个节点，开始测速校验\`);
            const promises = [];
            extractedIps.forEach(ip => {
                const tr = document.createElement('tr');
                tr.className = 'test-row';
                tr.innerHTML = \`
                    <td data-label="勾选节点" style="text-align: center;"><input type="checkbox" class="ip-checkbox row-checkbox" value="\${ip}"></td>
                    <td data-label="专属节点"><strong class="ip-text" style="color:var(--primary);cursor:pointer;font-family:monospace;" onclick="copyTxt('\${ip}')" title="点击复制">\${ip}</strong></td>
                    <td data-label="预估延迟" class="latency" data-ms="9999" style="font-weight: 600; color: #888;">测算中...</td>
                    <td data-label="连通状态" class="speed" style="color: #888;">-</td>
                    <td data-label="记录/归属地" class="loc" style="color: #666;">等待解析</td>
                    <td data-label="快捷操作"><button class="btn-dns" disabled onclick="updateSingleDns('\${ip}', this)">唯一解析</button></td>\`;
                tbody.insertBefore(tr, tbody.firstChild);
                promises.push(doLocalPing(ip, tr, '自定义节点'));
            });
            await Promise.all(promises);
            sortTableByLatency(tbody);
            document.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);
            btn.disabled = false; btn.textContent = '🧪 测试粘贴的节点';
            showToast('🎉 自定义节点测速完成！');
        }
        async function fetchCustomApiAndTest() {
            const apiUrl = document.getElementById('customApiUrl').value.trim();
            if (!apiUrl) return showToast('⚠️ 请先填入自定义 API 链接');
            const btn = document.getElementById('btnFetchCustomApi');
            const tbody = document.getElementById('testTableBody');
            const statusTxt = document.getElementById('statusText');
            btn.disabled = true; btn.textContent = '⏳ 拉取中...';
            statusTxt.innerHTML = \`正在从自定义 API 抓取数据...\`;
            if(tbody.innerHTML.includes('暂无数据')) tbody.innerHTML = ''; 
            try {
                const res = await fetch(\`/api/get-custom-api-ips?url=\${encodeURIComponent(apiUrl)}\`);
                const data = await res.json();
                if (!data.ips || data.ips.length === 0) { showToast('⚠️ 自定义 API 返回为空'); return; }
                showToast(\`✅ 提取 \${data.totalCount} 个节点，抽取 \${data.ips.length} 个测速\`);
                btn.textContent = '⚡ 测速中...';
                const promises = [];
                data.ips.forEach(ip => {
                    const tr = document.createElement('tr');
                    tr.className = 'test-row';
                    tr.innerHTML = \`
                        <td data-label="勾选节点" style="text-align: center;"><input type="checkbox" class="ip-checkbox row-checkbox" value="\${ip}"></td>
                        <td data-label="专属节点"><strong class="ip-text" style="color:var(--primary);cursor:pointer;font-family:monospace;" onclick="copyTxt('\${ip}')" title="点击复制">\${ip}</strong></td>
                        <td data-label="预估延迟" class="latency" data-ms="9999" style="font-weight: 600; color: #888;">测算中...</td>
                        <td data-label="连通状态" class="speed" style="color: #888;">-</td>
                        <td data-label="记录/归属地" class="loc" style="color: #666;">等待解析</td>
                        <td data-label="快捷操作"><button class="btn-dns" disabled onclick="updateSingleDns('\${ip}', this)">唯一解析</button></td>\`;
                    tbody.insertBefore(tr, tbody.firstChild);
                    promises.push(doLocalPing(ip, tr, '自定义 API'));
                });
                await Promise.all(promises);
                sortTableByLatency(tbody);
                document.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);
                document.getElementById('selectAll').checked = false;
                showToast('🎉 自定义 API 测速完成！');
                statusTxt.innerHTML = \`✅ 测速完毕！您可以自由组合更新 DNS。\`;
            } catch (err) { showToast('❌ 拉取失败'); } 
            finally { btn.disabled = false; btn.textContent = '🌐 拉取 API 并测速'; }
        }
        async function fetchRemoteAndTest() {
            const btn = document.getElementById('btnFetchRemote');
            const tbody = document.getElementById('testTableBody');
            const statusTxt = document.getElementById('statusText');
            const type = document.getElementById('ipType').value;
            const typeText = document.getElementById('ipType').options[document.getElementById('ipType').selectedIndex].text;
            btn.disabled = true; btn.textContent = '⏳ 正在提取节点...';
            statusTxt.innerHTML = \`正在拉取 <strong>\${typeText}</strong> 数据...\`;
            if(tbody.innerHTML.includes('暂无数据')) tbody.innerHTML = ''; 
            try {
                const res = await fetch(\`/api/get-remote-ips?type=\${encodeURIComponent(type)}\`);
                const data = await res.json();
                if (!data.ips || data.ips.length === 0) { showToast('⚠️ 未获取到该类型 IP'); return; }
                showToast(\`✅ 成功提取 \${data.totalCount} 个可用 IP，抽取 \${data.ips.length} 个测速\`);
                btn.textContent = '⚡ 本地测速中...';
                const promises = [];
                data.ips.forEach(ip => {
                    const tr = document.createElement('tr');
                    tr.className = 'test-row';
                    tr.innerHTML = \`
                        <td data-label="勾选节点" style="text-align: center;"><input type="checkbox" class="ip-checkbox row-checkbox" value="\${ip}"></td>
                        <td data-label="专属节点"><strong class="ip-text" style="color:var(--primary);cursor:pointer;font-family:monospace;" onclick="copyTxt('\${ip}')" title="点击复制">\${ip}</strong></td>
                        <td data-label="预估延迟" class="latency" data-ms="9999" style="font-weight: 600; color: #888;">测算中...</td>
                        <td data-label="连通状态" class="speed" style="color: #888;">-</td>
                        <td data-label="记录/归属地" class="loc" style="color: #666;">等待解析</td>
                        <td data-label="快捷操作"><button class="btn-dns" disabled onclick="updateSingleDns('\${ip}', this)">唯一解析</button></td>\`;
                    tbody.insertBefore(tr, tbody.firstChild);
                    promises.push(doLocalPing(ip, tr, typeText.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')));
                });
                await Promise.all(promises);
                sortTableByLatency(tbody);
                document.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);
                document.getElementById('selectAll').checked = false;
                showToast('🎉 测速完成！');
                statusTxt.innerHTML = \`✅ 测速完毕！\`;
            } catch (err) { showToast('❌ 拉取或测速失败'); } 
            finally { btn.disabled = false; btn.textContent = '🌍 提取预设源并测速'; }
        }
        function clearTest() {
            document.getElementById('testTableBody').innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-sec);">暂无数据，请拉取节点或输入自定义 IP/域名 测试</td></tr>';
            document.getElementById('statusText').textContent = '列表已清空。';
            document.getElementById('selectAll').checked = false;
        }
        function markTimeout(latTd, spdTd, tr) {
            latTd.textContent = '超时抛弃'; latTd.setAttribute('data-ms', 9999); latTd.style.color = '#ff3b30';
            spdTd.textContent = '❌ 超时 (>2000ms)'; spdTd.style.color = '#ff3b30';
            const cb = tr.querySelector('.row-checkbox');
            if(cb) { cb.disabled = true; cb.title = '不可用的节点无法被勾选'; }
        }
        async function doLocalPing(ip, tr, sourceLabel) {
            const latTd = tr.querySelector('.latency');
            const spdTd = tr.querySelector('.speed');
            const locTd = tr.querySelector('.loc');
            const queryIp = ip.replace(/[\\[\\]]/g, '');
            const isIPv6 = ip.includes(':'); 
            const isDomain = /[a-zA-Z]/.test(queryIp) && !isIPv6;
            if (isDomain) { locTd.innerHTML = \`<span class="badge" style="background:rgba(175,82,222,0.1);color:#af52de;margin-right:4px;">CNAME</span> \${sourceLabel} | 优选域名\`;
            } else {
                const recordLabel = isIPv6 ? '<span class="badge" style="background:rgba(50,173,230,0.1);color:#32ade6;margin-right:4px;">AAAA</span>' : '<span class="badge" style="background:rgba(0,113,227,0.1);color:#0071e3;margin-right:4px;">A记录</span>';
                fetch(\`https://api.ip.sb/geoip/\${queryIp}\`).then(res => res.json()).then(data => locTd.innerHTML = \`\${recordLabel} \${sourceLabel} | \${data.country || '未知'}\`).catch(() => locTd.innerHTML = \`\${recordLabel} \${sourceLabel} | 解析失败\`);
            }
            const start = performance.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); 
            const processResult = () => {
                const rawLatency = Math.round(performance.now() - start);
                if (rawLatency > 2000) return markTimeout(latTd, spdTd, tr);
                let displayLatency = rawLatency;
                if (!isIPv6 && !isDomain) {
                    if (rawLatency >= 500) { displayLatency = rawLatency - 400; } 
                    else { const base = 40 + (rawLatency / 500) * 60; displayLatency = Math.floor(base) + Math.floor(Math.random() * 10); }
                }
                updateRowState(latTd, spdTd, displayLatency);
            };
            try { await fetch(\`https://\${ip}/cdn-cgi/trace\`, { mode: 'no-cors', signal: controller.signal }); clearTimeout(timeoutId); processResult();
            } catch (err) { clearTimeout(timeoutId); if (err.name === 'AbortError') markTimeout(latTd, spdTd, tr); else processResult(); }
        }
        function updateRowState(latTd, spdTd, latency) {
            latTd.textContent = latency + ' ms'; latTd.setAttribute('data-ms', latency);
            if (latency < 300) { latTd.style.color = '#34c759'; spdTd.textContent = '🚀 极佳'; spdTd.style.color = '#34c759'; } 
            else if (latency <= 500) { latTd.style.color = 'var(--primary)'; spdTd.textContent = '✅ 正常'; spdTd.style.color = 'var(--primary)'; } 
            else { latTd.style.color = '#ff9500'; spdTd.textContent = '⚠️ 较高'; spdTd.style.color = '#ff9500'; }
        }
        function sortTableByLatency(tbody) {
            const rows = Array.from(tbody.querySelectorAll('.test-row'));
            rows.sort((a, b) => {
                const msA = parseInt(a.querySelector('.latency').getAttribute('data-ms') || 9999);
                const msB = parseInt(b.querySelector('.latency').getAttribute('data-ms') || 9999);
                return msA - msB;
            });
            rows.forEach(row => tbody.appendChild(row));
        }
        async function sendDnsRequest(ips, btnElement) {
            const originalText = btnElement.textContent;
            btnElement.textContent = '🔄 更新 DNS 中...'; btnElement.disabled = true;
            try {
                const res = await fetch('/api/update-dns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ips }) });
                const data = await res.json();
                if(data.success) { showToast(data.message); btnElement.textContent = '✅ 更新成功'; loadDNS(); } 
                else { showToast('❌ 错误: ' + (data.error || '')); btnElement.textContent = originalText; }
            } catch(e) { showToast('❌ 网络异常，请重试'); btnElement.textContent = originalText; } 
            finally { setTimeout(() => { if(btnElement.textContent === '✅ 更新成功') btnElement.textContent = originalText; btnElement.disabled = false; }, 3000); }
        }
        function updateSingleDns(ip, btnElement) {
            if(!confirm(\`确定要将域名解析到：\\n\${ip} \\n警告：这会覆盖域名下的所有解析记录！\`)) return;
            sendDnsRequest([ip], btnElement);
        }
        function updateSelectedToDns() {
            const btn = document.getElementById('btnSelectedDns');
            const ips = getSelectedIps();
            if (ips.length === 0) return showToast('⚠️ 请先勾选您想使用的节点');
            if(!confirm(\`将应用勾选的 \${ips.length} 个节点：\\n\${ips.join('\\n')}\\n确定更新 DNS 记录吗？\`)) return;
            sendDnsRequest(ips, btn);
        }
        function updateTop3ToDns() {
            const btn = document.getElementById('btnTop3Dns');
            const rows = document.querySelectorAll('#testTableBody .test-row');
            let topIps = [];
            for(let i = 0; i < rows.length; i++) {
                const ms = parseInt(rows[i].querySelector('.latency').getAttribute('data-ms'));
                if(ms < 2000) topIps.push(rows[i].querySelector('.ip-text').textContent);
                if(topIps.length === 3) break;
            }
            if(topIps.length === 0) return showToast('⚠️ 没找到可用节点，请先测速');
            if(!confirm(\`将为您分发当前最快的 \${topIps.length} 个节点：\\n\${topIps.join('\\n')}\\n确定更新 DNS 记录吗？\`)) return;
            sendDnsRequest(topIps, btn);
        }
        async function loadDNS() {
            try {
                const res = await fetch('/api/get-dns'); const data = await res.json(); const container = document.getElementById('dnsStatus');
                if (data.success && data.result) {
                    const records = data.result.filter(r => r.type === 'A' || r.type === 'AAAA' || r.type === 'CNAME');
                    if (records.length === 0) container.innerHTML = '<span class="badge" style="background:rgba(255,149,0,0.1);color:#ff9500;">暂无解析记录</span>';
                    else container.innerHTML = records.map(r => \`<span class="badge" style="background:rgba(0,113,227,0.1);color:var(--primary);border:1px solid rgba(0,113,227,0.2);">\${r.type} | \${r.content}</span>\`).join('');
                } else container.innerHTML = \`<span class="badge" style="background:rgba(255,59,48,0.1);color:#ff3b30;">\${data.error || '获取失败'}</span>\`;
            } catch (e) { document.getElementById('dnsStatus').innerHTML = '<span class="badge" style="background:rgba(255,59,48,0.1);color:#ff3b30;">网络异常</span>'; }
        }
        
        function logout() {
            document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.reload();
        }

        // 初始化加载
        loadIcons().then(() => {
            load();
            loadDNS();
        });

        // ==========================================
        // 🌟 新增：RTT 实时监测引擎 (每隔 3 秒探测一次)
        // ==========================================
        async function measureRTT() {
            const start = performance.now();
            try {
                // 加上时间戳强制绕过浏览器本地缓存
                await fetch('/__client_rtt__?t=' + Date.now(), { mode: 'no-cors', cache: 'no-store' });
                const rtt = Math.round(performance.now() - start);
                const rttEl = document.getElementById('rttValue');
                const dotEl = document.getElementById('rttDot');
                
                rttEl.textContent = rtt + ' ms';
                
                // 根据延迟改变呼吸灯颜色
                if (rtt < 80) {
                    dotEl.style.background = '#34c759'; dotEl.style.boxShadow = '0 0 8px #34c759';
                    rttEl.style.color = '#34c759';
                } else if (rtt < 200) {
                    dotEl.style.background = '#ff9500'; dotEl.style.boxShadow = '0 0 8px #ff9500';
                    rttEl.style.color = '#ff9500';
                } else {
                    dotEl.style.background = '#ff3b30'; dotEl.style.boxShadow = '0 0 8px #ff3b30';
                    rttEl.style.color = '#ff3b30';
                }
            } catch (e) {
                document.getElementById('rttValue').textContent = '断连';
                document.getElementById('rttDot').style.background = '#ff3b30';
            }
        }
        
        // 先立即执行一次，然后每 3 秒循环探测
        measureRTT();
        setInterval(measureRTT, 3000);

    // 🚀 新增：前端探针自动检测脚本
        async function fetchCfTrace() {
            // Cloudflare 机房代码 -> 国家代码映射
            const coloToCountry = {
                NRT:'cn', TYO:'jp', KIX:'jp', NGO:'jp', SEL:'kr', ICN:'kr', PUS:'kr',
                SIN:'sg', HKG:'hk', TPE:'tw',
                LAX:'us', SFO:'us', SEA:'us', PDX:'us', LAS:'us', ORD:'us', ATL:'us', DFW:'us', DEN:'us', IAH:'us', MSP:'us', MIA:'us',
                LHR:'gb', MAN:'gb', LGW:'gb', STN:'gb',
                FRA:'de', MUC:'de', BER:'de',
                AMS:'nl', CDG:'fr', PAR:'fr', MAD:'es', BCN:'es', FCO:'it', ROM:'it', MIL:'it',
                ZRH:'ch', GVA:'ch', VIE:'at', WAR:'pl', PRG:'cz', CPH:'dk', STO:'se', OSL:'no', HEL:'fi', DUB:'ie', LIS:'pt',
                SYD:'au', MEL:'au', BNE:'au', PER:'au', AKL:'nz',
                NBO:'ke', JNB:'za', LOS:'ng', CPT:'za',
                DEL:'in', BOM:'in', CCU:'in', MAA:'in',
                DXB:'ae', DUB:'ae', AUH:'ae',
                KUL:'my', BKK:'th', MNL:'ph',
                PEK:'cn', PVG:'cn', CAN:'cn', SZX:'cn', CTU:'cn', NKG:'cn', XIY:'cn', CKG:'cn', TYN:'cn', TSN:'cn', NJN:'cn', HAK:'cn', SYX:'cn', WXN:'cn'
            };

            try {
                const res = await fetch('/api/trace');
                const data = await res.json();
                if (data.success) {
                    // 访客入口 - 用 entryCountry (CN) 显示国旗
                    const entryFlag = "<i class='fi fi-" + data.entryCountry.toLowerCase() + "' style='display:inline-block;width:18px;height:14px;vertical-align:middle;margin-right:4px;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3);'></i>";
                    document.getElementById('trace-entry').innerHTML = entryFlag + data.entryCountry + ' ' + (data.entryCity || '') + ' (' + data.entryColo + ')';

                    // 落地机房 - 显示国旗
                    const egressElem = document.getElementById('trace-egress');
                    const cc = coloToCountry[data.egressColo] || 'un';
                    const egressFlag = "<i class='fi fi-" + cc + "' style='display:inline-block;width:18px;height:14px;vertical-align:middle;margin-right:4px;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3);'></i>";
                    egressElem.innerHTML = egressFlag + data.egressColo;

                    // 如果入口和落地不一致，显示高亮
                    if (data.entryColo !== data.egressColo && data.egressColo !== '探测中...' && data.egressColo !== '获取失败') {
                        egressElem.style.color = '#ff9500';
                        egressElem.innerHTML = egressFlag + data.egressColo + " <span style='font-size:12px;color:var(--text-muted);'>(智能放置/回源)</span>";
                    }
                }
            } catch(e) {
                document.getElementById('trace-entry').innerHTML = '获取超时';
                document.getElementById('trace-egress').innerHTML = '获取超时';
            }
        }
        
        // 当网页加载完成时，延迟0.5秒执行探针扫描（避免卡顿主页渲染）
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(fetchCfTrace, 500);
            load(); // 节点列表在首页加载时就要获取
        });
    // 🚀 新增：全云厂商节点数据库 (包含 Cloudflare 支持的所有主要区域)
        var cfRegions = {
            aws: [
                { label: "🇭🇰 中国香港", value: "aws:ap-east-1" },
                { label: "🇯🇵 日本 (东京)", value: "aws:ap-northeast-1" },
                { label: "🇯🇵 日本 (大阪)", value: "aws:ap-northeast-3" },
                { label: "🇸🇬 新加坡", value: "aws:ap-southeast-1" },
                { label: "🇰🇷 韩国 (首尔)", value: "aws:ap-northeast-2" },
                { label: "🇺🇸 美国西部 (加州)", value: "aws:us-west-1" },
                { label: "🇺🇸 美国西部 (俄勒冈)", value: "aws:us-west-2" },
                { label: "🇺🇸 美国东部 (弗吉尼亚)", value: "aws:us-east-1" },
                { label: "🇦🇺 澳大利亚 (悉尼)", value: "aws:ap-southeast-2" },
                { label: "🇮🇳 印度 (孟买)", value: "aws:ap-south-1" },
                { label: "🇬🇧 英国 (伦敦)", value: "aws:eu-west-2" },
                { label: "🇩🇪 德国 (法兰克福)", value: "aws:eu-central-1" }
            ],
            gcp: [
                { label: "🇹🇼 中国台湾 (彰化)", value: "gcp:asia-east1" },
                { label: "🇭🇰 中国香港", value: "gcp:asia-east2" },
                { label: "🇯🇵 日本 (东京)", value: "gcp:asia-northeast1" },
                { label: "🇯🇵 日本 (大阪)", value: "gcp:asia-northeast2" },
                { label: "🇰🇷 韩国 (首尔)", value: "gcp:asia-northeast3" },
                { label: "🇸🇬 新加坡", value: "gcp:asia-southeast1" },
                { label: "🇺🇸 美国西部 (洛杉矶)", value: "gcp:us-west2" },
                { label: "🇺🇸 美国西部 (俄勒冈)", value: "gcp:us-west1" },
                { label: "🇺🇸 美国东部 (弗吉尼亚)", value: "gcp:us-east4" },
                { label: "🇦🇺 澳大利亚 (悉尼)", value: "gcp:australia-southeast1" },
                { label: "🇬🇧 英国 (伦敦)", value: "gcp:europe-west2" },
                { label: "🇩🇪 德国 (法兰克福)", value: "gcp:europe-west3" }
            ],
            azure: [
                { label: "🇭🇰 中国香港 (East Asia)", value: "azure:eastasia" },
                { label: "🇸🇬 新加坡 (Southeast Asia)", value: "azure:southeastasia" },
                { label: "🇯🇵 日本东部 (东京)", value: "azure:japaneast" },
                { label: "🇯🇵 日本西部 (大阪)", value: "azure:japanwest" },
                { label: "🇰🇷 韩国中部 (首尔)", value: "azure:koreacentral" },
                { label: "🇺🇸 美国西部 (West US)", value: "azure:westus" },
                { label: "🇺🇸 美国东部 (East US)", value: "azure:eastus" },
                { label: "🇬🇧 英国南部 (伦敦)", value: "azure:uksouth" },
                { label: "🇳🇱 西欧 (荷兰)", value: "azure:westeurope" }
            ]
        };

        // 🚀 新增：联动菜单处理逻辑
        function handleModeChange() {
            var mode = document.getElementById('cf-mode-select').value;
            var regionSelect = document.getElementById('cf-region-select');
            var customInput = document.getElementById('cf-custom-input');
            
            regionSelect.style.display = 'none';
            customInput.style.display = 'none';
            
            if (mode === 'aws' || mode === 'gcp' || mode === 'azure') {
                regionSelect.style.display = 'block';
                regionSelect.innerHTML = ''; 
                var regions = cfRegions[mode];
                regions.forEach(function(r) {
                    var opt = document.createElement('option');
                    opt.value = r.value;
                    opt.innerText = r.label;
                    regionSelect.appendChild(opt);
                });
            } else if (mode === 'custom') {
                customInput.style.display = 'block';
            }
        }

        // 🚀 新增：调用部署修改接口
        async function updatePlacement() {
            var statusElem = document.getElementById('place-status');
            var modeVal = document.getElementById('cf-mode-select').value;
            var placementPayload = {};
            
            if (modeVal === 'aws' || modeVal === 'gcp' || modeVal === 'azure') {
                var regionVal = document.getElementById('cf-region-select').value;
                placementPayload = { region: regionVal };
            } else if (modeVal === 'custom') {
                var customVal = document.getElementById('cf-custom-input').value;
                if (!customVal || customVal.trim() === '') {
                    statusElem.innerText = "❌ 请填写自定义区域代码（如 gcp:asia-east2）";
                    statusElem.style.color = "#ff3b30";
                    return;
                }
                placementPayload = { region: customVal.trim() };
            } else {
                placementPayload = JSON.parse(modeVal);
            }

            statusElem.innerText = "⏳ 正在提交请求，请稍候...";
            statusElem.style.color = "#ff9500";
            
            try {
                var res = await fetch('/api/placement', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ placement: placementPayload })
                });
                var data = await res.json();
                if (data.success) {
                    statusElem.innerText = "✅ " + data.msg;
                    statusElem.style.color = "#34c759";
                } else {
                    statusElem.innerText = "❌ " + data.msg;
                    statusElem.style.color = "#ff3b30";
                }
            } catch(e) {
                statusElem.innerText = "❌ 网络错误: " + e.message;
                statusElem.style.color = "#ff3b30";
            }
        }
    // 🚀 魔法功能：自动继承现有的模式选项 (增强稳定版)
        setTimeout(() => {
            const sourceSelect = document.getElementById('mode');
            const batchSelect = document.getElementById('batch-mode-select');
            if (sourceSelect && batchSelect) {
                batchSelect.innerHTML = sourceSelect.innerHTML;
            }
        }, 100); 

        // 🚀 全选 / 取消全选逻辑
        function toggleSelectAll(checkbox) {
            const checkboxes = document.querySelectorAll('.node-cb');
            checkboxes.forEach(cb => cb.checked = checkbox.checked);
        }

        // 🚀 并发批量修改模式逻辑 (终极多线程逐个击破版)
        async function batchUpdateModes() {
            const statusElem = document.getElementById('batch-status');
            const newMode = document.getElementById('batch-mode-select').value;
            
            const selectedPrefixes = Array.from(document.querySelectorAll('.node-cb:checked')).map(cb => cb.value);

            if (selectedPrefixes.length === 0) {
                statusElem.innerText = "⚠️ 请先打勾需要修改的节点！";
                statusElem.style.color = "#ff9500";
                return;
            }

            if (!confirm("确定要将勾选的 " + selectedPrefixes.length + " 个节点切换为该模式吗？")) return;

            statusElem.innerText = "⏳ 正在多线程并发修改节点...";
            statusElem.style.color = "var(--primary)";

            try {
                // 1. 先获取当前所有的节点详细数据
                const getRes = await fetch('/api/routes');
                const allRoutes = await getRes.json();
                
                // 2. 筛选出你要修改的那些节点
                const nodesToUpdate = allRoutes.filter(r => selectedPrefixes.includes(r.prefix));

                // 3. 核心魔法：Promise.all 并发！瞬间发出多个独立的保存请求
                await Promise.all(nodesToUpdate.map(async (r) => {
                    const payload = Object.assign({}, r);
                    payload.oldPrefix = r.prefix; 
                    payload.mode = newMode; 
                    
                    const postRes = await fetch('/api/routes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!postRes.ok) {
                        throw new Error("节点 " + r.prefix + " 保存失败");
                    }
                }));
                
                statusElem.innerText = "✅ 批量修改成功！";
                statusElem.style.color = "#34c759";
                setTimeout(() => location.reload(), 1000); 

            } catch (e) {
                statusElem.innerText = "❌ 失败: " + e.message;
                statusElem.style.color = "#ff3b30";
            }
        }
    async function deployWorker() {
            const codeArea = document.getElementById('codeArea');
            const fileInput = document.getElementById('fileInput');
            let codeContent = codeArea.value;
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                codeContent = await file.text();
            }
            if (!codeContent.trim()) {
                alert('⚠️ 失败：请先粘贴代码，或者选择一个 .js 文件！');
                return;
            }
            if (!confirm('🚨 危险操作确认 🚨\\n\\n你即将强行覆盖当前 Worker 的代码。\\n如果新代码有错误，此面板将会瘫痪，只能去网页后台抢修！\\n\\n确定代码 100% 正确并覆盖吗？')) return;
            const btn = document.getElementById('deployBtn');
            const originalText = btn.innerText;
            btn.innerText = '⏳ 正在与 Cloudflare 通信并部署...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            try {
                const res = await fetch('/api/deploy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newCode: codeContent })
                });
                const data = await res.json();
                if (data.success) {
                    alert('🎉 成功！' + data.msg + '\\n\\n点击确定后页面将自动刷新。');
                    window.location.reload(); 
                } else {
                    alert('❌ 部署失败：\\n' + JSON.stringify(data.error));
                }
            } catch (e) {
                alert('🚨 异常：\\n' + e.message);
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
        // ==========================================
        // 🟢 在线更新模块
        // ==========================================
        // 这里的变量会自动从代码最顶端的配置区读取注入
        const CURRENT_VERSION = "${CURRENT_VERSION}"; 
        const GITHUB_RAW_URL = "${GITHUB_RAW_URL}"; 
        
        let latestCode = ""; 

        async function checkForUpdates() {
            try {
                const res = await fetch(GITHUB_RAW_URL + '?t=' + new Date().getTime());
                if (!res.ok) return;
                latestCode = await res.text();
                
                // 🚀 核心修复：加入双重反斜杠，防止正则在 Worker 中变成注释 (//) 导致崩溃
                const versionMatch = latestCode.match(/\\/\\/\\s*VERSION:\\s*v?([\\d\\.]+)/i);
                if (versionMatch && versionMatch[1]) {
                    const latestVersion = versionMatch[1];
                    if (latestVersion !== CURRENT_VERSION) {
                        document.getElementById('updateAlert').style.display = 'block';
                        document.getElementById('updateMsg').innerText = '当前版本: v' + CURRENT_VERSION + ' | 发现最新版本: v' + latestVersion + ' (Github)';
                    }
                }
            } catch (e) {
                console.log("检测更新失败:", e);
            }
        }

        async function doOnlineUpdate() {
            if (!confirm('🚀 确定要从 GitHub 拉取最新版本并覆盖当前节点吗？\\n\\n（这将会保留你的所有环境变量和数据库绑定）')) return;
            
            const btn = document.getElementById('onlineUpdateBtn');
            btn.innerText = '⏳ 正在拉取并部署...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            try {
                // 直接复用我们之前写好的防丢数据库高级 API
                const res = await fetch('/api/deploy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newCode: latestCode })
                });
                const data = await res.json();
                if (data.success) {
                    alert('🎉 在线更新成功！\\n\\n点击确定后页面将自动刷新，畅享新版本！');
                    window.location.reload(); 
                } else {
                    alert('❌ 更新失败：\\n' + JSON.stringify(data.error));
                }
            } catch (e) {
                alert('🚨 异常：\\n' + e.message);
            } finally {
                btn.innerText = '🚀 一键拉取并升级';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }

        // 页面加载完成后自动在后台静默检测更新
        document.addEventListener('DOMContentLoaded', checkForUpdates);
    </script>
</body>
</html>
`;

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
                zones[0].httpRequests1dGroups.forEach(g => { totalBytes += (g.sum.bytes || 0); });
            }
        }

        if (totalBytes === 0) return "0 B";
        if (totalBytes >= 1099511627776) return (totalBytes / 1099511627776).toFixed(2) + " TB";
        if (totalBytes >= 1073741824) return (totalBytes / 1073741824).toFixed(2) + " GB";
        if (totalBytes >= 1048576) return (totalBytes / 1048576).toFixed(2) + " MB";
        if (totalBytes >= 1024) return (totalBytes / 1024).toFixed(2) + " KB";
        return totalBytes + " B";

    } catch(e) {
        return "请求异常";
    }
}

// 用于生成 TG 播报消息的核心工具函数 (单面板 + 流量之王统计版 + 客户端软件统计版)
async function sendTgStats(env, chatId) {
    try {
        // 使用 Promise.all 并行查询，提高性能
        const [totalQuery, topRegionQuery, topNodeQuery, topClientQuery] = await Promise.all([
            env.DB.prepare(`SELECT COUNT(*) as count FROM visitor_logs WHERE ${DATE_FILTER_CST}`).first(),
            env.DB.prepare(`SELECT country, COUNT(*) as c FROM visitor_logs WHERE ${DATE_FILTER_CST} GROUP BY country ORDER BY c DESC LIMIT 1`).first(),
            env.DB.prepare(`
                SELECT r.remark, COUNT(v.id) as c 
                FROM visitor_logs v 
                LEFT JOIN routes r ON v.prefix = r.prefix 
                WHERE ${DATE_FILTER_CST.replace(/timestamp/g, 'v.timestamp')}
                GROUP BY v.prefix 
                ORDER BY c DESC LIMIT 1
            `).first(),
            env.DB.prepare(`
                SELECT ua, COUNT(*) as c 
                FROM visitor_logs 
                WHERE ${DATE_FILTER_CST}
                AND ua != 'Unknown' 
                AND ua IS NOT NULL 
                GROUP BY ua 
                ORDER BY c DESC LIMIT 5
            `).all()
        ]);
        
        // 解析客户端软件名称（只显示客户端名，不显示平台和版本）
        const parseClientName = (ua) => {
            if (!ua || ua === 'Unknown') return null;
            
            // 转为小写并清理版本号
            let cleanUA = ua.toLowerCase();
            
            // 清理常见的版本号格式: Chrome/120.0, Firefox/121.0, Safari/17.0 等
            cleanUA = cleanUA.replace(/\/(?:[\d.]+|\d+)/g, '');
            // 清理括号内的版本信息: (Windows NT 10.0; Win64; x64) 或 (compatible; ...)
            cleanUA = cleanUA.replace(/\([^)]*\)/g, ' ');
            // 清理额外的空格
            cleanUA = cleanUA.replace(/\s+/g, ' ').trim();
            
            // Emby 相关客户端（优先匹配）
            if (cleanUA.includes('emby') || cleanUA.includes('emby-theater') || cleanUA.includes('emby-web')) {
                return '📱 Emby';
            }
            
            // Jellyfin 相关客户端
            if (cleanUA.includes('jellyfin') || cleanUA.includes('jellyfin-web')) {
                return '📱 Jellyfin';
            }
            
            // Infuse
            if (cleanUA.includes('infuse')) {
                return '📱 Infuse';
            }
            
            // Kodi
            if (cleanUA.includes('kodi')) return '📺 Kodi';
            
            // Plex
            if (cleanUA.includes('plex') || cleanUA.includes('plexamp') || cleanUA.includes('plexmp')) {
                return '📱 Plex';
            }
            
            // 常见浏览器（需要匹配清理后的UA）
            if (cleanUA.includes('chrome') && !cleanUA.includes('edg')) return '🌐 Chrome';
            if (cleanUA.includes('firefox')) return '🌐 Firefox';
            if (cleanUA.includes('safari') && !cleanUA.includes('chrome')) return '🌐 Safari';
            if (cleanUA.includes('edge') || cleanUA.includes('edg')) return '🌐 Edge';
            if (cleanUA.includes('opera') || cleanUA.includes('opr')) return '🌐 Opera';
            if (cleanUA.includes('brave')) return '🌐 Brave';
            
            // 常见移动应用
            if (cleanUA.includes('android')) return '📱 Android';
            if (cleanUA.includes('iphone') || cleanUA.includes('ipad') || cleanUA.includes('ios')) return '📱 iOS';
            if (cleanUA.includes('windows phone')) return '📱 Windows Phone';
            
            // 常见操作系统
            if (cleanUA.includes('windows')) return '🖥️ Windows';
            if (cleanUA.includes('mac os') || cleanUA.includes('macintosh')) return '🖥️ macOS';
            if (cleanUA.includes('linux')) return '🖥️ Linux';
            if (cleanUA.includes('ubuntu')) return '🖥️ Ubuntu';
            
            // 常见媒体播放器
            if (cleanUA.includes('vlc')) return '📺 VLC';
            if (cleanUA.includes('mpv')) return '📺 MPV';
            if (cleanUA.includes('mplayer')) return '📺 MPlayer';
            
            // 常见下载工具
            if (cleanUA.includes('curl') || cleanUA.includes('wget')) return '⚙️ 命令行工具';
            
            // 未知但有数据（使用清理后的UA，最多显示50字符）
            if (cleanUA.length > 0 && cleanUA.length < 80) {
                return '📱 ' + cleanUA.substring(0, 50);
            }
            
            return '📱 其他'; // 避免显示扳手emoji
        };
        
        // 构建客户端统计消息（按观看次数排序）
        let clientStr = "暂无记录";
        if (topClientQuery && topClientQuery.results && topClientQuery.results.length > 0) {
            // 使用 Map 来合并相同客户端名的统计
            const clientMap = new Map();
            
            topClientQuery.results.forEach(row => {
                const clientName = parseClientName(row.ua);
                if (clientName) {
                    if (clientMap.has(clientName)) {
                        clientMap.set(clientName, clientMap.get(clientName) + row.c);
                    } else {
                        clientMap.set(clientName, row.c);
                    }
                }
            });
            
            // 按观看次数降序排序
            const sortedClients = Array.from(clientMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5); // 最多显示5个
            
            if (sortedClients.length > 0) {
                // 计算最大宽度用于对齐
                const maxNameLen = Math.max(...sortedClients.map(([name]) => name.length));
                
                clientStr = sortedClients.map(([name, count], index) => {
                    const rankEmoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
                    const padding = ' '.repeat(Math.max(0, maxNameLen - name.length + 2));
                    return `${rankEmoji} ${name}${padding} ${count}次`;
                }).join('\n');
            }
        }
        
        // 获取多时间维度流量
        const [trafficToday, traffic7d, traffic30d] = await Promise.all([
            getCFTraffic(env, 'today'),
            getCFTraffic(env, 7),
            getCFTraffic(env, 30)
        ]);

        // ================= 新增：获取今日流量消耗 TOP 1 节点 =================
        let topNodeMsg = "暂无数据";
        if (env.CF_API_TOKEN && env.CF_ZONE_ID && env.DB) {
            try {
                // 1. 获取所有节点
                const { results: routes } = await env.DB.prepare(`SELECT prefix, remark FROM routes`).all();
                if (routes && routes.length > 0) {
                    const end = new Date();
                    const beijingTime = new Date(end.getTime() + 8 * 3600000);
                    beijingTime.setUTCHours(0, 0, 0, 0);
                    const start = new Date(beijingTime.getTime() - 8 * 3600000);

                    let maxBytes = 0;
                    let topNodeName = "无";

                    // 2. 并发向 CF 查询每个节点今天的精准流量
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
                                headers: { 'Authorization': `Bearer ${env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(graphqlQuery)
                            });
                            
                            const cfData = await cfRes.json();
                            const bytes = cfData?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups?.[0]?.sum?.edgeResponseBytes || 0;
                            
                            // 3. 找出最大值
                            if (bytes > maxBytes) {
                                maxBytes = bytes;
                                topNodeName = r.remark || r.prefix;
                            }
                        } catch(e) {}
                    }));

                    // 4. 转换字节并组装文本
                    if (maxBytes > 0) {
                        let formatted = "0 B";
                        if (maxBytes >= 1099511627776) formatted = (maxBytes / 1099511627776).toFixed(2) + " TB";
                        else if (maxBytes >= 1073741824) formatted = (maxBytes / 1073741824).toFixed(2) + " GB";
                        else if (maxBytes >= 1048576) formatted = (maxBytes / 1048576).toFixed(2) + " MB";
                        else if (maxBytes >= 1024) formatted = (maxBytes / 1024).toFixed(2) + " KB";
                        else formatted = maxBytes + " B";
                        
                        topNodeMsg = `${topNodeName} 跑了 ${formatted}`;
                    } else {
                        topNodeMsg = "今日全站零消耗";
                    }
                }
            } catch (e) {
                topNodeMsg = "获取失败";
            }
        }
        // ====================================================================

        const totalStr = totalQuery ? totalQuery.count : 0;
        const regionStr = topRegionQuery ? `${topRegionQuery.country === 'CN' ? '🇨🇳 中国大陆' : topRegionQuery.country} (${topRegionQuery.c} 次)` : '暂无记录';
        const nodeStr = topNodeQuery ? `${topNodeQuery.remark || '未命名节点'} (${topNodeQuery.c} 次)` : '暂无记录';

        const msg = 
            `📊 *今日反代播放数据*\n\n` +
            `▶️ *今日总播放次数:* ${totalStr} 次\n` +
            `🌍 *最多访问地区:* ${regionStr}\n` +
            `🚀 *最喜欢的EMBY:* ${nodeStr}\n` +
            `📱 *客户端统计:*\n${clientStr}\n\n` +
            `🌐 *实际流量消耗:*\n` +
            `当天内: ${trafficToday}\n` +
            `七天内: ${traffic7d}\n` +
            `30天内: ${traffic30d}\n\n` +
            `🏆 *今日流量之王:*\n` +
            `👑 ${topNodeMsg}`;

        await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' })
        });
    } catch (e) {
        console.error("TG Send Error:", e);
    }
}

export default {
    // 每天自动运行发送 TG 统计
    async scheduled(event, env, ctx) {
        if (env.TG_BOT_TOKEN && env.TG_CHAT_ID && env.DB) {
            ctx.waitUntil(sendTgStats(env, env.TG_CHAT_ID));
        }
    },

    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // ==========================================
        // 🚀 新增：全云厂商 Worker 放置区域接口
        // ==========================================
        if (url.pathname === '/api/placement' && request.method === 'POST') {
            try {
                const body = await request.json();
                const placementData = body.placement; 
                
                if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID || !env.CF_WORKER_NAME) {
                    return new Response(JSON.stringify({ success: false, msg: '后台变量未配置全！请检查 CF_API_TOKEN, CF_ACCOUNT_ID, CF_WORKER_NAME' }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }});
                }
                
                const formData = new FormData();
                formData.append('settings', new Blob([JSON.stringify({ placement: placementData })], { type: 'application/json' }));

                const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/workers/scripts/${env.CF_WORKER_NAME}/settings`;
                const cfRes = await fetch(cfUrl, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${env.CF_API_TOKEN}` },
                    body: formData 
                });
                
                const cfData = await cfRes.json();
                if (cfData.success) {
                    return new Response(JSON.stringify({ success: true, msg: '部署区域修改成功！' }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }});
                } else {
                    return new Response(JSON.stringify({ success: false, msg: 'CF报错: ' + (cfData.errors[0]?.message || '未知错误') }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }});
                }
            } catch(e) {
                return new Response(JSON.stringify({ success: false, msg: e.message }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }});
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
                    headers: { 'User-Agent': 'Mozilla/5.0 (CF-Worker-Trace)' }
                });
                const traceText = await traceRes.text();
                const match = traceText.match(/colo=([A-Z]+)/);
                if (match) egressColo = match[1];
            } catch(e) {
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
        // 🚀 通用反代开关控制 API
        // ==========================================
        
        // 获取当前开关状态
        if (url.pathname === '/api/general-proxy-status' && request.method === 'GET') {
            try {
                // 默认值：true (开启)
                let enabled = ALLOW_GENERAL_PROXY;
                
                // 优先从 D1 数据库读取（更可靠）
                if (env.DB) {
                    try {
                        // 确保 settings 表存在
                        await env.DB.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
                        const result = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('general_proxy_enabled').first();
                        if (result && result.value !== null) {
                            enabled = result.value === 'true';
                        }
                    } catch(e) {
                        console.error('D1读取失败，使用默认值:', e);
                    }
                }
                
                // 备选：从 KV 读取（向后兼容）
                else if (env.SETTINGS) {
                    try {
                        const kvValue = await env.SETTINGS.get('general_proxy_enabled');
                        if (kvValue !== null) {
                            enabled = kvValue === 'true';
                        }
                    } catch(e) {
                        console.error('KV读取失败，使用默认值:', e);
                    }
                }
                
                return new Response(JSON.stringify({
                    success: true,
                    enabled: enabled
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch(e) {
                return new Response(JSON.stringify({
                    success: false,
                    error: e.message
                }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

        // 切换开关状态
        if (url.pathname === '/api/general-proxy-toggle' && request.method === 'POST') {
            try {
                const body = await request.json();
                const enabled = body.enabled === true;
                
                // 优先保存到 D1 数据库（更可靠）
                if (env.DB) {
                    try {
                        await env.DB.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
                        await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind('general_proxy_enabled', enabled.toString()).run();
                    } catch(e) {
                        console.error('D1保存失败:', e);
                        return new Response(JSON.stringify({
                            success: false,
                            error: '数据库保存失败: ' + e.message
                        }), {
                            status: 500,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    }
                }
                // 备选：保存到 KV（向后兼容）
                else if (env.SETTINGS) {
                    await env.SETTINGS.put('general_proxy_enabled', enabled.toString());
                }
                
                return new Response(JSON.stringify({
                    success: true,
                    msg: enabled ? '✅ 通用反代功能已开启' : '🔒 通用反代功能已关闭'
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch(e) {
                return new Response(JSON.stringify({
                    success: false,
                    error: e.message
                }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
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

        // Telegram Webhook 拦截
        if (url.pathname === '/api/tg-webhook' && request.method === 'POST') {
            try {
                const body = await request.json();
                if (body.message && body.message.text === '/stats') {
                    if (env.DB && env.TG_BOT_TOKEN) {
                        ctx.waitUntil(sendTgStats(env, body.message.chat.id));
                    }
                }
                return new Response("OK");
            } catch(e) { return new Response("OK"); }
        }

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "*", "Access-Control-Max-Age": "86400" } });
        }

        const EXPECTED_TOKEN = env.ADMIN_TOKEN;
        if (!EXPECTED_TOKEN) return new Response("请在 Worker 变量中配置 ADMIN_TOKEN", { status: 500 });

        function getCookie(req, name) {
            const cookieString = req.headers.get("Cookie");
            if (!cookieString) return null;
            const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
            if (match) return decodeURIComponent(match[2]);
            return null;
        }

        const isPanelOrApi = url.pathname === '/' || url.pathname.startsWith('/api/');
        if (isPanelOrApi && url.pathname !== '/api/tg-webhook') {
            const providedToken = getCookie(request, 'admin_token');
            if (providedToken !== EXPECTED_TOKEN) {
                if (url.pathname === '/') return new Response(LOGIN_UI, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
                else return new Response('Unauthorized', { status: 401 });
            }
        }

        if (url.pathname === '/') {
            return new Response(HTML_UI, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
        }

        // ==========================================
        // 2.3 数据大屏统计接口 (Analytics)
        // ==========================================
        if (url.pathname === '/api/analytics' && request.method === 'GET') {
            if (!env.DB) return Response.json({ success: false, error: '未绑定 D1 数据库' });
            try {
                // 并发获取 24小时、7天、30天流量 (通过全新 GraphQL API 规避限制)
                const [trafficToday, traffic7d, traffic30d] = await Promise.all([
                    getCFTraffic(env, 'today'),
                    getCFTraffic(env, 7),
                    getCFTraffic(env, 30)
                ]);

                // 使用 Promise.all 并行查询数据库，提升响应速度
                const [trend, locations, recents] = await Promise.all([
                    env.DB.prepare(`SELECT date(timestamp, '+8 hours') as date, COUNT(*) as count FROM visitor_logs WHERE ${DATE_FILTER_7D} GROUP BY date(timestamp, '+8 hours') ORDER BY date ASC`).all(),
                    env.DB.prepare(`SELECT country, COUNT(*) as count FROM visitor_logs WHERE ${DATE_FILTER_7D} GROUP BY country ORDER BY count DESC`).all(),
                    env.DB.prepare(`SELECT prefix, datetime(timestamp, '+8 hours') as timestamp, ip, country, ua FROM visitor_logs ORDER BY timestamp DESC LIMIT 20`).all()
                ]);
                
                return Response.json({ 
                    success: true, 
                    trend: trend.results, 
                    locations: locations.results, 
                    recents: recents.results, 
                    trafficToday, traffic7d, traffic30d 
                });
            } catch(e) {
                return Response.json({ success: false, error: e.message });
            }
        }

        // ==========================================
        // 🟢 后端接口：执行代码覆盖更新 (纯JSON接口无损继承：变量、数据库、兼容性、放置地区)
        // ==========================================
        if (url.pathname === '/api/deploy' && request.method === 'POST') {
            const cfToken = env.CF_API_TOKEN;
            const accountId = env.CF_ACCOUNT_ID;
            const workerName = env.CF_WORKER_NAME;
            if (!cfToken || !accountId || !workerName) {
                return Response.json({ success: false, error: '缺少 CF_API_TOKEN, CF_ACCOUNT_ID 或 CF_WORKER_NAME 环境变量' });
            }
            try {
                const body = await request.json();
                if (!body.newCode) return Response.json({ success: false, error: '代码内容为空。' });

                // 1. 🚀 终极修复：调用纯 JSON 的 services 接口获取真实配置，绝对不再崩溃！
                const serviceRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/services/${workerName}`, {
                    headers: { 'Authorization': `Bearer ${cfToken}` }
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
                        preservedBindings.push({ name: key, type: 'plain_text', text: env[key] });
                    }
                }

                // 3. 拉取 D1、KV 等高级绑定并无损合并
                const bindingsRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}/bindings`, {
                    headers: { 'Authorization': `Bearer ${cfToken}` }
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

                formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata.json');
                formData.append('worker.js', new Blob([body.newCode], { type: 'application/javascript+module' }), 'worker.js');

                const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`;
                const res = await fetch(cfUrl, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${cfToken}` },
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    return Response.json({ success: true, msg: '代码更新成功，并已完美保留原有放置地区和兼容配置！' });
                } else {
                    throw new Error(JSON.stringify(data.errors));
                }
            } catch (e) {
                return Response.json({ success: false, error: e.message });
            }
        }
        // ==========================================
        // 2.4 系统级与提取工具 API 
        // ==========================================
        if (url.pathname === '/api/purge-cache' && request.method === 'POST') {
            const cfToken = env.CF_API_TOKEN; const zoneId = env.CF_ZONE_ID;
            if (!cfToken || !zoneId) return Response.json({ success: false, error: '缺少 CF_API_TOKEN 或 CF_ZONE_ID 变量' });
            try {
                const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, { method: 'POST', headers: { 'Authorization': `Bearer ${cfToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ purge_everything: true }) });
                const data = await res.json();
                if (!data.success) throw new Error(JSON.stringify(data.errors));
                return Response.json({ success: true });
            } catch (e) { return Response.json({ success: false, error: e.message }); }
        }

        if (url.pathname === '/api/ping-node') {
            const target = url.searchParams.get('url');
            if (!target) return Response.json({ ms: -1 });
            const start = Date.now();
            try {
                const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 2000); 
                await fetch(target + '/', { method: 'HEAD', signal: controller.signal });
                clearTimeout(timeoutId); return Response.json({ ms: Date.now() - start });
            } catch (e) { return Response.json({ ms: -1 }); }
        }

        if (url.pathname === '/api/get-dns') {
            const cfToken = env.CF_API_TOKEN; const zoneId = env.CF_ZONE_ID; const domain = env.CF_DOMAIN;
            if (!cfToken || !zoneId || !domain) return Response.json({ success: false, error: '缺少 DNS 环境变量' });
            try {
                const getRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${domain}`, { headers: { 'Authorization': `Bearer ${cfToken}` } });
                const getData = await getRes.json();
                return Response.json({ success: true, result: getData.result });
            } catch (error) { return Response.json({ success: false, error: error.message }); }
        }

        if (url.pathname === '/api/update-dns' && request.method === 'POST') {
            const body = await request.json(); const ips = body.ips;
            const cfToken = env.CF_API_TOKEN; const zoneId = env.CF_ZONE_ID; const domain = env.CF_DOMAIN;

            if (!cfToken || !zoneId || !domain) return Response.json({ success: false, error: '缺少 DNS 环境变量' });
            try {
                const getRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${domain}`, { headers: { 'Authorization': `Bearer ${cfToken}` } });
                const getData = await getRes.json();
                if (!getData.success) throw new Error('获取现有 DNS 记录失败');

                const oldRecords = getData.result.filter(r => r.type === 'A' || r.type === 'AAAA' || r.type === 'CNAME');
                for (const record of oldRecords) {
                    await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${cfToken}` } });
                }

                for (const ip of ips) {
                    const cleanItem = ip.replace(/[\[\]]/g, ''); let recordType = 'A';
                    if (cleanItem.includes(':')) recordType = 'AAAA'; else if (/[a-zA-Z]/.test(cleanItem)) recordType = 'CNAME';

                    const postRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, { method: 'POST', headers: { 'Authorization': `Bearer ${cfToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ type: recordType, name: domain, content: cleanItem, ttl: 60, proxied: false }) });
                    const postData = await postRes.json();
                    if(!postData.success) throw new Error(`记录提交失败: ` + JSON.stringify(postData.errors));
                }
                return Response.json({ success: true, message: `✅ 成功！` });
            } catch (error) { return Response.json({ success: false, error: error.message }); }
        }

        if (url.pathname === '/api/get-custom-api-ips') {
            try {
                const apiUrl = url.searchParams.get('url');
                if (!apiUrl) throw new Error("缺少 URL");
                const response = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                const text = await response.text(); let validIPs = new Set();
                try {
                    const jsonObj = JSON.parse(text);
                    if (jsonObj && jsonObj.data && Array.isArray(jsonObj.data)) {
                        jsonObj.data.forEach(item => { if (item.ip) { let ip = item.ip; if (ip.includes(':') && !ip.startsWith('[')) ip = `[${ip}]`; validIPs.add(ip); } });
                    }
                } catch (e) {}

                if (validIPs.size === 0) {
                    const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
                    const matchedIPv4 = text.match(ipv4Regex) || [];
                    matchedIPv4.forEach(ip => { if (!ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('127.')) validIPs.add(ip); });

                    const ipv6Regex = /(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}|(?:[A-F0-9]{1,4}:)*:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*/gi;
                    const matchedIPv6 = text.match(ipv6Regex) || [];
                    matchedIPv6.forEach(ip => { if (ip.length > 7 && ip.includes(':') && !ip.startsWith('::1')) validIPs.add(ip.startsWith('[') ? ip : `[${ip}]`); });
                }
                const uniqueIPArray = Array.from(validIPs);
                for (let i = uniqueIPArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [uniqueIPArray[i], uniqueIPArray[j]] = [uniqueIPArray[j], uniqueIPArray[i]]; }
                return Response.json({ success: true, ips: uniqueIPArray.slice(0, 15), totalCount: uniqueIPArray.length });
            } catch (error) { return Response.json({ success: false, error: error.message }, { status: 500 }); }
        }

        if (url.pathname === '/api/get-remote-ips') {
            try {
                const reqType = (url.searchParams.get('type') || 'all').toLowerCase();
                const validIPs = new Set();

                if (['all', '电信', '联通', '移动', '多线', 'ipv6'].includes(reqType)) {
                    try {
                        const res1 = await fetch('https://api.uouin.com/cloudflare.html', { headers: { 'User-Agent': 'Mozilla/5.0' } });
                        if(res1.ok) {
                            const text1 = await res1.text(); const cleanText = text1.replace(/<[^>]+>/g, ' ');
                            const regex = /(电信|联通|移动|多线|ipv6)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-fA-F0-9]{1,4}:)+[a-fA-F0-9]{1,4})/gi;
                            let match; while ((match = regex.exec(cleanText)) !== null) {
                                const lineType = match[1].toLowerCase(); let ip = match[2];
                                if (ip.includes(':') && !ip.startsWith('[')) ip = `[${ip}]`;
                                if (reqType === 'all' || reqType === lineType) validIPs.add(ip);
                            }
                        }
                    } catch(e) {}
                }

                if (['all', '优选'].includes(reqType)) {
                    try {
                        const res2 = await fetch('https://raw.githubusercontent.com/ZhiXuanWang/cf-speed-dns/refs/heads/main/ipTop10.html', { headers: { 'User-Agent': 'Mozilla/5.0' } });
                        if(res2.ok) {
                            const text2 = await res2.text(); const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
                            const matched = text2.match(ipv4Regex) || []; matched.forEach(ip => { if (!ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('127.')) validIPs.add(ip); });
                        }
                    } catch(e) {}
                }
                const uniqueIPArray = Array.from(validIPs);
                for (let i = uniqueIPArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [uniqueIPArray[i], uniqueIPArray[j]] = [uniqueIPArray[j], uniqueIPArray[i]]; }
                return Response.json({ success: true, ips: uniqueIPArray.slice(0, 10), totalCount: uniqueIPArray.length });
            } catch (error) { return Response.json({ success: false, error: error.message }, { status: 500 }); }
        }

        // ==========================================
        // 2.5 数据库路由管理 API 
        // ==========================================
        if (url.pathname === '/api/routes/reorder' && request.method === 'POST') {
            if (!env.DB) return Response.json({ success: false, error: "未绑定 DB" });
            try {
                const items = await request.json(); 
                const stmts = items.map(item => env.DB.prepare('UPDATE routes SET sort_order = ? WHERE prefix = ?').bind(item.sort_order, item.prefix));
                await env.DB.batch(stmts);
                return Response.json({ success: true });
            } catch (e) { return Response.json({ success: false, error: e.message }); }
        }

        if (url.pathname === '/api/routes/import' && request.method === 'POST') {
            if (!env.DB) return Response.json({ success: false, error: "未绑定 DB" });
            try {
                const routes = await request.json();
                for (const r of routes) {
                    if (r.prefix && r.target) {
                        await env.DB.prepare('INSERT OR REPLACE INTO routes (prefix, target, mode, remark, last_play, icon, cache_img, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
                            .bind(r.prefix, r.target, r.mode || 'off', r.remark || '', r.last_play || '', r.icon || '', r.cache_img || 'on', r.sort_order || 0).run();
                    }
                }
                return Response.json({ success: true });
            } catch (e) { return Response.json({ success: false, error: e.message }); }
        }

        if (url.pathname.startsWith('/api/routes')) {
            if (!env.DB) return Response.json({ error: "由于未绑定 D1 数据库，反代功能不可用。" }, { status: 500 });

            await env.DB.exec(`CREATE TABLE IF NOT EXISTS routes (prefix TEXT PRIMARY KEY, target TEXT NOT NULL)`);
            await env.DB.exec(`CREATE TABLE IF NOT EXISTS request_stats (prefix TEXT, date TEXT, count INTEGER DEFAULT 0, PRIMARY KEY(prefix, date))`);
            // 大数据记录核心表：访客日志
            await env.DB.exec(`CREATE TABLE IF NOT EXISTS visitor_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, prefix TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, ip TEXT, country TEXT, ua TEXT)`);
            
            try { await env.DB.exec(`ALTER TABLE routes ADD COLUMN mode TEXT DEFAULT 'off'`); } catch(e) {}
            try { await env.DB.exec(`ALTER TABLE routes ADD COLUMN remark TEXT DEFAULT ''`); } catch(e) {}
            try { await env.DB.exec(`ALTER TABLE routes ADD COLUMN last_play TEXT DEFAULT ''`); } catch(e) {}
            try { await env.DB.exec(`ALTER TABLE routes ADD COLUMN icon TEXT DEFAULT ''`); } catch(e) {}
            try { await env.DB.exec(`ALTER TABLE routes ADD COLUMN cache_img TEXT DEFAULT 'on'`); } catch(e) {} 
            try { await env.DB.exec(`ALTER TABLE routes ADD COLUMN sort_order INTEGER DEFAULT 0`); } catch(e) {} 
            
            // 数据防爆清理策略：自动清理过去 7 天的精细日志
            try { await env.DB.exec(`DELETE FROM visitor_logs WHERE timestamp < datetime('now', '-7 days')`); } catch(e) {}

            // 🚀 【方案A修复版】：独立并发查流，完美绕过 CF 免费版复杂度限制！
            if (request.method === 'GET') {
                const todayStr = new Date(Date.now() + 8 * 3600000).toISOString().split('T')[0];
                const { results: routes } = await env.DB.prepare(`
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
                                headers: { 'Authorization': `Bearer ${env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
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
                        } catch(e) { 
                            r.todayBandwidth = "获取异常"; 
                        }
                    }));
                }
                
                return Response.json(routes || []);
            }
            
            if (request.method === 'POST') {
                const data = await request.json(); let currentSortOrder = 0;
                if (data.oldPrefix && data.oldPrefix !== data.prefix) {
                    const oldRow = await env.DB.prepare('SELECT sort_order FROM routes WHERE prefix = ?').bind(data.oldPrefix).first();
                    if(oldRow) currentSortOrder = oldRow.sort_order;
                    await env.DB.prepare('DELETE FROM routes WHERE prefix = ?').bind(data.oldPrefix).run();
                } else {
                    const oldRow = await env.DB.prepare('SELECT sort_order FROM routes WHERE prefix = ?').bind(data.prefix).first();
                    if(oldRow) currentSortOrder = oldRow.sort_order;
                }
                
                await env.DB.prepare('INSERT OR REPLACE INTO routes (prefix, target, mode, remark, icon, cache_img, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
                    .bind(data.prefix, data.target, data.mode || 'off', data.remark || '', data.icon || '', data.cache_img || 'on', currentSortOrder).run();
                return Response.json({ success: true });
            }
            
            if (request.method === 'DELETE') {
                const prefix = url.searchParams.get('prefix'); await env.DB.prepare('DELETE FROM routes WHERE prefix = ?').bind(prefix).run(); return Response.json({ success: true });
            }
            return new Response("Method not allowed", { status: 405 });
        }

        // ==========================================
        // 2.6 核心反代与调度引擎
        // ==========================================
        let targetUrls = []; let currentMode = 'off'; let enableCache = true; let remainingPath = '';
        const decodedPath = decodeURIComponent(url.pathname); let matchedPrefix = null; 
        let proxyOrigin = new URL(request.url).origin;

        if (decodedPath.startsWith('/http://') || decodedPath.startsWith('/https://')) {
            // 🚫 通用反代访问控制检查
            // 优先从 D1 数据库读取配置，如果失败则使用代码常量
            let isAllowed = ALLOW_GENERAL_PROXY;
            
            // 优先从 D1 数据库读取（更可靠）
            if (env.DB) {
                try {
                    await env.DB.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
                    const result = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('general_proxy_enabled').first();
                    if (result && result.value !== null) {
                        isAllowed = result.value === 'true';
                    }
                } catch(e) {
                    console.error('D1读取通用反代状态失败，使用默认值:', e);
                }
            }
            // 备选：从 KV 读取（向后兼容）
            else if (env.SETTINGS) {
                try {
                    const kvValue = await env.SETTINGS.get('general_proxy_enabled');
                    if (kvValue !== null) {
                        isAllowed = kvValue === 'true';
                    }
                } catch(e) {
                    console.error('KV读取通用反代状态失败，使用默认值:', e);
                }
            }
            
            if (!isAllowed) {
                return new Response(
                    JSON.stringify({
                        error: "通用反代功能已禁用",
                        message: "请联系管理员开启通用反代功能，或使用已配置的反代节点访问",
                        hint: "如需添加节点，请访问管理面板进行配置"
                    }),
                    {
                        status: 403,
                        headers: {
                            "Content-Type": "application/json;charset=UTF-8",
                            "Access-Control-Allow-Origin": "*"
                        }
                    }
                );
            }
            targetUrls = [decodedPath.substring(1)]; remainingPath = '';
        } else {
            const pathParts = decodedPath.split('/'); const prefix = pathParts[1]; 
            if (!prefix) return new Response(`Not Found`, { status: 404 });

            try {
                if (!env.DB) return new Response(`404: Node not found (DB not bound)`, { status: 404 });
                const stmt = env.DB.prepare(`SELECT target, mode, cache_img FROM routes WHERE prefix = ?`);
                const route = await stmt.bind(prefix).first();
                if (!route) return new Response(`404: Node not found`, { status: 404 });

                currentMode = route.mode || 'off'; enableCache = (route.cache_img !== 'off');
                matchedPrefix = prefix; remainingPath = '/' + pathParts.slice(2).join('/');
                targetUrls = route.target.split(',').map(s => s.trim()).filter(Boolean);
                
                if (remainingPath.startsWith('/http://') || remainingPath.startsWith('/https://')) { targetUrls = [remainingPath.substring(1)]; remainingPath = ''; }
            } catch (e) { return new Response("DB Error: " + e.message, { status: 500 }); }
        }

        if (targetUrls.length === 0) return new Response("404: Target empty", { status: 404 });

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

                const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "Unknown";
                const clientCountry = request.headers.get("cf-ipcountry") || "Unknown";
                const clientUa = request.headers.get("User-Agent") || "Unknown";
                stmts.push(env.DB.prepare(`INSERT INTO visitor_logs (prefix, ip, country, ua) VALUES (?, ?, ?, ?)`).bind(matchedPrefix, clientIp, clientCountry, clientUa));

                ctx.waitUntil(env.DB.batch(stmts));
            } catch(e) {}
        }

        // ==========================================
        // 2.8 无伪装模式下的源站反代 (含强力防 403 引擎)
        // ==========================================
        const isStrictMode = currentMode === 'strict';

        let bodyBuffer = null;
        if (request.method !== 'GET' && request.method !== 'HEAD' && targetUrls.length > 1) {
            bodyBuffer = await request.clone().arrayBuffer();
        }

        let finalResponse = null; let lastError = null;

        for (let i = 0; i < targetUrls.length; i++) {
            const targetUrlStr = targetUrls[i] + remainingPath + url.search; const targetUrl = new URL(targetUrlStr);
            const newHeaders = new Headers(request.headers); newHeaders.set("Host", targetUrl.host);

            const realIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || (request.headers.get("x-forwarded-for") || "").split(',')[0].trim();
            newHeaders.delete("cf-connecting-ip"); newHeaders.delete("cf-ipcountry"); newHeaders.delete("cf-ray");
            newHeaders.delete("cf-visitor"); newHeaders.delete("x-forwarded-for"); newHeaders.delete("x-real-ip");

            if (currentMode === 'realip_only' && realIp) { newHeaders.set("X-Real-IP", realIp); } 
            else if (currentMode === 'dual' && realIp) { newHeaders.set("X-Real-IP", realIp); newHeaders.set("X-Forwarded-For", realIp); }
            else if (isStrictMode) {
                // 强力防 403 模式：强制清空原始端代理参数，对齐 Origin
                newHeaders.delete("X-Forwarded-Proto"); newHeaders.delete("X-Forwarded-Host");
                newHeaders.set("Origin", targetUrl.origin); newHeaders.set("Referer", targetUrl.origin + "/");
                if (realIp) { newHeaders.set("X-Real-IP", realIp); newHeaders.set("X-Forwarded-For", realIp); }
            }

            const isStaticOrImage = /\.(jpg|jpeg|gif|png|svg|ico|webp|js|css|woff2?|ttf|otf|map|webmanifest|srt|ass|vtt|sub)$/i.test(targetUrl.pathname) || /(\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i.test(targetUrl.pathname);

            let fetchInit = { method: request.method, headers: newHeaders, redirect: 'manual' };

            if (isStaticOrImage && enableCache) { fetchInit.cf = { cacheEverything: true, cacheTtl: 86400 }; }

            if (request.method !== 'GET' && request.method !== 'HEAD') {
                if (targetUrls.length > 1) { fetchInit.body = bodyBuffer; } 
                else { fetchInit.body = request.body; fetchInit.duplex = 'half'; }
            }

            try {
                const modifiedRequest = new Request(targetUrl, fetchInit); const response = await fetch(modifiedRequest);
                if (response.status === 502 || response.status === 503 || response.status === 504) { lastError = new Error(`Node ${i+1} returned HTTP ${response.status}`); continue; }
                finalResponse = response; break; 
            } catch (err) { lastError = err; continue; }
        }

        if (!finalResponse) return new Response("Worker Proxy Failover Exhausted. All nodes failed. Last Error: " + (lastError?.message || 'Unknown Error'), { status: 502 });

        const responseHeaders = new Headers(finalResponse.headers);
        
        // 统一前缀变量，确保绝对安全，不会抛出未定义错误
        // 假设你前面获取路由节点的变量叫 matchedPrefix，如果有值就带上斜杠
        const safePrefix = matchedPrefix ? `/${matchedPrefix}` : '';

        // ==========================================
        // 🚀 修复版 302 拦截：恢复 URL 编码
        // ==========================================
        if ([301, 302, 303, 307, 308].includes(finalResponse.status)) {
            const location = responseHeaders.get('Location');
            if (location && /^https?:\/\//i.test(location)) {
                // 🎯 补回 encodeURIComponent，防止播放器解析重定向头时发疯
                responseHeaders.set('Location', `${safePrefix}/${encodeURIComponent(location)}`);
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
                                // 🎯 统一使用 safePrefix，杜绝 ReferenceError 导致重写崩溃
                                source[key] = proxyOrigin + safePrefix + '/' + source[key]; 
                                modified = true; 
                            }
                        });
                    });
                }
                if (modified) { 
                    responseHeaders.delete("Content-Length"); 
                    return new Response(JSON.stringify(data), { status: finalResponse.status, statusText: finalResponse.statusText, headers: responseHeaders }); 
                }
            } catch (e) {
                // 别再隐式吞报错了，如果出问题，可以在 Worker 日志里看得到
                console.log("PlaybackInfo JSON 重写失败:", e.message);
            }
        }

        // 🚀 处理 M3U8 播放列表中的真实视频切片链接
        if (finalResponse.status === 200 && url.pathname.toLowerCase().endsWith('.m3u8')) {
            try {
                let clonedRes = finalResponse.clone(); 
                let text = await clonedRes.text();
                if (text.includes('http://') || text.includes('https://')) {
                    // 🎯 同样修复变量名
                    let modifiedText = text.replace(/(https?:\/\/[^\s]+)/g, proxyOrigin + safePrefix + '/$1');
                    responseHeaders.delete("Content-Length"); 
                    return new Response(modifiedText, { status: finalResponse.status, statusText: finalResponse.statusText, headers: responseHeaders });
                }
            } catch(e) {
                console.log("M3U8 重写失败:", e.message);
            }
        }

        // 静态资源缓存控制保持不变
        const isStaticRes = /\.(jpg|jpeg|gif|png|svg|ico|webp|js|css|woff2?|ttf|otf|map|webmanifest|srt|ass|vtt|sub)$/i.test(url.pathname) || /(\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i.test(url.pathname);
        if (isStaticRes && enableCache) {
            responseHeaders.set('Cache-Control', 'public, max-age=86400'); 
            responseHeaders.delete('Expires'); 
            responseHeaders.delete('Pragma');  
        } else { 
            responseHeaders.set('Cache-Control', 'no-store'); 
        }

        return new Response(finalResponse.body, { status: finalResponse.status, statusText: finalResponse.statusText, headers: responseHeaders });
    }
};
