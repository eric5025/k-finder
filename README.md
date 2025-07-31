# 🌟 TravelLens - AI 기반 한국 기념품 인식 앱

외국인 관광객을 위한 AI 기반 모바일 앱으로, 사진을 찍으면 한국 기념품을 자동으로 인식하고 다국어 정보를 제공합니다.

## ✨ 주요 기능

### 📸 **AI 이미지 인식**
- 사진 촬영 또는 갤러리에서 이미지 선택
- Perplexity AI를 활용한 정확한 기념품 인식
- 실시간 다국어 번역 및 정보 제공

### 🌍 **다국어 지원**
- 한국어, 영어, 일본어, 중국어, 스페인어 지원
- 앱 시작 시 언어 선택 가능
- 모든 콘텐츠 자동 번역

### 🗺️ **지도 연동**
- 카카오맵, 구글맵, 애플맵 연동
- 기념품 구매처 위치 안내
- 외부 지도 앱으로 바로 이동

### 💎 **프리미엄 기능**
- 월/연 구독 모델
- 무제한 번역 및 고화질 이미지 인식
- 광고 제거 및 우선 지원

## 🛠️ 기술 스택

### Frontend
- **React Native (Expo)** - 크로스 플랫폼 모바일 개발
- **TypeScript** - 타입 안전성 보장
- **React Navigation** - 화면 네비게이션
- **Expo Camera/ImagePicker** - 카메라 및 갤러리 접근

### AI & API
- **Perplexity AI** - 이미지 분석 및 번역
- **Google ML Kit** - 이미지 인식 (향후 계획)

### UI/UX
- **Expo Linear Gradient** - 그라데이션 효과
- **Lucide React Native** - 아이콘 라이브러리
- **React Native Safe Area** - 안전 영역 처리

## 📱 앱 구조

```
TravelLens/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── StarRating.tsx   # 별점 표시 컴포넌트
│   │   ├── PremiumModal.tsx # 프리미엄 구독 모달
│   │   └── MapNavigation.tsx # 지도 네비게이션
│   ├── screens/             # 앱 화면들
│   │   ├── LanguageSelectionScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── DetailScreen.tsx
│   │   ├── SearchResultsScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── services/            # API 서비스
│   │   └── perplexity.ts    # Perplexity AI 연동
│   ├── data/                # 데이터 관리
│   │   └── souvenirs.ts     # 기념품 데이터
│   ├── i18n/                # 다국어 지원
│   │   └── index.ts
│   ├── constants/           # 상수 정의
│   │   └── index.ts
│   └── types/               # TypeScript 타입 정의
│       └── index.ts
├── App.tsx                  # 앱 진입점
├── app.json                 # Expo 설정
├── babel.config.js          # Babel 설정
└── package.json             # 의존성 관리
```

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 16+ 
- npm 또는 yarn
- Expo CLI
- iOS Simulator 또는 Android Emulator (또는 실제 기기)

### 설치 단계

1. **저장소 클론**
```bash
git clone https://github.com/your-username/travellens.git
cd travellens
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env 파일 생성
cp .env.example .env

# Perplexity API 키 설정
PERPLEXITY_API_KEY=your_api_key_here
```

4. **앱 실행**
```bash
npm start
# 또는
expo start
```

5. **기기에서 테스트**
- Expo Go 앱 설치 (실제 기기)
- QR 코드 스캔 또는 시뮬레이터에서 실행

## 🔧 환경 설정

### API 키 설정
1. [Perplexity AI](https://www.perplexity.ai/)에서 API 키 발급
2. `.env` 파일에 API 키 추가:
```
PERPLEXITY_API_KEY=your_api_key_here
```

### 개발 환경
- **iOS**: Xcode 및 iOS Simulator
- **Android**: Android Studio 및 Android Emulator
- **실제 기기**: Expo Go 앱 설치

## 📸 주요 화면

### 1. 언어 선택 화면
- 앱 첫 실행 시 언어 선택
- 5개 언어 지원 (한국어, 영어, 일본어, 중국어, 스페인어)

### 2. 메인 화면
- 카메라 촬영 및 갤러리 선택
- 검색 기능
- 프리미엄 구독 버튼

### 3. 분석 결과 화면
- AI 분석 결과 표시
- 별점 및 정확도 표시
- 지도 연동 기능

### 4. 검색 결과 화면
- 검색 결과 목록
- 이미지 및 별점 표시
- 카테고리별 분류

## 💰 수익화 모델

### 프리미엄 구독
- **월 구독**: ₩5,900/월
- **연 구독**: ₩39,900/년 (33% 할인)
- **무료 버전**: 일일 10회 번역

### 프리미엄 혜택
- 무제한 번역
- 고화질 이미지 인식
- 15개 언어 지원
- 오프라인 모드
- 광고 제거
- 우선 지원

## 🔮 향후 계획

### Phase 2 기능
- [ ] 사용자 계정 관리
- [ ] 히스토리 저장 및 관리
- [ ] 소셜 공유 기능
- [ ] 리뷰 및 평점 시스템
- [ ] 오프라인 모드
- [ ] 위치 기반 추천

### 기술 개선
- [ ] Supabase 백엔드 연동
- [ ] 실제 결제 시스템 (Stripe)
- [ ] 푸시 알림
- [ ] 성능 최적화

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/your-username/travellens](https://github.com/your-username/travellens)

## 🙏 감사의 말

- [Perplexity AI](https://www.perplexity.ai/) - AI 이미지 분석 서비스
- [Expo](https://expo.dev/) - React Native 개발 플랫폼
- [React Native](https://reactnative.dev/) - 모바일 앱 개발 프레임워크

---

**TravelLens** - 한국 기념품을 더 쉽게 발견하세요! 🇰🇷✨
