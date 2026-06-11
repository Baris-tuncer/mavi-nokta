import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Share2 } from "lucide-react-native";
import { shareCampaign } from "../services/share";
import { Colors, Shadow } from "../lib/constants";

type Props = {
  campaign: {
    id: string;
    title: string;
    slogan: string;
    newPrice: number;
    businessName: string;
  };
  size?: number;
  style?: "overlay" | "inline";
};

export function ShareButton({ campaign, size = 20, style = "overlay" }: Props) {
  const handlePress = () => {
    shareCampaign(campaign).catch(() => {});
  };

  return (
    <TouchableOpacity
      style={style === "overlay" ? styles.overlay : styles.inline}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Share2
        size={size}
        color={style === "overlay" ? Colors.text : Colors.textMute}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },
  inline: {
    padding: 6,
  },
});
