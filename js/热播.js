/*
title: '热播app', author: '梦/v1.0.4'
基于热播APP接口，参考金牌.js结构重写
接口：home / category / search / detail / play
签名算法：MD5(固定前缀 + timestamp)

修复：影视TV(OK影视/FongMi)的req函数POST时，data需传JSON对象而非form字符串
     原因：Connect.java的getFormBody()调用Json.toMap(req.getData())解析data，
     如果data是字符串"sign=xxx&timestamp=xxx"会解析失败导致空body。
     修复：data改为直接传对象 {sign: "xxx", timestamp: "xxx"}
*/
var HOST;
const MOBILE_UA = "okhttp-okgo/jeasonlzy";
const SIGN_KEY = "7gp0bnd2sr85ydii2j32pcypscoc4w6c7g5spl";
var DefHeader = {'User-Agent': MOBILE_UA, 'Accept-Language': 'zh-CN,zh;q=0.8'};
var KParams = {
    headers: {'User-Agent': MOBILE_UA, 'Accept-Language': 'zh-CN,zh;q=0.8'},
    timeout: 20000
};

const SORT_VALUES = [
    {name: '按时间', value: 'time'},
    {name: '按人气', value: 'hits'},
    {name: '按评分', value: 'score'}
];

// ========== Crypto helpers (MD5, no external deps) ==========

function strToUtf8Bytes(s) {
    var bytes = [];
    for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c < 0x80) {
            bytes.push(c);
        } else if (c < 0x800) {
            bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
        } else if (c < 0x10000) {
            bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
        } else {
            bytes.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
        }
    }
    return bytes;
}

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

function md51(bytes) {
    var n = bytes.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i = 64; i <= n; i += 64) {
        md5cycle(state, md5blk_from_bytes(bytes.slice(i - 64, i)));
    }
    var tail_bytes = bytes.slice(i - 64);
    var tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (i = 0; i < tail_bytes.length; i++) tail[i >> 2] |= tail_bytes[i] << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) { md5cycle(state, tail); tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
}

