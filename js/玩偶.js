/*
 * 玩偶 - TVBox/FongMi 格式
 * 基于 OmniBox 版本转换，保留核心爬取逻辑
 * 格式：__jsEvalReturn() 导出，返回 JSON 字符串
 */

var HOST = '';
var MOBILE_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
var TIMEOUT = 15000;

// 多域名容灾列表（可通过 ext.host 覆盖第一个）
var WEB_SITES = [
    'https://wogg.xxooo.cf',
    'https://wogg.333232.xyz',
    'https://www.wogg.net'
];

// 网盘排序顺序
var DRIVE_ORDER = ['baidu', 'tianyi', 'quark', 'uc', '115', 'xunlei', 'ali', '123pan'];

var DEF_HEADERS = {
    'User-Agent': MOBILE_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
};

// ========== 初始化 ==========

async function init(cfg) {
    try {
        var host = cfg.ext ? (cfg.ext.host || '').trim() : '';
        if (host) {
            WEB_SITES[0] = host.replace(/\/+$/, '');
        }
        HOST = WEB_SITES[0];

        var timeoutStr = cfg.ext ? (cfg.ext.timeout || '').trim() : '';
        var parsedTimeout = parseInt(timeoutStr, 10);
        TIMEOUT = parsedTimeout > 0 ? parsedTimeout : 15000;

        log('初始化完成, HOST=' + HOST + ', TIMEOUT=' + TIMEOUT);
    } catch (e) {
        log('初始化失败: ' + e.message);
    }
}

// ========== HTTP 请求（带多域名容灾） ==========

async function requestWithFailover(path, options) {
    options = options || {};
    var lastError = null;
    var perDomainTimeout = Math.max(5000, Math.floor(TIMEOUT / WEB_SITES.length));

    for (var i = 0; i < WEB_SITES.length; i++) {
        var baseUrl = removeTrailingSlash(WEB_SITES[i]);
        var fullUrl = path.indexOf('http') === 0 ? path : baseUrl + path;

        try {
            var headers = {};
            for (var k in DEF_HEADERS) { headers[k] = DEF_HEADERS[k]; }
            if (options.headers) {
                for (var h in options.headers) { headers[h] = options.headers[h]; }
            }
            headers['Referer'] = baseUrl + '/';

            var reqOptions = {
                headers: headers,
                timeout: options.timeout || perDomainTimeout
            };
            if (options.method) {
                reqOptions.method = options.method;
            }
            if (options.data !== undefined) {
                reqOptions.data = options.data;
                reqOptions.postType = options.postType || 'form';
            }

            var res = await req(fullUrl, reqOptions);
            var body = res && res.content ? res.content : '';

            if (body && body.length > 0) {
                // 检测 CF 盾拦截页
                if (isBlockedHtml(body)) {
                    log('域名 ' + baseUrl + ' 命中风控页, 跳过');
                    lastError = new Error('命中风控页面');
                    continue;
                }
                log('域名 ' + baseUrl + ' 请求成功, body长度=' + body.length);
                return { body: body, baseUrl: baseUrl };
            } else {
                log('域名 ' + baseUrl + ' 返回空内容');
                lastError = new Error('空响应');
            }
        } catch (e) {
            log('域名 ' + baseUrl + ' 请求失败: ' + e.message);
            lastError = e;
        }
    }

    throw lastError || new Error('所有域名请求均失败');
}

function isBlockedHtml(body) {
    if (!body) return false;
    var lower = body.toLowerCase();
    return lower.indexOf('just a moment') >= 0 ||
           lower.indexOf('cf-browser-verification') >= 0 ||
           lower.indexOf('captcha') >= 0 ||
           lower.indexOf('访问验证') >= 0;
}

function removeTrailingSlash(url) {
    return url ? url.replace(/\/+$/, '') : '';
}

// ========== 工具函数 ==========

