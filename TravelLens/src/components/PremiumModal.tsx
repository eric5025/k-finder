import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Check, Star, Zap, Globe, Download } from "lucide-react-native";

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: "monthly" | "yearly") => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  onSubscribe,
}) => {
  const handleSubscribe = (plan: "monthly" | "yearly") => {
    Alert.alert(
      "프리미엄 구독",
      `${plan === "monthly" ? "월" : "연"} 구독을 시작하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "구독하기",
          onPress: () => {
            onSubscribe(plan);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={["#3B82F6", "#8B5CF6"]} style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>🚀 TravelLens Premium</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              무제한 번역과 고급 기능을 경험하세요
            </Text>

            {/* 무료 vs 프리미엄 비교 */}
            <View style={styles.comparisonContainer}>
              <View style={styles.planCard}>
                <Text style={styles.planTitle}>무료</Text>
                <Text style={styles.planPrice}>₩0</Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>일일 10회 번역</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>기본 이미지 인식</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>5개 언어 지원</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.planCard, styles.premiumCard]}>
                <View style={styles.premiumBadge}>
                  <Star size={16} color="white" />
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
                <Text style={styles.planTitle}>프리미엄</Text>
                <Text style={styles.planPrice}>₩5,900/월</Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>무제한 번역</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>고화질 이미지 인식</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>15개 언어 지원</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>오프라인 모드</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>광고 제거</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>우선 지원</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 구독 옵션 */}
            <View style={styles.subscriptionOptions}>
              <TouchableOpacity
                style={[styles.subscriptionButton, styles.monthlyButton]}
                onPress={() => handleSubscribe("monthly")}
              >
                <Text style={styles.subscriptionTitle}>월 구독</Text>
                <Text style={styles.subscriptionPrice}>₩5,900/월</Text>
                <Text style={styles.subscriptionDescription}>
                  언제든지 취소 가능
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subscriptionButton, styles.yearlyButton]}
                onPress={() => handleSubscribe("yearly")}
              >
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>33% 할인</Text>
                </View>
                <Text style={styles.subscriptionTitle}>연 구독</Text>
                <Text style={styles.subscriptionPrice}>₩39,900/년</Text>
                <Text style={styles.subscriptionDescription}>
                  월 ₩3,325 (연간 결제)
                </Text>
              </TouchableOpacity>
            </View>

            {/* 추가 정보 */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                • 구독은 언제든지 취소할 수 있습니다
              </Text>
              <Text style={styles.infoText}>
                • 결제는 App Store 계정으로 청구됩니다
              </Text>
              <Text style={styles.infoText}>• 구독은 자동으로 갱신됩니다</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: "80%",
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  comparisonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  premiumCard: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  premiumBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B82F6",
    marginBottom: 16,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
  },
  subscriptionOptions: {
    gap: 12,
    marginBottom: 20,
  },
  subscriptionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    position: "relative",
  },
  monthlyButton: {
    backgroundColor: "white",
  },
  yearlyButton: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  savingsBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subscriptionPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B82F6",
    marginBottom: 4,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoContainer: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
});

export default PremiumModal;
