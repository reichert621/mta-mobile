import { Pressable, Text, TextInput, View } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "tailwindcss/colors";

import Debugger from "@/components/Debugger";
import { SafeScrollView } from "@/components/SafeView";
import { useFavorites } from "@/utils/context";
import { DEFAULT_FAVORITES, FavoriteStation, getColorByRoute } from "@/utils";
import { StationSchedule, useStationsByQuery } from "@/utils/api";

export default function SettingsScreen() {
  const { favorites = [], set } = useFavorites();
  const [query, setQuery] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const {
    data: results = [],
    isLoading: isLoadingSearchResults,
    error: searchError,
  } = useStationsByQuery(searchQuery);

  const favoritesById = React.useMemo(() => {
    return favorites.reduce((acc, record) => {
      return { ...acc, [record.id]: record };
    }, {} as Record<string, FavoriteStation>);
  }, [favorites]);

  const toggle = async (route: FavoriteStation) => {
    const isFavorited = !!favoritesById[route.id];

    if (isFavorited) {
      // Remove
      await set(favorites.filter((favorite) => favorite.id !== route.id));
    } else {
      // Add
      await set(favorites.concat(route));
    }
  };

  const handleAddFavorite = async (station: StationSchedule) => {
    const { id, name, routes, location } = station;

    if (favorites.some((r) => r.id === id)) {
      return;
    }

    await set(
      favorites.concat({
        id,
        name,
        routes,
        location,
        active: true,
        northbound: true,
        southbound: true,
      })
    );
  };

  const handleSearchStations = () => {
    console.log("Searching!", query);

    setSearchQuery(query);
  };

  return (
    <SafeScrollView className="bg-white dark:bg-zinc-950">
      <View className="mt-12 mb-4 px-4">
        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-4xl">
          Settings
        </Text>
        <View className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
      </View>

      <View className="px-4">
        <View className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <Text className="text-2xl font-bold dark:text-zinc-200">
            Favorites
          </Text>
        </View>
        {/* TODO: allow sorting (https://github.com/computerjazz/react-native-draggable-flatlist) */}
        {favorites.map((station) => {
          const { routes = [] } = station;

          return (
            <View
              key={station.id}
              className="border-b border-zinc-200 dark:border-zinc-800 py-4 px-2"
            >
              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-medium dark:text-zinc-300">
                  {station.name}
                </Text>
                <Pressable onPress={() => toggle(station)}>
                  <Ionicons
                    name="star"
                    size={18}
                    color={
                      station.active ? colors.amber[400] : colors.zinc[400]
                    }
                  />
                </Pressable>
              </View>
              {routes.length > 0 && (
                <View className="mt-1 flex flex-row items-center gap-1">
                  {routes.map((r) => {
                    const [bg, text] = getColorByRoute(r);

                    return (
                      <View
                        key={r}
                        className={`${bg} rounded-full items-center justify-center h-8 w-8`}
                      >
                        <Text className={`${text} text-sm font-medium`}>
                          {r}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View className="mt-8 px-4">
        <View>
          <Text className="text-2xl font-bold mb-2">Search stations</Text>
        </View>
        {/* TODO: figure out how search inputs look in ios apps */}
        <View className="flex flex-row gap-2 relative items-center">
          <TextInput
            className="border bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-1 border-zinc-200 dark:border-zinc-700 p-3 dark:text-zinc-100"
            placeholder="Search for a station..."
            value={query}
            onChangeText={(text) => setQuery(text)}
          />
          <Pressable
            className="bg-white border border-zinc-200 dark:border-zinc-800 absolute right-2 rounded-xl py-2 px-2"
            onPress={handleSearchStations}
          >
            <Ionicons name="search" color={colors.zinc[700]} size={16} />
          </Pressable>
        </View>

        <View className="mt-4 border-t border-zinc-200 dark:border-zinc-800">
          {/* TODO: order by closest (if location available) */}
          {results.map((station) => {
            return (
              <Pressable
                key={station.id}
                className="border-b border-zinc-200 dark:border-zinc-800 py-3 px-2"
                onPress={() => handleAddFavorite(station)}
              >
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-lg font-medium mb-1 dark:text-zinc-300">
                    {station.name}
                  </Text>
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.zinc[400]}
                  />
                </View>

                <View className="flex flex-row items-center gap-0.5">
                  {station.routes.map((r) => {
                    const [bg, text] = getColorByRoute(r);
                    return (
                      <View
                        key={r}
                        className={`${bg} rounded-full items-center justify-center h-6 w-6`}
                      >
                        <Text className={`${text} text-sm font-medium`}>
                          {r}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeScrollView>
  );
}
