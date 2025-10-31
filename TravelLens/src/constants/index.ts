import { Language } from "../types";

// 지원 언어
export const SUPPORTED_LANGUAGES: {
  code: Language;
  name: string;
  flag: string;
}[] = [
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

// 카테고리 정보
export const CATEGORIES = {
  food: { name: "음식", icon: "🍜" },
  cosmetics: { name: "화장품", icon: "💄" },
  fashion: { name: "패션", icon: "👕" },
  electronics: { name: "전자제품", icon: "📱" },
  traditional: { name: "전통", icon: "🏮" },
  other: { name: "기타", icon: "🎁" },
};

// 색상 테마 - Tax Refund 스타일 🧡
export const COLORS = {
  primary: "#FF6B00",      // 택스 리펀 주황색
  secondary: "#FF8C00",    // 밝은 주황색
  accent: "#FFB347",       // 부드러운 주황색
  background: "#FFFFFF",
  surface: "#FFF5E6",      // 연한 주황 배경
  text: "#1F2937",
  textSecondary: "#6B7280",
  border: "#FFD4A3",       // 주황 계열 테두리
  error: "#EF4444",
  warning: "#FF6B00",      // 주황색으로 통일
  success: "#10B981",
};

// API 설정
export const API_CONFIG = {
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  GOOGLE_MAPS_API_KEY: "", // 환경변수에서 가져올 예정
};

// 앱 설정
export const APP_CONFIG = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_QUALITY: 0.8,
  CAMERA_TIMEOUT: 30000, // 30초
};

// 메시지
export const MESSAGES = {
  LOADING: "분석 중입니다...",
  ERROR: "오류가 발생했습니다.",
  NO_RESULT: "결과를 찾을 수 없습니다.",
  CAMERA_PERMISSION: "카메라 권한이 필요합니다.",
  LOCATION_PERMISSION: "위치 권한이 필요합니다.",
};
