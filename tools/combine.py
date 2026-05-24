import json
import hashlib
import re
import sys
import os

# 计算目标文件的 md5
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
            # // 注释
            if c == '/' and i + 1 < len(text) and text[i + 1] == '/':
                while i < len(text) and text[i] != '\n':
                    i += 1
                continue
            # # 注释
            if c == '#':
                while i < len(text) and text[i] != '\n':
                    i += 1
                continue
        result.append(c)
        i += 1
    return ''.join(result)

# 加载 JSON 文件（支持注释）
def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    content = strip_json_comments(content)
    return json.loads(content)

# 保存 JSON 文件（折叠字典数组为单行，空数组和基础数组一行）
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
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, cls=CompactJSONEncoder)
        print(f"✅ 已保存：{path}")

# def remove_ys_lines(obj, counter=None):
#     """递归删除 JSON 中包含 'Wuao.jar' 的元素（字符串或字典）"""
#     if counter is None:
#         counter = [0]
#     if isinstance(obj, dict):
#         return {k: remove_ys_lines(v, counter) for k, v in obj.items()}
#     elif isinstance(obj, list):
#         processed = [remove_ys_lines(item, counter) for item in obj]
#         def should_remove(item):
#             if isinstance(item, str) and 'ys.jar' in item.lower():
#                 return True
#             if isinstance(item, dict):
#                 return any('Wuao.jar' in str(v).lower() for v in item.values())
#             return False
#         result = []
#         for item in processed:
#             if should_remove(item):
#                 counter[0] += 1
#             else:
#                 result.append(item)
#         return result
#     return obj

if __name__ == "__main__":
    # 默认路径
    jo_path = "demo.json"

    # 覆盖默认路径（如果传了参数）
    if len(sys.argv) > 1:
        jo_path = sys.argv[1]

    try:
        # 获取 目标jar 的 md5
        md5_value = get_md5("./jar/xiaomi.jar")
        print(f"🔐 feimao.jar 的 MD5: {md5_value}")

        # 加载 JSON 文件
        jo = load_json(jo_path)

        # 替换 spider md5
        if "spider" in jo:
            old_spider = jo["spider"]
            new_spider = re.sub(r'jar', f'jar;md5;{md5_value}', old_spider)
            jo["spider"] = new_spider
            print(f"🔄 替换 spider 字段为: {new_spider}")
        else:
            print("⚠️ jo_cleaned.json 中未找到 spider 字段")

        # 输出到 output 目录
        output_path = "../box"
        os.makedirs("./output", exist_ok=True)

        # 保存 box（原始版本）
        save_json(jo, output_path)

        # # 保存 box1（删除含 Wuao.jar 的行）
        # counter = [0]
        # jo_filtered = remove_ys_lines(jo, counter)
        # save_json(jo_filtered, "../box")
        # print(f"🗑️ 共删除了 {counter[0]} 条含 Wuao.jar 的记录")

    except Exception as e:
        print(f"❌ 出错: {e}")
