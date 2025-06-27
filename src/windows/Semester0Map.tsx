import React, { useState, useEffect, useRef } from 'react';
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
    let scrollLeft = 0;

    const start = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      scrollLeft = map.scrollLeft;
      map.classList.add(styles['dragging']);
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
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
