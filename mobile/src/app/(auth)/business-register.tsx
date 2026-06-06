import { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "../../components/ui/Button";
import { Text } from "../../components/ui/Text";
import { Select } from "../../components/ui/Select";
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from "../../lib/constants";
import { signUpBusiness } from "../../services/auth";
import { createBusiness } from "../../services/business";
import { cities } from "../../lib/mock-campaigns";
import { useAuth } from "../../providers/AuthProvider";
import type { BusinessCategory } from "../../lib/database.types";

const CATEGORY_OPTIONS = [
  { label: "Cafe", value: "CAFE" },
  { label: "Firin", value: "BAKERY" },
  { label: "Pastane", value: "PASTANE" },
  { label: "Restoran", value: "RESTAURANT" },
  { label: "Fast Food", value: "FASTFOOD" },
  { label: "Tatlici", value: "TATLI" },
  { label: "Bufe", value: "BUFE" },
  { label: "Kasap", value: "KASAP" },
  { label: "Manav", value: "MANAV" },
  { label: "Market", value: "MARKET" },
  { label: "Pub / Bar", value: "PUB" },
  { label: "Pet Shop", value: "PETSHOP" },
  { label: "Eczane", value: "PHARMACY" },
  { label: "Guzellik / Kuafor", value: "BEAUTY" },
  { label: "Cicekci", value: "FLORIST" },
  { label: "Spor Salonu", value: "GYM" },
  { label: "Veteriner", value: "VET" },
  { label: "Diger", value: "OTHER" },
];

const cityOptions = cities.map((c) => ({ label: c.label, value: c.key }));

export default function BusinessRegisterScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [cityKey, setCityKey] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const selectedCity = cities.find((c) => c.key === cityKey);
  const districtOptions = selectedCity
    ? selectedCity.districts
        .filter((d) => d !== "Tum ilceler")
        .map((d) => ({ label: d, value: d }))
    : [];

  function handleCityChange(value: string) {
    setCityKey(value);
    setDistrict("");
  }

  async function handleSubmit() {
    Keyboard.dismiss();
    setError("");

    if (!ownerName.trim()) { setError("Isletme sahibi adi gerekli."); return; }
    if (!email.trim()) { setError("E-posta gerekli."); return; }
    if (!password || password.length < 6) { setError("Sifre en az 6 karakter olmali."); return; }
    if (!businessName.trim()) { setError("Isletme adi gerekli."); return; }
    if (!category) { setError("Kategori seciniz."); return; }
    if (category === "OTHER" && !customCategory.trim()) { setError("Kategori adini yaziniz."); return; }
    if (!cityKey) { setError("Sehir seciniz."); return; }
    if (!district) { setError("Ilce seciniz."); return; }
    if (!address.trim()) { setError("Adres gerekli."); return; }

    setPending(true);
    try {
      const { error: authError } = await signUpBusiness(
        email, password, ownerName.trim()
      );
      if (authError) { setError(authError.message); return; }

      const cityLabel = selectedCity?.label ?? cityKey;
      await createBusiness({
        businessName: businessName.trim(),
        category: category as BusinessCategory,
        customCategory: category === "OTHER" ? customCategory.trim() : undefined,
        cityKey,
        cityLabel,
        district,
        address: address.trim(),
        phone: phone.trim() || null,
      });

      await refreshProfile();
      router.replace("/(business)/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Bir hata olustu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={Keyboard.dismiss}
    >
      {/* Header */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Isletme Kayit</Text>
      <Text style={styles.subtitle}>
        Isletmeni kaydet, kampanyalarini paylas.
      </Text>

      {/* Section 1: Hesap Bilgileri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ahmet Yilmaz"
            placeholderTextColor={Colors.textMute}
            value={ownerName}
            onChangeText={setOwnerName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@mail.com"
            placeholderTextColor={Colors.textMute}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Sifre</Text>
          <TextInput
            style={styles.input}
            placeholder="******"
            placeholderTextColor={Colors.textMute}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
          />
          <Text style={styles.hint}>En az 6 karakter</Text>
        </View>
      </View>

      {/* Section 2: Isletme Bilgileri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Isletme Bilgileri</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Isletme Adi</Text>
          <TextInput
            style={styles.input}
            placeholder="Kahve Ustasi"
            placeholderTextColor={Colors.textMute}
            value={businessName}
            onChangeText={setBusinessName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <Select
          label="Kategori"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
          placeholder="Kategori seciniz..."
        />

        {category === "OTHER" && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kategori Adi</Text>
            <TextInput
              style={styles.input}
              placeholder="Orn: Kuruyemisci, Dondurma..."
              placeholderTextColor={Colors.textMute}
              value={customCategory}
              onChangeText={setCustomCategory}
              autoCapitalize="words"
            />
          </View>
        )}
      </View>

      {/* Section 3: Konum */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konum</Text>

        <Select
          label="Sehir"
          options={cityOptions}
          value={cityKey}
          onChange={handleCityChange}
          placeholder="Sehir seciniz..."
        />

        <Select
          label="Ilce"
          options={districtOptions}
          value={district}
          onChange={setDistrict}
          placeholder={cityKey ? "Ilce seciniz..." : "Once sehir seciniz"}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Adres</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Sinanpasa Mh., Besiktas"
            placeholderTextColor={Colors.textMute}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="sentences"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Telefon (opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="05XX XXX XX XX"
            placeholderTextColor={Colors.textMute}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Error & Submit */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Button
        title="Isletme Olustur"
        onPress={handleSubmit}
        loading={pending}
        style={styles.submitButton}
      />

      <View style={styles.links}>
        <Link href="/(auth)/business-login" asChild>
          <Text style={styles.linkText}>
            Zaten hesabin var mi?{" "}
            <Text style={styles.linkBold}>Giris yap</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    padding: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textMute,
    marginBottom: Spacing.xl,
  },

  /* Sections */
  section: {
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

  /* Fields */
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSoft,
    marginBottom: 6,
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
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
    marginTop: 4,
  },

  /* Error */
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.action,
    fontSize: 13,
  },

  submitButton: {
    marginBottom: Spacing.md,
  },
  links: {
    alignItems: "center",
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  linkText: {
    color: Colors.textSoft,
    fontSize: 14,
  },
  linkBold: {
    color: Colors.accentLight,
    fontWeight: "600",
  },
});
