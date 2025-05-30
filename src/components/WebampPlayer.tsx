import React, { useEffect, useRef } from "react";

const WebampPlayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Dynamically import Webamp only on the client
    import("webamp").then(({ default: Webamp }) => {
      const webamp = new Webamp({
        initialTracks: [
          {
            metaData: {
              artist: "Nirvana",
              title: "Smells Like Teen Spirit"
            },
            url: "https://upload.wikimedia.org/wikipedia/en/4/45/Smells_Like_Teen_Spirit_sample.ogg"
          },
          {
            metaData: {
              artist: "Daft Punk",
              title: "Harder Better Faster Stronger"
            },
            url: "https://archive.org/download/DaftPunkHarderBetterFasterStronger_201811/Daft%20Punk%20-%20Harder%20Better%20Faster%20Stronger.mp3"
          }
        ]
      });

      if (Webamp.browserIsSupported() && containerRef.current) {
        webamp.renderWhenReady(containerRef.current);
      }
    });

    return () => {
      // No disposal necessary on
    };
  }, []);

  return <div ref={containerRef} />;
};

export default WebampPlayer;
