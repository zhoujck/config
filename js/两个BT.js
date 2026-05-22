/*
title: '两个BT', author: 'v2.0.0'
FongMi JS Spider - 重写版，改进HTML解析
*/

var HOST = 'https://www.bttwo.me';
var MOBILE_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
var DefHeader = {
    'User-Agent': MOBILE_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Referer': 'https://www.bttwo.me/'
};

var PAGE_LIMIT = 20;

// ========== 筛选配置 ==========
var CLASS_LIST = [
    {type_id: 'movie', type_name: '电影'},
    {type_id: 'tv', type_name: '电视剧'},
    {type_id: 'anime', type_name: '动漫'},
    {type_id: 'variety', type_name: '综艺'}
];

function mv(items) {
    var r = [{name: '全部', value: ''}];
    for (var i = 0; i < items.length; i++) r.push({name: items[i][1], value: items[i][0]});
    return r;
}

var FILTERS = {};
var FL = [
    {key: 'areas', name: '地区', value: mv([['52','中国大陆'],['5','美国'],['12','韩国'],['11','日本'],['14','中国香港'],['21','中国台湾'],['30','英国'],['33','泰国'],['34','印度'],['78','其他']])},
    {key: 'types', name: '类型', value: mv([['1','剧情'],['5','喜剧'],['10','动作'],['6','爱情'],['14','科幻'],['3','恐怖'],['2','悬疑'],['4','惊悚'],['9','犯罪'],['11','动画'],['12','奇幻'],['18','冒险'],['27','古装'],['31','武侠']])},
    {key: 'years', name: '年份', value: mv([['1','2026'],['3','2025'],['4','2024'],['56','2023'],['13','2022'],['2','2021'],['6','2020'],['8','2019'],['9','2018']])},
    {key: 'tags', name: '标签', value: mv([['1','4K'],['36','院线']])},
    {key: 'sort', name: '排序', value: [{name:'最新上映',value:'update_time:desc'},{name:'最受欢迎',value:'hits:desc'},{name:'评分最高',value:'score:desc'}]}
];
for (var ci = 0; ci < CLASS_LIST.length; ci++) FILTERS[CLASS_LIST[ci].type_id] = FL;

var CBF = {movie:{classify:'1'},tv:{classify:'2'},anime:{classify:'3'},variety:{classify:'4'}};

// ========== 工具函数 ==========

function fixPic(u) {
    if (!u) return '';
    if (u.indexOf('http') === 0) return u;
    if (u.indexOf('//') === 0) return 'https:' + u;
    if (u.charAt(0) === '/') return HOST + u;
    return HOST + '/' + u;
}

function isBadPic(u) {
    if (!u) return true;
    return u.indexOf('placeholder') >= 0 || u.indexOf('blank.gif') >= 0 || u.indexOf('base64') >= 0 || u.indexOf('favicon') >= 0;
}

function clean(t) {
    return (t || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o || {}, k); }

function appendQ(url, params) {
    var parts = [];
    for (var k in params) {
        if (hasOwn(params, k) && params[k] !== undefined && params[k] !== null && params[k] !== '') {
            parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(params[k])));
        }
    }
    if (parts.length === 0) return url;
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + parts.join('&');
}

function safeJSON(s) { try { return JSON.parse(s); } catch(e) { return null; } }

function relevant(title, kw) {
    if (!title || !kw) return false;
    var tl = title.toLowerCase(), kl = kw.toLowerCase();
    if (tl.indexOf(kl) >= 0) return true;
    var sc = {}, tc = {};
    kl.replace(/\s/g,'').split('').forEach(function(c){sc[c]=1;});
    tl.replace(/\s/g,'').split('').forEach(function(c){tc[c]=1;});
    var si = 0;
    for (var c in sc) { if (tc[c]) si++; }
    var sl = Object.keys(sc).length;
    if (sl > 0 && si / sl >= 0.6) return true;
    if (kl.length <= 2) return tl.indexOf(kl) >= 0;
    return false;
}

