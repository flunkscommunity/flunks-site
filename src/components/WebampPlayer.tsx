import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const WebampPlayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { default: Webamp } = await import("webamp");
      const Url = "/public/audio/paradise.mp3"; // Must exist in /public/audio/
      const skinUrl = "/skins/TopazAmp1-2.wsz"; // Must exist in /public/skins/

      const webamp = new Webamp({
        initialTracks: [
          {
            metaData: {
              artist: "flunks",
              title: "paradise",
            },
            url: "/audio/paradise.mp3",
          },
        ],
        availableSkins: [
          {
            url: skinUrl,
            name: "Topaz",
          },
        ],
      });

      if (Webamp.browserIsSupported() && containerRef.current) {
        webamp.renderWhenReady(containerRef.current);
      }
    };

    load();
  }, []);

  return <div ref={containerRef} id="webamp-container" />;
};

export default WebampPlayer;
