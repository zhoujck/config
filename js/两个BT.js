/*
title: '两个BT', author: 'v1.0.0'
FongMi JS Spider - 基于 OmniBox 版转换
*/

const HOST = 'https://www.bttwoo.com';
const MOBILE_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
var DefHeader = {
    'User-Agent': MOBILE_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Connection': 'keep-alive',
    'Referer': HOST + '/'
};

const PAGE_LIMIT = 20;

// ========== 筛选配置 ==========

const CLASS_LIST = [
    {type_id: 'movie', type_name: '电影'},
    {type_id: 'tv', type_name: '电视剧'},
    {type_id: 'anime', type_name: '动漫'},
    {type_id: 'variety', type_name: '综艺'}
];

function makeFilterValues(items) {
    return [{name: '全部', value: ''}].concat(items.map(function(item) {
        return {name: item[1], value: item[0]};
    }));
}

const AREA_VALUES = makeFilterValues([
    ['5', '美国'], ['6', '法国'], ['52', '中国大陆'], ['11', '日本'],
    ['12', '韩国'], ['14', '中国香港'], ['21', '中国台湾'],
    ['30', '英国'], ['33', '泰国'], ['34', '印度'], ['78', '其他']
]);

const TYPE_VALUES = makeFilterValues([
    ['1', '剧情'], ['5', '喜剧'], ['10', '动作'], ['6', '爱情'],
    ['14', '科幻'], ['3', '恐怖'], ['2', '悬疑'], ['4', '惊悚'],
    ['9', '犯罪'], ['11', '动画'], ['12', '奇幻'], ['18', '冒险'],
    ['15', '历史'], ['16', '战争'], ['19', '家庭'], ['27', '古装'],
    ['31', '武侠'], ['33', '纪录片'], ['34', '灾难']
]);

const YEAR_VALUES = makeFilterValues([
    ['1', '2026'], ['3', '2025'], ['4', '2024'], ['56', '2023'], ['13', '2022'],
    ['2', '2021'], ['6', '2020'], ['8', '2019'], ['9', '2018'], ['12', '2017'],
    ['11', '2016'], ['14', '2015'], ['15', '2014'], ['22', '2013'], ['10', '2012']
]);

const TAG_VALUES = makeFilterValues([
    ['1', '4K'], ['36', '院线']
]);

const SORT_VALUES = [
    {name: '最新上映', value: 'update_time:desc'},
    {name: '最受欢迎', value: 'hits:desc'},
    {name: '评分最高', value: 'score:desc'}
];

function buildCategoryFilterList() {
    return [
        {key: 'areas', name: '地区', value: AREA_VALUES},
        {key: 'types', name: '类型', value: TYPE_VALUES},
        {key: 'years', name: '年份', value: YEAR_VALUES},
        {key: 'tags', name: '标签', value: TAG_VALUES},
        {key: 'sort', name: '排序', value: SORT_VALUES}
    ];
}

var FILTERS = {};
CLASS_LIST.forEach(function(item) {
    FILTERS[item.type_id] = buildCategoryFilterList();
});

const CATEGORY_BASE_FILTERS = {
    movie: {classify: '1'},
    tv: {classify: '2'},
    anime: {classify: '3'},
    variety: {classify: '4'}
};

// ========== 工具函数 ==========

function stripHtml(text) {
    return String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function fixPicUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return HOST + url;
    return HOST + '/' + url;
}

function isBadPic(url) {
    if (!url) return true;
    return url.indexOf('placeholder') >= 0 || url.indexOf('blank.gif') >= 0 ||
        url.indexOf('base64') >= 0 || url.indexOf('/static/icons/') >= 0 ||
        url.indexOf('favicon') >= 0 || url.indexOf('logo.png') >= 0;
}

function getPlaySlug(url) {
    if (!url) return '';
    var match = String(url).match(/\/play\/([^/?#"'\s]+)/);
    return match ? match[1] : '';
}

function appendQuery(url, params) {
    var parts = [];
    for (var key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null && params[key] !== '') {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(params[key])));
        }
    }
    if (parts.length === 0) return url;
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + parts.join('&');
}

