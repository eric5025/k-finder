import {
  collection,
  getDocs,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  DEFAULT_TOURIST_LOCATIONS,
  TouristLocation,
} from "../constants/touristLocations";

/** Ignore location pings older than this for crowd counts (ms). */
export const USER_LOCATION_MAX_AGE_MS = 5 * 60 * 1000;

export type CrowdLevel = "green" | "yellow" | "red";

export interface UserLocationDoc {
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: Timestamp | null;
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function crowdLevelFromCount(count: number): CrowdLevel {
  if (count <= 10) return "green";
  if (count <= 30) return "yellow";
  return "red";
}

export function crowdLevelColor(level: CrowdLevel): string {
  switch (level) {
    case "green":
      return "#22c55e";
    case "yellow":
      return "#eab308";
    case "red":
      return "#ef4444";
    default:
      return "#22c55e";
  }
}

function docToUserLocation(
  docId: string,
  data: Record<string, unknown>
): UserLocationDoc | null {
  const lat = data.latitude;
  const lng = data.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  const ts = data.timestamp;
  const timestamp = ts instanceof Timestamp ? ts : null;
  return { userId: docId, latitude: lat, longitude: lng, timestamp };
}

function isFresh(u: UserLocationDoc, nowMs: number): boolean {
  if (!u.timestamp) return false;
  const t = u.timestamp.toMillis();
  return nowMs - t <= USER_LOCATION_MAX_AGE_MS;
}

export function countUsersWithinRadius(
  spot: TouristLocation,
  users: UserLocationDoc[],
  nowMs: number = Date.now()
): number {
  const r = spot.radius > 0 ? spot.radius : 300;
  return users.filter(
    (u) =>
      isFresh(u, nowMs) &&
      haversineMeters(spot.latitude, spot.longitude, u.latitude, u.longitude) <=
        r
  ).length;
}

export function subscribeUserLocations(
  onUpdate: (users: UserLocationDoc[]) => void
): () => void {
  const ref = collection(db, "user_locations");
  return onSnapshot(ref, (snap) => {
    const list: UserLocationDoc[] = [];
    snap.forEach((d) => {
      const row = docToUserLocation(d.id, d.data() as Record<string, unknown>);
      if (row) list.push(row);
    });
    onUpdate(list);
  });
}

function firestoreRowToTourist(
  docId: string,
  data: Record<string, unknown>
): TouristLocation | null {
  const name = data.name;
  const lat = data.latitude;
  const lng = data.longitude;
  const radius = data.radius;
  if (typeof name !== "string" || typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }
  return {
    id: typeof data.id === "string" ? data.id : docId,
    name,
    latitude: lat,
    longitude: lng,
    radius: typeof radius === "number" && radius > 0 ? radius : 300,
  };
}

export async function fetchTouristLocations(): Promise<TouristLocation[]> {
  try {
    const ref = collection(db, "tourist_locations");
    const snap = await getDocs(ref);
    const out: TouristLocation[] = [];
    snap.forEach((d) => {
      const row = firestoreRowToTourist(d.id, d.data() as Record<string, unknown>);
      if (row) out.push(row);
    });
    if (out.length > 0) return out;
  } catch (e) {
    console.warn("fetchTouristLocations:", e);
  }
  return [...DEFAULT_TOURIST_LOCATIONS];
}
