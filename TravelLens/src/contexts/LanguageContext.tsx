import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "../types";
import { initLanguage, setLanguage as saveLanguage } from "../i18n";

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "ko",
  changeLanguage: async () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("ko");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 앱 시작 시 저장된 언어 불러오기
    const loadLanguage = async () => {
      const lang = await initLanguage();
      setCurrentLanguage(lang);
      setIsInitialized(true);
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (language: Language) => {
    await saveLanguage(language);
    setCurrentLanguage(language); // 상태 업데이트 -> 자동 리렌더링
  };

  if (!isInitialized) {
    return null; // 또는 로딩 화면
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

