import React from "react";
import { Frame, Window, WindowHeader, WindowContent } from "react95";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";

const characterSlots = [
  { clique: "geek", imageId: "myplacegeek", label: "Geek" },
  { clique: "prep", imageId: "myplaceprep", label: "Prep" },
  { clique: "jock", imageId: "myplacejock", label: "Jock" },
  { clique: "freak", imageId: "myplacefreak", label: "Freak" },
];

const SelectYourFlunk: React.FC = () => {
  const { user, isAuthenticated } = useDynamicContext();
  const userHasTrait = (clique: string) => {
    return user?.flunks?.some((nft: any) => nft.traits?.clique === clique);
  };

  return (
    <div
      style={{
        backgroundImage: `url('/images/icons/bgmyplace.png')`,
        backgroundSize: "cover",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "3rem",
      }}
    >
      <Window style={{ width: 300, marginBottom: "2rem" }}>
        <WindowHeader>FlunkOS.EXE</WindowHeader>
        <WindowContent>
          Wallet:{" "}
          {isAuthenticated ? (
            <span>{user?.walletAddress}</span>
          ) : (
            <span>Not connected</span>
          )}
        </WindowContent>
      </Window>

      <h1
        style={{
          fontFamily: "Press Start 2P, w95fa",
          color: "#fff",
          marginBottom: "2rem",
        }}
      >
        SELECT YOUR FLUNK
      </h1>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          width: "100%",
          overflowX: "auto",
        }}
      >
        {characterSlots.map(({ clique, imageId, label }) => {
          const locked = !userHasTrait(clique);
          return (
            <Frame
              key={clique}
              variant="well"
              style={{
                width: "150px",
                height: "500px",
                position: "relative",
                filter: locked ? "grayscale(100%)" : "none",
                opacity: locked ? 0.5 : 1,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              <Image
                src={`/${imageId}.png`}
                alt={label}
                layout="fill"
                objectFit="contain"
                style={{ pointerEvents: "none" }}
              />
            </Frame>
          );
        })}
      </div>
    </div>
  );
};

export default SelectYourFlunk;
