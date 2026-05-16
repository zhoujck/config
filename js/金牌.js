/*
title: '金牌app', author: '梦/v1.1.3'
*/
var HOST;
const MOBILE_UA = "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36";
const APP_KEY = "cb808529bae6b6be45ecfab29a4889bc";
var DefHeader = {'User-Agent': MOBILE_UA};
var KParams = {
    headers: {'User-Agent': MOBILE_UA},
    timeout: 20000
};

const CLASS_NAME_MAP = {
    typeList: ['type', '类型'],
    plotList: ['class', '剧情'],
    districtList: ['area', '地区'],
    languageList: ['lang', '语言'],
    yearList: ['year', '年份'],
    serialList: ['by', '排序']
};

const SORT_VALUES = [
    {name: '最近更新', value: '1'},
    {name: '添加时间', value: '2'},
    {name: '人气高低', value: '3'},
    {name: '评分高低', value: '4'}
];

// ========== Crypto helpers (MD5 + SHA1, no external deps) ==========

function safeAdd(x, y) {
    var lsw = (x & 0xffff) + (y & 0xffff);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
}

function bitRotateLeft(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
}

function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

function md51(s) {
    var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i = 64; i <= n; i += 64) {
        md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) { md5cycle(state, tail); tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
}

function md5blk(s) {
    var md5blks = [], i;
    for (i = 0; i < 64; i += 4) {
        md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i+1) << 8) + (s.charCodeAt(i+2) << 16) + (s.charCodeAt(i+3) << 24);
    }
    return md5blks;
}

var S11=7, S12=12, S13=17, S14=22, S21=5, S22=9, S23=14, S24=20, S31=4, S32=11, S33=16, S34=23, S41=6, S42=10, S43=15, S44=21;

function md5cycle(x, k) {
    var a=x[0],b=x[1],c=x[2],d=x[3];
    a=md5ff(a,b,c,d,k[0],S11,-680876936);d=md5ff(d,a,b,c,k[1],S12,-389564586);c=md5ff(c,d,a,b,k[2],S13,606105819);b=md5ff(b,c,d,a,k[3],S14,-1044525330);
    a=md5ff(a,b,c,d,k[4],S11,-176418897);d=md5ff(d,a,b,c,k[5],S12,1200080426);c=md5ff(c,d,a,b,k[6],S13,-1473231341);b=md5ff(b,c,d,a,k[7],S14,-45705983);
    a=md5ff(a,b,c,d,k[8],S11,1770035416);d=md5ff(d,a,b,c,k[9],S12,-1958414417);c=md5ff(c,d,a,b,k[10],S13,-42063);b=md5ff(b,c,d,a,k[11],S14,-1990404162);
    a=md5ff(a,b,c,d,k[12],S11,1804603682);d=md5ff(d,a,b,c,k[13],S12,-40341101);c=md5ff(c,d,a,b,k[14],S13,-1502002290);b=md5ff(b,c,d,a,k[15],S14,1236535329);
    a=md5gg(a,b,c,d,k[1],S21,-165796510);d=md5gg(d,a,b,c,k[6],S22,-1069501632);c=md5gg(c,d,a,b,k[11],S23,643717713);b=md5gg(b,c,d,a,k[0],S24,-373897302);
    a=md5gg(a,b,c,d,k[5],S21,-701558691);d=md5gg(d,a,b,c,k[10],S22,38016083);c=md5gg(c,d,a,b,k[15],S23,-660478335);b=md5gg(b,c,d,a,k[4],S24,-405537848);
    a=md5gg(a,b,c,d,k[9],S21,568446438);d=md5gg(d,a,b,c,k[14],S22,-1019803690);c=md5gg(c,d,a,b,k[3],S23,-187363961);b=md5gg(b,c,d,a,k[8],S24,1163531501);
    a=md5gg(a,b,c,d,k[13],S21,-1444681467);d=md5gg(d,a,b,c,k[2],S22,-51403784);c=md5gg(c,d,a,b,k[7],S23,1735328473);b=md5gg(b,c,d,a,k[12],S24,-1926607734);
    a=md5hh(a,b,c,d,k[5],S31,-378558);d=md5hh(d,a,b,c,k[8],S32,-2022574463);c=md5hh(c,d,a,b,k[11],S33,1839030562);b=md5hh(b,c,d,a,k[14],S34,-35309556);
    a=md5hh(a,b,c,d,k[1],S31,-1530992060);d=md5hh(d,a,b,c,k[4],S32,1272893353);c=md5hh(c,d,a,b,k[7],S33,-155497632);b=md5hh(b,c,d,a,k[10],S34,-1094730640);
    a=md5hh(a,b,c,d,k[13],S31,681279174);d=md5hh(d,a,b,c,k[0],S22,-358537222);c=md5hh(c,d,a,b,k[3],S33,-722521979);b=md5hh(b,c,d,a,k[6],S34,76029189);
    a=md5hh(a,b,c,d,k[9],S31,-640364487);d=md5hh(d,a,b,c,k[12],S32,-421815835);c=md5hh(c,d,a,b,k[15],S33,530742520);b=md5hh(b,c,d,a,k[2],S34,-995338651);
    a=md5ii(a,b,c,d,k[0],S41,-198630844);d=md5ii(d,a,b,c,k[7],S42,1126891415);c=md5ii(c,d,a,b,k[14],S43,-1416354905);b=md5ii(b,c,d,a,k[5],S44,-57434055);
    a=md5ii(a,b,c,d,k[12],S41,1700485571);d=md5ii(d,a,b,c,k[3],S42,-1894986606);c=md5ii(c,d,a,b,k[10],S43,-1051523);b=md5ii(b,c,d,a,k[1],S44,-2054922799);
    a=md5ii(a,b,c,d,k[8],S41,1873313359);d=md5ii(d,a,b,c,k[15],S42,-30611744);c=md5ii(c,d,a,b,k[6],S43,-1560198380);b=md5ii(b,c,d,a,k[13],S44,1309151649);
    a=md5ii(a,b,c,d,k[4],S41,-145523070);d=md5ii(d,a,b,c,k[11],S42,-1120210379);c=md5ii(c,d,a,b,k[2],S43,718787259);b=md5ii(b,c,d,a,k[9],S44,-343485551);
    x[0]=safeAdd(a,x[0]);x[1]=safeAdd(b,x[1]);x[2]=safeAdd(c,x[2]);x[3]=safeAdd(d,x[3]);
}

