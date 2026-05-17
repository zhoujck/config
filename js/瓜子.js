var h_ost = 'https://api.w32z7vtd.com';

var RSA_N = BigInt('0x7ba84aad62e2d734268d34f5a336c4e1074578918dc6e6f195de86ac51b18a6c5f32c301e81a49869713a2e02acb0005a6988a7ad50105b5f062c614d7036beb8f175663e608c0b2e2b63cbdd9621676cc523d3ce8353a67efe85c1756537fdbd46d0337713dc142d14b070a653df08ff702235bec0a6de08f64794aa900f58d');
var RSA_E = BigInt(65537);
var RSA_D = BigInt('0x247fb80b1574ff305570b881087bd200d9b497b1deb726d387f8f6a74635b135eba3800bc006824d47aa7418d688b4a8f653700c7172abccd7f74fa03716bb73912a71657d1669555ebf1585f073719a359d778d757153eed436c9a87fa1db5d731faf44c48625dd6dff99396c377dc00bd87480db94c020fb088a299e4a71d');

var TOKEN = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';

var KEYS_LIST = "qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=*";
var KEYS_DETAIL = "Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=*";
var KEYS_PLAY = "ZH8gpdp9bxjuG2NK97sol3o7Uiz+9eVEaVMlE2Fk3j7EResM3YHnECZUH7BONNTjpy7RVNi/YimGuNYriC7Cmswv4PNYiFYzw9QhlqZKwNfCM6IUpFZ0T4rZx8G78zkv2tNVbfYC4qNQedGi07nWZ33dlSuVxROVfY5JxOWHMI0=*";

var API_HEADERS = {
    'Cache-Control': 'no-cache',
    'Version': '2406025',
    'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
    'Ver': '1.9.2',
    'Referer': h_ost,
    'X-Customer-Client-Ip': '127.0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'api.w32z7vtd.com',
    'Connection': 'Keep-Alive',
    'User-Agent': 'okhttp/3.12.0'
};

// ========== AES-128-CBC 纯 JS 实现 ==========

var AES_SBOX = [
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
];

var AES_ISBOX = [
    0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
    0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
    0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
    0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
    0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
    0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
    0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
    0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
    0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
    0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
    0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
    0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
    0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
    0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
    0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
    0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d
];

var AES_RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

function aesKeyExpansion(key) {
    var w = [];
    for (var i = 0; i < 16; i++) w[i] = key[i];
    for (var i = 16; i < 176; i += 4) {
        var temp = w.slice(i - 4, i);
        if (i % 16 === 0) {
            temp = [AES_SBOX[temp[1]] ^ AES_RCON[i / 16 - 1], AES_SBOX[temp[2]], AES_SBOX[temp[3]], AES_SBOX[temp[0]]];
        }
        for (var j = 0; j < 4; j++) w[i + j] = w[i - 16 + j] ^ temp[j];
    }
    return w;
}

function aesAddRoundKey(state, w, round) {
    for (var i = 0; i < 16; i++) state[i] ^= w[round * 16 + i];
}

function aesSubBytes(state) {
    for (var i = 0; i < 16; i++) state[i] = AES_SBOX[state[i]];
}

function aesInvSubBytes(state) {
    for (var i = 0; i < 16; i++) state[i] = AES_ISBOX[state[i]];
}

function aesShiftRows(s) {
    var t;
    t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
}

function aesInvShiftRows(s) {
    var t;
    t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
}

function aesGmul(a, b) {
    var p = 0;
    for (var i = 0; i < 8; i++) {
        if (b & 1) p ^= a;
        var hi = a & 0x80;
        a = (a << 1) & 0xff;
        if (hi) a ^= 0x1b;
        b >>= 1;
    }
    return p;
}

function aesMixColumns(s) {
    for (var c = 0; c < 4; c++) {
        var i = c * 4;
        var a = s.slice(i, i + 4);
        s[i]   = aesGmul(a[0],2) ^ aesGmul(a[1],3) ^ a[2] ^ a[3];
        s[i+1] = a[0] ^ aesGmul(a[1],2) ^ aesGmul(a[2],3) ^ a[3];
        s[i+2] = a[0] ^ a[1] ^ aesGmul(a[2],2) ^ aesGmul(a[3],3);
        s[i+3] = aesGmul(a[0],3) ^ a[1] ^ a[2] ^ aesGmul(a[3],2);
    }
}

