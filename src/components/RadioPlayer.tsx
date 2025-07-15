import { useRef, useState } from 'react';

const tracks = [
  { src: '/audio/paradise.mp3', title: '87.9 FREN', frequency: '87.9', station: '1' },
  { src: '/audio/station2.mp3', title: '97.5 WZRD', frequency: '97.5', station: '2' },
  { src: '/audio/station3.mp3', title: '101.9 TEDY', frequency: '101.9', station: '3' },
  { src: '/audio/station4.mp3', title: '104.1 FLNK', frequency: '104.1', station: '4' },
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

  const seekBack = () => {
    const newIndex = trackIndex === 0 ? tracks.length - 1 : trackIndex - 1;
    selectStation(newIndex);
  };

  const seekForward = () => {
    const newIndex = trackIndex === tracks.length - 1 ? 0 : trackIndex + 1;
    selectStation(newIndex);
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
        width: '600px',
        height: '400px',
        maxWidth: '90vw',
        maxHeight: '90vh'
      }}>
        
        {/* Background Radio Image */}
        <img 
          src="/images/radio-dashboard.png"
          alt="Radio Dashboard"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
        />

        {/* Display Faceplate Background */}
        <img 
          src="/images/display-faceplate.png"
          alt="Radio Display Faceplate"
          style={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '180px',
            height: '50px',
            pointerEvents: 'none'
          }}
        />

        {/* Station Display - System Font */}
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00ff00', // Green LCD-style text
          fontSize: '18px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textAlign: 'center',
          pointerEvents: 'none',
          textShadow: '0 0 8px #00ff00',
          letterSpacing: '1px'
        }}>
          {tracks[trackIndex].title}
        </div>

        {/* Seek Back Button - Left of Button 1 */}
        <img 
          src="/images/seek-back.png"
          alt="Previous Station"
          onClick={seekBack}
          style={{
            position: 'absolute',
            top: '55%',
            left: '25%', // Left of the preset buttons
            width: '35px',
            height: '30px',
            cursor: 'pointer',
            opacity: 0.8,
            transition: 'opacity 0.2s, transform 0.1s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Button 1 Overlay - 87.9 FREN */}
        <img 
          src="/images/button-1.png"
          alt="87.9 FREN"
          onClick={() => selectStation(0)}
          style={{
            position: 'absolute',
            top: '55%',
            left: '35%',
            width: '40px',
            height: '30px',
            cursor: 'pointer',
            opacity: trackIndex === 0 ? 1 : 0.7,
            transition: 'opacity 0.2s, transform 0.1s',
            transform: trackIndex === 0 ? 'scale(1.1)' : 'scale(1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = trackIndex === 0 ? '1' : '0.7'}
        />

        {/* Button 2 Overlay - 97.5 WZRD */}
        <img 
          src="/images/button-2.png"
          alt="97.5 WZRD"
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

        {/* Button 3 Overlay - 101.9 TEDY */}
        <img 
          src="/images/button-3.png"
          alt="101.9 TEDY"
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

        {/* Button 4 Overlay - 104.1 FLNK */}
        <img 
          src="/images/button-4.png"
          alt="104.1 FLNK"
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

        {/* Seek Forward Button - Right of Button 4 */}
        <img 
          src="/images/seek-forward.png"
          alt="Next Station"
          onClick={seekForward}
          style={{
            position: 'absolute',
            top: '55%',
            left: '75%', // Right of the preset buttons
            width: '35px',
            height: '30px',
            cursor: 'pointer',
            opacity: 0.8,
            transition: 'opacity 0.2s, transform 0.1s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
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

        {/* Volume Slider */}
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
