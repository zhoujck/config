let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://movie.douban.com/"
};

let douban_api_host = "http://api.douban.com/api/v2";
let miniapp_apikey = "0ac44ae016490db2204ce0a042db2916";

async function init(cfg) {}

function doubanRequest(path, params) {
    params.apikey = miniapp_apikey;
    let query = [];
    for (let key in params) {
        query.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
    }
    let url = douban_api_host + path + "?" + query.join("&");
    let resp = req(url, { headers: headers });
    return JSON.parse(resp.content);
}

function parseItems(items) {
    let list = [];
    if (!items || !Array.isArray(items)) return list;
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.type !== "movie" && item.type !== "tv") continue;
        let rating = item.rating ? item.rating.value : "";
        let rat_str = rating || "暂无评分";
        let honor = item.honor_infos || [];
        let honor_str = "";
        for (let j = 0; j < honor.length; j++) {
            if (j > 0) honor_str += "|";
            honor_str += honor[j].title || "";
        }
        let remarks = rat_str;
        if (honor_str) remarks += " " + honor_str;
        list.push({
            vod_id: item.id || "",
            vod_name: item.title || "",
            vod_pic: item.pic ? (item.pic.normal || "") : "",
            vod_remarks: remarks
        });
    }
    return list;
}

async function home(filter) {
    let classes = [
        { type_id: "hot_gaia", type_name: "热门电影" },
        { type_id: "tv_hot", type_name: "热播剧集" },
        { type_id: "show_hot", type_name: "热播综艺" },
        { type_id: "documentary", type_name: "选纪录片" },
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
            { key: "sort", name: "排序", value: [{ n: "近期热度", v: "T" }, { n: "首播时间", v: "R" }, { n: "高分优先", v: "S" }] },
            { key: "年代", name: "年代", value: [{ n: "全部", v: "" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" }, { n: "2023", v: "2023" }, { n: "2022", v: "2022" }, { n: "2021", v: "2021" }, { n: "2020", v: "2020" }, { n: "2019", v: "2019" }, { n: "2010年代", v: "2010年代" }, { n: "2000年代", v: "2000年代" }, { n: "90年代", v: "90年代" }, { n: "80年代", v: "80年代" }, { n: "70年代", v: "70年代" }, { n: "60年代", v: "60年代" }, { n: "更早", v: "更早" }] }
        ],
        movie: [
            { key: "类型", name: "类型", value: [{ n: "全部类型", v: "" }, { n: "喜剧", v: "喜剧" }, { n: "爱情", v: "爱情" }, { n: "动作", v: "动作" }, { n: "科幻", v: "科幻" }, { n: "动画", v: "动画" }, { n: "悬疑", v: "悬疑" }, { n: "犯罪", v: "犯罪" }, { n: "惊悚", v: "惊悚" }, { n: "冒险", v: "冒险" }, { n: "音乐", v: "音乐" }, { n: "历史", v: "历史" }, { n: "奇幻", v: "奇幻" }, { n: "恐怖", v: "恐怖" }, { n: "战争", v: "战争" }, { n: "传记", v: "传记" }, { n: "歌舞", v: "歌舞" }, { n: "武侠", v: "武侠" }, { n: "纪录片", v: "纪录片" }, { n: "短片", v: "短片" }] },
            { key: "地区", name: "地区", value: [{ n: "全部地区", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" }, { n: "美国", v: "美国" }, { n: "中国香港", v: "中国香港" }, { n: "中国台湾", v: "中国台湾" }, { n: "英国", v: "英国" }, { n: "法国", v: "法国" }, { n: "德国", v: "德国" }, { n: "泰国", v: "泰国" }, { n: "印度", v: "印度" }] },
            { key: "sort", name: "排序", value: [{ n: "近期热度", v: "T" }, { n: "首映时间", v: "R" }, { n: "高分优先", v: "S" }] },
            { key: "年代", name: "年代", value: [{ n: "全部年代", v: "" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" }, { n: "2023", v: "2023" }, { n: "2022", v: "2022" }, { n: "2021", v: "2021" }, { n: "2020", v: "2020" }, { n: "2019", v: "2019" }, { n: "2010年代", v: "2010年代" }, { n: "2000年代", v: "2000年代" }, { n: "90年代", v: "90年代" }, { n: "80年代", v: "80年代" }, { n: "70年代", v: "70年代" }, { n: "60年代", v: "60年代" }, { n: "更早", v: "更早" }] }
        ],
        tv: [
            { key: "类型", name: "类型", value: [{ n: "不限", v: "" }, { n: "电视剧", v: "电视剧" }, { n: "综艺", v: "综艺" }] },
            { key: "电视剧形式", name: "电视剧形式", value: [{ n: "不限", v: "" }, { n: "喜剧", v: "喜剧" }, { n: "爱情", v: "爱情" }, { n: "悬疑", v: "悬疑" }, { n: "动画", v: "动画" }, { n: "武侠", v: "武侠" }, { n: "古装", v: "古装" }, { n: "家庭", v: "家庭" }, { n: "犯罪", v: "犯罪" }, { n: "科幻", v: "科幻" }, { n: "恐怖", v: "恐怖" }, { n: "历史", v: "历史" }, { n: "战争", v: "战争" }, { n: "动作", v: "动作" }, { n: "冒险", v: "冒险" }, { n: "传记", v: "传记" }, { n: "剧情", v: "剧情" }, { n: "奇幻", v: "奇幻" }, { n: "惊悚", v: "惊悚" }, { n: "灾难", v: "灾难" }, { n: "歌舞", v: "歌舞" }, { n: "音乐", v: "音乐" }] },
            { key: "综艺形式", name: "综艺形式", value: [{ n: "不限", v: "" }, { n: "真人秀", v: "真人秀" }, { n: "脱口秀", v: "脱口秀" }, { n: "音乐", v: "音乐" }, { n: "歌舞", v: "歌舞" }] },
            { key: "地区", name: "地区", value: [{ n: "全部地区", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" }, { n: "国外", v: "国外" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }, { n: "中国大陆", v: "中国大陆" }, { n: "中国香港", v: "中国香港" }, { n: "美国", v: "美国" }, { n: "英国", v: "英国" }, { n: "泰国", v: "泰国" }, { n: "中国台湾", v: "中国台湾" }] },
            { key: "sort", name: "排序", value: [{ n: "近期热度", v: "T" }, { n: "首播时间", v: "R" }, { n: "高分优先", v: "S" }] },
            { key: "年代", name: "年代", value: [{ n: "全部", v: "" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" }, { n: "2023", v: "2023" }, { n: "2022", v: "2022" }, { n: "2021", v: "2021" }, { n: "2020", v: "2020" }, { n: "2019", v: "2019" }, { n: "2010年代", v: "2010年代" }, { n: "2000年代", v: "2000年代" }, { n: "90年代", v: "90年代" }, { n: "80年代", v: "80年代" }, { n: "70年代", v: "70年代" }, { n: "60年代", v: "60年代" }, { n: "更早", v: "更早" }] },
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
        let res = doubanRequest("/subject_collection/subject_real_time_hotest/items", { start: 0, count: 30 });
        let items = res.subject_collection_items || [];
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
        let res = {};

        if (tid === "hot_gaia") {
            let sort = ext.sort || "recommend";
            let area = ext.area || "全部";
            res = doubanRequest("/movie/" + tid, { area: area, sort: sort, start: (p - 1) * count, count: count });
        } else if (tid === "tv_hot" || tid === "show_hot") {
            let stype = ext.type || tid;
            res = doubanRequest("/subject_collection/" + stype + "/items", { start: (p - 1) * count, count: count });
        } else if (tid === "documentary") {
            let genre = ext.genre || "";
            let region = ext.region || "";
            let sort = ext.sort || "T";
            let selectedCategories = { "形式": "电视剧" };
            if (genre) selectedCategories["类型"] = genre;
            let tagsArray = ["纪录片"];
            if (region) tagsArray.push(region);
            let tags = tagsArray.join(",");
            res = doubanRequest("/tv/recommend", { tags: tags, sort: sort, refresh: 0, selected_categories: JSON.stringify(selectedCategories), start: (p - 1) * count, count: count });
        } else if (tid.startsWith("rank_list")) {
            let id = tid === "rank_list_movie" ? "movie_real_time_hotest" : "tv_real_time_hotest";
            id = ext.榜单 || id;
            res = doubanRequest("/subject_collection/" + id + "/items", { start: (p - 1) * count, count: count });
        } else {
            // movie / tv 筛选
            let path = "/" + tid + "/recommend";
            let sort = ext.sort || "T";
            let tags = "";
            let selectedCategories = {};
            let filterKeys = Object.keys(ext);
            if (filterKeys.length > 0) {
                let tagArr = [];
                for (let k in ext) {
                    if (k !== "sort" && ext[k]) tagArr.push(ext[k]);
                }
                tags = tagArr.join(",");
                if (tid === "movie") {
                    selectedCategories = { "类型": ext.类型 || "", "地区": ext.地区 || "" };
                } else {
                    selectedCategories = { "类型": ext.类型 || "", "形式": ext.类型 ? ext.类型 + "地区" : "", "地区": ext.地区 || "" };
                }
            } else {
                if (tid === "movie") {
                    selectedCategories = { "类型": "", "地区": "" };
                } else {
                    selectedCategories = { "类型": "", "形式": "", "地区": "" };
                }
            }
            res = doubanRequest(path, { tags: tags, sort: sort, refresh: 0, selected_categories: JSON.stringify(selectedCategories), start: (p - 1) * count, count: count });
        }

        let items = [];
        if (/^rank_list|tv_hot|show_hot/.test(tid)) {
            items = res.subject_collection_items || [];
        } else {
            items = res.items || [];
        }

        let total = res.total || items.length;
        let pagecount = Math.ceil(total / count);

        return JSON.stringify({
            list: parseItems(items),
            page: p,
            pagecount: pagecount,
            total: total
        });
    } catch (e) {
        return JSON.stringify({ list: [], page: pg || 1, pagecount: 0, total: 0 });
    }
}

async function detail(id) {
    try {
        // 尝试电影
        let res;
        try {
            res = doubanRequest("/movie/" + id, {});
        } catch (e) {
            res = doubanRequest("/tv/" + id, {});
        }

        let title = res.title || "";
        let pic = res.pic ? (res.pic.normal || res.pic.large || "") : "";
        let cardSubtitle = res.card_subtitle || "";
        let year = "";
        let yearMatch = cardSubtitle.match(/^(\d{4})/);
        if (yearMatch) year = yearMatch[1];

        let area = "";
        let director = "";
        let actors = "";
        let content = res.intro || res.summary || "";

        if (cardSubtitle) {
            let parts = cardSubtitle.split(" / ");
            if (parts.length > 1) area = parts[1] || "";
            if (parts.length > 2) director = parts[2] || "";
            if (parts.length > 3) actors = parts.slice(3).join(" / ");
        }

        let score = "";
        if (res.rating && res.rating.value) {
            score = "评分: " + res.rating.value;
        }

        return JSON.stringify({
            list: [{
                vod_id: id,
                vod_name: title,
                vod_pic: pic,
                type_name: area,
                vod_year: year,
                vod_area: area,
                vod_remarks: score,
                vod_actor: actors,
                vod_director: director,
                vod_content: content,
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
        let p = pg || 1;
        let count = 20;
        let res = doubanRequest("/search", { q: wd, start: (p - 1) * count, count: count });

        let items = res.items || res.subjects || [];
        let list = [];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let subject = item.subject || item;
            if (subject.type !== "movie" && subject.type !== "tv") continue;
            let rating = subject.rating ? subject.rating.value : "";
            let rat_str = rating || "暂无评分";
            list.push({
                vod_id: subject.id || "",
                vod_name: subject.title || "",
                vod_pic: subject.pic ? (subject.pic.normal || "") : "",
                vod_remarks: rat_str
            });
        }

        return JSON.stringify({ list: list });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

export default { init, home, homeVod, category, detail, search };
