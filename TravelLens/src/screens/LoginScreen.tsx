import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Chrome, Sparkles, MapPin, Camera } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { getUIText } from "../i18n/translations";
import LanguageDropdown from "../components/LanguageDropdown";
import { useLanguage } from "../contexts/LanguageContext";
import { signInWithGoogle, signInAnonymously } from "../services/auth";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const FEATURES = [
  { icon: Camera,   labelKey: "loginBenefitHistory" as const },
  { icon: MapPin,   labelKey: "loginBenefitPremium" as const },
  { icon: Sparkles, labelKey: "loginBenefits" as const },
];

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      Alert.alert("로그인 성공", "Google 계정으로 로그인되었습니다.", [
        { text: "확인", onPress: () => navigation.replace("Home") },
      ]);
    } catch (error: any) {
      Alert.alert("로그인 실패", error.message || "Google 로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await signInAnonymously();
    } catch {}
    setIsLoading(false);
    navigation.replace("Home");
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── 상단 히어로 (명동 사진 + 오버레이) ── */}
      <ImageBackground
        source={require("../../assets/myeongdong.png")}
        style={styles.hero}
        imageStyle={styles.heroImg}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.25)", "rgba(45,36,32,0.92)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* 언어 선택 */}
        <View style={[styles.langWrap, { paddingTop: insets.top + 12 }]}>
          <LanguageDropdown tone="dark" />
        </View>

        {/* 브랜드 */}
        <View style={styles.brandWrap}>
          <Text style={styles.brandName}>Korea Finder</Text>
          <Text style={styles.brandSub}>
            {getUIText(currentLanguage, "appSubtitle")}
          </Text>
        </View>
      </ImageBackground>

      {/* ── 하단 카드 ── */}
      <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, 24) }]}>

        {/* 특징 3줄 */}
        <View style={styles.featureRow}>
          {FEATURES.map(({ icon: Icon, labelKey }) => (
            <View key={labelKey} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Icon size={20} color="#E63946" />
              </View>
              <Text style={styles.featureLabel} numberOfLines={2}>
                {getUIText(currentLanguage, labelKey)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Google 로그인 */}
        <TouchableOpacity
          style={[styles.googleBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
          activeOpacity={0.88}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#E63946" />
          ) : (
            <Chrome size={22} color="#E63946" />
          )}
          <Text style={styles.googleBtnText}>
            {isLoading
              ? getUIText(currentLanguage, "loginLoggingIn")
              : getUIText(currentLanguage, "loginGoogle")}
          </Text>
        </TouchableOpacity>

        {/* 건너뛰기 */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={handleSkip}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>
            {getUIText(currentLanguage, "loginSkip")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          계속 진행하면 서비스 이용약관에 동의하는 것으로 간주됩니다.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#2D2420",
  },

  /* 히어로 */
  hero: {
    flex: 1,
    justifyContent: "flex-end",
  },
  heroImg: {
    resizeMode: "cover",
  },
  langWrap: {
    position: "absolute",
    top: 0,
    right: 16,
  },
  brandWrap: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  brandName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  /* 하단 카드 */
  card: {
    backgroundColor: "#E5D4CE",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    marginTop: -24,
  },

  /* 특징 */
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  featureItem: {
    alignItems: "center",
    width: 90,
    gap: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4A3F3A",
    textAlign: "center",
    lineHeight: 15,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginBottom: 20,
  },

  /* Google 버튼 */
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
  },

  /* 건너뛰기 */
  skipBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B5E58",
  },

  disclaimer: {
    fontSize: 10,
    color: "#9C8F8A",
    textAlign: "center",
    lineHeight: 15,
  },
});

export default LoginScreen;
