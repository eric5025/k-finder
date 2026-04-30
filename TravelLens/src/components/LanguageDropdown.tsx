import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useLanguage } from "../contexts/LanguageContext";

// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = [
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

interface LanguageDropdownProps {
  /** 밝은 홈 배경용 (어두운 텍스트·테두리) */
  tone?: "light" | "dark";
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ tone = "dark" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { currentLanguage, setLanguage } = useLanguage();
  const isLight = tone === "light";

  const currentLangName =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLanguage)
      ?.nativeName || "한국어";

  const currentLangFlag =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLanguage)
      ?.flag || "🌍";

  const handleLanguageSelect = async (langCode: string) => {
    await setLanguage(langCode);
    setIsVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          isLight && styles.dropdownButtonLight,
        ]}
        onPress={() => setIsVisible(true)}
      >
        <Text
          style={[styles.dropdownText, isLight && styles.dropdownTextLight]}
        >
          {currentLangFlag} {currentLangName}
        </Text>
        <ChevronDown size={16} color={isLight ? "#3C3C43" : "white"} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>언어 선택</Text>
            <ScrollView style={styles.languageList}>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    currentLanguage === lang.code && styles.languageItemActive,
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={styles.languageName}>{lang.nativeName}</Text>
                  {currentLanguage === lang.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  dropdownText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownButtonLight: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  dropdownTextLight: {
    color: "#1C1C1E",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  languageItemActive: {
    backgroundColor: "#FFE5E5",
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    color: "#E63946",
    fontWeight: "bold",
  },
});

export default LanguageDropdown;

