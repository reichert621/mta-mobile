import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import React from "react";
import { router } from "expo-router";
import * as Location from "expo-location";
import { keepPreviousData } from "@tanstack/react-query";

import { cn } from "@/utils";
import { SafeScrollView } from "@/components/SafeView";
import { useStationsByLocation } from "@/utils/api";
import { useRefreshByUser, useRefreshOnFocus } from "@/utils/hooks";
import ScheduleItem from "@/components/ScheduleItem";

function useCurrentLocation() {
  const [isLoading, setLoadingState] = React.useState(true);
  const [isRefreshing, setRefreshingState] = React.useState(false);
  const [lastKnownLocation, setLastKnownLocation] =
    React.useState<Location.LocationObject | null>(null);
  const [currentLocation, setCurrentLocation] =
    React.useState<Location.LocationObject | null>(null);
  const [error, setErrorMessage] = React.useState<string | null>(null);
  const location = currentLocation || lastKnownLocation;

  React.useEffect(() => {
    const init = async () => {
      try {
        setLoadingState(true);
        await refresh();
      } catch (err: any) {
        setErrorMessage(err.message || String(err));
      } finally {
        setLoadingState(false);
      }
    };

    init();
  }, []);

  const refetchLastKnownPosition = React.useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Status:", status);
    if (status !== "granted") {
      setErrorMessage("Permission to access location was denied");
      return;
    }

    const last = await Location.getLastKnownPositionAsync({});
    console.log("Last known:", last);
    setLastKnownLocation(last);
  }, []);

  const refetchCurrentPosition = React.useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Status:", status);
    if (status !== "granted") {
      setErrorMessage("Permission to access location was denied");
      return;
    }

    const current = await Location.getCurrentPositionAsync({});
    console.log("Current location:", current);
    setCurrentLocation(current);
  }, []);

  const refresh = React.useCallback(async () => {
    await Promise.all([refetchLastKnownPosition(), refetchCurrentPosition()]);
  }, []);

  return {
    isLoading,
    isRefreshing,
    location,
    error,
    refetchLastKnownPosition,
    refetchCurrentPosition,
    refresh,
  };
}

const NearbyStations = ({
  location,
}: {
  location: Location.LocationObject;
}) => {
  const { coords } = location;
  const { latitude, longitude } = coords;
  const {
    data: stations = [],
    isLoading,
    isRefetching,
    isPlaceholderData,
    error,
    refetch,
  } = useStationsByLocation(latitude, longitude, {
    placeholderData: keepPreviousData,
    refetchInterval: 10000,
  });
  useRefreshOnFocus(refetch);

  // console.log({
  //   isLoading,
  //   isRefetching,
  //   isPlaceholderData,
  //   error,
  //   stations: stations.length,
  // });

  return (
    <View className="px-4">
      {stations.map((station) => {
        const northbound = station.N || [];
        const southbound = station.S || [];

        return (
          <Animated.View key={station.id} className="mb-6" entering={FadeIn}>
            <Text className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-200">
              {station.name}
            </Text>

            {northbound.length === 0 && southbound.length === 0 && (
              <View className="mb-4">
                <Text className="text-base text-zinc-400 dark:text-zinc-500">
                  No trains found
                </Text>
              </View>
            )}

            {northbound.length > 0 && (
              <View className="mb-4">
                <View className="mb-2">
                  <Text className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                    Northbound
                  </Text>
                </View>
                {northbound.map(({ route, time }, key) => {
                  return (
                    <ScheduleItem
                      key={key}
                      className={isRefetching ? "opacity-80" : "opacity-100"}
                      route={route}
                      time={time}
                      onPress={() =>
                        router.push(
                          `/modals/routes/${
                            station.id
                          }?route=${route}&direction=${"N"}`
                        )
                      }
                    />
                  );
                })}
              </View>
            )}
            {southbound.length > 0 && (
              <View className="mb-4">
                <View className="mb-2">
                  <Text className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                    Southbound
                  </Text>
                </View>
                {southbound.map(({ route, time }, key) => {
                  return (
                    <ScheduleItem
                      key={key}
                      className={isRefetching ? "opacity-80" : "opacity-100"}
                      route={route}
                      time={time}
                      onPress={() =>
                        router.push(
                          `/modals/routes/${
                            station.id
                          }?route=${route}&direction=${"S"}`
                        )
                      }
                    />
                  );
                })}
              </View>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

export default function NearbyScreen() {
  const [isRefreshingByUser, setRefreshingByUser] = React.useState(false);
  const {
    location,
    refresh,
    refetchLastKnownPosition,
    refetchCurrentPosition,
  } = useCurrentLocation();

  useRefreshOnFocus(refresh);

  async function handleRefreshByUser() {
    try {
      setRefreshingByUser(true);
      await refetchLastKnownPosition();
      setRefreshingByUser(false);
      // NB: this refetch takes longer, so we do it in the background
      await refetchCurrentPosition();
    } finally {
      setRefreshingByUser(false);
    }
  }

  return (
    <SafeScrollView
      className="bg-white dark:bg-zinc-950"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshingByUser}
          onRefresh={handleRefreshByUser}
        />
      }
    >
      <View className="mt-12 mb-4 px-4">
        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-4xl">
          Nearby
        </Text>
        <View className="h-px bg-zinc-100 dark:bg-zinc-900 my-2" />
      </View>

      {location ? (
        <NearbyStations location={location} />
      ) : (
        <View className="flex-1 justify-center items-center py-12">
          <ActivityIndicator />
        </View>
      )}
    </SafeScrollView>
  );
}
