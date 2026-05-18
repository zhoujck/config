/*
title: '瓜子app', author: '重写/v1.0.0'
基于瓜子APP接口，参考金牌.js/热播.js结构重写
原版使用Node.js模块(require)，改为纯JS实现兼容TV盒子JS引擎

加密说明:
- MD5: 纯JS实现
- AES-CBC: 纯JS实现(CryptoJS兼容)
- RSA解密: 纯JS实现(用于解密API响应的AES密钥)
- HTTP请求: 使用TV盒子内置request()函数(兼容req())
*/
var HOST;
const MOBILE_UA = "okhttp/3.12.0";
var DefHeader = {
    'Cache-Control': 'no-cache',
    'Version': '2406025',
    'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
    'Ver': '1.9.2',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': MOBILE_UA
};
var KParams = {
    headers: {},
    timeout: 20000
};

var TOKEN = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';
var KEYS_STR = "Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=";
var AES_REQ_KEY = 'mvXBSW7ekreItNsT';
var AES_REQ_IV = '2U3IrJL8szAKp0Fj';

// 缓存
var _cache = {};
var CACHE_TIMEOUT = 300;

// 正确的纯JS MD5实现 - 替换瓜子.js中的md5函数
// 基于RFC 1321标准实现
function md5(s){var n=s;function d(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function f(n,t,r,e,o,u){return d((u=d(d(t,n),d(e,u)))<<o|u>>>32-o,r)}function l(n,t,r,e,o,u,c){return f(t&r|~t&e,n,t,o,u,c)}function g(n,t,r,e,o,u,c){return f(t&e|r&~e,n,t,o,u,c)}function v(n,t,r,e,o,u,c){return f(t^r^e,n,t,o,u,c)}function m(n,t,r,e,o,u,c){return f(r^(t|~e),n,t,o,u,c)}function c(n,t){var r,e,o,u;n[t>>5]|=128<<t%32,n[14+(t+64>>>9<<4)]=t;for(var c=1732584193,f=-271733879,i=-1732584194,a=271733878,h=0;h<n.length;h+=16)c=l(r=c,e=f,o=i,u=a,n[h],7,-680876936),a=l(a,c,f,i,n[h+1],12,-389564586),i=l(i,a,c,f,n[h+2],17,606105819),f=l(f,i,a,c,n[h+3],22,-104525330),c=l(c,f,i,a,n[h+4],7,-176418897),a=l(a,c,f,i,n[h+5],120080426),i=l(i,a,c,f,n[h+6],17,-1473231341),f=l(f,i,a,c,n[h+7],22,-45705983),c=l(c,f,i,a,n[h+8],7,1770035416),a=l(a,c,f,i,n[h+9],12,-1958414417),i=l(i,a,c,f,n[h+10],17,-42063),f=l(f,i,a,c,n[h+11],2,-190404162),c=l(c,f,i,a,n[h+12],7,1804603682),a=l(a,c,f,i,n[h+13],12,-40341101),i=l(i,a,c,f,n[h+14],17,-150200290),c=g(c,f=l(f,i,a,c,n[h+15],22,1236535329),i,a,n[h+1],5,-165796510),a=g(a,c,f,i,n[h+6],9,-1069501632),i=g(i,a,c,f,n[h+11],14,64371713),f=g(f,i,a,c,n[h],20,-373897302),c=g(c,f,i,a,n[h+5],5,-701558691),a=g(a,c,f,i,n[h+10],9,38016083),i=g(i,a,c,f,n[h+15],14,-60478335),f=g(f,i,a,c,n[h+4],20,-405537848),c=g(c,f,i,a,n[h+9],5,568446438),a=g(a,c,f,i,n[h+14],9,-1019803690),i=g(i,a,c,f,n[h+3],14,-187363961),f=g(f,i,a,c,n[h+8],20,163531501),c=g(c,f,i,a,n[h+13],5,-1444681467),a=g(a,c,f,i,n[h+2],9,-51403784),i=g(i,a,c,f,n[h+7],14,1735328473),c=v(c,f=g(f,i,a,c,n[h+12],20,-192607734),i,a,n[h+5],4,-37858),a=v(a,c,f,i,n[h+8],11,-20257463),i=v(i,a,c,f,n[h+11],16,1839030562),f=v(f,i,a,c,n[h+14],23,-35309556),c=v(c,f,i,a,n[h+1],4,-153092060),a=v(a,c,f,i,n[h+4],11,1272893353),i=v(i,a,c,f,n[h+7],16,-155497632),f=v(f,i,a,c,n[h+10],23,-1094730640),c=v(c,f,i,a,n[h+13],4,681279174),a=v(a,c,f,i,n[h],11,-35853722),i=v(i,a,c,f,n[h+3],16,-722521979),f=v(f,i,a,c,n[h+6],23,76029189),c=v(c,f,i,a,n[h+9],4,-640364487),a=v(a,c,f,i,n[h+12],11,-421815835),i=v(i,a,c,f,n[h+15],16,530742520),c=m(c,f=v(f,i,a,c,n[h+2],23,-99538651),i,a,n[h],6,-198630844),a=m(a,c,f,i,n[h+7],10,1126891415),i=m(i,a,c,f,n[h+14],15,-1416354905),f=m(f,i,a,c,n[h+5],21,-57434055),c=m(c,f,i,a,n[h+12],6,1700485571),a=m(a,c,f,i,n[h+3],10,-1894986606),i=m(i,a,c,f,n[h+10],15,-1051523),f=m(f,i,a,c,n[h+1],21,-2054922799),c=m(c,f,i,a,n[h+8],6,187313359),a=m(a,c,f,i,n[h+15],10,-30611744),i=m(i,a,c,f,n[h+6],15,-1560198380),f=m(f,i,a,c,n[h+13],21,1309151649),c=m(c,f,i,a,n[h+4],6,-145523070),a=m(a,c,f,i,n[h+11],10,-1120210379),i=m(i,a,c,f,n[h+2],15,718787259),f=m(f,i,a,c,n[h+9],21,-34348551),c=d(c,r),f=d(f,e),i=d(i,o),a=d(a,u);return[c,f,i,a]}function i(n){for(var t="",r=32*n.length,e=0;e<r;e+=8)t+=String.fromCharCode(n[e>>5]>>>e%32&25);return t}function a(n){var t=[];for(t[(n.length>>2)-1]=void 0,e=0;e<t.length;e+=1)t[e]=0;for(var r=8*n.length,e=0;e<r;e+=8)t[e>>5]|=(255&n.charCodeAt(e/8))<<e%32;return t}function e(n){for(var t,r="0123456789abcdef",e="",o=0;o<n.length;o+=1)t=n.charCodeAt(o),e+=r.charAt(t>>>4&15)+r.charAt(15&t);return e}function r(n){return unescape(encodeURIComponent(n))}function o(n){return i(c(a(n=r(n)),8*n.length))}return e(o(s))}
function md5(s) {
    var bytes = strToUtf8Bytes(s);
    var h = md51(bytes);
    var hex = '0123456789abcdef', r = '';
    for (var i = 0; i < 16; i++) {
        var v = h[i >> 2] >>> ((i % 4) * 8);
        r += hex.charAt((v >>> 4) & 0x0f) + hex.charAt(v & 0x0f);
    }
    return r;
}

// ========== Pure JS AES-128-CBC (CryptoJS compatible) ==========

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

var AES_SBOX_INV = [
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
        var temp = [w[i-4], w[i-3], w[i-2], w[i-1]];
        if (i % 16 === 0) {
            temp = [AES_SBOX[temp[1]] ^ AES_RCON[i/16-1], AES_SBOX[temp[2]], AES_SBOX[temp[3]], AES_SBOX[temp[0]]];
        }
        for (var j = 0; j < 4; j++) {
            w[i+j] = w[i-16+j] ^ temp[j];
        }
    }
    return w;
}

