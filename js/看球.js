/*
 * 88看球 - TVBox/FongMi 格式
 * 基于 OmniBox 版本转换，保留核心爬取逻辑
 * 格式：__jsEvalReturn() 导出，返回 JSON 字符串
 *
 * 说明：
 * 1. 接口：init / home / homeVod / category / search / detail / play
 * 2. playId 使用 Base64(JSON) 透传，播放阶段解码后返回 parse=1
 * 3. 源站无搜索功能，search 返回空
 */
var HOST = 'http://www.88kanqiu.cc';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
var DEFAULT_PIC = 'https://pic.imgdb.cn/item/657673d6c458853aeff94ab9.jpg';
var TIMEOUT = 60000;

var DEFAULT_HEADERS = {
    'User-Agent': UA,
    'Referer': HOST + '/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
};

// ========== 初始化 ==========

async function init(cfg) {
    try {
        var host = cfg.ext ? (cfg.ext.host || '').trim() : '';
        if (host) {
            HOST = host.replace(/\/+$/, '');
            DEFAULT_HEADERS['Referer'] = HOST + '/';
        }
        var timeoutStr = cfg.ext ? (cfg.ext.timeout || '').trim() : '';
        var parsedTimeout = parseInt(timeoutStr, 10);
        TIMEOUT = parsedTimeout > 0 ? parsedTimeout : 60000;
        log('88看球初始化完成, HOST=' + HOST);
    } catch (e) {
        log('初始化失败: ' + e.message);
    }
}

// ========== HTTP 请求 ==========

async function httpGet(url, headers) {
    try {
        var h = {};
        for (var k in DEFAULT_HEADERS) { h[k] = DEFAULT_HEADERS[k]; }
        if (headers) {
            for (var hk in headers) { h[hk] = headers[hk]; }
        }
        var res = await req(url, {
            headers: h,
            timeout: TIMEOUT
        });
        return res && res.content ? res.content : '';
    } catch (e) {
        log('请求失败: ' + url + ' -> ' + e.message);
        return '';
    }
}

// ========== Base64 编解码（纯 JS，无依赖） ==========

var _b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function e64(text) {
    try {
        var input = unescape(encodeURIComponent(String(text || '')));
        var output = '';
        for (var i = 0; i < input.length; i++) {
            var c = input.charCodeAt(i);
            if (c < 0x80) {
                output += String.fromCharCode(c);
            } else if (c < 0x800) {
                output += String.fromCharCode(0xC0 | (c >> 6));
                output += String.fromCharCode(0x80 | (c & 0x3F));
            } else {
                output += String.fromCharCode(0xE0 | (c >> 12));
                output += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                output += String.fromCharCode(0x80 | (c & 0x3F));
            }
        }
        var result = '';
        for (var j = 0; j < output.length; j += 3) {
            var a = output.charCodeAt(j);
            var b = j + 1 < output.length ? output.charCodeAt(j + 1) : 0;
            var c2 = j + 2 < output.length ? output.charCodeAt(j + 2) : 0;
            var b1 = (a >> 2) & 0x3F;
            var b2 = ((a & 0x3) << 4) | ((b >> 4) & 0xF);
            var b3 = ((b & 0xF) << 2) | ((c2 >> 6) & 0x3);
            var b4 = c2 & 0x3F;
            result += _b64chars.charAt(b1) + _b64chars.charAt(b2);
            result += (j + 1 < output.length) ? _b64chars.charAt(b3) : '=';
            result += (j + 2 < output.length) ? _b64chars.charAt(b4) : '=';
        }
        return result;
    } catch (e) {
        return '';
    }
}

function d64(encodedText) {
    try {
        var input = String(encodedText || '').replace(/[^A-Za-z0-9+/=]/g, '');
        var output = '';
        for (var i = 0; i < input.length; i += 4) {
            var b1 = _b64chars.indexOf(input.charAt(i));
            var b2 = _b64chars.indexOf(input.charAt(i + 1));
            var b3 = _b64chars.indexOf(input.charAt(i + 2));
            var b4 = _b64chars.indexOf(input.charAt(i + 3));
            if (b1 < 0) b1 = 0;
            if (b2 < 0) b2 = 0;
            if (b3 < 0) b3 = 0;
            if (b4 < 0) b4 = 0;
            var c1 = (b1 << 2) | (b2 >> 4);
            var c2 = ((b2 & 0xF) << 4) | (b3 >> 2);
            var c3 = ((b3 & 0x3) << 6) | b4;
            output += String.fromCharCode(c1);
            if (b3 !== 64) output += String.fromCharCode(c2);
            if (b4 !== 64) output += String.fromCharCode(c3);
        }
        return decodeURIComponent(escape(output));
    } catch (e) {
        return '';
    }
}

