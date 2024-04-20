import { useMemo } from "react";

const useSounds = () => {
  const sounds = useMemo(
    () => ({
      error: new Audio("/sounds/error.mp3"),
    }),
    []
  );

  const playSound = (sound: HTMLAudioElement) => {
    sound.play();
  };

  return {
    sounds,
    playSound,
  };
};

export default useSounds;
