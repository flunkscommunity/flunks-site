// Configuration for the scrolling background
// Edit these values to customize your background experience

export const BACKGROUND_CONFIG = {
  // Your custom background image path
  // Using your uploaded image from public/images/
  imageUrl: "/images/my-background.png", // Your uploaded background image
  
  // Option 2: Use external URL (like Imgur)
  // imageUrl: "https://i.imgur.com/your-image.jpg", // Replace with your image
  
  // Enable/disable scrolling animation
  enableScrolling: false,
  
  // Scrolling pattern options:
  // 'diagonal' - Moves diagonally across screen (like matrix rain)
  // 'horizontal' - Scrolls left to right continuously  
  // 'vertical' - Scrolls top to bottom continuously
  // 'matrix' - Complex matrix-style movement
  // 'crawl' - Slow crawling effect like current green grid
  // 'none' - No animation (static background)
  pattern: "none" as const,
  
  // Animation speed (higher number = slower animation)
  // Recommended: 15-60 seconds
  speed: 5, // Temporarily faster for testing
  
  // Background opacity (0 = invisible, 1 = fully opaque)
  // Recommended: 0.6-1.0 for good visibility
  opacity: 1.0, // Full opacity to match AccessGate
  
  // Tile size (how big each repeated image appears)
  // 25 = small tiles, 50 = medium, 100 = large
  tileSize: 25 // Temporarily smaller tiles for testing
};

// Quick presets for common effects
export const BACKGROUND_PRESETS = {
  matrixRain: {
    pattern: "diagonal" as const,
    speed: 20,
    opacity: 0.7,
    tileSize: 30
  },
  
  slowCrawl: {
    pattern: "crawl" as const,
    speed: 45,
    opacity: 0.8,
    tileSize: 50
  },
  
  fastScroll: {
    pattern: "horizontal" as const,
    speed: 10,
    opacity: 0.6,
    tileSize: 40
  },
  
  staticBackground: {
    pattern: "none" as const,
    speed: 0,
    opacity: 1,
    tileSize: 100
  }
};

/* 
INSTRUCTIONS FOR ADDING YOUR CUSTOM BACKGROUND:

OPTION 1: Local File (Recommended)
1. Create a folder: public/images/backgrounds/
2. Upload your image file to that folder (e.g., my-background.jpg)
3. Set imageUrl to: "/images/backgrounds/my-background.jpg"

OPTION 2: External Hosting
1. Upload your image to an image hosting service like:
   - Imgur.com (free)
   - imgbb.com (free) 
   - Google Drive (make sure it's publicly accessible)
   - Or any other image hosting service
2. Copy the direct image URL and replace the imageUrl above

3. Choose your preferred scrolling pattern from the options

4. Adjust speed, opacity, and tileSize to your liking

5. To use a preset instead, replace BACKGROUND_CONFIG with one of the BACKGROUND_PRESETS

Example Local Paths:
- "/images/backgrounds/my-wallpaper.jpg"
- "/images/backgrounds/matrix-pattern.png"
- "/images/backgrounds/pixel-art.gif"

Example External URLs:
- Imgur: "https://i.imgur.com/ABC123.jpg"
- ImgBB: "https://i.ibb.co/ABC123/image.jpg"
- Direct URL: "https://example.com/my-image.png"

Note: Make sure your image is:
- Reasonable size (under 5MB for good performance)
- Good quality for tiling if using smaller tileSize
- Supported format (JPG, PNG, GIF, WebP)
*/
