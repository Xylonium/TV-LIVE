class TTLMap extends Map {
  set(key, value, ttlMs = 8000) {
    let t = Math.max(1, Number(ttlMs) || 1);
    if (
      typeof key === "string" &&
      (key.startsWith("lineban:") || key.includes(":line:"))
    ) {
      t = Math.max(
        t,
        Math.max(60000, Number(Config?.Defaults?.LineBanMs || 300000)),
      );
    }
    super.set(key, { value, exp: Date.now() + t });
    return this;
  }
  get(key) {
    const hit = super.get(key);
    if (!hit || Date.now() > hit.exp) {
      super.delete(key);
      return undefined;
    }
    return hit.value;
  }
}
const GLOBALS = {
  NodeCache: new TTLMap(),
  NodeHostIndexCache: new TTLMap(),
  NodeHostIndexInflight: new Map(),
  NodeListCache: new TTLMap(),
  NodeListInflight: new Map(),
  AuthFail: new TTLMap(),
  LineCursor: new Map(),
  LineBan: new TTLMap(),
  ProgressThrottle: new TTLMap(),
  PlaybackRangeDedup: new TTLMap(),
  _lastCleanupAt: 0,
  KeepaliveTableReady: false,
  ProxyKvReady: false,
  Regex: {
    StaticExt:
      /\.(jpg|jpeg|gif|png|svg|ico|webp|js|css|woff2?|ttf|otf|map|webmanifest|srt|ass|vtt|sub)$/i,
    EmbyImages: /(\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i,
    Streaming: /\.(mp4|m4v|m4s|m4a|ogv|webm|mkv|mov|avi|wmv|flv|ts|m3u8|mpd)$/i,
  },
};
const Config = {
  Defaults: {
    CacheTTL: 10000,
    ListCacheTTL: 180000,
    MaxRetryBodyBytes: 32 * 1024 * 1024,
    FetchTimeoutMs: 12000,
    MediaTryTimeoutMs: 6000,
    LineBanMs: 300000,
    ImageCacheTtl: 2592000,
    StaticCacheTtl: 604800,
    ProgressThrottleMs: 1200,
  },
};
function toBool(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0 || v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}
const FIXED_PROXY_RULES = {
  FORCE_EXTERNAL_PROXY: false,
  PAN_302_DIRECT: false,
  PRESERVE_PAN_HEADERS: true,
  WANGPAN_REFERER: "",
  WANGPAN_KEYWORDS: [
    "aliyundrive",
    "alipan",
    "quark",
    "baidupcs",
    "pan.baidu.com",
    "115.com",
    "123684.com",
    "uc.cn",
    "drive.google.com",
    "googleusercontent.com",
    "1drv.ms",
    "onedrive.live.com",
    "sharepoint.com",
  ],
};
const DIRECT_RULES = {
  ADAPTERS: [
    {
      name: "tianyi",
      keywords: ["cloud.189.cn", "189.cn", "ctyun", "e.189.cn", "ctyunxs.cn"],
      forceProxy: false,
      referer: "https://cloud.189.cn/",
      keepOrigin: false,
      keepReferer: false,
    },
    {
      name: "115",
      keywords: ["115.com", "anxia.com", "115cdn"],
      forceProxy: false,
      referer: "",
      keepOrigin: false,
      keepReferer: false,
    },
    {
      name: "pikpak",
      keywords: ["mypikpak.com", "pikpak"],
      forceProxy: false,
      referer: "",
      keepOrigin: false,
      keepReferer: false,
    },
    {
      name: "aliyun",
      keywords: ["aliyundrive", "alipan"],
      forceProxy: false,
      referer: "",
      keepOrigin: false,
      keepReferer: false,
    },
    {
      name: "quark",
      keywords: ["quark", "uc.cn"],
      forceProxy: false,
      referer: "",
      keepOrigin: false,
      keepReferer: false,
    },
    {
      name: "baidu",
      keywords: ["pan.baidu.com", "baidupcs"],
      forceProxy: false,
      referer: "",
      keepOrigin: false,
      keepReferer: false,
    },
    {
      name: "google-drive",
      keywords: [
        "drive.google.com",
        "googleusercontent.com",
        "googledrive",
        "gvt1.com",
      ],
      forceProxy: false,
      referer: "",
      keepOrigin: false,
      keepReferer: false,
    },
    {
      name: "onedrive",
      keywords: [
        "onedrive.live.com",
        "1drv.ms",
        "sharepoint.com",
        "sharepoint-df.com",
      ],
      forceProxy: false,
      referer: "",
      keepOrigin: false,
      keepReferer: false,
    },
    {
      name: "generic-pan",
      keywords: ["123684.com"],
      forceProxy: false,
      referer: "",
      keepOrigin: false,
      keepReferer: false,
    },
  ],
};
function getKV(env) {
  const db = env.EMBY_D1 || env.D1 || env.DB;
  if (!db) return null;
  return {
    async get(key, opts = {}) {
      const row = await db
        .prepare("SELECT v FROM proxy_kv WHERE k = ?1")
        .bind(String(key))
        .first();
      if (!row) return null;
      const val = row.v;
      if (opts && opts.type === "json") {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      }
      return val;
    },
    async put(key, value) {
      const k = String(key);
      const v = typeof value === "string" ? value : JSON.stringify(value);
      const now = Date.now();
      await db
        .prepare(
          `
        INSERT INTO proxy_kv (k, v, updated_at)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(k) DO UPDATE SET
          v = excluded.v,
          updated_at = excluded.updated_at
      `,
        )
        .bind(k, v, now)
        .run();
    },
    async delete(key) {
      await db
        .prepare("DELETE FROM proxy_kv WHERE k = ?1")
        .bind(String(key))
        .run();
    },
    async list(opts = {}) {
      const o = opts || {};
      const p = String(o.prefix || "");
      const off = Number(o.cursor || 0) || 0;
      const lim = Math.max(1, Math.min(Number(o.limit || 1000), 1000));
      const rows = await db
        .prepare(
          `
    SELECT k
    FROM proxy_kv
    WHERE k LIKE ?1
    ORDER BY k
    LIMIT ?2 OFFSET ?3
  `,
        )
        .bind(p + "%", lim + 1, off)
        .all();
      const arr = Array.isArray(rows?.results) ? rows.results : [];
      const hasMore = arr.length > lim;
      const slice = hasMore ? arr.slice(0, lim) : arr;
      return {
        keys: slice.map((r) => ({ name: r.k })),
        list_complete: !hasMore,
        cursor: hasMore ? String(off + lim) : undefined,
      };
    },
  };
}
function cleanupTTLMaps() {
  const now = Date.now();
  if (GLOBALS._lastCleanupAt && now - GLOBALS._lastCleanupAt < 15000) return;
  GLOBALS._lastCleanupAt = now;
  [
    GLOBALS.NodeCache,
    GLOBALS.NodeHostIndexCache,
    GLOBALS.NodeListCache,
    GLOBALS.AuthFail,
    GLOBALS.LineBan,
    GLOBALS.ProgressThrottle,
    GLOBALS.PlaybackRangeDedup,
  ].forEach((map) => {
    for (const [k, v] of map) {
      if (v?.exp && now > v.exp) map.delete(k);
    }
  });
}
function rewriteSetCookieHeaders(headers, prefix) {
  const cookies = headers.getSetCookie
    ? headers.getSetCookie()
    : headers.get("Set-Cookie")
      ? [headers.get("Set-Cookie")]
      : [];
  if (!cookies.length) return;
  headers.delete("Set-Cookie");
  for (let c of cookies) {
    c = c.replace(/;\s*domain=[^;]+/i, "");
    if (prefix) {
      if (/;\s*path=/i.test(c)) {
        c = c.replace(/;\s*path=[^;]+/i, `; Path=${prefix}`);
      } else {
        c += `; Path=${prefix}`;
      }
    }
    headers.append("Set-Cookie", c);
  }
}
function safeEqual(a, b) {
  a = String(a || "");
  b = String(b || "");
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
const Auth = {
  extractToken(request) {
    const auth = request.headers.get("Authorization") || "";
    if (/^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, "").trim();
    const x = request.headers.get("X-Admin-Token");
    return String(x || "").trim();
  },
  unauthorized() {
    return {
      ok: false,
      uid: "",
      role: "",
      response: new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { "Content-Type": "application/json;charset=utf-8" },
      }),
    };
  },
  check(request, env) {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const now = Date.now();
    const win = 10 * 60 * 1000;
    const maxFail = 20;
    let rec = GLOBALS.AuthFail.get(ip);
    if (!rec || now - rec.ts > win) rec = { n: 0, ts: now };
    if ((now & 63) === 0) {
      for (const [k, entry] of GLOBALS.AuthFail) {
        const v =
          entry && typeof entry === "object" && "value" in entry
            ? entry.value
            : entry;
        if (!v || now - Number(v.ts || 0) > win) {
          GLOBALS.AuthFail.delete(k);
        }
      }
    }
    const got = this.extractToken(request);
    const admin = String(env.ADMIN_TOKEN || "").trim();
    if (got && admin && safeEqual(got, admin)) {
      GLOBALS.AuthFail.delete(ip);
      return { ok: true, uid: "admin", role: "admin", response: null };
    }
    if (!got) {
      return this.unauthorized();
    }
    if (rec.n >= maxFail) {
      return {
        ok: false,
        uid: "",
        role: "",
        response: new Response(JSON.stringify({ error: "TOO_MANY_REQUESTS" }), {
          status: 429,
          headers: { "Content-Type": "application/json;charset=utf-8" },
        }),
      };
    }
    rec.n += 1;
    rec.ts = now;
    GLOBALS.AuthFail.set(ip, rec, win);
    return this.unauthorized();
  },
};
const Validators = {
  NAME_RE: /^[a-z0-9_-]{1,32}$/i,
  SECRET_RE: /^[^\/?#\s]{0,128}$/,
  normalizeName(v) {
    return String(v || "")
      .trim()
      .toLowerCase();
  },
  validateName(v) {
    const name = this.normalizeName(v);
    if (!this.NAME_RE.test(name)) {
      return {
        ok: false,
        error: "name 非法:仅允许 a-z / 0-9 / _ / -，长度 1~32",
      };
    }
    return { ok: true, value: name };
  },
  splitTargets(v) {
    const raw = String(v || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n/g, "\n");
    return raw
      .split(/\r?\n|[;,，；|]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  },
  validateTarget(v) {
    const arr = this.splitTargets(v);
    if (!arr.length) return { ok: false, error: "target 不能为空" };
    if (arr.length > 20)
      return { ok: false, error: "target 数量过多（最多20）" };
    const out = [];
    for (const t of arr) {
      if (t.length > 2048) return { ok: false, error: "target 过长" };
      try {
        const u = new URL(t);
        if (!/^https?:$/i.test(u.protocol)) {
          return { ok: false, error: "target 只允许 http/https" };
        }
        out.push(t.replace(/\/+$/, ""));
      } catch {
        return { ok: false, error: "target 不是合法 URL:" + t };
      }
    }
    return { ok: true, value: [...new Set(out)].join("\n") };
  },
  validateMode(v) {
    const m = String(v || "")
      .trim()
      .toLowerCase();
    if (m && m !== "normal" && m !== "split") {
      return { ok: false, error: "mode 仅支持 normal/split" };
    }
    return { ok: true, value: m || "split" };
  },
  validateSecret(v) {
    const secret = String(v || "").trim();
    if (!this.SECRET_RE.test(secret)) {
      return {
        ok: false,
        error: "secret 非法:不能包含 / ? # 或空白字符，最长128",
      };
    }
    return { ok: true, value: secret };
  },
  validateTag(v) {
    let tag = String(v || "").trim();
    if (tag.length > 64) tag = tag.slice(0, 64);
    return { ok: true, value: tag };
  },
  validateNote(v) {
    let note = String(v || "").trim();
    if (note.length > 64) note = note.slice(0, 64);
    return { ok: true, value: note };
  },
  validateDisplayName(v) {
    let name = String(v || "")
      .trim()
      .replace(/\s+/g, " ");
    if (name.length > 32) name = name.slice(0, 32);
    return { ok: true, value: name };
  },
  validateRealClientIpMode(v) {
    const s = String(v || "smart")
      .trim()
      .toLowerCase();
    if (!s || s === "smart" || s === "auto")
      return { ok: true, value: "smart" };
    if (["realip_only", "realip", "strip", "strict", "x-real-ip"].includes(s)) {
      return { ok: true, value: "realip_only" };
    }
    if (["off", "disable", "none", "close"].includes(s)) {
      return { ok: true, value: "off" };
    }
    if (["dual", "both", "full", "forward"].includes(s)) {
      return { ok: true, value: "dual" };
    }
    return { ok: false, error: "网络兼容档位不合法" };
  },
  validateNodeInput(n) {
    if (!n || typeof n !== "object" || Array.isArray(n)) {
      return { ok: false, error: "节点项不是对象" };
    }
    const rn = this.validateName(n.name);
    if (!rn.ok) return { ok: false, error: rn.error };
    const rt = this.validateTarget(n.target);
    if (!rt.ok) return { ok: false, error: rt.error };
    const rm = this.validateMode(n.mode);
    if (!rm.ok) return { ok: false, error: rm.error };
    const streamTarget = String(n.streamTarget || "").trim();
    const rs = this.validateSecret(n.secret || "");
    if (!rs.ok) return { ok: false, error: rs.error };
    const rg = this.validateTag(n.tag || "");
    const rn2 = this.validateNote(n.note || "");
    const rd = this.validateDisplayName(n.displayName || "");
    const rr = this.validateRealClientIpMode(n.realClientIpMode || "smart");
    if (!rr.ok) return { ok: false, error: rr.error };
    let embyUser = String(n.embyUser || "").trim();
    let embyPass = String(n.embyPass || "").trim();
    if (embyUser.length > 128) embyUser = embyUser.slice(0, 128);
    if (embyPass.length > 256) embyPass = embyPass.slice(0, 256);
    let keepaliveMaxPerDay = 1;
    if (
      n.keepaliveMaxPerDay !== undefined &&
      n.keepaliveMaxPerDay !== null &&
      String(n.keepaliveMaxPerDay).trim() !== ""
    ) {
      const c = Number(n.keepaliveMaxPerDay);
      if (!Number.isFinite(c) || c < 1 || c > 24) {
        return { ok: false, error: "保号每日提醒次数不合法（1~24）" };
      }
      keepaliveMaxPerDay = Math.floor(c);
    }
    let renewDays = 0; // 保号周期（天）
    if (
      n.renewDays !== undefined &&
      n.renewDays !== null &&
      String(n.renewDays).trim() !== ""
    ) {
      const d = Number(n.renewDays);
      if (!Number.isFinite(d) || d < 0 || d > 3650) {
        return { ok: false, error: "保号周期不合法（0~3650）" };
      }
      renewDays = Math.floor(d);
    }
    let remindBeforeDays = 0; // 提前几天提醒
    if (
      n.remindBeforeDays !== undefined &&
      n.remindBeforeDays !== null &&
      String(n.remindBeforeDays).trim() !== ""
    ) {
      const d = Number(n.remindBeforeDays);
      if (!Number.isFinite(d) || d < 0 || d > 3650) {
        return { ok: false, error: "提前几天提醒不合法（0~3650）" };
      }
      remindBeforeDays = Math.floor(d);
    }
    let keepaliveAtRaw = String(n.keepaliveAt || "").trim();
    let keepaliveAt = "";
    if (keepaliveAtRaw) {
      let s = keepaliveAtRaw
        .replace(/[\s\u3000]+/g, "")
        .replace(/[０-９]/g, (ch) =>
          String.fromCharCode(ch.charCodeAt(0) - 65248),
        )
        .replace(/[:﹕∶]/g, ":")
        .replace(/[．。]/g, ".");
      let mk = /^(\d{1,2}):(\d{1,2})(:(\d{1,2})(\.\d+)?)?$/.exec(s);
      if (!mk) mk = /(\d{1,2})\D+(\d{1,2})/.exec(s);
      if (!mk) {
        return { ok: false, error: "保号提醒时间格式不合法（HH:mm）" };
      }
      const hh = Math.max(0, Math.min(23, Number(mk[1])));
      const mm = Math.max(0, Math.min(59, Number(mk[2])));
      keepaliveAt =
        String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
    }
    let ipCountryBlacklist = "";
    if (
      typeof n.ipCountryBlacklist === "string" &&
      n.ipCountryBlacklist.trim()
    ) {
      ipCountryBlacklist = [
        ...new Set(
          n.ipCountryBlacklist
            .toUpperCase()
            .split(/[\s,，;；]+/)
            .map((s) => s.trim())
            .filter((s) => /^[A-Z]{2}$/.test(s)),
        ),
      ].join(",");
    }
    return {
      ok: true,
      value: {
        name: rn.value,
        displayName: rd.value,
        target: rt.value,
        mode: rm.value,
        streamTarget,
        fav: !!n.fav,
        rank: Number.isFinite(Number(n.rank)) ? Number(n.rank) : undefined,
        secret: rs.value,
        tag: rg.value,
        note: rn2.value,
        embyUser,
        embyPass,
        directExternal: toBool(n.directExternal),
        realClientIpMode: rr.value,
        renewDays,
        remindBeforeDays,
        keepaliveAt,
        keepaliveMaxPerDay,
        ipCountryBlacklist,
      },
    };
  },
};
async function sendTG(token, chat, text) {
  if (!token || !chat) throw new Error("tg token/chat empty");
  const resp = await fetch(
    "https://api.telegram.org/bot" + token + "/sendMessage",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text,
        disable_web_page_preview: true,
      }),
    },
  );
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error("TG HTTP " + resp.status + " " + body);
  }
  const data = await resp.json().catch(() => null);
  if (!data || data.ok !== true) {
    throw new Error("TG API failed: " + JSON.stringify(data || {}));
  }
}
const Database = {
  PREFIX: "node:",
  nodePrefix(uid = "admin") {
    uid = String(uid || "admin")
      .trim()
      .toLowerCase();
    return "u:" + uid + ":" + this.PREFIX;
  },
  userPrefix(uid = "admin") {
    return this.nodePrefix(uid);
  },
  nodeKey(uid, name) {
    return this.nodePrefix(uid) + String(name || "").toLowerCase();
  },
  memKey(uid, name) {
    return (
      String(uid || "admin").toLowerCase() +
      ":" +
      String(name || "").toLowerCase()
    );
  },
  listCacheKey(uid = "admin") {
    return "list:" + String(uid || "admin").toLowerCase();
  },
  cacheUrl(uid, name) {
    return (
      "https://internal-cache/node/" +
      encodeURIComponent(String(uid || "admin").toLowerCase()) +
      "/" +
      encodeURIComponent(String(name || "").toLowerCase())
    );
  },
  getKV(env) {
    return getKV(env);
  },
  getDb(env) {
    return env.EMBY_D1 || env.D1 || env.DB;
  },
  async ensureProxyKvTable(env) {
    const db = this.getDb(env);
    if (!db) return null;
    if (!GLOBALS.ProxyKvReady) {
      await db
        .prepare(
          "CREATE TABLE IF NOT EXISTS proxy_kv (" +
            "k TEXT PRIMARY KEY," +
            "v TEXT NOT NULL," +
            "updated_at INTEGER NOT NULL" +
            ")",
        )
        .run();
      GLOBALS.ProxyKvReady = true;
    }
    return db;
  },
  async ensureKeepaliveStateTable(env) {
    const db = this.getDb(env);
    if (!db) return null;
    if (!GLOBALS.KeepaliveTableReady) {
      await db
        .prepare(
          "CREATE TABLE IF NOT EXISTS keepalive_state (" +
            "node TEXT PRIMARY KEY," +
            "anchor_ts INTEGER NOT NULL," +
            "last_play_ts INTEGER NOT NULL DEFAULT 0," +
            "last_notify_day TEXT," +
            "notify_count_day TEXT," +
            "notify_count INTEGER NOT NULL DEFAULT 0" +
            ")",
        )
        .run();
      GLOBALS.KeepaliveTableReady = true;
    }
    return db;
  },
  getDayKeyOffset(offsetDays = 0) {
    const now = new Date();
    const ts = now.getTime() + offsetDays * 24 * 3600 * 1000;
    return new Date(ts).toLocaleDateString("en-CA", {
      timeZone: "Asia/Shanghai",
    });
  },
  getDayKey(ts = Date.now()) {
    return new Date(ts).toLocaleDateString("en-CA", {
      timeZone: "Asia/Shanghai",
    });
  },
  getClientName(request) {
    const x =
      request.headers.get("X-Emby-Client") ||
      request.headers.get("X-Emby-Device-Name") ||
      request.headers.get("User-Agent") ||
      "Unknown";
    return String(x).slice(0, 64);
  },
  normalizeNodeKey(v) {
    return String(v || "")
      .trim()
      .toLowerCase();
  },
  pickNodeDisplayName(node) {
    const dn = String(node?.displayName || "").trim();
    if (dn) return dn;
    const n = String(node?.name || "").trim();
    if (n) return n;
    return "";
  },
  buildNodeDisplayMap(nodes) {
    const map = new Map();
    for (const n of nodes || []) {
      const show = this.pickNodeDisplayName(n);
      if (!show) continue;
      const aliases = [n?.name, n?.key, n?.id, n?.path, n?.route, show];
      for (const a of aliases) {
        const k = this.normalizeNodeKey(a);
        if (k && !map.has(k)) map.set(k, show);
      }
    }
    return map;
  },
  async getTgConfig(env) {
    const kv = this.getKV(env);
    if (!kv) return null;
    const cfg = await kv.get("tg:config", { type: "json" });
    return (
      cfg || {
        enabled: false,
        token: "",
        chat: "",
        reportTime: "00:00",
        reportEveryMin: 60, // 最短60分钟
        reportMaxPerDay: 1, // 1~24
        reportChangeOnly: true, // 仅内容变化才推送（默认开启）
      }
    );
  },
  async setTgConfig(env, cfg) {
    const kv = this.getKV(env);
    if (!kv) return;
    await kv.put("tg:config", cfg || {});
  },
  async logPlayback(
    env,
    node,
    request,
    res,
    isPlayback,
    mode = "proxy",
    bytesMeasured = null,
  ) {
    try {
      if (!isPlayback) return;
      if (res && res.status >= 300 && res.status < 400 && mode !== "direct")
        return;
      const method = String(request.method || "GET").toUpperCase();
      const db = await this.ensureKeepaliveStateTable(env);
      if (!db) return;
      const now = Date.now();
      const day = this.getDayKey();
      const nodeNameRaw = String(node?.name || "unknown").trim() || "unknown";
      const nodeName = this.normalizeNodeKey(nodeNameRaw) || "unknown";
      const nodeKey = nodeName;
      if (nodeKey) {
        await db
          .prepare(
            "INSERT INTO keepalive_state (node, anchor_ts, last_play_ts, last_notify_day) VALUES (?1, ?2, ?2, NULL) " +
              "ON CONFLICT(node) DO UPDATE SET last_play_ts=excluded.last_play_ts",
          )
          .bind(nodeKey, now)
          .run();
      }
      if (method !== "GET" && method !== "HEAD") return;
      await db
        .prepare(
          "CREATE TABLE IF NOT EXISTS play_sessions (" +
            "k TEXT PRIMARY KEY," +
            "day TEXT NOT NULL," +
            "last_ts INTEGER NOT NULL" +
            ")",
        )
        .run();
      await db
        .prepare(
          "CREATE TABLE IF NOT EXISTS play_stats (" +
            "day TEXT NOT NULL," +
            "node TEXT NOT NULL," +
            "client TEXT NOT NULL," +
            "plays INTEGER NOT NULL DEFAULT 0," +
            "bytes INTEGER NOT NULL DEFAULT 0," +
            "sessions INTEGER NOT NULL DEFAULT 0," +
            "errors INTEGER NOT NULL DEFAULT 0," +
            "updated_at INTEGER NOT NULL," +
            "PRIMARY KEY(day, node, client)" +
            ")",
        )
        .run();
      const client = this.getClientName(request);
      const range = request.headers.get("Range") || "";
      const isRange = /^bytes=\d+-\d*/i.test(range);
      const hasMeasuredBytes =
        typeof bytesMeasured === "number" && Number.isFinite(bytesMeasured);
      const rawIp =
        request.headers.get("CF-Connecting-IP") ||
        request.headers.get("X-Forwarded-For") ||
        request.headers.get("X-Real-IP") ||
        "unknown";
      const ip = String(rawIp).split(",")[0].trim() || "unknown";
      const u = new URL(request.url);
      const sessionId =
        String(u.searchParams.get("SessionId") || "") ||
        String(u.searchParams.get("sessionId") || "") ||
        String(u.searchParams.get("PlaySessionId") || "") ||
        String(u.searchParams.get("playSessionId") || "");
      const deviceId = String(
        request.headers.get("X-Emby-Device-Id") ||
          request.headers.get("X-MediaBrowser-Device-Id") ||
          "",
      ).slice(0, 64);
      let sessInc = 1;
      const sessToken = `${day}|${nodeName}|${client}|${ip}|${deviceId}|${sessionId}`;
      if (sessionId || deviceId) {
        const prev = await db
          .prepare("SELECT last_ts FROM play_sessions WHERE k=?1")
          .bind(sessToken)
          .first();
        if (prev && Number(now - Number(prev.last_ts || 0)) <= 15 * 60 * 1000) {
          sessInc = 0;
        }
        await db
          .prepare(
            "INSERT INTO play_sessions (k,day,last_ts) VALUES (?1,?2,?3) " +
              "ON CONFLICT(k) DO UPDATE SET day=excluded.day, last_ts=excluded.last_ts",
          )
          .bind(sessToken, day, now)
          .run();
      }
      let bytes = hasMeasuredBytes
        ? bytesMeasured
        : Number(res?.headers?.get("Content-Length") || 0) || 0;
      const cr = res?.headers?.get("Content-Range");
      if (!hasMeasuredBytes && cr) {
        const m = /bytes\s+(\d+)-(\d+)\/\d+/i.exec(cr);
        if (m) {
          const start = Number(m[1]);
          const end = Number(m[2]);
          if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
            bytes = end - start + 1;
          }
        }
      }
      if (!hasMeasuredBytes && mode === "proxy" && bytes > 0 && isRange) {
        let seg = "";
        if (cr) {
          const mCr = /bytes\s+(\d+)-(\d+)\/\d+/i.exec(cr);
          if (mCr) seg = `${mCr[1]}-${mCr[2]}`;
        }
        if (!seg) {
          const mRg = /bytes=(\d+)-(\d*)/i.exec(range);
          if (mRg) seg = `${mRg[1]}-${mRg[2] || ""}`;
        }
        if (seg) {
          const p = new URL(request.url).pathname;
          const dedupKey = `${day}|${nodeName}|${ip}|${client}|${p}|${seg}`;
          if (GLOBALS.PlaybackRangeDedup.get(dedupKey)) {
            bytes = 0;
          } else {
            GLOBALS.PlaybackRangeDedup.set(dedupKey, 1, 15 * 60 * 1000);
          }
        }
      }
      if (mode !== "proxy") bytes = 0;
      if (!Number.isFinite(bytes) || bytes < 0) bytes = 0;
      const isErr = res && res.status >= 500 ? 1 : 0;
      const playInc = sessInc;
      await db
        .prepare(
          "INSERT INTO play_stats (day,node,client,plays,bytes,sessions,errors,updated_at) " +
            "VALUES (?1,?2,?3,?4,?5,?6,?7,?8) " +
            "ON CONFLICT(day,node,client) DO UPDATE SET " +
            "plays=plays+excluded.plays, bytes=bytes+excluded.bytes, sessions=sessions+excluded.sessions, " +
            "errors=errors+excluded.errors, updated_at=excluded.updated_at",
        )
        .bind(day, nodeName, client, playInc, bytes, sessInc, isErr, now)
        .run();
      const kv = this.getKV(env);
      if (kv && playInc > 0) {
        const key =
          mode === "direct"
            ? `stats:directPlays:${day}`
            : `stats:proxyPlays:${day}`;
        const cur = Number((await kv.get(key)) || 0);
        await kv.put(key, String(cur + playInc));
      }
      if (isErr) {
        const cfg = await this.getTgConfig(env);
        if (cfg?.enabled && cfg?.token && cfg?.chat) {
          await sendTG(cfg.token, cfg.chat, "📢 Emby 告警\n⚠️ 发生 5xx 错误");
        }
      }
    } catch (e) {
      console.error("logPlayback error:", e);
    }
  },
  async buildDailyReport(env) {
    const db = this.getDb(env);
    if (!db) return "❌ D1未绑定! 请检查 EMBY_D1 / D1 / DB";
    const dayToday = this.getDayKey();
    const dayYest = this.getDayKeyOffset(-1);
    const cfg = await this.getTgConfig(env);
    const estGBPerDirectPlay = Math.max(
      0.1,
      Math.min(10, Number(cfg?.directEstGB || 1.2)),
    );
    const getSum = async (day) => {
      const total = await db
        .prepare(
          "SELECT SUM(plays) AS plays, SUM(bytes) AS bytes, SUM(sessions) AS sessions FROM play_stats WHERE day=?1",
        )
        .bind(day)
        .first();
      return {
        plays: Number(total?.plays || 0),
        bytes: Number(total?.bytes || 0),
        sessions: Number(total?.sessions || 0),
      };
    };
    const today = await getSum(dayToday);
    const yest = await getSum(dayYest);
    let cfPlayToday = { bytes: 0, requests: 0 };
    let cfPlayYest = { bytes: 0, requests: 0 };
    let cfTotalToday = { bytes: 0, requests: 0 };
    let cfTotalYest = { bytes: 0, requests: 0 };
    try {
      cfPlayToday = await this.getCfPlayback(env, dayToday);
    } catch (e) {
      console.log("getCfPlayback today fail:", e?.message || e);
    }
    try {
      cfPlayYest = await this.getCfPlayback(env, dayYest);
    } catch (e) {
      console.log("getCfPlayback yest fail:", e?.message || e);
    }
    try {
      cfTotalToday = await this.getCfHttpTotal(env, dayToday);
    } catch (e) {
      console.log("getCfHttpTotal today fail:", e?.message || e);
    }
    try {
      cfTotalYest = await this.getCfHttpTotal(env, dayYest);
    } catch (e) {
      console.log("getCfHttpTotal yest fail:", e?.message || e);
    }
    const kv = this.getKV(env);
    const proxyPlaysToday = kv
      ? Number((await kv.get(`stats:proxyPlays:${dayToday}`)) || 0)
      : 0;
    const directPlaysToday = kv
      ? Number((await kv.get(`stats:directPlays:${dayToday}`)) || 0)
      : 0;
    const proxyPlaysYest = kv
      ? Number((await kv.get(`stats:proxyPlays:${dayYest}`)) || 0)
      : 0;
    const directPlaysYest = kv
      ? Number((await kv.get(`stats:directPlays:${dayYest}`)) || 0)
      : 0;
    const topNodes = await db
      .prepare(
        "SELECT LOWER(TRIM(node)) AS node_key, SUM(plays) AS plays " +
          "FROM play_stats WHERE day=?1 " +
          "GROUP BY LOWER(TRIM(node)) " +
          "ORDER BY plays DESC LIMIT 99",
      )
      .bind(dayToday)
      .all();
    const topClients = await db
      .prepare(
        "SELECT client, SUM(plays) AS plays FROM play_stats WHERE day=?1 GROUP BY client ORDER BY plays DESC LIMIT 99",
      )
      .bind(dayToday)
      .all();
    let nodeDisplayMap = new Map();
    try {
      const nodes = await this.listAllNodes(env, "admin", 0);
      nodeDisplayMap = this.buildNodeDisplayMap(nodes);
    } catch (_) {}
    const toGB = (bytes) =>
      Math.round((Number(bytes || 0) / (1024 * 1024 * 1024)) * 10) / 10;
    const estDirectGB = (n) =>
      Math.round(Number(n || 0) * estGBPerDirectPlay * 10) / 10;
    const fmtTopNodes = (rows) => {
      const arr = Array.isArray(rows?.results) ? rows.results : [];
      if (!arr.length) return "暂无";
      return arr
        .map((r) => {
          const key = this.normalizeNodeKey(r?.node_key);
          const show = nodeDisplayMap.get(key) || "未命名节点";
          return "  • " + show + "(" + (r.plays || 0) + ")";
        })
        .join("\n");
    };
    const fmtTopClients = (rows) => {
      const arr = Array.isArray(rows?.results) ? rows.results : [];
      if (!arr.length) return "暂无";
      return arr
        .map((r) => "  • " + (r.client || "未知") + "(" + (r.plays || 0) + ")")
        .join("\n");
    };
    return (
      "📊 Emby 反代每日报表\n" +
      "🗓 今天（北京）: " +
      dayToday +
      "\n" +
      "▶️ 播放次数: " +
      today.plays +
      "\n" +
      "📦 播放流量(CF): " +
      toGB(cfPlayToday.bytes) +
      " GB\n" +
      "🌐 域名总流量(CF): " +
      toGB(cfTotalToday.bytes) +
      " GB\n" +
      "🧮 直连估算流量: " +
      estDirectGB(directPlaysToday) +
      " GB（估算）\n" +
      "📈 代理/直连播放: " +
      proxyPlaysToday +
      " / " +
      directPlaysToday +
      "\n" +
      "🔥 活跃播放: " +
      today.sessions +
      "\n" +
      "━━━━━━━━━━━━━━\n" +
      "🗓 昨天（北京）: " +
      dayYest +
      "\n" +
      "▶️ 播放次数: " +
      yest.plays +
      "\n" +
      "📦 播放流量(CF): " +
      toGB(cfPlayYest.bytes) +
      " GB\n" +
      "🌐 域名总流量(CF): " +
      toGB(cfTotalYest.bytes) +
      " GB\n" +
      "🧮 直连估算流量: " +
      estDirectGB(directPlaysYest) +
      " GB（估算）\n" +
      "📈 代理/直连播放: " +
      proxyPlaysYest +
      " / " +
      directPlaysYest +
      "\n" +
      "🔥 活跃播放: " +
      yest.sessions +
      "\n" +
      "━━━━━━━━━━━━━━\n" +
      "📌 热门节点 TOP\n" +
      fmtTopNodes(topNodes) +
      "\n━━━━━━━━━━━━━━\n" +
      "🧩 客户端 TOP\n" +
      fmtTopClients(topClients) +
      "\n━━━━━━━━━━━━━━\n" +
      "ℹ️ 说明:开启网盘直连后，直连流量为估算值，不代表源站精确账单。"
    );
  },
  async checkKeepaliveAndNotify(env) {
    const cfg = await this.getTgConfig(env);
    if (!cfg || !cfg.enabled || !cfg.token || !cfg.chat) return;
    const db = await this.ensureKeepaliveStateTable(env);
    if (!db) return;
    const nodes = await this.listAllNodes(env, "admin", 0);
    if (!Array.isArray(nodes) || !nodes.length) return;
    const dayMs = 24 * 3600 * 1000;
    const now = Date.now();
    const today = this.getDayKey(now);
    const shNow = new Date(
      new Date(now).toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
    );
    const curMin = shNow.getHours() * 60 + shNow.getMinutes();
    const kv = this.getKV(env);
    for (const n of nodes) {
      try {
        const nodeKey = String(n?.name || "")
          .trim()
          .toLowerCase();
        if (!nodeKey) continue;
        const periodDays = Math.max(0, Math.floor(Number(n?.renewDays || 0)));
        if (periodDays <= 0) continue;
        const beforeDays = Math.max(
          0,
          Math.floor(Number(n?.remindBeforeDays || 0)),
        );
        const maxPerDay = Math.max(
          1,
          Math.min(24, Math.floor(Number(n?.keepaliveMaxPerDay || 1))),
        );
        const intervalMin = 60; // 固定最短1小时
        const changeOnly = n?.keepaliveChangeOnly !== false; // 默认开
        let st = await db
          .prepare(
            "SELECT anchor_ts, last_play_ts, notify_count_day, notify_count FROM keepalive_state WHERE node=?1",
          )
          .bind(nodeKey)
          .first();
        if (!st) {
          await db
            .prepare(
              "INSERT INTO keepalive_state (node, anchor_ts, last_play_ts, last_notify_day, notify_count_day, notify_count) VALUES (?1, ?2, 0, NULL, NULL, 0)",
            )
            .bind(nodeKey, now)
            .run();
          st = {
            anchor_ts: now,
            last_play_ts: 0,
            notify_count_day: null,
            notify_count: 0,
          };
        }
        const anchorTs = Number(st?.anchor_ts || now);
        const lastPlayTs = Number(st?.last_play_ts || 0);
        const baseTs = lastPlayTs > 0 ? lastPlayTs : anchorTs;
        const dueTs = baseTs + periodDays * dayMs;
        const notifyStartTs = dueTs - beforeDays * dayMs;
        if (now < notifyStartTs) continue;
        const keepaliveAtRaw = String(n?.keepaliveAt || "00:00")
          .trim()
          .replace(/[:﹕∶]/g, ":");
        const m = /^(\d{1,2}):(\d{1,2})(:(\d{1,2})(\.\d+)?)?$/.exec(
          keepaliveAtRaw,
        );
        let remindMin = 0;
        let keepaliveAt = "00:00";
        if (m) {
          const hh = Math.max(0, Math.min(23, Number(m[1])));
          const mm = Math.max(0, Math.min(59, Number(m[2])));
          keepaliveAt =
            String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
          remindMin = hh * 60 + mm;
        }
        if (curMin < remindMin) continue;
        let cntDay = String(st?.notify_count_day || "");
        let cnt = Number(st?.notify_count || 0);
        if (cntDay !== today) {
          cntDay = today;
          cnt = 0;
        }
        const cntKey = `keepalive:cnt:${nodeKey}:${today}`;
        const lastKey = `keepalive:last:${nodeKey}:${today}`;
        const digestKey = `keepalive:digest:${nodeKey}:${today}`;
        const sentCnt = kv ? Number((await kv.get(cntKey)) || cnt || 0) : cnt;
        const lastTs = kv ? Number((await kv.get(lastKey)) || 0) : 0;
        if (sentCnt >= maxPerDay) continue;
        if (lastTs && now - lastTs < intervalMin * 60 * 1000) continue;
        const leftMs = dueTs - now;
        const showName = String(n?.displayName || n?.name || nodeKey);
        const msg =
          "🔔 保号提醒\n" +
          "节点:" +
          showName +
          "\n" +
          "保号周期:" +
          periodDays +
          "天\n" +
          "提前提醒:" +
          beforeDays +
          "天\n" +
          "提醒时间:" +
          keepaliveAt +
          "（北京时间）\n" +
          "今日次数:" +
          (sentCnt + 1) +
          "/" +
          maxPerDay +
          "\n" +
          (leftMs <= 0
            ? "状态:已到期（未观看）\n"
            : "剩余:" + Math.ceil(leftMs / dayMs) + "天\n") +
          "最后播放:" +
          (lastPlayTs > 0
            ? new Date(lastPlayTs).toLocaleString("zh-CN", {
                timeZone: "Asia/Shanghai",
                hour12: false,
              })
            : "无记录");
        let digest = "";
        if (changeOnly && kv) {
          const digestBase = [
            nodeKey,
            String(periodDays),
            String(beforeDays),
            String(dueTs),
            String(lastPlayTs > 0 ? lastPlayTs : 0),
          ].join("|");
          let h = 2166136261 >>> 0;
          for (let i = 0; i < digestBase.length; i++) {
            h ^= digestBase.charCodeAt(i);
            h = Math.imul(h, 16777619);
          }
          digest = String(h >>> 0);
          const oldDigest = String((await kv.get(digestKey)) || "");
          if (oldDigest && oldDigest === digest) continue;
        }
        await sendTG(cfg.token, cfg.chat, msg);
        if (kv) {
          if (changeOnly && digest) await kv.put(digestKey, digest);
          await kv.put(cntKey, String(sentCnt + 1));
          await kv.put(lastKey, String(now));
        }
        await db
          .prepare(
            "UPDATE keepalive_state SET notify_count_day=?2, notify_count=?3, last_notify_day=?2 WHERE node=?1",
          )
          .bind(nodeKey, today, sentCnt + 1)
          .run();
      } catch (e) {
        console.error(
          "keepalive node notify failed:",
          n?.name,
          e?.message || e,
        );
      }
    }
  },
  async cleanupOld(env) {},
  packNode(n) {
    const o = { t: String(n?.target || "").trim() };
    if (n?.mode) o.m = String(n.mode);
    if (n?.streamTarget) o.st = String(n.streamTarget).trim();
    if (n?.fav) o.f = 1;
    if (Number.isFinite(Number(n?.rank))) o.r = Number(n.rank);
    if (n?.secret) o.s = String(n.secret);
    if (n?.tag) o.g = String(n.tag);
    if (n?.note) o.n = String(n.note);
    if (n?.displayName) o.d = String(n.displayName);
    if (n?.embyUser) o.eu = String(n.embyUser);
    if (n?.embyPass) o.ep = String(n.embyPass);
    if (n?.directExternal) o.de = 1;
    if (n?.realClientIpMode && String(n.realClientIpMode) !== "smart") {
      o.xrm = String(n.realClientIpMode);
    }
    if (Number.isFinite(Number(n?.renewDays)) && Number(n.renewDays) > 0) {
      o.xd = Math.floor(Number(n.renewDays)); // 保号周期
    }
    if (
      Number.isFinite(Number(n?.remindBeforeDays)) &&
      Number(n.remindBeforeDays) >= 0
    ) {
      o.xb = Math.floor(Number(n.remindBeforeDays)); // 提前几天提醒
    }
    if (n?.keepaliveAt) o.xh = String(n.keepaliveAt); // 保号提醒时间 HH:mm
    if (
      Number.isFinite(Number(n?.keepaliveMaxPerDay)) &&
      Number(n.keepaliveMaxPerDay) >= 1
    ) {
      o.xk = Math.floor(Number(n.keepaliveMaxPerDay));
    }
    if (n?.ipCountryBlacklist) o.xcb = String(n.ipCountryBlacklist);
    return JSON.stringify(o);
  },
  unpackNode(name, raw) {
    if (!raw || typeof raw !== "object") return null;
    const target = String(raw.t ?? raw.target ?? "").trim();
    if (!target) return null;
    const rm = Validators.validateMode(raw.m ?? raw.mode ?? "");
    if (!rm.ok) return null;
    const mode = rm.value;
    const streamTarget = String(raw.st ?? raw.streamTarget ?? "").trim();
    const xrmRaw = String(raw.xrm ?? raw.realClientIpMode ?? "smart")
      .trim()
      .toLowerCase();
    const realClientIpMode = ["smart", "realip_only", "off", "dual"].includes(
      xrmRaw,
    )
      ? xrmRaw
      : "smart";
    return {
      name: String(name || "")
        .trim()
        .toLowerCase(),
      displayName: String(raw.d ?? raw.displayName ?? ""),
      target,
      mode,
      streamTarget,
      fav: !!(raw.f ?? raw.fav ?? false),
      rank: Number.isFinite(Number(raw.r ?? raw.rank))
        ? Number(raw.r ?? raw.rank)
        : undefined,
      secret: String(raw.s ?? raw.secret ?? ""),
      tag: String(raw.g ?? raw.tag ?? ""),
      note: String(raw.n ?? raw.note ?? ""),
      embyUser: String(raw.eu ?? raw.embyUser ?? ""),
      embyPass: String(raw.ep ?? raw.embyPass ?? ""),
      directExternal: toBool(raw.de ?? raw.directExternal ?? false),
      realClientIpMode,
      renewDays: Number.isFinite(Number(raw.xd ?? raw.renewDays))
        ? Math.max(0, Math.floor(Number(raw.xd ?? raw.renewDays)))
        : 0,
      remindBeforeDays: Number.isFinite(Number(raw.xb ?? raw.remindBeforeDays))
        ? Math.max(0, Math.floor(Number(raw.xb ?? raw.remindBeforeDays)))
        : 0,
      keepaliveAt: String(raw.xh ?? raw.keepaliveAt ?? ""),
      keepaliveMaxPerDay: Number.isFinite(
        Number(raw.xk ?? raw.keepaliveMaxPerDay),
      )
        ? Math.max(1, Math.floor(Number(raw.xk ?? raw.keepaliveMaxPerDay)))
        : 1,
      ipCountryBlacklist: String(raw.xcb ?? raw.ipCountryBlacklist ?? ""),
    };
  },
  async getNode(nodeName, env, ctx, uid = "admin") {
    nodeName = String(nodeName || "").toLowerCase();
    uid = String(uid || "admin").toLowerCase();
    const kv = this.getKV(env);
    if (!kv) return null;
    const now = Date.now();
    const mk = this.memKey(uid, nodeName);
    const mem = GLOBALS.NodeCache.get(mk);
    if (mem && mem.exp > now) return mem.data;
    const cache = caches.default;
    const cacheUrl = new URL(this.cacheUrl(uid, nodeName));
    const cached = await cache.match(cacheUrl);
    if (cached) {
      const data = await cached.json();
      GLOBALS.NodeCache.set(
        mk,
        { data, exp: now + Config.Defaults.CacheTTL },
        Config.Defaults.CacheTTL,
      );
      return data;
    }
    const raw = await kv.get(this.nodeKey(uid, nodeName), { type: "json" });
    const nodeData = this.unpackNode(nodeName, raw);
    if (nodeData) {
      const putPromise = cache.put(
        cacheUrl,
        new Response(JSON.stringify(nodeData), {
          headers: {
            "Cache-Control": "public, max-age=5, stale-while-revalidate=30",
          },
        }),
      );
      if (ctx && typeof ctx.waitUntil === "function") {
        ctx.waitUntil(putPromise);
      } else {
        putPromise.catch(() => {});
      }
      GLOBALS.NodeCache.set(
        mk,
        {
          data: nodeData,
          exp: now + Config.Defaults.CacheTTL,
        },
        Config.Defaults.CacheTTL,
      );
      return nodeData;
    }
    return null;
  },
  async listAllNodes(env, uid = "admin", ttlOverride) {
    uid = String(uid || "admin").toLowerCase();
    const kv = this.getKV(env);
    if (!kv) return [];
    const key = this.listCacheKey(uid);
    const now = Date.now();
    const forceRefresh =
      typeof ttlOverride === "number" && Number(ttlOverride) <= 0;
    const ttl = forceRefresh
      ? 0
      : Number.isFinite(Number(ttlOverride))
        ? Math.max(0, Number(ttlOverride))
        : Number(Config?.Defaults?.ListCacheTTL || 15000);
    const hit = GLOBALS.NodeListCache.get(key);
    if (!forceRefresh && hit && hit.exp > now) return hit.data;
    const inflight = GLOBALS.NodeListInflight.get(key);
    if (!forceRefresh && inflight) {
      if (hit?.data) return hit.data;
      return await inflight;
    }
    const task = (async () => {
      const prefix = this.nodePrefix(uid);
      let cursor = undefined;
      const allKeys = [];
      do {
        const list = await kv.list({ prefix, cursor, limit: 1000 });
        if (Array.isArray(list?.keys)) allKeys.push(...list.keys);
        cursor = list?.list_complete ? undefined : list?.cursor;
      } while (cursor);
      const now2 = Date.now();
      const nodes = await Promise.all(
        allKeys.map(async (k) => {
          const name = String(k?.name || "").replace(prefix, "");
          if (!name) return null;
          const mk = this.memKey(uid, name);
          const mem = GLOBALS.NodeCache.get(mk);
          let v = mem && mem.exp > now2 ? mem.data : null;
          if (!v || forceRefresh) {
            const raw = await kv.get(this.nodeKey(uid, name), { type: "json" });
            v = this.unpackNode(name, raw);
            if (v) {
              GLOBALS.NodeCache.set(
                mk,
                {
                  data: v,
                  exp: now2 + Config.Defaults.CacheTTL,
                },
                Config.Defaults.CacheTTL,
              );
            }
          }
          return v;
        }),
      );
      const out = nodes.filter(Boolean);
      out.sort((a, b) => {
        const af = !!a?.fav;
        const bf = !!b?.fav;
        if (af !== bf) return af ? -1 : 1;
        const ar = Number.isFinite(Number(a?.rank)) ? Number(a.rank) : 1e9;
        const br = Number.isFinite(Number(b?.rank)) ? Number(b.rank) : 1e9;
        if (ar !== br) return ar - br;
        return String(a?.name || "").localeCompare(
          String(b?.name || ""),
          "zh-Hans-CN",
          { sensitivity: "base" },
        );
      });
      if (ttl > 0) {
        GLOBALS.NodeListCache.set(
          key,
          { data: out, exp: Date.now() + ttl },
          ttl,
        );
      } else {
        GLOBALS.NodeListCache.delete(key);
      }
      return out;
    })().finally(() => {
      GLOBALS.NodeListInflight.delete(key);
    });
    GLOBALS.NodeListInflight.set(key, task);
    if (!forceRefresh && hit?.data) return hit.data;
    return await task;
  },
  async checkOne(target, timeoutMs = 4500) {
    const start = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(String(target || ""), {
        method: "GET",
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "User-Agent": "cf-emby-proxy-check/1.0" },
      });
      const rt = Date.now() - start;
      clearTimeout(timer);
      const ok = r.status >= 200 && r.status < 500;
      return {
        ok,
        online: ok,
        status: r.status,
        rt,
        latency: rt,
        error: "",
      };
    } catch (e) {
      clearTimeout(timer);
      const rt = Date.now() - start;
      return {
        ok: false,
        online: false,
        status: 0,
        rt,
        latency: rt,
        error:
          e?.name === "AbortError" ? "TIMEOUT" : e?.message || "CHECK_FAILED",
      };
    }
  },
  isIPv4(ip) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
  },
  isIPv6(ip) {
    return /^[0-9a-f:]+$/i.test(ip) && ip.includes(":");
  },
  async cfApi(env, method, path, body) {
    const token = String(env.CF_API_TOKEN || "").trim();
    if (!token) throw new Error("CF_API_TOKEN 未配置");
    const r = await fetch("https://api.cloudflare.com/client/v4" + path, {
      method,
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d?.success) {
      const msg =
        (d?.errors && d.errors[0] && d.errors[0].message) ||
        "CF API ERROR: " + r.status;
      throw new Error(msg);
    }
    return d;
  },
  async cfGraphQL(env, query, variables) {
    const token = String(env.CF_API_TOKEN || "").trim();
    if (!token) throw new Error("CF_API_TOKEN 未配置");
    const r = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.errors?.length) {
      throw new Error(
        "CF GraphQL ERROR: " + JSON.stringify(d?.errors || r.status),
      );
    }
    return d?.data;
  },
  getBeijingDayRange(dayStr) {
    const [y, m, d] = dayStr.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, d, -8, 0, 0));
    const end = new Date(Date.UTC(y, m - 1, d + 1, -8, 0, 0));
    return { start: start.toISOString(), end: end.toISOString() };
  },
  async getCfHttpTotal(env, dayStr) {
    const zoneId = await this.getZoneId(env);
    const { start, end } = this.getBeijingDayRange(dayStr);
    const q = `
      query($zoneTag: String!, $start: DateTime!, $end: DateTime!) {
        viewer {
          zones(filter: {zoneTag: $zoneTag}) {
            httpRequests1hGroups(
              limit: 1000,
              filter: { datetime_geq: $start, datetime_lt: $end }
            ) { sum { bytes requests } }
          }
        }
      }`;
    const data = await this.cfGraphQL(env, q, { zoneTag: zoneId, start, end });
    const groups = data?.viewer?.zones?.[0]?.httpRequests1hGroups || [];
    let bytes = 0,
      requests = 0;
    for (const g of groups) {
      bytes += Number(g?.sum?.bytes || 0);
      requests += Number(g?.sum?.requests || 0);
    }
    return { bytes, requests };
  },
  async getCfPlayback(env, dayStr) {
    const zoneId = await this.getZoneId(env);
    const { start, end } = this.getBeijingDayRange(dayStr);
    const pathRegex =
      "/(videos|playback|sessions/playing|audio|hls|dash)/|/playbackinfo|\\.(mp4|m4v|m4s|m4a|ogv|webm|mkv|mov|avi|wmv|flv|ts|m3u8|mpd)$";
    const sumGroups = (groups) => {
      let bytes = 0,
        requests = 0;
      for (const g of groups || []) {
        bytes += Number(g?.sum?.bytes || 0);
        requests += Number(g?.sum?.requests || 0);
      }
      return { bytes, requests };
    };
    const q1 = `
    query($zoneTag: String!, $start: DateTime!, $end: DateTime!, $path: String!) {
      viewer {
        zones(filter: {zoneTag: $zoneTag}) {
          httpRequests1hGroups(
            limit: 1000,
            filter: {
              datetime_geq: $start,
              datetime_lt: $end,
              clientRequestPath_matches: $path
            }
          ) { sum { bytes requests } }
        }
      }
    }`;
    try {
      const data = await this.cfGraphQL(env, q1, {
        zoneTag: zoneId,
        start,
        end,
        path: pathRegex,
      });
      const groups = data?.viewer?.zones?.[0]?.httpRequests1hGroups || [];
      return sumGroups(groups);
    } catch (e) {
      const msg = String(e?.message || e || "");
      if (!msg.includes("clientRequestPath_matches")) throw e;
      console.log(
        "getCfPlayback fallback: schema不支持 clientRequestPath_matches，返回0",
      );
      return { bytes: 0, requests: 0 };
    }
  },
  async getZoneId(env) {
    const zoneName = String(env.CF_ZONE_NAME || "").trim();
    if (!zoneName) throw new Error("CF_ZONE_NAME 未配置");
    const z = await this.cfApi(
      env,
      "GET",
      "/zones?name=" + encodeURIComponent(zoneName),
    );
    const zoneId = z?.result?.[0]?.id;
    if (!zoneId) throw new Error("未找到 Zone: " + zoneName);
    return zoneId;
  },
  normalizeDnsHost(v) {
    let s = String(v || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) {
      try {
        s = new URL(s).hostname;
      } catch {}
    }
    return s.replace(/\/.*$/, "").replace(/\.$/, "").trim();
  },
  splitDnsValues(v) {
    return Array.from(
      new Set(
        String(v || "")
          .split(/\r?\n|[;,，；| ]+/g)
          .map((x) => x.trim())
          .filter(Boolean),
      ),
    );
  },
  async deleteDnsTypeRecords(env, type, recordName) {
    const zoneId = await this.getZoneId(env);
    const q = await this.cfApi(
      env,
      "GET",
      `/zones/${zoneId}/dns_records?type=${encodeURIComponent(type)}&name=${encodeURIComponent(recordName)}`,
    );
    const arr = q?.result || [];
    for (const it of arr) {
      await this.cfApi(env, "DELETE", `/zones/${zoneId}/dns_records/${it.id}`);
    }
    return arr.length;
  },
  async upsertDnsRecords(env, type, contents = [], opts = {}) {
    const recordName = String(env.CF_RECORD_NAME || "").trim();
    if (!recordName) throw new Error("CF_RECORD_NAME 未配置");
    const zoneId = await this.getZoneId(env);
    const ttl = Math.max(1, Math.min(86400, Number(opts.ttl ?? 1)));
    const proxied = !!opts.proxied;
    const values = Array.from(new Set((contents || []).filter(Boolean)));
    const rec = await this.cfApi(
      env,
      "GET",
      `/zones/${zoneId}/dns_records?type=${encodeURIComponent(type)}&name=${encodeURIComponent(recordName)}`,
    );
    const existing = Array.isArray(rec?.result) ? rec.result : [];
    const out = [];
    for (let i = 0; i < values.length; i++) {
      const content = values[i];
      const old = existing[i];
      if (old) {
        const upd = await this.cfApi(
          env,
          "PUT",
          `/zones/${zoneId}/dns_records/${old.id}`,
          {
            type,
            name: recordName,
            content,
            ttl,
            proxied,
          },
        );
        out.push({
          action: "update",
          type,
          name: recordName,
          before: old.content || "",
          content: upd?.result?.content || content,
        });
      } else {
        const crt = await this.cfApi(
          env,
          "POST",
          `/zones/${zoneId}/dns_records`,
          {
            type,
            name: recordName,
            content,
            ttl,
            proxied,
          },
        );
        out.push({
          action: "create",
          type,
          name: recordName,
          before: "",
          content: crt?.result?.content || content,
        });
      }
    }
    for (let i = values.length; i < existing.length; i++) {
      await this.cfApi(
        env,
        "DELETE",
        `/zones/${zoneId}/dns_records/${existing[i].id}`,
      );
    }
    return out;
  },
  async resolveEffectiveDnsReplaceMode(env) {
    const kv = this.getKV(env);
    let kvMode = "";
    if (kv) {
      kvMode = String((await kv.get("sys:dns_replace_mode")) || "")
        .trim()
        .toUpperCase();
      if (!["AUTO", "A", "AAAA", "CNAME"].includes(kvMode)) kvMode = "";
    }
    try {
      const st = await this.getDnsStatus(env);
      const hasCname = Array.isArray(st?.cname) && st.cname.length > 0;
      const hasA = Array.isArray(st?.a) && st.a.length > 0;
      const hasAAAA = Array.isArray(st?.aaaa) && st.aaaa.length > 0;
      let dnsMode = "AUTO";
      if (hasCname) dnsMode = "CNAME";
      else if (hasA && !hasAAAA) dnsMode = "A";
      else if (!hasA && hasAAAA) dnsMode = "AAAA";
      if (kvMode === "A" || kvMode === "AAAA" || kvMode === "CNAME")
        return kvMode;
      if (dnsMode === "A" || dnsMode === "AAAA" || dnsMode === "CNAME")
        return dnsMode;
      return kvMode || "AUTO";
    } catch {
      return kvMode || "AUTO";
    }
  },
  async upsertDnsRecord(env, type, content) {
    const recordName = String(env.CF_RECORD_NAME || "").trim();
    if (!recordName) throw new Error("CF_RECORD_NAME 未配置");
    const replaceMode = await this.resolveEffectiveDnsReplaceMode(env);
    if (replaceMode === "A" && type === "AAAA") {
      throw new Error("当前为 A 模式，禁止写入 AAAA");
    }
    if (replaceMode === "AAAA" && type === "A") {
      throw new Error("当前为 AAAA 模式，禁止写入 A");
    }
    if (replaceMode === "CNAME" && (type === "A" || type === "AAAA")) {
      throw new Error("当前为 CNAME 模式，禁止写入 A/AAAA");
    }
    let removedCname = 0;
    if (type === "A" || type === "AAAA") {
      removedCname = await this.deleteDnsTypeRecords(env, "CNAME", recordName);
    }
    if (replaceMode === "A" && type === "A") {
      await this.deleteDnsTypeRecords(env, "AAAA", recordName);
    } else if (replaceMode === "AAAA" && type === "AAAA") {
      await this.deleteDnsTypeRecords(env, "A", recordName);
    }
    const rs = await this.upsertDnsRecords(env, type, [content], {
      ttl: 1,
      proxied: false,
    });
    const one = rs[0] || {
      action: "noop",
      type,
      name: recordName,
      before: "",
      content: String(content || ""),
    };
    return { ...one, removedCname };
  },
  async replaceDnsRecords(env, payload = {}) {
    const recordName = String(env.CF_RECORD_NAME || "").trim();
    if (!recordName) throw new Error("CF_RECORD_NAME 未配置");
    const mode = String(payload.mode || "AUTO").toUpperCase(); // CNAME / A / AAAA / AUTO
    const ttl = Math.max(1, Math.min(86400, Number(payload.ttl || 60)));
    const proxied = !!payload.proxied;
    const cname = this.normalizeDnsHost(payload.cname || "");
    const aList = this.splitDnsValues(payload.aList || "").filter((x) =>
      this.isIPv4(x),
    );
    const aaaaList = this.splitDnsValues(payload.aaaaList || "").filter((x) =>
      this.isIPv6(x),
    );
    if (mode === "CNAME") {
      if (!cname) throw new Error("CNAME 模式必须填写目标");
      await this.deleteDnsTypeRecords(env, "A", recordName);
      await this.deleteDnsTypeRecords(env, "AAAA", recordName);
      await this.upsertDnsRecords(env, "CNAME", [cname], { ttl, proxied });
    } else if (mode === "A") {
      if (!aList.length) throw new Error("A 模式至少填写一个 IPv4");
      await this.deleteDnsTypeRecords(env, "CNAME", recordName);
      await this.deleteDnsTypeRecords(env, "AAAA", recordName); // 关键：A时清空AAAA
      await this.upsertDnsRecords(env, "A", aList, { ttl, proxied });
    } else if (mode === "AAAA") {
      if (!aaaaList.length) throw new Error("AAAA 模式至少填写一个 IPv6");
      await this.deleteDnsTypeRecords(env, "CNAME", recordName);
      await this.deleteDnsTypeRecords(env, "A", recordName); // 关键：AAAA时清空A
      await this.upsertDnsRecords(env, "AAAA", aaaaList, { ttl, proxied });
    } else {
      if (!aList.length && !aaaaList.length) {
        throw new Error("AUTO 模式至少填写 A 或 AAAA 其中一项");
      }
      await this.deleteDnsTypeRecords(env, "CNAME", recordName);
      await this.upsertDnsRecords(env, "A", aList, { ttl, proxied });
      await this.upsertDnsRecords(env, "AAAA", aaaaList, { ttl, proxied });
    }
    const kv = this.getKV(env);
    if (kv) {
      await kv.put("sys:dns_replace_mode", mode);
    }
    return await this.getDnsStatus(env);
  },
  async getDnsStatus(env) {
    const recordName = String(env.CF_RECORD_NAME || "").trim();
    if (!recordName) throw new Error("CF_RECORD_NAME 未配置");
    const zoneId = await this.getZoneId(env);
    const [aRes, aaaaRes, cnameRes] = await Promise.all([
      this.cfApi(
        env,
        "GET",
        `/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(recordName)}`,
      ),
      this.cfApi(
        env,
        "GET",
        `/zones/${zoneId}/dns_records?type=AAAA&name=${encodeURIComponent(recordName)}`,
      ),
      this.cfApi(
        env,
        "GET",
        `/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(recordName)}`,
      ),
    ]);
    const kv = this.getKV(env);
    let replaceMode = "";
    if (kv) {
      const rm = String((await kv.get("sys:dns_replace_mode")) || "")
        .trim()
        .toUpperCase();
      if (["AUTO", "A", "AAAA", "CNAME"].includes(rm)) replaceMode = rm;
    }
    let lastSync = null;
    if (kv) {
      const raw = await kv.get("sys:dns_last_sync");
      if (raw) {
        lastSync = new Date(raw).toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai",
        });
      }
    }
    return {
      success: true,
      name: recordName,
      a: (aRes?.result || []).map((x) => x.content),
      aaaa: (aaaaRes?.result || []).map((x) => x.content),
      cname: (cnameRes?.result || []).map((x) => x.content),
      replaceMode,
      lastSync,
    };
  },
  num(v, defVal) {
    if (v === null || v === undefined) return defVal;
    const n = parseFloat(String(v).replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : defVal;
  },
  getByPath(obj, path) {
    try {
      return String(path || "")
        .split(".")
        .filter(Boolean)
        .reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
    } catch {
      return undefined;
    }
  },
  pickNum(obj, keys = [], defVal = null) {
    for (const k of keys) {
      const v = k.includes(".") ? this.getByPath(obj, k) : obj?.[k];
      if (v === null || v === undefined || v === "") continue;
      const n = this.num(v, Number.NaN);
      if (Number.isFinite(n)) return n;
    }
    return defVal;
  },
  toMetrics(it, line = "CN") {
    const L = String(line || "CN").toUpperCase();
    const speedKeys = [
      "speed",
      "downloadSpeed",
      "download_speed",
      "download",
      "bw",
      "bandwidth",
      "throughput",
      "rate",
      "mbps",
      "speedMbps",
      "avgSpeed",
      "speed_avg",
      "metrics.speed",
      "metrics.downloadSpeed",
      "qos.speed",
    ];
    const latencyCommon = [
      "latency",
      "latencyAvg",
      "latency_avg",
      "delay",
      "ping",
      "ms",
      "rtt",
      "rttAvg",
      "rtt_avg",
      "avgLatency",
      "responseTime",
      "time",
      "metrics.latency",
      "qos.latency",
    ];
    const lossCommon = [
      "loss",
      "lossRate",
      "loss_rate",
      "packetLoss",
      "packet_loss",
      "pkgLostRate",
      "pkg_lost_rate",
      "avgPkgLostRate",
      "pkgLostRateAvg",
      "lost",
      "dropRate",
      "drop_rate",
      "metrics.loss",
      "qos.loss",
    ];
    const latencyByLine = {
      CT: ["dxLatency", "dxLatencyAvg", "telecomLatency", "telecom.latency"],
      CU: ["ltLatency", "ltLatencyAvg", "unicomLatency", "unicom.latency"],
      CM: ["ydLatency", "ydLatencyAvg", "mobileLatency", "mobile.latency"],
      CN: ["avgLatency"],
    };
    const lossByLine = {
      CT: ["dxPkgLostRate", "dxPkgLostRateAvg", "telecomLoss", "telecom.loss"],
      CU: ["ltPkgLostRate", "ltPkgLostRateAvg", "unicomLoss", "unicom.loss"],
      CM: ["ydPkgLostRate", "ydPkgLostRateAvg", "mobileLoss", "mobile.loss"],
      CN: ["avgPkgLostRate"],
    };
    const speed = this.pickNum(it, speedKeys, null);
    const latency = this.pickNum(
      it,
      [...(latencyByLine[L] || []), ...latencyCommon, ...latencyByLine.CN],
      null,
    );
    const loss = this.pickNum(
      it,
      [...(lossByLine[L] || []), ...lossCommon, ...lossByLine.CN],
      null,
    );
    return {
      speed: Number.isFinite(speed) && speed > 0 ? speed : null,
      latency: Number.isFinite(latency) && latency > 0 ? latency : null,
      loss: Number.isFinite(loss) && loss >= 0 ? loss : null,
    };
  },
  normalizeLinePrefInput(v) {
    const base = ["CN", "CT", "CU", "CM"];
    const arr = String(v || "")
      .toUpperCase()
      .replace(/\s+/g, "")
      .split(/[,;|/]+/)
      .filter(Boolean)
      .filter((x) => base.includes(x));
    const uniq = Array.from(new Set(arr));
    return uniq.join(",");
  },
  getLineOrder(linePrefRaw) {
    const base = ["CN", "CT", "CU", "CM"];
    const pref = this.normalizeLinePrefInput(linePrefRaw)
      .split(",")
      .filter(Boolean);
    return Array.from(new Set([...pref, ...base]));
  },
  lineRank(line, lineOrder) {
    const i = lineOrder.indexOf(String(line || "").toUpperCase());
    return i >= 0 ? i : 99;
  },
  candidateCost(c) {
    const latency =
      Number.isFinite(Number(c?.latency)) && Number(c.latency) > 0
        ? Number(c.latency)
        : null;
    const loss =
      Number.isFinite(Number(c?.loss)) && Number(c.loss) >= 0
        ? Number(c.loss)
        : null;
    const linePenalty =
      Number.isFinite(Number(c?.lineRank)) && Number(c.lineRank) >= 0
        ? Number(c.lineRank) * 30
        : 0;
    let cost = 0;
    cost += latency == null ? 1800 : latency * 6;
    cost += loss == null ? 1400 : loss * 260;
    if (latency == null || loss == null) cost += 1200;
    if (latency != null && latency > 300) cost += 400;
    if (loss != null && loss > 2) cost += 500;
    return cost + linePenalty;
  },
  better(a, b) {
    if (!b) return true;
    const ca = this.candidateCost(a);
    const cb = this.candidateCost(b);
    if (ca !== cb) return ca < cb;
    const aLat = Number.isFinite(Number(a.latency))
      ? Number(a.latency)
      : Number.POSITIVE_INFINITY;
    const bLat = Number.isFinite(Number(b.latency))
      ? Number(b.latency)
      : Number.POSITIVE_INFINITY;
    if (aLat !== bLat) return aLat < bLat;
    const aLoss = Number.isFinite(Number(a.loss))
      ? Number(a.loss)
      : Number.POSITIVE_INFINITY;
    const bLoss = Number.isFinite(Number(b.loss))
      ? Number(b.loss)
      : Number.POSITIVE_INFINITY;
    if (aLoss !== bLoss) return aLoss < bLoss;
    return false;
  },
  async getIpCountryCode(ip) {
    ip = String(ip || "").trim();
    if (!ip) return "";
    const key = "geo:" + ip;
    const hit = GLOBALS.NodeCache.get(key);
    if (hit !== undefined) return String(hit || "");
    try {
      const r = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
        signal: AbortSignal.timeout(3000),
      });
      if (r.ok) {
        const j = await r.json().catch(() => ({}));
        const cc = String(j?.countryCode || "").toUpperCase();
        GLOBALS.NodeCache.set(key, cc, 10 * 60 * 1000);
        return cc;
      }
    } catch {}
    GLOBALS.NodeCache.set(key, "", 5 * 60 * 1000);
    return "";
  },
  async handleApi(request, env) {
    const auth = Auth.check(request, env);
    if (!auth.ok) return auth.response;
    const uid = "admin";
    try {
      await this.ensureProxyKvTable(env);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "初始化 proxy_kv 失败: " + (e?.message || e) }),
        {
          status: 500,
          headers: { "Content-Type": "application/json;charset=utf-8" },
        },
      );
    }
    const kv = this.getKV(env);
    if (!kv) {
      return new Response(
        JSON.stringify({ error: "D1未绑定! 请检查 EMBY_D1 / D1 / DB" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json;charset=utf-8" },
        },
      );
    }
    let data = {};
    try {
      data = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json;charset=utf-8" },
      });
    }
    const cache = caches.default;
    const invalidate = async (name) => {
      GLOBALS.NodeCache.delete(this.memKey(uid, name));
      GLOBALS.NodeHostIndexCache.delete(uid);
      GLOBALS.NodeHostIndexInflight.delete(uid);
      const lk = this.listCacheKey(uid);
      GLOBALS.NodeListCache.delete(lk);
      GLOBALS.NodeListInflight.delete(lk);
      await cache.delete(this.cacheUrl(uid, name));
    };
    switch (data.action) {
      case "dns.get": {
        try {
          const out = await this.getDnsStatus(env);
          return new Response(JSON.stringify(out), {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e?.message || "获取 DNS 状态失败" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json;charset=utf-8" },
            },
          );
        }
      }
      case "dns.replace": {
        try {
          const out = await this.replaceDnsRecords(env, data || {});
          return new Response(JSON.stringify(out), {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e?.message || "DNS 替换失败" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json;charset=utf-8" },
            },
          );
        }
      }
      case "tg.get": {
        const cfg = await this.getTgConfig(env);
        return new Response(
          JSON.stringify({ success: true, content: cfg || {} }),
          {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          },
        );
      }
      case "tg.set": {
        const cfg = data.content || {};
        let reportTime = String(cfg.reportTime || "")
          .trim()
          .replace(/[:﹕∶]/g, ":");
        const mt = /^(\d{1,2}):(\d{1,2})(:(\d{1,2})(\.\d+)?)?$/.exec(
          reportTime,
        );
        if (reportTime && !mt) {
          return new Response(
            JSON.stringify({ error: "日报推送时间格式不合法（HH:mm）" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json;charset=utf-8" },
            },
          );
        }
        if (mt) {
          const hh = Math.max(0, Math.min(23, Number(mt[1])));
          const mm = Math.max(0, Math.min(59, Number(mt[2])));
          reportTime =
            String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
        }
        const reportEveryMin = Math.max(
          60,
          Math.min(1440, Number(cfg.reportEveryMin || 60)),
        );
        const reportMaxPerDay = Math.max(
          1,
          Math.min(24, Number(cfg.reportMaxPerDay || 1)),
        );
        await this.setTgConfig(env, {
          enabled: !!cfg.enabled,
          token: String(cfg.token || "").trim(),
          chat: String(cfg.chat || "").trim(),
          reportTime: reportTime || "00:00",
          reportEveryMin,
          reportMaxPerDay,
          reportChangeOnly: cfg.reportChangeOnly !== false,
        });
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json;charset=utf-8" },
        });
      }
      case "tg.test": {
        const cfg = await this.getTgConfig(env);
        if (!cfg || !cfg.enabled || !cfg.token || !cfg.chat) {
          return new Response(
            JSON.stringify({ error: "请先在TG设置中启用并配置 Token/Chat ID" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json;charset=utf-8" },
            },
          );
        }
        const reportTime = String(cfg.reportTime || "00:00");
        const reportEveryMin = Math.max(
          60,
          Math.min(1440, Number(cfg.reportEveryMin || 60)),
        );
        const reportMaxPerDay = Math.max(
          1,
          Math.min(24, Number(cfg.reportMaxPerDay || 1)),
        );
        const text =
          "🧪【日报测试通知】\n" +
          "状态:配置正常\n" +
          "日报时间:" +
          reportTime +
          "（北京时间）\n" +
          "推送间隔:" +
          reportEveryMin +
          " 分钟（最短60）\n" +
          "每日上限:" +
          reportMaxPerDay +
          "（1~24）";
        await sendTG(cfg.token, cfg.chat, text);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json;charset=utf-8" },
        });
      }
      case "keepalive.test": {
        const cfg = await this.getTgConfig(env);
        if (!cfg || !cfg.enabled || !cfg.token || !cfg.chat) {
          return new Response(
            JSON.stringify({ error: "请先在TG设置中启用并配置 Token/Chat ID" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json;charset=utf-8" },
            },
          );
        }
        const name = String(data.displayName || data.name || "未命名节点");
        const renewDays = Math.max(0, Math.floor(Number(data.renewDays || 0)));
        const remindBeforeDays = Math.max(
          0,
          Math.floor(Number(data.remindBeforeDays || 0)),
        );
        const keepaliveAtRaw = String(data.keepaliveAt || "").trim();
        const keepaliveAt = /^([01]\d|2[0-3]):([0-5]\d)$/.test(keepaliveAtRaw)
          ? keepaliveAtRaw
          : "00:00";
        const text =
          "🧪【保号测试通知】\n" +
          "节点:" +
          name +
          "\n" +
          "保号周期:" +
          renewDays +
          "天\n" +
          "提前提醒:" +
          remindBeforeDays +
          "天\n" +
          "提醒时间:北京时间 " +
          keepaliveAt;
        await sendTG(cfg.token, cfg.chat, text);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json;charset=utf-8" },
        });
      }
      case "node.compat.autofix": {
        const vn = Validators.validateName(data.name);
        if (!vn.ok) {
          return new Response(JSON.stringify({ error: vn.error }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        }
        const name = vn.value;
        const node = await this.getNode(name, env, null, uid);
        if (!node) {
          return new Response(JSON.stringify({ error: "节点不存在" }), {
            status: 404,
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        }
        const original = String(node.realClientIpMode || "smart")
          .trim()
          .toLowerCase();
        const candidates = [];
        const pushMode = (m) => {
          const x = String(m || "")
            .trim()
            .toLowerCase();
          if (!x) return;
          if (!candidates.includes(x)) candidates.push(x);
        };
        pushMode("realip_only");
        pushMode("off");
        pushMode("dual");
        if (["realip_only", "off", "dual"].includes(original)) {
          candidates.unshift(original);
          const uniq = [];
          for (const m of candidates) if (!uniq.includes(m)) uniq.push(m);
          candidates.length = 0;
          candidates.push(...uniq);
        }
        const baseOrigin = new URL(request.url).origin;
        const secret = node?.secret
          ? "/" + encodeURIComponent(String(node.secret))
          : "";
        const probeBase = baseOrigin + "/" + encodeURIComponent(name) + secret;
        const probeUrl = probeBase + "/System/Info/Public";
        const mediaProbeUrl = probeBase + "/Items?Limit=1&StartIndex=0";
        const mediaProbeUrl2 = probeBase + "/Items/Latest?Limit=1";
        const checkProbe = async (url, timeoutMs = 4500) => {
          const start = Date.now();
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), timeoutMs);
          try {
            const r = await fetch(String(url || ""), {
              method: "GET",
              redirect: "manual",
              signal: ctrl.signal,
              headers: { "User-Agent": "cf-emby-proxy-check/1.0" },
            });
            const rt = Date.now() - start;
            clearTimeout(timer);
            let wafHit = false;
            if (r.status === 403) {
              const t = await r.text().catch(() => "");
              const s = String(t || "")
                .slice(0, 1500)
                .toLowerCase();
              if (
                s.includes("openresty") ||
                s.includes("forbidden") ||
                s.includes("cf-chl") ||
                s.includes("captcha") ||
                s.includes("/cdn-cgi/challenge")
              ) {
                wafHit = true;
              }
            }
            const ok =
              (r.status >= 200 && r.status < 400) ||
              r.status === 401 ||
              (r.status === 403 && !wafHit);
            return {
              ok,
              status: Number(r.status || 0),
              rt: Number(rt || 0),
              wafHit: !!wafHit,
              error: wafHit ? "WAF_BLOCK" : "",
            };
          } catch (e) {
            clearTimeout(timer);
            const rt = Date.now() - start;
            return {
              ok: false,
              status: 0,
              rt: Number(rt || 0),
              wafHit: false,
              error:
                e?.name === "AbortError"
                  ? "TIMEOUT"
                  : e?.message || "CHECK_FAIL",
            };
          }
        };
        const scoreOne = (r, weight = 1) => {
          let s = 0;
          if (r.wafHit) s -= 1000;
          if (r.status >= 500) s -= 400;
          else if (r.status === 403 && !r.wafHit) s -= 80;
          else if (r.status === 401) s += 120;
          else if (r.status >= 200 && r.status < 400) s += 220;
          else if (r.status >= 400) s -= 150;
          s -= Math.floor((Number(r.rt || 0) / 100) * 8);
          if (String(r.error || "") === "TIMEOUT") s -= 180;
          return s * weight;
        };
        const tried = [];
        const modeScores = {};
        let bestMode = "";
        let bestScore = -Infinity;
        for (const mode of candidates) {
          node.realClientIpMode = mode;
          await kv.put(this.nodeKey(uid, name), this.packNode(node));
          await invalidate(name);
          const r1 = await checkProbe(probeUrl, 4500);
          const r2 = await checkProbe(mediaProbeUrl, 4500);
          const r3 = await checkProbe(mediaProbeUrl2, 4500);
          const pass = !!(r1.ok && (r2.ok || r3.ok));
          const score =
            scoreOne(r1, 1.0) +
            scoreOne(r2, 1.2) +
            scoreOne(r3, 1.0) +
            (pass ? 120 : -120);
          modeScores[mode] = { pass, score };
          tried.push({
            mode,
            pass,
            score: Number(score.toFixed(2)),
            probe: {
              status: r1.status,
              rt: r1.rt,
              wafHit: r1.wafHit,
              error: String(r1.error || ""),
            },
            mediaProbe: {
              status: r2.status,
              rt: r2.rt,
              wafHit: r2.wafHit,
              error: String(r2.error || ""),
            },
            mediaProbe2: {
              status: r3.status,
              rt: r3.rt,
              wafHit: r3.wafHit,
              error: String(r3.error || ""),
            },
          });
          if (pass && score > bestScore) {
            bestScore = score;
            bestMode = mode;
          }
        }
        if (!bestMode) {
          node.realClientIpMode = original || "smart";
          await kv.put(this.nodeKey(uid, name), this.packNode(node));
          await invalidate(name);
          return new Response(
            JSON.stringify({
              success: false,
              error: "自动修复未找到可用兼容档位",
              mode: node.realClientIpMode,
              tried,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json;charset=utf-8" },
            },
          );
        }
        const STICKY_MARGIN = 0.15; // 15%
        let picked = bestMode;
        if (["realip_only", "off", "dual"].includes(original)) {
          const cur = modeScores[original];
          if (cur && cur.pass) {
            const threshold = bestScore * (1 - STICKY_MARGIN);
            if (cur.score >= threshold) picked = original;
          }
        }
        node.realClientIpMode = picked;
        await kv.put(this.nodeKey(uid, name), this.packNode(node));
        await invalidate(name);
        return new Response(
          JSON.stringify({
            success: true,
            name,
            mode: picked,
            bestMode,
            bestScore: Number(bestScore.toFixed(2)),
            tried,
          }),
          {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          },
        );
      }
      case "list": {
        let nodes = [];
        try {
          nodes = await this.listAllNodes(env, uid, 0);
        } catch (e) {
          return new Response(
            JSON.stringify({ error: "读取节点失败: " + (e?.message || e) }),
            {
              status: 500,
              headers: { "Content-Type": "application/json;charset=utf-8" },
            },
          );
        }
        let withLast = nodes;
        try {
          const db = await this.ensureKeepaliveStateTable(env);
          if (db) {
            const lastMap = {};
            let rows = null;
            try {
              rows = await db
                .prepare(
                  "SELECT node AS n, last_play_ts AS ts FROM keepalive_state",
                )
                .all();
            } catch (_) {}
            if (!rows) {
              try {
                rows = await db
                  .prepare(
                    "SELECT node_name AS n, last_run_ts AS ts FROM keepalive_state",
                  )
                  .all();
              } catch (_) {}
            }
            (rows?.results || []).forEach((r) => {
              const k = String(r.n || "")
                .trim()
                .toLowerCase();
              if (k) lastMap[k] = Number(r.ts || 0);
            });
            withLast = nodes.map((n) => {
              const key = String(n.name || "")
                .trim()
                .toLowerCase();
              return { ...n, lastPlayAt: lastMap[key] || 0 };
            });
          }
        } catch (_) {
          withLast = nodes; // 不阻塞登录
        }
        return new Response(JSON.stringify({ nodes: withLast, uid }), {
          headers: { "Content-Type": "application/json;charset=utf-8" },
        });
      }
      case "toggleFav": {
        const vn = Validators.validateName(data.name);
        if (!vn.ok) {
          return new Response(JSON.stringify({ error: vn.error }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        }
        const name = vn.value;
        const raw = await kv.get(this.nodeKey(uid, name), { type: "json" });
        const node = this.unpackNode(name, raw);
        if (!node) {
          return new Response(JSON.stringify({ error: "节点不存在" }), {
            status: 404,
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        }
        node.fav = !node.fav;
        await kv.put(this.nodeKey(uid, name), this.packNode(node));
        await invalidate(name);
        return new Response(
          JSON.stringify({ success: true, name, fav: node.fav }),
          {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          },
        );
      }
      case "saveOrder": {
        const names = Array.isArray(data.names) ? data.names : [];
        if (!names.length) {
          return new Response(JSON.stringify({ success: true, saved: 0 }), {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        }
        let saved = 0;
        for (let i = 0; i < names.length; i++) {
          const vn = Validators.validateName(names[i]);
          if (!vn.ok) continue;
          const name = vn.value;
          const raw = await kv.get(this.nodeKey(uid, name), { type: "json" });
          const node = this.unpackNode(name, raw);
          if (!node) continue;
          node.rank = i + 1;
          await kv.put(this.nodeKey(uid, name), this.packNode(node));
          await invalidate(name);
          saved++;
        }
        return new Response(JSON.stringify({ success: true, saved }), {
          headers: { "Content-Type": "application/json;charset=utf-8" },
        });
      }
      case "save":
      case "import": {
        const items = data.action === "save" ? [data] : data.nodes;
        if (!Array.isArray(items)) {
          return new Response(JSON.stringify({ error: "nodes 必须为数组" }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        }
        let saved = 0;
        const errors = [];
        for (const raw of items) {
          const v = Validators.validateNodeInput(raw);
          if (!v.ok) {
            errors.push({ name: raw?.name || "", error: v.error });
            continue;
          }
          const n = v.value;
          const oldNameRaw = String(raw?.oldName || "")
            .trim()
            .toLowerCase();
          const oldName = Validators.NAME_RE.test(oldNameRaw) ? oldNameRaw : "";
          const newKey = this.nodeKey(uid, n.name);
          const prevName = oldName || n.name;
          const prevRaw = await kv.get(this.nodeKey(uid, prevName), {
            type: "json",
          });
          if (data.action === "save") {
            if (oldName && !prevRaw) {
              errors.push({
                name: n.name,
                error: "原节点不存在（可能已删除或列表过期），请刷新后重试",
              });
              continue;
            }
            const exists = await kv.get(newKey);
            if (!oldName && exists) {
              errors.push({
                name: n.name,
                error: "请求路径重复:该节点已存在",
              });
              continue;
            }
            if (oldName && oldName !== n.name && exists) {
              errors.push({
                name: n.name,
                error: "请求路径重复:该节点已存在",
              });
              continue;
            }
          }
          let toSave = n;
          if (data.action === "save") {
            const prevNode = this.unpackNode(prevName, prevRaw);
            const hasFavInPayload =
              raw && Object.prototype.hasOwnProperty.call(raw, "fav");
            const hasRankInPayload =
              raw && Object.prototype.hasOwnProperty.call(raw, "rank");
            const keepFav = hasFavInPayload ? !!n.fav : !!prevNode?.fav;
            let keepRank;
            if (hasRankInPayload) {
              keepRank = Number.isFinite(Number(n.rank))
                ? Number(n.rank)
                : undefined;
            } else {
              keepRank = Number.isFinite(Number(prevNode?.rank))
                ? Number(prevNode.rank)
                : undefined;
            }
            toSave = { ...n, fav: keepFav, rank: keepRank };
          }
          await kv.put(newKey, this.packNode(toSave));
          await invalidate(n.name);
          if (data.action === "save" && oldName && oldName !== n.name) {
            await kv.delete(this.nodeKey(uid, oldName));
            await invalidate(oldName);
          }
          saved++;
        }
        return new Response(
          JSON.stringify({
            success: true,
            saved,
            failed: errors.length,
            errors,
          }),
          {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          },
        );
      }
      case "delete": {
        const vn = Validators.validateName(data.name);
        if (!vn.ok) {
          return new Response(JSON.stringify({ error: vn.error }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        }
        const name = vn.value;
        await kv.delete(this.nodeKey(uid, name));
        await invalidate(name);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json;charset=utf-8" },
        });
      }
      case "batchDelete": {
        const names = Array.isArray(data.names) ? data.names : [];
        let count = 0;
        for (const n of names) {
          const vn = Validators.validateName(n);
          if (!vn.ok) continue;
          const name = vn.value;
          await kv.delete(this.nodeKey(uid, name));
          await invalidate(name);
          count++;
        }
        return new Response(JSON.stringify({ success: true, count }), {
          headers: { "Content-Type": "application/json;charset=utf-8" },
        });
      }
      case "batchTag": {
        const names = Array.isArray(data.names) ? data.names : [];
        const tag = Validators.validateTag(data.tag || "").value;
        let count = 0;
        for (const n of names) {
          const vn = Validators.validateName(n);
          if (!vn.ok) continue;
          const name = vn.value;
          const key = this.nodeKey(uid, name);
          const cur = await kv.get(key, { type: "json" });
          const node = this.unpackNode(name, cur);
          if (node) {
            node.tag = tag;
            await kv.put(key, this.packNode(node));
            await invalidate(name);
            count++;
          }
        }
        return new Response(JSON.stringify({ success: true, count }), {
          headers: { "Content-Type": "application/json;charset=utf-8" },
        });
      }
      case "compactAll": {
        const prefix = this.nodePrefix(uid);
        const limit = Math.max(1, Math.min(1000, Number(data.limit) || 500));
        const cursor = data.cursor ? String(data.cursor) : undefined;
        const dryRun = !!data.dryRun;
        const list = await kv.list({ prefix, cursor, limit });
        let scanned = 0,
          rewritten = 0,
          skipped = 0,
          invalid = 0;
        for (const k of list.keys || []) {
          scanned++;
          const name = k.name.slice(prefix.length);
          const raw = await kv.get(k.name, { type: "json" });
          const node = this.unpackNode(name, raw);
          if (!node) {
            invalid++;
            continue;
          }
          const isOldFormat =
            raw &&
            typeof raw === "object" &&
            ("target" in raw ||
              "secret" in raw ||
              "tag" in raw ||
              "note" in raw);
          if (!isOldFormat) {
            skipped++;
            continue;
          }
          if (!dryRun) {
            await kv.put(k.name, this.packNode(node));
            await invalidate(name);
          }
          rewritten++;
        }
        const done = !!list.list_complete;
        return new Response(
          JSON.stringify({
            success: true,
            dryRun,
            scanned,
            rewritten,
            skipped,
            invalid,
            done,
            nextCursor: done ? null : list.cursor,
          }),
          {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          },
        );
      }
      case "checkStatus": {
        try {
          const baseOrigin = new URL(request.url).origin;
          const buildProxyUrl = (n) => {
            const name = encodeURIComponent(String(n?.name || "").trim());
            if (!name) return "";
            const secret = n?.secret
              ? "/" + encodeURIComponent(String(n.secret))
              : "";
            return baseOrigin + "/" + name + secret;
          };
          const buildTestUrl = (proxyUrl) => {
            if (!proxyUrl) return "";
            return proxyUrl.replace(/\/+$/, "") + "/System/Info/Public";
          };
          let target = [];
          if (Array.isArray(data.names) && data.names.length > 0) {
            const names = data.names
              .map((x) => Validators.validateName(x))
              .filter((x) => x.ok)
              .map((x) => x.value);
            const uniq = [...new Set(names)];
            const got = await Promise.all(
              uniq.map((n) => this.getNode(n, env, null, uid)),
            );
            target = got.filter(Boolean);
          } else {
            target = await this.listAllNodes(env, uid);
          }
          const results = [];
          const concurrency = 6;
          let idx = 0;
          const worker = async () => {
            while (idx < target.length) {
              const i = idx++;
              const n = target[i];
              if (!n || !n.name) {
                results.push({
                  name: n?.name || "",
                  ok: false,
                  online: false,
                  status: 0,
                  rt: 0,
                  latency: 0,
                  error: "NO_NODE",
                });
                continue;
              }
              const proxyUrl = buildProxyUrl(n);
              const urlToCheck = buildTestUrl(proxyUrl);
              if (!urlToCheck) {
                results.push({
                  name: n.name || "",
                  ok: false,
                  online: false,
                  status: 0,
                  rt: 0,
                  latency: 0,
                  checked: "",
                  error: "NO_PROXY_URL",
                });
                continue;
              }
              const r = await this.checkOne(urlToCheck, 4500);
              results.push({
                name: n.name || "",
                ok: !!r.ok,
                online: !!r.online,
                status: r.status || 0,
                rt: r.rt || 0,
                latency: r.latency || r.rt || 0,
                checked: urlToCheck,
                error: r.error || "",
              });
            }
          };
          await Promise.all(
            Array.from(
              { length: Math.min(concurrency, Math.max(1, target.length)) },
              () => worker(),
            ),
          );
          return new Response(JSON.stringify({ success: true, results }), {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({
              success: false,
              results: [],
              error: "CHECK_STATUS_FAIL: " + (e?.message || String(e)),
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json;charset=utf-8" },
            },
          );
        }
      }
      default:
        return new Response("Invalid Action", { status: 400 });
    }
  },
  getHostIndexTTL() {
    return 6 * 60 * 60 * 1000;
  },
  async rebuildHostIndex(env, uid = "admin") {
    uid = String(uid || "admin").toLowerCase();
    const nodes = await this.listAllNodes(env, uid);
    const hostMap = new Map();
    for (const n of nodes) {
      const targets = String(n?.target || "")
        .split(/\r?\n|[;,，；|]+/g)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const t of targets) {
        try {
          const h = new URL(t).host.toLowerCase();
          if (!hostMap.has(h)) {
            hostMap.set(h, { uid, name: n.name, secret: n.secret || "" });
          }
        } catch {}
      }
    }
    const hostIndexTTL = this.getHostIndexTTL();
    GLOBALS.NodeHostIndexCache.set(
      uid,
      {
        hostMap,
        exp: Date.now() + hostIndexTTL,
      },
      hostIndexTTL,
    );
    return hostMap;
  },
  async getHostIndex(env, uid = "admin") {
    uid = String(uid || "admin").toLowerCase();
    const now = Date.now();
    const hit = GLOBALS.NodeHostIndexCache.get(uid);
    if (hit && hit.exp > now) return hit.hostMap;
    if (hit && hit.hostMap) {
      if (!GLOBALS.NodeHostIndexInflight.has(uid)) {
        const p = this.rebuildHostIndex(env, uid).finally(() => {
          GLOBALS.NodeHostIndexInflight.delete(uid);
        });
        GLOBALS.NodeHostIndexInflight.set(uid, p);
      }
      return hit.hostMap;
    }
    let p = GLOBALS.NodeHostIndexInflight.get(uid);
    if (!p) {
      p = this.rebuildHostIndex(env, uid).finally(() => {
        GLOBALS.NodeHostIndexInflight.delete(uid);
      });
      GLOBALS.NodeHostIndexInflight.set(uid, p);
    }
    return await p;
  },
};
const ProxyHandler = {
  getNodeTargets(node) {
    return String(node?.target || "")
      .split(/\r?\n|[;,，；|]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  },
  buildRawAllowHosts(node, env) {
    const set = new Set();
    for (const t of this.getNodeTargets(node)) {
      try {
        set.add(new URL(t).host.toLowerCase());
      } catch {}
    }
    const extra = String(env.RAW_ALLOW_HOSTS || "").trim();
    if (extra) {
      for (const h of extra.split(",")) {
        const v = h.trim().toLowerCase();
        if (v) set.add(v);
      }
    }
    return set;
  },
  routePrefix(name, key, uid = "admin") {
    const n = encodeURIComponent(String(name || ""));
    const k = String(key || "");
    const u = String(uid || "admin").toLowerCase();
    const base =
      u && u !== "admin" ? `/u/${encodeURIComponent(u)}/${n}` : `/${n}`;
    return k ? `${base}/${encodeURIComponent(k)}` : base;
  },
  sameHost(a, b) {
    try {
      const ua = new URL(a);
      const ub = new URL(b);
      const ha = ua.hostname.toLowerCase();
      const hb = ub.hostname.toLowerCase();
      if (ha !== hb) return false;
      const pa = ua.port || (ua.protocol === "https:" ? "443" : "80");
      const pb = ub.port || (ub.protocol === "https:" ? "443" : "80");
      return pa === pb;
    } catch {
      return false;
    }
  },
  isEmosNode(node, targetUrl, env) {
    const tag = String(node?.tag || "").toLowerCase();
    if (tag.includes("emos")) return true;
    const hosts = String(env.EMOS_MATCH_HOSTS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    let h = "";
    try {
      h = String(targetUrl?.hostname || "").toLowerCase();
    } catch {}
    return !!h && hosts.includes(h);
  },
  applyEmosHeaders(h, request, env) {
    const pid = String(env.EMOS_PROXY_ID || "").trim();
    const pname = String(env.EMOS_PROXY_NAME || "").trim();
    if (pid) h.set("EMOS-PROXY-ID", pid);
    if (pname) h.set("EMOS-PROXY-NAME", pname);
    const rawIp =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      request.headers.get("X-Real-IP") ||
      "";
    if (rawIp) {
      const ip = String(rawIp).split(",")[0].trim();
      h.set("X-Forwarded-For", ip);
      h.set("X-Real-IP", ip);
      h.set("X-FORWARDED-FOR", ip); // 兼容你原有EMOS侧大小写习惯
    }
    const rg = request.headers.get("Range");
    if (rg) h.set("Range", rg);
  },
  applyClientIpHeaders(h, request, env = null, node = null, forcedMode = "") {
    const rawIp =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      request.headers.get("X-Real-IP") ||
      "";
    const ip = String(rawIp || "")
      .split(",")[0]
      .trim();
    h.delete("X-Forwarded-For");
    h.delete("X-Real-IP");
    h.delete("X-FORWARDED-FOR");
    const norm = (v) => {
      const s = String(v || "")
        .trim()
        .toLowerCase();
      if (!s) return "";
      if (["dual", "forward", "both", "full", "on", "1"].includes(s))
        return "dual";
      if (["realip_only", "realip", "strip", "x-real-ip", "single"].includes(s))
        return "realip_only";
      if (["off", "disable", "none", "close", "0"].includes(s)) return "off";
      if (["smart", "auto"].includes(s)) return "smart";
      return "";
    };
    let mode =
      norm(forcedMode) ||
      norm(node?.realClientIpMode) ||
      norm(env?.REAL_IP_HEADER_MODE) ||
      "smart";
    if (String(env?.DISABLE_REAL_IP_PASS || "0") === "1") mode = "off";
    if (mode === "smart") mode = "realip_only";
    if (!ip || mode === "off") return mode;
    h.set("X-Real-IP", ip);
    if (mode === "dual") {
      h.set("X-Forwarded-For", ip);
      h.set("X-FORWARDED-FOR", ip); // 保留你原有兼容习惯
    }
    return mode;
  },
  isPanUrl(urlLike) {
    try {
      const u = typeof urlLike === "string" ? new URL(urlLike) : urlLike;
      const host = u.hostname.toLowerCase();
      return FIXED_PROXY_RULES.WANGPAN_KEYWORDS.some((k) => {
        const key = String(k).toLowerCase();
        if (host === key || host.endsWith("." + key)) return true;
        return !key.includes(".") && host.includes(key);
      });
    } catch {
      return false;
    }
  },
  getDirectAdapter(urlLike) {
    try {
      const u = typeof urlLike === "string" ? new URL(urlLike) : urlLike;
      const hay = `${u.host}${u.pathname}${u.search}`.toLowerCase();
      for (const a of DIRECT_RULES.ADAPTERS) {
        if (
          (a.keywords || []).some((k) => hay.includes(String(k).toLowerCase()))
        ) {
          return a;
        }
      }
      return {
        name: this.isPanUrl(u) ? "generic-pan" : "generic",
        forceProxy: !!FIXED_PROXY_RULES.FORCE_EXTERNAL_PROXY,
        referer: FIXED_PROXY_RULES.WANGPAN_REFERER || "",
        keepOrigin: false,
        keepReferer: false,
      };
    } catch {
      return {
        name: "generic",
        forceProxy: !!FIXED_PROXY_RULES.FORCE_EXTERNAL_PROXY,
        referer: "",
        keepOrigin: false,
        keepReferer: false,
      };
    }
  },
  isNodeDirectExternal(node) {
    return toBool(node?.directExternal);
  },
  isPanLikeUrl(urlLike) {
    const s = String(urlLike || "").toLowerCase();
    return (FIXED_PROXY_RULES.WANGPAN_KEYWORDS || []).some((k) =>
      s.includes(String(k).toLowerCase()),
    );
  },
  buildDirectOutboundHeaders(
    request,
    targetUrl,
    env,
    node = null,
    mode = "normal",
  ) {
    const u = typeof targetUrl === "string" ? new URL(targetUrl) : targetUrl;
    const adapter = this.getDirectAdapter(u);
    const h = new Headers(request.headers);
    this.stripClientIpHeaders(h);
    [
      "cf-connecting-ip",
      "cf-ipcountry",
      "cf-ray",
      "cf-visitor",
      "cf-worker",
      "x-forwarded-for",
      "x-real-ip",
      "x-forwarded-proto",
      "x-forwarded-host",
      "x-forwarded-port",
      "forwarded",
      "sec-fetch-site",
      "sec-fetch-mode",
      "sec-fetch-dest",
      "sec-fetch-user",
      "connection",
      "content-length",
      "origin",
      "referer",
    ].forEach((k) => h.delete(k));
    this.applyClientIpHeaders(h, request, env, node);
    h.set("Host", u.host);
    const ua = request.headers.get("User-Agent") || "";
    if (ua) h.set("User-Agent", ua);
    else h.set("User-Agent", "emby-proxy/1.0");
    const rg = request.headers.get("Range");
    if (rg) h.set("Range", rg);
    const ifRange = request.headers.get("If-Range");
    if (ifRange) h.set("If-Range", ifRange);
    const existingRef = h.get("Referer");
    if (adapter.referer && (!existingRef || !adapter.keepReferer)) {
      h.set("Referer", adapter.referer);
    }
    if (!adapter.keepOrigin) {
      h.delete("Origin");
    } else if (adapter.referer) {
      try {
        h.set("Origin", new URL(adapter.referer).origin);
      } catch {}
    }
    if (mode === "retry-no-origin") {
      h.delete("Origin");
      h.delete("Referer");
    }
    if (mode === "retry-browserish") {
      h.set(
        "User-Agent",
        request.headers.get("User-Agent") || "emby-proxy/1.0",
      );
      if (!h.get("Referer") && adapter.keepReferer && adapter.referer) {
        h.set("Referer", adapter.referer);
      }
    }
    const isEmos = this.isEmosNode(node, u, env);
    if (isEmos) this.applyEmosHeaders(h, request, env);
    return h;
  },
  buildCleanProxyHeaders(request, targetUrl, node, env, opts = {}) {
    const h = new Headers(request.headers);
    const isStreaming = !!opts.isStreaming;
    const toDelete = [
      "cf-connecting-ip",
      "cf-ipcountry",
      "cf-ray",
      "cf-visitor",
      "cf-worker",
      "x-forwarded-for",
      "x-real-ip",
      "x-forwarded-proto",
      "x-forwarded-host",
      "x-forwarded-port",
      "forwarded",
      "true-client-ip",
      "connection",
      "content-length",
    ];
    if (!isStreaming) {
      toDelete.push(
        "origin",
        "referer",
        "sec-fetch-site",
        "sec-fetch-mode",
        "sec-fetch-dest",
        "sec-fetch-user",
      );
    }
    toDelete.forEach((k) => h.delete(k));
    this.applyClientIpHeaders(h, request, env, node);
    h.set("Host", targetUrl.host);
    const ua = request.headers.get("User-Agent") || "";
    if (ua) h.set("User-Agent", ua);
    else h.set("User-Agent", "emby-proxy/1.0");
    const rg = request.headers.get("Range");
    if (rg) h.set("Range", rg);
    const ifRange = request.headers.get("If-Range");
    if (ifRange) h.set("If-Range", ifRange);
    if (isStreaming) {
      h.set("Accept-Encoding", "identity");
    }
    const isEmos = this.isEmosNode(node, targetUrl, env);
    if (isEmos) this.applyEmosHeaders(h, request, env);
    return h;
  },
  stripClientIpHeaders(h) {
    if (!h) return h;
    h.delete("CF-Connecting-IP");
    h.delete("X-Forwarded-For");
    h.delete("X-Real-IP");
    h.delete("True-Client-IP");
    h.delete("Forwarded");
    h.delete("X-Forwarded-Proto");
    h.delete("X-Forwarded-Host");
    h.delete("X-Forwarded-Port");
    return h;
  },
  async handle(request, node, path, name, key, env, uid = "admin", ctx = null) {
    const targets = this.getNodeTargets(node);
    if (!targets.length) {
      return new Response("Invalid node target", { status: 500 });
    }
    const nodeKey = `${String(uid || "admin").toLowerCase()}:${String(name || node?.name || "")}`;
    const total = targets.length;
    let start = Number(GLOBALS.LineCursor.get(nodeKey) || 0);
    if (!Number.isFinite(start) || start < 0) start = 0;
    if (total > 0) start = start % total;
    const ordered = targets.slice(start).concat(targets.slice(0, start));
    let lastRes = null;
    let tried = 0;
    for (const t of ordered) {
      const banKey = `${nodeKey}|${t}`;
      const banned = !!GLOBALS.LineBan.get(banKey);
      if (banned && total > 1) continue;
      tried++;
      try {
        const nodeTry = { ...node, target: t };
        const res = await this.handleOneTarget(
          request,
          nodeTry,
          path,
          name,
          key,
          env,
          uid,
          ctx,
        );
        const status = Number(res?.status || 0);
        const shouldTryNext =
          !res ||
          status >= 500 ||
          status === 403 ||
          status === 404 ||
          status === 416;
        if (!shouldTryNext) {
          const realIdx = targets.indexOf(t);
          GLOBALS.LineCursor.set(nodeKey, (realIdx + 1) % total);
          return res;
        }
        GLOBALS.LineBan.set(
          banKey,
          1,
          Math.max(60000, Number(Config?.Defaults?.LineBanMs || 300000)),
        );
        lastRes = res;
      } catch (e) {
        GLOBALS.LineBan.set(
          banKey,
          1,
          Math.max(60000, Number(Config?.Defaults?.LineBanMs || 300000)),
        );
        lastRes = this.errResp(e);
      }
    }
    if (tried === 0) {
      for (const t of ordered) {
        try {
          const nodeTry = { ...node, target: t };
          const res = await this.handleOneTarget(
            request,
            nodeTry,
            path,
            name,
            key,
            env,
            uid,
            ctx,
          );
          const status = Number(res?.status || 0);
          const shouldTryNext =
            !res ||
            status >= 500 ||
            status === 403 ||
            status === 404 ||
            status === 416;
          if (!shouldTryNext) {
            const realIdx = targets.indexOf(t);
            GLOBALS.LineCursor.set(nodeKey, (realIdx + 1) % total);
            return res;
          }
          lastRes = res;
        } catch (e) {
          lastRes = this.errResp(e);
        }
      }
    }
    return (
      lastRes ||
      new Response("Proxy Error: all targets failed", { status: 502 })
    );
  },
  async handleOneTarget(
    request,
    node,
    path,
    name,
    key,
    env,
    uid = "admin",
    ctx = null,
  ) {
    let base = new URL(node.target);
    const isEmos = this.isEmosNode(node, base, env);
    const ua = request.headers.get("User-Agent") || "";
    const isCapy = /CapyPlayer|Dart/i.test(ua);
    let forwardPath = path || "/";
    const basePath = (base.pathname || "").replace(/\/+$/, "");
    if (/^\/emby(\/|$)/i.test(forwardPath) && /^\/emby(\/|$)/i.test(basePath)) {
      forwardPath = forwardPath.replace(/^\/emby/i, "") || "/";
    }
    const capyStrip = String(env.CAPY_STRIP_EMBY || "0") === "1";
    if (capyStrip && isCapy && /^\/emby(\/|$)/i.test(forwardPath)) {
      forwardPath = forwardPath.replace(/^\/emby/i, "") || "/";
    }
    if (
      node.mode === "split" &&
      !node.streamTarget &&
      forwardPath.startsWith("/__raw__/")
    ) {
      let raw = forwardPath.slice("/__raw__/".length);
      try {
        raw = decodeURIComponent(raw);
      } catch {}
      let u;
      try {
        u = new URL(raw);
      } catch {
        return new Response("Bad raw url", { status: 400 });
      }
      if (!/^https?:/i.test(raw)) {
        return new Response("Bad Request", { status: 400 });
      }
      const allowHosts = this.buildRawAllowHosts(node, env);
      const allowAnyWhenSplitNoStream =
        String(env.RAW_ALLOW_ANY || "0") === "1";
      if (!allowHosts.has(u.host.toLowerCase()) && !allowAnyWhenSplitNoStream) {
        return new Response("Forbidden raw host", { status: 403 });
      }
      return this.handleDirect(request, raw, env, node);
    }
    const reqUrl = new URL(request.url);
    const finalUrl = new URL(forwardPath, base);
    finalUrl.search = reqUrl.search;
    const isStrm = /\.strm$/i.test(finalUrl.pathname);
    const isEmbyStreamStrm = /\/emby\/videos\/[^/]+\/stream\.strm$/i.test(
      finalUrl.pathname,
    );
    if (isStrm && !isEmbyStreamStrm) {
      try {
        const hStrm = new Headers(request.headers);
        hStrm.delete("Range");
        hStrm.delete("If-Range");
        const resStrm = await this.fetchWithProtocolFallback(finalUrl, {
          method: "GET",
          headers: hStrm,
          redirect: "follow",
          cf: { cacheEverything: false, cacheTtl: 0 },
        });
        if (!resStrm.ok) return resStrm;
        const text = (await resStrm.text()).trim();
        const line =
          text
            .split(/\r?\n/)
            .map((s) => s.trim())
            .find((s) => s && !s.startsWith("#")) || "";
        if (!/^https?:\/\//i.test(line)) {
          return new Response("Bad STRM", { status: 400 });
        }
        const targetUrl = new URL(line);
        if (!/^https?:$/i.test(targetUrl.protocol)) {
          return new Response("Bad STRM URL", { status: 400 });
        }
        const reqNoQueryUrl = new URL(request.url);
        reqNoQueryUrl.search = "";
        const reqNoQuery = new Request(reqNoQueryUrl.toString(), request);
        const resDirect = await this.handleDirect(
          reqNoQuery,
          targetUrl.toString(),
          env,
          node,
        );
        const logTask = Database.logPlayback(
          env,
          node,
          request,
          resDirect,
          true,
          resDirect && resDirect.status >= 300 && resDirect.status < 400
            ? "direct"
            : "proxy",
        );
        if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(logTask);
        else logTask.catch(() => {});
        return resDirect;
      } catch {
        return new Response("STRM parse error", { status: 500 });
      }
    }
    if ((request.headers.get("Upgrade") || "").toLowerCase() === "websocket") {
      return await this.handleWebSocket(finalUrl, request);
    }
    if (request.method === "OPTIONS") return this.renderCors(request, env);
    const isStreaming = GLOBALS.Regex.Streaming.test(forwardPath);
    const isStatic =
      (GLOBALS.Regex.StaticExt.test(forwardPath) ||
        GLOBALS.Regex.EmbyImages.test(forwardPath)) &&
      request.method === "GET";
    const h = new Headers(request.headers);
    this.stripClientIpHeaders(h);
    const p = finalUrl.pathname.toLowerCase();
    const isAuthApi = /\/users\/authenticate(byname)?/i.test(p);
    const isPlaybackApi =
      p.includes("/emby/") &&
      (p.includes("/videos/") ||
        p.includes("/playback/") ||
        p.includes("/sessions/playing") ||
        (p.includes("/items/") &&
          (p.includes("/download") ||
            p.includes("/stream") ||
            p.includes("/file"))) ||
        p.includes("/audio/") ||
        p.includes("/hls/") ||
        p.includes("/dash/") ||
        /\.m3u8$/i.test(p) ||
        /\.mpd$/i.test(p) ||
        /\.mkv$/i.test(p) ||
        /\.mp4$/i.test(p) ||
        /\.ts$/i.test(p) ||
        /\.m4s$/i.test(p));
    const needCompatOrigin = isAuthApi || isPlaybackApi;
    if (isCapy && isAuthApi) {
      h.delete("X-Emby-Token");
      h.delete("X-MediaBrowser-Token");
      h.delete("X-Authorization");
      const az = h.get("Authorization") || "";
      if (/^(Bearer|Token)\s+/i.test(az)) h.delete("Authorization");
      if (!h.get("Content-Type"))
        h.set("Content-Type", "application/json;charset=utf-8");
    }
    h.set("Host", base.host);
    const authz = h.get("Authorization") || "";
    const xEmby = h.get("X-Emby-Authorization") || "";
    if (!isAuthApi && /^MediaBrowser\s+/i.test(authz) && !xEmby) {
      h.set("X-Emby-Authorization", authz);
    }
    if (!isAuthApi && !authz && xEmby) {
      h.set("Authorization", xEmby);
    }
    if (needCompatOrigin) {
      if (isPlaybackApi) {
        h.delete("Origin");
        h.delete("Referer");
        h.delete("Sec-Fetch-Site");
        h.delete("Sec-Fetch-Mode");
        h.delete("Sec-Fetch-Dest");
        h.delete("Sec-Fetch-User");
        h.set("Accept", "*/*");
      } else {
        if (!h.get("Origin")) h.set("Origin", reqUrl.origin);
        if (!h.get("Referer")) h.set("Referer", reqUrl.origin + "/");
        if (!h.get("Accept"))
          h.set("Accept", "application/json, text/plain, */*");
        if (isAuthApi && !h.get("X-Requested-With")) {
          h.set("X-Requested-With", "XMLHttpRequest");
        }
      }
    }
    const currentUa = request.headers.get("User-Agent") || "";
    if (currentUa) h.set("User-Agent", currentUa);
    else h.set("User-Agent", "emby-proxy/1.0");
    [
      "cf-connecting-ip",
      "cf-ipcountry",
      "cf-ray",
      "cf-visitor",
      "cf-worker",
    ].forEach((x) => h.delete(x));
    this.applyClientIpHeaders(h, request, env, node);
    if (isPlaybackApi) {
      [
        "sec-fetch-site",
        "sec-fetch-mode",
        "sec-fetch-dest",
        "sec-fetch-user",
        "priority",
      ].forEach((x) => h.delete(x));
    }
    if (isStatic) h.delete("Range");
    if (isEmos) this.applyEmosHeaders(h, request, env);
    let cf = { cacheEverything: false, cacheTtl: 0 };
    if (isStatic) {
      const ck = new URL(finalUrl.toString());
      [
        "X-Emby-Token",
        "api_key",
        "X-Emby-Authorization",
        "_",
        "t",
        "stamp",
        "random",
      ].forEach((k) => ck.searchParams.delete(k));
      ck.searchParams.sort();
      cf = {
        cacheEverything: true,
        cacheTtl: Number(Config.Defaults.StaticCacheTtl || 604800),
        cacheKey: ck.toString(),
        cacheTtlByStatus: {
          "200-299": Number(Config.Defaults.StaticCacheTtl || 604800),
          404: 60,
          "500-599": 0,
        },
      };
    }
    if (isEmos) {
      const pp = finalUrl.pathname.toLowerCase();
      const d = Config.Defaults;
      if (/^\/emby\/items\/.+\/images\//i.test(pp)) {
        cf = {
          ...(cf || {}),
          cacheEverything: true,
          cacheTtl: Number(d.ImageCacheTtl || 86400),
        };
      }
      if (pp === "/emby/system/ping") {
        cf = {
          ...(cf || {}),
          cacheEverything: true,
          cacheTtl: Number(d.PingCacheTtl || 60),
        };
      }
      if (pp.startsWith("/emby/sessions/playing/progress")) {
        cf = { ...(cf || {}), cacheEverything: false, cacheTtl: 0 };
        const m = request.method.toUpperCase();
        if (m !== "OPTIONS") {
          const rawIp =
            request.headers.get("CF-Connecting-IP") ||
            request.headers.get("X-Forwarded-For") ||
            request.headers.get("X-Real-IP") ||
            "unknown";
          const ip = String(rawIp).split(",")[0].trim() || "unknown";
          const deviceId = String(
            request.headers.get("X-Emby-Device-Id") || "",
          ).slice(0, 64);
          const sessionId =
            String(finalUrl.searchParams.get("SessionId") || "") ||
            String(finalUrl.searchParams.get("sessionId") || "");
          const tk = `${ip}|${deviceId}|${sessionId}`;
          if (GLOBALS.ProgressThrottle.get(tk)) {
            return new Response(null, {
              status: 204,
              headers: { "Cache-Control": "no-store" },
            });
          }
          GLOBALS.ProgressThrottle.set(
            tk,
            1,
            Number(d.ProgressThrottleMs || 1200),
          );
        }
      }
    }
    try {
      const method = request.method.toUpperCase();
      const replayBody =
        method === "GET" || method === "HEAD"
          ? null
          : await request.clone().arrayBuffer();
      const isImageApi =
        /\/emby\/items\/.+\/images\//i.test(finalUrl.pathname) ||
        GLOBALS.Regex.EmbyImages.test(finalUrl.pathname);
      if (
        isImageApi &&
        (request.method === "GET" || request.method === "HEAD")
      ) {
        const ck = new URL(finalUrl.toString());
        [
          "X-Emby-Token",
          "api_key",
          "X-Emby-Authorization",
          "_",
          "t",
          "stamp",
          "random",
        ].forEach((k) => ck.searchParams.delete(k));
        ck.searchParams.sort();
        cf = {
          cacheEverything: true,
          cacheTtl: Number(Config.Defaults.StaticCacheTtl || 604800),
          cacheKey: ck.toString(),
          cacheTtlByStatus: {
            "200-299": Number(Config.Defaults.StaticCacheTtl || 604800),
            404: 60,
            "500-599": 0,
          },
        };
      }
      const isAdditionalPartsApi = /\/emby\/videos\/.+\/additionalparts/i.test(
        finalUrl.pathname,
      );
      if (isAuthApi && request.method.toUpperCase() === "POST") {
        const rawAuthUrl = new URL(finalUrl.toString());
        const embyAuthUrl = new URL(finalUrl.toString());
        if (!/^\/emby\//i.test(embyAuthUrl.pathname)) {
          embyAuthUrl.pathname = "/emby" + embyAuthUrl.pathname;
        }
        const authUrls = [];
        const pushUrl = (u) => {
          const s = u.toString();
          if (!authUrls.some((x) => x.toString() === s)) authUrls.push(u);
        };
        pushUrl(embyAuthUrl);
        pushUrl(rawAuthUrl);
        const makeHeaders = (mode) => {
          const hh = new Headers(h);
          hh.set("Accept", "application/json, text/plain, */*");
          hh.set("Content-Type", "application/json;charset=utf-8");
          hh.set(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          );
          if (mode === "with-origin") {
            hh.set("Origin", reqUrl.origin);
            hh.set("Referer", reqUrl.origin + "/");
          } else {
            hh.delete("Origin");
            hh.delete("Referer");
          }
          return hh;
        };
        const isAuthApiSuccessLike = (resp) => {
          if ([301, 302, 303, 307, 308].includes(resp.status)) return false;
          const ct = String(
            resp.headers.get("Content-Type") || "",
          ).toLowerCase();
          if (!ct.includes("application/json")) return false;
          return resp.status === 200 || resp.status === 401;
        };
        let authResp = null;
        for (const u of authUrls) {
          for (const mode of ["with-origin", "no-origin"]) {
            const resp = await this.fetchWithProtocolFallback(u, {
              method: request.method,
              headers: makeHeaders(mode),
              body: replayBody ? replayBody.slice(0) : null,
              redirect: "manual",
              cf: { cacheEverything: false, cacheTtl: 0 },
            });
            if (isAuthApiSuccessLike(resp)) {
              authResp = resp;
              break;
            }
          }
          if (authResp) break;
        }
        if (authResp) {
          return new Response(authResp.body, {
            status: authResp.status,
            statusText: authResp.statusText,
            headers: new Headers(authResp.headers),
          });
        }
      }
      const nodeDirect = this.isNodeDirectExternal(node);
      const isGetLike = request.method === "GET" || request.method === "HEAD";
      if (nodeDirect && isPlaybackApi && !isAdditionalPartsApi && isGetLike) {
        const redirectRes = new Response(null, {
          status: 302,
          headers: {
            Location: finalUrl.toString(),
            "Cache-Control": "no-store",
            "X-FD-Stage": "playback-direct-302",
          },
        });
        const logTask = Database.logPlayback(
          env,
          node,
          request,
          redirectRes,
          true,
          "direct",
        );
        if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(logTask);
        else logTask.catch(() => {});
        return redirectRes;
      }
      const shouldProxyMedia =
        (!nodeDirect &&
          (isPlaybackApi || isImageApi || isAdditionalPartsApi)) ||
        (nodeDirect && (isAdditionalPartsApi || isImageApi)); // 直连时仅附加流/图片反代
      if (shouldProxyMedia) {
        const isStreaming =
          isPlaybackApi || GLOBALS.Regex.Streaming.test(finalUrl.pathname);
        const hClean = this.buildCleanProxyHeaders(
          request,
          finalUrl,
          node,
          env,
          { isStreaming },
        );
        for (const k of [
          "X-Emby-Authorization",
          "X-Emby-Token",
          "X-MediaBrowser-Token",
          "Authorization",
          "Cookie",
        ]) {
          const v = request.headers.get(k);
          if (v) hClean.set(k, v);
        }
        const reqU2 = new URL(request.url);
        if (!finalUrl.searchParams.get("api_key")) {
          const apiKey = reqU2.searchParams.get("api_key");
          if (apiKey) finalUrl.searchParams.set("api_key", apiKey);
        }
        const method = request.method.toUpperCase();
        const body =
          method === "GET" || method === "HEAD"
            ? null
            : replayBody
              ? replayBody.slice(0)
              : null;
        let resClean = await this.fetchWithProtocolFallback(finalUrl, {
          method: request.method,
          headers: hClean,
          body,
          redirect: "follow",
          cf,
        });
        const IMG_RETRY_STATUSES = new Set([
          401, 403, 408, 409, 423, 425, 429, 500, 502, 503, 504, 522, 523, 524,
        ]);
        if (isImageApi && IMG_RETRY_STATUSES.has(resClean.status)) {
          const hImg1 = new Headers(hClean);
          this.stripClientIpHeaders(hImg1);
          hImg1.delete("Origin");
          hImg1.delete("Referer");
          hImg1.delete("Range");
          hImg1.delete("If-Range");
          hImg1.set(
            "User-Agent",
            request.headers.get("User-Agent") ||
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          );
          hImg1.set(
            "Accept",
            request.headers.get("Accept") ||
              "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          );
          hImg1.set("Accept-Encoding", "identity");
          resClean = await this.fetchWithProtocolFallback(finalUrl, {
            method: request.method,
            headers: hImg1,
            body: null,
            redirect: "follow",
            cf,
          });
          if (IMG_RETRY_STATUSES.has(resClean.status)) {
            const hImg2 = new Headers(hImg1);
            hImg2.set("Referer", base.origin + "/");
            hImg2.set("Origin", base.origin);
            resClean = await this.fetchWithProtocolFallback(finalUrl, {
              method: request.method,
              headers: hImg2,
              body: null,
              redirect: "follow",
              cf,
            });
          }
        }
        const headersClean = new Headers(resClean.headers);
        const cr2 = resClean.headers.get("Content-Range");
        const aoClean = this.pickAllowOrigin(request, env);
        headersClean.set("Access-Control-Allow-Origin", aoClean);
        if (aoClean !== "*") headersClean.set("Vary", "Origin");
        headersClean.set(
          "Access-Control-Expose-Headers",
          "Accept-Ranges, Content-Range, Content-Length, Content-Type",
        );
        const arClean = resClean.headers.get("Accept-Ranges") || "";
        if (isStreaming) {
          if (resClean.status === 206 || cr2 || /bytes/i.test(arClean)) {
            headersClean.set("Accept-Ranges", "bytes");
          } else {
            headersClean.delete("Accept-Ranges");
          }
        }
        if (isStreaming) {
          headersClean.set("Cache-Control", "no-store, no-transform");
          if (/\.m3u8($|\?)/i.test(finalUrl.pathname)) {
            headersClean.set("Content-Type", "application/vnd.apple.mpegurl");
          }
        }
        if (isImageApi) {
          headersClean.delete("Set-Cookie");
          headersClean.set("Vary", "Accept, Origin");
          if (resClean.ok) {
            headersClean.set(
              "Cache-Control",
              "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400, stale-if-error=604800, immutable",
            );
          } else {
            headersClean.set("Cache-Control", "no-store");
          }
        }
        const logTask = Database.logPlayback(
          env,
          node,
          request,
          resClean,
          isPlaybackApi || isStreaming,
          "proxy",
        );
        if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(logTask);
        else logTask.catch(() => {});
        return new Response(resClean.body, {
          status: resClean.status,
          statusText: resClean.statusText,
          headers: headersClean,
        });
      }
      let res = await this.fetchWithProtocolFallback(finalUrl, {
        method: request.method,
        headers: h,
        body: replayBody ? replayBody.slice(0) : null,
        redirect: "manual",
        cf,
      });
      if (res.status === 403 && needCompatOrigin) {
        const h2 = new Headers(h);
        if (isEmos) this.applyEmosHeaders(h2, request, env);
        const reqOrigin = new URL(request.url).origin;
        h2.set("Origin", reqOrigin);
        h2.set("Referer", reqOrigin + "/");
        res = await this.fetchWithProtocolFallback(finalUrl, {
          method: request.method,
          headers: h2,
          body: replayBody ? replayBody.slice(0) : null,
          redirect: "manual",
          cf,
        });
      }
      if (res.status === 403) {
        const h3 = new Headers(h);
        this.stripClientIpHeaders(h3);
        this.applyClientIpHeaders(h3, request, env, node, "off");
        h3.set("Host", base.host);
        h3.set(
          "User-Agent",
          request.headers.get("User-Agent") || "emby-proxy/1.0",
        );
        const rg = request.headers.get("Range");
        if (rg) h3.set("Range", rg);
        const ifRange = request.headers.get("If-Range");
        if (ifRange) h3.set("If-Range", ifRange);
        h3.delete("Origin");
        h3.delete("Referer");
        h3.delete("Sec-Fetch-Site");
        h3.delete("Sec-Fetch-Mode");
        h3.delete("Sec-Fetch-Dest");
        h3.delete("Sec-Fetch-User");
        if (isEmos) this.applyEmosHeaders(h3, request, env);
        res = await this.fetchWithProtocolFallback(finalUrl, {
          method: request.method,
          headers: h3,
          body: replayBody ? replayBody.slice(0) : null,
          redirect: "manual",
          cf,
        });
        if (res.status === 403) {
          const h4 = new Headers(h3);
          this.stripClientIpHeaders(h4);
          this.applyClientIpHeaders(h4, request, env, node, "dual");
          h4.set("Host", base.host);
          h4.set(
            "User-Agent",
            request.headers.get("User-Agent") || "emby-proxy/1.0",
          );
          h4.set("Referer", base.origin + "/");
          h4.set("Origin", base.origin);
          const rg2 = request.headers.get("Range");
          if (rg2) h4.set("Range", rg2);
          const ifRange2 = request.headers.get("If-Range");
          if (ifRange2) h4.set("If-Range", ifRange2);
          h4.delete("Sec-Fetch-Site");
          h4.delete("Sec-Fetch-Mode");
          h4.delete("Sec-Fetch-Dest");
          h4.delete("Sec-Fetch-User");
          if (isEmos) this.applyEmosHeaders(h4, request, env);
          res = await this.fetchWithProtocolFallback(finalUrl, {
            method: request.method,
            headers: h4,
            body: replayBody ? replayBody.slice(0) : null,
            redirect: "manual",
            cf,
          });
          if (res.status === 403) {
            const h5 = new Headers(h4);
            this.stripClientIpHeaders(h5);
            this.applyClientIpHeaders(h5, request, env, node, "realip_only");
            h5.set("Host", base.host);
            h5.set(
              "User-Agent",
              request.headers.get("User-Agent") || "emby-proxy/1.0",
            );
            h5.set("Referer", base.origin + "/");
            h5.set("Origin", base.origin);
            const rg3 = request.headers.get("Range");
            if (rg3) h5.set("Range", rg3);
            const ifRange3 = request.headers.get("If-Range");
            if (ifRange3) h5.set("If-Range", ifRange3);
            h5.delete("Sec-Fetch-Site");
            h5.delete("Sec-Fetch-Mode");
            h5.delete("Sec-Fetch-Dest");
            h5.delete("Sec-Fetch-User");
            if (isEmos) this.applyEmosHeaders(h5, request, env);
            res = await this.fetchWithProtocolFallback(finalUrl, {
              method: request.method,
              headers: h5,
              body: replayBody ? replayBody.slice(0) : null,
              redirect: "manual",
              cf,
            });
          }
        }
      }
      const headers = new Headers(res.headers);
      const ao = this.pickAllowOrigin(request, env);
      headers.set("Access-Control-Allow-Origin", ao);
      if (ao !== "*") headers.set("Vary", "Origin");
      const selfPrefix = this.routePrefix(name, key, uid);
      rewriteSetCookieHeaders(headers, selfPrefix);
      if (isStatic) {
        headers.set("Access-Control-Allow-Origin", "*");
        headers.delete("Vary");
        headers.delete("Set-Cookie");
        headers.set(
          "Cache-Control",
          "public, max-age=31536000, s-maxage=86400",
        );
      } else if (isImageApi) {
        headers.delete("Set-Cookie");
        headers.set("Vary", "Accept, Origin");
        if (res.ok) {
          headers.set(
            "Cache-Control",
            "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400, stale-if-error=604800, immutable",
          );
        } else {
          headers.set("Cache-Control", "no-store");
        }
      } else if (isStreaming) {
        headers.set("Cache-Control", "no-store, no-transform");
      }
      let splitLocHit = false;
      let hostMap = null;
      try {
        hostMap = await Database.getHostIndex(env, uid);
      } catch {
        hostMap = null;
      }
      const location = headers.get("Location");
      if (location) {
        try {
          const origin = new URL(request.url).origin;
          const selfPrefix = this.routePrefix(name, key, uid);
          const selfPrefixNoSlash = selfPrefix.endsWith("/")
            ? selfPrefix.slice(0, -1)
            : selfPrefix;
          if (location.startsWith("/")) {
            const alreadyPrefixed =
              location === selfPrefixNoSlash ||
              location.startsWith(selfPrefixNoSlash + "/");
            if (!alreadyPrefixed) {
              headers.set("Location", origin + selfPrefix + location);
            }
          } else {
            const loc = new URL(location);
            const locHost = loc.host.toLowerCase();
            const baseHost = String(base.host || "").toLowerCase();
            const nodeDirect = this.isNodeDirectExternal(node);
            const alreadyPrefixed =
              loc.pathname === selfPrefixNoSlash ||
              loc.pathname.startsWith(selfPrefixNoSlash + "/");
            if (!alreadyPrefixed) {
              if (locHost === baseHost) {
                headers.set(
                  "Location",
                  origin + selfPrefix + loc.pathname + loc.search + loc.hash,
                );
              } else {
                if (!nodeDirect) {
                  if (!FIXED_PROXY_RULES.PAN_302_DIRECT) {
                    return await this.handleDirect(
                      request,
                      loc.toString(),
                      env,
                      node,
                    );
                  } else {
                    headers.set(
                      "Location",
                      origin +
                        selfPrefix +
                        "/__raw__/" +
                        encodeURIComponent(loc.toString()),
                    );
                    splitLocHit = true;
                  }
                } else {
                  headers.set("Location", loc.toString());
                }
              }
            }
          }
        } catch {}
      }
      const ct = (headers.get("content-type") || "").toLowerCase();
      if (
        res.status >= 200 &&
        res.status < 300 &&
        (ct.includes("application/vnd.apple.mpegurl") ||
          ct.includes("application/x-mpegurl") ||
          ct.includes("application/dash+xml"))
      ) {
        const rawBody = await res.text();
        const rewritten = await this.rewriteBodyLinks(
          rawBody,
          request.url,
          env,
          uid,
          node,
          name,
          key,
        );
        headers.delete("content-length");
        return new Response(rewritten, {
          status: res.status,
          statusText: res.statusText,
          headers,
        });
      }
      if (
        res.status >= 200 &&
        res.status < 300 &&
        ct.includes("application/json")
      ) {
        const reqPath = new URL(request.url).pathname.toLowerCase();
        const isPlaybackInfo = reqPath.includes("/playbackinfo");
        if (isPlaybackInfo) {
          const rawBody = await res.text();
          const rewritten = await this.rewriteBodyLinks(
            rawBody,
            request.url,
            env,
            uid,
            node,
            name,
            key,
          );
          headers.delete("content-length");
          return new Response(rewritten, {
            status: res.status,
            statusText: res.statusText,
            headers,
          });
        }
      }
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    } catch (err) {
      return new Response("Proxy Error: " + (err?.message || ""), {
        status: 502,
      });
    }
  },
  async fetchWithProtocolFallback(urlObj, init = {}) {
    const u1 = new URL(urlObj.toString());
    const u2 = new URL(urlObj.toString());
    u2.protocol = u1.protocol === "https:" ? "http:" : "https:";
    const method = String(init.method || "GET").toUpperCase();
    const hasBody = method !== "GET" && method !== "HEAD" && init.body != null;
    const maxBytes = Number(
      Config?.Defaults?.MaxRetryBodyBytes || 8 * 1024 * 1024,
    );
    let allowFallback = true;
    let preparedBody = null;
    if (hasBody) {
      const cl = Number(
        (init.headers && new Headers(init.headers).get("content-length")) || 0,
      );
      if (cl > maxBytes) allowFallback = false;
      const b = init.body;
      const reusable =
        typeof b === "string" ||
        b instanceof ArrayBuffer ||
        ArrayBuffer.isView(b) ||
        b instanceof URLSearchParams ||
        b instanceof FormData ||
        b instanceof Blob;
      if (reusable) {
        let est = 0;
        if (typeof b === "string") est = new TextEncoder().encode(b).byteLength;
        else if (b instanceof ArrayBuffer) est = b.byteLength;
        else if (ArrayBuffer.isView(b)) est = b.byteLength;
        else if (b instanceof Blob) est = b.size;
        if (est > maxBytes) allowFallback = false;
        preparedBody = b;
      } else {
        preparedBody = await new Response(b).arrayBuffer();
        if (preparedBody.byteLength > maxBytes) allowFallback = false;
      }
    }
    const buildInit = () => ({
      ...init,
      headers: new Headers(init.headers || {}),
      signal:
        init.signal ||
        AbortSignal.timeout(
          Math.max(1000, Number(Config?.Defaults?.FetchTimeoutMs || 12000)),
        ),
      body: hasBody
        ? preparedBody instanceof ArrayBuffer
          ? preparedBody.slice(0)
          : preparedBody
        : null,
    });
    let lastErr = null;
    let firstRes = null;
    try {
      firstRes = await fetch(u1.toString(), buildInit());
      if (![525, 526, 530].includes(firstRes.status)) return firstRes;
    } catch (e) {
      lastErr = e;
    }
    if (!allowFallback) {
      if (firstRes) return firstRes;
      throw lastErr || new Error("fetch failed");
    }
    try {
      return await fetch(u2.toString(), buildInit());
    } catch (e2) {
      throw e2 || lastErr || new Error("fetch failed");
    }
  },
  buildDirectCandidates(rawPath, search = "") {
    const p = String(rawPath || "").trim();
    const withQuery = (u) =>
      search ? u + (u.includes("?") ? "&" : "?") + search.slice(1) : u;
    if (/^https?:\/\//i.test(p)) return [withQuery(p)];
    const hostPart = p.split("/")[0].split("?")[0].split("#")[0];
    if (/:80$/i.test(hostPart))
      return [withQuery(`http://${p}`), withQuery(`https://${p}`)];
    if (/:443$/i.test(hostPart))
      return [withQuery(`https://${p}`), withQuery(`http://${p}`)];
    return [withQuery(`https://${p}`), withQuery(`http://${p}`)];
  },
  async handleDirect(request, rawPath, env, node = null) {
    const reqUrl = new URL(request.url);
    const candidates = this.buildDirectCandidates(rawPath, reqUrl.search);
    const method = request.method.toUpperCase();
    if ((request.headers.get("Upgrade") || "").toLowerCase() === "websocket") {
      const first = candidates[0];
      return fetch(first, { headers: request.headers });
    }
    const hasBody = method !== "GET" && method !== "HEAD";
    const maxBytes = Number(
      Config?.Defaults?.MaxRetryBodyBytes || 8 * 1024 * 1024,
    );
    let allowFallback = true;
    let bodyBuf = null;
    let allowRetry = true; // ✅ 新增
    if (hasBody) {
      const cl = Number(request.headers.get("content-length") || 0);
      if (cl > maxBytes) allowFallback = false;
      if (allowFallback) {
        bodyBuf = await request.clone().arrayBuffer();
        if (bodyBuf.byteLength > maxBytes) allowFallback = false;
      } else {
        allowRetry = false; // ✅ body 不可复用时禁止重试
      }
    }
    if (hasBody && !bodyBuf) allowRetry = false; // ✅ 保险
    let lastErr = null;
    let lastRes = null;
    const targets = allowFallback ? candidates : candidates.slice(0, 1);
    for (const target of targets) {
      try {
        const u = new URL(target);
        const redirectMode = "follow";
        let h = this.buildDirectOutboundHeaders(
          request,
          u,
          env,
          node,
          "normal",
        );
        h.set("Accept-Encoding", "identity");
        let hActive = h;
        let res = await fetch(target, {
          method,
          headers: hActive,
          body: hasBody ? (bodyBuf ? bodyBuf.slice(0) : request.body) : null,
          redirect: redirectMode,
          signal: AbortSignal.timeout(
            Math.max(3000, Number(Config?.Defaults?.MediaTryTimeoutMs || 6000)),
          ),
        });
        const reqRange = request.headers.get("Range");
        if (reqRange) {
          const m = /^\s*bytes\s*=\s*(\d+)-/i.exec(reqRange || "");
          const start = m ? Number(m[1]) : NaN;
          const cr = res.headers.get("Content-Range");
          const is206 = res.status === 206;
          const shouldFallbackNoRange =
            Number.isFinite(start) &&
            start === 0 &&
            ((!is206 && !cr) || res.status === 416);
          if (shouldFallbackNoRange) {
            const hNoRange = new Headers(hActive);
            hNoRange.delete("Range");
            hNoRange.delete("If-Range");
            hNoRange.set("Accept-Encoding", "identity");
            res = await fetch(target, {
              method,
              headers: hNoRange,
              body: hasBody
                ? bodyBuf
                  ? bodyBuf.slice(0)
                  : request.body
                : null,
              redirect: redirectMode,
              signal: AbortSignal.timeout(
                Math.max(
                  3000,
                  Number(Config?.Defaults?.MediaTryTimeoutMs || 6000),
                ),
              ),
            });
          }
        }
        if (allowRetry && res.status === 403) {
          const h2 = this.buildDirectOutboundHeaders(
            request,
            u,
            env,
            node,
            "retry-no-origin",
          );
          h2.set("Accept-Encoding", "identity");
          hActive = h2; // 关键
          res = await fetch(target, {
            method,
            headers: hActive,
            body: hasBody ? (bodyBuf ? bodyBuf.slice(0) : request.body) : null,
            redirect: redirectMode,
            signal: AbortSignal.timeout(
              Math.max(
                3000,
                Number(Config?.Defaults?.MediaTryTimeoutMs || 6000),
              ),
            ),
          });
        }
        if (allowRetry && res.status === 403) {
          const h3 = this.buildDirectOutboundHeaders(
            request,
            u,
            env,
            node,
            "retry-browserish",
          );
          h3.set("Accept-Encoding", "identity");
          hActive = h3; // 关键
          res = await fetch(target, {
            method,
            headers: hActive,
            body: hasBody ? (bodyBuf ? bodyBuf.slice(0) : request.body) : null,
            redirect: redirectMode,
            signal: AbortSignal.timeout(
              Math.max(
                3000,
                Number(Config?.Defaults?.MediaTryTimeoutMs || 6000),
              ),
            ),
          });
        }
        const reqRangeAfterRetry = request.headers.get("Range");
        if (reqRangeAfterRetry) {
          const m = /^\s*bytes\s*=\s*(\d+)-/i.exec(reqRangeAfterRetry || "");
          const start = m ? Number(m[1]) : NaN;
          const cr = res.headers.get("Content-Range");
          const is206 = res.status === 206;
          const shouldFallbackNoRange =
            Number.isFinite(start) &&
            start === 0 &&
            ((!is206 && !cr) || res.status === 416);
          if (shouldFallbackNoRange) {
            const hNoRange = new Headers(hActive);
            hNoRange.delete("Range");
            hNoRange.delete("If-Range");
            hNoRange.set("Accept-Encoding", "identity");
            res = await fetch(target, {
              method,
              headers: hNoRange,
              body: hasBody
                ? bodyBuf
                  ? bodyBuf.slice(0)
                  : request.body
                : null,
              redirect: redirectMode,
              signal: AbortSignal.timeout(
                Math.max(
                  3000,
                  Number(Config?.Defaults?.MediaTryTimeoutMs || 6000),
                ),
              ),
            });
          }
        }
        if ([525, 526, 530].includes(res.status)) {
          lastRes = res;
          continue;
        }
        const rh = new Headers(res.headers);
        const reqU = new URL(request.url);
        const i = reqU.pathname.indexOf("/__raw__/");
        const selfPrefix = i >= 0 ? reqU.pathname.slice(0, i) : "";
        rewriteSetCookieHeaders(rh, selfPrefix);
        const cr2 = res.headers.get("Content-Range");
        rh.set(
          "Access-Control-Expose-Headers",
          "Accept-Ranges, Content-Range, Content-Length, Content-Type",
        );
        const ar = res.headers.get("Accept-Ranges") || "";
        if (res.status === 206 || cr2 || /bytes/i.test(ar)) {
          rh.set("Accept-Ranges", "bytes");
        } else {
          rh.delete("Accept-Ranges");
        }
        try {
          const reqU = new URL(request.url);
          const i = reqU.pathname.indexOf("/__raw__/");
          const selfPrefix = i >= 0 ? reqU.pathname.slice(0, i) : "";
          if (res.status >= 300 && res.status < 400) {
            const loc = rh.get("Location");
            if (loc && selfPrefix) {
              const abs = new URL(loc, target);
              if (/^https?:$/i.test(abs.protocol)) {
                const nodeDirect = this.isNodeDirectExternal(node);
                if (nodeDirect) {
                  rh.set("Location", abs.toString());
                } else {
                  if (!FIXED_PROXY_RULES.PAN_302_DIRECT) {
                    return await this.handleDirect(
                      request,
                      abs.toString(),
                      env,
                      node,
                    );
                  } else {
                    rh.set(
                      "Location",
                      reqU.origin +
                        selfPrefix +
                        "/__raw__/" +
                        encodeURIComponent(abs.toString()),
                    );
                  }
                }
              }
            }
          }
        } catch {}
        const ao2 = this.pickAllowOrigin(request, env);
        rh.set("Access-Control-Allow-Origin", ao2);
        if (ao2 !== "*") rh.set("Vary", "Origin");
        return new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers: rh,
        });
      } catch (e) {
        lastErr = e;
      }
    }
    if (lastRes) return lastRes;
    return new Response("Proxy Error: " + (lastErr?.message || "unknown"), {
      status: 502,
    });
  },
  async handleWebSocket(url, request) {
    try {
      const u = new URL(url);
      if (u.protocol === "ws:") u.protocol = "http:";
      if (u.protocol === "wss:") u.protocol = "https:";
      const h = new Headers(request.headers);
      h.set("Connection", "Upgrade");
      h.set("Upgrade", "websocket");
      const req = new Request(u.toString(), {
        method: "GET",
        headers: h,
        redirect: "manual",
      });
      const resp = await fetch(req);
      if (resp.status !== 101) {
        return new Response("WS upstream rejected", { status: 502 });
      }
      return resp;
    } catch {
      return new Response("WS Error", { status: 502 });
    }
  },
  async rewriteBodyLinks(
    text,
    requestUrl,
    env,
    uid,
    currentNode,
    currentName,
    currentKey,
  ) {
    if (!text || typeof text !== "string") return text;
    const reqU = new URL(requestUrl);
    const origin = reqU.origin;
    const selfPrefix = this.routePrefix(currentName, currentKey, uid);
    const nodeDirect = this.isNodeDirectExternal(currentNode);
    const urlRe = /https?:\/\/[^\s"'<>\\]+/gi;
    const urls = [...new Set(text.match(urlRe) || [])];
    if (!urls.length) return text;
    const curBaseHosts = new Set();
    for (const t of this.getNodeTargets(currentNode)) {
      try {
        curBaseHosts.add(new URL(t).host.toLowerCase());
      } catch {}
    }
    let hostMap = null;
    try {
      hostMap = await Database.getHostIndex(env, uid);
    } catch {
      hostMap = null;
    }
    const map = new Map();
    for (const full of urls) {
      let u;
      try {
        u = new URL(full);
      } catch {
        continue;
      }
      if (
        u.origin === origin &&
        (u.pathname === selfPrefix || u.pathname.startsWith(selfPrefix + "/"))
      ) {
        continue;
      }
      if (nodeDirect) {
        map.set(full, full);
        continue;
      }
      const h = u.host.toLowerCase();
      if (curBaseHosts.has(h)) {
        map.set(full, origin + selfPrefix + u.pathname + u.search + u.hash);
        continue;
      }
      const match = hostMap ? hostMap.get(h) || null : null;
      if (match) {
        const prefix = this.routePrefix(match.name, match.secret || "", uid);
        map.set(full, origin + prefix + u.pathname + u.search + u.hash);
        continue;
      }
      map.set(
        full,
        origin + selfPrefix + "/__raw__/" + encodeURIComponent(full),
      );
    }
    let out = text;
    for (const [from, to] of map.entries()) out = out.split(from).join(to);
    return out;
  },
  pickAllowOrigin(request, env) {
    const reqOrigin = request.headers.get("Origin") || "";
    const allow = String(env.CORS_ALLOW_ORIGIN || "").trim();
    if (!reqOrigin) return "*";
    if (!allow) return reqOrigin;
    if (allow === "*") return "*";
    const set = new Set(
      allow
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    return set.has(reqOrigin) ? reqOrigin : "null";
  },
  renderCors(request, env) {
    const ao = this.pickAllowOrigin(request, env);
    const headers = {
      "Access-Control-Allow-Origin": ao,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
    if (ao !== "*") headers["Vary"] = "Origin";
    return new Response(null, { headers });
  },
};
const UI = {
  renderAdmin() {
    const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Emby反代管理系统</title>
<link rel="icon" type="image/svg+xml" href='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%233b82f6"/><stop offset="100%" stop-color="%2360a5fa"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="%231e293b"/><rect x="9" y="9" width="46" height="46" rx="10" fill="url(%23g)"/><path d="M22 20h22v6H28v6h14v6H28v6h16v6H22V20z" fill="white"/><path d="M46 44l8 4-8 4z" fill="%23bfdbfe"/></svg>'>
<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap");
:root{
  --bg:#f3f6fb;
  --panel:#ffffff;
  --text:#1e293b;
  --text2:#0f172a;
  --muted:#64748b;
  --line:#dbe3ef;
  --icon:#64748b;
  --inbg:rgba(255,255,255,.92);
  --intext:#0f172a;
  --inborder:#d8e2f0;
  --blue:#3b82f6;
  --brand:#2563eb;
  --brand-soft:#eaf2ff;
  --card-bg:#ffffff;
  --card-bg2:#fbfdff;
  --card-text:#1e293b;
  --card-muted:#64748b;
  --card-line:#dbe4f2;
  --density-name-size: clamp(24px, 2vw, 30px);
  --density-label-size: clamp(13px, 1.1vw, 15px);
  --density-mono-size: clamp(12px, 1vw, 13px);
}
*{box-sizing:border-box}
html,body{
  margin:0;padding:0;
  font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
  background:var(--bg);color:var(--text);
}
.glass{
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  background:color-mix(in oklab, var(--panel) 80%, transparent);
}
.wrap{max-width:min(96vw,1880px);margin:0 auto;padding:12px 8px 88px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.title{font-size:40px;font-weight:800;display:flex;gap:8px;align-items:flex-end;color:var(--text2)}
.title::after{
  content:"";display:inline-block;width:36px;height:4px;margin-left:8px;margin-bottom:8px;
  border-radius:999px;background:linear-gradient(90deg,var(--brand),#60a5fa)
}
.title small{
  font-size:15px;font-weight:700;color:#2563eb;background:rgba(59,130,246,.14);
  border:1px solid rgba(59,130,246,.32);border-radius:999px;padding:4px 12px;line-height:1.35;
  margin:0 0 4px 0;letter-spacing:.2px;
}
.right-actions{display:flex;gap:2px;align-items:center}
.top-ver{font-size:12px;color:var(--muted);font-weight:600;margin-right:8px;user-select:none}
.icon-btn{
  border:none;background:transparent;color:var(--icon);padding:8px;border-radius:10px;
  cursor:pointer;line-height:0
}
.icon-btn:hover{background:rgba(148,163,184,.16)}
.controls{
  display:grid;
  grid-template-columns:120px minmax(0,1fr) 140px 94px 94px 40px;
  gap:10px;margin-bottom:12px;width:100%;
}
.controls select,.controls input,.controls button{
  height:40px;border:1px solid var(--inborder);background:var(--inbg);color:var(--intext);
  border-radius:10px;padding:0 12px;font-size:13px;outline:none;min-width:0;font-weight:600;
}
.controls button{cursor:pointer}
.controls button:hover{border-color:#bcd0ee;background:#f7fbff}
input,select,textarea,button{font:inherit}
input[type="time"]{
  font-family:inherit!important;font-size:16px;line-height:1.25;color:var(--text);
  -webkit-appearance:none;appearance:none;
}
input[type="time"]::-webkit-datetime-edit,
input[type="time"]::-webkit-datetime-edit-hour-field,
input[type="time"]::-webkit-datetime-edit-minute-field,
input[type="time"]::-webkit-datetime-edit-ampm-field,
input[type="time"]::-webkit-datetime-edit-text{font-family:inherit;font-size:16px}
  position:fixed;inset:0;z-index:-3;
  background-size:cover;background-position:center;background-repeat:no-repeat;
}
  filter:brightness(var(--bg-brightness,100%)) blur(var(--bg-blur,0px));
  transform:scale(1.04);display:none;
}
  z-index:-2;
  background:rgba(0,0,0,var(--bg-overlay,0.2));
  display:none;
}
body.has-bg #bgLayer,body.has-bg #bgOverlay{display:block}
.controls .fab{
  display:flex;align-items:center;justify-content:center;padding:0;
  background:var(--brand)!important;color:#fff!important;border:none!important;
}
.controls .fab:hover{
  display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;
  background:var(--brand-soft);border-color:#cfe0ff;color:#1e40af;
}
.controls #btnCheckSel,.controls #btnCheckAll{
  display:flex;align-items:center;justify-content:center;white-space:nowrap;
}
.state-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex:0 0 8px}
.state-dot.off{background:#9ca3af}.state-dot.on{background:#3b82f6}
.batchbar{
  display:none;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;padding:10px;
  border:1px dashed var(--line);border-radius:12px
}
.batchbar input,.batchbar button{
  height:36px;border:1px solid var(--inborder);background:var(--inbg);color:var(--intext);
  border-radius:10px;padding:0 10px;font-size:13px
}
.batchbar button{cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
@media(max-width:1500px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:960px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:720px){.grid{grid-template-columns:1fr}}
.card[draggable="true"]{cursor:grab}
.card.dragging{opacity:.55}
.card.drag-over{outline:2px dashed #60a5fa;outline-offset:-2px}
.card{
  border:1px solid var(--card-line);border-radius:10px;padding:10px 10px 8px;min-height:120px;
  box-shadow:0 1px 2px rgba(0,0,0,.04);
  background:linear-gradient(180deg,var(--card-bg) 0%,var(--card-bg2) 100%);
  transition:all .18s ease;
  --head-indent:30px;
}
.card:hover{
  border-color:color-mix(in oklab, var(--card-line) 70%, #93c5fd 30%);
  box-shadow:0 10px 22px rgba(15,23,42,.08);transform:translateY(-1px)
}
.row{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;min-width:0}
.left-wrap,.info{min-width:0;flex:1 1 auto;overflow:hidden}
.left-head{display:flex;align-items:flex-start;gap:8px;min-width:0;flex:1 1 auto}
.selbox{margin-top:6px;flex:0 0 auto}
.selbox input{width:16px;height:16px;cursor:pointer}
.name{
  margin:0;font-size:var(--density-name-size);line-height:1.15;font-weight:800;color:var(--card-text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;
}
.subline{display:flex;gap:6px;color:var(--card-muted);margin-top:4px}
.subline .v{color:var(--card-text)}
.path-tip{margin-top:2px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.status{margin-top:8px;display:flex;align-items:center;gap:6px;color:var(--card-muted);position:relative}
.dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex:0 0 7px}
.dot.online{background:#16a34a}.dot.offline{background:#ef4444}.dot.unknown{background:#94a3b8}
.actions{display:flex;gap:4px;flex:0 0 auto;margin-left:8px}
.actions .icon-btn{padding:6px}
.actions .icon-btn.is-fav{
  color:#f59e0b;
  background:rgba(245,158,11,.10);
  border-radius:8px;
}
.actions .icon-btn.is-fav:hover{
  color:#d97706;
  background:rgba(245,158,11,.18);
}
.badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.badge{
  display:inline-flex;align-items:center;height:20px;padding:0 9px;border-radius:999px;
  font-size:12px;line-height:20px;font-weight:700;white-space:nowrap;
}
.b-mode-normal{background:#dbeafe;color:#1d4ed8}
.b-mode-direct{background:#fff3e0;color:#c2410c;border:1px solid #fed7aa}
.b-green{background:#dcfce7;color:#166534}
.b-blue{background:#e0f2fe;color:#075985}
.b-orange{background:#ffedd5;color:#9a3412}
.b-gray{background:#e5e7eb;color:#374151}
.b-note{background:#ede9fe;color:#5b21b6}
.line,.app-row{padding-left:var(--head-indent)}
.line{
  margin-top:6px;display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:6px 8px;align-items:flex-start;
}
.label{text-align:left;font-size:var(--density-mono-size);line-height:1.2;color:var(--card-muted);padding-top:2px}
.line-actions{display:flex;gap:8px;align-items:center;padding-top:2px}
.line-actions .icon-btn{
  width:22px;height:22px;padding:0;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;
  color:var(--icon);background:transparent;opacity:.9;
}
.line-actions .icon-btn svg{width:20px;height:20px;display:block}
.line .copy-ghost{opacity:1;transform:none;transition:none;pointer-events:auto}
.app-row{margin-top:6px;display:flex;gap:6px;justify-content:flex-start;flex-wrap:wrap}
.app-btn{
  border:1px solid var(--inborder);background:var(--inbg);color:var(--intext);border-radius:8px;
  padding:0 9px;height:26px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;
}
.app-btn:hover{border-color:#93c5fd;background:#eef4ff}
.app-btn.capy{opacity:.9}
.menu{position:relative;z-index:90}
.menu-panel{
  position:absolute;right:0;left:auto;top:calc(100% + 8px);
  min-width:190px;max-width:min(92vw,280px);max-height:min(72vh,520px);overflow:auto;
  padding:6px;border:1px solid var(--line);border-radius:10px;display:none;z-index:120;
  box-shadow:0 8px 20px rgba(0,0,0,.08);
}
.menu-panel button{
  width:100%;border:none;background:transparent;color:var(--text);text-align:left;
  padding:8px 10px;border-radius:8px;cursor:pointer
}
.menu-panel button:hover{background:rgba(148,163,184,.14)}
.fab{
  position:fixed;right:20px;bottom:24px;top:auto;width:52px;height:52px;border:none;border-radius:999px;
  font-size:28px;background:var(--brand);color:#fff;cursor:pointer;box-shadow:0 10px 22px rgba(59,130,246,.35);z-index:80;
}
body.modal-open .fab{display:none}
@media (min-width:981px){
  .controls .fab{width:36px;height:36px;font-size:22px;line-height:36px}
  .fab{
    position:static;right:auto;bottom:auto;top:auto;width:34px;height:34px;font-size:20px;line-height:34px;
    box-shadow:none;margin-left:6px;flex:0 0 auto;
  }
}
.modal-mask{display:none;position:fixed;inset:0;background:rgba(15,23,42,.38);z-index:1000}
.modal{
  display:none;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
  width:min(94vw,560px);max-height:92vh;overflow-y:auto;
  border:1px solid var(--line);border-radius:14px;padding:14px;z-index:1001;
  -webkit-overflow-scrolling:touch;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  font-size:14px;line-height:1.45;
}
body.modal-open #menuPanel{display:none!important}
.modal h3{margin:0 0 10px;color:var(--text2);font-size:24px;font-weight:800;line-height:1.2}
.modal .field-title{font-size:18px;font-weight:700;color:var(--text2);line-height:1.3;margin:10px 0 8px}
.req{color:#ef4444;font-weight:800;margin-right:4px;font-size:16px}
.modal label,.modal .small,.modal .hint,.modal .tips,.modal .muted{
  font-size:12.5px;font-weight:400;color:#64748b;letter-spacing:.1px;line-height:1.45;
}
.modal input:not([type="checkbox"]),.modal select,.modal textarea{
  width:100%;border:1px solid var(--inborder);background:#fff;color:var(--intext);
  border-radius:10px;outline:none;font-size:14px;font-weight:500;letter-spacing:.1px;
}
.modal input:not([type="checkbox"]),.modal select{height:40px;padding:0 10px;margin-bottom:8px}
.modal textarea{min-height:110px;padding:10px;margin-bottom:8px;resize:vertical}
.pass-wrap{position:relative;margin-bottom:8px}
.pass-wrap #inPass{margin-bottom:0;padding-right:64px;width:100%;display:block}
.pass-eye{
  position:absolute;right:8px;top:50%;transform:translateY(-50%);
  border:1px solid var(--inborder);background:#fff;color:var(--muted);
  border-radius:8px;height:28px;min-width:48px;padding:0 8px;cursor:pointer;
}
.tagbar{position:relative;margin-bottom:8px}
.tagbar input{margin:0;padding-right:12px}
.tagbar datalist{opacity:0;display:none}
input[type="number"]{appearance:textfield;-moz-appearance:textfield}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.modal .btns{
  display:flex;justify-content:flex-end;gap:8px;margin-top:12px;position:sticky;
  bottom:-14px;background:var(--panel);padding:10px 0 2px;border-top:1px solid var(--line);
}
.btn{border:none;border-radius:10px;padding:9px 14px;cursor:pointer}
.btn-p{background:var(--blue);color:#fff}
.btn-g{background:rgba(148,163,184,.2);color:var(--text)}
.range{display:grid;grid-template-columns:90px 1fr 46px;gap:8px;align-items:center;margin:6px 0}
.small{font-size:12px;color:var(--muted)}
.tag-list{max-height:280px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:8px;margin-bottom:8px}
.tag-item{display:flex;align-items:center;gap:8px;padding:6px 4px;border-radius:8px}
.tag-item:hover{background:#f8fafc}
.tag-item input[type="checkbox"]{width:16px;height:16px;margin:0;flex:0 0 auto}
.tag-empty{font-size:13px;color:var(--muted);padding:8px}
.gate{position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:70}
.gate-box{width:min(92vw,360px);background:#fff;border:1px solid #d7dce4;border-radius:14px;padding:16px}
.gate-box h3{margin:0 0 10px}
.gate-pass{position:relative}
.gate-pass #gatePwd{padding-right:34px}
.gate-box input{width:100%;height:42px;border:1px solid #d7dce4;border-radius:10px;padding:0 10px;outline:none}
.gate-box #gateBtn{
  width:100%;height:42px;margin-top:10px;font-size:14px;font-weight:700;cursor:pointer;
  background:var(--brand)!important;color:#fff!important;border:none!important;border-radius:10px!important;
}
.gate-pass .pass-eye{
  position:absolute;right:8px;top:50%;transform:translateY(-50%);
  width:20px;height:20px;border:none;background:transparent;padding:0;border-radius:0;
  color:#94a3b8;display:flex;align-items:center;justify-content:center;cursor:pointer;
}
.gate-pass .pass-eye:hover{color:#64748b}
.gate-pass .pass-eye svg{width:20px;height:20px;display:block}
.gate-pass .pass-eye span{display:flex}
.tip{min-height:16px;margin-top:7px;font-size:12px;color:#ef4444;display:none}
.tip.ok{color:#16a34a}
.tip.show{display:block}
.toast-wrap{
  position:fixed;
  left:50%;
  top:var(--toast-top, 18px);
  transform:translateX(-50%);
  z-index:9999;
  width:min(92vw,560px);
  display:flex;
  flex-direction:column;
  gap:8px;
  pointer-events:none;
}
.toast{
  width:100%;
  box-sizing:border-box;
  border-radius:10px;
  padding:11px 14px;
  font-size:14px;
  line-height:1.45;
  border:1px solid transparent;
  box-shadow:0 6px 14px rgba(15,23,42,.12);
  pointer-events:auto;
  opacity:.98;
}
.toast.success{
  background:#ecfdf3;
  border-color:#bbf7d0;
  color:#14532d;
}
.toast.warn{
  background:#fff7ed;
  border-color:#fed7aa;
  color:#9a3412;
}
.toast.error{
  background:#fef2f2;
  border-color:#fecaca;
  color:#991b1b;
}
@media (max-width:768px){
  .toast-wrap{ width:calc(100vw - 16px); }
  .toast{ font-size:15px; padding:12px 14px; }
}
.gate-box,.modal,.menu-panel{
  background:var(--panel)!important;color:var(--text)!important;border:1px solid var(--line)!important;
  border-radius:12px!important;box-shadow:0 8px 24px rgba(15,23,42,.08)!important;
}
.gate-box input,
.modal input:not([type="checkbox"]),
.modal select,
.modal textarea,
.menu-panel input,
.menu-panel select{
  width:100%;box-sizing:border-box;
}
.gate-box input,
.modal input:not([type="checkbox"]),
.modal select,
.modal textarea{
  font:inherit;font-size:14px;color:var(--text);font-family:inherit;
}
.menu-panel input,.menu-panel select{
  background:var(--inbg)!important;color:var(--intext)!important;
  border:1px solid var(--inborder)!important;border-radius:10px!important;
}
button:focus-visible,.btn:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[role="button"]:focus-visible{
  outline:2px solid color-mix(in oklab, var(--brand) 72%, white 28%);
  outline-offset:1px;
  box-shadow:0 0 0 3px color-mix(in oklab, var(--brand) 18%, transparent 82%);
}
.card,.menu-panel,.modal,button,.btn{
  transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease,transform .16s ease;
}
button:hover,.btn:hover{transform:translateY(-1px)}
.project-links{
  width:min(1100px,calc(100% - 24px));margin:10px auto 8px;padding:0;border:none;background:transparent;box-shadow:none;
  display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;font:inherit;font-size:14px;color:var(--muted);
}
.project-links .label{color:var(--muted);margin-right:2px;font:inherit}
.project-links a{
  text-decoration:none;font:inherit;font-size:14px;color:var(--text2);border:1px solid var(--line);
  background:#fff;border-radius:999px;padding:6px 10px;line-height:1;transition:.15s ease;
}
.project-links a:hover{border-color:var(--blue);color:var(--blue);transform:translateY(-1px)}
.disclaimer{
  width:min(1100px,calc(100% - 24px));margin:16px auto 12px;padding:10px 12px;border:1px dashed #cbd5e1;
  border-radius:10px;font-size:12px;line-height:1.6;color:#64748b;background:rgba(255,255,255,.55);text-align:center;
}
.page-hint{
  margin-top:18px;text-align:center;color:var(--muted);font-size:13px;opacity:.75;user-select:none;
}
@media(max-width:900px){.controls{grid-template-columns:120px 1fr 140px}}
@media(max-width:760px){
  .title{font-size:32px}
  .controls{grid-template-columns:1fr 1fr}
}
@media (max-width:640px){
  .top{align-items:flex-start;gap:8px}
  .title{
    display:flex;flex-wrap:wrap;align-items:flex-end;gap:6px;line-height:1.08;
    min-width:0;max-width:calc(100vw - 120px);
  }
  .right-actions{flex:0 0 auto}
  .menu-panel{right:-4px;top:calc(100% + 6px);max-width:calc(100vw - 12px);max-height:70vh}
  .modal{
    width:94vw;
    max-height:84dvh;
    padding:10px;
    border-radius:12px;
    overflow:auto;
    -webkit-overflow-scrolling:touch;
  }
  .modal label,.modal .small,.modal .hint,.modal .tips,.modal .muted{font-size:13px}
  .modal h3{font-size:20px;margin:0 0 10px}
  .modal .field-title{font-size:16px;margin:8px 0 6px}
  .modal input:not([type="checkbox"]),.modal select{height:38px;font-size:14px;padding:0 10px}
  .row2{display:flex;gap:8px;flex-wrap:wrap}
  .row2 > *{flex:1 1 calc(50% - 6px)}
  .modal .btns{position:sticky;bottom:-1px;background:var(--panel);padding-top:6px}
}
@media (max-width:480px){
  .card{padding:8px}
  .name{font-size:calc(var(--density-name-size) - 2px)}
  .app-btn{height:28px;font-size:12px}
  .badge{height:22px;font-size:12px;padding:0 10px}
  .actions .icon-btn{padding:8px}
}
@media (max-width:768px){
  .project-links{margin:8px 12px 6px;font-size:13px}
  .project-links a{font-size:13px}
  .disclaimer{margin:12px;font-size:11.5px}
}
@media (max-width: 768px) {
  .btn, button:not(.icon-btn):not(.pass-eye):not(.fab) {
    font-size: 12px !important;
    padding: 6px 10px !important;
    min-height: 30px !important;
    border-radius: 8px !important;
  }
}
</style>
</head>
<body>
<div id="bgLayer"></div>
<div id="bgOverlay"></div>
<div id="gate" class="gate">
  <div class="gate-box">
<h3>管理员登录</h3>
<div class="pass-wrap gate-pass">
  <input id="gatePwd" type="password" placeholder="请输入 ADMIN_TOKEN" />
  <button type="button" id="gatePassBtn" class="pass-eye" onclick="Gate.toggleGatePass()" title="显示/隐藏密码">
    <span id="gatePassIcon"></span>
  </button>
</div>
<button id="gateBtn">进入面板</button>
    <div id="gateTip" class="tip">请先在 Worker 环境变量设置 ADMIN_TOKEN</div>
  </div>
</div>
<div id="app" style="display:none">
  <div class="wrap">
    <div class="top">
      <div class="title">
  Emby反代管理系统
  <small id="nodeCount">0个</small>
</div>
      <div class="right-actions">
  <span class="top-ver">免费版v1.8</span>
  <button class="icon-btn" title="切换主题" onclick="App.quickTheme()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"></path></svg>
        </button>
        <div class="menu">
          <button class="icon-btn" onclick="App.toggleMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div id="menuPanel" class="menu-panel glass">
  <button onclick="App.openTgModal()">TG 每日报表设置</button>
  <button onclick="App.openCnameModal()">CNAME 更换</button>
  <button onclick="App.exportData()">导出配置</button>
  <button onclick="document.getElementById('fIn').click()">导入配置</button>
  <button onclick="App.openBgModal()">背景高级设置</button>
  <button onclick="App.setDensity('compact')">密度:紧凑</button>
  <button onclick="App.setDensity('cozy')">密度:舒适</button>
  <button onclick="App.setPreset('deepblue')">主题:深蓝</button>
  <button onclick="App.setPreset('graphite')">主题:石墨</button>
  <button onclick="App.setPreset('light')">主题:浅灰</button>
  <button onclick="Gate.logout()">退出登录</button>
  <input type="file" id="fIn" hidden accept=".json" onchange="App.importFile(this)">
</div>
        </div>
      </div>
    </div>
    <div class="controls">
      <button id="tagFilterBtn" class="glass" onclick="App.openTagPicker()">标签:全部</button>
<input id="searchInput" class="full-sm glass" placeholder="搜索节点名称、备注..." oninput="App.filter(this.value)">
      <button id="toggleAllVisBtn" class="glass" onclick="App.toggleAllVisibility()"><span class="state-dot off"></span>显示全部地址</button>
      <button id="btnCheckSel" class="glass" onclick="App.checkSelectedStatus()">检测选中</button>
      <button id="btnCheckAll" class="glass" onclick="App.checkAllStatus()">检测全部</button>
    </div>
    <div id="batchBar" class="batchbar glass">
      <span class="small">已选 <b id="selCount">0</b> 项</span>
      <button onclick="App.selectAllFiltered()">全选筛选结果</button>
      <button onclick="App.clearSelection()">清空选择</button>
      <input id="batchTagInput" placeholder="批量标签（如 公益服）" />
<button onclick="App.applyBatchTag()">批量打标签</button>
<button onclick="App.applyBatchCred()">批量账号密码</button>
<button style="color:#ef4444" onclick="App.clearBatchCred()">清空账号密码</button>
<button style="color:#ef4444" onclick="App.batchDelete()">批量删除</button>
    </div>
    <div id="list" class="grid"></div>
  </div>
  <button class="fab" onclick="App.openEditor()">＋</button>
  <div id="mask" class="modal-mask" onclick="App.closeAllModals()"></div>
  <div id="editor" class="modal glass">
<h3 id="editorTitle">新增节点</h3>
<div class="field-title">显示名称（可中文）</div>
<input id="inDisplayName" placeholder="自定义">
<div class="field-title"><span class="req">*</span> 目标地址（可多个）</div>
<div id="targetList"></div>
<div style="display:flex;gap:8px;margin-top:8px;">
  <div class="btn-row">
    <button type="button" class="btn btn-g" onclick="App.addTargetInput()">+ 添加目标地址</button>
    <button type="button" class="btn btn-g" onclick="App.removeTargetInput()">- 删除一栏</button>
  </div>
</div>
<div class="field-help">最多支持 5 条目标地址。</div>
<div class="field-title"><span class="req">*</span> 请求路径和密钥路径</div>
<input id="inName" placeholder="请输入唯一英文路径（a-z0-9_-，1~32）">
<input id="inSec" placeholder="密钥路径（可选，不能含 / ? #）">
<div class="field-title">播放策略</div>
<label class="check-row">
  <input id="inDirectExternal" type="checkbox">
  <span>网盘播放直连</span>
</label>
<div class="field-help">
  开启后，网盘外链由播放器直接访问（不经 Worker 反代），可能更快但受客户端网络影响。
</div>
<div class="field-title">网络兼容</div>
<select id="inRealIpMode">
  <option value="smart">自动（推荐）</option>
  <option value="realip_only">严格（推荐）</option>
  <option value="off">保守（疑难时）</option>
  <option value="dual">最大兼容（少数站点，慎用）</option>
</select>
<div class="field-help">默认"自动（推荐）"即可，出现登录/播放异常时再改高级档位。</div>
<div style="margin-top:8px;">
  <button class="btn btn-g" type="button" onclick="App.compatAutoFixEditor()">一键修复（推荐）</button>
</div>
<details style="margin-top:10px;">
  <summary class="field-title" style="cursor:pointer;">账号导入（可选）</summary>
  <input id="inUser" placeholder="用户名（可留空）">
  <div class="pass-wrap">
    <input id="inPass" type="password" placeholder="密码（可留空）">
    <button type="button" id="togglePassBtn" class="pass-eye" onclick="App.toggleEditorPass()" title="显示/隐藏密码">
      <span id="togglePassIcon"></span>
    </button>
  </div>
</details>
<details style="margin-top:10px;">
  <summary class="field-title" style="cursor:pointer;">标签和备注（可选）</summary>
  <div class="tagbar">
    <input id="inTag" list="tagSuggestions" placeholder="标签（如 公费服 / 公益服 / 白名单 / 等）">
  </div>
  <datalist id="tagSuggestions"></datalist>
  <input id="inNote" placeholder="备注（如 保号规则 / 等）">
</details>
<details style="margin-top:10px;">
  <summary class="field-title" style="cursor:pointer;">保号提醒（可选）</summary>
  <div class="field-title">保号周期（天）</div>
  <input id="inRenewDays" type="number" min="0" max="3650" step="1" placeholder="例如 30（0=不启用）">
  <div class="field-title">提前几天提醒</div>
  <input id="inRemindBeforeDays" type="number" min="0" max="3650" step="1" placeholder="例如 3">
  <div class="field-title">保号提醒时间（北京时间）</div>
  <input id="inKeepaliveAt" type="time" step="60">
  <div class="field-title">保号每日提醒次数</div>
  <input id="inKeepaliveMaxPerDay" type="number" min="1" max="24" step="1" placeholder="默认 1（1~24）">
  <div class="field-help">进入提醒窗口后，最短间隔固定 60 分钟；每天最多提醒 1~24 次，次日自动重置。</div>
  <div style="margin-top:8px;">
    <button class="btn btn-g" type="button" onclick="App.testKeepaliveNotify()">测试通知</button>
  </div>
</details>
<div class="btns">
  <button class="btn btn-g" onclick="App.closeAllModals()">取消</button>
  <button class="btn btn-p" onclick="App.save()">保存</button>
</div>
  </div>
  <div id="tagPicker" class="modal glass">
    <h3>标签多选筛选</h3>
    <div id="tagPickerList" class="tag-list"></div>
    <div class="btns">
      <button class="btn btn-g" onclick="App.clearTagFilter()">清空</button>
      <button class="btn btn-g" onclick="App.closeAllModals()">取消</button>
      <button class="btn btn-p" onclick="App.applyTagFilter()">应用</button>
    </div>
  </div>
  <div id="bgModal" class="modal glass">
    <h3>背景高级设置</h3>
    <input id="bgUrl" placeholder="背景图URL（https://...）">
    <div class="range"><label>亮度</label><input id="bgBrightness" type="range" min="40" max="140" step="1"><span id="bgBrightnessVal">100%</span></div>
    <div class="range"><label>模糊</label><input id="bgBlur" type="range" min="0" max="20" step="1"><span id="bgBlurVal">0px</span></div>
    <div class="range"><label>遮罩</label><input id="bgOverlayRange" type="range" min="0" max="80" step="1"><span id="bgOverlayVal">20%</span></div>
    <div class="small">建议:深色主题 + 亮度 75~90 + 模糊 4~8</div>
    <div class="btns">
      <button class="btn btn-g" onclick="App.clearBg()">清除背景</button>
      <button class="btn btn-g" onclick="App.closeAllModals()">关闭</button>
      <button class="btn btn-p" onclick="App.saveBg()">保存背景设置</button>
    </div>
  </div>
  <div id="tgModal" class="modal glass">
  <h3>TG 每日报表设置</h3>
  <label class="check-row">
    <input id="tgEnable" type="checkbox">
    <span>启用 TG 通知</span>
  </label>
  <div class="field-title">Bot Token</div>
  <input id="tgToken" placeholder="如 123456:ABCDEF...">
  <div class="field-title">Chat ID</div>
  <input id="tgChat" placeholder="如 -100xxxxxxxxxx">
  <div class="field-title">日报时间（北京时间）</div>
  <input id="tgReportTime" type="time" step="60">
  <div class="field-title">日报间隔（分钟）</div>
  <input id="tgReportEveryMin" type="number" min="60" max="1440" step="1" placeholder="60~1440">
  <div class="field-title">每日最大发送次数</div>
  <input id="tgReportMaxPerDay" type="number" min="1" max="24" step="1" placeholder="1~24">
  <label class="check-row">
    <input id="tgAllowRepeat" type="checkbox">
    <span>允许重复发送（关闭则仅变化时发送）</span>
  </label>
  <div class="btns">
    <button class="btn btn-g" onclick="App.testTg()">测试发送</button>
    <button class="btn btn-g" onclick="App.closeAllModals()">关闭</button>
    <button class="btn btn-p" onclick="App.saveTg()">保存设置</button>
  </div>
</div>
<div id="cnameModal" class="modal glass">
  <h3>CNAME 更换</h3>
  <div class="small">当前 CNAME：<b id="cnameCurrent">-</b></div>
  <input id="cnameValue" placeholder="输入新的 CNAME 目标域名（例如 cf.example.com）">
  <div class="small">提示：只填域名，不要带 http:// 或 https://</div>
  <div class="btns">
    <button class="btn btn-g" onclick="App.closeAllModals()">关闭</button>
    <button class="btn btn-g" onclick="App.loadCnameStatus()">刷新</button>
    <button class="btn btn-p" onclick="App.saveCname()">保存</button>
  </div>
</div>
<div id="toastWrap" class="toast-wrap"></div>
</div>
<script>
const $ = (s)=>document.querySelector(s);
function mountFabToControls(){
  const controls = document.querySelector('.controls');
  const fab = document.querySelector('.fab');
  if (!controls || !fab || fab.dataset.moved === '1') return;
  controls.appendChild(fab);   
  fab.dataset.moved = '1';
}
const SVG = {
  edit: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  eyeOff: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M9 10V7a3 3 0 0 1 6 0"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  ping: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 1 0 9 9"></path><path d="M12 7v5l3 3"></path></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15 9 22 9 17 14 19 22 12 18 5 22 7 14 2 9 9 9 12 2"></polygon></svg>',
  starOn: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.2"><polygon points="12 2 15 9 22 9 17 14 19 22 12 18 5 22 7 14 2 9 9 9 12 2"></polygon></svg>',
};
const PRESETS = {
  light: {
    "--bg":"#f3f6fb","--panel":"#ffffff","--text":"#1e293b","--text2":"#0f172a","--muted":"#64748b","--line":"#dbe3ef","--icon":"#64748b",
    "--inbg":"rgba(255,255,255,.92)","--intext":"#0f172a","--inborder":"#d8e2f0","--blue":"#3b82f6",
    "--card-bg":"#ffffff","--card-bg2":"#fbfdff","--card-text":"#1e293b","--card-muted":"#64748b","--card-line":"#dbe4f2"
  },
  deepblue: {
    "--bg":"#0b1830","--panel":"#18263b","--text":"#ecf3ff","--text2":"#d8e8ff","--muted":"#9fb4cc","--line":"#2f3f58","--icon":"#b8c7da",
    "--inbg":"rgba(19,33,54,.72)","--intext":"#e8f1ff","--inborder":"rgba(51,71,97,.9)","--blue":"#4f8fff",
    "--card-bg":"#17263b","--card-bg2":"#1b2d45","--card-text":"#eaf2ff","--card-muted":"#a9bdd7","--card-line":"#2f4564"
  },
  graphite: {
    "--bg":"#121417","--panel":"#1a1e24","--text":"#f3f4f6","--text2":"#e5e7eb","--muted":"#9ca3af","--line":"#323844","--icon":"#c1c7d0",
    "--inbg":"rgba(23,27,33,.72)","--intext":"#f3f4f6","--inborder":"rgba(58,67,80,.9)","--blue":"#4f7cff",
    "--card-bg":"#1b2028","--card-bg2":"#212733","--card-text":"#f3f4f6","--card-muted":"#a6b0bf","--card-line":"#3a4352"
  }
};
const Gate = {
  key: 'emby_admin_token',
getToken() { return (sessionStorage.getItem(this.key) || '').trim(); },
setToken(v) { sessionStorage.setItem(this.key, String(v || '').trim()); },
clearToken() { sessionStorage.removeItem(this.key); },
  initGateEye(){
    const icon = $('#gatePassIcon');
    if (icon) icon.innerHTML = SVG.eye;
  },
  toggleGatePass(){
    const ip = $('#gatePwd');
    const icon = $('#gatePassIcon');
    if (!ip) return;
    const show = ip.type === 'password';
    ip.type = show ? 'text' : 'password';
    if (icon) icon.innerHTML = show ? SVG.eyeOff : SVG.eye;
  },
bindEvents() {
  this.initGateEye();
  const btn = $('#gateBtn');
  const input = $('#gatePwd');
  if (btn) {
    if (!btn.__bound) {
      btn.__bound = true;
      btn.addEventListener('click', () => this.check());
    }
  }
  if (input && !input.__bound) {
    input.__bound = true;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.check();
    });
  }
},
async check() {
  const tip = $('#gateTip');
  if (tip) {
    tip.classList.remove('ok');
    tip.classList.add('show');
    tip.innerText = '登录中...';
  }
  const v = ($('#gatePwd')?.value || '').trim();
  if (!v) {
    if (tip) tip.innerText = '请输入 ADMIN_TOKEN';
    return;
  }
  try {
    this.setToken(v);
    const d = await API.listCached({ ttl: 0, force: true });
    if (!d || d.error) {
      throw new Error(d?.error || '登录失败');
    }
    const gate = $('#gate');
    const app = $('#app');
    if (gate) gate.style.display = 'none';
    if (app) app.style.display = 'block';
    await App.init(d);
    if (tip) {
      tip.classList.add('ok');
      tip.innerText = '登录成功';
      tip.classList.remove('show');
    }
  } catch (e) {
    this.clearToken();
    const msg = String(e?.message || e || '登录失败');
    if (tip) {
      tip.classList.remove('ok');
      tip.classList.add('show');
      tip.innerText = msg === 'UNAUTHORIZED' ? '令牌错误' : ('登录失败: ' + msg);
    }
    console.error('Gate.check failed:', e);
  }
},
async boot() {
  this.bindEvents();
    const token = this.getToken();
    if (!token) { $('#gate').style.display='flex'; $('#app').style.display='none'; return; }
    const d = await API.listCached({ ttl: 0, force: true });
    if (d && !d.error) {
      $('#gate').style.display='none';
      $('#app').style.display='block';
      App.init(d);
    } else {
      this.clearToken();
      $('#gate').style.display='flex';
      $('#app').style.display='none';
    }
  },
  logout() { this.clearToken(); location.reload(); }
};
const API = {
  _listCache: null,
  _listCacheAt: 0,
  _listInflight: null,
  async req(data) {
    const headers = { 'Content-Type':'application/json' };
    const token = Gate.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    let r;
    try {
      r = await fetch('/admin', { method:'POST', headers, body: JSON.stringify(data) });
    } catch (e) {
  return { error: '网络异常: ' + (e?.message || e) };
}
    let d = {};
    try { d = await r.json(); } catch {}
    if (!r.ok) return { error: d.error || ('HTTP_' + r.status), status: r.status };
    return d;
  },
  async listCached({ ttl = 10000, force = false } = {}) {
    const now = Date.now();
    if (!force && this._listCache && (now - this._listCacheAt) < ttl) {
      return this._listCache;
    }
    if (!force && this._listInflight) {
      return await this._listInflight;
    }
    const p = this.req({ action:'list' }).finally(() => {
      this._listInflight = null;
    });
    this._listInflight = p;
    const d = await p;
    if (d && !d.error) {
      this._listCache = d;
      this._listCacheAt = Date.now();
    }
    return d;
  },
  clearListCache() {
    this._listCache = null;
    this._listCacheAt = 0;
    this._listInflight = null;
  }
};
function normalizeHHmmLoose(v) {
  let s = String(v ?? "").trim();
  if (!s) return "";
  s = s.replace(/[\s\u3000]+/g, "");
  s = s.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 65248));
  s = s.replace(/[﹕∶٫]/g, ":").replace(/[．。]/g, ".");
  const nums = s.split(/[^0-9]+/).filter(Boolean);
  if (nums.length < 2) return "";
  const hh = Math.max(0, Math.min(23, Number(nums[0])));
  const mm = Math.max(0, Math.min(59, Number(nums[1])));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return "";
  return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
}
const App = {
  nodes: [],
  filterText: '',
  selectedTags: new Set(),
  allTags: [],
  selected: new Set(),
  visibleMap: new Set(),
  expandMap: new Set(),
  statusMap: {},
  editingOldName: null,
    kThemePreset: 'emby_theme_preset',
  kDensity: 'emby_density',
  kBg: 'emby_bg_cfg',
    autoRefreshMs: 1800000,   
  autoRefreshTimer: null,
  startAutoRefresh(){
    if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
    this.autoRefreshTimer = setInterval(() => this.refresh(), this.autoRefreshMs);
  },
  compatAutoFixEditor: async function () {
    const el = $("#inRealIpMode");
    if (!el) return;
    const baseName = this.editingOldName || ($("#inName") && $("#inName").value) || "";
    const nameRaw = String(baseName).trim().toLowerCase();
    if (!nameRaw) {
      this.toast("请先保存节点路径，再执行一键修复。", "warn");
      return;
    }
    this.toast("正在执行兼容性一键修复...", "warn");
    const r = await API.req({ action: "node.compat.autofix", name: nameRaw });
    if (!r || !r.success) {
      this.toast((r && r.error) || "一键修复失败", "error");
      return;
    }
    const mode = String(r.mode || "smart").toLowerCase();
    el.value = mode;
    let label = "自动（推荐）";
    if (mode === "realip_only") label = "严格（推荐）";
    else if (mode === "off") label = "保守";
    else if (mode === "dual") label = "最大兼容";
    this.toast("已应用一键修复：" + label, "success");
  },
normalizeHHmm(v, defVal = "00:00") {
  let s = String(v ?? "").trim();
  if (!s) return defVal;
  s = s.replace(/[\s\u3000]+/g, "");
  s = s.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 65248),
  );
  s = s.replace(/[﹕∶٫]/g, ":").replace(/[．。]/g, ".");
  const nums = s.split(/[^0-9]+/).filter(Boolean);
  if (nums.length < 2) return defVal;
  const hh = Math.max(0, Math.min(23, Number(nums[0])));
  const mm = Math.max(0, Math.min(59, Number(nums[1])));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return defVal;
  return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
},
async init(prefetchedList = null){
  this.loadPrefs();
  if (prefetchedList && !prefetchedList.error) {
    this.applyListData(prefetchedList);
  } else {
    await this.refresh();
  }
  mountFabToControls();
  this.bindBgRangePreview();
  this.startAutoRefresh();
},
openTagSuggest(){
  const inp = $('#inTag');
  if(!inp) return;
  inp.focus();
  try { inp.dispatchEvent(new KeyboardEvent('keydown', { key:'ArrowDown', bubbles:true })); } catch {}
},
  loadPrefs(){
    this.setPreset(localStorage.getItem(this.kThemePreset) || 'light', false);
    this.setDensity(localStorage.getItem(this.kDensity) || 'compact', false);
    this.applyBg(this.getBgCfg());
  },
  setPreset(name, needToast=true){
    const p = PRESETS[name] || PRESETS.light;
    Object.keys(p).forEach(k=>document.documentElement.style.setProperty(k,p[k]));
    localStorage.setItem(this.kThemePreset,name);
    if(needToast) this.toast('主题已切换','success');
  },
  quickTheme(){
    const cur = localStorage.getItem(this.kThemePreset) || 'light';
    const next = cur==='light' ? 'deepblue' : (cur==='deepblue' ? 'graphite' : 'light');
    this.setPreset(next,true);
  },
  setDensity(mode, needToast=true){
    const compact = mode !== 'cozy';
    document.documentElement.style.setProperty('--density-gap', compact?'12px':'16px');
    document.documentElement.style.setProperty('--density-card-pad', compact?'14px':'18px');
document.documentElement.style.setProperty('--density-name-size', compact?'28px':'32px');
document.documentElement.style.setProperty('--density-label-size', compact?'13px':'14px');
document.documentElement.style.setProperty('--density-mono-size', compact?'12px':'13px');
    localStorage.setItem(this.kDensity, compact?'compact':'cozy');
    if(needToast) this.toast('密度已切换','success');
  },
  getBgCfg(){ try{return JSON.parse(localStorage.getItem(this.kBg)||'{}');}catch{return {};} },
applyBg(cfg){
  const url = String((cfg && cfg.url) || "").trim();
  const brightness = Number((cfg && cfg.brightness) ?? 100);
  const blur = Number((cfg && cfg.blur) ?? 0);
  const overlay = Number((cfg && cfg.overlay) ?? 20);
  document.documentElement.style.setProperty("--bg-brightness", brightness + "%");
  document.documentElement.style.setProperty("--bg-blur", blur + "px");
  document.documentElement.style.setProperty("--bg-overlay", String(overlay / 100));
  const bgLayer = $("#bgLayer");
  const bgOverlay = $("#bgOverlay");
  if (!bgLayer || !bgOverlay) return;
  bgLayer.style.filter = "brightness(" + brightness + "%) blur(" + blur + "px)";
  bgOverlay.style.background = "rgba(0,0,0," + (Math.max(0, Math.min(80, overlay)) / 100) + ")";
  if (url) {
    const safeUrl = String(url)
      .split('"').join("%22")
      .split("(").join("%28")
      .split(")").join("%29");
    bgLayer.style.backgroundImage = 'url("' + safeUrl + '")';
    document.body.classList.add("has-bg");
  } else {
    bgLayer.style.backgroundImage = "none";
    document.body.classList.remove("has-bg");
  }
},
  openBgModal(){
    const cfg = this.getBgCfg();
    $('#bgUrl').value = cfg.url || '';
    $('#bgBrightness').value = String(cfg.brightness ?? 100);
    $('#bgBlur').value = String(cfg.blur ?? 0);
    $('#bgOverlayRange').value = String(cfg.overlay ?? 20);
    this.refreshBgRangeText();
    this.openModal('bgModal');
  },
     openTgModal() {
    this.loadTg();
    this.openModal("tgModal");
  },
  openCnameModal() {
    this.loadCnameStatus();
    this.openModal("cnameModal");
  },
  async loadCnameStatus() {
    const r = await API.req({ action: "dns.get" });
    if (!r || !r.success) {
      this.toast((r && r.error) || "获取 DNS 状态失败", "error");
      return;
    }
    const cur = (Array.isArray(r.cname) && r.cname.length > 0) ? r.cname[0] : "";
    $("#cnameCurrent").textContent = cur || "--";
    $("#cnameValue").value = cur || "";
  },
  async saveCname() {
    let v = String($("#cnameValue").value || "").trim();
    const low = v.toLowerCase();
    if (low.startsWith("https://")) v = v.slice(8);
    else if (low.startsWith("http://")) v = v.slice(7);
    while (v.endsWith("/")) v = v.slice(0, -1);
    v = v.trim();
    if (!v) return this.toast("请输入 CNAME 目标域名", "warn");
    const okChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-";
    for (let i = 0; i < v.length; i++) {
      if (!okChars.includes(v[i])) {
        return this.toast("CNAME 格式不正确", "warn");
      }
    }
    const r = await API.req({
      action: "dns.replace",
      mode: "CNAME",
      cname: v,
    });
    if (!r || !r.success) return this.toast((r && r.error) || "保存失败", "error");
    this.toast("保存成功", "success");
    await this.loadCnameStatus();
  },
  async loadTg() {
    const r = await API.req({ action: "tg.get" });
    if (!r || !r.success) return this.toast(r.error || "读取失败", "error");
    const lineName = (c) => ({ CN: "中国通用", CT: "电信优先", CU: "联通优先", CM: "移动优先" }[String(c || "").toUpperCase()] || "-");
    const typeName = (t) => (String(t || "").toUpperCase() === "AAAA" ? "IPv6(AAAA)" : "IPv4(A)");
    $("#tgEnable").checked = !!r.content.enabled;
    $("#tgToken").value = r.content.token || "";
    $("#tgChat").value = r.content.chat || "";
    $("#tgReportTime").value = r.content.reportTime || "00:00";
    $("#tgReportEveryMin").value = Math.max(
      60,
      Number(r.content.reportEveryMin || 60),
    );
    $("#tgReportMaxPerDay").value = Math.min(
      24,
      Math.max(1, Number(r.content.reportMaxPerDay || 1)),
    );
    $("#tgAllowRepeat").checked = r.content.reportChangeOnly === false;
  },
  async saveTg() {
    const reportTime = String($("#tgReportTime").value || "").trim();
    const reportEveryMin = Number($("#tgReportEveryMin").value || 60);
    const reportMaxPerDay = Number($("#tgReportMaxPerDay").value || 1);
    if (
      !Number.isFinite(reportEveryMin) ||
      reportEveryMin < 60 ||
      reportEveryMin > 1440
    ) {
      return this.toast("日报间隔范围:60~1440 分钟（最小60）", "warn");
    }
    if (
      !Number.isFinite(reportMaxPerDay) ||
      reportMaxPerDay < 1 ||
      reportMaxPerDay > 24
    ) {
      return this.toast("日报每日次数范围:1~24", "warn");
    }
    const cfg = {
      enabled: !!$("#tgEnable").checked,
      token: String($("#tgToken").value || "").trim(),
      chat: String($("#tgChat").value || "").trim(),
      reportTime,
      reportEveryMin: Math.floor(reportEveryMin),
      reportMaxPerDay: Math.floor(reportMaxPerDay),
      reportChangeOnly: !$("#tgAllowRepeat").checked,
    };
    const r = await API.req({ action: "tg.set", content: cfg });
    if (!r || !r.success) return this.toast(r.error || "保存失败", "error");
    this.toast("保存成功", "success");
  },
  async testTg(){
    const r = await API.req({ action:'tg.test' });
    if(!r || !r.success) return this.toast(r.error || '发送失败','error');
    this.toast('测试消息已发送','success');
  },
  bindBgRangePreview(){
    ['bgBrightness','bgBlur','bgOverlayRange'].forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      el.addEventListener('input',()=>{
        this.refreshBgRangeText();
        this.applyBg({
          url: ($('#bgUrl').value || '').trim(),
          brightness: Number($('#bgBrightness').value || 100),
          blur: Number($('#bgBlur').value || 0),
          overlay: Number($('#bgOverlayRange').value || 20)
        });
      });
    });
  },
  refreshBgRangeText(){
    $('#bgBrightnessVal').innerText = ($('#bgBrightness').value || 100)+'%';
    $('#bgBlurVal').innerText = ($('#bgBlur').value || 0)+'px';
    $('#bgOverlayVal').innerText = ($('#bgOverlayRange').value || 20)+'%';
  },
  saveBg(){
    const cfg = {
      url: ($('#bgUrl').value || '').trim(),
      brightness: Number($('#bgBrightness').value || 100),
      blur: Number($('#bgBlur').value || 0),
      overlay: Number($('#bgOverlayRange').value || 20)
    };
    localStorage.setItem(this.kBg, JSON.stringify(cfg));
    this.applyBg(cfg);
    this.toast('背景设置已保存','success');
    this.closeAllModals();
  },
  clearBg(){
    const cfg = this.getBgCfg();
    cfg.url = '';
    localStorage.setItem(this.kBg, JSON.stringify(cfg));
    this.applyBg(cfg);
    this.toast('背景已清除','warn');
  },
applyListData(d){
  this.nodes = (d.nodes || []).map(n=>({ ...n, tag:n.tag||'', note:n.note||'' }));
  $('#nodeCount').innerText = this.nodes.length + '个';
  this.buildTagFilter();
  this.updateTagSuggestions();
  this.renderList();
  this.updateGlobalVisibilityBtn();
  this.updateBatchBar();
},
async refresh(){
  const d = await API.listCached({ ttl: 0, force: true });
  if(d.error){
    if (d.error === 'UNAUTHORIZED') { this.toast('登录失效，请重新登录','error'); Gate.logout(); return; }
    this.toast(d.error,'error');
    return;
  }
  this.applyListData(d);
},
  buildTagFilter(){
    this.allTags = Array.from(new Set(this.nodes.map(n=>(n.tag||'').trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'zh-CN'));
    this.selectedTags = new Set([...this.selectedTags].filter(t => this.allTags.includes(t)));
    this.updateTagFilterBtn();
  },
  updateTagFilterBtn(){
    const btn = $('#tagFilterBtn');
    if(!btn) return;
    if(this.selectedTags.size===0){ btn.textContent = '标签:全部'; return; }
    const arr = [...this.selectedTags];
    btn.textContent = arr.length===1 ? ('标签:' + arr[0]) : ('标签:' + arr[0] + ' +' + (arr.length-1));
  },
  openTagPicker(){
    const box = $('#tagPickerList');
    if(!this.allTags.length){
      box.innerHTML = '<div class="tag-empty">暂无标签</div>';
    }else{
      box.innerHTML = this.allTags.map((t)=>{
        const ck = this.selectedTags.has(t) ? 'checked' : '';
        return '<label class="tag-item"><input type="checkbox" data-tag="'+this.escapeHtml(t)+'" '+ck+'> <span>'+this.escapeHtml(t)+'</span></label>';
      }).join('');
    }
    this.openModal('tagPicker');
  },
  applyTagFilter(){
    const boxes = document.querySelectorAll('#tagPickerList input[type="checkbox"]');
    const set = new Set();
    boxes.forEach(el=>{ if(el.checked) set.add(el.getAttribute('data-tag') || ''); });
    this.selectedTags = set;
    this.updateTagFilterBtn();
    this.closeAllModals();
    this.renderList();
    this.updateBatchBar();
  },
  clearTagFilter(){
    this.selectedTags.clear();
    this.updateTagFilterBtn();
    this.closeAllModals();
    this.renderList();
    this.updateBatchBar();
  },
updateTagSuggestions(){
  const dl = $('#tagSuggestions');
  if(!dl) return;
  const freq = new Map();
  this.nodes.forEach(n => {
    const t = (n.tag || '').trim();
    if (!t) return;
    freq.set(t, (freq.get(t) || 0) + 1);
  });
  const tags = [...freq.entries()]
    .sort((a,b)=>(b[1]-a[1]) || a[0].localeCompare(b[0], 'zh-CN'))
    .slice(0, 30)
    .map(x => x[0]);
  dl.innerHTML = tags.map(t => '<option value="'+this.escapeHtml(t)+'"></option>').join('');
},
  getFiltered() {
  const txt = (this.filterText || '').toLowerCase();
  return this.nodes.filter((n) => {
    const tag = (n.tag || '').trim();
    const okTag = this.selectedTags.size === 0 || this.selectedTags.has(tag);
    const okText =
      !txt ||
      n.name.toLowerCase().includes(txt) ||
      (n.displayName || '').toLowerCase().includes(txt) ||
      (n.note || '').toLowerCase().includes(txt);
    return okTag && okText;
  });
},
  filter(v){ this.filterText=v||''; this.renderList(); this.updateBatchBar(); },
  dragName: '',
  sortByOrder(arr) {
    return [...arr].sort((a, b) => {
      const af = !!a.fav, bf = !!b.fav;
      if (af !== bf) return af ? -1 : 1; 
      const ar = Number.isFinite(a.rank) ? a.rank : 1e9;
      const br = Number.isFinite(b.rank) ? b.rank : 1e9;
      if (ar !== br) return ar - br;
      return String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN');
    });
  },
async moveOrder(dragName, targetName) {
  if (!dragName || !targetName || dragName === targetName) return;
  const all = this.sortByOrder(this.nodes).map(n => n.name);
  const from = all.indexOf(dragName);
  const to = all.indexOf(targetName);
  if (from < 0 || to < 0) return;
  all.splice(from, 1);
  all.splice(to, 0, dragName);
  const rankMap = new Map(all.map((name, i) => [name, i + 1]));
  this.nodes = this.nodes.map(n => ({ ...n, rank: rankMap.get(n.name) ?? n.rank }));
  this.renderList();
  const r = await API.req({ action: 'saveOrder', names: all });
  if (!r.success) {
    this.toast(r.error || '保存排序失败', 'error');
    await this.refresh(); 
    return;
  }
  this.toast('排序已保存', 'success');
},
bindCardDrag(card, name) {
  card.setAttribute('draggable', 'true');
  card.addEventListener('dragstart', (e) => {
    this.dragName = name;
    card.classList.add('dragging');
    try { e.dataTransfer.setData('text/plain', name); } catch {}
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragend', () => {
    this.dragName = '';
    card.classList.remove('dragging');
    document.querySelectorAll('.card.drag-over').forEach(el => el.classList.remove('drag-over'));
  });
  card.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (this.dragName && this.dragName !== name) card.classList.add('drag-over');
  });
  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (this.dragName && this.dragName !== name) card.classList.add('drag-over');
  });
  card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
  card.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    card.classList.remove('drag-over');
    const drag = this.dragName || (e.dataTransfer ? e.dataTransfer.getData('text/plain') : '');
    if (!drag || drag === name) return;
    await this.moveOrder(drag, name);
  });
},
  tagClass(tag){
    const t = (tag||'').toLowerCase();
    if (t.includes('公益') || t.includes('公费')) return 'b-green';
    if (t.includes('白名单')) return 'b-blue';
    if (t.includes('机场')) return 'b-orange';
    return 'b-gray';
  },
isMobileOS(){
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isiOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isAndroid || isiOS;
},
  statusText(name){
    const s = this.statusMap[name];
    if(!s) return {cls:'unknown',txt:'未检测'};
    if(s.online) return {cls:'online',txt:'在线 '+s.latency+'ms'};
    return {cls:'offline',txt:'离线'};
  },
  escapeHtml(s){
    if(s==null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  },
  iconBtn(svg, title, onClick, extraStyle){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-btn';
    if (title) b.title = title;
    if (extraStyle) b.style.cssText = extraStyle;
    b.innerHTML = svg;
    b.addEventListener('click', onClick);
    return b;
  },
  parseServerInfoFromUrl(fullUrl){
    try{
      const u = new URL(fullUrl);
      const host = u.hostname;
      const port = u.port ? Number(u.port) : (u.protocol === 'https:' ? 443 : 80);
      const path = (u.pathname && u.pathname !== '/') ? u.pathname : '';
      const https = u.protocol === 'https:';
      return { host, port, path, https, raw: fullUrl };
    }catch{
      return null;
    }
  },
  buildManualImportText(fullUrl, username, password){
  const info = this.parseServerInfoFromUrl(fullUrl);
  if (!info) return '';
  const scheme = info.https ? 'https' : 'http';
  const port = info.port;
  const hasCustomPort =
    (scheme === 'https' && Number(port) !== 443) ||
    (scheme === 'http' && Number(port) !== 80);
  const origin = scheme + '://' + info.host + (hasCustomPort ? (':' + String(port)) : '');
  const pathOnly = info.path || '/';
  const NL = String.fromCharCode(10);
  return (
    '地址: ' + origin + NL +
    '用户名: ' + String(username || '') + NL +
    '密码: ' + String(password || '') + NL +
    '路径: ' + pathOnly
  );
},
  buildHillsImportUrls(fullUrl, username, password){
  const info = this.parseServerInfoFromUrl(fullUrl);
  if (!info) return null;
  const scheme = info.https ? 'https' : 'http';
  const port = info.port;
  const pathOnly = info.path || '';
  const normPath = pathOnly ? (pathOnly.startsWith('/') ? pathOnly : ('/' + pathOnly)) : '';
  const hasCustomPort =
    (scheme === 'https' && Number(port) !== 443) ||
    (scheme === 'http' && Number(port) !== 80);
  const origin = scheme + '://' + info.host + (hasCustomPort ? (':' + String(port)) : '');
  const mobileQs = new URLSearchParams({
    type: 'emby',
    scheme: String(scheme || ''),
    host: String(info.host || ''),
    port: String(port || ''),
    username: String(username || ''),
    password: String(password || '')
  });
  const mobileUrl = 'hills://import?' + mobileQs.toString();
  const windowsUrl =
    'hills://import?type=emby' +
    '&scheme=' + encodeURIComponent(String(scheme || '')) +
    '&host=' + encodeURIComponent(String(info.host || '')) +
    '&port=' + encodeURIComponent(String(port || '')) +
    '&username=' + encodeURIComponent(String(username || '')) +
    '&password=' + encodeURIComponent(String(password || ''));
  return { mobileUrl, windowsUrl, pathOnly };
},
buildEmbyImportUrl(app, fullUrl, username, password){
  const info = this.parseServerInfoFromUrl(fullUrl);
  if (!info) return null;
  let scheme = info.https ? 'https' : 'http';
  let port = info.port;
  if (app === 'forward') {
    scheme = 'https';
    port = 443;
  }
  const qs = new URLSearchParams({
    type: 'emby',
    scheme: String(scheme || ''),
    host: String(info.host || ''),
    port: String(port || ''),
    username: String(username || ''),
    password: String(password || '')
  });
  let prefix = '';
  if (app === 'hills') prefix = 'hills://import?';
  else if (app === 'forward') prefix = 'forward://import?';
  else return null;
  return {
    schemeUrl: prefix + qs.toString(),
    pathOnly: info.path || ''
  };
},
  openAppScheme(scheme){
    window.location.href = scheme;
  },
showPathModal(text, appName, onOpen, opts = {}){
  if (!text) { onOpen(); return; }
  const isManual = !!opts.manual;
  const old = document.getElementById('pathModalMask');
  if (old) old.remove();
  const mask = document.createElement('div');
  mask.id = 'pathModalMask';
  mask.style.position = 'fixed';
  mask.style.inset = '0';
  mask.style.zIndex = '99999';
  mask.style.background = 'rgba(0,0,0,.45)';
  mask.style.display = 'flex';
  mask.style.alignItems = 'center';
  mask.style.justifyContent = 'center';
  mask.style.padding = '16px';
  const box = document.createElement('div');
  box.style.width = 'min(92vw,420px)';
  box.style.background = 'var(--panel)';
  box.style.color = 'var(--text)';
  box.style.border = '1px solid var(--line)';
  box.style.borderRadius = '14px';
  box.style.padding = '14px';
  const title = document.createElement('div');
  title.style.fontWeight = '700';
  title.style.marginBottom = '8px';
  title.textContent = appName + (isManual ? ' 导入信息提示' : ' 路径填写提示');
  const sub = document.createElement('div');
  sub.style.fontSize = '13px';
  sub.style.opacity = '.9';
  sub.style.marginBottom = '8px';
  sub.textContent = isManual
    ? '该播放器可能不支持自动导入，请复制以下信息手动填写:'
    : '该播放器暂不支持自动写入 Path，请复制后粘贴到 Path:';
  const code = document.createElement('div');
  code.style.padding = '10px';
  code.style.border = '1px dashed #64748b';
  code.style.borderRadius = '10px';
  code.style.wordBreak = 'break-all';
  code.style.whiteSpace = 'pre-wrap';
  code.style.marginBottom = '12px';
  code.textContent = text;
  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '8px';
  btnRow.style.justifyContent = 'flex-end';
  function mkBtn(txt, primary){
    const b = document.createElement('button');
    b.textContent = txt;
    b.style.padding = '8px 12px';
    b.style.borderRadius = '10px';
    b.style.cursor = 'pointer';
    if (primary) {
      b.style.border = 'none';
      b.style.background = '#3b82f6';
      b.style.color = '#fff';
    } else {
      b.style.border = '1px solid #64748b';
      b.style.background = 'transparent';
      b.style.color = 'inherit';
    }
    return b;
  }
  const btnCancel = mkBtn('取消', false);
  const btnCopy = mkBtn(isManual ? '复制信息' : '复制路径', false);
  const btnOpen = mkBtn('打开 ' + appName, true);
  const close = () => mask.remove();
  btnCancel.onclick = close;
  btnCopy.onclick = async () => {
    try { await navigator.clipboard.writeText(text); } catch {}
    this.toast(isManual ? '导入信息已复制' : '路径已复制:' + text, 'success');
  };
  btnOpen.onclick = () => {
    close();
    onOpen();
  };
  mask.addEventListener('click', (e) => { if (e.target === mask) close(); });
  btnRow.appendChild(btnCancel);
  btnRow.appendChild(btnCopy);
  btnRow.appendChild(btnOpen);
  box.appendChild(title);
  box.appendChild(sub);
  box.appendChild(code);
  box.appendChild(btnRow);
  mask.appendChild(box);
  document.body.appendChild(mask);
},
openWithPathModal(app, schemeUrl, text, opts = {}){
  const nameMap = {
    sen: 'SenPlayer',
    epx: 'EPlayerX',
    hills: 'Hills',
    rodel: '小幻(Win)',
    forward: 'Forward'
  };
  const appName = nameMap[app] || app;
  this.showPathModal(text, appName, () => {
    this.openAppScheme(schemeUrl);
    this.toast('已打开 ' + appName, 'success');
  }, opts);
},
buildPathQuery(pathOnly) {
  const p = String(pathOnly || "").trim();
  if (!p) return "";
  const norm = p.startsWith("/") ? p : ("/" + p);
  const ep = encodeURIComponent(norm);
  return "&path=" + ep + "&basePath=" + ep + "&serverPath=" + ep;
},
toggleEditorPass() {
  const ip = $("#inPass");
  const icon = $("#togglePassIcon");
  if (!ip) return;
  const show = ip.type === "password";
  ip.type = show ? "text" : "password";
  if (icon) icon.innerHTML = show ? SVG.eyeOff : SVG.eye;
  const btn = $("#togglePassBtn");
  if (btn) btn.blur();
},
async quickAddThirdParty(app, node, fullUrl) {
  const address = String(fullUrl || "").trim();
  if (!address) {
    this.toast("缺少代理地址", "error");
    return;
  }
  let origin = address;
  let full = address;
  let pathOnly = "";
  let host = "";
  let port = "";
  let scheme = "";
  try {
    const u = new URL(address);
    origin = u.origin;
    full = u.origin + (u.pathname || "/");
    pathOnly = (u.pathname && u.pathname !== "/") ? u.pathname : "";
    host = u.hostname || "";
    scheme = String(u.protocol || "").replace(":", "");
    port = u.port || (u.protocol === "https:" ? "443" : "80");
  } catch (e) {}
  const userTrim = String((node && node.embyUser) || "").trim();
  const passTrim = String((node && node.embyPass) || "").trim();
  const uName = encodeURIComponent(userTrim);
  const pWord = encodeURIComponent(passTrim);
  const pqs = this.buildPathQuery(pathOnly);
  if (app === "sen") {
    const url =
      "senplayer://importserver?type=emby" +
      "&address=" + encodeURIComponent(origin) +
      "&username=" + uName +
      "&password=" + pWord +
      "&scheme=" + encodeURIComponent(scheme) +
      "&host=" + encodeURIComponent(host) +
      "&port=" + encodeURIComponent(String(port)) +
      pqs;
    this.openWithPathModal("sen", url, pathOnly);
    return;
  }
  if (app === "epx") {
    const url =
      "eplayerx://add-or-update?type=emby" +
      "&href=" + encodeURIComponent(full) +
      "&username=" + uName +
      "&password=" + pWord +
      "&scheme=" + encodeURIComponent(scheme) +
      "&host=" + encodeURIComponent(host) +
      "&port=" + encodeURIComponent(String(port)) +
      pqs;
    this.openWithPathModal("epx", url, pathOnly);
    return;
  }
  if (app === "capy") {
    try { await navigator.clipboard.writeText(address); } catch (e) {}
    this.toast("已复制代理地址（请在 Capy 手动粘贴）", "warn");
    return;
  }
  if (app === "hills") {
    const built = this.buildHillsImportUrls(address, userTrim, passTrim);
    if (!built) {
      this.toast("生成 Hills 导入链接失败", "error");
      return;
    }
    const ua = String(navigator.userAgent || "").toLowerCase();
    const isWindows = ua.indexOf("windows nt") >= 0;
    const hillsUrl = isWindows ? built.windowsUrl : built.mobileUrl;
    if (isWindows) {
      const manualText = this.buildManualImportText(address, userTrim, passTrim);
      let copied = false;
      try { await navigator.clipboard.writeText(manualText); copied = true; } catch (e) {}
      if (copied) this.toast("已复制手动导入信息", "warn");
      else {
        this.toast("剪贴板被拦截，已弹出手动复制框", "warn");
        window.prompt("请复制导入信息：", manualText);
      }
      this.openWithPathModal("hills", hillsUrl, manualText, { manual: true });
      return;
    }
    this.openWithPathModal("hills", hillsUrl, built.pathOnly);
    return;
  }
  if (app === "rodel") {
    const built = this.buildHillsImportUrls(address, userTrim, passTrim);
    if (!built) {
      this.toast("生成 Rodel 导入链接失败", "error");
      return;
    }
    const rodelUrl = String(built.windowsUrl || "").replace("hills://", "rodelplayer://");
    const ua = String(navigator.userAgent || "").toLowerCase();
    const isWindows = ua.indexOf("windows nt") >= 0;
    if (isWindows) {
      const manualText = this.buildManualImportText(address, userTrim, passTrim);
      let copied = false;
      try { await navigator.clipboard.writeText(manualText); copied = true; } catch (e) {}
      if (copied) this.toast("已复制手动导入信息", "warn");
      else {
        this.toast("剪贴板被拦截，已弹出手动复制框", "warn");
        window.prompt("请复制导入信息：", manualText);
      }
      this.openWithPathModal("rodel", rodelUrl, manualText, { manual: true });
      return;
    }
    this.openWithPathModal("rodel", rodelUrl, built.pathOnly);
    return;
  }
  if (app === "forward") {
    const built = this.buildEmbyImportUrl(app, address, userTrim, passTrim);
    if (!built) {
      this.toast("生成导入链接失败", "error");
      return;
    }
    this.openWithPathModal("forward", built.schemeUrl, built.pathOnly);
    return;
  }
},
  getAllVisibilityKeys() {
    const keys = [];
    for (const n of this.nodes) {
      keys.push(n.name + ':target');
      keys.push(n.name + ':proxyVis');
    }
    return keys;
  },
  areAllVisible() {
    const keys = this.getAllVisibilityKeys();
    if (!keys.length) return false;
    return keys.every(k => this.visibleMap.has(k));
  },
  updateGlobalVisibilityBtn() {
    const btn = document.getElementById('toggleAllVisBtn');
    if (!btn) return;
    const allVisible = this.areAllVisible();
    btn.innerHTML = allVisible
      ? '<span class="state-dot on"></span>隐藏全部地址'
      : '<span class="state-dot off"></span>显示全部地址';
  },
  toggleAllVisibility() {
    const keys = this.getAllVisibilityKeys();
    if (!keys.length) return this.toast('暂无节点', 'warn');
    const allVisible = keys.every(k => this.visibleMap.has(k));
    if (allVisible) {
      keys.forEach(k => this.visibleMap.delete(k));
      this.toast('已隐藏全部节点地址', 'success');
    } else {
      keys.forEach(k => this.visibleMap.add(k));
      this.toast('已显示全部节点地址', 'success');
    }
    this.renderList();
  },
  renderList(){
    const arr = this.sortByOrder(this.getFiltered());
    const list = $('#list');
    list.innerHTML = '';
    if(!arr.length){
      const empty = document.createElement('div');
      empty.className = 'card glass';
      empty.style.gridColumn = '1 / -1';
      empty.style.textAlign = 'center';
      empty.style.color = 'var(--muted)';
      empty.textContent = '暂无节点';
      list.appendChild(empty);
      this.updateGlobalVisibilityBtn();
      return;
    }
    for(const n of arr){
     const normalUrl = location.origin + '/' + encodeURIComponent(n.name);
     const fullUrl = n.secret ? (normalUrl + '/' + encodeURIComponent(n.secret)) : normalUrl;
      const kTarget = n.name + ':target';
      const kProxyVis = n.name + ':proxyVis';
      const kProxyExp = n.name + ':proxyExp';
      const showTarget = this.visibleMap.has(kTarget);
      const showProxy = this.visibleMap.has(kProxyVis);
      const targetExpanded = this.expandMap.has(kTarget);
      const proxyExpanded = this.expandMap.has(kProxyExp);
      const st = this.statusText(n.name);
      const card = document.createElement('div');
      card.className = 'card glass';
      this.bindCardDrag(card, n.name);
      const row = document.createElement('div');
      row.className = 'row';
      const leftWrap = document.createElement('div');
leftWrap.className = 'left-wrap';
const leftHead = document.createElement('div');
leftHead.className = 'left-head';
const sel = document.createElement('label');
sel.className = 'selbox';
const cb = document.createElement('input');
cb.type = 'checkbox';
cb.checked = this.selected.has(n.name);
cb.addEventListener('change', () => this.toggleSelect(n.name, cb.checked));
sel.appendChild(cb);
const info = document.createElement('div');
info.className = 'info';
const h3 = document.createElement('h3');
h3.className = 'name';
h3.textContent = (n.displayName || '').trim() || n.name;
h3.title = ((n.displayName || '').trim() || n.name) + '\\n/' + n.name;
const pathTip = document.createElement('div');
pathTip.className = 'path-tip';
pathTip.textContent = '/' + n.name;
const badges = document.createElement('div');
badges.className = 'badges';
const bm = document.createElement('span');
bm.className = 'badge ' + (n.directExternal ? 'b-mode-direct' : 'b-mode-normal');
bm.textContent = n.directExternal ? '直连' : '反代';
badges.appendChild(bm);
if ((n.tag || '').trim()) {
  const b1 = document.createElement('span');
  b1.className = 'badge ' + this.tagClass(n.tag);
  b1.textContent = n.tag;
  badges.appendChild(b1);
}
if ((n.note || '').trim()) {
  const b2 = document.createElement('span');
  b2.className = 'badge b-note';
  b2.textContent = n.note;
  badges.appendChild(b2);
}
const periodDays = Math.max(0, Math.floor(Number(n.renewDays || 0)));
const remindBeforeDays = Math.max(0, Math.floor(Number(n.remindBeforeDays || 0)));
if (periodDays > 0) {
  const b3 = document.createElement('span');
  b3.className = 'badge b-note';
  const baseTs = Number(n.lastPlayAt || 0); // 先用最后播放
  if (baseTs <= 0) {
    b3.textContent = '保号已启用';
    b3.style.background = '#e5e7eb';
    b3.style.color = '#374151';
  } else {
    const dueTs = baseTs + periodDays * 86400000;
    const leftMs = dueTs - Date.now();
    const warnMs = remindBeforeDays * 86400000;
    const leftDays = Math.ceil(leftMs / 86400000);
    if (leftMs <= 0) {
      b3.textContent = '保号到期';
      b3.style.background = '#fee2e2';
      b3.style.color = '#991b1b';
    } else if (leftMs <= warnMs) {
      b3.textContent = '即将到期 ' + leftDays + '天';
      b3.style.background = '#fef3c7';
      b3.style.color = '#92400e';
    } else {
      b3.textContent = '保号正常';
      b3.style.background = '#dcfce7';
      b3.style.color = '#166534';
    }
  }
  badges.appendChild(b3);
}
const status = document.createElement('div');
status.className = 'status';
const dot = document.createElement('span');
dot.className = 'dot ' + st.cls;
const txt = document.createElement('span');
txt.textContent = st.txt;
status.appendChild(dot);
status.appendChild(txt);
status.appendChild(this.iconBtn(SVG.ping, '检测此节点', () => this.checkNode(n.name)));
info.appendChild(h3);
info.appendChild(pathTip);
info.appendChild(badges);
info.appendChild(status);
const lastTs = Number(n.lastPlayAt || 0);
const lastText = lastTs
  ? new Date(lastTs).toLocaleString('zh-CN', { timeZone:'Asia/Shanghai', hour12:false })
  : '暂无';
const lastLine = document.createElement('div');
lastLine.className = 'subline';
const k = document.createElement('span');
k.className = 'k';
k.textContent = '最后播放';
const v = document.createElement('span');
v.className = 'v';
v.textContent = lastText;
lastLine.appendChild(k);
lastLine.appendChild(v);
info.appendChild(lastLine);
leftHead.appendChild(sel);
leftHead.appendChild(info);
leftWrap.appendChild(leftHead);
      const actions = document.createElement('div');
actions.className = 'actions';
const btnFav = this.iconBtn(n.fav ? SVG.starOn : SVG.star, n.fav ? '取消收藏' : '收藏置顶', () => this.toggleFav(n.name));
if (n.fav) btnFav.classList.add('is-fav');
actions.appendChild(btnFav);
actions.appendChild(this.iconBtn(SVG.edit, '编辑', () => this.openEditor(n.name)));
actions.appendChild(this.iconBtn(SVG.trash, '删除', () => this.del(n.name), 'color:#ef4444'));
      row.appendChild(leftWrap);
      row.appendChild(actions);
      card.appendChild(row);
const line1 = document.createElement('div');
line1.className = 'line';
const l1 = document.createElement('div'); l1.className = 'label'; l1.textContent = '目标地址';
const v1 = document.createElement('div');
v1.className = 'mono ' + (showTarget ? '' : 'muted');
v1.textContent = showTarget ? (n.target || '') : '******';
v1.title = '单击复制目标地址';
v1.addEventListener('click', () => {
  if (!showTarget) return this.toast('请先显示目标地址', 'warn');
  this.copyText(n.target || '', '已复制目标地址');
});
const eye1 = this.iconBtn(showTarget ? SVG.eyeOff : SVG.eye, showTarget ? '隐藏目标地址' : '显示目标地址', () => this.toggleVisibility(kTarget));
eye1.classList.add('eye-toggle', showTarget ? 'on' : 'off');
const c0 = this.iconBtn(SVG.copy, '复制目标地址', () => {
  if (!showTarget) return this.toast('请先显示目标地址', 'warn');
  this.copyText(n.target || '', '已复制目标地址');
});
c0.classList.add('copy-ghost');
const actions1 = document.createElement('div');
actions1.className = 'line-actions';
actions1.appendChild(eye1);
actions1.appendChild(c0);
line1.appendChild(l1);
line1.appendChild(v1);
line1.appendChild(actions1);
card.appendChild(line1);
const line2 = document.createElement('div');
line2.className = 'line';
const l2 = document.createElement('div'); l2.className = 'label'; l2.textContent = '代理地址';
const v2 = document.createElement('div');
v2.className = 'mono ' + (showProxy ? '' : 'muted');
v2.textContent = showProxy ? fullUrl : '******';
v2.title = '单击复制代理地址';
v2.addEventListener('click', () => {
  if (!showProxy) return this.toast('请先显示代理地址', 'warn');
  this.copyText(proxyCopyUrl, n.secret ? '已复制含密钥链接' : '已复制代理地址');
});
const proxyCopyUrl = fullUrl; // 有密钥=带密钥，无密钥=仅路径
const eye2 = this.iconBtn(showProxy ? SVG.eyeOff : SVG.eye, showProxy ? '隐藏代理地址' : '显示代理地址', () => this.toggleVisibility(kProxyVis));
eye2.classList.add('eye-toggle', showProxy ? 'on' : 'off');
const c2 = this.iconBtn(SVG.link, '复制代理地址', () => {
  if (!showProxy) return this.toast('请先显示代理地址', 'warn');
  this.copyText(proxyCopyUrl, n.secret ? '已复制含密钥链接' : '已复制代理地址');
});
c2.classList.add('copy-ghost');
const actions2 = document.createElement('div');
actions2.className = 'line-actions';
actions2.appendChild(eye2);
actions2.appendChild(c2);
line2.appendChild(l2);
line2.appendChild(v2);
line2.appendChild(actions2);
card.appendChild(line2);
const sen = document.createElement('button');
sen.className = 'app-btn';
sen.innerText = 'Sen';
sen.title = 'SenPlayer 一键添加';
sen.addEventListener('click', () => this.quickAddThirdParty('sen', n, fullUrl));
const capy = document.createElement('button');
capy.className = 'app-btn capy';
capy.innerText = 'Capy';
capy.title = 'CapyPlayer 复制配置';
capy.addEventListener('click', () => this.quickAddThirdParty('capy', n, fullUrl));
const epx = document.createElement('button');
epx.className = 'app-btn';
epx.innerText = 'Epx';
epx.title = 'EPlayerX 一键添加';
epx.addEventListener('click', () => this.quickAddThirdParty('epx', n, fullUrl));
const ua = (navigator.userAgent || '').toLowerCase();
const isWindows = ua.includes('windows nt');
const hills = document.createElement('button');
hills.className = 'app-btn';
hills.innerText = isWindows ? 'Hills(Win)' : 'Hills';
hills.title = isWindows ? 'Hills Windows 导入' : 'Hills 一键导入';
hills.addEventListener('click', () => this.quickAddThirdParty('hills', n, fullUrl));
const forward = document.createElement('button');
forward.className = 'app-btn';
forward.innerText = 'Forward';
forward.title = 'Forward 一键导入';
forward.addEventListener('click', () => this.quickAddThirdParty('forward', n, fullUrl));
const appRow = document.createElement('div');
appRow.className = 'app-row';
appRow.appendChild(sen);
appRow.appendChild(capy);
appRow.appendChild(epx);
appRow.appendChild(hills);
if (isWindows) {
  const rodel = document.createElement('button');
  rodel.className = 'app-btn';
  rodel.innerText = '小幻(Win)';
  rodel.title = '小幻播放器 Windows 导入';
  rodel.addEventListener('click', () => this.quickAddThirdParty('rodel', n, fullUrl));
  appRow.appendChild(rodel);
}
appRow.appendChild(forward);
if (appRow.childElementCount > 0) {
  card.appendChild(appRow);
}
      list.appendChild(card);
    }
    if (arr.length < 6) { 
      const hint = document.createElement('div');
      hint.className = 'page-hint';
      hint.style.gridColumn = '1 / -1';
      hint.textContent = '可点击右上 + 新增节点';
      list.appendChild(hint);
    }
    this.updateGlobalVisibilityBtn();
  },
  toggleSelect(name, checked){
    if(checked) this.selected.add(name); else this.selected.delete(name);
    this.updateBatchBar();
  },
  selectAllFiltered(){
    this.getFiltered().forEach(n=>this.selected.add(n.name));
    this.renderList();
    this.updateBatchBar();
    this.toast('已全选当前筛选结果','success');
  },
  clearSelection(){
    this.selected.clear();
    this.renderList();
    this.updateBatchBar();
  },
  updateBatchBar(){
    $('#selCount').innerText = String(this.selected.size);
    $('#batchBar').style.display = this.selected.size > 0 ? 'flex' : 'none';
  },
    async applyBatchCred(){
    const names = Array.from(this.selected || []);
    if (!names.length) return this.toast('请先选择节点', 'warn');
    const user = prompt('批量设置用户名（留空不修改）', '');
    if (user === null) return;
    const pass = prompt('批量设置密码（留空不修改）', '');
    if (pass === null) return;
    const setUser = String(user || '').trim();
    const setPass = String(pass || '').trim();
    if (!setUser && !setPass) {
      return this.toast('用户名和密码至少填写一个', 'warn');
    }
    let ok = 0, fail = 0;
    for (const name of names) {
      const n = this.nodes.find(x => x.name === name);
      if (!n) { fail++; continue; }
      const payload = {
        action: 'save',
        oldName: n.name,
        name: n.name,
        displayName: n.displayName || '',
        target: n.target || '',
        mode: n.mode || 'split',
        secret: n.secret || '',
        tag: n.tag || '',
        note: n.note || '',
        rank: Number.isFinite(Number(n.rank)) ? Number(n.rank) : undefined,
        fav: !!n.fav,
        embyUser: setUser ? setUser : (n.embyUser || ''),
        embyPass: setPass ? setPass : (n.embyPass || ''),
directExternal: toBool(n.directExternal),
realClientIpMode: n.realClientIpMode || 'smart',
renewDays: Number.isFinite(Number(n.renewDays)) ? Number(n.renewDays) : 0,
remindBeforeDays: Number.isFinite(Number(n.remindBeforeDays))
  ? Number(n.remindBeforeDays)
  : 0,
      };
      const r = await API.req(payload);
      if (r && r.success && (!r.failed || r.failed === 0)) ok++;
      else fail++;
    }
    API.clearListCache();
    await this.refresh();
    this.toast('批量账号密码完成:成功 ' + ok + '，失败 ' + fail, fail ? 'warn' : 'success');
  },
  async clearBatchCred(){
    const names = Array.from(this.selected || []);
    if (!names.length) return this.toast('请先选择节点', 'warn');
    if (!confirm('确认清空已选 ' + names.length + ' 个节点的 Emby 账号密码？')) return;
    let ok = 0, fail = 0;
    for (const name of names) {
      const n = this.nodes.find(x => x.name === name);
      if (!n) { fail++; continue; }
      const payload = {
        action: 'save',
        oldName: n.name,
        name: n.name,
        displayName: n.displayName || '',
        target: n.target || '',
        mode: n.mode || 'split',
        secret: n.secret || '',
        tag: n.tag || '',
        note: n.note || '',
        rank: Number.isFinite(Number(n.rank)) ? Number(n.rank) : undefined,
        fav: !!n.fav,
        embyUser: '',
        embyPass: '',
directExternal: toBool(n.directExternal),
realClientIpMode: n.realClientIpMode || 'smart',
renewDays: Number.isFinite(Number(n.renewDays)) ? Number(n.renewDays) : 0,
remindBeforeDays: Number.isFinite(Number(n.remindBeforeDays))
  ? Number(n.remindBeforeDays)
  : 0,
      };
      const r = await API.req(payload);
      if (r && r.success && (!r.failed || r.failed === 0)) ok++;
      else fail++;
    }
    API.clearListCache();
    await this.refresh();
    this.toast('清空账号密码完成:成功 ' + ok + '，失败 ' + fail, fail ? 'warn' : 'success');
  },
  async batchDelete(){
    const names = Array.from(this.selected);
    if(!names.length) return this.toast('请先选择节点','warn');
    if(!confirm('确认删除选中节点（'+names.length+'）?')) return;
    const r = await API.req({ action:'batchDelete', names });
    if(r.success){
      this.selected.clear();
      this.toast('已删除 '+(r.count||names.length)+' 个节点','success');
      await this.refresh();
    }else{
      this.toast(r.error || '批量删除失败','error');
    }
  },
  async checkNode(name){
    const r = await API.req({ action:'checkStatus', names:[name] });
    if(r.success && r.results && r.results[0]){
      this.statusMap[name] = r.results[0];
      this.renderList();
      this.toast(name + ': ' + (r.results[0].online ? ('在线 '+r.results[0].latency+'ms') : '离线'), r.results[0].online?'success':'warn');
    }else{
      this.toast(r.error || '检测失败','error');
    }
  },
  async checkSelectedStatus(){
    const names = Array.from(this.selected);
    if(!names.length) return this.toast('先选择节点再检测','warn');
    const r = await API.req({ action:'checkStatus', names });
    if(r.success){
      (r.results || []).forEach(x=>{ this.statusMap[x.name] = x; });
      this.renderList();
      this.toast('选中节点检测完成','success');
    }else{
      this.toast(r.error || '检测失败','error');
    }
  },
  async checkAllStatus(){
    const r = await API.req({ action:'checkStatus' });
    if(r.success){
      (r.results || []).forEach(x=>{ this.statusMap[x.name] = x; });
      this.renderList();
      this.toast('全部节点检测完成','success');
    }else{
      this.toast(r.error || '检测失败','error');
    }
  },
hideMenu(){
  const m = $('#menuPanel');
  if (m) m.style.display = 'none';
},
updateToastAnchor(){
  const modalIds = ['editor','bgModal','tagPicker','cnameModal','tgModal'];
  let opened = null;
  for (const id of modalIds) {
    const el = $('#' + id);
    if (el && el.style.display === 'block') { opened = el; break; }
  }
  let topPx = 18;
  if (opened) {
    const rect = opened.getBoundingClientRect();
    topPx = Math.max(8, Math.round(rect.top - 56));
  }
  document.documentElement.style.setProperty('--toast-top', topPx + 'px');
},
openModal(id){
  this.hideMenu();
  ['editor','bgModal','tagPicker','cnameModal','tgModal'].forEach(mid=>{
    const e = $('#'+mid);
    if (e) e.style.display = 'none';
  });
  $('#mask').style.display = 'block';
  const target = $('#'+id);
  if (target) target.style.display = 'block';
  document.body.classList.add('modal-open');
  this.updateToastAnchor();
},
closeAllModals(){
  $('#mask').style.display = 'none';
  ['editor','bgModal','tagPicker','cnameModal','tgModal'].forEach(id=>{
    const e = $('#'+id);
    if (e) e.style.display = 'none';
  });
  this.hideMenu();
  document.body.classList.remove('modal-open');
  document.documentElement.style.setProperty('--toast-top', '18px');
},
splitTargetsText(v){
  const s = String(v || '');
  const noCR = s.split(String.fromCharCode(13)).join('');
  const withComma = noCR
    .split(String.fromCharCode(10)).join(',')
    .split('，').join(',')
    .split('；').join(',')
    .split(';').join(',')
    .split('|').join(',');
  return withComma
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
},
ensureTargetRows(min = 1){
  const list = $('#targetList');
  if (!list) return;
  while (list.children.length < min) this.addTargetInput('');
},
addTargetInput(val = ''){
  const list = $('#targetList');
  if (!list) return;
  if (list.children.length >= 5) return this.toast('目标地址最多5条', 'warn');
  const input = document.createElement('input');
  input.className = 'target-item';
  input.placeholder = 'https://example.com';
  input.value = String(val || '');
  input.style.marginTop = '8px';
  list.appendChild(input);
},
removeTargetInput(){
  const list = $('#targetList');
  if (!list) return;
  if (list.children.length <= 1) return;
  list.removeChild(list.lastElementChild);
},
setTargetInputsFromText(text){
  const list = $('#targetList');
  if (!list) return;
  list.innerHTML = '';
  const arr = this.splitTargetsText(text);
  if (!arr.length) {
  this.addTargetInput('');
  return;
}
for (const t of arr) this.addTargetInput(t);
this.ensureTargetRows(1);
},
collectTargetsText(){
  const list = $('#targetList');
  if (!list) return '';
  const arr = [...list.querySelectorAll('input')]
    .map(i => (i.value || '').trim())
    .filter(Boolean);
return arr.join('\\n');
},
openEditor(name){
  this.editingOldName = '';
  this.currentMode = 'split';
  $('#editorTitle').innerText = '新增节点';
  $('#inName').value = '';
  $('#inDisplayName').value = '';
  $('#inTag').value = '';
  $('#inNote').value = '';
  this.setTargetInputsFromText('');
  $('#inSec').value = '';
  $('#inUser').value = '';
  $('#inRenewDays').value = '';
  $('#inPass').value = '';
  $('#inDirectExternal').checked = false;
  $('#inRealIpMode').value = 'smart';
  $('#inRemindBeforeDays').value = '';
  $('#inKeepaliveAt').value = '';
  $('#inKeepaliveMaxPerDay').value = '1';
  if (name) {
    const n = this.nodes.find(x => x.name === name);
    if (n) {
      this.editingOldName = n.name;
      $('#editorTitle').innerText = '编辑节点';
      $('#inName').value = n.name || '';
      $('#inDisplayName').value = n.displayName || '';
      $('#inTag').value = n.tag || '';
      $('#inNote').value = n.note || '';
      this.setTargetInputsFromText(n.target || '');
      $('#inSec').value = n.secret || '';
      $('#inUser').value = n.embyUser || '';
      $('#inPass').value = n.embyPass || '';
      $('#inDirectExternal').checked = !!n.directExternal;
      $('#inRealIpMode').value = n.realClientIpMode || 'smart';
      $('#inRenewDays').value = Number.isFinite(Number(n.renewDays)) ? String(Number(n.renewDays)) : '';
      $('#inRemindBeforeDays').value = Number.isFinite(Number(n.remindBeforeDays)) ? String(Number(n.remindBeforeDays)) : '';
      $('#inKeepaliveAt').value = n.keepaliveAt || '';
      $('#inKeepaliveMaxPerDay').value = Number.isFinite(Number(n.keepaliveMaxPerDay))
        ? String(Number(n.keepaliveMaxPerDay))
        : '1';
      this.currentMode = 'split';
    }
  }
  const tagInput = $('#inTag');
  if (tagInput && !tagInput.dataset.autoSuggestBound) {
    tagInput.addEventListener('focus', () => this.openTagSuggest());
    tagInput.dataset.autoSuggestBound = '1';
  }
  $('#inPass').type = 'password';
  const ticon = $('#togglePassIcon');
  if (ticon) ticon.innerHTML = SVG.eye;
  this.ensureTargetRows(1);
  this.openModal('editor');
},
async save(){
  const name = ($('#inName').value || '').trim();
  const displayName = ($('#inDisplayName').value || '').trim();
  const tag = ($('#inTag').value || '').trim();
  const note = ($('#inNote').value || '').trim();
  const target = this.collectTargetsText();
  const secret = ($('#inSec').value || '').trim();
  const embyUser = ($('#inUser').value || '').trim();
  const embyPass = ($('#inPass').value || '').trim();
  const directExternal = !!$('#inDirectExternal').checked;
  const realClientIpMode = String($('#inRealIpMode').value || 'smart').trim().toLowerCase();
  const renewDaysRaw = ($('#inRenewDays').value || '').trim();
  const renewDays = renewDaysRaw === '' ? 0 : Number(renewDaysRaw);
  if (!Number.isFinite(renewDays) || renewDays < 0 || renewDays > 3650) {
    return this.toast('保号周期不合法（0~3650）', 'warn');
  }
  const remindBeforeDaysRaw = ($('#inRemindBeforeDays').value || '').trim();
  const remindBeforeDays = remindBeforeDaysRaw === '' ? 0 : Number(remindBeforeDaysRaw);
  if (!Number.isFinite(remindBeforeDays) || remindBeforeDays < 0 || remindBeforeDays > 3650) {
    return this.toast('提前几天提醒不合法（0~3650）', 'warn');
  }
  const keepaliveAt = String($('#inKeepaliveAt').value || '').trim();
  const keepaliveMaxPerDayRaw = ($('#inKeepaliveMaxPerDay').value || '').trim();
  const keepaliveMaxPerDay = keepaliveMaxPerDayRaw === '' ? 1 : Number(keepaliveMaxPerDayRaw);
  if (!Number.isFinite(keepaliveMaxPerDay) || keepaliveMaxPerDay < 1 || keepaliveMaxPerDay > 24) {
  return this.toast('保号每日提醒次数不合法（1~24）', 'warn');
}
  if(!name || !target) return this.toast('请求路径和目标地址必填','warn');
  const lower = name.toLowerCase();
  const existed = this.nodes.some(x => String(x.name || '').toLowerCase() === lower);
  if (!this.editingOldName && existed) {
    return this.toast('请求路径重复:该节点已存在，请换一个路径', 'warn');
  }
  if (this.editingOldName && this.editingOldName.toLowerCase() !== lower && existed) {
    return this.toast('请求路径重复:该节点已存在，请换一个路径', 'warn');
  }
  const editingNode = this.editingOldName
    ? this.nodes.find(x => String(x.name || '').toLowerCase() === String(this.editingOldName).toLowerCase())
    : null;
  const rank = Number.isFinite(Number(editingNode?.rank)) ? Number(editingNode.rank) : undefined;
  const fav = !!editingNode?.fav;
  const mode = 'split';
  const r = await API.req({
    action:'save',
    name, displayName, target, mode,
    secret, tag, note, rank, fav,
    embyUser, embyPass,
    directExternal,
    realClientIpMode,
    renewDays: Math.floor(renewDays),
    remindBeforeDays: Math.floor(remindBeforeDays),
    keepaliveAt,
    keepaliveMaxPerDay: Math.floor(keepaliveMaxPerDay),
    oldName: this.editingOldName || ''
  });
  if(!r.success) return this.toast(r.error || '保存失败','error');
  if (r.failed > 0 && Array.isArray(r.errors) && r.errors[0]) {
    return this.toast('保存失败:' + r.errors[0].error, 'error');
  }
  API.clearListCache();
  this.closeAllModals();
  this.toast('保存成功','success');
  await this.refresh();
},
async testKeepaliveNotify(){
  const name = ($('#inName').value || '').trim() || '未命名节点';
  const displayName = ($('#inDisplayName').value || '').trim();
  const renewDaysRaw = ($('#inRenewDays').value || '').trim();
  const renewDays = renewDaysRaw === '' ? 0 : Number(renewDaysRaw);
  const remindBeforeDaysRaw = ($('#inRemindBeforeDays').value || '').trim();
  const remindBeforeDays = remindBeforeDaysRaw === '' ? 0 : Number(remindBeforeDaysRaw);
 const keepaliveAt = String($('#inKeepaliveAt').value || '').trim();
  const keepaliveMaxPerDayRaw = ($('#inKeepaliveMaxPerDay').value || '').trim();
  const keepaliveMaxPerDay = keepaliveMaxPerDayRaw === '' ? 1 : Number(keepaliveMaxPerDayRaw);
  const r = await API.req({
    action: 'keepalive.test',
    name,
    displayName: displayName || name,
    renewDays: Number.isFinite(renewDays) ? Math.floor(renewDays) : 0,
    remindBeforeDays: Number.isFinite(remindBeforeDays) ? Math.floor(remindBeforeDays) : 0,
    keepaliveAt,
    keepaliveMaxPerDay: Number.isFinite(keepaliveMaxPerDay) ? Math.floor(keepaliveMaxPerDay) : 1
  });
  if (!r || !r.success) {
    return this.toast((r && r.error) || '测试通知失败', 'error');
  }
  this.toast('测试通知已发送', 'success');
},
  async toggleFav(name){
  const r = await API.req({ action:'toggleFav', name });
  if(!r.success) return this.toast(r.error || '操作失败','error');
  API.clearListCache();   
  await this.refresh();
},
  async del(name){
    if(!confirm('删除节点: '+name+' ?')) return;
    const r = await API.req({ action:'delete', name });
    if(r.success){
      this.selected.delete(name);
      this.toast('删除成功','success');
      await this.refresh();
    }else{
      this.toast(r.error || '删除失败','error');
    }
  },
  async exportData(){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(this.nodes, null, 2)], { type:'application/json' }));
    a.download = 'nodes_ui.json';
    a.click();
    this.toast('导出完成','success');
  },
  importFile(input){
    const file = input.files && input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e)=>{
      try{
        const nodes = JSON.parse(e.target.result);
        const r = await API.req({ action:'import', nodes });
        if(r.success){
          if (r.failed > 0) this.toast('导入完成:成功 '+r.saved+'，失败 '+r.failed,'warn');
          else this.toast('导入成功','success');
          await this.refresh();
        } else {
          this.toast(r.error || '导入失败','error');
        }
      }catch{
        this.toast('导入文件格式错误','error');
      }finally{
        input.value='';
      }
    };
    reader.readAsText(file);
  },
toggleMenu(){
if (document.body.classList.contains('modal-open')) return;
  const m = $('#menuPanel');
  const open = m.style.display !== 'block';
  m.style.display = open ? 'block' : 'none';
  if (open) {
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    m.style.maxHeight = Math.max(220, Math.floor(vh * 0.72)) + 'px';
  }
},
  toggleVisibility(k){
    if(this.visibleMap.has(k)) this.visibleMap.delete(k);
    else this.visibleMap.add(k);
    this.renderList();
  },
  toggleExpand(k){
    if(this.expandMap.has(k)) this.expandMap.delete(k);
    else this.expandMap.add(k);
    this.renderList();
  },
  async copyText(text, msg){
    try{
      await navigator.clipboard.writeText(text);
      this.toast(msg || '复制成功','success');
    }catch{
      this.toast('复制失败','error');
    }
  },
toast(text, type){
  const wrap = $('#toastWrap');
  if (!wrap) return;
  while (wrap.firstChild) wrap.removeChild(wrap.firstChild);
  const el = document.createElement('div');
  el.className = 'toast ' + (type || 'success');
  el.textContent = String(text || '');
  wrap.appendChild(el);
  setTimeout(() => {
    if (el && el.parentNode) el.remove();
  }, 3000);
},
};
window.Gate = Gate;
window.App = App;
window.addEventListener('resize', () => App.updateToastAnchor && App.updateToastAnchor());
window.addEventListener('orientationchange', () => App.updateToastAnchor && App.updateToastAnchor());
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => Gate.boot());
} else {
  Gate.boot();
}
</script>
<div class="project-links">
  <span class="label">项目地址:</span>
  <a href="https://github.com/chenhr454/emby---worker" target="_blank" rel="noopener noreferrer">GitHub</a>
  <span class="label">频道:</span>
  <a href="https://t.me/embyfdgljl" target="_blank" rel="noopener noreferrer">Telegram</a>
</div>
<div class="disclaimer">
  <strong>免责声明:</strong>
  本项目仅供学习与技术测试使用，请遵守当地法律法规。使用者对配置、转发内容与访问行为承担全部责任，开发者不对任何直接或间接损失负责。
</div>
</body>
</html>`;
    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "Content-Security-Policy":
          "default-src 'self'; " +
          "img-src 'self' data: https:; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
          "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
          "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://cdnjs.cloudflare.com; " +
          "script-src-attr 'unsafe-inline'; " +
          "connect-src 'self' https:;",
      },
    });
  },
};
export default {
  async fetch(request, env, ctx) {
    cleanupTTLMaps();
    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico")
      return new Response("", { status: 204 });
    if (url.pathname === "/")
      return new Response(null, {
        status: 302,
        headers: { Location: "/admin" },
      });
    let segments = [];
    try {
      segments = url.pathname
        .split("/")
        .filter(Boolean)
        .map(decodeURIComponent);
    } catch {
      return new Response("Bad Request: invalid URL encoding", { status: 400 });
    }
    const root = segments[0];
    if (root === "admin") {
      if (request.method === "POST") return Database.handleApi(request, env);
      return UI.renderAdmin();
    }
    if (root && root !== "admin") {
      const nodeName = String(root || "")
        .trim()
        .toLowerCase();
      if (/^[a-z0-9_-]{1,32}$/i.test(nodeName)) {
        const nodeData = await Database.getNode(nodeName, env, ctx, "admin");
        if (nodeData) {
          const secret = nodeData.secret || "";
          let valid = true;
          let strip = 1;
          if (secret) {
            if (segments[1] === secret) strip = 2;
            else valid = false;
          }
          if (valid) {
            let remaining = "/" + segments.slice(strip).join("/");
            if (remaining === "/" && !url.pathname.endsWith("/")) {
              const redir = new URL(url.href);
              redir.pathname = redir.pathname + "/";
              return new Response(null, {
                status: 301,
                headers: { Location: redir.toString() },
              });
            }
            if (url.pathname.endsWith("/") && remaining !== "/")
              remaining += "/";
            if (remaining === "") remaining = "/";
            return ProxyHandler.handle(
              request,
              nodeData,
              remaining,
              nodeName,
              secret,
              env,
              "admin",
              ctx,
            );
          }
          return new Response("Node Not Found", { status: 404 });
        }
      }
    }
    const enableDirect = String(env.ENABLE_DIRECT_PROXY || "0") === "1";
    if (!enableDirect) return new Response("Node Not Found", { status: 404 });
    let directRaw = url.pathname.slice(1);
    try {
      directRaw = decodeURIComponent(directRaw);
    } catch {}
    const looksLikeHost =
      /^https?:\/\//i.test(directRaw) || /[.:]/.test(root || "");
    if (!looksLikeHost) return new Response("Node Not Found", { status: 404 });
    return ProxyHandler.handleDirect(request, directRaw, env);
  },
  async scheduled(event, env, ctx) {
    cleanupTTLMaps();
    ctx.waitUntil(
      (async () => {
        await Database.ensureProxyKvTable(env);
        const cfg = await Database.getTgConfig(env);
        const kv = Database.getKV(env);
        if (cfg && cfg.enabled && cfg.token && cfg.chat) {
          const now = Date.now();
          const shNow = new Date(
            new Date(now).toLocaleString("en-US", {
              timeZone: "Asia/Shanghai",
            }),
          );
          const curMin = shNow.getHours() * 60 + shNow.getMinutes();
          const reportTimeRaw = String(cfg.reportTime || "00:00")
            .trim()
            .replace(/[:﹕∶]/g, ":");
          const m = /^(\d{1,2}):(\d{1,2})(:(\d{1,2})(\.\d+)?)?$/.exec(
            reportTimeRaw,
          );
          let reportMin = 0;
          if (m) {
            const hh = Math.max(0, Math.min(23, Number(m[1])));
            const mm = Math.max(0, Math.min(59, Number(m[2])));
            reportMin = hh * 60 + mm;
          }
          if (curMin >= reportMin) {
            const day = Database.getDayKey();
            const everyMin = Math.max(60, Number(cfg.reportEveryMin || 60)); // 最低一小时
            const maxPerDay = Math.max(
              1,
              Math.min(24, Number(cfg.reportMaxPerDay || 1)),
            );
            const changeOnly = cfg.reportChangeOnly !== false; // 默认开启
            const cntKey = "report:cnt:" + day;
            const lastKey = "report:last:" + day;
            const digestKey = "report:digest:" + day;
            const sentCnt = kv ? Number((await kv.get(cntKey)) || 0) : 0;
            const lastTs = kv ? Number((await kv.get(lastKey)) || 0) : 0;
            let shouldSend = false;
            if (sentCnt < maxPerDay) {
              shouldSend = !lastTs || now - lastTs >= everyMin * 60 * 1000;
            }
            if (shouldSend) {
              const text = await Database.buildDailyReport(env);
              if (changeOnly && kv) {
                const digestBase = String(text || "")
                  .replace(/\s+/g, " ")
                  .replace(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?/g, "")
                  .trim();
                let h = 2166136261 >>> 0;
                for (let i = 0; i < digestBase.length; i++) {
                  h ^= digestBase.charCodeAt(i);
                  h = Math.imul(h, 16777619);
                }
                const digest = String(h >>> 0);
                const oldDigest = String((await kv.get(digestKey)) || "");
                if (!oldDigest || oldDigest !== digest) {
                  await sendTG(cfg.token, cfg.chat, text);
                  await kv.put(digestKey, digest);
                  await kv.put(cntKey, String(sentCnt + 1));
                  await kv.put(lastKey, String(now));
                }
              } else {
                await sendTG(cfg.token, cfg.chat, text);
                if (kv) {
                  await kv.put(cntKey, String(sentCnt + 1));
                  await kv.put(lastKey, String(now));
                }
              }
            }
          }
          await Database.checkKeepaliveAndNotify(env);
        }
        await Database.cleanupOld(env);
      })(),
    );
  },
};
