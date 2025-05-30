// /src/windows/RadioWindow.tsx
import WebampPlayer from "../components/WebampPlayer";

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
      <WebampPlayer />
    </div>
  );
}
