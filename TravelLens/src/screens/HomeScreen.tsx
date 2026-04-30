import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageBackground,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  ChevronRight,
  Home,
  User,
  Search,
  Navigation,
  Video,
} from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "../types";
import LanguageDropdown from "../components/LanguageDropdown";
import { useLanguage } from "../contexts/LanguageContext";
import { getUIText } from "../i18n/translations";
import { useSearchLimit } from "../hooks/useSearchLimit";
import { auth } from "../services/firebase";
import HomeMapPreview from "../components/HomeMapPreview";
import {
  subscribeUserLocations,
  countUsersWithinRadius,
  crowdLevelFromCount,
  UserLocationDoc,
  CrowdLevel,
} from "../services/crowdService";
import { DEFAULT_TOURIST_LOCATIONS, TouristLocation } from "../constants/touristLocations";
import { fetchCurrentWeather, weatherEmoji, WeatherData } from "../services/weatherService";
import { getCurrentCoordinates } from "../services/locationService";
import { Pedometer } from "expo-sensors";

/* ────────────────────────────────────────────
   상수
──────────────────────────────────────────── */
const CROWD_COLORS: Record<CrowdLevel, string> = {
  green: "#22C55E",
  yellow: "#F59E0B",
  red: "#EF4444",
};
const CROWD_BG: Record<CrowdLevel, string> = {
  green: "#DCFCE7",
  yellow: "#FEF3C7",
  red: "#FEE2E2",
};
const CROWD_LABEL: Record<CrowdLevel, string> = {
  green: "\uC5EC\uC720",
  yellow: "\uBCF4\uD1B5",
  red: "\uD63C\uC7A1",
};
const CROWD_DESC: Record<CrowdLevel, string> = {
  green: "\uD604\uC7AC \uD63C\uC7A1\uB3C4 \uB099\uC544\uC694!",
  yellow: "\uC801\uB2F9\uD55C \uD63C\uC7A1\uB3C4\uC5D0\uC694.",
  red: "\uC9C0\uAE08 \uB9E4\uC6B0 \uBD90\uBE44\uC5B4\uC694!",
};

const DAILY_FREE_LIMIT = 5;
const PREMIUM_PRICE_TEXT = "$4.99";
const AUTO_SCROLL_MS = 4000;

// 인기 관광지 이미지 매핑 (Unsplash)
const PLACE_IMAGES: Record<string, string> = {
  gyeongbokgung: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=300&q=75",
  namsan: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=300&q=75",
  bukchon: "https://images.unsplash.com/photo-1601625939609-cbfd92b1c9f1?w=300&q=75",
  hongdae: "https://images.unsplash.com/photo-1583779457094-ab6f77f7bf57?w=300&q=75",
  haeundae: "https://images.unsplash.com/photo-1598524374912-6e3d7eb5d382?w=300&q=75",
};

