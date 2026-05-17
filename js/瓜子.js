var h_ost = 'https://api.w32z7vtd.com';

var AES_KEY = CryptoJS.enc.Utf8.parse("mvXBSW7ekreItNsT");
var AES_IV = CryptoJS.enc.Utf8.parse("2U3IrJL8szAKp0Fj");
var BODY_KEY = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA==";

var TOKEN = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';

var KEYS_LIST = {
    list: "qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=*",
    detail: "Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=*",
    play: "ZH8gpdp9bxjuG2NK97sol3o7Uiz+9eVEaVMlE2Fk3j7EResM3YHnECZUH7BONNTjpy7RVNi/YimGuNYriC7Cmswv4PNYiFYzw9QhlqZKwNfCM6IUpFZ0T4rZx8G78zkv2tNVbfYC4qNQedGi07nWZ33dlSuVxROVfY5JxOWHMI0=*"
};

var API_HEADERS = {
    'Cache-Control': 'no-cache',
    'Version': '2406025',
    'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
    'Ver': '1.9.2',
    'Referer': h_ost,
    'X-Customer-Client-Ip': '127.0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'api.w32z7vtd.com',
    'Connection': 'Keep-Alive',
    'User-Agent': 'okhttp/3.12.0'
};

// ========== 加密工具 ==========

