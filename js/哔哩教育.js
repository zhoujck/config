let host = 'https://api.bilibili.com';
let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.bilibili.com",
    "Cookie": "bili_jct=你的bili_jct; DedeUserID=你的UID; SESSDATA=你的SESSDATA;"
};

// 目标UP主列表：名称 -> mid (B站用户ID)
const UP_LIST = [
    { name: "板鸭象棋", keyword: "板鸭象棋" },
    { name: "四郎讲棋", keyword: "四郎讲棋" },
    { name: "小植象棋", keyword: "小植象棋" }
];

async function init(cfg) {}

/**
 * 通用解析：从 Bilibili 搜索 API 提取视频列表
 */
function getVideos(json) {
    let videos = [];
    if (json["code"] !== 0) return videos;
    let vodList = json.data && json.data.result ? json.data.result : [];
    vodList.forEach(vod => {
        let aid = (vod["bvid"] || vod["aid"] || "").toString().trim();
        let title = (vod["title"] || "").trim().replace(/<em class="keyword">/g, "").replace(/<\/em>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        let img = vod["pic"] ? vod["pic"].trim() : "";
        if (img.startsWith("//")) img = "https:" + img;
        let author = vod["author"] || "";
        let play = vod["play"] || 0;
        let duration = vod["duration"] || "";
        let remark = formatPlay(play) + "  " + duration;
        videos.push({
            vod_id: aid,
            vod_name: title,
            vod_pic: img,
            vod_remarks: remark,
            vod_director: author
        });
    });
    return videos;
}

function formatPlay(num) {
    if (Number(num) > 1e8) return (num / 1e8).toFixed(1) + "亿";
    if (Number(num) > 1e4) return (num / 1e4).toFixed(1) + "万";
    return num + "";
}

/**
 * 首页分类
 */
async function home(filter) {
    let classes = UP_LIST.map((up, idx) => ({
        type_id: idx.toString(),
        type_name: up.name
    }));

    // 象棋综合搜索作为第一个分类
    classes.unshift({ type_id: "all", type_name: "全部象棋" });

    let filters = {};
    classes.forEach(c => {
        filters[c.type_id] = [
            {
                "key": "order",
                "name": "排序",
                "value": [
                    {"n": "最多播放", "v": "click"},
                    {"n": "最新发布", "v": "pubdate"},
                    {"n": "最多弹幕", "v": "dm"},
                    {"n": "最多收藏", "v": "stow"}
                ]
            }
        ];
    });

    return JSON.stringify({
        "class": classes,
        "filters": filters
    });
}

/**
 * 首页推荐
 */
async function homeVod() {
    let url = host + "/x/web-interface/search/type?keyword=" + encodeURIComponent("象棋 比赛") + "&search_type=video&page=1&order=click";
    let resp = await req(url, { headers: headers });
    let jo = JSON.parse(resp.content);
    return JSON.stringify({ list: getVideos(jo) });
}

/**
 * 分类页面：根据分类ID决定搜索关键词
 */
async function category(tid, pg, filter, extend) {
    let p = pg || 1;
    let order = (extend && extend.order) ? extend.order : "click";
    let keyword = "";

    if (tid === "all") {
        keyword = "象棋";
    } else {
        let idx = parseInt(tid);
        if (idx >= 0 && idx < UP_LIST.length) {
            keyword = UP_LIST[idx].keyword;
        } else {
            keyword = "象棋";
        }
    }

    let url = host + "/x/web-interface/search/type?keyword=" + encodeURIComponent(keyword) + "&search_type=video&page=" + p + "&order=" + order;
    let resp = await req(url, { headers: headers });
    let jo = JSON.parse(resp.content);
    return JSON.stringify({
        "list": getVideos(jo),
        "page": parseInt(p)
    });
}

/**
 * 详情页
 */
async function detail(id) {
    // 通过 bvid 获取视频详情
    let url = host + "/x/web-interface/view?bvid=" + id;
    let resp = await req(url, { headers: headers });
    let jo = JSON.parse(resp.content);

    if (jo.code !== 0) {
        // 尝试用 aid
        url = host + "/x/web-interface/view?aid=" + id;
        resp = await req(url, { headers: headers });
        jo = JSON.parse(resp.content);
    }

    if (jo.code !== 0) {
        return JSON.stringify({ list: [] });
    }

    let data = jo.data;
    let stat = data.stat || {};

    let status = "播放: " + formatPlay(stat.view || 0) +
        "　弹幕: " + formatPlay(stat.danmaku || 0) +
        "　点赞: " + formatPlay(stat.like || 0) +
        "　投币: " + formatPlay(stat.coin || 0) +
        "　收藏: " + formatPlay(stat.favorite || 0);

    let pages = data.pages || [];
    let playurls = [];
    pages.forEach(pg => {
        let part = pg.part || ("P" + pg.page);
        playurls.push(part + "$" + pg.cid);
    });

    let pubDate = data.pubdate ? new Date(data.pubdate * 1000).toISOString().slice(0, 10) : "";

    return JSON.stringify({
        list: [{
            vod_id: id,
            vod_name: data.title || "",
            vod_pic: data.pic || "",
            type_name: "象棋",
            vod_year: pubDate,
            vod_area: "大陆",
            vod_remarks: data.owner ? data.owner.name : "",
            vod_actor: status,
            vod_director: data.owner ? data.owner.name : "",
            vod_content: (data.desc || "").substring(0, 300),
            vod_play_from: "B站",
            vod_play_url: playurls.join("#")
        }]
    });
}

/**
 * 搜索
 */
async function search(wd, quick, pg) {
    let p = pg || 1;
    let keyword = wd.includes("象棋") ? wd : wd + " 象棋";
    let url = host + "/x/web-interface/search/type?keyword=" + encodeURIComponent(keyword) + "&search_type=video&page=" + p + "&order=click";
    let resp = await req(url, { headers: headers });
    let jo = JSON.parse(resp.content);
    return JSON.stringify({ list: getVideos(jo) });
}

/**
 * 播放
 */
async function play(flag, id, flags) {
    let cid = id;

    // 如果 id 不是纯数字，尝试作为 bvid 获取 cid
    if (!/^\d+$/.test(id)) {
        let url = host + "/x/web-interface/view?bvid=" + id;
        let resp = await req(url, { headers: headers });
        let jo = JSON.parse(resp.content);
        if (jo.code === 0 && jo.data) {
            cid = jo.data.cid;
            let pages = jo.data.pages || [];
            if (pages.length > 0) {
                cid = pages[0].cid;
            }
        }
    }

    // 尝试获取播放地址
    let url = host + "/x/player/playurl?bvid=" + id + "&cid=" + cid + "&qn=80&fnval=16";
    let resp = await req(url, { headers: headers });
    let jo = JSON.parse(resp.content);

    if (jo.code === 0 && jo.data) {
        let dash = jo.data.dash;
        if (dash) {
            // DASH 格式
            let videoList = dash.video || [];
            let audioList = dash.audio || [];
            let videoUrl = videoList.length > 0 ? videoList[0].baseUrl || videoList[0].base_url : "";
            let audioUrl = audioList.length > 0 ? audioList[0].baseUrl || audioList[0].base_url : "";
            return JSON.stringify({
                parse: 0,
                url: videoUrl,
                header: {
                    "Referer": "https://www.bilibili.com",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                }
            });
        }
        let durl = jo.data.durl;
        if (durl && durl.length > 0) {
            return JSON.stringify({
                parse: 0,
                url: durl[0].url,
                header: {
                    "Referer": "https://www.bilibili.com",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                }
            });
        }
    }

    // fallback: 返回播放页解析
    return JSON.stringify({
        parse: 1,
        url: "https://www.bilibili.com/video/" + id,
        header: { "User-Agent": "Mozilla/5.0" }
    });
}

export default { init, home, homeVod, category, detail, search, play };
