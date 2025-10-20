# 🎮 Flunky Uppy Start Screen Upload Guide

## ✅ **Completed Changes**
- ✅ All references changed from "Flunk Jump" to "Flunky Uppy"
- ✅ Game directory renamed: `/public/Games/Flunky Uppy/`
- ✅ Component file paths updated
- ✅ Window IDs and feature flags updated
- ✅ Start screen text updated to show "FLUNKY UPPY"

## 📍 **Start Screen Upload Location**

Upload your new start screen image to:
```
/public/Games/Flunky Uppy/start-screens/
```

### Recommended File Names:
- `start-screen.png` or `start-screen.jpg`
- `flunky-uppy-start.png`
- `main-start-screen.webp`

### Image Specifications:
- **Recommended dimensions**: 400px x 600px (to match game area)
- **Supported formats**: `.png`, `.jpg`, `.jpeg`, `.webp`
- **File size**: Keep under 500KB for fast loading
- **Aspect ratio**: 2:3 (same as the game area)

## 🔧 **Implementation Steps**

After uploading your start screen image, you'll need to modify the start screen component:

### 1. Update the StartScreen styled component in:
`/src/windows/Games/FlunkJumpWindow.tsx`

**Current code (lines ~35-45):**
```tsx
const StartScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  transition: opacity 0.3s ease;
`;
```

**Replace with:**
```tsx
const StartScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/Games/Flunky Uppy/start-screens/your-image-name.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  transition: opacity 0.3s ease;
`;
```

### 2. Optional: Remove or modify the text overlay

If your uploaded image includes the game title and "click to start" text, you can remove or modify the text elements:

**Current text elements (lines ~180-190):**
```tsx
<StartScreen onClick={startGame}>
  <StartTitle>FLUNKY UPPY</StartTitle>
  <StartButton>CLICK TO START</StartButton>
  <Instructions>
    Use ARROW KEYS to move<br />
    MOBILE: Tilt device or tap sides
  </Instructions>
</StartScreen>
```

**Option A: Keep text overlay with transparency:**
```tsx
<StartScreen onClick={startGame}>
  <StartTitle style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>FLUNKY UPPY</StartTitle>
  <StartButton style={{background: 'rgba(255,71,87,0.9)'}}>CLICK TO START</StartButton>
  <Instructions style={{background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px'}}>
    Use ARROW KEYS to move<br />
    MOBILE: Tilt device or tap sides
  </Instructions>
</StartScreen>
```

**Option B: Remove text if included in image:**
```tsx
<StartScreen onClick={startGame}>
  {/* Image contains all text, so no overlay needed */}
</StartScreen>
```

## 🎨 **Design Tips**

### For your start screen image:
1. **Include the game title**: "FLUNKY UPPY" in a prominent, fun font
2. **Add call-to-action**: "CLICK TO START" or "TAP TO PLAY"
3. **Show controls**: Arrow key icons or mobile gestures
4. **Match the game aesthetic**: Use colors/style that fits your game theme
5. **Keep it engaging**: Bright, colorful, and exciting to encourage play

### Color scheme suggestions:
- **Retro gaming**: Neon colors on dark background
- **Classic arcade**: Bold primary colors
- **Modern**: Gradients and clean typography
- **Flunks theme**: Match your existing site colors

## 📂 **Current File Structure**
```
/public/Games/Flunky Uppy/
├── start-screens/          ← Upload your image here
├── background.png          (Game background)
├── flunko-up.png          (Character jumping sprite)
├── flunko-down.png        (Character falling sprite)
├── flunko-up-L.png        (Character jumping left)
├── flunko-down-L.png      (Character falling left)
├── platform.png           (Platform image)
├── doodler-guy.png        (Character default sprite)
├── index.html             (Game HTML file)
├── index.js               (Game JavaScript)
├── style.css              (Game styles)
└── README.md              (Game documentation)
```

## 🚀 **Quick Start**
1. Upload your start screen image to `/public/Games/Flunky Uppy/start-screens/`
2. Note the exact filename
3. Update the `background-image` URL in the StartScreen styled component
4. Test the game to ensure the image loads correctly
5. Adjust text overlay styling as needed