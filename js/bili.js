let host = 'https://api.bilibili.com';
let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.bilibili.com",
    "Cookie": "SESSDATA=86c3fc83%2C1795696570%2Ca6d88%2A52CjAJMwAGyfu3lsQVCfvhNLbXvizfA7NyX-JKiBkTV8ZTHBPtUQ63FCn_a5jXrpITpScSVnFFZDVpeEdDSzJOdGJoVV9qcF9XaEs3c195bHA0UmFTVlZwNldhaFh6eUw1TnpNel91NHktLVc4NkZOdjFCc1dFZjl4aEdKY21FRnl1X1g4TVR2N3NRIIEC; bili_jct=279ec1a90956adda881fc7e7d4ac6406;"
};

function ensureBuvid() {
    var cookie = headers["Cookie"] || "";
    if (!cookie.includes("buvid3")) {
        var ts = Date.now().toString(16);
        var r1 = Math.random().toString(16).substring(2, 10);
        cookie += (cookie ? "; " : "") + "buvid3=" + ts + r1;
    }
    if (!cookie.includes("buvid4")) {
        var ts2 = Date.now().toString(16);
        var r2 = Math.random().toString(16).substring(2, 14);
        cookie += "; buvid4=X" + ts2 + r2;
    }
    headers["Cookie"] = cookie;
}

async function init(cfg) {
    if (cfg && cfg.ext) {
        let ext = typeof cfg.ext === 'string' ? JSON.parse(cfg.ext) : cfg.ext;
        if (ext.cookie) {
            headers["Cookie"] = ext.cookie;
        }
    }
    ensureBuvid();
}

// ==================== WBI 签名 ====================
const MIXIN_KEY_ENC_TAB = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
    27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 17, 6, 28,
];

function getMixinKey(raw) {
    return MIXIN_KEY_ENC_TAB.map(function (n) { return raw[n]; }).join("").substring(0, 32);
}

function md5(str) {
    try {
        var md = java.security.MessageDigest.getInstance("MD5");
        var bytes = new java.lang.String(str).getBytes("UTF-8");
        md.update(bytes);
        var digest = md.digest();
        var hex = "";
        for (var i = 0; i < digest.length; i++) {
            var b = digest[i] & 0xff;
            if (b < 16) hex += "0";
            hex += java.lang.Integer.toHexString(b);
        }
        return hex;
    } catch (e) {
        return "";
    }
}

let _wbiKeysCache = null;

function generateBuvid3() {
    var now = Date.now();
    var rand = Math.random().toString(16).substring(2, 10);
    return now.toString(16) + rand;
}

function generateBuvid4() {
    var now = Date.now();
    var rand = Math.random().toString(16).substring(2, 14);
    return "X" + now.toString(16) + rand;
}

function initSearchHeaders() {
    var cookie = headers["Cookie"] || "";
    if (!cookie.includes("buvid3")) {
        cookie += (cookie ? "; " : "") + "buvid3=" + generateBuvid3();
    }
    if (!cookie.includes("buvid4")) {
        cookie += "; buvid4=" + generateBuvid4();
    }
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://search.bilibili.com/all?keyword=1",
        "Origin": "https://search.bilibili.com",
        "Cookie": cookie
    };
}

async function getWbiKeys() {
    if (_wbiKeysCache) return _wbiKeysCache;
    try {
        var searchHeaders = initSearchHeaders();
        var resp = await req("https://api.bilibili.com/x/web-interface/nav", { headers: searchHeaders });
        var data = JSON.parse(resp.content);
        var wbi_img = (data.data && data.data.wbi_img) || {};
        var imgKey = (wbi_img.img_url || "").split("/").pop().split(".")[0] || "";
        var subKey = (wbi_img.sub_url || "").split("/").pop().split(".")[0] || "";
        _wbiKeysCache = { imgKey: imgKey, subKey: subKey };
        return _wbiKeysCache;
    } catch (e) {
        return { imgKey: "", subKey: "" };
    }
}

