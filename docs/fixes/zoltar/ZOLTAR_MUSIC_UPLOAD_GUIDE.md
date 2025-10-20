# 🔮 Zoltar Machine Music Upload Guide

## Music File Location

To add atmospheric music to the Zoltar fortune machine, upload your audio file to:

```
/public/sounds/zoltar-theme.mp3
```

## File Requirements

- **Format**: MP3 (recommended for browser compatibility)
- **Volume**: The code sets volume to 30% (0.3), so you can upload at full volume
- **Loop**: The music will automatically loop while the Zoltar window is open
- **Autoplay**: Music starts when the window opens (may be blocked by browser until user interaction)

## Alternative Formats

You can also use:
- **WAV**: `/public/sounds/zoltar-theme.wav`
- **OGG**: `/public/sounds/zoltar-theme.ogg`

Just update the file extension in `/src/windows/ZoltarFortuneApp.tsx` line 34:
```typescript
audioRef.current = new Audio('/sounds/zoltar-theme.mp3');
```

## How It Works

1. When the Zoltar window opens, the music automatically starts playing
2. Music loops continuously at 30% volume
3. When the window closes, the music stops
4. If browser blocks autoplay, music will start after first user interaction (button click)

## Suggested Music Styles

- Mysterious carnival/circus music
- Mystical fortune teller ambiance
- Ethereal crystal ball sounds
- Spooky carnival organ music
- Middle Eastern bazaar vibes

## Current Setup

✅ Audio system implemented with:
- Loop: Enabled
- Volume: 30% (adjustable in code)
- Cleanup: Automatic when window closes
- File path: `/sounds/zoltar-theme.mp3`

Just drop your audio file into `/public/sounds/` with the name `zoltar-theme.mp3` and it will work immediately!
