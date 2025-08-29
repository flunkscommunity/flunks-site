import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/map.module.css';
import { useWindowsContext } from "contexts/WindowsContext";
import TreehouseMain from "windows/Locations/TreehouseMain";
import ArcadeMain from "windows/Locations/ArcadeMain";
import MotelMain from "windows/Locations/MotelMain";
import DinerMain from "windows/Locations/DinerMain";
// New location imports
import JocksHouseMain from "windows/Locations/JocksHouseMain";
import FreaksHouseMain from "windows/Locations/FreaksHouseMain";
import GeeksHouseMain from "windows/Locations/GeeksHouseMain";
import PrepsHouseMain from "windows/Locations/PrepsHouseMain";
import FlunkFmMain from "windows/Locations/FlunkFmMain";
import PoliceStationMain from "windows/Locations/PoliceStationMain";
import FootballFieldMain from "windows/Locations/FootballFieldMain";
import SnackShackMain from "windows/Locations/SnackShackMain";
import FourThievesBarMain from "windows/Locations/FourThievesBarMain";
import JunkyardMain from "windows/Locations/JunkyardMain";
import LakeTreeMain from "windows/Locations/LakeTreeMain";
import RugDoctorMain from "windows/Locations/RugDoctorMain";
import ShedMain from "windows/Locations/ShedMain";
import SecretTreehouseMain from "windows/Locations/SecretTreehouseMain";
import HighSchoolMain from "windows/Locations/HighSchoolMain";
import ParadiseMotelMain from "windows/Locations/ParadiseMotelMain";
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { WINDOW_IDS } from "fixed";
import { Button } from 'react95';
import SemesterZeroCSSLoader from "components/SemesterZeroCSSLoader";
import { useCliqueAccess, CliqueType } from 'hooks/useCliqueAccess';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import ErrorWindow from 'windows/ErrorWindow';
import { useHouseImage } from '../utils/dayNightHouses';
import { DynamicHouseIcon } from '../components/DynamicHouseIcon';
import { useAuth } from 'contexts/AuthContext';

interface Props {
  onClose: () => void;
}

