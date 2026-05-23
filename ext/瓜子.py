# coding=utf-8
# @name 瓜子 (合并版: PKCS1_v1_5解密 + urllib绕SSL)
import json
import time
import base64
import hashlib
import ssl
import urllib.request
import urllib.parse
from urllib.parse import urlencode
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
from base.spider import Spider


class Spider(Spider):
    def __init__(self):
        self.name = "瓜子"
        self.host = 'https://api.w32z7vtd.com'
        self.token = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79'
        self.static_keys = "Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI="
        self.header = {
            'Cache-Control': 'no-cache',
            'Version': '2406025',
            'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
            'Ver': '1.9.2',
            'Referer': self.host,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'okhttp/3.12.0'
        }
        self.private_key_pem = """-----BEGIN PRIVATE KEY-----
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
        self.ssl_ctx = ssl.create_default_context()
        self.ssl_ctx.check_hostname = False
        self.ssl_ctx.verify_mode = ssl.CERT_NONE

    def getName(self):
        return self.name

    def init(self, extend=''):
        pass

    # ========================== 加解密 ==========================

    def aes_encrypt(self, text):
        key = b'mvXBSW7ekreItNsT'
        iv = b'2U3IrJL8szAKp0Fj'
        cipher = AES.new(key, AES.MODE_CBC, iv)
        return cipher.encrypt(pad(text.encode('utf-8'), AES.block_size)).hex().upper()

    def aes_decrypt(self, hex_text, key_str, iv_str):
        cipher = AES.new(key_str.encode('utf-8'), AES.MODE_CBC, iv_str.encode('utf-8'))
        decrypted = unpad(cipher.decrypt(bytes.fromhex(hex_text)), AES.block_size)
        return decrypted.decode('utf-8')

    def rsa_decrypt(self, encrypted_b64):
        rsa_key = RSA.import_key(self.private_key_pem)
        cipher = PKCS1_v1_5.new(rsa_key)
        decrypted = cipher.decrypt(base64.b64decode(encrypted_b64), None)
        return decrypted.decode('utf-8') if decrypted else ""

    def generate_signature(self, request_key, timestamp):
        sign_str = f"token_id=,token={self.token},phone_type=1,request_key={request_key},app_id=1,time={timestamp},keys={self.static_keys}*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br"
        return hashlib.md5(sign_str.encode('utf-8')).hexdigest()

    # ========================== 网络请求 (urllib, 跳过SSL验证, 3次重试) ==========================

    def api_request(self, data_dict, path):
        last_err = None
        for attempt in range(3):
            try:
                timestamp = str(int(time.time()))
                json_str = json.dumps(data_dict, separators=(',', ':'), ensure_ascii=False)
                request_key = self.aes_encrypt(json_str)
                signature = self.generate_signature(request_key, timestamp)

                payload = urlencode({
                    'token': self.token,
                    'token_id': '',
                    'phone_type': '1',
                    'time': timestamp,
                    'phone_model': 'xiaomi-22021211rc',
                    'keys': self.static_keys,
                    'request_key': request_key,
                    'signature': signature,
                    'app_id': '1',
                    'ad_version': '1'
                }).encode('utf-8')

                url = f"{self.host}{path}"
                req = urllib.request.Request(url, data=payload, headers=self.header)
                with urllib.request.urlopen(req, context=self.ssl_ctx, timeout=15) as res:
                    raw = res.read().decode('utf-8')

                res_json = json.loads(raw)
                if 'data' not in res_json:
                    return {"_error": f"API无data字段: {raw[:80]}"}

                bodyki_json = self.rsa_decrypt(res_json['data']['keys'])
                if not bodyki_json:
                    return {"_error": "RSA解密失败(keys为空)"}

                bodyki = json.loads(bodyki_json)
                decrypted = self.aes_decrypt(res_json['data']['response_key'], bodyki['key'], bodyki['iv'])
                return json.loads(decrypted)

            except Exception as e:
                last_err = e
                err_msg = str(e)
                if any(k in err_msg for k in ['104', 'reset', 'timed out', 'timeout', 'Connection', 'URLError']):
                    if attempt < 2:
                        time.sleep(1 + attempt)
                        continue
                return {"_error": err_msg}

        return {"_error": f"网络异常(重试3次): {str(last_err)}"}

    # ========================== 业务接口 ==========================

    def homeContent(self, filter):
        result = {}
        result['class'] = [
            {"type_name": "电影", "type_id": "1"},
            {"type_name": "电视剧", "type_id": "2"},
            {"type_name": "动漫", "type_id": "4"},
            {"type_name": "综艺", "type_id": "3"},
            {"type_name": "短剧", "type_id": "64"}
        ]
        filters = {}
        years = [{"n": "全部", "v": "0"}] + [{"n": str(y), "v": str(y)} for y in range(2026, 2004, -1)] + [{"n": "更早", "v": "2004"}]
        areas = [{"n": n, "v": v} for n, v in zip(
            ["全部", "大陆", "香港", "台湾", "美国", "韩国", "日本", "英国", "法国", "泰国", "印度", "其他"],
            ["0", "大陆", "香港", "台湾", "美国", "韩国", "日本", "英国", "法国", "泰国", "印度", "其他"])]
        sorts = [{"n": "最新", "v": "d_id"}, {"n": "最热", "v": "d_hits"}, {"n": "推荐", "v": "d_score"}]

        for tid in ["1", "2", "4", "3", "64"]:
            f = [{"key": "area", "name": "地区", "value": areas},
                 {"key": "sort", "name": "排序", "value": sorts}]
            if tid == "4":
                f.insert(0, {"key": "year", "name": "年份", "value": years[:13]})
            elif tid == "3":
                f.insert(0, {"key": "year", "name": "年份", "value": years[:6]})
            elif tid == "64":
                f.insert(0, {"key": "year", "name": "年份", "value": years[:5]})
            else:
                f.insert(0, {"key": "year", "name": "年份", "value": years})
            filters[tid] = f

        result['filters'] = filters
        return result

    def categoryContent(self, tid, pg, filter, extend):
        if extend is None or not isinstance(extend, dict):
            extend = {}
        data = self.api_request({
            "area": extend.get("area", "0"),
            "year": extend.get("year", "0"),
            "pageSize": "30",
            "sort": extend.get("sort", "d_id"),
            "page": str(pg),
            "tid": str(tid)
        }, "/App/IndexList/indexList")

        if isinstance(data, dict) and "_error" in data:
            return {"list": [], "page": int(pg), "pagecount": 0}

        videos = []
        for item in data.get('list', []):
            continu = item.get('vod_continu', 0)
            videos.append({
                "vod_id": f"{item.get('vod_id')}/{continu}",
                "vod_name": item.get('vod_name', ''),
                "vod_pic": item.get('vod_pic', ''),
                "vod_remarks": "电影" if continu == 0 else f"更新至{continu}集"
            })

        total_page = int(data.get('totalPage', 0))
        return {"list": videos, "page": int(pg), "pagecount": 9999 if total_page == 0 else total_page}

    def detailContent(self, ids):
        vod_id = ids[0].split("/")[0] if "/" in ids[0] else ids[0]
        detail = self.api_request({
            "token_id": "1649412",
            "vod_id": vod_id,
            "mobile_time": str(int(time.time())),
            "token": self.token
        }, "/App/IndexPlay/playInfo")

        play_data = self.api_request({
            "vurl_cloud_id": "2",
            "vod_d_id": vod_id
        }, "/App/Resource/Vurl/show")

        vod = detail.get('vodInfo', {}) if isinstance(detail, dict) else {}

        play_list = []
        if isinstance(play_data, dict) and 'list' in play_data:
            for index, item in enumerate(play_data['list']):
                if 'play' not in item:
                    continue
                n, p = [], []
                for k, v in item['play'].items():
                    if isinstance(v, dict) and 'param' in v and v['param']:
                        n.append(k)
                        p.append(v['param'])
                if p:
                    play_name = vod.get('vod_name', '') if len(play_data['list']) == 1 else str(index + 1)
                    play_list.append(f"{play_name}${p[-1]}||{'@'.join(n)}")

        return {"list": [{
            "vod_id": ids[0],
            "vod_name": vod.get("vod_name", ""),
            "vod_pic": vod.get("vod_pic", ""),
            "vod_year": vod.get("vod_year", ""),
            "vod_area": vod.get("vod_area", ""),
            "vod_actor": vod.get("vod_actor", ""),
            "vod_director": vod.get("vod_director", ""),
            "vod_content": str(vod.get("vod_use_content", "")).strip(),
            "vod_play_from": "瓜子专线",
            "vod_play_url": "#".join(play_list)
        }]}

    def searchContent(self, key, quick, pg="1"):
        data = self.api_request({
            "keywords": key,
            "order_val": "1",
            "page": str(pg)
        }, "/App/Index/findMoreVod")

        if isinstance(data, dict) and "_error" in data:
            return {"list": [], "page": int(pg), "pagecount": 0}

        videos = []
        for item in data.get('list', []):
            continu = item.get('vod_continu', 0)
            videos.append({
                "vod_id": f"{item.get('vod_id')}/{continu}",
                "vod_name": item.get('vod_name', ''),
                "vod_pic": item.get('vod_pic', ''),
                "vod_remarks": "电影" if continu == 0 else f"更新至{continu}集"
            })

        total_page = int(data.get('totalPage', 0))
        return {"list": videos, "page": int(pg), "pagecount": 1 if total_page == 0 else total_page}

    def playerContent(self, flag, id, vipFlags):
        parts = id.split('||')
        if len(parts) < 2:
            return {"parse": 0, "url": id, "header": self.header}

        param_str = parts[0]
        resolutions = parts[1].split('@')

        params = {}
        for pair in param_str.split('&'):
            if '=' in pair:
                k, v = pair.split('=', 1)
                if k:
                    params[k] = v

        if resolutions:
            resolutions.sort(key=lambda x: int(x) if x.isdigit() else 0, reverse=True)
            params['resolution'] = resolutions[0]

        data = self.api_request(params, "/App/Resource/VurlDetail/showOne")
        play_url = data.get('url', '') if isinstance(data, dict) else ''

        return {"parse": 0, "url": play_url, "header": self.header}
