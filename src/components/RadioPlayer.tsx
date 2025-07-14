import { useRef, useState } from 'react';

const tracks = [
  { src: '/audio/paradise.mp3', title: 'Paradise', station: '1' },
  { src: '/audio/station2.mp3', title: 'Chill Beats', station: '2' },
  { src: '/audio/station3.mp3', title: 'Hip Hop', station: '3' },
  { src: '/audio/station4.mp3', title: 'Jazz Lounge', station: '4' },
];

const RadioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const selectStation = (stationIndex: number) => {
    setTrackIndex(stationIndex);
    if (audioRef.current) {
      audioRef.current.src = tracks[stationIndex].src;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
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
    <div style={{ 
      width: '100%', 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0'
    }}>
      
      {/* Main Radio Container */}
      <div style={{ 
        position: 'relative',
        width: '600px', // Fixed width for consistent positioning
        height: '400px', // Fixed height for consistent positioning
        maxWidth: '90vw', // Responsive max width
        maxHeight: '90vh' // Responsive max height
      }}>
        
        {/* Background Radio Image */}
        <img 
          src="/images/radio-dashboard.png"
          alt="Radio Dashboard"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Maintains aspect ratio
            display: 'block'
          }}
        />

        {/* Station Display Overlay */}
        <div style={{
          position: 'absolute',
          top: '35%', // Adjust to match your radio's display area
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#000',
          color: '#00ff00',
          padding: '4px 12px',
          fontSize: '16px',
          fontFamily: 'monospace',
          border: '2px inset #333',
          borderRadius: '4px'
        }}>
          {tracks[trackIndex].title}
        </div>

        {/* Button 1 Overlay */}
        <img 
          src="/images/button-1.png"
          alt="Station 1"
          onClick={() => selectStation(0)}
          style={{
            position: 'absolute',
            top: '55%', // Adjust these percentages to match your radio image
            left: '35%',
            width: '40px', // Actual button size
            height: '30px',
            cursor: 'pointer',
            opacity: trackIndex === 0 ? 1 : 0.7,
            transition: 'opacity 0.2s, transform 0.1s',
            transform: trackIndex === 0 ? 'scale(1.1)' : 'scale(1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = trackIndex === 0 ? '1' : '0.7'}
        />

        {/* Button 2 Overlay */}
        <img 
          src="/images/button-2.png"
          alt="Station 2"
          onClick={() => selectStation(1)}
          style={{
            position: 'absolute',
            top: '55%',
            left: '45%',
            width: '40px',
            height: '30px',
            cursor: 'pointer',
            opacity: trackIndex === 1 ? 1 : 0.7,
            transition: 'opacity 0.2s, transform 0.1s',
            transform: trackIndex === 1 ? 'scale(1.1)' : 'scale(1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = trackIndex === 1 ? '1' : '0.7'}
        />

        {/* Button 3 Overlay */}
        <img 
          src="/images/button-3.png"
          alt="Station 3"
          onClick={() => selectStation(2)}
          style={{
            position: 'absolute',
            top: '55%',
            left: '55%',
            width: '40px',
            height: '30px',
            cursor: 'pointer',
            opacity: trackIndex === 2 ? 1 : 0.7,
            transition: 'opacity 0.2s, transform 0.1s',
            transform: trackIndex === 2 ? 'scale(1.1)' : 'scale(1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = trackIndex === 2 ? '1' : '0.7'}
        />

        {/* Button 4 Overlay */}
        <img 
          src="/images/button-4.png"
          alt="Station 4"
          onClick={() => selectStation(3)}
          style={{
            position: 'absolute',
            top: '55%',
            left: '65%',
            width: '40px',
            height: '30px',
            cursor: 'pointer',
            opacity: trackIndex === 3 ? 1 : 0.7,
            transition: 'opacity 0.2s, transform 0.1s',
            transform: trackIndex === 3 ? 'scale(1.1)' : 'scale(1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = trackIndex === 3 ? '1' : '0.7'}
        />

        {/* Play/Pause Button Overlay */}
        <img 
          src={isPlaying ? "/images/pause-button.png" : "/images/play-button.png"}
          alt={isPlaying ? "Pause" : "Play"}
          onClick={togglePlay}
          style={{
            position: 'absolute',
            top: '75%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            transition: 'transform 0.1s',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
        />

        {/* Volume Slider (if needed) */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.9)',
          padding: '8px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '12px' }}>Volume:</span>
          <input 
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolume}
            style={{ width: '100px' }}
          />
        </div>

      </div>

      <audio ref={audioRef} src={tracks[trackIndex].src} />
    </div>
  );
};

export default RadioPlayer;
