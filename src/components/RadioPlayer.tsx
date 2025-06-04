import { Window, WindowHeader, WindowContent, Button, Slider } from 'react95';
import { useRef, useState } from 'react';

const tracks = [
  { src: '/audio/paradise.mp3', title: 'Paradise' },
];

const RadioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) pause();
    else play();
  };

  const nextTrack = () => {
    const nextIndex = (trackIndex + 1) % tracks.length;
    setTrackIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.src = tracks[nextIndex].src;
      if (isPlaying) audioRef.current.play();
    }
  };

  const prevTrack = () => {
    const prevIndex = (trackIndex - 1 + tracks.length) % tracks.length;
    setTrackIndex(prevIndex);
    if (audioRef.current) {
      audioRef.current.src = tracks[prevIndex].src;
      if (isPlaying) audioRef.current.play();
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <Window style={{ width: 340, padding: 10, background: '#e8f0ff' }}>
      <WindowHeader>Radio</WindowHeader>
      <WindowContent style={{ padding: '1rem', background: '#f4f8ff' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <b style={{ color: '#008000' }}>{tracks[trackIndex].title}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <Button onClick={prevTrack}>⏮</Button>
          <Button onClick={togglePlay}>{isPlaying ? '⏸' : '▶'}</Button>
          <Button onClick={stop}>⏹</Button>
          <Button onClick={nextTrack}>⏭</Button>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Volume</label>
          <Slider min={0} max={1} step={0.01} value={volume} onChange={handleVolume} />
        </div>
        <audio ref={audioRef} src={tracks[trackIndex].src} />
      </WindowContent>
    </Window>
  );
};

export default RadioPlayer;
