var rule = {
    title: '永乐影视',
    host: 'https://www.ylys.tv',
    url: '/vodtype/fyclass/',
    detailUrl: '/voddetail/fyid/',
    searchUrl: '/vodsearch/**----------fypage---/',
    searchable: 1,
    filterable: 1,
    quickSearch: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.ylys.tv/'
    },
    timeout: 5000,
    class_name: '电影&剧集&综艺&动漫',
    class_url: '1&2&3&4',
    filter: {
        "1": [
            { key: "class", name: "类型", value: [
                { n: "全部", v: "" }, { n: "动作", v: "dongzuo" }, { n: "喜剧", v: "xiju" },
                { n: "爱情", v: "aiqing" }, { n: "科幻", v: "kehuan" }, { n: "恐怖", v: "kongbu" },
                { n: "剧情", v: "juqing" }, { n: "战争", v: "zhanzheng" }, { n: "悬疑", v: "xuanyi" },
                { n: "奇幻", v: "qihuan" }
            ]},
            { key: "area", name: "地区", value: [
                { n: "全部", v: "" }, { n: "大陆", v: "大陆" }, { n: "香港", v: "香港" },
                { n: "台湾", v: "台湾" }, { n: "美国", v: "美国" }, { n: "韩国", v: "韩国" },
                { n: "日本", v: "日本" }, { n: "泰国", v: "泰国" }
            ]},
            { key: "year", name: "年份", value: [
                { n: "全部", v: "" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" },
                { n: "2023", v: "2023" }, { n: "2022", v: "2022" }, { n: "2021", v: "2021" }, { n: "2020", v: "2020" }
            ]},
            { key: "lang", name: "语言", value: [
                { n: "全部", v: "" }, { n: "国语", v: "国语" }, { n: "英语", v: "英语" },
                { n: "粤语", v: "粤语" }, { n: "韩语", v: "韩语" }, { n: "日语", v: "日语" }
            ]}
        ],
        "2": [
            { key: "class", name: "类型", value: [
                { n: "全部", v: "" }, { n: "国产剧", v: "guochan" }, { n: "港台剧", v: "gangtai" },
                { n: "日韩剧", v: "rihan" }, { n: "欧美剧", v: "oumei" }
            ]},
            { key: "area", name: "地区", value: [
                { n: "全部", v: "" }, { n: "大陆", v: "大陆" }, { n: "香港", v: "香港" },
                { n: "台湾", v: "台湾" }, { n: "美国", v: "美国" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }
            ]},
            { key: "year", name: "年份", value: [
                { n: "全部", v: "" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" },
                { n: "2023", v: "2023" }, { n: "2022", v: "2022" }, { n: "2021", v: "2021" }
            ]},
            { key: "lang", name: "语言", value: [
                { n: "全部", v: "" }, { n: "国语", v: "国语" }, { n: "英语", v: "英语" },
                { n: "韩语", v: "韩语" }, { n: "日语", v: "日语" }
            ]}
        ],
        "3": [
            { key: "area", name: "地区", value: [
                { n: "全部", v: "" }, { n: "大陆", v: "大陆" }, { n: "韩国", v: "韩国" }, { n: "日本", v: "日本" }
            ]},
            { key: "year", name: "年份", value: [
                { n: "全部", v: "" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" }, { n: "2023", v: "2023" }
            ]}
        ],
        "4": [
            { key: "area", name: "地区", value: [
                { n: "全部", v: "" }, { n: "大陆", v: "大陆" }, { n: "日本", v: "日本" },
                { n: "韩国", v: "韩国" }, { n: "美国", v: "美国" }
            ]},
            { key: "year", name: "年份", value: [
                { n: "全部", v: "" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" }, { n: "2023", v: "2023" }
            ]}
        ]
    },
    filter_url: 'vodshow/fyclass-{{area}}-{{class}}-{{lang}}----{{year}}--fypage---/',
    play_parse: true,
    lazy: '',
    推荐: `js:
        pdfa = jsp.pdfa;
        pdfh = jsp.pdfh;
        let d = [];
        let html = request(input);
        let items = pdfa(html, ".module-poster-item");
        items.forEach(function(it) {
            let id = pdfh(it, "a&&href").match(/voddetail\/(\d+)/);
            id = id ? id[1] : "";
            let title = pdfh(it, "a&&title") || pdfh(it, ".module-poster-item-title&&Text");
            let img = pdfh(it, "img&&data-original") || pdfh(it, "img&&src");
            let remark = pdfh(it, ".module-item-note&&Text");
            if (id && title) {
                d.push({ vod_id: id, vod_name: title, vod_pic: img, vod_remarks: remark || "" });
            }
        });
        VODS = d;
    `,
    一级: `js:
        pdfa = jsp.pdfa;
        pdfh = jsp.pdfh;
        let d = [];
        let html = request(input);
        let items = pdfa(html, ".module-poster-item");
        items.forEach(function(it) {
            let id = pdfh(it, "a&&href").match(/voddetail\/(\d+)/);
            id = id ? id[1] : "";
            let title = pdfh(it, "a&&title") || pdfh(it, ".module-poster-item-title&&Text");
            let img = pdfh(it, "img&&data-original") || pdfh(it, "img&&src");
            let remark = pdfh(it, ".module-item-note&&Text");
            if (id && title) {
                d.push({ vod_id: id, vod_name: title, vod_pic: img, vod_remarks: remark || "" });
            }
        });
        VODS = d;
    `,
    二级: `js:
        pdfa = jsp.pdfa;
        pdfh = jsp.pdfh;
        let html = request(input);
        let vod = {};
        vod.vod_id = input.match(/voddetail\/(\d+)/)[1];
        vod.vod_name = pdfh(html, "h1&&Text");
        vod.vod_pic = pdfh(html, ".module-info-poster img&&data-original") || pdfh(html, ".module-info-poster img&&src");
        vod.type_name = "";
        vod.vod_year = "";
        vod.vod_area = "";
        // 从 tag 区域提取年份和地区
        let tagLinks = pdfa(html, ".module-info-tag-link");
        tagLinks.forEach(function(t) {
            let txt = pdfh(t, "a&&Text");
            let href = pdfh(t, "a&&href") || "";
            if (/^\d{4}$/.test(txt)) { vod.vod_year = txt; }
            else if (href.indexOf("area") > -1 || /大陆|香港|台湾|美国|韩国|日本|泰国|英国/.test(txt)) { vod.vod_area = txt; }
        });
        vod.vod_director = "";
        vod.vod_actor = "";
        let infoItems = pdfa(html, ".module-info-item");
        infoItems.forEach(function(item) {
            let label = pdfh(item, ".module-info-item-title&&Text") || "";
            let val = pdfh(item, ".module-info-item-content&&Text") || "";
            if (label.indexOf("导演") > -1) { vod.vod_director = val; }
            if (label.indexOf("主演") > -1) { vod.vod_actor = val; }
        });
        vod.vod_remarks = pdfh(html, ".module-item-note&&Text");
        vod.vod_content = pdfh(html, ".module-info-introduction-content&&Text") || "暂无简介";
        // 播放源和播放列表
        let playFrom = [];
        let playList = [];
        let tabs = pdfa(html, "#y-playList .module-tab-item");
        let panels = pdfa(html, ".module-play-list");
        tabs.forEach(function(tab, i) {
            let name = pdfh(tab, "span&&Text") || "播放源" + (i + 1);
            playFrom.push(name);
            let urls = [];
            if (panels[i]) {
                let links = pdfa(panels[i], ".module-play-list-link");
                links.forEach(function(a) {
                    let href = pdfh(a, "&&href");
                    let ep = pdfh(a, "span&&Text") || "正片";
                    if (href) { urls.push(ep + "$" + href); }
                });
            }
            playList.push(urls.join("#"));
        });
        vod.vod_play_from = playFrom.join("$$$");
        vod.vod_play_url = playList.join("$$$");
        VOD = vod;
    `,
    搜索: `js:
        pdfa = jsp.pdfa;
        pdfh = jsp.pdfh;
        let d = [];
        let html = request(input);
        let items = pdfa(html, ".module-card-item");
        items.forEach(function(it) {
            let id = pdfh(it, "a&&href").match(/voddetail\/(\d+)/);
            id = id ? id[1] : "";
            let title = pdfh(it, ".module-card-item-title&&Text") || "";
            let img = pdfh(it, "img&&data-original") || pdfh(it, "img&&src");
            let remark = pdfh(it, ".module-item-note&&Text");
            if (id && title) {
                d.push({ vod_id: id, vod_name: title.replace(/<[^>]+>/g, ""), vod_pic: img, vod_remarks: remark || "" });
            }
        });
        VODS = d;
    `,
    lazy: `js:
        pdfh = jsp.pdfh;
        let html = request(host + input);
        let url = html.match(/"url"\s*:\s*"([^"]*\.m3u8[^"]*)"/);
        if (url) {
            url = url[1].replace(/\\\//g, "/");
            input = { parse: 0, url: url, header: JSON.stringify(headers) };
        } else {
            let u = html.match(/"url"\s*:\s*"([^"]+)"/);
            if (u) {
                u = u[1].replace(/\\\//g, "/");
                input = { parse: 0, url: u, header: JSON.stringify(headers) };
            } else {
                input = { parse: 1, url: host + input, header: JSON.stringify(headers) };
            }
        }
    `
};
