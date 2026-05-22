/*
title: '两个BT', author: '改编自Silent1566'
@version 2.0 - 修复图片和播放
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

// WASM模块缓存
var WasmMod = null;
var WasmReady = false;

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
    for (var k in map) { arr.push({ name: map[k], value: k }); }
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
CLASS_LIST.forEach(function(item) { FILTERS[item.type_id] = buildCategoryFilters(); });

async function init(cfg) {
    try {
        HOST = (cfg.ext?.host?.trim() || 'https://www.bttwo.me').replace(/\/$/, '');
        DefHeader['Referer'] = HOST + '/';
        KParams.headers['Referer'] = HOST + '/';
        let parseTimeout = parseInt(cfg.ext?.timeout?.trim(), 10);
        KParams.timeout = parseTimeout > 0 ? parseTimeout : 15000;
    } catch(e) {
        console.error('初始化失败：', e.message);
    }
}

async function home(filter) {
    try {
        let html = await reqText(HOST);
        let list = parseVideoListFromHtml(html);
        return JSON.stringify({ class: CLASS_LIST, filters: FILTERS, list: list });
    } catch (e) {
        console.error('首页获取失败：', e.message);
        return JSON.stringify({ class: CLASS_LIST, filters: FILTERS, list: [] });
    }
}

async function homeVod() {
    try {
        let html = await reqText(HOST);
        let list = parseVideoListFromHtml(html);
        return JSON.stringify({ list: list.slice(0, 20) });
    } catch (e) {
        console.error('推荐页获取失败：', e.message);
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10); pg = pg > 0 ? pg : 1;
        let params = { classify: getClassifyCode(tid) };
        if (extend) {
            if (extend.areas) params.areas = extend.areas;
            if (extend.types) params.types = extend.types;
            if (extend.years) params.years = extend.years;
            if (extend.sort) {
                var parts = extend.sort.split(/[:|,]/);
                params.sort_by = parts[0]; params.order = parts[1] || 'desc';
            }
        }
        if (pg > 1) params.page = pg;
        let html = await reqText(appendQuery(HOST + '/filter', params));
        let list = parseVideoListFromHtml(html);
        return JSON.stringify({
            list: list, page: pg,
            pagecount: list.length >= 20 ? pg + 1 : pg,
            limit: 20, total: 20 * (list.length >= 20 ? pg + 1 : pg)
        });
    } catch (e) {
        console.error('分类页获取失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 20, total: 0 });
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10); pg = pg > 0 ? pg : 1;
        let searchUrl = HOST + '/search?q=' + encodeURIComponent(wd);
        if (pg > 1) searchUrl += '&page=' + pg;
        let html = await reqText(searchUrl);
        let list = parseVideoListFromHtml(html, wd);
        return JSON.stringify({
            list: list, page: pg,
            pagecount: list.length >= 20 ? pg + 1 : pg,
            limit: 20, total: 20 * (list.length >= 20 ? pg + 1 : pg)
        });
    } catch (e) {
        console.error('搜索失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 20, total: 0 });
    }
}

async function detail(id) {
    try {
        let detailUrl;
        if (id.includes('://')) { detailUrl = id; }
        else if (id.startsWith('/play/') || id.startsWith('/movie/')) { detailUrl = HOST + id; }
        else { detailUrl = HOST + '/play/' + id; }

        let html = await reqText(detailUrl);

        // 解析标题
        var title = '';
        var titleTag = html.match(/<title>([^<]+)<\/title>/);
        if (titleTag) title = titleTag[1].replace(/\s*-\s*两个BT.*$/i, '').replace(/\s*-\s*第\d+集.*$/i, '').trim();
        var ogTitle = html.match(/og:title[^"]*"\s*content="([^"]+)"/);
        if (ogTitle) title = ogTitle[1].replace(/\s*-\s*第\d+集.*$/i, '').replace(/\s*-\s*两个BT.*$/i, '').trim();

        // 解析海报（修复 &amp; 编码）
        var pic = '';
        var ogImg = html.match(/og:image[^"]*"\s*content="([^"]+)"/);
        if (ogImg) { pic = decodeHtmlEntities(ogImg[1]); }
        if (!pic) {
            var imgMatch = html.match(/data-poster="([^"]+)"/) ||
                           html.match(/<img[^>]+(?:data-src|src)="([^"]*(?:poster|cover|thumb|douban)[^"]*)"/i);
            if (imgMatch) pic = imgMatch[1];
        }
        pic = fixPicUrl(pic);

        // 解析简介
        var desc = '';
        var ogDesc = html.match(/og:description[^"]*"\s*content="([^"]+)"/);
        if (ogDesc) desc = decodeHtmlEntities(ogDesc[1]).trim();

        // 解析元信息
        var actor = '', director = '';
        var metaMatch = html.match(/<meta[^>]+keywords[^"]*"\s*content="([^"]+)"/);
        if (metaMatch) {
            var parts = metaMatch[1].split(',');
            if (parts.length > 4) director = cleanText(parts[parts.length - 1]);
        }

        // 解析播放源和剧集
        var playSources = parsePlaySources(html, id);
        var vodId = id.replace(/^\/play\//, '').replace(/^\/movie\//, '');

        let VOD = {
            vod_id: vodId,
            vod_name: title || '未知标题',
            vod_pic: pic,
            type_name: '', vod_remarks: '', vod_year: '', vod_area: '', vod_lang: '',
            vod_director: director,
            vod_actor: actor,
            vod_content: desc,
            vod_play_from: playSources.map(function(s) { return s.name; }).join('$$$'),
            vod_play_url: playSources.map(function(s) {
                return s.episodes.map(function(ep) {
                    return ep.name + '$' + ep.url + '@' + (ep.dataid || '');
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
        // id 格式: /play/slug@dataid 或 /play/slug
        var parts = id.split('@');
        var playPath = parts[0];
        var dataid = parts[1] || '';

        if (!playPath.includes('://')) {
            playPath = HOST + (playPath.startsWith('/') ? '' : '/') + playPath;
        }

        // 检查是否是直接可播放链接
        if (/\.(m3u8|mp4|flv|avi|mkv|ts)(?:\?|$)/i.test(playPath)) {
            return JSON.stringify({ jx: 0, parse: 0, url: playPath, header: DefHeader });
        }

        // 如果有dataid，尝试用WASM获取真实视频URL
        if (dataid) {
            try {
                var videoUrl = await getVideoUrlByWasm(playPath, dataid);
                if (videoUrl) {
                    return JSON.stringify({ jx: 0, parse: 0, url: videoUrl, header: DefHeader });
                }
            } catch(e) {
                console.error('WASM解析失败，降级为嗅探:', e.message);
            }
        }

        // 降级: 返回播放页URL让播放器嗅探
        return JSON.stringify({ jx: 0, parse: 1, url: playPath, header: DefHeader });
    } catch (e) {
        console.error('播放失败：', e.message);
        return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
    }
}

// ========== WASM播放解析 ==========

async function getVideoUrlByWasm(playPageUrl, dataid) {
    try {
        // 获取播放页HTML
        var html = await reqText(playPageUrl);
        if (!html) return null;

        // 提取参数
        var nbStMatch = html.match(/id="nb-st"\s+content="(\d+)"/);
        var userlinkMatch = html.match(/userlink:'([^']+)'/);
        var slugMatch = playPageUrl.match(/\/play\/([^/?#]+)/);
        var slug = slugMatch ? slugMatch[1] : '';

        var nbSt = nbStMatch ? nbStMatch[1] : '';
        var userlink = userlinkMatch ? userlinkMatch[1] : '0';

        if (!slug || !dataid) return null;

        // 尝试初始化WASM
        if (!WasmReady) {
            await initWasm(html);
        }

        if (WasmReady && WasmMod) {
            // 设置DOM模拟（WASM需要读取meta标签）
            if (typeof document === 'undefined' || !document.getElementById) {
                // 纯JS环境，模拟document
                globalThis.document = {
                    getElementById: function(id) {
                        if (id === 'nb-st') return { content: nbSt };
                        if (id === 'nb-plt') return { content: Date.now().toString() };
                        return null;
                    }
                };
            } else {
                // 浏览器环境，确保meta标签存在
                var stEl = document.getElementById('nb-st');
                if (stEl) stEl.content = nbSt;
            }

            // 调用WASM生成签名URL
            var signedPath = WasmMod.build_play_url(dataid, slug, '1080', userlink);

            // 请求视频地址
            var videoResp = await reqText(HOST + signedPath);
            if (videoResp) {
                try {
                    var videoData = JSON.parse(videoResp);
                    if (videoData.code === 200 && videoData.data?.quality_urls?.length > 0) {
                        return videoData.data.quality_urls[0].url;
                    }
                } catch(e) {}
            }
        }

        return null;
    } catch(e) {
        console.error('getVideoUrlByWasm失败:', e.message);
        return null;
    }
}

async function initWasm(html) {
    try {
        if (typeof WebAssembly === 'undefined') {
            console.error('WebAssembly不可用');
            return;
        }

        // 从页面中提取WASM文件路径
        var wasmCfg = html.match(/id="wasm-cfg"[^>]*data-js="([^"]+)"[^>]*data-bg="([^"]+)"/);
        var jsPath = wasmCfg ? wasmCfg[1] : '/static/wasm/nbmovie_wasm.426511b7.js';
        var bgPath = wasmCfg ? wasmCfg[2] : '/static/wasm/nbmovie_wasm_bg.d5d51939.wasm';

        // 获取WASM二进制
        var wasmUrl = HOST + bgPath;
        var wasmResp = await request(wasmUrl, { buffer: 2 });
        if (!wasmResp || !wasmResp.content) {
            console.error('WASM二进制获取失败');
            return;
        }

        // 编译WASM
        var wasmBuffer = wasmResp.content;
        var wasmModule = await WebAssembly.compile(wasmBuffer);

        // 获取WASM JS包装器
        var jsUrl = HOST + jsPath;
        var jsResp = await request(jsUrl, { charset: 'utf-8' });
        if (!jsResp || !jsResp.content) {
            console.error('WASM JS获取失败');
            return;
        }

        // 动态执行JS包装器（需要处理ES module语法）
        var jsCode = jsResp.content;
        // 处理ES module语法
        jsCode = jsCode.replace(/import\.meta\.url/g, '"' + HOST + jsPath + '"');
        jsCode = jsCode.replace(/export\s+function\s+build_play_url/g, 'globalThis.__build_play_url = function');
        // 处理 export { initSync, __wbg_init as default }
        jsCode = jsCode.replace(/export\s*\{[^}]*__wbg_init\s+as\s+default[^}]*\}/g, function(match) {
            return 'globalThis.__wbg_init = __wbg_init; globalThis.__initSync = initSync;';
        });
        jsCode = jsCode.replace(/export\s*\{[^}]*\}/g, '');

        // 执行JS
        var fn = new Function(jsCode);
        fn();

        // 初始化WASM
        if (globalThis.__wbg_init) {
            await globalThis.__wbg_init(wasmModule);
            WasmMod = { build_play_url: globalThis.__build_play_url };
            WasmReady = true;
            console.log('WASM初始化成功');
        } else {
            console.error('WASM init函数未找到');
        }
    } catch(e) {
        console.error('initWasm失败:', e.message);
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
    url = decodeHtmlEntities(url);
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    return url.startsWith('/') ? HOST + url : HOST + '/' + url;
}

function decodeHtmlEntities(str) {
    if (!str) return '';
    return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

function cleanText(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
}

function isBadPic(url) {
    if (!url) return true;
    return url.includes('placeholder') || url.includes('blank.gif') ||
           url.includes('base64') || url.includes('/static/icons/') ||
           url.includes('favicon') || url.includes('logo.png');
}

function isRelevant(title, keyword) {
    if (!title || !keyword) return false;
    var t = title.toLowerCase(), k = keyword.toLowerCase();
    if (t.includes(k)) return true;
    var chars = new Set(k.replace(/\s+/g, ''));
    var tChars = new Set(t.replace(/\s+/g, ''));
    if (chars.size > 0) {
        var hit = 0;
        chars.forEach(function(c) { if (tChars.has(c)) hit++; });
        if (hit / chars.size >= 0.6) return true;
    }
    return false;
}

function parseVideoListFromHtml(html, keyword) {
    var list = [], seen = {};
    var linkRe = /<a\s[^>]*href="(\/play\/[^"]+)"[^>]*>/g;
    var match;
    while ((match = linkRe.exec(html)) !== null) {
        var playPath = match[1], slug = playPath.replace('/play/', '');
        if (seen[slug]) continue;
        var tagStart = match.index, tagEnd = html.indexOf('</a>', tagStart);
        if (tagEnd === -1) continue;
        var block = html.substring(tagStart, tagEnd + 4);
        var beforeBlock = html.substring(Math.max(0, tagStart - 500), tagStart);
        if (beforeBlock.includes('相关推荐')) continue;

        var title = '';
        var tm = block.match(/data-title="([^"]+)"/) || block.match(/alt="([^"]{2,})"/) || block.match(/title="([^"]{2,})"/);
        if (!tm) { var tx = block.replace(/<[^>]+>/g, '').trim(); if (tx.length >= 2) title = cleanText(tx); }
        else title = cleanText(tm[1]);
        if (!title || title.length < 2) continue;
        if (keyword && !isRelevant(title, keyword)) continue;

        var pic = '';
        var im = block.match(/data-original="([^"]+)"/) || block.match(/data-src="([^"]+)"/) || block.match(/src="(https?:[^"]+)"/);
        if (im) pic = im[1];
        if (isBadPic(pic)) pic = '';

        var remarks = '';
        var rm = block.match(/(\d+(?:\.\d)?分|4[Kk]|1080[Pp]|HD|更新至\s*\d+|第\s*\d+\s*集)/);
        if (rm) remarks = rm[1];

        seen[slug] = true;
        list.push({ vod_id: playPath, vod_name: title, vod_pic: fixPicUrl(pic), vod_remarks: remarks });
    }

    if (list.length === 0) {
        var movieRe = /href="(\/movie\/(\d+)\.html)"[^>]*/g;
        while ((match = movieRe.exec(html)) !== null) {
            var mPath = match[1], mId = match[2];
            if (seen[mId]) continue;
            var around = html.substring(Math.max(0, match.index - 300), match.index + 300);
            var mTitle = '';
            var mtMatch = around.match(/data-title="([^"]+)"/) || around.match(/alt="([^"]{2,})"/) || around.match(/>([^<]{2,})</);
            if (mtMatch) mTitle = cleanText(mtMatch[1]);
            if (!mTitle || mTitle.length < 2) continue;
            if (keyword && !isRelevant(mTitle, keyword)) continue;
            seen[mId] = true;
            list.push({ vod_id: mPath, vod_name: mTitle, vod_pic: '', vod_remarks: '' });
        }
    }
    return list;
}