// ========== 核心：HTML 解析 ==========
// FongMi 没有 cheerio，用正则 + 字符串匹配

function extractVideoList(html, keyword) {
    var list = [];
    var seen = {};

    // 策略1: 匹配 <a href="/play/SLUG">...</a> 格式
    // 匹配所有 a 标签中 href 包含 /play/ 的
    var re1 = /<a\s[^>]*href\s*=\s*["']\/play\/([^"'\/\s?#]+)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    var m;
    while ((m = re1.exec(html)) !== null) {
        var vid = m[1];
        if (seen[vid]) continue;
        var inner = m[2];
        // 提取标题：从 inner 文本或 title/alt 属性
        var title = extractTitle(inner, m[0]);
        if (!title || title.length <= 1) continue;
        if (keyword && !relevant(title, keyword)) continue;
        seen[vid] = true;

        // 从周围上下文提取图片
        var ctx = html.substring(Math.max(0, m.index - 1000), m.index + m[0].length + 500);
        var pic = extractPic(ctx);

        // 提取备注
        var rem = extractRemark(ctx);

        list.push({vod_id: vid, vod_name: title, vod_pic: fixPic(pic), vod_remarks: rem});
    }

    // 策略2: 匹配 <a href="/movie/ID.html">...</a> 格式
    if (list.length === 0) {
        var re2 = /<a\s[^>]*href\s*=\s*["']\/movie\/(\d+)\.html["'][^>]*>([\s\S]*?)<\/a>/gi;
        while ((m = re2.exec(html)) !== null) {
            var mid = m[1];
            if (seen[mid]) continue;
            var mtitle = extractTitle(m[2], m[0]);
            if (!mtitle || mtitle.length <= 1) continue;
            if (keyword && !relevant(mtitle, keyword)) continue;
            seen[mid] = true;

            var mctx = html.substring(Math.max(0, m.index - 1000), m.index + m[0].length + 500);
            var mpic = extractPic(mctx);
            var mrem = extractRemark(mctx);

            list.push({vod_id: mid, vod_name: mtitle, vod_pic: fixPic(mpic), vod_remarks: mrem});
        }
    }

    // 策略3: 更宽泛的匹配 - 任何包含 /play/ 或 /movie/ 的 a 标签
    if (list.length === 0) {
        var re3 = /<a\s[^>]*href\s*=\s*["']([^"']*(?:\/play\/|\/movie\/)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
        while ((m = re3.exec(html)) !== null) {
            var href = m[1];
            var slug = '';
            var slugMatch = href.match(/\/play\/([^\/\s?"']+)/);
            if (slugMatch) slug = slugMatch[1];
            else {
                var idMatch = href.match(/\/movie\/(\d+)\.html/);
                if (idMatch) slug = idMatch[1];
            }
            if (!slug || seen[slug]) continue;

            var stitle = extractTitle(m[2], m[0]);
            if (!stitle || stitle.length <= 1) continue;
            if (keyword && !relevant(stitle, keyword)) continue;
            seen[slug] = true;

            var sctx = html.substring(Math.max(0, m.index - 1000), m.index + m[0].length + 500);
            var spic = extractPic(sctx);
            var srem = extractRemark(sctx);

            list.push({vod_id: slug, vod_name: stitle, vod_pic: fixPic(spic), vod_remarks: srem});
        }
    }

    return list;
}

function extractTitle(inner, fullTag) {
    // 从 inner 文本提取
    var t = clean(inner.replace(/<[^>]*>/g, ''));
    if (t && t.length > 1) return t;

    // 从 title 属性
    var tm = fullTag.match(/title\s*=\s*["']([^"']+)["']/);
    if (tm && tm[1].length > 1) return clean(tm[1]);

    // 从 alt 属性
    var am = fullTag.match(/alt\s*=\s*["']([^"']+)["']/);
    if (am && am[1].length > 1) return clean(am[1]);

    // 从 data-title 属性
    var dm = fullTag.match(/data-title\s*=\s*["']([^"']+)["']/);
    if (dm && dm[1].length > 1) return clean(dm[1]);

    return '';
}

function extractPic(ctx) {
    // 按优先级匹配图片
    var patterns = [
        /data-original\s*=\s*["']([^"']+)["']/,
        /data-src\s*=\s*["']([^"']+)["']/,
        /data-lazy\s*=\s*["']([^"']+)["']/,
        /src\s*=\s*["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i
    ];
    for (var i = 0; i < patterns.length; i++) {
        var match = ctx.match(patterns[i]);
        if (match && !isBadPic(match[1])) return match[1];
    }
    return '';
}

function extractRemark(ctx) {
    var m = ctx.match(/(4[Kk]|1080[Pp]|HD|更新至\s*\d+|第\s*\d+\s*集|\d+(?:\.\d)?分)/);
    return m ? m[1] : '';
}

// ========== 播放源解析 ==========

function parsePlaySources(html, vodId) {
    var sourceMap = {};

    // 新格式: /play/slug - 带 data-episode / data-line / dataid 属性
    var re1 = /<a\s[^>]*href\s*=\s*["']\/play\/([^"'\/\s?#]+)["'][^>]*>/gi;
    var m;
    while ((m = re1.exec(html)) !== null) {
        var fullTag = m[0];
        var slug = m[1];
        var epMatch = fullTag.match(/data-episode\s*=\s*["'](\d*)["']/);
        var lineMatch = fullTag.match(/data-line\s*=\s*["'](\d*)["']/);
        var idMatch = fullTag.match(/dataid\s*=\s*["']([^"']*)["']/);

        var episode = epMatch ? epMatch[1] : '';
        var lineId = (lineMatch ? lineMatch[1] : '') || '1';
        var dataId = idMatch ? idMatch[1] : '';

        // 获取链接文本
        var endIdx = html.indexOf('</a>', m.index);
        var innerHtml = endIdx > m.index ? html.substring(m.index + m[0].length, endIdx) : '';
        var epTitle = clean(innerHtml.replace(/<[^>]*>/g, ''));
        if (/^\d+$/.test(epTitle)) epTitle = '第' + epTitle + '集';
        if (!epTitle) epTitle = episode ? '第' + episode + '集' : '正片';

        var playId = '/play/' + slug;
        var fid = dataId || (vodId + '#' + lineId + '#' + (episode || '0'));

        if (!sourceMap[lineId]) sourceMap[lineId] = {name: lineId === '1' ? '默认播放' : '线路' + lineId, eps: [], seen: {}};
        if (!sourceMap[lineId].seen[fid]) {
            sourceMap[lineId].seen[fid] = true;
            sourceMap[lineId].eps.push({name: epTitle, pid: playId, idx: parseInt(episode) || sourceMap[lineId].eps.length});
        }
    }

    // 旧格式: /v_play/id.html
    var re2 = /<a\s[^>]*href\s*=\s*["']\/v_play\/([^.]+)\.html["'][^>]*>([\s\S]*?)<\/a>/gi;
    while ((m = re2.exec(html)) !== null) {
        var pid = m[1];
        var vt = clean(m[2].replace(/<[^>]*>/g, ''));
        if (!pid || !vt) continue;
        if (!sourceMap['1']) sourceMap['1'] = {name: '默认播放', eps: [], seen: {}};
        if (!sourceMap['1'].seen[pid]) {
            sourceMap['1'].seen[pid] = true;
            sourceMap['1'].eps.push({name: vt, pid: pid, idx: sourceMap['1'].eps.length});
        }
    }

    // 构建结果
    var result = [];
    var keys = Object.keys(sourceMap).sort(function(a,b){return (parseInt(a)||999)-(parseInt(b)||999);});
    for (var i = 0; i < keys.length; i++) {
        var src = sourceMap[keys[i]];
        src.eps.sort(function(a,b){return a.idx - b.idx;});
        var epStr = src.eps.map(function(e){return e.name + '$' + e.pid;}).join('#');
        result.push({name: src.name, episodes: epStr});
    }

    if (result.length === 0) {
        result.push({name: '默认播放', episodes: '正片$' + vodId});
    }

    return result;
}

// ========== 详情页字段提取 ==========

function getDetailField(html, label) {
    // div 结构: <div>标签</div><div>值</div>
    var re = new RegExp('<div[^>]*>\\s*' + label + '\\s*<\\/div>\\s*<div[^>]*>([\\s\\S]*?)<\\/div>', 'i');
    var m = html.match(re);
    if (m) {
        var t = clean(m[1].replace(/<[^>]*>/g, ''));
        if (t) return t;
    }
    // li/span: 标签：值
    var re2 = new RegExp(label + '[：:]?\\s*([^<]+)', 'i');
    var m2 = html.match(re2);
    if (m2) {
        var t2 = clean(m2[1]);
        if (t2 && t2 !== label) return t2;
    }
    return '';
}

// ========== 分类URL构建 ==========

function buildUrl(tid, pg, ext) {
    var ts = String(tid || 'movie');
    var q = {};
    var bf = CBF[ts];
    if (bf) { for (var k in bf) q[k] = bf[k]; }
    else if (/^\d+$/.test(ts)) q.classify = ts;
    else q.classify = '1';

    var fm = {classify:['classify'],areas:['areas','area'],types:['types','type','class'],years:['years','year'],tags:['tags','tag']};
    for (var tk in fm) {
        var sks = fm[tk];
        for (var i = 0; i < sks.length; i++) {
            if (hasOwn(ext, sks[i]) && ext[sks[i]] !== '' && ext[sks[i]] !== undefined && ext[sks[i]] !== null) {
                q[tk] = String(ext[sks[i]]);
                break;
            }
        }
    }

    if (hasOwn(ext, 'sort') || hasOwn(ext, 'by')) {
        var rs = String(ext.sort || ext.by || '');
        if (rs) {
            var parts = rs.split(/[:|,]/);
            q.sort_by = parts[0];
            if (parts[1]) q.order = parts[1];
        }
    }
    if (hasOwn(ext, 'sort_by')) { q.sort_by = String(ext.sort_by); q.order = String(ext.order || 'desc'); }

    if (pg > 1) q.page = String(pg);

    return appendQ(HOST + '/filter', q);
}

// ========== 请求 ==========

async function reqUrl(url, headers) {
    try {
        var res = await req(url, {
            method: 'get',
            headers: headers || DefHeader,
            timeout: 15000
        });
        return (res && res.content) ? res.content : '';
    } catch(e) {
        console.error('请求失败: ' + url + ' - ' + e.message);
        return '';
    }
}

// ========== 接口实现 ==========

async function init(cfg) {}

async function home(filter) {
    try {
        var html = await reqUrl(HOST);
        if (!html) {
            console.error('首页返回空内容，可能是网站无法访问或被反爬拦截');
            return JSON.stringify({class: CLASS_LIST, filters: FILTERS, list: []});
        }
        var list = extractVideoList(html);
        console.log('首页获取到 ' + list.length + ' 个项目');
        return JSON.stringify({class: CLASS_LIST, filters: FILTERS, list: list});
    } catch(e) {
        console.error('首页获取失败: ' + e.message);
        return JSON.stringify({class: CLASS_LIST, filters: FILTERS, list: []});
    }
}

async function homeVod() {
    try {
        var html = await reqUrl(HOST);
        var list = extractVideoList(html);
        return JSON.stringify({list: list});
    } catch(e) {
        return JSON.stringify({list: []});
    }
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10) || 1;
        // 合并 filter 和 extend
        var ext = {};
        if (filter && typeof filter === 'object') { for (var k in filter) ext[k] = filter[k]; }
        if (extend && typeof extend === 'object') { for (var k2 in extend) ext[k2] = extend[k2]; }

        var url = buildUrl(tid, pg, ext);
        console.log('分类URL: ' + url);
        var html = await reqUrl(url);
        var list = extractVideoList(html);

        return JSON.stringify({
            list: list,
            page: pg,
            pagecount: list.length >= PAGE_LIMIT ? pg + 1 : pg,
            limit: PAGE_LIMIT,
            total: 99999
        });
    } catch(e) {
        console.error('分类获取失败: ' + e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0});
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10) || 1;
        var url = HOST + '/search?q=' + encodeURIComponent(wd);
        if (pg > 1) url += '&page=' + pg;
        console.log('搜索URL: ' + url);
        var html = await reqUrl(url);
        var list = extractVideoList(html, wd);
        console.log('搜索 "' + wd + '" 找到 ' + list.length + ' 个结果');
        return JSON.stringify({list: list, page: pg, pagecount: list.length >= PAGE_LIMIT ? pg + 1 : pg});
    } catch(e) {
        console.error('搜索失败: ' + e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0});
    }
}

async function detail(id) {
    try {
        var vid = String(id || '');
        var url;

        if (vid.indexOf('/play/') === 0 || vid.indexOf('/movie/') === 0) url = HOST + vid;
        else if (vid.indexOf('play/') === 0 || vid.indexOf('movie/') === 0) url = HOST + '/' + vid;
        else if (vid.indexOf('http') === 0) url = vid;
        else if (/^\d+$/.test(vid)) url = HOST + '/movie/' + vid + '.html';
        else url = HOST + '/play/' + vid;

        console.log('详情URL: ' + url);
        var html = await reqUrl(url);
        if (!html) return JSON.stringify({list: []});

        // 提取标题
        var title = '';
        var tm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || html.match(/<title[^>]*>([\s\S]*?)<\/title>/);
        if (tm) title = clean(tm[1].replace(/<[^>]*>/g, ''));

        // 提取图片
        var pic = '';
        var pm = html.match(/data-poster\s*=\s*["']([^"']+)["']/) ||
            html.match(/class\s*=\s*["'][^"']*poster[^"']*["'][^>]*>[\s\S]*?<img[^>]+src\s*=\s*["']([^"']+)["']/) ||
            html.match(/<img[^>]+(?:data-original|data-src|src)\s*=\s*["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
        if (pm && !isBadPic(pm[1])) pic = pm[1];

        // 提取简介
        var desc = '';
        var dm = html.match(/剧情简介[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) ||
            html.match(/class\s*=\s*["'][^"']*intro[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
            html.match(/class\s*=\s*["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        if (dm) desc = clean(dm[1].replace(/<[^>]*>/g, ''));

        var actor = getDetailField(html, '主演');
        var director = getDetailField(html, '导演');

        // 解析播放源
        var playSources = parsePlaySources(html, vid);
        var playFrom = playSources.map(function(s){return s.name;}).join('$$$');
        var playUrl = playSources.map(function(s){return s.episodes;}).join('$$$');

        var vod = {
            vod_id: vid, vod_name: title || '未知标题', vod_pic: fixPic(pic),
            type_name: '', vod_year: '', vod_area: '', vod_remarks: '',
            vod_actor: actor, vod_director: director, vod_content: desc,
            vod_play_from: playFrom, vod_play_url: playUrl
        };
        return JSON.stringify({list: [vod]});
    } catch(e) {
        console.error('详情获取失败: ' + e.message);
        return JSON.stringify({list: []});
    }
}

async function play(flag, id, flags) {
    try {
        var purl = String(id || '');
        if (purl.indexOf('/play/') === 0 || purl.indexOf('play/') === 0) {
            if (purl.charAt(0) !== '/') purl = '/' + purl;
            purl = HOST + purl;
        } else if (purl.indexOf('/v_play/') === 0 || purl.indexOf('v_play/') === 0) {
            if (purl.charAt(0) !== '/') purl = '/' + purl;
            purl = HOST + purl;
        } else if (purl.indexOf('http') !== 0 && purl.charAt(0) !== '/') {
            purl = HOST + '/play/' + purl;
        }
        return JSON.stringify({parse: 1, playUrl: '', url: purl, header: DefHeader});
    } catch(e) {
        return JSON.stringify({parse: 1, playUrl: '', url: HOST + '/play/' + id, header: DefHeader});
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
