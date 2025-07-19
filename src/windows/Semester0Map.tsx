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

interface Props {
  onClose: () => void;
}

const Semester0Map: React.FC<Props> = ({ onClose }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [enhancedHover, setEnhancedHover] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const { openWindow, closeWindow } = useWindowsContext();
  const mapRef = useRef<HTMLDivElement>(null);

  // Location data for enhanced hover previews - ALL LOCATIONS
  const locationData = {
    'arcade': { title: "Arcade", description: "Old machines hum with half-lit screens. The sounds of vintage games echo through the dimly lit space.", icon: "🕹️", rooms: [{ name: "Main Floor", description: "Classic arcade cabinets line the walls" }, { name: "Prize Counter", description: "Dusty toys and forgotten treasures" }, { name: "Back Room", description: "Broken machines and spare parts" }, { name: "Office", description: "The manager's cluttered workspace" }] },
    'jocks-house': { title: "Jock's House", description: "Sports trophies and team spirit fill every room. The smell of victory and competition lingers in the air.", icon: "🏠", rooms: [{ name: "Trophy Room", description: "Championships and glory on display" }, { name: "Home Gym", description: "Weights and training equipment" }, { name: "Team Lounge", description: "Where champions gather and plan" }, { name: "Garage", description: "Sports gear and team vehicles" }] },
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
    setEnhancedHover(locationKey);
    setHovered(locationKey);
  };

  const handleEnhancedLeave = () => {
    setEnhancedHover(null);
    setHovered(null);
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

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const togglePause = () => setIsPaused(prev => !prev);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;


    const start = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      scrollLeft = map.scrollLeft;
      scrollTop = map.scrollTop;
      scrollLeft = map.scrollLeft;

      map.classList.add(styles['dragging']);
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
      map.scrollLeft = scrollLeft - (x - startX);
      map.scrollTop = scrollTop - (y - startY);
      map.scrollLeft = scrollLeft - (x - startX);
    };

    const stop = () => {
      isDown = false;
      map.classList.remove(styles['dragging']);
    };

    map.addEventListener('mousedown', start);
    map.addEventListener('mousemove', move);
    map.addEventListener('mouseup', stop);
    map.addEventListener('mouseleave', stop);
    map.addEventListener('touchstart', start);
    map.addEventListener('touchmove', move);
    map.addEventListener('touchend', stop);

    return () => {
      map.removeEventListener('mousedown', start);
      map.removeEventListener('mousemove', move);
      map.removeEventListener('mouseup', stop);
      map.removeEventListener('mouseleave', stop);
      map.removeEventListener('touchstart', start);
      map.removeEventListener('touchmove', move);
      map.removeEventListener('touchend', stop);
    };
  }, []);

  return (
    <div className={styles["map-window"]} ref={mapRef}>
      {loading && (
        <div className={styles["loader-overlay"]}>
          <SemesterZeroCSSLoader />
        </div>
      )}
      <div className={styles["map-inner"]}>
        <img
          src="/images/season-zero-map.png"
          className={styles["background-map"]}
          alt="Semester 0 Map"
        />

        {hovered && <div className={styles["map-overlay"]} />}

      <div
        className={`${styles.icon} ${styles.arcade}`}
        onMouseEnter={() => handleEnhancedHover('arcade')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.ARCADE_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.ARCADE_MAIN}
                headerTitle="Arcade"
                onClose={() => closeWindow(WINDOW_IDS.ARCADE_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <ArcadeMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      {/* New locations */}

      {/* New locations */}
      <div
        className={`${styles.icon} ${styles['jocks-house']}`}
        onMouseEnter={() => handleEnhancedHover('jocks-house')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.JOCKS_HOUSE_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.JOCKS_HOUSE_MAIN}
                headerTitle="Jock's House"
                onClose={() => closeWindow(WINDOW_IDS.JOCKS_HOUSE_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <JocksHouseMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.large} ${styles['freaks-house']}`}
        onMouseEnter={() => handleEnhancedHover('freaks-house')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.FREAKS_HOUSE_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.FREAKS_HOUSE_MAIN}
                headerTitle="Freak's House"
                onClose={() => closeWindow(WINDOW_IDS.FREAKS_HOUSE_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <FreaksHouseMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.large} ${styles['geeks-house']}`}
        onMouseEnter={() => handleEnhancedHover('geeks-house')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.GEEKS_HOUSE_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.GEEKS_HOUSE_MAIN}
                headerTitle="Geek's House"
                onClose={() => closeWindow(WINDOW_IDS.GEEKS_HOUSE_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <GeeksHouseMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles['preps-house']}`}
        onMouseEnter={() => handleEnhancedHover('preps-house')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.PREPS_HOUSE_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.PREPS_HOUSE_MAIN}
                headerTitle="Prep's House"
                onClose={() => closeWindow(WINDOW_IDS.PREPS_HOUSE_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <PrepsHouseMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles['flunk-fm']}`}
        onMouseEnter={() => handleEnhancedHover('flunk-fm')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.FLUNK_FM_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.FLUNK_FM_MAIN}
                headerTitle="Flunk FM"
                onClose={() => closeWindow(WINDOW_IDS.FLUNK_FM_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <FlunkFmMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.large} ${styles['police-station']}`}
        onMouseEnter={() => handleEnhancedHover('police-station')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.POLICE_STATION_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.POLICE_STATION_MAIN}
                headerTitle="Police Station"
                onClose={() => closeWindow(WINDOW_IDS.POLICE_STATION_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <PoliceStationMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.large} ${styles['football-field']}`}
        onMouseEnter={() => handleEnhancedHover('football-field')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.FOOTBALL_FIELD_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.FOOTBALL_FIELD_MAIN}
                headerTitle="Football Field"
                onClose={() => closeWindow(WINDOW_IDS.FOOTBALL_FIELD_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <FootballFieldMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.small} ${styles['snack-shack']}`}
        onMouseEnter={() => handleEnhancedHover('snack-shack')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.SNACK_SHACK_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.SNACK_SHACK_MAIN}
                headerTitle="Snack Shack"
                onClose={() => closeWindow(WINDOW_IDS.SNACK_SHACK_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <SnackShackMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.large} ${styles['four-thieves-bar']}`}
        onMouseEnter={() => handleEnhancedHover('four-thieves-bar')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.FOUR_THIEVES_BAR_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.FOUR_THIEVES_BAR_MAIN}
                headerTitle="4 Thieves Bar"
                onClose={() => closeWindow(WINDOW_IDS.FOUR_THIEVES_BAR_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <FourThievesBarMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.large} ${styles.junkyard}`}
        onMouseEnter={() => handleEnhancedHover('junkyard')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.JUNKYARD_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.JUNKYARD_MAIN}
                headerTitle="Junkyard"
                onClose={() => closeWindow(WINDOW_IDS.JUNKYARD_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <JunkyardMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.small} ${styles['lake-tree']}`}
        onMouseEnter={() => handleEnhancedHover('lake-tree')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.LAKE_TREE_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.LAKE_TREE_MAIN}
                headerTitle="Lake Tree"
                onClose={() => closeWindow(WINDOW_IDS.LAKE_TREE_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <LakeTreeMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.small} ${styles['rug-doctor']}`}
        onMouseEnter={() => handleEnhancedHover('rug-doctor')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.RUG_DOCTOR_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.RUG_DOCTOR_MAIN}
                headerTitle="Rug Doctor"
                onClose={() => closeWindow(WINDOW_IDS.RUG_DOCTOR_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <RugDoctorMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.small} ${styles.shed}`}
        onMouseEnter={() => handleEnhancedHover('shed')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.SHED_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.SHED_MAIN}
                headerTitle="Old Shed"
                onClose={() => closeWindow(WINDOW_IDS.SHED_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <ShedMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.large} ${styles.treehouse}`}
        onMouseEnter={() => handleEnhancedHover('secret-treehouse')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.SECRET_TREEHOUSE_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.SECRET_TREEHOUSE_MAIN}
                headerTitle="Secret Treehouse"
                onClose={() => closeWindow(WINDOW_IDS.SECRET_TREEHOUSE_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <SecretTreehouseMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.large} ${styles["high-school"]}`}
        onMouseEnter={() => handleEnhancedHover('high-school')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.HIGH_SCHOOL_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.HIGH_SCHOOL_MAIN}
                headerTitle="High School"
                onClose={() => closeWindow(WINDOW_IDS.HIGH_SCHOOL_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <HighSchoolMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.large} ${styles["paradise-motel"]}`}
        onMouseEnter={() => handleEnhancedHover('paradise-motel')}
        onMouseLeave={handleEnhancedLeave}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.PARADISE_MOTEL_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.PARADISE_MOTEL_MAIN}
                headerTitle="Paradise Motel"
                onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <ParadiseMotelMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      {hovered && (
        <div className={styles["info-box"]}>
          {hovered === 'arcade' && <>🕹️ Old machines hum with half-lit screens.</>}
          {hovered === 'jocks-house' && <>🏠 Sports trophies and team spirit fill every room.</>}
          {hovered === 'freaks-house' && <>🖤 Freak</>}
          {hovered === 'geeks-house' && <>🤓 A laboratory of knowledge and innovation.</>}
          {hovered === 'preps-house' && <>💅 Perfection and privilege behind manicured lawns.</>}
          {hovered === 'flunk-fm' && <>📻 The voice of the town broadcasts from here.</>}
          {hovered === 'police-station' && <>👮 Where authority meets the streets.</>}
          {hovered === 'football-field' && <>🏈 Friday night lights and hometown pride.</>}
          {hovered === 'snack-shack' && <>🍟 Quick bites for hungry students.</>}
          {hovered === 'four-thieves-bar' && <>🍺 The local watering hole where locals gather to forget their troubles.</>}
          {hovered === 'junkyard' && <>🚗 Treasures hide among the rust and ruin.</>}
          {hovered === 'lake-tree' && <>🌳 A peaceful spot where secrets are carved in bark.</>}
          {hovered === 'rug-doctor' && <>🧽 Making the old look new again.</>}
          {hovered === 'shed' && <>🏚️ Once you go in, you're never the same.</>}
          {hovered === 'secret-treehouse' && <>🌲 Hidden among the branches, mysteries await.</>}
          {hovered === 'high-school' && <>🏫 Abandoned halls echo with the past.</>}
          {hovered === 'paradise-motel' && <>🏨 A place where strange guests check in but never leave.</>}
        </div>
      )}

      <button className={styles["close-btn"]} onClick={onClose}>✖</button>
      </div>

      {/* Enhanced Hover Overlay */}
      {enhancedHover && locationData[enhancedHover as keyof typeof locationData] && (
        <div className={styles["enhanced-hover-overlay"]}>
          <div 
            className={styles["expanded-icon"]}
            style={{ 
              backgroundImage: `url(/images/icons/${enhancedHover}-icon.png)` 
            }}
          >
            {locationData[enhancedHover as keyof typeof locationData].icon}
          </div>
          
          <div className={styles["location-preview"]}>
            <h2>{locationData[enhancedHover as keyof typeof locationData].title}</h2>
            <div className={styles["location-preview-content"]}>
              <p>{locationData[enhancedHover as keyof typeof locationData].description}</p>
              <div className={styles["location-preview-rooms"]}>
                {locationData[enhancedHover as keyof typeof locationData].rooms.map((room, index) => (
                  <div key={index} className={styles["preview-room"]}>
                    <h4>{room.name}</h4>
                    <p>{room.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div
          onClick={togglePause}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '100vw',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
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
        position: 'fixed',
        top: 80,
        left: 30,
        zIndex: 10000,
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
  );
};

export default Semester0Map;
