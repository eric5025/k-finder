import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Image, History, Globe } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentLanguage } = useLanguage();

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 권한이 필요합니다.", [
        { text: "확인" },
      ]);
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.", [
        { text: "확인" },
      ]);
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("오류", "카메라를 사용할 수 없습니다.");
    }
  };

  const handleSelectFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("오류", "갤러리를 사용할 수 없습니다.");
    }
  };

  const handleHistory = () => {
    navigation.navigate("History");
  };

  const handleLanguageChange = () => {
    navigation.navigate("LanguageSelection");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#FF6B00", "#FF8C00"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.appName}>TravelLens</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={handleLanguageChange}
                style={styles.headerButton}
              >
                <Globe size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleHistory} style={styles.headerButton}>
                <History size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {currentLanguage === "ko" && "한국 기념품을 촬영하고 정보를 확인하세요"}
            {currentLanguage === "en" && "Discover Korean souvenirs with a photo"}
            {currentLanguage === "ja" && "写真で韓国のお土産を見つけよう"}
            {currentLanguage === "zh" && "拍照发现韩国纪念品"}
            {currentLanguage === "es" && "Descubre souvenirs coreanos con una foto"}
          </Text>
        </View>

        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          {/* Camera Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTakePhoto}
            disabled={isLoading}
          >
            <View style={styles.iconContainer}>
              <Camera size={40} color="#FF6B00" />
            </View>
            <Text style={styles.actionTitle}>
              {currentLanguage === "ko" && "사진 촬영"}
              {currentLanguage === "en" && "Take Photo"}
              {currentLanguage === "ja" && "写真を撮る"}
              {currentLanguage === "zh" && "拍照"}
              {currentLanguage === "es" && "Tomar Foto"}
            </Text>
            <Text style={styles.actionSubtitle}>
              {currentLanguage === "ko" && "카메라로 기념품 촬영"}
              {currentLanguage === "en" && "Capture souvenirs with camera"}
              {currentLanguage === "ja" && "カメラでお土産を撮影"}
              {currentLanguage === "zh" && "用相机拍摄纪念品"}
              {currentLanguage === "es" && "Captura souvenirs con la cámara"}
            </Text>
          </TouchableOpacity>

          {/* Gallery Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSelectFromGallery}
            disabled={isLoading}
          >
            <View style={styles.iconContainer}>
              <Image size={40} color="#FF6B00" />
            </View>
            <Text style={styles.actionTitle}>
              {currentLanguage === "ko" && "갤러리 선택"}
              {currentLanguage === "en" && "Select Photo"}
              {currentLanguage === "ja" && "写真を選択"}
              {currentLanguage === "zh" && "选择照片"}
              {currentLanguage === "es" && "Seleccionar Foto"}
            </Text>
            <Text style={styles.actionSubtitle}>
              {currentLanguage === "ko" && "저장된 사진 선택"}
              {currentLanguage === "en" && "Choose from gallery"}
              {currentLanguage === "ja" && "ギャラリーから選択"}
              {currentLanguage === "zh" && "从相册选择"}
              {currentLanguage === "es" && "Elegir de la galería"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {currentLanguage === "ko" && "🌍 5개 언어 지원 | 📸 AI 분석 | 💾 검색 기록"}
            {currentLanguage === "en" && "🌍 5 Languages | 📸 AI Analysis | 💾 History"}
            {currentLanguage === "ja" && "🌍 5言語対応 | 📸 AI分析 | 💾 履歴"}
            {currentLanguage === "zh" && "🌍 5种语言 | 📸 AI分析 | 💾 历史记录"}
            {currentLanguage === "es" && "🌍 5 Idiomas | 📸 Análisis IA | 💾 Historial"}
          </Text>
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
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  actionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 20,
  },
  actionButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});

export default HomeScreen;
