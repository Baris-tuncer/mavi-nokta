import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  Keyboard,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import {
  getMyLoyaltyProgram,
  createOrUpdateLoyaltyProgram,
  addStamp,
} from "../../services/loyalty";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Shadow,
} from "../../lib/constants";

export default function BusinessLoyaltyScreen() {
  // Program settings
  const [stampTarget, setStampTarget] = useState("10");
  const [rewardText, setRewardText] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [programId, setProgramId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingProgram, setLoadingProgram] = useState(true);

  // Scanner
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const loadProgram = useCallback(async () => {
    try {
      const prog = await getMyLoyaltyProgram();
      if (prog) {
        setProgramId(prog.id);
        setStampTarget(String(prog.stamp_target));
        setRewardText(prog.reward_text);
        setIsActive(prog.is_active);
      }
    } catch {
      // ignore
    } finally {
      setLoadingProgram(false);
    }
  }, []);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  const handleSave = async () => {
    Keyboard.dismiss();
    const target = Number(stampTarget);
    if (!target || target < 2) {
      Alert.alert("Hata", "Damga sayisi en az 2 olmali.");
      return;
    }
    if (!rewardText.trim()) {
      Alert.alert("Hata", "Odul metni gerekli.");
      return;
    }

    setSaving(true);
    try {
      const result = await createOrUpdateLoyaltyProgram({
        stampTarget: target,
        rewardText: rewardText.trim(),
        isActive,
      });
      if ("error" in result) {
        Alert.alert("Hata", result.error);
      } else {
        Alert.alert("Basarili", "Sadakat programi kaydedildi.");
        loadProgram();
      }
    } catch {
      Alert.alert("Hata", "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = JSON.parse(data);
      if (!parsed.customerId || !parsed.programId) {
        Alert.alert("Hata", "Gecersiz QR kod", [
          { text: "Tamam", onPress: () => setScanned(false) },
        ]);
        return;
      }

      const result = await addStamp(parsed.programId, parsed.customerId);
      if ("error" in result) {
        Alert.alert("Hata", result.error, [
          { text: "Tamam", onPress: () => setScanned(false) },
        ]);
      } else {
        const msg = result.rewardUnlocked
          ? `Odul kazanildi! ${result.rewardText}`
          : `Damga eklendi: ${result.stampCount}/${result.stampTarget}`;
        Alert.alert("Basarili", msg, [
          {
            text: "Tamam",
            onPress: () => {
              setScanned(false);
              setScanning(false);
            },
          },
        ]);
      }
    } catch {
      Alert.alert("Hata", "QR kod okunamadi", [
        { text: "Tamam", onPress: () => setScanned(false) },
      ]);
    }
  };

  if (scanning) {
    if (!permission?.granted) {
      return (
        <SafeAreaView style={styles.container} edges={["top"]}>
          <View style={styles.centered}>
            <Text style={styles.permText}>
              QR taramak icin kamera izni gerekli
            </Text>
            <Button
              title="Izin Ver"
              variant="primary"
              onPress={requestPermission}
              style={{ marginTop: Spacing.md }}
            />
            <Button
              title="Geri Don"
              variant="ghost"
              onPress={() => setScanning(false)}
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.scannerHeader}>
          <Text style={styles.scannerTitle}>QR Tara</Text>
          <Button
            title="Kapat"
            variant="ghost"
            onPress={() => {
              setScanning(false);
              setScanned(false);
            }}
          />
        </View>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.scannerHint}>
          <Text style={styles.scannerHintText}>
            Musteri QR kodunu kameraya gosterin
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="heading" style={styles.pageTitle}>
          Sadakat Programi
        </Text>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Program Aktif</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ true: Colors.accent }}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.settingLabel}>Damga Sayisi</Text>
            <TextInput
              style={styles.input}
              value={stampTarget}
              onChangeText={setStampTarget}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor={Colors.textMute}
            />
            <Text style={styles.hint}>
              Kac damgada odul verilecek (orn: 10)
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.settingLabel}>Odul Metni</Text>
            <TextInput
              style={styles.input}
              value={rewardText}
              onChangeText={setRewardText}
              placeholder="1 kahve hediye"
              placeholderTextColor={Colors.textMute}
              autoCapitalize="sentences"
            />
          </View>

          <Button
            title={programId ? "Guncelle" : "Programi Olustur"}
            variant="primary"
            loading={saving}
            onPress={handleSave}
          />
        </View>

        {/* Scanner Button */}
        {programId && isActive && (
          <View style={styles.scannerSection}>
            <Text style={styles.sectionTitle}>Damga Ekle</Text>
            <Text variant="muted" style={styles.scannerDesc}>
              Musterinin QR kodunu tarayarak damga ekleyin
            </Text>
            <Button
              title="QR Tara"
              variant="primary"
              onPress={() => setScanning(true)}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  pageTitle: {
    marginBottom: Spacing.lg,
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSoft,
    marginBottom: 6,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
    marginTop: 4,
  },
  scannerSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  scannerDesc: {
    fontSize: FontSize.sm,
  },
  permText: {
    fontSize: FontSize.base,
    color: Colors.textSoft,
    textAlign: "center",
  },
  scannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  scannerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  camera: {
    flex: 1,
  },
  scannerHint: {
    padding: Spacing.md,
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  scannerHintText: {
    fontSize: FontSize.sm,
    color: Colors.textSoft,
  },
});