const FEATURE_IMAGES = {
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=120&q=80",
  food: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=120&q=80",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80",
  mask: "https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?w=120&q=80",
  toilet: "https://img.icons8.com/fluency/160/toilet-bowl.png",
  cctv: "https://img.icons8.com/fluency/160/bullet-camera.png",
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;
interface Props { navigation: HomeScreenNavigationProp; }

/* ────────────────────────────────────────────
   히어로 슬라이드 데이터
──────────────────────────────────────────── */
const HERO_SLIDES: {
  image: { uri: string } | number;
  overlayColors: [string, string];
  showCTA: boolean;
}[] = [
  {
    image: require("../../assets/myeongdong.png"),
    overlayColors: ["rgba(0,0,0,0.0)", "rgba(15,5,5,0.72)"],
    showCTA: true,
  },
  {
    image: { uri: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&q=80" },
    overlayColors: ["rgba(0,0,0,0.1)", "rgba(20,40,20,0.75)"],
    showCTA: false,
  },
  {
    image: { uri: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80" },
    overlayColors: ["rgba(0,0,0,0.15)", "rgba(30,10,40,0.78)"],
    showCTA: false,
  },
];

/* ────────────────────────────────────────────
   컴포넌트
──────────────────────────────────────────── */
const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: W } = Dimensions.get("window");
  const heroW = W - 28;
  const [isLoading, setIsLoading] = useState(false);
  const [isPremiumModalVisible, setPremiumModalVisible] = useState(false);
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!(auth.currentUser && !auth.currentUser.isAnonymous)
  );
  const { currentLanguage } = useLanguage();
  const {
    isReady: isLimitReady,
    isPremium,
    remainingCount,
    canUseSearch,
    consumeSearch,
    purchaseUnlimited,
    restorePurchases,
    isProcessingPurchase,
    products,
  } = useSearchLimit();
  const premiumProduct = useMemo(() => products?.[0], [products]);
  const premiumPriceText = useMemo(() => {
    if (premiumProduct && "localizedPrice" in premiumProduct) return premiumProduct.localizedPrice as string;
    return PREMIUM_PRICE_TEXT;
  }, [premiumProduct]);

  const limitLabelText = isPremium
    ? getUIText(currentLanguage, "premiumUnlimitedLabel")
    : isLimitReady
      ? `${getUIText(currentLanguage, "limitRemainingPrefix")} ${remainingCount} / ${DAILY_FREE_LIMIT}`
      : getUIText(currentLanguage, "limitLoading");
  const limitDescriptionText = `${getUIText(currentLanguage, "limitPricePrefix")} ${premiumPriceText} ${getUIText(currentLanguage, "limitPriceSuffix")}`;

  /* ── auth 상태 ── */
  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!(user && !user.isAnonymous));
    });
  }, []);

  /* ── 권한 요청 ── */
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { Alert.alert("\uAD8C\uD55C \uD544\uC694", "\uCE74\uBA54\uB77C \uAD8C\uD55C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4."); return false; }
    return true;
  };
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("\uAD8C\uD55C \uD544\uC694", "\uAC24\uB7EC\uB9AC \uC811\uADFC \uAD8C\uD55C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4."); return false; }
    return true;
  };

  /* ── 모달 ── */
  const openPremiumModal = () => {
    if (!isLoggedIn) {
      Alert.alert(
        getUIText(currentLanguage, "premiumLoginRequiredTitle"),
        getUIText(currentLanguage, "premiumLoginRequiredMessage"),
        [
          { text: getUIText(currentLanguage, "premiumClose"), style: "cancel" },
          { text: getUIText(currentLanguage, "premiumLoginAction"), onPress: () => navigation.navigate("Login") },
        ]
      );
      return;
    }
    setPremiumModalVisible(true);
  };

  /* ── 검색 모달 열기 ── */
  const handleOpenSearchModal = () => {
    if (!isPremium && !canUseSearch()) { openPremiumModal(); return; }
    setSearchModalVisible(true);
  };

  /* ── 사진 촬영 ── */
  const handleTakePhoto = async () => {
    setSearchModalVisible(false);
    const ok = await requestCameraPermission();
    if (!ok) return;
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const ok2 = await consumeSearch();
        if (!ok2) { openPremiumModal(); return; }
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch { Alert.alert("\uC624\uB958", "\uCE74\uBA54\uB77C\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."); }
    finally { setIsLoading(false); }
  };

  /* ── 갤러리 ── */
  const handleSelectFromGallery = async () => {
    setSearchModalVisible(false);
    const ok = await requestMediaLibraryPermission();
    if (!ok) return;
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const ok2 = await consumeSearch();
        if (!ok2) { openPremiumModal(); return; }
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch { Alert.alert("\uC624\uB958", "\uAC24\uB7EC\uB9AC\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."); }
    finally { setIsLoading(false); }
  };

  const handleProfile = () => navigation.navigate("Profile");
  const handleTouristMap = () => {
    if (!isLoggedIn) {
      Alert.alert(
        getUIText(currentLanguage, "premiumLoginRequiredTitle"),
        getUIText(currentLanguage, "mapLoginRequired"),
        [
          { text: getUIText(currentLanguage, "premiumClose"), style: "cancel" },
          { text: getUIText(currentLanguage, "premiumLoginAction"), onPress: () => navigation.navigate("Login") },
        ]
      );
      return;
    }
    navigation.navigate("TouristMap");
  };
  const handlePurchase = async () => {
    if (!isLoggedIn) {
      setPremiumModalVisible(false);
      Alert.alert(
        getUIText(currentLanguage, "premiumLoginRequiredTitle"),
        getUIText(currentLanguage, "premiumLoginRequiredMessage"),
        [
          { text: getUIText(currentLanguage, "premiumClose"), style: "cancel" },
          { text: getUIText(currentLanguage, "premiumLoginAction"), onPress: () => navigation.navigate("Login") },
        ]
      );
      return;
    }
    const result = await purchaseUnlimited();
    if (result?.success && result?.shouldCloseModal) setPremiumModalVisible(false);
  };
  const handleRestorePurchases = async () => { await restorePurchases(); };

  /* ── 날씨 ── */
  const [weather, setWeather] = useState<WeatherData | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const coords = await getCurrentCoordinates();
      const lat = coords?.latitude ?? 37.5665;
      const lng = coords?.longitude ?? 126.9780;
      const data = await fetchCurrentWeather(lat, lng);
      if (!cancelled) setWeather(data);
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── 걸음수 ── */
  const [steps, setSteps] = useState<number | null>(null);
  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    (async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        if (!available) return;
        const end = new Date();
        const start = new Date(end);
        start.setHours(0, 0, 0, 0);
        const result = await Pedometer.getStepCountAsync(start, end);
        setSteps(result.steps);
        sub = Pedometer.watchStepCount(evt => setSteps(evt.steps));
      } catch { /* native module not available in dev build */ }
    })();
    return () => { sub?.remove(); };
  }, []);

  /* ── 혼잡도 ── */
  const [crowdData, setCrowdData] = useState<{ spot: TouristLocation; level: CrowdLevel }[]>([]);
  const crowdById = useMemo<Record<string, { level: CrowdLevel }>>(() => {
    const m: Record<string, { level: CrowdLevel }> = {};
    crowdData.forEach(({ spot, level }) => { m[spot.id] = { level }; });
    return m;
  }, [crowdData]);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u || u.isAnonymous) return;
    return subscribeUserLocations((users: UserLocationDoc[]) => {
      const now = Date.now();
      setCrowdData(DEFAULT_TOURIST_LOCATIONS.map(spot => ({
        spot,
        level: crowdLevelFromCount(countUsersWithinRadius(spot, users, now)),
      })));
    });
  }, [isLoggedIn]);

  /* ── 히어로 자동 스크롤 ── */
  const heroScrollRef = useRef<ScrollView | null>(null);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const onHeroMomentumEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / heroW);
    if (i >= 0 && i < HERO_SLIDES.length) setHeroIndex(i);
  }, [heroW]);
  useEffect(() => {
    autoTimer.current = setInterval(() => {
      setHeroIndex(prev => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroScrollRef.current?.scrollTo({ x: next * heroW, animated: true });
        return next;
      });
    }, AUTO_SCROLL_MS);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [heroW]);

  const bottomBarH = 56 + Math.max(insets.bottom, 10);
  const STEP_GOAL = 10000;

  /* ── 렌더 ── */
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* ── 상단 안전 영역 ── */}
      <View style={[styles.topSafe, { paddingTop: insets.top }]}>

        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandKorea}>Korea </Text>
              <Text style={styles.brandFinder}>Finder</Text>
            </View>
            <Text style={styles.brandSub}>{"\uD55C\uAD6D \uC5EC\uD589\uC758 \uBAA8\uB4E0 \uAC83, \uD55C \uBC88\uC5D0 \uD574\uACB0!"}</Text>
          </View>
          <LanguageDropdown tone="light" />
        </View>

        {/* ── 날씨 + 걸음수 카드 ── */}
        <View style={styles.infoRow}>
          {/* 날씨 */}
          <View style={styles.weatherChip}>
            <Text style={styles.infoEmoji}>{weather ? weatherEmoji(weather.conditionType, weather.isDaytime) : "🌤️"}</Text>
            <Text style={styles.infoText}>{weather ? `${weather.temp}°` : "--°"}</Text>
            {weather && <Text style={styles.infoSub}> {weather.description}</Text>}
            {weather && <Text style={styles.infoSub}>{" ☔"}{weather.precipitation}{"%"}</Text>}
          </View>
          {/* 구분선 */}
          <View style={styles.infoDivider} />
          {/* 걸음수 */}
          <View style={styles.stepsChip}>
            <Text style={styles.infoEmoji}>{"\uD83D\uDEB6"}</Text>
            <Text style={styles.infoText}>{steps !== null ? steps.toLocaleString() : "--"}</Text>
            <Text style={styles.infoSub}>{"\uAC78\uC74C"}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomBarH + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── 1. 히어로 캐러셀 ── */}
          <View style={styles.heroWrap}>
            <ScrollView
              ref={heroScrollRef}
              horizontal pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              onMomentumScrollEnd={onHeroMomentumEnd}
              scrollEventThrottle={16}
              style={{ width: heroW }}
            >
              {HERO_SLIDES.map((slide, i) => (
                <ImageBackground
                  key={i}
                  source={slide.image}
                  style={[styles.heroSlide, { width: heroW }]}
                  imageStyle={styles.heroImg}
                >
                  <LinearGradient
                    colors={slide.overlayColors}
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* AI 배지 */}
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>{"AI \uC778\uC2DD \uC815\uD655\uB3C4"}</Text>
                    <Text style={styles.heroBadgeAccent}>{"95%+"}</Text>
                  </View>
                  {/* 슬라이드 카운터 */}
                  <View style={styles.heroCounter}>
                    <Text style={styles.heroCounterText}>{i + 1} / {HERO_SLIDES.length}</Text>
                  </View>

                  {slide.showCTA ? (
                    /* 메인 CTA 슬라이드 */
                    <View style={styles.heroContent}>
                      <Text style={styles.heroQ}>{"\uC774\uAC70 \uBB50\uC57C?"}</Text>
                      <Text style={styles.heroTitle}>{"\uC0AC\uC9C4 \uCC0D\uC73C\uBA74"}</Text>
                      <Text style={styles.heroTitle}>{"\uBC14\uB85C \uC54C\uB824\uC918\uC694!"}</Text>
                      <Text style={styles.heroSub}>{"✨ AI\uAC00 \uB611\uB611\uD558\uAC8C \uBD84\uC11D\uD574\uB4DC\uB824\uC694"}</Text>
                      <View style={styles.heroBtns}>
                        <TouchableOpacity style={styles.heroMainBtn} onPress={handleOpenSearchModal}
                          disabled={isLoading} activeOpacity={0.88}>
                          <Camera size={17} color="white" />
                          <Text style={styles.heroMainBtnText}>{"\uC0AC\uC9C4 \uCC0D\uAE30"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.heroSecBtn} onPress={handleOpenSearchModal}
                          disabled={isLoading} activeOpacity={0.88}>
                          <ImageIcon size={14} color="white" />
                          <Text style={styles.heroSecBtnText}>{"\uAC24\uB7EC\uB9AC\uC5D0\uC11C \uC120\uD0DD"}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    /* 정보 슬라이드 */
                    <View style={styles.heroContent}>
                      <Text style={styles.heroTitle}>{i === 1 ? "\uC2E4\uC2DC\uAC04 \uD63C\uC7A1\uB3C4 \uC9C0\uB3C4 \uD83D\uDDFA\uFE0F" : "\uD504\uB9AC\uBBF8\uC5C4\uC73C\uB85C \u2728"}</Text>
                      <Text style={styles.heroSub}>{i === 1 ? "\uC9C0\uAE08 \uC5B4\uB514\uAC00 \uBD90\uBE44\uB294\uC9C0 \uD55C\uB208\uC5D0!" : "\uBB34\uC81C\uD55C \uAC80\uC0C9 \u00B7 \uAD11\uACE0 \uC81C\uAC70"}</Text>
                    </View>
                  )}
                </ImageBackground>
              ))}
            </ScrollView>
            {/* 점 인디케이터 */}
            <View style={styles.heroDots} pointerEvents="none">
              {HERO_SLIDES.map((_, i) => (
                <View key={i} style={[styles.heroDot, i === heroIndex && styles.heroDotActive]} />
              ))}
            </View>
          </View>

          {/* ── 2. 실시간 혼잡도 바 ── */}
          <TouchableOpacity style={styles.crowdBar} onPress={handleTouristMap} activeOpacity={0.88}>
            <View style={styles.crowdBarLabelCol}>
              <View style={styles.crowdBarLiveDot} />
              <Text style={styles.crowdBarLabel}>{"\uC2E4\uC2DC\uAC04\n\uD63C\uC7A1\uB3C4"}</Text>
            </View>
            <View style={styles.crowdBarSep} />
            <View style={styles.crowdBarCenter}>
              {crowdData.length > 0 ? (
                <>
                  <View style={styles.crowdBarRow}>
                    <Text style={styles.crowdBarPlace}>{crowdData[0].spot.emoji} {crowdData[0].spot.nameKo}</Text>
                    <View style={[styles.crowdBarBadge, { backgroundColor: CROWD_BG[crowdData[0].level] }]}>
                      <View style={[styles.crowdBarBadgeDot, { backgroundColor: CROWD_COLORS[crowdData[0].level] }]} />
                      <Text style={[styles.crowdBarBadgeText, { color: CROWD_COLORS[crowdData[0].level] }]}>
                        {CROWD_LABEL[crowdData[0].level]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.crowdBarDesc}>{CROWD_DESC[crowdData[0].level]}</Text>
                </>
              ) : (
                <Text style={styles.crowdBarDesc}>{isLoggedIn ? "\uBD88\uB7EC\uC624\uB294 \uC911\u2026" : "\uD83D\uDD12 \uB85C\uADF8\uC778 \uD6C4 \uD655\uC778"}</Text>
              )}
            </View>
            <View style={styles.crowdBarBtn}>
              <ChevronRight size={14} color="white" />
            </View>
          </TouchableOpacity>

          {/* ── 4. 메인 기능 2x2 그리드 ── */}
          <View style={styles.featureGrid}>

            {/* Row 1 Left: 사진으로 검색하기 */}
            <View style={styles.gridCard}>
              <LinearGradient colors={["#FFF5F5", "#FFE4E4"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill} />
              <Text style={styles.gridCardTitle} numberOfLines={1}>{"\uC0AC\uC9C4\uC73C\uB85C \uAC80\uC0C9\uD558\uAE30"}</Text>
              <Text style={styles.gridCardSub}>{"\uBAA8\uB974\uB294 \uAC83, \uC0AC\uC9C4 \uCC0D\uACE0 \uBC14\uB85C \uD655\uC778!"}</Text>
              <View style={styles.gridCardIconArea}>
                <View style={styles.photoSearchFrame}>
                  <Image source={{ uri: FEATURE_IMAGES.coffee }} style={[styles.photoMiniImage, styles.photoMiniTopLeft]} />
                  <Image source={{ uri: FEATURE_IMAGES.shoes }} style={[styles.photoMiniImage, styles.photoMiniTopRight]} />
                  <Image source={{ uri: FEATURE_IMAGES.food }} style={[styles.photoMiniImage, styles.photoMiniBottomLeft]} />
                  <Image source={{ uri: FEATURE_IMAGES.mask }} style={[styles.photoMiniImage, styles.photoMiniBottomRight]} />
                </View>
                <View style={styles.photoCameraBadge}>
                  <Camera size={34} color="#E63946" />
                </View>
              </View>
              <TouchableOpacity style={styles.gridMainBtn} onPress={handleOpenSearchModal}
                disabled={isLoading} activeOpacity={0.88}>
                <Text style={styles.gridMainBtnText}>{"\uC0AC\uC9C4 \uCC0D\uACE0 \uAC80\uC0C9\uD558\uAE30"}</Text>
              </TouchableOpacity>
            </View>

            {/* Row 1 Right: 실시간 혼잡도 지도 */}
            <TouchableOpacity style={styles.gridCard} onPress={handleTouristMap} activeOpacity={0.92}>
              <LinearGradient colors={["#F0FFF4", "#E0F7EC"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill} />
              <Text style={styles.gridCardTitle} numberOfLines={1}>{"\uC2E4\uC2DC\uAC04 \uD63C\uC7A1\uB3C4 \uC9C0\uB3C4"}</Text>
              <Text style={styles.gridCardSub}>{"\uC9C0\uAE08 \uC5B4\uB514\uAC00 \uBD90\uBE44\uB294\uC9C0 \uD55C\uB208\uC5D0!"}</Text>
              <View style={styles.gridCardIconArea}>
                <View style={styles.mapMiniPreview}>
                  <HomeMapPreview subtitle="" />
                </View>
                <View style={styles.mapPinOverlay}>
                  <MapPin size={13} color="white" fill="#E63946" />
                </View>
                <View style={[styles.gridAccentPill, styles.mapLivePill, { backgroundColor: "rgba(34,197,94,0.92)" }]}>
                  <Text style={[styles.gridAccentText, { color: "white" }]}>LIVE</Text>
                </View>
              </View>
              <View style={[styles.gridMainBtn, { backgroundColor: "#22C55E" }]}>
                <Text style={styles.gridMainBtnText}>{"\uC9C0\uB3C4\uC5D0\uC11C \uD655\uC778\uD558\uAE30"}</Text>
              </View>
            </TouchableOpacity>

            {/* Row 2 Left: 화장실 찾기 */}
            <TouchableOpacity style={styles.gridCard} onPress={handleTouristMap} activeOpacity={0.92}>
              <LinearGradient colors={["#F0F7FF", "#E3EDFF"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill} />
              <Text style={styles.gridCardTitle} numberOfLines={1}>{"\uD654\uC7A5\uC2E4 \uCC3E\uAE30"}</Text>
              <Text style={styles.gridCardSub}>{"\uAC00\uAE4C\uC6B4 \uD654\uC7A5\uC2E4\uC744 \uc2F1\uACE0 \uBE60\uB974\uAC8C!"}</Text>
              <View style={styles.gridCardIconArea}>
                <View style={styles.featureImageGlowBlue} />
                <Image source={{ uri: FEATURE_IMAGES.toilet }} style={styles.toiletImage} resizeMode="contain" />
              </View>
              <View style={[styles.gridMainBtn, { backgroundColor: "#3B82F6" }]}>
                <Text style={styles.gridMainBtnText}>{"\uD654\uC7A5\uC2E4 \uCC3E\uAE30"}</Text>
              </View>
            </TouchableOpacity>

            {/* Row 2 Right: 실시간 CCTV 보기 */}
            <TouchableOpacity style={styles.gridCard} onPress={handleTouristMap} activeOpacity={0.92}>
              <LinearGradient colors={["#FAF5FF", "#EDE9FE"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill} />
              <Text style={styles.gridCardTitle} numberOfLines={1}>{"\uC2E4\uC2DC\uAC04 CCTV \uBCF4\uAE30"}</Text>
              <Text style={styles.gridCardSub}>{"\uD604\uC7AC \uC0C1\uD669\uC744 \uC2E4\uC2DC\uAC04\uC73C\uB85C \uD655\uC778!"}</Text>
              <View style={styles.gridCardIconArea}>
                <View style={styles.cctvLiveFrame}>
                  <View style={styles.cctvLiveBadge}>
                    <View style={styles.cctvLiveDot} />
                    <Text style={styles.cctvLiveBadgeText}>LIVE</Text>
                  </View>
                  <View style={styles.cctvSignalBars}>
                    <View style={[styles.cctvSignalBar, { height: 7 }]} />
                    <View style={[styles.cctvSignalBar, { height: 11 }]} />
                    <View style={[styles.cctvSignalBar, { height: 15 }]} />
                  </View>
                  <Image source={{ uri: FEATURE_IMAGES.cctv }} style={styles.cctvImage} resizeMode="contain" />
                </View>
              </View>
              <View style={[styles.gridMainBtn, styles.cctvLiveBtn]}>
                <Text style={styles.gridMainBtnText}>{"LIVE CCTV \uBCF4\uAE30"}</Text>
              </View>
            </TouchableOpacity>

          </View>

          {/* ── 5. 인기 관광지 ── */}
          <View style={styles.popularSection}>
            <View style={styles.popularHeader}>
              <Text style={styles.popularTitle}>{"\uD83D\uDD25 \uC9C0\uAE08 \uC778\uAE30 \uC788\uB294 \uC5EC\uD589\uC9C0"}</Text>
              <TouchableOpacity style={styles.popularMore} onPress={handleTouristMap}>
                <Text style={styles.popularMoreText}>{"\uC804\uCCB4 \uBCF4\uAE30 >"}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
              {DEFAULT_TOURIST_LOCATIONS.map(spot => {
                const crowd = crowdById[spot.id];
                const imgUri = PLACE_IMAGES[spot.id];
                return (
                  <TouchableOpacity key={spot.id} style={styles.placeCard} onPress={handleTouristMap} activeOpacity={0.88}>
                    {imgUri ? (
                      <ImageBackground
                        source={{ uri: imgUri }}
                        style={styles.placeCardImg}
                        imageStyle={styles.placeCardImgStyle}
                      >
                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.45)"]}
                          style={styles.placeCardGrad}
                        />
                      </ImageBackground>
                    ) : (
                      <View style={[styles.placeCardImg, { backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" }]}>
                        <Text style={{ fontSize: 32 }}>{spot.emoji}</Text>
                      </View>
                    )}
                    <Text style={styles.placeCardName} numberOfLines={1}>{spot.nameKo}</Text>
                    {crowd ? (
                      <View style={[styles.placeCardBadge, { backgroundColor: CROWD_BG[crowd.level] }]}>
                        <View style={[styles.placeCardDot, { backgroundColor: CROWD_COLORS[crowd.level] }]} />
                        <Text style={[styles.placeCardBadgeText, { color: CROWD_COLORS[crowd.level] }]}>
                          {CROWD_LABEL[crowd.level]}
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.placeCardBadge, { backgroundColor: "#F3F4F6" }]}>
                        <Text style={{ fontSize: 9, color: "#9CA3AF" }}>{"\uC815\uBCF4 \uC5C6\uC74C"}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── 6. 프리미엄 배너 ── */}
          {!isPremium && (
            <TouchableOpacity style={styles.premiumBanner} onPress={openPremiumModal} activeOpacity={0.88}>
              <LinearGradient colors={["#1A0A0E", "#3D1220"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill} />
              <View style={styles.premiumLeft}>
                <Text style={styles.premiumDiamond}>{"\uD83D\uDC8E"}</Text>
                <View>
                  <Text style={styles.premiumTitle}>{"\uD504\uB9AC\uBBF8\uC5C4\uC73C\uB85C \uB354 \uC2A4\uB9C8\uD2B8\uD55C \uC5EC\uD589!"}</Text>
                  <Text style={styles.premiumSub}>{"\uAD11\uACE0 \uC81C\uAC70 \u00B7 \uBB34\uC81C\uD55C \uAC80\uC0C9 \u00B7 \uC0C1\uC138 \uD63C\uC7A1\uB3C4 \u00B7 \uCD94\uCC9C \uCF54\uC2A4"}</Text>
                </View>
              </View>
              <View style={styles.premiumBtn}>
                <Text style={styles.premiumBtnText}>{"\uC5EC\uD589"}</Text>
                <Text style={styles.premiumBtnText}>{"\uBB34\uB8CC \uCCB4\uD5D8 >"}</Text>
              </View>
            </TouchableOpacity>
          )}

        </ScrollView>
      </View>

      {/* ── 하단 탭 ── */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.tabItem}>
          <Home size={22} color="#E63946" />
          <Text style={styles.tabLabelActive}>{"\uD648"}</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={handleTouristMap}>
          <MapPin size={22} color="#9CA3AF" />
          <Text style={styles.tabLabel}>{"\uC9C0\uB3C4"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabFab} onPress={handleOpenSearchModal}
          disabled={isLoading} activeOpacity={0.88}>
          <Camera size={26} color="white" strokeWidth={2.2} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={handleOpenSearchModal}
          disabled={isLoading}>
          <ImageIcon size={22} color="#9CA3AF" />
          <Text style={styles.tabLabel}>{"\uAC24\uB7EC\uB9AC"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={handleProfile}>
          <User size={22} color="#9CA3AF" />
          <Text style={styles.tabLabel}>{"\uD504\uB85C\uD544"}</Text>
        </TouchableOpacity>
      </View>


      {/* ── 검색 방법 선택 모달 ── */}
      <Modal visible={isSearchModalVisible} animationType="slide" transparent
        onRequestClose={() => setSearchModalVisible(false)}>
        <TouchableOpacity style={styles.searchModalBackdrop} activeOpacity={1}
          onPress={() => setSearchModalVisible(false)}>
          <View style={styles.searchModalSheet}>
            <View style={styles.searchModalHandle} />
            <Text style={styles.searchModalTitle}>{"\uC5B4\uB5BB\uAC8C \uAC80\uC0C9\uD560\uAE4C\uC694?"}</Text>

            {/* 검색 횟수 표시 */}
            <View style={styles.searchModalCountRow}>
              <View style={[styles.searchModalCountBadge, isPremium && { backgroundColor: "#FFF3CD" }]}>
                <Text style={styles.searchModalCountIcon}>{isPremium ? "\uD83D\uDC51" : "\uD83D\uDD0D"}</Text>
                <Text style={styles.searchModalCountText}>
                  {isPremium
                    ? "\uD504\uB9AC\uBBF8\uC5C4 \u00B7 \uBB34\uC81C\uD55C \uAC80\uC0C9"
                    : `${"\uC624\uB298 \uB0A8\uC740 \uAC80\uC0C9"} ${remainingCount} / ${DAILY_FREE_LIMIT}`}
                </Text>
              </View>
              {!isPremium && (
                <TouchableOpacity style={styles.searchModalUpgradeBtn}
                  onPress={() => { setSearchModalVisible(false); openPremiumModal(); }}>
                  <Text style={styles.searchModalUpgradeText}>{"\uC5C5\uADF8\uB808\uC774\uB4DC"}</Text>
                </TouchableOpacity>
              )}
            </View>

            {!isPremium && remainingCount === 0 ? (
              /* 검색 횟수 소진 시 */
              <>
                <View style={styles.searchModalEmptyBox}>
                  <Text style={styles.searchModalEmptyIcon}>{"\uD83D\uDE15"}</Text>
                  <Text style={styles.searchModalEmptyTitle}>{"\uC624\uB298 \uAC80\uC0C9\uC744 \uBAA8\uB450 \uC0AC\uC6A9\uD588\uC5B4\uC694"}</Text>
                  <Text style={styles.searchModalEmptySub}>{"\uD504\uB9AC\uBBF8\uC5C4\uC73C\uB85C \uC5C5\uADF8\uB808\uC774\uB4DC\uD558\uBA74 \uBB34\uC81C\uD55C\uC73C\uB85C \uAC80\uC0C9\uD560 \uC218 \uC788\uC5B4\uC694!"}</Text>
                </View>
                <TouchableOpacity style={styles.searchModalPremiumBtn}
                  onPress={() => { setSearchModalVisible(false); openPremiumModal(); }}
                  disabled={isProcessingPurchase} activeOpacity={0.88}>
                  <Text style={styles.searchModalPremiumBtnText}>{"\uD504\uB9AC\uBBF8\uC5C4 \uC2DC\uC791\uD558\uAE30 \u2192"}</Text>
                  <Text style={styles.searchModalPremiumBtnSub}>{premiumPriceText} \u00B7 {"\uAD11\uACE0 \uC81C\uAC70 \u00B7 \uBB34\uC81C\uD55C \uAC80\uC0C9"}</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* 검색 가능 상태 */
              <>
                <TouchableOpacity style={styles.searchModalMainBtn} onPress={handleTakePhoto}
                  disabled={isLoading} activeOpacity={0.88}>
                  <Camera size={22} color="white" />
                  <View>
                    <Text style={styles.searchModalBtnTitle}>{"\uC9C0\uAE08 \uBC14\uB85C \uC0AC\uC9C4 \uCC0D\uAE30"}</Text>
                    <Text style={styles.searchModalBtnSub}>{"\uCE74\uBA54\uB77C\uB97C \uC5F4\uACE0 \uBC14\uB85C \uCC0D\uC5B4\uBCF4\uC138\uC694"}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchModalSecBtn} onPress={handleSelectFromGallery}
                  disabled={isLoading} activeOpacity={0.88}>
                  <ImageIcon size={22} color="#E63946" />
                  <View>
                    <Text style={styles.searchModalSecBtnTitle}>{"\uAC24\uB7EC\uB9AC\uC5D0\uC11C \uC120\uD0DD"}</Text>
                    <Text style={styles.searchModalSecBtnSub}>{"\uC800\uC7A5\uB41C \uC0AC\uC9C4\uC73C\uB85C \uAC80\uC0C9\uD558\uC138\uC694"}</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.searchModalCancelBtn} onPress={() => setSearchModalVisible(false)}>
              <Text style={styles.searchModalCancelText}>{"\uCDE8\uC18C"}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── 프리미엄 모달 ── */}
      <Modal visible={isPremiumModalVisible} animationType="slide" transparent
        onRequestClose={() => setPremiumModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalBadge}>{getUIText(currentLanguage, "premiumBadge")}</Text>
            <Text style={styles.modalTitle}>{getUIText(currentLanguage, "premiumTitle")}</Text>
            <Text style={styles.modalPrice}>{premiumPriceText} / {getUIText(currentLanguage, "premiumLifetime")}</Text>
            <Text style={styles.modalSubtitle}>{getUIText(currentLanguage, "premiumSubtitle")}</Text>
            <View style={styles.modalDivider} />
            {[
              getUIText(currentLanguage, "premiumFeature1"),
              getUIText(currentLanguage, "premiumFeature2"),
              getUIText(currentLanguage, "premiumFeature3"),
            ].map(f => (
              <View key={f} style={styles.modalFeature}>
                <Text style={styles.modalFeatureBullet}>{"•"}</Text>
                <Text style={styles.modalFeatureText}>{f}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.modalButton, isProcessingPurchase && { opacity: 0.7 }]}
              onPress={handlePurchase} disabled={isProcessingPurchase}>
              <Text style={styles.modalButtonText}>
                {isProcessingPurchase ? getUIText(currentLanguage, "premiumProcessing") : getUIText(currentLanguage, "premiumUpgradeButton")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setPremiumModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>{getUIText(currentLanguage, "premiumClose")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalRestoreButton} onPress={handleRestorePurchases} disabled={isProcessingPurchase}>
              <Text style={styles.modalRestoreButtonText}>{"\uAD6C\uB9E4 \uBCF5\uC6D0"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* ────────────────────────────────────────────
   스타일
──────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F7" },
  topSafe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 4 },

  /* 헤더 */
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10,
    backgroundColor: "#F5F5F7",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandKorea: { fontSize: 22, fontWeight: "800", color: "#1C1C1E", letterSpacing: -0.5 },
  brandFinder: { fontSize: 22, fontWeight: "800", color: "#E63946", letterSpacing: -0.5 },
  brandSub: { fontSize: 11, color: "#8E8E93", marginTop: 2 },

  /* 날씨 + 걸음수 카드 행 */
  infoRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 14, marginBottom: 10,
    backgroundColor: "white", borderRadius: 14, paddingVertical: 9, paddingHorizontal: 14,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  weatherChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  stepsChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  infoDivider: { width: 1, height: 16, backgroundColor: "#E5E7EB", marginHorizontal: 12 },
  infoEmoji: { fontSize: 16 },
  infoText: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  infoSub: { fontSize: 12, color: "#6B7280" },

  /* 히어로 */
  heroWrap: { borderRadius: 22, overflow: "hidden", marginBottom: 11 },
  heroSlide: { height: 190, overflow: "hidden" },
  heroImg: { borderRadius: 22 },
  heroBadge: {
    position: "absolute", top: 14, right: 14,
    backgroundColor: "#E63946", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
    alignItems: "center",
  },
  heroBadgeText: { color: "white", fontSize: 9, fontWeight: "600" },
  heroBadgeAccent: { color: "white", fontSize: 13, fontWeight: "900" },
  heroCounter: {
    position: "absolute", bottom: 44, right: 16,
    backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  heroCounterText: { color: "white", fontSize: 11, fontWeight: "600" },
  heroContent: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: 14, paddingBottom: 16,
  },
  heroQ: { fontSize: 14, fontWeight: "900", color: "#FFD700", marginBottom: 1 },
  heroTitle: { fontSize: 17, fontWeight: "900", color: "white", lineHeight: 22 },
  heroSub: { fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 4, marginBottom: 10 },
  heroBtns: { flexDirection: "row", gap: 8 },
  heroMainBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#E63946", borderRadius: 999,
    paddingVertical: 9, paddingHorizontal: 16,
    shadowColor: "#E63946", shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  heroMainBtnText: { color: "white", fontWeight: "700", fontSize: 13 },
  heroSecBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13,
    backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)",
  },
  heroSecBtnText: { color: "white", fontWeight: "600", fontSize: 12 },
  heroDots: {
    position: "absolute", bottom: 13, left: 0, right: 0,
    flexDirection: "row", gap: 5, justifyContent: "center",
  },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.35)" },
  heroDotActive: { backgroundColor: "white", width: 18 },

  /* 혼잡도 바 */
  crowdBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1A1A1A", borderRadius: 16,
    paddingVertical: 9, paddingHorizontal: 14, marginBottom: 10, gap: 10,
    shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  crowdBarLabelCol: { alignItems: "center", gap: 3 },
  crowdBarLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E63946" },
  crowdBarLabel: { fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: "700", textAlign: "center", lineHeight: 12 },
  crowdBarSep: { width: 1, height: 26, backgroundColor: "rgba(255,255,255,0.15)" },
  crowdBarCenter: { flex: 1 },
  crowdBarRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  crowdBarPlace: { fontSize: 13, fontWeight: "700", color: "white" },
  crowdBarBadge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  crowdBarBadgeDot: { width: 5, height: 5, borderRadius: 2.5 },
  crowdBarBadgeText: { fontSize: 10, fontWeight: "800" },
  crowdBarDesc: { fontSize: 10, color: "rgba(255,255,255,0.55)" },
  crowdBarBtnCol: { alignItems: "center", gap: 4 },
  crowdBarCctvBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  crowdBarCctvText: { fontSize: 9, color: "rgba(255,255,255,0.85)", fontWeight: "700" },
  crowdBarBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  crowdBarBtnText: { color: "white", fontSize: 11, fontWeight: "700" },

  /* 검색 제한 */
  limitCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "white", borderRadius: 18,
    padding: 14, marginBottom: 13,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  limitCardText: { flex: 1 },
  limitCardTitle: { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },
  limitCardSub: { fontSize: 11, color: "#6B6B6B", marginTop: 2 },
  limitCardBtn: {
    backgroundColor: "#E63946", paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999,
  },
  limitCardBtnText: { color: "white", fontWeight: "700", fontSize: 12 },

  /* 기능 그리드 */
  featureGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16,
  },

  gridCard: {
    width: "48%", aspectRatio: 1, borderRadius: 22, overflow: "hidden", padding: 12,
    backgroundColor: "white",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
  },
  gridCardTitle: { fontSize: 13, fontWeight: "900", color: "#1C1C1E", marginBottom: 2 },
  gridCardSub: { fontSize: 9, color: "#6B7280", lineHeight: 13 },
  gridCardIconArea: {
    flex: 1, alignItems: "center", justifyContent: "center",
    position: "relative", marginVertical: 6,
  },
  gridCardIconBg: {
    width: 62, height: 62, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  photoSearchFrame: {
    width: 108,
    height: 76,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(230,57,70,0.16)",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  photoCameraBadge: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#FFEEF0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E63946",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  photoMiniImage: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "white",
  },
  photoMiniTopLeft: { top: -2, left: -4, transform: [{ rotate: "-8deg" }] },
  photoMiniTopRight: { top: -4, right: -5, transform: [{ rotate: "8deg" }] },
  photoMiniBottomLeft: { bottom: -5, left: 5, transform: [{ rotate: "7deg" }] },
  photoMiniBottomRight: { bottom: -4, right: 5, transform: [{ rotate: "-7deg" }] },
  featureImageGlowBlue: {
    position: "absolute",
    right: 18,
    bottom: 12,
    width: 76,
    height: 34,
    borderRadius: 38,
    backgroundColor: "rgba(59,130,246,0.14)",
  },
  toiletImage: {
    width: 92,
    height: 92,
    alignSelf: "flex-end",
    marginRight: 2,
  },
  featureImageGlowPurple: {
    position: "absolute",
    right: 13,
    bottom: 14,
    width: 78,
    height: 32,
    borderRadius: 39,
    backgroundColor: "rgba(139,92,246,0.14)",
  },
  cctvLiveFrame: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#1F1537",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingRight: 3,
    paddingBottom: 0,
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cctvLiveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 3,
  },
  cctvLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
  },
  cctvLiveBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  cctvSignalBars: {
    position: "absolute",
    top: 11,
    right: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    zIndex: 3,
  },
  cctvSignalBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  cctvImage: {
    width: 92,
    height: 92,
    alignSelf: "flex-end",
    marginRight: -3,
    marginBottom: -5,
  },
  cctvLiveBtn: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  gridOrbit: {
    position: "absolute",
    width: 82,
    height: 82,
    borderRadius: 24,
    borderWidth: 1,
  },
  gridAccentPill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  gridAccentText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.2 },
  gridAccentTopRight: { top: 8, right: 14 },
  gridAccentBottomLeft: { bottom: 12, left: 18 },
  gridAccentDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
  },
  gridLiveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#EF4444" },
  scanCornerTopLeft: {
    position: "absolute",
    top: 28,
    left: 45,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#E63946",
    borderTopLeftRadius: 5,
  },
  scanCornerBottomRight: {
    position: "absolute",
    bottom: 28,
    right: 45,
    width: 16,
    height: 16,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#E63946",
    borderBottomRightRadius: 5,
  },
  gridLocationRing: {
    position: "absolute",
    bottom: 24,
    width: 34,
    height: 8,
    borderRadius: 17,
    backgroundColor: "rgba(59,130,246,0.12)",
  },
  gridVideoBase: {
    position: "absolute",
    bottom: 26,
    width: 38,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(139,92,246,0.13)",
  },
  mapMiniPreview: { width: "100%", height: "100%", borderRadius: 12, overflow: "hidden" },
  mapPinOverlay: {
    position: "absolute",
    top: "45%",
    left: "48%",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E63946",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E63946",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  mapLivePill: { top: 8, left: 8 },
  gridMainBtn: {
    backgroundColor: "#E63946", borderRadius: 999,
    paddingVertical: 8, alignItems: "center", justifyContent: "center",
  },
  gridMainBtnText: { color: "white", fontWeight: "700", fontSize: 11 },

  mapPreviewBox: { height: 80, borderRadius: 12, overflow: "hidden" },
  mapLegend: { flexDirection: "row", justifyContent: "center", gap: 5, marginBottom: 6, flexWrap: "wrap" },
  mapLegendItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  mapLegendDot: { width: 6, height: 6, borderRadius: 3 },
  mapLegendText: { fontSize: 8, color: "#555", fontWeight: "600" },

  /* 인기 관광지 */
  popularSection: { marginBottom: 14 },
  popularHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  popularTitle: { fontSize: 15, fontWeight: "800", color: "#1C1C1E" },
  popularMore: { padding: 4 },
  popularMoreText: { fontSize: 12, color: "#E63946", fontWeight: "600" },
  placeCard: {
    width: 100, backgroundColor: "white", borderRadius: 18, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  placeCardImg: { width: "100%", height: 70 },
  placeCardImgStyle: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  placeCardGrad: { ...StyleSheet.absoluteFillObject },
  placeCardName: { fontSize: 11, fontWeight: "700", color: "#1C1C1E", paddingHorizontal: 8, paddingTop: 6, paddingBottom: 4 },
  placeCardBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    marginHorizontal: 8, marginBottom: 8, borderRadius: 999,
    paddingHorizontal: 6, paddingVertical: 3, alignSelf: "flex-start",
  },
  placeCardDot: { width: 5, height: 5, borderRadius: 2.5 },
  placeCardBadgeText: { fontSize: 9, fontWeight: "800" },

  /* 프리미엄 배너 */
  premiumBanner: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 22, padding: 16, marginBottom: 10, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 5 },
  },
  premiumLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  premiumDiamond: { fontSize: 22 },
  premiumTitle: { fontSize: 13, fontWeight: "800", color: "white", marginBottom: 3 },
  premiumSub: { fontSize: 10, color: "rgba(255,255,255,0.65)", lineHeight: 15 },
  premiumBtn: {
    backgroundColor: "#E63946", borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 14, alignItems: "center",
  },
  premiumBtnText: { color: "white", fontWeight: "800", fontSize: 11 },

  /* 탭 바 */
  tabBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    backgroundColor: "white", borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: -3 },
    paddingTop: 8,
  },
  tabItem: { alignItems: "center", justifyContent: "center", width: 52, height: 44 },
  tabLabel: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  tabLabelActive: { fontSize: 10, color: "#E63946", marginTop: 2, fontWeight: "700" },
  tabFab: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: "#E63946",
    alignItems: "center", justifyContent: "center", marginTop: -20,
    shadowColor: "#E63946", shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 5 },
  },

  /* 모달 */
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },

  searchModalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  searchModalSheet: {
    backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
  },
  searchModalHandle: {
    width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2,
    alignSelf: "center", marginBottom: 20,
  },
  searchModalTitle: { fontSize: 20, fontWeight: "800", color: "#1C1C1E", marginBottom: 6, textAlign: "center" },
  searchModalSub: { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  searchModalMainBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#E63946", borderRadius: 18, padding: 18, marginBottom: 12,
  },
  searchModalBtnTitle: { fontSize: 15, fontWeight: "700", color: "white" },
  searchModalBtnSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  searchModalSecBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#FFF5F5", borderRadius: 18, padding: 18, marginBottom: 20,
    borderWidth: 1.5, borderColor: "#FFD0D0",
  },
  searchModalSecBtnTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  searchModalSecBtnSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  searchModalCancelBtn: { alignItems: "center", paddingVertical: 10 },
  searchModalCancelText: { fontSize: 15, color: "#9CA3AF", fontWeight: "600" },

  searchModalCountRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 18,
  },
  searchModalCountBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FFF0F0", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7,
  },
  searchModalCountIcon: { fontSize: 14 },
  searchModalCountText: { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },
  searchModalUpgradeBtn: {
    backgroundColor: "#E63946", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
  },
  searchModalUpgradeText: { fontSize: 12, fontWeight: "700", color: "white" },
  searchModalEmptyBox: {
    alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 16,
    padding: 20, marginBottom: 14,
  },
  searchModalEmptyIcon: { fontSize: 32, marginBottom: 8 },
  searchModalEmptyTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", marginBottom: 4 },
  searchModalEmptySub: { fontSize: 12, color: "#6B7280", textAlign: "center", lineHeight: 18 },
  searchModalPremiumBtn: {
    backgroundColor: "#1C1C1E", borderRadius: 16, padding: 16,
    alignItems: "center", marginBottom: 12,
  },
  searchModalPremiumBtnText: { fontSize: 15, fontWeight: "800", color: "white", marginBottom: 3 },
  searchModalPremiumBtnSub: { fontSize: 11, color: "rgba(255,255,255,0.65)" },
  modalCard: {
    backgroundColor: "white", borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 40,
  },
  modalBadge: {
    alignSelf: "center", backgroundColor: "#FFF0F0", color: "#E63946",
    fontSize: 12, fontWeight: "700", paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 999, marginBottom: 14,
  },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#1C1C1E", textAlign: "center", marginBottom: 6 },
  modalPrice: { fontSize: 16, fontWeight: "700", color: "#E63946", textAlign: "center", marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: "#6B6B6B", textAlign: "center", lineHeight: 20, marginBottom: 4 },
  modalDivider: { height: 1, backgroundColor: "#EEE", marginVertical: 16 },
  modalFeature: { flexDirection: "row", gap: 8, marginBottom: 10 },
  modalFeatureBullet: { fontSize: 14, color: "#E63946", fontWeight: "700" },
  modalFeatureText: { fontSize: 14, color: "#3C3C3E", lineHeight: 20, flex: 1 },
  modalButton: {
    backgroundColor: "#E63946", borderRadius: 999, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
  },
  modalButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
  modalCloseButton: { alignItems: "center", marginTop: 12 },
  modalCloseButtonText: { color: "#6B6B6B", fontSize: 14 },
  modalRestoreButton: { alignItems: "center", marginTop: 8, paddingVertical: 8 },
  modalRestoreButtonText: { color: "#E63946", fontSize: 13, fontWeight: "600" },
});

export default HomeScreen;
