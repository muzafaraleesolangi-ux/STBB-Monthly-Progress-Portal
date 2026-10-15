# STBB Monthly Progress — Android application

A lightweight Android application for the existing live STBB Monthly Academic Progress Portal.

## Features
- One existing school SEMIS/password account. No separate teacher registration, duplicate database or HM PIN.
- Native Home, Teachers, Monthly and Excel History shortcuts.
- Android system document picker for saving generated Excel downloads, including WebView blob downloads.
- File attachments, pull-free manual Refresh, useful offline error and Retry, Android Back behavior.
- Portal origin locked to `https://muzafaraleesolangi-ux.github.io/STBB-Monthly-Progress-Portal/`; external sites open in the device browser.
- No extra Android dangerous permissions; encrypted HTTPS-only connections and isolated app web storage.
- Existing cloud data and monthly carry-forward algorithm remain on the hosted site and Supabase.

## Build
Requires JDK 17+, Android SDK Platform 35, and Gradle 8.10.2.

```bash
gradle -p android-app :app:assembleDebug
```

The installed GitHub Actions workflow compiles and publishes `STBB-Monthly-Progress.apk` as a GitHub Release asset.

## Security / deployment notes
This is a live-site WebView application, not a fully offline native rewrite.
The debug APK is Android-debug-key-signed for sideloading, not Google Play production signing. For stable future updates, a private release signing keystore must be configured as a GitHub Actions secret; never commit the keystore or credentials to this public repository. Debug builds produced in separate CI runners may use different keys and may require uninstalling before reinstalling; school progress remains in the cloud.
