import requests
import os
from urllib.parse import unquote, urlparse

# 配置项 - 替换为你的真实下载链接
DOWNLOAD_LINKS = [
    "https://github.com/PizazzGY/OK-APP/releases/download/OK影视/leanback-armeabi_v7a-3.7.0.apk",
    "https://github.com/PizazzGY/OK-APP/releases/download/OK影视/mobile-arm64_v8a-3.7.0.apk"
]
# 保存到根目录（脚本运行的文件夹）
SAVE_DIR = "./"
# 请求头（模拟浏览器，避免被拦截）
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def get_filename_from_url(url):
    """从URL中提取文件名"""
    path = urlparse(url).path
    filename = os.path.basename(path)
    filename = unquote(filename)
    # 兜底：生成默认文件名
    if not filename or "." not in filename:
        filename = f"download_{hash(url) % 10000}.apk"
    return filename

def download_single_file(url):
    """下载单个文件（仅显示文件名相关提示）"""
    filename = get_filename_from_url(url)
    save_path = os.path.join(SAVE_DIR, filename)
    
    # 仅保留核心逻辑，移除“跳过”的文字提示，仅在文件存在时静默跳过
    if os.path.exists(save_path):
        return save_path
    
    try:
        # 仅显示：正在下载 + 文件名
        print(f"正在下载：{filename}")
        # 发送请求（流式下载）
        response = requests.get(
            url,
            headers=HEADERS,
            stream=True,
            timeout=60,
            allow_redirects=True
        )
        response.raise_for_status()
        
        # 写入文件
        with open(save_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        # 仅显示：下载完成 + 文件名
        print(f"下载完成：{filename}")
        return save_path
    
    except Exception as e:
        # 仅显示：下载失败 + 文件名 + 简短错误
        print(f"下载失败：{filename} - {str(e)[:30]}")
        return None

def batch_download():
    """批量下载（仅显示文件名相关提示）"""
    # 遍历所有链接下载
    for link in DOWNLOAD_LINKS:
        download_single_file(link)

if __name__ == "__main__":
    batch_download()
# 保存到根目录（脚本运行的文件夹）
SAVE_DIR = "./"
# 请求头（模拟浏览器，避免被拦截）
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}

def get_filename_from_url(url):
    """从URL中提取文件名"""
    path = urlparse(url).path
    filename = os.path.basename(path)
    filename = unquote(filename)
    # 兜底：生成默认文件名
    if not filename or "." not in filename:
        filename = f"download_{hash(url) % 10000}.apk"
    return filename

def download_single_file(url, file_index):
    """下载单个文件（仅显示序号提示，无进度）"""
    filename = get_filename_from_url(url)
    save_path = os.path.join(SAVE_DIR, filename)
    
    # 跳过已存在的文件
    if os.path.exists(save_path):
        print(f"[{file_index+1}/{len(DOWNLOAD_LINKS)}] 跳过：文件已存在 - {filename}")
        return save_path
    
    try:
        # 仅显示核心提示：第几个、文件名
        print(f"[{file_index+1}/{len(DOWNLOAD_LINKS)}] 正在下载：{filename}")
        # 发送请求（流式下载，避免占用过多内存）
        response = requests.get(
            url,
            headers=HEADERS,
            stream=True,
            timeout=60,
            allow_redirects=True
        )
        response.raise_for_status()
        
        # 写入文件（无进度显示）
        with open(save_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        # 下载完成提示
        print(f"[{file_index+1}/{len(DOWNLOAD_LINKS)}] 下载完成：{filename} → {os.path.abspath(save_path)}")
        return save_path
    
    except Exception as e:
        # 简化错误提示
        print(f"[{file_index+1}/{len(DOWNLOAD_LINKS)}] 下载失败：{filename} - {str(e)[:50]}")
        return None

def batch_download():
    """批量下载（仅显示序号提示）"""
    print(f"开始批量下载，共 {len(DOWNLOAD_LINKS)} 个文件")
    print(f"文件将保存到根目录：{os.path.abspath(SAVE_DIR)}")
    print("-" * 50)
    
    # 遍历下载所有链接
    success_count = 0
    for idx, link in enumerate(DOWNLOAD_LINKS):
        if download_single_file(link, idx):
            success_count += 1
    
    # 最终总结
    print("-" * 50)
    print(f"下载完成！成功：{success_count} 个 | 失败：{len(DOWNLOAD_LINKS)-success_count} 个")

if __name__ == "__main__":
    batch_download()
