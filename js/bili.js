let host = 'https://api.bilibili.com';
let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.bilibili.com",
    "Cookie": ""
};

async function init(cfg) {}

function getVideos(json) {
    let videos = [];
    if (json["code"] !== 0) return videos;
    let vodList = json.data && json.data.result ? json.data.result : [];
    vodList.forEach(vod => {
        let aid = (vod["bvid"] || vod["aid"] || "").toString().trim();
        let title = vod["title"].trim().replace(/<em class="keyword">/g, "").replace(/<\/em>/g, "");
        let img = vod["pic"] ? vod["pic"].trim() : "";
        if (img.indexOf("//") === 0) img = "https:" + img;
        let remark = vod["duration"] || "";
        videos.push({
            vod_id: aid,
            vod_name: title,
            vod_pic: img,
            vod_remarks: remark
        });
    });
    return videos;
}

async function home(filter) {
    return JSON.stringify({
        "class": [
            //{"type_name": "全部象棋", "type_id": "象棋"},
            {"type_name": "板鸭象棋", "type_id": "板鸭象棋"},
            {"type_name": "四郎讲棋", "type_id": "四郎讲棋"},
            {"type_name": "小植象棋", "type_id": "小植象棋"}
        ],
        "filters": {
            "板鸭象棋": [
                {"key": "order", "name": "排序", "value": [
                    {"n": "综合排序", "v": "0"},
                    {"n": "最多点击", "v": "click"},
                    {"n": "最新发布", "v": "pubdate"},
                    {"n": "最多弹幕", "v": "dm"},
                    {"n": "最多收藏", "v": "stow"}
                ]},
                {"key": "duration", "name": "时长", "value": [
                    {"n": "全部", "v": "0"},
                    {"n": "60分钟以上", "v": "4"},
                    {"n": "30~60分钟", "v": "3"},
                    {"n": "10~30分钟", "v": "2"},
                    {"n": "10分钟以下", "v": "1"}
                ]}
            ],
            "四郎讲棋": [
                {"key": "order", "name": "排序", "value": [
                    {"n": "综合排序", "v": "0"},
                    {"n": "最多点击", "v": "click"},
                    {"n": "最新发布", "v": "pubdate"},
                    {"n": "最多弹幕", "v": "dm"},
                    {"n": "最多收藏", "v": "stow"}
                ]},
                {"key": "duration", "name": "时长", "value": [
                    {"n": "全部", "v": "0"},
                    {"n": "60分钟以上", "v": "4"},
                    {"n": "30~60分钟", "v": "3"},
                    {"n": "10~30分钟", "v": "2"},
                    {"n": "10分钟以下", "v": "1"}
                ]}
            ],
            "小植象棋": [
                {"key": "order", "name": "排序", "value": [
                    {"n": "综合排序", "v": "0"},
                    {"n": "最多点击", "v": "click"},
                    {"n": "最新发布", "v": "pubdate"},
                    {"n": "最多弹幕", "v": "dm"},
                    {"n": "最多收藏", "v": "stow"}
                ]},
                {"key": "duration", "name": "时长", "value": [
                    {"n": "全部", "v": "0"},
                    {"n": "60分钟以上", "v": "4"},
                    {"n": "30~60分钟", "v": "3"},
                    {"n": "10~30分钟", "v": "2"},
                    {"n": "10分钟以下", "v": "1"}
                ]}
            ]
        }
    });
}

async function homeVod() {
    let url = host + "/x/web-interface/search/type?keyword=" + encodeURIComponent("象棋") + "&search_type=video&page=1&order=click";
    let resp = await req(url, {headers: headers});
    let jo = JSON.parse(resp.content);
    return JSON.stringify({list: getVideos(jo)});
}

async function category(tid, pg, filter, extend) {
    let p = pg || 1;
    let order = (extend && extend.order) ? extend.order : "0";
    let duration = (extend && extend.duration) ? extend.duration : "0";
    let url = host + "/x/web-interface/search/type?keyword=" + encodeURIComponent(tid) + "&search_type=video&page=" + p + "&order=" + order + "&duration=" + duration;
    let resp = await req(url, {headers: headers});
    let jo = JSON.parse(resp.content);
    return JSON.stringify({
        "list": getVideos(jo),
        "page": parseInt(p)
    });
}

async function detail(id) {
    let url = host + "/x/web-interface/view?bvid=" + id;
    let resp = await req(url, {headers: headers});
    let jo = JSON.parse(resp.content);
    if (jo.code !== 0) {
        return JSON.stringify({list: []});
    }
    let data = jo.data;
    let stat = data.stat || {};
    let status = "播放: " + stat.view + "　弹幕: " + stat.danmaku + "　点赞: " + stat.like + "　投币: " + stat.coin;
    let pages = data.pages || [];
    let playurls = [];
    pages.forEach(pg => {
        let part = pg.part || ("P" + pg.page);
        playurls.push(part + "$" + pg.cid);
    });
    return JSON.stringify({
        list: [{
            vod_id: id,
            vod_name: data.title,
            vod_pic: data.pic,
            type_name: "象棋",
            vod_year: "",
            vod_area: "大陆",
            vod_remarks: data.owner ? data.owner.name : "",
            vod_actor: status,
            vod_director: "",
            vod_content: data.desc || "",
            vod_play_from: "B站",
            vod_play_url: playurls.join("#")
        }]
    });
}

async function search(wd, quick, pg) {
    let p = pg || 1;
    let url = host + "/x/web-interface/search/type?keyword=" + encodeURIComponent(wd) + "&search_type=video&page=" + p;
    let resp = await req(url, {headers: headers});
    let jo = JSON.parse(resp.content);
    return JSON.stringify({list: getVideos(jo)});
}

async function play(flag, id, flags) {
    let cid = id;
    if (!/^\d+$/.test(id)) {
        let url = host + "/x/web-interface/view?bvid=" + id;
        let resp = await req(url, {headers: headers});
        let jo = JSON.parse(resp.content);
        if (jo.code === 0 && jo.data) {
            cid = jo.data.pages && jo.data.pages.length > 0 ? jo.data.pages[0].cid : jo.data.cid;
        }
    }
    let url = host + "/x/player/playurl?bvid=" + id + "&cid=" + cid + "&qn=80&fnval=16";
    let resp = await req(url, {headers: headers});
    let jo = JSON.parse(resp.content);
    if (jo.code === 0 && jo.data) {
        if (jo.data.dash) {
            let videoList = jo.data.dash.video || [];
            let videoUrl = videoList.length > 0 ? (videoList[0].baseUrl || videoList[0].base_url) : "";
            return JSON.stringify({
                parse: 0,
                url: videoUrl,
                header: {"Referer": "https://www.bilibili.com", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
            });
        }
        if (jo.data.durl && jo.data.durl.length > 0) {
            return JSON.stringify({
                parse: 0,
                url: jo.data.durl[0].url,
                header: {"Referer": "https://www.bilibili.com", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
            });
        }
    }
    return JSON.stringify({parse: 1, url: "https://www.bilibili.com/video/" + id, header: {"User-Agent": "Mozilla/5.0"}});
}

export default {init, home, homeVod, category, detail, search, play};
