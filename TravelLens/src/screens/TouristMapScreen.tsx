import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView,
  Animated,
  TextInput,
  Keyboard,
  Modal,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region, Marker, Polyline } from "react-native-maps";
import { WebView } from "react-native-webview";
import { Crosshair, ChevronLeft, Search, X, TrendingUp, Video, ChevronRight, AlertCircle, MapPin } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../types";
import { auth } from "../services/firebase";
import {
  fetchTouristLocations,
  subscribeUserLocations,
  countUsersWithinRadius,
  crowdLevelFromCount,
  UserLocationDoc,
  CrowdLevel,
} from "../services/crowdService";
import { TouristLocation } from "../constants/touristLocations";
import {
  startPeriodicLocationUpload,
  getCurrentCoordinates,
  isForegroundLocationDenied,
  subscribeRouteCoords,
  RouteCoord,
} from "../services/locationService";
import { useLanguage } from "../contexts/LanguageContext";
import { getUIText } from "../i18n/translations";
import { GOOGLE_MAPS_API_KEY, ITS_CCTV_API_KEY } from "@env";
import { fetchCurrentWeather, weatherEmoji, WeatherData } from "../services/weatherService";
import { fetchNearbyCCTVs, buildHLSPlayerHTML, CCTVItem } from "../services/cctvService";

type Nav = StackNavigationProp<RootStackParamList, "TouristMap">;

interface Props {
  navigation: Nav;
}

const SEOUL_REGION: Region = {
  latitude: 37.548,
  longitude: 126.9971,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

const SPOT_ZOOM_DELTA = { latitudeDelta: 0.018, longitudeDelta: 0.018 };
const CROWD_RECOMPUTE_MS = 60_000;

const CROWD_COLORS: Record<CrowdLevel, string> = {
  green: "#22C55E",
  yellow: "#EAB308",
  red: "#EF4444",
};

const CROWD_BG: Record<CrowdLevel, string> = {
  green: "#DCFCE7",
  yellow: "#FEF9C3",
  red: "#FEE2E2",
};

const CROWD_EMOJI: Record<CrowdLevel, string> = {
  green: "😊",
  yellow: "😐",
  red: "😰",
};

const CROWD_DESC: Record<CrowdLevel, string> = {
  green: "지금 방문하기 좋아요!",
  yellow: "다소 혼잡할 수 있어요",
  red: "매우 혼잡합니다",
};

const CROWD_BAR_FILLED: Record<CrowdLevel, number> = {
  green: 1,
  yellow: 2,
  red: 3,
};

/** 신호 바처럼 혼잡도를 시각화하는 컴포넌트 */
const CrowdBars = ({ level, size = 20 }: { level: CrowdLevel; size?: number }) => {
  const color = CROWD_COLORS[level];
  const filled = CROWD_BAR_FILLED[level];
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3 }}>
      {[1, 2, 3].map((bar) => (
        <View
          key={bar}
          style={{
            width: size * 0.3,
            height: size * (0.3 + bar * 0.23),
            borderRadius: 3,
            backgroundColor: bar <= filled ? color : "#E0E0E0",
          }}
        />
      ))}
    </View>
  );
};

const TouristMapScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [spots, setSpots] = useState<TouristLocation[]>([]);
  const [users, setUsers] = useState<UserLocationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [crowdById, setCrowdById] = useState<Record<string, { count: number; level: CrowdLevel }>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [spotWeather, setSpotWeather] = useState<WeatherData | null>(null);
  const [routeCoords, setRouteCoords] = useState<RouteCoord[]>([]);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  // CCTV
  const [cctvList, setCctvList] = useState<CCTVItem[]>([]);
  const [cctvLoading, setCctvLoading] = useState(false);
  const [cctvModalVisible, setCctvModalVisible] = useState(false);
  const [cctvView, setCctvView] = useState<"list" | "player">("list");
  const [cctvIndex, setCctvIndex] = useState(0);
  const [placeResults, setPlaceResults] = useState<
    { placeId: string; main: string; secondary: string }[]
  >([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 로컬 관광지 필터
  const localResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return spots.filter(
      (s) => s.nameKo.includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [query, spots]);

  // Google Places Autocomplete
  const fetchPlaces = useCallback(async (text: string) => {
    if (!GOOGLE_MAPS_API_KEY || text.trim().length < 1) {
      setPlaceResults([]);
      return;
    }
    setPlaceLoading(true);
    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
        `?input=${encodeURIComponent(text)}` +
        `&key=${GOOGLE_MAPS_API_KEY}` +
        `&language=ko` +
        `&location=37.5665,126.978` +
        `&radius=50000` +
        `&components=country:kr`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "OK") {
        setPlaceResults(
          (json.predictions ?? []).map((p: any) => ({
            placeId: p.place_id,
            main: p.structured_formatting?.main_text ?? p.description,
            secondary: p.structured_formatting?.secondary_text ?? "",
          }))
        );
      } else {
        setPlaceResults([]);
      }
    } catch {
      setPlaceResults([]);
    } finally {
      setPlaceLoading(false);
    }
  }, []);

  // 입력 디바운스
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setPlaceResults([]); return; }
    debounceRef.current = setTimeout(() => fetchPlaces(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchPlaces]);

  // Place ID → 좌표 조회 후 지도 이동
  const goToPlace = useCallback(async (placeId: string, name: string) => {
    setQuery("");
    setSearchFocused(false);
    setPlaceResults([]);
    Keyboard.dismiss();
    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${placeId}` +
        `&fields=geometry,name` +
        `&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      if (loc) {
        setSelectedId(null);
        setSpotWeather(null);
        mapRef.current?.animateToRegion(
          { latitude: loc.lat, longitude: loc.lng, ...SPOT_ZOOM_DELTA },
          600
        );
        // 검색된 장소 날씨 fetch
        fetchCurrentWeather(loc.lat, loc.lng).then(setSpotWeather);
      }
    } catch {
      Alert.alert("오류", "장소를 찾을 수 없습니다.");
    }
  }, []);

  const usersRef = useRef<UserLocationDoc[]>([]);
  const spotsRef = useRef<TouristLocation[]>([]);
  const recomputeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const locationDeniedAlertRef = useRef(false);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const hasMapsKey = useMemo(
    () => !!(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 8),
    []
  );

  const selectedSpot = useMemo(
    () => spots.find((s) => s.id === selectedId) ?? null,
    [spots, selectedId]
  );

  const recomputeCrowds = useCallback(() => {
    const now = Date.now();
    const s = spotsRef.current;
    const u = usersRef.current;
    const next: Record<string, { count: number; level: CrowdLevel }> = {};
    for (const spot of s) {
      const count = countUsersWithinRadius(spot, u, now);
      next[spot.id] = { count, level: crowdLevelFromCount(count) };
    }
    setCrowdById(next);
  }, []);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u || u.isAnonymous) {
      setLoading(false);
      return;
    }

    let unsubUsers: (() => void) | null = null;
    let locStop: { stop: () => void } | null = null;

    (async () => {
      const list = await fetchTouristLocations();
      spotsRef.current = list;
      setSpots(list);
      setLoading(false);

      unsubUsers = subscribeUserLocations((docs) => {
        usersRef.current = docs;
        setUsers(docs);
      });

      locStop = startPeriodicLocationUpload();

      recomputeCrowds();
      recomputeTimerRef.current = setInterval(recomputeCrowds, CROWD_RECOMPUTE_MS);
    })();

    // 이동경로 구독
    const unsubRoute = subscribeRouteCoords(setRouteCoords);

    return () => {
      if (unsubUsers) unsubUsers();
      if (locStop) locStop.stop();
      unsubRoute();
      if (recomputeTimerRef.current) {
        clearInterval(recomputeTimerRef.current);
        recomputeTimerRef.current = null;
      }
    };
  }, [recomputeCrowds]);

  useEffect(() => {
    usersRef.current = users;
    spotsRef.current = spots;
    recomputeCrowds();
  }, [users, spots, recomputeCrowds]);

  const goToUserLocation = useCallback(async () => {
    const coords = await getCurrentCoordinates();
    if (!coords) {
      const denied = await isForegroundLocationDenied();
      if (denied && !locationDeniedAlertRef.current) {
        locationDeniedAlertRef.current = true;
        Alert.alert("", getUIText(currentLanguage, "mapLocationDenied"));
      }
      return;
    }
    setSelectedId(null);
    mapRef.current?.animateToRegion(
      { latitude: coords.latitude, longitude: coords.longitude, ...SPOT_ZOOM_DELTA },
      600
    );
  }, [currentLanguage]);

  useEffect(() => {
    if (loading) return;
    void goToUserLocation();
  }, [loading, goToUserLocation]);

  const selectSpot = useCallback(
    (spot: TouristLocation) => {
      if (selectedId === spot.id) {
        setSelectedId(null);
        setSpotWeather(null);
        mapRef.current?.animateToRegion(SEOUL_REGION, 500);
        Animated.timing(cardAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        return;
      }
      setSelectedId(spot.id);
      setSpotWeather(null);
      mapRef.current?.animateToRegion(
        { latitude: spot.latitude, longitude: spot.longitude, ...SPOT_ZOOM_DELTA },
        600
      );
      Animated.spring(cardAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 9,
      }).start();
      // 날씨 fetch (비동기)
      fetchCurrentWeather(spot.latitude, spot.longitude).then(setSpotWeather);
    },
    [selectedId, cardAnim]
  );

  // 관광지 선택 시 주변 CCTV 미리 fetch
  useEffect(() => {
    if (!selectedSpot) { setCctvList([]); return; }
    setCctvList([]);
    setCctvLoading(true);
    fetchNearbyCCTVs(selectedSpot.latitude, selectedSpot.longitude, 1.5, ITS_CCTV_API_KEY)
      .then((list) => { setCctvList(list); setCctvLoading(false); })
      .catch(() => setCctvLoading(false));
  }, [selectedSpot]);

  const openCCTVModal = () => {
    setCctvIndex(0);
    setCctvView("list");
    setCctvModalVisible(true);
  };

  const onBack = () => navigation.goBack();

  const u = auth.currentUser;
  if (!u || u.isAnonymous) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.msg}>{getUIText(currentLanguage, "mapLoginRequired")}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.actionBtnText}>{getUIText(currentLanguage, "premiumLoginAction")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={onBack}>
          <Text style={styles.actionBtnSecondaryText}>{getUIText(currentLanguage, "mapBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasMapsKey) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.msg}>{getUIText(currentLanguage, "mapMissingKey")}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={onBack}>
          <Text style={styles.actionBtnText}>{getUIText(currentLanguage, "mapBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedCrowd = selectedSpot
    ? (crowdById[selectedSpot.id] ?? { count: 0, level: "green" as CrowdLevel })
    : null;

  const crowdLabelMap: Record<CrowdLevel, string> = {
    green: getUIText(currentLanguage, "mapLegendQuiet"),
    yellow: getUIText(currentLanguage, "mapLegendModerate"),
    red: getUIText(currentLanguage, "mapLegendBusy"),
  };

  return (
    <View style={styles.root}>
      {/* ── 상단 바 ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backIconBtn} hitSlop={12}>
          <ChevronLeft size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{getUIText(currentLanguage, "mapScreenTitle")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── 검색바 ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={16} color="#8E8E93" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="관광지 검색 (예: 명동, 경복궁)"
            placeholderTextColor="#C7C7CC"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); Keyboard.dismiss(); }}>
              <X size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {/* 검색 결과 드롭다운 */}
        {searchFocused && query.trim().length > 0 && (
          <View style={styles.searchDropdown}>
            {/* 로컬 관광지 (혼잡도 포함) */}
            {localResults.map((spot) => {
              const crowd = crowdById[spot.id] ?? { count: 0, level: "green" as CrowdLevel };
              return (
                <TouchableOpacity
                  key={spot.id}
                  style={styles.searchResultItem}
                  onPress={() => {
                    setQuery("");
                    setSearchFocused(false);
                    setPlaceResults([]);
                    Keyboard.dismiss();
                    selectSpot(spot);
                  }}
                >
                  <Text style={styles.searchResultEmoji}>{spot.emoji}</Text>
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultName}>{spot.nameKo}</Text>
                    <Text style={styles.searchResultEn}>혼잡도 실시간 제공</Text>
                  </View>
                  <View style={[styles.searchCrowdDot, { backgroundColor: CROWD_COLORS[crowd.level] }]} />
                </TouchableOpacity>
              );
            })}

            {/* 구분선 */}
            {localResults.length > 0 && placeResults.length > 0 && (
              <View style={styles.searchDivider}>
                <Text style={styles.searchDividerText}>기타 장소</Text>
              </View>
            )}

            {/* Google Places 결과 */}
            {placeResults.map((p) => (
              <TouchableOpacity
                key={p.placeId}
                style={styles.searchResultItem}
                onPress={() => goToPlace(p.placeId, p.main)}
              >
                <Text style={styles.searchResultEmoji}>📍</Text>
                <View style={styles.searchResultText}>
                  <Text style={styles.searchResultName}>{p.main}</Text>
                  {p.secondary ? (
                    <Text style={styles.searchResultEn} numberOfLines={1}>{p.secondary}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}

            {/* 로딩 */}
            {placeLoading && (
              <ActivityIndicator size="small" color="#E63946" style={{ marginVertical: 12 }} />
            )}

            {/* 결과 없음 */}
            {!placeLoading && localResults.length === 0 && placeResults.length === 0 && (
              <Text style={styles.searchNoResult}>검색 결과가 없습니다</Text>
            )}
          </View>
        )}
      </View>

      {/* ── 지도 ── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={SEOUL_REGION}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {/* 이동경로 */}
          {routeCoords.length > 1 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#4F46E5"
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}

          {selectedSpot && selectedCrowd && (
            <Marker
              coordinate={{
                latitude: selectedSpot.latitude,
                longitude: selectedSpot.longitude,
              }}
              title={selectedSpot.nameKo}
            >
              {/* 혼잡도 색상 링 + 이모지 마커 */}
              <View style={styles.markerOuter}>
                <View style={[styles.markerRing, { borderColor: CROWD_COLORS[selectedCrowd.level] }]}>
                  <View style={styles.customMarker}>
                    <Text style={styles.customMarkerEmoji}>{selectedSpot.emoji}</Text>
                  </View>
                </View>
                {/* 혼잡도 배지 */}
                <View style={[styles.markerBadge, { backgroundColor: CROWD_COLORS[selectedCrowd.level] }]}>
                  <Text style={styles.markerBadgeText}>{crowdLabelMap[selectedCrowd.level]}</Text>
                </View>
              </View>
            </Marker>
          )}
        </MapView>
      )}

      {/* ── 내 위치 버튼 ── */}
      {!loading && (
        <TouchableOpacity
          style={styles.myLocBtn}
          onPress={goToUserLocation}
          activeOpacity={0.85}
        >
          <Crosshair size={22} color="#E63946" strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      {/* ── 관광지 상세 바텀 시트 ── */}
      {selectedSpot && (
        <Animated.View
          style={[
            styles.detailSheet,
            { paddingBottom: insets.bottom + 16 },
            {
              transform: [{
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [500, 0],
                }),
              }],
              opacity: cardAnim,
            },
          ]}
        >
            {/* ── 시트 헤더 ── */}
            <View style={styles.detailSheetHeader}>
              <View style={styles.detailHandle} />
              <View style={styles.detailHeaderRow}>
                <Text style={styles.detailHeaderEmoji}>{selectedSpot?.emoji}</Text>
                <View style={styles.detailHeaderText}>
                  <Text style={styles.detailName}>{selectedSpot?.nameKo}</Text>
                  <View style={styles.detailChips}>
                    {selectedCrowd && (
                      <View style={[styles.detailChipCrowd, { backgroundColor: CROWD_BG[selectedCrowd.level] }]}>
                        <View style={[styles.detailCrowdDot, { backgroundColor: CROWD_COLORS[selectedCrowd.level] }]} />
                        <Text style={[styles.detailCrowdText, { color: CROWD_COLORS[selectedCrowd.level] }]}>
                          {crowdLabelMap[selectedCrowd.level]}
                        </Text>
                      </View>
                    )}
                    {spotWeather && (
                      <View style={styles.detailChip}>
                        <Text style={styles.detailChipText}>
                          {weatherEmoji(spotWeather.conditionType, spotWeather.isDaytime)}{" "}{spotWeather.temp}°C
                        </Text>
                      </View>
                    )}
                    <View style={styles.detailChip}>
                      <MapPin size={10} color="#6B7280" />
                      <Text style={styles.detailChipText}>{"\uC11C\uC6B8\uC2DC"}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.detailCloseBtn}
                  onPress={() => { setSelectedId(null); Animated.timing(cardAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(); }}
                  hitSlop={12}
                >
                  <X size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

              {/* ── 근처 실시간 영상 ── */}
              <View style={styles.detailCctvSection}>
                <View style={styles.detailCctvHeader}>
                  <View style={styles.detailCctvIconCircle}>
                    <Video size={14} color="white" />
                  </View>
                  <View>
                    <Text style={styles.detailCctvTitle}>{"\uADFC\uCC98 \uC2E4\uC2DC\uAC04 \uC601\uC0C1"}</Text>
                    <Text style={styles.detailCctvSub}>{"\uC8FC\uBCC0 CCTV\uB97C \uC2E4\uC2DC\uAC04\uC73C\uB85C \uD655\uC778\uD574\uC694"}</Text>
                  </View>
                </View>

                {cctvLoading ? (
                  <ActivityIndicator size="small" color="#E63946" style={{ marginVertical: 16 }} />
                ) : cctvList.length === 0 ? (
                  <Text style={styles.detailCctvEmpty}>
                    {ITS_CCTV_API_KEY
                      ? "\uBC18\uACBD 1.5km \uB0B4 CCTV\uAC00 \uC5C6\uC5B4\uC694"
                      : "API \uD0A4 \uC124\uC815 \uD6C4 \uC8FC\uBCC0 CCTV\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4"}
                  </Text>
                ) : (
                  cctvList.slice(0, 3).map((cctv, idx) => (
                    <TouchableOpacity
                      key={cctv.roadsectionid || idx}
                      style={styles.detailCctvItem}
                      onPress={() => { setCctvIndex(idx); setCctvView("player"); setCctvModalVisible(true); }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cctvLiveBadge}>
                        <View style={styles.cctvLiveDot} />
                        <Text style={styles.cctvLiveTxt}>LIVE</Text>
                      </View>
                      <View style={styles.cctvItemInfo}>
                        <Text style={styles.cctvItemName} numberOfLines={1}>{cctv.cctvname}</Text>
                        <Text style={styles.cctvItemDist}>
                          {cctv.distance != null ? `${cctv.distance}m` : ""}
                        </Text>
                      </View>
                      <ChevronRight size={16} color="#E63946" />
                    </TouchableOpacity>
                  ))
                )}

                <TouchableOpacity
                  style={styles.detailLiveBtn}
                  onPress={() => { setCctvView("list"); setCctvModalVisible(true); }}
                  activeOpacity={0.88}
                >
                  <Video size={16} color="white" />
                  <Text style={styles.detailLiveBtnText}>{"\uB77C\uC774\uBE0C \uC601\uC0C1 \uBCF4\uAE30"}</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
        </Animated.View>
      )}

      {/* ── 하단 관광지 목록 ── */}
      <View style={[styles.spotListWrap, { paddingBottom: insets.bottom + 8 }]}>

        {/* 헤더: 실시간 혼잡도 + 요약 카운터 */}
        <View style={styles.spotListHeader}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <TrendingUp size={13} color="#E63946" style={{ marginRight: 4 }} />
            <Text style={styles.spotListLabel}>실시간 혼잡도</Text>
          </View>
          <View style={styles.crowdSummaryRow}>
            {(["green", "yellow", "red"] as CrowdLevel[]).map((level) => {
              const cnt = spots.filter((s) => (crowdById[s.id]?.level ?? "green") === level).length;
              return (
                <View key={level} style={styles.summaryChip}>
                  <View style={[styles.summaryDot, { backgroundColor: CROWD_COLORS[level] }]} />
                  <Text style={[styles.summaryCount, { color: CROWD_COLORS[level] }]}>{cnt}</Text>
                  <Text style={styles.summaryLabel}>{crowdLabelMap[level]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spotListContent}
        >
          {spots.map((spot) => {
            const crowd = crowdById[spot.id] ?? { count: 0, level: "green" as CrowdLevel };
            const isSelected = selectedId === spot.id;
            return (
              <TouchableOpacity
                key={spot.id}
                style={[
                  styles.spotChip,
                  isSelected && styles.spotChipSelected,
                  { borderColor: isSelected ? "#E63946" : CROWD_COLORS[crowd.level] },
                ]}
                onPress={() => selectSpot(spot)}
                activeOpacity={0.8}
              >
                <Text style={styles.spotChipEmoji}>{spot.emoji}</Text>
                <View>
                  <Text style={[styles.spotChipName, isSelected && styles.spotChipNameSelected]}>
                    {spot.nameKo}
                  </Text>
                  {/* 혼잡도 텍스트 태그 */}
                  <View style={[styles.crowdTag, { backgroundColor: CROWD_BG[crowd.level] }]}>
                    <CrowdBars level={crowd.level} size={10} />
                    <Text style={[styles.crowdTagText, { color: CROWD_COLORS[crowd.level] }]}>
                      {crowdLabelMap[crowd.level]}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 범례 */}
        <View style={styles.legendRow}>
          {(["green", "yellow", "red"] as CrowdLevel[]).map((level) => (
            <View key={level} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: CROWD_COLORS[level] }]} />
              <Text style={styles.legendLabel}>
                {CROWD_EMOJI[level]} {crowdLabelMap[level]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── CCTV 모달 ── */}
      <Modal
        visible={cctvModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCctvModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.cctvBackdrop}
          activeOpacity={1}
          onPress={() => setCctvModalVisible(false)}
        >
          <View style={styles.cctvSheet} onStartShouldSetResponder={() => true}>
            {/* 핸들 */}
            <View style={styles.cctvHandle} />

            {cctvView === "list" ? (
              /* ── 목록 뷰 ── */
              <>
                <View style={styles.cctvListHeader}>
                  <Video size={18} color="#E63946" />
                  <Text style={styles.cctvSheetTitle}>
                    {"\uADFC\uCC98 CCTV \uB77C\uc774\ube0c"}
                  </Text>
                  {selectedSpot && (
                    <Text style={styles.cctvSheetSub}>
                      {selectedSpot.nameKo} {"\uC8FC\ubcc0"}
                    </Text>
                  )}
                </View>

                {cctvLoading ? (
                  <ActivityIndicator size="large" color="#E63946" style={{ marginVertical: 32 }} />
                ) : cctvList.length === 0 ? (
                  <View style={styles.cctvEmpty}>
                    <AlertCircle size={36} color="#D1D5DB" />
                    <Text style={styles.cctvEmptyTitle}>
                      {"\uC8FC\ubcc0\uc5d0 CCTV\uAC00 \uc5c6\uc5b4\uc694"}
                    </Text>
                    <Text style={styles.cctvEmptySub}>
                      {ITS_CCTV_API_KEY
                        ? "\uBC18\uACBD 1.5km \ub0b4 \ub4f1\ub85d\ub41c CCTV\uAC00 \uc5c6\uc2b5\ub2c8\ub2e4"
                        : "ITS_CCTV_API_KEY\uAC00 \uc124\uc815\ub418\uc9c0 \uc54a\uc558\uc5b4\uc694\n.env\uc5d0 \ud0a4\ub97c \ucd94\uac00\ud574 \uc8fc\uc138\uc694"}
                    </Text>
                  </View>
                ) : (
                  <>
                    <ScrollView style={styles.cctvListScroll} showsVerticalScrollIndicator={false}>
                      {cctvList.slice(0, 8).map((cctv, idx) => (
                        <TouchableOpacity
                          key={cctv.roadsectionid || idx}
                          style={[styles.cctvListItem, cctvIndex === idx && styles.cctvListItemActive]}
                          onPress={() => setCctvIndex(idx)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.cctvLiveBadge}>
                            <View style={styles.cctvLiveDot} />
                            <Text style={styles.cctvLiveTxt}>LIVE</Text>
                          </View>
                          <View style={styles.cctvItemInfo}>
                            <Text style={styles.cctvItemName} numberOfLines={1}>
                              {cctv.cctvname}
                            </Text>
                            <Text style={styles.cctvItemDist}>
                              {cctv.distance != null ? `${cctv.distance}m` : ""}
                            </Text>
                          </View>
                          <View style={[
                            styles.cctvSelectDot,
                            cctvIndex === idx && styles.cctvSelectDotActive,
                          ]} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.cctvPlayBtn}
                      onPress={() => setCctvView("player")}
                      activeOpacity={0.88}
                    >
                      <Video size={18} color="white" />
                      <Text style={styles.cctvPlayBtnText}>
                        {"\ub77c\uc774\ube0c \uc601\uc0c1 \ubcf4\uAE30"}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.cctvDisclaimer}>
                      {"⚠ \uc77c\ubd80 \uc9c0\uc5ed\uc740 \ub124\ud2b8\uc6cc\ud06c \ud658\uacbd\uc5d0 \ub530\ub77c \uc7ac\uc0dd\uc774 \uc81c\ud55c\ub420 \uc218 \uc788\uc5b4\uc694"}
                    </Text>
                  </>
                )}
              </>
            ) : (
              /* ── 플레이어 뷰 ── */
              <>
                {/* 헤더 */}
                <View style={styles.cctvPlayerHeader}>
                  <TouchableOpacity onPress={() => setCctvView("list")} hitSlop={10} style={styles.cctvPlayerBackBtn}>
                    <ChevronLeft size={20} color="#1C1C1E" />
                  </TouchableOpacity>
                  <Text style={styles.cctvPlayerTitle} numberOfLines={1}>
                    {"\uADFC\uCC98 CCTV \uB77C\uC774\uBE0C"}
                  </Text>
                  <Text style={styles.cctvPlayerCount}>{cctvIndex + 1} / {cctvList.length}</Text>
                </View>

                {/* 영상 플레이어 */}
                <View style={styles.cctvPlayerBox}>
                  <WebView
                    source={{ html: buildHLSPlayerHTML(cctvList[cctvIndex]?.cctvurl ?? "") }}
                    style={styles.cctvWebView}
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled
                    domStorageEnabled
                  />
                  <View style={styles.cctvLiveOverlay}>
                    <View style={styles.cctvLiveDot} />
                    <Text style={styles.cctvLiveOverlayTxt}>LIVE · HLS</Text>
                  </View>
                </View>

                {/* 카메라 정보 */}
                <View style={styles.cctvCamInfo}>
                  <Text style={styles.cctvCamName} numberOfLines={1}>
                    {cctvList[cctvIndex]?.cctvname ?? "CCTV"}
                  </Text>
                  <Text style={styles.cctvCamDist}>
                    {cctvList[cctvIndex]?.distance != null
                      ? `\uD604\uC7AC \uC7AC\uC0DD \uC911 \u00B7 ${cctvList[cctvIndex].distance}m`
                      : "\uD604\uC7AC \uC7AC\uC0DD \uC911"}
                  </Text>
                </View>

                {/* 다음/이전 버튼 */}
                <View style={styles.cctvNavRow}>
                  <TouchableOpacity
                    style={[styles.cctvNavPrevBtn, cctvIndex === 0 && styles.cctvNavBtnDisabled]}
                    onPress={() => cctvIndex > 0 && setCctvIndex(cctvIndex - 1)}
                    disabled={cctvIndex === 0}
                  >
                    <ChevronLeft size={15} color={cctvIndex === 0 ? "#D1D5DB" : "#6B7280"} />
                    <Text style={[styles.cctvNavTxt, cctvIndex === 0 && { color: "#D1D5DB" }]}>
                      {"\uC774\uC804"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cctvNavNextBtn,
                      cctvIndex === cctvList.length - 1 && styles.cctvNavBtnDisabled,
                    ]}
                    onPress={() => cctvIndex < cctvList.length - 1 && setCctvIndex(cctvIndex + 1)}
                    disabled={cctvIndex === cctvList.length - 1}
                  >
                    <Text style={[styles.cctvNavNextTxt, cctvIndex === cctvList.length - 1 && { color: "rgba(255,255,255,0.4)" }]}>
                      {"\uB2E4\uC74C \uCE74\uBA54\uB77C"}
                    </Text>
                    <ChevronRight size={15} color={cctvIndex === cctvList.length - 1 ? "rgba(255,255,255,0.4)" : "white"} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cctvDisclaimer}>
                  {"⚠ \uC77C\uBD80 \uC9C0\uC5ED\uC740 \uB124\uD2B8\uC6CC\uD06C \uD658\uACBD\uC5D0 \uB530\uB77C \uC7AC\uC0DD\uC774 \uC81C\uD55C\uB420 \uC218 \uC788\uC5B4\uC694"}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: "#E63946",
  },
  backIconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  searchWrap: {
    position: "absolute",
    top: Platform.OS === "ios" ? 106 : 70,
    left: 12,
    right: 12,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1C1C1E",
    paddingVertical: 0,
  },
  searchDropdown: {
    backgroundColor: "white",
    borderRadius: 14,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    overflow: "hidden",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  searchResultEmoji: { fontSize: 22 },
  searchResultText: { flex: 1 },
  searchResultName: { fontSize: 14, fontWeight: "700", color: "#1C1C1E" },
  searchResultEn: { fontSize: 11, color: "#8E8E93", marginTop: 1 },
  searchCrowdDot: { width: 10, height: 10, borderRadius: 5 },
  searchDivider: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchDividerText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8E8E93",
  },
  searchNoResult: {
    textAlign: "center",
    color: "#C7C7CC",
    fontSize: 13,
    paddingVertical: 16,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  map: { flex: 1 },
  markerOuter: {
    alignItems: "center",
  },
  markerRing: {
    padding: 4,
    borderRadius: 34,
    borderWidth: 3,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  customMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  customMarkerEmoji: { fontSize: 26 },
  markerBadge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markerBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "white",
  },
  myLocBtn: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "ios" ? 185 : 145,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
  },
  infoCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 260,
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  infoCrowdBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 14,
  },
  infoCrowdTextWrap: { flex: 1 },
  infoCrowdLevel: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  infoCrowdDesc: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    opacity: 0.85,
  },
  infoBody: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F0F0F0",
  },
  infoEmoji: { fontSize: 30 },
  infoTextWrap: { flex: 1 },
  infoName: { fontSize: 16, fontWeight: "800", color: "#1C1C1E" },
  infoNameEn: { fontSize: 11, color: "#8E8E93", marginTop: 2 },
  infoWeatherChip: {
    alignItems: "center",
    gap: 2,
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  infoWeatherIcon: { width: 32, height: 32 },
  infoWeatherEmoji: { fontSize: 20 },
  infoWeatherTemp: { fontSize: 13, fontWeight: "800", color: "#1C1C1E" },
  infoWeatherHumidity: { fontSize: 10, color: "#6B6B6B" },
  spotListWrap: {
    backgroundColor: "white",
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  spotListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E63946",
    marginRight: 2,
  },
  spotListLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1C1C1E",
  },
  crowdSummaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F5F5F5",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  summaryDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  summaryCount: {
    fontSize: 12,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#6B6B6B",
    fontWeight: "500",
  },
  spotListContent: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    gap: 8,
  },
  spotChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  spotChipSelected: {
    backgroundColor: "#FFF0F0",
  },
  spotChipEmoji: { fontSize: 20 },
  spotChipName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  spotChipNameSelected: {
    color: "#E63946",
  },
  crowdTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  crowdTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    paddingTop: 10,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F0F0F0",
    marginTop: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 4.5 },
  legendLabel: { fontSize: 11, color: "#6B6B6B", fontWeight: "500" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  msg: { fontSize: 16, textAlign: "center", color: "#333", marginBottom: 20 },
  actionBtn: {
    backgroundColor: "#E63946",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionBtnText: { color: "white", fontWeight: "700" },
  actionBtnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  actionBtnSecondaryText: { color: "#333", fontWeight: "600" },

  // ── CCTV 버튼 (info card 하단) ──
  cctvBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: "#1C1C1E",
    marginHorizontal: 14, marginBottom: 14, marginTop: 2,
    borderRadius: 14, paddingVertical: 11,
  },
  cctvBtnText: { color: "white", fontWeight: "700", fontSize: 13, flex: 1, textAlign: "center" },

  // ── CCTV 모달 ──
  cctvBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  cctvSheet: {
    backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: 32, maxHeight: "80%",
  },
  cctvHandle: {
    width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2,
    alignSelf: "center", marginTop: 12, marginBottom: 4,
  },
  cctvListHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  cctvSheetTitle: { fontSize: 17, fontWeight: "800", color: "#1C1C1E", flex: 1 },
  cctvSheetSub: { fontSize: 12, color: "#6B7280" },

  cctvEmpty: { alignItems: "center", paddingVertical: 36, paddingHorizontal: 24 },
  cctvEmptyTitle: { fontSize: 15, fontWeight: "700", color: "#374151", marginTop: 12, marginBottom: 6 },
  cctvEmptySub: { fontSize: 12, color: "#9CA3AF", textAlign: "center", lineHeight: 18 },

  cctvListScroll: { maxHeight: 300 },
  cctvListItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 13, paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F3F4F6",
  },
  cctvListItemActive: { backgroundColor: "#FFF5F5" },
  cctvLiveBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#DCFCE7", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
  },
  cctvLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
  cctvLiveTxt: { fontSize: 10, fontWeight: "800", color: "#16A34A" },
  cctvItemInfo: { flex: 1 },
  cctvItemName: { fontSize: 14, fontWeight: "600", color: "#1C1C1E" },
  cctvItemDist: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  cctvSelectDot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: "#E5E7EB",
  },
  cctvSelectDotActive: { borderColor: "#E63946", backgroundColor: "#E63946" },

  cctvPlayBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#E63946", borderRadius: 16, marginHorizontal: 20, marginTop: 14,
    paddingVertical: 14,
  },
  cctvPlayBtnText: { color: "white", fontWeight: "800", fontSize: 15 },

  // ── 플레이어 뷰 ──
  cctvPlayerHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  cctvPlayerBackBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center",
  },
  cctvPlayerTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  cctvPlayerCount: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
  cctvPlayerBox: {
    marginHorizontal: 16, height: 220, borderRadius: 18, overflow: "hidden",
    backgroundColor: "#000", position: "relative",
  },
  cctvWebView: { flex: 1, backgroundColor: "#000" },
  cctvLiveOverlay: {
    position: "absolute", top: 10, left: 10,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#EF4444", borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  cctvLiveOverlayTxt: { color: "white", fontSize: 11, fontWeight: "900", letterSpacing: 0.4 },
  cctvCamInfo: {
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4,
  },
  cctvCamName: { fontSize: 15, fontWeight: "800", color: "#1C1C1E" },
  cctvCamDist: { fontSize: 12, color: "#E63946", fontWeight: "600", marginTop: 3 },
  cctvNavRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, marginTop: 14, gap: 10,
  },
  cctvNavPrevBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  cctvNavNextBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999,
    backgroundColor: "#E63946",
    shadowColor: "#E63946", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  cctvNavBtn: { opacity: 1 },
  cctvNavBtnDisabled: { opacity: 0.4 },
  cctvNavTxt: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  cctvNavNextTxt: { fontSize: 13, fontWeight: "700", color: "white" },
  cctvNavCount: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  cctvDisclaimer: {
    fontSize: 11, color: "#9CA3AF", textAlign: "center",
    marginTop: 12, paddingHorizontal: 24, marginBottom: 4,
  },

  // ── 관광지 상세 바텀 시트 ──
  detailOverlay: { flex: 1, justifyContent: "flex-end" },
  detailDismiss: { flex: 1 },
  detailSheet: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: "62%",
    shadowColor: "#000", shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: -4 },
    zIndex: 30,
  },
  detailSheetHeader: {
    paddingHorizontal: 16, paddingTop: 0, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F0F0F0",
  },
  detailHandle: {
    width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2,
    alignSelf: "center", marginTop: 10, marginBottom: 14,
  },
  detailHeaderRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  detailHeaderEmoji: { fontSize: 36 },
  detailHeaderText: { flex: 1 },
  detailCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  detailCrowdDot: { width: 6, height: 6, borderRadius: 3 },
  detailCrowdText: { fontSize: 11, fontWeight: "800" },
  detailChipCrowd: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
  },
  detailInfoPad: { paddingHorizontal: 16, marginBottom: 8 },
  detailName: { fontSize: 18, fontWeight: "900", color: "#1C1C1E", marginBottom: 6 },
  detailTags: { flexDirection: "row", gap: 6, marginBottom: 8 },
  detailTag: {
    backgroundColor: "#F3F4F6", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  detailTagText: { fontSize: 11, fontWeight: "700", color: "#374151" },
  detailChips: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 4 },
  detailChip: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#F3F4F6", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
  },
  detailChipText: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  detailCctvSection: {
    marginHorizontal: 16, backgroundColor: "#FAFAFA", borderRadius: 20,
    padding: 16, marginBottom: 12,
  },
  detailCctvHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  detailCctvIconCircle: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: "#E63946",
    alignItems: "center", justifyContent: "center",
  },
  detailCctvTitle: { fontSize: 14, fontWeight: "800", color: "#1C1C1E" },
  detailCctvSub: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  detailCctvEmpty: {
    fontSize: 12, color: "#9CA3AF", textAlign: "center", paddingVertical: 16,
  },
  detailCctvItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F0F0F0",
  },
  detailLiveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#E63946", borderRadius: 14,
    paddingVertical: 13, marginTop: 14,
    shadowColor: "#E63946", shadowOpacity: 0.28, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  detailLiveBtnText: { color: "white", fontWeight: "800", fontSize: 14 },
  detailAiRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 16, paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#F0F0F0",
  },
  detailAiIconWrap: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  detailAiTextWrap: { flex: 1 },
  detailAiTitle: { fontSize: 14, fontWeight: "700", color: "#1C1C1E" },
  detailAiSub: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
});

export default TouristMapScreen;
