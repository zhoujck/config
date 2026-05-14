/*
title: '瓜子APP', author: ''
*/
var HOST;
const MOBILE_UA = "okhttp/3.12.0";
var DefHeader = {
    'Cache-Control': 'no-cache',
    'Version': '2406025',
    'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
    'Ver': '1.9.2',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': MOBILE_UA
};

const TOKEN = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';
const STATIC_KEYS = "Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=";
const INDEX_KEYS = "qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=";

const SUB_MAP = { "1": "5", "2": "12", "4": "30", "3": "22", "64": "" };
const PRIVATE_KEY = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA==";

var KParams = {
    headers: Object.assign({}, DefHeader),
    timeout: 10000
};

const CLASSES = [
    { type_id: "1", type_name: "电影1" },
    { type_id: "2", type_name: "电视剧" },
    { type_id: "4", type_name: "动漫" },
    { type_id: "3", type_name: "综艺" },
    { type_id: "64", type_name: "短剧" }
];

const FILTERS = {
    '1': [
        { key: 'year', name: '年份', init: '0', value: [
            { n: '全部', v: '0' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' }, { n: '2024', v: '2024' },
            { n: '2023', v: '2023' }, { n: '2022', v: '2022' }, { n: '2021', v: '2021' }, { n: '2020', v: '2020' },
            { n: '2019', v: '2019' }, { n: '2018', v: '2018' }, { n: '2017', v: '2017' }, { n: '2016', v: '2016' },
            { n: '2015', v: '2015' }, { n: '2014', v: '2014' }, { n: '2013', v: '2013' }, { n: '2012', v: '2012' },
            { n: '2011', v: '2011' }, { n: '2010', v: '2010' }, { n: '2009', v: '2009' }, { n: '2008', v: '2008' },
            { n: '2007', v: '2007' }, { n: '2006', v: '2006' }, { n: '2005', v: '2005' }, { n: '更早', v: '2004' }
        ]},
        { key: 'area', name: '地区', init: '0', value: [
            { n: '全部', v: '0' }, { n: '大陆', v: '大陆' }, { n: '香港', v: '香港' }, { n: '台湾', v: '台湾' },
            { n: '美国', v: '美国' }, { n: '韩国', v: '韩国' }, { n: '日本', v: '日本' }, { n: '英国', v: '英国' },
            { n: '法国', v: '法国' }, { n: '泰国', v: '泰国' }, { n: '印度', v: '印度' }, { n: '其他', v: '其他' }
        ]},
        { key: 'sort', name: '排序', init: 'd_id', value: [
            { n: '最新', v: 'd_id' }, { n: '最热', v: 'd_hits' }, { n: '推荐', v: 'd_score' }
        ]}
    ],
    '2': [
        { key: 'year', name: '年份', init: '0', value: [
            { n: '全部', v: '0' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' }, { n: '2024', v: '2024' },
            { n: '2023', v: '2023' }, { n: '2022', v: '2022' }, { n: '2021', v: '2021' }, { n: '2020', v: '2020' },
            { n: '2019', v: '2019' }, { n: '2018', v: '2018' }, { n: '2017', v: '2017' }, { n: '2016', v: '2016' },
            { n: '2015', v: '2015' }, { n: '2014', v: '2014' }, { n: '2013', v: '2013' }, { n: '2012', v: '2012' },
            { n: '2011', v: '2011' }, { n: '2010', v: '2010' }, { n: '2009', v: '2009' }, { n: '2008', v: '2008' },
            { n: '2007', v: '2007' }, { n: '2006', v: '2006' }, { n: '2005', v: '2005' }, { n: '更早', v: '2004' }
        ]},
        { key: 'area', name: '地区', init: '0', value: [
            { n: '全部', v: '0' }, { n: '大陆', v: '大陆' }, { n: '香港', v: '香港' }, { n: '台湾', v: '台湾' },
            { n: '美国', v: '美国' }, { n: '韩国', v: '韩国' }, { n: '日本', v: '日本' }, { n: '英国', v: '英国' },
            { n: '法国', v: '法国' }, { n: '泰国', v: '泰国' }, { n: '印度', v: '印度' }, { n: '其他', v: '其他' }
        ]},
        { key: 'sort', name: '排序', init: 'd_id', value: [
            { n: '最新', v: 'd_id' }, { n: '最热', v: 'd_hits' }, { n: '推荐', v: 'd_score' }
        ]}
    ],
    '4': [
        { key: 'year', name: '年份', init: '0', value: [
            { n: '全部', v: '0' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' }, { n: '2024', v: '2024' },
            { n: '2023', v: '2023' }, { n: '2022', v: '2022' }, { n: '2021', v: '2021' }, { n: '2020', v: '2020' },
            { n: '2019', v: '2019' }, { n: '2018', v: '2018' }, { n: '2017', v: '2017' }, { n: '2016', v: '2016' },
            { n: '2015', v: '2015' }
        ]},
        { key: 'area', name: '地区', init: '0', value: [
            { n: '全部', v: '0' }, { n: '大陆', v: '大陆' }, { n: '日本', v: '日本' },
            { n: '美国', v: '美国' }, { n: '其他', v: '其他' }
        ]},
        { key: 'sort', name: '排序', init: 'd_id', value: [
            { n: '最新', v: 'd_id' }, { n: '最热', v: 'd_hits' }, { n: '推荐', v: 'd_score' }
        ]}
    ],
    '3': [
        { key: 'year', name: '年份', init: '0', value: [
            { n: '全部', v: '0' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' }, { n: '2024', v: '2024' },
            { n: '2023', v: '2023' }, { n: '2022', v: '2022' }
        ]},
        { key: 'area', name: '地区', init: '0', value: [
            { n: '全部', v: '0' }, { n: '大陆', v: '大陆' }, { n: '台湾', v: '台湾' }, { n: '韩国', v: '韩国' }
        ]},
        { key: 'sort', name: '排序', init: 'd_id', value: [
            { n: '最新', v: 'd_id' }, { n: '最热', v: 'd_hits' }, { n: '推荐', v: 'd_score' }
        ]}
    ],
    '64': [
        { key: 'year', name: '年份', init: '0', value: [
            { n: '全部', v: '0' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' },
            { n: '2024', v: '2024' }, { n: '2023', v: '2023' }
        ]},
        { key: 'sort', name: '排序', init: 'd_id', value: [
            { n: '最新', v: 'd_id' }, { n: '最热', v: 'd_hits' }, { n: '推荐', v: 'd_score' }
        ]}
    ]
};

/**
 * 加密工具
 */
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

function buildBody(requestKey, timestamp, keysStr) {
    var signature = 'token_id=,token=' + TOKEN + ',phone_type=1,request_key=' + requestKey + ',app_id=1,time=' + timestamp + ',keys=' + keysStr + '*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    var signature2 = md5(signature);
    var body = 'token=' + TOKEN + '&token_id=&phone_type=1&time=' + timestamp + '&phone_model=xiaomi-22021211rc&keys=' + encodeURIComponent(keysStr) + '&request_key=' + requestKey + '&signature=' + signature2 + '&app_id=1&ad_version=1';
    return body;
}

function getSub(tid) {
    return SUB_MAP[tid] || "";
}

function buildBodyUpper(requestKey, timestamp, keysStr) {
    var signature = 'token_id=,token=' + TOKEN + ',phone_type=1,request_key=' + requestKey + ',app_id=1,time=' + timestamp + ',keys=' + keysStr + '*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    var signature2 = md5(signature).toUpperCase();
    var body = 'token=' + TOKEN + '&token_id=&phone_type=1&time=' + timestamp + '&phone_model=xiaomi-22021211rc&keys=' + encodeURIComponent(keysStr) + '&request_key=' + requestKey + '&signature=' + signature2 + '&app_id=1&ad_version=1';
    return body;
}

async function apiPost(path, body) {
    var headers = Object.assign({}, DefHeader, {
        'Referer': HOST,
        'X-Customer-Client-Ip': '127.0.0.1',
        'Host': HOST.replace('https://', ''),
        'Connection': 'Keep-Alive'
    });
    var hd = await req(HOST + path, {
        method: 'post',
        headers: headers,
        data: body,
        postType: 'form',
        rejectCoding: true
    });
    var banner = safeParseJSON(hd?.content ?? '');
    if (!banner?.data) return null;
    var response_key = banner.data.response_key;
    var keys = banner.data.keys;
    var bodykeyiv = safeParseJSON(RSA.decode(keys, PRIVATE_KEY));
    if (!bodykeyiv) return null;
    var key = CryptoJS.enc.Utf8.parse(bodykeyiv.key);
    var iv = CryptoJS.enc.Utf8.parse(bodykeyiv.iv);
    var html = Decrypt(response_key, key, iv);
    return safeParseJSON(html);
}

async function init(cfg) {
    try {
        let host = cfg.ext?.host?.trim() || 'https://api.w32z7vtd.com';
        HOST = host.replace(/\/$/, '');
        KParams.headers['Referer'] = HOST;
        let parseTimeout = parseInt(cfg.ext?.timeout?.trim(), 10);
        KParams.timeout = parseTimeout > 0 ? parseTimeout : 10000;
    } catch (e) {
        console.error('初始化参数失败：', e.message);
    }
}

async function home(filter) {
    try {
        var timestamp = Math.floor(Date.now() / 1000).toString();
        var requestKey = Encrypt(JSON.stringify({
            area: '0', year: '0', pageSize: '100', sort: 'd_id', page: '1'
        }));
        var body = buildBodyUpper(requestKey, timestamp, INDEX_KEYS);
        var data = await apiPost('/App/IndexList/indexList', body);
        var vods = [];
        if (data?.list) {
            data.list.forEach(item => {
                vods.push({
                    vod_id: `${item.vod_id}/${item.vod_continu || 0}`,
                    vod_name: item.vod_name,
                    vod_pic: item.vod_pic,
                    vod_remarks: (item.vod_continu || 0) === 0 ? '电影' : `更新至${item.vod_continu}集`
                });
            });
        }
        return JSON.stringify({
            class: CLASSES,
            filters: FILTERS,
            list: vods
        });
    } catch (e) {
        console.error('获取首页失败：', e.message);
        return JSON.stringify({ class: CLASSES, filters: FILTERS, list: [] });
    }
}

async function homeVod() {
    try {
        var timestamp = Math.floor(Date.now() / 1000).toString();
        var requestKey = Encrypt(JSON.stringify({
            area: '0', year: '0', pageSize: '30', sort: 'd_id', page: '1'
        }));
        var body = buildBodyUpper(requestKey, timestamp, INDEX_KEYS);
        var data = await apiPost('/App/IndexList/indexList', body);
        var vods = [];
        if (data?.list) {
            data.list.forEach(item => {
                vods.push({
                    vod_id: `${item.vod_id}/${item.vod_continu || 0}`,
                    vod_name: item.vod_name,
                    vod_pic: item.vod_pic,
                    vod_remarks: (item.vod_continu || 0) === 0 ? '电影' : `更新至${item.vod_continu}集`
                });
            });
        }
        return JSON.stringify({ list: vods });
    } catch (e) {
        console.error('推荐页获取失败：', e.message);
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;
        var area = extend?.area || '0';
        var year = extend?.year || '0';
        var sort = extend?.sort || 'd_id';
        var sub = getSub(tid);
        var timestamp = Math.floor(Date.now() / 1000).toString();
        var requestKey = Encrypt(JSON.stringify({
            area: area, sub: sub, year: year, pageSize: '30', sort: sort, page: pg.toString(), tid: tid
        }));
        var body = buildBodyUpper(requestKey, timestamp, INDEX_KEYS);
        var data = await apiPost('/App/IndexList/indexList', body);
        var vods = [];
        var pagecount = 999;
        if (data?.list) {
            data.list.forEach(item => {
                vods.push({
                    vod_id: `${item.vod_id}/${item.vod_continu || 0}`,
                    vod_name: item.vod_name,
                    vod_pic: item.vod_pic,
                    vod_remarks: (item.vod_continu || 0) === 0 ? '电影' : `更新至${item.vod_continu}集`
                });
            });
            pagecount = parseInt(data.totalPage || 0);
            pagecount = pagecount === 0 ? 999 : pagecount;
        }
        return JSON.stringify({
            list: vods,
            page: pg,
            pagecount: pagecount,
            limit: 30,
            total: 30 * pagecount
        });
    } catch (e) {
        console.error('类别页获取失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 30, total: 0 });
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;
        var timestamp = Math.floor(Date.now() / 1000).toString();
        var requestKey = Encrypt(JSON.stringify({
            keywords: wd, order_val: '1', page: pg.toString()
        }));
        var body = buildBodyUpper(requestKey, timestamp, INDEX_KEYS);
        var data = await apiPost('/App/Index/findMoreVod', body);
        var vods = [];
        if (data?.list) {
            data.list
                .filter(item => item.vod_name && item.vod_name.toLowerCase().includes(wd.toLowerCase()))
                .forEach(item => {
                    vods.push({
                        vod_id: `${item.vod_id}/${item.vod_continu || 0}`,
                        vod_name: item.vod_name,
                        vod_pic: item.vod_pic,
                        vod_remarks: (item.vod_continu || 0) === 0 ? '电影' : `更新至${item.vod_continu}集`
                    });
                });
        }
        var pagecount = parseInt(data?.totalPage || 0);
        pagecount = pagecount === 0 ? 1 : pagecount;
        return JSON.stringify({
            list: vods,
            page: pg,
            pagecount: pagecount,
            limit: 20,
            total: 20 * pagecount
        });
    } catch (e) {
        console.error('搜索页获取失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 20, total: 0 });
    }
}

async function detail(id) {
    try {
        var vodId = id.split('/')[0];
        var timestamp = Math.floor(Date.now() / 1000).toString();

        // 获取详情
        var requestKey1 = Encrypt(JSON.stringify({
            token_id: '1649412', vod_id: vodId, mobile_time: timestamp, token: TOKEN
        }));
        var body1 = buildBody(requestKey1, timestamp, STATIC_KEYS);
        var detailData = await apiPost('/App/IndexPlay/playInfo', body1);

        // 获取播放源
        var requestKey2 = Encrypt(JSON.stringify({
            vurl_cloud_id: '2', vod_d_id: vodId
        }));
        var body2 = buildBody(requestKey2, timestamp, STATIC_KEYS);
        var playData = await apiPost('/App/Resource/Vurl/show', body2);

        if (!detailData?.vodInfo) {
            return JSON.stringify({ list: [] });
        }

        var vod = detailData.vodInfo;
        var playList = [];
        if (playData?.list) {
            playData.list.forEach(item => {
                var playParams = Object.values(item.play);
                var lastParam = null;
                for (var i = playParams.length - 1; i >= 0; i--) {
                    if (playParams[i].param) {
                        lastParam = playParams[i].param;
                        break;
                    }
                }
                if (lastParam) {
                    var vurlIdMatch = lastParam.match(/vurl_id=(\d+)/);
                    var resolution = lastParam.match(/resolution=(\d+)/);
                    if (vurlIdMatch) {
                        playList.push(`${item.title}$${vodId}/${vurlIdMatch[1]}?${resolution ? resolution[1] : ''}`);
                    }
                }
            });
        }

        var VOD = {
            vod_id: id,
            vod_name: vod.vod_name,
            vod_pic: vod.vod_pic,
            type_name: vod.videoTag ? vod.videoTag.toString() : '',
            vod_year: vod.vod_year || '',
            vod_area: vod.vod_area || '',
            vod_director: vod.vod_director || '',
            vod_actor: vod.vod_actor || '',
            vod_content: vod.vod_use_content || '',
            vod_play_from: '瓜子专线',
            vod_play_url: playList.join('#')
        };
        return JSON.stringify({ list: [VOD] });
    } catch (e) {
        console.error('详情页获取失败：', e.message);
        return JSON.stringify({ list: [] });
    }
}

async function play(flag, id, flags) {
    try {
        var vodId = id.split('/')[0];
        var vurlId = id.split('/')[1];
        var resolution = id.split('?')[1] || '';

        var timestamp = Math.floor(Date.now() / 1000).toString();
        var requestKey = Encrypt(JSON.stringify({
            domain_type: '8', vod_id: vodId, type: 'play', resolution: resolution, vurl_id: vurlId
        }));
        var body = buildBody(requestKey, timestamp, STATIC_KEYS);
        var data = await apiPost('/App/Resource/VurlDetail/showOne', body);
        var url = data?.url || '';

        return JSON.stringify({
            parse: 0,
            url: url,
            header: {
                'User-Agent': 'com.android.chrome/5.0.6 (Linux;Android 9) AndroidXMedia3/1.9.2'
            }
        });
    } catch (e) {
        console.error('播放失败：', e.message);
        return JSON.stringify({ parse: 0, url: '', header: {} });
    }
}

function safeParseJSON(jStr) {
    try {
        if (typeof jStr === 'object') return jStr;
        return JSON.parse(jStr);
    } catch (e) {
        return null;
    }
}

async function request(reqUrl, options = {}) {
    try {
        options.method = options.method?.toLowerCase() || 'get';
        if (['get', 'head'].includes(options.method)) {
            delete options.data;
            delete options.postType;
        } else {
            options.data = options.data ?? '';
            options.postType = options.postType?.toLowerCase() || 'form';
        }
        let { headers, timeout, ...restOpts } = options;
        const optObj = {
            headers: (typeof headers === 'object' && headers) ? headers : KParams.headers,
            timeout: parseInt(timeout, 10) > 0 ? parseInt(timeout, 10) : KParams.timeout,
            ...restOpts
        };
        const res = await req(reqUrl, optObj);
        return res?.content ?? '';
    } catch (e) {
        console.error(`${reqUrl}→请求失败：`, e.message);
        return '';
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
