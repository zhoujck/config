import requests
import re
import demjson3 as demjson
import json
import sys
import os
import base64
import string
import hashlib
from datetime import datetime
from Crypto.Cipher import AES

# ============ 配置区 ============
# 每个源的地址支持两种写法：
#   "url": "http://a.com/"                      # 单个地址
#   "urls": ["http://a.com/", "http://b.com/"]  # 多个备选，依次试验，谁成功用谁
# （也可以直接写 "url": ["http://a.com/", "http://b.com/"]，效果相同）
SOURCES = [
    {
        "name": "feimao",
         "urls": [
                "http://肥猫.net/", # 你的主地址
                "http://肥猫.net/tv", # 官方公告的正路
                 ],
        "template": "demof.json",
        "jar": "../jar/feimao.txt",
        "output": "../boxf",
    },
    {
        "name": "xiaomi",
        "urls": [
                 "https://www.tangsan.fun/tv/", 
               ],
        "template": "demox.json",
        "jar": "../jar/xiaomi.txt",
        "output": "../box",
    },
    {
        "name": "呜嗷",
        "urls": [
                  "http://www.英格里希嗷呜.top/tv",
                  "https://9763.kstore.vip/aowu.json",
                  "http://itv666.cc/aowu/config.webp",
               ],
        "template": "demox.json",
        "jar": "../jar/woao.txt",
        "output": "../boxw",
    },
]

KEYWORDS = []  # 空列表=不过滤；需要过滤时填入关键词，如 ["广告"]

# 请求指纹池（模拟 TVBox 系客户端）
# 部分源只对这类客户端返回真配置，对 python-requests 默认 UA 返回网页/假数据
TVBOX_FINGERPRINTS = [
    {"User-Agent": "okhttp/3.12.13", "X-Requested-With": "com.fongmi.android.tv"},
    {"User-Agent": "okhttp/3.15", "X-Requested-With": "com.fongmi.android.tv"},
    {"User-Agent": "okhttp/4.9.3", "X-Requested-With": "com.github.tvbox"},
    {"User-Agent": "Dalvik/2.1.0 (Linux; U; Android 9; Pixel 3 XL Build/PQ3A.190801.002)",
     "X-Requested-With": "com.fongmi.android.tv"},
    {"User-Agent": "TVBox/1.0.0", "X-Requested-With": "com.iptvbox"},
]

# 可选文本补丁：(原文, 修正)，针对特定上游的已知格式问题。留空则不做任何全文替换。
# 例如某源配置里字面写了 "before" 需要改成 "after" 时才填：TEXT_PATCHES = [("before", "after")]
TEXT_PATCHES = []
# =================================


# ========== 通用工具 ==========

def get_md5(filepath):
    md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            md5.update(chunk)
    return md5.hexdigest()


def strip_json_comments(text):
    """去掉 JSON 中的 // 和 # 注释，保留字符串内容"""
    result = []
    in_string = False
    escape = False
    i = 0
    while i < len(text):
        c = text[i]
        if escape:
            result.append(c)
            escape = False
            i += 1
            continue
        if c == '\\' and in_string:
            result.append(c)
            escape = True
            i += 1
            continue
        if c == '"' and not escape:
            in_string = not in_string
            result.append(c)
            i += 1
            continue
        if not in_string:
            if c == '/' and i + 1 < len(text) and text[i + 1] == '/':
                while i < len(text) and text[i] != '\n':
                    i += 1
                continue
            if c == '#':
                while i < len(text) and text[i] != '\n':
                    i += 1
                continue
        result.append(c)
        i += 1
    return ''.join(result)


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    content = strip_json_comments(content)
    return json.loads(content)


def fix_malformed_json(text):
    """修复常见的 JSON 格式问题"""
    text = re.sub(r'(?m)^(\s*)([A-Za-z_]\w*)":', r'\1"\2":', text)
    text = re.sub(r"(?<=[{,\n])\s*'([^']*)'\s*:", r' "\1":', text)
    text = re.sub(r',\s*([}\]])', r'\1', text)
    return text


class CompactJSONEncoder(json.JSONEncoder):
    def iterencode(self, o, _one_shot=False):
        def _compact_list(lst, indent_level):
            pad = ' ' * indent_level
            if not lst or all(isinstance(i, (str, int, float, bool, type(None))) for i in lst):
                return json.dumps(lst, ensure_ascii=False)
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