function parsePlaySources(html, vodId) {
    var sources = [], sourceMap = {};
    var lineNames = {};
    var emMatch = html.match(/episodeManager\((\d+),\s*(\d+),\s*\[([\s\S]*?)\]\)/);
    if (emMatch) {
        var defaultLineId = emMatch[1];
        var lineRe = /lineName:\s*['"]([^'"]+)['"]/g, lm, idx = 1;
        while ((lm = lineRe.exec(emMatch[2])) !== null) { lineNames[String(idx)] = lm[1]; idx++; }
        if (Object.keys(lineNames).length === 0) lineNames[defaultLineId] = '默认播放';
    }

    var tagRe = /<a\s[^>]*data-episode="(\d+)"[^>]*>/g, tagMatch;
    while ((tagMatch = tagRe.exec(html)) !== null) {
        var epNum = tagMatch[1], fullTag = tagMatch[0];
        var tagStart = tagMatch.index, tagEnd = html.indexOf('</a>', tagStart);
        if (tagEnd === -1) continue;
        var tagContent = html.substring(tagStart, tagEnd + 4);

        var hrefMatch = fullTag.match(/href="([^"]+)"/);
        if (!hrefMatch) continue;
        var epPath = hrefMatch[1];
        var lineMatch = fullTag.match(/data-line="(\d+)"/);
        var lineId = lineMatch ? lineMatch[1] : '1';
        var dataIdMatch = fullTag.match(/dataid="(\d+)"/);
        var dataId = dataIdMatch ? dataIdMatch[1] : '';

        var epTitle = '';
        var spanMatch = tagContent.match(/<span[^>]*>([^<]+)<\/span>/);
        if (spanMatch) epTitle = cleanText(spanMatch[1]);
        if (!epTitle) {
            var clickMatch = fullTag.match(/handleEpisodeClick\([^,]+,\s*'(\d+)',\s*(\d+),\s*(\d+)\)/);
            if (clickMatch) epTitle = '第' + clickMatch[3] + '集';
        }
        if (!epTitle) epTitle = '第' + epNum + '集';
        if (/^\d+$/.test(epTitle)) epTitle = '第' + epTitle + '集';

        if (!sourceMap[lineId]) {
            sourceMap[lineId] = { name: lineNames[lineId] || (lineId === '1' ? '默认播放' : '线路' + lineId), episodes: [], seen: {} };
        }
        var src = sourceMap[lineId];
        if (src.seen[epPath]) continue;
        src.seen[epPath] = true;
        src.episodes.push({ name: epTitle, url: epPath, dataid: dataId, _idx: parseInt(epNum) || 0 });
    }

    // 备用: handleEpisodeClick
    if (Object.keys(sourceMap).length === 0) {
        var clickRe = /handleEpisodeClick\(\s*\$el\.getAttribute\('href'\)\s*,\s*'(\d+)'\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
        while ((tagMatch = clickRe.exec(html)) !== null) {
            var dataId2 = tagMatch[1], lineId2 = tagMatch[2], epNum2 = tagMatch[3];
            var beforeClick = html.substring(Math.max(0, tagMatch.index - 200), tagMatch.index);
            var hrefInTag = beforeClick.match(/href="([^"]+)"\s*[^>]*@click/);
            if (!hrefInTag) continue;
            var epPath2 = hrefInTag[1];
            if (!sourceMap[lineId2]) sourceMap[lineId2] = { name: lineNames[lineId2] || '默认播放', episodes: [], seen: {} };
            if (sourceMap[lineId2].seen[epPath2]) continue;
            sourceMap[lineId2].seen[epPath2] = true;
            sourceMap[lineId2].episodes.push({ name: '第' + epNum2 + '集', url: epPath2, dataid: dataId2, _idx: parseInt(epNum2) || 0 });
        }
    }

    // /v_play/ 格式
    var vpRe = /href="(\/v_play\/([^"]+)\.html)"[^>]*>([^<]*)<\/a>/g, em;
    while ((em = vpRe.exec(html)) !== null) {
        var vpPath = em[1], vpTitle = cleanText(em[3]);
        if (!vpTitle) continue;
        if (!sourceMap['1']) sourceMap['1'] = { name: '默认播放', episodes: [], seen: {} };
        if (sourceMap['1'].seen[vpPath]) continue;
        sourceMap['1'].seen[vpPath] = true;
        sourceMap['1'].episodes.push({ name: vpTitle, url: vpPath, dataid: '', _idx: sourceMap['1'].episodes.length });
    }

    for (var lid in sourceMap) {
        var s = sourceMap[lid];
        s.episodes.sort(function(a, b) { return a._idx - b._idx; });
        sources.push({ name: s.name, episodes: s.episodes.map(function(ep) { return { name: ep.name, url: ep.url, dataid: ep.dataid }; }) });
    }

    if (sources.length === 0) {
        var currentSlug = (vodId || '').replace(/^\/play\//, '');
        sources.push({ name: '默认播放', episodes: [{ name: '正片', url: '/play/' + currentSlug, dataid: '' }] });
    }
    return sources;
}

