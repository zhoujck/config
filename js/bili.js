var host = 'https://api.bilibili.com';
var headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.bilibili.com",
    "Cookie": "bili_jct=8d857e6102f03611ebc812dd1832c6ed; DedeUserID=701168335; SESSDATA=f0d59c35%2C1770188969%2Cd19d6%2A81CjCR7VuWQpC5Aps2RKhzCed6afXrGsS7ArTXuWKduCIlnjKvs-NFL-AOOhDWA0q3lh4SVmNINmZmVWpjMGVNbFlmS1piODR4WkRyTFBTNUo5Y3E0VExkcFdESm1JSkEyVzJyZzRkQ1RzYzNrcGJ6M0NwNkVmZjJ5UnowZENLY2RFb2RzQ0k0a25BIIEC;"
};

// ==================== 纯 JS MD5 ====================
function md5(str) {
    function md5cycle(x, k) {
        var a=x[0],b=x[1],c=x[2],d=x[3];
        a=ff(a,b,c,d,k[0],7,-680876936);d=ff(d,a,b,c,k[1],12,-389564586);c=ff(c,d,a,b,k[2],17,606105819);b=ff(b,c,d,a,k[3],22,-1044525330);
        a=ff(a,b,c,d,k[4],7,-176418897);d=ff(d,a,b,c,k[5],12,1200080426);c=ff(c,d,a,b,k[6],17,-1473231341);b=ff(b,c,d,a,k[7],22,-45705983);
        a=ff(a,b,c,d,k[8],7,1770035416);d=ff(d,a,b,c,k[9],12,-1958414417);c=ff(c,d,a,b,k[10],17,-42063);b=ff(b,c,d,a,k[11],22,-1990404162);
        a=ff(a,b,c,d,k[12],7,1804603682);d=ff(d,a,b,c,k[13],12,-40341101);c=ff(c,d,a,b,k[14],17,-1502002290);b=ff(b,c,d,a,k[15],22,1236535329);
        a=gg(a,b,c,d,k[1],5,-165796510);d=gg(d,a,b,c,k[6],9,-1069501632);c=gg(c,d,a,b,k[11],14,643717713);b=gg(b,c,d,a,k[0],20,-373897302);
        a=gg(a,b,c,d,k[5],5,-701558691);d=gg(d,a,b,c,k[10],9,38016083);c=gg(c,d,a,b,k[15],14,-660478335);b=gg(b,c,d,a,k[4],20,-405537848);
        a=gg(a,b,c,d,k[9],5,568446438);d=gg(d,a,b,c,k[14],9,-1019803690);c=gg(c,d,a,b,k[3],14,-187363961);b=gg(b,c,d,a,k[8],20,1163531501);
        a=gg(a,b,c,d,k[13],5,-1444681467);d=gg(d,a,b,c,k[2],9,-51403784);c=gg(c,d,a,b,k[7],14,1735328473);b=gg(b,c,d,a,k[12],20,-1926607734);
        a=hh(a,b,c,d,k[5],4,-378558);d=hh(d,a,b,c,k[8],11,-2022574463);c=hh(c,d,a,b,k[11],16,1839030562);b=hh(b,c,d,a,k[14],23,-35309556);
        a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,k[10],23,-1094730640);
        a=hh(a,b,c,d,k[13],4,681279174);d=hh(d,a,b,c,k[0],11,-358537222);c=hh(c,d,a,b,k[3],16,-722521979);b=hh(b,c,d,a,k[6],23,76029189);
        a=hh(a,b,c,d,k[9],4,-640364487);d=hh(d,a,b,c,k[12],11,-421815835);c=hh(c,d,a,b,k[15],16,530742520);b=hh(b,c,d,a,k[2],23,-995338651);
        a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);
        a=ii(a,b,c,d,k[12],6,1700485571);d=ii(d,a,b,c,k[3],10,-1894986606);c=ii(c,d,a,b,k[10],15,-1051523);b=ii(b,c,d,a,k[1],21,-2054922799);
        a=ii(a,b,c,d,k[8],6,1873313359);d=ii(d,a,b,c,k[15],10,-30611744);c=ii(c,d,a,b,k[6],15,-1560198380);b=ii(b,c,d,a,k[13],21,1309151649);
        a=ii(a,b,c,d,k[4],6,-145523070);d=ii(d,a,b,c,k[11],10,-1120210379);c=ii(c,d,a,b,k[2],15,718787259);b=ii(b,c,d,a,k[9],21,-343485551);
        x[0]=add32(a,x[0]);x[1]=add32(b,x[1]);x[2]=add32(c,x[2]);x[3]=add32(d,x[3]);
    }
    function cmn(q,a,b,x,s,t){a=add32(add32(a,q),add32(x,t));return add32((a<<s)|(a>>>(32-s)),b);}
    function ff(a,b,c,d,x,s,t){return cmn((b&c)|((~b)&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&(~d)),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t){return cmn(c^(b|(~d)),a,b,x,s,t);}
    function md51(s){var n=s.length,state=[1732584193,-271733879,-1732584194,271733878],i;
        for(i=64;i<=s.length;i+=64)md5cycle(state,md5blk(s.substring(i-64,i)));
        s=s.substring(i-64);var tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        for(i=0;i<s.length;i++)tail[i>>2]|=s.charCodeAt(i)<<((i%4)<<3);
        tail[i>>2]|=0x80<<((i%4)<<3);if(i>55){md5cycle(state,tail);for(i=0;i<16;i++)tail[i]=0;}
        tail[14]=n*8;md5cycle(state,tail);return state;}
    function md5blk(s){var md5blks=[],i;for(i=0;i<64;i+=4)md5blks[i>>2]=s.charCodeAt(i)+(s.charCodeAt(i+1)<<8)+(s.charCodeAt(i+2)<<16)+(s.charCodeAt(i+3)<<24);return md5blks;}
    var hex_chr='0123456789abcdef'.split('');
    function rhex(n){var s='',j=0;for(;j<4;j++)s+=hex_chr[(n>>(j*8+4))&0x0F]+hex_chr[(n>>(j*8))&0x0F];return s;}
    function hex(x){for(var i=0;i<x.length;i++)x[i]=rhex(x[i]);return x.join('');}
    function add32(a,b){return(a+b)&0xFFFFFFFF;}
    return hex(md51(str));
}

