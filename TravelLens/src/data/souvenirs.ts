import { Souvenir } from "../types";

// 실제 AI 검색 결과를 위한 인터페이스
export interface AISearchResult {
  souvenir: Souvenir;
  confidence: number;
  detected_tags: string[];
}

// AI 검색 결과를 기반으로 한 기념품 데이터
export const createSouvenirFromAIResult = (
  aiResult: AISearchResult
): Souvenir => {
  return {
    ...aiResult.souvenir,
    // AI 결과에서 이미지 URL이 있으면 사용, 없으면 기본 이미지
    image_url:
      aiResult.souvenir.image_url ||
      "https://via.placeholder.com/300x300?text=기념품",
  };
};

// 빈 검색 결과를 위한 기본 데이터
export const getEmptySearchResults = (): Souvenir[] => {
  return [];
};

// 검색 함수 - 실제로는 AI API 호출 결과를 사용
export const searchSouvenirsByTags = (tags: string[]): Souvenir[] => {
  // 실제 구현에서는 AI API를 호출하여 결과를 반환
  // 현재는 빈 배열 반환 (AI 검색 결과로 대체됨)
  return [];
};

// 카테고리로 기념품 검색
export const searchSouvenirsByCategory = (category: string): Souvenir[] => {
  return [];
};

// ID로 기념품 검색
export const getSouvenirById = (id: string): Souvenir | undefined => {
  return undefined;
};
