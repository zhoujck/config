let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://movie.douban.com/"
};

async function init(cfg) {}

// ========== 底层请求 ==========

function webGet(path, params) {
    let query = [];
    for (let key in params) {
        if (params[key] != null && params[key] !== "") {
            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        }
    }
    let url = "https://movie.douban.com" + path + (query.length ? "?" + query.join("&") : "");
    return JSON.parse(req(url, { headers }).content);
}

function getByTag(tag, type, sort, start, count) {
    let res = webGet("/j/search_subjects", {
        type: type || "movie", tag: tag || "热门", sort: sort || "recommend",
        page_limit: count || 20, page_start: start || 0
    });
    return res.subjects || [];
}

function suggest(q) {
    return webGet("/j/subject_suggest", { q }) || [];
}

function fixPic(url) {
    return url ? url + "@Referer=https://movie.douban.com/" : "";
}

// 详情页
function getDetail(id) {
    try {
        let html = req("https://movie.douban.com/subject/" + id + "/", { headers }).content || "";
        let r = { id, title: "", pic: "", rating: "", year: "", area: "", director: "", actors: "", summary: "" };
        let m;

        if ((m = html.match(/<title[^>]*>([^<]+)<\/title>/))) r.title = m[1].replace(/\s*(豆瓣|douban).*$/i, "").trim();
        if ((m = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i))) r.pic = m[1];
        if ((m = html.match(/property="v:average"[^>]*>([^<]+)</))) r.rating = m[1].trim();
        if ((m = html.match(/<span class="year">\((\d{4})\)/))) r.year = m[1];

        let infoMatch = html.match(/<div id="info"[^>]*>([\s\S]*?)<\/div>/);
        if (infoMatch) {
            let info = infoMatch[1];
            let d = info.match(/导演:\s*<a[^>]*>([^<]+)</);
            if (d) r.director = d[1].trim();
            let a = info.match(/主演:\s*([\s\S]*?)(?:<br|<\/div)/);
            if (a) {
                let names = [], re = /<a[^>]*>([^<]+)</g, am;
                while ((am = re.exec(a[1])) !== null) names.push(am[1].trim());
                r.actors = names.join(" / ");
            }
            let ar = info.match(/制片国家\/地区:\s*([^<\n]+)/);
            if (ar) r.area = ar[1].trim();
        }

        if ((m = html.match(/<span property="v:summary"[^>]*>([\s\S]*?)<\/span>/)))
            r.summary = m[1].replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").trim();

        return r;
    } catch (e) { return null; }
}

// ========== 数据转换 ==========

function parseItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map(it => ({
        vod_id: it.id || "",
        vod_name: it.title || "",
        vod_pic: fixPic(it.cover),
        vod_remarks: it.rate || "暂无评分"
    }));
}

// ========== TVBox 接口 ==========

async function home(filter) {
    return JSON.stringify({
        class: [
            { type_id: "hot_movie", type_name: "热门电影" },
            { type_id: "new_movie", type_name: "最新电影" },
            { type_id: "high_score", type_name: "豆瓣高分" },
            { type_id: "classic", type_name: "冷门佳片" },
            { type_id: "tv_hot", type_name: "热播剧集" },
            { type_id: "tv_domestic", type_name: "国产剧" },
            { type_id: "tv_american", type_name: "美剧" },
            { type_id: "tv_japanese", type_name: "日剧" },
            { type_id: "tv_korean", type_name: "韩剧" },
            { type_id: "tv_animation", type_name: "动漫" },
            { type_id: "show", type_name: "综艺" },
            { type_id: "documentary", type_name: "纪录片" }
        ],
        filters: {
            hot_movie: [
                { key: "sort", name: "排序", value: [{ n: "热度", v: "recommend" }, { n: "最新", v: "time" }, { n: "评分", v: "rank" }] },
                { key: "area", name: "地区", value: [{ n: "全部", v: "全部" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }] }
            ],
            new_movie: [
                { key: "area", name: "地区", value: [{ n: "全部", v: "全部" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }] }
            ],
            high_score: [
                { key: "area", name: "地区", value: [{ n: "全部", v: "全部" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }] }
            ],
            classic: [
                { key: "area", name: "地区", value: [{ n: "全部", v: "全部" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }] }
            ],
            tv_hot: [
                { key: "type", name: "分类", value: [{ n: "综合", v: "热门" }, { n: "国产剧", v: "国产剧" }, { n: "欧美剧", v: "美剧" }, { n: "日剧", v: "日剧" }, { n: "韩剧", v: "韩剧" }, { n: "动画", v: "动画" }] }
            ],
            documentary: [
                { key: "genre", name: "类型", value: [
                    { n: "全部", v: "纪录片" }, { n: "自然", v: "自然" }, { n: "历史", v: "历史" },
                    { n: "人文", v: "人文" }, { n: "科技", v: "科技" }, { n: "美食", v: "美食" },
                    { n: "旅行", v: "旅行" }, { n: "社会", v: "社会" }, { n: "战争", v: "战争" },
                    { n: "宇宙", v: "宇宙" }, { n: "动物", v: "动物" }, { n: "音乐", v: "音乐" }, { n: "传记", v: "传记" }
                ]},
                { key: "sort", name: "排序", value: [{ n: "近期热度", v: "recommend" }, { n: "首播时间", v: "time" }, { n: "高分优先", v: "rank" }] }
            ],
            show: [
                { key: "type", name: "分类", value: [{ n: "综合", v: "综艺" }, { n: "国内", v: "国产综艺" }, { n: "国外", v: "国外综艺" }] }
            ]
        }
    });
}

