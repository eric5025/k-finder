import { PERPLEXITY_API_KEY } from "@env";

// 지원하는 언어 목록 (자동 확장 가능)
export const SUPPORTED_LANGUAGES = [
  { code: "ko", name: "한국어", nativeName: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ja", name: "일본어", nativeName: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "중국어", nativeName: "中文", flag: "🇨🇳" },
  { code: "es", name: "스페인어", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "프랑스어", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "독일어", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "이탈리아어", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "포르투갈어", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "러시아어", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ar", name: "아랍어", nativeName: "العربية", flag: "🇸🇦" },
  { code: "th", name: "태국어", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "vi", name: "베트남어", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "id", name: "인도네시아어", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "hi", name: "힌디어", nativeName: "हिन्दी", flag: "🇮🇳" },
];

// 언어 코드를 언어 이름으로 변환
const getLanguageName = (code: string): string => {
  const languageMap: Record<string, string> = {
    ko: "한국어 (Korean)",
    en: "영어 (English)",
    ja: "일본어 (Japanese)",
    zh: "중국어 (Chinese)",
    es: "스페인어 (Spanish)",
    fr: "프랑스어 (French)",
    de: "독일어 (German)",
    it: "이탈리아어 (Italian)",
    pt: "포르투갈어 (Portuguese)",
    ru: "러시아어 (Russian)",
    ar: "아랍어 (Arabic)",
    th: "태국어 (Thai)",
    vi: "베트남어 (Vietnamese)",
    id: "인도네시아어 (Indonesian)",
    hi: "힌디어 (Hindi)",
  };
  return languageMap[code] || code;
};

// Perplexity AI를 사용한 자동 번역
export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  // 한국어면 번역 안 함
  if (targetLanguage === "ko") return text;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "user",
            content: `다음 한국어 텍스트를 ${getLanguageName(targetLanguage)}로 정확하게 번역해주세요. 번역된 텍스트만 답변하고 다른 설명은 하지 마세요:\n\n"${text}"`,
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`번역 API 오류: ${response.status}`);
    }

    const data = await response.json();
    const translated = data.choices[0].message.content.trim();
    
    // 따옴표 제거 (있을 경우)
    return translated.replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("번역 오류:", error);
    // 번역 실패 시 원본 반환
    return text;
  }
};

// 여러 텍스트를 한 번에 번역 (효율성)
export const translateBatch = async (
  texts: Record<string, string>,
  targetLanguage: string
): Promise<Record<string, string>> => {
  if (targetLanguage === "ko") return texts;

  try {
    const textsArray = Object.entries(texts);
    const textToTranslate = textsArray
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "user",
            content: `다음 한국어 텍스트들을 ${getLanguageName(targetLanguage)}로 정확하게 번역해주세요. 같은 형식(키: 값)으로 답변해주세요:\n\n${textToTranslate}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`번역 API 오류: ${response.status}`);
    }

    const data = await response.json();
    const translated = data.choices[0].message.content.trim();

    // 결과 파싱
    const result: Record<string, string> = {};
    translated.split("\n").forEach((line: string) => {
      const match = line.match(/^(.+?):\s*(.+)$/);
      if (match) {
        result[match[1]] = match[2];
      }
    });

    return Object.keys(result).length > 0 ? result : texts;
  } catch (error) {
    console.error("일괄 번역 오류:", error);
    return texts;
  }
};

// 캐시 관리 (같은 텍스트 중복 번역 방지)
const translationCache = new Map<string, string>();

export const translateWithCache = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  const cacheKey = `${text}_${targetLanguage}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const translated = await translateText(text, targetLanguage);
  translationCache.set(cacheKey, translated);
  
  return translated;
};

// 캐시 초기화
export const clearTranslationCache = () => {
  translationCache.clear();
};

