import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin, ExternalLink } from 'lucide-react-native';
import { COLORS } from '../constants';

interface MapViewProps {
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  onMapPress?: () => void;
}

const MapView: React.FC<MapViewProps> = ({ location, onMapPress }) => {
  const [mapType, setMapType] = useState<'kakao' | 'google'>('kakao');

  const getKakaoMapUrl = () => {
    if (!location) return 'https://map.kakao.com/';
    return `https://map.kakao.com/link/map/${location.name},${location.latitude},${location.longitude}`;
  };

  const getGoogleMapUrl = () => {
    if (!location) return 'https://www.google.com/maps';
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  };

  const handleOpenExternalMap = () => {
    const url = mapType === 'kakao' ? getKakaoMapUrl() : getGoogleMapUrl();
    Alert.alert(
      '외부 지도 앱 열기',
      `${mapType === 'kakao' ? '카카오맵' : '구글맵'}에서 열까요?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '열기', 
          onPress: () => {
            // 실제로는 Linking.openURL(url)을 사용해야 합니다
            console.log('외부 지도 앱 열기:', url);
          }
        }
      ]
    );
  };

  if (!location) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <MapPin size={48} color={COLORS.gray} />
          <Text style={styles.placeholderText}>위치 정보가 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapHeader}>
        <View style={styles.mapTypeSelector}>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'kakao' && styles.activeMapType]}
            onPress={() => setMapType('kakao')}
          >
            <Text style={[styles.mapTypeText, mapType === 'kakao' && styles.activeMapTypeText]}>
              카카오맵
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'google' && styles.activeMapType]}
            onPress={() => setMapType('google')}
          >
            <Text style={[styles.mapTypeText, mapType === 'google' && styles.activeMapTypeText]}>
              구글맵
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.externalButton} onPress={handleOpenExternalMap}>
          <ExternalLink size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <WebView
        source={{ uri: mapType === 'kakao' ? getKakaoMapUrl() : getGoogleMapUrl() }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  mapTypeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  activeMapType: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  mapTypeText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeMapTypeText: {
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  externalButton: {
    padding: 8,
    backgroundColor: COLORS.lightPrimary,
    borderRadius: 8,
  },
  webview: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
});

export default MapView; 