import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { SUPPORTED_LANGUAGES } from "../services/translation";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageDropdown: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLanguage
  );

  const handleSelectLanguage = async (code: string) => {
    await changeLanguage(code as any);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.buttonText}>
          {currentLang?.flag} {currentLang?.nativeName}
        </Text>
        <ChevronDown size={20} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>언어 선택 / Select Language</Text>
            </View>
            <ScrollView style={styles.languageList}>
              {SUPPORTED_LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    currentLanguage === language.code && styles.languageItemActive,
                  ]}
                  onPress={() => handleSelectLanguage(language.code)}
                >
                  <View style={styles.languageContent}>
                    <Text style={styles.flag}>{language.flag}</Text>
                    <Text
                      style={[
                        styles.languageName,
                        currentLanguage === language.code && styles.languageNameActive,
                      ]}
                    >
                      {language.nativeName}
                    </Text>
                  </View>
                  {currentLanguage === language.code && (
                    <Check size={20} color="#FF6B00" />
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
  container: {
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "85%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  languageItemActive: {
    backgroundColor: "#FFF5E6",
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 16,
    color: "#1F2937",
  },
  languageNameActive: {
    fontWeight: "600",
    color: "#FF6B00",
  },
});

export default LanguageDropdown;

