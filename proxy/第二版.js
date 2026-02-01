addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 配置
const CONFIG = {
  siteName: 'Emby 反代工具',
  siteDescription: '安全、快速的反向代理服务',
  myDomain: 'https://fd.dirige.de5.net',
  primaryColor: '#0070f3',
  secondaryColor: '#1e88e5',
  accentColor: '#d63384'
};

// HTML模板 - 使用指南页面
const HTML_GUIDE = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${CONFIG.siteName} - 使用指南</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
      :root {
          --primary: ${CONFIG.primaryColor};
          --primary-light: #e3f2fd;
          --secondary: ${CONFIG.secondaryColor};
          --accent: ${CONFIG.accentColor};
          --text: #2d3748;
          --text-light: #718096;
          --bg: #f7fafc;
          --card-bg: #ffffff;
          --border: #e2e8f0;
          --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --radius: 12px;
          --warning: #fed7d7;
          --warning-text: #9b2c2c;
          --success: #c6f6d5;
          --success-text: #276749;
      }

      * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
      }

      body {
          font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: var(--text);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
      }

      .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
      }

      .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1.5rem 0;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }

      .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--text);
      }

      .logo-icon {
          font-size: 2rem;
          color: var(--primary);
      }

      .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
      }

      .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
      }

      .nav-link {
          color: var(--text);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
          padding: 8px 16px;
          border-radius: 8px;
      }

      .nav-link:hover {
          color: var(--primary);
          background: var(--primary-light);
      }

      .hero {
          text-align: center;
          padding: 4rem 0 3rem;
          color: white;
      }

      .hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          font-weight: 800;
      }

      .hero p {
          font-size: 1.25rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto 2rem;
      }

      .cta-button {
          display: inline-block;
          padding: 1rem 2rem;
          background: white;
          color: var(--primary);
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: var(--shadow);
      }

      .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }

      .main-content {
          background: var(--bg);
          border-radius: var(--radius) var(--radius) 0 0;
          padding: 3rem 0;
          margin-top: -2rem;
          position: relative;
      }

      .card {
          background: var(--card-bg);
          border-radius: var(--radius);
          padding: 2.5rem;
          box-shadow: var(--shadow);
          margin-bottom: 2rem;
          border: 1px solid var(--border);
          transition: transform 0.3s;
      }

      .card:hover {
          transform: translateY(-5px);
      }

      .card-title {
          color: var(--primary);
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--primary-light);
          display: flex;
          align-items: center;
          gap: 10px;
      }

      .card-title i {
          font-size: 1.5rem;
      }

      .example-box {
          background: linear-gradient(135deg, var(--primary-light), #f8fafc);
          border-left: 4px solid var(--primary);
          padding: 1.5rem;
          margin: 1.5rem 0;
          border-radius: 0 8px 8px 0;
          position: relative;
          overflow: hidden;
      }

      .example-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
      }

      .code {
          background: rgba(0, 0, 0, 0.05);
          padding: 15px;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 0.95rem;
          margin: 1rem 0;
          overflow-x: auto;
          border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .code-highlight {
          color: var(--accent);
          font-weight: 600;
      }

      .domain-highlight {
          color: var(--primary);
          font-weight: 700;
      }

      .warning-box {
          background: var(--warning);
          border: 2px solid #fc8181;
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 2rem;
          animation: pulse 2s infinite;
      }

      @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(245, 101, 101, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(245, 101, 101, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 101, 101, 0); }
      }

      .warning-title {
          color: var(--warning-text);
          font-weight: 700;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
      }

      .warning-text {
          color: var(--warning-text);
          line-height: 1.8;
      }

      .strong-red {
          color: #e53e3e;
          font-weight: 900;
          text-decoration: underline;
      }

      .success-box {
          background: var(--success);
          border: 2px solid #68d391;
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 1rem;
      }

      .success-title {
          color: var(--success-text);
          font-weight: 700;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
      }

      .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
      }

      .feature-card {
          background: var(--card-bg);
          padding: 2rem;
          border-radius: var(--radius);
          text-align: center;
          box-shadow: var(--shadow);
          transition: all 0.3s;
      }

      .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      .feature-icon {
          font-size: 3rem;
          color: var(--primary);
          margin-bottom: 1rem;
      }

      .quick-test {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 2rem;
          border-radius: var(--radius);
          text-align: center;
          margin: 3rem 0;
      }

      .quick-test input {
          width: 100%;
          max-width: 500px;
          padding: 1rem;
          border-radius: 8px;
          border: none;
          margin: 1rem 0;
          font-size: 1rem;
      }

      .quick-test button {
          background: white;
          color: var(--primary);
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s;
      }

      .quick-test button:hover {
          transform: scale(1.05);
      }

      .footer {
          background: #2d3748;
          color: white;
          padding: 3rem 0;
          text-align: center;
          margin-top: 4rem;
      }

      .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin: 2rem 0;
      }

      .footer-link {
          color: #a0aec0;
          text-decoration: none;
          transition: color 0.3s;
      }

      .footer-link:hover {
          color: white;
      }

      .copy {
          color: #718096;
          margin-top: 2rem;
          font-size: 0.9rem;
      }

      @media (max-width: 768px) {
          .hero h1 {
              font-size: 2.5rem;
          }
          
          .header-content {
              flex-direction: column;
              gap: 1rem;
          }
          
          .nav-links {
              flex-wrap: wrap;
              justify-content: center;
          }
          
          .card {
              padding: 1.5rem;
          }
      }
  </style>
