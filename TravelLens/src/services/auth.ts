import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

// WebBrowser 완료 설정
WebBrowser.maybeCompleteAuthSession();

// Google OAuth 설정 (환경 변수에서 가져오기)
// 설정 안 되어 있으면 Firebase Web UI로 폴백
const useGoogleWebAuth = true; // 간단한 웹 기반 인증 사용

// Google 로그인 (Firebase Web OAuth 사용)
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    // React Native에서는 WebBrowser로 OAuth 처리
    if (Platform.OS !== "web") {
      // Expo WebBrowser를 사용한 OAuth
      const redirectUrl = makeRedirectUri({
        scheme: "travellens",
        path: "redirect",
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${auth.app.options.apiKey}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `response_type=token&` +
        `scope=email profile`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl
      );

      if (result.type === "success" && result.url) {
        // URL에서 토큰 추출
        const params = new URLSearchParams(result.url.split("#")[1]);
        const idToken = params.get("id_token");

        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          return userCredential.user;
        }
      }

      throw new Error("Google 로그인이 취소되었거나 실패했습니다.");
    } else {
      // Web에서는 팝업 사용
      const result = await signInWithPopup(auth, provider);
      return result.user;
    }
  } catch (error: any) {
    console.error("Google 로그인 오류:", error);
    
    // Firebase에서 Google 활성화 안 된 경우
    if (error.code === "auth/operation-not-allowed") {
      throw new Error(
        "Google 로그인이 활성화되지 않았습니다.\n\n" +
        "Firebase Console → Authentication → 로그인 방법에서 Google을 활성화하세요."
      );
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

