// 瓜子影视 v2 - drpy2 rule 格式，兼容影视TV 5.1.6
// 修复：body 传对象而非字符串，request() 正确调用

var rule = {
    title: '瓜子',
    host: '',
    url: '/App/IndexList/indexList',
    searchUrl: '/App/Index/findMoreVod#**',
    searchable: 2,
    quickSearch: 1,
    filterable: 1,
    class_name: '电视剧&电影&动漫&综艺&短剧',
    class_url: '2&1&4&3&64',
    play_parse: true,
    lazy: $js.toString(function() {
        var h_ost = 'https://api.w32z7vtd.com';
        var vod_id = input.split("/")[0];
        var vurl_id = input.split("/")[1].split("?")[0];
        var resolution = input.split("?")[1] || '1080';

        var t = Math.floor(Date.now() / 1000).toString();
        var request_key = Encrypt(JSON.stringify({"domain_type":"8","vod_id":vod_id,"type":"play","resolution":resolution,"vurl_id":vurl_id}));
        var signature = 'token_id=,token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79,phone_type=1,request_key=' + request_key + ',app_id=1,time=' + t + ',keys=ZH8gpdp9bxjuG2NK97sol3o7Uiz+9eVEaVMlE2Fk3j7EResM3YHnECZUH7BONNTjpy7RVNi/YimGuNYriC7Cmswv4PNYiFYzw9QhlqZKwNfCM6IUpFZ0T4rZx8G78zkv2tNVbfYC4qNQedGi07nWZ33dlSuVxROVfY5JxOWHMI0=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
        var body = {
            token: '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79',
            token_id: '',
            phone_type: '1',
            time: t,
            phone_model: 'xiaomi-22021211rc',
            keys: 'ZH8gpdp9bxjuG2NK97sol3o7Uiz+9eVEaVMlE2Fk3j7EResM3YHnECZUH7BONNTjpy7RVNi/YimGuNYriC7Cmswv4PNYiFYzw9QhlqZKwNfCM6IUpFZ0T4rZx8G78zkv2tNVbfYC4qNQedGi07nWZ33dlSuVxROVfY5JxOWHMI0=',
            request_key: request_key,
            signature: md5(signature),
            app_id: '1',
            ad_version: '1'
        };
        var html = request(h_ost + '/App/Resource/VurlDetail/showOne', {
            headers: {'Cache-Control':'no-cache','Version':'2406025','PackageName':'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f','Ver':'1.9.2','Referer':h_ost,'User-Agent':'okhttp/3.12.0'},
            body: body,
            method: 'POST'
        });
        var data = JSON.parse(html).data;
        var bodykey = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA==";
        var bodykeyiv = JSON.parse(RSA.decode(data.keys, bodykey));
        var key = CryptoJS.enc.Utf8.parse(bodykeyiv.key);
        var iv = CryptoJS.enc.Utf8.parse(bodykeyiv.iv);
        var url = JSON.parse(Decrypt(data.response_key, key, iv)).url;
        input = {url: url, parse: 0, header: rule.headers};
        setResult(input);
    }),
    一级: $js.toString(function() {
        var d = [];
        var h_ost = 'https://api.w32z7vtd.com';
        try {
            var tid = MY_CATE;
            var subs = ["5","12","30","22",""];
            var tids = ["1","2","4","3","64"];
            var idx = tids.indexOf(tid);
            var sub = idx !== -1 ? subs[idx] : "";

            var t = Math.floor(Date.now() / 1000).toString();
            var request_key = Encrypt(JSON.stringify({"area":(MY_FL.area||"0").toString(),"sub":(MY_FL.sub||sub).toString(),"year":(MY_FL.year||"0").toString(),"pageSize":"30","sort":(MY_FL.sort||"d_id").toString(),"page":MY_PAGE,"tid":tid}));
            var signature = 'token_id=,token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79,phone_type=1,request_key='+request_key+',app_id=1,time='+t+',keys=qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
            var body = {
                token: '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79',
                token_id: '',
                phone_type: '1',
                time: t,
                phone_model: 'xiaomi-22021211rc',
                keys: 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
                request_key: request_key,
                signature: md5(signature).toUpperCase(),
                app_id: '1',
                ad_version: '1'
            };
            var html = request(h_ost+"/App/IndexList/indexList", {
                headers: {'Cache-Control':'no-cache','Version':'2406025','PackageName':'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f','Ver':'1.9.2','Referer':h_ost,'User-Agent':'okhttp/3.12.0'},
                body: body,
                method: 'POST'
            });
            var resp = JSON.parse(html);
            if (resp.code && resp.code !== 200) { throw new Error('API code=' + resp.code + ' msg=' + resp.msg); }
            var banner = resp.data;
            var bodykeyiv = JSON.parse(RSA.decode(banner.keys, "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA=="));
            var key = CryptoJS.enc.Utf8.parse(bodykeyiv.key);
            var iv = CryptoJS.enc.Utf8.parse(bodykeyiv.iv);
            var result = Decrypt(banner.response_key, key, iv);
            var list = JSON.parse(result).list;
            list.forEach(function(data) {
                d.push({title: data.vod_name, desc: data.vod_continu==0?'电影':'更新至'+data.vod_continu+'集', year: data.vod_score, img: data.vod_pic, url: data.vod_id+'/'+data.vod_continu});
            });
        } catch(e) {
            log('【瓜子v2】一级异常: ' + e);
        }
        setResult(d);
    }),
    二级: $js.toString(function() {
        var h_ost = 'https://api.w32z7vtd.com';
        try {
            input = input.replace(h_ost, '');
            var vod_id = input.split("/")[0];
            var t = Math.floor(Date.now() / 1000).toString();
            var request_key = Encrypt(JSON.stringify({"token_id":"393668","vod_id":vod_id,"mobile_time":t,"token":"1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79"}));
            var signature = 'token_id=,token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79,phone_type=1,request_key='+request_key+',app_id=1,time='+t+',keys=Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
            var body1 = {
                token: '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79',
                token_id: '', phone_type: '1', time: t, phone_model: 'xiaomi-22021211rc',
                keys: 'Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=',
                request_key: request_key, signature: md5(signature), app_id: '1', ad_version: '1'
            };
            var html = request(h_ost+"/App/IndexPlay/playInfo", {
                headers: {'Cache-Control':'no-cache','Version':'2406025','PackageName':'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f','Ver':'1.9.2','Referer':h_ost,'User-Agent':'okhttp/3.12.0'},
                body: body1, method: 'POST'
            });
            var resp = JSON.parse(html);
            if (resp.code && resp.code !== 200) throw new Error('playInfo: ' + resp.code);
            var data2 = resp.vodInfo;

            var playKey = Encrypt(JSON.stringify({"vurl_cloud_id":"2","vod_d_id":vod_id}));
            var playSigPrefix = 'token_id=,token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79,phone_type=1,request_key='+playKey+',app_id=1,time='+t+',keys=Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
            var body2 = {
                token: '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79',
                token_id: '', phone_type: '1', time: t, phone_model: 'xiaomi-22021211rc',
                keys: 'Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=',
                request_key: playKey, signature: md5(playSigPrefix), app_id: '1', ad_version: '1'
            };
            var html2 = request(h_ost+"/App/Resource/Vurl/show", {
                headers: {'Cache-Control':'no-cache','Version':'2406025','PackageName':'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f','Ver':'1.9.2','Referer':h_ost,'User-Agent':'okhttp/3.12.0'},
                body: body2, method: 'POST'
            });
            var list = JSON.parse(html2).list;
            var nnnmm = [];
            list.forEach(function(item) {
                var playParams = Object.values(item.play);
                var lastParam = null;
                for (var i = playParams.length - 1; i >= 0; i--) {
                    if (playParams[i].param) { lastParam = playParams[i].param; break; }
                }
                if (lastParam) {
                    var vurlIdMatch = lastParam.match(/vurl_id=(\d+)/);
                    var resolution = lastParam.match(/resolution=(\d+)/);
                    if (vurlIdMatch) {
                        nnnmm.push(item.title+'$'+vod_id+'/'+vurlIdMatch[1]+'?' + (resolution?resolution[1]:'1080'));
                    }
                }
            });
            VOD = {
                title: data2.vod_name, type: (data2.videoTag||[]).toString(),
                desc: data2.vod_use_content, vod_actor: data2.vod_actor,
                vod_area: data2.vod_area, vod_director: data2.vod_director,
                img: data2.vod_pic, vod_play_from: '瓜子HD', vod_play_url: nnnmm.join('#')
            };
        } catch(e) {
            log('【瓜子v2】二级异常: ' + e);
        }
    }),
    搜索: $js.toString(function() {
        var d = [];
        var h_ost = 'https://api.w32z7vtd.com';
        try {
            var t = Math.floor(Date.now() / 1000).toString();
            var url = input.split("#")[0];
            var keyword = input.split("#")[1];
            var request_key = Encrypt(JSON.stringify({"keywords":keyword,"order_val":"1"}));
            var signature = 'token_id=,token=1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79,phone_type=1,request_key='+request_key+',app_id=1,time='+t+',keys=qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br';
            var body = {
                token: '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79',
                token_id: '', phone_type: '1', time: t, phone_model: 'xiaomi-22021211rc',
                keys: 'qDpotE2bedimK3QGqlyV5ieXXC3EhaPLQ+IOJyHnHflCj5w/7ESK7FgywMvrgjxbx0GklEFLI4+JshgySe633OIRstuktwdiCy3CT+fLSpuxBJDIlfXQDaeH3ig1wiB0JsZ601XHiFweGMu4tZfnSpHg3OnoL6nz/uurUif2OK4=',
                request_key: request_key, signature: md5(signature), app_id: '1', ad_version: '1'
            };
            var html = request(url, {
                headers: {'Cache-Control':'no-cache','Version':'2406025','PackageName':'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f','Ver':'1.9.2','Referer':h_ost,'User-Agent':'okhttp/3.12.0'},
                body: body, method: 'POST'
            });
            JSON.parse(html).list.forEach(function(data) {
                d.push({title: data.vod_name, desc: data.vod_continu==0?'电影':'更新至'+data.vod_continu+'集', content: data.vod_addtime, img: data.vod_pic, url: data.vod_id+'/'+data.vod_continu});
            });
        } catch(e) {
            log('【瓜子v2】搜索异常: ' + e);
        }
        setResult(d);
    })
}
