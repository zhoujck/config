let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://movie.douban.com/"
};

async function init(cfg) {}

// ========== 底层请求 ==========

// 豆瓣网页接口
function webGet(path, params) {
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

// 标签列表
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

// 搜索建议
function suggest(q) {
    return webGet("/j/subject_suggest", { q: q }) || [];
}

// 图片URL处理 - 添加Referer解决防盗链
function fixPicUrl(url) {
    if (!url) return "";
    return url + "@Referer=https://movie.douban.com/";
}

// 详情页
function getDetail(id) {
    try {
        let resp = req("https://movie.douban.com/subject/" + id + "/", { headers: headers });
        let html = resp.content || "";
        let r = { id: id, title: "", pic: "", rating: "", year: "", area: "", director: "", actors: "", summary: "" };

        let m = html.match(/<title[^>]*>([^<]+)<\/title>/);
        if (m) r.title = m[1].replace(/\s*(豆瓣|douban).*$/i, "").trim();
        m = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (m) r.pic = m[1];
        m = html.match(/property="v:average"[^>]*>([^<]+)</);
        if (m) r.rating = m[1].trim();
        m = html.match(/<span class="year">\((\d{4})\)/);
        if (m) r.year = m[1];

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

        m = html.match(/<span property="v:summary"[^>]*>([\s\S]*?)<\/span>/);
        if (m) r.summary = m[1].replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").trim();

        return r;
    } catch (e) {
        return null;
    }
}

// ========== 数据转换 ==========

function parseItems(items) {
    let list = [];
    if (!items || !Array.isArray(items)) return list;
    for (let i = 0; i < items.length; i++) {
        let it = items[i];
        list.push({
            vod_id: it.id || "",
            vod_name: it.title || "",
            vod_pic: fixPicUrl(it.cover),
            vod_remarks: it.rate || "暂无评分"
        });
    }
    return list;
}

// ========== TVBox 接口（保留原脚本 type_id 和 filter 结构） ==========

async function home(filter) {
    let classes = [
        { type_id: "hot_gaia", type_name: "热门电影" },
        { type_id: "tv_hot", type_name: "热播剧集" },
        { type_id: "show_hot", type_name: "热播综艺" },
        { type_id: "documentary", type_name: "纪录片" },
        { type_id: "movie", type_name: "电影筛选" },
        { type_id: "tv", type_name: "电视筛选" },
        { type_id: "rank_list_movie", type_name: "电影榜单" },
        { type_id: "rank_list_tv", type_name: "电视榜单" }
    ];

    let filters = {
        hot_gaia: [
            { key: "sort", name: "排序", value: [{ n: "热度", v: "recommend" }, { n: "最新", v: "time" }, { n: "评分", v: "rank" }] },
            { key: "area", name: "地区", value: [{ n: "全部", v: "全部" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }] }
        ],
        tv_hot: [
            { key: "type", name: "分类", value: [{ n: "综合", v: "tv_hot" }, { n: "国产剧", v: "tv_domestic" }, { n: "欧美剧", v: "tv_american" }, { n: "日剧", v: "tv_japanese" }, { n: "韩剧", v: "tv_korean" }, { n: "动画", v: "tv_animation" }] }
        ],
        show_hot: [
            { key: "type", name: "分类", value: [{ n: "综合", v: "show_hot" }, { n: "国内", v: "show_domestic" }, { n: "国外", v: "show_foreign" }] }
        ],
        documentary: [
            { key: "genre", name: "类型", value: [{ n: "全部", v: "" }, { n: "自然", v: "自然" }, { n: "历史", v: "历史" }, { n: "人文", v: "人文" }, { n: "科技", v: "科技" }, { n: "美食", v: "美食" }, { n: "旅行", v: "旅行" }, { n: "社会", v: "社会" }, { n: "战争", v: "战争" }, { n: "宇宙", v: "宇宙" }, { n: "动物", v: "动物" }, { n: "音乐", v: "音乐" }, { n: "传记", v: "传记" }] },
            { key: "region", name: "地区", value: [{ n: "全部", v: "" }, { n: "中国大陆", v: "中国大陆" }, { n: "美国", v: "美国" }, { n: "英国", v: "英国" }, { n: "日本", v: "日本" }, { n: "法国", v: "法国" }, { n: "德国", v: "德国" }] },
            { key: "sort", name: "排序", value: [{ n: "近期热度", v: "T" }, { n: "首播时间", v: "R" }, { n: "高分优先", v: "S" }] }
        ],
        movie: [
            { key: "类型", name: "类型", value: [{ n: "全部类型", v: "" }, { n: "喜剧", v: "喜剧" }, { n: "爱情", v: "爱情" }, { n: "动作", v: "动作" }, { n: "科幻", v: "科幻" }, { n: "动画", v: "动画" }, { n: "悬疑", v: "悬疑" }, { n: "犯罪", v: "犯罪" }, { n: "惊悚", v: "惊悚" }, { n: "冒险", v: "冒险" }, { n: "音乐", v: "音乐" }, { n: "历史", v: "历史" }, { n: "奇幻", v: "奇幻" }, { n: "恐怖", v: "恐怖" }, { n: "战争", v: "战争" }, { n: "传记", v: "传记" }, { n: "歌舞", v: "歌舞" }, { n: "武侠", v: "武侠" }, { n: "纪录片", v: "纪录片" }, { n: "短片", v: "短片" }] },
            { key: "地区", name: "地区", value: [{ n: "全部地区", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" }, { n: "美国", v: "美国" }, { n: "中国香港", v: "中国香港" }, { n: "中国台湾", v: "中国台湾" }, { n: "英国", v: "英国" }, { n: "法国", v: "法国" }, { n: "德国", v: "德国" }, { n: "泰国", v: "泰国" }, { n: "印度", v: "印度" }] },
            { key: "sort", name: "排序", value: [{ n: "近期热度", v: "T" }, { n: "首映时间", v: "R" }, { n: "高分优先", v: "S" }] }
        ],
        tv: [
            { key: "类型", name: "类型", value: [{ n: "不限", v: "" }, { n: "电视剧", v: "电视剧" }, { n: "综艺", v: "综艺" }] },
            { key: "电视剧形式", name: "形式", value: [{ n: "不限", v: "" }, { n: "喜剧", v: "喜剧" }, { n: "爱情", v: "爱情" }, { n: "悬疑", v: "悬疑" }, { n: "动画", v: "动画" }, { n: "武侠", v: "武侠" }, { n: "古装", v: "古装" }, { n: "家庭", v: "家庭" }, { n: "犯罪", v: "犯罪" }, { n: "科幻", v: "科幻" }, { n: "恐怖", v: "恐怖" }, { n: "历史", v: "历史" }, { n: "战争", v: "战争" }, { n: "动作", v: "动作" }, { n: "冒险", v: "冒险" }, { n: "传记", v: "传记" }, { n: "剧情", v: "剧情" }, { n: "奇幻", v: "奇幻" }, { n: "惊悚", v: "惊悚" }, { n: "灾难", v: "灾难" }, { n: "歌舞", v: "歌舞" }, { n: "音乐", v: "音乐" }] },
            { key: "地区", name: "地区", value: [{ n: "全部地区", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "国外", v: "国外" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" }, { n: "中国香港", v: "中国香港" }, { n: "美国", v: "美国" }, { n: "英国", v: "英国" }, { n: "泰国", v: "泰国" }, { n: "中国台湾", v: "中国台湾" }] },
            { key: "sort", name: "排序", value: [{ n: "近期热度", v: "T" }, { n: "首播时间", v: "R" }, { n: "高分优先", v: "S" }] },
            { key: "平台", name: "平台", value: [{ n: "全部", v: "" }, { n: "腾讯视频", v: "腾讯视频" }, { n: "爱奇艺", v: "爱奇艺" }, { n: "优酷", v: "优酷" }, { n: "Netflix", v: "Netflix" }, { n: "HBO", v: "HBO" }, { n: "BBC", v: "BBC" }] }
        ],
        rank_list_movie: [
            { key: "榜单", name: "榜单", value: [{ n: "实时热门电影", v: "movie_real_time_hotest" }, { n: "一周口碑电影榜", v: "movie_weekly_best" }, { n: "豆瓣电影Top250", v: "movie_top250" }] }
        ],
        rank_list_tv: [
            { key: "榜单", name: "榜单", value: [{ n: "实时热门电视", v: "tv_real_time_hotest" }, { n: "华语口碑剧集榜", v: "tv_chinese_best_weekly" }, { n: "全球口碑剧集榜", v: "tv_global_best_weekly" }, { n: "国内口碑综艺榜", v: "show_chinese_best_weekly" }, { n: "国外口碑综艺榜", v: "show_global_best_weekly" }] }
        ]
    };

    return JSON.stringify({ class: classes, filters: filters });
}

async function homeVod() {
    try {
        let items = getByTag("热门", "movie", "recommend", 0, 30);
        return JSON.stringify({ list: parseItems(items) });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    try {
        let p = pg || 1;
        let count = 20;
        let ext = extend || {};
        let start = (p - 1) * count;
        let items = [];
        let type = "movie";

        if (tid === "hot_gaia") {
            let sort = ext.sort || "recommend";
            let area = ext.area || "全部";
            let tag = area === "全部" ? "热门" : area;
            items = getByTag(tag, "movie", sort, start, count);

        } else if (tid === "tv_hot") {
            let tagMap = {
                "tv_hot": "热门", "tv_domestic": "国产剧", "tv_american": "美剧",
                "tv_japanese": "日剧", "tv_korean": "韩剧", "tv_animation": "动画"
            };
            let tag = tagMap[ext.type] || "热门";
            items = getByTag(tag, "tv", "recommend", start, count);

        } else if (tid === "show_hot") {
            let tagMap = { "show_hot": "综艺", "show_domestic": "国产综艺", "show_foreign": "国外综艺" };
            let tag = tagMap[ext.type] || "综艺";
            items = getByTag(tag, "tv", "recommend", start, count);

        } else if (tid === "documentary") {
            let genre = ext.genre || "纪录片";
            let sortMap = { "T": "recommend", "R": "time", "S": "rank" };
            let sort = sortMap[ext.sort] || "recommend";
            items = getByTag(genre, "movie", sort, start, count);

        } else if (tid === "movie") {
            let genre = ext["类型"] || "";
            let region = ext["地区"] || "";
            let sortMap = { "T": "recommend", "R": "time", "S": "rank" };
            let sort = sortMap[ext.sort] || "recommend";
            let tag = genre || region || "热门";
            items = getByTag(tag, "movie", sort, start, count);

        } else if (tid === "tv") {
            let genre = ext["类型"] || "";
            let form = ext["电视剧形式"] || "";
            let region = ext["地区"] || "";
            let platform = ext["平台"] || "";
            let sortMap = { "T": "recommend", "R": "time", "S": "rank" };
            let sort = sortMap[ext.sort] || "recommend";
            let tag = form || genre || region || "热门";
            if (platform) tag = platform;
            items = getByTag(tag, "tv", sort, start, count);

        } else if (tid === "rank_list_movie") {
            // 豆瓣榜单 - 网页API没有直接的榜单接口，用标签模拟
            let rankTag = ext["榜单"] || "movie_real_time_hotest";
            let tagMap = {
                "movie_real_time_hotest": "热门",
                "movie_weekly_best": "一周口碑",
                "movie_top250": "top250"
            };
            let tag = tagMap[rankTag] || "热门";
            items = getByTag(tag, "movie", "recommend", start, count);

        } else if (tid === "rank_list_tv") {
            let rankTag = ext["榜单"] || "tv_real_time_hotest";
            let tagMap = {
                "tv_real_time_hotest": "热门",
                "tv_chinese_best_weekly": "国产剧",
                "tv_global_best_weekly": "美剧",
                "show_chinese_best_weekly": "国产综艺",
                "show_global_best_weekly": "国外综艺"
            };
            let tag = tagMap[rankTag] || "热门";
            let type = rankTag.startsWith("show_") ? "tv" : "tv";
            items = getByTag(tag, "tv", "recommend", start, count);

        } else {
            // 通用回退
            items = getByTag(tid, "movie", "recommend", start, count);
        }

        return JSON.stringify({
            list: parseItems(items),
            page: p,
            pagecount: items.length < count ? p : p + 1,
            total: items.length < count ? start + items.length : start + items.length + 1
        });
    } catch (e) {
        return JSON.stringify({ list: [], page: pg || 1, pagecount: 0, total: 0 });
    }
}

async function detail(id) {
    try {
        let r = getDetail(id);
        if (!r || !r.title) return JSON.stringify({ list: [] });

        return JSON.stringify({
            list: [{
                vod_id: id,
                vod_name: r.title,
                vod_pic: fixPicUrl(r.pic),
                type_name: r.area,
                vod_year: r.year,
                vod_area: r.area,
                vod_remarks: r.rating ? "评分: " + r.rating : "",
                vod_actor: r.actors,
                vod_director: r.director,
                vod_content: r.summary,
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
        let items = suggest(wd);
        let list = [];
        if (items && Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
                let it = items[i];
                if (it.type !== "movie" && it.type !== "tv") continue;
                list.push({
                    vod_id: it.id || "",
                    vod_name: it.title || "",
                    vod_pic: fixPicUrl(it.img),
                    vod_remarks: it.year || ""
                });
            }
        }

        if (list.length < 5) {
            try {
                let tagItems = getByTag(wd, "movie", "recommend", 0, count);
                let webList = parseItems(tagItems);
                let existIds = {};
                for (let i = 0; i < list.length; i++) existIds[list[i].vod_id] = true;
                for (let i = 0; i < webList.length; i++) {
                    if (!existIds[webList[i].vod_id]) list.push(webList[i]);
                }
            } catch (e) { }
        }

        return JSON.stringify({ list: list });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

export default { init, home, homeVod, category, detail, search };