async function signWbiParams(params) {
    var keys = await getWbiKeys();
    var mixinKey = getMixinKey(keys.imgKey + keys.subKey);
    var wts = Math.floor(Date.now() / 1000);

    var sortedKeys = Object.keys(params).sort();
    var sortedParams = {};
    for (var i = 0; i < sortedKeys.length; i++) {
        var k = sortedKeys[i];
        if (params[k] !== undefined && params[k] !== null) {
            sortedParams[k] = params[k];
        }
    }
    sortedParams.wts = wts;

    var queryParts = [];
    var paramKeys = Object.keys(sortedParams);
    for (var j = 0; j < paramKeys.length; j++) {
        var pk = paramKeys[j];
        queryParts.push(encodeURIComponent(pk) + "=" + encodeURIComponent(sortedParams[pk]));
    }
    var query = queryParts.join("&");
    var w_rid = md5(query + mixinKey);

    sortedParams.w_rid = w_rid;
    return sortedParams;
}

// ==================== 配置 ====================
var DEFAULT_GRADE = "4年级";

// ==================== 教育分类（学科 + 年级筛选）====================
var CLASSES = [
    { "type_id": "语文", "type_name": "语文" },
    { "type_id": "数学", "type_name": "数学" },
    { "type_id": "英语", "type_name": "英语" },
    { "type_id": "物理", "type_name": "物理" },
    { "type_id": "化学", "type_name": "化学" },
    { "type_id": "生物", "type_name": "生物" },
    { "type_id": "历史", "type_name": "历史" },
    { "type_id": "地理", "type_name": "地理" },
    { "type_id": "思想政治", "type_name": "政治" },
    { "type_id": "信息技术", "type_name": "信息技术" },
    { "type_id": "奥数", "type_name": "奥数" },
    { "type_id": "奥物", "type_name": "奥物" },
    { "type_id": "奥化", "type_name": "奥化" },
    { "type_id": "象棋", "type_name": "象棋" }
];

var GRADE_VALUES = [
    { "n": "全部", "v": "" },
    { "n": "1年级", "v": "1年级" },
    { "n": "2年级", "v": "2年级" },
    { "n": "3年级", "v": "3年级" },
    { "n": "4年级", "v": "4年级" },
    { "n": "5年级", "v": "5年级" },
    { "n": "6年级", "v": "6年级" },
    { "n": "初一", "v": "7年级" },
    { "n": "初二", "v": "8年级" },
    { "n": "初三", "v": "9年级" },
    { "n": "高一", "v": "高一" },
    { "n": "高二", "v": "高二" },
    { "n": "高三", "v": "高三" }
];

var FILTERS = {};
var NO_GRADE = { "象棋": true };
for (var ci = 0; ci < CLASSES.length; ci++) {
    if (!NO_GRADE[CLASSES[ci].type_id]) {
        FILTERS[CLASSES[ci].type_id] = [
            { "key": "grade", "name": "年级", "value": GRADE_VALUES }
        ];
    }
}
FILTERS["象棋"] = [
    { "key": "grade", "name": "UP主", "value": [
        { "n": "全部", "v": "" },
        { "n": "板牙象棋", "v": "板牙象棋" },
        { "n": "四郎讲棋", "v": "四郎讲棋" }
    ]}
];

// ==================== 工具函数 ====================
function fixCover(url) {
    if (!url) return "";
    if (url.startsWith("//")) return "https:" + url;
    return url;
}

function formatDuration(duration) {
    if (!duration || typeof duration !== "string") return "00:00";
    var parts = duration.split(":");
    return parts.length === 2 ? duration : "00:00";
}

async function searchVideos(keyword, pg) {
    var p = pg || 1;
    var rawParams = { search_type: "video", keyword: keyword, page: p };
    var signedParams = await signWbiParams(rawParams);

    var searchHeaders = initSearchHeaders();
    var url = host + "/x/web-interface/search/type";
    var queryParts = [];
    var keys = Object.keys(signedParams);
    for (var i = 0; i < keys.length; i++) {
        queryParts.push(encodeURIComponent(keys[i]) + "=" + encodeURIComponent(signedParams[keys[i]]));
    }
    url += "?" + queryParts.join("&");

    var resp = await req(url, { headers: searchHeaders });
    var jo = JSON.parse(resp.content);

    if (jo.code !== 0) return { list: [], page: p, pagecount: 0, total: 0 };

    var result = jo.data && jo.data.result ? jo.data.result : [];
    var videos = [];
    for (var j = 0; j < result.length; j++) {
        var item = result[j];
        if (item.type !== "video") continue;
        videos.push({
            vod_id: String(item.aid || ""),
            vod_name: String(item.title || "").replace(/<[^>]*>/g, ""),
            vod_pic: fixCover(item.pic),
            vod_remarks: formatDuration(item.duration)
        });
    }

    return {
        list: videos,
        page: p,
        pagecount: jo.data ? (jo.data.numPages || 1) : 1,
        total: jo.data ? (jo.data.numResults || videos.length) : videos.length
    };
}

