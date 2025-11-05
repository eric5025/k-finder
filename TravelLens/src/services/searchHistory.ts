import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Souvenir } from "../types";

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  imageUrl?: string;
  results: Souvenir[];
}

export const addSearchHistory = async (
  query: string,
  imageUrl?: string,
  results: Souvenir[] = []
) => {
  try {
    const user = auth.currentUser;

    // 로그인된 사용자: 사용자별 기록
    if (user) {
      const historyRef = collection(db, "users", user.uid, "searchHistory");
      await addDoc(historyRef, {
        query,
        timestamp: new Date(),
        imageUrl,
        results,
      });
    } else {
      // 로그인되지 않은 사용자: 익명 기록
      const anonymousHistoryRef = collection(db, "anonymousHistory");
      await addDoc(anonymousHistoryRef, {
        query,
        timestamp: new Date(),
        imageUrl,
        results,
        deviceId: "anonymous", // 나중에 디바이스 ID로 구분할 수 있음
      });
    }

    console.log("검색 기록 저장 완료:", query);
  } catch (error) {
    console.error("검색 기록 추가 오류:", error);
  }
};

export const getSearchHistory = async (
  limitCount: number = 10
): Promise<SearchHistoryItem[]> => {
  try {
    const user = auth.currentUser;
    
    let historyRef;
    
    // 로그인된 사용자: 사용자별 기록 조회
    if (user) {
      historyRef = collection(db, "users", user.uid, "searchHistory");
    } else {
      // 익명 사용자: 익명 기록 조회 (최신 20개만)
      historyRef = collection(db, "anonymousHistory");
    }

    const q = query(
      historyRef,
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as SearchHistoryItem[];
  } catch (error) {
    console.error("검색 기록 조회 오류:", error);
    return [];
  }
};

export const clearSearchHistory = async () => {
  try {
    const user = auth.currentUser;
    
    let historyRef;
    
    // 로그인된 사용자: 사용자별 기록 삭제
    if (user) {
      historyRef = collection(db, "users", user.uid, "searchHistory");
      const querySnapshot = await getDocs(historyRef);
      
      querySnapshot.docs.forEach(async (document) => {
        await deleteDoc(doc(db, "users", user.uid, "searchHistory", document.id));
      });
    } else {
      // 익명 사용자: 익명 기록 전체 삭제 (주의: 모든 익명 기록이 삭제됨)
      // 실제로는 deviceId로 필터링하는 것이 좋음
      historyRef = collection(db, "anonymousHistory");
      const querySnapshot = await getDocs(historyRef);
      
      querySnapshot.docs.forEach(async (document) => {
        await deleteDoc(doc(db, "anonymousHistory", document.id));
      });
    }
  } catch (error) {
    console.error("검색 기록 삭제 오류:", error);
  }
};