function aesInvMixColumns(s) {
    for (var c = 0; c < 4; c++) {
        var i = c * 4;
        var a = s.slice(i, i + 4);
        s[i]   = aesGmul(a[0],0xe) ^ aesGmul(a[1],0xb) ^ aesGmul(a[2],0xd) ^ aesGmul(a[3],0x9);
        s[i+1] = aesGmul(a[0],0x9) ^ aesGmul(a[1],0xe) ^ aesGmul(a[2],0xb) ^ aesGmul(a[3],0xd);
        s[i+2] = aesGmul(a[0],0xd) ^ aesGmul(a[1],0x9) ^ aesGmul(a[2],0xe) ^ aesGmul(a[3],0xb);
        s[i+3] = aesGmul(a[0],0xb) ^ aesGmul(a[1],0xd) ^ aesGmul(a[2],0x9) ^ aesGmul(a[3],0xe);
    }
}

function aesEncryptBlock(input, w) {
    var state = input.slice();
    aesAddRoundKey(state, w, 0);
    for (var round = 1; round < 10; round++) {
        aesSubBytes(state);
        aesShiftRows(state);
        aesMixColumns(state);
        aesAddRoundKey(state, w, round);
    }
    aesSubBytes(state);
    aesShiftRows(state);
    aesAddRoundKey(state, w, 10);
    return state;
}

function aesDecryptBlock(input, w) {
    var state = input.slice();
    aesAddRoundKey(state, w, 10);
    for (var round = 9; round > 0; round--) {
        aesInvShiftRows(state);
        aesInvSubBytes(state);
        aesAddRoundKey(state, w, round);
        aesInvMixColumns(state);
    }
    aesInvShiftRows(state);
    aesInvSubBytes(state);
    aesAddRoundKey(state, w, 0);
    return state;
}

function pkcs7Pad(data) {
    var padLen = 16 - (data.length % 16);
    var result = data.slice();
    for (var i = 0; i < padLen; i++) result.push(padLen);
    return result;
}

function pkcs7Unpad(data) {
    var padLen = data[data.length - 1];
    if (padLen < 1 || padLen > 16) return data;
    return data.slice(0, data.length - padLen);
}

function aesCbcEncrypt(plaintext, key, iv) {
    var w = aesKeyExpansion(key);
    var data = pkcs7Pad(plaintext);
    var prev = iv.slice();
    var result = [];
    for (var i = 0; i < data.length; i += 16) {
        var block = data.slice(i, i + 16);
        for (var j = 0; j < 16; j++) block[j] ^= prev[j];
        var encrypted = aesEncryptBlock(block, w);
        result = result.concat(encrypted);
        prev = encrypted;
    }
    return result;
}

function aesCbcDecrypt(ciphertext, key, iv) {
    var w = aesKeyExpansion(key);
    var prev = iv.slice();
    var result = [];
    for (var i = 0; i < ciphertext.length; i += 16) {
        var block = ciphertext.slice(i, i + 16);
        var decrypted = aesDecryptBlock(block, w);
        for (var j = 0; j < 16; j++) decrypted[j] ^= prev[j];
        result = result.concat(decrypted);
        prev = block;
    }
    return pkcs7Unpad(result);
}

// ========== 工具函数 ==========

function hexToBytes(hex) {
    var bytes = [];
    for (var i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
    return bytes;
}

function bytesToHex(bytes) {
    var hex = '';
    for (var i = 0; i < bytes.length; i++) {
        var h = (bytes[i] >>> 0).toString(16);
        hex += h.length < 2 ? '0' + h : h;
    }
    return hex.toUpperCase();
}

function strToBytes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 0x80) { bytes.push(c); }
        else if (c < 0x800) { bytes.push(0xC0|(c>>6), 0x80|(c&0x3F)); }
        else { bytes.push(0xE0|(c>>12), 0x80|((c>>6)&0x3F), 0x80|(c&0x3F)); }
    }
    return bytes;
}

function bytesToStr(bytes) {
    var str = '';
    for (var i = 0; i < bytes.length; i++) {
        var b = bytes[i];
        if (b < 0x80) { str += String.fromCharCode(b); }
        else if (b < 0xE0) { str += String.fromCharCode(((b&0x3F)<<6)|(bytes[++i]&0x3F)); }
        else { str += String.fromCharCode(((b&0x0F)<<12)|((bytes[++i]&0x3F)<<6)|(bytes[++i]&0x3F)); }
    }
    return str;
}