def save_json(data, path):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, cls=CompactJSONEncoder)
        print(f"✅ 已保存：{path}")


# ========== 数据拉取 ==========

def _pkcs7_unpad(data: bytes) -> bytes:
    if not data:
        return data
    pad_len = data[-1]
    if 0 < pad_len <= 16 and len(data) >= pad_len and all(b == pad_len for b in data[-pad_len:]):
        return data[:-pad_len]
    return data


def _aes_cbc_decrypt(cipher: bytes, key: bytes, iv: bytes) -> str:
    key16 = key[:16].ljust(16, b"0")
    iv16 = iv[:16].ljust(16, b"0")
    plaintext = AES.new(key16, AES.MODE_CBC, iv16).decrypt(cipher)
    return _pkcs7_unpad(plaintext).decode("utf-8", errors="replace")


def decrypt_aes_cbc(hex_data):
    """解密 hex 形态（整串为 hex，解码后格式: $#<key>#$<密文><13字节IV>）
    与旧版区别：
    1. 不再 .lower() —— key/IV 大小写敏感，lower 会毁掉 key 导致解密失败
    2. 用字节级标记定位，不再在 hex 串里搜 '2324'（可能撞上密文）
    3. PKCS7 填充校验 + errors='replace'，失败时能看出是 key 错还是格式错
    """
    hex_data = re.sub(r'\s+', '', hex_data)
    raw = bytes.fromhex(hex_data)
    k0 = raw.find(b'$#')
    k1 = raw.find(b'#$', k0 + 2) if k0 != -1 else -1
    if k0 == -1 or k1 == -1 or k1 + 2 > len(raw) - 13:
        raise ValueError("hex形态: 未找到 $#...#$ key区间")
    key = raw[k0 + 2:k1]
    iv = raw[-13:]
    ct = raw[k1 + 2:-13]
    if not ct or len(ct) % 16 != 0:
        raise ValueError(f"hex形态: 密文长度非法 ({len(ct)})")
    return _aes_cbc_decrypt(ct, key, iv)


def decrypt_aes_cbc_plain(text):
    """解密 plain 形态（标记直接嵌在文本里: 2324<密文hex>$#<key>#$<...><13字符IV>）
    旧版完全不支持这种形态，源切换到这种形态后就会"经常失败"
    """
    t = re.sub(r'\s+', '', text)
    k0 = t.index('$#')
    k1 = t.index('#$', k0 + 2)
    d0 = t.index('2324') + 4
    if d0 > k0:
        raise ValueError("plain形态: 数据区间非法")
    data_hex = re.sub(r'[^0-9a-fA-F]', '', t[d0:k0])
    if len(data_hex) % 2 != 0:
        data_hex = data_hex[:-1]
    key = t[k0 + 2:k1].encode('latin-1', 'ignore')
    iv = t[-13:].encode('latin-1', 'ignore')
    ct = bytes.fromhex(data_hex)
    if not ct or len(ct) % 16 != 0:
        raise ValueError(f"plain形态: 密文长度非法 ({len(ct)})")
    return _aes_cbc_decrypt(ct, key, iv)


def try_decrypt_payload(text):
    """识别两种加密形态并解密；识别不了/解密失败返回 None（交给后续流程）"""
    if not text:
        return None
    s = text.lstrip()
    if s.startswith('{') or s.startswith('['):   # 明文 JSON 不碰
        return None
    clean = re.sub(r'\s+', '', text)
    # hex 形态：整串合法 hex，解码后含 $#...#$ 标记
    try:
        if (len(clean) >= 40 and len(clean) % 2 == 0
                and re.fullmatch(r'[0-9a-fA-F]+', clean)):
            raw = bytes.fromhex(clean)
            if b'$#' in raw and b'#$' in raw:
                try:
                    return decrypt_aes_cbc(clean)
                except Exception as e:
                    print(f"⚠️ hex形态解密失败: {e}")
    except Exception as e:
        print(f"⚠️ hex形态识别失败: {e}")
    # plain 形态
    if '2324' in clean and '$#' in clean and '#$' in clean:
        try:
            return decrypt_aes_cbc_plain(clean)
        except Exception as e:
            print(f"⚠️ plain形态解密失败: {e}")
    return None