function isRelevantSearchResult(title, searchKey) {
    if (!title || !searchKey) return false;
    var titleLower = title.toLowerCase();
    var searchKeyLower = searchKey.toLowerCase();
    if (titleLower.indexOf(searchKeyLower) >= 0) return true;

    var searchChars = {};
    var titleChars = {};
    searchKeyLower.replace(/\s+/g, '').split('').forEach(function(c) { searchChars[c] = true; });
    titleLower.replace(/\s+/g, '').split('').forEach(function(c) { titleChars[c] = true; });
    var searchSize = Object.keys(searchChars).length;
    if (searchSize > 0) {
        var intersection = 0;
        for (var c in searchChars) { if (titleChars[c]) intersection++; }
        if (intersection / searchSize >= 0.6) return true;
    }
    if (searchKeyLower.length <= 2) return titleLower.indexOf(searchKeyLower) >= 0;
    return false;
}

function parseFilterObject(value) {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return {};
    try { return JSON.parse(value); } catch(e) {
        return {};
    }
}

function getRequestFilters(params) {
    var result = {};
    var sources = [params.filters, params.extend, params.ext, params.filter];
    sources.forEach(function(s) {
        var obj = parseFilterObject(s);
        for (var k in obj) { if (obj.hasOwnProperty(k)) result[k] = obj[k]; }
    });
    return result;
}

function safeParseJSON(str) {
    try { return JSON.parse(str); } catch(e) { return null; }
}

// ========== 请求函数 ==========

async function request(reqUrl, options) {
    if (typeof reqUrl !== 'string' || !reqUrl.trim()) return '';
    if (!options || typeof options !== 'object') options = {};
    try {
        options.method = (options.method || 'get').toLowerCase();
        if (options.method === 'get' || options.method === 'head') {
            delete options.data;
            delete options.postType;
        }
        options.headers = options.headers || DefHeader;
        options.timeout = options.timeout || 15000;
        var res = await req(reqUrl, options);
        return res && res.content ? res.content : '';
    } catch (e) {
        console.error(reqUrl + ' 请求失败: ' + e.message);
        return '';
    }
}

// ========== HTML 解析 ==========

function extractVideoList(html, keyword) {
    var list = [];
    var seenIds = {};

    // 匹配 /play/slug 格式的链接
    var playRegex = /<a[^>]+href="\/play\/([^/?#"'\s]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    var match;
    while ((match = playRegex.exec(html)) !== null) {
        var vodId = match[1];
        if (seenIds[vodId]) continue;

        var titleMatch = match[2].replace(/<[^>]*>/g, '').trim();
        if (!titleMatch || titleMatch.length <= 1) continue;

        // 相关性过滤
        if (keyword && !isRelevantSearchResult(titleMatch, keyword)) continue;

        seenIds[vodId] = true;

        // 尝试从附近提取图片
        var pic = '';
        var contextStart = Math.max(0, match.index - 500);
        var context = html.substring(contextStart, match.index + match[0].length + 200);
        var imgMatch = context.match(/data-original="([^"]+)"|data-src="([^"]+)"|src="([^"]+)"/);
        if (imgMatch) {
            pic = imgMatch[1] || imgMatch[2] || imgMatch[3] || '';
            if (isBadPic(pic)) pic = '';
        }

        // 提取备注
        var remarks = '';
        var remarkMatch = context.match(/(4[Kk]|1080[Pp]|HD|更新至\s*\d+|第\s*\d+\s*集|\d+(?:\.\d)?分)/);
        if (remarkMatch) remarks = remarkMatch[1];

        list.push({
            vod_id: vodId,
            vod_name: titleMatch,
            vod_pic: fixPicUrl(pic),
            vod_remarks: remarks || ''
        });
    }

    // 匹配 /movie/id.html 格式
    if (list.length === 0) {
        var movieRegex = /<li[^>]*>[\s\S]*?<a[^>]+href="\/movie\/(\d+)\.html"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi;
        while ((match = movieRegex.exec(html)) !== null) {
            var movieId = match[1];
            if (seenIds[movieId]) continue;

            var movieTitle = match[2].replace(/<[^>]*>/g, '').trim();
            if (!movieTitle || movieTitle.length <= 1) continue;

            if (keyword && !isRelevantSearchResult(movieTitle, keyword)) continue;

            seenIds[movieId] = true;

            var moviePic = '';
            var movieContext = html.substring(Math.max(0, match.index - 500), match.index + match[0].length + 200);
            var movieImgMatch = movieContext.match(/data-original="([^"]+)"|data-src="([^"]+)"|src="([^"]+)"/);
            if (movieImgMatch) {
                moviePic = movieImgMatch[1] || movieImgMatch[2] || movieImgMatch[3] || '';
                if (isBadPic(moviePic)) moviePic = '';
            }

            var movieRemarks = '';
            var movieRemarkMatch = movieContext.match(/(4[Kk]|1080[Pp]|HD|更新至\s*\d+|第\s*\d+\s*集|\d+(?:\.\d)?分)/);
            if (movieRemarkMatch) movieRemarks = movieRemarkMatch[1];

            list.push({
                vod_id: movieId,
                vod_name: movieTitle,
                vod_pic: fixPicUrl(moviePic),
                vod_remarks: movieRemarks || ''
            });
        }
    }

    return list;
}

