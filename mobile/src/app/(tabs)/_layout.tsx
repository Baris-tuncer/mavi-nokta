import { Tabs } from "expo-router";
import { Flame, Map, Gift, User } from "lucide-react-native";
import { Colors } from "../../lib/constants";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.textMute,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Firsatlar",
          tabBarIcon: ({ color, size }) => (
            <Flame size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Harita",
          tabBarIcon: ({ color, size }) => (
            <Map size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="surprise"
        options={{
          title: "Surpriz",
          tabBarIcon: ({ color, size }) => (
            <Gift size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