// HTTP请求封装
async function reqText(url, opts) {
    opts = opts || {};
    var headers = opts.headers || KParams.headers;
    var timeout = opts.timeout || KParams.timeout;
    try {
        var res = await req(url, { headers: headers, timeout: timeout, charset: 'utf-8', buffer: 0 });
        return res?.content || '';
    } catch(e) {
        console.error(url + ' → 请求失败:', e.message);
        return '';
    }
}

async function request(reqUrl, options) {
    if (typeof reqUrl !== 'string' || !reqUrl.trim()) throw new Error('reqUrl需为字符串且非空');
    options = options || {};
    try {
        options.method = (options.method || 'get').toLowerCase();
        if (['get', 'head'].includes(options.method)) { delete options.data; delete options.postType; }
        else { options.data = options.data || ''; options.postType = (options.postType || 'form').toLowerCase(); }
        var headers = options.headers || KParams.headers;
        var timeout = parseInt(options.timeout, 10) > 0 ? parseInt(options.timeout, 10) : KParams.timeout;
        var charset = (options.charset || 'utf-8').toLowerCase();
        var buffer = options.buffer || 0;
        var res = await req(reqUrl, { headers: headers, timeout: timeout, charset: charset, buffer: buffer });
        return res;
    } catch(e) {
        console.error(reqUrl + ' → 请求失败:', e.message);
        return null;
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
