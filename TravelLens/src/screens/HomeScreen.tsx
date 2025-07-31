import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  Image,
  History,
  Settings,
  Search,
  Crown,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "../types";
import { t, getCurrentLanguage } from "../i18n";
import { COLORS } from "../constants";
import { searchSouvenirsByTags, sampleSouvenirs } from "../data/souvenirs";
import PremiumModal from "../components/PremiumModal";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false); // 실제로는 AsyncStorage에서 가져와야 함

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("common.error"), t("camera.cameraPermission"), [
        { text: t("common.confirm") },
      ]);
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("common.error"), "갤러리 접근 권한이 필요합니다.", [
        { text: t("common.confirm") },
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert(t("common.error"), "카메라를 사용할 수 없습니다.");
    }
  };

  const handleSelectFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert(t("common.error"), "갤러리를 사용할 수 없습니다.");
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchSouvenirsByTags([searchQuery.trim()]);
      navigation.navigate("SearchResults", {
        searchResults: results.length > 0 ? results : sampleSouvenirs,
        searchQuery: searchQuery.trim(),
      });
    }
  };

  const handleHistoryPress = () => {
    navigation.navigate("History");
  };

  const handleSettingsPress = () => {
    // 설정 화면으로 이동 (추후 구현)
    Alert.alert("설정", "설정 기능은 추후 구현 예정입니다.");
  };

  const handlePremiumPress = () => {
    setShowPremiumModal(true);
  };

  const handleSubscribe = (plan: "monthly" | "yearly") => {
    // 실제로는 App Store/Google Play 결제 API 연동
    Alert.alert(
      "구독 완료",
      `${plan === "monthly" ? "월" : "연"} 구독이 시작되었습니다!`,
      [
        {
          text: "확인",
          onPress: () => {
            setIsPremium(true);
            // 여기서 실제 결제 처리
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#3B82F6", "#8B5CF6"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.appName}>TravelLens</Text>
            <Text style={styles.languageIndicator}>
              {getCurrentLanguage().toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleHistoryPress}
            >
              <History size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, isPremium && styles.premiumButton]}
              onPress={handlePremiumPress}
            >
              <Crown size={24} color={isPremium ? "#FFD700" : "white"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSettingsPress}
            >
              <Settings size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="기념품을 검색해보세요..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Text style={styles.searchButtonText}>검색</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.cameraPreview}>
            <View style={styles.cameraIconContainer}>
              <Camera size={80} color="rgba(255, 255, 255, 0.3)" />
            </View>
            <Text style={styles.instructionText}>
              {t("camera.pointAtItem")}
            </Text>
            <Text style={styles.subInstructionText}>
              음식 • 화장품 • 전통 • 전자제품
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <Camera size={32} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>
                {t("camera.takePhoto")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.galleryButton]}
              onPress={handleSelectFromGallery}
              activeOpacity={0.8}
            >
              <Image size={32} color={COLORS.secondary} />
              <Text style={[styles.actionButtonText, styles.galleryButtonText]}>
                {t("camera.selectFromGallery")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              AI가 기념품을 분석하여 정보를 제공합니다
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={handleSubscribe}
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: "flex-start",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  languageIndicator: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 16,
  },
  premiumButton: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 8,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  cameraPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    marginVertical: 20,
  },
  cameraIconContainer: {
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subInstructionText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  actionButtons: {
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 12,
  },
  galleryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  galleryButtonText: {
    color: COLORS.secondary,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});

export default HomeScreen;
