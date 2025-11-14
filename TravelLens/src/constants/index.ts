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

// 색상 테마 - 붉은 계열 🔴
export const COLORS = {
  primary: "#E63946",      // 진한 빨강
  secondary: "#F77F88",    // 밝은 빨강
  accent: "#FB8B89",       // 부드러운 빨강
  background: "#FFFFFF",
  surface: "#FFE5E5",      // 연한 빨강 배경
  text: "#1F2937",
  textSecondary: "#6B7280",
  border: "#F4A9A8",       // 빨강 계열 테두리
  error: "#EF4444",
  warning: "#E63946",      // 빨강색으로 통일
  success: "#10B981",
  normal: "#000000",
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
