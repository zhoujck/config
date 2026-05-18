const CryptoJS = require('crypto-js');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');

const host = 'https://api.w32z7vtd.com';
const token = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';
const headers = {
    'Cache-Control': 'no-cache',
    'Version': '2406025',
    'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
    'Ver': '1.9.2',
    'Referer': host,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'okhttp/3.12.0'
};

const cateKeys = {
    '1': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    '2': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    '4': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    '3': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    '64': 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
    'detail': 'Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI='
};

const privateKey = 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA==';

const cache = {};

function aesEncrypt(text, key, iv) {
    const k = CryptoJS.enc.Utf8.parse(key);
    const i = CryptoJS.enc.Utf8.parse(iv);
    return CryptoJS.AES.encrypt(text, k, { iv: i, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
        .ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
}

function aesDecrypt(text, key, iv) {
    const k = CryptoJS.enc.Utf8.parse(key);
    const i = CryptoJS.enc.Utf8.parse(iv);
    const hex = CryptoJS.enc.Hex.parse(text);
    return CryptoJS.AES.decrypt(CryptoJS.enc.Base64.stringify(hex), k, { iv: i, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
        .toString(CryptoJS.enc.Utf8);
}

function rsaDecrypt(data) {
    const key = new NodeRSA('-----BEGIN PRIVATE KEY-----\n' + privateKey + '\n-----END PRIVATE KEY-----');
    key.setOptions({ encryptionScheme: 'pkcs1' });
    return key.decrypt(Buffer.from(data, 'base64'), 'utf8');
}

function getMd5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

async function apiRequest(path, data, keys) {
    const requestKey = aesEncrypt(JSON.stringify(data), 'mvXBSW7ekreItNsT', '2U3IrJL8szAKp0Fj');
    const t = Math.floor(Date.now() / 1000).toString();
    const sigStr = 'token_id=,token=' + token + ',phone_type=1,request_key=' + requestKey + ',app_id=1,time=' + t + ',keys=' + keys + '*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    const signature = getMd5(sigStr);

    const body = 'token=' + encodeURIComponent(token) +
        '&token_id=&phone_type=1&time=' + t +
        '&phone_model=xiaomi-22021211rc' +
        '&keys=' + encodeURIComponent(keys) +
        '&request_key=' + encodeURIComponent(requestKey) +
        '&signature=' + signature + '&app_id=1&ad_version=1';

    const resp = await req(host + path, { method: 'POST', headers: headers, body: body });
    const json = typeof resp === 'string' ? JSON.parse(resp) : JSON.parse(resp.content || resp);

    if (!json.data) return null;
    const bodyKey = rsaDecrypt(json.data.keys);
    const keyObj = JSON.parse(bodyKey);
    return JSON.parse(aesDecrypt(json.data.response_key, keyObj.key, keyObj.iv));
}

async function init(cfg) {}

async function home(filter) {
    return JSON.stringify({
        class: [
            { type_name: "电影", type_id: "1" },
            { type_name: "电视剧", type_id: "2" },
            { type_name: "动漫", type_id: "4" },
            { type_name: "综艺", type_id: "3" },
            { type_name: "短剧", type_id: "64" }
        ]
    });
}

async function homeVod() {
    return JSON.stringify({ list: [] });
}

async function category(tid, pg, filter, extend) {
    const videos = [];
    try {
        const keys = cateKeys[tid] || cateKeys['1'];
        const subMap = { '1': '5', '2': '12', '4': '30', '3': '22', '64': '' };
        const data = {
            area: (extend && extend.area) || '0',
            sub: subMap[tid] || '',
            year: (extend && extend.year) || '0',
            pageSize: '30',
            sort: (extend && extend.sort) || 'd_id',
            page: (pg || 1).toString(),
            tid: tid
        };
        const result = await apiRequest('/App/IndexList/indexList', data, keys);
        if (result && result.list) {
            result.list.forEach(item => {
                const cont = item.vod_continu || 0;
                videos.push({
                    vod_id: item.vod_id + '/' + cont,
                    vod_name: item.vod_name || '',
                    vod_pic: item.vod_pic || '',
                    vod_remarks: cont === 0 ? '电影' : '更新至' + cont + '集'
                });
            });
        }
    } catch (e) { console.error('分类获取失败:', e); }
    return JSON.stringify({ list: videos, page: parseInt(pg) || 1, pagecount: 9999, limit: 30, total: 999999 });
}

async function detail(id) {
    try {
        const vodId = id.split('/')[0];
        const t = Math.floor(Date.now() / 1000).toString();

        const info = await apiRequest('/App/IndexPlay/playInfo', {
            token_id: '393668', vod_id: vodId, mobile_time: t, token: token
        }, cateKeys['detail']);

        const vurl = await apiRequest('/App/Resource/Vurl/show', {
            vurl_cloud_id: '2', vod_d_id: vodId
        }, cateKeys['detail']);

        if (!info || !info.vodInfo) return JSON.stringify({ list: [] });

        const vod = info.vodInfo;
        const playList = [];

        if (vurl && vurl.list) {
            vurl.list.forEach(item => {
                if (!item.play) return;
                const keys = Object.keys(item.play);
                const lastKey = keys[keys.length - 1];
                const param = item.play[lastKey] && item.play[lastKey].param;
                if (param) {
                    const vMatch = param.match(/vurl_id=(\d+)/);
                    const rMatch = param.match(/resolution=(\d+)/);
                    if (vMatch) {
                        playList.push(item.title + '$' + vodId + '/' + vMatch[1] + '?' + (rMatch ? rMatch[1] : '1080'));
                    }
                }
            });
        }

        return JSON.stringify({
            list: [{
                vod_id: vodId,
                vod_name: vod.vod_name || '',
                vod_pic: vod.vod_pic || '',
                vod_year: vod.vod_year || '',
                vod_area: vod.vod_area || '',
                vod_actor: vod.vod_actor || '',
                vod_director: vod.vod_director || '',
                vod_content: (vod.vod_use_content || '').trim(),
                vod_play_from: '瓜子HD',
                vod_play_url: playList.join('#')
            }]
        });
    } catch (e) {
        console.error('详情获取失败:', e);
        return JSON.stringify({ list: [] });
    }
}

async function search(wd, quick, pg) {
    const videos = [];
    try {
        const result = await apiRequest('/App/Index/findMoreVod', {
            keywords: wd, order_val: '1', page: (pg || 1).toString()
        }, cateKeys['detail'], false);
        if (result && result.list) {
            result.list.forEach(item => {
                const cont = item.vod_continu || 0;
                videos.push({
                    vod_id: item.vod_id + '/' + cont,
                    vod_name: item.vod_name || '',
                    vod_pic: item.vod_pic || '',
                    vod_remarks: cont === 0 ? '电影' : '更新至' + cont + '集'
                });
            });
        }
    } catch (e) { console.error('搜索失败:', e); }
    return JSON.stringify({ list: videos, page: parseInt(pg) || 1, pagecount: 9999, limit: 30, total: 999999 });
}

async function play(flag, id, vipFlags) {
    try {
        const parts = id.split('/');
        const vodId = parts[0];
        const vurlId = parts[1].split('?')[0];
        const resolution = parts[1].split('?')[1] || '1080';

        const data = { domain_type: '8', vod_id: vodId, type: 'play', resolution: resolution, vurl_id: vurlId };
        const result = await apiRequest('/App/Resource/VurlDetail/showOne', data, cateKeys['detail'], false);
        if (result && result.url) {
            return JSON.stringify({ parse: 0, playUrl: '', url: result.url, header: JSON.stringify(headers) });
        }
    } catch (e) { console.error('播放解析失败:', e); }
    return JSON.stringify({ parse: 0, playUrl: '', url: '' });
}

function isVideoFormat(url) { return /\.m3u8|\.mp4|\.avi|\.mkv|\.flv|\.ts/i.test(url); }
function manualVideoCheck() {}
function localProxy(params) { return null; }
