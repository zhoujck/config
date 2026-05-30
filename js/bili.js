// @name 哔哩教育
// @description OK影视 - B站教育视频源
// @version 1.0.0

let host = 'https://api.bilibili.com';

// ==================== 配置区域 ====================
// 在这里填入你的B站 Cookie（包含 SESSDATA），不填也能用，但画质上限 1080P
// 获取方式：浏览器登录 bilibili.com → F12 → Application → Cookies → 复制 SESSDATA 和 bili_jct
let BILI_COOKIE = "";  // 例: "SESSDATA=xxx; bili_jct=xxx"

// 生成随机 buvid
function genBuvid3() {
    return Date.now().toString(16) + Math.random().toString(16).substring(2, 10);
}
function genBuvid4() {
    return "X" + Date.now().toString(16) + Math.random().toString(16).substring(2, 14);
}

let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.bilibili.com",
    ...(BILI_COOKIE ? { "Cookie": BILI_COOKIE } : {})
};

// 搜索专用 headers（需要不同的 Referer 和 buvid）
let _buvid3 = genBuvid3();
let _buvid4 = genBuvid4();
let _cookieBase = "buvid3=" + _buvid3 + "; buvid4=" + _buvid4;
let searchHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://search.bilibili.com/all?keyword=test",
    "Origin": "https://search.bilibili.com",
    "Cookie": BILI_COOKIE ? (BILI_COOKIE + "; " + _cookieBase) : _cookieBase
};

// ==================== WBI 签名 ====================
const MIXIN_KEY_ENC_TAB = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
    27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 17, 6, 28,
];

function getMixinKey(raw) {
    return MIXIN_KEY_ENC_TAB.map(n => raw[n]).join("").substring(0, 32);
}

// 纯 JS MD5 实现（适配 OK影视 无 Node.js crypto 环境）
function md5Simple(string) {
    function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]); x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
    }
    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
    function md5blk(s) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) +
                (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }
    function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
    function rhex(n) {
        var s = '', j = 0;
        for (; j < 4; j++)
            s += '0123456789abcdef'.charAt((n >> (j * 8 + 4)) & 0x0F) +
                '0123456789abcdef'.charAt((n >> (j * 8)) & 0x0F);
        return s;
    }
    function hex(x) {
        for (var i = 0; i < x.length; i++) x[i] = rhex(x[i]);
        return x.join('');
    }
    var n = string.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i = 64; i <= n; i += 64) {
        md5cycle(state, md5blk(string.substring(i - 64, i)));
    }
    string = string.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < string.length; i++)
        tail[i >> 2] |= string.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
        md5cycle(state, tail);
        for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return hex(state);
}

let _wbiKeysCache = null;

async function getWbiKeys() {
    if (_wbiKeysCache) return _wbiKeysCache;
    try {
        let resp = await req(host + "/x/web-interface/nav", { headers: searchHeaders });
        let jo = JSON.parse(resp.content);
        let wbi = jo.data && jo.data.wbi_img;
        if (wbi) {
            let imgKey = (wbi.img_url || "").split("/").pop().split(".")[0] || "";
            let subKey = (wbi.sub_url || "").split("/").pop().split(".")[0] || "";
            _wbiKeysCache = { imgKey, subKey };
        }
    } catch (e) {}
    if (!_wbiKeysCache) _wbiKeysCache = { imgKey: "", subKey: "" };
    return _wbiKeysCache;
}

async function signWbiParams(params) {
    let { imgKey, subKey } = await getWbiKeys();
    let mixinKey = getMixinKey(imgKey + subKey);
    let wts = Math.floor(Date.now() / 1000);
    let sortedParams = {};
    Object.keys(params).sort().forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            sortedParams[key] = params[key];
        }
    });
    sortedParams.wts = wts;
    let query = Object.entries(sortedParams).map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
    let w_rid = md5Simple(query + mixinKey);
    sortedParams.w_rid = w_rid;
    return sortedParams;
}

// ==================== 工具函数 ====================
function fixCover(url) {
    if (!url) return "";
    if (url.startsWith("//")) return "https:" + url;
    return url;
}

function formatDuration(duration) {
    if (!duration || typeof duration !== "string") return "00:00";
    let parts = duration.split(":");
    return parts.length === 2 ? duration : "00:00";
}

