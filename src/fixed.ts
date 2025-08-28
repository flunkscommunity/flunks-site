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
  FHS_SCHOOL: "fhs_school",
  FLUNKS_MESSENGER: "flunks_messenger",
  FLUNK_CREATOR: "flunk_creator",
  USER_PROFILE: "user_profile",
  TERMINAL: "terminal",
  CLIQUE_ACCESS: "clique_access",
  GAME_MANUAL: "game-manual",
  MEME_MANAGER: "meme-manager",
  BROWSER: "browser",
  DEV_PREVIEW: "dev-preview",
  REPORT_CARD: "report-card",
  ICON_ANIMATION: "icon-animation",
  BULLETIN_BOARD: "bulletin-board",
  YEARBOOK: "yearbook",
  
  // New location main windows
  JOCKS_HOUSE_MAIN: "jocks_house_main",
  FREAKS_HOUSE_MAIN: "freaks_house_main",
  FLUNK_FM_MAIN: "flunk_fm_main",
  GEEKS_HOUSE_MAIN: "geeks_house_main",
  JUNKYARD_MAIN: "junkyard_main",
  LAKE_TREE_MAIN: "lake_tree_main",
  SNACK_SHACK_MAIN: "snack_shack_main",
  RUG_DOCTOR_MAIN: "rug_doctor_main",
  FOUR_THIEVES_BAR_MAIN: "four_thieves_bar_main",
  SHED_MAIN: "shed_main",
  POLICE_STATION_MAIN: "police_station_main",
  PREPS_HOUSE_MAIN: "preps_house_main",
  FOOTBALL_FIELD_MAIN: "football_field_main",
  
  // New locations
  SECRET_TREEHOUSE_MAIN: "secret_treehouse_main",
  HIGH_SCHOOL_MAIN: "high_school_main",
  PARADISE_MOTEL_MAIN: "paradise_motel_main",
  
  // Secret Treehouse rooms
  SECRET_TREEHOUSE_LOFT: "secret_treehouse_loft",
  SECRET_TREEHOUSE_DESK: "secret_treehouse_desk", 
  SECRET_TREEHOUSE_TRUNK: "secret_treehouse_trunk",
  SECRET_TREEHOUSE_WINDOW: "secret_treehouse_window",
  
  // High School rooms
  HIGH_SCHOOL_HALLWAY: "high_school_hallway",
  HIGH_SCHOOL_CLASSROOM: "high_school_classroom",
  HIGH_SCHOOL_CAFETERIA: "high_school_cafeteria",
  HIGH_SCHOOL_GYMNASIUM: "high_school_gymnasium",
  HIGH_SCHOOL_LIBRARY: "high_school_library",
  HIGH_SCHOOL_OFFICE: "high_school_office",
  HIGH_SCHOOL_OFFICE_LOCK: "high_school_office_lock",
  HIGH_SCHOOL_OFFICE_SUCCESS: "high_school_office_success",
  
  // Paradise Motel rooms
  PARADISE_MOTEL_LOBBY: "paradise_motel_lobby",
  PARADISE_MOTEL_ROOM_1: "paradise_motel_room_1",
  PARADISE_MOTEL_ROOM_2: "paradise_motel_room_2",
  PARADISE_MOTEL_POOL: "paradise_motel_pool",
  
  // Jock's House rooms
  JOCKS_HOUSE_LIVING_ROOM: "jocks_house_living_room",
  JOCKS_HOUSE_BEDROOM: "jocks_house_bedroom",
  JOCKS_HOUSE_GARAGE: "jocks_house_garage",
  JOCKS_HOUSE_KITCHEN: "jocks_house_kitchen",
  
  // Freak's House rooms
  FREAKS_HOUSE_BEDROOM: "freaks_house_bedroom",
  FREAKS_HOUSE_BASEMENT: "freaks_house_basement",
  FREAKS_HOUSE_ATTIC: "freaks_house_attic",
  FREAKS_HOUSE_KITCHEN: "freaks_house_kitchen",
  
  // Geek's House rooms
  GEEKS_HOUSE_LAB: "geeks_house_lab",
  GEEKS_HOUSE_COMPUTER_ROOM: "geeks_house_computer_room",
  GEEKS_HOUSE_LIBRARY: "geeks_house_library",
  GEEKS_HOUSE_WORKSHOP: "geeks_house_workshop",
  
  // Prep's House rooms
  PREPS_HOUSE_SALON: "preps_house_salon",
  PREPS_HOUSE_WALK_IN_CLOSET: "preps_house_walk_in_closet",
  PREPS_HOUSE_STUDY: "preps_house_study",
  PREPS_HOUSE_POOL_AREA: "preps_house_pool_area",
  
  // Other location sub-areas
  FLUNK_FM_STUDIO: "flunk_fm_studio",
  FLUNK_FM_BOOTH: "flunk_fm_booth",
  FLUNK_FM_OFFICE: "flunk_fm_office",
  
  POLICE_STATION_FRONT_DESK: "police_station_front_desk",
  POLICE_STATION_CELLS: "police_station_cells",
  POLICE_STATION_EVIDENCE_ROOM: "police_station_evidence_room",
  
  FOOTBALL_FIELD_STANDS: "football_field_stands",
  FOOTBALL_FIELD_LOCKER_ROOM: "football_field_locker_room",
  FOOTBALL_FIELD_EQUIPMENT_SHED: "football_field_equipment_shed",
};

