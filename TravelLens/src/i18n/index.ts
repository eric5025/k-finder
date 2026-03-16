import { Language } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_STORAGE_KEY = "@travellens_language";

// 다국어 리소스
const resources: Record<string, any> = {
  ko: {
    common: {
      appName: "Korea Finder",
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
      title: "분석 결과",
      name: "이름",
      description: "설명",
      price: "가격 정보",
      category: "카테고리",
      usageTips: "사용 팁",
      whereToBuy: "구매처 찾기",
      saveToHistory: "히스토리에 저장",
      share: "공유",
      accuracy: "정확도",
      tags: "태그",
    },
    history: {
      title: "검색 히스토리",
      noHistory: "검색 기록이 없습니다.",
      clearHistory: "히스토리 삭제",
      saved: "히스토리에 저장되었습니다.",
    },
    map: {
      title: "구매처 지도",
      nearbyStores: "주변 상점",
      directions: "길찾기",
    },
    favorites: {
      added: "즐겨찾기에 추가되었습니다.",
      removed: "즐겨찾기에서 제거되었습니다.",
      error: "즐겨찾기 처리 중 오류가 발생했습니다.",
    },
    share: {
      comingSoon: "공유 기능은 추후 구현 예정입니다.",
    },
    search: {
      results: "검색 결과",
      foundResults: "{{count}}개의 결과를 찾았습니다",
      noResults: "검색 결과가 없습니다",
      noResultsDescription:
        "다른 키워드로 검색해보시거나, 카메라로 기념품을 촬영해보세요.",
    },
  },
  en: {
    common: {
      appName: "Korea Finder",
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
      title: "Analysis Result",
      name: "Name",
      description: "Description",
      price: "Price Information",
      category: "Category",
      usageTips: "Usage Tips",
      whereToBuy: "Find Store",
      saveToHistory: "Save to History",
      share: "Share",
      accuracy: "Accuracy",
      tags: "Tags",
    },
    history: {
      title: "Search History",
      noHistory: "No search history.",
      clearHistory: "Clear History",
      saved: "Saved to history.",
    },
    map: {
      title: "Store Map",
      nearbyStores: "Nearby Stores",
      directions: "Directions",
    },
    favorites: {
      added: "Added to favorites.",
      removed: "Removed from favorites.",
      error: "Error occurred while processing favorites.",
    },
    share: {
      comingSoon: "Share feature will be implemented soon.",
    },
    search: {
      results: "Search Results",
      foundResults: "Found {{count}} results",
      noResults: "No search results",
      noResultsDescription:
        "Try searching with different keywords or take a photo of a souvenir with the camera.",
    },
  },
  ja: {
    common: {
      appName: "Korea Finder",
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
      title: "分析結果",
      name: "名前",
      description: "説明",
      price: "価格情報",
      category: "カテゴリ",
      usageTips: "使用方法",
      whereToBuy: "購入場所を探す",
      saveToHistory: "履歴に保存",
      share: "共有",
      accuracy: "精度",
      tags: "タグ",
    },
    history: {
      title: "検索履歴",
      noHistory: "検索履歴がありません。",
      clearHistory: "履歴を削除",
      saved: "履歴に保存されました。",
    },
    map: {
      title: "店舗マップ",
      nearbyStores: "近くの店舗",
      directions: "ルート案内",
    },
    favorites: {
      added: "お気に入りに追加されました。",
      removed: "お気に入りから削除されました。",
      error: "お気に入りの処理中にエラーが発生しました。",
    },
    share: {
      comingSoon: "共有機能は今後実装予定です。",
    },
    search: {
      results: "検索結果",
      foundResults: "{{count}}件の結果が見つかりました",
      noResults: "検索結果がありません",
      noResultsDescription:
        "別のキーワードで検索するか、カメラでお土産を撮影してみてください。",
    },
  },
  zh: {
    common: {
      appName: "Korea Finder",
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
      title: "分析结果",
      name: "名称",
      description: "描述",
      price: "价格信息",
      category: "类别",
      usageTips: "使用提示",
      whereToBuy: "查找购买地点",
      saveToHistory: "保存到历史",
      share: "分享",
      accuracy: "准确度",
      tags: "标签",
    },
    history: {
      title: "搜索历史",
      noHistory: "没有搜索历史。",
      clearHistory: "清除历史",
      saved: "已保存到历史。",
    },
    map: {
      title: "商店地图",
      nearbyStores: "附近商店",
      directions: "路线导航",
    },
    favorites: {
      added: "已添加到收藏。",
      removed: "已从收藏中移除。",
      error: "处理收藏时发生错误。",
    },
    share: {
      comingSoon: "分享功能将在稍后实现。",
    },
    search: {
      results: "搜索结果",
      foundResults: "找到 {{count}} 个结果",
      noResults: "没有搜索结果",
      noResultsDescription: "尝试使用不同的关键词搜索，或者用相机拍摄纪念品。",
    },
  },
  es: {
    common: {
      appName: "Korea Finder",
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
      title: "Resultado del Análisis",
      name: "Nombre",
      description: "Descripción",
      price: "Información de Precio",
      category: "Categoría",
      usageTips: "Consejos de Uso",
      whereToBuy: "Encontrar Tienda",
      saveToHistory: "Guardar en Historial",
      share: "Compartir",
      accuracy: "Precisión",
      tags: "Etiquetas",
    },
    history: {
      title: "Historial de Búsqueda",
      noHistory: "No hay historial de búsqueda.",
      clearHistory: "Borrar Historial",
      saved: "Guardado en el historial.",
    },
    map: {
      title: "Mapa de Tiendas",
      nearbyStores: "Tiendas Cercanas",
      directions: "Direcciones",
    },
    favorites: {
      added: "Agregado a favoritos.",
      removed: "Eliminado de favoritos.",
      error: "Error al procesar favoritos.",
    },
    share: {
      comingSoon: "La función de compartir se implementará pronto.",
    },
    search: {
      results: "Resultados de Búsqueda",
      foundResults: "Se encontraron {{count}} resultados",
      noResults: "No hay resultados de búsqueda",
      noResultsDescription:
        "Intenta buscar con diferentes palabras clave o toma una foto de un souvenir con la cámara.",
    },
  },
  vi: {
    common: {
      appName: "Korea Finder",
      loading: "Đang tải...",
      error: "Đã xảy ra lỗi.",
      retry: "Thử lại",
      cancel: "Hủy",
      confirm: "Xác nhận",
      back: "Quay lại",
      next: "Tiếp tục",
      save: "Lưu",
      delete: "Xóa",
    },
    language: {
      selectLanguage: "Chọn ngôn ngữ",
      korean: "한국어",
      english: "English",
      japanese: "日本語",
      chinese: "中文",
      spanish: "Español",
    },
    camera: {
      takePhoto: "Chụp ảnh",
      selectFromGallery: "Chọn từ thư viện",
      cameraPermission: "Cần cấp quyền camera.",
      analyzing: "Đang phân tích...",
      pointAtItem: "Hãy hướng camera vào quà lưu niệm",
    },
    result: {
      title: "Kết quả phân tích",
      name: "Tên",
      description: "Mô tả",
      price: "Thông tin giá",
      category: "Danh mục",
      usageTips: "Gợi ý sử dụng",
      whereToBuy: "Tìm nơi mua",
      saveToHistory: "Lưu vào lịch sử",
      share: "Chia sẻ",
      accuracy: "Độ chính xác",
      tags: "Thẻ",
    },
    history: {
      title: "Lịch sử tìm kiếm",
      noHistory: "Chưa có lịch sử tìm kiếm.",
      clearHistory: "Xóa lịch sử",
      saved: "Đã lưu vào lịch sử.",
    },
    map: {
      title: "Bản đồ cửa hàng",
      nearbyStores: "Cửa hàng gần đây",
      directions: "Chỉ đường",
    },
    favorites: {
      added: "Đã thêm vào yêu thích.",
      removed: "Đã xóa khỏi yêu thích.",
      error: "Có lỗi khi xử lý yêu thích.",
    },
    share: {
      comingSoon: "Tính năng chia sẻ sẽ sớm ra mắt.",
    },
    search: {
      results: "Kết quả tìm kiếm",
      foundResults: "Đã tìm thấy {{count}} kết quả",
      noResults: "Không có kết quả",
      noResultsDescription:
        "Hãy thử từ khóa khác hoặc chụp ảnh quà lưu niệm để phân tích.",
    },
  },
};

