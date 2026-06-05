import { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Text } from "../../components/ui/Text";
import { Select } from "../../components/ui/Select";
import { Colors, Spacing } from "../../lib/constants";
import { signUpBusiness } from "../../services/auth";
import { createBusiness } from "../../services/business";
import { cities } from "../../lib/mock-campaigns";
import { useAuth } from "../../providers/AuthProvider";
import type { BusinessCategory } from "../../lib/database.types";

const CATEGORY_OPTIONS = [
  { label: "Cafe", value: "CAFE" },
  { label: "Fırın", value: "BAKERY" },
  { label: "Pastane", value: "PASTANE" },
  { label: "Restoran", value: "RESTAURANT" },
  { label: "Fast Food", value: "FASTFOOD" },
  { label: "Tatlıcı", value: "TATLI" },
  { label: "Büfe", value: "BUFE" },
  { label: "Kasap", value: "KASAP" },
  { label: "Manav", value: "MANAV" },
  { label: "Market", value: "MARKET" },
  { label: "Pub / Bar", value: "PUB" },
  { label: "Pet Shop", value: "PETSHOP" },
  { label: "Eczane", value: "PHARMACY" },
  { label: "Güzellik / Kuaför", value: "BEAUTY" },
  { label: "Çiçekçi", value: "FLORIST" },
  { label: "Spor Salonu", value: "GYM" },
  { label: "Veteriner", value: "VET" },
  { label: "Diğer (Manuel Yaz)", value: "OTHER" },
];

const cityOptions = cities.map((c) => ({ label: c.label, value: c.key }));

export default function BusinessRegisterScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  // Account fields
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Business fields
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [cityKey, setCityKey] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Compute district options based on selected city
  const selectedCity = cities.find((c) => c.key === cityKey);
  const districtOptions = selectedCity
    ? selectedCity.districts
        .filter((d) => d !== "Tüm ilçeler")
        .map((d) => ({ label: d, value: d }))
    : [];

  function handleCityChange(value: string) {
    setCityKey(value);
    setDistrict("");
  }

  async function handleSubmit() {
    setError("");

    if (!ownerName.trim()) {
      setError("İşletme sahibi adı gerekli.");
      return;
    }
    if (!email.trim()) {
      setError("E-posta gerekli.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (!businessName.trim()) {
      setError("İşletme adı gerekli.");
      return;
    }
    if (!category) {
      setError("Kategori seçiniz.");
      return;
    }
    if (category === "OTHER" && !customCategory.trim()) {
      setError("Lütfen kategori adını yazınız.");
      return;
    }
    if (!cityKey) {
      setError("Şehir seçiniz.");
      return;
    }
    if (!district) {
      setError("İlçe seçiniz.");
      return;
    }
    if (!address.trim()) {
      setError("Adres gerekli.");
      return;
    }

    setPending(true);
    try {
      const { error: authError } = await signUpBusiness(
        email,
        password,
        ownerName.trim()
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      const cityLabel = selectedCity?.label ?? cityKey;

      await createBusiness({
        businessName: businessName.trim(),
        category: category as BusinessCategory,
        customCategory:
          category === "OTHER" ? customCategory.trim() : undefined,
        cityKey,
        cityLabel,
        district,
        address: address.trim(),
        phone: phone.trim() || null,
      });

      await refreshProfile();
      router.replace("/(business)/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Bir hata oluştu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="title">İşletme Kayıt</Text>
          <Text variant="caption" style={styles.subtitle}>
            İşletmeni kaydet, kampanyalarını paylaş.
          </Text>
        </View>

        {/* Account fields */}
        <View style={styles.form}>
          <Input
            label="İşletme Sahibi Adı"
            placeholder="Ahmet Yılmaz"
            value={ownerName}
            onChangeText={setOwnerName}
            autoCapitalize="words"
            autoComplete="name"
          />

          <Input
            label="E-posta"
            placeholder="ornek@mail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Şifre"
            placeholder="******"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            hint="6+ karakter"
          />

          {/* Separator */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text variant="muted" style={styles.separatorText}>
              İşletme Bilgileri
            </Text>
            <View style={styles.separatorLine} />
          </View>

          <Input
            label="İşletme Adı"
            placeholder="Kahve Ustası"
            value={businessName}
            onChangeText={setBusinessName}
            autoCapitalize="words"
          />

          <Select
            label="Kategori"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            placeholder="Kategori seçiniz..."
          />

          {category === "OTHER" && (
            <Input
              label="Kategori Adı"
              placeholder="Örn: Kuruyemişçi, Dondurma, Börekçi..."
              value={customCategory}
              onChangeText={setCustomCategory}
              autoCapitalize="words"
            />
          )}

          <Select
            label="Şehir"
            options={cityOptions}
            value={cityKey}
            onChange={handleCityChange}
            placeholder="Şehir seçiniz..."
          />

          <Select
            label="İlçe"
            options={districtOptions}
            value={district}
            onChange={setDistrict}
            placeholder={cityKey ? "İlçe seçiniz..." : "Önce şehir seçiniz"}
          />

          <Input
            label="Adres"
            placeholder="Sinanpaşa Mh., Beşiktaş"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="sentences"
          />

          <Input
            label="Telefon"
            placeholder="05XX XXX XX XX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Button
            title="İşletme Oluştur"
            onPress={handleSubmit}
            loading={pending}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.links}>
          <Link href="/(auth)/business-login" asChild>
            <Text style={styles.linkText}>
              Zaten hesabın var mı?{" "}
              <Text style={styles.linkBold}>Giriş yap</Text>
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  separatorText: {
    marginHorizontal: Spacing.md,
  },
  errorText: {
    color: Colors.action,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.sm,
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