export const WINDOW_APP_INFO_TO_WINDOW_ID = {
  [WINDOW_IDS.YOUR_STUDENTS]: {
    appName: "OnlyFlunks",
    appIcon: "/images/icons/onlyflunks.png",
    key: WINDOW_IDS.YOUR_STUDENTS,
  },
  [WINDOW_IDS.GUMBALL_MACHINE]: {
    appName: "Gum Center",
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
    appName: "OnlyFlunks",
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
    appIcon: "/images/icons/boom-box.png",
    key: WINDOW_IDS.RADIO_PLAYER,
    windowComponent: RadioPlayer,
  },
  [WINDOW_IDS.FHS_SCHOOL]: {
    appName: "FHS",
    appIcon: "/images/icons/fhs.png",
    key: WINDOW_IDS.FHS_SCHOOL,
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
  [WINDOW_IDS.FLUNKS_MESSENGER]: {
    appName: "Chat Rooms",
    appIcon: "/images/icons/chat-rooms.png",
    key: WINDOW_IDS.FLUNKS_MESSENGER,
  },
  [WINDOW_IDS.FLUNK_CREATOR]: {
    appName: "Flunk Creator",
    appIcon: "/images/icons/pocket-juniors.png",
    key: WINDOW_IDS.FLUNK_CREATOR,
  },
  [WINDOW_IDS.TERMINAL]: {
    appName: "Terminal",
    appIcon: "/images/icons/newterminal.png",
    key: WINDOW_IDS.TERMINAL,
  },
  [WINDOW_IDS.USER_PROFILE]: {
    appName: "My Locker",
    appIcon: "/images/icons/my-locker-icon.svg",
    key: WINDOW_IDS.USER_PROFILE,
  },
  [WINDOW_IDS.CLIQUE_ACCESS]: {
    appName: "Clique Access",
    appIcon: "/images/icons/high-school-icon.png",
    key: WINDOW_IDS.CLIQUE_ACCESS,
  },
  [WINDOW_IDS.GAME_MANUAL]: {
    appName: "Game Manual",
    appIcon: "/images/icons/game-manual-icon.png",
    key: WINDOW_IDS.GAME_MANUAL,
  },
  [WINDOW_IDS.MEME_MANAGER]: {
    appName: "Meme Manager",
    appIcon: "/images/icons/high-school-icon.png",
    key: WINDOW_IDS.MEME_MANAGER,
  },
  [WINDOW_IDS.REPORT_CARD]: {
    appName: "Report Card",
    appIcon: "/images/icons/report-card.png",
    key: WINDOW_IDS.REPORT_CARD,
  },
  [WINDOW_IDS.ICON_ANIMATION]: {
    appName: "Icon Animation",
    appIcon: "/images/icons/attack-64x64.png",
    key: WINDOW_IDS.ICON_ANIMATION,
  },
  [WINDOW_IDS.BULLETIN_BOARD]: {
    appName: "Bulletin Board",
    appIcon: "/images/icons/bulletin-board-icon.png",
    key: WINDOW_IDS.BULLETIN_BOARD,
  },
  [WINDOW_IDS.YEARBOOK]: {
    appName: "Flunks Yearbook",
    appIcon: "/images/icons/open-book.png",
    key: WINDOW_IDS.YEARBOOK,
  },
};
