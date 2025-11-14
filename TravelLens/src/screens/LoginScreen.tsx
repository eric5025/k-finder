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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#FF6B00", "#FF8C00"]} style={styles.gradient}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <LogIn size={60} color="white" />
            <Text style={styles.title}>TravelLens</Text>
            <Text style={styles.subtitle}>
              한국 기념품을 찾는 가장 쉬운 방법
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
              <Text style={styles.benefitText}>모든 기기에서 동기화</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  loginContainer: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B00",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  loadingText: {
    color: "white",
    fontSize: 14,
  },
  skipButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  benefitsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
  },
  benefitsTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitIcon: {
    color: "white",
    fontSize: 18,
    marginRight: 10,
  },
  benefitText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
});

export default LoginScreen;

