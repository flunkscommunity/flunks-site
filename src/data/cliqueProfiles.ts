// 90s MySpace-style clique profiles with authentic period content

export interface Friend {
  name: string;
  status: string;
  avatar?: string;
}

export interface CliqueProfile {
  clique: string;
  name: string;
  mood: string;
  location: string;
  age: string;
  lastLogin: string;
  profileViews: number;
  aboutMe: string;
  interests: string[];
  music: string[];
  movies: string[];
  books: string[];
  heroes: string[];
  topFriends: Friend[];
  likes: string[];
  dislikes: string[];
  favoriteQuote: string;
  backgroundColor: string;
  backgroundPattern: string;
  profileSong?: string;
  customCSS?: string;
}

export const CLIQUE_PROFILES: Record<string, CliqueProfile> = {
  geek: {
    clique: "geek",
    name: "TechWiz97",
    mood: "Calculating the probability of success",
    location: "The Computer Lab",
    age: "17",
    lastLogin: "Online now",
    profileViews: 1337,
    aboutMe: "Level 42 Wizard seeking fellow adventurers for epic quests through cyberspace and beyond. Currently mastering C++ while conquering Final Fantasy VII. My Tamagotchi is still alive after 6 months! 🤓",
    interests: [
      "Programming", "D&D", "Star Trek TNG", "Linux", "Building PCs", 
      "Internet Relay Chat", "BBS Systems", "Math Olympiad", "Chess", 
      "Science Fiction", "Anime", "Comic Books", "Electronics"
    ],
    music: [
      "Weird Al Yankovic", "They Might Be Giants", "Devo", "Video game soundtracks",
      "Classical music", "Jonathan Coulton", "Kraftwerk", "Chiptune"
    ],
    movies: [
      "The Matrix", "Hackers", "War Games", "Blade Runner", "2001: A Space Odyssey",
      "Star Wars", "Star Trek movies", "Akira", "Ghost in the Shell", "Tron"
    ],
    books: [
      "The Hitchhiker's Guide to the Galaxy", "Neuromancer", "Lord of the Rings",
      "Ender's Game", "Foundation series", "Dune", "Programming manuals"
    ],
    heroes: [
      "Bill Gates", "Steve Wozniak", "Linus Torvalds", "Albert Einstein",
      "Carl Sagan", "Isaac Asimov", "Alan Turing", "Ada Lovelace"
    ],
    topFriends: [
      { name: "CodeMaster95", status: "Debugging life..." },
      { name: "DragonSlayer", status: "Rolling for initiative" },
      { name: "PixelPusher", status: "Designing the future" },
      { name: "DataMiner", status: "01001000 01101001" },
      { name: "SciFiGirl", status: "Reading Asimov" },
      { name: "GameDev98", status: "Making the next Doom" }
    ],
    likes: [
      "Late night coding sessions", "Pizza and Mountain Dew", "Solving impossible problems",
      "Building computers from scratch", "Discovering Easter eggs", "Scientific calculators",
      "Pocket protectors", "Getting 100% completion", "Learning new programming languages",
      "Debating Star Trek vs Star Wars", "LAN parties", "Modding games"
    ],
    dislikes: [
      "Sports", "Popular music", "Social gatherings", "Broken code",
      "Internet Explorer", "Y2K fears", "Dial-up internet lag",
      "People who don't get sci-fi references", "Fashion trends", "Small talk",
      "Gym class", "Assembly required furniture"
    ],
    favoriteQuote: "Any sufficiently advanced technology is indistinguishable from magic. - Arthur C. Clarke",
    backgroundColor: "#000000",
    backgroundPattern: "matrix",
    profileSong: "The X-Files Theme",
    customCSS: ""
  },

  freak: {
    clique: "freak",
    name: "DarkAngel666",
    mood: "Embracing the darkness within",
    location: "The Graveyard at Midnight",
    age: "Old Soul",
    lastLogin: "3:33 AM",
    profileViews: 666,
    aboutMe: "Lost in a world of plastic people and shallow dreams. I find beauty in the macabre and truth in the shadows. My black nail polish is my armor, my poetry is my weapon. 🖤🦇",
    interests: [
      "Gothic literature", "Tarot reading", "Cemetery photography", "Ancient mythology",
      "Occult studies", "Vampire folklore", "Dark poetry", "Alternative art",
      "Witchcraft", "Astrology", "Horror movies", "Underground music"
    ],
    music: [
      "The Cure", "Bauhaus", "Siouxsie and the Banshees", "Nine Inch Nails",
      "Type O Negative", "Dead Can Dance", "Sisters of Mercy", "Christian Death",
      "Clan of Xymox", "London After Midnight", "Marilyn Manson"
    ],
    movies: [
      "The Crow", "Interview with the Vampire", "Edward Scissorhands", "Beetlejuice",
      "The Nightmare Before Christmas", "Dark City", "The Cabinet of Dr. Caligari",
      "Nosferatu", "The Rocky Horror Picture Show", "Bram Stoker's Dracula"
    ],
    books: [
      "The Vampire Chronicles", "Edgar Allan Poe", "H.P. Lovecraft", "Dracula",
      "Frankenstein", "The Picture of Dorian Gray", "The Sandman comics",
      "Paradise Lost", "Dante's Inferno", "Gothic poetry collections"
    ],
    heroes: [
      "Edgar Allan Poe", "Tim Burton", "Bela Lugosi", "Vincent Price",
      "Anne Rice", "Clive Barker", "H.R. Giger", "Morticia Addams"
    ],
    topFriends: [
      { name: "VampireQueen", status: "Sleeping in my coffin" },
      { name: "RavenSoul", status: "Nevermore..." },
      { name: "MidnightPoet", status: "Writing in blood" },
      { name: "GothicRose", status: "Wilting beautifully" },
      { name: "ShadowWalker", status: "Lost in darkness" },
      { name: "CemeteryGirl", status: "Dancing with ghosts" }
    ],
    likes: [
      "Black clothing", "Silver jewelry", "Candles and incense", "Full moons",
      "Stormy nights", "Vintage horror films", "Poetry readings", "Art galleries",
      "Antique shops", "Gothic architecture", "Black cats", "Red wine",
      "Philosophical discussions", "Midnight walks"
    ],
    dislikes: [
      "Bright colors", "Cheerful people", "Pop music", "Shallow conversations",
      "Fluorescent lighting", "Shopping malls", "Conformity", "Fake happiness",
      "Small minds", "Mainstream fashion", "Happy endings", "Daylight",
      "Peppy attitudes", "Social expectations"
    ],
    favoriteQuote: "I have loved the stars too fondly to be fearful of the night. - Sarah Williams",
    backgroundColor: "#660066",
    backgroundPattern: "gothic",
    profileSong: "Love Song for a Vampire - Annie Lennox",
    customCSS: ""
  },

  jock: {
    clique: "jock",
    name: "ChampionAthlete97",
    mood: "Ready to dominate!",
    location: "The Gym",
    age: "17",
    lastLogin: "After practice",
    profileViews: 2847,
    aboutMe: "Varsity quarterback, team captain, and future college scholarship winner! I live for the rush of competition and the thrill of victory. When I'm not on the field, I'm in the gym pushing my limits! 🏈💪",
    interests: [
      "Football", "Basketball", "Wrestling", "Track and Field", "Weight lifting",
      "Nutrition and fitness", "Sports statistics", "College recruitment",
      "Team strategy", "ESPN SportsCenter", "Fantasy sports", "Athletic gear"
    ],
    music: [
      "Pump-up rock", "AC/DC", "Queen", "Survivor", "Eye of the Tiger",
      "We Will Rock You", "Metallica", "Guns N' Roses", "Aerosmith",
      "Van Halen", "Def Leppard", "Bon Jovi"
    ],
    movies: [
      "Rocky", "The Karate Kid", "Rudy", "Hoosiers", "Remember the Titans",
      "Field of Dreams", "Major League", "Top Gun", "Point Break",
      "Speed", "Demolition Man", "The Program"
    ],
    books: [
      "Sports Illustrated", "ESPN Magazine", "Muscle & Fitness",
      "Championship playbooks", "Athlete biographies", "Training guides",
      "Nutrition manuals", "The Art of War"
    ],
    heroes: [
      "Michael Jordan", "Joe Montana", "Wayne Gretzky", "Bo Jackson",
      "Deion Sanders", "Ken Griffey Jr.", "Emmitt Smith", "Brett Favre"
    ],
    topFriends: [
      { name: "MVP_Mike", status: "Crushing PRs at the gym" },
      { name: "RunningBack_Rob", status: "Breaking tackles" },
      { name: "CoachKiller", status: "Leading the team" },
      { name: "SportsFanatic", status: "Watching highlights" },
      { name: "IronPump_Ivan", status: "Bench pressing cars" },
      { name: "TrackStar_Tina", status: "Running like the wind" }
    ],
    likes: [
      "Winning championships", "Team bonding", "Protein shakes", "Gym sessions",
      "Game day excitement", "Trash talking", "Sports gear", "Victory celebrations",
      "College scouts", "Breaking records", "Adrenaline rushes", "Team dinners",
      "Pep rallies", "Athletic scholarships"
    ],
    dislikes: [
      "Losing", "Bench warmers", "Poor sportsmanship", "Weak effort",
      "Giving up", "Injury timeouts", "Academic probation", "Drama",
      "Sitting still too long", "Vegetarian food", "Art class", "Chess club",
      "Rainy game days", "Referee calls"
    ],
    favoriteQuote: "Winners never quit and quitters never win. - Vince Lombardi",
    backgroundColor: "#FF0000",
    backgroundPattern: "sports",
    profileSong: "We Are The Champions - Queen",
    customCSS: ""
  },

  prep: {
    clique: "prep",
    name: "PrincessPerfect",
    mood: "Fabulous as always! 💅",
    location: "The Mall",
    age: "Sweet 17",
    lastLogin: "Between manicures",
    profileViews: 5432,
    aboutMe: "Student body president, head cheerleader, and future sorority queen! I love fashion, friends, and making every day absolutely perfect. Life is SO much better when you look fabulous! ✨👑",
    interests: [
      "Fashion design", "Cheerleading", "Student government", "Shopping",
      "Makeup artistry", "Party planning", "Social networking", "Homecoming court",
      "Charity fundraisers", "School spirit", "Interior decorating", "Etiquette"
    ],
    music: [
      "Britney Spears", "Christina Aguilera", "Spice Girls", "TLC",
      "Mariah Carey", "Whitney Houston", "Celine Dion", "Alanis Morissette",
      "No Doubt", "Ace of Base", "Backstreet Boys", "*NSYNC"
    ],
    movies: [
      "Clueless", "Mean Girls", "She's All That", "10 Things I Hate About You",
      "Legally Blonde", "Bring It On", "The Princess Diaries", "Pretty Woman",
      "Titanic", "Dirty Dancing", "Ghost", "The Notebook"
    ],
    books: [
      "Seventeen Magazine", "Cosmopolitan", "Vogue", "Teen People",
      "Fashion magazines", "Sweet Valley High", "The Baby-Sitters Club",
      "Romance novels", "Etiquette guides", "Style handbooks"
    ],
    heroes: [
      "Audrey Hepburn", "Princess Diana", "Oprah Winfrey", "Martha Stewart",
      "Anna Wintour", "Jackie Kennedy", "Grace Kelly", "Reese Witherspoon"
    ],
    topFriends: [
      { name: "CheerCaptain_Chloe", status: "Perfecting routines" },
      { name: "FashionQueen_Fiona", status: "Shopping spree!" },
      { name: "SocialButterfly_Sam", status: "Planning the perfect party" },
      { name: "StyleIcon_Stella", status: "Coordinating outfits" },
      { name: "PopularPrincess_Paige", status: "Ruling the school" },
      { name: "TrendSetter_Tiffany", status: "Setting new standards" }
    ],
    likes: [
      "Designer handbags", "Perfect manicures", "Successful parties", "School dances",
      "Spa days", "Fashion shows", "Charity events", "Leadership roles",
      "Homecoming crowns", "Picture-perfect moments", "Coordinated outfits",
      "Compliments", "Social media attention", "VIP treatment"
    ],
    dislikes: [
      "Bad hair days", "Cheap jewelry", "Unflattering photos", "Social drama",
      "Poor fashion choices", "Rude behavior", "Messy rooms", "Bad manners",
      "Outdated trends", "Negative attitudes", "Uncomfortable shoes",
      "Rainy days", "Gossip about friends", "Breaking nails"
    ],
    favoriteQuote: "You have to think anyway, so why not think big? - Legally Blonde",
    backgroundColor: "#FFB6C1",
    backgroundPattern: "preppy",
    profileSong: "...Baby One More Time - Britney Spears",
    customCSS: ""
  }
};

// Background patterns for each clique
export const BACKGROUND_PATTERNS = {
  matrix: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ctext x='5' y='15' font-family='monospace' font-size='12' fill='%23008000'%3E1%3C/text%3E%3Ctext x='25' y='35' font-family='monospace' font-size='12' fill='%23008000'%3E0%3C/text%3E%3C/svg%3E",
  gothic: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5 L35 20 L50 15 L40 30 L55 35 L35 40 L40 55 L25 45 L20 60 L20 40 L5 45 L15 30 L0 25 L20 20 L15 5 Z' fill='%23330033' opacity='0.3'/%3E%3C/svg%3E",
  sports: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='20' fill='none' stroke='%23FFA500' stroke-width='2'/%3E%3Cline x1='5' y1='25' x2='45' y2='25' stroke='%23FFA500' stroke-width='2'/%3E%3C/svg%3E",
  preppy: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 0 L20 0 L20 20 L0 20 Z' fill='%23FFB6C1' opacity='0.3'/%3E%3Cpath d='M20 20 L40 20 L40 40 L20 40 Z' fill='%23FFB6C1' opacity='0.3'/%3E%3C/svg%3E"
};