function b64ToBytes(b64) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var bytes = [];
    var buf = 0, bits = 0;
    for (var i = 0; i < b64.length; i++) {
        var c = b64.charAt(i);
        if (c === '=') break;
        var val = chars.indexOf(c);
        if (val < 0) continue;
        buf = (buf << 6) | val;
        bits += 6;
        if (bits >= 8) { bits -= 8; bytes.push((buf >> bits) & 0xFF); }
    }
    return bytes;
}

function aesEncryptHex(plaintext) {
    var key = strToBytes("mvXBSW7ekreItNsT");
    var iv = strToBytes("2U3IrJL8szAKp0Fj");
    var data = strToBytes(plaintext);
    var result = aesCbcEncrypt(data, key, iv);
    return bytesToHex(result);
}

function aesDecryptHex(hexStr, keyBytes, ivBytes) {
    var data = hexToBytes(hexStr);
    var result = aesCbcDecrypt(data, keyBytes, ivBytes);
    return bytesToStr(result);
}

// RSA 纯 JS 解密 (PKCS1v1.5)
function modPow(base, exp, mod) {
    var result = BigInt(1);
    base = base % mod;
    while (exp > BigInt(0)) {
        if (exp & BigInt(1)) result = (result * base) % mod;
        exp = exp >> BigInt(1);
        base = (base * base) % mod;
    }
    return result;
}

function rsaDecrypt(encBytes) {
    var hex = '';
    for (var i = 0; i < encBytes.length; i++) {
        var h = (encBytes[i] >>> 0).toString(16);
        hex += h.length < 2 ? '0' + h : h;
    }
    var c = BigInt('0x' + hex);
    var m = modPow(c, RSA_D, RSA_N);
    var mHex = m.toString(16);
    if (mHex.length % 2) mHex = '0' + mHex;
    var mBytes = hexToBytes(mHex);
    // PKCS1v1.5: skip 0x00, 0x02, padding bytes, 0x00
    var i = 0;
    if (mBytes[i] === 0) i++;
    if (mBytes[i] === 2) i++;
    while (i < mBytes.length && mBytes[i] !== 0) i++;
    if (i < mBytes.length) i++;
    return mBytes.slice(i);
}

// ========== API 请求 ==========

function buildBody(requestKeyEnc, t, keysStr) {
    var signature = 'token_id=,token=' + TOKEN + ',phone_type=1,request_key=' + requestKeyEnc
        + ',app_id=1,time=' + t + ',keys=' + keysStr
        + '*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    var signature2 = md5(signature);
    return 'token=' + TOKEN + '&token_id=&phone_type=1&time=' + t
        + '&phone_model=xiaomi-22021211rc'
        + '&keys=' + encodeURIComponent(keysStr)
        + '&request_key=' + requestKeyEnc
        + '&signature=' + signature2
        + '&app_id=1&ad_version=1';
}

function apiPost(path, body) {
    var resp = fetch(h_ost + path, {
        headers: API_HEADERS,
        body: body,
        method: 'POST',
        rejectCoding: true
    });
    var j = JSON.parse(resp).data;
    var encKeys = b64ToBytes(j.keys);
    var decKeys = rsaDecrypt(encKeys);
    var keyiv = JSON.parse(bytesToStr(decKeys));
    var aesKey = strToBytes(keyiv.key);
    var aesIv = strToBytes(keyiv.iv);
    var plain = aesDecryptHex(j.response_key, aesKey, aesIv);
    return JSON.parse(plain);
}

function getSubForTid(tid) {
    var subs = ["5", "12", "30", "22", ""];
    var tids = ["1", "2", "4", "3", "64"];
    var idx = tids.indexOf(tid);
    return idx !== -1 ? subs[idx] : "";
}

// ========== TVBox 接口 ==========

