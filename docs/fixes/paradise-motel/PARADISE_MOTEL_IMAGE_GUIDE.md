# 🏨 Paradise Motel Image Upload Guide

## Overview
Paradise Motel is now integrated as a **build-mode only** location in the Semester Zero map. This guide explains where to upload the background images for the full-screen Paradise Motel location.

## 📁 Directory Structure

### Main Background Image Location
```
/Users/jeremy/Desktop/flunks-site/public/images/backgrounds/locations/paradise-motel/
```

### Required Files
- `cover.webp` (preferred) or `cover.jpg` (fallback)
  - **Recommended dimensions**: 1920x1080 or larger
  - **Format**: WebP preferred for smaller file size, JPEG as fallback
  - **Purpose**: Full-screen background for the main Paradise Motel location

### Icon Location (Already Exists)
```
/Users/jeremy/Desktop/flunks-site/public/images/icons/paradise-motel-icon.png
```
✅ Icon is already present and configured

## 🎨 Image Requirements

### Background Image Specifications
- **Resolution**: Minimum 1920x1080, higher resolution recommended
- **Aspect Ratio**: 16:9 preferred (will be center-cropped to cover screen)
- **Format**: WebP preferred (.webp), JPEG acceptable (.jpg)
- **File Size**: Optimize for web (aim for under 2MB)

### Visual Style Guidelines
- **Theme**: Vintage motel with mysterious/eerie atmosphere
- **Color Palette**: Purple and pink tones to match the UI buttons
- **Elements**: Neon signs, motel rooms, pool area, parking lot
- **Mood**: Slightly unsettling, nostalgic, film noir aesthetic

## 🔧 Technical Implementation

### Current Component Structure
The Paradise Motel component (`ParadiseMotelMain.tsx`) now features:

#### Desktop Layout
- **Left Panel**: Lobby, Pool Area buttons
- **Center**: Full-screen background image
- **Right Panel**: Room 1, Room 2 buttons

#### Mobile Layout  
- **Top**: Full-screen background image
- **Bottom**: 2x2 grid of all 4 location buttons

### Image Loading Logic
```typescript
// Image path resolution
const dayImage = "/images/backgrounds/locations/paradise-motel/cover.webp";
const nightImage = "/images/backgrounds/locations/paradise-motel/cover.webp";

// Fallback on error
onError={(e) => {
  e.currentTarget.src = "/images/backdrops/BLANK.png";
}}
```

## 🎮 User Experience

### Navigation
- **Access**: Build mode only (visible at `build.flunks.net`)
- **Location**: Appears in Semester Zero map after Rug Doctor
- **Icon**: 🏨 with custom Paradise Motel icon

### Interactive Areas (4 Buttons)
1. **🏨 Lobby** - Reception area with guest book
2. **🛏️ Room 1** - Mysterious guest room with static TV
3. **🛏️ Room 2** - Mirror room reflecting something different  
4. **🏊 Pool Area** - Green water with mysterious rubber duck

## 💡 Upload Instructions

### Step 1: Prepare Your Image
1. Create or obtain a Paradise Motel background image
2. Resize to at least 1920x1080 pixels
3. Optimize for web (compress if needed)
4. Save as `cover.webp` (preferred) or `cover.jpg`

### Step 2: Upload to Server
```bash
# Navigate to the paradise-motel directory
cd /Users/jeremy/Desktop/flunks-site/public/images/backgrounds/locations/paradise-motel/

# Copy your image file
cp /path/to/your/cover.webp ./cover.webp
# OR
cp /path/to/your/cover.jpg ./cover.jpg
```

### Step 3: Test the Implementation
1. Ensure you're in build mode
2. Navigate to Semester Zero map
3. Look for Paradise Motel icon after Rug Doctor
4. Click to open and verify background displays correctly
5. Test all 4 interactive buttons

## 🚀 Deployment

After uploading the image:
```bash
# Deploy to build environment
./deploy-build.sh
vercel --prod
```

## 🎯 Content Theming

### Paradise Motel Story Elements
- **Mystery**: Guests check in but never leave
- **Atmosphere**: Flickering neon, faded promises  
- **Supernatural**: Mirrors showing wrong reflections
- **Nostalgic**: Retro motel aesthetic from the 80s

### Button Color Scheme
- **Primary**: Purple gradients (`from-purple-900 to-pink-800`)
- **Secondary**: Pink accents (`border-pink-400`)
- **Hover**: Subtle color shifts and scale transforms
- **Font**: Cooper Black for retro motel signage feel

## ✅ Current Status

- ✅ Component structure updated with responsive design
- ✅ 4 interactive buttons implemented  
- ✅ Integrated with build mode map navigation
- ✅ CSS styles and hover effects added
- ✅ Mobile-responsive layout completed
- ⏳ **Waiting**: Background image upload

## 📞 Support

If you need help with image formatting or have questions about the implementation, the Paradise Motel location is fully functional and ready to display your background image as soon as it's uploaded to the specified directory.