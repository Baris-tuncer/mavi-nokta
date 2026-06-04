import { Stack } from "expo-router";
import { Colors } from "../../lib/constants";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen
        name="customer-login"
        options={{ title: "Musteri Girisi" }}
      />
      <Stack.Screen
        name="business-login"
        options={{ title: "Isletme Girisi" }}
      />
      <Stack.Screen
        name="customer-register"
        options={{ title: "Musteri Kayit" }}
      />
      <Stack.Screen
        name="business-register"
        options={{ title: "Isletme Kayit" }}
      />
    </Stack>
  );
}
