# 환경 변수 설정 가이드 (Environment Setup Guide)

## 📋 개요

TravelLens 앱은 보안을 위해 모든 API 키와 설정을 환경 변수로 관리합니다.

## 🚀 빠른 시작

1. **`.env` 파일 생성**
   ```bash
   cp env.example .env
   ```

2. **API 키 설정**
   `.env` 파일을 열고 실제 API 키를 입력하세요.

## 🔑 필요한 API 키

### 1. Perplexity AI (필수)
- **용도**: 이미지 분석 및 AI 번역
- **취득 방법**: [Perplexity API](https://www.perplexity.ai/settings/api) 에서 발급
- **환경 변수**: `PERPLEXITY_API_KEY`

### 2. Firebase (필수)
- **용도**: 데이터베이스, 인증, 스토리지
- **취득 방법**: [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
- **환경 변수**:
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`
  - `FIREBASE_MEASUREMENT_ID`

### 3. Google Maps API (선택)
- **용도**: 지도 표시 및 위치 검색
- **취득 방법**: [Google Cloud Console](https://console.cloud.google.com/) Maps JavaScript API 활성화
- **환경 변수**: `GOOGLE_MAPS_API_KEY`

### 4. Kakao Map API (선택)
- **용도**: 카카오 지도 (Google Maps 대체)
- **취득 방법**: [Kakao Developers](https://developers.kakao.com/)에서 앱 생성
- **환경 변수**: `KAKAO_MAP_API_KEY`

## 📝 .env 파일 예시

```env
# Perplexity AI API
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Maps API
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Kakao Map API
KAKAO_MAP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Firebase Configuration
FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxxxxxx
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
APP_ENV=development
DEBUG=true
```

## ⚠️ 보안 주의사항

1. **절대 .env 파일을 Git에 커밋하지 마세요!**
   - `.gitignore`에 이미 `.env`가 포함되어 있습니다.

2. **API 키를 코드에 하드코딩하지 마세요!**
   - 항상 `@env` 모듈을 통해 환경 변수를 import 하세요.

3. **공개 저장소에 API 키 노출 금지**
   - 실수로 커밋했다면 즉시 API 키를 재발급하세요.

## 🔧 트러블슈팅

### "환경 변수를 찾을 수 없습니다" 오류

1. `.env` 파일이 `TravelLens/` 폴더 안에 있는지 확인
2. Metro bundler 재시작:
   ```bash
   npx expo start -c
   ```

### TypeScript 타입 오류

환경 변수 타입 정의는 `src/types/env.d.ts`에 있습니다.
새로운 환경 변수를 추가했다면 이 파일도 업데이트하세요.

## 📚 관련 파일

- `env.example` - 환경 변수 템플릿
- `src/types/env.d.ts` - TypeScript 타입 정의
- `babel.config.js` - react-native-dotenv 설정
- `.gitignore` - .env 파일 Git 제외 설정

## 🌍 다국어 지원

현재 지원 언어:
- 🇰🇷 한국어 (Korean)
- 🇺🇸 영어 (English)
- 🇯🇵 일본어 (Japanese)
- 🇨🇳 중국어 (Chinese)
- 🇪🇸 스페인어 (Spanish)

## 📞 문의

문제가 발생하면 이슈를 등록해주세요!


