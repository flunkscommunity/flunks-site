import { useRef, useState } from "react";
// Update the import path below to match the actual location of your Button component.
// For example, if Button is in src/components/ui/button.tsx, use the following:
// import { Button } from "./ui/button";
import React from "react";
// Make sure you have a Button component at src/components/ui/button.tsx.
// If you don't, create one like this:

// src/components/ui/button.tsx

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
    children,
    ...props
}) => (
    <button
        style={{
            background: "#0ff",
            color: "#111",
            border: "none",
            borderRadius: "4px",
            padding: "0.5rem 1rem",
            fontFamily: "'Press Start 2P', monospace",
            cursor: "pointer",
            fontSize: "12px",
            boxShadow: "0 2px 8px rgba(0,255,255,0.2)",
            transition: "background 0.2s",
        }}
        {...props}
    >
        {children}
    </button>
);
export default function FlunksPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      style={{
        background: "linear-gradient(to right, #222, #111)",
        color: "#90f0ff",
        fontFamily: "'Press Start 2P', monospace",
        border: "2px solid #0ff",
        padding: "1rem",
        width: "300px",
        borderRadius: "8px",
        boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <h4 style={{ margin: 0, fontSize: "14px" }}>Now Playing</h4>
      <div style={{ fontSize: "12px", color: "#fff" }}>Flunks - Paradise.mp3</div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button onClick={togglePlay}>
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </Button>
        <Button
          onClick={() => {
            audioRef.current?.pause();
            audioRef.current!.currentTime = 0;
            setIsPlaying(false);
          }}
        >
          ⏹ Stop
        </Button>
      </div>

      <audio ref={audioRef} src="/audio/paradise.mp3" preload="auto" />
    </div>
  );
}
