import { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { signOut } from "../../services/auth";
import { updateProfileExtras } from "../../services/profile";
import { getMyClaims, type MyClaim } from "../../services/claim";
import {
  getMyReservations,
  cancelReservation,
  type MyReservation,
} from "../../services/reservation";
import {
  getMyLoyaltyCards,
  type MyLoyaltyCard,
} from "../../services/loyalty";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { LoyaltyCard } from "../../components/LoyaltyCard";
import { LoyaltyQRModal } from "../../components/LoyaltyQRCode";
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from "../../lib/constants";

const STATUS_LABELS: Record<string, { label: string; variant: "accent" | "eco" | "neutral" | "action" | "amber" }> = {
  RESERVED: { label: "Bekliyor", variant: "accent" },
  REDEEMED: { label: "Kullanildi", variant: "eco" },
  EXPIRED: { label: "Suresi Doldu", variant: "neutral" },
  CANCELLED: { label: "Iptal", variant: "amber" },
};

const REZ_STATUS: Record<string, { label: string; variant: "accent" | "eco" | "neutral" | "action" | "amber" }> = {
  PENDING: { label: "Bekliyor", variant: "amber" },
  CONFIRMED: { label: "Onaylandi", variant: "eco" },
  REJECTED: { label: "Reddedildi", variant: "action" },
  CANCELLED: { label: "Iptal", variant: "neutral" },
  COMPLETED: { label: "Tamamlandi", variant: "accent" },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [claims, setClaims] = useState<MyClaim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [reservations, setReservations] = useState<MyReservation[]>([]);
  const [rezLoading, setRezLoading] = useState(false);
  const [loyaltyCards, setLoyaltyCards] = useState<MyLoyaltyCard[]>([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [qrModal, setQrModal] = useState<{
    visible: boolean;
    customerId: string;
    programId: string;
    businessName: string;
  }>({ visible: false, customerId: "", programId: "", businessName: "" });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  const fetchClaims = useCallback(async () => {
    if (!user) return;
    setClaimsLoading(true);
    try {
      const data = await getMyClaims();
      setClaims(data);
    } catch {
      // sessizce hata yut
    } finally {
      setClaimsLoading(false);
    }
  }, [user]);

  const fetchReservations = useCallback(async () => {
    if (!user) return;
    setRezLoading(true);
    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch {
      // ignore
    } finally {
      setRezLoading(false);
    }
  }, [user]);

  const fetchLoyaltyCards = useCallback(async () => {
    if (!user) return;
    setLoyaltyLoading(true);
    try {
      const data = await getMyLoyaltyCards();
      setLoyaltyCards(data);
    } catch {
      // ignore
    } finally {
      setLoyaltyLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchClaims();
    fetchReservations();
    fetchLoyaltyCards();
  }, [fetchClaims, fetchReservations, fetchLoyaltyCards]);

  const handleCancelRez = async (id: string) => {
    Alert.alert("Iptal Et", "Rezervasyonu iptal etmek istediginize emin misiniz?", [
      { text: "Vazgec", style: "cancel" },
      {
        text: "Iptal Et",
        style: "destructive",
        onPress: async () => {
          const result = await cancelReservation(id);
          if ("error" in result) {
            Alert.alert("Hata", result.error);
          } else {
            fetchReservations();
          }
        },
      },
    ]);
  };

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
                <Text style={styles.registerTextBold}>Müşteri Kayıt</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/business-register")}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                İşletme sahibi misin?{" "}
                <Text style={styles.registerTextBold}>İşletme Kayıt</Text>
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
                {profile?.name || "Kullanici"}
              </Text>
              <Text style={styles.editHint}>Duzenlemek icin dokun</Text>
            </TouchableOpacity>
          )}

          <Text variant="caption" style={styles.profileEmail}>
            {profile?.email || user.email}
          </Text>
          <Badge label={roleLabel} variant={roleBadgeVariant} />
        </View>

        {/* Firsatlarim */}
        {profile?.role !== "BUSINESS" && (
          <View style={styles.claimsSection}>
            <Text style={styles.claimsSectionTitle}>Firsatlarim</Text>
            {claimsLoading ? (
              <ActivityIndicator
                size="small"
                color={Colors.accent}
                style={{ marginVertical: Spacing.md }}
              />
            ) : claims.length === 0 ? (
              <View style={styles.claimsEmpty}>
                <Text style={styles.claimsEmptyText}>
                  Henuz firsat yakalamadin
                </Text>
              </View>
            ) : (
              claims.map((claim) => {
                const st = STATUS_LABELS[claim.status] ?? {
                  label: claim.status,
                  variant: "neutral" as const,
                };
                return (
                  <View key={claim.id} style={styles.claimCard}>
                    <View style={styles.claimCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.claimTitle}>
                          {claim.campaign.title}
                        </Text>
                        <Text style={styles.claimBusiness}>
                          {claim.campaign.business.name} -{" "}
                          {claim.campaign.business.district}
                        </Text>
                      </View>
                      <Badge
                        label={st.label}
                        variant={st.variant}
                      />
                    </View>
                    <View style={styles.claimCodeRow}>
                      <Text style={styles.claimCodeLabel}>Kod:</Text>
                      <Text style={styles.claimCode}>{claim.code}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Rezervasyonlarim */}
        {profile?.role !== "BUSINESS" && (
          <View style={styles.claimsSection}>
            <Text style={styles.claimsSectionTitle}>Rezervasyonlarim</Text>
            {rezLoading ? (
              <ActivityIndicator
                size="small"
                color={Colors.accent}
                style={{ marginVertical: Spacing.md }}
              />
            ) : reservations.length === 0 ? (
              <View style={styles.claimsEmpty}>
                <Text style={styles.claimsEmptyText}>
                  Henuz rezervasyonun yok
                </Text>
              </View>
            ) : (
              reservations.map((rez) => {
                const st = REZ_STATUS[rez.status] ?? {
                  label: rez.status,
                  variant: "neutral" as const,
                };
                const canCancel =
                  rez.status === "PENDING" || rez.status === "CONFIRMED";
                return (
                  <View key={rez.id} style={styles.claimCard}>
                    <View style={styles.claimCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.claimTitle}>
                          {rez.business.name}
                        </Text>
                        <Text style={styles.claimBusiness}>
                          {rez.reservationDate} - {rez.reservationTime.slice(0, 5)} · {rez.partySize} kisi
                        </Text>
                      </View>
                      <Badge label={st.label} variant={st.variant} />
                    </View>
                    {rez.rejectReason && (
                      <Text style={{ fontSize: 12, color: Colors.action, marginTop: 4 }}>
                        Sebep: {rez.rejectReason}
                      </Text>
                    )}
                    {canCancel && (
                      <TouchableOpacity
                        style={styles.rezCancelBtn}
                        onPress={() => handleCancelRez(rez.id)}
                      >
                        <Text style={styles.rezCancelText}>Iptal Et</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Sadakat Kartlarim */}
        {profile?.role !== "BUSINESS" && (
          <View style={styles.claimsSection}>
            <Text style={styles.claimsSectionTitle}>Sadakat Kartlarim</Text>
            {loyaltyLoading ? (
              <ActivityIndicator
                size="small"
                color={Colors.accent}
                style={{ marginVertical: Spacing.md }}
              />
            ) : loyaltyCards.length === 0 ? (
              <View style={styles.claimsEmpty}>
                <Text style={styles.claimsEmptyText}>
                  Henuz sadakat kartin yok
                </Text>
              </View>
            ) : (
              loyaltyCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    setQrModal({
                      visible: true,
                      customerId: user!.id,
                      programId: card.programId,
                      businessName: card.business.name,
                    })
                  }
                  style={{ marginBottom: Spacing.sm }}
                >
                  <LoyaltyCard
                    businessName={card.business.name}
                    stampCount={card.stampCount}
                    stampTarget={card.stampTarget}
                    rewardText={card.rewardText}
                    isRewardClaimed={card.isRewardClaimed}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: Colors.textMute,
                      textAlign: "center",
                      marginTop: 4,
                    }}
                  >
                    QR kod icin dokun
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <LoyaltyQRModal
          visible={qrModal.visible}
          onClose={() => setQrModal((p) => ({ ...p, visible: false }))}
          customerId={qrModal.customerId}
          programId={qrModal.programId}
          businessName={qrModal.businessName}
        />

        <View style={styles.actions}>
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
  claimsSection: {
    marginTop: Spacing.xl,
  },
  claimsSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  claimsEmpty: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  claimsEmptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMute,
  },
  claimCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  claimCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  claimTitle: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.text,
  },
  claimBusiness: {
    fontSize: FontSize.xs,
    color: Colors.textMute,
    marginTop: 2,
  },
  claimCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  claimCodeLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSoft,
  },
  claimCode: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.accent,
    letterSpacing: 2,
  },

  rezCancelBtn: {
    marginTop: Spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.md,
    alignSelf: "flex-start",
  },
  rezCancelText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.action,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  actionButton: {
    width: "100%",
  },
});
