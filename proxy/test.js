const mapCfg = {

  paths: {

   "/ok": "https://link01.okemby.org:8443",

   "/ic": "https://embygy.ichinosekotomi.com:443",

   "/ck": "https://emby.nas.edu.kg:443"

  },

  main: "https://fd.xna.dpdns.org:443",

  cors: true

 };

// 国家代码到中文名称的映射
const countryNames = {
  'CN': '中国',
  'US': '美国',
  'JP': '日本',
  'HK': '香港',
  'TW': '台湾',
  'SG': '新加坡',
  'KR': '韩国',
  'DE': '德国',
  'GB': '英国',
  'CA': '加拿大',
  'AU': '澳大利亚',
  'RU': '俄罗斯',
  'IN': '印度',
  'FR': '法国',
  'IT': '意大利',
  'ES': '西班牙',
  'BR': '巴西',
  'TH': '泰国',
  'MY': '马来西亚',
  'ID': '印度尼西亚',
  'PH': '菲律宾',
  'VN': '越南',
  'MM': '缅甸',
  'KH': '柬埔寨',
  'LA': '老挝',
  'BD': '孟加拉国',
  'NP': '尼泊尔',
  'PK': '巴基斯坦',
  'AF': '阿富汗',
  'IR': '伊朗',
  'IQ': '伊拉克',
  'SA': '沙特阿拉伯',
  'AE': '阿拉伯联合酋长国',
  'TR': '土耳其',
  'IL': '以色列',
  'EG': '埃及',
  'ZA': '南非',
  'NG': '尼日利亚',
  'KE': '肯尼亚',
  'ET': '埃塞俄比亚',
  'MA': '摩洛哥',
  'DZ': '阿尔及利亚',
  'TN': '突尼斯',
  'LY': '利比亚',
  'SD': '苏丹',
  'SO': '索马里',
  'YE': '也门',
  'OM': '阿曼',
  'QA': '卡塔尔',
  'KW': '科威特',
  'BH': '巴林',
  'JO': '约旦',
  'LB': '黎巴嫩',
  'SY': '叙利亚',
  'PS': '巴勒斯坦',
  'CY': '塞浦路斯'
};

// 国家代码转换函数
function getCountryName(code) {
  return countryNames[code] || code;
}

// 从CF-Ray头部提取节点代码
function getCFNodeFromRay(cfRay) {
  if (!cfRay || cfRay === '未知') return '未知';
  const parts = cfRay.split('-');
  return parts.length > 1 ? parts[1] : '未知';
}