def dump_snippet(data, tag="响应"):
    """诊断用：输出响应前 200 字节，一眼看出是被拦（HTML）还是解码问题（2423/$#/base64）"""
    snippet = data[:200]
    try:
        print(f"🔎 {tag}前200字节: {snippet!r}")
    except Exception:
        print(f"🔎 {tag}前200字节(hex): {snippet[:200].hex()}")


def try_extract_base64_json(data: bytes) -> str | None:
    valid = set(string.ascii_letters + string.digits + '+/=')
    text = data.decode('utf-8', errors='replace')
    segments = []
    seg_start = None
    for i, c in enumerate(text):
        if c in valid:
            if seg_start is None:
                seg_start = i
        else:
            if seg_start is not None:
                seg_len = i - seg_start
                if seg_len >= 100:
                    segments.append((seg_start, seg_len))
                seg_start = None
    if seg_start is not None and len(text) - seg_start >= 100:
        segments.append((seg_start, len(text) - seg_start))
    segments.sort(key=lambda x: x[1], reverse=True)
    for start, length in segments:
        b64_str = text[start:start + length]
        for pad in ['', '=', '==', '===']:
            try:
                decoded = base64.b64decode(b64_str + pad).decode('utf-8')
                if decoded.lstrip().startswith('{'):
                    print(f"🔍 在偏移 {start} 处找到 base64 JSON（{length} 字符）")
                    return decoded
            except Exception:
                continue
    return None


def fetch_raw_json(url, retries=2):
    # 请求指纹轮换：每个指纹试一次；返回 HTML 视为被拦，换下一个指纹
    resp = None
    last_err = None
    for i, fp in enumerate(TVBOX_FINGERPRINTS):
        try:
            r = requests.get(url, headers=fp, timeout=10)
        except requests.exceptions.RequestException as e:
            last_err = e
            print(f"⚠️ 请求失败（{fp['User-Agent'][:24]}）: {e}")
            continue
        if r.status_code != 200:
            last_err = RuntimeError(f"HTTP {r.status_code}")
            print(f"⚠️ HTTP {r.status_code}（{fp['User-Agent'][:24]}）")
            continue
        if r.content.lstrip()[:1] == b'<' and i < len(TVBOX_FINGERPRINTS) - 1:
            print(f"⚠️ 返回 HTML（疑似被拦），换指纹: {fp['User-Agent'][:24]}")
            continue
        resp = r
        break
    if resp is None:
        raise RuntimeError(f"所有请求指纹均失败: {last_err}")

    resp.encoding = 'utf-8'
    text = resp.text.strip()

    # 1) AES-CBC 加密形态（hex / plain 双形态）
    decrypted = try_decrypt_payload(text)
    if decrypted is not None:
        print("🔐 检测到 AES-CBC 加密，已解密")
        return decrypted

    # 2) BMP 伪装文件头
    if resp.content[:2] == b'BM':
        print("🖼️  检测到 BMP 伪装文件头，尝试提取 base64 JSON...")
        result = try_extract_base64_json(resp.content)
        if result:
            return result

    # 3) 明文 JSON
    if text.startswith('{'):
        return text

    # 4) base64 片段扫描
    print("🔍 非 JSON 响应，扫描 base64 片段...")
    result = try_extract_base64_json(resp.content)
    if result:
        return result

    for marker in [b'ewoJ', b'eyJ', b'ew0K', b'ewo=', b'ew==']:
        idx = resp.content.find(marker)
        if idx != -1:
            valid_chars = set(string.ascii_letters + string.digits + '+/=')
            b64_str = ''
            for b in resp.content[idx:]:
                c = chr(b)
                if c in valid_chars:
                    b64_str += c
                elif b64_str:
                    break
            for pad in ['', '=', '==', '===']:
                try:
                    decoded = base64.b64decode(b64_str + pad).decode('utf-8')
                    if decoded.strip().startswith('{'):
                        return decoded
                except Exception:
                    continue

    # 全部失败：dump 前 200 字节方便定位（HTML=被拦 / 2423、$#=解码器不支持）
    dump_snippet(resp.content, "无法识别的响应")
    return text


# ========== 数据处理 ==========

