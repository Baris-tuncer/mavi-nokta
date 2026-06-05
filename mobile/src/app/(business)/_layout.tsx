import { Stack } from "expo-router";
import { Colors } from "../../lib/constants";

export default function BusinessLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.bg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: "İşletme Paneli" }}
      />
      <Stack.Screen
        name="new-campaign"
        options={{ title: "Yeni Kampanya" }}
      />
    </Stack>
  );
}
