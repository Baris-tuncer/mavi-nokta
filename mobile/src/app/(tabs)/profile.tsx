import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { signOut } from "../../services/auth";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from "../../lib/constants";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch {
            Alert.alert("Hata", "Çıkış yapılamadı. Tekrar deneyin.");
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text variant="muted">Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Guest ---
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.guestContainer}>
            <View style={styles.guestIconCircle}>
              <Text style={styles.guestIconText}>?</Text>
            </View>
            <Text variant="heading" style={styles.guestTitle}>
              Hoşgeldiniz
            </Text>
            <Text variant="caption" style={styles.guestSubtitle}>
              Yakınındaki en iyi fırsatları keşfet
            </Text>

            <View style={styles.guestButtons}>
              <Button
                title="Müşteri Girişi"
                variant="primary"
                onPress={() => router.push("/(auth)/customer-login")}
                style={styles.guestButton}
              />
              <Button
                title="İşletme Girişi"
                variant="outline"
                onPress={() => router.push("/(auth)/business-login")}
                style={styles.guestButton}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/customer-register")}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                Hesabın yok mu?{" "}
                <Text style={styles.registerTextBold}>Kayıt Ol</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.demoDivider}>
              <View style={styles.demoDividerLine} />
              <Text style={styles.demoDividerText}>veya</Text>
              <View style={styles.demoDividerLine} />
            </View>

            <Button
              title="Demo İşletme Paneli"
              variant="ghost"
              onPress={() => router.push("/(business)/dashboard")}
              style={styles.guestButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Logged In ---
  const initials = (profile?.name || user.email || "U")
    .substring(0, 2)
    .toUpperCase();

  const roleBadgeVariant = profile?.role === "BUSINESS" ? "amber" : "accent";
  const roleLabel =
    profile?.role === "BUSINESS" ? "İşletme" : "Müşteri";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text variant="heading" style={styles.profileName}>
            {profile?.name || "Kullanıcı"}
          </Text>
          <Text variant="caption" style={styles.profileEmail}>
            {profile?.email || user.email}
          </Text>
          <Badge label={roleLabel} variant={roleBadgeVariant} />
        </View>

        <View style={styles.actions}>
          {profile?.role === "BUSINESS" && (
            <Button
              title="İşletme Paneli"
              variant="secondary"
              onPress={() => router.push("/(business)/dashboard")}
              style={styles.actionButton}
            />
          )}

          <Button
            title="Çıkış Yap"
            variant="danger"
            loading={signingOut}
            onPress={handleSignOut}
            style={styles.actionButton}
          />
        </View>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  guestIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    ...Shadow.glow,
  },
  guestIconText: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.accentLight,
  },
  guestTitle: {
    marginBottom: Spacing.xs,
  },
  guestSubtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  guestButtons: {
    width: "100%",
    gap: Spacing.sm,
  },
  guestButton: {
    width: "100%",
  },
  registerLink: {
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  registerText: {
    color: Colors.textSoft,
    fontSize: FontSize.sm,
  },
  registerTextBold: {
    color: Colors.accentLight,
    fontWeight: "700",
  },
  demoDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  demoDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  demoDividerText: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
  },

  profileHeader: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
    ...Shadow.glow,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
  },
  profileName: {
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    marginBottom: Spacing.sm,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  actionButton: {
    width: "100%",
  },
});