// ==================== wbi 签名 ====================
var MIXIN_KEY_ENC_TAB = [46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,17,6,28];
var _wbiKeys = null;

function getWbiKeys() {
    if (_wbiKeys) return _wbiKeys;
    var resp = req(host + "/x/web-interface/nav", { headers: headers });
    var jo = JSON.parse(resp.content);
    var wbi = jo.data && jo.data.wbi_img ? jo.data.wbi_img : {};
    var imgKey = (wbi.img_url || "").split("/").pop().split(".")[0] || "";
    var subKey = (wbi.sub_url || "").split("/").pop().split(".")[0] || "";
    _wbiKeys = { imgKey: imgKey, subKey: subKey };
    return _wbiKeys;
}

function getMixinKey(raw) {
    return MIXIN_KEY_ENC_TAB.map(function(n) { return raw[n]; }).join("").substring(0, 32);
}

function signUrl(baseUrl, params) {
    var keys = getWbiKeys();
    var mixinKey = getMixinKey(keys.imgKey + keys.subKey);
    var wts = Math.floor(Date.now() / 1000);
    var sorted = {};
    Object.keys(params).sort().forEach(function(k) {
        if (params[k] !== undefined && params[k] !== null && params[k] !== "") {
            sorted[k] = params[k];
        }
    });
    sorted.wts = wts;
    var query = Object.keys(sorted).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(sorted[k]);
    }).join("&");
    sorted.w_rid = md5(query + mixinKey);
    var qs = Object.keys(sorted).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(sorted[k]);
    }).join("&");
    return baseUrl + "?" + qs;
}

