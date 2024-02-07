import { Text, View } from "react-native";
import dayjs from "dayjs";

import { useFavorites } from "@/utils/context";
import { FavoriteStation, getColorByRoute } from "@/utils";
import { SafeScrollView } from "@/components/SafeView";
import Debugger from "@/components/Debugger";
import { useStationsByIds } from "@/utils/api";

/**
 * TODO: Display upcoming train times based on the user's favorite routes.
 * (e.g. "DeKalb Station -> Q train in 5 mins, B in 7 mins, D in 8 mins, etc")
 *
 * Implementation notes:
 * - user favorite routes are currently just hardcoded and stored locally in AsyncStorage
 * - will use existing MTA APIs (hooks already implemented in @/utils/api)
 * - will use polling to make sure train times are up to date
 * - if time allows, will start implementing UI where user can add/remove favorites (in new tab screen)
 */

const TrainSchedules = ({ routes }: { routes: FavoriteStation[] }) => {
  const routeIds = routes.filter((r) => r.active).map((r) => r.id);
  const {
    data: stations = [],
    isLoading,
    error,
  } = useStationsByIds(routeIds, { refetchInterval: 10000 });

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
            <Text className="text-2xl font-bold mb-2">{station.name}</Text>

            <View className="mb-4">
              <View className="mb-2">
                <Text className="text-lg font-medium text-zinc-500">
                  Northbound
                </Text>
              </View>
              {northbound.map(({ route, time }, key) => {
                const formatted = dayjs(time).format("h:mm a");
                const mins = dayjs(time).diff(dayjs(), "minutes");
                const [bg, text] = getColorByRoute(route);

                return (
                  <View
                    key={key}
                    className="flex mb-1 flex-row items-center justify-between"
                  >
                    <View className="flex flex-row items-center gap-3">
                      <View
                        className={`${bg} h-9 w-9 items-center justify-center rounded-full`}
                      >
                        <Text className={`${text} text-sm font-bold`}>
                          {route}
                        </Text>
                      </View>
                      <Text className="text-zinc-700 font-medium text-base">
                        {mins} {mins === 1 ? "min" : "mins"} away
                      </Text>
                    </View>

                    <View>
                      <Text className="text-zinc-400 text-base">
                        {formatted}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View className="mb-4">
              <View className="mb-2">
                <Text className="text-lg font-medium text-zinc-500">
                  Southbound
                </Text>
              </View>
              {southbound.map(({ route, time }, key) => {
                const formatted = dayjs(time).format("h:mm a");
                const mins = dayjs(time).diff(dayjs(), "minutes");
                const [bg, text] = getColorByRoute(route);

                return (
                  <View
                    key={key}
                    className="flex mb-1 flex-row items-center justify-between"
                  >
                    <View className="flex flex-row items-center gap-4">
                      <View
                        className={`${bg} h-8 w-8 items-center justify-center rounded-full`}
                      >
                        <Text className={`${text} text-sm font-bold`}>
                          {route}
                        </Text>
                      </View>
                      <Text className="text-zinc-700 font-medium text-base">
                        {mins} {mins === 1 ? "min" : "mins"} away
                      </Text>
                    </View>

                    <View>
                      <Text className="text-zinc-500 text-base">
                        {formatted}
                      </Text>
                    </View>
                  </View>
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
  const { favorites = [], isLoading, error } = useFavorites();

  return (
    <SafeScrollView className="bg-white">
      <View className="mt-12 mb-4 px-4">
        <Text className="font-bold text-zinc-900 text-4xl">Trains</Text>
        <View className="h-px bg-zinc-200 my-2" />
      </View>
      {/* <Debugger data={favorites} /> */}

      {favorites.length > 0 && <TrainSchedules routes={favorites} />}
    </SafeScrollView>
  );
}
