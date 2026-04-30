import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  LogOut,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Star,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { RootStackParamList } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { getUIText } from "../i18n/translations";
import { useSearchLimit } from "../hooks/useSearchLimit";
import {
  getSearchHistory,
  clearSearchHistory,
  SearchHistoryItem,
} from "../services/searchHistory";

type Nav = StackNavigationProp<RootStackParamList, "Profile">;

interface Props {
  navigation: Nav;
}

const DAILY_FREE_LIMIT = 5;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentLanguage } = useLanguage();
  const {
    isReady,
    isPremium,
    remainingCount,
    purchaseUnlimited,
    restorePurchases,
    isProcessingPurchase,
    products,
  } = useSearchLimit();

  const user = auth.currentUser;
  const isLoggedIn = !!(user && !user.isAnonymous);

  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const premiumProduct = products?.[0];
  const priceText =
    premiumProduct && "localizedPrice" in premiumProduct
      ? (premiumProduct.localizedPrice as string)
      : "$4.99";

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const data = await getSearchHistory(5);
      setHistory(data);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleAllHistory = () => {
    navigation.navigate("History");
  };

  const handleClearHistory = () => {
    Alert.alert("기록 삭제", "모든 검색 기록을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await clearSearchHistory();
          setHistory([]);
        },
      },
    ]);
  };

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        getUIText(currentLanguage, "premiumLoginRequiredTitle"),
        getUIText(currentLanguage, "premiumLoginRequiredMessage"),
        [
          { text: "취소", style: "cancel" },
          { text: "로그인", onPress: handleLogin },
        ]
      );
      return;
    }
    await purchaseUnlimited();
  };

  const formatDate = (timestamp: number | string | undefined) => {
    if (!timestamp) return "";
    const d = new Date(
      typeof timestamp === "string" ? timestamp : timestamp
    );
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const bottomPad = Math.max(insets.bottom, 16);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 프로필</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 유저 카드 ── */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={32} color="#E63946" />
              </View>
            )}
            {isPremium && (
              <View style={styles.premiumBadgeIcon}>
                <Star size={12} color="white" fill="white" />
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            {isLoggedIn ? (
              <>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.displayName || "사용자"}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || ""}
                </Text>
                {isPremium ? (
                  <View style={styles.premiumTag}>
                    <Sparkles size={11} color="#E63946" />
                    <Text style={styles.premiumTagText}>프리미엄 회원</Text>
                  </View>
                ) : (
                  <View style={styles.freeTag}>
                    <Text style={styles.freeTagText}>무료 회원</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.userName}>비로그인 상태</Text>
                <Text style={styles.userEmail}>로그인이 필요합니다</Text>
              </>
            )}
          </View>
          {isLoggedIn ? (
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={18} color="#8E8E93" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>로그인</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 이용 패스 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <ShieldCheck size={14} color="#E63946" /> 이용 패스
          </Text>
          {isPremium ? (
            <View style={styles.passCard}>
              <View style={styles.passCardLeft}>
                <Text style={styles.passCardTitle}>프리미엄 패스 ✨</Text>
                <Text style={styles.passCardSub}>무제한 AI 분석 사용 중</Text>
              </View>
              <View style={styles.passActiveBadge}>
                <Text style={styles.passActiveBadgeText}>활성</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.passCard}>
                <View style={styles.passCardLeft}>
                  <Text style={styles.passCardTitle}>무료 플랜</Text>
                  {isReady ? (
                    <Text style={styles.passCardSub}>
                      오늘 남은 검색:{" "}
                      <Text style={styles.passCountText}>
                        {remainingCount} / {DAILY_FREE_LIMIT}
                      </Text>
                    </Text>
                  ) : (
                    <ActivityIndicator size="small" color="#E63946" />
                  )}
                </View>
                <View style={styles.passProgressWrap}>
                  <View style={styles.passProgressBg}>
                    <View
                      style={[
                        styles.passProgressFill,
                        {
                          width: `${(remainingCount / DAILY_FREE_LIMIT) * 100}%`,
                          backgroundColor:
                            remainingCount <= 1 ? "#EF4444" : "#E63946",
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.upgradeBtn,
                  isProcessingPurchase && { opacity: 0.7 },
                ]}
                onPress={handlePurchase}
                disabled={isProcessingPurchase}
              >
                <Sparkles size={16} color="white" />
                <Text style={styles.upgradeBtnText}>
                  {isProcessingPurchase
                    ? "처리 중..."
                    : `프리미엄으로 업그레이드 · ${priceText}`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.restoreBtn}
                onPress={restorePurchases}
                disabled={isProcessingPurchase}
              >
                <Text style={styles.restoreBtnText}>구매 복원</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── 검색 기록 ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              <Clock size={14} color="#E63946" /> 최근 검색 기록
            </Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity onPress={handleAllHistory}>
                <Text style={styles.sectionLink}>전체 보기</Text>
              </TouchableOpacity>
              {history.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearHistory}
                  style={{ marginLeft: 12 }}
                >
                  <Text style={[styles.sectionLink, { color: "#EF4444" }]}>
                    삭제
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {historyLoading ? (
            <ActivityIndicator
              size="small"
              color="#E63946"
              style={{ marginTop: 16 }}
            />
          ) : history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>
                아직 검색 기록이 없습니다
              </Text>
            </View>
          ) : (
            history.map((item, idx) => (
              <View key={item.id || idx} style={styles.historyItem}>
                {item.imageUri ? (
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.historyThumb}
                  />
                ) : (
                  <View style={styles.historyThumbPlaceholder}>
                    <Text style={{ fontSize: 18 }}>🖼️</Text>
                  </View>
                )}
                <View style={styles.historyText}>
                  <Text style={styles.historyName} numberOfLines={1}>
                    {item.result?.souvenir?.name_ko ||
                      item.result?.souvenir?.name_en ||
                      "분석 결과"}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatDate(item.timestamp)}
                  </Text>
                </View>
                <ChevronRight size={16} color="#C7C7CC" />
              </View>
            ))
          )}
        </View>

        {/* ── 앱 정보 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>버전</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>개발</Text>
            <Text style={styles.infoValue}>Korea Finder Team</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#E5D4CE" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2D2420",
    letterSpacing: -0.4,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  /* 유저 카드 */
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarWrap: { position: "relative" },
  avatarImg: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F0E8E6",
  },
  avatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFE5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumBadgeIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E63946",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "700", color: "#1C1C1E" },
  userEmail: { fontSize: 12, color: "#8E8E93", marginTop: 2 },
  premiumTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  premiumTagText: { fontSize: 11, fontWeight: "700", color: "#E63946" },
  freeTag: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  freeTagText: { fontSize: 11, fontWeight: "600", color: "#8E8E93" },
  logoutBtn: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "#F5F5F5",
  },
  loginBtn: {
    backgroundColor: "#E63946",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loginBtnText: { color: "white", fontWeight: "700", fontSize: 13 },

  /* 섹션 공통 */
  section: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2D2420",
    marginBottom: 12,
  },
  sectionActions: { flexDirection: "row", alignItems: "center" },
  sectionLink: { fontSize: 13, fontWeight: "600", color: "#E63946" },

  /* 패스 카드 */
  passCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  passCardLeft: { flex: 1 },
  passCardTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  passCardSub: { fontSize: 12, color: "#6B6B6B", marginTop: 4 },
  passCountText: { fontWeight: "800", color: "#E63946" },
  passActiveBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  passActiveBadgeText: { fontSize: 12, fontWeight: "700", color: "#16A34A" },
  passProgressWrap: { marginTop: 8 },
  passProgressBg: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    width: 70,
    overflow: "hidden",
  },
  passProgressFill: { height: 4, borderRadius: 2 },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E63946",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  upgradeBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  restoreBtn: { alignItems: "center", marginTop: 10 },
  restoreBtnText: { fontSize: 13, color: "#8E8E93" },

  /* 검색 기록 */
  emptyHistory: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyHistoryText: { fontSize: 13, color: "#C7C7CC" },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  historyThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  historyThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  historyText: { flex: 1 },
  historyName: { fontSize: 14, fontWeight: "600", color: "#1C1C1E" },
  historyDate: { fontSize: 11, color: "#8E8E93", marginTop: 2 },

  /* 앱 정보 */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: { fontSize: 14, color: "#6B6B6B" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#1C1C1E" },
});

export default ProfileScreen;
