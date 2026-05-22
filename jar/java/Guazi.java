package com.github.catvod.spider;

import android.content.Context;
import android.text.TextUtils;
import android.util.Base64;
import com.github.catvod.crawler.Spider;
import com.github.catvod.spider.merge.A.b;
import com.github.catvod.spider.merge.A.g;
import com.github.catvod.spider.merge.A.m;
import com.github.catvod.spider.merge.R.c;
import com.github.catvod.spider.merge.U.AbstractC0591j1;
import com.github.catvod.spider.merge.U.AbstractC0614r1;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.math.BigInteger;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import okhttp3.FormBody;
import okhttp3.Headers;
import okhttp3.Request;
import okhttp3.Response;

/* JADX INFO: loaded from: /home/seey6/Spider/moyu.dex */
public class Guazi extends Spider {
    private static final String AES_IV = "wgr8N6BCs7426wf1";
    private static final String AES_KEY = "U823n8pKnAAbWOST";
    private static final String FIXED_KEYS = "bMTqITVqBsbq9UjLufsQuBvRiIyfqHLqAWUx0gj0ZUe9DMNDTmJDVZzAh45AZ5LtkC39Y0DU4Ufqm/9gliIJaj7cI/dhmoM5fib5HcslzyGONEwZY5fHBvokBreGaT8bPoaxmnWdTRjRfJzYZV6T06O7GsYVa6DuKTVArb0g48Q=";
    private static final String RSA_PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\nMIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA==\n-----END RSA PRIVATE KEY-----";
    private String apiHost;
    private String extConfig;
    private String token = "97630f5f85d9f3c639fb7790ca881ef2.4cccf48dc340fe8bded39cfe4ef9ac2adb27425a9069e6cd121210fc7ba518ea8c1cc5629261e94bb6ccb66d8548449c72076c956a2fb46c253008909a6c66347eb458fe3c06d1fcc993ca03a298328f9229f1994a608250c7d1ae124c4520e6e14ce8bf9f4404119a6bbf53cf592a8df2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.473433979755ccd5ec1b4581ccef76e8209b9e0c6ff819917f12dffad47d0d5e";
    private static final String API_HOST = "https://api.w32z7vtd.com";
    private static final String[] API_HOSTS = {API_HOST, "https://api.6a7nnf7.com", "https://api.umygrx3.com", "https://api.rmedphk.com"};
    private static final Map<String, String> SUB_MAP = new HashMap();

    private byte[] aesDecrypt(byte[] bArr, byte[] bArr2, byte[] bArr3) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, InvalidAlgorithmParameterException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(bArr2, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(2, secretKeySpec, new IvParameterSpec(bArr3));
        return cipher.doFinal(bArr);
    }

    private byte[] aesEncrypt(byte[] bArr, byte[] bArr2, byte[] bArr3) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, InvalidAlgorithmParameterException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(bArr2, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(1, secretKeySpec, new IvParameterSpec(bArr3));
        return cipher.doFinal(bArr);
    }

    private JsonObject apiRequest(String str, Map<String, String> map, int i) throws Exception {
        String upperCase = bytesToHex(aesEncrypt(AbstractC0591j1.d(map).getBytes(StandardCharsets.UTF_8), AES_KEY.getBytes(), AES_IV.getBytes())).toUpperCase();
        String strValueOf = String.valueOf(System.currentTimeMillis() / 1000);
        String strMd5 = md5("token_id=,token=" + this.token + ",phone_type=1,request_key=" + upperCase + ",app_id=1,time=" + strValueOf + ",keys=" + FIXED_KEYS + "*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br");
        FormBody.Builder builder = new FormBody.Builder();
        builder.add("token", this.token);
        builder.add("token_id", "");
        builder.add("phone_type", "1");
        builder.add("time", strValueOf);
        builder.add("phone_model", "xiaomi-2206123sc");
        builder.add("keys", FIXED_KEYS);
        builder.add("request_key", upperCase);
        builder.add("signature", strMd5);
        builder.add("app_id", "1");
        builder.add("ad_version", "1");
        Request.Builder builderPost = new Request.Builder().url(this.apiHost + str).post(builder.build());
        for (Map.Entry<String, String> entry : getHeaders().entrySet()) {
            builderPost.addHeader(entry.getKey(), entry.getValue());
        }
        Response responseL = c.l(builderPost.build());
        String strString = responseL.body() != null ? responseL.body().string() : "";
        if (strString.isEmpty()) {
            throw new Exception("空响应");
        }
        JsonObject asJsonObject = JsonParser.parseString(strString).getAsJsonObject();
        if (!asJsonObject.has("code") || asJsonObject.get("code").getAsInt() == 200) {
            JsonObject asJsonObject2 = asJsonObject.getAsJsonObject("data");
            String jsonString = getJsonString(asJsonObject2, "response_key");
            JsonObject asJsonObject3 = JsonParser.parseString(rsaDecrypt(getJsonString(asJsonObject2, "keys"), RSA_PRIVATE_KEY)).getAsJsonObject();
            byte[] bArrHexToBytes = hexToBytes(jsonString);
            String jsonString2 = getJsonString(asJsonObject3, "key");
            Charset charset = StandardCharsets.UTF_8;
            return JsonParser.parseString(new String(aesDecrypt(bArrHexToBytes, jsonString2.getBytes(charset), getJsonString(asJsonObject3, "iv").getBytes(charset)), charset)).getAsJsonObject();
        }
        if (i < 3 && !str.equals("/App/Authentication/Authenticator/refresh")) {
            int i2 = i + 1;
            JsonObject jsonObjectApiRequest = apiRequest("/App/Authentication/Authenticator/refresh", new HashMap(), i2);
            if (jsonObjectApiRequest.has("data") && !jsonObjectApiRequest.get("data").isJsonNull()) {
                this.token = jsonObjectApiRequest.get("data").getAsString();
                return apiRequest(str, map, i2);
            }
        }
        throw new Exception("请求失败: " + asJsonObject);
    }

