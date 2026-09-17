package com.wakaru.app;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Collections;
import java.util.Locale;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

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
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri != null && "appassets.androidplatform.net".equals(uri.getHost())
                        && "https".equals(uri.getScheme())) {
                    return false;
                }
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e("Wakaru", "WebView error: " + description + " (" + failingUrl + ")");
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                if (BuildConfig.DEBUG) {
                    Log.d("WakaruJS", consoleMessage.message() + " (" + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber() + ")");
                }
                return true;
            }
        });
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setGeolocationEnabled(false);
        settings.setSafeBrowsingEnabled(true);
        ttsBridge = new TTSBridge(this);
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(webView, "WakaruBridge",
                    Collections.singleton("https://appassets.androidplatform.net"),
                    new WebViewCompat.WebMessageListener() {
                        @Override
                        public void onPostMessage(WebView view, WebMessageCompat message, Uri sourceOrigin,
                                                  boolean isMainFrame, JavaScriptReplyProxy replyProxy) {
                            if (!isMainFrame) return;
                            String data = message.getData();
                            if (data == null) return;
                            if (data.startsWith("speak:")) {
                                ttsBridge.speakJapanese(data.substring(6));
                            } else if (data.equals("getVersion")) {
                                replyProxy.postMessage(BuildConfig.VERSION_NAME);
                            }
                        }
                    });
        } else {
            Log.w("Wakaru", "WEB_MESSAGE_LISTENER not supported by WebView; bridge disabled");
        }
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        setContentView(webView);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                webView.evaluateJavascript("wakaruGoBack()", value -> {
                    if (value == null || !"true".equals(value.replace("\"", ""))) {
                        finish();
                    }
                });
            }
        });
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

        public void speakJapanese(String text) {
            if (!ready || tts == null || text == null || text.isEmpty() || text.length() > 500) return;
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "wakaru_" + System.currentTimeMillis());
        }

        void stop() {
            if (tts != null) tts.stop();
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
    protected void onPause() {
        if (webView != null) webView.onPause();
        if (ttsBridge != null) ttsBridge.stop();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if (ttsBridge != null) ttsBridge.shutdown();
        if (webView != null) {
            ViewGroup parent = (ViewGroup) webView.getParent();
            if (parent != null) parent.removeView(webView);
            webView.destroy();
        }
        super.onDestroy();
    }
}
