package com.github.catvod.spider;

import android.content.Context;
import android.util.Base64;
import com.github.catvod.crawler.Spider;
import com.github.catvod.crawler.SpiderDebug;
import com.github.catvod.spider.merga.C.e;
import com.github.catvod.spider.merga.RC;
import com.github.catvod.spider.merga.U.C0634g;
import com.github.catvod.spider.merga.V.a;
import com.github.catvod.spider.merga.V.b;
import com.github.catvod.spider.merga.aB.Rc;
import com.github.catvod.spider.merga.aB.gU;
import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import okhttp3.Call;
import okhttp3.Response;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/* loaded from: classes.dex */
public class XBPQ extends Spider {
    private static String y;
    private String F;
    private String K;
    private String cT;
    private int v;
    private static final byte[] T6 = {-17, -69, -65};
    private static HashMap<String, String> zL = null;
    private boolean H = false;
    private boolean j = false;
    private boolean s = false;
    private boolean OG = false;
    private boolean f = false;
    private List<String> zt = null;
    private boolean m = false;
    private int R = 0;
    protected JSONObject xf = null;
    private boolean kg = false;
    private String Z = "";
    private String bY = "";
    private boolean ZT = false;

    private String E(String str, String str2, String str3, String str4, String str5, String str6) {
        return o(str, o(str2, o(str3, o(str4, o(str5, str6)))));
    }

    private JSONArray F(String str, String str2, String str3, String str4, String str5) {
        String str6;
        try {
            JSONArray jSONArray = new JSONArray();
            if (str.contains("$")) {
                jSONArray.put(T6("cateId", "类型", str));
            }
            if (str2.contains("$")) {
                jSONArray.put(T6("class", "剧情", str2));
            }
            if (str3.contains("$")) {
                jSONArray.put(T6("area", "地区", str3));
            }
            if (str4.contains("-") && !str4.contains("--")) {
                int parseInt = Integer.parseInt(str4.split("-")[1]);
                int parseInt2 = Integer.parseInt(str4.split("-")[0]);
                if (parseInt2 > parseInt) {
                    parseInt2 = parseInt;
                    parseInt = parseInt2;
                }
                str4 = "";
                while (parseInt >= parseInt2) {
                    if (parseInt == parseInt2) {
                        str6 = str4 + String.valueOf(parseInt) + "$" + String.valueOf(parseInt);
                    } else {
                        str6 = str4 + String.valueOf(parseInt) + "$" + String.valueOf(parseInt) + "#";
                    }
                    str4 = str6;
                    parseInt--;
                }
            }
            if (str4.contains("$")) {
                jSONArray.put(T6("year", "年份", str4));
            }
            if (str5.contains("$")) {
                jSONArray.put(T6("by", "排序", str5));
            }
            if (this.K.equals("筛选array")) {
                this.cT = jSONArray.toString();
            }
            return jSONArray;
        } catch (Exception e) {
            SpiderDebug.log(e);
            return null;
        }
    }

