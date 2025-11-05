import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translateWithCache } from "../services/translation";

// 자동 번역 Hook
export const useTranslation = (koreanText: string): string => {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(koreanText);

  useEffect(() => {
    if (currentLanguage === "ko") {
      setTranslatedText(koreanText);
      return;
    }

    // 다른 언어인 경우 자동 번역
    const translate = async () => {
      const result = await translateWithCache(koreanText, currentLanguage);
      setTranslatedText(result);
    };

    translate();
  }, [koreanText, currentLanguage]);

  return translatedText;
};

// 여러 텍스트 자동 번역
export const useTranslationBatch = (
  koreanTexts: Record<string, string>
): Record<string, string> => {
  const { currentLanguage } = useLanguage();
  const [translated, setTranslated] = useState(koreanTexts);

  useEffect(() => {
    if (currentLanguage === "ko") {
      setTranslated(koreanTexts);
      return;
    }

    const translateAll = async () => {
      const results: Record<string, string> = {};
      
      // 각 텍스트를 개별적으로 번역
      await Promise.all(
        Object.entries(koreanTexts).map(async ([key, value]) => {
          results[key] = await translateWithCache(value, currentLanguage);
        })
      );

      setTranslated(results);
    };

    translateAll();
  }, [JSON.stringify(koreanTexts), currentLanguage]);

  return translated;
};

