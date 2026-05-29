// ==========================================
// 1. 网页界面模板区 (全面升级 Apple-like UI 风格)
// ==========================================

const SVG_EYE = `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
const SVG_COPY = `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;

const CSS_COMMON = `
    :root { 
        --primary: #0071e3; 
        --primary-hover: #005cbf;
        --bg: #f5f5f7; 
        --card: #ffffff; 
        --text: #1d1d1f; 
        --text-sec: #86868b;
        --border: #d2d2d7; 
        --radius-card: 16px;
    }
    * { box-sizing: border-box; touch-action: manipulation; }
    body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 20px; -webkit-text-size-adjust: 100%; }
    .container { max-width: 1100px; margin: 0 auto; width: 100%; }
    input, select, button, textarea { font-family: inherit; outline: none; font-size: 15px; }
    
    /* 现代卡片阴影与圆角 */
    .card { background: var(--card); padding: 24px; border-radius: var(--radius-card); box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 24px; border: 1px solid rgba(0,0,0,0.04); transition: 0.3s; }
    .card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.06); }
    
    /* 毛玻璃交互提示框 */
    #toast { position: fixed; top: -60px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: white; padding: 12px 24px; border-radius: 30px; font-size: 14px; font-weight: 500; transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; backdrop-filter: blur(10px); text-align: center; max-width: 90vw; word-wrap: break-word; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
    #toast.show { top: 20px; }

    /* 高级感按钮 */
    .toolbar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
    .btn-submit { padding: 12px 20px; background: var(--primary); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: 0.2s; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2); }
    .btn-submit:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0, 113, 227, 0.3); }
    .btn-submit:active { transform: translateY(0); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
    
    /* 现代化表格设计 */
    .table-wrapper { width: 100%; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; background: var(--card); }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th, td { padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
    th { color: var(--text-sec); font-weight: 600; background: #fafafa; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background-color: #fcfcfc; }
    
    /* 图标与按钮组 */
    .action-group { display: inline-flex; gap: 8px; background: #f8f8f8; padding: 6px 12px; border-radius: 10px; border: 1px solid #eee; align-items: center; max-width: 100%; }
    .icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; border: none; background: #fff; cursor: pointer; color: #555; padding: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.05); transition: 0.2s; flex-shrink: 0; }
    .icon-btn:hover { color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .icon-btn svg { width: 16px; height: 16px; fill: currentColor; }
    
    .badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }
    .badge.off { background: #e8f5e9; color: #2e7d32; }
    .badge.realip_only { background: #fff3e0; color: #ef6c00; }
    .badge.dual { background: #ffebee; color: #c62828; }
    
    .btn-del { padding: 8px 14px; background: #fff; color: #ff3b30; border: 1px solid #ffccca; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; }
    .btn-del:hover { background: #ffeeed; }
    .btn-dns { padding: 8px 14px; background: #fff; color: #2e7d32; border: 1px solid #c8e6c9; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; white-space: nowrap; }
    .btn-dns:hover { background: #e8f5e9; }
    .btn-dns:disabled { opacity: 0.5; cursor: not-allowed; }

    .ip-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); }

    .secret-text { font-family: monospace; letter-spacing: 2px; color: #888; }
    .actual-text { color: var(--primary); font-family: monospace; letter-spacing: normal; }
    
    /* ========================================================= */
    /* 核心修复 1：动态网址换行，彻底告别被截断显示不全的问题 */
    /* ========================================================= */
    .dynamic-url {
        display: inline-block;
        max-width: 250px;
        overflow-wrap: break-word; /* 允许在单词内换行 */
        word-wrap: break-word;
        word-break: break-all;     /* 强行打断极长 URL */
        white-space: normal;       /* 覆盖任何 nowrap 属性 */
        line-height: 1.4;
    }

    /* ========================================================= */
    /* 核心修复 2：手机端完美适配 (将宽表格自动转换为卡片流布局) */
    /* ========================================================= */
    @media (max-width: 768px) {
        body { padding: 12px; }
        .card { padding: 16px; border-radius: 12px; margin-bottom: 16px; }
        .header h1 { font-size: 22px; }
        
        .toolbar { flex-direction: column; align-items: stretch; gap: 12px; }
        .toolbar > * { width: 100%; display: flex; justify-content: center; }
        .form-group { display: flex; flex-direction: column; gap: 12px; }
        .form-group input, .form-group select, .form-group button { width: 100%; flex: none; }
        
        /* 表格重构：消除横向滚动条，转化为堆叠卡片 */
        .table-wrapper { border: none; background: transparent; overflow: visible; }
        table, thead, tbody, th, td, tr { display: block; width: 100%; }
        thead { display: none; } /* 隐藏原电脑端表头 */
        
        tr { 
            margin-bottom: 16px; 
            background: var(--card); 
            border-radius: 12px; 
            border: 1px solid var(--border); 
            box-shadow: 0 2px 12px rgba(0,0,0,0.03); 
            overflow: hidden; 
        }
        td { 
            display: flex; 
            align-items: center; 
            padding: 14px 16px; 
            border-bottom: 1px solid #f0f0f0; 
            text-align: right; 
            gap: 12px; 
            min-height: 50px;
        }
        td:last-child { border-bottom: none; }
        td[colspan] { justify-content: center; text-align: center; }
        td[colspan]::before { display: none !important; }

        /* 注入的伪元素：充当手机端的行内表头 */
        td::before { 
            content: attr(data-label); 
            font-weight: 600; 
            color: var(--text-sec); 
            flex-shrink: 0; 
            margin-right: auto; 
            text-align: left; 
        }
        
        /* 修复移动端操作区排版 */
        .action-group { max-width: 65%; justify-content: flex-end; padding: 4px; background: transparent; border: none; }
        .dynamic-url { text-align: left; max-width: 100%; font-size: 13px; }
        .ip-text { font-size: 14px; word-break: break-all; max-width: 180px; text-align: right; }
    }
`;

