import React, { useEffect, useState } from "react";
import styles from "./BootScreen.module.css";

type BootScreenProps = {
  onComplete: () => void;
};

const bootMessages = [
  "Initializing Flunk OS v2.0…",
  "Mounting Disk: onlyflunks.DAT…",
  "Rolling up some fat doobies…",
  "semester zero INCOMING…",
  "Boot Sequence Complete.",
];

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  // Display boot messages one at a time
  useEffect(() => {
    if (index < bootMessages.length) {
      const t = setTimeout(() => setIndex((i) => i + 1), 900);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShowLogo(true), 500); // short pause before logo
      return () => clearTimeout(t);
    }
  }, [index]);

  // Show logo and close after 7 seconds total
  useEffect(() => {
    if (showLogo) {
      const audio = new Audio("/sounds/win95-boot.mp3");
      audio.play().catch(() => {});

      const t = setTimeout(() => {
        onComplete(); // End boot screen
      }, 3000); // logo shows for ~3 seconds
      return () => clearTimeout(t);
    }
  }, [showLogo, onComplete]);

  if (showLogo) {
    return (
      <div className={styles.logoWrapper}>
        <img
          src="/flunks-logo.png"
          alt="Flunks Logo"
          className={styles.logoPulse}
        />
      </div>
    );
  }

  return (
    <div className={styles.bootWrapper}>
      <div className={styles.bootWindow}>
        <div className={styles.bootLog}>
          {bootMessages.slice(0, index).map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BootScreen;
