import { useStationById } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "tailwindcss/colors";

import { SafeScrollView, SafeView } from "@/components/SafeView";
import ScheduleItem from "@/components/ScheduleItem";

const directions = {
  N: "Northbound",
  S: "Southbound",
};

export default function RouteModal() {
  const isPresented = router.canGoBack();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const id = params.id as string;
  const route = params.route as string;
  const direction = params.direction as "N" | "S";

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

  const times = (station[direction] || []).filter((t) => t.route === route);

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

          <Text className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
            {directions[direction]}
          </Text>
        </View>
        {times.map(({ route, time }, key) => {
          return (
            <ScheduleItem
              key={key}
              className={isRefetching ? "opacity-80" : "opacity-100"}
              route={route}
              time={time}
            />
          );
        })}

        <View className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 gap-2">
          <Pressable
            className="flex flex-row gap-2 items-center justify-center border border-zinc-700 bg-zinc-800 rounded px-4 py-3"
            onPress={() => alert("Coming soon!")}
          >
            <Ionicons name="flash" size={16} color={colors.zinc[100]} />
            <Text className="text-zinc-100 font-medium">
              Start live activity
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
