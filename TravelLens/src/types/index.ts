// 언어 타입
export type Language = "ko" | "en" | "ja" | "zh" | "es";

// 기념품 카테고리
export type Category =
  | "food"
  | "cosmetics"
  | "fashion"
  | "electronics"
  | "traditional"
  | "other";

// 기념품 정보
export interface Souvenir {
  id: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
  name_zh: string;
  name_es: string;
  description_ko: string;
  description_en: string;
  description_ja: string;
  description_zh: string;
  description_es: string;
  category: Category;
  price_range: string;
  usage_tips: string;
  image_url: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// 구매처 정보
export interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  souvenir_ids: string[];
}

// 사용자 히스토리
export interface UserHistory {
  id: string;
  user_id: string;
  souvenir_id: string;
  image_url: string;
  search_date: string;
  language: Language;
}

// AI 분석 결과
export interface AnalysisResult {
  souvenir: Souvenir;
  confidence: number;
  detected_tags: string[];
  translated_content: {
    name: string;
    description: string;
    usage_tips: string;
  };
}

// 네비게이션 파라미터
export type RootStackParamList = {
  LanguageSelection: undefined;
  Home: undefined;
  Camera: undefined;
  Loading: { imageUri: string };
  Detail: { analysisResult: AnalysisResult };
  SearchResults: { searchResults: Souvenir[]; searchQuery: string };
  Map: { stores: Store[] };
  History: undefined;
};
