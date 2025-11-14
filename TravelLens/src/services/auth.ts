import {
  GoogleAuthProvider,
  signInWithCredential,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from "@env";

// Google Sign-In 초기화 (앱 시작 시 자동 실행)
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID, // Firebase Web Client ID
  iosClientId: GOOGLE_IOS_CLIENT_ID, // iOS Client ID (전용)
  offlineAccess: true,
});

// Google 로그인 (네이티브 모듈 사용)
export const signInWithGoogle = async () => {
  try {
    console.log("🔐 Google 로그인 시작 (네이티브 방식)...");

    // Google Play Services 확인
    await GoogleSignin.hasPlayServices();
    console.log("✓ Google Play Services 사용 가능");

    // Google 로그인 화면 표시
    const userInfo = await GoogleSignin.signIn();
    console.log("✓ Google 로그인 응답:", JSON.stringify(userInfo, null, 2));

    // ID Token 가져오기
    const idToken = (userInfo as any).data?.idToken || (userInfo as any).idToken;

    if (!idToken) {
      throw new Error("Google ID Token을 받지 못했습니다.");
    }

    console.log("✓ ID Token 획득, Firebase 인증 중...");

    // Firebase 인증
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);

    console.log("✓ Firebase 로그인 완료:", userCredential.user.uid);

    return userCredential.user;
  } catch (error: any) {
    console.error("❌ Google 로그인 오류:", error);

    if (error.code === "auth/operation-not-allowed") {
      throw new Error(
        "Google 로그인이 활성화되지 않았습니다.\n\n" +
          "Firebase Console → Authentication → 로그인 방법에서 Google을 활성화하세요."
      );
    }

    // 사용자가 로그인 취소한 경우
    if (error.code === "-5") {
      throw new Error("로그인이 취소되었습니다.");
    }

    throw error;
  }
};


// 익명 로그인 (임시 - 로그인 없이 사용)
export const signInAnonymously = async () => {
  try {
    // Firebase 익명 로그인
    const { signInAnonymously: firebaseSignInAnonymously } = await import(
      "firebase/auth"
    );
    const result = await firebaseSignInAnonymously(auth);
    console.log("익명 로그인 성공:", result.user.uid);
    return result.user;
  } catch (error) {
    console.error("익명 로그인 오류:", error);
    throw error;
  }
};

// 로그아웃
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log("로그아웃 성공");
  } catch (error) {
    console.error("로그아웃 오류:", error);
    throw error;
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = () => {
  return auth.currentUser;
};

// 로그인 상태 감지
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth.onAuthStateChanged(callback);
};

