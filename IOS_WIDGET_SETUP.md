# 🍬 Flunks iOS Widget Setup Guide

> Show your GUM balance on your Home Screen & Lock Screen!

## 📁 Files Created

```
ios/
├── FlunksWidget/                    # Widget Extension
│   ├── FlunksWidget.swift           # Main widget views (SmallWidget, MediumWidget, LargeWidget, LockScreen)
│   ├── FlunksWidgetBundle.swift     # Widget entry point
│   ├── Info.plist                   # Extension configuration
│   └── Assets.xcassets/             # Widget assets & colors
│       ├── AccentColor.colorset/
│       └── WidgetBackground.colorset/
│
└── App/App/
    ├── FlunksWidgetBridge.swift     # Capacitor plugin (Swift)
    └── FlunksWidgetBridge.m         # Capacitor plugin (Obj-C bridge)

src/
├── utils/flunksWidgetBridge.ts      # TypeScript interface
└── hooks/useWidgetSync.ts           # React hook for easy sync
```

---

## 🔧 Xcode Setup (Required)

### Step 1: Add Widget Extension Target

1. Open `ios/App/App.xcworkspace` in Xcode
2. Go to **File → New → Target**
3. Select **Widget Extension**
4. Name it: `FlunksWidget`
5. Uncheck "Include Configuration Intent"
6. Click **Finish**

### Step 2: Configure App Groups

Both the main app and widget need to share data via App Groups:

1. Select the **App** target → **Signing & Capabilities**
2. Click **+ Capability** → **App Groups**
3. Add: `group.net.flunks.app`

4. Select the **FlunksWidget** target → **Signing & Capabilities**
5. Click **+ Capability** → **App Groups**
6. Add: `group.net.flunks.app` (same ID)

### Step 3: Copy Widget Files

Copy the files from `ios/FlunksWidget/` into your Xcode project's widget target:
- `FlunksWidget.swift`
- `FlunksWidgetBundle.swift`
- `Info.plist`
- `Assets.xcassets/`

**Or**, drag the `FlunksWidget` folder directly into Xcode's project navigator.

### Step 4: Add WidgetKit Import to Main App

In your main app target, add `import WidgetKit` to `FlunksWidgetBridge.swift`.

---

## 🎨 Customizing the Widget Aesthetics

### Colors (in `FlunksWidget.swift`)

Find the `FlunksColors` struct and customize:

```swift
struct FlunksColors {
    // 🎨 CUSTOMIZE THESE TO MATCH YOUR BRAND!
    static let primary = Color(hex: "#FFD700")      // Gold/Yellow - your main accent
    static let secondary = Color(hex: "#8B5CF6")    // Purple - secondary accent
    static let accent = Color(hex: "#10B981")       // Green - success states
    static let warning = Color(hex: "#F59E0B")      // Orange - alerts
    static let backgroundDark = Color(hex: "#0f0f1a")
    static let backgroundMid = Color(hex: "#1a1a2e")
    static let textPrimary = Color.white
    static let textSecondary = Color.gray
}
```

### Widget Sizes

The widget supports 6 different configurations:
- **Small** (2x2): Just GUM balance + daily status dot
- **Medium** (4x2): Balance + locker + username + daily status
- **Large** (4x4): Full dashboard with status cards
- **Lock Screen Circular**: Tiny balance display
- **Lock Screen Rectangular**: Balance + daily status
- **Lock Screen Inline**: "🍬 12.4K GUM"

### Add Custom Icons

Replace the emoji with SF Symbols or custom images:

```swift
// Instead of Text("🍬")
Image("gum-icon")  // Custom asset
// or
Image(systemName: "star.fill")  // SF Symbol
```

---

## 📱 Using in Your React/Next.js App

### Basic Usage

```typescript
import { FlunksWidgetBridge } from '@/utils/flunksWidgetBridge';

// Update widget when GUM balance changes
await FlunksWidgetBridge.updateWidgetData({
  gumBalance: 12450,
  lockerNumber: 1337,
  username: 'FlunkStudent',
  dailyClaimed: true,
  nextClaimMinutes: 720  // 12 hours until next claim
});
```

### Using the React Hook

```typescript
import { useWidgetSync } from '@/hooks/useWidgetSync';

function GumDisplay() {
  const { syncWidget, clearWidget, isWidgetAvailable } = useWidgetSync();
  
  // Sync on data change
  useEffect(() => {
    if (user && gumBalance) {
      syncWidget({
        gumBalance,
        lockerNumber: user.lockerNumber,
        username: user.username,
        dailyClaimed: hasClaimedToday,
        nextClaimMinutes: minutesUntilNextClaim
      });
    }
  }, [user, gumBalance, hasClaimedToday]);
  
  // Clear on logout
  const handleLogout = async () => {
    await clearWidget();
    // ... rest of logout
  };
  
  return (
    <div>
      {isWidgetAvailable && (
        <p>Add the Flunks widget to your Home Screen!</p>
      )}
    </div>
  );
}
```

