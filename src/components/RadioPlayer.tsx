import { useRef, useState, useEffect } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { useAudio } from '../contexts/AudioContext';
import { useRadio } from '../contexts/RadioContext';

const tracks = [
  { src: '/audio/stations/87.9-FREN/radio_static.mp3', title: '87.9 FREN', frequency: '87.9', station: 'FREN' },
  { src: '/audio/stations/97.5-WZRD/2.mp3', title: '97.5 WZRD', frequency: '97.5', station: 'WZRD' },
  { src: '/audio/stations/101.9-TEDY/roofroof.mp3', title: '101.9 TEDY', frequency: '101.9', station: 'TEDY' },
  { src: '/audio/stations/104.1-FLNK/boywonder.mp3', title: '104.1 FLNK', frequency: '104.1', station: 'FLNK' }
];

const RadioPlayer = () => {
  // Use radio context instead of local state
  const {
    audioRef,
    trackIndex,
    setTrackIndex,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    stationData,
    setStationData,
    currentTrackInStation,
    setCurrentTrackInStation,
    fastForwardTrack,
    rewindTrack
  } = useRadio();
  
  const { width } = useWindowSize();
  const { isMuted, globalVolume } = useAudio();
  
  // Autoplay current station on component mount when station data is available
  useEffect(() => {
    if (audioRef.current && stationData.length > 0) {
      const currentStation = stationData[trackIndex]; // Use random starting station
      const currentSongIndex = currentTrackInStation[trackIndex];
      if (currentStation && currentStation.tracks[currentSongIndex]) {
        audioRef.current.src = currentStation.tracks[currentSongIndex].src;
        audioRef.current.volume = isMuted ? 0 : volume;
        
        // Store original volume for the audio context
        audioRef.current.dataset.originalVolume = volume.toString();
        
        // Try to autoplay (modern browsers may block this)
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              // Autoplay was prevented - user will need to click play
              console.log('Autoplay was prevented:', error);
              setIsPlaying(false);
            });
        }
      }
    }
  }, [stationData, trackIndex, currentTrackInStation, isMuted, volume]);

  // Update audio volume when global mute state or volume changes
  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0;
      } else {
        audioRef.current.volume = volume;
      }
    }
  }, [isMuted, volume]);
  
  // Determine if we should use fixed positioning (desktop) or scaled positioning (mobile/tablet)
  const isDesktop = width >= 769;
  
  // Fixed positions for desktop - ACTUALLY RESTORED to working positions
  const buttonPositions = {
    seekBack: { top: '240px', left: '313px', width: '22px', height: '18px' },
    button1: { top: '240px', left: '345px', width: '18px', height: '18px' },
    button2: { top: '240px', left: '370px', width: '18px', height: '18px' },
    button3: { top: '240px', left: '395px', width: '18px', height: '18px' },
    button4: { top: '240px', left: '420px', width: '18px', height: '18px' },
    seekForward: { top: '240px', left: '446px', width: '22px', height: '18px' },
    playButton: { top: '210px', left: '435px', width: '25px', height: '22px' },
    rewind: { top: '320px', left: '363px', width: '40px', height: '20px' },
    fastForward: { top: '320px', left: '417px', width: '60px', height: '20px' }
  };
  
  // Helper function to get button style based on screen size
  const getButtonStyle = (buttonKey: keyof typeof buttonPositions) => {
    const pos = buttonPositions[buttonKey];
    if (isDesktop) {
      return {
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height
      };
    } else {
      return {
        top: `calc(${pos.top} * var(--scale))`,
        left: `calc(${pos.left} * var(--scale))`,
        width: `calc(${pos.width} * var(--scale))`,
        height: `calc(${pos.height} * var(--scale))`
      };
    }
  };

  // Helper function to get container style based on screen size
  const getContainerStyle = () => {
    if (isDesktop) {
      return {
        position: 'relative' as const,
        width: '680px',  // Fixed width for desktop
        height: '480px', // Fixed height for desktop
        maxWidth: '100%',
        maxHeight: '100%'
      };
    } else {
      return {
        position: 'relative' as const,
        width: 'calc(680px * var(--scale))',
        height: 'calc(480px * var(--scale))',
        maxWidth: '95vw', // Ensure it fits in viewport width
        maxHeight: '85vh', // Reduced from 90vh to give more space
        '--scale': '1'
      } as React.CSSProperties;
    }
  };

  const selectStation = (stationIndex: number) => {
    console.log(`Selecting station ${stationIndex}:`, tracks[stationIndex]?.title);
    setTrackIndex(stationIndex);
    
    if (audioRef.current && stationData.length > 0) {
      const station = stationData[stationIndex];
      const songIndex = currentTrackInStation[stationIndex];
      console.log(`Station data for ${stationIndex}:`, station);
      console.log(`Song index for station ${stationIndex}:`, songIndex);
      
      if (station && station.tracks[songIndex]) {
        const newTrack = station.tracks[songIndex];
        console.log(`Loading track:`, newTrack);
        audioRef.current.src = newTrack.src;
        
        // Small delay to ensure audio source is loaded, then auto-start playing
        setTimeout(() => {
          if (audioRef.current) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log(`Station ${tracks[stationIndex]?.title} autoplay successful`);
                  setIsPlaying(true);
                })
                .catch((error) => {
                  console.log(`Station ${tracks[stationIndex]?.title} autoplay prevented:`, error);
                  // Try again after a brief delay
                  setTimeout(() => {
                    if (audioRef.current) {
                      audioRef.current.play()
                        .then(() => {
                          console.log(`Station ${tracks[stationIndex]?.title} autoplay retry successful`);
                          setIsPlaying(true);
                        })
                        .catch(() => {
                          console.log(`Station ${tracks[stationIndex]?.title} autoplay retry failed`);
                          setIsPlaying(false);
                        });
                    }
                  }, 200);
                });
            } else {
              // Fallback for older browsers
              console.log(`Station ${tracks[stationIndex]?.title} using fallback play`);
              setIsPlaying(true);
            }
          }
        }, 100);
      } else {
        console.log(`No track found for station ${stationIndex}, song index ${songIndex}`);
      }
    } else if (audioRef.current) {
      // Fallback to original tracks if station data not loaded yet
      console.log(`Using fallback track for station ${stationIndex}`);
      audioRef.current.src = tracks[stationIndex].src;
      
      setTimeout(() => {
        if (audioRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`Fallback station ${tracks[stationIndex]?.title} autoplay successful`);
                setIsPlaying(true);
              })
              .catch(() => {
                console.log(`Fallback station ${tracks[stationIndex]?.title} autoplay failed`);
                setIsPlaying(false);
              });
          }
        }
      }, 100);
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
      // Store original volume for global audio context
      audioRef.current.dataset.originalVolume = newVolume.toString();
      // Only set volume if not muted
      if (!isMuted) {
        audioRef.current.volume = newVolume;
      }
    }
  };

  return (
    <>
      <style jsx>{`
        .radio-wrapper {
          --scale: 1;
        }

        /* Desktop and larger - Fixed positioning, no scaling */
        @media (min-width: 769px) {
          .radio-wrapper {
            --scale: 1;
          }
          
          .desktop-fixed {
            --scale: 1 !important;
          }
        }
      `}</style>
      
      {/* Desktop Layout */}
      {isDesktop ? (
        <div style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: `
            radial-gradient(circle at 20% 20%, rgba(200, 200, 255, 0.15) 0%, transparent 25%),
            radial-gradient(circle at 80% 60%, rgba(255, 200, 255, 0.1) 0%, transparent 25%),
            radial-gradient(circle at 40% 90%, rgba(200, 255, 200, 0.1) 0%, transparent 25%),
            linear-gradient(45deg, #e8e8e8 25%, transparent 25%),
            linear-gradient(-45deg, #e8e8e8 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
            linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
          `,
          backgroundSize: '200px 200px, 150px 150px, 180px 180px, 8px 8px, 8px 8px, 8px 8px, 8px 8px',
          backgroundPosition: '0 0, 50px 30px, 100px 80px, 0 0, 0 4px, 4px -4px, -4px 0px',
          backgroundColor: '#f2f2f2',
          padding: '10px'
        }}>
          
          <div 
            className="radio-wrapper desktop-fixed"
            style={{
              position: 'relative',
              width: '680px',
              height: '480px',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
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
              top: '220px',
              left: 'calc(50% + 30px)',
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '30px',
              pointerEvents: 'none'
            }}
          />

          {/* Station Display */}
          <div style={{
            position: 'absolute',
            top: '220px',
            left: 'calc(50% + 30px)',
            transform: 'translate(-50%, -50%)',
            color: '#00ff00',
            fontSize: '11px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textAlign: 'center',
            pointerEvents: 'none',
            textShadow: '0 0 8px #00ff00',
            letterSpacing: '1px'
          }}>
            {tracks[trackIndex].title}
          </div>

          {/* All the desktop buttons with restored positions */}
          <img 
            src="/images/seek-back.png"
            alt="Previous Station"
            onClick={seekBack}
            className="cursor-win95-pointer"
            style={{
              position: 'absolute',
              ...getButtonStyle('seekBack'),
              opacity: 0.8,
              transition: 'opacity 0.2s, transform 0.1s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          />

          <img 
            src="/images/button-1.png"
            alt="87.9 FREN"
            onClick={() => selectStation(0)}
            className="cursor-win95-pointer"
            style={{
              position: 'absolute',
              ...getButtonStyle('button1'),
              opacity: trackIndex === 0 ? 1 : 0.7,
              transform: trackIndex === 0 ? 'scale(1.1)' : 'scale(1)'
            }}
          />

          <img 
            src="/images/button-2.png"
            alt="97.5 WZRD"
            onClick={() => selectStation(1)}
            className="cursor-win95-pointer"
            style={{
              position: 'absolute',
              ...getButtonStyle('button2'),
              opacity: trackIndex === 1 ? 1 : 0.7,
              transform: trackIndex === 1 ? 'scale(1.1)' : 'scale(1)'
            }}
          />

          <img 
            src="/images/button-3.png"
            alt="101.9 TEDY"
            onClick={() => selectStation(2)}
            className="cursor-win95-pointer"
            style={{
              position: 'absolute',
              ...getButtonStyle('button3'),
              opacity: trackIndex === 2 ? 1 : 0.7,
              transform: trackIndex === 2 ? 'scale(1.1)' : 'scale(1)'
            }}
          />

          <img 
            src="/images/button-4.png"
            alt="104.1 FLNK"
            onClick={() => selectStation(3)}
            className="cursor-win95-pointer"
            style={{
              position: 'absolute',
              ...getButtonStyle('button4'),
              opacity: trackIndex === 3 ? 1 : 0.7,
              transform: trackIndex === 3 ? 'scale(1.1)' : 'scale(1)'
            }}
          />

          <img 
            src="/images/seek-forward.png"
            alt="Next Station"
            onClick={seekForward}
            className="cursor-win95-pointer"
            style={{
              position: 'absolute',
              ...getButtonStyle('seekForward'),
              opacity: 0.8
            }}
          />

          <img 
            src="/images/play-button.png"
            alt={isPlaying ? "Pause" : "Play"}
            onClick={togglePlay}
            className="cursor-win95-pointer"
            style={{
              position: 'absolute',
              ...getButtonStyle('playButton'),
              opacity: isPlaying ? 0.9 : 0.7,
              transform: isPlaying ? 'scale(1.1)' : 'scale(1)'
            }}
          />

          {/* REW Button - Invisible clickable area over the REW text */}
          <div
            onClick={rewindTrack}
            className="cursor-win95-pointer"
            style={{
              position: 'absolute',
              ...getButtonStyle('rewind'),
              backgroundColor: 'transparent',
              opacity: 0.8,
              zIndex: 10
            }}
            title="Previous Track"
          />

          {/* F.FWD Button - Invisible clickable area over the F.FWD text */}
          <div
            onClick={fastForwardTrack}
            className="cursor-win95-pointer"
            style={{
              position: 'absolute',
              ...getButtonStyle('fastForward'),
              backgroundColor: 'transparent',
              opacity: 0.8,
              zIndex: 10
            }}
            title="Next Track"
          />

          </div>
        </div>
      ) : (
        /* Mobile Layout - Simple Control Panel */
        <div style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#2a2a2a',
          padding: '20px'
        }}>
          
          {/* Station Display */}
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            color: '#00ff00',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            textAlign: 'center',
            fontSize: '18px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00ff00',
            border: '2px solid #00ff00'
          }}>
            {tracks[trackIndex].title}
          </div>

          {/* Control Buttons */}
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '30px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button onClick={seekBack} style={{
              background: '#333',
              color: 'white',
              border: '2px solid #555',
              borderRadius: '8px',
              padding: '15px 20px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>⏮️ PREV</button>
            
            <button onClick={rewindTrack} style={{
              background: '#444',
              color: 'white',
              border: '2px solid #666',
              borderRadius: '8px',
              padding: '15px 20px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>⏪ REW</button>
            
            <button onClick={togglePlay} style={{
              background: isPlaying ? '#ff4444' : '#44ff44',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '15px 25px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>{isPlaying ? '⏸️ PAUSE' : '▶️ PLAY'}</button>
            
            <button onClick={fastForwardTrack} style={{
              background: '#444',
              color: 'white',
              border: '2px solid #666',
              borderRadius: '8px',
              padding: '15px 20px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>⏩ F.FWD</button>
            
            <button onClick={seekForward} style={{
              background: '#333',
              color: 'white',
              border: '2px solid #555',
              borderRadius: '8px',
              padding: '15px 20px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>NEXT ⏭️</button>
          </div>

          {/* Station Buttons */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {tracks.map((track, index) => (
              <button
                key={index}
                onClick={() => selectStation(index)}
                style={{
                  background: trackIndex === index ? '#00ff00' : '#333',
                  color: trackIndex === index ? 'black' : 'white',
                  border: '2px solid #00ff00',
                  borderRadius: '8px',
                  padding: '10px 15px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {track.frequency}
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: '#00ff00',
            padding: '15px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: '16px',
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
              style={{ width: '150px', height: '8px' }}
            />
            <span>{Math.round(volume * 100)}%</span>
          </div>

        </div>
      )}

      <audio 
        ref={audioRef} 
        src={stationData.length > 0 && stationData[trackIndex] ? 
          stationData[trackIndex].tracks[currentTrackInStation[trackIndex]]?.src : 
          tracks[trackIndex].src
        }
        preload="auto"
        controls={false}
        style={{ display: 'none' }}
        // These attributes ensure the audio continues playing when minimized
        onPlay={() => console.log('🎵 Radio playing')}
        onPause={() => console.log('⏸️ Radio paused')}
        onEnded={() => {
          console.log('🔄 Track ended, playing next track');
          // Auto-advance to next track when current track ends
          fastForwardTrack();
        }}
        onError={(e) => console.error('🚫 Audio error:', e)}
        onLoadStart={() => console.log('📡 Loading audio...')}
        onCanPlay={() => console.log('✅ Audio ready to play')}
      />
    </>
  );
};

export default RadioPlayer;
