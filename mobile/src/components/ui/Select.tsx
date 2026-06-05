import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./Text";
import { Colors, BorderRadius, Spacing, FontSize } from "../../lib/constants";
import { ChevronDown, Check } from "lucide-react-native";

type Option = { label: string; value: string };

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Seçiniz...",
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.triggerText,
            !selected && { color: Colors.textMute },
          ]}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color={Colors.textMute} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text variant="heading">{label}</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={{ color: Colors.accent, fontWeight: "600" }}>
                Kapat
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  item.value === value && styles.optionActive,
                ]}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    item.value === value && { color: Colors.accent },
                  ]}
                >
                  {item.label}
                </Text>
                {item.value === value && (
                  <Check size={18} color={Colors.accent} />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  triggerText: {
    fontSize: FontSize.base,
    color: Colors.text,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionActive: {
    backgroundColor: Colors.accentSoft,
  },
  optionText: {
    fontSize: FontSize.base,
    color: Colors.text,
  },
});
