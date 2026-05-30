var host = 'https://api.bilibili.com';
var headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.bilibili.com",
    "Cookie": "bili_jct=8d857e6102f03611ebc812dd1832c6ed; DedeUserID=701168335; SESSDATA=f0d59c35%2C1770188969%2Cd19d6%2A81CjCR7VuWQpC5Aps2RKhzCed6afXrGsS7ArTXuWKduCIlnjKvs-NFL-AOOhDWA0q3lh4SVmNINmZmVWpjMGVNbFlmS1piODR4WkRyTFBTNUo5Y3E0VExkcFdESm1JSkEyVzJyZzRkQ1RzYzNrcGJ6M0NwNkVmZjJ5UnowZENLY2RFb2RzQ0k0a25BIIEC;"
};

// ==================== 工具函数 ====================
function fixCover(url) {
    if (!url) return "";
    if (url.indexOf("//") === 0) return "https:" + url;
    return url;
}

function stripHtmlTag(src) {
    return src.replace(/<\/?[^>]+(>|$)/g, "").replace(/&.{1,5};/g, "").replace(/\s{2,}/g, " ");
}

function formatDuration(duration) {
    if (!duration) return "";
    // "12:34" 格式
    if (typeof duration === "string" && duration.indexOf(":") > -1) {
        var parts = duration.split(":");
        var min = parseInt(parts[0]);
        if (min < 60) return min + "分";
        var h = Math.floor(min / 60);
        var m = min % 60;
        return m > 0 ? h + "小时" + m + "分" : h + "小时";
    }
    // 秒数格式
    var totalMin = Math.floor(parseInt(duration) / 60);
    if (totalMin < 60) return totalMin + "分";
    var hours = Math.floor(totalMin / 60);
    var mins = totalMin % 60;
    return mins > 0 ? hours + "小时" + mins + "分" : hours + "小时";
}

function parseVodList(vodList) {
    var videos = [];
    if (!vodList) return videos;
    vodList.forEach(function(vod) {
        var aid = (vod.bvid || vod.aid || "").toString();
        var title = stripHtmlTag(vod.title || "");
        var img = fixCover(vod.pic);
        var remark = formatDuration(vod.duration);
        if (aid) videos.push({ vod_id: aid, vod_name: title, vod_pic: img, vod_remarks: remark });
    });
    return videos;
}

function parseSearchResult(json) {
    var videos = [];
    if (!json || json.code !== 0) return videos;
    return parseVodList(json.data && json.data.result ? json.data.result : []);
}

// ==================== 分类 ====================
var CLASSES = [
    {"type_id": "推荐", "type_name": "推荐"},
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
    {"type_id": "高中信息技术", "type_name": "高中信息技术"}
];

// ==================== TVBox 接口 ====================
function init(cfg) {}

function home(filter) {
    return JSON.stringify({ "class": CLASSES, "list": [] });
}

function homeVod() {
    var resp = req(host + "/x/web-interface/popular?ps=20&pn=1", { headers: headers });
    var jo = JSON.parse(resp.content);
    return JSON.stringify({ "list": parseVodList(jo.data ? jo.data.list : []) });
}

function category(tid, pg, filter, extend) {
    var p = pg || 1;
    var videos = [];

    if (tid === "推荐") {
        var resp = req(host + "/x/web-interface/index/top/rcmd?ps=20&fresh_idx=" + p + "&fresh_idx_1h=" + p, { headers: headers });
        var jo = JSON.parse(resp.content);
        if (jo.code === 0 && jo.data && jo.data.item) {
            videos = parseVodList(jo.data.item);
        }
    } else {
        // 搜索分类 —— 用 keyword 直接搜索，参考 gao 脚本的方式
        var url = host + "/x/web-interface/search/type?search_type=video&keyword=" + encodeURIComponent(tid) + "&page=" + p;
        var resp = req(url, { headers: headers });
        var jo = JSON.parse(resp.content);
        videos = parseSearchResult(jo);
    }

    return JSON.stringify({ "list": videos, "page": p });
}

function detail(id) {
    var url;
    if (id.indexOf("BV") === 0) {
        url = host + "/x/web-interface/view/detail?bvid=" + id;
    } else {
        url = host + "/x/web-interface/view/detail?aid=" + id;
    }
    var resp = req(url, { headers: headers });
    var jo = JSON.parse(resp.content);
    if (jo.code !== 0) return JSON.stringify({ list: [] });
    var data = jo.data.View || jo.data;
    var pages = data.pages || [];
    var playurls = [];
    pages.forEach(function(pg, i) {
        var part = (pg.part || ("P" + (i + 1))).replace(/#/g, "﹟").replace(/\$/g, "﹩");
        playurls.push(part + "$" + (data.bvid || data.aid) + "_" + pg.cid);
    });
    return JSON.stringify({
        list: [{
            vod_id: data.bvid || data.aid || id,
            vod_name: data.title || "",
            vod_pic: data.pic || "",
            vod_play_from: "B站",
            vod_play_url: playurls.join("#")
        }]
    });
}

function search(wd, quick, pg) {
    return category(wd, pg, null, null);
}

function play(flag, id, flags) {
    var ids = id.split("_");
    if (ids.length < 2) return JSON.stringify({ parse: 1, url: "", header: {} });
    var bvid = ids[0];
    var cid = ids[1];
    var url = host + "/x/player/playurl?bvid=" + bvid + "&cid=" + cid + "&qn=80&fnval=16";
    var resp = req(url, { headers: headers });
    var jo = JSON.parse(resp.content);
    if (jo.code === 0 && jo.data) {
        if (jo.data.dash && jo.data.dash.video && jo.data.dash.video.length > 0) {
            return JSON.stringify({
                parse: 0,
                url: jo.data.dash.video[0].base_url || jo.data.dash.video[0].baseUrl,
                header: { "Referer": "https://www.bilibili.com", "User-Agent": "Mozilla/5.0" }
            });
        }
        if (jo.data.durl && jo.data.durl.length > 0) {
            return JSON.stringify({
                parse: 0,
                url: jo.data.durl[0].url,
                header: { "Referer": "https://www.bilibili.com", "User-Agent": "Mozilla/5.0" }
            });
        }
    }
    return JSON.stringify({ parse: 1, url: "https://www.bilibili.com/video/" + bvid, header: {} });
}

export default { init, home, homeVod, category, detail, search, play };
