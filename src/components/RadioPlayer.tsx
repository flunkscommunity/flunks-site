import { WindowContent, Button, Slider } from 'react95';
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
    <div
      style={{
        width: '100%',
        padding: 10,
        background: '#fdf6ff',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 2rem',
          borderRadius: '12px',
          background: '#fff8fb',
          border: '4px solid #ffd6e7',
        }}
      >
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: '#d1e8ff',
            border: '4px solid #a3c0e9',
          }}
        />
        <WindowContent
          style={{
            padding: '1rem',
            background: '#fceefd',
            minWidth: '220px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <b style={{ color: '#008080' }}>{tracks[trackIndex].title}</b>
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
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: '#d1e8ff',
            border: '4px solid #a3c0e9',
          }}
        />
      </div>
    </div>
  );
};

export default RadioPlayer;
