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
    """获取夸克分享页面的HTML内容"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()  # 抛出HTTP错误
        response.encoding = response.apparent_encoding
        return response.text
    except Exception as e:
        print(f"获取页面失败：{e}")
        return None

def parse_version_folders(html):
    """解析页面，提取版本号文件夹并找到最新的"""
    soup = BeautifulSoup(html, "html.parser")
    
    # 第一步：修复警告 - 将text改为string
    target_folder = soup.find("div", string=re.compile("OK分享-OK影视标准版"))
    if not target_folder:
        print("未找到'OK分享-OK影视标准版'文件夹")
        return None
    
    # 第二步：进入该文件夹后，提取所有版本号命名的子文件夹
    version_folders = []
    # 匹配版本号（如v1.0.0、1.2.3、2.0等）
    version_pattern = re.compile(r'(\d+\.\d+(\.\d+)?)')
    
    # 遍历页面中所有文件夹名称（需根据实际页面结构调整）
    folder_elements = soup.find_all("div", class_="folder-name")  # 示例类名，需替换
    for elem in folder_elements:
        folder_name = elem.get_text().strip()
        version_match = version_pattern.search(folder_name)
        if version_match:
            version_num = version_match.group(1)
            version_folders.append({
                "name": folder_name,
                "version": version.parse(version_num),
                "link": elem.parent.get("href")  # 文件夹跳转链接（需根据实际调整）
            })
    
    if not version_folders:
        print("未找到版本号命名的文件夹")
        return None
    
    # 按版本号降序排序，取最新的
    latest_folder = sorted(version_folders, key=lambda x: x["version"], reverse=True)[0]
    print(f"找到最新版本文件夹：{latest_folder['name']}")
    return latest_folder

def find_tv_version_file(folder_link):
    """进入最新版本文件夹，找到含'电视版'的文件"""
    # 获取最新版本文件夹的页面内容
    folder_html = get_quark_page_content(folder_link)
    if not folder_html:
        return None
    
    soup = BeautifulSoup(folder_html, "html.parser")
    # 修复警告 - 将text改为string
    tv_file_elements = soup.find_all("div", string=re.compile("电视版"))
    if not tv_file_elements:
        print("未找到含'电视版'的文件")
        return None
    
    # 取第一个匹配的文件（如需多个可遍历）
    tv_file = tv_file_elements[0]
    file_info = {
        "name": tv_file.get_text().strip(),
        "download_link": tv_file.parent.get("href")  # 下载链接（需根据实际调整）
    }
    print(f"找到目标文件：{file_info['name']}")
    return file_info

def download_file(file_info):
    """下载文件到本地"""
    save_dir = create_save_dir()
    file_name = file_info["name"]
    download_link = file_info["download_link"]
    save_file_path = os.path.join(save_dir, file_name)
    
    try:
        # 流式下载（避免大文件占用过多内存）
        response = requests.get(download_link, headers=HEADERS, stream=True, timeout=60)
        response.raise_for_status()
        
        with open(save_file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print(f"文件下载完成，保存路径：{save_file_path}")
        return save_file_path
    except Exception as e:
        print(f"下载失败：{e}")
        return None

def main():
    """主流程"""
    # 1. 获取分享页面内容
    html = get_quark_page_content(QUARK_SHARE_URL)
    if not html:
        return
    
    # 2. 解析找到最新版本文件夹
    latest_folder = parse_version_folders(html)
    if not latest_folder:
        return
    
    # 3. 找到电视版文件
    tv_file_info = find_tv_version_file(latest_folder["link"])
    if not tv_file_info:
        return
    
    # 4. 下载文件
    download_file(tv_file_info)

if __name__ == "__main__":
    main()
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
    """获取夸克分享页面的HTML内容"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()  # 抛出HTTP错误
        response.encoding = response.apparent_encoding
        return response.text
    except Exception as e:
        print(f"获取页面失败：{e}")
        return None

def parse_version_folders(html):
    """解析页面，提取版本号文件夹并找到最新的"""
    soup = BeautifulSoup(html, "html.parser")
    
    # 第一步：定位到"OK分享-OK影视标准版"文件夹（需根据实际页面结构调整selector）
    # 注意：夸克页面结构可能变化，需根据实际情况调整标签/类名
    target_folder = soup.find("div", text=re.compile("OK分享-OK影视标准版"))
    if not target_folder:
        print("未找到'OK分享-OK影视标准版'文件夹")
        return None
    
    # 第二步：进入该文件夹后，提取所有版本号命名的子文件夹
    # （这里模拟提取，实际需根据夸克的跳转逻辑调整，比如获取文件夹的跳转链接）
    version_folders = []
    # 匹配版本号（如v1.0.0、1.2.3、2.0等）
    version_pattern = re.compile(r'(\d+\.\d+(\.\d+)?)')
    
    # 遍历页面中所有文件夹名称（需根据实际页面结构调整）
    folder_elements = soup.find_all("div", class_="folder-name")  # 示例类名，需替换
    for elem in folder_elements:
        folder_name = elem.get_text().strip()
        version_match = version_pattern.search(folder_name)
        if version_match:
            version_num = version_match.group(1)
            version_folders.append({
                "name": folder_name,
                "version": version.parse(version_num),
                "link": elem.parent.get("href")  # 文件夹跳转链接（需根据实际调整）
            })
    
    if not version_folders:
        print("未找到版本号命名的文件夹")
        return None
    
    # 按版本号降序排序，取最新的
    latest_folder = sorted(version_folders, key=lambda x: x["version"], reverse=True)[0]
    print(f"找到最新版本文件夹：{latest_folder['name']}")
    return latest_folder

def find_tv_version_file(folder_link):
    """进入最新版本文件夹，找到含'电视版'的文件"""
    # 获取最新版本文件夹的页面内容
    folder_html = get_quark_page_content(folder_link)
    if not folder_html:
        return None
    
    soup = BeautifulSoup(folder_html, "html.parser")
    # 筛选名称含"电视版"的文件（需根据实际页面结构调整）
    tv_file_elements = soup.find_all("div", text=re.compile("电视版"))
    if not tv_file_elements:
        print("未找到含'电视版'的文件")
        return None
    
    # 取第一个匹配的文件（如需多个可遍历）
    tv_file = tv_file_elements[0]
    file_info = {
        "name": tv_file.get_text().strip(),
        "download_link": tv_file.parent.get("href")  # 下载链接（需根据实际调整）
    }
    print(f"找到目标文件：{file_info['name']}")
    return file_info

def download_file(file_info):
    """下载文件到本地"""
    save_dir = create_save_dir()
    file_name = file_info["name"]
    download_link = file_info["download_link"]
    save_file_path = os.path.join(save_dir, file_name)
    
    try:
        # 流式下载（避免大文件占用过多内存）
        response = requests.get(download_link, headers=HEADERS, stream=True, timeout=60)
        response.raise_for_status()
        
        with open(save_file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print(f"文件下载完成，保存路径：{save_file_path}")
        return save_file_path
    except Exception as e:
        print(f"下载失败：{e}")
        return None

def main():
    """主流程"""
    # 1. 获取分享页面内容
    html = get_quark_page_content(QUARK_SHARE_URL)
    if not html:
        return
    
    # 2. 解析找到最新版本文件夹
    latest_folder = parse_version_folders(html)
    if not latest_folder:
        return
    
    # 3. 找到电视版文件
    tv_file_info = find_tv_version_file(latest_folder["link"])
    if not tv_file_info:
        return
    
    # 4. 下载文件
    download_file(tv_file_info)

if __name__ == "__main__":
    main()
