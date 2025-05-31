import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const WebampPlayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { default: Webamp } = await import("webamp");
      const llamaUrl = "/audio/llama.mp3"; // Must exist in /public/audio/
      const skinUrl = "/skins/TopazAmp1-2.wsz"; // Must exist in /public/skins/

      const webamp = new Webamp({
        initialTracks: [
          {
            metaData: {
              artist: "DJ Mike Llama",
              title: "Llama Whippin' Intro",
            },
            url: llamaUrl,
            duration: 5.322286,
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
