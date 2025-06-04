import RadioPlayer from "components/RadioPlayer";
import BoomboxPlayer from "components/BoomboxPlayer";

export { default as FLUNK_TRAITS } from "json/flunks-traits.json";
export const WINDOW_IDS = {
  FILTERS_WINDOW: "filters-window",
  YOUR_STUDENTS: "your-students",
  SETTINGS: "settings",
  ERROR: "error",
  GUMBALL_MACHINE: "gumball-machine",
  WELCOME: "welcome",
  WELCOME_POPUP: "welcome-popup",
  GUMBALL_MACHINE_HELP: "gumball-machine-help",
  PROJECT_JNR: "project-jnr",
  ABOUT_US: "about-us",
  FLUNKFOLIO_ITEM: "flunkfolio-item-",
  FLUNK_E_MART: "flunk-e-mart",
  FLUNKS_HUB: "Flunks_Hub",
  HOMEBASE: "Homebase",
  FREAK: "freak",
  SEMESTER_0: "semester0Map",
  RADIO_PLAYER: "radio_player_window",
  TREEHOUSE_MAIN: "treehouse_main",
  TREEHOUSE_LOFT: "treehouse_loft",
  TREEHOUSE_DESK: "treehouse_desk",
  TREEHOUSE_TRUNK: "treehouse_trunk",
  TREEHOUSE_WINDOW: "treehouse_window",
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
  [WINDOW_IDS.FLUNKS_HUB]: {
    appName: "FlunksHub",
    appIcon: "/images/icons/flunkshub.png",
    key: WINDOW_IDS.FLUNKS_HUB,
  },
  [WINDOW_IDS.SEMESTER_0]: {
    appName: "semester zero",
    appIcon: "/images/icons/semester0-icon.png", // ✅ match filename you use elsewhere
    key: WINDOW_IDS.SEMESTER_0,
  },
  [WINDOW_IDS.RADIO_PLAYER]: {
    appName: "Radio",
    appIcon: "/images/icons/radio.png",
    key: WINDOW_IDS.RADIO_PLAYER,
    windowComponent: RadioPlayer,
    windowComponent: BoomboxPlayer,
  },
  [WINDOW_IDS.TREEHOUSE_MAIN]: {
    appName: "Treehouse",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.TREEHOUSE_MAIN,
  },
  [WINDOW_IDS.TREEHOUSE_LOFT]: {
    appName: "Loft",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.TREEHOUSE_LOFT,
  },
  [WINDOW_IDS.TREEHOUSE_DESK]: {
    appName: "Work Desk",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.TREEHOUSE_DESK,
  },
  [WINDOW_IDS.TREEHOUSE_TRUNK]: {
    appName: "Old Trunk",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.TREEHOUSE_TRUNK,
  },
  [WINDOW_IDS.TREEHOUSE_WINDOW]: {
    appName: "Window View",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.TREEHOUSE_WINDOW,
  },
};
