import { Window, WindowHeader, WindowContent, Button, Slider } from 'react95';
import { useRef, useState, useEffect } from 'react';

const tracks = ['paradise.mp3'];

const BoomboxPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [trackIndex, setTrackIndex] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = `/audio/${tracks[trackIndex]}`;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [trackIndex]);

  const handleVolume = (e: any) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <Window style={{ width: 360, padding: 10, background: '#f0f4ff' }}>
      <WindowHeader>🔊 Flunks Boombox 95</WindowHeader>
      <WindowContent style={{ padding: 0 }}>
        <div style={{ position: 'relative', width: '100%', height: '180px' }}>
          <img src="/skins/radio-skin/radio-skin.svg" alt="radio skin" style={{ width: '100%', height: '100%' }} />
          <div
            style={{ position: 'absolute', top: 32, left: 0, right: 0, textAlign: 'center', color: '#00ff00', fontWeight: 'bold', pointerEvents: 'none' }}
          >
            {tracks[trackIndex].replace(/\.mp3$/, '')}
          </div>
          <div style={{ position: 'absolute', bottom: 32, left: '20%', transform: 'translateX(-50%)' }}>
            <Button onClick={prevTrack}>⏮</Button>
          </div>
          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
            <Button onClick={togglePlay}>{isPlaying ? '⏸' : '▶️'}</Button>
          </div>
          <div style={{ position: 'absolute', bottom: 32, left: '80%', transform: 'translateX(-50%)' }}>
            <Button onClick={nextTrack}>⏭</Button>
          </div>
        </div>
        <div style={{ marginTop: '1rem', padding: '0 1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Volume</label>
          <Slider min={0} max={1} step={0.01} value={volume} onChange={handleVolume} />
        </div>
        <audio ref={audioRef} src={`/audio/${tracks[trackIndex]}`} />
      </WindowContent>
    </Window>
  );
};

export default BoomboxPlayer;
