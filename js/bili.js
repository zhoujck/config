import { Crypto, jinja2, _ } from 'assets://js/lib/cat.js';

let siteKey = '';
let siteType = 0;

let cookie = '';
let login = '';
let vip = false;
let extendObj = {};
let bili_jct = '';
let vod_audio_id = {
    30280: 192000,
    30232: 132000,
    30216: 64000,
};

let vod_codec = {
    // 13: 'AV1',
    12: 'HEVC',
    7: 'AVC',
};

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';

async function request(reqUrl, ua, buffer) {
    let res = await req(reqUrl, {
        method: 'get',
        headers: ua ? ua : { 'User-Agent': UA },
        timeout: 60000,
        buffer: buffer ? 1 : 0,
    });
    return res.content;
}

async function post(reqUrl, postData, ua, posttype) {
    let res = await req(reqUrl, {
        method: 'post',
        headers: ua ? ua : { 'User-Agent': UA },
        data: postData,
        timeout: 60000,
        postType: posttype,
    });
    return res.content;
}

function getHeaders() {
    const headers = {
        'User-Agent': UA,
    };
    if (!_.isEmpty(cookie)) {
        headers.cookie = cookie;
    }
    return headers;
}

async function getCookie() {
    let result = await req('https://www.bilibili.com', {
        method: 'get',
        headers: { 'User-Agent': UA },
        timeout: 60000,
    });
    const setCookieHeaders = result.headers['set-cookie'];
    cookie = setCookieHeaders.map((kk) => kk.split(';')[0] + ';').join('');
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    let extend = cfg.ext;

    if (cfg.ext.hasOwnProperty('categories')) extend = cfg.ext.categories;
    if (cfg.ext.hasOwnProperty('cookie')) cookie = cfg.ext.cookie;
    // 获取csrf
    const cookies = cookie.split(';');
    cookies.forEach(cookie => {
        if (cookie.includes('bili_jct')) {
            bili_jct = cookie.split('=')[1];
        }
    });

    if (_.isEmpty(cookie)) await getCookie();
    let result = JSON.parse(await request('https://api.bilibili.com/x/web-interface/nav', getHeaders()));
    login = result.data.isLogin;
    vip = result.data.vipStatus;
    const ext = extend.split('#');
    const jsonData = [
        {
            key: 'order',
            name: '排序',
            value: [
                { n: '综合排序', v: '0' },
                { n: '最多点击', v: 'click' },
                { n: '最新发布', v: 'pubdate' },
                { n: '最多弹幕', v: 'dm' },
                { n: '最多收藏', v: 'stow' },
            ],
        },
        {
            key: 'duration',
            name: '时长',
            value: [
                { n: '全部时长', v: '0' },
                { n: '60分钟以上', v: '4' },
                { n: '30~60分钟', v: '3' },
                { n: '10~30分钟', v: '2' },
                { n: '10分钟以下', v: '1' },
            ],
        },
    ];
    const newarr = [];
    const d = {};
    const sc = {
        type_name: "首页",
        type_id: "首页",
        land: 1,
        ratio: 1.33,
    }
    newarr.push(sc);
    for (const kk of ext) {
        const c = {
            type_name: kk,
            type_id: kk,
            land: 1,
            ratio: 1.33,
        };
        newarr.push(c);
        d[kk] = jsonData;
    }
    if (!_.isEmpty(bili_jct)) {
        const hc = {
            type_name: "历史记录",
            type_id: "历史记录",
            land: 1,
            ratio: 1.33,
        }
        newarr.push(hc);
    }
    extendObj = {
        classes: newarr,
        filter: d,
    };
}

function home(filter) {
    try {
        const jSONObject = {
            class: extendObj.classes,
        };
        if (filter) {
            jSONObject.filters = extendObj.filter;
        }
        return JSON.stringify(jSONObject);
    } catch (e) {
        return '';
    }
}


