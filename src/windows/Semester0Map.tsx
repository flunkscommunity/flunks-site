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
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { WINDOW_IDS } from "fixed";
import { Button } from 'react95';
import SemesterZeroCSSLoader from "components/SemesterZeroCSSLoader";

interface Props {
  onClose: () => void;
}

const Semester0Map: React.FC<Props> = ({ onClose }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const { openWindow, closeWindow } = useWindowsContext();
  const mapRef = useRef<HTMLDivElement>(null);

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
        onMouseEnter={() => setHovered('arcade')}
        onMouseLeave={() => setHovered(null)}
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

      <div
        className={`${styles.icon} ${styles.motel}`}
        onMouseEnter={() => setHovered('motel')}
        onMouseLeave={() => setHovered(null)}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.MOTEL_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.MOTEL_MAIN}
                headerTitle="Motel"
                onClose={() => closeWindow(WINDOW_IDS.MOTEL_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <MotelMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.diner}`}
        onMouseEnter={() => setHovered('diner')}
        onMouseLeave={() => setHovered(null)}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.DINER_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.DINER_MAIN}
                headerTitle="Diner"
                onClose={() => closeWindow(WINDOW_IDS.DINER_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <DinerMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
      </div>

      <div
        className={`${styles.icon} ${styles.school}`}
        onMouseEnter={() => setHovered('school')}
        onMouseLeave={() => setHovered(null)}
      />

      {/* New locations */}
      <div
        className={`${styles.icon} ${styles['jocks-house']}`}
        onMouseEnter={() => setHovered('jocks-house')}
        onMouseLeave={() => setHovered(null)}
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
        className={`${styles.icon} ${styles['freaks-house']}`}
        onMouseEnter={() => setHovered('freaks-house')}
        onMouseLeave={() => setHovered(null)}
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
        className={`${styles.icon} ${styles['geeks-house']}`}
        onMouseEnter={() => setHovered('geeks-house')}
        onMouseLeave={() => setHovered(null)}
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
        onMouseEnter={() => setHovered('preps-house')}
        onMouseLeave={() => setHovered(null)}
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
        onMouseEnter={() => setHovered('flunk-fm')}
        onMouseLeave={() => setHovered(null)}
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
        onMouseEnter={() => setHovered('police-station')}
        onMouseLeave={() => setHovered(null)}
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
        onMouseEnter={() => setHovered('football-field')}
        onMouseLeave={() => setHovered(null)}
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
        onMouseEnter={() => setHovered('snack-shack')}
        onMouseLeave={() => setHovered(null)}
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
        className={`${styles.icon} ${styles['four-thieves-bar']}`}
        onMouseEnter={() => setHovered('four-thieves-bar')}
        onMouseLeave={() => setHovered(null)}
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
        className={`${styles.icon} ${styles.junkyard}`}
        onMouseEnter={() => setHovered('junkyard')}
        onMouseLeave={() => setHovered(null)}
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
        onMouseEnter={() => setHovered('lake-tree')}
        onMouseLeave={() => setHovered(null)}
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
        onMouseEnter={() => setHovered('rug-doctor')}
        onMouseLeave={() => setHovered(null)}
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
        onMouseEnter={() => setHovered('shed')}
        onMouseLeave={() => setHovered(null)}
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

      {hovered && (
        <div className={styles["info-box"]}>
          {hovered === 'treehouse' && <>🪵 The secret treehouse where the real stories unfold.</>}
          {hovered === 'school' && <>🏫 The high school – where it all begins (and ends).</>}
          {hovered === 'arcade' && <>🕹️ Old machines hum with half-lit screens.</>}
          {hovered === 'motel' && <>🏨 A low neon glow leaks from behind the curtains.</>}
          {hovered === 'diner' && <>🍔 The smell of fries cuts through the night air.</>}
          {hovered === 'jocks-house' && <>🏠 Sports trophies and team spirit fill every room.</>}
          {hovered === 'freaks-house' && <>🖤 Dark corners where outcasts find their voice.</>}
          {hovered === 'geeks-house' && <>🤓 A laboratory of knowledge and innovation.</>}
          {hovered === 'preps-house' && <>💅 Perfection and privilege behind manicured lawns.</>}
          {hovered === 'flunk-fm' && <>📻 The voice of the town broadcasts from here.</>}
          {hovered === 'police-station' && <>👮 Where authority meets the streets.</>}
          {hovered === 'football-field' && <>🏈 Friday night lights and hometown pride.</>}
          {hovered === 'snack-shack' && <>🍟 Quick bites for hungry students.</>}
          {hovered === 'four-thieves-bar' && <>🍺 Where locals gather to forget their troubles.</>}
          {hovered === 'junkyard' && <>🚗 Treasures hide among the rust and ruin.</>}
          {hovered === 'lake-tree' && <>🌳 A peaceful spot where secrets are carved in bark.</>}
          {hovered === 'rug-doctor' && <>🧽 Making the old look new again.</>}
          {hovered === 'shed' && <>🏚️ Forgotten tools and dusty memories.</>}
        </div>
      )}

      <button className={styles["close-btn"]} onClick={onClose}>✖</button>
      </div>

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

      {/* Pause Button for Mobile */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
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
