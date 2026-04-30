export interface TouristLocation {
  id: string;
  name: string;
  nameKo: string;
  emoji: string;
  latitude: number;
  longitude: number;
  /** meters — used for crowd counting */
  radius: number;
}

export const DEFAULT_TOURIST_LOCATIONS: TouristLocation[] = [
  {
    id: "gyeongbokgung",
    name: "Gyeongbokgung",
    nameKo: "경복궁",
    emoji: "🏯",
    latitude: 37.5796,
    longitude: 126.977,
    radius: 400,
  },
  {
    id: "myeongdong",
    name: "Myeongdong",
    nameKo: "명동",
    emoji: "🛍️",
    latitude: 37.5636,
    longitude: 126.9827,
    radius: 350,
  },
  {
    id: "hongdae",
    name: "Hongdae",
    nameKo: "홍대",
    emoji: "🎨",
    latitude: 37.5563,
    longitude: 126.9236,
    radius: 350,
  },
  {
    id: "insadong",
    name: "Insadong",
    nameKo: "인사동",
    emoji: "🪔",
    latitude: 37.5744,
    longitude: 126.9857,
    radius: 300,
  },
  {
    id: "itaewon",
    name: "Itaewon",
    nameKo: "이태원",
    emoji: "🌍",
    latitude: 37.5347,
    longitude: 126.994,
    radius: 350,
  },
  {
    id: "dongdaemun",
    name: "Dongdaemun",
    nameKo: "동대문",
    emoji: "🏟️",
    latitude: 37.5671,
    longitude: 127.009,
    radius: 400,
  },
  {
    id: "bukchon",
    name: "Bukchon Hanok",
    nameKo: "북촌 한옥마을",
    emoji: "🏘️",
    latitude: 37.5826,
    longitude: 126.9837,
    radius: 300,
  },
  {
    id: "gangnam",
    name: "Gangnam",
    nameKo: "강남",
    emoji: "🌆",
    latitude: 37.4979,
    longitude: 127.0276,
    radius: 500,
  },
  {
    id: "namsan",
    name: "N Seoul Tower",
    nameKo: "남산타워",
    emoji: "🗼",
    latitude: 37.5512,
    longitude: 126.9882,
    radius: 300,
  },
  {
    id: "lotte_world",
    name: "Lotte World",
    nameKo: "롯데월드",
    emoji: "🎡",
    latitude: 37.5111,
    longitude: 127.0982,
    radius: 400,
  },
];
