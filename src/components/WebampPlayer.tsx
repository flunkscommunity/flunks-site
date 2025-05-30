import React, { useEffect, useRef } from "react";

const WebampPlayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let webampInstance: any = null;

    const loadWebamp = async () => {
      try {
        const { default: Webamp } = await import("webamp");

        webampInstance = new Webamp({
          initialTracks: [
            {
              metaData: {
                artist: "Flunks",
                title: "Paradise",
              },
              url: "/audio/paradise.mp3",
            },
          ],
        });

        if (Webamp.browserIsSupported()) {
          console.log("Rendering Webamp...");
          webampInstance.renderWhenReady(containerRef.current!);
        } else {
          console.warn("Webamp not supported in this browser.");
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

  // ✅ Add a container div so it renders on the page
  return <div id="webamp-container" ref={containerRef} />;
};

export default WebampPlayer;