function stripHtml(value) {
    return String(value == null ? '' : value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function safeParseJSON(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
}

function resolveUrl(baseUrl, url) {
    if (!url) return '';
    if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return url;
    if (url.indexOf('//') === 0) return 'https:' + url;
    return baseUrl + (url.indexOf('/') === 0 ? url : '/' + url);
}

function getAttr(html, attr) {
    var re = new RegExp(attr + '="([^"]*)"');
    var m = html.match(re);
    return m ? m[1] : '';
}

function getAttrSingle(html, attr) {
    var re = new RegExp(attr + "=\'([^\']*)\'");
    var m = html.match(re);
    return m ? m[1] : '';
}

function extractBetween(html, startTag, endTag) {
    var si = html.indexOf(startTag);
    if (si < 0) return '';
    si += startTag.length;
    var ei = html.indexOf(endTag, si);
    if (ei < 0) return html.substring(si);
    return html.substring(si, ei);
}

function inferDriveType(name) {
    if (!name) return '';
    var lower = name.toLowerCase();
    if (lower.indexOf('百度') >= 0) return 'baidu';
    if (lower.indexOf('天翼') >= 0) return 'tianyi';
    if (lower.indexOf('夸克') >= 0) return 'quark';
    if (lower === 'uc' || lower.indexOf('uc') >= 0) return 'uc';
    if (lower.indexOf('115') >= 0) return '115';
    if (lower.indexOf('迅雷') >= 0) return 'xunlei';
    if (lower.indexOf('阿里') >= 0) return 'ali';
    if (lower.indexOf('123') >= 0) return '123pan';
    return lower;
}

function sortByDriveOrder(sources) {
    if (!sources || sources.length <= 1) return sources;
    var orderMap = {};
    for (var i = 0; i < DRIVE_ORDER.length; i++) {
        orderMap[DRIVE_ORDER[i]] = i;
    }
    return sources.slice().sort(function(a, b) {
        var aType = inferDriveType(a.name || '');
        var bType = inferDriveType(b.name || '');
        var aOrder = orderMap.hasOwnProperty(aType) ? orderMap[aType] : 9999;
        var bOrder = orderMap.hasOwnProperty(bType) ? orderMap[bType] : 9999;
        return aOrder - bOrder;
    });
}

// ========== 核心接口 ==========

async function home(filter) {
    try {
        var result = await requestWithFailover('/');
        var body = result.body;
        var baseUrl = result.baseUrl;

        var classes = [];
        var list = [];

        // 从导航菜单提取分类（tab-items）
        var tabRe = /<div[^>]*class="[^"]*module-tab-item[^"]*"[^>]*data-id="(\d+)"[^>]*data-name="([^"]*)"[^>]*>/gi;
        var tabMatch;
        while ((tabMatch = tabRe.exec(body)) !== null) {
            var typeId = tabMatch[1];
            var typeName = tabMatch[2];
            if (typeId && typeId !== '0' && typeName) {
                classes.push({
                    type_id: typeId,
                    type_name: typeName.trim()
                });
            }
        }

        // 也尝试不带 data-id 前缀的格式
        if (classes.length === 0) {
            var tabRe2 = /data-id="(\d+)"[^>]*data-name="([^"]*)"/gi;
            while ((tabMatch = tabRe2.exec(body)) !== null) {
                var typeId2 = tabMatch[1];
                var typeName2 = tabMatch[2];
                if (typeId2 && typeId2 !== '0' && typeName2) {
                    classes.push({
                        type_id: typeId2,
                        type_name: typeName2.trim()
                    });
                }
            }
        }

        // 提取首页影片列表
        var moduleRe = /<div[^>]*class="[^"]*module\b[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*module\b[^"]*"|$)/gi;
        var firstModule = moduleRe.exec(body);
        var moduleHtml = firstModule ? firstModule[1] : body;

        // 提取 module-item
        var itemRe = /<div[^>]*class="[^"]*module-item\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*module-item|<\/div>)/gi;
        var itemMatch;
        var count = 0;

        while ((itemMatch = itemRe.exec(moduleHtml)) !== null && count < 30) {
            var itemHtml = itemMatch[1];
            var href = '';
            var vodName = '';
            var vodPic = '';
            var vodRemarks = '';

            // 提取链接
            var linkMatch = itemHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/);
            if (linkMatch) href = linkMatch[1];

            // 提取图片和名称
            var imgMatch = itemHtml.match(/<img[^>]*(?:data-src|src)="([^"]*)"[^>]*alt="([^"]*)"/);
            if (!imgMatch) {
                imgMatch = itemHtml.match(/<img[^>]*alt="([^"]*)"[^>]*(?:data-src|src)="([^"]*)"/);
                if (imgMatch) {
                    vodPic = imgMatch[2];
                    vodName = imgMatch[1];
                    imgMatch = [null, vodPic, vodName]; // normalize
                }
            }
            if (imgMatch) {
                vodPic = imgMatch[1];
                vodName = imgMatch[2];
            }

            // 提取备注
            var remarkMatch = itemHtml.match(/<div[^>]*class="[^"]*module-item-text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
            if (remarkMatch) vodRemarks = stripHtml(remarkMatch[1]);

            if (href && vodName) {
                list.push({
                    vod_id: href,
                    vod_name: vodName.trim(),
                    vod_pic: resolveUrl(baseUrl, vodPic),
                    type_id: '',
                    type_name: '',
                    vod_remarks: vodRemarks,
                    vod_year: ''
                });
                count++;
            }
        }

        // 获取动态筛选条件
        var filters = {};
        try {
            filters = await getDynamicFilters(body, baseUrl);
        } catch (fe) {
            log('获取筛选条件失败: ' + fe.message);
        }

        log('首页: 分类=' + classes.length + ', 影片=' + list.length);
        return JSON.stringify({
            'class': classes,
            filters: filters,
            list: list
        });
    } catch (e) {
        log('首页获取失败: ' + e.message);
        return JSON.stringify({ 'class': [], filters: {}, list: [] });
    }
}

