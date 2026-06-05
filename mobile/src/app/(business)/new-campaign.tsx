import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Switch,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  Sparkles,
  ChevronLeft,
  Clock,
  Calendar,
} from "lucide-react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Text } from "../../components/ui/Text";
import { createCampaign } from "../../services/campaign";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Shadow,
} from "../../lib/constants";

/* ── Types ── */
type TemplateKey = "STOK" | "SURPRIZ" | "HAPPY" | "SERBEST";
type DurationKey = "1h" | "2h" | "4h" | "eod";

/* ── Templates with Unsplash images ── */
const TEMPLATES: {
  key: TemplateKey;
  image: string;
  title: string;
  subtitle: string;
  defaults: { isSurprise: boolean; duration: DurationKey };
}[] = [
  {
    key: "STOK",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    title: "Stok Eritme",
    subtitle: "İndirimli satış",
    defaults: { isSurprise: false, duration: "2h" },
  },
  {
    key: "SURPRIZ",
    image:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80",
    title: "Sürpriz Paket",
    subtitle: "Sıfır Atık",
    defaults: { isSurprise: true, duration: "eod" },
  },
  {
    key: "HAPPY",
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
    title: "Mutlu Saat",
    subtitle: "Happy Hour",
    defaults: { isSurprise: false, duration: "2h" },
  },
  {
    key: "SERBEST",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80",
    title: "Serbest",
    subtitle: "Kendin Yaz",
    defaults: { isSurprise: false, duration: "2h" },
  },
];

/* ── Duration presets ── */
const DURATIONS: { key: DurationKey; label: string }[] = [
  { key: "1h", label: "+1 Saat" },
  { key: "2h", label: "+2 Saat" },
  { key: "4h", label: "+4 Saat" },
  { key: "eod", label: "Gün Sonu" },
];

function calcTimes(key: DurationKey): { start: Date; end: Date } {
  const now = new Date();
  switch (key) {
    case "1h":
      return { start: now, end: new Date(now.getTime() + 1 * 3_600_000) };
    case "2h":
      return { start: now, end: new Date(now.getTime() + 2 * 3_600_000) };
    case "4h":
      return { start: now, end: new Date(now.getTime() + 4 * 3_600_000) };
    case "eod": {
      const eod = new Date(now);
      eod.setHours(23, 59, 0, 0);
      return { start: now, end: eod };
    }
  }
}

function formatTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/* ── Main ── */
export default function NewCampaignScreen() {
  const router = useRouter();

  /* Step */
  const [step, setStep] = useState<"template" | "form">("template");
  const [template, setTemplate] = useState<TemplateKey | null>(null);

  /* Form */
  const [slogan, setSlogan] = useState("");
  const [isSurprise, setIsSurprise] = useState(false);
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [activeDuration, setActiveDuration] = useState<DurationKey | null>(
    "2h"
  );
  const [startsAt, setStartsAt] = useState<Date>(() => new Date());
  const [endsAt, setEndsAt] = useState<Date>(() => calcTimes("2h").end);
  const [totalStock, setTotalStock] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* Picker state */
  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(
    null
  );
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  /* ── Handlers ── */
  function applyDuration(key: DurationKey) {
    const times = calcTimes(key);
    setActiveDuration(key);
    setStartsAt(times.start);
    setEndsAt(times.end);
  }

  function selectTemplate(key: TemplateKey) {
    const t = TEMPLATES.find((t) => t.key === key)!;
    setTemplate(key);
    setIsSurprise(t.defaults.isSurprise);
    applyDuration(t.defaults.duration);
    setStep("form");
  }

  function openPicker(target: "start" | "end") {
    setPickerTarget(target);
    setPickerMode("date");
  }

  function handlePickerChange(
    event: DateTimePickerEvent,
    date: Date | undefined
  ) {
    if (event.type === "dismissed") {
      setPickerTarget(null);
      setPickerMode("date");
      return;
    }

    if (!date) return;

    if (Platform.OS === "android") {
      if (pickerMode === "date") {
        const existing = pickerTarget === "start" ? startsAt : endsAt;
        const merged = new Date(date);
        merged.setHours(existing.getHours(), existing.getMinutes(), 0, 0);
        if (pickerTarget === "start") setStartsAt(merged);
        else setEndsAt(merged);
        setPickerMode("time");
        return;
      }
      if (pickerTarget === "start") setStartsAt(date);
      else setEndsAt(date);
      setActiveDuration(null);
      setPickerTarget(null);
      setPickerMode("date");
    } else {
      if (pickerTarget === "start") setStartsAt(date);
      else setEndsAt(date);
      setActiveDuration(null);
    }
  }

  function closePicker() {
    setPickerTarget(null);
    setPickerMode("date");
  }

  async function handleSubmit() {
    setError(null);

    if (!slogan.trim()) {
      setError("Slogan gerekli.");
      return;
    }

    const op = parseFloat(oldPrice);
    const np = parseFloat(newPrice);

    if (isNaN(op) || isNaN(np) || op <= 0 || np <= 0) {
      setError("Geçerli fiyat girin.");
      return;
    }
    if (np >= op) {
      setError("İndirimli fiyat eski fiyattan düşük olmalı.");
      return;
    }
    if (endsAt <= startsAt) {
      setError("Bitiş saati başlangıçtan sonra olmalı.");
      return;
    }

    setSubmitting(true);
    try {
      await createCampaign({
        slogan: slogan.trim(),
        title: slogan.trim().slice(0, 60),
        description: null,
        imageUrl: null,
        oldPrice: op,
        newPrice: np,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        totalStock: totalStock.trim() ? parseInt(totalStock, 10) : null,
        isSurprisePackage: isSurprise,
        surpriseHint: null,
        status: "ACTIVE",
      });
      router.replace("/(business)/dashboard");
    } catch (err: any) {
      const msg = err?.message || "Kampanya oluşturulamadı.";
      setError(msg);
      Alert.alert("Hata", msg);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Template Step ── */
  if (step === "template") {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ChevronLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nasıl bir fırsat?</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.headerSubtitle}>
          Bir şablon seç, hızlıca yayına al.
        </Text>

        {/* Template grid */}
        <View style={styles.templateGrid}>
          {TEMPLATES.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => selectTemplate(t.key)}
              style={styles.templateCard}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: t.image }}
                style={styles.templateImage}
                contentFit="cover"
                transition={300}
              />
              <View style={styles.templateOverlay} />
              <View style={styles.templateTextWrap}>
                <Text style={styles.templateTitle}>{t.title}</Text>
                <Text style={styles.templateSubtitle}>{t.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  /* ── Form Step ── */
  const selectedTemplate = TEMPLATES.find((t) => t.key === template);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setStep("template")}
            style={styles.backBtn}
          >
            <ChevronLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedTemplate?.title ?? "Yeni Fırsat"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Surprise toggle */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.switchTitle}>Sürpriz Paket</Text>
              <Text variant="muted">
                İçeriği müşteriye sürpriz olarak göster
              </Text>
            </View>
            <Switch
              value={isSurprise}
              onValueChange={setIsSurprise}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>

          {/* Slogan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Slogan</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={slogan}
                onChangeText={setSlogan}
                placeholder="Müşterinin kafasına yapışacak tek cümle"
                placeholderTextColor={Colors.textMute}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Prices */}
          <Text style={styles.sectionLabel}>Fiyatlandırma</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <Text style={styles.fieldLabel}>Eski Fiyat (₺)</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={oldPrice}
                  onChangeText={setOldPrice}
                  placeholder="100"
                  placeholderTextColor={Colors.textMute}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
            </View>
            <View style={styles.priceField}>
              <Text style={styles.fieldLabel}>Yeni Fiyat (₺)</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={newPrice}
                  onChangeText={setNewPrice}
                  placeholder="50"
                  placeholderTextColor={Colors.textMute}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>
            </View>
          </View>

          {/* Quick duration buttons */}
          <Text style={styles.sectionLabel}>Hızlı Süre</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => {
              const active = activeDuration === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => applyDuration(d.key)}
                  style={[
                    styles.durationBtn,
                    active && styles.durationBtnActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.durationBtnText,
                      active && styles.durationBtnTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Start / End time pickers */}
          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <Text style={styles.timeLabel}>Başlangıç</Text>
              <TouchableOpacity
                style={styles.timePicker}
                onPress={() => openPicker("start")}
                activeOpacity={0.7}
              >
                <Calendar size={16} color={Colors.textMute} />
                <Text style={styles.timePickerText}>
                  {formatDate(startsAt)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timePicker, { marginTop: Spacing.xs }]}
                onPress={() => {
                  setPickerTarget("start");
                  setPickerMode("time");
                }}
                activeOpacity={0.7}
              >
                <Clock size={16} color={Colors.textMute} />
                <Text style={styles.timePickerText}>
                  {formatTime(startsAt)}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeCol}>
              <Text style={styles.timeLabel}>Bitiş</Text>
              <TouchableOpacity
                style={styles.timePicker}
                onPress={() => openPicker("end")}
                activeOpacity={0.7}
              >
                <Calendar size={16} color={Colors.textMute} />
                <Text style={styles.timePickerText}>{formatDate(endsAt)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timePicker, { marginTop: Spacing.xs }]}
                onPress={() => {
                  setPickerTarget("end");
                  setPickerMode("time");
                }}
                activeOpacity={0.7}
              >
                <Clock size={16} color={Colors.textMute} />
                <Text style={styles.timePickerText}>{formatTime(endsAt)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Native DateTimePicker */}
          {pickerTarget !== null && Platform.OS === "ios" && (
            <View style={styles.iosPickerWrap}>
              <View style={styles.iosPickerHeader}>
                <Text style={styles.iosPickerTitle}>
                  {pickerTarget === "start" ? "Başlangıç" : "Bitiş"} Zamanı
                </Text>
                <TouchableOpacity onPress={closePicker}>
                  <Text style={styles.iosPickerDone}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerTarget === "start" ? startsAt : endsAt}
                mode="datetime"
                display="spinner"
                onChange={handlePickerChange}
                locale="tr"
                themeVariant="dark"
              />
            </View>
          )}

          {pickerTarget !== null && Platform.OS === "android" && (
            <DateTimePicker
              value={pickerTarget === "start" ? startsAt : endsAt}
              mode={pickerMode}
              display="default"
              onChange={handlePickerChange}
            />
          )}

          {/* Stock */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Toplam Stok (opsiyonel)</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={totalStock}
                onChangeText={setTotalStock}
                placeholder="Limit yoksa boş bırak"
                placeholderTextColor={Colors.textMute}
                keyboardType="numeric"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            activeOpacity={0.8}
          >
            <Sparkles size={20} color={Colors.white} />
            <Text style={styles.submitBtnText}>
              {submitting ? "Yayına alınıyor..." : "Yayına Al"}
            </Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={submitting}
            style={styles.cancelBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>İptal</Text>
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMute,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },

  /* ── Template grid ── */
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
    justifyContent: "space-between",
    rowGap: Spacing.sm,
  },
  templateCard: {
    width: "48.5%",
    height: 160,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  templateImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
  },
  templateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: BorderRadius.xl,
  },
  templateTextWrap: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.md,
  },
  templateTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.white,
  },
  templateSubtitle: {
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  /* ── Form ── */
  formContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  switchLabel: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMute,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  /* Inline inputs (no Input component wrapper) */
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMute,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  textInput: {
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },

  /* Price row — no gap, explicit margins */
  priceRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  priceField: {
    flex: 1,
    marginRight: Spacing.sm,
  },

  /* Duration buttons */
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    marginRight: Spacing.xs,
  },
  durationBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft,
  },
  durationBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSoft,
  },
  durationBtnTextActive: {
    color: Colors.accentLight,
  },

  /* Time pickers */
  timeRow: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  timeCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  timeLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMute,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timePickerText: {
    fontSize: FontSize.base,
    color: Colors.text,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },

  /* iOS picker */
  iosPickerWrap: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  iosPickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iosPickerTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSoft,
  },
  iosPickerDone: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.accent,
  },

  /* Error */
  errorBox: {
    backgroundColor: Colors.actionSoft,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 77, 77, 0.3)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.action,
    textAlign: "center",
  },

  /* Submit */
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    marginTop: Spacing.md,
    ...Shadow.glow,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtnText: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.textMute,
  },
});