    /*  JADX ERROR: JadxRuntimeException in pass: BlockProcessor
        jadx.core.utils.exceptions.JadxRuntimeException: Unreachable block: B:239:0x0772
        	at jadx.core.dex.visitors.blocks.BlockProcessor.checkForUnreachableBlocks(BlockProcessor.java:92)
        	at jadx.core.dex.visitors.blocks.BlockProcessor.processBlocksTree(BlockProcessor.java:52)
        	at jadx.core.dex.visitors.blocks.BlockProcessor.visit(BlockProcessor.java:44)
        */
    private org.json.JSONObject H(java.lang.String r37, java.lang.String r38, boolean r39, java.util.HashMap<java.lang.String, java.lang.String> r40) {
        /*
            Method dump skipped, instructions count: 3239
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.github.catvod.spider.XBPQ.H(java.lang.String, java.lang.String, boolean, java.util.HashMap):org.json.JSONObject");
    }

    private String Hg(String str, String str2, String str3) {
        return o(str, o(str2, str3));
    }

    private String Mm(String str, String str2, String str3, String str4, String str5, String str6, String str7) {
        return o(str, o(str2, o(str3, o(str4, o(str5, o(str6, str7))))));
    }

    private String NF(String str, String str2) {
        if (str2.equals("*") || str2.isEmpty()) {
            str2 = str;
        }
        String[] split = str.split("\\&");
        String[] split2 = str2.split("\\&");
        int i = 0;
        String str3 = "";
        while (i < split.length) {
            str3 = str3 + split[i] + "$" + split2[i] + (i < split.length + (-1) ? "#" : "");
            i++;
        }
        return str3;
    }

    private String NW(String str, String str2) {
        if (str2.length() < 0) {
            return "";
        }
        if (!str2.contains("*")) {
            return hT(str2);
        }
        Matcher matcher = Pattern.compile(v(hT(str2.split("\\*")[0])) + "([\\S\\s]*?)" + v(hT(str2.split("\\*")[1]))).matcher(str);
        return matcher.find() ? matcher.group(1) : "";
    }

    /* JADX WARN: Removed duplicated region for block: B:38:0x0108 A[Catch: Exception -> 0x0223, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /* JADX WARN: Removed duplicated region for block: B:41:0x0118 A[Catch: Exception -> 0x0223, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /* JADX WARN: Removed duplicated region for block: B:43:0x0127 A[Catch: Exception -> 0x0223, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /* JADX WARN: Removed duplicated region for block: B:61:0x0180 A[Catch: Exception -> 0x0223, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /* JADX WARN: Removed duplicated region for block: B:64:0x0190 A[Catch: Exception -> 0x0223, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /* JADX WARN: Removed duplicated region for block: B:65:0x019d A[Catch: Exception -> 0x0223, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /* JADX WARN: Removed duplicated region for block: B:72:0x01ba A[Catch: Exception -> 0x0223, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /* JADX WARN: Removed duplicated region for block: B:73:0x01c7 A[Catch: Exception -> 0x0223, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /* JADX WARN: Removed duplicated region for block: B:81:0x01ea A[Catch: Exception -> 0x0223, LOOP:3: B:79:0x01e4->B:81:0x01ea, LOOP_END, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /* JADX WARN: Removed duplicated region for block: B:84:0x021c A[Catch: Exception -> 0x0223, TRY_LEAVE, TryCatch #0 {Exception -> 0x0223, blocks: (B:3:0x0006, B:6:0x0016, B:7:0x0026, B:10:0x0038, B:11:0x0044, B:13:0x004f, B:14:0x0051, B:17:0x006f, B:19:0x0082, B:21:0x008a, B:23:0x0090, B:25:0x0096, B:27:0x009c, B:29:0x00b1, B:31:0x00ca, B:33:0x00d6, B:34:0x00f7, B:36:0x00fe, B:38:0x0108, B:39:0x010a, B:41:0x0118, B:43:0x0127, B:45:0x012d, B:47:0x0133, B:49:0x0139, B:51:0x013f, B:52:0x0142, B:54:0x014a, B:56:0x0156, B:57:0x016d, B:59:0x0176, B:61:0x0180, B:62:0x0182, B:64:0x0190, B:65:0x019d, B:67:0x01a3, B:70:0x01ab, B:72:0x01ba, B:73:0x01c7, B:75:0x01cd, B:78:0x01d5, B:79:0x01e4, B:81:0x01ea, B:82:0x0212, B:84:0x021c), top: B:89:0x0006 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private org.json.JSONObject R() {
        /*
            Method dump skipped, instructions count: 553
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.github.catvod.spider.XBPQ.R():org.json.JSONObject");
    }

    private ArrayList<String> Rn(String str, String str2, String str3) {
        if (!str2.contains("+")) {
            return gn(str, str2, str3);
        }
        String[] split = str2.split("\\+");
        ArrayList<String> arrayList = new ArrayList<>();
        String str4 = "";
        for (int i = 0; i < split.length; i++) {
            str4 = str4 + gn(str, split[i], "").get(0);
        }
        arrayList.add(str4);
        return arrayList;
    }

    private String S(String str) {
        if (str.contains("左括号")) {
            str = str.replaceAll("左括号", "[");
        }
        return str.contains("右括号") ? str.replaceAll("右括号", "]") : str;
    }

    private JSONObject T6(String str, String str2, String str3) {
        String[] split;
        try {
            JSONObject jSONObject = new JSONObject();
            JSONArray jSONArray = new JSONArray();
            if (!str.equals("by") && !str.equals("cateId")) {
                jSONObject.put("n", "全部");
                jSONObject.put("v", "");
                jSONArray.put(jSONObject);
                jSONObject = new JSONObject();
                if (str3.contains("--")) {
                    str3 = str3.split("--")[1];
                }
            }
            if (str.equals("cateId")) {
                jSONObject.put("n", "全部");
                jSONObject.put("v", str3.split("--")[0]);
                jSONArray.put(jSONObject);
                jSONObject = new JSONObject();
                if (str3.contains("--")) {
                    str3 = str3.split("--")[1];
                }
            }
            if (str3.contains("#")) {
                for (String str4 : str3.split("#")) {
                    jSONObject.put("n", str4.split("\\$")[0]);
                    jSONObject.put("v", str4.split("\\$")[1]);
                    jSONArray.put(jSONObject);
                    jSONObject = new JSONObject();
                }
            } else {
                jSONObject.put("n", str3.split("\\$")[0]);
                jSONObject.put("v", str3.split("\\$")[1]);
                jSONArray.put(jSONObject);
            }
            JSONObject jSONObject2 = new JSONObject();
            jSONObject2.put("key", str);
            jSONObject2.put("name", str2);
            jSONObject2.put("value", jSONArray);
            return jSONObject2;
        } catch (Exception e) {
            SpiderDebug.log(e);
            return null;
        }
    }

    private String Vb(String str) {
        return str.contains("连接符") ? str.replaceAll("连接符", "&") : str;
    }

    private JSONArray Z(String str, String str2) {
        if (str2.contains("&&") || str2.length() < 1) {
            str2 = "data";
        }
        try {
            String str3 = "";
            if (str2.contains("[")) {
                String replaceAll = str2.replaceAll(".*\\[(.*?)\\].*", "$1");
                str2 = str2.replaceAll("\\[.*", str3);
                str3 = replaceAll;
            }
            String[] split = str2.split("\\.");
            int i = 0;
            for (int i2 = 0; i2 < split.length; i2++) {
                JSONObject jSONObject = new JSONObject(str);
                if (i2 == split.length - 1) {
                    JSONArray jSONArray = jSONObject.getJSONArray(split[i2]);
                    JSONArray jSONArray2 = new JSONArray();
                    int length = jSONArray.length();
                    if (str3 == null || str3.length() <= 0) {
                        return jSONArray;
                    }
                    if (!str3.contains(",") && str3.matches("\\d+")) {
                        if (length > Integer.parseInt(str3)) {
                            length = Integer.parseInt(str3);
                        }
                        i = length - 1;
                    } else {
                        String replaceAll2 = str3.replaceAll("(.*),.*", "$1");
                        String replaceAll3 = str3.replaceAll(".*,(.*)", "$1");
                        if (replaceAll3 != null && replaceAll3.length() > 0 && replaceAll3.matches("\\d+") && Integer.parseInt(replaceAll3) < length) {
                            length = Integer.parseInt(replaceAll3);
                        }
                        if (replaceAll2 != null && replaceAll2.length() > 0 && replaceAll2.matches("\\d+") && Integer.parseInt(replaceAll2) <= length) {
                            i = Integer.parseInt(replaceAll2) - 1;
                        }
                    }
                    while (i < length) {
                        jSONArray2.put(jSONArray.getJSONObject(i));
                        i++;
                    }
                    return jSONArray2;
                }
                str = jSONObject.getJSONObject(split[i2]).toString();
            }
            return null;
        } catch (JSONException e) {
            SpiderDebug.log(e);
            return null;
        }
    }

    private String ZT(String str, String str2) {
        try {
            if (str2.contains("&&") || str2.length() < 1) {
                str2 = "data";
            }
            if (!str2.contains("[")) {
                String[] split = str2.split("\\.");
                for (int i = 0; i < split.length; i++) {
                    JSONObject jSONObject = new JSONObject(str);
                    if (i == split.length - 1) {
                        String trim = jSONObject.optString(split[i]).trim();
                        return trim != null ? trim : "";
                    }
                    str = jSONObject.getJSONObject(split[i]).toString();
                }
            }
            return "";
        } catch (JSONException e) {
            SpiderDebug.log(e);
            return "";
        }
    }

    private static String b(String str) {
        Matcher matcher = Pattern.compile("(\\\\u(\\w{4}))").matcher(str);
        while (matcher.find()) {
            String group = matcher.group(1);
            str = str.replace(group, ((char) Integer.parseInt(matcher.group(2), 16)) + "");
        }
        return str.replaceAll("\\\\", "");
    }

    private String bY(String str, String str2) {
        try {
            if (str2.contains("&&") || str2.length() < 1) {
                str2 = "data";
            }
            if (!str2.contains("].")) {
                return ZT(str, str2);
            }
            String str3 = " ";
            String[] split = str2.split("\\]\\.");
            if (split.length > 2) {
                for (int i = 0; i < split.length - 2; i++) {
                    str = Z(str, split[i] + "]").getJSONObject(0).toString();
                }
            }
            String str4 = split[split.length - 1];
            String str5 = split[split.length - 2] + "]";
            if (str4.contains("(")) {
                str3 = str4.replaceAll(".*\\((.*?)\\).*", "$1");
                str4 = str4.replaceAll("\\(.*", "");
            }
            JSONArray Z = Z(str, str5);
            if (this.K.equals("json数组") && Z != null) {
                this.cT = Z.toString();
            }
            if (Z == null || Z.length() <= 0) {
                return "";
            }
            String str6 = "";
            for (int i2 = 0; i2 < Z.length(); i2++) {
                String jSONObject = Z.getJSONObject(i2).toString();
                if (i2 == Z.length() - 1) {
                    str3 = "";
                }
                str6 = str6 + ZT(jSONObject, str4) + str3;
            }
            if (this.K.equals("json字符")) {
                this.cT = str6;
            }
            return str6;
        } catch (JSONException e) {
            SpiderDebug.log(e);
            return "";
        }
    }

    /* JADX WARN: Multi-variable type inference failed */
    /* JADX WARN: Type inference failed for: r2v17 */
    /* JADX WARN: Type inference failed for: r2v2 */
    /* JADX WARN: Type inference failed for: r2v3 */
    private String cT() {
        String str;
        Exception e;
        String str2;
        JSONObject optJSONObject;
        String zL2 = zL("分类");
        try {
            if (zL2.contains("$")) {
                this.F = zL2;
                return zL2;
            }
            String str3 = "";
            if (zL("分类数组").contains("&&")) {
                try {
                    if (!zL("分类数组").startsWith("//")) {
                        if (this.H) {
                            this.H = false;
                            str2 = OG(zL("主页url"));
                            this.H = true;
                        } else {
                            str2 = OG(zL("主页url"));
                        }
                        String str4 = !zL("分类二次截取").isEmpty() ? Rn(str2, zL("分类二次截取"), str3).get(0) : str2;
                        if (!str4.isEmpty()) {
                            str2 = str4;
                        }
                        ArrayList<String> Rn = Rn(str2, zL("分类数组"), str3);
                        String str5 = str3;
                        for (int i = 0; i < Rn.size(); i++) {
                            if (!Rn.get(i).equals("不要")) {
                                String trim = Rn(Rn.get(i), zL("分类标题"), ">&&<").get(0).replaceAll("\\&[a-zA-Z]{1,10};", str3).replaceAll("<[^>]*>", str3).replaceAll("[(/>)<]", str3).trim();
                                String str6 = Rn(Rn.get(i), zL("分类ID"), "href=\"&&\"").get(0);
                                if (!trim.equals("不要") && !trim.isEmpty() && !str6.isEmpty()) {
                                    if (this.m) {
                                        trim = "xb:" + str6;
                                    }
                                    str5 = str5 + trim + "$" + str6 + "#";
                                }
                            }
                        }
                        String substring = str5.substring(0, str5.length() - 1);
                        this.F = substring;
                        return substring;
                    }
                } catch (Exception e2) {
                    e = e2;
                    str = "电影$1#连续剧$2#综艺$3#动漫$4";
                    SpiderDebug.log(e);
                    this.F = str;
                    return str;
                }
            }
            if (!zL("cateManual").isEmpty() && (optJSONObject = this.xf.optJSONObject("cateManual")) != null) {
                Iterator<String> keys = optJSONObject.keys();
                while (keys.hasNext()) {
                    String next = keys.next();
                    str3 = str3 + next.trim() + "$" + optJSONObject.getString(next).trim() + "#";
                }
                String substring2 = str3.substring(0, str3.length() - 1);
                this.F = substring2;
                return substring2;
            }
            a aj = aj(zL("主页url"));
            if (zL2.length() < 1) {
                zL2 = "无码";
            }
            if (!zL2.startsWith("//")) {
                zL2 = "//ul[contains(//text(),'电影') or contains(//text(),'" + zL2 + "')][1]//a[not(contains(text(),'页') or contains(text(),'资') or contains(text(),'留言') or contains(text(),'私人') or contains(text(),'影院') or contains(text(),'网') or contains(text(),'专题') or contains(text(),'推荐') or contains(text(),'下载'))]";
            }
            List b = aj.b(zL2);
            String str7 = str3;
            for (int i2 = 0; i2 < b.size(); i2++) {
                String trim2 = ((b) b.get(i2)).c(Hg("分类标题", "cateName", "/text()")).a().trim();
                if (trim2.length() <= 9 && !str7.contains(trim2)) {
                    String trim3 = ((b) b.get(i2)).c(Hg("分类ID", "cateId", "/@href")).a().trim();
                    if (trim3.contains("search")) {
                        str7 = str7 + trim2 + "$" + trim2 + "#";
                    } else {
                        if (trim3.startsWith("http")) {
                            trim3 = trim3.replaceAll(zL("主页url"), str3);
                        }
                        if (trim3.length() >= 2 && trim3.contains("/")) {
                            if (trim3.endsWith("/")) {
                                trim3 = trim3.substring(0, trim3.length() - 1);
                            }
                            if (trim3.endsWith(".html")) {
                                trim3 = trim3.substring(0, trim3.length() - 5);
                            }
                            if (trim3.endsWith("-1")) {
                                trim3 = trim3.substring(0, trim3.length() - 2);
                            }
                            if (!trim3.contains("//")) {
                                trim3 = trim3.substring(trim3.lastIndexOf("/") + 1, trim3.length());
                            }
                            if (trim3.length() >= 1 && trim2.length() >= 2) {
                                if (this.m) {
                                    trim2 = "xp:" + trim3;
                                }
                                str7 = str7 + trim2 + "$" + trim3 + "#";
                            }
                        }
                    }
                }
            }
            str = 6;
            try {
                if (str7.length() < 6) {
                    this.F = "电影$1#连续剧$2#综艺$3#动漫$4";
                    return "电影$1#连续剧$2#综艺$3#动漫$4";
                }
                String substring3 = str7.substring(0, str7.length() - 1);
                this.F = substring3;
                return substring3;
            } catch (Exception e3) {
                e = e3;
                SpiderDebug.log(e);
                this.F = str;
                return str;
            }
        } catch (Exception e4) {
            e = e4;
            str = "电影$1#连续剧$2#综艺$3#动漫$4";
        }
    }

    private String fJ(String str) {
        return str.contains("井号") ? str.replaceAll("井号", "#") : str;
    }

    /* JADX WARN: Removed duplicated region for block: B:111:0x0276 A[Catch: all -> 0x02de, TryCatch #0 {all -> 0x02de, blocks: (B:10:0x0035, B:13:0x003e, B:15:0x0044, B:17:0x004a, B:19:0x0050, B:21:0x0054, B:23:0x005c, B:24:0x0064, B:26:0x006c, B:27:0x0074, B:29:0x007a, B:30:0x0082, B:32:0x008a, B:33:0x0092, B:35:0x009a, B:36:0x00a2, B:38:0x00a9, B:39:0x00b6, B:41:0x00bc, B:43:0x00cc, B:46:0x00e0, B:48:0x00ea, B:50:0x00f0, B:51:0x00f8, B:54:0x0112, B:55:0x0118, B:56:0x0147, B:57:0x0166, B:59:0x016c, B:62:0x0193, B:64:0x01a3, B:66:0x01ab, B:73:0x01c6, B:76:0x01cf, B:78:0x01d7, B:80:0x01e7, B:82:0x01ef, B:85:0x0201, B:88:0x0207, B:89:0x020b, B:92:0x0215, B:94:0x0221, B:96:0x022a, B:98:0x0234, B:99:0x0244, B:103:0x0254, B:104:0x0259, B:107:0x0263, B:111:0x0276, B:112:0x027b, B:114:0x0283, B:116:0x028f, B:118:0x0299, B:120:0x02a1, B:121:0x02ad, B:125:0x02ba, B:126:0x02bd, B:129:0x02c6, B:133:0x02ce, B:134:0x02d2), top: B:144:0x0035 }] */
    /* JADX WARN: Removed duplicated region for block: B:112:0x027b A[Catch: all -> 0x02de, TryCatch #0 {all -> 0x02de, blocks: (B:10:0x0035, B:13:0x003e, B:15:0x0044, B:17:0x004a, B:19:0x0050, B:21:0x0054, B:23:0x005c, B:24:0x0064, B:26:0x006c, B:27:0x0074, B:29:0x007a, B:30:0x0082, B:32:0x008a, B:33:0x0092, B:35:0x009a, B:36:0x00a2, B:38:0x00a9, B:39:0x00b6, B:41:0x00bc, B:43:0x00cc, B:46:0x00e0, B:48:0x00ea, B:50:0x00f0, B:51:0x00f8, B:54:0x0112, B:55:0x0118, B:56:0x0147, B:57:0x0166, B:59:0x016c, B:62:0x0193, B:64:0x01a3, B:66:0x01ab, B:73:0x01c6, B:76:0x01cf, B:78:0x01d7, B:80:0x01e7, B:82:0x01ef, B:85:0x0201, B:88:0x0207, B:89:0x020b, B:92:0x0215, B:94:0x0221, B:96:0x022a, B:98:0x0234, B:99:0x0244, B:103:0x0254, B:104:0x0259, B:107:0x0263, B:111:0x0276, B:112:0x027b, B:114:0x0283, B:116:0x028f, B:118:0x0299, B:120:0x02a1, B:121:0x02ad, B:125:0x02ba, B:126:0x02bd, B:129:0x02c6, B:133:0x02ce, B:134:0x02d2), top: B:144:0x0035 }] */
    /* JADX WARN: Removed duplicated region for block: B:133:0x02ce A[Catch: all -> 0x02de, TryCatch #0 {all -> 0x02de, blocks: (B:10:0x0035, B:13:0x003e, B:15:0x0044, B:17:0x004a, B:19:0x0050, B:21:0x0054, B:23:0x005c, B:24:0x0064, B:26:0x006c, B:27:0x0074, B:29:0x007a, B:30:0x0082, B:32:0x008a, B:33:0x0092, B:35:0x009a, B:36:0x00a2, B:38:0x00a9, B:39:0x00b6, B:41:0x00bc, B:43:0x00cc, B:46:0x00e0, B:48:0x00ea, B:50:0x00f0, B:51:0x00f8, B:54:0x0112, B:55:0x0118, B:56:0x0147, B:57:0x0166, B:59:0x016c, B:62:0x0193, B:64:0x01a3, B:66:0x01ab, B:73:0x01c6, B:76:0x01cf, B:78:0x01d7, B:80:0x01e7, B:82:0x01ef, B:85:0x0201, B:88:0x0207, B:89:0x020b, B:92:0x0215, B:94:0x0221, B:96:0x022a, B:98:0x0234, B:99:0x0244, B:103:0x0254, B:104:0x0259, B:107:0x0263, B:111:0x0276, B:112:0x027b, B:114:0x0283, B:116:0x028f, B:118:0x0299, B:120:0x02a1, B:121:0x02ad, B:125:0x02ba, B:126:0x02bd, B:129:0x02c6, B:133:0x02ce, B:134:0x02d2), top: B:144:0x0035 }] */
    /* JADX WARN: Removed duplicated region for block: B:134:0x02d2 A[Catch: all -> 0x02de, TRY_LEAVE, TryCatch #0 {all -> 0x02de, blocks: (B:10:0x0035, B:13:0x003e, B:15:0x0044, B:17:0x004a, B:19:0x0050, B:21:0x0054, B:23:0x005c, B:24:0x0064, B:26:0x006c, B:27:0x0074, B:29:0x007a, B:30:0x0082, B:32:0x008a, B:33:0x0092, B:35:0x009a, B:36:0x00a2, B:38:0x00a9, B:39:0x00b6, B:41:0x00bc, B:43:0x00cc, B:46:0x00e0, B:48:0x00ea, B:50:0x00f0, B:51:0x00f8, B:54:0x0112, B:55:0x0118, B:56:0x0147, B:57:0x0166, B:59:0x016c, B:62:0x0193, B:64:0x01a3, B:66:0x01ab, B:73:0x01c6, B:76:0x01cf, B:78:0x01d7, B:80:0x01e7, B:82:0x01ef, B:85:0x0201, B:88:0x0207, B:89:0x020b, B:92:0x0215, B:94:0x0221, B:96:0x022a, B:98:0x0234, B:99:0x0244, B:103:0x0254, B:104:0x0259, B:107:0x0263, B:111:0x0276, B:112:0x027b, B:114:0x0283, B:116:0x028f, B:118:0x0299, B:120:0x02a1, B:121:0x02ad, B:125:0x02ba, B:126:0x02bd, B:129:0x02c6, B:133:0x02ce, B:134:0x02d2), top: B:144:0x0035 }] */
    /* JADX WARN: Removed duplicated region for block: B:73:0x01c6 A[Catch: all -> 0x02de, TRY_ENTER, TryCatch #0 {all -> 0x02de, blocks: (B:10:0x0035, B:13:0x003e, B:15:0x0044, B:17:0x004a, B:19:0x0050, B:21:0x0054, B:23:0x005c, B:24:0x0064, B:26:0x006c, B:27:0x0074, B:29:0x007a, B:30:0x0082, B:32:0x008a, B:33:0x0092, B:35:0x009a, B:36:0x00a2, B:38:0x00a9, B:39:0x00b6, B:41:0x00bc, B:43:0x00cc, B:46:0x00e0, B:48:0x00ea, B:50:0x00f0, B:51:0x00f8, B:54:0x0112, B:55:0x0118, B:56:0x0147, B:57:0x0166, B:59:0x016c, B:62:0x0193, B:64:0x01a3, B:66:0x01ab, B:73:0x01c6, B:76:0x01cf, B:78:0x01d7, B:80:0x01e7, B:82:0x01ef, B:85:0x0201, B:88:0x0207, B:89:0x020b, B:92:0x0215, B:94:0x0221, B:96:0x022a, B:98:0x0234, B:99:0x0244, B:103:0x0254, B:104:0x0259, B:107:0x0263, B:111:0x0276, B:112:0x027b, B:114:0x0283, B:116:0x028f, B:118:0x0299, B:120:0x02a1, B:121:0x02ad, B:125:0x02ba, B:126:0x02bd, B:129:0x02c6, B:133:0x02ce, B:134:0x02d2), top: B:144:0x0035 }] */
    /* JADX WARN: Removed duplicated region for block: B:76:0x01cf A[Catch: all -> 0x02de, TryCatch #0 {all -> 0x02de, blocks: (B:10:0x0035, B:13:0x003e, B:15:0x0044, B:17:0x004a, B:19:0x0050, B:21:0x0054, B:23:0x005c, B:24:0x0064, B:26:0x006c, B:27:0x0074, B:29:0x007a, B:30:0x0082, B:32:0x008a, B:33:0x0092, B:35:0x009a, B:36:0x00a2, B:38:0x00a9, B:39:0x00b6, B:41:0x00bc, B:43:0x00cc, B:46:0x00e0, B:48:0x00ea, B:50:0x00f0, B:51:0x00f8, B:54:0x0112, B:55:0x0118, B:56:0x0147, B:57:0x0166, B:59:0x016c, B:62:0x0193, B:64:0x01a3, B:66:0x01ab, B:73:0x01c6, B:76:0x01cf, B:78:0x01d7, B:80:0x01e7, B:82:0x01ef, B:85:0x0201, B:88:0x0207, B:89:0x020b, B:92:0x0215, B:94:0x0221, B:96:0x022a, B:98:0x0234, B:99:0x0244, B:103:0x0254, B:104:0x0259, B:107:0x0263, B:111:0x0276, B:112:0x027b, B:114:0x0283, B:116:0x028f, B:118:0x0299, B:120:0x02a1, B:121:0x02ad, B:125:0x02ba, B:126:0x02bd, B:129:0x02c6, B:133:0x02ce, B:134:0x02d2), top: B:144:0x0035 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private java.util.ArrayList<java.lang.String> gn(java.lang.String r21, java.lang.String r22, java.lang.String r23) {
        /*
            Method dump skipped, instructions count: 752
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.github.catvod.spider.XBPQ.gn(java.lang.String, java.lang.String, java.lang.String):java.util.ArrayList");
    }

    private String h9(String str, String str2) {
        for (int i = 0; i < 3; i++) {
            if (str2.contains("检测中") && str2.contains("跳转中") && str2.contains("btwaf")) {
                Rn(str2, "btwaf=", "\"").get(0);
                str2 = OG(str);
            }
            if (!str2.contains("检测中") && !str2.contains("btwaf")) {
                return str2;
            }
        }
        return str2;
    }

    private String hT(String str) {
        return str.contains("星号") ? str.replaceAll("星号", "*") : str;
    }

    private String kg(int i, String str, String str2) {
        String str3;
        String[] split;
        if (!str2.contains("||")) {
            return str2;
        }
        if (!str2.contains("--")) {
            return str2.split("\\|\\|")[i];
        }
        String[] split2 = str2.split("\\|\\|");
        int length = split2.length;
        int i2 = 0;
        while (true) {
            if (i2 >= length) {
                str3 = "0";
                break;
            }
            str3 = split2[i2];
            if (str.equals(str3.split("--")[0])) {
                break;
            }
            i2++;
        }
        if (str3.equals("0")) {
            for (String str4 : str2.split("\\|\\|")) {
                if (str4.split("--")[0].equals("" + (i + 1))) {
                    return str4;
                }
            }
        }
        return str3;
    }

    public static Object[] loadPic(Map<String, String> map) {
        try {
            String str = map.get("site");
            String str2 = map.get("pic");
            if (zL == null) {
                HashMap<String, String> hashMap = new HashMap<>();
                zL = hashMap;
                hashMap.put("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54 Safari/537.36");
                zL.put("referer", str);
            }
            gU.v vVar = new gU.v() { // from class: com.github.catvod.spider.XBPQ.3
                @Override // com.github.catvod.spider.merga.aB.gU
                protected void onFailure(Call call, Exception exc) {
                }

                /* JADX INFO: Access modifiers changed from: protected */
                public void onResponse(Response response) {
                }
            };
            Rc.s(Rc.F(), str2, null, zL, vVar);
            if (vVar.getResult().code() == 200) {
                String str3 = vVar.getResult().headers().get("Content-Type");
                if (str3 == null) {
                    str3 = "application/octet-stream";
                }
                System.out.println(str2);
                System.out.println(str3);
                return new Object[]{200, str3, vVar.getResult().body().byteStream()};
            }
        } catch (Throwable th) {
            th.printStackTrace();
        }
        return null;
    }

    private String lu(String str, String str2, String str3, String str4) {
        return o(str, o(str2, o(str3, str4)));
    }

    private String m(String str) {
        String[] split;
        if (!str.contains("||")) {
            return str;
        }
        for (String str2 : str.split("\\|\\|")) {
            if (str2.contains(this.bY)) {
                return str2.split("--")[1];
            }
        }
        return !str.split("\\|\\|")[0].contains("--") ? str.split("\\|\\|")[0] : str.split("\\|\\|")[0].split("--")[1];
    }

    private String n(String str, String str2, String str3) {
        String str4;
        String str5;
        String replaceAll = str2.replaceAll(".*<序号>(.*)", "$1");
        String replaceAll2 = str2.replaceAll("<序号>.*", "");
        if (str.contains("[替换:")) {
            String replaceAll3 = S(str.replaceAll(".*\\[替换:(.*?)\\].*", "$1")).replaceAll("<序号>", replaceAll);
            if (!replaceAll3.isEmpty()) {
                for (String str6 : replaceAll3.split("#")) {
                    String fJ = fJ(str6);
                    if (!fJ.contains(">>>")) {
                        str4 = fJ.split(">>")[0];
                        str5 = fJ.split(">>")[1];
                    } else {
                        str4 = fJ.split(">>>")[0] + ">";
                        str5 = fJ.split(">>>")[1];
                    }
                    String replaceAll4 = str4.replaceAll("\\&", "&nbsp;&");
                    String NW = NW(str3, str5);
                    if (replaceAll4.contains("*") && NW.length() > 0) {
                        if (NW.equals("空")) {
                            NW = "";
                        }
                        String v = v(hT(replaceAll4.split("\\*")[0]));
                        String v2 = v(hT(replaceAll4.split("\\*")[1]));
                        replaceAll2 = replaceAll2.replaceAll(v(v) + "([\\S\\s]*?)" + v(v2), NW);
                    } else if (NW.length() > 0) {
                        if (NW.equals("空")) {
                            NW = "";
                        }
                        replaceAll2 = replaceAll2.replaceAll(v(hT(replaceAll4)), NW);
                    }
                }
            }
        }
        return replaceAll2;
    }

    private String o(String str, String str2) {
        String optString = this.xf.optString(str);
        if (str.equals("主页url") && optString.isEmpty()) {
            optString = this.xf.optString("网站地址");
            if (optString.isEmpty()) {
                optString = this.xf.optString("url");
                if (optString.isEmpty()) {
                    optString = this.xf.optString("homeUrl");
                    if (optString.isEmpty()) {
                        String optString2 = this.xf.optString("分类url");
                        if (optString2.isEmpty()) {
                            optString2 = this.xf.optString("分类页");
                            if (optString2.isEmpty()) {
                                optString2 = this.xf.optString("class_url");
                                if (optString2.isEmpty()) {
                                    optString2 = this.xf.optString("cateUrl");
                                    if (optString2.isEmpty()) {
                                        optString2 = this.xf.optString("搜索url");
                                    }
                                }
                            }
                        }
                        optString = optString2.replaceAll(".*(https?\\://[^/]+)/.*", "$1");
                    }
                }
            }
        }
        if (str.equals("分类")) {
            if (!optString.isEmpty()) {
                if (optString.contains("&")) {
                    optString = NF(optString, this.xf.optString("分类值"));
                }
            } else {
                optString = this.xf.optString("class_name");
                if (!optString.isEmpty()) {
                    optString = NF(optString, this.xf.optString("class_value"));
                }
            }
        }
        return (optString.isEmpty() || optString.equals("空")) ? (!str.equals("搜索后缀") || !optString.equals("空")) ? str2 : "" : optString;
    }

    private String rL(String str, String str2, String str3, String str4, String str5) {
        return o(str, o(str2, o(str3, o(str4, str5))));
    }

    private String s(String str) {
        String[] split;
        gU.v vVar = new gU.v() { // from class: com.github.catvod.spider.XBPQ.1
            @Override // com.github.catvod.spider.merga.aB.gU
            protected void onFailure(Call call, Exception exc) {
            }

            /* JADX INFO: Access modifiers changed from: protected */
            public void onResponse(Response response) {
            }
        };
        if (str.contains(";post")) {
            String trim = str.split(";post;")[1].trim();
            String str2 = str.split(";")[0];
            LinkedHashMap linkedHashMap = new LinkedHashMap();
            for (String str3 : trim.split("\\&")) {
                int indexOf = str3.indexOf("=");
                linkedHashMap.put(str3.substring(0, indexOf), str3.substring(indexOf + 1));
            }
            if (!trim.isEmpty()) {
                Rc.f(Rc.F(), str2, linkedHashMap, xf(str2), vVar);
            } else {
                Rc.f(Rc.F(), str2, null, xf(str2), vVar);
            }
        } else {
            Rc.s(Rc.F(), str, null, xf(str), vVar);
        }
        try {
            return new String(vVar.getResult().body().bytes(), y);
        } catch (IOException unused) {
            return "";
        }
    }

    private String y(String str, String str2) {
        String str3;
        if (str2.equals("*") || str2.isEmpty()) {
            str2 = str;
        }
        if (str.contains("||")) {
            String[] split = str.split("\\|\\|");
            String[] split2 = str2.split("\\|\\|");
            String str4 = "";
            int i = 0;
            while (i < split.length) {
                StringBuilder sb = new StringBuilder();
                sb.append("");
                int i2 = i + 1;
                sb.append(i2);
                String sb2 = sb.toString();
                String str5 = split[i];
                if (str5.equals("空")) {
                    str3 = str4 + "0||";
                } else {
                    if (str5.contains("--")) {
                        sb2 = str5.split("--")[0];
                        str5 = str5.split("--")[1];
                    }
                    String str6 = split2[i];
                    if (str6.contains("--")) {
                        str6 = str6.split("--")[1];
                    }
                    str3 = str4 + sb2 + "--" + NF(str5, str6) + "||";
                }
                str4 = str3;
                i = i2;
            }
            if (this.K.equals("筛选合成")) {
                this.cT = str4;
            }
            return str4.substring(0, str4.length() - 2);
        }
        return NF(str, str2);
    }

    private String zL(String str) {
        return o(str, "");
    }

    /* JADX WARN: Removed duplicated region for block: B:5:0x0020  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    protected void K() {
        /*
            r4 = this;
            java.lang.String r0 = "主页url"
            java.lang.String r0 = r4.zL(r0)
            java.util.HashMap r1 = new java.util.HashMap
            r1.<init>()
            java.util.HashMap r2 = r4.xf(r0)
            com.github.catvod.spider.merga.aB.Rc.R(r0, r2, r1)
            java.util.Set r0 = r1.entrySet()
            java.util.Iterator r0 = r0.iterator()
        L1a:
            boolean r1 = r0.hasNext()
            if (r1 == 0) goto L50
            java.lang.Object r1 = r0.next()
            java.util.Map$Entry r1 = (java.util.Map.Entry) r1
            java.lang.Object r2 = r1.getKey()
            java.lang.String r2 = (java.lang.String) r2
            java.lang.String r3 = "set-cookie"
            boolean r2 = r2.equals(r3)
            if (r2 != 0) goto L42
            java.lang.Object r2 = r1.getKey()
            java.lang.String r2 = (java.lang.String) r2
            java.lang.String r3 = "Set-Cookie"
            boolean r2 = r2.equals(r3)
            if (r2 == 0) goto L1a
        L42:
            java.lang.Object r0 = r1.getValue()
            java.lang.Iterable r0 = (java.lang.Iterable) r0
            java.lang.String r1 = "; "
            java.lang.String r0 = android.text.TextUtils.join(r1, r0)
            r4.Z = r0
        L50:
            return
        */
        throw new UnsupportedOperationException("Method not decompiled: com.github.catvod.spider.XBPQ.K():void");
    }

    protected String OG(String str) {
        SpiderDebug.log(str);
        boolean startsWith = str.startsWith("xp");
        if (startsWith) {
            str = str.replaceAll("xp(http.*)", "$1");
        }
        String h9 = h9(str, str);
        String s = y.length() > 0 ? s(h9) : "";
        if (s.length() < 1) {
            s = Rc.K(h9, xf(h9));
        }
        String b = b(s);
        return startsWith ? b : b.replace(" ", "空空空").replaceAll("\\s", "").replace("空空空", " ");
    }

    String T(String str) {
        return e.c(str).v0();
    }

    protected a aj(String str) {
        String str2;
        if (str.contains(";post")) {
            str2 = f("xp" + str);
        } else {
            str2 = OG("xp" + str.split(";")[0]);
        }
        return a.a(str2);
    }

    public String categoryContent(String str, String str2, boolean z, HashMap<String, String> hashMap) {
        JSONObject H = H(str, str2, z, hashMap);
        return H != null ? H.toString() : "";
    }

    /*  JADX ERROR: JadxRuntimeException in pass: BlockProcessor
        jadx.core.utils.exceptions.JadxRuntimeException: Unreachable block: B:101:0x0315
        	at jadx.core.dex.visitors.blocks.BlockProcessor.checkForUnreachableBlocks(BlockProcessor.java:92)
        	at jadx.core.dex.visitors.blocks.BlockProcessor.processBlocksTree(BlockProcessor.java:52)
        	at jadx.core.dex.visitors.blocks.BlockProcessor.visit(BlockProcessor.java:44)
        */
    public java.lang.String detailContent(java.util.List<java.lang.String> r60) {
        /*
            Method dump skipped, instructions count: 4415
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.github.catvod.spider.XBPQ.detailContent(java.util.List):java.lang.String");
    }

    protected String f(String str) {
        String[] split;
        SpiderDebug.log(str);
        boolean startsWith = str.startsWith("xp");
        if (startsWith) {
            str = str.replaceAll("xp(http.*)", "$1");
        }
        String h9 = h9(str, str);
        String s = y.length() > 0 ? s(h9) : "";
        if (s.length() < 1) {
            String trim = h9.split(";post;")[1].trim();
            String str2 = h9.split(";")[0];
            gU.Ph ph = new gU.Ph() { // from class: com.github.catvod.spider.XBPQ.2
                @Override // com.github.catvod.spider.merga.aB.gU
                protected void onFailure(Call call, Exception exc) {
                }

                /* JADX INFO: Access modifiers changed from: protected */
                public void onResponse(String str3) {
                }
            };
            if (!trim.isEmpty()) {
                if (trim.startsWith("{") && trim.endsWith("}")) {
                    try {
                        Rc.m(Rc.F(), str2, new JSONObject(trim).toString(), xf(str2), ph);
                    } catch (JSONException unused) {
                    }
                } else {
                    LinkedHashMap linkedHashMap = new LinkedHashMap();
                    for (String str3 : trim.split("\\&")) {
                        int indexOf = str3.indexOf("=");
                        linkedHashMap.put(str3.substring(0, indexOf), str3.substring(indexOf + 1));
                    }
                    Rc.f(Rc.F(), str2, linkedHashMap, xf(str2), ph);
                }
            } else {
                Rc.f(Rc.F(), str2, null, xf(str2), ph);
            }
            s = ph.getResult();
        }
        String b = b(s);
        return startsWith ? b : b.replace(" ", "空空空").replaceAll("\\s", "").replace("空空空", " ");
    }

    /* JADX WARN: Removed duplicated region for block: B:56:0x011c A[Catch: Exception -> 0x0126, TryCatch #0 {Exception -> 0x0126, blocks: (B:3:0x0010, B:5:0x002c, B:6:0x0034, B:9:0x003a, B:10:0x005b, B:13:0x006c, B:16:0x0077, B:19:0x0081, B:23:0x008c, B:26:0x00a6, B:28:0x00ac, B:30:0x00b2, B:34:0x00bb, B:37:0x00c1, B:39:0x00c7, B:43:0x00d0, B:45:0x00d6, B:46:0x00db, B:48:0x00ff, B:50:0x0105, B:51:0x010a, B:52:0x010e, B:54:0x0115, B:56:0x011c, B:57:0x0121), top: B:62:0x0010 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public java.lang.String homeContent(boolean r17) {
        /*
            Method dump skipped, instructions count: 299
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.github.catvod.spider.XBPQ.homeContent(boolean):java.lang.String");
    }

    public String homeVideoContent() {
        String str;
        String str2;
        String str3;
        try {
            String rL = rL("热门", "首页", "homeContent", "shouye", "40");
            if (rL.equals("1") || rL.equals("首页")) {
                rL = "40";
            }
            if (Hg("列表分类", "fenlei", "").length() < 3) {
                str = this.F + "#";
            } else {
                str = Hg("列表分类", "fenlei", "") + "#";
            }
            this.v = 40;
            if (rL.contains("$")) {
                this.v = Integer.parseInt(rL.split("\\$")[1]);
                String str4 = rL.split("\\$")[0];
                if (str4.equals("首页")) {
                    str3 = "";
                } else {
                    str3 = str.replaceAll(".*" + str4 + "\\$(.*?)#.*", "$1");
                }
                str2 = lu("起始页", "qishiye", "firstpage", "1");
            } else if (rL.matches("\\d+")) {
                this.v = Integer.parseInt(rL);
                str3 = "";
                str2 = str3;
            } else {
                str3 = str.replaceAll(".*" + rL + "\\$(.*?)#.*", "$1");
                str2 = lu("起始页", "qishiye", "firstpage", "1");
            }
            if (this.v > 0) {
                this.s = true;
                JSONObject H = H(str3, str2, false, new HashMap<>());
                this.s = false;
                return H.toString();
            }
        } catch (Exception e) {
            SpiderDebug.log(e);
        }
        return "";
    }

    public void init(Context context) {
        XBPQ.super.init(context);
    }

    public boolean isVideoFormat(String str) {
        String lowerCase = str.toLowerCase();
        String[] split = o("嗅探词", o("VideoFormat", ".m3u8#.mp4#.flv#.mp3#.m4a")).split("#");
        String[] split2 = o("过滤词", o("VideoFilter", "=http#.jpg#.png#.ico#.gif#.js")).split("#");
        for (String str2 : split) {
            if (lowerCase.contains(str2)) {
                for (String str3 : split2) {
                    if (lowerCase.contains(str3)) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }

    protected String j(String str, String str2, boolean z, HashMap<String, String> hashMap) {
        String rL = rL("分类url", "分类页", "class_url", "cateUrl", "");
        String lu = lu("起始页", "qishiye", "firstpage", "1");
        if (rL.contains("[") || rL.contains("|")) {
            if (str2.equals(lu)) {
                rL = rL.replaceAll(".*[\\[|\\|].*(http[^\\]]*)\\]?.*", "$1").replace("firstPage=", "");
            } else {
                rL = rL.replaceAll("\\|\\|", "\\|").replaceAll("(.*)[\\[|\\|].*", "$1");
            }
        }
        if (z && this.j && hashMap != null && hashMap.size() > 0) {
            for (String str3 : hashMap.keySet()) {
                String str4 = hashMap.get(str3);
                if (str4.length() > 0) {
                    rL = rL.replace("{" + str3 + "}", URLEncoder.encode(str4));
                }
            }
        }
        String replace = rL.replace("{cateId}", str).replace("{catePg}", str2);
        Matcher matcher = Pattern.compile("\\{(.*?)\\}").matcher(replace);
        while (matcher.find()) {
            String replace2 = matcher.group(0).replace("{", "").replace("}", "");
            String replace3 = replace.replace(matcher.group(0), "");
            replace = replace3.replace("/" + replace2 + "/", "");
        }
        return replace;
    }

    public boolean manualVideoCheck() {
        return !Hg("嗅探词", "过滤词", "").isEmpty() || o("手动嗅探", "ManualSniffer").equals("1");
    }

    public String playerContent(String str, String str2, List<String> list) {
        String[] split;
        String decode;
        try {
            JSONObject jSONObject = new JSONObject();
            if (!str2.startsWith("http") && !str2.startsWith("magnet")) {
                str2 = zL("主页url") + str2;
            }
            if (lu("免嗅", "mac", "Anal_MacPlayer", "0").equals("1") && !str2.startsWith("magnet")) {
                String str3 = null;
                C0634g p0 = e.c(Rc.K(str2, xf(str2))).p0("script");
                int i = 0;
                while (true) {
                    if (i >= p0.size()) {
                        break;
                    }
                    String trim = p0.get(i).d0().trim();
                    if (trim.startsWith("var player_")) {
                        JSONObject jSONObject2 = new JSONObject(trim.substring(trim.indexOf(123), trim.lastIndexOf(125) + 1));
                        str3 = jSONObject2.getString("url");
                        if (jSONObject2.has("encrypt")) {
                            int i2 = jSONObject2.getInt("encrypt");
                            if (i2 == 1) {
                                decode = URLDecoder.decode(str3);
                            } else if (i2 == 2) {
                                decode = URLDecoder.decode(new String(Base64.decode(str3, 0)));
                            }
                            str3 = decode;
                        }
                    } else {
                        i++;
                    }
                }
                if (isVideoFormat(str3)) {
                    jSONObject.put("parse", 0);
                } else if (RC.u6(str3)) {
                    jSONObject.put("parse", 1);
                    jSONObject.put("jx", "1");
                } else {
                    jSONObject.put("parse", 1);
                }
                str2 = str3;
            }
            jSONObject.put("playUrl", "");
            jSONObject.put("url", str2);
            String Hg = Hg("播放请求头", "play_header", "");
            if (Hg.contains("$")) {
                JSONObject jSONObject3 = new JSONObject();
                for (String str4 : Hg.split("#")) {
                    jSONObject3.put(str4.split("\\$")[0], str4.split("\\$")[1]);
                }
                jSONObject.put("header", jSONObject3.toString());
            }
            return jSONObject.toString();
        } catch (Exception e) {
            SpiderDebug.log(e);
            return "";
        }
    }

    /*  JADX ERROR: JadxRuntimeException in pass: BlockProcessor
        jadx.core.utils.exceptions.JadxRuntimeException: Unreachable block: B:316:0x097b
        	at jadx.core.dex.visitors.blocks.BlockProcessor.checkForUnreachableBlocks(BlockProcessor.java:92)
        	at jadx.core.dex.visitors.blocks.BlockProcessor.processBlocksTree(BlockProcessor.java:52)
        	at jadx.core.dex.visitors.blocks.BlockProcessor.visit(BlockProcessor.java:44)
        */
    public java.lang.String searchContent(java.lang.String r49, boolean r50) {
        /*
            Method dump skipped, instructions count: 2433
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.github.catvod.spider.XBPQ.searchContent(java.lang.String, boolean):java.lang.String");
    }

    String v(String str) {
        if (!str.isEmpty()) {
            String[] strArr = {"\\", "$", "(", ")", "*", "+", ".", "[", "]", "?", "^", "{", "}", "|"};
            for (int i = 0; i < 14; i++) {
                String str2 = strArr[i];
                if (str.contains(str2)) {
                    str = str.replace(str2, "\\" + str2);
                }
            }
        }
        return str;
    }

    protected HashMap<String, String> xf(String str) {
        String[] split;
        HashMap<String, String> hashMap = new HashMap<>();
        String trim = lu("请求头", "ua", "UserAgent", "").trim();
        if (trim.equals("手机") || trim.equals("MOBILE_UA")) {
            trim = "Mozilla/5.0 (Linux; Android 11; Ghxi Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/76.0.3809.89 Mobile Safari/537.36";
        }
        if (trim.isEmpty() || trim.equals("电脑") || trim.equals("PC_UA")) {
            trim = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54 Safari/537.36";
        }
        hashMap.put("User-Agent", trim);
        if (this.Z.length() > 0) {
            hashMap.put("Cookie", this.Z);
        }
        if (!Hg("访问请求referer", "Referer", "").isEmpty()) {
            hashMap.put("Referer", Hg("访问请求referer", "Referer", ""));
        }
        String Hg = Hg("头部集合", "User", "");
        if (Hg.contains("$")) {
            for (String str2 : Hg.split("#")) {
                hashMap.put(str2.split("\\$")[0], " " + str2.split("\\$")[1]);
            }
        }
        return hashMap;
    }

    /* JADX WARN: Can't wrap try/catch for region: R(39:106|3|4|(35:9|11|(1:13)|14|102|15|108|16|114|17|100|18|104|19|110|20|112|21|38|(3:42|39|40)|116|43|(7:46|(2:47|(7:49|(1:51)(1:52)|53|(2:55|(1:57)(4:58|(1:60)|61|(2:120|63)(2:122|66)))(1:64)|65|121|66)(2:119|67))|68|(1:72)|73|(2:117|75)(1:76)|44)|118|77|(3:79|(2:81|124)(1:125)|82)|123|83|(3:85|(2:87|127)(1:128)|88)|126|89|(3:91|(2:93|130)(1:131)|94)|129|95|96)|10|11|(0)|14|102|15|108|16|114|17|100|18|104|19|110|20|112|21|38|(2:39|40)|116|43|(1:44)|118|77|(0)|123|83|(0)|126|89|(0)|129|95|96) */
    /* JADX WARN: Can't wrap try/catch for region: R(41:2|106|3|4|(35:9|11|(1:13)|14|102|15|108|16|114|17|100|18|104|19|110|20|112|21|38|(3:42|39|40)|116|43|(7:46|(2:47|(7:49|(1:51)(1:52)|53|(2:55|(1:57)(4:58|(1:60)|61|(2:120|63)(2:122|66)))(1:64)|65|121|66)(2:119|67))|68|(1:72)|73|(2:117|75)(1:76)|44)|118|77|(3:79|(2:81|124)(1:125)|82)|123|83|(3:85|(2:87|127)(1:128)|88)|126|89|(3:91|(2:93|130)(1:131)|94)|129|95|96)|10|11|(0)|14|102|15|108|16|114|17|100|18|104|19|110|20|112|21|38|(2:39|40)|116|43|(1:44)|118|77|(0)|123|83|(0)|126|89|(0)|129|95|96|(1:(0))) */
    /* JADX WARN: Code restructure failed: missing block: B:22:0x00f5, code lost:
        r0 = e;
     */
    /* JADX WARN: Code restructure failed: missing block: B:23:0x00f7, code lost:
        r0 = e;
     */
    /* JADX WARN: Code restructure failed: missing block: B:24:0x00f8, code lost:
        r5 = "";
     */
    /* JADX WARN: Code restructure failed: missing block: B:25:0x00fa, code lost:
        r0 = e;
     */
    /* JADX WARN: Code restructure failed: missing block: B:26:0x00fb, code lost:
        r3 = "";
        r5 = r3;
     */
    /* JADX WARN: Code restructure failed: missing block: B:27:0x00fe, code lost:
        r0 = e;
     */
    /* JADX WARN: Code restructure failed: missing block: B:28:0x00ff, code lost:
        r3 = "";
        r5 = r3;
        r10 = r5;
     */
    /* JADX WARN: Code restructure failed: missing block: B:29:0x0103, code lost:
        r0 = e;
     */
    /* JADX WARN: Code restructure failed: missing block: B:30:0x0104, code lost:
        r3 = "";
        r5 = r3;
        r10 = r5;
     */
    /* JADX WARN: Code restructure failed: missing block: B:31:0x0108, code lost:
        r0 = e;
     */
    /* JADX WARN: Code restructure failed: missing block: B:32:0x0109, code lost:
        r3 = "";
        r5 = r3;
        r9 = r5;
     */
    /* JADX WARN: Code restructure failed: missing block: B:33:0x010d, code lost:
        r0 = e;
     */
    /* JADX WARN: Code restructure failed: missing block: B:34:0x010e, code lost:
        r3 = "";
        r5 = r3;
        r6 = r5;
        r9 = r6;
     */
    /* JADX WARN: Code restructure failed: missing block: B:35:0x0112, code lost:
        r10 = r9;
     */
    /* JADX WARN: Code restructure failed: missing block: B:36:0x0113, code lost:
        r13 = r10;
     */
    /* JADX WARN: Code restructure failed: missing block: B:37:0x0114, code lost:
        com.github.catvod.crawler.SpiderDebug.log(r0);
        r0 = "";
     */
    /* JADX WARN: Removed duplicated region for block: B:13:0x005a A[Catch: Exception -> 0x030a, TryCatch #3 {Exception -> 0x030a, blocks: (B:3:0x0009, B:6:0x0022, B:9:0x002b, B:10:0x0043, B:11:0x0045, B:13:0x005a, B:14:0x005e, B:37:0x0114, B:38:0x0118, B:39:0x0166, B:42:0x016e, B:43:0x018e, B:44:0x01c9, B:46:0x01cf, B:47:0x01df, B:49:0x01e5, B:51:0x01e9, B:53:0x01f2, B:55:0x021a, B:58:0x0226, B:60:0x022a, B:61:0x023b, B:66:0x0262, B:68:0x0272, B:70:0x0278, B:72:0x027e, B:73:0x0281, B:76:0x028d, B:77:0x0297, B:79:0x029f, B:81:0x02ab, B:82:0x02ae, B:83:0x02b1, B:85:0x02b9, B:87:0x02c5, B:88:0x02c8, B:89:0x02cb, B:91:0x02d3, B:93:0x02d9, B:94:0x02dc, B:95:0x02df), top: B:106:0x0009 }] */
    /* JADX WARN: Removed duplicated region for block: B:42:0x016e A[Catch: Exception -> 0x030a, LOOP:0: B:39:0x0166->B:42:0x016e, LOOP_END, TRY_ENTER, TryCatch #3 {Exception -> 0x030a, blocks: (B:3:0x0009, B:6:0x0022, B:9:0x002b, B:10:0x0043, B:11:0x0045, B:13:0x005a, B:14:0x005e, B:37:0x0114, B:38:0x0118, B:39:0x0166, B:42:0x016e, B:43:0x018e, B:44:0x01c9, B:46:0x01cf, B:47:0x01df, B:49:0x01e5, B:51:0x01e9, B:53:0x01f2, B:55:0x021a, B:58:0x0226, B:60:0x022a, B:61:0x023b, B:66:0x0262, B:68:0x0272, B:70:0x0278, B:72:0x027e, B:73:0x0281, B:76:0x028d, B:77:0x0297, B:79:0x029f, B:81:0x02ab, B:82:0x02ae, B:83:0x02b1, B:85:0x02b9, B:87:0x02c5, B:88:0x02c8, B:89:0x02cb, B:91:0x02d3, B:93:0x02d9, B:94:0x02dc, B:95:0x02df), top: B:106:0x0009 }] */
    /* JADX WARN: Removed duplicated region for block: B:46:0x01cf A[Catch: Exception -> 0x030a, TryCatch #3 {Exception -> 0x030a, blocks: (B:3:0x0009, B:6:0x0022, B:9:0x002b, B:10:0x0043, B:11:0x0045, B:13:0x005a, B:14:0x005e, B:37:0x0114, B:38:0x0118, B:39:0x0166, B:42:0x016e, B:43:0x018e, B:44:0x01c9, B:46:0x01cf, B:47:0x01df, B:49:0x01e5, B:51:0x01e9, B:53:0x01f2, B:55:0x021a, B:58:0x0226, B:60:0x022a, B:61:0x023b, B:66:0x0262, B:68:0x0272, B:70:0x0278, B:72:0x027e, B:73:0x0281, B:76:0x028d, B:77:0x0297, B:79:0x029f, B:81:0x02ab, B:82:0x02ae, B:83:0x02b1, B:85:0x02b9, B:87:0x02c5, B:88:0x02c8, B:89:0x02cb, B:91:0x02d3, B:93:0x02d9, B:94:0x02dc, B:95:0x02df), top: B:106:0x0009 }] */
    /* JADX WARN: Removed duplicated region for block: B:79:0x029f A[Catch: Exception -> 0x030a, TryCatch #3 {Exception -> 0x030a, blocks: (B:3:0x0009, B:6:0x0022, B:9:0x002b, B:10:0x0043, B:11:0x0045, B:13:0x005a, B:14:0x005e, B:37:0x0114, B:38:0x0118, B:39:0x0166, B:42:0x016e, B:43:0x018e, B:44:0x01c9, B:46:0x01cf, B:47:0x01df, B:49:0x01e5, B:51:0x01e9, B:53:0x01f2, B:55:0x021a, B:58:0x0226, B:60:0x022a, B:61:0x023b, B:66:0x0262, B:68:0x0272, B:70:0x0278, B:72:0x027e, B:73:0x0281, B:76:0x028d, B:77:0x0297, B:79:0x029f, B:81:0x02ab, B:82:0x02ae, B:83:0x02b1, B:85:0x02b9, B:87:0x02c5, B:88:0x02c8, B:89:0x02cb, B:91:0x02d3, B:93:0x02d9, B:94:0x02dc, B:95:0x02df), top: B:106:0x0009 }] */
    /* JADX WARN: Removed duplicated region for block: B:85:0x02b9 A[Catch: Exception -> 0x030a, TryCatch #3 {Exception -> 0x030a, blocks: (B:3:0x0009, B:6:0x0022, B:9:0x002b, B:10:0x0043, B:11:0x0045, B:13:0x005a, B:14:0x005e, B:37:0x0114, B:38:0x0118, B:39:0x0166, B:42:0x016e, B:43:0x018e, B:44:0x01c9, B:46:0x01cf, B:47:0x01df, B:49:0x01e5, B:51:0x01e9, B:53:0x01f2, B:55:0x021a, B:58:0x0226, B:60:0x022a, B:61:0x023b, B:66:0x0262, B:68:0x0272, B:70:0x0278, B:72:0x027e, B:73:0x0281, B:76:0x028d, B:77:0x0297, B:79:0x029f, B:81:0x02ab, B:82:0x02ae, B:83:0x02b1, B:85:0x02b9, B:87:0x02c5, B:88:0x02c8, B:89:0x02cb, B:91:0x02d3, B:93:0x02d9, B:94:0x02dc, B:95:0x02df), top: B:106:0x0009 }] */
    /* JADX WARN: Removed duplicated region for block: B:91:0x02d3 A[Catch: Exception -> 0x030a, TryCatch #3 {Exception -> 0x030a, blocks: (B:3:0x0009, B:6:0x0022, B:9:0x002b, B:10:0x0043, B:11:0x0045, B:13:0x005a, B:14:0x005e, B:37:0x0114, B:38:0x0118, B:39:0x0166, B:42:0x016e, B:43:0x018e, B:44:0x01c9, B:46:0x01cf, B:47:0x01df, B:49:0x01e5, B:51:0x01e9, B:53:0x01f2, B:55:0x021a, B:58:0x0226, B:60:0x022a, B:61:0x023b, B:66:0x0262, B:68:0x0272, B:70:0x0278, B:72:0x027e, B:73:0x0281, B:76:0x028d, B:77:0x0297, B:79:0x029f, B:81:0x02ab, B:82:0x02ae, B:83:0x02b1, B:85:0x02b9, B:87:0x02c5, B:88:0x02c8, B:89:0x02cb, B:91:0x02d3, B:93:0x02d9, B:94:0x02dc, B:95:0x02df), top: B:106:0x0009 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public java.lang.String xpDetailContent(java.util.List<java.lang.String> r21) {
        /*
            Method dump skipped, instructions count: 783
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.github.catvod.spider.XBPQ.xpDetailContent(java.util.List):java.lang.String");
    }

    protected String zt(String str, String str2) {
        try {
            return "proxy://do=xbpq&site=" + str2 + "&pic=" + str;
        } catch (Exception e) {
            SpiderDebug.log(e);
            return str;
        }
    }

    public void init(Context context, String str) {
        String str2 = "s://";
        XBPQ.super.init(context, str);
        if (str != null) {
            try {
                if (str.startsWith("http")) {
                    if (!str.contains("{cateId}")) {
                        this.xf = new JSONObject(Rc.K(str, null));
                    } else {
                        JSONObject jSONObject = new JSONObject();
                        this.xf = jSONObject;
                        jSONObject.put("分类url", str);
                    }
                } else if (str.startsWith("{")) {
                    this.xf = new JSONObject(str);
                } else {
                    String replaceAll = str.replaceAll(str2, "s//").replaceAll("p://", "p//").replaceAll("包含:", "包含").replaceAll("替换:", "替换").replaceAll("序号:", "序号").replaceAll("排序:", "排序").replaceAll("script:", "script");
                    this.xf = new JSONObject();
                    String str3 = ":";
                    if (!replaceAll.contains(",")) {
                        this.xf.put(replaceAll.split(str3)[0], replaceAll.split(str3)[1].replace("s//", str2).replaceAll("p//", "p://").replaceAll("包含", "包含:").replaceAll("替换", "替换:").replaceAll("序号", "序号:").replaceAll("排序", "排序:").replaceAll("script", "script:"));
                    } else {
                        String str4 = "script:";
                        String[] split = replaceAll.split(",");
                        int length = split.length;
                        String str5 = "script";
                        int i = 0;
                        while (i < length) {
                            int i2 = length;
                            String str6 = split[i];
                            String[] strArr = split;
                            int i3 = i;
                            JSONObject jSONObject2 = this.xf;
                            String str7 = str6.split(str3)[0];
                            String str8 = str2;
                            String str9 = str4;
                            String str10 = str3;
                            String str11 = str5;
                            jSONObject2.put(str7, str6.split(str3)[1].replace("s//", str2).replaceAll("p//", "p://").replaceAll("包含", "包含:").replaceAll("替换", "替换:").replaceAll("序号", "序号:").replaceAll("排序", "排序:").replaceAll(str11, str9));
                            i = i3 + 1;
                            split = strArr;
                            str5 = str11;
                            str3 = str10;
                            length = i2;
                            str4 = str9;
                            str2 = str8;
                        }
                    }
                }
            } catch (JSONException unused) {
            }
            K();
            this.H = lu("播放数组", "bfjiequshuzuqian", "list_arr_pre", "").isEmpty() || lu("数组", "jiequshuzuqian", "cat_arr_pre", "").isEmpty();
            this.f = Hg("直接播放", "force_play", "0").equals("1");
            this.OG = Hg("图片代理", "PicNeedProxy", "0").equals("1");
            String Hg = Hg("调试", "debug", "");
            this.K = Hg;
            this.m = Hg.length() > 0 && !"0".equals(this.K);
            if (this.K.contains("$")) {
                this.R = Integer.parseInt(this.K.split("\\$")[1]);
                this.K = this.K.split("\\$")[0];
            }
            y = zL("编码");
            this.ZT = lu("倒序", "倒序播放", "epi_reverse", "0").equals("1");
        }
    }
}
