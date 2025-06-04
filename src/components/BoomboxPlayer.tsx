import { Window, WindowHeader, WindowContent, Button, Slider } from 'react95';
import { useRef, useState } from 'react';

const BoomboxPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (e: any) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <Window style={{ width: 340, padding: 10, background: '#f0f4ff' }}>
      <WindowHeader>
        🔊 Flunks Boombox 95
      </WindowHeader>
      <WindowContent style={{ color: '#333', backgroundColor: '#fffafa', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '40px', background: '#ffb3c7', borderRadius: '50%' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ marginBottom: '0.5rem' }}>🎶 Now Playing:</p>
            <b style={{ color: '#ffe699' }}>Flunks Home Theme</b>
          </div>
          <div style={{ width: '40px', height: '40px', background: '#b3f6ff', borderRadius: '50%' }} />
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button onClick={togglePlay}>{isPlaying ? '⏸ Pause' : '▶️ Play'}</Button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Volume</label>
          <Slider min={0} max={1} step={0.01} value={volume} onChange={handleVolume} />
        </div>

        <audio ref={audioRef} src="/audio/paradise.mp3" />
      </WindowContent>
    </Window>
  );
};

export default BoomboxPlayer;
