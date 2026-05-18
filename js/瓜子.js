/*
 * 瓜子影视 - drpy3 格式
 * 基于热播.js架构重写，适配影视TV 5.1.6
 */
var HOST = 'https://api.w32z7vtd.com';
var MOBILE_UA = 'okhttp/3.12.0';
var APP_HEADERS = {
    'Cache-Control': 'no-cache',
    'Version': '2406025',
    'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
    'Ver': '1.9.2',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': MOBILE_UA
};
var TOKEN = 'token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';
var PRIVATE_KEY = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA==";

// ========== Crypto helpers ==========

function Encrypt(plainText) {
    var key = CryptoJS.enc.Utf8.parse("mvXBSW7ekreItNsT");
    var iv = CryptoJS.enc.Utf8.parse("2U3IrJL8szAKp0Fj");
    var encrypted = CryptoJS.AES.encrypt(plainText, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function Decrypt(word, key, iv) {
    var encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    var decrypt = CryptoJS.AES.decrypt({ciphertext: encryptedHexStr}, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
    return decrypt.toString(CryptoJS.enc.Utf8);
}

// ========== API helpers ==========

function getCommonBody(extra) {
    var t = Math.floor(Date.now() / 1000).toString();
    var request_key = Encrypt(JSON.stringify(extra));
    var sigPrefix = 'token_id=,token=' + TOKEN.replace('token=', '') + ',phone_type=1,request_key=' + request_key + ',app_id=1,time=' + t + ',keys=qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    var signature = md5(sigPrefix).toUpperCase();
    return TOKEN + '&token_id=&phone_type=1&time=' + t + '&phone_model=xiaomi-22021211rc&keys=qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ%2BIOJyHnHflCj5w%2F7ESK7FgywMvrgjxbx0GklEFLI4%2BJshgySe633OIRstuktwdiCy3CT%2BfLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz%2FuurUif2OK4%3D&request_key=' + request_key + '&signature=' + signature + '&app_id=1&ad_version=1';
}

async function apiPost(url, bodyStr) {
    var headers = {};
    for (var k in APP_HEADERS) { if (APP_HEADERS.hasOwnProperty(k)) headers[k] = APP_HEADERS[k]; }
    headers['Referer'] = HOST;

    var resp = await req(url, {
        method: 'post',
        headers: headers,
        data: bodyStr,
        postType: 'form'
    });
    var text = (typeof resp === 'string') ? resp : (resp && resp.content ? resp.content : '');
    var json = JSON.parse(text);

    if (json.code && json.code !== 200) {
        throw new Error('API错误: code=' + json.code + ', msg=' + (json.msg || ''));
    }

    var banner = json.data;
    var bodykeyiv = JSON.parse(RSA.decode(banner.keys, PRIVATE_KEY));
    var key = CryptoJS.enc.Utf8.parse(bodykeyiv.key);
    var iv = CryptoJS.enc.Utf8.parse(bodykeyiv.iv);
    return Decrypt(banner.response_key, key, iv);
}

function safeParseJSON(jStr) {
    try { return JSON.parse(jStr); } catch(e) { return null; }
}

// ========== 分类 ==========

function hqsub(tid) {
    var subs = ["5","12","30","22",""];
    var tids = ["1","2","4","3","64"];
    var idx = tids.indexOf(tid);
    return idx !== -1 ? subs[idx] : "";
}

// ========== Core functions ==========

async function home(filter) {
    return JSON.stringify({
        class: [
            {type_id: '2', type_name: '电视剧'},
            {type_id: '1', type_name: '电影'},
            {type_id: '4', type_name: '动漫'},
            {type_id: '3', type_name: '综艺'},
            {type_id: '64', type_name: '短剧'}
        ]
    });
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10) || 1;
        var sub = hqsub(tid);
        var params = {
            "area": (extend && extend.area) || "0",
            "sub": (extend && extend.sub) || sub,
            "year": (extend && extend.year) || "0",
            "pageSize": "30",
            "sort": (extend && extend.sort) || "d_id",
            "page": String(pg),
            "tid": tid
        };
        var body = getCommonBody(params);
        var result = await apiPost(HOST + "/App/IndexList/indexList", body);
        var data = safeParseJSON(result);
        var list = (data && data.list) ? data.list : [];
        var VODS = list.map(function(v) {
            return {
                vod_id: String(v.vod_id || ''),
                vod_name: String(v.vod_name || ''),
                vod_pic: String(v.vod_pic || ''),
                vod_remarks: v.vod_continu == 0 ? '电影' : '更新至' + v.vod_continu + '集',
                vod_year: String(v.vod_score || '')
            };
        });
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: 9999,
            limit: 30,
            total: 999999
        });
    } catch (e) {
        console.error('【瓜子】分类获取失败：', e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: 0, total: 0});
    }
}