// ==================== 教育分类 ====================
const CLASSES = [
    {"type_id": "1年级语文", "type_name": "1年级语文"},
    {"type_id": "1年级数学", "type_name": "1年级数学"},
    {"type_id": "1年级英语", "type_name": "1年级英语"},
    {"type_id": "2年级语文", "type_name": "2年级语文"},
    {"type_id": "2年级数学", "type_name": "2年级数学"},
    {"type_id": "2年级英语", "type_name": "2年级英语"},
    {"type_id": "3年级语文", "type_name": "3年级语文"},
    {"type_id": "3年级数学", "type_name": "3年级数学"},
    {"type_id": "3年级英语", "type_name": "3年级英语"},
    {"type_id": "4年级语文", "type_name": "4年级语文"},
    {"type_id": "4年级数学", "type_name": "4年级数学"},
    {"type_id": "4年级英语", "type_name": "4年级英语"},
    {"type_id": "5年级语文", "type_name": "5年级语文"},
    {"type_id": "5年级数学", "type_name": "5年级数学"},
    {"type_id": "5年级英语", "type_name": "5年级英语"},
    {"type_id": "6年级语文", "type_name": "6年级语文"},
    {"type_id": "6年级数学", "type_name": "6年级数学"},
    {"type_id": "6年级英语", "type_name": "6年级英语"},
    {"type_id": "7年级语文", "type_name": "7年级语文"},
    {"type_id": "7年级数学", "type_name": "7年级数学"},
    {"type_id": "7年级英语", "type_name": "7年级英语"},
    {"type_id": "7年级历史", "type_name": "7年级历史"},
    {"type_id": "7年级地理", "type_name": "7年级地理"},
    {"type_id": "7年级生物", "type_name": "7年级生物"},
    {"type_id": "7年级物理", "type_name": "7年级物理"},
    {"type_id": "7年级化学", "type_name": "7年级化学"},
    {"type_id": "8年级语文", "type_name": "8年级语文"},
    {"type_id": "8年级数学", "type_name": "8年级数学"},
    {"type_id": "8年级英语", "type_name": "8年级英语"},
    {"type_id": "8年级历史", "type_name": "8年级历史"},
    {"type_id": "8年级地理", "type_name": "8年级地理"},
    {"type_id": "8年级生物", "type_name": "8年级生物"},
    {"type_id": "8年级物理", "type_name": "8年级物理"},
    {"type_id": "8年级化学", "type_name": "8年级化学"},
    {"type_id": "9年级语文", "type_name": "9年级语文"},
    {"type_id": "9年级数学", "type_name": "9年级数学"},
    {"type_id": "9年级英语", "type_name": "9年级英语"},
    {"type_id": "9年级历史", "type_name": "9年级历史"},
    {"type_id": "9年级地理", "type_name": "9年级地理"},
    {"type_id": "9年级生物", "type_name": "9年级生物"},
    {"type_id": "9年级物理", "type_name": "9年级物理"},
    {"type_id": "9年级化学", "type_name": "9年级化学"},
    {"type_id": "高一语文", "type_name": "高一语文"},
    {"type_id": "高一数学", "type_name": "高一数学"},
    {"type_id": "高一英语", "type_name": "高一英语"},
    {"type_id": "高一历史", "type_name": "高一历史"},
    {"type_id": "高一地理", "type_name": "高一地理"},
    {"type_id": "高一生物", "type_name": "高一生物"},
    {"type_id": "高一思想政治", "type_name": "高一思想政治"},
    {"type_id": "高一物理", "type_name": "高一物理"},
    {"type_id": "高一化学", "type_name": "高一化学"},
    {"type_id": "高二语文", "type_name": "高二语文"},
    {"type_id": "高二数学", "type_name": "高二数学"},
    {"type_id": "高二英语", "type_name": "高二英语"},
    {"type_id": "高二历史", "type_name": "高二历史"},
    {"type_id": "高二地理", "type_name": "高二地理"},
    {"type_id": "高二生物", "type_name": "高二生物"},
    {"type_id": "高二思想政治", "type_name": "高二思想政治"},
    {"type_id": "高二物理", "type_name": "高二物理"},
    {"type_id": "高二化学", "type_name": "高二化学"},
    {"type_id": "高三语文", "type_name": "高三语文"},
    {"type_id": "高三数学", "type_name": "高三数学"},
    {"type_id": "高三英语", "type_name": "高三英语"},
    {"type_id": "高三历史", "type_name": "高三历史"},
    {"type_id": "高三地理", "type_name": "高三地理"},
    {"type_id": "高三生物", "type_name": "高三生物"},
    {"type_id": "高三思想政治", "type_name": "高三思想政治"},
    {"type_id": "高三物理", "type_name": "高三物理"},
    {"type_id": "高三化学", "type_name": "高三化学"},
    {"type_id": "奥数", "type_name": "奥数"},
    {"type_id": "奥林匹克物理", "type_name": "奥物"},
    {"type_id": "奥林匹克化学", "type_name": "奥化"},
    {"type_id": "高中信息技术", "type_name": "高中信息技术"},
];

