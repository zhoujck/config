package com.github.catvod.spider;

import android.content.Context;
import android.text.TextUtils;
import com.github.catvod.crawler.Spider;
import com.github.catvod.spider.merge.A.b;
import com.github.catvod.spider.merge.A.c;
import com.github.catvod.spider.merge.A.d;
import com.github.catvod.spider.merge.A.g;
import com.github.catvod.spider.merge.A.m;
import com.github.catvod.spider.merge.U.AbstractC0614r1;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.simpleframework.xml.strategy.Name;

/* JADX INFO: loaded from: /home/seey6/Spider/moyu.dex */
public class AppRJ extends Spider {
    private static final String SIGN_KEY = "7gp0bnd2sr85ydii2j32pcypscoc4w6c7g5spl";
    private static final Pattern URL_PATTERN = Pattern.compile("https?://[^\\s]+\\.(m3u8|mp4|flv|avi|mkv|rmvb|wmv|mpg|mpeg|mov|ts)");
    private String baseUrl;

    private String getSign(String str) {
        return md5(SIGN_KEY + str);
    }

    private String getTimestamp() {
        return String.valueOf(System.currentTimeMillis() / 1000);
    }

    private boolean isValidUrl(String str) {
        if (str.contains("url=http") || str.contains(".js") || str.contains(".css") || str.contains(".html")) {
            return false;
        }
        return URL_PATTERN.matcher(str).find();
    }

    private String md5(String str) {
        try {
            StringBuilder sb = new StringBuilder(new BigInteger(1, MessageDigest.getInstance("MD5").digest(str.getBytes("UTF-8"))).toString(16));
            while (sb.length() < 32) {
                sb.insert(0, "0");
            }
            return sb.toString().toLowerCase();
        } catch (Exception unused) {
            return "";
        }
    }

    private String post(String str, Map<String, String> map) {
        try {
            String str2 = this.baseUrl + str;
            MultipartBody.Builder type = new MultipartBody.Builder().setType(MultipartBody.FORM);
            for (Map.Entry<String, String> entry : map.entrySet()) {
                type.addFormDataPart(entry.getKey(), entry.getValue());
            }
            Response responseExecute = new OkHttpClient().newCall(new Request.Builder().url(str2).post(type.build()).addHeader("User-Agent", "okhttp-okgo/jeasonlzy").build()).execute();
            return !responseExecute.isSuccessful() ? "" : responseExecute.body().string();
        } catch (Exception unused) {
            return "";
        }
    }

    @Override // com.github.catvod.crawler.Spider
    public String categoryContent(String str, String str2, boolean z, HashMap<String, String> map) {
        String timestamp = getTimestamp();
        HashMap map2 = new HashMap();
        map2.put("timestamp", timestamp);
        map2.put("sign", getSign(timestamp));
        map2.put("type_id", str);
        map2.put("limit", "12");
        map2.put("page", str2);
        if (map != null) {
            if (map.containsKey("area")) {
                map2.put("area", map.get("area"));
            }
            if (map.containsKey(Name.LABEL)) {
                map2.put(Name.LABEL, map.get(Name.LABEL));
            }
            if (map.containsKey("lang")) {
                map2.put("lang", map.get("lang"));
            }
            if (map.containsKey("year")) {
                map2.put("year", map.get("year"));
            }
        }
        JSONArray jSONArrayOptJSONArray = new JSONObject(post("/v3/home/type_search", map2)).optJSONObject("data").optJSONArray("list");
        ArrayList arrayList = new ArrayList();
        for (int i = 0; i < jSONArrayOptJSONArray.length(); i++) {
            JSONObject jSONObjectOptJSONObject = jSONArrayOptJSONArray.optJSONObject(i);
            String strOptString = jSONObjectOptJSONObject.optString("vod_pic");
            if (TextUtils.isEmpty(strOptString)) {
                strOptString = jSONObjectOptJSONObject.optString("vod_pic_thumb");
            }
            m mVar = new m();
            mVar.n(jSONObjectOptJSONObject.optString("vod_id"));
            mVar.o(jSONObjectOptJSONObject.optString("vod_name"));
            mVar.p(strOptString);
            mVar.s(jSONObjectOptJSONObject.optString("vod_remarks"));
            arrayList.add(mVar);
        }
        return g.i().H(arrayList).p(Integer.parseInt(str2), 9999, 12, 999999).s();
    }

