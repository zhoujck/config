

async function init(cfg) {}

// ========== 底层请求 ==========

// 豆瓣网页接口 (搜索建议等)
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

// 豆瓣移动端 rexxar 接口 (推荐/筛选/榜单)
function rexGet(path, params) {
    let query = [];
    for (let key in params) {
        if (params[key] != null && params[key] !== "") {
            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        }
    }
    let url = "https://m.douban.com/rexxar/api/v2" + path + (query.length ? "?" + query.join("&") : "");
    let resp = req(url, { headers: { ...headers, Referer: "https://m.douban.com/" } });
    return JSON.parse(resp.content);
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

// 网页接口 (search_subjects) 的 items
function parseWebItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map(it => ({
        vod_id: it.id || "",
        vod_name: it.title || "",
        vod_pic: fixPic(it.cover),
        vod_remarks: it.rate || "暂无评分"
    }));
}

// rexxar 接口的 items
function parseRexItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map(it => {
        let year = "";
        let sub = it.card_subtitle || "";
        let ym = sub.match(/^(\d{4})/);
        if (ym) year = ym[1];

        let remarks = "";
        if (it.episodes_info && it.episodes_info.trim()) remarks = it.episodes_info.trim();
        else if (it.is_new) remarks = "新";

        let pic = it.pic ? (it.pic.large || it.pic.normal || "") : "";

        return {
            vod_id: it.id || "",
            vod_name: it.title || "",
            vod_pic: fixPic(pic),
            vod_remarks: remarks || (it.rating && it.rating.value ? it.rating.value + "分" : "暂无评分"),
            vod_year: year
        };
    });
}

// ========== 筛选器定义 ==========

