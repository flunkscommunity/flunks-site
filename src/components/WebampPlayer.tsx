import React, { useEffect, useRef } from "react";

const WebampPlayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let webampInstance: any = null;

    const loadWebamp = async () => {
      try {
        const { default: Webamp } = await import("webamp");

        const playlist = [
          {
            metaData: {
              artist: "Flunks",
              title: "Paradise"
            },
            url: "/audio/paradise.mp3" // ✅ relative to the public/ folder
          },
          {
            metaData: {
              artist: "Flunks",
              title: "Another Track"
            },
            url: "/audio/another-track.mp3"
          }
          // Add more here
        ];

        webampInstance = new Webamp({
          initialTracks: playlist
        });

        if (Webamp.browserIsSupported() && containerRef.current) {
          webampInstance.renderWhenReady(containerRef.current);
        } else {
          console.warn("Webamp not supported or container missing.");
        }
      } catch (err) {
        console.error("Webamp failed to load:", err);
      }
    };

    loadWebamp();

    return () => {
      webampInstance?.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default WebampPlayer;
