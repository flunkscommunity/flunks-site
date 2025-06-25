import React, { useEffect, useState } from "react";
import styles from "./BootScreen.module.css";

type BootScreenProps = {
  onComplete: () => void;
};

const bootMessages = [
  "Initializing Flunk OS v0.95…",
  "Mounting Disk: flunkfolio.DAT…",
  "Spinning Up Gumball Machine…",
  "Connecting to Market Node…",
  "Loading Discord Gateway…",
  "Boot Sequence Complete.",
];

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    if (index < bootMessages.length) {
      const t = setTimeout(() => setIndex((i) => i + 1), 900);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShowLogo(true), 1000);
      return () => clearTimeout(t);
    }
  }, [index]);

  useEffect(() => {
    if (showLogo && !audioPlayed) {
      const audio = new Audio("/sounds/win95-boot.wav");
      audio.play().catch(() => {});
      setAudioPlayed(true);
      const t = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [showLogo, audioPlayed, onComplete]);

  if (showLogo) {
    return (
      <div className={styles.logoWrapper}>
        <img src="/flunks-logo.png" alt="Flunks Logo" className={styles.logoGlow} />
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
