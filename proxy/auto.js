/**
 * =================================================================================
 *              Cloudflare Worker 通用 Emby 反向代理脚本 (类型安全优化版)
 * =================================================================================
 *
 * 作者: Gemini (根据用户反馈优化)
 * 版本: 2.2 (修复真实 IP 传递问题)
 *
 * --- 功能配置 ---
 */

// 【配置项 1】禁用服务的国家/地区代码 (ISO 3166-1 Alpha-2 standard)
// 例如: ['CN', 'KP', 'IR', 'CU', 'SY']
const BLOCKED_REGIONS = [];

// 【配置项 2】手动重定向域名列表
// 当 Emby 服务器返回的重定向地址域名在此列表中时，Worker 将直接将 302/307 响应透传给客户端，
// 而不是由 Worker 内部跟随跳转。这对于需要客户端直接与特定节点通信的场景很有用。
const MANUAL_REDIRECT_DOMAINS = [
    'ap-cn01.emby.bangumi.ca',
    'ap-cn02.emby.bangumi.ca',
    'ap-cn03.emby.bangumi.ca'
];

// 使用 ES 模块语法导出 Worker 对象，这是 Cloudflare 推荐的现代写法
export default {
  /**
   * Worker 的入口点，处理所有传入的 fetch 事件（即 HTTP/HTTPS 请求）
   * @param {Request} request - 客户端发来的原始请求对象
   * @param {object} env - Worker 的环境变量 (此脚本未使用)
   * @param {object} ctx - 请求的执行上下文
   * @returns {Promise<Response>} - 返回给客户端的响应
   */
  async fetch(request, env, ctx) {
    const workerUrl = new URL(request.url);

    // --- 1. 根路径处理 ---
    // 访问 Worker 的根路径时，返回一个包含客户端信息的简单页面
  if (workerUrl.pathname === '/') {
    const clientIp = request.headers.get('cf-connecting-ip') || '未知';
    const region = request.cf?.country || '未知';
    const colo = request.cf?.colo || '未知';
    const text = `Success\n当前访问IP: ${clientIp}\n地理区域: ${region}\n数据中心: ${colo}`;
    return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

    // --- 2. 安全策略：区域封锁 ---
    // 【TS 修复】先检查 request.cf.country 是否为真值 (非空字符串)，然后再调用 .toUpperCase()
    const country = request.cf?.country;
    if (typeof country === 'string' && BLOCKED_REGIONS.includes(country.toUpperCase())) {
      return new Response('服务在此区域不可用。', { status: 403 });
    }

    // --- 3. 解析目标服务器 URL ---
    let upstreamUrl;
    try {
        let path = workerUrl.pathname.substring(1);
        path = path.replace(/^(https?)\/(?!\/)/, '$1://');
        if (!path.startsWith('http')) {
            path = 'https://' + path;
        }
        upstreamUrl = new URL(path);
        upstreamUrl.search = workerUrl.search;
    } catch (e) {
      return new Response('无效的目标 URL。请检查访问路径。', { status: 400 });
    }

    // --- 4. 处理 WebSocket 请求 ---
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
      return fetch(upstreamUrl.toString(), request);
    }

    // --- 5. 构造发往目标服务器的请求 ---
    const upstreamRequestHeaders = new Headers(request.headers);
    upstreamRequestHeaders.set('Host', upstreamUrl.host);
    upstreamRequestHeaders.set('Referer', workerUrl.origin);

    // ======================= 修改部分开始 =======================
    // 从外部请求中获取真实的客户端 IP
    const clientIp = request.headers.get('cf-connecting-ip');

    // 如果获取到了真实 IP，则将其设置到发往上游服务器的请求头中
    if (clientIp) {
        // 设置 X-Forwarded-For，这是最标准的传递代理 IP 的头部
        // Caddy 默认会从这个头部读取客户端 IP
        upstreamRequestHeaders.set('x-forwarded-for', clientIp);
        upstreamRequestHeaders.set('x-real-ip', clientIp);
        // 也可以再次设置 cf-connecting-ip，以防万一
        upstreamRequestHeaders.set('cf-connecting-ip', clientIp);

    }
    // ======================= 修改部分结束 =======================

    const upstreamRequest = new Request(upstreamUrl.toString(), {
      method: request.method,
      headers: upstreamRequestHeaders,
      body: request.body,
      redirect: 'manual',
    });

    // --- 6. 发送请求并处理响应 ---
    const upstreamResponse = await fetch(upstreamRequest);

    // --- 7. 处理重定向 ---
    const location = upstreamResponse.headers.get('Location');
    if (location && upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
      try {
        const redirectUrl = new URL(location);
        if (MANUAL_REDIRECT_DOMAINS.includes(redirectUrl.hostname)) {
          return upstreamResponse;
        }
        return fetch(location, upstreamRequest);
      } catch (e) {
        return upstreamResponse;
      }
    }

    // --- 8. 处理常规 HTTP 响应 ---
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.delete('Content-Security-Policy');
    responseHeaders.delete('X-Frame-Options');

    // --- 9. 直接返回响应 ---
    // 由于不再处理网页客户端，我们不对内容进行任何修改，
    // 直接将从上游服务器收到的响应（包括响应体和处理过的头部）返回给客户端。
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  },
};