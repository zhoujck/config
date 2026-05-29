import json
import hashlib
import re
import sys
import os

# ============ 配置区 ============
DEMO_PATH = "demoF.json"       # demo JSON 输入文件路径
JAR_PATH  = "../jar/feimao.txt" # 需要计算 MD5 的 jar 文件路径
BOX_PATH  = "../boxf"            # 最终输出的 box 文件路径
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

if __name__ == "__main__":
    # 命令行可覆盖 demo 路径
    demo_path = sys.argv[1] if len(sys.argv) > 1 else DEMO_PATH

    try:
        md5_value = get_md5(JAR_PATH)
        print(f"🔐 jar 的 MD5: {md5_value}")

        jo = load_json(demo_path)

        if "spider" in jo:
            old_spider = jo["spider"]
            new_spider = re.sub(r'txt', f'txt;md5;{md5_value}', old_spider)
            jo["spider"] = new_spider
            print(f"🔄 替换 spider 字段为: {new_spider}")
        else:
            print("⚠️ 未找到 spider 字段")

        save_json(jo, BOX_PATH)

    except Exception as e:
        print(f"❌ 出错: {e}")
