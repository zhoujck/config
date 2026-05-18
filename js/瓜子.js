// 诊断版 - 直接返回诊断结果到分类列表
var HOST = 'https://api.w32z7vtd.com';
var TOKEN_STR = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';

export function __jsEvalReturn() {
    return {
        init: async function(cfg) {},
        home: async function(filter) {
            var diag = [];
            // 检测1: CryptoJS
            try {
                var t = typeof CryptoJS;
                diag.push({vod_id:'x', vod_name:'CryptoJS: ' + t, vod_pic:'', vod_remarks: t === 'undefined' ? '❌ 未定义' : '✅'});
            } catch(e) { diag.push({vod_id:'x', vod_name:'CryptoJS异常: ' + e.message, vod_pic:'', vod_remarks:'❌'}); }
            // 检测2: RSA / JSEncrypt
            try {
                var t2 = typeof JSEncrypt;
                diag.push({vod_id:'x', vod_name:'JSEncrypt: ' + t2, vod_pic:'', vod_remarks: t2 === 'undefined' ? '❌ 未定义' : '✅'});
            } catch(e) { diag.push({vod_id:'x', vod_name:'JSEncrypt异常: ' + e.message, vod_pic:'', vod_remarks:'❌'}); }
            // 检测3: RSA对象
            try {
                var t3 = typeof RSA;
                diag.push({vod_id:'x', vod_name:'RSA: ' + t3, vod_pic:'', vod_remarks: t3 === 'undefined' ? '❌ 未定义' : '✅'});
            } catch(e) { diag.push({vod_id:'x', vod_name:'RSA异常: ' + e.message, vod_pic:'', vod_remarks:'❌'}); }
            // 检测4: request函数
            try {
                var t4 = typeof request;
                diag.push({vod_id:'x', vod_name:'request: ' + t4, vod_pic:'', vod_remarks: t4 === 'function' ? '✅' : '❌'});
            } catch(e) { diag.push({vod_id:'x', vod_name:'request异常: ' + e.message, vod_pic:'', vod_remarks:'❌'}); }
            // 检测5: req函数
            try {
                var t5 = typeof req;
                diag.push({vod_id:'x', vod_name:'req: ' + t5, vod_pic:'', vod_remarks: t5 === 'function' ? '✅' : '❌'});
            } catch(e) { diag.push({vod_id:'x', vod_name:'req异常: ' + e.message, vod_pic:'', vod_remarks:'❌'}); }
            // 检测6: md5函数
            try {
                var t6 = typeof md5;
                diag.push({vod_id:'x', vod_name:'md5: ' + t6, vod_pic:'', vod_remarks: t6 === 'function' ? '✅' : '❌'});
            } catch(e) { diag.push({vod_id:'x', vod_name:'md5异常: ' + e.message, vod_pic:'', vod_remarks:'❌'}); }
            // 检测7: 尝试一次简单request
            try {
                var resp = await request('https://api.w32z7vtd.com', {method:'get'});
                var t7 = typeof resp;
                diag.push({vod_id:'x', vod_name:'request()返回类型: ' + t7, vod_pic:'', vod_remarks: t7 === 'string' ? '✅字符串' : '⚠️' + t7});
                if (t7 === 'string') {
                    diag.push({vod_id:'x', vod_name:'响应前50字符', vod_pic:'', vod_remarks: resp.substring(0, 50)});
                } else if (t7 === 'object' && resp) {
                    diag.push({vod_id:'x', vod_name:'对象keys', vod_pic:'', vod_remarks: Object.keys(resp).join(',')});
                    if (resp.content) {
                        diag.push({vod_id:'x', vod_name:'resp.content前50', vod_pic:'', vod_remarks: String(resp.content).substring(0, 50)});
                    }
                }
            } catch(e) { diag.push({vod_id:'x', vod_name:'request调用异常: ' + e.message, vod_pic:'', vod_remarks:'❌'}); }
            return JSON.stringify({class: diag});
        },
        homeVod: async function() { return JSON.stringify({list: []}); },
        category: async function(tid, pg, filter, extend) { return JSON.stringify({list: []}); },
        detail: async function(id) { return JSON.stringify({list: []}); },
        play: async function(flag, id, flags) { return JSON.stringify({parse:0,url:''}); },
        search: async function(wd, quick, pg) { return JSON.stringify({list: []}); },
        proxy: null
    };
}
