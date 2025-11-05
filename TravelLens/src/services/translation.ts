// LibreTranslate - 무료 오픈소스 번역 API
// API 키 불필요! 🎉

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

// LibreTranslate 언어 코드 매핑 (지원되는 언어만)
const LIBRETRANSLATE_LANG_MAP: { [key: string]: string } = {
  ko: "ko",
  en: "en",
  ja: "ja",
  zh: "zh",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  ru: "ru",
  ar: "ar",
};

// LibreTranslate가 지원하지 않는 언어들 (영어로 폴백)
const UNSUPPORTED_LANGUAGES = ["th", "vi", "id", "hi"];

// 번역 캐시 (같은 텍스트 중복 번역 방지)
const translationCache = new Map<string, string>();

// LibreTranslate를 사용한 자동 번역
export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  // 한국어면 번역 안 함
  if (targetLanguage === "ko") return text;

  // 캐시 확인
  const cacheKey = `${text}_${targetLanguage}`;
  if (translationCache.has(cacheKey)) {
    console.log("✓ 캐시에서 번역 로드:", text.substring(0, 20));
    return translationCache.get(cacheKey)!;
  }

  try {
    // 지원하지 않는 언어는 영어로 대체
    let targetLangCode = LIBRETRANSLATE_LANG_MAP[targetLanguage];
    
    if (!targetLangCode || UNSUPPORTED_LANGUAGES.includes(targetLanguage)) {
      console.log(`⚠️ ${targetLanguage}는 LibreTranslate가 지원하지 않음 -> 영어로 번역`);
      targetLangCode = "en";
    }

    console.log(`🔄 번역 요청: "${text.substring(0, 30)}..." (ko → ${targetLangCode})`);

    const response = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: "ko",
        target: targetLangCode,
        format: "text",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API 오류 (${response.status}):`, errorText);
      throw new Error(`번역 API 오류: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText;

    console.log(`✓ 번역 완료: "${translatedText.substring(0, 30)}..."`);

    // 캐시 저장
    translationCache.set(cacheKey, translatedText);

    return translatedText;
  } catch (error) {
    console.error("❌ LibreTranslate 오류:", error);
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

  const result: Record<string, string> = {};

  // 각 텍스트를 순차적으로 번역 (LibreTranslate는 배치 번역 미지원)
  for (const [key, value] of Object.entries(texts)) {
    result[key] = await translateText(value, targetLanguage);
  }

  return result;
};

// 캐시를 사용한 번역 (기본적으로 translateText에 포함됨)
export const translateWithCache = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  return translateText(text, targetLanguage);
};

// 캐시 초기화
export const clearTranslationCache = () => {
  translationCache.clear();
  console.log("번역 캐시 초기화");
};