async function homeVod() {
    try {
        const lists = [];
        const url = 'https://api.bilibili.com/x/web-interface/index/top/rcmd?ps=14&fresh_idx=1&fresh_idx_1h=1';

        const response = await request(url, getHeaders());
        const responseData = JSON.parse(response);
        const vods = responseData.data.item;

        for (const item of vods) {
            const vod = {};
            let imageUrl = item.pic;
            if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
            }
            let cd = getFullTime(item.duration);

            vod.vod_id = item.bvid;
            vod.vod_name = removeTags(item.title);
            vod.vod_pic = imageUrl;
            vod.vod_remarks = cd;
            vod.style = {
                type: 'rect',
                ratio: 1.33,
            },
                lists.push(vod);
        }

        const result = { lists: lists };
        return JSON.stringify(result);
    } catch (e) { }
}


async function category(tid, page, filter, ext) {
    if (page < 1) page = 1;
    try {
        if (Object.keys(ext).length > 0 && ext.hasOwnProperty('tid') && ext['tid'].length > 0) {
            tid = ext['tid'];
        }
        let url = '';
  //      url = `https://api.bilibili.com/pgc/season/index/result?order=2&pagesize=20&style_id=-1&type=1&season_type=3&st=3`;
/*
        if (Object.keys(ext).length > 0) {
            for (const k in ext) {
                if (k == 'tid') {
                    continue;
                }
                url += `&${encodeURIComponent(k)}=${encodeURIComponent(ext[k])}`;
            }
        }
*/
 //       url += `&page=${encodeURIComponent(page)}`;
        
   /* class_name:'历史&人文&宇宙&自然&动物&科技&美食&探险',
    class_url:'10033&10065&10068&10072&10071&10066&10045&10067',*/

        if (tid == "首页") {
            url = "https://api.bilibili.com/pgc/season/index/result?order=2&pagesize=20&style_id=-1&type=1&season_type=3&st=3" + page;
        }     
        else if (tid == "历史记录") {
            url = "https://api.bilibili.com/x/v2/history?pn=" + page;
        }
        else if (tid == "历史") {
            url = "https://api.bilibili.com/pgc/season/index/result?order=2&pagesize=20&style_id=10033&type=1&season_type=3&st=3" + page;
        }
         else if (tid == "人文") {
            url = "https://api.bilibili.com/pgc/season/index/result?order=2&pagesize=20&style_id=10065&type=1&season_type=3&st=3" + page;
        }
         else if (tid == "宇宙") {
            url = "https://api.bilibili.com/pgc/season/index/result?order=2&pagesize=20&style_id=10068&type=1&season_type=3&st=3" + page;
        }
         else if (tid == "自然") {
            url = "https://api.bilibili.com/pgc/season/index/result?order=2&pagesize=20&style_id=10072&type=1&season_type=3&st=3" + page;
        }
         else if (tid == "动物") {
            url = "https://api.bilibili.com/pgc/season/index/result?order=2&pagesize=20&style_id=10071&type=1&season_type=3&st=3" + page;
        }
         else if (tid == "科技") {
            url = "https://api.bilibili.com/pgc/season/index/result?order=2&pagesize=20&style_id=10066&type=1&season_type=3&st=3" + page;
        }
         else if (tid == "探险") {
            url = "https://api.bilibili.com/pgc/season/index/result?order=2&pagesize=20&style_id=10067&type=1&season_type=3&st=3" + page;
        }
        const data = JSON.parse(await request(url, getHeaders())).data;
        let items = data.result;
        
        if (tid == "历史记录") {
                items = data;
        } else {
            items = data.list;
        } 

        const videos = [];
        for (const list of items) {
            const video = {};
            let pic = list.cover;
            if (pic.startsWith('//')) {
                pic = 'https:' + pic;
            }
            //let cd = getFullTime(item.duration);

            video.vod_remarks = list.index_show;
            video.vod_id = list.media_id;
            video.vod_name = removeTags(list.title);
            video.vod_pic = pic;

            video.style = {
                type: 'rect',
                ratio: 1.33,
            },
                videos.push(video);
        }

        const result = {
            page: page,
            pagecount: data.numPages ?? (page + 1),
            limit: videos.length,
            total: videos.length * (page + 1),
            list: videos,
        };

        return JSON.stringify(result);
    } catch (e) { }
    return null;
}



