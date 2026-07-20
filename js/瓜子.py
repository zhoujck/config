# coding = utf-8
"""
瓜子影视 TVBox 爬虫插件 - 优化版
原始来源: PizazzGY/NewTVBox
优化点:
  1. 修复 get_cached_data 未定义 bug
  2. logging 替代 print
  3. 重试逻辑扁平化
  4. 缓存加大小限制 + 过期清理
  5. 常量提取，减少魔法值
  6. 加解密工具方法去掉冗余 try-catch（让调用方处理）
  7. 签名拼接可读性优化
  8. playerContent 补全
"""
import sys
import json
import time
import base64
import hashlib
import random
import logging

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
from base.spider import Spider

sys.path.append('..')

# ── 日志 ──────────────────────────────────────────────────────────
log = logging.getLogger("GZYS")
if not log.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("[%(name)s] %(levelname)s: %(message)s"))
    log.addHandler(_h)
    log.setLevel(logging.INFO)


class Spider(Spider):

    # ── 常量 ──────────────────────────────────────────────────────
    NAME = "瓜子"
    HOSTS = [
        'https://apinew.uozvr.com',
        'https://api.w32z7vtd.com',
        'https://api.6a7nnf7.com',
        'https://api.umygrx3.com',
        'https://api.rmedphk.com',
    ]
    AES_KEY = 'OITxa5OqAYjhswxx'
    AES_IV = 'rCMNwZASNBKZ8mXV'
    RSA_PUBLIC_KEY = (
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDUM5+/y8sPsWkd1/RQS64X259"
        "EUwxFXFE5HlA65MqrxnPs0JqoSRojSDy5QhwvROlaD6TwRQHKMY2OAZ6SnQeUJs"
        "ChTEFIR9qUkwrs3/MVUMxjsv6JS6Oe/juclyJGTgVmDhB55EafXsD0SQYVj/QXXs"
        "xR6ewR5E2kL52yAAD4yQIDAQAB"
    )
    RSA_PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----"""
    DEVICE_OLD_KEY = "aLFBMWpxBrIDAD1Si/KVvm41"

    # 签名后缀（API 固定拼接规则）
    SIGN_SUFFIX = "*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br"

    # 缓存配置
    CACHE_MAX = 300
    CACHE_TTL = 300  # 秒

    # 重试配置
    MAX_ROUNDS = 3  # 最多轮询几轮域名

    # Fallback token（仅初始化认证全部失败时兜底，基本无效）
    FALLBACK_TOKEN = (
        '024212ef0975c5306a1434e113a46463.'
        'bc77313e11a248558a6ca244ca980944ec3421fa480c50e0229ad91f1cb15aea5'
        '82603202cd71796885c9e5163e500f1b72f737059aff1ddb8beea47c5a331d676'
        '0540345b7f88b2302a0e6e09589f9dcf3ff9175d8c905f990203f5fc04748008'
        'ea7a366571cbf5b09509a873dcfba3cf1d5590385f5f7ef6e01d1850974aa220'
        'eb5178c89e61c24411af9b9a19435e.'
        '06fde789ece48d9b33c5dc857e04e9b5838f08264d928b87237d3476c4484b46'
    )

    def __init__(self):
        self.host_index = 0
        self.host = self.HOSTS[0]

        # 设备信息（随机生成，每次实例化不同）
        self.deviceId = str(864150060000000 + random.randint(0, 9999))
        self.deviceKey = ''.join(random.choices('0123456789ABCDEF', k=40))
        self.token = ""
        self.token_id = ""
        self.registered = False

        self.header = {
            'User-Agent': 'Lavf/57.83.100',
            'code': 'GZ0369',
            'deviceId': self.deviceId,
            'lang': 'zh_cn',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Version': '2604028',
            'PackageName': 'com.ae06aebdbb.y286327f5a.ofe849883320260517',
            'Ver': '3.0.3.2',
            'api-ver': '3.0.3.2',
            'Referer': self.host,
        }

        # {cache_key: (data, timestamp)}
        self._cache = {}

        # 初始化 token
        self._init_token()

    # ── TVBox 接口 ────────────────────────────────────────────────
    def getName(self):
        return self.NAME

    def init(self, extend=''):
        pass

    # ── 设备认证 ──────────────────────────────────────────────────
    def _init_token(self):
        log.info("初始化设备认证...")
        try:
            if not self.registered:
                self._sign_up()
            self._refresh_token()
        except Exception as e:
            log.warning("初始化 token 失败，使用 fallback: %s", e)
            self.token = self.FALLBACK_TOKEN

    def _sign_up(self):
        log.info("注册新设备...")
        params = {
            "new_key": self.deviceKey,
            "old_key": self.DEVICE_OLD_KEY,
            "phone_type": 1,
            "code": "",
        }
        result = self._auth_request('/App/Authentication/Device/signUp', params)
        self._apply_auth(result)
        self.registered = True

    def _sign_in(self):
        log.info("设备登录...")
        params = {
            "new_key": self.deviceKey,
            "old_key": self.DEVICE_OLD_KEY,
        }
        result = self._auth_request('/App/Authentication/Device/signIn', params)
        self._apply_auth(result)

    def _refresh_token(self):
        log.info("刷新 token...")
        result = self._auth_request('/App/Authentication/Authenticator/refresh', {})
        self._apply_auth(result)

    def _apply_auth(self, result):
        new_token = (result or {}).get('token', '')
        if not new_token:
            raise Exception(f"认证失败，无 token 返回: {result}")
        self.token = new_token
        token_id = result.get('app_user_id', '')
        if token_id:
            self.token_id = token_id
        log.info("token 获取成功, 前缀: %s...", self.token[:30])

    def _ensure_token(self):
        """确保 token 有效，未就绪则重新获取"""
        if self.token and self.token_id:
            return
        if self.registered:
            self._sign_in()
        else:
            self._sign_up()
        self._refresh_token()

    def _auth_request(self, path, params):
        return self._send_encrypted_request(params, path, is_auth=True)

    # ── 核心请求 ──────────────────────────────────────────────────
    def _send_encrypted_request(self, data, path, is_auth=False):
        """
        发送加密请求 → 解密响应 → 返回 dict，失败返回 None。
        """
        try:
            if not is_auth:
                self._ensure_token()

            # 1. 参数 JSON → AES 加密
            json_params = json.dumps(data)
            request_key = self._aes_encrypt(json_params).upper()

            # 2. RSA 加密 AES 密钥信息
            key_json = json.dumps({"iv": self.AES_IV, "key": self.AES_KEY})
            keys = self._rsa_encrypt(key_json)

            # 3. 签名
            t = str(int(time.time()))
            sign_str = (
                f"token_id=,token={self.token},phone_type=1,"
                f"request_key={request_key},app_id=1,time={t},keys={keys}"
                f"{self.SIGN_SUFFIX}"
            )
            signature = hashlib.md5(sign_str.encode()).hexdigest().upper()

            # 4. 请求体
            body = {
                'token': self.token,
                'token_id': '',
                'phone_type': '1',
                'time': t,
                'phone_model': 'xiaomi-25031',
                'keys': keys,
                'request_key': request_key,
                'signature': signature,
                'app_id': '1',
                'ad_version': '1',
            }

            # 5. 发送
            url = f"{self.host}{path}"
            response = self.post(url, headers=self.header, data=body, timeout=10)
            if response.status_code != 200:
                raise Exception(f"HTTP {response.status_code}")

            resp_json = response.json()
            code = resp_json.get('code')
            if code is not None and code != 200:
                raise Exception(f"业务错误码 {code}: {resp_json}")

            data_section = resp_json.get('data')
            if not data_section:
                raise Exception(f"响应缺少 data 字段: {resp_json}")

            # 6. 解密响应
            enc_response = data_section.get('response_key', '')
            enc_keys = data_section.get('keys', '')
            dec_keys_json = self._rsa_decrypt(enc_keys)
            key_info = json.loads(dec_keys_json)
            decrypted = self._aes_decrypt(enc_response, key_info['key'], key_info['iv'])
            return json.loads(decrypted)

        except Exception as e:
            log.warning("请求失败 [%s]: %s", path, e)
            return None

    def get_data(self, data, path, use_cache=True):
        """
        带缓存 + 域名轮询 + 重试的数据获取。
        所有域名轮完一轮失败 → 重新认证 → 再试，最多 MAX_ROUNDS 轮。
        """
        cache_key = None
        if use_cache:
            cache_key = f"{path}|{json.dumps(data, sort_keys=True)}"
            cached = self._cache_get(cache_key)
            if cached is not None:
                return cached

        n_hosts = len(self.HOSTS)
        for round_idx in range(self.MAX_ROUNDS):
            for i in range(n_hosts):
                self.host = self.HOSTS[(self.host_index + i) % n_hosts]
                self.header['Referer'] = self.host
                result = self._send_encrypted_request(data, path)
                if result is not None:
                    if use_cache and cache_key:
                        self._cache_set(cache_key, result)
                    return result

            # 一轮全部失败，重新认证
            self.host_index = 0
            if round_idx < self.MAX_ROUNDS - 1:
                log.warning("所有域名失败，重新认证后重试 (%d/%d)...", round_idx + 1, self.MAX_ROUNDS)
                try:
                    self._ensure_token()
                except Exception:
                    pass

        log.error("所有重试均失败 [%s]", path)
        return None

    # ── 缓存管理 ──────────────────────────────────────────────────
    def _cache_get(self, key):
        item = self._cache.get(key)
        if item and (time.time() - item[1]) < self.CACHE_TTL:
            return item[0]
        if item:
            del self._cache[key]
        return None

    def _cache_set(self, key, value):
        # 清理过期
        now = time.time()
        expired = [k for k, (_, ts) in self._cache.items() if now - ts > self.CACHE_TTL]
        for k in expired:
            del self._cache[k]
        # 超限淘汰最旧
        if len(self._cache) >= self.CACHE_MAX:
            oldest = min(self._cache, key=lambda k: self._cache[k][1])
            del self._cache[oldest]
        self._cache[key] = (value, now)

    # ── 加解密工具 ────────────────────────────────────────────────
    def _aes_encrypt(self, text):
        cipher = AES.new(self.AES_KEY.encode(), AES.MODE_CBC, self.AES_IV.encode())
        return cipher.encrypt(pad(text.encode(), AES.block_size)).hex()

    def _aes_decrypt(self, text, key, iv):
        cipher = AES.new(key.encode(), AES.MODE_CBC, iv.encode())
        return unpad(cipher.decrypt(bytes.fromhex(text)), AES.block_size).decode()

    def _rsa_encrypt(self, text):
        key = RSA.import_key(f"-----BEGIN PUBLIC KEY-----\n{self.RSA_PUBLIC_KEY}\n-----END PUBLIC KEY-----")
        cipher = PKCS1_v1_5.new(key)
        return base64.b64encode(cipher.encrypt(text.encode())).decode()

    def _rsa_decrypt(self, encrypted_data):
        cipher = PKCS1_v1_5.new(RSA.import_key(self.RSA_PRIVATE_KEY))
        decrypted = cipher.decrypt(base64.b64decode(encrypted_data), None)
        return decrypted.decode() if decrypted else ""

    # ── 业务方法 ──────────────────────────────────────────────────
    CATEGORIES = [
        {"type_name": "电影", "type_id": "1"},
        {"type_name": "电视剧", "type_id": "2"},
        {"type_name": "动漫", "type_id": "4"},
        {"type_name": "综艺", "type_id": "3"},
        {"type_name": "短剧", "type_id": "64"},
    ]

    AREAS = [
        {"n": "全部", "v": "0"}, {"n": "大陆", "v": "大陆"}, {"n": "香港", "v": "香港"},
        {"n": "台湾", "v": "台湾"}, {"n": "美国", "v": "美国"}, {"n": "韩国", "v": "韩国"},
        {"n": "日本", "v": "日本"}, {"n": "英国", "v": "英国"}, {"n": "法国", "v": "法国"},
        {"n": "泰国", "v": "泰国"}, {"n": "印度", "v": "印度"}, {"n": "其他", "v": "其他"},
    ]

    YEARS = [{"n": "全部", "v": "0"}] + [
        {"n": str(y), "v": str(y)} for y in range(2025, 2004, -1)
    ] + [{"n": "更早", "v": "2004"}]

    SORTS = [
        {"n": "最新", "v": "d_id"},
        {"n": "最热", "v": "d_hits"},
        {"n": "推荐", "v": "d_score"},
    ]

    def homeContent(self, filter):
        filters = {}
        for cate in self.CATEGORIES:
            tid = cate['type_id']
            filters[tid] = [
                {"key": "area", "name": "地区", "value": self.AREAS},
                {"key": "year", "name": "年份", "value": self.YEARS},
                {"key": "sort", "name": "排序", "value": self.SORTS},
            ]
        return {'class': self.CATEGORIES, 'filters': filters}

    def homeVideoContent(self):
        return {'list': []}

    def categoryContent(self, tid, pg, filter, extend):
        videos = []
        try:
            body = {
                "area": extend.get('area', '0'),
                "year": extend.get('year', '0'),
                "pageSize": "30",
                "sort": extend.get('sort', 'd_id'),
                "page": str(pg),
                "tid": tid,
            }
            data = self.get_data(body, '/App/IndexList/indexList')
            if data and 'list' in data:
                for item in data['list']:
                    vod_continu = item.get('vod_continu', 0)
                    remarks = '电影' if vod_continu == 0 else f'更新至{vod_continu}集'
                    videos.append({
                        "vod_id": f"{item.get('vod_id', '')}/{vod_continu}",
                        "vod_name": item.get('vod_name', ''),
                        "vod_pic": item.get('vod_pic', ''),
                        "vod_remarks": remarks,
                    })
        except Exception as e:
            log.error("获取分类内容失败: %s", e)
        return {'list': videos, 'page': int(pg), 'pagecount': 9999, 'limit': 30, 'total': 999999}

    def detailContent(self, ids):
        try:
            vod_id = ids[0].split('/')[0]
            t = str(int(time.time()))

            # 获取播放信息
            body1 = {"token_id": self.token_id, "vod_id": vod_id, "mobile_time": t, "token": self.token}
            qdata = self.get_data(body1, '/App/IndexPlay/playInfo')

            # 获取播放源
            body2 = {"vurl_cloud_id": "2", "vod_d_id": vod_id}
            jdata = self.get_data(body2, '/App/Resource/Vurl/show')

            if not qdata or 'vodInfo' not in qdata:
                return {'list': []}

            vod = qdata['vodInfo']
            video_detail = {
                "vod_id": vod_id,
                "vod_name": vod.get('vod_name', ''),
                "vod_pic": vod.get('vod_pic', ''),
                "vod_year": vod.get('vod_year', ''),
                "vod_area": vod.get('vod_area', ''),
                "vod_actor": vod.get('vod_actor', ''),
                "vod_director": vod.get('vod_director', ''),
                "vod_content": vod.get('vod_use_content', '').strip(),
                "vod_play_from": "瓜子影视",
            }

            # 解析播放列表
            play_list = []
            if jdata and 'list' in jdata:
                for index, item in enumerate(jdata['list']):
                    if 'play' not in item:
                        continue
                    names, params = [], []
                    for key, value in item['play'].items():
                        if value.get('param'):
                            names.append(key)
                            params.append(value['param'])
                    if params:
                        play_name = str(index + 1) if len(jdata['list']) != 1 else vod.get('vod_name', '')
                        play_url = f"{params[-1]}||{'@'.join(names)}"
                        play_list.append(f"{play_name}${play_url}")

            video_detail["vod_play_url"] = "#".join(play_list)
            return {'list': [video_detail]}

        except Exception as e:
            log.error("获取详情失败: %s", e)
            return {'list': []}

    def searchContent(self, key, quick, pg=1):
        videos = []
        try:
            body = {"keywords": key, "order_val": "1", "page": str(pg)}
            data = self.get_data(body, '/App/Index/findMoreVod', use_cache=False)
            if data and 'list' in data:
                for item in data['list']:
                    vod_continu = item.get('vod_continu', 0)
                    remarks = '电影' if vod_continu == 0 else f'更新至{vod_continu}集'
                    videos.append({
                        "vod_id": f"{item.get('vod_id', '')}/{vod_continu}",
                        "vod_name": item.get('vod_name', ''),
                        "vod_pic": item.get('vod_pic', ''),
                        "vod_remarks": remarks,
                    })
        except Exception as e:
            log.error("搜索失败: %s", e)
        return {'list': videos, 'page': int(pg), 'pagecount': 9999, 'limit': 30, 'total': 999999}

    def playerContent(self, flag, id, vipFlags):
        try:
            parts = id.split('||')
            if len(parts) < 2:
                return {"parse": 0, "playUrl": "", "url": ""}

            param_str = parts[0]
            resolutions = parts[1].split('@') if len(parts) > 1 else []

            # 解析参数
            params = {}
            for pair in param_str.split('&'):
                if '=' in pair:
                    k, v = pair.split('=', 1)
                    params[k] = v

            # 选择最高分辨率
            if resolutions:
                resolutions.sort(key=lambda x: int(x) if x.isdigit() else 0, reverse=True)
                params['resolution'] = resolutions[0]

            data = self.get_data(params, '/App/Resource/VurlDetail/showOne', use_cache=False)
            if data and 'url' in data:
                return {
                    "parse": 0,
                    "playUrl": "",
                    "url": data['url'],
                    "header": json.dumps({
                        "User-Agent": "Lavf/57.83.100",
                        "Referer": "http://WJiZxLXA2.com/",
                    }),
                    "danmaku": "",
                }

            return {"parse": 0, "playUrl": "", "url": ""}
        except Exception as e:
            log.error("播放解析失败: %s", e)
            return {"parse": 0, "playUrl": "", "url": ""}
