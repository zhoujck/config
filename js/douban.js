let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://movie.douban.com/"
};

async function init(cfg) {}

// 豆瓣网页接口请求
function doubanWebGet(path, params) {
    let query = [];
    for (let key in params) {
        if (params[key] !== "" && params[key] !== undefined && params[key] !== null) {
            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        }
    }
    let url = "https://movie.douban.com" + path;
    if (query.length > 0) url += "?" + query.join("&");
    let resp = req(url, { headers: headers });
    return JSON.parse(resp.content);
}

// 从标签页获取列表
function getSubjectByTag(tag, type, sort, page_start, page_limit) {
    let params = {
        type: type || "movie",
        tag: tag || "热门",
        sort: sort || "recommend",
        page_limit: page_limit || 20,
        page_start: page_start || 0
    };
    let res = doubanWebGet("/j/search_subjects", params);
    return res.subjects || [];
}

// 从网页获取详情（通过解析JSON-LD或页面数据）
function getDetailFromWeb(id) {
    try {
        let url = "https://movie.douban.com/subject/" + id + "/";
        let resp = req(url, { headers: headers });
        let html = resp.content || "";

        let result = { id: id, title: "", pic: "", rating: "", year: "", area: "", director: "", actors: "", summary: "" };

        // 提取标题
        let titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
        if (titleMatch) {
            let t = titleMatch[1].replace(/\s*(豆瓣|douban).*$/i, "").trim();
            result.title = t;
        }

        // 提取海报
        let imgMatch = html.match(/<img[^>+src="([^"]*img[^"]*poster[^"]*)"/i);
        if (!imgMatch) imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (imgMatch) result.pic = imgMatch[1];

        // 提取评分
        let ratingMatch = html.match(/property="v:average"[^>]*>([^<]+)</);
        if (ratingMatch) result.rating = ratingMatch[1].trim();

        // 提取年份
        let yearMatch = html.match(/<span class="year">\((\d{4})\)/);
        if (yearMatch) result.year = yearMatch[1];

        // 提取信息区域
        let infoMatch = html.match(/<div id="info"[^>]*>([\s\S]*?)<\/div>/);
        if (infoMatch) {
            let info = infoMatch[1];
            let dirMatch = info.match(/导演:\s*<a[^>]*>([^<]+)</);
            if (dirMatch) result.director = dirMatch[1].trim();
            let actorMatch = info.match(/主演:\s*([\s\S]*?)(?:<br|<\/div)/);
            if (actorMatch) {
                let actorHtml = actorMatch[1];
                let actorNames = [];
                let actorRe = /<a[^>]*>([^<]+)</g;
                let am;
                while ((am = actorRe.exec(actorHtml)) !== null) {
                    actorNames.push(am[1].trim());
                }
                result.actors = actorNames.join(" / ");
            }
            let areaMatch = info.match(/制片国家\/地区:\s*([^<\n]+)/);
            if (areaMatch) result.area = areaMatch[1].trim();
        }

        // 提取简介
        let summaryMatch = html.match(/<span property="v:summary"[^>]*>([\s\S]*?)<\/span>/);
        if (summaryMatch) {
            result.summary = summaryMatch[1].replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").trim();
        }

        return result;
    } catch (e) {
        return null;
    }
}

function parseWebItems(items) {
    let list = [];
    if (!items || !Array.isArray(items)) return list;
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let rating = item.rate || "暂无评分";
        list.push({
            vod_id: item.id || "",
            vod_name: item.title || "",
            vod_pic: item.cover || "",
            vod_remarks: rating
        });
    }
    return list;
}

