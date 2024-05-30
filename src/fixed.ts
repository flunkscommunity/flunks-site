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
  PROJECT_JNR: "project-jnr",
  ABOUT_US: "about-us",
  FLUNKFOLIO_ITEM: "flunkfolio-item-",
};

export const WINDOW_APP_INFO_TO_WINDOW_ID = {
  [WINDOW_IDS.YOUR_STUDENTS]: {
    appName: "Flunkfolio",
    appIcon: "/images/icons/vault.png",
    key: WINDOW_IDS.YOUR_STUDENTS,
  },
  [WINDOW_IDS.GUMBALL_MACHINE]: {
    appName: "Gum Machine",
    appIcon: "/images/icons/gum-machine.png",
    key: WINDOW_IDS.GUMBALL_MACHINE,
  },
  [WINDOW_IDS.SETTINGS]: {
    appName: "Settings",
    appIcon: "/images/icons/settings.png",
    key: WINDOW_IDS.SETTINGS,
  },
  [WINDOW_IDS.PROJECT_JNR]: {
    appName: "Pocket Juniors",
    appIcon: "/images/icons/pocket-juniors-50x50.png",
    key: WINDOW_IDS.PROJECT_JNR,
  },
  [WINDOW_IDS.ABOUT_US]: {
    appName: "About Us",
    appIcon: "/images/icons/about-us.png",
    key: WINDOW_IDS.ABOUT_US,
  },
};
