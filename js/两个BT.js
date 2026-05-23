/*
title: '两个BT', author: '改编自Silent1566'
@version 3.0 - 性能优化版
优化：WASM预加载、首页缓存、indexOf解析、减少重复请求
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

// ========== 首页缓存 ==========
var _homeCache = null;
var _homeCacheTime = 0;
var HOME_CACHE_TTL = 300000; // 5分钟缓存

// ========== WASM模块缓存 ==========
var WasmMod = null;
var WasmReady = false;
var _wasmInitPromise = null; // 防止并发初始化

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

        // 预加载WASM（异步，不阻塞init返回）
        preloadWasm();
    } catch(e) {
        console.error('初始化失败：', e.message);
    }
}

// ========== WASM预加载 ==========
async function preloadWasm() {
    if (WasmReady || _wasmInitPromise) return _wasmInitPromise;
    _wasmInitPromise = (async function() {
        try {
            // 先获取首页提取WASM配置
            var html = await reqText(HOST);
            if (!html) return;
            await initWasm(html);
        } catch(e) {
            console.error('WASM预加载失败:', e.message);
        }
    })();
    return _wasmInitPromise;
}

// ========== 带缓存的首页请求 ==========
async function getHomeHtml() {
    var now = Date.now();
    if (_homeCache && (now - _homeCacheTime) < HOME_CACHE_TTL) {
        return _homeCache;
    }
    var html = await reqText(HOST);
    if (html) {
        _homeCache = html;
        _homeCacheTime = now;
    }
    return html;
}

async function home(filter) {
    try {
        let html = await getHomeHtml();
        let list = parseVideoListFromHtml(html);
        return JSON.stringify({ class: CLASS_LIST, filters: FILTERS, list: list });
    } catch (e) {
        console.error('首页获取失败：', e.message);
        return JSON.stringify({ class: CLASS_LIST, filters: FILTERS, list: [] });
    }
}

async function homeVod() {
    try {
        let html = await getHomeHtml(); // 复用缓存
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
        if (!html) return JSON.stringify({ list: [] });

        // 解析标题
        var title = '';
        var ogTitle = html.match(/og:title[^\"]*\"\s*content="([^"]+)"/);
        if (ogTitle) {
            title = ogTitle[1].replace(/\s*-\s*第\d+集.*$/i, '').replace(/\s*-\s*两个BT.*$/i, '').trim();
        } else {
            var titleTag = html.match(/<title>([^<]+)<\/title>/);
            if (titleTag) title = titleTag[1].replace(/\s*-\s*两个BT.*$/i, '').replace(/\s*-\s*第\d+集.*$/i, '').trim();
        }

        // 解析海报
        var pic = '';
        var ogImg = html.match(/og:image[^\"]*\"\s*content="([^"]+)"/);
        if (ogImg) { pic = decodeHtmlEntities(ogImg[1]); }
        if (!pic) {
            var imgMatch = html.match(/data-poster="([^"]+)"/) ||
                           html.match(/<img[^>]+(?:data-src|src)="([^"]*(?:poster|cover|thumb|douban)[^"]*)"/i);
            if (imgMatch) pic = imgMatch[1];
        }
        pic = fixPicUrl(pic);

        // 解析简介
        var desc = '';
        var ogDesc = html.match(/og:description[^\"]*\"\s*content="([^"]+)"/);
        if (ogDesc) desc = decodeHtmlEntities(ogDesc[1]).trim();

        // 解析元信息
        var director = '';
        var metaMatch = html.match(/<meta[^>]+keywords[^\"]*\"\s*content="([^"]+)"/);
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
            vod_actor: '',
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
        // id 格式: /play/slug@dataid
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
        // 确保WASM已初始化
        if (!WasmReady) {
            await preloadWasm();
            // 等一下预加载完成
            if (_wasmInitPromise) await _wasmInitPromise;
        }

        if (!WasmReady || !WasmMod) return null;

        // 获取播放页HTML提取参数
        var html = await reqText(playPageUrl);
        if (!html) return null;

        var nbStMatch = html.match(/id="nb-st"\s+content="(\d+)"/);
        var userlinkMatch = html.match(/userlink:'([^']+)'/);
        var slugMatch = playPageUrl.match(/\/play\/([^/?#]+)/);
        var slug = slugMatch ? slugMatch[1] : '';

        var nbSt = nbStMatch ? nbStMatch[1] : '';
        var userlink = userlinkMatch ? userlinkMatch[1] : '0';

        if (!slug || !dataid) return null;

        // 设置DOM模拟
        if (typeof document === 'undefined' || !document.getElementById) {
            globalThis.document = {
                getElementById: function(id) {
                    if (id === 'nb-st') return { content: nbSt };
                    if (id === 'nb-plt') return { content: Date.now().toString() };
                    return null;
                }
            };
        } else {
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

        var wasmCfg = html.match(/id="wasm-cfg"[^>]*data-js="([^"]+)"[^>]*data-bg="([^"]+)"/);
        var jsPath = wasmCfg ? wasmCfg[1] : '/static/wasm/nbmovie_wasm.426511b7.js';
        var bgPath = wasmCfg ? wasmCfg[2] : '/static/wasm/nbmovie_wasm_bg.d5d51939.wasm';

        // 并行下载WASM二进制和JS包装器
        var wasmUrl = HOST + bgPath;
        var jsUrl = HOST + jsPath;

        var [wasmResp, jsResp] = await Promise.all([
            request(wasmUrl, { buffer: 2 }),
            request(jsUrl, { charset: 'utf-8' })
        ]);

        if (!wasmResp || !wasmResp.content) {
            console.error('WASM二进制获取失败');
            return;
        }
        if (!jsResp || !jsResp.content) {
            console.error('WASM JS获取失败');
            return;
        }

        // 编译WASM
        var wasmBuffer = wasmResp.content;
        var wasmModule = await WebAssembly.compile(wasmBuffer);

        // 动态执行JS包装器
        var jsCode = jsResp.content;
        jsCode = jsCode.replace(/import\.meta\.url/g, '"' + HOST + jsPath + '"');
        jsCode = jsCode.replace(/export\s+function\s+build_play_url/g, 'globalThis.__build_play_url = function');
        jsCode = jsCode.replace(/export\s*\{[^}]*__wbg_init\s+as\s+default[^}]*\}/g, function(match) {
            return 'globalThis.__wbg_init = __wbg_init; globalThis.__initSync = initSync;';
        });
        jsCode = jsCode.replace(/export\s*\{[^}]*\}/g, '');

        var fn = new Function(jsCode);
        fn();

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

// ========== 优化版解析：indexOf 定位 + 局部正则 ==========

function parseVideoListFromHtml(html, keyword) {
    var list = [], seen = {};
    var searchFrom = 0;
    var htmlLen = html.length;

    while (searchFrom < htmlLen) {
        // 用 indexOf 快速定位 '/play/' 链接
        var aIdx = html.indexOf('/play/', searchFrom);
        if (aIdx === -1) break;

        // 向前找 <a 标签
        var tagStart = html.lastIndexOf('<a ', aIdx);
        if (tagStart === -1 || aIdx - tagStart > 300) {
            searchFrom = aIdx + 6;
            continue;
        }

        // 向后找 </a>
        var tagEnd = html.indexOf('</a>', aIdx);
        if (tagEnd === -1) { searchFrom = aIdx + 6; continue; }

        // 跳过"相关推荐"区域
        var beforeBlock = html.substring(Math.max(0, tagStart - 200), tagStart);
        if (beforeBlock.includes('相关推荐')) {
            searchFrom = tagEnd + 4;
            continue;
        }

        var block = html.substring(tagStart, tagEnd + 4);

        // 提取 href 中的 playPath
        var hrefMatch = block.match(/href="(\/play\/[^"]+)"/);
        if (!hrefMatch) { searchFrom = tagEnd + 4; continue; }
        var playPath = hrefMatch[1];
        var slug = playPath.replace('/play/', '');
        if (seen[slug]) { searchFrom = tagEnd + 4; continue; }

        // 提取标题
        var title = '';
        var tm = block.match(/data-title="([^"]+)"/) || block.match(/alt="([^"]{2,})"/) || block.match(/title="([^"]{2,})"/);
        if (!tm) {
            var tx = block.replace(/<[^>]+>/g, '').trim();
            if (tx.length >= 2) title = cleanText(tx);
        } else {
            title = cleanText(tm[1]);
        }
        if (!title || title.length < 2) { searchFrom = tagEnd + 4; continue; }
        if (keyword && !isRelevant(title, keyword)) { searchFrom = tagEnd + 4; continue; }

        // 提取图片
        var pic = '';
        var im = block.match(/data-original="([^"]+)"/) || block.match(/data-src="([^"]+)"/) || block.match(/src="(https?:[^"]+)"/);
        if (im) pic = im[1];
        if (isBadPic(pic)) pic = '';

        // 提取备注
        var remarks = '';
        var rm = block.match(/(\d+(?:\.\d)?分|4[Kk]|1080[Pp]|HD|更新至\s*\d+|第\s*\d+\s*集)/);
        if (rm) remarks = rm[1];

        seen[slug] = true;
        list.push({ vod_id: playPath, vod_name: title, vod_pic: fixPicUrl(pic), vod_remarks: remarks });
        searchFrom = tagEnd + 4;
    }

    // 备用: /movie/ 格式
    if (list.length === 0) {
        var mFrom = 0;
        while (mFrom < htmlLen) {
            var mIdx = html.indexOf('/movie/', mFrom);
            if (mIdx === -1) break;
            var mEnd = html.indexOf('.html', mIdx);
            if (mEnd === -1 || mEnd - mIdx > 100) { mFrom = mIdx + 7; continue; }
            var mPath = html.substring(mIdx, mEnd + 5);
            var mId = mPath.replace('/movie/', '').replace('.html', '');
            if (seen[mId]) { mFrom = mEnd + 5; continue; }
            var around = html.substring(Math.max(0, mIdx - 200), Math.min(htmlLen, mIdx + 200));
            var mTitle = '';
            var mtMatch = around.match(/data-title="([^"]+)"/) || around.match(/alt="([^"]{2,})"/) || around.match(/>([^<]{2,})</);
            if (mtMatch) mTitle = cleanText(mtMatch[1]);
            if (!mTitle || mTitle.length < 2) { mFrom = mEnd + 5; continue; }
            if (keyword && !isRelevant(mTitle, keyword)) { mFrom = mEnd + 5; continue; }
            seen[mId] = true;
            list.push({ vod_id: mPath, vod_name: mTitle, vod_pic: '', vod_remarks: '' });
            mFrom = mEnd + 5;
        }
    }
    return list;
}

// ========== 优化版播放源解析：单轮扫描 ==========

function parsePlaySources(html, vodId) {
    var sources = {}, lineNames = {};
    var finalSources = [];

    // 提取线路名称
    var emMatch = html.match(/episodeManager\(\d+,\s*\d+,\s*\[([\s\S]*?)\]\)/);
    if (emMatch) {
        var lineRe = /lineName:\s*['"]([^'"]+)['"]/g, lm, idx = 1;
        while ((lm = lineRe.exec(emMatch[1])) !== null) { lineNames[String(idx)] = lm[1]; idx++; }
    }

    // 单轮扫描：用 indexOf 定位 data-episode 属性
    var pos = 0;
    var htmlLen = html.length;
    var marker = 'data-episode="';

    while (pos < htmlLen) {
        var epIdx = html.indexOf(marker, pos);
        if (epIdx === -1) break;

        // 向前找 <a 标签
        var tagStart = html.lastIndexOf('<a ', epIdx);
        if (tagStart === -1 || epIdx - tagStart > 500) { pos = epIdx + marker.length; continue; }

        var tagEndSelf = html.indexOf('>', epIdx);
        if (tagEndSelf === -1) { pos = epIdx + marker.length; continue; }
        var fullTag = html.substring(tagStart, tagEndSelf + 1);

        // 提取 data-episode
        var epValStart = epIdx + marker.length;
        var epValEnd = html.indexOf('"', epValStart);
        if (epValEnd === -1) { pos = epIdx + marker.length; continue; }
        var epNum = html.substring(epValStart, epValEnd);

        // 提取 href
        var hrefMatch = fullTag.match(/href="([^"]+)"/);
        if (!hrefMatch) { pos = tagEndSelf + 1; continue; }
        var epPath = hrefMatch[1];

        // 提取 data-line
        var lineMatch = fullTag.match(/data-line="(\d+)"/);
        var lineId = lineMatch ? lineMatch[1] : '1';

        // 提取 dataid
        var dataIdMatch = fullTag.match(/dataid="(\d+)"/);
        var dataId = dataIdMatch ? dataIdMatch[1] : '';

        // 提取集名
        var tagEndA = html.indexOf('</a>', tagStart);
        var tagContent = tagEndA !== -1 ? html.substring(tagStart, tagEndA + 4) : fullTag;
        var epTitle = '';
        var spanMatch = tagContent.match(/<span[^>]*>([^<]+)<\/span>/);
        if (spanMatch) epTitle = cleanText(spanMatch[1]);
        if (!epTitle) epTitle = '第' + epNum + '集';

        if (!sources[lineId]) {
            sources[lineId] = { name: lineNames[lineId] || (lineId === '1' ? '默认播放' : '线路' + lineId), episodes: [], seen: {} };
        }
        var src = sources[lineId];
        if (!src.seen[epPath]) {
            src.seen[epPath] = true;
            src.episodes.push({ name: epTitle, url: epPath, dataid: dataId, _idx: parseInt(epNum) || 0 });
        }
        pos = tagEndSelf + 1;
    }

    // 备用: handleEpisodeClick
    if (Object.keys(sources).length === 0) {
        var clickRe = /handleEpisodeClick\(\s*\$el\.getAttribute\('href'\)\s*,\s*'(\d+)'\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
        var tagMatch;
        while ((tagMatch = clickRe.exec(html)) !== null) {
            var dataId2 = tagMatch[1], lineId2 = tagMatch[2], epNum2 = tagMatch[3];
            var beforeClick = html.substring(Math.max(0, tagMatch.index - 200), tagMatch.index);
            var hrefInTag = beforeClick.match(/href="([^"]+)"\s*[^>]*@click/);
            if (!hrefInTag) continue;
            var epPath2 = hrefInTag[1];
            if (!sources[lineId2]) sources[lineId2] = { name: lineNames[lineId2] || '默认播放', episodes: [], seen: {} };
            if (sources[lineId2].seen[epPath2]) continue;
            sources[lineId2].seen[epPath2] = true;
            sources[lineId2].episodes.push({ name: '第' + epNum2 + '集', url: epPath2, dataid: dataId2, _idx: parseInt(epNum2) || 0 });
        }
    }

    // 备用: /v_play/ 格式
    if (Object.keys(sources).length === 0) {
        var vpFrom = 0;
        var vpMarker = '/v_play/';
        while (vpFrom < htmlLen) {
            var vpIdx = html.indexOf(vpMarker, vpFrom);
            if (vpIdx === -1) break;
            var vpEnd = html.indexOf('.html', vpIdx);
            if (vpEnd === -1 || vpEnd - vpIdx > 200) { vpFrom = vpIdx + vpMarker.length; continue; }
            var vpPath = html.substring(vpIdx, vpEnd + 5);
            var vpAEnd = html.indexOf('</a>', vpEnd);
            var vpText = vpAEnd !== -1 ? html.substring(vpEnd + 5, vpAEnd).replace(/<[^>]+>/g, '').trim() : '';
            if (!vpText) { vpFrom = vpEnd + 5; continue; }
            if (!sources['1']) sources['1'] = { name: '默认播放', episodes: [], seen: {} };
            if (!sources['1'].seen[vpPath]) {
                sources['1'].seen[vpPath] = true;
                sources['1'].episodes.push({ name: cleanText(vpText), url: vpPath, dataid: '', _idx: sources['1'].episodes.length });
            }
            vpFrom = vpEnd + 5;
        }
    }

    for (var lid in sources) {
        var s = sources[lid];
        s.episodes.sort(function(a, b) { return a._idx - b._idx; });
        finalSources.push({ name: s.name, episodes: s.episodes.map(function(ep) { return { name: ep.name, url: ep.url, dataid: ep.dataid }; }) });
    }

    if (finalSources.length === 0) {
        var currentSlug = (vodId || '').replace(/^\/play\//, '');
        finalSources.push({ name: '默认播放', episodes: [{ name: '正片', url: '/play/' + currentSlug, dataid: '' }] });
    }
    return finalSources;
}

// ========== HTTP请求 ==========

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
