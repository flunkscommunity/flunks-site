# 🎭 Flunks Two-Mode System Guide

## 🌐 Overview

Your Flunks website now supports **two distinct modes**:

1. **Public Mode** (`flunks.net`) - What beta users see
2. **Build Mode** (`build.flunks.net`) - Your private development environment

## 🎯 Mode Comparison

### 🌍 Public Mode (flunks.net)
**Perfect for beta users and public access**

#### ✅ Available Features:
- **Core Apps:** OnlyFlunks, My Locker, Profile Creation
- **Communication:** Radio, Chat Rooms, Discord, X (Twitter)
- **Community:** About Us, Market, FHS School
- **Beta Features:** Game Manual, Terminal, Clique Access

#### 🚫 Hidden Features:
- Semester Zero (virtual campus)
- Meme Manager
- MyPlace (social networking)
- Flappy Flunk game
- Yearbook
- Icon Animation Lab
- Admin panels and debug tools

---

### 🔧 Build Mode (build.flunks.net)
**Your private development playground**

#### ✅ Available Features:
- **Everything from Public Mode PLUS:**
- ✨ Semester Zero (full virtual campus)
- ✨ Meme Manager (content management)
- ✨ MyPlace (social features)
- ✨ Flappy Flunk (game)
- ✨ Yearbook & Icon Animation
- ✨ **Admin Controls:** Ctrl+G (GUM panel), Ctrl+T (Time admin)
- ✨ **Debug Tools:** All testing APIs and diagnostics

## 🚀 Deployment Instructions

### Deploy Public Mode (Beta Users)
```bash
# Build and deploy public version
./deploy-public.sh
vercel --prod
```

### Deploy Build Mode (Private Dev)
```bash
# Build and deploy development version
./deploy-build.sh
vercel --prod
```

## 🎮 Access Control

### Public Mode Access
- Requires beta access code
- Shows limited feature set
- Perfect for community testing

### Build Mode Access  
- Requires admin access code
- Shows all features including unreleased ones
- Private development environment

## 🔧 Environment Configuration

### For flunks.net (Public):
```env
NEXT_PUBLIC_BUILD_MODE="public"
NEXT_PUBLIC_ACCESS_REQUIRED="true"
NEXT_PUBLIC_ORIGIN="https://flunks.net"
```

### For build.flunks.net (Private):
```env
NEXT_PUBLIC_BUILD_MODE="build"  
NEXT_PUBLIC_ACCESS_REQUIRED="true"
NEXT_PUBLIC_ORIGIN="https://build.flunks.net"
```

## 🎛️ Managing Features

### Adding New Features:
1. Add feature flag to `src/utils/buildMode.ts`
2. Update app permissions in `src/utils/appPermissions.ts`  
3. Test in build mode first
4. When ready, enable in public mode

### Example - Adding a New App:
```typescript
// In buildMode.ts
public: {
  showNewFeature: false,  // Hidden from public
  // ... other settings
},
build: {
  showNewFeature: true,   // Visible in build mode
  // ... other settings  
}

// In appPermissions.ts
{
  id: 'new-feature',
  title: 'New Feature',
  requiredLevel: ['ADMIN'],
  buildModeFeature: 'showNewFeature'  // Links to build mode flag
}
```

## 🐛 Debugging

### Check Current Mode:
```javascript
// In browser console
flunks.buildMode()  // Shows current build mode and features
flunks.permissions() // Shows app permissions and access levels
```

### Debug Commands:
```bash
# Test build mode locally
NEXT_PUBLIC_BUILD_MODE=build npm run dev

# Test public mode locally  
NEXT_PUBLIC_BUILD_MODE=public npm run dev
```

## 🔄 Workflow

### Development Process:
1. **Develop** new features in build mode
2. **Test** thoroughly in private environment
3. **Enable** features in public mode when ready
4. **Deploy** both modes as needed

### Release Process:
1. Build and test in build mode
2. Update public mode configuration
3. Deploy public mode to flunks.net
4. Monitor and gather feedback

## 💡 Pro Tips

- **Use build mode** to test new features without affecting users
- **Public mode** gives you confidence in what users actually see
- **Environment variables** can be changed without redeployment in Vercel
- **Access codes** work the same in both modes
- **Console commands** help debug which mode you're in

---

## 🎉 Result

You now have complete control over feature visibility:
- **flunks.net** = Clean beta experience for users
- **build.flunks.net** = Full-featured development environment
- **Seamless** feature management and deployment
