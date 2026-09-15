import json
import hashlib
import re
import sys
import os

# ============ 配置区 ============
# 每个任务: (demo模板, jar路径, 输出路径)
TASKS = [
    ("demo1.json",  "../jar/xiaomi.txt",  "../box"),
    ("demof.json",  "../jar/feimao.txt",  "../boxf"),
]
# =================================

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

class CompactJSONEncoder(json.JSONEncoder):
    def iterencode(self, o, _one_shot=False):
        def _compact_list(lst, indent_level):
            pad = ' ' * indent_level
            if not lst or all(isinstance(i, (str, int, float, bool, type(None))) for i in lst):
                return json.dumps(lst, ensure_ascii=False)
            if all(isinstance(i, dict) for i in lst):
                return '[\n' + ',\n'.join([pad + ' ' + json.dumps(i, ensure_ascii=False, separators=(',', ': ')) for i in lst]) + '\n' + pad + ']'
            return json.dumps(lst, ensure_ascii=False, indent=2)

        def _encode(obj, indent_level=0):
            pad = ' ' * indent_level
            if isinstance(obj, dict):
                lines = [f'"{k}": {_encode(v, indent_level+1)}' for k, v in obj.items()]
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

def process_task(demo_path, jar_path, box_path):
    jar_name = os.path.basename(jar_path).replace(".txt", "")
    print(f"\n{'='*40}")
    print(f"▶️ 合并: {jar_name}")
    print(f"{'='*40}")

    try:
        jo = load_json(demo_path)

        # 检查标记文件：config.py 本次是否成功下载了 spider
        marker_dir = os.path.join(os.path.dirname(__file__), "output")
        marker = os.path.join(marker_dir, f".{jar_name}.spider_ok")

        if os.path.isfile(marker):
            # 本次下载成功，用本地 jar + md5
            md5_value = get_md5(jar_path)
            print(f"🔐 jar 的 MD5: {md5_value}")
            if "spider" in jo:
                old_spider = jo["spider"]
                new_spider = re.sub(r'txt', f'txt;md5;{md5_value}', old_spider)
                jo["spider"] = new_spider
                print(f"🔄 替换 spider 字段为: {new_spider}")
        else:
            # 本次下载失败，从 output 里读上游 spider URL
            print(f"⚠️ [{jar_name}] spider 未更新，使用上游 URL")
            output_json = os.path.join(marker_dir, f"{jar_name}.json")
            if os.path.isfile(output_json):
                with open(output_json, "r", encoding="utf-8") as f:
                    output_data = json.load(f)
                upstream_spider = output_data.get("spider", "")
                if upstream_spider:
                    jo["spider"] = upstream_spider
                    print(f"🔗 使用上游 spider: {upstream_spider[:80]}...")
                else:
                    print("⚠️ output 中未找到 spider 字段")
            else:
                print(f"⚠️ output 文件不存在: {output_json}")

        save_json(jo, box_path)

    except Exception as e:
        print(f"❌ [{jar_name}] 出错: {e}")

if __name__ == "__main__":
    # 支持命令行指定单个任务: combine.py demo1.json ../jar/xiaomi.txt ../box
    if len(sys.argv) >= 4:
        process_task(sys.argv[1], sys.argv[2], sys.argv[3])
    else:
        for demo_path, jar_path, box_path in TASKS:
            process_task(demo_path, jar_path, box_path)
