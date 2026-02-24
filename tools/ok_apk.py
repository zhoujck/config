import requests
import os
from urllib.parse import unquote, urlparse

# 目标下载链接
DOWNLOAD_URL = "https://gh.nxnow.top/https://github.com/PizazzGY/OK-APP/releases/download/OK影视/leanback-armeabi_v7a-3.7.0.apk"
# 文件保存目录（可自行修改）
SAVE_DIR = "./downloads"
# 请求头（模拟浏览器，避免被拦截）
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
}

def get_filename_from_url(url):
    """从URL中提取文件名（处理转义字符）"""
    # 解析URL路径
    path = urlparse(url).path
    # 取路径最后一部分作为文件名
    filename = os.path.basename(path)
    # 处理转义字符（如%20等）
    filename = unquote(filename)
    # 兜底：如果提取失败，用默认名称
    if not filename or "." not in filename:
        filename = "ok_video_3.7.0.apk"
    return filename

def create_save_directory():
    """创建保存目录（不存在则创建）"""
    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)
        print(f"✅ 创建保存目录：{SAVE_DIR}")
    else:
        print(f"✅ 保存目录已存在：{SAVE_DIR}")

def download_file():
    """下载文件（带进度显示、异常处理）"""
    # 1. 准备工作
    create_save_directory()
    filename = get_filename_from_url(DOWNLOAD_URL)
    save_path = os.path.join(SAVE_DIR, filename)
    
    try:
        # 2. 发送请求（流式下载，避免大文件占用过多内存）
        print(f"🚀 开始下载文件：{filename}")
        print(f"🔗 下载链接：{DOWNLOAD_URL}")
        response = requests.get(
            DOWNLOAD_URL,
            headers=HEADERS,
            stream=True,  # 流式下载
            timeout=60,   # 超时时间60秒
            allow_redirects=True  # 允许重定向
        )
        response.raise_for_status()  # 抛出HTTP错误（如404、500等）
        
        # 3. 获取文件大小
        total_size = int(response.headers.get("content-length", 0))
        downloaded_size = 0
        
        # 4. 写入文件并显示进度
        with open(save_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):  # 每次读取8KB
                if chunk:
                    f.write(chunk)
                    downloaded_size += len(chunk)
                    # 显示下载进度
                    if total_size > 0:
                        progress = (downloaded_size / total_size) * 100
                        # 格式化进度显示（保留1位小数，显示已下载/总大小）
                        print(
                            f"\r📥 下载进度：{progress:.1f}% "
                            f"({downloaded_size/1024/1024:.2f}MB/"
                            f"{total_size/1024/1024:.2f}MB)",
                            end=""
                        )
        
        # 5. 下载完成提示
        print(f"\n✅ 下载完成！文件保存路径：{save_path}")
        print(f"📄 文件大小：{os.path.getsize(save_path)/1024/1024:.2f} MB")
        return save_path
    
    except requests.exceptions.HTTPError as e:
        print(f"\n❌ 下载失败：HTTP错误 {e.response.status_code}")
        return None
    except requests.exceptions.ConnectionError:
        print("\n❌ 下载失败：网络连接错误，请检查网络或链接是否有效")
        return None
    except requests.exceptions.Timeout:
        print("\n❌ 下载失败：请求超时（60秒）")
        return None
    except Exception as e:
        print(f"\n❌ 下载失败：未知错误 - {str(e)}")
        return None

if __name__ == "__main__":
    # 执行下载
    download_file()
