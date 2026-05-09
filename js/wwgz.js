/*
title: '农民影视', author: '改写自zhoujck/v1.0'
*/
var HOST;
const MOBILE_UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
var DefHeader = { 'User-Agent': MOBILE_UA };
var KParams = {
    headers: { 'User-Agent': MOBILE_UA },
    timeout: 8000,
};

const cheerio = createCheerio();

var filterList = {
    '1': [
        {
            key: 'type', name: '类型',
            value: [
                { n: '全部', v: '1' }, { n: '动作片', v: '5' }, { n: '喜剧片', v: '6' },
                { n: '爱情片', v: '7' }, { n: '科幻片', v: '8' }, { n: '恐怖片', v: '9' },
                { n: '剧情片', v: '10' }, { n: '战争片', v: '11' }, { n: '惊悚片', v: '12' },
                { n: '奇幻片', v: '13' },
            ],
        },
        {
            key: 'area', name: '地区',
            value: [
                { n: '全部', v: '' }, { n: '大陆', v: '大陆' }, { n: '香港', v: '香港' },
                { n: '台湾', v: '台湾' }, { n: '美国', v: '美国' }, { n: '日本', v: '日本' },
                { n: '韩国', v: '韩国' }, { n: '印度', v: '印度' }, { n: '泰国', v: '泰国' },
                { n: '英国', v: '英国' }, { n: '法国', v: '法国' }, { n: '加拿大', v: '加拿大' },
                { n: '西班牙', v: '西班牙' }, { n: '俄罗斯', v: '俄罗斯' }, { n: '其他', v: '其他' },
            ],
        },
        {
            key: 'year', name: '年份',
            value: [
                { n: '全部', v: '' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' },
                { n: '2024', v: '2024' }, { n: '2023', v: '2023' }, { n: '2022', v: '2022' },
                { n: '2021', v: '2021' }, { n: '2020', v: '2020' }, { n: '2019', v: '2019' },
                { n: '2018', v: '2018' }, { n: '2017', v: '2017' }, { n: '2016', v: '2016' },
                { n: '2015', v: '2015' }, { n: '2014', v: '2014' }, { n: '2013', v: '2013' },
                { n: '2012', v: '2012' }, { n: '2011', v: '2011' }, { n: '2010', v: '2010' },
                { n: '2009~2000', v: '2009~2000' },
            ],
        },
        {
            key: 'sort', name: '排序',
            value: [
                { n: '时间', v: 'time' }, { n: '人气', v: 'hits' }, { n: '评分', v: 'score' },
            ],
        },
    ],
    '2': [
        {
            key: 'type', name: '类型',
            value: [
                { n: '全部', v: '2' }, { n: '国产剧', v: '12' }, { n: '港台泰', v: '13' },
                { n: '日韩剧', v: '14' }, { n: '欧美剧', v: '15' },
            ],
        },
        {
            key: 'area', name: '地区',
            value: [
                { n: '全部', v: '' }, { n: '大陆', v: '大陆' }, { n: '香港', v: '香港' },
                { n: '台湾', v: '台湾' }, { n: '美国', v: '美国' }, { n: '日本', v: '日本' },
                { n: '韩国', v: '韩国' }, { n: '印度', v: '印度' }, { n: '泰国', v: '泰国' },
                { n: '英国', v: '英国' }, { n: '法国', v: '法国' }, { n: '加拿大', v: '加拿大' },
                { n: '西班牙', v: '西班牙' }, { n: '俄罗斯', v: '俄罗斯' }, { n: '其他', v: '其他' },
            ],
        },
        {
            key: 'year', name: '年份',
            value: [
                { n: '全部', v: '' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' },
                { n: '2024', v: '2024' }, { n: '2023', v: '2023' }, { n: '2022', v: '2022' },
                { n: '2021', v: '2021' }, { n: '2020', v: '2020' }, { n: '2019', v: '2019' },
                { n: '2018', v: '2018' }, { n: '2017', v: '2017' }, { n: '2016', v: '2016' },
                { n: '2015', v: '2015' }, { n: '2014', v: '2014' }, { n: '2013', v: '2013' },
                { n: '2012', v: '2012' }, { n: '2011', v: '2011' }, { n: '2010', v: '2010' },
            ],
        },
        {
            key: 'sort', name: '排序',
            value: [
                { n: '时间', v: 'time' }, { n: '人气', v: 'hits' }, { n: '评分', v: 'score' },
            ],
        },
    ],
    '3': [
        {
            key: 'area', name: '地区',
            value: [
                { n: '全部', v: '' }, { n: '大陆', v: '大陆' }, { n: '香港', v: '香港' },
                { n: '台湾', v: '台湾' }, { n: '美国', v: '美国' }, { n: '日本', v: '日本' },
                { n: '韩国', v: '韩国' }, { n: '印度', v: '印度' }, { n: '泰国', v: '泰国' },
                { n: '英国', v: '英国' }, { n: '法国', v: '法国' }, { n: '加拿大', v: '加拿大' },
                { n: '西班牙', v: '西班牙' }, { n: '俄罗斯', v: '俄罗斯' }, { n: '其他', v: '其他' },
            ],
        },
        {
            key: 'year', name: '年份',
            value: [
                { n: '全部', v: '' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' },
                { n: '2024', v: '2024' }, { n: '2023', v: '2023' }, { n: '2022', v: '2022' },
                { n: '2021', v: '2021' }, { n: '2020', v: '2020' }, { n: '2019', v: '2019' },
                { n: '2018', v: '2018' }, { n: '2017', v: '2017' }, { n: '2016', v: '2016' },
                { n: '2015', v: '2015' }, { n: '2014', v: '2014' }, { n: '2013', v: '2013' },
                { n: '2012', v: '2012' }, { n: '2011', v: '2011' }, { n: '2010', v: '2010' },
            ],
        },
        {
            key: 'sort', name: '排序',
            value: [
                { n: '时间', v: 'time' }, { n: '人气', v: 'hits' }, { n: '评分', v: 'score' },
            ],
        },
    ],
    '4': [
        {
            key: 'area', name: '地区',
            value: [
                { n: '全部', v: '' }, { n: '大陆', v: '大陆' }, { n: '香港', v: '香港' },
                { n: '台湾', v: '台湾' }, { n: '美国', v: '美国' }, { n: '日本', v: '日本' },
                { n: '韩国', v: '韩国' }, { n: '印度', v: '印度' }, { n: '泰国', v: '泰国' },
                { n: '英国', v: '英国' }, { n: '法国', v: '法国' }, { n: '加拿大', v: '加拿大' },
                { n: '西班牙', v: '西班牙' }, { n: '俄罗斯', v: '俄罗斯' }, { n: '其他', v: '其他' },
            ],
        },
        {
            key: 'year', name: '年份',
            value: [
                { n: '全部', v: '' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' },
                { n: '2024', v: '2024' }, { n: '2023', v: '2023' }, { n: '2022', v: '2022' },
                { n: '2021', v: '2021' }, { n: '2020', v: '2020' }, { n: '2019', v: '2019' },
                { n: '2018', v: '2018' }, { n: '2017', v: '2017' }, { n: '2016', v: '2016' },
                { n: '2015', v: '2015' }, { n: '2014', v: '2014' }, { n: '2013', v: '2013' },
                { n: '2012', v: '2012' }, { n: '2011', v: '2011' }, { n: '2010', v: '2010' },
            ],
        },
        {
            key: 'sort', name: '排序',
            value: [
                { n: '时间', v: 'time' }, { n: '人气', v: 'hits' }, { n: '评分', v: 'score' },
            ],
        },
    ],
};

function safeParseJSON(jStr) {
    try {
        return typeof jStr === 'object' ? jStr : JSON.parse(jStr);
    } catch (e) {
        return null;
    }
}

async function request(reqUrl, options = {}) {
    if (typeof reqUrl !== 'string' || !reqUrl.trim()) {
        throw new Error('reqUrl需为字符串且非空');
    }
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
            ...restOpts,
        };
        const res = await req(reqUrl, optObj);
        return res?.content ?? '';
    } catch (e) {
        console.error(`${reqUrl}→请求失败：`, e.message);
        return '';
    }
}

async function init(cfg) {
    try {
        HOST = (cfg.ext?.host?.trim() || 'https://vip.wwgz.cn:5200').replace(/\/$/, '');
        KParams.headers['Referer'] = HOST + '/';
    } catch (e) {
        console.error('初始化失败：', e.message);
    }
}

async function home(filter) {
    const classes = [
        { type_name: '电影', type_id: '1' },
        { type_name: '连续剧', type_id: '2' },
        { type_name: '综艺', type_id: '3' },
        { type_name: '动漫', type_id: '4' },
        { type_name: '短剧', type_id: '26' },
    ];
    return JSON.stringify({ class: classes, filters: filterList });
}

async function homeVod() {
    return JSON.stringify({ list: [] });
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10) || 1;
        const typeId = extend?.type || tid;
        const sortBy = extend?.sort || 'time';
        const year = extend?.year || '0';
        const area = extend?.area || '';

        const url = `${HOST}/vod-list-id-${typeId}-pg-${pg}-order--by-${sortBy}-class-0-year-${year}-letter--area-${area}-lang-.html`;

        const html = await request(url);
        const $ = cheerio.load(html);
        const list = [];

        $('.globalPicList > ul li').each((_, element) => {
            const href = $(element).find('a').attr('href') || '';
            const title = $(element).find('a').attr('title') || '';
            const cover = $(element).find('img').attr('src') || '';
            const subTitle = $(element).find('.sDes').text().trim();
            list.push({
                vod_id: href,
                vod_name: title,
                vod_pic: cover,
                vod_remarks: subTitle || '',
            });
        });

        return JSON.stringify({
            list: list,
            page: pg,
            pagecount: 999,
            limit: 30,
            total: 30 * 999,
        });
    } catch (e) {
        console.error('类别页获取失败：', e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 30, total: 0 });
    }
}

