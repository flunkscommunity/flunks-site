import React, { useState } from 'react';
import styles from '../styles/map.module.css';
import { useWindowsContext } from "contexts/WindowsContext";
import TreehouseMain from "windows/Locations/TreehouseMain"; // you'll make this next
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
        className={`${styles.icon} ${styles.school}`}
        onMouseEnter={() => setHovered('school')}
        onMouseLeave={() => setHovered(null)}
      />

      {hovered && (
        <div className={styles["info-box"]}>
          {hovered === 'treehouse' && <>🪵 The secret treehouse where the real stories unfold.</>}
          {hovered === 'school' && <>🏫 The high school – where it all begins (and ends).</>}
        </div>
      )}

      <button className={styles["close-btn"]} onClick={onClose}>✖</button>
    </div>
  );
};

export default Semester0Map;