function aesSubBytes(state, inv) {
    var box = inv ? AES_SBOX_INV : AES_SBOX;
    for (var i = 0; i < 16; i++) state[i] = box[state[i]];
}

function aesShiftRows(state) {
    var t;
    t = state[1]; state[1] = state[5]; state[5] = state[9]; state[9] = state[13]; state[13] = t;
    t = state[2]; state[2] = state[10]; state[10] = t; t = state[6]; state[6] = state[14]; state[14] = t;
    t = state[15]; state[15] = state[11]; state[11] = state[7]; state[7] = state[3]; state[3] = t;
}

function aesShiftRowsInv(state) {
    var t;
    t = state[13]; state[13] = state[9]; state[9] = state[5]; state[5] = state[1]; state[1] = t;
    t = state[2]; state[2] = state[10]; state[10] = t; t = state[6]; state[6] = state[14]; state[14] = t;
    t = state[3]; state[3] = state[7]; state[7] = state[11]; state[11] = state[15]; state[15] = t;
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

function aesMixColumns(state) {
    for (var c = 0; c < 4; c++) {
        var i = c * 4;
        var a = [state[i], state[i+1], state[i+2], state[i+3]];
        state[i]   = aesGmul(a[0],2) ^ aesGmul(a[1],3) ^ a[2] ^ a[3];
        state[i+1] = a[0] ^ aesGmul(a[1],2) ^ aesGmul(a[2],3) ^ a[3];
        state[i+2] = a[0] ^ a[1] ^ aesGmul(a[2],2) ^ aesGmul(a[3],3);
        state[i+3] = aesGmul(a[0],3) ^ a[1] ^ a[2] ^ aesGmul(a[3],2);
    }
}

function aesMixColumnsInv(state) {
    for (var c = 0; c < 4; c++) {
        var i = c * 4;
        var a = [state[i], state[i+1], state[i+2], state[i+3]];
        state[i]   = aesGmul(a[0],14) ^ aesGmul(a[1],11) ^ aesGmul(a[2],13) ^ aesGmul(a[3],9);
        state[i+1] = aesGmul(a[0],9)  ^ aesGmul(a[1],14) ^ aesGmul(a[2],11) ^ aesGmul(a[3],13);
        state[i+2] = aesGmul(a[0],13) ^ aesGmul(a[1],9)  ^ aesGmul(a[2],14) ^ aesGmul(a[3],11);
        state[i+3] = aesGmul(a[0],11) ^ aesGmul(a[1],13) ^ aesGmul(a[2],9)  ^ aesGmul(a[3],14);
    }
}

function aesAddRoundKey(state, w, round) {
    for (var i = 0; i < 16; i++) state[i] ^= w[round * 16 + i];
}

function aesEncryptBlock(block, w) {
    var state = block.slice();
    aesAddRoundKey(state, w, 0);
    for (var round = 1; round < 10; round++) {
        aesSubBytes(state, false);
        aesShiftRows(state);
        aesMixColumns(state);
        aesAddRoundKey(state, w, round);
    }
    aesSubBytes(state, false);
    aesShiftRows(state);
    aesAddRoundKey(state, w, 10);
    return state;
}

function aesDecryptBlock(block, w) {
    var state = block.slice();
    aesAddRoundKey(state, w, 10);
    for (var round = 9; round > 0; round--) {
        aesShiftRowsInv(state);
        aesSubBytes(state, true);
        aesAddRoundKey(state, w, round);
        aesMixColumnsInv(state);
    }
    aesShiftRowsInv(state);
    aesSubBytes(state, true);
    aesAddRoundKey(state, w, 0);
    return state;
}

function pkcs7Pad(data) {
    var padLen = 16 - (data.length % 16);
    var padded = data.slice();
    for (var i = 0; i < padLen; i++) padded.push(padLen);
    return padded;
}

function pkcs7Unpad(data) {
    if (data.length === 0) return data;
    var padLen = data[data.length - 1];
    if (padLen < 1 || padLen > 16) return data;
    for (var i = data.length - padLen; i < data.length; i++) {
        if (data[i] !== padLen) return data;
    }
    return data.slice(0, data.length - padLen);
}

// AES CBC encrypt: plaintext(string) -> hex string
function aesEncrypt(plaintext, keyStr, ivStr) {
    try {
        var keyBytes = strToUtf8Bytes(keyStr);
        var ivBytes = strToUtf8Bytes(ivStr);
        var dataBytes = strToUtf8Bytes(plaintext);
        var padded = pkcs7Pad(dataBytes);
        var w = aesKeyExpansion(keyBytes);
        var prev = ivBytes;
        var result = [];
        for (var i = 0; i < padded.length; i += 16) {
            var block = padded.slice(i, i + 16);
            for (var j = 0; j < 16; j++) block[j] ^= prev[j];
            var encrypted = aesEncryptBlock(block, w);
            for (var j = 0; j < 16; j++) result.push(encrypted[j]);
            prev = encrypted;
        }
        var hex = '0123456789abcdef', hexStr = '';
        for (var i = 0; i < result.length; i++) {
            hexStr += hex.charAt((result[i] >> 4) & 0x0f) + hex.charAt(result[i] & 0x0f);
        }
        return hexStr;
    } catch (e) { return ''; }
}

// AES CBC decrypt: hex ciphertext -> plaintext(string)
function aesDecrypt(hexText, keyStr, ivStr) {
    try {
        var keyBytes = strToUtf8Bytes(keyStr);
        var ivBytes = strToUtf8Bytes(ivStr);
        var cipherBytes = [];
        for (var i = 0; i < hexText.length; i += 2) {
            cipherBytes.push(parseInt(hexText.substr(i, 2), 16));
        }
        var w = aesKeyExpansion(keyBytes);
        var prev = ivBytes;
        var result = [];
        for (var i = 0; i < cipherBytes.length; i += 16) {
            var block = cipherBytes.slice(i, i + 16);
            var decrypted = aesDecryptBlock(block, w);
            for (var j = 0; j < 16; j++) result.push(decrypted[j] ^ prev[j]);
            prev = block;
        }
        result = pkcs7Unpad(result);
        // UTF-8 bytes to string
        var str = '';
        for (var i = 0; i < result.length; i++) {
            if (result[i] < 0x80) { str += String.fromCharCode(result[i]); }
            else if (result[i] < 0xe0) {
                str += String.fromCharCode(((result[i] & 0x1f) << 6) | (result[i+1] & 0x3f)); i++;
            } else if (result[i] < 0xf0) {
                str += String.fromCharCode(((result[i] & 0x0f) << 12) | ((result[i+1] & 0x3f) << 6) | (result[i+2] & 0x3f)); i += 2;
            } else {
                var cp = ((result[i] & 0x07) << 18) | ((result[i+1] & 0x3f) << 12) | ((result[i+2] & 0x3f) << 6) | (result[i+3] & 0x3f); i += 3;
                str += String.fromCharCode(0xd800 + ((cp - 0x10000) >> 10), 0xdc00 + ((cp - 0x10000) & 0x3ff));
            }
        }
        return str;
    } catch (e) { return ''; }
}

// ========== Pure JS RSA decrypt (PKCS1, for decrypting AES key from API) ==========

function base64Decode(str) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var result = [];
    var i = 0;
    str = str.replace(/[^A-Za-z0-9\+\/=]/g, '');
    while (i < str.length) {
        var c1 = chars.indexOf(str[i++]);
        var c2 = chars.indexOf(str[i++]);
        var c3 = chars.indexOf(str[i++]);
        var c4 = chars.indexOf(str[i++]);
        var b1 = (c1 << 2) | (c2 >> 4);
        var b2 = ((c2 & 15) << 4) | (c3 >> 2);
        var b3 = ((c3 & 3) << 6) | c4;
        result.push(b1);
        if (c3 !== 64) result.push(b2);
        if (c4 !== 64) result.push(b3);
    }
    return result;
}

