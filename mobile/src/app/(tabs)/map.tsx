import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, LatLng, Region } from "react-native-maps";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Crosshair } from "lucide-react-native";
import { Text } from "../../components/ui/Text";
import {
  BusinessListItem,
  ITEM_HEIGHT,
} from "../../components/BusinessListItem";
import {
  groupCampaignsByBusiness,
  type BusinessGroup,
} from "../../lib/business-groups";
import { getActiveCampaigns } from "../../services/campaign";
import { mockCampaigns, categoryMeta } from "../../lib/mock-campaigns";
import { categoryColors } from "../../lib/category-colors";
import { useUserLocation } from "../../hooks/useUserLocation";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  Shadow,
} from "../../lib/constants";

const ISTANBUL_REGION: Region = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const ITEM_TOTAL_HEIGHT = ITEM_HEIGHT + Spacing.xs * 2;

export default function MapScreen() {
  const [groups, setGroups] = useState<BusinessGroup[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { location: userLocation } = useUserLocation();

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<any>(null);

  const snapPoints = useMemo(() => ["18%", "50%", "90%"], []);

  // --- Fetch campaigns ---
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const campaigns = await getActiveCampaigns();
        if (mounted) {
          const result =
            campaigns.length > 0
              ? groupCampaignsByBusiness(campaigns)
              : groupCampaignsByBusiness(mockCampaigns);
          setGroups(result);
        }
      } catch {
        if (mounted) {
          setGroups(groupCampaignsByBusiness(mockCampaigns));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // --- fitToCoordinates after data loads ---
  useEffect(() => {
    if (groups.length === 0 || !mapRef.current) return;

    const timer = setTimeout(() => {
      const coords: LatLng[] = groups.map((g) => ({
        latitude: g.lat,
        longitude: g.lng,
      }));

      if (userLocation) {
        coords.push({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });
      }

      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 60, bottom: 300, left: 60 },
        animated: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [groups, userLocation]);

  // --- Marker press → scroll list ---
  const handleMarkerPress = useCallback(
    (groupKey: string) => {
      setActiveId(groupKey);

      const index = groups.findIndex((g) => g.key === groupKey);
      if (index >= 0 && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }

      bottomSheetRef.current?.snapToIndex(1);
    },
    [groups]
  );

  // --- List item press → animate map ---
  const handleListItemPress = useCallback((group: BusinessGroup) => {
    setActiveId(group.key);

    mapRef.current?.animateToRegion(
      {
        latitude: group.lat,
        longitude: group.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, []);

  // --- Center on user location ---
  const handleCenterOnMe = useCallback(() => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500
    );
  }, [userLocation]);

  // --- getItemLayout for instant scrollToIndex ---
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_TOTAL_HEIGHT,
      offset: ITEM_TOTAL_HEIGHT * index,
      index,
    }),
    []
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Map ── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={ISTANBUL_REGION}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
      >
        {groups.map((group) => {
          const isActive = activeId === group.key;
          const colors = categoryColors[group.category];
          const meta = categoryMeta[group.category];

          return (
            <Marker
              key={`${group.key}-${isActive ? "active" : "idle"}`}
              coordinate={{ latitude: group.lat, longitude: group.lng }}
              onPress={() => handleMarkerPress(group.key)}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.markerWrapper}>
                {/* Name label - visible when active */}
                {isActive && (
                  <View
                    style={[
                      styles.markerLabel,
                      { backgroundColor: colors.marker },
                    ]}
                  >
                    <Text style={styles.markerLabelText} numberOfLines={1}>
                      {meta.emoji} {group.name}
                    </Text>
                    <View
                      style={[
                        styles.markerLabelArrow,
                        { borderTopColor: colors.marker },
                      ]}
                    />
                  </View>
                )}
                {/* Dot */}
                <View
                  style={[
                    styles.markerDot,
                    {
                      backgroundColor: colors.marker,
                      borderColor: isActive
                        ? Colors.white
                        : colors.markerBorder,
                      shadowColor: colors.marker,
                    },
                    isActive && styles.markerDotActive,
                  ]}
                >
                  {isActive && (
                    <Text style={styles.markerEmoji}>{meta.emoji}</Text>
                  )}
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ── Center-on-me FAB ── */}
      {userLocation && (
        <TouchableOpacity
          style={styles.centerButton}
          onPress={handleCenterOnMe}
          activeOpacity={0.7}
        >
          <Crosshair size={22} color={Colors.accentLight} />
        </TouchableOpacity>
      )}

      {/* ── Bottom Sheet ── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
        enableDynamicSizing={false}
      >
        <View style={styles.sheetHeader}>
          <Text variant="heading" style={styles.sheetTitle}>
            Yakınındaki İşletmeler
          </Text>
          <Text variant="muted">{groups.length} işletme</Text>
        </View>

        <BottomSheetFlatList
          ref={flatListRef}
          data={groups}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <BusinessListItem
              group={item}
              isSelected={activeId === item.key}
              onPress={() => handleListItemPress(item)}
            />
          )}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="muted" style={styles.emptyText}>
                Yakında kampanya bulunamadı
              </Text>
            </View>
          }
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
  },

  // Markers
  markerWrapper: {
    alignItems: "center",
  },
  markerLabel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    marginBottom: 4,
    maxWidth: 160,
    ...Shadow.md,
  },
  markerLabelText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "700",
    textAlign: "center",
  },
  markerLabelArrow: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  markerDotActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
  },
  markerEmoji: {
    fontSize: 12,
    textAlign: "center",
  },

  // Center button
  centerButton: {
    position: "absolute",
    right: Spacing.md,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.md,
  },

  // Bottom sheet
  sheetBackground: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetIndicator: {
    backgroundColor: Colors.surface3,
    width: 40,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSize.base,
  },
});
