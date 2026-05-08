const host = 'https://www.ylys.tv';
const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": host + "/"
};

async function init(cfg) {}

const m = (s, r, i = 1) => (s.match(r) || [])[i] || "";
const fixPic = p => p && p.startsWith('/') ? host + p : p;

// ===== 列表解析（首页/分类页） =====
function getList(html) {
  return pdfa(html, ".module-poster-item.module-item").map(it => {
    let id = m(it, /href="\/voddetail\/(.*?)\//);
    let name = m(it, /title="(.*?)"/);
    if (!id || !name) return null;
    return {
      vod_id: id,
      vod_name: name,
      vod_pic: fixPic(m(it, /data-original="(.*?)"/) || m(it, /src="(.*?)"/)),
      vod_remarks: m(it, /module-item-note">(.*?)<\/div>/).replace(/<.*?>/g, "")
    };
  }).filter(Boolean);
}

// ===== 首页分类 =====
async function home(filter) {
  const classes = [
    ["1", "电影"], ["2", "剧集"], ["3", "综艺"], ["4", "动漫"]
  ].map(([id, name]) => ({ type_id: id, type_name: name }));

  const dict = {
    area: ["大陆", "香港", "台湾", "美国", "韩国", "日本", "泰国", "英国", "法国"],
    year: ["2025", "2024", "2023", "2022", "2021", "2020"],
    lang: ["国语", "英语", "粤语", "韩语", "日语"]
  };

  const filters = {};
  classes.forEach(c => {
    filters[c.type_id] = [
      { key: "class", name: "类型", value: getSubClasses(c.type_id) },
      ...Object.keys(dict).map(k => ({
        key: k,
        name: { area: "地区", year: "年份", lang: "语言" }[k],
        value: [{ n: "全部", v: "" }].concat(dict[k].map(v => ({ n: v, v })))
      }))
    ];
  });

  return JSON.stringify({ class: classes, filters });
}

function getSubClasses(tid) {
  const map = {
    "1": [
      ["dongzuo", "动作"], ["xiju", "喜剧"], ["aiqing", "爱情"],
      ["kehuan", "科幻"], ["kongbu", "恐怖"], ["juqing", "剧情"],
      ["zhanzheng", "战争"], ["xuanyi", "悬疑"], ["qihuan", "奇幻"]
    ],
    "2": [
      ["guochan", "国产剧"], ["gangtai", "港台剧"],
      ["rihan", "日韩剧"], ["oumei", "欧美剧"]
    ]
  };
  return [{ n: "全部", v: "" }].concat((map[tid] || []).map(([v, n]) => ({ n, v })));
}

// ===== 首页推荐 =====
async function homeVod() {
  const r = await req(host, { headers });
  return JSON.stringify({ list: getList(r.content) });
}

// ===== 分类页 =====
async function category(tid, pg, filter, extend = {}) {
  let p = pg || 1;
  // ylys 使用 /vodshow/{type_id}-{area}-{class}-{lang}----{year}--{page}---/
  let area = extend.area || "";
  let cls = extend.class || "";
  let lang = extend.lang || "";
  let year = extend.year || "";

  let url = `${host}/vodshow/${tid}-${area}-${cls}-${lang}----${year}--${p}---/`;
  const r = await req(url, { headers });
  return JSON.stringify({ page: p, list: getList(r.content) });
}

// ===== 详情页 =====
async function detail(id) {
  const r = await req(`${host}/voddetail/${id}/`, { headers });
  const h = r.content;

  // 播放源
  const playFrom = pdfa(h, "#y-playList .module-tab-item")
    .map(it => m(it, /<span>(.*?)<\/span>/) || "播放源")
    .join("$$$");

  // 播放列表 - 每个 panel 对应一个播放源
  const panels = pdfa(h, ".module-play-list");
  const playUrl = panels.map(panel =>
    pdfa(panel, ".module-play-list-link").map(it => {
      let href = m(it, /href="(\/play\/[^"]+)"/);
      if (!href) return null;
      let ep = m(it, /<span>(.*?)<\/span>/) || "正片";
      return `${ep}$${href}`;
    }).filter(Boolean).join("#")
  ).join("$$$");

  // 信息提取
  const infoBlock = m(h, /module-info-main([\s\S]*?)module-info-footer/);
  const year = m(h, /title="(\d{4})" href="\/vodshow/);
  const area = m(h, /module-info-tag-link[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>\s*<\/div>\s*<div class="module-info-tag-link/);

  const director = m(h, /导演：<\/span>[\s\S]*?module-info-item-content">([\s\S]*?)<\/div>/)
    .replace(/<[^>]+>/g, "").replace(/\s*\/\s*/g, "/").trim();
  const actor = m(h, /主演：<\/span>[\s\S]*?module-info-item-content">([\s\S]*?)<\/div>/)
    .replace(/<[^>]+>/g, "").replace(/\s*\/\s*/g, "/").trim();
  const content = m(h, /module-info-introduction-content">([\s\S]*?)<\/div>/)
    .replace(/<[^>]+>/g, "").trim() || "暂无简介";

  return JSON.stringify({
    list: [{
      vod_id: id,
      vod_name: m(h, /<h1>(.*?)<\/h1>/),
      vod_pic: fixPic(m(h, /module-info-poster[\s\S]*?data-original="(.*?)"/)),
      type_name: cls || "",
      vod_year: year,
      vod_area: area || "",
      vod_director: director,
      vod_actor: actor,
      vod_remarks: m(h, /module-item-note">(.*?)<\/div>/),
      vod_content: content,
      vod_play_from: playFrom,
      vod_play_url: playUrl
    }]
  });
}

// ===== 搜索 =====
async function search(wd, quick, pg = 1) {
  let url = `${host}/vodsearch/${encodeURIComponent(wd)}-----/`;
  const r = await req(url, { headers });
  const h = r.content;

  // 搜索结果用 module-card-item
  const items = pdfa(h, ".module-card-item.module-item");

  const list = items.map(it => {
    let id = m(it, /href="\/voddetail\/(.*?)\//);
    let name = m(it, /<strong>(.*?)<\/strong>/) || m(it, /title="(.*?)"/);
    if (!id || !name) return null;
    return {
      vod_id: id,
      vod_name: name.replace(/<[^>]+>/g, ""),
      vod_pic: fixPic(m(it, /data-original="(.*?)"/) || m(it, /src="(.*?)"/)),
      vod_remarks: m(it, /module-item-note">(.*?)<\/div>/)
    };
  }).filter(Boolean);

  return JSON.stringify({ page: pg, list });
}

// ===== 播放 =====
async function play(flag, id, flags) {
  // id 格式: /play/118608-1-1/
  const r = await req(`${host}${id}`, { headers });
  const h = r.content;

  // 提取 m3u8 地址
  let url = m(h, /"url"\s*:\s*"([^"]*\.m3u8[^"]*)"/);
  if (url) {
    url = url.replace(/\\\//g, "/");
    return JSON.stringify({ parse: 0, url: url, header: headers });
  }

  // 备用：提取 player_a 的 url
  url = m(h, /"url"\s*:\s*"([^"]+)"/);
  if (url) {
    url = url.replace(/\\\//g, "/");
    return JSON.stringify({ parse: 0, url: url, header: headers });
  }

  return JSON.stringify({ parse: 1, url: `${host}${id}`, header: headers });
}

export default { init, home, homeVod, category, detail, search, play };
