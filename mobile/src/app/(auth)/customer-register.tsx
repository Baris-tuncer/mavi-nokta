import { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Text } from "../../components/ui/Text";
import { Colors, Spacing } from "../../lib/constants";
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

      // If no session, email confirmation is required
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

      // Session exists — set up profile extras and customer row
      await updateProfileExtras(
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="title">Kayıt Ol</Text>
          <Text variant="caption" style={styles.subtitle}>
            30 saniye sürer. Kart yok, abonelik yok.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Ad Soyad"
            placeholder="Ahmet Yılmaz"
            value={name}
            onChangeText={setName}
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

          <Input
            label="Telefon"
            placeholder="05XX XXX XX XX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <Input
            label="Şehir"
            placeholder="İstanbul"
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
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
        </View>

        <View style={styles.links}>
          <Link href="/(auth)/customer-login" asChild>
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