// ========== 工具函数 ==========

function stripHtml(value) {
    return String(value == null ? '' : value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function safeParseJSON(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
}

/**
 * 解析 vodId，兼容多种格式：
 * 1) 新格式：Base64(JSON { vid, name })
 * 2) 旧格式：${vid}###${encodeURIComponent(name)}
 * 3) 兜底：直接当 URL
 */
function parseVodId(rawId) {
    var idText = String(rawId || '');
    var realId = idText;
    var displayName = '赛事直播';

    // 新格式：Base64(JSON)
    var jsonText = d64(idText);
    if (jsonText && (jsonText.charAt(0) === '{' || jsonText.charAt(0) === '[')) {
        var parsed = safeParseJSON(jsonText);
        if (parsed && parsed.vid) {
            realId = String(parsed.vid);
            displayName = String(parsed.name || displayName);
            return { realId: realId, displayName: displayName };
        }
    }

    // 旧格式：vid###name
    if (idText.indexOf('###') >= 0) {
        var parts = idText.split('###', 2);
        realId = parts[0] || '';
        displayName = decodeURIComponent(parts[1] || '赛事直播');
        return { realId: realId, displayName: displayName };
    }

    return { realId: realId, displayName: displayName };
}

/**
 * 从 `-url` 接口返回中提取 links
 */
function parseLinksFromPlayApiResponse(responseBody) {
    if (!responseBody) return [];

    var data = responseBody;

    // 如果是字符串，尝试解析
    if (typeof data === 'string') {
        var parsed = safeParseJSON(data);
        if (parsed) data = parsed;
    }

    // 直接有 links
    if (data && data.data) {
        var raw = data.data;
        if (Array.isArray(raw.links)) return raw.links;
        if (typeof raw === 'object' && Array.isArray(raw.links)) return raw.links;

        // raw 是字符串
        if (typeof raw === 'string') {
            // 尝试直接 JSON
            var direct = safeParseJSON(raw);
            if (direct && Array.isArray(direct.links)) return direct.links;

            // 尝试去掉前缀后解析
            var trimmed = raw.substring(6, Math.max(6, raw.length - 2));
            var trimmedParsed = safeParseJSON(trimmed);
            if (trimmedParsed && Array.isArray(trimmedParsed.links)) return trimmedParsed.links;

            // 尝试 Base64 解码
            try {
                var decoded = d64(trimmed || raw);
                var decodedParsed = safeParseJSON(decoded);
                if (decodedParsed && Array.isArray(decodedParsed.links)) return decodedParsed.links;
            } catch (e) { /* ignore */ }
        }
    }

    return [];
}

// ========== 分类与筛选 ==========

function getClasses() {
    return [
        { type_id: '', type_name: '全部直播' },
        { type_id: '1', type_name: '篮球直播' },
        { type_id: '8', type_name: '足球直播' },
        { type_id: '21', type_name: '其他直播' }
    ];
}

function getFilters() {
    return {
        '1': [
            {
                key: 'cateId',
                name: '类型',
                value: [
                    { name: 'NBA', value: '1' },
                    { name: 'CBA', value: '2' },
                    { name: '篮球综合', value: '4' },
                    { name: '纬来体育', value: '21' }
                ]
            }
        ],
        '8': [
            {
                key: 'cateId',
                name: '类型',
                value: [
                    { name: '英超', value: '8' },
                    { name: '西甲', value: '9' },
                    { name: '意甲', value: '10' },
                    { name: '欧冠', value: '12' },
                    { name: '欧联', value: '13' },
                    { name: '德甲', value: '14' },
                    { name: '法甲', value: '15' },
                    { name: '欧国联', value: '16' },
                    { name: '足总杯', value: '27' },
                    { name: '国王杯', value: '33' },
                    { name: '中超', value: '7' },
                    { name: '亚冠', value: '11' },
                    { name: '足球综合', value: '23' },
                    { name: '欧协联', value: '28' },
                    { name: '美职联', value: '26' }
                ]
            }
        ]
    };
}

// ========== HTML 解析（替代 cheerio） ==========

/**
 * 解析赛事列表页 HTML
 */
function parseMatchListHtml(html) {
    var list = [];

    // 匹配 list-group-item
    var itemRe = /<a[^>]*class="[^"]*list-group-item[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
    var itemMatch;

    while ((itemMatch = itemRe.exec(html)) !== null) {
        var itemHtml = itemMatch[1];

        // 提取时间
        var timeMatch = itemHtml.match(/<span[^>]*class="[^"]*category-game-time[^"]*"[^>]*>([\s\S]*?)<\/span>/);
        var time = timeMatch ? stripHtml(timeMatch[1]) : '';

        // 提取赛事类型
        var typeMatch = itemHtml.match(/<span[^>]*class="[^"]*game-type[^"]*"[^>]*>([\s\S]*?)<\/span>/);
        var gameType = typeMatch ? stripHtml(typeMatch[1]) : '';

        // 提取队伍名称
        var teamNames = [];
        var teamRe = /<span[^>]*class="[^"]*team-name[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
        var tm;
        while ((tm = teamRe.exec(itemHtml)) !== null) {
            var tn = stripHtml(tm[1]);
            if (tn) teamNames.push(tn);
        }
        var homeTeam = teamNames.length > 0 ? teamNames[0] : '';
        var awayTeam = teamNames.length > 1 ? teamNames[teamNames.length - 1] : '';

        var name = (time + ' ' + gameType + ' ' + homeTeam + ' vs ' + awayTeam).trim();
        if (!name || name === 'vs') continue;

        // 提取链接和按钮文字
        var href = '';
        var remark = '暂无';
        var btnMatch = itemHtml.match(/<span[^>]*class="[^"]*btn[^"]*btn-primary[^"]*"[^>]*>([\s\S]*?)<\/span>/);
        if (!btnMatch) {
            btnMatch = itemHtml.match(/<span[^>]*class="[^"]*btn-primary[^"]*"[^>]*>([\s\S]*?)<\/span>/);
        }
        if (btnMatch) {
            remark = stripHtml(btnMatch[1]) || '暂无';
        }

        // 从 href 提取
        var hrefMatch = itemHtml.match(/href="([^"]*)"/);
        if (hrefMatch) {
            href = hrefMatch[1];
            if (href && href.indexOf('http') !== 0) {
                href = HOST + href;
            }
        }

        var vid = href || HOST;

        // 提取图片
        var pic = '';
        var imgMatch = itemHtml.match(/<img[^>]*(?:src|data-src)="([^"]*)"/);
        if (imgMatch) {
            pic = imgMatch[1];
            if (pic && pic.indexOf('http') !== 0) pic = HOST + pic;
        }
        if (!pic) pic = DEFAULT_PIC;

        var encodedId = e64(JSON.stringify({ vid: vid, name: name }));
        list.push({
            vod_id: encodedId,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: remark
        });
    }

    return list;
}

