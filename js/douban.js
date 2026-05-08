// 豆瓣推荐 - TVBox 格式
// 基于 OmniBox-Spider 豆瓣推荐.js 改写

let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://movie.douban.com/"
};

async function init(cfg) {}

async function home(filter) {
    let classes = [
        { type_id: "movie", type_name: "热门电影" },
        { type_id: "tv", type_name: "热门剧集" },
        { type_id: "show", type_name: "热门综艺" },
        { type_id: "documentary", type_name: "纪录片" },
        { type_id: "movie_filter", type_name: "电影筛选" },
        { type_id: "tv_filter", type_name: "电视剧筛选" },
        { type_id: "show_filter", type_name: "综艺筛选" },
    ];

    let filters = {
        movie: [
            {
                key: "category", name: "类型",
                value: [
                    { n: "热门", v: "热门" }, { n: "最新", v: "最新" },
                    { n: "豆瓣高分", v: "豆瓣高分" }, { n: "冷门佳片", v: "冷门佳片" },
                ],
            },
            {
                key: "type", name: "地区",
                value: [
                    { n: "全部", v: "全部" }, { n: "华语", v: "华语" },
                    { n: "欧美", v: "欧美" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" },
                ],
            },
        ],
        tv: [
            {
                key: "type", name: "类型",
                value: [
                    { n: "综合", v: "tv" }, { n: "国产剧", v: "tv_domestic" },
                    { n: "欧美剧", v: "tv_american" }, { n: "日剧", v: "tv_japanese" },
                    { n: "韩剧", v: "tv_korean" }, { n: "动漫", v: "tv_animation" },
                    { n: "纪录片", v: "tv_documentary" },
                ],
            },
        ],
        show: [
            {
                key: "type", name: "类型",
                value: [
                    { n: "综合", v: "show" }, { n: "国内", v: "show_domestic" },
                    { n: "国外", v: "show_foreign" },
                ],
            },
        ],
        movie_filter: [
            {
                key: "genre", name: "类型",
                value: [
                    { n: "全部", v: "" }, { n: "喜剧", v: "喜剧" }, { n: "爱情", v: "爱情" },
                    { n: "动作", v: "动作" }, { n: "科幻", v: "科幻" }, { n: "动画", v: "动画" },
                    { n: "悬疑", v: "悬疑" }, { n: "犯罪", v: "犯罪" }, { n: "惊悚", v: "惊悚" },
                    { n: "冒险", v: "冒险" }, { n: "音乐", v: "音乐" }, { n: "历史", v: "历史" },
                    { n: "奇幻", v: "奇幻" }, { n: "恐怖", v: "恐怖" }, { n: "战争", v: "战争" },
                    { n: "传记", v: "传记" }, { n: "歌舞", v: "歌舞" }, { n: "武侠", v: "武侠" },
                    { n: "纪录片", v: "纪录片" }, { n: "短片", v: "短片" },
                ],
            },
            {
                key: "region", name: "地区",
                value: [
                    { n: "全部", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" },
                    { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" },
                    { n: "中国大陆", v: "中国大陆" }, { n: "美国", v: "美国" },
                    { n: "中国香港", v: "中国香港" }, { n: "中国台湾", v: "中国台湾" },
                    { n: "英国", v: "英国" }, { n: "法国", v: "法国" }, { n: "德国", v: "德国" },
                    { n: "泰国", v: "泰国" }, { n: "印度", v: "印度" },
                ],
            },
            {
                key: "year", name: "年代",
                value: [
                    { n: "全部", v: "" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" },
                    { n: "2024", v: "2024" }, { n: "2023", v: "2023" }, { n: "2022", v: "2022" },
                    { n: "2021", v: "2021" }, { n: "2020", v: "2020" }, { n: "2019", v: "2019" },
                    { n: "2020年代", v: "2020年代" }, { n: "2010年代", v: "2010年代" },
                    { n: "2000年代", v: "2000年代" }, { n: "90年代", v: "90年代" },
                    { n: "80年代", v: "80年代" }, { n: "70年代", v: "70年代" },
                    { n: "60年代", v: "60年代" }, { n: "更早", v: "更早" },
                ],
            },
            {
                key: "sort", name: "排序",
                value: [
                    { n: "热度", v: "U" }, { n: "评分", v: "S" }, { n: "时间", v: "R" },
                ],
            },
        ],
        tv_filter: [
            {
                key: "genre", name: "类型",
                value: [
                    { n: "全部", v: "" }, { n: "喜剧", v: "喜剧" }, { n: "爱情", v: "爱情" },
                    { n: "悬疑", v: "悬疑" }, { n: "动画", v: "动画" }, { n: "武侠", v: "武侠" },
                    { n: "古装", v: "古装" }, { n: "家庭", v: "家庭" }, { n: "犯罪", v: "犯罪" },
                    { n: "科幻", v: "科幻" }, { n: "恐怖", v: "恐怖" }, { n: "历史", v: "历史" },
                    { n: "战争", v: "战争" }, { n: "动作", v: "动作" }, { n: "冒险", v: "冒险" },
                    { n: "传记", v: "传记" }, { n: "剧情", v: "剧情" }, { n: "奇幻", v: "奇幻" },
                    { n: "惊悚", v: "惊悚" }, { n: "灾难", v: "灾难" },
                ],
            },
            {
                key: "region", name: "地区",
                value: [
                    { n: "全部", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" },
                    { n: "国外", v: "国外" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" },
                    { n: "中国大陆", v: "中国大陆" }, { n: "中国香港", v: "中国香港" },
                    { n: "美国", v: "美国" }, { n: "英国", v: "英国" }, { n: "泰国", v: "泰国" },
                    { n: "中国台湾", v: "中国台湾" },
                ],
            },
            {
                key: "year", name: "年代",
                value: [
                    { n: "全部", v: "" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" },
                    { n: "2024", v: "2024" }, { n: "2023", v: "2023" }, { n: "2022", v: "2022" },
                    { n: "2021", v: "2021" }, { n: "2020", v: "2020" }, { n: "2019", v: "2019" },
                    { n: "2020年代", v: "2020年代" }, { n: "2010年代", v: "2010年代" },
                    { n: "2000年代", v: "2000年代" }, { n: "90年代", v: "90年代" },
                    { n: "80年代", v: "80年代" }, { n: "70年代", v: "70年代" },
                    { n: "60年代", v: "60年代" }, { n: "更早", v: "更早" },
                ],
            },
            {
                key: "platform", name: "平台",
                value: [
                    { n: "全部", v: "" }, { n: "腾讯视频", v: "腾讯视频" },
                    { n: "爱奇艺", v: "爱奇艺" }, { n: "优酷", v: "优酷" },
                    { n: "Netflix", v: "Netflix" }, { n: "HBO", v: "HBO" },
                ],
            },
            {
                key: "sort", name: "排序",
                value: [
                    { n: "热度", v: "U" }, { n: "评分", v: "S" }, { n: "时间", v: "R" },
                ],
            },
        ],
        documentary: [
            {
                key: "genre", name: "类型",
                value: [
                    { n: "全部", v: "" }, { n: "自然", v: "自然" }, { n: "历史", v: "历史" },
                    { n: "人文", v: "人文" }, { n: "科技", v: "科技" }, { n: "美食", v: "美食" },
                    { n: "旅行", v: "旅行" }, { n: "社会", v: "社会" }, { n: "战争", v: "战争" },
                    { n: "宇宙", v: "宇宙" }, { n: "动物", v: "动物" },
                ],
            },
            {
                key: "region", name: "地区",
                value: [
                    { n: "全部", v: "" }, { n: "中国大陆", v: "中国大陆" }, { n: "美国", v: "美国" },
                    { n: "英国", v: "英国" }, { n: "日本", v: "日本" }, { n: "法国", v: "法国" },
                    { n: "德国", v: "德国" },
                ],
            },
            {
                key: "sort", name: "排序",
                value: [
                    { n: "热度", v: "U" }, { n: "评分", v: "S" }, { n: "时间", v: "R" },
                ],
            },
        ],
        show_filter: [
            {
                key: "genre", name: "类型",
                value: [
                    { n: "全部", v: "" }, { n: "真人秀", v: "真人秀" },
                    { n: "脱口秀", v: "脱口秀" }, { n: "音乐", v: "音乐" }, { n: "歌舞", v: "歌舞" },
                ],
            },
            {
                key: "region", name: "地区",
                value: [
                    { n: "全部", v: "" }, { n: "华语", v: "华语" }, { n: "欧美", v: "欧美" },
                    { n: "国外", v: "国外" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" },
                    { n: "中国大陆", v: "中国大陆" }, { n: "中国香港", v: "中国香港" },
                    { n: "美国", v: "美国" }, { n: "英国", v: "英国" }, { n: "泰国", v: "泰国" },
                    { n: "中国台湾", v: "中国台湾" },
                ],
            },
            {
                key: "year", name: "年代",
                value: [
                    { n: "全部", v: "" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" },
                    { n: "2024", v: "2024" }, { n: "2023", v: "2023" }, { n: "2022", v: "2022" },
                    { n: "2021", v: "2021" }, { n: "2020", v: "2020" }, { n: "2019", v: "2019" },
                    { n: "2020年代", v: "2020年代" }, { n: "2010年代", v: "2010年代" },
                    { n: "2000年代", v: "2000年代" }, { n: "90年代", v: "90年代" },
                    { n: "80年代", v: "80年代" }, { n: "70年代", v: "70年代" },
                    { n: "60年代", v: "60年代" }, { n: "更早", v: "更早" },
                ],
            },
            {
                key: "platform", name: "平台",
                value: [
                    { n: "全部", v: "" }, { n: "腾讯视频", v: "腾讯视频" },
                    { n: "爱奇艺", v: "爱奇艺" }, { n: "优酷", v: "优酷" },
                    { n: "Netflix", v: "Netflix" }, { n: "HBO", v: "HBO" },
                ],
            },
            {
                key: "sort", name: "排序",
                value: [
                    { n: "热度", v: "U" }, { n: "评分", v: "S" }, { n: "时间", v: "R" },
                ],
            },
        ],
    };

    return JSON.stringify({ class: classes, filters: filters });
}

async function homeVod() {
    let url = "https://m.douban.com/rexxar/api/v2/subject/recent_hot/tv?start=0&limit=20&category=tv&type=tv";
    let resp = await req(url, { headers: headers });
    let data = JSON.parse(resp.content);
    let list = [];
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach(item => {
            let vod_year = "";
            let cardSubtitle = item.card_subtitle || "";
            let yearMatch = cardSubtitle.match(/^(\d{4})/);
            if (yearMatch) vod_year = yearMatch[1];

            let vod_remarks = "";
            if (item.episodes_info && item.episodes_info.trim()) {
                vod_remarks = item.episodes_info.trim();
            }

            let vod_pic = (item.pic && (item.pic.large || item.pic.normal)) || "";

            list.push({
                vod_id: item.id || "",
                vod_name: item.title || "",
                vod_pic: vod_pic,
                vod_remarks: vod_remarks,
                vod_year: vod_year
            });
        });
    }
    return JSON.stringify({ list: list });
}

function buildCategoryUrl(categoryId, filters, start, limit) {
    if (categoryId === "movie") {
        let category = filters.category || "热门";
        let type = filters.type || "全部";
        return "https://m.douban.com/rexxar/api/v2/subject/recent_hot/movie?start=" + start + "&limit=" + limit + "&category=" + encodeURIComponent(category) + "&type=" + encodeURIComponent(type);
    } else if (categoryId === "tv" || categoryId === "show") {
        let type = filters.type || (categoryId === "tv" ? "tv_domestic" : "show");
        return "https://m.douban.com/rexxar/api/v2/subject/recent_hot/tv?start=" + start + "&limit=" + limit + "&category=" + encodeURIComponent(categoryId) + "&type=" + encodeURIComponent(type);
    } else if (categoryId === "documentary") {
        let genre = filters.genre || "";
        let region = filters.region || "";
        let sort = filters.sort || "U";
        let selectedCategories = { "形式": "电视剧" };
        if (genre) selectedCategories["类型"] = genre;
        let tagsArray = ["纪录片"];
        if (region) tagsArray.push(region);
        let tags = tagsArray.join(",");
        return "https://m.douban.com/rexxar/api/v2/tv/recommend?refresh=0&start=" + start + "&count=" + limit + "&selected_categories=" + encodeURIComponent(JSON.stringify(selectedCategories)) + "&uncollect=false&score_range=0,10&tags=" + encodeURIComponent(tags) + "&sort=" + sort;
    } else if (categoryId === "movie_filter") {
        let genre = filters.genre || "";
        let region = filters.region || "";
        let year = filters.year || "";
        let sort = filters.sort || "U";
        let selectedCategories = {};
        if (genre) selectedCategories["类型"] = genre;
        if (region) selectedCategories["地区"] = region;
        let tagsArray = [];
        if (genre) tagsArray.push(genre);
        if (region) tagsArray.push(region);
        if (year) tagsArray.push(year);
        let tags = tagsArray.join(",");
        return "https://m.douban.com/rexxar/api/v2/movie/recommend?refresh=0&start=" + start + "&count=" + limit + "&selected_categories=" + encodeURIComponent(JSON.stringify(selectedCategories)) + "&uncollect=false&score_range=0,10&tags=" + encodeURIComponent(tags) + "&sort=" + sort;
    } else if (categoryId === "tv_filter") {
        let genre = filters.genre || "";
        let region = filters.region || "";
        let year = filters.year || "";
        let platform = filters.platform || "";
        let sort = filters.sort || "U";
        let selectedCategories = { "形式": "电视剧" };
        if (genre) selectedCategories["类型"] = genre;
        if (region) selectedCategories["地区"] = region;
        let tagsArray = [];
        if (genre) tagsArray.push(genre);
        if (region) tagsArray.push(region);
        if (year) tagsArray.push(year);
        if (platform) tagsArray.push(platform);
        let tags = tagsArray.join(",");
        return "https://m.douban.com/rexxar/api/v2/tv/recommend?refresh=0&start=" + start + "&count=" + limit + "&selected_categories=" + encodeURIComponent(JSON.stringify(selectedCategories)) + "&uncollect=false&score_range=0,10&tags=" + encodeURIComponent(tags) + "&sort=" + sort;
    } else if (categoryId === "show_filter") {
        let genre = filters.genre || "";
        let region = filters.region || "";
        let year = filters.year || "";
        let platform = filters.platform || "";
        let sort = filters.sort || "U";
        let selectedCategories = { "形式": "综艺" };
        if (genre) selectedCategories["类型"] = genre;
        if (region) selectedCategories["地区"] = region;
        let tagsArray = [];
        if (genre) tagsArray.push(genre);
        if (region) tagsArray.push(region);
        if (year) tagsArray.push(year);
        if (platform) tagsArray.push(platform);
        let tags = tagsArray.join(",");
        return "https://m.douban.com/rexxar/api/v2/tv/recommend?refresh=0&start=" + start + "&count=" + limit + "&selected_categories=" + encodeURIComponent(JSON.stringify(selectedCategories)) + "&uncollect=false&score_range=0,10&tags=" + encodeURIComponent(tags) + "&sort=" + sort;
    }
    return "";
}

async function category(tid, pg, filter, extend) {
    let p = pg || 1;
    let limit = 20;
    let start = (p - 1) * limit;
    let filters = extend || {};
    let url = buildCategoryUrl(tid, filters, start, limit);
    if (!url) return JSON.stringify({ list: [], page: p });

    let resp = await req(url, { headers: headers });
    let data = JSON.parse(resp.content);

    let list = [];
    if (data.items && Array.isArray(data.items)) {
        data.items.forEach(item => {
            let vod_year = "";
            let cardSubtitle = item.card_subtitle || "";
            let yearMatch = cardSubtitle.match(/^(\d{4})/);
            if (yearMatch) vod_year = yearMatch[1];

            let vod_remarks = "";
            if (item.episodes_info && item.episodes_info.trim()) {
                vod_remarks = item.episodes_info.trim();
            } else if (item.is_new) {
                vod_remarks = tid === "movie" ? "新片" : "新剧";
            }

            let vod_pic = (item.pic && (item.pic.large || item.pic.normal)) || "";

            list.push({
                vod_id: item.id || "",
                vod_name: item.title || "",
                vod_pic: vod_pic,
                vod_remarks: vod_remarks,
                vod_year: vod_year
            });
        });
    }

    let total = data.total || data.count || list.length;
    let pagecount = Math.ceil(total / limit);

    return JSON.stringify({
        list: list,
        page: parseInt(p),
        pagecount: pagecount,
        total: total
    });
}

async function detail(id) {
    // 豆瓣详情页
    let url = "https://m.douban.com/rexxar/api/v2/movie/" + id;
    let resp = await req(url, { headers: headers });
    let data;
    try {
        data = JSON.parse(resp.content);
    } catch (e) {
        // 可能是剧集接口
        url = "https://m.douban.com/rexxar/api/v2/tv/" + id;
        resp = await req(url, { headers: headers });
        data = JSON.parse(resp.content);
    }

    let title = data.title || "";
    let pic = (data.pic && (data.pic.large || data.pic.normal)) || "";
    let cardSubtitle = data.card_subtitle || "";
    let year = "";
    let yearMatch = cardSubtitle.match(/^(\d{4})/);
    if (yearMatch) year = yearMatch[1];

    let area = "";
    let actors = "";
    let director = "";
    let content = data.intro || data.summary || "";

    // 从 card_subtitle 提取信息: "2025 / 中国大陆 / 剧情 犯罪 / 导演 / 演员1 演员2"
    if (cardSubtitle) {
        let parts = cardSubtitle.split(" / ");
        if (parts.length > 1) area = parts[1] || "";
        if (parts.length > 2) director = parts[2] || "";
        if (parts.length > 3) actors = parts.slice(3).join(" / ");
    }

    let score = "";
    if (data.rating && data.rating.value) {
        score = "评分: " + data.rating.value;
    }

    // 豆瓣没有直接播放源，构建跳转链接
    let doubanUrl = "https://movie.douban.com/subject/" + id;

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
            vod_play_url: "豆瓣详情$" + doubanUrl
        }]
    });
}

async function search(wd, quick, pg) {
    let p = pg || 1;
    let start = (p - 1) * 20;
    let url = "https://m.douban.com/rexxar/api/v2/search/movie?q=" + encodeURIComponent(wd) + "&start=" + start + "&count=20";
    let resp = await req(url, { headers: headers });
    let data = JSON.parse(resp.content);

    let list = [];
    let items = data.items || data.subjects || [];
    items.forEach(item => {
        let subject = item.subject || item;
        let vod_year = "";
        let cardSubtitle = subject.card_subtitle || "";
        let yearMatch = cardSubtitle.match(/^(\d{4})/);
        if (yearMatch) vod_year = yearMatch[1];

        let vod_pic = "";
        if (subject.pic) {
            vod_pic = subject.pic.large || subject.pic.normal || "";
        } else if (subject.cover_url) {
            vod_pic = subject.cover_url;
        }

        list.push({
            vod_id: subject.id || "",
            vod_name: subject.title || "",
            vod_pic: vod_pic,
            vod_remarks: subject.episodes_info || "",
            vod_year: vod_year
        });
    });

    return JSON.stringify({ list: list });
}

async function play(flag, id, flags) {
    // 豆瓣链接直接跳转
    if (/^http/.test(id)) {
        return JSON.stringify({
            parse: 1,
            url: id,
            header: { "User-Agent": "Mozilla/5.0" }
        });
    }
    return JSON.stringify({
        parse: 1,
        url: "https://movie.douban.com/subject/" + id,
        header: { "User-Agent": "Mozilla/5.0" }
    });
}

export default { init, home, homeVod, category, detail, search, play };
