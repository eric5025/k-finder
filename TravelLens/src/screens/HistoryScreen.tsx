import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  ArrowLeft,
  Trash2,
  Clock,
  Image as ImageIcon,
} from "lucide-react-native";
import { RootStackParamList } from "../types";
import { t } from "../i18n";
import { COLORS } from "../constants";
import {
  getSearchHistory,
  clearSearchHistory,
  SearchHistoryItem,
} from "../services/searchHistory";
import { getUIText } from "../i18n/translations";
import { useLanguage } from "../contexts/LanguageContext";

type HistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "History"
>;

interface Props {
  navigation: HistoryScreenNavigationProp;
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [historyData, setHistoryData] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentLanguage } = useLanguage();

  // 검색 기록 로드
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getSearchHistory(20);
      console.log("📝 로드된 히스토리:", history);
      console.log("📝 첫 번째 아이템:", history[0]);
      setHistoryData(history);
    } catch (error) {
      console.error("검색 기록 로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClearHistory = () => {
    Alert.alert("히스토리 삭제", "모든 검색 기록을 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await clearSearchHistory();
            setHistoryData([]);
            Alert.alert("완료", "모든 검색 기록이 삭제되었습니다.");
          } catch (error) {
            console.error("검색 기록 삭제 오류:", error);
            Alert.alert("오류", "검색 기록 삭제 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const handleItemPress = (item: any) => {
    // 아이템 클릭 시 상세 화면으로 이동 (나중에 구현)
    Alert.alert("상세 정보", `${item.name}의 상세 정보를 보여줍니다.`);
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert("항목 삭제", "이 항목을 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setHistoryData((prev) => prev.filter((item) => item.id !== itemId));
        },
      },
    ]);
  };

  const formatDate = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      return "날짜 정보 없음";
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "오늘";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "어제";
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      return "";
    }
    
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.historyImage}
              resizeMode="cover"
            />
          ) : (
            <ImageIcon size={24} color={COLORS.textSecondary} />
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.query || "기념품"}
          </Text>
          <Text style={styles.itemPrice} numberOfLines={1}>
            ₩ {item.price || "가격 정보 없음"}
          </Text>
          <View style={styles.itemTime}>
            <Clock size={12} color={COLORS.textSecondary} />
            <Text style={styles.itemTimeText}>
              {formatDate(item.timestamp)} • {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(item.id)}
      >
        <Trash2 size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ImageIcon size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>검색 기록이 없습니다</Text>
      <Text style={styles.emptyStateSubtitle}>
        기념품을 촬영하면 여기에 기록됩니다
      </Text>
    </View>
  );

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
          <Text style={styles.headerTitle}>검색 히스토리</Text>
          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>전체 삭제</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {historyData.length > 0 ? (
          <FlatList
            data={historyData}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          renderEmptyState()
        )}
        </View>
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
  clearButton: {
    padding: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F9F9F9",
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  imageContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  historyImage: {
    width: 52,
    height: 52,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 3,
  },
  itemTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemTimeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default HistoryScreen;
