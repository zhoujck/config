importClass('java.math.BigInteger');
importClass('java.security.KeyFactory');
importClass('java.security.spec.PKCS8EncodedKeySpec');
importClass('javax.crypto.Cipher');

var host = 'https://api.w32z7vtd.com';
var token = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';
var headers = {
    'Cache-Control': 'no-cache',
    'Version': '2406025',
    'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
    'Ver': '1.9.2',
    'Referer': host,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'okhttp/3.12.0'
};

var cateKeys = {
    '1': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    '2': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    '4': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    '3': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    '64': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    'detail': 'Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI='
};

var privateKeyBase64 = 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA==';

function rsaDecrypt(encBase64) {
    var keyBytes = android.util.Base64.decode(privateKeyBase64, 0);
    var spec = new PKCS8EncodedKeySpec(keyBytes);
    var kf = KeyFactory.getInstance("RSA");
    var privateKey = kf.generatePrivate(spec);
    var cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
    cipher.init(2, privateKey);
    var encBytes = android.util.Base64.decode(encBase64, 0);
    var decBytes = cipher.doFinal(encBytes);
    return new java.lang.String(decBytes, "UTF-8") + '';
}

function aesEncrypt(text, key, iv) {
    var k = CryptoJS.enc.Utf8.parse(key);
    var i = CryptoJS.enc.Utf8.parse(iv);
    return CryptoJS.AES.encrypt(text, k, { iv: i, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
        .ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function aesDecrypt(text, key, iv) {
    var k = CryptoJS.enc.Utf8.parse(key);
    var i = CryptoJS.enc.Utf8.parse(iv);
    var hex = CryptoJS.enc.Hex.parse(text);
    return CryptoJS.AES.decrypt(CryptoJS.enc.Base64.stringify(hex), k, { iv: i, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
        .toString(CryptoJS.enc.Utf8);
}

async function apiRequest(path, data, keys) {
    var requestKey = aesEncrypt(JSON.stringify(data), 'mvXBSW7ekreItNsT', '2U3IrJL8szAKp0Fj');
    var t = Math.floor(Date.now() / 1000).toString();
    var sigStr = 'token_id=,token=' + token + ',phone_type=1,request_key=' + requestKey + ',app_id=1,time=' + t + ',keys=' + keys + '*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    var signature = CryptoJS.MD5(sigStr).toString();
    var body = 'token=' + encodeURIComponent(token) + '&token_id=&phone_type=1&time=' + t + '&phone_model=xiaomi-22021211rc&keys=' + encodeURIComponent(keys) + '&request_key=' + encodeURIComponent(requestKey) + '&signature=' + signature + '&app_id=1&ad_version=1';

    var resp = await req(host + path, { method: 'POST', headers: headers, body: body });
    var content = (typeof resp === 'string') ? resp : resp.content;
    var json = JSON.parse(content);
    if (!json.data) return null;
    var bodyKey = rsaDecrypt(json.data.keys);
    var keyObj = JSON.parse(bodyKey);
    return JSON.parse(aesDecrypt(json.data.response_key, keyObj.key, keyObj.iv));
}

async function init(cfg) {}

async function home(filter) {
    return JSON.stringify({ class: [
        { type_name: "电影", type_id: "1" }, { type_name: "电视剧", type_id: "2" },
        { type_name: "动漫", type_id: "4" }, { type_name: "综艺", type_id: "3" },
        { type_name: "短剧", type_id: "64" }
    ]});
}

async function homeVod() { return JSON.stringify({ list: [] }); }

async function category(tid, pg, filter, extend) {
    var videos = [];
    try {
        var keys = cateKeys[tid] || cateKeys['1'];
        var subMap = { '1': '5', '2': '12', '4': '30', '3': '22', '64': '' };
        var data = { area: (extend && extend.area) || '0', sub: subMap[tid] || '', year: (extend && extend.year) || '0', pageSize: '30', sort: (extend && extend.sort) || 'd_id', page: (pg || 1).toString(), tid: tid };
        var result = await apiRequest('/App/IndexList/indexList', data, keys);
        if (result && result.list) {
            result.list.forEach(function(item) {
                var cont = item.vod_continu || 0;
                videos.push({ vod_id: item.vod_id + '/' + cont, vod_name: item.vod_name || '', vod_pic: item.vod_pic || '', vod_remarks: cont === 0 ? '电影' : '更新至' + cont + '集' });
            });
        }
    } catch (e) { log('分类获取失败: ' + e); }
    return JSON.stringify({ list: videos, page: parseInt(pg) || 1, pagecount: 9999, limit: 30, total: 999999 });
}

async function detail(id) {
    try {
        var vodId = id.split('/')[0];
        var t = Math.floor(Date.now() / 1000).toString();
        var info = await apiRequest('/App/IndexPlay/playInfo', { token_id: '393668', vod_id: vodId, mobile_time: t, token: token }, cateKeys['detail']);
        var vurl = await apiRequest('/App/Resource/Vurl/show', { vurl_cloud_id: '2', vod_d_id: vodId }, cateKeys['detail']);
        if (!info || !info.vodInfo) return JSON.stringify({ list: [] });
        var vod = info.vodInfo;
        var playList = [];
        if (vurl && vurl.list) {
            vurl.list.forEach(function(item) {
                if (!item.play) return;
                var ks = Object.keys(item.play);
                var lastKey = ks[ks.length - 1];
                var param = item.play[lastKey] && item.play[lastKey].param;
                if (param) {
                    var vm = param.match(/vurl_id=(\d+)/);
                    var rm = param.match(/resolution=(\d+)/);
                    if (vm) playList.push(item.title + '$' + vodId + '/' + vm[1] + '?' + (rm ? rm[1] : '1080'));
                }
            });
        }
        return JSON.stringify({ list: [{ vod_id: vodId, vod_name: vod.vod_name || '', vod_pic: vod.vod_pic || '', vod_year: vod.vod_year || '', vod_area: vod.vod_area || '', vod_actor: vod.vod_actor || '', vod_director: vod.vod_director || '', vod_content: (vod.vod_use_content || '').trim(), vod_play_from: '瓜子HD', vod_play_url: playList.join('#') }] });
    } catch (e) { log('详情获取失败: ' + e); return JSON.stringify({ list: [] }); }
}

async function search(wd, quick, pg) {
    var videos = [];
    try {
        var result = await apiRequest('/App/Index/findMoreVod', { keywords: wd, order_val: '1', page: (pg || 1).toString() }, cateKeys['detail']);
        if (result && result.list) {
            result.list.forEach(function(item) {
                var cont = item.vod_continu || 0;
                videos.push({ vod_id: item.vod_id + '/' + cont, vod_name: item.vod_name || '', vod_pic: item.vod_pic || '', vod_remarks: cont === 0 ? '电影' : '更新至' + cont + '集' });
            });
        }
    } catch (e) { log('搜索失败: ' + e); }
    return JSON.stringify({ list: videos, page: parseInt(pg) || 1, pagecount: 9999, limit: 30, total: 999999 });
}

async function play(flag, id, vipFlags) {
    try {
        var parts = id.split('/');
        var vodId = parts[0];
        var vurlId = parts[1].split('?')[0];
        var resolution = parts[1].split('?')[1] || '1080';
        var result = await apiRequest('/App/Resource/VurlDetail/showOne', { domain_type: '8', vod_id: vodId, type: 'play', resolution: resolution, vurl_id: vurlId }, cateKeys['detail']);
        if (result && result.url) return JSON.stringify({ parse: 0, playUrl: '', url: result.url, header: JSON.stringify(headers) });
    } catch (e) { log('播放解析失败: ' + e); }
    return JSON.stringify({ parse: 0, playUrl: '', url: '' });
}

function isVideoFormat(url) { return /\.m3u8|\.mp4|\.avi|\.mkv|\.flv|\.ts/i.test(url); }
function manualVideoCheck() {}
function localProxy(params) { return null; }