function bytesToBigInt(bytes) {
    var hex = '';
    for (var i = 0; i < bytes.length; i++) {
        var h = bytes[i].toString(16);
        hex += (h.length < 2 ? '0' : '') + h;
    }
    return hex ? bigIntFromHex(hex) : bigIntFromHex('0');
}

function bigIntFromHex(hex) {
    // Simple hex to array of 32-bit words
    var result = [];
    for (var i = hex.length; i > 0; i -= 8) {
        var start = Math.max(0, i - 8);
        result.push(parseInt(hex.substring(start, i), 16) || 0);
    }
    return result;
}

function bigIntToHex(a) {
    var hex = '';
    for (var i = a.length - 1; i >= 0; i--) {
        var h = a[i].toString(16);
        hex += (i < a.length - 1 ? '00000000'.substring(h.length) : '') + h;
    }
    // Remove leading zeros
    hex = hex.replace(/^0+/, '') || '0';
    return hex;
}

function bigIntModPow(base, exp, mod) {
    // Modular exponentiation using square-and-multiply
    // All numbers represented as arrays of 32-bit words (little-endian)
    var result = [1];
    base = bigIntMod(base, mod);
    while (!bigIntIsZero(exp)) {
        if (bigIntIsOdd(exp)) {
            result = bigIntMod(bigIntMul(result, base), mod);
        }
        exp = bigIntShiftRight(exp);
        base = bigIntMod(bigIntMul(base, base), mod);
    }
    return result;
}