const SORT = [{ n: "近期热度", v: "U" }, { n: "首播时间", v: "R" }, { n: "高分优先", v: "S" }];
const REGION_TV = [
    { n: "全部地区", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "国外", v: "国外" },
    { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" },
    { n: "中国香港", v: "中国香港" }, { n: "美国", v: "美国" }, { n: "英国", v: "英国" },
    { n: "泰国", v: "泰国" }, { n: "中国台湾", v: "中国台湾" }
];
const PLATFORM = [
    { n: "全部", v: "" }, { n: "腾讯视频", v: "腾讯视频" }, { n: "爱奇艺", v: "爱奇艺" },
    { n: "优酷", v: "优酷" }, { n: "Netflix", v: "Netflix" }, { n: "HBO", v: "HBO" }, { n: "BBC", v: "BBC" }
];
const YEARS = ["全部", "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019",
    "2020年代", "2010年代", "2000年代", "90年代", "80年代", "70年代", "60年代", "更早"]
    .map(n => ({ n, v: n === "全部" ? "" : n }));

const MOVIE_GENRES = ["全部类型", "喜剧", "爱情", "动作", "科幻", "动画", "悬疑", "犯罪", "惊悚",
    "冒险", "音乐", "历史", "奇幻", "恐怖", "战争", "传记", "歌舞", "武侠", "纪录片", "短片"]
    .map(n => ({ n, v: n === "全部类型" ? "" : n }));

const MOVIE_REGIONS = [
    { n: "全部地区", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" },
    { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" }, { n: "美国", v: "美国" },
    { n: "中国香港", v: "中国香港" }, { n: "中国台湾", v: "中国台湾" }, { n: "英国", v: "英国" },
    { n: "法国", v: "法国" }, { n: "德国", v: "德国" }, { n: "泰国", v: "泰国" }, { n: "印度", v: "印度" }
];

const TV_GENRES = ["不限", "喜剧", "爱情", "悬疑", "动画", "武侠", "古装", "家庭", "犯罪",
    "科幻", "恐怖", "历史", "战争", "动作", "冒险", "传记", "剧情", "奇幻", "惊悚", "灾难", "歌舞", "音乐"]
    .map(n => ({ n, v: n === "不限" ? "" : n }));

const DOC_GENRES = ["全部", "自然", "历史", "人文", "科技", "美食", "旅行", "社会", "战争", "宇宙", "动物", "音乐", "传记"]
    .map(n => ({ n, v: n === "全部" ? "" : n }));
const DOC_REGIONS = ["全部", "中国大陆", "美国", "英国", "日本", "法国", "德国"]
    .map(n => ({ n, v: n === "全部" ? "" : n }));

// ========== TVBox 接口 ==========

async function home(filter) {
    return JSON.stringify({
        class: [
            { type_id: "movie", type_name: "选电影" },
            { type_id: "tv", type_name: "选剧集" },
            { type_id: "show", type_name: "选综艺" },
            { type_id: "movie_filter", type_name: "电影筛选" },
            { type_id: "tv_filter", type_name: "电视剧筛选" },
            { type_id: "show_filter", type_name: "综艺筛选" }
        ],
        filters: {
            movie: [
                { key: "category", name: "类型", init: "热门", value: [{ n: "热门", v: "热门" }, { n: "最新", v: "最新" }, { n: "豆瓣高分", v: "豆瓣高分" }, { n: "冷门佳片", v: "冷门佳片" }] },
                { key: "type", name: "地区", init: "全部", value: [{ n: "全部", v: "全部" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }] }
            ],
            tv: [
                { key: "type", name: "类型", init: "tv", value: [{ n: "综合", v: "tv" }, { n: "国产剧", v: "tv_domestic" }, { n: "欧美剧", v: "tv_american" }, { n: "日剧", v: "tv_japanese" }, { n: "韩剧", v: "tv_korean" }, { n: "动漫", v: "tv_animation" }, { n: "纪录片", v: "tv_documentary" }] }
            ],
            show: [
                { key: "type", name: "类型", init: "show", value: [{ n: "综合", v: "show" }, { n: "国内", v: "show_domestic" }, { n: "国外", v: "show_foreign" }] }
            ],
            movie_filter: [
                { key: "genre", name: "类型", value: MOVIE_GENRES },
                { key: "region", name: "地区", value: MOVIE_REGIONS },
                { key: "year", name: "年代", value: YEARS },
                { key: "sort", name: "排序", value: SORT }
            ],
            tv_filter: [
                { key: "genre", name: "类型", value: TV_GENRES },
                { key: "region", name: "地区", value: REGION_TV },
                { key: "year", name: "年代", value: YEARS },
                { key: "platform", name: "平台", value: PLATFORM },
                { key: "sort", name: "排序", value: SORT }
            ],
            show_filter: [
                { key: "genre", name: "类型", value: [{ n: "全部", v: "" }, { n: "真人秀", v: "真人秀" }, { n: "脱口秀", v: "脱口秀" }, { n: "音乐", v: "音乐" }, { n: "歌舞", v: "歌舞" }] },
                { key: "region", name: "地区", value: REGION_TV },
                { key: "year", name: "年代", value: YEARS },
                { key: "platform", name: "平台", value: PLATFORM },
                { key: "sort", name: "排序", value: SORT }
            ]
        }
    });
}

async function homeVod() {
    try {
        // 用 rexxar 接口获取热播剧集，和选电影区分
        let data = rexGet("/subject/recent_hot/tv", { start: 0, limit: 30, category: "tv", type: "tv" });
        return JSON.stringify({ list: parseRexItems(data.items || []) });
    } catch (e) {
        try {
            return JSON.stringify({ list: parseRexItems(rexGet("/subject/recent_hot/movie", { start: 0, limit: 30, category: "movie", type: "movie" }).items || []) });
        } catch (e2) { return JSON.stringify({ list: [] }); }
    }
}

async function category(tid, pg, filter, extend) {
    try {
        let p = pg || 1, count = 20, ext = extend || {}, start = (p - 1) * count;
        let url = "", referer = "";

        if (tid === "movie") {
            // 选电影: recent_hot/movie 接口，支持 category + type 筛选
            let category = ext.category || "热门";
            let type = ext.type || "全部";
            url = `/subject/recent_hot/movie?start=${start}&limit=${count}&category=${encodeURIComponent(category)}&type=${encodeURIComponent(type)}`;
            referer = "https://movie.douban.com/explore";
        } else if (tid === "tv") {
            // 选剧集
            let type = ext.type || "tv";
            url = `/subject/recent_hot/tv?start=${start}&limit=${count}&category=tv&type=${encodeURIComponent(type)}`;
            referer = "https://movie.douban.com/tv/";
        } else if (tid === "show") {
            // 选综艺
            let type = ext.type || "show";
            url = `/subject/recent_hot/tv?start=${start}&limit=${count}&category=show&type=${encodeURIComponent(type)}`;
            referer = "https://movie.douban.com/tv/";
        } else if (tid === "movie_filter") {
            // 电影筛选: movie/recommend 接口，支持类型+地区+年代+排序
            let genre = ext.genre || "";
            let region = ext.region || "";
            let year = ext.year || "";
            let sort = ext.sort || "U";
            let selectedCategories = {};
            if (genre) selectedCategories["类型"] = genre;
            if (region) selectedCategories["地区"] = region;
            let tags = [genre, region, year].filter(Boolean).join(",");
            url = `/movie/recommend?refresh=0&start=${start}&count=${count}&selected_categories=${encodeURIComponent(JSON.stringify(selectedCategories))}&uncollect=false&score_range=0,10&tags=${encodeURIComponent(tags)}&sort=${sort}`;
            referer = "https://movie.douban.com/explore";
        } else if (tid === "tv_filter") {
            // 电视剧筛选: tv/recommend 接口
            let genre = ext.genre || "";
            let region = ext.region || "";
            let year = ext.year || "";
            let platform = ext.platform || "";
            let sort = ext.sort || "U";
            let selectedCategories = { "形式": "电视剧" };
            if (genre) selectedCategories["类型"] = genre;
            if (region) selectedCategories["地区"] = region;
            let tags = [genre, region, year, platform].filter(Boolean).join(",");
            url = `/tv/recommend?refresh=0&start=${start}&count=${count}&selected_categories=${encodeURIComponent(JSON.stringify(selectedCategories))}&uncollect=false&score_range=0,10&tags=${encodeURIComponent(tags)}&sort=${sort}`;
            referer = "https://movie.douban.com/tv/";
        } else if (tid === "show_filter") {
            // 综艺筛选
            let genre = ext.genre || "";
            let region = ext.region || "";
            let year = ext.year || "";
            let platform = ext.platform || "";
            let sort = ext.sort || "U";
            let selectedCategories = { "形式": "综艺" };
            if (genre) selectedCategories["类型"] = genre;
            if (region) selectedCategories["地区"] = region;
            let tags = [genre, region, year, platform].filter(Boolean).join(",");
            url = `/tv/recommend?refresh=0&start=${start}&count=${count}&selected_categories=${encodeURIComponent(JSON.stringify(selectedCategories))}&uncollect=false&score_range=0,10&tags=${encodeURIComponent(tags)}&sort=${sort}`;
            referer = "https://movie.douban.com/tv/";
        } else {
            return JSON.stringify({ list: [], page: p, pagecount: 0, total: 0 });
        }

        let data = rexGet(url, {});
        let items = data.items || [];
        return JSON.stringify({
            list: parseRexItems(items), page: p,
            pagecount: items.length < count ? p : p + 1,
            total: data.total || data.count || items.length
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
        // 补充搜索：用 rexxar 的 recommend 接口
        if (list.length < 5) {
            try {
                let data = rexGet("/movie/recommend", { refresh: 0, start: 0, count: 20, tags: wd, sort: "U", score_range: "0,10", uncollect: false });
                let webList = parseRexItems(data.items || []);
                let existIds = new Set(list.map(i => i.vod_id));
                for (let it of webList) { if (!existIds.has(it.vod_id)) list.push(it); }
            } catch (e) { }
        }
        return JSON.stringify({ list });
    } catch (e) { return JSON.stringify({ list: [] }); }
}

export default { init, home, homeVod, category, detail, search };
