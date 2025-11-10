import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  GestureResponderEvent,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../constants/colors";

export interface CardBadge {
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export interface ImageOverlayCardProps {
  image: ImageSourcePropType;
  title: string;
  description?: string;
  primaryBadge?: CardBadge;
  secondaryBadge?: CardBadge;
  onPress: (event: GestureResponderEvent) => void;
}

export default function ImageOverlayCard({
  image,
  title,
  description,
  primaryBadge,
  secondaryBadge,
  onPress,
}: ImageOverlayCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={image}
        style={styles.cardImage}
        imageStyle={styles.cardImageInner}
      >
        {(primaryBadge || secondaryBadge) && (
          <View style={styles.badgeRow}>
            {primaryBadge && (
              <View style={styles.badge}>
                {primaryBadge.iconName && (
                  <Ionicons
                    name={primaryBadge.iconName}
                    size={14}
                    color="rgba(26,29,31,0.65)"
                    style={styles.badgeIcon}
                  />
                )}
                <Text style={styles.badgeLabel}>{primaryBadge.label}</Text>
              </View>
            )}
            {secondaryBadge && (
              <View style={styles.badge}>
                {secondaryBadge.iconName && (
                  <Ionicons
                    name={secondaryBadge.iconName}
                    size={14}
                    color="rgba(26,29,31,0.65)"
                    style={styles.badgeIcon}
                  />
                )}
                <Text style={styles.badgeLabel}>{secondaryBadge.label}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.overlayContainer}>
          <View style={styles.overlay}>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{title}</Text>
              {/* {description ? (
                <Text style={styles.description}>{description}</Text>
              ) : null} */}
            </View>
            <View style={styles.button}>
              <Ionicons
                name="arrow-forward-outline"
                size={20}
                color={Colors.textPrimaryHigh}
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 343,
    borderRadius: 50,
    overflow: "scroll",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  cardImageInner: {
    width: "105%",
    height: "150%",
    resizeMode: "cover",
  },
  badgeRow: {
    paddingHorizontal: 24,
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    maxWidth: "65%",
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeLabel: {
    fontSize: 13,
    fontFamily: "Lufga-Bold",
    color: Colors.textPrimaryHigh,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  overlay: {
    // alignSelf: "stretch",
    marginHorizontal: 20,
    borderRadius: 50,
    backgroundColor: "rgba(45, 48, 53, 0.8)",
    paddingLeft: 24,
    // width: "100%",
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Lufga-Bold",
    color: Colors.white,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.82)",
    lineHeight: 18,
    fontFamily: "Lufga-Regular",
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 50,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
