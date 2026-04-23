import requests
import os
import re
from urllib.parse import unquote, urlparse

# 配置项 - 替换为你的真实下载链接
DOWNLOAD_LINKS = [
    "https://github.com/wzxxcz/OK-APP/releases/download/OK影视/leanback-armeabi_v7a-5.1.6.apk",
    "https://github.com/wzxxcz/OK-APP/releases/download/OK影视/mobile-arm64_v8a-5.1.6.apk"
]
# 保存到根目录（脚本运行的文件夹）
SAVE_DIR = "./"
# 请求头（模拟浏览器，避免被拦截）
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def remove_version_from_filename(filename):
    """移除文件名中的版本号（支持xxx-1.2.3.apk、xxx_v2.0.apk等格式）"""
    # 匹配版本号的正则：-数字.数字 或 _数字.数字 或 .数字.数字（如-3.7.0、_2.0、.1.0.5）
    version_pattern = re.compile(r'[-_.]\d+\.\d+(\.\d+)?')
    
    # 分离文件名和扩展名（如leanback-armeabi_v7a-3.7.0.apk → 主名+apk）
    name_part, ext_part = os.path.splitext(filename)
    # 移除主名中的版本号
    clean_name = version_pattern.sub('', name_part)
    # 拼接回完整文件名（如leanback-armeabi_v7a + .apk）
    clean_filename = clean_name + ext_part
    
    # 兜底：如果处理后文件名异常，用原文件名
    if not clean_filename or "." not in clean_filename:
        clean_filename = filename
    
    return clean_filename

def get_filename_from_url(url):
    """从URL中提取文件名，并自动去除版本号"""
    path = urlparse(url).path
    raw_filename = os.path.basename(path)
    raw_filename = unquote(raw_filename)
    
    # 第一步：提取原始文件名（处理URL转义）
    if not raw_filename or "." not in raw_filename:
        raw_filename = f"download_{hash(url) % 10000}.apk"
    
    # 第二步：移除版本号
    clean_filename = remove_version_from_filename(raw_filename)
    return clean_filename

def download_single_file(url):
    """下载单个文件（仅显示文件名，自动去版本号）"""
    filename = get_filename_from_url(url)
    save_path = os.path.join(SAVE_DIR, filename)
    
    # 文件已存在则静默跳过
    if os.path.exists(save_path):
        return save_path
    
    try:
        # 仅显示：正在下载 + 去版本号后的文件名
        print(f"正在下载：{filename}")
        response = requests.get(
            url,
            headers=HEADERS,
            stream=True,
            timeout=60,
            allow_redirects=True
        )
        response.raise_for_status()
        
        # 写入文件（保存为去版本号后的名称）
        with open(save_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        # 仅显示：下载完成 + 去版本号后的文件名
        print(f"下载完成：{filename}")
        return save_path
    
    except Exception as e:
        # 仅显示：下载失败 + 去版本号后的文件名 + 简短错误
        print(f"下载失败：{filename} - {str(e)[:30]}")
        return None

def batch_download():
    """批量下载（仅显示文件名，自动去版本号）"""
    for link in DOWNLOAD_LINKS:
        download_single_file(link)

if __name__ == "__main__":
    batch_download()
