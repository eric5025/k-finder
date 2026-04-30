import * as Location from "expo-location";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export const LOCATION_UPLOAD_INTERVAL_MS = 60_000;

// ── 오늘 이동경로 추적 ──────────────────────────────────────────
export interface RouteCoord { latitude: number; longitude: number }

let routeCoords: RouteCoord[] = [];
let routeListeners: Array<(coords: RouteCoord[]) => void> = [];

export function subscribeRouteCoords(cb: (coords: RouteCoord[]) => void): () => void {
  routeListeners.push(cb);
  cb([...routeCoords]);
  return () => { routeListeners = routeListeners.filter(l => l !== cb); };
}

function pushRouteCoord(coord: RouteCoord) {
  // 최소 10m 이상 이동 시만 추가 (노이즈 제거)
  if (routeCoords.length > 0) {
    const last = routeCoords[routeCoords.length - 1];
    const dlat = coord.latitude - last.latitude;
    const dlng = coord.longitude - last.longitude;
    const distDeg = Math.sqrt(dlat * dlat + dlng * dlng);
    if (distDeg < 0.0001) return; // ~11m 이하 무시
  }
  routeCoords = [...routeCoords, coord];
  routeListeners.forEach(l => l([...routeCoords]));
}

export function clearRouteCoords() {
  routeCoords = [];
  routeListeners.forEach(l => l([]));
}
// ──────────────────────────────────────────────────────────────

export function isEligibleForLocationSharing(): boolean {
  const u = auth.currentUser;
  return !!u && !u.isAnonymous;
}

export async function ensureForegroundLocationPermission(): Promise<boolean> {
  const { status: existing } = await Location.getForegroundPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function isForegroundLocationDenied(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === "denied";
}

/** One-shot fix for centering the map (and optional UI). */
export async function getCurrentCoordinates(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const ok = await ensureForegroundLocationPermission();
  if (!ok) return null;
  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = pos.coords;
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }
    return { latitude, longitude };
  } catch {
    return null;
  }
}

async function uploadCurrentLocation(): Promise<void> {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const { latitude, longitude } = pos.coords;

  // 이동경로에 추가 (로그인 여부 무관)
  pushRouteCoord({ latitude, longitude });

  // Firestore 업로드는 로그인 사용자만
  if (!isEligibleForLocationSharing()) return;
  const user = auth.currentUser;
  if (!user) return;

  await setDoc(
    doc(db, "user_locations", user.uid),
    {
      userId: user.uid,
      latitude,
      longitude,
      timestamp: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Writes location every {@link LOCATION_UPLOAD_INTERVAL_MS}. Call stop() on unmount.
 */
export function startPeriodicLocationUpload(): {
  stop: () => void;
} {
  let timer: ReturnType<typeof setInterval> | null = null;
  let cancelled = false;

  const tick = async () => {
    if (cancelled || !isEligibleForLocationSharing()) return;
    try {
      await uploadCurrentLocation();
    } catch (e) {
      console.warn("location upload failed:", e);
    }
  };

  void (async () => {
    const ok = await ensureForegroundLocationPermission();
    if (!ok || cancelled) return;
    await tick();
    if (cancelled) return;
    timer = setInterval(tick, LOCATION_UPLOAD_INTERVAL_MS);
  })();

  return {
    stop: () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      timer = null;
    },
  };
}