function bigIntMul(a, b) {
    var result = new Array(a.length + b.length);
    for (var i = 0; i < result.length; i++) result[i] = 0;
    for (var i = 0; i < a.length; i++) {
        var carry = 0;
        for (var j = 0; j < b.length; j++) {
            var tmp = a[i] * b[j] + result[i + j] + carry;
            result[i + j] = tmp & 0xffffffff;
            carry = (tmp / 0x100000000) | 0;
        }
        if (carry) result[i + b.length] += carry;
    }
    // Trim
    while (result.length > 1 && result[result.length - 1] === 0) result.pop();
    return result;
}

function bigIntMod(a, m) {
    // a mod m using long division
    if (bigIntCompare(a, m) < 0) return a.slice();
    var result = a.slice();
    for (var i = a.length * 32 - 1; i >= 0; i--) {
        bigIntShiftLeftOne(result);
        if (bigIntCompare(result, m) >= 0) {
            bigIntSub(result, m);
        }
    }
    while (result.length > 1 && result[result.length - 1] === 0) result.pop();
    return result;
}

function bigIntCompare(a, b) {
    var la = a.length, lb = b.length;
    while (la > 1 && a[la - 1] === 0) la--;
    while (lb > 1 && b[lb - 1] === 0) lb--;
    if (la !== lb) return la > lb ? 1 : -1;
    for (var i = la - 1; i >= 0; i--) {
        if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
    }
    return 0;
}

