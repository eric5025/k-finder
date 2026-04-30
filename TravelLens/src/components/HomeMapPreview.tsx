import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { DEFAULT_TOURIST_LOCATIONS } from "../constants/touristLocations";

interface Props {
  title?: string;
  subtitle: string;
}

const PREVIEW_REGION = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};

const HomeMapPreview: React.FC<Props> = ({ title, subtitle }) => (
  <View style={styles.outer}>
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={PREVIEW_REGION}
      scrollEnabled={false}
      zoomEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
      pointerEvents="none"
    >
      {DEFAULT_TOURIST_LOCATIONS.map((s) => (
        <Marker
          key={s.id}
          coordinate={{ latitude: s.latitude, longitude: s.longitude }}
          pinColor="red"
        />
      ))}
    </MapView>
    <View style={styles.overlay} pointerEvents="none">
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.sub}>{subtitle}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  outer: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#e8e8e8",
  },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  title: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  sub: { fontSize: 11, color: "#6B6B6B", marginTop: 2 },
});

export default HomeMapPreview;
