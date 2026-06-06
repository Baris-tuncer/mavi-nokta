import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Pressable,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Button } from "../../components/ui/Button";
import { Text } from "../../components/ui/Text";
import { Colors, Spacing, BorderRadius, FontSize } from "../../lib/constants";
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
    Keyboard.dismiss();
    setError("");

    if (!email.trim() || !password) {
      setError("E-posta ve şifre gerekli.");
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
      setError(e.message ?? "Bir hata oluştu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text variant="title">İşletme Girişi</Text>
      <Text variant="caption" style={styles.subtitle}>
        Kampanyalarını yönet, müşterini al.
      </Text>

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
        returnKeyType="done"
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <Button
        title="Giriş Yap"
        onPress={handleSubmit}
        loading={pending}
        style={styles.submitButton}
      />

      <View style={styles.links}>
        <Link href="/(auth)/business-register" asChild>
          <Text style={styles.linkText}>
            İşletme aç — <Text style={styles.linkBold}>ücretsiz</Text>
          </Text>
        </Link>

        <Link href="/(auth)/customer-login" asChild>
          <Text style={styles.linkTextSecondary}>Müşteri misin?</Text>
        </Link>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: 60,
    backgroundColor: Colors.bg,
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
  },
  linkText: {
    color: Colors.textSoft,
    fontSize: 14,
  },
  linkBold: {
    color: Colors.accentLight,
    fontWeight: "600",
  },
  linkTextSecondary: {
    color: Colors.textMute,
    fontSize: 14,
  },
});