function md5blk_from_bytes(bytes) {
    var md5blks = [], i;
    for (i = 0; i < 64; i += 4) {
        md5blks[i >> 2] = bytes[i] + (bytes[i+1] << 8) + (bytes[i+2] << 16) + (bytes[i+3] << 24);
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
    a=md5hh(a,b,c,d,k[13],S31,681279174);d=md5hh(d,a,b,c,k[0],S32,-358537222);c=md5hh(c,d,a,b,k[3],S33,-722521979);b=md5hh(b,c,d,a,k[6],S34,76029189);
    a=md5hh(a,b,c,d,k[9],S31,-640364487);d=md5hh(d,a,b,c,k[12],S32,-421815835);c=md5hh(c,d,a,b,k[15],S33,530742520);b=md5hh(b,c,d,a,k[2],S34,-995338651);
    a=md5ii(a,b,c,d,k[0],S41,-198630844);d=md5ii(d,a,b,c,k[7],S42,1126891415);c=md5ii(c,d,a,b,k[14],S43,-1416354905);b=md5ii(b,c,d,a,k[5],S44,-57434055);
    a=md5ii(a,b,c,d,k[12],S41,1700485571);d=md5ii(d,a,b,c,k[3],S42,-1894986606);c=md5ii(c,d,a,b,k[10],S43,-1051523);b=md5ii(b,c,d,a,k[1],S44,-2054922799);
    a=md5ii(a,b,c,d,k[8],S41,1873313359);d=md5ii(d,a,b,c,k[15],S42,-30611744);c=md5ii(c,d,a,b,k[6],S43,-1560198380);b=md5ii(b,c,d,a,k[13],S44,1309151649);
    a=md5ii(a,b,c,d,k[4],S41,-145523070);d=md5ii(d,a,b,c,k[11],S42,-1120210379);c=md5ii(c,d,a,b,k[2],S43,718787259);b=md5ii(b,c,d,a,k[9],S44,-343485551);
    x[0]=safeAdd(a,x[0]);x[1]=safeAdd(b,x[1]);x[2]=safeAdd(c,x[2]);x[3]=safeAdd(d,x[3]);
}

function md5(s) {
    var bytes = strToUtf8Bytes(s);
    var h = md51(bytes);
    var hex = '0123456789abcdef', r = '';
    for (var i = 0; i < 16; i++) {
        var v = h[i >> 2] >>> ((i % 4) * 8);
        r += hex.charAt((v >>> 4) & 0x0f) + hex.charAt(v & 0x0f);
    }
    return r;
}

// ========== API helpers ==========

function buildSignedBody(params) {
    var timestamp = Math.floor(Date.now() / 1000).toString();
    var signStr = SIGN_KEY + timestamp;
    var sign = md5(signStr);
    var body = {};
    for (var k in params) {
        if (params.hasOwnProperty(k)) {
            body[k] = params[k];
        }
    }
    body['sign'] = sign;
    body['timestamp'] = timestamp;
    return body;
}

function getSignedHeaders() {
    var headers = {};
    for (var h in DefHeader) { if (DefHeader.hasOwnProperty(h)) headers[h] = DefHeader[h]; }
    headers['Referer'] = HOST + '/';
    return headers;
}

function stripHtml(value) {
    return String(value == null ? '' : value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapVod(v) {
    return {
        vod_id: String(v.vod_id || ''),
        vod_name: String(v.vod_name || ''),
        vod_pic: String(v.vod_pic || v.vod_pic_thumb || ''),
        vod_remarks: String(v.vod_remarks || ''),
        vod_year: String(v.tag || ''),
        type_id: String(v.type_id || ''),
        type_name: String(v.type_name || '')
    };
}

function buildClassesAndFilters(typeList) {
    var classes = [];
    var filters = {};

    (typeList || []).forEach(function(item) {
        var typeId = String(item.type_id || '');
        if (!typeId) return;

        classes.push({
            type_id: typeId,
            type_name: item.type_name || typeId
        });

        var fts = [];

        if (Array.isArray(item.extend) && item.extend.length > 0) {
            var value = item.extend.filter(function(v) { return v && v !== '全部'; })
                .map(function(v) { return {name: v, value: v}; });
            if (value.length > 0) {
                fts.push({key: 'class', name: '类型', init: '', value: [{name: '全部', value: ''}].concat(value)});
            }
        }

        if (Array.isArray(item.area) && item.area.length > 0) {
            var value = item.area.filter(function(v) { return v && v !== '全部'; })
                .map(function(v) { return {name: v, value: v}; });
            if (value.length > 0) {
                fts.push({key: 'area', name: '地区', init: '', value: [{name: '全部', value: ''}].concat(value)});
            }
        }

        if (Array.isArray(item.lang) && item.lang.length > 0) {
            var value = item.lang.filter(function(v) { return v && v !== '全部'; })
                .map(function(v) { return {name: v, value: v}; });
            if (value.length > 0) {
                fts.push({key: 'lang', name: '语言', init: '', value: [{name: '全部', value: ''}].concat(value)});
            }
        }

        if (Array.isArray(item.year) && item.year.length > 0) {
            var value = item.year.filter(function(v) { return v && v !== '全部'; })
                .map(function(v) { return {name: v, value: v}; });
            if (value.length > 0) {
                fts.push({key: 'year', name: '年份', init: '', value: [{name: '全部', value: ''}].concat(value)});
            }
        }

        fts.push({
            key: 'by',
            name: '排序',
            init: 'time',
            value: SORT_VALUES
        });

        if (fts.length > 0) {
            filters[typeId] = fts;
        }
    });

    return {classes: classes, filters: filters};
}

// ========== Core functions ==========

async function init(cfg) {
    try {
        var host = cfg.ext?.host?.trim() || 'http://v.rbotv.cn';
        HOST = host.replace(/\/+$/, '');
        KParams.headers['Referer'] = HOST + '/';
        var parseTimeout = parseInt(cfg.ext?.timeout?.trim(), 10);
        KParams.timeout = parseTimeout > 0 ? parseTimeout : 20000;
    } catch(e) {
        console.error('初始化参数失败：', e.message);
    }
}

async function home(filter) {
    try {
        var signedHeaders = getSignedHeaders();
        var body = buildSignedBody({'': ''});

        var typeRes = safeParseJSON(await request(HOST + '/v3/type/top_type', {
            method: 'post',
            headers: signedHeaders,
            data: body,
            postType: 'form'
        }));

        var homeRes = safeParseJSON(await request(HOST + '/v3/type/tj_vod', {
            method: 'post',
            headers: signedHeaders,
            data: body,
            postType: 'form'
        }));

        var cf = buildClassesAndFilters((typeRes && typeRes.data && typeRes.data.list) ? typeRes.data.list : []);
        var classes = cf.classes;
        var filters = cf.filters;

        var caiArr = (homeRes && homeRes.data && homeRes.data.cai) ? homeRes.data.cai : [];
        var loopArr = (homeRes && homeRes.data && homeRes.data.loop) ? homeRes.data.loop : [];
        var allVideos = caiArr.concat(loopArr);
        var VODS = allVideos.filter(function(i) { return i.vod_id && String(i.vod_id) !== '0'; })
            .map(function(v) { return mapVod(v); });

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
        var signedHeaders = getSignedHeaders();
        var body = buildSignedBody({'': ''});
        var homeRes = safeParseJSON(await request(HOST + '/v3/type/tj_vod', {
            method: 'post',
            headers: signedHeaders,
            data: body,
            postType: 'form'
        }));
        var caiArr = (homeRes && homeRes.data && homeRes.data.cai) ? homeRes.data.cai : [];
        var loopArr = (homeRes && homeRes.data && homeRes.data.loop) ? homeRes.data.loop : [];
        var allVideos = caiArr.concat(loopArr);
        var VODS = allVideos.filter(function(i) { return i.vod_id && String(i.vod_id) !== '0'; })
            .map(function(v) { return mapVod(v); });
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

        var requestParams = {
            type_id: tid,
            limit: '12',
            page: String(pg)
        };

        if (extend) {
            for (var k in extend) {
                if (extend.hasOwnProperty(k) && extend[k]) {
                    var key = (k === 'extend') ? 'class' : k;
                    requestParams[key] = extend[k];
                }
            }
        }

        var body = buildSignedBody(requestParams);
        var signedHeaders = getSignedHeaders();
        var cateUrl = HOST + '/v3/home/type_search';
        var resObj = safeParseJSON(await request(cateUrl, {
            method: 'post',
            headers: signedHeaders,
            data: body,
            postType: 'form'
        }));
        var cateArr = ((((resObj || {}).data || {}).list)) || [];
        var VODS = cateArr.filter(function(i) { return i.vod_id && String(i.vod_id) !== '0'; })
            .map(function(v) { return mapVod(v); });
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: 9999,
            limit: 90,
            total: 999999
        });
    } catch (e) {
        console.error('类别页获取失败：', e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: 0, total: 0});
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;
        var requestParams = {
            limit: '12',
            page: String(pg),
            keyword: wd
        };
        var body = buildSignedBody(requestParams);
        var signedHeaders = getSignedHeaders();
        var searchUrl = HOST + '/v3/home/search';
        var resObj = safeParseJSON(await request(searchUrl, {
            method: 'post',
            headers: signedHeaders,
            data: body,
            postType: 'form'
        }));
        var searchArr = ((((resObj || {}).data || {}).list)) || [];
        var VODS = searchArr.filter(function(i) { return i.vod_id && String(i.vod_id) !== '0'; })
            .map(function(v) { return mapVod(v); });
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: 9999,
            limit: VODS.length,
            total: 999999
        });
    } catch (e) {
        console.error('搜索页获取失败：', e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: 0, total: 0});
    }
}

