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
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen
        name="customer-login"
        options={{ title: "Müşteri Girişi" }}
      />
      <Stack.Screen
        name="business-login"
        options={{ title: "İşletme Girişi" }}
      />
      <Stack.Screen
        name="customer-register"
        options={{ title: "Müşteri Kayıt" }}
      />
      <Stack.Screen
        name="business-register"
        options={{ title: "İşletme Kayıt" }}
      />
    </Stack>
  );
}
