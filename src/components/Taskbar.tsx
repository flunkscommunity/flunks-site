// components/Taskbar.tsx
import { useWindowsContext } from "contexts/WindowsContext";
import { Button } from "react95";

const Taskbar = () => {
  const { windowApps, restoreWindow } = useWindowsContext();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: 40,
        backgroundColor: "#C0C0C0",
        display: "flex",
        alignItems: "center",
        padding: "4px 8px",
        gap: 6,
        zIndex: 9999,
        borderTop: "2px solid white",
      }}
    >
      {windowApps.map((app) =>
        app.isMinimized ? (
          <Button
            key={app.key}
            onClick={() => restoreWindow(app.key)}
            style={{ height: 30, padding: "0 10px" }}
          >
            {app.appIcon && (
              <img
                src={app.appIcon}
                alt=""
                style={{ width: 14, height: 14, marginRight: 6 }}
              />
            )}
            {app.appName}
          </Button>
        ) : null
      )}
    </div>
  );
};

export default Taskbar;