async function homeVod() {
    try {
        // 推荐页：混合取不同标签，和热门电影区分
        let movie = getByTag("最新", "movie", "time", 0, 10);
        let tv = getByTag("热门", "tv", "recommend", 0, 10);
        let show = getByTag("综艺", "tv", "recommend", 0, 10);
        return JSON.stringify({ list: parseItems([...movie, ...tv, ...show]) });
    } catch (e) { return JSON.stringify({ list: [] }); }
}

async function category(tid, pg, filter, extend) {
    try {
        let p = pg || 1, count = 20, ext = extend || {}, start = (p - 1) * count;
        let items = [], tag = "", type = "movie", sort = "recommend";

        if (tid === "hot_movie") {
            tag = (ext.area || "全部") === "全部" ? "热门" : ext.area;
            sort = ext.sort || "recommend";
            type = "movie";
        } else if (tid === "new_movie") {
            tag = (ext.area || "全部") === "全部" ? "最新" : ext.area;
            sort = "time";
            type = "movie";
        } else if (tid === "high_score") {
            tag = (ext.area || "全部") === "全部" ? "豆瓣高分" : ext.area;
            sort = "rank";
            type = "movie";
        } else if (tid === "classic") {
            tag = (ext.area || "全部") === "全部" ? "冷门佳片" : ext.area;
            sort = "rank";
            type = "movie";
        } else if (tid === "tv_hot") {
            tag = ext.type || "热门";
            type = "tv";
        } else if (tid === "tv_domestic") {
            tag = "国产剧"; type = "tv";
        } else if (tid === "tv_american") {
            tag = "美剧"; type = "tv";
        } else if (tid === "tv_japanese") {
            tag = "日剧"; type = "tv";
        } else if (tid === "tv_korean") {
            tag = "韩剧"; type = "tv";
        } else if (tid === "tv_animation") {
            tag = "动画"; type = "tv";
        } else if (tid === "show") {
            tag = ext.type || "综艺";
            type = "tv";
        } else if (tid === "documentary") {
            tag = ext.genre || "纪录片";
            sort = ext.sort || "recommend";
            type = "movie";
        } else {
            return JSON.stringify({ list: [], page: p, pagecount: 0, total: 0 });
        }

        items = getByTag(tag, type, sort, start, count);
        return JSON.stringify({
            list: parseItems(items), page: p,
            pagecount: items.length < count ? p : p + 1,
            total: items.length < count ? start + items.length : start + items.length + 1
        });
    } catch (e) { return JSON.stringify({ list: [], page: pg || 1, pagecount: 0, total: 0 }); }
}

async function detail(id) {
    try {
        let r = getDetail(id);
        if (!r || !r.title) return JSON.stringify({ list: [] });
        return JSON.stringify({ list: [{
            vod_id: id, vod_name: r.title, vod_pic: fixPic(r.pic), type_name: r.area,
            vod_year: r.year, vod_area: r.area, vod_remarks: r.rating ? "评分: " + r.rating : "",
            vod_actor: r.actors, vod_director: r.director, vod_content: r.summary,
            vod_play_from: "豆瓣", vod_play_url: "暂无播放源$无"
        }]});
    } catch (e) { return JSON.stringify({ list: [] }); }
}

async function search(wd, quick, pg) {
    try {
        let items = suggest(wd), list = [];
        if (Array.isArray(items)) {
            for (let it of items) {
                if (it.type !== "movie" && it.type !== "tv") continue;
                list.push({ vod_id: it.id || "", vod_name: it.title || "", vod_pic: fixPic(it.img), vod_remarks: it.year || "" });
            }
        }
        if (list.length < 5) {
            try {
                let webList = parseItems(getByTag(wd, "movie", "recommend", 0, 20));
                let existIds = new Set(list.map(i => i.vod_id));
                for (let it of webList) { if (!existIds.has(it.vod_id)) list.push(it); }
            } catch (e) { }
        }
        return JSON.stringify({ list });
    } catch (e) { return JSON.stringify({ list: [] }); }
}

export default { init, home, homeVod, category, detail, search };