async function homeVod() {
    try {
        var result = await requestWithFailover('/');
        var body = result.body;
        var baseUrl = result.baseUrl;
        var list = [];

        var moduleRe = /<div[^>]*class="[^"]*module\b[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*module\b[^"]*"|$)/i;
        var firstModule = moduleRe.exec(body);
        var moduleHtml = firstModule ? firstModule[1] : body;

        var itemRe = /<div[^>]*class="[^"]*module-item\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*module-item|<\/div>)/gi;
        var itemMatch;
        var count = 0;

        while ((itemMatch = itemRe.exec(moduleHtml)) !== null && count < 20) {
            var itemHtml = itemMatch[1];
            var href = '';
            var vodName = '';
            var vodPic = '';
            var vodRemarks = '';

            var linkMatch = itemHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/);
            if (linkMatch) href = linkMatch[1];

            var imgMatch = itemHtml.match(/<img[^>]*(?:data-src|src)="([^"]*)"[^>]*alt="([^"]*)"/);
            if (!imgMatch) {
                imgMatch = itemHtml.match(/<img[^>]*alt="([^"]*)"[^>]*(?:data-src|src)="([^"]*)"/);
                if (imgMatch) imgMatch = [null, imgMatch[2], imgMatch[1]];
            }
            if (imgMatch) {
                vodPic = imgMatch[1];
                vodName = imgMatch[2];
            }

            var remarkMatch = itemHtml.match(/<div[^>]*class="[^"]*module-item-text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
            if (remarkMatch) vodRemarks = stripHtml(remarkMatch[1]);

            if (href && vodName) {
                list.push({
                    vod_id: href,
                    vod_name: vodName.trim(),
                    vod_pic: resolveUrl(baseUrl, vodPic),
                    vod_remarks: vodRemarks
                });
                count++;
            }
        }

        return JSON.stringify({ list: list });
    } catch (e) {
        log('推荐页获取失败: ' + e.message);
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;

        var area = (extend && extend.area) || '';
        var sort = (extend && extend.sort) || '';
        var cls = (extend && extend['class']) || '';
        var letter = (extend && extend.letter) || '';
        var year = (extend && extend.year) || '';

        var url = '/vodshow/' + tid + '-' + area + '-' + sort + '-' + cls + '--' + letter + '---' + pg + '---' + year + '.html';

        var result = await requestWithFailover(url);
        var body = result.body;
        var baseUrl = result.baseUrl;

        var videos = [];

        // 解析视频列表项
        var itemRe = /<div[^>]*class="[^"]*module-item\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*module-item|<\/div>)/gi;
        var itemMatch;

        while ((itemMatch = itemRe.exec(body)) !== null) {
            var itemHtml = itemMatch[1];
            var href = '';
            var vodName = '';
            var vodPic = '';
            var vodRemarks = '';
            var vodYear = '';

            var linkMatch = itemHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/);
            if (linkMatch) href = linkMatch[1];

            var imgMatch = itemHtml.match(/<img[^>]*(?:data-src|src)="([^"]*)"[^>]*alt="([^"]*)"/);
            if (!imgMatch) {
                imgMatch = itemHtml.match(/<img[^>]*alt="([^"]*)"[^>]*(?:data-src|src)="([^"]*)"/);
                if (imgMatch) imgMatch = [null, imgMatch[2], imgMatch[1]];
            }
            if (imgMatch) {
                vodPic = imgMatch[1];
                vodName = imgMatch[2];
            }

            var remarkMatch = itemHtml.match(/<div[^>]*class="[^"]*module-item-text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
            if (remarkMatch) vodRemarks = stripHtml(remarkMatch[1]);

            var yearMatch = itemHtml.match(/<div[^>]*class="[^"]*module-item-caption[^"]*"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);
            if (yearMatch) vodYear = stripHtml(yearMatch[1]);

            if (href && vodName) {
                videos.push({
                    vod_id: href,
                    vod_name: vodName.trim(),
                    vod_pic: resolveUrl(baseUrl, vodPic),
                    type_id: tid,
                    type_name: '',
                    vod_remarks: vodRemarks,
                    vod_year: vodYear
                });
            }
        }

        log('分类页: tid=' + tid + ', pg=' + pg + ', 结果=' + videos.length);
        return JSON.stringify({
            list: videos,
            page: pg,
            pagecount: pg + (videos.length >= 20 ? 1 : 0),
            limit: 20,
            total: pg * 20 + (videos.length >= 20 ? 1 : 0)
        });
    } catch (e) {
        log('分类页获取失败: ' + e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 20, total: 0 });
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10);
        pg = pg > 0 ? pg : 1;

        var searchPath = '/vodsearch/-------------.html?wd=' + encodeURIComponent(wd);
        var result = await requestWithFailover(searchPath);
        var body = result.body;
        var baseUrl = result.baseUrl;

        var videos = [];

        // 解析搜索结果
        var searchItemRe = /<div[^>]*class="[^"]*module-search-item[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*module-search-item|<div[^>]*class="[^"]*page|<\/body)/gi;
        var searchMatch;

        while ((searchMatch = searchItemRe.exec(body)) !== null) {
            var itemHtml = searchMatch[1];
            var href = '';
            var vodName = '';
            var vodPic = '';
            var vodRemarks = '';

            // 提取 video-serial 链接（主要的详情链接）
            var serialMatch = itemHtml.match(/<a[^>]*class="[^"]*video-serial[^"]*"[^>]*href="([^"]*)"[^>]*title="([^"]*)"[^>]*>/);
            if (!serialMatch) {
                serialMatch = itemHtml.match(/<a[^>]*href="([^"]*)"[^>]*class="[^"]*video-serial[^"]*"[^>]*title="([^"]*)"[^>]*>/);
            }
            if (serialMatch) {
                href = serialMatch[1];
                vodName = serialMatch[2];
            }

            // 提取图片
            var imgMatch = itemHtml.match(/<img[^>]*(?:data-src|src)="([^"]*)"[^>]*(?:alt|title)="([^"]*)"/);
            if (imgMatch) {
                if (!vodName) vodName = imgMatch[2];
                vodPic = imgMatch[1];
            }

            // 提取备注文本
            var serialTextMatch = itemHtml.match(/<a[^>]*class="[^"]*video-serial[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            if (serialTextMatch) vodRemarks = stripHtml(serialTextMatch[1]);

            if (href && vodName) {
                videos.push({
                    vod_id: href,
                    vod_name: vodName.trim(),
                    vod_pic: resolveUrl(baseUrl, vodPic),
                    type_id: '',
                    type_name: '',
                    vod_remarks: vodRemarks
                });
            }
        }

        // 备用解析：如果没有搜到，尝试更宽泛的匹配
        if (videos.length === 0) {
            var altRe = /<a[^>]*href="(\/voddetail\/[^"]*)"[^>]*title="([^"]*)"[^>]*>/gi;
            var altMatch;
            while ((altMatch = altRe.exec(body)) !== null) {
                videos.push({
                    vod_id: altMatch[1],
                    vod_name: altMatch[2].trim(),
                    vod_pic: '',
                    type_id: '',
                    type_name: '',
                    vod_remarks: ''
                });
            }
        }

        log('搜索: wd=' + wd + ', pg=' + pg + ', 结果=' + videos.length);
        return JSON.stringify({
            list: videos,
            page: pg,
            pagecount: pg + (videos.length >= 20 ? 1 : 0),
            limit: 20,
            total: pg * 20 + (videos.length >= 20 ? 1 : 0)
        });
    } catch (e) {
        log('搜索失败: ' + e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 0, limit: 20, total: 0 });
    }
}

