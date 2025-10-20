# 🎭 Flunks Two-Mode System - Implementation Complete

## ✅ What We Built

You now have **complete control** over what users see vs. what you see during development!

## 🎯 The Two Modes

### 🌍 **Public Mode** (flunks.net)
**What beta users will see:**
- ✅ Core apps: OnlyFlunks, Profile, Radio, Chat, About
- ✅ Community features: Discord, X, Market, FHS School  
- ✅ Beta tools: Game Manual, Terminal, Clique Access
- 🚫 **Hidden:** Semester Zero, Meme Manager, MyPlace, Flappy Flunk
- 🚫 **Hidden:** Admin panels, debug tools, unreleased features

### 🔧 **Build Mode** (build.flunks.net) 
**Your private development environment:**
- ✅ **Everything from Public Mode PLUS:**
- ✨ Semester Zero (full virtual campus)
- ✨ Meme Manager, MyPlace, Flappy Flunk
- ✨ Yearbook, Icon Animation, Report Card
- ✨ **Admin Controls:** Ctrl+G (GUM), Ctrl+T (Time)
- ✨ **Debug Tools:** All APIs and diagnostics

---

## 🚀 How to Deploy

### Deploy Public Version (Beta Users):
```bash
./deploy-public.sh
vercel --prod
```

### Deploy Build Version (Private Dev):
```bash  
./deploy-build.sh
vercel --prod
```

---

## 🎮 How to Use

### 1. **Development Workflow**
- Test new features in **build mode** first
- When ready, enable them in **public mode**
- Deploy both as needed

### 2. **Feature Management**
Edit `src/utils/buildMode.ts` to control what's visible in each mode:

```typescript
public: {
  showNewFeature: false,  // Hide from public
},
build: {
  showNewFeature: true,   // Show in build mode
}
```

### 3. **Environment Control**
- **flunks.net:** `NEXT_PUBLIC_BUILD_MODE="public"`
- **build.flunks.net:** `NEXT_PUBLIC_BUILD_MODE="build"`

---

## 🐛 Debugging & Testing

### Console Commands:
```javascript
flunks.buildMode()     // Show current mode & features
flunks.permissions()   // Show app permissions debug
flunks.help()          // All available commands
```

### Local Testing:
```bash
# Test public mode
NEXT_PUBLIC_BUILD_MODE=public npm run dev

# Test build mode  
NEXT_PUBLIC_BUILD_MODE=build npm run dev
```

---

## 🎉 Result

You now have perfect control over feature visibility:

✅ **Seamless** - Same codebase, different feature sets
✅ **Flexible** - Easy to show/hide features per mode
✅ **Safe** - Test privately before public release
✅ **Professional** - Clean beta experience for users

**flunks.net** = Beta user experience
**build.flunks.net** = Your full development playground

## 📁 Key Files Created/Modified:

- `src/utils/buildMode.ts` - Feature flag system
- `src/utils/appPermissions.ts` - Updated with build mode support
- `.env.production` - Public mode config
- `.env.build` - Build mode config  
- `deploy-public.sh` - Public deployment script
- `deploy-build.sh` - Build deployment script
- `TWO_MODE_SYSTEM_GUIDE.md` - Complete usage guide

---

## 💡 Next Steps

1. **Deploy both modes** to your hosting platform
2. **Set up domains:** flunks.net (public) and build.flunks.net (private)
3. **Test the system** with different access codes
4. **Start managing features** through the build mode system
5. **Enjoy having complete control** over what users see!

**You can now safely develop new features in build mode while maintaining a clean, stable experience for your beta users on the public site.** 🎉
