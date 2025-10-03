import React, { useState } from 'react';
import styled from 'styled-components';
import CutscenePlayer from './CutscenePlayer';
import DraggableResizeableWindow from './DraggableResizeableWindow';
import { WINDOW_IDS } from '../fixed';
import { getCurrentBuildMode } from '../utils/buildMode';

interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  scenes: Array<{
    id: string;
    image: string;
    lines: string[];
    music?: string;
  }>;
  unlocked: boolean;
  thumbnail?: string;
}

interface StoryManualProps {
  onClose: () => void;
}

const ChapterGrid = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 10px;
    gap: 15px;
  }
`;

const ChapterCard = styled.div<{ unlocked: boolean }>`
  background: ${props => props.unlocked ? 
    'linear-gradient(135deg, rgba(245, 162, 211, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)' :
    'linear-gradient(135deg, rgba(100, 100, 100, 0.1) 0%, rgba(50, 50, 50, 0.8) 100%)'
  };
  border: 2px solid ${props => props.unlocked ? '#f5a2d3' : '#666'};
  border-radius: 12px;
  padding: 20px;
  cursor: ${props => props.unlocked ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  position: relative;
  opacity: ${props => props.unlocked ? 1 : 0.6};

  @media (max-width: 768px) {
    padding: 15px;
    min-height: 120px;
  }

  &:hover {
    ${props => props.unlocked && `
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(245, 162, 211, 0.3);
      border-color: #ff69b4;
    `}
  }
`;

const ChapterThumbnail = styled.div<{ bgImage?: string }>`
  width: 100%;
  height: 120px;
  background: ${props => props.bgImage ? 
    `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${props.bgImage})` :
    'linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333), linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333)'
  };
  background-size: ${props => props.bgImage ? 'cover' : '10px 10px'};
  background-position: ${props => props.bgImage ? 'center' : '0 0, 5px 5px'};
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(245, 162, 211, 0.3);
`;

const ChapterNumber = styled.div`
  position: absolute;
  top: -10px;
  left: 15px;
  background: #f5a2d3;
  color: #000;
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 14px;
`;

const ChapterTitle = styled.h3`
  color: #f5a2d3;
  font-size: 18px;
  margin: 0 0 8px 0;
  font-weight: bold;
`;

const ChapterSubtitle = styled.p`
  color: #ffffff;
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
  line-height: 1.4;
`;

const LockedIcon = styled.div`
  font-size: 40px;
  color: #666;
`;

const PlayIcon = styled.div`
  font-size: 40px;
  color: #f5a2d3;
  opacity: 0.8;
`;

// Sample chapter data - this would come from your game state/progress
const sampleChapters: Chapter[] = [
  {
    id: 'story-so-far',
    title: 'The Story So Far 📖',
    subtitle: 'The sky looked different back then. Maybe it was brighter… or maybe I just had younger eyes.',
    unlocked: true,
    thumbnail: '/images/cutscenes/main.png',
    scenes: [
      // Scene 1: Opening (main.png)
      {
        id: 'opening',
        image: '/images/cutscenes/main.png',
        lines: [
          'The sky looked different back then. Maybe it was brighter… or maybe I just had younger eyes.'
        ],
        music: '/music/child.mp3'
      },
      // Scene 2: The Town Description (1.png)
      {
        id: 'town-description',
        image: '/images/cutscenes/1.png',
        lines: [
          'The town, however, wasn\'t. It was the same. Same brick buildings, same cracked sidewalks, same old high school sitting on that hill like a castle.'
        ]
      },
      // Scene 3: Arcadia's History (2.png)
      {
        id: 'arcadia-history',
        image: '/images/cutscenes/2.png',
        lines: [
          'It\'s been that way since they founded Arcadia over a hundred years ago.',
          'Folks come and go, dreams flare up and fade out, but this place… this place don\'t change.'
        ]
      },
      // Scene 4: Changing Times (3.png)
      {
        id: 'changing-times',
        image: '/images/cutscenes/3.png',
        lines: [
          'I\'ve seen storefront signs switch names, the kids swap out their playgrounds for video games and CD\'s...'
        ]
      },
      // Scene 5: Friday Night Lights (4.png)
      {
        id: 'friday-nights',
        image: '/images/cutscenes/4.png',
        lines: [
          'I\'ve seen Friday night lights burn for generations of ballplayers, and I\'ve seen the same creek flood every spring like clockwork.',
          'Some call it boring. I call it Arcadia.'
        ]
      },
      // Scene 6: History Repeats (5.png)
      {
        id: 'history-repeats',
        image: '/images/cutscenes/5.png',
        lines: [
          'And if you stick around long enough, you\'ll notice… history has a way of repeating itself here... Sometimes in small ways. Sometimes in ways that\'ll shake the whole town.',
          'And that\'s the thing about Arcadia—no matter how much the sky changes, no matter what logo or name is on the motel, this place never changes.'
        ]
      },
      // Scene 7: The Faces Change (6.png)
      {
        id: 'faces-change',
        image: '/images/cutscenes/6.png',
        lines: [
          'There faces change but the roles stay the same. There\'s the prep. He\'s polished, perfect smile, and carries himself like the whole town is watching — because in a way, they are. People like him have been here forever: the ones who were born with a head start and play the part like it\'s their birthright.'
        ]
      },
      // Scene 8: The Geek (7.png)
      {
        id: 'the-geek',
        image: '/images/cutscenes/7.png',
        lines: [
          'The Geek? Always on the edge of something bigger, a little too smart for the room, a little too weird for everyone else. You can trade the glasses for a hoodie or the textbook for a keyboard, but the role never leaves. There\'s always a geek.'
        ]
      },
      // Scene 9: The Freak (8.png)
      {
        id: 'the-freak',
        image: '/images/cutscenes/8.png',
        lines: [
          'The Freak? The one who won\'t — or can\'t — fit inside the lines. They get whispered about in hallways, judged for every choice of music, clothes, or silence. They burn bright, but always just far enough away to make people nervous.'
        ]
      },
      // Scene 10: The Jock (9.png)
      {
        id: 'the-jock',
        image: '/images/cutscenes/9.png',
        lines: [
          'And the Jock? Muscles, sweat, and Friday nights under the lights. Doesn\'t matter if he\'s lifting trophies or just trying to escape the weight of expectation — he\'s still the one everyone expects to carry the school\'s pride on his back.'
        ]
      },
      // Scene 11: Final Message (final.png)
      {
        id: 'final-scene',
        image: '/images/cutscenes/final.png',
        lines: [
          'High school is a weird time filled with weird people — and that\'s what makes it unforgettable. Everyone carries their own quirks, flaws, and hidden talents. The truth is, you never know when those unique skills will end up mattering most. What might set you apart today could be the very thing that saves the day tomorrow.'
        ]
      }
    ]
  },
  {
    id: 'homecoming',
    title: 'Homecoming 🏈',
    subtitle: 'By Saturday morning, the gym was ready for a night to remember...',
    unlocked: true, // Will be controlled by build mode
    thumbnail: '/images/cutscenes/homecoming-main.png',
    scenes: [
      // Scene 1: Preparation
      {
        id: 'preparation',
        image: '/images/cutscenes/homecoming-1.png',
        lines: [
          'By Saturday morning, the gym was ready for a night to remember. Streamers hung from the rafters, disco balls cast dancing lights across the polished floor, and everything was perfect for homecoming.'
        ],
        music: '/music/homecomingstory.mp3'
      },
      // Scene 2: The Announcement
      {
        id: 'announcement',
        image: '/images/cutscenes/homecoming-2.png',
        lines: [
          'But by midday, the announcement came: the dance was off. No one gave a reason, just murmurs about a situation still unfolding. Nobody knew for sure what was happening — only that it wasn\'t good.'
        ]
      },
      // Scene 3: The Mystery
      {
        id: 'mystery',
        image: '/images/cutscenes/homecoming-3.png',
        lines: [
          'The lights stayed on, the decorations hung in silence, and the dance floor never saw a single step. The mystery of what happened that day still echoes through these empty halls.'
        ]
      }
    ]
  }
];

const StoryManual: React.FC<StoryManualProps> = ({ onClose }) => {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [playingCutscene, setPlayingCutscene] = useState(false);
  
  // Filter chapters based on build mode - only show Homecoming in build mode
  const buildMode = getCurrentBuildMode();
  const availableChapters = sampleChapters.filter(chapter => {
    if (chapter.id === 'homecoming') {
      return buildMode === 'build';
    }
    return true; // Show all other chapters
  });

  const handleChapterClick = (chapter: Chapter) => {
    if (!chapter.unlocked) return;
    setSelectedChapter(chapter);
    setPlayingCutscene(true);
  };

  const handleCutsceneComplete = () => {
    setPlayingCutscene(false);
    setSelectedChapter(null);
  };

  const handleCutsceneClose = () => {
    setPlayingCutscene(false);
    setSelectedChapter(null);
  };

  if (playingCutscene && selectedChapter) {
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Mobile: Use windowed mode with DraggableResizeableWindow
      return (
        <div style={{
          background: 'linear-gradient(135deg, #2a1810 0%, #1a1008 100%)',
          height: '100%',
          overflow: 'hidden',
          fontFamily: 'Courier New, monospace',
          padding: '20px',
          position: 'relative'
        }}>
          {/* Chapter selection in background */}
          <ChapterGrid style={{ opacity: 0.3, pointerEvents: 'none' }}>
            {availableChapters.map((chapter, index) => (
              <ChapterCard
                key={chapter.id}
                unlocked={chapter.unlocked}
              >
                <ChapterNumber>{index + 1}</ChapterNumber>
                <ChapterThumbnail bgImage={chapter.thumbnail} />
                <ChapterTitle>{chapter.title}</ChapterTitle>
                <ChapterSubtitle>{chapter.subtitle}</ChapterSubtitle>
              </ChapterCard>
            ))}
          </ChapterGrid>
          
          {/* Cutscene in draggable window for mobile */}
          <DraggableResizeableWindow
            windowsId={`cutscene-${selectedChapter.id}`}
            onClose={handleCutsceneClose}
            initialWidth="100%"
            initialHeight="100%"
            resizable={false}
            headerTitle={selectedChapter.title}
            headerIcon="🎬"
            style={{ 
              zIndex: 1000,
              position: 'absolute',
              top: '0px',
              left: '0px',
              width: '100%',
              height: '100%'
            }}
          >
            <CutscenePlayer
              scenes={selectedChapter.scenes}
              onComplete={handleCutsceneComplete}
              onClose={handleCutsceneClose}
              windowed={true}
            />
          </DraggableResizeableWindow>
        </div>
      );
    } else {
      // Desktop: Use fullscreen mode
      return (
        <CutscenePlayer
          scenes={selectedChapter.scenes}
          onComplete={handleCutsceneComplete}
          onClose={handleCutsceneClose}
          windowed={false}
        />
      );
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2a1810 0%, #1a1008 100%)',
      height: '100%',
      overflow: 'hidden',
      fontFamily: 'Courier New, monospace',
      padding: '20px'
    }}>
      <ChapterGrid>
          {availableChapters.map((chapter, index) => (
            <ChapterCard
              key={chapter.id}
              unlocked={chapter.unlocked}
              onClick={() => handleChapterClick(chapter)}
            >
              <ChapterThumbnail bgImage={chapter.thumbnail}>
                {chapter.unlocked ? (
                  <PlayIcon>▶️</PlayIcon>
                ) : (
                  <LockedIcon>🔒</LockedIcon>
                )}
              </ChapterThumbnail>

              <ChapterTitle>{chapter.title}</ChapterTitle>
              <ChapterSubtitle>
                {chapter.unlocked ? chapter.subtitle : 'Complete previous chapters to unlock'}
              </ChapterSubtitle>
            </ChapterCard>
          ))}
        </ChapterGrid>
      </div>
    );
  };

export default StoryManual;