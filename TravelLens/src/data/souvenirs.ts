import { Souvenir } from "../types";

export const sampleSouvenirs: Souvenir[] = [
  {
    id: "1",
    name_ko: "고추장",
    name_en: "Gochujang (Korean Red Pepper Paste)",
    name_ja: "コチュジャン",
    name_zh: "辣椒酱",
    name_es: "Pasta de Pimiento Rojo Coreana",
    description_ko:
      "한국의 대표적인 양념 중 하나로, 매콤달콤한 맛이 특징입니다. 비빔밥, 불고기, 김치 등 다양한 한국 요리에 사용됩니다.",
    description_en:
      "A traditional Korean condiment made from red chili peppers, glutinous rice, fermented soybeans, and salt. It has a sweet and spicy flavor.",
    description_ja:
      "韓国の代表的な調味料の一つで、甘辛い味が特徴です。ビビンバ、プルゴギ、キムチなど様々な韓国料理に使用されます。",
    description_zh:
      "韩国的代表性调味料之一，具有甜辣味道。用于拌饭、烤肉、泡菜等各种韩国料理。",
    description_es:
      "Un condimento tradicional coreano hecho de pimientos rojos, arroz glutinoso, soja fermentada y sal. Tiene un sabor dulce y picante.",
    category: "food",
    price_range: "3,000원 - 8,000원",
    usage_tips:
      "비빔밥에 넣거나 고기구이 양념으로 사용하세요. 처음에는 적은 양부터 시작하는 것을 권장합니다.",
    image_url: "https://example.com/gochujang.jpg",
    tags: ["양념", "고추장", "한국음식", "비빔밥"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name_ko: "인삼차",
    name_en: "Ginseng Tea",
    name_ja: "高麗人参茶",
    name_zh: "人参茶",
    name_es: "Té de Ginseng",
    description_ko:
      "한국의 대표적인 건강 음료로, 피로 회복과 면역력 증진에 도움이 됩니다.",
    description_en:
      "A traditional Korean health drink made from ginseng root. It helps with fatigue recovery and boosts immunity.",
    description_ja:
      "韓国の代表的な健康飲料で、疲労回復と免疫力向上に役立ちます。",
    description_zh: "韩国的代表性健康饮品，有助于恢复疲劳和提高免疫力。",
    description_es:
      "Una bebida saludable tradicional coreana hecha de raíz de ginseng. Ayuda con la recuperación de la fatiga y aumenta la inmunidad.",
    category: "food",
    price_range: "5,000원 - 15,000원",
    usage_tips:
      "아침이나 오후에 따뜻하게 마시면 좋습니다. 과다 섭취는 피하세요.",
    image_url: "https://example.com/ginseng-tea.jpg",
    tags: ["차", "인삼", "건강음료", "면역력"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name_ko: "한복",
    name_en: "Hanbok (Traditional Korean Dress)",
    name_ja: "韓服",
    name_zh: "韩服",
    name_es: "Hanbok (Vestido Tradicional Coreano)",
    description_ko:
      "한국의 전통 의상으로, 아름다운 색상과 선이 특징입니다. 명절이나 특별한 날에 착용합니다.",
    description_en:
      "Traditional Korean clothing characterized by beautiful colors and lines. Worn on holidays and special occasions.",
    description_ja:
      "韓国の伝統衣装で、美しい色と線が特徴です。祝日や特別な日に着用します。",
    description_zh:
      "韩国的传统服装，以美丽的色彩和线条为特色。在节日或特殊日子穿着。",
    description_es:
      "Ropa tradicional coreana caracterizada por hermosos colores y líneas. Se usa en días festivos y ocasiones especiales.",
    category: "traditional",
    price_range: "50,000원 - 200,000원",
    usage_tips:
      "명절이나 결혼식 등 특별한 날에 착용합니다. 착용법을 미리 배우는 것을 권장합니다.",
    image_url: "https://example.com/hanbok.jpg",
    tags: ["전통의상", "한복", "명절", "결혼식"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name_ko: "마스크팩",
    name_en: "Sheet Mask",
    name_ja: "シートマスク",
    name_zh: "面膜",
    name_es: "Mascarilla Facial",
    description_ko:
      "한국의 대표적인 화장품으로, 피부 보습과 영양 공급에 효과적입니다.",
    description_en:
      "A popular Korean skincare product that effectively moisturizes and nourishes the skin.",
    description_ja: "韓国の代表的な化粧品で、肌の保湿と栄養供給に効果的です。",
    description_zh: "韩国的代表性化妆品，有效保湿和滋养肌肤。",
    description_es:
      "Un producto de cuidado de la piel coreano popular que hidrata y nutre efectivamente la piel.",
    category: "cosmetics",
    price_range: "1,000원 - 5,000원",
    usage_tips:
      "세안 후 15-20분간 착용하세요. 일주일에 2-3회 사용하는 것을 권장합니다.",
    image_url: "https://example.com/sheet-mask.jpg",
    tags: ["화장품", "마스크팩", "보습", "피부케어"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name_ko: "삼성 갤럭시",
    name_en: "Samsung Galaxy",
    name_ja: "サムスンギャラクシー",
    name_zh: "三星Galaxy",
    name_es: "Samsung Galaxy",
    description_ko:
      "한국의 대표적인 스마트폰 브랜드로, 혁신적인 기술과 우수한 품질로 세계적으로 인정받고 있습니다.",
    description_en:
      "A leading Korean smartphone brand known for innovative technology and excellent quality worldwide.",
    description_ja:
      "韓国の代表的なスマートフォンブランドで、革新的な技術と優れた品質で世界的に認められています。",
    description_zh: "韩国的代表性智能手机品牌，以创新技术和优秀品质享誉全球。",
    description_es:
      "Una marca líder de smartphones coreana conocida por su tecnología innovadora y excelente calidad en todo el mundo.",
    category: "electronics",
    price_range: "500,000원 - 1,500,000원",
    usage_tips:
      "구매 시 보증서와 정품 인증을 확인하세요. 정품 서비스센터를 이용하는 것을 권장합니다.",
    image_url: "https://example.com/samsung-galaxy.jpg",
    tags: ["스마트폰", "삼성", "갤럭시", "전자제품"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// 태그로 기념품 검색
export const searchSouvenirsByTags = (tags: string[]): Souvenir[] => {
  return sampleSouvenirs.filter((souvenir) =>
    tags.some((tag) =>
      souvenir.tags.some((souvenirTag) =>
        souvenirTag.toLowerCase().includes(tag.toLowerCase())
      )
    )
  );
};

// 카테고리로 기념품 검색
export const searchSouvenirsByCategory = (category: string): Souvenir[] => {
  return sampleSouvenirs.filter((souvenir) => souvenir.category === category);
};

// ID로 기념품 검색
export const getSouvenirById = (id: string): Souvenir | undefined => {
  return sampleSouvenirs.find((souvenir) => souvenir.id === id);
};
