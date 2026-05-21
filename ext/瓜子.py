import os
import re
import sys
import time
import json
import hashlib
import base64
import binascii
import urllib.parse
from datetime import datetime, timedelta
from html.parser import HTMLParser
from Crypto.Cipher import AES
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup

SCRIPT_VERSION = "2.8"
SCRIPT_NAME = "瓜子J网"
HOST = "瓜子源"

base_path = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(base_path, 'config')
user_path = os.path.join(config_path, 'user.json')

base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="


class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_script = False
        self.script_content = ""
        self.title = ""
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            self.in_script = True
        if tag == "title":
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_script = False
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_script:
            self.script_content += data
        if self.in_title:
            self.title += data


def create_session():
    """创建带重试策略的 Session"""
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["POST", "GET"],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(
        max_retries=retry_strategy,
        pool_connections=1,
        pool_maxsize=1,
    )
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    # 模拟真实安卓 APP 的请求头
    session.headers.update({
        'User-Agent': 'okhttp/4.9.1',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept': '*/*',
    })
    return session


class VideoEncryptor:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.token = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd4f97b54ff5ed45a9d160'
        self.host = 'https://api.w32z7vtd.com'
        self.keys = ['YmM0MDhhMjQ1MTc4', 'Y2I3MTQxNGRjZDMy', 'MDgxMmFiMGRiYjU4', 'YzljNDk4MzE0MjFi']
        self.app = {'Package': 'com.iclient.xigua1', 'Version': '12.3.0'}
        self.session = create_session()
        self._check_connection()

    def _check_connection(self):
        """启动时诊断连接"""
        try:
            from urllib.parse import urlparse
            import socket
            parsed = urlparse(self.host)
            ip = socket.gethostbyname(parsed.hostname)
            print(f"[诊断] {parsed.hostname} -> {ip}")
        except Exception as e:
            print(f"[诊断] DNS失败: {e}")
        try:
            resp = self.session.get(self.host, timeout=10)
            print(f"[诊断] 连接正常: HTTP {resp.status_code}")
        except requests.exceptions.ConnectionError as e:
            err_str = str(e)[:80]
            if 'Connection reset' in err_str or '104' in err_str:
                print(f"[诊断] 连接被重置: 服务端拒绝或IP被风控")
                print(f"[诊断] 可能需要: 更新API域名 或 更换网络环境")
            else:
                print(f"[诊断] 连接失败: {err_str}")
        except Exception as e:
            print(f"[诊断] 连接异常: {str(e)[:60]}")

    def generate_signature(self, request_key, timestamp):
        sign_str = f"token_id=,token={self.token},phone_type=1,package_name={self.app['Package']},version={self.app['Version']},timestamp={timestamp},key={request_key}"
        return hashlib.md5(sign_str.encode('utf-8')).hexdigest()

    def xor_decrypt(self, data):
        key = "iguomi123456&^%$"
        key_bytes = key.encode('utf-8')
        try:
            if len(data) % 2 != 0:
                data = data[:-1]
            data_bytes = bytes.fromhex(data)
            decrypted = bytearray()
            for i, byte in enumerate(data_bytes):
                decrypted.append(byte ^ key_bytes[i % len(key_bytes)])
            return decrypted.decode('utf-8', errors='ignore')
        except Exception:
            return ""

    def pkcs5_unpad(self, data):
        pad_len = data[-1]
        if pad_len < 1 or pad_len > AES.block_size:
            return data
        for i in range(1, pad_len + 1):
            if data[-i] != pad_len:
                return data
        return data[:-pad_len]

    def aes_decrypt(self, data, key):
        key_bytes = key.encode('utf-8')
        iv = key_bytes[:16]
        cipher = AES.new(key_bytes, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(data)
        return self.pkcs5_unpad(decrypted)

    def decrypt_response(self, response_str, key):
        try:
            if response_str.startswith('"') and response_str.endswith('"'):
                response_str = response_str[1:-1]
            json_match = re.search(r'[{\[]', response_str)
            if json_match:
                json_str = response_str[json_match.start():]
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    pass
            key_bytes = key.encode('utf-8')
            iv = key_bytes[:16]
            cipher = AES.new(key_bytes, AES.MODE_CBC, iv)
            decoded = base64.b64decode(response_str)
            decrypted = cipher.decrypt(decoded)
            unpadded = self.pkcs5_unpad(decrypted)
            result = unpadded.decode('utf-8')
            try:
                return json.loads(result)
            except json.JSONDecodeError:
                return result
        except Exception as e:
            return {"_error": f"解密失败: {str(e)[:50]}"}

    def prepare_request(self, request_type, extra_params=None):
        current_time = int(time.time() * 1000)
        static_keys = [
            'N2NiMjk4MTJiMDE3', 'ZDU5NWU3MzAyMTdl', 'MjcxNWIxYzI2Mjcw', 'YTY3NWY0NzEwMjlh',
            'NGQ2NzI1ZTgzMTQ0', 'NTg0YjU2MjlhMjA1', 'MTgyNjkxM2JjYzNk', 'YzEyNjRiODZjNjg3',
            'MDgwOWZiNDE4ZTQ1', 'MmFhMjA2OThjZWM5', 'ZGIzNjA3ZjFkZGI4', 'MjNlNDIyNjVjNjlj'
        ]
        params = {
            "token_id": "",
            "token": self.token,
            "phone_type": "1",
            "package_name": self.app['Package'],
            "version": self.app['Version'],
            "re_version": "1",
            "mdpi": "1",
            "lb": "1080,2330",
            "request_type": request_type,
            "timestamp": str(current_time),
        }
        if extra_params:
            params.update(extra_params)
        param_values = list(params.values())
        key_param = str(param_values[0]) if param_values else ""
        request_key = ""
        for k in static_keys:
            if k and key_param:
                request_key += k[len(key_param) - 1] if len(k) >= len(key_param) else k[-1]
            else:
                request_key += "0"
        request_key = request_key[:16]
        signature = self.generate_signature(request_key, current_time)
        params["sign"] = signature
        enc_key = "3e1a6f9daeadc2bb".encode('utf-8')
        enc_iv = enc_key[:16]
        cipher = AES.new(enc_key, AES.MODE_CBC, enc_iv)
        json_str = json.dumps(params)
        pad_len = AES.block_size - (len(json_str.encode('utf-8')) % AES.block_size)
        padded_data = json_str.encode('utf-8') + bytes([pad_len] * pad_len)
        encrypted = cipher.encrypt(padded_data)
        enc_data = base64.b64encode(encrypted).decode('utf-8')
        url = f"{self.host}/Qd4WiH97MHx59qNz/app/index"
        headers = {
            'Content-Type': "application/x-www-form-urlencoded",
            'PackageName': self.app['Package'],
            'Version': self.app['Version'],
        }
        data = {'data': enc_data}
        return url, headers, data

    def api_request(self, request_type, extra_params=None):
        url, headers, data = self.prepare_request(request_type, extra_params)
        try:
            res = self.session.post(
                url, headers=headers, data=data, timeout=15
            )
            res_json = res.json()
            if not res_json or 'data' not in res_json:
                return {"_error": f"API拦截: {res.text[:30]}"}
            return res_json
        except requests.exceptions.ConnectionError as e:
            err = str(e)
            if 'reset' in err.lower() or '104' in err:
                # 尝试重建 Session 重试一次
                try:
                    self.session.close()
                    self.session = create_session()
                    time.sleep(2)
                    res = self.session.post(url, headers=headers, data=data, timeout=15)
                    res_json = res.json()
                    if not res_json or 'data' not in res_json:
                        return {"_error": f"API拦截: {res.text[:30]}"}
                    return res_json
                except Exception as e2:
                    return {"_error": f"连接被重置: 服务端拒绝，可能需更新域名或token"}
            return {"_error": f"连接失败: {err[:50]}"}
        except Exception as e:
            return {"_error": f"网络异常: {str(e)[:30]}"}

    def get_api_data(self, request_type, decrypt_key, extra_params=None):
        response = self.api_request(request_type, extra_params)
        if '_error' in response:
            return response
        decrypted = self.decrypt_response(response['data'], decrypt_key)
        return decrypted

    def get_key_data(self, api_content):
        results = []
        if not api_content:
            return results
        if isinstance(api_content, dict):
            if 'data' in api_content:
                api_content = api_content['data']
        data_key = ['id', 'type', 'title', 'img', 'desc']
        try:
            if isinstance(api_content, list):
                for i, item in enumerate(api_content):
                    try:
                        if len(item) >= 5:
                            result = {}
                            for j, key in enumerate(data_key):
                                if key == 'id':
                                    result[key] = str(item[0])
                                else:
                                    result[key] = item[j]
                            results.append(result)
                    except Exception:
                        pass
        except Exception:
            pass
        return results

    def get_movie_url(self, url):
        try:
            url = url.encode('utf-8', errors='ignore').decode('utf-8')
            if not url:
                return ''
            has_ext = bool(re.search(r'\.\w+$', url.split('?')[0]))
            if has_ext:
                return url
            res = self.session.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36'
            }, timeout=30, verify=False)
            res.encoding = 'utf-8'
            parser = MyHTMLParser()
            parser.script_content = ""
            parser.title = ""
            parser.feed(res.text)
            title = parser.title
            script_content = parser.script_content
            url_matches = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', res.text)
            for match in url_matches:
                if any(ext in match for ext in ['.m3u8', '.mp4', '.flv']):
                    return match
            vkey = ""
            if script_content:
                vkey_match = re.search(r"var\s+vkey\s*=\s*'([^']+)'", script_content)
                if vkey_match:
                    vkey = vkey_match.group(1)
            if not vkey:
                vkey_match = re.search(r"var\s+vkey\s*=\s*'([^']+)'", res.text)
                if vkey_match:
                    vkey = vkey_match.group(1)
            if vkey:
                return self.decode_url(vkey, self.keys)
            return ''
        except Exception:
            return ''

    def decode_url(self, encoded_str, keys):
        try:
            if not encoded_str:
                return ''
            v1 = encoded_str
            for i in range(len(keys) - 1, -1, -1):
                try:
                    k = base64.b64decode(keys[i]).decode('utf-8')
                    try:
                        v1 = self.aes_decrypt(base64.b64decode(v1), k).decode('utf-8')
                    except Exception:
                        v1 = self.xor_decrypt(v1)
                except Exception:
                    pass
            return v1
        except Exception:
            return ''

    def get_urls(self, url):
        try:
            url = url.encode('utf-8', errors='ignore').decode('utf-8')
            if not url:
                return []
            if re.search(r'[/\.](mp4|m3u8|flv)', url):
                return [{'name': '默认', 'url': url}]
            result = []
            res = self.session.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36'
            }, timeout=15, verify=False)
            res.encoding = 'utf-8'
            parser = MyHTMLParser()
            parser.script_content = ""
            parser.title = ""
            parser.feed(res.text)
            title = parser.title
            script_content = parser.script_content
            url_match = re.search(r'https?://[^\s\'"]+|www\.[^\s\'"]+', res.text)
            if url_match:
                url_1 = url_match.group(0)
                if re.search(r'[/\.](mp4|m3u8|flv|com|cn)', url_1):
                    url_2 = self.get_movie_url(url_1)
                    if url_2:
                        result.append({'name': title, 'url': url_2, 'from': '1'})
                    else:
                        result.append({'name': title, 'url': url_1, 'from': '1'})
            vkey = ""
            vkey_match = re.search(r"var\s+vkey\s*=\s*'([^']+)'", script_content)
            if vkey_match:
                vkey = vkey_match.group(1)
            vkey_2 = re.search(r"var\s+vkey\s*=\s*'([^']+)'", res.text)
            if not vkey and vkey_2:
                vkey = vkey_2.group(1)
            vkey_2 = re.search(r"var\s+_b\s*=\s*'([^']+)'", res.text)
            if vkey_2:
                url_content = self.decode_url(vkey_2.group(1), self.keys)
                if url_content:
                    result.append({'name': title, 'url': url_content, 'from': '2'})
            result = [item for item in result if self.is_valid_url(item.get('url', ''))]
            return result
        except Exception:
            return []

    def is_valid_url(self, url):
        if not url:
            return False
        return bool(re.match(r'^(https?://|www\.)', url))


class API:
    def __init__(self):
        self.instance = VideoEncryptor()

    def searchContent(self, key, quick):
        print(f"[搜索] 关键词: {key}")
        result = {
            'list': [],
            'header': {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://d1ad626df5af434886f47e5b10e5dd37.v36045.shop/',
                'Origin': 'https://d1ad626df5af434886f47e5b10e5dd37.v36045.shop/'
            },
            'filterValue': {}
        }
        if quick:
            return result
        try:
            params = {
                'keyword': key,
                'page': '1',
            }
            api_content = self.instance.get_api_data('5', '4c39a08cb714f2dc', extra_params=params)
            if '_error' in api_content:
                print(f"[搜索] 错误: {api_content['_error']}")
                return result
            search_result = self.instance.get_key_data(api_content)
            if not search_result:
                return result
            for item in search_result:
                item['name'] = item.get('title', '')
                item['type'] = 'movie'
            result['list'] = search_result
        except Exception as e:
            print(f"[搜索] 异常: {e}")
        return result

    def homeContent(self, filters):
        result = {}
        try:
            if filters:
                filter_values = []
                for i in range(4, 13):
                    try:
                        api_content = self.instance.get_api_data('1', '60983e0185ee0e54', extra_params={'type': str(i)})
                        filter_data = self.instance.get_key_data(api_content)
                        filter_values.append(filter_data)
                    except Exception:
                        filter_values.append([])
                result['filterValue'] = {}
                for idx in range(9):
                    result['filterValue'][str(idx + 1)] = filter_values[idx] if idx < len(filter_values) else []
            api_content = self.instance.get_api_data('2', '23948b7e185fe249')
            if '_error' in api_content:
                print(f"[首页] 错误: {api_content['_error']}")
                result['list'] = []
                return result
            home_result = self.instance.get_key_data(api_content)
            if not home_result:
                result['list'] = []
                return result
            for item in home_result:
                item['name'] = item.get('title', '')
                item['type'] = 'movie'
            result['list'] = home_result
        except Exception as e:
            print(f"[首页] 异常: {e}")
            result['list'] = []
        return result

    def homeVideoContent(self):
        result = {'list': []}
        try:
            page_params = {
                'page': '1',
                'size': '10',
                'category': 'recommend'
            }
            api_content = self.instance.get_api_data('2', '23948b7e185fe249', extra_params=page_params)
            if '_error' in api_content:
                print(f"[首页视频] 错误: {api_content['_error']}")
                return result
            home_result = self.instance.get_key_data(api_content)
            if not home_result:
                return result
            for item in home_result:
                item['name'] = item.get('title', '')
                item['type'] = 'movie'
            result['list'] = home_result
        except Exception as e:
            print(f"[首页视频] 异常: {e}")
        return result

    def categoryContent(self, tid, pg, filterValue, extend):
        result = {'list': [], 'page': pg, 'pagecount': 9999, 'limit': 20, 'total': 99999}
        try:
            params = {
                'page': str(pg),
                'type': tid,
            }
            if isinstance(filterValue, dict) and len(filterValue) > 0:
                params.update(filterValue)
            api_content = self.instance.get_api_data('2', '23948b7e185fe249', extra_params=params)
            if '_error' in api_content:
                print(f"[分类] 错误: {api_content['_error']}")
                return result
            category_result = self.instance.get_key_data(api_content)
            if not category_result:
                return result
            for item in category_result:
                item['name'] = item.get('title', '')
                item['type'] = 'movie'
            result['list'] = category_result
        except Exception as e:
            print(f"[分类] 异常: {e}")
        return result

    def detailContent(self, ids):
        result = {'list': []}
        try:
            if not ids:
                return result
            video_id = ids[0]
            params = {
                'id': video_id,
                'ids': video_id,
            }
            api_content = self.instance.get_api_data('3', 'feab95d08f496a90', extra_params=params)
            if '_error' in api_content:
                print(f"[详情] 错误: {api_content['_error']}")
                return result
            detail_data = api_content
            if isinstance(detail_data, dict):
                movie = {
                    'vod_id': str(detail_data.get('id', video_id)),
                    'vod_name': detail_data.get('title', ''),
                    'vod_pic': detail_data.get('img', ''),
                    'type_name': detail_data.get('type', ''),
                    'vod_year': detail_data.get('year', ''),
                    'vod_area': detail_data.get('area', ''),
                    'vod_remarks': detail_data.get('state', ''),
                    'vod_content': detail_data.get('info', ''),
                    'vod_play_from': '',
                    'vod_play_url': '',
                }
                source_names = []
                source_urls = []
                if 'bfzy_play' in detail_data:
                    source_names.append("bfzy播放源")
                    play_data = detail_data.get('bfzy_play', {})
                    if isinstance(play_data, list):
                        play_items = []
                        for item in play_data:
                            if len(item) >= 2:
                                play_items.append(f"{item[0]}${item[1]}")
                        source_urls.append('#'.join(play_items))
                if 'ckzy_play' in detail_data:
                    source_names.append("ck播放源")
                    play_data = detail_data.get('ckzy_play', {})
                    if isinstance(play_data, list):
                        play_items = []
                        for item in play_data:
                            if len(item) >= 2:
                                play_items.append(f"{item[0]}${item[1]}")
                        source_urls.append('#'.join(play_items))
                if source_names:
                    movie['vod_play_from'] = '$$'.join(source_names)
                    movie['vod_play_url'] = '$$$$$$'.join(source_urls)
                result['list'].append(movie)
            elif isinstance(detail_data, list) and len(detail_data) > 0:
                movie = {
                    'vod_id': str(video_id),
                    'vod_name': '',
                    'vod_pic': '',
                    'type_name': '',
                    'vod_year': '',
                    'vod_area': '',
                    'vod_remarks': '',
                    'vod_content': '',
                    'vod_play_from': '',
                    'vod_play_url': '',
                }
                result['list'].append(movie)
        except Exception as e:
            print(f"[详情] 异常: {e}")
        return result

    def playerContent(self, flag, id, vipFlags):
        result = {'url': '', 'parse': '0', 'header': {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://d1ad626df5af434886f47e5b10e5dd37.v36045.shop/',
            'Origin': 'https://d1ad626df5af434886f47e5b10e5dd37.v36045.shop/'
        }}
        try:
            play_url = id
            if play_url and not re.search(r'[/\.](mp4|m3u8|flv)', play_url) and not play_url.startswith('http'):
                try:
                    api_content = self.instance.get_api_data('4', '8edc8f5edf167a9d', extra_params={'url': play_url})
                    if '_error' not in api_content and isinstance(api_content, dict):
                        play_url = api_content.get('url', play_url)
                        if api_content.get('isNbn', 0) == 1:
                            result['parse'] = '1'
                except Exception:
                    pass
            play_url = play_url.encode('utf-8', errors='ignore').decode('utf-8')
            result['url'] = play_url
        except Exception as e:
            print(f"[播放] 异常: {e}")
            result['url'] = id
        return result

    def isVideoCheck(self):
        return '1'

    def getName(self):
        return SCRIPT_NAME

    def destroy(self):
        if hasattr(self, 'instance') and hasattr(self.instance, 'session'):
            self.instance.session.close()


if __name__ == '__main__':
    api = API()
    print(f"版本: {SCRIPT_VERSION}")