function parsePlaySources(html, vodId) {
    var sourceMap = {};

    // 新格式: /play/slug
    var playRegex = /<a[^>]+href="\/play\/([^/?#"'\s]+)"[^>]*(?:data-episode="(\d*)")?[^>]*(?:data-line="(\d*)")?[^>]*(?:dataid="([^"]*)")?[^>]*>([\s\S]*?)<\/a>/gi;
    var match;
    while ((match = playRegex.exec(html)) !== null) {
        var playSlug = match[1];
        var episode = match[2] || '';
        var lineId = match[3] || '1';
        var dataId = match[4] || '';
        var epTitle = (match[5] || '').replace(/<[^>]*>/g, '').trim();

        if (!playSlug || !epTitle) continue;

        if (/^\d+$/.test(epTitle)) epTitle = '第' + epTitle + '集';

        var playId = '/play/' + playSlug;
        var fid = dataId || (vodId + '#' + lineId + '#' + (episode || '0'));

        if (!sourceMap[lineId]) {
            sourceMap[lineId] = {
                name: lineId === '1' ? '默认播放' : '线路' + lineId,
                episodes: [],
                seen: {}
            };
        }

        if (!sourceMap[lineId].seen[fid]) {
            sourceMap[lineId].seen[fid] = true;
            sourceMap[lineId].episodes.push({
                name: epTitle,
                playId: playId,
                index: parseInt(episode) || sourceMap[lineId].episodes.length
            });
        }
    }

    // 旧格式: /v_play/id.html
    var vplayRegex = /<a[^>]+href="\/v_play\/([^.]+)\.html"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = vplayRegex.exec(html)) !== null) {
        var playId = match[1];
        var vEpTitle = (match[2] || '').replace(/<[^>]*>/g, '').trim();
        if (!playId || !vEpTitle) continue;

        var vLineId = '1';
        if (!sourceMap[vLineId]) {
            sourceMap[vLineId] = {name: '默认播放', episodes: [], seen: {}};
        }
        if (!sourceMap[vLineId].seen[playId]) {
            sourceMap[vLineId].seen[playId] = true;
            sourceMap[vLineId].episodes.push({
                name: vEpTitle,
                playId: playId,
                index: sourceMap[vLineId].episodes.length
            });
        }
    }

    // 构建结果
    var playSources = [];
    var lineIds = Object.keys(sourceMap).sort(function(a, b) {
        return (parseInt(a) || 999) - (parseInt(b) || 999);
    });

    lineIds.forEach(function(lineId) {
        var source = sourceMap[lineId];
        source.episodes.sort(function(a, b) { return a.index - b.index; });
        var episodesStr = source.episodes.map(function(ep) {
            return ep.name + '$' + ep.playId;
        }).join('#');
        playSources.push({name: source.name, episodes: episodesStr});
    });

    if (playSources.length === 0) {
        playSources.push({name: '默认播放', episodes: '正片$/' + vodId});
    }

    return playSources;
}

