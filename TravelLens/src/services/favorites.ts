import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Souvenir } from '../types';

export const addToFavorites = async (souvenir: Souvenir) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    const favoritesRef = collection(db, 'users', user.uid, 'favorites');
    await addDoc(favoritesRef, {
      souvenirId: souvenir.id,
      addedAt: new Date(),
      souvenirData: souvenir
    });
  } catch (error) {
    console.error('즐겨찾기 추가 오류:', error);
    throw error;
  }
};

export const removeFromFavorites = async (souvenirId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    const favoritesRef = collection(db, 'users', user.uid, 'favorites');
    const q = query(favoritesRef, where('souvenirId', '==', souvenirId));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, 'users', user.uid, 'favorites', document.id));
    });
  } catch (error) {
    console.error('즐겨찾기 제거 오류:', error);
    throw error;
  }
};

export const getFavorites = async (): Promise<Souvenir[]> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('사용자가 로그인되지 않았습니다.');

    const favoritesRef = collection(db, 'users', user.uid, 'favorites');
    const q = query(favoritesRef, orderBy('addedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data().souvenirData);
  } catch (error) {
    console.error('즐겨찾기 조회 오류:', error);
    throw error;
  }
};

export const isFavorite = async (souvenirId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const favoritesRef = collection(db, 'users', user.uid, 'favorites');
    const q = query(favoritesRef, where('souvenirId', '==', souvenirId));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('즐겨찾기 확인 오류:', error);
    return false;
  }
};