/**
 * 获取分类列表
 */
async function getCategoryList(type, extend) {
    extend = extend || {};
    try {
        var cateId = extend.cateId || type || '';
        var path = cateId ? '/match/' + cateId + '/live' : '';
        var url = HOST + path;

        var body = await httpGet(url);
        if (!body) {
            log('分类页返回空: ' + url);
            return { list: [], limit: 0 };
        }

        var list = parseMatchListHtml(body);
        return {
            list: list,
            limit: list.length
        };
    } catch (e) {
        log('获取分类列表失败: ' + e.message);
        return { list: [], limit: 0 };
    }
}

/**
 * 获取详情（含播放链接解析）
 */
async function getDetailById(rawId) {
    try {
        var parsed = parseVodId(rawId);
        var realId = parsed.realId;
        var displayName = parsed.displayName;

        if (!realId || realId === HOST) {
            return null;
        }

        var playUrlApi = realId + '-url';
        var body = await httpGet(playUrlApi, { 'Referer': realId });
        if (!body) {
            log('详情接口返回空: ' + playUrlApi);
            return null;
        }

        // 尝试解析 JSON
        var responseData = safeParseJSON(body) || {};
        var links = parseLinksFromPlayApiResponse(responseData);

        var episodes = [];
        for (var i = 0; i < links.length; i++) {
            var it = links[i];
            if (!it || !it.url) continue;

            var streamUrl = String(it.url || '').replace(/\*\*\*/g, '#');
            var playData = {
                url: streamUrl,
                headers: {
                    'User-Agent': UA,
                    'Referer': realId
                },
                name: String(it.name || ('直播源' + (i + 1)))
            };
            episodes.push({
                name: String(it.name || ('直播源' + (i + 1))),
                playId: e64(JSON.stringify(playData))
            });
        }

        return {
            vod_id: realId,
            vod_name: displayName,
            vod_pic: '',
            vod_content: '实时体育直播',
            vod_play_sources: [
                {
                    name: '88看球',
                    episodes: episodes
                }
            ]
        };
    } catch (e) {
        log('获取详情失败: ' + e.message);
        return null;
    }
}

