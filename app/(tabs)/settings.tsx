import { Link, router } from "expo-router";
import {
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Dimensions,
  GestureResponderEvent,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "tailwindcss/colors";
import Animated from "react-native-reanimated";
import useDebounce from "react-use/esm/useDebounce";
import { keepPreviousData } from "@tanstack/react-query";

import {
  SafeScrollView,
  SafeView,
  SafeKeyboardAwareScrollView,
} from "@/components/SafeView";
import { useFavorites } from "@/utils/context";
import {
  EMPTY_SETTINGS,
  FavoriteStation,
  FavoriteStationSettings,
  cn,
  getColorByRoute,
} from "@/utils";
import { StationSchedule, useStationsByQuery } from "@/utils/api";
import SwipeToDeleteRow from "@/components/swipeable/SwipeToDeleteRow";
import SlideToDelete from "@/components/swipeable/SlideToDelete";
import { useScaleAnimation } from "@/utils/animation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const _AnimatedFavoriteItem = ({
  station,
  onDelete,
}: {
  station: FavoriteStation;
  onDelete: () => void;
}) => {
  const { routes = [] } = station;

  return (
    <SwipeToDeleteRow onDelete={onDelete}>
      <Animated.View className="ml-4 border-b border-zinc-100 dark:border-zinc-900 py-4 px-2">
        <View className="flex flex-row items-center justify-between">
          <Text className="text-xl font-medium dark:text-zinc-300">
            {station.name}
          </Text>
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
                  <Text className={`${text} text-sm font-semibold`}>{r}</Text>
                </View>
              );
            })}
          </View>
        )}
      </Animated.View>
    </SwipeToDeleteRow>
  );
};

const getEnabledOpacityClass = (
  route: string,
  enabled: FavoriteStationSettings
) => {
  const { northbound = {}, southbound = {} } = enabled;

  const isNorthboundEnabled = northbound[route];
  const isSouthboundEnabled = southbound[route];

  if (isNorthboundEnabled && isSouthboundEnabled) {
    return "opacity-100";
  } else if (isNorthboundEnabled || isSouthboundEnabled) {
    return "opacity-80";
  } else {
    return "opacity-40";
  }
};