### Integrate with Existing GUM Hooks

Add this to your existing GUM balance hook:

```typescript
// In your useGumBalance or similar hook
import { useWidgetSync } from '@/hooks/useWidgetSync';

export function useGumBalance() {
  const [balance, setBalance] = useState(0);
  const { syncWidget, isWidgetAvailable } = useWidgetSync();
  
  // Existing balance fetch...
  
  // Add widget sync
  useEffect(() => {
    if (isWidgetAvailable && balance && user) {
      syncWidget({
        gumBalance: balance,
        lockerNumber: user.lockerNumber || 0,
        username: user.username || 'Anon',
        dailyClaimed: lastCheckIn !== null,
        nextClaimMinutes: calculateNextClaim()
      });
    }
  }, [balance, user, lastCheckIn]);
  
  return { balance, ... };
}
```

---

## 🚀 Building & Testing

## 👀 Previewing Widgets (fastest tweak loop)

Widgets can’t truly run from a "localhost" hot-reload loop (WidgetKit renders in its own extension process), but you *can* iterate quickly:

1. Open `ios/App/App.xcworkspace` in Xcode.
2. Open `ios/FlunksWidget/FlunksWidget.swift`.
3. Use the SwiftUI canvas previews at the bottom (`#Preview(as: .systemSmall/.systemMedium/.systemLarge)`).
  - Any edits to the SwiftUI widget views will re-render in the preview.
4. For a real widget run:
  - Select the `FlunksWidget` scheme/target in Xcode and Run.
  - Or run the main `App` scheme, then add the widget on the iOS Simulator Home Screen (long-press → Edit → “+” → search “Flunks”).

**Data loop while previewing:**
- The widget reads from App Group `UserDefaults` (`group.net.flunks.app`).
- The app writes values via the Capacitor plugin `FlunksWidgetBridge.updateWidgetData(...)`.
- During layout/design work, you can tweak `FlunksWidgetData.placeholder` to test numbers and states instantly.

### Test in Simulator

1. Build and run the app in Simulator
2. Go to Home Screen
3. Long press → Edit Home Screen → "+" button
4. Search for "Flunks"
5. Add the widget!

### Test Data Without Backend

Update `FlunksWidgetData.placeholder` in the Swift file:

```swift
static let placeholder = FlunksWidgetData(
    gumBalance: 99999,  // Your test value
    lockerNumber: 420,
    username: "TestUser",
    dailyClaimed: false,
    nextClaimMinutes: 0,
    lastUpdated: Date()
)
```

### Debug Widget in Xcode

1. Set scheme to `FlunksWidget`
2. Run on device/simulator
3. Widget will launch directly in preview mode

---

## 🔑 App Store Setup

### Provisioning Profile

Ensure your App Store provisioning profile includes:
- App Groups capability
- Both app and widget extension bundle IDs

### Widget Bundle ID

The widget extension needs its own bundle ID:
- Main app: `net.flunks.app`
- Widget: `net.flunks.app.FlunksWidget`

---

## 💡 Pro Tips

### 1. Widget Refresh Rate
Widgets don't update in real-time. They refresh:
- When `WidgetCenter.shared.reloadAllTimelines()` is called
- Based on the timeline policy (currently 30 min)
- When iOS decides to (battery optimized)

### 2. Data Sharing Architecture
```
┌────────────────┐     UserDefaults      ┌─────────────────┐
│  Capacitor App │  ←──────────────────→ │   iOS Widget    │
│  (JavaScript)  │   (App Groups)        │    (SwiftUI)    │
└────────────────┘                       └─────────────────┘
        ↓
  FlunksWidgetBridge.swift
        ↓
  UserDefaults(suiteName: "group.net.flunks.app")
```

### 3. Offline Support
The widget reads from local storage, so it works even when offline!
Data persists until the app updates it or clears it on logout.

---

## 🐛 Troubleshooting

### Widget Shows "Empty State"
1. Make sure `updateWidgetData()` is being called
2. Check App Group ID matches in both targets
3. Verify data is saved: call `getWidgetData()` and log it

### Widget Doesn't Appear in Widget Gallery
1. Build the widget target at least once
2. Make sure `FlunksWidgetBundle` has `@main` attribute
3. Check Info.plist has correct extension point

### Data Not Syncing
1. Confirm App Groups is enabled in **both** targets
2. Check the group ID is exactly `group.net.flunks.app`
3. Look for errors in Xcode console

---

## 🎯 What's Next?

Ideas for future widget enhancements:
- **Interactive Widgets** (iOS 17+): Tap to claim daily GUM
- **Live Activities**: Real-time GUM earning during games
- **Leaderboard Widget**: Show your rank
- **NFT Gallery Widget**: Cycle through your Flunks
- **Dynamic Island**: Show GUM when earning

---

Happy coding! 🎮✨