var rule = {
    title: '瓜子',
    host: h_ost,
    url: '/App/IndexList/indexList',
    searchable: 2,
    quickSearch: 1,
    filterable: 1,
    class_name: '电视剧&电影&动漫&综艺&短剧',
    class_url: '2&1&4&3&64',
    play_parse: true,
    lazy: $js.toString(() => {
        var t = String(Math.floor(Date.now() / 1000));
        var vodId = input.split("/")[0];
        var vurlId = input.split("/")[1];
        var resolution = input.split("?")[1];
        var requestKey = JSON.stringify({
            "domain_type": "8", "vod_id": vodId, "type": "play",
            "resolution": resolution, "vurl_id": vurlId
        });
        var requestKeyEnc = aesEncryptHex(requestKey);
        var body = buildBody(requestKeyEnc, t, KEYS_PLAY);
        var data = apiPost("/App/Resource/VurlDetail/showOne", body);
        input = { url: data.url, parse: 0, header: API_HEADERS };
        setResult(input);
    }),
    一级: $js.toString(() => {
        var d = [];
        var t = String(Math.floor(Date.now() / 1000));
        var sub = MY_FL.sub || getSubForTid(MY_CATE);
        var requestKey = JSON.stringify({
            "area": (MY_FL.area || "0").toString(),
            "sub": sub.toString(),
            "year": (MY_FL.year || "0").toString(),
            "pageSize": "30",
            "sort": (MY_FL.sort || "d_id").toString(),
            "page": String(MY_PAGE),
            "tid": MY_CATE
        });
        var requestKeyEnc = aesEncryptHex(requestKey);
        var body = buildBody(requestKeyEnc, t, KEYS_LIST);
        var data = apiPost("/App/IndexList/indexList", body);
        (data.list || []).forEach(function(item) {
            d.push({
                title: item.vod_name,
                desc: item.vod_continu == 0 ? '电影' : '更新至' + item.vod_continu + '集',
                year: item.vod_scroe,
                img: item.vod_pic,
                url: item.vod_id + '/' + item.vod_continu
            });
        });
        setResult(d);
    }),
    二级: $js.toString(() => {
        var t = String(Math.floor(Date.now() / 1000));
        var vodId = input.split("/")[0];
        var requestKey = JSON.stringify({
            "token_id": "393668", "vod_id": vodId,
            "mobile_time": t, "token": TOKEN
        });
        var requestKeyEnc = aesEncryptHex(requestKey);
        var body = buildBody(requestKeyEnc, t, KEYS_DETAIL);
        var data = apiPost("/App/IndexPlay/playInfo", body);
        var vodInfo = data.vodInfo;

        var requestKey2 = JSON.stringify({"vurl_cloud_id": "2", "vod_d_id": vodId});
        var requestKeyEnc2 = aesEncryptHex(requestKey2);
        var body2 = buildBody(requestKeyEnc2, t, KEYS_DETAIL);
        var data2 = apiPost("/App/Resource/Vurl/show", body2);

        var episodes = [];
        (data2.list || []).forEach(function(item) {
            var playParams = Object.values(item.play);
            var lastParam = null;
            for (var i = playParams.length - 1; i >= 0; i--) {
                if (playParams[i].param) { lastParam = playParams[i].param; break; }
            }
            if (lastParam) {
                var vm = lastParam.match(/vurl_id=(\d+)/);
                var rm = lastParam.match(/resolution=(\d+)/);
                if (vm) episodes.push(item.title + '$' + vodId + '/' + vm[1] + '?' + rm[1]);
            }
        });

        VOD = {
            title: vodInfo.vod_name,
            type: (vodInfo.videoTag || []).join(''),
            desc: vodInfo.vod_use_content,
            vod_actor: vodInfo.vod_actor,
            vod_area: vodInfo.vod_area,
            vod_director: vodInfo.vod_director,
            img: vodInfo.vod_pic,
            vod_play_from: '瓜子HD',
            vod_play_url: episodes.join('#')
        };
    }),
    搜索: $js.toString(() => {
        var d = [];
        var t = String(Math.floor(Date.now() / 1000));
        var url = input.split("#")[0];
        var keywords = input.split("#")[1];
        var requestKey = JSON.stringify({"keywords": keywords, "order_val": "1"});
        var requestKeyEnc = aesEncryptHex(requestKey);
        var body = buildBody(requestKeyEnc, t, KEYS_LIST);
        var data = apiPost(url, body);
        (data.list || []).forEach(function(item) {
            d.push({
                title: item.vod_name,
                desc: item.vod_continu == 0 ? '电影' : '更新至' + item.vod_continu + '集',
                content: item.vod_addtime,
                img: item.vod_pic,
                url: item.vod_id + '/' + item.vod_continu
            });
        });
        setResult(d);
    })
};
