import { useCallback, useRef } from 'react';

interface MessengerSounds {
  messageSend: () => void;
  messageReceive: () => void;
  userOnline: () => void;
  userOffline: () => void;
  typing: () => void;
  error: () => void;
}

export const useMessengerSounds = (): MessengerSounds => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = useCallback((soundPath: string, volume: number = 0.3) => {
    try {
      // Reuse audio elements for better performance
      if (!audioRefs.current[soundPath]) {
        audioRefs.current[soundPath] = new Audio(soundPath);
        audioRefs.current[soundPath].volume = volume;
      }

      const audio = audioRefs.current[soundPath];
      audio.currentTime = 0; // Reset to beginning
      audio.play().catch(error => {
        console.log('Audio play failed:', error);
        // Silently fail - some browsers block autoplay
      });
    } catch (error) {
      console.log('Sound error:', error);
    }
  }, []);

  const messageSend = useCallback(() => {
    // For now, use existing success sound as placeholder
    playSound('/sounds/correct.mp3', 0.2);
  }, [playSound]);

  const messageReceive = useCallback(() => {
    // Create a subtle "ding" sound using Web Audio API as fallback
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Fallback to existing sound
      playSound('/sounds/success-gum-claim.mp3', 0.15);
    }
  }, [playSound]);

  const userOnline = useCallback(() => {
    // Create a "chirp up" sound for user coming online
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      playSound('/sounds/correct.mp3', 0.1);
    }
  }, [playSound]);

  const userOffline = useCallback(() => {
    // Create a "chirp down" sound for user going offline
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.25);
      
      gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch (error) {
      playSound('/sounds/incorrect.mp3', 0.1);
    }
  }, [playSound]);

  const typing = useCallback(() => {
    // Subtle click sound for typing
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      // Silent fallback for typing
    }
  }, [playSound]);

  const error = useCallback(() => {
    playSound('/sounds/error.mp3', 0.2);
  }, [playSound]);

  return {
    messageSend,
    messageReceive,
    userOnline,
    userOffline,
    typing,
    error
  };
};

export default useMessengerSounds;
