# 🧡 TravelLens

**AI 기반 한국 여행 올인원 앱**

한국을 여행하는 외국인을 위한 앱으로, 모르는 음식·장소·물건을 사진 한 장으로 즉시 확인하고,
실시간 혼잡도 지도와 CCTV 라이브 영상으로 스마트하게 여행할 수 있습니다.

---

## 📱 주요 기능

### 🔍 AI 사진 검색
- 카메라로 찍거나 갤러리에서 사진을 선택하면 AI가 즉시 분석
- 음식, 기념품, 관광지, 간판 등 다양한 대상 인식
- Perplexity AI 기반, 인식 정확도 95%+

### 🗺️ 실시간 혼잡도 지도
- 서울 주요 관광지의 실시간 혼잡도 표시 (여유 / 보통 / 혼잡 / 매우혼잡)
- 색상 마커로 한눈에 확인 가능한 인터랙티브 지도
- 관광지 탭 시 상세 정보 (날씨, 혼잡도, 위치) 바텀 시트 표시

### 📹 실시간 CCTV 라이브
- 국토교통부 ITS CCTV API 연동
- 관광지 주변 CCTV HLS 스트림 실시간 재생
- 관광지 상세 화면에서 근처 카메라 목록 및 라이브 영상 확인

### 🌤️ 날씨 정보
- Open-Meteo API 기반 현재 날씨 및 기온
- 강수확률 실시간 표시
- 선택한 관광지의 현지 날씨 확인

### 👟 오늘의 걸음수
- expo-sensors Pedometer 기반 일일 걸음수 추적
- 홈 화면 날씨 옆에 한 줄로 표시

### 🚻 화장실 찾기
- 주변 공중화장실 위치 안내 (예정)

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React Native + Expo (SDK 52) |
| Build | EAS Build (iOS / Android) |
| Auth | Firebase Authentication (Google / 익명) |
| DB | Firebase Firestore |
| 지도 | react-native-maps |
| AI 검색 | Perplexity AI API |
| 날씨 | Open-Meteo API |
| CCTV | 국토교통부 ITS CCTV API |
| 비디오 | react-native-webview + HLS.js |
| 위치 | expo-location |
| 걸음수 | expo-sensors (Pedometer) |
| 언어 | TypeScript |
| 다국어 | 자체 i18n (한/영/일/중/불) |

---

## 🌍 지원 언어

- 🇰🇷 한국어
- 🇺🇸 English
- 🇯🇵 日本語
- 🇨🇳 中文
- 🇫🇷 Français

---

## 🚀 실행 방법

```bash
# 의존성 설치
cd TravelLens
npm install

# 개발 서버 실행
npx expo start

# iOS 개발 빌드
eas build --platform ios --profile development

# Android 개발 빌드
eas build --platform android --profile development
```

---

## 🔑 환경 변수 설정

`TravelLens/.env` 파일을 생성하고 아래 항목을 설정하세요:

```env
PERPLEXITY_API_KEY=your_perplexity_api_key
ITS_CCTV_API_KEY=your_its_cctv_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

---

## 📁 프로젝트 구조

```
TravelLens/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # 메인 홈 화면
│   │   ├── TouristMapScreen.tsx    # 혼잡도 지도 + CCTV
│   │   ├── LoginScreen.tsx         # 로그인
│   │   └── ProfileScreen.tsx       # 프로필
│   ├── components/
│   │   ├── CrowdMarker.tsx         # 혼잡도 마커
│   │   ├── HomeMapPreview.tsx      # 홈 지도 미리보기
│   │   └── LanguageDropdown.tsx    # 언어 선택
│   ├── services/
│   │   ├── weatherService.ts       # Open-Meteo 날씨
│   │   ├── crowdService.ts         # 혼잡도 데이터
│   │   ├── locationService.ts      # 위치 추적
│   │   ├── cctvService.ts          # ITS CCTV API
│   │   └── perplexity.ts           # AI 이미지 검색
│   ├── constants/
│   │   └── touristLocations.ts     # 관광지 데이터
│   └── i18n/
│       └── translations.ts         # 다국어 번역
├── app.config.js
├── eas.json
└── package.json
```

---

## 📄 라이선스

MIT License
