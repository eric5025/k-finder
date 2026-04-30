const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// EAS Build 환경 감지 (여러 환경 변수 체크)
const isEASBuild = process.env.EAS_BUILD === 'true' || 
                   process.env.EAS_BUILD_PLATFORM || 
                   process.env.EAS_BUILD_PROFILE;

console.log('🔍 환경 변수 디버깅:');
console.log(`EAS_BUILD: ${process.env.EAS_BUILD}`);
console.log(`EAS_BUILD_PLATFORM: ${process.env.EAS_BUILD_PLATFORM}`);
console.log(`EAS_BUILD_PROFILE: ${process.env.EAS_BUILD_PROFILE}`);
console.log(`isEASBuild: ${isEASBuild}`);

// EAS Build에서만 환경 변수를 .env 파일로 생성
if (isEASBuild) {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = [
      `PERPLEXITY_API_KEY=${process.env.PERPLEXITY_API_KEY || ''}`,
      `GOOGLE_WEB_CLIENT_ID=${process.env.GOOGLE_WEB_CLIENT_ID || ''}`,
      `GOOGLE_IOS_CLIENT_ID=${process.env.GOOGLE_IOS_CLIENT_ID || ''}`,
      `GOOGLE_MAPS_API_KEY=${process.env.GOOGLE_MAPS_API_KEY || ''}`,
      `GOOGLE_WEATHER_API_KEY=${process.env.GOOGLE_WEATHER_API_KEY || ''}`,
      `ITS_CCTV_API_KEY=${process.env.ITS_CCTV_API_KEY || ''}`
    ].join('\n');
    
    fs.writeFileSync(envPath, envContent);
    console.log('✓ .env 파일 생성 완료 (EAS Build)');
    console.log(`✓ PERPLEXITY_API_KEY: ${process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.substring(0, 20) + '...' : '없음'}`);
    console.log(`✓ GOOGLE_WEB_CLIENT_ID: ${process.env.GOOGLE_WEB_CLIENT_ID ? process.env.GOOGLE_WEB_CLIENT_ID.substring(0, 20) + '...' : '없음'}`);
    console.log(`✓ GOOGLE_IOS_CLIENT_ID: ${process.env.GOOGLE_IOS_CLIENT_ID ? process.env.GOOGLE_IOS_CLIENT_ID.substring(0, 20) + '...' : '없음'}`);
    console.log(`✓ GOOGLE_MAPS_API_KEY: ${process.env.GOOGLE_MAPS_API_KEY ? process.env.GOOGLE_MAPS_API_KEY.substring(0, 12) + '...' : '없음'}`);
  } catch (error) {
    console.error('❌ .env 파일 생성 실패:', error);
    throw error;
  }
} else {
  console.log('ℹ️  로컬 개발 환경 - 기존 .env 파일 사용');
}

const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY || '';

module.exports = {
  expo: {
    name: "Korea Finder",
    slug: "travellens",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    description: "AI-powered Korean souvenir recognition app for tourists. Take a photo and instantly identify Korean souvenirs with multilingual information.",
    scheme: "travellens",
    owner: "eric5025",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#E63946"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.travellens.app",
      buildNumber: "12",
      googleServicesFile: "./GoogleService-Info.plist",
      config: {
        googleMapsApiKey: googleMapsKey,
      },
      infoPlist: {
        NSCameraUsageDescription: "We need access to your camera to take photos of Korean souvenirs.",
        NSPhotoLibraryUsageDescription: "We need access to your photo library to select souvenir images.",
        NSLocationWhenInUseUsageDescription: "We use your location for tourist-area crowd levels on the map and nearby context.",
        NSMotionUsageDescription: "We use motion data to count your daily steps.",
        ITSAppUsesNonExemptEncryption: false,
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              "com.googleusercontent.apps.1018195924384-ua9rpjks7r4ot7b7279rj0m0281rg50v"
            ]
          }
        ]
      }
    },
    android: {
      package: "com.travellens.app",
      versionCode: 1,
      config: {
        googleMaps: {
          apiKey: googleMapsKey,
        },
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#E63946"
      },
      edgeToEdgeEnabled: true,
      googleServicesFile: "./google-services.json"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "dab25966-e38f-4d2f-b999-f8c8a86e3ee0"
      }
    }
  }
};

