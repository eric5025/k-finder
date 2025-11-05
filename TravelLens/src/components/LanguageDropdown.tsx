import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { SUPPORTED_LANGUAGES } from "../services/translation";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageDropdown: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangData = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLanguage
  );

  const handleSelect = async (languageCode: string) => {
    await changeLanguage(languageCode as any);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.flag}>{currentLangData?.flag || "🌍"}</Text>
        <Text style={styles.languageText}>{currentLangData?.nativeName || "언어"}</Text>
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
            
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    item.code === currentLanguage && styles.selectedItem,
                  ]}
                  onPress={() => handleSelect(item.code)}
                >
                  <Text style={styles.itemFlag}>{item.flag}</Text>
                  <Text style={styles.itemName}>{item.nativeName}</Text>
                  {item.code === currentLanguage && (
                    <Check size={20} color="#FF6B00" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
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
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  languageText: {
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
    width: Dimensions.get("window").width * 0.85,
    maxHeight: Dimensions.get("window").height * 0.7,
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#FF6B00",
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedItem: {
    backgroundColor: "#FFF5E6",
  },
  itemFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
});

export default LanguageDropdown;