function md5(s) {
    var h = md51(s);
    var hex = '0123456789abcdef', r = '';
    for (var i = 0; i < 16; i++) {
        var v = h[i >> 2] >>> ((i % 4) * 8);
        r += hex.charAt((v >>> 4) & 0x0f) + hex.charAt(v & 0x0f);
    }
    return r;
}

function sha1(s) {
    var h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
    var i, j, t, W = new Array(80);
    var n = s.length;
    var wa = [];
    for (i = 0; i < n - 3; i += 4) wa.push(s.charCodeAt(i)<<24|s.charCodeAt(i+1)<<16|s.charCodeAt(i+2)<<8|s.charCodeAt(i+3));
    switch (n % 4) {
        case 0: i = 0x080000000; break;
        case 1: i = s.charCodeAt(n-1)<<24|0x0800000; break;
        case 2: i = s.charCodeAt(n-2)<<24|s.charCodeAt(n-1)<<16|0x08000; break;
        case 3: i = s.charCodeAt(n-3)<<24|s.charCodeAt(n-2)<<16|s.charCodeAt(n-1)<<8|0x80; break;
    }
    wa.push(i);
    while (wa.length % 16 !== 14) wa.push(0);
    wa.push(n >>> 29); wa.push((n << 3) & 0x0ffffffff);
    for (j = 0; j < wa.length; j += 16) {
        for (i = 0; i < 16; i++) W[i] = wa[j + i];
        for (i = 16; i < 80; i++) W[i] = bitRotateLeft(W[i-3]^W[i-8]^W[i-14]^W[i-16],1);
        var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4];
        for (i = 0; i < 80; i++) {
            if (i < 20) { t = ((b & c) | (~b & d)) + 0x5A827999; }
            else if (i < 40) { t = (b ^ c ^ d) + 0x6ED9EBA1; }
            else if (i < 60) { t = ((b & c) | (b & d) | (c & d)) + 0x8F1BBCDC; }
            else { t = (b ^ c ^ d) + 0xCA62C1D6; }
            t = safeAdd(safeAdd(bitRotateLeft(a, 5), t), safeAdd(e, W[i]));
            e = d; d = c; c = bitRotateLeft(b, 30); b = a; a = t;
        }
        h[0] = safeAdd(a, h[0]); h[1] = safeAdd(b, h[1]); h[2] = safeAdd(c, h[2]);
        h[3] = safeAdd(d, h[3]); h[4] = safeAdd(e, h[4]);
    }
    var hex = '0123456789abcdef', r = '';
    for (i = 0; i < 5; i++) {
        for (j = 0; j < 4; j++) {
            var v = h[i] >>> (24 - j * 8);
            r += hex.charAt((v >>> 4) & 0x0f) + hex.charAt(v & 0x0f);
        }
    }
    return r;
}