    @Override // com.github.catvod.crawler.Spider
    public String detailContent(List<String> list) throws JSONException {
        String timestamp = getTimestamp();
        HashMap map = new HashMap();
        map.put("timestamp", timestamp);
        map.put("sign", getSign(timestamp));
        map.put("vod_id", list.get(0));
        JSONObject jSONObjectOptJSONObject = new JSONObject(post("/v3/home/vod_details", map)).optJSONObject("data");
        m mVar = new m();
        mVar.n(list.get(0));
        mVar.o(jSONObjectOptJSONObject.optString("vod_name"));
        String strOptString = jSONObjectOptJSONObject.optString("vod_pic");
        if (TextUtils.isEmpty(strOptString)) {
            strOptString = jSONObjectOptJSONObject.optString("vod_pic_thumb");
        }
        mVar.p(strOptString);
        mVar.s(jSONObjectOptJSONObject.optString("vod_remarks"));
        mVar.l(jSONObjectOptJSONObject.optString("vod_content").replaceAll("[^一-龥\\u3000-〿\\uff00-\\uffef]", ""));
        mVar.u(jSONObjectOptJSONObject.optString("vod_year"));
        mVar.j(jSONObjectOptJSONObject.optString("vod_actor"));
        mVar.m(jSONObjectOptJSONObject.optString("vod_director"));
        mVar.i(jSONObjectOptJSONObject.optString("vod_class"));
        JSONArray jSONArrayOptJSONArray = jSONObjectOptJSONObject.optJSONArray("vod_play_list");
        ArrayList arrayList = new ArrayList();
        ArrayList arrayList2 = new ArrayList();
        String strOptString2 = jSONObjectOptJSONObject.optString("vod_name");
        for (int i = 0; i < jSONArrayOptJSONArray.length(); i++) {
            JSONObject jSONObjectOptJSONObject2 = jSONArrayOptJSONArray.optJSONObject(i);
            String string = jSONObjectOptJSONObject2.getString("name");
            String strOptString3 = jSONObjectOptJSONObject2.optString("ua");
            JSONArray jSONArrayOptJSONArray2 = jSONObjectOptJSONObject2.optJSONArray("urls");
            JSONArray jSONArrayOptJSONArray3 = jSONObjectOptJSONObject2.optJSONArray("parse_urls");
            StringBuilder sb = new StringBuilder();
            for (int i2 = 0; i2 < jSONArrayOptJSONArray3.length(); i2++) {
                sb.append(jSONArrayOptJSONArray3.optString(i2));
                sb.append("@");
            }
            ArrayList arrayList3 = new ArrayList();
            int i3 = 0;
            while (i3 < jSONArrayOptJSONArray2.length()) {
                JSONObject jSONObjectOptJSONObject3 = jSONArrayOptJSONArray2.optJSONObject(i3);
                JSONArray jSONArray = jSONArrayOptJSONArray;
                arrayList3.add(jSONObjectOptJSONObject3.optString("name") + "$" + ((Object) sb) + "|" + jSONObjectOptJSONObject3.optString("url") + "|" + strOptString3 + "||" + strOptString2 + "|" + jSONObjectOptJSONObject3.optString("nid"));
                i3++;
                jSONArrayOptJSONArray = jSONArray;
            }
            arrayList.add(string);
            arrayList2.add(TextUtils.join("#", arrayList3));
        }
        String strJoin = TextUtils.join("$$$", arrayList2);
        mVar.q(TextUtils.join("$$$", arrayList));
        mVar.r(strJoin);
        AbstractC0614r1.o(strOptString2);
        AbstractC0614r1.p(strJoin);
        return g.t(FishCrypto.applyNotice(mVar));
    }

    @Override // com.github.catvod.crawler.Spider
    public String homeContent(boolean z) {
        JSONArray jSONArray;
        JSONArray jSONArray2;
        String timestamp = getTimestamp();
        HashMap map = new HashMap();
        map.put("timestamp", timestamp);
        map.put("sign", getSign(timestamp));
        JSONArray jSONArrayOptJSONArray = new JSONObject(post("/v3/type/top_type", map)).optJSONObject("data").optJSONArray("list");
        ArrayList arrayList = new ArrayList();
        LinkedHashMap linkedHashMap = new LinkedHashMap();
        int i = 0;
        while (i < jSONArrayOptJSONArray.length()) {
            JSONObject jSONObjectOptJSONObject = jSONArrayOptJSONArray.optJSONObject(i);
            String strOptString = jSONObjectOptJSONObject.optString("type_id");
            arrayList.add(new b(strOptString, jSONObjectOptJSONObject.optString("type_name")));
            if (z) {
                ArrayList arrayList2 = new ArrayList();
                Iterator<String> itKeys = jSONObjectOptJSONObject.keys();
                while (itKeys.hasNext()) {
                    String next = itKeys.next();
                    String str = next.equals("extend") ? "类型" : next.equals("area") ? "地区" : next.equals("year") ? "年份" : next.equals("lang") ? "语言" : "";
                    if (TextUtils.isEmpty(str)) {
                        jSONArray2 = jSONArrayOptJSONArray;
                    } else {
                        JSONArray jSONArrayOptJSONArray2 = jSONObjectOptJSONObject.optJSONArray(next);
                        ArrayList arrayList3 = new ArrayList();
                        int i2 = 0;
                        while (i2 < jSONArrayOptJSONArray2.length()) {
                            String strOptString2 = jSONArrayOptJSONArray2.optString(i2);
                            JSONArray jSONArray3 = jSONArrayOptJSONArray;
                            if (strOptString2.length() > 1) {
                                arrayList3.add(new c(strOptString2, strOptString2));
                            }
                            i2++;
                            jSONArrayOptJSONArray = jSONArray3;
                        }
                        jSONArray2 = jSONArrayOptJSONArray;
                        if (arrayList3.size() > 1) {
                            arrayList2.add(new d(next.replace("extend", Name.LABEL), str, arrayList3));
                        }
                    }
                    jSONArrayOptJSONArray = jSONArray2;
                }
                jSONArray = jSONArrayOptJSONArray;
                linkedHashMap.put(strOptString, arrayList2);
            } else {
                jSONArray = jSONArrayOptJSONArray;
            }
            i++;
            jSONArrayOptJSONArray = jSONArray;
        }
        return g.A(arrayList, new ArrayList(), linkedHashMap);
    }

