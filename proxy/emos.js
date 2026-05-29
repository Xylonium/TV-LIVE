// Cloudflare Workers Emby 反代 - 无图片缓存版本
const CONFIG = {
    // ================= 上游服务器配置 =================
    UPSTREAMS: [
        "https://emos.lol",
        "https://direct.emos.lol:15611",
        "https://emos.de5.net",
        "https://emos.movier.ink",
        "https://emos.dolby.dpdns.org"
    ],
    
    // ================= 代理设置 =================
    PROXY: {
        name: "Dirige",  // 改为您的标识
        
        // 健康检查设置
        healthCheck: true,
        healthCheckInterval: 5, // 分钟
        
        // 请求超时时间（毫秒）
        timeout: 15000,
        
        // 最大重试次数
        maxRetries: 2
    },
    
    // ================= 缓存设置 =================
    CACHE: {
        // 完全禁用缓存
        enabled: false,
        
        // 即使禁用，也保留这些路径用于日志记录
        imagePaths: [
            "/emby/Items/*/Images/Primary",
            "/emby/Items/*/Images/Backdrop",
            "/emby/Items/*/Images/Logo",
            "/emby/Items/*/Images/Thumb"
        ]
    },
    
    // ================= 安全设置 =================
    SECURITY: {
        // 允许的域名（CORS）
        allowedOrigins: [
            "https://app.emby.media",
            "https://tv.emby.media",
            "https://mb3admin.com",
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://192.168.*",
            "http://10.*"
        ],
        
        // 允许的HTTP方法
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
        
        // 允许的HTTP头
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Emby-Token",
            "X-Emby-Authorization",
            "Range",
            "User-Agent"
        ]
    }
};

// 上游服务器管理器
class UpstreamManager {
    constructor() {
        this.upstreams = CONFIG.UPSTREAMS;
        this.currentIndex = 0;
        this.healthyUpstreams = [...this.upstreams];
        this.failures = new Map();
        this.lastHealthCheck = 0;
    }
    
    // 选择上游服务器（轮询）
    selectUpstream() {
        if (this.healthyUpstreams.length === 0) {
            return this.upstreams[this.currentIndex % this.upstreams.length];
        }
        
        const upstream = this.healthyUpstreams[this.currentIndex % this.healthyUpstreams.length];
        this.currentIndex++;
        return upstream;
    }
    
    // 健康检查
    async performHealthCheck() {
        if (!CONFIG.PROXY.healthCheck) return;
        
        const now = Date.now();
        if (now - this.lastHealthCheck < CONFIG.PROXY.healthCheckInterval * 60 * 1000) {
            return;
        }
        
        this.lastHealthCheck = now;
        const healthy = [];
        
        for (const upstream of this.upstreams) {
            try {
                const healthUrl = upstream + '/emby/System/Info/Public';
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(healthUrl, {
                    method: 'HEAD',
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    healthy.push(upstream);
                    this.failures.delete(upstream);
                } else {
                    this.recordFailure(upstream);
                }
            } catch (error) {
                this.recordFailure(upstream);
            }
        }
        
        this.healthyUpstreams = healthy.length > 0 ? healthy : [...this.upstreams];
    }
    
    // 记录失败
    recordFailure(upstream) {
        const count = this.failures.get(upstream) || 0;
        this.failures.set(upstream, count + 1);
        
        // 如果连续失败3次，暂时从健康列表中移除
        if (count >= 3) {
            this.healthyUpstreams = this.healthyUpstreams.filter(u => u !== upstream);
        }
    }
}

// 安全管理器
class SecurityManager {
    constructor() {
        this.rateLimits = new Map();
    }
    
    // 检查CORS
    checkCORS(origin) {
        if (!origin) return true;
        
        for (const allowed of CONFIG.SECURITY.allowedOrigins) {
            if (allowed.includes('*')) {
                const base = allowed.split('*')[0];
                if (origin.startsWith(base)) return true;
            } else if (origin === allowed) {
                return true;
            }
        }
        
        return false;
    }
    
