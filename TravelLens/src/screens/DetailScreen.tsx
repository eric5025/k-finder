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
import { getCurrentLanguage } from "../i18n";
import { COLORS, CATEGORIES } from "../constants";

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

  // 현재 언어에 맞는 텍스트 가져오기
  const getLocalizedText = (field: string) => {
    if (
      analysisResult.translated_content &&
      field in analysisResult.translated_content
    ) {
      return analysisResult.translated_content[
        field as keyof typeof analysisResult.translated_content
      ];
    }

    const key =
      `${field}_${currentLanguage}` as keyof typeof analysisResult.souvenir;
    const fallbackKey = `${field}_ko` as keyof typeof analysisResult.souvenir;
    return analysisResult.souvenir[key] || analysisResult.souvenir[fallbackKey];
  };

  const handleBack = () => {
    navigation.goBack();
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
          <Text style={styles.headerTitle}>검색 결과</Text>
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
                정확도: {Math.round(analysisResult.confidence * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 가격</Text>
          <Text style={styles.priceText}>
            {analysisResult.souvenir.price_range}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 설명</Text>
          <Text style={styles.descriptionText}>
            {getLocalizedText("description")}
          </Text>
        </View>

        {/* Tags */}
        {analysisResult.detected_tags && analysisResult.detected_tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ 태그</Text>
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
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  productImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  productImageText: {
    fontSize: 40,
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
  confidenceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#FFF5E6",
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
    fontWeight: "500",
  },
});

export default DetailScreen;
