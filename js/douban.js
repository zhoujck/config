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

// ========== 筛选器定义 ==========

const SORT = [{ n: "近期热度", v: "T" }, { n: "首播时间", v: "R" }, { n: "高分优先", v: "S" }];
const SORT_RECOMMEND = [{ n: "热度", v: "recommend" }, { n: "最新", v: "time" }, { n: "评分", v: "rank" }];
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
            { type_id: "hot_gaia", type_name: "热门电影" },
            { type_id: "tv_hot", type_name: "热播剧集" },
            { type_id: "show_hot", type_name: "热播综艺" },
            { type_id: "documentary", type_name: "纪录片" },
            { type_id: "movie", type_name: "电影筛选" },
            { type_id: "tv", type_name: "电视筛选" },
            { type_id: "rank_list_movie", type_name: "电影榜单" },
            { type_id: "rank_list_tv", type_name: "电视榜单" }
        ],
        filters: {
            hot_gaia: [
                { key: "sort", name: "排序", value: SORT_RECOMMEND },
                { key: "area", name: "地区", value: [{ n: "全部", v: "全部" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }] }
            ],
            tv_hot: [
                { key: "type", name: "分类", value: [{ n: "综合", v: "tv_hot" }, { n: "国产剧", v: "tv_domestic" }, { n: "欧美剧", v: "tv_american" }, { n: "日剧", v: "tv_japanese" }, { n: "韩剧", v: "tv_korean" }, { n: "动画", v: "tv_animation" }] }
            ],
            show_hot: [
                { key: "type", name: "分类", value: [{ n: "综合", v: "show_hot" }, { n: "国内", v: "show_domestic" }, { n: "国外", v: "show_foreign" }] }
            ],
            documentary: [
                { key: "genre", name: "类型", value: DOC_GENRES },
                { key: "region", name: "地区", value: DOC_REGIONS },
                { key: "sort", name: "排序", value: SORT }
            ],
            movie: [
                { key: "类型", name: "类型", value: MOVIE_GENRES },
                { key: "地区", name: "地区", value: MOVIE_REGIONS },
                { key: "sort", name: "排序", value: [{ n: "近期热度", v: "T" }, { n: "首映时间", v: "R" }, { n: "高分优先", v: "S" }] }
            ],
            tv: [
                { key: "类型", name: "类型", value: [{ n: "不限", v: "" }, { n: "电视剧", v: "电视剧" }, { n: "综艺", v: "综艺" }] },
                { key: "电视剧形式", name: "形式", value: TV_GENRES },
                { key: "地区", name: "地区", value: REGION_TV },
                { key: "sort", name: "排序", value: SORT },
                { key: "平台", name: "平台", value: PLATFORM }
            ],
            rank_list_movie: [
                { key: "榜单", name: "榜单", value: [{ n: "实时热门电影", v: "movie_real_time_hotest" }, { n: "一周口碑电影榜", v: "movie_weekly_best" }, { n: "豆瓣电影Top250", v: "movie_top250" }] }
            ],
            rank_list_tv: [
                { key: "榜单", name: "榜单", value: [{ n: "实时热门电视", v: "tv_real_time_hotest" }, { n: "华语口碑剧集榜", v: "tv_chinese_best_weekly" }, { n: "全球口碑剧集榜", v: "tv_global_best_weekly" }, { n: "国内口碑综艺榜", v: "show_chinese_best_weekly" }, { n: "国外口碑综艺榜", v: "show_global_best_weekly" }] }
            ]
        }
    });
}

async function homeVod() {
    try {
        return JSON.stringify({ list: parseItems(getByTag("热门", "movie", "recommend", 0, 30)) });
    } catch (e) { return JSON.stringify({ list: [] }); }
}

async function category(tid, pg, filter, extend) {
    try {
        let p = pg || 1, count = 20, ext = extend || {}, start = (p - 1) * count;
        let items = [], tag, sort;
        const sortMap = { T: "recommend", R: "time", S: "rank" };

        if (tid === "hot_gaia") {
            tag = (ext.area || "全部") === "全部" ? "热门" : ext.area;
            items = getByTag(tag, "movie", ext.sort || "recommend", start, count);
        } else if (tid === "tv_hot") {
            let m = { tv_hot: "热门", tv_domestic: "国产剧", tv_american: "美剧", tv_japanese: "日剧", tv_korean: "韩剧", tv_animation: "动画" };
            items = getByTag(m[ext.type] || "热门", "tv", "recommend", start, count);
        } else if (tid === "show_hot") {
            let m = { show_hot: "综艺", show_domestic: "国产综艺", show_foreign: "国外综艺" };
            items = getByTag(m[ext.type] || "综艺", "tv", "recommend", start, count);
        } else if (tid === "documentary") {
            items = getByTag(ext.genre || "纪录片", "movie", sortMap[ext.sort] || "recommend", start, count);
        } else if (tid === "movie") {
            tag = ext["类型"] || ext["地区"] || "热门";
            items = getByTag(tag, "movie", sortMap[ext.sort] || "recommend", start, count);
        } else if (tid === "tv") {
            tag = ext["电视剧形式"] || ext["类型"] || ext["地区"] || "热门";
            if (ext["平台"]) tag = ext["平台"];
            items = getByTag(tag, "tv", sortMap[ext.sort] || "recommend", start, count);
        } else if (tid === "rank_list_movie") {
            let m = { movie_real_time_hotest: "热门", movie_weekly_best: "一周口碑", movie_top250: "top250" };
            items = getByTag(m[ext["榜单"]] || "热门", "movie", "recommend", start, count);
        } else if (tid === "rank_list_tv") {
            let m = { tv_real_time_hotest: "热门", tv_chinese_best_weekly: "国产剧", tv_global_best_weekly: "美剧", show_chinese_best_weekly: "国产综艺", show_global_best_weekly: "国外综艺" };
            items = getByTag(m[ext["榜单"]] || "热门", "tv", "recommend", start, count);
        } else {
            items = getByTag(tid, "movie", "recommend", start, count);
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
