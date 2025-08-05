import { useCallback, useRef } from 'react';

// Hook for managing messenger sound effects
const useMessengerSounds = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Helper function to play custom Web Audio sounds
  const playCustomSound = useCallback((
    audioContext: AudioContext, 
    frequencies: number[], 
    durations: number[], 
    totalDuration: number
  ) => {
    let currentTime = audioContext.currentTime;
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const duration = durations[index] || 0.1;
      gainNode.gain.setValueAtTime(0.05, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
      
      currentTime += duration;
    });
  }, []);

  const playSound = useCallback((soundType: 'message-receive' | 'message-send' | 'user-online' | 'user-offline' | 'typing') => {
    console.log(`🔊 Attempting to play sound: ${soundType}`);
    try {
      if (!audioRefs.current[soundType]) {
        console.log(`🔊 Creating new audio for: ${soundType}`);
        audioRefs.current[soundType] = new Audio(`/sounds/${soundType}.mp3`);
        audioRefs.current[soundType].volume = 0.5; // Increase volume to make sure it's audible
        
        // Add load event listener
        audioRefs.current[soundType].addEventListener('canplaythrough', () => {
          console.log(`🔊 Audio loaded successfully: ${soundType}`);
        });
        
        audioRefs.current[soundType].addEventListener('error', (e) => {
          console.error(`🚨 Audio failed to load: ${soundType}`, e);
        });
      }
      
      const audio = audioRefs.current[soundType];
      audio.currentTime = 0; // Reset to beginning
      
      console.log(`🔊 Playing audio: ${soundType}`);
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`✅ Sound played successfully: ${soundType}`);
        }).catch(error => {
          console.warn(`⚠️ Could not play sound ${soundType}:`, error);
          // Try custom Web Audio sounds as fallback
          try {
            // Create custom sounds based on type
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            switch (soundType) {
              case 'message-send':
                // Upward chirp for sending
                playCustomSound(audioContext, [600, 800, 1000], [0.1, 0.1, 0.1], 0.15);
                break;
                
              case 'message-receive':
                // Gentle downward tone for receiving
                playCustomSound(audioContext, [800, 600], [0.1, 0.1], 0.2);
                break;
                
              case 'user-online':
                // Happy ascending chime for login
                playCustomSound(audioContext, [440, 554, 659, 880], [0.08, 0.08, 0.08, 0.12], 0.3);
                break;
                
              case 'user-offline':
                // Gentle descending tone for logout
                playCustomSound(audioContext, [880, 659, 554, 440], [0.08, 0.08, 0.08, 0.12], 0.3);
                break;
                
              case 'typing':
                // Quick blip for typing
                playCustomSound(audioContext, [1200], [0.05], 0.05);
                break;
                
              default:
                // Default beep
                playCustomSound(audioContext, [800], [0.1], 0.1);
            }
            
            console.log(`🔔 Played custom ${soundType} sound`);
          } catch (beepError) {
            console.warn('Could not play custom sound:', beepError);
          }
        });
      }
    } catch (error) {
      console.error(`🚨 Error setting up sound ${soundType}:`, error);
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