async function home(filter) {
    let classes = [
        { type_id: "热门电影", type_name: "热门电影" },
        { type_id: "热门电视剧", type_name: "热门电视剧" },
        { type_id: "热门综艺", type_name: "热门综艺" },
        { type_id: "热门动漫", type_name: "热门动漫" },
        { type_id: "纪录片", type_name: "纪录片" },
        { type_id: "华语", type_name: "华语经典" },
        { type_id: "欧美", type_name: "欧美佳片" },
        { type_id: "韩国", type_name: "韩国精选" },
        { type_id: "日本", type_name: "日本精选" }
    ];

    let filters = {
        "热门电影": [
            { key: "sort", name: "排序", value: [{ n: "综合排序", v: "recommend" }, { n: "最新", v: "time" }, { n: "评分", v: "rank" }] }
        ],
        "热门电视剧": [
            { key: "sort", name: "排序", value: [{ n: "综合排序", v: "recommend" }, { n: "最新", v: "time" }, { n: "评分", v: "rank" }] }
        ],
        "热门综艺": [
            { key: "sort", name: "排序", value: [{ n: "综合排序", v: "recommend" }, { n: "最新", v: "time" }, { n: "评分", v: "rank" }] }
        ],
        "热门动漫": [
            { key: "sort", name: "排序", value: [{ n: "综合排序", v: "recommend" }, { n: "最新", v: "time" }, { n: "评分", v: "rank" }] }
        ],
        "纪录片": [
            { key: "sort", name: "排序", value: [{ n: "综合排序", v: "recommend" }, { n: "最新", v: "time" }, { n: "评分", v: "rank" }] }
        ]
    };

    return JSON.stringify({ class: classes, filters: filters });
}

async function homeVod() {
    try {
        let items = getSubjectByTag("热门", "movie", "recommend", 0, 30);
        return JSON.stringify({ list: parseWebItems(items) });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    try {
        let p = pg || 1;
        let count = 20;
        let ext = extend || {};
        let sort = ext.sort || "recommend";
        let page_start = (p - 1) * count;

        let type = "movie";
        let tag = tid;

        if (tid === "热门电影") { type = "movie"; tag = "热门"; }
        else if (tid === "热门电视剧") { type = "tv"; tag = "热门"; }
        else if (tid === "热门综艺") { type = "tv"; tag = "综艺"; }
        else if (tid === "热门动漫") { type = "movie"; tag = "动画"; }
        else if (tid === "纪录片") { type = "movie"; tag = "纪录片"; }
        else if (tid === "华语") { type = "movie"; tag = "华语"; }
        else if (tid === "欧美") { type = "movie"; tag = "欧美"; }
        else if (tid === "韩国") { type = "movie"; tag = "韩国"; }
        else if (tid === "日本") { type = "movie"; tag = "日本"; }

        let items = getSubjectByTag(tag, type, sort, page_start, count);

        return JSON.stringify({
            list: parseWebItems(items),
            page: p,
            pagecount: items.length < count ? p : p + 1,
            total: items.length < count ? page_start + items.length : page_start + items.length + 1
        });
    } catch (e) {
        return JSON.stringify({ list: [], page: pg || 1, pagecount: 0, total: 0 });
    }
}

async function detail(id) {
    try {
        let res = getDetailFromWeb(id);
        if (!res || !res.title) {
            return JSON.stringify({ list: [] });
        }

        let score = res.rating ? "评分: " + res.rating : "";

        return JSON.stringify({
            list: [{
                vod_id: id,
                vod_name: res.title,
                vod_pic: res.pic,
                type_name: res.area,
                vod_year: res.year,
                vod_area: res.area,
                vod_remarks: score,
                vod_actor: res.actors,
                vod_director: res.director,
                vod_content: res.summary,
                vod_play_from: "豆瓣",
                vod_play_url: "暂无播放源$无"
            }]
        });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function search(wd, quick, pg) {
    try {
        let count = 20;

        // 使用豆瓣搜索建议API
        let url = "https://movie.douban.com/j/subject_suggest?q=" + encodeURIComponent(wd);
        let resp = req(url, { headers: headers });
        let items = JSON.parse(resp.content);

        let list = [];
        if (items && Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (item.type !== "movie" && item.type !== "tv") continue;
                list.push({
                    vod_id: item.id || "",
                    vod_name: item.title || "",
                    vod_pic: item.img || "",
                    vod_remarks: item.year || ""
                });
            }
        }

        // 补充：用标签搜索
        if (list.length < 5) {
            try {
                let tagItems = getSubjectByTag(wd, "movie", "recommend", 0, count);
                let webList = parseWebItems(tagItems);
                let existIds = {};
                for (let i = 0; i < list.length; i++) existIds[list[i].vod_id] = true;
                for (let i = 0; i < webList.length; i++) {
                    if (!existIds[webList[i].vod_id]) {
                        list.push(webList[i]);
                    }
                }
            } catch (e) { }
        }

        return JSON.stringify({ list: list });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

export default { init, home, homeVod, category, detail, search };
