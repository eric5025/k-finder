/**
 * 국토교통부 ITS 실시간 CCTV 정보 서비스
 * API: https://openapi.its.go.kr:9443/cctvInfo
 * 공공데이터포털(data.go.kr) 에서 API 키 발급 후 .env에 ITS_CCTV_API_KEY 추가
 */

const ITS_BASE_URL = "https://openapi.its.go.kr:9443/cctvInfo";

export interface CCTVItem {
  cctvname: string;
  cctvurl: string;       // HLS 또는 MJPEG 스트림 URL
  coordx: number;        // 경도 (longitude)
  coordy: number;        // 위도 (latitude)
  roadsectionid: string;
  distance?: number;     // 기준점으로부터의 거리 (m), 클라이언트에서 계산
}

/** Haversine 공식으로 두 좌표 간 거리(m) 계산 */
function haversineMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 특정 좌표 주변의 CCTV 목록을 가져옵니다.
 * @param lat 기준 위도
 * @param lng 기준 경도
 * @param radiusKm 검색 반경 (km, 기본 1.5km)
 * @param apiKey ITS CCTV API 키
 * @returns 거리 순 정렬된 CCTV 목록
 */
export async function fetchNearbyCCTVs(
  lat: number,
  lng: number,
  radiusKm = 1.5,
  apiKey?: string
): Promise<CCTVItem[]> {
  if (!apiKey) {
    console.warn("ITS_CCTV_API_KEY가 설정되지 않았습니다.");
    return [];
  }

  // 바운딩 박스 계산 (1도 ≈ 111km)
  const delta = radiusKm / 111;
  const minX = (lng - delta).toFixed(6);
  const maxX = (lng + delta).toFixed(6);
  const minY = (lat - delta).toFixed(6);
  const maxY = (lat + delta).toFixed(6);

  const url =
    `${ITS_BASE_URL}?apiKey=${encodeURIComponent(apiKey)}` +
    `&type=its&cctvType=1` +
    `&minX=${minX}&maxX=${maxX}&minY=${minY}&maxY=${maxY}` +
    `&getType=json`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`ITS CCTV API 오류: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const items: any[] = json?.response?.data ?? [];

    return items
      .map((item: any): CCTVItem => ({
        cctvname: item.cctvname ?? "CCTV",
        cctvurl: item.cctvurl ?? "",
        coordx: parseFloat(item.coordx ?? "0"),
        coordy: parseFloat(item.coordy ?? "0"),
        roadsectionid: item.roadsectionid ?? "",
        distance: Math.round(
          haversineMeters(lat, lng, parseFloat(item.coordy ?? "0"), parseFloat(item.coordx ?? "0"))
        ),
      }))
      .filter((c) => c.cctvurl.length > 0)
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
      .slice(0, 10); // 최대 10개
  } catch (e: any) {
    if (e?.name === "AbortError") {
      console.warn("ITS CCTV API 타임아웃");
    } else {
      console.warn("ITS CCTV fetch 실패:", e);
    }
    return [];
  }
}

/**
 * CCTV URL 타입 감지
 * - "hls": .m3u8 스트림
 * - "mjpeg": MJPEG 스트림 (이미지 태그 새로고침 방식)
 * - "unknown": 알 수 없음
 */
export function detectCCTVType(url: string): "hls" | "mjpeg" | "unknown" {
  if (url.includes(".m3u8")) return "hls";
  if (url.includes("mjpeg") || url.includes("axis-cgi")) return "mjpeg";
  return "hls"; // ITS는 대부분 HLS
}

/** HLS 스트림 재생용 WebView HTML 생성 */
export function buildHLSPlayerHTML(streamUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
  video { width: 100%; height: 100%; object-fit: contain; background: #000; }
  #err { color: #fff; font-size: 14px; text-align: center; padding: 20px; display: none; }
</style>
</head>
<body>
<video id="v" autoplay muted playsinline controls></video>
<div id="err">영상을 불러올 수 없습니다.<br/>네트워크 환경을 확인해 주세요.</div>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js"></script>
<script>
  const video = document.getElementById('v');
  const err = document.getElementById('err');
  const src = '${streamUrl.replace(/'/g, "\\'")}';
  if (Hls.isSupported()) {
    const hls = new Hls({ enableWorker: false });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    hls.on(Hls.Events.ERROR, (e, d) => {
      if (d.fatal) { err.style.display = 'block'; video.style.display = 'none'; }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    video.play();
  } else {
    err.style.display = 'block';
    video.style.display = 'none';
  }
</script>
</body>
</html>`;
}
