/*
title: '两个BT', author: '改编自Silent1566'
*/
var HOST;
const MOBILE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var DefHeader = {
    'User-Agent': MOBILE_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Referer': 'https://www.bttwo.me/'
};
var KParams = {
    headers: DefHeader,
    timeout: 15000
};

const CLASS_LIST = [
    { type_id: "movie", type_name: "电影" },
    { type_id: "tv", type_name: "电视剧" },
    { type_id: "anime", type_name: "动漫" },
    { type_id: "variety", type_name: "综艺" },
];

const AREA_MAP = {
    "5": "美国", "6": "法国", "7": "中国", "11": "日本", "12": "韩国",
    "14": "中国香港", "21": "中国台湾", "30": "英国", "33": "泰国",
    "34": "印度", "52": "中国大陆", "65": "马来西亚", "78": "其他"
};

const TYPE_MAP = {
    "1": "剧情", "2": "悬疑", "3": "恐怖", "4": "惊悚", "5": "喜剧",
    "6": "爱情", "9": "犯罪", "10": "动作", "11": "动画", "12": "奇幻",
    "13": "音乐", "14": "科幻", "15": "历史", "16": "战争", "18": "冒险",
    "19": "家庭", "20": "纪录", "27": "古装", "28": "传记", "34": "灾难"
};

const YEAR_MAP = {
    "1": "2026", "3": "2025", "4": "2024", "56": "2023", "13": "2022",
    "2": "2021", "6": "2020", "8": "2019", "9": "2018", "12": "2017",
    "11": "2016", "14": "2015", "15": "2014", "22": "2013", "10": "2012",
    "17": "2011", "25": "2010", "20": "2009", "23": "2008", "30": "2007",
    "31": "2006", "7": "2005", "24": "2004", "28": "2003", "19": "2002",
    "29": "2001", "43": "2000"
};

const SORT_MAP = [
    { name: "最新上映", value: "update_time:desc" },
    { name: "最受欢迎", value: "hits:desc" },
    { name: "评分最高", value: "score:desc" },
];

function makeFilterValues(map) {
    var arr = [{ name: "全部", value: "" }];
    for (var k in map) {
        arr.push({ name: map[k], value: k });
    }
    return arr;
}

function buildCategoryFilters() {
    return [
        { key: "areas", name: "地区", value: makeFilterValues(AREA_MAP) },
        { key: "types", name: "类型", value: makeFilterValues(TYPE_MAP) },
        { key: "years", name: "年份", value: makeFilterValues(YEAR_MAP) },
        { key: "sort", name: "排序", value: SORT_MAP }
    ];
}

var FILTERS = {};
CLASS_LIST.forEach(function(item) {
    FILTERS[item.type_id] = buildCategoryFilters();
});

async function init(cfg) {
    try {
        HOST = (cfg.ext?.host?.trim() || 'https://www.bttwo.me').replace(/\/$/, '');
        KParams.headers['Referer'] = HOST + '/';
        let parseTimeout = parseInt(cfg.ext?.timeout?.trim(), 10);
        KParams.timeout = parseTimeout > 0 ? parseTimeout : 15000;
    } catch(e) {
        console.error('初始化失败：', e.message);
    }
}

async function home(filter) {
    try {
        let html = await request(HOST, { headers: KParams.headers, timeout: KParams.timeout });
        let list = parseVideoListFromHtml(html);
        return JSON.stringify({
            class: CLASS_LIST,
            filters: FILTERS,
            list: list
        });
    } catch (e) {
        console.error('首页获取失败：', e.message);
        return JSON.stringify({ class: CLASS_LIST, filters: FILTERS, list: [] });
    }
}

