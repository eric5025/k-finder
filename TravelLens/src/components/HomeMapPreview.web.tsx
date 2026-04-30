import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapPin } from "lucide-react-native";

interface Props {
  title?: string;
  subtitle: string;
}

const HomeMapPreview: React.FC<Props> = ({ title, subtitle }) => (
  <View style={styles.webWrap}>
    <MapPin size={36} color="#E63946" />
    {title ? <Text style={styles.webTitle}>{title}</Text> : null}
    <Text style={styles.webSub}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  webWrap: {
    height: 160,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  webTitle: { fontSize: 16, fontWeight: "700", color: "#1C1C1E", marginTop: 8 },
  webSub: { fontSize: 12, color: "#6B6B6B", marginTop: 4, textAlign: "center" },
});

export default HomeMapPreview;
