import requests
from bs4 import BeautifulSoup
import re
from packaging import version  # 用于版本号排序，需安装：pip install packaging
import os

# 配置项（请替换为你的实际信息）
QUARK_SHARE_URL = "https://pan.quark.cn/s/cb0ee2b9ac64"  # 替换成真实的夸克分享链接
SAVE_PATH = "./quark_download"  # 文件保存路径
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://pan.quark.cn/"
}

def create_save_dir():
    """创建保存目录"""
    if not os.path.exists(SAVE_PATH):
        os.makedirs(SAVE_PATH)
    return SAVE_PATH

def get_quark_page_content(url):
    """获取夸克分享页面的HTML内容（处理302跳转）"""
    try:
        # 允许重定向，确保获取到实际的文件夹页面
        response = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        response.raise_for_status()  # 抛出HTTP错误
        response.encoding = response.apparent_encoding
        # 返回页面内容和实际的URL（处理跳转后的地址）
        return response.text, response.url
    except Exception as e:
        print(f"获取页面失败：{e}")
        return None, None

def get_folder_link(soup, folder_name_pattern):
    """通用方法：根据文件夹名称正则匹配，获取文件夹的跳转链接"""
    # 匹配文件夹名称的元素（需根据夸克实际页面结构调整，这里提供2种常见匹配方式）
    # 方式1：直接匹配标签内的文本
    folder_elem = soup.find(string=re.compile(folder_name_pattern))
    if not folder_elem:
        # 方式2：匹配包含文本的父元素（应对夸克页面结构嵌套的情况）
        folder_elem = soup.find("div", string=re.compile(folder_name_pattern))
    
    if not folder_elem:
        print(f"未找到文件夹：{folder_name_pattern.pattern}")
        return None
    
    # 获取文件夹的跳转链接（夸克分享页面的文件夹链接通常在父节点的href属性）
    # 需根据实际页面调整（可通过浏览器F12查看元素的href）
    folder_link = None
    parent_elem = folder_elem.parent
    while parent_elem and not folder_link:
        if parent_elem.get("href"):
            folder_link = parent_elem.get("href")
            # 补全夸克的完整链接（如果href是相对路径）
            if not folder_link.startswith("http"):
                folder_link = f"https://pan.quark.cn{folder_link}"
            break
        parent_elem = parent_elem.parent
    
    if not folder_link:
        print(f"未获取到{folder_name_pattern.pattern}文件夹的跳转链接")
        return None
    
    print(f"找到文件夹链接：{folder_name_pattern.pattern} -> {folder_link}")
    return folder_link

def parse_version_folders():
    """逐层进入文件夹：OK分享 → OK影视标准版 → 版本号文件夹，找到最新版本"""
    # 第一步：进入OK分享文件夹
    html, current_url = get_quark_page_content(QUARK_SHARE_URL)
    if not html:
        return None
    
    soup = BeautifulSoup(html, "html.parser")
    ok_share_link = get_folder_link(soup, re.compile("OK分享"))
    if not ok_share_link:
        return None
    
    # 第二步：进入OK影视标准版文件夹
    html2, current_url2 = get_quark_page_content(ok_share_link)
    if not html2:
        return None
    
    soup2 = BeautifulSoup(html2, "html.parser")
    ok_video_link = get_folder_link(soup2, re.compile("OK影视标准版"))
    if not ok_video_link:
        return None
    
    # 第三步：进入OK影视标准版后，提取所有版本号文件夹
    html3, current_url3 = get_quark_page_content(ok_video_link)
    if not html3:
        return None
    
    soup3 = BeautifulSoup(html3, "html.parser")
    version_folders = []
    # 匹配版本号（支持v1.0、1.2.3、2024.02等格式）
    version_pattern = re.compile(r'(\d+\.\d+(\.\d+)?)')
    
    # 遍历所有文件夹元素（夸克页面中文件夹通常有特定类名，需根据实际调整）
    # 先找到所有文件夹容器（示例：class含"file-item"或"folder-item"）
    folder_items = soup3.find_all("div", class_=re.compile("folder|file-item"))
    for item in folder_items:
        # 提取文件夹名称
        folder_name_elem = item.find(string=True)  # 获取第一个非空文本
        if not folder_name_elem:
            continue
        folder_name = folder_name_elem.strip()
        
        # 匹配版本号
        version_match = version_pattern.search(folder_name)
        if version_match:
            version_num = version_match.group(1)
            # 获取该版本文件夹的跳转链接
            version_link = get_folder_link(item, re.compile(folder_name))
            if version_link:
                version_folders.append({
                    "name": folder_name,
                    "version": version.parse(version_num),
                    "link": version_link
                })
    
    if not version_folders:
        print("未找到版本号命名的文件夹")
        return None
    
    # 按版本号降序排序，取最新的
    latest_folder = sorted(version_folders, key=lambda x: x["version"], reverse=True)[0]
    print(f"\n找到最新版本文件夹：{latest_folder['name']}")
    return latest_folder

