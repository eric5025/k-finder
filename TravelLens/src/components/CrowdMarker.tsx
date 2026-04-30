import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { CrowdLevel, crowdLevelColor } from "../services/crowdService";
import { TouristLocation } from "../constants/touristLocations";

interface Props {
  spot: TouristLocation;
  crowdLevel: CrowdLevel;
  count: number;
}

const CrowdMarker: React.FC<Props> = ({ spot, crowdLevel, count }) => {
  const color = crowdLevelColor(crowdLevel);

  return (
    <Marker
      coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
      title={spot.name}
      description={`~${count} nearby`}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.wrapper} accessibilityLabel={`${spot.name}, crowd ${crowdLevel}`}>
        <View style={[styles.pin, { backgroundColor: color }]} />
        <View style={[styles.stem, { backgroundColor: color }]} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  pin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "white",
  },
  stem: {
    width: 4,
    height: 10,
    marginTop: -2,
    borderRadius: 2,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default CrowdMarker;
