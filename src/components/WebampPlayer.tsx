import React, { useEffect } from "react";

const WebampPlayer: React.FC = () => {
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
                title: "Paradise"
              },
              url: "/audio/paradise.mp3"
            }
          ]
        });

        if (Webamp.browserIsSupported()) {
          console.log("Rendering Webamp...");
          webampInstance.renderWhenReady();
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

  // ❌ No container needed — Webamp renders itself globally
  return null;
};

export default WebampPlayer;
