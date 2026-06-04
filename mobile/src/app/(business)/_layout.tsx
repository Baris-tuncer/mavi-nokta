import { Stack } from "expo-router";
import { Colors } from "../../lib/constants";

export default function BusinessLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: "Isletme Paneli" }}
      />
      <Stack.Screen
        name="new-campaign"
        options={{ title: "Yeni Kampanya" }}
      />
    </Stack>
  );
}