export default {
  async fetch(req, env, ctx) {
    // 检查是否为中国大陆IP
    const country = req.headers.get('cf-ipcountry') || '未知';
    const isChina = country === 'CN';
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '未知';
    const cfRay = req.headers.get('cf-ray') || '未知';
    const cfNode = getCFNodeFromRay(cfRay);
    
    // 如果不是中国大陆IP，显示自定义页面
    if (!isChina) {
      // 获取国家中文名称
      const countryName = getCountryName(country);
      const displayCountry = country === '未知' ? '未知' : `${countryName} (${country})`;
      
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>访问受限 - emos.255432.xyz</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            border-left: 5px solid #f44336;
        }
        h1 {
            color: #f44336;
            margin-top: 0;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        h1::before {
            content: "🚫";
        }
        .info-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 20px;
            margin: 25px 0;
        }
        .info-item {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            width: 120px;
            flex-shrink: 0;
        }
        .info-value {
            color: #222;
            font-family: 'Consolas', 'Monaco', monospace;
            word-break: break-all;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 25px 0;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .warning::before {
            content: "⚠️";
            font-size: 1.2em;
        }
        .solution {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 20px;
            border-radius: 5px;
            margin: 25px 0;
        }
        .proxy-info {
            background-color: #e6f7ff;
            border: 1px solid #91d5ff;
            color: #0050b3;
            padding: 20px;
            border-radius: 5px;
            margin: 25px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .copy-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 10px;
        }
        .copy-btn:hover {
            background-color: #0056b3;
        }
        .success-message {
            color: #28a745;
            font-size: 12px;
            margin-left: 10px;
            display: none;
        }
        ol, ul {
            padding-left: 20px;
        }
        li {
            margin: 8px 0;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        code {
            background-color: #f1f1f1;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', monospace;
            font-size: 14px;
        }
        pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>访问受限</h1>
        
        <div class="warning">
            <div>
                <strong>注意：</strong>当前服务器仅允许中国大陆地区直连访问，检测到您的网络环境不符合访问条件。
            </div>
        </div>
        
        <div class="info-box">
            <h3>📊 您的连接信息：</h3>
            <div class="info-item">
                <span class="info-label">IP地址：</span>
                <span class="info-value" id="ip-address">${ip}</span>
                <button class="copy-btn" onclick="copyToClipboard('${ip}')">复制</button>
                <span class="success-message" id="ip-copied">已复制</span>
            </div>
            <div class="info-item">
                <span class="info-label">地区：</span>
                <span class="info-value">${displayCountry}</span>
            </div>
            <div class="info-item">
                <span class="info-label">CF节点：</span>
                <span class="info-value">${cfNode}</span>
            </div>
            <div class="info-item">
                <span class="info-label">代理状态：</span>
                <span class="info-value">liuerao</span>
            </div>
        </div>
        
        <div class="solution">
            <h3>✅ 解决方案：</h3>
            <p>请按照以下步骤操作后重试：</p>
            <ol>
                <li>关闭代理/VPN软件（如果正在使用）</li>
                <li>将域名 <strong id="domain-name">emos.255432.xyz</strong> 添加到您的直连规则中
                    <button class="copy-btn" onclick="copyToClipboard('emos.255432.xyz')">复制</button>
                    <span class="success-message" id="domain-copied">已复制</span>
                </li>
                <li>清空浏览器缓存后重新访问</li>
            </ol>
        </div>
        
        <div class="proxy-info">
            <h3>🌐 通用反代服务：</h3>
            <p>我们还提供通用反代服务：</p>
            <ul>
                <li><strong>通用反代地址：</strong> proxy.255432.xyz</li>
            </ul>
            <p><strong>使用说明：</strong></p>
            <ol>
                <li>通用反代支持代理任意网站</li>
                <li>使用方法：访问 <code>https://proxy.255432.xyz/?url=目标网址</code></li>
                <li>例如：<code>https://proxy.255432.xyz/?url=https://example.com</code></li>
                <li>支持GET和POST请求</li>
                <li>同样仅限中国大陆用户使用</li>
            </ol>
            <p><strong>API接口示例：</strong></p>
            <pre>// JavaScript Fetch API 示例
fetch('https://proxy.255432.xyz/?url=https://api.example.com/data', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log(data));</pre>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} emos.255432.xyz | 仅限中国大陆用户访问</p>
        </div>
    </div>
    
    <script>
        // 复制文本到剪贴板
        function copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            // 显示成功消息
            let messageId = '';
            if (text.includes('255432')) messageId = 'domain-copied';
            else if (text.includes(':')) messageId = 'ip-copied';
            
            const successMessage = document.getElementById(messageId);
            if (successMessage) {
                successMessage.style.display = 'inline';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 2000);
            }
        }
        
        // 自动复制域名到剪贴板
        document.addEventListener('DOMContentLoaded', function() {
            // 可选：自动复制域名到剪贴板
            // copyToClipboard('emos.255432.xyz');
        });
    </script>
</body>
</html>`;
      
      return new Response(html, {
        status: 403,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
    
    // 如果是中国大陆IP，继续原始的反向代理逻辑
    const u = new URL(req.url);
    const t = new URL(mapCfg.cors);
    u.protocol = t.protocol;
    u.hostname = t.hostname;
    u.port = t.port;
    
    const h = new Headers(req.headers);
    h.set('Host', t.hostname);
    if (h.has('Referer')) h.set('Referer', target);
    if (h.has('Origin')) h.set('Origin', target);
    
    const r = new Request(u.toString(), {
      method: req.method,
      headers: h,
      body: req.body,
      redirect: 'follow'
    });
    
    try {
      const res = await fetch(r);
      const rh = new Headers(res.headers);
      if (mapCfg.cors) {
        rh.set('Access-Control-Allow-Origin', '*');
        rh.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        rh.set('Access-Control-Allow-Headers', '*');
      }
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: rh
      });
    } catch (err) {
      return new Response(`服务暂时不可用：${err.message}`, { status: 502 });
    }
  }
};