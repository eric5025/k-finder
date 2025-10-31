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
import PremiumModal from "../components/PremiumModal";
import { addSearchHistory } from "../services/searchHistory";

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

  const searchImageFromUnsplash = async (query: string) => {
    try {
      // 검색 키워드에 따라 다른 이미지 URL 반환
      const queryLower = query.toLowerCase();

      // 한국 관련 키워드들
      if (queryLower.includes("한국") || queryLower.includes("korea")) {
        return "https://images.unsplash.com/photo-1538485399081-7c8ed7f3c3b2?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("서울") || queryLower.includes("seoul")) {
        return "https://images.unsplash.com/photo-1538485399081-7c8ed7f3c3b2?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("부산") || queryLower.includes("busan")) {
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("제주") || queryLower.includes("jeju")) {
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
      }

      // 음식 관련 키워드들
      if (queryLower.includes("김치") || queryLower.includes("kimchi")) {
        return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("불고기") || queryLower.includes("bulgogi")) {
        return "https://images.unsplash.com/photo-1563379091339-03246963c90a?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("떡") || queryLower.includes("rice cake")) {
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("라면") || queryLower.includes("ramen")) {
        return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("삼겹살") || queryLower.includes("samgyeopsal")) {
        return "https://images.unsplash.com/photo-1563379091339-03246963c90a?w=400&h=300&fit=crop&q=80";
      }

      // 전통 관련 키워드들
      if (queryLower.includes("한복") || queryLower.includes("hanbok")) {
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("도자기") || queryLower.includes("pottery")) {
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("소주") || queryLower.includes("soju")) {
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("인삼") || queryLower.includes("ginseng")) {
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
      }
      if (queryLower.includes("전통") || queryLower.includes("traditional")) {
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
      }

      // 기본 이미지 (검색 키워드에 맞는 이미지가 없을 때)
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
    } catch (error) {
      console.error("이미지 검색 오류:", error);
      // 오류 발생 시 기본 이미지 반환
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80";
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);

      try {
        // 검색 키워드로 이미지 검색
        const imageUrl = await searchImageFromUnsplash(searchQuery.trim());

        console.log("검색 이미지 URL:", imageUrl);

        // 실제 AI 검색 결과를 시뮬레이션
        const mockResults = [
          {
            id: "1",
            name_ko: searchQuery.trim(),
            name_en: searchQuery.trim(),
            name_ja: searchQuery.trim(),
            name_zh: searchQuery.trim(),
            name_es: searchQuery.trim(),
            description_ko: `${searchQuery.trim()}에 대한 검색 결과입니다.`,
            description_en: `Search results for ${searchQuery.trim()}.`,
            description_ja: `${searchQuery.trim()}の検索結果です。`,
            description_zh: `${searchQuery.trim()}的搜索结果。`,
            description_es: `Resultados de búsqueda para ${searchQuery.trim()}.`,
            category: "other" as const,
            price_range: "가격 정보 없음",
            usage_tips: "검색 결과를 확인해보세요.",
            image_url: imageUrl, // 실제 검색된 이미지 URL 사용
            tags: [searchQuery.trim(), "한국", "기념품"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        console.log("최종 결과:", mockResults);

        // 검색 기록 추가
        await addSearchHistory(searchQuery.trim(), imageUrl, mockResults);

        navigation.navigate("SearchResults", {
          searchResults: mockResults,
          searchQuery: searchQuery.trim(),
        });
      } catch (error) {
        console.error("검색 오류:", error);
        Alert.alert("오류", "검색 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
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
      <LinearGradient colors={["#FF6B00", "#FF8C00"]} style={styles.gradient}>
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
                style={[
                  styles.searchButton,
                  isLoading && styles.searchButtonDisabled,
                ]}
                onPress={handleSearch}
                disabled={isLoading}
              >
                <Text style={styles.searchButtonText}>
                  {isLoading ? "검색중..." : "검색"}
                </Text>
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
  searchButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
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
