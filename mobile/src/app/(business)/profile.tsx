import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { signOut } from "../../services/auth";
import { updateProfileExtras } from "../../services/profile";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from "../../lib/constants";

export default function BusinessProfileScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

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
            router.replace("/(tabs)");
          } catch {
            Alert.alert("Hata", "Cikis yapilamadi. Tekrar deneyin.");
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const handleEditName = () => {
    setNameInput(profile?.name || "");
    setEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setSavingName(true);
    try {
      await updateProfileExtras(trimmed);
      await refreshProfile();
      setEditingName(false);
    } catch {
      Alert.alert("Hata", "Isim kaydedilemedi.");
    } finally {
      setSavingName(false);
    }
  };

  if (!user || !profile) return null;

  const initials = (profile.name || user.email || "U")
    .substring(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          {editingName ? (
            <View style={styles.editNameRow}>
              <TextInput
                style={styles.editNameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
                placeholder="Ad Soyad"
                placeholderTextColor={Colors.textMute}
              />
              <TouchableOpacity
                style={styles.editNameSave}
                onPress={handleSaveName}
                disabled={savingName}
              >
                <Text style={styles.editNameSaveText}>
                  {savingName ? "..." : "Kaydet"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editNameCancel}
                onPress={() => setEditingName(false)}
              >
                <Text style={styles.editNameCancelText}>Iptal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleEditName} activeOpacity={0.7}>
              <Text variant="heading" style={styles.profileName}>
                {profile.name}
              </Text>
              <Text style={styles.editHint}>Duzenlemek icin dokun</Text>
            </TouchableOpacity>
          )}

          <Text variant="caption" style={styles.profileEmail}>
            {profile.email}
          </Text>
          <Badge label="Isletme" variant="amber" />
        </View>

        <View style={styles.actions}>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
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
    marginBottom: 2,
    textAlign: "center",
  },
  editHint: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  editNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  editNameSave: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  editNameSaveText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  editNameCancel: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
  },
  editNameCancelText: {
    color: Colors.textMute,
    fontSize: FontSize.sm,
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