async function detail(id) {
    try {
        var vod_id = String(id).split("/")[0];
        var t = Math.floor(Date.now() / 1000).toString();
        var detailKey = Encrypt(JSON.stringify({"token_id":"393668","vod_id":vod_id,"mobile_time":t,"token":TOKEN.replace('token=','')}));
        var sigPrefix = 'token_id=,token=' + TOKEN.replace('token=','') + ',phone_type=1,request_key=' + detailKey + ',app_id=1,time=' + t + ',keys=Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
        var signature = md5(sigPrefix);
        var body = TOKEN + '&token_id=&phone_type=1&time=' + t + '&phone_model=xiaomi-22021211rc&keys=Qmxi5ciWXbQzkr7o%2BSUNiUuQxQEf8%2FAVyUWY4T%2FBGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby%2B7GxXTktzJmxvneOUdYeHi%2BPZsThlvPI%3D&request_key=' + detailKey + '&signature=' + signature + '&app_id=1&ad_version=1';

        var headers = {};
        for (var k in APP_HEADERS) { if (APP_HEADERS.hasOwnProperty(k)) headers[k] = APP_HEADERS[k]; }
        headers['Referer'] = HOST;

        var resp = await req(HOST + "/App/IndexPlay/playInfo", {
            method: 'post',
            headers: headers,
            data: body,
            postType: 'form'
        });
        var text = (typeof resp === 'string') ? resp : (resp && resp.content ? resp.content : '');
        var json = JSON.parse(text);
        if (json.code && json.code !== 200) throw new Error('playInfo: code=' + json.code);
        var data2 = json.vodInfo;

        // 获取播放源
        var playKey = Encrypt(JSON.stringify({"vurl_cloud_id":"2","vod_d_id":vod_id}));
        var playSigPrefix = 'token_id=,token=' + TOKEN.replace('token=','') + ',phone_type=1,request_key=' + playKey + ',app_id=1,time=' + t + ',keys=Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
        var playSig = md5(playSigPrefix);
        var body2 = TOKEN + '&token_id=&phone_type=1&time=' + t + '&phone_model=xiaomi-22021211rc&keys=Qmxi5ciWXbQzkr7o%2BSUNiUuQxQEf8%2FAVyUWY4T%2FBGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby%2B7GxXTktzJmxvneOUdYeHi%2BPZsThlvPI%3D&request_key=' + playKey + '&signature=' + playSig + '&app_id=1&ad_version=1';

        var resp2 = await req(HOST + "/App/Resource/Vurl/show", {
            method: 'post',
            headers: headers,
            data: body2,
            postType: 'form'
        });
        var text2 = (typeof resp2 === 'string') ? resp2 : (resp2 && resp2.content ? resp2.content : '');
        var json2 = JSON.parse(text2);
        if (json2.code && json2.code !== 200) throw new Error('Vurl/show: code=' + json2.code);
        var playList = (json2 && json2.list) ? json2.list : [];

        var nnnmm = [];
        playList.forEach(function(item) {
            var playParams = Object.values(item.play);
            var lastParam = null;
            for (var i = playParams.length - 1; i >= 0; i--) {
                if (playParams[i].param) { lastParam = playParams[i].param; break; }
            }
            if (lastParam) {
                var vurlIdMatch = lastParam.match(/vurl_id=(\d+)/);
                var resolution = lastParam.match(/resolution=(\d+)/);
                if (vurlIdMatch) {
                    nnnmm.push(item.title + '$' + vod_id + '/' + vurlIdMatch[1] + '?' + (resolution ? resolution[1] : '1080'));
                }
            }
        });

        var VOD = {
            vod_id: String(data2.vod_id || vod_id),
            vod_name: String(data2.vod_name || ''),
            vod_pic: String(data2.vod_pic || ''),
            type_name: (data2.videoTag || []).join(','),
            vod_director: String(data2.vod_director || ''),
            vod_actor: String(data2.vod_actor || ''),
            vod_area: String(data2.vod_area || ''),
            vod_content: String(data2.vod_use_content || ''),
            vod_play_from: '瓜子HD',
            vod_play_url: nnnmm.join('#')
        };
        return JSON.stringify({list: [VOD]});
    } catch (e) {
        console.error('【瓜子】详情获取失败：', e.message);
        return JSON.stringify({list: []});
    }
}

