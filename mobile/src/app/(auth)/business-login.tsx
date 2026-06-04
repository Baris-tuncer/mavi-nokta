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
import { Colors, Spacing } from "../../lib/constants";
import { signInWithEmail } from "../../services/auth";
import { useAuth } from "../../providers/AuthProvider";

export default function BusinessLoginScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setError("");

    if (!email.trim() || !password) {
      setError("E-posta ve sifre gerekli.");
      return;
    }

    setPending(true);
    try {
      const { error: authError } = await signInWithEmail(email, password);
      if (authError) {
        setError(authError.message);
        return;
      }
      await refreshProfile();
      router.replace("/(business)/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Bir hata olustu.");
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
          <Text variant="title">Isletme Girisi</Text>
          <Text variant="caption" style={styles.subtitle}>
            Kampanyalarini yonet, musterini al.
          </Text>
        </View>

        <View style={styles.form}>
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
            label="Sifre"
            placeholder="******"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Button
            title="Giris Yap"
            onPress={handleSubmit}
            loading={pending}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.links}>
          <Link href="/(auth)/business-register" asChild>
            <Text style={styles.linkText}>
              Isletme ac — <Text style={styles.linkBold}>ucretsiz</Text>
            </Text>
          </Link>

          <Link href="/(auth)/customer-login" asChild>
            <Text style={styles.linkTextSecondary}>Musteri misin?</Text>
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
    justifyContent: "center",
  },
  header: {
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: Colors.magenta,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  links: {
    alignItems: "center",
    gap: Spacing.md,
  },
  linkText: {
    color: Colors.textSoft,
    fontSize: 14,
  },
  linkBold: {
    color: Colors.blue,
    fontWeight: "600",
  },
  linkTextSecondary: {
    color: Colors.textMute,
    fontSize: 14,
  },
});
