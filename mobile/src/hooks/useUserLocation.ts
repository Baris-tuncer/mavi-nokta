import { useState, useEffect } from "react";
import * as Location from "expo-location";

type Coords = { latitude: number; longitude: number };

export function useUserLocation() {
  const [location, setLocation] = useState<Coords | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function requestAndFetch() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (mounted) setPermissionDenied(true);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted) {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      } catch {
        // Silently fail — fall back to default region
      } finally {
        if (mounted) setLoading(false);
      }
    }

    requestAndFetch();
    return () => {
      mounted = false;
    };
  }, []);

  return { location, permissionDenied, loading };
}
