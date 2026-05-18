# coding = utf-8
#!/usr/bin/python
# 瓜子影视 v2 - 修复版
# 修复内容：
# 1. 添加 sub 参数（子分类映射），与JS版保持一致
# 2. 签名改为大写（与JS版一致）
# 3. 增加 API code 错误检查
# 4. detailContent 补全 vod 字段

import re
import sys
import os
import json
import time
import base64
import hashlib
import urllib.parse
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5

target_dir = os.path.dirname(__file__)
if os.getcwd() != os.path.abspath(target_dir):
    try:
        os.chdir(target_dir)
    except Exception as e:
        print(f"切换失败: {e}")

sys.path.append('..')
from base.spider import Spider

class Spider(Spider):
    def __init__(self):
        self.name = "瓜子"
        self.host = 'https://api.w32z7vtd.com'
        self.token = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79'
        self.header = {
            'Cache-Control': 'no-cache',
            'Version': '2406025',
            'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
            'Ver': '1.9.2',
            'Referer': self.host,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'okhttp/3.12.0'
        }
        # 子分类映射 (与JS版保持一致)
        self.sub_map = {
            '1': '5',    # 电影
            '2': '12',   # 电视剧
            '4': '30',   # 动漫
            '3': '22',   # 综艺
            '64': ''     # 短剧
        }
        self.cache = {}
        self.cache_timeout = 300
        
    def getName(self):
        return self.name

    def init(self, extend=''):
        pass

    def homeContent(self, filter):
        result = {}
        classes = [
            {"type_name": "电影", "type_id": "1"},
            {"type_name": "电视剧", "type_id": "2"},
            {"type_name": "动漫", "type_id": "4"},
            {"type_name": "综艺", "type_id": "3"},
            {"type_name": "短剧", "type_id": "64"}
        ]
        result['class'] = classes
        
        filters = {}
        for cate in classes:
            tid = cate['type_id']
            filters[tid] = [
                {"key": "area", "name": "地区", "value": [
                    {"n": "全部", "v": "0"},
                    {"n": "大陆", "v": "大陆"},
                    {"n": "香港", "v": "香港"},
                    {"n": "台湾", "v": "台湾"},
                    {"n": "美国", "v": "美国"},
                    {"n": "韩国", "v": "韩国"},
                    {"n": "日本", "v": "日本"},
                    {"n": "英国", "v": "英国"},
                    {"n": "法国", "v": "法国"},
                    {"n": "泰国", "v": "泰国"},
                    {"n": "印度", "v": "印度"},
                    {"n": "其他", "v": "其他"}
                ]},
                {"key": "year", "name": "年份", "value": [
                    {"n": "全部", "v": "0"},
                    {"n": "2025", "v": "2025"},
                    {"n": "2024", "v": "2024"},
                    {"n": "2023", "v": "2023"},
                    {"n": "2022", "v": "2022"},
                    {"n": "2021", "v": "2021"},
                    {"n": "2020", "v": "2020"},
                    {"n": "2019", "v": "2019"},
                    {"n": "2018", "v": "2018"},
                    {"n": "2017", "v": "2017"},
                    {"n": "2016", "v": "2016"},
                    {"n": "2015", "v": "2015"},
                    {"n": "2014", "v": "2014"},
                    {"n": "2013", "v": "2013"},
                    {"n": "2012", "v": "2012"},
                    {"n": "2011", "v": "2011"},
                    {"n": "2010", "v": "2010"},
                    {"n": "更早", "v": "2009"}
                ]},
                {"key": "sort", "name": "排序", "value": [
                    {"n": "最新", "v": "d_id"},
                    {"n": "最热", "v": "d_hits"},
                    {"n": "推荐", "v": "d_score"}
                ]}
            ]
        result['filters'] = filters
        return result

    def homeVideoContent(self):
        return {'list': []}

    def categoryContent(self, tid, pg, filter, extend):
        videos = []
        try:
            sub = self.sub_map.get(tid, '')
            body = {
                "area": extend.get('area', '0'),
                "sub": extend.get('sub', sub),
                "year": extend.get('year', '0'),
                "pageSize": "30",
                "sort": extend.get('sort', 'd_id'),
                "page": str(pg),
                "tid": tid
            }
            
            cache_key = f"category_{tid}_{pg}_{hash(str(body))}"
            data = self.get_cached_data(cache_key, body, '/App/IndexList/indexList')
            
            if data and 'list' in data:
                for item in data['list']:
                    video = {
                        "vod_id": f"{item.get('vod_id', '')}",
                        "vod_name": item.get('vod_name', ''),
                        "vod_pic": item.get('vod_pic', ''),
                        "vod_remarks": item.get('vod_scroe', '')
                    }
                    videos.append(video)
        except Exception as e:
            print(f"获取分类内容失败: {e}")
        
        return {
            'list': videos,
            'page': int(pg),
            'pagecount': 9999,
            'limit': 30,
            'total': 999999
        }

    def detailContent(self, ids):
        try:
            vod_id = ids[0]
            t = str(int(time.time()))
            
            body1 = {
                "token_id": "1649412",
                "vod_id": vod_id,
                "mobile_time": t,
                "token": self.token
            }
            qdata = self.get_data(body1, '/App/IndexPlay/playInfo')
            
            body2 = {
                "vurl_cloud_id": "2",
                "vod_d_id": vod_id
            }
            jdata = self.get_data(body2, '/App/Resource/Vurl/show')
            
            if not qdata or 'vodInfo' not in qdata:
                return {'list': []}
                
            vod = qdata['vodInfo']
            t_id = vod.get('t_id', '')
            
            video_detail = {
                "vod_id": vod_id,
                "vod_name": vod.get('vod_name', ''),
                "vod_pic": vod.get('vod_pic', ''),
                "vod_year": vod.get('vod_year', ''),
                "vod_area": vod.get('vod_area', ''),
                "vod_actor": vod.get('vod_actor', ''),
                "vod_director": vod.get('vod_director', ''),
                "vod_content": vod.get('vod_use_content', '').strip(),
                "vod_play_from": "guazi"
            }
            
            play_list = []
            if jdata and 'list' in jdata:
                for index, item in enumerate(jdata['list']):
                    if 'play' in item:
                        n = []
                        p = []
                        for key, value in item['play'].items():
                            if 'param' in value and value['param']:
                                n.append(key)
                                p.append(value['param'])
                        
                        if p:
                            if (t_id == '2' or t_id == '4') and bool(re.match(r'^[0-9]+$', item['title'])):
                                play_name = f"第{item['title']}集"
                            else:
                                play_name = item['title']
                            play_url = f"{p[-1]}||{'@'.join(n)}"
                            play_list.append(f"{play_name}${play_url}")
            
            video_detail["vod_play_url"] = "#".join(play_list)
            return {'list': [video_detail]}
            
        except Exception as e:
            print(f"获取详情失败: {e}")
            return {'list': []}

    def searchContent(self, key, quick, pg=1):
        videos = []
        try:
            body = {
                "keywords": key,
                "order_val": "1",
                "page": str(pg)
            }
            
            data = self.get_data(body, '/App/Index/findMoreVod', use_cache=False)
            
            if data and 'list' in data:
                rename_map = {
                    '乡村爱情第18季': '乡村爱情18',
                    '大侦探第十一季十年侦心新春演唱会': '大侦探第十一季',
                    '乡村爱情Ⅱ': '乡村爱情2'
                }
                skip_ids = {'87675', '1414', '64737', '108219', '107448'}
                for item in data['list'][:3]:
                    if item.get('vod_id', '') in skip_ids:
                        continue
                    vod_name = item.get('vod_name', '')
                    video = {
                        "vod_id": f"{item.get('vod_id', '')}",
                        "vod_name": rename_map.get(vod_name, vod_name),
                        "vod_pic": item.get('vod_pic', ''),
                        "vod_remarks": item.get('vod_scroe', '')
                    }
                    videos.append(video)
        except Exception as e:
            print(f"搜索失败: {e}")
        
        return {
            'list': videos,
            'page': int(pg),
            'pagecount': 9999,
            'limit': 30,
            'total': 999999
        }

    def playerContent(self, flag, id, vipFlags):
        try:
            parts = id.split('||')
            if len(parts) < 2:
                return {"parse": 0, "playUrl": "", "url": ""}
            
            param_str = parts[0]
            resolutions = parts[1].split('@') if len(parts) > 1 else []
            
            params = {}
            for pair in param_str.split('&'):
                if '=' in pair:
                    key, value = pair.split('=', 1)
                    params[key] = value
            
            if resolutions:
                resolutions.sort(key=lambda x: int(x) if x.isdigit() else 0, reverse=True)
                params['resolution'] = resolutions[0]
                body = params
                
                data = self.get_data(body, '/App/Resource/VurlDetail/showOne', use_cache=False)
                
                if data and 'url' in data:
                    return {
                        "parse": 0,
                        "playUrl": "",
                        "url": data['url'],
                        "header": {
                            'User-Agent': 'com.android.chrome/131.0.6778.200 (Linux;Android 15) AndroidXMedia3/1.6.1'
                        }
                    }
            
            return {"parse": 0, "playUrl": "", "url": ""}
            
        except Exception as e:
            print(f"播放解析失败: {e}")
            return {"parse": 0, "playUrl": "", "url": ""}

    def isVideoFormat(self, url):
        video_formats = ['.m3u8', '.mp4', '.avi', '.mkv', '.flv', '.ts']
        return any(url.lower().endswith(fmt) for fmt in video_formats)

    def manualVideoCheck(self):
        pass

    def localProxy(self, params):
        return None

    def aes_encrypt(self, text, key, iv):
        try:
            cipher = AES.new(key.encode('utf-8'), AES.MODE_CBC, iv.encode('utf-8'))
            return cipher.encrypt(pad(text.encode('utf-8'), AES.block_size)).hex().upper()
        except Exception as e:
            print(f"AES加密失败: {e}")
            return ""

    def aes_decrypt(self, text, key, iv):
        try:
            cipher = AES.new(key.encode('utf-8'), AES.MODE_CBC, iv.encode('utf-8'))
            return unpad(cipher.decrypt(bytes.fromhex(text)), AES.block_size).decode('utf-8')
        except Exception as e:
            print(f"AES解密失败: {e}")
            return ""

    def rsa_decrypt(self, encrypted_data, private_key):
        try:
            encrypted_bytes = base64.b64decode(encrypted_data)
            rsa_key = RSA.import_key(private_key)
            cipher = PKCS1_v1_5.new(rsa_key)
            decrypted = cipher.decrypt(encrypted_bytes, None)
            return decrypted.decode('utf-8') if decrypted else ""
        except Exception as e:
            print(f"RSA解密失败: {e}")
            return ""

    def get_cached_data(self, cache_key, data, path):
        current_time = time.time()
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if current_time - timestamp < self.cache_timeout:
                return cached_data
        result = self.get_data(data, path)
        if result:
            self.cache[cache_key] = (result, current_time)
        return result

    def get_data(self, data, path, use_cache=True):
        try:
            cache_key = f"{path}_{hash(str(data))}" if use_cache else None
            
            if use_cache and cache_key in self.cache:
                cached_data, timestamp = self.cache[cache_key]
                if time.time() - timestamp < self.cache_timeout:
                    return cached_data

            start_time = time.time()
            
            request_key = self.aes_encrypt(json.dumps(data), 'mvXBSW7ekreItNsT', '2U3IrJL8szAKp0Fj')
            if not request_key:
                return None
            
            t = str(int(time.time()))
            keys = "Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI="
            sign_str = f"token_id=,token={self.token},phone_type=1,request_key={request_key},app_id=1,time={t},keys={keys}*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br"
            # 修复：签名改为大写
            signature = hashlib.md5(sign_str.encode()).hexdigest().upper()
            
            body = {
                'token': self.token,
                'token_id': '',
                'phone_type': '1',
                'time': t,
                'phone_model': 'xiaomi-22021211rc',
                'keys': keys,
                'request_key': request_key,
                'signature': signature,
                'app_id': '1',
                'ad_version': '1'
            }
            
            url = f"{self.host}{path}"
            response = self.post(url, headers=self.header, data=body, timeout=10)
            
            if response.status_code != 200:
                print(f"API请求失败: {response.status_code}, 路径: {path}")
                return None
                
            response_data = response.json()
            
            # 修复：检查API返回的code
            if response_data.get('code') and response_data['code'] != 200:
                print(f"API错误: code={response_data['code']}, msg={response_data.get('msg', '')}, 路径: {path}")
                return None
            
            if 'data' not in response_data:
                print(f"无data字段, 路径: {path}")
                return None
                
            data_response = response_data['data']
            
            private_key = """-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1
ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU
1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcK
ZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7
HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcW
V9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdI
DblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34
saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVM
iMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUM
WBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8
jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZ
K7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1b
L3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oa
t5lYKfpe8k83ZA==
-----END PRIVATE KEY-----"""
            
            bodyki_json = self.rsa_decrypt(data_response['keys'], private_key)
            if not bodyki_json:
                return None
            bodyki = json.loads(bodyki_json)
            
            decrypted_data = self.aes_decrypt(data_response['response_key'], bodyki['key'], bodyki['iv'])
            if not decrypted_data:
                return None
            result = json.loads(decrypted_data)
            
            if use_cache and cache_key:
                self.cache[cache_key] = (result, time.time())
            return result
            
        except Exception as e:
            print(f"获取数据失败: {e}, 路径: {path}")
            return None
