import requests
import re
import demjson3 as demjson
import json
import sys
import os
import base64

# ============ 配置区 ============
SOURCES = [
    {
        "name": "feimao",
        "url": "http://肥猫.net/tv",
    },
    {
        "name": "xiaomi",
        "url": " https://zzzy.shop/tv/",
        #"url": "https://raw.githubusercontent.com/ggrrttyyiii/CatVodSpider/refs/heads/main/json/demo.json",
    },
]

KEYWORDS = []  # 空列表=不过滤；需要过滤时填入关键词，如 ["广告"]
OUTPUT_DIR = "./output"
# =================================

def fetch_raw_json(url):
    resp = requests.get(url, timeout=15)
    resp.encoding = 'utf-8'
    text = resp.text

    # 如果返回的不是 JSON（被重定向到图片等），尝试提取内嵌的 base64 JSON
    if not text.strip().startswith('{'):
        # 在二进制数据中找 JSON 的 base64 开头 (ewoJ 或 eyJ)
        data = resp.content
        for marker in [b'ewoJ', b'eyJ']:
            idx = data.find(marker)
            if idx != -1:
                # 提取 base64 字符串
                import string
                valid = set(string.ascii_letters + string.digits + '+/=')
                b64_str = ''
                for b in data[idx:]:
                    c = chr(b)
                    if c in valid:
                        b64_str += c
                    elif b64_str:
                        break
                # 解码
                for pad in ['', '=', '==', '===']:
                    try:
                        decoded = base64.b64decode(b64_str + pad).decode('utf-8')
                        if decoded.strip().startswith('{'):
                            return decoded
                    except:
                        continue
    return text


def extract_and_save_spider(json_text, name):
    match = re.search(r'"spider"\s*:\s*"([^"]+)"', json_text)
    if not match:
        print(f"⚠️ [{name}] 没找到 spider 字段，跳过")
        return None
    full_spider = match.group(1)
    spider_url = full_spider.split(";")[0]
    print(f"📥 [{name}] 下载 spider: {spider_url}")
    headers = {"User-Agent": "okhttp/3.15"}
    resp = requests.get(spider_url, timeout=15, headers=headers)
    filepath = os.path.join(OUTPUT_DIR, f"{name}.txt")
    with open(filepath, "wb") as f:
        f.write(resp.content)
    print(f"✅ [{name}] spider 保存为 {filepath}（{len(resp.content)} 字节）")

def clean_data(raw_text, name):
    raw_text = raw_text.replace(
        "before",
        "after"
    )
    data = demjson.decode(raw_text)
    original_count = len(data.get("sites", []))

    if KEYWORDS:
        data["sites"] = [
            s for s in data["sites"]
            if not any(kw in s.get("key", "") or kw in s.get("name", "") for kw in KEYWORDS)
        ]
        removed = original_count - len(data["sites"])
    else:
        removed = 0

    print(f"🧹 [{name}] 清理 {removed} 条 sites（剩余 {len(data['sites'])} 条）")
    return data

class CompactJSONEncoder(json.JSONEncoder):
    def iterencode(self, o, _one_shot=False):
        def _compact_list(lst, indent_level):
            pad = ' ' * indent_level
            if all(isinstance(i, dict) for i in lst):
                return '[\n' + ',\n'.join(
                     [pad + ' ' + json.dumps(i, ensure_ascii=False, separators=(',', ': ')) for i in lst]
                ) + '\n' + pad + ']'
            return json.dumps(lst, ensure_ascii=False, indent=2)

        def _encode(obj, indent_level=0):
            pad = ' ' * indent_level
            if isinstance(obj, dict):
                lines = [f'"{k}": {_encode(v, indent_level + 1)}' for k, v in obj.items()]
                return '{\n' + pad + ' ' + (',\n' + pad + ' ').join(lines) + '\n' + pad + '}'
            elif isinstance(obj, list):
                return _compact_list(obj, indent_level)
            return json.dumps(obj, ensure_ascii=False)

        return iter([_encode(o)])

def save_json(data, name):
    filepath = os.path.join(OUTPUT_DIR, f"{name}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, cls=CompactJSONEncoder)
    print(f"✅ [{name}] JSON 保存为 {filepath}")

def process_source(source):
    name = source["name"]
    url = source["url"]
    print(f"\n{'='*40}")
    print(f"▶️ 处理源: {name}")
    print(f"{'='*40}")

    raw_text = fetch_raw_json(url)
    extract_and_save_spider(raw_text, name)
    data = clean_data(raw_text, name)
    save_json(data, name)
    print(f"✅ [{name}] 完成\n")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    success = 0
    for source in SOURCES:
        try:
            process_source(source)
            success += 1
        except Exception as e:
            print(f"❌ [{source['name']}] 出错: {e}")
    print(f"\n🎉 完成: {success}/{len(SOURCES)} 个源处理成功")
