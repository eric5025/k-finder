# 🧡 Korea Finder - AI 기반 한국 기념품 인식 앱

외국인 관광객을 위한 AI 기반 모바일 앱. 사진을 찍으면 한국 기념품을 자동으로 인식하고 다국어 정보를 제공합니다.


---

## ✨ 핵심 기능 (MVP)

### 1. 🔐 로그인
- Google 계정 로그인
- 익명 로그인 (바로 사용)

### 2. 📸 AI 이미지 검색
- 카메라 촬영 또는 갤러리 선택
- Perplexity AI 이미지 분석
- 5개 언어 번역 (한/영/일/중/스페인어)

### 3. 💾 검색 기록
- Firebase Firestore에 자동 저장
- 검색 히스토리 화면에서 조회

---

## 🛠️ 기술 스택

- **React Native (Expo SDK 54)** - 크로스 플랫폼
- **TypeScript** - 타입 안전성
- **Firebase** - 인증 & 데이터베이스
- **Perplexity AI** - 이미지 분석 & 번역

---

## 🚀 빠른 시작

### 1. 설치

```bash
cd TravelLens
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```env
PERPLEXITY_API_KEY=your_perplexity_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:xxxx
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Firebase 설정

Firebase Console에서:
1. **Authentication** → **로그인 방법**
2. **Anonymous** 활성화 (필수)
3. **Google** 활성화 (권장)

### 4. 실행

```bash
npx expo start
```

Expo Go 앱으로 QR 코드 스캔!

---

## 📱 화면 구조

```
언어 선택 → 로그인 → 홈 → 검색 → 결과 표시
                 ↓
              검색 기록
```

**6개 화면:**
1. `LanguageSelectionScreen` - 언어 선택
2. `LoginScreen` - 로그인 (Google / 익명)
3. `HomeScreen` - 카메라/갤러리
4. `LoadingScreen` - AI 분석 중
5. `DetailScreen` - 결과 표시
6. `HistoryScreen` - 검색 기록

---

## 📁 프로젝트 구조

```
src/
├── screens/           # 6개 화면
├── services/          # API 서비스
│   ├── auth.ts       # 로그인
│   ├── firebase.ts   # Firebase 설정
│   ├── perplexity.ts # AI 분석
│   └── searchHistory.ts # 검색 기록
├── i18n/             # 다국어 지원
├── types/            # TypeScript 타입
└── constants/        # 상수 정의
```

---

## 🔐 API 키 발급

### Perplexity AI
[perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)

### Firebase
[console.firebase.google.com](https://console.firebase.google.com)

---

## 📦 빌드 및 배포

```bash
# EAS CLI 설치
npm install -g eas-cli

# 로그인
eas login

# iOS 빌드 (Mac 불필요!)
eas build --platform ios

# Android 빌드
eas build --platform android
```

자세한 내용: [EAS Build 문서](https://docs.expo.dev/build/introduction/)

---

## 🎯 MVP 범위

### ✅ 포함됨
- 로그인 (Google / 익명)
- AI 이미지 검색
- 검색 기록 저장/조회
- 5개 언어 지원

### ❌ 제외됨 (향후 추가)
- 즐겨찾기
- 지도 기능
- 프리미엄 구독
- 소셜 공유
- Apple Sign-in

---

**Korea Finder** - 한국 기념품을 더 쉽게 발견하세요! 🇰🇷✨
