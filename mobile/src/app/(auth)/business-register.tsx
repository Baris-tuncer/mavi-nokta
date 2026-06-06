import { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Pressable,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "../../components/ui/Button";
import { Text } from "../../components/ui/Text";
import { Select } from "../../components/ui/Select";
import { Colors, Spacing, BorderRadius, FontSize } from "../../lib/constants";
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
        .filter((d) => d !== "Tüm ilçeler")
        .map((d) => ({ label: d, value: d }))
    : [];

  function handleCityChange(value: string) {
    setCityKey(value);
    setDistrict("");
  }

  async function handleSubmit() {
    Keyboard.dismiss();
    setError("");

    if (!ownerName.trim()) { setError("İşletme sahibi adı gerekli."); return; }
    if (!email.trim()) { setError("E-posta gerekli."); return; }
    if (!password || password.length < 6) { setError("Şifre en az 6 karakter olmalı."); return; }
    if (!businessName.trim()) { setError("İşletme adı gerekli."); return; }
    if (!category) { setError("Kategori seçiniz."); return; }
    if (category === "OTHER" && !customCategory.trim()) { setError("Lütfen kategori adını yazınız."); return; }
    if (!cityKey) { setError("Şehir seçiniz."); return; }
    if (!district) { setError("İlçe seçiniz."); return; }
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
      setError(e.message ?? "Bir hata oluştu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text variant="title">İşletme Kayıt</Text>
        <Text variant="caption" style={styles.subtitle}>
          İşletmeni kaydet, kampanyalarını paylaş.
        </Text>

        {/* Account fields */}
        <Text variant="label" style={styles.label}>İşletme Sahibi Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="Ahmet Yılmaz"
          placeholderTextColor={Colors.textMute}
          value={ownerName}
          onChangeText={setOwnerName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Text variant="label" style={styles.label}>E-posta</Text>
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

        <Text variant="label" style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="******"
          placeholderTextColor={Colors.textMute}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="next"
        />
        <Text variant="muted" style={styles.hint}>6+ karakter</Text>

        {/* Separator */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text variant="muted" style={styles.separatorText}>
            İşletme Bilgileri
          </Text>
          <View style={styles.separatorLine} />
        </View>

        <Text variant="label" style={styles.label}>İşletme Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="Kahve Ustası"
          placeholderTextColor={Colors.textMute}
          value={businessName}
          onChangeText={setBusinessName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Select
          label="Kategori"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
          placeholder="Kategori seçiniz..."
        />

        {category === "OTHER" && (
          <>
            <Text variant="label" style={styles.label}>Kategori Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Kuruyemişçi, Dondurma, Börekçi..."
              placeholderTextColor={Colors.textMute}
              value={customCategory}
              onChangeText={setCustomCategory}
              autoCapitalize="words"
            />
          </>
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

        <Text variant="label" style={styles.label}>Adres</Text>
        <TextInput
          style={styles.input}
          placeholder="Sinanpaşa Mh., Beşiktaş"
          placeholderTextColor={Colors.textMute}
          value={address}
          onChangeText={setAddress}
          autoCapitalize="sentences"
          returnKeyType="next"
        />

        <Text variant="label" style={styles.label}>Telefon</Text>
        <TextInput
          style={styles.input}
          placeholder="05XX XXX XX XX"
          placeholderTextColor={Colors.textMute}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
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

        <View style={styles.links}>
          <Link href="/(auth)/business-login" asChild>
            <Text style={styles.linkText}>
              Zaten hesabın var mı?{" "}
              <Text style={styles.linkBold}>Giriş yap</Text>
            </Text>
          </Link>
        </View>
      </ScrollView>
    </Pressable>
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
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  hint: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
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
    marginTop: Spacing.xl,
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