const Semester0Map: React.FC<Props> = ({ onClose }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [enhancedHover, setEnhancedHover] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  // Room overlay state for full-screen room backgrounds
  const [activeRoom, setActiveRoom] = useState<{
    location: string;
    roomName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);
  const { openWindow, closeWindow } = useWindowsContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInnerRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const [touchedLocation, setTouchedLocation] = useState<string | null>(null);
  
  // Clique access hooks
  const { hasAccess } = useCliqueAccess();
  const { user, primaryWallet } = useDynamicContext();
  const auth = useAuth();
  
  // Get authentication and NFT data from auth context
  const { isAuthenticated, flunksCount, hasFlunks } = auth;

  // Helper function to handle location access - checks NFT ownership but allows wallet-only auth
  const handleLocationAccess = (
    locationKey: string, 
    openLocationWindow: () => void, 
    e?: React.MouseEvent
  ) => {
    if (!isAuthenticated) {
      // Show connection prompt
      console.log('Please connect your wallet to access locations');
      alert('Please connect your wallet to access this location.');
      return;
    }
    
    if (!hasFlunks) {
      // Show NFT requirement message
      alert(`You need at least 1 Flunk NFT to access locations. You currently have ${flunksCount} Flunks.`);
      return;
    }
    
    // User has NFTs - proceed with normal access
    openLocationWindow();
  };

  // Helper function to check clique access and handle unauthorized attempts
  const handleCliqueHouseAccess = (clique: CliqueType, windowId: string, component: JSX.Element, houseName: string) => {
    if (!isAuthenticated) {
      alert('Please connect your wallet to access clique houses.');
      return;
    }

    if (!hasFlunks) {
      alert(`You need at least 1 Flunk NFT to access locations. You currently have ${flunksCount} Flunks.`);
      return;
    }

    if (!hasAccess(clique)) {
      // Show access denied message
      openWindow({
        key: WINDOW_IDS.ERROR,
        window: (
          <ErrorWindow
            title="Access Denied"
            message={`You need to own a ${clique} NFT to access the ${houseName}. Only members of this clique can enter!`}
            actions={
              <Button onClick={() => closeWindow(WINDOW_IDS.ERROR)}>
                Close
              </Button>
            }
            windowId={WINDOW_IDS.ERROR}
            onClose={() => closeWindow(WINDOW_IDS.ERROR)}
          />
        ),
      });
      return;
    }

    // User has access, open the window
    openWindow({
      key: windowId,
      window: component,
    });
  };

  // Location data for enhanced hover previews - ALL LOCATIONS
  const locationData = {
    'arcade': { title: "Arcade", description: "Old machines hum with half-lit screens. The sounds of vintage games echo through the dimly lit space.", icon: "🕹️", rooms: [{ name: "Main Floor", description: "Classic arcade cabinets line the walls" }, { name: "Prize Counter", description: "Dusty toys and forgotten treasures" }, { name: "Back Room", description: "Broken machines and spare parts" }, { name: "Office", description: "The manager's cluttered workspace" }] },
    'jocks-house': { title: "Jock's House", description: "Sports trophies and team spirit fill every room. Motivational posters line the walls with messages like 'ZERO EXCUSES' and 'WINNERS NEVER QUIT' reminding everyone that there are zero excuses for failure.", icon: "🏠", rooms: [{ name: "Trophy Room", description: "Championships and glory on display" }, { name: "Home Gym", description: "Weights and training equipment" }, { name: "Team Lounge", description: "Where champions gather and plan" }, { name: "Basement", description: "Sports gear storage and team equipment vault" }] },
    'freaks-house': { title: "Freak's House", description: "A dark and mysterious dwelling where the outcasts gather. The walls are covered in band posters and strange artwork.", icon: "🖤", rooms: [{ name: "Dark Living Room", description: "Candles flicker in the shadows" }, { name: "Music Corner", description: "Heavy metal echoes through the air" }, { name: "Art Studio", description: "Strange paintings line the walls" }, { name: "Secret Basement", description: "What lurks below remains hidden" }] },
    'geeks-house': { title: "Geek's House", description: "A laboratory of knowledge and innovation. Computer screens glow with endless possibilities.", icon: "🤓", rooms: [{ name: "Computer Lab", description: "Multiple screens displaying code and data" }, { name: "Workshop", description: "Electronics and gadgets being assembled" }, { name: "Library", description: "Technical manuals and sci-fi novels" }, { name: "Testing Room", description: "Experiments in progress" }] },
    'preps-house': { title: "Prep's House", description: "Perfection and privilege behind manicured lawns. Every detail speaks of wealth and status.", icon: "💅", rooms: [{ name: "Grand Foyer", description: "Marble floors and crystal chandeliers" }, { name: "Study", description: "Leather-bound books and mahogany furniture" }, { name: "Walk-in Closet", description: "Designer clothes and luxury accessories" }, { name: "Private Suite", description: "Elegance and exclusivity" }] },
    'flunk-fm': { title: "Flunk FM", description: "The voice of the town broadcasts from here. Radio waves carry secrets across the airwaves.", icon: "📻", rooms: [{ name: "Studio", description: "Microphones and mixing boards" }, { name: "Control Room", description: "Technical equipment and broadcast controls" }, { name: "Music Library", description: "Vinyl records and forgotten hits" }, { name: "DJ Booth", description: "Where the magic happens live on air" }] },
    'police-station': { title: "Police Station", description: "Where authority meets the streets. Case files and evidence tell stories of justice and mystery.", icon: "👮", rooms: [{ name: "Front Desk", description: "First line of law and order" }, { name: "Investigation Room", description: "Where suspects are questioned" }, { name: "Evidence Locker", description: "Secrets locked away for safekeeping" }, { name: "Chief's Office", description: "Command center of local law enforcement" }] },
    'football-field': { title: "Football Field", description: "Friday night lights and hometown pride. The field where legends are made and dreams are broken.", icon: "🏈", rooms: [{ name: "50-Yard Line", description: "The heart of game day glory" }, { name: "Locker Room", description: "Pre-game rituals and team talks" }, { name: "Press Box", description: "Bird's eye view of all the action" }, { name: "Equipment Shed", description: "Gear and maintenance supplies" }] },
    'snack-shack': { title: "Snack Shack", description: "Quick bites for hungry students. The aroma of carnival food and teenage memories.", icon: "🍟", rooms: [{ name: "Counter", description: "Where orders are taken and friendships made" }, { name: "Kitchen", description: "Grease, heat, and comfort food" }, { name: "Storage", description: "Supplies and secret ingredients" }, { name: "Picnic Area", description: "Outdoor seating under string lights" }] },
    'four-thieves-bar': { title: "Four Thieves Bar", description: "The local watering hole where secrets are shared over drinks and the jukebox plays forgotten tunes.", icon: "🍺", rooms: [{ name: "Main Bar", description: "Where the locals gather to forget" }, { name: "Pool Room", description: "Games and hushed conversations" }, { name: "Private Booth", description: "Deals are made in the shadows" }, { name: "Back Alley", description: "Where the real business happens" }] },
    'junkyard': { title: "Junkyard", description: "Treasures hide among the rust and ruin. Every pile of scrap tells a story of the past.", icon: "🚗", rooms: [{ name: "Car Graveyard", description: "Rusted vehicles hold forgotten memories" }, { name: "Scrap Heap", description: "Metal treasures wait to be discovered" }, { name: "Office Shack", description: "The owner's domain filled with records" }, { name: "Hidden Bunker", description: "What secrets lie underground?" }] },
    'lake-tree': { title: "Lake Tree", description: "A peaceful spot where secrets are carved in bark. The old tree has witnessed many stories.", icon: "🌳", rooms: [{ name: "Tree Base", description: "Carved initials and love letters" }, { name: "Rope Swing", description: "Summer fun and daring leaps" }, { name: "Picnic Spot", description: "Quiet conversations under shade" }, { name: "Hidden Hollow", description: "Secret meetings and whispered confessions" }] },
    'rug-doctor': { title: "Rug Doctor", description: "Making the old look new again. Steam and suds wash away more than just stains.", icon: "🧽", rooms: [{ name: "Front Counter", description: "Customer service with a smile" }, { name: "Cleaning Bay", description: "Industrial machines and chemical solutions" }, { name: "Storage Room", description: "Cleaning supplies and equipment" }, { name: "Back Office", description: "Business records and appointment books" }] },
    'shed': { title: "Old Shed", description: "Once you go in, you're never the same. Rusty tools and forgotten projects gather dust.", icon: "🏚️", rooms: [{ name: "Main Area", description: "Cluttered workspace with mysterious projects" }, { name: "Tool Wall", description: "Rusty implements of unknown purpose" }, { name: "Corner Pile", description: "Junk that might be treasure" }, { name: "Hidden Compartment", description: "What was someone trying to hide?" }] },
    'secret-treehouse': { title: "Secret Treehouse", description: "Hidden among the branches, this treehouse holds mysteries and clues about the strange happenings around town.", icon: "🌲", rooms: [{ name: "Loft", description: "Dusty space with old comics and treasures" }, { name: "Work Desk", description: "Investigation station with maps and walkie talkie" }, { name: "Old Trunk", description: "Mysterious container with flashlight and diary" }, { name: "Secret Window", description: "Lake overlook with glimmering water below" }] },
    'high-school': { title: "High School", description: "Abandoned halls echo with the past. Empty classrooms hold memories of youth and learning.", icon: "🏫", rooms: [{ name: "Hallway", description: "Lockers with mysterious graffiti" }, { name: "Classroom", description: "Abandoned desks with carved initials" }, { name: "Cafeteria", description: "Empty trays and lingering smells" }, { name: "Gymnasium", description: "Bent hoops and echoing memories" }] },
    'paradise-motel': { title: "Paradise Motel", description: "A place where strange guests check in but never leave. The neon sign flickers with faded promises.", icon: "🏨", rooms: [{ name: "Lobby", description: "Flickering neon and strange guest book" }, { name: "Room 1", description: "Unmade bed with static TV" }, { name: "Room 2", description: "Mirror room reflecting something different" }, { name: "Pool Area", description: "Green water with mysterious rubber duck" }] }
  };

  const handleEnhancedHover = (locationKey: string) => {
    // Set both hover states for screen dimming and icon enlarging
    setHovered(locationKey);
    setEnhancedHover(locationKey);
  };

  const handleEnhancedLeave = () => {
    // Clear all hover states
    setEnhancedHover(null);
    setHovered(null);
  };

  // Simple hover handlers for navigation icons - just show map location hover
  const handleNavHover = (locationKey: string) => {
    setHovered(locationKey);
    // Don't set enhancedHover - we only want the simple map location hover
  };

  const handleNavLeave = () => {
    setHovered(null);
  };

  const handleEnhancedClick = (locationKey: string, e: React.MouseEvent) => {
    if (!user) {
      // User not signed in - do nothing
      return;
    }
    
    e.stopPropagation(); // Prevent opening the location window
    console.log('Enhanced click triggered for:', locationKey); // Debug log
    if (enhancedHover === locationKey) {
      // If already showing this location, close it
      setEnhancedHover(null);
      setHovered(null);
      console.log('Closing enhanced preview for:', locationKey); // Debug log
    } else {
      // Show the enhanced preview
      setEnhancedHover(locationKey);
      setHovered(locationKey);
      console.log('Opening enhanced preview for:', locationKey); // Debug log
    }
  };

  const handleEnhancedClose = () => {
    setEnhancedHover(null);
    setHovered(null);
  };

  // Mobile two-tap functionality: first tap shows hover, second tap enters
  const handleTouchEnter = (key: string) => {
    if (touchedLocation === key) {
      // Second tap - clear the hover and proceed with click
      setTouchedLocation(null);
      setHovered(null);
      return; // Let the onClick handler take over
    } else {
      // First tap - show hover effect
      setTouchedLocation(key);
      setHovered(key);
      // Clear after 5 seconds to reset state
      setTimeout(() => {
        setTouchedLocation(null);
        setHovered(null);
      }, 5000);
    }
  };
  
  const handleTouchLeave = () => {
    // Don't clear on touch leave to maintain the first-tap state
  };

  // Clear touched location when clicking elsewhere on mobile
  const handleMapClick = () => {
    if (isMobile && touchedLocation) {
      setTouchedLocation(null);
      setHovered(null);
    }
  };

  // Helper: slugify a room/location name for file paths
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Compute background image path with graceful fallback (backgrounds -> icons)
  const getLocationBackgrounds = (locationKey: string) => {
    const coverPath = `/images/backgrounds/locations/${locationKey}/cover.webp`;
    const coverJpg = `/images/backgrounds/locations/${locationKey}/cover.jpg`;
    const iconPath = `/images/icons/${locationKey}-icon.png`;
    // Multiple backgrounds allow CSS to fall back when one fails to load
    return `${`url(${coverPath})`}, ${`url(${coverJpg})`}, ${`url(${iconPath})`}`;
  };

  // Room image for overlay with jpg/webp fallback
  const getRoomBackgrounds = (locationKey: string, roomName: string) => {
    const roomSlug = slugify(roomName);
    const webp = `/images/backgrounds/locations/${locationKey}/${roomSlug}.webp`;
    const jpg = `/images/backgrounds/locations/${locationKey}/${roomSlug}.jpg`;
    // Provide a very subtle gradient last so UI still looks OK if images are missing
    const gradient = 'linear-gradient(180deg, rgba(10,10,20,0.95), rgba(5,5,10,0.98))';
    return `${`url(${webp})`}, ${`url(${jpg})`}, ${gradient}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keep map-inner width in sync with zoom (mobile only)
  useEffect(() => {
    if (!mapInnerRef.current) return;
    if (!isMobileRef.current) {
      // Reset any prior inline styles when switching to desktop
      mapInnerRef.current.style.width = '';
      mapInnerRef.current.style.minWidth = '';
      return;
    }
    const baseVW = 320;
    mapInnerRef.current.style.width = `${baseVW * zoom}vw`;
    mapInnerRef.current.style.minWidth = `${baseVW * zoom}vw`;
  }, [zoom]);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      // Hide opening animation after it completes
      setTimeout(() => setShowOpeningAnimation(false), 2000);
    }, 5000);
    return () => {
      clearTimeout(t);
    };
  }, []);

  const togglePause = () => setIsPaused(prev => !prev);

  useEffect(() => {
    // Track mobile once on mount
    const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
    isMobileRef.current = mobile;
    setIsMobile(mobile);
    // initial zoom: slightly zoomed out on mobile
    const initialZoom = mobile ? 0.9 : 1;
    setZoom(initialZoom);
    zoomRef.current = initialZoom;

    const map = mapRef.current;
    if (!map) return;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;
    // Pinch state
    let isPinching = false;
    let pinchStartDistance = 0;
    let pinchStartZoom = zoomRef.current;
    let pinchCenterX = 0;
    let pinchCenterY = 0;
    let startScrollWidth = 0;
    let startScrollHeight = 0;

    const getDistance = (touches: TouchList) => {
      const [t1, t2] = [touches[0], touches[1]];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.hypot(dx, dy);
    };


    const start = (e: MouseEvent | TouchEvent) => {
      // Ignore drags that begin on interactive icons to allow taps
      const target = (e.target as HTMLElement) || null;
      if (target && target.closest(`.${styles.icon}`)) return;
      // If two fingers, start pinch
      if ('touches' in e && e.touches.length === 2) {
        isPinching = true;
        pinchStartDistance = getDistance(e.touches);
        pinchStartZoom = zoomRef.current;
        const rect = map.getBoundingClientRect();
        pinchCenterX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
        pinchCenterY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
        startScrollWidth = map.scrollWidth;
        startScrollHeight = map.scrollHeight;
        return;
      }
      isDown = true;
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      scrollLeft = map.scrollLeft;
      scrollTop = map.scrollTop;

      map.classList.add(styles['dragging']);
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length === 2) {
        // Pinch zoom
        e.preventDefault();
        if (!isPinching) return;
        const dist = getDistance(e.touches);
        const factor = dist / pinchStartDistance;
        const MIN_ZOOM = 0.7;
        const MAX_ZOOM = 2.2;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoom * factor));
  if (isMobileRef.current && mapInnerRef.current) {
          // Update width based on zoom so scroll area scales
          const baseVW = 320; // base width in vw
          mapInnerRef.current.style.width = `${baseVW * newZoom}vw`;
          mapInnerRef.current.style.minWidth = `${baseVW * newZoom}vw`;
        }
        // Maintain focus under pinch center
        const focusX = (map.scrollLeft + pinchCenterX) / startScrollWidth;
        const focusY = (map.scrollTop + pinchCenterY) / startScrollHeight;
        // Read new scroll sizes after style update
        const newScrollWidth = map.scrollWidth;
        const newScrollHeight = map.scrollHeight;
        map.scrollLeft = Math.max(0, Math.min(newScrollWidth, focusX * newScrollWidth - pinchCenterX));
        map.scrollTop = Math.max(0, Math.min(newScrollHeight, focusY * newScrollHeight - pinchCenterY));
        zoomRef.current = newZoom;
        setZoom(newZoom);
        return;
      }
      if (!isDown) return;
      e.preventDefault(); // Prevent default touch behavior
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
      map.scrollLeft = scrollLeft - (x - startX);
      map.scrollTop = scrollTop - (y - startY);
    };

    const stop = () => {
      isDown = false;
      isPinching = false;
      map.classList.remove(styles['dragging']);
    };

    // Enable drag-to-pan for mouse and touch
    map.addEventListener('mousedown', start);
    map.addEventListener('mousemove', move);
    map.addEventListener('mouseup', stop);
    map.addEventListener('mouseleave', stop);
    map.addEventListener('touchstart', start as EventListener, { passive: false });
    map.addEventListener('touchmove', move as EventListener, { passive: false });
    map.addEventListener('touchend', stop as EventListener, { passive: false });

    return () => {
      map.removeEventListener('mousedown', start);
      map.removeEventListener('mousemove', move);
      map.removeEventListener('mouseup', stop);
      map.removeEventListener('mouseleave', stop);
      map.removeEventListener('touchstart', start as EventListener);
      map.removeEventListener('touchmove', move as EventListener);
      map.removeEventListener('touchend', stop as EventListener);
    };
  }, []);

  return (
    <div className={styles["map-container"]}>
      <div className={styles["map-window"]} ref={mapRef}>
        {loading && (
          <div className={styles["loader-overlay"]}>
            <SemesterZeroCSSLoader />
          </div>
        )}
        
        {/* Map is always visible - access restrictions handled at location level */}
        
        {/* Opening animation for school icon */}
        {showOpeningAnimation && !loading && (
          <div className={styles["opening-animation-overlay"]}>
            <div className={styles["opening-school-icon"]}></div>
          </div>
        )}

        {/* Wallet Status Indicator */}
        {!loading && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: isAuthenticated ? (hasFlunks ? '#4CAF50' : '#FF9800') : '#f44336',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            {isAuthenticated ? (
              hasFlunks ? `✅ ${flunksCount} Flunks - Full Access` : `⚠️ Connected - Need Flunks for Access`
            ) : `❌ No Wallet Connected`}
          </div>
        )}
        
    <div className={styles["map-inner"]} ref={mapInnerRef} onClick={handleMapClick}>
          <img
            src="/images/season-zero-map.png"
            className={styles["background-map"]}
            alt="Semester 0 Map"
          />      {/* Screen dimming overlay - appears when hovering over any target location */}
      {!isMobile && (hovered === 'high-school' || hovered === 'arcade' || hovered === 'freaks-house' || hovered === 'geeks-house' || hovered === 'jocks-house' || hovered === 'preps-house') && (
        <div className={styles["map-overlay"]} />
      )}

      {/* Large centered icons that appear when hovering bottom navigation */}
      {!isMobile && hovered === 'high-school' && (
        <div className={`${styles["map-location-hover"]} ${styles["high-school"]}`} />
      )}
      {!isMobile && hovered === 'arcade' && (
        <div className={`${styles["map-location-hover"]} ${styles["arcade"]}`} />
      )}
      {!isMobile && hovered === 'jocks-house' && (
        <div className={`${styles["map-location-hover"]} ${styles["jocks-house"]}`} />
      )}
      {!isMobile && hovered === 'freaks-house' && (
        <div className={`${styles["map-location-hover"]} ${styles["freaks-house"]}`} />
      )}
      {!isMobile && hovered === 'geeks-house' && (
        <div className={`${styles["map-location-hover"]} ${styles["geeks-house"]}`} />
      )}
      {!isMobile && hovered === 'preps-house' && (
        <div className={`${styles["map-location-hover"]} ${styles["preps-house"]}`} />
      )}

      <button className={styles["close-btn"]} onClick={onClose}>✖</button>
      </div>

      {/* Enhanced Hover Overlay - Shows enlarged icon over dimmed map */}
      {/* Removed - reverting to simple hover only */}

      {/* Room Fullscreen Overlay (retro pop-up) */}
      {activeRoom && (
        <div className={styles["room-overlay"]} onClick={() => setActiveRoom(null)}>
          <div
            className={styles["room-image"]}
            style={{ backgroundImage: getRoomBackgrounds(activeRoom.location, activeRoom.roomName) }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className={styles["room-info-bar"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["room-title"]}>
              {locationData[activeRoom.location as keyof typeof locationData]?.title}
              <span className={styles["room-sep"]}> • </span>
              {activeRoom.roomName}
            </div>
            <button className={styles["room-close"]} onClick={() => setActiveRoom(null)} aria-label="Close room">
              ✖
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div
          onClick={togglePause}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <img
    src="/images/pause-screen.png"
    alt="Paused"
    style={{
      maxWidth: '80%',
      maxHeight: '80%',
      borderRadius: '8px',
      boxShadow: '0 0 20px black',
      backgroundColor: '#fff',
      WebkitMaskImage: 'radial-gradient(ellipse closest-side, black 60%, transparent 100%)',
      maskImage: 'radial-gradient(ellipse closest-side, black 60%, transparent 100%)',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
    }}
    onClick={(e) => e.stopPropagation()}
  />
        </div>
      )}

      {/* Pause Button */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 40,
      }}>
        <Button
          onClick={togglePause}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0c0c0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
        >
          Pause
        </Button>
      </div>
    </div>

      {/* Bottom Navigation Bar - Now outside map window */}
      <div className={styles["bottom-nav"]}>
        <div className={styles["nav-section"]}>
          <h3>Main Locations</h3>
          <div className={styles["nav-buttons"]}>
            <DynamicHouseIcon
              houseId="high-school"
              className={`${styles["nav-icon"]} ${styles['high-school-nav']}`}
              onClick={() => {
                // On mobile, if this is the second tap, proceed with opening
                if (isMobile && touchedLocation === 'high-school') {
                  setTouchedLocation(null);
                  setHovered(null);
                  handleLocationAccess('high-school', () => 
                    openWindow({
                      key: WINDOW_IDS.HIGH_SCHOOL_MAIN,
                      window: (
                        <DraggableResizeableWindow
                          windowsId={WINDOW_IDS.HIGH_SCHOOL_MAIN}
                          headerTitle="High School"
                          onClose={() => closeWindow(WINDOW_IDS.HIGH_SCHOOL_MAIN)}
                          initialWidth="70vw"
                          initialHeight="70vh"
                          resizable={true}
                        >
                          <HighSchoolMain />
                        </DraggableResizeableWindow>
                      ),
                    })
                  );
                } else if (!isMobile) {
                  // Desktop behavior - immediate open
                  handleLocationAccess('high-school', () => 
                    openWindow({
                      key: WINDOW_IDS.HIGH_SCHOOL_MAIN,
                      window: (
                        <DraggableResizeableWindow
                          windowsId={WINDOW_IDS.HIGH_SCHOOL_MAIN}
                          headerTitle="High School"
                          onClose={() => closeWindow(WINDOW_IDS.HIGH_SCHOOL_MAIN)}
                          initialWidth="70vw"
                          initialHeight="70vh"
                          resizable={true}
                        >
                          <HighSchoolMain />
                        </DraggableResizeableWindow>
                      ),
                    })
                  );
                }
                // First tap on mobile is handled by handleTouchEnter
              }}
              onMouseEnter={() => {
                setHovered('high-school');
              }}
              onMouseLeave={() => {
                setHovered(null);
              }}
              onTouchStart={() => user && handleTouchEnter('high-school')}
              onTouchEnd={handleTouchLeave}
            >
            </DynamicHouseIcon>
            
            <DynamicHouseIcon
              houseId="arcade"
              className={`${styles["nav-icon"]} ${styles['arcade-nav']}`}
              onClick={() => {
                // On mobile, if this is the second tap, proceed with opening
                if (isMobile && touchedLocation === 'arcade') {
                  setTouchedLocation(null);
                  setHovered(null);
                  handleLocationAccess('arcade', () => 
                    openWindow({
                      key: WINDOW_IDS.ARCADE_MAIN,
                      window: (
                        <DraggableResizeableWindow
                          windowsId={WINDOW_IDS.ARCADE_MAIN}
                          headerTitle="Arcade"
                          onClose={() => closeWindow(WINDOW_IDS.ARCADE_MAIN)}
                          initialWidth="70vw"
                          initialHeight="70vh"
                          resizable={true}
                        >
                          <ArcadeMain />
                        </DraggableResizeableWindow>
                      ),
                    })
                  );
                } else if (!isMobile) {
                  // Desktop behavior - immediate open
                  handleLocationAccess('arcade', () => 
                    openWindow({
                      key: WINDOW_IDS.ARCADE_MAIN,
                      window: (
                        <DraggableResizeableWindow
                          windowsId={WINDOW_IDS.ARCADE_MAIN}
                          headerTitle="Arcade"
                          onClose={() => closeWindow(WINDOW_IDS.ARCADE_MAIN)}
                          initialWidth="70vw"
                          initialHeight="70vh"
                          resizable={true}
                        >
                          <ArcadeMain />
                        </DraggableResizeableWindow>
                      ),
                    })
                  );
                }
              }}
              onMouseEnter={() => {
                setHovered('arcade');
              }}
              onMouseLeave={() => {
                setHovered(null);
              }}
              onTouchStart={() => user && handleTouchEnter('arcade')}
              onTouchEnd={handleTouchLeave}
            >
            </DynamicHouseIcon>
          </div>
        </div>

        <div className={styles["nav-section"]}>
          <h3>Clique Houses</h3>
          <div className={styles["nav-buttons"]}>
            <DynamicHouseIcon
              houseId="jocks-house"
              className={`${styles["nav-icon"]} ${styles['jocks-house-nav']}`}
              onClick={() => {
                // On mobile, if this is the second tap, proceed with opening
                if (isMobile && touchedLocation === 'jocks-house') {
                  setTouchedLocation(null);
                  setHovered(null);
                  handleCliqueHouseAccess(
                    'JOCK',
                    WINDOW_IDS.JOCKS_HOUSE_MAIN,
                    (
                      <DraggableResizeableWindow
                        windowsId={WINDOW_IDS.JOCKS_HOUSE_MAIN}
                        headerTitle="Jock's House"
                        onClose={() => closeWindow(WINDOW_IDS.JOCKS_HOUSE_MAIN)}
                        initialWidth="70vw"
                        initialHeight="70vh"
                        resizable={true}
                      >
                        <JocksHouseMain />
                      </DraggableResizeableWindow>
                    ),
                    "Jock's House"
                  );
                } else if (!isMobile) {
                  // Desktop behavior - immediate open
                  handleCliqueHouseAccess(
                    'JOCK',
                    WINDOW_IDS.JOCKS_HOUSE_MAIN,
                    (
                      <DraggableResizeableWindow
                        windowsId={WINDOW_IDS.JOCKS_HOUSE_MAIN}
                        headerTitle="Jock's House"
                        onClose={() => closeWindow(WINDOW_IDS.JOCKS_HOUSE_MAIN)}
                        initialWidth="70vw"
                        initialHeight="70vh"
                        resizable={true}
                      >
                        <JocksHouseMain />
                      </DraggableResizeableWindow>
                    ),
                    "Jock's House"
                  );
                }
              }}
              onMouseEnter={() => {
                setHovered('jocks-house');
              }}
              onMouseLeave={() => {
                setHovered(null);
              }}
              onTouchStart={() => user && handleTouchEnter('jocks-house')}
              onTouchEnd={handleTouchLeave}
            >
            </DynamicHouseIcon>

            <DynamicHouseIcon
              houseId="freaks-house"
              className={`${styles["nav-icon"]} ${styles['freaks-house-nav']}`}
              onClick={() => {
                // On mobile, if this is the second tap, proceed with opening
                if (isMobile && touchedLocation === 'freaks-house') {
                  setTouchedLocation(null);
                  setHovered(null);
                  handleCliqueHouseAccess(
                    'FREAK',
                    WINDOW_IDS.FREAKS_HOUSE_MAIN,
                    (
                      <DraggableResizeableWindow
                        windowsId={WINDOW_IDS.FREAKS_HOUSE_MAIN}
                        headerTitle="Freak's House"
                        onClose={() => closeWindow(WINDOW_IDS.FREAKS_HOUSE_MAIN)}
                        initialWidth="70vw"
                        initialHeight="70vh"
                        resizable={true}
                      >
                        <FreaksHouseMain />
                      </DraggableResizeableWindow>
                    ),
                    "Freak's House"
                  );
                } else if (!isMobile) {
                  // Desktop behavior - immediate open
                  handleCliqueHouseAccess(
                    'FREAK',
                    WINDOW_IDS.FREAKS_HOUSE_MAIN,
                    (
                      <DraggableResizeableWindow
                        windowsId={WINDOW_IDS.FREAKS_HOUSE_MAIN}
                        headerTitle="Freak's House"
                        onClose={() => closeWindow(WINDOW_IDS.FREAKS_HOUSE_MAIN)}
                        initialWidth="70vw"
                        initialHeight="70vh"
                        resizable={true}
                      >
                        <FreaksHouseMain />
                      </DraggableResizeableWindow>
                    ),
                    "Freak's House"
                  );
                }
              }}
              onMouseEnter={() => {
                setHovered('freaks-house');
              }}
              onMouseLeave={() => {
                setHovered(null);
              }}
              onTouchStart={() => user && handleTouchEnter('freaks-house')}
              onTouchEnd={handleTouchLeave}
            >
            </DynamicHouseIcon>

            <DynamicHouseIcon
              houseId="geeks-house"
              className={`${styles["nav-icon"]} ${styles['geeks-house-nav']}`}
              onClick={() => {
                // On mobile, if this is the second tap, proceed with opening
                if (isMobile && touchedLocation === 'geeks-house') {
                  setTouchedLocation(null);
                  setHovered(null);
                  handleCliqueHouseAccess(
                    'GEEK',
                    WINDOW_IDS.GEEKS_HOUSE_MAIN,
                    (
                      <DraggableResizeableWindow
                        windowsId={WINDOW_IDS.GEEKS_HOUSE_MAIN}
                        headerTitle="Geek's House"
                        onClose={() => closeWindow(WINDOW_IDS.GEEKS_HOUSE_MAIN)}
                        initialWidth="70vw"
                        initialHeight="70vh"
                        resizable={true}
                      >
                        <GeeksHouseMain />
                      </DraggableResizeableWindow>
                    ),
                    "Geek's House"
                  );
                } else if (!isMobile) {
                  // Desktop behavior - immediate open
                  handleCliqueHouseAccess(
                    'GEEK',
                    WINDOW_IDS.GEEKS_HOUSE_MAIN,
                    (
                      <DraggableResizeableWindow
                        windowsId={WINDOW_IDS.GEEKS_HOUSE_MAIN}
                        headerTitle="Geek's House"
                        onClose={() => closeWindow(WINDOW_IDS.GEEKS_HOUSE_MAIN)}
                        initialWidth="70vw"
                        initialHeight="70vh"
                        resizable={true}
                      >
                        <GeeksHouseMain />
                      </DraggableResizeableWindow>
                    ),
                    "Geek's House"
                  );
                }
              }}
              onMouseEnter={() => {
                setHovered('geeks-house');
              }}
              onMouseLeave={() => {
                setHovered(null);
              }}
              onTouchStart={() => user && handleTouchEnter('geeks-house')}
              onTouchEnd={handleTouchLeave}
            >
            </DynamicHouseIcon>

            <DynamicHouseIcon
              houseId="preps-house"
              className={`${styles["nav-icon"]} ${styles['preps-house-nav']}`}
              onClick={() => {
                // On mobile, if this is the second tap, proceed with opening
                if (isMobile && touchedLocation === 'preps-house') {
                  setTouchedLocation(null);
                  setHovered(null);
                  handleCliqueHouseAccess(
                    'PREP',
                    WINDOW_IDS.PREPS_HOUSE_MAIN,
                    (
                      <DraggableResizeableWindow
                        windowsId={WINDOW_IDS.PREPS_HOUSE_MAIN}
                        headerTitle="Prep's House"
                        onClose={() => closeWindow(WINDOW_IDS.PREPS_HOUSE_MAIN)}
                        initialWidth="70vw"
                        initialHeight="70vh"
                        resizable={true}
                      >
                        <PrepsHouseMain />
                      </DraggableResizeableWindow>
                    ),
                    "Prep's House"
                  );
                } else if (!isMobile) {
                  // Desktop behavior - immediate open
                  handleCliqueHouseAccess(
                    'PREP',
                    WINDOW_IDS.PREPS_HOUSE_MAIN,
                    (
                      <DraggableResizeableWindow
                        windowsId={WINDOW_IDS.PREPS_HOUSE_MAIN}
                        headerTitle="Prep's House"
                        onClose={() => closeWindow(WINDOW_IDS.PREPS_HOUSE_MAIN)}
                        initialWidth="70vw"
                        initialHeight="70vh"
                        resizable={true}
                      >
                        <PrepsHouseMain />
                      </DraggableResizeableWindow>
                    ),
                    "Prep's House"
                  );
                }
              }}
              onMouseEnter={() => {
                setHovered('preps-house');
              }}
              onMouseLeave={() => {
                setHovered(null);
              }}
              onTouchStart={() => user && handleTouchEnter('preps-house')}
              onTouchEnd={handleTouchLeave}
            >
            </DynamicHouseIcon>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Semester0Map;
