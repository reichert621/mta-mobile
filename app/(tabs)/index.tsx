import { Pressable, RefreshControl, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import React from "react";
import { router } from "expo-router";

import { useFavorites } from "@/utils/context";
import { FavoriteStation, cn } from "@/utils";
import { SafeScrollView } from "@/components/SafeView";
import { useStationsByIds } from "@/utils/api";
import { useRefreshOnFocus } from "@/utils/hooks";
import ScheduleItem from "@/components/ScheduleItem";

const TrainSchedules = ({ routes }: { routes: FavoriteStation[] }) => {
  const routeIds = routes.filter((r) => r.active).map((r) => r.id);
  const {
    data: stations = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useStationsByIds(routeIds, {
    refetchInterval: 10000,
  });
  useRefreshOnFocus(refetch);

  // console.log({
  //   isLoading,
  //   isRefetching,
  //   error,
  //   stations: stations.length,
  // });

  if (isLoading) {
    return null;
  }

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
          </Animated.View>
        );
      })}
    </View>
  );
};

export default function HomeScreen() {
  // TODO: if no favorites, find nearby stations
  const { favorites = [], isLoading, error } = useFavorites();

  return (
    <SafeScrollView
      className="bg-white dark:bg-zinc-950"
      // refreshControl={
      //   <RefreshControl refreshing={false} onRefresh={console.log} />
      // }
    >
      <View className="mt-12 mb-4 px-4">
        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-4xl">
          Trains
        </Text>
        <View className="h-px bg-zinc-100 dark:bg-zinc-900 my-2" />
      </View>

      {favorites.length > 0 && <TrainSchedules routes={favorites} />}
    </SafeScrollView>
  );
}
