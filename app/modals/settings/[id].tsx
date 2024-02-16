import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "tailwindcss/colors";

import { SafeScrollView, SafeView } from "@/components/SafeView";
import ScheduleItem from "@/components/ScheduleItem";
import { cn, getColorByRoute } from "@/utils";
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

type EnabledRoutes = {
  northbound: Record<string, boolean>;
  southbound: Record<string, boolean>;
};
const empty: EnabledRoutes = { northbound: {}, southbound: {} };

export default function RouteModal() {
  const isPresented = router.canGoBack();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [enabled, setEnabledRoutes] = React.useState<EnabledRoutes>(empty);

  const id = params.id as string;

  // TODO: include route selection in favorites
  const { favorites } = useFavorites();
  const {
    data: station,
    isLoading,
    error,
    isRefetching,
  } = useStationById(id, {
    refetchInterval: 10000,
  });

  if (isLoading || !station) {
    return null;
  }

  const { routes = [] } = station;

  // TODO: implement actually storing this!
  const handleToggleRoute = (
    route: string,
    direction: "northbound" | "southbound"
  ) => {
    setEnabledRoutes((current) => {
      const isCurrentlyEnabled = current[direction][route];

      return {
        ...current,
        [direction]: { ...current[direction], [route]: !isCurrentlyEnabled },
      };
    });
  };

  return (
    <ScrollView className="bg-white dark:bg-zinc-950">
      <View className="mb-8 p-4 bg-zinc-100">
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

                return (
                  <View
                    key={key}
                    className="flex px-2 py-1.5 rounded-lg bg-zinc-50 flex-row items-center justify-between"
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
                            ? "text-zinc-700 font-medium"
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

                return (
                  <View
                    key={key}
                    className="flex px-2 py-1.5 rounded-lg bg-zinc-50 flex-row items-center justify-between"
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
                            ? "text-zinc-700 font-medium"
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