async function init(cfg) {}

async function home(filter) {
    // 首页推荐：搜索"启蒙"作为默认推荐内容
    try {
        let signedParams = await signWbiParams({ search_type: "video", keyword: "启蒙", page: 1 });
        let queryStr = Object.entries(signedParams).map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
        let resp = await req(host + "/x/web-interface/search/type?" + queryStr, { headers: searchHeaders });
        let jo = JSON.parse(resp.content);

        let list = [];
        if (jo.code === 0 && jo.data && jo.data.result) {
            jo.data.result.forEach(item => {
                if (item.type === "video") {
                    list.push({
                        vod_id: String(item.aid || ""),
                        vod_name: (item.title || "").replace(/<[^>]*>/g, ""),
                        vod_pic: fixCover(item.pic),
                        vod_remarks: formatDuration(item.duration)
                    });
                }
            });
        }
        return JSON.stringify({ "class": CLASSES, list: list });
    } catch (e) {
        return JSON.stringify({ "class": CLASSES, list: [] });
    }
}

async function homeVod() {
    // 首页推荐视频
    try {
        let signedParams = await signWbiParams({ search_type: "video", keyword: "中小学课程", page: 1 });
        let queryStr = Object.entries(signedParams).map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
        let resp = await req(host + "/x/web-interface/search/type?" + queryStr, { headers: searchHeaders });
        let jo = JSON.parse(resp.content);

        let list = [];
        if (jo.code === 0 && jo.data && jo.data.result) {
            jo.data.result.forEach(item => {
                if (item.type === "video") {
                    list.push({
                        vod_id: String(item.aid || ""),
                        vod_name: (item.title || "").replace(/<[^>]*>/g, ""),
                        vod_pic: fixCover(item.pic),
                        vod_remarks: formatDuration(item.duration)
                    });
                }
            });
        }
        return JSON.stringify({ list: list });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    let keyword = tid || "";
    let p = pg || 1;
    if (!keyword) {
        return JSON.stringify({ page: 1, pagecount: 0, total: 0, list: [] });
    }
    try {
        let rawParams = { search_type: "video", keyword: keyword, page: p };
        let signedParams = await signWbiParams(rawParams);
        let queryStr = Object.entries(signedParams).map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
        let resp = await req(host + "/x/web-interface/search/type?" + queryStr, { headers: searchHeaders });
        let jo = JSON.parse(resp.content);

        let list = [];
        if (jo.code === 0 && jo.data && jo.data.result) {
            jo.data.result.forEach(item => {
                if (item.type === "video") {
                    list.push({
                        vod_id: String(item.aid || ""),
                        vod_name: (item.title || "").replace(/<[^>]*>/g, ""),
                        vod_pic: fixCover(item.pic),
                        vod_remarks: formatDuration(item.duration)
                    });
                }
            });
        }
        return JSON.stringify({
            page: parseInt(p),
            pagecount: jo.data ? (jo.data.numPages || 1) : 1,
            total: jo.data ? (jo.data.numResults || list.length) : list.length,
            list: list
        });
    } catch (e) {
        return JSON.stringify({ page: parseInt(p), pagecount: 0, total: 0, list: [] });
    }
}

async function detail(id) {
    if (!id) return JSON.stringify({ list: [] });
    try {
        let resp = await req(host + "/x/web-interface/view?aid=" + id, { headers: headers });
        let jo = JSON.parse(resp.content);
        let video = jo.data;
        if (!video) return JSON.stringify({ list: [] });

        let pages = video.pages || [];

        // 探测可用画质：用第一个分P请求，获取支持的画质列表
        let availableQualities = [];
        if (pages.length > 0) {
            try {
                let testCid = pages[0].cid;
                let testUrl = host + "/x/player/playurl?avid=" + id + "&cid=" + testCid + "&qn=127&fnval=1&fourk=1";
                let testResp = await req(testUrl, { headers: headers });
                let testJo = JSON.parse(testResp.content);
                if (testJo.code === 0 && testJo.data) {
                    if (testJo.data.accept_quality && testJo.data.accept_quality.length > 0) {
                        // durl 模式：用 accept_quality
                        availableQualities = testJo.data.accept_quality.sort((a, b) => b - a);
                    } else if (testJo.data.dash && testJo.data.dash.video) {
                        // DASH 模式兜底
                        let qualityIds = new Set();
                        testJo.data.dash.video.forEach(v => { if (v.id) qualityIds.add(v.id); });
                        availableQualities = Array.from(qualityIds).sort((a, b) => b - a);
                    }
                }
            } catch (e) {}
        }

        // 如果没探测到，用默认画质
        if (availableQualities.length === 0) {
            availableQualities = [80, 64, 32];
        }

        // 生成多个播放源（每个画质一个源）
        let playFroms = [];
        let playUrls = [];
        availableQualities.forEach(qn => {
            let name = QUALITY_MAP[qn] || ("画质" + qn);
            playFroms.push(name);

            let parts = [];
            pages.forEach((p, i) => {
                let part = p.part || ("第" + (i + 1) + "集");
                parts.push(part + "$" + id + "_" + p.cid + "_" + qn);
            });
            playUrls.push(parts.join("#"));
        });

        return JSON.stringify({
            list: [{
                vod_id: String(id),
                vod_name: (video.title || "").replace(/<[^>]*>/g, ""),
                vod_pic: fixCover(video.pic),
                vod_content: video.desc || "",
                vod_play_from: playFroms.join("$$$"),
                vod_play_url: playUrls.join("$$$"),
                vod_actor: "弹幕: " + (video.stat ? video.stat.danmaku : 0)
                    + "　点赞: " + (video.stat ? video.stat.like : 0)
                    + "　收藏: " + (video.stat ? video.stat.favorite : 0),
                vod_director: video.owner ? video.owner.name : ""
            }]
        });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function search(wd, quick, pg) {
    return await category(wd, pg);
}

// 画质映射
const QUALITY_MAP = {
    127: "8K", 126: "杜比视界", 125: "HDR", 120: "4K", 116: "1080P60",
    112: "1080P+", 80: "1080P", 74: "720P60", 64: "720P", 32: "480P", 16: "360P"
};

async function play(flag, id, flags) {
    if (!id) return JSON.stringify({ parse: 0, url: "" });

    let idParts = id.split("_");
    if (idParts.length < 2) {
        return JSON.stringify({
            parse: 1,
            url: id,
            header: { "User-Agent": "Mozilla/5.0" }
        });
    }

    let avid, cid, qn;
    if (idParts.length >= 3) {
        // 格式: avid_cid_qn
        avid = idParts[0];
        cid = idParts[1];
        qn = parseInt(idParts[2]) || 80;
    } else {
        // 格式: avid_cid（兼容旧格式）
        avid = idParts[0];
        cid = idParts[1];
        // 从 flag 中提取画质
        qn = 80;
        if (flag && flag.indexOf("_") > -1) {
            let fparts = flag.split("_");
            let parsed = parseInt(fparts[fparts.length - 1]);
            if (!isNaN(parsed)) qn = parsed;
        }
    }

    try {
        // fnval=1 请求 durl 格式（单文件，音视频一体，兼容性最好）
        let url = host + "/x/player/playurl?avid=" + avid + "&cid=" + cid
            + "&qn=" + qn + "&fnval=1&fourk=1";
        let resp = await req(url, { headers: headers });
        let jo = JSON.parse(resp.content);

        if (jo.code !== 0 || !jo.data) {
            return JSON.stringify({ parse: 0, url: "" });
        }

        let durl = jo.data.durl;
        if (durl && durl.length > 0) {
            // 取最大文件
            let maxSize = -1;
            let position = 0;
            durl.forEach((item, i) => {
                if (maxSize < Number(item.size)) {
                    maxSize = Number(item.size);
                    position = i;
                }
            });

            return JSON.stringify({
                parse: 0,
                url: durl[position].url,
                contentType: "video/x-flv",
                header: {
                    "Referer": "https://www.bilibili.com",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                danmaku: "https://api.bilibili.com/x/v1/dm/list.so?oid=" + cid
            });
        }
    } catch (e) {}

    return JSON.stringify({ parse: 0, url: "" });
}

export default { init, home, homeVod, category, detail, search, play };
