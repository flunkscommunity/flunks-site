import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AudioContextType {
  isMuted: boolean;
  globalVolume: number;
  toggleMute: () => void;
  setGlobalVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [globalVolume, setGlobalVolume] = useState(0.5);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Apply mute state to all audio elements when mute state changes
  useEffect(() => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (isMuted) {
        audio.volume = 0;
      } else {
        // Restore volume based on individual audio element's data attribute or global volume
        const originalVolume = audio.dataset.originalVolume;
        audio.volume = originalVolume ? parseFloat(originalVolume) : globalVolume;
      }
    });
  }, [isMuted, globalVolume]);

  const setGlobalVolumeHandler = useCallback((volume: number) => {
    setGlobalVolume(volume);
    if (!isMuted) {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        // Store original volume in data attribute
        if (!audio.dataset.originalVolume) {
          audio.dataset.originalVolume = audio.volume.toString();
        }
        audio.volume = volume;
      });
    }
  }, [isMuted]);

  const value: AudioContextType = {
    isMuted,
    globalVolume,
    toggleMute,
    setGlobalVolume: setGlobalVolumeHandler,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
