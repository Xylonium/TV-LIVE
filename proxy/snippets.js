export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    
    // 如果是根路径，返回输入框页面
    if (pathParts.length === 0) {
      // 极简输入框页面
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hello World</title>
</head>
<body>
<h1 style="
  margin: 0 0 20px 0;
  text-align: center;
  display: block;
  padding: 10px 0;
">看啥看？想刷流量随便刷，snippets看看你能不能刷爆。🤣👉🤡</h1>

</body>
</html>`;
      
      return new Response(html, {
        status: 200,
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    // 代理逻辑（从你的代码优化）
    const targetDomain = pathParts[0];
    
    // 安全验证：防止回路代理
    const currentHost = request.headers.get('Host') || '';
    if (targetDomain.includes(currentHost) || targetDomain === currentHost) {
      return new Response('Error: Loop proxy not allowed', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // 域名格式验证
    if (!targetDomain.match(/^[a-zA-Z0-9][a-zA-Z0-9\\-\\.:]{0,253}[a-zA-Z0-9]$/)) {
      return new Response('Error: Invalid target domain format', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // 构建目标 URL
    const remainingPath = url.pathname.replace(`/${targetDomain}`, '') || '/';
    const targetUrl = `https://${targetDomain}${remainingPath}${url.search}`;
    
    // 准备请求头
    const headers = new Headers(request.headers);
    headers.set('Host', targetDomain);
    
    // 移除 Cloudflare 内部头
    const removeHeaders = [
      'CF-Connecting-IP', 'CF-IPCountry', 'CF-Ray', 'CF-Worker', 'CF-Visitor'
    ];
    removeHeaders.forEach(h => headers.delete(h));
    
    // 添加代理标识
    headers.set('X-Proxy-By', 'Cloudflare-Snippets');
    
    try {
      // 处理 WebSocket
      if (request.headers.get('Upgrade') === 'websocket') {
        return fetch(targetUrl, {
          method: request.method,
          headers: headers,
          body: request.body
        });
      }
      
      // 处理 CORS 预检
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK, UNLOCK',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400'
          }
        });
      }
      
      // 执行代理
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'follow',
        signal: AbortSignal.timeout(60000)
      });
      
      // 处理响应头
      const responseHeaders = new Headers(response.headers);
      
      // CORS 头
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
      
      // 范围请求支持
      ['Accept-Ranges', 'Content-Range', 'Content-Length'].forEach(h => {
        if (response.headers.has(h)) {
          responseHeaders.set(h, response.headers.get(h));
        }
      });
      
      // 内容类型
      if (response.headers.has('Content-Type')) {
        responseHeaders.set('Content-Type', response.headers.get('Content-Type'));
      }
      
      // 缓存头
      ['ETag', 'Last-Modified'].forEach(h => {
        if (response.headers.has(h)) {
          responseHeaders.set(h, response.headers.get(h));
        }
      });
      
      // 重定向处理
      if (response.headers.has('Location')) {
        const location = response.headers.get('Location');
        if (location.startsWith('/')) {
          responseHeaders.set('Location', `/${targetDomain}${location}`);
        } else if (location.startsWith('https://') || location.startsWith('http://')) {
          responseHeaders.set('Location', location);
        }
      }
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
      
    } catch (error) {
      const errorResponse = {
        error: 'Proxy Error',
        message: error.message,
        target: targetUrl,
        timestamp: new Date().toISOString(),
        type: error.name
      };
      
      if (error.name === 'AbortError') {
        errorResponse.message = 'Request timeout (60s)';
      }
      
      return new Response(JSON.stringify(errorResponse, null, 2), {
        status: 502,
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
}