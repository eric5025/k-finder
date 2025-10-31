import { AnalysisResult } from "../types/index";
import { PERPLEXITY_API_KEY } from "@env";

// Perplexity API 키 (환경 변수에서 가져오기)
const API_KEY = PERPLEXITY_API_KEY;

const validateApiKey = () => {
  if (!API_KEY || API_KEY.length < 10) {
    throw new Error(
      "Perplexity API 키가 설정되지 않았습니다. .env 파일에 PERPLEXITY_API_KEY를 추가해주세요."
    );
  }
  return true;
};

export const analyzeImage = async (
  imageBase64: string
): Promise<AnalysisResult> => {
  try {
    validateApiKey();
    console.log("Perplexity API 호출 시작...");

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `이 이미지를 분석하여 한국 기념품을 식별해주세요. 다음 JSON 형식으로 응답해주세요:
{
  "souvenir": {
    "id": "고유ID",
    "name_ko": "한국어 이름",
    "name_en": "영어 이름", 
    "name_ja": "일본어 이름",
    "name_zh": "중국어 이름",
    "name_es": "스페인어 이름",
    "description_ko": "한국어 설명",
    "description_en": "영어 설명",
    "description_ja": "일본어 설명", 
    "description_zh": "중국어 설명",
    "description_es": "스페인어 설명",
    "category": "food|drink|craft|clothing|beauty|other",
    "price_range": "가격대 (예: 5,000-15,000원)",
    "usage_tips": "사용법이나 팁",
    "image_url": "",
    "tags": ["태그1", "태그2", "태그3"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "confidence": 0.0-1.0,
  "detected_tags": ["감지된 태그들"],
  "translated_content": {
    "name": "현재 언어로 된 이름",
    "description": "현재 언어로 된 설명", 
    "usage_tips": "현재 언어로 된 사용법"
  }
}

이미지에서 한국 기념품, 음식, 제품 등을 정확히 식별하고 상세한 정보를 제공해주세요.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.2,
      }),
    });

    console.log("Perplexity API 응답 상태:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Perplexity API 에러 응답:", errorData);
      throw new Error(`Perplexity API 오류 (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    console.log("Perplexity API 응답 데이터:", data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Perplexity API 응답 형식이 올바르지 않습니다.");
    }

    const content = data.choices[0].message.content;
    console.log("Perplexity API 응답 내용:", content);

    // Perplexity 검색 결과에서 이미지 URL 추출
    let imageUrl = "";
    if (data.search_results && data.search_results.length > 0) {
      // 첫 번째 검색 결과의 URL을 이미지로 사용
      imageUrl = data.search_results[0].url;
    }

    let analysis;
    try {
      // 코드 블록 제거 (```json ... ``` 형식)
      let cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      
      // JSON 부분만 추출 (중괄호로 시작하고 끝나는 부분)
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("JSON 형식을 찾을 수 없습니다.");
      }

      const jsonContent = jsonMatch[0];
      analysis = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.error("원본 응답:", content);
      throw new Error("AI 응답을 파싱할 수 없습니다.");
    }

    // 기본값으로 안전한 souvenir 객체 생성
    const souvenir = {
      id: analysis.souvenir?.id || Date.now().toString(),
      name_ko: analysis.souvenir?.name_ko || "한국 기념품",
      name_en: analysis.souvenir?.name_en || "Korean Souvenir",
      name_ja: analysis.souvenir?.name_ja || "韓国のお土産",
      name_zh: analysis.souvenir?.name_zh || "韩国纪念品",
      name_es: analysis.souvenir?.name_es || "Souvenir Coreano",
      description_ko:
        analysis.souvenir?.description_ko ||
        "사진에서 감지된 한국 기념품입니다.",
      description_en:
        analysis.souvenir?.description_en ||
        "A Korean souvenir detected from the image.",
      description_ja:
        analysis.souvenir?.description_ja ||
        "画像から検出された韓国のお土産です。",
      description_zh:
        analysis.souvenir?.description_zh || "从图片中检测到的韩国纪念品。",
      description_es:
        analysis.souvenir?.description_es ||
        "Un souvenir coreano detectado en la imagen.",
      category: analysis.souvenir?.category || "other",
      price_range: analysis.souvenir?.price_range || "가격 정보 없음",
      usage_tips:
        analysis.souvenir?.usage_tips || "다양한 기념품을 확인해보세요.",
      image_url:
        analysis.souvenir?.image_url ||
        imageUrl ||
        `https://source.unsplash.com/400x300/?${encodeURIComponent(
          analysis.souvenir?.name_ko || "한국 기념품"
        )}`,
      tags: analysis.souvenir?.tags || ["한국", "기념품"],
      created_at: analysis.souvenir?.created_at || new Date().toISOString(),
      updated_at: analysis.souvenir?.updated_at || new Date().toISOString(),
    };

    return {
      souvenir,
      confidence: analysis.confidence || 0.7,
      detected_tags: analysis.detected_tags || ["한국", "기념품"],
      translated_content: analysis.translated_content || {
        name: souvenir.name_ko,
        description: souvenir.description_ko,
        usage_tips: souvenir.usage_tips,
      },
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
};

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  try {
    validateApiKey();

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k",
        messages: [
          {
            role: "user",
            content: `다음 텍스트를 ${targetLanguage}로 번역해주세요: "${text}"`,
          },
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`번역 API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Translation error:", error);
    return text; // 번역 실패시 원본 텍스트 반환
  }
};

export const translateSouvenir = async (
  souvenir: any,
  targetLanguage: string
) => {
  try {
    const translatedSouvenir = { ...souvenir };

    // 이름 번역
    if (souvenir.name_ko) {
      translatedSouvenir[`name_${targetLanguage}`] = await translateText(
        souvenir.name_ko,
        targetLanguage
      );
    }

    // 설명 번역
    if (souvenir.description_ko) {
      translatedSouvenir[`description_${targetLanguage}`] = await translateText(
        souvenir.description_ko,
        targetLanguage
      );
    }

    // 사용법 번역
    if (souvenir.usage_tips) {
      translatedSouvenir.usage_tips = await translateText(
        souvenir.usage_tips,
        targetLanguage
      );
    }

    return translatedSouvenir;
  } catch (error) {
    console.error("Souvenir translation error:", error);
    return souvenir;
  }
};
