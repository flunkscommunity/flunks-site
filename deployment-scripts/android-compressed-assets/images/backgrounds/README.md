# Background Images Folder

This folder is for your custom background images.

## How to Add Your Background

1. **Upload your image** to this folder (`public/images/backgrounds/`)
2. **Name it something memorable** like `my-background.jpg` or `matrix-pattern.png`
3. **Update the config** in `src/config/backgroundConfig.ts`:

```typescript
export const BACKGROUND_CONFIG = {
  imageUrl: "/images/backgrounds/your-image-name.jpg", // Update this path
  enableScrolling: true,
  pattern: "crawl",
  // ... other settings
};
```

## Recommended Image Specs

- **Size**: 500x500px to 1500x1500px
- **Format**: JPG, PNG, GIF, or WebP
- **File Size**: Under 5MB for best performance
- **Quality**: Medium to high quality

## Examples

If you upload a file called `cosmic-background.jpg`, set:
```typescript
imageUrl: "/images/backgrounds/cosmic-background.jpg"
```

If you upload `pixel-matrix.png`, set:
```typescript
imageUrl: "/images/backgrounds/pixel-matrix.png"
```

## Tips

- **Square images** work best for tiling patterns
- **Seamless patterns** look great with smaller tile sizes
- **High contrast images** work well with lower opacity settings
- **Test different tile sizes** to see what looks best with your image
