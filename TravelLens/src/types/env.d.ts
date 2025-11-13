declare module "@env" {
  export const PERPLEXITY_API_KEY: string;
  export const GOOGLE_MAPS_API_KEY: string;
  export const KAKAO_MAP_API_KEY: string;
  
  // Firebase Configuration
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_MEASUREMENT_ID: string;
  
  // Google OAuth Configuration
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  
  // App Configuration
  export const APP_ENV: string;
  export const DEBUG: string;
}