def decode_nested_base64(data):
    if isinstance(data, dict):
        result = {}
        for k, v in data.items():
            if k == 'spider' and isinstance(v, str) and len(v) > 50:
                try:
                    decoded = base64.b64decode(v).decode('utf-8')
                    if decoded.lstrip().startswith('{') or decoded.lstrip().startswith('['):
                        try:
                            result[k] = json.loads(decoded)
                        except json.JSONDecodeError:
                            result[k] = decoded
                    else:
                        result[k] = v
                except Exception:
                    result[k] = v
            else:
                result[k] = v
        return result
    elif isinstance(data, list):
        return [decode_nested_base64(item) for item in data]
    return data


def parse_config(raw_text, name):
    """解析配置 JSON（三级容错）"""
    for old, new in TEXT_PATCHES:
        raw_text = raw_text.replace(old, new)
    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        fixed = fix_malformed_json(raw_text)
        try:
            data = json.loads(fixed)
            print(f"🔧 [{name}] JSON 格式已自动修复")
        except json.JSONDecodeError:
            try:
                data = demjson.decode(fixed)
                print(f"🔧 [{name}] 使用 demjson 兜底解析")
            except demjson.JSONDecodeError as e:
                print(f"❌ [{name}] JSON 解析最终失败: {e}")
                raise
    data = decode_nested_base64(data)
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


def download_spider(json_text, jar_path, name):
    """下载 spider jar，返回是否成功"""
    match = re.search(r'"spider"\s*:\s*"([^"]+)"', json_text)
    if not match:
        print(f"⚠️ [{name}] 没找到 spider 字段")
        return None
    spider_url = match.group(1).split(";")[0]
    print(f"📥 [{name}] 下载 spider: {spider_url}")
    headers = {"User-Agent": "okhttp/3.15"}
    for attempt in range(3):
        try:
            resp = requests.get(spider_url, timeout=10, headers=headers)
            os.makedirs(os.path.dirname(jar_path) or ".", exist_ok=True)
            with open(jar_path, "wb") as f:
                f.write(resp.content)
            print(f"✅ [{name}] spider 保存（{len(resp.content)} 字节）")
            return spider_url
        except requests.exceptions.RequestException as e:
            if attempt < 2:
                print(f"⚠️ [{name}] spider 下载失败，重试 {attempt + 1}/2...")
            else:
                print(f"❌ [{name}] spider 下载失败: {e}")
                return None


def build_box(template_path, jar_path, box_path, upstream_spider, spider_ok):
    """读取模板，注入 spider 信息，输出最终配置"""
    jo = load_json(template_path)
    if spider_ok and os.path.isfile(jar_path):
        md5_value = get_md5(jar_path)
        print(f"🔐 jar MD5: {md5_value}")
        if "spider" in jo:
            # 干净拼接 md5，不再 re.sub('txt')（会在 URL 多处含 txt 时改坏）
            spider = jo["spider"]
            if ";md5;" in spider:
                spider = re.sub(r';md5;[0-9a-fA-F]*', f';md5;{md5_value}', spider, count=1)
            else:
                spider = f"{spider};md5;{md5_value}"
            jo["spider"] = spider
            print(f"🔄 spider: {jo['spider']}")
    elif upstream_spider:
        jo["spider"] = upstream_spider
        print(f"🔗 使用上游 spider: {upstream_spider[:80]}...")
    else:
        print(f"⚠️ 无 spider 可用，保留模板默认值")
    save_json(jo, box_path)


# ========== 主流程 ==========

def _source_urls(source):
    """兼容单地址/多地址写法，返回 url 列表（按试验顺序）"""
    urls = source.get("urls") or source.get("url") or []
    if isinstance(urls, str):
        urls = [urls]
    return [u for u in urls if u]


