#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Station configuration
const STATIONS = [
  {
    frequency: '87.9',
    title: '87.9 FREN',
    code: 'FREN',
    folder: '87.9-FREN',
    genre: 'Alternative/Indie',
    description: 'The Fren Zone - Alternative, Indie & Underground Music'
  },
  {
    frequency: '97.5', 
    title: '97.5 WZRD',
    code: 'WZRD',
    folder: '97.5-WZRD',
    genre: 'Electronic/Synthwave',
    description: 'The Wizard - Electronic, Synthwave & Digital Magic'
  },
  {
    frequency: '101.9',
    title: '101.9 TEDY', 
    code: 'TEDY',
    folder: '101.9-TEDY',
    genre: 'Classical/Study',
    description: 'The Study Station - Classical, Jazz & Focus Music'
  },
  {
    frequency: '104.1',
    title: '104.1 FLNK',
    code: 'FLNK', 
    folder: '104.1-FLNK',
    genre: 'Pop/Rock/Hits',
    description: 'Flunk Hits - Pop, Rock & Chart-Topping Hits'
  }
];

const STATIONS_DIR = path.join(__dirname, '../public/audio/stations');
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

function scanStationFolder(stationFolder) {
  const folderPath = path.join(STATIONS_DIR, stationFolder);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  Station folder not found: ${stationFolder}`);
    return [];
  }

  const files = fs.readdirSync(folderPath);
  const audioFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return AUDIO_EXTENSIONS.includes(ext) && !file.startsWith('.');
  });

  return audioFiles.map(file => {
    const filePath = `/audio/stations/${stationFolder}/${file}`;
    const fileName = path.parse(file).name;
    
    // Try to parse artist and title from filename (artist-name_song-title format)
    let artist = 'Unknown Artist';
    let title = fileName;
    
    if (fileName.includes('_')) {
      const parts = fileName.split('_');
      artist = parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      title = parts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    return {
      src: filePath,
      title: title,
      artist: artist,
      filename: file
    };
  });
}

function generateRadioConfig() {
  const stationData = STATIONS.map(station => {
    const tracks = scanStationFolder(station.folder);
    
    // Use first track as station default, or fallback
    const defaultTrack = tracks.length > 0 ? tracks[0].src : '/audio/paradise.mp3';
    
    return {
      src: defaultTrack,
      title: station.title,
      frequency: station.frequency,
      station: station.code,
      genre: station.genre,
      description: station.description,
      trackCount: tracks.length,
      tracks: tracks
    };
  });

  return stationData;
}

function updateRadioPlayerComponent(stationData) {
  const componentPath = path.join(__dirname, '../src/components/RadioPlayer.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('⚠️  RadioPlayer.tsx not found');
    return false;
  }

  let content = fs.readFileSync(componentPath, 'utf8');

  // Generate the tracks array for the component
  const tracksArray = stationData.map(station => 
    `  { src: '${station.src}', title: '${station.title}', frequency: '${station.frequency}', station: '${station.station}' }`
  ).join(',\n');

  const newTracksConfig = `const tracks = [\n${tracksArray}\n];`;

  // Replace the existing tracks array
  const tracksRegex = /const tracks = \[[\s\S]*?\];/;
  
  if (tracksRegex.test(content)) {
    content = content.replace(tracksRegex, newTracksConfig);
    fs.writeFileSync(componentPath, content);
    console.log('✅ Updated RadioPlayer.tsx with new station configuration');
    return true;
  } else {
    console.log('⚠️  Could not find tracks array in RadioPlayer.tsx');
    return false;
  }
}

function generateStationManifest(stationData) {
  const manifestPath = path.join(__dirname, '../public/audio/stations/stations-manifest.json');
  
  const manifest = {
    generated: new Date().toISOString(),
    stations: stationData
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Generated stations manifest');
}

function main() {
  console.log('🎵 Setting up Flunks Radio Stations...\n');

  // Scan all stations
  const stationData = generateRadioConfig();

  // Display results
  console.log('📻 Station Status:');
  stationData.forEach(station => {
    console.log(`  ${station.frequency} ${station.title} - ${station.trackCount} tracks`);
    if (station.trackCount === 0) {
      console.log(`    ⚠️  No audio files found in ${station.frequency.replace('.', '')}-${station.station}/`);
    }
  });

  // Update component
  console.log('\n🔧 Updating Radio Player...');
  const updateSuccess = updateRadioPlayerComponent(stationData);

  // Generate manifest
  console.log('\n📄 Generating Station Manifest...');
  generateStationManifest(stationData);

  console.log('\n🎉 Radio station setup complete!');
  console.log('\n📁 To add music:');
  console.log('  1. Upload audio files to the appropriate station folder:');
  STATIONS.forEach(station => {
    console.log(`     public/audio/stations/${station.folder}/`);
  });
  console.log('  2. Run this script again: npm run setup-radio-stations');
  console.log('  3. Test your radio stations in the app!');
}

if (require.main === module) {
  main();
}

module.exports = { generateRadioConfig, scanStationFolder };