// 현재 언어 상태
let currentLanguage: Language = "ko";

// 언어 초기화 (앱 시작 시 호출)
export const initLanguage = async (): Promise<Language> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    const validLanguages = ["ko", "en", "ja", "zh", "es", "vi", "fr", "de", "it", "pt", "ru", "ar", "th", "id", "hi"];
    
    if (savedLanguage && validLanguages.includes(savedLanguage)) {
      currentLanguage = savedLanguage as Language;
      console.log("저장된 언어 로드:", savedLanguage);
    } else {
      console.log("기본 언어 사용: ko");
    }
  } catch (error) {
    console.error("언어 로드 오류:", error);
  }
  return currentLanguage;
};

// 언어 변경 함수
export const setLanguage = async (language: Language) => {
  try {
    currentLanguage = language;
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    console.log("언어 변경:", language);
  } catch (error) {
    console.error("언어 저장 오류:", error);
  }
};

// 현재 언어 가져오기
export const getCurrentLanguage = (): Language => {
  return currentLanguage;
};

// 번역 함수
export const t = (key: string, variables?: Record<string, any>): string => {
  const keys = key.split(".");
  let value: any = resources[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  let result = typeof value === "string" ? value : key;

  // 변수 치환
  if (variables) {
    Object.keys(variables).forEach((varKey) => {
      const regex = new RegExp(`{{${varKey}}}`, "g");
      result = result.replace(regex, String(variables[varKey]));
    });
  }

  return result;
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

export default { t, setLanguage, getCurrentLanguage, getText, initLanguage };
