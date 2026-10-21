// 豆瓣导览：分类、筛选、列表（海报、更新集数、评分）。
// 不拉详情、不提供播放和搜索，播放走其他源。

let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://movie.douban.com/"
};

let mobileHeaders = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    "Referer": "https://m.douban.com/",
    "Accept": "application/json"
};

let SORT_MAP = { U: "recommend", R: "time", S: "rank" };

async function init(cfg) {}

function buildQuery(params) {
    let query = [];
    if (!params) return "";
    for (let key in params) {
        if (params[key] != null && params[key] !== "") {
            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        }
    }
    return query.length ? "?" + query.join("&") : "";
}

function readJson(url, reqHeaders) {
    let resp = req(url, { headers: reqHeaders });
    let content = resp && resp.content ? String(resp.content).trim() : "";
    if (!content || (content.charAt(0) !== "{" && content.charAt(0) !== "[")) {
        throw new Error("not json");
    }
    return JSON.parse(content);
}

function webGet(path, params) {
    return readJson("https://movie.douban.com" + path + buildQuery(params), headers);
}

function rexGet(path, params) {
    return readJson("https://m.douban.com/rexxar/api/v2" + path + buildQuery(params), mobileHeaders);
}

function getByTag(tag, type, sort, start, count) {
    let res = webGet("/j/search_subjects", {
        type: type || "movie",
        tag: tag || "热门",
        sort: sort || "recommend",
        page_limit: count || 20,
        page_start: start || 0
    });
    return res.subjects || [];
}

function rexRecommend(kind, selected, tags, sort, start, count, scoreRange) {
    return rexGet("/" + kind + "/recommend", {
        refresh: 0,
        start: start,
        count: count,
        selected_categories: JSON.stringify(selected || {}),
        uncollect: false,
        score_range: scoreRange || "0,10",
        tags: tags || "",
        sort: sort || "U"
    });
}

function fixPic(url) {
    return url ? url + "@Referer=https://movie.douban.com/" : "";
}

function ratingText(it) {
    let raw = "";
    if (it.rating && it.rating.value) raw = it.rating.value;
    else if (it.rate) raw = it.rate;
    let rate = parseFloat(raw);
    if (!(rate > 0) || rate > 10) return "";
    return (Math.round(rate * 10) / 10) + "分";
}

function remarksOf(it) {
    let parts = [];
    let epi = String(it.episodes_info || "").trim();
    if (epi) parts.push(epi);
    let rate = ratingText(it);
    if (rate) parts.push(rate);
    return parts.join(" ") || "暂无评分";
}

function picOf(it) {
    if (it.pic && typeof it.pic === "object") return it.pic.large || it.pic.normal || "";
    if (typeof it.pic === "string") return it.pic;
    if (typeof it.cover === "string") return it.cover;
    return "";
}

function toList(items) {
    if (!Array.isArray(items)) return [];
    let list = [];
    for (let it of items) {
        if (!it || !it.id || !it.title) continue;
        list.push({
            vod_id: String(it.id),
            vod_name: it.title,
            vod_pic: fixPic(picOf(it)),
            vod_year: it.year ? String(it.year) : "",
            vod_remarks: remarksOf(it)
        });
    }
    return list;
}

function hasFilter(ext, keys) {
    for (let k of keys) {
        if (ext[k]) return true;
    }
    return false;
}

function normalizeExt(extend) {
    if (!extend) return {};
    if (typeof extend === "string") {
        try { return JSON.parse(extend) || {}; } catch (e) { return {}; }
    }
    return extend;
}

function pack(list, page, count, total) {
    let totalNum = Number(total);
    let known = !isNaN(totalNum) && totalNum > 0;
    let pagecount, sum;
    if (known) {
        pagecount = Math.ceil(totalNum / count);
        sum = totalNum;
    } else if (!list.length && page === 1) {
        pagecount = 0;
        sum = 0;
    } else if (list.length < count) {
        pagecount = page;
        sum = (page - 1) * count + list.length;
    } else {
        pagecount = page + 1;
        sum = page * count + 1;
    }
    return JSON.stringify({ list: list, page: page, pagecount: pagecount, total: sum });
}

