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
SOURCES = [
    {
        "name": "feimao",
        "url": "http://肥猫.net/",
        "template": "demof.json",
        "jar": "../jar/feimao.txt",
        "output": "../boxf",
    },
    {
        "name": "xiaomi",
        "url": "https://www.tangsan.fun/tv/",
        "template": "demox.json",
        "jar": "../jar/xiaomi.txt",
        "output": "../box",
    },
]

KEYWORDS = []  # 空列表=不过滤；需要过滤时填入关键词，如 ["广告"]
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

def decrypt_aes_cbc(hex_data):
    """解密 AES-CBC 加密的接口数据（格式: $#<key>#$ + 密文 + 13位IV）"""
    hex_data = re.sub(r'\s+', '', hex_data)
    raw = bytes.fromhex(hex_data).decode('utf-8', errors='replace').lower()
    key_str = raw[raw.index('$#') + 2 : raw.index('#$')]
    iv_str = raw[-13:]
    key = (key_str + '0000000000000000'[:16 - len(key_str)]).encode('utf-8')
    iv = (iv_str + '0000000000000000'[:16 - len(iv_str)]).encode('utf-8')
    ct_start = hex_data.index('2324') + 4
    ct_end = len(hex_data) - 26
    ct = bytes.fromhex(hex_data[ct_start:ct_end])
    cipher = AES.new(key, AES.MODE_CBC, iv)
    plaintext = cipher.decrypt(ct)
    pad_len = plaintext[-1]
    if 0 < pad_len <= 16:
        plaintext = plaintext[:-pad_len]
    return plaintext.decode('utf-8')


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
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, timeout=10)
            break
        except requests.exceptions.RequestException:
            if attempt < retries:
                print(f"⚠️ 请求失败，重试 {attempt + 1}/{retries}...")
            else:
                raise
    resp.encoding = 'utf-8'
    text = resp.text.strip()

    clean = re.sub(r'\s+', '', text)
    try:
        test = bytes.fromhex(clean[:20]).decode('utf-8', errors='replace')
        if test.startswith('$#'):
            print("🔐 检测到 AES-CBC 加密，正在解密...")
            return decrypt_aes_cbc(clean)
    except Exception:
        pass

    if resp.content[:2] == b'BM':
        print("🖼️  检测到 BMP 伪装文件头，尝试提取 base64 JSON...")
        result = try_extract_base64_json(resp.content)
        if result:
            return result

    if text.startswith('{'):
        return text

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
    raw_text = raw_text.replace("before", "after")
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
            jo["spider"] = re.sub(r'txt', f'txt;md5;{md5_value}', jo["spider"])
            print(f"🔄 spider: {jo['spider']}")
    elif upstream_spider:
        jo["spider"] = upstream_spider
        print(f"🔗 使用上游 spider: {upstream_spider[:80]}...")
    else:
        print(f"⚠️ 无 spider 可用，保留模板默认值")
    save_json(jo, box_path)


# ========== 主流程 ==========

def process_source(source):
    name = source["name"]
    print(f"\n{'='*40}")
    print(f"▶️ {name}")
    print(f"{'='*40}")

    result = {"name": name, "config_ok": False, "spider_ok": False, "spider_url": "", "skipped": False}

    # 1. 拉取数据
    raw_text = fetch_raw_json(source["url"])

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

    # 4. 解析配置
    try:
        data = parse_config(raw_text, name)
        result["config_ok"] = True
    except Exception as e:
        print(f"⚠️ [{name}] 解析失败: {e}，跳过")
        return result

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
