import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { getUIText } from "../i18n/translations";

type Nav = StackNavigationProp<RootStackParamList, "TouristMap">;

interface Props {
  navigation: Nav;
}

const TouristMapScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage } = useLanguage();
  return (
    <View style={styles.centered}>
      <Text style={styles.msg}>{getUIText(currentLanguage, "mapWebUnsupported")}</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>{getUIText(currentLanguage, "mapBack")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  msg: { fontSize: 16, textAlign: "center", color: "#333", marginBottom: 20 },
  backBtn: {
    backgroundColor: "#E63946",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backBtnText: { color: "white", fontWeight: "700" },
});

export default TouristMapScreen;
