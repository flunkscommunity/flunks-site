import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface MusicPlayerProps {
  songTitle: string;
  artist: string;
  songFile?: string;
  themeColor: string;
}

const PlayerContainer = styled.div<{ themeColor: string }>`
  background: linear-gradient(to bottom, #e0e0e0, #c0c0c0);
  border: 2px outset #cccccc;
  padding: 8px;
  font-family: 'Verdana', sans-serif;
  font-size: 10px;
  width: 100%;
  margin: 8px 0;
`;

const PlayerHeader = styled.div<{ themeColor: string }>`
  background: ${props => props.themeColor};
  color: white;
  padding: 3px 6px;
  margin: -8px -8px 6px -8px;
  font-weight: bold;
  font-size: 9px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PlayerControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
`;

const ControlButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? '#4CAF50' : 'linear-gradient(to bottom, #f0f0f0, #d0d0d0)'};
  border: 1px ${props => props.active ? 'inset' : 'outset'} #999;
  color: ${props => props.active ? 'white' : '#000'};
  width: 24px;
  height: 20px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.active ? '#45a049' : 'linear-gradient(to bottom, #f5f5f5, #d5d5d5)'};
  }
  
  &:active {
    border: 1px inset #999;
  }
`;

const SongInfo = styled.div`
  background: #000;
  color: #00ff00;
  padding: 4px 6px;
  font-family: 'Courier New', monospace;
  font-size: 9px;
  border: 1px inset #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
`;

const ScrollingText = styled.div<{ isPlaying: boolean }>`
  display: inline-block;
  animation: ${props => props.isPlaying ? 'scroll 15s linear infinite' : 'none'};
  
  @keyframes scroll {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
`;

const ProgressBar = styled.div`
  background: #333;
  height: 8px;
  border: 1px inset #666;
  margin-bottom: 4px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number; themeColor: string }>`
  background: ${props => props.themeColor};
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -2px;
    width: 2px;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    animation: pulse 1s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 8px;
`;

const VolumeSlider = styled.input`
  width: 40px;
  height: 12px;
`;

const TimeDisplay = styled.div`
  font-size: 8px;
  color: #666;
  text-align: right;
`;

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  songTitle, 
  artist, 
  songFile, 
  themeColor 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Default 3 minutes
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (100 / duration);
          return newProgress >= 100 ? 0 : newProgress;
        });
        setCurrentTime((prev) => (prev + 1) % duration);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration]);

  const handlePlay = () => {
    if (songFile && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.warn);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PlayerContainer themeColor={themeColor}>
      <PlayerHeader themeColor={themeColor}>
        🎵 MyPlace Music Player
      </PlayerHeader>
      
      <SongInfo>
        <ScrollingText isPlaying={isPlaying}>
          ♪ {artist} - {songTitle} ♪
        </ScrollingText>
      </SongInfo>
      
      <ProgressBar>
        <ProgressFill progress={progress} themeColor={themeColor} />
      </ProgressBar>
      
      <PlayerControls>
        <ControlButton onClick={handlePlay} active={isPlaying}>
          {isPlaying ? '⏸' : '▶'}
        </ControlButton>
        <ControlButton onClick={handleStop}>
          ⏹
        </ControlButton>
        <ControlButton>⏮</ControlButton>
        <ControlButton>⏭</ControlButton>
        
        <VolumeControl>
          🔊
          <VolumeSlider
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
          />
          {volume}%
        </VolumeControl>
      </PlayerControls>
      
      <TimeDisplay>
        {formatTime(currentTime)} / {formatTime(duration)}
      </TimeDisplay>
      
      {songFile && (
        <audio
          ref={audioRef}
          src={songFile}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(Math.floor(audioRef.current.duration));
              audioRef.current.volume = volume / 100;
            }
          }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
              setProgress(percent);
              setCurrentTime(Math.floor(audioRef.current.currentTime));
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
          }}
        />
      )}
    </PlayerContainer>
  );
};

export default MusicPlayer;