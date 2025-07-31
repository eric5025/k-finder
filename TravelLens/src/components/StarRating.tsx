import React from "react";
import { View, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";

interface StarRatingProps {
  rating: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  style?: any;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 16,
  color = "#F59E0B",
  emptyColor = "#E5E7EB",
  style,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={[styles.container, style]}>
      {/* 완전한 별들 */}
      {Array.from({ length: fullStars }, (_, index) => (
        <Star key={`full-${index}`} size={size} color={color} fill={color} />
      ))}

      {/* 반별 (있는 경우) */}
      {hasHalfStar && (
        <View style={styles.halfStarContainer}>
          <Star size={size} color={emptyColor} fill={emptyColor} />
          <View style={[styles.halfStarOverlay, { width: size / 2 }]}>
            <Star size={size} color={color} fill={color} />
          </View>
        </View>
      )}

      {/* 빈 별들 */}
      {Array.from({ length: emptyStars }, (_, index) => (
        <Star
          key={`empty-${index}`}
          size={size}
          color={emptyColor}
          fill={emptyColor}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  halfStarContainer: {
    position: "relative",
  },
  halfStarOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "hidden",
  },
});

export default StarRating;