async function homeVod() {
    try {
        let html = await request(HOST, { headers: KParams.headers, timeout: KParams.timeout });
        let list = parseVideoListFromHtml(html);
        return JSON.stringify({ list: list.slice(0, 20) });
    } catch (e) {
        console.error('推荐页获取失败：', e.message);
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;
        let params = { classify: getClassifyCode(tid) };
        if (extend) {
            if (extend.areas) params.areas = extend.areas;
            if (extend.types) params.types = extend.types;
            if (extend.years) params.years = extend.years;
            if (extend.sort) {
                var parts = extend.sort.split(/[:|,]/);
                params.sort_by = parts[0];
                params.order = parts[1] || 'desc';
            }
        }
        if (pg > 1) params.page = pg;
        let url = appendQuery(HOST + '/filter', params);
        let html = await request(url, { headers: KParams.headers, timeout: KParams.timeout });
        let list = parseVideoListFromHtml(html);
        return JSON.stringify({
            list: list,
            page: pg,
            pagecount: list.length >= 20 ? pg + 1 : pg,
            limit: 20,
            total: 20 * (list.length >= 20 ? pg + 1 : pg)
        });
    } catch (e) {
        console.error('分类页获取失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 20, total: 0 });
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;
        let searchUrl = HOST + '/search?q=' + encodeURIComponent(wd);
        if (pg > 1) searchUrl += '&page=' + pg;
        let html = await request(searchUrl, { headers: KParams.headers, timeout: KParams.timeout });
        let list = parseVideoListFromHtml(html, wd);
        return JSON.stringify({
            list: list,
            page: pg,
            pagecount: list.length >= 20 ? pg + 1 : pg,
            limit: 20,
            total: 20 * (list.length >= 20 ? pg + 1 : pg)
        });
    } catch (e) {
        console.error('搜索失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 20, total: 0 });
    }
}

async function detail(id) {
    try {
        let detailUrl;
        if (id.includes('://')) {
            detailUrl = id;
        } else if (id.startsWith('/play/') || id.startsWith('/movie/')) {
            detailUrl = HOST + id;
        } else {
            detailUrl = HOST + '/play/' + id;
        }

        let html = await request(detailUrl, { headers: KParams.headers, timeout: KParams.timeout });

        // 解析标题
        var title = '';
        var titleTag = html.match(/<title>([^<]+)<\/title>/);
        if (titleTag) title = titleTag[1].replace(/\s*-\s*两个BT.*$/i, '').replace(/\s*-\s*第\d+集.*$/i, '').trim();
        var ogTitle = html.match(/og:title[^"]*"\s*content="([^"]+)"/);
        if (ogTitle) title = ogTitle[1].replace(/\s*-\s*第\d+集.*$/i, '').replace(/\s*-\s*两个BT.*$/i, '').trim();

        // 解析海报
        var pic = '';
        var ogImg = html.match(/og:image[^"]*"\s*content="([^"]+)"/);
        if (ogImg) {
            pic = ogImg[1].replace(/&amp;/g, '&');
        }
        if (!pic) {
            var imgMatch = html.match(/data-poster="([^"]+)"/) ||
                           html.match(/<img[^>]+(?:data-src|src)="([^"]*(?:poster|cover|thumb|douban)[^"]*)"/i);
            if (imgMatch) pic = imgMatch[1];
        }
        pic = fixPicUrl(pic);

        // 解析简介
        var desc = '';
        var ogDesc = html.match(/og:description[^"]*"\s*content="([^"]+)"/);
        if (ogDesc) desc = ogDesc[1].replace(/&amp;/g, '&').replace(/&[a-z]+;/g, '').trim();

        // 解析元信息
        var actor = '';
        var director = '';
        var metaMatch = html.match(/<meta[^>]+keywords[^"]*"\s*content="([^"]+)"/);
        if (metaMatch) {
            var parts = metaMatch[1].split(',');
            if (parts.length > 4) director = cleanText(parts[parts.length - 1]);
        }

        // 解析播放源和剧集
        var playSources = parsePlaySources(html, id);

        // 构造 vod_id: 用 playId@标题@图片@备注 格式传递详情页信息
        let vodId = id.replace(/^\/play\//, '').replace(/^\/movie\//, '');

        let VOD = {
            vod_id: vodId,
            vod_name: title || '未知标题',
            vod_pic: pic,
            type_name: '',
            vod_remarks: '',
            vod_year: '',
            vod_area: '',
            vod_lang: '',
            vod_director: director,
            vod_actor: actor,
            vod_content: desc,
            vod_play_from: playSources.map(function(s) { return s.name; }).join('$$$'),
            vod_play_url: playSources.map(function(s) {
                return s.episodes.map(function(ep) {
                    return ep.name + '$' + ep.url;
                }).join('#');
            }).join('$$$')
        };

        return JSON.stringify({ list: [VOD] });
    } catch (e) {
        console.error('详情页获取失败：', e.message);
        return JSON.stringify({ list: [] });
    }
}

async function play(flag, id, flags) {
    try {
        // id 格式: /play/xxx 或完整URL
        let playUrl = id;
        if (!playUrl.includes('://')) {
            playUrl = HOST + (playUrl.startsWith('/') ? '' : '/') + playUrl;
        }

        // 检查是否是直接可播放链接
        let isDirect = /\.(m3u8|mp4|flv|avi|mkv|ts)(?:\?|$)/i.test(playUrl);

        if (isDirect) {
            return JSON.stringify({
                jx: 0,
                parse: 0,
                url: playUrl,
                header: DefHeader
            });
        }

        // 需要嗅探或解析
        return JSON.stringify({
            jx: 0,
            parse: 1,
            url: playUrl,
            header: DefHeader
        });
    } catch (e) {
        console.error('播放失败：', e.message);
        return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
    }
}

// ========== 工具函数 ==========

function getClassifyCode(tid) {
    var map = { movie: '1', tv: '2', anime: '3', variety: '4' };
    return map[tid] || tid || '1';
}

function appendQuery(url, params) {
    var parts = [];
    for (var k in params) {
        if (params[k] === undefined || params[k] === null || params[k] === '') continue;
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(params[k])));
    }
    if (parts.length === 0) return url;
    return url + (url.includes('?') ? '&' : '?') + parts.join('&');
}

function fixPicUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    return url.startsWith('/') ? HOST + url : HOST + '/' + url;
}

function cleanText(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
}

function extractBetween(str, start, end) {
    var i = str.indexOf(start);
    if (i === -1) return '';
    i += start.length;
    var j = str.indexOf(end, i);
    if (j === -1) return '';
    return str.substring(i, j);
}

function isBadPic(url) {
    if (!url) return true;
    return url.includes('placeholder') || url.includes('blank.gif') ||
           url.includes('base64') || url.includes('/static/icons/') ||
           url.includes('favicon') || url.includes('logo.png');
}

function parseVideoListFromHtml(html, keyword) {
    var list = [];
    var seen = {};
    // 匹配所有包含 /play/ 的 <a> 标签块
    var linkRe = /<a\s[^>]*href="(\/play\/[^"]+)"[^>]*>/g;
    var match;
    while ((match = linkRe.exec(html)) !== null) {
        var playPath = match[1];
        var slug = playPath.replace('/play/', '');
        if (seen[slug]) continue;

        // 取 <a> 标签开始到下一个 </a> 之间的内容
        var tagStart = match.index;
        var tagEnd = html.indexOf('</a>', tagStart);
        if (tagEnd === -1) continue;
        var block = html.substring(tagStart, tagEnd + 4);

        // 跳过推荐区域的链接（没有 data-title 且在 "相关推荐" 之后）
        var beforeBlock = html.substring(Math.max(0, tagStart - 500), tagStart);
        if (beforeBlock.includes('相关推荐')) continue;

        // 提取标题
        var title = '';
        var titleMatch = block.match(/data-title="([^"]+)"/) ||
                         block.match(/alt="([^"]{2,})"/) ||
                         block.match(/title="([^"]{2,})"/);
        if (!titleMatch) {
            // 从文本内容提取
            var textContent = block.replace(/<[^>]+>/g, '').trim();
            if (textContent.length >= 2) title = cleanText(textContent);
        } else {
            title = cleanText(titleMatch[1]);
        }
        if (!title || title.length < 2) continue;

        // 搜索时检查相关性
        if (keyword && !isRelevant(title, keyword)) continue;

        // 提取图片
        var pic = '';
        var imgMatch = block.match(/data-original="([^"]+)"/) ||
                       block.match(/data-src="([^"]+)"/) ||
                       block.match(/src="(https?:[^"]+)"/) ||
                       block.match(/src="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
        if (imgMatch) pic = imgMatch[1];
        if (isBadPic(pic)) pic = '';

        // 提取备注
        var remarks = '';
        var remMatch = block.match(/(\d+(?:\.\d)?分|4[Kk]|1080[Pp]|HD|更新至\s*\d+|第\s*\d+\s*集)/);
        if (remMatch) remarks = remMatch[1];

        seen[slug] = true;
        list.push({
            vod_id: playPath,
            vod_name: title,
            vod_pic: fixPicUrl(pic),
            vod_remarks: remarks
        });
    }

    // 备用: 匹配 /movie/xxx.html 格式
    if (list.length === 0) {
        var movieRe = /href="(\/movie\/(\d+)\.html)"[^>]*/g;
        while ((match = movieRe.exec(html)) !== null) {
            var mPath = match[1];
            var mId = match[2];
            if (seen[mId]) continue;
            var around = html.substring(Math.max(0, match.index - 300), match.index + 300);
            var mTitle = '';
            var mtMatch = around.match(/data-title="([^"]+)"/) ||
                          around.match(/alt="([^"]{2,})"/) ||
                          around.match(/>([^<]{2,})</);
            if (mtMatch) mTitle = cleanText(mtMatch[1]);
            if (!mTitle || mTitle.length < 2) continue;
            if (keyword && !isRelevant(mTitle, keyword)) continue;
            seen[mId] = true;
            list.push({ vod_id: mPath, vod_name: mTitle, vod_pic: '', vod_remarks: '' });
        }
    }

    return list;
}

