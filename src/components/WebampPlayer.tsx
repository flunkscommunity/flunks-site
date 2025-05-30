import React, { useEffect, useRef } from "react";

const WebampPlayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let webampInstance: any = null;

    const loadWebamp = async () => {
      try {
        const { default: Webamp } = await import("webamp");

        webampInstance = new Webamp({
          initialTracks: [
            {
              metaData: {
            artist: "flunks",
            title: "paradise"
              },
              url: "/public/audio/paradise.mp3"
            }
          ],
        });

        if (Webamp.browserIsSupported() && containerRef.current) {
          webampInstance.renderWhenReady(containerRef.current);
        } else {
          console.warn("Webamp not supported or container missing.");
        }
      } catch (err) {
        console.error("Failed to load Webamp:", err);
      }
    };

    loadWebamp();

    return () => {
      if (webampInstance) {
        webampInstance.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default WebampPlayer;