def find_tv_version_file(folder_link):
    """进入最新版本文件夹，找到含'电视版'的文件并获取下载链接"""
    html, current_url = get_quark_page_content(folder_link)
    if not html:
        return None
    
    soup = BeautifulSoup(html, "html.parser")
    # 查找名称含"电视版"的文件
    tv_file_elem = soup.find(string=re.compile("电视版"))
    if not tv_file_elem:
        print("未找到含'电视版'的文件")
        return None
    
    # 获取文件下载链接（夸克的下载链接逻辑：通常是文件元素的父节点href，或有专属下载按钮）
    download_link = None
    parent_elem = tv_file_elem.parent
    while parent_elem and not download_link:
        # 优先找含"download"的链接，或直接取href
        if parent_elem.get("href"):
            download_link = parent_elem.get("href")
            if not download_link.startswith("http"):
                download_link = f"https://pan.quark.cn{download_link}"
            break
        # 查找下载按钮（夸克可能有单独的下载按钮，class含"download"）
        download_btn = parent_elem.find("a", class_=re.compile("download"))
        if download_btn and download_btn.get("href"):
            download_link = download_btn.get("href")
            break
        parent_elem = parent_elem.parent
    
    if not download_link:
        print("未获取到电视版文件的下载链接")
        return None
    
    file_info = {
        "name": tv_file_elem.strip(),
        "download_link": download_link
    }
    print(f"找到目标文件：{file_info['name']}")
    print(f"下载链接：{file_info['download_link']}")
    return file_info

def download_file(file_info):
    """下载文件到本地（支持大文件流式下载）"""
    save_dir = create_save_dir()
    file_name = file_info["name"]
    download_link = file_info["download_link"]
    save_file_path = os.path.join(save_dir, file_name)
    
    # 处理夸克下载链接的重定向（夸克的下载链接通常会跳转）
    try:
        # 先获取真实的下载地址
        response = requests.head(download_link, headers=HEADERS, allow_redirects=True, timeout=30)
        real_download_link = response.url
        
        # 流式下载
        with requests.get(real_download_link, headers=HEADERS, stream=True, timeout=60) as r:
            r.raise_for_status()
            total_size = int(r.headers.get('content-length', 0))
            downloaded_size = 0
            
            with open(save_file_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded_size += len(chunk)
                        # 显示下载进度
                        if total_size > 0:
                            progress = (downloaded_size / total_size) * 100
                            print(f"\r下载进度：{progress:.1f}% ({downloaded_size}/{total_size} bytes)", end="")
        
        print(f"\n文件下载完成！保存路径：{save_file_path}")
        return save_file_path
    except Exception as e:
        print(f"\n下载失败：{e}")
        return None

def main():
    """主流程：逐层找文件夹 → 找电视版文件 → 下载"""
    # 1. 逐层解析找到最新版本文件夹
    latest_folder = parse_version_folders()
    if not latest_folder:
        return
    
    # 2. 找到电视版文件
    tv_file_info = find_tv_version_file(latest_folder["link"])
    if not tv_file_info:
        return
    
    # 3. 下载文件
    download_file(tv_file_info)

if __name__ == "__main__":
    main()
