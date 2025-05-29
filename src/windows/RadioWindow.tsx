// /src/windows/RadioWindow.tsx
import FlunksPlayer from "../components/FlunksPlayer";

export default function RadioWindow() {
  return (
    <div
      style={{
        width: 360,
        height: 240,
        backgroundColor: "#111",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <FlunksPlayer />
    </div>
  );
}