function emptyPage(pg) {
    return JSON.stringify({ list: [], page: parseInt(pg, 10) || 1, pagecount: 0, total: 0 });
}

function loadRecent(path, params, page, count) {
    let data = rexGet(path, params);
    return pack(toList(data.items || []), page, count, data.total);
}

function loadRecommend(kind, selected, tags, sort, page, start, count, scoreRange, fallbackTag, fallbackType) {
    try {
        let data = rexRecommend(kind, selected, tags, sort, start, count, scoreRange);
        return pack(toList(data.items || []), page, count, data.total);
    } catch (e) {
        let items = toList(getByTag(fallbackTag, fallbackType, SORT_MAP[sort] || "recommend", start, count));
        return pack(items, page, count);
    }
}

let YEAR_VALUES = [
    { n: "全部", v: "" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" },
    { n: "2023", v: "2023" }, { n: "2022", v: "2022" }, { n: "2021", v: "2021" }, { n: "2020", v: "2020" },
    { n: "2019", v: "2019" }, { n: "2020年代", v: "2020年代" }, { n: "2010年代", v: "2010年代" },
    { n: "2000年代", v: "2000年代" }, { n: "90年代", v: "90年代" }, { n: "80年代", v: "80年代" },
    { n: "70年代", v: "70年代" }, { n: "60年代", v: "60年代" }, { n: "更早", v: "更早" }
];

let SORT_HOT = [{ n: "近期热度", v: "U" }, { n: "首映时间", v: "R" }, { n: "高分优先", v: "S" }];
let SORT_TV = [{ n: "近期热度", v: "U" }, { n: "首播时间", v: "R" }, { n: "高分优先", v: "S" }];
let SORT_DOC = [{ n: "高分优先", v: "S" }, { n: "近期热度", v: "U" }, { n: "首播时间", v: "R" }];

async function home(filter) {
    return JSON.stringify({
        class: [
            { type_id: "tv", type_name: "电视剧" },
            { type_id: "movie", type_name: "电影" },
            { type_id: "documentary", type_name: "纪录片" },
            { type_id: "show", type_name: "综艺" },
            { type_id: "high_score", type_name: "豆瓣高分" }
        ],
        filters: {
            movie: [
                { key: "genre", name: "类型", value: [
                    { n: "全部", v: "" }, { n: "喜剧", v: "喜剧" }, { n: "爱情", v: "爱情" }, { n: "动作", v: "动作" },
                    { n: "科幻", v: "科幻" }, { n: "动画", v: "动画" }, { n: "悬疑", v: "悬疑" }, { n: "犯罪", v: "犯罪" },
                    { n: "惊悚", v: "惊悚" }, { n: "冒险", v: "冒险" }, { n: "恐怖", v: "恐怖" }, { n: "战争", v: "战争" },
                    { n: "奇幻", v: "奇幻" }, { n: "历史", v: "历史" }, { n: "传记", v: "传记" }, { n: "纪录片", v: "纪录片" },
                    { n: "音乐", v: "音乐" }, { n: "歌舞", v: "歌舞" }, { n: "武侠", v: "武侠" }, { n: "情色", v: "情色" },
                    { n: "灾难", v: "灾难" }, { n: "西部", v: "西部" }, { n: "短片", v: "短片" }
                ]},
                { key: "region", name: "地区", value: [
                    { n: "全部", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" },
                    { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" }, { n: "美国", v: "美国" },
                    { n: "中国香港", v: "中国香港" }, { n: "中国台湾", v: "中国台湾" }, { n: "英国", v: "英国" },
                    { n: "法国", v: "法国" }, { n: "德国", v: "德国" }, { n: "意大利", v: "意大利" },
                    { n: "西班牙", v: "西班牙" }, { n: "印度", v: "印度" }, { n: "泰国", v: "泰国" },
                    { n: "俄罗斯", v: "俄罗斯" }, { n: "加拿大", v: "加拿大" }, { n: "澳大利亚", v: "澳大利亚" },
                    { n: "爱尔兰", v: "爱尔兰" }, { n: "瑞典", v: "瑞典" }, { n: "巴西", v: "巴西" }, { n: "丹麦", v: "丹麦" }
                ]},
                { key: "year", name: "年代", value: YEAR_VALUES },
                { key: "sort", name: "排序", value: SORT_HOT }
            ],
            tv: [
                { key: "genre", name: "类型", value: [
                    { n: "全部", v: "" }, { n: "喜剧", v: "喜剧" }, { n: "爱情", v: "爱情" }, { n: "悬疑", v: "悬疑" },
                    { n: "动画", v: "动画" }, { n: "武侠", v: "武侠" }, { n: "古装", v: "古装" }, { n: "家庭", v: "家庭" },
                    { n: "犯罪", v: "犯罪" }, { n: "科幻", v: "科幻" }, { n: "恐怖", v: "恐怖" }, { n: "历史", v: "历史" },
                    { n: "战争", v: "战争" }, { n: "动作", v: "动作" }, { n: "冒险", v: "冒险" }, { n: "传记", v: "传记" },
                    { n: "剧情", v: "剧情" }, { n: "奇幻", v: "奇幻" }, { n: "惊悚", v: "惊悚" }, { n: "灾难", v: "灾难" },
                    { n: "歌舞", v: "歌舞" }, { n: "音乐", v: "音乐" }
                ]},
                { key: "region", name: "地区", value: [
                    { n: "全部", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "国外", v: "国外" },
                    { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" },
                    { n: "中国香港", v: "中国香港" }, { n: "中国台湾", v: "中国台湾" }, { n: "美国", v: "美国" },
                    { n: "英国", v: "英国" }, { n: "法国", v: "法国" }, { n: "德国", v: "德国" },
                    { n: "意大利", v: "意大利" }, { n: "西班牙", v: "西班牙" }, { n: "泰国", v: "泰国" },
                    { n: "俄罗斯", v: "俄罗斯" }, { n: "瑞典", v: "瑞典" }, { n: "巴西", v: "巴西" },
                    { n: "丹麦", v: "丹麦" }, { n: "印度", v: "印度" }, { n: "加拿大", v: "加拿大" },
                    { n: "爱尔兰", v: "爱尔兰" }, { n: "澳大利亚", v: "澳大利亚" }
                ]},
                { key: "year", name: "年代", value: YEAR_VALUES },
                { key: "platform", name: "平台", value: [
                    { n: "全部", v: "" }, { n: "腾讯视频", v: "腾讯视频" }, { n: "爱奇艺", v: "爱奇艺" },
                    { n: "优酷", v: "优酷" }, { n: "湖南卫视", v: "湖南卫视" }, { n: "Netflix", v: "Netflix" },
                    { n: "HBO", v: "HBO" }, { n: "BBC", v: "BBC" }, { n: "NHK", v: "NHK" },
                    { n: "CBS", v: "CBS" }, { n: "NBC", v: "NBC" }, { n: "tvN", v: "tvN" }
                ]},
                { key: "sort", name: "排序", value: SORT_TV }
            ],
            documentary: [
                { key: "genre", name: "类型", value: [
                    { n: "全部", v: "" }, { n: "自然", v: "自然" }, { n: "历史", v: "历史" },
                    { n: "人文", v: "人文" }, { n: "科技", v: "科技" }, { n: "美食", v: "美食" },
                    { n: "旅行", v: "旅行" }, { n: "社会", v: "社会" }, { n: "战争", v: "战争" },
                    { n: "宇宙", v: "宇宙" }, { n: "动物", v: "动物" }, { n: "音乐", v: "音乐" }, { n: "传记", v: "传记" }
                ]},
                { key: "sort", name: "排序", value: SORT_DOC }
            ],
            show: [
                { key: "type", name: "类型", value: [
                    { n: "全部", v: "show" }, { n: "国内", v: "show_domestic" }, { n: "国外", v: "show_foreign" }
                ]}
            ],
            high_score: [
                { key: "area", name: "地区", value: [
                    { n: "全部", v: "全部" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" },
                    { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }
                ]}
            ]
        }
    });
}

async function homeVod() {
    let list = [];
    try {
        let tv = rexGet("/subject/recent_hot/tv", {
            start: 0, limit: 18, category: "tv", type: "tv"
        });
        list = list.concat(toList(tv.items || []));
    } catch (e) {}
    try {
        let movie = rexGet("/subject/recent_hot/movie", {
            start: 0, limit: 12, category: "热门", type: "全部"
        });
        list = list.concat(toList(movie.items || []));
    } catch (e) {}
    return JSON.stringify({ list: list });
}

function listMovieOrTv(kind, ext, page, start, count) {
    let genre = ext.genre || "";
    let region = ext.region || "";
    let year = ext.year || "";
    let platform = kind === "tv" ? (ext.platform || "") : "";
    let sort = ext.sort || "U";
    let keys = kind === "tv" ? ["genre", "region", "year", "platform"] : ["genre", "region", "year"];
    let fallbackType = kind === "movie" ? "movie" : "tv";

    if (!hasFilter(ext, keys) && sort === "U") {
        try {
            if (kind === "movie") {
                return loadRecent("/subject/recent_hot/movie", {
                    start: start, limit: count, category: "热门", type: "全部"
                }, page, count);
            }
            return loadRecent("/subject/recent_hot/tv", {
                start: start, limit: count, category: "tv", type: "tv"
            }, page, count);
        } catch (e) {
            return pack(toList(getByTag("热门", fallbackType, "recommend", start, count)), page, count);
        }
    }

    let selected = {};
    if (kind === "tv") selected["形式"] = "电视剧";
    if (genre) selected["类型"] = genre;
    if (region) selected["地区"] = region;
    if (year) selected["年代"] = year;
    if (platform) selected["平台"] = platform;
    let tags = [genre, region, year, platform].filter(Boolean).join(",");
    let fallbackTag = platform || genre || region || year || "热门";
    return loadRecommend(kind, selected, tags, sort, page, start, count, "0,10", fallbackTag, fallbackType);
}

async function category(tid, pg, filter, extend) {
    try {
        let page = parseInt(pg, 10) || 1;
        let count = 20;
        let ext = normalizeExt(extend);
        let start = (page - 1) * count;

        if (tid === "movie" || tid === "tv") {
            return listMovieOrTv(tid, ext, page, start, count);
        }

        if (tid === "show") {
            try {
                return loadRecent("/subject/recent_hot/tv", {
                    start: start, limit: count, category: "show", type: ext.type || "show"
                }, page, count);
            } catch (e) {
                return pack(toList(getByTag("综艺", "tv", "recommend", start, count)), page, count);
            }
        }

        if (tid === "documentary") {
            let genre = ext.genre || "";
            let sort = ext.sort || "S";
            let selected = { "形式": "纪录片" };
            if (genre) selected["类型"] = genre;
            let tags = ["纪录片", genre].filter(Boolean).join(",");
            return loadRecommend("tv", selected, tags, sort, page, start, count, "0,10", "纪录片", "tv");
        }

        if (tid === "high_score") {
            let area = (ext.area || "全部") === "全部" ? "" : ext.area;
            let selected = {};
            if (area) selected["地区"] = area;
            return loadRecommend("movie", selected, area || "豆瓣高分", "S", page, start, count, "8,10", area || "豆瓣高分", "movie");
        }

        return emptyPage(page);
    } catch (e) {
        return emptyPage(pg);
    }
}

async function detail() {
    return JSON.stringify({ list: [] });
}

async function search() {
    return JSON.stringify({ list: [] });
}

export default { init, home, homeVod, category, detail, search };