// ========== API helpers ==========

function objToForm(obj) {
    return Object.keys(obj).filter(function(k) { return obj[k] !== undefined && obj[k] !== null && obj[k] !== ''; })
        .map(function(k) { return k + '=' + obj[k]; }).join('&');
}

function getSignedHeaders(obj) {
    var t = String(Date.now());
    var signObj = {};
    for (var k in obj) { if (obj.hasOwnProperty(k)) signObj[k] = obj[k]; }
    signObj['key'] = APP_KEY;
    signObj['t'] = t;
    var objStr = objToForm(signObj);
    var md5Hash = md5(objStr);
    var sign = sha1(md5Hash);
    var headers = {};
    for (var h in DefHeader) { if (DefHeader.hasOwnProperty(h)) headers[h] = DefHeader[h]; }
    headers['Referer'] = HOST + '/';
    headers['t'] = t;
    headers['sign'] = sign;
    return headers;
}

function stripHtml(value) {
    return String(value == null ? '' : value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapVod(v) {
    var pubdate = String(v.vodPubdate || '');
    var year = pubdate ? pubdate.split('-')[0] : '';
    var remarks = [String(v.vodRemarks || '').trim(), String(v.vodDoubanScore || '').trim()].filter(Boolean).join('_');
    return {
        vod_id: String(v.vodId || ''),
        vod_name: String(v.vodName || ''),
        vod_pic: String(v.vodPic || ''),
        vod_remarks: remarks,
        vod_year: year,
        type_id: String(v.typeId || ''),
        type_name: String(v.typeName || '')
    };
}

// ========== Core functions ==========

async function init(cfg) {
    try {
        var host = cfg.ext?.host?.trim() || 'https://m.jiabaide.cn';
        HOST = host.replace(/\/$/, '');
        KParams.headers['Referer'] = HOST + '/';
        var parseTimeout = parseInt(cfg.ext?.timeout?.trim(), 10);
        KParams.timeout = parseTimeout > 0 ? parseTimeout : 20000;
        var batchPathList = [
            '/api/mw-movie/anonymous/get/filer/type',
            '/api/mw-movie/anonymous/v1/get/filer/list'
        ];
        KParams.resObjList = await Promise.all(
            batchPathList.map(async function(path) {
                try {
                    var signedHeaders = getSignedHeaders({});
                    return safeParseJSON(await request(HOST + path, {headers: signedHeaders}));
                } catch (sErr) { return null; }
            })
        );
        var typeRes = KParams.resObjList[0];
        KParams.classes = [];
        if (typeRes && Array.isArray(typeRes.data)) {
            typeRes.data.forEach(function(item) {
                KParams.classes.push({
                    type_id: String(item.typeId),
                    type_name: String(item.typeName)
                });
            });
        }
        var filterRes = KParams.resObjList[1];
        KParams.filters = {};
        var fDataObj = (filterRes && filterRes.data) ? filterRes.data : {};
        KParams.classes.forEach(function(cls) {
            var tid = cls.type_id;
            KParams.filters[tid] = [];
            var mapKeys = Object.keys(CLASS_NAME_MAP);
            for (var mi = 0; mi < mapKeys.length; mi++) {
                var rawKey = mapKeys[mi];
                var key = CLASS_NAME_MAP[rawKey][0];
                var name = CLASS_NAME_MAP[rawKey][1];
                var values = [{name: '全部', value: ''}];
                if (rawKey === 'serialList') {
                    SORT_VALUES.forEach(function(sv) { values.push({name: sv.name, value: sv.value}); });
                } else {
                    var items = ((fDataObj || {})[tid] || {})[rawKey] || [];
                    items.forEach(function(it) {
                        if (rawKey === 'typeList') {
                            values.push({name: String(it.itemText || ''), value: String(it.itemValue || '')});
                        } else {
                            values.push({name: String(it.itemText || ''), value: String(it.itemText || '')});
                        }
                    });
                }
                if (values.length > 1) {
                    KParams.filters[tid].push({key: key, name: name, value: values});
                }
            }
        });
    } catch(e) {
        console.error('初始化参数失败：', e.message);
    }
}

async function home(filter) {
    try {
        var classes = KParams.classes || [];
        var filters = KParams.filters || {};
        var signedHeaders = getSignedHeaders({});
        var homeRes = safeParseJSON(await request(HOST + '/api/mw-movie/anonymous/home/hotSearch', {headers: signedHeaders}));
        var homeArr = Array.isArray(homeRes?.data) ? homeRes.data : [];
        var VODS = homeArr.map(function(v) { return mapVod(v); });
        return JSON.stringify({
            class: classes,
            filters: filters,
            list: VODS
        });
    } catch (e) {
        console.error('首页获取失败：', e.message);
        return JSON.stringify({class: [], filters: {}, list: []});
    }
}

async function homeVod() {
    try {
        var signedHeaders = getSignedHeaders({});
        var homeRes = safeParseJSON(await request(HOST + '/api/mw-movie/anonymous/home/hotSearch', {headers: signedHeaders}));
        var homeArr = Array.isArray(homeRes?.data) ? homeRes.data : [];
        var VODS = homeArr.map(function(v) { return mapVod(v); });
        return JSON.stringify({list: VODS});
    } catch (e) {
        console.error('推荐页获取失败：', e.message);
        return JSON.stringify({list: []});
    }
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;
        var body = {
            area: extend?.area || '',
            lang: extend?.lang || '',
            pageNum: String(pg),
            pageSize: '30',
            sort: extend?.by || '1',
            sortBy: '1',
            type: extend?.type || '',
            type1: tid,
            v_class: extend?.class || '',
            year: extend?.year || ''
        };
        var qs = objToForm(body);
        var signedHeaders = getSignedHeaders(body);
        var cateUrl = HOST + '/api/mw-movie/anonymous/video/list' + (qs ? '?' + qs : '');
        var resObj = safeParseJSON(await request(cateUrl, {headers: signedHeaders}));
        var cateArr = ((((resObj || {}).data || {}).list)) || [];
        var VODS = cateArr.map(function(v) { return mapVod(v); });
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: pg + (VODS.length >= 30 ? 1 : 0),
            limit: 30,
            total: pg * 30 + (VODS.length >= 30 ? 1 : 0)
        });
    } catch (e) {
        console.error('类别页获取失败：', e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: 30, total: 0});
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;
        var body = {keyword: wd, pageNum: String(pg), pageSize: '30'};
        var qs = objToForm(body);
        var signedHeaders = getSignedHeaders(body);
        var searchUrl = HOST + '/api/mw-movie/anonymous/video/searchByWordPageable' + (qs ? '?' + qs : '');
        var resObj = safeParseJSON(await request(searchUrl, {headers: signedHeaders}));
        var searchArr = ((((resObj || {}).data || {}).list)) || [];
        var VODS = searchArr.map(function(v) { return mapVod(v); });
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: pg + (VODS.length >= 30 ? 1 : 0),
            limit: 30,
            total: pg * 30 + (VODS.length >= 30 ? 1 : 0)
        });
    } catch (e) {
        console.error('搜索页获取失败：', e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: 30, total: 0});
    }
}