// ========== 核心接口 ==========

async function home(filter) {
    try {
        var classes = getClasses();
        var filters = getFilters();
        var result = await getCategoryList('');

        log('首页: 分类=' + classes.length + ', 直播=' + (result.list || []).length);
        return JSON.stringify({
            'class': classes,
            filters: filters,
            list: result.list || []
        });
    } catch (e) {
        log('首页获取失败: ' + e.message);
        return JSON.stringify({
            'class': getClasses(),
            filters: getFilters(),
            list: []
        });
    }
}

async function homeVod() {
    try {
        var result = await getCategoryList('');
        return JSON.stringify({ list: result.list || [] });
    } catch (e) {
        log('推荐页获取失败: ' + e.message);
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    try {
        var result = await getCategoryList(tid, extend);
        var list = result.list || [];

        log('分类页: tid=' + tid + ', 结果=' + list.length);
        return JSON.stringify({
            list: list,
            page: 1,
            pagecount: 1,
            limit: list.length,
            total: list.length
        });
    } catch (e) {
        log('分类页获取失败: ' + e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 1, limit: 0, total: 0 });
    }
}

async function search(wd, quick, pg) {
    // 源站无搜索功能
    return JSON.stringify({
        list: [],
        page: parseInt(pg, 10) || 1,
        pagecount: 1,
        total: 0,
        limit: 0
    });
}

async function detail(id) {
    try {
        var vod = await getDetailById(id);

        if (!vod) {
            log('详情页未找到数据: ' + id);
            return JSON.stringify({ list: [] });
        }

        // 构建 TVBox 格式的播放线路
        var froms = [];
        var urls = [];

        if (vod.vod_play_sources) {
            for (var i = 0; i < vod.vod_play_sources.length; i++) {
                var source = vod.vod_play_sources[i];
                froms.push(source.name);
                var epParts = [];
                for (var j = 0; j < source.episodes.length; j++) {
                    var ep = source.episodes[j];
                    epParts.push(ep.name + '$' + ep.playId);
                }
                urls.push(epParts.join('#'));
            }
        }

        var vodResult = {
            vod_id: vod.vod_id,
            vod_name: vod.vod_name,
            vod_pic: vod.vod_pic || '',
            type_name: '',
            vod_remarks: '体育直播',
            vod_year: '',
            vod_area: '',
            vod_lang: '',
            vod_director: '',
            vod_actor: '',
            vod_content: vod.vod_content || '实时体育直播',
            vod_play_from: froms.join('$$$'),
            vod_play_url: urls.join('$$$')
        };

        log('详情页: name=' + vod.vod_name + ', 源数=' + froms.length);
        return JSON.stringify({ list: [vodResult] });
    } catch (e) {
        log('详情页获取失败: ' + e.message);
        return JSON.stringify({ list: [] });
    }
}

async function play(flag, id, flags) {
    try {
        var encoded = id || '';
        var decoded = d64(encoded);
        var playData = safeParseJSON(decoded) || {};

        if (!playData || !playData.url) {
            log('播放参数无效');
            return JSON.stringify({
                parse: 1,
                url: '',
                header: DEFAULT_HEADERS
            });
        }

        var header = {};
        for (var k in DEFAULT_HEADERS) { header[k] = DEFAULT_HEADERS[k]; }
        if (playData.headers) {
            for (var hk in playData.headers) { header[hk] = playData.headers[hk]; }
        }

        log('播放: url=' + playData.url.substring(0, 60) + '...');
        return JSON.stringify({
            parse: 1,
            url: playData.url,
            header: header
        });
    } catch (e) {
        log('播放失败: ' + e.message);
        return JSON.stringify({
            parse: 1,
            url: '',
            header: DEFAULT_HEADERS
        });
    }
}

// ========== 导出 ==========

function __jsEvalReturn() {
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
