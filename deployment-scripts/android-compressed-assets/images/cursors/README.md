# 🖱️ Custom Cursor Instructions

## Ready-to-Use Cursor Files

Place these cursor images in `/public/images/cursors/`:

### 1. **Windows 95 Style Cursors**
You can download these from:
- `default.png` - Standard arrow cursor (24x24px)
- `pointer.png` - Hand pointing cursor (24x24px)  
- `text.png` - I-beam text cursor (24x24px)
- `wait.png` - Hourglass/loading cursor (24x24px)
- `help.png` - Question mark cursor (24x24px)
- `grab.png` - Open hand cursor (24x24px)
- `grabbing.png` - Closed hand cursor (24x24px)

### 2. **DIY Pixel Art Cursors**
Create 24x24px PNG files with these designs:

```
Default Arrow (default.png):
██████████
██▓▓▓▓▓▓██
██▓▓▓▓▓██
██▓▓▓▓██
██▓▓▓██
██▓▓██
██▓██
██▓██
██▓▓██
██▓▓▓██
██████

Pointer Hand (pointer.png):
    ██████
  ██▓▓▓▓▓▓██
██▓▓▓▓▓▓▓▓██
██▓▓▓▓▓▓▓▓██
██▓▓▓▓▓▓▓▓██
  ██▓▓▓▓▓▓██
    ██████

Text Cursor (text.png):
██████████
██      ██
██  ██  ██
    ██
    ██
    ██
    ██
██  ██  ██
██      ██
██████████
```

### 3. **CSS Implementation**
The cursors are already configured in `globals.css`:

```css
html, body {
  cursor: url('/images/cursors/default.png'), auto;
}

a, button, [role="button"] {
  cursor: url('/images/cursors/pointer.png'), pointer;
}

input, textarea {
  cursor: url('/images/cursors/text.png'), text;
}
```

### 4. **Quick Test**
To test immediately without images, use these CSS-only cursors:

```css
.cursor-crosshair { cursor: crosshair; }
.cursor-move { cursor: move; }
.cursor-not-allowed { cursor: not-allowed; }
.cursor-zoom-in { cursor: zoom-in; }
.cursor-zoom-out { cursor: zoom-out; }
```

### 5. **React Component Usage**
For animated cursors, import the CustomCursor component:

```tsx
import CustomCursor from 'components/CustomCursor';

// In your component:
<CustomCursor type="retro" color="#ff69b4" />
<CustomCursor type="pixel" color="#00ff00" />
<CustomCursor type="glitch" color="#ff0000" />
```

## 🎨 Cursor Options Available:

### **CSS-Only (Works Now):**
- ✅ crosshair
- ✅ move  
- ✅ not-allowed
- ✅ zoom-in/zoom-out
- ✅ grab/grabbing

### **With Custom Images:**
- 🖱️ Windows 95 style cursors
- 🎮 Pixel art cursors  
- 🌈 Custom colored cursors

### **React Component:**
- ✨ Animated cursor effects
- 🎭 Click animations
- 🔥 Glitch effects
- 💫 Color transitions

## 🚀 Next Steps:

1. **Test CSS cursors** - They work immediately!
2. **Create pixel art cursor images** (24x24px PNG files)
3. **Add CustomCursor component** to your main layout
4. **Customize colors** to match your theme

Your 90s retro theme would look amazing with pixelated cursors! 🎯