async function detail(id) {
    try {
        var signedHeaders = getSignedHeaders({id: id});
        var detailUrl = HOST + '/api/mw-movie/anonymous/video/detail?id=' + id;
        var resObj = safeParseJSON(await request(detailUrl, {headers: signedHeaders}));
        var kvod = (resObj || {}).data || {};
        if (!Object.keys(kvod).length) { throw new Error('详情数据为空'); }

        var kid = String(kvod.vodId || id);
        var kname = String(kvod.vodName || '');
        var kpic = String(kvod.vodPic || '');
        var ktype = String(kvod.vodClass || '类型');
        var kremarks = String(kvod.vodRemarks || '');
        var kyear = String(kvod.vodYear || '');
        var karea = String(kvod.vodArea || '地区');
        var klang = String(kvod.vodLang || '语言');
        var kdirector = String(kvod.vodDirector || '导演');
        var kactor = String(kvod.vodActor || '主演');
        var kcontent = stripHtml(kvod.vodContent || '简介');
        var sourceName = String(kvod.sourceName || '金牌线路');

        var rawEpisodeList = Array.isArray(kvod.episodeList) ? kvod.episodeList : [];
        var ktabs = [];
        var kurls = [];

        if (rawEpisodeList.length > 0) {
            var kurl = rawEpisodeList.map(function(ep) {
                var ename = String(ep.name || '播放');
                var epid = String(ep.nid || '');
                return ename + '$' + kid + '@' + epid;
            }).join('#');
            ktabs.push(sourceName);
            kurls.push(kurl);
        }

        var VOD = {
            vod_id: kid,
            vod_name: kname,
            vod_pic: kpic,
            type_name: ktype,
            vod_remarks: kremarks,
            vod_year: kyear,
            vod_area: karea,
            vod_lang: klang,
            vod_director: kdirector,
            vod_actor: kactor,
            vod_content: kcontent,
            vod_play_from: ktabs.join('$$$'),
            vod_play_url: kurls.join('$$$')
        };
        return JSON.stringify({list: [VOD]});
    } catch (e) {
        console.error('详情页获取失败：', e.message);
        return JSON.stringify({list: []});
    }
}

