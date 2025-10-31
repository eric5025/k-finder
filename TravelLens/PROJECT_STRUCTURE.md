# 📁 TravelLens 프로젝트 구조

## 🏗️ 디렉토리 구조

```
TravelLens/
├── src/
│   ├── screens/              # 화면 컴포넌트
│   │   ├── HomeScreen.tsx           # 메인 홈 화면
│   │   ├── LanguageSelectionScreen.tsx  # 언어 선택 화면
│   │   ├── LoadingScreen.tsx        # AI 분석 로딩 화면
│   │   ├── SearchResultsScreen.tsx  # 검색 결과 화면
│   │   ├── DetailScreen.tsx         # 기념품 상세 정보
│   │   └── HistoryScreen.tsx        # 검색 히스토리
│   │
│   ├── components/           # 재사용 컴포넌트
│   │   ├── MapView.tsx             # 지도 컴포넌트
│   │   ├── KakaoMap.tsx            # 카카오 지도
│   │   ├── PremiumMapView.tsx      # 프리미엄 지도 뷰
│   │   ├── PremiumModal.tsx        # 프리미엄 모달
│   │   └── StarRating.tsx          # 별점 컴포넌트
│   │
│   ├── services/             # API 및 서비스
│   │   ├── firebase.ts             # Firebase 설정 및 초기화
│   │   ├── perplexity.ts           # Perplexity AI 이미지 분석
│   │   ├── favorites.ts            # 즐겨찾기 관리
│   │   └── searchHistory.ts        # 검색 히스토리 관리
│   │
│   ├── i18n/                # 다국어 지원
│   │   └── index.ts                # i18n 설정 (한/영/일/중/스페인어)
│   │
│   ├── types/               # TypeScript 타입
│   │   ├── index.ts                # 공통 타입 정의
│   │   └── env.d.ts                # 환경 변수 타입
│   │
│   ├── data/                # 정적 데이터
│   │   └── souvenirs.ts            # 기념품 샘플 데이터
│   │
│   ├── constants/           # 상수
│   │   └── index.ts                # 앱 상수
│   │
│   └── assets/              # 이미지 등 자산
│
├── android/                 # Android 네이티브 코드
├── assets/                  # Expo 자산 (아이콘, 스플래시)
├── .env                     # 환경 변수 (Git 제외됨) ⚠️
├── env.example             # 환경 변수 템플릿
├── ENV_SETUP.md            # 환경 변수 설정 가이드
├── babel.config.js         # Babel 설정
├── app.json               # Expo 앱 설정
├── App.tsx                # 앱 진입점
└── package.json           # 의존성 관리
```

## 🔑 핵심 파일 설명

### 환경 설정
- **`.env`** - 실제 API 키 저장 (Git에 커밋 금지!)
- **`env.example`** - 환경 변수 템플릿
- **`babel.config.js`** - react-native-dotenv 플러그인 설정

### 서비스 계층
- **`services/firebase.ts`** - Firestore 데이터베이스, 인증
- **`services/perplexity.ts`** - AI 이미지 분석 및 번역
- **`services/favorites.ts`** - 즐겨찾기 CRUD
- **`services/searchHistory.ts`** - 검색 기록 관리

### 화면 흐름
1. `LanguageSelectionScreen` → 언어 선택
2. `HomeScreen` → 카메라/갤러리 선택
3. `LoadingScreen` → AI 분석 진행
4. `SearchResultsScreen` → 결과 목록
5. `DetailScreen` → 상세 정보
6. `HistoryScreen` → 과거 검색 기록

## 🔐 보안 모범 사례

### ✅ 현재 적용된 보안
- [x] API 키를 환경 변수로 관리
- [x] .env 파일 Git 제외 (.gitignore)
- [x] TypeScript 타입 안정성
- [x] Firebase 보안 규칙 (설정 필요)

### ⚠️ 추가 권장 사항
- [ ] Firebase 보안 규칙 강화
- [ ] API 요청 속도 제한
- [ ] 사용자 입력 검증
- [ ] HTTPS 강제 사용

## 📦 주요 의존성

### 프레임워크
- **React Native** - 크로스 플랫폼 앱 프레임워크
- **Expo** - React Native 개발 도구

### UI/UX
- **React Navigation** - 화면 네비게이션
- **Lucide React Native** - 아이콘
- **Expo Linear Gradient** - 그라데이션

### 기능
- **Firebase** - 백엔드 서비스
- **Expo Camera** - 카메라 접근
- **Expo Image Picker** - 이미지 선택
- **Expo Location** - 위치 서비스
- **React Native WebView** - 지도 표시

### 개발 도구
- **TypeScript** - 타입 안정성
- **react-native-dotenv** - 환경 변수

## 🚀 개발 워크플로우

### 1. 초기 설정
```bash
cd TravelLens
npm install
cp env.example .env
# .env 파일에 실제 API 키 입력
```

### 2. 개발 서버 시작
```bash
npx expo start
```

### 3. 테스트
- **Expo Go 앱**: QR 코드 스캔
- **Android**: `a` 키 입력
- **iOS**: `i` 키 입력 (Mac 필요)
- **웹**: `w` 키 입력

## 🔄 상태 관리

현재는 React의 기본 useState/useContext 사용.
향후 복잡도 증가 시 Redux Toolkit 또는 Zustand 고려.

## 🌐 다국어 지원

i18n 모듈을 통해 5개 언어 지원:
- 한국어 (ko)
- 영어 (en)
- 일본어 (ja)
- 중국어 (zh)
- 스페인어 (es)

## 📱 화면별 기능

| 화면 | 주요 기능 | 사용 API |
|------|----------|----------|
| Home | 카메라/갤러리 접근 | Expo Camera, Image Picker |
| Loading | AI 이미지 분석 | Perplexity AI |
| Results | 기념품 검색 결과 | Firebase Firestore |
| Detail | 상세 정보, 지도 | Google Maps / Kakao Map |
| History | 검색 기록 | Firebase Firestore |

## 🐛 디버깅

### Metro Bundler 캐시 지우기
```bash
npx expo start -c
```

### 환경 변수 문제
1. Metro Bundler 재시작
2. `.env` 파일 위치 확인
3. `babel.config.js` 설정 확인

### TypeScript 오류
```bash
npx tsc --noEmit
```

## 📄 라이선스

MIT License (또는 프로젝트에 맞는 라이선스)


