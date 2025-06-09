import React, { useState, useEffect } from 'react';
import styles from '../styles/map.module.css';
import { useWindowsContext } from "contexts/WindowsContext";
import TreehouseMain from "windows/Locations/TreehouseMain";
import ArcadeMain from "windows/Locations/ArcadeMain";
import MotelMain from "windows/Locations/MotelMain";
import DinerMain from "windows/Locations/DinerMain";
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

  return (
    <div className={styles["map-window"]}>
      {loading && (
        <div className={styles["loader-overlay"]}>
          <SemesterZeroCSSLoader />
        </div>
      )}
      <img
        src="/images/flunks-map.png"
        className={styles["background-map"]}
        alt="Semester 0 Map"
      />

      {hovered && <div className={styles["map-overlay"]} />}

      <div
        className={`${styles.icon} ${styles.treehouse}`}
        onMouseEnter={() => setHovered('treehouse')}
        onMouseLeave={() => setHovered(null)}
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.TREEHOUSE_MAIN,
            window: (
              <DraggableResizeableWindow
                windowsId={WINDOW_IDS.TREEHOUSE_MAIN}
                headerTitle="Treehouse"
                onClose={() => closeWindow(WINDOW_IDS.TREEHOUSE_MAIN)}
                initialWidth="100%"
                initialHeight="100%"
                resizable={false}
              >
                <TreehouseMain />
              </DraggableResizeableWindow>
            ),
          })
        }
      >
        🪵
      </div>

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
        🕹️
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
        🏨
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
        🍔
      </div>

      <div
        className={`${styles.icon} ${styles.school}`}
        onMouseEnter={() => setHovered('school')}
        onMouseLeave={() => setHovered(null)}
      />

      {hovered && (
        <div className={styles["info-box"]}>
          {hovered === 'treehouse' && <>🪵 The secret treehouse where the real stories unfold.</>}
          {hovered === 'school' && <>🏫 The high school – where it all begins (and ends).</>}
          {hovered === 'arcade' && <>🕹️ Old machines hum with half-lit screens.</>}
          {hovered === 'motel' && <>🏨 A low neon glow leaks from behind the curtains.</>}
          {hovered === 'diner' && <>🍔 The smell of fries cuts through the night air.</>}
        </div>
      )}

      <button className={styles["close-btn"]} onClick={onClose}>✖</button>

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