function getDetailField(html, label) {
    // 匹配 div 结构中的字段
    var regex = new RegExp('<div[^>]*>\\s*' + label + '\\s*<\\/div>\\s*<div[^>]*>([\\s\\S]*?)<\\/div>', 'i');
    var match = html.match(regex);
    if (match) {
        var text = stripHtml(match[1]);
        if (text) return text;
    }
    // 匹配 li/span 中的字段
    var regex2 = new RegExp(label + '[：:]?\\s*([^<]+)', 'i');
    var match2 = html.match(regex2);
    if (match2) {
        var text2 = match2[1].trim();
        if (text2 && text2 !== label) return text2;
    }
    return '';
}

// ========== 分类URL构建 ==========

function buildCategoryUrl(tid, pg, extend) {
    var tidStr = String(tid || 'movie');
    var query = {};

    // 基础分类
    var baseFilter = CATEGORY_BASE_FILTERS[tidStr];
    if (baseFilter) {
        for (var k in baseFilter) { if (baseFilter.hasOwnProperty(k)) query[k] = baseFilter[k]; }
    } else if (/^\d+$/.test(tidStr)) {
        query.classify = tidStr;
    } else {
        query.classify = '1';
    }

    // 筛选参数
    var filterMap = {
        classify: ['classify'],
        areas: ['areas', 'area'],
        types: ['types', 'type', 'class'],
        years: ['years', 'year'],
        tags: ['tags', 'tag']
    };

    for (var targetKey in filterMap) {
        if (!filterMap.hasOwnProperty(targetKey)) continue;
        var sourceKeys = filterMap[targetKey];
        for (var i = 0; i < sourceKeys.length; i++) {
            var sk = sourceKeys[i];
            if (extend.hasOwnProperty(sk) && extend[sk] !== '' && extend[sk] !== undefined && extend[sk] !== null) {
                query[targetKey] = String(extend[sk]);
                break;
            }
        }
    }

    // 排序
    if (extend.sort || extend.by) {
        var rawSort = String(extend.sort || extend.by || '');
        if (rawSort) {
            var parts = rawSort.split(/[:|,]/);
            query.sort_by = parts[0];
            if (parts[1]) query.order = parts[1];
        }
    }
    if (extend.sort_by) {
        query.sort_by = String(extend.sort_by);
        query.order = String(extend.order || 'desc');
    }

    // 分页
    if (pg > 1) query.page = String(pg);

    return appendQuery(HOST + '/filter', query);
}

// ========== 接口实现 ==========

async function init(cfg) {
    // 初始化，无需特殊处理
}

async function home(filter) {
    try {
        var html = await request(HOST, {headers: DefHeader});
        var list = extractVideoList(html);
        return JSON.stringify({
            class: CLASS_LIST,
            filters: FILTERS,
            list: list
        });
    } catch (e) {
        console.error('首页获取失败: ' + e.message);
        return JSON.stringify({class: CLASS_LIST, filters: FILTERS, list: []});
    }
}

async function homeVod() {
    try {
        var html = await request(HOST, {headers: DefHeader});
        var list = extractVideoList(html);
        return JSON.stringify({list: list});
    } catch (e) {
        console.error('推荐页获取失败: ' + e.message);
        return JSON.stringify({list: []});
    }
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;

        var filters = getRequestFilters({filter: filter, extend: extend});
        var url = buildCategoryUrl(tid, pg, filters);

        var html = await request(url, {headers: DefHeader});
        var list = extractVideoList(html);

        return JSON.stringify({
            list: list,
            page: pg,
            pagecount: list.length >= PAGE_LIMIT ? pg + 1 : pg,
            limit: PAGE_LIMIT,
            total: 99999
        });
    } catch (e) {
        console.error('分类获取失败: ' + e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: PAGE_LIMIT, total: 0});
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;

        var searchUrl = HOST + '/search?q=' + encodeURIComponent(wd);
        if (pg > 1) searchUrl += '&page=' + pg;

        var html = await request(searchUrl, {headers: DefHeader});
        var list = extractVideoList(html, wd);

        return JSON.stringify({
            list: list,
            page: pg,
            pagecount: list.length >= PAGE_LIMIT ? pg + 1 : pg,
            limit: PAGE_LIMIT,
            total: 99999
        });
    } catch (e) {
        console.error('搜索失败: ' + e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: PAGE_LIMIT, total: 0});
    }
}

