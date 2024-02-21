import React from "react";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import colors from "tailwindcss/colors";

import { useFavorites } from "@/utils/context";
import { FavoriteStation, cn } from "@/utils";

function SortableFavorites({
  favorites,
  onUpdate,
}: {
  favorites: FavoriteStation[];
  onUpdate: (favorites: FavoriteStation[]) => Promise<void>;
}) {
  const cacheKey = favorites.map((s) => s.id).join(",");
  const [cached, setCachedFavorites] =
    React.useState<FavoriteStation[]>(favorites);

  React.useEffect(() => {
    setCachedFavorites(favorites);
  }, [cacheKey]);

  const handleUpdateOrder = async (stations: FavoriteStation[]) => {
    setCachedFavorites(
      stations.map((s, i) => {
        return { ...s, rank: i + 1 };
      })
    );

    return onUpdate(stations);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    return (
      <ScaleDecorator activeScale={1.025}>
        <Pressable
          delayLongPress={200}
          onLongPress={drag}
          disabled={isActive}
          className={cn(
            "flex flex-row items-center gap-2 px-4 mx-4 py-4 rounded mb-1",
            isActive
              ? "bg-zinc-200 dark:bg-zinc-800"
              : "bg-zinc-100 dark:bg-zinc-900"
          )}
        >
          <Ionicons
            name="ellipsis-vertical-outline"
            color={colors.zinc[500]}
            size={20}
          />
          <Text className="text-zinc-900 dark:text-zinc-100 font-bold text-xl">
            {item.name}
          </Text>
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <DraggableFlatList
      data={cached}
      onDragEnd={({ data, ...rest }) => handleUpdateOrder(data)}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
}

export default function RankingModal() {
  const isPresented = router.canGoBack();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { favorites = [], set, clear } = useFavorites();

  const handleUpdateFavorites = async (updated: FavoriteStation[]) => {
    try {
      await set(
        updated.map((station, index) => {
          return { ...station, rank: index + 1 };
        })
      );
      console.log("Successfully updated rankings!");
    } catch (err) {
      console.error("Failed to update!", err);
    }
  };

  const handleResetFavorites = async () => {
    try {
      await clear();
      alert("Your favorites have been reset to the defaults.");
    } catch (e) {
      console.error("Failed to reset favorites:", e);
    }
  };

  return (
    <View className="bg-white flex-1 dark:bg-zinc-950">
      <View className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-900">
        <Link href="../">
          <Text className="text-blue-500 font-medium">Close</Text>
        </Link>
      </View>
      <Animated.View className="mb-6" entering={FadeIn}>
        <View className="mb-4 px-4">
          <Text className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-200">
            Favorites ranking
          </Text>
          <Text className="font-medium text-zinc-500 text-lg">
            Drag and drop to order by preference.
          </Text>
        </View>

        {favorites.length > 0 && (
          <SortableFavorites
            favorites={favorites}
            onUpdate={handleUpdateFavorites}
          />
        )}
      </Animated.View>
      <View
        className="px-4 mb-8 justify-end flex-1"
        style={{ paddingBottom: insets.bottom }}
      >
        <Pressable
          className="flex flex-row gap-2 items-center justify-center border border-red-500 dark:border-red-700 dark:bg-red-800/80 rounded px-4 py-3"
          onPress={handleResetFavorites}
        >
          <Ionicons
            name="trash"
            color={colorScheme === "dark" ? colors.red[200] : colors.red[500]}
            size={16}
          />
          <Text className="text-red-500 dark:text-red-100 font-medium">
            Reset favorites
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
