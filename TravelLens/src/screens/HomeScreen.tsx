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
import { Camera, Image, History } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "../types";
import { useTranslation } from "../hooks/useTranslation";
import LanguageDropdown from "../components/LanguageDropdown";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  // 자동 번역 Hook 사용
  const subtitle = useTranslation("한국 기념품을 촬영하고 정보를 확인하세요");
  const takePhotoTitle = useTranslation("사진 촬영");
  const takePhotoSubtitle = useTranslation("카메라로 기념품 촬영");
  const selectPhotoTitle = useTranslation("갤러리 선택");
  const selectPhotoSubtitle = useTranslation("저장된 사진 선택");
  const footerText = useTranslation("전 세계 모든 언어 지원 | AI 분석 | 검색 기록");

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#FF6B00", "#FF8C00"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.appName}>TravelLens</Text>
            <View style={styles.headerButtons}>
              <LanguageDropdown />
              <TouchableOpacity onPress={handleHistory} style={styles.headerButton}>
                <History size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
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
            <Text style={styles.actionTitle}>{takePhotoTitle}</Text>
            <Text style={styles.actionSubtitle}>{takePhotoSubtitle}</Text>
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
            <Text style={styles.actionTitle}>{selectPhotoTitle}</Text>
            <Text style={styles.actionSubtitle}>{selectPhotoSubtitle}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{footerText}</Text>
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
