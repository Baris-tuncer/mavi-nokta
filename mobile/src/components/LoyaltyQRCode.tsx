import React from "react";
import { View, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./ui/Text";
import { Colors, Spacing, FontSize, BorderRadius } from "../lib/constants";

let QRCode: any = null;
try {
  QRCode = require("react-native-qrcode-svg").default;
} catch {
  // QR library not available
}

type Props = {
  visible: boolean;
  onClose: () => void;
  customerId: string;
  programId: string;
  businessName: string;
};

export function LoyaltyQRModal({
  visible,
  onClose,
  customerId,
  programId,
  businessName,
}: Props) {
  const qrData = JSON.stringify({ customerId, programId });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <Text style={styles.title}>QR Kodunuz</Text>
          <Text style={styles.subtitle}>{businessName}</Text>

          <View style={styles.qrContainer}>
            {QRCode ? (
              <QRCode value={qrData} size={200} />
            ) : (
              <View style={styles.qrFallback}>
                <Text style={styles.qrFallbackText}>
                  QR kod yuklenemedi
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.hint}>
            Bu QR kodu isletmeye gostererek damga kazanin
          </Text>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    width: "85%",
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSoft,
    marginBottom: Spacing.lg,
  },
  qrContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  qrFallback: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.md,
  },
  qrFallbackText: {
    color: Colors.textMute,
    fontSize: FontSize.sm,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textMute,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  closeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
  },
  closeBtnText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: FontSize.base,
  },
});
