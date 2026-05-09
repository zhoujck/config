/*
title: '意影视', author: '改写自zhoujck/v1.0'
*/
var HOST;
const MOBILE_UA = 'Android/OkHttp';
var DefHeader = { 'User-Agent': MOBILE_UA };
var KParams = {
    headers: { 'User-Agent': MOBILE_UA },
    timeout: 8000
};

const PUB_KEY =
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw4qpeOgv+MeXi57MVPqZF7SRmHR3FUelCTfrvI6vZ8kgTPpe1gMyP/8ZTvedTYjTDMqZBmn8o8Ym98yTx3zHaskPpmDR80e+rcRciPoYZcWNpwpFkrHp1l6Pjs9xHLXzf3U+N3a8QneY+jSMvgMbr00DC4XfvamfrkPMXQ+x9t3gNcP5YtuRhGFREBKP2q20gP783MCOBFwyxhZTIAsFiXrLkgZ97uaUAtqW6wtKR4HWpeaN+RLLxhBdnVjuMc9jaBl6sHMdSvTJgAajBTAd6LLA9cDmbGTxH7RGp//iZU86kFhxGl5yssZvBcx/K95ADeTmLKCsabexZVZ0Fu3dDQIDAQAB\n-----END PUBLIC KEY-----';

var token = '';
var appId = '';
var filterList = {};

function sha256(str) {
    return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
}

function genId() {
    const chars = '0123456789abcdef';
    let r = '';
    for (let i = 0; i < 16; i++) r += chars[Math.floor(Math.random() * 16)];
    return r;
}

function ts() {
    return Math.floor(Date.now() / 1000).toString();
}

function qs(obj) {
    return Object.keys(obj)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
        .join('&');
}

function rsaPubDecrypt(b64Data) {
    try {
        const JSEncrypt = loadJSEncrypt();
        const crypt = new JSEncrypt();
        crypt.setPublicKey(PUB_KEY);
        const rsaKey = crypt.getKey();
        const BI = rsaKey.n.constructor;

        const wa = CryptoJS.enc.Base64.parse(b64Data);
        let cipherHex = '';
        for (let i = 0; i < wa.sigBytes; i++) {
            const b = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            cipherHex += ('0' + b.toString(16)).slice(-2);
        }

        const biCipher = new BI(cipherHex, 16);
        const biResult = rsaKey.doPublic(biCipher);

        const modHexLen = rsaKey.n.toString(16).length;
        const modByteLen = Math.ceil(modHexLen / 2);
        let resultHex = biResult.toString(16);
        while (resultHex.length < modByteLen * 2) resultHex = '0' + resultHex;

        const bytes = [];
        for (let i = 0; i < resultHex.length; i += 2) {
            bytes.push(parseInt(resultHex.substring(i, i + 2), 16));
        }

        if (bytes.length >= 2 && bytes[0] === 0x00 && bytes[1] === 0x01) {
            for (let j = 2; j < bytes.length; j++) {
                if (bytes[j] === 0x00) {
                    const msg = bytes.slice(j + 1);
                    let s = '';
                    for (let k = 0; k < msg.length; k++) s += String.fromCharCode(msg[k]);
                    try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
                }
            }
        }
        let start = 0;
        while (start < bytes.length && bytes[start] === 0x00) start++;
        const msg = bytes.slice(start);
        let s = '';
        for (let k = 0; k < msg.length; k++) s += String.fromCharCode(msg[k]);
        try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
    } catch (e) {
        console.log('RSA decrypt error:', e.message || e);
        return '';
    }
}

function computeHash(params) {
    const keys = Object.keys(params).sort();
    const pairs = keys.map((k) => k + '=' + params[k]);
    const full = pairs.join('&') + '&token=' + token;
    return sha256(full);
}

function getHeaders(params) {
    const h = {
        'User-Agent': MOBILE_UA,
        Connection: 'Keep-Alive',
        'APP-ID': appId,
        Authorization: '',
    };
    if (params) h['X-HASH-Data'] = computeHash(params);
    return h;
}

function safeParseJSON(jStr) {
    try {
        return typeof jStr === 'object' ? jStr : JSON.parse(jStr);
    } catch (e) {
        return null;
    }
}

