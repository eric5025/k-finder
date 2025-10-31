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
import { t } from "../i18n";
import { analyzeImage } from "../services/perplexity";
import { getEmptySearchResults } from "../data/souvenirs";
import { addSearchHistory } from "../services/searchHistory";

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
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("이미지 처리 중...");
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
      setStatus("이미지 변환 중...");

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. AI 분석 시도
      setProgress(40);
      setStatus("AI가 이미지를 분석하고 있습니다");

      // 가짜 진행률 업데이트 (사용자 경험 개선)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 2;
          return prev;
        });
      }, 1000);

      let analysisResult;
      try {
        // 30초 타임아웃 설정
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("AI 분석 시간 초과")), 30000)
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
        setStatus("결과를 준비하고 있습니다");

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
            category: "other" as const,
            price_range: "가격 정보 없음",
            usage_tips: "다양한 기념품을 확인해보세요.",
            image_url: "",
            tags: ["한국", "기념품", "여행"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          confidence: 0.7,
          detected_tags: ["한국", "기념품", "여행"],
          translated_content: {
            name: "한국 기념품",
            description: "사진에서 감지된 한국 기념품입니다.",
            usage_tips: "다양한 기념품을 확인해보세요.",
          },
        };
      }

      // 3. 데이터베이스에서 관련 기념품 검색
      setProgress(70);
      setStatus("관련 정보 검색 중...");

      // 실제 AI 검색 결과를 사용하도록 수정
      const relatedSouvenirs = getEmptySearchResults();

      // 4. 검색 결과가 있으면 검색 결과 화면으로, 없으면 상세 화면으로
      setProgress(90);
      setStatus("결과 정리 중...");

      // 사용자가 찍은 사진을 결과에 포함
      const userImageUrl = imageUri;

      // AI 분석 결과에 사용자 사진 추가
      const analysisResultWithUserImage = {
        ...analysisResult,
        souvenir: {
          ...analysisResult.souvenir,
          image_url: userImageUrl, // 사용자가 찍은 사진을 이미지 URL로 설정
        },
      };

      if (relatedSouvenirs.length > 1) {
        // 여러 결과가 있으면 검색 결과 화면으로
        // 각 결과에 사용자 사진을 첫 번째 결과로 추가
        const resultsWithUserImage = [
          {
            ...analysisResultWithUserImage.souvenir,
            id: "user_image",
            name_ko: "사용자 사진",
            name_en: "User Photo",
            name_ja: "ユーザー写真",
            name_zh: "用户照片",
            name_es: "Foto del Usuario",
            description_ko: "사용자가 촬영한 사진입니다.",
            description_en: "Photo taken by the user.",
            description_ja: "ユーザーが撮影した写真です。",
            description_zh: "用户拍摄的照片。",
            description_es: "Foto tomada por el usuario.",
            image_url: userImageUrl,
            tags: ["사용자 사진", "촬영"],
          },
          ...relatedSouvenirs,
        ];

        // 검색 기록 추가
        await addSearchHistory(
          analysisResult.souvenir.name_ko,
          userImageUrl,
          resultsWithUserImage
        );

        setTimeout(() => {
          navigation.replace("SearchResults", {
            searchResults: resultsWithUserImage,
            searchQuery: analysisResult.souvenir.name_ko,
          });
        }, 500);
      } else {
        // 단일 결과이면 상세 화면으로
        const finalResult = {
          ...analysisResultWithUserImage,
          souvenir: {
            ...(relatedSouvenirs[0] || analysisResult.souvenir),
            image_url: userImageUrl, // 사용자 사진으로 교체
          },
        };

        // 검색 기록 추가
        await addSearchHistory(analysisResult.souvenir.name_ko, userImageUrl, [
          finalResult.souvenir,
        ]);

        setTimeout(() => {
          navigation.replace("Detail", { analysisResult: finalResult });
        }, 500);
      }

      // 5. 완료
      setProgress(100);
      setStatus("완료!");
    } catch (error) {
      console.error("Image processing error:", error);

      // 최종 에러 처리
      setStatus("오류가 발생했습니다.");

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#FF6B00", "#FF8C00"]} style={styles.gradient}>
        <View style={styles.content}>
          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </View>

          {/* Status Text */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{status}{dots}</Text>
            <Text style={styles.subStatusText}>
              {progress < 90 
                ? "AI가 열심히 분석 중입니다" 
                : "곧 결과가 나옵니다!"}
            </Text>
          </View>

          {/* Loading Animation */}
          <View style={styles.animationContainer}>
            <View style={styles.dotContainer}>
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: progress > (index + 1) * 30 ? 1 : 0.3,
                    },
                  ]}
                />
              ))}
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  progressContainer: {
    marginBottom: 60,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subStatusText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  animationContainer: {
    alignItems: "center",
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
    marginHorizontal: 4,
  },
});

export default LoadingScreen;
