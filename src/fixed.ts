import RadioPlayer from "components/RadioPlayer";

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
  ONLYFLUNKS_ITEM: "onlyflunks-item-",
  FLUNK_E_MART: "flunk-e-mart",
  FLUNKS_HUB: "onlyflunks",
  MYPLACE: "myplace",
  FREAK: "freak",
  SEMESTER_0: "semester0Map",
  RADIO_PLAYER: "radio_player_window",
  TREEHOUSE_MAIN: "treehouse_main",
  TREEHOUSE_LOFT: "treehouse_loft",
  TREEHOUSE_DESK: "treehouse_desk",
  TREEHOUSE_TRUNK: "treehouse_trunk",
  TREEHOUSE_WINDOW: "treehouse_window",
  ARCADE_MAIN: "arcade_main",
  ARCADE_TOP_LEFT: "arcade_top_left",
  ARCADE_TOP_RIGHT: "arcade_top_right",
  ARCADE_BOTTOM_LEFT: "arcade_bottom_left",
  ARCADE_BOTTOM_RIGHT: "arcade_bottom_right",
  MOTEL_MAIN: "motel_main",
  MOTEL_TOP_LEFT: "motel_top_left",
  MOTEL_TOP_RIGHT: "motel_top_right",
  MOTEL_BOTTOM_LEFT: "motel_bottom_left",
  MOTEL_BOTTOM_RIGHT: "motel_bottom_right",
  DINER_MAIN: "diner_main",
  DINER_TOP_LEFT: "diner_top_left",
  DINER_TOP_RIGHT: "diner_top_right",
  DINER_BOTTOM_LEFT: "diner_bottom_left",
  DINER_BOTTOM_RIGHT: "diner_bottom_right",
  FLAPPY_FLUNK: "flappy_flunk",
  FLAPPY_FLUNK_LEADERBOARD: "flappy_flunk_leaderboard",
};

export const WINDOW_APP_INFO_TO_WINDOW_ID = {
  [WINDOW_IDS.YOUR_STUDENTS]: {
    appName: "Onlyflunks",
    appIcon: "/images/icons/onlyflunks.png",
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
    appName: "onlyflunks",
    appIcon: "/images/icons/onlyflunks.png",
    key: WINDOW_IDS.FLUNKS_HUB,
  },
  [WINDOW_IDS.MYPLACE]: {
    appName: "MyPlace",
    appIcon: "/images/icons/myplace.png",
    key: WINDOW_IDS.MYPLACE,
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
  [WINDOW_IDS.ARCADE_MAIN]: {
    appName: "Arcade",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.ARCADE_MAIN,
  },
  [WINDOW_IDS.ARCADE_TOP_LEFT]: {
    appName: "Arcade TL",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.ARCADE_TOP_LEFT,
  },
  [WINDOW_IDS.ARCADE_TOP_RIGHT]: {
    appName: "Arcade TR",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.ARCADE_TOP_RIGHT,
  },
  [WINDOW_IDS.ARCADE_BOTTOM_LEFT]: {
    appName: "Arcade BL",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.ARCADE_BOTTOM_LEFT,
  },
  [WINDOW_IDS.ARCADE_BOTTOM_RIGHT]: {
    appName: "Arcade BR",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.ARCADE_BOTTOM_RIGHT,
  },
  [WINDOW_IDS.MOTEL_MAIN]: {
    appName: "Motel",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.MOTEL_MAIN,
  },
  [WINDOW_IDS.MOTEL_TOP_LEFT]: {
    appName: "Motel TL",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.MOTEL_TOP_LEFT,
  },
  [WINDOW_IDS.MOTEL_TOP_RIGHT]: {
    appName: "Motel TR",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.MOTEL_TOP_RIGHT,
  },
  [WINDOW_IDS.MOTEL_BOTTOM_LEFT]: {
    appName: "Motel BL",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.MOTEL_BOTTOM_LEFT,
  },
  [WINDOW_IDS.MOTEL_BOTTOM_RIGHT]: {
    appName: "Motel BR",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.MOTEL_BOTTOM_RIGHT,
  },
  [WINDOW_IDS.DINER_MAIN]: {
    appName: "Diner",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.DINER_MAIN,
  },
  [WINDOW_IDS.DINER_TOP_LEFT]: {
    appName: "Diner TL",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.DINER_TOP_LEFT,
  },
  [WINDOW_IDS.DINER_TOP_RIGHT]: {
    appName: "Diner TR",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.DINER_TOP_RIGHT,
  },
  [WINDOW_IDS.DINER_BOTTOM_LEFT]: {
    appName: "Diner BL",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.DINER_BOTTOM_LEFT,
  },
  [WINDOW_IDS.DINER_BOTTOM_RIGHT]: {
    appName: "Diner BR",
    appIcon: "/images/icons/tree.png",
    key: WINDOW_IDS.DINER_BOTTOM_RIGHT,
  },
  [WINDOW_IDS.FLAPPY_FLUNK]: {
    appName: "Flappy Flunk",
    appIcon: "/images/icons/flappyflunk.png",
    key: WINDOW_IDS.FLAPPY_FLUNK,
  },
  [WINDOW_IDS.FLAPPY_FLUNK_LEADERBOARD]: {
    appName: "Flappy Leaderboard",
    appIcon: "/images/icons/flappyflunk.png",
    key: WINDOW_IDS.FLAPPY_FLUNK_LEADERBOARD,
  },
};
