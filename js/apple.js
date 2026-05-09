/*
title: '小蘋果', author: '改写自apple.js'
*/
var HOST;
const MOBILE_UA = "okhttp/3.12.11";
var DefHeader = {'User-Agent': MOBILE_UA};
var KParams = {
    headers: {'User-Agent': MOBILE_UA},
    timeout: 8000
};

async function init(cfg) {
    try {
        let host = cfg.ext?.host?.trim() || 'http://23.237.228.133';
        HOST = host.replace(/\/$/, '');
        KParams.headers['Referer'] = 'http://c.xpgtv.net';
        let parseTimeout = parseInt(cfg.ext?.timeout?.trim(), 10);
        KParams.timeout = parseTimeout > 0 ? parseTimeout : 8000;
    } catch(e) {
        console.error('初始化参数失败：', e.message);
    }
}

async function home(filter) {
    try {
        let classes = [
            {type_name: '电影', type_id: '1'},
            {type_name: '电视', type_id: '2'},
            {type_name: '综艺', type_id: '3'},
            {type_name: '动漫', type_id: '4'}
        ];
        return JSON.stringify({
            class: classes,
            filters: {}
        });
    } catch (e) {
        console.error('获取分类失败：', e.message);
        return JSON.stringify({ class: [], filters: {} });
    }
}

async function homeVod() {
    try {
        let resObj = safeParseJSON(await request(`${HOST}/api.php/v2.vod/androidfilter10086?page=1&type=1`));
        let homeObj = resObj?.data ?? [];
        let VODS = getVodList(homeObj);
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
        let cateUrl = `${HOST}/api.php/v2.vod/androidfilter10086?page=${pg}&type=${tid}`;
        let resObj = safeParseJSON(await request(cateUrl));
        let cateObj = resObj?.data ?? [];
        let VODS = getVodList(cateObj);
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: 999,
            limit: 30,
            total: 30 * 999
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
        let searchUrl = `${HOST}/api.php/v2.vod/androidsearch10086?page=${pg}&wd=${encodeURIComponent(wd)}`;
        let resObj = safeParseJSON(await request(searchUrl));
        let searchObj = resObj?.data ?? [];
        let VODS = getVodList(searchObj);
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: 10,
            limit: 30,
            total: 300
        });
    } catch (e) {
        console.error('搜索页获取失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 30, total: 0 });
    }
}

async function detail(id) {
    try {
        let [kid, kname, kpic, kremarks] = id.split('@');
        let detailUrl = `${HOST}/api.php/v3.vod/androiddetail2?vod_id=${kid}`;
        let resObj = safeParseJSON(await request(detailUrl));
        let kvod = resObj?.data || null;
        if (!kvod) { throw new Error('详情解析失败'); }

        let ktype = kvod.className || '类型';
        let kyear = kvod.year || '1000';
        let karea = kvod.area || '地区';
        let klang = kvod.lang || '语言';
        let kdirector = kvod.director || '导演';
        let kactor = kvod.actor || '主演';
        let kcontent = kvod.content || '简介';
        let ktabs = [], kurls = [];

        let udArr = kvod.urls ?? [];
        udArr.forEach((it, i) => {
            let tab = it.key || `线路${i+1}`;
            // 跳过不可用线路
            if (tab.includes('及时雨')) return;
            let kurl = `播放$${it.url || 'noUrl'}`;
            ktabs.push(tab);
            kurls.push(kurl);
        });

        let VOD = {
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
        // id 是 base64 编码的 key，拼接成 m3u8 地址
        let playUrl = `${HOST}/m3u8/${id}.m3u8`;
        let playHeaders = {
            'token2': 'SnAXiSW8vScXE0Z9aDOnK5xffbO75w1+uPom3WjnYfVEA1oWtUdi2Ihy1N8=',
            'token': 'ElEDlwCVgXcFHFhddiq2JKteHofExRBUrfNlmHrWetU3VVkxnzJAodl52N9EUFS+Dig2A/fBa/V9RuoOZRBjYvI+GW8kx3+xMlRecaZuECdb/3AdGkYpkjW3wCnpMQxf8vVeCz5zQLDr8l8bUChJiLLJLGsI+yiNskiJTZz9HiGBZhZuWh1mV1QgYah5CLTbSz8=',
            'version': 'XPGBOX com.phoenix.tv1.5.7',
            'user_id': 'XPGBOX',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
            'screenx': '1280',
            'screeny': '720',
            'hash': 'd78a',
            'timestamp': `${Math.floor(Date.now() / 1000)}`
        };
        return JSON.stringify({
            jx: 0,
            parse: 0,
            url: playUrl,
            header: playHeaders
        });
    } catch (e) {
        console.error('播放失败：', e.message);
        return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
    }
}

function getVodList(listArr) {
    try {
        let kvods = [];
        listArr.forEach(it => {
            let vName = it.name || '名称';
            let vPic = it.pic || '';
            let vRemarks = it.state || '';
            kvods.push({
                vod_name: vName,
                vod_pic: vPic,
                vod_remarks: vRemarks,
                vod_id: `${it.id}@${vName}@${vPic}@${vRemarks}`,
            });
        });
        return kvods;
    } catch(e) {
        console.error('生成视频列表失败：', e.message);
        return [];
    }
}

function safeParseJSON(jStr) {
    try {
        return JSON.parse(jStr);
    } catch(e) {
        return null;
    }
}

async function request(reqUrl, options = {}) {
    if (typeof reqUrl !== 'string' || !reqUrl.trim()) { throw new Error('reqUrl需为字符串且非空'); }
    if (typeof options !== 'object' || Array.isArray(options) || !options) { throw new Error('options类型需为非null对象'); }
    try {
        options.method = options.method?.toLowerCase() || 'get';
        if (['get', 'head'].includes(options.method)) {
            delete options.data;
            delete options.postType;
        } else {
            options.data = options.data ?? '';
            options.postType = options.postType?.toLowerCase() || 'form';
        }
        let {headers, timeout, charset, toBase64 = false, ...restOpts } = options;
        const optObj = {
            headers: (typeof headers === 'object' && !Array.isArray(headers) && headers) ? headers : KParams.headers,
            timeout: parseInt(timeout, 10) > 0 ? parseInt(timeout, 10) : KParams.timeout,
            charset: charset?.toLowerCase() || 'utf-8',
            buffer: toBase64 ? 2 : 0,
            ...restOpts
        };
        const res = await req(reqUrl, optObj);
        if (options.withHeaders) {
            const resHeaders = typeof res.headers === 'object' && !Array.isArray(res.headers) && res.headers ? res.headers : {};
            const resWithHeaders = { ...resHeaders, body: res?.content ?? '' };
            return JSON.stringify(resWithHeaders);
        }
        return res?.content ?? '';
    } catch (e) {
        console.error(`${reqUrl}→请求失败：`, e.message);
        return options?.withHeaders ? JSON.stringify({ body: '' }) : '';
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
