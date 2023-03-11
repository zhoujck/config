#coding=utf-8
#!/usr/bin/python
import sys
sys.path.append('..')
from base.spider import Spider
import json
from requests import session, utils
import os
import time
import base64

class Spider(Spider):  # 元类 默认的元类 type
	def getName(self):
		return "B站影视"
	def init(self,extend=""):
		print("============{0}============".format(extend))
		pass
	def isVideoFormat(self,url):
		pass
	def manualVideoCheck(self):
		pass
	def homeContent(self,filter):
		result = {}
		cateManual = {
			"番剧": "1",
			"国创": "4",
			"电影": "2",
			"综艺": "7",
			"电视剧": "5"
		}
		classes = []
		for k in cateManual:
			classes.append({
				'type_name':k,
				'type_id':cateManual[k]
			})
		result['class'] = classes
		if(filter):
			result['filters'] = self.config['filter']
		return result
	def homeVideoContent(self):
		result = {
			'list':[]
		}
		return result
	cookies = ''
	def getCookie(self):
		#在cookies_str中填入会员或大会员cookie，以获得更好的体验
		cookies_str = "buvid3=B655B00C-81DD-06AA-5DF6-72D1D52F71AC81071infoc; b_nut=1669877881; _uuid=2E410E176-E9D7-EDB2-7F5C-FE75C8979D2D83699infoc; buvid4=8BF139C4-8519-2B72-8280-43CB965DBD5891843-022120114-eFmjOr2kdfzhJgCixneXlA%3D%3D; rpdid=|(J~RllJ)~Rk0J'uYYm)~mkR~; i-wanna-go-back=-1; CURRENT_BLACKGAP=0; buvid_fp_plain=undefined; DedeUserID=701168335; DedeUserID__ckMd5=7219483457203958; b_ut=5; LIVE_BUVID=AUTO3116735763522711; is-2022-channel=1; CURRENT_QUALITY=112; CURRENT_FNVAL=4048; nostalgia_conf=-1; header_theme_version=CLOSE; fingerprint=7c10f1e8432489c950c501a954c6d250; buvid_fp=5b61f439dc5db6d4efc1ab445c5ee18e; PVID=1; bp_video_offset_701168335=771238700499599400; b_lsid=10E4182CC_186CFF70F5D; bsource=search_bing; SESSDATA=98340d09%2C1694078322%2Cfc94c%2A31; bili_jct=40ed3de46499fce218347853bfee10ca; sid=6yg2mi7f; home_feed_column=4; innersign=0"
		cookies_dic = dict([co.strip().split('=') for co in cookies_str.split(';')])
		rsp = session()
		cookies_jar = utils.cookiejar_from_dict(cookies_dic)
		rsp.cookies = cookies_jar
		content = self.fetch("http://api.bilibili.com/x/web-interface/nav", cookies=rsp.cookies)
		res = json.loads(content.text)
		if res["code"] == 0:
			self.cookies = rsp.cookies
		else:
			rsp = self.fetch("https://www.bilibili.com/")
			self.cookies = rsp.cookies
		return rsp.cookies

	def categoryContent(self,tid,pg,filter,extend):		
		result = {}
		url = 'https://api.bilibili.com/pgc/season/index/result?order=2&season_status=-1&style_id=-1&sort=0&area=-1&pagesize=20&type=1&st={0}&season_type={0}&page={1}'.format(tid,pg)
		if len(self.cookies) <= 0:
			self.getCookie()
		rsp = self.fetch(url, cookies=self.cookies)
		content = rsp.text
		jo = json.loads(content)
		videos = []
		vodList = jo['data']['list']
		for vod in vodList:
			aid = str(vod['season_id']).strip()
			title = vod['title'].strip()
			img =  vod['cover'].strip()
			remark = vod['index_show'].strip()
			videos.append({
				"vod_id":aid,
				"vod_name":title,
				"vod_pic":img,
				"vod_remarks":remark
			})
		result['list'] = videos
		result['page'] = pg
		result['pagecount'] = 9999
		result['limit'] = 90
		result['total'] = 999999
		return result
	def cleanSpace(self,str):
		return str.replace('\n','').replace('\t','').replace('\r','').replace(' ','')
	def detailContent(self,array):
		aid = array[0]
		url = "http://api.bilibili.com/pgc/view/web/season?season_id={0}".format(aid)
		rsp = self.fetch(url,headers=self.header)
		jRoot = json.loads(rsp.text)
		jo = jRoot['result']
		id = jo['season_id']
		title = jo['title']
		pic = jo['cover']
		areas = jo['areas'][0]['name']
		typeName = jo['share_sub_title']
		dec = jo['evaluate']
		remark = jo['new_ep']['desc']
		vod = {
			"vod_id":id,
			"vod_name":title,
			"vod_pic":pic,
			"type_name":typeName,
			"vod_year":"",
			"vod_area":areas,
			"vod_remarks":remark,
			"vod_actor":"",
			"vod_director":"",
			"vod_content":dec
		}
		ja = jo['episodes']
		playUrl = ''
		for tmpJo in ja:
			eid = tmpJo['id']
			cid = tmpJo['cid']
			part = tmpJo['title'].replace("#", "-")
			playUrl = playUrl + '{0}${1}_{2}#'.format(part, eid, cid)

		vod['vod_play_from'] = 'B站影视'
		vod['vod_play_url'] = playUrl

		result = {
			'list':[
				vod
			]
		}
		return result
	def searchContent(self,key,quick):
		url = 'https://api.bilibili.com/x/web-interface/search/type?search_type=media_bangumi&keyword={0}'.format(key)  # 番剧搜索
		if len(self.cookies) <= 0:
			self.getCookie()
		rsp = self.fetch(url, cookies=self.cookies)
		content = rsp.text
		jo = json.loads(content)
		rs = jo['data']
		if rs['numResults'] == 0:
			url = 'https://api.bilibili.com/x/web-interface/search/type?search_type=media_ft&keyword={0}'.format(key)  # 影视搜索
			rspRetry = self.fetch(url, cookies=self.cookies)
			content = rspRetry.text
		jo = json.loads(content)
		videos = []
		vodList = jo['data']['result']
		for vod in vodList:
			aid = str(vod['season_id']).strip()
			title = vod['title'].strip().replace("<em class=\"keyword\">", "").replace("</em>", "")
			img = vod['eps'][0]['cover'].strip()
			remark = vod['index_show']
			videos.append({
				"vod_id": aid,
				"vod_name": title,
				"vod_pic": img,
				"vod_remarks": remark
			})
		result = {
			'list': videos
		}
		return result

	def playerContent(self,flag,id,vipFlags):
		result = {}
		ids = id.split("_")
		header = {
			"Referer": "https://www.bilibili.com",
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
		}
		url = 'https://api.bilibili.com/pgc/player/web/playurl?qn=116&ep_id={0}&cid={1}'.format(ids[0],ids[1])
		if len(self.cookies) <= 0:
			self.getCookie()
		rsp = self.fetch(url,cookies=self.cookies,headers=header)
		jRoot = json.loads(rsp.text)
		if jRoot['message'] != 'success':
			print("需要大会员权限才能观看")
			return {}
		jo = jRoot['result']
		ja = jo['durl']
		maxSize = -1
		position = -1
		for i in range(len(ja)):
			tmpJo = ja[i]
			if maxSize < int(tmpJo['size']):
				maxSize = int(tmpJo['size'])
				position = i

		url = ''
		if len(ja) > 0:
			if position == -1:
				position = 0
			url = ja[position]['url']

		result["parse"] = 0
		result["playUrl"] = ''
		result["url"] = url
		result["header"] = {
			"Referer":"https://www.bilibili.com",
			"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
		}
		result["contentType"] = 'video/x-flv'
		return result

	config = {
		"player": {},
		"filter": {}
	}
	header = {}

	def localProxy(self,param):
		return [200, "video/MP2T", action, ""]