async function detail(id) {
    try {
        var requestParams = {vod_id: id};
        var body = buildSignedBody(requestParams);
        var signedHeaders = getSignedHeaders();
        var detailUrl = HOST + '/v3/home/vod_details';
        var resObj = safeParseJSON(await request(detailUrl, {
            method: 'post',
            headers: signedHeaders,
            data: body,
            postType: 'form'
        }));
        var v = (resObj || {}).data || {};
        if (!Object.keys(v).length) { throw new Error('详情数据为空'); }

        var kid = String(v.vod_id || id);
        var kname = String(v.vod_name || '');
        var kpic = String(v.vod_pic || '');
        var ktype = String(v.type_name || '类型');
        var kremarks = String(v.vod_remarks || '');
        var kyear = String(v.vod_year || '');
        var karea = String(v.vod_area || '地区');
        var klang = String(v.vod_lang || '语言');
        var kdirector = String(v.vod_director || '导演');
        var kactor = String(v.vod_actor || '主演');
        var kcontent = stripHtml(v.vod_content || '简介');

        var playList = Array.isArray(v.vod_play_list) ? v.vod_play_list : [];
        var ktabs = [];
        var kurls = [];

        playList.forEach(function(line, index) {
            var episodes = line.urls || [];
            if (episodes.length === 0) return;
            var urlStr = episodes.map(function(item) {
                var name = item.name || '播放';
                return name + '$' + (item.url || '');
            }).join('#');
            var lineName = '线路' + (index + 1) + (line.flag ? '(' + line.flag + ')' : '');
            ktabs.push(lineName);
            kurls.push(urlStr);
        });

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
        // id 格式为播放地址URL
        if (!id) { throw new Error('播放地址为空'); }

        // 如果是直连地址直接返回
        if (id.startsWith('http')) {
            return JSON.stringify({
                jx: 0,
                parse: 0,
                url: id,
                header: {'User-Agent': MOBILE_UA, 'Referer': HOST + '/'}
            });
        }

        return JSON.stringify({
            jx: 1,
            parse: 1,
            url: id,
            header: {'User-Agent': MOBILE_UA, 'Referer': HOST + '/'}
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
