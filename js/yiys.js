let host = 'https://api.w32z7vtd.com';
let headers = {
    'Cache-Control': 'no-cache',
    'Version': '2406025',
    'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
    'Ver': '1.9.2',
    'Referer': 'https://api.w32z7vtd.com',
    'X-Customer-Client-Ip': '127.0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'api.w32z7vtd.com',
    'Connection': 'Keep-Alive',
    'User-Agent': 'okhttp/3.12.0'
};

const bodykey = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA==";

function Encrypt(plainText) {
    let key = CryptoJS.enc.Utf8.parse("mvXBSW7ekreItNsT");
    let iv = CryptoJS.enc.Utf8.parse("2U3IrJL8szAKp0Fj");
    let encrypted = CryptoJS.AES.encrypt(plainText, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    let encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    return encryptedHex.toUpperCase();
}

function Decrypt(word, key, iv) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let decrypt = CryptoJS.AES.decrypt({
        ciphertext: encryptedHexStr
    }, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr;
}

function getbody1(key, t) {
    var signature = 'token_id=,token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79,phone_type=1,request_key=' + key + ',app_id=1,time=' + t + ',keys=qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    var signature2 = md5(signature).toUpperCase();
    var body = 'token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79&token_id=&phone_type=1&time=' + t + '&phone_model=xiaomi-22021211rc&keys=qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ%2BIOJyHnHflCj5w%2F7ESK7FgywMvrgjxbx0GklEFLI4%2BJshgySe633OIRstuktwdiCy3CT%2BfLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz%2FuurUif2OK4%3D&request_key=' + key + '&signature=' + signature2 + '&app_id=1&ad_version=1';
    return body;
}

function getbody2(key, t) {
    var signature = 'token_id=,token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79,phone_type=1,request_key=' + key + ',app_id=1,time=' + t + ',keys=Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    var signature2 = md5(signature);
    var body = 'token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79&token_id=&phone_type=1&time=' + t + '&phone_model=xiaomi-22021211rc&keys=Qmxi5ciWXbQzkr7o%2BSUNiUuQxQEf8%2FAVyUWY4T%2FBGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby%2B7GxXTktzJmxvneOUdYeHi%2BPZsThlvPI%3D&request_key=' + key + '&signature=' + signature2 + '&app_id=1&ad_version=1';
    return body;
}

async function gethtml(u, body) {
    var hd = await req(u, {
        headers: headers,
        body: body,
        method: 'POST',
        rejectCoding: true
    });
    var banner = JSON.parse(hd.content).data;
    var response_key = banner.response_key;
    var keys = banner.keys;
    var bodykeyiv = JSON.parse(RSA.decode(keys, bodykey));
    var key = CryptoJS.enc.Utf8.parse(bodykeyiv.key);
    var iv = CryptoJS.enc.Utf8.parse(bodykeyiv.iv);
    var html = Decrypt(response_key, key, iv);
    return html;
}

async function init(cfg) {}

function hqsub(tid) {
    var subs = ["5", "12", "30", "22", ""];
    var tids = ["1", "2", "4", "3", "64"];
    let index = tids.indexOf(tid);
    if (index !== -1) {
        return subs[index];
    }
    return "";
}

async function home(filter) {
    return JSON.stringify({
        "class": [
            {"type_id": "1", "type_name": "电影"},
            {"type_id": "2", "type_name": "电视剧"},
            {"type_id": "4", "type_name": "动漫"},
            {"type_id": "3", "type_name": "综艺"},
            {"type_id": "64", "type_name": "短剧"}
        ],
        "filters": {}
    });
}

async function homeVod() {
    return JSON.stringify({ list: [] });
}

async function category(tid, pg, filter, extend) {
    let p = pg || 1;
    var sub = hqsub(tid);
    var timestamp = new Date().getTime() / 1000;
    var t = timestamp.toString().split('.')[0];
    var request_key = JSON.stringify({
        "area": (extend && extend.area || 0).toString(),
        "sub": (extend && extend.sub || sub).toString(),
        "year": (extend && extend.year || 0).toString(),
        "pageSize": "30",
        "sort": (extend && extend.sort || "d_id").toString(),
        "page": p,
        "tid": tid
    });
    var request_key2 = Encrypt(request_key);
    var body = getbody1(request_key2, t);
    var html = await gethtml(host + "/App/IndexList/indexList", body);
    var list = JSON.parse(html).list;
    let videos = [];
    list.forEach(data => {
        videos.push({
            vod_id: (data.vod_id + "").trim(),
            vod_name: data.vod_name,
            vod_pic: data.vod_pic,
            vod_remarks: data.vod_continu == 0 ? '电影' : '更新至' + data.vod_continu + '集'
        });
    });
    return JSON.stringify({
        "list": videos,
        "page": parseInt(p)
    });
}

async function detail(id) {
    var vod_id = id;
    var timestamp = new Date().getTime() / 1000;
    var t = timestamp.toString().split('.')[0];
    var request_key = JSON.stringify({
        "token_id": "1649412",
        "vod_id": vod_id,
        "mobile_time": t,
        "token": "1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79"
    });
    var request_key2 = Encrypt(request_key);
    var body = getbody2(request_key2, t);
    var html = await gethtml(host + "/App/IndexPlay/playInfo", body);
    var data2 = JSON.parse(html).vodInfo;

    var request_key3 = JSON.stringify({
        "vurl_cloud_id": "2",
        "vod_d_id": vod_id
    });
    var request_key4 = Encrypt(request_key3);
    var body2 = getbody2(request_key4, t);
    var html2 = await gethtml(host + "/App/Resource/Vurl/show", body2);
    var list = JSON.parse(html2).list;

    let playurls = [];
    list.forEach(item => {
        const playParams = Object.values(item.play);
        let lastParam = null;
        for (let i = playParams.length - 1; i >= 0; i--) {
            if (playParams[i].param) {
                lastParam = playParams[i].param;
                break;
            }
        }
        const vurlIdMatch = lastParam.match(/vurl_id=(\d+)/);
        const resolution = lastParam.match(/resolution=(\d+)/);
        if (vurlIdMatch) {
            playurls.push(item.title + "$" + vod_id + "/" + vurlIdMatch[1] + "?" + resolution[1]);
        }
    });

    return JSON.stringify({
        list: [{
            vod_id: vod_id,
            vod_name: data2.vod_name,
            vod_pic: data2.vod_pic,
            type_name: data2.videoTag ? data2.videoTag.toString() : "",
            vod_year: "",
            vod_area: data2.vod_area || "",
            vod_remarks: "",
            vod_actor: data2.vod_actor || "",
            vod_director: data2.vod_director || "",
            vod_content: data2.vod_use_content || "",
            vod_play_from: "瓜子专线",
            vod_play_url: playurls.join("#")
        }]
    });
}

async function search(wd, quick, pg) {
    let p = pg || 1;
    var timestamp = new Date().getTime() / 1000;
    var t = timestamp.toString().split('.')[0];
    var request_key = JSON.stringify({
        "keywords": wd,
        "order_val": "1"
    });
    var request_key2 = Encrypt(request_key);
    var body = getbody1(request_key2, t);
    var html = await gethtml(host + "/App/Index/findMoreVod", body);
    var list = JSON.parse(html).list;
    let videos = [];
    list.forEach(data => {
        videos.push({
            vod_id: (data.vod_id + "").trim(),
            vod_name: data.vod_name,
            vod_pic: data.vod_pic,
            vod_remarks: data.vod_continu == 0 ? '电影' : '更新至' + data.vod_continu + '集'
        });
    });
    return JSON.stringify({ list: videos });
}

async function play(flag, id, flags) {
    var vod_id = id.split("/")[0];
    var vurl_id = id.split("/")[1];
    var resolution = id.split("?")[1];

    var timestamp = new Date().getTime() / 1000;
    var t = timestamp.toString().split('.')[0];
    var request_key = JSON.stringify({
        "domain_type": "8",
        "vod_id": vod_id,
        "type": "play",
        "resolution": resolution,
        "vurl_id": vurl_id
    });
    var request_key2 = Encrypt(request_key);
    var body = getbody2(request_key2, t);
    var html = await gethtml(host + "/App/Resource/VurlDetail/showOne", body);
    var data = JSON.parse(html).data;
    var response_key = data.response_key;
    var keys = data.keys;
    var bodykeyiv = JSON.parse(RSA.decode(keys, bodykey));
    var key = CryptoJS.enc.Utf8.parse(bodykeyiv.key);
    var iv = CryptoJS.enc.Utf8.parse(bodykeyiv.iv);
    var url = JSON.parse(Decrypt(response_key, key, iv)).url;

    return JSON.stringify({
        parse: 0,
        url: url,
        header: {
            "User-Agent": "okhttp/3.12.0",
            "Referer": "https://api.w32z7vtd.com"
        }
    });
}

export default { init, home, homeVod, category, detail, search, play };
