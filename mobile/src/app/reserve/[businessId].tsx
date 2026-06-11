import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronLeft } from "lucide-react-native";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { createReservation } from "../../services/reservation";
import { supabase } from "../../lib/supabase";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
} from "../../lib/constants";

export default function ReserveScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const router = useRouter();

  const [bizName, setBizName] = useState("");
  const [maxParty, setMaxParty] = useState(10);

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [time, setTime] = useState(() => {
    const t = new Date();
    t.setMinutes(0, 0, 0);
    t.setHours(t.getHours() + 1);
    return t;
  });
  const [partySize, setPartySize] = useState("2");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios");
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === "ios");

  useEffect(() => {
    if (!businessId) return;
    supabase
      .from("businesses")
      .select("name, max_party_size")
      .eq("id", businessId)
      .single()
      .then(({ data }) => {
        if (data) {
          setBizName(data.name);
          setMaxParty(data.max_party_size);
        }
      });
  }, [businessId]);

  const partySizeOptions = Array.from({ length: maxParty }, (_, i) => ({
    label: `${i + 1} kisi`,
    value: String(i + 1),
  }));

  const formatDate = (d: Date) =>
    d.toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const formatTime = (t: Date) =>
    t.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  async function handleSubmit() {
    Keyboard.dismiss();
    if (!businessId) return;

    setPending(true);
    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;

      const result = await createReservation({
        businessId,
        date: dateStr,
        time: timeStr,
        partySize: Number(partySize),
        note: note.trim() || undefined,
      });

      if ("error" in result) {
        Alert.alert("Hata", result.error);
        return;
      }

      const msg =
        result.status === "CONFIRMED"
          ? "Rezervasyonunuz onaylandi!"
          : "Rezervasyonunuz alindi. Isletme onayladiktan sonra bilgilendirileceksiniz.";

      Alert.alert("Basarili", msg, [
        { text: "Tamam", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Hata", e.message ?? "Bir sorun olustu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Rezervasyon Yap</Text>
        {bizName ? (
          <Text variant="muted" style={styles.subtitle}>
            {bizName}
          </Text>
        ) : null}

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Tarih</Text>
          {Platform.OS === "android" && (
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.pickerText}>{formatDate(date)}</Text>
            </TouchableOpacity>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              locale="tr-TR"
              onChange={(_, selected) => {
                if (Platform.OS === "android") setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}
        </View>

        {/* Time */}
        <View style={styles.section}>
          <Text style={styles.label}>Saat</Text>
          {Platform.OS === "android" && (
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.pickerText}>{formatTime(time)}</Text>
            </TouchableOpacity>
          )}
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minuteInterval={15}
              locale="tr-TR"
              onChange={(_, selected) => {
                if (Platform.OS === "android") setShowTimePicker(false);
                if (selected) setTime(selected);
              }}
            />
          )}
        </View>

        {/* Party Size */}
        <Select
          label="Kisi Sayisi"
          options={partySizeOptions}
          value={partySize}
          onChange={setPartySize}
          placeholder="Kisi secin..."
        />

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.label}>Not (opsiyonel)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Ozel istek, dogum gunu vb."
            placeholderTextColor={Colors.textMute}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        <Button
          title="Rezervasyon Yap"
          variant="primary"
          loading={pending}
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.base,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSoft,
    marginBottom: 6,
  },
  pickerTrigger: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  pickerText: {
    fontSize: FontSize.base,
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
});
