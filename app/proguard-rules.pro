# Keep TTSBridge and @JavascriptInterface methods
-keepclassmembers class com.wakaru.app.MainActivity$TTSBridge {
    @android.webkit.JavascriptInterface <methods>;
}
