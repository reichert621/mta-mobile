import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import React from "react";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { useFavorites } from "@/utils/context";
import { FavoriteStation, cn } from "@/utils";
import { SafeScrollView } from "@/components/SafeView";
import { StationSchedule, useStationsByIds } from "@/utils/api";
import { useRefreshByUser, useRefreshOnFocus } from "@/utils/hooks";
import ScheduleItem from "@/components/ScheduleItem";

function useFavoriteStations() {
  const {
    favorites = [],
    isLoading: isLoadingCache,
    error: cacheError,
  } = useFavorites();
  const routeIds = favorites.filter((r) => r.active).map((r) => r.id);
  const {
    data: stations = [],
    isLoading: isLoadingStations,
    isRefetching,
    error: stationsError,
    refetch,
  } = useStationsByIds(routeIds, {
    refetchInterval: 10000,
  });

  return {
    favorites,
    stations,
    isLoading: isLoadingCache || isLoadingStations,
    isRefetching: isRefetching,
    error: cacheError || stationsError,
    refetch,
  };
}

const TrainSchedules = ({
  routes,
  stations,
  isRefreshing,
}: {
  routes: FavoriteStation[];
  stations: StationSchedule[];
  isRefreshing?: boolean;
}) => {
  const routeIds = routes.filter((r) => r.active).map((r) => r.id);
  const settingsById = React.useMemo(() => {
    return routes.reduce((acc, route) => {
      return { ...acc, [route.id]: route.enabled };
    }, {} as Record<string, any>);
  }, [routeIds]);

  return (
    <View className="px-4">
      {stations.map((station) => {
        const enabled = settingsById[station.id] || {
          northbound: {},
          southbound: {},
        };
        const n = station.N || [];
        const s = station.S || [];
        const northbound = n.filter(({ route }) => {
          return !!enabled.northbound[route];
        });
        const southbound = s.filter(({ route }) => {
          return !!enabled.southbound[route];
        });

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
                      className={isRefreshing ? "opacity-80" : "opacity-100"}
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
                      className={isRefreshing ? "opacity-80" : "opacity-100"}
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

export default function HomeScreen() {
  // TODO: if no favorites, find nearby stations?
  const {
    favorites = [],
    stations = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useFavoriteStations();
  useRefreshOnFocus(refetch);
  const { refresh, isRefreshing } = useRefreshByUser(refetch);

  return (
    <SafeScrollView
      className="bg-white dark:bg-zinc-950"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
      }
    >
      <View className="mt-12 mb-4 px-4">
        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-4xl">
          Trains
        </Text>
        <View className="h-px bg-zinc-100 dark:bg-zinc-900 my-2" />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center py-12">
          <ActivityIndicator />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <Text className="text-lg text-zinc-500 dark:text-zinc-400">
            No stations have been favorited.
          </Text>

          <Link href="/settings" asChild>
            <Pressable className="mt-4 flex flex-row gap-2 items-center justify-center border border-zinc-700 bg-zinc-800 rounded px-4 py-3">
              <Text className="text-zinc-100 font-medium">
                Manage your favorite stations
              </Text>
              <Ionicons
                name="arrow-forward"
                color={colors.zinc[200]}
                size={16}
              />
            </Pressable>
          </Link>
        </View>
      ) : (
        <TrainSchedules
          routes={favorites}
          stations={stations}
          isRefreshing={isLoading || isRefetching}
        />
      )}
    </SafeScrollView>
  );
}
