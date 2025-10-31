import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { ArrowLeft, Filter, Star } from "lucide-react-native";
import { RootStackParamList, Souvenir } from "../types";
import { t, getCurrentLanguage } from "../i18n";
import { COLORS, CATEGORIES } from "../constants";
import StarRating from "../components/StarRating";

type SearchResultsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SearchResults"
>;

type SearchResultsScreenRouteProp = RouteProp<
  RootStackParamList,
  "SearchResults"
>;

interface Props {
  navigation: SearchResultsScreenNavigationProp;
  route: SearchResultsScreenRouteProp;
}

const SearchResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { searchResults, searchQuery } = route.params;
  const currentLanguage = getCurrentLanguage();
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const handleBack = () => {
    navigation.goBack();
  };

  const handleImageLoad = (itemId: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [itemId]: false }));
  };

  const handleImageError = (itemId: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [itemId]: false }));
  };

  const handleImageLoadStart = (itemId: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [itemId]: true }));
  };

  const handleSouvenirPress = (souvenir: Souvenir) => {
    // 상세 화면으로 이동
    navigation.navigate("Detail", {
      analysisResult: {
        souvenir,
        confidence: 0.95,
        detected_tags: souvenir.tags,
        translated_content: {
          name: souvenir[`name_${currentLanguage}` as keyof Souvenir] as string,
          description: souvenir[
            `description_${currentLanguage}` as keyof Souvenir
          ] as string,
          usage_tips: souvenir.usage_tips,
        },
      },
    });
  };

  const renderSouvenirItem = ({ item }: { item: Souvenir }) => {
    // 현재 언어에 맞는 텍스트 가져오기
    const localizedName =
      item[`name_${currentLanguage}` as keyof Souvenir] || item.name_ko;
    const localizedDescription =
      item[`description_${currentLanguage}` as keyof Souvenir] ||
      item.description_ko;

    return (
      <TouchableOpacity
        style={styles.souvenirItem}
        onPress={() => handleSouvenirPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.souvenirImageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.souvenirImage}
              resizeMode="cover"
              onLoad={() => handleImageLoad(item.id)}
              onError={() => handleImageError(item.id)}
              onLoadStart={() => handleImageLoadStart(item.id)}
            />
          ) : (
            <View style={styles.souvenirImagePlaceholder}>
              <Text style={styles.souvenirImageText}>📸</Text>
            </View>
          )}
        </View>

        <View style={styles.souvenirInfo}>
          <Text style={styles.souvenirName}>{localizedName}</Text>
          <Text style={styles.souvenirDescription} numberOfLines={2}>
            {localizedDescription}
          </Text>
          <View style={styles.souvenirMeta}>
            <View style={styles.metaRow}>
              <Text style={styles.category}>
                {CATEGORIES[item.category]?.icon}{" "}
                {CATEGORIES[item.category]?.name}
              </Text>
              <StarRating rating={4.5} size={14} />
            </View>
            <Text style={styles.price}>{item.price_range}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
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
          <View style={styles.searchInfo}>
            <Text style={styles.searchTitle}>{t("search.results")}</Text>
            <Text style={styles.searchQuery}>"{searchQuery}"</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Results */}
      <View style={styles.content}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {t("search.foundResults", { count: searchResults.length })}
          </Text>
        </View>

        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSouvenirItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>{t("search.noResults")}</Text>
            <Text style={styles.emptyDescription}>
              {t("search.noResultsDescription")}
            </Text>
          </View>
        )}
      </View>
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
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  searchInfo: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  searchQuery: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  souvenirItem: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  souvenirImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  souvenirImage: {
    width: "100%",
    height: "100%",
  },
  souvenirImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  souvenirImageText: {
    fontSize: 24,
  },
  souvenirInfo: {
    flex: 1,
  },
  souvenirName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  souvenirDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  souvenirMeta: {
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  price: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default SearchResultsScreen;
