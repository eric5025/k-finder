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
import * as FileSystem from "expo-file-system";
import { RootStackParamList } from "../types";
import { t } from "../i18n";
import { analyzeImage } from "../services/perplexity";
import { searchSouvenirsByTags, sampleSouvenirs } from "../data/souvenirs";

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

  useEffect(() => {
    processImage();
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
      setStatus("AI 분석 중...");

      let analysisResult;
      try {
        analysisResult = await analyzeImage(base64);
      } catch (aiError) {
        console.log("OpenAI API 오류, 모의 데이터 사용:", aiError);

        // OpenAI API 오류 시 모의 데이터 사용
        setProgress(60);
        setStatus("로컬 데이터 검색 중...");

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

      const relatedSouvenirs = searchSouvenirsByTags(
        analysisResult.detected_tags
      );

      // 4. 검색 결과가 있으면 검색 결과 화면으로, 없으면 상세 화면으로
      setProgress(90);
      setStatus("결과 정리 중...");

      if (relatedSouvenirs.length > 1) {
        // 여러 결과가 있으면 검색 결과 화면으로
        setTimeout(() => {
          navigation.replace("SearchResults", {
            searchResults: relatedSouvenirs,
            searchQuery: analysisResult.souvenir.name_ko,
          });
        }, 500);
      } else {
        // 단일 결과이면 상세 화면으로
        const finalResult = {
          ...analysisResult,
          souvenir: relatedSouvenirs[0] || analysisResult.souvenir,
        };

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
        "이미지 처리 중 오류가 발생했습니다. 대신 모든 기념품 목록을 보여드립니다.",
        [
          {
            text: "확인",
            onPress: () => {
              navigation.replace("SearchResults", {
                searchResults: sampleSouvenirs,
                searchQuery: "기념품",
              });
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#3B82F6", "#8B5CF6"]} style={styles.gradient}>
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
            <Text style={styles.statusText}>{status}</Text>
            <Text style={styles.subStatusText}>잠시만 기다려주세요...</Text>
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