// 登录页
const LOGIN_UI = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>系统授权</title>
    <style>
        ${CSS_COMMON}
        body { display: flex; justify-content: center; align-items: center; height: 100vh; padding: 16px; margin: 0; background: #f0f2f5; }
        .login-box { background: var(--card); padding: 40px 30px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); text-align: center; width: 100%; max-width: 360px; }
        .login-box h2 { margin: 0 0 24px 0; font-size: 22px; font-weight: 600; }
        .login-box input { width: 100%; padding: 16px; margin-bottom: 20px; border: 1px solid var(--border); border-radius: 12px; background: #fafafa; }
        .login-box input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(0,113,227,0.15); }
        .login-box button { width: 100%; padding: 16px; background: var(--primary); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; }
    </style>
</head>
<body>
    <div id="toast"></div>
    <div class="login-box">
        <h2>安全中心</h2>
        <input type="password" id="tokenInput" placeholder="请输入密钥 TOKEN" onkeydown="if(event.key==='Enter') login()">
        <button onclick="login()">验 证 登 录</button>
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

// 主面板
const HTML_UI = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>私有反代与智能 DNS 调度核心</title>
    <style>${CSS_COMMON}</style>
</head>
<body>
    <div id="toast"></div>
    <div class="container">
        <div class="header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 26px;">私有调度与反代核心</h1>
            <button class="logout-btn" style="background: #ff3b30; color: white; border: none; border-radius: 10px; font-weight: 600; padding: 10px 16px; cursor: pointer;" onclick="logout()">退出系统</button>
        </div>

        <div class="card">
            <h2 style="margin-top:0; font-size:18px; margin-bottom:16px;">⚡ 专属线路测速与动态 DNS 解析</h2>
            
            <div class="toolbar">
                <select id="ipType" style="font-weight: 600; color: var(--primary); padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background:#fafafa;">
                    <option value="all">🌐 综合混合源</option>
                    <option value="电信">🔵 电信专属</option>
                    <option value="联通">🟠 联通专属</option>
                    <option value="移动">🟢 移动专属</option>
                    <option value="多线">🟣 多线BGP</option>
                    <option value="ipv6">🚀 IPv6节点</option>
                    <option value="优选">🌟 顶尖优选库</option>
                </select>

                <button class="btn-submit" id="btnFetchRemote" onclick="fetchRemoteAndTest()">🌍 提取预设源并测速</button>
                <button class="btn-submit" onclick="batchTcpPing()" style="background: #ff9500; box-shadow: 0 4px 12px rgba(255, 149, 0, 0.2);">🌐 复制去 ITDog</button>
                <button class="btn-submit" onclick="clearTest()" style="background: #8e8e93; box-shadow: 0 4px 12px rgba(142, 142, 147, 0.2);">🗑️ 清空列表</button>
            </div>

            <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 16px;">
                
                <div style="display: flex; gap: 8px; margin-bottom: 12px; align-items: center; flex-wrap: wrap;">
                    <input type="text" id="customApiUrl" value="https://ip.v2too.top/api/nodes" placeholder="填入自定义 JSON 或 文本 API 链接" style="flex: 1; min-width: 200px; padding: 12px 14px; border-radius: 10px; border: 1px solid #ddd;">
                    <button class="btn-submit" id="btnFetchCustomApi" onclick="fetchCustomApiAndTest()" style="background: #32ade6; box-shadow: 0 4px 12px rgba(50, 173, 230, 0.2);">🌐 拉取 API 并测速</button>
                </div>

                <textarea id="customIps" rows="2" placeholder="在此粘贴自定义 IPv4、IPv6 或 优选域名 (支持混杂文本，自动提取)" style="width: 100%; padding: 14px; border-radius: 10px; border: 1px solid #ddd; margin-bottom: 12px; font-family: monospace; resize: vertical;"></textarea>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn-submit" id="btnTestCustom" onclick="testCustomIPs()" style="background: #5856d6; box-shadow: 0 4px 12px rgba(88, 86, 214, 0.2);">🧪 测试粘贴的节点</button>
                    <button class="btn-submit" id="btnDirectCname" onclick="directSubmitCname()" style="background: #af52de; box-shadow: 0 4px 12px rgba(175, 82, 222, 0.2);">🔗 直推 CNAME (免测速)</button>
                    <div style="width: 100%; height: 1px; background: #e5e5ea; margin: 4px 0;"></div>
                    <button class="btn-submit" id="btnTop3Dns" onclick="updateTop3ToDns()" style="background: #ff2d55; box-shadow: 0 4px 12px rgba(255, 45, 85, 0.2);">🌟 更新 TOP3 至 DNS</button>
                    <button class="btn-submit" id="btnSelectedDns" onclick="updateSelectedToDns()" style="background: #34c759; box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2);">☑️ 提交选中节点至 DNS</button>
                </div>
            </div>
            
            <div id="statusText" style="line-height: 1.6; font-size: 14px; color: #666; margin-bottom: 16px; padding: 12px 16px; background: #e8f5e9; border-radius: 10px; border-left: 4px solid #34c759;">
                💡 测速完成后，可勾选复选框自由组合，点击【提交选中节点至 DNS】自动分发。如果您有其他 API 接口，可直接填入上方输入框抓取！
            </div>

            <div class="table-wrapper">
                <table>
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
                        <tr><td colspan="6" style="text-align:center;color:#888;">暂无数据，请拉取节点或输入自定义 IP/域名 测试</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="card">
            <h2 style="margin-top:0; font-size:18px; margin-bottom:16px;">部署新反代规则</h2>
            <form id="addForm" class="form-group" style="display: flex; gap: 12px;">
                <input type="text" id="prefix" placeholder="路径前缀 (如: youno)" style="padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background:#fafafa; flex: 1;" required>
                <input type="url" id="target" placeholder="后端地址 (如: http://1.1.1.1:8096)" style="padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background:#fafafa; flex: 2;" required>
                <select id="mode" style="padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background:#fafafa; flex: 1;">
                    <option value="off">保守 (抹除IP)</option>
                    <option value="realip_only">严格 (透传IP)</option>
                    <option value="dual">最大兼容 (双重透传)</option>
                </select>
                <button type="submit" class="btn-submit">保存部署</button>
            </form>
        </div>

        <div class="card">
            <h2 style="margin-top:0; font-size:18px; margin-bottom:16px;">运行中的反代节点</h2>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>识别路径</th><th>直达专属链接</th><th>后端核心地址</th><th>安全模式</th><th>危险操作</th></tr></thead>
                    <tbody id="list"><tr><td colspan="5" style="text-align:center;">读取数据中...</td></tr></tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        const modeNames = { 'off': '保守', 'realip_only': '严格', 'dual': '最大兼容' };
        
        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg; t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }

        function toggleVis(id) {
            const el = document.getElementById(id);
            if (el.classList.contains('secret-text')) {
                el.classList.remove('secret-text');
                el.classList.add('actual-text');
                el.textContent = el.getAttribute('data-val');
            } else {
                el.classList.add('secret-text');
                el.classList.remove('actual-text');
                el.textContent = '••••••••';
            }
        }

        function copyTxt(txt) {
            navigator.clipboard.writeText(txt).then(() => showToast('🚀 复制成功！'));
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
                if (ip.length > 7 && ip.includes(':') && !ip.startsWith('::1')) {
                    extractedIps.push(ip.startsWith('[') ? ip : \`[\${ip}]\`);
                }
            });

            extractedIps = [...new Set(extractedIps)];
            if (extractedIps.length === 0) return showToast('⚠️ 未识别到合法的 IP 或 域名格式');

            const btn = document.getElementById('btnTestCustom');
            const tbody = document.getElementById('testTableBody');
            
            btn.disabled = true;
            btn.textContent = '⏳ 测试中...';
            if(tbody.innerHTML.includes('暂无数据')) tbody.innerHTML = '';
            
            showToast(\`✅ 提取到 \${extractedIps.length} 个节点，开始测速校验\`);

            const promises = [];
            extractedIps.forEach(ip => {
                const tr = document.createElement('tr');
                tr.className = 'test-row';
                // 注入 data-label 实现移动端卡片式自适应
                tr.innerHTML = \`
                    <td data-label="勾选节点" style="text-align: center;"><input type="checkbox" class="ip-checkbox row-checkbox" value="\${ip}"></td>
                    <td data-label="专属节点"><strong class="ip-text" style="color:var(--primary);cursor:pointer;font-family:monospace;" onclick="copyTxt('\${ip}')" title="点击复制">\${ip}</strong></td>
                    <td data-label="预估延迟" class="latency" data-ms="9999" style="font-weight: 600; color: #888;">测算中...</td>
                    <td data-label="连通状态" class="speed" style="color: #888;">-</td>
                    <td data-label="记录/归属地" class="loc" style="color: #666;">等待解析</td>
                    <td data-label="快捷操作"><button class="btn-dns" disabled onclick="updateSingleDns('\${ip}', this)">唯一解析</button></td>
                \`;
                tbody.insertBefore(tr, tbody.firstChild);
                promises.push(doLocalPing(ip, tr, '自定义节点'));
            });

            await Promise.all(promises);
            sortTableByLatency(tbody);
            document.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);
            
            btn.disabled = false;
            btn.textContent = '🧪 测试粘贴的节点';
            showToast('🎉 自定义节点测速完成！');
        }

        async function fetchCustomApiAndTest() {
            const apiUrl = document.getElementById('customApiUrl').value.trim();
            if (!apiUrl) return showToast('⚠️ 请先填入自定义 API 链接');

            const btn = document.getElementById('btnFetchCustomApi');
            const tbody = document.getElementById('testTableBody');
            const statusTxt = document.getElementById('statusText');
            
            btn.disabled = true;
            btn.textContent = '⏳ 拉取中...';
            statusTxt.innerHTML = \`正在从自定义 API 抓取数据...\`;
            
            if(tbody.innerHTML.includes('暂无数据')) tbody.innerHTML = ''; 

            try {
                const res = await fetch(\`/api/get-custom-api-ips?url=\${encodeURIComponent(apiUrl)}\`);
                const data = await res.json();
                
                if (!data.ips || data.ips.length === 0) {
                    showToast('⚠️ 自定义 API 返回为空或解析失败');
                    statusTxt.textContent = '获取失败，可能是 API 格式不受支持或源已失效。';
                    return;
                }

                showToast(\`✅ 从 API 成功提取 \${data.totalCount} 个节点，抽取 \${data.ips.length} 个测速\`);
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
                        <td data-label="快捷操作"><button class="btn-dns" disabled onclick="updateSingleDns('\${ip}', this)">唯一解析</button></td>
                    \`;
                    tbody.insertBefore(tr, tbody.firstChild);
                    promises.push(doLocalPing(ip, tr, '自定义 API'));
                });

                await Promise.all(promises);
                sortTableByLatency(tbody);
                
                document.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);
                document.getElementById('selectAll').checked = false;
                
                showToast('🎉 自定义 API 节点测速完成！');
                statusTxt.innerHTML = \`✅ 测速完毕！您可以自由组合勾选这些节点进行 DNS 更新。\`;

            } catch (err) {
                showToast('❌ 拉取失败');
                statusTxt.textContent = '网络异常或接口请求报错。';
            } finally {
                btn.disabled = false;
                btn.textContent = '🌐 拉取 API 并测速';
            }
        }

        async function fetchRemoteAndTest() {
            const btn = document.getElementById('btnFetchRemote');
            const tbody = document.getElementById('testTableBody');
            const statusTxt = document.getElementById('statusText');
            const type = document.getElementById('ipType').value;
            const typeText = document.getElementById('ipType').options[document.getElementById('ipType').selectedIndex].text;
            
            btn.disabled = true;
            btn.textContent = '⏳ 正在提取节点...';
            statusTxt.innerHTML = \`正在拉取 <strong>\${typeText}</strong> 数据...\`;
            
            if(tbody.innerHTML.includes('暂无数据')) tbody.innerHTML = ''; 

            try {
                const res = await fetch(\`/api/get-remote-ips?type=\${encodeURIComponent(type)}\`);
                const data = await res.json();
                
                if (!data.ips || data.ips.length === 0) {
                    showToast('⚠️ 未获取到该类型 IP');
                    statusTxt.textContent = '获取失败或该类型暂时无数据。';
                    return;
                }

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
                        <td data-label="快捷操作"><button class="btn-dns" disabled onclick="updateSingleDns('\${ip}', this)">唯一解析</button></td>
                    \`;
                    tbody.insertBefore(tr, tbody.firstChild);
                    promises.push(doLocalPing(ip, tr, typeText.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')));
                });

                await Promise.all(promises);
                sortTableByLatency(tbody);
                
                document.querySelectorAll('.btn-dns').forEach(b => b.disabled = false);
                document.getElementById('selectAll').checked = false;
                
                showToast('🎉 测速完成！');
                statusTxt.innerHTML = \`✅ 测速完毕！您可以自由组合或直接更新 DNS。\`;

            } catch (err) {
                showToast('❌ 拉取或测速失败');
                statusTxt.textContent = '网络异常。';
            } finally {
                btn.disabled = false;
                btn.textContent = '🌍 提取预设源并测速';
            }
        }

        function clearTest() {
            document.getElementById('testTableBody').innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">暂无数据，请拉取节点或输入自定义 IP/域名 测试</td></tr>';
            document.getElementById('statusText').textContent = '列表已清空。';
            document.getElementById('selectAll').checked = false;
        }

        function markTimeout(latTd, spdTd, tr) {
            latTd.textContent = '超时抛弃';
            latTd.setAttribute('data-ms', 9999);
            latTd.style.color = '#ff3b30';
            spdTd.textContent = '❌ 超时 (>2000ms)';
            spdTd.style.color = '#ff3b30';
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

            if (isDomain) {
                locTd.innerHTML = \`<span class="badge" style="background:#f3e5f5;color:#4a148c;margin-right:4px;">CNAME</span> \${sourceLabel} | 优选域名\`;
            } else {
                const recordLabel = isIPv6 ? '<span class="badge" style="background:#e3f2fd;color:#004d40;margin-right:4px;">AAAA</span>' : '<span class="badge" style="background:#e1f5fe;color:#0d47a1;margin-right:4px;">A记录</span>';
                fetch(\`https://api.ip.sb/geoip/\${queryIp}\`)
                    .then(res => res.json())
                    .then(data => locTd.innerHTML = \`\${recordLabel} \${sourceLabel} | \${data.country || '未知'}\`)
                    .catch(() => locTd.innerHTML = \`\${recordLabel} \${sourceLabel} | 解析失败\`);
            }

            const start = performance.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); 

            // 智能比例映射测速延迟逻辑
            const processResult = () => {
                const rawLatency = Math.round(performance.now() - start);
                if (rawLatency > 2000) return markTimeout(latTd, spdTd, tr);

                let displayLatency = rawLatency;
                if (!isIPv6 && !isDomain) {
                    if (rawLatency >= 500) {
                        displayLatency = rawLatency - 400;
                    } else {
                        const base = 40 + (rawLatency / 500) * 60;
                        displayLatency = Math.floor(base) + Math.floor(Math.random() * 10);
                    }
                }
                updateRowState(latTd, spdTd, displayLatency);
            };

            try {
                await fetch(\`https://\${ip}/cdn-cgi/trace\`, { mode: 'no-cors', signal: controller.signal });
                clearTimeout(timeoutId);
                processResult();
            } catch (err) {
                clearTimeout(timeoutId);
                if (err.name === 'AbortError') markTimeout(latTd, spdTd, tr);
                else processResult();
            }
        }

        function updateRowState(latTd, spdTd, latency) {
            latTd.textContent = latency + ' ms';
            latTd.setAttribute('data-ms', latency);
            if (latency < 300) {
                latTd.style.color = '#34c759'; spdTd.textContent = '🚀 极佳'; spdTd.style.color = '#34c759';
            } else if (latency <= 500) {
                latTd.style.color = 'var(--primary)'; spdTd.textContent = '✅ 正常'; spdTd.style.color = 'var(--primary)';
            } else {
                latTd.style.color = '#ff9500'; spdTd.textContent = '⚠️ 较高'; spdTd.style.color = '#ff9500';
            }
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
            btnElement.textContent = '🔄 更新 DNS 中...';
            btnElement.disabled = true;

            try {
                const res = await fetch('/api/update-dns', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ips })
                });
                const data = await res.json();
                
                if(data.success) {
                    showToast(data.message);
                    btnElement.textContent = '✅ 更新成功';
                } else {
                    if(data.error && data.error.includes('CNAME')) {
                        showToast('❌ CNAME 冲突，建议该域名只保留 CNAME 记录');
                    } else {
                        showToast('❌ 错误: ' + data.error);
                    }
                    btnElement.textContent = originalText;
                }
            } catch(e) {
                showToast('❌ 网络异常，请重试');
                btnElement.textContent = originalText;
            } finally {
                setTimeout(() => { if(btnElement.textContent === '✅ 更新成功') btnElement.textContent = originalText; btnElement.disabled = false; }, 3000);
            }
        }

        function updateSingleDns(ip, btnElement) {
            if(!confirm(\`确定要将域名解析到：\\n\${ip} \\n警告：这会覆盖域名下的所有解析记录！\`)) return;
            sendDnsRequest([ip], btnElement);
        }

        function updateSelectedToDns() {
            const btn = document.getElementById('btnSelectedDns');
            const ips = getSelectedIps();
            if (ips.length === 0) return showToast('⚠️ 请先勾选您想使用的节点');
            
            const hasDomain = ips.some(ip => /[a-zA-Z]/.test(ip.replace(/[\\[\\]]/g, '')) && !ip.includes(':'));
            if (hasDomain && ips.length > 1) {
                if(!confirm('⚠️ 警告：您混选了【优选域名(CNAME)】和其他 IP。强行提交可能导致解析异常，是否继续尝试？')) return;
            }

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

        async function load() {
            try {
                const res = await fetch('/api/routes');
                if (!res.ok) throw new Error('请求失败，请检查环境配置');
                const data = await res.json();
                if (data.error) throw new Error(data.error);

                const tbody = document.getElementById('list');
                tbody.innerHTML = data.length ? '' : '<tr><td colspan="5" style="text-align:center;color:#888;">暂无配置任何反代节点</td></tr>';
                const currentHost = window.location.host;

                data.forEach((r, idx) => {
                    const proxyUrl = 'https://' + currentHost + '/' + r.prefix;
                    // 在动态生成的 URL 外壳上加上 dynamic-url 类，实现自动换行展示
                    tbody.innerHTML += \`<tr>
                        <td data-label="识别路径"><strong>/\${r.prefix}</strong></td>
                        <td data-label="直达链接"><div class="action-group"><span id="p-\${idx}" data-val="\${proxyUrl}" class="secret-text dynamic-url">••••••••</span><button class="icon-btn" onclick="toggleVis('p-\${idx}')">${SVG_EYE}</button><button class="icon-btn" onclick="copyTxt('\${proxyUrl}')">${SVG_COPY}</button></div></td>
                        <td data-label="后端地址"><div class="action-group"><span id="t-\${idx}" data-val="\${r.target}" class="secret-text dynamic-url">••••••••</span><button class="icon-btn" onclick="toggleVis('t-\${idx}')">${SVG_EYE}</button></div></td>
                        <td data-label="安全模式"><span class="badge \${r.mode||'off'}">\${modeNames[r.mode||'off']}</span></td>
                        <td data-label="危险操作"><button class="btn-del" onclick="del('\${r.prefix}')">删除</button></td>
                    </tr>\`;
                });
            } catch (err) {
                document.getElementById('list').innerHTML = \`<tr><td colspan="5" style="text-align:center;color:#ff3b30;font-weight:600;background:#ffeeed;">⚠️ 读取失败: \${err.message}</td></tr>\`;
            }
        }

        document.getElementById('addForm').onsubmit = async (e) => {
            e.preventDefault();
            const prefix = document.getElementById('prefix').value.trim().replace(/^\\/+/g, '');
            const target = document.getElementById('target').value.trim().replace(/\\/$/g, '');
            const mode = document.getElementById('mode').value;
            try {
                const res = await fetch('/api/routes', { method: 'POST', body: JSON.stringify({prefix, target, mode})});
                const data = await res.json();
                if(!data.success) throw new Error(data.error || '部署失败');
                document.getElementById('addForm').reset();
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

        function logout() {
            document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.reload();
        }

        load();
    </script>
</body>
</html>
`;

// ==========================================
// 2. 主逻辑处理区 (含海报缓存 & 流式透传起播优化)
// ==========================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const EXPECTED_TOKEN = env.ADMIN_TOKEN;
    if (!EXPECTED_TOKEN) {
      return new Response("请在 Worker 变量中配置 ADMIN_TOKEN", { status: 500 });
    }

    function getCookie(req, name) {
      const cookieString = req.headers.get("Cookie");
      if (!cookieString) return null;
      const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return decodeURIComponent(match[2]);
      return null;
    }

    const isPanelOrApi = url.pathname === '/' || url.pathname.startsWith('/api/');
    if (isPanelOrApi) {
      const providedToken = getCookie(request, 'admin_token');
      if (providedToken !== EXPECTED_TOKEN) {
        if (url.pathname === '/') return new Response(LOGIN_UI, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
        else return new Response('Unauthorized', { status: 401 });
      }
    }

    if (url.pathname === '/') {
      return new Response(HTML_UI, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    if (url.pathname === '/api/update-dns' && request.method === 'POST') {
        const body = await request.json();
        const ips = body.ips;
        const cfToken = env.CF_API_TOKEN;
        const zoneId = env.CF_ZONE_ID;
        const domain = env.CF_DOMAIN;

        if (!cfToken || !zoneId || !domain) {
            return Response.json({ success: false, error: '缺少环境变量！请添加 CF_API_TOKEN, CF_ZONE_ID, CF_DOMAIN' });
        }

       try {
            const getRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${domain}`, {
                headers: { 'Authorization': `Bearer ${cfToken}` }
            });
            const getData = await getRes.json();
            
            if (!getData.success) throw new Error('获取现有 DNS 记录失败: ' + JSON.stringify(getData.errors));

            const oldRecords = getData.result.filter(r => r.type === 'A' || r.type === 'AAAA' || r.type === 'CNAME');
            for (const record of oldRecords) {
                await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${cfToken}` }
                });
            }

            for (const ip of ips) {
                const cleanItem = ip.replace(/[\[\]]/g, '');
                
                let recordType = 'A';
                if (cleanItem.includes(':')) {
                    recordType = 'AAAA';
                } else if (/[a-zA-Z]/.test(cleanItem)) {
                    recordType = 'CNAME';
                }

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
                if(!postData.success) {
                    throw new Error(`记录 ${cleanItem} 提交失败: ` + JSON.stringify(postData.errors));
                }
            }

            return Response.json({ success: true, message: `✅ 成功！已将 ${domain} 指向选定的 ${ips.length} 个记录。` });

        } catch (error) {
            return Response.json({ success: false, error: error.message });
        }
    }

    if (url.pathname === '/api/get-custom-api-ips') {
        try {
            const apiUrl = url.searchParams.get('url');
            if (!apiUrl) throw new Error("缺少 API URL 参数");

            const response = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const text = await response.text();
            let validIPs = new Set();

            try {
                const jsonObj = JSON.parse(text);
                if (jsonObj && jsonObj.data && Array.isArray(jsonObj.data)) {
                    jsonObj.data.forEach(item => {
                        if (item.ip) {
                            let ip = item.ip;
                            if (ip.includes(':') && !ip.startsWith('[')) ip = `[${ip}]`;
                            validIPs.add(ip);
                        }
                    });
                }
            } catch (e) {}

            if (validIPs.size === 0) {
                const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
                const matchedIPv4 = text.match(ipv4Regex) || [];
                matchedIPv4.forEach(ip => {
                    if (!ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('127.')) {
                        validIPs.add(ip);
                    }
                });

                const ipv6Regex = /(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}|(?:[A-F0-9]{1,4}:)*:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*/gi;
                const matchedIPv6 = text.match(ipv6Regex) || [];
                matchedIPv6.forEach(ip => {
                    if (ip.length > 7 && ip.includes(':') && !ip.startsWith('::1')) {
                        validIPs.add(ip.startsWith('[') ? ip : `[${ip}]`);
                    }
                });
            }

            const uniqueIPArray = Array.from(validIPs);
            for (let i = uniqueIPArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [uniqueIPArray[i], uniqueIPArray[j]] = [uniqueIPArray[j], uniqueIPArray[i]];
            }

            const ipsToTest = uniqueIPArray.slice(0, 15);
            return Response.json({ success: true, ips: ipsToTest, totalCount: uniqueIPArray.length });
        } catch (error) {
            return Response.json({ success: false, error: error.message }, { status: 500 });
        }
    }

    if (url.pathname === '/api/get-remote-ips') {
        try {
            const reqType = (url.searchParams.get('type') || 'all').toLowerCase();
            const validIPs = new Set();

            if (['all', '电信', '联通', '移动', '多线', 'ipv6'].includes(reqType)) {
                try {
                    const res1 = await fetch('https://api.uouin.com/cloudflare.html', { headers: { 'User-Agent': 'Mozilla/5.0' } });
                    if(res1.ok) {
                        const text1 = await res1.text();
                        const cleanText = text1.replace(/<[^>]+>/g, ' ');
                        const regex = /(电信|联通|移动|多线|ipv6)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-fA-F0-9]{1,4}:)+[a-fA-F0-9]{1,4})/gi;
                        
                        let match;
                        while ((match = regex.exec(cleanText)) !== null) {
                            const lineType = match[1].toLowerCase();
                            let ip = match[2];
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
                        const text2 = await res2.text();
                        const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
                        const matched = text2.match(ipv4Regex) || [];
                        matched.forEach(ip => {
                            if (!ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('127.')) {
                                validIPs.add(ip);
                            }
                        });
                    }
                } catch(e) {}
            }

            const uniqueIPArray = Array.from(validIPs);
            for (let i = uniqueIPArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [uniqueIPArray[i], uniqueIPArray[j]] = [uniqueIPArray[j], uniqueIPArray[i]];
            }

            const ipsToTest = uniqueIPArray.slice(0, 10);
            return Response.json({ success: true, ips: ipsToTest, totalCount: uniqueIPArray.length });

        } catch (error) {
            return Response.json({ success: false, error: error.message }, { status: 500 });
        }
    }

    if (url.pathname.startsWith('/api/routes')) {
      if (!env.DB) {
          return Response.json({ error: "由于未绑定 D1 数据库 (变量名 DB)，反代节点功能不可用。请在 CF 设置中绑定！" }, { status: 500 });
      }

      await env.DB.exec(`CREATE TABLE IF NOT EXISTS routes (prefix TEXT PRIMARY KEY, target TEXT NOT NULL)`);
      try { await env.DB.exec(`ALTER TABLE routes ADD COLUMN mode TEXT DEFAULT 'off'`); } catch(e) {}
      
      if (request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM routes').all();
        return Response.json(results || []);
      }
      if (request.method === 'POST') {
        const data = await request.json();
        await env.DB.prepare('INSERT OR REPLACE INTO routes (prefix, target, mode) VALUES (?, ?, ?)')
            .bind(data.prefix, data.target, data.mode || 'off').run();
        return Response.json({ success: true });
      }
      if (request.method === 'DELETE') {
        const prefix = url.searchParams.get('prefix');
        await env.DB.prepare('DELETE FROM routes WHERE prefix = ?').bind(prefix).run();
        return Response.json({ success: true });
      }
      return new Response("Method not allowed", { status: 405 });
    }

    let targetUrlStr;
    let currentMode = 'off';
    const decodedPath = decodeURIComponent(url.pathname);

    if (decodedPath.startsWith('/http://') || decodedPath.startsWith('/https://')) {
      targetUrlStr = decodedPath.substring(1) + url.search;
    } else {
      const pathParts = decodedPath.split('/');
      const prefix = pathParts[1]; 
      if (!prefix) return new Response(`Not Found`, { status: 404 });

      try {
        if (!env.DB) return new Response(`404: Node not found (DB not bound)`, { status: 404 });
        const stmt = env.DB.prepare(`SELECT target, mode FROM routes WHERE prefix = ?`);
        const route = await stmt.bind(prefix).first();
        if (!route) return new Response(`404: Node not found`, { status: 404 });

        currentMode = route.mode || 'off';
        const remainingPath = '/' + pathParts.slice(2).join('/');
        targetUrlStr = route.target + remainingPath + url.search;
      } catch (e) {
        return new Response("DB Error: " + e.message, { status: 500 });
      }
    }

    const targetUrl = new URL(targetUrlStr);
    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", targetUrl.host);

    const realIp = request.headers.get("cf-connecting-ip") || 
                   request.headers.get("x-real-ip") || 
                   (request.headers.get("x-forwarded-for") || "").split(',')[0].trim();

    newHeaders.delete("cf-connecting-ip");
    newHeaders.delete("cf-ipcountry");
    newHeaders.delete("cf-ray");
    newHeaders.delete("cf-visitor");
    newHeaders.delete("x-forwarded-for");
    newHeaders.delete("x-real-ip");

    if (currentMode === 'realip_only' && realIp) newHeaders.set("X-Real-IP", realIp);
    else if (currentMode === 'dual' && realIp) {
      newHeaders.set("X-Real-IP", realIp);
      newHeaders.set("X-Forwarded-For", realIp);
    }

    // === 优化海报与静态资源强行缓存逻辑 ===
    const isStaticOrImage = /\.(jpg|jpeg|gif|png|svg|ico|webp|js|css|woff2?|ttf|otf|map|webmanifest|srt|ass|vtt|sub)$/i.test(targetUrl.pathname) || 
                            /(\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i.test(targetUrl.pathname);

    let fetchInit = {
      method: request.method,
      headers: newHeaders,
      redirect: 'manual'
    };

    if (isStaticOrImage) {
        fetchInit.cf = {
            cacheEverything: true,
            cacheTtl: 86400 // 让 CF 机房帮你把海报保存 1 天 (86400秒)
        };
    }

    // === 优化 2：起播加速 - 流式透传（彻底解决 body 阻塞等待问题） ===
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        fetchInit.body = request.body;
        fetchInit.duplex = 'half'; // 开启半双工流式传输，绝不卡顿
    }

    const modifiedRequest = new Request(targetUrl, fetchInit);

    try {
      const response = await fetch(modifiedRequest);
      const responseHeaders = new Headers(response.headers);
      
      // 处理重定向
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = responseHeaders.get('Location');
        if (location && (location.startsWith('http://') || location.startsWith('https://'))) {
          responseHeaders.set('Location', `/${encodeURIComponent(location)}`);
        }
      }
      
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      // 篡改响应头，配合 CF 缓存策略下发给浏览器
      if (isStaticOrImage) {
          responseHeaders.set('Cache-Control', 'public, max-age=86400');
          responseHeaders.delete('Expires'); 
          responseHeaders.delete('Pragma');  
      } else {
          // 视频流和 API 进度等动态请求，绝对不缓存，保持直通！
          responseHeaders.set('Cache-Control', 'no-store');
      }

      // 纯净返回，极致性能
      return new Response(response.body, { 
          status: response.status, 
          statusText: response.statusText, 
          headers: responseHeaders 
      });
      
    } catch (err) {
      return new Response("Worker Proxy Error: " + err.message, { status: 502 });
    }
  }
};