// ==================== 分类 ====================
var CLASSES = [
    {"type_id": "1年级语文", "type_name": "1年级语文"},
    {"type_id": "1年级数学", "type_name": "1年级数学"},
    {"type_id": "1年级英语", "type_name": "1年级英语"},
    {"type_id": "2年级语文", "type_name": "2年级语文"},
    {"type_id": "2年级数学", "type_name": "2年级数学"},
    {"type_id": "2年级英语", "type_name": "2年级英语"},
    {"type_id": "3年级语文", "type_name": "3年级语文"},
    {"type_id": "3年级数学", "type_name": "3年级数学"},
    {"type_id": "3年级英语", "type_name": "3年级英语"},
    {"type_id": "4年级语文", "type_name": "4年级语文"},
    {"type_id": "4年级数学", "type_name": "4年级数学"},
    {"type_id": "4年级英语", "type_name": "4年级英语"},
    {"type_id": "5年级语文", "type_name": "5年级语文"},
    {"type_id": "5年级数学", "type_name": "5年级数学"},
    {"type_id": "5年级英语", "type_name": "5年级英语"},
    {"type_id": "6年级语文", "type_name": "6年级语文"},
    {"type_id": "6年级数学", "type_name": "6年级数学"},
    {"type_id": "6年级英语", "type_name": "6年级英语"},
    {"type_id": "7年级语文", "type_name": "7年级语文"},
    {"type_id": "7年级数学", "type_name": "7年级数学"},
    {"type_id": "7年级英语", "type_name": "7年级英语"},
    {"type_id": "7年级历史", "type_name": "7年级历史"},
    {"type_id": "7年级地理", "type_name": "7年级地理"},
    {"type_id": "7年级生物", "type_name": "7年级生物"},
    {"type_id": "7年级物理", "type_name": "7年级物理"},
    {"type_id": "7年级化学", "type_name": "7年级化学"},
    {"type_id": "8年级语文", "type_name": "8年级语文"},
    {"type_id": "8年级数学", "type_name": "8年级数学"},
    {"type_id": "8年级英语", "type_name": "8年级英语"},
    {"type_id": "8年级历史", "type_name": "8年级历史"},
    {"type_id": "8年级地理", "type_name": "8年级地理"},
    {"type_id": "8年级生物", "type_name": "8年级生物"},
    {"type_id": "8年级物理", "type_name": "8年级物理"},
    {"type_id": "8年级化学", "type_name": "8年级化学"},
    {"type_id": "9年级语文", "type_name": "9年级语文"},
    {"type_id": "9年级数学", "type_name": "9年级数学"},
    {"type_id": "9年级英语", "type_name": "9年级英语"},
    {"type_id": "9年级历史", "type_name": "9年级历史"},
    {"type_id": "9年级地理", "type_name": "9年级地理"},
    {"type_id": "9年级生物", "type_name": "9年级生物"},
    {"type_id": "9年级物理", "type_name": "9年级物理"},
    {"type_id": "9年级化学", "type_name": "9年级化学"},
    {"type_id": "高一语文", "type_name": "高一语文"},
    {"type_id": "高一数学", "type_name": "高一数学"},
    {"type_id": "高一英语", "type_name": "高一英语"},
    {"type_id": "高一历史", "type_name": "高一历史"},
    {"type_id": "高一地理", "type_name": "高一地理"},
    {"type_id": "高一生物", "type_name": "高一生物"},
    {"type_id": "高一思想政治", "type_name": "高一思想政治"},
    {"type_id": "高一物理", "type_name": "高一物理"},
    {"type_id": "高一化学", "type_name": "高一化学"},
    {"type_id": "高二语文", "type_name": "高二语文"},
    {"type_id": "高二数学", "type_name": "高二数学"},
    {"type_id": "高二英语", "type_name": "高二英语"},
    {"type_id": "高二历史", "type_name": "高二历史"},
    {"type_id": "高二地理", "type_name": "高二地理"},
    {"type_id": "高二生物", "type_name": "高二生物"},
    {"type_id": "高二思想政治", "type_name": "高二思想政治"},
    {"type_id": "高二物理", "type_name": "高二物理"},
    {"type_id": "高二化学", "type_name": "高二化学"},
    {"type_id": "高三语文", "type_name": "高三语文"},
    {"type_id": "高三数学", "type_name": "高三数学"},
    {"type_id": "高三英语", "type_name": "高三英语"},
    {"type_id": "高三历史", "type_name": "高三历史"},
    {"type_id": "高三地理", "type_name": "高三地理"},
    {"type_id": "高三生物", "type_name": "高三生物"},
    {"type_id": "高三思想政治", "type_name": "高三思想政治"},
    {"type_id": "高三物理", "type_name": "高三物理"},
    {"type_id": "高三化学", "type_name": "高三化学"},
    {"type_id": "奥数", "type_name": "奥数"},
    {"type_id": "奥林匹克物理", "type_name": "奥物"},
    {"type_id": "奥林匹克化学", "type_name": "奥化"},
    {"type_id": "高中信息技术", "type_name": "高中信息技术"}
];

