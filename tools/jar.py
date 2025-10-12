import requests
import re
import demjson3 as demjson
import json
import hashlib
import sys
import os

# 下载伪JSON文本-feimao 
def fetch_raw_json():
    url = "https://ua.fongmi.eu.org/box.php?url=http://肥猫.com"
    resp = requests.get(url, timeout=10)
    resp.encoding = 'utf-8'
    return resp.text

# 下载 spider 文件
def extract_and_save_spider(json_text):
    match = re.search(r'"spider"\s*:\s*"([^"]+)"', json_text)
    if not match:
        raise ValueError("未找到 spider 字段")
    full_spider = match.group(1)
    spider_url = full_spider.split(";")[0]
    print(f"📥 下载 spider 文件: {spider_url}")
    resp = requests.get(spider_url, timeout=10)
    with open("Feimao.jar", "wb") as f:
        f.write(resp.content)
    print("✅ 已保存为 Feimao.jar")
  

# 主流程
if __name__ == "__main__":
    
    try:
        raw_text = fetch_raw_json()
        extract_and_save_spider(raw_text)

    except Exception as e:
        print(f"❌ 错误: {e}")
