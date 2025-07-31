import { Language } from "../types";

// 다국어 리소스
const resources = {
  ko: {
    common: {
      appName: "TravelLens",
      loading: "로딩 중...",
      error: "오류가 발생했습니다.",
      retry: "다시 시도",
      cancel: "취소",
      confirm: "확인",
      back: "뒤로",
      next: "다음",
      save: "저장",
      delete: "삭제",
    },
    language: {
      selectLanguage: "언어를 선택하세요",
      korean: "한국어",
      english: "English",
      japanese: "日本語",
      chinese: "中文",
      spanish: "Español",
    },
    camera: {
      takePhoto: "사진 촬영",
      selectFromGallery: "갤러리에서 선택",
      cameraPermission: "카메라 권한이 필요합니다.",
      analyzing: "분석 중입니다...",
      pointAtItem: "기념품을 카메라에 비춰주세요",
    },
    result: {
      name: "이름",
      description: "설명",
      price: "가격",
      category: "카테고리",
      usageTips: "사용 팁",
      whereToBuy: "구매처",
      saveToHistory: "히스토리에 저장",
      share: "공유",
    },
    history: {
      title: "검색 히스토리",
      noHistory: "검색 기록이 없습니다.",
      clearHistory: "히스토리 삭제",
    },
    map: {
      title: "구매처 지도",
      nearbyStores: "주변 상점",
      directions: "길찾기",
    },
  },
  en: {
    common: {
      appName: "TravelLens",
      loading: "Loading...",
      error: "An error occurred.",
      retry: "Retry",
      cancel: "Cancel",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      save: "Save",
      delete: "Delete",
    },
    language: {
      selectLanguage: "Select Language",
      korean: "한국어",
      english: "English",
      japanese: "日本語",
      chinese: "中文",
      spanish: "Español",
    },
    camera: {
      takePhoto: "Take Photo",
      selectFromGallery: "Select from Gallery",
      cameraPermission: "Camera permission is required.",
      analyzing: "Analyzing...",
      pointAtItem: "Point camera at souvenir",
    },
    result: {
      name: "Name",
      description: "Description",
      price: "Price",
      category: "Category",
      usageTips: "Usage Tips",
      whereToBuy: "Where to Buy",
      saveToHistory: "Save to History",
      share: "Share",
    },
    history: {
      title: "Search History",
      noHistory: "No search history.",
      clearHistory: "Clear History",
    },
    map: {
      title: "Store Map",
      nearbyStores: "Nearby Stores",
      directions: "Directions",
    },
  },
  ja: {
    common: {
      appName: "TravelLens",
      loading: "読み込み中...",
      error: "エラーが発生しました。",
      retry: "再試行",
      cancel: "キャンセル",
      confirm: "確認",
      back: "戻る",
      next: "次へ",
      save: "保存",
      delete: "削除",
    },
    language: {
      selectLanguage: "言語を選択してください",
      korean: "한국어",
      english: "English",
      japanese: "日本語",
      chinese: "中文",
      spanish: "Español",
    },
    camera: {
      takePhoto: "写真を撮る",
      selectFromGallery: "ギャラリーから選択",
      cameraPermission: "カメラの許可が必要です。",
      analyzing: "分析中...",
      pointAtItem: "お土産をカメラに向けてください",
    },
    result: {
      name: "名前",
      description: "説明",
      price: "価格",
      category: "カテゴリ",
      usageTips: "使用方法",
      whereToBuy: "購入場所",
      saveToHistory: "履歴に保存",
      share: "共有",
    },
    history: {
      title: "検索履歴",
      noHistory: "検索履歴がありません。",
      clearHistory: "履歴を削除",
    },
    map: {
      title: "店舗マップ",
      nearbyStores: "近くの店舗",
      directions: "ルート案内",
    },
  },
  zh: {
    common: {
      appName: "TravelLens",
      loading: "加载中...",
      error: "发生错误。",
      retry: "重试",
      cancel: "取消",
      confirm: "确认",
      back: "返回",
      next: "下一步",
      save: "保存",
      delete: "删除",
    },
    language: {
      selectLanguage: "选择语言",
      korean: "한국어",
      english: "English",
      japanese: "日本語",
      chinese: "中文",
      spanish: "Español",
    },
    camera: {
      takePhoto: "拍照",
      selectFromGallery: "从相册选择",
      cameraPermission: "需要相机权限。",
      analyzing: "分析中...",
      pointAtItem: "将纪念品对准相机",
    },
    result: {
      name: "名称",
      description: "描述",
      price: "价格",
      category: "类别",
      usageTips: "使用提示",
      whereToBuy: "购买地点",
      saveToHistory: "保存到历史",
      share: "分享",
    },
    history: {
      title: "搜索历史",
      noHistory: "没有搜索历史。",
      clearHistory: "清除历史",
    },
    map: {
      title: "商店地图",
      nearbyStores: "附近商店",
      directions: "路线导航",
    },
  },
  es: {
    common: {
      appName: "TravelLens",
      loading: "Cargando...",
      error: "Ocurrió un error.",
      retry: "Reintentar",
      cancel: "Cancelar",
      confirm: "Confirmar",
      back: "Atrás",
      next: "Siguiente",
      save: "Guardar",
      delete: "Eliminar",
    },
    language: {
      selectLanguage: "Seleccionar Idioma",
      korean: "한국어",
      english: "English",
      japanese: "日本語",
      chinese: "中文",
      spanish: "Español",
    },
    camera: {
      takePhoto: "Tomar Foto",
      selectFromGallery: "Seleccionar de Galería",
      cameraPermission: "Se requiere permiso de cámara.",
      analyzing: "Analizando...",
      pointAtItem: "Apunte la cámara al souvenir",
    },
    result: {
      name: "Nombre",
      description: "Descripción",
      price: "Precio",
      category: "Categoría",
      usageTips: "Consejos de Uso",
      whereToBuy: "Dónde Comprar",
      saveToHistory: "Guardar en Historial",
      share: "Compartir",
    },
    history: {
      title: "Historial de Búsqueda",
      noHistory: "No hay historial de búsqueda.",
      clearHistory: "Borrar Historial",
    },
    map: {
      title: "Mapa de Tiendas",
      nearbyStores: "Tiendas Cercanas",
      directions: "Direcciones",
    },
  },
};

// 현재 언어 상태
let currentLanguage: Language = "ko";

// 언어 변경 함수
export const setLanguage = (language: Language) => {
  currentLanguage = language;
};

// 현재 언어 가져오기
export const getCurrentLanguage = (): Language => {
  return currentLanguage;
};

// 번역 함수
export const t = (key: string): string => {
  const keys = key.split(".");
  let value: any = resources[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key; // 키가 없으면 원본 키 반환
    }
  }

  return typeof value === "string" ? value : key;
};

// 언어별 텍스트 가져오기
export const getText = (key: string, language?: Language): string => {
  const lang = language || currentLanguage;
  const keys = key.split(".");
  let value: any = resources[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  return typeof value === "string" ? value : key;
};

export default { t, setLanguage, getCurrentLanguage, getText };