    private String bytesToHex(byte[] bArr) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bArr) {
            String hexString = Integer.toHexString(b & 255);
            if (hexString.length() == 1) {
                sb.append('0');
            }
            sb.append(hexString);
        }
        return sb.toString();
    }

    private String findAvailableHost() {
        int iCode;
        HashMap map = new HashMap();
        map.put("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        for (String str : API_HOSTS) {
            try {
                Response responseL = c.l(new Request.Builder().url(str).head().headers(Headers.of(map)).build());
                iCode = responseL.code();
                responseL.close();
            } catch (Exception unused) {
            }
            if (iCode >= 200 && iCode < 300) {
                return str;
            }
        }
        return API_HOSTS[0];
    }

    private Map<String, String> getHeaders() {
        HashMap map = new HashMap();
        map.put("User-Agent", "okhttp/3.12.0");
        map.put("Content-Type", "application/x-www-form-urlencoded");
        map.put("Version", "2406025");
        map.put("PackageName", "com.j64f4b21072.ha69699879.dfea0a9826ba.ibf50c9b1d");
        map.put("Ver", "1.9.2");
        map.put("Referer", this.apiHost);
        return map;
    }

    private String getJsonString(JsonObject jsonObject, String str) {
        return (jsonObject == null || !jsonObject.has(str) || jsonObject.get(str).isJsonNull()) ? "" : jsonObject.get(str).getAsString();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public int getQualityValue(String str) {
        if (str == null) {
            return 0;
        }
        String upperCase = str.toUpperCase();
        if (upperCase.contains("4K") || upperCase.contains("2160")) {
            return 2160;
        }
        if (upperCase.contains("1080")) {
            return 1080;
        }
        if (upperCase.contains("720")) {
            return 720;
        }
        if (upperCase.contains("480")) {
            return 480;
        }
        if (upperCase.contains("360")) {
            return 360;
        }
        try {
            return Integer.parseInt(upperCase.replaceAll("[^0-9]", ""));
        } catch (Exception unused) {
            return 0;
        }
    }

    private byte[] hexToBytes(String str) {
        int length = str.length();
        byte[] bArr = new byte[length / 2];
        for (int i = 0; i < length; i += 2) {
            bArr[i / 2] = (byte) ((Character.digit(str.charAt(i), 16) << 4) + Character.digit(str.charAt(i + 1), 16));
        }
        return bArr;
    }

    private String md5(String str) {
        try {
            StringBuilder sb = new StringBuilder(new BigInteger(1, MessageDigest.getInstance("MD5").digest(str.getBytes(StandardCharsets.UTF_8))).toString(16));
            while (sb.length() < 32) {
                sb.insert(0, "0");
            }
            return sb.toString().toUpperCase();
        } catch (Exception unused) {
            return "";
        }
    }

    private List<m> parseVodList(JsonObject jsonObject) {
        ArrayList arrayList = new ArrayList();
        if (!jsonObject.has("list")) {
            return arrayList;
        }
        Iterator<JsonElement> it = jsonObject.getAsJsonArray("list").iterator();
        while (it.hasNext()) {
            JsonObject asJsonObject = it.next().getAsJsonObject();
            m mVar = new m();
            mVar.n(getJsonString(asJsonObject, "vod_id"));
            mVar.o(getJsonString(asJsonObject, "vod_name"));
            mVar.p(getJsonString(asJsonObject, "vod_pic") + "@User-Agent=Dalvik/2.1.0");
            mVar.s(getJsonString(asJsonObject, "vod_scroe"));
            if (asJsonObject.has("vod_continu")) {
                String jsonString = getJsonString(asJsonObject, "vod_continu");
                String jsonString2 = getJsonString(asJsonObject, "d_total");
                if ("0".equals(jsonString2) || "0".equals(jsonString)) {
                    mVar.s(getJsonString(asJsonObject, "vod_year"));
                } else if (jsonString.equals(jsonString2)) {
                    mVar.s("全" + jsonString2 + "集");
                } else {
                    mVar.s("更新至" + jsonString + "集");
                }
            }
            arrayList.add(mVar);
        }
        return arrayList;
    }

    private String rsaDecrypt(String str, String str2) throws InvalidKeySpecException, NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException {
        PrivateKey privateKeyGeneratePrivate = KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.decode(str2.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace("-----BEGIN RSA PRIVATE KEY-----", "").replace("-----END RSA PRIVATE KEY-----", "").replaceAll("\\s", ""), 2)));
        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(2, privateKeyGeneratePrivate);
        return new String(cipher.doFinal(Base64.decode(str, 2)), StandardCharsets.UTF_8);
    }

    @Override // com.github.catvod.crawler.Spider
    public String categoryContent(String str, String str2, boolean z, HashMap<String, String> map) {
        String str3;
        HashMap map2 = new HashMap();
        map2.put("tid", str);
        map2.put("page", str2);
        map2.put("pageSize", "30");
        String str4 = "0";
        map2.put("area", map.containsKey("area") ? map.get("area") : "0");
        map2.put("year", map.containsKey("year") ? map.get("year") : "0");
        map2.put("sort", map.containsKey("sort") ? map.get("sort") : "d_id");
        if (!map.containsKey("sub")) {
            Map<String, String> map3 = SUB_MAP;
            if (map3.containsKey(str)) {
                str3 = map3.get(str);
            }
            map2.put("sub", str4);
            return g.v(parseVodList(apiRequest("/App/IndexList/indexList", map2, 0)));
        }
        str3 = map.get("sub");
        str4 = str3;
        map2.put("sub", str4);
        return g.v(parseVodList(apiRequest("/App/IndexList/indexList", map2, 0)));
    }

    @Override // com.github.catvod.crawler.Spider
    public String detailContent(List<String> list) throws Exception {
        String str = list.get(0);
        HashMap map = new HashMap();
        map.put("token_id", "1009464");
        map.put("vod_id", str);
        map.put("mobile_time", String.valueOf(System.currentTimeMillis() / 1000));
        map.put("token", this.token);
        HashMap map2 = new HashMap();
        map2.put("vurl_cloud_id", "2");
        map2.put("vod_d_id", str);
        JsonObject jsonObjectApiRequest = apiRequest("/App/IndexPlay/playInfo", map, 0);
        JsonObject jsonObjectApiRequest2 = apiRequest("/App/Resource/Vurl/show", map2, 0);
        JsonObject asJsonObject = jsonObjectApiRequest.getAsJsonObject("vodInfo");
        m mVar = new m();
        mVar.n(str);
        mVar.o(getJsonString(asJsonObject, "vod_name"));
        mVar.p(getJsonString(asJsonObject, "vod_pic") + "@User-Agent=Dalvik/2.1.0");
        mVar.u(getJsonString(asJsonObject, "vod_year"));
        mVar.k(getJsonString(asJsonObject, "vod_area"));
        mVar.j(getJsonString(asJsonObject, "vod_actor"));
        mVar.m(getJsonString(asJsonObject, "vod_director"));
        mVar.l(getJsonString(asJsonObject, "vod_use_content").replace("\u3000", "\n").trim());
        HashMap map3 = new HashMap();
        ArrayList<String> arrayList = new ArrayList();
        if (jsonObjectApiRequest2.has("list") && jsonObjectApiRequest2.get("list").isJsonArray()) {
            JsonArray asJsonArray = jsonObjectApiRequest2.getAsJsonArray("list");
            for (int i = 0; i < asJsonArray.size(); i++) {
                JsonObject asJsonObject2 = asJsonArray.get(i).getAsJsonObject().getAsJsonObject("play");
                String jsonString = asJsonArray.size() == 1 ? getJsonString(asJsonObject, "vod_name") : String.valueOf(i + 1);
                for (Map.Entry<String, JsonElement> entry : asJsonObject2.entrySet()) {
                    String key = entry.getKey();
                    JsonObject asJsonObject3 = entry.getValue().getAsJsonObject();
                    if (asJsonObject3.has("param") && !asJsonObject3.get("param").isJsonNull()) {
                        String jsonString2 = getJsonString(asJsonObject3, "param");
                        if (!jsonString2.isEmpty()) {
                            if (!map3.containsKey(key)) {
                                map3.put(key, new ArrayList());
                                arrayList.add(key);
                            }
                            ((List) map3.get(key)).add(jsonString + "$" + jsonString2 + "||" + key);
                        }
                    }
                }
            }
        }
        Collections.sort(arrayList, new Comparator<String>() { // from class: com.github.catvod.spider.Guazi.1
            @Override // java.util.Comparator
            public int compare(String str2, String str3) {
                return Guazi.this.getQualityValue(str3) - Guazi.this.getQualityValue(str2);
            }
        });
        ArrayList arrayList2 = new ArrayList();
        ArrayList arrayList3 = new ArrayList();
        for (String str2 : arrayList) {
            arrayList2.add(str2);
            arrayList3.add(TextUtils.join("#", (Iterable) map3.get(str2)));
        }
        String strJoin = TextUtils.join("$$$", arrayList3);
        mVar.q(TextUtils.join("$$$", arrayList2));
        mVar.r(strJoin);
        AbstractC0614r1.o(getJsonString(asJsonObject, "vod_name"));
        AbstractC0614r1.p(strJoin);
        return g.t(FishCrypto.applyContent(mVar));
    }

    @Override // com.github.catvod.crawler.Spider
    public String homeContent(boolean z) {
        ArrayList arrayList = new ArrayList();
        arrayList.add(new b("1", "电影"));
        arrayList.add(new b("2", "国产剧"));
        arrayList.add(new b("4", "动漫"));
        arrayList.add(new b("64", "短剧"));
        arrayList.add(new b("3", "综艺"));
        arrayList.add(new b("5", "海外剧"));
        return g.i().a(arrayList).s();
    }

    @Override // com.github.catvod.crawler.Spider
    public String homeVideoContent() throws Exception {
        HashMap map = new HashMap();
        map.put("pid", "1");
        JsonObject jsonObjectApiRequest = apiRequest("/App/IndexList/index", map, 0);
        JsonArray asJsonArray = jsonObjectApiRequest.has("list") ? jsonObjectApiRequest.getAsJsonArray("list") : null;
        ArrayList arrayList = new ArrayList();
        if (asJsonArray != null) {
            if (asJsonArray.size() > 1) {
                for (int i = 1; i < asJsonArray.size(); i++) {
                    arrayList.addAll(parseVodList(asJsonArray.get(i).getAsJsonObject()));
                }
            }
        }
        return g.v(arrayList);
    }

    @Override // com.github.catvod.crawler.Spider
    public void init(Context context, String str) {
        this.apiHost = findAvailableHost();
        this.extConfig = str;
        Map<String, String> map = SUB_MAP;
        map.put("1", "5");
        map.put("2", "12");
        map.put("3", "30");
        map.put("4", "22");
        map.put("64", "");
    }

    @Override // com.github.catvod.crawler.Spider
    public String playerContent(String str, String str2, List<String> list) throws Exception {
        String strM = AbstractC0614r1.m(str, str2);
        String[] strArrSplit = str2.split("\\|\\|");
        String[] strArrSplit2 = strArrSplit[0].split("&");
        if (strArrSplit.length > 1) {
            str = strArrSplit[1];
        }
        HashMap map = new HashMap();
        for (String str3 : strArrSplit2) {
            String[] strArrSplit3 = str3.split("=");
            if (strArrSplit3.length == 2) {
                map.put(strArrSplit3[0].equals("vod_d_id") ? "vod_id" : strArrSplit3[0], strArrSplit3[1]);
            }
        }
        map.put("resolution", str);
        JsonObject jsonObjectApiRequest = apiRequest("/App/Resource/VurlDetail/showOne", map, 0);
        String asString = jsonObjectApiRequest.has("url") ? jsonObjectApiRequest.get("url").getAsString() : "";
        HashMap map2 = new HashMap();
        map2.put("User-Agent", "Lavf/57.83.100");
        map2.put("Referer", "http://WJiZxLXA2.com/");
        return g.i().E(asString).j(map2).b(strM).s();
    }

    @Override // com.github.catvod.crawler.Spider
    public String searchContent(String str, boolean z) {
        return searchContent(str, z, "1");
    }

    @Override // com.github.catvod.crawler.Spider
    public String searchContent(String str, boolean z, String str2) {
        HashMap map = new HashMap();
        map.put("keywords", str);
        map.put("order_val", "1");
        return g.v(parseVodList(apiRequest("/App/Index/findMoreVod", map, 0)));
    }
}
