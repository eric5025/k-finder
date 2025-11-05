// 언어 타입 (전 세계 모든 주요 언어 지원)
export type Language = 
  | "ko" | "en" | "ja" | "zh" | "es" 
  | "fr" | "de" | "it" | "pt" | "ru" 
  | "ar" | "th" | "vi" | "id" | "hi";

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

// 네비게이션 파라미터 (MVP)
export type RootStackParamList = {
  LanguageSelection: undefined;
  Login: undefined;
  Home: undefined;
  Loading: { imageUri: string };
  Detail: { analysisResult: AnalysisResult };
  History: undefined;
};
