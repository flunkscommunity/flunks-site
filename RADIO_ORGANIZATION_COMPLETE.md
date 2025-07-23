# 📻 FLUNKS RADIO - COMPLETE ORGANIZATION GUIDE

## 🎵 Radio Station Structure Created!

Your radio system is now fully organized with dedicated folders for each station and automated management tools.

## 📁 File Structure

```
public/audio/
├── paradise.mp3                    # Original file (kept for compatibility)
└── stations/                       # New organized structure
    ├── README.md                    # Main documentation
    ├── stations-manifest.json       # Auto-generated station data
    ├── 87.9-FREN/                  # Alternative & Indie
    │   ├── README.md               # Station guide
    │   └── UPLOAD_MUSIC_HERE.md    # Upload instructions
    ├── 97.5-WZRD/                  # Electronic & Synthwave  
    │   ├── README.md               # Station guide
    │   └── UPLOAD_MUSIC_HERE.md    # Upload instructions
    ├── 101.9-TEDY/                 # Classical & Study
    │   ├── README.md               # Station guide
    │   └── UPLOAD_MUSIC_HERE.md    # Upload instructions
    └── 104.1-FLNK/                 # Pop & Rock Hits
        ├── README.md               # Station guide
        └── paradise.mp3            # Current track
```

## 🎧 Station Breakdown

### 📻 87.9 FREN - "The Fren Zone"
- **Genre**: Alternative, Indie, Underground
- **Vibe**: Authentic, chill, non-mainstream
- **Upload to**: `public/audio/stations/87.9-FREN/`

### 🧙‍♂️ 97.5 WZRD - "The Wizard"  
- **Genre**: Electronic, Synthwave, Video Game Music
- **Vibe**: Futuristic, magical, tech-focused
- **Upload to**: `public/audio/stations/97.5-WZRD/`

### 📚 101.9 TEDY - "The Study Station"
- **Genre**: Classical, Jazz, Lo-fi, Instrumental  
- **Vibe**: Focused, calm, academic
- **Upload to**: `public/audio/stations/101.9-TEDY/`

### 🎸 104.1 FLNK - "The Flunk"
- **Genre**: Pop, Rock, Top 40, Chart Hits
- **Vibe**: High energy, mainstream, popular
- **Upload to**: `public/audio/stations/104.1-FLNK/`

## 🛠️ Management Tools

### **Setup Script**: `npm run setup-radio-stations`
Automatically:
- ✅ Scans all station folders for audio files
- ✅ Updates RadioPlayer.tsx with new playlists
- ✅ Generates station manifest with metadata
- ✅ Reports status of each station

### **File Naming Convention**:
```
artist-name_song-title.mp3
band-name_track-name.mp3
composer-name_piece-title.mp3
```

### **Supported Formats**: 
- `.mp3` (recommended)
- `.wav`
- `.ogg` 
- `.m4a`

## 🚀 Quick Start Workflow

1. **Choose a station** based on music genre
2. **Upload audio files** to the appropriate folder
3. **Run the setup**: `npm run setup-radio-stations`
4. **Test in the radio player** - stations automatically updated!

## 📊 Current Status

- ✅ **File structure created**
- ✅ **Documentation written**  
- ✅ **Setup script configured**
- ✅ **RadioPlayer.tsx updated**
- ✅ **Station manifest generated**
- ✅ **Package.json script added**

## 🎵 Ready to Rock!

Your radio system is now ready for music uploads! Each station has its own theme and personality, making it easy to organize your music library and give users a great listening experience.

**Next Steps:**
1. Upload music files to the station folders
2. Run `npm run setup-radio-stations` after each upload
3. Enjoy your personalized radio stations! 📻

---
*Broadcasting from Flunks High School since 2025* 🎤
