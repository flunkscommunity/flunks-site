# 📻 FLUNKS RADIO STATION MANAGEMENT

## 🎵 Station Organization

Each radio station has its own dedicated folder for organized audio file management:

### 📁 Station Directories

```
📁 87.9-FREN/     - Conspiracy, Talk Radio
📁 97.5-WZRD/     - Electronic, Synthwave, Experimental  
📁 101.9-TEDY/    - Classical, Jazz, Instrumental
📁 104.1-FLNK/    - News, Rock, Top 40 Hits
```

## 🎧 Station Themes

### **87.9 FREN** - "The Fren Zone"
- **Genre**: Talk radio, 
- **Vibe**: Spooky,  
- **Target**: Students who like discovering new artists

### **97.5 WZRD** - "The Wizard"
- **Genre**: Electronic, Synthwave, Video Game Music
- **Vibe**: Futuristic, magical, tech-focused
- **Target**: Gamers, tech enthusiasts, digital natives

### **101.9 TEDY** - "The Study Station" 
- **Genre**: Classical, Jazz, Lo-fi, Instrumental
- **Vibe**: Focused, calm, academic
- **Target**: Students studying or needing concentration

### **104.1 FLNK** - "Flunk Hits"
- **Genre**: Pop, Rock, Top 40, Chart Hits
- **Vibe**: High energy, mainstream, popular
- **Target**: General student body, parties, events

## 📂 File Upload Instructions

### 1. **Choose Your Station**
Select the appropriate station folder based on music genre and theme.

### 2. **Upload Audio Files**
- Supported formats: `.mp3`, `.wav`, `.ogg`
- Recommended: MP3 files for best compatibility
- Quality: 128kbps minimum, 320kbps preferred

### 3. **File Naming Convention**
```
artist-name_song-title.mp3
band-name_track-name.mp3
```

### 4. **Playlist Management**
Each station folder can contain multiple tracks that will be rotated automatically.

## 🔧 Technical Setup

After uploading files, run the station setup script:
```bash
npm run setup-radio-stations
```

This will:
- ✅ Scan all station folders for new audio files
- ✅ Update the radio player playlist configuration
- ✅ Generate metadata for each track
- ✅ Optimize audio files for web playback

## 🎚️ Station Management

### Adding New Tracks
1. Upload files to appropriate station folder
2. Run setup script
3. Test in radio player

### Removing Tracks
1. Delete files from station folder
2. Run setup script to update playlists

### Changing Station Themes
Edit the station configuration in `src/components/RadioPlayer.tsx`

## 🚀 Quick Start

1. **Upload your music** to the appropriate station folder
2. **Run setup**: `npm run setup-radio-stations` 
3. **Test the radio** in the application
4. **Enjoy your personalized radio stations!** 📻

---
*Keep the music playing at Flunks High! 🎵*