async function play(flag, id, flags) {
    try {
        var vod_id = id.split("/")[0];
        var vurl_id = id.split("/")[1].split("?")[0];
        var resolution = id.split("?")[1] || '1080';

        var t = Math.floor(Date.now() / 1000).toString();
        var request_key = Encrypt(JSON.stringify({"domain_type":"8","vod_id":vod_id,"type":"play","resolution":resolution,"vurl_id":vurl_id}));
        var sigPrefix = 'token_id=,token=' + TOKEN.replace('token=','') + ',phone_type=1,request_key=' + request_key + ',app_id=1,time=' + t + ',keys=ZH8gpdp9bxjuG2NK97sol3o7Uiz+9eVEaVMlE2Fk3j7EResM3YHnECZUH7BONNTjpy7RVNi/YimGuNYriC7Cmswv4PNYiFYzw9QhlqZKwNfCM6IUpFZ0T4rZx8G78zkv2tNVbfYC4qNQedGi07nWZ33dlSuVxROVfY5JxOWHMI0=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
        var signature = md5(sigPrefix);
        var body = TOKEN + '&token_id=&phone_type=1&time=' + t + '&phone_model=xiaomi-22021211rc&keys=ZH8gpdp9bxjuG2NK97sol3o7Uiz%2B9eVEaVMlE2Fk3j7EResM3YHnECZUH7BONNTjpy7RVNi%2FYimGuNYriC7Cmswv4PNYiFYzw9QhlqZKwNfCM6IUpFZ0T4rZx8G78zkv2tNVbfYC4qNQedGi07nWZ33dlSuVxROVfY5JxOWHMI0%3D&request_key=' + request_key + '&signature=' + signature + '&app_id=1&ad_version=1';

        var headers = {};
        for (var k in APP_HEADERS) { if (APP_HEADERS.hasOwnProperty(k)) headers[k] = APP_HEADERS[k]; }
        headers['Referer'] = HOST;

        var resp = await req(HOST + '/App/Resource/VurlDetail/showOne', {
            method: 'post',
            headers: headers,
            data: body,
            postType: 'form'
        });
        var text = (typeof resp === 'string') ? resp : (resp && resp.content ? resp.content : '');
        var json = JSON.parse(text);
        if (json.code && json.code !== 200) throw new Error('showOne: code=' + json.code);

        var data = json.data;
        var bodykeyiv = JSON.parse(RSA.decode(data.keys, PRIVATE_KEY));
        var key = CryptoJS.enc.Utf8.parse(bodykeyiv.key);
        var iv = CryptoJS.enc.Utf8.parse(bodykeyiv.iv);
        var url = JSON.parse(Decrypt(data.response_key, key, iv)).url;

        return JSON.stringify({
            parse: 0,
            url: url,
            header: {'User-Agent': MOBILE_UA, 'Referer': HOST}
        });
    } catch (e) {
        console.error('【瓜子】播放失败：', e.message);
        return JSON.stringify({parse: 0, url: '', header: {}});
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10) || 1;
        var body = getCommonBody({"keywords": wd, "order_val": "1"});
        var result = await apiPost(HOST + "/App/Index/findMoreVod", body);
        var data = safeParseJSON(result);
        var list = (data && data.list) ? data.list : [];
        var VODS = list.map(function(v) {
            return {
                vod_id: String(v.vod_id || ''),
                vod_name: String(v.vod_name || ''),
                vod_pic: String(v.vod_pic || ''),
                vod_remarks: v.vod_continu == 0 ? '电影' : '更新至' + v.vod_continu + '集',
                vod_year: String(v.vod_addtime || '')
            };
        });
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: 9999,
            limit: VODS.length,
            total: 999999
        });
    } catch (e) {
        console.error('【瓜子】搜索失败：', e.message);
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: 0, total: 0});
    }
}

// ========== md5 (from 热播.js) ==========

function strToUtf8Bytes(s) {
    var bytes = [];
    for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c < 0x80) { bytes.push(c); }
        else if (c < 0x800) { bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F)); }
        else if (c < 0x10000) { bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)); }
        else { bytes.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)); }
    }
    return bytes;
}

function safeAdd(x, y) {
    var lsw = (x & 0xffff) + (y & 0xffff);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
}

function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }

function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

function md51(bytes) {
    var n = bytes.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i = 64; i <= n; i += 64) { md5cycle(state, md5blk_from_bytes(bytes.slice(i - 64, i))); }
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
    for (i = 0; i < 64; i += 4) { md5blks[i >> 2] = bytes[i] + (bytes[i+1] << 8) + (bytes[i+2] << 16) + (bytes[i+3] << 24); }
    return md5blks;
}

var S11=7,S12=12,S13=17,S14=22,S21=5,S22=9,S23=14,S24=20,S31=4,S32=11,S33=16,S34=23,S41=6,S42=10,S43=15,S44=21;

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

// ========== Export ==========

export function __jsEvalReturn() {
    return {
        init: async function(cfg) {},
        home: home,
        homeVod: async function() { return JSON.stringify({list: []}); },
        category: category,
        detail: detail,
        play: play,
        search: search,
        proxy: null
    };
}
