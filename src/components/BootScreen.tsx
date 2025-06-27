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
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

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
      const audio = new Audio("/sounds/win95-boot.mp3");
      audio.play().catch(() => {});
      setAudioPlayed(true);
      const t = setTimeout(() => {
        setFadeOut(true);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [showLogo, audioPlayed]);


  if (showLogo) {
    return (
      <div
        className={`${styles.logoWrapper} ${fadeOut ? styles.fadeOut : ''}`}
        onAnimationEnd={() => fadeOut && onComplete()}
      >
        <img
          src="/flunks-logo.png"
          alt="Flunks Logo"
          className={styles.logoGlow}
        />
        
  useEffect(() => {
    if (fadeOut) {
      const t = setTimeout(() => {
        onComplete();
      }, 1000); // match fade-out duration
      return () => clearTimeout(t);
    }
  }, [fadeOut, onComplete]);

  if (showLogo) {
    return (
      <div className={`${styles.logoWrapper} ${fadeOut ? styles.fadeOut : ''}`}>
        <img src="/flunks-logo.png" alt="Flunks Logo" className={styles.logoGlow} />

      </div>
    );
  }

  return (
    <div
      className={`${styles.bootWrapper} ${fadeOut ? styles.fadeOut : ''}`}
      onAnimationEnd={() => fadeOut && onComplete()}
    >
      
    <div className={`${styles.bootWrapper} ${fadeOut ? styles.fadeOut : ''}`}>

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
