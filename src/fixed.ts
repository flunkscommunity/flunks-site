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
  LOADING_PREVIEW: "loading_preview",
  FREAK: "freak",
  SEMESTER_0: "semester0Map",
  RADIO_PLAYER: "radio_player_window",
  TREEHOUSE_MAIN: "treehouse_main",
  TREEHOUSE_LOFT: "treehouse_loft",
  TREEHOUSE_DESK: "treehouse_desk",
  TREEHOUSE_TRUNK: "treehouse_trunk",
  TREEHOUSE_WINDOW: "treehouse_window",
  ARCADE_MAIN: "arcade_main",
  ARCADE_LOBBY: "arcade_lobby",
  ARCADE_TOP_LEFT: "arcade_top_left",
  ARCADE_TOP_RIGHT: "arcade_top_right",
  ARCADE_BOTTOM_LEFT: "arcade_bottom_left",
  ARCADE_BOTTOM_RIGHT: "arcade_bottom_right",
  MOTEL_MAIN: "motel_main",
  MOTEL_TOP_LEFT: "motel_top_left",
  MOTEL_TOP_RIGHT: "motel_top_right",
  MOTEL_BOTTOM_LEFT: "motel_bottom_left",
  MOTEL_BOTTOM_RIGHT: "motel_bottom_right",
  FLAPPY_FLUNK: "flappy_flunk",
  FLAPPY_FLUNK_LEADERBOARD: "flappy_flunk_leaderboard",
  FLUNKY_UPPY: "flunky_uppy",
  FLUNKY_UPPY_LEADERBOARD: "flunky_uppy_leaderboard",
  HIDDEN_RIFF: "hidden_riff",
  FHS_SCHOOL: "fhs_school",
  FLUNKS_MESSENGER: "flunks_messenger",
  FLUNK_CREATOR: "flunk_creator",
  USER_PROFILE: "user_profile",
  TERMINAL: "terminal",
  CLIQUE_ACCESS: "clique_access",
  GAME_MANUAL: "game-manual",
  MEME_MANAGER: "meme-manager",
  ZOLTAR_FORTUNE_APP: "zoltar-fortune-app",
  BROWSER: "browser",
  DEV_PREVIEW: "dev-preview",
  REPORT_CARD: "report-card",
  ICON_ANIMATION: "icon-animation",
  BULLETIN_BOARD: "bulletin-board",
  YEARBOOK: "yearbook",
  STORY_MANUAL: "story-manual",
  HOMECOMING_STORY: "homecoming-story",
  VCR_EFFECTS_TEST: "vcr-effects-test",
  
  // New location main windows
  JOCKS_HOUSE_MAIN: "jocks_house_main",
  FREAKS_HOUSE_MAIN: "freaks_house_main",
  FLUNK_FM_MAIN: "flunk_fm_main",
  GEEKS_HOUSE_MAIN: "geeks_house_main",
  JUNKYARD_MAIN: "junkyard_main",
  LAKE_TREE_MAIN: "lake_tree_main",
  SNACK_SHACK_MAIN: "snack_shack_main",
  RUG_DOCTOR_MAIN: "rug_doctor_main",
  SNACK_SHACK_COUNTER: "snack_shack_counter",
  SNACK_SHACK_GRILL_LINE: "snack_shack_grill_line",
  SNACK_SHACK_STOCK_ROOM: "snack_shack_stock_room",
  SNACK_SHACK_PICNIC_AREA: "snack_shack_picnic_area",
  
  // Rug Doctor rooms
  RUG_DOCTOR_FRONT_COUNTER: "rug_doctor_front_counter",
  RUG_DOCTOR_CLEANING_BAY: "rug_doctor_cleaning_bay", 
  RUG_DOCTOR_STORAGE_ROOM: "rug_doctor_storage_room",
  RUG_DOCTOR_BACK_OFFICE: "rug_doctor_back_office",
  FOUR_THIEVES_BAR_MAIN: "four_thieves_bar_main",
  FOUR_THIEVES_BAR_INTERIOR: "four_thieves_bar_interior",
  FOUR_THIEVES_BAR_SLOT_MACHINE: "four_thieves_bar_slot_machine",
  FOUR_THIEVES_BAR_VIDEO_POKER: "four_thieves_bar_video_poker",
  FOUR_THIEVES_BAR_BLACKJACK: "four_thieves_bar_blackjack",
  FOUR_THIEVES_BAR_MAIN_BAR: "four_thieves_bar_main_bar",
  FOUR_THIEVES_BAR_POOL_ROOM: "four_thieves_bar_pool_room",
  FOUR_THIEVES_BAR_PRIVATE_BOOTH: "four_thieves_bar_private_booth",
  FOUR_THIEVES_BAR_BACK_ALLEY: "four_thieves_bar_back_alley",
  FOUR_THIEVES_BAR_BACK_ROOM: "four_thieves_bar_back_room",
  FOUR_THIEVES_BAR_SCRATCH_CARDS: "four_thieves_bar_scratch_cards",
  FOUR_THIEVES_BAR_UNDERGROUND: "four_thieves_bar_underground",
  UNDERGROUND_PASSWORD: "underground_password",
  SHED_MAIN: "shed_main",
  SHED_WORKBENCH: "shed_workbench",
  SHED_TOOL_WALL: "shed_tool_wall",
  SHED_STORAGE: "shed_storage",
  SHED_SECRET_TRAPDOOR: "shed_secret_trapdoor",
  POLICE_STATION_MAIN: "police_station_main",
  POLICE_STATION_INTERROGATION_ROOM: "police_station_interrogation_room",
  PREPS_HOUSE_MAIN: "preps_house_main",
  FOOTBALL_FIELD_MAIN: "football_field_main",
  JUNKYARD_CAR_STACKS: "junkyard_car_stacks",
  JUNKYARD_CAR_CRUSHER: "junkyard_car_crusher",
  JUNKYARD_OFFICE: "junkyard_office",
  JUNKYARD_SECRET_BUNKER: "junkyard_secret_bunker",
  
  // New locations
  HIGH_SCHOOL_MAIN: "high_school_main",
  PARADISE_MOTEL_MAIN: "paradise_motel_main",
  WISHING_TREE_MAIN: "wishing_tree_main",
  FRENSHIP_MAIN: "frenship_main",
  
  
  // High School rooms
  HIGH_SCHOOL_HALLWAY: "high_school_hallway",
  HIGH_SCHOOL_CLASSROOM: "high_school_classroom",
  HIGH_SCHOOL_CAFETERIA: "high_school_cafeteria",
  HIGH_SCHOOL_GYMNASIUM: "high_school_gymnasium",
  HIGH_SCHOOL_LIBRARY: "high_school_library",
  HIGH_SCHOOL_LOCKER_ROOM: "high_school_locker_room",
  HIGH_SCHOOL_OFFICE: "high_school_office",
  HIGH_SCHOOL_OFFICE_LOCK: "high_school_office_lock",
  HIGH_SCHOOL_OFFICE_SUCCESS: "high_school_office_success",
  
  // Paradise Motel rooms
  PARADISE_MOTEL_LOBBY: "paradise_motel_lobby",
  PARADISE_MOTEL_ROOM_1: "paradise_motel_room_1",
  PARADISE_MOTEL_ROOM_2: "paradise_motel_room_2",
  PARADISE_MOTEL_ROOM_6: "paradise_motel_room_6",
  PARADISE_MOTEL_ROOM_7: "paradise_motel_room_7",
  PARADISE_MOTEL_POOL: "paradise_motel_pool",
  
  // Wishing Tree rooms
  WISHING_TREE_BASE: "wishing_tree_base",
  WISHING_TREE_WALL: "wishing_tree_wall",
  WISHING_TREE_HOLLOW: "wishing_tree_hollow",
  WISHING_TREE_GARDEN: "wishing_tree_garden",
  
  // Frenship rooms
  FRENSHIP_HALL: "frenship_hall",
  FRENSHIP_COURTYARD: "frenship_courtyard",
  FRENSHIP_LOCKERS: "frenship_lockers",
  FRENSHIP_MEMORY: "frenship_memory",
  
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
  FREAKS_HOUSE_CELLAR_DOOR: "freaks_house_cellar_door",
  FREAKS_TV: "freaks_tv",
  FREAKS_HOUSE_CELLAR_DOOR_LOCK: "freaks_house_cellar_door_lock",
  
  // Geek's House rooms
  GEEKS_HOUSE_LAB: "geeks_house_lab",
  GEEKS_HOUSE_COMPUTER_ROOM: "geeks_house_computer_room",
  GEEKS_HOUSE_LIBRARY: "geeks_house_library",
  GEEKS_HOUSE_WORKSHOP: "geeks_house_workshop",
  GEEKS_HOUSE_SHED: "geeks_house_shed",
  GEEKS_HOUSE_SHED_LOCK: "geeks_house_shed_lock",
  
  // Prep's House rooms
  PREPS_HOUSE_SALON: "preps_house_salon",
  PREPS_HOUSE_WALK_IN_CLOSET: "preps_house_walk_in_closet",
  PREPS_HOUSE_STUDY: "preps_house_study",
  PREPS_HOUSE_POOL_AREA: "preps_house_pool_area",
  
  // Other location sub-areas
  FLUNK_FM_STUDIO: "flunk_fm_studio",
  FLUNK_FM_BOOTH: "flunk_fm_booth",
  FLUNK_FM_OFFICE: "flunk_fm_office",
  FLUNK_FM_TRANSMITTER: "flunk_fm_transmitter",
  
  POLICE_STATION_FRONT_DESK: "police_station_front_desk",
  POLICE_STATION_CELLS: "police_station_cells",
  POLICE_STATION_EVIDENCE_ROOM: "police_station_evidence_room",
  
  FOOTBALL_FIELD_STANDS: "football_field_stands",
  FOOTBALL_FIELD_LOCKER_ROOM: "football_field_locker_room",
  FOOTBALL_FIELD_EQUIPMENT_SHED: "football_field_equipment_shed",
  
  // DeLorean Tracker
  BUY_ME_A_DELOREAN: "buy_me_a_delorean",
  
  // Semester Zero Setup
  SEMESTER_ZERO_SETUP: "semester_zero_setup",
  
  // Magic Test
  MAGIC_TEST: "magic-test",
  
  // Level Up
  LEVEL_UP: "level-up",
  
  // Burn NFT (Admin Only)
  BURN_NFT: "burn-nft",
  
  // Alexandria Library
  ALEXANDRIA_LIBRARY: "alexandria-library",
  
  // Flunky Bash Game
  FLUNKY_BASH: "flunky-bash",

  // Paper Toss Game
  PAPER_TOSS: "paper-toss",

  // WalletConnect test (mobile app)
  TEST_FLOW_WALLET: "test-flow-wallet",
  FLOW_WALLET_APP: "flow-wallet-app",
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
    appIcon: "/images/icons/treehouse.png",
    key: WINDOW_IDS.TREEHOUSE_MAIN,
  },
  [WINDOW_IDS.TREEHOUSE_LOFT]: {
    appName: "Loft",
    appIcon: "/images/icons/treehouse.png",
    key: WINDOW_IDS.TREEHOUSE_LOFT,
  },
  [WINDOW_IDS.TREEHOUSE_DESK]: {
    appName: "Work Desk",
    appIcon: "/images/icons/treehouse.png",
    key: WINDOW_IDS.TREEHOUSE_DESK,
  },
  [WINDOW_IDS.TREEHOUSE_TRUNK]: {
    appName: "Old Trunk",
    appIcon: "/images/icons/treehouse.png",
    key: WINDOW_IDS.TREEHOUSE_TRUNK,
  },
  [WINDOW_IDS.TREEHOUSE_WINDOW]: {
    appName: "Window View",
    appIcon: "/images/icons/treehouse.png",
    key: WINDOW_IDS.TREEHOUSE_WINDOW,
  },
  [WINDOW_IDS.ARCADE_MAIN]: {
    appName: "Arcade",
    appIcon: "/images/icons/arcade-icon.png",
    key: WINDOW_IDS.ARCADE_MAIN,
  },
  [WINDOW_IDS.ARCADE_TOP_LEFT]: {
    appName: "Arcade TL",
    appIcon: "/images/icons/arcade-icon.png",
    key: WINDOW_IDS.ARCADE_TOP_LEFT,
  },
  [WINDOW_IDS.ARCADE_TOP_RIGHT]: {
    appName: "Arcade TR",
    appIcon: "/images/icons/arcade-icon.png",
    key: WINDOW_IDS.ARCADE_TOP_RIGHT,
  },
  [WINDOW_IDS.ARCADE_BOTTOM_LEFT]: {
    appName: "Arcade BL",
    appIcon: "/images/icons/arcade-icon.png",
    key: WINDOW_IDS.ARCADE_BOTTOM_LEFT,
  },
  [WINDOW_IDS.ARCADE_BOTTOM_RIGHT]: {
    appName: "Arcade BR",
    appIcon: "/images/icons/arcade-icon.png",
    key: WINDOW_IDS.ARCADE_BOTTOM_RIGHT,
  },
  [WINDOW_IDS.MOTEL_MAIN]: {
    appName: "Motel",
    appIcon: "/images/icons/paradise-motel-icon.png",
    key: WINDOW_IDS.MOTEL_MAIN,
  },
  [WINDOW_IDS.MOTEL_TOP_LEFT]: {
    appName: "Motel TL",
    appIcon: "/images/icons/paradise-motel-icon.png",
    key: WINDOW_IDS.MOTEL_TOP_LEFT,
  },
  [WINDOW_IDS.MOTEL_TOP_RIGHT]: {
    appName: "Motel TR",
    appIcon: "/images/icons/paradise-motel-icon.png",
    key: WINDOW_IDS.MOTEL_TOP_RIGHT,
  },
  [WINDOW_IDS.MOTEL_BOTTOM_LEFT]: {
    appName: "Motel BL",
    appIcon: "/images/icons/paradise-motel-icon.png",
    key: WINDOW_IDS.MOTEL_BOTTOM_LEFT,
  },
  [WINDOW_IDS.MOTEL_BOTTOM_RIGHT]: {
    appName: "Motel BR",
    appIcon: "/images/icons/paradise-motel-icon.png",
    key: WINDOW_IDS.MOTEL_BOTTOM_RIGHT,
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
  [WINDOW_IDS.FLUNKY_UPPY]: {
    appName: "Flunky Uppy",
    appIcon: "/images/icons/flunky-uppy-icon.png?v=2",
    key: WINDOW_IDS.FLUNKY_UPPY,
  },
  [WINDOW_IDS.FLUNKY_UPPY_LEADERBOARD]: {
    appName: "Flunky Uppy Leaderboard",
    appIcon: "/images/icons/flunky-uppy-icon.png?v=2",
    key: WINDOW_IDS.FLUNKY_UPPY_LEADERBOARD,
  },
  [WINDOW_IDS.HIDDEN_RIFF]: {
    appName: "Hidden Riff",
    appIcon: "/images/icons/controller-bg.png",
    key: WINDOW_IDS.HIDDEN_RIFF,
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
  [WINDOW_IDS.TEST_FLOW_WALLET]: {
    appName: "Test Flow Wallet",
    appIcon: "/images/icons/flowty.png",
    key: WINDOW_IDS.TEST_FLOW_WALLET,
  },
  [WINDOW_IDS.FLOW_WALLET_APP]: {
    appName: "Flow Wallet",
    appIcon: "/images/icons/flowty.png",
    key: WINDOW_IDS.FLOW_WALLET_APP,
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
  [WINDOW_IDS.ZOLTAR_FORTUNE_APP]: {
    appName: "Mystical Zoltar",
    appIcon: "/images/icons/zoltar-icon.png",
    key: WINDOW_IDS.ZOLTAR_FORTUNE_APP,
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
    appIcon: "/images/icons/alexandria-library-icon.png",
    key: WINDOW_IDS.YEARBOOK,
  },
  [WINDOW_IDS.FOOTBALL_FIELD_MAIN]: {
    appName: "Football Field",
    appIcon: "/images/icons/football-field-icon.png",
    key: WINDOW_IDS.FOOTBALL_FIELD_MAIN,
  },
  [WINDOW_IDS.BUY_ME_A_DELOREAN]: {
    appName: "DeLorean Fund",
    appIcon: "/images/icons/delorean.png",
    key: WINDOW_IDS.BUY_ME_A_DELOREAN,
  },
};