function fixCover(url) {
    if (!url) return "";
    if (url.indexOf("//") === 0) return "https:" + url;
    return url;
}

function parseSearchResult(json) {
    var videos = [];
    if (!json || json.code !== 0) return videos;
    var list = json.data && json.data.result ? json.data.result : [];
    list.forEach(function(item) {
        if (item.type && item.type !== "video") return;
        var aid = (item.bvid || item.aid || "").toString();
        var title = (item.title || "").replace(/<[^>]*>/g, "");
        var img = fixCover(item.pic);
        var dur = item.duration || "";
        if (aid) videos.push({ vod_id: aid, vod_name: title, vod_pic: img, vod_remarks: dur });
    });
    return videos;
}

// ==================== TVBox 接口 ====================
function init(cfg) {}

function home(filter) {
    return JSON.stringify({ "class": CLASSES, "list": [] });
}

function homeVod() {
    var resp = req(host + "/x/web-interface/popular?ps=20&pn=1", { headers: headers });
    var jo = JSON.parse(resp.content);
    var videos = [];
    if (jo.code === 0 && jo.data && jo.data.list) {
        jo.data.list.forEach(function(item) {
            var aid = (item.bvid || "").toString();
            var title = (item.title || "");
            var img = fixCover(item.pic);
            var owner = item.owner ? item.owner.name : "";
            if (aid) videos.push({ vod_id: aid, vod_name: title, vod_pic: img, vod_remarks: owner });
        });
    }
    return JSON.stringify({ "list": videos });
}

function category(tid, pg, filter, extend) {
    var p = pg || 1;
    var keyword = tid + " 课程";
    var url = signUrl(host + "/x/web-interface/search/type", {
        search_type: "video",
        keyword: keyword,
        page: p,
        page_size: 20
    });
    var resp = req(url, { headers: headers });
    var jo = JSON.parse(resp.content);
    return JSON.stringify({ "list": parseSearchResult(jo), "page": p });
}

function detail(id) {
    var url;
    if (id.indexOf("BV") === 0) {
        url = host + "/x/web-interface/view?bvid=" + id;
    } else {
        url = host + "/x/web-interface/view?aid=" + id;
    }
    var resp = req(url, { headers: headers });
    var jo = JSON.parse(resp.content);
    if (jo.code !== 0) return JSON.stringify({ list: [] });
    var data = jo.data;
    var pages = data.pages || [];
    var playurls = [];
    pages.forEach(function(pg, i) {
        var part = pg.part || ("P" + (i + 1));
        playurls.push(part + "$" + (data.bvid || data.aid) + "_" + pg.cid);
    });
    return JSON.stringify({
        list: [{
            vod_id: data.bvid || data.aid || id,
            vod_name: data.title || "",
            vod_pic: data.pic || "",
            vod_play_from: "B站",
            vod_play_url: playurls.join("#")
        }]
    });
}

function search(wd, quick, pg) {
    return category(wd, pg, null, null);
}

function play(flag, id, flags) {
    var ids = id.split("_");
    if (ids.length < 2) return JSON.stringify({ parse: 1, url: "", header: {} });
    var bvid = ids[0];
    var cid = ids[1];
    var url = host + "/x/player/playurl?bvid=" + bvid + "&cid=" + cid + "&qn=80&fnval=16";
    var resp = req(url, { headers: headers });
    var jo = JSON.parse(resp.content);
    if (jo.code === 0 && jo.data) {
        if (jo.data.dash && jo.data.dash.video && jo.data.dash.video.length > 0) {
            return JSON.stringify({
                parse: 0,
                url: jo.data.dash.video[0].base_url || jo.data.dash.video[0].baseUrl,
                header: { "Referer": "https://www.bilibili.com", "User-Agent": "Mozilla/5.0" }
            });
        }
        if (jo.data.durl && jo.data.durl.length > 0) {
            return JSON.stringify({
                parse: 0,
                url: jo.data.durl[0].url,
                header: { "Referer": "https://www.bilibili.com", "User-Agent": "Mozilla/5.0" }
            });
        }
    }
    return JSON.stringify({ parse: 1, url: "https://www.bilibili.com/video/" + bvid, header: {} });
}

export default { init, home, homeVod, category, detail, search, play };
