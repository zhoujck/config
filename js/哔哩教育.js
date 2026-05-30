let host = 'https://api.bilibili.com';
let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.bilibili.com",
    "Cookie": ""
};

// ==================== MD5 ====================
function md5(string) {
    function md5cycle(x, k) {
        var a=x[0],b=x[1],c=x[2],d=x[3];
        a=ff(a,b,c,d,k[0],7,-680876936);d=ff(d,a,b,c,k[1],12,-389564586);c=ff(c,d,a,b,k[2],17,606105819);b=ff(b,c,d,a,k[3],22,-1044525330);a=ff(a,b,c,d,k[4],7,-176418897);d=ff(d,a,b,c,k[5],12,1200080426);c=ff(c,d,a,b,k[6],17,-1473231341);b=ff(b,c,d,a,k[7],22,-45705983);a=ff(a,b,c,d,k[8],7,1770035416);d=ff(d,a,b,c,k[9],12,-1958414417);c=ff(c,d,a,b,k[10],17,-42063);b=ff(b,c,d,a,k[11],22,-1990404162);a=ff(a,b,c,d,k[12],7,1804603682);d=ff(d,a,b,c,k[13],12,-40341101);c=ff(c,d,a,b,k[14],17,-1502002290);b=ff(b,c,d,a,k[15],22,1236535329);
        a=gg(a,b,c,d,k[1],5,-165796510);d=gg(d,a,b,c,k[6],9,-1069501632);c=gg(c,d,a,b,k[11],14,643717713);b=gg(b,c,d,a,k[0],20,-373897302);a=gg(a,b,c,d,k[5],5,-701558691);d=gg(d,a,b,c,k[10],9,38016083);c=gg(c,d,a,b,k[15],14,-660478335);b=gg(b,c,d,a,k[4],20,-405537848);a=gg(a,b,c,d,k[9],5,568446438);d=gg(d,a,b,c,k[14],9,-1019803690);c=gg(c,d,a,b,k[3],14,-187363961);b=gg(b,c,d,a,k[8],20,1163531501);a=gg(a,b,c,d,k[13],5,-1444681467);d=gg(d,a,b,c,k[2],9,-51403784);c=gg(c,d,a,b,k[7],14,1735328473);b=gg(b,c,d,a,k[12],20,-1926607734);
        a=hh(a,b,c,d,k[5],4,-378558);d=hh(d,a,b,c,k[8],11,-2022574463);c=hh(c,d,a,b,k[11],16,1839030562);b=hh(b,c,d,a,k[14],23,-35309556);a=hh(a,b,c,d,k[1],4,-1530992060);d=hh(d,a,b,c,k[4],11,1272893353);c=hh(c,d,a,b,k[7],16,-155497632);b=hh(b,c,d,a,k[10],23,-1094730640);a=hh(a,b,c,d,k[13],4,681279174);d=hh(d,a,b,c,k[0],11,-358537222);c=hh(c,d,a,b,k[3],16,-722521979);b=hh(b,c,d,a,k[6],23,76029189);a=hh(a,b,c,d,k[9],4,-640364487);d=hh(d,a,b,c,k[12],11,-421815835);c=hh(c,d,a,b,k[15],16,530742520);b=hh(b,c,d,a,k[2],23,-995338651);
        a=ii(a,b,c,d,k[0],6,-198630844);d=ii(d,a,b,c,k[7],10,1126891415);c=ii(c,d,a,b,k[14],15,-1416354905);b=ii(b,c,d,a,k[5],21,-57434055);a=ii(a,b,c,d,k[12],6,1700485571);d=ii(d,a,b,c,k[3],10,-1894986606);c=ii(c,d,a,b,k[10],15,-1051523);b=ii(b,c,d,a,k[1],21,-2054922799);a=ii(a,b,c,d,k[8],6,1873313359);d=ii(d,a,b,c,k[15],10,-30611744);c=ii(c,d,a,b,k[6],15,-1560198380);b=ii(b,c,d,a,k[13],21,1309151649);a=ii(a,b,c,d,k[4],6,-145523070);d=ii(d,a,b,c,k[11],10,-1120210379);c=ii(c,d,a,b,k[2],15,718787259);b=ii(b,c,d,a,k[9],21,-343485551);
        x[0]=add32(a,x[0]);x[1]=add32(b,x[1]);x[2]=add32(c,x[2]);x[3]=add32(d,x[3]);
    }
    function cmn(q,a,b,x,s,t){a=add32(add32(a,q),add32(x,t));return add32((a<<s)|(a>>>(32-s)),b);}
    function ff(a,b,c,d,x,s,t){return cmn((b&c)|((~b)&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&(~d)),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t){return cmn(c^(b|(~d)),a,b,x,s,t);}
    function md5blk(s){var m=[],i;for(i=0;i<64;i+=4)m[i>>2]=s.charCodeAt(i)+(s.charCodeAt(i+1)<<8)+(s.charCodeAt(i+2)<<16)+(s.charCodeAt(i+3)<<24);return m;}
    function add32(a,b){return(a+b)&0xFFFFFFFF;}
    function rhex(n){var s='',j;for(j=0;j<4;j++)s+='0123456789abcdef'.charAt((n>>(j*8+4))&0x0F)+'0123456789abcdef'.charAt((n>>(j*8))&0x0F);return s;}
    var n=string.length,state=[1732584193,-271733879,-1732584194,271733878],i;
    for(i=64;i<=n;i+=64)md5cycle(state,md5blk(string.substring(i-64,i)));
    string=string.substring(i-64);
    var tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for(i=0;i<string.length;i++)tail[i>>2]|=string.charCodeAt(i)<<((i%4)<<3);
    tail[i>>2]|=0x80<<((i%4)<<3);
    if(i>55){md5cycle(state,tail);tail=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}
    tail[14]=n*8;md5cycle(state,tail);
    return rhex(state[0])+rhex(state[1])+rhex(state[2])+rhex(state[3]);
}

// ==================== WBI 签名 ====================
var MIXIN_KEY_ENC_TAB=[46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,17,6,28];
var _wbiCache=null;

function getMixinKey(raw){var r='';for(var i=0;i<MIXIN_KEY_ENC_TAB.length;i++)r+=raw[MIXIN_KEY_ENC_TAB[i]];return r.substring(0,32);}

async function getWbiKeys(){
    if(_wbiCache)return _wbiCache;
    try{
        var resp=await req(host+'/x/web-interface/nav',{headers:headers});
        var jo=JSON.parse(resp.content);
        var u=jo.data&&jo.data.wbi_img?jo.data.wbi_img.img_url:'';
        var s=jo.data&&jo.data.wbi_img?jo.data.wbi_img.sub_url:'';
        _wbiCache={ik:u.split('/').pop().split('.')[0]||'',sk:s.split('/').pop().split('.')[0]||''};
        return _wbiCache;
    }catch(e){return{ik:'',sk:''};}
}

async function signUrl(base,params){
    var keys=await getWbiKeys();
    var mk=getMixinKey(keys.ik+keys.sk),wts=Math.floor(Date.now()/1000),signed={};
    var sk=Object.keys(params).sort();
    for(var i=0;i<sk.length;i++){var k=sk[i];if(params[k]!==undefined&&params[k]!==null&&params[k]!=='')signed[k]=params[k];}
    signed.wts=wts;sk=Object.keys(signed).sort();var qp=[];
    for(var j=0;j<sk.length;j++)qp.push(encodeURIComponent(sk[j])+'='+encodeURIComponent(signed[sk[j]]));
    signed.w_rid=md5(qp.join('&')+mk);
    var parts=[];var allk=Object.keys(signed);
    for(var t=0;t<allk.length;t++)parts.push(encodeURIComponent(allk[t])+'='+encodeURIComponent(signed[allk[t]]));
    return base+'?'+parts.join('&');
}

// ==================== 工具 ====================
function fmtNum(n){if(n>1e8)return(n/1e8).toFixed(2)+"亿";if(n>1e4)return(n/1e4).toFixed(2)+"万";return n+"";}
function fixImg(u){return!u?"":(u.indexOf("//")===0?"https:"+u:u);}
function stripH(s){return(s||"").replace(/<[^>]*>/g,"");}

// ==================== UP主列表 ====================
var UPS_XQ=[
    {v:"",n:"全部"},
    {v:"板牙象棋",n:"板牙象棋"},
    {v:"板鸭象棋",n:"板鸭象棋"},
    {v:"四郎讲棋",n:"四郎讲棋"},
    {v:"象棋研究者",n:"象棋研究者"},
    {v:"象棋大师孙浩宇",n:"象棋大师孙浩宇"},
    {v:"小植象棋",n:"小植象棋"}
];
var UPS_PPQ=[
    {v:"",n:"全部"},
    {v:"pp乒乓酱",n:"pp乒乓酱"},
    {v:"乒乓网pingpangwang",n:"乒乓网"},
    {v:"黄晨乒乓球",n:"黄晨乒乓球"},
    {v:"何教练说乒乓",n:"何教练说乒乓"},
    {v:"乒乓视觉传播者",n:"乒乓视觉传播者"}
];

// ==================== 初始化 ====================
async function init(cfg){}

// ==================== 首页（静态，不调API）====================
async function home(filter){
    return JSON.stringify({
        "class":[
            {"type_id":"xiangqi","type_name":"象棋"},
            {"type_id":"pingpong","type_name":"乒乓球"}
        ],
        "filters":{
            "xiangqi":[
                {"key":"up","name":"UP主","value":UPS_XQ},
                {"key":"order","name":"排序","value":[
                    {"n":"播放最多","v":"click"},
                    {"n":"最新发布","v":"pubdate"},
                    {"n":"弹幕最多","v":"dm"},
                    {"n":"收藏最多","v":"stow"}
                ]}
            ],
            "pingpong":[
                {"key":"up","name":"UP主","value":UPS_PPQ},
                {"key":"order","name":"排序","value":[
                    {"n":"播放最多","v":"click"},
                    {"n":"最新发布","v":"pubdate"},
                    {"n":"弹幕最多","v":"dm"},
                    {"n":"收藏最多","v":"stow"}
                ]}
            ]
        }
    });
}

// ==================== 首页推荐 ====================
async function homeVod(){
    try{
        var url=await signUrl(host+'/x/web-interface/search/type',{search_type:"video",keyword:"象棋",page:"1",pagesize:"20",order:"click"});
        var resp=await req(url,{headers:{"User-Agent":headers["User-Agent"],"Referer":"https://search.bilibili.com","Origin":"https://search.bilibili.com","Cookie":headers["Cookie"]}});
        var jo=JSON.parse(resp.content);
        if(jo.code!==0)return JSON.stringify({list:[]});
        var list=(jo.data&&jo.data.result)?jo.data.result:[],vids=[];
        for(var i=0;i<list.length;i++){var v=list[i];if(v.type!=="video")continue;vids.push({vod_id:String(v.aid||""),vod_name:stripH(v.title||""),vod_pic:fixImg(v.pic||""),vod_remarks:(v.duration||"")+(v.author?" · "+v.author:"")});}
        return JSON.stringify({list:vids});
    }catch(e){return JSON.stringify({list:[]});}
}

// ==================== 分类 ====================
async function category(tid,pg,filter,extend){
    var p=pg||1;
    var order=(extend&&extend.order)?extend.order:"click";
    var up=(extend&&extend.up)?extend.up:"";
    var base=tid==="pingpong"?"乒乓球":"象棋";
    var keyword=up?(up+" "+base):base;
    try{
        var params={search_type:"video",keyword:keyword,page:String(p),pagesize:"20",order:order};
        var url=await signUrl(host+'/x/web-interface/search/type',params);
        var resp=await req(url,{headers:{"User-Agent":headers["User-Agent"],"Referer":"https://search.bilibili.com","Origin":"https://search.bilibili.com","Cookie":headers["Cookie"]}});
        var jo=JSON.parse(resp.content);
        if(jo.code!==0)return JSON.stringify({list:[],page:parseInt(p)});
        var list=(jo.data&&jo.data.result)?jo.data.result:[],vids=[];
        for(var i=0;i<list.length;i++){var v=list[i];if(v.type!=="video")continue;vids.push({vod_id:String(v.aid||""),vod_name:stripH(v.title||""),vod_pic:fixImg(v.pic||""),vod_remarks:(v.duration||"")+(v.author?" · "+v.author:"")});}
        return JSON.stringify({list:vids,page:parseInt(p)});
    }catch(e){return JSON.stringify({list:[],page:parseInt(p)});}
}

// ==================== 搜索 ====================
async function search(wd,quick,pg){
    var p=pg||1;
    try{
        var url=await signUrl(host+'/x/web-interface/search/type',{search_type:"video",keyword:wd,page:String(p),pagesize:"20"});
        var resp=await req(url,{headers:{"User-Agent":headers["User-Agent"],"Referer":"https://search.bilibili.com","Origin":"https://search.bilibili.com","Cookie":headers["Cookie"]}});
        var jo=JSON.parse(resp.content);
        if(jo.code!==0)return JSON.stringify({list:[]});
        var list=(jo.data&&jo.data.result)?jo.data.result:[],vids=[];
        for(var i=0;i<list.length;i++){var v=list[i];if(v.type!=="video")continue;vids.push({vod_id:String(v.aid||""),vod_name:stripH(v.title||""),vod_pic:fixImg(v.pic||""),vod_remarks:(v.duration||"")+(v.author?" · "+v.author:"")});}
        return JSON.stringify({list:vids});
    }catch(e){return JSON.stringify({list:[]});}
}

// ==================== 详情 ====================
async function detail(id){
    try{
        var resp=await req(host+"/x/web-interface/view?aid="+id,{headers:headers});
        var jo=JSON.parse(resp.content);
        if(jo.code!==0)return JSON.stringify({list:[]});
        var d=jo.data,st=d.stat||{};
        var status="播放:"+fmtNum(st.view)+"　弹幕:"+fmtNum(st.danmaku)+"　点赞:"+fmtNum(st.like)+"　投币:"+fmtNum(st.coin)+"　收藏:"+fmtNum(st.favorite);
        var pages=d.pages||[],urls=[];
        if(pages.length>1){for(var i=0;i<pages.length;i++){var p=pages[i];urls.push((p.part||("P"+p.page))+"$"+id+"_"+p.cid);}}
        else urls.push("播放$"+id+"_"+d.cid);
        return JSON.stringify({list:[{
            vod_id:id,vod_name:d.title,vod_pic:d.pic,type_name:d.tname||"",
            vod_year:d.pubdate?new Date(d.pubdate*1000).getFullYear()+"":"",
            vod_area:"",vod_remarks:fmtNum(st.view)+"播放",
            vod_actor:status,vod_director:"UP主:"+(d.owner?d.owner.name:""),
            vod_content:d.desc||"",vod_play_from:"B站",vod_play_url:urls.join("#")
        }]});
    }catch(e){return JSON.stringify({list:[]});}
}

// ==================== 播放 ====================
async function play(flag,id,flags){
    try{
        var pts=id.split("_"),avid=pts[0],cid=pts.length>1?pts[1]:"";
        if(!cid){
            try{var r=await req(host+"/x/web-interface/view?aid="+avid,{headers:headers});var j=JSON.parse(r.content);if(j.code===0&&j.data)cid=j.data.cid+"";}catch(e){}
        }
        var ph={"Referer":"https://www.bilibili.com/video/av"+avid,"User-Agent":headers["User-Agent"]};
        if(!cid)return JSON.stringify({parse:1,url:"https://www.bilibili.com/video/av"+avid+"/",header:ph});
        // 请求视频地址
        var resp=await req(host+"/x/player/playurl?avid="+avid+"&cid="+cid+"&qn=80&fnval=0&try_look=1",{headers:ph});
        var jo=JSON.parse(resp.content);
        if(jo.code===0&&jo.data&&jo.data.durl&&jo.data.durl.length>0){
            var maxSize=-1,pos=0;
            for(var i=0;i<jo.data.durl.length;i++){if(maxSize<Number(jo.data.durl[i].size)){maxSize=Number(jo.data.durl[i].size);pos=i;}}
            return JSON.stringify({parse:0,url:jo.data.durl[pos].url,contentType:"video/x-flv",header:{"Referer":"https://www.bilibili.com","User-Agent":headers["User-Agent"]},danmaku:"https://api.bilibili.com/x/v1/dm/list.so?oid="+cid});
        }
        // 接口失败，返回播放页面
        return JSON.stringify({parse:1,url:"https://www.bilibili.com/video/av"+avid+"/",header:ph});
    }catch(e){
        var avid2=(id||"").split("_")[0];
        return JSON.stringify({parse:1,url:"https://www.bilibili.com/video/av"+avid2+"/",header:{"User-Agent":"Mozilla/5.0","Referer":"https://www.bilibili.com"}});
    }
}

export default{init,home,homeVod,category,detail,search,play};
