import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import { Text } from "../../components/ui/Text";
import {
  groupCampaignsByBusiness,
  cheapestCampaign,
  type BusinessGroup,
} from "../../lib/business-groups";
import { getActiveCampaigns } from "../../services/campaign";
import { mockCampaigns, categoryMeta } from "../../lib/mock-campaigns";
import { formatPrice } from "../../lib/utils";
import { Colors, Spacing, FontSize, BorderRadius } from "../../lib/constants";

const ISTANBUL_REGION: Region = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapScreen() {
  const [groups, setGroups] = useState<BusinessGroup[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        // Fallback to mock data on any error
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={ISTANBUL_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {groups.map((group) => {
          const isActive = activeId === group.key;
          const cheapest = cheapestCampaign(group);
          const meta = categoryMeta[group.category];

          return (
            <Marker
              key={group.key}
              coordinate={{ latitude: group.lat, longitude: group.lng }}
              onPress={() => setActiveId(group.key)}
            >
              <View
                style={[
                  styles.markerDot,
                  isActive && styles.markerDotActive,
                ]}
              />
              <Callout tooltip={false}>
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>
                    {meta.emoji} {group.name}
                  </Text>
                  {cheapest && (
                    <Text style={styles.calloutPrice}>
                      {formatPrice(cheapest.newPrice)}
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
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
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.blue,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerDotActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.magenta,
    borderWidth: 3,
  },
  callout: {
    minWidth: 140,
    padding: Spacing.sm,
    alignItems: "center",
  },
  calloutName: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  calloutPrice: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.blue,
    marginTop: Spacing.xs,
  },
});