function isRelevant(title, keyword) {
    if (!title || !keyword) return false;
    var t = title.toLowerCase();
    var k = keyword.toLowerCase();
    if (t.includes(k)) return true;
    // 字符匹配率
    var chars = new Set(k.replace(/\s+/g, ''));
    var tChars = new Set(t.replace(/\s+/g, ''));
    if (chars.size > 0) {
        var hit = 0;
        chars.forEach(function(c) { if (tChars.has(c)) hit++; });
        if (hit / chars.size >= 0.6) return true;
    }
    return false;
}

function parsePlaySources(html, vodId) {
    var sources = [];
    var sourceMap = {};

    // 解析 episodeManager 中的线路名和集数
    var lineNames = {};
    var emMatch = html.match(/episodeManager\((\d+),\s*(\d+),\s*\[([\s\S]*?)\]\)/);
    if (emMatch) {
        var defaultLineId = emMatch[1];
        var lineRe = /lineName:\s*['"]([^'"]+)['"]/g;
        var lm;
        var idx = 1;
        while ((lm = lineRe.exec(emMatch[2])) !== null) {
            lineNames[String(idx)] = lm[1];
            idx++;
        }
        // 如果只有一个线路且没有名字
        if (Object.keys(lineNames).length === 0) {
            lineNames[defaultLineId] = '默认播放';
        }
    }

    // 匹配所有带 data-episode 属性的 <a> 标签
    var tagRe = /<a\s[^>]*data-episode="(\d+)"[^>]*>/g;
    var tagMatch;
    while ((tagMatch = tagRe.exec(html)) !== null) {
        var epNum = tagMatch[1];
        var fullTag = tagMatch[0];
        var tagStart = tagMatch.index;
        var tagEnd = html.indexOf('</a>', tagStart);
        if (tagEnd === -1) continue;
        var tagContent = html.substring(tagStart, tagEnd + 4);

        // 提取 href
        var hrefMatch = fullTag.match(/href="([^"]+)"/);
        if (!hrefMatch) continue;
        var epPath = hrefMatch[1];

        // 提取 data-line
        var lineMatch = fullTag.match(/data-line="(\d+)"/);
        var lineId = lineMatch ? lineMatch[1] : '1';

        // 提取 dataid
        var dataIdMatch = fullTag.match(/dataid="(\d+)"/);
        var dataId = dataIdMatch ? dataIdMatch[1] : '';

        // 提取剧集名称（从 <span> 标签中）
        var epTitle = '';
        var spanMatch = tagContent.match(/<span[^>]*>([^<]+)<\/span>/);
        if (spanMatch) {
            epTitle = cleanText(spanMatch[1]);
        }
        if (!epTitle) {
            // 从 handleEpisodeClick 提取
            var clickMatch = fullTag.match(/handleEpisodeClick\([^,]+,\s*'(\d+)',\s*(\d+),\s*(\d+)\)/);
            if (clickMatch) epTitle = '第' + clickMatch[3] + '集';
        }
        if (!epTitle) epTitle = '第' + epNum + '集';
        // 标准化
        if (/^\d+$/.test(epTitle)) epTitle = '第' + epTitle + '集';

        if (!sourceMap[lineId]) {
            sourceMap[lineId] = {
                name: lineNames[lineId] || (lineId === '1' ? '默认播放' : '线路' + lineId),
                episodes: [],
                seen: {}
            };
        }
        var src = sourceMap[lineId];
        if (src.seen[epPath]) continue;
        src.seen[epPath] = true;
        src.episodes.push({
            name: epTitle,
            url: epPath,
            _idx: parseInt(epNum) || 0
        });
    }

    // 如果没有 data-episode 的链接，尝试匹配 handleEpisodeClick
    if (Object.keys(sourceMap).length === 0) {
        var clickRe = /handleEpisodeClick\(\s*\$el\.getAttribute\('href'\)\s*,\s*'(\d+)'\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
        while ((tagMatch = clickRe.exec(html)) !== null) {
            var dataId2 = tagMatch[1];
            var lineId2 = tagMatch[2];
            var epNum2 = tagMatch[3];

            // 找到对应的 href
            var beforeClick = html.substring(Math.max(0, tagMatch.index - 200), tagMatch.index);
            var hrefInTag = beforeClick.match(/href="([^"]+)"\s*[^>]*@click/);
            if (!hrefInTag) continue;
            var epPath2 = hrefInTag[1];

            if (!sourceMap[lineId2]) {
                sourceMap[lineId2] = {
                    name: lineNames[lineId2] || (lineId2 === '1' ? '默认播放' : '线路' + lineId2),
                    episodes: [],
                    seen: {}
                };
            }
            if (sourceMap[lineId2].seen[epPath2]) continue;
            sourceMap[lineId2].seen[epPath2] = true;
            sourceMap[lineId2].episodes.push({
                name: '第' + epNum2 + '集',
                url: epPath2,
                _idx: parseInt(epNum2) || 0
            });
        }
    }

    // 匹配 /v_play/ 格式
    var vpRe = /href="(\/v_play\/([^"]+)\.html)"[^>]*>([^<]*)<\/a>/g;
    var em;
    while ((em = vpRe.exec(html)) !== null) {
        var vpPath = em[1];
        var vpTitle = cleanText(em[3]);
        if (!vpTitle) continue;
        if (!sourceMap['1']) {
            sourceMap['1'] = { name: '默认播放', episodes: [], seen: {} };
        }
        if (sourceMap['1'].seen[vpPath]) continue;
        sourceMap['1'].seen[vpPath] = true;
        sourceMap['1'].episodes.push({
            name: vpTitle,
            url: vpPath,
            _idx: sourceMap['1'].episodes.length
        });
    }

    // 转换为数组并排序
    for (var lid in sourceMap) {
        var s = sourceMap[lid];
        s.episodes.sort(function(a, b) { return a._idx - b._idx; });
        sources.push({
            name: s.name,
            episodes: s.episodes.map(function(ep) {
                return { name: ep.name, url: ep.url };
            })
        });
    }

    // 如果没有解析到任何源，使用当前页面路径
    if (sources.length === 0) {
        var currentSlug = (vodId || '').replace(/^\/play\//, '');
        sources.push({
            name: '默认播放',
            episodes: [{ name: '正片', url: '/play/' + currentSlug }]
        });
    }

    return sources;
}

async function request(reqUrl, options) {
    if (typeof reqUrl !== 'string' || !reqUrl.trim()) { throw new Error('reqUrl需为字符串且非空'); }
    options = options || {};
    try {
        options.method = (options.method || 'get').toLowerCase();
        if (['get', 'head'].includes(options.method)) {
            delete options.data;
            delete options.postType;
        } else {
            options.data = options.data || '';
            options.postType = (options.postType || 'form').toLowerCase();
        }
        var headers = options.headers || KParams.headers;
        var timeout = parseInt(options.timeout, 10) > 0 ? parseInt(options.timeout, 10) : KParams.timeout;
        var charset = (options.charset || 'utf-8').toLowerCase();

        var optObj = {
            headers: headers,
            timeout: timeout,
            charset: charset,
            buffer: 0
        };

        var res = await req(reqUrl, optObj);
        return res?.content || '';
    } catch (e) {
        console.error(reqUrl + ' → 请求失败：', e.message);
        return '';
    }
}

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
