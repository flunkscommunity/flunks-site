# 🎨 Custom Scrolling Background System

Your Flunks site now has a powerful scrolling background system that lets you use any image with smooth scrolling animations!

## 🚀 Quick Start

### 1. Add Your Custom Image

**Option A: Local File (Recommended)**
1. Upload your image to `public/images/backgrounds/` in your project
2. Name it something memorable like `my-background.jpg`
3. Edit `src/config/backgroundConfig.ts` and set: `imageUrl: "/images/backgrounds/my-background.jpg"`

**Option B: External Hosting**
1. Upload your image to an image hosting service like [Imgur](https://imgur.com)
2. Copy the direct image URL (should end with .jpg, .png, .gif, etc.)
3. Edit `src/config/backgroundConfig.ts` and replace the `imageUrl` value

### 2. Choose Your Animation Style

Open `src/config/backgroundConfig.ts` and set the `pattern` to one of these options:

- **`"crawl"`** - Slow diagonal crawling effect (like the current green grid)
- **`"diagonal"`** - Matrix rain-style diagonal movement 
- **`"horizontal"`** - Smooth left-to-right scrolling
- **`"vertical"`** - Top-to-bottom scrolling 
- **`"matrix"`** - Complex matrix-style movement pattern
- **`"none"`** - Static background (no animation)

### 3. Customize the Speed & Appearance

In the same config file, you can adjust:

- **`speed`** - Animation duration in seconds (higher = slower)
  - Recommended: 15-60 seconds
- **`opacity`** - Background visibility (0-1)
  - 0.6 = subtle, 1.0 = fully visible
- **`tileSize`** - How big each image tile appears
  - 25 = small tiles, 50 = medium, 100 = large

## 📖 Examples

### Local File Example
```typescript
export const BACKGROUND_CONFIG = {
  imageUrl: "/images/backgrounds/my-awesome-background.jpg", // Local file
  enableScrolling: true,
  pattern: "diagonal",
  speed: 20,
  opacity: 0.7,
  tileSize: 30
};
```

### External URL Example  
```typescript
export const BACKGROUND_CONFIG = {
  imageUrl: "https://i.imgur.com/your-matrix-image.jpg", // External URL
  enableScrolling: true,
  pattern: "diagonal",
  speed: 20,
  opacity: 0.7,
  tileSize: 30
};
```

### Slow Wallpaper Crawl
```typescript
export const BACKGROUND_CONFIG = {
  imageUrl: "https://i.imgur.com/your-wallpaper.jpg", 
  enableScrolling: true,
  pattern: "crawl",
  speed: 45,
  opacity: 0.8,
  tileSize: 50
};
```

### Static Background
```typescript
export const BACKGROUND_CONFIG = {
  imageUrl: "https://i.imgur.com/your-background.jpg",
  enableScrolling: false,
  pattern: "none",
  speed: 0,
  opacity: 1,
  tileSize: 100
};
```

## 🖼️ Image Recommendations

### For Best Results:
- **Size**: 500x500px to 1000x1000px works well
- **Format**: JPG, PNG, or GIF
- **Quality**: Medium to high quality
- **Content**: Images that tile well look best with smaller `tileSize` values

### Great Image Sources:
- Your own artwork or photos
- Pixel art patterns
- Textures and patterns from sites like [Subtle Patterns](https://subtlepatterns.com)
- Gaming-themed wallpapers
- Abstract patterns

## 🛠️ Advanced Usage

### Using Presets
Instead of customizing individual values, you can use one of the built-in presets:

```typescript
import { BACKGROUND_PRESETS } from "config/backgroundConfig";

// Replace BACKGROUND_CONFIG with any preset:
export const BACKGROUND_CONFIG = {
  imageUrl: "your-image-url-here",
  ...BACKGROUND_PRESETS.matrixRain
};
```

Available presets:
- `matrixRain` - Fast diagonal rain effect
- `slowCrawl` - Gentle crawling motion
- `fastScroll` - Quick horizontal scroll
- `staticBackground` - No animation

### Creating Multiple Themes
You can create different background configurations for different sections by modifying the `MonitorScreenWrapper` in `src/pages/index.tsx`.

## 🔧 Troubleshooting

### Image Not Showing?
- Make sure the URL is publicly accessible
- Check that the URL ends with an image extension (.jpg, .png, etc.)
- Try opening the URL in a new browser tab to verify it works

### Animation Too Fast/Slow?
- Increase the `speed` value to make it slower
- Decrease the `speed` value to make it faster

### Background Too Bright/Dark?
- Adjust the `opacity` value (0.5 = 50% opacity, 1.0 = fully opaque)

### Tiles Too Big/Small?
- Adjust the `tileSize` value (25 = small, 50 = medium, 100 = large)

## 💡 Pro Tips

1. **For retro gaming vibes**: Use pixel art images with smaller tile sizes
2. **For subtle effects**: Use low opacity (0.3-0.6) with any pattern
3. **For wallpaper mode**: Use `pattern: "none"` with `tileSize: 100`
4. **For dynamic effects**: Try `pattern: "matrix"` with medium tile sizes

Have fun customizing your background! 🎉
