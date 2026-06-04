import { useState } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { signOut } from "../../services/auth";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Colors, Spacing, BorderRadius, FontSize } from "../../lib/constants";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Cikis Yap", "Hesabinizdan cikmak istediginize emin misiniz?", [
      { text: "Iptal", style: "cancel" },
      {
        text: "Cikis Yap",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch {
            Alert.alert("Hata", "Cikis yapilamadi. Tekrar deneyin.");
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
          <Text variant="muted">Yukleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Logged Out ---
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.guestContainer}>
            <View style={styles.guestIconCircle}>
              <Text style={styles.guestIconText}>?</Text>
            </View>
            <Text variant="heading" style={styles.guestTitle}>
              Hosgeldiniz
            </Text>
            <Text variant="caption" style={styles.guestSubtitle}>
              Firsatlardan yararlanmak icin giris yapin veya kayit olun
            </Text>

            <View style={styles.guestButtons}>
              <Button
                title="Musteri Girisi"
                variant="primary"
                onPress={() => router.push("/(auth)/customer-login")}
                style={styles.guestButton}
              />
              <Button
                title="Isletme Girisi"
                variant="outline"
                onPress={() => router.push("/(auth)/business-login")}
                style={styles.guestButton}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/customer-login")}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                Hesabiniz yok mu?{" "}
                <Text style={styles.registerTextBold}>Kayit Ol</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Logged In ---
  const initials = (profile?.name || user.email || "U")
    .substring(0, 2)
    .toUpperCase();

  const roleBadgeVariant = profile?.role === "BUSINESS" ? "amber" : "blue";
  const roleLabel =
    profile?.role === "BUSINESS" ? "Isletme" : "Musteri";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text variant="heading" style={styles.profileName}>
            {profile?.name || "Kullanici"}
          </Text>
          <Text variant="caption" style={styles.profileEmail}>
            {profile?.email || user.email}
          </Text>
          <Badge label={roleLabel} variant={roleBadgeVariant} />
        </View>

        <View style={styles.actions}>
          {profile?.role === "BUSINESS" && (
            <Button
              title="Isletme Paneli"
              variant="secondary"
              onPress={() => router.push("/(business)/dashboard")}
              style={styles.actionButton}
            />
          )}

          <Button
            title="Cikis Yap"
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

  // --- Guest State ---
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  guestIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  guestIconText: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textMute,
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
    color: Colors.blue,
    fontWeight: "700",
  },

  // --- Logged In State ---
  profileHeader: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.blue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
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
