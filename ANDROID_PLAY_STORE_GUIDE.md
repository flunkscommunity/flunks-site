# 🤖 Flunks Android App - Google Play Store Guide

## 📁 Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/net/flunks/app/
│   │   │   ├── MainActivity.java        # Main entry point
│   │   │   ├── FlunksWidgetBridge.kt    # Capacitor plugin for widget sync
│   │   │   └── FlunksWidgetProvider.kt  # Home screen widget
│   │   ├── res/
│   │   │   ├── drawable/                # Widget backgrounds, splash
│   │   │   ├── layout/                  # Widget layouts
│   │   │   ├── mipmap-*/                # App icons (all densities)
│   │   │   ├── values/                  # strings.xml, styles.xml
│   │   │   └── xml/                     # Widget config
│   │   └── AndroidManifest.xml          # App manifest with deep links
│   └── build.gradle                     # App-level build config
├── build.gradle                         # Project-level build config
└── variables.gradle                     # SDK versions
```

---

## 🛠️ Building the Android App

### Prerequisites

1. **Android Studio** (latest stable version)
2. **JDK 17+** installed
3. **Node.js** and npm installed

### Build Steps

```bash
# 1. Build the web app for mobile
npm run mobile:build android

# 2. Or manually:
npm run build:mobile
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

### Build Release APK/AAB

In Android Studio:
1. **Build → Generate Signed Bundle/APK**
2. Choose **Android App Bundle** (required for Play Store)
3. Create or select your **keystore** (see Signing section below)
4. Select **release** build variant
5. Click **Create**

Output location: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔐 App Signing

### Create a Keystore (First Time Only)

```bash
keytool -genkey -v -keystore flunks-release.keystore \
  -alias flunks-key \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

**⚠️ IMPORTANT: Back up your keystore file and passwords securely! You cannot update your app without them.**

### Configure Signing in Gradle

Create `android/keystore.properties` (don't commit this!):

```properties
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=flunks-key
storeFile=../flunks-release.keystore
```

Add to `android/app/build.gradle`:

```groovy
// Add at top of file
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 📱 Google Play Console Setup

### 1. Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time registration fee
3. Complete identity verification

### 2. Create New App

1. Click **Create app**
2. Fill in app details:
   - **App name**: Flunks
   - **Default language**: English (US)
   - **App or game**: Game
   - **Free or paid**: Free

### 3. Store Listing

**App Details:**
- **Short description** (80 chars): Explore Semester Zero, collect NFTs, and earn GUM in this retro school adventure!
- **Full description** (4000 chars): [Write compelling description about Flunks]

**Graphics:**
- **App icon**: 512x512 PNG (from `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`)
- **Feature graphic**: 1024x500 PNG
- **Phone screenshots**: Min 2, 16:9 or 9:16, 320-3840px each side
- **Tablet screenshots**: 7" and 10" recommended

### 4. App Content

**Privacy Policy:**
- Required URL (host on flunks.net/privacy)

**Ads:**
- Select "No" if no ads

**Content Rating:**
- Complete IARC questionnaire
- Likely rating: Everyone / Everyone 10+

**Target Audience:**
- Select age groups (likely 13+)

**Data Safety:**
- Declare what data you collect (wallet addresses, etc.)

---

## 🚀 Release Process

### Internal Testing (Recommended First)

1. Go to **Testing → Internal testing**
2. Create new release
3. Upload your `.aab` file
4. Add testers by email
5. Click **Save** then **Review release**

### Production Release

1. Go to **Production**
2. **Create new release**
3. Upload signed `.aab` file
4. Add release notes
5. **Review and roll out**

---

## 🔄 Version Management

### Versioning in `android/app/build.gradle`:

```groovy
defaultConfig {
    applicationId "net.flunks.app"
    versionCode 1        // Increment for EVERY upload (integer)
    versionName "1.0.0"  // User-visible version (semver)
}
```

**Rules:**
- `versionCode` must increase with each upload
- `versionName` is displayed to users

---

## 🎯 Widget Configuration

The Flunks widget shows:
- GUM balance
- Daily claim status ("INSERT COIN" vs "CREDIT USED")

### Widget Files:
- `FlunksWidgetProvider.kt` - Widget logic
- `FlunksWidgetBridge.kt` - Capacitor plugin to update from web app
- `res/layout/widget_flunks_small.xml` - Widget layout
- `res/xml/flunks_widget_info.xml` - Widget metadata

### How It Works:
1. Web app calls `FlunksWidgetBridge.updateWidgetData({...})`
2. Plugin saves data to SharedPreferences
3. Widget reads from SharedPreferences on refresh

---

## 🔗 Deep Links

The app handles these deep link schemes:

| Scheme | Example | Purpose |
|--------|---------|---------|
| `flunks://` | `flunks://gum/claim` | Custom scheme for wallet callbacks |
| `https://flunks.net/*` | `https://flunks.net/app/locker` | Web app links |

---

## 🐛 Debugging

### View Logs

```bash
# Connect device and run
adb logcat | grep -i flunks
```

### Test Widget Updates

```javascript
// In browser dev tools when running on device
await FlunksWidgetBridge.updateWidgetData({
  gumBalance: 99999,
  dailyClaimed: false,
  username: 'TestUser',
  lockerNumber: 1337,
  nextClaimMinutes: 0
});
```

---

## ✅ Pre-Launch Checklist

- [ ] App icon is correct (512x512)
- [ ] Splash screen works
- [ ] Login/logout flow works
- [ ] Wallet connection works (FCL/WalletConnect)
- [ ] Widget displays and updates
- [ ] Deep links handled correctly
- [ ] No crashes in release build
- [ ] Privacy policy URL is live
- [ ] Screenshots taken on actual devices
- [ ] Release notes written

---

## 📞 Support

For issues specific to:
- **Capacitor**: [capacitorjs.com/docs](https://capacitorjs.com/docs)
- **Play Console**: [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)
- **Flow/FCL**: [developers.flow.com](https://developers.flow.com)
