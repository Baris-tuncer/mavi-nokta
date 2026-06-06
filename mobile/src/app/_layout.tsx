import { useEffect, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { Colors } from "../lib/constants";

SplashScreen.preventAutoHideAsync();

function RoleRedirect() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading || hasRedirected.current) return;

    // BUSINESS kullanicisi (tabs) icindeyse → dashboard'a yonlendir
    if (
      profile?.role === "BUSINESS" &&
      segments[0] === "(tabs)"
    ) {
      hasRedirected.current = true;
      router.replace("/(business)/dashboard");
    }
  }, [loading, profile, segments]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RoleRedirect />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bg },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(auth)"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="(business)" />
          <Stack.Screen
            name="campaign/[id]"
            options={{ presentation: "modal" }}
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