// ==================== 接口实现 ====================
async function home(filter) {
    var result = await searchVideos("教育 精品课程", 1);
    return JSON.stringify({
        "class": CLASSES,
        "filters": FILTERS,
        "list": result.list
    });
}

async function homeVod() {
    var result = await searchVideos("教育 精品课程", 1);
    return JSON.stringify({ list: result.list });
}

async function category(tid, pg, filter, extend) {
    var grade = (extend && extend.grade) ? extend.grade : "";
    var keyword;
    if (NO_GRADE[tid]) {
        keyword = grade || tid;
    } else {
        keyword = (grade && grade !== DEFAULT_GRADE) ? (grade + tid) : (DEFAULT_GRADE + tid);
    }
    var result = await searchVideos(keyword, pg);
    return JSON.stringify({
        "list": result.list,
        "page": result.page,
        "pagecount": result.pagecount,
        "total": result.total
    });
}

async function detail(id) {
    var url = host + "/x/web-interface/view?aid=" + id;
    var resp = await req(url, { headers: headers });
    var jo = JSON.parse(resp.content);

    if (jo.code !== 0 || !jo.data) return JSON.stringify({ list: [] });

    var video = jo.data;
    var pages = video.pages || [];
    var playurls = [];
    for (var i = 0; i < pages.length; i++) {
        var p = pages[i];
        var part = p.part || ("第" + (i + 1) + "集");
        playurls.push(part + "$" + id + "_" + p.cid);
    }

    return JSON.stringify({
        list: [{
            vod_id: id,
            vod_name: String(video.title || "").replace(/<[^>]*>/g, ""),
            vod_pic: fixCover(video.pic),
            type_name: "教育",
            vod_year: "",
            vod_area: "",
            vod_remarks: (video.owner ? video.owner.name : ""),
            vod_actor: "播放: " + (video.stat ? video.stat.view : 0) + "　弹幕: " + (video.stat ? video.stat.danmaku : 0),
            vod_director: "点赞: " + (video.stat ? video.stat.like : 0) + "　投币: " + (video.stat ? video.stat.coin : 0) + "　收藏: " + (video.stat ? video.stat.favorite : 0),
            vod_content: String(video.desc || ""),
            vod_play_from: "B站",
            vod_play_url: playurls.join("#")
        }]
    });
}

async function search(wd, quick, pg) {
    var keyword = wd || "";
    if (!keyword) return JSON.stringify({ list: [] });
    var result = await searchVideos(keyword, pg);
    return JSON.stringify({ list: result.list });
}

async function play(flag, id, flags) {
    var ids = id.split("_");
    if (ids.length < 2) {
        return JSON.stringify({ parse: 0, url: id, header: {} });
    }

    var avid = ids[0];
    var cid = ids[1];
    var playHeaders = {
        "Referer": "https://www.bilibili.com/video/av" + avid,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Cookie": headers["Cookie"]
    };

    var url = host + "/x/player/playurl?avid=" + avid + "&cid=" + cid + "&qn=80&fnval=1&fourk=1";
    var resp = await req(url, { headers: playHeaders });
    var jRoot = JSON.parse(resp.content);

    if (jRoot.code !== 0 || !jRoot.data) {
        return JSON.stringify({ parse: 0, url: "", header: {} });
    }

    var playUrl = "";
    if (jRoot.data.durl && jRoot.data.durl.length > 0) {
        var maxSize = -1;
        var position = 0;
        for (var i = 0; i < jRoot.data.durl.length; i++) {
            if (maxSize < Number(jRoot.data.durl[i].size)) {
                maxSize = Number(jRoot.data.durl[i].size);
                position = i;
            }
        }
        playUrl = jRoot.data.durl[position].url;
    }

    var dan = "https://api.bilibili.com/x/v1/dm/list.so?oid=" + cid;

    return JSON.stringify({
        parse: 0,
        url: playUrl,
        contentType: "video/x-flv",
        header: {
            "Referer": "https://www.bilibili.com",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
        },
        danmaku: dan
    });
}

export default { init, home, homeVod, category, detail, search, play };
