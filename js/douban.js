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

// rexxar 接口 - 支持多条件筛选
function rexGet(path, params) {
    let query = [];
    for (let key in params) {
        if (params[key] != null && params[key] !== "") {
            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        }
    }
    let url = "https://m.douban.com/rexxar/api/v2" + path + (query.length ? "?" + query.join("&") : "");
    let resp = req(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
            "Referer": "https://m.douban.com/",
            "Accept": "application/json"
        }
    });
    return JSON.parse(resp.content);
}

// rexxar 数据解析
function parseRexItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map(it => {
        let pic = it.pic ? (it.pic.large || it.pic.normal || "") : "";
        return {
            vod_id: it.id || "",
            vod_name: it.title || "",
            vod_pic: fixPic(pic),
            vod_remarks: it.episodes_info && it.episodes_info.trim() ? it.episodes_info.trim()
                : (it.rating && it.rating.value ? it.rating.value + "分" : "暂无评分")
        };
    });
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
            { type_id: "hot_tv", type_name: "热门电视" },
            { type_id: "show", type_name: "热门综艺" },
            { type_id: "documentary", type_name: "纪录片" },
            { type_id: "high_score", type_name: "豆瓣高分" }
        ],
        filters: {
            hot_movie: [
                { key: "类型", name: "类型", value: [
                    { n: "全部类型", v: "" }, { n: "喜剧", v: "喜剧" }, { n: "爱情", v: "爱情" }, { n: "动作", v: "动作" },
                    { n: "科幻", v: "科幻" }, { n: "动画", v: "动画" }, { n: "悬疑", v: "悬疑" }, { n: "犯罪", v: "犯罪" },
                    { n: "惊悚", v: "惊悚" }, { n: "冒险", v: "冒险" }, { n: "恐怖", v: "恐怖" }, { n: "战争", v: "战争" },
                    { n: "奇幻", v: "奇幻" }, { n: "历史", v: "历史" }, { n: "传记", v: "传记" }, { n: "纪录片", v: "纪录片" }
                ]},
                { key: "地区", name: "地区", value: [
                    { n: "全部地区", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" },
                    { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" }, { n: "美国", v: "美国" },
                    { n: "中国香港", v: "中国香港" }, { n: "中国台湾", v: "中国台湾" }, { n: "英国", v: "英国" },
                    { n: "法国", v: "法国" }, { n: "泰国", v: "泰国" }, { n: "印度", v: "印度" }
                ]},
                { key: "year", name: "年代", value: [
                    { n: "全部", v: "" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" },
                    { n: "2023", v: "2023" }, { n: "2022", v: "2022" }, { n: "2021", v: "2021" }, { n: "2020", v: "2020" },
                    { n: "2019", v: "2019" }, { n: "2010年代", v: "2010年代" }, { n: "2000年代", v: "2000年代" },
                    { n: "90年代", v: "90年代" }, { n: "80年代", v: "80年代" }, { n: "更早", v: "更早" }
                ]},
                { key: "sort", name: "排序", value: [{ n: "近期热度", v: "U" }, { n: "首映时间", v: "R" }, { n: "高分优先", v: "S" }] }
            ],
            hot_tv: [
                { key: "类型", name: "类型", value: [
                    { n: "全部", v: "" }, { n: "国产剧", v: "国产剧" }, { n: "美剧", v: "美剧" }, { n: "日剧", v: "日剧" },
                    { n: "韩剧", v: "韩剧" }, { n: "动画", v: "动画" }, { n: "古装", v: "古装" }, { n: "悬疑", v: "悬疑" },
                    { n: "爱情", v: "爱情" }, { n: "喜剧", v: "喜剧" }, { n: "犯罪", v: "犯罪" }, { n: "科幻", v: "科幻" }
                ]},
                { key: "地区", name: "地区", value: [
                    { n: "全部", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" },
                    { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" }, { n: "美国", v: "美国" },
                    { n: "中国香港", v: "中国香港" }, { n: "中国台湾", v: "中国台湾" }, { n: "英国", v: "英国" }
                ]},
                { key: "year", name: "年代", value: [
                    { n: "全部", v: "" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" },
                    { n: "2023", v: "2023" }, { n: "2022", v: "2022" }, { n: "2021", v: "2021" }, { n: "2020", v: "2020" },
                    { n: "2019", v: "2019" }, { n: "2010年代", v: "2010年代" }, { n: "2000年代", v: "2000年代" },
                    { n: "90年代", v: "90年代" }, { n: "80年代", v: "80年代" }, { n: "更早", v: "更早" }
                ]},
                { key: "platform", name: "平台", value: [
                    { n: "全部", v: "" }, { n: "腾讯视频", v: "腾讯视频" }, { n: "爱奇艺", v: "爱奇艺" },
                    { n: "优酷", v: "优酷" }, { n: "Netflix", v: "Netflix" }, { n: "HBO", v: "HBO" },
                    { n: "BBC", v: "BBC" }, { n: "NHK", v: "NHK" }, { n: "tvN", v: "tvN" }
                ]},
                { key: "sort", name: "排序", value: [{ n: "近期热度", v: "U" }, { n: "首播时间", v: "R" }, { n: "高分优先", v: "S" }] }
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
                { key: "type", name: "分类", value: [{ n: "综合", v: "综艺" }, { n: "国内", v: "国产综艺" }, { n: "国外", v: "国外综艺" }] },
                { key: "sort", name: "排序", value: [{ n: "近期热度", v: "recommend" }, { n: "首播时间", v: "time" }, { n: "高分优先", v: "rank" }] }
            ],
            high_score: [
                { key: "area", name: "地区", value: [{ n: "全部", v: "全部" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }] }
            ]
        }
    });
}

async function homeVod() {
    try {
        // 推荐：热门电影按时间排序 + 热播剧集
        let movie = getByTag("热门", "movie", "time", 0, 15);
        let tv = getByTag("热门", "tv", "recommend", 0, 15);
        return JSON.stringify({ list: parseItems([...movie, ...tv]) });
    } catch (e) { return JSON.stringify({ list: [] }); }
}

async function category(tid, pg, filter, extend) {
    try {
        let p = pg || 1, count = 20, ext = extend || {}, start = (p - 1) * count;
        let items = [], tag = "", type = "movie", sort = "recommend";

        if (tid === "hot_movie") {
            let genre = ext["类型"] || "";
            let region = ext["地区"] || "";
            let year = ext.year || "";
            sort = ext.sort || "U";
            // 用 rexxar 接口支持多条件筛选
            let selectedCategories = {};
            if (genre) selectedCategories["类型"] = genre;
            if (region) selectedCategories["地区"] = region;
            let tags = [genre, region, year].filter(Boolean).join(",");
            try {
                let data = rexGet("/movie/recommend", {
                    refresh: 0, start: start, count: count,
                    selected_categories: JSON.stringify(selectedCategories),
                    uncollect: false, score_range: "0,10",
                    tags: tags, sort: sort
                });
                items = parseRexItems(data.items || []);
                let total = data.total || data.count || items.length;
                return JSON.stringify({
                    list: items, page: p,
                    pagecount: Math.ceil(total / count),
                    total: total
                });
            } catch (e) {
                // fallback: 单标签
                tag = genre || region || year || "热门";
                let sortMap = { U: "recommend", R: "time", S: "rank" };
                items = getByTag(tag, "movie", sortMap[sort] || "recommend", start, count);
            }
        } else if (tid === "hot_tv") {
            let genre = ext["类型"] || "";
            let region = ext["地区"] || "";
            let year = ext.year || "";
            let platform = ext.platform || "";
            sort = ext.sort || "U";
            let selectedCategories = { "形式": "电视剧" };
            if (genre) selectedCategories["类型"] = genre;
            if (region) selectedCategories["地区"] = region;
            let tags = [genre, region, year, platform].filter(Boolean).join(",");
            try {
                let data = rexGet("/tv/recommend", {
                    refresh: 0, start: start, count: count,
                    selected_categories: JSON.stringify(selectedCategories),
                    uncollect: false, score_range: "0,10",
                    tags: tags, sort: sort
                });
                items = parseRexItems(data.items || []);
                let total = data.total || data.count || items.length;
                return JSON.stringify({
                    list: items, page: p,
                    pagecount: Math.ceil(total / count),
                    total: total
                });
            } catch (e) {
                tag = platform || genre || region || year || "热门";
                let sortMap = { U: "recommend", R: "time", S: "rank" };
                items = getByTag(tag, "tv", sortMap[sort] || "recommend", start, count);
            }
        } else if (tid === "show") {
            let categoryType = ext.type || "";
            let region = ext["地区"] || "";

            // 映射：国内/国外快捷分类 → 具体地区
            let regionTags = [];
            if (categoryType === "国产综艺") {
                regionTags = ["中国大陆"];
            } else if (categoryType === "国外综艺") {
                regionTags = ["欧美", "韩国", "日本", "中国港台"];
            } else if (region) {
                regionTags = [region];
            }

            if (regionTags.length > 0) {
                // 用 rexxar 接口按地区筛选综艺
                let allItems = [];
                let seenIds = new Set();
                for (let rt of regionTags) {
                    try {
                        let data = rexGet("/tv/recommend", {
                            refresh: 0, start: 0, count: count,
                            selected_categories: JSON.stringify({ "类型": "综艺", "地区": rt }),
                            uncollect: false, score_range: "0,10",
                            tags: "综艺," + rt, sort: "recommend"
                        });
                        let parsed = parseRexItems(data.items || []);
                        for (let it of parsed) {
                            if (!seenIds.has(it.vod_id)) {
                                allItems.push(it);
                                seenIds.add(it.vod_id);
                            }
                        }
                    } catch (e) { /* 单个地区失败不影响其他 */ }
                }
                // 分页截取
                let total = allItems.length;
                items = allItems.slice(start, start + count);
                return JSON.stringify({
                    list: items, page: p,
                    pagecount: Math.ceil(total / count),
                    total: total
                });
            } else {
                // 综合 - 直接用标签接口
                tag = "综艺";
                type = "tv";
                items = getByTag(tag, type, "recommend", start, count);
            }
        } else if (tid === "documentary") {
            tag = ext.genre || "纪录片";
            sort = ext.sort || "recommend";
            type = "movie";
            items = getByTag(tag, type, sort, start, count);
        } else if (tid === "high_score") {
            tag = (ext.area || "全部") === "全部" ? "豆瓣高分" : ext.area;
            sort = "rank";
            type = "movie";
            items = getByTag(tag, type, sort, start, count);
        } else {
            return JSON.stringify({ list: [], page: p, pagecount: 0, total: 0 });
        }

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