    @Override // com.github.catvod.crawler.Spider
    public void init(Context context, String str) {
        super.init(context, str);
        try {
            this.baseUrl = new JSONObject(str).optString("url", "");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override // com.github.catvod.crawler.Spider
    public String playerContent(String str, String str2, List<String> list) {
        String[] strArrSplit = str2.split("\\|");
        if (strArrSplit.length == 5) {
            strArrSplit = (strArrSplit[0] + "|" + strArrSplit[1] + "|" + strArrSplit[2] + "||" + strArrSplit[3] + "|" + strArrSplit[4]).split("\\|");
        }
        String str3 = strArrSplit[0];
        String strOptString = strArrSplit[1];
        String str4 = strArrSplit[2];
        String str5 = strArrSplit[4];
        String str6 = strArrSplit[5];
        if (!TextUtils.isEmpty(str3)) {
            for (String str7 : str3.split("@")) {
                if (!TextUtils.isEmpty(str7)) {
                    try {
                        String timestamp = getTimestamp();
                        String str8 = str7 + strOptString + "&sign=" + getSign(timestamp) + "&timestamp=" + timestamp;
                        HashMap map = new HashMap();
                        map.put("Referer", "");
                        JSONObject jSONObject = new JSONObject(com.github.catvod.spider.merge.R.c.t(str8, map));
                        strOptString = jSONObject.optString("url");
                        String strOptString2 = jSONObject.optString("UA", str4);
                        if (!TextUtils.isEmpty(strOptString2)) {
                            str4 = strOptString2;
                        }
                        if (isValidUrl(strOptString)) {
                            break;
                        }
                    } catch (Exception unused) {
                        continue;
                    }
                }
            }
        }
        if (!strOptString.startsWith("http")) {
            return "";
        }
        String strM = AbstractC0614r1.m(str, str2);
        HashMap map2 = new HashMap();
        if (!TextUtils.isEmpty(str4)) {
            map2.put("User-Agent", str4);
        }
        return g.i().E(strOptString).j(map2).b(strM).s();
    }

    @Override // com.github.catvod.crawler.Spider
    public String searchContent(String str, boolean z) {
        String timestamp = getTimestamp();
        HashMap map = new HashMap();
        map.put("timestamp", timestamp);
        map.put("sign", getSign(timestamp));
        map.put("keyword", str);
        map.put("limit", "12");
        map.put("page", "1");
        JSONArray jSONArrayOptJSONArray = new JSONObject(post("/v3/home/search", map)).optJSONObject("data").optJSONArray("list");
        ArrayList arrayList = new ArrayList();
        for (int i = 0; i < jSONArrayOptJSONArray.length(); i++) {
            JSONObject jSONObjectOptJSONObject = jSONArrayOptJSONArray.optJSONObject(i);
            String strOptString = jSONObjectOptJSONObject.optString("vod_pic");
            if (TextUtils.isEmpty(strOptString)) {
                strOptString = jSONObjectOptJSONObject.optString("vod_pic_thumb");
            }
            m mVar = new m();
            mVar.n(jSONObjectOptJSONObject.optString("vod_id"));
            mVar.o(jSONObjectOptJSONObject.optString("vod_name"));
            mVar.p(strOptString);
            mVar.s(jSONObjectOptJSONObject.optString("vod_remarks"));
            arrayList.add(mVar);
        }
        return g.v(arrayList);
    }
}
