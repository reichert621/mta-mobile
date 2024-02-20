import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "tailwindcss/colors";

import {
  EMPTY_SETTINGS,
  FavoriteStationSettings,
  cn,
  getColorByRoute,
} from "@/utils";
import { useStationById } from "@/utils/api";
import { useFavorites } from "@/utils/context";

const directions = {
  N: "Northbound",
  S: "Southbound",
};

const RouteIcon = ({
  className,
  route,
  size,
}: {
  className?: string;
  route: string;
  size: "sm" | "default" | "lg";
}) => {
  const [bg, text] = getColorByRoute(route);
  const bgSize =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-10 w-10" : "h-9 w-9";
  const textSize = size === "lg" ? "text-base" : "text-sm";

  return (
    <View
      className={cn(
        `items-center justify-center rounded-full`,
        bg,
        bgSize,
        className
      )}
    >
      <Text className={cn(`font-bold`, text, textSize)}>{route}</Text>
    </View>
  );
};

export default function RouteModal() {
  const isPresented = router.canGoBack();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [enabled, setEnabledRoutes] =
    React.useState<FavoriteStationSettings>(EMPTY_SETTINGS);

  const id = params.id as string;

  // TODO: include route selection in favorites
  const { favorites, isLoading: isLoadingFavorites, update } = useFavorites();
  const {
    data: station,
    isLoading,
    error,
    isRefetching,
  } = useStationById(id, {
    refetchInterval: 10000,
  });

  const favorite = favorites.find((f) => f.id === id);
  console.log("Current favorite:", favorite);

  React.useEffect(() => {
    if (favorite) {
      setEnabledRoutes(favorite.enabled || EMPTY_SETTINGS);
    }
  }, [favorite]);

  if (isLoading || isLoadingFavorites || !station || !favorite) {
    return null;
  }

  const { routes = [] } = station;

  // TODO: implement actually storing this!
  const handleToggleRoute = async (
    route: string,
    direction: "northbound" | "southbound"
  ) => {
    const isCurrentlyEnabled = enabled[direction][route];

    try {
      if (!favorite) {
        throw new Error("Invalid favorite");
      }

      setEnabledRoutes({
        ...enabled,
        [direction]: { ...enabled[direction], [route]: !isCurrentlyEnabled },
      });

      const settings = favorite.enabled || EMPTY_SETTINGS;
      const current = settings[direction];
      const updates = { ...current, [route]: !current[route] };
      console.log({ favorite, current, updates });

      await update(id, {
        enabled: { ...settings, [direction]: updates },
      });
    } catch (e) {
      console.error("Failed to update route settings!", e);
      // Reset optimistic update
      setEnabledRoutes({
        ...enabled,
        [direction]: { ...enabled[direction], [route]: isCurrentlyEnabled },
      });
    }
  };

  return (
    <ScrollView className="bg-white dark:bg-zinc-950">
      <View className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-900">
        <Link href="../">
          <Text className="text-blue-500 font-medium">Close</Text>
        </Link>
      </View>
      <Animated.View key={station.id} className="mb-6 px-4" entering={FadeIn}>
        <View className="mb-4 flex-row justify-between items-baseline">
          <Text className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-200">
            {station.name}
          </Text>
        </View>

        <View className="mb-8">
          <View className="mb-2">
            <Text className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
              Northbound
            </Text>
          </View>
          <View className="gap-1">
            {routes
              .sort((a, b) => a.localeCompare(b))
              .map((route, key) => {
                const isEnabled = enabled.northbound[route];
                // const isEnabled = favorite?.enabled?.northbound[route];

                return (
                  <View
                    key={key}
                    className="flex px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex-row items-center justify-between"
                  >
                    <View className="flex flex-row items-center gap-4">
                      <RouteIcon
                        className={isEnabled ? "" : "opacity-60"}
                        size="lg"
                        route={route}
                      />
                      <Text
                        className={
                          isEnabled
                            ? "text-zinc-700 dark:text-zinc-300 font-medium"
                            : "text-zinc-400"
                        }
                      >
                        {isEnabled ? "Enabled" : "Disabled"}
                      </Text>
                    </View>
                    <Switch
                      className="scale-90"
                      trackColor={{ true: colors.blue[500] }}
                      value={isEnabled}
                      onValueChange={() =>
                        handleToggleRoute(route, "northbound")
                      }
                    />
                  </View>
                );
              })}
          </View>
        </View>
        <View className="mb-8">
          <View className="mb-2">
            <Text className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
              Southbound
            </Text>
          </View>
          <View className="gap-1">
            {routes
              .sort((a, b) => a.localeCompare(b))
              .map((route, key) => {
                const isEnabled = enabled.southbound[route];
                // const isEnabled = favorite?.enabled?.southbound[route];

                return (
                  <View
                    key={key}
                    className="flex px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex-row items-center justify-between"
                  >
                    <View className="flex flex-row items-center gap-4">
                      <RouteIcon
                        className={isEnabled ? "" : "opacity-60"}
                        size="lg"
                        route={route}
                      />
                      <Text
                        className={
                          isEnabled
                            ? "text-zinc-700 dark:text-zinc-300 font-medium"
                            : "text-zinc-400"
                        }
                      >
                        {isEnabled ? "Enabled" : "Disabled"}
                      </Text>
                    </View>
                    <Switch
                      className="scale-90"
                      trackColor={{ true: colors.blue[500] }}
                      value={isEnabled}
                      onValueChange={() =>
                        handleToggleRoute(route, "southbound")
                      }
                    />
                  </View>
                );
              })}
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