async function detail(id) {
    try {
        const detailUrl = id.startsWith('http') ? id : HOST + id;
        const html = await request(detailUrl);
        const $ = cheerio.load(html);

        // 从详情页提取基本信息
        const vodName = $('h1 a').first().text().trim() || $('h1').first().text().trim() || '';
        const vodPic = $('section.page-hd img').first().attr('src') || '';
        const vodRemarks = '';
        const vodYear = '';
        const vodArea = '';

        // 取所有播放线路和集数（从详情页的 numList 中获取）
        const ktabs = [];
        const kurls = [];

        const tabEls = $('#leftTabBox .hd ul li');
        const listEls = $('#leftTabBox .bd .numList');

        tabEls.each((i, tabEl) => {
            const tabName = $(tabEl).find('a').text().trim() || `线路${i + 1}`;
            const listUl = listEls.eq(i);
            const eps = [];
            listUl.find('li a').each((_, aEl) => {
                const epName = $(aEl).text().trim();
                const epHref = $(aEl).attr('href') || '';
                const epUrl = epHref.startsWith('http') ? epHref : HOST + epHref;
                if (epName && epUrl) {
                    eps.push(`${epName}$${epUrl}`);
                }
            });
            if (eps.length > 0) {
                ktabs.push(tabName);
                kurls.push(eps.join('#'));
            }
        });

        const vod = {
            vod_id: id,
            vod_name: vodName,
            vod_pic: vodPic,
            type_name: '',
            vod_remarks: vodRemarks,
            vod_year: vodYear,
            vod_area: vodArea,
            vod_lang: '',
            vod_director: '',
            vod_actor: '',
            vod_content: '',
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
        // id 是播放页 URL，如 /vod-play-id-xxx-src-x-num-x.html
        const playPageUrl = id.startsWith('http') ? id : HOST + id;

        // 如果已经是直链格式，直接返回
        if (/\.(m3u8|mp4|mkv)/.test(id)) {
            return JSON.stringify({ jx: 0, parse: 0, url: id, header: DefHeader });
        }

        // 访问播放页获取 mac_url
        const html = await request(playPageUrl);
        const macUrlMatch = html.match(/mac_url\s*=\s*'([^']+)'/);
        if (!macUrlMatch) {
            return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
        }

        // mac_url 格式: "第01集$encodedUrl#第02集$encodedUrl2..."
        // 取第一个播放地址的编码 URL
        const macUrlStr = macUrlMatch[1];
        const firstEp = macUrlStr.split('$$$')[0].split('#')[0];
        const encodedUrl = firstEp.split('$')[1] || '';

        if (!encodedUrl) {
            return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
        }

        // 通过第三方解析接口获取真实播放地址
        const parseUrl = `https://api.nmvod.me:520/player/?url=${encodedUrl}`;
        const playerHtml = await request(parseUrl, {
            headers: {
                ...KParams.headers,
                Referer: HOST + '/',
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-dest': 'iframe',
            },
        });

        const match = playerHtml.match(/var\s+config\s*=\s*(\{[\s\S]*?\})/);
        if (match) {
            const configStr = match[1];
            const urlMatch = configStr.match(/url":\s*"(.+)"/);
            if (urlMatch) {
                return JSON.stringify({ jx: 0, parse: 0, url: urlMatch[1], header: DefHeader });
            }
        }

        return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
    } catch (e) {
        console.error('播放失败：', e.message);
        return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10) || 1;
        if (pg > 1) return JSON.stringify({ list: [], page: pg, pagecount: 0, limit: 20, total: 0 });

        const url = `${HOST}/index.php?m=vod-search`;
        const body = `wd=${encodeURIComponent(wd)}`;

        const html = await request(url, {
            method: 'post',
            data: body,
            postType: 'form',
            headers: {
                ...KParams.headers,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const $ = cheerio.load(html);
        const list = [];

        $('#search_main ul li').each((_, element) => {
            const href = $(element).find('.pic a').attr('href') || '';
            const title = $(element).find('.sTit').text().trim();
            const cover = $(element).find('img').attr('data-src') || $(element).find('img').attr('src') || '';
            const subTitle = $(element).find('.sStyle').text().trim();
            list.push({
                vod_id: href,
                vod_name: title,
                vod_pic: cover,
                vod_remarks: subTitle || '',
            });
        });

        return JSON.stringify({
            list: list,
            page: 1,
            pagecount: 1,
            limit: 20,
            total: list.length,
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