async function refreshToken() {
    const payload = { appID: appId, timestamp: ts() };
    try {
        const resp = await req(HOST + '/vod-app/index/getGenerateKey', {
            method: 'post',
            data: qs(payload),
            postType: 'form',
            headers: {
                ...getHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Auth-Flow': '1',
            },
        });
        const json = safeParseJSON(resp?.content ?? resp);
        if (json && json.data) {
            token = rsaPubDecrypt(json.data);
            return !!token;
        }
    } catch (e) {
        console.log('refreshToken error:', e.message || e);
    }
    return false;
}

async function apiReq(url, payload) {
    const headers = getHeaders(payload);
    const body = qs(payload);
    let resp = await req(url, {
        method: 'post',
        data: body,
        postType: 'form',
        headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    let content = resp?.content ?? (typeof resp === 'string' ? resp : JSON.stringify(resp));
    let json = safeParseJSON(content);
    if (!json || (!content && Object.keys(resp?.headers || {}).length === 0)) {
        await refreshToken();
        const h2 = getHeaders(payload);
        resp = await req(url, {
            method: 'post',
            data: body,
            postType: 'form',
            headers: { ...h2, 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        content = resp?.content ?? (typeof resp === 'string' ? resp : JSON.stringify(resp));
        json = safeParseJSON(content);
    }
    return json || {};
}

async function init(cfg) {
    try {
        HOST = (cfg.ext?.host?.trim() || 'https://aleig4ah.yiys05.com').replace(/\/$/, '');
        appId = genId();
        await refreshToken();
    } catch (e) {
        console.error('初始化失败：', e.message);
    }
}

async function home(filter) {
    try {
        if (!appId) appId = genId();
        if (!token) await refreshToken();

        const params = { timestamp: ts() };
        const resp = await req(HOST + '/vod-app/type/list?' + qs(params), {
            headers: getHeaders(params),
        });
        const json = safeParseJSON(resp?.content ?? resp);
        const items = json?.data || [];

        const classes = [];
        for (const item of items) {
            const tid = item.typeId.toString();
            classes.push({ type_name: item.typeName, type_id: tid });

            const ext = item.type_extend_obj;
            if (ext) {
                const filters = [];
                const mkFilter = (key, name, str) => {
                    const vals = [{ n: '全部', v: '' }];
                    if (str) {
                        str.split(',').forEach((s) => {
                            s = s.trim();
                            if (s) vals.push({ n: s, v: s });
                        });
                    }
                    filters.push({ key, name, value: vals });
                };
                if (ext.class) mkFilter('classType', '类型', ext.class);
                if (ext.area) mkFilter('area', '地区', ext.area);
                if (ext.lang) mkFilter('lang', '语言', ext.lang);
                if (ext.year) mkFilter('year', '年份', ext.year);
                filters.push({
                    key: 'sort',
                    name: '排序',
                    value: [
                        { n: '新上线', v: 'time' },
                        { n: '热播榜', v: 'hits_day' },
                        { n: '好评榜', v: 'score' },
                    ],
                });
                if (filters.length > 0) filterList[tid] = filters;
            }
        }

        return JSON.stringify({ class: classes, filters: filterList });
    } catch (e) {
        console.error('获取分类失败：', e.message);
        return JSON.stringify({ class: [], filters: {} });
    }
}

async function homeVod() {
    // 意影视无推荐接口，返回空
    return JSON.stringify({ list: [] });
}

async function category(tid, pg, filter, extend) {
    try {
        if (!appId) appId = genId();
        if (!token) await refreshToken();
        pg = parseInt(pg, 10) || 1;

        const raw = {
            tid: tid,
            page: pg,
            limit: '12',
            timestamp: ts(),
            classType: extend?.classType || '',
            area: extend?.area || '',
            lang: extend?.lang || '',
            year: extend?.year || '',
            by: extend?.sort || 'time',
        };
        const payload = {};
        for (const k of Object.keys(raw)) {
            if (raw[k] !== '' && raw[k] != null) payload[k] = raw[k];
        }

        const json = await apiReq(HOST + '/vod-app/vod/list', payload);
        const data = json.data || {};
        const items = data.data || [];
        const totalPage = data.totalPageCount || 1;

        const list = items.map((v) => ({
            vod_id: v.id.toString(),
            vod_name: v.name,
            vod_pic: v.vodPic,
            vod_remarks: v.vodRemarks || '',
        }));

        return JSON.stringify({
            list: list,
            page: pg,
            pagecount: totalPage,
            limit: 12,
            total: 12 * totalPage,
        });
    } catch (e) {
        console.error('类别页获取失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 12, total: 0 });
    }
}

async function detail(id) {
    try {
        if (!appId) appId = genId();
        if (!token) await refreshToken();

        const payload = {
            tid: '',
            timestamp: ts(),
            vodId: id.toString(),
        };
        const json = await apiReq(HOST + '/vod-app/vod/info', payload);
        const data = json.data || {};
        const sources = (data.vodSources || []).sort((a, b) => (a.sort || 0) - (b.sort || 0));

        const ktabs = [];
        const kurls = [];
        for (const src of sources) {
            const urls = (src.vodPlayList && src.vodPlayList.urls) || [];
            const kurl = urls.map((u) => `${src.sourceCode}$${u.url}`).join('#');
            if (kurl) {
                ktabs.push(src.sourceName || `线路${ktabs.length + 1}`);
                kurls.push(kurl);
            }
        }

        const vod = {
            vod_id: id.toString(),
            vod_name: data.vodName || '',
            vod_pic: data.vodPic || '',
            type_name: data.typeName || '',
            vod_remarks: data.vodRemark || '',
            vod_year: data.vodYear || '',
            vod_area: data.vodArea || '',
            vod_lang: data.vodLang || '',
            vod_director: data.vodDirector || '',
            vod_actor: data.vodActor || '',
            vod_content: data.vodContent || '',
            vod_play_from: ktabs.join('$$$'),
            vod_play_url: kurls.join('$$$'),
        };

        return JSON.stringify({ list: [vod] });
    } catch (e) {
        console.error('详情页获取失败：', e.message);
        return JSON.stringify({ list: [] });
    }
}

async function play(flag, id, flags) {
    try {
        if (!appId) appId = genId();
        if (!token) await refreshToken();

        // id 格式: url 或 sourceCode$url
        let sourceCode = '';
        let rawUrl = id;
        if (id.includes('$')) {
            const parts = id.split('$');
            sourceCode = parts[0];
            rawUrl = parts[1];
        }

        // 如果已经是直链格式，直接返回
        if (/\.(m3u8|mp4|mkv)/.test(rawUrl)) {
            return JSON.stringify({ jx: 0, parse: 0, url: rawUrl, header: DefHeader });
        }

        let urlEncode = rawUrl;
        if (rawUrl && rawUrl.startsWith('http')) {
            urlEncode = encodeURIComponent(rawUrl);
        }

        const payload = {
            sourceCode: sourceCode,
            timestamp: ts(),
            urlEncode: urlEncode,
        };
        const json = await apiReq(HOST + '/vod-app/vod/playUrl', payload);
        const data = json.data || {};
        const playUrl = data.url || '';

        if (playUrl && playUrl.startsWith('http')) {
            return JSON.stringify({ jx: 0, parse: 0, url: playUrl, header: DefHeader });
        }

        if (rawUrl && rawUrl.startsWith('http')) {
            return JSON.stringify({ jx: 0, parse: 0, url: rawUrl, header: DefHeader });
        }

        return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
    } catch (e) {
        console.error('播放失败：', e.message);
        return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
    }
}

async function search(wd, quick, pg) {
    try {
        if (!appId) appId = genId();
        if (!token) await refreshToken();
        pg = parseInt(pg, 10) || 1;

        const payload = {
            key: wd,
            limit: '20',
            page: pg.toString(),
            timestamp: ts(),
        };
        const json = await apiReq(HOST + '/vod-app/vod/segSearch', payload);
        const data = json.data || {};
        const items = data.data || [];
        const totalPage = data.totalPageCount || 1;

        const list = items.map((v) => ({
            vod_id: v.id.toString(),
            vod_name: v.name,
            vod_pic: v.vodPic,
            vod_remarks: v.vodRemarks || '',
        }));

        return JSON.stringify({
            list: list,
            page: pg,
            pagecount: totalPage,
            limit: 20,
            total: 20 * totalPage,
        });
    } catch (e) {
        console.error('搜索失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 20, total: 0 });
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
        proxy: null,
    };
}
