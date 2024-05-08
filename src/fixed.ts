export { default as FLUNK_TRAITS } from "json/flunks-traits.json";
export const WINDOW_IDS = {
  STUDENT_EXPLORER: "student-explorer",
  FILTERS_WINDOW: "filters-window",
  YOUR_STUDENTS: "your-students",
  LOST_AND_FOUND: "lost-and-found",
  SETTINGS: "settings",
  ERROR: "error",
  GUMBALL_MACHINE: "gumball-machine",
  GUMBALL_MACHINE_HELP: "gumball-machine-help",
};

export const WINDOW_APP_INFO_TO_WINDOW_ID = {
  [WINDOW_IDS.STUDENT_EXPLORER]: {
    appName: "Student Explorer",
    appIcon: "/images/icons/student-directory.png",
    key: WINDOW_IDS.STUDENT_EXPLORER,
  },
  [WINDOW_IDS.YOUR_STUDENTS]: {
    appName: "Flunkfolio",
    appIcon: "/images/icons/vault.png",
    key: WINDOW_IDS.YOUR_STUDENTS,
  },
  [WINDOW_IDS.LOST_AND_FOUND]: {
    appName: "Lost and Found",
    appIcon: "/images/icons/lost-and-found.png",
    key: WINDOW_IDS.LOST_AND_FOUND,
  },
  [WINDOW_IDS.SETTINGS]: {
    appName: "Settings",
    appIcon: "/images/icons/settings.png",
    key: WINDOW_IDS.SETTINGS,
  },
  [WINDOW_IDS.GUMBALL_MACHINE]: {
    appName: "Gumball Machine",
    appIcon: "/images/icons/gum-machine.png",
    key: WINDOW_IDS.GUMBALL_MACHINE,
  },
};
