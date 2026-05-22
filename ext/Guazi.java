package com.github.catvod.spider;

import android.content.Context;
import android.text.TextUtils;
import android.util.Base64;

import com.github.catvod.bean.Class;
import com.github.catvod.bean.Result;
import com.github.catvod.bean.Vod;
import com.github.catvod.crawler.Spider;
import com.github.catvod.net.OkHttp;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * 瓜子APP Spider — 对齐 Python 版参数
 */
public class Guazi extends Spider {

    private static final String AES_KEY = "mvXBSW7ekreItNsT";
    private static final String AES_IV  = "2U3IrJL8szAKp0Fj";

    private static final String FIXED_KEYS =
            "Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0i" +
            "KF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjT" +
            "aaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=";

    private static final String TOKEN =
            "1be86e8e18a9fa18b2b8d5432699dad0" +
            ".ac008ed650fd087bfbecf2fda9d82e98" +
            "35253ef24843e6b18fcd128b10763497" +
            "bcf9d53e959f5377cde038c20ccf9d17" +
            "f604c9b8bb6e61041def86729b2fc740" +
            "8bd241e23c213ac57f0226ee656e2bb0" +
            "a583ae0e4f3bf6c6ab6c490c9a6f0d8c" +
            "dfd366aacf5d83193671a8f77cd1af1f" +
            "f2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c" +
            ".59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79";

    private static final String RSA_PRIVATE_KEY =
            "-----BEGIN PRIVATE KEY-----\n" +
            "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1\n" +
            "ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU\n" +
            "1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcK\n" +
            "ZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7\n" +
            "HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcW\n" +
            "V9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdI\n" +
            "DblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34\n" +
            "saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVM\n" +
            "iMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUM\n" +
            "WBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8\n" +
            "jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZ\n" +
            "K7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1b\n" +
            "L3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oa\n" +
            "t5lYKfpe8k83ZA==\n" +
            "-----END PRIVATE KEY-----";

    private static final String API_HOST = "https://api.w32z7vtd.com";

    private String token;
    private String extConfig;

    private static final Map<String, String> SUB_MAP = new HashMap<>();
    static {
        SUB_MAP.put("1", "5");
        SUB_MAP.put("2", "12");
        SUB_MAP.put("3", "30");
        SUB_MAP.put("4", "22");
        SUB_MAP.put("64", "");
    }

    // ===================== AES / RSA 工具 =====================

