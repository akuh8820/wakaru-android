package com.wakaru.app;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private TTSBridge ttsBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new AssetsPathHandler(this))
                .build();

        webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                return assetLoader.shouldInterceptRequest(Uri.parse(url));
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e("Wakaru", "WebView error: " + description + " (" + failingUrl + ")");
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("WakaruJS", consoleMessage.message() + " (" + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber() + ")");
                return true;
            }
        });
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        ttsBridge = new TTSBridge(this);
        webView.addJavascriptInterface(ttsBridge, "Android");
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        setContentView(webView);
    }

    private static class TTSBridge implements TextToSpeech.OnInitListener {
        private final Context context;
        private TextToSpeech tts;
        private volatile boolean ready = false;

        TTSBridge(Context ctx) {
            this.context = ctx;
            try {
                tts = new TextToSpeech(ctx, this);
            } catch (Exception e) {
                Log.e("Wakaru", "TTS init failed", e);
            }
        }

        @Override
        public void onInit(int status) {
            if (status == TextToSpeech.SUCCESS && tts != null) {
                int result = tts.setLanguage(Locale.JAPANESE);
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts.setLanguage(Locale.getDefault());
                }
                ready = true;
            } else {
                Log.w("Wakaru", "TTS not available, status=" + status);
            }
        }

        @JavascriptInterface
        public void speakJapanese(String text) {
            if (!ready || tts == null || text == null || text.isEmpty()) return;
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "wakaru_" + System.currentTimeMillis());
        }

        void shutdown() {
            if (tts != null) {
                tts.stop();
                tts.shutdown();
                tts = null;
            }
        }
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("wakaruGoBack()", value -> {
            if (value == null || !"true".equals(value.replace("\"", ""))) {
                finish();
            }
        });
    }

    @Override
    protected void onDestroy() {
        if (ttsBridge != null) ttsBridge.shutdown();
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