const FavoriteItem = ({
  station,
  onPress,
}: {
  station: FavoriteStation;
  onPress: (e: GestureResponderEvent) => void;
}) => {
  const { routes = [], enabled = EMPTY_SETTINGS } = station;
  const [animatedStyle, { onPressIn, onPressOut }] = useScaleAnimation({
    range: [1, 0.97],
  });

  return (
    <Pressable
      className="ml-4 border-b border-zinc-100 dark:border-zinc-900 py-4 px-2"
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
    >
      <Animated.View style={[animatedStyle]}>
        <View className="flex flex-row items-center justify-between">
          <Text className="text-xl font-medium dark:text-zinc-300">
            {station.name}
          </Text>
        </View>
        {routes.length > 0 ? (
          <View className="mt-1 flex flex-row items-center gap-1">
            {routes.map((r) => {
              const [bg, text] = getColorByRoute(r);
              const opacity = getEnabledOpacityClass(r, enabled);

              return (
                <View
                  key={r}
                  className={cn(
                    `rounded-full items-center justify-center h-8 w-8`,
                    bg,
                    opacity
                  )}
                >
                  <Text className={cn(`text-sm font-semibold`, text)}>{r}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          // FIXME: sometimes no routes are found
          <View className="mt-1 flex flex-row items-center gap-1">
            <View
              className={`rounded-full items-center bg-zinc-300 dark:bg-zinc-700 justify-center h-8 w-8`}
            >
              <Text
                className={`text-sm font-semibold text-zinc-100 dark:text-zinc-300`}
              >
                !
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const SearchResultItem = ({
  station,
  onPress,
}: {
  station: StationSchedule;
  onPress: () => void;
}) => {
  return (
    <Pressable
      className="border-b border-zinc-100 dark:border-zinc-900 py-3 px-2"
      onPress={onPress}
    >
      <View className="flex flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-medium mb-1 dark:text-zinc-300">
            {station.name}
          </Text>
          <View className="flex flex-row items-center gap-0.5">
            {station.routes.map((r) => {
              const [bg, text] = getColorByRoute(r);
              return (
                <View
                  key={r}
                  className={`${bg} rounded-full items-center justify-center h-6 w-6`}
                >
                  <Text className={`${text} text-sm font-semibold`}>{r}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="px-2">
          <Ionicons name="add" size={24} color={colors.zinc[300]} />
        </View>
      </View>
    </Pressable>
  );
};

export default function SettingsScreen() {
  const { favorites = [], set } = useFavorites();
  const [query, setQuery] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const colorScheme = useColorScheme();
  const {
    data: searchResults = [],
    isLoading: isLoadingSearchResults,
    error: searchError,
  } = useStationsByQuery(searchQuery, {
    placeholderData: keepPreviousData,
  });
  const [, cancel] = useDebounce(() => setSearchQuery(query.trim()), 800, [
    query,
  ]);

  const favoritesById = React.useMemo(() => {
    return favorites.reduce((acc, record) => {
      return { ...acc, [record.id]: record };
    }, {} as Record<string, FavoriteStation>);
  }, [favorites]);

  const results = searchResults.filter((r) => !favoritesById[r.id]);

  const toggle = async (route: FavoriteStation) => {
    const isFavorited = !!favoritesById[route.id];

    if (isFavorited) {
      // Remove
      await set(favorites.filter((favorite) => favorite.id !== route.id));
    } else {
      // Add (TODO: ensure no duplicates... maybe instead of array we use object)
      await set(favorites.concat(route));
    }
  };

  const handleAddFavorite = async (station: StationSchedule) => {
    const { id, name, routes, location } = station;

    if (favorites.some((r) => r.id === id)) {
      return;
    }

    const enabled = routes.reduce((acc, r) => {
      return { ...acc, [r]: true };
    }, {});

    await set(
      favorites.concat({
        id,
        name,
        routes,
        location,
        active: true,
        enabled: {
          northbound: enabled,
          southbound: enabled,
        },
      })
    );
  };

  const handleSearchStations = () => {
    console.log("Searching!", query);

    setSearchQuery(query.trim());
  };

  return (
    <SafeKeyboardAwareScrollView
      className="bg-white dark:bg-zinc-950"
      keyboardOpeningTime={0}
      extraScrollHeight={80}
    >
      <View className="mt-12 mb-4 flex flex-row justify-between items-center">
        <Text className="font-bold mx-4 text-zinc-900 dark:text-zinc-100 text-4xl">
          Favorites
        </Text>
        <Pressable
          className="px-4"
          onPress={() => router.push(`/modals/ranking`)}
        >
          <Ionicons
            name="ellipsis-vertical"
            color={colorScheme === "dark" ? colors.zinc[300] : colors.zinc[700]}
            size={20}
          />
        </Pressable>
      </View>

      <View className="">
        <View className="ml-4 h-px border-t border-zinc-100 dark:border-zinc-900"></View>
        {favorites.length === 0 && (
          <View className="p-8 justify-center items-center">
            <Text className="text-zinc-500 dark:text-zinc-400 text-base">
              No stations have been favorited.
            </Text>
          </View>
        )}
        {favorites.map((station) => {
          return (
            <SlideToDelete
              key={station.id}
              // TODO: is there a clean way to avoid hardcoding this???
              // FIXME: this is broken when routes are missing!
              initialHeight={84}
              // TODO: rename?
              onDelete={() => toggle(station)}
            >
              {(isPanning) => {
                // console.log({ isPanning })
                return (
                  <FavoriteItem
                    station={station}
                    onPress={(e) => {
                      // console.log("Pressed!");
                      if (isPanning) {
                        e.preventDefault();
                      } else {
                        router.push(`/modals/settings/${station.id}`);
                      }
                    }}
                  />
                );
              }}
            </SlideToDelete>
          );
        })}
      </View>

      <View className="mt-12 px-4">
        <View>
          <Text className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-200">
            Search stations
          </Text>
        </View>
        {/* TODO: figure out how search inputs look in ios apps */}
        <View className="flex flex-row gap-2 relative items-center">
          <TextInput
            className="border bg-zinc-100 dark:bg-zinc-800 rounded-xl flex-1 border-zinc-100 dark:border-zinc-700 p-3 dark:text-zinc-100"
            placeholder="Search for a station..."
            value={query}
            onChangeText={(text) => setQuery(text)}
          />
          <Pressable
            className="bg-white hidden border border-zinc-100 dark:border-zinc-900 absolute right-1.5 rounded-xl py-2 px-2"
            onPress={handleSearchStations}
          >
            <Ionicons name="search" color={colors.zinc[700]} size={16} />
          </Pressable>
        </View>
      </View>

      <View className="ml-4 mt-4 border-t border-zinc-100 dark:border-zinc-900">
        {results.map((station) => {
          return (
            <SearchResultItem
              key={station.id}
              station={station}
              onPress={() => handleAddFavorite(station)}
            />
          );
        })}
        {!!searchQuery && results.length === 0 && (
          <View className="p-8 justify-center items-center">
            <Text className="text-zinc-500 text-base">No stations found.</Text>
          </View>
        )}
        {isLoadingSearchResults && (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator />
          </View>
        )}
      </View>
    </SafeKeyboardAwareScrollView>
  );
}