async function detail(id) {
    try {
        var vodId = String(id || '');
        var detailUrl;

        if (vodId.indexOf('/play/') === 0 || vodId.indexOf('/movie/') === 0) {
            detailUrl = HOST + vodId;
        } else if (vodId.indexOf('play/') === 0 || vodId.indexOf('movie/') === 0) {
            detailUrl = HOST + '/' + vodId;
        } else if (vodId.indexOf('http') === 0) {
            detailUrl = vodId;
        } else if (/^\d+$/.test(vodId)) {
            detailUrl = HOST + '/movie/' + vodId + '.html';
        } else {
            detailUrl = HOST + '/play/' + vodId;
        }

        var html = await request(detailUrl, {headers: DefHeader});
        if (!html) throw new Error('详情页请求失败');

        // 提取标题
        var title = '';
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || html.match(/<title[^>]*>([\s\S]*?)<\/title>/);
        if (titleMatch) title = stripHtml(titleMatch[1]);

        // 提取图片
        var pic = '';
        var picMatch = html.match(/data-poster="([^"]+)"/) ||
            html.match(/class="poster"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/) ||
            html.match(/<img[^>]+(?:data-original|data-src|src)="([^"]+)"/);
        if (picMatch && !isBadPic(picMatch[1])) pic = picMatch[1];

        // 提取简介
        var desc = '';
        var descMatch = html.match(/剧情简介[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) ||
            html.match(/class="intro"[^>]*>([\s\S]*?)<\/div>/i) ||
            html.match(/class="description"[^>]*>([\s\S]*?)<\/div>/i);
        if (descMatch) desc = stripHtml(descMatch[1]);

        // 演员 & 导演
        var actor = getDetailField(html, '主演');
        var director = getDetailField(html, '导演');

        // 解析播放源
        var playSources = parsePlaySources(html, vodId);
        var vod_play_from = playSources.map(function(s) { return s.name; }).join('$$$');
        var vod_play_url = playSources.map(function(s) { return s.episodes; }).join('$$$');

        var vod = {
            vod_id: vodId,
            vod_name: title || '未知标题',
            vod_pic: fixPicUrl(pic),
            type_name: '',
            vod_year: '',
            vod_area: '',
            vod_remarks: '',
            vod_actor: actor,
            vod_director: director,
            vod_content: desc,
            vod_play_from: vod_play_from,
            vod_play_url: vod_play_url
        };

        return JSON.stringify({list: [vod]});
    } catch (e) {
        console.error('详情获取失败: ' + e.message);
        return JSON.stringify({list: []});
    }
}

async function play(flag, id, flags) {
    try {
        var playUrl = String(id || '');

        // 处理 /play/slug 格式
        if (playUrl.indexOf('/play/') === 0 || playUrl.indexOf('play/') === 0) {
            if (playUrl.charAt(0) !== '/') playUrl = '/' + playUrl;
            playUrl = HOST + playUrl;
        }
        // 处理 /v_play/ 格式
        else if (playUrl.indexOf('/v_play/') === 0 || playUrl.indexOf('v_play/') === 0) {
            if (playUrl.charAt(0) !== '/') playUrl = '/' + playUrl;
            playUrl = HOST + playUrl;
        }
        // 处理纯 base64 播放ID
        else if (playUrl.indexOf('http') !== 0 && playUrl.charAt(0) !== '/') {
            playUrl = HOST + '/play/' + playUrl;
        }

        return JSON.stringify({
            parse: 1,
            playUrl: '',
            url: playUrl,
            header: DefHeader
        });
    } catch (e) {
        console.error('播放失败: ' + e.message);
        return JSON.stringify({parse: 1, playUrl: '', url: HOST + '/play/' + id, header: DefHeader});
    }
}

// ========== 导出 ==========

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        search: search,
        detail: detail,
        play: play,
        proxy: null
    };
}
