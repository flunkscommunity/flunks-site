import { useWindowsContext } from "contexts/WindowsContext";
import { Button } from "react95";

const AppWindows = () => {
  const {
    windowApps,
    bringWindowToFront,
    restoreWindow,
    activeWindow,
  } = useWindowsContext();

  return (
    <div className="gap-2 h-full ml-2 hidden lg:flex">
      {windowApps.map((app) => {
        const isActive = activeWindow === app.key;
        const isMinimized = app.isMinimized;

        return (
          <Button
            key={app.key}
            onClick={() =>
              isMinimized ? restoreWindow(app.key) : bringWindowToFront(app.key)
            }
            active={isActive && !isMinimized}
            className="!flex gap-2 max-w-[100px] flex-shrink"
          >
            {app.appIcon && (
              <img src={app.appIcon} className="h-6 w-6 flex-shrink-0" />
            )}
            <span className="flex-shrink max-w-full truncate hidden lg:block">
              {app.appName}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default AppWindows;
