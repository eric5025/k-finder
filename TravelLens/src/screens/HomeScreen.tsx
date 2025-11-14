import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Image, History } from "lucide-react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "../types";
import LanguageDropdown from "../components/LanguageDropdown";
import { useLanguage } from "../contexts/LanguageContext";
import { getUIText } from "../i18n/translations";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentLanguage } = useLanguage();

  const subtitle = getUIText(currentLanguage, "appSubtitle");
  const takePhotoTitle = getUIText(currentLanguage, "takePhoto");
  const selectPhotoTitle = getUIText(currentLanguage, "selectPhoto");

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("오류", "카메라를 사용할 수 없습니다.");
    }
  };

  const handleSelectFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate("Loading", { imageUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("오류", "갤러리를 사용할 수 없습니다.");
    }
  };

  const handleHistory = () => {
    navigation.navigate("History");
  };

  return (
      <LinearGradient colors={["#E63946", "#F77F88"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>Korea</Text>
            <Text style={styles.appName}>Finder</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.headerButtons}>
            <LanguageDropdown />
            <TouchableOpacity 
              onPress={handleHistory} 
              style={styles.historyBtn}
            >
              <History size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Camera Button */}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleTakePhoto}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Camera size={48} color="#E63946" />
            <Text style={styles.cameraButtonTitle}>{takePhotoTitle}</Text>
            <Text style={styles.cameraButtonDesc}>카메라로 촬영</Text>
          </TouchableOpacity>

        

          {/* Gallery Button */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleSelectFromGallery}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Image size={48} color="#E63946" />
            <Text style={styles.galleryButtonTitle}>{selectPhotoTitle}</Text>
            <Text style={styles.galleryButtonDesc}>기기에서 선택</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 8,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  historyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "flex-start",
    gap: 16,
  },
  cameraButton: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  cameraButtonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E63946",
    marginTop: 12,
  },
  cameraButtonDesc: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#999",
  },
  dividerText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  galleryButton: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 34,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  galleryButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E63946",
    marginTop: 10,
  },
  galleryButtonDesc: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});

export default HomeScreen;
