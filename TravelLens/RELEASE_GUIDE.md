# 🚀 Korea Finder 출시 가이드

사업자 등록증을 받으셨으니 이제 인앱결제를 완성하고 앱을 출시하세요!

---

## 📋 목차

1. [인앱결제 상품 등록](#인앱결제-상품-등록)
2. [앱 설정 정리](#앱-설정-정리)
3. [출시 체크리스트](#출시-체크리스트)
4. [빌드 및 제출](#빌드-및-제출)

---

## 💳 인앱결제 상품 등록

### iOS - App Store Connect

#### 1. 인앱결제 상품 생성

1. [App Store Connect](https://appstoreconnect.apple.com)에 로그인
2. **내 앱** → **Korea Finder** 선택
3. **기능** 탭 → **인앱 구매** 클릭
4. **+** 버튼 클릭하여 새 상품 생성

#### 2. 상품 정보 입력

- **상품 유형**: **비소모성 상품** (Non-Consumable) 선택
- **참조 이름**: `5일 검색 패스` (내부용)
- **상품 ID**: `kfinder_unlimited_search` ⚠️ **코드와 정확히 일치해야 함**
- **가격**: $4.99 (또는 원하는 가격)
- **표시 이름**: `5일 검색 패스`
- **설명**: `5일 동안 무제한으로 검색할 수 있는 프리미엄 패스입니다.`

#### 3. 상품 검토 제출

⚠️ **중요: 첫 번째 인앱결제 상품의 경우**
- 상품만 따로 검토용 제출하는 것이 **아닙니다**
- **앱 심사와 함께 제출**해야 합니다
- 앱 심사 제출 시 상품도 함께 심사됨

**절차:**
1. 모든 정보 입력 후 **저장**
2. 앱 심사 준비 (스크린샷, 설명 등)
3. **앱 심사 제출** 시 상품도 함께 제출됨
4. Apple 검토 완료까지 1-3일 소요

**이후 추가 상품:**
- 두 번째 상품부터는 독립적으로 검토 가능
- "검토용 제출" 버튼으로 별도 제출 가능

#### 4. 중요 사항

- ✅ 상품 ID는 코드의 `PRODUCT_IDS`와 정확히 일치해야 함
- ✅ 비소모성 상품으로 설정 (한 번 구매하면 계속 사용)
- ✅ 가격은 지역별로 자동 변환됨

---

### Android - Google Play Console

#### 1. 인앱결제 상품 생성

1. [Google Play Console](https://play.google.com/console)에 로그인
2. **앱** → **Korea Finder** 선택
3. **수익 창출** → **앱 내 상품** → **인앱 상품** 클릭
4. **상품 만들기** 클릭

#### 2. 상품 정보 입력

- **상품 ID**: `kfinder_unlimited_search` ⚠️ **코드와 정확히 일치해야 함**
- **이름**: `5일 검색 패스`
- **설명**: `5일 동안 무제한으로 검색할 수 있는 프리미엄 패스입니다.`
- **상태**: **활성** 선택
- **가격**: $4.99 (또는 원하는 가격)

#### 3. 상품 활성화

- 모든 정보 입력 후 **저장**
- **활성화** 버튼 클릭
- 즉시 사용 가능 (검토 불필요)

#### 4. 중요 사항

- ✅ 상품 ID는 코드의 `PRODUCT_IDS`와 정확히 일치해야 함
- ✅ Google Play는 상품 검토가 필요 없음 (즉시 활성화)
- ✅ 가격은 지역별로 자동 변환됨

---

## ⚙️ 앱 설정 정리

### 1. 버전 번호 통일

현재 `app.json`과 `app.config.js`의 버전이 다를 수 있습니다. 통일하세요:

**app.json**:
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "4"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

**app.config.js**도 동일하게 맞춰주세요.

### 2. 앱 정보 확인

- ✅ 앱 이름: "Korea Finder"
- ✅ Bundle ID (iOS): `com.travellens.app`
- ✅ Package Name (Android): `com.travellens.app`
- ✅ 버전: `1.0.0`

---

## ✅ 출시 체크리스트

### 필수 준비사항

#### 1. 개인정보처리방침 및 이용약관

- [ ] 개인정보처리방침 작성 (한국어 + 영어)
- [ ] 이용약관 작성 (한국어 + 영어)
- [ ] 웹사이트 또는 GitHub에 호스팅
- [ ] 앱 내에서 링크 제공 (설정 화면 등)

**권장 호스팅 위치:**
- GitHub Pages
- Netlify
- Vercel
- 또는 자체 웹사이트

#### 2. 앱 스토어 정보

**iOS (App Store Connect):**
- [ ] 앱 설명 (한국어 + 영어)
- [ ] 키워드 입력
- [ ] 카테고리 선택 (여행, 쇼핑 등)
- [ ] 스크린샷 (최소 3개, 권장 5-10개)
  - iPhone 6.7" (iPhone 14 Pro Max)
  - iPhone 6.5" (iPhone 11 Pro Max)
  - iPad Pro 12.9"
- [ ] 앱 아이콘 (1024x1024px)
- [ ] 개인정보처리방침 URL
- [ ] 연락처 정보

**Android (Google Play Console):**
- [ ] 앱 설명 (한국어 + 영어)
- [ ] 짧은 설명 (80자 이내)
- [ ] 카테고리 선택
- [ ] 스크린샷 (최소 2개, 권장 8개)
  - Phone (최소 320dp)
  - Tablet (7인치, 10인치)
- [ ] 앱 아이콘 (512x512px)
- [ ] 기능 그래픽 (선택사항)
- [ ] 개인정보처리방침 URL
- [ ] 연락처 정보

#### 3. 법적 요구사항

- [ ] 사업자 등록증 업로드 (Google Play Console)
- [ ] 세금 정보 입력 (App Store Connect)
- [ ] 결제 계약서 서명 (양쪽 모두)

#### 4. 테스트

- [ ] 실제 기기에서 인앱결제 테스트
  - iOS: Sandbox 계정으로 테스트
  - Android: 테스트 계정으로 테스트
- [ ] 구매 복원 기능 테스트
- [ ] 모든 화면 동작 확인
- [ ] 다국어 번역 확인

#### 5. Firebase 설정

- [ ] Firestore 보안 규칙 확인
- [ ] 인증 설정 확인
- [ ] 프로덕션 환경 변수 설정

---

## 🏗️ 빌드 및 제출

### 1. EAS 빌드 설정 확인

`eas.json` 파일이 올바르게 설정되어 있는지 확인:

```json
{
  "build": {
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 2. iOS 빌드 및 제출

```bash
# 프로덕션 빌드
eas build --platform ios --profile production

# 빌드 완료 후 제출
eas submit --platform ios --profile production
```

**또는 수동 제출:**
1. App Store Connect에서 빌드 선택
2. **제출하여 검토** 클릭
3. 검토 정보 입력 후 제출

### 3. Android 빌드 및 제출

```bash
# 프로덕션 빌드
eas build --platform android --profile production

# 빌드 완료 후 제출
eas submit --platform android --profile production
```

**또는 수동 제출:**
1. Google Play Console에서 **프로덕션** 트랙 선택
2. 새 릴리스 생성
3. 빌드 업로드
4. 출시 노트 작성 후 제출

### 4. 빌드 시간

- **iOS**: 약 15-30분
- **Android**: 약 10-20분

---

## 📱 출시 후 확인사항

### 1. 즉시 확인

- [ ] 앱이 스토어에 정상적으로 표시되는지 확인
- [ ] 인앱결제 상품이 정상적으로 표시되는지 확인
- [ ] 실제 결제 테스트 (소액으로)

### 2. 모니터링

- [ ] Firebase Analytics 설정 확인
- [ ] 크래시 리포팅 확인 (Firebase Crashlytics)
- [ ] 사용자 피드백 모니터링

### 3. 업데이트 계획

- [ ] 버그 수정 계획
- [ ] 기능 추가 계획
- [ ] 마케팅 계획

---

## 🔧 문제 해결

### 인앱결제가 작동하지 않는 경우

1. **상품 ID 확인**
   - 코드의 `PRODUCT_IDS`와 스토어의 상품 ID가 정확히 일치하는지 확인
   - 대소문자 구분됨

2. **상품 상태 확인**
   - iOS: App Store Connect에서 상품이 **승인됨** 상태인지 확인
   - Android: Google Play Console에서 상품이 **활성** 상태인지 확인

3. **테스트 환경**
   - iOS: Sandbox 계정으로 테스트
   - Android: 테스트 계정으로 테스트
   - 프로덕션 빌드에서만 실제 결제 가능

4. **로그 확인**
   - 개발자 콘솔에서 에러 메시지 확인
   - `react-native-iap` 로그 확인

### 빌드 실패 시

1. **EAS 로그 확인**
   ```bash
   eas build:list
   eas build:view [BUILD_ID]
   ```

2. **일반적인 문제**
   - 환경 변수 누락
   - 인증서 문제 (iOS)
   - 서명 키 문제 (Android)

---

## 📞 지원

문제가 발생하면:
1. EAS 문서 확인: https://docs.expo.dev/build/introduction/
2. react-native-iap 문서 확인: https://github.com/dooboolab/react-native-iap
3. 각 스토어 지원팀 문의

---

**행운을 빕니다! 🎉**
