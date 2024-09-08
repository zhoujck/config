var rule = {
    title:'哔哩影视',
    host:'https://api.bilibili.com',
    url:'/fyclass-fypage&vmid=$vmid',
    detailUrl:'/pgc/view/web/season?season_id=fyid',
    filter_url:'fl={{fl}}',
    vmid获取教程:'登录后访问https://api.bilibili.com/x/web-interface/nav,搜索mid就是,cookie需要 bili_jct,DedeUserID,SESSDATA参数',
    searchUrl:'/x/web-interface/search/type?keyword=**&search_type=',
    searchable:1,
    filterable:1,
    quickSearch:0,
    headers:{
        'User-Agent':'PC_UA',
        "Referer": "https://www.bilibili.com",
        "Cookie":" bili_jct=e7ec17ce70782e0b9898415a78851869;DedeUserID=701168335;SESSDATA=361cd22f%2C1740302175%2C46949%2A82CjClaU9v-4IIGE5s2oSQ6jdTdOzSOMojVgBy75PW67qFB5_GJJfgGSJYTAWq5SZOcskSVjhXdFo1MUNQVlpqVWZodWYtbEtTazZoWmZNS2FDTFdRVDQzYkx2RG1rSUk1bE94ZTFhOUpDWGRkT3VadnpPeVlIMnFjT1VzcjFEM3VFRzFmcGRRWGJBIIEC"
        
        //"Cookie":"DedeUserID=3493271303096985;DedeUserID__ckMd5=7b86f3894ed7f8c0;SESSDATA=2d6f63c8%2C1684568607%2C19eb6%2Ab1;bili_jct=21d538b01566c26afc81ff68c2ac7dca;"
    },
    timeout:5000,
    class_name:'历史&人文&宇宙&自然&探险&动物&科技&美食',
    class_url:'10033&10065&10068&10072&10067&10071&10066&10045',
    filter: { "10033": [{ "key": "order", "name": "排序", "value": [{ "n": "播放数量", "v": "2" }, { "n": "更新时间", "v": "0" }, { "n": "最高评分", "v": "4" }, { "n": "弹幕数量", "v": "1" }, { "n": "追看人数", "v": "3" }, { "n": "开播时间", "v": "5" }, { "n": "上映时间", "v": "6" }] }, { "key": "season_status", "name": "付费", "value": [{ "n": "全部", "v": "-1" }, { "n": "免费", "v": "1" }, { "n": "付费", "v": "2%2C6" }, { "n": "大会员", "v": "4%2C6" }] }], "10065": [{ "key": "order", "name": "排序", "value": [{ "n": "播放数量", "v": "2" }, { "n": "更新时间", "v": "0" }, { "n": "最高评分", "v": "4" }, { "n": "弹幕数量", "v": "1" }, { "n": "追看人数", "v": "3" }, { "n": "开播时间", "v": "5" }, { "n": "上映时间", "v": "6" }] }, { "key": "season_status", "name": "付费", "value": [{ "n": "全部", "v": "-1" }, { "n": "免费", "v": "1" }, { "n": "付费", "v": "2%2C6" }, { "n": "大会员", "v": "4%2C6" }] }], "10068": [{ "key": "order", "name": "排序", "value": [{ "n": "播放数量", "v": "2" }, { "n": "更新时间", "v": "0" }, { "n": "最高评分", "v": "4" }, { "n": "弹幕数量", "v": "1" }, { "n": "追看人数", "v": "3" }, { "n": "开播时间", "v": "5" }, { "n": "上映时间", "v": "6" }] }, { "key": "season_status", "name": "付费", "value": [{ "n": "全部", "v": "-1" }, { "n": "免费", "v": "1" }, { "n": "付费", "v": "2%2C6" }, { "n": "大会员", "v": "4%2C6" }] }], "10072": [{ "key": "order", "name": "排序", "value": [{ "n": "播放数量", "v": "2" }, { "n": "更新时间", "v": "0" }, { "n": "最高评分", "v": "4" }, { "n": "弹幕数量", "v": "1" }, { "n": "追看人数", "v": "3" }, { "n": "开播时间", "v": "5" }, { "n": "上映时间", "v": "6" }] }, { "key": "season_status", "name": "付费", "value": [{ "n": "全部", "v": "-1" }, { "n": "免费", "v": "1" }, { "n": "付费", "v": "2%2C6" }, { "n": "大会员", "v": "4%2C6" }] }], "10071": [{ "key": "order", "name": "排序", "value": [{ "n": "播放数量", "v": "2" }, { "n": "更新时间", "v": "0" }, { "n": "最高评分", "v": "4" }, { "n": "弹幕数量", "v": "1" }, { "n": "追看人数", "v": "3" }, { "n": "开播时间", "v": "5" }, { "n": "上映时间", "v": "6" }] }, { "key": "season_status", "name": "付费", "value": [{ "n": "全部", "v": "-1" }, { "n": "免费", "v": "1" }, { "n": "付费", "v": "2%2C6" }, { "n": "大会员", "v": "4%2C6" }] }], "10066": [{ "key": "order", "name": "排序", "value": [{ "n": "播放数量", "v": "2" }, { "n": "更新时间", "v": "0" }, { "n": "最高评分", "v": "4" }, { "n": "弹幕数量", "v": "1" }, { "n": "追看人数", "v": "3" }, { "n": "开播时间", "v": "5" }, { "n": "上映时间", "v": "6" }] }, { "key": "season_status", "name": "付费", "value": [{ "n": "全部", "v": "-1" }, { "n": "免费", "v": "1" }, { "n": "付费", "v": "2%2C6" }, { "n": "大会员", "v": "4%2C6" }] }], "10045": [{ "key": "order", "name": "排序", "value": [{ "n": "播放数量", "v": "2" }, { "n": "更新时间", "v": "0" }, { "n": "最高评分", "v": "4" }, { "n": "弹幕数量", "v": "1" }, { "n": "追看人数", "v": "3" }, { "n": "开播时间", "v": "5" }, { "n": "上映时间", "v": "6" }] }, { "key": "season_status", "name": "付费", "value": [{ "n": "全部", "v": "-1" }, { "n": "免费", "v": "1" }, { "n": "付费", "v": "2%2C6" }, { "n": "大会员", "v": "4%2C6" }] }], "10067": [{ "key": "order", "name": "排序", "value": [{ "n": "播放数量", "v": "2" }, { "n": "更新时间", "v": "0" }, { "n": "最高评分", "v": "4" }, { "n": "弹幕数量", "v": "1" }, { "n": "追看人数", "v": "3" }, { "n": "开播时间", "v": "5" }, { "n": "上映时间", "v": "6" }] }, { "key": "season_status", "name": "付费", "value": [{ "n": "全部", "v": "-1" }, { "n": "免费", "v": "1" }, { "n": "付费", "v": "2%2C6" }, { "n": "大会员", "v": "4%2C6" }] }] },
    play_parse:true,
    // play_json:[{re:'*', json:{jx:1, parse:0,header:JSON.stringify({"user-agent":"PC_UA"})}}],
    pagecount:{"1":10},
    lazy:'',
    limit:5,
    推荐:'',
    推荐:'js:let d=[];function get_result(url){let videos=[];let html=request(url);let jo=JSON.parse(html);if(jo["code"]===0){let vodList=jo.result?jo.result.list:jo.data.list;vodList.forEach(function(vod){let aid=(vod["season_id"]+"").trim();let title=vod["title"].trim();let img=vod["cover"].trim();let remark=vod.new_ep?vod["new_ep"]["index_show"]:vod["index_show"];videos.push({vod_id:aid,vod_name:title,vod_pic:img,vod_remarks:remark})})}return videos}function get_rank(tid,pg){return get_result("https://api.bilibili.com/pgc/web/rank/list?season_type=3&pagesize=20&page="+pg+"&day=3")}function get_rank2(tid,pg){return get_result("https://api.bilibili.com/pgc/season/rank/web/list?season_type=3&pagesize=20&page="+pg+"&day=3")}function home_video(){let videos=get_rank(1).slice(0,30);return videos}VODS=home_video();',
    一级:'',
    一级: 'js:let d=[];let vmid=input.split("vmid=")[1].split("&")[0];function get_result(url){let videos=[];let html=request(url);let jo=JSON.parse(html);if(jo["code"]===0){let vodList=jo.result?jo.result.list:jo.data.list;vodList.forEach(function(vod){let aid=(vod["season_id"]+"").trim();let title=vod["title"].trim();let img=vod["cover"].trim();let remark=vod.new_ep?vod["new_ep"]["index_show"]:vod["index_show"];videos.push({vod_id:aid,vod_name:title,vod_pic:img,vod_remarks:remark})})}return videos}function get_documentary(tid,pg,order,season_status){let url="https://api.bilibili.com/pgc/season/index/result?order="+order+"&pagesize=20&style_id="+tid+"&type=1&season_type=3&st=3&page="+pg+"&season_status="+season_status;return get_result(url)}function cate_filter(d,cookie){if(["10033","10065","10068","10072","10066","10045","10067","10071"].includes(MY_CATE)){let order=MY_FL.order||"2";let season_status=MY_FL.season_status||"1";return get_documentary(MY_CATE,MY_PAGE,order,season_status)}else{return[]}}VODS=cate_filter();',
    二级:{
        is_json:true,
        title:".result.title;.result.share_sub_title",
        img:".result.cover",
        desc:".result.new_ep.desc;.result.publish.pub_time;.result.subtitle",
        content:".result.evaluate",
        tabs:"js:pdfa=jsp.pdfa;TABS=['B站']",
        lists:".result.episodes",
        list_text:'title',
        list_url:'cid',
    },
    二级:'',
    二级:'js:function zh(num){let p="";if(Number(num)>1e8){p=(num/1e8).toFixed(2)+"亿"}else if(Number(num)>1e4){p=(num/1e4).toFixed(2)+"万"}else{p=num}return p}let html=request(input);let jo=JSON.parse(html).result;let id=jo["season_id"];let title=jo["title"];let pic=jo["cover"];let areas=jo["areas"][0]["name"];let typeName=jo["share_sub_title"];let date=jo["publish"]["pub_time"].substr(0,4);let dec=jo["evaluate"];let remark=jo["new_ep"]["desc"];let stat=jo["stat"];let status="弹幕: "+zh(stat["danmakus"])+"　点赞: "+zh(stat["likes"])+"　投币: "+zh(stat["coins"])+"　追番追剧: "+zh(stat["favorites"]);let score=jo.hasOwnProperty("rating")?"评分: "+jo["rating"]["score"]+"　"+jo["subtitle"]:"暂无评分"+"　"+jo["subtitle"];let vod={vod_id:id,vod_name:title,vod_pic:pic,type_name:typeName,vod_year:date,vod_area:areas,vod_remarks:remark,vod_actor:status,vod_director:score,vod_content:dec};let ja=jo["episodes"];let playurls1=[];let playurls2=[];ja.forEach(function(tmpJo){let eid=tmpJo["id"];let cid=tmpJo["cid"];let link=tmpJo["link"];let part=tmpJo["title"].replace("#","-")+" "+tmpJo["long_title"];playurls1.push(part+"$"+eid+"_"+cid);playurls2.push(part+"$"+link)});let playUrl=playurls1.join("#")+"$$$"+playurls2.join("#");vod["vod_play_from"]="B站$$$bilibili";vod["vod_play_url"]=playUrl;VOD=vod;',
    搜索:'',
    搜索:'js:let url1=input+"media_bangumi";let url2=input+"media_ft";let html=request(url1);let msg=JSON.parse(html).message;if(msg!=="0"){VODS=[{vod_name:KEY+"➢"+msg,vod_id:"no_data",vod_remarks:"别点,缺少bili_cookie",vod_pic:"https://ghproxy.com/https://raw.githubusercontent.com/hjdhnx/dr_py/main/404.jpg"}]}else{let jo1=JSON.parse(html).data;html=request(url2);let jo2=JSON.parse(html).data;let videos=[];let vodList=[];if(jo1["numResults"]===0){vodList=jo2["result"]}else if(jo2["numResults"]===0){vodList=jo1["result"]}else{vodList=jo1["result"].concat(jo2["result"])}vodList.forEach(function(vod){let aid=(vod["season_id"]+"").trim();let title=KEY+"➢"+vod["title"].trim().replace(\'<em class="keyword">\',"").replace("</em>","");let img=vod["cover"].trim();let remark=vod["index_show"];videos.push({vod_id:aid,vod_name:title,vod_pic:img,vod_remarks:remark})});VODS=videos}',
    lazy:'',
    lazy:`js:
        if (/^http/.test(input)) {
            input = {
                jx: 1,
                url: input,
                parse: 0,
                header: JSON.stringify({
                    "user-agent": "Mozilla/5.0"
                })
            }
        } else {
            let ids = input.split("_");
            let dan = 'https://api.bilibili.com/x/v1/dm/list.so?oid=' + ids[1];
            let result = {};
            let url = "https://api.bilibili.com/pgc/player/web/playurl?qn=80&ep_id=" + ids[0] + "&cid=" + ids[1];
            let html = request(url);
            let jRoot = JSON.parse(html);
            if (jRoot["message"] !== "success") {
                print("需要大会员权限才能观看");
                input = ""
            } else {
                let jo = jRoot["result"];
                let ja = jo["durl"];
                let maxSize = -1;
                let position = -1;
                ja.forEach(function(tmpJo, i) {
                    if (maxSize < Number(tmpJo["size"])) {
                        maxSize = Number(tmpJo["size"]);
                        position = i
                    }
                });
                let url = "";
                if (ja.length > 0) {
                    if (position === -1) {
                        position = 0
                    }
                    url = ja[position]["url"]
                }
                result["parse"] = 0;
                result["playUrl"] = "";
                result["url"] = url;
                result["header"] = {
                    Referer: "https://www.bilibili.com",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
                };
                result["contentType"] = "video/x-flv";
                result["danmaku"] = dan;
                input = result
            }
        }
    `,
}
