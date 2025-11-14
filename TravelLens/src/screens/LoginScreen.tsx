import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { LogIn, Chrome } from "lucide-react-native";
import { RootStackParamList } from "../types";
import { t } from "../i18n";
import { signInWithGoogle, signInAnonymously } from "../services/auth";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      
      // 로그인 성공!
      Alert.alert("로그인 성공", "Google 계정으로 로그인되었습니다.", [
        {
          text: "확인",
          onPress: () => navigation.replace("Home"),
        },
      ]);
    } catch (error: any) {
      console.error("❌ Google 로그인 오류:", error);
      Alert.alert("로그인 실패", error.message || "Google 로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleSkip = async () => {
    try {
      setIsLoading(true);
      // 익명 로그인 실행
      await signInAnonymously();
      navigation.replace("Home");
    } catch (error: any) {
      console.error("익명 로그인 오류:", error);
      // 실패해도 홈으로 이동
      navigation.replace("Home");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#E63946", "#F77F88"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Korea Finder</Text>
            <Text style={styles.subtitle}>
              한국 기념품을 살땐? Korea Finder!
            </Text>
          </View>

          {/* Login Buttons */}
          <View style={styles.loginContainer}>
            {/* Google Login */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <View style={styles.buttonContent}>
                <Chrome size={24} color="#FF6B00" />
                <Text style={styles.buttonText}>Google로 로그인</Text>
              </View>
            </TouchableOpacity>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.loadingText}>로그인 중...</Text>
              </View>
            )}
          </View>

          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>나중에 하기</Text>
          </TouchableOpacity>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>로그인 혜택</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>검색 기록 저장</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>유료 결제 가능</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginTop: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "white",
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 22,
  },
  loginContainer: {
    gap: 12,
  },
  loginButton: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E63946",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    color: "white",
    fontSize: 13,
  },
  skipButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    fontWeight: "500",
  },
  benefitsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  benefitsTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitIcon: {
    color: "#FFD89B",
    fontSize: 16,
    marginRight: 10,
    fontWeight: "bold",
  },
  benefitText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
  },
});

export default LoginScreen;

