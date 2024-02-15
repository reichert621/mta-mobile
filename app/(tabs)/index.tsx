import { RefreshControl, Text, View } from "react-native";
import React from "react";
import dayjs from "dayjs";

import { useFavorites } from "@/utils/context";
import { FavoriteStation, cn, getColorByRoute } from "@/utils";
import { SafeScrollView } from "@/components/SafeView";
import { useStationsByIds } from "@/utils/api";
import { useRefreshOnFocus } from "@/utils/hooks";

const ScheduleItem = ({
  className,
  time,
  route,
}: {
  className?: string;
  time: string;
  route: string;
}) => {
  const formatted = dayjs(time).format("h:mm a");
  const mins = dayjs(time).diff(dayjs(), "minutes");
  const secs = dayjs(time).diff(dayjs(), "seconds");
  const [bg, text] = getColorByRoute(route);

  const [n, setN] = React.useState(0);

  React.useEffect(() => {
    if (mins < 1) {
      const i = setInterval(() => setN((n) => n + 1), 1000);

      return () => clearInterval(i);
    }
  }, [mins]);

  return (
    <View
      className={cn(
        "flex mb-1 flex-row items-center justify-between",
        className,
        secs < 0 && "opacity-60"
      )}
    >
      <View className="flex flex-row items-center gap-3">
        <View
          className={`${bg} h-9 w-9 items-center justify-center rounded-full`}
        >
          <Text className={`${text} text-sm font-bold`}>{route}</Text>
        </View>
        {mins === 0 ? (
          <Text className="text-red-700 dark:text-red-300 font-medium text-base">
            {Math.abs(secs)} {Math.abs(secs) === 1 ? "second" : "seconds"}{" "}
            {secs < 0 ? "ago" : "away"}
          </Text>
        ) : (
          <Text className="text-zinc-700 dark:text-zinc-300 font-medium text-base">
            {Math.abs(mins)} {Math.abs(mins) === 1 ? "min" : "mins"}{" "}
            {secs < 0 ? "ago" : "away"}
          </Text>
        )}
      </View>

      <View>
        <Text className="text-zinc-400 text-base">{formatted}</Text>
      </View>
    </View>
  );
};

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
          <View key={station.id} className="mb-6">
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
                  />
                );
              })}
            </View>
          </View>
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