function aesEncrypt(plainText) {
    var encrypted = CryptoJS.AES.encrypt(plainText, AES_KEY, {
        iv: AES_IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function aesDecrypt(hexStr, key, iv) {
    var encryptedHexStr = CryptoJS.enc.Hex.parse(hexStr);
    var decrypted = CryptoJS.AES.decrypt({
        ciphertext: encryptedHexStr
    }, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

function buildBody(requestKeyEnc, t, keysStr) {
    var signature = 'token_id=,token=' + TOKEN + ',phone_type=1,request_key=' + requestKeyEnc
        + ',app_id=1,time=' + t + ',keys=' + keysStr
        + '*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    var signature2 = md5(signature);
    return 'token=' + TOKEN + '&token_id=&phone_type=1&time=' + t
        + '&phone_model=xiaomi-22021211rc'
        + '&keys=' + encodeURIComponent(keysStr)
        + '&request_key=' + requestKeyEnc
        + '&signature=' + signature2
        + '&app_id=1&ad_version=1';
}

function md5(str) {
    return CryptoJS.MD5(str).toString();
}

// ========== API 请求 ==========

async function apiPost(path, body) {
    var resp = await req(h_ost + path, {
        method: 'POST',
        headers: API_HEADERS,
        data: body,
        postType: 'form'
    });
    var data = JSON.parse(resp.content).data;
    var responseKey = data.response_key;
    var keysEncrypted = data.keys;
    var bodykeyiv = JSON.parse(RSA.decode(keysEncrypted, BODY_KEY));
    var key = CryptoJS.enc.Utf8.parse(bodykeyiv.key);
    var iv = CryptoJS.enc.Utf8.parse(bodykeyiv.iv);
    return JSON.parse(aesDecrypt(responseKey, key, iv));
}

function getSubForTid(tid) {
    var subs = ["5", "12", "30", "22", ""];
    var tids = ["1", "2", "4", "3", "64"];
    var index = tids.indexOf(tid);
    return index !== -1 ? subs[index] : "";
}

// ========== TVBox 接口 ==========

async function init(cfg) {}

async function home(filter) {
    return JSON.stringify({
        class: [
            { type_id: "2", type_name: "电视剧" },
            { type_id: "1", type_name: "电影" },
            { type_id: "4", type_name: "动漫" },
            { type_id: "3", type_name: "综艺" },
            { type_id: "64", type_name: "短剧" }
        ],
        filters: {
            "1": [
                { key: "area", name: "地区", value: [{ n: "全部", v: "0" }, { n: "大陆", v: "1" }, { n: "香港", v: "2" }, { n: "台湾", v: "3" }, { n: "美国", v: "4" }, { n: "韩国", v: "5" }, { n: "日本", v: "6" }, { n: "泰国", v: "13" }] },
                { key: "sub", name: "类型", value: [{ n: "全部", v: "5" }, { n: "动作", v: "6" }, { n: "喜剧", v: "7" }, { n: "爱情", v: "8" }, { n: "科幻", v: "9" }, { n: "恐怖", v: "10" }, { n: "剧情", v: "11" }, { n: "战争", v: "12" }, { n: "犯罪", v: "21" }] },
                { key: "year", name: "年代", value: [{ n: "全部", v: "0" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" }, { n: "2023", v: "2023" }, { n: "2022", v: "2022" }] },
                { key: "sort", name: "排序", value: [{ n: "默认", v: "d_id" }, { n: "最新", v: "d_time" }, { n: "最热", v: "d_hits" }] }
            ],
            "2": [
                { key: "area", name: "地区", value: [{ n: "全部", v: "0" }, { n: "大陆", v: "1" }, { n: "香港", v: "2" }, { n: "台湾", v: "3" }, { n: "美国", v: "4" }, { n: "韩国", v: "5" }, { n: "日本", v: "6" }, { n: "泰国", v: "13" }] },
                { key: "sub", name: "类型", value: [{ n: "全部", v: "12" }, { n: "古装", v: "13" }, { n: "战争", v: "14" }, { n: "偶像", v: "15" }, { n: "犯罪", v: "16" }, { n: "奇幻", v: "17" }, { n: "剧情", v: "18" }, { n: "悬疑", v: "19" }, { n: "穿越", v: "20" }] },
                { key: "year", name: "年代", value: [{ n: "全部", v: "0" }, { n: "2026", v: "2026" }, { n: "2025", v: "2025" }, { n: "2024", v: "2024" }, { n: "2023", v: "2023" }, { n: "2022", v: "2022" }] },
                { key: "sort", name: "排序", value: [{ n: "默认", v: "d_id" }, { n: "最新", v: "d_time" }, { n: "最热", v: "d_hits" }] }
            ],
            "3": [
                { key: "area", name: "地区", value: [{ n: "全部", v: "0" }, { n: "大陆", v: "1" }, { n: "港台", v: "2" }, { n: "日韩", v: "3" }, { n: "欧美", v: "4" }] },
                { key: "sub", name: "类型", value: [{ n: "全部", v: "22" }, { n: "真人秀", v: "23" }, { n: "脱口秀", v: "24" }, { n: "选秀", v: "25" }, { n: "晚会", v: "26" }] },
                { key: "sort", name: "排序", value: [{ n: "默认", v: "d_id" }, { n: "最新", v: "d_time" }, { n: "最热", v: "d_hits" }] }
            ],
            "4": [
                { key: "area", name: "地区", value: [{ n: "全部", v: "0" }, { n: "大陆", v: "1" }, { n: "日本", v: "2" }, { n: "美国", v: "3" }, { n: "韩国", v: "4" }] },
                { key: "sub", name: "类型", value: [{ n: "全部", v: "30" }, { n: "热血", v: "31" }, { n: "搞笑", v: "32" }, { n: "恋爱", v: "33" }, { n: "冒险", v: "34" }] },
                { key: "sort", name: "排序", value: [{ n: "默认", v: "d_id" }, { n: "最新", v: "d_time" }, { n: "最热", v: "d_hits" }] }
            ],
            "64": [
                { key: "sub", name: "类型", value: [{ n: "全部", v: "" }] },
                { key: "sort", name: "排序", value: [{ n: "默认", v: "d_id" }, { n: "最新", v: "d_time" }, { n: "最热", v: "d_hits" }] }
            ]
        }
    });
}

async function homeVod() {
    try {
        var t = String(Math.floor(Date.now() / 1000));
        var requestKey = JSON.stringify({
            "area": "0", "sub": "12", "year": "0",
            "pageSize": "30", "sort": "d_id", "page": "1", "tid": "2"
        });
        var requestKeyEnc = aesEncrypt(requestKey);
        var body = buildBody(requestKeyEnc, t, KEYS_LIST.list);
        var data = await apiPost("/App/IndexList/indexList", body);
        var list = (data.list || []).map(function(item) {
            return {
                vod_id: String(item.vod_id || ''),
                vod_name: item.vod_name || '',
                vod_pic: item.vod_pic || '',
                vod_remarks: item.vod_continu == 0 ? '电影' : '更新至' + item.vod_continu + '集'
            };
        });
        return JSON.stringify({ list: list });
    } catch (e) { return JSON.stringify({ list: [] }); }
}

async function category(tid, pg, filter, extend) {
    try {
        var p = parseInt(pg) || 1;
        var ext = extend || {};
        var sub = ext.sub || getSubForTid(tid);
        var t = String(Math.floor(Date.now() / 1000));
        var requestKey = JSON.stringify({
            "area": (ext.area || "0").toString(),
            "sub": sub.toString(),
            "year": (ext.year || "0").toString(),
            "pageSize": "30",
            "sort": (ext.sort || "d_id").toString(),
            "page": String(p),
            "tid": tid
        });
        var requestKeyEnc = aesEncrypt(requestKey);
        var body = buildBody(requestKeyEnc, t, KEYS_LIST.list);
        var data = await apiPost("/App/IndexList/indexList", body);
        var items = (data.list || []).map(function(item) {
            return {
                vod_id: String(item.vod_id || ''),
                vod_name: item.vod_name || '',
                vod_pic: item.vod_pic || '',
                vod_remarks: item.vod_continu == 0 ? '电影' : '更新至' + item.vod_continu + '集'
            };
        });
        var total = data.total || 0;
        return JSON.stringify({
            list: items, page: p,
            pagecount: Math.ceil(total / 30),
            total: total
        });
    } catch (e) { return JSON.stringify({ list: [], page: pg || 1, pagecount: 0, total: 0 }); }
}

async function detail(id) {
    try {
        var vodId = id.split("/")[0];
        var t = String(Math.floor(Date.now() / 1000));
        var requestKey = JSON.stringify({
            "token_id": "393668",
            "vod_id": vodId,
            "mobile_time": t,
            "token": TOKEN
        });
        var requestKeyEnc = aesEncrypt(requestKey);
        var body = buildBody(requestKeyEnc, t, KEYS_LIST.detail);
        var data = await apiPost("/App/IndexPlay/playInfo", body);
        var vodInfo = data.vodInfo;

        var requestKey2 = JSON.stringify({
            "vurl_cloud_id": "2",
            "vod_d_id": vodId
        });
        var requestKeyEnc2 = aesEncrypt(requestKey2);
        var body2 = buildBody(requestKeyEnc2, t, KEYS_LIST.detail);
        var data2 = await apiPost("/App/Resource/Vurl/show", body2);

        var episodes = [];
        (data2.list || []).forEach(function(item) {
            var playParams = Object.values(item.play);
            var lastParam = null;
            for (var i = playParams.length - 1; i >= 0; i--) {
                if (playParams[i].param) { lastParam = playParams[i].param; break; }
            }
            if (lastParam) {
                var vurlIdMatch = lastParam.match(/vurl_id=(\d+)/);
                var resolution = lastParam.match(/resolution=(\d+)/);
                if (vurlIdMatch) {
                    episodes.push(item.title + '$' + vodId + '/' + vurlIdMatch[1] + '?' + resolution[1]);
                }
            }
        });

        return JSON.stringify({ list: [{
            vod_id: vodId,
            vod_name: vodInfo.vod_name || '',
            vod_pic: vodInfo.vod_pic || '',
            type_name: (vodInfo.videoTag || []).join(''),
            vod_actor: vodInfo.vod_actor || '',
            vod_area: vodInfo.vod_area || '',
            vod_director: vodInfo.vod_director || '',
            vod_content: vodInfo.vod_use_content || '',
            vod_play_from: '瓜子HD',
            vod_play_url: episodes.join('#')
        }]});
    } catch (e) { return JSON.stringify({ list: [] }); }
}

async function play(flag, id, flags) {
    try {
        var vodId = id.split("/")[0];
        var vurlId = id.split("/")[1];
        var resolution = id.split("?")[1];
        var t = String(Math.floor(Date.now() / 1000));
        var requestKey = JSON.stringify({
            "domain_type": "8",
            "vod_id": vodId,
            "type": "play",
            "resolution": resolution,
            "vurl_id": vurlId
        });
        var requestKeyEnc = aesEncrypt(requestKey);
        var body = buildBody(requestKeyEnc, t, KEYS_LIST.play);
        var data = await apiPost("/App/Resource/VurlDetail/showOne", body);
        return JSON.stringify({
            parse: 0,
            url: data.url,
            header: API_HEADERS
        });
    } catch (e) { return JSON.stringify({ parse: 0, url: '' }); }
}

async function search(wd, quick, pg) {
    try {
        var t = String(Math.floor(Date.now() / 1000));
        var requestKey = JSON.stringify({
            "keywords": wd,
            "order_val": "1"
        });
        var requestKeyEnc = aesEncrypt(requestKey);
        var body = buildBody(requestKeyEnc, t, KEYS_LIST.list);
        var data = await apiPost("/App/Index/findMoreVod", body);
        var items = (data.list || []).map(function(item) {
            return {
                vod_id: String(item.vod_id || ''),
                vod_name: item.vod_name || '',
                vod_pic: item.vod_pic || '',
                vod_remarks: item.vod_continu == 0 ? '电影' : '更新至' + item.vod_continu + '集'
            };
        });
        return JSON.stringify({ list: items });
    } catch (e) { return JSON.stringify({ list: [] }); }
}

export default { init, home, homeVod, category, detail, play, search };
