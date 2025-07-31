import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Linking } from "react-native";
import { MapPin, Navigation, ExternalLink } from "lucide-react-native";

interface MapNavigationProps {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  style?: any;
}

const MapNavigation: React.FC<MapNavigationProps> = ({
  latitude = 37.5665,
  longitude = 126.978,
  locationName = "현재 위치",
  style,
}) => {
  const openKakaoMap = async () => {
    try {
      const url = `kakaomap://look?lat=${latitude}&lng=${longitude}&q=${encodeURIComponent(
        locationName
      )}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        // 카카오맵이 설치되지 않은 경우 웹으로 열기
        const webUrl = `https://map.kakao.com/link/map/${locationName},${latitude},${longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error("카카오맵 열기 오류:", error);
      Alert.alert("오류", "카카오맵을 열 수 없습니다.");
    }
  };

  const openGoogleMap = async () => {
    try {
      const url = `googlemaps://?q=${latitude},${longitude}&q=${encodeURIComponent(
        locationName
      )}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        // 구글맵이 설치되지 않은 경우 웹으로 열기
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error("구글맵 열기 오류:", error);
      Alert.alert("오류", "구글맵을 열 수 없습니다.");
    }
  };

  const openAppleMap = async () => {
    try {
      const url = `http://maps.apple.com/?q=${encodeURIComponent(
        locationName
      )}&ll=${latitude},${longitude}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error("애플맵 열기 오류:", error);
      Alert.alert("오류", "애플맵을 열 수 없습니다.");
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <MapPin size={24} color="#3B82F6" />
        <Text style={styles.title}>지도에서 보기</Text>
      </View>

      <Text style={styles.description}>
        {locationName}의 위치를 지도 앱에서 확인하세요
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.mapButton} onPress={openKakaoMap}>
          <Navigation size={20} color="white" />
          <Text style={styles.buttonText}>카카오맵</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mapButton, styles.googleButton]}
          onPress={openGoogleMap}
        >
          <ExternalLink size={20} color="white" />
          <Text style={styles.buttonText}>구글맵</Text>
        </TouchableOpacity>

        {Platform.OS === "ios" && (
          <TouchableOpacity
            style={[styles.mapButton, styles.appleButton]}
            onPress={openAppleMap}
          >
            <MapPin size={20} color="white" />
            <Text style={styles.buttonText}>애플맵</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          📍 좌표: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
        <Text style={styles.infoText}>
          🗺️ 지도 앱을 선택하면 해당 위치로 이동합니다
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: "#10B981",
  },
  appleButton: {
    backgroundColor: "#8B5CF6",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default MapNavigation;