    // 检查是否图片请求
    isImageRequest(path) {
        return CONFIG.CACHE.imagePaths.some(pattern => {
            const regex = pattern.replace(/\*/g, '.*');
            return new RegExp(regex).test(path);
        });
    }
}

// 全局实例
const upstreamManager = new UpstreamManager();
const securityManager = new SecurityManager();

// 主处理函数
async function handleRequest(request) {
    const url = new URL(request.url);
    
    // 重定向根路径到 /emby
    if (url.pathname === '/') {
        return Response.redirect(url.origin + '/emby', 301);
    }
    
    // 处理OPTIONS预检请求
    if (request.method === 'OPTIONS') {
        return handleOptionsRequest(request);
    }
    
    // 执行健康检查
    if (CONFIG.PROXY.healthCheck) {
        await upstreamManager.performHealthCheck();
    }
    
    // 选择上游服务器
    const upstream = upstreamManager.selectUpstream();
    
    // 转发请求
    return forwardRequest(request, upstream);
}

// 转发请求到上游服务器
async function forwardRequest(request, upstream) {
    const url = new URL(request.url);
    const upstreamUrl = upstream + url.pathname + url.search;
    
    // 准备请求头
    const headers = new Headers(request.headers);
    
    // 移除可能引起问题的头
    headers.delete('host');
    headers.delete('origin');
    headers.delete('referer');
    
    // 添加代理标识头
    headers.set('EMOS_PROXY_NAME', CONFIG.PROXY.name);
    headers.set('X-Forwarded-Host', url.host);
    headers.set('X-Forwarded-Proto', url.protocol.slice(0, -1));
    headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
    headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP') || '');
    headers.set('X-Proxy-Server', 'Cloudflare-Workers');
    
    // 处理CORS
    const origin = request.headers.get('origin');
    if (origin && securityManager.checkCORS(origin)) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    // 准备请求选项
    const requestOptions = {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'follow'
    };
    
    // 设置超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.PROXY.timeout);
    requestOptions.signal = controller.signal;
    
    // 发送请求（带重试）
    let response;
    let lastError;
    
    for (let i = 0; i <= CONFIG.PROXY.maxRetries; i++) {
        try {
            response = await fetch(upstreamUrl, requestOptions);
            clearTimeout(timeoutId);
            break;
        } catch (error) {
            lastError = error;
            clearTimeout(timeoutId);
            
            if (i < CONFIG.PROXY.maxRetries) {
                // 等待后重试
                await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
                continue;
            }
        }
    }
    
    if (!response) {
        throw lastError || new Error('Request failed');
    }
    
    // 处理响应头
    const responseHeaders = new Headers(response.headers);
    
    // 添加CORS头
    if (origin && securityManager.checkCORS(origin)) {
        responseHeaders.set('Access-Control-Allow-Origin', origin);
        responseHeaders.set('Access-Control-Allow-Credentials', 'true');
        responseHeaders.set('Access-Control-Allow-Methods', CONFIG.SECURITY.allowedMethods.join(', '));
        responseHeaders.set('Access-Control-Allow-Headers', CONFIG.SECURITY.allowedHeaders.join(', '));
    }
    
    // 添加代理信息头
    responseHeaders.set('X-Proxy-Server', 'Cloudflare-Workers');
    responseHeaders.set('X-Proxy-Name', CONFIG.PROXY.name);
    responseHeaders.set('X-Cache-Status', 'DISABLED'); // 明确显示缓存已禁用
    
    // 如果是图片请求，添加特殊头（用于调试）
    if (securityManager.isImageRequest(url.pathname)) {
        responseHeaders.set('X-Image-Request', 'true');
        responseHeaders.set('X-Cache-Enabled', 'false');
    }
    
    // 移除上游服务器可能设置的不需要的缓存头
    responseHeaders.delete('Cache-Control');
    responseHeaders.delete('Expires');
    responseHeaders.delete('Pragma');
    
    // 设置不缓存
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');
    
    // 返回响应
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
    });
}

// 处理OPTIONS请求
function handleOptionsRequest(request) {
    const origin = request.headers.get('origin') || '*';
    const isAllowed = securityManager.checkCORS(origin);
    
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': isAllowed ? origin : '',
            'Access-Control-Allow-Methods': CONFIG.SECURITY.allowedMethods.join(', '),
            'Access-Control-Allow-Headers': CONFIG.SECURITY.allowedHeaders.join(', '),
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
            'X-Proxy-Server': 'Cloudflare-Workers',
            'X-Proxy-Name': CONFIG.PROXY.name
        }
    });
}

// 错误处理
function createErrorResponse(message, status = 500) {
    const errorData = {
        error: true,
        message: message,
        status: status,
        timestamp: new Date().toISOString(),
        proxy: CONFIG.PROXY.name
    };
    
    return new Response(JSON.stringify(errorData), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
            'X-Proxy-Server': 'Cloudflare-Workers',
            'X-Proxy-Name': CONFIG.PROXY.name,
            'X-Error': 'true'
        }
    });
}

// Worker事件处理
addEventListener('fetch', event => {
    try {
        event.respondWith(handleRequest(event.request));
    } catch (error) {
        console.error('Unhandled error:', error);
        event.respondWith(createErrorResponse('Internal server error', 500));
    }
});

// 定期健康检查
addEventListener('scheduled', event => {
    event.waitUntil(upstreamManager.performHealthCheck());
});