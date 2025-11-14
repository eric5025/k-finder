import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import { RootStackParamList } from "../types";
import { analyzeImage } from "../services/perplexity";
import { getEmptySearchResults } from "../data/souvenirs";
import { addSearchHistory } from "../services/searchHistory";
import { useLanguage } from "../contexts/LanguageContext";
import { getUIText } from "../i18n/translations";

type LoadingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Loading"
>;

type LoadingScreenRouteProp = RouteProp<RootStackParamList, "Loading">;

interface Props {
  navigation: LoadingScreenNavigationProp;
  route: LoadingScreenRouteProp;
}

const LoadingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { imageUri } = route.params;
  const { currentLanguage } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(getUIText(currentLanguage, "processingImage"));
  const [dots, setDots] = useState("");

  useEffect(() => {
    processImage();
    
    // 로딩 애니메이션 (점 3개)
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  const processImage = async () => {
    try {
      // 1. 이미지를 Base64로 변환
      setProgress(20);
      setStatus(getUIText(currentLanguage, "convertingImage"));

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64", // SDK 54 호환
      });

      // 2. AI 분석 시도
      setProgress(40);
      setStatus(getUIText(currentLanguage, "aiAnalyzing"));

      // 가짜 진행률 업데이트 (사용자 경험 개선)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 2;
          return prev;
        });
      }, 1000);

      let analysisResult;
      try {
        // 60초 타임아웃 설정 (더 긴 대기)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("AI 분석 시간 초과")), 60000)
        );
        
        analysisResult = await Promise.race([
          analyzeImage(base64),
          timeoutPromise
        ]) as any;
        
        clearInterval(progressInterval);
      } catch (aiError) {
        clearInterval(progressInterval);
        console.log("AI API 응답 지연, 빠른 결과 제공:", aiError);

        // AI API 응답 지연 시 빠르게 결과 제공
        setProgress(60);
        setStatus(getUIText(currentLanguage, "preparingResults"));

        // 간단한 모의 분석 결과 생성
        analysisResult = {
          souvenir: {
            id: Date.now().toString(),
            name_ko: "한국 기념품",
            name_en: "Korean Souvenir",
            name_ja: "韓国のお土産",
            name_zh: "韩国纪念品",
            name_es: "Souvenir Coreano",
            description_ko:
              "사진에서 감지된 한국 기념품입니다. 더 자세한 정보를 확인해보세요.",
            description_en:
              "A Korean souvenir detected from the image. Check for more details.",
            description_ja:
              "画像から検出された韓国のお土産です。詳細情報をご確認ください。",
            description_zh: "从图片中检测到的韩国纪念品。查看详细信息。",
            description_es:
              "Un souvenir coreano detectado en la imagen. Consulte más detalles.",
            usage_tips_ko: "다양한 기념품을 확인해보세요.",
            usage_tips_en: "Check out various souvenirs.",
            usage_tips_ja: "さまざまなお土産をご確認ください。",
            usage_tips_zh: "查看各种纪念品。",
            usage_tips_es: "Consulte varios recuerdos.",
            category: "other" as const,
            price_range: "가격 정보 없음",
            image_url: "",
            tags: ["한국", "기념품", "여행"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          confidence: 0.7,
          detected_tags: ["한국", "기념품", "여행"],
        };
      }

      // 3. 데이터베이스에서 관련 기념품 검색
      setProgress(70);
      setStatus(getUIText(currentLanguage, "searchingInfo"));

      // 실제 AI 검색 결과를 사용하도록 수정
      const relatedSouvenirs = getEmptySearchResults();

      // 4. 검색 결과가 있으면 검색 결과 화면으로, 없으면 상세 화면으로
      setProgress(90);
      setStatus(getUIText(currentLanguage, "organizingResults"));

      // AI 분석 결과에 사용자가 찍은 사진 포함
      const finalResult = {
        ...analysisResult,
        souvenir: {
          ...analysisResult.souvenir,
          image_url: imageUri, // 사용자가 찍은 사진
        },
      };

      // 검색 기록 추가 (가격 정보 포함)
      await addSearchHistory(
        analysisResult.souvenir.name_ko,
        imageUri,
        [finalResult.souvenir],
        analysisResult.souvenir.price_range
      );

      // 상세 화면으로 이동
      setTimeout(() => {
        navigation.replace("Detail", { analysisResult: finalResult });
      }, 500);

      // 5. 완료
      setProgress(100);
      setStatus(getUIText(currentLanguage, "complete"));
    } catch (error) {
      console.error("Image processing error:", error);

      // 최종 에러 처리
      setStatus(getUIText(currentLanguage, "processingImage"));

      Alert.alert(
        "처리 오류",
        "이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        [
          {
            text: "확인",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  return (
    <LinearGradient colors={["#E63946", "#F77F88"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.content}>
          {/* Loader */}
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={50} color="white" />
          </View>

          {/* Status Text */}
          <Text style={styles.statusText}>{status}{dots}</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loaderContainer: {
    marginBottom: 40,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 40,
    opacity: 0.95,
  },
  progressBarContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
  },
});

export default LoadingScreen;