async function play(flag, id, flags) {
    try {
        var parts = id.split('@');
        var vodId = parts[0] || '';
        var nid = parts[1] || '';
        if (!vodId || !nid) { throw new Error('播放参数格式错误，期望 vodId@nid'); }
        var body = {clientType: '3', id: vodId, nid: nid};
        var qs = objToForm(body);
        var signedHeaders = getSignedHeaders(body);
        var playUrl = HOST + '/api/mw-movie/anonymous/v2/video/episode/url' + (qs ? '?' + qs : '');
        var resObj = safeParseJSON(await request(playUrl, {headers: signedHeaders}));
        var list = ((((resObj || {}).data || {}).list)) || [];
        var url = '';
        if (list.length > 0) {
            url = list[0].url || '';
        }
        if (!url) { throw new Error('播放接口未返回有效地址'); }
        return JSON.stringify({
            jx: 0,
            parse: 0,
            url: url,
            header: DefHeader
        });
    } catch (e) {
        console.error('播放失败：', e.message);
        return JSON.stringify({jx: 0, parse: 0, url: '', header: {}});
    }
}

// ========== Utility functions ==========

function safeParseJSON(jStr) {
    try { return JSON.parse(jStr); } catch(e) { return null; }
}

async function request(reqUrl, options) {
    if (typeof reqUrl !== 'string' || !reqUrl.trim()) { throw new Error('reqUrl需为字符串且非空'); }
    if (!options || typeof options !== 'object' || Array.isArray(options)) { options = {}; }
    try {
        options.method = (options.method || 'get').toLowerCase();
        if (['get', 'head'].indexOf(options.method) >= 0) {
            delete options.data;
            delete options.postType;
        } else {
            options.data = options.data || '';
            options.postType = (options.postType || 'form').toLowerCase();
        }
        var headers = (typeof options.headers === 'object' && !Array.isArray(options.headers) && options.headers) ? options.headers : KParams.headers;
        var timeout = parseInt(options.timeout, 10) > 0 ? parseInt(options.timeout, 10) : KParams.timeout;
        var charset = (options.charset || 'utf-8').toLowerCase();
        var toBase64 = options.toBase64 || false;
        var optObj = {
            headers: headers,
            timeout: timeout,
            charset: charset,
            buffer: toBase64 ? 2 : 0
        };
        if (options.method) optObj.method = options.method;
        if (options.data !== undefined) optObj.data = options.data;
        if (options.postType) optObj.postType = options.postType;
        var res = await req(reqUrl, optObj);
        if (options.withHeaders) {
            var resHeaders = (typeof res.headers === 'object' && !Array.isArray(res.headers) && res.headers) ? res.headers : {};
            var resWithHeaders = {};
            for (var rh in resHeaders) { if (resHeaders.hasOwnProperty(rh)) resWithHeaders[rh] = resHeaders[rh]; }
            resWithHeaders.body = res?.content || '';
            return JSON.stringify(resWithHeaders);
        }
        return res?.content || '';
    } catch (e) {
        console.error(reqUrl + '→请求失败：', e.message);
        return options.withHeaders ? JSON.stringify({body: ''}) : '';
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
