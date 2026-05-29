// EMBY-PROXY-UI V18.7 (SaaS UI Optimized - Ultimate Fix + Media Auth Compatibility)

/**
 * @typedef {{
 *   get(key: string, options?: { type?: string }): Promise<any>,
 *   put(key: string, value: string): Promise<void>,
 *   delete(key: string): Promise<void>,
 *   list(options?: { prefix?: string, cursor?: string }): Promise<{ keys: Array<{ name: string }>, cursor?: string, list_complete?: boolean }>
 * }} KVNamespaceLike
 *
 * @typedef {{ waitUntil(promise: Promise<any>): void }} ExecutionContextLike
 *
 * @typedef {{
 *   success?: boolean,
 *   ok?: boolean,
 *   description?: string,
 *   errors?: Array<{ message?: string }>,
 *   result?: any,
 *   result_info?: { total_pages?: number, totalPages?: number },
 *   data?: {
 *     viewer?: {
 *       zones?: any[],
 *       accounts?: any[]
 *     }
 *   }
 * }} JsonApiEnvelope
 *
 * @typedef {{
 *   reason?: string,
 *   section?: string,
 *   actor?: string,
 *   source?: string,
 *   note?: string
 * }} ConfigSnapshotMeta
 *
 * @typedef {{
 *   id?: string,
 *   name?: string,
 *   type?: string,
 *   content?: string,
 *   savedAt?: string,
 *   updatedAt?: string,
 *   createdAt?: string,
 *   actor?: string,
 *   source?: string,
 *   requestHost?: string
 * }} DnsRecordHistoryEntryLike
 *
 * @typedef {{
 *   kv?: KVNamespaceLike | null,
 *   ctx?: ExecutionContextLike | null,
 *   invalidateList?: boolean
 * }} PersistNodesIndexOptions
 *
 * @typedef {{
 *   env?: any,
 *   kv?: KVNamespaceLike | null,
 *   ctx?: ExecutionContextLike | null,
 *   snapshotMeta?: ConfigSnapshotMeta
 * }} PersistRuntimeConfigOptions
 *
 * @typedef {RequestInit & { cf?: { cacheEverything: boolean, cacheTtl: number } }} WorkerRequestInit
 * @typedef {Response & { webSocket?: unknown }} UpgradeableResponse
 * @typedef {Error & { code?: string, status?: number }} AppError
 *
 * @typedef {{
 *   match: (...args: any[]) => Promise<any>,
 *   put: (...args: any[]) => Promise<any>
 * }} WorkerDefaultCacheLike
 *
 * @typedef {{
 *   caches?: {
 *     default?: WorkerDefaultCacheLike | null
 *   } | null
 * }} WorkerGlobalWithCachesLike
 */

// ============================================================================
// 0. 全局配置与状态 (GLOBAL CONFIG & STATE)
// ============================================================================
const Config = {
  Defaults: {
    JwtExpiry: 60 * 60 * 24 * 30,  
    LoginLockDuration: 900,         
    MaxLoginAttempts: 5,            
    CacheTTL: 60000,                
    CryptoKeyCacheTTL: 86400,       
    CryptoKeyCacheMax: 100,         
    NodeCacheMax: 5000,             
    NodesReadConcurrency: 12,       
    LogRetentionDays: 7,
    LogRetentionDaysMax: 365,
    LogFlushDelayMinutes: 20,
    LogFlushCountThreshold: 50,
    LogBatchChunkSize: 50,
    LogBatchRetryCount: 2,
    LogBatchRetryBackoffMs: 75,
    ScheduledLeaseMinMs: 30 * 1000,
    ScheduledLeaseMs: 5 * 60 * 1000,
    UiRadiusPx: 10,
    CacheTtlImagesDays: 30,
    PingTimeoutMs: 5000,
    PingCacheMinutes: 10,
    NodePanelPingAutoSort: false,
    TgAlertDroppedBatchThreshold: 0,
    TgAlertFlushRetryThreshold: 0,
    TgAlertCooldownMinutes: 30,
    TgAlertOnScheduledFailure: false,
    UpstreamTimeoutMs: 8000,
    UpstreamRetryAttempts: 0,
    BufferedRetryBodyMaxBytes: 2 * 1024 * 1024,
    LogQueryDefaultDays: 1,
    LogKeywordMaxWindowDays: 3,
    LogSearchMode: "like",
    LogVacuumMinIntervalMs: 7 * 24 * 60 * 60 * 1000,
    LogFtsRebuildMinIntervalMs: 7 * 24 * 60 * 60 * 1000,
    KvTidyIntervalMs: 60 * 60 * 1000,
    PrewarmCacheTtl: 120,
    MetadataPrewarmTimeoutMs: 3000,
    PrewarmPrefetchBytes: 4 * 1024 * 1024,
    ConfigSnapshotLimit: 5,
    DnsHistoryLimit: 5,
    CleanupBudgetMs: 1,             
    CleanupChunkSize: 64,           
    CleanupMinIntervalMs: 1000,
    AssetHash: "v18.7",           
    Version: "18.7"                 
  }
};

const GLOBALS = {
  NodeCache: new Map(),
  ConfigCache: null,
  CryptoKeyCache: new Map(),
  NodesListCache: null,
  CleanupState: {
    phase: 0,
    lastRunAt: 0,
    iterators: {
      node: null,
      crypto: null,
      rate: null,
      log: null
    }
  },
  NodesIndexCache: null,
  LogQueue: [],
  LogDedupe: new Map(),
  RateLimitCache: new Map(),
  LogFlushPending: false,
  LogFlushTask: null,
  LogClearEpochMs: 0,
  LogLastFlushAt: 0,
  OpsStatusWriteChain: Promise.resolve(),
  OpsStatusDbReady: new WeakMap(),
  InitCheckWarnedFingerprints: new Set(),
  Regex: {
    ImageExt: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    StaticExt: /\.(?:js|css|woff2?|ttf|otf|map|webmanifest)$/i,
    SubtitleExt: /\.(?:srt|ass|vtt|sub)$/i,
    EmbyImages: /(?:\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i,
    ManifestExt: /\.(?:m3u8|mpd)$/i,
    SegmentExt: /\.(?:ts|m4s)$/i,
    Streaming: /\.(?:mp4|m4v|m4a|ogv|webm|mkv|mov|avi|wmv|flv)$/i
  },
  SecurityHeaders: {
    "Referrer-Policy": "origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=15552000; preload",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block"
  },
  DropRequestHeaders: new Set([
    "host", "x-real-ip", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto", "forwarded",
    "connection", "upgrade", "transfer-encoding", "te", "keep-alive",
    "proxy-authorization", "proxy-authenticate", "trailer", "expect"
  ]),
  DropResponseHeaders: new Set([
    "access-control-allow-origin", "access-control-allow-methods", "access-control-allow-headers", "access-control-allow-credentials",
    "x-frame-options", "strict-transport-security", "x-content-type-options", "x-xss-protection", "referrer-policy",
    "x-powered-by", "server" 
  ])
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Emby-Authorization, X-Emby-Token, X-Emby-Client, X-Emby-Device-Id, X-Emby-Device-Name, X-Emby-Client-Version, X-MediaBrowser-Authorization, X-MediaBrowser-Token, X-MediaBrowser-Client, X-MediaBrowser-Device-Id, X-MediaBrowser-Device-Name, X-MediaBrowser-Client-Version"
};

function mergeVaryHeader(headers, value) {
  const current = headers.get("Vary");
  if (!current) {
    headers.set("Vary", value);
    return;
  }
  const parts = current.split(",").map(v => v.trim()).filter(Boolean);
  if (!parts.includes(value)) parts.push(value);
  headers.set("Vary", parts.join(", "));
}

function applySecurityHeaders(headers) {
  Object.entries(GLOBALS.SecurityHeaders).forEach(([k, v]) => headers.set(k, v));
  return headers;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'], i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function toGraphQLString(value) {
  return JSON.stringify(String(value ?? ""));
}

function toGraphQLStringArray(values) {
  return JSON.stringify((Array.isArray(values) ? values : []).map(value => String(value ?? "")));
}

function getCorsHeadersForResponse(env, request, originOverride = null) {
  const reqOrigin = request.headers.get("Origin");
  const reqHeaders = request.headers.get("Access-Control-Request-Headers") || corsHeaders["Access-Control-Allow-Headers"];
  const allowOrigin = originOverride || reqOrigin || corsHeaders["Access-Control-Allow-Origin"];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": corsHeaders["Access-Control-Allow-Methods"],
    "Access-Control-Allow-Headers": reqHeaders,
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, X-Emby-Auth-Token, X-MediaBrowser-Auth-Token",
    "Access-Control-Max-Age": "86400"
  };
}

function safeDecodeSegment(segment = "") {
  if (!segment) return "";
  try { return decodeURIComponent(segment); } catch { return segment; }
}

function sanitizeProxyPath(path) {
  let raw = typeof path === "string" ? path : "/";
  if (!raw) return "/";
  if (!raw.startsWith("/")) raw = "/" + raw;
  raw = raw.replace(/^\/+/, "/");
  return raw;
}

function normalizeAdminPath(value) {
  const fallback = "/admin";
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  let normalized = sanitizeProxyPath(raw);
  normalized = normalized.replace(/\/{2,}/g, "/");
  if (normalized.length > 1) normalized = normalized.replace(/\/+$/, "");
  if (!normalized || normalized === "/" || normalized.toLowerCase().startsWith("/api")) return fallback;
  return normalized;
}

function pathnameMatchesPrefix(pathname, prefix) {
  const safePath = sanitizeProxyPath(pathname || "/");
  const safePrefix = sanitizeProxyPath(prefix || "/");
  return safePath === safePrefix || safePath.startsWith(safePrefix + "/");
}

function getAdminPath(env) {
  return normalizeAdminPath(env?.ADMIN_PATH);
}

function getAdminLoginPath(env) {
  const adminPath = getAdminPath(env);
  return adminPath === "/" ? "/login" : `${adminPath}/login`;
}

function getAdminCookiePath(env) {
  const adminPath = getAdminPath(env);
  return adminPath === "/" ? "/" : adminPath;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function serializeInlineJson(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function buildInitHealth(env) {
  const missing = [];
  if (!env?.JWT_SECRET) missing.push("JWT_SECRET");
  if (!env?.ADMIN_PASS) missing.push("ADMIN_PASS");
  const adminPath = getAdminPath(env);
  const loginPath = getAdminLoginPath(env);
  return {
    ok: missing.length === 0,
    missing,
    adminPath,
    loginPath,
    message: missing.length
      ? `系统未初始化：缺少 ${missing.join("、")}。`
      : "系统初始化检查通过。"
  };
}

function warnInitHealthOnce(env) {
  const health = buildInitHealth(env);
  if (health.ok) return health;
  const fingerprint = health.missing.join("|") || "unknown";
  if (!GLOBALS.InitCheckWarnedFingerprints.has(fingerprint)) {
    GLOBALS.InitCheckWarnedFingerprints.add(fingerprint);
    console.warn(`[Init Check] ${health.message} 管理入口: ${health.adminPath}`);
  }
  return health;
}

function buildInitHealthBannerHtml(initHealth) {
  if (!initHealth || initHealth.ok) return "";
  const missingText = Array.isArray(initHealth.missing) && initHealth.missing.length
    ? initHealth.missing.map(item => `<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">${escapeHtml(item)}</code>`).join(" ")
    : `<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">UNKNOWN</code>`;
  return `<div id="init-health-banner" class="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-sm">
    <div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
      <div class="font-semibold">系统未初始化</div>
      <div class="text-xs text-amber-700">管理入口：${escapeHtml(initHealth.adminPath || "/admin")}</div>
    </div>
    <p class="mt-2 leading-6">检测到关键环境变量缺失：${missingText}</p>
    <p class="mt-1 text-xs leading-5 text-amber-700">请先在 Cloudflare Worker 环境变量中补齐后再使用管理台登录与敏感操作。</p>
  </div>`;
}

function escapeSqlLike(value) {
  return String(value || "").replace(/[\\%_]/g, "\\$&");
}

function isLikelyIpAddress(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(text)) return true;
  return /^[0-9a-f:]+$/i.test(text) && text.includes(":");
}

function normalizeTargetBasePath(pathname = "/") {
  const safePath = sanitizeProxyPath(pathname || "/");
  if (safePath === "/") return "";
  return safePath.replace(/\/+$/, "");
}

function normalizeNodeMediaAuthMode(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "emby") return "emby";
  if (normalized === "jellyfin") return "jellyfin";
  if (normalized === "passthrough") return "passthrough";
  return "auto";
}

function normalizeNodeRealClientIpMode(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "forward") return "forward";
  if (normalized === "strip") return "strip";
  if (normalized === "disable" || normalized === "none") return "disable";
  return "forward";
}

function getRealClientIpHeaderMode(node) {
  const nodeMode = normalizeNodeRealClientIpMode(node?.realClientIpMode);
  if (nodeMode === "forward") return "full";
  if (nodeMode === "strip") return "real-ip-only";
  if (nodeMode === "disable") return "none";
  return "full";
}

// 保留节点 target 自带的子路径，避免 /node/foo 被错误拼到源站根目录。
function buildUpstreamProxyUrl(targetBase, proxyPath = "/") {
  const baseUrl = targetBase instanceof URL ? new URL(targetBase.toString()) : new URL(String(targetBase || ""));
  const basePath = normalizeTargetBasePath(baseUrl.pathname);
  const safeProxyPath = sanitizeProxyPath(proxyPath);
  const resolvedPath = safeProxyPath === "/"
    ? (basePath ? `${basePath}/` : "/")
    : `${basePath}${safeProxyPath}`;
  baseUrl.pathname = resolvedPath || "/";
  baseUrl.search = "";
  baseUrl.hash = "";
  return baseUrl;
}

function translateUpstreamUrlToProxyLocation(upstreamUrl, activeTargetBase, name, key) {
  try {
    const resolvedUrl = upstreamUrl instanceof URL ? upstreamUrl : new URL(String(upstreamUrl || ""));
    const targetBase = activeTargetBase instanceof URL ? activeTargetBase : new URL(String(activeTargetBase || ""));
    if (resolvedUrl.origin !== targetBase.origin) return resolvedUrl.toString();
    const basePath = normalizeTargetBasePath(targetBase.pathname);
    let proxyPath = resolvedUrl.pathname || "/";
    if (basePath) {
      if (proxyPath === basePath || proxyPath === `${basePath}/`) proxyPath = "/";
      else if (proxyPath.startsWith(`${basePath}/`)) proxyPath = proxyPath.slice(basePath.length);
      else return resolvedUrl.toString();
    }
    proxyPath = sanitizeProxyPath(proxyPath);
    return `${buildProxyPrefix(name, key)}${proxyPath === "/" ? "/" : proxyPath}${resolvedUrl.search}${resolvedUrl.hash}`;
  } catch {
    return null;
  }
}

function sanitizeSyntheticRedirectHeaders(headers) {
  [
    "Age",
    "Accept-Ranges",
    "Content-Disposition",
    "Content-Encoding",
    "Content-Language",
    "Content-Length",
    "Content-Location",
    "Content-Range",
    "Content-Type",
    "ETag",
    "Expires",
    "Last-Modified",
    "Set-Cookie",
    "Transfer-Encoding"
  ].forEach(header => headers.delete(header));
}

function buildProxyPrefix(name, key) {
  const encodedName = encodeURIComponent(String(name || ""));
  if (!key) return "/" + encodedName;
  return "/" + encodedName + "/" + encodeURIComponent(String(key));
}

function normalizePrewarmDepth(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return normalized === "poster_manifest" ? "poster_manifest" : "poster";
}

function normalizeLogSearchMode(value) {
  return String(value || "").trim().toLowerCase() === "fts" ? "fts" : Config.Defaults.LogSearchMode;
}

function looksLikeFtsExpression(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/\b(?:AND|OR|NOT|NEAR)\b/i.test(text)) return true;
  if (/(?:^|\s)(?:node_name|request_path|user_agent|error_detail)\s*:/i.test(text)) return true;
  if (/(?:^|\s)[^\s"]+\*/.test(text)) return true;
  return /^"(?:[^"]|"")+"$/.test(text);
}

function quoteFtsTerm(term) {
  return `"${String(term || "").replace(/"/g, '""')}"`;
}

function normalizeFtsExpression(text) {
  return String(text || "").replace(
    /(^|\s)((?:node_name|request_path|user_agent|error_detail)\s*:\s*)([^"\s()]+)(?=\s|$)/gi,
    (match, lead, prefix, value) => `${lead}${prefix}${quoteFtsTerm(value)}`
  );
}

function buildFtsMatchQuery(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (looksLikeFtsExpression(text)) return normalizeFtsExpression(text);
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map(token => quoteFtsTerm(token))
    .join(" AND ");
}

function normalizeRegionCodeCsv(value = "") {
  return [...new Set(
    String(value || "")
      .split(",")
      .map(item => item.trim().toUpperCase())
      .filter(Boolean)
  )].join(",");
}

function quoteSqlIdentifier(name) {
  return `"${String(name || "").replace(/"/g, '""')}"`;
}

function normalizeSqlIdentifierSearchText(sql) {
  return String(sql || "")
    .toLowerCase()
    .replace(/["`\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseContentLengthHeader(value) {
  const raw = String(value || "").trim();
  if (!/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function getDefaultCacheHandle() {
  try {
    /** @type {unknown} */
    const globalObject = globalThis;
    /** @type {WorkerGlobalWithCachesLike | null | undefined} */
    const runtimeGlobals = globalObject;
    return runtimeGlobals?.caches?.default ?? null;
  } catch {
    return null;
  }
}

const WORKER_CACHE_DROP_QUERY_PARAMS = new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization",
  "deviceid",
  "xembydeviceid",
  "xembydevicename",
  "xembyclient",
  "xembyclientversion",
  "xmediabrowserdeviceid",
  "xmediabrowserdevicename",
  "xmediabrowserclient",
  "xmediabrowserclientversion",
  "client",
  "clientid",
  "devicename",
  "userid",
  "playsessionid",
  "sessionid"
]);
const WORKER_METADATA_MANIFEST_ALLOWED_PATHS = [
  /^\/Videos\/[^/]+\/(?:main|master|stream)\.m3u8$/i,
  /^\/Videos\/[^/]+\/(?:manifest|main|master|stream)\.mpd$/i,
  /^\/Audio\/[^/]+\/(?:main|master|stream)\.m3u8$/i
];
const WORKER_METADATA_MANIFEST_ALLOWED_PARAMS = new Set([
  "mediasourceid",
  "static",
  "tag",
  "audiostreamindex",
  "subtitlestreamindex",
  "subtitlemethod",
  "starttimeticks"
]);

function normalizeWorkerCacheParamName(name = "") {
  return String(name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function shouldStripWorkerCacheQueryParam(name = "") {
  return WORKER_CACHE_DROP_QUERY_PARAMS.has(normalizeWorkerCacheParamName(name));
}

function normalizeWorkerCacheUrl(url) {
  const normalizedUrl = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""));
  normalizedUrl.hash = "";
  const keptParams = [];
  for (const [key, value] of normalizedUrl.searchParams.entries()) {
    if (shouldStripWorkerCacheQueryParam(key)) continue;
    keptParams.push([key, value]);
  }
  keptParams.sort((a, b) => {
    const keyDiff = a[0].localeCompare(b[0]);
    if (keyDiff !== 0) return keyDiff;
    return String(a[1]).localeCompare(String(b[1]));
  });
  normalizedUrl.search = "";
  for (const [key, value] of keptParams) normalizedUrl.searchParams.append(key, value);
  return normalizedUrl;
}

function normalizeMetadataCachePath(pathname = "") {
  const rawPath = String(pathname || "");
  const match = /\/(?:Videos|Audio)\/.+$/i.exec(rawPath);
  return match ? match[0] : rawPath;
}

function buildWorkerCacheKey(url) {
  try {
    return new Request(normalizeWorkerCacheUrl(url).toString(), { method: "GET" });
  } catch {
    return null;
  }
}

function isTranscodingManifestUrl(url) {
  try {
    const normalizedUrl = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""));
    for (const [key, value] of normalizedUrl.searchParams.entries()) {
      const lowerKey = String(key || "").toLowerCase();
      const lowerValue = String(value || "").toLowerCase();
      if (lowerKey.includes("transcod") || lowerValue.includes("transcod")) return true;
    }
    return false;
  } catch {
    return true;
  }
}

function isWhitelistedMetadataManifestUrl(url) {
  try {
    const normalizedUrl = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""));
    const normalizedPath = normalizeMetadataCachePath(normalizedUrl.pathname || "");
    if (!GLOBALS.Regex.ManifestExt.test(normalizedPath)) return false;
    if (isTranscodingManifestUrl(normalizedUrl)) return false;
    if (!WORKER_METADATA_MANIFEST_ALLOWED_PATHS.some(rule => rule.test(normalizedPath))) return false;
    for (const [key] of normalizedUrl.searchParams.entries()) {
      if (shouldStripWorkerCacheQueryParam(key)) continue;
      if (!WORKER_METADATA_MANIFEST_ALLOWED_PARAMS.has(normalizeWorkerCacheParamName(key))) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function shouldWorkerCacheMetadataUrl(url) {
  try {
    const normalizedUrl = url instanceof URL ? new URL(url.toString()) : new URL(String(url || ""));
    const pathname = normalizedUrl.pathname || "";
    if (GLOBALS.Regex.EmbyImages.test(pathname) || GLOBALS.Regex.ImageExt.test(pathname)) return true;
    if (GLOBALS.Regex.SubtitleExt.test(pathname)) return true;
    if (GLOBALS.Regex.ManifestExt.test(pathname)) return isWhitelistedMetadataManifestUrl(normalizedUrl);
    return false;
  } catch {
    return false;
  }
}

function isHeavyVideoBytePath(pathname = "") {
  const lowerPath = String(pathname || "").toLowerCase();
  if (!lowerPath) return false;
  if (/\.(?:mp4|m4v|mkv|mov|avi|wmv|flv|ts|m4s)(?:$|[?#])/.test(lowerPath)) return true;
  if (GLOBALS.Regex.ManifestExt.test(lowerPath) || GLOBALS.Regex.SubtitleExt.test(lowerPath)) return false;
  return /\/videos\/[^/]+\/(?:stream|original|download|file)\b/.test(lowerPath) || /\/items\/[^/]+\/download\b/.test(lowerPath);
}

function collectMetadataUrlStrings(input, collector = new Set(), depth = 0) {
  if (input === null || input === undefined || depth > 5) return collector;
  if (typeof input === "string") {
    const value = input.trim();
    if (value && /^(?:https?:\/\/|\/)/i.test(value)) {
      const lowerValue = value.toLowerCase();
      const matchTarget = lowerValue.split(/[?#]/, 1)[0] || lowerValue;
      if (
        GLOBALS.Regex.ManifestExt.test(matchTarget) ||
        GLOBALS.Regex.SubtitleExt.test(matchTarget) ||
        GLOBALS.Regex.EmbyImages.test(lowerValue) ||
        GLOBALS.Regex.ImageExt.test(matchTarget)
      ) {
        collector.add(value);
      }
    }
    return collector;
  }
  if (Array.isArray(input)) {
    input.slice(0, 24).forEach(item => collectMetadataUrlStrings(item, collector, depth + 1));
    return collector;
  }
  if (typeof input === "object") {
    Object.values(input).slice(0, 32).forEach(value => collectMetadataUrlStrings(value, collector, depth + 1));
  }
  return collector;
}

function extractProxyItemId(proxyPath = "") {
  const match = /^\/Items\/([^/]+)(?:\/|$)/i.exec(String(proxyPath || ""));
  return match ? safeDecodeSegment(match[1]) : "";
}

function rankMetadataWarmPath(pathname = "") {
  const lowerPath = String(pathname || "").toLowerCase();
  if (GLOBALS.Regex.EmbyImages.test(lowerPath) || GLOBALS.Regex.ImageExt.test(lowerPath)) return 0;
  if (GLOBALS.Regex.ManifestExt.test(lowerPath)) return 1;
  if (GLOBALS.Regex.SubtitleExt.test(lowerPath)) return 2;
  return 3;
}

const DEFAULT_WANGPAN_DIRECT_TERMS = [
  "115.com", "anxia.com", "jianguoyun", "aliyundrive", "alipan", "aliyundrive.net", "alicloudccp", "myqcloud", "aliyuncs",
  "189.cn", "ctyun.cn", "baidu", "baidupcs", "123pan", "qiniudn", "qbox.me", "myhuaweicloud", "139.com",
  "quark", "yun.uc.cn", "r2.cloudflarestorage", "volces.com", "tos-s3"
];
const DEFAULT_WANGPAN_DIRECT_TEXT = DEFAULT_WANGPAN_DIRECT_TERMS.join(",");

function escapeRegexLiteral(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseKeywordTerms(raw = "") {
  return String(raw || "")
    .split(/[\n\r,，;；|]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function buildKeywordFuzzyRegex(raw = "", fallbackTerms = []) {
  const baseTerms = parseKeywordTerms(raw);
  const fallbackList = Array.isArray(fallbackTerms) ? fallbackTerms : parseKeywordTerms(String(fallbackTerms || ""));
  const mergedTerms = baseTerms.length ? baseTerms : fallbackList;
  if (!mergedTerms.length) return null;
  try {
    return new RegExp(mergedTerms.map(escapeRegexLiteral).join("|"), "i");
  } catch {
    return null;
  }
}

function getWangpanDirectText(raw = "") {
  const terms = parseKeywordTerms(raw);
  return (terms.length ? terms : DEFAULT_WANGPAN_DIRECT_TERMS).join(",");
}

function shouldDirectByWangpan(targetUrl, customKeywords = "") {
  let haystack = "";
  try {
    const url = targetUrl instanceof URL ? targetUrl : new URL(String(targetUrl));
    haystack = `${url.hostname} ${url.href}`;
  } catch {
    haystack = String(targetUrl || "");
  }
  const matchRegex = buildKeywordFuzzyRegex(customKeywords, DEFAULT_WANGPAN_DIRECT_TERMS);
  return !!matchRegex && matchRegex.test(haystack);
}

function normalizeNodeNameList(input) {
  const rawList = Array.isArray(input)
    ? input
    : String(input || "").split(/[\\r\\n,，;；|]+/);
  const seen = new Set();
  const result = [];
  for (const item of rawList) {
    const value = String(item || "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function reconcileNamedNodeSelection(currentSelection = [], options = {}) {
  const renameMapInput = options.renameMap instanceof Map
    ? options.renameMap
    : new Map(Object.entries(options.renameMap && typeof options.renameMap === "object" ? options.renameMap : {}));
  const renameMap = new Map();
  for (const [fromName, toName] of renameMapInput.entries()) {
    const fromKey = String(fromName || "").trim().toLowerCase();
    const nextName = String(toName || "").trim();
    if (!fromKey || !nextName) continue;
    renameMap.set(fromKey, nextName);
  }
  const removedKeys = new Set(normalizeNodeNameList(options.removedNames || []).map(name => String(name || "").trim().toLowerCase()).filter(Boolean));
  /** @type {[string, string][] | null} */
  const allowedNameEntries = options.allowedNames === undefined
    ? null
    : normalizeNodeNameList(options.allowedNames || [])
        .map(name => {
          /** @type {[string, string]} */
          const entry = [String(name || "").trim().toLowerCase(), String(name || "").trim()];
          return entry;
        })
        .filter(([key, value]) => key && value);
  const allowedNameMap = allowedNameEntries ? new Map(allowedNameEntries) : null;
  const nextSelection = [];
  const seen = new Set();
  for (const rawName of normalizeNodeNameList(currentSelection)) {
    const currentKey = String(rawName || "").trim().toLowerCase();
    if (!currentKey || removedKeys.has(currentKey)) continue;
    const renamedName = renameMap.get(currentKey) || String(rawName || "").trim();
    const nextKey = renamedName.toLowerCase();
    if (!nextKey || removedKeys.has(nextKey)) continue;
    if (allowedNameMap && !allowedNameMap.has(nextKey)) continue;
    if (seen.has(nextKey)) continue;
    seen.add(nextKey);
    nextSelection.push(allowedNameMap?.get(nextKey) || renamedName);
  }
  return nextSelection;
}

function isNodeDirectSourceEnabled(node, currentConfig = null) {
  const configuredDirectNodes = normalizeNodeNameList(currentConfig?.sourceDirectNodes ?? currentConfig?.directSourceNodes ?? currentConfig?.nodeDirectList ?? []);
  const nodeName = String(node?.name || "").trim();
  if (nodeName && configuredDirectNodes.some(item => item.toLowerCase() === nodeName.toLowerCase())) return true;
  const proxyMode = String(node?.proxyMode || node?.mode || "").trim().toLowerCase();
  if (["direct", "source-direct", "origin-direct", "node-direct"].includes(proxyMode)) return true;
  if (node?.direct === true || node?.sourceDirect === true || node?.directSource === true || node?.direct2xx === true) return true;
  const explicitText = `${node?.tag || ""} ${node?.remark || ""}`;
  return /(?:^|[\s\[(【])(?:直连|source-direct|origin-direct|node-direct)(?:$|[\s\])】])/i.test(explicitText);
}

function resolveRedirectTarget(location, baseUrl) {
  if (!location) return null;
  try {
    return new URL(location, baseUrl instanceof URL ? baseUrl : String(baseUrl || ""));
  } catch {
    return null;
  }
}

function normalizeRedirectMethod(status, method = "GET") {
  const upperMethod = String(method || "GET").toUpperCase();
  if (status === 303 && upperMethod !== "GET" && upperMethod !== "HEAD") return "GET";
  if ((status === 301 || status === 302) && upperMethod === "POST") return "GET";
  return upperMethod;
}

const CF_DASH_CACHE_VERSION = 6;

function makeCfDashCacheKey(zoneId, dateKey = "") {
  const safeZoneId = encodeURIComponent(String(zoneId || "default").trim() || "default");
  const safeDateKey = encodeURIComponent(String(dateKey || "current").trim() || "current");
  return `sys:cf_dash_cache:${safeZoneId}:${safeDateKey}`;
}

function getVideoRequestWhereClause(column = "request_path") {
  return `(${column} LIKE '%/stream%' OR ${column} LIKE '%/master.m3u8%' OR ${column} LIKE '%/videos/%/original%' OR ${column} LIKE '%/videos/%/download%' OR ${column} LIKE '%/videos/%/file%' OR ${column} LIKE '%/items/%/download%' OR ${column} LIKE '%Static=true%' OR ${column} LIKE '%Download=true%')`;
}

function parseHostnameCandidate(rawHostname) {
  const host = String(rawHostname || "").trim().toLowerCase();
  if (!host) return null;
  const wildcard = host.includes("*");
  const cleaned = host.replace(/^\*\./, "").replace(/^\*+/, "").replace(/\*+$/g, "").replace(/^\.+|\.+$/g, "");
  if (!cleaned) return null;
  return { hostname: cleaned, wildcard };
}

function normalizeHostnameText(rawHostname) {
  return parseHostnameCandidate(rawHostname)?.hostname || "";
}

function isHostnameInsideZone(rawHostname, rawZoneName) {
  const hostname = normalizeHostnameText(rawHostname);
  const zoneName = normalizeHostnameText(rawZoneName);
  if (!hostname || !zoneName) return false;
  return hostname === zoneName || hostname.endsWith(`.${zoneName}`);
}

function extractRouteHostnameInfo(pattern) {
  const rawPattern = String(pattern || "").trim();
  if (!rawPattern) return null;
  const slashIndex = rawPattern.indexOf("/");
  const rawHost = slashIndex === -1 ? rawPattern : rawPattern.slice(0, slashIndex);
  const path = slashIndex === -1 ? "" : rawPattern.slice(slashIndex);
  const parsed = parseHostnameCandidate(rawHost);
  if (!parsed) return null;
  return { ...parsed, path, pattern: rawPattern };
}

function scoreHostnameCandidate(hostname, options = {}) {
  const path = String(options.path || "");
  let score = 0;
  if (!options.wildcard) score += 100;
  if (hostname.includes(".workers.dev")) score -= 20;
  if (path === "/" || path === "/*") score += 20;
  else if (path.endsWith("*")) score += 10;
  else if (path) score += 4;
  score += hostname.split(".").length * 4;
  score -= Math.min(path.length, 30);
  return score;
}

async function fetchCloudflareApiJson(url, apiToken, init = {}) {
  const normalizedInit = init && typeof init === "object" ? init : {};
  /** @type {any} */
  const extraInit = normalizedInit;
  let extraHeaders = {};
  const rawHeaders = extraInit?.headers;
  if (rawHeaders) {
    if (rawHeaders instanceof Headers) extraHeaders = Object.fromEntries(rawHeaders.entries());
    else if (typeof rawHeaders === "object") extraHeaders = rawHeaders;
  }
  const res = await fetch(url, {
    ...extraInit,
    headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json", ...extraHeaders }
  });
  if (!res.ok) throw new Error(`cf_api_http_${res.status}`);
  /** @type {JsonApiEnvelope} */
  const payload = await res.json();
  if (payload?.success === false) {
    const msg = Array.isArray(payload?.errors) ? payload.errors.map(item => item?.message).filter(Boolean).join("; ") : "";
    throw new Error(msg || "cf_api_error");
  }
  return payload;
}

async function fetchCloudflareGraphQL(apiToken, query, variables) {
  const body = variables && typeof variables === "object"
    ? { query, variables }
    : { query };
  const cfRes = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!cfRes.ok) throw new Error(`cf_graphql_http_${cfRes.status}`);
  /** @type {JsonApiEnvelope} */
  const cfData = await cfRes.json();
  if (Array.isArray(cfData?.errors) && cfData.errors.length) {
    throw new Error(cfData.errors.map(item => item?.message).filter(Boolean).join("; ") || "cf_graphql_error");
  }
  return cfData;
}

async function fetchCloudflareGraphQLZone(zoneId, apiToken, query, variables) {
  const cfData = await fetchCloudflareGraphQL(apiToken, query, variables);
  return cfData?.data?.viewer?.zones?.[0] || null;
}

async function fetchCloudflareGraphQLAccount(accountId, apiToken, query, variables) {
  const cfData = await fetchCloudflareGraphQL(apiToken, query, variables);
  return cfData?.data?.viewer?.accounts?.[0] || null;
}

async function fetchCloudflareZoneDetails(zoneId, apiToken) {
  if (!zoneId || !apiToken) return null;
  const payload = await fetchCloudflareApiJson(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(zoneId).trim())}`, apiToken);
  return payload?.result || null;
}

function isEditableDnsRecordType(value = "") {
  const upper = String(value || "").trim().toUpperCase();
  return upper === "A" || upper === "AAAA" || upper === "CNAME";
}

function normalizeDnsEditModeValue(value = "") {
  return String(value || "").trim().toLowerCase() === "a" ? "a" : "cname";
}

function isValidIpv4Address(value = "") {
  const text = String(value || "").trim();
  const parts = text.split(".");
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!/^[0-9]{1,3}$/.test(part)) return false;
    const num = Number(part);
    if (!Number.isFinite(num) || num < 0 || num > 255) return false;
  }
  return true;
}

function isValidIpv6Address(value = "") {
  const text = String(value || "").trim();
  if (!text || !text.includes(":")) return false;
  if (/\s/.test(text)) return false;
  try {
    new URL(`http://[${text}]/`);
    return true;
  } catch {
    return false;
  }
}

function getDnsContentValidationError(type, content, options = {}) {
  const nextType = String(type || "").trim().toUpperCase();
  const nextContent = String(content || "").trim();
  const allowCname = options.allowCname !== false;
  if (!isEditableDnsRecordType(nextType)) return "Type 仅允许 A / AAAA / CNAME";
  if (!allowCname && nextType === "CNAME") return "A 模式仅允许 A / AAAA";
  if (!nextContent) return "Content 不能为空";
  if (nextType === "A" && !isValidIpv4Address(nextContent)) return "A 记录 Content 必须是合法 IPv4 地址";
  if (nextType === "AAAA" && !isValidIpv6Address(nextContent)) return "AAAA 记录 Content 必须是合法 IPv6 地址";
  if (nextType === "CNAME") {
    if (/\s/.test(nextContent)) return "CNAME 记录 Content 不能包含空格";
    if (nextContent.length > 255) return "CNAME 记录 Content 过长";
  }
  return "";
}

function normalizeEditableDnsRecord(record = {}) {
  return {
    id: String(record?.id || "").trim(),
    type: String(record?.type || "").trim().toUpperCase(),
    name: normalizeHostnameText(record?.name),
    content: String(record?.content || "").trim(),
    ttl: Number(record?.ttl) || 1,
    proxied: record?.proxied === true,
    comment: typeof record?.comment === "string" ? record.comment : undefined,
    tags: Array.isArray(record?.tags) ? record.tags.map(tag => String(tag)) : undefined
  };
}

async function listCloudflareDnsRecords(zoneId, apiToken) {
  const records = [];
  let page = 1;
  let totalPages = 1;
  const perPage = 100;
  do {
    const url = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(zoneId)}/dns_records?page=${page}&per_page=${perPage}`;
    const payload = await fetchCloudflareApiJson(url, apiToken);
    if (Array.isArray(payload?.result)) {
      records.push(...payload.result.map(item => normalizeEditableDnsRecord(item)).filter(item => item.id && item.name));
    }
    totalPages = Number(payload?.result_info?.total_pages || payload?.result_info?.totalPages || 1);
    page += 1;
  } while (page <= totalPages && page <= 20);
  return records;
}

function buildCloudflareDnsRecordBody(baseRecord = {}, options = {}) {
  const type = String(options.type || baseRecord?.type || "A").trim().toUpperCase();
  const host = normalizeHostnameText(options.host || baseRecord?.name);
  const content = String(options.content || "").trim();
  const body = {
    type,
    name: host,
    content,
    ttl: Number(baseRecord?.ttl) || 1,
    proxied: baseRecord?.proxied === true
  };
  if (typeof baseRecord?.comment === "string") body.comment = baseRecord.comment;
  if (Array.isArray(baseRecord?.tags)) body.tags = baseRecord.tags.map(tag => String(tag));
  return body;
}

async function resolveCloudflareWorkerServices({ cfAccountId, cfZoneId, cfApiToken }) {
  const serviceNames = new Set();
  const pushName = (rawName) => {
    const name = String(rawName || "").trim();
    if (!name) return;
    serviceNames.add(name);
  };

  if (cfAccountId && cfZoneId) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(cfAccountId).trim())}/workers/domains?zone_id=${encodeURIComponent(String(cfZoneId).trim())}`;
      const payload = await fetchCloudflareApiJson(url, cfApiToken);
      for (const item of payload?.result || []) {
        pushName(item?.service || item?.script || item?.name);
      }
    } catch (e) {
      console.log("CF Workers domains service lookup failed", e);
    }
  }

  if (cfZoneId) {
    try {
      let page = 1;
      let totalPages = 1;
      do {
        const url = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(cfZoneId).trim())}/workers/routes?page=${page}&per_page=100`;
        const payload = await fetchCloudflareApiJson(url, cfApiToken);
        totalPages = Number(payload?.result_info?.total_pages || payload?.result_info?.totalPages || 1);
        for (const item of payload?.result || []) {
          pushName(item?.script || item?.service);
        }
        page += 1;
      } while (page <= totalPages && page <= 5);
    } catch (e) {
      console.log("CF Workers routes service lookup failed", e);
    }
  }

  return [...serviceNames];
}

async function fetchCloudflareWorkerUsageMetrics({ cfAccountId, cfZoneId, cfApiToken, startIso, endIso }) {
  if (!cfAccountId || !cfApiToken) return null;
  const serviceNames = await resolveCloudflareWorkerServices({ cfAccountId, cfZoneId, cfApiToken });
  if (!serviceNames.length) return null;

  const query = `
  query {
    viewer {
      accounts(filter: { accountTag: ${toGraphQLString(cfAccountId)} }) {
        workersInvocationsAdaptive(limit: 10000, filter: { datetime_geq: ${toGraphQLString(startIso)}, datetime_leq: ${toGraphQLString(endIso)}, scriptName_in: ${toGraphQLStringArray(serviceNames)} }) {
          dimensions { datetime scriptName status }
          sum { requests }
        }
      }
    }
  }`;

  const accountData = await fetchCloudflareGraphQLAccount(cfAccountId, cfApiToken, query);
  const records = Array.isArray(accountData?.workersInvocationsAdaptive) ? accountData.workersInvocationsAdaptive : [];
  const hourlySeries = Array.from({ length: 24 }, (_, hour) => ({ label: String(hour).padStart(2, "0") + ":00", total: 0 }));

  let totalRequests = 0;
  for (const item of records) {
    const req = Number(item?.sum?.requests) || 0;
    totalRequests += req;

    const dtRaw = item?.dimensions?.datetime;
    if (!dtRaw) continue;
    const dt = new Date(dtRaw);
    if (Number.isNaN(dt.getTime())) continue;
    const hour = (dt.getUTCHours() + 8) % 24;
    if (hourlySeries[hour]) hourlySeries[hour].total += req;
  }

  return { totalRequests, hourlySeries, serviceNames };
}

async function resolveCloudflareBoundHostname({ cfAccountId, cfZoneId, cfApiToken, zoneNameFallback = "" }) {
  const candidates = [];
  const pushCandidate = (rawHostname, options = {}) => {
    const parsed = parseHostnameCandidate(rawHostname);
    if (!parsed) return;
    const wildcard = options.wildcard === true || parsed.wildcard === true;
    candidates.push({
      hostname: parsed.hostname,
      path: String(options.path || ""),
      wildcard,
      score: scoreHostnameCandidate(parsed.hostname, { wildcard, path: options.path || "" })
    });
  };

  if (cfAccountId && cfZoneId) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(cfAccountId).trim())}/workers/domains?zone_id=${encodeURIComponent(String(cfZoneId).trim())}`;
      const payload = await fetchCloudflareApiJson(url, cfApiToken);
      for (const item of payload?.result || []) {
        pushCandidate(item?.hostname);
      }
    } catch (e) {
      console.log("CF Workers domains lookup failed, will try routes", e);
    }
  }

  if (!candidates.length && cfZoneId) {
    try {
      let page = 1;
      let totalPages = 1;
      do {
        const url = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(cfZoneId).trim())}/workers/routes?page=${page}&per_page=100`;
        const payload = await fetchCloudflareApiJson(url, cfApiToken);
        totalPages = Number(payload?.result_info?.total_pages || payload?.result_info?.totalPages || 1);
        for (const item of payload?.result || []) {
          const info = extractRouteHostnameInfo(item?.pattern);
          if (!info) continue;
          pushCandidate(info.hostname, { wildcard: info.wildcard, path: info.path });
        }
        page += 1;
      } while (page <= totalPages && page <= 5);
    } catch (e) {
      console.log("CF Workers routes lookup failed", e);
    }
  }

  if (candidates.length) {
    candidates.sort((a, b) => (b.score - a.score) || (a.hostname.length - b.hostname.length) || a.hostname.localeCompare(b.hostname));
    return candidates[0].hostname;
  }

  return zoneNameFallback || "未知域名 (请配置 CF 联动)";
}

function sanitizeRuntimeConfig(input = {}) {
  const sanitized = sanitizeConfigWithRules(input, CONFIG_SANITIZE_RULES, { normalizeNodeNameList });
  sanitized.prewarmDepth = normalizePrewarmDepth(sanitized.prewarmDepth);
  sanitized.settingsExperienceMode = String(sanitized.settingsExperienceMode || '').trim().toLowerCase() === 'expert' ? 'expert' : 'novice';
  sanitized.logSearchMode = normalizeLogSearchMode(sanitized.logSearchMode);
  return sanitized;
}

function serializeConfigValue(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (isPlainObject(value)) return JSON.stringify(value);
  if (value === undefined) return "";
  return JSON.stringify(value);
}

function getConfigDiffEntries(prevConfig = {}, nextConfig = {}) {
  const prev = sanitizeRuntimeConfig(prevConfig);
  const next = sanitizeRuntimeConfig(nextConfig);
  const keys = [...new Set([...Object.keys(prev), ...Object.keys(next)])].sort();
  const entries = [];
  for (const key of keys) {
    if (serializeConfigValue(prev[key]) === serializeConfigValue(next[key])) continue;
    entries.push({
      key,
      previousValue: prev[key],
      nextValue: next[key]
    });
  }
  return entries;
}

function classifyCloudflareAnalyticsError(message, options = {}) {
  const raw = String(message || "").trim();
  const lower = raw.toLowerCase();
  const zoneId = String(options.zoneId || "").trim();
  const result = {
    status: "CF 查询失败",
    hint: "Cloudflare 查询失败，请检查 Zone ID、API 令牌与资源范围",
    detail: raw || (zoneId ? `当前查询的 Zone ID: ${zoneId}` : "")
  };
  if (!raw) return result;
  if (lower.includes("unknown field") || lower.includes("unknown enum") || lower.includes("error parsing args")) {
    return {
      status: "Schema 不兼容",
      hint: "当前账号可用的 GraphQL schema 与脚本查询字段不一致",
      detail: raw
    };
  }
  if (lower.includes("cf_graphql_http_429") || lower.includes("rate limit") || lower.includes("too many requests")) {
    return {
      status: "请求过于频繁",
      hint: "Cloudflare GraphQL 已限流，请稍后再试",
      detail: raw
    };
  }
  if (lower.includes("invalid token") || lower.includes("authentication") || lower.includes("cf_graphql_http_401")) {
    return {
      status: "令牌无效",
      hint: "Cloudflare API 令牌无效，或未启用 GraphQL Analytics 访问",
      detail: raw
    };
  }
  if (lower.includes("not authorized") || lower.includes("permission") || lower.includes("forbidden") || lower.includes("unauthorized") || lower.includes("cf_graphql_http_403")) {
    return {
      status: "权限或范围不匹配",
      hint: "令牌权限不足，或 Account / Zone Resources 未覆盖当前查询",
      detail: raw + (zoneId ? ` | Zone ID: ${zoneId}` : "")
    };
  }
  if (lower.includes("zone") && (lower.includes("not found") || lower.includes("invalid") || lower.includes("unknown"))) {
    return {
      status: "Zone ID 无效",
      hint: "Zone ID 无效，或当前令牌无法访问这个 Zone",
      detail: raw + (zoneId ? ` | Zone ID: ${zoneId}` : "")
    };
  }
  if (lower.includes("cf_graphql_http_400")) {
    return {
      status: "请求参数无效",
      hint: "GraphQL 请求参数无效，请检查 Zone ID 与筛选条件",
      detail: raw + (zoneId ? ` | Zone ID: ${zoneId}` : "")
    };
  }
  return result;
}

async function getRuntimeConfig(env) {
  const kv = Auth.getKV(env);
  if (!kv) return {};
  const now = nowMs();
  const cacheNamespace = String(
    env?.__CONFIG_CACHE_NAMESPACE
    || env?.__WORKER_CACHE_SCOPE
    || (env?.ENI_KV ? "ENI_KV" : "")
    || (env?.KV ? "KV" : "")
    || (env?.EMBY_KV ? "EMBY_KV" : "")
    || (env?.EMBY_PROXY ? "EMBY_PROXY" : "")
    || "default"
  );
  if (GLOBALS.ConfigCache && GLOBALS.ConfigCache.exp > now && GLOBALS.ConfigCache.data && GLOBALS.ConfigCache.namespace === cacheNamespace) return GLOBALS.ConfigCache.data;
  let config = {};
  try { config = sanitizeRuntimeConfig(await kv.get(Database.CONFIG_KEY, { type: "json" }) || {}); } catch {}
  GLOBALS.ConfigCache = { data: config, exp: now + 60000, namespace: cacheNamespace };
  return config;
}

function parseCookieHeader(cookieHeader) {
  const map = new Map();
  if (!cookieHeader || typeof cookieHeader !== "string") return map;
  for (const rawPart of cookieHeader.split(";")) {
    const part = rawPart.trim();
    if (!part) continue;
    const eqIndex = part.indexOf("=");
    const key = (eqIndex === -1 ? part : part.slice(0, eqIndex)).trim();
    const value = eqIndex === -1 ? "" : part.slice(eqIndex + 1).trim();
    if (!key) continue;
    map.set(key, value);
  }
  return map;
}

function serializeCookieMap(cookieMap) {
  const parts = [];
  for (const [key, value] of cookieMap.entries()) {
    parts.push(value === "" ? key : `${key}=${value}`);
  }
  return parts.join("; ");
}

function mergeAndSanitizeCookieHeaders(baseCookieHeader, extraCookieHeader, blockedCookieNames = ["auth_token"]) {
  const blocked = new Set(blockedCookieNames.map(name => String(name || "").trim().toLowerCase()).filter(Boolean));
  const merged = parseCookieHeader(baseCookieHeader);
  for (const key of [...merged.keys()]) {
    if (blocked.has(String(key).trim().toLowerCase())) merged.delete(key);
  }
  const extra = parseCookieHeader(extraCookieHeader);
  for (const [key, value] of extra.entries()) {
    if (blocked.has(String(key).trim().toLowerCase())) continue;
    merged.set(key, value);
  }
  const result = serializeCookieMap(merged);
  return result || null;
}

function jsonHeaders(extra = {}) {
  return { ...GLOBALS.SecurityHeaders, ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store, max-age=0", ...extra };
}

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), { status, headers: jsonHeaders(extraHeaders) });
}

function jsonError(code, message, status = 400, details = null, extraHeaders = {}) {
  const body = { ok: false, error: { code, message } };
  if (details !== null && details !== undefined) body.error.details = details;
  return jsonResponse(body, status, extraHeaders);
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function mergeStatusPatch(base, patch) {
  const source = isPlainObject(base) ? base : {};
  const delta = isPlainObject(patch) ? patch : {};
  const merged = { ...source };
  for (const [key, value] of Object.entries(delta)) {
    if (value === undefined) continue;
    if (isPlainObject(value) && isPlainObject(source[key])) merged[key] = mergeStatusPatch(source[key], value);
    else if (isPlainObject(value)) merged[key] = mergeStatusPatch({}, value);
    else merged[key] = value;
  }
  return merged;
}

async function normalizeJsonApiResponse(response) {
  const headers = new Headers(response.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0");
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
  applySecurityHeaders(headers);
  if (response.ok) return new Response(response.body, { status: response.status, headers });
  let payload = null, fallbackText = "";
  try { payload = await response.clone().json(); } catch { fallbackText = await response.text().catch(() => ""); }
  const code = payload?.error?.code || (typeof payload?.error === "string" ? payload.error.toUpperCase() : `HTTP_${response.status}`);
  const message = payload?.error?.message || payload?.message || (typeof payload?.error === "string" ? payload.error : fallbackText || response.statusText || "request_failed");
  const details = payload?.error?.details ?? payload?.details ?? null;
  return jsonError(code, message, response.status || 500, details);
}

const nowMs = () => Date.now();
const sleepMs = (ms) => new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms) || 0)));

function setBoundedMapEntry(map, key, value, maxSize) {
  if (map.has(key)) map.delete(key);
  map.set(key, value);
  const limit = Math.floor(Number(maxSize));
  if (!Number.isFinite(limit) || limit < 1) return;
  while (map.size > limit) {
    const oldestKey = map.keys().next().value;
    if (oldestKey === undefined) break;
    map.delete(oldestKey);
  }
}

function touchMapEntry(map, key) {
  if (!map.has(key)) return undefined;
  const value = map.get(key);
  map.delete(key);
  map.set(key, value);
  return value;
}

function clampIntegerConfig(value, fallback, min, max) {
  let num;
  if (typeof value === "number") num = value;
  else if (typeof value === "string") {
    const normalized = value.trim();
    if (!/^-?\d+$/.test(normalized)) return fallback;
    num = Number(normalized);
  } else {
    return fallback;
  }
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(num)));
}

function clampNumberConfig(value, fallback, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

const CONFIG_ALLOWED_FIELDS = [
  "uiRadiusPx",
  "settingsExperienceMode",
  "enableH2",
  "enableH3",
  "peakDowngrade",
  "protocolFallback",
  "enablePrewarm",
  "prewarmDepth",
  "prewarmCacheTtl",
  "prewarmPrefetchBytes",
  "disablePrewarmPrefetch",
  "directStaticAssets",
  "directHlsDash",
  "sourceSameOriginProxy",
  "forceExternalProxy",
  "wangpandirect",
  "sourceDirectNodes",
  "pingTimeout",
  "pingCacheMinutes",
  "nodePanelPingAutoSort",
  "upstreamTimeoutMs",
  "upstreamRetryAttempts",
  "geoAllowlist",
  "geoBlocklist",
  "ipBlacklist",
  "rateLimitRpm",
  "cacheTtlImages",
  "corsOrigins",
  "logSearchMode",
  "logRetentionDays",
  "logWriteDelayMinutes",
  "logFlushCountThreshold",
  "logBatchChunkSize",
  "logBatchRetryCount",
  "logBatchRetryBackoffMs",
  "scheduledLeaseMs",
  "tgBotToken",
  "tgChatId",
  "tgAlertDroppedBatchThreshold",
  "tgAlertFlushRetryThreshold",
  "tgAlertOnScheduledFailure",
  "tgAlertCooldownMinutes",
  "jwtExpiryDays",
  "cfAccountId",
  "cfZoneId",
  "cfApiToken"
];

const CONFIG_ALIAS_FIELDS = {
  sourceDirectNodes: ["directSourceNodes", "nodeDirectList"]
};

const CONFIG_DEFAULT_TRUE_FIELDS = [
  "peakDowngrade",
  "protocolFallback",
  "enablePrewarm",
  "sourceSameOriginProxy",
  "forceExternalProxy"
];

const CONFIG_DEFAULT_FALSE_FIELDS = [
  "enableH2",
  "enableH3",
  "tgAlertOnScheduledFailure",
  "directStaticAssets",
  "directHlsDash",
  "disablePrewarmPrefetch",
  "nodePanelPingAutoSort"
];

const CONFIG_SANITIZE_RULES = {
  allowedFields: CONFIG_ALLOWED_FIELDS,
  aliasFields: CONFIG_ALIAS_FIELDS,
  trimFields: ["tgBotToken", "tgChatId", "cfAccountId", "cfZoneId", "cfApiToken", "corsOrigins", "geoAllowlist", "geoBlocklist", "ipBlacklist", "wangpandirect", "prewarmDepth", "logSearchMode"],
  arrayNormalizers: {
    sourceDirectNodes: "nodeNameList"
  },
  integerFields: {
    logRetentionDays: { fallback: Config.Defaults.LogRetentionDays, min: 1, max: Config.Defaults.LogRetentionDaysMax },
    logFlushCountThreshold: { fallback: Config.Defaults.LogFlushCountThreshold, min: 1, max: 5000 },
    logBatchChunkSize: { fallback: Config.Defaults.LogBatchChunkSize, min: 1, max: 100 },
    logBatchRetryCount: { fallback: Config.Defaults.LogBatchRetryCount, min: 0, max: 5 },
    logBatchRetryBackoffMs: { fallback: Config.Defaults.LogBatchRetryBackoffMs, min: 0, max: 5000 },
    scheduledLeaseMs: { fallback: Config.Defaults.ScheduledLeaseMs, min: Config.Defaults.ScheduledLeaseMinMs, max: 15 * 60 * 1000 },
    uiRadiusPx: { fallback: Config.Defaults.UiRadiusPx, min: 0, max: 48 },
    tgAlertDroppedBatchThreshold: { fallback: Config.Defaults.TgAlertDroppedBatchThreshold, min: 0, max: 5000 },
    tgAlertFlushRetryThreshold: { fallback: Config.Defaults.TgAlertFlushRetryThreshold, min: 0, max: 10 },
    tgAlertCooldownMinutes: { fallback: Config.Defaults.TgAlertCooldownMinutes, min: 1, max: 1440 },
    cacheTtlImages: { fallback: Config.Defaults.CacheTtlImagesDays, min: 0, max: 365 },
    pingTimeout: { fallback: Config.Defaults.PingTimeoutMs, min: 1000, max: 180000 },
    pingCacheMinutes: { fallback: Config.Defaults.PingCacheMinutes, min: 0, max: 1440 },
    upstreamTimeoutMs: { fallback: Config.Defaults.UpstreamTimeoutMs, min: 0, max: 180000 },
    upstreamRetryAttempts: { fallback: Config.Defaults.UpstreamRetryAttempts, min: 0, max: 3 },
    prewarmCacheTtl: { fallback: Config.Defaults.PrewarmCacheTtl, min: 0, max: 3600 },
    prewarmPrefetchBytes: { fallback: Config.Defaults.PrewarmPrefetchBytes, min: 0, max: 64 * 1024 * 1024 }
  },
  numberFields: {
    logWriteDelayMinutes: { fallback: Config.Defaults.LogFlushDelayMinutes, min: 0, max: 1440 }
  },
  booleanTrueFields: CONFIG_DEFAULT_TRUE_FIELDS,
  booleanFalseFields: CONFIG_DEFAULT_FALSE_FIELDS
};

function applyConfigRuleAliases(config = {}, rules = {}) {
  for (const [targetKey, sourceKeys] of Object.entries(rules.aliasFields || {})) {
    if (config[targetKey] !== undefined && config[targetKey] !== null) continue;
    if (!Array.isArray(sourceKeys)) continue;
    for (const sourceKey of sourceKeys) {
      if (config[sourceKey] === undefined || config[sourceKey] === null) continue;
      config[targetKey] = config[sourceKey];
      break;
    }
  }
  return config;
}

function filterConfigAllowedFields(config = {}, rules = {}) {
  const allowedFields = Array.isArray(rules.allowedFields) ? rules.allowedFields : [];
  if (!allowedFields.length) return config;
  const filtered = {};
  for (const key of allowedFields) {
    if (!Object.prototype.hasOwnProperty.call(config, key)) continue;
    filtered[key] = config[key];
  }
  return filtered;
}

function sanitizeConfigWithRules(input = {}, rules = CONFIG_SANITIZE_RULES, helpers = {}) {
  let config = input && typeof input === "object" && !Array.isArray(input) ? { ...input } : {};
  config = applyConfigRuleAliases(config, rules);
  for (const key of rules.trimFields || []) {
    if (config[key] === undefined || config[key] === null) continue;
    config[key] = String(config[key]).trim();
  }
  for (const [key, normalizerName] of Object.entries(rules.arrayNormalizers || {})) {
    if (!Array.isArray(config[key])) continue;
    if (normalizerName === "nodeNameList" && typeof helpers.normalizeNodeNameList === "function") {
      config[key] = helpers.normalizeNodeNameList(config[key]);
    }
  }
  for (const [key, rule] of Object.entries(rules.integerFields || {})) {
    config[key] = clampIntegerConfig(config[key], rule.fallback, rule.min, rule.max);
  }
  for (const [key, rule] of Object.entries(rules.numberFields || {})) {
    config[key] = clampNumberConfig(config[key], rule.fallback, rule.min, rule.max);
  }
  for (const key of rules.booleanTrueFields || []) {
    config[key] = config[key] !== false;
  }
  for (const key of rules.booleanFalseFields || []) {
    config[key] = config[key] === true;
  }
  return filterConfigAllowedFields(config, rules);
}

async function runWithConcurrency(items, limit, worker) {
  const results = [], executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => worker(item));
    results.push(p);
    if (limit <= items.length) {
      const e = p.catch(() => {}).then(() => {
        const index = executing.indexOf(e);
        if (index >= 0) executing.splice(index, 1);
      });
      executing.push(e);
      if (executing.length >= limit) await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// ============================================================================
// 1. 认证模块 (AUTH MODULE)
// ============================================================================
const Auth = {
  getKV(env) { return env.ENI_KV || env.KV || env.EMBY_KV || env.EMBY_PROXY; },
  async handleLogin(request, env) {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const kv = this.getKV(env);
    const adminCookiePath = getAdminCookiePath(env);
    
    const config = await getRuntimeConfig(env);
    const jwtDays = Math.max(1, parseInt(config.jwtExpiryDays) || 30);
    const expSeconds = jwtDays * 86400;
    
    const safeKVGet = async (key) => kv ? await kv.get(key).catch(e => null) : null;
    const safeKVPut = async (key, val, opts) => kv ? await kv.put(key, val, opts).catch(e => null) : null;
    const safeKVDelete = async (key) => kv ? await kv.delete(key).catch(e => null) : null;
    try {
      const failKey = `fail:${ip}`;
      const prev = await safeKVGet(failKey);
      const failCount = prev ? parseInt(prev) : 0;
      if (failCount >= Config.Defaults.MaxLoginAttempts) return jsonError("TOO_MANY_ATTEMPTS", "账户已锁定，请稍后再试", 429);
      let password = "";
      const ct = request.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const body = await request.json();
        password = (body.password || "").trim();
      }
      if (!env.JWT_SECRET) return jsonError("SERVER_MISCONFIGURED", "JWT_SECRET 未配置", 503);
      if (!env.ADMIN_PASS) return jsonError("SERVER_MISCONFIGURED", "ADMIN_PASS 未配置", 503);
      if (password && password === env.ADMIN_PASS) {
        await safeKVDelete(failKey);
        const jwt = await this.generateJwt(env.JWT_SECRET, expSeconds);
        return jsonResponse({ ok: true, expiresIn: expSeconds }, 200, { "Set-Cookie": `auth_token=${jwt}; Path=${adminCookiePath}; Max-Age=${expSeconds}; HttpOnly; Secure; SameSite=Strict` });
      }
      await safeKVPut(failKey, (failCount + 1).toString(), { expirationTtl: Config.Defaults.LoginLockDuration });
      return jsonResponse({ ok: false, error: { code: "INVALID_PASSWORD", message: "密码错误" }, remain: Math.max(0, Config.Defaults.MaxLoginAttempts - (failCount + 1)) }, 401);
    } catch (e) {
      return jsonError("INVALID_REQUEST", "请求无效", 400, { reason: e.message });
    }
  },
  async verifyRequest(request, env) {
    try {
      const secret = env.JWT_SECRET;
      if (!secret) return false;
      const auth = request.headers.get("Authorization") || "";
      let token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token) {
        const match = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)auth_token=([^;]+)/);
        token = match ? match[1] : null;
      }
      if (!token) return false;
      return await this.verifyJwt(token, secret);
    } catch { return false; }
  },
  async generateJwt(secret, expiresIn) {
    const encHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const encPayload = btoa(JSON.stringify({ sub: "admin", exp: Math.floor(Date.now() / 1000) + expiresIn })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const signature = await this.sign(secret, `${encHeader}.${encPayload}`);
    return `${encHeader}.${encPayload}.${signature}`;
  },
  async verifyJwt(token, secret) {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    if (parts[2] !== await this.sign(secret, `${parts[0]}.${parts[1]}`)) return false;
    try { return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))).exp > Math.floor(Date.now() / 1000); } catch { return false; }
  },
  async sign(secret, data) {
    const enc = new TextEncoder(), now = Date.now();
    let entry = GLOBALS.CryptoKeyCache.get(secret);
    if (!entry || entry.exp <= now) {
      const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      entry = { key, exp: now + Config.Defaults.CryptoKeyCacheTTL * 1000 };
      setBoundedMapEntry(GLOBALS.CryptoKeyCache, secret, entry, Config.Defaults.CryptoKeyCacheMax);
    } else {
      setBoundedMapEntry(GLOBALS.CryptoKeyCache, secret, entry, Config.Defaults.CryptoKeyCacheMax);
    }
    const signature = await crypto.subtle.sign("HMAC", entry.key, enc.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
};

// ============================================================================
// 2. 数据库与缓存模块 (DATABASE & CACHE MODULE)
// ============================================================================
const CacheManager = {
  async getNodesList(env, ctx) {
    if (GLOBALS.NodesListCache && GLOBALS.NodesListCache.exp > nowMs()) return GLOBALS.NodesListCache.data;
    const kv = Database.getKV(env);
    if (!kv) return [];
    let nodeNames = GLOBALS.NodesIndexCache?.exp > nowMs() ? GLOBALS.NodesIndexCache.data : null;
    if (!nodeNames) {
      try {
        nodeNames = await kv.get(Database.NODES_INDEX_KEY, { type: "json" });
        if (Array.isArray(nodeNames)) GLOBALS.NodesIndexCache = { data: nodeNames, exp: nowMs() + 60000 };
      } catch (e) {}
    }
    if (!nodeNames || !Array.isArray(nodeNames)) {
      try {
        const list = await kv.list({ prefix: "node:" });
        nodeNames = list.keys.map(k => k.name.replace("node:", ""));
        if (ctx && nodeNames.length > 0) ctx.waitUntil(kv.put(Database.NODES_INDEX_KEY, JSON.stringify(nodeNames)));
        GLOBALS.NodesIndexCache = { data: nodeNames, exp: nowMs() + 60000 };
      } catch (e) { return []; }
    }
    const nodes = await runWithConcurrency(nodeNames, Config.Defaults.NodesReadConcurrency, async (name) => {
      try {
        const cached = GLOBALS.NodeCache.get(name);
        let val = null;
        if (cached?.exp > nowMs()) {
          touchMapEntry(GLOBALS.NodeCache, name);
          val = cached.data;
        }
        if (!val) val = await kv.get(`${Database.PREFIX}${name}`, { type: "json" });
        if (!val) return null;
        const { data: normalized, changed } = Database.normalizeNode(name, val);
        if (changed && ctx) ctx.waitUntil(kv.put(`${Database.PREFIX}${name}`, JSON.stringify(normalized)));
        setBoundedMapEntry(GLOBALS.NodeCache, name, { data: normalized, exp: nowMs() + Config.Defaults.CacheTTL }, Config.Defaults.NodeCacheMax);
        return { name, ...normalized };
      } catch { return null; }
    });
    const validNodes = nodes.filter(Boolean);
    GLOBALS.NodesListCache = { data: validNodes, exp: nowMs() + 60000 };
    return validNodes;
  },
  async invalidateList(ctx) { GLOBALS.NodesListCache = null; },
  maybeCleanup() {
    const now = nowMs();
    if ((now - (GLOBALS.CleanupState.lastRunAt || 0)) < Config.Defaults.CleanupMinIntervalMs) return;
    GLOBALS.CleanupState.lastRunAt = now;
    const budget = Config.Defaults.CleanupBudgetMs;
    const chunkSize = Config.Defaults.CleanupChunkSize;
    const state = GLOBALS.CleanupState;
    const iterators = state.iterators || (state.iterators = { node: null, crypto: null, rate: null, log: null });
    const start = now;
    const cleanMap = (map, shouldDelete, iteratorKey) => {
      let iterator = iterators[iteratorKey];
      if (!iterator) {
        iterator = map.entries();
        iterators[iteratorKey] = iterator;
      }
      let scanned = 0;
      while (scanned < chunkSize && (nowMs() - start) < budget) {
        const next = iterator.next();
        if (next.done) {
          iterators[iteratorKey] = null;
          break;
        }
        scanned += 1;
        const [k, v] = next.value;
        if (!map.has(k)) continue;
        if (shouldDelete(v, now)) map.delete(k);
      }
    };
    if (state.phase === 0) {
      cleanMap(GLOBALS.NodeCache, v => v?.exp && v.exp < now, "node");
      state.phase = 1;
    } else if (state.phase === 1) {
      cleanMap(GLOBALS.CryptoKeyCache, v => v?.exp && v.exp < now, "crypto");
      state.phase = 2;
    } else if (state.phase === 2) {
      cleanMap(GLOBALS.RateLimitCache, v => !v || v.resetAt < now, "rate");
      state.phase = 3;
    } else {
      cleanMap(GLOBALS.LogDedupe, v => !v || (now - v) > 300000, "log");
      state.phase = 0;
    }
  }
};

const Database = {
  PREFIX: "node:", CONFIG_KEY: "sys:theme", NODES_INDEX_KEY: "sys:nodes_index:v1", OPS_STATUS_KEY: "sys:ops_status:v1",
  SCHEDULED_LOCK_KEY: "sys:scheduled_lock:v1",
  CONFIG_SNAPSHOTS_KEY: "sys:config_snapshots:v1",
  DNS_RECORD_HISTORY_PREFIX: "sys:dns_record_history:v1:",
  TELEGRAM_ALERT_STATE_KEY: "sys:telegram_alert_state:v1",
  SYS_STATUS_TABLE: "sys_status",
  LOGS_TABLE: "proxy_logs",
  LOGS_FTS_TABLE: "proxy_logs_fts",
  LOGS_FTS_INSERT_TRIGGER: "proxy_logs_fts_ai",
  OPS_STATUS_DB_SCOPE_ROOT: "ops_status:root",
  OPS_STATUS_SECTION_KEYS: {
    log: "sys:ops_status:log:v1",
    scheduled: "sys:ops_status:scheduled:v1"
  },
  getKV(env) { return Auth.getKV(env); },
  getDB(env) { return env.DB || env.D1 || env.PROXY_LOGS; },
  async hasLogsFtsTable(db) {
    if (!db) return false;
    try {
      const row = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(this.LOGS_FTS_TABLE).first();
      return String(row?.name || "") === this.LOGS_FTS_TABLE;
    } catch {
      return false;
    }
  },
  async ensureLogsBaseSchema(db) {
    if (!db) return false;
    await db.prepare(`CREATE TABLE IF NOT EXISTS ${this.LOGS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, created_at TEXT NOT NULL)`).run();
    let existingColumns = new Set();
    try {
      const schemaRows = await db.prepare(`PRAGMA table_info(${this.LOGS_TABLE})`).all();
      existingColumns = new Set((schemaRows?.results || []).map(row => String(row?.name || "").toLowerCase()).filter(Boolean));
    } catch {}
    if (!existingColumns.has("category")) {
      await db.prepare(`ALTER TABLE ${this.LOGS_TABLE} ADD COLUMN category TEXT DEFAULT 'api'`).run();
      existingColumns.add("category");
    }
    if (!existingColumns.has("error_detail")) {
      await db.prepare(`ALTER TABLE ${this.LOGS_TABLE} ADD COLUMN error_detail TEXT`).run();
    }
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_timestamp ON ${this.LOGS_TABLE} (timestamp)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_client_ip ON ${this.LOGS_TABLE} (client_ip)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_node_time ON ${this.LOGS_TABLE} (node_name, timestamp)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_category ON ${this.LOGS_TABLE} (category)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_status_time ON ${this.LOGS_TABLE} (status_code, timestamp)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time ON ${this.LOGS_TABLE} (category, timestamp)`).run();
    return true;
  },
  async dropLogsFtsSyncTriggers(db) {
    if (!db) return 0;
    let dropped = 0;
    let triggerRows = [];
    try {
      const triggerResult = await db.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(this.LOGS_TABLE).all();
      triggerRows = triggerResult?.results || [];
    } catch {}
    const ftsTableLower = this.LOGS_FTS_TABLE.toLowerCase();
    const insertTriggerLower = this.LOGS_FTS_INSERT_TRIGGER.toLowerCase();
    const legacySyncTriggerNames = new Set([
      insertTriggerLower,
      `${this.LOGS_TABLE}_ai`,
      `${this.LOGS_TABLE}_au`,
      `${this.LOGS_TABLE}_ad`,
      `${this.LOGS_FTS_TABLE}_ai`,
      `${this.LOGS_FTS_TABLE}_au`,
      `${this.LOGS_FTS_TABLE}_ad`
    ].map(name => String(name || "").toLowerCase()));
    for (const row of triggerRows) {
      const name = String(row?.name || "").trim();
      if (!name) continue;
      const lowerName = name.toLowerCase();
      const normalizedSql = normalizeSqlIdentifierSearchText(row?.sql || "");
      const touchesFts = legacySyncTriggerNames.has(lowerName)
        || normalizedSql.includes(ftsTableLower);
      if (!touchesFts) continue;
      await db.prepare(`DROP TRIGGER IF EXISTS ${quoteSqlIdentifier(name)}`).run();
      dropped += 1;
    }
    return dropped;
  },
  async rebuildLogsFts(db) {
    if (!db || !await this.hasLogsFtsTable(db)) return false;
    await db.prepare(`INSERT INTO ${this.LOGS_FTS_TABLE}(${this.LOGS_FTS_TABLE}) VALUES('rebuild')`).run();
    return true;
  },
  async ensureLogsFtsSchema(db, options = {}) {
    if (!db) return { migratedRows: 0, droppedTriggers: 0, rebuilt: false, recreated: false };
    const forceRecreate = options.forceRecreate === true;
    await this.ensureLogsBaseSchema(db);
    let recreated = false;
    let droppedTriggers = 0;
    if (forceRecreate) {
      droppedTriggers = await this.dropLogsFtsSyncTriggers(db);
      await db.prepare(`DROP TABLE IF EXISTS ${this.LOGS_FTS_TABLE}`).run();
      recreated = true;
    }
    await db.prepare(`CREATE VIRTUAL TABLE IF NOT EXISTS ${this.LOGS_FTS_TABLE} USING fts5(node_name, request_path, user_agent, error_detail, content='${this.LOGS_TABLE}', content_rowid='id', tokenize='unicode61')`).run();
    droppedTriggers += await this.dropLogsFtsSyncTriggers(db);
    await db.prepare(`CREATE TRIGGER IF NOT EXISTS ${this.LOGS_FTS_INSERT_TRIGGER} AFTER INSERT ON ${this.LOGS_TABLE} BEGIN
      INSERT INTO ${this.LOGS_FTS_TABLE}(rowid, node_name, request_path, user_agent, error_detail)
      VALUES (new.id, new.node_name, new.request_path, COALESCE(new.user_agent, ''), COALESCE(new.error_detail, ''));
    END;`).run();
    const migratedRows = (await db.prepare(`SELECT COUNT(*) as total FROM ${this.LOGS_TABLE}`).first())?.total || 0;
    // 历史数据迁移 SQL：把现有 proxy_logs 全量重建进 FTS5 虚拟表。
    await db.prepare(`INSERT INTO ${this.LOGS_FTS_TABLE}(${this.LOGS_FTS_TABLE}) VALUES('rebuild')`).run();
    return { migratedRows, droppedTriggers, rebuilt: true, recreated };
  },
  resolveOpsStatusStores(envOrStore) {
    if (envOrStore && typeof envOrStore.prepare === "function") {
      return { kv: null, db: envOrStore };
    }
    if (envOrStore && typeof envOrStore.get === "function") {
      return { kv: envOrStore, db: null };
    }
    return {
      kv: this.getKV(envOrStore),
      db: this.getDB(envOrStore)
    };
  },
  getOpsStatusDbScope(sectionName = "") {
    return sectionName ? `ops_status:${sectionName}` : this.OPS_STATUS_DB_SCOPE_ROOT;
  },
  async ensureSysStatusTable(db) {
    if (!db || typeof db.prepare !== "function") return false;
    let initTask = GLOBALS.OpsStatusDbReady.get(db);
    if (!initTask) {
      initTask = (async () => {
        try {
          await db.prepare(`CREATE TABLE IF NOT EXISTS ${this.SYS_STATUS_TABLE} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`).run();
          await db.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_status_updated_at ON ${this.SYS_STATUS_TABLE} (updated_at DESC)`).run();
          return true;
        } catch (error) {
          console.warn("sys_status init failed", error);
          return false;
        }
      })();
      GLOBALS.OpsStatusDbReady.set(db, initTask);
    }
    return await initTask;
  },
  async getOpsStatusPayloadFromDb(db, scope) {
    if (!db || !scope) return null;
    const ready = await this.ensureSysStatusTable(db);
    if (!ready) return null;
    try {
      const row = await db.prepare(`SELECT payload FROM ${this.SYS_STATUS_TABLE} WHERE scope = ? LIMIT 1`).bind(scope).first();
      if (!row?.payload) return null;
      return typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
    } catch {
      return null;
    }
  },
  async putOpsStatusPayloadToDb(db, scope, payload, updatedAtMs) {
    if (!db || !scope || !payload || typeof payload !== "object") return false;
    const ready = await this.ensureSysStatusTable(db);
    if (!ready) return false;
    await db.prepare(`INSERT INTO ${this.SYS_STATUS_TABLE} (scope, payload, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(scope) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).bind(scope, JSON.stringify(payload), Number(updatedAtMs) || nowMs()).run();
    return true;
  },
  getOpsStatusSectionEntries() {
    return Object.entries(this.OPS_STATUS_SECTION_KEYS);
  },
  async getOpsStatusRootFromStores(stores) {
    const kv = stores?.kv || null;
    const db = stores?.db || null;
    if (db) {
      const dbRoot = await this.getOpsStatusPayloadFromDb(db, this.getOpsStatusDbScope());
      if (dbRoot && typeof dbRoot === "object") return dbRoot;
    }
    if (!kv) return {};
    try { return await kv.get(this.OPS_STATUS_KEY, { type: "json" }) || {}; } catch { return {}; }
  },
  async getOpsStatusRoot(envOrStore) {
    return this.getOpsStatusRootFromStores(this.resolveOpsStatusStores(envOrStore));
  },
  async getOpsStatusSectionFromStores(stores, sectionName) {
    const kv = stores?.kv || null;
    const db = stores?.db || null;
    if (!sectionName) return {};
    const sectionKey = this.OPS_STATUS_SECTION_KEYS[sectionName];
    if (!sectionKey) return {};
    const loadSectionValue = async () => {
      if (db) {
        const dbValue = await this.getOpsStatusPayloadFromDb(db, this.getOpsStatusDbScope(sectionName));
        if (dbValue && typeof dbValue === "object") return dbValue;
      }
      if (!kv) return null;
      try {
        return await kv.get(sectionKey, { type: "json" });
      } catch {
        return null;
      }
    };
    const [root, sectionValue] = await Promise.all([
      this.getOpsStatusRootFromStores(stores),
      loadSectionValue()
    ]);
    const rootSection = root && typeof root[sectionName] === "object" ? root[sectionName] : {};
    return mergeStatusPatch(rootSection, sectionValue && typeof sectionValue === "object" ? sectionValue : {});
  },
  async getOpsStatusSection(envOrStore, sectionName) {
    return this.getOpsStatusSectionFromStores(this.resolveOpsStatusStores(envOrStore), sectionName);
  },
  async getOpsStatusFromStores(stores) {
    const kv = stores?.kv || null;
    const db = stores?.db || null;
    if (!kv && !db) return {};
    const root = await this.getOpsStatusRootFromStores(stores);
    const status = root && typeof root === "object" ? { ...root } : {};
    let latestUpdatedAt = typeof status.updatedAt === "string" ? status.updatedAt : "";
    const sectionEntries = await Promise.all(this.getOpsStatusSectionEntries().map(async ([sectionName]) => {
      const sectionValue = await this.getOpsStatusSectionFromStores(stores, sectionName);
      return [sectionName, sectionValue];
    }));
    for (const [sectionName, sectionValue] of sectionEntries) {
      if (!sectionValue || typeof sectionValue !== "object") continue;
      if (!Object.keys(sectionValue).length) continue;
      status[sectionName] = mergeStatusPatch(status[sectionName], sectionValue);
      if (typeof sectionValue.updatedAt === "string" && sectionValue.updatedAt > latestUpdatedAt) latestUpdatedAt = sectionValue.updatedAt;
    }
    if (latestUpdatedAt) status.updatedAt = latestUpdatedAt;
    return status;
  },
  async getOpsStatus(envOrStore) {
    return this.getOpsStatusFromStores(this.resolveOpsStatusStores(envOrStore));
  },
  getLogClearEpochMsFromStatus(logStatus) {
    const epoch = Number(logStatus?.clearEpochMs);
    return Number.isFinite(epoch) && epoch > 0 ? Math.floor(epoch) : 0;
  },
  async getLogClearEpochMs(envOrStore) {
    const logStatus = await this.getOpsStatusSection(envOrStore, "log");
    const epoch = this.getLogClearEpochMsFromStatus(logStatus);
    if (epoch > GLOBALS.LogClearEpochMs) GLOBALS.LogClearEpochMs = epoch;
    return epoch;
  },
  async patchOpsStatus(envOrKv, patch, ctx = null) {
    const stores = this.resolveOpsStatusStores(envOrKv);
    if (!stores.kv && !stores.db) return {};
    const patchObject = patch && typeof patch === "object" ? patch : {};
    const sectionPatches = [];
    const rootPatch = {};
    for (const [key, value] of Object.entries(patchObject)) {
      if (this.OPS_STATUS_SECTION_KEYS[key]) sectionPatches.push([key, value]);
      else rootPatch[key] = value;
    }
    const runPatch = async () => {
      const nowIso = new Date().toISOString();
      const updatedAtMs = nowMs();
      const useDb = stores.db && await this.ensureSysStatusTable(stores.db);
      if (Object.keys(rootPatch).length > 0) {
        const currentRoot = await this.getOpsStatusRootFromStores(stores);
        const nextRoot = mergeStatusPatch(currentRoot, rootPatch);
        nextRoot.updatedAt = nowIso;
        if (useDb) await this.putOpsStatusPayloadToDb(stores.db, this.getOpsStatusDbScope(), nextRoot, updatedAtMs);
        else if (stores.kv) await stores.kv.put(this.OPS_STATUS_KEY, JSON.stringify(nextRoot));
      }
      for (const [sectionName, sectionPatch] of sectionPatches) {
        const currentSection = await this.getOpsStatusSectionFromStores(stores, sectionName);
        const nextSection = mergeStatusPatch(currentSection, sectionPatch);
        nextSection.updatedAt = nowIso;
        if (useDb) await this.putOpsStatusPayloadToDb(stores.db, this.getOpsStatusDbScope(sectionName), nextSection, updatedAtMs);
        else if (stores.kv) await stores.kv.put(this.OPS_STATUS_SECTION_KEYS[sectionName], JSON.stringify(nextSection));
      }
      return this.getOpsStatusFromStores(stores);
    };
    const task = Promise.resolve(GLOBALS.OpsStatusWriteChain)
      .catch(() => {})
      .then(runPatch);
    GLOBALS.OpsStatusWriteChain = task.catch(() => {});
    if (ctx) ctx.waitUntil(task);
    else await task;
    return task;
  },
  async tryAcquireScheduledLease(kv, options = {}) {
    if (!kv) return { acquired: false, reason: "kv_unavailable" };
    const now = nowMs();
    const leaseMs = Math.max(Config.Defaults.ScheduledLeaseMinMs, Number(options.leaseMs) || Config.Defaults.ScheduledLeaseMs);
    const token = String(options.token || `${now}-${Math.random().toString(36).slice(2, 10)}`);
    const owner = String(options.owner || "scheduled");
    let current = null;
    try {
      current = await kv.get(this.SCHEDULED_LOCK_KEY, { type: "json" });
    } catch {}
    if (current && Number(current.expiresAt) > now) {
      return { acquired: false, reason: "lease_held", lock: current };
    }
    const nextLock = {
      token,
      owner,
      acquiredAt: new Date(now).toISOString(),
      expiresAt: now + leaseMs
    };
    await kv.put(this.SCHEDULED_LOCK_KEY, JSON.stringify(nextLock));
    let confirmed = null;
    try {
      confirmed = await kv.get(this.SCHEDULED_LOCK_KEY, { type: "json" });
    } catch {}
    if (confirmed && confirmed.token === token) return { acquired: true, leaseMs, lock: confirmed };
    return { acquired: false, reason: "lease_contended", lock: confirmed };
  },
  async renewScheduledLease(kv, token, leaseMs, options = {}) {
    if (!kv || !token) return null;
    const now = nowMs();
    const safeLeaseMs = Math.max(Config.Defaults.ScheduledLeaseMinMs, Number(leaseMs) || Config.Defaults.ScheduledLeaseMs);
    try {
      const current = await kv.get(this.SCHEDULED_LOCK_KEY, { type: "json" });
      if (!current || current.token !== token) return null;
      const nextLock = {
        ...current,
        owner: String(options.owner || current.owner || "scheduled"),
        renewedAt: new Date(now).toISOString(),
        expiresAt: now + safeLeaseMs
      };
      await kv.put(this.SCHEDULED_LOCK_KEY, JSON.stringify(nextLock));
      const confirmed = await kv.get(this.SCHEDULED_LOCK_KEY, { type: "json" });
      return confirmed && confirmed.token === token ? confirmed : null;
    } catch {
      return null;
    }
  },
  async releaseScheduledLease(kv, token) {
    if (!kv || !token) return false;
    try {
      const current = await kv.get(this.SCHEDULED_LOCK_KEY, { type: "json" });
      if (!current || current.token !== token) return false;
      await kv.delete(this.SCHEDULED_LOCK_KEY);
      return true;
    } catch {
      return false;
    }
  },
  normalizeNodeIndex(index = []) {
    return [...new Set((Array.isArray(index) ? index : []).map(name => String(name || "").toLowerCase().trim()).filter(Boolean))];
  },
  async getNodesIndex(kv) {
    if (GLOBALS.NodesIndexCache?.exp > nowMs() && Array.isArray(GLOBALS.NodesIndexCache.data)) {
      return [...GLOBALS.NodesIndexCache.data];
    }
    if (!kv) return [];
    const index = this.normalizeNodeIndex(await kv.get(this.NODES_INDEX_KEY, { type: "json" }) || []);
    GLOBALS.NodesIndexCache = { data: index, exp: nowMs() + 60000 };
    return [...index];
  },
  /**
   * @param {string | string[]} [nodeNames=[]]
   * @param {{ invalidateList?: boolean }} [options={}]
   */
  invalidateNodeCaches(nodeNames = [], options = {}) {
    for (const rawName of Array.isArray(nodeNames) ? nodeNames : [nodeNames]) {
      const name = String(rawName || "").toLowerCase().trim();
      if (!name) continue;
      GLOBALS.NodeCache.delete(name);
    }
    if (options.invalidateList) GLOBALS.NodesListCache = null;
  },
  /**
   * @param {string[]} index
   * @param {PersistNodesIndexOptions} [options={}]
   */
  async persistNodesIndex(index, options = {}) {
    const { kv, ctx, invalidateList = false } = options;
    const normalizedIndex = this.normalizeNodeIndex(index);
    GLOBALS.NodesIndexCache = { data: normalizedIndex, exp: nowMs() + 60000 };
    if (invalidateList) GLOBALS.NodesListCache = null;
    if (!kv) return normalizedIndex;
    const task = kv.put(this.NODES_INDEX_KEY, JSON.stringify(normalizedIndex));
    if (ctx) ctx.waitUntil(task);
    else await task;
    return normalizedIndex;
  },
  getDnsRecordHistoryKey(zoneId, recordId) {
    const safeZoneId = encodeURIComponent(String(zoneId || "").trim() || "default");
    const safeRecordId = encodeURIComponent(String(recordId || "").trim() || "unknown");
    return `${this.DNS_RECORD_HISTORY_PREFIX}${safeZoneId}:${safeRecordId}`;
  },
  getDnsHostHistoryRecordId(hostname) {
    const normalizedHost = normalizeHostnameText(hostname);
    return `host:${normalizedHost || "unknown"}`;
  },
  normalizeDnsHistoryValueKey(type, content) {
    return `${String(type || "").trim().toUpperCase()}::${String(content || "").trim().toLowerCase()}`;
  },
  normalizeDnsRecordHistoryEntry(entry = {}) {
    /** @type {DnsRecordHistoryEntryLike} */
    const input = entry && typeof entry === "object" ? entry : {};
    const type = String(input.type || "").trim().toUpperCase();
    const content = String(input.content || "").trim();
    const rawSavedAt = String(input.savedAt || input.updatedAt || input.createdAt || "").trim();
    const parsedSavedAt = rawSavedAt ? new Date(rawSavedAt) : null;
    const savedAt = parsedSavedAt && !Number.isNaN(parsedSavedAt.getTime())
      ? parsedSavedAt.toISOString()
      : new Date().toISOString();
    return {
      id: String(input.id || `dns-hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      name: String(input.name || "").trim(),
      type,
      content,
      savedAt,
      actor: String(input.actor || "admin").trim() || "admin",
      source: String(input.source || "ui").trim() || "ui",
      requestHost: normalizeHostnameText(input.requestHost)
    };
  },
  normalizeDnsRecordHistory(entries = []) {
    const history = [];
    const seen = new Set();
    for (const rawEntry of Array.isArray(entries) ? entries : []) {
      const entry = this.normalizeDnsRecordHistoryEntry(rawEntry);
      if (entry.type !== "CNAME" || !entry.content) continue;
      const historyKey = this.normalizeDnsHistoryValueKey(entry.type, entry.content);
      if (seen.has(historyKey)) continue;
      seen.add(historyKey);
      history.push(entry);
      if (history.length >= Config.Defaults.DnsHistoryLimit) break;
    }
    return history;
  },
  async getDnsRecordHistory(kv, zoneId, recordId) {
    if (!kv || !zoneId || !recordId) return [];
    try {
      const stored = await kv.get(this.getDnsRecordHistoryKey(zoneId, recordId), { type: "json" });
      return this.normalizeDnsRecordHistory(stored);
    } catch {
      return [];
    }
  },
  async persistDnsRecordHistory(kv, zoneId, recordId, entries) {
    if (!kv || !zoneId || !recordId) return [];
    const normalizedHistory = this.normalizeDnsRecordHistory(entries);
    await kv.put(this.getDnsRecordHistoryKey(zoneId, recordId), JSON.stringify(normalizedHistory));
    return normalizedHistory;
  },
  async recordDnsRecordHistory(kv, zoneId, recordId, entry = {}) {
    if (!kv || !zoneId || !recordId) return [];
    const currentHistory = await this.getDnsRecordHistory(kv, zoneId, recordId);
    const normalizedEntry = this.normalizeDnsRecordHistoryEntry(entry);
    if (normalizedEntry.type !== "CNAME" || !normalizedEntry.content) return currentHistory;
    const nextValueKey = this.normalizeDnsHistoryValueKey(normalizedEntry.type, normalizedEntry.content);
    const currentValueKey = currentHistory[0]
      ? this.normalizeDnsHistoryValueKey(currentHistory[0].type, currentHistory[0].content)
      : "";
    if (currentValueKey && currentValueKey === nextValueKey) return currentHistory;
    return this.persistDnsRecordHistory(kv, zoneId, recordId, [normalizedEntry, ...currentHistory]);
  },
  async getDnsHostHistory(kv, zoneId, hostname) {
    return this.getDnsRecordHistory(kv, zoneId, this.getDnsHostHistoryRecordId(hostname));
  },
  async persistDnsHostHistory(kv, zoneId, hostname, entries) {
    return this.persistDnsRecordHistory(kv, zoneId, this.getDnsHostHistoryRecordId(hostname), entries);
  },
  async recordDnsHostHistory(kv, zoneId, hostname, entry = {}) {
    return this.recordDnsRecordHistory(kv, zoneId, this.getDnsHostHistoryRecordId(hostname), entry);
  },
  getCurrentDateKey(now = new Date()) {
    const utc8Now = new Date(now.getTime() + 8 * 3600 * 1000);
    return `${utc8Now.getUTCFullYear()}-${String(utc8Now.getUTCMonth() + 1).padStart(2, "0")}-${String(utc8Now.getUTCDate()).padStart(2, "0")}`;
  },
  buildConfigCacheKeys(...configs) {
    const dateKey = this.getCurrentDateKey();
    const staleKeys = new Set(["sys:cf_dash_cache"]);
    for (const config of configs) {
      staleKeys.add(makeCfDashCacheKey(config?.cfZoneId));
      staleKeys.add(makeCfDashCacheKey(config?.cfZoneId, dateKey));
    }
    return [...staleKeys].filter(Boolean);
  },
  async listKvKeys(kv, options = {}) {
    if (!kv || typeof kv.list !== "function") return [];
    const prefix = String(options.prefix || "");
    const collected = [];
    let cursor = "";
    let guard = 0;
    while (guard < 1000) {
      guard += 1;
      const page = cursor
        ? await kv.list({ prefix, cursor })
        : await kv.list({ prefix });
      for (const item of page?.keys || []) {
        const name = String(item?.name || "").trim();
        if (name) collected.push(name);
      }
      const nextCursor = typeof page?.cursor === "string" ? page.cursor : "";
      if (page?.list_complete === true || !nextCursor) break;
      cursor = nextCursor;
    }
    return [...new Set(collected)];
  },
  async readRepairableRuntimeConfig(kv) {
    if (!kv) return { config: {}, hadMalformedValue: false, source: "missing" };
    let rawText = null;
    try {
      rawText = await kv.get(this.CONFIG_KEY);
    } catch {
      return { config: {}, hadMalformedValue: true, source: "read_failed" };
    }
    if (rawText === null || rawText === undefined || rawText === "") {
      return { config: {}, hadMalformedValue: false, source: "missing" };
    }
    try {
      const parsed = JSON.parse(String(rawText));
      return {
        config: sanitizeRuntimeConfig(isPlainObject(parsed) ? parsed : {}),
        hadMalformedValue: !isPlainObject(parsed),
        source: "text_json"
      };
    } catch {
      return { config: {}, hadMalformedValue: true, source: "text_invalid_json" };
    }
  },
  shouldRunKvTidy(lastTidiedAt, options = {}) {
    const now = Number(options.nowMs) || nowMs();
    const minIntervalMs = Math.max(0, Number(options.minIntervalMs) || Config.Defaults.KvTidyIntervalMs);
    if (options.force === true) return true;
    const parsedLastTidiedAt = typeof lastTidiedAt === "string" ? new Date(lastTidiedAt).getTime() : NaN;
    if (!Number.isFinite(parsedLastTidiedAt)) return true;
    return (now - parsedLastTidiedAt) >= minIntervalMs;
  },
  async tidyKvData(env, options = {}) {
    const kv = options.kv || this.getKV(env);
    const ctx = options.ctx || null;
    if (!kv) throw new Error("KV not configured");

    const allKeys = await this.listKvKeys(kv);
    const nodeNames = [];
    const removableKeys = new Set();
    const knownSectionKeys = new Set(Object.values(this.OPS_STATUS_SECTION_KEYS));
    let untouchedOtherKeyCount = 0;

    for (const keyName of allKeys) {
      if (!keyName) continue;
      if (keyName.startsWith(this.PREFIX)) {
        nodeNames.push(keyName.slice(this.PREFIX.length));
        continue;
      }
      if (keyName === "sys:cf_dash_cache" || keyName.startsWith("sys:cf_dash_cache:")) {
        removableKeys.add(keyName);
        continue;
      }
      if (keyName === this.SCHEDULED_LOCK_KEY) {
        let shouldDeleteLock = false;
        try {
          const lock = await kv.get(this.SCHEDULED_LOCK_KEY, { type: "json" });
          shouldDeleteLock = !lock || Number(lock.expiresAt) <= nowMs();
        } catch {
          shouldDeleteLock = true;
        }
        if (shouldDeleteLock) removableKeys.add(keyName);
        continue;
      }
      if (
        keyName === this.CONFIG_KEY
        || keyName === this.NODES_INDEX_KEY
        || keyName === this.CONFIG_SNAPSHOTS_KEY
        || keyName === this.OPS_STATUS_KEY
        || keyName === this.TELEGRAM_ALERT_STATE_KEY
        || knownSectionKeys.has(keyName)
        || keyName.startsWith(this.DNS_RECORD_HISTORY_PREFIX)
      ) {
        continue;
      }
      untouchedOtherKeyCount += 1;
    }

    const repairedTheme = await this.readRepairableRuntimeConfig(kv);
    const config = await this.persistRuntimeConfig(repairedTheme.config, {
      env,
      kv,
      ctx,
      snapshotMeta: {
        reason: "tidy_kv_data",
        section: "all",
        source: "kv_tidy",
        actor: "admin",
        note: repairedTheme.hadMalformedValue ? "repair_malformed_sys_theme" : "sanitize_runtime_config"
      }
    });
    const rebuiltNodeIndex = await this.persistNodesIndex(nodeNames, { kv, ctx, invalidateList: true });
    const removableKeyList = [...removableKeys].sort();
    if (removableKeyList.length) {
      const deleteTasks = removableKeyList.map(key => kv.delete(key));
      if (ctx) ctx.waitUntil(Promise.all(deleteTasks));
      else await Promise.all(deleteTasks);
    }

    GLOBALS.ConfigCache = null;
    GLOBALS.NodesListCache = null;
    GLOBALS.NodeCache.clear();

    return {
      config,
      nodesIndex: rebuiltNodeIndex,
      summary: {
        scannedKeyCount: allKeys.length,
        preservedNodeKeyCount: nodeNames.length,
        rebuiltNodeCount: rebuiltNodeIndex.length,
        deletedKeyCount: removableKeyList.length,
        deletedCacheKeyCount: removableKeyList.filter(key => key === "sys:cf_dash_cache" || key.startsWith("sys:cf_dash_cache:")).length,
        deletedExpiredScheduledLock: removableKeys.has(this.SCHEDULED_LOCK_KEY),
        untouchedOtherKeyCount,
        themeWasMalformed: repairedTheme.hadMalformedValue,
        themeReadSource: repairedTheme.source
      }
    };
  },
  shouldRunLogsOptimize(lastOptimizeAt, options = {}) {
    const now = Number(options.nowMs) || nowMs();
    const minIntervalMs = Math.max(0, Number(options.minIntervalMs) || Config.Defaults.LogVacuumMinIntervalMs);
    if (options.force === true) return true;
    const parsedLastOptimizeAt = typeof lastOptimizeAt === "string" ? new Date(lastOptimizeAt).getTime() : NaN;
    if (!Number.isFinite(parsedLastOptimizeAt)) return true;
    return (now - parsedLastOptimizeAt) >= minIntervalMs;
  },
  shouldRunLogsFtsRebuild(lastFtsRebuildAt, options = {}) {
    return this.shouldRunLogsOptimize(lastFtsRebuildAt, {
      ...options,
      minIntervalMs: Math.max(0, Number(options.minIntervalMs) || Config.Defaults.LogFtsRebuildMinIntervalMs)
    });
  },
  async optimizeLogsDb(db) {
    if (!db) return false;
    // D1 官方文档列出了兼容的 PRAGMA，并推荐使用 PRAGMA optimize 做数据库维护。
    await db.prepare("PRAGMA optimize").run();
    return true;
  },
  /**
   * @param {ConfigSnapshotMeta} [meta={}]
   */
  normalizeConfigSnapshotMeta(meta = {}) {
    /** @type {ConfigSnapshotMeta} */
    const input = meta && typeof meta === "object" ? meta : {};
    return {
      reason: String(input.reason || "save_config").trim() || "save_config",
      section: String(input.section || "all").trim() || "all",
      actor: String(input.actor || "admin").trim() || "admin",
      source: String(input.source || "ui").trim() || "ui",
      note: String(input.note || "").trim()
    };
  },
  async getConfigSnapshots(kv, options = {}) {
    if (!kv) return [];
    let rawSnapshots = [];
    try {
      const stored = await kv.get(this.CONFIG_SNAPSHOTS_KEY, { type: "json" });
      rawSnapshots = Array.isArray(stored) ? stored : [];
    } catch {}
    const includeConfig = options.withConfig === true;
    return rawSnapshots
      .filter(item => item && typeof item === "object" && Array.isArray(item.changedKeys) && item.createdAt)
      .map(item => includeConfig ? { ...item } : {
        id: item.id,
        createdAt: item.createdAt,
        reason: item.reason,
        section: item.section,
        actor: item.actor,
        source: item.source,
        note: item.note || "",
        changedKeys: [...item.changedKeys],
        changeCount: Number(item.changeCount) || item.changedKeys.length || 0
      });
  },
  async getConfigSnapshotById(kv, snapshotId) {
    const snapshots = await this.getConfigSnapshots(kv, { withConfig: true });
    return snapshots.find(item => item.id === snapshotId) || null;
  },
  async clearConfigSnapshots(kv) {
    if (!kv) return;
    await kv.delete(this.CONFIG_SNAPSHOTS_KEY);
  },
  async recordConfigSnapshot(kv, prevConfig, nextConfig, meta = {}) {
    if (!kv) return null;
    const diffEntries = getConfigDiffEntries(prevConfig, nextConfig);
    if (!diffEntries.length) return null;
    const snapshotMeta = this.normalizeConfigSnapshotMeta(meta);
    const currentSnapshots = await this.getConfigSnapshots(kv, { withConfig: true });
    const snapshot = {
      id: `cfg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      reason: snapshotMeta.reason,
      section: snapshotMeta.section,
      actor: snapshotMeta.actor,
      source: snapshotMeta.source,
      note: snapshotMeta.note,
      changedKeys: diffEntries.map(item => item.key),
      changeCount: diffEntries.length,
      config: sanitizeRuntimeConfig(prevConfig)
    };
    const nextSnapshots = [snapshot, ...currentSnapshots].slice(0, Config.Defaults.ConfigSnapshotLimit);
    await kv.put(this.CONFIG_SNAPSHOTS_KEY, JSON.stringify(nextSnapshots));
    return snapshot;
  },
  /**
   * @param {any} rawConfig
   * @param {PersistRuntimeConfigOptions} [options={}]
   */
  async persistRuntimeConfig(rawConfig, options = {}) {
    const { env, kv, ctx, snapshotMeta } = options;
    if (!kv) return sanitizeRuntimeConfig(rawConfig);
    const prevConfig = env
      ? await getRuntimeConfig(env)
      : sanitizeRuntimeConfig(await kv.get(this.CONFIG_KEY, { type: "json" }) || {});
    const nextConfig = sanitizeRuntimeConfig(rawConfig);
    await this.recordConfigSnapshot(kv, prevConfig, nextConfig, snapshotMeta);
    await kv.put(this.CONFIG_KEY, JSON.stringify(nextConfig));
    GLOBALS.ConfigCache = null;
    const deleteTasks = this.buildConfigCacheKeys(prevConfig, nextConfig).map(key => kv.delete(key));
    if (deleteTasks.length) {
      if (ctx) ctx.waitUntil(Promise.all(deleteTasks));
      else await Promise.all(deleteTasks);
    }
    return nextConfig;
  },
  async syncSourceDirectNodesConfig(env, kv, ctx, options = {}) {
    if (!kv) return null;
    const currentConfig = env
      ? await getRuntimeConfig(env)
      : sanitizeRuntimeConfig(await kv.get(this.CONFIG_KEY, { type: "json" }) || {});
    const currentSelection = normalizeNodeNameList(currentConfig.sourceDirectNodes || currentConfig.directSourceNodes || currentConfig.nodeDirectList || []);
    const nextSelection = reconcileNamedNodeSelection(currentSelection, {
      renameMap: options.renameMap,
      removedNames: options.removedNames,
      allowedNames: options.allowedNames
    });
    if (serializeConfigValue(currentSelection) === serializeConfigValue(nextSelection)) return currentConfig;
    return this.persistRuntimeConfig({ ...currentConfig, sourceDirectNodes: nextSelection }, {
      env,
      kv,
      ctx,
      snapshotMeta: {
        reason: "sync_source_direct_nodes",
        section: "proxy",
        source: String(options.source || "node_mutation"),
        actor: "admin",
        note: String(options.note || "").trim()
      }
    });
  },
  async sendTelegramMessage({ tgBotToken, tgChatId, text }) {
      const botToken = String(tgBotToken || "").trim();
      const chatId = String(tgChatId || "").trim();
      if (!botToken || !chatId) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(tgUrl, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ chat_id: chatId, text: String(text || "") })
      });
      /** @type {JsonApiEnvelope} */
      const tgData = await res.json();
      if (!tgData.ok) throw new Error(tgData.description || "Telegram API 返回错误");
      return tgData;
  },
  
  async sendDailyTelegramReport(env) {
      const db = this.getDB(env);
      const kv = this.getKV(env);
      if (!db || !kv) throw new Error("Database or KV not configured");

      const config = await kv.get(this.CONFIG_KEY, { type: "json" }) || {};
      const tgBotToken = String(config.tgBotToken || "").trim();
      const tgChatId = String(config.tgChatId || "").trim();
      const cfAccountId = String(config.cfAccountId || "").trim();
      const cfZoneId = String(config.cfZoneId || "").trim();
      const cfApiToken = String(config.cfApiToken || "").trim();
      if (!tgBotToken || !tgChatId) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");

      const now = new Date();
      const utc8Ms = now.getTime() + 8 * 3600 * 1000;
      const d = new Date(utc8Ms);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const todayStr = `${mm}-${dd}`;
      const dateString = `${yyyy}-${mm}-${dd}`;

      const startOfDayTs = Date.UTC(yyyy, d.getUTCMonth(), d.getUTCDate()) - 8 * 3600 * 1000;
      const endOfDayTs = startOfDayTs + 86400000 - 1;
      const videoWhereClause = getVideoRequestWhereClause();

      let reqTotal = 0, playCount = 0, infoCount = 0;
      let reqDisplay = "0";
      let cfTrafficStatus = "未找到今日缓存 (需打开面板刷新)";
      let domainName = cfZoneId ? "Cloudflare (读取自缓存)" : "未接入 CF (读取自缓存)";

      try {
          const cacheKey = makeCfDashCacheKey(cfZoneId, dateString);
          let cached = await kv.get(cacheKey, { type: "json" });
          
          // 👇 加回这三行：如果缓存不存在，让定时任务主动假装前端请求一次，生成最新数据
          if (!cached || cached.ver !== CF_DASH_CACHE_VERSION) {
              await this.ApiHandlers.getDashboardStats({}, { env, ctx: null, kv, db }).catch(() => null);
              cached = await kv.get(cacheKey, { type: "json" });
          }

          if (cached && cached.ver === CF_DASH_CACHE_VERSION) {
              reqTotal = Number(cached.todayRequests);
              if (!Number.isFinite(reqTotal)) reqTotal = 0;
              reqDisplay = String(cached.requestCountDisplay || "").trim() || reqTotal.toString();
              cfTrafficStatus = cached.todayTraffic || "0 B";
              if (cfTrafficStatus === "未配置") cfTrafficStatus = "缓存暂无流量数据";
              playCount = cached.playCount || 0;
              infoCount = cached.infoCount || 0;
          }
      } catch (e) {
          cfTrafficStatus = "读取面板缓存异常";
          console.log("Read CF cache failed", e);
      }

      let reqStr = reqDisplay;
      if (reqStr === "0" && reqTotal > 1000) reqStr = (reqTotal / 1000).toFixed(2) + "k";

      const msgText = `📊 Cloudflare Zone 每日报表 (UTC+8)\n域名: ${domainName}\n\n📅 今天 (${todayStr})\n请求数: ${reqStr}\n视频流量 (CF 总计): ${cfTrafficStatus}\n请求: 播放请求 ${playCount} 次 | 获取播放信息 ${infoCount} 次\n#Cloudflare #Emby #日报`;
      await this.sendTelegramMessage({ tgBotToken, tgChatId, text: msgText });
      return true;
  },
  async maybeSendRuntimeAlerts(env, scheduledState = null) {
      const kv = this.getKV(env);
      if (!kv) return { sent: false, reason: "kv_unavailable" };
      const config = sanitizeRuntimeConfig(await getRuntimeConfig(env));
      const tgBotToken = String(config.tgBotToken || "").trim();
      const tgChatId = String(config.tgChatId || "").trim();
      if (!tgBotToken || !tgChatId) return { sent: false, reason: "telegram_not_configured" };

      const droppedThreshold = clampIntegerConfig(config.tgAlertDroppedBatchThreshold, Config.Defaults.TgAlertDroppedBatchThreshold, 0, 5000);
      const retryThreshold = clampIntegerConfig(config.tgAlertFlushRetryThreshold, Config.Defaults.TgAlertFlushRetryThreshold, 0, 10);
      const cooldownMinutes = clampIntegerConfig(config.tgAlertCooldownMinutes, Config.Defaults.TgAlertCooldownMinutes, 1, 1440);
      const alertOnScheduledFailure = config.tgAlertOnScheduledFailure === true;
      if (droppedThreshold <= 0 && retryThreshold <= 0 && !alertOnScheduledFailure) {
        return { sent: false, reason: "thresholds_disabled" };
      }

      const opsStatus = await this.getOpsStatus(env);
      const log = opsStatus && typeof opsStatus.log === "object" ? opsStatus.log : {};
      const scheduled = scheduledState && typeof scheduledState === "object" && Object.keys(scheduledState).length
        ? scheduledState
        : (opsStatus && typeof opsStatus.scheduled === "object" ? opsStatus.scheduled : {});
      const issues = [];

      const droppedCount = Number(log.lastDroppedBatchSize) || 0;
      if (droppedThreshold > 0 && droppedCount >= droppedThreshold) {
        issues.push({
          code: "log_drop",
          message: `日志刷盘疑似丢弃批次：${droppedCount} 条（阈值 ${droppedThreshold}）`,
          eventAt: log.lastFlushErrorAt || log.lastOverflowAt || log.updatedAt || opsStatus.updatedAt || ""
        });
      }

      const retryCount = Number(log.lastFlushRetryCount) || 0;
      if (retryThreshold > 0 && retryCount >= retryThreshold) {
        issues.push({
          code: "log_retry",
          message: `D1 写入重试次数偏高：${retryCount} 次（阈值 ${retryThreshold}）`,
          eventAt: log.lastFlushAt || log.lastFlushErrorAt || log.updatedAt || opsStatus.updatedAt || ""
        });
      }

      const scheduledStatus = String(scheduled.status || "").toLowerCase();
      if (alertOnScheduledFailure && (scheduledStatus === "failed" || scheduledStatus === "partial_failure")) {
        issues.push({
          code: "scheduled_failure",
          message: `定时任务状态异常：${scheduled.status}${scheduled.lastError ? `，错误：${scheduled.lastError}` : ""}`,
          eventAt: scheduled.lastFinishedAt || scheduled.lastErrorAt || scheduled.updatedAt || opsStatus.updatedAt || ""
        });
      }

      if (!issues.length) return { sent: false, reason: "no_alerts" };

      const signature = JSON.stringify(issues.map(item => ({ code: item.code, eventAt: item.eventAt, message: item.message })));
      let lastAlertState = null;
      try {
        lastAlertState = await kv.get(this.TELEGRAM_ALERT_STATE_KEY, { type: "json" });
      } catch {}
      const now = Date.now();
      const cooldownMs = cooldownMinutes * 60 * 1000;
      if (lastAlertState && lastAlertState.signature === signature && Number(lastAlertState.sentAtMs) > 0 && (now - Number(lastAlertState.sentAtMs)) < cooldownMs) {
        return { sent: false, reason: "cooldown_active" };
      }

      const lines = [
        "⚠️ Emby Proxy 运行时异常告警",
        "",
        ...issues.map(item => `- ${item.message}`),
        "",
        `时间：${new Date().toLocaleString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" })}`,
        "#Emby #Alert"
      ];
      await this.sendTelegramMessage({ tgBotToken, tgChatId, text: lines.join("\n") });
      await kv.put(this.TELEGRAM_ALERT_STATE_KEY, JSON.stringify({
        signature,
        sentAt: new Date(now).toISOString(),
        sentAtMs: now,
        issues
      }));
      return { sent: true, issueCount: issues.length };
  },

  sanitizeHeaders(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) return {};
    const out = {};
    for (const [rawKey, rawValue] of Object.entries(input)) {
      const key = String(rawKey || "").trim();
      if (!key) continue;
      if (GLOBALS.DropRequestHeaders.has(key.toLowerCase())) continue;
      out[key] = String(rawValue ?? "");
    }
    return out;
  },
  normalizeTargets(targetValue) {
    const parts = String(targetValue || "").split(",").map(v => v.trim()).filter(Boolean);
    if (!parts.length) return null;
    const normalized = [];
    for (const part of parts) {
      try {
        const url = new URL(part);
        if (!["http:", "https:"].includes(url.protocol)) return null;
        normalized.push(url.toString().replace(/\/$/, ""));
      } catch {
        return null;
      }
    }
    return normalized.length ? normalized.join(",") : null;
  },
  normalizeSingleTarget(targetValue) {
    const normalizedTargets = this.normalizeTargets(targetValue);
    if (!normalizedTargets) return null;
    const [firstTarget] = normalizedTargets.split(",").map(item => item.trim()).filter(Boolean);
    return firstTarget || null;
  },
  buildDefaultLineName(index) {
    return `线路${Number(index) + 1}`;
  },
  normalizeLineId(value, fallbackIndex = 0) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || `line-${Number(fallbackIndex) + 1}`;
  },
  parseLatencyMs(value) {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.round(parsed);
  },
  normalizeIsoDatetime(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : "";
  },
  normalizeLines(rawLines, fallbackTarget = "") {
    const sourceLines = Array.isArray(rawLines) && rawLines.length
      ? rawLines
      : String(this.normalizeTargets(fallbackTarget) || "")
          .split(",")
          .map(item => item.trim())
          .filter(Boolean)
          .map((target, index) => ({
            id: `line-${index + 1}`,
            name: this.buildDefaultLineName(index),
            target
          }));
    if (!sourceLines.length) return [];

    const normalized = [];
    const usedIds = new Set();
    sourceLines.forEach((rawLine, index) => {
      const line = rawLine && typeof rawLine === "object" && !Array.isArray(rawLine)
        ? rawLine
        : { target: rawLine };
      const target = this.normalizeSingleTarget(line?.target);
      if (!target) return;

      const baseId = this.normalizeLineId(line?.id, index);
      let nextId = baseId;
      let suffix = 2;
      while (usedIds.has(nextId)) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(nextId);

      normalized.push({
        id: nextId,
        name: String(line?.name || "").trim() || this.buildDefaultLineName(index),
        target,
        latencyMs: this.parseLatencyMs(line?.latencyMs),
        latencyUpdatedAt: this.normalizeIsoDatetime(line?.latencyUpdatedAt)
      });
    });
    return normalized;
  },
  resolveActiveLineId(activeLineId, lines, rawLines = []) {
    if (!Array.isArray(lines) || !lines.length) return "";
    const explicitId = String(activeLineId || "").trim();
    if (explicitId && lines.some(line => line.id === explicitId)) return explicitId;

    if (Array.isArray(rawLines)) {
      for (const rawLine of rawLines) {
        if (!rawLine || typeof rawLine !== "object" || Array.isArray(rawLine) || rawLine.enabled !== true) continue;
        const rawId = String(rawLine.id || "").trim();
        if (rawId && lines.some(line => line.id === rawId)) return rawId;
        const rawTarget = this.normalizeSingleTarget(rawLine.target);
        if (!rawTarget) continue;
        const matched = lines.find(line => line.target === rawTarget);
        if (matched) return matched.id;
      }
    }

    return lines[0].id;
  },
  buildLegacyTargetFromLines(lines = []) {
    return (Array.isArray(lines) ? lines : [])
      .map(line => String(line?.target || "").trim())
      .filter(Boolean)
      .join(",");
  },
  getActiveNodeLine(node) {
    const lines = Array.isArray(node?.lines) ? node.lines : [];
    if (!lines.length) return null;
    const activeLineId = String(node?.activeLineId || "").trim();
    return lines.find(line => line.id === activeLineId) || lines[0];
  },
  getOrderedNodeLines(node) {
    const lines = Array.isArray(node?.lines) ? node.lines.slice() : [];
    if (lines.length <= 1) return lines;
    const activeLine = this.getActiveNodeLine(node);
    if (!activeLine) return lines;
    return [activeLine, ...lines.filter(line => line.id !== activeLine.id)];
  },
  sortNodeLinesByLatency(lines = []) {
    return (Array.isArray(lines) ? lines : [])
      .map((line, index) => ({ line, index }))
      .sort((left, right) => {
        const leftMs = Number.isFinite(left.line?.latencyMs) ? left.line.latencyMs : Number.POSITIVE_INFINITY;
        const rightMs = Number.isFinite(right.line?.latencyMs) ? right.line.latencyMs : Number.POSITIVE_INFINITY;
        if (leftMs !== rightMs) return leftMs - rightMs;
        return left.index - right.index;
      })
      .map(item => item.line);
  },
  isPingCacheFresh(line, cacheMinutes) {
    const latencyMs = Number(line?.latencyMs);
    const checkedAt = Date.parse(String(line?.latencyUpdatedAt || ""));
    if (!Number.isFinite(latencyMs) || !Number.isFinite(checkedAt)) return false;
    const ttlMs = Math.max(0, Number(cacheMinutes) || 0) * 60 * 1000;
    if (ttlMs <= 0) return false;
    return nowMs() - checkedAt < ttlMs;
  },
  async pingTarget(target, timeoutMs) {
    const controller = new AbortController();
    const startedAt = nowMs();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await fetch(target, { method: "HEAD", signal: controller.signal });
      return nowMs() - startedAt;
    } catch {
      return 9999;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  normalizeNode(nodeName, data) {
    const n = { ...data };
    let changed = false;
    const normalizedLines = this.normalizeLines(n.lines, n.target);
    const nextActiveLineId = this.resolveActiveLineId(n.activeLineId, normalizedLines, Array.isArray(n.lines) ? n.lines : []);
    const legacyTarget = this.buildLegacyTargetFromLines(normalizedLines);
    if (JSON.stringify(normalizedLines) !== JSON.stringify(Array.isArray(n.lines) ? n.lines : [])) changed = true;
    if (String(n.activeLineId || "") !== nextActiveLineId) changed = true;
    if (String(n.target || "") !== legacyTarget) changed = true;
    n.lines = normalizedLines;
    n.activeLineId = nextActiveLineId;
    n.target = legacyTarget;
    if (n.secret === undefined) { n.secret = ""; changed = true; }
    if (n.tag === undefined) { n.tag = ""; changed = true; }
    if (n.remark === undefined) { n.remark = ""; changed = true; }
    if (n.tagColor === undefined) { n.tagColor = ""; changed = true; }
    if (n.remarkColor === undefined) { n.remarkColor = ""; changed = true; }
    if (n.displayName === undefined) { n.displayName = ""; changed = true; }
    const normalizedMediaAuthMode = normalizeNodeMediaAuthMode(n.mediaAuthMode);
    if (String(n.mediaAuthMode || "") !== normalizedMediaAuthMode) changed = true;
    n.mediaAuthMode = normalizedMediaAuthMode;
    const normalizedRealClientIpMode = normalizeNodeRealClientIpMode(n.realClientIpMode);
    if (String(n.realClientIpMode || "") !== normalizedRealClientIpMode) changed = true;
    n.realClientIpMode = normalizedRealClientIpMode;
    const normalizedHeaders = this.sanitizeHeaders(n.headers);
    if (JSON.stringify(normalizedHeaders) !== JSON.stringify(n.headers || {})) changed = true;
    n.headers = normalizedHeaders;
    delete n.videoThrottling;
    delete n.interceptMs;
    if (n.schemaVersion !== 3) { n.schemaVersion = 3; changed = true; }
    if (!n.createdAt) { n.createdAt = new Date().toISOString(); changed = true; }
    if (!n.updatedAt) { n.updatedAt = n.createdAt; changed = true; }
    return { data: n, changed };
  },
  buildNodeRecord(name, rawNode, existingNode = {}) {
    let parsedHeaders = rawNode?.headers !== undefined ? rawNode.headers : existingNode.headers;
    if (typeof parsedHeaders === "string") {
      try { parsedHeaders = JSON.parse(parsedHeaders); } catch { parsedHeaders = {}; }
    }
    const candidateRawLines = Array.isArray(rawNode?.lines)
      ? rawNode.lines
      : (rawNode?.target !== undefined ? [] : existingNode.lines);
    const candidateFallbackTarget = rawNode?.target !== undefined ? rawNode.target : existingNode.target;
    const normalizedLines = this.normalizeLines(candidateRawLines, candidateFallbackTarget);
    if (!normalizedLines.length) return null;
    const nextActiveLineId = this.resolveActiveLineId(
      rawNode?.activeLineId !== undefined ? rawNode.activeLineId : existingNode.activeLineId,
      normalizedLines,
      Array.isArray(rawNode?.lines) ? rawNode.lines : existingNode.lines
    );
    return this.normalizeNode(name, {
      target: this.buildLegacyTargetFromLines(normalizedLines),
      lines: normalizedLines,
      activeLineId: nextActiveLineId,
      secret: rawNode?.secret !== undefined ? rawNode.secret : (existingNode.secret || ""),
      tag: rawNode?.tag !== undefined ? rawNode.tag : (existingNode.tag || ""),
      remark: rawNode?.remark !== undefined ? rawNode.remark : (existingNode.remark || ""),
      tagColor: rawNode?.tagColor !== undefined ? String(rawNode.tagColor || "").trim() : (existingNode.tagColor || ""),
      remarkColor: rawNode?.remarkColor !== undefined ? String(rawNode.remarkColor || "").trim() : (existingNode.remarkColor || ""),
      displayName: rawNode?.displayName !== undefined ? String(rawNode.displayName || "").trim() : (existingNode.displayName || ""),
      mediaAuthMode: rawNode?.mediaAuthMode !== undefined ? normalizeNodeMediaAuthMode(rawNode.mediaAuthMode) : normalizeNodeMediaAuthMode(existingNode.mediaAuthMode),
      realClientIpMode: rawNode?.realClientIpMode !== undefined ? normalizeNodeRealClientIpMode(rawNode.realClientIpMode) : normalizeNodeRealClientIpMode(existingNode.realClientIpMode),
      headers: this.sanitizeHeaders(parsedHeaders),
      schemaVersion: 3,
      createdAt: existingNode.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).data;
  },
  async getNode(nodeName, env, ctx) {
    nodeName = String(nodeName).toLowerCase();
    const kv = this.getKV(env); if (!kv) return null;
    const mem = GLOBALS.NodeCache.get(nodeName);
    if (mem && mem.exp > Date.now()) {
      touchMapEntry(GLOBALS.NodeCache, nodeName);
      return mem.data;
    }
    try {
      const nodeData = await kv.get(`${this.PREFIX}${nodeName}`, { type: "json" });
      if (!nodeData) return null;
      const { data: normalized, changed } = this.normalizeNode(nodeName, nodeData);
      if (changed && ctx) ctx.waitUntil(kv.put(`${this.PREFIX}${nodeName}`, JSON.stringify(normalized)));
      setBoundedMapEntry(GLOBALS.NodeCache, nodeName, { data: normalized, exp: Date.now() + Config.Defaults.CacheTTL }, Config.Defaults.NodeCacheMax);
      return normalized;
    } catch { return null; }
  },
  normalizeAdminActionRequest(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) return null;
    const payload = input.payload && typeof input.payload === "object" && !Array.isArray(input.payload)
      ? { ...input.payload }
      : null;
    const action = String(input.action ?? payload?.action ?? "").trim();
    const meta = input.meta && typeof input.meta === "object" && !Array.isArray(input.meta) ? { ...input.meta } : {};
    const data = payload
      ? { ...payload, action, meta }
      : { ...input, action, meta };
    return { action, data, meta };
  },
  // ============================================================================
  // 管理 API 动作表 (ADMIN ACTION MAP)
  // 读取导航：
  // - 面板统计 / 运行状态：getDashboardStats / getRuntimeStatus
  // - 配置与备份：loadConfig / previewConfig / saveConfig / exportConfig / importFull
  // - 节点治理：list / saveOrImport / delete / pingNode
  // - 运维动作：getLogs / clearLogs / initLogsDb / initLogsFts / purgeCache / tidyKvData / testTelegram / sendDailyReport
  // 设计意图：
  // - 维持单文件部署，但把“动作分发”和“动作实现”拆成两个认知层次。
  // - 新增 action 时，优先在这里挂处理器，再在 handleApi 做最小派发。
  //
  // [新增] API 路由处理器 (Action Handlers)
  // 通过分离业务逻辑，消除 switch-case 带来的上下文污染
  // ============================================================================
  ApiHandlers: {
    async getDashboardStats(data, { env, ctx, kv, db }) {
      const config = sanitizeRuntimeConfig(await getRuntimeConfig(env));
      let todayRequests = null, todayTraffic = "未配置", nodeCount = 0;
      let cfAnalyticsLoaded = false, requestsLoaded = false;
      let cfAnalyticsStatus = "", cfAnalyticsError = "", cfAnalyticsDetail = "";
      let requestSource = "pending", requestSourceText = "等待数据加载", trafficSourceText = "视频流量口径：CF Zone 总流量";
      let generatedAt = new Date().toISOString();
      let hourlySeries = Array.from({ length: 24 }, (_, hour) => ({ label: String(hour).padStart(2, "0") + ":00", total: 0 }));
      let playCount = 0, infoCount = 0;

      const nodes = await CacheManager.getNodesList(env, ctx);
      nodeCount = nodes.length || 0;

      const now = new Date();
      const utc8Ms = now.getTime() + 8 * 3600 * 1000;
      const d = new Date(utc8Ms);
      const dateString = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      const startOfDayTs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - 8 * 3600 * 1000;
      const endOfDayTs = startOfDayTs + 86400000 - 1;

      const cfZoneId = String(config.cfZoneId || "").trim();
      const cfApiToken = String(config.cfApiToken || "").trim();
      const cacheKey = makeCfDashCacheKey(cfZoneId, dateString);
      let cached = await kv.get(cacheKey, { type: "json" });

      if (cached && cached.ver === CF_DASH_CACHE_VERSION && (Date.now() - cached.ts < 3600000) && Array.isArray(cached.hourlySeries)) {
          return new Response(JSON.stringify({ nodeCount, ...cached, generatedAt: cached.generatedAt || new Date(cached.ts).toISOString(), cacheStatus: "cache" }), { headers: { ...corsHeaders } });
      } 

      if (cfZoneId && cfApiToken) {
          const startIso = new Date(startOfDayTs).toISOString();
          const endIso = new Date(endOfDayTs).toISOString();
          const query = `
          query {
            viewer {
              zones(filter: { zoneTag: ${toGraphQLString(cfZoneId)} }) {
                series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${toGraphQLString(startIso)}, datetime_leq: ${toGraphQLString(endIso)} }) {
                  count
                  dimensions { datetimeHour }
                  sum { edgeResponseBytes }
                }
              }
            }
          }`;
          try {
              const zoneData = await fetchCloudflareGraphQLZone(cfZoneId, cfApiToken, query);
              if (zoneData) {
                  let zoneTotalReq = 0, totalBytes = 0;
                  let zoneHourlySeries = Array.from({ length: 24 }, (_, hour) => ({ label: String(hour).padStart(2, "0") + ":00", total: 0 }));
                  const seriesData = Array.isArray(zoneData.series) ? [...zoneData.series].sort((a, b) => String(a?.dimensions?.datetimeHour || "").localeCompare(String(b?.dimensions?.datetimeHour || ""))) : [];
                  seriesData.forEach(item => {
                      const req = Number(item.count) || 0;
                      const byt = Number(item.sum?.edgeResponseBytes) || 0;
                      zoneTotalReq += req;
                      totalBytes += byt;
                      const dtRaw = item?.dimensions?.datetimeHour;
                      if (dtRaw && !Number.isNaN(new Date(dtRaw).getTime())) {
                          zoneHourlySeries[(new Date(dtRaw).getUTCHours() + 8) % 24].total += req;
                      }
                  });
                  todayTraffic = formatBytes(totalBytes);
                  cfAnalyticsLoaded = true;
                  cfAnalyticsStatus = "Cloudflare 统计正常";
                  trafficSourceText = "视频流量当前对齐：CF Zone 总流量（edgeResponseBytes）";

                  let resolvedRequestSource = "zone_analytics";
                  try {
                      const workerUsage = await fetchCloudflareWorkerUsageMetrics({ cfAccountId: String(config.cfAccountId || "").trim(), cfZoneId, cfApiToken, startIso, endIso });
                      if (workerUsage && Number.isFinite(workerUsage.totalRequests)) {
                          todayRequests = workerUsage.totalRequests;
                          hourlySeries = workerUsage.hourlySeries;
                          requestsLoaded = true;
                          resolvedRequestSource = "workers_usage";
                          requestSource = "workers_usage";
                          requestSourceText = "今日请求量当前对齐：Cloudflare Workers Usage";
                          cfAnalyticsStatus = "Cloudflare 统计正常（请求数已对齐 Workers Usage）";
                          cfAnalyticsDetail = workerUsage.serviceNames?.length ? `已对齐脚本: ${workerUsage.serviceNames.join(", ")}` : cfAnalyticsDetail;
                      }
                  } catch (e) { console.log("CF workers usage fetch failed", e); }

                  if (!requestsLoaded) {
                      todayRequests = zoneTotalReq;
                      hourlySeries = zoneHourlySeries;
                      requestsLoaded = true;
                      requestSource = "zone_analytics";
                      requestSourceText = "今日请求量当前对齐：Cloudflare Zone Analytics";
                  }
              } else {
                  cfAnalyticsStatus = "Zone 未命中";
                  cfAnalyticsError = "GraphQL 返回空；请检查 Zone ID 或权限";
                  todayTraffic = "CF 无统计数据";
              }
          } catch (e) {
              const cfDiag = classifyCloudflareAnalyticsError(e?.message || e, { zoneId: cfZoneId });
              cfAnalyticsStatus = cfDiag.status;
              cfAnalyticsError = cfDiag.hint;
              cfAnalyticsDetail = cfDiag.detail;
              todayTraffic = "CF 查询失败";
          }
      } else {
          cfAnalyticsStatus = "未配置 Cloudflare";
          cfAnalyticsError = "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌";
          trafficSourceText = "视频流量当前对齐：未配置 Cloudflare，无法获取 CF Zone 总流量";
      }
            if (db) {
                try {
                    const videoWhereClause = getVideoRequestWhereClause();
                    playCount = (await db.prepare(`SELECT COUNT(*) as c FROM proxy_logs WHERE timestamp >= ? AND timestamp <= ? AND ${videoWhereClause}`).bind(startOfDayTs, endOfDayTs).first())?.c || 0;
                    infoCount = (await db.prepare(`SELECT COUNT(*) as c FROM proxy_logs WHERE timestamp >= ? AND timestamp <= ? AND request_path LIKE '%/PlaybackInfo%'`).bind(startOfDayTs, endOfDayTs).first())?.c || 0;

                    if (!requestsLoaded) {
                        todayRequests = (await db.prepare(`SELECT COUNT(*) as total FROM proxy_logs WHERE timestamp >= ? AND timestamp <= ?`).bind(startOfDayTs, endOfDayTs).first())?.total || 0;
                        const dbHourly = await db.prepare(`SELECT strftime('%H', datetime(timestamp / 1000 + 28800, 'unixepoch')) as hour, COUNT(*) as total FROM proxy_logs WHERE timestamp >= ? AND timestamp <= ? GROUP BY hour ORDER BY hour ASC`).bind(startOfDayTs, endOfDayTs).all();
                        for (const row of dbHourly?.results || []) {
                            const index = Number.parseInt(row.hour, 10);
                            if (!Number.isNaN(index) && hourlySeries[index]) hourlySeries[index].total += (Number(row.total) || 0);
                        }
                        requestsLoaded = true;
                        requestSource = "d1_logs";
                        requestSourceText = "今日请求量当前对齐：本地 D1 日志（兜底口径）";
                    }
                } catch (dbErr) {
                    // 静默吞掉错误 (如新用户尚未初始化表)，确保 CF 流量数据仍能正常下发
                    console.log("DB Stats read failed (table not init?):", dbErr);
                }
            }

            if (!requestsLoaded) {
                todayRequests = null;
                if (!cfZoneId || !cfApiToken) {
                    requestSource = "unconfigured";
                    requestSourceText = db
                      ? "今日请求量暂不可用：未配置 Cloudflare 联动，且本地 D1 日志未初始化或不可读"
                      : "今日请求量未配置：未绑定 D1，且未配置 Cloudflare 联动";
                } else {
                    requestSource = "pending";
                    requestSourceText = db
                      ? "今日请求量暂不可用：Cloudflare 请求数查询失败，且本地 D1 日志未初始化或不可读"
                      : "今日请求量暂不可用：Cloudflare 请求数查询失败，且未绑定 D1";
                }
            }

            const requestCountDisplay = todayRequests === null || todayRequests === undefined
              ? (requestSource === "unconfigured" ? "未配置" : "暂不可用")
              : String(Number(todayRequests) || 0);

            const cachePayload = JSON.stringify({
          ver: CF_DASH_CACHE_VERSION, ts: Date.now(),
          todayRequests, requestCountDisplay, todayTraffic, hourlySeries,
          requestSource, requestSourceText, trafficSourceText,
          generatedAt,
          cfAnalyticsLoaded, cfAnalyticsStatus, cfAnalyticsError, cfAnalyticsDetail,
          playCount, infoCount
      });
      
      if (ctx) ctx.waitUntil(kv.put(cacheKey, cachePayload));
      else await kv.put(cacheKey, cachePayload);

      return new Response(JSON.stringify({ todayRequests, requestCountDisplay, todayTraffic, nodeCount, hourlySeries, cfAnalyticsLoaded, cfAnalyticsStatus, cfAnalyticsError, cfAnalyticsDetail, requestSource, requestSourceText, trafficSourceText, generatedAt, cacheStatus: "live", playCount, infoCount }), { headers: { ...corsHeaders } });      
    },

    async loadConfig(data, { env }) {
      return new Response(JSON.stringify({ config: await getRuntimeConfig(env) }), { headers: { ...corsHeaders } });
    },

    async previewConfig(data) {
      const rawConfig = data?.config && typeof data.config === "object" && !Array.isArray(data.config)
        ? data.config
        : {};
      return jsonResponse({ config: sanitizeRuntimeConfig(rawConfig) });
    },

    async getRuntimeStatus(data, { env }) {
      return jsonResponse({ status: await Database.getOpsStatus(env) });
    },

    async saveConfig(data, { env, ctx, kv, meta }) {
      const savedConfig = data.config
        ? await Database.persistRuntimeConfig(data.config, {
            env,
            kv,
            ctx,
            snapshotMeta: {
              reason: "save_config",
              section: String(meta?.section || "all"),
              source: String(meta?.source || "ui"),
              actor: "admin"
            }
          })
        : await getRuntimeConfig(env);
      return jsonResponse({ success: true, config: savedConfig });
    },

    async exportConfig(data, { env, ctx }) {
      return new Response(JSON.stringify({ 
        version: Config.Defaults.Version, 
        exportTime: new Date().toISOString(), 
        nodes: (await CacheManager.getNodesList(env, ctx)).filter(Boolean), 
        config: await getRuntimeConfig(env) 
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    },

    async exportSettings(data, { env }) {
      return jsonResponse({
        version: Config.Defaults.Version,
        type: "settings-only",
        exportTime: new Date().toISOString(),
        config: await getRuntimeConfig(env)
      });
    },

    async importSettings(data, { env, ctx, kv, meta }) {
      const importedConfig = data?.config && typeof data.config === "object" && !Array.isArray(data.config)
        ? data.config
        : (data?.settings && typeof data.settings === "object" && !Array.isArray(data.settings) ? data.settings : null);
      if (!importedConfig) return jsonError("INVALID_SETTINGS_BACKUP", "设置备份文件无效，缺少 config/settings 对象");
      const savedConfig = await Database.persistRuntimeConfig(importedConfig, {
        env,
        kv,
        ctx,
        snapshotMeta: {
          reason: "import_settings",
          section: "all",
          source: String(meta?.source || "settings_backup"),
          actor: "admin"
        }
      });
      return jsonResponse({ success: true, config: savedConfig });
    },

    async getConfigSnapshots(data, { kv }) {
      return jsonResponse({ snapshots: await Database.getConfigSnapshots(kv) });
    },

    async clearConfigSnapshots(data, { kv }) {
      await Database.clearConfigSnapshots(kv);
      return jsonResponse({ success: true, snapshots: [] });
    },

    async restoreConfigSnapshot(data, { env, ctx, kv }) {
      const snapshotId = String(data?.id || "").trim();
      if (!snapshotId) return jsonError("SNAPSHOT_ID_REQUIRED", "请提供要恢复的快照 ID");
      const snapshot = await Database.getConfigSnapshotById(kv, snapshotId);
      if (!snapshot) return jsonError("SNAPSHOT_NOT_FOUND", "指定的配置快照不存在", 404);
      const savedConfig = await Database.persistRuntimeConfig(snapshot.config || {}, {
        env,
        kv,
        ctx,
        snapshotMeta: {
          reason: "restore_snapshot",
          section: "all",
          source: "snapshot",
          actor: "admin",
          note: snapshotId
        }
      });
      return jsonResponse({ success: true, config: savedConfig, restoredSnapshotId: snapshotId });
    },

    async list(data, { env, ctx }) {
      return new Response(JSON.stringify({ nodes: await CacheManager.getNodesList(env, ctx) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    },

    async saveOrImport(data, { action, ctx, kv, env }) {
      const nodesToSave = action === "save" ? [data] : data.nodes;
      const savedNodes = [];
      let index = await Database.getNodesIndex(kv);
      const renameMap = new Map();
      
      for (const n of nodesToSave) {
        if (!n.name || (!n.target && !(Array.isArray(n.lines) && n.lines.length))) continue;
        const name = String(n.name).toLowerCase();
        const originalName = n.originalName ? String(n.originalName).toLowerCase() : null;
        const isRename = !!(originalName && originalName !== name);
        if (action === "save" && (!originalName || originalName !== name)) {
          const targetExisting = await kv.get(`${Database.PREFIX}${name}`, { type: "json" });
          if (targetExisting) {
            return jsonError("NODE_NAME_CONFLICT", "节点路径已存在，请更换后重试", 409, { name });
          }
        }
        
        let existingNode = {};
        if (isRename) {
            existingNode = await kv.get(`${Database.PREFIX}${originalName}`, { type: "json" }) || {};
        } else {
            existingNode = await kv.get(`${Database.PREFIX}${name}`, { type: "json" }) || {};
        }
        const val = Database.buildNodeRecord(name, n, existingNode);
        if (!val) continue;
        
        await kv.put(`${Database.PREFIX}${name}`, JSON.stringify(val));
        if (isRename) {
          await kv.delete(`${Database.PREFIX}${originalName}`);
          Database.invalidateNodeCaches([originalName, name], { invalidateList: true });
          index = index.filter(x => x !== originalName);
          renameMap.set(originalName, name);
        } else {
          Database.invalidateNodeCaches(name, { invalidateList: true });
        }
        savedNodes.push({ name, ...val });
        index.push(name);
      }
      
      if (savedNodes.length > 0) { 
        await Database.persistNodesIndex(index, { kv, ctx, invalidateList: true });
      }
      if (renameMap.size > 0) {
        await Database.syncSourceDirectNodesConfig(env, kv, ctx, {
          renameMap,
          allowedNames: index,
          source: action === "import" ? "node_import" : "node_save",
          note: [...renameMap.entries()].map(([fromName, toName]) => `${fromName}->${toName}`).join(",")
        });
      }
      
      if (action === "save" && savedNodes.length === 0) return jsonError("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
      return new Response(JSON.stringify({ success: true, node: action === "save" ? savedNodes[0] : undefined, nodes: action === "import" ? savedNodes : undefined }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    },

    async importFull(data, { env, ctx, kv }) {
      let savedConfig = null;
      if (data.config) {
        savedConfig = await Database.persistRuntimeConfig(data.config, {
          env,
          kv,
          ctx,
          snapshotMeta: {
            reason: "import_full",
            section: "all",
            source: "full_backup",
            actor: "admin"
          }
        });
      }
      if (data.nodes && Array.isArray(data.nodes)) {
          const savedNodes = [];
          let index = await Database.getNodesIndex(kv);
          for (const n of data.nodes) {
            if (!n.name || (!n.target && !(Array.isArray(n.lines) && n.lines.length))) continue;
            const name = String(n.name).toLowerCase(); 
            const existingNode = await kv.get(`${Database.PREFIX}${name}`, { type: "json" }) || {};
            const val = Database.buildNodeRecord(name, n, existingNode);
            if (!val) continue;
            
            await kv.put(`${Database.PREFIX}${name}`, JSON.stringify(val));
            Database.invalidateNodeCaches(name, { invalidateList: true });
            savedNodes.push(name);
            index.push(name);
          }
          if (savedNodes.length > 0) {
            await Database.persistNodesIndex(index, { kv, ctx, invalidateList: true });
          }
      }
      return jsonResponse({ success: true, config: savedConfig || await getRuntimeConfig(env) });
    },

    async delete(data, { ctx, kv, env }) {
      if (data.name) {
        const delName = String(data.name).toLowerCase(); 
        await kv.delete(`${Database.PREFIX}${delName}`); 
        Database.invalidateNodeCaches(delName, { invalidateList: true });
        const index = (await Database.getNodesIndex(kv)).filter(n => n !== delName);
        await Database.persistNodesIndex(index, { kv, ctx, invalidateList: true });
        await Database.syncSourceDirectNodesConfig(env, kv, ctx, {
          removedNames: [delName],
          allowedNames: index,
          source: "node_delete",
          note: delName
        });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders } });
    },

    async purgeCache(data, { kv }) {
        const config = await kv.get(Database.CONFIG_KEY, { type: "json" }) || {};
        if (!config.cfZoneId || !config.cfApiToken) return jsonError("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
        try {
            const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(config.cfZoneId).trim())}/purge_cache`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${config.cfApiToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ purge_everything: true })
            });
            if (res.ok) return jsonResponse({ success: true });
            return jsonError("PURGE_FAILED", "清理失败，请检查密钥权限");
        } catch(e) { return jsonError("PURGE_ERROR", e.message); }
    },

    async tidyKvData(data, { env, ctx, kv }) {
      if (!kv) return jsonError("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
      try {
        const result = await Database.tidyKvData(env, { kv, ctx });
        const nowIso = new Date().toISOString();
        await Database.patchOpsStatus(env, {
          scheduled: {
            kvTidy: {
              status: "success",
              lastSuccessAt: nowIso,
              lastTriggeredBy: "manual",
              summary: result.summary
            }
          }
        }).catch(() => {});
        return jsonResponse({ success: true, ...result });
      } catch (error) {
        const message = error?.message || String(error);
        await Database.patchOpsStatus(env, {
          scheduled: {
            kvTidy: {
              status: "failed",
              lastErrorAt: new Date().toISOString(),
              lastError: message,
              lastTriggeredBy: "manual"
            }
          }
        }).catch(() => {});
        return jsonError("KV_TIDY_FAILED", message, 500);
      }
    },

    async listDnsRecords(data, { env, kv, request }) {
        const config = sanitizeRuntimeConfig(await getRuntimeConfig(env));
        const cfZoneId = String(config.cfZoneId || "").trim();
        const cfApiToken = String(config.cfApiToken || "").trim();
        if (!cfZoneId || !cfApiToken) return jsonError("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");

        try {
            const zone = await fetchCloudflareZoneDetails(cfZoneId, cfApiToken).catch(() => null);
            const requestHost = normalizeHostnameText(new URL(request.url).hostname);
            const normalized = await listCloudflareDnsRecords(cfZoneId, cfApiToken);

            const zoneName = String(zone?.name || "").trim() || "";
            const inferredZoneName = zoneName || normalizeHostnameText(normalized[0]?.name || "");
            let currentHost = requestHost;
            if (!isHostnameInsideZone(currentHost, inferredZoneName || zoneName)) {
              currentHost = normalizeHostnameText(await resolveCloudflareBoundHostname({
                cfAccountId: config.cfAccountId,
                cfZoneId,
                cfApiToken,
                zoneNameFallback: inferredZoneName || zoneName || requestHost
              }));
            }

            const filteredRecords = currentHost
              ? normalized.filter(record => normalizeHostnameText(record.name) === currentHost && isEditableDnsRecordType(record.type))
              : normalized.filter(record => isEditableDnsRecordType(record.type));
            const history = currentHost
              ? await Database.getDnsHostHistory(kv, cfZoneId, currentHost)
              : [];

            return jsonResponse({
                ok: true,
                zoneId: cfZoneId,
                zoneName,
                currentHost,
                totalRecords: normalized.length,
                filteredCount: filteredRecords.length,
                records: filteredRecords,
                history
            });
        } catch (e) {
            const msg = String(e?.message || e || "unknown_error");
            const hint = msg.includes("cf_api_http_403")
              ? "Cloudflare DNS 读取失败：API 令牌权限不足（需要 Zone.DNS:Read）"
              : msg.includes("cf_api_http_401")
                ? "Cloudflare DNS 读取失败：API 令牌无效"
                : "Cloudflare DNS 读取失败";
            return jsonError("CF_DNS_LIST_FAILED", hint, 400, { reason: msg });
        }
    },

    async updateDnsRecord(data, { env, kv, request }) {
        if (request.headers.get("X-Admin-Confirm") !== "updateDnsRecord") {
            return jsonError("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
        }
        const recordId = String(data?.recordId || data?.id || "").trim();
        const nextType = String(data?.type || "").trim().toUpperCase();
        const nextContent = String(data?.content || "").trim();

        if (!recordId) return jsonError("MISSING_PARAMS", "recordId 不能为空");
        if (!isEditableDnsRecordType(nextType)) return jsonError("INVALID_TYPE", "Type 仅允许 A / AAAA / CNAME");
        const validationError = getDnsContentValidationError(nextType, nextContent);
        if (validationError) return jsonError("INVALID_CONTENT", validationError);

        const config = sanitizeRuntimeConfig(await getRuntimeConfig(env));
        const cfZoneId = String(config.cfZoneId || "").trim();
        const cfApiToken = String(config.cfApiToken || "").trim();
        if (!cfZoneId || !cfApiToken) return jsonError("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");

        try {
            const getUrl = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(cfZoneId)}/dns_records/${encodeURIComponent(recordId)}`;
            const existingPayload = await fetchCloudflareApiJson(getUrl, cfApiToken);
            const existing = normalizeEditableDnsRecord(existingPayload?.result || null);
            if (!existing?.id) return jsonError("NOT_FOUND", "DNS 记录不存在", 404);

            const currentType = String(existing?.type || "").toUpperCase();
            if (!isEditableDnsRecordType(currentType)) {
                return jsonError("UNSUPPORTED_RECORD_TYPE", "该 DNS 记录类型不支持编辑", 400, { currentType });
            }

            const updateBody = buildCloudflareDnsRecordBody(existing, {
                host: existing.name,
                type: nextType,
                content: nextContent
            });

            const updatePayload = await fetchCloudflareApiJson(getUrl, cfApiToken, {
                method: "PUT",
                body: JSON.stringify(updateBody)
            });

            const updated = normalizeEditableDnsRecord(updatePayload?.result || { id: recordId, ...updateBody });
            const history = updated.type === "CNAME"
              ? await Database.recordDnsHostHistory(kv, cfZoneId, updated.name, {
                  name: updated.name,
                  type: updated.type,
                  content: updated.content,
                  actor: "admin",
                  source: "ui",
                  requestHost: normalizeHostnameText(new URL(request.url).hostname),
                  savedAt: new Date().toISOString()
                })
              : await Database.getDnsHostHistory(kv, cfZoneId, updated.name);
            return jsonResponse({
                ok: true,
                record: updated,
                history
            });
        } catch (e) {
            const msg = String(e?.message || e || "unknown_error");
            const hint = msg.includes("cf_api_http_403")
              ? "Cloudflare DNS 更新失败：API 令牌权限不足（需要 Zone.DNS:Edit）"
              : msg.includes("cf_api_http_401")
                ? "Cloudflare DNS 更新失败：API 令牌无效"
                : "Cloudflare DNS 更新失败";
            return jsonError("CF_DNS_UPDATE_FAILED", hint, 400, { reason: msg });
        }
    },

    async saveDnsRecords(data, { env, kv, request }) {
        if (request.headers.get("X-Admin-Confirm") !== "saveDnsRecords") {
            return jsonError("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
        }

        const mode = normalizeDnsEditModeValue(data?.mode);
        const host = normalizeHostnameText(data?.host || "");
        const rawDesiredRecords = Array.isArray(data?.records) ? data.records : [];
        if (!host) return jsonError("MISSING_PARAMS", "host 不能为空");

        /** @type {{ type: string, content: string }[]} */
        const desiredRecords = [];
        if (mode === "cname") {
            const content = String(rawDesiredRecords[0]?.content || "").trim();
            const validationError = getDnsContentValidationError("CNAME", content);
            if (validationError) return jsonError("INVALID_CONTENT", validationError);
            desiredRecords.push({ type: "CNAME", content });
        } else {
            const normalizedDesiredRecords = rawDesiredRecords
              .map(item => ({
                type: String(item?.type || "").trim().toUpperCase(),
                content: String(item?.content || "").trim()
              }))
              .filter(item => item.type || item.content);
            if (!normalizedDesiredRecords.length) {
                return jsonError("INVALID_CONTENT", "A 模式至少保留 1 条 A / AAAA 记录");
            }
            for (const record of normalizedDesiredRecords) {
                if (!["A", "AAAA"].includes(record.type)) {
                    return jsonError("INVALID_TYPE", "A 模式仅允许 A / AAAA");
                }
                const validationError = getDnsContentValidationError(record.type, record.content, { allowCname: false });
                if (validationError) return jsonError("INVALID_CONTENT", validationError);
                desiredRecords.push(record);
            }
        }

        const config = sanitizeRuntimeConfig(await getRuntimeConfig(env));
        const cfZoneId = String(config.cfZoneId || "").trim();
        const cfApiToken = String(config.cfApiToken || "").trim();
        if (!cfZoneId || !cfApiToken) return jsonError("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");

        try {
            const zone = await fetchCloudflareZoneDetails(cfZoneId, cfApiToken).catch(() => null);
            const zoneName = String(zone?.name || "").trim() || "";
            if (zoneName && !isHostnameInsideZone(host, zoneName)) {
                return jsonError("INVALID_HOST", "当前站点不在该 Zone 下");
            }

            const requestHost = normalizeHostnameText(new URL(request.url).hostname);
            const existingRecords = await listCloudflareDnsRecords(cfZoneId, cfApiToken);
            const hostRecords = existingRecords.filter(record => normalizeHostnameText(record.name) === host && isEditableDnsRecordType(record.type));
            const baseRecord = hostRecords[0] || { name: host, ttl: 1, proxied: false };
            const zoneRecordsUrl = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(cfZoneId)}/dns_records`;

            const deleteRecord = async (record) => {
                if (!record?.id) return;
                await fetchCloudflareApiJson(`${zoneRecordsUrl}/${encodeURIComponent(record.id)}`, cfApiToken, { method: "DELETE" });
            };

            const updateRecord = async (record, nextType, nextContent) => {
                const body = buildCloudflareDnsRecordBody(record, { host, type: nextType, content: nextContent });
                const payload = await fetchCloudflareApiJson(`${zoneRecordsUrl}/${encodeURIComponent(record.id)}`, cfApiToken, {
                    method: "PUT",
                    body: JSON.stringify(body)
                });
                return normalizeEditableDnsRecord(payload?.result || { id: record.id, ...body });
            };

            const createRecord = async (nextType, nextContent, seedRecord = baseRecord) => {
                const body = buildCloudflareDnsRecordBody(seedRecord, { host, type: nextType, content: nextContent });
                const payload = await fetchCloudflareApiJson(zoneRecordsUrl, cfApiToken, {
                    method: "POST",
                    body: JSON.stringify(body)
                });
                return normalizeEditableDnsRecord(payload?.result || body);
            };

            const syncRecordsByType = async (type, nextRecords, currentRecords) => {
                for (let index = nextRecords.length; index < currentRecords.length; index += 1) {
                    await deleteRecord(currentRecords[index]);
                }
                for (let index = 0; index < nextRecords.length; index += 1) {
                    const desired = nextRecords[index];
                    const existing = currentRecords[index];
                    if (existing) {
                        if (String(existing.content || "").trim() !== desired.content || String(existing.type || "").toUpperCase() !== type) {
                            await updateRecord(existing, type, desired.content);
                        }
                        continue;
                    }
                    await createRecord(type, desired.content, currentRecords[0] || baseRecord);
                }
            };

            if (mode === "cname") {
                const currentCnameRecords = hostRecords.filter(record => record.type === "CNAME");
                const currentAddressRecords = hostRecords.filter(record => record.type === "A" || record.type === "AAAA");
                for (const record of currentAddressRecords) await deleteRecord(record);
                for (let index = 1; index < currentCnameRecords.length; index += 1) {
                    await deleteRecord(currentCnameRecords[index]);
                }
                const primaryCname = currentCnameRecords[0] || null;
                const desiredCname = desiredRecords[0];
                if (primaryCname) {
                    if (String(primaryCname.content || "").trim() !== desiredCname.content) {
                        await updateRecord(primaryCname, "CNAME", desiredCname.content);
                    }
                } else {
                    await createRecord("CNAME", desiredCname.content, baseRecord);
                }
                await Database.recordDnsHostHistory(kv, cfZoneId, host, {
                    name: host,
                    type: "CNAME",
                    content: desiredCname.content,
                    actor: "admin",
                    source: "ui",
                    requestHost,
                    savedAt: new Date().toISOString()
                });
            } else {
                const currentCnameRecords = hostRecords.filter(record => record.type === "CNAME");
                for (const record of currentCnameRecords) await deleteRecord(record);
                await syncRecordsByType("A", desiredRecords.filter(record => record.type === "A"), hostRecords.filter(record => record.type === "A"));
                await syncRecordsByType("AAAA", desiredRecords.filter(record => record.type === "AAAA"), hostRecords.filter(record => record.type === "AAAA"));
            }

            const refreshedRecords = await listCloudflareDnsRecords(cfZoneId, cfApiToken);
            const filteredRecords = refreshedRecords.filter(record => normalizeHostnameText(record.name) === host && isEditableDnsRecordType(record.type));
            const history = await Database.getDnsHostHistory(kv, cfZoneId, host);

            return jsonResponse({
                ok: true,
                zoneId: cfZoneId,
                zoneName,
                currentHost: host,
                totalRecords: refreshedRecords.length,
                filteredCount: filteredRecords.length,
                records: filteredRecords,
                history,
                mode
            });
        } catch (e) {
            const msg = String(e?.message || e || "unknown_error");
            const hint = msg.includes("cf_api_http_403")
              ? "Cloudflare DNS 保存失败：API 令牌权限不足（需要 Zone.DNS:Edit）"
              : msg.includes("cf_api_http_401")
                ? "Cloudflare DNS 保存失败：API 令牌无效"
                : "Cloudflare DNS 保存失败";
            return jsonError("CF_DNS_SAVE_FAILED", hint, 400, { reason: msg });
        }
    },

    async testTelegram(data) {
        const { tgBotToken, tgChatId } = data;
        if (!tgBotToken || !tgChatId) return jsonError("MISSING_PARAMS", "请先填写 Bot Token 和 Chat ID");
        try {
            const msgText = "✅ Emby Proxy: Telegram 机器人测试通知成功！\n如果您能看到这条消息，说明您的通知配置完全正确。";
            await Database.sendTelegramMessage({ tgBotToken, tgChatId, text: msgText });
            return jsonResponse({ success: true });
        } catch (e) {
            return jsonError("NETWORK_ERROR", e.message);
        }
    },

    async sendDailyReport(data, { env }) {
        try {
            await Database.sendDailyTelegramReport(env);
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders } });
        } catch (e) {
            return jsonError("REPORT_FAILED", e.message);
        }
    },

    async pingNode(data, { env, ctx }) {
        const currentConfig = await getRuntimeConfig(env);
        const timeoutMs = clampIntegerConfig(data.timeout, currentConfig.pingTimeout ?? Config.Defaults.PingTimeoutMs, 1000, 180000);
        const forceRefresh = data.forceRefresh === true;

        if (data.target) {
          const normalizedTarget = Database.normalizeSingleTarget(data.target);
          if (!normalizedTarget) return jsonError("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
          const ms = await Database.pingTarget(normalizedTarget, timeoutMs);
          return jsonResponse({ ms, target: normalizedTarget, usedCache: false, scope: "target" });
        }

        const nodeName = String(data.name || "").trim();
        const node = await Database.getNode(nodeName, env, ctx);
        if (!node || !Array.isArray(node.lines) || !node.lines.length) return jsonError("NOT_FOUND", "节点不存在");

        const cacheMinutes = clampIntegerConfig(currentConfig.pingCacheMinutes, Config.Defaults.PingCacheMinutes, 0, 1440);
        const requestedLineId = String(data.lineId || "").trim();
        const silent = data.silent === true && !!requestedLineId;
        const linesToProbe = requestedLineId
          ? node.lines.filter(line => line.id === requestedLineId)
          : node.lines.slice();
        if (requestedLineId && !linesToProbe.length) return jsonError("LINE_NOT_FOUND", "线路不存在", 404);

        const probedLines = await Promise.all(linesToProbe.map(async (line) => {
          const useCache = !forceRefresh && Database.isPingCacheFresh(line, cacheMinutes);
          if (useCache) return { ...line, usedCache: true };
          const ms = await Database.pingTarget(line.target, timeoutMs);
          return {
            ...line,
            latencyMs: ms,
            latencyUpdatedAt: new Date().toISOString(),
            usedCache: false
          };
        }));

        let allUsedCache = probedLines.length > 0 && probedLines.every(line => line.usedCache === true);
        let nextLines = node.lines.map(line => {
          const updated = probedLines.find(item => item.id === line.id);
          return updated
            ? {
                id: updated.id,
                name: updated.name,
                target: updated.target,
                latencyMs: updated.latencyMs,
                latencyUpdatedAt: updated.latencyUpdatedAt
              }
            : line;
        });
        let nextActiveLineId = Database.resolveActiveLineId(node.activeLineId, nextLines, nextLines);

        if (!silent) {
          nextLines = Database.sortNodeLinesByLatency(nextLines);
          nextActiveLineId = nextLines[0]?.id || nextActiveLineId;
        }

        const normalizedNode = Database.normalizeNode(nodeName, {
          ...node,
          lines: nextLines,
          activeLineId: nextActiveLineId,
          updatedAt: new Date().toISOString()
        }).data;

        const kv = Database.getKV(env);
        if (kv) {
          await kv.put(`${Database.PREFIX}${nodeName.toLowerCase()}`, JSON.stringify(normalizedNode));
          Database.invalidateNodeCaches(nodeName, { invalidateList: true });
          setBoundedMapEntry(GLOBALS.NodeCache, nodeName.toLowerCase(), { data: normalizedNode, exp: nowMs() + Config.Defaults.CacheTTL }, Config.Defaults.NodeCacheMax);
        }

        const activeLine = Database.getActiveNodeLine(normalizedNode);
        const matchedLine = requestedLineId
          ? normalizedNode.lines.find(line => line.id === requestedLineId)
          : activeLine;
        return jsonResponse({
          ms: Number(matchedLine?.latencyMs ?? activeLine?.latencyMs ?? 9999),
          usedCache: allUsedCache,
          sorted: !silent,
          activeLineId: normalizedNode.activeLineId,
          activeLineName: activeLine?.name || "",
          line: matchedLine || null,
          node: { name: nodeName.toLowerCase(), ...normalizedNode }
        });
    },

    async getLogs(data, { db, env }) {
      if (!db) return new Response(JSON.stringify({ error: "D1 not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { page = 1, pageSize = 50, filters = {} } = data;
      const safePage = Math.max(1, parseInt(page, 10) || 1);
      const safePageSize = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 50));
      const offset = (safePage - 1) * safePageSize;
      const now = Date.now();
      const defaultWindowMs = Config.Defaults.LogQueryDefaultDays * 24 * 60 * 60 * 1000;
      const parseStartDate = (value) => {
        if (!value) return null;
        const ts = new Date(String(value)).getTime();
        return Number.isFinite(ts) ? ts : null;
      };
      const parseEndDate = (value) => {
        if (!value) return null;
        const ts = new Date(String(value) + "T23:59:59.999").getTime();
        return Number.isFinite(ts) ? ts : null;
      };

      let startTs = parseStartDate(filters.startDate);
      let endTs = parseEndDate(filters.endDate);
      if (!Number.isFinite(endTs)) endTs = now;
      if (!Number.isFinite(startTs)) startTs = Math.max(0, endTs - defaultWindowMs);
      if (startTs > endTs) [startTs, endTs] = [Math.max(0, endTs - defaultWindowMs), endTs];

      const runtimeConfig = env ? await getRuntimeConfig(env) : {};
      const searchMode = normalizeLogSearchMode(filters.searchMode || runtimeConfig.logSearchMode);
      const whereClause = ["proxy_logs.timestamp >= ?", "proxy_logs.timestamp <= ?"];
      /** @type {(number | string)[]} */
      const params = [startTs, endTs];
      const keyword = String(filters.keyword || "").trim();
      let useFtsKeyword = false;
      if (keyword) {
        const maxKeywordWindowMs = Config.Defaults.LogKeywordMaxWindowDays * 24 * 60 * 60 * 1000;
        if ((endTs - startTs) > maxKeywordWindowMs) {
          return jsonError("LOG_QUERY_RANGE_TOO_WIDE", `关键词搜索必须限制在 ${Config.Defaults.LogKeywordMaxWindowDays} 天内`, 400, {
            maxWindowDays: Config.Defaults.LogKeywordMaxWindowDays
          });
        }
        if (/^\d{3}$/.test(keyword)) {
          whereClause.push("proxy_logs.status_code = ?");
          params.push(Number(keyword));
        } else if (isLikelyIpAddress(keyword)) {
          whereClause.push("proxy_logs.client_ip = ?");
          params.push(keyword);
        } else if (searchMode === "fts") {
          whereClause.push(`${Database.LOGS_FTS_TABLE} MATCH ?`);
          params.push(buildFtsMatchQuery(keyword));
          useFtsKeyword = true;
        } else {
          const likeKeyword = `%${escapeSqlLike(keyword)}%`;
          whereClause.push("(proxy_logs.node_name LIKE ? ESCAPE '\\' OR proxy_logs.request_path LIKE ? ESCAPE '\\' OR proxy_logs.user_agent LIKE ? ESCAPE '\\' OR proxy_logs.error_detail LIKE ? ESCAPE '\\')");
          params.push(likeKeyword, likeKeyword, likeKeyword, likeKeyword);
        }
      }
      if (filters.category) {
        whereClause.push("proxy_logs.category = ?");
        params.push(String(filters.category));
      }
      if (filters.playbackMode) {
        whereClause.push("proxy_logs.error_detail LIKE ? ESCAPE '\\'");
        params.push(`%${escapeSqlLike(`Playback=${String(filters.playbackMode)}`)}%`);
      }

      const where = "WHERE " + whereClause.join(" AND ");
      const fromClause = useFtsKeyword
        ? `FROM proxy_logs INNER JOIN ${Database.LOGS_FTS_TABLE} ON ${Database.LOGS_FTS_TABLE}.rowid = proxy_logs.id`
        : "FROM proxy_logs";
      let total = 0;
      let logsResult = { results: [] };
      try {
        total = (await db.prepare(`SELECT COUNT(*) as total ${fromClause} ${where}`).bind(...params).first())?.total || 0;
        logsResult = await db.prepare(`SELECT proxy_logs.* ${fromClause} ${where} ORDER BY proxy_logs.timestamp DESC LIMIT ? OFFSET ?`).bind(...params, safePageSize, offset).all();
      } catch (error) {
        const message = String(error?.message || error || "");
        if (useFtsKeyword && /no such table:\s*proxy_logs_fts/i.test(message)) {
          return jsonError("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化 FTS5”", 400, { searchMode });
        }
        if (useFtsKeyword && /fts5/i.test(message)) {
          return jsonError("LOG_FTS_QUERY_INVALID", "FTS 查询语法无效，请检查引号、布尔表达式或前缀写法", 400, { detail: message });
        }
        throw error;
      }
      
      return new Response(JSON.stringify({
        logs: logsResult.results || [],
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages: Math.ceil(total / safePageSize),
        searchMode,
        range: {
          startDate: new Date(startTs).toISOString(),
          endDate: new Date(endTs).toISOString()
        }
      }), { headers: { ...corsHeaders } });
    },

    async clearLogs(data, { db, env, ctx }) {
      if (!db) return new Response(JSON.stringify({ error: "D1 not configured" }), { status: 500, headers: { ...corsHeaders } });
      await Database.ensureLogsBaseSchema(db);
      const clearEpochMs = nowMs();
      GLOBALS.LogClearEpochMs = Math.max(GLOBALS.LogClearEpochMs || 0, clearEpochMs);
      await Database.patchOpsStatus(env || db, {
        log: {
          clearEpochMs,
          clearEpochAt: new Date(clearEpochMs).toISOString()
        }
      }, ctx);
      const activeFlushTask = GLOBALS.LogFlushTask;
      if (activeFlushTask) {
        try {
          await activeFlushTask;
        } catch {}
      }
      GLOBALS.LogQueue.length = 0;
      GLOBALS.LogDedupe.clear();
      GLOBALS.LogLastFlushAt = 0;
      await db.prepare(`DELETE FROM ${Database.LOGS_TABLE}`).run();
      let ftsRebuilt = false;
      try {
        ftsRebuilt = await Database.rebuildLogsFts(db);
      } catch (error) {
        console.warn("clearLogs FTS rebuild failed", error);
      }
      return new Response(JSON.stringify({ success: true, ftsRebuilt }), { headers: { ...corsHeaders } });
    },

    async initLogsDb(data, { db }) {
      if (!db) return new Response(JSON.stringify({ error: "D1 not configured" }), { status: 500, headers: { ...corsHeaders } });
      await Database.ensureLogsBaseSchema(db);
      await this.ensureSysStatusTable(db);
      
      return new Response(JSON.stringify({ success: true, schemaVersion: 3, categoryEnabled: true, ftsReady: await Database.hasLogsFtsTable(db) }), { headers: { ...corsHeaders } });
    },

    async initLogsFts(data, { db }) {
      if (!db) return new Response(JSON.stringify({ error: "D1 not configured" }), { status: 500, headers: { ...corsHeaders } });
      const result = await Database.ensureLogsFtsSchema(db);
      await this.ensureSysStatusTable(db);
      return new Response(JSON.stringify({
        success: true,
        ftsReady: true,
        migratedRows: result.migratedRows,
        droppedTriggers: result.droppedTriggers,
        triggerMode: "insert_only"
      }), { headers: { ...corsHeaders } });
    }
  },

  // ============================================================================
  // 重构后的 handleApi 主函数：极简派发器
  // 边界说明：
  // 1. 这里只做四件事：鉴别 KV、解析 JSON、归一 action、构造上下文后派发。
  // 2. 这里不承载业务判断，业务复杂度应留在 ApiHandlers 的具体动作中。
  // 3. 当需要新增管理功能时，优先保证这里继续保持“薄派发层”。
  // ============================================================================
  async handleApi(request, env, ctx) {
    const kv = this.getKV(env);
    if (!kv) {
        return new Response(JSON.stringify({ error: "kv_missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let data; 
    try { 
        data = await request.json(); 
    } catch { 
        return jsonError("INVALID_JSON", "请求 JSON 无效", 400); 
    }

    const normalizedRequest = this.normalizeAdminActionRequest(data);
    if (!normalizedRequest) {
        return jsonError("INVALID_REQUEST", "请求体必须是 JSON 对象", 400);
    }

    const actionName = (normalizedRequest.action === "save" || normalizedRequest.action === "import") ? "saveOrImport" : normalizedRequest.action;
    const handler = this.ApiHandlers[actionName];

    if (!handler) {
        return jsonError("INVALID_ACTION", "未知的管理动作", 400, { action: normalizedRequest.action || null });
    }

    const context = {
        action: normalizedRequest.action,
        meta: normalizedRequest.meta,
        request,
        env,
        ctx,
        kv,
        db: this.getDB(env)
    };

    return await handler.call(this, normalizedRequest.data, context);
  }
};

// ============================================================================
// 3. 代理模块 (PROXY MODULE - 核心缓冲防护与 CORS 重构)
// ============================================================================
function getMediaAuthorizationScheme(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.startsWith("emby ")) return "emby";
  if (normalized.startsWith("mediabrowser ")) return "mediabrowser";
  return "";
}

function rewriteMediaAuthorizationScheme(value = "", scheme = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  const suffix = text.replace(/^[^\s]+\s+/i, "").trim();
  if (!suffix) return text;
  if (scheme === "emby") return `Emby ${suffix}`;
  if (scheme === "mediabrowser") return `MediaBrowser ${suffix}`;
  return text;
}

function normalizeMediaAuthHeaders(headers, nodeMediaAuthMode = "auto") {
  const mediaAuthMode = normalizeNodeMediaAuthMode(nodeMediaAuthMode);
  if (mediaAuthMode === "passthrough") return headers;

  // 优先以标准 Authorization 为真相源；兼容头仅在需要时做同族同步。
  const standardAuthorization = headers.get("Authorization")?.trim() || "";
  const legacyEmbyAuthorization = headers.get("X-Emby-Authorization")?.trim() || "";
  const mediaBrowserAuthorization = headers.get("X-MediaBrowser-Authorization")?.trim() || "";
  const standardScheme = getMediaAuthorizationScheme(standardAuthorization);
  const mediaBrowserScheme = getMediaAuthorizationScheme(mediaBrowserAuthorization);
  const legacyEmbyScheme = getMediaAuthorizationScheme(legacyEmbyAuthorization);

  let canonicalAuthorization = standardScheme
    ? standardAuthorization
    : (mediaBrowserScheme
      ? mediaBrowserAuthorization
      : (legacyEmbyScheme ? legacyEmbyAuthorization : ""));

  if (!canonicalAuthorization) return headers;

  const targetScheme = mediaAuthMode === "emby"
    ? "emby"
    : mediaAuthMode === "jellyfin"
      ? "mediabrowser"
      : (standardScheme || mediaBrowserScheme || legacyEmbyScheme || "");

  canonicalAuthorization = rewriteMediaAuthorizationScheme(canonicalAuthorization, targetScheme);
  headers.set("Authorization", canonicalAuthorization);

  if (targetScheme === "mediabrowser") {
    headers.set("X-MediaBrowser-Authorization", canonicalAuthorization);
    headers.delete("X-Emby-Authorization");
    return headers;
  }

  if (targetScheme === "emby") {
    headers.set("X-Emby-Authorization", canonicalAuthorization);
    headers.delete("X-MediaBrowser-Authorization");
  }
  return headers;
}
const Proxy = {
  // Proxy 模块阅读顺序建议：
  // 1. resolve/evaluate/classify：环境裁决与请求分类
  // 2. build*：请求状态、响应头、跳转头整形
  // 3. perform/fetch*：上游访问与重试循环
  // 4. handle：把上述阶段串成完整代理链路
  resolveCorsOrigin(currentConfig, request) {
    const reqOrigin = request.headers.get("Origin");
    const allowedOrigins = String(currentConfig.corsOrigins || "").split(",").map(i => i.trim()).filter(Boolean);
    if (allowedOrigins.length > 0) return reqOrigin && allowedOrigins.includes(reqOrigin) ? reqOrigin : allowedOrigins[0];
    return reqOrigin || "*";
  },
  buildEdgeResponseHeaders(finalOrigin, extra = {}) {
    const headers = new Headers({ "Access-Control-Allow-Origin": finalOrigin, "Cache-Control": "no-store", ...extra });
    applySecurityHeaders(headers);
    return headers;
  },
  classifyRequest(request, proxyPath, requestUrl, currentConfig, options = {}) {
    const rangeHeader = request.headers.get("Range");
    const isImage = GLOBALS.Regex.EmbyImages.test(proxyPath) || GLOBALS.Regex.ImageExt.test(proxyPath);
    const isStaticFile = GLOBALS.Regex.StaticExt.test(proxyPath);
    const isSubtitle = GLOBALS.Regex.SubtitleExt.test(proxyPath);
    const isManifest = GLOBALS.Regex.ManifestExt.test(proxyPath);
    const isSegment = GLOBALS.Regex.SegmentExt.test(proxyPath);
    const isWsUpgrade = request.headers.get("Upgrade")?.toLowerCase() === "websocket";
    const looksLikeVideoRoute = GLOBALS.Regex.Streaming.test(proxyPath) || /\/videos\/[^/]+\/(stream|original|download|file)/i.test(proxyPath) || /\/items\/[^/]+\/download/i.test(proxyPath) || requestUrl.searchParams.get("Static") === "true" || requestUrl.searchParams.get("Download") === "true";
    const isSafeMethod = request.method === "GET" || request.method === "HEAD";
    const isBigStream = looksLikeVideoRoute && !isManifest && !isSegment && !isSubtitle && !isImage;
    const isApiRequest = !isImage && !isStaticFile && !isSubtitle && !isManifest && !isSegment && !isBigStream && !isWsUpgrade;
    // 节点直连只放行厚重媒体字节流，避免前端静态资源与 API 被 307 误伤。
    const nodeDirectMedia = options.nodeDirectSource === true && isSafeMethod && isBigStream;
    const directStaticAssets = options.directStaticAssets === true && isSafeMethod && isStaticFile;
    // WebVTT 字幕轨继续走 Worker 缓存：307 直连会额外多一次跳转，双语字幕场景通常更容易比代理缓存更慢。
    const directHlsDash = options.directHlsDash === true && isSafeMethod && (isManifest || isSegment);
    const direct307Mode = nodeDirectMedia || directStaticAssets || directHlsDash;
    const enablePrewarm = currentConfig.enablePrewarm !== false && !direct307Mode;
    const prewarmCacheTtl = clampIntegerConfig(currentConfig.prewarmCacheTtl, Config.Defaults.PrewarmCacheTtl, 0, 3600);
    const prewarmDepth = normalizePrewarmDepth(currentConfig.prewarmDepth);
    const isMetadataCacheable = request.method === "GET" && !isWsUpgrade && !direct307Mode && (isImage || isSubtitle || isManifest);
    const isCacheableAsset = request.method === "GET" && !isWsUpgrade && (isImage || isStaticFile || isSubtitle || isSegment || isManifest);
    const canStripAuthOnProtocolFallback = isSafeMethod && !isApiRequest && (isBigStream || isManifest || isSegment);
    return {
      rangeHeader,
      enablePrewarm,
      prewarmCacheTtl,
      prewarmDepth,
      isImage,
      isStaticFile,
      isSubtitle,
      isManifest,
      isSegment,
      isWsUpgrade,
      looksLikeVideoRoute,
      isBigStream,
      isApiRequest,
      isMetadataCacheable,
      isCacheableAsset,
      nodeDirectMedia,
      directStaticAssets,
      directHlsDash,
      canStripAuthOnProtocolFallback,
      direct307Mode
    };
  },
  evaluateFirewall(currentConfig, clientIp, country, finalOrigin) {
    const ipBlacklist = String(currentConfig.ipBlacklist || "").split(",").map(i => i.trim()).filter(Boolean);
    if (ipBlacklist.includes(clientIp)) {
      return new Response("Forbidden by IP Firewall", { status: 403, headers: this.buildEdgeResponseHeaders(finalOrigin) });
    }

    const geoAllow = String(currentConfig.geoAllowlist || "").split(",").map(i => i.trim().toUpperCase()).filter(Boolean);
    const geoBlock = String(currentConfig.geoBlocklist || "").split(",").map(i => i.trim().toUpperCase()).filter(Boolean);
    if ((geoAllow.length > 0 && !geoAllow.includes(country)) || (geoBlock.length > 0 && geoBlock.includes(country))) {
      return new Response("Forbidden by Geo Firewall", { status: 403, headers: this.buildEdgeResponseHeaders(finalOrigin) });
    }

    return null;
  },
  applyRateLimit(currentConfig, clientIp, requestTraits, startTime, finalOrigin) {
    const rpmLimit = parseInt(currentConfig.rateLimitRpm) || 0;
    const shouldRateLimit = rpmLimit > 0 && !(requestTraits.isManifest || requestTraits.isSegment || requestTraits.isBigStream);
    if (!shouldRateLimit) return null;
    let rlData = GLOBALS.RateLimitCache.get(clientIp);
    if (!rlData || startTime > rlData.resetAt) rlData = { count: 0, resetAt: startTime + 60000 };
    rlData.count += 1;
    GLOBALS.RateLimitCache.set(clientIp, rlData);
    if (rlData.count > rpmLimit) {
      return new Response("Rate Limit Exceeded", { status: 429, headers: this.buildEdgeResponseHeaders(finalOrigin) });
    }
    return null;
  },
  parseTargetBases(node, finalOrigin) {
    const orderedLines = Database.getOrderedNodeLines(node);
    const rawTargets = orderedLines.length
      ? orderedLines.map(line => line.target)
      : String(node.target || "").split(",").map(item => item.trim()).filter(Boolean);
    const targetBases = rawTargets.map(item => {
      try { return new URL(item); } catch { return null; }
    }).filter(url => url && ["http:", "https:"].includes(url.protocol));
    if (!targetBases.length) {
      return { targetBases, invalidResponse: new Response("Invalid Node Target", { status: 502, headers: this.buildEdgeResponseHeaders(finalOrigin) }) };
    }
    return { targetBases, invalidResponse: null };
  },
  async buildProxyRequestState(request, node, proxyPath, requestUrl, clientIp, requestTraits, forceH1, targetBases) {
    const newHeaders = new Headers(request.headers);
    GLOBALS.DropRequestHeaders.forEach(h => newHeaders.delete(h));

    const adminCustomHeaders = new Set();
    let adminCustomCookie = null;
    if (node.headers && typeof node.headers === "object") {
      for (const [hKey, hVal] of Object.entries(node.headers)) {
        const lowerKey = String(hKey).toLowerCase();
        if (GLOBALS.DropRequestHeaders.has(lowerKey)) continue;
        adminCustomHeaders.add(lowerKey);
        if (lowerKey === "cookie") adminCustomCookie = String(hVal);
        else newHeaders.set(hKey, String(hVal));
      }
    }

    const mergedCookie = mergeAndSanitizeCookieHeaders(newHeaders.get("Cookie"), adminCustomCookie, ["auth_token"]);
    if (mergedCookie) newHeaders.set("Cookie", mergedCookie);
    else newHeaders.delete("Cookie");

    normalizeMediaAuthHeaders(newHeaders, node.mediaAuthMode);

    const realClientIpHeaderMode = getRealClientIpHeaderMode(node);
    if (realClientIpHeaderMode === "full" || realClientIpHeaderMode === "real-ip-only") {
      newHeaders.set("X-Real-IP", clientIp);
    }
    if (realClientIpHeaderMode === "full") {
      newHeaders.set("X-Forwarded-For", clientIp);
    }
    newHeaders.set("X-Forwarded-Host", requestUrl.host);
    newHeaders.set("X-Forwarded-Proto", requestUrl.protocol.replace(":", ""));
    if (requestTraits.isWsUpgrade) {
      newHeaders.set("Upgrade", "websocket");
      newHeaders.set("Connection", "Upgrade");
    } else if (forceH1) {
      newHeaders.set("Connection", "keep-alive");
    }
    if ((requestTraits.isBigStream || requestTraits.isSegment || requestTraits.isManifest) && !adminCustomHeaders.has("referer")) {
      newHeaders.delete("Referer");
    }

    const isNonIdempotent = request.method !== "GET" && request.method !== "HEAD";
    let preparedBody = null;
    let preparedBodyMode = "none";
    if (isNonIdempotent && request.body) {
      const contentLength = parseContentLengthHeader(request.headers.get("Content-Length"));
      const canBufferRetryBody = Number.isFinite(contentLength) && contentLength >= 0 && contentLength <= Config.Defaults.BufferedRetryBodyMaxBytes;
      if (canBufferRetryBody) {
        try {
          preparedBody = await request.clone().arrayBuffer();
          preparedBodyMode = "buffered";
        } catch {
          preparedBody = request.body;
          preparedBodyMode = "stream";
        }
      } else {
        preparedBody = request.body;
        preparedBodyMode = "stream";
      }
    }
    const retryTargets = isNonIdempotent ? targetBases.slice(0, 1) : targetBases;
    const allowAutomaticRetry = !isNonIdempotent;

    return {
      newHeaders,
      adminCustomHeaders,
      preparedBody,
      preparedBodyMode,
      retryTargets,
      allowAutomaticRetry
    };
  },
  evaluateRedirectDecision(nextUrl, activeTargetBase, redirectMethod, redirectBodyMode, policy) {
    const isSameOriginRedirect = nextUrl.origin === activeTargetBase.origin;
    const mustDirect = isSameOriginRedirect
      ? !policy.sourceSameOriginProxy
      : (!policy.forceExternalProxy || shouldDirectByWangpan(nextUrl, policy.wangpanDirectKeywords));
    if (mustDirect) {
      return { mustDirect: true, nextMethod: null, nextBodyMode: redirectBodyMode, isSameOriginRedirect };
    }
    const nextMethod = normalizeRedirectMethod(policy.currentStatus, redirectMethod);
    let nextBodyMode = redirectBodyMode;
    if (nextMethod === "GET" || nextMethod === "HEAD") nextBodyMode = "none";
    else if (redirectBodyMode === "stream") {
      return { mustDirect: true, nextMethod, nextBodyMode: redirectBodyMode, isSameOriginRedirect };
    }
    return { mustDirect: false, nextMethod, nextBodyMode, isSameOriginRedirect };
  },
  buildProxyResponseHeaders(response, request, dynamicCors, finalOrigin, requestTraits, options = {}) {
    const modifiedHeaders = new Headers(response.headers);

    if (GLOBALS.DropResponseHeaders) {
      GLOBALS.DropResponseHeaders.forEach(h => modifiedHeaders.delete(h));
    }

    modifiedHeaders.set("Access-Control-Allow-Origin", finalOrigin);

    if (dynamicCors && dynamicCors["Access-Control-Expose-Headers"]) {
      modifiedHeaders.set("Access-Control-Expose-Headers", dynamicCors["Access-Control-Expose-Headers"]);
    }

    if (dynamicCors && dynamicCors["Access-Control-Allow-Methods"]) {
      modifiedHeaders.set("Access-Control-Allow-Methods", dynamicCors["Access-Control-Allow-Methods"]);
    }

    const resReqHeaders = request.headers.get("Access-Control-Request-Headers");
    if (resReqHeaders) {
      modifiedHeaders.set("Access-Control-Allow-Headers", resReqHeaders);
      mergeVaryHeader(modifiedHeaders, "Access-Control-Request-Headers");
    } else if (dynamicCors && dynamicCors["Access-Control-Allow-Headers"]) {
      modifiedHeaders.set("Access-Control-Allow-Headers", dynamicCors["Access-Control-Allow-Headers"]);
    }

    if (finalOrigin !== "*") {
      mergeVaryHeader(modifiedHeaders, "Origin");
    }

    if (!options.enableH3 || options.forceH1) {
      modifiedHeaders.delete("Alt-Svc");
    }

    const imageCacheMaxAge = clampIntegerConfig(options.imageCacheMaxAge, Config.Defaults.CacheTtlImagesDays * 86400, 0, 365 * 86400);
    if (response.status >= 400 || requestTraits.isManifest) {
      modifiedHeaders.set("Cache-Control", "no-store");
    } else if (requestTraits.isImage || requestTraits.isStaticFile || requestTraits.isSubtitle) {
      modifiedHeaders.set("Cache-Control", `public, max-age=${imageCacheMaxAge}`);
    } else if (options.proxiedExternalRedirect) {
      modifiedHeaders.set("Cache-Control", "no-store");
    }

    applySecurityHeaders(modifiedHeaders);
    return modifiedHeaders;
  },
  applyProxyRedirectHeaders(modifiedHeaders, response, activeTargetBase, name, key, directRedirectUrl, responseUrl) {
    if (directRedirectUrl) {
      sanitizeSyntheticRedirectHeaders(modifiedHeaders);
      modifiedHeaders.set("Location", directRedirectUrl.toString());
      modifiedHeaders.set("Cache-Control", "no-store");
      return;
    }
    if (!(response.status >= 300 && response.status < 400)) return;
    const location = modifiedHeaders.get("Location");
    if (!location) return;
    const resolvedLocation = resolveRedirectTarget(location, responseUrl || activeTargetBase);
    const rewrittenLocation = translateUpstreamUrlToProxyLocation(resolvedLocation, activeTargetBase, name, key);
    if (rewrittenLocation) modifiedHeaders.set("Location", rewrittenLocation);
  },
  classifyProxyLogCategory(requestTraits) {
    if (requestTraits.isSegment) return "segment";
    if (requestTraits.isManifest) return "manifest";
    if (requestTraits.isBigStream) return "stream";
    if (requestTraits.isImage) return "image";
    if (requestTraits.isSubtitle) return "subtitle";
    if (requestTraits.isStaticFile) return "asset";
    if (requestTraits.isWsUpgrade) return "websocket";
    return "api";
  },
  isPlaybackInfoRequest(proxyPath) {
    return /\/playbackinfo\b/i.test(String(proxyPath || ""));
  },
  async extractPlaybackInfoDiagnostic(proxyPath, requestUrl, response) {
    if (!this.isPlaybackInfoRequest(proxyPath)) return null;
    if (!(response.status >= 200 && response.status < 300)) return null;
    const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
    if (!contentType.includes("json")) return null;
    try {
      const payload = await response.clone().json();
      const mediaSource = Array.isArray(payload?.MediaSources) ? payload.MediaSources[0] : null;
      if (!mediaSource || typeof mediaSource !== "object") return null;
      const transcodeUrl = String(mediaSource.TranscodingUrl || "");
      const supportsDirectPlay = mediaSource.SupportsDirectPlay === true;
      const supportsDirectStream = mediaSource.SupportsDirectStream === true;
      const mode = transcodeUrl
        ? "transcode"
        : supportsDirectPlay
          ? "direct_play"
          : supportsDirectStream
            ? "direct_stream"
            : "unknown";
      const hints = [`Playback=${mode}`];
      const subtitleStreamIndex = requestUrl.searchParams.get("SubtitleStreamIndex");
      if (subtitleStreamIndex !== null && subtitleStreamIndex !== "") hints.push(`ReqSubtitle=${subtitleStreamIndex}`);
      const subtitleMethod = requestUrl.searchParams.get("SubtitleMethod");
      if (subtitleMethod) hints.push(`SubtitleMethod=${subtitleMethod}`);
      const subtitleStreams = Array.isArray(mediaSource.MediaStreams)
        ? mediaSource.MediaStreams.filter(stream => String(stream?.Type || "").toLowerCase() === "subtitle")
        : [];
      if (subtitleStreams.length > 0) hints.push(`SubtitleTracks=${subtitleStreams.length}`);
      if (subtitleStreams.some(stream => stream?.IsExternal === true)) hints.push("ExternalSubtitle=yes");
      if (transcodeUrl) {
        if (/subtitle/i.test(transcodeUrl)) hints.push("SubtitleInTranscode=yes");
        if (/burn/i.test(transcodeUrl)) hints.push("SubtitleBurn=yes");
      }
      return hints.join(" | ");
    } catch {
      return null;
    }
  },
  extractProxyErrorDetail(response) {
    if (response.status < 400) return null;
    const hints = [];
    const srv = response.headers.get("Server");
    if (srv) hints.push(`Server: ${srv}`);
    const ray = response.headers.get("CF-Ray");
    if (ray) hints.push(`CF-Ray: ${ray}`);
    const mediaServerError = response.headers.get("X-Application-Error-Code")
      || response.headers.get("X-Emby-Error")
      || response.headers.get("X-MediaBrowser-Error");
    if (mediaServerError) hints.push(`Media-Server-Error: ${mediaServerError}`);
    const cfCache = response.headers.get("CF-Cache-Status");
    if (cfCache) hints.push(`CF-Cache: ${cfCache}`);
    return hints.length > 0 ? hints.join(" | ") : response.statusText;
  },
  buildMetadataCacheStorageResponse(response, requestTraits, options = {}) {
    const cacheHeaders = new Headers(response.headers);
    cacheHeaders.delete("Set-Cookie");
    if (requestTraits.isImage || requestTraits.isSubtitle) {
      cacheHeaders.set("Cache-Control", `public, max-age=${Math.max(0, Number(options.imageCacheMaxAge) || 0)}`);
    } else if (requestTraits.isManifest) {
      cacheHeaders.set("Cache-Control", `public, max-age=${Math.max(0, Number(options.prewarmCacheTtl) || 0)}`);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: cacheHeaders
    });
  },
  async storeMetadataCache(cacheKey, response, requestTraits, options = {}) {
    const cache = getDefaultCacheHandle();
    if (!cache || !cacheKey || !response || response.status !== 200) return false;
    if (requestTraits.isManifest && !shouldWorkerCacheMetadataUrl(options.sourceUrl)) return false;
    try {
      await cache.put(cacheKey, this.buildMetadataCacheStorageResponse(response, requestTraits, options));
      return true;
    } catch {
      return false;
    }
  },
  resolveMetadataTarget(candidate, activeTargetBase, name, key) {
    const raw = String(candidate || "").trim();
    if (!raw) return null;
    let upstreamUrl;
    try {
      if (/^https?:\/\//i.test(raw)) {
        upstreamUrl = new URL(raw);
      } else {
        const relativeUrl = new URL(raw, "https://metadata-prewarm.invalid");
        upstreamUrl = buildUpstreamProxyUrl(activeTargetBase, relativeUrl.pathname || "/");
        upstreamUrl.search = relativeUrl.search || "";
        upstreamUrl.hash = relativeUrl.hash || "";
      }
    } catch {
      return null;
    }
    if (isHeavyVideoBytePath(upstreamUrl.pathname)) return null;
    const proxyLocation = translateUpstreamUrlToProxyLocation(upstreamUrl, activeTargetBase, name, key);
    if (!proxyLocation) return null;
    let proxyUrl;
    try {
      proxyUrl = new URL(proxyLocation, "https://worker.invalid");
    } catch {
      return null;
    }
    const pathname = proxyUrl.pathname || "/";
    if (!(GLOBALS.Regex.EmbyImages.test(pathname) || GLOBALS.Regex.ImageExt.test(pathname) || GLOBALS.Regex.ManifestExt.test(pathname) || GLOBALS.Regex.SubtitleExt.test(pathname))) {
      return null;
    }
    return { upstreamUrl, proxyPath: pathname, proxySearch: proxyUrl.search || "" };
  },
  buildMetadataPrewarmTargets(proxyPath, payload, activeTargetBase, name, key, prewarmDepth) {
    const candidates = new Map();
    const itemId = extractProxyItemId(proxyPath);
    if (itemId) {
      const posterTarget = this.resolveMetadataTarget(`/Items/${encodeURIComponent(itemId)}/Images/Primary`, activeTargetBase, name, key);
      if (posterTarget) candidates.set(`${posterTarget.proxyPath}${posterTarget.proxySearch}`, posterTarget);
    }
    if (prewarmDepth !== "poster") {
      collectMetadataUrlStrings(payload).forEach(value => {
        const target = this.resolveMetadataTarget(value, activeTargetBase, name, key);
        if (!target) return;
        candidates.set(`${target.proxyPath}${target.proxySearch}`, target);
      });
    }
    return [...candidates.values()]
      .sort((a, b) => rankMetadataWarmPath(a.proxyPath) - rankMetadataWarmPath(b.proxyPath))
      .slice(0, 4);
  },
  async maybePrewarmMetadataResponse(request, response, requestTraits, activeTargetBase, buildFetchOptions, name, key, requestUrl, ctx, options = {}) {
    if (!ctx || request.method !== "GET" || requestTraits.enablePrewarm !== true) return;
    if (requestTraits.isImage || requestTraits.isSubtitle || requestTraits.isManifest || requestTraits.isSegment || requestTraits.isBigStream) return;
    if (!(response.status >= 200 && response.status < 300)) return;
    const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
    if (!contentType.includes("json")) return;
    let payload;
    try {
      payload = await response.clone().json();
    } catch {
      return;
    }
    const targets = this.buildMetadataPrewarmTargets(options.proxyPath, payload, activeTargetBase, name, key, requestTraits.prewarmDepth);
    if (!targets.length) return;
    ctx.waitUntil((async () => {
      const cache = getDefaultCacheHandle();
      for (const target of targets) {
        if (!shouldWorkerCacheMetadataUrl(target.upstreamUrl)) continue;
        const proxyUrl = new URL(`${target.proxyPath}${target.proxySearch}`, requestUrl.origin);
        const cacheKey = buildWorkerCacheKey(proxyUrl);
        if (cache && cacheKey) {
          try {
            const existing = await cache.match(cacheKey);
            if (existing) continue;
          } catch {}
        }
        try {
          const prewarmOptions = await buildFetchOptions(target.upstreamUrl, { method: "GET" });
          const prewarmHeaders = new Headers(prewarmOptions.headers);
          prewarmHeaders.delete("Range");
          prewarmHeaders.delete("If-Modified-Since");
          prewarmHeaders.delete("If-None-Match");
          prewarmHeaders.set("X-Metadata-Prewarm", "1");
          prewarmOptions.headers = prewarmHeaders;
          const prewarmTimeoutMs = clampIntegerConfig(options.prewarmTimeoutMs, Config.Defaults.MetadataPrewarmTimeoutMs, 250, 10000);
          let timeoutId = null;
          try {
            if (prewarmTimeoutMs > 0) {
              const controller = new AbortController();
              prewarmOptions.signal = controller.signal;
              timeoutId = setTimeout(() => controller.abort(), prewarmTimeoutMs);
            }
            const prewarmResponse = await fetch(target.upstreamUrl.toString(), prewarmOptions);
            const warmTraits = {
              isImage: GLOBALS.Regex.EmbyImages.test(target.proxyPath) || GLOBALS.Regex.ImageExt.test(target.proxyPath),
              isSubtitle: GLOBALS.Regex.SubtitleExt.test(target.proxyPath),
              isManifest: GLOBALS.Regex.ManifestExt.test(target.proxyPath)
            };
            await this.storeMetadataCache(cacheKey, prewarmResponse, warmTraits, { ...options, sourceUrl: target.upstreamUrl });
          } finally {
            if (timeoutId !== null) clearTimeout(timeoutId);
          }
        } catch {}
      }
    })());
  },
  shouldRetryWithProtocolFallback(response, state = {}) {
    if (response.status !== 403) return false;
    if (state.isRetry !== false) return false;
    if (state.protocolFallback !== true) return false;
    if (state.allowAutomaticRetry !== true) return false;
    if (state.preparedBodyMode === "stream") return false;
    return true;
  },
  async performFetchWithTimeout(finalUrl, buildFetchOptions, options = {}) {
    const fetchOptions = await buildFetchOptions(finalUrl, options);
    const timeoutMs = Math.max(0, Number(options.timeoutMs) || 0);
    let timeoutId = null;
    let controller = null;
    if (timeoutMs > 0) {
      controller = new AbortController();
      fetchOptions.signal = controller.signal;
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }
    try {
      const response = await fetch(finalUrl.toString(), fetchOptions);
      return { response, finalUrl };
    } catch (error) {
      if (timeoutMs > 0 && (error?.name === "AbortError" || String(error?.message || "").toLowerCase().includes("abort"))) {
        /** @type {AppError} */
        const timeoutError = new Error(`upstream_timeout_${timeoutMs}ms`);
        timeoutError.code = "UPSTREAM_TIMEOUT";
        throw timeoutError;
      }
      throw error;
    } finally {
      if (timeoutId !== null) clearTimeout(timeoutId);
    }
  },
  async performUpstreamFetch(targetBase, proxyPath, requestUrl, buildFetchOptions, options = {}) {
    const finalUrl = buildUpstreamProxyUrl(targetBase, proxyPath);
    finalUrl.search = requestUrl.search;
    const result = await this.performFetchWithTimeout(finalUrl, buildFetchOptions, options);
    return { ...result, targetBase };
  },
  async fetchAbsoluteWithRetryLoop(state) {
    let lastError = null;
    let lastResponse = null;
    const absoluteUrl = state.absoluteUrl instanceof URL ? new URL(state.absoluteUrl.toString()) : new URL(String(state.absoluteUrl || ""));
    const totalPasses = Math.max(1, clampIntegerConfig(state.maxExtraAttempts, Config.Defaults.UpstreamRetryAttempts, 0, 3) + 1);

    for (let pass = 0; pass < totalPasses; pass++) {
      const effectiveRetry = state.isRetry === true || pass > 0;
      try {
        const upstream = await this.performFetchWithTimeout(absoluteUrl, state.buildFetchOptions, {
          ...state.fetchOptions,
          isRetry: effectiveRetry,
          protocolFallbackRetry: state.protocolFallbackRetry === true,
          stripAuthOnProtocolFallback: state.stripAuthOnProtocolFallback === true,
          timeoutMs: state.upstreamTimeoutMs
        });
        const response = upstream.response;

        if (response.status === 101) {
          return upstream;
        }

        if (this.shouldRetryWithProtocolFallback(response, { ...state, isRetry: effectiveRetry })) {
          try { response.body?.cancel?.(); } catch {}
          return await this.fetchAbsoluteWithRetryLoop({ ...state, isRetry: true, protocolFallbackRetry: true });
        }

        const isLastPass = pass === totalPasses - 1;
        if (state.allowAutomaticRetry !== true || !state.retryableStatuses.has(response.status) || isLastPass) {
          return upstream;
        }

        if (lastResponse) {
          try { lastResponse.body?.cancel?.(); } catch {}
        }
        lastResponse = response;
      } catch (error) {
        lastError = error;
        const isLastPass = pass === totalPasses - 1;
        if (state.allowAutomaticRetry !== true || isLastPass) throw error;
      }
    }

    if (lastResponse) return { response: lastResponse, finalUrl: absoluteUrl };
    throw lastError || new Error("redirect_fetch_failed");
  },
  async fetchUpstreamWithRetryLoop(state) {
    let lastError = null;
    let lastResponse = null;
    let lastBase = state.retryTargets[0];
    let lastFinalUrl = buildUpstreamProxyUrl(lastBase, state.proxyPath);
    lastFinalUrl.search = state.requestUrl.search;

    const totalPasses = Math.max(1, clampIntegerConfig(state.maxExtraAttempts, Config.Defaults.UpstreamRetryAttempts, 0, 3) + 1);
    for (let pass = 0; pass < totalPasses; pass++) {
      for (let index = 0; index < state.retryTargets.length; index++) {
        const targetBase = state.retryTargets[index];
        lastBase = targetBase;
        const effectiveRetry = state.isRetry === true || pass > 0;
        try {
          const upstream = await this.performUpstreamFetch(targetBase, state.proxyPath, state.requestUrl, state.buildFetchOptions, {
            isRetry: effectiveRetry,
            protocolFallbackRetry: state.protocolFallbackRetry === true,
            stripAuthOnProtocolFallback: state.stripAuthOnProtocolFallback === true,
            timeoutMs: state.upstreamTimeoutMs
          });
          lastFinalUrl = upstream.finalUrl;
          const response = upstream.response;

          if (response.status === 101) {
            return upstream;
          }

          if (this.shouldRetryWithProtocolFallback(response, { ...state, isRetry: effectiveRetry })) {
            try { response.body?.cancel?.(); } catch {}
            return await this.fetchUpstreamWithRetryLoop({ ...state, isRetry: true, protocolFallbackRetry: true });
          }

          const isLastTarget = index === state.retryTargets.length - 1;
          const isLastPass = pass === totalPasses - 1;
          if (state.allowAutomaticRetry !== true || !state.retryableStatuses.has(response.status) || (isLastTarget && isLastPass)) {
            return upstream;
          }

          if (lastResponse) {
            try { lastResponse.body?.cancel?.(); } catch {}
          }
          lastResponse = response;
        } catch (error) {
          lastError = error;
          const isLastTarget = index === state.retryTargets.length - 1;
          const isLastPass = pass === totalPasses - 1;
          if (isLastTarget && isLastPass) throw error;
        }
      }
  }

    if (lastResponse) return { response: lastResponse, targetBase: lastBase, finalUrl: lastFinalUrl };
    throw lastError || new Error("upstream_fetch_failed");
  },
  recordAccessLog(execution, payload = {}) {
    Logger.record(execution.env, execution.ctx, {
      nodeName: execution.nodeName,
      requestPath: execution.proxyPath,
      requestMethod: execution.request.method,
      responseTime: Date.now() - execution.startTime,
      clientIp: execution.clientIp,
      userAgent: execution.request.headers.get("User-Agent"),
      referer: execution.request.headers.get("Referer"),
      ...payload
    });
  },
  buildOptionsResponse(execution) {
    const headers = new Headers(execution.dynamicCors);
    applySecurityHeaders(headers);
    if (execution.finalOrigin !== "*") mergeVaryHeader(headers, "Origin");
    return new Response(null, { headers });
  },
  async prepareExecutionContext(request, node, path, name, key, env, ctx, options = {}) {
    const startTime = Date.now();
    CacheManager.maybeCleanup();
    if (!node || !node.target) {
      return {
        invalidResponse: new Response("Invalid Node", { status: 502, headers: applySecurityHeaders(new Headers()) })
      };
    }

    const currentConfig = await getRuntimeConfig(env);
    const requestUrl = options.requestUrl || new URL(request.url);
    const proxyPath = sanitizeProxyPath(path);
    const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
    const country = request.cf?.country || "UNKNOWN";
    const finalOrigin = this.resolveCorsOrigin(currentConfig, request);
    const dynamicCors = getCorsHeadersForResponse(env, request, finalOrigin);
    const nodeDirectSource = isNodeDirectSourceEnabled(node, currentConfig);
    const requestTraits = this.classifyRequest(request, proxyPath, requestUrl, currentConfig, {
      nodeDirectSource,
      directStaticAssets: currentConfig.directStaticAssets === true,
      directHlsDash: currentConfig.directHlsDash === true
    });

    const enableH2 = currentConfig.enableH2 === true;
    const enableH3 = currentConfig.enableH3 === true;
    const peakDowngrade = currentConfig.peakDowngrade !== false;
    const protocolFallback = currentConfig.protocolFallback !== false;
    const upstreamTimeoutMs = clampIntegerConfig(currentConfig.upstreamTimeoutMs, Config.Defaults.UpstreamTimeoutMs, 0, 180000);
    const upstreamRetryAttempts = clampIntegerConfig(currentConfig.upstreamRetryAttempts, Config.Defaults.UpstreamRetryAttempts, 0, 3);
    const imageCacheMaxAge = clampIntegerConfig(currentConfig.cacheTtlImages, Config.Defaults.CacheTtlImagesDays, 0, 365) * 86400;
    const utc8Hour = (new Date().getUTCHours() + 8) % 24;
    const isPeakHour = utc8Hour >= 20 && utc8Hour < 24;
    const forceH1 = (peakDowngrade && isPeakHour) || (!enableH2 && !enableH3);
    const metadataCacheKey = (requestTraits.isMetadataCacheable && shouldWorkerCacheMetadataUrl(requestUrl)) ? buildWorkerCacheKey(requestUrl) : null;
    const metadataCache = metadataCacheKey ? getDefaultCacheHandle() : null;

    return {
      request,
      node,
      nodeName: name,
      nodeKey: key,
      env,
      ctx,
      startTime,
      currentConfig,
      requestUrl,
      proxyPath,
      clientIp,
      country,
      finalOrigin,
      dynamicCors,
      requestTraits,
      enableH3,
      forceH1,
      protocolFallback,
      upstreamTimeoutMs,
      upstreamRetryAttempts,
      imageCacheMaxAge,
      metadataCacheKey,
      metadataCache
    };
  },
  async tryServeMetadataCache(execution) {
    if (!execution.metadataCache || !execution.metadataCacheKey) return null;
    try {
      const cachedResponse = await execution.metadataCache.match(execution.metadataCacheKey);
      if (!cachedResponse) return null;
      const modifiedHeaders = this.buildProxyResponseHeaders(
        cachedResponse,
        execution.request,
        execution.dynamicCors,
        execution.finalOrigin,
        execution.requestTraits,
        {
          enableH3: execution.enableH3,
          forceH1: execution.forceH1,
          imageCacheMaxAge: execution.imageCacheMaxAge
        }
      );
      this.recordAccessLog(execution, {
        statusCode: cachedResponse.status,
        category: this.classifyProxyLogCategory(execution.requestTraits),
        errorDetail: this.extractProxyErrorDetail(cachedResponse)
      });
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: modifiedHeaders
      });
    } catch {
      return null;
    }
  },
  async resolveEarlyResponse(execution) {
    if (execution.request.method === "OPTIONS") {
      return this.buildOptionsResponse(execution);
    }

    const blockedResponse = this.evaluateFirewall(
      execution.currentConfig,
      execution.clientIp,
      execution.country,
      execution.finalOrigin
    );
    if (blockedResponse) return blockedResponse;

    const rateLimitResponse = this.applyRateLimit(
      execution.currentConfig,
      execution.clientIp,
      execution.requestTraits,
      execution.startTime,
      execution.finalOrigin
    );
    if (rateLimitResponse) return rateLimitResponse;

    return await this.tryServeMetadataCache(execution);
  },
  maybeBuildDirectRedirectResponse(execution, targetBases) {
    if (execution.requestTraits.direct307Mode !== true) return null;
    const activeTargetBase = targetBases[0];
    const directRedirectUrl = buildUpstreamProxyUrl(activeTargetBase, execution.proxyPath);
    directRedirectUrl.search = execution.requestUrl.search;
    const syntheticRedirect = new Response(null, { status: 307, statusText: "Temporary Redirect" });
    const modifiedHeaders = this.buildProxyResponseHeaders(
      syntheticRedirect,
      execution.request,
      execution.dynamicCors,
      execution.finalOrigin,
      execution.requestTraits,
      {
        enableH3: execution.enableH3,
        forceH1: execution.forceH1,
        imageCacheMaxAge: execution.imageCacheMaxAge
      }
    );
    this.applyProxyRedirectHeaders(
      modifiedHeaders,
      syntheticRedirect,
      activeTargetBase,
      execution.nodeName,
      execution.nodeKey,
      directRedirectUrl,
      directRedirectUrl
    );
    this.recordAccessLog(execution, {
      statusCode: 307,
      category: this.classifyProxyLogCategory(execution.requestTraits),
      errorDetail: null
    });
    return new Response(null, {
      status: 307,
      statusText: "Temporary Redirect",
      headers: modifiedHeaders
    });
  },
  createBuildFetchOptions(execution, transport) {
    const { request, requestTraits, protocolFallback } = execution;
    const { newHeaders, adminCustomHeaders, preparedBody, preparedBodyMode } = transport;
    return async (targetUrl, options = {}) => {
      const headers = new Headers(newHeaders);
      const finalTargetUrl = targetUrl instanceof URL ? targetUrl : new URL(String(targetUrl));
      const targetOrigin = finalTargetUrl.origin;
      const effectiveMethod = String(options.method || request.method || "GET").toUpperCase();
      const effectiveBodyMode = options.bodyMode || preparedBodyMode;
      const effectiveBody = options.body !== undefined ? options.body : preparedBody;
      const isExternalRedirect = options.isExternalRedirect === true;
      const isProtocolFallbackRetry = options.protocolFallbackRetry === true;
      const shouldStripAuthOnProtocolFallback = options.stripAuthOnProtocolFallback === true;

      if (headers.has("Origin") && !adminCustomHeaders.has("origin")) {
        headers.set("Origin", targetOrigin);
      }

      if (headers.has("Referer") && !adminCustomHeaders.has("referer")) {
        try {
          const originalReferer = new URL(headers.get("Referer"));
          if (originalReferer.origin !== targetOrigin) {
            const safeReferer = new URL(originalReferer.pathname + originalReferer.search, targetOrigin);
            headers.set("Referer", safeReferer.toString());
          }
        } catch {
          headers.set("Referer", targetOrigin + "/");
        }
      }

      if (isExternalRedirect) {
        headers.delete("Authorization");
        headers.delete("X-Emby-Authorization");
        headers.delete("Cookie");
        if (!adminCustomHeaders.has("origin")) headers.delete("Origin");
        if (!adminCustomHeaders.has("referer")) headers.delete("Referer");
      }

      if (isProtocolFallbackRetry && protocolFallback) {
        if (shouldStripAuthOnProtocolFallback) {
          headers.delete("Authorization");
          headers.delete("X-Emby-Authorization");
        }
        headers.set("Connection", "keep-alive");
      }

      if (effectiveMethod === "GET" || effectiveMethod === "HEAD") {
        headers.delete("Content-Length");
      }

      const canEdgeCacheSubtitle = effectiveMethod === "GET" && !requestTraits.rangeHeader && requestTraits.isSubtitle;
      /** @type {WorkerRequestInit} */
      const fetchOptions = {
        method: effectiveMethod,
        headers,
        redirect: "manual"
      };
      if (canEdgeCacheSubtitle) fetchOptions.cf = { cacheEverything: true, cacheTtl: 86400 };
      if (effectiveMethod !== "GET" && effectiveMethod !== "HEAD") {
        if (effectiveBodyMode === "buffered" && effectiveBody !== null && effectiveBody !== undefined) {
          fetchOptions.body = effectiveBody.slice(0);
        } else if (effectiveBodyMode === "stream") {
          fetchOptions.body = effectiveBody;
        }
      }
      return fetchOptions;
    };
  },
  async executeUpstreamFlow(execution, transport, buildFetchOptions) {
    const retryableStatuses = new Set([500, 502, 503, 504, 522, 523, 524, 525, 526, 530]);
    const sourceSameOriginProxy = execution.currentConfig.sourceSameOriginProxy !== false;
    const forceExternalProxy = execution.currentConfig.forceExternalProxy !== false;
    const wangpanDirectKeywords = getWangpanDirectText(execution.currentConfig.wangpandirect || "");

    const upstream = await this.fetchUpstreamWithRetryLoop({
      retryTargets: transport.retryTargets,
      proxyPath: execution.proxyPath,
      requestUrl: execution.requestUrl,
      buildFetchOptions,
      retryableStatuses,
      protocolFallback: execution.protocolFallback,
      preparedBodyMode: transport.preparedBodyMode,
      allowAutomaticRetry: transport.allowAutomaticRetry,
      stripAuthOnProtocolFallback: execution.requestTraits.canStripAuthOnProtocolFallback,
      upstreamTimeoutMs: execution.upstreamTimeoutMs,
      maxExtraAttempts: transport.allowAutomaticRetry ? execution.upstreamRetryAttempts : 0,
      isRetry: false
    });

    let response = upstream.response;
    let activeTargetBase = upstream.targetBase;
    let finalUrl = upstream.finalUrl;
    let proxiedExternalRedirect = false;
    let directRedirectUrl = null;
    let redirectHop = 0;
    let redirectMethod = String(execution.request.method || "GET").toUpperCase();
    let redirectBodyMode = transport.preparedBodyMode;
    let redirectBody = transport.preparedBody;

    while (response.status >= 300 && response.status < 400 && redirectHop < 8) {
      const location = response.headers.get("Location");
      const nextUrl = resolveRedirectTarget(location, finalUrl || activeTargetBase);
      if (!nextUrl) break;

      const redirectDecision = this.evaluateRedirectDecision(nextUrl, activeTargetBase, redirectMethod, redirectBodyMode, {
        sourceSameOriginProxy,
        forceExternalProxy,
        wangpanDirectKeywords,
        currentStatus: response.status
      });

      if (redirectDecision.mustDirect) {
        directRedirectUrl = nextUrl;
        break;
      }

      const nextMethod = redirectDecision.nextMethod;
      const nextBodyMode = redirectDecision.nextBodyMode;
      const nextBody = nextBodyMode === "none" ? null : redirectBody;

      try { response.body?.cancel?.(); } catch {}

      const redirectUpstream = await this.fetchAbsoluteWithRetryLoop({
        absoluteUrl: nextUrl,
        buildFetchOptions,
        fetchOptions: {
          method: nextMethod,
          bodyMode: nextBodyMode,
          body: nextBody,
          isExternalRedirect: !redirectDecision.isSameOriginRedirect
        },
        retryableStatuses,
        protocolFallback: execution.protocolFallback,
        preparedBodyMode: nextBodyMode,
        allowAutomaticRetry: transport.allowAutomaticRetry,
        stripAuthOnProtocolFallback: execution.requestTraits.canStripAuthOnProtocolFallback,
        upstreamTimeoutMs: execution.upstreamTimeoutMs,
        maxExtraAttempts: transport.allowAutomaticRetry ? execution.upstreamRetryAttempts : 0,
        isRetry: false
      });
      response = redirectUpstream.response;
      finalUrl = redirectUpstream.finalUrl;
      redirectMethod = nextMethod;
      redirectBodyMode = nextBodyMode;
      redirectBody = nextBody;
      if (!redirectDecision.isSameOriginRedirect) proxiedExternalRedirect = true;
      redirectHop += 1;
    }

    return {
      response,
      finalUrl,
      activeTargetBase,
      proxiedExternalRedirect,
      directRedirectUrl
    };
  },
  async buildSuccessResponse(execution, buildFetchOptions, upstreamState) {
    const finalStatus = upstreamState.response.status;
    const finalStatusText = upstreamState.response.statusText;
    const modifiedHeaders = this.buildProxyResponseHeaders(
      upstreamState.response,
      execution.request,
      execution.dynamicCors,
      execution.finalOrigin,
      execution.requestTraits,
      {
        enableH3: execution.enableH3,
        forceH1: execution.forceH1,
        proxiedExternalRedirect: upstreamState.proxiedExternalRedirect,
        imageCacheMaxAge: execution.imageCacheMaxAge
      }
    );
    this.applyProxyRedirectHeaders(
      modifiedHeaders,
      upstreamState.response,
      upstreamState.activeTargetBase,
      execution.nodeName,
      execution.nodeKey,
      upstreamState.directRedirectUrl,
      upstreamState.finalUrl
    );

    const playbackDiagnostic = await this.extractPlaybackInfoDiagnostic(
      execution.proxyPath,
      execution.requestUrl,
      upstreamState.response
    );
    const errorDetail = this.extractProxyErrorDetail(upstreamState.response) || playbackDiagnostic;
    this.recordAccessLog(execution, {
      statusCode: finalStatus,
      category: this.classifyProxyLogCategory(execution.requestTraits),
      errorDetail
    });

    if (execution.metadataCacheKey && execution.ctx && upstreamState.response.status === 200) {
      const cacheClone = upstreamState.response.clone();
      execution.ctx.waitUntil(this.storeMetadataCache(execution.metadataCacheKey, cacheClone, execution.requestTraits, {
        sourceUrl: execution.requestUrl,
        prewarmCacheTtl: execution.requestTraits.prewarmCacheTtl,
        imageCacheMaxAge: execution.imageCacheMaxAge
      }));
    }
    await this.maybePrewarmMetadataResponse(
      execution.request,
      upstreamState.response,
      execution.requestTraits,
      upstreamState.activeTargetBase,
      buildFetchOptions,
      execution.nodeName,
      execution.nodeKey,
      execution.requestUrl,
      execution.ctx,
      {
        proxyPath: execution.proxyPath,
        prewarmCacheTtl: execution.requestTraits.prewarmCacheTtl,
        imageCacheMaxAge: execution.imageCacheMaxAge
      }
    );

    /** @type {UpgradeableResponse} */
    const upgradeResponse = upstreamState.response;
    if (upstreamState.response.status === 101 && upgradeResponse.webSocket) {
      /** @type {ResponseInit & { webSocket?: unknown }} */
      const upgradeInit = {
        status: 101,
        statusText: upstreamState.response.statusText,
        headers: modifiedHeaders,
        webSocket: upgradeResponse.webSocket
      };
      return new Response(null, upgradeInit);
    }

    return new Response(upstreamState.response.body, {
      status: finalStatus,
      statusText: finalStatusText,
      headers: modifiedHeaders
    });
  },
  buildErrorResponse(execution, err) {
    const errorMessage = err?.message || String(err || "网关或 CF Workers 内部崩溃");
    this.recordAccessLog(execution, {
      statusCode: 502,
      category: "error",
      errorDetail: errorMessage
    });

    const errHeaders = new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": execution.finalOrigin || "*",
      "Cache-Control": "no-store"
    });

    if (execution.finalOrigin !== "*") mergeVaryHeader(errHeaders, "Origin");
    applySecurityHeaders(errHeaders);

    return new Response(
      JSON.stringify({ error: "Bad Gateway", code: 502, message: "All proxy attempts failed." }),
      { status: 502, headers: errHeaders }
    );
  },
  async handle(request, node, path, name, key, env, ctx, options = {}) {
    // Proxy.handle 阶段图（单文件内的执行主链）：
    // Phase A. 环境准备：配置、来源、CORS、客户端身份
    // Phase B. 前置裁决：OPTIONS / 防火墙 / 限流 / 目标源合法性
    // Phase C. 请求整备：分类、头部整理、body/重试目标准备
    // Phase D. 上游访问：fetch + 协议回退 + 多目标重试
    // Phase E. 跳转决策：同源/异源、直连/继续代理
    // Phase F. 响应整形：缓存头、CORS、Location 改写
    // Phase G. 观测记录：分类、状态码、错误细节、耗时
    const execution = await this.prepareExecutionContext(request, node, path, name, key, env, ctx, options);
    if (execution.invalidResponse) return execution.invalidResponse;

    const earlyResponse = await this.resolveEarlyResponse(execution);
    if (earlyResponse) return earlyResponse;

    const { targetBases, invalidResponse } = this.parseTargetBases(execution.node, execution.finalOrigin);
    if (invalidResponse) return invalidResponse;

    const directResponse = this.maybeBuildDirectRedirectResponse(execution, targetBases);
    if (directResponse) return directResponse;

    const transport = await this.buildProxyRequestState(
      execution.request,
      execution.node,
      execution.proxyPath,
      execution.requestUrl,
      execution.clientIp,
      execution.requestTraits,
      execution.forceH1,
      targetBases
    );
    const buildFetchOptions = this.createBuildFetchOptions(execution, transport);

    try {
      const upstreamState = await this.executeUpstreamFlow(execution, transport, buildFetchOptions);
      return await this.buildSuccessResponse(execution, buildFetchOptions, upstreamState);
    } catch (err) {
      return this.buildErrorResponse(execution, err);
    }
  }
};

// ============================================================================
// 4. 日志与观测模块 (LOGGER & OPS MODULE)
// 说明：
// - 这里负责请求日志的内存排队、批量刷入 D1，以及运行状态的最小回写。
// - 这是“可解释观测”边界，不承诺强一致审计。
// ============================================================================
const Logger = {
  record(env, ctx, logData) {
    const db = Database.getDB(env);
    if (!db || !ctx) return;
    if (logData.requestMethod === "OPTIONS") return;

    const currentMs = nowMs();
    const logClearEpochMs = Math.max(0, Number(GLOBALS.LogClearEpochMs) || 0);
    const recordTimestamp = currentMs <= logClearEpochMs ? (logClearEpochMs + 1) : currentMs;
    let dedupeWindow = 0;
    if (logData.requestMethod === "HEAD") dedupeWindow = 300000;
    else if (logData.category === "segment" || logData.category === "prewarm") dedupeWindow = 30000;

    if (dedupeWindow > 0) {
      const dedupKey = [logData.nodeName || "unknown", logData.requestMethod || "GET", logData.statusCode || 0, logData.requestPath || "/", logData.clientIp || "unknown"].join("|");
      const lastSeen = GLOBALS.LogDedupe.get(dedupKey);
      if (lastSeen && (currentMs - lastSeen) < dedupeWindow) return;
      GLOBALS.LogDedupe.set(dedupKey, currentMs);
      if (GLOBALS.LogDedupe.size > 10000) {
        const scannedEntries = [];
        for (const [key, ts] of GLOBALS.LogDedupe) {
          scannedEntries.push([key, ts]);
          if (scannedEntries.length >= 5000) break;
        }
        for (const [key, ts] of scannedEntries) {
          if (!GLOBALS.LogDedupe.has(key)) continue;
          if ((currentMs - ts) > dedupeWindow) {
            GLOBALS.LogDedupe.delete(key);
          }
          if (GLOBALS.LogDedupe.size <= 5000) break;
        }
      }
    }

    GLOBALS.LogQueue.push({
      timestamp: recordTimestamp,
      nodeName: logData.nodeName || "unknown",
      requestPath: logData.requestPath || "/",
      requestMethod: logData.requestMethod || "GET",
      statusCode: Number(logData.statusCode) || 0,
      responseTime: Number(logData.responseTime) || 0,
      clientIp: logData.clientIp || "unknown",
      userAgent: logData.userAgent || null,
      referer: logData.referer || null,
      category: logData.category || "api",
      errorDetail: logData.errorDetail || null, // [新增] 记录错误详情
      createdAt: new Date(recordTimestamp).toISOString()
    });
    // 💡 [极简修复 1] 内存泄流阀：如果 D1 阻塞导致队列堆积，强行丢弃最老的日志，死守内存底线
    if (GLOBALS.LogQueue.length > 2000) {
      GLOBALS.LogQueue.splice(0, 1000); 
      Database.patchOpsStatus(env, {
        log: {
          lastOverflowAt: new Date().toISOString(),
          lastOverflowDropCount: 1000,
          queueLengthAfterDrop: GLOBALS.LogQueue.length
        }
      }, ctx);
      console.error("Log queue overflow, dropping 1000 logs to prevent OOM.");
    }

    if (!GLOBALS.LogLastFlushAt) GLOBALS.LogLastFlushAt = currentMs;
    const configuredDelayMinutes = Number(GLOBALS.ConfigCache?.data?.logWriteDelayMinutes);
    const configuredFlushCount = Number(GLOBALS.ConfigCache?.data?.logFlushCountThreshold);
    const flushWindowMs = Math.max(0, Number.isFinite(configuredDelayMinutes) ? configuredDelayMinutes * 60000 : Config.Defaults.LogFlushDelayMinutes * 60000);
    const flushCountThreshold = Math.max(1, Number.isFinite(configuredFlushCount) ? Math.floor(configuredFlushCount) : Config.Defaults.LogFlushCountThreshold);
    const shouldFlush = GLOBALS.LogQueue.length >= flushCountThreshold || flushWindowMs === 0 || (currentMs - GLOBALS.LogLastFlushAt) >= flushWindowMs;
    if (shouldFlush && !GLOBALS.LogFlushPending) {
      GLOBALS.LogFlushPending = true;
      const flushTask = this.flush(env).finally(() => {
        if (GLOBALS.LogFlushTask === flushTask) GLOBALS.LogFlushTask = null;
        GLOBALS.LogFlushPending = false;
        GLOBALS.LogLastFlushAt = nowMs();
      });
      GLOBALS.LogFlushTask = flushTask;
      ctx.waitUntil(flushTask);
    }
  },
  async flush(env) {
    const db = Database.getDB(env);
    if (!db || GLOBALS.LogQueue.length === 0) return;
    await Database.ensureSysStatusTable(db);
    const configuredChunkSize = Number(GLOBALS.ConfigCache?.data?.logBatchChunkSize);
    const configuredRetryCount = Number(GLOBALS.ConfigCache?.data?.logBatchRetryCount);
    const configuredRetryBackoffMs = Number(GLOBALS.ConfigCache?.data?.logBatchRetryBackoffMs);
    const chunkSize = clampIntegerConfig(configuredChunkSize, Config.Defaults.LogBatchChunkSize, 1, 100);
    const maxRetryCount = clampIntegerConfig(configuredRetryCount, Config.Defaults.LogBatchRetryCount, 0, 5);
    const retryBackoffMs = clampIntegerConfig(configuredRetryBackoffMs, Config.Defaults.LogBatchRetryBackoffMs, 0, 5000);
    const logScope = Database.getOpsStatusDbScope("log");
    let writtenCount = 0;
    let retryCount = 0;
    let activeBatchSize = 0;
    let activeBatchWrittenCount = 0;
    try {
      // 同一次 flush 持续排空期间新增的日志，避免首批写完后尾批滞留到下一次请求。
      while (GLOBALS.LogQueue.length > 0) {
        const batchLogs = GLOBALS.LogQueue.splice(0, GLOBALS.LogQueue.length);
        const clearEpochMs = Math.max(GLOBALS.LogClearEpochMs || 0, await Database.getLogClearEpochMs(env));
        const eligibleLogs = batchLogs.filter(item => (Number(item?.timestamp) || 0) > clearEpochMs);
        if (!eligibleLogs.length) continue;
        activeBatchSize = eligibleLogs.length;
        activeBatchWrittenCount = 0;
        for (let index = 0; index < eligibleLogs.length; index += chunkSize) {
          const chunk = eligibleLogs.slice(index, index + chunkSize);
          const statements = chunk.map(item => db.prepare(`INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, user_agent, referer, category, error_detail, created_at)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE ? > COALESCE((
              SELECT CAST(json_extract(payload, '$.clearEpochMs') AS INTEGER)
              FROM ${Database.SYS_STATUS_TABLE}
              WHERE scope = ?
              LIMIT 1
            ), 0)`).bind(item.timestamp, item.nodeName, item.requestPath, item.requestMethod, item.statusCode, item.responseTime, item.clientIp, item.userAgent, item.referer, item.category, item.errorDetail, item.createdAt, item.timestamp, logScope));
          let attempt = 0;
          while (true) {
            try {
              await db.batch(statements);
              break;
            } catch (error) {
              if (attempt >= maxRetryCount) throw error;
              attempt += 1;
              retryCount += 1;
              if (retryBackoffMs > 0) await sleepMs(retryBackoffMs * attempt);
            }
          }
          writtenCount += chunk.length;
          activeBatchWrittenCount += chunk.length;
        }
      }
      await Database.patchOpsStatus(env, {
        log: {
          lastFlushAt: new Date().toISOString(),
          lastFlushCount: writtenCount,
          lastFlushStatus: "success",
          lastFlushRetryCount: retryCount,
          queueLengthAfterFlush: GLOBALS.LogQueue.length,
          lastFlushError: null,
          lastFlushErrorAt: null,
          lastDroppedBatchSize: 0,
          lastFlushWrittenBeforeError: 0
        }
      });
    } catch (e) {
      // 🌟 性能防御：D1 写入失败直接丢弃批次，严禁 unshift 导致队列内存堆积与时间轴错乱
      await Database.patchOpsStatus(env, {
        log: {
          lastFlushErrorAt: new Date().toISOString(),
          lastFlushStatus: "failed",
          lastFlushError: e?.message || String(e),
          lastFlushRetryCount: retryCount,
          lastDroppedBatchSize: Math.max(0, activeBatchSize - activeBatchWrittenCount),
          lastFlushWrittenBeforeError: writtenCount,
          queueLengthAfterFlush: GLOBALS.LogQueue.length
        }
      });
      console.log("Log flush failed, dropping batch.", e);
    }
  }
};

// ============================================================================
// 5. 新版 SAAS UI (纯净版：彻底删除所有冗余设置)
// ============================================================================
const UI_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Emby Proxy V18.7 - SaaS Dashboard</title>
  <script>
    window.__ADMIN_BOOTSTRAP__ = __ADMIN_BOOTSTRAP_JSON__;
    window.__ADMIN_UI_BOOTED__ = false;
    window.__ADMIN_UI_DEPENDENCY_TIMEOUT__ = setTimeout(function watchdog() {
      if (window.__ADMIN_UI_BOOTED__ || window.Vue) return;
      var target = document.getElementById('app') || document.body;
      if (!target) {
        setTimeout(watchdog, 500);
        return;
      }
      target.innerHTML = '<div class="min-h-screen flex items-center justify-center px-6 py-10"><div class="max-w-lg w-full rounded-[28px] border border-red-200 bg-white p-6 shadow-xl"><h1 class="text-xl font-bold text-slate-900">管理台资源加载失败</h1><p class="mt-3 text-sm leading-6 text-slate-600">检测到前端依赖长时间未完成加载，可能是当前网络环境无法稳定访问 CDN。</p><p class="mt-2 text-sm leading-6 text-slate-600">请稍后重试，或检查是否需要自建前端资源镜像。</p></div></div>';
    }, 8000);
  </script>
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: { colors: { brand: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb' } } } }
    }
  </script>
  <style>
    [v-cloak] { display: none; }
    .glass-card { background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04); }
    .dark .glass-card { background: #020617; border: 1px solid #1e293b; box-shadow: none; }
    :root { --ui-radius-px: 10px; }
    .glass-card,
    .ui-radius-card,
    #view-settings .settings-nav-shell,
    #view-settings .settings-block,
    #view-settings .settings-list-shell,
    #node-modal > div {
      border-radius: var(--ui-radius-px) !important;
    }
    .view-section { display: none; }
    .view-section.active { display: block; animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    aside { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    #view-settings .settings-nav-shell,
    #view-settings .settings-block,
    #view-settings .settings-list-shell {
      box-shadow: none !important;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background-image: none !important;
    }
    #view-settings .settings-nav-shell {
      background: #ffffff !important;
      border-color: #cbd5e1 !important;
    }
    #view-settings .settings-block,
    #view-settings .settings-list-shell {
      background: #ffffff !important;
      border-color: #d7e1ee !important;
    }
    .dark #view-settings .settings-nav-shell {
      background: #111827 !important;
      border-color: #334155 !important;
      background-image: none !important;
    }
    .dark #view-settings .settings-block,
    .dark #view-settings .settings-list-shell {
      background: #111827 !important;
      border-color: #314154 !important;
      background-image: none !important;
    }
    #view-settings .settings-nav-shell,
    #view-settings .settings-block {
      color: #0f172a;
    }
    #view-settings .settings-nav-shell .text-slate-400,
    #view-settings .settings-nav-shell .text-slate-500,
    #view-settings .settings-block .text-slate-400,
    #view-settings .settings-block .text-slate-500,
    #view-settings .settings-block p,
    #view-settings .settings-block label {
      color: #52627a !important;
    }
    #view-settings .settings-nav-shell .text-slate-900,
    #view-settings .settings-block .text-slate-900,
    #view-settings .settings-block .text-slate-800 {
      color: #0f172a !important;
    }
    #view-settings .settings-nav-shell .border-b,
    #view-settings .settings-block .border-b {
      border-color: #d9e3ef !important;
    }
    #view-settings .settings-block input:not([type="checkbox"]):not([type="radio"]),
    #view-settings .settings-block textarea,
    #view-settings .settings-block select,
    #view-settings .settings-list-shell {
      background: #ffffff !important;
      border-color: #c8d3e0 !important;
      color: #0f172a !important;
      box-shadow: none !important;
    }
    #view-settings .settings-block input::placeholder,
    #view-settings .settings-block textarea::placeholder {
      color: #7c8aa0 !important;
    }
    #view-settings .settings-block input:not([type="checkbox"]):not([type="radio"]):focus,
    #view-settings .settings-block textarea:focus,
    #view-settings .settings-block select:focus {
      border-color: #60a5fa !important;
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18) !important;
    }
    #view-settings .settings-block .pointer-events-none {
      color: #64748b !important;
    }
    #view-settings .settings-block .inline-flex.rounded-full {
      background: #f8fafc !important;
      border-color: #cbd5e1 !important;
      color: #5b6b80 !important;
    }
    .dark #view-settings .settings-nav-shell,
    .dark #view-settings .settings-block {
      color: #e5edf8;
    }
    .dark #view-settings .settings-nav-shell .text-slate-400,
    .dark #view-settings .settings-nav-shell .text-slate-500,
    .dark #view-settings .settings-block .text-slate-400,
    .dark #view-settings .settings-block .text-slate-500,
    .dark #view-settings .settings-block p,
    .dark #view-settings .settings-block label {
      color: #b7c3d7 !important;
    }
    .dark #view-settings .settings-nav-shell .text-slate-900,
    .dark #view-settings .settings-nav-shell .text-slate-800,
    .dark #view-settings .settings-block .text-slate-900,
    .dark #view-settings .settings-block .text-slate-800 {
      color: #f8fbff !important;
    }
    .dark #view-settings .settings-nav-shell .border-b,
    .dark #view-settings .settings-block .border-b {
      border-color: #263548 !important;
    }
    .dark #view-settings .settings-block input:not([type="checkbox"]):not([type="radio"]),
    .dark #view-settings .settings-block textarea,
    .dark #view-settings .settings-block select,
    .dark #view-settings .settings-list-shell {
      background: #0f172a !important;
      border-color: #3b4a60 !important;
      color: #f8fbff !important;
      box-shadow: none !important;
    }
    .dark #view-settings .settings-block input::placeholder,
    .dark #view-settings .settings-block textarea::placeholder {
      color: #8da0bc !important;
    }
    .dark #view-settings .settings-block input:not([type="checkbox"]):not([type="radio"]):focus,
    .dark #view-settings .settings-block textarea:focus,
    .dark #view-settings .settings-block select:focus {
      border-color: #60a5fa !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.26) !important;
    }
    .dark #view-settings .settings-block .pointer-events-none {
      color: #9fb0c7 !important;
    }
    .dark #view-settings .settings-block .inline-flex.rounded-full {
      background: #1f2937 !important;
      border-color: #40506a !important;
      color: #d1dbeb !important;
      background-image: none !important;
    }
    .dark #view-settings .set-tab,
    .dark #view-settings .settings-block input:not([type="checkbox"]):not([type="radio"]),
    .dark #view-settings .settings-block textarea,
    .dark #view-settings .settings-block select {
      background-image: none !important;
    }
    #view-nodes .node-toolbar-primary-btn,
    #view-nodes .node-tag-filter-trigger,
    #view-nodes .node-toolbar-search,
    #view-nodes .node-card-shell {
      transition:
        transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 260ms ease,
        border-color 220ms ease,
        background-color 220ms ease,
        color 220ms ease;
    }
    #view-nodes .node-tag-filter-trigger,
    #view-nodes .node-toolbar-search {
      transform: translateY(0);
      box-shadow:
        0 0 0 1px rgba(226, 232, 240, 0.92),
        0 10px 22px rgba(15, 23, 42, 0.05);
    }
    .dark #view-nodes .node-tag-filter-trigger,
    .dark #view-nodes .node-toolbar-search {
      box-shadow:
        0 0 0 1px rgba(51, 65, 85, 0.88),
        0 10px 22px rgba(2, 6, 23, 0.3);
    }
    #view-nodes .node-toolbar-primary-btn {
      box-shadow: 0 10px 22px rgba(37, 99, 235, 0.16);
    }
    #view-nodes .node-toolbar-primary-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(37, 99, 235, 0.18);
    }
    #view-nodes .node-toolbar-primary-btn svg {
      transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
    }
    #view-nodes .node-toolbar-primary-btn:hover svg {
      transform: translateY(-1px) scale(1.04);
    }
    #view-nodes .node-tag-filter-trigger svg {
      transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
    }
    #view-nodes .node-tag-filter-trigger:hover,
    #view-nodes .node-toolbar-search:hover,
    #view-nodes .node-tag-filter-trigger:focus-visible,
    #view-nodes .node-toolbar-search:focus {
      transform: translateY(-1px);
      border-color: #cbd5e1;
      background-color: #ffffff;
      box-shadow:
        0 0 0 1px rgba(203, 213, 225, 0.98),
        0 14px 28px rgba(15, 23, 42, 0.08);
    }
    #view-nodes .node-tag-filter-trigger:hover svg,
    #view-nodes .node-tag-filter-trigger:focus-visible svg {
      transform: translateY(-1px) scale(1.03);
    }
    .dark #view-nodes .node-tag-filter-trigger:hover,
    .dark #view-nodes .node-toolbar-search:hover,
    .dark #view-nodes .node-tag-filter-trigger:focus-visible,
    .dark #view-nodes .node-toolbar-search:focus {
      border-color: #334155;
      background-color: #0f172a;
      box-shadow:
        0 0 0 1px rgba(71, 85, 105, 0.92),
        0 16px 30px rgba(2, 6, 23, 0.38);
    }
    #view-nodes .node-tag-filter-panel-shell {
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transform: translateY(-6px);
      pointer-events: none;
      transition:
        max-height 260ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 180ms ease,
        transform 220ms ease;
    }
    #view-nodes .node-tag-filter-panel-shell.is-open {
      max-height: 12rem;
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    #view-nodes .node-tag-filter-chip {
      transition:
        transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
        border-color 220ms ease,
        background-color 220ms ease,
        color 220ms ease,
        box-shadow 220ms ease;
    }
    #view-nodes .node-tag-filter-chip:hover {
      transform: translateY(-1px);
      border-color: #cbd5e1;
    }
    .dark #view-nodes .node-tag-filter-chip:hover {
      border-color: #334155;
    }
    #view-nodes .node-card-shell {
      transform: translateY(0);
    }
    #view-nodes .node-card-shell:hover {
      transform: translateY(-2px);
      border-color: #cbd5e1;
      box-shadow: 0 18px 36px rgba(15, 23, 42, 0.07);
    }
    .dark #view-nodes .node-card-shell:hover {
      border-color: #334155;
      box-shadow: 0 16px 32px rgba(2, 6, 23, 0.34);
    }
    #view-nodes .node-card-title {
      transition: color 220ms ease;
    }
    #view-nodes .node-card-shell:hover .node-card-title {
      color: #0f172a;
    }
    .dark #view-nodes .node-card-shell:hover .node-card-title {
      color: #e2e8f0;
    }
    @media (min-width: 768px) {
      #app-shell.settings-split-layout #content-area {
        overflow: hidden;
      }
      #app-shell.settings-split-layout #view-settings {
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      #app-shell.settings-split-layout #view-settings .settings-view-layout {
        height: 100%;
        min-height: 0;
      }
      #app-shell.settings-split-layout #view-settings .settings-nav-shell {
        position: sticky;
        top: 0;
        max-height: 100%;
        overflow-y: auto;
      }
      #app-shell.settings-split-layout #view-settings #settings-forms {
        height: 100%;
        min-height: 0;
        overflow-y: auto;
        padding-right: 0.25rem;
        scrollbar-gutter: stable;
      }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased overflow-hidden h-[100dvh]">
  <div id="app" v-cloak></div>

  <template id="tpl-copy-button">
    <button type="button" @click="copyText" class="flex-1 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
      {{ copied ? '已复制' : label }}
    </button>
  </template>

  <template id="tpl-node-card">
    <div class="glass-card node-card-shell group p-6 rounded-3xl flex flex-col justify-between">
      <div>
        <div class="flex items-end mb-2 w-full gap-3">
          <div class="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-sm leading-5 font-semibold border truncate max-w-[7rem]" :class="tagToneClass">{{ hasTag ? hydratedNode.tag : '无标签' }}</div>
          <div class="flex-1 min-w-0 flex items-end gap-2 flex-wrap">
            <h3 class="node-card-title font-bold text-xl md:text-2xl transition-colors min-w-0 truncate" :class="statusMeta.titleClass">{{ displayName }}</h3>
            <span class="inline-flex max-w-full flex-shrink-0 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-100" title="当前启用线路">
              <span class="truncate max-w-[9rem]">{{ activeLineName }}</span>
            </span>
            <span v-if="isSyncing" class="inline-flex max-w-full flex-shrink-0 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300" title="节点变更正在同步到 KV">
              <span class="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse"></span>
              <span>同步中</span>
            </span>
            <span v-else-if="hasSyncFailure" class="inline-flex max-w-full flex-shrink-0 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300" :title="'最近一次同步失败：' + syncError">
              <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              <span>同步失败</span>
            </span>
          </div>
        </div>

        <div class="text-sm text-slate-500 dark:text-slate-400 mb-2 flex justify-between tracking-wide">
          <div class="flex items-center min-w-0">
            <span class="w-3 h-3 rounded-full mr-2 transition-colors duration-500 flex-shrink-0 shadow-inner" :class="statusMeta.dotClass"></span>
            <span>Ping: <span :class="statusMeta.textClass" :title="latencyTitle">{{ statusMeta.text }}</span></span>
          </div>
          <span class="truncate ml-2 text-right"><i data-lucide="shield" class="w-3 h-3 inline"></i> {{ hydratedNode.secret ? '已防护' : '未防护' }}</span>
        </div>

        <div class="mt-2 mb-3 border-t border-dashed border-slate-200/80 dark:border-slate-700/70"></div>

        <div class="text-xs text-slate-500 dark:text-slate-400 mb-3 space-y-1">
          <div v-if="hasSyncFailure" class="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50/90 px-3 py-2.5 dark:border-red-900/60 dark:bg-red-950/30">
            <span class="mt-1.5 h-2 w-2 rounded-full bg-red-500 flex-shrink-0"></span>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-500 dark:text-red-300">保存失败</div>
              <div class="mt-0.5 break-words text-sm md:text-[15px] leading-5 font-medium text-red-700 dark:text-red-300" :title="syncError">{{ syncError }}</div>
            </div>
          </div>
          <div v-if="remarkValue" class="flex items-center min-w-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-1.5 flex-shrink-0 text-red-500 dark:text-red-400">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span class="truncate flex-1 min-w-0 text-[15px] md:text-base leading-6 font-medium text-red-600 dark:text-red-400">{{ remarkValue }}</span>
          </div>
          <div class="flex items-center min-w-0">
            <i data-lucide="route" class="w-3 h-3 mr-1.5 flex-shrink-0 text-emerald-500"></i>
            <span class="truncate flex-1 min-w-0 text-[15px] md:text-base leading-6 font-medium text-emerald-700 dark:text-emerald-300">线路：共 {{ lineCount }} 条</span>
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
          <input :type="revealLink ? 'text' : 'password'" readonly :value="link" class="bg-transparent border-none flex-1 min-w-0 text-xs outline-none text-slate-600 dark:text-slate-300">
          <button type="button" class="text-slate-400 hover:text-brand-500 ml-2" @click="toggleLinkVisibility"><i :data-lucide="revealLink ? 'eye-off' : 'eye'" class="w-4 h-4"></i></button>
        </div>

        <div class="flex gap-2">
          <button type="button" :disabled="pingPending" class="px-3 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition flex items-center justify-center flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed" title="测试当前启用线路" @click="pingNode">
            <i v-if="!pingPending" data-lucide="activity" class="w-4 h-4"></i>
            <i v-else data-lucide="loader" class="w-4 h-4 animate-spin"></i>
          </button>
          <copy-button :text="link" label="复制"></copy-button>
          <button type="button" class="flex-1 py-2 text-sm font-medium bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-500/20 transition" @click="editNode">编辑</button>
          <button type="button" class="px-3 border border-red-100 dark:border-red-900/30 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center flex-shrink-0" @click="deleteNode"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
      </div>
    </div>
  </template>

  <template id="tpl-app">
  <div class="h-full" :class="{ dark: App.isDarkTheme }">
  <div id="app-shell" v-lucide-icons class="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased overflow-hidden flex h-[100dvh]" :class="{ 'settings-split-layout': App.isDesktopSettingsLayout }" :style="{ '--ui-radius-px': App.uiRadiusCssValue, colorScheme: App.isDarkTheme ? 'dark' : 'light' }">

  <div id="sidebar-backdrop" @click="App.toggleSidebar()" class="fixed inset-0 bg-slate-950/60 z-20 backdrop-blur-sm transition-opacity" :class="{ hidden: !App.sidebarOpen }"></div>

  <aside id="sidebar" class="w-64 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col z-30 absolute md:relative shadow-2xl md:shadow-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]" :class="App.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'">
    <div class="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">E</div>
      <h1 class="ml-3 font-semibold tracking-tight text-lg flex items-center gap-2">
        Emby Proxy 
        <span class="px-1.5 py-0.5 rounded bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 text-[10px] font-bold mt-0.5">V18.7</span>
      </h1>
    </div>
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <a v-for="item in App.navItems.slice(0, 4)" :key="item.hash" :href="item.hash" @click.prevent="App.navigate(item.hash)" class="nav-item flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800/50" :class="App.getNavItemClass(item.hash)"><i :data-lucide="item.icon" class="w-5 h-5 mr-3"></i> {{ item.label }}</a>
      <div class="my-4 border-t border-slate-200 dark:border-slate-800"></div>
      <a :href="App.navItems[4].hash" @click.prevent="App.navigate(App.navItems[4].hash)" class="nav-item flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800/50" :class="App.getNavItemClass(App.navItems[4].hash)"><i :data-lucide="App.navItems[4].icon" class="w-5 h-5 mr-3"></i> {{ App.navItems[4].label }}</a>
    </nav>
  </aside>

  <main class="flex-1 flex flex-col h-full min-w-0 relative">
    <header class="flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]">
      <div class="flex items-center">
        <button @click="App.toggleSidebar()" class="md:hidden mr-4 text-slate-500 hover:text-slate-900"><i data-lucide="menu" class="w-5 h-5"></i></button>
        <h2 id="page-title" class="text-lg font-semibold tracking-tight">{{ App.pageTitle }}</h2>
      </div>
      <div class="flex items-center space-x-4">
        <a href="https://github.com/axuitomo/CF-EMBY-PROXY-UI" target="_blank" class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition"><i data-lucide="github" class="w-5 h-5"></i></a>
        <button @click="App.toggleTheme()" v-auto-animate="{ duration: 180 }" class="text-slate-400 hover:text-brand-500 transition">
          <span v-if="!App.isDarkTheme" key="theme-icon-sun"><i data-lucide="sun" class="w-5 h-5"></i></span>
          <span v-else key="theme-icon-moon"><i data-lucide="moon" class="w-5 h-5"></i></span>
        </button>
      </div>
    </header>

    <div id="content-area" v-scroll-reset="App.contentScrollResetKey" class="flex-1 overflow-y-auto p-4 md:p-8 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-[calc(2rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      
      <div id="view-dashboard" class="view-section w-full mx-auto space-y-6" :class="{ active: App.currentHash === '#dashboard' }">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div class="glass-card rounded-3xl p-6 shadow-sm border-l-4 border-blue-500 min-w-0 overflow-hidden relative"><p class="text-sm text-slate-500 truncate">今日请求量</p><h3 class="text-2xl md:text-3xl font-bold mt-2 break-all" id="dash-req-count" :title="App.dashboardView.requests.title">{{ App.dashboardView.requests.count }}</h3><p class="text-xs font-medium text-slate-500 mt-2 break-all" id="dash-req-hint" :title="App.dashboardView.requests.title">{{ App.dashboardView.requests.hint }}</p><div id="dash-req-meta" class="flex flex-wrap gap-2 mt-3"><span v-for="(badge, badgeIndex) in App.dashboardView.requests.badges" :key="'req-badge-' + badgeIndex + '-' + badge.label" class="px-2.5 py-1 rounded-full text-[11px] font-medium" :class="App.getDashboardBadgeClass(badge.tone)">{{ badge.label }}</span></div><p class="text-[11px] font-medium text-brand-600 dark:text-brand-400 mt-2 break-all bg-brand-50 dark:bg-brand-500/10 inline-block px-2.5 py-1 rounded-md" id="dash-emby-metrics">{{ App.dashboardView.requests.embyMetrics }}</p></div>
           <div class="glass-card rounded-3xl p-6 shadow-sm border-l-4 border-emerald-500 min-w-0 overflow-hidden"><p class="text-sm text-slate-500 truncate">视频流量 (CF Zone 总流量)</p><h3 class="text-2xl md:text-3xl font-bold mt-2 break-all" id="dash-traffic-count" :title="App.dashboardView.traffic.title">{{ App.dashboardView.traffic.count }}</h3><p class="text-xs font-medium text-slate-500 mt-2 break-all" id="dash-traffic-hint" :title="App.dashboardView.traffic.title">{{ App.dashboardView.traffic.hint }}</p><div id="dash-traffic-meta" class="flex flex-wrap gap-2 mt-3"><span v-for="(badge, badgeIndex) in App.dashboardView.traffic.badges" :key="'traffic-badge-' + badgeIndex + '-' + badge.label" class="px-2.5 py-1 rounded-full text-[11px] font-medium" :class="App.getDashboardBadgeClass(badge.tone)">{{ badge.label }}</span></div><p class="text-[11px] text-slate-400 mt-2 break-all whitespace-pre-line" id="dash-traffic-detail">{{ App.dashboardView.traffic.detail }}</p></div>
           <div class="glass-card rounded-3xl p-6 shadow-sm border-l-4 border-purple-500 min-w-0 overflow-hidden"><p class="text-sm text-slate-500 truncate">接入节点</p><h3 class="text-2xl md:text-3xl font-bold mt-2 break-all" id="dash-node-count">{{ App.dashboardView.nodes.count }}</h3><p id="dash-node-meta" class="text-xs font-medium text-slate-500 mt-2 break-all">{{ App.dashboardView.nodes.meta }}</p><div id="dash-node-badges" class="flex flex-wrap gap-2 mt-3"><span v-for="(badge, badgeIndex) in App.dashboardView.nodes.badges" :key="'node-badge-' + badgeIndex + '-' + badge.label" class="px-2.5 py-1 rounded-full text-[11px] font-medium" :class="App.getDashboardBadgeClass(badge.tone)">{{ badge.label }}</span></div></div>
        </div>
        <div class="glass-card rounded-3xl p-6 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 class="font-semibold text-lg">运行状态</h3>
              <p id="dash-runtime-updated" class="text-xs text-slate-500 mt-1">{{ App.dashboardRuntimeView.updatedText }}</p>
            </div>
            <button @click="App.loadDashboard()" class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center">
              <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i>刷新状态
            </button>
          </div>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
            <div id="dash-runtime-log-card" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4"><div class="h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" :class="App.getRuntimeStatusMeta(App.dashboardRuntimeView.logCard.status).dotClass"></span><h4 class="font-semibold text-slate-900 dark:text-white">{{ App.dashboardRuntimeView.logCard.title }}</h4></div><p class="text-xs text-slate-500 mt-1 break-all">{{ App.dashboardRuntimeView.logCard.summary }}</p></div><span class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" :class="App.getRuntimeStatusMeta(App.dashboardRuntimeView.logCard.status).badgeClass">{{ App.getRuntimeStatusMeta(App.dashboardRuntimeView.logCard.status).label }}</span></div><ul class="space-y-2 mt-4"><li v-for="(line, lineIndex) in App.dashboardRuntimeView.logCard.lines" :key="'log-card-line-' + lineIndex" class="text-sm text-slate-600 dark:text-slate-300 break-all">{{ line }}</li></ul><p v-if="App.dashboardRuntimeView.logCard.detail" class="text-xs text-slate-400 break-all mt-3">{{ App.dashboardRuntimeView.logCard.detail }}</p></div></div>
            <div id="dash-runtime-scheduled-card" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4"><div class="h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" :class="App.getRuntimeStatusMeta(App.dashboardRuntimeView.scheduledCard.status).dotClass"></span><h4 class="font-semibold text-slate-900 dark:text-white">{{ App.dashboardRuntimeView.scheduledCard.title }}</h4></div><p class="text-xs text-slate-500 mt-1 break-all">{{ App.dashboardRuntimeView.scheduledCard.summary }}</p></div><span class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" :class="App.getRuntimeStatusMeta(App.dashboardRuntimeView.scheduledCard.status).badgeClass">{{ App.getRuntimeStatusMeta(App.dashboardRuntimeView.scheduledCard.status).label }}</span></div><ul class="space-y-2 mt-4"><li v-for="(line, lineIndex) in App.dashboardRuntimeView.scheduledCard.lines" :key="'scheduled-card-line-' + lineIndex" class="text-sm text-slate-600 dark:text-slate-300 break-all">{{ line }}</li></ul><p v-if="App.dashboardRuntimeView.scheduledCard.detail" class="text-xs text-slate-400 break-all mt-3">{{ App.dashboardRuntimeView.scheduledCard.detail }}</p></div></div>
          </div>
        </div>
        <div class="glass-card rounded-3xl p-6 shadow-sm flex flex-col">
           <h3 class="font-semibold text-lg mb-4">请求趋势</h3>
           <div class="relative w-full h-64 md:h-80 2xl:h-[40vh] min-h-[250px] 2xl:min-h-[450px]"><canvas id="trafficChart" v-traffic-chart="App.dashboardSeries"></canvas></div>
           <p class="text-xs text-slate-500 mt-4">Y 轴（纵轴）代表：该小时内的“请求总次数”；X 轴（横轴）代表：当前天的“小时”时间刻度（UTC+8）。</p>
        </div>
      </div>

      <div id="view-nodes" class="view-section w-full mx-auto space-y-6" :class="{ active: App.currentHash === '#nodes' }">
        <div class="flex flex-col xl:flex-row justify-between items-start gap-4">
          <div v-auto-animate="{ duration: 220 }" class="flex flex-col gap-3 w-full xl:flex-1 xl:max-w-3xl">
            <div class="flex flex-wrap items-center gap-2 w-full">
              <button @click="App.showNodeModal()" class="node-toolbar-primary-btn px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 flex items-center transition whitespace-nowrap"><i data-lucide="plus" class="w-4 h-4 mr-2"></i> 新建节点</button>
              <button @click="App.toggleNodeTagFilterPanel()" :disabled="!App.hasNodeTagFilterOptions()" class="node-tag-filter-trigger px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed" :class="App.getNodeTagFilterTriggerClass()">
                <i data-lucide="tags" class="w-4 h-4"></i>
                <span>{{ App.getNodeTagFilterTriggerText() }}</span>
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="App.getNodeTagFilterCounterClass()">{{ App.getNodeTagFilterCounterText() }}</span>
                <i data-lucide="chevron-down" class="w-4 h-4 transition-transform duration-200" :class="App.nodeTagFilterPanelOpen ? 'rotate-180' : ''"></i>
              </button>
              <input type="text" id="node-search" v-model="App.nodeSearchKeyword" @input="App.syncFilteredNodes()" placeholder="搜索节点名称或标签..." class="node-toolbar-search flex-1 min-w-[15rem] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white w-full transition">
            </div>
            <div class="node-tag-filter-panel-shell" :class="{ 'is-open': App.nodeTagFilterPanelOpen && App.hasNodeTagFilterOptions() }">
              <div class="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/85 dark:bg-slate-950/70 px-4 py-3">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div class="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Tag Filter</div>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">按标签快速收束节点列表；切回“全部标签”即可清除筛选。</p>
                  </div>
                  <button v-if="App.hasActiveNodeTagFilter()" @click="App.clearNodeTagFilter()" class="self-start sm:self-auto text-xs font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition">清除筛选</button>
                </div>
                <div v-auto-animate="{ duration: 180 }" class="mt-3 flex flex-wrap gap-2">
                  <button @click="App.clearNodeTagFilter()" class="node-tag-filter-chip inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition" :class="App.getNodeTagFilterChipClass('')">
                    <span>全部标签</span>
                    <span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" :class="App.getNodeTagFilterChipCountClass('')">{{ App.getNodeTagFilterAllCount() }}</span>
                  </button>
                  <button v-for="option in App.getNodeTagFilterOptions()" :key="'node-tag-filter-' + option.value" @click="App.setNodeTagFilter(option.value)" class="node-tag-filter-chip inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition" :class="App.getNodeTagFilterChipClass(option.value)">
                    <span class="h-2 w-2 rounded-full" :class="App.getNodeTagFilterDotClass(option.colorKey)"></span>
                    <span>{{ option.label }}</span>
                    <span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" :class="App.getNodeTagFilterChipCountClass(option.value)">{{ option.count }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 w-full xl:w-auto">
            <label class="flex-1 sm:flex-none px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center justify-center"><i data-lucide="upload" class="w-4 h-4 mr-2"></i> 导入配置<input type="file" id="import-nodes-file" class="hidden" accept=".json" @change="App.importNodes($event)"></label>
            <button @click="App.exportNodes()" class="flex-1 sm:flex-none px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center justify-center"><i data-lucide="download" class="w-4 h-4 mr-2"></i> 导出配置</button>
            <button @click="App.forceHealthCheck()" :disabled="App.nodesHealthCheckPending" class="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 flex items-center justify-center transition disabled:opacity-60 disabled:cursor-not-allowed"><i :data-lucide="App.nodesHealthCheckPending ? 'loader' : 'activity'" :class="App.nodesHealthCheckPending ? 'w-4 h-4 mr-2 animate-spin' : 'w-4 h-4 mr-2'"></i> {{ App.nodesHealthCheckPending ? '探测中...' : '全局 Ping' }}</button>
            <a v-auto-download="{ href: App.downloadHref, key: App.downloadTriggerKey }" :href="App.downloadHref" :download="App.downloadFilename" class="hidden" aria-hidden="true"></a>
          </div>
        </div>
        <div id="nodes-grid" v-auto-animate="{ duration: 180 }" class="grid gap-6 grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
          <node-card v-for="(node, index) in App.getFilteredNodes()" :key="node.name || node.displayName || ('node-' + index)" :node="node" :app="App"></node-card>
          <div v-if="!App.getFilteredNodes().length" class="col-span-full py-12 text-center text-slate-500">暂无匹配节点</div>
        </div>
      </div>

      <div id="view-logs" class="view-section w-full mx-auto space-y-6" :class="{ active: App.currentHash === '#logs' }">
        <div class="glass-card rounded-3xl p-6 shadow-sm flex flex-col min-h-[calc(100vh-120px)]">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h3 class="font-semibold text-lg flex-shrink-0">日志记录</h3>
            <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <input type="date" id="log-start-date-input" v-model="App.logStartDate" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white">
              <span class="text-xs text-slate-400">至</span>
              <input type="date" id="log-end-date-input" v-model="App.logEndDate" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white">
	              <input type="text" id="log-search-input" v-model="App.logSearchKeyword" :placeholder="App.getLogSearchInputPlaceholder()" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white flex-1 md:w-56" @keydown.enter="App.loadLogs(1)">
              <button @click="App.loadLogs(1)" class="text-brand-500 text-sm px-2 hover:text-brand-600"><i data-lucide="search" class="w-4 h-4 inline"></i></button>
              <div v-if="App.isSettingsExpertMode()" class="flex flex-wrap items-center gap-1.5">
                <button data-log-playback-filter="" @click="App.setLogsPlaybackModeFilter('')" class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium transition" :class="App.getLogsPlaybackFilterClass('')">全部模式</button>
                <button data-log-playback-filter="transcode" @click="App.setLogsPlaybackModeFilter('transcode')" class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium transition" :class="App.getLogsPlaybackFilterClass('transcode')">只看转码</button>
                <button data-log-playback-filter="direct_stream" @click="App.setLogsPlaybackModeFilter('direct_stream')" class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium transition" :class="App.getLogsPlaybackFilterClass('direct_stream')">只看直串</button>
                <button data-log-playback-filter="direct_play" @click="App.setLogsPlaybackModeFilter('direct_play')" class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium transition" :class="App.getLogsPlaybackFilterClass('direct_play')">只看直放</button>
              </div>
              
              <div class="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1 hidden md:block"></div>
              
	              <button @click="App.initLogsDbFromUi()" class="text-slate-500 text-sm hover:text-brand-500"><i data-lucide="database" class="w-4 h-4 inline mr-1"></i>初始化 DB</button>
	              <button v-if="App.isSettingsExpertMode()" @click="App.initLogsFtsFromUi()" class="text-slate-500 text-sm hover:text-brand-500"><i data-lucide="search" class="w-4 h-4 inline mr-1"></i>初始化 FTS5</button>
	              <button @click="App.clearLogsFromUi()" class="text-red-500 text-sm hover:text-red-600 ml-2"><i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i>清空日志</button>
	              <button @click="App.loadLogs()" class="text-brand-500 text-sm ml-2"><i data-lucide="refresh-cw" class="w-4 h-4 inline mr-1"></i>刷新</button>
	            </div>
	          </div>
	          <p class="text-xs text-slate-500 mb-4">{{ App.getRuntimeLogSearchModeHint() }}</p>
	          <div class="overflow-x-auto min-h-0 w-full mb-4">
            <table class="w-full text-left border-collapse table-fixed min-w-[900px]">
              <thead><tr class="text-sm text-slate-500 border-b border-slate-200 dark:border-slate-800"><th class="py-3 px-4 w-24 md:w-28">节点</th><th class="py-3 px-4 w-28 md:w-32">资源类别</th><th class="py-3 px-4 w-16 md:w-20">状态</th><th class="py-3 px-4 w-32">IP</th><th class="py-3 px-4">UA</th><th class="py-3 px-4 w-28">时间锥</th></tr></thead>
              <tbody id="logs-tbody" class="text-sm">
                <tr v-if="!App.logRows.length">
                  <td colspan="6" class="py-6 text-center text-slate-500">暂无匹配日志记录</td>
                </tr>
                <tr v-for="(log, index) in App.logRows" v-else :key="log.id || (String(log.timestamp) + '-' + index)" class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td class="py-3 px-4 font-medium truncate" :title="log.node_name">{{ log.node_name }}</td>
                  <td class="py-3 px-4 text-xs cursor-pointer truncate" :title="App.getLogPathTitle(log)">
                    <div class="flex flex-wrap items-center gap-1"><span v-for="(badge, badgeIndex) in App.getLogCategoryBadges(log)" :key="(log.id || index) + '-badge-' + badgeIndex + '-' + badge.label" :class="badge.className">{{ badge.label }}</span></div>
                  </td>
                  <td class="py-3 px-4 font-bold truncate" :class="log.status_code >= 400 ? 'text-red-500' : 'text-emerald-500'"><span :class="App.getLogStatusMeta(log).className" :title="App.getLogStatusMeta(log).title">{{ App.getLogStatusMeta(log).text }}</span></td>
                  <td class="py-3 px-4 font-mono text-xs truncate" :title="log.client_ip">{{ log.client_ip }}</td>
                  <td class="py-3 px-4 text-xs text-slate-400 truncate" :title="log.user_agent || '-'">{{ log.user_agent || '-' }}</td>
                  <td class="py-3 px-4 text-xs font-mono text-slate-500 truncate log-time-cell" :data-timestamp="log.timestamp" :title="App.formatUtc8ExactTime(log.timestamp)" :aria-label="App.formatUtc8ExactTime(log.timestamp)" tabindex="0">{{ App.getLogRelativeTime(log.timestamp, App.logTimeTick) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-between items-center mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
              <button @click="App.changeLogPage(-1)" :disabled="App.logPage <= 1" class="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:pointer-events-none">上一页</button>
              <span id="log-page-info" class="text-sm font-mono text-slate-500">{{ App.logPage }} / {{ App.logTotalPages }}</span>
              <button @click="App.changeLogPage(1)" :disabled="App.logPage >= App.logTotalPages" class="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:pointer-events-none">下一页</button>
          </div>
        </div>
      </div>

      <div id="view-dns" class="view-section w-full mx-auto space-y-6" :class="{ active: App.currentHash === '#dns' }">
        <div class="glass-card rounded-3xl p-6 shadow-sm flex flex-col min-h-[calc(100vh-120px)]">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div class="min-w-0">
              <h3 class="font-semibold text-lg flex-shrink-0">DNS编辑</h3>
              <p id="dns-zone-hint" class="text-xs text-slate-500 mt-1 break-all">{{ App.dnsZoneHintText }}</p>
              <p class="text-[11px] text-slate-500 mt-1">提示：当前仅展示当前站点对应的 A / AAAA / CNAME 记录；CNAME 与 A / AAAA 不能共存；切换模式只会修改当前草稿，点击“保存 DNS”后才会同步到 Cloudflare；DNS 历史仅记录 CNAME，最多保留 {{ App.dnsHistoryLimit }} 条。</p>
            </div>
            <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button @click="App.loadDnsRecords()" class="text-brand-500 text-sm"><i data-lucide="refresh-cw" class="w-4 h-4 inline mr-1"></i>刷新</button>
              <button id="dns-save-all-btn" @click="App.saveAllDnsRecords()" :disabled="App.isDnsSaveAllDisabled()" :title="App.getDnsSaveAllTitle()" class="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 flex items-center transition whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none"><i data-lucide="save" class="w-4 h-4 mr-2"></i>{{ App.getDnsSaveAllButtonText() }}</button>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <button type="button" @click="App.switchDnsEditMode('cname')" class="px-4 py-2 rounded-xl border text-sm font-medium transition" :class="App.getDnsEditModeButtonClass('cname')">CNAME模式</button>
            <button type="button" @click="App.switchDnsEditMode('a')" class="px-4 py-2 rounded-xl border text-sm font-medium transition" :class="App.getDnsEditModeButtonClass('a')">A模式</button>
            <span class="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">{{ App.getDnsModeHintText() }}</span>
          </div>
          <div class="overflow-x-auto min-h-0 w-full mb-4">
            <table class="w-full text-left border-collapse table-fixed min-w-[900px]">
              <thead>
                <tr class="text-sm text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th class="py-3 px-4 w-28">类型</th>
                  <th class="py-3 px-4 w-80">名称</th>
                  <th class="py-3 px-4">内容</th>
                  <th class="py-3 px-4 w-28">操作</th>
                </tr>
              </thead>
              <tbody v-if="App.dnsEditMode === 'cname'" id="dns-tbody-cname" class="text-sm">
                <tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                  <td class="py-3 px-4">
                    <div class="text-xs font-mono text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">CNAME</div>
                  </td>
                  <td class="py-3 px-4">
                    <input type="text" :value="App.getDnsEditorHostLabel()" disabled class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 outline-none text-sm text-slate-500 dark:text-slate-400">
                  </td>
                  <td class="py-3 px-4">
                    <input type="text" v-model="App.dnsDraftCname.content" @input="App.updateDnsSaveAllButtonState()" :disabled="App.dnsBatchSaving" placeholder="请输入 CNAME 内容" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-500 disabled:dark:text-slate-400 disabled:opacity-70">
                  </td>
                  <td class="py-3 px-4">
                    <span class="text-xs text-slate-400">保存时会清理 A / AAAA</span>
                  </td>
                </tr>
              </tbody>
              <tbody v-else id="dns-tbody-a" class="text-sm">
                <tr v-for="(record, index) in App.dnsAddressDrafts" :key="record.uid" class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                  <td class="py-3 px-4">
                    <select v-model="record.type" @change="record.type = String(record.type || '').toUpperCase(); App.updateDnsSaveAllButtonState()" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white disabled:opacity-50" :disabled="App.dnsBatchSaving">
                      <option value="A">A</option>
                      <option value="AAAA">AAAA</option>
                    </select>
                  </td>
                  <td class="py-3 px-4">
                    <input type="text" :value="App.getDnsEditorHostLabel()" disabled class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 outline-none text-sm text-slate-500 dark:text-slate-400">
                  </td>
                  <td class="py-3 px-4">
                    <input type="text" v-model="record.content" @input="App.updateDnsSaveAllButtonState()" :disabled="App.dnsBatchSaving" :placeholder="record.type === 'AAAA' ? '请输入 IPv6 地址' : '请输入 IPv4 地址'" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-500 disabled:dark:text-slate-400 disabled:opacity-70">
                  </td>
                  <td class="py-3 px-4">
                    <button type="button" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:pointer-events-none" :disabled="App.dnsBatchSaving || !App.canRemoveDnsAddressDraft()" @click="App.removeDnsAddressDraft(index)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <p class="text-xs text-slate-500">{{ App.getDnsEditorFooterHint() }}</p>
            <button v-if="App.dnsEditMode === 'a'" type="button" @click="App.addDnsAddressDraft()" :disabled="App.dnsBatchSaving" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:pointer-events-none">
              <i data-lucide="plus" class="w-4 h-4"></i>新增记录
            </button>
          </div>
          <div v-if="!App.dnsRecords.length" id="dns-empty" class="text-sm text-slate-500 text-center py-4">{{ App.dnsEmptyText }}</div>

          <div class="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div v-if="App.hasDnsHistoryCards()" class="ui-radius-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">DNS History</div>
                  <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">DNS 历史记录</div>
                </div>
                <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">点击会切换到 CNAME 模式并回填</span>
              </div>
              <div v-auto-animate class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <button
                  v-for="card in App.getDnsHistoryCards()"
                  :key="App.getDnsHistoryEntryKey(card.entry, card.index)"
                  type="button"
                  @click="App.applyDnsHistoryEntry(card.entry)"
                  :title="App.getDnsHistoryEntryTitle(card.entry)"
                  class="ui-radius-card block w-full rounded-2xl border px-4 py-3 text-left transition"
                  :class="App.getDnsHistoryCardClass(card.entry)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                        <span>{{ card.entry.type }}</span>
                        <span class="opacity-70 normal-case font-medium tracking-normal">{{ App.formatDnsHistoryTimestamp(card.entry.savedAt) }}</span>
                      </div>
                      <div class="mt-3 font-mono text-base font-semibold text-slate-900 dark:text-white break-all leading-7">{{ card.entry.content }}</div>
                    </div>
                    <span class="shrink-0 text-[11px] font-medium opacity-70">{{ App.isDnsHistoryEntryCurrent(card.entry) ? '当前草稿' : '点击回填' }}</span>
                  </div>
                </button>
              </div>
            </div>
            <div class="ui-radius-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">CNAME Shortcut</div>
                  <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">推荐优选域名</div>
                </div>
                <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">点击回填后仍需保存</span>
              </div>
              <p class="text-xs text-slate-500 mb-4">{{ App.getDnsRecommendedDomainHint() }}</p>
              <div v-auto-animate="{ duration: 180 }" class="flex flex-wrap gap-2">
                <button
                  v-for="domain in App.getDnsRecommendedDomains()"
                  :key="'dns-recommended-domain-' + domain"
                  type="button"
                  @click="App.applyDnsRecommendedDomain(domain)"
                  :disabled="!App.canUseDnsRecommendedDomains() || App.dnsBatchSaving"
                  class="ui-radius-card inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="App.getDnsRecommendedDomainClass(domain)"
                >
                  <span class="font-mono">{{ domain }}</span>
                  <i data-lucide="wand-sparkles" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
            <div class="ui-radius-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">链接</div>
                  <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">实用链接</div>
                </div>
                <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">快捷入口</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                <a href="https://cf.090227.xyz/" target="_blank" rel="noopener noreferrer" class="ui-radius-card group inline-flex items-center justify-between gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-brand-50/80 dark:hover:bg-brand-500/10 transition">
                  <span class="text-sm font-semibold">优选域名</span>
                  <i data-lucide="arrow-up-right" class="w-4 h-4 text-brand-600 dark:text-brand-400"></i>
                </a>
                <a href="https://api.uouin.com/cloudflare.html" target="_blank" rel="noopener noreferrer" class="ui-radius-card group inline-flex items-center justify-between gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-brand-50/80 dark:hover:bg-brand-500/10 transition">
                  <span class="text-sm font-semibold">麒麟优选</span>
                  <i data-lucide="arrow-up-right" class="w-4 h-4 text-brand-600 dark:text-brand-400"></i>
                </a>
                <a href="https://vps789.com/" target="_blank" rel="noopener noreferrer" class="ui-radius-card group inline-flex items-center justify-between gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-brand-50/80 dark:hover:bg-brand-500/10 transition">
                  <span class="text-sm font-semibold">VPS789</span>
                  <i data-lucide="arrow-up-right" class="w-4 h-4 text-brand-600 dark:text-brand-400"></i>
                </a>
                <a href="https://ip.164746.xyz/" target="_blank" rel="noopener noreferrer" class="ui-radius-card group inline-flex items-center justify-between gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-brand-50/80 dark:hover:bg-brand-500/10 transition">
                  <span class="text-sm font-semibold">CFST优选IP</span>
                  <i data-lucide="arrow-up-right" class="w-4 h-4 text-brand-600 dark:text-brand-400"></i>
                </a>
                <a href="https://github.com/XIU2/CloudflareSpeedTest" target="_blank" rel="noopener noreferrer" class="ui-radius-card group inline-flex items-center justify-between gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-brand-50/80 dark:hover:bg-brand-500/10 transition">
                  <span class="text-sm font-semibold">CFST测速</span>
                  <i data-lucide="arrow-up-right" class="w-4 h-4 text-brand-600 dark:text-brand-400"></i>
                </a>
                <a href="https://github.com/Leo-Mu/montecarlo-ip-searcher" target="_blank" rel="noopener noreferrer" class="ui-radius-card group inline-flex items-center justify-between gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-brand-50/80 dark:hover:bg-brand-500/10 transition">
                  <span class="text-sm font-semibold">Montecarlo-IP测速</span>
                  <i data-lucide="arrow-up-right" class="w-4 h-4 text-brand-600 dark:text-brand-400"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="view-settings" class="view-section max-w-6xl mx-auto space-y-6" :class="{ active: App.currentHash === '#settings' }">
           <div class="settings-view-layout flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
              <div class="md:w-52 md:flex-shrink-0 md:self-start">
                <div class="settings-nav-shell w-full rounded-[24px] border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/70 p-2.5 md:p-3 shadow-sm shadow-slate-200/60 dark:shadow-none">
                  <div class="px-1 pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800">
                    <div class="text-[11px] font-semibold tracking-[0.16em] text-slate-400 dark:text-slate-500 uppercase">Settings</div>
                    <div class="text-[13px] font-semibold text-slate-900 dark:text-white mt-1">全局设置导航</div>
                  </div>
                  <div class="flex flex-row gap-1.5 overflow-x-auto whitespace-nowrap md:flex-col md:overflow-visible md:whitespace-normal" role="tablist" aria-label="全局设置导航">
                    <button class="set-tab min-w-[8.75rem] md:min-w-0 md:w-full flex-shrink-0 text-left px-3 py-2 rounded-xl border text-[13px] transition" :class="App.getSettingsTabClass('ui')" @click="App.switchSetTab('ui')" role="tab" aria-controls="set-ui" :aria-selected="App.activeSettingsTab === 'ui'">
                      <span class="block font-semibold">系统 UI</span>
                    </button>
                    <button v-if="App.isSettingsTabVisible('proxy')" class="set-tab min-w-[8.75rem] md:min-w-0 md:w-full flex-shrink-0 text-left px-3 py-2 rounded-xl border text-[13px] transition" :class="App.getSettingsTabClass('proxy')" @click="App.switchSetTab('proxy')" role="tab" aria-controls="set-proxy" :aria-selected="App.activeSettingsTab === 'proxy'">
                      <span class="block font-semibold">代理与网络</span>
                    </button>
                    <button v-if="App.isSettingsTabVisible('cache')" class="set-tab min-w-[8.75rem] md:min-w-0 md:w-full flex-shrink-0 text-left px-3 py-2 rounded-xl border text-[13px] transition" :class="App.getSettingsTabClass('cache')" @click="App.switchSetTab('cache')" role="tab" aria-controls="set-cache" :aria-selected="App.activeSettingsTab === 'cache'">
                      <span class="block font-semibold">静态资源策略</span>
                    </button>
                    <button v-if="App.isSettingsTabVisible('security')" class="set-tab min-w-[8.75rem] md:min-w-0 md:w-full flex-shrink-0 text-left px-3 py-2 rounded-xl border text-[13px] transition" :class="App.getSettingsTabClass('security')" @click="App.switchSetTab('security')" role="tab" aria-controls="set-security" :aria-selected="App.activeSettingsTab === 'security'">
                      <span class="block font-semibold">安全防护</span>
                    </button>
                    <button class="set-tab min-w-[8.75rem] md:min-w-0 md:w-full flex-shrink-0 text-left px-3 py-2 rounded-xl border text-[13px] transition" :class="App.getSettingsTabClass('logs')" @click="App.switchSetTab('logs')" role="tab" aria-controls="set-logs" :aria-selected="App.activeSettingsTab === 'logs'">
                      <span class="block font-semibold">日志设置</span>
                    </button>
                    <button class="set-tab min-w-[8.75rem] md:min-w-0 md:w-full flex-shrink-0 text-left px-3 py-2 rounded-xl border text-[13px] transition" :class="App.getSettingsTabClass('monitoring')" @click="App.switchSetTab('monitoring')" role="tab" aria-controls="set-monitoring" :aria-selected="App.activeSettingsTab === 'monitoring'">
                      <span class="block font-semibold">监控告警</span>
                    </button>
                    <button class="set-tab min-w-[8.75rem] md:min-w-0 md:w-full flex-shrink-0 text-left px-3 py-2 rounded-xl border text-[13px] transition" :class="App.getSettingsTabClass('account')" @click="App.switchSetTab('account')" role="tab" aria-controls="set-account" :aria-selected="App.activeSettingsTab === 'account'">
                      <span class="block font-semibold">账号设置</span>
                    </button>
                    <button class="set-tab min-w-[8.75rem] md:min-w-0 md:w-full flex-shrink-0 text-left px-3 py-2 rounded-xl border text-[13px] transition" :class="App.getSettingsTabClass('backup')" @click="App.switchSetTab('backup')" role="tab" aria-controls="set-backup" :aria-selected="App.activeSettingsTab === 'backup'">
                      <span class="block font-semibold">备份与恢复</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex-1 min-w-0" id="settings-forms" v-scroll-reset="App.settingsScrollResetKey">
                <div id="set-ui" v-show="App.activeSettingsTab === 'ui'" class="space-y-4">
                <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 shadow-sm settings-block">
                  <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                    <div>
                      <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Mode</div>
                      <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">设置操作视图</div>
                    </div>
                    <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">默认新手模式</span>
                  </div>
                  <p class="text-xs text-slate-500 mb-3 ml-6">新手模式会隐藏代理与网络、安全防护、静态资源策略分区，以及日志调优和修复工具；切到高手模式后可展开完整控制面。</p>
                  <div class="ml-6 flex flex-wrap gap-2">
                    <button type="button" @click="App.setSettingsExperienceMode('novice')" class="px-4 py-2 rounded-xl border text-sm font-medium transition" :class="App.getSettingsModeButtonClass('novice')">新手模式</button>
                    <button type="button" @click="App.setSettingsExperienceMode('expert')" class="px-4 py-2 rounded-xl border text-sm font-medium transition" :class="App.getSettingsModeButtonClass('expert')">高手模式</button>
                  </div>
                </div>
                <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 shadow-sm settings-block">
                  <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                    <div>
                      <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Radius</div>
                      <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">UI 圆角弧度</div>
                    </div>
                    <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">0-48 px</span>
                  </div>
                  <p class="text-xs text-slate-500 mb-3 ml-6">控制管理界面主要卡片/面板的圆角弧度；设置为 0 可关闭圆角（更接近矩形 UI）。</p>
                  <label class="block text-sm text-slate-500 mb-1 ml-6">圆角弧度</label>
                  <div class="relative w-[calc(100%-1.5rem)] ml-6">
                    <input type="number" min="0" max="48" step="1" id="cfg-ui-radius-px" v-model="App.settingsForm.uiRadiusPx" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-2 dark:text-white" value="10">
                    <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">px</span>
                  </div>
                  <p class="text-xs text-slate-500 ml-6">推荐 16-24；保存后会立即应用到所有管理员界面（仅 UI，不影响代理业务逻辑）。</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button @click="App.saveSettings('ui')" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition">保存 UI 设置</button>
                </div>
              </div>
              
              <div v-if="App.isSettingsTabVisible('proxy')" id="set-proxy" v-show="App.activeSettingsTab === 'proxy'" class="space-y-4">
                <div class="grid gap-4">
                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Protocol</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">基础协议策略</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">稳定优先</span>
                    </div>
                    <label class="flex items-center text-sm font-medium mb-2 cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-enable-h2" v-model="App.settingsForm.enableH2" class="mr-2 w-4 h-4 rounded"> 允许开启 HTTP/2 (不建议)</label>
                    <p class="text-xs text-slate-500 mb-3 ml-6">适合少数明确支持多路复用的上游；部分视频源在分片、长连接或头部兼容性上反而更容易出现异常。</p>
                    <label class="flex items-center text-sm font-medium mb-2 cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-enable-h3" v-model="App.settingsForm.enableH3" class="mr-2 w-4 h-4 rounded"> 允许开启 HTTP/3 QUIC (仅网络质量稳定时按需开启)</label>
                    <p class="text-xs text-slate-500 mb-3 ml-6">适合网络质量稳定、丢包率低的环境；弱网或运营商链路复杂时，实际稳定性未必优于 HTTP/1.1。</p>
                    <label class="flex items-center text-sm font-medium mb-2 cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-peak-downgrade" v-model="App.settingsForm.peakDowngrade" class="mr-2 w-4 h-4 rounded" checked> 晚高峰 (20:00 - 24:00) 自动降级为 HTTP/1.1 兜底</label>
                    <p class="text-xs text-slate-500 mb-3 ml-6">高峰时段优先稳态传输，减少握手抖动、异常回源和多路复用放大的兼容性问题。</p>
                    <label class="flex items-center text-sm font-medium cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-protocol-fallback" v-model="App.settingsForm.protocolFallback" class="mr-2 w-4 h-4 rounded" checked> 开启协议回退与 403 重试 (剥离报错头重连，缓解视频报错)</label>
                    <p class="text-xs text-slate-500 mt-2 ml-6">当上游返回 403 或握手异常时，自动剥离可疑报错头并切换到更稳的协议后重试一次。</p>
                  </div>

                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Metadata Pre-warm</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">轻量级元数据预热</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">海报 / 索引</span>
                    </div>
                    <label class="flex items-center text-sm font-medium mb-2 cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-enable-prewarm" v-model="App.settingsForm.enablePrewarm" class="mr-2 w-4 h-4 rounded" checked> 开启轻量级元数据预热</label>
                    <p class="text-xs text-slate-500 mb-3 ml-6">仅预热索引文件、字幕和海报，大幅提升起播感知速度，同时避免 Worker 参与视频字节流的长时间 I/O。</p>
                    <label class="block text-sm text-slate-500 mb-1 ml-6">元数据预热缓存时长</label>
                    <div class="relative w-[calc(100%-1.5rem)] ml-6">
                      <input type="number" min="0" max="3600" step="1" id="cfg-prewarm-ttl" v-model="App.settingsForm.prewarmCacheTtl" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-2 dark:text-white" value="120">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">秒</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-4 ml-6">该 TTL 只作用于 <code>.m3u8</code>、<code>.vtt/.srt</code> 等轻量元数据；海报仍沿用静态资源策略。检测到 <code>.mp4</code>、<code>.mkv</code>、<code>.ts</code>、<code>.m4s</code> 等视频字节流时，会立即跳过异步预热。</p>
                    <label class="block text-sm text-slate-500 mb-1 ml-6">预热深度</label>
                    <select id="cfg-prewarm-depth" v-model="App.settingsForm.prewarmDepth" @change="App.syncProxySettingsGuardrails()" class="w-[calc(100%-1.5rem)] ml-6 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-2 dark:text-white">
                      <option value="poster">仅预热海报</option>
                      <option value="poster_manifest">预热海报+索引</option>
                    </select>
                    <p class="text-xs text-slate-500 mb-3 ml-6">“索引”包含播放列表与字幕等轻量元数据，不包含任何视频分片或大文件 Range。</p>
                    <p id="cfg-prewarm-runtime-hint" class="text-xs text-cyan-700 dark:text-cyan-300 mb-3 ml-6">{{ App.proxySettingsGuardrails.prewarmHint }}</p>
                  </div>

                  <div v-if="App.isSettingsExpertMode()" class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Direct</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">资源直连分流</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">静态 / HLS / DASH</span>
                    </div>
                    <label class="flex items-center text-sm font-medium mb-2 cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-direct-static-assets" v-model="App.settingsForm.directStaticAssets" @change="App.syncProxySettingsGuardrails()" class="mr-2 w-4 h-4 rounded"> 静态文件直连</label>
                    <p class="text-xs text-slate-500 mb-3 ml-6">这里现在只对 JS、CSS、字体、source map、webmanifest 这类前端静态文件生效。海报、封面、字幕继续走 Worker 边缘缓存，因为它们走 307 直连通常会多一次跳转并丢掉缓存，反而更慢。</p>
                    <label class="flex items-center text-sm font-medium mb-2 cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-direct-hls-dash" v-model="App.settingsForm.directHlsDash" @change="App.syncProxySettingsGuardrails()" class="mr-2 w-4 h-4 rounded"> HLS / DASH 直连</label>
                    <p class="text-xs text-slate-500">命中 <code>.m3u8</code>、<code>.mpd</code>、<code>.ts</code>、<code>.m4s</code> 等播放列表或分片时，返回 307 让播放器直接回源；这能明显减少 Worker 中继流量。<code>.vtt</code> 字幕轨默认仍走 Worker 缓存，避免 307 多一跳导致双语字幕更慢。</p>
                    <p id="cfg-direct-mode-hint" class="text-xs text-cyan-700 dark:text-cyan-300 mt-3">{{ App.proxySettingsGuardrails.directHint }}</p>
                  </div>

                  <div v-if="App.isSettingsExpertMode()" class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Relay</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">跳转代理与外链规则</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">同源 / 外链</span>
                    </div>
                    <label class="flex items-center text-sm font-medium mb-2 cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-source-same-origin-proxy" v-model="App.settingsForm.sourceSameOriginProxy" class="mr-2 w-4 h-4 rounded" checked> 默认开启：源站和同源跳转代理</label>
                    <p class="text-xs text-slate-500 mb-3">开启时既包含源站 2xx 的 Worker 透明拉流，也包含同源 30x 的继续代理跳转；仅当节点被显式标记为直连，或启用了“静态文件直连 / HLS-DASH 直连”时，源站 2xx 才会改为 307 直连源站。关闭后，同源 30x 直接下发 Location。</p>
                    <label class="flex items-center text-sm font-medium mb-2 cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-force-external-proxy" v-model="App.settingsForm.forceExternalProxy" class="mr-2 w-4 h-4 rounded" checked> 默认开启：强制反代外部链接</label>
                    <p class="text-xs text-slate-500 mb-3">开启后 Worker 会作为中继站拉流并透明转发；除国内网盘/对象存储外默认不缓存，命中 <code>wangpandirect</code> 列表走直连。关闭后外部链接直接下发直连。</p>
                    <p class="text-xs text-slate-500 mb-2">默认已填入内置关键词；请使用英文逗号分隔自定义内容，例如 <code>baidu,alibaba</code>。</p>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">wangpandirect 直连黑名单（关键词模糊匹配，英文逗号分隔）</label>
                    <textarea id="cfg-wangpandirect" v-model="App.settingsForm.wangpandirect" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white resize-y" rows="3" placeholder="例如: baidu,alibaba"></textarea>
                  </div>

                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Node Direct</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">源站直连名单</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">节点级直连</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-3">这里列出现有节点。勾选后，这些节点在“源站和同源跳转代理”开启时，源站 2xx 会直接下发到源站，不再由 Worker 中继；未勾选节点继续由 Worker 透明拉流。</p>
                    <input type="text" id="cfg-direct-node-search" v-model.trim="App.settingsDirectNodeSearch" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-3 dark:text-white" placeholder="搜索节点名称、标签或备注...">
                    <div id="cfg-source-direct-nodes-summary" class="text-xs text-slate-500 mb-2">{{ App.getSourceDirectNodesSummaryText() }}</div>
                    <div id="cfg-source-direct-nodes-list" class="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-950/60 p-2 space-y-2 settings-list-shell">
                      <div v-if="!App.nodes.length" class="text-sm text-slate-500 px-3 py-2">暂无可选节点</div>
                      <div v-else-if="!App.getFilteredSourceDirectNodes().length" class="text-sm text-slate-500 px-3 py-2">没有匹配的节点</div>
                      <label v-for="node in App.getFilteredSourceDirectNodes()" :key="node.name" class="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 cursor-pointer">
                        <input type="checkbox" class="mt-1 w-4 h-4 rounded" :checked="App.isSourceDirectNodeSelected(node.name)" @change="App.toggleSourceDirectNode(node.name, $event.target.checked)">
                        <div class="min-w-0 flex-1">
                          <div class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ node.displayName || node.name || '未命名节点' }}</div>
                          <div class="text-xs text-slate-500 mt-1 break-all">{{ [node.tag ? ('标签: ' + node.tag) : '', node.remark ? ('备注: ' + node.remark) : ''].filter(Boolean).join('  ·  ') || '无标签 / 备注' }}</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div v-if="App.isSettingsExpertMode()" class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Probe</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">健康检查探测</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">1000-180000 ms</span>
                    </div>
                    <label class="block text-sm text-slate-500 mb-1">Ping 超时时间</label>
                    <div class="relative">
                      <input type="number" min="1000" max="180000" step="500" id="cfg-ping-timeout" v-model="App.settingsForm.pingTimeout" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-2 dark:text-white" value="5000">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">ms</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-3">系统会限制在 1000 到 180000 毫秒之间，避免探测等待时间过长拖住后台操作。</p>
                    <label class="block text-sm text-slate-500 mb-1">Ping 缓存时间</label>
                    <div class="relative">
                      <input type="number" min="0" max="1440" step="1" id="cfg-ping-cache-minutes" v-model="App.settingsForm.pingCacheMinutes" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-2 dark:text-white" value="10">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">分钟</span>
                    </div>
                    <p class="text-xs text-slate-500">缓存只用于自动复用历史测速结果；用户手动触发单点测速、节点测速或全局 Ping 时会直接重测并覆盖旧值。</p>
                    <label class="flex items-start gap-3 text-sm font-medium cursor-pointer text-slate-900 dark:text-white mt-4">
                      <input type="checkbox" id="cfg-node-panel-ping-auto-sort" v-model="App.settingsForm.nodePanelPingAutoSort" class="mt-0.5 w-4 h-4 rounded">
                      <span>节点面板一键测速后自动按延迟排序并切换到最低延迟线路</span>
                    </label>
                    <p class="text-xs text-slate-500 mt-2">默认关闭。仅影响“新建节点 / 编辑节点”面板的一键测试延迟；全局 Ping 与节点卡片 Ping 只测试当前启用线路，不自动排序。</p>
                  </div>

                  <div v-if="App.isSettingsExpertMode()" class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Upstream</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">上游请求防挂死保护</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">最多 3 次重试</span>
                    </div>
                    <label class="block text-sm text-slate-500 mb-1">上游握手超时</label>
                    <div class="relative">
                      <input type="number" min="0" max="180000" step="500" id="cfg-upstream-timeout-ms" v-model="App.settingsForm.upstreamTimeoutMs" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-2 dark:text-white" value="8000">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">ms</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-3">系统会限制在 0 到 180000 毫秒之间，避免把超时配置得过大导致失败请求长期占用连接。</p>
                    <label class="block text-sm text-slate-500 mb-1">额外重试轮次（仅 GET / HEAD 等安全请求）</label>
                    <div class="relative">
                      <input type="number" min="0" max="3" step="1" id="cfg-upstream-retry-attempts" v-model="App.settingsForm.upstreamRetryAttempts" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-2 dark:text-white" value="0">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">次</span>
                    </div>
                    <p class="text-xs text-slate-500">每一轮都会重新遍历节点目标地址与可重试状态码。带流式请求体的非幂等请求不会启用额外重试，避免副作用放大；这里上限固定为 3，防止重试过多额外消耗 Worker 子请求预算。</p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button @click="App.applyRecommendedSettings('proxy')" class="px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl text-sm transition hover:bg-emerald-50 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20">恢复推荐值</button>
                  <button @click="App.saveSettings('proxy')" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition">保存代理网络</button>
                </div>
              </div>
              
              <div v-if="App.isSettingsTabVisible('cache')" id="set-cache" v-show="App.activeSettingsTab === 'cache'" class="space-y-4">
                <div class="grid gap-4">
                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-sky-500 dark:text-sky-300">Static Asset Cache</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">静态资源策略</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">0-365 天</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-2 mb-3">统一描述海报、封面、字幕、JS、CSS 等静态资源的缓存策略入口；高手模式下可进一步细调直连与跨域规则。</p>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">静态资源缓存时长</label>
                    <div class="relative">
                      <input type="number" min="0" max="365" id="cfg-cache-ttl" v-model="App.settingsForm.cacheTtlImages" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" value="30">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">天</span>
                    </div>
                  </div>

                  <div v-if="App.isSettingsExpertMode()" class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-emerald-500 dark:text-emerald-300">CORS</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">浏览器跨域策略</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">留空为 *</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-2 mb-3">用于限制哪些网页前端可以在浏览器里跨域调用本 Worker API；它主要影响浏览器环境，不影响服务器到服务器的直连请求。</p>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CORS 跨域白名单 (留空为 *，如 https://emby.com)</label>
                    <input type="text" id="cfg-cors" v-model="App.settingsForm.corsOrigins" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white">
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button @click="App.saveSettings('security', 'cache')" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition">保存静态资源策略</button>
                </div>
              </div>

              <div v-if="App.isSettingsTabVisible('security')" id="set-security" v-show="App.activeSettingsTab === 'security'" class="space-y-4">
                <div class="grid gap-4">
                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block">
                    <div class="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Firewall</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">访问控制与限速</div>
                        <p class="text-xs text-slate-500 mt-2">先决定允许谁进来，再决定异常请求多快被压住。</p>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white text-slate-500 border border-slate-200 px-2.5 py-1 text-[10px] font-semibold dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700">Geo + IP + Rate</span>
                    </div>
                    <div class="grid gap-4">
	                      <div>
	                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">国家/地区访问模式</label>
	                        <p class="text-xs text-slate-500 mb-2">在白名单模式和黑名单模式之间二选一，统一使用同一份国家/地区列表，避免同时填两边造成规则冲突。</p>
	                        <p v-if="App.hasGeoFirewallConflict()" class="text-xs text-amber-700 dark:text-amber-300 mb-2">{{ App.getGeoFirewallConflictHint() }}</p>
	                        <div class="flex flex-wrap gap-2">
	                          <button type="button" @click="App.setGeoMode('allowlist')" class="px-3 py-2 rounded-xl border text-sm font-medium transition" :class="App.getGeoModeButtonClass('allowlist')">白名单模式</button>
	                          <button type="button" @click="App.setGeoMode('blocklist')" class="px-3 py-2 rounded-xl border text-sm font-medium transition" :class="App.getGeoModeButtonClass('blocklist')">黑名单模式</button>
	                        </div>
	                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">国家/地区名单 (逗号分隔，如: CN,HK)</label>
                        <p class="text-xs text-slate-500 mb-2">{{ App.settingsForm.geoMode === 'blocklist' ? '当前为黑名单模式：命中的国家/地区会被直接拦截。' : '当前为白名单模式：只有命中的国家/地区允许访问；留空则等同于关闭 Geo 限制。' }}</p>
                        <input type="text" id="cfg-geo-regions" v-model="App.settingsForm.geoRegions" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" :placeholder="App.settingsForm.geoMode === 'blocklist' ? '例如: US,SG' : '例如: CN,HK'">
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IP 黑名单 (逗号分隔)</label>
                        <p class="text-xs text-slate-500 mb-2">这里屏蔽的是访问者的公网 IP；命中后会直接拒绝该用户/设备的请求，适合封禁恶意爬虫、攻击源或异常账号。</p>
                        <textarea id="cfg-ip-black" v-model="App.settingsForm.ipBlacklist" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white resize-y" rows="2"></textarea>
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">全局单 IP 限速</label>
                        <p class="text-xs text-slate-500 mb-2">对单个访客源 IP 生效；超过阈值后可快速压制刷接口、扫库和异常爆发流量。</p>
                        <div class="relative">
                          <input type="number" id="cfg-rate-limit" v-model="App.settingsForm.rateLimitRpm" class="w-full p-2 pr-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" placeholder="如: 600">
                          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">次/分</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-5 shadow-sm settings-block">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Checklist</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">建议顺序</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">先通后收紧</span>
                    </div>
                    <div class="text-xs leading-6 text-slate-500">
                      1. 先留空白名单与 CORS，确保基础访问正常。<br>
                      2. 再逐步补充 Geo / IP 黑名单，观察是否误伤。<br>
                      3. 最后再收紧限速和缓存天数，避免一次改太多难排错。
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button @click="App.saveSettings('security')" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition">保存安全防护</button>
                </div>
              </div>
              
              <div id="set-logs" v-show="App.activeSettingsTab === 'logs'" class="space-y-4">
	                <div class="grid gap-4">
	                  <div v-if="App.isSettingsExpertMode()" class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block">
	                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
	                      <div>
	                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Search</div>
	                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">日志搜索模式</div>
	                      </div>
	                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">LIKE / FTS5</span>
	                    </div>
	                    <div class="flex flex-wrap gap-2">
	                      <button type="button" @click="App.setSettingsLogSearchMode('like')" class="px-3 py-2 rounded-xl border text-sm font-medium transition" :class="App.getSettingsLogSearchModeButtonClass('like')">LIKE 模糊匹配</button>
	                      <button type="button" @click="App.setSettingsLogSearchMode('fts')" class="px-3 py-2 rounded-xl border text-sm font-medium transition" :class="App.getSettingsLogSearchModeButtonClass('fts')">FTS 语法查询</button>
	                    </div>
	                    <p class="text-xs text-slate-500 mt-3">{{ App.getSettingsLogSearchModeHint() }}</p>
	                  </div>
	                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Storage</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">日志队列与落盘</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">Cloudflare 上限已内置</span>
                    </div>
                    <div class="grid gap-3">
                      <div>
                        <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">日志保存</label>
                        <div class="relative">
                          <input type="number" min="1" max="365" step="1" id="cfg-log-days" v-model="App.settingsForm.logRetentionDays" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" value="7">
                          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">天</span>
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">日志写入延迟</label>
                        <div class="relative">
                          <input type="number" min="0" max="1440" step="0.5" id="cfg-log-delay" v-model="App.settingsForm.logWriteDelayMinutes" class="w-full p-2 pr-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" value="20">
                          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">分钟</span>
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">提前写入阈值</label>
                        <div class="relative">
                          <input type="number" min="1" max="5000" step="1" id="cfg-log-flush-count" v-model="App.settingsForm.logFlushCountThreshold" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" value="50">
                          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">条</span>
                        </div>
                      </div>
                      <div v-if="App.isSettingsExpertMode()">
                        <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">D1 切片大小</label>
                        <div class="relative">
                          <input type="number" min="1" max="100" step="1" id="cfg-log-batch-size" v-model="App.settingsForm.logBatchChunkSize" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" value="50">
                          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">条</span>
                        </div>
                      </div>
                      <div v-if="App.isSettingsExpertMode()">
                        <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">D1 重试次数</label>
                        <div class="relative">
                          <input type="number" min="0" max="5" step="1" id="cfg-log-retry-count" v-model="App.settingsForm.logBatchRetryCount" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" value="2">
                          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">次</span>
                        </div>
                      </div>
                      <div v-if="App.isSettingsExpertMode()">
                        <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">重试退避</label>
                        <div class="relative">
                          <input type="number" min="0" max="5000" step="25" id="cfg-log-retry-backoff" v-model="App.settingsForm.logBatchRetryBackoffMs" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" value="75">
                          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">ms</span>
                        </div>
                      </div>
                      <div v-if="App.isSettingsExpertMode()" class="md:col-span-2">
                        <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">定时任务租约时长</label>
                        <div class="relative">
                          <input type="number" min="30000" max="900000" step="1000" id="cfg-scheduled-lease-ms" v-model="App.settingsForm.scheduledLeaseMs" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" value="300000">
                          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">ms</span>
                        </div>
                      </div>
                    </div>
                    <p class="text-xs text-slate-500 mt-3">内存日志队列满足“达到延迟分钟”或“累计达到条数阈值”任一条件即写入 D1。Cloudflare 官方文档说明 Cron Trigger 单次执行最长 15 分钟，因此租约上限固定为 900000 毫秒；D1 单批切片也限制为最多 100 条，避免单次批量过大。</p>
                  </div>

                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-emerald-500 dark:text-emerald-300">Recommended</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">推荐生产值</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">生产环境</span>
                    </div>
                    <div class="text-xs leading-6 text-slate-600 dark:text-slate-300">
                      日志保存天数：7 到 14 天<br>
                      写入延迟：5 到 20 分钟<br>
                      提前写入阈值：50 到 200 条<br>
                      单批切片：50 到 100 条<br>
                      重试次数：1 到 2 次，退避 75 到 200 毫秒<br>
                      定时任务租约：300000 到 600000 毫秒
                    </div>
                  </div>

                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-amber-500 dark:text-amber-300">Tuning</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">异常调优指引</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">逐项小步调</span>
                    </div>
                    <div class="text-xs leading-6 text-slate-600 dark:text-slate-300">
                      D1 写入失败增多：先提高重试次数或退避，再观察 lastFlushRetryCount。<br>
                      队列长期堆积：降低写入延迟或下调提前写入阈值。<br>
                      单次刷盘过慢：降低单批切片大小。<br>
                      定时任务频繁重入：适当增大租约时长，但不要超过实际任务耗时太多。<br>
                      只想快速止血：优先保留默认值，再逐项小步调整。
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <button @click="App.applyRecommendedSettings('logs')" class="px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl text-sm transition hover:bg-emerald-50 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20">恢复推荐值</button>
                    <button @click="App.saveSettings('logs')" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition">保存日志设置</button>
                </div>
              </div>

              <div id="set-monitoring" v-show="App.activeSettingsTab === 'monitoring'" class="space-y-4">
                <div class="grid gap-4">
                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Telegram</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">每日报表与告警机器人</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">先测连通</span>
                    </div>
                    <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">Telegram Bot Token</label>
                    <input type="text" id="cfg-tg-token" v-model="App.settingsForm.tgBotToken" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-3 dark:text-white" placeholder="如: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ">
                    <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">Telegram Chat ID (接收人ID)</label>
                    <input type="text" id="cfg-tg-chatid" v-model="App.settingsForm.tgChatId" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" placeholder="如: 123456789">
                  </div>

                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Alert</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">Telegram 异常告警阈值</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">1-1440 分钟</span>
                    </div>
                    <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">日志丢弃批次阈值</label>
                    <div class="relative">
                      <input type="number" min="0" max="5000" step="1" id="cfg-tg-alert-drop-threshold" v-model="App.settingsForm.tgAlertDroppedBatchThreshold" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-3 dark:text-white" value="0">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">批</span>
                    </div>
                    <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">D1 写入重试阈值</label>
                    <div class="relative">
                      <input type="number" min="0" max="10" step="1" id="cfg-tg-alert-retry-threshold" v-model="App.settingsForm.tgAlertFlushRetryThreshold" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-3 dark:text-white" value="0">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">次</span>
                    </div>
                    <label class="flex items-center text-sm font-medium mb-2 cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-tg-alert-scheduled-failure" v-model="App.settingsForm.tgAlertOnScheduledFailure" class="mr-2 w-4 h-4 rounded"> 定时任务进入 failed / partial_failure 时告警</label>
                    <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">同类告警冷却时间</label>
                    <div class="relative">
                      <input type="number" min="1" max="1440" step="1" id="cfg-tg-alert-cooldown-minutes" v-model="App.settingsForm.tgAlertCooldownMinutes" class="w-full p-2 pr-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-2 dark:text-white" value="30">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">分钟</span>
                    </div>
                    <p class="text-xs text-slate-500">告警由定时任务在后台判断并发送。建议先完成 Bot Token 与 Chat ID 测试，再启用阈值；系统会把冷却时间限制在 1 到 1440 分钟之间。</p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <button @click="App.saveSettings('logs', 'monitoring')" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition">保存监控设置</button>
                    <button @click="App.testTelegram()" class="px-4 py-2 border border-blue-200 text-blue-600 rounded-xl text-sm transition hover:bg-blue-50 dark:border-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/20 flex items-center justify-center"><i data-lucide="send" class="w-4 h-4 mr-1"></i> 发送测试通知</button>
                    <button @click="App.sendDailyReport()" class="px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl text-sm transition hover:bg-emerald-50 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20 flex items-center justify-center"><i data-lucide="file-bar-chart" class="w-4 h-4 mr-1"></i> 手动发送日报</button>
                </div>
              </div>
              
              <div id="set-account" v-show="App.activeSettingsTab === 'account'" class="space-y-4">
                <div class="grid gap-4">
                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Login</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">后台登录有效期</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">按天计算</span>
                    </div>
                    <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">免密登录有效期</label>
                    <div class="relative">
                    <input type="number" id="cfg-jwt-days" v-model="App.settingsForm.jwtExpiryDays" class="w-full p-2 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none dark:text-white" value="30">
                      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">天</span>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Cloudflare</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">Cloudflare 联动</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">可选增强</span>
                    </div>
                    <p class="text-sm text-slate-500 mb-4">这些参数主要用于仪表盘增强统计和一键清理缓存。没填时基础代理仍可用，只是部分联动能力会缺失。</p>
                    <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">Cloudflare 账号 ID</label>
                    <input type="text" id="cfg-cf-account" v-model="App.settingsForm.cfAccountId" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-3 dark:text-white">
                    <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">Cloudflare Zone ID (区域ID，用于面板数据与清理缓存)</label>
                    <input type="text" id="cfg-cf-zone" v-model="App.settingsForm.cfZoneId" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-3 dark:text-white">
                    <label class="block text-sm font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-200 mb-1">Cloudflare API 令牌</label>
                    <input type="text" id="cfg-cf-token" v-model="App.settingsForm.cfApiToken" class="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none mb-4 dark:text-white">
                    <div class="flex flex-wrap gap-2">
                      <button @click="App.saveSettings('account')" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition">保存账号设置</button>
                      <button @click="App.purgeCache()" class="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm transition hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20">一键清理全站缓存 (Purge)</button>
                    </div>
                  </div>
                </div>
              </div>

              <div id="set-backup" v-show="App.activeSettingsTab === 'backup'" class="space-y-4">
                <div class="grid gap-4">
                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Snapshot</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">设置变更快照</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">最多保留 5 个</span>
                    </div>
                    <p class="text-sm text-slate-500 mb-3">系统会保留最近 5 个全局设置变更快照。恢复快照时，会先把当前配置再记一份快照，确保你始终有回退余地。</p>
                    <div class="flex gap-2 mb-4">
                      <button @click="App.loadConfigSnapshots()" class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"><i data-lucide="refresh-cw" class="w-4 h-4 inline mr-1"></i> 刷新快照</button>
                      <button @click="App.clearConfigSnapshots()" class="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm transition hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"><i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i> 清理快照</button>
                    </div>
                    <div id="cfg-snapshots-list" v-auto-animate class="space-y-3">
                      <div v-if="!App.configSnapshots.length" class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500">暂无设置快照。保存、导入或恢复全局设置后，这里会出现最近的历史版本。</div>
                      <div v-for="snapshot in App.configSnapshots" :key="snapshot.id" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">
                        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div class="min-w-0">
                            <div class="text-sm font-semibold text-slate-900 dark:text-white break-all">{{ App.formatSnapshotReason(snapshot) }}</div>
                            <div class="text-xs text-slate-500 mt-1">创建时间：{{ App.formatLocalDateTime(snapshot.createdAt) }}</div>
                            <div class="text-xs text-slate-500 mt-1">变更字段：{{ App.getConfigSnapshotChangedKeysText(snapshot) }}</div>
                          </div>
                          <button @click="App.restoreConfigSnapshot(snapshot.id)" class="px-3 py-2 border border-brand-200 text-brand-600 rounded-xl text-sm transition hover:bg-brand-50 dark:border-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/20 whitespace-nowrap">恢复此快照</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="App.isSettingsExpertMode()" class="rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-amber-200/80 dark:border-amber-900/40">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-amber-500 dark:text-amber-400">Advanced Repair</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">一键整理 KV 数据</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-amber-700 border border-amber-200 dark:bg-slate-900 dark:border-amber-900/40 dark:text-amber-300">谨慎使用</span>
                    </div>
                    <p class="text-sm text-slate-500 mb-4">用于旧版本升级后出现 <code>sys:theme</code> 脏值、<code>sys:nodes_index</code> 错乱或遗留 Cloudflare 仪表盘缓存键时的整理修复。不会删除 <code>node:*</code> 节点实体；定时任务也会在上次整理成功 1 小时后自动兜底执行一次。</p>
                    <div class="flex gap-4 flex-wrap">
                      <button @click="App.tidyKvData()" class="px-4 py-2 border border-amber-300 text-amber-700 rounded-xl text-sm transition hover:bg-amber-100 dark:border-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/20"><i data-lucide="database" class="w-4 h-4 inline mr-1"></i> 一键整理 KV 数据</button>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Settings Only</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">全局设置专用迁移</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">不含节点</span>
                    </div>
                    <p class="text-sm text-slate-500 mb-4">只导出 / 导入 settings，不包含节点清单。适合多环境同步代理、监控、账号与 Dashboard 策略。</p>
                    <div class="flex gap-4 flex-wrap">
                      <label class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm transition font-medium"><i data-lucide="upload-cloud" class="w-4 h-4 inline mr-1"></i> 导入全局设置<input type="file" id="import-settings-file" class="hidden" accept=".json" @change="App.importSettings($event)"></label>
                      <button @click="App.exportSettings()" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition font-medium"><i data-lucide="download-cloud" class="w-4 h-4 inline mr-1"></i> 导出全局设置</button>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 shadow-sm settings-block h-full">
                    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div class="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500">Full Backup</div>
                        <div class="text-base font-semibold text-slate-900 dark:text-white mt-1">备份与恢复 (全量 KV 数据)</div>
                      </div>
                      <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">节点 + 设置</span>
                    </div>
                    <p class="text-sm text-slate-500 mb-4">导出或导入系统内的所有节点以及全局设置数据（单文件）。</p>
                    <div class="flex gap-4 flex-wrap">
                      <label class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm transition font-medium"><i data-lucide="upload" class="w-4 h-4 inline mr-1"></i> 导入完整备份<input type="file" id="import-full-file" class="hidden" accept=".json" @change="App.importFull($event)"></label>
                      <button @click="App.exportFull()" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition font-medium"><i data-lucide="download" class="w-4 h-4 inline mr-1"></i> 导出完整备份</button>
                    </div>
                  </div>
                </div>
              </div>
              
              </div>
           </div>
      </div>

    </div>
  </main>

  <dialog id="node-modal" v-dialog-visible="App.nodeModalOpen" v-lucide-icons @cancel.prevent="App.handleNodeModalCancel($event)" @close="App.handleNodeModalNativeClose()" class="backdrop:bg-slate-950/60 bg-transparent w-11/12 md:w-full max-w-6xl m-auto p-0">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
      <h2 class="text-xl font-bold mb-4 text-slate-900 dark:text-white" id="node-modal-title">{{ App.nodeModalForm.originalName ? '编辑节点' : '新建节点' }}</h2>
	     <form @submit.prevent="App.saveNode()" novalidate class="space-y-4 max-h-[calc(80vh-env(safe-area-inset-bottom)-env(safe-area-inset-top))] overflow-y-auto pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[max(0.5rem,env(safe-area-inset-right))]">
          <div v-if="App.nodeModalFeedback.message" class="rounded-2xl border px-4 py-3 text-sm font-medium" :class="App.getNodeModalFeedbackClass(App.nodeModalFeedback.tone)">
            {{ App.nodeModalFeedback.message }}
          </div>
	        <input type="hidden" id="form-original-name" :value="App.nodeModalForm.originalName">
	        <input type="hidden" id="form-active-line-id" :value="App.nodeModalForm.activeLineId">
	        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
	          <div>
              <label class="block text-sm text-slate-500 mb-1">节点名称</label>
              <input type="text" id="form-display-name" v-model="App.nodeModalForm.displayName" @input="App.handleNodeModalDisplayNameInput()" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white" :class="App.getNodeModalFieldClass('displayName')" required>
              <p v-if="App.getNodeModalFieldError('displayName')" class="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{{ App.getNodeModalFieldError('displayName') }}</p>
            </div>
	          <div>
              <label class="block text-sm text-slate-500 mb-1">节点路径</label>
              <input type="text" id="form-name" v-model="App.nodeModalForm.name" @input="App.handleNodeModalPathInput()" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white" :class="App.getNodeModalFieldClass('name')" placeholder="例如 alpha-node 或 hk_01">
              <p class="mt-1 text-xs text-slate-400">仅支持单段路径：小写字母、数字、连字符(-)、下划线(_)。保存时会自动转为小写。</p>
              <p v-if="App.getNodeModalFieldError('name')" class="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{{ App.getNodeModalFieldError('name') }}</p>
            </div>
	        </div>
	        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		          <div><label class="block text-sm text-slate-500 mb-1">标签</label><div class="flex gap-2"><input type="text" id="form-tag" v-model="App.nodeModalForm.tag" class="flex-1 min-w-0 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white"><select id="form-tag-color" v-model="App.nodeModalForm.tagColor" class="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white"><option value="amber">琥珀</option><option value="emerald">翠绿</option><option value="sky">天蓝</option><option value="violet">紫</option><option value="rose">红</option><option value="slate">灰</option></select></div></div>
		          <div><label class="block text-sm text-slate-500 mb-1">备注</label><input type="text" id="form-remark" v-model="App.nodeModalForm.remark" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white"></div>
		        </div>
	        
	        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-slate-500 mb-1">访问鉴权 (Secret, 可留空)</label>
              <input type="text" id="form-secret" v-model="App.nodeModalForm.secret" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white">
            </div>
            <div>
              <label class="block text-sm text-slate-500 mb-1">媒体认证头模式</label>
              <select id="form-media-auth-mode" v-model="App.nodeModalForm.mediaAuthMode" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white">
                <option value="auto">自动识别 (推荐)</option>
                <option value="emby">强制 Emby</option>
                <option value="jellyfin">强制 Jellyfin</option>
                <option value="passthrough">完全透传（保留原始认证头）</option>
              </select>
              <p class="mt-1 text-xs text-slate-400">用于兼容不同上游的登录与会话请求。自动模式会按请求里已有的媒体认证头家族做规范化；“完全透传”表示保留原始 <code>Authorization</code> / <code>X-Emby-Authorization</code> / <code>X-MediaBrowser-Authorization</code>，不做改写。</p>
            </div>
            <div>
              <label class="block text-sm text-slate-500 mb-1">真实客户端 IP 透传</label>
              <select id="form-real-client-ip-mode" v-model="App.nodeModalForm.realClientIpMode" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white">
                <option value="forward">透传 X-Real-IP 和 X-Forwarded-For (推荐)</option>
                <option value="strip">仅保留 X-Real-IP</option>
                <option value="disable">强制不透传【慎用】</option>
              </select>
              <p class="mt-1 text-xs text-slate-400">真实客户端 IP 透传由 <code>X-Real-IP</code> 和 <code>X-Forwarded-For</code> 决定。你可以按节点选择透传这两个请求头、仅保留 <code>X-Real-IP</code>，或强制不透传 <code>X-Real-IP</code> 和 <code>X-Forwarded-For</code>。</p>
            </div>
          </div>
	        
	        <div class="rounded-2xl border p-4" :class="App.getNodeModalLinesPanelClass()">
	          <div class="flex items-center justify-between gap-3 mb-3">
	            <div>
	              <label class="block text-sm text-slate-500">线路列表</label>
		              <p class="text-xs text-slate-400 mt-1">支持单节点多线路、手动启用、桌面端整行拖拽排序和一键延迟测试；是否自动排序可在全局设置中控制。</p>
                  <p v-if="App.getNodeModalFieldError('lines')" class="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{{ App.getNodeModalFieldError('lines') }}</p>
	            </div>
	            <div class="flex items-center gap-2">
	              <button type="button" @click="App.pingAllNodeLinesInModal()" :disabled="App.nodeModalPingAllPending" class="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">{{ App.nodeModalPingAllText }}</button>
	              <button type="button" @click="App.addNodeLine()" class="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition">+ 添加线路</button>
	            </div>
	          </div>
	          <div class="hidden md:grid md:grid-cols-[88px_1.15fr_2.1fr_92px_164px] gap-3 px-3 pb-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-slate-400">
	            <span>启用</span>
	            <span>线路名称</span>
	            <span>目标源站</span>
	            <span>延迟</span>
	            <span>拖拽 / 删除</span>
	          </div>
	          <div id="node-lines-container" v-node-lines-drag="{ app: App }" class="space-y-3">
	            <div v-for="(line, index) in App.nodeModalLines" :key="line.id" :class="App.getNodeModalLineRowClass(line.id)" :draggable="App.isDesktopNodeLineDragEnabled()" data-node-line-row="1" :data-line-id="line.id">
	              <div class="md:hidden flex items-center justify-between gap-3 mb-3">
	                <div class="text-xs font-semibold tracking-[0.1em] uppercase text-slate-400">线路 {{ index + 1 }}</div>
	                <span class="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-300">{{ line.name || App.buildDefaultLineName(index) }}</span>
	              </div>
	              <div class="grid gap-3 md:grid-cols-[88px_1.15fr_2.1fr_92px_164px] md:items-center">
	                <label data-node-line-interactive="1" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
	                  <input data-node-line-interactive="1" type="radio" name="node-active-line" class="w-4 h-4" :value="line.id" v-model="App.nodeModalForm.activeLineId">
	                  <span>启用</span>
	                </label>
	                <input data-node-line-interactive="1" type="text" v-model="line.name" :placeholder="App.buildDefaultLineName(index)" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white">
		                <div class="space-y-1">
                      <input data-node-line-interactive="1" type="text" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" v-model="line.target" @input="App.handleNodeModalLineTargetInput(line.id)" placeholder="https://emby.example.com" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white" :class="App.getNodeModalLineTargetClass(line.id)">
                      <p v-if="App.getNodeModalLineTargetError(line.id)" class="text-xs font-medium text-red-600 dark:text-red-400">{{ App.getNodeModalLineTargetError(line.id) }}</p>
                    </div>
	                <div class="text-sm font-medium text-slate-500 dark:text-slate-300" :title="line.latencyUpdatedAt ? ('最近测速：' + App.formatLocalDateTime(line.latencyUpdatedAt)) : '尚未测速'">{{ App.formatLatency(line.latencyMs) }}</div>
	                <div data-node-line-interactive="1" class="flex items-center gap-2">
	                  <button type="button" title="整行可拖拽排序" disabled class="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"><i data-lucide="grip-vertical" class="w-4 h-4"></i></button>
	                  <button type="button" :disabled="index === 0" @click="App.moveNodeLine(line.id, -1)" class="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40"><i data-lucide="arrow-up" class="w-4 h-4"></i></button>
	                  <button type="button" :disabled="index === App.nodeModalLines.length - 1" @click="App.moveNodeLine(line.id, 1)" class="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40"><i data-lucide="arrow-down" class="w-4 h-4"></i></button>
	                  <button type="button" :disabled="App.nodeModalLines.length <= 1" @click="App.removeNodeLine(line.id)" class="px-2.5 py-2 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
	                </div>
	              </div>
	            </div>
	          </div>
	        </div>
	        
	        <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
	          <label class="block text-sm font-medium mb-2 text-slate-900 dark:text-white">自定义请求头 (覆盖或新增)</label>
          <div id="headers-container" class="space-y-2 mb-3">
            <div v-for="header in App.nodeModalForm.headers" :key="header.id" class="flex gap-2 items-center">
              <input type="text" v-model="header.key" placeholder="Name (e.g. User-Agent)" class="header-key flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm font-mono text-slate-900 dark:text-white">
              <input type="text" v-model="header.value" placeholder="Value" class="header-val flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm font-mono text-slate-900 dark:text-white">
              <button type="button" @click="App.removeNodeHeaderRow(header.id)" class="text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
          </div>
          <button type="button" @click="App.addHeaderRow()" class="text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400 px-3 py-1.5 rounded-lg transition">+ 添加请求头</button>
        </div>

        <div class="flex gap-3 mt-6 sticky bottom-0 bg-white dark:bg-slate-900 py-3 border-t border-slate-100 dark:border-slate-800 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-none">
           <button type="button" @click="App.closeNodeModal()" class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition shadow-sm">取消</button>
           <button type="button" @click="App.saveNode()" :disabled="App.nodeModalSubmitting" :aria-busy="App.nodeModalSubmitting ? 'true' : 'false'" class="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">{{ App.getNodeModalSubmitText() }}</button>
        </div>
      </form>
    </div>
  </dialog>

  <div v-if="App.toastState.visible" class="fixed top-4 right-4 z-[90] w-[min(24rem,calc(100vw-2rem))]">
    <div class="rounded-2xl border shadow-2xl backdrop-blur-sm px-4 py-3 text-sm break-words" :class="App.getToastToneClass(App.toastState.tone)">
      {{ App.toastState.message }}
    </div>
  </div>

  <div v-if="App.messageDialog.open" class="fixed inset-0 z-[85] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="App.closeMessageDialog()">
    <div class="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ App.messageDialog.title }}</h3>
        </div>
        <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition" @click="App.closeMessageDialog()">&times;</button>
      </div>
      <pre class="mt-4 whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300 font-sans">{{ App.messageDialog.message }}</pre>
      <div class="mt-6 flex justify-end">
        <button type="button" class="px-4 py-2 rounded-xl text-sm font-medium transition" :class="App.getDialogConfirmButtonClass(App.messageDialog.tone)" @click="App.closeMessageDialog()">{{ App.messageDialog.confirmText }}</button>
      </div>
    </div>
  </div>

  <div v-if="App.confirmDialog.open" class="fixed inset-0 z-[86] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="App.resolveConfirmDialog(false)">
    <div class="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ App.confirmDialog.title }}</h3>
      <pre class="mt-4 whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300 font-sans">{{ App.confirmDialog.message }}</pre>
      <div class="mt-6 flex justify-end gap-3">
        <button type="button" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition" @click="App.resolveConfirmDialog(false)">{{ App.confirmDialog.cancelText }}</button>
        <button type="button" class="px-4 py-2 rounded-xl text-sm font-medium transition" :class="App.getDialogConfirmButtonClass(App.confirmDialog.tone)" @click="App.resolveConfirmDialog(true)">{{ App.confirmDialog.confirmText }}</button>
      </div>
    </div>
  </div>

  <div v-if="App.promptDialog.open" class="fixed inset-0 z-[87] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="App.closePromptDialog(null)">
    <form class="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6" @submit.prevent="App.submitPromptDialog()">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ App.promptDialog.title }}</h3>
      <p class="mt-4 whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300">{{ App.promptDialog.message }}</p>
      <input v-auto-focus-select="App.promptDialog.open" v-model="App.promptDialog.value" :type="App.promptDialog.inputType" :placeholder="App.promptDialog.placeholder" class="mt-4 w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white">
      <div class="mt-6 flex justify-end gap-3">
        <button type="button" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition" @click="App.closePromptDialog(null)">{{ App.promptDialog.cancelText }}</button>
        <button type="submit" class="px-4 py-2 rounded-xl text-sm font-medium transition" :class="App.getDialogConfirmButtonClass(App.promptDialog.tone)">{{ App.promptDialog.confirmText }}</button>
      </div>
    </form>
  </div>
  </div>
  </div>
  </template>

  <script>
    const UI_DEFAULTS = {
      uiRadiusPx: 10,
      settingsExperienceMode: 'novice',
      directStaticAssets: false,
      directHlsDash: false,
      prewarmDepth: 'poster',
      prewarmCacheTtl: 120,
      prewarmPrefetchBytes: 4194304,
      pingTimeout: 5000,
      pingCacheMinutes: 10,
      nodePanelPingAutoSort: false,
      upstreamTimeoutMs: 8000,
      upstreamRetryAttempts: 0,
      logSearchMode: 'like',
      logRetentionDays: 7,
      logWriteDelayMinutes: 20,
      logFlushCountThreshold: 50,
      logBatchChunkSize: 50,
      logBatchRetryCount: 2,
      logBatchRetryBackoffMs: 75,
      scheduledLeaseMs: 300000,
      tgAlertDroppedBatchThreshold: 0,
      tgAlertFlushRetryThreshold: 0,
      tgAlertCooldownMinutes: 30,
      tgAlertOnScheduledFailure: false
    };

    const UI_STORAGE_KEYS = {
      theme: 'theme',
      settingsExperienceMode: 'settingsExperienceMode'
    };

    const DNS_RECOMMENDED_CNAME_OPTIONS = [
      'saas.sin.fan',
      'mfa.gov.ua',
      'www.shopify.com'
    ];

    function normalizeDnsEditorMode(value = '') {
      return String(value || '').trim().toLowerCase() === 'a' ? 'a' : 'cname';
    }

    function normalizeDnsDraftType(value = '', fallbackType = 'A') {
      const upper = String(value || fallbackType || '').trim().toUpperCase();
      if (upper === 'AAAA') return 'AAAA';
      if (upper === 'CNAME') return 'CNAME';
      return 'A';
    }

    function createDnsEditorDraftRecord(type = 'A', overrides = {}) {
      const source = overrides && typeof overrides === 'object' ? overrides : {};
      return {
        uid: String(source.uid || ('dns-draft-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8))),
        id: String(source.id || ''),
        type: normalizeDnsDraftType(type, source.type),
        name: String(source.name || ''),
        content: String(source.content || ''),
        ttl: Number(source.ttl) || 1,
        proxied: source.proxied === true
      };
    }

    function cloneDnsEditorDraftRecord(record = {}, fallbackType = 'A') {
      return createDnsEditorDraftRecord(normalizeDnsDraftType(record?.type, fallbackType), record);
    }

	    function normalizeRegionCodeCsv(value = '') {
	      return [...new Set(String(value || '')
	        .split(',')
	        .map(item => item.trim().toUpperCase())
	        .filter(Boolean))]
	        .join(',');
	    }

	    function normalizeLogSearchMode(value = '') {
	      return String(value || '').trim().toLowerCase() === 'fts' ? 'fts' : UI_DEFAULTS.logSearchMode;
	    }

	    const CONFIG_PREVIEW_SANITIZE_RULES = ${JSON.stringify(CONFIG_SANITIZE_RULES)};

    const CONFIG_FORM_BINDINGS = {
      ui: [
        { key: 'uiRadiusPx', id: 'cfg-ui-radius-px', kind: 'int-finite', defaultValue: UI_DEFAULTS.uiRadiusPx },
        { key: 'settingsExperienceMode', id: 'cfg-settings-experience-mode', kind: 'or-default', defaultValue: UI_DEFAULTS.settingsExperienceMode }
      ],
      proxy: [
        { key: 'enableH2', id: 'cfg-enable-h2', kind: 'checkbox', checkboxMode: 'truthy' },
        { key: 'enableH3', id: 'cfg-enable-h3', kind: 'checkbox', checkboxMode: 'truthy' },
        { key: 'peakDowngrade', id: 'cfg-peak-downgrade', kind: 'checkbox', checkboxMode: 'defaultTrue' },
        { key: 'protocolFallback', id: 'cfg-protocol-fallback', kind: 'checkbox', checkboxMode: 'defaultTrue' },
        { key: 'enablePrewarm', id: 'cfg-enable-prewarm', kind: 'checkbox', checkboxMode: 'defaultTrue' },
        { key: 'prewarmDepth', id: 'cfg-prewarm-depth', kind: 'or-default', defaultValue: UI_DEFAULTS.prewarmDepth },
        { key: 'prewarmCacheTtl', id: 'cfg-prewarm-ttl', kind: 'int-or-default', loadMode: 'number-finite', saveMode: 'int-finite', defaultValue: UI_DEFAULTS.prewarmCacheTtl },
        { key: 'directStaticAssets', id: 'cfg-direct-static-assets', kind: 'checkbox', checkboxMode: 'strictTrue' },
        { key: 'directHlsDash', id: 'cfg-direct-hls-dash', kind: 'checkbox', checkboxMode: 'strictTrue' },
        { key: 'sourceSameOriginProxy', id: 'cfg-source-same-origin-proxy', kind: 'checkbox', checkboxMode: 'defaultTrue' },
        { key: 'forceExternalProxy', id: 'cfg-force-external-proxy', kind: 'checkbox', checkboxMode: 'defaultTrue' },
        { key: 'wangpandirect', id: 'cfg-wangpandirect', kind: 'trim', loadMode: 'or-default', defaultValue: '${DEFAULT_WANGPAN_DIRECT_TEXT}' },
        { key: 'pingTimeout', id: 'cfg-ping-timeout', kind: 'int-or-default', loadMode: 'number-finite', saveMode: 'int-finite', defaultValue: UI_DEFAULTS.pingTimeout },
        { key: 'pingCacheMinutes', id: 'cfg-ping-cache-minutes', kind: 'int-or-default', loadMode: 'number-finite', saveMode: 'int-finite', defaultValue: UI_DEFAULTS.pingCacheMinutes },
        { key: 'nodePanelPingAutoSort', id: 'cfg-node-panel-ping-auto-sort', kind: 'checkbox', checkboxMode: 'strictTrue' },
        { key: 'upstreamTimeoutMs', id: 'cfg-upstream-timeout-ms', kind: 'int-finite', defaultValue: UI_DEFAULTS.upstreamTimeoutMs },
        { key: 'upstreamRetryAttempts', id: 'cfg-upstream-retry-attempts', kind: 'int-finite', defaultValue: UI_DEFAULTS.upstreamRetryAttempts }
      ],
      security: [
        { key: 'geoAllowlist', id: 'cfg-geo-allow', kind: 'text', defaultValue: '' },
        { key: 'geoBlocklist', id: 'cfg-geo-block', kind: 'text', defaultValue: '' },
        { key: 'ipBlacklist', id: 'cfg-ip-black', kind: 'text', defaultValue: '' },
        { key: 'rateLimitRpm', id: 'cfg-rate-limit', kind: 'int-or-default', loadMode: 'or-default', defaultValue: 0, loadDefaultValue: '' },
        { key: 'cacheTtlImages', id: 'cfg-cache-ttl', kind: 'int-or-default', loadMode: 'number-finite', saveMode: 'int-finite', defaultValue: 30 },
        { key: 'corsOrigins', id: 'cfg-cors', kind: 'text', defaultValue: '' }
      ],
      logs: [
        { key: 'logSearchMode', id: 'cfg-log-search-mode', kind: 'or-default', defaultValue: UI_DEFAULTS.logSearchMode },
        { key: 'logRetentionDays', id: 'cfg-log-days', kind: 'int-finite', defaultValue: UI_DEFAULTS.logRetentionDays },
        { key: 'logWriteDelayMinutes', id: 'cfg-log-delay', kind: 'float-finite', defaultValue: UI_DEFAULTS.logWriteDelayMinutes },
        { key: 'logFlushCountThreshold', id: 'cfg-log-flush-count', kind: 'int-finite', defaultValue: UI_DEFAULTS.logFlushCountThreshold },
        { key: 'logBatchChunkSize', id: 'cfg-log-batch-size', kind: 'int-finite', defaultValue: UI_DEFAULTS.logBatchChunkSize },
        { key: 'logBatchRetryCount', id: 'cfg-log-retry-count', kind: 'int-finite', defaultValue: UI_DEFAULTS.logBatchRetryCount },
        { key: 'logBatchRetryBackoffMs', id: 'cfg-log-retry-backoff', kind: 'int-finite', defaultValue: UI_DEFAULTS.logBatchRetryBackoffMs },
        { key: 'scheduledLeaseMs', id: 'cfg-scheduled-lease-ms', kind: 'int-finite', defaultValue: UI_DEFAULTS.scheduledLeaseMs },
        { key: 'tgBotToken', id: 'cfg-tg-token', kind: 'trim', defaultValue: '' },
        { key: 'tgChatId', id: 'cfg-tg-chatid', kind: 'trim', defaultValue: '' },
        { key: 'tgAlertDroppedBatchThreshold', id: 'cfg-tg-alert-drop-threshold', kind: 'int-finite', defaultValue: UI_DEFAULTS.tgAlertDroppedBatchThreshold },
        { key: 'tgAlertFlushRetryThreshold', id: 'cfg-tg-alert-retry-threshold', kind: 'int-finite', defaultValue: UI_DEFAULTS.tgAlertFlushRetryThreshold },
        { key: 'tgAlertOnScheduledFailure', id: 'cfg-tg-alert-scheduled-failure', kind: 'checkbox', checkboxMode: 'strictTrue' },
        { key: 'tgAlertCooldownMinutes', id: 'cfg-tg-alert-cooldown-minutes', kind: 'int-finite', defaultValue: UI_DEFAULTS.tgAlertCooldownMinutes }
      ],
      account: [
        { key: 'jwtExpiryDays', id: 'cfg-jwt-days', kind: 'int-or-default', defaultValue: 30 },
        { key: 'cfAccountId', id: 'cfg-cf-account', kind: 'trim', defaultValue: '' },
        { key: 'cfZoneId', id: 'cfg-cf-zone', kind: 'trim', defaultValue: '' },
        { key: 'cfApiToken', id: 'cfg-cf-token', kind: 'trim', defaultValue: '' }
      ]
    };

    const CONFIG_SECTION_FIELDS = {
      ui: CONFIG_FORM_BINDINGS.ui.map(item => item.key),
      proxy: [...CONFIG_FORM_BINDINGS.proxy.map(item => item.key), 'sourceDirectNodes'],
      security: CONFIG_FORM_BINDINGS.security.map(item => item.key),
      logs: CONFIG_FORM_BINDINGS.logs.map(item => item.key),
      account: CONFIG_FORM_BINDINGS.account.map(item => item.key)
    };

    const CONFIG_PANEL_FIELDS = {
      ui: CONFIG_SECTION_FIELDS.ui,
      proxy: CONFIG_SECTION_FIELDS.proxy,
      cache: ['cacheTtlImages', 'corsOrigins'],
      security: ['geoAllowlist', 'geoBlocklist', 'ipBlacklist', 'rateLimitRpm'],
      logs: ['logSearchMode', 'logRetentionDays', 'logWriteDelayMinutes', 'logFlushCountThreshold', 'logBatchChunkSize', 'logBatchRetryCount', 'logBatchRetryBackoffMs', 'scheduledLeaseMs'],
      monitoring: ['tgBotToken', 'tgChatId', 'tgAlertDroppedBatchThreshold', 'tgAlertFlushRetryThreshold', 'tgAlertOnScheduledFailure', 'tgAlertCooldownMinutes'],
      account: CONFIG_SECTION_FIELDS.account,
      backup: []
    };

    const CONFIG_FIELD_LABELS = {
      uiRadiusPx: 'UI 圆角弧度（px）',
      settingsExperienceMode: '设置操作视图',
      enableH2: 'HTTP/2',
      enableH3: 'HTTP/3',
      peakDowngrade: '晚高峰降级兜底',
      protocolFallback: '协议回退与 403 重试',
      enablePrewarm: '轻量级元数据预热',
      prewarmDepth: '预热深度',
      prewarmCacheTtl: '元数据预热缓存时长',
      directStaticAssets: '静态文件直连',
      directHlsDash: 'HLS / DASH 直连',
      sourceSameOriginProxy: '源站同源代理',
      forceExternalProxy: '外链强制反代',
      wangpandirect: 'wangpandirect 关键词',
      sourceDirectNodes: '源站直连节点名单',
      pingTimeout: 'Ping 超时',
      pingCacheMinutes: 'Ping 缓存时间',
      nodePanelPingAutoSort: '节点面板 Ping 自动排序',
      upstreamTimeoutMs: '上游握手超时',
      upstreamRetryAttempts: '额外重试轮次',
      geoAllowlist: '国家/地区白名单',
      geoBlocklist: '国家/地区黑名单',
      ipBlacklist: 'IP 黑名单',
      rateLimitRpm: '单 IP 限速',
      cacheTtlImages: '静态资源缓存时长',
      corsOrigins: 'CORS 白名单',
      logSearchMode: '日志搜索模式',
      logRetentionDays: '日志保存天数',
      logWriteDelayMinutes: '日志写入延迟',
      logFlushCountThreshold: '日志提前写入阈值',
      logBatchChunkSize: 'D1 切片大小',
      logBatchRetryCount: 'D1 重试次数',
      logBatchRetryBackoffMs: 'D1 退避毫秒',
      scheduledLeaseMs: '定时任务租约时长',
      tgBotToken: 'Telegram Bot Token',
      tgChatId: 'Telegram Chat ID',
      tgAlertDroppedBatchThreshold: '日志丢弃批次阈值',
      tgAlertFlushRetryThreshold: '日志写入重试阈值',
      tgAlertOnScheduledFailure: '定时任务失败告警',
      tgAlertCooldownMinutes: '告警冷却时间',
      jwtExpiryDays: 'JWT 有效天数',
      cfAccountId: 'Cloudflare 账号 ID',
      cfZoneId: 'Cloudflare Zone ID',
      cfApiToken: 'Cloudflare API 令牌'
    };

    const SNAPSHOT_REASON_LABELS = {
      save_config: '手动保存设置',
      import_settings: '导入全局设置',
      import_full: '导入完整备份',
      restore_snapshot: '恢复历史快照',
      tidy_kv_data: '整理 KV 数据'
    };

    const RECOMMENDED_SECTION_VALUES = {
      proxy: {
        enableH2: false,
        enableH3: false,
        peakDowngrade: true,
        protocolFallback: true,
        enablePrewarm: true,
        prewarmDepth: 'poster',
        prewarmCacheTtl: 120,
        directStaticAssets: false,
        directHlsDash: false,
        sourceSameOriginProxy: true,
        forceExternalProxy: true,
        pingTimeout: 5000,
        pingCacheMinutes: 10,
        nodePanelPingAutoSort: false,
        upstreamTimeoutMs: 8000,
        upstreamRetryAttempts: 0
      },
      logs: {
        logSearchMode: 'like',
        logRetentionDays: 7,
        logWriteDelayMinutes: 20,
        logFlushCountThreshold: 50,
        logBatchChunkSize: 50,
        logBatchRetryCount: 2,
        logBatchRetryBackoffMs: 75,
        scheduledLeaseMs: 300000,
        tgAlertDroppedBatchThreshold: 1,
        tgAlertFlushRetryThreshold: 2,
        tgAlertOnScheduledFailure: true,
        tgAlertCooldownMinutes: 30
      }
    };

    const VIEW_TITLES = {
      '#dashboard': '仪表盘',
      '#nodes': '节点列表',
      '#logs': '日志记录',
      '#dns': 'DNS编辑',
      '#settings': '全局设置'
    };

    const NAV_ITEMS = [
      { hash: '#dashboard', icon: 'layout-dashboard', label: '仪表盘' },
      { hash: '#nodes', icon: 'server', label: '节点列表' },
      { hash: '#logs', icon: 'activity', label: '日志记录' },
      { hash: '#dns', icon: 'globe', label: 'DNS编辑' },
      { hash: '#settings', icon: 'settings', label: '全局设置' }
    ];

    const CONFIG_BINDING_LIST = Object.values(CONFIG_FORM_BINDINGS).flat();
    const CONFIG_BINDING_BY_KEY = CONFIG_BINDING_LIST.reduce((acc, binding) => {
      acc[binding.key] = binding;
      return acc;
    }, {});
    const DEFAULT_PROXY_GUARDRAILS = {
      directHint: '当前未启用 307 直连分流；如后续开启静态文件直连或 HLS / DASH 直连，命中的资源会自动走数据面直传。',
      prewarmHint: '当前会预热海报、播放列表与字幕等轻量元数据；检测到 mp4 / mkv / ts / m4s 等视频字节流时会立即跳过。',
      prefetchDisabled: false
    };

    function createNodeModalHeaderRow(key = '', value = '') {
      return {
        id: 'hdr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        key,
        value
      };
    }

    function normalizeNodeMediaAuthMode(value = '') {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === 'emby') return 'emby';
      if (normalized === 'jellyfin') return 'jellyfin';
      if (normalized === 'passthrough') return 'passthrough';
      return 'auto';
    }

    function normalizeNodeRealClientIpMode(value = '') {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === 'forward') return 'forward';
      if (normalized === 'strip') return 'strip';
      if (normalized === 'disable' || normalized === 'none') return 'disable';
      return 'forward';
    }

    function normalizeNodeModalHeaderRows(rawHeaders) {
      let entries = [];
      if (Array.isArray(rawHeaders)) {
        entries = rawHeaders
          .map(row => [String(row?.key || '').trim(), String(row?.value || '')])
          .filter(([key]) => key);
      } else if (rawHeaders && typeof rawHeaders === 'object') {
        entries = Object.entries(rawHeaders)
          .map(([key, value]) => [String(key || '').trim(), String(value || '')])
          .filter(([key]) => key);
      }
      const rows = entries.map(([key, value]) => createNodeModalHeaderRow(key, value));
      return rows.length ? rows : [createNodeModalHeaderRow()];
    }

    function createEmptyNodeModalForm() {
      return {
        originalName: '',
        displayName: '',
        name: '',
        tag: '',
        tagColor: 'amber',
        remark: '',
        secret: '',
        mediaAuthMode: 'auto',
        realClientIpMode: 'forward',
        activeLineId: '',
        headers: []
      };
    }

    function createToastState() {
      return {
        visible: false,
        message: '',
        tone: 'info'
      };
    }

    function createNodeModalFeedbackState() {
      return {
        message: '',
        tone: 'info'
      };
    }

    function createNodeModalValidationState() {
      return {
        displayName: '',
        name: '',
        lines: '',
        lineTargets: {}
      };
    }

    function createMessageDialogState() {
      return {
        open: false,
        title: '提示',
        message: '',
        tone: 'info',
        confirmText: '知道了'
      };
    }

    function createConfirmDialogState() {
      return {
        open: false,
        title: '请确认',
        message: '',
        tone: 'warning',
        confirmText: '确认',
        cancelText: '取消'
      };
    }

    function createPromptDialogState() {
      return {
        open: false,
        title: '请输入',
        message: '',
        value: '',
        placeholder: '',
        tone: 'info',
        inputType: 'text',
        confirmText: '确认',
        cancelText: '取消',
        required: false
      };
    }

    function createGeoFirewallConflictState() {
      return {
        active: false,
        allowlist: '',
        blocklist: '',
        baselineMode: 'allowlist',
        baselineRegions: ''
      };
    }

    function createUiFoundationStore() {
      return {
        navItems: NAV_ITEMS,
        currentHash: '#dashboard',
        pageTitle: '加载中...',
        sidebarOpen: false,
        isDarkTheme: false,
        isDesktopViewport: false,
        isDesktopSettingsLayout: false,
        contentScrollResetKey: 0,
        settingsScrollResetKey: 0,
        settingsExperienceMode: 'novice',
        uiRadiusCssValue: '10px',
        activeSettingsTab: 'ui',
        nodeSearchKeyword: '',
        nodeTagFilterPanelOpen: false,
        activeNodeTagFilter: '',
        nodeTagFilterOptions: [],
        nodes: [],
        filteredNodes: [],
        settingsForm: {},
        settingsGeoConflictState: createGeoFirewallConflictState(),
        settingsDirectNodeSearch: '',
        settingsSourceDirectNodes: [],
        proxySettingsGuardrails: { ...DEFAULT_PROXY_GUARDRAILS },
        nodeHealth: {},
        nodesHealthCheckPending: false,
        nodePingPending: {},
        nodeMutationSeq: 0,
        nodeMutationVersion: {},
        pageLoadSeq: 0,
        logPage: 1,
        logTotalPages: 1,
        logRows: [],
        logSearchKeyword: '',
        logStartDate: '',
        logEndDate: '',
        logTimeTick: 0,
        logsPlaybackModeFilter: '',
        dnsRecords: [],
        dnsEditMode: 'cname',
        dnsOriginalEditMode: 'cname',
        dnsDraftCname: createDnsEditorDraftRecord('CNAME'),
        dnsOriginalCname: createDnsEditorDraftRecord('CNAME'),
        dnsAddressDrafts: [createDnsEditorDraftRecord('A')],
        dnsOriginalAddressDrafts: [],
        dnsHistoryEntries: [],
        dnsZone: null,
        dnsZoneHintText: '当前站点：加载中...',
        dnsCurrentHost: '',
        dnsTotalRecordCount: 0,
        dnsEmptyText: '暂无 DNS 记录',
        dnsHistoryLimit: 5,
        dnsBatchSaving: false,
        dnsLoadSeq: 0,
        runtimeConfig: {},
        configSnapshots: [],
        runtimeStatus: {},
        loginPromise: null
      };
    }

    function createUiDashboardStore() {
      return {
        dashboardSeries: [],
        dashboardLoadSeq: 0,
        dashboardView: {
          requests: {
            count: '0',
            hint: ' ',
            title: '',
            badges: [{ label: '待加载', tone: 'slate' }],
            embyMetrics: '请求: 播放请求 0 次 | 获取播放信息 0 次'
          },
          traffic: {
            count: '0 B',
            hint: ' ',
            title: '',
            badges: [{ label: '待加载', tone: 'slate' }],
            detail: ' '
          },
          nodes: {
            count: '0',
            meta: ' ',
            badges: [{ label: '待加载', tone: 'slate' }]
          }
        },
        dashboardRuntimeView: {
          updatedText: '最近同步：未加载',
          logCard: {
            title: '日志写入',
            status: 'idle',
            summary: '日志写入状态加载中...',
            lines: [],
            detail: ''
          },
          scheduledCard: {
            title: '定时任务',
            status: 'idle',
            summary: '定时任务状态加载中...',
            lines: [],
            detail: ''
          }
        }
      };
    }

    function createUiDialogStore() {
      return {
        downloadHref: '',
        downloadFilename: '',
        downloadTriggerKey: 0,
        downloadCleanupTimer: null,
        toastState: createToastState(),
        toastTimer: null,
        messageDialog: createMessageDialogState(),
        messageDialogResolver: null,
        confirmDialog: createConfirmDialogState(),
        confirmDialogResolver: null,
        promptDialog: createPromptDialogState(),
        promptDialogResolver: null,

        normalizeUiMessage(message) {
          return String(message == null ? '' : message).trim();
        },

        getToastToneClass(tone = 'info') {
          const palette = {
            info: 'border-slate-200 bg-white/95 text-slate-700 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100',
            success: 'border-emerald-200 bg-emerald-50/95 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/90 dark:text-emerald-200',
            warning: 'border-amber-200 bg-amber-50/95 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/90 dark:text-amber-200',
            error: 'border-red-200 bg-red-50/95 text-red-700 dark:border-red-900/40 dark:bg-red-950/90 dark:text-red-200'
          };
          return palette[tone] || palette.info;
        },

        getDialogConfirmButtonClass(tone = 'info') {
          const palette = {
            info: 'bg-brand-600 hover:bg-brand-700 text-white',
            success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            warning: 'bg-amber-600 hover:bg-amber-700 text-white',
            error: 'bg-red-600 hover:bg-red-700 text-white',
            danger: 'bg-red-600 hover:bg-red-700 text-white'
          };
          return palette[tone] || palette.info;
        },

        clearToastTimer() {
          if (this.toastTimer) {
            uiBrowserBridge.clearTimer(this.toastTimer);
            this.toastTimer = null;
          }
        },

        dismissToast() {
          this.clearToastTimer();
          this.toastState = createToastState();
        },

        showToast(message, tone = 'info', duration = 2600) {
          const text = this.normalizeUiMessage(message);
          if (!text) return Promise.resolve(false);
          this.clearToastTimer();
          this.toastState = {
            visible: true,
            message: text,
            tone: String(tone || 'info') || 'info'
          };
          this.toastTimer = uiBrowserBridge.startTimer(() => this.dismissToast(), Math.max(1200, Number(duration) || 2600));
          return Promise.resolve(true);
        },

        closeMessageDialog(result = true) {
          const resolve = this.messageDialogResolver;
          this.messageDialogResolver = null;
          this.messageDialog = createMessageDialogState();
          if (typeof resolve === 'function') resolve(result);
          return result;
        },

        openMessageDialog(message, options = {}) {
          const text = this.normalizeUiMessage(message);
          if (!text) return Promise.resolve(false);
          if (typeof this.messageDialogResolver === 'function') this.messageDialogResolver(true);
          this.messageDialog = {
            ...createMessageDialogState(),
            open: true,
            title: this.normalizeUiMessage(options.title) || '提示',
            message: text,
            tone: String(options.tone || 'info') || 'info',
            confirmText: this.normalizeUiMessage(options.confirmText) || '知道了'
          };
          return new Promise(resolve => {
            this.messageDialogResolver = resolve;
          });
        },

        showMessage(message, options = {}) {
          const text = this.normalizeUiMessage(message);
          if (!text) return Promise.resolve(false);
          const useModal = options.modal === true || text.includes('\\n') || text.length > 96;
          if (!useModal) return this.showToast(text, options.tone || 'info', options.duration);
          return this.openMessageDialog(text, options);
        },

        resolveConfirmDialog(result = false) {
          const resolve = this.confirmDialogResolver;
          this.confirmDialogResolver = null;
          this.confirmDialog = createConfirmDialogState();
          if (typeof resolve === 'function') resolve(result === true);
          return result === true;
        },

        askConfirm(message, options = {}) {
          const text = this.normalizeUiMessage(message);
          if (!text) return Promise.resolve(false);
          if (typeof this.confirmDialogResolver === 'function') this.confirmDialogResolver(false);
          this.confirmDialog = {
            ...createConfirmDialogState(),
            open: true,
            title: this.normalizeUiMessage(options.title) || '请确认',
            message: text,
            tone: String(options.tone || 'warning') || 'warning',
            confirmText: this.normalizeUiMessage(options.confirmText) || '确认',
            cancelText: this.normalizeUiMessage(options.cancelText) || '取消'
          };
          return new Promise(resolve => {
            this.confirmDialogResolver = resolve;
          });
        },

        closePromptDialog(result = null) {
          const resolve = this.promptDialogResolver;
          this.promptDialogResolver = null;
          const finalValue = result == null ? null : String(result);
          this.promptDialog = createPromptDialogState();
          if (typeof resolve === 'function') resolve(finalValue);
          return finalValue;
        },

        askPrompt(options = {}) {
          if (typeof this.promptDialogResolver === 'function') this.promptDialogResolver(null);
          this.promptDialog = {
            ...createPromptDialogState(),
            open: true,
            title: this.normalizeUiMessage(options.title) || '请输入',
            message: this.normalizeUiMessage(options.message) || '请输入内容',
            value: String(options.defaultValue || ''),
            placeholder: String(options.placeholder || ''),
            tone: String(options.tone || 'info') || 'info',
            inputType: options.inputType === 'password' ? 'password' : 'text',
            confirmText: this.normalizeUiMessage(options.confirmText) || '确认',
            cancelText: this.normalizeUiMessage(options.cancelText) || '取消',
            required: options.required === true
          };
          return new Promise(resolve => {
            this.promptDialogResolver = resolve;
          });
        },

        submitPromptDialog() {
          const value = String(this.promptDialog.value || '');
          if (this.promptDialog.required && !value.trim()) {
            this.showToast('请输入必填内容', 'warning');
            return;
          }
          this.closePromptDialog(value);
        },

        revokeDownloadUrl() {
          if (this.downloadCleanupTimer) {
            uiBrowserBridge.clearTimer(this.downloadCleanupTimer);
            this.downloadCleanupTimer = null;
          }
          const currentHref = String(this.downloadHref || '');
          if (currentHref.startsWith('blob:')) {
            uiBrowserBridge.revokeObjectUrl(currentHref);
          }
          this.downloadHref = '';
          this.downloadFilename = '';
        },

        triggerDownload(url, filename) {
          this.revokeDownloadUrl();
          this.downloadHref = String(url || '');
          this.downloadFilename = String(filename || '');
          this.downloadTriggerKey += 1;
          this.downloadCleanupTimer = uiBrowserBridge.startTimer(() => this.revokeDownloadUrl(), 1000);
          return Promise.resolve({
            href: this.downloadHref,
            filename: this.downloadFilename
          });
        }
      };
    }

    function createUiNodeModalStore() {
      return {
        nodeModalOpen: false,
        nodeModalSubmitting: false,
        nodeModalPingAllPending: false,
        nodeModalPingAllText: '一键测试延迟',
        nodeModalForm: createEmptyNodeModalForm(),
        nodeModalFeedback: createNodeModalFeedbackState(),
        nodeModalValidation: createNodeModalValidationState(),
        nodeModalPathManual: false,
        nodeModalLastDisplayName: '',
        nodeModalLines: [],
        nodeLineDragId: '',
        nodeLineDropHint: null,

        getNodeModalFeedbackClass(tone = 'info') {
          const palette = {
            info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-200',
            success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200',
            warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200',
            error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200'
          };
          return palette[tone] || palette.info;
        },

        clearNodeModalFeedback() {
          this.nodeModalFeedback = createNodeModalFeedbackState();
        },

        clearNodeModalValidation() {
          this.nodeModalValidation = createNodeModalValidationState();
        },

        setNodeModalFieldError(field, message) {
          const text = this.normalizeUiMessage(message);
          const nextValidation = {
            ...createNodeModalValidationState(),
            ...(this.nodeModalValidation && typeof this.nodeModalValidation === 'object' ? this.nodeModalValidation : {})
          };
          if (field === 'lineTargets') {
            nextValidation.lineTargets = text && message && typeof message === 'object'
              ? { ...message }
              : { ...(nextValidation.lineTargets || {}) };
          } else if (field === 'lineTargetsMap' && message && typeof message === 'object') {
            nextValidation.lineTargets = { ...message };
          } else {
            nextValidation[field] = text;
          }
          this.nodeModalValidation = nextValidation;
          return text;
        },

        clearNodeModalFieldError(field, lineId = '') {
          const nextValidation = {
            ...createNodeModalValidationState(),
            ...(this.nodeModalValidation && typeof this.nodeModalValidation === 'object' ? this.nodeModalValidation : {})
          };
          if (field === 'lineTarget') {
            const nextLineTargets = { ...(nextValidation.lineTargets || {}) };
            delete nextLineTargets[String(lineId || '')];
            nextValidation.lineTargets = nextLineTargets;
            if (!Object.keys(nextLineTargets).length && nextValidation.lines) nextValidation.lines = '';
          } else {
            nextValidation[field] = '';
          }
          this.nodeModalValidation = nextValidation;
        },

        getNodeModalFieldError(field) {
          return String(this.nodeModalValidation?.[field] || '').trim();
        },

        getNodeModalLineTargetError(lineId) {
          return String(this.nodeModalValidation?.lineTargets?.[String(lineId || '')] || '').trim();
        },

        getNodeModalFieldClass(field) {
          return this.getNodeModalFieldError(field)
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30'
            : '';
        },

        getNodeModalLineTargetClass(lineId) {
          return this.getNodeModalLineTargetError(lineId)
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30'
            : '';
        },

        getNodeModalLinesPanelClass() {
          return this.getNodeModalFieldError('lines')
            ? 'border-red-300 dark:border-red-800 bg-red-50/70 dark:bg-red-950/20'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50';
        },

        syncNodeModalDialogVisibility(shouldOpen) {
          if (typeof document?.getElementById !== 'function') return;
          const dialog = document.getElementById('node-modal');
          if (!dialog) return;
          uiBrowserBridge.syncDialogVisibility(dialog, shouldOpen === true);
        },

        applyNodeModalState(nextForm) {
          this.nodeModalForm = nextForm;
          this.nodeModalLastDisplayName = String(nextForm.displayName || '');
          this.nodeModalPathManual = !!String(nextForm.name || '') && String(nextForm.name || '') !== String(nextForm.displayName || '');
          this.syncNodeModalLinesState(nextForm.activeLineId);
          this.nodeModalOpen = true;
          uiBrowserBridge.queueTask(() => this.syncNodeModalDialogVisibility(true));
        },

        reopenNodeModal(nextForm) {
          const apply = () => this.applyNodeModalState(nextForm);
          if (this.nodeModalOpen === true) {
            this.nodeModalOpen = false;
            uiBrowserBridge.queueTask(apply);
            return;
          }
          apply();
        },

        setNodeModalFeedback(message, tone = 'info') {
          const text = this.normalizeUiMessage(message);
          this.nodeModalFeedback = {
            message: text,
            tone: String(tone || 'info') || 'info'
          };
          return text;
        },

        getNodeModalSubmitText() {
          if (this.nodeModalSubmitting) return '正在保存到 KV...';
          return this.nodeModalForm.originalName ? '保存修改' : '创建节点';
        },

        normalizeNodePathInput(value) {
          return String(value || '').trim().toLowerCase();
        },

        validateNodePath(value) {
          return /^[a-z0-9_-]+$/.test(this.normalizeNodePathInput(value));
        },

        getNodePathRuleText() {
          return '节点路径仅支持小写字母、数字、-、_，且不能包含斜杠或空格';
        }
      };
    }

    function createUiConfigStore() {
      return {
        getConfigBindingByKey(key) {
          return CONFIG_BINDING_BY_KEY[key] || null;
        },

        getCurrentRouteHash(fallback = '#dashboard') {
          return String(this.currentHash || uiBrowserBridge.readHash(fallback) || fallback || '#dashboard');
        },

        hasSettingsFieldValue(key) {
          return Object.prototype.hasOwnProperty.call(this.settingsForm || {}, key);
        },

        getEffectiveSettingValue(key) {
          const binding = this.getConfigBindingByKey(key);
          if (!binding) return undefined;
          if (this.hasSettingsFieldValue(key)) return this.readConfigBindingFromState(binding);
          return this.resolveConfigBindingInputValue(binding, this.runtimeConfig || {});
        },

        clampSettingsNumberInput(element) {
          if (!element) return;
          const raw = String(element.value || '').trim();
          if (!raw) return;
          let next = Number(raw);
          if (!Number.isFinite(next)) {
            element.value = '';
            return;
          }
          const min = Number(element.min);
          const max = Number(element.max);
          if (Number.isFinite(min)) next = Math.max(min, next);
          if (Number.isFinite(max)) next = Math.min(max, next);
          const step = String(element.step || '').trim();
          if (step && step !== 'any') {
            const stepValue = Number(step);
            if (Number.isFinite(stepValue) && stepValue > 0) {
              const base = Number.isFinite(min) ? min : 0;
              const steps = Math.round((next - base) / stepValue);
              next = base + (steps * stepValue);
              if (Number.isFinite(min)) next = Math.max(min, next);
              if (Number.isFinite(max)) next = Math.min(max, next);
            }
          }
          element.value = step.includes('.') ? String(next) : String(Math.trunc(next));
        },

        normalizeSettingsNumberInputs() {
          this.settingsForm = { ...this.settingsForm };
        },

        syncProxySettingsGuardrails() {
          const directStatic = this.readConfigBindingFromState(this.getConfigBindingByKey('directStaticAssets')) === true;
          const directHlsDash = this.readConfigBindingFromState(this.getConfigBindingByKey('directHlsDash')) === true;
          const prewarmDepthBinding = this.getConfigBindingByKey('prewarmDepth');
          const rawPrewarmDepth = this.readConfigBindingFromState(prewarmDepthBinding);
          const prewarmDepth = String(rawPrewarmDepth || UI_DEFAULTS.prewarmDepth).trim().toLowerCase() === 'poster' ? 'poster' : 'poster_manifest';
          const direct307Enabled = directStatic || directHlsDash;

          if (direct307Enabled) {
            this.proxySettingsGuardrails = {
              directHint: '已启用 307 直连分流。命中的静态 / HLS / DASH 资源会自动下沉到数据面直传，减少 Worker 长连接负担。',
              prewarmHint: prewarmDepth === 'poster'
                ? '当前只预热海报；由于已启用 HLS / DASH 直连，播放列表会直接走 307 分流，不再进入 Worker 元数据缓存。'
                : '已启用 HLS / DASH 直连。海报与字幕仍可按需预热，但命中的播放列表会直接走 307 分流，不再占用 Worker 缓存通道。',
              prefetchDisabled: false
            };
            return;
          }
          this.proxySettingsGuardrails = {
            directHint: DEFAULT_PROXY_GUARDRAILS.directHint,
            prewarmHint: prewarmDepth === 'poster'
              ? '当前只预热海报，不会额外拉取 m3u8 或字幕索引，更适合极度克制的 Worker 负载策略。'
              : DEFAULT_PROXY_GUARDRAILS.prewarmHint,
            prefetchDisabled: false
          };
        },

        applyRuntimeConfig(cfg) {
          this.runtimeConfig = cfg && typeof cfg === 'object' ? { ...cfg } : {};
          const storedMode = uiBrowserBridge.readStoredSettingsExperienceMode();
          const runtimeMode = this.normalizeSettingsExperienceMode(this.runtimeConfig?.settingsExperienceMode);
          const nextMode = storedMode ? this.normalizeSettingsExperienceMode(storedMode) : runtimeMode;
          this.settingsExperienceMode = nextMode;
          this.settingsForm = {
            ...this.settingsForm,
            settingsExperienceMode: nextMode
          };
          uiBrowserBridge.persistSettingsExperienceMode(nextMode);
          this.applyUiRadius();
        },

        applyUiRadius() {
          const raw = Number(this.runtimeConfig?.uiRadiusPx);
          const fallback = Number(UI_DEFAULTS.uiRadiusPx);
          let next = Number.isFinite(raw) ? Math.trunc(raw) : fallback;
          if (!Number.isFinite(next)) next = 24;
          next = Math.max(0, Math.min(48, next));
          this.uiRadiusCssValue = String(next) + 'px';
        },

        getSettingsSectionLabel(section) {
          const labels = {
            ui: '系统 UI',
            proxy: '代理与网络',
            cache: '静态资源策略',
            security: '安全防护',
            logs: '日志设置',
            monitoring: '监控告警',
            account: '账号设置',
            backup: '备份与恢复',
            all: '全部分区'
          };
          return labels[section] || section || '未知分区';
        },

        getConfigFieldLabel(key) {
          return CONFIG_FIELD_LABELS[key] || key;
        },

        getConfigFormBindings(section) {
          return CONFIG_FORM_BINDINGS[section] || [];
        },

        getConfigPanelFieldKeys(section, fallbackSection = '') {
          const panelKeys = [...(CONFIG_PANEL_FIELDS[section] || CONFIG_SECTION_FIELDS[fallbackSection] || [])];
          if (this.isSettingsExpertMode()) return panelKeys;
          if (section === 'proxy') {
            const hiddenKeys = new Set([
              'directStaticAssets',
              'directHlsDash',
              'sourceSameOriginProxy',
              'forceExternalProxy',
              'wangpandirect',
              'pingTimeout',
              'pingCacheMinutes',
              'nodePanelPingAutoSort',
              'upstreamTimeoutMs',
              'upstreamRetryAttempts'
            ]);
            return panelKeys.filter(key => !hiddenKeys.has(key));
          }
          if (section === 'logs') {
            const hiddenKeys = new Set([
              'logSearchMode',
              'logBatchChunkSize',
              'logBatchRetryCount',
              'logBatchRetryBackoffMs',
              'scheduledLeaseMs'
            ]);
            return panelKeys.filter(key => !hiddenKeys.has(key));
          }
          return panelKeys;
        },

        getConfigBindingDefaultValue(binding, phase = 'save') {
          if (phase === 'load' && Object.prototype.hasOwnProperty.call(binding || {}, 'loadDefaultValue')) {
            return binding.loadDefaultValue;
          }
          return Object.prototype.hasOwnProperty.call(binding || {}, 'defaultValue') ? binding.defaultValue : '';
        },

        getConfigBindingMode(binding, phase = 'save') {
          if (phase === 'load' && binding?.loadMode) return binding.loadMode;
          if (phase === 'save' && binding?.saveMode) return binding.saveMode;
          return binding?.kind || 'text';
        },

        resolveConfigBindingInputValue(binding, source = {}) {
          const rawValue = source?.[binding.key];
          const mode = this.getConfigBindingMode(binding, 'load');
          const fallback = this.getConfigBindingDefaultValue(binding, 'load');
          if (mode === 'checkbox') {
            if (binding.checkboxMode === 'defaultTrue') return rawValue !== false;
            if (binding.checkboxMode === 'truthy') return !!rawValue;
            return rawValue === true;
          }
          if (mode === 'or-default') return rawValue || fallback;
          if (mode === 'int-or-default') {
            const num = parseInt(rawValue, 10);
            return num || fallback;
          }
          if (mode === 'int-finite' || mode === 'number-finite') {
            const num = Number(rawValue);
            return Number.isFinite(num) ? num : fallback;
          }
          if (mode === 'float-finite') {
            const num = Number(rawValue);
            return Number.isFinite(num) ? num : fallback;
          }
          if (rawValue === undefined || rawValue === null) return fallback;
          return String(rawValue);
        },

        resolveGeoFirewallFormState(source = {}) {
          const geoAllowlist = normalizeRegionCodeCsv(source?.geoAllowlist || '');
          const geoBlocklist = normalizeRegionCodeCsv(source?.geoBlocklist || '');
          if (geoAllowlist && geoBlocklist) {
            this.settingsGeoConflictState = {
              active: true,
              allowlist: geoAllowlist,
              blocklist: geoBlocklist,
              baselineMode: 'allowlist',
              baselineRegions: geoAllowlist
            };
            return { geoMode: 'allowlist', geoRegions: geoAllowlist };
          }
          this.settingsGeoConflictState = createGeoFirewallConflictState();
          if (geoAllowlist) return { geoMode: 'allowlist', geoRegions: geoAllowlist };
          if (geoBlocklist) return { geoMode: 'blocklist', geoRegions: geoBlocklist };
          return {
            geoMode: String(this.settingsForm?.geoMode || 'allowlist') === 'blocklist' ? 'blocklist' : 'allowlist',
            geoRegions: ''
          };
        },

        hasGeoFirewallConflict() {
          return this.settingsGeoConflictState?.active === true;
        },

        getGeoFirewallConflictHint() {
          if (!this.hasGeoFirewallConflict()) return '';
          return '检测到当前配置同时包含 Geo 白名单和黑名单。当前表单只展示白名单；如果你不修改这一区域直接保存，系统会保留原始双规则。若修改模式或国家列表，则会按当前表单重写为单一模式。';
        },

        applyConfigSectionToForm(section, source = {}, options = {}) {
          const onlyPresent = options.onlyPresent === true;
          const nextSettingsForm = { ...this.settingsForm };
          this.getConfigFormBindings(section).forEach(binding => {
            if (onlyPresent && !Object.prototype.hasOwnProperty.call(source || {}, binding.key)) return;
            nextSettingsForm[binding.key] = this.resolveConfigBindingInputValue(binding, source);
          });
          if (section === 'security') Object.assign(nextSettingsForm, this.resolveGeoFirewallFormState(source));
          this.settingsForm = nextSettingsForm;
        },

        readConfigBindingFromState(binding) {
          if (!binding) return undefined;
          const rawValue = this.settingsForm?.[binding.key];
          const mode = this.getConfigBindingMode(binding, 'save');
          const fallback = this.getConfigBindingDefaultValue(binding, 'save');
          if (mode === 'checkbox') return rawValue === true;
          if (mode === 'int-or-default') {
            const num = parseInt(rawValue, 10);
            return num || fallback;
          }
          if (mode === 'int-finite' || mode === 'number-finite') {
            const num = parseInt(rawValue, 10);
            return Number.isFinite(num) ? num : fallback;
          }
          if (mode === 'float-finite') {
            const num = parseFloat(rawValue);
            return Number.isFinite(num) ? num : fallback;
          }
          if (mode === 'trim') return String(rawValue || '').trim();
          if (rawValue === undefined || rawValue === null) return '';
          return rawValue;
        },

        collectConfigSectionFromForm(section, options = {}) {
          const fieldKeySet = Array.isArray(options.fieldKeys) && options.fieldKeys.length
            ? new Set(options.fieldKeys.map(key => String(key)))
            : null;
          const collected = this.getConfigFormBindings(section).reduce((acc, binding) => {
            if (fieldKeySet && !fieldKeySet.has(binding.key)) return acc;
            const value = this.readConfigBindingFromState(binding);
            if (value !== undefined) acc[binding.key] = value;
            return acc;
          }, {});
          if (section === 'security' && (!fieldKeySet || fieldKeySet.has('geoAllowlist') || fieldKeySet.has('geoBlocklist'))) {
            const geoMode = String(this.settingsForm?.geoMode || 'allowlist').trim().toLowerCase() === 'blocklist' ? 'blocklist' : 'allowlist';
            const geoRegions = normalizeRegionCodeCsv(this.settingsForm?.geoRegions || '');
            const geoConflictState = this.settingsGeoConflictState && typeof this.settingsGeoConflictState === 'object'
              ? this.settingsGeoConflictState
              : createGeoFirewallConflictState();
            if (geoConflictState.active === true) {
              const baselineMode = String(geoConflictState.baselineMode || 'allowlist').trim().toLowerCase() === 'blocklist' ? 'blocklist' : 'allowlist';
              const baselineRegions = normalizeRegionCodeCsv(geoConflictState.baselineRegions || '');
              if (geoMode === baselineMode && geoRegions === baselineRegions) {
                collected.geoAllowlist = normalizeRegionCodeCsv(geoConflictState.allowlist || '');
                collected.geoBlocklist = normalizeRegionCodeCsv(geoConflictState.blocklist || '');
                return collected;
              }
            }
            collected.geoAllowlist = geoMode === 'allowlist' ? geoRegions : '';
            collected.geoBlocklist = geoMode === 'blocklist' ? geoRegions : '';
          }
          return collected;
        },

        formatConfigPreviewValue(key, value) {
          if (Array.isArray(value)) return value.length ? value.join(', ') : '空';
          if (typeof value === 'boolean') return value ? '开启' : '关闭';
          if (value === undefined || value === null || value === '') return '空';
          return String(value);
        },

        getSettingsRiskHints(section, nextConfig) {
          const hints = [];
          if ((section === 'proxy' || section === 'all') && nextConfig.enableH2 === true && nextConfig.enableH3 === true && nextConfig.peakDowngrade === false) {
            hints.push('H2/H3 同时开启且关闭晚高峰降级，在复杂链路下更容易放大协议抖动。');
          }
          if ((section === 'proxy' || section === 'all') && Number(nextConfig.upstreamTimeoutMs) > 0 && Number(nextConfig.upstreamTimeoutMs) < 5000) {
            hints.push('上游握手超时低于 5000 毫秒，慢源或弱网容易被过早判定失败。');
          }
          if ((section === 'logs' || section === 'all') && Number(nextConfig.logBatchRetryCount) === 0) {
            hints.push('D1 重试次数为 0，瞬时抖动时会直接丢弃日志批次。');
          }
          if ((section === 'logs' || section === 'all') && normalizeLogSearchMode(nextConfig.logSearchMode) === 'fts') {
            hints.push('FTS 模式首次启用前需要先在日志页完成 FTS5 虚拟表初始化。');
          }
          if ((section === 'logs' || section === 'all') && Number(nextConfig.scheduledLeaseMs) > 0 && Number(nextConfig.scheduledLeaseMs) < 60000) {
            hints.push('定时任务租约低于 60 秒，慢清理或网络抖动时更容易出现并发重入。');
          }
          if ((section === 'monitoring' || section === 'all') && nextConfig.tgAlertOnScheduledFailure === true && (!String(nextConfig.tgBotToken || '').trim() || !String(nextConfig.tgChatId || '').trim())) {
            hints.push('已启用 Telegram 异常告警，但 Bot Token / Chat ID 还未完整配置。');
          }
          return hints;
        },

        buildConfigChangePreview(section, prevConfig, nextConfig, labelSection = section) {
          const fields = this.getConfigPanelFieldKeys(labelSection, section).length
            ? this.getConfigPanelFieldKeys(labelSection, section)
            : [...new Set([...Object.keys(prevConfig || {}), ...Object.keys(nextConfig || {})])];
          const diffLines = [];
          fields.forEach(key => {
            const before = JSON.stringify(prevConfig?.[key]);
            const after = JSON.stringify(nextConfig?.[key]);
            if (before === after) return;
            diffLines.push('• ' + this.getConfigFieldLabel(key) + ': ' + this.formatConfigPreviewValue(key, prevConfig?.[key]) + ' -> ' + this.formatConfigPreviewValue(key, nextConfig?.[key]));
          });
          if (!diffLines.length) {
            return {
              hasChanges: false,
              message: '当前分区没有检测到变更，无需保存。'
            };
          }
          const riskHints = this.getSettingsRiskHints(labelSection, nextConfig);
          let message = '即将保存「' + this.getSettingsSectionLabel(labelSection) + '」以下变更：\\n\\n' + diffLines.join('\\n');
          if (riskHints.length) {
            message += '\\n\\n风险提示：\\n' + riskHints.map(item => '• ' + item).join('\\n');
          }
          message += '\\n\\n是否继续？';
          return { hasChanges: true, message, riskHints };
        },

        clampPreviewValue(value, fallback, min, max, integer = false) {
          let next = Number.isFinite(Number(value)) ? Number(value) : Number(fallback);
          if (integer) next = Math.trunc(next);
          if (Number.isFinite(min)) next = Math.max(min, next);
          if (Number.isFinite(max)) next = Math.min(max, next);
          return next;
        },

        sanitizeConfigByRules(input, rules) {
          let config = input && typeof input === 'object' && !Array.isArray(input) ? { ...input } : {};
          Object.entries(rules?.aliasFields || {}).forEach(([targetKey, sourceKeys]) => {
            if (config[targetKey] !== undefined && config[targetKey] !== null) return;
            if (!Array.isArray(sourceKeys)) return;
            for (const sourceKey of sourceKeys) {
              if (config[sourceKey] === undefined || config[sourceKey] === null) continue;
              config[targetKey] = config[sourceKey];
              break;
            }
          });
          (rules?.trimFields || []).forEach(key => {
            if (config[key] === undefined || config[key] === null) return;
            config[key] = String(config[key]).trim();
          });
          Object.entries(rules?.arrayNormalizers || {}).forEach(([key, normalizerName]) => {
            if (!Array.isArray(config[key])) return;
            if (normalizerName === 'nodeNameList') config[key] = this.normalizeNodeNameList(config[key]);
          });
          Object.entries(rules?.integerFields || {}).forEach(([key, rule]) => {
            config[key] = this.clampPreviewValue(config[key], rule.fallback, rule.min, rule.max, true);
          });
          Object.entries(rules?.numberFields || {}).forEach(([key, rule]) => {
            config[key] = this.clampPreviewValue(config[key], rule.fallback, rule.min, rule.max, false);
          });
          (rules?.booleanTrueFields || []).forEach(key => {
            config[key] = config[key] !== false;
          });
          (rules?.booleanFalseFields || []).forEach(key => {
            config[key] = config[key] === true;
          });
          const allowedFields = Array.isArray(rules?.allowedFields) ? rules.allowedFields : [];
          if (allowedFields.length) {
            const filtered = {};
            allowedFields.forEach(key => {
              if (!Object.prototype.hasOwnProperty.call(config, key)) return;
              filtered[key] = config[key];
            });
            config = filtered;
          }
          return config;
        },

        sanitizeConfigPreviewCompat(input) {
          return this.sanitizeConfigByRules(input, CONFIG_PREVIEW_SANITIZE_RULES);
        },

        async finalizePersistedSettings(savedConfig, options = {}) {
          const appliedConfig = savedConfig && typeof savedConfig === 'object' && !Array.isArray(savedConfig) ? savedConfig : {};
          this.applyRuntimeConfig(appliedConfig);
          try {
            await this.loadSettings();
            this.showMessage(options.successMessage || '设置已保存，立即生效', { tone: 'success' });
          } catch (err) {
            console.error(options.refreshErrorLog || 'reload settings after persist failed', err);
            this.showMessage((options.partialSuccessPrefix || '设置已保存，但设置面板刷新失败: ') + (err?.message || '未知错误'), { tone: 'warning', modal: true });
          }
        },

        async prepareConfigChangePreview(section, prevConfig, rawNextConfig, labelSection = section) {
          let sanitizedConfig;
          try {
            const previewRes = await this.apiCall('previewConfig', { config: rawNextConfig });
            if (!previewRes?.config || typeof previewRes.config !== 'object' || Array.isArray(previewRes.config)) {
              throw new Error('配置预览返回格式无效');
            }
            sanitizedConfig = previewRes.config;
          } catch (err) {
            if (err?.code === 'INVALID_ACTION' && err?.status === 400) {
              sanitizedConfig = this.sanitizeConfigPreviewCompat(rawNextConfig);
            } else {
              const detail = String(err?.message || '未知错误');
              throw new Error(detail.startsWith('配置预览失败') ? detail : ('配置预览失败: ' + detail));
            }
          }
          return {
            sanitizedConfig,
            preview: this.buildConfigChangePreview(section, prevConfig, sanitizedConfig, labelSection)
          };
        },

        formatSnapshotReason(snapshot) {
          const reasonLabel = SNAPSHOT_REASON_LABELS[snapshot?.reason] || (snapshot?.reason || '未知来源');
          const section = String(snapshot?.section || 'all');
          return section && section !== 'all'
            ? (reasonLabel + ' · ' + this.getSettingsSectionLabel(section))
            : reasonLabel;
        },

        getConfigSnapshotChangedKeysText(snapshot) {
          const changedKeys = Array.isArray(snapshot?.changedKeys)
            ? snapshot.changedKeys.slice(0, 4).map(key => this.getConfigFieldLabel(key)).join(' / ')
            : '';
          const overflow = Array.isArray(snapshot?.changedKeys) && snapshot.changedKeys.length > 4
            ? (' +' + (snapshot.changedKeys.length - 4) + ' 项')
            : '';
          return (changedKeys || '未记录') + overflow;
        },

        applyConfigSnapshotsState(snapshots) {
          this.configSnapshots = Array.isArray(snapshots) ? snapshots : [];
          return this.configSnapshots;
        },

        async loadConfigSnapshots() {
          const res = await this.apiCall('getConfigSnapshots');
          this.applyConfigSnapshotsState(res.snapshots || []);
        },

        async clearConfigSnapshots() {
          if (!await this.askConfirm('清理后将删除当前保存的全部设置快照，且不能恢复。是否继续？', { title: '清理设置快照', tone: 'danger', confirmText: '继续' })) return;
          const res = await this.apiCall('clearConfigSnapshots');
          this.applyConfigSnapshotsState(res.snapshots || []);
          this.showMessage('设置快照已清理。', { tone: 'success' });
        },

        async restoreConfigSnapshot(snapshotId) {
          if (!snapshotId) return;
          if (!await this.askConfirm('恢复该快照后，当前全局设置会立即被替换。系统会先自动记录当前配置，是否继续？', { title: '恢复设置快照', tone: 'warning', confirmText: '恢复' })) return;
          const res = await this.apiCall('restoreConfigSnapshot', { id: snapshotId });
          this.applyRuntimeConfig(res.config || {});
          await this.loadSettings();
          this.showMessage('配置快照已恢复并立即生效。', { tone: 'success' });
        }
      };
    }

    const UiBridge = Object.assign(
      {},
      createUiFoundationStore(),
      createUiDashboardStore(),
      createUiDialogStore(),
      createUiNodeModalStore(),
      createUiConfigStore(),
      createUiNodesStore()
    );

    function createUiNodesStore() {
      return {
      simpleHash(str) {
        const input = String(str || "");
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
        }
        return String(hash >>> 0).toString(36);
      },

      safeDomId(prefix, value) {
        const base = String(value || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "node";
        return prefix + "-" + base + "-" + this.simpleHash(value);
      },

      buildNodeLink(node) {
        const encodedName = encodeURIComponent(String(node.name || ""));
        const encodedSecret = node.secret ? "/" + encodeURIComponent(String(node.secret)) : "";
        return uiBrowserBridge.readLocationOrigin() + "/" + encodedName + encodedSecret;
      },
      normalizeNodeKey(value) {
        return String(value || '').trim().toLowerCase();
      },
      normalizeNodeNameList(value) {
        const rawList = Array.isArray(value) ? value : String(value || '').split(/[\\r\\n,，;；|]+/);
        const seen = new Set();
        const result = [];
        rawList.forEach(item => {
          const name = String(item || '').trim();
          if (!name) return;
          const key = name.toLowerCase();
          if (seen.has(key)) return;
          seen.add(key);
          result.push(name);
        });
        return result;
      },
      normalizeNodeTagFilterValue(value = '') {
        const rawValue = String(value || '').trim();
        if (rawValue === '__untagged__') return rawValue;
        return this.normalizeNodeKey(rawValue);
      },
      buildNodeTagFilterOptions(nodes = []) {
        const tagMap = new Map();
        let untaggedCount = 0;
        (Array.isArray(nodes) ? nodes : [])
          .map(node => this.hydrateNode(node))
          .filter(node => node && typeof node === 'object')
          .forEach(node => {
            const tagLabel = String(node?.tag || '').trim();
            if (!tagLabel) {
              untaggedCount += 1;
              return;
            }
            const tagKey = this.normalizeNodeKey(tagLabel);
            if (!tagKey) {
              untaggedCount += 1;
              return;
            }
            const current = tagMap.get(tagKey);
            if (current) {
              current.count += 1;
              return;
            }
            tagMap.set(tagKey, {
              value: tagKey,
              label: tagLabel,
              count: 1,
              colorKey: this.normalizeNodeKey(node?.tagColor || '') || 'amber'
            });
          });
        const options = Array.from(tagMap.values())
          .sort((left, right) => String(left?.label || '').localeCompare(String(right?.label || ''), 'zh-Hans-CN', { sensitivity: 'base' }));
        if (untaggedCount > 0) {
          options.push({
            value: '__untagged__',
            label: '无标签',
            count: untaggedCount,
            colorKey: 'slate'
          });
        }
        return options;
      },
      applyNodeTagFilterOptions(nodes = []) {
        const nextOptions = this.buildNodeTagFilterOptions(nodes);
        this.nodeTagFilterOptions = nextOptions;
        const activeValue = this.normalizeNodeTagFilterValue(this.activeNodeTagFilter);
        if (!activeValue) return nextOptions;
        const stillExists = nextOptions.some(option => String(option?.value || '') === activeValue);
        if (!stillExists) this.activeNodeTagFilter = '';
        return nextOptions;
      },
      getNodeTagFilterOptions() {
        return Array.isArray(this.nodeTagFilterOptions) ? this.nodeTagFilterOptions : [];
      },
      hasNodeTagFilterOptions() {
        return this.getNodeTagFilterOptions().length > 0;
      },
      hasActiveNodeTagFilter() {
        return !!this.normalizeNodeTagFilterValue(this.activeNodeTagFilter);
      },
      getActiveNodeTagFilterOption() {
        const activeValue = this.normalizeNodeTagFilterValue(this.activeNodeTagFilter);
        if (!activeValue) return null;
        return this.getNodeTagFilterOptions().find(option => String(option?.value || '') === activeValue) || null;
      },
      getNodeTagFilterTriggerText() {
        return this.getActiveNodeTagFilterOption()?.label || '标签筛选';
      },
      getNodeTagFilterCounterText() {
        if (this.hasActiveNodeTagFilter()) return '已选';
        const total = this.getNodeTagFilterOptions().length;
        return total > 0 ? (total + ' 项') : '空';
      },
      getNodeTagFilterCounterClass() {
        return this.hasActiveNodeTagFilter()
          ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300';
      },
      getNodeTagFilterTriggerClass() {
        return this.nodeTagFilterPanelOpen || this.hasActiveNodeTagFilter()
          ? 'border-brand-200 bg-brand-50/90 text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300'
          : 'hover:text-slate-900 dark:hover:text-white';
      },
      getNodeTagFilterAllCount() {
        return Array.isArray(this.nodes) ? this.nodes.length : 0;
      },
      getNodeTagFilterChipClass(value = '') {
        const activeValue = this.normalizeNodeTagFilterValue(this.activeNodeTagFilter);
        const chipValue = this.normalizeNodeTagFilterValue(value);
        if (activeValue && activeValue === chipValue) {
          return 'border-brand-200 bg-brand-50 text-brand-700 shadow-[0_6px_16px_rgba(59,130,246,0.08)] dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300';
        }
        if (!activeValue && !chipValue) {
          return 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
        }
        return 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';
      },
      getNodeTagFilterChipCountClass(value = '') {
        const activeValue = this.normalizeNodeTagFilterValue(this.activeNodeTagFilter);
        const chipValue = this.normalizeNodeTagFilterValue(value);
        if (activeValue && activeValue === chipValue) {
          return 'bg-white/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-200';
        }
        if (!activeValue && !chipValue) {
          return 'bg-white/80 text-slate-500 dark:bg-slate-900 dark:text-slate-300';
        }
        return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
      },
      getNodeTagFilterDotClass(colorKey = 'slate') {
        const palette = {
          amber: 'bg-amber-400',
          emerald: 'bg-emerald-400',
          sky: 'bg-sky-400',
          violet: 'bg-violet-400',
          rose: 'bg-rose-400',
          slate: 'bg-slate-400'
        };
        return palette[this.normalizeNodeKey(colorKey || '')] || palette.slate;
      },
      toggleNodeTagFilterPanel() {
        if (!this.hasNodeTagFilterOptions()) return;
        this.nodeTagFilterPanelOpen = this.nodeTagFilterPanelOpen !== true;
      },
      clearNodeTagFilter() {
        if (!this.hasActiveNodeTagFilter()) return;
        this.activeNodeTagFilter = '';
        this.syncFilteredNodes();
      },
      setNodeTagFilter(value = '') {
        const nextValue = this.normalizeNodeTagFilterValue(value);
        const currentValue = this.normalizeNodeTagFilterValue(this.activeNodeTagFilter);
        this.activeNodeTagFilter = currentValue && currentValue === nextValue ? '' : nextValue;
        this.syncFilteredNodes();
      },
      doesNodeMatchActiveTagFilter(node) {
        const activeValue = this.normalizeNodeTagFilterValue(this.activeNodeTagFilter);
        if (!activeValue) return true;
        const tagLabel = String(node?.tag || '').trim();
        if (activeValue === '__untagged__') return !tagLabel;
        return this.normalizeNodeKey(tagLabel) === activeValue;
      },
      markNodeMutation(names) {
        const mutationId = ++this.nodeMutationSeq;
        this.normalizeNodeNameList(names).forEach(name => {
          const key = this.normalizeNodeKey(name);
          if (key) this.nodeMutationVersion[key] = mutationId;
        });
        return mutationId;
      },
      isNodeMutationCurrent(names, mutationId) {
        const keys = this.normalizeNodeNameList(names)
          .map(name => this.normalizeNodeKey(name))
          .filter(Boolean);
        return keys.length > 0 && keys.every(key => this.nodeMutationVersion[key] === mutationId);
      },
      async rollbackNodesState(message) {
        try {
          await this.loadNodes();
        } catch (rollbackErr) {
          console.error('loadNodes rollback failed', rollbackErr);
          this.showMessage(message + '；自动回滚失败，请检查网络后手动刷新页面', { tone: 'error', modal: true });
          return;
        }
        this.showMessage(message, { tone: 'error', modal: true });
      },
      createLineId() {
        return 'line-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      },
      buildDefaultLineName(index) {
        return '线路' + (Number(index) + 1);
      },
      getNextDefaultLineName(lines = []) {
        const usedNames = new Set((Array.isArray(lines) ? lines : []).map(line => String(line?.name || '').trim()));
        let cursor = 1;
        while (usedNames.has('线路' + cursor)) cursor += 1;
        return '线路' + cursor;
      },
      parseLatencyMs(value) {
        if (value === '' || value === null || value === undefined) return null;
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) return null;
        return Math.round(parsed);
      },
      normalizeSingleTarget(value) {
        const raw = String(value || '').trim();
        if (!raw) return '';
        try {
          const url = new URL(raw);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
          return url.toString().replace(/\\/$/, '');
        } catch {
          return '';
        }
      },
      validateSingleTarget(value) {
        return !!this.normalizeSingleTarget(value);
      },
      normalizeNodeLines(lines, fallbackTarget = '') {
        const sourceLines = Array.isArray(lines) && lines.length
          ? lines
          : String(fallbackTarget || '')
              .split(',')
              .map(item => item.trim())
              .filter(Boolean)
              .map((target, index) => ({
                id: 'line-' + (index + 1),
                name: this.buildDefaultLineName(index),
                target
              }));
        if (!sourceLines.length) return [];

        const result = [];
        const usedIds = new Set();
        sourceLines.forEach((item, index) => {
          const line = item && typeof item === 'object' && !Array.isArray(item) ? item : { target: item };
          const target = this.normalizeSingleTarget(line?.target);
          if (!target) return;
          let nextId = this.normalizeNodeKey(line?.id) || ('line-' + (index + 1));
          let suffix = 2;
          while (usedIds.has(nextId)) {
            nextId = (this.normalizeNodeKey(line?.id) || ('line-' + (index + 1))) + '-' + suffix;
            suffix += 1;
          }
          usedIds.add(nextId);
          const checkedAt = line?.latencyUpdatedAt ? new Date(line.latencyUpdatedAt) : null;
          result.push({
            id: nextId,
            name: String(line?.name || '').trim() || this.buildDefaultLineName(index),
            target,
            latencyMs: this.parseLatencyMs(line?.latencyMs),
            latencyUpdatedAt: checkedAt && Number.isFinite(checkedAt.getTime()) ? checkedAt.toISOString() : ''
          });
        });
        return result;
      },
      buildLegacyTargetFromLines(lines = []) {
        return (Array.isArray(lines) ? lines : [])
          .map(line => String(line?.target || '').trim())
          .filter(Boolean)
          .join(',');
      },
      resolveActiveLineId(activeLineId, lines = []) {
        const normalizedId = this.normalizeNodeKey(activeLineId);
        if (normalizedId && lines.some(line => String(line?.id || '') === normalizedId)) return normalizedId;
        return lines[0]?.id || '';
      },
      getNodeLines(node) {
        return this.normalizeNodeLines(node?.lines, node?.target || '');
      },
      getActiveNodeLine(node) {
        const lines = this.getNodeLines(node);
        if (!lines.length) return null;
        const activeLineId = this.resolveActiveLineId(node?.activeLineId, lines);
        return lines.find(line => line.id === activeLineId) || lines[0];
      },
      decorateNodeSyncState(node, state = '', errorMessage = '') {
        const base = node && typeof node === 'object' ? { ...node } : {};
        const nextState = this.normalizeNodeKey(state);
        if (nextState === 'syncing') {
          return {
            ...base,
            _syncState: 'syncing',
            _syncError: ''
          };
        }
        if (nextState === 'failed') {
          return {
            ...base,
            _syncState: 'failed',
            _syncError: String(errorMessage || '').trim()
          };
        }
        delete base._syncState;
        delete base._syncError;
        return base;
      },
      hydrateNode(node) {
        if (!node || typeof node !== 'object') return node;
        const lines = this.getNodeLines(node);
        const activeLineId = this.resolveActiveLineId(node.activeLineId, lines);
        return {
          ...node,
          lines,
          activeLineId,
          target: this.buildLegacyTargetFromLines(lines)
        };
      },
      normalizeNodeCollection(nodes = []) {
        return (Array.isArray(nodes) ? nodes : [])
          .map(node => this.hydrateNode(node))
          .filter(node => node && typeof node === 'object' && this.normalizeNodeKey(node?.name))
          .sort((left, right) => {
            const leftLabel = String(left?.displayName || left?.name || '');
            const rightLabel = String(right?.displayName || right?.name || '');
            return leftLabel.localeCompare(rightLabel, 'zh-Hans-CN', { sensitivity: 'base' });
          });
      },
      reconcileSourceDirectNodesSelection(options = {}) {
        const renameMapInput = options.renameMap instanceof Map
          ? options.renameMap
          : new Map(Object.entries(options.renameMap && typeof options.renameMap === 'object' ? options.renameMap : {}));
        const renameMap = new Map();
        renameMapInput.forEach((toName, fromName) => {
          const fromKey = this.normalizeNodeKey(fromName);
          const nextName = String(toName || '').trim();
          if (!fromKey || !nextName) return;
          renameMap.set(fromKey, nextName);
        });
        const allowedNames = this.normalizeNodeNameList(options.allowedNames !== undefined
          ? options.allowedNames
          : (Array.isArray(this.nodes) ? this.nodes.map(node => node?.name) : []));
        const allowedNameMap = new Map(allowedNames.map(name => [this.normalizeNodeKey(name), String(name || '').trim()]).filter(([key, value]) => key && value));
        const nextSelection = [];
        const seen = new Set();
        this.normalizeNodeNameList(this.settingsSourceDirectNodes).forEach(name => {
          const currentKey = this.normalizeNodeKey(name);
          if (!currentKey) return;
          const renamedName = renameMap.get(currentKey) || String(name || '').trim();
          const nextKey = this.normalizeNodeKey(renamedName);
          if (!nextKey || !allowedNameMap.has(nextKey) || seen.has(nextKey)) return;
          seen.add(nextKey);
          nextSelection.push(allowedNameMap.get(nextKey) || renamedName);
        });
        this.settingsSourceDirectNodes = nextSelection;
        return nextSelection;
      },
      applyNodesState(nodes, options = {}) {
        const nextNodes = this.normalizeNodeCollection(nodes);
        this.nodes = nextNodes;
        this.applyNodeTagFilterOptions(nextNodes);
        const validKeys = new Set(nextNodes.map(node => this.normalizeNodeKey(node?.name)).filter(Boolean));
        this.nodeHealth = Object.fromEntries(Object.entries(this.nodeHealth || {}).filter(([key]) => validKeys.has(this.normalizeNodeKey(key))));
        this.syncFilteredNodes();
        if (options.syncSourceDirectNodes !== false) {
          this.reconcileSourceDirectNodesSelection({
            renameMap: options.renameMap,
            allowedNames: nextNodes.map(node => node?.name)
          });
        }
        return nextNodes;
      },
      syncFilteredNodes() {
        const keyword = String(this.nodeSearchKeyword || '').trim().toLowerCase();
        this.filteredNodes = (Array.isArray(this.nodes) ? this.nodes : [])
          .map(node => this.hydrateNode(node))
          .filter(node => node && typeof node === 'object')
          .filter(n => {
            if (!this.doesNodeMatchActiveTagFilter(n)) return false;
            const nodeName = String(n.name || '').trim();
            const displayName = String(n.displayName || n.name || '').trim();
            const tagText = String(n.tag || '').trim();
            const remarkText = String(n.remark || '').trim();
            if (!nodeName && !displayName) return false;
            if (!keyword) return true;
            const lineNames = this.getNodeLines(n).map(line => String(line?.name || '')).join(' ').toLowerCase();
            return nodeName.toLowerCase().includes(keyword)
              || displayName.toLowerCase().includes(keyword)
              || tagText.toLowerCase().includes(keyword)
              || remarkText.toLowerCase().includes(keyword)
              || lineNames.includes(keyword);
          });
        return this.filteredNodes;
      },
      upsertNode(nextNode, options = {}) {
        if (!nextNode?.name) return;
        const hydratedNode = this.hydrateNode(nextNode);
        const nextKey = this.normalizeNodeKey(hydratedNode.name);
        const previousKey = this.normalizeNodeKey(options.previousName || '');
        const nextNodes = (Array.isArray(this.nodes) ? this.nodes : []).filter(node => {
          const nodeKey = this.normalizeNodeKey(node?.name);
          if (!nodeKey) return false;
          if (nodeKey === nextKey) return false;
          if (previousKey && nodeKey === previousKey) return false;
          return true;
        });
        nextNodes.push(hydratedNode);
        const renameMap = previousKey && previousKey !== nextKey ? { [previousKey]: hydratedNode.name } : null;
        this.applyNodesState(nextNodes, { renameMap });
      },
      findNodeByAnyName(names = []) {
        const keys = this.normalizeNodeNameList(names)
          .map(name => this.normalizeNodeKey(name))
          .filter(Boolean);
        if (!keys.length) return null;
        return (Array.isArray(this.nodes) ? this.nodes : []).find(node => keys.includes(this.normalizeNodeKey(node?.name))) || null;
      },
      formatLatency(ms) {
        const latency = Number(ms);
        if (!Number.isFinite(latency)) return '--';
        return latency > 5000 ? 'Timeout' : (Math.round(latency) + ' ms');
      },
      getNodeLatencyMeta(ms, healthCount = 0) {
        const latency = Number(ms);
        const overloaded = Number(healthCount) > 3;
        if (!Number.isFinite(latency)) {
          return {
            dotClass: 'bg-slate-200 dark:bg-slate-700',
            textClass: 'text-slate-500 dark:text-slate-400 font-medium',
            text: '--',
            titleClass: overloaded ? 'text-red-600 dark:text-red-400' : ''
          };
        }
        if (latency <= 150) {
          return {
            dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] dark:shadow-[0_0_8px_rgba(52,211,153,0.4)]',
            textClass: 'text-emerald-600 dark:text-emerald-400 font-medium',
            text: this.formatLatency(latency),
            titleClass: overloaded ? 'text-red-600 dark:text-red-400' : ''
          };
        }
        if (latency <= 200) {
          return {
            dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] dark:shadow-[0_0_8px_rgba(251,191,36,0.4)]',
            textClass: 'text-amber-600 dark:text-amber-400 font-medium',
            text: this.formatLatency(latency),
            titleClass: overloaded ? 'text-red-600 dark:text-red-400' : ''
          };
        }
        if (latency <= 300) {
          return {
            dotClass: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] dark:shadow-[0_0_8px_rgba(251,146,60,0.4)]',
            textClass: 'text-orange-600 dark:text-orange-400 font-medium',
            text: this.formatLatency(latency),
            titleClass: overloaded ? 'text-red-600 dark:text-red-400' : ''
          };
        }
        return {
          dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] dark:shadow-[0_0_8px_rgba(248,113,113,0.4)]',
          textClass: 'text-red-600 dark:text-red-400 font-medium',
          text: this.formatLatency(latency),
          titleClass: overloaded ? 'text-red-600 dark:text-red-400' : ''
        };
      },
      getNodeHealthCount(name) {
        const normalized = this.normalizeNodeKey(name);
        if (!normalized) return 0;
        return Number(this.nodeHealth?.[normalized]) || 0;
      },
      getFilteredNodes() {
        return Array.isArray(this.filteredNodes) ? this.filteredNodes : this.syncFilteredNodes();
      },
      sortLinesByLatency(lines = []) {
        return (Array.isArray(lines) ? lines : [])
          .map((line, index) => ({ line, index }))
          .sort((left, right) => {
            const leftMs = Number.isFinite(left.line?.latencyMs) ? left.line.latencyMs : Number.POSITIVE_INFINITY;
            const rightMs = Number.isFinite(right.line?.latencyMs) ? right.line.latencyMs : Number.POSITIVE_INFINITY;
            if (leftMs !== rightMs) return leftMs - rightMs;
            return left.index - right.index;
          })
          .map(item => item.line);
      },
      isNodePanelPingAutoSortEnabled() {
        return this.getEffectiveSettingValue('nodePanelPingAutoSort') === true;
      },
      buildActiveLinePingPayload(nodeOrName) {
        const node = typeof nodeOrName === 'string'
          ? this.nodes.find(item => this.normalizeNodeKey(item?.name) === this.normalizeNodeKey(nodeOrName))
          : nodeOrName;
        const payload = { name: typeof nodeOrName === 'string' ? nodeOrName : String(node?.name || '') };
        const activeLineId = this.getActiveNodeLine(node)?.id || '';
        if (activeLineId) {
          payload.lineId = activeLineId;
          payload.silent = true;
        }
        return payload;
      },
      clearNodeLineDragState() {
        this.nodeLineDragId = '';
        this.nodeLineDropHint = null;
      },
      readDesktopViewportMatch() {
        return uiBrowserBridge.readDesktopViewportMatch();
      },
      syncViewportState(hash = '', forceDesktopMatch = null) {
        const nextDesktop = typeof forceDesktopMatch === 'boolean'
          ? forceDesktopMatch
          : this.readDesktopViewportMatch();
        this.isDesktopViewport = nextDesktop === true;
        const targetHash = String(hash || this.getCurrentRouteHash());
        this.syncSettingsSplitLayout(targetHash);
        if (!this.isDesktopViewport) this.sidebarOpen = false;
        return this.isDesktopViewport;
      },
      isDesktopNodeLineDragEnabled() {
        return this.isDesktopViewport === true;
      },
      getNodeModalLineRowClass(lineId) {
        const isDragging = this.nodeLineDragId === lineId;
        const dropPlacement = this.nodeLineDropHint?.lineId === lineId ? this.nodeLineDropHint.placement : '';
        return [
          'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 transition',
          isDragging ? 'opacity-60 ring-2 ring-brand-200 dark:ring-brand-500/20' : '',
          dropPlacement === 'before' ? 'border-t-brand-500 border-t-4 pt-[10px]' : '',
          dropPlacement === 'after' ? 'border-b-brand-500 border-b-4 pb-[10px]' : '',
          this.isDesktopNodeLineDragEnabled() ? 'md:cursor-grab' : ''
        ].filter(Boolean).join(' ');
      },
      moveNodeLineTo(lineId, targetLineId, placement = 'before') {
        const fromIndex = this.nodeModalLines.findIndex(line => line.id === lineId);
        const targetIndex = this.nodeModalLines.findIndex(line => line.id === targetLineId);
        if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) return;
        const [line] = this.nodeModalLines.splice(fromIndex, 1);
        const adjustedTargetIndex = fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
        const insertIndex = placement === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex;
        this.nodeModalLines.splice(insertIndex, 0, line);
      },
      async pingAllNodeLinesInModal(event) {
        const validLines = this.nodeModalLines.filter(line => this.validateSingleTarget(line?.target));
        const autoSortEnabled = this.isNodePanelPingAutoSortEnabled();
        if (!validLines.length) {
          this.showMessage('请先至少填写一条有效的 http/https 目标源站', { tone: 'warning' });
          return;
        }
        this.nodeModalPingAllPending = true;
        this.nodeModalPingAllText = '测试中...';
        try {
          const timeout = Number(this.getEffectiveSettingValue('pingTimeout')) || UI_DEFAULTS.pingTimeout;
          for (let index = 0; index < validLines.length; index++) {
            const line = validLines[index];
            this.nodeModalPingAllText = '测试中 ' + (index + 1) + '/' + validLines.length;
            try {
              const normalizedTarget = this.normalizeSingleTarget(line.target);
              const res = await this.apiCall('pingNode', { target: normalizedTarget, timeout, forceRefresh: true });
              line.target = normalizedTarget;
              line.latencyMs = Number(res?.ms);
              line.latencyUpdatedAt = new Date().toISOString();
            } catch {
              line.latencyMs = 9999;
              line.latencyUpdatedAt = new Date().toISOString();
            }
          }
          if (autoSortEnabled) {
            this.nodeModalLines = this.sortLinesByLatency(this.nodeModalLines);
            this.syncNodeModalLinesState(this.nodeModalLines[0]?.id || '');
          } else {
            this.syncNodeModalLinesState();
          }
        } finally {
          this.nodeModalPingAllPending = false;
          this.nodeModalPingAllText = '一键测试延迟';
        }
      },

      getSourceDirectNodesSummaryText() {
        const total = Array.isArray(this.nodes) ? this.nodes.length : 0;
        const selectedCount = this.normalizeNodeNameList(this.settingsSourceDirectNodes).length;
        return total ? ('已选 ' + selectedCount + ' / ' + total + ' 个节点作为源站直连') : ('已选 ' + selectedCount + ' 个节点');
      },

      getFilteredSourceDirectNodes() {
        const keyword = String(this.settingsDirectNodeSearch || '').trim().toLowerCase();
        const nodes = Array.isArray(this.nodes) ? this.nodes.slice() : [];
        return nodes
          .filter(node => {
            if (!keyword) return true;
            const haystack = (String(node?.displayName || '') + ' ' + String(node?.name || '') + ' ' + String(node?.tag || '') + ' ' + String(node?.remark || '')).toLowerCase();
            return haystack.includes(keyword);
          })
          .sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'zh-Hans-CN'));
      },

      isSourceDirectNodeSelected(nodeName) {
        const normalized = String(nodeName || '').trim().toLowerCase();
        return this.normalizeNodeNameList(this.settingsSourceDirectNodes).some(name => String(name || '').trim().toLowerCase() === normalized);
      },

      toggleSourceDirectNode(nodeName, checked) {
        const currentSet = new Set(this.normalizeNodeNameList(this.settingsSourceDirectNodes).map(name => String(name || '').trim().toLowerCase()));
        const originalNames = new Map(this.normalizeNodeNameList(this.settingsSourceDirectNodes).map(name => [String(name || '').trim().toLowerCase(), name]));
        const normalized = String(nodeName || '').trim().toLowerCase();
        if (!normalized) return;
        if (checked) {
          currentSet.add(normalized);
          originalNames.set(normalized, String(nodeName || '').trim());
        } else {
          currentSet.delete(normalized);
          originalNames.delete(normalized);
        }
        this.settingsSourceDirectNodes = Array.from(currentSet).map(key => originalNames.get(key) || key);
      },

      syncSourceDirectNodesSelection(selectedNames) {
        if (selectedNames !== undefined) {
          this.settingsSourceDirectNodes = this.normalizeNodeNameList(selectedNames);
        } else {
          this.settingsSourceDirectNodes = this.normalizeNodeNameList(this.settingsSourceDirectNodes);
        }
        this.reconcileSourceDirectNodesSelection();
      },

      validateTargets(targetValue) {
        const targets = String(targetValue || "").split(",").map(function (item) { return item.trim(); }).filter(Boolean);
        if (!targets.length) return false;
        return targets.every(item => this.validateSingleTarget(item));
      },
      ensureNodeModalLines(lines = [], fallbackTarget = '') {
        const normalized = this.normalizeNodeLines(lines, fallbackTarget);
        this.nodeModalLines = normalized.length
          ? normalized
          : [{
              id: this.createLineId(),
              name: this.buildDefaultLineName(0),
              target: '',
              latencyMs: null,
              latencyUpdatedAt: ''
            }];
        return this.nodeModalLines;
      },
      syncNodeModalActiveLine(preferredId = '') {
        const nextId = this.resolveActiveLineId(preferredId || this.nodeModalForm.activeLineId, this.nodeModalLines);
        this.nodeModalForm.activeLineId = nextId;
        return nextId;
      },
      syncNodeModalLinesState(preferredId = '') {
        if (!Array.isArray(this.nodeModalLines) || !this.nodeModalLines.length) this.ensureNodeModalLines();
        this.syncNodeModalActiveLine(preferredId);
      },
      addNodeLine() {
        if (!Array.isArray(this.nodeModalLines)) this.nodeModalLines = [];
        this.nodeModalLines.push({
          id: this.createLineId(),
          name: this.getNextDefaultLineName(this.nodeModalLines),
          target: '',
          latencyMs: null,
          latencyUpdatedAt: ''
        });
        this.syncNodeModalLinesState();
      },
      moveNodeLine(lineId, delta) {
        const index = this.nodeModalLines.findIndex(line => line.id === lineId);
        const nextIndex = index + delta;
        if (index < 0 || nextIndex < 0 || nextIndex >= this.nodeModalLines.length) return;
        const [line] = this.nodeModalLines.splice(index, 1);
        this.nodeModalLines.splice(nextIndex, 0, line);
      },
      removeNodeLine(lineId) {
        this.nodeModalLines = this.nodeModalLines.filter(line => line.id !== lineId);
        if (!this.nodeModalLines.length) {
          this.ensureNodeModalLines();
        }
        if (this.nodeModalForm.activeLineId === lineId) {
          this.nodeModalForm.activeLineId = this.nodeModalLines[0]?.id || '';
        }
        this.syncNodeModalLinesState();
      },
      async promptLogin() {
        if (this.loginPromise) return this.loginPromise;
        this.loginPromise = (async () => {
          const pass = await this.askPrompt({
            title: '管理员登录',
            message: '请输入管理员密码：',
            placeholder: '请输入管理员密码',
            inputType: 'password',
            confirmText: '登录',
            cancelText: '取消',
            required: true,
            tone: 'info'
          });
          if (!pass) throw new Error("LOGIN_CANCELLED");
          const res = await fetch(ADMIN_LOGIN_PATH, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pass })
          });
          const data = await res.json().catch(function () { return {}; });
          if (!res.ok || (!data.ok && !data.token)) throw new Error((data.error && data.error.message) || "登录失败");
          return true;
        })();
        try { return await this.loginPromise; } finally { this.loginPromise = null; }
      },

      handleNodeModalDisplayNameInput() {
        this.clearNodeModalFieldError('displayName');
        const previousDisplayName = String(this.nodeModalLastDisplayName || '');
        const nextDisplayName = String(this.nodeModalForm.displayName || '');
        const currentPath = String(this.nodeModalForm.name || '');
        if (!this.nodeModalPathManual && (!currentPath || currentPath === previousDisplayName)) {
          this.nodeModalForm.name = nextDisplayName;
        }
        this.nodeModalLastDisplayName = nextDisplayName;
      },

      handleNodeModalPathInput() {
        this.clearNodeModalFieldError('name');
        const currentPath = String(this.nodeModalForm.name || '');
        const currentDisplayName = String(this.nodeModalForm.displayName || '');
        this.nodeModalPathManual = !!currentPath && currentPath !== currentDisplayName;
      },

      handleNodeModalLineTargetInput(lineId) {
        this.clearNodeModalFieldError('lineTarget', lineId);
      },

      handleNodeModalCancel(event) {
        event?.preventDefault?.();
        this.closeNodeModal();
      },

      handleNodeModalNativeClose() {
        this.nodeModalOpen = false;
      },
      
      };
    }

    Object.assign(UiBridge, {

      init() {
        const defaultLogRange = getDefaultLogDateRange();
        if (!this.logStartDate) this.logStartDate = defaultLogRange.startDate;
        if (!this.logEndDate) this.logEndDate = defaultLogRange.endDate;
        this.isDarkTheme = uiBrowserBridge.resolveDarkTheme();
        this.syncFilteredNodes();
        this.route(this.getCurrentRouteHash());
      },

      toggleTheme() {
        const nextTheme = !this.isDarkTheme;
        this.isDarkTheme = nextTheme;
        uiBrowserBridge.persistTheme(nextTheme);
      },

      navigate(hash) {
        const nextHash = String(hash || '').trim() || '#dashboard';
        if (String(this.currentHash || '#dashboard') === nextHash && this.getCurrentRouteHash() === nextHash) {
          this.route(nextHash);
          return Promise.resolve(true);
        }
        return Promise.resolve().then(() => {
          this.route(nextHash);
          if (this.getCurrentRouteHash() !== nextHash) {
            uiBrowserBridge.writeHash(nextHash);
          }
          return true;
        });
      },

      handleExternalHashNavigation(nextHash) {
        const targetHash = String(nextHash || '').trim() || '#dashboard';
        const currentHash = String(this.currentHash || '#dashboard');
        if (targetHash === currentHash) return Promise.resolve(true);
        return Promise.resolve().then(() => {
          this.route(targetHash);
          return true;
        });
      },

      runRouteLoader(hash, loader, failurePrefix) {
        const loadSeq = ++this.pageLoadSeq;
        Promise.resolve()
          .then(() => loader())
          .catch(err => {
            if (loadSeq !== this.pageLoadSeq) return;
            if (String(this.currentHash || '') !== String(hash || '')) return;
            const detail = err?.message || '未知错误';
            this.showMessage(String(failurePrefix || '页面加载失败: ') + detail, { tone: 'error', modal: true });
          });
      },

      getNavItemClass(hash) {
        if (String(hash || '') === String(this.currentHash || '#dashboard')) {
          return 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400';
        }
        return '';
      },

      escapeHtml(value) {
        return String(value == null ? '' : value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      },

      formatLocalDateTime(value) {
        if (!value) return '未记录';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleString('zh-CN', {
          hour12: false,
          timeZone: 'Asia/Shanghai'
        });
      },

      summarizeRuntimeTimestamp(value, prefix) {
        if (!value) return '';
        return prefix + this.formatLocalDateTime(value);
      },

      getDashboardBadgeClass(tone = 'slate') {
        const palette = {
          emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
          blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
          amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
          red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
          slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        };
        return palette[tone] || palette.slate;
      },

      buildDashboardBadge(label, tone = 'slate') {
        return { label: String(label || '').trim(), tone: String(tone || 'slate') || 'slate' };
      },

      buildDashboardBadges(items) {
        const badges = (Array.isArray(items) ? items : [])
          .filter(item => item && item.label)
          .map(item => this.buildDashboardBadge(item.label, item.tone));
        return badges.length ? badges : [this.buildDashboardBadge('待加载', 'slate')];
      },

      getRequestSourceBadge(data) {
        const source = String(data?.requestSource || '').toLowerCase();
        if (source === 'workers_usage') return { label: '请求口径: Workers Usage', tone: 'emerald' };
        if (source === 'zone_analytics') return { label: '请求口径: Zone Analytics', tone: 'blue' };
        if (source === 'd1_logs') return { label: '请求口径: D1 兜底', tone: 'amber' };
        if (source === 'unconfigured') return { label: '请求口径: 未配置', tone: 'amber' };
        return { label: '请求口径: 待确认', tone: 'slate' };
      },

      getTrafficStatusBadge(data) {
        if (data?.cfAnalyticsLoaded) return { label: '流量状态: Cloudflare 正常', tone: 'emerald' };
        const status = String(data?.cfAnalyticsStatus || '');
        if (status.includes('未配置')) return { label: '流量状态: 未配置', tone: 'amber' };
        if (status.includes('失败') || data?.cfAnalyticsError) return { label: '流量状态: 查询失败', tone: 'red' };
        return { label: '流量状态: 降级/未知', tone: 'slate' };
      },

      getStatsFreshnessBadge(data) {
        const cacheStatus = String(data?.cacheStatus || 'live').toLowerCase();
        if (cacheStatus === 'cache') return { label: '统计快照: 缓存命中', tone: 'blue' };
        return { label: '统计快照: 实时汇总', tone: 'emerald' };
      },

      getRuntimeStatusMeta(status) {
        const key = String(status || 'idle').toLowerCase();
        if (key === 'success') return { label: '正常', badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', dotClass: 'bg-emerald-500' };
        if (key === 'running') return { label: '运行中', badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400', dotClass: 'bg-blue-500' };
        if (key === 'partial_failure') return { label: '部分失败', badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400', dotClass: 'bg-amber-500' };
        if (key === 'failed') return { label: '失败', badgeClass: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400', dotClass: 'bg-red-500' };
        if (key === 'skipped') return { label: '已跳过', badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', dotClass: 'bg-slate-400' };
        return { label: '待记录', badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', dotClass: 'bg-slate-400' };
      },

      formatRuntimeStateText(status) {
        return this.getRuntimeStatusMeta(status).label;
      },

      getRuntimeStatusTimestamp(state) {
        const data = state && typeof state === 'object' ? state : {};
        const status = String(data.status || '').toLowerCase();
        if (status === 'failed' || status === 'partial_failure') return data.lastErrorAt || data.lastSuccessAt || data.lastSkippedAt || '';
        if (status === 'skipped') return data.lastSkippedAt || data.lastSuccessAt || data.lastErrorAt || '';
        return data.lastSuccessAt || data.lastSkippedAt || data.lastErrorAt || '';
      },

      formatRuntimeSectionLine(label, state) {
        const data = state && typeof state === 'object' ? state : {};
        if (!data.status) return '';
        const timestamp = this.getRuntimeStatusTimestamp(data);
        return label + this.formatRuntimeStateText(data.status) + (timestamp ? ('（' + this.formatLocalDateTime(timestamp) + '）') : '');
      },

      buildRuntimeStatusCard(title, status, summary, lines = [], detail = '') {
        return {
          title: String(title || '').trim() || '运行状态',
          status: String(status || 'idle').trim() || 'idle',
          summary: String(summary || '暂无运行记录'),
          lines: (Array.isArray(lines) ? lines : []).filter(Boolean).map(line => String(line)),
          detail: String(detail || '')
        };
      },

      applyRuntimeStatusState(statusPayload) {
        const status = statusPayload && typeof statusPayload === 'object' ? statusPayload : {};
        this.runtimeStatus = status;
        this.dashboardRuntimeView.updatedText = '最近同步：' + this.formatLocalDateTime(status.updatedAt);

        const log = status.log && typeof status.log === 'object' ? status.log : {};
        const logSummary = this.summarizeRuntimeTimestamp(log.lastFlushAt || log.lastFlushErrorAt || log.lastOverflowAt, '最近日志事件：');
        const logLines = [
          log.lastFlushAt ? ('最近成功写入：' + this.formatLocalDateTime(log.lastFlushAt)) : '',
          Number.isFinite(Number(log.lastFlushCount)) ? ('最近写入批次：' + Number(log.lastFlushCount) + ' 条') : '',
          Number.isFinite(Number(log.queueLengthAfterFlush)) ? ('写入后队列长度：' + Number(log.queueLengthAfterFlush)) : '',
          log.lastOverflowAt ? ('最近队列溢出：' + this.formatLocalDateTime(log.lastOverflowAt) + '，丢弃 ' + (Number(log.lastOverflowDropCount) || 0) + ' 条') : ''
        ].filter(Boolean);
        const logDetail = log.lastFlushError ? ('最近写入错误：' + log.lastFlushError) : '';
        this.dashboardRuntimeView.logCard = this.buildRuntimeStatusCard('日志写入', log.lastFlushStatus || (log.lastOverflowAt ? 'partial_failure' : 'idle'), logSummary, logLines, logDetail);

        const scheduled = status.scheduled && typeof status.scheduled === 'object' ? status.scheduled : {};
        const cleanup = scheduled.cleanup && typeof scheduled.cleanup === 'object' ? scheduled.cleanup : {};
        const report = scheduled.report && typeof scheduled.report === 'object' ? scheduled.report : {};
        const alerts = scheduled.alerts && typeof scheduled.alerts === 'object' ? scheduled.alerts : {};
        const scheduledSummary = this.summarizeRuntimeTimestamp(scheduled.lastFinishedAt || scheduled.lastStartedAt || scheduled.lastErrorAt, '最近调度：');
        const scheduledLines = [
          scheduled.lastStartedAt ? ('最近开始：' + this.formatLocalDateTime(scheduled.lastStartedAt)) : '',
          scheduled.lastFinishedAt ? ('最近结束：' + this.formatLocalDateTime(scheduled.lastFinishedAt)) : '',
          this.formatRuntimeSectionLine('日志清理：', cleanup),
          this.formatRuntimeSectionLine('日报发送：', report),
          this.formatRuntimeSectionLine('异常告警：', alerts)
        ].filter(Boolean);
        const scheduledDetail = scheduled.lastError || cleanup.lastError || report.lastError || alerts.lastError
          ? ('最近调度错误：' + (scheduled.lastError || cleanup.lastError || report.lastError || alerts.lastError))
          : '';
        this.dashboardRuntimeView.scheduledCard = this.buildRuntimeStatusCard('定时任务', scheduled.status || 'idle', scheduledSummary, scheduledLines, scheduledDetail);
      },

      applyRuntimeStatusErrorState(message) {
        this.dashboardRuntimeView.updatedText = '最近同步：运行状态加载失败';
        const errorMessage = message || '未知错误';
        this.dashboardRuntimeView.logCard = this.buildRuntimeStatusCard('日志写入', 'failed', '运行状态接口暂时不可用', [], errorMessage);
        this.dashboardRuntimeView.scheduledCard = this.buildRuntimeStatusCard('定时任务', 'failed', '运行状态接口暂时不可用', [], errorMessage);
      },
      
      async apiCall(action, payload={}) {
          const headers = {'Content-Type': 'application/json'};
          if (String(action || '') === 'updateDnsRecord') headers['X-Admin-Confirm'] = 'updateDnsRecord';
          if (String(action || '') === 'saveDnsRecords') headers['X-Admin-Confirm'] = 'saveDnsRecords';
          const requestInit = {
              method: 'POST',
              credentials: 'same-origin',
              headers,
              body: JSON.stringify({action, ...payload})
          };
          let res = await fetch(ADMIN_PATH, requestInit);
          if (res.status === 401) {
              await this.promptLogin();
              res = await fetch(ADMIN_PATH, requestInit);
          }
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
              const error = new Error(data.error?.message || ('HTTP ' + res.status));
              error.code = data.error?.code || null;
              error.status = res.status;
              throw error;
          }
          return data;
      },

      toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
      },
      
      route(forcedHash = '') {
        const hash = forcedHash || this.getCurrentRouteHash();
        this.currentHash = hash;
        this.pageTitle = VIEW_TITLES[hash] || 'Emby Proxy';
        this.syncViewportState(hash);

        if (hash === '#dashboard') this.runRouteLoader(hash, () => this.loadDashboard(), '仪表盘加载失败: ');
        if (hash === '#nodes') this.runRouteLoader(hash, () => this.loadNodes(), '节点列表加载失败: ');
        if (hash === '#logs') this.runRouteLoader(hash, () => this.loadLogs(1), '日志加载失败: ');
        if (hash === '#dns') this.runRouteLoader(hash, () => this.loadDnsRecords(), 'DNS 加载失败: ');
        if (hash === '#settings') this.runRouteLoader(hash, () => this.loadSettings(), '设置加载失败: ');
      },

      syncSettingsSplitLayout(hash) {
        const isDesktopSettings = hash === '#settings' && this.isDesktopViewport === true;
        this.isDesktopSettingsLayout = isDesktopSettings;
        if (!isDesktopSettings) return;
        this.contentScrollResetKey += 1;
        this.settingsScrollResetKey += 1;
      },

      normalizeSettingsExperienceMode(mode = 'novice') {
        return String(mode || '').trim().toLowerCase() === 'expert' ? 'expert' : 'novice';
      },

      isSettingsExpertMode() {
        return this.normalizeSettingsExperienceMode(this.settingsExperienceMode) === 'expert';
      },

      isSettingsTabVisible(id) {
        const tabId = String(id || '').trim();
        if (!tabId) return false;
        if (this.isSettingsExpertMode()) return true;
        return tabId !== 'proxy' && tabId !== 'cache' && tabId !== 'security';
      },

      getSettingsModeButtonClass(mode = 'novice') {
        const normalizedMode = this.normalizeSettingsExperienceMode(mode);
        const active = normalizedMode === this.normalizeSettingsExperienceMode(this.settingsExperienceMode);
        return active
          ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-slate-600 dark:bg-slate-800 dark:text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white';
      },

      setSettingsExperienceMode(mode = 'novice') {
        const nextMode = this.normalizeSettingsExperienceMode(mode);
        if (this.settingsExperienceMode === nextMode) return;
        this.settingsExperienceMode = nextMode;
        this.settingsForm = {
          ...this.settingsForm,
          settingsExperienceMode: nextMode
        };
        uiBrowserBridge.persistSettingsExperienceMode(nextMode);
        if (!this.isSettingsTabVisible(this.activeSettingsTab)) this.activeSettingsTab = 'ui';
        if (nextMode !== 'expert') this.logsPlaybackModeFilter = '';
        this.settingsScrollResetKey += 1;
      },

      getSettingsTabClass(id) {
        return this.activeSettingsTab === id
          ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-slate-600 dark:bg-slate-800 dark:text-white'
          : 'border-transparent bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:border-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:hover:text-white';
      },

      switchSetTab(id) {
        const nextTab = String(id || '').trim();
        if (!this.isSettingsTabVisible(nextTab)) return;
        if (!nextTab || this.activeSettingsTab === nextTab) return;
        this.activeSettingsTab = nextTab;
        this.settingsScrollResetKey += 1;
      },

      applyDashboardStatsState(data) {
         const requestTitle = [data.requestSourceText || '', data.cfAnalyticsDetail || ''].filter(Boolean).join(' | ');
         this.dashboardView.requests.count = String(data.requestCountDisplay || '').trim() || (data.todayRequests === null ? (String(data.requestSource || '').toLowerCase() === 'unconfigured' ? '未配置' : '暂不可用') : String(data.todayRequests || 0));
         this.dashboardView.requests.hint = data.requestSourceText || '今日请求量口径：未知';
         this.dashboardView.requests.title = requestTitle;
         this.dashboardView.requests.badges = this.buildDashboardBadges([
           this.getRequestSourceBadge(data),
           this.getStatsFreshnessBadge(data)
         ]);
         this.dashboardView.requests.embyMetrics = '请求: 播放请求 ' + (data.playCount || 0) + ' 次 | 获取播放信息 ' + (data.infoCount || 0) + ' 次';

         const trafficTitle = [data.trafficSourceText || '', data.cfAnalyticsStatus || '', data.cfAnalyticsError || '', data.cfAnalyticsDetail || ''].filter(Boolean).join(' | ');
         this.dashboardView.traffic.count = data.todayTraffic || '0 B';
         this.dashboardView.traffic.hint = data.trafficSourceText || data.cfAnalyticsStatus || data.cfAnalyticsError || ' ';
         this.dashboardView.traffic.title = trafficTitle;
         this.dashboardView.traffic.detail = [data.cfAnalyticsStatus, data.cfAnalyticsError, data.cfAnalyticsDetail].filter(Boolean).join('\\n') || ' ';
         this.dashboardView.traffic.badges = this.buildDashboardBadges([
           this.getTrafficStatusBadge(data),
           this.getStatsFreshnessBadge(data)
         ]);

         this.dashboardView.nodes.count = String(data.nodeCount || 0);
         this.dashboardView.nodes.meta = '统计时间：' + this.formatLocalDateTime(data.generatedAt);
         this.dashboardView.nodes.badges = this.buildDashboardBadges([
           { label: '节点索引: 已加载', tone: 'emerald' },
           this.getStatsFreshnessBadge(data)
         ]);
         this.dashboardSeries = Array.isArray(data.hourlySeries) ? data.hourlySeries : [];
      },

      applyDashboardErrorState(message) {
         this.dashboardView.requests.count = '0';
         this.dashboardView.requests.hint = '加载仪表盘失败';
         this.dashboardView.requests.title = '';
         this.dashboardView.requests.badges = this.buildDashboardBadges([{ label: '请求口径: 加载失败', tone: 'red' }]);
         this.dashboardView.requests.embyMetrics = '请求: 播放请求 0 次 | 获取播放信息 0 次';
         this.dashboardView.traffic.count = '0 B';
         this.dashboardView.traffic.hint = '加载仪表盘失败';
         this.dashboardView.traffic.title = '';
         this.dashboardView.traffic.detail = message || '未知错误';
         this.dashboardView.traffic.badges = this.buildDashboardBadges([{ label: '流量状态: 加载失败', tone: 'red' }]);
         this.dashboardView.nodes.count = '0';
         this.dashboardView.nodes.meta = '统计时间：不可用';
         this.dashboardView.nodes.badges = this.buildDashboardBadges([{ label: '节点索引: 未确认', tone: 'red' }]);
         this.dashboardSeries = [];
      },

      async loadDashboard() {
         const loadSeq = ++this.dashboardLoadSeq;
         const [statsResult, runtimeResult] = await Promise.allSettled([
           this.apiCall('getDashboardStats'),
           this.apiCall('getRuntimeStatus')
         ]);
         if (loadSeq !== this.dashboardLoadSeq) return;

         if (statsResult.status === 'fulfilled') {
           this.applyDashboardStatsState(statsResult.value);
         } else {
           this.applyDashboardErrorState(statsResult.reason?.message || '未知错误');
         }

         if (runtimeResult.status === 'fulfilled') {
           this.applyRuntimeStatusState(runtimeResult.value.status || {});
         } else {
           this.applyRuntimeStatusErrorState(runtimeResult.reason?.message || '未知错误');
         }
      },

      async loadSettings() {
          const [configRes, nodesRes, snapshotRes] = await Promise.all([
              this.apiCall('loadConfig'),
              this.apiCall('list').catch(() => ({ nodes: this.nodes || [] })),
              this.apiCall('getConfigSnapshots').catch(() => ({ snapshots: this.configSnapshots || [] }))
          ]);
          const cfg = configRes.config || { enableH2: false, enableH3: false, peakDowngrade: true, protocolFallback: true, sourceSameOriginProxy: true, forceExternalProxy: true };
          this.applyRuntimeConfig(cfg);
          if (Array.isArray(nodesRes.nodes)) this.applyNodesState(nodesRes.nodes);
          this.applyConfigSnapshotsState(snapshotRes.snapshots || []);

          this.applyConfigSectionToForm('ui', {
              ...cfg,
              settingsExperienceMode: this.settingsExperienceMode
          });
          this.applyConfigSectionToForm('proxy', cfg);
          this.normalizeSettingsNumberInputs();
          this.syncProxySettingsGuardrails();
          this.settingsDirectNodeSearch = '';
          this.syncSourceDirectNodesSelection(cfg.sourceDirectNodes || cfg.directSourceNodes || cfg.nodeDirectList || []);
          this.applyConfigSectionToForm('security', cfg);
          this.applyConfigSectionToForm('logs', cfg);
          this.applyConfigSectionToForm('account', cfg);
          return cfg;
      },

      applyRecommendedSettings(section, labelSection = section) {
          const recommended = RECOMMENDED_SECTION_VALUES[section];
          if (!recommended) return;
          const fieldKeys = this.getConfigPanelFieldKeys(labelSection, section);
          const nextRecommended = fieldKeys.length
            ? fieldKeys.reduce((acc, key) => {
                if (Object.prototype.hasOwnProperty.call(recommended, key)) acc[key] = recommended[key];
                return acc;
              }, {})
            : recommended;
          this.applyConfigSectionToForm(section, nextRecommended, { onlyPresent: true });
          this.normalizeSettingsNumberInputs();
          if (section === 'proxy') this.syncProxySettingsGuardrails();
          this.showMessage('推荐生产值已回填到表单，请确认后再点击保存。', { tone: 'success' });
      },

      async saveSettings(section, labelSection = section) {
          try {
              const res = await this.apiCall('loadConfig');
              const currentConfig = res.config || {};
              let newConfig = { ...currentConfig };
              const fieldKeys = this.getConfigPanelFieldKeys(labelSection, section);
              
              if (CONFIG_FORM_BINDINGS[section]) {
                  newConfig = { ...newConfig, ...this.collectConfigSectionFromForm(section, { fieldKeys }) };
                  if (section === 'proxy' && (!fieldKeys.length || fieldKeys.includes('sourceDirectNodes'))) {
                      newConfig.sourceDirectNodes = this.normalizeNodeNameList(this.settingsSourceDirectNodes);
                  }
              }

              const { sanitizedConfig, preview } = await this.prepareConfigChangePreview(section, currentConfig, newConfig, labelSection);
              if (!preview.hasChanges) {
                  this.showMessage(preview.message, { tone: 'info', modal: true });
                  return;
              }
              if (!await this.askConfirm(preview.message, { title: '保存设置', tone: 'warning', confirmText: '保存' })) return;

              const saveRes = await this.apiCall('saveConfig', { config: sanitizedConfig, meta: { section: labelSection, source: 'ui' } });
              await this.finalizePersistedSettings(saveRes.config || sanitizedConfig, {
                  successMessage: '设置已保存，立即生效',
                  partialSuccessPrefix: '设置已保存，但设置面板刷新失败: ',
                  refreshErrorLog: 'loadSettings after saveConfig failed'
              });
          } catch (err) {
              console.error('saveSettings failed', err);
              this.showMessage('设置保存失败: ' + (err?.message || '未知错误'), { tone: 'error', modal: true });
          }
      },
      
      async testTelegram() {
          const botToken = String(this.getEffectiveSettingValue('tgBotToken') || '').trim();
          const chatId = String(this.getEffectiveSettingValue('tgChatId') || '').trim();
          
          if (!botToken || !chatId) {
              this.showMessage("请先填写完整的 Telegram Bot Token 和 Chat ID！", { tone: 'warning' });
              return;
          }
          
          const res = await this.apiCall('testTelegram', { tgBotToken: botToken, tgChatId: chatId });
          if (res.success) {
              this.showMessage("测试通知已发送！请查看您的 Telegram 客户端。", { tone: 'success' });
          } else {
              this.showMessage("发送失败: " + (res.error?.message || "未知网络错误"), { tone: 'error', modal: true });
          }
      },
      
      async sendDailyReport() {
          try {
              const res = await this.apiCall('sendDailyReport');
              if (res.success) {
                  this.showMessage("日报已成功生成并发送到 Telegram！", { tone: 'success' });
              } else {
                  this.showMessage("发送失败: " + (res.error?.message || "未知网络错误"), { tone: 'error', modal: true });
              }
          } catch(e) {
              this.showMessage("发送失败: " + e.message, { tone: 'error', modal: true });
          }
      },

      async purgeCache() {
          const res = await this.apiCall('purgeCache');
          if (res.success) this.showMessage("边缘缓存已成功清空！", { tone: 'success' });
          else this.showMessage("清空失败: " + (res.error?.message || "请检查 Zone ID 和 Token"), { tone: 'error', modal: true });
      },

      async tidyKvData() {
          if (!await this.askConfirm('这会重建 sys:nodes_index、清洗 sys:theme，并删除遗留的 Cloudflare 仪表盘缓存与过期租约键。不会删除 node:* 节点实体，是否继续？', { title: '整理 KV 数据', tone: 'warning', confirmText: '开始整理' })) return;
          const res = await this.apiCall('tidyKvData');
          if (!res.success) {
              this.showMessage('整理失败: ' + (res.error?.message || '未知错误'), { tone: 'error', modal: true });
              return;
          }
          try {
              await this.loadSettings();
          } catch (refreshErr) {
              console.warn('loadSettings after tidyKvData failed', refreshErr);
          }
          const summary = res.summary || {};
          const extraLockText = summary.deletedExpiredScheduledLock ? '，并移除了 1 个过期租约' : '';
          const malformedText = summary.themeWasMalformed ? '；已重写异常的 sys:theme。' : '。';
          this.showMessage('KV 整理完成：重建 ' + (summary.rebuiltNodeCount || 0) + ' 个节点索引，清理 ' + (summary.deletedCacheKeyCount || 0) + ' 个缓存键' + extraLockText + malformedText, { tone: 'success', modal: true });
      },

	      async initLogsDbFromUi() {
	          try {
	              const res = await this.apiCall('initLogsDb');
	              this.showMessage(res?.ftsReady ? '日志表初始化完成，当前已检测到 FTS5 虚拟表' : '日志表初始化完成', { tone: 'success' });
	          } catch (err) {
	              console.error('initLogsDbFromUi failed', err);
	              this.showMessage('日志表初始化失败: ' + (err?.message || '未知错误'), { tone: 'error', modal: true });
	          }
	      },

	      async initLogsFtsFromUi() {
	          try {
	              const res = await this.apiCall('initLogsFts');
	              const migratedRows = Number(res?.migratedRows) || 0;
	              this.showMessage('FTS5 虚拟表初始化完成，已迁移 ' + migratedRows + ' 条历史日志', { tone: 'success', modal: true });
	          } catch (err) {
	              console.error('initLogsFtsFromUi failed', err);
	              this.showMessage('FTS5 初始化失败: ' + (err?.message || '未知错误'), { tone: 'error', modal: true });
	          }
	      },

	      async clearLogsFromUi() {
	          if (!await this.askConfirm('确定清空所有日志?', { title: '清空日志', tone: 'danger', confirmText: '清空' })) return;
	          try {
	              const res = await this.apiCall('clearLogs');
	              await this.loadLogs(1);
	              this.showMessage(res?.ftsRebuilt ? '日志已清空，并已同步重建 FTS 索引' : '日志已清空', { tone: 'success' });
	          } catch (err) {
	              console.error('clearLogsFromUi failed', err);
	              this.showMessage('日志清理失败: ' + (err?.message || '未知错误'), { tone: 'error', modal: true });
          }
      },

      async loadNodes() {
          const res = await this.apiCall('list');
          if(Array.isArray(res.nodes)) { this.applyNodesState(res.nodes); }
      },

      isNodePingPending(name) {
          const key = this.normalizeNodeKey(name);
          return this.nodePingPending?.[key] === true;
      },

      setNodePingPending(name, pending) {
          const key = this.normalizeNodeKey(name);
          if (!key) return;
          this.nodePingPending = {
            ...(this.nodePingPending || {}),
            [key]: pending === true
          };
      },

      async forceHealthCheck() {
          if (this.nodesHealthCheckPending) return;
          this.nodesHealthCheckPending = true;
          try {
            await this.checkAllNodesHealth();
          } finally {
            this.nodesHealthCheckPending = false;
          }
      },

      async checkSingleNodeHealth(name) {
          if (this.isNodePingPending(name)) return;
          this.setNodePingPending(name, true);
          try {
             const timeout = Number(this.getEffectiveSettingValue('pingTimeout')) || UI_DEFAULTS.pingTimeout;
             const res = await this.apiCall('pingNode', { ...this.buildActiveLinePingPayload(name), timeout, forceRefresh: true });
             if (res?.node) this.upsertNode(res.node);
          } catch(e) {
             this.updateNodeCardStatus(name, 9999);
          } finally {
             this.setNodePingPending(name, false);
          }
      },

      async checkAllNodesHealth() {
          const timeout = Number(this.getEffectiveSettingValue('pingTimeout')) || UI_DEFAULTS.pingTimeout;
          for(let n of this.nodes.slice()) {
             try {
                const res = await this.apiCall('pingNode', { ...this.buildActiveLinePingPayload(n), timeout, forceRefresh: true });
                if (res?.node) this.upsertNode(res.node);
             } catch(e) {
                this.updateNodeCardStatus(n.name, 9999);
             }
          }
      },
      
      updateNodeCardStatus(name, ms) {
          const normalizedName = this.normalizeNodeKey(name);
          const targetNode = this.nodes.find(node => this.normalizeNodeKey(node?.name) === normalizedName);
          if (!targetNode) return;
          const hydratedNode = this.hydrateNode(targetNode);
          const activeLine = this.getActiveNodeLine(hydratedNode);
          if (!activeLine) return;

          const nextLines = this.getNodeLines(hydratedNode).map(line => {
            if (line.id !== activeLine.id) return line;
            return {
              ...line,
              latencyMs: Number.isFinite(Number(ms)) ? Math.round(Number(ms)) : null,
              latencyUpdatedAt: new Date().toISOString()
            };
          });
          this.upsertNode({ ...hydratedNode, lines: nextLines, target: this.buildLegacyTargetFromLines(nextLines) });

          if (!normalizedName) return;
          if (ms > 300) this.nodeHealth[normalizedName] = (this.nodeHealth[normalizedName] || 0) + 1;
          else this.nodeHealth[normalizedName] = 0;
      },

      addHeaderRow(key = '', val = '') {
          const nextHeaders = Array.isArray(this.nodeModalForm.headers) ? this.nodeModalForm.headers.slice() : [];
          nextHeaders.push(createNodeModalHeaderRow(key, val));
          this.nodeModalForm = {
            ...this.nodeModalForm,
            headers: nextHeaders
          };
      },

      removeNodeHeaderRow(headerId) {
          this.nodeModalForm = {
            ...this.nodeModalForm,
            headers: (Array.isArray(this.nodeModalForm.headers) ? this.nodeModalForm.headers : []).filter(header => header.id !== headerId)
          };
      },

      showNodeModal(name='') {
        try {
          this.nodeModalSubmitting = false;
          this.nodeModalPingAllPending = false;
          this.nodeModalPingAllText = '一键测试延迟';
          this.clearNodeModalFeedback();
          this.clearNodeModalValidation();
          this.clearNodeLineDragState();

          let nextForm = createEmptyNodeModalForm();
          if (name) {
              const normalizedName = this.normalizeNodeKey(name);
              const foundNode = (Array.isArray(this.nodes) ? this.nodes : []).find(x => this.normalizeNodeKey(x?.name) === normalizedName);
              if (foundNode) {
                  const hydratedNode = this.hydrateNode(foundNode);
                  const displayName = String(foundNode.displayName || foundNode.name || '');
                  this.ensureNodeModalLines(hydratedNode.lines, hydratedNode.target);
                  nextForm = {
                    ...createEmptyNodeModalForm(),
                    originalName: String(foundNode.name || ''),
                    displayName,
                    name: String(foundNode.name || ''),
                    tag: String(foundNode.tag || ''),
                    tagColor: String(foundNode.tagColor || 'amber') || 'amber',
                    remark: String(foundNode.remark || ''),
                    secret: String(foundNode.secret || ''),
                    mediaAuthMode: normalizeNodeMediaAuthMode(foundNode.mediaAuthMode),
                    realClientIpMode: normalizeNodeRealClientIpMode(foundNode.realClientIpMode),
                    activeLineId: hydratedNode.activeLineId || this.nodeModalLines[0]?.id || '',
                    headers: normalizeNodeModalHeaderRows(foundNode.headers)
                  };
              } else {
                  this.ensureNodeModalLines();
                  nextForm.activeLineId = this.nodeModalLines[0]?.id || '';
                  nextForm.headers = [createNodeModalHeaderRow()];
                  this.showMessage('未找到对应节点数据，已为你打开新建节点面板。', { tone: 'warning' });
              }
          } else {
              this.ensureNodeModalLines();
              nextForm.activeLineId = this.nodeModalLines[0]?.id || '';
              nextForm.headers = [createNodeModalHeaderRow()];
          }

          this.reopenNodeModal(nextForm);
        } catch (error) {
          console.error('showNodeModal failed', error);
          this.showMessage('打开节点编辑面板失败: ' + (error?.message || '未知错误'), { tone: 'error', modal: true });
        }
      },

      closeNodeModal() {
        this.nodeModalOpen = false;
        this.nodeModalSubmitting = false;
        this.nodeModalPingAllPending = false;
        this.nodeModalPingAllText = '一键测试延迟';
        this.clearNodeModalFeedback();
        this.clearNodeModalValidation();
        this.clearNodeLineDragState();
      },

      captureNodeModalDraft() {
        return {
          form: JSON.parse(JSON.stringify(this.nodeModalForm || createEmptyNodeModalForm())),
          lines: JSON.parse(JSON.stringify(Array.isArray(this.nodeModalLines) ? this.nodeModalLines : [])),
          pathManual: this.nodeModalPathManual === true,
          lastDisplayName: String(this.nodeModalLastDisplayName || '')
        };
      },

      restoreNodeModalDraft(draft, options = {}) {
        const safeDraft = draft && typeof draft === 'object' ? draft : {};
        this.nodeModalSubmitting = false;
        this.nodeModalPingAllPending = false;
        this.nodeModalPingAllText = '一键测试延迟';
        this.clearNodeLineDragState();
        this.clearNodeModalValidation();
        this.nodeModalForm = safeDraft.form && typeof safeDraft.form === 'object'
          ? { ...createEmptyNodeModalForm(), ...safeDraft.form }
          : createEmptyNodeModalForm();
        this.ensureNodeModalLines(Array.isArray(safeDraft.lines) ? safeDraft.lines : [], this.nodeModalForm.target || '');
        this.nodeModalLastDisplayName = String(safeDraft.lastDisplayName || this.nodeModalForm.displayName || '');
        this.nodeModalPathManual = safeDraft.pathManual === true;
        this.syncNodeModalLinesState(this.nodeModalForm.activeLineId);
        this.nodeModalOpen = true;
        if (options.feedbackMessage) {
          this.setNodeModalFeedback(options.feedbackMessage, options.feedbackTone || 'error');
        } else {
          this.clearNodeModalFeedback();
        }
      },
      
      async saveNode() {
          if (this.nodeModalSubmitting) return;
          this.clearNodeModalFeedback();
          this.clearNodeModalValidation();
          let headersObj = {};
          const headerRows = Array.isArray(this.nodeModalForm.headers) ? this.nodeModalForm.headers : [];
          for (let i = 0; i < headerRows.length; i++) {
              const row = headerRows[i] || {};
              const k = String(row.key || '').trim();
              const v = String(row.value || '').trim();
              if(k) headersObj[k] = v;
          }

          const displayName = String(this.nodeModalForm.displayName || '').trim();
          const nodePath = this.normalizeNodePathInput(String(this.nodeModalForm.name || '').trim() || displayName);
          const tagColor = String(this.nodeModalForm.tagColor || 'amber') || 'amber';
          
	          const payload = {
	              originalName: String(this.nodeModalForm.originalName || ''),
	              name: nodePath,
	              displayName,
	              secret: String(this.nodeModalForm.secret || '').trim(),
	              mediaAuthMode: normalizeNodeMediaAuthMode(this.nodeModalForm.mediaAuthMode),
	              realClientIpMode: normalizeNodeRealClientIpMode(this.nodeModalForm.realClientIpMode),
	              tag: String(this.nodeModalForm.tag || '').trim(),
              tagColor,
              remark: String(this.nodeModalForm.remark || '').trim(),
              headers: headersObj
          };
          if (!payload.displayName) {
              this.setNodeModalFieldError('displayName', '请输入节点名称');
              this.setNodeModalFeedback('节点名称不能为空', 'warning');
              return;
          }
          if (!payload.name) {
              this.setNodeModalFieldError('name', '请输入节点路径');
              this.setNodeModalFeedback('节点路径不能为空', 'warning');
              return;
          }
          if (!this.validateNodePath(payload.name)) {
              this.setNodeModalFieldError('name', this.getNodePathRuleText());
              this.setNodeModalFeedback('节点路径格式无效，请使用单段小写路径', 'warning');
              return;
          }

          const normalizedLines = [];
          const invalidLineTargets = {};
          for (let index = 0; index < this.nodeModalLines.length; index++) {
              const rawLine = this.nodeModalLines[index] || {};
              const latencyMs = this.parseLatencyMs(rawLine.latencyMs);
              const defaultLineName = this.buildDefaultLineName(index);
              const rawLineName = String(rawLine.name || '').trim();
              const hasTargetInput = !!String(rawLine.target || '').trim();
              const hasCustomName = !!rawLineName && rawLineName !== defaultLineName;
              if (!hasTargetInput && !hasCustomName && latencyMs === null) continue;
              const target = this.normalizeSingleTarget(rawLine.target);
              if (!target) {
                  invalidLineTargets[String(rawLine.id || '')] = '请填写有效的 http/https 目标源站';
                  this.setNodeModalFieldError('lines', '请修正线路目标源站后再保存');
                  this.setNodeModalFieldError('lineTargetsMap', invalidLineTargets);
                  this.setNodeModalFeedback('每条线路都必须填写有效的 http/https 目标源站', 'warning');
                  return;
              }
              normalizedLines.push({
                  id: this.normalizeNodeKey(rawLine.id) || this.createLineId(),
                  name: rawLineName || defaultLineName,
                  target,
                  latencyMs,
                  latencyUpdatedAt: rawLine.latencyUpdatedAt || ''
              });
          }

          if (!normalizedLines.length) {
              this.setNodeModalFieldError('lines', '至少需要保留一条有效线路');
              this.setNodeModalFeedback('至少需要保留一条有效线路', 'warning');
              return;
          }
          payload.lines = normalizedLines;
          payload.activeLineId = this.resolveActiveLineId(this.nodeModalForm.activeLineId, normalizedLines);
          payload.target = this.buildLegacyTargetFromLines(normalizedLines);
          const modalDraft = this.captureNodeModalDraft();
          const affectedNames = Array.from(new Set([payload.originalName, payload.name].map(name => String(name || '').trim()).filter(Boolean)));
          const mutationId = this.markNodeMutation(affectedNames);
          const optimisticNode = this.hydrateNode(this.decorateNodeSyncState(payload, 'syncing'));
          this.upsertNode(optimisticNode, { previousName: payload.originalName });
          this.closeNodeModal();
          this.showMessage(payload.originalName ? '节点已在本地更新，正在同步到 KV...' : '节点已在本地创建，正在同步到 KV...', { tone: 'info' });
          try {
              const res = await this.apiCall('save', payload);
              if (!this.isNodeMutationCurrent(affectedNames, mutationId)) return;
              if (res?.node) {
                  this.upsertNode(res.node, { previousName: payload.originalName });
              } else {
                  this.upsertNode(payload, { previousName: payload.originalName });
              }
              this.showMessage(payload.originalName ? '节点已保存' : '节点已创建', { tone: 'success' });
          } catch (err) {
              console.error('saveNode failed', err);
              if (!this.isNodeMutationCurrent(affectedNames, mutationId)) return;
              const syncErrorDetail = String(err?.message || '未知错误');
              const errorMessage = '节点保存失败: ' + syncErrorDetail;
              try {
                  await this.loadNodes();
              } catch (rollbackErr) {
                  console.error('loadNodes rollback after save failed', rollbackErr);
                  const failedNode = this.decorateNodeSyncState(this.findNodeByAnyName(affectedNames) || payload, 'failed', syncErrorDetail);
                  this.upsertNode(failedNode, { previousName: payload.originalName });
                  this.restoreNodeModalDraft(modalDraft, {
                    feedbackMessage: errorMessage,
                    feedbackTone: 'error'
                  });
                  this.showMessage('节点保存失败，已保留本地卡片并标记失败原因；自动回滚也失败了，请检查网络后重试', { tone: 'error', modal: true });
                  return;
              }
              const rollbackNode = this.findNodeByAnyName([payload.originalName, payload.name]) || payload;
              this.upsertNode(this.decorateNodeSyncState(rollbackNode, 'failed', syncErrorDetail), { previousName: payload.originalName });
              this.restoreNodeModalDraft(modalDraft, {
                feedbackMessage: errorMessage,
                feedbackTone: 'error'
              });
              this.showMessage('后台保存失败，失败原因已同步到节点卡片', { tone: 'error' });
          }
      },
      
      async deleteNode(name) {
          if (!await this.askConfirm('删除节点后将立即同步到 KV，是否继续？', { title: '删除节点', tone: 'danger', confirmText: '删除' })) return;
          const normalizedName = this.normalizeNodeKey(name);
          const mutationId = this.markNodeMutation([name]);
          this.applyNodesState((Array.isArray(this.nodes) ? this.nodes : []).filter(n => this.normalizeNodeKey(n?.name) !== normalizedName), { syncSourceDirectNodes: false });

          try {
              await this.apiCall('delete', {name});
              this.reconcileSourceDirectNodesSelection({ allowedNames: this.nodes.map(node => node?.name) });
          } catch(err) {
              if (!this.isNodeMutationCurrent([name], mutationId)) return;
              await this.rollbackNodesState('后台删除节点失败: ' + err.message);
          }
      },
      
      formatRelativeTime(ts) {
          const diff = Math.floor((Date.now() - ts) / 60000);
          if (diff <= 0) return '刚刚';
          if (diff < 60) return diff + ' 分钟前';
          if (diff < 1440) return Math.floor(diff / 60) + ' 小时前';
          return Math.floor(diff / 1440) + ' 天前';
      },

      formatUtc8ExactTime(ts) {
          const time = Number(ts);
          if (!time) return '-';
          const date = new Date(time + 8 * 3600 * 1000);
          if (Number.isNaN(date.getTime())) return '-';
          const yyyy = date.getUTCFullYear();
          const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(date.getUTCDate()).padStart(2, '0');
          const hh = String(date.getUTCHours()).padStart(2, '0');
          const mi = String(date.getUTCMinutes()).padStart(2, '0');
          return 'UTC+8 ' + yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + mi;
      },
      
      updateTimeCones() {
          this.logTimeTick += 1;
      },

      getLogRelativeTime(ts) {
          return this.formatRelativeTime(ts);
      },

      getResourceCategoryBadge(path, category) {
          const p = String(path || "").toLowerCase();
          if (category === 'error') return { label: '请求报错', className: 'text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1.5 rounded-lg font-medium' };
          if (category === 'segment' || p.includes('.ts') || p.includes('.m4s')) return { label: '视频流分片', className: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-2 py-1.5 rounded-lg font-medium' };
          if (category === 'manifest' || p.includes('.m3u8') || p.includes('.mpd')) return { label: '播放列表', className: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 px-2 py-1.5 rounded-lg font-medium' };
          if (category === 'stream' || p.includes('.mp4') || p.includes('.mkv') || p.includes('/stream') || p.includes('download=true')) return { label: '视频数据', className: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-1.5 rounded-lg font-medium' };
          if (category === 'image' || p.includes('/images/') || p.includes('/emby/covers/') || p.includes('.jpg') || p.includes('.png')) return { label: '图片海报', className: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 px-2 py-1.5 rounded-lg font-medium' };
          if (category === 'subtitle' || p.includes('.srt') || p.includes('.vtt') || p.includes('.ass')) return { label: '字幕文件', className: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 px-2 py-1.5 rounded-lg font-medium' };
          if (category === 'prewarm') return { label: '连接预热', className: 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-500/10 px-2 py-1.5 rounded-lg font-medium' };
          if (category === 'websocket' || p.includes('websocket')) return { label: '长连接通讯', className: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 px-2 py-1.5 rounded-lg font-medium' };
          
          if (p.includes('/sessions/playing')) return { label: '播放状态同步', className: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 px-2 py-1.5 rounded-lg font-medium' };
          if (p.includes('/playbackinfo')) return { label: '播放信息获取', className: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 px-2 py-1.5 rounded-lg font-medium' };
          if (p.includes('/users/authenticate')) return { label: '用户认证', className: 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-500/10 px-2 py-1.5 rounded-lg font-medium' };
          if (p.includes('/items/') || p.includes('/shows/') || p.includes('/movies/') || p.includes('/users/')) return { label: '媒体元数据', className: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 px-2 py-1.5 rounded-lg font-medium' };
          
          return { label: '常规 API', className: 'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg font-medium' };
      },
      getPlaybackModeBadge(errorDetail) {
          const detail = String(errorDetail || '');
          const match = /Playback=(direct_play|direct_stream|transcode|unknown)/i.exec(detail);
          if (!match) return null;
          const mode = match[1].toLowerCase();
          const badgeMap = {
              direct_play: {
                  label: '直放',
                  className: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/15'
              },
              direct_stream: {
                  label: '直串',
                  className: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-500/15'
              },
              transcode: {
                  label: '转码',
                  className: 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-500/15'
              },
              unknown: {
                  label: '未知',
                  className: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700/60'
              }
          };
          const meta = badgeMap[mode] || badgeMap.unknown;
          return {
              label: 'Playback · ' + meta.label,
              className: 'px-2 py-1 rounded-lg text-[11px] font-semibold ' + meta.className
          };
      },
      getLogCategoryBadges(log) {
          return [
              this.getResourceCategoryBadge(log?.request_path, log?.category),
              this.getPlaybackModeBadge(log?.error_detail)
          ].filter(Boolean);
      },
      getLogStatusMeta(log) {
          const statusCode = Number(log?.status_code) || 0;
          if (statusCode < 400) {
              return {
                  text: String(statusCode || ''),
                  title: '',
                  className: ''
              };
          }
          const errMap = {
              400: 'Bad Request (请求无效或参数错误)',
              401: 'Unauthorized (未授权，客户端登录失败或缺少凭证)',
              403: 'Forbidden (拒绝访问：命中防火墙、IP黑名单或源站拒绝)',
              404: 'Not Found (目标不存在：节点未找到或上游路径错误)',
              405: 'Method Not Allowed (不允许的请求方法)',
              429: 'Too Many Requests (限流拦截：单 IP 请求过频)',
              500: 'Internal Server Error (源站或代理内部执行报错)',
              502: 'Bad Gateway (网关错误：源站宕机、地址无效或无法连通)',
              503: 'Service Unavailable (服务不可用：源站超载或维护)',
              504: 'Gateway Timeout (网关超时：目标源站无响应)',
              522: 'Connection Timed Out (CF 无法与您的源站建立 TCP 连接)'
          };
          let hint = errMap[statusCode] || ('HTTP 异常码: ' + statusCode);
          if (log?.error_detail) hint += '\\n[抓取详情] ' + log.error_detail;
          return {
              text: String(statusCode),
              title: hint,
              className: 'cursor-help border-b border-dashed border-red-400/70 pb-[1px]'
          };
	      },
	      getLogPathTitle(log) {
	          return log?.error_detail ? (String(log.request_path || '') + '\\n[诊断] ' + log.error_detail) : String(log?.request_path || '');
	      },
	      getRuntimeLogSearchMode() {
	          return normalizeLogSearchMode(this.runtimeConfig?.logSearchMode || UI_DEFAULTS.logSearchMode);
	      },
	      getSettingsLogSearchMode() {
	          return normalizeLogSearchMode(this.settingsForm?.logSearchMode || this.runtimeConfig?.logSearchMode || UI_DEFAULTS.logSearchMode);
	      },
	      getLogSearchInputPlaceholder() {
	          return this.getRuntimeLogSearchMode() === 'fts'
	            ? 'FTS 语法查询，如: transcode AND playback；状态码/IP 仍可直接输入'
	            : '搜索节点、IP、路径或状态码(如200)...';
	      },
	      getRuntimeLogSearchModeHint() {
	          if (this.getRuntimeLogSearchMode() === 'fts') {
	            return this.isSettingsExpertMode()
	              ? '当前搜索模式：FTS5 语法查询。支持布尔表达式、短语和前缀；首次启用前请先点击右上角“初始化 FTS5”。'
	              : '当前搜索模式：FTS5 语法查询。若需初始化 FTS5 或调整搜索模式，请先切换到高手模式。';
	          }
	          return '当前搜索模式：LIKE 模糊匹配。无需额外初始化，适合新手模式直接使用。';
	      },
	      getSettingsLogSearchModeHint() {
	          return this.getSettingsLogSearchMode() === 'fts'
	            ? '当前准备保存为 FTS5 语法查询。首次启用前请先到日志页点击“初始化 FTS5”，否则关键词搜索会直接报未初始化。'
	            : '当前准备保存为 LIKE 模糊匹配。兼容性最好，无需额外初始化虚拟表。';
	      },
	      getSettingsLogSearchModeButtonClass(mode = 'like') {
	          const active = normalizeLogSearchMode(mode) === this.getSettingsLogSearchMode();
	          return active
	            ? 'border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300'
	            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800';
	      },
	      setSettingsLogSearchMode(mode = 'like') {
	          this.settingsForm.logSearchMode = normalizeLogSearchMode(mode);
	      },
	      getGeoMode() {
	          return String(this.settingsForm?.geoMode || 'allowlist').trim().toLowerCase() === 'blocklist' ? 'blocklist' : 'allowlist';
	      },
	      setGeoMode(mode = 'allowlist') {
	          this.settingsForm.geoMode = String(mode || '').trim().toLowerCase() === 'blocklist' ? 'blocklist' : 'allowlist';
	      },
	      getGeoModeButtonClass(mode = 'allowlist') {
	          const normalizedMode = String(mode || '').trim().toLowerCase() === 'blocklist' ? 'blocklist' : 'allowlist';
	          const active = normalizedMode === this.getGeoMode();
	          if (!active) return 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800';
	          return normalizedMode === 'blocklist'
	            ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300'
	            : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300';
	      },
	      getLogsPlaybackFilterClass(mode = '') {
	          const active = String(mode || '') === String(this.logsPlaybackModeFilter || '');
	          return active
            ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800';
      },
      updateLogsPlaybackFilterButtons() {
          return this.logsPlaybackModeFilter;
      },
      setLogsPlaybackModeFilter(mode = '') {
          this.logsPlaybackModeFilter = String(mode || '').trim();
          this.loadLogs(1);
      },

      normalizeLogDateInputValue(value, fallbackValue = '') {
          const text = String(value || '').trim();
          return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(text) ? text : String(fallbackValue || '');
      },

      ensureLogDateRange() {
          const fallbackRange = getDefaultLogDateRange();
          let startDate = this.normalizeLogDateInputValue(this.logStartDate, fallbackRange.startDate);
          let endDate = this.normalizeLogDateInputValue(this.logEndDate, fallbackRange.endDate);
          if (!startDate) startDate = fallbackRange.startDate;
          if (!endDate) endDate = fallbackRange.endDate;
          if (startDate > endDate) startDate = endDate;
          this.logStartDate = startDate;
          this.logEndDate = endDate;
          return { startDate, endDate };
      },

      // ============================================================================
      // DNS 编辑：双模式草稿（CNAME / A）
      // ============================================================================
      isDnsTypeAllowed(type) {
          const upper = String(type || '').toUpperCase();
          return upper === 'A' || upper === 'AAAA' || upper === 'CNAME';
      },

      normalizeDnsHistoryEntries(entries = []) {
          const normalized = [];
          const seen = new Set();
          for (const rawEntry of Array.isArray(entries) ? entries : []) {
              const type = String(rawEntry?.type || '').trim().toUpperCase();
              const content = String(rawEntry?.content || '').trim();
              if (type !== 'CNAME' || !content) continue;
              const dedupeKey = type + '::' + content.toLowerCase();
              if (seen.has(dedupeKey)) continue;
              seen.add(dedupeKey);
              normalized.push({
                  id: String(rawEntry?.id || ''),
                  name: String(rawEntry?.name || '').trim(),
                  type,
                  content,
                  savedAt: String(rawEntry?.savedAt || rawEntry?.updatedAt || rawEntry?.createdAt || ''),
                  actor: String(rawEntry?.actor || 'admin').trim() || 'admin',
                  source: String(rawEntry?.source || 'ui').trim() || 'ui',
                  requestHost: String(rawEntry?.requestHost || '').trim().toLowerCase()
              });
              if (normalized.length >= this.dnsHistoryLimit) break;
          }
          return normalized;
      },

      formatDnsHistoryTimestamp(value) {
          if (!value) return '未记录';
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return String(value);
          return date.toLocaleString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'Asia/Shanghai'
          }).replace(',', '');
      },

      getDnsHistoryEntryKey(entry, index = 0) {
          return String(entry?.id || (
            'dns-history:' + String(entry?.type || '') + ':' + String(entry?.content || '') + ':' + String(entry?.savedAt || '') + ':' + String(index)
          ));
      },

      getDnsHistoryEntryTitle(entry) {
          if (!entry) return '';
          const titleLines = [
              String(entry.type || '').toUpperCase() + ' → ' + String(entry.content || ''),
              '保存时间：' + this.formatLocalDateTime(entry.savedAt),
              entry.requestHost ? ('站点：' + entry.requestHost) : '',
              entry.source ? ('来源：' + entry.source) : ''
          ].filter(Boolean);
          return titleLines.join('\\n');
      },

      isDnsHistoryEntryCurrent(entry) {
          if (!entry) return false;
          return normalizeDnsEditorMode(this.dnsEditMode) === 'cname'
            && String(this.dnsDraftCname?.content || '').trim().toLowerCase() === String(entry.content || '').trim().toLowerCase();
      },

      applyDnsHistoryEntry(entry) {
          if (!entry || this.dnsBatchSaving) return;
          this.switchDnsEditMode('cname');
          this.dnsDraftCname = this.normalizeDnsRecordForState({
            ...this.dnsDraftCname,
            type: 'CNAME',
            name: this.getDnsEditorHostLabel(),
            content: String(entry.content || '').trim()
          }, 'CNAME');
          this.updateDnsSaveAllButtonState();
          this.showToast('已回填历史 CNAME，点击保存即可生效', 'info', 1800);
      },

      getDnsHistoryCards() {
          return this.normalizeDnsHistoryEntries(this.dnsHistoryEntries).map((entry, index) => ({ entry, index }));
      },

      hasDnsHistoryCards() {
          return this.getDnsHistoryCards().length > 0;
      },

      getDnsHistoryCardClass(entry) {
          if (this.isDnsHistoryEntryCurrent(entry)) {
              return 'border-brand-200 bg-brand-50 text-brand-600 shadow-[0_6px_16px_rgba(59,130,246,0.08)] dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300';
          }
          return 'border-slate-200 bg-white/80 text-slate-700 hover:bg-brand-50/80 hover:border-brand-200 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-brand-500/10 dark:hover:border-brand-500/20';
      },

      getDnsRecommendedDomains() {
          return DNS_RECOMMENDED_CNAME_OPTIONS.slice();
      },

      canUseDnsRecommendedDomains() {
          return !!String(this.getDnsEditorHostLabel() || '').trim();
      },

      getDnsRecommendedDomainHint() {
          const hostLabel = this.getDnsEditorHostLabel();
          if (!hostLabel) return '当前站点未识别，暂时无法快捷回填 CNAME。';
          return '点击任一优选域名后，会自动切换到 CNAME 模式并回填 ' + hostLabel + ' 的 CNAME 内容，仍需点击“保存 DNS”后才会生效。';
      },

      getDnsRecommendedDomainClass(domain = '') {
          const normalizedDomain = String(domain || '').trim().toLowerCase();
          const currentContent = String(this.dnsDraftCname?.content || '').trim().toLowerCase();
          if (normalizedDomain && normalizedDomain === currentContent && normalizeDnsEditorMode(this.dnsEditMode) === 'cname') {
              return 'border-brand-200 bg-brand-50 text-brand-700 shadow-[0_6px_16px_rgba(59,130,246,0.08)] dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300';
          }
          return 'border-slate-200 bg-white/80 text-slate-700 hover:bg-brand-50/80 hover:border-brand-200 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-brand-500/10 dark:hover:border-brand-500/20';
      },

      applyDnsRecommendedDomain(domain = '') {
          const targetDomain = String(domain || '').trim();
          if (!targetDomain) return;
          if (!this.canUseDnsRecommendedDomains()) {
              this.showMessage('当前站点未识别，暂时无法快捷回填 CNAME。', { tone: 'warning', modal: true });
              return;
          }
          const previousMode = normalizeDnsEditorMode(this.dnsEditMode);
          const previousContent = String(this.dnsDraftCname?.content || '').trim().toLowerCase();
          this.switchDnsEditMode('cname');
          this.dnsDraftCname = this.normalizeDnsRecordForState({
            ...this.dnsDraftCname,
            type: 'CNAME',
            name: this.getDnsEditorHostLabel(),
            content: targetDomain
          }, 'CNAME');
          this.updateDnsSaveAllButtonState();
          if (previousMode === 'cname' && previousContent === targetDomain.toLowerCase()) {
              this.showToast(this.getDnsEditorHostLabel() + ' 的 CNAME 已经是 ' + targetDomain + '。', 'info', 1800);
              return;
          }
          if (this.isDnsHistoryEntryCurrent({ content: targetDomain })) {
              this.showToast(this.getDnsEditorHostLabel() + ' 的 CNAME 已回填为 ' + targetDomain + '，请点击保存。', 'info', 2200);
              return;
          }
          this.showToast(this.getDnsEditorHostLabel() + ' 的 CNAME 已回填为 ' + targetDomain + '，请点击保存。', 'info', 2200);
      },

      inferZoneNameFromRecordNames(names = []) {
          const normalized = (Array.isArray(names) ? names : [])
            .map(name => String(name || '').trim().toLowerCase())
            .filter(Boolean);
          if (!normalized.length) return '';

          const reversedPartsList = normalized
            .map(name => name.split('.').map(part => part.trim()).filter(Boolean).reverse())
            .filter(parts => parts.length > 0);
          if (!reversedPartsList.length) return '';

          let common = reversedPartsList[0].slice();
          for (let i = 1; i < reversedPartsList.length && common.length; i++) {
              const parts = reversedPartsList[i];
              let j = 0;
              while (j < common.length && j < parts.length && common[j] === parts[j]) j++;
              common = common.slice(0, j);
          }

          const zoneParts = common.slice().reverse();
          if (zoneParts.length < 2) return '';
          return zoneParts.join('.');
      },

      normalizeDnsRecordForState(record = {}, fallbackType = 'A') {
          const normalized = cloneDnsEditorDraftRecord({
            ...record,
            type: normalizeDnsDraftType(record?.type, fallbackType),
            name: String(record?.name || this.dnsCurrentHost || '').trim()
          }, fallbackType);
          if (!normalized.name) normalized.name = String(this.dnsCurrentHost || '').trim();
          return normalized;
      },

      cloneDnsRecordForState(record = {}, fallbackType = 'A') {
          return this.normalizeDnsRecordForState(record, fallbackType);
      },

      resetDnsDraftState() {
          this.dnsRecords = [];
          this.dnsEditMode = 'cname';
          this.dnsOriginalEditMode = 'cname';
          this.dnsDraftCname = createDnsEditorDraftRecord('CNAME');
          this.dnsOriginalCname = createDnsEditorDraftRecord('CNAME');
          this.dnsAddressDrafts = [createDnsEditorDraftRecord('A')];
          this.dnsOriginalAddressDrafts = [];
          this.dnsHistoryEntries = [];
      },

      getDnsEditorHostLabel() {
          return String(
            this.dnsCurrentHost
            || this.dnsDraftCname?.name
            || this.dnsAddressDrafts?.[0]?.name
            || this.dnsZone?.currentHost
            || ''
          ).trim();
      },

      getDnsEditModeButtonClass(mode = 'cname') {
          const normalizedMode = normalizeDnsEditorMode(mode);
          const active = normalizedMode === normalizeDnsEditorMode(this.dnsEditMode);
          if (!active) return 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800';
          return normalizedMode === 'a'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
            : 'border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300';
      },

      switchDnsEditMode(mode = 'cname') {
          const currentMode = normalizeDnsEditorMode(this.dnsEditMode);
          const nextMode = normalizeDnsEditorMode(mode);
          if (currentMode === nextMode) return;
          this.dnsEditMode = nextMode;
          if (nextMode === 'cname') {
              this.dnsDraftCname = this.normalizeDnsRecordForState({
                ...this.dnsDraftCname,
                type: 'CNAME',
                name: this.getDnsEditorHostLabel(),
                content: String(this.dnsDraftCname?.content || '').trim() || DNS_RECOMMENDED_CNAME_OPTIONS[0]
              }, 'CNAME');
          } else {
              this.ensureDnsAddressDrafts();
          }
          this.updateDnsSaveAllButtonState();
      },

      ensureDnsAddressDrafts(minCount = 1) {
          const drafts = (Array.isArray(this.dnsAddressDrafts) ? this.dnsAddressDrafts : [])
            .map(record => this.normalizeDnsRecordForState(record, record?.type || 'A'))
            .filter(record => record && (record.type === 'A' || record.type === 'AAAA'));
          while (drafts.length < Math.max(1, Number(minCount) || 1)) {
              drafts.push(this.normalizeDnsRecordForState({ type: 'A', name: this.getDnsEditorHostLabel() }, 'A'));
          }
          this.dnsAddressDrafts = drafts;
          return drafts;
      },

      addDnsAddressDraft(type = 'A') {
          if (this.dnsBatchSaving) return;
          this.ensureDnsAddressDrafts();
          this.dnsAddressDrafts.push(this.normalizeDnsRecordForState({ type, name: this.getDnsEditorHostLabel() }, type));
          this.updateDnsSaveAllButtonState();
      },

      canRemoveDnsAddressDraft() {
          return Array.isArray(this.dnsAddressDrafts) && this.dnsAddressDrafts.length > 1;
      },

      removeDnsAddressDraft(index = -1) {
          if (this.dnsBatchSaving) return;
          this.ensureDnsAddressDrafts();
          if (!this.canRemoveDnsAddressDraft()) {
              this.showToast('A 模式至少保留 1 条记录', 'info', 1800);
              return;
          }
          this.dnsAddressDrafts.splice(index, 1);
          this.ensureDnsAddressDrafts();
          this.updateDnsSaveAllButtonState();
      },

      getDnsComparableStateSignature(mode = this.dnsEditMode, cnameDraft = this.dnsDraftCname, addressDrafts = this.dnsAddressDrafts) {
          const normalizedMode = normalizeDnsEditorMode(mode);
          if (normalizedMode === 'cname') {
              return JSON.stringify({
                mode: 'cname',
                records: [{ type: 'CNAME', content: String(cnameDraft?.content || '').trim() }]
              });
          }
          const normalizedRecords = (Array.isArray(addressDrafts) ? addressDrafts : [])
            .map(record => ({
              type: normalizeDnsDraftType(record?.type, 'A'),
              content: String(record?.content || '').trim()
            }))
            .filter(record => record.content)
            .sort((left, right) => (left.type.localeCompare(right.type) || left.content.localeCompare(right.content)));
          return JSON.stringify({ mode: 'a', records: normalizedRecords });
      },

      hasDnsPendingChanges() {
          return this.getDnsComparableStateSignature(this.dnsEditMode, this.dnsDraftCname, this.dnsAddressDrafts)
            !== this.getDnsComparableStateSignature(this.dnsOriginalEditMode, this.dnsOriginalCname, this.dnsOriginalAddressDrafts);
      },

      getDnsModeHintText() {
          return normalizeDnsEditorMode(this.dnsEditMode) === 'a'
            ? 'A 模式可混合 A / AAAA，保存后会移除当前站点的 CNAME'
            : 'CNAME 模式只保留 1 条 CNAME，保存后会移除当前站点的 A / AAAA';
      },

      getDnsEditorFooterHint() {
          if (normalizeDnsEditorMode(this.dnsEditMode) === 'a') {
              return 'A 模式最少保留 1 条记录，可按需新增或删除 A / AAAA 条目。';
          }
          return '切换到 CNAME 模式后会默认回填 saas.sin.fan，也可直接点击下方推荐优选域名。';
      },

      updateDnsSaveAllButtonState() {
          const anySaving = this.dnsBatchSaving;
          const dirty = this.hasDnsPendingChanges();
          const mode = normalizeDnsEditorMode(this.dnsEditMode);
          return {
            dirtyCount: dirty ? 1 : 0,
            anySaving,
            disabled: anySaving || !dirty,
            title: anySaving
              ? '正在保存 DNS...'
              : dirty
                ? (mode === 'a' ? '将同步 A / AAAA 记录并移除当前站点的 CNAME' : '将同步 CNAME 记录并移除当前站点的 A / AAAA')
                : '没有可保存的变更'
          };
      },
      isDnsSaveAllDisabled() {
          return this.updateDnsSaveAllButtonState().disabled;
      },
      getDnsSaveAllTitle() {
          return this.updateDnsSaveAllButtonState().title;
      },
      getDnsSaveAllButtonText() {
          const state = this.updateDnsSaveAllButtonState();
          return state.anySaving ? '保存中...' : '保存 DNS';
      },

      isValidIpv4(value) {
          const v = String(value || '').trim();
          const parts = v.split('.');
          if (parts.length !== 4) return false;
          for (const part of parts) {
              if (!/^[0-9]{1,3}$/.test(part)) return false;
              const num = Number(part);
              if (!Number.isFinite(num) || num < 0 || num > 255) return false;
          }
          return true;
      },

      isValidIpv6(value) {
          const v = String(value || '').trim();
          if (!v) return false;
          if (!v.includes(':')) return false;
          if (/[\\s]/.test(v)) return false;
          try {
              new URL('http://[' + v + ']/');
              return true;
          } catch {
              return false;
          }
      },

      validateDnsRecordForSave(record, options = {}) {
          const type = String(record?.type || '').toUpperCase();
          const content = String(record?.content || '').trim();
          const allowCname = options.allowCname !== false;
          if (!this.isDnsTypeAllowed(type)) return 'Type 仅允许 A / AAAA / CNAME';
          if (!allowCname && type === 'CNAME') return 'A 模式仅允许 A / AAAA';
          if (!content) return 'Content 不能为空';
          if (type === 'A' && !this.isValidIpv4(content)) return 'A 记录 Content 必须是合法 IPv4 地址';
          if (type === 'AAAA' && !this.isValidIpv6(content)) return 'AAAA 记录 Content 必须是合法 IPv6 地址';
          if (type === 'CNAME') {
              if (/[\\s]/.test(content)) return 'CNAME 记录 Content 不能包含空格';
              if (content.length > 255) return 'CNAME 记录 Content 过长';
          }
          return '';
      },

      getDnsDraftPayload() {
          if (normalizeDnsEditorMode(this.dnsEditMode) === 'cname') {
              return [{
                type: 'CNAME',
                content: String(this.dnsDraftCname?.content || '').trim()
              }];
          }
          return (Array.isArray(this.dnsAddressDrafts) ? this.dnsAddressDrafts : [])
            .map(record => ({
              type: normalizeDnsDraftType(record?.type, 'A'),
              content: String(record?.content || '').trim()
            }))
            .filter(record => record.content);
      },

      validateDnsDraftsForSave() {
          if (!this.getDnsEditorHostLabel()) return '当前站点未识别，无法保存 DNS';
          if (normalizeDnsEditorMode(this.dnsEditMode) === 'cname') {
              return this.validateDnsRecordForSave({ type: 'CNAME', content: this.dnsDraftCname?.content || '' });
          }
          const records = this.getDnsDraftPayload();
          if (!records.length) return 'A 模式至少保留 1 条 A / AAAA 记录';
          for (const record of records) {
              const validationError = this.validateDnsRecordForSave(record, { allowCname: false });
              if (validationError) return validationError;
          }
          return '';
      },

      applyDnsResponse(res = {}) {
          const zoneName = res.zoneName || res.zone?.name || '';
          const zoneId = res.zoneId || res.zone?.id || '';
          this.dnsCurrentHost = String(res.currentHost || '').trim().toLowerCase();
          this.dnsTotalRecordCount = Math.max(0, Number(res.totalRecords) || 0);

          const rawRecords = Array.isArray(res.records) ? res.records : [];
          const inferredZoneName = zoneName ? String(zoneName || '') : this.inferZoneNameFromRecordNames(rawRecords.map(item => item?.name));
          const displayZoneName = String(inferredZoneName || zoneName || '').trim();
          const zoneText = displayZoneName ? displayZoneName : '未知域名';
          const visibleCount = rawRecords.length;
          const totalCount = this.dnsTotalRecordCount || visibleCount;
          this.dnsZoneHintText = '当前站点：' + (this.dnsCurrentHost || '未识别') + ' · Zone：' + zoneText + ' · 显示 ' + visibleCount + ' / ' + totalCount + ' 条';
          this.dnsEmptyText = this.dnsCurrentHost
            ? ('当前站点 ' + this.dnsCurrentHost + ' 暂无 A / AAAA / CNAME 记录，可直接选择模式后保存创建')
            : '暂无 DNS 记录';

          const records = rawRecords
            .map(item => this.normalizeDnsRecordForState(item, item?.type || 'A'))
            .filter(record => record && (record.id || record.name));
          records.sort((a, b) => (a.name.localeCompare(b.name) || a.type.localeCompare(b.type) || a.id.localeCompare(b.id) || a.content.localeCompare(b.content)));
          this.dnsRecords = records;
          this.dnsHistoryEntries = this.normalizeDnsHistoryEntries(res.history);

          const currentMode = normalizeDnsEditorMode(res.mode || (records.some(record => record.type === 'A' || record.type === 'AAAA') ? 'a' : 'cname'));
          const currentCname = records.find(record => record.type === 'CNAME')
            || this.normalizeDnsRecordForState({ type: 'CNAME', name: this.dnsCurrentHost, content: '' }, 'CNAME');
          const currentAddresses = records
            .filter(record => record.type === 'A' || record.type === 'AAAA')
            .map(record => this.normalizeDnsRecordForState(record, record.type));

          this.dnsOriginalEditMode = currentMode;
          this.dnsEditMode = currentMode;
          this.dnsOriginalCname = this.cloneDnsRecordForState(currentCname, 'CNAME');
          this.dnsDraftCname = this.cloneDnsRecordForState(currentCname, 'CNAME');
          this.dnsOriginalAddressDrafts = currentAddresses.map(record => this.cloneDnsRecordForState(record, record.type));
          this.dnsAddressDrafts = currentAddresses.length
            ? currentAddresses.map(record => this.cloneDnsRecordForState(record, record.type))
            : [this.normalizeDnsRecordForState({ type: 'A', name: this.dnsCurrentHost, content: '' }, 'A')];
          this.ensureDnsAddressDrafts();
          this.dnsZone = zoneId || displayZoneName ? { id: zoneId, name: displayZoneName, currentHost: this.dnsCurrentHost } : null;
          this.updateDnsSaveAllButtonState();
      },

      async loadDnsRecords() {
          const loadSeq = ++this.dnsLoadSeq;
          this.dnsZoneHintText = '当前站点：加载中...';
          this.dnsEmptyText = '正在加载当前站点 DNS 记录...';
          this.dnsCurrentHost = '';
          this.dnsTotalRecordCount = 0;

          try {
              const res = await this.apiCall('listDnsRecords');
              if (loadSeq !== this.dnsLoadSeq) return;
              this.applyDnsResponse(res);
          } catch (e) {
              if (loadSeq !== this.dnsLoadSeq) return;
              console.error('loadDnsRecords failed', e);
              this.dnsZoneHintText = '当前站点：加载失败（请检查 CF Zone ID、API 令牌权限）';
              this.resetDnsDraftState();
              this.dnsZone = null;
              this.dnsCurrentHost = '';
              this.dnsTotalRecordCount = 0;
              this.dnsEmptyText = 'DNS 记录加载失败';
              const message = e && e.message ? e.message : '未知错误';
              this.showMessage('DNS 记录加载失败: ' + message, { tone: 'error', modal: true });
          }
      },

      async saveAllDnsRecords() {
          if (!this.hasDnsPendingChanges()) {
              this.showMessage('没有需要保存的变更', { tone: 'info' });
              return;
          }

          const validationError = this.validateDnsDraftsForSave();
          if (validationError) {
              this.showMessage(validationError, { tone: 'warning', modal: true });
              return;
          }

          const isAddressMode = normalizeDnsEditorMode(this.dnsEditMode) === 'a';
          const confirmText = isAddressMode
            ? '确定保存当前站点的 A / AAAA 配置吗？保存后会移除该站点的 CNAME 记录。'
            : '确定保存当前站点的 CNAME 配置吗？保存后会移除该站点的 A / AAAA 记录。';
          if (!await this.askConfirm(confirmText, { title: '保存 DNS 变更', tone: 'warning', confirmText: '保存' })) return;

          this.dnsBatchSaving = true;
          this.updateDnsSaveAllButtonState();
          try {
              const res = await this.apiCall('saveDnsRecords', {
                host: this.getDnsEditorHostLabel(),
                mode: normalizeDnsEditorMode(this.dnsEditMode),
                records: this.getDnsDraftPayload()
              });
              this.applyDnsResponse(res);
              this.showMessage('DNS 保存成功', { tone: 'success' });
          } catch (e) {
              const message = e && e.message ? e.message : '未知错误';
              this.showMessage('DNS 保存失败: ' + message, { tone: 'error', modal: true });
          } finally {
              this.dnsBatchSaving = false;
              this.updateDnsSaveAllButtonState();
          }
      },

      async loadLogs(page = this.logPage) {
          const keyword = this.logSearchKeyword || '';
          const { startDate, endDate } = this.ensureLogDateRange();
          try {
	              const res = await this.apiCall('getLogs', {
	                page: page,
	                pageSize: 50,
	                filters: {
	                  keyword,
	                  searchMode: this.getRuntimeLogSearchMode(),
	                  playbackMode: this.logsPlaybackModeFilter || '',
	                  startDate,
	                  endDate
                }
              });
              if (res.logs) {
                  this.logPage = res.page;
                  this.logTotalPages = res.totalPages || 1;
                  this.logRows = res.logs;
                  return;
              }
          } catch (err) {
              this.logRows = [];
              this.logPage = 1;
              this.logTotalPages = 1;
              this.showMessage('日志加载失败: ' + (err?.message || '未知错误'), { tone: 'error', modal: true });
              return;
          }
          this.logRows = [];
      },

      changeLogPage(delta) {
          const newPage = this.logPage + delta;
          if(newPage >= 1 && newPage <= this.logTotalPages) {
              this.loadLogs(newPage);
          }
      },

      downloadJson(data, filename) {
          const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
          const url = uiBrowserBridge.createObjectUrl(blob);
          return this.triggerDownload(url, filename);
      },

      async readJsonFileFromInputEvent(event) {
          const input = event?.target && typeof event.target === 'object' ? event.target : null;
          const file = input?.files?.[0];
          if (!file) return null;
          try {
              const text = await file.text();
              return JSON.parse(text);
          } finally {
              if (input) input.value = '';
          }
      },

      async exportNodes() {
          this.downloadJson(this.nodes, \`emby_nodes_\${new Date().getTime()}.json\`);
      },

      async importNodes(event) {
          try {
              const data = await this.readJsonFileFromInputEvent(event);
              if (!data) return;
              const nodes = Array.isArray(data) ? data : (data.nodes || []);
              if(!nodes.length) {
                  this.showMessage('未找到有效的节点数据', { tone: 'warning' });
                  return;
              }
              await this.apiCall('import', {nodes});
              await this.loadNodes();
              this.showMessage('节点导入成功', { tone: 'success' });
          } catch(err) {
              console.error('importNodes failed', err);
              if (err instanceof SyntaxError) this.showMessage('文件解析失败', { tone: 'error' });
              else this.showMessage('节点导入失败: ' + (err?.message || '未知错误'), { tone: 'error', modal: true });
          }
      },

      async exportFull() {
          const res = await this.apiCall('exportConfig');
          if(res) this.downloadJson(res, \`emby_proxy_full_backup_\${new Date().getTime()}.json\`);
      },

      async exportSettings() {
          const res = await this.apiCall('exportSettings');
          if (res) this.downloadJson(res, \`emby_proxy_settings_\${new Date().getTime()}.json\`);
      },

      async importSettings(event) {
          try {
              const data = await this.readJsonFileFromInputEvent(event);
              if (!data) return;
              const importedConfig = data && typeof data === 'object' && !Array.isArray(data)
                ? ((data.config && typeof data.config === 'object' && !Array.isArray(data.config)) ? data.config : (data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings) ? data.settings : data))
                : null;
              if(!importedConfig || Array.isArray(importedConfig)) {
                this.showMessage('无效的设置备份文件', { tone: 'warning' });
                return;
              }
              const currentRes = await this.apiCall('loadConfig');
              const currentConfig = currentRes.config || {};
              const { sanitizedConfig, preview } = await this.prepareConfigChangePreview('all', currentConfig, importedConfig);
              if (!preview.hasChanges) {
                this.showMessage('导入文件与当前全局设置一致，无需导入。', { tone: 'info' });
                return;
              }
              const importMessage = preview.message.replace('即将保存「全部分区」以下变更：', '即将导入以下全局设置变更：') + '\\n\\n说明：导入会整体替换当前全局设置，未包含的字段会回退为默认值。';
              if (!await this.askConfirm(importMessage, { title: '导入全局设置', tone: 'warning', confirmText: '导入' })) return;
              const res = await this.apiCall('importSettings', { config: sanitizedConfig, meta: { source: 'settings_file' } });
              await this.finalizePersistedSettings(res.config || sanitizedConfig, {
                successMessage: '全局设置导入成功，已立即生效。',
                partialSuccessPrefix: '全局设置已导入，但设置面板刷新失败: ',
                refreshErrorLog: 'loadSettings after importSettings failed'
              });
          } catch(err) {
              console.error('importSettings failed', err);
              if (err instanceof SyntaxError) this.showMessage('文件解析失败', { tone: 'error' });
              else this.showMessage('全局设置导入失败: ' + (err?.message || '未知错误'), { tone: 'error', modal: true });
          }
      },

      async importFull(event) {
          try {
              const data = await this.readJsonFileFromInputEvent(event);
              if (!data) return;
              if(!data.config && !data.nodes) {
                this.showMessage('无效的备份文件', { tone: 'warning' });
                return;
              }
              const res = await this.apiCall('importFull', {config: data.config, nodes: data.nodes});
              this.applyRuntimeConfig(res.config || {});
              await Promise.all([
                this.loadNodes(),
                this.loadSettings()
              ]);
              this.showMessage('完整数据导入成功，已立即生效。', { tone: 'success' });
          } catch(err) {
              console.error('importFull failed', err);
              if (err instanceof SyntaxError) this.showMessage('文件解析失败', { tone: 'error' });
              else this.showMessage('完整数据导入失败: ' + (err?.message || '未知错误'), { tone: 'error', modal: true });
          }
      }
    });

    const ADMIN_UI_BOOTSTRAP = globalThis.__ADMIN_BOOTSTRAP__ && typeof globalThis.__ADMIN_BOOTSTRAP__ === 'object'
      ? globalThis.__ADMIN_BOOTSTRAP__
      : {};
    const ADMIN_PATH = String(ADMIN_UI_BOOTSTRAP.adminPath || (typeof window !== 'undefined' && window.location?.pathname) || '/admin');
    const ADMIN_LOGIN_PATH = String(ADMIN_UI_BOOTSTRAP.loginPath || (ADMIN_PATH === '/' ? '/login' : (ADMIN_PATH + '/login')));
    function renderUiBootstrapError(message) {
      if (typeof document === 'undefined') return;
      const target = document.getElementById('app') || document.body;
      if (!target) return;
      target.innerHTML = '<div class="min-h-screen flex items-center justify-center px-6 py-10"><div class="max-w-lg w-full rounded-[28px] border border-red-200 bg-white p-6 shadow-xl"><h1 class="text-xl font-bold text-slate-900">管理台初始化失败</h1><p class="mt-3 text-sm leading-6 text-slate-600">' + String(message || '未知错误') + '</p></div></div>';
    }
    if (typeof Vue === 'undefined') {
      renderUiBootstrapError('Vue 资源未加载完成，请检查当前网络到 CDN 的连通性。');
      throw new Error('Vue dependency missing');
    }

    const { createApp, defineComponent, reactive, onMounted, onBeforeUnmount, nextTick } = Vue;
    const AUTO_ANIMATE_CDN_URL = 'https://cdn.jsdelivr.net/npm/@formkit/auto-animate@0.9.0/index.mjs';
    function formatDateInputValue(date = new Date()) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }
    function getDefaultLogDateRange() {
      const end = new Date();
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      return {
        startDate: formatDateInputValue(start),
        endDate: formatDateInputValue(end)
      };
    }
    const DEFAULT_LOG_DATE_RANGE = getDefaultLogDateRange();
    let autoAnimateLoader = null;
    const autoAnimateControllers = new WeakMap();
    const lucideDirectiveTokens = new WeakMap();
    const trafficChartInstances = new WeakMap();
    const trafficChartSignatures = new WeakMap();
    const nodeLinesDragDirectiveStates = new WeakMap();

    function normalizeAutoAnimateOptions(value) {
      if (value === false) return false;
      if (value && typeof value === 'object') return value;
      return {};
    }

    async function ensureAutoAnimateFunction() {
      if (autoAnimateLoader) return autoAnimateLoader;
      autoAnimateLoader = import(AUTO_ANIMATE_CDN_URL)
        .then(module => module?.default || module?.autoAnimate || null)
        .catch(error => {
          console.error('autoAnimate import failed', error);
          return null;
        });
      return autoAnimateLoader;
    }

    async function bindAutoAnimate(element, value) {
      const options = normalizeAutoAnimateOptions(value);
      if (options === false || !element || autoAnimateControllers.has(element)) return;
      const autoAnimate = await ensureAutoAnimateFunction();
      if (typeof autoAnimate !== 'function') return;
      try {
        const controller = autoAnimate(element, options);
        autoAnimateControllers.set(element, controller || true);
      } catch (error) {
        console.error('autoAnimate init failed', error);
      }
    }

    function scheduleLucideIconsRender(element) {
      if (!element) return;
      const token = (lucideDirectiveTokens.get(element) || 0) + 1;
      lucideDirectiveTokens.set(element, token);
      uiBrowserBridge.queueTask(() => {
        if (lucideDirectiveTokens.get(element) !== token) return;
        uiBrowserBridge.renderLucideIcons({ root: element });
      });
    }

    function normalizeTrafficChartSeries(series) {
      if (Array.isArray(series) && series.length) {
        return series.map(item => ({
          label: String(item?.label || ''),
          total: Number.isFinite(Number(item?.total)) ? Number(item.total) : 0
        }));
      }
      return Array.from({ length: 24 }, (_, hour) => ({
        label: String(hour).padStart(2, '0') + ':00',
        total: 0
      }));
    }

    function getTrafficChartTheme(element) {
      return element?.closest('.dark') ? 'dark' : 'light';
    }

    function buildTrafficChartSignature(series, theme) {
      return JSON.stringify({
        theme,
        series: normalizeTrafficChartSeries(series)
      });
    }

    function buildTrafficChartConfig(series, theme) {
      const normalizedSeries = normalizeTrafficChartSeries(series);
      const isDarkTheme = theme === 'dark';
      const labelColor = isDarkTheme ? '#e2e8f0' : '#0f172a';
      const axisColor = isDarkTheme ? '#94a3b8' : '#64748b';
      const gridColor = isDarkTheme ? 'rgba(71, 85, 105, 0.35)' : 'rgba(148, 163, 184, 0.22)';
      return {
        type: 'line',
        data: {
          labels: normalizedSeries.map(item => item.label),
          datasets: [{
            label: '请求趋势',
            data: normalizedSeries.map(item => item.total),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 180
          },
          plugins: {
            legend: { display: false },
            tooltip: { displayColors: false }
          },
          scales: {
            y: {
              min: 0,
              suggestedMax: 10,
              ticks: {
                precision: 0,
                color: axisColor
              },
              title: {
                display: true,
                text: '请求总次数',
                color: labelColor
              },
              grid: {
                color: gridColor
              },
              border: {
                color: gridColor
              }
            },
            x: {
              ticks: {
                color: axisColor
              },
              title: {
                display: true,
                text: '小时（UTC+8）',
                color: labelColor
              },
              grid: {
                color: gridColor
              },
              border: {
                color: gridColor
              }
            }
          }
        }
      };
    }

    function syncTrafficChart(element, series) {
      if (!element) return;
      const ChartCtor = uiBrowserBridge.resolveChartConstructor();
      if (!ChartCtor) return;
      const theme = getTrafficChartTheme(element);
      const signature = buildTrafficChartSignature(series, theme);
      if (trafficChartSignatures.get(element) === signature) return;
      const context = element.getContext?.('2d');
      if (!context) return;
      const currentChart = trafficChartInstances.get(element);
      if (currentChart && typeof currentChart.destroy === 'function') {
        currentChart.destroy();
      }
      try {
        const chartInstance = new ChartCtor(context, buildTrafficChartConfig(series, theme));
        trafficChartInstances.set(element, chartInstance);
        trafficChartSignatures.set(element, signature);
      } catch (error) {
        console.error('traffic chart render failed', error);
      }
    }

    const uiBrowserBridge = {
      renderLucideIcons(opts = {}) {
        if (typeof window?.lucide === 'undefined') return;
        try {
          window.lucide.createIcons(opts);
        } catch (error) {
          console.error('lucide.createIcons failed', error);
        }
      },
      queueTask(callback) {
        if (typeof callback !== 'function') return;
        if (typeof queueMicrotask === 'function') {
          queueMicrotask(callback);
          return;
        }
        Promise.resolve().then(callback);
      },
      startTimer(callback, delay = 0) {
        return setTimeout(callback, Math.max(0, Number(delay) || 0));
      },
      clearTimer(timerId) {
        if (!timerId) return;
        clearTimeout(timerId);
      },
      startIntervalTimer(callback, delay = 0) {
        return setInterval(callback, Math.max(0, Number(delay) || 0));
      },
      clearIntervalTimer(timerId) {
        if (!timerId) return;
        clearInterval(timerId);
      },
      syncDialogVisibility(element, shouldOpen) {
        if (!element) return;
        if (shouldOpen) {
          if (element.open) return;
          if (typeof element.showModal === 'function') {
            try {
              element.showModal();
              return;
            } catch {}
          }
          element.open = true;
          return;
        }
        if (!element.open) return;
        if (typeof element.close === 'function') {
          try {
            element.close();
            return;
          } catch {}
        }
        element.open = false;
      },
      resetScrollPosition(element) {
        if (!element) return;
        this.queueTask(() => {
          element.scrollTop = 0;
        });
      },
      triggerDownload(element) {
        if (!element) return;
        this.queueTask(() => {
          element.click?.();
        });
      },
      async writeClipboard(text) {
        if (typeof navigator?.clipboard?.writeText === 'function') {
          await navigator.clipboard.writeText(String(text || ''));
          return;
        }
        throw new Error('CLIPBOARD_UNAVAILABLE');
      },
      createObjectUrl(blob) {
        return URL.createObjectURL(blob);
      },
      revokeObjectUrl(url) {
        try {
          URL.revokeObjectURL(String(url || ''));
        } catch {}
      },
      resolveChartConstructor() {
        return typeof window?.Chart === 'function'
          ? window.Chart
          : (typeof Chart === 'function' ? Chart : null);
      },
      readStoredTheme() {
        try {
          return localStorage.getItem(UI_STORAGE_KEYS.theme);
        } catch {
          return '';
        }
      },
      readStoredSettingsExperienceMode() {
        try {
          return localStorage.getItem(UI_STORAGE_KEYS.settingsExperienceMode);
        } catch {
          return '';
        }
      },
      resolveDarkTheme() {
        const savedTheme = this.readStoredTheme();
        if (savedTheme === 'light') return false;
        if (savedTheme === 'dark') return true;
        try {
          return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        } catch {
          return false;
        }
      },
      persistTheme(isDarkTheme) {
        try {
          localStorage.setItem(UI_STORAGE_KEYS.theme, isDarkTheme ? 'dark' : 'light');
        } catch {}
      },
      persistSettingsExperienceMode(mode) {
        const normalizedMode = String(mode || '').trim().toLowerCase() === 'expert' ? 'expert' : 'novice';
        try {
          localStorage.setItem(UI_STORAGE_KEYS.settingsExperienceMode, normalizedMode);
        } catch {}
      },
      readLocationOrigin() {
        return String(window?.location?.origin || '');
      },
      createMediaQueryList(query) {
        try {
          return window?.matchMedia?.(String(query || '')) || null;
        } catch {
          return null;
        }
      },
      bindMediaQueryChange(mediaQueryList, handler) {
        if (!mediaQueryList || typeof handler !== 'function') return () => {};
        if (typeof mediaQueryList.addEventListener === 'function') {
          mediaQueryList.addEventListener('change', handler);
          return () => mediaQueryList.removeEventListener('change', handler);
        }
        if (typeof mediaQueryList.addListener === 'function') {
          mediaQueryList.addListener(handler);
          return () => mediaQueryList.removeListener(handler);
        }
        return () => {};
      },
      readDesktopViewportMatch() {
        const mediaQueryList = this.createMediaQueryList('(min-width: 768px)');
        if (mediaQueryList) return mediaQueryList.matches === true;
        return Number(window?.innerWidth || 0) >= 768;
      },
      readHash(fallback = '#dashboard') {
        return String(window?.location?.hash || fallback || '#dashboard');
      },
      writeHash(hash) {
        if (!window?.location) return;
        window.location.hash = String(hash || '').trim() || '#dashboard';
      },
      replaceHash(hash) {
        if (!window?.location) return;
        const nextHash = String(hash || '').trim() || '#dashboard';
        try {
          const basePath = String(window.location.pathname || '') + String(window.location.search || '');
          if (typeof window.history?.replaceState === 'function') {
            window.history.replaceState(window.history.state, '', basePath + nextHash);
            return;
          }
        } catch {}
        window.location.hash = nextHash;
      },
      bindHashChange(handler) {
        if (typeof window?.addEventListener !== 'function' || typeof handler !== 'function') {
          return () => {};
        }
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
      },
      attachDebugApp(appState) {
        if (!window) return;
        window.App = appState;
      },
      detachDebugApp(appState) {
        if (!window || window.App !== appState) return;
        try {
          delete window.App;
        } catch {
          window.App = undefined;
        }
      },
      bindElementEvents(element, listeners = {}) {
        if (!element || !listeners || typeof listeners !== 'object') return () => {};
        const entries = Object.entries(listeners).filter(([, handler]) => typeof handler === 'function');
        for (const [eventName, handler] of entries) {
          element.addEventListener(eventName, handler);
        }
        return () => {
          for (const [eventName, handler] of entries) {
            element.removeEventListener(eventName, handler);
          }
        };
      }
    };

    const nodeLineDragAdapter = {
      normalizeValue(value) {
        return value && typeof value === 'object' ? value : {};
      },
      isInteractiveTarget(target) {
        return !!target?.closest?.('[data-node-line-interactive="1"]');
      },
      resolveRowElement(target) {
        return target?.closest?.('[data-node-line-row="1"]') || null;
      },
      resolveLineId(element) {
        return String(element?.dataset?.lineId || '').trim();
      },
      resolveDropPlacement(element, clientY) {
        if (!element || !Number.isFinite(clientY) || typeof element.getBoundingClientRect !== 'function') return 'before';
        const rect = element.getBoundingClientRect();
        return clientY >= rect.top + (rect.height / 2) ? 'after' : 'before';
      },
      bind(element, value) {
        const state = {
          value: this.normalizeValue(value),
          dragBlocked: false,
          cleanup: null
        };

        const handlers = {
          mousedown: (event) => {
            state.dragBlocked = this.isInteractiveTarget(event?.target);
          },
          dragstart: (event) => {
            const app = state.value?.app;
            const row = this.resolveRowElement(event?.target);
            const lineId = this.resolveLineId(row);
            if (!app || !row || !lineId || app.isDesktopNodeLineDragEnabled?.() !== true) return;
            if (state.dragBlocked) {
              state.dragBlocked = false;
              event?.preventDefault?.();
              return;
            }
            state.dragBlocked = false;
            app.nodeLineDragId = lineId;
            app.nodeLineDropHint = null;
            if (event?.dataTransfer) {
              event.dataTransfer.effectAllowed = 'move';
              try { event.dataTransfer.setData('text/plain', lineId); } catch {}
            }
          },
          dragover: (event) => {
            const app = state.value?.app;
            const row = this.resolveRowElement(event?.target);
            const lineId = this.resolveLineId(row);
            if (!app || !row || !lineId || !app.nodeLineDragId || app.nodeLineDragId === lineId) return;
            event?.preventDefault?.();
            if (event?.dataTransfer) event.dataTransfer.dropEffect = 'move';
            const placement = this.resolveDropPlacement(row, event?.clientY);
            const prevHint = app.nodeLineDropHint;
            if (!prevHint || prevHint.lineId !== lineId || prevHint.placement !== placement) {
              app.nodeLineDropHint = { lineId, placement };
            }
          },
          drop: (event) => {
            const app = state.value?.app;
            const row = this.resolveRowElement(event?.target);
            const lineId = this.resolveLineId(row);
            if (!app || !row || !lineId) return;
            event?.preventDefault?.();
            if (!app.nodeLineDragId || app.nodeLineDragId === lineId) {
              app.clearNodeLineDragState?.();
              return;
            }
            const placement = app.nodeLineDropHint?.lineId === lineId
              ? app.nodeLineDropHint.placement
              : this.resolveDropPlacement(row, event?.clientY);
            app.moveNodeLineTo?.(app.nodeLineDragId, lineId, placement);
            app.clearNodeLineDragState?.();
          },
          dragend: () => {
            const app = state.value?.app;
            state.dragBlocked = false;
            if (!app?.nodeLineDragId && !app?.nodeLineDropHint) return;
            app.clearNodeLineDragState?.();
          }
        };

        state.cleanup = uiBrowserBridge.bindElementEvents(element, handlers);
        nodeLinesDragDirectiveStates.set(element, state);
      },
      update(element, value) {
        const state = nodeLinesDragDirectiveStates.get(element);
        if (!state) {
          this.bind(element, value);
          return;
        }
        state.value = this.normalizeValue(value);
      },
      unbind(element) {
        const state = nodeLinesDragDirectiveStates.get(element);
        nodeLinesDragDirectiveStates.delete(element);
        state?.value?.app?.clearNodeLineDragState?.();
        if (typeof state?.cleanup === 'function') state.cleanup();
      }
    };

    function focusAndSelectInputElement(element) {
      if (!element) return;
      nextTick(() => {
        try {
          element.focus?.({ preventScroll: true });
        } catch {
          element.focus?.();
        }
        element.select?.();
      });
    }

    const dialogVisibleDirective = {
      mounted(element, binding) {
        uiBrowserBridge.syncDialogVisibility(element, binding.value === true);
      },
      updated(element, binding) {
        if (binding.value === binding.oldValue && !!element.open === (binding.value === true)) return;
        uiBrowserBridge.syncDialogVisibility(element, binding.value === true);
      }
    };

    const scrollResetDirective = {
      mounted(element) {
        uiBrowserBridge.resetScrollPosition(element);
      },
      updated(element, binding) {
        if (binding.value === binding.oldValue) return;
        uiBrowserBridge.resetScrollPosition(element);
      }
    };

    const autoFocusSelectDirective = {
      mounted(element, binding) {
        if (binding.value === true) focusAndSelectInputElement(element);
      },
      updated(element, binding) {
        if (binding.value !== true || binding.oldValue === true) return;
        focusAndSelectInputElement(element);
      }
    };

    const autoDownloadDirective = {
      updated(element, binding) {
        const nextValue = binding.value && typeof binding.value === 'object' ? binding.value : {};
        const prevValue = binding.oldValue && typeof binding.oldValue === 'object' ? binding.oldValue : {};
        if (!nextValue.href) return;
        if (String(nextValue.key || '') === String(prevValue.key || '')) return;
        uiBrowserBridge.triggerDownload(element);
      }
    };

    const autoAnimateDirective = {
      mounted(element, binding) {
        bindAutoAnimate(element, binding.value);
      },
      updated(element, binding) {
        if (binding.value === false) return;
        if (!autoAnimateControllers.has(element)) bindAutoAnimate(element, binding.value);
      },
      unmounted(element) {
        const controller = autoAnimateControllers.get(element);
        autoAnimateControllers.delete(element);
        if (controller && typeof controller.disable === 'function') controller.disable();
      }
    };

    const lucideIconsDirective = {
      mounted(element) {
        scheduleLucideIconsRender(element);
      },
      updated(element) {
        scheduleLucideIconsRender(element);
      }
    };

    const trafficChartDirective = {
      mounted(element, binding) {
        syncTrafficChart(element, binding.value);
      },
      updated(element, binding) {
        syncTrafficChart(element, binding.value);
      },
      unmounted(element) {
        const currentChart = trafficChartInstances.get(element);
        trafficChartInstances.delete(element);
        trafficChartSignatures.delete(element);
        if (currentChart && typeof currentChart.destroy === 'function') {
          currentChart.destroy();
        }
      }
    };

    const nodeLinesDragDirective = {
      mounted(element, binding) {
        nodeLineDragAdapter.bind(element, binding.value);
      },
      updated(element, binding) {
        nodeLineDragAdapter.update(element, binding.value);
      },
      unmounted(element) {
        nodeLineDragAdapter.unbind(element);
      }
    };

    const CopyButton = defineComponent({
      name: 'CopyButton',
      props: {
        text: { type: String, default: '' },
        label: { type: String, default: '复制' }
      },
      data() {
        return { copied: false };
      },
      methods: {
        async copyText() {
          try {
            await uiBrowserBridge.writeClipboard(this.text);
            this.copied = true;
            uiBrowserBridge.startTimer(() => { this.copied = false; }, 1200);
          } catch (error) {
            console.error('copyText failed', error);
          }
        }
      },
      template: '#tpl-copy-button'
    });

    const NodeCard = defineComponent({
      name: 'NodeCard',
      components: { 'copy-button': CopyButton },
      props: {
        node: {
          type: Object,
          default: () => ({})
        },
        app: {
          type: Object,
          required: true
        }
      },
      data() {
        return {
          revealLink: false
        };
      },
      computed: {
        hydratedNode() {
          const nextNode = this.app.hydrateNode(this.node);
          return nextNode && typeof nextNode === 'object' ? nextNode : {};
        },
        displayName() {
          return String(this.hydratedNode.displayName || this.hydratedNode.name || '');
        },
        link() {
          return this.app.buildNodeLink(this.hydratedNode);
        },
        activeLine() {
          return this.app.getActiveNodeLine(this.hydratedNode);
        },
        activeLineName() {
          return this.activeLine?.name || '未启用线路';
        },
        lineCount() {
          return this.app.getNodeLines(this.hydratedNode).length;
        },
        syncState() {
          return this.app.normalizeNodeKey(this.hydratedNode._syncState || '');
        },
        isSyncing() {
          return this.syncState === 'syncing';
        },
        syncError() {
          return String(this.hydratedNode._syncError || '').trim();
        },
        hasSyncFailure() {
          return this.syncState === 'failed' && !!this.syncError;
        },
        remarkValue() {
          return String(this.hydratedNode.remark || '').trim();
        },
        hasTag() {
          return String(this.hydratedNode.tag || '').trim().length > 0;
        },
        tagToneClass() {
          const tagPillPalette = {
            amber: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100',
            emerald: 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-100',
            sky: 'border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-900 dark:text-sky-100',
            violet: 'border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-900 dark:text-violet-100',
            rose: 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-900 dark:text-rose-100',
            slate: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          };
          const tagColorKey = this.app.normalizeNodeKey(this.hydratedNode.tagColor || '');
          const toneKey = this.hasTag ? (tagPillPalette[tagColorKey] ? tagColorKey : 'amber') : 'slate';
          return tagPillPalette[toneKey] || tagPillPalette.amber;
        },
        statusMeta() {
          return this.app.getNodeLatencyMeta(this.activeLine?.latencyMs, this.app.getNodeHealthCount(this.hydratedNode.name));
        },
        pingPending() {
          return this.app.isNodePingPending(this.hydratedNode.name);
        },
        latencyTitle() {
          return this.activeLine?.latencyUpdatedAt ? ('最近测速：' + this.app.formatLocalDateTime(this.activeLine.latencyUpdatedAt)) : '尚未测速';
        }
      },
      methods: {
        toggleLinkVisibility() {
          this.revealLink = !this.revealLink;
        },
        async pingNode() {
          const nodeName = String(this.hydratedNode.name || '').trim();
          if (!nodeName) return;
          await this.app.checkSingleNodeHealth(nodeName);
        },
        editNode() {
          const nodeName = String(this.hydratedNode.name || '').trim();
          if (!nodeName) return;
          this.app.showNodeModal(nodeName);
        },
        async deleteNode() {
          const nodeName = String(this.hydratedNode.name || '').trim();
          if (!nodeName) return;
          await this.app.deleteNode(nodeName);
        }
      },
      template: '#tpl-node-card'
    });

    const RootApp = defineComponent({
      name: 'RootApp',
      components: { 'node-card': NodeCard },
      template: '#tpl-app',
      setup() {
        const appState = reactive(UiBridge);
        let timeConeTimer = null;
        let unbindDesktopViewportChange = null;
        let unbindHashRouteChange = null;
        uiBrowserBridge.attachDebugApp(appState);
        const handleHashChange = () => {
          const nextHash = uiBrowserBridge.readHash(appState.currentHash || '#dashboard');
          if (String(nextHash || '') === String(appState.currentHash || '')) return;
          Promise.resolve(appState.handleExternalHashNavigation(nextHash)).catch(err => {
            console.error('hash route change failed', err);
            uiBrowserBridge.replaceHash(appState.currentHash || '#dashboard');
            appState.showMessage('页面切换失败: ' + (err?.message || '未知错误'), { tone: 'error' });
          });
        };
        const handleDesktopViewportChange = (event) => {
          appState.syncViewportState(appState.getCurrentRouteHash(), event?.matches === true);
        };

        onMounted(async () => {
          try {
            const initialConfigRes = await appState.apiCall('loadConfig');
            appState.applyRuntimeConfig(initialConfigRes.config || {});
          } catch (e) {
            const message = e?.message || '未知错误';
            if (message !== 'LOGIN_CANCELLED') appState.showMessage('身份验证失败或网络异常: ' + message, { tone: 'error', modal: true });
            return;
          }

          try {
            appState.init();
            timeConeTimer = uiBrowserBridge.startIntervalTimer(() => appState.updateTimeCones(), 60000);
            unbindHashRouteChange = uiBrowserBridge.bindHashChange(handleHashChange);
            const desktopViewportQuery = uiBrowserBridge.createMediaQueryList('(min-width: 768px)');
            if (desktopViewportQuery) {
              appState.syncViewportState(appState.getCurrentRouteHash(), desktopViewportQuery.matches);
              unbindDesktopViewportChange = uiBrowserBridge.bindMediaQueryChange(desktopViewportQuery, handleDesktopViewportChange);
            } else {
              appState.syncViewportState(appState.getCurrentRouteHash());
            }
          } catch (e) {
            console.error('UI 初始化错误:', e);
          }
        });

        onBeforeUnmount(() => {
          if (timeConeTimer) {
            uiBrowserBridge.clearIntervalTimer(timeConeTimer);
            timeConeTimer = null;
          }
          appState.clearToastTimer();
          appState.clearThemeTransitionTimer();
          if (typeof unbindHashRouteChange === 'function') {
            unbindHashRouteChange();
            unbindHashRouteChange = null;
          }
          if (typeof unbindDesktopViewportChange === 'function') {
            unbindDesktopViewportChange();
            unbindDesktopViewportChange = null;
          }
          appState.revokeDownloadUrl();
          uiBrowserBridge.detachDebugApp(appState);
        });

        return { App: appState };
      }
    });

    const app = createApp(RootApp);
    app.directive('dialog-visible', dialogVisibleDirective);
    app.directive('scroll-reset', scrollResetDirective);
    app.directive('auto-focus-select', autoFocusSelectDirective);
    app.directive('auto-download', autoDownloadDirective);
    app.directive('auto-animate', autoAnimateDirective);
    app.directive('lucide-icons', lucideIconsDirective);
    app.directive('traffic-chart', trafficChartDirective);
    app.directive('node-lines-drag', nodeLinesDragDirective);
    app.mount('#app');
    globalThis.__ADMIN_UI_BOOTED__ = true;
    if (globalThis.__ADMIN_UI_DEPENDENCY_TIMEOUT__) clearTimeout(globalThis.__ADMIN_UI_DEPENDENCY_TIMEOUT__);
  </script>
</body>
</html>`;

// ============================================================================
// 6. 运行时入口 (RUNTIME ENTRYPOINTS)
// 说明：
// - `fetch` 负责 UI / API / 代理主入口分发。
// - `scheduled` 负责日志清理与日报等定时任务。
// ============================================================================
function renderAdminPage(env, initHealth = buildInitHealth(env)) {
  const adminPath = getAdminPath(env);
  const bootstrap = {
    adminPath,
    loginPath: getAdminLoginPath(env),
    initHealth
  };
  const html = UI_HTML
    .replace("__ADMIN_BOOTSTRAP_JSON__", () => serializeInlineJson(bootstrap))
    .replace('<div id="app" v-cloak></div>', () => `${buildInitHealthBannerHtml(initHealth)}\n  <div id="app" v-cloak></div>`);
  const headers = new Headers({ 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-store, max-age=0' });
  applySecurityHeaders(headers);
  return new Response(html, { headers });
}

function renderLandingPage(env, initHealth = buildInitHealth(env)) {
  const adminPath = getAdminPath(env);
  const initBanner = initHealth.ok
    ? ''
    : `<div class="mb-4 rounded-2xl border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-left text-amber-100">
        <div class="text-sm font-semibold">系统未初始化</div>
        <div class="mt-1 text-xs leading-5 text-amber-50/90">缺少关键环境变量：${initHealth.missing.map(item => escapeHtml(item)).join('、')}</div>
      </div>`;
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Emby Proxy V18.7</title>
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <main class="min-h-screen flex items-center justify-center px-6 py-12">
    <section class="max-w-3xl w-full rounded-[32px] border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden">
      <div class="grid gap-0 md:grid-cols-[1.1fr,0.9fr]">
        <div class="p-8 md:p-10 text-left">
          ${initBanner}
          <div class="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase text-brand-300">Headless Edge Relay</div>
          <h1 class="mt-5 text-3xl md:text-4xl font-bold text-white leading-tight">Emby Proxy V18.7</h1>
          <p class="mt-4 text-sm md:text-base leading-7 text-slate-300">为了极致优化视频代理的性能，当前根路径默认只保留一个无头（Headless）数据中继站；真正的管理界面、节点控制和 DNS 运维都收敛到单独的管理台入口。</p>
          <p class="mt-3 text-sm md:text-base leading-7 text-slate-400">如果你现在需要配置节点、查看运行状态或调整 Cloudflare 相关参数，请直接访问 <span class="font-semibold text-white">${escapeHtml(adminPath)}</span>。</p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="${escapeHtml(adminPath)}" class="inline-flex items-center justify-center rounded-2xl border border-brand-400/70 bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-950/20 transition hover:border-brand-300 hover:bg-brand-700">访问 ${escapeHtml(adminPath)}</a>
            <a href="https://github.com/axuitomo/CF-EMBY-PROXY-UI" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition">查看项目说明</a>
          </div>
        </div>
        <div class="border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/80 p-8 md:p-10 text-left">
          <div class="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div class="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">Routing Notes</div>
            <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>• 根路径仅提供静态说明页，不承载实时配置数据。</li>
              <li>• \`${escapeHtml(adminPath)}\` 下发 SaaS 控制台骨架，动态数据继续走 \`POST ${escapeHtml(adminPath)}\` API。</li>
              <li>• 媒体代理、日志与 KV / D1 逻辑保持原 Worker 主链路不变。</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;
  const headers = new Headers({ 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' });
  applySecurityHeaders(headers);
  headers.set('X-Frame-Options', 'DENY');
  return new Response(html, { headers });
}

function buildEdgeCorsResponse(dynamicCors, body, status = 200, options = {}) {
  const headers = new Headers(dynamicCors);
  applySecurityHeaders(headers);
  if (options.mergeOriginVary === true && headers.get("Access-Control-Allow-Origin") !== "*") {
    mergeVaryHeader(headers, "Origin");
  }
  return new Response(body, { status, headers });
}

function isLegacyAdminLoginRoute(routeContext) {
  return routeContext.adminPathLower === "/admin"
    && routeContext.pathnameLower === "/api/auth/login"
    && routeContext.root === "api"
    && routeContext.segments[1] === "auth"
    && routeContext.segments[2] === "login";
}

function isAdminPreflightRoute(routeContext) {
  return pathnameMatchesPrefix(routeContext.pathnameLower, routeContext.adminPathLower)
    || routeContext.pathnameLower === routeContext.adminLoginPathLower
    || isLegacyAdminLoginRoute(routeContext);
}

function buildFetchRouteContext(request, env) {
  const initHealth = warnInitHealthOnce(env);
  const dynamicCors = getCorsHeadersForResponse(env, request);
  const requestUrl = new URL(request.url);
  const normalizedPathname = sanitizeProxyPath(requestUrl.pathname);
  const pathnameLower = normalizedPathname.toLowerCase();
  const adminPath = getAdminPath(env);
  const adminPathLower = adminPath.toLowerCase();
  const adminLoginPath = getAdminLoginPath(env);
  const adminLoginPathLower = adminLoginPath.toLowerCase();
  let segments;
  try {
    segments = normalizedPathname.split("/").filter(Boolean);
  } catch {
    return {
      errorResponse: buildEdgeCorsResponse(dynamicCors, "Bad Request", 400)
    };
  }
  const rootRaw = segments[0] || "";
  const root = safeDecodeSegment(rootRaw).toLowerCase();
  return {
    initHealth,
    dynamicCors,
    requestUrl,
    normalizedPathname,
    pathnameLower,
    adminPath,
    adminPathLower,
    adminLoginPath,
    adminLoginPathLower,
    segments,
    rootRaw,
    root
  };
}

async function resolveProxyRouteContext(routeContext, env, ctx, request) {
  if (!routeContext.root) return null;
  const nodeData = await Database.getNode(routeContext.root, env, ctx);
  if (!nodeData) return null;

  const secret = nodeData.secret;
  let valid = true;
  let prefixLen = 0;

  if (secret) {
    const secretRaw = routeContext.segments[1] || "";
    if (safeDecodeSegment(secretRaw) === secret) {
      prefixLen = 1 + routeContext.rootRaw.length + 1 + secretRaw.length;
    } else {
      valid = false;
    }
  } else {
    prefixLen = 1 + routeContext.rootRaw.length;
  }

  if (!valid) return null;

  let remaining = routeContext.normalizedPathname.substring(prefixLen);
  if (remaining === "" && !routeContext.normalizedPathname.endsWith("/")) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = routeContext.normalizedPathname + "/";
    const headers = new Headers({ Location: redirectUrl.toString(), "Cache-Control": "no-store" });
    applySecurityHeaders(headers);
    const redirectStatus = (request.method === "GET" || request.method === "HEAD") ? 301 : 307;
    return {
      response: new Response(null, { status: redirectStatus, headers })
    };
  }
  if (remaining === "") remaining = "/";
  return {
    nodeData,
    secret,
    remaining: sanitizeProxyPath(remaining)
  };
}

async function handleWorkerFetch(request, env, ctx) {
  const routeContext = buildFetchRouteContext(request, env);
  if (routeContext.errorResponse) return routeContext.errorResponse;

  if (request.method === "GET" && routeContext.normalizedPathname === "/") {
    return renderLandingPage(env, routeContext.initHealth);
  }

  if (request.method === "GET" && routeContext.pathnameLower === routeContext.adminPathLower) {
    return renderAdminPage(env, routeContext.initHealth);
  }

  if (request.method === "OPTIONS" && isAdminPreflightRoute(routeContext)) {
    return buildEdgeCorsResponse(routeContext.dynamicCors, null, 200, { mergeOriginVary: true });
  }

  if (request.method === "POST" && (
    routeContext.pathnameLower === routeContext.adminLoginPathLower
    || isLegacyAdminLoginRoute(routeContext)
  )) {
    return Auth.handleLogin(request, env);
  }

  if (request.method === "POST" && routeContext.pathnameLower === routeContext.adminPathLower) {
    if (!(await Auth.verifyRequest(request, env))) return jsonError("UNAUTHORIZED", "未授权", 401);
    try {
      return await normalizeJsonApiResponse(await Database.handleApi(request, env, ctx));
    } catch (e) {
      return jsonError("INTERNAL_ERROR", "Server Error", 500, { reason: e?.message || "unknown_error" });
    }
  }

  const proxyRoute = await resolveProxyRouteContext(routeContext, env, ctx, request);
  if (proxyRoute?.response) return proxyRoute.response;
  if (proxyRoute?.nodeData) {
    return Proxy.handle(request, proxyRoute.nodeData, proxyRoute.remaining, routeContext.root, proxyRoute.secret, env, ctx, {
      requestUrl: routeContext.requestUrl
    });
  }

  return buildEdgeCorsResponse(routeContext.dynamicCors, "Not Found", 404, { mergeOriginVary: true });
}

export default {
  async fetch(request, env, ctx) {
    return handleWorkerFetch(request, env, ctx);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      const db = Database.getDB(env);
      const kv = Database.getKV(env);
      if (!kv) return;
      const runtimeConfig = await getRuntimeConfig(env);
      const scheduledLeaseMs = clampIntegerConfig(runtimeConfig?.scheduledLeaseMs, Config.Defaults.ScheduledLeaseMs, Config.Defaults.ScheduledLeaseMinMs, 15 * 60 * 1000);
      const leaseToken = `${nowMs()}-${Math.random().toString(36).slice(2, 10)}`;
      const lease = await Database.tryAcquireScheduledLease(kv, { token: leaseToken, leaseMs: scheduledLeaseMs });
      if (!lease.acquired) {
        await Database.patchOpsStatus(env, {
          scheduled: {
            lastSkippedAt: new Date().toISOString(),
            lastSkipReason: lease.reason || "lease_not_acquired",
            lock: {
              status: "busy",
              reason: lease.reason || "lease_not_acquired",
              expiresAt: lease.lock?.expiresAt || null
            }
          }
        }).catch(() => {});
        return;
      }

      const leaseState = {
        active: true,
        lostReason: null,
        lock: lease.lock || null
      };
      const renewLease = async () => {
        if (!leaseState.active) return null;
        const renewed = await Database.renewScheduledLease(kv, leaseToken, scheduledLeaseMs);
        if (!renewed) {
          leaseState.active = false;
          leaseState.lostReason = leaseState.lostReason || "lease_lost";
          return null;
        }
        leaseState.lock = renewed;
        return renewed;
      };
      const ensureLeaseActive = async () => {
        if (!leaseState.active) throw new Error(leaseState.lostReason || "scheduled_lease_lost");
        const renewed = await renewLease();
        if (!renewed) throw new Error(leaseState.lostReason || "scheduled_lease_lost");
        return renewed;
      };
      const leaseRefreshIntervalMs = Math.max(5000, Math.min(Math.floor(scheduledLeaseMs / 3), 60000));
      const waitForLeaseRefreshWindow = async () => {
        let remainingMs = leaseRefreshIntervalMs;
        while (leaseState.active && remainingMs > 0) {
          const sliceMs = Math.min(remainingMs, 1000);
          await sleepMs(sliceMs);
          remainingMs -= sliceMs;
        }
      };
      const leaseKeepalive = (async () => {
        while (leaseState.active) {
          await waitForLeaseRefreshWindow();
          if (!leaseState.active) break;
          await renewLease();
        }
      })().catch(() => {
        leaseState.active = false;
        leaseState.lostReason = leaseState.lostReason || "lease_renew_failed";
      });

      const startedAt = new Date().toISOString();
      await Database.patchOpsStatus(env, {
        scheduled: {
          status: "running",
          lastStartedAt: startedAt,
          lock: {
            status: "held",
            token: leaseToken,
            expiresAt: leaseState.lock?.expiresAt || (nowMs() + scheduledLeaseMs)
          }
        }
      }).catch(() => {});

      const scheduledState = {
        status: "success",
        lastStartedAt: startedAt,
        lastFinishedAt: null,
        lastSuccessAt: null,
        lastErrorAt: null,
        lastError: null,
        cleanup: {},
        kvTidy: {},
        report: {},
        alerts: {}
      };

      try {
        const config = runtimeConfig || {};
        const previousScheduledStatus = await Database.getOpsStatusSection(env, "scheduled").catch(() => ({}));
        
	        if (db) {
	          try {
	            await ensureLeaseActive();
	            await Database.ensureLogsBaseSchema(db);
	            const rawRetentionDays = Number(config.logRetentionDays);
            const retentionDays = Number.isFinite(rawRetentionDays)
              ? Math.min(Config.Defaults.LogRetentionDaysMax, Math.max(1, Math.floor(rawRetentionDays)))
              : Config.Defaults.LogRetentionDays;
            const expireTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
            const hasExpiredLogs = !!(await db.prepare(`SELECT 1 as hit FROM ${Database.LOGS_TABLE} WHERE timestamp < ? LIMIT 1`).bind(expireTime).first())?.hit;
            if (hasExpiredLogs) {
              await db.prepare(`DELETE FROM ${Database.LOGS_TABLE} WHERE timestamp < ?`).bind(expireTime).run();
            }
            const previousCleanupStatus = previousScheduledStatus?.cleanup && typeof previousScheduledStatus.cleanup === "object"
              ? previousScheduledStatus.cleanup
              : {};
            let ftsRebuildStatus = "skipped";
            let ftsRebuildError = null;
            let lastFtsRebuildAt = typeof previousCleanupStatus.lastFtsRebuildAt === "string" ? previousCleanupStatus.lastFtsRebuildAt : "";
            let ftsRebuildRecovered = false;
            if (hasExpiredLogs && await Database.hasLogsFtsTable(db)) {
              if (Database.shouldRunLogsFtsRebuild(lastFtsRebuildAt)) {
                await ensureLeaseActive();
                try {
                  await Database.rebuildLogsFts(db);
                  ftsRebuildStatus = "success";
                  lastFtsRebuildAt = new Date().toISOString();
                } catch (ftsRebuildErr) {
                  try {
                    await ensureLeaseActive();
                    await Database.ensureLogsFtsSchema(db, { forceRecreate: true });
                    ftsRebuildStatus = "success";
                    ftsRebuildRecovered = true;
                    ftsRebuildError = null;
                    lastFtsRebuildAt = new Date().toISOString();
                    console.warn("Scheduled FTS rebuild recovered by recreating schema.");
                  } catch (ftsRepairErr) {
                    ftsRebuildStatus = "failed";
                    ftsRebuildError = ftsRepairErr?.message || ftsRebuildErr?.message || String(ftsRepairErr || ftsRebuildErr);
                    scheduledState.status = "partial_failure";
                    console.error("Scheduled FTS rebuild Error: ", ftsRebuildErr);
                    console.error("Scheduled FTS recovery Error: ", ftsRepairErr);
                  }
                }
              } else {
                ftsRebuildStatus = "deferred";
              }
            }
            let optimizeStatus = "skipped";
            let optimizeError = null;
            const previousLastOptimizeAt = typeof previousCleanupStatus.lastOptimizeAt === "string" ? previousCleanupStatus.lastOptimizeAt : "";
            let lastOptimizeAt = previousLastOptimizeAt || (typeof previousCleanupStatus.lastVacuumAt === "string" ? previousCleanupStatus.lastVacuumAt : "");
            if (hasExpiredLogs && Database.shouldRunLogsOptimize(lastOptimizeAt)) {
              await ensureLeaseActive();
              try {
                await Database.optimizeLogsDb(db);
                optimizeStatus = "success";
                lastOptimizeAt = new Date().toISOString();
              } catch (optimizeErr) {
                optimizeStatus = "failed";
                optimizeError = optimizeErr?.message || String(optimizeErr);
                scheduledState.status = "partial_failure";
                console.error("Scheduled DB optimize Error: ", optimizeErr);
              }
            }
            const cleanupError = optimizeError || ftsRebuildError || "";
            const cleanupHadFailure = optimizeStatus === "failed" || ftsRebuildStatus === "failed";
            const didCleanupWork = hasExpiredLogs || optimizeStatus === "success" || ftsRebuildStatus === "success";
            const cleanupStatus = cleanupHadFailure ? "partial_failure" : (didCleanupWork ? "success" : "skipped");
            const cleanupFinishedAt = new Date().toISOString();
            scheduledState.cleanup = {
              status: cleanupStatus,
              lastSuccessAt: didCleanupWork ? cleanupFinishedAt : "",
              lastSkippedAt: cleanupStatus === "skipped" ? cleanupFinishedAt : "",
              lastErrorAt: cleanupHadFailure ? cleanupFinishedAt : "",
              lastError: cleanupHadFailure ? cleanupError : "",
              retentionDays,
              ftsRebuildStatus,
              ftsRebuildRecovered,
              lastFtsRebuildAt,
              ftsRebuildError,
              optimizeStatus,
              lastOptimizeAt,
              optimizeError
            };
            await ensureLeaseActive();
          } catch (dbErr) {
            scheduledState.status = "partial_failure";
            scheduledState.cleanup = {
              status: "failed",
              lastErrorAt: new Date().toISOString(),
              lastError: dbErr?.message || String(dbErr)
            };
            console.error("Scheduled DB Cleanup Error: ", dbErr);
          }
        } else {
          scheduledState.cleanup = {
            status: "skipped",
            lastSkippedAt: new Date().toISOString(),
            reason: "db_not_configured"
          };
        }

        const previousKvTidyState = previousScheduledStatus?.kvTidy && typeof previousScheduledStatus.kvTidy === "object"
          ? previousScheduledStatus.kvTidy
          : {};
        scheduledState.kvTidy = {
          ...previousKvTidyState,
          mode: "manual_only",
          lastAutoSkipAt: new Date().toISOString(),
          autoSkipReason: "manual_only"
        };
        
        const { tgBotToken, tgChatId } = config;
        if (tgBotToken && tgChatId) {
            try {
              await ensureLeaseActive();
              await Database.sendDailyTelegramReport(env);
              scheduledState.report = {
                status: "success",
                lastSuccessAt: new Date().toISOString()
              };
            } catch (reportErr) {
              scheduledState.status = scheduledState.status === "success" ? "partial_failure" : scheduledState.status;
              scheduledState.report = {
                status: "failed",
                lastErrorAt: new Date().toISOString(),
                lastError: reportErr?.message || String(reportErr)
              };
              console.error("Scheduled Daily Report Error: ", reportErr);
            }
        } else {
          scheduledState.report = {
            status: "skipped",
            lastSkippedAt: new Date().toISOString(),
            reason: "telegram_not_configured"
          };
        }

        try {
          await ensureLeaseActive();
          const alertResult = await Database.maybeSendRuntimeAlerts(env, scheduledState);
          scheduledState.alerts = alertResult.sent
            ? {
                status: "success",
                lastSuccessAt: new Date().toISOString(),
                issueCount: Number(alertResult.issueCount) || 0
              }
            : {
                status: "skipped",
                lastSkippedAt: new Date().toISOString(),
                reason: alertResult.reason || "no_alerts"
              };
        } catch (alertErr) {
          scheduledState.status = scheduledState.status === "success" ? "partial_failure" : scheduledState.status;
          scheduledState.alerts = {
            status: "failed",
            lastErrorAt: new Date().toISOString(),
            lastError: alertErr?.message || String(alertErr)
          };
          console.error("Scheduled Alert Error: ", alertErr);
        }
      } catch (err) {
          scheduledState.status = "failed";
          scheduledState.lastErrorAt = new Date().toISOString();
          scheduledState.lastError = err?.message || String(err);
          console.error("Scheduled Task Error: ", err);
      } finally {
          leaseState.active = false;
          await leaseKeepalive.catch(() => {});
          const finishedAt = new Date().toISOString();
          scheduledState.lastFinishedAt = finishedAt;
          if (scheduledState.status === "success") scheduledState.lastSuccessAt = finishedAt;
          const released = leaseState.lostReason ? false : await Database.releaseScheduledLease(kv, leaseToken).catch(() => false);
          scheduledState.lock = leaseState.lostReason
            ? {
                status: "lost",
                reason: leaseState.lostReason,
                lastCheckedAt: finishedAt
              }
            : {
                status: released ? "released" : "release_skipped",
                releasedAt: finishedAt
              };
          await Database.patchOpsStatus(env, { scheduled: scheduledState }).catch(() => {});
      }
    })());
  }
};
