import { useCallback, useRef } from 'react';

// Hook for managing messenger sound effects
const useMessengerSounds = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = useCallback((soundType: 'message-receive' | 'message-send' | 'user-online' | 'user-offline' | 'typing') => {
    try {
      if (!audioRefs.current[soundType]) {
        audioRefs.current[soundType] = new Audio(`/sounds/${soundType}.mp3`);
        audioRefs.current[soundType].volume = 0.5; // Set default volume
      }
      
      const audio = audioRefs.current[soundType];
      audio.currentTime = 0; // Reset to beginning
      audio.play().catch(error => {
        // Silently handle audio play errors (common in browsers with autoplay restrictions)
        console.warn(`Could not play sound ${soundType}:`, error);
      });
    } catch (error) {
      console.warn(`Error setting up sound ${soundType}:`, error);
    }
  }, []);

  const messageReceive = useCallback(() => playSound('message-receive'), [playSound]);
  const messageSend = useCallback(() => playSound('message-send'), [playSound]);
  const userOnline = useCallback(() => playSound('user-online'), [playSound]);
  const userOffline = useCallback(() => playSound('user-offline'), [playSound]);
  const typing = useCallback(() => playSound('typing'), [playSound]);

  return {
    messageReceive,
    messageSend,
    userOnline,
    userOffline,
    typing,
    playSound
  };
};

export default useMessengerSounds;
