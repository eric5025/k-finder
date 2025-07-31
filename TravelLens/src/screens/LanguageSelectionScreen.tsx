import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { SUPPORTED_LANGUAGES } from "../constants";
import { setLanguage, t } from "../i18n";

type LanguageSelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LanguageSelection"
>;

interface Props {
  navigation: LanguageSelectionScreenNavigationProp;
}

const LanguageSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode as any);
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#3B82F6", "#8B5CF6"]} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>TravelLens</Text>
            <Text style={styles.subtitle}>{t("language.selectLanguage")}</Text>
          </View>

          <View style={styles.languageList}>
            {SUPPORTED_LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={styles.languageButton}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.8}
              >
                <View style={styles.languageContent}>
                  <Text style={styles.flag}>{language.flag}</Text>
                  <Text style={styles.languageName}>{language.name}</Text>
                </View>
                <View style={styles.checkbox} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              한국 기념품을 쉽게 찾고 정보를 확인하세요
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  languageList: {
    flex: 1,
    justifyContent: "center",
  },
  languageButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageName: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "transparent",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default LanguageSelectionScreen;
