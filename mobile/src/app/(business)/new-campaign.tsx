import React, { useState } from "react";
import {
  View,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "../../components/ui/Text";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { createCampaign } from "../../services/campaign";
import { Colors, Spacing, FontSize, BorderRadius } from "../../lib/constants";

export default function NewCampaignScreen() {
  const router = useRouter();

  const [isSurprise, setIsSurprise] = useState(false);
  const [slogan, setSlogan] = useState("");
  const [title, setTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [surpriseHint, setSurpriseHint] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [totalStock, setTotalStock] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);

    if (!slogan.trim() || !title.trim()) {
      setError("Slogan ve baslik zorunludur.");
      return;
    }

    const oldPriceNum = parseFloat(oldPrice);
    const newPriceNum = parseFloat(newPrice);

    if (isNaN(oldPriceNum) || isNaN(newPriceNum)) {
      setError("Gecerli fiyat giriniz.");
      return;
    }

    if (newPriceNum >= oldPriceNum) {
      setError("Yeni fiyat eski fiyattan dusuk olmali.");
      return;
    }

    if (!startsAt.trim() || !endsAt.trim()) {
      setError("Baslangic ve bitis zamani giriniz.");
      return;
    }

    setSubmitting(true);

    try {
      await createCampaign({
        slogan: slogan.trim(),
        title: title.trim(),
        description: description.trim() || null,
        imageUrl: photoUrl.trim() || null,
        oldPrice: oldPriceNum,
        newPrice: newPriceNum,
        startsAt: startsAt.trim(),
        endsAt: endsAt.trim(),
        totalStock: totalStock ? parseInt(totalStock, 10) : null,
        isSurprisePackage: isSurprise,
        surpriseHint: isSurprise ? surpriseHint.trim() || null : null,
      });

      router.replace("/(business)/dashboard");
    } catch (err: any) {
      const message = err?.message || "Kampanya olusturulamadi.";
      setError(message);
      Alert.alert("Hata", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Surprise Toggle */}
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Surpriz Paket</Text>
            <Text variant="muted">
              Icerigi musteriye surpriz olarak goster
            </Text>
          </View>
          <Switch
            value={isSurprise}
            onValueChange={setIsSurprise}
            trackColor={{ false: Colors.border, true: Colors.blue }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Basic Fields */}
        <Input
          label="Slogan"
          placeholder="Bugune ozel firsatimiz..."
          value={slogan}
          onChangeText={setSlogan}
        />

        <Input
          label="Baslik"
          placeholder="Kampanya adi"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Fotograf URL"
          placeholder="https://..."
          value={photoUrl}
          onChangeText={setPhotoUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Input
          label="Aciklama"
          placeholder="Kampanya detaylari..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.multilineInput}
        />

        {isSurprise && (
          <Input
            label="Surpriz Ipucu"
            placeholder="Icerige dair bir ipucu..."
            value={surpriseHint}
            onChangeText={setSurpriseHint}
          />
        )}

        {/* Pricing */}
        <Text variant="label" style={styles.sectionLabel}>
          Fiyatlandirma
        </Text>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Eski Fiyat (TL)"
              placeholder="0"
              value={oldPrice}
              onChangeText={setOldPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="Yeni Fiyat (TL)"
              placeholder="0"
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Timing */}
        <Text variant="label" style={styles.sectionLabel}>
          Zamanlama
        </Text>

        <Input
          label="Baslangic"
          placeholder="2026-06-04T14:00:00"
          value={startsAt}
          onChangeText={setStartsAt}
          autoCapitalize="none"
          hint="ISO format: YYYY-MM-DDTHH:mm:ss"
        />

        <Input
          label="Bitis"
          placeholder="2026-06-04T18:00:00"
          value={endsAt}
          onChangeText={setEndsAt}
          autoCapitalize="none"
          hint="ISO format: YYYY-MM-DDTHH:mm:ss"
        />

        {/* Stock */}
        <Text variant="label" style={styles.sectionLabel}>
          Stok
        </Text>

        <Input
          label="Toplam Stok"
          placeholder="Bos birakilirsa sinirsiz"
          value={totalStock}
          onChangeText={setTotalStock}
          keyboardType="numeric"
          hint="Opsiyonel"
        />

        {/* Error */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Kampanya Olustur"
            variant="primary"
            loading={submitting}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />
          <Button
            title="Iptal"
            variant="ghost"
            onPress={() => router.back()}
            disabled={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  switchLabel: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  sectionLabel: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.magenta,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  submitBtn: {
    marginBottom: Spacing.xs,
  },
});
