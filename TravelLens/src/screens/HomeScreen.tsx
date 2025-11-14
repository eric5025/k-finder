import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Image, History } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "../types";
import LanguageDropdown from "../components/LanguageDropdown";
import { useLanguage } from "../contexts/LanguageContext";
import { getUIText } from "../i18n/translations";
import { useSearchLimit } from "../hooks/useSearchLimit";
import { auth } from "../services/firebase";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const DAILY_FREE_LIMIT = 5;
const PREMIUM_PRICE_TEXT = "$4.99";

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPremiumModalVisible, setPremiumModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!(auth.currentUser && !auth.currentUser.isAnonymous)
  );
  const { currentLanguage } = useLanguage();
  const {
    isReady: isLimitReady,
    isPremium,
    remainingCount,
    canUseSearch,
    consumeSearch,
    purchaseUnlimited,
    isProcessingPurchase,
    products,
  } = useSearchLimit();
  const premiumProduct = useMemo(() => products?.[0], [products]);

  const subtitle = getUIText(currentLanguage, "appSubtitle");
  const takePhotoTitle = getUIText(currentLanguage, "takePhoto");
  const selectPhotoTitle = getUIText(currentLanguage, "selectPhoto");
  const premiumPriceText = PREMIUM_PRICE_TEXT;
  const limitDescriptionText = `${getUIText(
    currentLanguage,
    "limitPricePrefix"
  )} ${premiumPriceText} ${getUIText(currentLanguage, "limitPriceSuffix")}`;
  const limitLabelText = isPremium
    ? getUIText(currentLanguage, "premiumUnlimitedLabel")
    : isLimitReady
    ? `${getUIText(currentLanguage, "limitRemainingPrefix")} ${remainingCount} / ${DAILY_FREE_LIMIT}`
    : getUIText(currentLanguage, "limitLoading");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!(user && !user.isAnonymous));
    });
    return unsubscribe;
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const openPremiumModal = () => {
    if (!isLoggedIn) {
      Alert.alert(
        getUIText(currentLanguage, "premiumLoginRequiredTitle"),
        getUIText(currentLanguage, "premiumLoginRequiredMessage"),
        [
          {
            text: getUIText(currentLanguage, "premiumClose"),
            style: "cancel",
          },
          {
            text: getUIText(currentLanguage, "premiumLoginAction"),
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
      return;
    }
    setPremiumModalVisible(true);
  };

  const handleTakePhoto = async () => {
    if (!isPremium && !canUseSearch()) {
      openPremiumModal();
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const creditConsumed = await consumeSearch();
        if (!creditConsumed) {
          openPremiumModal();
          return;
        }
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("오류", "카메라를 사용할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromGallery = async () => {
    if (!isPremium && !canUseSearch()) {
      openPremiumModal();
      return;
    }

    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const creditConsumed = await consumeSearch();
        if (!creditConsumed) {
          openPremiumModal();
          return;
        }
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("오류", "갤러리를 사용할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistory = () => {
    navigation.navigate("History");
  };

  return (
      <LinearGradient colors={["#E63946", "#F77F88"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>Korea</Text>
            <Text style={styles.appName}>Finder</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.headerButtons}>
            <LanguageDropdown />
            <TouchableOpacity 
              onPress={handleHistory} 
              style={styles.historyBtn}
            >
              <History size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Usage Banner */}
        <View style={styles.limitContainer}>
          <View style={styles.limitTextWrapper}>
            <Text style={styles.limitLabel}>{limitLabelText}</Text>
            {!isPremium && (
              <Text style={styles.limitDescription}>{limitDescriptionText}</Text>
            )}
          </View>
          {!isPremium && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={openPremiumModal}
              disabled={isProcessingPurchase}
              activeOpacity={0.8}
            >
              <Text
                style={styles.upgradeButtonText}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {getUIText(currentLanguage, "limitDetailsButton")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Camera Button */}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleTakePhoto}
            disabled={isLoading || !isLimitReady}
            activeOpacity={0.8}
          >
            <Camera size={48} color="#E63946" />
            <Text style={styles.cameraButtonTitle}>{takePhotoTitle}</Text>
            <Text style={styles.cameraButtonDesc}>카메라로 촬영</Text>
          </TouchableOpacity>

        

          {/* Gallery Button */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleSelectFromGallery}
            disabled={isLoading || !isLimitReady}
            activeOpacity={0.8}
          >
            <Image size={48} color="#E63946" />
            <Text style={styles.galleryButtonTitle}>{selectPhotoTitle}</Text>
            <Text style={styles.galleryButtonDesc}>기기에서 선택</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={isPremiumModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPremiumModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalBadge}>
                {getUIText(currentLanguage, "premiumBadge")}
              </Text>
              <Text style={styles.modalTitle}>
                {getUIText(currentLanguage, "premiumTitle")}
              </Text>
              <Text style={styles.modalPrice}>
                {premiumPriceText} / {getUIText(currentLanguage, "premiumLifetime")}
              </Text>
              <Text style={styles.modalSubtitle}>
                {getUIText(currentLanguage, "premiumSubtitle")}
              </Text>

              <View style={styles.modalDivider} />

              {[
                getUIText(currentLanguage, "premiumFeature1"),
                getUIText(currentLanguage, "premiumFeature2"),
                getUIText(currentLanguage, "premiumFeature3"),
              ].map((feature) => (
                <View key={feature} style={styles.modalFeature}>
                  <Text style={styles.modalFeatureBullet}>•</Text>
                  <Text style={styles.modalFeatureText}>{feature}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  isProcessingPurchase && { opacity: 0.7 },
                ]}
                onPress={purchaseUnlimited}
                disabled={isProcessingPurchase}
              >
                <Text style={styles.modalButtonText}>
                  {isProcessingPurchase
                    ? getUIText(currentLanguage, "premiumProcessing")
                    : getUIText(currentLanguage, "premiumUpgradeButton")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setPremiumModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>
                  {getUIText(currentLanguage, "premiumClose")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "flex-start",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 8,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  limitContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  limitTextWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  limitLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  limitDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    minWidth: 80,
  },
  upgradeButtonText: {
    color: "#E63946",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE5E5",
    color: "#E63946",
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1C1C1E",
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E63946",
    marginTop: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    marginTop: 4,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  modalFeature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalFeatureBullet: {
    fontSize: 18,
    marginRight: 8,
    color: "#E63946",
  },
  modalFeatureText: {
    fontSize: 14,
    color: "#3C3C43",
  },
  modalButton: {
    backgroundColor: "#E63946",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  modalCloseButton: {
    alignItems: "center",
    marginTop: 12,
  },
  modalCloseButtonText: {
    color: "#6B6B6B",
    fontSize: 14,
  },
  historyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "flex-start",
    gap: 16,
  },
  cameraButton: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  cameraButtonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E63946",
    marginTop: 12,
  },
  cameraButtonDesc: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#999",
  },
  dividerText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  galleryButton: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 34,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  galleryButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E63946",
    marginTop: 10,
  },
  galleryButtonDesc: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});

export default HomeScreen;
