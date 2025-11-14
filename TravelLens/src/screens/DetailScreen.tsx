import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { RootStackParamList, AnalysisResult } from "../types";
import { COLORS, CATEGORIES } from "../constants";
import { useLanguage } from "../contexts/LanguageContext";
import { getUIText } from "../i18n/translations";

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
  const { currentLanguage } = useLanguage();

  // 현재 언어에 맞는 텍스트 가져오기 (AI가 이미 번역해준 필드 사용)
  const getLocalizedText = (field: string) => {
    // 현재 언어 필드 (예: name_en, description_ja)
    const key = `${field}_${currentLanguage}` as keyof typeof analysisResult.souvenir;
    const currentLangText = analysisResult.souvenir[key];
    
    if (currentLangText && String(currentLangText).trim() !== "") {
      return currentLangText;
    }

    // 폴백: 한국어
    const fallbackKey = `${field}_ko` as keyof typeof analysisResult.souvenir;
    return analysisResult.souvenir[fallbackKey] || `${field} 정보 없음`;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient colors={["#E63946", "#F77F88"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <LinearGradient colors={["#E63946", "#F77F88"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getUIText(currentLanguage, "searchResult")}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

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
              <Text style={styles.confidenceText}>
                {getUIText(currentLanguage, "accuracy")}: {Math.round(analysisResult.confidence * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 {getUIText(currentLanguage, "price")}</Text>
          <Text style={styles.priceText}>
            {getUIText(currentLanguage, "currencySymbol")} {analysisResult.souvenir.price_range}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 {getUIText(currentLanguage, "description")}</Text>
          <Text style={styles.descriptionText}>
            {getLocalizedText("description")}
          </Text>
        </View>
        {getLocalizedText("usage_tips") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 {getUIText(currentLanguage, "usageTips")}</Text>
            <Text style={styles.descriptionText}>
              {getLocalizedText("usage_tips")}
            </Text>
          </View>
        )}

        {/* Tags */}
        {analysisResult.detected_tags && analysisResult.detected_tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ {getUIText(currentLanguage, "tags")}</Text>
            <View style={styles.tagsContainer}>
              {analysisResult.detected_tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  productHeader: {
    flexDirection: "row",
  },
  productImageContainer: {
    marginRight: 14,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  productImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  productImageText: {
    fontSize: 40,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "700",
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.normal,
  },
  descriptionText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#FFE5E5",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default DetailScreen;
