package pk.edu.stbbprogress;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.ConnectivityManager;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.graphics.drawable.GradientDrawable;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;

/**
 * Secure native shell for the LIVE school portal. The website remains the single
 * source of truth for SEMIS auth, teacher tabs, chapter carry-forward and exports.
 *
 * No addJavascriptInterface: blob downloads use origin-bound evaluateJavascript,
 * read back in small chunks, and save through Android's system document picker.
 */
public final class MainActivity extends Activity {
    private static final String START_URL =
        "https://muzafaraleesolangi-ux.github.io/STBB-Monthly-Progress-Portal/";
    private static final String ORIGIN = "https://muzafaraleesolangi-ux.github.io";
    private static final int REQUEST_FILE = 101;
    private static final int REQUEST_SAVE = 102;
    private static final int MAX_DOWNLOAD = 18 * 1024 * 1024;
    private static final int BLOB_CHUNK = 24576;

    private final int NAVY = Color.rgb(21, 46, 68);
    private final int TEAL = Color.rgb(22, 127, 136);
    private final int MUTED = Color.rgb(104, 124, 138);
    private final int BG = Color.rgb(245, 249, 251);
    private final Handler handler = new Handler(Looper.getMainLooper());
    private WebView browser;
    private FrameLayout page;
    private LinearLayout offlinePane;
    private ProgressBar progress;
    private TextView subtitle;
    private TextView[] tabViews = new TextView[4];
    private ValueCallback<Uri[]> uploadCallback;
    private byte[] pendingSave;
    private String pendingName;
    private boolean downloadBusy = false;
    private int pollCount = 0;
    private int activeTab = 0;
    private boolean loadedOnce = false;
    private StringBuilder blobData;
    private int blobLength = 0;

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private GradientDrawable shape(int color, int radius) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(dp(radius));
        return drawable;
    }

    private TextView text(String value, float size, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(color);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        view.setGravity(Gravity.CENTER_VERTICAL);
        return view;
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(NAVY);
        getWindow().setNavigationBarColor(BG);
        if (Build.VERSION.SDK_INT >= 26) {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        }
        buildChrome();
        configureWebView();
        browser.loadUrl(START_URL);
    }

    private void buildChrome() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);
        setContentView(root);

        LinearLayout header = new LinearLayout(this);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setPadding(dp(13), dp(7), dp(11), dp(7));
        header.setBackgroundColor(NAVY);
        root.addView(header, new LinearLayout.LayoutParams(-1, dp(60)));

        TextView emblem = text("S", 22, Color.WHITE, true);
        emblem.setGravity(Gravity.CENTER);
        emblem.setBackground(shape(TEAL, 11));
        header.addView(emblem, new LinearLayout.LayoutParams(dp(42), dp(42)));

        LinearLayout labels = new LinearLayout(this);
        labels.setPadding(dp(10), 0, 0, 0);
        labels.setOrientation(LinearLayout.VERTICAL);
        labels.setGravity(Gravity.CENTER_VERTICAL);
        header.addView(labels, new LinearLayout.LayoutParams(0, -1, 1));

        TextView title = text("STBB Monthly Progress", 14, Color.WHITE, true);
        labels.addView(title);
        subtitle = text("One school login · Classes I–XII", 10, Color.rgb(192, 222, 231), false);
        labels.addView(subtitle);

        TextView refresh = text("↻", 27, Color.WHITE, false);
        refresh.setContentDescription("Refresh portal");
        refresh.setGravity(Gravity.CENTER);
        refresh.setBackground(shape(Color.rgb(39, 79, 102), 10));
        header.addView(refresh, new LinearLayout.LayoutParams(dp(42), dp(42)));
        refresh.setOnClickListener(v -> reload());

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        if (Build.VERSION.SDK_INT >= 21) progress.setProgressTintList(android.content.res.ColorStateList.valueOf(TEAL));
        root.addView(progress, new LinearLayout.LayoutParams(-1, dp(3)));
        progress.setVisibility(View.INVISIBLE);

        page = new FrameLayout(this);
        root.addView(page, new LinearLayout.LayoutParams(-1, 0, 1));
        browser = new WebView(this);
        browser.setBackgroundColor(Color.WHITE);
        page.addView(browser, new FrameLayout.LayoutParams(-1, -1));

        offlinePane = new LinearLayout(this);
        offlinePane.setOrientation(LinearLayout.VERTICAL);
        offlinePane.setGravity(Gravity.CENTER);
        offlinePane.setPadding(dp(20), dp(22), dp(20), dp(22));
        offlinePane.setBackgroundColor(BG);
        TextView icon = text("↻", 38, TEAL, true);
        icon.setGravity(Gravity.CENTER);
        offlinePane.addView(icon, new LinearLayout.LayoutParams(-1, dp(60)));
        TextView headline = text("Connection unavailable", 18, NAVY, true);
        headline.setGravity(Gravity.CENTER);
        offlinePane.addView(headline);
        TextView help = text(
            "The portal uses live school data. Check your internet connection, then retry. Your saved school reports remain in the cloud.",
            12, MUTED, false);
        help.setPadding(0, dp(12), 0, dp(18));
        help.setGravity(Gravity.CENTER);
        offlinePane.addView(help);
        TextView retry = text("Retry Portal", 13, Color.WHITE, true);
        retry.setGravity(Gravity.CENTER);
        retry.setBackground(shape(TEAL, 11));
        offlinePane.addView(retry, new LinearLayout.LayoutParams(dp(160), dp(44)));
        retry.setOnClickListener(v -> reload());
        page.addView(offlinePane, new FrameLayout.LayoutParams(-1, -1));
        offlinePane.setVisibility(View.GONE);

        LinearLayout bottom = new LinearLayout(this);
        bottom.setOrientation(LinearLayout.HORIZONTAL);
        bottom.setGravity(Gravity.CENTER_VERTICAL);
        bottom.setPadding(dp(4), dp(3), dp(4), dp(5));
        bottom.setBackgroundColor(Color.WHITE);
        root.addView(bottom, new LinearLayout.LayoutParams(-1, dp(59)));

        String[] names = {"Home", "Teachers", "Months", "History"};
        String[] icons = {"⌂", "♧", "▤", "▣"};
        for (int i = 0; i < 4; i++) {
            final int index = i;
            LinearLayout cell = new LinearLayout(this);
            cell.setOrientation(LinearLayout.VERTICAL);
            cell.setGravity(Gravity.CENTER);
            cell.setBackground(shape(i == 0 ? Color.rgb(231, 245, 247) : Color.WHITE, 9));

            TextView glyph = text(icons[i], 18, i == 0 ? TEAL : MUTED, true);
            glyph.setGravity(Gravity.CENTER);
            cell.addView(glyph);
            TextView caption = text(names[i], 10, i == 0 ? TEAL : MUTED, true);
            caption.setGravity(Gravity.CENTER);
            cell.addView(caption);
            tabViews[i] = glyph;
            glyph.setTag(caption);

            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(49), 1);
            lp.setMargins(dp(2), 0, dp(2), 0);
            bottom.addView(cell, lp);
            cell.setOnClickListener(v -> openTab(index));
        }
    }

    private void configureWebView() {
        WebSettings s = browser.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setDefaultTextEncodingName("UTF-8");
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setSupportMultipleWindows(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        if (Build.VERSION.SDK_INT >= 21) {
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            CookieManager.getInstance().setAcceptThirdPartyCookies(browser, false);
        }
        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= 26) s.setSafeBrowsingEnabled(true);
        browser.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return routeUrl(request.getUrl());
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                progress.setVisibility(View.VISIBLE);
                progress.setProgress(8);
                offlinePane.setVisibility(View.GONE);
            }
            @Override public void onPageFinished(WebView view, String url) {
                loadedOnce = true;
                progress.setVisibility(View.INVISIBLE);
                CookieManager.getInstance().flush();
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    offlinePane.setVisibility(View.VISIBLE);
                    progress.setVisibility(View.INVISIBLE);
                }
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
                offlinePane.setVisibility(View.VISIBLE);
                message("Security check failed. Could not open an unsafe connection.");
            }
        });
        browser.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int value) {
                progress.setProgress(value);
                if (value >= 100) progress.setVisibility(View.INVISIBLE);
            }
            @Override public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (uploadCallback != null) uploadCallback.onReceiveValue(null);
                uploadCallback = callback;
                try {
                    Intent chooser = params.createIntent();
                    chooser.addCategory(Intent.CATEGORY_OPENABLE);
                    startActivityForResult(chooser, REQUEST_FILE);
                    return true;
                } catch (Exception ex) {
                    uploadCallback = null;
                    callback.onReceiveValue(null);
                    message("File picker is unavailable.");
                    return false;
                }
            }
        });
        browser.setDownloadListener((url, userAgent, contentDisposition, mimeType, length) -> {
            if (downloadBusy) {
                message("A file is already being prepared.");
                return;
            }
            String filename = "STBB-Monthly-Progress.xlsx";
            try {
                String guess = android.webkit.URLUtil.guessFileName(url, contentDisposition, mimeType);
                if (guess != null && guess.toLowerCase(Locale.ROOT).endsWith(".xlsx")) filename = guess;
            } catch (Exception ignored) {}
            filename = safeName(filename);
            if (url != null && url.startsWith("blob:")) {
                if (!browser.getUrl().startsWith(START_URL)) {
                    message("Untrusted download blocked.");
                    return;
                }
                startBlobDownload(url, filename);
            } else if (url != null && url.startsWith("https://")) {
                startHttpDownload(url, filename);
            } else {
                message("This file format cannot be downloaded safely.");
            }
        });
    }

    private boolean routeUrl(Uri uri) {
        String url = uri == null ? "" : uri.toString();
        if (url.startsWith(START_URL) || url.equals(ORIGIN) || url.startsWith("about:blank")) return false;
        String scheme = uri == null ? "" : uri.getScheme();
        if (scheme == null) return true;
        if (!(scheme.equals("https") || scheme.equals("http") || scheme.equals("mailto") || scheme.equals("tel"))) {
            message("Unsupported external link.");
            return true;
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ex) {
            message("No application could open that link.");
        }
        return true;
    }

    private void reload() {
        offlinePane.setVisibility(View.GONE);
        if (browser.getUrl() == null || browser.getUrl().startsWith("about:")) browser.loadUrl(START_URL);
        else browser.reload();
    }

    private void selectTab(int index) {
        activeTab = index;
        for (int i = 0; i < 4; i++) {
            LinearLayout parent = (LinearLayout) tabViews[i].getParent();
            boolean active = i == index;
            parent.setBackground(shape(active ? Color.rgb(231, 245, 247) : Color.WHITE, 9));
            tabViews[i].setTextColor(active ? TEAL : MUTED);
            ((TextView)tabViews[i].getTag()).setTextColor(active ? TEAL : MUTED);
        }
        String[] names = {"School Home", "Teachers & Subjects", "Monthly Progress", "Excel History"};
        subtitle.setText(names[index] + " · Online");
    }

    private void openTab(int index) {
        offlinePane.setVisibility(View.GONE);
        if (browser.getUrl() == null) {
            browser.loadUrl(START_URL);
            return;
        }
        String[] sections = {"overview", "teachers", "overview", "history"};
        String tab = sections[index];
        // Operates on the real website functions; no duplicate login or database.
        String script = "(function(){try{" +
            "if(typeof auth==='undefined'||!auth){if(typeof show==='function')show('signin');return 'LOGIN';}" +
            "if(auth.admin)return 'ADMIN';" +
            "if(typeof show!=='function'||typeof dashTab!=='function')return 'WAIT';" +
            "var a=Array.from(document.querySelectorAll('#schoolTabs button'));" +
            "var b=a.find(function(x){return(x.getAttribute('onclick')||'').indexOf(\\\"dashTab('"+tab+"'\\\")>=0;});" +
            "if(!b)return 'WAIT';show('schooldash');dashTab('"+tab+"',b);" +
            (index == 2 ? "setTimeout(function(){var m=document.getElementById('newMonthName');if(m)m.scrollIntoView({block:'center',behavior:'smooth'});},120);" : "") +
            "return 'OK';}catch(e){return 'ERROR';}})()";
        browser.evaluateJavascript(script, result -> {
            if (result != null && result.contains("LOGIN")) message("Please sign in using your school SEMIS and password.");
            else if (result != null && result.contains("WAIT")) message("Portal is loading. Please retry.");
            else if (result != null && result.contains("ADMIN")) message("Administrator tools are available in the web dashboard.");
            else if (result != null && result.contains("ERROR")) message("Please refresh the portal to use this tab.");
            else selectTab(index);
        });
    }

    private void startBlobDownload(String url, String filename) {
        downloadBusy = true;
        pendingName = safeName(filename);
        pollCount = 0;
        message("Preparing your Excel file…");
        String js = "(function(){" +
            "window.__stbbFileState='loading';window.__stbbBase64='';" +
            "fetch(" + JSONObject.quote(url) + ").then(function(r){if(!r.ok)throw Error('Download failed');return r.arrayBuffer();})" +
            ".then(function(buf){if(buf.byteLength>" + MAX_DOWNLOAD + ")throw Error('File is too large');" +
            "var bytes=new Uint8Array(buf),parts=[];" +
            "for(var i=0;i<bytes.length;i+=12288){parts.push(btoa(String.fromCharCode.apply(null,bytes.subarray(i,i+12288))));}" +
            "window.__stbbBase64=parts.join('');window.__stbbFileState='ready';})" +
            ".catch(function(e){window.__stbbFileState='error';});return 'started';})()";
        browser.evaluateJavascript(js, ignored -> handler.postDelayed(this::pollBlob, 180));
    }

    private void pollBlob() {
        if (!downloadBusy) return;
        if (++pollCount > 150) {
            finishDownloadError("File preparation timed out. Retry from Report History.");
            return;
        }
        browser.evaluateJavascript("String(window.__stbbFileState||'loading')", result -> {
            if (!downloadBusy) return;
            if ("\"ready\"".equals(result)) {
                browser.evaluateJavascript("String(window.__stbbBase64.length)", len -> {
                    try {
                        blobLength = Integer.parseInt(len.replace("\"", ""));
                        if (blobLength <= 0 || blobLength > MAX_DOWNLOAD * 2) throw new Exception();
                        blobData = new StringBuilder(blobLength);
                        readBlobChunk(0);
                    } catch (Exception e) {
                        finishDownloadError("Invalid Excel download data.");
                    }
                });
            } else if ("\"error\"".equals(result)) {
                finishDownloadError("Cannot read the Excel file. Try again.");
            } else {
                handler.postDelayed(this::pollBlob, 180);
            }
        });
    }

    private void readBlobChunk(int offset) {
        if (!downloadBusy) return;
        if (offset >= blobLength) {
            try {
                pendingSave = Base64.decode(blobData.toString(), Base64.DEFAULT);
                browser.evaluateJavascript("window.__stbbBase64='';window.__stbbFileState='';", null);
                downloadBusy = false;
                launchSavePicker(pendingName);
            } catch (Exception e) {
                finishDownloadError("Excel file decoding failed.");
            }
            return;
        }
        int end = Math.min(blobLength, offset + BLOB_CHUNK);
        browser.evaluateJavascript("window.__stbbBase64.slice(" + offset + "," + end + ")", response -> {
            try {
                String chunk = new JSONArray("[" + response + "]").getString(0);
                if (chunk == null || chunk.length() != end - offset) throw new Exception();
                blobData.append(chunk);
                readBlobChunk(end);
            } catch (Exception e) {
                finishDownloadError("Excel file transfer was interrupted.");
            }
        });
    }

    private void startHttpDownload(String url, String filename) {
        downloadBusy = true;
        pendingName = filename;
        message("Downloading file…");
        new Thread(() -> {
            HttpURLConnection conn = null;
            try {
                conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(20000);
                conn.setRequestProperty("User-Agent", browser.getSettings().getUserAgentString());
                String cookies = CookieManager.getInstance().getCookie(url);
                if (cookies != null) conn.setRequestProperty("Cookie", cookies);
                if (conn.getResponseCode() < 200 || conn.getResponseCode() >= 300) throw new Exception("HTTP download failed");
                try (InputStream stream = conn.getInputStream(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                    byte[] buffer = new byte[16384];
                    int len;
                    while ((len = stream.read(buffer)) >= 0) {
                        if (output.size() + len > MAX_DOWNLOAD) throw new Exception("File too large");
                        output.write(buffer, 0, len);
                    }
                    pendingSave = output.toByteArray();
                }
                handler.post(() -> {downloadBusy = false;launchSavePicker(pendingName);});
            } catch (Exception e) {
                handler.post(() -> finishDownloadError("Download failed. Check your connection and retry."));
            } finally { if (conn != null) conn.disconnect(); }
        }).start();
    }

    private void launchSavePicker(String filename) {
        if (pendingSave == null || pendingSave.length == 0) {
            finishDownloadError("Downloaded file is empty.");
            return;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.setType(filename.endsWith(".xlsx")
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "application/octet-stream");
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.putExtra(Intent.EXTRA_TITLE, safeName(filename));
            startActivityForResult(intent, REQUEST_SAVE);
        } catch (Exception error) {
            message("Could not open the Android file save dialog.");
            pendingSave = null;
        }
    }

    private String safeName(String name) {
        String val = name == null ? "STBB-Monthly-Progress.xlsx" : name;
        val = val.replaceAll("[^a-zA-Z0-9._() -]", "_");
        if (val.length() > 90) val = val.substring(0, 90);
        return val.isEmpty() ? "STBB-Monthly-Progress.xlsx" : val;
    }

    private void finishDownloadError(String text) {
        downloadBusy = false;
        browser.evaluateJavascript("window.__stbbBase64='';window.__stbbFileState='';", null);
        blobData = null;
        message(text);
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == REQUEST_FILE) {
            if (uploadCallback != null) {
                uploadCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
                uploadCallback = null;
            }
        } else if (request == REQUEST_SAVE) {
            if (result == RESULT_OK && data != null && data.getData() != null && pendingSave != null) {
                try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
                    if (output == null) throw new Exception("Save output not available");
                    output.write(pendingSave);
                    output.flush();
                    message("Excel saved to the selected folder.");
                } catch (Exception e) {
                    message("Unable to save file. Please retry.");
                }
            }
            pendingSave = null;
        }
    }

    private void message(String text) {
        Toast.makeText(this, text, Toast.LENGTH_LONG).show();
    }

    @Override public void onBackPressed() {
        if (offlinePane.getVisibility() == View.VISIBLE) {
            reload();return;
        }
        if (activeTab != 0) {
            openTab(0);
            return;
        }
        if (browser.canGoBack()) {
            browser.goBack();
            return;
        }
        new AlertDialog.Builder(this)
            .setTitle("Exit STBB Monthly Progress?")
            .setMessage("Your cloud-saved reports will remain in your school account.")
            .setNegativeButton("Stay", (dialog, which) -> dialog.dismiss())
            .setPositiveButton("Exit", (dialog, which) -> finish())
            .show();
    }

    @Override public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }

    @Override protected void onDestroy() {
        if (browser != null) {
            page.removeView(browser);
            browser.destroy();
        }
        super.onDestroy();
    }
}