async function detail(id) {
    try {
        var result = await requestWithFailover(id);
        var body = result.body;
        var baseUrl = result.baseUrl;

        // 提取标题
        var titleMatch = body.match(/<h1[^>]*class="[^"]*page-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/);
        var vodName = titleMatch ? stripHtml(titleMatch[1]) : '';

        // 提取海报
        var posterRe = /<div[^>]*class="[^"]*mobile-play[^"]*"[\s\S]*?<img[^>]*(?:data-src|src)="([^"]*)"/i;
        var posterMatch = body.match(posterRe);
        var vodPic = posterMatch ? resolveUrl(baseUrl, posterMatch[1]) : '';

        // 也尝试 lazyload 格式
        if (!vodPic) {
            var lazyMatch = body.match(/<img[^>]*class="[^"]*lazyload[^"]*"[^>]*(?:data-src|src)="([^"]*)"/);
            if (lazyMatch) vodPic = resolveUrl(baseUrl, lazyMatch[1]);
        }

        var vodYear = '';
        var vodDirector = '';
        var vodActor = '';
        var vodContent = '';

        // 提取视频信息（导演、主演、年份、简介等）
        var infoItemRe = /<div[^>]*class="[^"]*video-info-itemtitle[^"]*"[^>]*>([\s\S]*?)<\/div>([\s\S]*?)(?=<div[^>]*class="[^"]*video-info-itemtitle|<\/div>\s*<\/div>\s*<div[^>]*class="[^"]*(?!video-info))/gi;
        var infoMatch;

        while ((infoMatch = infoItemRe.exec(body)) !== null) {
            var key = stripHtml(infoMatch[1]);
            var valueHtml = infoMatch[2];
            var valueText = stripHtml(valueHtml);
            // 提取链接文本
            var linkTexts = [];
            var linkRe = /<a[^>]*>([\s\S]*?)<\/a>/gi;
            var lm;
            while ((lm = linkRe.exec(valueHtml)) !== null) {
                var lt = stripHtml(lm[1]);
                if (lt) linkTexts.push(lt);
            }
            var linkValue = linkTexts.join(', ');

            if (key.indexOf('导演') >= 0) {
                vodDirector = linkValue || valueText;
            } else if (key.indexOf('主演') >= 0) {
                vodActor = linkValue || valueText;
            } else if (key.indexOf('年份') >= 0 || key.indexOf('年代') >= 0) {
                vodYear = linkValue || valueText;
            } else if (key.indexOf('剧情') >= 0 || key.indexOf('简介') >= 0) {
                var pMatch = valueHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/);
                vodContent = pMatch ? stripHtml(pMatch[1]) : valueText;
            } else if (key.indexOf('年份') < 0 && !vodYear) {
                // 尝试从其他字段提取年份
                var yearCandidate = linkValue || valueText;
                if (/^\d{4}$/.test(yearCandidate)) vodYear = yearCandidate;
            }
        }

        // 提取网盘链接
        var panUrls = [];
        var panRe = /<div[^>]*class="[^"]*module-row-info[^"]*"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
        var panMatch;

        while ((panMatch = panRe.exec(body)) !== null) {
            var linkText = panMatch[1].trim();
            // 提取纯 URL
            var urlMatch = linkText.match(/(https?:\/\/[^\s<"]+)/);
            if (urlMatch) {
                panUrls.push(urlMatch[1].trim());
            } else if (linkText.indexOf('http') === 0 || linkText.indexOf('/') === 0) {
                panUrls.push(linkText);
            }
        }

        // 备用：从整个页面提取网盘链接
        if (panUrls.length === 0) {
            var panPatterns = [
                /(https?:\/\/pan\.baidu\.com\/s\/[^\s<"']+)/gi,
                /(https?:\/\/www\.alipan\.com\/s\/[^\s<"']+)/gi,
                /(https?:\/\/www\.aliyundrive\.com\/s\/[^\s<"']+)/gi,
                /(https?:\/\/pan\.quark\.cn\/s\/[^\s<"']+)/gi,
                /(https?:\/\/drive\.uc\.cn\/s\/[^\s<"']+)/gi,
                /(https?:\/\/115\.com\/s\/[^\s<"']+)/gi,
                /(https?:\/\/123pan\.com\/s\/[^\s<"']+)/gi
            ];
            for (var pi = 0; pi < panPatterns.length; pi++) {
                var pm;
                while ((pm = panPatterns[pi].exec(body)) !== null) {
                    panUrls.push(pm[1]);
                }
            }
        }

        // 去重
        var uniqueUrls = [];
        var urlSet = {};
        for (var ui = 0; ui < panUrls.length; ui++) {
            if (!urlSet[panUrls[ui]]) {
                urlSet[panUrls[ui]] = true;
                uniqueUrls.push(panUrls[ui]);
            }
        }
        panUrls = uniqueUrls;

        if (panUrls.length === 0) {
            log('详情页未找到网盘链接: ' + id);
            return JSON.stringify({ list: [] });
        }

        // 统计网盘类型数量（用于去重命名）
        var driveTypeCount = {};
        for (var ci = 0; ci < panUrls.length; ci++) {
            var dName = inferDriveTypeFromUrl(panUrls[ci]);
            driveTypeCount[dName] = (driveTypeCount[dName] || 0) + 1;
        }

        // 构建播放源列表
        var playSources = [];
        var driveTypeIndex = {};

        for (var si = 0; si < panUrls.length; si++) {
            var shareURL = panUrls[si];
            var displayName = inferDriveTypeFromUrl(shareURL);

            var totalCount = driveTypeCount[displayName] || 0;
            if (totalCount > 1) {
                driveTypeIndex[displayName] = (driveTypeIndex[displayName] || 0) + 1;
                displayName = displayName + driveTypeIndex[displayName];
            }

            playSources.push({
                name: displayName,
                episodes: [{
                    name: '播放',
                    playId: shareURL
                }]
            });
        }

        // 按网盘类型排序
        playSources = sortByDriveOrder(playSources);

        // 构建播放线路和URL
        var froms = [];
        var urls = [];
        for (var fi = 0; fi < playSources.length; fi++) {
            froms.push(playSources[fi].name);
            var epParts = [];
            for (var ei = 0; ei < playSources[fi].episodes.length; ei++) {
                var ep = playSources[fi].episodes[ei];
                epParts.push(ep.name + '$' + ep.playId);
            }
            urls.push(epParts.join('#'));
        }

        var vod = {
            vod_id: id,
            vod_name: vodName,
            vod_pic: vodPic,
            type_name: '',
            vod_remarks: '网盘资源，共' + panUrls.length + '个链接',
            vod_year: vodYear,
            vod_area: '',
            vod_lang: '',
            vod_director: vodDirector,
            vod_actor: vodActor,
            vod_content: vodContent || '网盘资源，共' + panUrls.length + '个网盘链接',
            vod_play_from: froms.join('$$$'),
            vod_play_url: urls.join('$$$')
        };

        log('详情页: name=' + vodName + ', 网盘数=' + panUrls.length);
        return JSON.stringify({ list: [vod] });
    } catch (e) {
        log('详情页获取失败: ' + e.message);
        return JSON.stringify({ list: [] });
    }
}

async function play(flag, id, flags) {
    try {
        // id 即为网盘分享链接
        // TVBox 格式：返回 jx=1 表示需要外部解析
        if (!id) {
            return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
        }

        // 如果是网盘分享链接，交给 TVBox 内置解析
        if (id.indexOf('http') === 0) {
            return JSON.stringify({
                jx: 1,
                parse: 1,
                url: id,
                header: {
                    'User-Agent': MOBILE_UA,
                    'Referer': HOST + '/'
                }
            });
        }

        // 如果是直链，直接返回
        return JSON.stringify({
            jx: 0,
            parse: 0,
            url: id,
            header: {
                'User-Agent': MOBILE_UA
            }
        });
    } catch (e) {
        log('播放失败: ' + e.message);
        return JSON.stringify({ jx: 0, parse: 0, url: '', header: {} });
    }
}

// ========== 辅助函数 ==========

function inferDriveTypeFromUrl(url) {
    if (!url) return '未知网盘';
    var lower = url.toLowerCase();
    if (lower.indexOf('pan.baidu.com') >= 0) return '百度网盘';
    if (lower.indexOf('alipan.com') >= 0 || lower.indexOf('aliyundrive.com') >= 0) return '阿里云盘';
    if (lower.indexOf('pan.quark.cn') >= 0) return '夸克网盘';
    if (lower.indexOf('drive.uc.cn') >= 0) return 'UC网盘';
    if (lower.indexOf('115.com') >= 0) return '115网盘';
    if (lower.indexOf('123pan.com') >= 0) return '123网盘';
    if (lower.indexOf('xunlei.com') >= 0) return '迅雷网盘';
    if (lower.indexOf('tianyi') >= 0) return '天翼网盘';
    return '网盘';
}

async function getDynamicFilters(body, baseUrl) {
    var filters = {};

    try {
        // 如果没有传入 body，主动请求首页
        if (!body) {
            var result = await requestWithFailover('/');
            body = result.body;
            baseUrl = result.baseUrl;
        }

        // 提取分类 ID（从导航）
        var catIds = [];
        var catRe = /data-id="(\d+)"[^>]*data-name="([^"]*)"/gi;
        var catMatch;
        while ((catMatch = catRe.exec(body)) !== null) {
            if (catMatch[1] !== '0') {
                catIds.push(catMatch[1]);
            }
        }

        // 为每个分类构建筛选项
        for (var i = 0; i < catIds.length; i++) {
            var tid = catIds[i];

            // 尝试从页面中提取该分类的筛选项（如果有 AJAX 加载或内联数据）
            // 由于 OmniBox 版本是通过 JS 动态加载的，TVBox 版本使用通用筛选
            filters[tid] = [
                {
                    key: 'class',
                    name: '剧情',
                    init: '',
                    value: [
                        { name: '全部', value: '' },
                        { name: '喜剧', value: '喜剧' },
                        { name: '爱情', value: '爱情' },
                        { name: '恐怖', value: '恐怖' },
                        { name: '动作', value: '动作' },
                        { name: '科幻', value: '科幻' },
                        { name: '剧情', value: '剧情' },
                        { name: '战争', value: '战争' },
                        { name: '警匪', value: '警匪' },
                        { name: '犯罪', value: '犯罪' },
                        { name: '古装', value: '古装' },
                        { name: '奇幻', value: '奇幻' },
                        { name: '武侠', value: '武侠' },
                        { name: '冒险', value: '冒险' },
                        { name: '枪战', value: '枪战' },
                        { name: '悬疑', value: '悬疑' },
                        { name: '惊悚', value: '惊悚' },
                        { name: '经典', value: '经典' },
                        { name: '青春', value: '青春' },
                        { name: '文艺', value: '文艺' },
                        { name: '历史', value: '历史' }
                    ]
                },
                {
                    key: 'area',
                    name: '地区',
                    init: '',
                    value: [
                        { name: '全部', value: '' },
                        { name: '中国大陆', value: '中国大陆' },
                        { name: '中国香港', value: '中国香港' },
                        { name: '中国台湾', value: '中国台湾' },
                        { name: '美国', value: '美国' },
                        { name: '日本', value: '日本' },
                        { name: '韩国', value: '韩国' },
                        { name: '英国', value: '英国' },
                        { name: '法国', value: '法国' },
                        { name: '西班牙', value: '西班牙' },
                        { name: '泰国', value: '泰国' },
                        { name: '印度', value: '印度' },
                        { name: '意大利', value: '意大利' },
                        { name: '德国', value: '德国' },
                        { name: '澳大利亚', value: '澳大利亚' },
                        { name: '其他', value: '其他' }
                    ]
                },
                {
                    key: 'year',
                    name: '年份',
                    init: '',
                    value: [
                        { name: '全部', value: '' },
                        { name: '2026', value: '2026' },
                        { name: '2025', value: '2025' },
                        { name: '2024', value: '2024' },
                        { name: '2023', value: '2023' },
                        { name: '2022', value: '2022' },
                        { name: '2021', value: '2021' },
                        { name: '2020', value: '2020' },
                        { name: '2019', value: '2019' },
                        { name: '2018', value: '2018' },
                        { name: '更早', value: '更早' }
                    ]
                },
                {
                    key: 'sort',
                    name: '排序',
                    init: '',
                    value: [
                        { name: '默认', value: '' },
                        { name: '人气', value: 'hits' },
                        { name: '评分', value: 'score' }
                    ]
                },
                {
                    key: 'letter',
                    name: '字母',
                    init: '',
                    value: [
                        { name: '全部', value: '' },
                        { name: 'A', value: 'A' },
                        { name: 'B', value: 'B' },
                        { name: 'C', value: 'C' },
                        { name: 'D', value: 'D' },
                        { name: 'E', value: 'E' },
                        { name: 'F', value: 'F' },
                        { name: 'G', value: 'G' },
                        { name: 'H', value: 'H' },
                        { name: 'I', value: 'I' },
                        { name: 'J', value: 'J' },
                        { name: 'K', value: 'K' },
                        { name: 'L', value: 'L' },
                        { name: 'M', value: 'M' },
                        { name: 'N', value: 'N' },
                        { name: 'O', value: 'O' },
                        { name: 'P', value: 'P' },
                        { name: 'Q', value: 'Q' },
                        { name: 'R', value: 'R' },
                        { name: 'S', value: 'S' },
                        { name: 'T', value: 'T' },
                        { name: 'U', value: 'U' },
                        { name: 'V', value: 'V' },
                        { name: 'W', value: 'W' },
                        { name: 'X', value: 'X' },
                        { name: 'Y', value: 'Y' },
                        { name: 'Z', value: 'Z' },
                        { name: '0-9', value: '0-9' }
                    ]
                }
            ];
        }

        // 如果没有提取到分类 ID，至少给一个默认的筛选
        if (catIds.length === 0) {
            filters['default'] = filters[Object.keys(filters)[0]] || [];
        }
    } catch (e) {
        log('构建筛选条件失败: ' + e.message);
    }

    return filters;
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
