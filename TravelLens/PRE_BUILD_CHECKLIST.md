# ✅ 빌드 전 최종 체크리스트

인앱결제 상품 등록이 완료되었으니, 빌드 전에 다음 사항들을 확인하세요!

---

## 🔍 필수 확인 사항

### 1. 인앱결제 상품 확인

#### iOS
- [ ] App Store Connect에서 상품 ID `kfinder_unlimited_search` 확인
- [ ] 상품 상태가 **승인됨** 또는 **검토 중**인지 확인
- [ ] 가격이 올바르게 설정되었는지 확인

#### Android
- [ ] Google Play Console에서 상품 ID `kfinder_unlimited_search` 확인
- [ ] 상품 상태가 **활성**인지 확인
- [ ] 가격이 올바르게 설정되었는지 확인

### 2. 앱 설정 확인

- [ ] `app.json`과 `app.config.js`의 버전 번호 일치 확인
- [ ] Bundle ID / Package Name 확인
- [ ] 앱 이름 확인: "Korea Finder"

### 3. 환경 변수 확인

`.env` 파일 또는 EAS Secrets에 다음이 설정되어 있는지 확인:

- [ ] `PERPLEXITY_API_KEY`
- [ ] Firebase 관련 키들 (필요한 경우)

**EAS Secrets 설정:**
```bash
eas secret:create --scope project --name PERPLEXITY_API_KEY --value "your_key_here"
```

### 4. Firebase 설정 확인

- [ ] Firestore 보안 규칙 확인
- [ ] 인증 설정 확인 (Google, Anonymous)
- [ ] 프로덕션 환경에서 Firebase 프로젝트가 올바른지 확인

### 5. 코드 확인

- [ ] 인앱결제 상품 ID가 정확한지 확인
  - 파일: `src/hooks/useSearchLimit.ts`
  - 상수: `PRODUCT_IDS = ["kfinder_unlimited_search"]`
- [ ] 구매 복원 기능이 포함되어 있는지 확인
- [ ] 에러 처리가 적절한지 확인

---

## 🧪 테스트 권장 사항

### 개발 빌드에서 테스트

프로덕션 빌드 전에 개발 빌드로 먼저 테스트하세요:

```bash
# 개발 빌드
eas build --platform ios --profile development
eas build --platform android --profile development
```

**테스트 항목:**
- [ ] 앱이 정상적으로 실행되는가?
- [ ] 인앱결제 상품이 로드되는가? (프로덕션 빌드에서만 가능할 수 있음)
- [ ] 구매 플로우가 작동하는가?
- [ ] 구매 복원이 작동하는가?

---

## 📦 프로덕션 빌드 준비

### 1. 버전 번호 업데이트

출시 전에 버전 번호를 확인하세요:

**현재 설정:**
- Version: `1.0.0`
- iOS Build Number: `9`
- Android Version Code: `1`

**다음 업데이트 시:**
- Version: `1.0.1` (버그 수정)
- Version: `1.1.0` (기능 추가)
- Version: `2.0.0` (대규모 변경)

### 2. 빌드 명령어

#### iOS
```bash
# 빌드
eas build --platform ios --profile production

# 제출 (빌드 완료 후)
eas submit --platform ios --profile production
```

#### Android
```bash
# 빌드
eas build --platform android --profile production

# 제출 (빌드 완료 후)
eas submit --platform android --profile production
```

#### 둘 다
```bash
# 빌드
eas build --platform all --profile production

# 제출은 각각 따로
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### 3. 빌드 시간

- **iOS**: 약 15-30분
- **Android**: 약 10-20분
- **둘 다**: 약 30-60분

---

## 🚨 주의사항

### iOS
- ⚠️ 인앱결제 상품이 **승인됨** 상태여야 프로덕션에서 작동합니다
- ⚠️ 검토 중이면 Sandbox에서만 테스트 가능합니다
- ⚠️ 첫 출시는 Apple 검토가 필요합니다 (1-3일 소요)

### Android
- ⚠️ 인앱결제 상품은 즉시 활성화되지만, 앱 자체는 검토가 필요합니다
- ⚠️ 첫 출시는 Google 검토가 필요합니다 (몇 시간 ~ 며칠 소요)

---

## 📋 출시 전 최종 체크리스트

### 앱 스토어 정보
- [ ] 앱 설명 작성 (한국어 + 영어)
- [ ] 스크린샷 준비 (최소 요구사항 확인)
- [ ] 앱 아이콘 확인
- [ ] 개인정보처리방침 URL 준비
- [ ] 이용약관 URL 준비

### 법적 요구사항
- [ ] 사업자 등록증 업로드 (Google Play)
- [ ] 세금 정보 입력 (App Store Connect)
- [ ] 결제 계약서 서명 (양쪽 모두)

### 기능 확인
- [ ] 모든 화면이 정상 작동하는가?
- [ ] 다국어 번역이 완료되었는가?
- [ ] 인앱결제가 정상 작동하는가?
- [ ] 구매 복원이 정상 작동하는가?

---

## 🎯 빌드 실행 순서

1. **체크리스트 확인** ✅
   - 위의 모든 항목 확인

2. **개발 빌드 테스트** (선택사항)
   ```bash
   eas build --platform ios --profile development
   ```

3. **프로덕션 빌드**
   ```bash
   eas build --platform all --profile production
   ```

4. **빌드 완료 대기**
   - 이메일 알림 또는 `eas build:list`로 확인

5. **제출**
   ```bash
   eas submit --platform ios --profile production
   eas submit --platform android --profile production
   ```

6. **검토 대기**
   - iOS: 1-3일
   - Android: 몇 시간 ~ 며칠

---

## 📞 문제 발생 시

### 빌드 실패
```bash
# 빌드 로그 확인
eas build:list
eas build:view [BUILD_ID]
```

### 인앱결제 문제
- `TESTING_GUIDE.md` 참고
- 상품 ID 확인
- 스토어에서 상품 상태 확인

### 기타 문제
- `RELEASE_GUIDE.md`의 "문제 해결" 섹션 참고

---

**모든 체크리스트를 완료하셨다면 빌드를 시작하세요! 🚀**