def process_source(source):
    name = source["name"]
    print(f"\n{'='*40}")
    print(f"▶️ {name}")
    print(f"{'='*40}")

    result = {"name": name, "config_ok": False, "spider_ok": False, "spider_url": "", "skipped": False}

    # 1. 拉取+解析：多个备选 URL 依次试验，抓取失败或解析失败都换下一个
    urls = _source_urls(source)
    raw_text = data = None
    errors = []
    for u in urls:
        try:
            raw = fetch_raw_json(u)
        except Exception as e:
            errors.append(f"{u} -> 抓取失败: {e}")
            print(f"⚠️ [{name}] {u} 抓取失败: {e}")
            continue
        try:
            data = parse_config(raw, name)
            raw_text = raw
            print(f"✅ [{name}] 实际使用源: {u}")
            break
        except Exception as e:
            errors.append(f"{u} -> 解析失败: {e}")
            print(f"⚠️ [{name}] {u} 解析失败，尝试下一个源")
            continue
    if raw_text is None:
        print(f"❌ [{name}] 所有备选源均失败:")
        for e in errors:
            print(f"   - {e}")
        return result

    result["config_ok"] = True

    # 2. 内容哈希，没变就跳过
    content_hash = hashlib.md5(raw_text.encode("utf-8")).hexdigest()[:12]
    out_dir = os.path.join(os.path.dirname(__file__), "output")
    hash_path = os.path.join(out_dir, f".{name}.hash")
    os.makedirs(out_dir, exist_ok=True)

    old_hash = ""
    if os.path.isfile(hash_path):
        with open(hash_path, "r") as f:
            old_hash = f.read().strip()

    if content_hash == old_hash:
        print(f"⏭️ [{name}] 内容未变化（{content_hash}），跳过")
        result["skipped"] = True
        result["config_ok"] = True
        result["spider_ok"] = True
        return result

    # 3. 下载 spider jar
    spider_url = download_spider(raw_text, source["jar"], name)
    result["spider_ok"] = bool(spider_url)
    result["spider_url"] = spider_url or ""

    # 4. 配置已在拉取阶段解析完成（用于验证源可用性）

    # 保存原版配置
    with open(os.path.join(out_dir, f"{name}.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, cls=CompactJSONEncoder)
    print(f"💾 [{name}] 原版配置已保存")

    # 5. 合成最终配置
    upstream_spider = data.get("spider", "")
    build_box(
        template_path=source["template"],
        jar_path=source["jar"],
        box_path=source["output"],
        upstream_spider=upstream_spider if not spider_url else None,
        spider_ok=bool(spider_url),
    )
    if not spider_url:
        result["spider_url"] = upstream_spider

    # 6. 保存哈希
    with open(hash_path, "w") as f:
        f.write(content_hash)

    print(f"✅ [{name}] 完成\n")
    return result


if __name__ == "__main__":
    log_lines = []
    log_lines.append(f"运行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log_lines.append(f"{'='*40}")

    success = 0
    all_skipped = True
    for source in SOURCES:
        try:
            result = process_source(source)
            name = result["name"]
            if result["skipped"]:
                log_lines.append(f"⏭️ {name} - 内容未变化，跳过")
            elif result["config_ok"] and result["spider_ok"]:
                log_lines.append(f"✅ {name} - 源保存成功，spider下载成功")
                all_skipped = False
                success += 1
            elif result["config_ok"] and not result["spider_ok"]:
                url = result["spider_url"][:60] if result["spider_url"] else "无"
                log_lines.append(f"⚠️ {name} - 源保存成功，spider未下载，使用上游链接: {url}")
                all_skipped = False
                success += 1
            else:
                log_lines.append(f"❌ {name} - 源解析失败")
                all_skipped = False
        except Exception as e:
            print(f"❌ [{source['name']}] 出错: {e}")
            log_lines.append(f"❌ {source['name']} - {e}")
            all_skipped = False

    log_lines.append(f"{'='*40}")
    if all_skipped:
        log_lines.append(f"结果: 全部未变化，跳过更新")
    else:
        log_lines.append(f"结果: {success}/{len(SOURCES)} 个源更新成功")
    print(f"\n🎉 完成: {success}/{len(SOURCES)}")

    # 写日志（保留最近 20 条记录）
    out_dir = os.path.join(os.path.dirname(__file__), "output")
    os.makedirs(out_dir, exist_ok=True)
    log_path = os.path.join(out_dir, "log.txt")
    new_entry = "\n".join(log_lines) + "\n"

    # 读取旧日志，追加新记录，保留最近 20 条
    old_log = ""
    if os.path.isfile(log_path):
        with open(log_path, "r", encoding="utf-8") as f:
            old_log = f.read()
    # 按 "运行时间:" 分割记录
    entries = [e.strip() for e in old_log.split("运行时间:") if e.strip()]
    entries.insert(0, new_entry.replace("运行时间:", "").strip())
    entries = entries[:20]
    with open(log_path, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(f"运行时间: {entry}\n\n")
