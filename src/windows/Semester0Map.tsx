import React, { useState } from 'react';
import styles from '../styles/map.module.css';
import { useWindowsContext } from "contexts/WindowsContext";
import TreehouseMain from "windows/Locations/TreehouseMain"; // you'll make this next
import ArcadeMain from "windows/Locations/ArcadeMain";
import MotelMain from "windows/Locations/MotelMain";
import DinerMain from "windows/Locations/DinerMain";
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { WINDOW_IDS } from "fixed";


interface Props {
  onClose: () => void;
}
const Semester0Map: React.FC<Props> = ({ onClose }) => {
  console.log("🛠 Semester0Map rendered. onClose is:", onClose);
  const [hovered, setHovered] = useState<string | null>(null);
const { openWindow, closeWindow } = useWindowsContext(); // ✅ ADD THIS

 
  return (
    <div className={styles["map-window"]}>
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
/>

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
    </div>
  );
};

export default Semester0Map;
