import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setLanguage as setI18nLanguage } from "../i18n";
import { Language } from "../types";

type LanguageContextType = {
  currentLanguage: string;
  setLanguage: (lang: string) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("ko");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        setI18nLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error("언어 로드 오류:", error);
    }
  };

  const setLanguage = async (lang: string) => {
    try {
      setCurrentLanguage(lang);
      setI18nLanguage(lang as Language);
      await AsyncStorage.setItem("selectedLanguage", lang);
    } catch (error) {
      console.error("언어 저장 오류:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