    private byte[] aesEncrypt(byte[] data, byte[] key, byte[] iv) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, new IvParameterSpec(iv));
        return cipher.doFinal(data);
    }

    private byte[] aesDecrypt(byte[] data, byte[] key, byte[] iv) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, keySpec, new IvParameterSpec(iv));
        return cipher.doFinal(data);
    }

    private String rsaDecryptNoPadding(String b64Data, String privateKeyPem) throws Exception {
        String keyBase64 = privateKeyPem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        PrivateKey privateKey = KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(Base64.decode(keyBase64, Base64.DEFAULT)));

        byte[] encrypted = Base64.decode(b64Data, Base64.DEFAULT);
        int blockSize = 128;

        Cipher cipher = Cipher.getInstance("RSA/ECB/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);

        StringBuilder result = new StringBuilder();
        for (int i = 0; i < encrypted.length; i += blockSize) {
            byte[] chunk = new byte[blockSize];
            int len = Math.min(blockSize, encrypted.length - i);
            System.arraycopy(encrypted, i, chunk, 0, len);

            byte[] decrypted = cipher.doFinal(chunk);

            int start = 0;
            while (start < decrypted.length && decrypted[start] == 0) {
                start++;
            }

            int sep = -1;
            for (int j = start + 1; j < decrypted.length; j++) {
                if (decrypted[j] == 0) {
                    sep = j;
                    break;
                }
            }

            byte[] dataBytes;
            if (sep >= 0 && sep < decrypted.length - 1) {
                dataBytes = new byte[decrypted.length - sep - 1];
                System.arraycopy(decrypted, sep + 1, dataBytes, 0, dataBytes.length);
            } else {
                dataBytes = new byte[decrypted.length - start];
                System.arraycopy(decrypted, start, dataBytes, 0, dataBytes.length);
            }
            result.append(new String(dataBytes, StandardCharsets.UTF_8));
        }
        return result.toString().trim();
    }

    // ===================== 网络请求 =====================

    private Map<String, String> getHeaders() {
        HashMap<String, String> map = new HashMap<>();
        map.put("Cache-Control", "no-cache");
        map.put("Version", "2406025");
        map.put("PackageName", "com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f");
        map.put("Ver", "1.9.2");
        map.put("Referer", API_HOST);
        map.put("Content-Type", "application/x-www-form-urlencoded");
        map.put("User-Agent", "okhttp/3.12.0");
        return map;
    }

    private String md5(String str) {
        try {
            byte[] digest = MessageDigest.getInstance("MD5").digest(str.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(new BigInteger(1, digest).toString(16));
            while (sb.length() < 32) {
                sb.insert(0, "0");
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(b & 0xFF);
            if (hex.length() == 1) sb.append('0');
            sb.append(hex);
        }
        return sb.toString();
    }

    private byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] bytes = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            bytes[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return bytes;
    }

    private JsonObject apiRequest(String path, Map<String, String> dataMap) throws Exception {
        StringBuilder jsonBuilder = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : dataMap.entrySet()) {
            if (!first) jsonBuilder.append(",");
            jsonBuilder.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\"");
            first = false;
        }
        jsonBuilder.append("}");
        String jsonStr = jsonBuilder.toString();

        String requestKey = bytesToHex(
                aesEncrypt(jsonStr.getBytes(StandardCharsets.UTF_8),
                        AES_KEY.getBytes(), AES_IV.getBytes())
        ).toUpperCase();

        String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
        String signStr = "token_id=,token=" + this.token
                + ",phone_type=1,request_key=" + requestKey
                + ",app_id=1,time=" + timestamp
                + ",keys=" + FIXED_KEYS
                + "*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br";
        String signature = md5(signStr);

        FormBody body = new FormBody.Builder()
                .add("token", this.token)
                .add("token_id", "")
                .add("phone_type", "1")
                .add("time", timestamp)
                .add("phone_model", "xiaomi-22021211rc")
                .add("keys", FIXED_KEYS)
                .add("request_key", requestKey)
                .add("signature", signature)
                .add("app_id", "1")
                .add("ad_version", "1")
                .build();

        Request.Builder reqBuilder = new Request.Builder()
                .url(API_HOST + path)
                .post(body);
        for (Map.Entry<String, String> h : getHeaders().entrySet()) {
            reqBuilder.addHeader(h.getKey(), h.getValue());
        }

        Response response = new OkHttpClient().newCall(reqBuilder.build()).execute();
        String resText = response.body() != null ? response.body().string() : "";
        if (resText.isEmpty()) {
            throw new Exception("空响应");
        }

        JsonObject resJson = JsonParser.parseString(resText).getAsJsonObject();

        JsonObject dataObj = resJson.getAsJsonObject("data");
        if (dataObj == null) {
            throw new Exception("API 无 data 字段: " + resText.substring(0, Math.min(100, resText.length())));
        }

        String keysEncrypted = getJsonString(dataObj, "keys");
        String keysJson = rsaDecryptNoPadding(keysEncrypted, RSA_PRIVATE_KEY);
        JsonObject keysObj = JsonParser.parseString(keysJson).getAsJsonObject();

        String aesKeyStr = keysObj.get("key").getAsString();
        String aesIvStr  = keysObj.get("iv").getAsString();

        String responseHex = getJsonString(dataObj, "response_key");
        byte[] decrypted = aesDecrypt(hexToBytes(responseHex),
                aesKeyStr.getBytes(StandardCharsets.UTF_8),
                aesIvStr.getBytes(StandardCharsets.UTF_8));

        return JsonParser.parseString(new String(decrypted, StandardCharsets.UTF_8)).getAsJsonObject();
    }

    // ===================== 工具方法 =====================

    private String getJsonString(JsonObject obj, String key) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) return "";
        return obj.get(key).getAsString();
    }

    private int getQualityValue(String str) {
        if (str == null) return 0;
        String upper = str.toUpperCase();
        if (upper.contains("4K") || upper.contains("2160")) return 2160;
        if (upper.contains("1080")) return 1080;
        if (upper.contains("720")) return 720;
        if (upper.contains("480")) return 480;
        if (upper.contains("360")) return 360;
        try { return Integer.parseInt(upper.replaceAll("[^0-9]", "")); }
        catch (Exception e) { return 0; }
    }

    private List<Vod> parseVodList(JsonObject data) {
        ArrayList<Vod> list = new ArrayList<>();
        if (!data.has("list")) return list;
        for (JsonElement el : data.getAsJsonArray("list")) {
            JsonObject item = el.getAsJsonObject();
            Vod vod = new Vod();
            vod.setVodId(getJsonString(item, "vod_id"));
            vod.setVodName(getJsonString(item, "vod_name"));
            vod.setVodPic(getJsonString(item, "vod_pic") + "@User-Agent=Dalvik/2.1.0");

            if (item.has("vod_continu")) {
                String continu = getJsonString(item, "vod_continu");
                String total = getJsonString(item, "d_total");
                if ("0".equals(total) || "0".equals(continu)) {
                    vod.setVodRemarks(getJsonString(item, "vod_year"));
                } else if (continu.equals(total)) {
                    vod.setVodRemarks("全" + total + "集");
                } else {
                    vod.setVodRemarks("更新至" + continu + "集");
                }
            } else {
                vod.setVodRemarks(getJsonString(item, "vod_scroe"));
            }
            list.add(vod);
        }
        return list;
    }

    // ===================== Spider 接口 =====================

    @Override
    public void init(Context context, String str) {
        this.token = TOKEN;
        this.extConfig = str;
    }

    @Override
    public String homeContent(boolean filter) {
        List<Class> classes = new ArrayList<>();
        classes.add(new Class("1", "电影"));
        classes.add(new Class("2", "电视剧"));
        classes.add(new Class("4", "动漫"));
        classes.add(new Class("3", "综艺"));
        classes.add(new Class("64", "短剧"));

        return Result.string(classes, new JsonObject());
    }

    @Override
    public String homeVideoContent() throws Exception {
        HashMap<String, String> params = new HashMap<>();
        params.put("area", "0");
        params.put("year", "0");
        params.put("pageSize", "100");
        params.put("sort", "d_id");
        params.put("page", "1");

        JsonObject data = apiRequest("/App/IndexList/indexList", params);
        return Result.string(parseVodList(data));
    }

    @Override
    public String categoryContent(String tid, String pg, boolean filter, HashMap<String, String> extend) throws Exception {
        HashMap<String, String> params = new HashMap<>();
        params.put("tid", tid);
        params.put("page", pg);
        params.put("pageSize", "20");
        params.put("area", extend.containsKey("area") ? extend.get("area") : "0");
        params.put("year", extend.containsKey("year") ? extend.get("year") : "0");
        params.put("sort", extend.containsKey("sort") ? extend.get("sort") : "d_id");

        if (extend.containsKey("sub")) {
            params.put("sub", extend.get("sub"));
        } else if (SUB_MAP.containsKey(tid)) {
            String sub = SUB_MAP.get(tid);
            if (!sub.isEmpty()) {
                params.put("sub", sub);
            }
        }

        JsonObject data = apiRequest("/App/IndexList/indexList", params);
        return Result.string(parseVodList(data));
    }

    @Override
    public String detailContent(List<String> list) throws Exception {
        String vodId = list.get(0);

        HashMap<String, String> params1 = new HashMap<>();
        params1.put("token_id", "1649412");
        params1.put("vod_id", vodId);
        params1.put("mobile_time", String.valueOf(System.currentTimeMillis() / 1000));
        params1.put("token", this.token);

        HashMap<String, String> params2 = new HashMap<>();
        params2.put("vurl_cloud_id", "2");
        params2.put("vod_d_id", vodId);

        JsonObject detailData = apiRequest("/App/IndexPlay/playInfo", params1);
        JsonObject playData   = apiRequest("/App/Resource/Vurl/show", params2);

        JsonObject vodInfo = detailData.has("vodInfo") ? detailData.getAsJsonObject("vodInfo") : new JsonObject();

        Vod vod = new Vod();
        vod.setVodId(vodId);
        vod.setVodName(getJsonString(vodInfo, "vod_name"));
        vod.setVodPic(getJsonString(vodInfo, "vod_pic") + "@User-Agent=Dalvik/2.1.0");
        vod.setVodYear(getJsonString(vodInfo, "vod_year"));
        vod.setVodArea(getJsonString(vodInfo, "vod_area"));
        vod.setVodActor(getJsonString(vodInfo, "vod_actor"));
        vod.setVodContent(getJsonString(vodInfo, "vod_use_content").replace("\u3000", "\n").trim());

        HashMap<String, List<String>> playMap = new HashMap<>();
        ArrayList<String> playFlags = new ArrayList<>();

        if (playData.has("list") && playData.get("list").isJsonArray()) {
            JsonArray episodes = playData.getAsJsonArray("list");
            for (int i = 0; i < episodes.size(); i++) {
                JsonObject epObj = episodes.get(i).getAsJsonObject();
                if (!epObj.has("play")) continue;

                JsonObject playObj = epObj.getAsJsonObject("play");
                String epName = episodes.size() == 1 ? getJsonString(vodInfo, "vod_name") : String.valueOf(i + 1);

                ArrayList<String> resolutions = new ArrayList<>();
                ArrayList<String> urlParams = new ArrayList<>();
                for (Map.Entry<String, JsonElement> entry : playObj.entrySet()) {
                    JsonObject resObj = entry.getValue().getAsJsonObject();
                    if (resObj.has("param") && !resObj.get("param").isJsonNull()) {
                        String param = getJsonString(resObj, "param");
                        if (!param.isEmpty()) {
                            resolutions.add(entry.getKey());
                            urlParams.add(param);
                        }
                    }
                }

                if (!urlParams.isEmpty()) {
                    resolutions.sort((a, b) -> getQualityValue(b) - getQualityValue(a));
                    String playUrl = urlParams.get(0) + "||" + String.join("@", resolutions);
                    String playEntry = epName + "$" + playUrl;

                    String flagName = "瓜子专线";
                    if (!playMap.containsKey(flagName)) {
                        playMap.put(flagName, new ArrayList<>());
                        playFlags.add(flagName);
                    }
                    playMap.get(flagName).add(playEntry);
                }
            }
        }

        ArrayList<String> playUrls = new ArrayList<>();
        for (String flag : playFlags) {
            playUrls.add(TextUtils.join("#", playMap.get(flag)));
        }
        vod.setVodPlayFrom(TextUtils.join("$$", playFlags));
        vod.setVodPlayUrl(TextUtils.join("$$$$$", playUrls));

        return Result.string(vod);
    }

    @Override
    public String searchContent(String key, boolean quick) {
        return searchContent(key, quick, "1");
    }

    @Override
    public String searchContent(String key, boolean quick, String pg) {
        try {
            HashMap<String, String> params = new HashMap<>();
            params.put("keywords", key);
            params.put("order_val", "1");
            params.put("page", pg);

            JsonObject data = apiRequest("/App/Index/findMoreVod", params);
            return Result.string(parseVodList(data));
        } catch (Exception e) {
            return Result.string(new ArrayList<>());
        }
    }

    @Override
    public String playerContent(String flag, String id, List<String> vipFlags) throws Exception {
        String[] parts = id.split("\\|\\|");
        String paramStr = parts[0];
        String resolution = parts.length > 1 ? parts[1] : "";

        HashMap<String, String> params = new HashMap<>();
        for (String pair : paramStr.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2 && !kv[0].isEmpty()) {
                params.put(kv[0].equals("vod_d_id") ? "vod_id" : kv[0], kv[1]);
            }
        }
        params.put("resolution", resolution);

        JsonObject data = apiRequest("/App/Resource/VurlDetail/showOne", params);
        String url = data.has("url") ? data.get("url").getAsString() : "";

        HashMap<String, String> headers = new HashMap<>();
        headers.put("User-Agent", "okhttp/3.12.0");

        return Result.get().url(url).header(headers).string();
    }
}
