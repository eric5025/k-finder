import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  Star,
  DollarSign,
} from "lucide-react-native";
import { RootStackParamList, AnalysisResult } from "../types";
import { t, getCurrentLanguage } from "../i18n";
import { COLORS, CATEGORIES } from "../constants";
import MapView from "../components/MapView";
import StarRating from "../components/StarRating";
import MapNavigation from "../components/KakaoMap";
import {
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from "../services/favorites";

type DetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Detail"
>;

type DetailScreenRouteProp = RouteProp<RootStackParamList, "Detail">;

interface Props {
  navigation: DetailScreenNavigationProp;
  route: DetailScreenRouteProp;
}

const DetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { analysisResult } = route.params;
  const currentLanguage = getCurrentLanguage();
  const [showMap, setShowMap] = React.useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 현재 언어에 맞는 텍스트 가져오기
  const getLocalizedText = (field: string) => {
    // translated_content에서 가져오기
    if (
      analysisResult.translated_content &&
      field in analysisResult.translated_content
    ) {
      return analysisResult.translated_content[
        field as keyof typeof analysisResult.translated_content
      ];
    }

    // fallback: souvenir 객체에서 직접 가져오기
    const key =
      `${field}_${currentLanguage}` as keyof typeof analysisResult.souvenir;
    const fallbackKey = `${field}_ko` as keyof typeof analysisResult.souvenir;
    return analysisResult.souvenir[key] || analysisResult.souvenir[fallbackKey];
  };

  const handleBack = () => {
    if (showMap) {
      setShowMap(false);
    } else {
      navigation.goBack();
    }
  };

  // 즐겨찾기 상태 확인
  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await isFavorite(analysisResult.souvenir.id);
      setIsFavorited(favorite);
    } catch (error) {
      console.error("즐겨찾기 상태 확인 오류:", error);
    }
  };

  const handleFavorite = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorited) {
        await removeFromFavorites(analysisResult.souvenir.id);
        setIsFavorited(false);
        Alert.alert(t("common.confirm"), t("favorites.removed"));
      } else {
        await addToFavorites(analysisResult.souvenir);
        setIsFavorited(true);
        Alert.alert(t("common.confirm"), t("favorites.added"));
      }
    } catch (error) {
      console.error("즐겨찾기 처리 오류:", error);
      Alert.alert(t("common.error"), t("favorites.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    Alert.alert(t("common.confirm"), t("share.comingSoon"));
  };

  const handleMap = () => {
    setShowMap(true);
  };

  const handleSaveToHistory = () => {
    Alert.alert(t("common.confirm"), t("history.saved"));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={["#FF6B00", "#FF8C00"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {showMap ? t("map.title") : t("result.title")}
          </Text>
          <View style={styles.headerButtons}>
            {!showMap && (
              <>
                <TouchableOpacity
                  onPress={handleFavorite}
                  style={styles.headerButton}
                  disabled={isLoading}
                >
                  <Heart
                    size={20}
                    color={isFavorited ? "red" : "white"}
                    fill={isFavorited ? "red" : "none"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.headerButton}
                >
                  <Share2 size={20} color="white" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </LinearGradient>

      {showMap ? (
        <MapNavigation
          style={styles.mapContainer}
          locationName={String(getLocalizedText("name"))}
        />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Product Info Card */}
          <View style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productImageContainer}>
                {analysisResult.souvenir.image_url ? (
                  <Image
                    source={{ uri: analysisResult.souvenir.image_url }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.productImageText}>📸</Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {getLocalizedText("name")}
                </Text>
                <View style={styles.categoryContainer}>
                  <Text style={styles.categoryText}>
                    {CATEGORIES[analysisResult.souvenir.category]?.icon}{" "}
                    {CATEGORIES[analysisResult.souvenir.category]?.name}
                  </Text>
                </View>
                <View style={styles.ratingContainer}>
                  <StarRating rating={4.5} size={16} />
                  <Text style={styles.confidenceText}>
                    ({t("result.accuracy")}:{" "}
                    {Math.round(analysisResult.confidence * 100)}%)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Price Card */}
          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <DollarSign size={20} color={COLORS.primary} />
              <Text style={styles.priceTitle}>{t("result.price")}</Text>
            </View>
            <Text style={styles.priceText}>
              {analysisResult.souvenir.price_range}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("result.description")}</Text>
            <Text style={styles.descriptionText}>
              {getLocalizedText("description")}
            </Text>
          </View>

          {/* Usage Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("result.usageTips")}</Text>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsText}>
                {analysisResult.souvenir.usage_tips}
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("result.tags")}</Text>
            <View style={styles.tagsContainer}>
              {analysisResult.detected_tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleMap}>
              <MapPin size={20} color="white" />
              <Text style={styles.actionButtonText}>
                {t("result.whereToBuy")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleSaveToHistory}
            >
              <Text
                style={[styles.actionButtonText, styles.secondaryButtonText]}
              >
                {t("result.saveToHistory")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: "row",
  },
  productImageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  productImageText: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  priceCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
  },
  tipsText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#E0E7FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 0,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    marginLeft: 0,
  },
  mapContainer: {
    flex: 1,
  },
});

export default DetailScreen;
