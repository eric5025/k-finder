# TravelLens (Korea Finder)

한국 여행자를 위한 **AI 사진 검색**과 **실시간 혼잡도 지도·CCTV**를 한 앱에서 쓰는 React Native(Expo) 프로젝트입니다.

**저장소:** [github.com/eric5025/k-finder](https://github.com/eric5025/k-finder)

앱 소스는 루트의 `TravelLens/` 폴더에 있습니다.

---

## 주요 기능

| 영역 | 설명 |
|------|------|
| **AI 사진 검색** | 카메라·갤러리 이미지를 Perplexity API로 분석해 음식·물건·장소 등 안내 |
| **실시간 혼잡도 지도** | 관광지 마커와 색상으로 혼잡도 표시, 탭 시 바텀 시트에 날씨·혼잡도·근처 CCTV |
| **CCTV 라이브** | 국토교통부 ITS CCTV API로 근처 카메라 목록·HLS 스트림(WebView + hls.js) 재생 |
| **날씨** | Open-Meteo로 현재 기온·상태·강수확률 (홈·지도 선택 지점) |
| **걸음수** | `expo-sensors` Pedometer로 당일 걸음수 (네이티브 개발 빌드 필요) |
| **홈 UI** | 히어로 슬라이드, 혼잡도 바, 2×2 기능 그리드(사진 검색·지도·화장실·CCTV), 인기 관광지 가로 스크롤 |
| **인증·데이터** | Firebase Auth(Google·익명), Firestore(검색 기록 등) |
| **다국어** | 한·영·일·중·불 (`src/i18n/translations.ts`) |

> **화장실 찾기** 카드는 현재 관광 지도 화면으로 이동합니다. 전용 화장실 검색은 추후 확장 여지가 있습니다.

---

## 요구 사항

- Node.js 18+
- [Expo CLI / EAS](https://docs.expo.dev/) (빌드·배포 시)
- **지도·Pedometer 등:** `expo start`만으로는 일부 네이티브 모듈이 제한될 수 있어 **development build** 사용을 권장합니다.

---

## 빠른 시작

```bash
git clone https://github.com/eric5025/k-finder.git
cd k-finder/TravelLens
cp env.example .env   # Windows: copy env.example .env
npm install
npm run start         # dev client + tunnel (package.json 스크립트 기준)
```

Metro 캐시 문제 시:

```bash
npx expo start --dev-client --clear
```

---

## 환경 변수

`TravelLens/.env`에 설정합니다. 키 이름은 `env.example`과 동일하게 맞추면 됩니다.

| 변수 | 용도 |
|------|------|
| `PERPLEXITY_API_KEY` | AI 이미지 분석 |
| `GOOGLE_MAPS_API_KEY` | 네이티브 지도(Android·iOS 빌드 시 `app.config.js` 등으로 주입) |
| `KAKAO_MAP_API_KEY` | 카카오 지도 연동 시 |
| `FIREBASE_*` | Firebase 클라이언트 설정 |
| `ITS_CCTV_API_KEY` | [공공데이터포털](https://www.data.go.kr) **국가교통정보센터_실시간 CCTV 영상 정보** API |
| `GOOGLE_WEB_CLIENT_ID` / `GOOGLE_IOS_CLIENT_ID` | Google 로그인(EAS 빌드 시 시크릿으로 주입 권장) |

ITS CCTV 등 공공 API 신청 시 **서비스 URL**로 GitHub 저장소 또는 Pages 주소를 등록할 수 있습니다.

`.env`는 Git에 올리지 마세요(`.gitignore`에 포함).

---

## 기술 스택 (요약)

- **Expo SDK 54** · React Native 0.81 · TypeScript  
- **내비게이션:** `@react-navigation/native` / stack  
- **지도:** `react-native-maps`  
- **인증·DB:** Firebase  
- **인앱 결제:** `react-native-iap`  
- **기타:** `expo-location`, `expo-image-picker`, `expo-linear-gradient`, `lucide-react-native`, `react-native-webview`

---

## 프로젝트 구조 (발췌)

```
k-finder/
└── TravelLens/
    ├── app.config.js
    ├── eas.json
    ├── env.example
    ├── package.json
    └── src/
        ├── screens/          # Home, TouristMap, Login, Profile …
        ├── components/       # CrowdMarker, HomeMapPreview, …
        ├── services/         # perplexity, weather, crowd, location, cctv
        ├── constants/        # touristLocations
        └── i18n/
```

---

## 빌드

```bash
cd TravelLens
npm run build:ios      # eas build --platform ios
npm run build:android  # eas build --platform android
```

EAS 빌드 시 필요한 시크릿은 Expo 대시보드에 등록하고, `app.config.js`에서 빌드용 `.env` 생성 로직을 참고하세요.

---

## 라이선스

이 저장소의 `package.json`은 `"private": true`입니다. 별도 `LICENSE` 파일이 없으면 기본적으로 모든 권리는 저작권자에게 있습니다. 오픈소스 라이선스를 적용하려면 `LICENSE` 파일을 추가하세요.