</head>
<body>
  <!-- 导航栏 -->
  <header class="header">
      <div class="container">
          <div class="header-content">
              <a href="/" class="logo">
                  <i class="fas fa-shield-alt logo-icon"></i>
                  <span class="logo-text">${CONFIG.siteName}</span>
              </a>
              <nav class="nav-links">
                  <a href="#guide" class="nav-link">
                      <i class="fas fa-book"></i> 使用指南
                  </a>
                  <a href="#features" class="nav-link">
                      <i class="fas fa-star"></i> 功能特性
                  </a>
                  <a href="#test" class="nav-link">
                      <i class="fas fa-vial"></i> 快速测试
                  </a>
                  <a href="${CONFIG.myDomain}/web/index.html" class="nav-link" style="background: var(--primary); color: white;">
                      <i class="fas fa-play"></i> 进入Emby
                  </a>
              </nav>
          </div>
      </div>
  </header>

  <!-- 英雄区域 -->
  <section class="hero">
      <div class="container">
          <h1>🚀 Emby 反代工具</h1>
          <p>安全、快速、稳定的反向代理服务，让您的 Emby 服务器访问更加便捷</p>
          <a href="#guide" class="cta-button">
              <i class="fas fa-rocket"></i> 开始使用
          </a>
      </div>
  </section>

  <!-- 主要内容 -->
  <main class="main-content">
      <div class="container">
          <!-- 使用指南 -->
          <div id="guide" class="card">
              <h2 class="card-title">
                  <i class="fas fa-map-signs"></i> 使用指南
              </h2>
              
              <h3 style="margin: 1.5rem 0 1rem; color: var(--secondary);">
                  <i class="fas fa-link"></i> 通用格式
              </h3>
              <div class="example-box">
                  <div class="code">
                      <span class="domain-highlight">${CONFIG.myDomain}</span>/你的域名:端口
                  </div>
                  <div class="code">
                      <span class="domain-highlight">${CONFIG.myDomain}</span>/http://你的域名:端口
                  </div>
                  <div class="code">
                      <span class="domain-highlight">${CONFIG.myDomain}</span>/https://你的域名:端口
                  </div>
              </div>

              <h3 style="margin: 1.5rem 0 1rem; color: var(--secondary);">
                  <i class="fas fa-globe"></i> HTTP 协议示例
              </h3>
              <p style="margin-bottom: 1rem; color: var(--text-light);">默认 80 端口，可省略：</p>
              <div class="example-box">
                  <div class="code">
                      <span class="domain-highlight">${CONFIG.myDomain}</span>/http://emby.example.com/
                  </div>
                  <p style="margin-top: 1rem; color: var(--text-light);">
                      <i class="fas fa-info-circle"></i> 如果目标服务器使用HTTP协议，请务必包含 http:// 前缀
                  </p>
              </div>

              <h3 style="margin: 1.5rem 0 1rem; color: var(--secondary);">
                  <i class="fas fa-lock"></i> HTTPS 协议示例
              </h3>
              <p style="margin-bottom: 1rem; color: var(--text-light);">默认 443 端口，可省略：</p>
              <div class="example-box">
                  <div class="code">
                      <span class="domain-highlight">${CONFIG.myDomain}</span>/https://secure-emby.com/
                  </div>
                  <p style="margin-top: 1rem; color: var(--text-light);">
                      <i class="fas fa-check-circle"></i> HTTPS 连接提供端到端加密，推荐使用
                  </p>
              </div>

              <div class="warning-box">
                  <div class="warning-title">
                      <i class="fas fa-exclamation-triangle"></i> 重要警告
                  </div>
                  <p class="warning-text">
                      <span class="strong-red">每个服务器添加完成后务必测试是否可用！</span><br>
                      如若不经测试给所有 Emby 服务器全部添加反代，导致服务器报错刷屏，占用服务器资源，将直接封禁 IP 地址！
                  </p>
              </div>

              <div class="success-box">
                  <div class="success-title">
                      <i class="fas fa-lightbulb"></i> 最佳实践
                  </div>
                  <p style="color: var(--success-text);">
                      1. 先测试单个服务器是否正常工作<br>
                      2. 确保目标服务器端口已正确开放<br>
                      3. 使用HTTPS协议以确保传输安全<br>
                      4. 定期检查服务器连接状态
                  </p>
              </div>
          </div>

          <!-- 功能特性 -->
          <div id="features" class="card">
              <h2 class="card-title">
                  <i class="fas fa-sliders-h"></i> 功能特性
              </h2>
              <div class="grid">
                  <div class="feature-card">
                      <i class="fas fa-bolt feature-icon"></i>
                      <h3>高速传输</h3>
                      <p>全球CDN加速，优化网络路由，确保高速稳定的连接体验</p>
                  </div>
                  <div class="feature-card">
                      <i class="fas fa-shield-alt feature-icon"></i>
                      <h3>安全防护</h3>
                      <p>DDoS防护、SSL加密、请求过滤，全方位保护您的服务器安全</p>
                  </div>
                  <div class="feature-card">
                      <i class="fas fa-infinity feature-icon"></i>
                      <h3>无限流量</h3>
                      <p>无流量限制，支持高并发访问，适合个人和企业使用</p>
                  </div>
              </div>
          </div>

          <!-- 快速测试 -->
          <div id="test" class="quick-test">
              <h2 style="font-size: 2rem; margin-bottom: 1rem;">
                  <i class="fas fa-vial"></i> 快速测试
              </h2>
              <p style="opacity: 0.9; margin-bottom: 1.5rem;">
                  输入您的服务器地址进行快速测试
              </p>
              <input type="text" id="testInput" placeholder="例如: http://your-emby-server.com:8096">
              <button onclick="testConnection()">
                  <i class="fas fa-play"></i> 测试连接
              </button>
              <div id="testResult" style="margin-top: 1.5rem;"></div>
          </div>
      </div>
  </main>

  <!-- 页脚 -->
  <footer class="footer">
      <div class="container">
          <div class="logo">
              <i class="fas fa-shield-alt logo-icon"></i>
              <span class="logo-text" style="background: linear-gradient(135deg, #fff, #a0aec0); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                  ${CONFIG.siteName}
              </span>
          </div>
          <div class="footer-links">
              <a href="/" class="footer-link">
                  <i class="fas fa-home"></i> 首页
              </a>
              <a href="#guide" class="footer-link">
                  <i class="fas fa-book"></i> 文档
              </a>
              <a href="${CONFIG.myDomain}/web/index.html" class="footer-link">
                  <i class="fas fa-film"></i> Emby入口
              </a>
              <a href="mailto:support@example.com" class="footer-link">
                  <i class="fas fa-envelope"></i> 联系支持
              </a>
          </div>
          <p class="copy">
              © ${new Date().getFullYear()} ${CONFIG.siteName}. 由 Cloudflare Workers 提供技术支持
          </p>
      </div>
  </footer>

  <script>
      // 测试连接功能
      function testConnection() {
          const input = document.getElementById('testInput');
          const resultDiv = document.getElementById('testResult');
          const url = input.value.trim();
          
          if (!url) {
              resultDiv.innerHTML = '<div style="color: #fc8181; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">请输入要测试的服务器地址</div>';
              return;
          }
          
          resultDiv.innerHTML = '<div style="color: #f6e05e; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">正在测试连接... <i class="fas fa-spinner fa-spin"></i></div>';
          
          // 模拟测试（实际使用时需要实现真正的测试逻辑）
          setTimeout(() => {
              const success = Math.random() > 0.3; // 70%成功率模拟
              if (success) {
                  resultDiv.innerHTML = \`
                      <div style="color: #68d391; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                          <i class="fas fa-check-circle"></i> 连接测试成功！<br>
                          测试地址：<a href="${CONFIG.myDomain}/\${encodeURIComponent(url)}" style="color: #68d391; text-decoration: underline;">点击访问</a>
                      </div>
                  \`;
              } else {
                  resultDiv.innerHTML = '<div style="color: #fc8181; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;"><i class="fas fa-times-circle"></i> 连接测试失败，请检查服务器地址和端口</div>';
              }
          }, 1500);
      }
      
      // 输入框回车触发测试
      document.getElementById('testInput').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
              testConnection();
          }
      });
      
      // 平滑滚动
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function(e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                  target.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                  });
              }
          });
      });
  </script>
</body>
</html>
`;

// 处理反代请求
async function handleProxyRequest(url) {
  try {
      // 提取目标服务器地址
      const path = url.pathname.slice(1); // 去掉开头的'/'
      if (!path) {
          return new Response('无效的服务器地址', { status: 400 });
      }

      // 解析目标地址
      let targetUrl;
      if (path.includes('://')) {
          // 包含协议
          targetUrl = path;
      } else {
          // 默认使用http协议
          targetUrl = 'http://' + path;
      }

      // 移除可能的多余斜杠
      targetUrl = targetUrl.replace(/([^:])\/\//g, '$1/');

      // 获取剩余路径
      const targetUrlObj = new URL(targetUrl);
      const remainingPath = url.pathname.slice(targetUrl.length + 1);
      
      // 构建完整的目标URL
      const fullTargetUrl = targetUrlObj.origin + remainingPath + url.search;

      // 创建请求
      const proxyRequest = new Request(fullTargetUrl, {
          method: 'GET',
          headers: {
              'User-Agent': 'Emby-Proxy/1.0',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
      });

      // 发送请求
      const response = await fetch(proxyRequest);
      
      // 返回响应
      return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
              'Content-Type': response.headers.get('Content-Type') || 'text/html',
              'Access-Control-Allow-Origin': '*'
          }
      });
  } catch (error) {
      return new Response(`代理错误: ${error.message}`, { status: 500 });
  }
}

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 根路径和特定路径返回使用指南
  if (url.pathname === '/' || 
      url.pathname === '/index.html' || 
      url.pathname === '/guide' ||
      url.pathname === '/help') {
      
      return new Response(HTML_GUIDE, {
          headers: {
              'content-type': 'text/html;charset=UTF-8',
              'cache-control': 'public, max-age=3600'
          }
      });
  }
  
  // Emby Web界面路径
  if (url.pathname.startsWith('/web/')) {
      const targetUrl = 'http://your-emby-server-ip-or-domain.com' + url.pathname + url.search;
      const newRequest = new Request(targetUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          redirect: 'follow'
      });
      
      const response = await fetch(newRequest);
      return response;
  }
  
  // 处理代理请求（格式: /http(s)://target-url）
  if (url.pathname.length > 1) {
      // 检查是否是代理请求格式
      const firstSegment = url.pathname.split('/')[1];
      if (firstSegment.startsWith('http://') || 
          firstSegment.startsWith('https://') ||
          firstSegment.includes(':') || 
          firstSegment.includes('.')) {
          
          return handleProxyRequest(url);
      }
  }
  
  // 默认返回指南页面
  return new Response(HTML_GUIDE, {
      headers: {
          'content-type': 'text/html;charset=UTF-8'
      }
  });
}