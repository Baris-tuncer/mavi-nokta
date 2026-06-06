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
import { Colors, Spacing, BorderRadius, FontSize } from "../../lib/constants";
import { signUpCustomer } from "../../services/auth";
import { updateProfileExtras, ensureCustomerRow } from "../../services/profile";
import { useAuth } from "../../providers/AuthProvider";

export default function CustomerRegisterScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    Keyboard.dismiss();
    setError("");

    if (!name.trim()) {
      setError("Ad soyad gerekli.");
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

    setPending(true);
    try {
      const { data, error: authError } = await signUpCustomer(
        email,
        password,
        name.trim()
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.session) {
        Alert.alert(
          "E-posta Onayı",
          "Kayıt başarılı! Lütfen e-postanı kontrol edip hesabını onayla.",
          [
            {
              text: "Tamam",
              onPress: () => router.replace("/(auth)/customer-login"),
            },
          ]
        );
        return;
      }

      await updateProfileExtras(
        name.trim(),
        phone.trim() || undefined,
        city.trim() || undefined
      );
      await ensureCustomerRow();
      await refreshProfile();
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Bir hata oluştu.");
    } finally {
      setPending(false);
    }
  }

  return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text variant="title">Kayıt Ol</Text>
        <Text variant="caption" style={styles.subtitle}>
          30 saniye sürer. Kart yok, abonelik yok.
        </Text>

        <Text variant="label" style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ahmet Yılmaz"
          placeholderTextColor={Colors.textMute}
          value={name}
          onChangeText={setName}
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

        <Text variant="label" style={styles.label}>Telefon</Text>
        <TextInput
          style={styles.input}
          placeholder="05XX XXX XX XX"
          placeholderTextColor={Colors.textMute}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text variant="label" style={styles.label}>Şehir</Text>
        <TextInput
          style={styles.input}
          placeholder="İstanbul"
          placeholderTextColor={Colors.textMute}
          value={city}
          onChangeText={setCity}
          autoCapitalize="words"
          returnKeyType="done"
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <Button
          title="Kayıt Ol"
          onPress={handleSubmit}
          loading={pending}
          style={styles.submitButton}
        />

        <View style={styles.links}>
          <Link href="/(auth)/customer-login" asChild>
            <Text style={styles.linkText}>
              Zaten hesabın var mı?{" "}
              <Text style={styles.linkBold}>Giriş yap</Text>
            </Text>
          </Link>
        </View>
      </ScrollView>
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
