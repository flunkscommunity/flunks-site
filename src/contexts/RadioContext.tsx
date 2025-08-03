import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface Track {
  src: string;
  title: string;
  artist: string;
  filename: string;
}

interface StationData {
  tracks: Track[];
  frequency: string;
  title: string;
  station: string;
}

interface RadioContextType {
  audioRef: React.RefObject<HTMLAudioElement>;
  trackIndex: number;
  setTrackIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  stationData: StationData[];
  setStationData: (data: StationData[]) => void;
  currentTrackInStation: number[];
  setCurrentTrackInStation: (tracks: number[]) => void;
  fastForwardTrack: () => void;
  rewindTrack: () => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
};

interface RadioProviderProps {
  children: React.ReactNode;
}

// Function to get random starting values
const getRandomStartingStation = () => Math.floor(Math.random() * 4); // 0-3 for 4 stations

const getRandomTrackForStation = (stationData: StationData[], stationIndex: number) => {
  if (stationData.length > stationIndex && stationData[stationIndex]?.tracks?.length > 0) {
    return Math.floor(Math.random() * stationData[stationIndex].tracks.length);
  }
  return 0;
};

export const RadioProvider: React.FC<RadioProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(() => getRandomStartingStation());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [stationData, setStationData] = useState<StationData[]>([]);
  const [currentTrackInStation, setCurrentTrackInStation] = useState<number[]>([0, 0, 0, 0]);

  // Load station data with all tracks
  useEffect(() => {
    const loadStationData = async () => {
      try {
        const response = await fetch('/audio/stations/stations-manifest.json');
        const manifest = await response.json();
        setStationData(manifest.stations);
      } catch (error) {
        console.error('Failed to load station data:', error);
      }
    };
    loadStationData();
  }, []);

  // Randomize starting track positions when station data loads
  useEffect(() => {
    if (stationData.length > 0) {
      const randomTracks = stationData.map((_, index) => 
        getRandomTrackForStation(stationData, index)
      );
      setCurrentTrackInStation(randomTracks);
      
      // Also randomize starting station if not already playing
      if (!isPlaying) {
        setTrackIndex(getRandomStartingStation());
      }
    }
  }, [stationData.length]); // Only run when station data first loads

  // Skip to next track within current station
  const fastForwardTrack = () => {
    if (stationData.length > 0) {
      const station = stationData[trackIndex];
      if (station && station.tracks.length > 0) {
        const newTrackIndices = [...currentTrackInStation];
        const currentSongIndex = newTrackIndices[trackIndex];
        const newSongIndex = currentSongIndex === station.tracks.length - 1 ? 0 : currentSongIndex + 1;
        newTrackIndices[trackIndex] = newSongIndex;
        setCurrentTrackInStation(newTrackIndices);
        
        if (audioRef.current) {
          audioRef.current.src = station.tracks[newSongIndex].src;
          
          // Small delay to ensure audio source is loaded, then auto-play
          setTimeout(() => {
            if (audioRef.current) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('FFWD autoplay successful');
                    setIsPlaying(true);
                  })
                  .catch((error) => {
                    console.log('FFWD autoplay prevented:', error);
                    setIsPlaying(false);
                  });
              } else {
                // Fallback for older browsers
                setIsPlaying(true);
              }
            }
          }, 100);
        }
      }
    }
  };

  // Skip to previous track within current station
  const rewindTrack = () => {
    if (stationData.length > 0) {
      const station = stationData[trackIndex];
      if (station && station.tracks.length > 0) {
        const newTrackIndices = [...currentTrackInStation];
        const currentSongIndex = newTrackIndices[trackIndex];
        const newSongIndex = currentSongIndex === 0 ? station.tracks.length - 1 : currentSongIndex - 1;
        newTrackIndices[trackIndex] = newSongIndex;
        setCurrentTrackInStation(newTrackIndices);
        
        if (audioRef.current) {
          audioRef.current.src = station.tracks[newSongIndex].src;
          
          // Small delay to ensure audio source is loaded, then auto-play
          setTimeout(() => {
            if (audioRef.current) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('REW autoplay successful');
                    setIsPlaying(true);
                  })
                  .catch((error) => {
                    console.log('REW autoplay prevented:', error);
                    setIsPlaying(false);
                  });
              } else {
                // Fallback for older browsers
                setIsPlaying(true);
              }
            }
          }, 100);
        }
      }
    }
  };

  const contextValue: RadioContextType = {
    audioRef,
    trackIndex,
    setTrackIndex,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    stationData,
    setStationData,
    currentTrackInStation,
    setCurrentTrackInStation,
    fastForwardTrack,
    rewindTrack,
  };

  return (
    <RadioContext.Provider value={contextValue}>
      {children}
    </RadioContext.Provider>
  );
};

export default RadioProvider;