function bigIntSub(a, b) {
    var borrow = 0;
    for (var i = 0; i < a.length; i++) {
        var diff = a[i] - (i < b.length ? b[i] : 0) - borrow;
        if (diff < 0) { diff += 0x100000000; borrow = 1; } else { borrow = 0; }
        a[i] = diff;
    }
}

function bigIntShiftLeftOne(a) {
    var carry = 0;
    for (var i = 0; i < a.length; i++) {
        var tmp = (a[i] << 1) | carry;
        a[i] = tmp & 0xffffffff;
        carry = tmp >>> 31;
    }
    if (carry) a.push(carry);
}

function bigIntShiftRight(a) {
    var result = [];
    var carry = 0;
    for (var i = a.length - 1; i >= 0; i--) {
        result[i] = (a[i] >> 1) | (carry << 31);
        carry = a[i] & 1;
    }
    while (result.length > 1 && result[result.length - 1] === 0) result.pop();
    return result;
}

function bigIntIsZero(a) {
    for (var i = 0; i < a.length; i++) { if (a[i] !== 0) return false; }
    return true;
}

function bigIntIsOdd(a) {
    return (a[0] & 1) === 1;
}

function bigIntToBytes(a) {
    var hex = bigIntToHex(a);
    if (hex.length % 2 !== 0) hex = '0' + hex;
    var bytes = [];
    for (var i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

function bytesToHex(bytes) {
    var hex = '';
    for (var i = 0; i < bytes.length; i++) {
        var h = bytes[i].toString(16);
        hex += (h.length < 2 ? '0' : '') + h;
    }
    return hex;
}

// Parse PKCS#8 DER private key to extract modulus(n) and private exponent(d)
function parsePrivateKeyDer(derBytes) {
    // PKCS#8 structure: SEQUENCE { version, AlgorithmIdentifier, OCTET STRING { SEQUENCE { version, n, e, d, p, q, dp, dq, qi } } }
    // We need n and d for RSA decryption
    // Skip outer SEQUENCE tag+length, then version, algorithm, then inner OCTET STRING
    var pos = 0;

    function readTag() { return derBytes[pos++]; }
    function readLength() {
        var len = derBytes[pos++];
        if (len & 0x80) {
            var numBytes = len & 0x7f;
            len = 0;
            for (var i = 0; i < numBytes; i++) len = (len << 8) | derBytes[pos++];
        }
        return len;
    }
    function readInteger() {
        readTag(); // INTEGER tag
        var len = readLength();
        var bytes = derBytes.slice(pos, pos + len);
        pos += len;
        return bytes;
    }

    // Outer SEQUENCE
    readTag(); readLength();
    // Version
    readInteger();
    // AlgorithmIdentifier SEQUENCE
    readTag(); var algLen = readLength(); pos += algLen;
    // Private key OCTET STRING
    readTag(); readLength();
    // Inner SEQUENCE
    readTag(); readLength();
    // Version
    readInteger();
    // n (modulus)
    var nBytes = readInteger();
    // e (public exponent)
    var eBytes = readInteger();
    // d (private exponent)
    var dBytes = readInteger();

    return { n: nBytes, d: dBytes };
}

function rsaDecrypt(base64Data, privateKeyPem) {
    try {
        // Extract DER from PEM
        var pemBody = privateKeyPem
            .replace('-----BEGIN PRIVATE KEY-----', '')
            .replace('-----END PRIVATE KEY-----', '')
            .replace(/\s/g, '');
        var derBytes = base64Decode(pemBody);

        var key = parsePrivateKeyDer(derBytes);
        var n = bytesToBigInt(key.n);
        var d = bytesToBigInt(key.d);

        // Decrypt: data = base64Decode(base64Data), result = data^d mod n
        var cipherBytes = base64Decode(base64Data);
        var cipher = bytesToBigInt(cipherBytes);
        var decrypted = bigIntModPow(cipher, d, n);
        var decryptedBytes = bigIntToBytes(decrypted);
        // 补齐前导零到 128 字节（1024-bit RSA 密钥）
        while (decryptedBytes.length < 128) { decryptedBytes.unshift(0); }

        // Remove PKCS1 padding: 0x00, 0x02, padding..., 0x00, data
        if (decryptedBytes.length < 2 || decryptedBytes[0] !== 0x00 || decryptedBytes[1] !== 0x02) {
            return '';
        }
        var sepIdx = -1;
        for (var i = 2; i < decryptedBytes.length; i++) {
            if (decryptedBytes[i] === 0x00) { sepIdx = i; break; }
        }
        if (sepIdx < 0) return '';
        var dataBytes = decryptedBytes.slice(sepIdx + 1);

        // Convert to string
        var str = '';
        for (var i = 0; i < dataBytes.length; i++) {
            if (dataBytes[i] < 0x80) { str += String.fromCharCode(dataBytes[i]); }
            else if (dataBytes[i] < 0xe0) {
                str += String.fromCharCode(((dataBytes[i] & 0x1f) << 6) | (dataBytes[i+1] & 0x3f)); i++;
            } else if (dataBytes[i] < 0xf0) {
                str += String.fromCharCode(((dataBytes[i] & 0x0f) << 12) | ((dataBytes[i+1] & 0x3f) << 6) | (dataBytes[i+2] & 0x3f)); i += 2;
            } else {
                var cp = ((dataBytes[i] & 0x07) << 18) | ((dataBytes[i+1] & 0x3f) << 12) | ((dataBytes[i+2] & 0x3f) << 6) | (dataBytes[i+3] & 0x3f); i += 3;
                str += String.fromCharCode(0xd800 + ((cp - 0x10000) >> 10), 0xdc00 + ((cp - 0x10000) & 0x3ff));
            }
        }
        return str;
    } catch (e) { return ''; }
}

// ========== API helpers ==========

function stripHtml(value) {
    return String(value == null ? '' : value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildRequestBody(data) {
    var requestKey = aesEncrypt(JSON.stringify(data), AES_REQ_KEY, AES_REQ_IV);
    if (!requestKey) return null;

    var t = Math.floor(Date.now() / 1000).toString();
    var signStr = 'token_id=,token=' + TOKEN + ',phone_type=1,request_key=' + requestKey + ',app_id=1,time=' + t + ',keys=' + KEYS_STR + '*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
    var signature = md5(signStr);

    var body = {};
    body['token'] = TOKEN;
    body['token_id'] = '';
    body['phone_type'] = '1';
    body['time'] = t;
    body['phone_model'] = 'xiaomi-22021211rc';
    body['keys'] = KEYS_STR;
    body['request_key'] = requestKey;
    body['signature'] = signature;
    body['app_id'] = '1';
    body['ad_version'] = '1';

    return body;
}

async function getData(data, path) {
    try {
        var body = buildRequestBody(data);
        if (!body) return null;

        var url = HOST + path;
        var headers = {};
        for (var k in DefHeader) { if (DefHeader.hasOwnProperty(k)) headers[k] = DefHeader[k]; }
        headers['Referer'] = HOST;

        // OK影视/FongMi 使用 request() 而非 req()
        var httpFunc = typeof request === 'function' ? request : (typeof req === 'function' ? req : null);
        if (!httpFunc) { console.log('[瓜子] ERR: request/req 都不存在'); return null; }
        console.log('[瓜子] httpFunc=' + (httpFunc === request ? 'request' : 'req'));

        var res = await httpFunc(url, {
            method: 'post',
            headers: headers,
            data: body,
            postType: 'form',
            timeout: 15000
        });

        // 兼容不同返回格式
        var content = '';
        if (res) {
            if (typeof res === 'string') {
                content = res;
            } else if (res.content) {
                content = res.content;
            } else if (res.body) {
                content = res.body;
            } else if (res.text && typeof res.text === 'function') {
                content = res.text();
            }
        }
        console.log('[瓜子] res类型=' + typeof res + ' content长度=' + content.length);
        if (!content) { console.log('[瓜子] ERR: 响应为空, res=' + JSON.stringify(res).substring(0,200)); return null; }
        console.log('[瓜子] 响应前100字: ' + content.substring(0, 100));

        var responseData;
        try { responseData = JSON.parse(content); } catch(e) { console.log('[瓜子] ERR: JSON解析失败'); return null; }
        if (!responseData || !responseData.data) { console.log('[瓜子] ERR: 无data字段, code=' + (responseData&&responseData.code) + ' msg=' + (responseData&&responseData.msg)); return null; }

        var dataResp = responseData.data;
        if (!dataResp.keys || !dataResp.response_key) return null;

        // RSA decrypt the AES key
        var privateKeyPem = '-----BEGIN PRIVATE KEY-----\n' +
            'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1\n' +
            'ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU\n' +
            '1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcK\n' +
            'ZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7\n' +
            'HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcW\n' +
            'V9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdI\n' +
            'DblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34\n' +
            'saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVM\n' +
            'iMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUM\n' +
            'WBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8\n' +
            'jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZ\n' +
            'K7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1b\n' +
            'L3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oa\n' +
            't5lYKfpe8k83ZA==\n' +
            '-----END PRIVATE KEY-----';

        var bodykiJson = rsaDecrypt(dataResp.keys, privateKeyPem);
        if (!bodykiJson) return null;

        var bodyki;
        try { bodyki = JSON.parse(bodykiJson); } catch(e) { return null; }

        // AES decrypt the response data
        var decryptedData = aesDecrypt(dataResp.response_key, bodyki.key, bodyki.iv);
        if (!decryptedData) return null;

        var result;
        try { result = JSON.parse(decryptedData); } catch(e) { return null; }
        return result;

    } catch (e) { console.log('[瓜子] getData异常: ' + (e.message || e)); return null; }
}

// ========== Core functions (drpy interface) ==========

async function init(cfg) {
    try {
        HOST = (cfg.ext && cfg.ext.host) || 'https://api.w32z7vtd.com';
        HOST = HOST.replace(/\/+$/, '');
        DefHeader['Referer'] = HOST;
        KParams.headers = {};
        for (var k in DefHeader) { if (DefHeader.hasOwnProperty(k)) KParams.headers[k] = DefHeader[k]; }
    } catch(e) {}
}

async function home(filter) {
    try {
        var result = {};
        var classes = [
            {"type_name": "电影", "type_id": "1"},
            {"type_name": "电视剧", "type_id": "2"},
            {"type_name": "动漫", "type_id": "4"},
            {"type_name": "综艺", "type_id": "3"},
            {"type_name": "短剧", "type_id": "64"}
        ];
        result.class = classes;

        var filters = {};
        for (var ci = 0; ci < classes.length; ci++) {
            var tid = classes[ci].type_id;
            filters[tid] = [
                {"key": "area", "name": "地区", "value": [
                    {"n": "全部", "v": "0"},{"n": "大陆", "v": "大陆"},{"n": "香港", "v": "香港"},
                    {"n": "台湾", "v": "台湾"},{"n": "美国", "v": "美国"},{"n": "韩国", "v": "韩国"},
                    {"n": "日本", "v": "日本"},{"n": "英国", "v": "英国"},{"n": "法国", "v": "法国"},
                    {"n": "泰国", "v": "泰国"},{"n": "印度", "v": "印度"},{"n": "其他", "v": "其他"}
                ]},
                {"key": "year", "name": "年份", "value": [
                    {"n": "全部", "v": "0"},{"n": "2025", "v": "2025"},{"n": "2024", "v": "2024"},
                    {"n": "2023", "v": "2023"},{"n": "2022", "v": "2022"},{"n": "2021", "v": "2021"},
                    {"n": "2020", "v": "2020"},{"n": "2019", "v": "2019"},{"n": "2018", "v": "2018"},
                    {"n": "2017", "v": "2017"},{"n": "2016", "v": "2016"},{"n": "2015", "v": "2015"},
                    {"n": "2014", "v": "2014"},{"n": "2013", "v": "2013"},{"n": "2012", "v": "2012"},
                    {"n": "2011", "v": "2011"},{"n": "2010", "v": "2010"},{"n": "2009", "v": "2009"},
                    {"n": "2008", "v": "2008"},{"n": "2007", "v": "2007"},{"n": "2006", "v": "2006"},
                    {"n": "2005", "v": "2005"},{"n": "更早", "v": "2004"}
                ]},
                {"key": "sort", "name": "排序", "value": [
                    {"n": "最新", "v": "d_id"},{"n": "最热", "v": "d_hits"},{"n": "推荐", "v": "d_score"}
                ]}
            ];
        }
        result.filters = filters;
        result.list = [];
        return JSON.stringify(result);
    } catch (e) {
        return JSON.stringify({class: [], filters: {}, list: []});
    }
}

async function homeVod() {
    return JSON.stringify({list: []});
}

async function category(tid, pg, filter, extend) {
    try {
        pg = parseInt(pg, 10) || 1;
        var body = {
            area: (extend && extend.area) || '0',
            year: (extend && extend.year) || '0',
            pageSize: '30',
            sort: (extend && extend.sort) || 'd_id',
            page: pg.toString(),
            tid: tid
        };

        var data = await getData(body, '/App/IndexList/indexList');
        var videos = [];

        if (data && data.list) {
            for (var i = 0; i < data.list.length; i++) {
                var item = data.list[i];
                var vodContinu = item.vod_continu || 0;
                var remarks = vodContinu === 0 ? '电影' : ('更新至' + vodContinu + '集');
                videos.push({
                    vod_id: (item.vod_id || '') + '/' + vodContinu,
                    vod_name: item.vod_name || '',
                    vod_pic: item.vod_pic || '',
                    vod_remarks: remarks
                });
            }
        }

        return JSON.stringify({
            list: videos,
            page: pg,
            pagecount: 9999,
            limit: 30,
            total: 999999
        });
    } catch (e) {
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: 30, total: 0});
    }
}

async function search(wd, quick, pg) {
    try {
        pg = parseInt(pg, 10) || 1;
        var body = {
            keywords: wd,
            order_val: '1',
            page: pg.toString()
        };

        var data = await getData(body, '/App/Index/findMoreVod');
        var videos = [];

        if (data && data.list) {
            for (var i = 0; i < data.list.length; i++) {
                var item = data.list[i];
                var vodContinu = item.vod_continu || 0;
                var remarks = vodContinu === 0 ? '电影' : ('更新至' + vodContinu + '集');
                videos.push({
                    vod_id: (item.vod_id || '') + '/' + vodContinu,
                    vod_name: item.vod_name || '',
                    vod_pic: item.vod_pic || '',
                    vod_remarks: remarks
                });
            }
        }

        return JSON.stringify({
            list: videos,
            page: pg,
            pagecount: 9999,
            limit: 30,
            total: 999999
        });
    } catch (e) {
        return JSON.stringify({list: [], page: 1, pagecount: 0, limit: 0, total: 0});
    }
}

async function detail(id) {
    try {
        var vodId = id.split('/')[0];

        // Get video detail
        var t = Math.floor(Date.now() / 1000).toString();
        var body1 = {
            token_id: '1649412',
            vod_id: vodId,
            mobile_time: t,
            token: TOKEN
        };
        var qdata = await getData(body1, '/App/IndexPlay/playInfo');

        // Get play list
        var body2 = {
            vurl_cloud_id: '2',
            vod_d_id: vodId
        };
        var jdata = await getData(body2, '/App/Resource/Vurl/show');

        if (!qdata || !qdata.vodInfo) {
            return JSON.stringify({list: []});
        }

        var vod = qdata.vodInfo;

        var videoDetail = {
            vod_id: vodId,
            vod_name: vod.vod_name || '',
            vod_pic: vod.vod_pic || '',
            vod_year: vod.vod_year || '',
            vod_area: vod.vod_area || '',
            vod_actor: vod.vod_actor || '',
            vod_director: vod.vod_director || '',
            vod_content: stripHtml(vod.vod_use_content || ''),
            vod_play_from: '嗷呜要吃瓜'
        };

        // Build play list
        var playList = [];
        if (jdata && jdata.list) {
            for (var index = 0; index < jdata.list.length; index++) {
                var item = jdata.list[index];
                if (item.play) {
                    var n = [];
                    var p = [];

                    for (var key in item.play) {
                        if (item.play.hasOwnProperty(key)) {
                            var value = item.play[key];
                            if (value && value.param) {
                                n.push(key);
                                p.push(value.param);
                            }
                        }
                    }

                    if (p.length > 0) {
                        var playName = (index + 1).toString();
                        if (jdata.list.length === 1) {
                            playName = vod.vod_name || '';
                        }
                        var playUrl = p[p.length - 1] + '||' + n.join('@');
                        playList.push(playName + '$' + playUrl);
                    }
                }
            }
        }

        videoDetail.vod_play_url = playList.join('#');

        return JSON.stringify({list: [videoDetail]});
    } catch (e) {
        return JSON.stringify({list: []});
    }
}

async function play(flag, id, flags) {
    try {
        var parts = id.split('||');
        if (parts.length < 2) {
            return JSON.stringify({parse: 0, playUrl: '', url: ''});
        }

        var paramStr = parts[0];
        var resolutions = parts.length > 1 ? parts[1].split('@') : [];

        // Parse parameters
        var params = {};
        var pairs = paramStr.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var idx = pairs[i].indexOf('=');
            if (idx > 0) {
                params[pairs[i].substring(0, idx)] = pairs[i].substring(idx + 1);
            }
        }

        if (resolutions.length > 0) {
            // Sort resolutions descending
            resolutions.sort(function(a, b) {
                return (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0);
            });
            params.resolution = resolutions[0];

            var data = await getData(params, '/App/Resource/VurlDetail/showOne');
            if (data && data.url) {
                return JSON.stringify({
                    parse: 0,
                    playUrl: '',
                    url: data.url,
                    header: JSON.stringify(DefHeader)
                });
            }
        }

        return JSON.stringify({parse: 0, playUrl: '', url: ''});
    } catch (e) {
        return JSON.stringify({parse: 0, playUrl: '', url: ''});
    }
}

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        search: search,
        detail: detail,
        play: play,
        proxy: null
    };
}
