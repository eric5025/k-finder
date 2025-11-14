import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNIap from "react-native-iap";
import { auth, db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const DAILY_FREE_LIMIT = 5;
const USAGE_STORAGE_KEY = "kfinder.search-usage";
const PREMIUM_STORAGE_KEY = "kfinder.search-premium";
const PREMIUM_EXPIRY_STORAGE_KEY = "kfinder.premium-expiry";
const PRODUCT_IDS = ["kfinder_unlimited_search"];
const PREMIUM_DURATION_MS = 5 * 24 * 60 * 60 * 1000;

interface UsageSnapshot {
  date: string;
  count: number;
}

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const readUsageFromStorage = async (): Promise<UsageSnapshot> => {
  const stored = await AsyncStorage.getItem(USAGE_STORAGE_KEY);
  if (!stored) {
    return { date: getTodayKey(), count: 0 };
  }

  try {
    const parsed = JSON.parse(stored) as UsageSnapshot;
    if (parsed.date !== getTodayKey()) {
      return { date: getTodayKey(), count: 0 };
    }
    return parsed;
  } catch (error) {
    console.warn("검색 사용량 파싱 실패, 초기화 진행:", error);
    return { date: getTodayKey(), count: 0 };
  }
};

export const useSearchLimit = () => {
  const [usageCount, setUsageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [products, setProducts] = useState<RNIap.Product[]>([]);

  const syncUsage = useCallback(async () => {
    const snapshot = await readUsageFromStorage();
    setUsageCount(snapshot.count);
    await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(snapshot));
  }, []);

  const applyPremiumState = useCallback(
    async (active: boolean, expiresAt?: string | null) => {
      setIsPremium(active);
      if (active && expiresAt) {
        await AsyncStorage.multiSet([
          [PREMIUM_STORAGE_KEY, "true"],
          [PREMIUM_EXPIRY_STORAGE_KEY, expiresAt],
        ]);
      } else {
        await AsyncStorage.multiRemove([
          PREMIUM_STORAGE_KEY,
          PREMIUM_EXPIRY_STORAGE_KEY,
        ]);
      }
    },
    []
  );

  const fetchPremiumStatus = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();
        const expiresAt = data?.premiumPass?.expiresAt as string | undefined;
        if (expiresAt && new Date(expiresAt).getTime() > Date.now()) {
          await applyPremiumState(true, expiresAt);
          return true;
        }
        await applyPremiumState(false, null);
        return false;
      }

      const localExpiresAt = await AsyncStorage.getItem(
        PREMIUM_EXPIRY_STORAGE_KEY
      );
      if (localExpiresAt && new Date(localExpiresAt).getTime() > Date.now()) {
        await applyPremiumState(true, localExpiresAt);
        return true;
      }
      await applyPremiumState(false, null);
      return false;
    } catch (error) {
      console.warn("프리미엄 상태 조회 실패:", error);
      return false;
    }
  }, [applyPremiumState]);

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        await RNIap.initConnection();
        if (Platform.OS === "android") {
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        }

        try {
          const loadedProducts = await RNIap.getProducts(PRODUCT_IDS);
          setProducts(loadedProducts);
        } catch (productError) {
          console.warn("인앱 상품 불러오기 실패:", productError);
        }

        await fetchPremiumStatus();
        await syncUsage();
      } catch (error) {
        console.warn("검색 제한 설정 오류:", error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    setup();

    return () => {
      isMounted = false;
      RNIap.endConnection();
    };
  }, [fetchPremiumStatus, syncUsage]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchPremiumStatus();
    });
    return unsubscribe;
  }, [fetchPremiumStatus]);

  const remainingCount = useMemo(() => {
    if (isPremium) return Infinity;
    return Math.max(DAILY_FREE_LIMIT - usageCount, 0);
  }, [isPremium, usageCount]);

  const canUseSearch = useCallback(() => {
    if (isPremium) return true;
    return usageCount < DAILY_FREE_LIMIT;
  }, [isPremium, usageCount]);

  const consumeSearch = useCallback(async () => {
    if (isPremium) return true;
    const latest = await readUsageFromStorage();
    if (latest.count >= DAILY_FREE_LIMIT) {
      return false;
    }

    const updatedSnapshot: UsageSnapshot = {
      date: getTodayKey(),
      count: latest.count + 1,
    };

    setUsageCount(updatedSnapshot.count);
    await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updatedSnapshot));
    return true;
  }, [isPremium]);

  const purchaseUnlimited = useCallback(async () => {
    try {
      const user = auth.currentUser;
      // 로그인 체크는 호출하는 쪽(HomeScreen)에서 처리
      if (!user || user.isAnonymous) {
        return;
      }

      if (!products.length) {
        Alert.alert(
          "상품 정보 없음",
          "스토어에서 상품 정보를 불러오지 못했습니다."
        );
        return;
      }

      const targetProduct = products.find(
        (item) => item.productId === PRODUCT_IDS[0]
      );

      if (!targetProduct) {
        Alert.alert("상품 정보 없음", "구매 가능한 상품을 찾을 수 없습니다.");
        return;
      }

      setIsProcessingPurchase(true);
      const purchase = await RNIap.requestPurchase({
        productId: targetProduct.productId,
        offerToken: targetProduct.subscriptionOfferDetails?.[0]?.offerToken,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });

      if (purchase) {
        await RNIap.finishTransaction({ purchase, isConsumable: false });
        const expiresAt = new Date(
          Date.now() + PREMIUM_DURATION_MS
        ).toISOString();
        await setDoc(
          doc(db, "users", user.uid),
          {
            premiumPass: {
              productId: targetProduct.productId,
              expiresAt,
              updatedAt: new Date().toISOString(),
            },
          },
          { merge: true }
        );
        await applyPremiumState(true, expiresAt);
        Alert.alert("완료", "5일 패스가 활성화되었습니다.");
      }
    } catch (error: any) {
      if (error?.code !== "E_USER_CANCELLED") {
        console.error("구매 오류:", error);
        Alert.alert(
          "오류",
          "결제를 완료할 수 없습니다. 잠시 후 다시 시도해주세요."
        );
      }
    } finally {
      setIsProcessingPurchase(false);
    }
  }, [applyPremiumState, products]);

  const showLimitAlert = useCallback(() => {
    Alert.alert(
      "검색 제한",
      "무료 버전은 하루 5회까지만 검색할 수 있습니다.\n무제한 검색으로 업그레이드해보세요!",
      [
        { text: "닫기", style: "cancel" },
        { text: "무제한 검색", onPress: purchaseUnlimited },
      ]
    );
  }, [purchaseUnlimited]);

  return {
    isReady,
    isPremium,
    remainingCount,
    canUseSearch,
    consumeSearch,
    purchaseUnlimited,
    isProcessingPurchase,
    showLimitAlert,
    products,
  };
};

