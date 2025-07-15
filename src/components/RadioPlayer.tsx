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
    <>
      <style jsx>{`
        .radio-wrapper {
          --scale: 1;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .radio-wrapper {
            --scale: 0.8;
          }
        }

        /* Mobile */
        @media (max-width: 600px) {
          .radio-wrapper {
            --scale: 0.6;
          }
        }

        /* Small mobile */
        @media (max-width: 400px) {
          .radio-wrapper {
            --scale: 0.5;
          }
        }
      `}</style>
      
      <div style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: '10px'
      }}>
        
        {/* Scalable Radio Container */}
        <div 
          className="radio-wrapper"
          style={{ 
            position: 'relative',
            width: 'calc(680px * var(--scale))',
            height: 'calc(480px * var(--scale))',
            maxWidth: '100%',
            maxHeight: '100%',
            '--scale': '1'
          } as React.CSSProperties}
        >
        
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
            top: 'calc(160px * var(--scale))',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(220px * var(--scale))',
            height: 'calc(60px * var(--scale))',
            pointerEvents: 'none'
          }}
        />

        {/* Station Display - System Font */}
        <div style={{
          position: 'absolute',
          top: 'calc(160px * var(--scale))',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00ff00', // Green LCD-style text
          fontSize: 'calc(20px * var(--scale))',
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
            top: 'calc(280px * var(--scale))',
            left: 'calc(180px * var(--scale))',
            width: 'calc(40px * var(--scale))',
            height: 'calc(35px * var(--scale))',
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
            top: 'calc(280px * var(--scale))',
            left: 'calc(260px * var(--scale))',
            width: 'calc(45px * var(--scale))',
            height: 'calc(35px * var(--scale))',
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
            top: 'calc(280px * var(--scale))',
            left: 'calc(325px * var(--scale))',
            width: 'calc(45px * var(--scale))',
            height: 'calc(35px * var(--scale))',
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
            top: 'calc(280px * var(--scale))',
            left: 'calc(390px * var(--scale))',
            width: 'calc(45px * var(--scale))',
            height: 'calc(35px * var(--scale))',
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
            top: 'calc(280px * var(--scale))',
            left: 'calc(455px * var(--scale))',
            width: 'calc(45px * var(--scale))',
            height: 'calc(35px * var(--scale))',
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
            top: 'calc(280px * var(--scale))',
            left: 'calc(540px * var(--scale))',
            width: 'calc(40px * var(--scale))',
            height: 'calc(35px * var(--scale))',
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
            top: 'calc(380px * var(--scale))',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(60px * var(--scale))',
            height: 'calc(60px * var(--scale))',
            cursor: 'pointer',
            transition: 'transform 0.1s',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
        />

        {/* Volume Slider */}
        <div style={{
          position: 'absolute',
          bottom: 'calc(20px * var(--scale))',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: '#00ff00',
          padding: 'calc(10px * var(--scale))',
          borderRadius: 'calc(6px * var(--scale))',
          display: 'flex',
          alignItems: 'center',
          gap: 'calc(10px * var(--scale))',
          fontSize: 'calc(14px * var(--scale))',
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}>
          <span>VOL:</span>
          <input 
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolume}
            style={{ 
              width: 'calc(120px * var(--scale))',
              height: 'calc(6px * var(--scale))'
            }}
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>

        </div>

      </div>

      <audio ref={audioRef} src={tracks[trackIndex].src} />
    </>
  );
};

export default RadioPlayer;
